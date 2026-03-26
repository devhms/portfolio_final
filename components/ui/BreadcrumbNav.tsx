"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export default function BreadcrumbNav() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  
  const crumbs = [
    { label: "~", href: "/" },
    ...segments.map((seg, i) => ({
      label: seg.charAt(0).toUpperCase() + seg.slice(1),
      href: "/" + segments.slice(0, i + 1).join("/"),
    })),
  ];

  return (
    <nav aria-label="Breadcrumb" style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
      {crumbs.map((crumb, i) => (
        <span key={crumb.href} style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
          {i > 0 && (
            <span
              style={{
                color: "var(--t3)",
                fontSize: "0.75rem",
                fontFamily: "var(--font-space-grotesk), sans-serif",
              }}
            >
              /
            </span>
          )}
          <Link
            href={crumb.href}
            style={{
              fontSize: "0.8125rem",
              fontFamily: "var(--font-space-grotesk), sans-serif",
              color: i === crumbs.length - 1 ? "var(--acc)" : "var(--t2)",
              textDecoration: "none",
              transition: "color 0.15s",
            }}
          >
            {crumb.label}
          </Link>
        </span>
      ))}
    </nav>
  );
}
