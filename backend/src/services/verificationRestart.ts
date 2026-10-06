import { supabase } from '@/config/database.js';
import { logger } from '@/utils/logger.js';

export type RestartResetOutcome = 'reset' | 'conflict';

/**
 * Reset a failed verification_requests row so the same verification can be retried.
 *
 * The optimistic lock on retry_count turns concurrent restarts into 'conflict'.
 * A database error is thrown, never reported as a conflict: that disguise hid a
 * write to a non-existent column and made every restart answer 409.
 */
export async function resetVerificationForRestart(
  verificationId: string,
  currentRetryCount: number,
): Promise<RestartResetOutcome> {
  const { data, error } = await supabase.from('verification_requests').update({
    status: 'pending',
    face_match_score: null,
    liveness_score: null,
    cross_validation_score: null,
    failure_reason: null,
    processing_completed_at: null,
    document_id: null,
    selfie_id: null,
    retry_count: currentRetryCount + 1,
    duplicate_flags: null,
    voice_match_score: null,
    voice_challenge: null,
    voice_challenge_created_at: null,
  }).eq('id', verificationId)
    .eq('retry_count', currentRetryCount)
    .select('id');

  if (error) {
    logger.error('Failed to reset verification for restart', { verificationId, error: error.message });
    throw new Error('Failed to reset verification for restart');
  }

  return Array.isArray(data) && data.length > 0 ? 'reset' : 'conflict';
}
