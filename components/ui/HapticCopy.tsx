"use client";

import { useState } from "react";
import { m } from "framer-motion";
import { Copy, Check } from "lucide-react";

interface HapticCopyProps {
  text: string;
  label?: string;
}

export default function HapticCopy({ text, label = "Copy" }: HapticCopyProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (copied) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for older browsers
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <m.button
      onClick={handleCopy}
      className={`haptic-copy-btn${copied ? " copied" : ""}`}
      aria-label={copied ? "Copied!" : label}
      animate={
        copied
          ? { scale: [1, 1.12, 1], rotate: [0, -8, 0] }
          : { scale: 1, rotate: 0 }
      }
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
    >
      {copied ? <Check size={13} strokeWidth={2.5} /> : <Copy size={13} strokeWidth={1.75} />}
      <span>{copied ? "Copied!" : label}</span>
    </m.button>
  );
}
