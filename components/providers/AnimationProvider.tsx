"use client";

import { LazyMotion, domAnimation, MotionConfig } from "framer-motion";

export default function AnimationProvider({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation} strict>
        {children}
      </LazyMotion>
    </MotionConfig>
  );
}
