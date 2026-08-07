import { describe, it, expect } from 'vitest'
import { en } from './locales/en'
import { es } from './locales/es'

type Catalogs = Record<string, Record<string, string>>

const CATALOGS: Catalogs = { es }

const PLACEHOLDER = /\{\s*(\w+)\s*\}/g

function placeholdersIn(template: string): string[] {
  return [...template.matchAll(PLACEHOLDER)].map(m => m[1]).sort()
}

describe('catalog parity', () => {
  // tsc already enforces key parity (each catalog is typed as a complete
  // Catalog). These tests cover what the type system cannot see.

  it.each(Object.keys(CATALOGS))('%s has no empty strings', locale => {
    const blank = Object.entries(CATALOGS[locale])
      .filter(([, value]) => value.trim() === '')
      .map(([key]) => key)
    expect(blank).toEqual([])
  })

  it.each(Object.keys(CATALOGS))(
    '%s keeps every interpolation placeholder from the English source',
    locale => {
      const mismatches = Object.entries(en)
        .map(([key, source]) => {
          const expected = placeholdersIn(source)
          const actual = placeholdersIn(CATALOGS[locale][key] ?? '')
          return { key, expected, actual }
        })
        // A dropped {age} silently renders "…de años." — invisible to tsc.
        .filter(({ expected, actual }) => expected.join(',') !== actual.join(','))

      expect(mismatches).toEqual([])
    },
  )

  it.each(Object.keys(CATALOGS))('%s preserves deliberate line breaks', locale => {
    const mismatches = Object.entries(en)
      .filter(([key, source]) => {
        const translated = CATALOGS[locale][key] ?? ''
        return source.includes('\n') !== translated.includes('\n')
      })
      .map(([key]) => key)

    expect(mismatches).toEqual([])
  })
})
