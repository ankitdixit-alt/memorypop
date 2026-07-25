"use client";

import { useEffect } from "react";
import { initAnalytics } from "@/lib/analytics";
import { initializeGA4 } from "@/lib/analytics-ga4";

/**
 * Analytics Initializer Component
 *
 * Initializes both Mixpanel and GA4 on app mount (client-side only).
 * Called once from root layout.
 *
 * Part of Phase 2C: Analytics Foundation (GA4 added)
 */
export function AnalyticsInitializer() {
  useEffect(() => {
    // Initialize Mixpanel (existing)
    initAnalytics();

    // Initialize GA4 (new - Phase 2C)
    initializeGA4();
  }, []);

  return null;
}
