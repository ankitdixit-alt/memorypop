import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Create a MemoryPop',
  description: 'Create a beautiful celebration page where friends and family can share memories, photos, and heartfelt messages.',
};

export default function CreateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
