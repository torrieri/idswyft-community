const TERMINAL_FINAL_RESULTS = new Set(['failed', 'manual_review']);

/**
 * An upload error that may mean the verification already finished (e.g. it was
 * rejected in a previous step): the caller should check /status and show the
 * result screen, which offers "Try Again", instead of a dead-end error.
 */
export function isPossiblyTerminalUploadError(
  status: number,
  body: Record<string, unknown> | null | undefined,
): boolean {
  if (status === 409) return true;
  return typeof body?.final_result === 'string' && TERMINAL_FINAL_RESULTS.has(body.final_result);
}
