/**
 * Memory Experience Types
 * Shared interfaces for the memory gallery components
 */

export interface Memory {
  id: string;
  contributorName: string;
  message?: string;
  photoUrl?: string;
  videoUrl?: string;
  mediaType: 'photo' | 'video' | 'text';
  createdAt: Date;
}

// MemoryPopClient memory shape (from database)
export interface MemoryPopMemory {
  id: string;
  contributor_name: string;
  message: string;
  photo_url: string | null;
  video_url?: string | null;
  created_at: string;
}

// MemoryPop metadata from database
export interface MemoryPop {
  id: string;
  recipient_name: string;
  occasion: string;
  story: string;
  share_code: string;
  cover_style: string | null;
  tone: string | null;
  is_premium: boolean;
  celebration_date: string | null;
  cover_photo_url: string | null;
}

export interface GalleryViewProps {
  memoryPop: MemoryPop;
  memories: MemoryPopMemory[];
  shareLink: string;
}

export interface MemoryCardProps {
  memory: Memory;
  onClick: () => void;
}

export interface DetailModalProps {
  memory: Memory;
  isOpen: boolean;
  onClose: () => void;
}
