type FieldMap = Record<string, string>;

interface DocumentRow {
  ocr_data?: FieldMap | null;
  ocr_extracted?: boolean | null;
}

interface SessionContext {
  front_extraction?: { ocr?: Record<string, unknown> | null } | null;
  back_extraction?: {
    qr_payload?: Record<string, unknown> | null;
    mrz_result?: { fields?: Record<string, unknown> | null } | null;
    barcode_format?: string | null;
  } | null;
}

export interface ReviewOcrFields {
  extracted: boolean | null;
  fields: FieldMap | null;
  back_fields: FieldMap | null;
  barcode_format: string | null;
}

// Long or diagnostic values that read as noise in the reviewer's field table
const HIDDEN_FIELDS = new Set(['raw_text']);

/** Keep only non-empty scalar values, rendered as strings for the reviewer table */
function toReadableFields(source: Record<string, unknown> | null | undefined): FieldMap | null {
  if (!source) return null;
  const entries = Object.entries(source)
    .filter(([key, value]) => !HIDDEN_FIELDS.has(key)
      && (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')
      && String(value).trim() !== '')
    .map(([key, value]) => [key, String(value)] as const);
  return entries.length > 0 ? Object.fromEntries(entries) : null;
}

/**
 * OCR fields for the reviewer detail view. The legacy flow stored OCR on the
 * documents rows; the v2 session flow only keeps it in the session context
 * (verification_contexts), so fall back to that.
 */
export function resolveReviewOcrFields(
  frontDoc: DocumentRow | null | undefined,
  backDoc: DocumentRow | null | undefined,
  ctx: SessionContext | null | undefined,
): ReviewOcrFields {
  const back = ctx?.back_extraction;
  const sessionFrontFields = toReadableFields(ctx?.front_extraction?.ocr);

  return {
    extracted: frontDoc?.ocr_extracted ?? (sessionFrontFields ? true : null),
    fields: frontDoc?.ocr_data ?? sessionFrontFields,
    back_fields: backDoc?.ocr_data ?? toReadableFields(back?.qr_payload) ?? toReadableFields(back?.mrz_result?.fields),
    barcode_format: back?.barcode_format ?? null,
  };
}
