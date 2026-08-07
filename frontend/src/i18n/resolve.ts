// Locale resolution for the end-user verification flow.
//
// Precedence, highest first:
//   1. ?lang= query param   — explicit, set by the integrating developer
//   2. localStorage         — the user's own pick from the language switcher
//   3. navigator.languages  — browser autodetection
//   4. 'en'                 — fallback
//
// resolveLocale() is pure and takes its sources as arguments so it can be
// tested without touching window/navigator. initLocale() is the thin
// browser-facing wrapper, mirroring initTheme() in src/theme.ts.

export const SUPPORTED_LOCALES = ['en', 'es'] as const

export type Locale = (typeof SUPPORTED_LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'en'

/** localStorage key holding the user's explicit language pick. */
export const LOCALE_STORAGE_KEY = 'idswyft_lang'

/** Query param an integrating developer appends to force a language. */
export const LOCALE_QUERY_PARAM = 'lang'

/** Human-readable names, shown in the language switcher (each in its own language). */
export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
}

export function isSupportedLocale(value: string | null | undefined): value is Locale {
  return !!value && (SUPPORTED_LOCALES as readonly string[]).includes(value)
}

/**
 * Reduce a BCP 47 tag to a locale we ship, matching on the primary subtag so
 * that 'es-419' and 'es-MX' both resolve to 'es'. Returns null when the
 * language is one we don't support.
 */
export function normalizeLocale(value: string | null | undefined): Locale | null {
  if (!value) return null
  const primary = value.trim().toLowerCase().split('-')[0]
  return isSupportedLocale(primary) ? primary : null
}

export interface LocaleSources {
  /** location.search, e.g. '?session=abc&lang=es' */
  search?: string
  /** Previously persisted pick, e.g. localStorage.getItem(LOCALE_STORAGE_KEY) */
  stored?: string | null
  /** navigator.languages, most-preferred first */
  navigatorLanguages?: readonly string[]
}

/** Read the ?lang= value out of a query string, if present and supported. */
export function localeFromSearch(search: string | undefined): Locale | null {
  if (!search) return null
  return normalizeLocale(new URLSearchParams(search).get(LOCALE_QUERY_PARAM))
}

export function resolveLocale({ search, stored, navigatorLanguages }: LocaleSources = {}): Locale {
  const candidates = [
    new URLSearchParams(search || '').get(LOCALE_QUERY_PARAM),
    stored,
    ...(navigatorLanguages || []),
  ]

  for (const candidate of candidates) {
    const match = normalizeLocale(candidate)
    if (match) return match
  }

  return DEFAULT_LOCALE
}

/**
 * Append ?lang=<locale> to a URL unless it already carries one.
 *
 * Load-bearing for the cross-device handoff: the QR code sends the user to
 * their phone, which is a different device with its own localStorage. If the
 * locale isn't in that URL, someone who picked Spanish on the desktop gets an
 * English page on their phone. Works for relative and absolute URLs alike.
 */
export function appendLocaleParam(url: string, locale: Locale): string {
  const hashIndex = url.indexOf('#')
  const base = hashIndex === -1 ? url : url.slice(0, hashIndex)
  const hash = hashIndex === -1 ? '' : url.slice(hashIndex)

  if (new RegExp(`[?&]${LOCALE_QUERY_PARAM}=`).test(base)) return url

  const separator = base.includes('?') ? '&' : '?'
  return `${base}${separator}${LOCALE_QUERY_PARAM}=${locale}${hash}`
}

/**
 * localStorage throws in Safari private browsing and when cookies are blocked.
 * Losing the stored preference is recoverable (we fall through to the browser
 * language), so we degrade instead of breaking the verification flow.
 */
function readStoredLocale(): string | null {
  try {
    return localStorage.getItem(LOCALE_STORAGE_KEY)
  } catch {
    return null
  }
}

export function persistLocale(locale: Locale): void {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  } catch {
    // Storage unavailable — the locale still applies for this page load.
  }
}

/**
 * Keep <html lang> in sync. Screen readers pick their pronunciation voice from
 * this attribute, so it has to change with the UI language, not just once.
 */
export function applyDocumentLocale(locale: Locale): void {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = locale
  }
}

/**
 * Resolve the locale from the live browser environment and apply it.
 * Called from main.tsx before the first render, like initTheme().
 */
export function initLocale(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE

  const fromSearch = localeFromSearch(window.location.search)
  const locale =
    fromSearch ??
    resolveLocale({
      stored: readStoredLocale(),
      navigatorLanguages: navigator.languages?.length ? navigator.languages : [navigator.language],
    })

  // An explicit ?lang= is a deliberate choice — remember it so the language
  // survives the in-app navigation to /verify/mobile and /live-capture.
  if (fromSearch) persistLocale(fromSearch)

  applyDocumentLocale(locale)
  return locale
}
