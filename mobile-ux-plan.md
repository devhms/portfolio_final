# Mobile Terminal UX/UI — 2026 Full Implementation Spec
## `TerminalEmulator.tsx` — Complete Fix Architecture

---

## Executive Summary

The original plan identified 5 bugs. The 2026 research spec reveals **8 distinct failure layers**, each requiring a separate architectural solution. No single fix is sufficient alone — these layers interact, and skipping one will leave a visible regression in at least one target environment.

---

## Root Cause Map

| # | Bug | Root Cause | Wrong Fix | Correct 2026 Fix |
|---|-----|-----------|-----------|-----------------|
| 1 | iOS auto-zoom on tap | Computed `font-size < 16px` on focused input | `user-scalable=no` (breaks WCAG 1.4.4, blocked by browsers) | `font-size: 16px` on hidden input |
| 2 | Keyboard overlaps terminal on Android | Chrome 108+ / Firefox 132 align with Safari: only Visual Viewport shrinks on keyboard open. Layout Viewport stays full-height behind keyboard | JS `innerHeight` observers (main-thread blocking, memory leaks) | `interactiveWidget: 'resizes-content'` in `layout.tsx` viewport export |
| 3 | Terminal doesn't resize with keyboard on iOS | iOS Safari never resized the Layout Viewport — that's by design | JS height recalculation loops | `calc(100dvh - 12rem)` CSS unit — dvh recalculates per-frame |
| 4 | Scroll gesture opens keyboard | `onClick` handler fires on swipe because browser synthesizes `click` from `touchend` | `pointer-events: none` on output (breaks interaction) | Time-Delta Discriminator: 8px / 250ms threshold |
| 5 | Command prompt hidden during keyboard animation | `scrollIntoView()` fires indiscriminately, up to 60x/sec during keyboard slide | `setTimeout` hacks (fires between paints, misses frames) | `cancelAnimationFrame` + `requestAnimationFrame` debounce on `visualViewport` resize |
| 6 | Layout stuck ~24px off after keyboard dismiss | **iOS 26 Liquid Glass regression**: `visualViewport.offsetTop` doesn't reset to 0 after keyboard dismissal. New in iOS 26.0, persists in 26.3.1 | None — needs active workaround | `focusout` listener → 100ms delay → `scrollBy(0,-1)/scrollBy(0,1)` nudge |
| 7 | Screen readers silent on terminal output | ARIA live region injected dynamically — VoiceOver / TalkBack ignore live regions added after mount | Adding `aria-live` at notification time | `aria-live="assertive" aria-atomic="true"` pre-mounted in initial render |
| 8 | Scroll jumps when stdout appends above viewport | DOM mutation above user's scroll position shifts visible content down | Manual scroll position tracking | `overflow-anchor: auto` (native browser, zero JS) |

---

## Implementation Layers (Ordered by Priority)

### Layer 0 — `app/layout.tsx` Viewport Export
**Files:** `layout-viewport.ts` (merge into your `app/layout.tsx`)
**Cost:** Zero runtime cost. Static HTML shell generation.

```typescript
import type { Viewport } from "next";

export const viewport: Viewport = {
  width:             "device-width",
  initialScale:      1,
  maximumScale:      1,              // iOS zoom prevention (WCAG-safe)
  interactiveWidget: "resizes-content", // Chrome Android shrink-to-fit
};
```

**Critical note on `user-scalable`:**
The European Accessibility Act (enforced June 2025) and US ADA Title II (deadline April 2026) make `user-scalable=no` a legal liability. It violates WCAG 1.4.4. Google Lighthouse CI flags it as a critical failure. `maximumScale: 1` achieves the same zoom-suppression effect while preserving manual pinch-to-zoom — the WCAG-compliant alternative.

**Critical note on `interactiveWidget`:**
Apple has not implemented this property in WebKit as of iOS 26.3.1. iOS behaviour is handled entirely by `dvh` units and the `visualViewport` listener. `interactiveWidget` only targets Chrome Android v108+, where it is the only reliable solution.

---

### Layer 1 — DVH Height (CSS, Zero JS)

```css
/* vh fallback (iOS < 16, pre-dvh environments) */
height: calc(100vh - 12rem);

/* dvh override — applied via .term-root class (cascades over inline style) */
height: calc(100dvh - 12rem) !important;

min-height: 350px;
max-height: 520px;
```

**Why dvh beats `visualViewport` JS observers:**
The August 2025 Sparka.ai update explicitly **removed** their `ResizeObserver` + `visualViewport` height logic after telemetry confirmed `dvh` was cleaner, eliminated main-thread congestion, and handled physical keyboard detection automatically. If an input gains focus but `window.visualViewport.height` doesn't shrink, a physical Bluetooth keyboard is in use — `dvh` handles this transparently without inference logic.

---

### Layer 2 — Hidden Input Configuration

```tsx
<input
  // font-size: 16px — iOS Safari zooms when computed font-size < 16px.
  // transform:scale(0) hides visually. Computed font-size stays at 16px.
  // THIS IS THE MOST CRITICAL LINE IN THE COMPONENT.
  style={{ fontSize: "16px", transform: "scale(0)" }}
  
  autoCapitalize="none"  // WHATWG canonical. "off" is inconsistently interpreted.
  autoComplete="off"     // No password manager or autocomplete dropdowns
  autoCorrect="off"      // No 'docker Build' from 'docker build'
  spellCheck={false}     // No red squiggles bleeding through the DOM
  inputMode="text"       // Full alphanumeric keyboard on iPadOS/Samsung DeX/OEM Android
  tabIndex={-1}          // Remove from tab order — desktop users focus via container
  aria-hidden="true"     // Screen readers use the live region, not this raw input
/>
```

---

### Layer 3 — Time-Delta Tap/Scroll Discriminator

```tsx
// CSS: touch-action: pan-y — compositor handles clean swipes, fires pointercancel
// JS: Time-Delta Discriminator handles "sloppy taps" below native scroll threshold

const SWIPE_THRESHOLD_PX = 8;   // Euclidean Y-drift cap
const SWIPE_DURATION_MS  = 250; // Contact duration cap

const onTouchStart = (e: React.TouchEvent) => {
  touchStartRef.current = { y: e.touches[0].clientY, time: Date.now() };
};

const onTouchEnd = (e: React.TouchEvent) => {
  const { y, time } = touchStartRef.current!;
  const isTap = Math.abs(e.changedTouches[0].clientY - y) < SWIPE_THRESHOLD_PX
             && Date.now() - time < SWIPE_DURATION_MS;
  
  if (isTap) {
    e.preventDefault(); // Kills the 300ms ghost-click delay
    inputRef.current?.focus();
  }
};
```

**Why not Pointer Events Level 4?**
Safari/WebKit has not implemented `persistentDeviceId` as of iOS 26.3.1. Touch Events remain the reliable cross-browser foundation.

**Why separate `onDesktopClick`?**
Touch devices fire both `onTouchEnd` AND a synthesized `click` event. Checking `window.matchMedia("(pointer: coarse)")` distinguishes mouse (fine) from touch (coarse), preventing double-focus calls.

---

### Layer 4 — rAF-Debounced `visualViewport` Auto-Scroll

```tsx
useEffect(() => {
  const vv = window.visualViewport;
  if (!vv) return;

  const onVVResize = () => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  };

  vv.addEventListener("resize", onVVResize);
  return () => { vv.removeEventListener("resize", onVVResize); cancelAnimationFrame(rafRef.current); };
}, []);
```

**Why `requestAnimationFrame` not `setTimeout`?**
During keyboard animation, `visualViewport` fires up to 60 resize events/sec. `setTimeout` fires blindly between screen paints, causes layout thrashing and dropped frames. `rAF` synchronises with the browser's rendering pipeline — the scroll aligns with the display's exact refresh cadence.

**Why `block: 'nearest'`?**
`block: 'end'` aggressively repositions elements to the bottom of the screen, causing jarring jumps if the prompt is already partially visible. `'nearest'` is a no-op if the element is already in view.

---

### Layer 5 — iOS 26 Liquid Glass `offsetTop` Regression Guard

```tsx
useEffect(() => {
  const onFocusOut = () => {
    setTimeout(() => {
      const vv = window.visualViewport;
      if (vv && vv.offsetTop > 0) {
        window.scrollBy(0, -1);
        window.scrollBy(0, 1);
      }
    }, 100); // Wait for keyboard dismiss animation to complete
  };
  
  inputRef.current?.addEventListener("focusout", onFocusOut);
}, []);
```

**The iOS 26 Liquid Glass bug:**
Apple's "Liquid Glass" redesign introduced floating toolbars with translucent blur. After keyboard dismissal, `visualViewport.offsetTop` gets stuck at ~24px (corresponding to the safe area inset) instead of resetting to 0. `position: fixed` elements drift upward. The micro-scroll nudge forces WebKit to flush its internal viewport coordinate matrix. Documented in: Zulip issue #37365, Stack Overflow iOS-26-Safari-visualViewport thread.

---

### Layer 6 — CSS Touch Suppression Matrix

```css
.term-root {
  touch-action: pan-y;                    /* Compositor owns scroll; JS owns taps */
  -webkit-tap-highlight-color: transparent; /* No OS flash on dark terminal */
  overscroll-behavior: contain;           /* No pull-to-refresh or scroll chaining */
  -webkit-overflow-scrolling: touch;      /* Momentum scrolling on iOS */
  -webkit-user-select: none;              /* No OS magnifier on long-press */
  user-select: none;
}

/* Re-enable text selection on output lines only */
.term-line {
  -webkit-user-select: text;
  user-select: text;
}
```

---

### Layer 7 — ARIA Live Region (Pre-Mounted)

```tsx
// Must exist in the INITIAL render — not injected dynamically.
// VoiceOver/TalkBack parse the accessibility tree on mount.
// Dynamically added live regions are silently ignored.

<div
  aria-live="assertive"  // Interrupt screen reader immediately (CLI feedback parity)
  aria-atomic="true"     // Read full output as one utterance, not char-by-char
  aria-label="Terminal output"
  style={{ /* sr-only pattern — visually hidden, in a11y tree */ }}
>
  {ariaText}
</div>
```

**xterm.js-style flush pattern:**
Wipe `ariaText` to `""` first, then refill in `requestAnimationFrame`. This ensures identical successive outputs trigger a fresh announcement (VoiceOver won't re-read unchanged content).

---

### Layer 8 — `overflow-anchor: auto`

Native browser feature. When stdout appends content above the user's scroll position, the browser keeps the visible anchor node stationary instead of pushing the viewport down. Declared explicitly on the output container for intent clarity.

---

## Verification Matrix (10 Tests)

| ID | Scenario | Pass Criteria | Target |
|----|---------|--------------|--------|
| V-01 | Tap to focus | Keyboard opens, NO zoom animation | iOS Safari (device + Simulator) |
| V-02 | Scroll interference | Swipe scrolls output; keyboard does NOT open | iOS Safari, Android Chrome |
| V-03 | Android shrink-to-fit | Terminal shrinks above keyboard, no overlap | Chrome Android v108+ |
| V-04 | Viewport frame alignment | Prompt scrolls into view with keyboard animation, no stutter | All mobile |
| V-05 | iOS 26 offset regression | No 24px dead zone after keyboard dismiss | iOS 26.0, 26.3.1 (WKWebView + Safari) |
| V-06 | Desktop parity | Click-to-focus works, no ghost delays | Chrome/Firefox/Safari macOS |
| V-07 | OS AI suppression | Typed command is lowercase, no autocomplete | iOS Safari, Android Chrome |
| V-08 | Landscape reflow | dvh recalculates correctly in landscape | All mobile |
| V-09 | WCAG 1.4.4 | Lighthouse CI: no `user-scalable=no` flag | Chrome DevTools Lighthouse |
| V-10 | Screen reader output | Command execution triggers VoiceOver/TalkBack announcement | iOS VoiceOver, Android TalkBack |

---

## Files Delivered

| File | Purpose |
|------|---------|
| `TerminalEmulator.tsx` | Drop-in component — all 8 layers implemented and annotated |
| `layout-viewport.ts` | `viewport` export snippet — merge into `app/layout.tsx` |
| `mobile-ux-plan.md` | This document |
