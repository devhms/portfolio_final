"use client";

import { m } from "framer-motion";
import Link from "next/link";

interface JellyButtonProps {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}

export default function JellyButton({ href, children, external = false }: JellyButtonProps) {
  const style = {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.625rem 1.25rem",
    borderRadius: "6px",
    fontSize: "0.8125rem",
    fontFamily: "var(--font-geist-mono), monospace",
    fontWeight: 500,
    textDecoration: "none",
    background: "linear-gradient(135deg, var(--acc), #c8820a)",
    color: "var(--bg)",
    border: "none",
    cursor: "pointer",
    letterSpacing: "0.01em",
  };

  if (external) {
    return (
      <m.a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={style}
        whileHover={{ scale: 1.04, y: -2 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 350, damping: 20 }}
      >
        {children}
      </m.a>
    );
  }

  return (
    <m.div
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 350, damping: 20 }}
      style={{ display: "inline-block" }}
    >
      <Link href={href} style={style}>
        {children}
      </Link>
    </m.div>
  );
}
