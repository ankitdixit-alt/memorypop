import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";

/**
 * SEO Foundation Phase 1 - Task 3 & 4
 * Contribute page metadata with noindex/follow and canonical URL
 * Private page - should not be indexed
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ shareCode: string }>;
}): Promise<Metadata> {
  const { shareCode } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://memorypop.com';

  // Fetch MemoryPop for personalized title
  const { data: memorypop } = await supabase
    .from("memorypops")
    .select("recipient_name, occasion")
    .eq("share_code", shareCode)
    .single();

  if (memorypop) {
    return {
      title: `Add Memory for ${memorypop.recipient_name}`,
      description: `Contribute a memory, photo, or message for ${memorypop.recipient_name}'s ${memorypop.occasion.toLowerCase()} celebration.`,
      // Contribute pages should not be indexed (private contribution flow)
      robots: {
        index: false,
        follow: true,
      },
      alternates: {
        canonical: `${baseUrl}/m/${shareCode}/contribute`,
      },
    };
  }

  return {
    title: 'Add Memory',
    description: 'Contribute a memory to this celebration.',
    robots: {
      index: false,
      follow: true,
    },
    alternates: {
      canonical: `${baseUrl}/m/${shareCode}/contribute`,
    },
  };
}

export default function ContributeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
