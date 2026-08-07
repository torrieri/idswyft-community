import { describe, test, expect } from 'vitest'
import { describeCondition, describeAction, describeMergedAction } from './summarize'

describe('describeCondition', () => {
  test('renders a leaf with a symbol', () => {
    expect(describeCondition({ field: 'country', op: 'eq', value: 'DE' })).toBe('country = DE')
  })

  test('renders arrays in brackets', () => {
    expect(describeCondition({ field: 'country', op: 'in', value: ['DE', 'FR'] }))
      .toBe('country in [DE, FR]')
  })

  test('joins an all group with AND, unparenthesized at the top level', () => {
    expect(describeCondition({
      all: [
        { field: 'country', op: 'eq', value: 'DE' },
        { field: 'user_age', op: 'lt', value: 21 },
      ],
    })).toBe('country = DE AND user_age < 21')
  })

  test('joins an any group with OR', () => {
    expect(describeCondition({
      any: [
        { field: 'country', op: 'eq', value: 'DE' },
        { field: 'country', op: 'eq', value: 'FR' },
      ],
    })).toBe('country = DE OR country = FR')
  })

  test('parenthesizes nested groups', () => {
    expect(describeCondition({
      all: [
        { field: 'country', op: 'eq', value: 'DE' },
        { any: [{ field: 'user_age', op: 'lt', value: 21 }] },
      ],
    })).toBe('country = DE AND (user_age < 21)')
  })

  test('renders not', () => {
    expect(describeCondition({ not: { field: 'country', op: 'eq', value: 'DE' } }))
      .toBe('NOT country = DE')
  })

  test('renders exists in both directions', () => {
    expect(describeCondition({ field: 'country', op: 'exists', value: true })).toBe('country is set')
    expect(describeCondition({ field: 'country', op: 'exists', value: false })).toBe('country is not set')
  })

  test('marks empty groups', () => {
    expect(describeCondition({ all: [] })).toBe('(empty)')
  })

  test('marks invalid input instead of throwing', () => {
    expect(describeCondition(null as never)).toBe('(invalid)')
  })
})

describe('describeAction', () => {
  test('joins set keys with a separator', () => {
    expect(describeAction({ set_mode: 'full', force_manual_review: true }))
      .toBe('mode=full · +manual_review')
  })

  test('renders a flag', () => {
    expect(describeAction({ set_flag: 'high_risk_geo' })).toBe('flag:high_risk_geo')
  })

  test('ignores false booleans, matching the engine', () => {
    expect(describeAction({ require_aml: false })).toBe('(no effect)')
  })

  test('marks an empty action', () => {
    expect(describeAction({})).toBe('(no effect)')
  })
})

describe('describeMergedAction', () => {
  test('renders accumulated flags', () => {
    expect(describeMergedAction({ set_mode: 'full', flags: ['a', 'b'] }))
      .toBe('mode=full · flags:[a, b]')
  })

  test('reports no action when nothing matched', () => {
    expect(describeMergedAction({})).toBe('no action')
  })

  test('ignores an empty flag list', () => {
    expect(describeMergedAction({ flags: [] })).toBe('no action')
  })
})
