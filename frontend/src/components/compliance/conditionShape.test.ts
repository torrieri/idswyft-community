import { describe, test, expect } from 'vitest'
import {
  toBuilderModel,
  fromBuilderModel,
  coerceValue,
  formatValue,
  emptyCondition,
} from './conditionShape'
import type { Condition } from './types'

describe('toBuilderModel — representable shapes', () => {
  test('maps an all group of leaves', () => {
    const m = toBuilderModel({
      all: [
        { field: 'country', op: 'in', value: ['DE', 'FR'] },
        { field: 'user_age', op: 'lt', value: 21 },
      ],
    })
    expect(m).toEqual({
      combinator: 'all',
      rows: [
        { field: 'country', op: 'in', value: ['DE', 'FR'] },
        { field: 'user_age', op: 'lt', value: 21 },
      ],
    })
  })

  test('maps an any group', () => {
    expect(toBuilderModel({ any: [{ field: 'country', op: 'eq', value: 'DE' }] })?.combinator).toBe('any')
  })

  test('wraps a bare leaf as a single-row all group', () => {
    expect(toBuilderModel({ field: 'country', op: 'eq', value: 'DE' })).toEqual({
      combinator: 'all',
      rows: [{ field: 'country', op: 'eq', value: 'DE' }],
    })
  })
})

describe('toBuilderModel — returns null for JSON-only shapes', () => {
  test('rejects not', () => {
    expect(toBuilderModel({ not: { field: 'country', op: 'eq', value: 'DE' } })).toBeNull()
  })

  test('rejects nested combinators', () => {
    expect(toBuilderModel({
      all: [{ any: [{ field: 'country', op: 'eq', value: 'DE' }] }],
    })).toBeNull()
  })

  test('rejects multiple combinator keys', () => {
    expect(toBuilderModel({
      all: [{ field: 'country', op: 'eq', value: 'DE' }],
      any: [{ field: 'country', op: 'eq', value: 'FR' }],
    })).toBeNull()
  })

  test('rejects an empty group', () => {
    expect(toBuilderModel({ all: [] })).toBeNull()
  })

  test('rejects a non-object', () => {
    expect(toBuilderModel(null as unknown as Condition)).toBeNull()
  })
})

describe('round-trip', () => {
  test('fromBuilderModel(toBuilderModel(c)) preserves representable conditions', () => {
    const cases: Condition[] = [
      { all: [{ field: 'country', op: 'in', value: ['DE', 'FR'] }] },
      { any: [{ field: 'user_age', op: 'gte', value: 18 }, { field: 'country', op: 'eq', value: 'DE' }] },
    ]
    for (const c of cases) {
      const m = toBuilderModel(c)
      expect(m).not.toBeNull()
      expect(fromBuilderModel(m!)).toEqual(c)
    }
  })

  test('a bare leaf normalizes into an all group', () => {
    const m = toBuilderModel({ field: 'country', op: 'eq', value: 'DE' })
    expect(fromBuilderModel(m!)).toEqual({ all: [{ field: 'country', op: 'eq', value: 'DE' }] })
  })

  test('emptyCondition is representable', () => {
    expect(toBuilderModel(emptyCondition())).not.toBeNull()
  })
})

describe('coerceValue', () => {
  test('splits comma lists for in/not_in', () => {
    expect(coerceValue('in', 'string', 'a, b , c')).toEqual(['a', 'b', 'c'])
  })

  test('drops empty segments while typing', () => {
    expect(coerceValue('in', 'string', 'a, ,b')).toEqual(['a', 'b'])
  })

  test('uppercases country list entries', () => {
    expect(coerceValue('in', 'string', 'de, fr', 'country')).toEqual(['DE', 'FR'])
  })

  test('uppercases a single country value', () => {
    expect(coerceValue('eq', 'string', 'de', 'country')).toBe('DE')
  })

  test('converts numeric list entries', () => {
    expect(coerceValue('in', 'number', '1, 2')).toEqual([1, 2])
  })

  test('converts numbers for comparison operators', () => {
    expect(coerceValue('gt', 'number', '21')).toBe(21)
  })

  test('leaves an unparseable number as text so the warning can fire', () => {
    expect(coerceValue('gt', 'number', 'abc')).toBe('abc')
  })

  test('preserves an empty string rather than coercing to 0', () => {
    expect(coerceValue('gt', 'number', '')).toBe('')
  })

  test('leaves plain strings untouched', () => {
    expect(coerceValue('eq', 'string', 'passport')).toBe('passport')
  })
})

describe('formatValue', () => {
  test('joins arrays for display', () => {
    expect(formatValue('in', ['DE', 'FR'])).toBe('DE, FR')
  })

  test('renders null and undefined as empty', () => {
    expect(formatValue('eq', null)).toBe('')
    expect(formatValue('eq', undefined)).toBe('')
  })

  test('stringifies numbers', () => {
    expect(formatValue('gt', 21)).toBe('21')
  })
})
