import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://memorypop.com'),

  // Application metadata
  applicationName: 'MemoryPop',

  // Title configuration
  title: {
    template: '%s | MemoryPop',
    default: 'MemoryPop - Celebrate Together',
  },

  // Description and keywords
  description: 'Create one beautiful home for every celebration. Friends and family come together to share memories, photos, and heartfelt messages.',
  keywords: ['celebration', 'memories', 'birthday', 'anniversary', 'farewell', 'graduation', 'wedding'],

  // Authors and creator
  authors: [{ name: 'MemoryPop' }],
  creator: 'MemoryPop',

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

  // OpenGraph (existing, keep as-is)
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'MemoryPop',
    title: 'MemoryPop - Celebrate Together',
    description: 'Create one beautiful home for every celebration. Friends and family come together to share memories, photos, and heartfelt messages.',
    images: [
      {
        url: '/og/default.png',
        width: 1200,
        height: 630,
        alt: 'MemoryPop - Celebrate Together',
      },
    ],
  },

  // Twitter (existing, keep as-is)
  twitter: {
    card: 'summary_large_image',
    title: 'MemoryPop - Celebrate Together',
    description: 'Create one beautiful home for every celebration. Friends and family come together to share memories, photos, and heartfelt messages.',
    images: ['/og/default.png'],
    creator: '@memorypop',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
