// frontend/src/components/compliance/RuleEditorModal.tsx
//
// Owns the entire rule draft.
//
// `condition` (the parsed object) is the single source of truth; `jsonText` is a
// view that only diverges while the JSON tab holds unparseable text. Both sync
// handlers write synchronously inside one event — React batches them, and no
// effect participates, so no feedback loop is possible.
//
// The builder's keystroke buffer is rebuilt by REMOUNTING (`key={builderEpoch}`)
// on a JSON→Builder tab switch, rather than by syncing props into state.

import { useMemo, useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { C } from '../../theme'
import { inputStyle, labelStyle } from '../developer/types'
import { ActionEditor } from './ActionEditor'
import { ConditionBuilder } from './ConditionBuilder'
import { ConditionJsonEditor } from './ConditionJsonEditor'
import { emptyCondition, fromBuilderModel, pretty, toBuilderModel, type BuilderModel } from './conditionShape'
import { actionWarnings, conditionWarnings, validateRuleDraft } from './validation'
import type { ComplianceAction, ComplianceRule, Condition } from './types'
import type { RuleDraft } from './useComplianceRulesets'

export interface RuleEditorModalProps {
  rulesetName: string
  initial: ComplianceRule | null
  saving: boolean
  onSave: (draft: RuleDraft) => void
  onClose: () => void
}

type Tab = 'builder' | 'json'

export function RuleEditorModal({ rulesetName, initial, saving, onSave, onClose }: RuleEditorModalProps) {
  const [tab, setTab] = useState<Tab>('builder')
  const [condition, setCondition] = useState<Condition>(initial?.condition ?? emptyCondition())
  const [jsonText, setJsonText] = useState(() => pretty(initial?.condition ?? emptyCondition()))
  const [jsonParseError, setJsonParseError] = useState<string | null>(null)
  const [builderEpoch, setBuilderEpoch] = useState(0)
  const [action, setAction] = useState<ComplianceAction>(initial?.action ?? {})
  const [description, setDescription] = useState(initial?.description ?? '')

  const builderModel = useMemo(() => toBuilderModel(condition), [condition])
  const draftErrors = useMemo(() => validateRuleDraft(condition, action), [condition, action])
  const condWarnings = useMemo(
    () => (jsonParseError ? [] : conditionWarnings(condition)),
    [condition, jsonParseError],
  )
  const actWarnings = useMemo(() => actionWarnings(action), [action])

  const handleBuilderChange = (next: BuilderModel) => {
    const c = fromBuilderModel(next)
    setCondition(c)
    setJsonText(pretty(c))
    setJsonParseError(null)
  }

  const handleJsonChange = (text: string) => {
    setJsonText(text)
    try {
      setCondition(JSON.parse(text) as Condition)
      setJsonParseError(null)
    } catch (e) {
      // Keep the last good `condition` so the Builder tab stays coherent.
      setJsonParseError(e instanceof Error ? e.message : 'Parse error')
    }
  }

  const switchTab = (next: Tab) => {
    if (next === 'builder') setBuilderEpoch(e => e + 1)
    if (next === 'json') setJsonText(pretty(condition))
    setTab(next)
  }

  const canSave = !saving && jsonParseError === null && draftErrors.ok

  const handleSave = () => {
    if (!canSave) return
    onSave({ condition, action, description })
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
          width: 760, maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 24px 80px rgba(0,0,0,0.5)', fontFamily: C.sans,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: C.mono, fontSize: 11, color: C.muted, letterSpacing: '0.08em', marginBottom: 6 }}>
              {rulesetName}
            </div>
            <h2 style={{ fontFamily: C.mono, color: C.text, fontSize: 18, fontWeight: 600, margin: 0 }}>
              {initial ? 'Edit Rule' : 'New Rule'}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.dim, padding: 4, display: 'flex' }}
          >
            <XMarkIcon style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {/* Condition */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ ...labelStyle, marginBottom: 0 }}>Condition</div>
            <div style={{ display: 'flex', border: `1px solid ${C.borderStrong}` }}>
              {(['builder', 'json'] as const).map(t => {
                const active = tab === t
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => switchTab(t)}
                    style={{
                      background: active ? C.cyanDim : 'transparent',
                      border: 'none',
                      borderRight: t === 'builder' ? `1px solid ${C.borderStrong}` : 'none',
                      color: active ? C.cyan : C.muted,
                      padding: '5px 14px', cursor: 'pointer',
                      fontFamily: C.mono, fontSize: 11.5, fontWeight: 600,
                    }}
                  >
                    {t === 'builder' ? 'Builder' : 'JSON'}
                  </button>
                )
              })}
            </div>
          </div>

          {tab === 'builder' ? (
            builderModel === null ? (
              <div style={{
                background: C.amberDim, border: '1px solid rgba(251,191,36,0.3)',
                padding: '14px 16px', color: C.amber, fontSize: 12.5, fontFamily: C.mono, lineHeight: 1.6,
              }}>
                This condition uses nesting or <code>not</code>, which the builder can't show.
                <br />
                <button
                  type="button"
                  onClick={() => switchTab('json')}
                  className="btn-ghost"
                  style={{ padding: '4px 10px', fontSize: 11.5, fontFamily: C.mono, marginTop: 8, color: C.amber }}
                >
                  Edit as JSON →
                </button>
              </div>
            ) : (
              <ConditionBuilder
                key={builderEpoch}
                model={builderModel}
                onChange={handleBuilderChange}
                warnings={condWarnings}
              />
            )
          ) : (
            <ConditionJsonEditor
              text={jsonText}
              parseError={jsonParseError}
              validationError={draftErrors.condition}
              warnings={condWarnings}
              onChange={handleJsonChange}
              onFormat={() => setJsonText(pretty(condition))}
            />
          )}

          {tab === 'builder' && draftErrors.condition && (
            <div style={{
              marginTop: 10, background: C.redDim, border: '1px solid rgba(248,113,113,0.4)',
              padding: '8px 12px', color: C.red, fontSize: 12, fontFamily: C.mono,
            }}>
              {draftErrors.condition}
            </div>
          )}
        </div>

        {/* Action */}
        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 20, marginBottom: 24 }}>
          <ActionEditor action={action} onChange={setAction} error={draftErrors.action} warnings={actWarnings} />
        </div>

        {/* Description */}
        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 20, marginBottom: 24 }}>
          <div style={labelStyle}>Description (optional)</div>
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="What this rule is for"
            style={inputStyle}
            onFocus={e => (e.currentTarget.style.borderColor = C.cyanBorder)}
            onBlur={e => (e.currentTarget.style.borderColor = C.borderStrong)}
          />
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            disabled={saving}
            style={{
              background: C.surface, border: `1px solid ${C.border}`, color: C.muted,
              padding: '10px 20px', cursor: 'pointer', fontSize: 13, fontFamily: C.mono, fontWeight: 500,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            style={{
              background: C.cyanDim, border: `1px solid ${C.cyanBorder}`, color: C.cyan,
              padding: '10px 24px', cursor: canSave ? 'pointer' : 'not-allowed',
              fontSize: 13, fontFamily: C.mono, fontWeight: 600,
              opacity: canSave ? 1 : 0.4,
            }}
          >
            {saving ? 'Saving...' : initial ? 'Save Rule' : 'Create Rule'}
          </button>
        </div>
      </div>
    </div>
  )
}
