import type { Metadata } from "next";
import Badge from "@/components/ui/Badge";
import Callout from "@/components/ui/Callout";
import CodeBlock from "@/components/ui/CodeBlock";
import ProjectTabs from "@/components/ui/ProjectTabs";
import { zubanCode } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Zuban",
  description: "Local-first language learning with on-device LLM inference via Ollama — zero API cost, privacy-first.",
};

const overview = (
  <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
    <div>
      <div className="section-label">Problem</div>
      <p style={{ fontWeight: 700, color: "var(--t1)", margin: "0 0 0.5rem", fontSize: "0.9375rem" }}>
        Every language learning app that uses LLMs routes your conversations through a cloud API — you pay per
        token, and your data leaves your device.
      </p>
      <p style={{ color: "var(--t2)", fontSize: "0.875rem", lineHeight: 1.7, margin: 0 }}>
        For learners in Pakistan and other regions with variable internet and real privacy concerns, this model is a
        barrier. زبان (Zuban — Urdu for &quot;tongue&quot;) eliminates it by running inference entirely on-device.
      </p>
    </div>

    <div>
      <div className="section-label">Architecture</div>
      <Callout label="Key Decision">
        Ollama for local inference — not a fine-tuned model, not a serverless edge function.
        The user&apos;s data never touches a third-party server. Per-token cost: zero. Latency: local network only.
      </Callout>
      <div className="flow-diagram" style={{ marginTop: "0.875rem" }}>
        {`User message
  └─→ Next.js API route
      └─→ LangChain ChatOllama
          └─→ Ollama (localhost:11434)
              └─→ llama3.2 (on-device)
                  └─→ Adaptive Urdu/English response
                      └─→ Streamed back to UI`}
      </div>
    </div>

    <div>
      <div className="section-label">Impact / Learnings</div>
      <p style={{ color: "var(--t2)", fontSize: "0.875rem", lineHeight: 1.7, margin: "0 0 0.5rem" }}>
        Ongoing. Already proven that llama3.2 handles Roman Urdu reasonably well without fine-tuning — the
        system prompt alone is enough to get useful adaptive tutoring responses.
      </p>
      <p style={{ color: "var(--t3)", fontSize: "0.875rem", lineHeight: 1.6, margin: 0 }}>
        Would add streaming responses (ReadableStream) next — currently waits for the full generation, which
        makes shorter exercises feel slow.
      </p>
    </div>
  </div>
);

const architecture = (
  <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
    <div>
      <div className="section-label">Stack</div>
      <div className="flow-diagram">
        {`Frontend:   Next.js 15 App Router + Tailwind CSS
API:        /api/chat  (Next.js Route Handler)
LLM Client: LangChain ChatOllama
Runtime:    Ollama 0.x — llama3.2:3b or 8b
Env:        OLLAMA_BASE_URL (default: localhost:11434)`}
      </div>
    </div>
    <div>
      <div className="section-label">System Prompt Strategy</div>
      <div className="flow-diagram">
        {`Role:     Adaptive Urdu tutor
Language: Mix of Roman Urdu + English
Behavior: Assess level from first message
           Correct gently, always encourage
           Keep responses short (tutoring pace)
No fine-tuning needed — prompt engineering only.`}
      </div>
    </div>
  </div>
);

const code = <CodeBlock code={zubanCode} filename="app/api/chat/route.ts" />;

export default function ZubanPage() {
  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "1rem",
          marginBottom: "1.75rem",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.5rem",
              fontFamily: "var(--font-geist-mono), monospace",
              fontWeight: 700,
              color: "var(--t1)",
              margin: "0 0 0.25rem",
            }}
          >
            Zuban
          </h1>
          <div style={{ fontSize: "0.8125rem", color: "var(--t3)" }}>زبان — Language Learning, Local-First</div>
        </div>
        <Badge status="IN PROGRESS" />
      </div>

      <ProjectTabs
        tabs={[
          { id: "overview", label: "Overview", content: overview },
          { id: "architecture", label: "Architecture", content: architecture },
          { id: "code", label: "Code", content: code },
        ]}
      />
    </>
  );
}
