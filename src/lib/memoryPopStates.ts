import type { SupabaseClient } from '@supabase/supabase-js';

export type MemoryPopStatus = 'collecting' | 'ready' | 'revealed';

const VALID_STATUSES: MemoryPopStatus[] = ['collecting', 'ready', 'revealed'];

export function isValidStatus(status: string): status is MemoryPopStatus {
  return VALID_STATUSES.includes(status as MemoryPopStatus);
}

export async function transitionToReady(
  supabase: SupabaseClient,
  memorypopId: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('memorypops')
    .update({ status: 'ready' })
    .eq('id', memorypopId)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function transitionToRevealed(
  supabase: SupabaseClient,
  memorypopId: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('memorypops')
    .update({ status: 'revealed' })
    .eq('id', memorypopId)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export function getStateLabel(status: MemoryPopStatus): string {
  const labels: Record<MemoryPopStatus, string> = {
    collecting: 'Collecting Memories',
    ready: 'Ready to Share',
    revealed: 'Revealed',
  };
  return labels[status] || 'Unknown';
}

export function getStateEmoji(status: MemoryPopStatus): string {
  const emojis: Record<MemoryPopStatus, string> = {
    collecting: '📝',
    ready: '✅',
    revealed: '🎉',
  };
  return emojis[status] || '📦';
}

export function canTransitionToReady(memoryCount: number): boolean {
  return memoryCount > 0;
}
