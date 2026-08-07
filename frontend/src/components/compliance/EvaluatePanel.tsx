// frontend/src/components/compliance/EvaluatePanel.tsx
//
// Dry-run against POST /evaluate. Self-contained: owns its context form, the
// request, and the result.
//
// The response identifies a match only by `rule_description || rule_id`
// (compliance.ts:407), so matches can't be linked back to a specific table row.
// They're rendered as opaque labels on purpose.

import { useState } from 'react'
import { XMarkIcon, PlayIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import { C } from '../../theme'
import { inputStyle, labelStyle } from '../developer/types'
import { evaluate, ComplianceApiError } from './api'
import { describeAction, describeMergedAction } from './summarize'
import { FIELD_DEFS, NOT_LIVE_NOTE, type ComplianceContext, type EvaluateResponse } from './types'

export interface EvaluatePanelProps {
  onClose: () => void
}

const liveFields = FIELD_DEFS.filter(f => f.liveAtInitialize)
const dryRunFields = FIELD_DEFS.filter(f => !f.liveAtInitialize)

export function EvaluatePanel({ onClose }: EvaluatePanelProps) {
  const [values, setValues] = useState<Record<string, string>>({})
  const [metadataText, setMetadataText] = useState('')
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<EvaluateResponse | null>(null)

  const set = (key: string, v: string) => setValues(prev => ({ ...prev, [key]: v }))

  const buildContext = (): ComplianceContext | string => {
    const ctx: ComplianceContext = {}

    if (values.country?.trim()) ctx.country = values.country.trim().toUpperCase()
    if (values.document_type?.trim()) ctx.document_type = values.document_type.trim()
    if (values.verification_mode?.trim()) ctx.verification_mode = values.verification_mode.trim()
    if (values.aml_risk_level?.trim()) ctx.aml_risk_level = values.aml_risk_level.trim()

    for (const key of ['user_age', 'risk_score'] as const) {
      const raw = values[key]?.trim()
      if (!raw) continue
      const n = Number(raw)
      if (Number.isNaN(n)) return `${key} must be a number`
      ctx[key] = n
    }

    if (metadataText.trim()) {
      try {
        const parsed = JSON.parse(metadataText)
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
          return 'metadata must be a JSON object'
        }
        ctx.metadata = parsed as Record<string, unknown>
      } catch (e) {
        return `metadata: ${e instanceof Error ? e.message : 'invalid JSON'}`
      }
    }

    return ctx
  }

  const run = async () => {
    const ctx = buildContext()
    if (typeof ctx === 'string') {
      setError(ctx)
      setResult(null)
      return
    }

    setRunning(true)
    setError(null)
    try {
      setResult(await evaluate(ctx))
    } catch (err) {
      setResult(null)
      setError(err instanceof ComplianceApiError ? err.message : 'Dry-run failed')
    } finally {
      setRunning(false)
    }
  }

  const renderField = (key: string) => {
    const def = FIELD_DEFS.find(f => f.key === key)
    if (!def) return null

    return (
      <div key={key}>
        <div style={{ color: C.dim, fontSize: 11, fontWeight: 600, marginBottom: 4, fontFamily: C.mono }}>
          {def.label.toUpperCase()}
        </div>
        {def.type === 'enum' ? (
          <select
            value={values[key] ?? ''}
            onChange={e => set(key, e.target.value)}
            style={{ ...inputStyle, padding: '8px 10px', fontSize: 12.5, fontFamily: C.mono, cursor: 'pointer' }}
          >
            <option value="">— unset —</option>
            {def.enumValues?.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        ) : (
          <input
            type="text"
            value={values[key] ?? ''}
            onChange={e => set(key, e.target.value)}
            placeholder={def.type === 'number' ? '0' : key === 'country' ? 'DE' : ''}
            style={{ ...inputStyle, padding: '8px 10px', fontSize: 12.5, fontFamily: C.mono }}
          />
        )}
      </div>
    )
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 150,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: C.panel, border: `1px solid ${C.borderStrong}`, padding: 28,
          width: 660, maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 24px 80px rgba(0,0,0,0.5)', fontFamily: C.sans,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontFamily: C.mono, color: C.text, fontSize: 18, fontWeight: 600, margin: 0 }}>
              Dry-run
            </h2>
            <p style={{ color: C.dim, fontSize: 12, margin: '6px 0 0', fontFamily: C.mono, lineHeight: 1.6 }}>
              Evaluates a context against every <strong>active</strong> ruleset. Nothing is persisted.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.dim, padding: 4, display: 'flex' }}
          >
            <XMarkIcon style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {/* Live fields */}
        <div style={{ ...labelStyle, marginBottom: 10 }}>Context</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 18 }}>
          {liveFields.map(f => renderField(f.key))}
        </div>

        {/* Dry-run-only fields */}
        <div style={{
          border: `1px solid ${C.border}`, background: C.surface, padding: '14px 16px', marginBottom: 18,
        }}>
          <div style={{ color: C.amber, fontSize: 11, fontFamily: C.mono, marginBottom: 10, fontWeight: 600 }}>
            DRY-RUN ONLY — {NOT_LIVE_NOTE}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            {dryRunFields.map(f => renderField(f.key))}
          </div>
        </div>

        {/* Metadata */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ color: C.dim, fontSize: 11, fontWeight: 600, marginBottom: 4, fontFamily: C.mono }}>
            METADATA (JSON OBJECT)
          </div>
          <textarea
            value={metadataText}
            onChange={e => setMetadataText(e.target.value)}
            spellCheck={false}
            rows={3}
            placeholder={'{ "tier": "premium" }'}
            style={{
              ...inputStyle, fontFamily: C.mono, fontSize: 12.5,
              background: C.codeBg, resize: 'vertical',
            }}
          />
        </div>

        <button
          onClick={run}
          disabled={running}
          className="btn-accent"
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '9px 18px', fontSize: 13, opacity: running ? 0.5 : 1, marginBottom: 20,
          }}
        >
          {running
            ? <ArrowPathIcon style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} />
            : <PlayIcon style={{ width: 14, height: 14 }} />}
          {running ? 'Running...' : 'Run dry-run'}
          <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
        </button>

        {error && (
          <div style={{
            background: C.redDim, border: '1px solid rgba(248,113,113,0.4)',
            padding: '10px 14px', color: C.red, fontSize: 12.5, fontFamily: C.mono,
          }}>
            {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 18 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14,
              fontFamily: C.mono, fontSize: 13,
            }}>
              <span style={{ color: C.muted }}>Matched rules:</span>
              <span style={{
                color: result.matched_rules > 0 ? C.green : C.dim,
                fontSize: 18, fontWeight: 600,
              }}>
                {result.matched_rules}
              </span>
            </div>

            {result.matches.map((m, i) => (
              <div key={i} style={{
                background: C.surface, border: `1px solid ${C.border}`,
                padding: '10px 14px', marginBottom: 8,
              }}>
                <div style={{ color: C.dim, fontSize: 11, fontFamily: C.mono, marginBottom: 4 }}>
                  {m.ruleset} / {m.rule}
                </div>
                <div style={{ color: C.cyan, fontSize: 12.5, fontFamily: C.mono }}>
                  {describeAction(m.action)}
                </div>
              </div>
            ))}

            <div style={{
              background: result.matched_rules > 0 ? C.greenDim : C.surface,
              border: `1px solid ${result.matched_rules > 0 ? 'rgba(52,211,153,0.4)' : C.border}`,
              padding: '12px 16px', marginTop: 12,
            }}>
              <div style={{ color: C.dim, fontSize: 10.5, fontFamily: C.mono, letterSpacing: '0.08em', marginBottom: 6 }}>
                RESOLVED ACTION
              </div>
              <div style={{
                color: result.matched_rules > 0 ? C.green : C.muted,
                fontSize: 13, fontFamily: C.mono, fontWeight: 600,
              }}>
                {describeMergedAction(result.resolved_action)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
