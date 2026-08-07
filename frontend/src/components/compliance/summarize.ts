// frontend/src/components/compliance/summarize.ts
//
// One-line human descriptions of conditions and actions, for table cells and
// dry-run results. Pure string formatting — no React, no side effects.

import { isCombinator, type ComplianceAction, type Condition, type LeafCondition, type MergedAction } from './types'

const OP_SYMBOLS: Record<string, string> = {
  eq: '=',
  neq: '≠',
  in: 'in',
  not_in: 'not in',
  gt: '>',
  gte: '≥',
  lt: '<',
  lte: '≤',
  contains: 'contains',
}

function formatOperand(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(v => String(v)).join(', ')}]`
  if (typeof value === 'string') return value === '' ? '""' : value
  if (value === null) return 'null'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

function describeLeaf(leaf: LeafCondition): string {
  if (leaf.op === 'exists') {
    return leaf.value === true ? `${leaf.field} is set` : `${leaf.field} is not set`
  }
  const symbol = OP_SYMBOLS[leaf.op] ?? leaf.op
  return `${leaf.field} ${symbol} ${formatOperand(leaf.value)}`
}

const MAX_DEPTH = 4

export function describeCondition(c: Condition, depth = 0): string {
  if (!c || typeof c !== 'object') return '(invalid)'
  if (depth > MAX_DEPTH) return '…'

  if (isCombinator(c)) {
    if (c.all) {
      if (c.all.length === 0) return '(empty)'
      const parts = c.all.map(sub => describeCondition(sub, depth + 1))
      return depth === 0 ? parts.join(' AND ') : `(${parts.join(' AND ')})`
    }
    if (c.any) {
      if (c.any.length === 0) return '(empty)'
      const parts = c.any.map(sub => describeCondition(sub, depth + 1))
      return depth === 0 ? parts.join(' OR ') : `(${parts.join(' OR ')})`
    }
    if (c.not) return `NOT ${describeCondition(c.not, depth + 1)}`
    return '(empty)'
  }

  return describeLeaf(c as LeafCondition)
}

export function describeAction(a: ComplianceAction): string {
  if (!a || typeof a !== 'object') return '(invalid)'

  const parts: string[] = []
  if (a.set_mode) parts.push(`mode=${a.set_mode}`)
  if (a.require_liveness) parts.push(`liveness=${a.require_liveness}`)
  if (a.require_address === true) parts.push('+address')
  if (a.require_aml === true) parts.push('+aml')
  if (a.force_manual_review === true) parts.push('+manual_review')
  if (a.set_flag) parts.push(`flag:${a.set_flag}`)

  return parts.length > 0 ? parts.join(' · ') : '(no effect)'
}

export function describeMergedAction(m: MergedAction): string {
  if (!m || typeof m !== 'object') return '(invalid)'

  const parts: string[] = []
  if (m.set_mode) parts.push(`mode=${m.set_mode}`)
  if (m.require_liveness) parts.push(`liveness=${m.require_liveness}`)
  if (m.require_address === true) parts.push('+address')
  if (m.require_aml === true) parts.push('+aml')
  if (m.force_manual_review === true) parts.push('+manual_review')
  if (m.flags && m.flags.length > 0) parts.push(`flags:[${m.flags.join(', ')}]`)

  return parts.length > 0 ? parts.join(' · ') : 'no action'
}
