import { describe, it, expect } from 'vitest';
import { getFrontUploadOutcome } from './frontUploadOutcome';

describe('getFrontUploadOutcome', () => {
  it('asks for a retake when the gate failure is retryable', () => {
    const outcome = getFrontUploadOutcome({ retryable: true, retries_left: 2, rejection_reason: 'FRONT_OCR_FAILED' });

    expect(outcome).toEqual({ kind: 'retake', retriesLeft: 2 });
  });

  it('shows the final result when the session was hard-rejected', () => {
    const outcome = getFrontUploadOutcome({ rejection_reason: 'FRONT_OCR_FAILED', final_result: 'failed' });

    expect(outcome).toEqual({ kind: 'final' });
  });

  it('continues when an unreadable document was escalated to manual review', () => {
    const outcome = getFrontUploadOutcome({ rejection_reason: 'FRONT_OCR_FAILED', current_step: 'AWAITING_BACK' });

    expect(outcome).toEqual({ kind: 'continue' });
  });

  it('continues on a clean pass', () => {
    expect(getFrontUploadOutcome({ rejection_reason: null })).toEqual({ kind: 'continue' });
  });

  it('continues when the response body could not be parsed', () => {
    expect(getFrontUploadOutcome(null)).toEqual({ kind: 'continue' });
  });

  it('treats a missing retry count as zero', () => {
    expect(getFrontUploadOutcome({ retryable: true })).toEqual({ kind: 'retake', retriesLeft: 0 });
  });
});
