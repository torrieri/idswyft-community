import { describe, it, expect, vi, beforeEach } from 'vitest';

let updateResult: { data: unknown; error: { message: string } | null } = { data: [{ id: 'v-1' }], error: null };
let lastUpdatePayload: Record<string, unknown> | null = null;
const eqCalls: Array<[string, unknown]> = [];

vi.mock('@/config/database.js', () => ({
  supabase: {
    from: vi.fn(() => {
      const builder: any = {
        update: vi.fn((payload: Record<string, unknown>) => { lastUpdatePayload = payload; return builder; }),
        eq: vi.fn((col: string, val: unknown) => { eqCalls.push([col, val]); return builder; }),
        select: vi.fn(() => Promise.resolve(updateResult)),
      };
      return builder;
    }),
  },
}));

vi.mock('@/utils/logger.js', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

import { resetVerificationForRestart } from '../verificationRestart.js';

describe('resetVerificationForRestart', () => {
  beforeEach(() => {
    updateResult = { data: [{ id: 'v-1' }], error: null };
    lastUpdatePayload = null;
    eqCalls.length = 0;
  });

  it('resets the row and bumps retry_count under an optimistic lock', async () => {
    const outcome = await resetVerificationForRestart('v-1', 1);

    expect(outcome).toBe('reset');
    expect(lastUpdatePayload).toMatchObject({ status: 'pending', retry_count: 2, failure_reason: null });
    expect(eqCalls).toEqual([['id', 'v-1'], ['retry_count', 1]]);
  });

  it('only touches columns that exist on verification_requests', async () => {
    await resetVerificationForRestart('v-1', 0);

    // completed_at lives on other tables; writing it made every restart fail
    expect(lastUpdatePayload).not.toHaveProperty('completed_at');
  });

  it('reports a conflict when another request already restarted the verification', async () => {
    updateResult = { data: [], error: null };

    expect(await resetVerificationForRestart('v-1', 0)).toBe('conflict');
  });

  it('throws instead of reporting a conflict when the database rejects the update', async () => {
    updateResult = { data: null, error: { message: 'column "x" does not exist' } };

    await expect(resetVerificationForRestart('v-1', 0)).rejects.toThrow('Failed to reset verification for restart');
  });
});
