/** Subset of the front-document response that decides what the capture UI does next */
export interface FrontUploadResponse {
  retryable?: boolean;
  retries_left?: number;
  rejection_reason?: string | null;
  final_result?: string | null;
  current_step?: string;
}

export type FrontUploadOutcome =
  | { kind: 'retake'; retriesLeft: number }
  | { kind: 'final' }
  | { kind: 'continue' };

/**
 * A rejection_reason alone does not mean "retake": an unreadable document escalated
 * to manual review keeps its reason but the session moves on to the next step.
 * Only a retryable response keeps the session on the front step.
 */
export function getFrontUploadOutcome(data: FrontUploadResponse | null | undefined): FrontUploadOutcome {
  if (data?.retryable) return { kind: 'retake', retriesLeft: data.retries_left ?? 0 };
  if (data?.final_result === 'failed') return { kind: 'final' };
  return { kind: 'continue' };
}
