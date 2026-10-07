import { describe, it, expect } from 'vitest';
import { readApiError, parseApiError } from './api';

const jsonResponse = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

describe('readApiError', () => {
  it('returns the message and the parsed body of a JSON error', async () => {
    const details = await readApiError(jsonResponse(409, { message: 'Already rejected', final_result: 'failed' }));

    expect(details).toEqual({ message: 'Already rejected', body: { message: 'Already rejected', final_result: 'failed' } });
  });

  it('falls back to the nested error message', async () => {
    const details = await readApiError(jsonResponse(400, { error: { message: 'Bad file' } }));

    expect(details.message).toBe('Bad file');
  });

  it('returns a null body for malformed JSON', async () => {
    const res = new Response('{oops', { status: 500, headers: { 'content-type': 'application/json' } });

    expect(await readApiError(res)).toEqual({ message: '{oops', body: null });
  });

  it('explains an HTML error page instead of returning it', async () => {
    const res = new Response('<!DOCTYPE html><html></html>', { status: 502, headers: { 'content-type': 'text/html' } });

    const details = await readApiError(res);

    expect(details.body).toBeNull();
    expect(details.message).toContain('HTTP 502');
  });

  it('falls back to the status code for an empty body', async () => {
    expect(await readApiError(new Response('', { status: 503 }))).toEqual({ message: 'HTTP 503', body: null });
  });
});

describe('parseApiError', () => {
  it('returns only the message', async () => {
    expect(await parseApiError(jsonResponse(400, { message: 'Invalid' }))).toBe('Invalid');
  });
});
