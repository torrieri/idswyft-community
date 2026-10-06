const TRUNCATE_THRESHOLD = 12;
const MISSING_ID_PLACEHOLDER = '-';

// GDPR erasure anonymizes verification_requests by nulling user_id while keeping
// the row for the audit trail, so every admin view must tolerate a null user_id.
export const ANONYMIZED_USER_LABEL = 'Anonymized';

export interface SearchableVerification {
  id: string;
  user_id: string | null;
}

export function truncateId(id: string | null | undefined): string {
  if (!id) return MISSING_ID_PLACEHOLDER;
  if (id.length <= TRUNCATE_THRESHOLD) return id;
  return `${id.slice(0, 6)}...${id.slice(-4)}`;
}

export function formatUserId(userId: string | null | undefined): string {
  return userId ? truncateId(userId) : ANONYMIZED_USER_LABEL;
}

export function matchesVerificationSearch(verification: SearchableVerification, query: string): boolean {
  const needle = query.toLowerCase();
  return (
    verification.id.toLowerCase().includes(needle) ||
    (verification.user_id ?? '').toLowerCase().includes(needle)
  );
}
