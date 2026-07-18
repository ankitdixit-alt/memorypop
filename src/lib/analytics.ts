// /src/lib/analytics.ts
// Analytics Foundation Phase 1
// GDPR-compliant analytics with cookie consent

import mixpanel from 'mixpanel-browser';

// Initialize Mixpanel
const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
let isInitialized = false;

/**
 * Initialize Mixpanel analytics
 * Called once when consent is granted
 */
export function initializeAnalytics(): void {
  if (!MIXPANEL_TOKEN) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Analytics] Mixpanel token not found');
    }
    return;
  }

  if (isInitialized) {
    return;
  }

  try {
    mixpanel.init(MIXPANEL_TOKEN, {
      debug: process.env.NODE_ENV === 'development',
      track_pageview: false, // We'll track manually
      persistence: 'localStorage',
    });
    isInitialized = true;

    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] Mixpanel initialized');
    }
  } catch (error) {
    console.error('[Analytics] Failed to initialize Mixpanel:', error);
  }
}

/**
 * Check if user has granted analytics consent
 */
function hasConsent(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const consent = localStorage.getItem('analytics_consent');
  return consent === 'granted';
}

/**
 * Track an analytics event
 *
 * @param eventName - Name of the event (e.g., 'homepage_viewed')
 * @param properties - Optional event properties
 */
export function trackEvent(
  eventName: string,
  properties?: Record<string, unknown>
): void {
  // Check consent first
  if (!hasConsent()) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics] Event blocked (no consent): ${eventName}`, properties);
    }
    return;
  }

  // Initialize if not already done
  if (!isInitialized) {
    initializeAnalytics();
  }

  // Track event
  try {
    const eventData = {
      ...properties,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    };

    mixpanel.track(eventName, eventData);

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics] Event tracked: ${eventName}`, eventData);
    }
  } catch (error) {
    // Silent failure - don't break user experience for analytics
    console.error('[Analytics] Failed to track event:', error);
  }
}

/**
 * Grant analytics consent and initialize tracking
 */
export function grantConsent(): void {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem('analytics_consent', 'granted');
  initializeAnalytics();

  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics] Consent granted');
  }
}

/**
 * Revoke analytics consent and stop tracking
 */
export function revokeConsent(): void {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem('analytics_consent', 'revoked');

  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics] Consent revoked');
  }
}

/**
 * Check if consent banner should be shown
 * (Returns true if user hasn't made a choice yet)
 */
export function shouldShowConsentBanner(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const consent = localStorage.getItem('analytics_consent');
  return consent === null;
}

// Backwards compatibility alias for AnalyticsInitializer component
export const initAnalytics = initializeAnalytics;
