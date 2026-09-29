import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.test
dotenv.config({ path: path.join(process.cwd(), '.env.test') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

(async () => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Create memorypop-custom-music bucket
  console.log('Creating memorypop-custom-music bucket...');
  const { error: musicError } = await supabase.storage.createBucket('memorypop-custom-music', {
    public: false,
    fileSizeLimit: 20 * 1024 * 1024, // 20MB
    allowedMimeTypes: ['audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/x-m4a'],
  });

  if (musicError && !musicError.message.includes('already exists')) {
    console.error('❌ Failed to create memorypop-custom-music:', musicError);
    process.exit(1);
  }
  console.log('✅ memorypop-custom-music bucket ready');

  // Create memory-photos bucket
  console.log('Creating memory-photos bucket...');
  const { error: photosError } = await supabase.storage.createBucket('memory-photos', {
    public: true,
    fileSizeLimit: 50 * 1024 * 1024, // 50MB
    allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/quicktime', 'video/webm'],
  });

  if (photosError && !photosError.message.includes('already exists')) {
    console.error('❌ Failed to create memory-photos:', photosError);
    process.exit(1);
  }
  console.log('✅ memory-photos bucket ready');

  console.log('\n✅ All buckets created successfully');
  process.exit(0);
})();
