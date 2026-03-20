import type { Metadata } from "next";

export const siteMetadata: Metadata = {
  title: {
    default: "Ibrahim Salman — @devhms",
    template: "%s · Ibrahim Salman",
  },
  description:
    "Software Engineering student at UET Taxila. Building Python scrapers, Next.js apps, and local-first LLM tools. Open to internships and freelance work.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ibrahim.dev",
    siteName: "Ibrahim Salman",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@devhms",
  },
  robots: { index: true, follow: true },
};
