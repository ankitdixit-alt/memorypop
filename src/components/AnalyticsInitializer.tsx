"use client";

import { useEffect } from "react";
import { initAnalytics } from "@/lib/analytics";

/**
 * Analytics Initializer Component
 *
 * Initializes Mixpanel on app mount (client-side only).
 * Called once from root layout.
 */
export function AnalyticsInitializer() {
  useEffect(() => {
    initAnalytics();
  }, []);

  return null;
}
