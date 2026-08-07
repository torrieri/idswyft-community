import { describe, test, expect } from 'vitest'
import {
  validateCondition,
  validateAction,
  conditionWarnings,
  actionWarnings,
  normalizeAction,
  validateRuleDraft,
} from './validation'

describe('validateCondition — parity with complianceEngine.ts:165-195', () => {
  test('accepts a well-formed leaf', () => {
    expect(validateCondition({ field: 'country', op: 'eq', value: 'DE' })).toBeNull()
  })

  test('rejects a non-object', () => {
    expect(validateCondition('nope')).toBe('Condition must be an object')
    expect(validateCondition(null)).toBe('Condition must be an object')
  })

  test('rejects an empty "all" array', () => {
    expect(validateCondition({ all: [] })).toBe('"all" must be a non-empty array')
  })

  test('rejects an empty "any" array', () => {
    expect(validateCondition({ any: [] })).toBe('"any" must be a non-empty array')
  })

  test('recurses into combinators and reports the inner error', () => {
    expect(validateCondition({ all: [{ field: 'country', op: 'bogus', value: 'DE' }] }))
      .toMatch(/Invalid operator "bogus"/)
  })

  test('recurses into not', () => {
    expect(validateCondition({ not: { field: 'country', op: 'eq', value: 'DE' } })).toBeNull()
    expect(validateCondition({ not: { field: 'country' } }))
      .toMatch(/Invalid operator/)
  })

  test('requires a field string', () => {
    expect(validateCondition({ op: 'eq', value: 'DE' }))
      .toBe('Leaf condition must have a "field" string')
  })

  test('requires a defined value', () => {
    expect(validateCondition({ field: 'country', op: 'eq' }))
      .toBe('Leaf condition must have a "value"')
  })

  test('accepts null as a value (only undefined is rejected)', () => {
    expect(validateCondition({ field: 'country', op: 'eq', value: null })).toBeNull()
  })
})

describe('validateAction — parity with complianceEngine.ts:197-214', () => {
  test('accepts a single valid key', () => {
    expect(validateAction({ force_manual_review: true })).toBeNull()
  })

  test('rejects an empty object', () => {
    expect(validateAction({})).toBe('Action must have at least one field')
  })

  test('rejects an unknown key', () => {
    expect(validateAction({ set_threshold: 0.9 })).toBe('Unknown action key: "set_threshold"')
  })

  test('rejects an invalid mode', () => {
    expect(validateAction({ set_mode: 'liveness_only' })).toMatch(/Invalid mode "liveness_only"/)
  })

  test('accepts every valid mode', () => {
    for (const mode of ['full', 'document_only', 'identity', 'age_only']) {
      expect(validateAction({ set_mode: mode })).toBeNull()
    }
  })
})

describe('conditionWarnings — catches rules that save but never match', () => {
  test('flags in/not_in with a non-array value', () => {
    const w = conditionWarnings({ field: 'country', op: 'in', value: 'DE' })
    expect(w.some(x => x.message.includes('requires a list'))).toBe(true)
  })

  test('accepts in with a proper array', () => {
    const w = conditionWarnings({ field: 'country', op: 'in', value: ['DE', 'FR'] })
    expect(w.some(x => x.message.includes('requires a list'))).toBe(false)
  })

  test('flags a numeric operator against a text value', () => {
    const w = conditionWarnings({ field: 'user_age', op: 'gt', value: '21' })
    expect(w.some(x => x.message.includes('requires a number'))).toBe(true)
  })

  test('flags a numeric operator on a text field', () => {
    const w = conditionWarnings({ field: 'country', op: 'gt', value: 5 })
    expect(w.some(x => x.message.includes('never matches'))).toBe(true)
  })

  test('flags exists with a non-boolean value', () => {
    const w = conditionWarnings({ field: 'country', op: 'exists', value: 'yes' })
    expect(w.some(x => x.message.includes('needs true or false'))).toBe(true)
  })

  test('flags lowercase country values', () => {
    const w = conditionWarnings({ field: 'country', op: 'eq', value: 'de' })
    expect(w.some(x => x.message.includes('uppercased at enforcement'))).toBe(true)
  })

  test('does not flag uppercase country values', () => {
    const w = conditionWarnings({ field: 'country', op: 'eq', value: 'DE' })
    expect(w.some(x => x.message.includes('uppercased at enforcement'))).toBe(false)
  })

  test('flags fields never populated at initialize', () => {
    const w = conditionWarnings({ field: 'risk_score', op: 'gt', value: 50 })
    expect(w.some(x => x.message.includes('not populated at initialize'))).toBe(true)
  })

  test('flags a second combinator key being silently ignored', () => {
    const w = conditionWarnings({
      all: [{ field: 'country', op: 'eq', value: 'DE' }],
      any: [{ field: 'country', op: 'eq', value: 'FR' }],
    })
    expect(w.some(x => x.message.includes('silently ignored'))).toBe(true)
  })

  test('paths locate the offending row', () => {
    const w = conditionWarnings({
      all: [
        { field: 'country', op: 'eq', value: 'DE' },
        { field: 'country', op: 'in', value: 'FR' },
      ],
    })
    expect(w.some(x => x.path === 'condition.all[1]')).toBe(true)
  })
})

describe('actionWarnings', () => {
  test('flags false booleans as no-ops', () => {
    const w = actionWarnings({ require_aml: false })
    expect(w.some(x => x.message.includes('does nothing'))).toBe(true)
  })

  test('flags an empty flag', () => {
    const w = actionWarnings({ set_flag: '   ' })
    expect(w.some(x => x.message.includes('empty flag'))).toBe(true)
  })

  test('flags non-head_turn liveness as losing the merge', () => {
    const w = actionWarnings({ require_liveness: 'passive' })
    expect(w.some(x => x.message.includes('head_turn'))).toBe(true)
  })

  test('stays quiet on head_turn', () => {
    expect(actionWarnings({ require_liveness: 'head_turn' })).toHaveLength(0)
  })
})

describe('normalizeAction — strips keys the engine ignores', () => {
  test('drops false booleans', () => {
    expect(normalizeAction({ require_aml: false, force_manual_review: false })).toEqual({})
  })

  test('keeps true booleans', () => {
    expect(normalizeAction({ require_aml: true })).toEqual({ require_aml: true })
  })

  test('drops empty and whitespace-only strings', () => {
    expect(normalizeAction({ set_flag: '', require_liveness: '  ' })).toEqual({})
  })

  test('trims retained strings', () => {
    expect(normalizeAction({ set_flag: '  high_risk  ' })).toEqual({ set_flag: 'high_risk' })
  })

  test('drops undefined set_mode', () => {
    expect(normalizeAction({ set_mode: undefined, require_aml: true })).toEqual({ require_aml: true })
  })
})

describe('validateRuleDraft', () => {
  test('rejects a draft whose action only holds no-op keys', () => {
    const r = validateRuleDraft({ field: 'country', op: 'eq', value: 'DE' }, { require_aml: false })
    expect(r.ok).toBe(false)
    expect(r.action).toBe('Set at least one action that has an effect')
  })

  test('accepts a valid draft', () => {
    const r = validateRuleDraft({ field: 'country', op: 'eq', value: 'DE' }, { set_mode: 'full' })
    expect(r.ok).toBe(true)
    expect(r.condition).toBeNull()
    expect(r.action).toBeNull()
  })

  test('reports a condition error independently of the action', () => {
    const r = validateRuleDraft({ all: [] }, { set_mode: 'full' })
    expect(r.ok).toBe(false)
    expect(r.condition).toBe('"all" must be a non-empty array')
    expect(r.action).toBeNull()
  })
})
