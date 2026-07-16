/**
 * MemoryPop Analytics Foundation
 *
 * Privacy-first product analytics using Mixpanel.
 * Tracks user behavior to enable data-driven product decisions.
 *
 * Quick Win Implementation (Analytics Foundation)
 */

// Mixpanel types (lightweight, no SDK needed for basic tracking)
interface MixpanelInstance {
  init: (token: string, config?: any) => void;
  track: (eventName: string, properties?: any) => void;
  identify: (userId: string) => void;
  register: (properties: any) => void;
}

declare global {
  interface Window {
    mixpanel?: MixpanelInstance;
  }
}

/**
 * Get or create anonymous user ID
 * Stored in localStorage for session persistence
 */
function getAnonymousUserId(): string {
  if (typeof window === 'undefined') return 'server';

  const STORAGE_KEY = 'memorypop_user_id';
  let userId = localStorage.getItem(STORAGE_KEY);

  if (!userId) {
    // Generate anonymous UUID
    userId = `anon_${Math.random().toString(36).substring(2, 11)}`;
    localStorage.setItem(STORAGE_KEY, userId);
  }

  return userId;
}

/**
 * Get session ID
 * Resets after 30 minutes of inactivity
 */
function getSessionId(): string {
  if (typeof window === 'undefined') return 'server';

  const STORAGE_KEY = 'memorypop_session_id';
  const EXPIRY_KEY = 'memorypop_session_expiry';
  const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes

  const now = Date.now();
  const expiry = localStorage.getItem(EXPIRY_KEY);

  if (expiry && parseInt(expiry) > now) {
    // Session still valid, extend it
    localStorage.setItem(EXPIRY_KEY, (now + SESSION_DURATION).toString());
    return localStorage.getItem(STORAGE_KEY) || createNewSession();
  }

  // Create new session
  return createNewSession();

  function createNewSession(): string {
    const sessionId = `sess_${Math.random().toString(36).substring(2, 11)}`;
    localStorage.setItem(STORAGE_KEY, sessionId);
    localStorage.setItem(EXPIRY_KEY, (now + SESSION_DURATION).toString());
    return sessionId;
  }
}

/**
 * Get device type from viewport width
 */
function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';

  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

/**
 * Get browser name from user agent
 */
function getBrowser(): string {
  if (typeof window === 'undefined') return 'unknown';

  const ua = navigator.userAgent;
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Edge')) return 'Edge';
  return 'Other';
}

/**
 * Get operating system from user agent
 */
function getOS(): string {
  if (typeof window === 'undefined') return 'unknown';

  const ua = navigator.userAgent;
  if (ua.includes('Win')) return 'Windows';
  if (ua.includes('Mac')) return 'macOS';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  return 'Other';
}

/**
 * Get common properties auto-injected into every event
 */
function getCommonProperties() {
  if (typeof window === 'undefined') {
    return {
      user_id: 'server',
      session_id: 'server',
      timestamp: new Date().toISOString(),
      page_url: 'server',
      page_path: 'server',
      referrer: null,
      device_type: 'desktop' as const,
      browser: 'unknown',
      os: 'unknown',
      app_version: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || '1.0.0',
    };
  }

  return {
    user_id: getAnonymousUserId(),
    session_id: getSessionId(),
    timestamp: new Date().toISOString(),
    page_url: window.location.href,
    page_path: window.location.pathname,
    referrer: document.referrer || null,
    device_type: getDeviceType(),
    browser: getBrowser(),
    os: getOS(),
    app_version: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || '1.0.0',
  };
}

/**
 * Initialize analytics
 * Call this once in root layout or _app
 */
export function initAnalytics() {
  if (typeof window === 'undefined') return;

  // Check if Mixpanel token is configured
  const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;

  if (!MIXPANEL_TOKEN) {
    console.warn('⚠️  Mixpanel token not configured. Add NEXT_PUBLIC_MIXPANEL_TOKEN to .env.local');
    return;
  }

  // Load Mixpanel script if not already loaded
  if (!window.mixpanel) {
    const script = document.createElement('script');
    script.src = 'https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js';
    script.async = true;
    script.onload = () => {
      if (window.mixpanel) {
        window.mixpanel.init(MIXPANEL_TOKEN, {
          debug: process.env.NODE_ENV === 'development',
          track_pageview: false, // We'll track manually
          persistence: 'localStorage',
        });

        // Identify user
        window.mixpanel.identify(getAnonymousUserId());

        console.log('✅ Mixpanel initialized');
      }
    };
    document.head.appendChild(script);
  }
}

/**
 * Track an event
 *
 * @param eventName - Event name (e.g., 'create_completed')
 * @param properties - Event-specific properties
 *
 * @example
 * trackEvent('create_completed', {
 *   share_code: 'abc123',
 *   occasion: 'birthday',
 *   time_to_complete: 180
 * });
 */
export function trackEvent(eventName: string, properties: Record<string, any> = {}) {
  // Merge common properties with event-specific properties
  const eventData = {
    ...getCommonProperties(),
    ...properties,
  };

  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Analytics Event:', eventName, eventData);
  }

  // Send to Mixpanel (if configured)
  if (typeof window !== 'undefined' && window.mixpanel) {
    try {
      window.mixpanel.track(eventName, eventData);
    } catch (error) {
      console.error('Analytics error:', error);
    }
  }

  // Can add additional analytics providers here (e.g., PostHog, Amplitude)
}

/**
 * Track page view
 * Call this on route changes
 */
export function trackPageView(pageName?: string) {
  trackEvent('page_viewed', {
    page_name: pageName || document.title,
  });
}
