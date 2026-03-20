"use client";

import { useEffect, useState } from "react";

function getPKTTime() {
  return new Date().toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Karachi",
  });
}

export default function StatusBar() {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    setTime(getPKTTime());
    const id = setInterval(() => setTime(getPKTTime()), 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="status-bar" role="status" aria-label="Editor status bar">
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <span>⎇ main</span>
        <span>✓ 0 errors</span>
        <span>Python 3.12</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <span>PKT {time}</span>
        <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
          <span
            style={{
              display: "inline-block",
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--bg)",
              opacity: 0.8,
            }}
          />
          Open to work
        </span>
      </div>
    </div>
  );
}
