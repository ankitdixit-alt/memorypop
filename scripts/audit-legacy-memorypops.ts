/**
 * Audit Legacy MemoryPops
 *
 * Run with: npx tsx scripts/audit-legacy-memorypops.ts
 *
 * Purpose: Audit existing MemoryPops without management tokens
 * Determines migration strategy based on data volume and quality
 *
 * Outputs:
 * - Total MemoryPops count
 * - MemoryPops with contributions count
 * - Revealed MemoryPops count
 * - Empty/test MemoryPops count
 * - Recommended migration strategy
 */

import { supabase } from '../src/lib/supabase';

async function auditLegacy() {
  console.log('='.repeat(60));
  console.log('Legacy MemoryPop Audit');
  console.log('Date:', new Date().toISOString());
  console.log('='.repeat(60));
  console.log('');

  // Count total MemoryPops
  const { count: totalCount, error: totalError } = await supabase
    .from('memorypops')
    .select('*', { count: 'exact', head: true });

  if (totalError) {
    console.error('Error counting total MemoryPops:', totalError);
    process.exit(1);
  }

  // Count MemoryPops with contributions
  const { count: withContributions, error: contribError } = await supabase
    .from('memorypops')
    .select('id', { count: 'exact', head: true })
    .gt('contributions_count', 0);

  if (contribError) {
    console.error('Error counting contributions:', contribError);
    process.exit(1);
  }

  // Count revealed MemoryPops
  const { count: revealed, error: revealError } = await supabase
    .from('memorypops')
    .select('id', { count: 'exact', head: true })
    .eq('revealed', true);

  if (revealError) {
    console.error('Error counting revealed:', revealError);
    process.exit(1);
  }

  // Count MemoryPops with verified creator email
  const { count: withVerifiedEmail, error: emailError } = await supabase
    .from('memorypops')
    .select('id', { count: 'exact', head: true })
    .not('creator_email_verified_at', 'is', null);

  if (emailError) {
    console.error('Error counting verified emails:', emailError);
    process.exit(1);
  }

  const emptyCount = (totalCount || 0) - (withContributions || 0);

  // Display results
  console.log('Audit Results:');
  console.log('-'.repeat(60));
  console.log(`Total MemoryPops: ${totalCount}`);
  console.log(`With contributions: ${withContributions}`);
  console.log(`Already revealed: ${revealed}`);
  console.log(`With verified email: ${withVerifiedEmail}`);
  console.log(`Empty/test: ${emptyCount}`);
  console.log('');

  // Recommend strategy
  console.log('Recommended Migration Strategy:');
  console.log('-'.repeat(60));

  if (totalCount === 0) {
    console.log('✅ NO MIGRATION NEEDED');
    console.log('   No existing data - schema can be changed freely');
    console.log('   Action: Deploy with management_token_hash NOT NULL');
  } else if ((withContributions || 0) === 0) {
    console.log('⚠️  BETA RESET RECOMMENDED');
    console.log('   All MemoryPops are empty test data');
    console.log('   Action: Drop table and recreate with new schema');
    console.log('   Impact: No user data loss');
  } else if ((withVerifiedEmail || 0) > 0) {
    console.log('🚨 MIGRATION REQUIRED (Real User Data)');
    console.log('   MemoryPops with contributions exist');
    console.log('   Some creators have verified emails');
    console.log('');
    console.log('   Migration Options:');
    console.log('   A. Generate management tokens for existing MemoryPops');
    console.log('      - Send recovery emails with new dashboard links');
    console.log('      - Log tokens securely for manual delivery');
    console.log('      - 2-week grace period for transition');
    console.log('');
    console.log('   B. Manual reissue (if count is low)');
    console.log('      - Contact creators directly');
    console.log('      - Provide new management links');
    console.log('      - Suitable for <10 active creators');
    console.log('');
    console.log('   STOP: Request Founder decision before proceeding');
  } else {
    console.log('⚠️  PARTIAL MIGRATION');
    console.log('   MemoryPops with contributions exist');
    console.log('   No verified emails (limited recovery options)');
    console.log('');
    console.log('   Recommendation: Beta reset with notice');
    console.log('   Action: Contact affected users if possible');
  }

  console.log('');
  console.log('='.repeat(60));
  console.log('Audit Complete');
  console.log('='.repeat(60));
}

// Run audit
auditLegacy()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Audit failed:', error);
    process.exit(1);
  });
