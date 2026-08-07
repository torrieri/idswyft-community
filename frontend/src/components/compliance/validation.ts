// frontend/src/components/compliance/validation.ts
//
// Client-side mirror of validateCondition / validateAction from
// backend/src/services/complianceEngine.ts:165-214, so the user sees errors
// before the round-trip. Keep the messages identical to the backend's.
//
// `*Warnings` are extra semantic checks the backend does NOT perform — they catch
// rules that save successfully but can never match. They never block a save.

import {
  ACTION_KEYS,
  findFieldDef,
  isCombinator,
  MODE_OPTIONS,
  type ComparisonOp,
  type ComplianceAction,
  type Condition,
  type LeafCondition,
} from './types'

const VALID_OPS = new Set<string>([
  'eq', 'neq', 'in', 'not_in', 'gt', 'gte', 'lt', 'lte', 'exists', 'contains',
])
const VALID_MODES = new Set<string>(MODE_OPTIONS)
const VALID_ACTION_KEYS = new Set<string>(ACTION_KEYS)
const NUMERIC_OPS = new Set<ComparisonOp>(['gt', 'gte', 'lt', 'lte'])
const ARRAY_OPS = new Set<ComparisonOp>(['in', 'not_in'])

/** Mirrors complianceEngine.validateCondition. Returns null when valid. */
export function validateCondition(condition: unknown): string | null {
  if (!condition || typeof condition !== 'object') return 'Condition must be an object'

  const c = condition as Record<string, unknown>

  if ('all' in c) {
    if (!Array.isArray(c.all) || c.all.length === 0) return '"all" must be a non-empty array'
    for (const sub of c.all) {
      const err = validateCondition(sub)
      if (err) return err
    }
    return null
  }
  if ('any' in c) {
    if (!Array.isArray(c.any) || c.any.length === 0) return '"any" must be a non-empty array'
    for (const sub of c.any) {
      const err = validateCondition(sub)
      if (err) return err
    }
    return null
  }
  if ('not' in c) {
    return validateCondition(c.not)
  }

  if (!c.field || typeof c.field !== 'string') return 'Leaf condition must have a "field" string'
  if (!c.op || !VALID_OPS.has(c.op as string)) {
    return `Invalid operator "${c.op}". Valid: ${[...VALID_OPS].join(', ')}`
  }
  if (c.value === undefined) return 'Leaf condition must have a "value"'

  return null
}

/** Mirrors complianceEngine.validateAction. Returns null when valid. */
export function validateAction(action: unknown): string | null {
  if (!action || typeof action !== 'object') return 'Action must be an object'

  const a = action as Record<string, unknown>
  const keys = Object.keys(a)
  if (keys.length === 0) return 'Action must have at least one field'

  for (const k of keys) {
    if (!VALID_ACTION_KEYS.has(k)) return `Unknown action key: "${k}"`
  }

  if (a.set_mode !== undefined && !VALID_MODES.has(a.set_mode as string)) {
    return `Invalid mode "${a.set_mode}". Valid: ${[...VALID_MODES].join(', ')}`
  }

  return null
}

// ─── Semantic warnings (advisory, never block) ──────────────

export interface Warning {
  path: string
  message: string
}

function leafWarnings(leaf: LeafCondition, path: string): Warning[] {
  const out: Warning[] = []
  const def = findFieldDef(leaf.field)

  // `in`/`not_in` need a real array — evaluateLeaf checks Array.isArray and
  // silently returns false (or true for not_in) otherwise. The backend accepts it.
  if (ARRAY_OPS.has(leaf.op) && !Array.isArray(leaf.value)) {
    out.push({ path, message: `"${leaf.op}" requires a list of values — a single value never matches.` })
  }

  // gt/gte/lt/lte require typeof number on BOTH sides.
  if (NUMERIC_OPS.has(leaf.op)) {
    if (typeof leaf.value !== 'number') {
      out.push({ path, message: `"${leaf.op}" requires a number — a text value never matches.` })
    } else if (def.type === 'string' || def.type === 'enum') {
      out.push({ path, message: `${def.label} holds text, so "${leaf.op}" never matches.` })
    }
  }

  // `exists` is asymmetric: only the literal `true` means "is present".
  if (leaf.op === 'exists' && typeof leaf.value !== 'boolean') {
    out.push({ path, message: '"is set / not set" needs true or false — any other value reads as "not set".' })
  }

  // country is uppercased at the enforcement point (newVerification.ts:854).
  if (leaf.field === 'country') {
    const lower = (Array.isArray(leaf.value) ? leaf.value : [leaf.value])
      .filter((v): v is string => typeof v === 'string')
      .filter(v => v !== v.toUpperCase())
    if (lower.length > 0) {
      out.push({ path, message: `country is uppercased at enforcement — "${lower[0]}" never matches in production.` })
    }
  }

  if (!def.liveAtInitialize) {
    out.push({ path, message: `${def.label} is not populated at initialize — this rule only matches in the dry-run.` })
  }

  return out
}

export function conditionWarnings(condition: Condition, path = 'condition'): Warning[] {
  if (!condition || typeof condition !== 'object') return []

  if (isCombinator(condition)) {
    const keys = (['all', 'any', 'not'] as const).filter(k => k in condition)
    const out: Warning[] = []

    // validateCondition checks 'all' first and returns early, so a second
    // combinator key is silently ignored by the engine.
    if (keys.length > 1) {
      out.push({ path, message: `Only "${keys[0]}" is evaluated — ${keys.slice(1).join(', ')} is silently ignored.` })
    }

    if (condition.all) condition.all.forEach((c, i) => out.push(...conditionWarnings(c, `${path}.all[${i}]`)))
    if (condition.any) condition.any.forEach((c, i) => out.push(...conditionWarnings(c, `${path}.any[${i}]`)))
    if (condition.not) out.push(...conditionWarnings(condition.not, `${path}.not`))
    return out
  }

  return leafWarnings(condition as LeafCondition, path)
}

export function actionWarnings(action: ComplianceAction): Warning[] {
  const out: Warning[] = []

  // mergeActions only reacts to === true; false is accepted but does nothing.
  for (const key of ['require_address', 'require_aml', 'force_manual_review'] as const) {
    if (action[key] === false) {
      out.push({ path: key, message: `${key}: false does nothing — remove it or set it to true.` })
    }
  }

  if (action.set_flag !== undefined && action.set_flag.trim() === '') {
    out.push({ path: 'set_flag', message: 'An empty flag is ignored by the engine.' })
  }

  if (action.require_liveness && action.require_liveness !== 'head_turn') {
    out.push({
      path: 'require_liveness',
      message: 'Only "head_turn" always wins the merge — other values lose to any head_turn rule.',
    })
  }

  return out
}

// ─── Normalization ──────────────────────────────────────────

/**
 * Strip keys the engine ignores: false booleans, empty strings, undefined.
 * JSON.stringify already drops undefined, which would turn {set_mode: undefined}
 * into {} and trigger the backend's "at least one field" 400.
 */
export function normalizeAction(action: ComplianceAction): ComplianceAction {
  const out: ComplianceAction = {}

  if (action.set_mode) out.set_mode = action.set_mode
  if (action.require_liveness && action.require_liveness.trim() !== '') {
    out.require_liveness = action.require_liveness.trim()
  }
  if (action.require_address === true) out.require_address = true
  if (action.require_aml === true) out.require_aml = true
  if (action.force_manual_review === true) out.force_manual_review = true
  if (action.set_flag && action.set_flag.trim() !== '') out.set_flag = action.set_flag.trim()

  return out
}

export interface DraftErrors {
  condition: string | null
  action: string | null
  ok: boolean
}

/**
 * Gate for the rule editor's save button. Validates the NORMALIZED action, so a
 * draft holding only no-op keys is rejected here rather than by the backend.
 */
export function validateRuleDraft(condition: unknown, action: ComplianceAction): DraftErrors {
  const conditionError = validateCondition(condition)

  const normalized = normalizeAction(action)
  const actionError = Object.keys(normalized).length === 0
    ? 'Set at least one action that has an effect'
    : validateAction(normalized)

  return {
    condition: conditionError,
    action: actionError,
    ok: conditionError === null && actionError === null,
  }
}
