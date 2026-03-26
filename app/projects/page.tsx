import type { Metadata } from "next";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import { projects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Projects",
  description: "Real Python and TypeScript projects by Ibrahim Salman — scraping, data pipelines, and local LLM tools.",
};

export default function ProjectsPage() {
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
          Projects
        </h1>
        <p style={{ color: "var(--t2)", fontSize: "0.9rem", lineHeight: 1.6, margin: 0 }}>
          Real things built to solve real problems.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {projects.map((p) => (
          <Link
            key={p.id}
            href={p.href}
            style={{
              display: "block",
              background: "var(--bg2)",
              border: "1px solid var(--b1)",
              borderRadius: "12px",
              padding: "1.5rem",
              textDecoration: "none",
              color: "inherit",
              transition: "all 200ms ease",
              boxShadow: "var(--shadow-sm)",
            }}
            className="bento-card"
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "0.75rem",
                marginBottom: "0.5rem",
                flexWrap: "wrap",
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: "1rem",
                    fontFamily: "var(--font-geist-mono), monospace",
                    fontWeight: 600,
                    color: "var(--t1)",
                    margin: "0 0 0.125rem",
                  }}
                >
                  {p.title}
                </h2>
                {p.fullTitle && (
                  <div style={{ fontSize: "0.75rem", color: "var(--t3)" }}>{p.fullTitle}</div>
                )}
              </div>
              <Badge status={p.status} />
            </div>
            <p style={{ fontSize: "0.875rem", color: "var(--t2)", lineHeight: 1.6, margin: "0 0 0.75rem" }}>
              {p.tagline}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
              {p.stack.map((tech) => (
                <span
                  key={tech}
                  className="bento-tag"
                  style={{
                    fontSize: "0.6875rem",
                    color: "var(--t3)",
                    background: "var(--bg3)",
                    border: "1px solid var(--b1)",
                    borderRadius: "3px",
                    padding: "0.125rem 0.5rem",
                    fontFamily: "var(--font-geist-mono), monospace",
                  }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
