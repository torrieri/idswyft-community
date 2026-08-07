// frontend/src/components/compliance/ActionEditor.tsx
//
// Form over the six action keys. Every change routes through the parent's
// onChange with a fresh object — no mutation of the incoming action.

import { C } from '../../theme'
import { inputStyle, labelStyle } from '../developer/types'
import { LIVENESS_OPTIONS, MODE_OPTIONS, type ComplianceAction } from './types'
import type { Warning } from './validation'

export interface ActionEditorProps {
  action: ComplianceAction
  onChange: (next: ComplianceAction) => void
  error: string | null
  warnings: Warning[]
}

const selectStyle = { ...inputStyle, cursor: 'pointer' as const }

interface TogglePillProps {
  label: string
  checked: boolean
  onToggle: (next: boolean) => void
}

function TogglePill({ label, checked, onToggle }: TogglePillProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
      <button
        type="button"
        onClick={() => onToggle(!checked)}
        aria-pressed={checked}
        style={{
          width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
          background: checked ? C.accent : C.border, position: 'relative',
          transition: 'background 0.2s', flexShrink: 0, padding: 0,
        }}
      >
        <div style={{
          width: 18, height: 18, borderRadius: '50%', background: '#fff',
          position: 'absolute', top: 3, left: checked ? 23 : 3, transition: 'left 0.2s',
        }} />
      </button>
      <span style={{ color: checked ? C.text : C.muted, fontSize: 13, fontFamily: C.mono }}>{label}</span>
    </div>
  )
}

export function ActionEditor({ action, onChange, error, warnings }: ActionEditorProps) {
  const patch = (delta: Partial<ComplianceAction>) => onChange({ ...action, ...delta })

  return (
    <div>
      <div style={{ ...labelStyle, marginBottom: 12 }}>Action</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
        <div>
          <div style={{ color: C.dim, fontSize: 11, fontWeight: 600, marginBottom: 4, fontFamily: C.mono }}>
            SET_MODE
          </div>
          <select
            value={action.set_mode ?? ''}
            onChange={e => patch({ set_mode: (e.target.value || undefined) as ComplianceAction['set_mode'] })}
            style={selectStyle}
          >
            <option value="">— unset —</option>
            {MODE_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div>
          <div style={{ color: C.dim, fontSize: 11, fontWeight: 600, marginBottom: 4, fontFamily: C.mono }}>
            REQUIRE_LIVENESS
          </div>
          <select
            value={action.require_liveness ?? ''}
            onChange={e => patch({ require_liveness: e.target.value || undefined })}
            style={selectStyle}
          >
            <option value="">— unset —</option>
            {LIVENESS_OPTIONS.map(l => (
              <option key={l} value={l}>{l === 'head_turn' ? 'head_turn (wins merge)' : l}</option>
            ))}
          </select>
        </div>
      </div>

      <TogglePill
        label="require_address"
        checked={action.require_address === true}
        onToggle={next => patch({ require_address: next ? true : undefined })}
      />
      <TogglePill
        label="require_aml"
        checked={action.require_aml === true}
        onToggle={next => patch({ require_aml: next ? true : undefined })}
      />
      <TogglePill
        label="force_manual_review"
        checked={action.force_manual_review === true}
        onToggle={next => patch({ force_manual_review: next ? true : undefined })}
      />

      <div style={{ marginTop: 14 }}>
        <div style={{ color: C.dim, fontSize: 11, fontWeight: 600, marginBottom: 4, fontFamily: C.mono }}>
          SET_FLAG
        </div>
        <input
          type="text"
          value={action.set_flag ?? ''}
          onChange={e => patch({ set_flag: e.target.value || undefined })}
          placeholder="e.g. high_risk_geo"
          style={{ ...inputStyle, fontFamily: C.mono, fontSize: 13 }}
          onFocus={e => (e.currentTarget.style.borderColor = C.cyanBorder)}
          onBlur={e => (e.currentTarget.style.borderColor = C.borderStrong)}
        />
      </div>

      {error && (
        <div style={{
          marginTop: 12, background: C.redDim, border: `1px solid rgba(248,113,113,0.4)`,
          padding: '8px 12px', color: C.red, fontSize: 12, fontFamily: C.mono,
        }}>
          {error}
        </div>
      )}

      {warnings.map((w, i) => (
        <div key={`${w.path}-${i}`} style={{
          marginTop: 8, background: C.amberDim, border: `1px solid rgba(251,191,36,0.3)`,
          padding: '8px 12px', color: C.amber, fontSize: 12, fontFamily: C.mono,
        }}>
          {w.message}
        </div>
      ))}

      <div style={{
        marginTop: 16, paddingTop: 12, borderTop: `1px solid ${C.border}`,
        color: C.dim, fontSize: 11, lineHeight: 1.6, fontFamily: C.mono,
      }}>
        When several rules match, the engine merges them: the most restrictive
        set_mode wins (age_only &lt; document_only &lt; identity &lt; full), booleans
        stay true once any rule sets them, and flags accumulate deduplicated.
      </div>
    </div>
  )
}
