import type { Metadata } from "next";
import TerminalEmulator from "@/components/terminal/TerminalEmulator";

export const metadata: Metadata = {
  title: "Terminal",
  description: "Interactive terminal. Try: whoami, ls, git log --oneline -5, cat contact.txt",
};

export default function TerminalPage() {
  return (
    <>
      <div style={{ marginBottom: "1.75rem" }}>
        <h1
          style={{
            fontSize: "1.5rem",
            fontFamily: "var(--font-geist-mono), monospace",
            fontWeight: 700,
            color: "var(--t1)",
            margin: "0 0 0.375rem",
          }}
        >
          Terminal
        </h1>
        <p style={{ color: "var(--t3)", fontSize: "0.8125rem", margin: 0 }}>
          Type <span style={{ color: "var(--acc)" }}>help</span> to see available commands.
          Tap anywhere to focus on mobile.
        </p>
      </div>
      <TerminalEmulator />
    </>
  );
}
