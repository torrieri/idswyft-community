import { C } from '../theme'
import { LOCALE_LABELS, SUPPORTED_LOCALES, useLocale, useT, type Locale } from '../i18n'

interface LanguageSwitcherProps {
  /** Absolutely position it in the page's top-right corner. */
  floating?: boolean
  className?: string
}

/**
 * Language picker for the end-user verification flow.
 *
 * A native <select> on purpose: it is keyboard- and screen-reader-accessible
 * for free, renders as the platform picker on mobile (where most verifications
 * happen), and costs nothing in bundle size.
 */
export function LanguageSwitcher({ floating = false, className }: LanguageSwitcherProps) {
  const { locale, setLocale } = useLocale()
  const t = useT()

  return (
    <div
      className={className}
      style={
        floating
          ? { position: 'absolute', top: 24, right: 24, zIndex: 50 }
          : { display: 'inline-block' }
      }
    >
      <label htmlFor="idswyft-lang" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' }}>
        {t('lang.label')}
      </label>
      <select
        id="idswyft-lang"
        value={locale}
        onChange={e => setLocale(e.target.value as Locale)}
        title={t('lang.switchTo')}
        style={{
          fontFamily: C.mono,
          fontSize: '0.72rem',
          letterSpacing: '0.04em',
          color: 'var(--mid)',
          background: 'var(--panel)',
          border: '1px solid var(--rule)',
          padding: '7px 10px',
          cursor: 'pointer',
          appearance: 'none',
        }}
      >
        {SUPPORTED_LOCALES.map(code => (
          <option key={code} value={code}>
            {LOCALE_LABELS[code]}
          </option>
        ))}
      </select>
    </div>
  )
}

export default LanguageSwitcher
