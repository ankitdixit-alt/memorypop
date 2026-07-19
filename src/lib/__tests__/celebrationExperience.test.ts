/**
 * Celebration Experience Composition Tests
 *
 * GUARDRAIL #6: 60-combination coverage (all occasions × all moods)
 * GUARDRAIL #2: Field-level composition validation
 * GUARDRAIL #3: Targeted safety override validation
 * GUARDRAIL #5: Legacy value compatibility validation
 */

import { describe, test, expect } from '@jest/globals';
import { getCelebrationExperience } from '../celebrationExperience';
import { OCCASIONS } from '../occasions';
import { CELEBRATION_MOODS } from '../celebrationMood';

describe('Celebration Experience Composition', () => {
  // GUARDRAIL #6: All 60 combinations test
  describe('All Occasion × Mood Combinations', () => {
    test('all 60 combinations resolve without errors', () => {
      const occasions = Object.keys(OCCASIONS);
      const moods = Object.keys(CELEBRATION_MOODS);

      expect(occasions.length).toBe(15);
      expect(moods.length).toBe(4);

      occasions.forEach(occasion => {
        moods.forEach(mood => {
          const exp = getCelebrationExperience({ occasion, mood });

          // All combinations must resolve
          expect(exp).toBeDefined();

          // All required fields must be present
          expect(exp.id).toBeDefined();
          expect(exp.label).toBeDefined();
          expect(exp.emoji).toBeDefined();
          expect(exp.contributorHeadline).toBeDefined();
          expect(exp.contributorSupportingText).toBeDefined();
          expect(exp.contributorPrompt).toBeDefined();
          expect(exp.contributorPlaceholder).toBeDefined();
          expect(exp.revealIntroduction).toBeDefined();

          // No undefined or empty required strings
          expect(exp.contributorHeadline).not.toBe('');
          expect(exp.contributorPlaceholder).not.toBe('');

          // Preserves normalized occasion and mood
          expect(exp.id).toBe(occasion);
          expect(exp.moodUsed).toBe(mood);

          // Configuration objects not mutated
          expect(OCCASIONS[occasion]).toBeDefined();
          expect(CELEBRATION_MOODS[mood as keyof typeof CELEBRATION_MOODS]).toBeDefined();
        });
      });
    });

    test('no occasion leaks into unrelated occasions', () => {
      const exp = getCelebrationExperience({
        occasion: 'promotion',
        mood: 'heartfelt'
      });

      // Promotion should not contain birthday-specific copy
      const allText = [
        exp.contributorHeadline,
        exp.contributorPlaceholder,
        exp.formPlaceholders?.message
      ].join(' ').toLowerCase();

      expect(allText).not.toContain('birthday');
    });
  });

  // Targeted regression tests
  describe('Critical Regressions', () => {
    test('Promotion never shows birthday placeholder', () => {
      const exp = getCelebrationExperience({
        occasion: 'promotion',
        mood: 'simple'
      });

      const placeholder = exp.formPlaceholders?.message || exp.contributorPlaceholder;
      expect(placeholder).not.toContain('birthday');
      expect(placeholder).toMatch(/congratulations|achievement|promotion/i);
    });

    test('Sympathy + Funny applies safety handling (GUARDRAIL #3)', () => {
      const exp = getCelebrationExperience({
        occasion: 'sympathy',
        mood: 'funny'
      });

      // Should NOT contain "laugh" (safety override applied)
      expect(exp.contributorHeadline).not.toContain('laugh');
      expect(exp.hasSafetyOverrides).toBe(true);

      // Should preserve supportive tone
      expect(exp.contributorHeadline.toLowerCase()).toMatch(/support|comfort|care/);
    });

    test('Sympathy + Emotional applies safety handling (GUARDRAIL #3)', () => {
      const exp = getCelebrationExperience({
        occasion: 'sympathy',
        mood: 'emotional'
      });

      // Safety override should be applied
      expect(exp.hasSafetyOverrides).toBe(true);

      // Should use sympathy-specific copy, not generic emotional mood
      expect(exp.contributorHeadline.toLowerCase()).toMatch(/support|comfort|care/);
    });

    test('Get Well Soon + Funny allowed (GUARDRAIL #3)', () => {
      const exp = getCelebrationExperience({
        occasion: 'getwellsoon',
        mood: 'funny'
      });

      // Humor allowed for recovery - mood preserved
      expect(exp.moodUsed).toBe('funny');
      expect(exp.hasSafetyOverrides).toBe(false);
    });

    test('Birthday + Funny uses mood system (no overrides)', () => {
      const exp = getCelebrationExperience({
        occasion: 'birthday',
        mood: 'funny'
      });

      // No safety overrides for flexible occasions
      expect(exp.hasSafetyOverrides).toBe(false);

      // Should use funny mood headline
      expect(exp.contributorHeadline).toContain('laugh');
    });

    test('legacy occasion aliases normalize (GUARDRAIL #5)', () => {
      const tests = [
        { input: "Valentine's Day", expected: 'valentines' },
        { input: "Get Well Soon", expected: 'getwellsoon' },
        { input: "Thank You", expected: 'thankyou' },
        { input: "New Baby", expected: 'newbaby' },
      ];

      tests.forEach(({ input, expected }) => {
        const exp = getCelebrationExperience({ occasion: input });
        expect(exp.id).toBe(expected);
      });
    });

    test('legacy mood values normalize (GUARDRAIL #5)', () => {
      const variants = ['Heartfelt', 'heartfelt', 'HEARTFELT'];

      variants.forEach(variant => {
        const exp = getCelebrationExperience({
          occasion: 'birthday',
          mood: variant
        });
        expect(exp.moodUsed).toBe('heartfelt');
      });
    });

    test('unknown occasion uses birthday fallback (GUARDRAIL #5)', () => {
      const exp = getCelebrationExperience({
        occasion: 'unknown-occasion-xyz'
      });
      expect(exp.id).toBe('birthday');
    });

    test('null mood uses simple fallback (GUARDRAIL #5)', () => {
      const exp = getCelebrationExperience({
        occasion: 'birthday',
        mood: null
      });
      expect(exp.moodUsed).toBe('simple');
    });
  });

  // Field-level composition validation
  describe('Field-Level Composition (GUARDRAIL #2)', () => {
    test('each field has documented ownership', () => {
      const exp = getCelebrationExperience({
        occasion: 'birthday',
        mood: 'heartfelt'
      });

      // Occasion-owned fields
      expect(exp.id).toBe('birthday'); // from occasion
      expect(exp.emoji).toBe('🎂'); // from occasion
      expect(exp.formPlaceholders?.message).toContain('birthday'); // from occasion

      // Mood-influenced fields
      expect(exp.contributorHeadline).toContain('treasure'); // from mood
    });

    test('safety overrides affect only intended fields', () => {
      const sympathy = getCelebrationExperience({
        occasion: 'sympathy',
        mood: 'funny'
      });

      // Safety override should affect headline
      expect(sympathy.contributorHeadline).not.toContain('laugh');

      // But occasion-owned fields unchanged
      expect(sympathy.id).toBe('sympathy');
      expect(sympathy.emoji).toBe('🕊️');
    });
  });

  // Personalization
  describe('Personalization', () => {
    test('recipient name interpolation works', () => {
      const exp = getCelebrationExperience({
        occasion: 'birthday',
        mood: 'heartfelt',
        recipientName: 'Sarah'
      });

      expect(exp.celebrationMessage).toContain('Sarah');
    });

    test('personalization without name still works', () => {
      const exp = getCelebrationExperience({
        occasion: 'birthday',
        mood: 'heartfelt'
      });

      expect(exp.celebrationMessage).toBeDefined();
      expect(exp.celebrationMessage).not.toContain('undefined');
    });
  });

  // Metadata validation
  describe('Metadata', () => {
    test('moodUsed field correctly set', () => {
      ['heartfelt', 'funny', 'emotional', 'simple'].forEach(mood => {
        const exp = getCelebrationExperience({
          occasion: 'birthday',
          mood
        });
        expect(exp.moodUsed).toBe(mood);
      });
    });

    test('hasSafetyOverrides correctly set', () => {
      // Sympathy + Funny should have safety overrides
      const sympathyFunny = getCelebrationExperience({
        occasion: 'sympathy',
        mood: 'funny'
      });
      expect(sympathyFunny.hasSafetyOverrides).toBe(true);

      // Birthday + Funny should NOT have safety overrides
      const birthdayFunny = getCelebrationExperience({
        occasion: 'birthday',
        mood: 'funny'
      });
      expect(birthdayFunny.hasSafetyOverrides).toBe(false);
    });
  });

  // Category validation
  describe('Categories', () => {
    test('all occasions have valid categories', () => {
      const validCategories = ['celebrate', 'love', 'family', 'milestones', 'support'];

      Object.values(OCCASIONS).forEach(occasion => {
        expect(validCategories).toContain(occasion.category);
      });
    });
  });
});
