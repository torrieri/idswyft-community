/**
 * A reviewer's decision (reviewed_at set) is final: the consistency monitor
 * must not recompute it from the automatic scores. Regression for an approved
 * verification with a low liveness score being flipped back to manual_review
 * every few minutes.
 */

vi.mock('@/config/database.js', () => ({
  supabase: { from: vi.fn() },
}));
vi.mock('@/utils/logger.js', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/config/database.js';
import { VerificationConsistencyService } from '../verificationConsistency.js';
import { ConsistencyMonitor } from '../consistencyMonitor.js';

interface RecordedCall {
  method: string;
  args: unknown[];
}

/** Chainable query mock: records every call and resolves to `result` when awaited */
function queryMock(result: { data: unknown; error: unknown }) {
  const calls: RecordedCall[] = [];
  const promise = Promise.resolve(result);
  const query: Record<string, unknown> = {};
  for (const method of ['select', 'update', 'eq', 'gte', 'in', 'is', 'order', 'limit', 'single']) {
    query[method] = (...args: unknown[]) => {
      calls.push({ method, args });
      return query;
    };
  }
  query.then = (onFulfilled: (value: unknown) => unknown, onRejected?: (reason: unknown) => unknown) =>
    promise.then(onFulfilled, onRejected);
  return { query, calls };
}

const lowLivenessVerification = {
  id: 'v-1',
  status: 'verified',
  is_sandbox: false,
  face_match_score: 0.95,
  liveness_score: 0.4,
  cross_validation_score: 1,
  live_capture_completed: true,
  documents: [{ id: 'd-1' }],
  selfies: [],
};

function statusWrittenBy(calls: RecordedCall[]): unknown {
  const update = calls.find(call => call.method === 'update');
  return (update?.args[0] as { status?: unknown } | undefined)?.status;
}

describe('VerificationConsistencyService.recalculateConsistentScores', () => {
  beforeEach(() => vi.mocked(supabase.from).mockReset());

  it('keeps the status a reviewer decided', async () => {
    const read = queryMock({ data: { ...lowLivenessVerification, reviewed_at: '2026-10-08T01:49:25Z' }, error: null });
    const write = queryMock({ data: null, error: null });
    vi.mocked(supabase.from).mockReturnValueOnce(read.query as never).mockReturnValueOnce(write.query as never);

    const result = await new VerificationConsistencyService().recalculateConsistentScores('v-1');

    expect(result.final_status).toBe('verified');
    expect(statusWrittenBy(write.calls)).toBe('verified');
  });

  it('still recomputes the status of an automatic decision', async () => {
    const read = queryMock({ data: { ...lowLivenessVerification, reviewed_at: null }, error: null });
    const write = queryMock({ data: null, error: null });
    vi.mocked(supabase.from).mockReturnValueOnce(read.query as never).mockReturnValueOnce(write.query as never);

    const result = await new VerificationConsistencyService().recalculateConsistentScores('v-1');

    expect(result.final_status).not.toBe('verified');
    expect(statusWrittenBy(write.calls)).toBe(result.final_status);
  });
});

describe('ConsistencyMonitor', () => {
  beforeEach(() => vi.mocked(supabase.from).mockReset());

  it('only checks verifications without a reviewer decision', async () => {
    const recent = queryMock({ data: [], error: null });
    vi.mocked(supabase.from).mockReturnValueOnce(recent.query as never);
    const monitor = new ConsistencyMonitor();

    await (monitor as unknown as { performConsistencyCheck(): Promise<void> }).performConsistencyCheck();

    expect(recent.calls).toContainEqual({ method: 'is', args: ['reviewed_at', null] });
  });
});
