import { describe, it, expect } from 'vitest';
import { isPossiblyTerminalUploadError } from './terminalUploadError';

describe('isPossiblyTerminalUploadError', () => {
  it('treats a 409 conflict as possibly terminal', () => {
    expect(isPossiblyTerminalUploadError(409, null)).toBe(true);
  });

  it('treats a failed final result as possibly terminal', () => {
    expect(isPossiblyTerminalUploadError(400, { final_result: 'failed' })).toBe(true);
  });

  it('treats a manual review final result as possibly terminal', () => {
    expect(isPossiblyTerminalUploadError(400, { final_result: 'manual_review' })).toBe(true);
  });

  it('does not treat an ordinary validation error as terminal', () => {
    expect(isPossiblyTerminalUploadError(400, { message: 'Invalid file type' })).toBe(false);
  });

  it('does not treat a server error without a body as terminal', () => {
    expect(isPossiblyTerminalUploadError(500, undefined)).toBe(false);
  });
});
