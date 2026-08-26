/**
 * Memory Experience Types
 * Shared interfaces for the memory gallery components
 */

// Standard multimedia support (3 photos + 1 GIF + 1 video)
export interface MediaItem {
  url: string;                    // Supabase Storage public URL (for rendering)
  uploaded_at: string;            // ISO 8601 timestamp
  file_size_bytes: number;        // File size for tracking
}

export interface VideoMedia extends MediaItem {
  file_path: string;              // Canonical storage path (for security verification)
  duration_seconds: number;       // Server-validated duration (authoritative)
  validation_proof: string;       // HMAC-SHA256 signed proof (server-generated)
}

export interface Memory {
  id: string;
  contributorName: string;
  message?: string;
  // Legacy field (real backwards compatibility - photo_url only)
  photoUrl?: string;
  mediaType: 'photo' | 'video' | 'text';
  createdAt: Date;
  // Standard multimedia (JSONB - current)
  photos?: MediaItem[];
  gifs?: MediaItem[];
  video?: VideoMedia | null;
}

// MemoryPopClient memory shape (from database)
export interface MemoryPopMemory {
  id: string;
  contributor_name: string;
  message: string;
  // Legacy columns (backwards compatibility)
  photo_url: string | null;
  video_url?: string | null;
  created_at: string;
  // Standard multimedia columns (JSONB)
  photos?: MediaItem[];
  gifs?: MediaItem[];
  video?: VideoMedia | null;
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
