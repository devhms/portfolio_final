interface CalloutProps {
  children: React.ReactNode;
  variant?: "amber" | "green";
  label?: string;
}

export default function Callout({ children, variant = "amber", label }: CalloutProps) {
  return (
    <div className={variant === "green" ? "callout callout-green" : "callout"}>
      {label && (
        <div
          style={{
            fontSize: "0.6875rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: variant === "green" ? "var(--green)" : "var(--acc)",
            marginBottom: "0.375rem",
            fontWeight: 600,
          }}
        >
          {label}
        </div>
      )}
      {children}
    </div>
  );
}
