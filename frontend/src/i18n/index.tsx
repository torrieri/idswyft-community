// React binding for the end-user verification flow's i18n.
//
// Usage inside a component:
//   const t = useT()
//   <h1>{t('choice.title')}</h1>
//   <p>{t('age.pass', { age: 18 })}</p>
//
// The `en` catalog is the source of truth: TranslationKey is derived from it,
// so a key that doesn't exist is a tsc error, and every other catalog is typed
// as a complete Catalog, so a missing translation is a tsc error too.

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { en } from './locales/en'
import { es } from './locales/es'
import { translate, type InterpolationVars } from './translate'
import type { Catalog, TranslationKey } from './catalog'
import {
  DEFAULT_LOCALE,
  applyDocumentLocale,
  initLocale,
  persistLocale,
  type Locale,
} from './resolve'

export type { Catalog, TranslationKey } from './catalog'

export type TFunction = (key: TranslationKey, vars?: InterpolationVars) => string

const CATALOGS: Record<Locale, Catalog> = { en, es }

interface I18nContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: TFunction
}

const I18nContext = createContext<I18nContextValue | null>(null)

interface I18nProviderProps {
  children: React.ReactNode
  /** Force a locale instead of resolving from the browser. Tests and previews only. */
  initialLocale?: Locale
}

export function I18nProvider({ children, initialLocale }: I18nProviderProps) {
  // Lazy initializer: resolves and applies <html lang> exactly once, during the
  // first render and before paint — the same timing guarantee initTheme() gives.
  const [locale, setLocaleState] = useState<Locale>(() => initialLocale ?? initLocale())

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    persistLocale(next)
    applyDocumentLocale(next)
  }, [])

  // Merge over `en` so a key that somehow has no translation renders English
  // instead of falling through to the raw key at runtime.
  const catalog = useMemo<Catalog>(
    () => (locale === DEFAULT_LOCALE ? en : { ...en, ...CATALOGS[locale] }),
    [locale],
  )

  const t = useCallback<TFunction>((key, vars) => translate(catalog, key, vars), [catalog])

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

function useI18nContext(): I18nContextValue {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useT/useLocale must be used inside <I18nProvider>')
  }
  return context
}

/** Translation function for the current locale. */
export function useT(): TFunction {
  return useI18nContext().t
}

/** Current locale plus the setter backing the language switcher. */
export function useLocale(): { locale: Locale; setLocale: (locale: Locale) => void } {
  const { locale, setLocale } = useI18nContext()
  return { locale, setLocale }
}

export {
  DEFAULT_LOCALE,
  LOCALE_LABELS,
  SUPPORTED_LOCALES,
  appendLocaleParam,
  type Locale,
} from './resolve'
