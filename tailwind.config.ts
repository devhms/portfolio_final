import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        bg2: "var(--bg2)",
        bg3: "var(--bg3)",
        bg4: "var(--bg4)",
        b1: "var(--b1)",
        b2: "var(--b2)",
        t1: "var(--t1)",
        t2: "var(--t2)",
        t3: "var(--t3)",
        acc: "var(--acc)",
        green: "var(--green)",
        amber: "var(--amber)",
        red: "var(--red)",
      },
      fontFamily: {
        mono: ["var(--font-geist-mono)", "monospace"],
        sans: ["var(--font-geist-sans)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
