// frontend/src/components/compliance/api.ts
//
// Thin wrappers over /api/v2/compliance (backend/src/routes/compliance.ts).
//
// Auth is the reviewer JWT httpOnly cookie with role='admin' — hence
// credentials:'include' everywhere. The router sits behind conditionalCsrf
// (server.ts:149), which activates whenever the idswyft_token cookie verifies,
// so every mutation must carry csrfHeader().

import { API_BASE_URL, parseApiError } from '../../config/api'
import { csrfHeader } from '../../lib/csrf'
import type {
  ComplianceContext,
  ComplianceRule,
  ComplianceRuleset,
  ComplianceRulesetDetail,
  Condition,
  ComplianceAction,
  EvaluateResponse,
} from './types'

const BASE = `${API_BASE_URL}/api/v2/compliance`

export class ComplianceApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ComplianceApiError'
    this.status = status
  }
}

const readOpts = (): RequestInit => ({ credentials: 'include' })

const writeOpts = (method: string, body: unknown): RequestInit => ({
  method,
  credentials: 'include',
  headers: { 'Content-Type': 'application/json', ...csrfHeader() },
  body: JSON.stringify(body),
})

async function request<T>(url: string, opts: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(url, opts)
  } catch {
    throw new ComplianceApiError('Network error — is the API reachable?', 0)
  }

  if (!res.ok) {
    throw new ComplianceApiError(await parseApiError(res), res.status)
  }

  // 204-style responses have no body; callers of those use Promise<void>.
  const text = await res.text()
  if (!text) return undefined as T
  try {
    return JSON.parse(text) as T
  } catch {
    throw new ComplianceApiError('Malformed JSON in response', res.status)
  }
}

// ─── Rulesets ───────────────────────────────────────────────

export async function listRulesets(): Promise<ComplianceRuleset[]> {
  const data = await request<{ rulesets?: ComplianceRuleset[] }>(`${BASE}/rulesets`, readOpts())
  return data.rulesets ?? []
}

export async function getRuleset(id: string): Promise<ComplianceRulesetDetail> {
  const data = await request<{ ruleset: ComplianceRulesetDetail }>(`${BASE}/rulesets/${id}`, readOpts())
  return { ...data.ruleset, rules: data.ruleset.rules ?? [] }
}

export interface CreateRulesetBody {
  name: string
  description?: string | null
  is_active?: boolean
  priority?: number
}

/**
 * The POST response omits updated_at and rule_count (compliance.ts:93), so it is
 * NOT a complete ComplianceRuleset. Only the id is safe to consume — always
 * refresh the list afterwards rather than appending this object.
 */
export async function createRuleset(body: CreateRulesetBody): Promise<{ id: string }> {
  const data = await request<{ ruleset: { id: string } }>(`${BASE}/rulesets`, writeOpts('POST', body))
  return { id: data.ruleset.id }
}

export type UpdateRulesetPatch = Partial<Pick<ComplianceRuleset, 'name' | 'description' | 'is_active' | 'priority'>>

export async function updateRuleset(id: string, patch: UpdateRulesetPatch): Promise<void> {
  await request<unknown>(`${BASE}/rulesets/${id}`, writeOpts('PUT', patch))
}

export async function deleteRuleset(id: string): Promise<void> {
  await request<unknown>(`${BASE}/rulesets/${id}`, { method: 'DELETE', credentials: 'include', headers: csrfHeader() })
}

// ─── Rules ──────────────────────────────────────────────────

export interface RuleBody {
  condition: Condition
  action: ComplianceAction
  description?: string | null
}

export async function createRule(rulesetId: string, body: RuleBody): Promise<ComplianceRule> {
  const data = await request<{ rule: ComplianceRule }>(`${BASE}/rulesets/${rulesetId}/rules`, writeOpts('POST', body))
  return data.rule
}

export async function updateRule(id: string, patch: Partial<RuleBody>): Promise<ComplianceRule> {
  const data = await request<{ rule: ComplianceRule }>(`${BASE}/rules/${id}`, writeOpts('PUT', patch))
  return data.rule
}

export async function deleteRule(id: string): Promise<void> {
  await request<unknown>(`${BASE}/rules/${id}`, { method: 'DELETE', credentials: 'include', headers: csrfHeader() })
}

// ─── Dry-run ────────────────────────────────────────────────

export async function evaluate(context: ComplianceContext): Promise<EvaluateResponse> {
  return request<EvaluateResponse>(`${BASE}/evaluate`, writeOpts('POST', { context }))
}
