"use client";

import { m, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import JellyButton from "@/components/ui/JellyButton";
import { ArrowRight, Github } from "lucide-react";

const HEADLINE_WORDS = ["Software", "that", "ships."];
const CYCLING = ["that matter.", "that ship.", "that scale.", "that inspire."];

export default function HeroSection() {
  // ── Cursor parallax ─────────────────────────────────────────────
  // Called UNCONDITIONALLY (Rules of Hooks)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  const heroRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const activeRef = useRef(true);

  // ── Cycling subheadline ──────────────────────────────────────────
  const [cycleIdx, setCycleIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCycleIdx((i) => (i + 1) % CYCLING.length);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  // ── Parallax setup (matchMedia inside useEffect only) ───────────
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    let isTouch = false;

    // matchMedia check inside useEffect — never at component root
    if (typeof window !== "undefined") {
      isTouch = window.matchMedia("(pointer: coarse)").matches;
    }

    const handleMouse = (e: MouseEvent) => {
      if (!activeRef.current) return;
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      mouseX.set(((e.clientX - cx) / cx) * 18);
      mouseY.set(((e.clientY - cy) / cy) * 12);
    };

    if (!isTouch) {
      window.addEventListener("mousemove", handleMouse);
    }

    // IntersectionObserver pauses when hero off-screen
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        activeRef.current = entry.isIntersecting;
      },
      { threshold: 0.1 }
    );
    observerRef.current.observe(hero);

    return () => {
      if (!isTouch) window.removeEventListener("mousemove", handleMouse);
      observerRef.current?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <m.div
      ref={heroRef}
      style={{ x: springX, y: springY, position: "relative" }}
    >
      {/* Headline */}
      <div
        style={{
          fontSize: "clamp(2rem, 5vw, 3.5rem)",
          fontFamily: "var(--font-geist-mono), monospace",
          fontWeight: 700,
          lineHeight: 1.1,
          marginBottom: "1rem",
          letterSpacing: "-0.02em",
          color: "var(--t1)",
        }}
      >
        {HEADLINE_WORDS.map((word, i) => (
          <m.span
            key={word}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -5, rotate: -1.5 }}
            style={{
              display: "inline-block",
              marginRight: "0.35em",
              cursor: "default",
            }}
          >
            {word}
          </m.span>
        ))}
      </div>

      {/* Cycling sub-headline */}
      <div
        style={{
          height: "2rem",
          overflow: "hidden",
          marginBottom: "2rem",
          position: "relative",
        }}
      >
        <AnimatePresence mode="wait">
          <m.div
            key={cycleIdx}
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -16, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "absolute",
              fontSize: "1rem",
              color: "var(--t2)",
              fontFamily: "var(--font-geist-mono), monospace",
            }}
          >
            {CYCLING[cycleIdx]}
          </m.div>
        </AnimatePresence>
      </div>

      {/* Bio */}
      <m.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.5 }}
        style={{
          color: "var(--t2)",
          fontSize: "0.9375rem",
          lineHeight: 1.7,
          maxWidth: "520px",
          marginBottom: "2rem",
          fontFamily: "var(--font-geist-sans), sans-serif",
        }}
      >
        SE student at UET Taxila. I build Python scrapers, Next.js applications,
        and local-first LLM tools. Open to internships and freelance work.
      </m.p>

      {/* CTAs */}
      <m.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.5 }}
        style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}
      >
        <JellyButton href="/projects">
          View Projects <ArrowRight size={14} />
        </JellyButton>
        <JellyButton href="https://github.com/devhms" external>
          <Github size={14} /> GitHub
        </JellyButton>
      </m.div>
    </m.div>
  );
}
