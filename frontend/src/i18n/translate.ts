// Pure translation primitives — no React, so they can be unit-tested directly.

export type InterpolationVars = Record<string, string | number>

const PLACEHOLDER = /\{\s*(\w+)\s*\}/g

/**
 * Replace {var} placeholders in a template.
 *
 * An unmatched placeholder is left in place rather than blanked out: a visible
 * "{company}" in the UI is a loud, findable bug, whereas an empty string looks
 * like intentional copy and ships unnoticed.
 */
export function interpolate(template: string, vars?: InterpolationVars): string {
  if (!vars) return template
  return template.replace(PLACEHOLDER, (match, name: string) =>
    Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : match,
  )
}

/** Keys already reported, so a missing string in a render loop warns once. */
const warnedKeys = new Set<string>()

/**
 * Look a key up in a catalog and interpolate it.
 *
 * A missing or empty entry falls back to the key itself. The key is far more
 * useful on screen than a blank space — it names exactly what to fix.
 */
export function translate<K extends string>(
  catalog: Partial<Record<K, string>>,
  key: K,
  vars?: InterpolationVars,
): string {
  const template = catalog[key]

  if (!template) {
    if (!warnedKeys.has(key)) {
      warnedKeys.add(key)
      console.warn(`[i18n] Missing translation for key: ${key}`)
    }
    return key
  }

  return interpolate(template, vars)
}
