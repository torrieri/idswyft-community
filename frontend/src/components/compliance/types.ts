// frontend/src/components/compliance/types.ts
//
// Mirror of the compliance rule DSL. SOURCE OF TRUTH:
//   backend/src/services/complianceEngine.ts
//
// These types are hand-mirrored rather than imported because `shared/` publishes
// build output (dist/) and its barrel pulls in sharp + onnxruntime-node, which
// must never reach the browser bundle. The DSL types don't live in shared/ at all.
// If complianceEngine.ts changes, update this file to match.

// ─── DSL ────────────────────────────────────────────────────

export type ComparisonOp = 'eq' | 'neq' | 'in' | 'not_in' | 'gt' | 'gte' | 'lt' | 'lte' | 'exists' | 'contains'

export type VerificationMode = 'full' | 'document_only' | 'identity' | 'age_only'

export interface LeafCondition {
  field: string
  op: ComparisonOp
  value: unknown
}

export interface CombinatorCondition {
  all?: Condition[]
  any?: Condition[]
  not?: Condition
}

export type Condition = LeafCondition | CombinatorCondition

export interface ComplianceAction {
  set_mode?: VerificationMode
  require_address?: boolean
  require_liveness?: string
  require_aml?: boolean
  set_flag?: string
  force_manual_review?: boolean
}

export interface MergedAction {
  set_mode?: string
  require_address?: boolean
  require_liveness?: string
  require_aml?: boolean
  force_manual_review?: boolean
  flags?: string[]
}

// ─── API shapes ─────────────────────────────────────────────

export interface ComplianceRuleset {
  id: string
  name: string
  description: string | null
  is_active: boolean
  priority: number
  created_at: string
  updated_at: string
  rule_count: number
}

export interface ComplianceRule {
  id: string
  condition: Condition
  action: ComplianceAction
  description: string | null
  created_at: string
}

export interface ComplianceRulesetDetail {
  id: string
  name: string
  description: string | null
  is_active: boolean
  priority: number
  created_at: string
  updated_at: string
  rules: ComplianceRule[]
}

export interface ComplianceContext {
  country?: string
  document_type?: string
  user_age?: number
  verification_mode?: string
  risk_score?: number
  aml_risk_level?: string
  metadata?: Record<string, unknown>
}

export interface EvaluateMatch {
  ruleset: string
  rule: string
  action: ComplianceAction
}

export interface EvaluateResponse {
  success: true
  matched_rules: number
  matches: EvaluateMatch[]
  resolved_action: MergedAction
}

// ─── Field catalog ──────────────────────────────────────────

export type FieldValueType = 'string' | 'number' | 'enum' | 'any'

export interface FieldDef {
  key: string
  label: string
  type: FieldValueType
  enumValues?: string[]
  /**
   * false → the live enforcement point (newVerification.ts) never populates this
   * field, so rules keyed on it only ever fire in the /evaluate dry-run.
   */
  liveAtInitialize: boolean
  ops: ComparisonOp[]
  hint?: string
}

const STRING_OPS: ComparisonOp[] = ['eq', 'neq', 'in', 'not_in', 'contains', 'exists']
const ENUM_OPS: ComparisonOp[] = ['eq', 'neq', 'in', 'not_in', 'exists']
const NUMBER_OPS: ComparisonOp[] = ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'in', 'not_in', 'exists']
const ANY_OPS: ComparisonOp[] = ['eq', 'neq', 'in', 'not_in', 'gt', 'gte', 'lt', 'lte', 'contains', 'exists']

export const FIELD_DEFS: readonly FieldDef[] = [
  {
    key: 'country',
    label: 'country',
    type: 'string',
    liveAtInitialize: true,
    ops: STRING_OPS,
    hint: 'Uppercase ISO-3166 alpha-2 at enforcement — values are normalized to uppercase.',
  },
  {
    key: 'document_type',
    label: 'document_type',
    type: 'enum',
    enumValues: ['passport', 'drivers_license', 'national_id', 'other'],
    liveAtInitialize: true,
    ops: ENUM_OPS,
  },
  {
    key: 'verification_mode',
    label: 'verification_mode',
    type: 'enum',
    enumValues: ['full', 'document_only', 'identity', 'liveness_only', 'document_refresh', 'age_only'],
    liveAtInitialize: true,
    ops: ENUM_OPS,
  },
  {
    key: 'user_age',
    label: 'user_age',
    type: 'number',
    liveAtInitialize: false,
    ops: NUMBER_OPS,
  },
  {
    key: 'risk_score',
    label: 'risk_score',
    type: 'number',
    liveAtInitialize: false,
    ops: NUMBER_OPS,
  },
  {
    key: 'aml_risk_level',
    label: 'aml_risk_level',
    type: 'enum',
    enumValues: ['clear', 'potential_match', 'confirmed_match'],
    liveAtInitialize: false,
    ops: ENUM_OPS,
  },
]

export const METADATA_FIELD_PREFIX = 'metadata.'

export const NOT_LIVE_NOTE = 'Not populated at initialize — only matches in the dry-run.'

export const OP_LABELS: Record<ComparisonOp, string> = {
  eq: 'equals',
  neq: 'not equals',
  in: 'is one of',
  not_in: 'is not one of',
  gt: 'greater than',
  gte: 'greater or equal',
  lt: 'less than',
  lte: 'less or equal',
  exists: 'is set / not set',
  contains: 'contains',
}

export const MODE_OPTIONS: readonly VerificationMode[] = ['age_only', 'document_only', 'identity', 'full']

/** Ordered least → most restrictive, mirroring MODE_RESTRICTIVENESS in complianceEngine.ts. */
export const MODE_RESTRICTIVENESS: Record<string, number> = {
  age_only: 1,
  document_only: 2,
  identity: 3,
  full: 4,
}

export const LIVENESS_OPTIONS: readonly string[] = ['head_turn', 'passive']

export const ACTION_KEYS: readonly (keyof ComplianceAction)[] = [
  'set_mode',
  'require_liveness',
  'require_address',
  'require_aml',
  'force_manual_review',
  'set_flag',
]

// ─── Helpers ────────────────────────────────────────────────

export function isCombinator(c: Condition): c is CombinatorCondition {
  return typeof c === 'object' && c !== null && ('all' in c || 'any' in c || 'not' in c)
}

/** Resolve a field key to its definition. Unknown / metadata.* keys become a permissive 'any' def. */
export function findFieldDef(key: string): FieldDef {
  const known = FIELD_DEFS.find(f => f.key === key)
  if (known) return known

  return {
    key,
    label: key || '(unset)',
    type: 'any',
    // metadata.* IS populated at initialize; other unknown keys are simply unresolvable
    // and will read as undefined — treat both as live so we don't over-warn.
    liveAtInitialize: true,
    ops: ANY_OPS,
  }
}
