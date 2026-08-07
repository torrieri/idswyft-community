// frontend/src/components/compliance/RulesetList.tsx
//
// Left pane: every ruleset for this developer, ordered by priority ascending
// (the backend already sorts). Purely presentational.

import {
  ArrowPathIcon, PlusIcon, PencilSquareIcon, TrashIcon, XCircleIcon, InboxIcon,
} from '@heroicons/react/24/outline'
import { C } from '../../theme'
import type { ComplianceRuleset } from './types'

export interface RulesetListProps {
  rulesets: ComplianceRuleset[]
  selectedId: string | null
  loading: boolean
  error: string | null
  onSelect: (id: string) => void
  onToggleActive: (rs: ComplianceRuleset, next: boolean) => void
  onEdit: (rs: ComplianceRuleset) => void
  onDelete: (rs: ComplianceRuleset) => void
  onCreate: () => void
  onRetry: () => void
}

const GRID = '1fr 44px 30px'

export function RulesetList({
  rulesets, selectedId, loading, error,
  onSelect, onToggleActive, onEdit, onDelete, onCreate, onRetry,
}: RulesetListProps) {
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 16px', borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{
          fontFamily: C.mono, fontSize: 11, color: C.muted,
          letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600,
        }}>
          Rulesets {rulesets.length > 0 && <span style={{ color: C.dim }}>({rulesets.length})</span>}
        </div>
        <button
          onClick={onCreate}
          className="btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', fontSize: 12 }}
        >
          <PlusIcon style={{ width: 13, height: 13 }} />
          New
        </button>
      </div>

      {/* Column header */}
      {!loading && !error && rulesets.length > 0 && (
        <div style={{
          display: 'grid', gridTemplateColumns: GRID, gap: 8,
          padding: '8px 16px', borderBottom: `1px solid ${C.border}`,
          fontFamily: C.mono, fontSize: 10, color: C.dim,
          letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          <span>Name</span>
          <span style={{ textAlign: 'right' }}>Prio</span>
          <span />
        </div>
      )}

      {/* States */}
      {loading && (
        <div style={{ padding: 48, textAlign: 'center' }}>
          <ArrowPathIcon style={{ width: 22, height: 22, color: C.dim, animation: 'spin 1s linear infinite' }} />
          <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
        </div>
      )}

      {!loading && error && (
        <div style={{ padding: 40, textAlign: 'center' }}>
          <XCircleIcon style={{ width: 24, height: 24, color: C.red, marginBottom: 10 }} />
          <div style={{ color: C.red, fontSize: 12.5, marginBottom: 14, fontFamily: C.mono }}>{error}</div>
          <button onClick={onRetry} className="btn-outline" style={{ padding: '6px 14px', fontSize: 12 }}>
            Retry
          </button>
        </div>
      )}

      {!loading && !error && rulesets.length === 0 && (
        <div style={{ padding: 40, textAlign: 'center' }}>
          <InboxIcon style={{ width: 24, height: 24, color: C.dim, marginBottom: 10 }} />
          <div style={{ color: C.muted, fontSize: 12.5, fontFamily: C.mono, lineHeight: 1.6 }}>
            No rulesets yet.
            <br />
            Create one to start writing rules.
          </div>
        </div>
      )}

      {/* Rows */}
      {!loading && !error && rulesets.map(rs => {
        const selected = rs.id === selectedId
        return (
          <div
            key={rs.id}
            onClick={() => onSelect(rs.id)}
            style={{
              borderBottom: `1px solid ${C.border}`,
              background: selected ? C.surfaceHover : 'transparent',
              borderLeft: `2px solid ${selected ? C.cyan : 'transparent'}`,
              cursor: 'pointer', transition: 'background 0.15s',
            }}
            onMouseEnter={e => { if (!selected) e.currentTarget.style.background = C.surface }}
            onMouseLeave={e => { if (!selected) e.currentTarget.style.background = 'transparent' }}
          >
            <div style={{
              display: 'grid', gridTemplateColumns: GRID, gap: 8,
              padding: '12px 16px', alignItems: 'center',
            }}>
              <div style={{ minWidth: 0 }}>
                <div style={{
                  color: selected ? C.text : C.muted, fontSize: 13, fontWeight: 600,
                  fontFamily: C.mono, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {rs.name}
                </div>
                <div style={{ color: C.dim, fontSize: 11, marginTop: 3, fontFamily: C.mono }}>
                  {rs.rule_count ?? 0} {rs.rule_count === 1 ? 'rule' : 'rules'}
                  {rs.description && <span> · {rs.description.slice(0, 28)}{rs.description.length > 28 ? '…' : ''}</span>}
                </div>
              </div>

              <div style={{ textAlign: 'right', color: C.dim, fontSize: 12, fontFamily: C.mono }}>
                {rs.priority}
              </div>

              {/* Active toggle */}
              <button
                onClick={e => { e.stopPropagation(); onToggleActive(rs, !rs.is_active) }}
                title={rs.is_active ? 'Active — click to disable' : 'Inactive — click to enable'}
                style={{
                  width: 26, height: 20, padding: 0, cursor: 'pointer',
                  background: rs.is_active ? C.greenDim : C.surface,
                  border: `1px solid ${rs.is_active ? 'rgba(52,211,153,0.4)' : C.border}`,
                  color: rs.is_active ? C.green : C.dim,
                  fontSize: 11, fontFamily: C.mono, lineHeight: 1,
                }}
              >
                {rs.is_active ? '●' : '○'}
              </button>
            </div>

            {selected && (
              <div style={{ display: 'flex', gap: 6, padding: '0 16px 12px' }}>
                <button
                  onClick={e => { e.stopPropagation(); onEdit(rs) }}
                  className="btn-ghost"
                  style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', fontSize: 11, fontFamily: C.mono }}
                >
                  <PencilSquareIcon style={{ width: 12, height: 12 }} />
                  Edit
                </button>
                <button
                  onClick={e => { e.stopPropagation(); onDelete(rs) }}
                  className="btn-ghost"
                  style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', fontSize: 11, fontFamily: C.mono, color: C.red }}
                >
                  <TrashIcon style={{ width: 12, height: 12 }} />
                  Delete
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
