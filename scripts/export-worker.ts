/**
 * Export Worker: Processes pending reveal export jobs
 *
 * Usage:
 *   npx tsx scripts/export-worker.ts
 *
 * This worker polls the database for pending export jobs and processes them
 * using the approved v4 exporter. It must run in an environment with:
 * - Chromium browser (Playwright)
 * - FFmpeg with H.264 codec
 * - Network access to localhost reveal pages
 * - Write access to exports directory
 *
 * IMPORTANT: This is a development/local implementation. Production would
 * require a proper background job system with:
 * - Dedicated rendering infrastructure (not Vercel)
 * - Scalable storage (S3, Google Cloud Storage, etc.)
 * - Job queue (BullMQ, AWS SQS, etc.)
 * - Monitoring and alerting
 */

import { createClient } from '@supabase/supabase-js';
import { exportReveal } from '../src/lib/export/exportReveal';
import path from 'path';

const POLL_INTERVAL_MS = 5000; // Check every 5 seconds
const MAX_ATTEMPTS = 3;
const EXPORTS_DIR = path.join(process.cwd(), 'exports');

// Get Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface ExportJob {
  id: string;
  memorypop_id: string;
  status: string;
  attempt_count: number;
  memorypops: {
    share_code: string;
  };
}

async function processJob(job: ExportJob): Promise<void> {
  const { id, memorypops } = job;
  const shareCode = memorypops.share_code;

  console.log(`\n📹 Processing export job ${id}`);
  console.log(`   Share code: ${shareCode}`);
  console.log(`   Attempt: ${job.attempt_count + 1}/${MAX_ATTEMPTS}`);

  // Update status to processing
  await supabase
    .from('export_jobs')
    .update({ status: 'processing' })
    .eq('id', id);

  // Run export
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const result = await exportReveal({
    shareCode,
    baseUrl,
    outputDir: EXPORTS_DIR,
  });

  if (result.success && result.videoPath) {
    // Export completed successfully
    console.log(`✅ Export completed`);
    console.log(`   Video: ${result.videoPath}`);
    console.log(`   Duration: ${result.duration?.toFixed(1)}s`);
    console.log(`   Size: ${((result.size || 0) / 1024 / 1024).toFixed(2)} MB`);

    await supabase
      .from('export_jobs')
      .update({
        status: 'completed',
        video_path: result.videoPath,
        completed_at: new Date().toISOString(),
      })
      .eq('id', id);
  } else {
    // Export failed
    console.error(`❌ Export failed: ${result.error}`);

    const newAttemptCount = job.attempt_count + 1;
    const finalFailure = newAttemptCount >= MAX_ATTEMPTS;

    await supabase
      .from('export_jobs')
      .update({
        status: finalFailure ? 'failed' : 'pending',
        error_message: result.error,
        attempt_count: newAttemptCount,
      })
      .eq('id', id);

    if (finalFailure) {
      console.error(`   Max attempts reached, marking as failed`);
    } else {
      console.log(`   Will retry (${newAttemptCount}/${MAX_ATTEMPTS})`);
    }
  }
}

async function pollAndProcess(): Promise<void> {
  try {
    // Fetch next pending job
    const { data: jobs, error } = await supabase
      .from('export_jobs')
      .select(`
        id,
        memorypop_id,
        status,
        attempt_count,
        memorypops!inner(share_code)
      `)
      .eq('status', 'pending')
      .lt('attempt_count', MAX_ATTEMPTS)
      .order('created_at', { ascending: true })
      .limit(1);

    if (error) {
      console.error('Query error:', error);
      return;
    }

    if (!jobs || jobs.length === 0) {
      // No pending jobs
      return;
    }

    const job = jobs[0] as any as ExportJob;
    await processJob(job);

  } catch (error: any) {
    console.error('Worker error:', error.message);
  }
}

// Main worker loop
console.log('🎬 Export Worker Started');
console.log(`   Polling interval: ${POLL_INTERVAL_MS}ms`);
console.log(`   Exports directory: ${EXPORTS_DIR}`);
console.log(`   Base URL: ${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}`);
console.log('');

// Process immediately on start
pollAndProcess();

// Then poll at regular intervals
setInterval(pollAndProcess, POLL_INTERVAL_MS);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Worker shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n🛑 Worker shutting down...');
  process.exit(0);
});
