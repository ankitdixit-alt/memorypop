/**
 * Share Message Generation
 *
 * Shared logic for generating sharing messages across all channels
 * Used by ShareButtons and ShareMenu components
 */

export function generateShareMessage(
  mode: 'contributor' | 'reveal' | 'product',
  recipient: string,
  shareLink: string,
  whatsappMessage?: string
): string {
  if (mode === 'product') {
    return `Create beautiful collaborative gifts with MemoryPop - the perfect way to celebrate someone special. ${shareLink}`;
  } else if (mode === 'reveal') {
    return whatsappMessage
      ? `${whatsappMessage} ${shareLink}`
      : `${recipient} - Your MemoryPop is ready! ${shareLink}`;
  } else {
    // Contributor mode
    return whatsappMessage
      ? `${whatsappMessage} ${shareLink}`
      : `I created a MemoryPop for ${recipient}. Add a memory for ${recipient} here: ${shareLink}`;
  }
}

export function generateEmailSubject(
  mode: 'contributor' | 'reveal' | 'product',
  recipient: string
): string {
  if (mode === 'product') {
    return 'Create beautiful gift memories with MemoryPop';
  } else if (mode === 'reveal') {
    return `${recipient} - Your MemoryPop is ready!`;
  } else {
    return `Help celebrate ${recipient}`;
  }
}

export function generateEmailBody(
  mode: 'contributor' | 'reveal' | 'product',
  recipient: string,
  shareLink: string,
  whatsappMessage?: string
): string {
  if (mode === 'product') {
    return `I wanted to share MemoryPop with you - it's a beautiful way to create collaborative gifts for someone special.\n\nYou can collect memories, photos, and messages from friends and family, then reveal them as a surprise gift.\n\n${shareLink}`;
  } else if (mode === 'reveal') {
    return whatsappMessage
      ? `${whatsappMessage}\n\n${shareLink}`
      : `${recipient} - Your MemoryPop is ready!\n\n${shareLink}`;
  } else {
    return whatsappMessage
      ? `${whatsappMessage}\n\n${shareLink}`
      : `I created a MemoryPop for ${recipient}. Add a memory for ${recipient} here:\n\n${shareLink}`;
  }
}

export function generateShareMenuMessage(
  mode: 'contributor' | 'reveal' | 'product',
  recipient: string,
  whatsappMessage?: string
): string {
  if (mode === 'product') {
    return 'Create beautiful collaborative gifts with MemoryPop - the perfect way to celebrate someone special.';
  } else if (mode === 'reveal') {
    return whatsappMessage || `${recipient} - Your MemoryPop is ready!`;
  } else {
    return whatsappMessage || `I created a MemoryPop for ${recipient}. Add a memory for ${recipient} here:`;
  }
}
