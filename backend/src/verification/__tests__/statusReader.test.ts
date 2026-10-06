import { describe, it, expect, vi } from 'vitest';

vi.mock('@/config/database.js', () => ({ supabase: { from: vi.fn() } }));

import { mapStatusForResponse } from '../statusReader.js';
import { VerificationStatus, FLOW_PRESETS } from '@idswyft/shared';
import type { SessionState } from '../session/VerificationSession.js';

function completedState(overrides: Partial<SessionState> = {}): SessionState {
  return {
    session_id: 'sess-1',
    current_step: VerificationStatus.COMPLETE,
    issuing_country: null,
    rejection_reason: null,
    rejection_detail: null,
    front_extraction: null,
    back_extraction: null,
    cross_validation: null,
    face_match: null,
    liveness: null,
    created_at: '2026-10-06T00:00:00.000Z',
    updated_at: '2026-10-06T00:00:00.000Z',
    completed_at: '2026-10-06T00:01:00.000Z',
    ...overrides,
  } as SessionState;
}

describe('mapStatusForResponse — final_result', () => {
  it('reports a clean completed session as verified', () => {
    expect(mapStatusForResponse(completedState()).final_result).toBe('verified');
  });

  it('reports a session forced into manual review as manual_review, not verified', () => {
    const state = completedState({ force_manual_review: true });

    expect(mapStatusForResponse(state).final_result).toBe('manual_review');
  });

  it('reports a completed session with a soft rejection as manual_review', () => {
    const state = completedState({ rejection_reason: 'FRONT_OCR_FAILED' as any });

    expect(mapStatusForResponse(state).final_result).toBe('manual_review');
  });

  it.each(['age_only', 'document_only', 'identity'] as const)(
    'applies the manual-review override in %s mode',
    (preset) => {
      const state = completedState({ force_manual_review: true });

      expect(mapStatusForResponse(state, FLOW_PRESETS[preset]).final_result).toBe('manual_review');
    },
  );

  it('keeps a document_only cross-validation REJECT as failed', () => {
    const state = completedState({
      force_manual_review: true,
      cross_validation: { verdict: 'REJECT' } as any,
    });

    expect(mapStatusForResponse(state, FLOW_PRESETS.document_only).final_result).toBe('failed');
  });

  it('reports a hard-rejected session as failed', () => {
    const state = completedState({ current_step: VerificationStatus.HARD_REJECTED, rejection_reason: 'FRONT_OCR_FAILED' as any });

    expect(mapStatusForResponse(state).final_result).toBe('failed');
  });
});
