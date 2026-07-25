/**
 * Google Analytics 4 (GA4) Integration
 *
 * Provides event tracking for organic acquisition and conversion measurement.
 * Works alongside existing Mixpanel analytics (dual tracking).
 *
 * Part of Phase 2C: Analytics Foundation
 */

// GA4 Configuration
const GA4_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
let isGA4Initialized = false;

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
 * Initialize Google Analytics 4
 * Called once when consent is granted
 */
export function initializeGA4(): void {
  if (!GA4_MEASUREMENT_ID) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[GA4] Measurement ID not found');
    }
    return;
  }

  if (isGA4Initialized) {
    return;
  }

  if (!hasConsent()) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[GA4] Initialization blocked (no consent)');
    }
    return;
  }

  try {
    // Load GA4 script
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`;
    script.async = true;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: unknown[]) {
      window.dataLayer.push(args);
    }
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', GA4_MEASUREMENT_ID, {
      send_page_view: false, // We'll track page views manually
    });

    isGA4Initialized = true;

    if (process.env.NODE_ENV === 'development') {
      console.log('[GA4] Initialized with ID:', GA4_MEASUREMENT_ID);
    }
  } catch (error) {
    console.error('[GA4] Failed to initialize:', error);
  }
}

/**
 * Track a GA4 event
 *
 * @param eventName - Name of the event
 * @param parameters - Event parameters
 */
function trackGA4Event(eventName: string, parameters?: Record<string, unknown>): void {
  if (!hasConsent()) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[GA4] Event blocked (no consent): ${eventName}`, parameters);
    }
    return;
  }

  if (!isGA4Initialized) {
    initializeGA4();
  }

  try {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, parameters);

      if (process.env.NODE_ENV === 'development') {
        console.log(`[GA4] Event tracked: ${eventName}`, parameters);
      }
    }
  } catch (error) {
    console.error('[GA4] Failed to track event:', error);
  }
}

/**
 * Event 1: Homepage Viewed
 *
 * Tracks when a user visits the homepage.
 * Used to measure top-of-funnel traffic and organic acquisition.
 */
export function trackHomepageViewed(): void {
  trackGA4Event('homepage_viewed', {
    page_title: 'MemoryPop - Create Beautiful Online Memory Books',
    page_location: window.location.href,
  });
}

/**
 * Event 2: Landing Page Viewed
 *
 * Tracks when a user visits an occasion-specific landing page.
 * Critical for measuring organic acquisition from SEO.
 *
 * @param occasion - Occasion name (e.g., "birthday", "retirement", "farewell")
 * @param source - Traffic source (e.g., "organic", "direct", "referral")
 */
export function trackLandingPageViewed(
  occasion: string,
  source: string = 'direct'
): void {
  trackGA4Event('landing_page_viewed', {
    occasion,
    source,
    page_title: `${occasion} Memory Book`,
    page_location: window.location.href,
  });
}

/**
 * Event 3: Create Started
 *
 * Tracks when a user begins creating a MemoryPop.
 * Includes source attribution to understand conversion paths.
 *
 * @param source - Traffic source (e.g., "homepage", "landing_page_birthday", "direct")
 * @param occasion - Selected occasion (optional)
 */
export function trackCreateStarted(
  source: string = 'direct',
  occasion?: string
): void {
  trackGA4Event('create_started', {
    source,
    occasion: occasion || 'not_selected',
    page_location: window.location.href,
  });
}

/**
 * Event 4: Create Completed
 *
 * Tracks when a user successfully creates a MemoryPop.
 * This is the primary conversion event.
 *
 * @param shareCode - Unique share code for the MemoryPop
 * @param occasion - Selected occasion
 * @param fromLandingPage - Whether user came from a landing page
 */
export function trackCreateCompleted(
  shareCode: string,
  occasion: string,
  fromLandingPage: boolean = false
): void {
  trackGA4Event('create_completed', {
    share_code: shareCode,
    occasion,
    from_landing_page: fromLandingPage,
    conversion: true,
  });
}

/**
 * Event 5: MemoryPop Shared
 *
 * Tracks when a creator shares their MemoryPop.
 * Measures viral coefficient and sharing behavior.
 *
 * @param shareCode - Unique share code for the MemoryPop
 * @param method - Share method (e.g., "link", "email", "whatsapp")
 */
export function trackMemoryPopShared(
  shareCode: string,
  method: string = 'link'
): void {
  trackGA4Event('memorypop_shared', {
    share_code: shareCode,
    share_method: method,
  });
}

// TypeScript declarations for gtag
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}
