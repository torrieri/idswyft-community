import { describe, it, expect } from 'vitest'
import {
  normalizeLocale,
  isSupportedLocale,
  resolveLocale,
  appendLocaleParam,
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
} from './resolve'

describe('isSupportedLocale', () => {
  it('accepts every locale we ship', () => {
    for (const locale of SUPPORTED_LOCALES) {
      expect(isSupportedLocale(locale)).toBe(true)
    }
  })

  it('rejects unknown tags and nullish values', () => {
    expect(isSupportedLocale('de')).toBe(false)
    expect(isSupportedLocale('')).toBe(false)
    expect(isSupportedLocale(null)).toBe(false)
    expect(isSupportedLocale(undefined)).toBe(false)
  })
})

describe('normalizeLocale', () => {
  it('passes through an exact supported tag', () => {
    expect(normalizeLocale('es')).toBe('es')
    expect(normalizeLocale('en')).toBe('en')
  })

  it('matches a regional tag by its primary subtag', () => {
    expect(normalizeLocale('es-419')).toBe('es')
    expect(normalizeLocale('es-MX')).toBe('es')
    expect(normalizeLocale('en-GB')).toBe('en')
  })

  it('is case-insensitive', () => {
    expect(normalizeLocale('ES-mx')).toBe('es')
    expect(normalizeLocale('EN')).toBe('en')
  })

  it('tolerates surrounding whitespace', () => {
    expect(normalizeLocale('  es  ')).toBe('es')
  })

  it('returns null for an unsupported language', () => {
    expect(normalizeLocale('de')).toBeNull()
    expect(normalizeLocale('pt-BR')).toBeNull()
  })

  it('returns null for empty and nullish input', () => {
    expect(normalizeLocale('')).toBeNull()
    expect(normalizeLocale(null)).toBeNull()
    expect(normalizeLocale(undefined)).toBeNull()
  })
})

describe('resolveLocale precedence', () => {
  it('lets the ?lang= query param beat every other source', () => {
    expect(
      resolveLocale({
        search: '?session=abc&lang=es',
        stored: 'en',
        navigatorLanguages: ['en-US'],
      }),
    ).toBe('es')
  })

  it('ignores an unsupported query param and falls through to the stored preference', () => {
    expect(
      resolveLocale({
        search: '?lang=de',
        stored: 'es',
        navigatorLanguages: ['en-US'],
      }),
    ).toBe('es')
  })

  it('lets the stored preference beat the browser languages', () => {
    expect(
      resolveLocale({
        search: '',
        stored: 'es',
        navigatorLanguages: ['en-US', 'en'],
      }),
    ).toBe('es')
  })

  it('falls back to the browser languages when nothing is stored', () => {
    expect(
      resolveLocale({
        search: '',
        stored: null,
        navigatorLanguages: ['es-419', 'es'],
      }),
    ).toBe('es')
  })

  it('scans the browser language list in order for the first supported match', () => {
    expect(
      resolveLocale({
        search: '',
        stored: null,
        navigatorLanguages: ['de-DE', 'fr-FR', 'es-CL'],
      }),
    ).toBe('es')
  })

  it('defaults to English when no source yields a supported locale', () => {
    expect(
      resolveLocale({
        search: '',
        stored: null,
        navigatorLanguages: ['de-DE', 'ja-JP'],
      }),
    ).toBe(DEFAULT_LOCALE)
    expect(resolveLocale({})).toBe(DEFAULT_LOCALE)
  })
})

describe('appendLocaleParam', () => {
  it('adds the first query param to a bare path', () => {
    expect(appendLocaleParam('/verify/mobile', 'es')).toBe('/verify/mobile?lang=es')
  })

  it('appends to a path that already has query params', () => {
    expect(appendLocaleParam('/verify/mobile?token=abc', 'es')).toBe(
      '/verify/mobile?token=abc&lang=es',
    )
  })

  it('appends to an absolute cross-device URL', () => {
    expect(appendLocaleParam('https://id.example.com/verify/mobile?token=abc', 'es')).toBe(
      'https://id.example.com/verify/mobile?token=abc&lang=es',
    )
  })

  it('leaves a URL that already carries a lang param untouched', () => {
    expect(appendLocaleParam('/verify/mobile?lang=en&token=abc', 'es')).toBe(
      '/verify/mobile?lang=en&token=abc',
    )
    expect(appendLocaleParam('/verify/mobile?token=abc&lang=en', 'es')).toBe(
      '/verify/mobile?token=abc&lang=en',
    )
  })

  it('does not mistake a param that merely ends in "lang" for the locale param', () => {
    expect(appendLocaleParam('/verify/mobile?sublang=xx', 'es')).toBe(
      '/verify/mobile?sublang=xx&lang=es',
    )
  })

  it('keeps the fragment at the end', () => {
    expect(appendLocaleParam('/verify/mobile?token=abc#step2', 'es')).toBe(
      '/verify/mobile?token=abc&lang=es#step2',
    )
  })
})
