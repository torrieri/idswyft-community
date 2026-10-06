import { describe, it, expect } from 'vitest';
import { truncateId, formatUserId, matchesVerificationSearch, ANONYMIZED_USER_LABEL } from './verificationDisplay';

describe('truncateId', () => {
  it('shortens ids longer than 12 characters', () => {
    expect(truncateId('7feb1c8f-e82b-4dee-84f1-6b87a5aaad06')).toBe('7feb1c...ad06');
  });

  it('returns short ids unchanged', () => {
    expect(truncateId('abc123')).toBe('abc123');
  });

  it('returns a dash for null ids instead of throwing', () => {
    expect(truncateId(null)).toBe('-');
  });

  it('returns a dash for undefined ids', () => {
    expect(truncateId(undefined)).toBe('-');
  });
});

describe('formatUserId', () => {
  it('labels GDPR-anonymized verifications (user_id nulled)', () => {
    expect(formatUserId(null)).toBe(ANONYMIZED_USER_LABEL);
  });

  it('truncates present user ids', () => {
    expect(formatUserId('7feb1c8f-e82b-4dee-84f1-6b87a5aaad06')).toBe('7feb1c...ad06');
  });
});

describe('matchesVerificationSearch', () => {
  const verification = { id: 'ABC-verification', user_id: 'user-XYZ' };
  const anonymized = { id: 'def-verification', user_id: null };

  it('matches on verification id case-insensitively', () => {
    expect(matchesVerificationSearch(verification, 'abc')).toBe(true);
  });

  it('matches on user id case-insensitively', () => {
    expect(matchesVerificationSearch(verification, 'xyz')).toBe(true);
  });

  it('returns false when nothing matches', () => {
    expect(matchesVerificationSearch(verification, 'nope')).toBe(false);
  });

  it('does not throw for anonymized verifications and still matches by id', () => {
    expect(matchesVerificationSearch(anonymized, 'def')).toBe(true);
    expect(matchesVerificationSearch(anonymized, 'user')).toBe(false);
  });
});
