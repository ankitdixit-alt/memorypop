/**
 * Sharing Implementation Verification
 *
 * Tests actual production message/URL generation helpers
 * Covers all three modes with missing optional messages and special characters
 */

import { generateShareMessage, generateEmailBody, generateShareMenuMessage } from '../src/lib/shareMessageGenerator';

console.log('=== Sharing Implementation Verification ===\n');

// Test 1: Contributor mode WITH occasion message
console.log('TEST 1: Contributor mode WITH occasion message');
const contributorMsg = "Help us celebrate Sarah's birthday! We're creating a surprise MemoryPop filled with memories and photos. Add your birthday message here:";
const whatsapp1 = generateShareMessage('contributor', 'Sarah', 'https://memorypop.app/m/abc/contribute', contributorMsg);
const email1 = generateEmailBody('contributor', 'Sarah', 'https://memorypop.app/m/abc/contribute', contributorMsg);
const share1 = generateShareMenuMessage('contributor', 'Sarah', contributorMsg);

console.log('WhatsApp:', whatsapp1);
console.log('Email:', email1.substring(0, 80) + '...');
console.log('ShareMenu:', share1);
console.log(whatsapp1.includes('birthday') ? '✅ PASS' : '❌ FAIL', '- Uses occasion-specific message');
console.log(whatsapp1.includes('/contribute') ? '✅ PASS' : '❌ FAIL', '- Contains contribution link\n');

// Test 2: Contributor mode WITHOUT occasion message (fallback)
console.log('TEST 2: Contributor mode WITHOUT occasion message (fallback)');
const whatsapp2 = generateShareMessage('contributor', 'Sarah', 'https://memorypop.app/m/abc/contribute');
const email2 = generateEmailBody('contributor', 'Sarah', 'https://memorypop.app/m/abc/contribute');
const share2 = generateShareMenuMessage('contributor', 'Sarah');

console.log('WhatsApp:', whatsapp2);
console.log('Email:', email2.substring(0, 80) + '...');
console.log('ShareMenu:', share2);
console.log(whatsapp2.includes('Add a memory') ? '✅ PASS' : '❌ FAIL', '- Falls back to contribution request');
console.log(whatsapp2.includes('/contribute') ? '✅ PASS' : '❌ FAIL', '- Contains contribution link\n');

// Test 3: Reveal mode WITHOUT occasion message (uses default reveal wording)
console.log('TEST 3: Reveal mode WITHOUT occasion message (default reveal wording)');
const whatsapp3 = generateShareMessage('reveal', 'Sarah', 'https://memorypop.app/m/abc/reveal');
const email3 = generateEmailBody('reveal', 'Sarah', 'https://memorypop.app/m/abc/reveal');
const share3 = generateShareMenuMessage('reveal', 'Sarah');

console.log('WhatsApp:', whatsapp3);
console.log('Email:', email3);
console.log('ShareMenu:', share3);
console.log(whatsapp3.includes('Your MemoryPop is ready') ? '✅ PASS' : '❌ FAIL', '- Uses reveal announcement');
console.log(!whatsapp3.includes('Add a memory') ? '✅ PASS' : '❌ FAIL', '- Does NOT say "Add a memory"');
console.log(whatsapp3.includes('/reveal') ? '✅ PASS' : '❌ FAIL', '- Contains reveal link\n');

// Test 4: Reveal mode WITH custom message
console.log('TEST 4: Reveal mode WITH custom message');
const revealMsg = "Your birthday surprise is ready!";
const whatsapp4 = generateShareMessage('reveal', 'Sarah', 'https://memorypop.app/m/abc/reveal', revealMsg);
const email4 = generateEmailBody('reveal', 'Sarah', 'https://memorypop.app/m/abc/reveal', revealMsg);
const share4 = generateShareMenuMessage('reveal', 'Sarah', revealMsg);

console.log('WhatsApp:', whatsapp4);
console.log('Email:', email4);
console.log('ShareMenu:', share4);
console.log(whatsapp4.includes('surprise is ready') ? '✅ PASS' : '❌ FAIL', '- Uses custom reveal message\n');

// Test 5: Product mode (always uses product copy, ignores whatsappMessage)
console.log('TEST 5: Product mode (always uses product copy)');
const whatsapp5 = generateShareMessage('product', 'someone special', 'https://memorypop.app');
const email5 = generateEmailBody('product', 'someone special', 'https://memorypop.app');
const share5 = generateShareMenuMessage('product', 'someone special');

console.log('WhatsApp:', whatsapp5);
console.log('Email:', email5.substring(0, 100) + '...');
console.log('ShareMenu:', share5);
console.log(!whatsapp5.includes('Add a memory') ? '✅ PASS' : '❌ FAIL', '- No contribution request');
console.log(!whatsapp5.includes('Sarah') ? '✅ PASS' : '❌ FAIL', '- No specific recipient name');
console.log(whatsapp5.includes('https://memorypop.app') && !whatsapp5.includes('/contribute') ? '✅ PASS' : '❌ FAIL', '- Links to homepage\n');

// Test 6: Special characters in recipient name
console.log('TEST 6: Special characters in recipient name');
const specialRecipient = "José María";
const whatsapp6 = generateShareMessage('contributor', specialRecipient, 'https://memorypop.app/m/abc/contribute');
console.log('WhatsApp:', whatsapp6);
console.log('Encoded URL:', `https://wa.me/?text=${encodeURIComponent(whatsapp6)}`);
console.log(whatsapp6.includes('José María') ? '✅ PASS' : '❌ FAIL', '- Preserves special characters\n');

// Test 7: URL encoding verification
console.log('TEST 7: URL encoding verification');
const testMessage = "Test message with spaces & special chars!";
const encoded = encodeURIComponent(testMessage);
console.log('Original:', testMessage);
console.log('Encoded:', encoded);
console.log(!encoded.includes(' ') && !encoded.includes('&') ? '✅ PASS' : '❌ FAIL', '- Special chars encoded correctly\n');

// Summary
console.log('=== Verification Summary ===\n');

const tests = [
  { name: 'Contributor WITH message', pass: whatsapp1.includes('birthday') && whatsapp1.includes('/contribute') },
  { name: 'Contributor WITHOUT message', pass: whatsapp2.includes('Add a memory') && whatsapp2.includes('/contribute') },
  { name: 'Reveal WITHOUT message', pass: whatsapp3.includes('Your MemoryPop is ready') && !whatsapp3.includes('Add a memory') },
  { name: 'Reveal WITH message', pass: whatsapp4.includes('surprise is ready') },
  { name: 'Product mode', pass: !whatsapp5.includes('Add a memory') && !whatsapp5.includes('Sarah') && whatsapp5.includes('https://memorypop.app') },
  { name: 'Special characters', pass: whatsapp6.includes('José María') },
  { name: 'URL encoding', pass: !encoded.includes(' ') },
];

const passed = tests.filter(t => t.pass).length;
const total = tests.length;

console.log(`Tests Passed: ${passed}/${total}`);
tests.forEach(t => {
  console.log(`  ${t.pass ? '✅' : '❌'} ${t.name}`);
});

if (passed === total) {
  console.log('\n✅ ALL IMPLEMENTATION TESTS PASSED');
  process.exit(0);
} else {
  console.log(`\n❌ ${total - passed} TEST(S) FAILED`);
  process.exit(1);
}
