"use client";

import AnimationProvider from "./AnimationProvider";
import ThemeProvider from "./ThemeProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AnimationProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </AnimationProvider>
  );
}
