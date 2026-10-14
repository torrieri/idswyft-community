/**
 * OCR logs must never carry what was read from the document: names, numbers,
 * dates and raw text are the applicant's personal data. Only metadata (field
 * names, counts, layout, confidence) may be logged.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockRecognize = vi.fn();

vi.mock('ppu-paddle-ocr', () => {
  class MockPaddleOcrService {
    initialize = vi.fn().mockResolvedValue(undefined);
    recognize = mockRecognize;
    destroy = vi.fn();
  }
  return { PaddleOcrService: MockPaddleOcrService };
});

const loggedCalls: unknown[][] = [];
vi.mock('@/utils/logger.js', () => {
  const record = (...args: unknown[]) => { loggedCalls.push(args); };
  return { logger: { info: record, warn: record, error: record, debug: record } };
});

import { PaddleOCRProvider } from '../PaddleOCRProvider.js';

function ocrResult(lineTexts: string[][]) {
  const lines = lineTexts.map((items, row) =>
    items.map((text, col) => ({ text, confidence: 0.95, box: { x: col * 120, y: row * 30, width: 100, height: 20 } })),
  );
  return { text: lineTexts.map(l => l.join(' ')).join('\n'), lines, confidence: 0.95 };
}

function everythingLogged(): string {
  return JSON.stringify(loggedCalls);
}

describe('PaddleOCRProvider logs', () => {
  beforeEach(() => {
    loggedCalls.length = 0;
    mockRecognize.mockReset();
  });

  it('does not log the values read from a US driving licence', async () => {
    mockRecognize.mockResolvedValue(ocrResult([
      ['Full Name:', 'JANE SMITH'],
      ['DOB:', '05/22/1985'],
      ['License No:', 'D1234567'],
      ['Expires:', '11/15/2028'],
    ]));

    const data = await new PaddleOCRProvider().processDocument(Buffer.from('img'), 'drivers_license');

    expect(data.document_number).toBe('D1234567');
    const logged = everythingLogged();
    for (const personalValue of ['JANE', 'SMITH', 'D1234567', '05/22/1985', '11/15/2028']) {
      expect(logged).not.toContain(personalValue);
    }
    expect(logged).toContain('PaddleOCRProvider: extraction result');
  });

  it('does not log the values of EU numbered licence fields', async () => {
    mockRecognize.mockResolvedValue(ocrResult([
      ['FÜHRERSCHEIN'],
      ['1. MUSTERMANN'],
      ['2. ERIKA'],
      ['3. 12.08.1964 BERLIN'],
      ['4a. 19.01.2015'],
      ['4b. 18.01.2030'],
      ['5. B072RRE2I55'],
    ]));

    await new PaddleOCRProvider().processDocument(Buffer.from('img'), 'drivers_license', 'DE');

    const logged = everythingLogged();
    for (const personalValue of ['MUSTERMANN', 'ERIKA', '12.08.1964', 'B072RRE2I55']) {
      expect(logged).not.toContain(personalValue);
    }
    expect(logged).toContain('EU DL numbered fields extracted');
  });
});
