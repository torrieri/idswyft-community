import { describe, it, expect, vi, afterEach } from 'vitest'
import { interpolate, translate } from './translate'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('interpolate', () => {
  it('returns the template untouched when there are no placeholders', () => {
    expect(interpolate('Verify Your Identity')).toBe('Verify Your Identity')
  })

  it('substitutes a single placeholder', () => {
    expect(interpolate('Verify with {company}', { company: 'Acme' })).toBe('Verify with Acme')
  })

  it('substitutes every occurrence of the same placeholder', () => {
    expect(interpolate('{n} of {n}', { n: 2 })).toBe('2 of 2')
  })

  it('substitutes numbers as well as strings', () => {
    expect(interpolate('You must be {age}+', { age: 18 })).toBe('You must be 18+')
  })

  it('tolerates whitespace inside the braces', () => {
    expect(interpolate('Hello { name }', { name: 'Ada' })).toBe('Hello Ada')
  })

  it('leaves an unmatched placeholder visible so the gap is obvious', () => {
    expect(interpolate('Verify with {company}')).toBe('Verify with {company}')
    expect(interpolate('Verify with {company}', { other: 'x' })).toBe('Verify with {company}')
  })
})

describe('translate', () => {
  const catalog = {
    'choice.title': 'Verify Your Identity',
    'age.pass': 'You meet the minimum age requirement of {age}.',
  }

  it('returns the catalog entry for a known key', () => {
    expect(translate(catalog, 'choice.title')).toBe('Verify Your Identity')
  })

  it('interpolates variables into the catalog entry', () => {
    expect(translate(catalog, 'age.pass', { age: 21 })).toBe(
      'You meet the minimum age requirement of 21.',
    )
  })

  it('falls back to the key itself when the entry is missing', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(translate(catalog, 'nope.missing' as keyof typeof catalog)).toBe('nope.missing')
  })

  it('warns once about a missing entry so gaps surface in development', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    translate(catalog, 'also.missing' as keyof typeof catalog)
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0]?.join(' ')).toContain('also.missing')
  })

  it('falls back to the key when the entry is an empty string', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(translate({ 'blank.key': '' }, 'blank.key')).toBe('blank.key')
  })
})
