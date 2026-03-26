import Link from "next/link";
import Badge from "@/components/ui/Badge";
import { projects } from "@/lib/projects";

function BentoCard({
  children,
  href,
  className = "",
}: {
  children: React.ReactNode;
  href?: string;
  className?: string;
}) {
  const style = {
    background: "var(--bg2)",
    border: "1px solid var(--b1)",
    borderRadius: "12px",
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column" as const,
    gap: "1rem",
    transition: "all 200ms ease",
    textDecoration: "none",
    color: "inherit",
    minHeight: 140,
    overflow: "hidden" as const,
    boxShadow: "var(--shadow-sm)",
  };

  if (href) {
    return (
      <Link href={href} style={style} className={`bento-card ${className}`}>
        {children}
      </Link>
    );
  }
  return <div style={style} className={`bento-card ${className}`}>{children}</div>;
}

export default function BentoGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4" style={{ marginTop: "3rem" }}>
      {/* Projects — 2 per row on large */}
      {projects.map((p, i) => (
        <BentoCard key={p.id} href={p.href} className={i < 2 ? "col-span-full md:col-span-6" : "col-span-full md:col-span-4"}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "0.5rem",
            }}
          >
            <h3
              className="bento-title"
              style={{
                fontSize: "1rem",
                fontFamily: "var(--font-archivo), sans-serif",
                fontWeight: 600,
                color: "var(--t1)",
                margin: 0,
              }}
            >
              {p.title}
            </h3>
            <Badge status={p.status} />
          </div>
          <p
            className="bento-desc"
            style={{
              fontSize: "0.875rem",
              color: "var(--t2)",
              lineHeight: 1.6,
              margin: 0,
              flex: 1,
            }}
          >
            {p.tagline}
          </p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.375rem",
            }}
          >
            {p.stack.slice(0, 3).map((tech) => (
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
        </BentoCard>
      ))}

      {/* About card */}
      <BentoCard href="/about" className="col-span-full md:col-span-4">
        <div
          style={{
            fontSize: "0.6875rem",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--t3)",
          }}
        >
          about.ts
        </div>
        <div
          style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: "0.875rem",
            color: "var(--t2)",
            lineHeight: 1.7,
          }}
        >
          <span style={{ color: "var(--t3)" }}>export const </span>
          <span style={{ color: "var(--t1)" }}>ibrahim</span>
          <span style={{ color: "var(--t3)" }}> = {"{"}</span>
          <br />
          <span style={{ color: "var(--t3)", paddingLeft: "1rem" }}>
            status:{" "}
          </span>
          <span style={{ color: "var(--green)" }}>&quot;open-to-work&quot;</span>
          <br />
          <span style={{ color: "var(--t3)" }}>{"}"}</span>
        </div>
      </BentoCard>

      {/* Terminal card */}
      <BentoCard href="/terminal" className="col-span-full md:col-span-4">
        <div
          style={{
            fontSize: "0.6875rem",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--t3)",
          }}
        >
          Terminal
        </div>
        <div
          style={{
            fontFamily: "var(--font-geist-mono), monospace",
            fontSize: "0.8125rem",
            color: "var(--t2)",
            lineHeight: 1.7,
          }}
        >
          <span style={{ color: "var(--acc)" }}>$ </span>
          <span style={{ color: "var(--t1)" }}>whoami</span>
          <br />
          <span>Ibrahim Salman — open to work</span>
        </div>
      </BentoCard>

      {/* Philosophy card */}
      <BentoCard className="col-span-full md:col-span-4">
        <div
          style={{
            fontSize: "0.6875rem",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--t3)",
          }}
        >
          Philosophy
        </div>
        <blockquote
          style={{
            fontFamily: "var(--font-geist-mono), monospace",
            fontSize: "0.875rem",
            color: "var(--t1)",
            lineHeight: 1.6,
            margin: 0,
            borderLeft: "2px solid var(--acc)",
            paddingLeft: "0.75rem",
          }}
        >
          &quot;Discipline equals freedom.&quot;
        </blockquote>
        <p style={{ fontSize: "0.75rem", color: "var(--t3)", margin: 0 }}>
          Ship first. Polish after.
        </p>
      </BentoCard>
    </div>
  );
}
