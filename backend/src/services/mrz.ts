/**
 * MRZ (Machine Readable Zone) Service
 *
 * Wraps the `mrz` library to parse all 3 ICAO MRZ formats:
 *   - TD1 (ID cards, 3 lines × 30 chars)
 *   - TD2 (ID cards, 2 lines × 36 chars)
 *   - TD3 (Passports, 2 lines × 44 chars)
 *
 * Also handles detection of MRZ patterns in raw OCR text.
 */

import { parse as parseMRZ } from 'mrz';
import type { ParseResult, MRZFormat } from 'mrz';
import { logger } from '@/utils/logger.js';

export interface MRZParseResult {
  format: MRZFormat;
  valid: boolean;
  check_digits_valid: boolean;
  fields: {
    document_number: string | null;
    first_name: string | null;
    last_name: string | null;
    full_name: string | null;
    date_of_birth: string | null;   // YYYY-MM-DD
    expiry_date: string | null;     // YYYY-MM-DD
    nationality: string | null;     // ISO alpha-3
    issuing_country: string | null; // ISO alpha-3 (issuingState from MRZ)
    sex: string | null;
  };
  raw_lines: string[];
}

// MRZ line length → expected format (TD1, TD2, TD3)
const MRZ_TARGET_LENGTHS = [30, 36, 44];

// A real but OCR-degraded MRZ line is far more often a few characters SHORT
// (the trailing "<" filler run is easy to under-read/drop) than it is long,
// so the tolerance windows below are asymmetric. Kept tight enough that the
// three target lengths' windows never overlap (30±[4,1] → [26,31],
// 36±[4,1] → [32,37], 44±[4,1] → [40,45]) — overlapping windows would make a
// borderline-length line ambiguous between two formats.
const SHORT_TOLERANCE = 4;
const LONG_TOLERANCE = 1;
const MIN_CANDIDATE_LENGTH = Math.min(...MRZ_TARGET_LENGTHS) - SHORT_TOLERANCE;

/** Which MRZ target length (if any) a candidate's length falls within tolerance of. */
function matchTargetLength(len: number): number | null {
  for (const target of MRZ_TARGET_LENGTHS) {
    if (len >= target - SHORT_TOLERANCE && len <= target + LONG_TOLERANCE) return target;
  }
  return null;
}

/**
 * Detect MRZ-like lines in raw OCR text.
 * MRZ lines consist of uppercase letters, digits, and `<` filler characters.
 * Lines within a small length tolerance of a target format are normalized —
 * padded with trailing `<` if short, truncated from the end if long — before
 * being grouped. Returns the detected lines (each exactly at its matched
 * target length), or null if none found.
 */
export function detectMRZInText(rawText: string): string[] | null {
  if (!rawText) return null;

  const lines = rawText.split('\n').map(l => l.trim());
  // Group by matched target length (30/36/44), not raw length.
  const byTarget = new Map<number, string[]>();

  for (const line of lines) {
    // MRZ lines: uppercase letters, digits, and < filler only
    const cleaned = line.replace(/\s/g, '');
    if (cleaned.length < MIN_CANDIDATE_LENGTH || !/^[A-Z0-9<]+$/.test(cleaned)) continue;

    const target = matchTargetLength(cleaned.length);
    if (target === null) continue;

    const normalized =
      cleaned.length === target ? cleaned :
      cleaned.length < target ? cleaned.padEnd(target, '<') :
      cleaned.slice(0, target);

    if (!byTarget.has(target)) byTarget.set(target, []);
    byTarget.get(target)!.push(normalized);
  }

  // TD1 = 3 lines of 30, TD2 = 2 lines of 36, TD3 = 2 lines of 44
  for (const [len, group] of byTarget) {
    if (len === 30 && group.length >= 3) return group.slice(0, 3);
    if ((len === 36 || len === 44) && group.length >= 2) return group.slice(0, 2);
  }

  return null;
}

/**
 * Parse MRZ lines using the `mrz` library.
 * Returns structured fields or null if parsing fails.
 */
export function parseMRZLines(lines: string[]): MRZParseResult | null {
  try {
    const result: ParseResult = parseMRZ(lines, { autocorrect: true });

    const fields = result.fields;

    return {
      format: result.format,
      valid: result.valid,
      check_digits_valid: result.valid,
      fields: {
        document_number: fields.documentNumber ?? null,
        first_name: fields.firstName ?? null,
        last_name: fields.lastName ?? null,
        full_name: [fields.firstName, fields.lastName].filter(Boolean).join(' ') || null,
        date_of_birth: normalizeMRZDate(fields.birthDate ?? null, 'birth'),
        expiry_date: normalizeMRZDate(fields.expirationDate ?? null, 'expiry'),
        nationality: fields.nationality ?? null,
        issuing_country: fields.issuingState ?? null,
        sex: fields.sex ?? null,
      },
      raw_lines: lines,
    };
  } catch (error) {
    logger.warn('MRZ parsing failed', {
      error: error instanceof Error ? error.message : 'Unknown',
      lineCount: lines.length,
      lineLengths: lines.map(l => l.length),
    });
    return null;
  }
}

/**
 * Convenience: detect + parse MRZ from raw OCR text in one call.
 */
export function extractMRZFromText(rawText: string): MRZParseResult | null {
  const lines = detectMRZInText(rawText);
  if (!lines) return null;
  return parseMRZLines(lines);
}

/**
 * Resolve the century for a two-digit MRZ year.
 *
 * ICAO 9303 stores years as two digits, so the century must be inferred. A single
 * fixed pivot cannot work for both field types — it is the semantics of the field
 * that decide:
 *
 *   - Birth dates are always in the past. A year above the current two-digit year
 *     must belong to the 1900s (in 2026: `60` → 1960, `05` → 2005).
 *   - Expiry dates are overwhelmingly in the future or recent past. Treating them
 *     with a birth-date pivot turns a valid document into a long-expired one
 *     (in 2026: `31` → 1931 instead of 2031). Only years that would land absurdly
 *     far ahead are read as 1900s, which keeps genuinely ancient documents parseable.
 */
function resolveCentury(yy: number, fieldType: MRZDateField): '19' | '20' {
  const currentYY = new Date().getFullYear() % 100;

  if (fieldType === 'birth') {
    return yy > currentYY ? '19' : '20';
  }

  // expiry: allow a wide forward window before falling back to the 1900s
  return yy > currentYY + 70 ? '19' : '20';
}

type MRZDateField = 'birth' | 'expiry';

/**
 * Convert MRZ date format (YYMMDD) to ISO (YYYY-MM-DD).
 * The `mrz` library returns dates already formatted, but sometimes as YYMMDD.
 *
 * `fieldType` selects the century rule — see resolveCentury().
 */
function normalizeMRZDate(dateStr: string | null, fieldType: MRZDateField = 'birth'): string | null {
  if (!dateStr) return null;

  // Already ISO format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;

  // YYMMDD format from MRZ
  if (/^\d{6}$/.test(dateStr)) {
    const yy = parseInt(dateStr.slice(0, 2));
    const mm = dateStr.slice(2, 4);
    const dd = dateStr.slice(4, 6);
    const century = resolveCentury(yy, fieldType);
    return `${century}${dateStr.slice(0, 2)}-${mm}-${dd}`;
  }

  return dateStr;
}

// Re-export alpha3ToAlpha2 from normalizers for backward compatibility
export { alpha3ToAlpha2 } from '@/verification/cross-validator/normalizers.js';
