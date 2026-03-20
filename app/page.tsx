import type { Metadata } from "next";
import HeroSection from "@/components/home/HeroSection";
import BentoGrid from "@/components/home/BentoGrid";

export const metadata: Metadata = {
  title: "Ibrahim Salman — @devhms",
  description: "SE student at UET Taxila. Building Python scrapers, Next.js apps, and local-first LLM tools.",
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <BentoGrid />
    </>
  );
}
