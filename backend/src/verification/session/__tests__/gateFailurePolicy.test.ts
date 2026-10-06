import { describe, it, expect } from 'vitest';
import { resolveGateFailurePolicy, gateFailurePolicyFromAddons } from '../gateFailurePolicy.js';

describe('resolveGateFailurePolicy', () => {
  it('defaults to no retries and rejecting unreadable documents', () => {
    expect(resolveGateFailurePolicy({}, null)).toEqual({
      maxGateRetries: 0,
      unreadableDocumentAction: 'reject',
    });
  });

  it('uses the developer defaults when the request does not specify them', () => {
    const policy = resolveGateFailurePolicy({}, { max_gate_retries: 2, unreadable_document_action: 'manual_review' });

    expect(policy).toEqual({ maxGateRetries: 2, unreadableDocumentAction: 'manual_review' });
  });

  it('lets the initialize request override the developer defaults', () => {
    const policy = resolveGateFailurePolicy(
      { max_gate_retries: 0, unreadable_document_action: 'reject' },
      { max_gate_retries: 3, unreadable_document_action: 'manual_review' },
    );

    expect(policy).toEqual({ maxGateRetries: 0, unreadableDocumentAction: 'reject' });
  });

  it('accepts integer retries sent as numeric strings', () => {
    expect(resolveGateFailurePolicy({ max_gate_retries: '2' }, null).maxGateRetries).toBe(2);
  });

  it('rejects non-integer numeric strings', () => {
    expect(resolveGateFailurePolicy({ max_gate_retries: '1.5' }, null).maxGateRetries).toBe(0);
  });

  it('ignores invalid stored developer values instead of trusting them', () => {
    const policy = resolveGateFailurePolicy({}, { max_gate_retries: 99, unreadable_document_action: 'approve' });

    expect(policy).toEqual({ maxGateRetries: 0, unreadableDocumentAction: 'reject' });
  });
});

describe('gateFailurePolicyFromAddons', () => {
  it('restores the policy persisted at initialize', () => {
    const policy = gateFailurePolicyFromAddons({ max_gate_retries: 1, unreadable_document_action: 'manual_review' });

    expect(policy).toEqual({ maxGateRetries: 1, unreadableDocumentAction: 'manual_review' });
  });

  it('falls back to the safe defaults for sessions created before the policy existed', () => {
    expect(gateFailurePolicyFromAddons(undefined)).toEqual({ maxGateRetries: 0, unreadableDocumentAction: 'reject' });
  });
});
