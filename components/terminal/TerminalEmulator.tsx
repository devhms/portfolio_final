"use client";

import { useReducer, useRef, useEffect } from "react";
import { m } from "framer-motion";
import type { TerminalState, TerminalAction, TerminalLine } from "@/types";

// ── Commands ─────────────────────────────────────────────────────────
const COMMANDS: Record<string, () => string[]> = {
  whoami: () => ["Ibrahim Salman — SE student, UET Taxila Sem 2"],
  ls: () => ["projects/    README.md    about.ts    contact.txt"],
  "ls projects/": () => [
    "B.L.A.S.T./    dawn-scraper/    zuban/    capital-suite/",
  ],
  "git log --oneline -5": () => [
    "a4f2c1e feat: add ollama streaming to zuban chat",
    "9b3d7f0 fix: normalize PSX decimal separators in BLAST parser",
    "c81e249 chore: migrate capital suite to Java 21 records",
    "f2a8b3d feat: add category filter to dawn scraper",
    "07c5e91 init: bootstrap portfolio with Next.js 15",
  ],
  "cat contact.txt": () => [
    "email:   ibrahim.pk848@gmail.com",
    "github:  github.com/devhms",
    "status:  open-to-work",
    "tz:      PKT UTC+5",
  ],
  help: () => [
    "Available commands:",
    "  whoami               — who I am",
    "  ls                   — list files",
    "  ls projects/         — list projects",
    "  git log --oneline -5 — recent commits",
    "  cat contact.txt      — contact info",
    "  clear                — clear terminal",
    "  help                 — show this message",
  ],
};

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

// ── Reducer ───────────────────────────────────────────────────────────
function reducer(state: TerminalState, action: TerminalAction): TerminalState {
  switch (action.type) {
    case "PUSH":
      return { ...state, output: [...state.output, action.line] };
    case "CLEAR":
      return { ...state, output: [] };
    case "PUSH_HISTORY":
      return {
        ...state,
        history: [action.cmd, ...state.history].slice(0, 50),
        histIdx: -1,
      };
    case "SET_HIST_IDX":
      return { ...state, histIdx: action.idx };
    default:
      return state;
  }
}

const WELCOME: TerminalLine[] = [
  {
    id: "w1",
    type: "welcome",
    content: "ibrahim@devhms:~$ Portfolio Terminal v1.0",
  },
  {
    id: "w2",
    type: "welcome",
    content: 'Type "help" to see available commands.',
  },
];

const INITIAL: TerminalState = {
  output: WELCOME,
  history: [],
  histIdx: -1,
};

// ── Component ─────────────────────────────────────────────────────────
export default function TerminalEmulator() {
  const [state, dispatch] = useReducer(reducer, INITIAL);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef("");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.output]);

  const runCommand = (raw: string) => {
    const cmd = raw.trim();
    if (!cmd) return;

    dispatch({ type: "PUSH", line: { id: uid(), type: "input", content: `$ ${cmd}` } });
    dispatch({ type: "PUSH_HISTORY", cmd });

    if (cmd === "clear") {
      dispatch({ type: "CLEAR" });
      return;
    }

    const handler = COMMANDS[cmd];
    if (handler) {
      handler().forEach((line) =>
        dispatch({ type: "PUSH", line: { id: uid(), type: "output", content: line } })
      );
    } else {
      dispatch({
        type: "PUSH",
        line: {
          id: uid(),
          type: "error",
          content: `command not found: ${cmd}`,
        },
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      runCommand(valueRef.current);
      if (inputRef.current) inputRef.current.value = "";
      valueRef.current = "";
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const nextIdx = Math.min(state.histIdx + 1, state.history.length - 1);
      dispatch({ type: "SET_HIST_IDX", idx: nextIdx });
      const val = state.history[nextIdx] ?? "";
      if (inputRef.current) inputRef.current.value = val;
      valueRef.current = val;
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const nextIdx = Math.max(state.histIdx - 1, -1);
      dispatch({ type: "SET_HIST_IDX", idx: nextIdx });
      const val = nextIdx === -1 ? "" : (state.history[nextIdx] ?? "");
      if (inputRef.current) inputRef.current.value = val;
      valueRef.current = val;
    }
  };

  const lineColor = (type: TerminalLine["type"]) => {
    if (type === "input") return "var(--acc)";
    if (type === "error") return "var(--red)";
    if (type === "welcome") return "var(--t3)";
    return "var(--t2)";
  };

  return (
    <div className="terminal-wrapper">
      {/* Chrome bar */}
      <div className="terminal-chrome">
        <div className="terminal-dot" style={{ background: "#ff5f57" }} />
        <div className="terminal-dot" style={{ background: "#febc2e" }} />
        <div className="terminal-dot" style={{ background: "#28c840" }} />
        <span
          style={{
            marginLeft: "0.5rem",
            fontSize: "0.75rem",
            color: "var(--t3)",
            fontFamily: "var(--font-geist-mono), monospace",
          }}
        >
          ibrahim@devhms — portfolio
        </span>
      </div>

      {/* Body */}
      <div className="terminal-body" style={{ position: "relative" }}>
        {/* iOS-safe hidden input — covers full terminal area so physical tap triggers keyboard */}
        <input
          ref={inputRef}
          aria-label="Terminal input"
          autoCapitalize="none"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          onChange={(e) => { valueRef.current = e.target.value; }}
          onKeyDown={handleKeyDown}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            opacity: 0,
            zIndex: 10,
            cursor: "text",
            background: "transparent",
            border: "none",
            outline: "none",
          }}
        />

        {/* Output */}
        <div style={{ position: "relative", zIndex: 1 }}>
          {state.output.map((line) => (
            <m.div
              key={line.id}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.12 }}
              style={{
                color: lineColor(line.type),
                lineHeight: 1.6,
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
                paddingBottom: "0.125rem",
              }}
            >
              {line.content}
            </m.div>
          ))}

          {/* Visible prompt row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
              marginTop: "0.25rem",
              color: "var(--acc)",
            }}
          >
            <span>$</span>
            <span
              style={{
                display: "inline-block",
                width: "0.5em",
                height: "1.1em",
                background: "var(--acc)",
                animation: "blink 1.1s step-end infinite",
                verticalAlign: "text-bottom",
              }}
            />
          </div>

          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
}
