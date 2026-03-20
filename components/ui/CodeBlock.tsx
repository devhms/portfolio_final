import { highlight } from "sugar-high";
import HapticCopy from "./HapticCopy";

interface CodeBlockProps {
  code: string;
  filename?: string;
  highlightLines?: number[];
}

export default function CodeBlock({ code, filename, highlightLines = [] }: CodeBlockProps) {
const highlighted = highlight(code);
  const highlightStyles = highlightLines.length > 0 ? (
    <style>{`
      ${highlightLines.map(l => `pre code .sh__line:nth-child(${l}) { 
        background: var(--acc-bg); 
        border-left: 2px solid var(--acc); 
      }`).join('\n')}
    `}</style>
  ) : null;

  return (
    <div style={{ position: "relative" }}>
      {highlightStyles}
      {filename && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "var(--bg3)",
            border: "1px solid var(--b1)",
            borderBottom: "none",
            borderRadius: "8px 8px 0 0",
            padding: "0.5rem 1rem",
          }}
        >
          <span
            style={{
              fontSize: "0.75rem",
              color: "var(--t3)",
              fontFamily: "var(--font-geist-mono), monospace",
            }}
          >
            {filename}
          </span>
          <HapticCopy text={code} />
        </div>
      )}
      <pre
        style={{
          borderRadius: filename ? "0 0 8px 8px" : "8px",
          margin: 0,
        }}
      >
        <code dangerouslySetInnerHTML={{ __html: highlighted }} />
      </pre>
      {!filename && (
        <div style={{ position: "absolute", top: "0.75rem", right: "0.75rem" }}>
          <HapticCopy text={code} />
        </div>
      )}
    </div>
  );
}
