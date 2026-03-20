import type { Metadata } from "next";
import Badge from "@/components/ui/Badge";
import Callout from "@/components/ui/Callout";
import CodeBlock from "@/components/ui/CodeBlock";
import ProjectTabs from "@/components/ui/ProjectTabs";
import { capitalCode } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Capital Suite",
  description: "Java banking simulation demonstrating OOP patterns: inheritance, command, encapsulation, serialization.",
};

const overview = (
  <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
    <div>
      <div className="section-label">Problem</div>
      <p style={{ fontWeight: 700, color: "var(--t1)", margin: "0 0 0.5rem", fontSize: "0.9375rem" }}>
        OOP concepts taught in isolation don&apos;t stick — you need a domain where inheritance, commands, and
        serialization all arise naturally and necessarily.
      </p>
      <p style={{ color: "var(--t2)", fontSize: "0.875rem", lineHeight: 1.7, margin: 0 }}>
        Banking is that domain. Every pattern has an obvious real-world motivation: accounts differ by behavior
        (inheritance), transactions must be undoable (command), balances must persist (serialization), and
        internal state must be protected (encapsulation).
      </p>
    </div>

    <div>
      <div className="section-label">Architecture</div>
      <Callout label="Key Decision">
        The Command pattern for transactions enables undo — not just a design exercise. Every debit and credit
        is an object that knows how to reverse itself. This is why Command exists.
      </Callout>
      <div className="flow-diagram" style={{ marginTop: "0.875rem" }}>
        {`Account (abstract)
  ├─→ SavingsAccount  interestRate() = 4%
  └─→ CurrentAccount  interestRate() = 1%

interface Command
  ├─→ DepositCmd   { execute(), undo() }
  └─→ WithdrawCmd  { execute(), undo() }

Bank
  ├─→ Map<id, Account>   (encapsulated state)
  ├─→ Deque<Command>     (undo history)
  ├─→ run(cmd)           (execute + push)
  ├─→ undoLast()         (pop + undo)
  └─→ save() / load()    (ObjectOutputStream)`}
      </div>
    </div>

    <div>
      <div className="section-label">Impact / Learnings</div>
      <p style={{ color: "var(--t2)", fontSize: "0.875rem", lineHeight: 1.7, margin: "0 0 0.5rem" }}>
        Crystallized why patterns exist — not as abstractions to memorize, but as solutions to recurring problems
        that appear naturally when you build something real. The undo stack alone justified the entire Command pattern.
      </p>
      <p style={{ color: "var(--t3)", fontSize: "0.875rem", lineHeight: 1.6, margin: 0 }}>
        Would replace Java serialization with JSON (Jackson) — ObjectOutputStream is fragile across versions
        and makes the persistence format opaque.
      </p>
    </div>
  </div>
);

const architecture = (
  <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
    <div>
      <div className="section-label">Pattern Map</div>
      <div className="flow-diagram">
        {`Pattern        | Applied To          | Why
─────────────────────────────────────────────────
Inheritance    | Account hierarchy   | Behavior differs by type
Command        | Transactions        | Undo/redo requirement
Encapsulation  | Bank.accounts       | Prevent external mutation
Serialization  | Bank.save/load()    | Persistent state across runs`}
      </div>
    </div>
  </div>
);

const code = <CodeBlock code={capitalCode} filename="BankingSystem.java" />;

export default function CapitalPage() {
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
              margin: 0,
            }}
          >
            Capital Suite
          </h1>
        </div>
        <Badge status="COMPLETE" />
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
