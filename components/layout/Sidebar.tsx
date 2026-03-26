"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Home,
  FolderOpen,
  User,
  Wrench,
  Terminal,
  Mail,
  Menu,
  X,
  Zap,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/projects", label: "Projects", icon: FolderOpen },
  { href: "/about", label: "about.ts", icon: User },
  { href: "/uses", label: "Uses", icon: Wrench },
  { href: "/terminal", label: "Terminal", icon: Terminal },
  { href: "/contact", label: "Contact", icon: Mail },
];

function NavLink({
  href,
  label,
  Icon,
  active,
  onClick,
}: {
  href: string;
  label: string;
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.625rem",
        padding: "0.5rem 0.875rem",
        borderRadius: "6px",
        fontSize: "0.8125rem",
        fontFamily: "var(--font-geist-mono), monospace",
        color: active ? "var(--color-primary)" : "var(--t2)",
        background: active ? "var(--acc-bg)" : "transparent",
        borderLeft: active ? "3px solid var(--color-primary)" : "3px solid transparent",
        textDecoration: "none",
        transition: "all 0.15s ease",
        marginBottom: "2px",
      }}
    >
      <Icon size={15} strokeWidth={1.75} />
      <span className="sidebar-label">{label}</span>
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
        style={{
          display: "none",
          position: "fixed",
          top: "0.75rem",
          left: "0.75rem",
          zIndex: 300,
          background: "var(--bg3)",
          border: "1px solid var(--b1)",
          borderRadius: "6px",
          padding: "0.375rem",
          color: "var(--t1)",
          cursor: "pointer",
        }}
        className="mobile-menu-btn"
      >
        <Menu size={18} />
      </button>

      <style>{`
        @media (max-width: 767px) {
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>

      {/* Sidebar */}
      <nav
        className={`sidebar${open ? " open" : ""}`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div
          style={{
            padding: "1.25rem 0.875rem 0.75rem",
            borderBottom: "1px solid var(--b1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link
            href="/"
            style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem" }}
            onClick={() => setOpen(false)}
          >
            <div
              style={{
                width: 28,
                height: 28,
                background: "var(--acc)",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Zap size={15} color="var(--bg)" strokeWidth={2.5} />
            </div>
            <div className="sidebar-title">
              <div
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "var(--t1)",
                  fontFamily: "var(--font-archivo), sans-serif",
                  lineHeight: 1.2,
                }}
              >
                @devhms
              </div>
              <div style={{ fontSize: "0.6875rem", color: "var(--t3)" }}>Ibrahim Salman</div>
            </div>
          </Link>
          {open && (
            <button
              onClick={() => setOpen(false)}
              aria-label="Close navigation"
              style={{
                background: "none",
                border: "none",
                color: "var(--t2)",
                cursor: "pointer",
                padding: "0.25rem",
              }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        <div style={{ flex: 1, padding: "0.75rem 0.5rem", overflowY: "auto" }}>
          <div style={{ marginBottom: "0.375rem" }}>
            <div
              className="section-label"
              style={{ padding: "0 0.375rem", marginBottom: "0.375rem" }}
            >
              Navigation
            </div>
            {navItems.map(({ href, label, icon: Icon }) => (
              <NavLink
                key={href}
                href={href}
                label={label}
                Icon={Icon}
                active={isActive(href)}
                onClick={() => setOpen(false)}
              />
            ))}
          </div>
        </div>

        <div
          style={{
            padding: "0.75rem 0.875rem",
            borderTop: "1px solid var(--b1)",
            fontSize: "0.6875rem",
            color: "var(--t3)",
            fontFamily: "var(--font-geist-mono), monospace",
          }}
        >
          <div style={{ marginBottom: "0.25rem" }}>UET Taxila · SE Sem 2</div>
          <div style={{ color: "var(--green)", display: "flex", alignItems: "center", gap: "0.375rem" }}>
            <span
              style={{
                display: "inline-block",
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--green)",
              }}
            />
            Open to work
          </div>
        </div>
      </nav>

      {/* Mobile backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 199,
          }}
        />
      )}
    </>
  );
}
