// frontend/src/components/compliance/conditionShape.ts
//
// Adapters between the DSL `Condition` (source of truth) and the flat row model
// the visual builder renders. The builder can only express a single combinator
// wrapping a list of leaves — anything deeper is JSON-only.

import {
  findFieldDef,
  isCombinator,
  type ComparisonOp,
  type Condition,
  type FieldValueType,
  type LeafCondition,
} from './types'

export interface BuilderRow {
  field: string
  op: ComparisonOp
  value: unknown
}

export interface BuilderModel {
  combinator: 'all' | 'any'
  rows: BuilderRow[]
}

function isLeaf(c: unknown): c is LeafCondition {
  if (!c || typeof c !== 'object') return false
  const o = c as Record<string, unknown>
  return typeof o.field === 'string' && typeof o.op === 'string' && !isCombinator(c as Condition)
}

/**
 * Convert a DSL condition into builder rows.
 * Returns null when the shape can't be represented — nested combinators, `not`,
 * multiple combinator keys, or an empty list. The caller shows a JSON-only notice.
 */
export function toBuilderModel(c: Condition): BuilderModel | null {
  if (!c || typeof c !== 'object') return null

  if (isCombinator(c)) {
    const keys = (['all', 'any', 'not'] as const).filter(k => k in c)
    if (keys.length !== 1) return null

    const combinator = keys[0]
    if (combinator === 'not') return null

    const list = c[combinator]
    if (!Array.isArray(list) || list.length === 0) return null
    if (!list.every(isLeaf)) return null

    return {
      combinator,
      rows: list.map(l => ({ field: l.field, op: l.op, value: l.value })),
    }
  }

  // A bare leaf is representable as a single-row ALL group.
  if (isLeaf(c)) {
    return { combinator: 'all', rows: [{ field: c.field, op: c.op, value: c.value }] }
  }

  return null
}

export function fromBuilderModel(m: BuilderModel): Condition {
  const leaves: LeafCondition[] = m.rows.map(r => ({ field: r.field, op: r.op, value: r.value }))
  return m.combinator === 'any' ? { any: leaves } : { all: leaves }
}

export function emptyRow(): BuilderRow {
  return { field: 'country', op: 'eq', value: '' }
}

export function emptyCondition(): Condition {
  return { all: [emptyRow()] }
}

/**
 * Turn raw input text into the value the engine expects for this op/field.
 *
 * `exists` is handled by a dedicated select in the UI (it needs a literal
 * boolean — see validation.ts), so it never reaches this function.
 */
export function coerceValue(op: ComparisonOp, type: FieldValueType, raw: string, field?: string): unknown {
  if (op === 'in' || op === 'not_in') {
    const parts = raw
      .split(',')
      .map(s => s.trim())
      .filter(s => s !== '')

    if (type === 'number') {
      return parts.map(p => (Number.isNaN(Number(p)) ? p : Number(p)))
    }
    return field === 'country' ? parts.map(p => p.toUpperCase()) : parts
  }

  if (op === 'gt' || op === 'gte' || op === 'lt' || op === 'lte' || type === 'number') {
    if (raw.trim() === '') return ''
    const n = Number(raw)
    return Number.isNaN(n) ? raw : n
  }

  // country is uppercased at the enforcement point, so normalize on write.
  if (field === 'country') return raw.toUpperCase()

  return raw
}

/** Inverse of coerceValue, for populating the text input from a stored value. */
export function formatValue(op: ComparisonOp, value: unknown): string {
  // `exists` renders as a dedicated select that owns its boolean, so the text
  // buffer for such a row must stay empty rather than showing "true"/"false".
  if (op === 'exists') return ''
  if (value === undefined || value === null) return ''
  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

export function pretty(c: unknown): string {
  return JSON.stringify(c, null, 2)
}

/** True when the row's field is documented as unavailable at the live enforcement point. */
export function isDryRunOnly(field: string): boolean {
  return !findFieldDef(field).liveAtInitialize
}
