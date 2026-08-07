// Catalog types, derived from the English source of truth.
//
// Kept in its own module so locale files can import the type without going
// through index.tsx (which imports the locale files back — a cycle).

import { en } from './locales/en'

/** Every valid translation key. A key not in en.ts is a tsc error. */
export type TranslationKey = keyof typeof en

/** A complete catalog. Locale files are typed as this, so a missing key fails the build. */
export type Catalog = Record<TranslationKey, string>
