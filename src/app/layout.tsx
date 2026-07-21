import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { OrganizationSchema } from "@/components/OrganizationSchema";
import { AnalyticsInitializer } from "@/components/AnalyticsInitializer";
import CookieConsent from "@/components/CookieConsent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: '#FF6B57',
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://memorypop.app'),

  // Application metadata
  applicationName: 'MemoryPop',

  // Title configuration (SEO Foundation - Enhanced)
  title: {
    template: '%s | MemoryPop',
    default: 'MemoryPop - Create Beautiful Online Memory Books for Every Celebration',
  },

  // Description and keywords (SEO Foundation - Enhanced)
  description: 'Create a beautiful online memory book for birthdays, weddings, farewells, and celebrations. Friends and family collaborate to share memories, photos, and heartfelt messages in one place.',
  keywords: ['online memory book', 'group birthday card', 'collaborative celebration', 'digital memory album', 'birthday memories', 'wedding memory book', 'farewell messages', 'graduation wishes', 'celebration', 'memories'],

  // Authors and creator (SEO Foundation Phase 1 - Task 5)
  authors: [{ name: 'MemoryPop' }],
  creator: 'MemoryPop',
  publisher: 'MemoryPop',

  // Canonical URL (SEO Foundation Phase 1 - Task 3)
  alternates: {
    canonical: '/',
  },

  // PWA manifest
  manifest: '/site.webmanifest',

  // Icons (favicons)
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },

  // Apple Web App metadata
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MemoryPop',
  },

  // Category
  category: 'lifestyle',

  // OpenGraph (SEO Foundation - Enhanced)
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'MemoryPop',
    title: 'MemoryPop - Create Beautiful Online Memory Books for Every Celebration',
    description: 'Create a beautiful online memory book for birthdays, weddings, farewells, and celebrations. Friends and family collaborate to share memories, photos, and heartfelt messages in one place.',
    images: [
      {
        url: '/og/default.png',
        width: 1200,
        height: 630,
        alt: 'MemoryPop - Celebrate Together',
      },
    ],
  },

  // Twitter (SEO Foundation - Enhanced + Task 5)
  twitter: {
    card: 'summary_large_image',
    site: '@memorypop',
    title: 'MemoryPop - Create Beautiful Online Memory Books for Every Celebration',
    description: 'Create a beautiful online memory book for birthdays, weddings, farewells, and celebrations. Friends and family collaborate to share memories, photos, and heartfelt messages in one place.',
    images: ['/og/default.png'],
    creator: '@memorypop',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://memorypop.app';

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Canonical URL (SEO Foundation Quick Win #4) */}
        <link rel="canonical" href={baseUrl} />
        {/* Organization Schema (SEO Foundation Quick Win #2) */}
        <OrganizationSchema />
      </head>
      <body className="min-h-full flex flex-col">
        <AnalyticsInitializer />
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
