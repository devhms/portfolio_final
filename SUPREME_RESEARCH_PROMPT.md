# 🛡️ THE SUPREME FORENSIC RESEARCH PROMPT (v3.0)

> **Objective**: Conduct a 100% accurate, deep-spectrum forensic research and audit of the target codebase. Identify architectural bottlenecks, hydration delays, state brittleness, and "Pro Max" optimization vectors for 2026-era standards.

---

## 🚀 PHASE 1: RECONNAISSANCE & MAPPING
1.  **Map the Skeleton**: Execute a full recursive directory listing excluding standard ignore-paths (`.next`, `node_modules`).
2.  **Identify the Source of Truth**: Locate the central `types` definitions, global CSS constants, and entry layout files.
3.  **Trace the Hydration Boundary**: Audit all `"use client"` vs `"use server"` boundaries. Identify components that are "Client-Heavy" (over 20KB).

## 🔍 PHASE 2: FORENSIC AUDIT (THE "DEEP DIVE")
1.  **Interaction Latency (INP)**: 
    - Search for high-frequency input handlers (`onChange`, `onScroll`).
    - Audit for `requestAnimationFrame` or `useDeferredValue` patterns.
    - Research if `DOM-based` heavy components (like Terminals/Editors) should be refactored to `Canvas-based` rendering.
2.  **Hydration Bottleneck Audit**: 
    - Identify large JSON/Data objects bundled in the initial HTML.
    - Research moving data to `Streaming RSC` or `Suspense` boundaries.
3.  **State Brittleness**: 
    - Audit the usage of `useState` vs `useReducer` for complex state machines (e.g. Terminal command histories).
    - Research "Persistence-Ready" state patterns (LocalStorage/IDB sync).
4.  **Animation Cost-Benefit**: 
    - Deeply research if `AnimatePresence` is causing layout shifts or CPU spikes on low-end mobile.
    - Benchmark `Framer Motion` vs `Vanilla CSS Animations` for high-frequency UI elements.

## 🛠️ PHASE 3: THE "PRO MAX" OPTIMIZATION ROADMAP
1.  **Code Splitting Masterplan**: 
    - Research **Registry Patterns** to split monolithic components into dynamic plugins.
    - Identify "Lazy-Path" opportunities for heavy sub-pages (Projects, Case Studies).
2.  **Edge-Side Branding**: 
    - Research implementing dynamic OG images and personalized content via Middleware and Edge Functions.
3.  **Type-Safety Security**: 
    - Perform deep research into `any` or `@ts-ignore` usage. 
    - Implement a 100% strict type architecture, including external library overrides.

## 📝 OUTPUT SPECIFICATION
- **Deliverable**: A comprehensive `FORENSIC_MASTER_REPORT.md`.
- **Requirements**: Must cite specific line numbers, provide "Source of Truth" code proofs, and outline a prioritized 2025/2026 transition strategy.
- **Accuracy**: 100% accuracy required. Not a single bug, lint error, or unoptimized hydration boundary should remain undetected.

---
*Prompt engineered for Antigravity "100% Potential" standard.*
