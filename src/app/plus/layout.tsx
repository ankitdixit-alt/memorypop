import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'MemoryPop Plus',
  description: 'Unlock unlimited photos, premium themes, and exclusive features with MemoryPop Plus. One-time payment, lifetime access to all features.',
};

export default function PlusLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
