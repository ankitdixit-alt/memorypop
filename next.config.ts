import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'gvfpgawbvuttglfscngg.supabase.co',
      },
    ],
  },
};

// Sentry webpack plugin options
const sentryWebpackPluginOptions = {
  // Suppress source map upload logs during build
  silent: true,

  // Organization slug (from Sentry settings)
  org: process.env.SENTRY_ORG,

  // Project slug (from Sentry settings)
  project: process.env.SENTRY_PROJECT,

  // Auth token for source map upload
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Disable source map upload in development
  disableServerWebpackPlugin: process.env.NODE_ENV !== 'production',
  disableClientWebpackPlugin: process.env.NODE_ENV !== 'production',
};

// Wrap Next.js config with Sentry
export default withSentryConfig(nextConfig, sentryWebpackPluginOptions);
