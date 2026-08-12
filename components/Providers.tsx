"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";
import { SmoothScroll } from "@/components/SmoothScroll";

/**
 * Client providers wrapping the (server-rendered) page. MotionConfig with
 * reducedMotion="user" makes every Motion animation respect the OS setting.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <SmoothScroll />
      {children}
    </MotionConfig>
  );
}
