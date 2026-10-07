import { describe, it, expect } from 'vitest';
import { resolveReviewOcrFields } from '../reviewOcrFields.js';

const sessionContext = {
  front_extraction: {
    ocr: {
      full_name: 'JUAN PEREZ',
      date_of_birth: '1990-01-15',
      id_number: '',
      expiry_date: '2028-07-03',
      raw_text: 'LICENCIA DE CONDUCIR\nJUAN PEREZ',
      confidence_scores: { full_name: 0.9 },
      classification_confidence: 1,
    },
  },
  back_extraction: {
    qr_payload: { id_number: '12345678', full_name: 'JUAN PEREZ', nationality: null },
    mrz_result: null,
    barcode_format: 'PDF417',
  },
};

describe('resolveReviewOcrFields', () => {
  it('prefers OCR stored on the document rows (legacy flow)', () => {
    const result = resolveReviewOcrFields({ ocr_data: { full_name: 'LEGACY' } }, { ocr_data: { id_number: 'B1' } }, sessionContext);

    expect(result.fields).toEqual({ full_name: 'LEGACY' });
    expect(result.back_fields).toEqual({ id_number: 'B1' });
  });

  it('falls back to the session front OCR, keeping only readable scalar values', () => {
    const result = resolveReviewOcrFields(undefined, undefined, sessionContext);

    expect(result.fields).toEqual({
      full_name: 'JUAN PEREZ',
      date_of_birth: '1990-01-15',
      expiry_date: '2028-07-03',
      classification_confidence: '1',
    });
    expect(result.extracted).toBe(true);
  });

  it('falls back to the decoded barcode for the back of the document', () => {
    const result = resolveReviewOcrFields(undefined, undefined, sessionContext);

    expect(result.back_fields).toEqual({ id_number: '12345678', full_name: 'JUAN PEREZ' });
    expect(result.barcode_format).toBe('PDF417');
  });

  it('uses MRZ fields when the back has no barcode', () => {
    const ctx = { back_extraction: { qr_payload: null, mrz_result: { fields: { document_number: 'P123' } }, barcode_format: 'MRZ_TD1' } };

    expect(resolveReviewOcrFields(undefined, undefined, ctx).back_fields).toEqual({ document_number: 'P123' });
  });

  it('returns nulls when nothing was extracted', () => {
    expect(resolveReviewOcrFields(undefined, undefined, {})).toEqual({
      extracted: null, fields: null, back_fields: null, barcode_format: null,
    });
  });
});
