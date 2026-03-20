import type { Metadata } from "next";
import Badge from "@/components/ui/Badge";
import Callout from "@/components/ui/Callout";
import CodeBlock from "@/components/ui/CodeBlock";
import ProjectTabs from "@/components/ui/ProjectTabs";
import { dawnCode } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Dawn Scraper",
  description: "NLP-ready Dawn News article scraper — title, body, author, date, category as clean JSON.",
};

const overview = (
  <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
    <div>
      <div className="section-label">Problem</div>
      <p style={{ fontWeight: 700, color: "var(--t1)", margin: "0 0 0.5rem", fontSize: "0.9375rem" }}>
        There is no programmatic API for Dawn News — the largest English-language newspaper in Pakistan.
      </p>
      <p style={{ color: "var(--t2)", fontSize: "0.875rem", lineHeight: 1.7, margin: 0 }}>
        Anyone building NLP pipelines on Pakistani news data — sentiment models, topic classifiers, summarizers — has
        no clean data source. They either scrape badly or give up. This tool removes that friction entirely.
      </p>
    </div>

    <div>
      <div className="section-label">Architecture</div>
      <Callout label="Key Decision">
        Used Python dataclasses for the output schema, not dicts. This enforces field presence at parse-time,
        not at analysis-time — bugs appear immediately rather than silently corrupting downstream models.
      </Callout>
      <div className="flow-diagram" style={{ marginTop: "0.875rem" }}>
        {`dawn.com/{section}/
  └─→ index parse    # article link discovery
      └─→ fetch(url) # per-article request
          └─→ parse  # BeautifulSoup4 selectors
              └─→ @dataclass Article {
                    title, body, author,
                    date, category, url, word_count
                  }
                  └─→ json.dump() → NLP-ready file`}
      </div>
    </div>

    <div>
      <div className="section-label">Impact / Learnings</div>
      <p style={{ color: "var(--t2)", fontSize: "0.875rem", lineHeight: 1.7, margin: "0 0 0.5rem" }}>
        Demonstrated that clean data engineering upstream makes every downstream task trivial.
        The word_count field alone saves a re-read of the body for any length-filtering step.
      </p>
      <p style={{ color: "var(--t3)", fontSize: "0.875rem", lineHeight: 1.6, margin: 0 }}>
        Would add async fetching with aiohttp for the next version — sequential requests are the
        bottleneck at scale, and a 10x speed gain is straightforward.
      </p>
    </div>
  </div>
);

const architecture = (
  <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
    <div>
      <div className="section-label">Output Schema</div>
      <div className="flow-diagram">
        {`@dataclass Article:
  title:      str       # headline
  body:       str       # full article text, space-joined
  author:     str       # byline
  date:       str       # ISO 8601 from <time datetime="">
  category:   str       # section e.g. "Pakistan", "Business"
  url:        str       # canonical URL
  word_count: int       # len(body.split())

Output: JSON array, UTF-8, indent=2
No post-processing needed for standard NLP libs.`}
      </div>
    </div>

    <div>
      <div className="section-label">Selector Map</div>
      <div className="flow-diagram">
        {`h1.story__title          → title
.story__byline a          → author (primary)
.story__author            → author (fallback)
time[datetime]            → date
.story__category          → category
div.story__content p      → body paragraphs`}
      </div>
    </div>
  </div>
);

const code = <CodeBlock code={dawnCode} filename="dawn_scraper.py" />;

export default function DawnPage() {
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
            Dawn Scraper
          </h1>
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
