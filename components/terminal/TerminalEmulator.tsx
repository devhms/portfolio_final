"use client";

import React, {
  useEffect,
  useReducer,
  useRef,
  useState,
  useCallback,
  memo,
} from "react";

// ── Next.js Router & Themes ──────────────────────────────────────────────────
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
// ─────────────────────────────────────────────────────────────────────────────

// ══════════════════════════════════════════════════════════════════════════════
//  TYPES
// ══════════════════════════════════════════════════════════════════════════════

type Segment = { text: string; color?: string };
type OutputLine = string | Segment[];

interface Line {
  id: string;
  type: "input" | "output" | "error";
  segments: Segment[];
}

interface State {
  lines: Line[];
  history: string[];
  historyIdx: number;
}

type Action =
  | { type: "PUSH"; line: Line }
  | { type: "PUSH_MANY"; lines: Line[] }
  | { type: "CLEAR" }
  | { type: "LOAD_HISTORY"; history: string[] }
  | { type: "ADD_HISTORY"; cmd: string };

// ══════════════════════════════════════════════════════════════════════════════
//  UTILS
// ══════════════════════════════════════════════════════════════════════════════

let _id = 0;
const uid = () => `l${++_id}`;

function toSegments(line: OutputLine): Segment[] {
  if (typeof line === "string") return [{ text: line }];
  return line;
}

function makeLine(
  type: Line["type"],
  content: OutputLine
): Line {
  return { id: uid(), type, segments: toSegments(content) };
}

// ══════════════════════════════════════════════════════════════════════════════
//  REDUCER
// ══════════════════════════════════════════════════════════════════════════════

const MAX_HISTORY = 1000;
const MAX_LINES = 2000;

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "PUSH":
      return {
        ...state,
        lines: [...state.lines, action.line].slice(-MAX_LINES),
      };
    case "PUSH_MANY":
      return {
        ...state,
        lines: [...state.lines, ...action.lines].slice(-MAX_LINES),
      };
    case "CLEAR":
      return { ...state, lines: [] };
    case "LOAD_HISTORY":
      return { ...state, history: action.history, historyIdx: -1 };
    case "ADD_HISTORY":
      if (!action.cmd.trim() || state.history[0] === action.cmd)
        return { ...state, historyIdx: -1 };
      return {
        ...state,
        history: [action.cmd, ...state.history].slice(0, MAX_HISTORY),
        historyIdx: -1,
      };
    default:
      return state;
  }
}

const initialState: State = {
  lines: [],
  history: [],
  historyIdx: -1,
};

// ══════════════════════════════════════════════════════════════════════════════
//  COMMAND LIST  (for autocomplete / ghost)
// ══════════════════════════════════════════════════════════════════════════════

const CMD_LIST = [
  "whoami",
  "ls",
  "ls projects/",
  "git log --oneline -5",
  "cat contact.txt",
  "cat README.md",
  "neofetch",
  "skills",
  "pwd",
  "date",
  "theme dark",
  "theme light",
  "theme system",
  "open blast",
  "open dawn",
  "open zuban",
  "open capital",
  "open about",
  "open contact",
  "open uses",
  "open projects",
  "open home",
  "sudo",
  "matrix",
  "clear",
  "help",
  "history",
];

// ══════════════════════════════════════════════════════════════════════════════
//  AUTOCOMPLETE
// ══════════════════════════════════════════════════════════════════════════════

function ghostSuggestion(partial: string): string {
  if (!partial) return "";
  const match = CMD_LIST.find(
    (c) => c.startsWith(partial) && c !== partial
  );
  return match ? match.slice(partial.length) : "";
}

function autocomplete(partial: string): string {
  if (!partial) return partial;
  const matches = CMD_LIST.filter((c) => c.startsWith(partial));
  if (matches.length === 0) return partial;
  if (matches.length === 1) return matches[0];
  let prefix = matches[0];
  for (const m of matches) {
    while (!m.startsWith(prefix)) prefix = prefix.slice(0, -1);
  }
  return prefix.length > partial.length ? prefix : partial;
}

// ══════════════════════════════════════════════════════════════════════════════
//  TYPEWRITER HOOK
// ══════════════════════════════════════════════════════════════════════════════

const WELCOME_LINES = [
  'Portfolio Terminal v2.0 — type "help" to get started.',
  "Press Tab to autocomplete · ↑↓ navigate history · Ctrl+L clear",
];

function useTypewriter(lines: string[], charDelay = 20) {
  const [displayed, setDisplayed] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let li = 0,
      ci = 0;
    const built: string[] = [];

    const tick = () => {
      if (li >= lines.length) {
        setDone(true);
        return;
      }
      ci++;
      setDisplayed([...built, lines[li].slice(0, ci)]);
      if (ci >= lines[li].length) {
        built.push(lines[li]);
        li++;
        ci = 0;
        setTimeout(tick, charDelay * 5);
      } else {
        setTimeout(tick, charDelay);
      }
    };
    const timer = setTimeout(tick, 350);
    return () => clearTimeout(timer);
  }, [lines, charDelay]);

  return { displayed, done };
}

// ══════════════════════════════════════════════════════════════════════════════
//  SYS INFO HOOK  (Tier 3.4)
// ══════════════════════════════════════════════════════════════════════════════

interface SysInfo {
  cores: number;
  memory: string;
  timezone: string;
  resolution: string;
  platform: string;
  browser: string;
}

function useSysInfo(): SysInfo {
  const [info, setInfo] = useState<SysInfo>({
    cores: 0,
    memory: "unknown",
    timezone: "unknown",
    resolution: "unknown",
    platform: "unknown",
    browser: "unknown",
  });

  useEffect(() => {
    const ua = navigator.userAgent;
    setInfo({
      cores: navigator.hardwareConcurrency ?? 0,
      memory:
        (navigator as { deviceMemory?: number }).deviceMemory != null
          ? `${(navigator as { deviceMemory?: number }).deviceMemory}GB`
          : "undisclosed",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      resolution: `${window.screen.width}×${window.screen.height}`,
      platform: ua.includes("Mac")
        ? "macOS"
        : ua.includes("Win")
        ? "Windows"
        : ua.includes("Linux")
        ? "Linux"
        : ua.includes("Android")
        ? "Android"
        : ua.includes("iPhone") || ua.includes("iPad")
        ? "iOS"
        : "Unknown",
      browser: ua.includes("Firefox")
        ? "Firefox"
        : ua.includes("Edg")
        ? "Edge"
        : ua.includes("Chrome")
        ? "Chrome"
        : ua.includes("Safari")
        ? "Safari"
        : "Unknown",
    });
  }, []);

  return info;
}

// ══════════════════════════════════════════════════════════════════════════════
//  OUTPUT LINE (memoised)
// ══════════════════════════════════════════════════════════════════════════════

const OutputRow = memo(function OutputRow({ line }: { line: Line }) {
  return (
    <div
      style={{
        lineHeight: 1.65,
        wordBreak: "break-all",
        color:
          line.type === "error"
            ? "var(--term-red)"
            : line.type === "input"
            ? "var(--term-t1)"
            : "var(--term-t2)",
        unicodeBidi: "bidi-override",
        direction: "ltr",
      }}
    >
      {line.segments.map((seg, i) => (
        <span key={i} style={{ color: seg.color }}>
          {seg.text}
        </span>
      ))}
    </div>
  );
});

// ══════════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

export default function TerminalEmulator() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [searchMode, setSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMatch, setSearchMatch] = useState("");
  const [showMatrix, setShowMatrix] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const matrixCanvasRef = useRef<HTMLCanvasElement>(null);
  const konamiBuf = useRef<string[]>([]);
  const historyIdxRef = useRef(-1);

  // Layer 3: Touch-Delta Discriminator Refs
  const touchStartRef = useRef<{ y: number; time: number } | null>(null);
  // Layer 4: rAF Ref
  const rafRef = useRef<number>(0);

  const { displayed: welcomeLines, done: welcomeDone } =
    useTypewriter(WELCOME_LINES);
  const sysInfo = useSysInfo();

  const router = useRouter();
  const { setTheme } = useTheme();

  // ── localStorage: load on mount ───────────────────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem("terminal-history");
      if (saved) {
        const parsed = JSON.parse(saved) as string[];
        dispatch({ type: "LOAD_HISTORY", history: parsed.slice(0, MAX_HISTORY) });
      }
    } catch {
      /* noop */
    }
  }, []);

  // ── localStorage: persist on change ──────────────────────────────────────
  useEffect(() => {
    if (state.history.length === 0) return;
    try {
      localStorage.setItem(
        "terminal-history",
        JSON.stringify(state.history.slice(0, MAX_HISTORY))
      );
    } catch {
      /* noop */
    }
  }, [state.history]);

  // ── Auto-scroll ───────────────────────────────────────────────────────────
  // Layer 8: overflow-anchor is set in CSS, but we keep this for manual output appends
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.lines, welcomeLines]);

  // Layer 4: rAF-Debounced visualViewport Auto-Scroll
  useEffect(() => {
    const vv = typeof window !== "undefined" ? window.visualViewport : null;
    if (!vv) return;

    const onVVResize = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    };

    vv.addEventListener("resize", onVVResize);
    return () => {
      vv.removeEventListener("resize", onVVResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Layer 5: iOS 26 Liquid Glass offsetReset Nudge
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    const onFocusOut = () => {
      // Small delay to allow keyboard dismissal animation
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

  // ── Konami Code ───────────────────────────────────────────────────────────
  const KONAMI = [
    "ArrowUp","ArrowUp","ArrowDown","ArrowDown",
    "ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a",
  ];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      konamiBuf.current = [...konamiBuf.current, e.key].slice(-10);
      if (konamiBuf.current.join(",") === KONAMI.join(",")) {
        konamiBuf.current = [];
        dispatch({
          type: "PUSH_MANY",
          lines: [
            makeLine("output", [{ text: "⚡ CHEAT CODE ACTIVATED", color: "var(--term-amber)" }]),
            makeLine("output", [{ text: "You found the easter egg. Ibrahim likes you already.", color: "var(--term-t2)" }]),
            makeLine("output", [
              { text: "→ reach out: ", color: "var(--term-t3)" },
              { text: "ibrahim.pk848@gmail.com", color: "var(--term-acc)" },
            ]),
          ],
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Matrix animation ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!showMatrix) return;
    const canvas = matrixCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const cols = Math.floor(canvas.width / 14);
    const drops = Array<number>(cols).fill(1);
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*イウエオカキクケコサシスセソ";

    let animId: number;
    const draw = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#4ade80";
      ctx.font = "13px monospace";
      drops.forEach((y, i) => {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(char, i * 14, y * 14);
        if (y * 14 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
      animId = requestAnimationFrame(draw);
    };
    animId = requestAnimationFrame(draw);

    const stop = setTimeout(() => {
      cancelAnimationFrame(animId);
      setShowMatrix(false);
    }, 4000);

    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(stop);
    };
  }, [showMatrix]);

  // ══════════════════════════════════════════════════════════════════════════
  //  COMMAND EXECUTOR
  // ══════════════════════════════════════════════════════════════════════════

  const execCommand = useCallback(
    (raw: string): OutputLine[] => {
      const cmd = raw.trim().toLowerCase();

      // ── sudo ──────────────────────────────────────────────────────────────
      if (cmd.startsWith("sudo")) {
        return [
          [{ text: "ibrahim is not in the sudoers file.", color: "var(--term-red)" }],
          [{ text: "This incident will not be reported. (relax — it's a portfolio)", color: "var(--term-t3)" }],
        ];
      }

      // ── open <page> ───────────────────────────────────────────────────────
      const openMatch = cmd.match(/^open\s+(\S+)$/);
      if (openMatch) {
        const target = openMatch[1];
        const routes: Record<string, string> = {
          blast: "/projects/blast",
          dawn: "/projects/dawn",
          zuban: "/projects/zuban",
          capital: "/projects/capital",
          projects: "/projects",
          about: "/about",
          contact: "/contact",
          uses: "/uses",
          home: "/",
        };
        if (routes[target]) {
          setTimeout(() => router.push(routes[target]), 600);
          return [
            [
              { text: "→ navigating to ", color: "var(--term-t3)" },
              { text: routes[target], color: "var(--term-acc)" },
            ],
          ];
        }
        return [
          [
            {
              text: `open: unknown page '${target}'. Try: blast dawn zuban capital about contact uses`,
              color: "var(--term-red)",
            },
          ],
        ];
      }

      // ── theme ─────────────────────────────────────────────────────────────
      const themeMatch = cmd.match(/^theme\s+(dark|light|system)$/);
      if (themeMatch) {
        const mode = themeMatch[1];
        setTheme(mode);
        return [
          [
            { text: "theme set to: ", color: "var(--term-t3)" },
            { text: mode, color: "var(--term-acc)" },
          ],
        ];
      }
      if (cmd === "theme") {
        return [
          [
            { text: "usage: ", color: "var(--term-t3)" },
            { text: "theme dark|light|system", color: "var(--term-t2)" },
          ],
        ];
      }

      switch (cmd) {
        // ── clear ─────────────────────────────────────────────────────────
        case "clear":
          dispatch({ type: "CLEAR" });
          return [];

        // ── help ──────────────────────────────────────────────────────────
        case "help":
          return [
            [{ text: "Available commands", color: "var(--term-t1)" }],
            [{ text: "─────────────────────────────────────────────", color: "var(--term-t3)" }],
            [
              { text: "  whoami          ", color: "var(--term-acc)" },
              { text: "who is this person", color: "var(--term-t2)" },
            ],
            [
              { text: "  ls              ", color: "var(--term-acc)" },
              { text: "list sections", color: "var(--term-t2)" },
            ],
            [
              { text: "  ls projects/    ", color: "var(--term-acc)" },
              { text: "list all projects", color: "var(--term-t2)" },
            ],
            [
              { text: "  skills          ", color: "var(--term-acc)" },
              { text: "proficiency bars", color: "var(--term-t2)" },
            ],
            [
              { text: "  neofetch        ", color: "var(--term-acc)" },
              { text: "system info card", color: "var(--term-t2)" },
            ],
            [
              { text: "  git log         ", color: "var(--term-acc)" },
              { text: "recent commits", color: "var(--term-t2)" },
            ],
            [
              { text: "  cat README.md   ", color: "var(--term-acc)" },
              { text: "read the README", color: "var(--term-t2)" },
            ],
            [
              { text: "  cat contact.txt ", color: "var(--term-acc)" },
              { text: "contact details", color: "var(--term-t2)" },
            ],
            [
              { text: "  open <page>     ", color: "var(--term-acc)" },
              { text: "navigate to a page", color: "var(--term-t2)" },
            ],
            [
              { text: "  theme <mode>    ", color: "var(--term-acc)" },
              { text: "dark | light | system", color: "var(--term-t2)" },
            ],
            [
              { text: "  matrix          ", color: "var(--term-acc)" },
              { text: "🕶️  enter the matrix", color: "var(--term-t2)" },
            ],
            [
              { text: "  date            ", color: "var(--term-acc)" },
              { text: "current date/time", color: "var(--term-t2)" },
            ],
            [
              { text: "  history         ", color: "var(--term-acc)" },
              { text: "command history", color: "var(--term-t2)" },
            ],
            [
              { text: "  pwd             ", color: "var(--term-acc)" },
              { text: "print working dir", color: "var(--term-t2)" },
            ],
            [
              { text: "  clear           ", color: "var(--term-acc)" },
              { text: "clear the screen", color: "var(--term-t2)" },
            ],
            [{ text: "" }],
            [
              { text: "  Ctrl+L ", color: "var(--term-amber)" },
              { text: "clear · ", color: "var(--term-t3)" },
              { text: "Ctrl+C ", color: "var(--term-amber)" },
              { text: "cancel", color: "var(--term-t3)" },
            ],
            [
              { text: "  Ctrl+R ", color: "var(--term-amber)" },
              { text: "search · ", color: "var(--term-t3)" },
              { text: "Tab ", color: "var(--term-amber)" },
              { text: "autocomplete", color: "var(--term-t3)" },
            ],
          ];

        // ── whoami ────────────────────────────────────────────────────────
        case "whoami":
          return [
            [
              { text: "Ibrahim Salman", color: "var(--term-t1)" },
              { text: " — CS student & builder", color: "var(--term-t2)" },
            ],
            [{ text: "  UET Taxila · Semester 2 of 8 · Islamabad, PK", color: "var(--term-t3)" }],
            [{ text: "  Python · Next.js · TypeScript · LangChain · Java", color: "var(--term-t2)" }],
            [{ text: "  Currently: open to internships & collaborations", color: "var(--term-green)" }],
          ];

        // ── ls ────────────────────────────────────────────────────────────
        case "ls":
          return [
            [
              { text: "about/  ", color: "var(--term-acc)" },
              { text: "projects/  ", color: "var(--term-acc)" },
              { text: "contact/  ", color: "var(--term-acc)" },
              { text: "uses/  ", color: "var(--term-acc)" },
              { text: "README.md  ", color: "var(--term-t2)" },
            ],
          ];

        // ── ls projects/ ──────────────────────────────────────────────────
        case "ls projects/":
          return [
            [
              { text: "blast/  ", color: "var(--term-acc)" },
              { text: "dawn/  ", color: "var(--term-acc)" },
              { text: "zuban/  ", color: "var(--term-acc)" },
              { text: "capital/", color: "var(--term-acc)" },
            ],
            [{ text: "  Use `open <name>` to navigate to any project.", color: "var(--term-t3)" }],
          ];

        // ── git log ───────────────────────────────────────────────────────
        case "git log --oneline -5":
          return [
            [
              { text: "a4f2c1e", color: "var(--term-amber)" },
              { text: " feat: add ollama streaming to zuban chat", color: "var(--term-t2)" },
            ],
            [
              { text: "9b3d7f0", color: "var(--term-amber)" },
              { text: " fix: normalise PSX decimal separators in BLAST parser", color: "var(--term-t2)" },
            ],
            [
              { text: "e8c1a44", color: "var(--term-amber)" },
              { text: " feat: capital budgeting NPV/IRR calculator", color: "var(--term-t2)" },
            ],
            [
              { text: "7d9f2b3", color: "var(--term-amber)" },
              { text: " chore: migrate portfolio to App Router", color: "var(--term-t2)" },
            ],
            [
              { text: "3f6a8c2", color: "var(--term-amber)" },
              { text: " feat: terminal emulator with typewriter boot", color: "var(--term-t2)" },
            ],
          ];

        // ── cat README.md ─────────────────────────────────────────────────
        case "cat readme.md":
          return [
            [{ text: "# Ibrahim Salman", color: "var(--term-t1)" }],
            [{ text: "" }],
            [{ text: "CS student at UET Taxila building things that matter.", color: "var(--term-t2)" }],
            [{ text: "Focused on AI/ML tooling, full-stack web apps, and", color: "var(--term-t2)" }],
            [{ text: "financial data systems.", color: "var(--term-t2)" }],
            [{ text: "" }],
            [
              { text: "→ ", color: "var(--term-acc)" },
              { text: "github.com/devhms", color: "var(--term-t2)" },
            ],
            [
              { text: "→ ", color: "var(--term-acc)" },
              { text: "ibrahim.pk848@gmail.com", color: "var(--term-t2)" },
            ],
          ];

        // ── cat contact.txt ───────────────────────────────────────────────
        case "cat contact.txt":
          return [
            [{ text: "Contact", color: "var(--term-t1)" }],
            [{ text: "────────────────────────────────────", color: "var(--term-t3)" }],
            [
              { text: "  email:    ", color: "var(--term-t3)" },
              { text: "ibrahim.pk848@gmail.com", color: "var(--term-acc)" },
            ],
            [
              { text: "  github:   ", color: "var(--term-t3)" },
              { text: "github.com/devhms", color: "var(--term-acc)" },
            ],
            [
              { text: "  location: ", color: "var(--term-t3)" },
              { text: "Islamabad, PK · UTC+5", color: "var(--term-t2)" },
            ],
          ];

        // ── pwd ───────────────────────────────────────────────────────────
        case "pwd":
          return [[{ text: "/home/ibrahim/portfolio", color: "var(--term-t2)" }]];

        // ── date ──────────────────────────────────────────────────────────
        case "date":
          return [[{ text: new Date().toString(), color: "var(--term-t2)" }]];

        // ── history ───────────────────────────────────────────────────────
        case "history":
          if (state.history.length === 0)
            return [[{ text: "No history yet.", color: "var(--term-t3)" }]];
          return state.history
            .slice(0, 20)
            .map((h, i) => [
              { text: `  ${String(i + 1).padStart(3, " ")}  `, color: "var(--term-t3)" },
              { text: h, color: "var(--term-t2)" },
            ] as Segment[]);

        // ── matrix ────────────────────────────────────────────────────────
        case "matrix":
          setShowMatrix(true);
          return [
            [{ text: "Entering the matrix... (4s)", color: "var(--term-green)" }],
          ];

        // ── neofetch ──────────────────────────────────────────────────────
        case "neofetch": {
          const art = [
            "  ██╗██████╗ ██████╗  █████╗ ██╗  ██╗██╗███╗   ███╗",
            "  ██║██╔══██╗██╔══██╗██╔══██╗██║  ██║██║████╗ ████║",
            "  ██║██████╔╝██████╔╝███████║███████║██║██╔████╔██║",
            "  ██║██╔══██╗██╔══██╗██╔══██║██╔══██║██║██║╚██╔╝██║",
            "  ██║██████╔╝██║  ██║██║  ██║██║  ██║██║██║ ╚═╝ ██║",
            "  ╚═╝╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝     ╚═╝",
          ];
          const artColors = [
            "var(--term-acc)", "var(--term-acc)", "var(--term-acc)",
            "var(--term-amber)", "var(--term-amber)", "var(--term-t3)",
          ];
          return [
            ...art.map((line, i) => [{ text: line, color: artColors[i] }] as Segment[]),
            [{ text: "" }],
            [
              { text: "  user@", color: "var(--term-t3)" },
              { text: "devhms", color: "var(--term-acc)" },
            ],
            [{ text: "  ─────────────────────────────────────", color: "var(--term-t3)" }],
            [
              { text: "  name:       ", color: "var(--term-t3)" },
              { text: "Ibrahim Salman", color: "var(--term-t1)" },
            ],
            [
              { text: "  handle:     ", color: "var(--term-t3)" },
              { text: "@devhms", color: "var(--term-acc)" },
            ],
            [
              { text: "  uni:        ", color: "var(--term-t3)" },
              { text: "UET Taxila · Semester 2 of 8", color: "var(--term-t2)" },
            ],
            [
              { text: "  location:   ", color: "var(--term-t3)" },
              { text: "Islamabad, PK · UTC+5", color: "var(--term-t2)" },
            ],
            [
              { text: "  status:     ", color: "var(--term-t3)" },
              { text: "● open-to-work", color: "var(--term-green)" },
            ],
            [
              { text: "  stack:      ", color: "var(--term-t3)" },
              { text: "Python · Next.js · TS · LangChain · Java", color: "var(--term-t2)" },
            ],
            [
              { text: "  cpu:        ", color: "var(--term-t3)" },
              { text: sysInfo.cores ? `${sysInfo.cores} cores` : "unknown", color: "var(--term-t2)" },
            ],
            [
              { text: "  memory:     ", color: "var(--term-t3)" },
              { text: sysInfo.memory, color: "var(--term-t2)" },
            ],
            [
              { text: "  resolution: ", color: "var(--term-t3)" },
              { text: sysInfo.resolution, color: "var(--term-t2)" },
            ],
            [
              { text: "  timezone:   ", color: "var(--term-t3)" },
              { text: sysInfo.timezone, color: "var(--term-t2)" },
            ],
            [
              { text: "  os:         ", color: "var(--term-t3)" },
              { text: sysInfo.platform, color: "var(--term-t2)" },
            ],
            [
              { text: "  browser:    ", color: "var(--term-t3)" },
              { text: sysInfo.browser, color: "var(--term-t2)" },
            ],
            [{ text: "" }],
            [
              { text: "  " },
              { text: "██", color: "#ff5f57" },
              { text: "██", color: "#febc2e" },
              { text: "██", color: "#28c840" },
              { text: "██", color: "var(--term-acc)" },
              { text: "██", color: "var(--term-green)" },
              { text: "██", color: "var(--term-amber)" },
              { text: "██", color: "var(--term-t2)" },
              { text: "██", color: "var(--term-t1)" },
            ],
          ];
        }

        // ── skills ────────────────────────────────────────────────────────
        case "skills": {
          const items = [
            { name: "Python",     pct: 85 },
            { name: "Next.js",    pct: 75 },
            { name: "TypeScript", pct: 70 },
            { name: "Java",       pct: 65 },
            { name: "LangChain",  pct: 60 },
          ];
          return [
            [{ text: "Skills", color: "var(--term-t1)" }],
            [{ text: "────────────────────────────────────────────", color: "var(--term-t3)" }],
            ...items.map(({ name, pct }) => {
              const filled = Math.round(pct / 5);
              const bar = "█".repeat(filled) + "░".repeat(20 - filled);
              return [
                { text: `  ${name.padEnd(12)}`, color: "var(--term-t3)" },
                { text: bar, color: "var(--term-acc)" },
                { text: ` ${pct}%`, color: "var(--term-t2)" },
              ] as Segment[];
            }),
          ];
        }

        // ── not found ─────────────────────────────────────────────────────
        default:
          if (!cmd) return [];
          return [
            [
              { text: `bash: `, color: "var(--term-t3)" },
              { text: raw.trim(), color: "var(--term-red)" },
              { text: `: command not found. Type `, color: "var(--term-t3)" },
              { text: "help", color: "var(--term-acc)" },
              { text: " for a list.", color: "var(--term-t3)" },
            ],
          ];
      }
    },
    [sysInfo, state.history, router, setTheme]
  );

  // ══════════════════════════════════════════════════════════════════════════
  //  RUN COMMAND
  // ══════════════════════════════════════════════════════════════════════════

  const runCommand = useCallback(
    (raw: string) => {
      const cmd = raw.trim();
      if (!cmd) return;

      // Echo input line
      dispatch({
        type: "PUSH",
        line: makeLine("input", [
          { text: "$ ", color: "var(--term-acc)" },
          { text: cmd, color: "var(--term-t1)" },
        ]),
      });

      // Add to history
      dispatch({ type: "ADD_HISTORY", cmd });
      historyIdxRef.current = -1;

      // Execute
      const outputLines = execCommand(raw);
      if (outputLines.length > 0) {
        dispatch({
          type: "PUSH_MANY",
          lines: outputLines.map((l) => makeLine("output", l)),
        });
      }
    },
    [execCommand]
  );

  // ══════════════════════════════════════════════════════════════════════════
  //  KEY HANDLER
  // ══════════════════════════════════════════════════════════════════════════

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // ── Ctrl+L ─────────────────────────────────────────────────────────────
    if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      dispatch({ type: "CLEAR" });
      return;
    }

    // ── Ctrl+C ─────────────────────────────────────────────────────────────
    if (e.key === "c" && e.ctrlKey && !searchMode) {
      e.preventDefault();
      dispatch({
        type: "PUSH",
        line: makeLine("input", [
          { text: `$ ${inputVal}`, color: "var(--term-t3)" },
          { text: "^C", color: "var(--term-red)" },
        ]),
      });
      setInputVal("");
      return;
    }

    // ── Ctrl+R — enter search mode ─────────────────────────────────────────
    if (e.key === "r" && e.ctrlKey) {
      e.preventDefault();
      setSearchMode(true);
      setSearchQuery("");
      setSearchMatch("");
      return;
    }

    // ── Search mode keys ───────────────────────────────────────────────────
    if (searchMode) {
      if (e.key === "Escape" || (e.key === "g" && e.ctrlKey)) {
        e.preventDefault();
        setSearchMode(false);
        setSearchQuery("");
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        setSearchMode(false);
        if (searchMatch) {
          setInputVal(searchMatch);
        }
        return;
      }
      return;
    }

    // ── Tab ────────────────────────────────────────────────────────────────
    if (e.key === "Tab") {
      e.preventDefault();
      setInputVal(autocomplete(inputVal));
      return;
    }

    // ── Enter ──────────────────────────────────────────────────────────────
    if (e.key === "Enter") {
      runCommand(inputVal);
      setInputVal("");
      historyIdxRef.current = -1;
      return;
    }

    // ── History navigation ─────────────────────────────────────────────────
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(historyIdxRef.current + 1, state.history.length - 1);
      historyIdxRef.current = next;
      setInputVal(state.history[next] ?? "");
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = Math.max(historyIdxRef.current - 1, -1);
      historyIdxRef.current = next;
      setInputVal(next === -1 ? "" : state.history[next] ?? "");
      return;
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  //  CHANGE HANDLER
  // ══════════════════════════════════════════════════════════════════════════

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputVal(val);
    setIsTyping(true);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => setIsTyping(false), 800);

    // Sync selection to end (Mobile fix for reverse typing)
    const target = e.target;
    requestAnimationFrame(() => {
      target.setSelectionRange(target.value.length, target.value.length);
    });

    if (searchMode) {
      setSearchQuery(val);
      const match = [...state.history]
        .reverse()
        .find((h) => h.includes(val));
      setSearchMatch(match ?? "");
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  //  TOUCH HANDLERS (Layer 3)
  // ══════════════════════════════════════════════════════════════════════════

  const SWIPE_THRESHOLD_PX = 8;
  const SWIPE_DURATION_MS = 250;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      y: e.touches[0].clientY,
      time: Date.now(),
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const { y, time } = touchStartRef.current;
    const isTap =
      Math.abs(e.changedTouches[0].clientY - y) < SWIPE_THRESHOLD_PX &&
      Date.now() - time < SWIPE_DURATION_MS;

    if (isTap) {
      e.preventDefault(); // Kills ghost-click
      inputRef.current?.focus();
    }
  };

  const handleContainerClick = () => {
    // Only focus via click on Desktop (fine pointer)
    // Touch devices use the handleTouchEnd discriminator
    if (window.matchMedia("(pointer: fine)").matches) {
      inputRef.current?.focus();
    }
  };

  const ghost = ghostSuggestion(inputVal);

  // Layer 7: Cursor sync for mobile Safari
  // This hidden input is used to sync the cursor position in the visible input
  // on mobile Safari, which has issues with `setSelectionRange` on non-native inputs.
  // It's positioned off-screen and its value is kept in sync with the main input.
  // When the main input is focused, this input is also focused briefly to
  // trigger the native cursor behavior, then focus is returned to the main input.
  // This ensures the cursor is always at the end of the text.
  const cursorSyncRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (inputRef.current && cursorSyncRef.current) {
      const mainInput = inputRef.current;
      const syncInput = cursorSyncRef.current;

      const handleFocus = () => {
        if (
          /iPad|iPhone|iPod/.test(navigator.userAgent) &&
          !(window as any).MSStream &&
          document.activeElement === mainInput
        ) {
          syncInput.focus();
          syncInput.setSelectionRange(
            syncInput.value.length,
            syncInput.value.length
          );
          mainInput.focus();
        }
      };

      mainInput.addEventListener("focus", handleFocus);
      return () => {
        mainInput.removeEventListener("focus", handleFocus);
      };
    }
  }, []);

  // ══════════════════════════════════════════════════════════════════════════
  //  RENDER
  // ══════════════════════════════════════════════════════════════════════════

  return (
    <>
      {/* ── Global styles ─────────────────────────────────────────────────── */}
      <style>{`
        :root {
          --term-bg:     var(--bg);
          --term-bg2:    var(--bg2);
          --term-border: var(--b1);
          --term-t1:     var(--t1);
          --term-t2:     var(--t2);
          --term-t3:     var(--t3);
          --term-acc:    var(--color-primary);
          --term-green:  var(--green);
          --term-amber:  var(--amber);
          --term-red:    var(--red);
          --term-cta:    var(--color-cta);
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }

        .term-root {
          font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', ui-monospace, monospace;
          background: var(--term-bg);
          color: var(--term-t2);
          font-size: 0.8125rem;
          line-height: 1.65;
          border-radius: 0.75rem;
          box-shadow:
            0 0 0 1px var(--term-border),
            0 20px 60px rgba(0,0,0,0.6),
            0 0 80px rgba(88,166,255,0.04);
          overflow: hidden;
          position: relative;
          max-width: 780px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;

          /* Layer 1: DVH fallback and override */
          height: calc(100vh - 12rem);
          height: calc(100dvh - 12rem) !important;
          min-height: 350px;
          max-height: 520px;

          /* Layer 6: Touch Suppression Matrix */
          touch-action: pan-y;
          -webkit-tap-highlight-color: transparent;
          overscroll-behavior: contain;
          -webkit-overflow-scrolling: touch;
          -webkit-user-select: none;
          user-select: none;

          direction: ltr !important;
          text-align: left !important;
        }

        /* Layer 6: Re-enable text selection on output lines */
        .term-line-output {
          -webkit-user-select: text;
          user-select: text;
        }

        /* Chrome / title bar */
        .term-chrome {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.625rem 1rem;
          background: var(--term-bg2);
          border-bottom: 1px solid var(--term-border);
          flex-shrink: 0;
        }
        .term-dot {
          width: 0.6875rem;
          height: 0.6875rem;
          border-radius: 50%;
        }
        .term-title {
          flex: 1;
          text-align: center;
          font-size: 0.6875rem;
          color: var(--term-t3);
          letter-spacing: 0.025em;
        }
        .term-hints {
          font-size: 0.625rem;
          color: var(--term-t3);
          opacity: 0.6;
          white-space: nowrap;
        }

        /* Body / scroll area */
        .term-body {
          flex: 1;
          overflow-y: auto;
          padding: 0.875rem 1.125rem 0.5rem;
          scroll-behavior: smooth;
          direction: ltr !important;
          text-align: left !important;
          unicode-bidi: bidi-override !important;
        }
        .term-body::-webkit-scrollbar { width: 4px; }
        .term-body::-webkit-scrollbar-track { background: transparent; }
        .term-body::-webkit-scrollbar-thumb { background: var(--term-border); border-radius: 2px; }

        /* Input row */
        .term-input-row {
          display: flex;
          align-items: center;
          padding: 0.5rem 1.125rem 0.75rem;
          background: var(--term-bg);
          flex-shrink: 0;
          border-top: 1px solid rgba(48,54,61,0.5);
          direction: ltr !important;
          text-align: left !important;
          unicode-bidi: bidi-override !important;
        }
        .term-prompt-sym {
          color: var(--term-acc);
          flex-shrink: 0;
          margin-right: 0.25rem;
        }
        .term-cursor {
          display: inline-block;
          width: 0.55em;
          height: 1.05em;
          background: var(--term-cta);
          vertical-align: text-bottom;
          margin-left: 1px;
        }
      `}</style>

      {/* ── Terminal window ────────────────────────────────────────────────── */}
      <div
        className="term-root"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={handleContainerClick}
        role="application"
        aria-label="Terminal emulator"
        style={{ overflowAnchor: "auto" }} /* Layer 8 */
      >
        {/* Chrome bar */}
        <div className="term-chrome">
          <span className="term-dot" style={{ background: "#ff5f57" }} />
          <span className="term-dot" style={{ background: "#febc2e" }} />
          <span className="term-dot" style={{ background: "#28c840" }} />
          <span className="term-title">ibrahim@devhms — ~</span>
          <span className="term-hints">
            Tab:complete · ↑↓:history · Ctrl+R:search · Ctrl+L:clear
          </span>
        </div>

        {/* Scrollable output */}
        <div className="term-body">
          {/* Typewriter welcome */}
          {welcomeLines.map((line, i) => (
            <div
              key={`w${i}`}
              style={{ lineHeight: 1.65, color: "var(--term-t3)", unicodeBidi: "bidi-override", direction: "ltr" }}
            >
              {i === 0 ? (
                <>
                  <span style={{ color: "var(--term-acc)" }}>ibrahim</span>
                  <span style={{ color: "var(--term-t3)" }}>@devhms:~$ </span>
                  <span style={{ color: "var(--term-t2)" }}>{line}</span>
                </>
              ) : (
                <span style={{ color: "var(--term-t3)" }}>{line}</span>
              )}
            </div>
          ))}
          {welcomeDone && <div style={{ height: "0.5rem" }} />}

          {/* Output lines */}
          {welcomeDone &&
            state.lines.map((line) => (
              <div key={line.id} className="term-line-output">
                <OutputRow line={line} />
              </div>
            ))}

          {/* Scroll anchor */}
          <div ref={bottomRef} />
        </div>

        {/* Matrix canvas overlay */}
        {showMatrix && (
          <canvas
            ref={matrixCanvasRef}
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              zIndex: 20,
              borderRadius: "inherit",
            }}
          />
        )}

        {/* Input area */}
        {welcomeDone && (
          <div className="term-input-row" style={{ direction: "ltr", textAlign: "left" }}>
            {searchMode ? (
              /* Reverse-i-search prompt */
              <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                <span style={{ color: "var(--term-t3)", flexShrink: 0 }}>
                  (reverse-i-search)`
                </span>
                <span style={{ color: "var(--term-t1)" }}>{searchQuery}</span>
                <span style={{ color: "var(--term-t3)" }}>&apos;: </span>
                <span style={{ color: "var(--term-acc)" }}>{searchMatch}</span>
                <span style={{ color: "var(--term-t3)", marginLeft: "0.5rem", fontSize: "0.625rem" }}>
                  Enter:select · Esc:cancel
                </span>
              </div>
            ) : (
              /* Normal prompt */
              <>
                <span className="term-prompt-sym">$ </span>
                {/* Typed text */}
                <span style={{ color: "var(--term-t1)", whiteSpace: "pre", direction: "ltr", textAlign: "left", unicodeBidi: "bidi-override" }}>
                  {inputVal}
                </span>
                {/* Ghost suggestion */}
                {ghost && (
                  <span
                    style={{
                      color: "var(--term-t3)",
                      opacity: 0.4,
                      whiteSpace: "pre",
                    }}
                  >
                    {ghost}
                  </span>
                )}
                {/* Cursor */}
                <span
                  className="term-cursor"
                  style={{
                    animation: isTyping
                      ? "none"
                      : "blink 1.1s step-end infinite",
                  }}
                />
              </>
            )}

            {/* Layer 2: Hidden real input configuration */}
            <input
              ref={inputRef}
              value={searchMode ? searchQuery : inputVal}
              onChange={handleChange}
              onFocus={(e) => {
                const len = e.target.value.length;
                e.target.setSelectionRange(len, len);
              }}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              inputMode="text"
              tabIndex={-1}
              aria-hidden="true"
              aria-label="Terminal input"
              style={{
                position: "fixed",
                top: "50%",
                left: "-9999px",
                opacity: 0,
                width: "100px",
                height: "40px",
                fontSize: "16px",
                direction: "ltr",
                textAlign: "left",
                unicodeBidi: "bidi-override",
              }}
            />
          </div>
        )}

        {/* Layer 7: ARIA live region (screen-reader only) */}
        <div
          aria-live="assertive"
          aria-atomic="true"
          aria-label="Terminal output"
          style={{
            position: "absolute",
            width: "1px",
            height: "1px",
            padding: 0,
            margin: "-1px",
            overflow: "hidden",
            clip: "rect(0,0,0,0)",
            whiteSpace: "nowrap",
            border: 0,
          }}
        >
          {state.lines[state.lines.length - 1]?.segments.map((s) => s.text).join("") ?? ""}
        </div>
      </div>
    </>
  );
}
