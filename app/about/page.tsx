import type { Metadata } from "next";
import { highlight } from "sugar-high";

export const metadata: Metadata = {
  title: "about.ts",
  description: "Ibrahim Salman — exported as a TypeScript module.",
};

const SOURCE = `// about.ts — export me like a module
// Last updated: March 2026

export const ibrahim = {
  name:        "Ibrahim Salman",
  handle:      "@devhms",
  location:    "Islamabad, PK",   // UTC+5
  university:  "UET Taxila",
  semester:    2,
  stack: ["Python","Next.js","TypeScript","LangChain","Java"],
  values: {
    philosophy: "Discipline equals freedom",
    approach:   "Ship first. Polish after.",
  },
  contact: {
    email:  "ibrahim.pk848@gmail.com",
    status: "open-to-work" as const
  }
} satisfies Developer`;

export default function AboutPage() {
  const highlighted = highlight(SOURCE);
  const HIGHLIGHTED_LINES = [4, 22];

  // Cursor and line highlight logic — no runtime string manipulation
  const highlightStyles = (
    <style>{`
      ${HIGHLIGHTED_LINES.map(l => `pre code .sh__line:nth-child(${l}) { 
        background: var(--acc-bg); 
        border-left: 2px solid var(--acc); 
      }`).join('\n')}
      /* Position cursor at the end of the last line */
      pre code .sh__line:last-child { display: inline; }
    `}</style>
  );

  return (
    <>
      {highlightStyles}
      <div style={{ marginBottom: "1.75rem" }}>
        <h1
          style={{
            fontSize: "1.25rem",
            fontFamily: "var(--font-geist-mono), monospace",
            fontWeight: 700,
            color: "var(--t1)",
            margin: "0 0 0.375rem",
          }}
        >
          about.ts
        </h1>
        <p style={{ color: "var(--t3)", fontSize: "0.8125rem", margin: 0 }}>
          An honest export. Check the types.
        </p>
      </div>

      <div
        style={{
          background: "var(--bg2)",
          border: "1px solid var(--b1)",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        {/* File tab chrome */}
        <div
          style={{
            background: "var(--bg3)",
            borderBottom: "1px solid var(--b1)",
            padding: "0.5rem 1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <div style={{ display: "flex", gap: "0.375rem" }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57" }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e" }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840" }} />
          </div>
          <span
            style={{
              fontSize: "0.75rem",
              color: "var(--t3)",
              fontFamily: "var(--font-geist-mono), monospace",
            }}
          >
            about.ts
          </span>
        </div>

        <pre style={{ margin: 0, borderRadius: 0, border: "none" }}>
          <code dangerouslySetInnerHTML={{ __html: highlighted }} />
          {/* Blinking amber cursor — SIBLING SPAN, outside the dangerouslySetInnerHTML div */}
          <span
            className="blink-cursor"
            aria-hidden="true"
            style={{ marginLeft: "0.125rem" }}
          />
        </pre>
      </div>

      {/* Metadata footer */}
      <div
        style={{
          marginTop: "1.5rem",
          padding: "1rem",
          background: "var(--bg2)",
          border: "1px solid var(--b1)",
          borderRadius: "12px",
          boxShadow: "var(--shadow-sm)",
          fontSize: "0.8125rem",
          fontFamily: "var(--font-geist-mono), monospace",
          color: "var(--t2)",
          display: "flex",
          flexWrap: "wrap",
          gap: "1.5rem",
        }}
      >
        <span>
          <span style={{ color: "var(--t3)" }}>roll: </span>25-SE-33
        </span>
        <span>
          <span style={{ color: "var(--t3)" }}>semester: </span>2 of 8
        </span>
        <span>
          <span style={{ color: "var(--t3)" }}>timezone: </span>UTC+5 (PKT)
        </span>
        <span style={{ color: "var(--green)" }}>
          ● status: open-to-work
        </span>
      </div>
    </>
  );
}
