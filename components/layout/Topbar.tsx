"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import BreadcrumbNav from "@/components/ui/BreadcrumbNav";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 6,
          background: "var(--bg3)",
        }}
      />
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
      style={{
        width: 34,
        height: 34,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg3)",
        border: "1px solid var(--b1)",
        borderRadius: "8px",
        color: "var(--t2)",
        cursor: "pointer",
        transition: "all 200ms ease",
      }}
    >
      {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}

export default function Topbar() {
  return (
    <header
      style={{
        height: 56,
        borderBottom: "1px solid var(--b1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 1.5rem",
        background: "var(--bg2)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <BreadcrumbNav />
      <ThemeToggle />
    </header>
  );
}
