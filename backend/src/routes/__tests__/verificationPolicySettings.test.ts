/**
 * Test: GET/PUT /api/developer/settings/verification-policy
 *
 * Portal defaults for retries and unreadable-document handling.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks ────────────────────────────────────────────────────────────────────

let mockDeveloperRow: any = {};
let lastUpdate: any = null;

function createQueryBuilder(resolveWith: any) {
  let isUpdate = false;
  const builder: any = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn(() => {
      // After update(), eq() terminates the chain — return a resolved promise shape
      if (isUpdate) return Promise.resolve({ data: null, error: null });
      return builder;
    }),
    single: vi.fn().mockReturnValue({ data: resolveWith, error: null }),
    update: vi.fn((data: any) => { lastUpdate = data; isUpdate = true; return builder; }),
  };
  return builder;
}

vi.mock('@/config/database.js', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === 'developers') return createQueryBuilder(mockDeveloperRow);
      return createQueryBuilder(null);
    }),
  },
  connectDB: vi.fn(),
}));

vi.mock('@/utils/logger.js', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
  logError: vi.fn(),
  logVerificationEvent: vi.fn(),
}));

vi.mock('@/config/index.js', () => ({
  default: { encryptionKey: 'test-key-32-bytes-long-1234567890' },
  config: { encryptionKey: 'test-key-32-bytes-long-1234567890' },
}));

vi.mock('@idswyft/shared', () => ({
  encryptSecret: vi.fn((v: string) => `enc:${v}`),
  decryptSecret: vi.fn((v: string) => v.replace('enc:', '')),
  maskApiKey: vi.fn((v: string) => `${v.slice(0, 4)}****`),
}));

// Mock auth to pass through with req.developer set
vi.mock('@/middleware/auth.js', () => ({
  authenticateDeveloperJWT: (req: any, _res: any, next: any) => {
    req.developer = { id: 'dev-001' };
    next();
  },
  // Branding routes now use authenticateDashboard (developer JWT | operator | service key).
  authenticateDashboard: (req: any, _res: any, next: any) => {
    req.developer = { id: 'dev-001' };
    next();
  },
}));

// ── Tests ────────────────────────────────────────────────────────────────────

describe('Verification policy settings endpoints', () => {
  beforeEach(() => {
    mockDeveloperRow = {};
    lastUpdate = null;
  });

  async function buildApp() {
    const { default: settingsRouter } = await import('../developer/settings.js');
    const express = await import('express');
    const request = (await import('supertest')).default;

    const app = express.default();
    app.use(express.default.json());
    app.use(settingsRouter);

    return { app, request };
  }

  describe('GET /settings/verification-policy', () => {
    it('returns the stored developer defaults', async () => {
      mockDeveloperRow = { max_gate_retries: 2, unreadable_document_action: 'manual_review' };
      const { app, request } = await buildApp();

      const res = await request(app).get('/settings/verification-policy');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ max_gate_retries: 2, unreadable_document_action: 'manual_review' });
    });

    it('returns the safe defaults when nothing is stored', async () => {
      mockDeveloperRow = null;
      const { app, request } = await buildApp();

      const res = await request(app).get('/settings/verification-policy');

      expect(res.body).toEqual({ max_gate_retries: 0, unreadable_document_action: 'reject' });
    });
  });

  describe('PUT /settings/verification-policy', () => {
    it('saves valid defaults', async () => {
      const { app, request } = await buildApp();

      const res = await request(app)
        .put('/settings/verification-policy')
        .send({ max_gate_retries: 3, unreadable_document_action: 'manual_review' });

      expect(res.status).toBe(200);
      expect(lastUpdate).toEqual({ max_gate_retries: 3, unreadable_document_action: 'manual_review' });
      expect(res.body).toEqual({ success: true, max_gate_retries: 3, unreadable_document_action: 'manual_review' });
    });

    it('rejects retries above the limit', async () => {
      const { app, request } = await buildApp();

      const res = await request(app)
        .put('/settings/verification-policy')
        .send({ max_gate_retries: 6, unreadable_document_action: 'reject' });

      expect(res.status).toBe(400);
      expect(lastUpdate).toBeNull();
    });

    it('rejects unknown actions', async () => {
      const { app, request } = await buildApp();

      const res = await request(app)
        .put('/settings/verification-policy')
        .send({ max_gate_retries: 1, unreadable_document_action: 'approve' });

      expect(res.status).toBe(400);
      expect(lastUpdate).toBeNull();
    });
  });
});
