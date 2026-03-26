import type { Metadata, Viewport } from "next";
import { Archivo, Space_Grotesk } from "next/font/google";
const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});
import { Analytics } from "@vercel/analytics/react";
import Providers from "@/components/providers/Providers";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import StatusBar from "@/components/layout/StatusBar";
import { siteMetadata } from "@/lib/metadata";
import "./globals.css";

export const metadata: Metadata = siteMetadata;

export const viewport: Viewport = {
  width:             "device-width",
  initialScale:      1,
  maximumScale:      1,              // iOS zoom prevention (WCAG-safe)
  interactiveWidget: "resizes-content", // Chrome Android shrink-to-fit
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${archivo.variable} ${spaceGrotesk.variable}`}>
      <body className="overflow-x-hidden">
        <Providers>
          <div className="grain" aria-hidden="true" />
          <div className="aurora" aria-hidden="true">
            <div className="aurora-blob" />
            <div className="aurora-blob" />
            <div className="aurora-blob" />
          </div>
          <div className="page-layout" style={{ position: "relative", zIndex: 1 }}>
            <Sidebar />
            <div className="page-content">
              <Topbar />
              <main className="main-content">{children}</main>
            </div>
          </div>
          <StatusBar />
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
