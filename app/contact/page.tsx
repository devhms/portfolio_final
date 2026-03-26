import type { Metadata } from "next";
import HapticCopy from "@/components/ui/HapticCopy";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Ibrahim Salman — open to internships and freelance work.",
};

export default function ContactPage() {
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
          Contact
        </h1>
        <p style={{ color: "var(--t2)", fontSize: "0.9rem", lineHeight: 1.6, margin: 0 }}>
          Open to internships and freelance work. Response within 24h.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: 480 }}>
        {/* Email */}
        <div
          style={{
            background: "var(--bg2)",
            border: "1px solid var(--b1)",
            borderRadius: "12px",
            padding: "1.5rem",
            boxShadow: "var(--shadow-sm)",
            transition: "all 200ms ease",
          }}
          className="bento-card"
        >
          <div className="section-label" style={{ marginBottom: "0.625rem" }}>Email</div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-geist-mono), monospace",
                fontSize: "1rem",
                color: "var(--t1)",
              }}
            >
              ibrahim.pk848@gmail.com
            </span>
            <HapticCopy text="ibrahim.pk848@gmail.com" label="Copy email" />
          </div>
        </div>

        {/* GitHub */}
        <div
          style={{
            background: "var(--bg2)",
            border: "1px solid var(--b1)",
            borderRadius: "12px",
            padding: "1.5rem",
            boxShadow: "var(--shadow-sm)",
            transition: "all 200ms ease",
          }}
          className="bento-card"
        >
          <div className="section-label" style={{ marginBottom: "0.625rem" }}>GitHub</div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            <a
              href="https://github.com/devhms"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: "var(--font-geist-mono), monospace",
                fontSize: "1rem",
                color: "var(--t1)",
                textDecoration: "none",
              }}
            >
              github.com/devhms
            </a>
            <HapticCopy text="https://github.com/devhms" label="Copy URL" />
          </div>
        </div>

        {/* Status */}
        <div
          style={{
            background: "var(--bg2)",
            border: "1px solid var(--b1)",
            borderRadius: "12px",
            padding: "1.5rem",
            boxShadow: "var(--shadow-sm)",
            transition: "all 200ms ease",
          }}
          className="bento-card"
        >
          <div className="section-label" style={{ marginBottom: "0.625rem" }}>Status</div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.625rem",
              fontFamily: "var(--font-geist-mono), monospace",
              fontSize: "0.9rem",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "var(--green)",
                display: "inline-block",
                flexShrink: 0,
              }}
            />
            <span style={{ color: "var(--green)" }}>Open to internships &amp; freelance</span>
          </div>
          <p
            style={{
              color: "var(--t3)",
              fontSize: "0.8125rem",
              lineHeight: 1.6,
              margin: "0.75rem 0 0",
            }}
          >
            UET Taxila, Islamabad — PKT UTC+5.
            Available for remote work globally.
          </p>
        </div>

        {/* Quick note */}
        <div
          style={{
            background: "var(--acc-bg)",
            border: "1px solid var(--acc-b)",
            borderRadius: "12px",
            padding: "1.25rem",
            boxShadow: "var(--shadow-sm)",
            fontSize: "0.8125rem",
            color: "var(--t2)",
            lineHeight: 1.7,
            fontFamily: "var(--font-geist-mono), monospace",
          }}
        >
          <span style={{ color: "var(--acc)" }}>{'// '}</span>
          {' Ship first. Polish after. Own the problem, not the code.'}
        </div>
      </div>
    </>
  );
}
