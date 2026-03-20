"use client";

import { useState } from "react";

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface ProjectTabsProps {
  tabs: Tab[];
}

export default function ProjectTabs({ tabs }: ProjectTabsProps) {
  const [active, setActive] = useState(tabs[0]?.id ?? "");

  return (
    <div>
      <div className="tab-bar" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            onClick={() => setActive(tab.id)}
            className={`tab-btn${active === tab.id ? " active" : ""}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          id={`tabpanel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={tab.id}
          hidden={active !== tab.id}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
