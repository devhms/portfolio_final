import type { Metadata } from "next";
import Badge from "@/components/ui/Badge";
import Callout from "@/components/ui/Callout";
import CodeBlock from "@/components/ui/CodeBlock";
import ProjectTabs from "@/components/ui/ProjectTabs";
import { blastCode } from "@/lib/projects";

export const metadata: Metadata = {
  title: "B.L.A.S.T.",
  description: "Batch Linked Automated Stock Tracker — multi-source PSX ingestion piped directly to Google Sheets.",
};

const overview = (
  <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
    <div>
      <div className="section-label">Problem</div>
      <p style={{ fontWeight: 700, color: "var(--t1)", margin: "0 0 0.5rem", fontSize: "0.9375rem" }}>
        PSX has no clean public API — analysts copy-pasted data from multiple sources every single day.
      </p>
      <p style={{ color: "var(--t2)", fontSize: "0.875rem", lineHeight: 1.7, margin: 0 }}>
        Stock analysts at small firms track Pakistan Stock Exchange equities manually. Every morning means opening
        three or four browser tabs, copying numbers into a spreadsheet, and hoping nothing was transposed.
        It was slow, error-prone, and deeply unnecessary.
      </p>
    </div>

    <div>
      <div className="section-label">Architecture</div>
      <Callout label="Key Decision">
        Chose Google Sheets as the output target — not a database, not a dashboard. Analysts already
        live in Sheets. The right output is the one people actually open.
      </Callout>
      <div className="flow-diagram" style={{ marginTop: "0.875rem" }}>
        {`PSX sources
  └─→ fetch(url)         # requests, 10s timeout
      └─→ parse(soup)    # BeautifulSoup4 selectors
          └─→ transform() # pandas: normalize, sort, calc %Δ
              └─→ sync_to_sheets()  # gspread + OAuth2 SA
                  └─→ ✓ Live data in Sheets`}
      </div>
    </div>

    <div>
      <div className="section-label">Impact / Learnings</div>
      <p style={{ color: "var(--t2)", fontSize: "0.875rem", lineHeight: 1.7, margin: "0 0 0.5rem" }}>
        Proved that the most useful tool is the one that fits into an existing workflow without friction.
        Analysts adopted it immediately because it wrote to the file they already had open.
      </p>
      <p style={{ color: "var(--t3)", fontSize: "0.875rem", lineHeight: 1.6, margin: 0 }}>
        Next time: add exponential backoff for rate limits and cache parsed rows to skip redundant fetches
        on re-runs within the same session.
      </p>
    </div>
  </div>
);

const architecture = (
  <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
    <div>
      <div className="section-label">Data Model</div>
      <div className="flow-diagram">
        {`@dataclass StockRow
  symbol:    str    # ticker e.g. "OGDC"
  price:     float  # PKR
  change:    float  # absolute Δ from prev close
  volume:    int    # shares traded

Derived in transform():
  change_pct = (change / price * 100).round(2)`}
      </div>
    </div>

    <div>
      <div className="section-label">Auth Flow</div>
      <div className="flow-diagram">
        {`service_account.json (OAuth2 SA key)
  └─→ Credentials.from_service_account_file()
      └─→ gspread.authorize(creds)
          └─→ gc.open_by_key(SHEET_ID).sheet1
              ├─→ ws.clear()
              └─→ ws.update([headers] + rows)`}
      </div>
    </div>
  </div>
);

const code = <CodeBlock code={blastCode} filename="blast.py" highlightLines={[4, 22]} />;

export default function BlastPage() {
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
            B.L.A.S.T.
          </h1>
          <div style={{ fontSize: "0.8125rem", color: "var(--t3)" }}>
            Batch Linked Automated Stock Tracker
          </div>
        </div>
        <Badge status="LIVE" />
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
