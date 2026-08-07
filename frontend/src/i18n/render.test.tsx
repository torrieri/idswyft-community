import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { I18nProvider } from './index'
import MobileVerificationPage from '../pages/MobileVerificationPage'
import EndUserVerification from '../components/verification/EndUserVerification'
import { CompletionScreen } from '../components/verification/CompletionScreen'
import { LanguageSwitcher } from '../components/LanguageSwitcher'

// Server-rendered markup, so these run in the default node environment — no
// jsdom, no browser, no new dev dependency. They prove the whole chain:
// provider → useT → catalog → rendered output.

function render(ui: React.ReactNode, locale: 'en' | 'es') {
  return renderToStaticMarkup(<I18nProvider initialLocale={locale}>{ui}</I18nProvider>)
}

const VERIFIED = { status: 'verified', confidence_score: 0.97 }

describe('CompletionScreen renders in the active locale', () => {
  it('renders English copy under the en locale', () => {
    const html = render(
      <CompletionScreen device="desktop" result={VERIFIED} config={{}} branding={null} />,
      'en',
    )
    expect(html).toContain('Your identity has been successfully verified.')
    expect(html).toContain('You can close this window.')
    expect(html).toContain('Confidence')
    expect(html).toContain('PASS')
  })

  it('renders Spanish copy under the es locale', () => {
    const html = render(
      <CompletionScreen device="desktop" result={VERIFIED} config={{}} branding={null} />,
      'es',
    )
    expect(html).toContain('Tu identidad se verificó correctamente.')
    expect(html).toContain('Ya puedes cerrar esta ventana.')
    expect(html).toContain('Confianza')
    expect(html).toContain('PASA')
    // No English left behind on this screen.
    expect(html).not.toContain('You can close this window.')
    expect(html).not.toContain('Confidence')
  })

  it('translates the failure and review states too', () => {
    const failed = render(
      <CompletionScreen device="mobile" result={{ status: 'failed' }} config={{}} branding={null} />,
      'es',
    )
    expect(failed).toContain('Verificación fallida')
    expect(failed).toContain('No se pudo completar la verificación. Inténtalo de nuevo.')

    const review = render(
      <CompletionScreen device="mobile" result={{ status: 'manual_review' }} config={{}} branding={null} />,
      'es',
    )
    expect(review).toContain('Verificación en revisión')
  })

  it("never overwrites the integrating developer's own completion copy", () => {
    // config.completionTitle / completionMessage are the customer's words. A
    // Spanish locale must not replace them with the Idswyft catalog copy.
    const html = render(
      <CompletionScreen
        device="desktop"
        result={VERIFIED}
        config={{ completionTitle: 'Welcome to Acme', completionMessage: 'Your Acme account is ready.' }}
        branding={null}
      />,
      'es',
    )
    expect(html).toContain('Welcome to Acme')
    expect(html).toContain('Your Acme account is ready.')
    expect(html).not.toContain('Tu identidad se verificó correctamente.')
    // Surrounding chrome still translates.
    expect(html).toContain('Ya puedes cerrar esta ventana.')
  })
})

describe('verification pages render in the active locale', () => {
  // Effects don't run under renderToStaticMarkup, so these assert the initial
  // paint — the first thing a user actually sees.

  it('MobileVerificationPage shows its loading state in Spanish', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/verify/mobile?token=abc&lang=es']}>
        <I18nProvider initialLocale="es">
          <MobileVerificationPage />
        </I18nProvider>
      </MemoryRouter>,
    )
    expect(html).toContain('Preparando tu sesión...')
    expect(html).not.toContain('Preparing your session')
  })

  it('EndUserVerification renders its stepper and first step in Spanish', () => {
    const html = render(
      <EndUserVerification apiKey="ik_test" userId="user-1" enableMobileHandoff={false} />,
      'es',
    )
    expect(html).toContain('Iniciando la verificación')
    expect(html).toContain('Preparando tu sesión de verificación...')
    // Stepper labels come from the catalog too.
    expect(html).toContain('Inicio')
    expect(html).toContain('Reverso')
    expect(html).not.toContain('Front ID')
  })
})

describe('LanguageSwitcher', () => {
  it('offers every supported locale and preselects the active one', () => {
    const html = render(<LanguageSwitcher />, 'es')
    expect(html).toContain('English')
    expect(html).toContain('Español')
    expect(html).toContain('Idioma')
    expect(html).toMatch(/<option[^>]*selected[^>]*value="es"|value="es"[^>]*selected/)
  })
})
