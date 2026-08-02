import { describe, it, expect } from 'vitest';
import { InternationalExtractor } from '../extractors/InternationalExtractor.js';
import { getCountryFormat } from '@idswyft/shared';
import type { OCRData } from '@idswyft/shared';

// NOTE: all names/numbers below are SYNTHETIC — never real specimen data.
// The line layouts mirror real structural failure modes found on a real
// Guatemalan DPI (glued CUI+name tokens, side-by-side column labels,
// surname/given-name printed as separate labeled lines) without using
// that specimen's actual personal data.

type Item = { text: string; confidence: number; box: { x: number; y: number; width: number; height: number } };

let y = 0;
const line = (text: string, confidence = 0.9): Item[] => {
  y += 20;
  return [{ text, confidence, box: { x: 0, y, width: text.length * 8, height: 20 } }];
};

function freshOcrData(): OCRData {
  return { confidence_scores: {} };
}

describe('InternationalExtractor — GT (Guatemala) real-world extraction fixes', () => {
  const gtFormat = getCountryFormat('GT', 'national_id')!;

  it('splits surname + given name via separate labels (regression: /appell/i typo + missing "nombre" keyword previously left both filters empty)', () => {
    y = 0;
    const lines = [
      line('APELLIDO:'),
      line('PEREZ'),
      line('NOMBRE:'),
      line('MARIA'),
    ];
    const ocrData = freshOcrData();
    new InternationalExtractor().extract(lines, ocrData, gtFormat, 'GT');

    // Before the fix, neither /apellidos?/i nor /nombres?/i matched the
    // surname/given-name filter regexes (typo'd "appell", and given-name
    // filter had no Spanish keyword at all), so extraction fell through to
    // the generic combined-label search — which, for this exact line order,
    // only ever captured the surname ("PEREZ"), silently dropping the given
    // name. After the fix it must combine both.
    expect(ocrData.name).toBe('MARIA PEREZ');
  });

  it('extracts the CUI via a full-text id_number_regex fallback when the label-adjacent value is glued to unrelated OCR noise', () => {
    y = 0;
    const lines = [
      line('CODIGO UNICO DE IDENTIFICACION NOMBRE:'),
      // Real-world OCR artifact: the CUI number, the "CUI-" marker, and the
      // first name all land on one glued line, with the actual 13-digit CUI
      // appearing BEFORE the "CUI" label token — unreachable by the
      // forward-only label-adjacency search in findField().
      line('1234 56789 0123 CUI- MARIA'),
      line('APELLIDO:'),
      line('PEREZ'),
    ];
    const ocrData = freshOcrData();
    new InternationalExtractor().extract(lines, ocrData, gtFormat, 'GT');

    expect(ocrData.document_number).toBe('1234 56789 0123');
  });

  it('does not overwrite a document_number already found via the normal label-adjacency path', () => {
    // DO's cédula shape (hyphenated) rather than GT's (pure digits), because
    // isLabelOrNoise() rejects any pure-digit string as noise by design —
    // GT's own CUI can only ever reach ocrData.document_number through the
    // new fallback below, which is exactly the scenario the previous test
    // covers. This test needs a shape the *original* label-adjacency path
    // can succeed on by itself, to prove the fallback doesn't clobber it.
    const doFormat = getCountryFormat('DO', 'national_id')!;
    y = 0;
    const lines = [
      line('CEDULA:'),
      line('001-1234567-8'),
    ];
    const ocrData = freshOcrData();
    new InternationalExtractor().extract(lines, ocrData, doFormat, 'DO');

    expect(ocrData.document_number).toBe('001-1234567-8');
    // The label-adjacency path's confidence is the line's own OCR confidence
    // (0.9 here); the fallback always sets a fixed 0.7. Seeing 0.9 back
    // proves the fallback never ran (or if it did, never overwrote this).
    expect(ocrData.confidence_scores!.document_number).toBe(0.9);
  });
});
