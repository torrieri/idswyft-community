// frontend/src/components/compliance/ConditionBuilder.tsx
//
// Visual editor for flat all/any groups of leaf conditions.
//
// This component keeps ONE piece of local state: `rawValues`, a per-row keystroke
// buffer. Without it, coerceValue would destroy in-progress input ("1." → 1,
// "DE, " → ["DE"]). It is written only from user input and never synced from
// props — the parent remounts via `key` when the JSON tab may have changed the
// condition underneath. See RuleEditorModal for why that is loop-free.

import { useState } from 'react'
import { TrashIcon, PlusIcon } from '@heroicons/react/24/outline'
import { C } from '../../theme'
import { inputStyle } from '../developer/types'
import { coerceValue, formatValue, emptyRow, type BuilderModel, type BuilderRow } from './conditionShape'
import { FIELD_DEFS, findFieldDef, METADATA_FIELD_PREFIX, NOT_LIVE_NOTE, OP_LABELS, type ComparisonOp } from './types'
import type { Warning } from './validation'

export interface ConditionBuilderProps {
  model: BuilderModel
  onChange: (next: BuilderModel) => void
  warnings: Warning[]
}

const OTHER_FIELD = '__metadata__'

const cellSelect = { ...inputStyle, padding: '8px 10px', fontSize: 12.5, fontFamily: C.mono, cursor: 'pointer' as const }
const cellInput = { ...inputStyle, padding: '8px 10px', fontSize: 12.5, fontFamily: C.mono }

export function ConditionBuilder({ model, onChange, warnings }: ConditionBuilderProps) {
  // Keystroke buffer, seeded once from the incoming model.
  const [rawValues, setRawValues] = useState<string[]>(() =>
    model.rows.map(r => formatValue(r.op, r.value)),
  )

  const setRows = (rows: BuilderRow[], raws: string[]) => {
    setRawValues(raws)
    onChange({ ...model, rows })
  }

  const updateRow = (index: number, delta: Partial<BuilderRow>, rawOverride?: string) => {
    const rows = model.rows.map((r, i) => (i === index ? { ...r, ...delta } : r))
    const raws = rawValues.map((v, i) => (i === index && rawOverride !== undefined ? rawOverride : v))
    setRows(rows, raws)
  }

  const handleFieldChange = (index: number, nextField: string) => {
    const field = nextField === OTHER_FIELD ? METADATA_FIELD_PREFIX : nextField
    const def = findFieldDef(field)
    // Keep the operator only if the new field supports it.
    const currentOp = model.rows[index].op
    const op: ComparisonOp = def.ops.includes(currentOp) ? currentOp : def.ops[0]
    updateRow(index, { field, op, value: '' }, '')
  }

  const handleOpChange = (index: number, op: ComparisonOp) => {
    // `exists` carries a literal boolean; everything else restarts from the raw text.
    if (op === 'exists') {
      updateRow(index, { op, value: true }, '')
      return
    }
    const row = model.rows[index]
    const def = findFieldDef(row.field)
    const raw = rawValues[index] ?? ''
    updateRow(index, { op, value: coerceValue(op, def.type, raw, row.field) }, raw)
  }

  const handleValueChange = (index: number, raw: string) => {
    const row = model.rows[index]
    const def = findFieldDef(row.field)
    updateRow(index, { value: coerceValue(row.op, def.type, raw, row.field) }, raw)
  }

  const addRow = () => setRows([...model.rows, emptyRow()], [...rawValues, ''])

  const removeRow = (index: number) => {
    if (model.rows.length === 1) return
    setRows(model.rows.filter((_, i) => i !== index), rawValues.filter((_, i) => i !== index))
  }

  // Warning paths look like `condition.all[0]`. A rule stored as a bare leaf
  // (no combinator) yields the unindexed path `condition`, which belongs to the
  // single row we render for it.
  const warningsFor = (index: number) =>
    warnings.filter(w =>
      w.path.endsWith(`[${index}]`) || (w.path === 'condition' && model.rows.length === 1 && index === 0),
    )

  return (
    <div>
      {/* Combinator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <span style={{ color: C.muted, fontSize: 12.5, fontFamily: C.mono }}>Match</span>
        <div style={{ display: 'flex', border: `1px solid ${C.borderStrong}` }}>
          {(['all', 'any'] as const).map(k => {
            const active = model.combinator === k
            return (
              <button
                key={k}
                type="button"
                onClick={() => onChange({ ...model, combinator: k })}
                style={{
                  background: active ? C.cyanDim : 'transparent',
                  border: 'none',
                  borderRight: k === 'all' ? `1px solid ${C.borderStrong}` : 'none',
                  color: active ? C.cyan : C.muted,
                  padding: '6px 16px', cursor: 'pointer',
                  fontFamily: C.mono, fontSize: 12, fontWeight: 600,
                }}
              >
                {k === 'all' ? 'ALL' : 'ANY'}
              </button>
            )
          })}
        </div>
        <span style={{ color: C.muted, fontSize: 12.5, fontFamily: C.mono }}>of the following:</span>
      </div>

      {/* Rows */}
      {model.rows.map((row, i) => {
        const def = findFieldDef(row.field)
        const isMetadata = row.field.startsWith(METADATA_FIELD_PREFIX) || !FIELD_DEFS.some(f => f.key === row.field)
        const rowWarnings = warningsFor(i)

        return (
          <div key={i} style={{ marginBottom: 10 }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMetadata ? '1fr 1fr 1.2fr 32px' : '1.2fr 1fr 1.2fr 32px',
              gap: 8, alignItems: 'center',
            }}>
              {/* Field */}
              {isMetadata ? (
                <input
                  type="text"
                  value={row.field}
                  onChange={e => updateRow(i, { field: e.target.value })}
                  placeholder="metadata.tier"
                  style={cellInput}
                />
              ) : (
                <select
                  value={row.field}
                  onChange={e => handleFieldChange(i, e.target.value)}
                  style={cellSelect}
                >
                  {FIELD_DEFS.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
                  <option value={OTHER_FIELD}>metadata.…</option>
                </select>
              )}

              {/* Operator */}
              <select
                value={row.op}
                onChange={e => handleOpChange(i, e.target.value as ComparisonOp)}
                style={cellSelect}
              >
                {def.ops.map(op => <option key={op} value={op}>{OP_LABELS[op]}</option>)}
              </select>

              {/* Value */}
              {row.op === 'exists' ? (
                <select
                  value={row.value === true ? 'true' : 'false'}
                  onChange={e => updateRow(i, { value: e.target.value === 'true' })}
                  style={cellSelect}
                >
                  <option value="true">is set</option>
                  <option value="false">is not set</option>
                </select>
              ) : def.type === 'enum' && row.op !== 'in' && row.op !== 'not_in' ? (
                <select
                  value={String(row.value ?? '')}
                  onChange={e => updateRow(i, { value: e.target.value }, e.target.value)}
                  style={cellSelect}
                >
                  <option value="">— select —</option>
                  {def.enumValues?.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              ) : (
                <input
                  type="text"
                  value={rawValues[i] ?? ''}
                  onChange={e => handleValueChange(i, e.target.value)}
                  placeholder={
                    row.op === 'in' || row.op === 'not_in' ? 'DE, FR, IT'
                      : def.type === 'number' ? '21'
                      : 'value'
                  }
                  style={cellInput}
                  onFocus={e => (e.currentTarget.style.borderColor = C.cyanBorder)}
                  onBlur={e => (e.currentTarget.style.borderColor = C.borderStrong)}
                />
              )}

              {/* Remove */}
              <button
                type="button"
                onClick={() => removeRow(i)}
                disabled={model.rows.length === 1}
                title={model.rows.length === 1 ? 'A condition needs at least one row' : 'Remove'}
                style={{
                  background: 'none', border: 'none', padding: 4,
                  cursor: model.rows.length === 1 ? 'not-allowed' : 'pointer',
                  color: C.dim, opacity: model.rows.length === 1 ? 0.3 : 1, display: 'flex',
                }}
              >
                <TrashIcon style={{ width: 15, height: 15 }} />
              </button>
            </div>

            {!def.liveAtInitialize && (
              <div style={{ color: C.amber, fontSize: 11, fontFamily: C.mono, marginTop: 4, paddingLeft: 2 }}>
                ⚠ {NOT_LIVE_NOTE}
              </div>
            )}

            {rowWarnings.map((w, wi) => (
              <div key={wi} style={{ color: C.amber, fontSize: 11, fontFamily: C.mono, marginTop: 4, paddingLeft: 2 }}>
                ⚠ {w.message}
              </div>
            ))}
          </div>
        )
      })}

      <button
        type="button"
        onClick={addRow}
        className="btn-ghost"
        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', fontSize: 12, fontFamily: C.mono, marginTop: 4 }}
      >
        <PlusIcon style={{ width: 13, height: 13 }} />
        Add condition
      </button>
    </div>
  )
}
