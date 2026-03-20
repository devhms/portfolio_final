import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/react";
import Providers from "@/components/providers/Providers";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import StatusBar from "@/components/layout/StatusBar";
import { siteMetadata } from "@/lib/metadata";
import "./globals.css";

export const metadata: Metadata = siteMetadata;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
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
