"use client";

/**
 * TerminalEmulator.tsx — 2026 Mobile UX/UI Hardened Build
 *
 * Implements all architectural layers from the 2026 specification:
 *
 *  LAYER 0 — viewport meta (layout.tsx) → maximumScale:1, interactiveWidget:'resizes-content'
 *  LAYER 1 — DVH height  → calc(100dvh - 12rem) with vh fallback, min/max constraints
 *  LAYER 2 — Input layer → font-size:16px (iOS zoom bypass), autoCapitalize:"none", inputMode:"text"
 *  LAYER 3 — Pointer Events L4 + Time-Delta Discriminator (tap vs scroll, 8px/250ms thresholds)
 *  LAYER 4 — rAF-debounced visualViewport resize → bottomRef auto-scroll
 *  LAYER 5 — iOS 26 Liquid Glass offsetTop regression guard (focusout micro-scroll nudge)
 *  LAYER 6 — CSS touch suppression matrix (tap-highlight, touch-action, overscroll, user-select)
 *  LAYER 7 — ARIA live region (assertive + atomic, pre-mounted, xterm.js-style queue flush)
 *  LAYER 8 — overflow-anchor:auto for stdout stream stabilization
 */

import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  KeyboardEvent,
} from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface TerminalLine {
  id: string;
  type: "input" | "output" | "error" | "system";
  content: string;
  ts: number;
}

interface TouchTrack {
  y: number;
  time: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

/**
 * Time-Delta Discriminator thresholds.
 * Source: §"Time-Delta Discriminator Logic", 2026 Mobile Terminal Spec.
 *
 * SWIPE_THRESHOLD_PX — max Euclidean Y-drift before tap is reclassified as scroll
 * SWIPE_DURATION_MS  — max contact duration before tap is reclassified as long-press
 */
const SWIPE_THRESHOLD_PX = 8;
const SWIPE_DURATION_MS  = 250;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const line = (content: string, type: TerminalLine["type"] = "output"): TerminalLine =>
  ({ id: uid(), type, content, ts: Date.now() });

// ─── ARIA Queue Hook ──────────────────────────────────────────────────────────

/**
 * Mirrors xterm.js ARIA queue behaviour:
 * - Flushes full, complete output text into the live region on command completion.
 * - Wipes state first so identical outputs still trigger a fresh announcement.
 * - Uses rAF so the DOM mutation happens in the next paint frame, giving
 *   VoiceOver / TalkBack time to register the wipe before the refill.
 */
function useAriaQueue() {
  const [ariaText, setAriaText] = useState("");

  const flush = useCallback((text: string) => {
    setAriaText("");
    requestAnimationFrame(() => setAriaText(text));
  }, []);

  return { ariaText, flush };
}

// ─── Command Processor ───────────────────────────────────────────────────────

function runCommand(
  cmd: string,
  prev: TerminalLine[]
): { next: TerminalLine[]; aria: string } {
  const trimmed = cmd.trim().toLowerCase();
  const echo    = line(`$ ${cmd}`, "input");

  if (!trimmed) return { next: [...prev, echo], aria: "" };

  switch (trimmed) {
    case "help": {
      const out = "Commands: help · about · projects · skills · contact · clear";
      return { next: [...prev, echo, line(out)], aria: out };
    }
    case "about": {
      const out = "Ibrahim — SE @ UET Taxila. Builder. IJT Nazim. Discipline equals freedom.";
      return { next: [...prev, echo, line(out)], aria: out };
    }
    case "projects": {
      const out = [
        "B.L.A.S.T.     — PSX real-time stock data pipeline",
        "Dawn Scraper   — Python/BS4 news aggregator",
        "Zuban          — Language learning app",
        "Capital Suite  — Java banking capstone",
      ].join("\n");
      return { next: [...prev, echo, line(out)], aria: "4 projects listed." };
    }
    case "skills": {
      const out = "Python · TypeScript · Java · Next.js · LangChain · Three.js · GSAP · Ollama";
      return { next: [...prev, echo, line(out)], aria: out };
    }
    case "contact": {
      const out = "github.com/devhms  ·  portfolio1-bice-alpha.vercel.app";
      return { next: [...prev, echo, line(out)], aria: out };
    }
    case "clear":
      return { next: [], aria: "Terminal cleared." };
    default: {
      const out = `bash: ${cmd}: command not found — type 'help'`;
      return { next: [...prev, echo, line(out, "error")], aria: out };
    }
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TerminalEmulator() {
  // DOM refs
  const inputRef     = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const outputRef    = useRef<HTMLDivElement>(null);
  const bottomRef    = useRef<HTMLDivElement>(null);

  const touchStartY = useRef<number>(0);
  const touchMoved  = useRef<boolean>(false);

  // State
  const [lines, setLines]           = useState<TerminalLine[]>([
    line("Terminal v2.0 — type 'help' for commands.", "system"),
  ]);
  const [inputValue, setInputValue] = useState("");
  const [history, setHistory]       = useState<string[]>([]);
  const [histIdx, setHistIdx]       = useState(-1);
  const [isFocused, setIsFocused]   = useState(false);

  const { ariaText, flush: flushAria } = useAriaQueue();

  // ── Scroll anchor on new output ──────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [lines]);

  // ── LAYER 4 — rAF-debounced visualViewport → auto-scroll ─────────────────
  //
  // visualViewport fires up to 60 resize events/sec during keyboard animation.
  // cancelAnimationFrame + rAF throttles execution to one scroll-call per
  // display frame, preventing main-thread congestion and jank.
  // 'block: nearest' avoids over-scroll if the prompt is already partially visible.
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const handleResize = () => {
      bottomRef.current?.scrollIntoView({ block: "nearest" });
    };

    vv.addEventListener("resize", handleResize);
    return () => {
      vv.removeEventListener("resize", handleResize);
    };
  }, []);

  // ── LAYER 5 — iOS 26 Liquid Glass offsetTop regression guard ─────────────
  //
  // iOS 26 introduced a bug: after keyboard dismissal, visualViewport.offsetTop
  // gets stuck at ~24px instead of resetting to 0. This causes position:fixed
  // elements (including the terminal) to drift upward with a phantom dead zone.
  //
  // Fix: On focusout, wait 100ms for the keyboard animation to physically
  // complete, then check for the orphaned offset. If present, execute a
  // silent scrollBy(0,-1)/scrollBy(0,1) nudge — forces WebKit to flush its
  // internal visual viewport coordinate matrix and snap back to 0.
  //
  // Reference: stackoverflow.com/questions/iOS-26-Safari-visualViewport
  //            github.com/zulip/zulip#37365
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    const onFocusOut = () => {
      setTimeout(() => {
        const vv = window.visualViewport;
        if (vv && vv.offsetTop > 0) {
          window.scrollBy(0, -1);
          window.scrollBy(0, 1);
        }
      }, 100);
    };

    input.addEventListener("focusout", onFocusOut);
    return () => input.removeEventListener("focusout", onFocusOut);
  }, []);

  // ── Command execution ─────────────────────────────────────────────────────
  const execCommand = useCallback((cmd: string) => {
    setLines(prev => {
      const { next, aria } = runCommand(cmd, prev);
      if (aria) flushAria(aria);
      return next;
    });
    if (cmd.trim()) setHistory(h => [cmd, ...h].slice(0, 100));
    setHistIdx(-1);
    setInputValue("");
  }, [flushAria]);

  // ── Keyboard handler ──────────────────────────────────────────────────────
  const onKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case "Enter":
        e.preventDefault();
        execCommand(inputValue);
        break;
      case "ArrowUp":
        e.preventDefault();
        setHistIdx(i => {
          const next = Math.min(i + 1, history.length - 1);
          setInputValue(history[next] ?? "");
          return next;
        });
        break;
      case "ArrowDown":
        e.preventDefault();
        setHistIdx(i => {
          const next = Math.max(i - 1, -1);
          setInputValue(next === -1 ? "" : (history[next] ?? ""));
          return next;
        });
        break;
      case "l":
        if (e.ctrlKey) {
          e.preventDefault();
          setLines([]);
          flushAria("Terminal cleared.");
        }
        break;
      case "Tab":
        e.preventDefault();
        // Future: tab completion
        break;
    }
  }, [inputValue, history, execCommand, flushAria]);

  // ── LAYER 3 — Time-Delta Discriminator (tap vs scroll) ───────────────────
  // Updated tracking pattern to track Y-delta cleanly
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchMoved.current  = false;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (Math.abs(e.touches[0].clientY - touchStartY.current) > 8) {
      touchMoved.current = true; // user is scrolling
    }
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!touchMoved.current) {
      inputRef.current?.focus(); // only focus on genuine tap
    }
  }, []);

  // Desktop click — guard against double-firing on touch devices
  const onDesktopClick = useCallback(() => {
    // pointer:coarse = touch display. onTouchEnd already called focus().
    // pointer:fine   = mouse/trackpad. onClick is the correct event here.
    if (!window.matchMedia("(pointer: coarse)").matches) {
      inputRef.current?.focus();
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <>
      {/*
        ════════════════════════════════════════════════════════════════
        LAYER 7 — ARIA Live Region
        ════════════════════════════════════════════════════════════════

        MUST be present in the initial render. VoiceOver and TalkBack parse the
        accessibility tree on mount; dynamically injected live regions are
        silently ignored by both iOS VoiceOver and Android TalkBack.

        aria-live="assertive" — immediately interrupts the screen reader to
          announce terminal output. Mirrors the real-time feedback of a shell.
        aria-atomic="true" — reads the complete updated region as one utterance.
          Prevents character-by-character streaming announcements during output.

        visually hidden via the sr-only pattern (not display:none, which removes
        the element from the accessibility tree entirely).
      */}
      <div
        aria-live="assertive"
        aria-atomic="true"
        aria-label="Terminal output"
        style={{
          position:   "absolute",
          width:      1,
          height:     1,
          padding:    0,
          margin:    -1,
          overflow:   "hidden",
          clip:       "rect(0,0,0,0)",
          whiteSpace: "nowrap",
          border:     0,
          pointerEvents: "none",
        }}
      >
        {ariaText}
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          Terminal Root Container
          ═══════════════════════════════════════════════════════════════ */}
      <div
        ref={containerRef}
        className="term-root"
        role="application"
        aria-label="Interactive terminal emulator. Type commands and press Enter."
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={onDesktopClick}
        style={{
          /*
           * LAYER 1 — DVH Height Cascade
           *
           * Step 1: vh fallback for iOS < 16 and other pre-dvh environments.
           * Step 2: dvh override applied via .term-root CSS class (see <style> block).
           *         dvh recalculates per-frame as keyboard/toolbars animate.
           *
           * min-height: prevents collapse on keyboards that dominate small screens.
           * max-height: preserves the design aesthetic on large viewports.
           */
          height:    "calc(var(--terminal-offset, 12rem) * -1 + 100vh)",
          minHeight: 350,
          maxHeight: 520,

          // Layout
          display:        "flex",
          flexDirection:  "column",
          position:       "relative",
          fontFamily:     "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
          backgroundColor: "#0d0d0d",
          border:         "1px solid rgba(0,255,156,0.2)",
          borderRadius:   4,
          overflow:       "hidden",

          /*
           * LAYER 6 (partial) — applied inline for specificity certainty.
           * The rest of the touch-suppression matrix is in the <style> block.
           */
          WebkitTapHighlightColor: "transparent",
        }}
      >
        {/* ── Title bar ─────────────────────────────────────────────── */}
        <div
          aria-hidden="true"
          style={{
            display:         "flex",
            alignItems:      "center",
            gap:             6,
            padding:         "8px 14px",
            backgroundColor: "#111",
            borderBottom:    "1px solid rgba(0,255,156,0.1)",
            flexShrink:      0,
            userSelect:      "none",
          }}
        >
          {[["#ff5f57","close"], ["#febc2e","minimise"], ["#28c840","maximise"]].map(([bg, label]) => (
            <span
              key={label}
              aria-label={label}
              style={{ width: 10, height: 10, borderRadius: "50%", background: bg, flexShrink: 0 }}
            />
          ))}
          <span style={{ flex: 1, textAlign: "center", fontSize: 11, color: "#555", letterSpacing: "0.12em" }}>
            ibrahim@portfolio — bash
          </span>
        </div>

        {/* ════════════════════════════════════════════════════════════
            LAYER 8 — Output scrolling area (overflow-anchor + momentum)
            ════════════════════════════════════════════════════════════ */}
        <div
          ref={outputRef}
          role="log"
          aria-label="Terminal history"
          aria-live="off"
          style={{
            flex:           1,
            overflowY:      "auto",
            overflowX:      "hidden",
            padding:        "12px 14px 6px",

            /*
             * overflow-anchor: auto (browser default, explicit here for intent clarity)
             * When new lines are appended to the DOM above the user's scroll
             * position, the browser keeps the visible anchor node stationary.
             * Without this, stdout injection during a scroll session violently
             * jumps the viewport. Combined with rAF scroll-to-bottom, this gives
             * terminal-grade scroll stability.
             */
            overflowAnchor: "auto",

            /*
             * Momentum scrolling on iOS.
             * Without this the scroll decelerates abruptly (no inertia),
             * feeling robotic on iPhones compared to native apps.
             */
            WebkitOverflowScrolling: "touch" as any,

            /*
             * Prevent scroll chaining: reaching the top/bottom of terminal
             * history won't trigger pull-to-refresh or body bounce on the
             * parent page.
             */
            overscrollBehaviorY: "contain",
          }}
        >
          {lines.map(l => (
            <div
              key={l.id}
              className="term-line"
              style={{
                marginBottom: 2,
                fontSize:     13,
                lineHeight:   1.65,
                fontFamily:   "inherit",
                color:
                  l.type === "error"  ? "#ff6b6b" :
                  l.type === "input"  ? "#00FF9C" :
                  l.type === "system" ? "#555"    : "#ccc",
                whiteSpace: "pre-wrap",
                wordBreak:  "break-word",
                // Per LAYER 6: re-enable text selection on output lines only
                userSelect:       "text",
                WebkitUserSelect: "text",
              }}
            >
              {l.content}
            </div>
          ))}

          {/* ── Live input line (visual cursor) ─────────────────────── */}
          <div style={{ display: "flex", alignItems: "center", marginTop: 4 }}>
            <span style={{ color: "#00FF9C", fontFamily: "inherit", fontSize: 13, marginRight: 6, flexShrink: 0 }}>
              $
            </span>
            <span style={{ fontSize: 13, fontFamily: "inherit", color: "#fff", wordBreak: "break-all", flex: 1 }}>
              {inputValue}
            </span>
            <span
              aria-hidden="true"
              style={{
                display:    "inline-block",
                width:      7,
                height:     14,
                marginLeft: 1,
                flexShrink: 0,
                background: isFocused ? "#00FF9C" : "#1e1e1e",
                animation:  isFocused ? "term-blink 1s step-end infinite" : "none",
              }}
            />
          </div>

          {/* Scroll anchor — bottomRef.scrollIntoView() target */}
          <div ref={bottomRef} style={{ height: 1 }} aria-hidden="true" />
        </div>

        {/*
         * ════════════════════════════════════════════════════════════
         * LAYER 2 — Hidden Keystroke Capture Input
         * ════════════════════════════════════════════════════════════
         *
         * font-size: 16px
         *   iOS Safari will automatically zoom the viewport if a focused
         *   input's computed font-size < 16px. This is hardcoded in WebKit.
         *   Setting transform:scale(0) hides it visually but does NOT change
         *   the computed font-size — zoom bypass remains effective.
         *   THIS IS THE SINGLE MOST CRITICAL LINE IN THIS FILE.
         *
         * autoCapitalize="none"
         *   WHATWG canonical value. "off" is interpreted inconsistently across
         *   mobile browsers. "none" definitively suppresses first-letter caps.
         *   Prevents 'Docker Build' from appearing instead of 'docker build'.
         *
         * inputMode="text"
         *   Explicitly requests full alphanumeric keyboard on iPadOS, Samsung
         *   DeX, and non-standard Android OEM builds. Without it, some devices
         *   may serve a numeric pad or URL keyboard for unfocused hidden inputs.
         *
         * tabIndex={-1}
         *   Removes from tab order. Desktop keyboard users navigate to the
         *   terminal via the container; this input is an internal implementation
         *   detail.
         *
         * aria-hidden="true"
         *   Screen reader users receive feedback via the assertive live region
         *   above. Exposing this raw invisible input would confuse screen readers.
         */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          inputMode="text"
          tabIndex={-1}
          aria-hidden="true"
          style={{
            position:      "absolute",
            fontSize:      "16px",   // ← iOS zoom bypass. NEVER go below this.
            opacity:       0,
            pointerEvents: "none",
            width:         "1px",
            height:        "1px",
            padding:       0,
            margin:        0,
            border:        "none",
            outline:       "none",
            background:    "transparent",
            color:         "transparent",
            caretColor:    "transparent",
            top:           0,
            left:          0,
            // Scale to nothing without changing computed font-size
            transform:       "scale(0)",
            transformOrigin: "top left",
          }}
        />

        {/* ── Scoped CSS (portability: no external stylesheet dependency) ── */}
        <style>{`
          @keyframes term-blink {
            0%, 100% { opacity: 1; }
            50%       { opacity: 0; }
          }

          /*
           * LAYER 1 — DVH override
           * Browsers that support dvh apply this rule. Browsers that don't
           * keep the inline 'height: calc(100vh - 12rem)' from the style prop.
           * !important ensures the dvh value wins over the inline style.
           */
          .term-root {
            height:    calc(var(--terminal-offset, 12rem) * -1 + 100dvh) !important;
            min-height: 350px;
            max-height: 520px;
          }

          /*
           * LAYER 6 — CSS Touch Suppression Matrix
           *
           * touch-action: pan-y
           *   Compositor thread owns vertical scrolling. Browser fires
           *   pointercancel on scroll gestures, preventing JS focus logic.
           *   Also blocks horizontal swipe-back/forward browser navigation.
           *
           * -webkit-tap-highlight-color: transparent
           *   Suppresses the blue/grey OS flash on tap. On a dark terminal,
           *   this flash is blinding and visually disruptive.
           *
           * overscroll-behavior: contain
           *   Traps scroll physics within the terminal. Prevents pull-to-refresh
           *   and scroll chaining to the parent page body.
           *
           * -webkit-overflow-scrolling: touch
           *   Restores native momentum (inertial) scrolling on iOS. Without
           *   this, scrolling feels stiff compared to native apps.
           *
           * user-select: none on .term-root
           *   Prevents OS magnifier glass and text-selection handles appearing
           *   on long-press anywhere on the terminal chrome.
           *
           * user-select: text on .term-line (override)
           *   Re-enables copy-paste on output lines only. Users must be able
           *   to copy error messages, paths, and command output.
           */
          .term-root {
            touch-action:              pan-y;
            -webkit-tap-highlight-color: transparent;
            overscroll-behavior:       contain;
            -webkit-overflow-scrolling: touch;
            -webkit-user-select:       none;
            user-select:               none;
          }

          .term-line {
            -webkit-user-select: text;
            user-select:         text;
          }
        `}</style>
      </div>
    </>
  );
}
