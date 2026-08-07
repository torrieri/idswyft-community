// frontend/src/components/compliance/ConditionJsonEditor.tsx
//
// Raw JSON escape hatch for conditions the visual builder can't express
// (nested combinators, `not`). Purely presentational — the parent owns the text
// and both error strings.

import { C } from '../../theme'
import { inputStyle } from '../developer/types'
import type { Warning } from './validation'

export interface ConditionJsonEditorProps {
  text: string
  parseError: string | null
  validationError: string | null
  warnings: Warning[]
  onChange: (text: string) => void
  onFormat: () => void
}

export function ConditionJsonEditor({
  text, parseError, validationError, warnings, onChange, onFormat,
}: ConditionJsonEditorProps) {
  const hasError = parseError !== null || validationError !== null
  const borderColor = hasError ? C.red : C.borderStrong

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        <button
          type="button"
          onClick={onFormat}
          disabled={parseError !== null}
          className="btn-ghost"
          style={{ padding: '4px 10px', fontSize: 11, fontFamily: C.mono, opacity: parseError ? 0.4 : 1 }}
        >
          Format
        </button>
      </div>

      <textarea
        value={text}
        onChange={e => onChange(e.target.value)}
        spellCheck={false}
        rows={14}
        style={{
          ...inputStyle,
          fontFamily: C.mono,
          fontSize: 12.5,
          lineHeight: 1.6,
          minHeight: 260,
          resize: 'vertical',
          borderColor,
          background: C.codeBg,
        }}
        onFocus={e => { if (!hasError) e.currentTarget.style.borderColor = C.cyanBorder }}
        onBlur={e => (e.currentTarget.style.borderColor = borderColor)}
      />

      {parseError && (
        <div style={{
          marginTop: 8, background: C.redDim, border: '1px solid rgba(248,113,113,0.4)',
          padding: '8px 12px', color: C.red, fontSize: 12, fontFamily: C.mono,
        }}>
          Invalid JSON: {parseError}
        </div>
      )}

      {!parseError && validationError && (
        <div style={{
          marginTop: 8, background: C.redDim, border: '1px solid rgba(248,113,113,0.4)',
          padding: '8px 12px', color: C.red, fontSize: 12, fontFamily: C.mono,
        }}>
          {validationError}
        </div>
      )}

      {warnings.map((w, i) => (
        <div key={`${w.path}-${i}`} style={{
          marginTop: 8, background: C.amberDim, border: '1px solid rgba(251,191,36,0.3)',
          padding: '8px 12px', color: C.amber, fontSize: 12, fontFamily: C.mono,
        }}>
          <span style={{ color: C.dim }}>{w.path}</span> — {w.message}
        </div>
      ))}

      <div style={{ marginTop: 10, color: C.dim, fontSize: 11, fontFamily: C.mono, lineHeight: 1.6 }}>
        Leaf: {'{'}"field": "country", "op": "in", "value": ["DE", "FR"]{'}'}
        <br />
        Combinators: {'{'}"all": [...]{'}'} · {'{'}"any": [...]{'}'} · {'{'}"not": {'{'}...{'}'}{'}'}
      </div>
    </div>
  )
}
