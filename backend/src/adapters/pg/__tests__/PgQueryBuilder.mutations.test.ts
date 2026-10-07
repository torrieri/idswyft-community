import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Pool } from 'pg';
import { PgQueryBuilder } from '../PgQueryBuilder.js';
import { clearJsonColumnCache } from '../jsonColumns.js';

function fakePool(rows: unknown[] = [{ id: 'row-1' }]) {
  const query = vi.fn(async (_sql: string, _params?: unknown[]) => ({ rows, rowCount: rows.length }));
  return { pool: { query } as unknown as Pool, query };
}

/** The statement the builder ran, skipping the json-column catalog lookup that precedes writes */
function executedStatement(query: ReturnType<typeof fakePool>['query']): string {
  const statements = query.mock.calls
    .map(([sql]) => sql)
    .filter(sql => !sql.includes('information_schema.columns'));
  return statements[statements.length - 1];
}

describe('PgQueryBuilder — select() after a mutation', () => {
  beforeEach(() => clearJsonColumnCache());

  it('keeps a delete as a DELETE ... RETURNING when .select() is chained', async () => {
    const { pool, query } = fakePool();

    const result = await new PgQueryBuilder(pool, 'compliance_rulesets')
      .delete()
      .eq('id', 'rs-1')
      .eq('developer_id', 'dev-1')
      .select('id');

    const sql = executedStatement(query);
    expect(sql).toMatch(/^DELETE FROM compliance_rulesets WHERE/);
    expect(sql).toContain('RETURNING');
    expect(result).toEqual({ data: [{ id: 'row-1' }], error: null });
  });

  it('still runs a plain .delete() as a DELETE', async () => {
    const { pool, query } = fakePool();

    await new PgQueryBuilder(pool, 'identity_vault').delete().eq('vault_token', 'tok');

    expect(executedStatement(query)).toMatch(/^DELETE FROM identity_vault WHERE/);
  });

  it('keeps an update as an UPDATE when .select() is chained', async () => {
    const { pool, query } = fakePool();

    await new PgQueryBuilder(pool, 'verification_requests').update({ status: 'pending' }).eq('id', 'v-1').select('id');

    expect(executedStatement(query)).toMatch(/^UPDATE verification_requests SET/);
    expect(executedStatement(query)).toContain('RETURNING');
  });

  it('runs a standalone .select() as a SELECT', async () => {
    const { pool, query } = fakePool();

    await new PgQueryBuilder(pool, 'compliance_rulesets').select('id').eq('developer_id', 'dev-1');

    expect(executedStatement(query)).toMatch(/^SELECT/);
  });
});
