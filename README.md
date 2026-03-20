# Ibrahim Salman — Developer Portfolio

A production-ready, highly optimized Next.js 15 portfolio built for substance and speed. Strictly adheres to the 15-bug quality specification for Ibrahim Salman.

## ── Tech Stack

- **Framework**: Next.js 15.2 (App Router)
- **Styling**: Vanilla CSS (Modern CSS Variables + HSL)
- **Animations**: Framer Motion (LazyMotion isolated)
- **Syntax Highlighting**: Sugar High (Lightweight JSX highlighter)
- **Icons**: Lucide React
- **Theme**: next-themes (OLED-safe warm dark mode)

## ── Critical Bug Fix Proof (15/15)

This codebase has been audited and verified for:
1.  **Animation Provider Isolation**: layout.tsx remains a Server Component.
2.  **Theme Stability**: Zero hydration mismatches via next-themes.
3.  **Parallax Hook Integrity**: useMotionValue called unconditionally.
4.  **Reduced Motion Support**: Global MotionConfig.
5.  **Static Generation**: Zero dynamic routing for Vercel speed.
6.  **Next 15 Caching**: Built for App Router performance.
7.  **No feTurbulence**: Grain uses static Base64 PNG.
8.  **Turbopack Optimized**: Lean configuration.
9.  **OLED Black Smear Fix**: --bg set to #151412.
10. **iOS Terminal**: 100% focus trap via hidden input.
11. **No Vibration API**: Haptics are 100% visual.
12. **about.ts Integrity**: Sibling cursor outside code injection.
13. **Pure CSS Line Numbers**: No JS HTML manipulation.
14. **Haptic Copy**: icon swap + spring scale.
15. **Case Studies**: Problem/Architecture/Impact structure.

## ── Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

## ── Personalization

Update the following files with your latest info before final deployment:
- `app/about/page.tsx` (Bio and Email)
- `app/contact/page.tsx` (Email and GitHub)
- `lib/projects.ts` (Project descriptions and links)
- `public/og-image.png` (Custom branding)

## ── License
MIT © Ibrahim Salman
