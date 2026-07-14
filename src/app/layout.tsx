import type { Metadata } from "next";
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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://memorypop.com'),
  title: {
    template: '%s | MemoryPop',
    default: 'MemoryPop - Celebrate Together',
  },
  description: 'Create one beautiful home for every celebration. Friends and family come together to share memories, photos, and heartfelt messages.',
  keywords: ['celebration', 'memories', 'birthday', 'anniversary', 'farewell', 'graduation', 'wedding'],
  authors: [{ name: 'MemoryPop' }],
  creator: 'MemoryPop',
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
