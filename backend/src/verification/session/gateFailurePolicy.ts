import type { UnreadableDocumentAction } from './VerificationSession.js';

export const MAX_GATE_RETRIES_LIMIT = 5;
export const UNREADABLE_DOCUMENT_ACTIONS: readonly UnreadableDocumentAction[] = ['reject', 'manual_review'];

/** How a session reacts to gate failures; resolved once at initialize and persisted in addons */
export interface GateFailurePolicy {
  maxGateRetries: number;
  unreadableDocumentAction: UnreadableDocumentAction;
}

export interface GateFailurePolicyInput {
  max_gate_retries?: unknown;
  unreadable_document_action?: unknown;
}

const DEFAULT_POLICY: GateFailurePolicy = { maxGateRetries: 0, unreadableDocumentAction: 'reject' };

const INTEGER_STRING = /^\d+$/;

function parseRetries(value: unknown): number | undefined {
  // JSON clients may send the count as a string ("2"); accept plain integers only
  const numeric = typeof value === 'string' && INTEGER_STRING.test(value) ? Number(value) : value;
  return typeof numeric === 'number' && Number.isInteger(numeric) && numeric >= 0 && numeric <= MAX_GATE_RETRIES_LIMIT
    ? numeric
    : undefined;
}

function parseAction(value: unknown): UnreadableDocumentAction | undefined {
  return UNREADABLE_DOCUMENT_ACTIONS.includes(value as UnreadableDocumentAction)
    ? (value as UnreadableDocumentAction)
    : undefined;
}

/** Request parameters win over developer defaults; invalid values fall back to the safe default */
export function resolveGateFailurePolicy(
  request: GateFailurePolicyInput,
  developerDefaults: GateFailurePolicyInput | null | undefined,
): GateFailurePolicy {
  return {
    maxGateRetries: parseRetries(request.max_gate_retries)
      ?? parseRetries(developerDefaults?.max_gate_retries)
      ?? DEFAULT_POLICY.maxGateRetries,
    unreadableDocumentAction: parseAction(request.unreadable_document_action)
      ?? parseAction(developerDefaults?.unreadable_document_action)
      ?? DEFAULT_POLICY.unreadableDocumentAction,
  };
}

export function gateFailurePolicyFromAddons(addons: GateFailurePolicyInput | null | undefined): GateFailurePolicy {
  return resolveGateFailurePolicy(addons ?? {}, null);
}
