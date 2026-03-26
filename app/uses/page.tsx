import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Uses",
  description: "The stack, tools, and hardware Ibrahim Salman uses daily.",
};

const sections = [
  {
    label: "Languages",
    items: [
      { name: "Python 3.12", note: "Primary language — scripting, data, APIs" },
      { name: "TypeScript", note: "Strict mode. Zero any types." },
      { name: "Java 21", note: "OOP coursework + patterns" },
      { name: "SQL", note: "Postgres + SQLite for local data" },
    ],
  },
  {
    label: "Frontend",
    items: [
      { name: "Next.js 15", note: "App Router, RSC, Turbopack" },
      { name: "Tailwind CSS v3", note: "Utility-first + CSS custom properties" },
      { name: "Framer Motion", note: "LazyMotion + MotionConfig reducedMotion" },
    ],
  },
  {
    label: "AI / LLM",
    items: [
      { name: "Ollama", note: "Local inference — llama3.2, mistral" },
      { name: "LangChain", note: "Chain abstraction for Zuban" },
    ],
  },
  {
    label: "Data",
    items: [
      { name: "pandas", note: "Transform + normalize scraped data" },
      { name: "BeautifulSoup4", note: "HTML parsing for PSX and Dawn" },
      { name: "gspread", note: "Google Sheets API Python client" },
    ],
  },
  {
    label: "Tooling",
    items: [
      { name: "VS Code", note: "Primary editor" },
      { name: "Git + GitHub", note: "@devhms" },
      { name: "Vercel", note: "Deploy target for Next.js projects" },
      { name: "ESLint + Prettier", note: "Zero config disagreements" },
    ],
  },
];

export default function UsesPage() {
  return (
    <>
      <div style={{ marginBottom: "2.5rem" }}>
        <h1
          style={{
            fontSize: "1.5rem",
            fontFamily: "var(--font-geist-mono), monospace",
            fontWeight: 700,
            color: "var(--t1)",
            margin: "0 0 0.5rem",
          }}
        >
          Uses
        </h1>
        <p style={{ color: "var(--t2)", fontSize: "0.9rem", lineHeight: 1.6, margin: 0 }}>
          The tools I reach for daily. Chosen for reliability, not hype.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        {sections.map((section) => (
          <div key={section.label}>
            <div className="section-label">{section.label}</div>
            <div
              style={{
                background: "var(--bg2)",
                border: "1px solid var(--b1)",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              {section.items.map((item, i) => (
                <div
                  key={item.name}
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                    gap: "1rem",
                    padding: "0.75rem 1rem",
                    borderBottom:
                      i < section.items.length - 1 ? "1px solid var(--b1)" : "none",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-geist-mono), monospace",
                      fontSize: "0.875rem",
                      color: "var(--t1)",
                      flexShrink: 0,
                    }}
                  >
                    {item.name}
                  </span>
                  <span
                    style={{
                      fontSize: "0.8125rem",
                      color: "var(--t3)",
                      textAlign: "right",
                    }}
                  >
                    {item.note}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
