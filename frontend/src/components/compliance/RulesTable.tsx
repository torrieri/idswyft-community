// frontend/src/components/compliance/RulesTable.tsx
//
// Right pane: the selected ruleset's rules. Rules have no priority column and no
// reorder endpoint — they come back ordered by created_at, so there is no
// drag-to-reorder here by design.

import {
  ArrowPathIcon, PlusIcon, PencilSquareIcon, TrashIcon, XCircleIcon,
  DocumentTextIcon, ChevronLeftIcon,
} from '@heroicons/react/24/outline'
import { C } from '../../theme'
import { describeAction, describeCondition } from './summarize'
import type { ComplianceRule, ComplianceRulesetDetail } from './types'

export interface RulesTableProps {
  ruleset: ComplianceRulesetDetail | null
  loading: boolean
  error: string | null
  onAddRule: () => void
  onEditRule: (rule: ComplianceRule) => void
  onDeleteRule: (rule: ComplianceRule) => void
}

const GRID = '2fr 1.5fr 1.2fr 68px'

export function RulesTable({ ruleset, loading, error, onAddRule, onEditRule, onDeleteRule }: RulesTableProps) {
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.border}`, minHeight: 320 }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 20px', borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontFamily: C.mono, fontSize: 11, color: C.muted,
            letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600,
          }}>
            Rules
          </div>
          {ruleset && (
            <div style={{ color: C.text, fontSize: 14, fontFamily: C.mono, fontWeight: 600, marginTop: 4 }}>
              {ruleset.name}
              {!ruleset.is_active && (
                <span style={{ color: C.amber, fontSize: 11, marginLeft: 10, fontWeight: 500 }}>
                  INACTIVE — not evaluated
                </span>
              )}
            </div>
          )}
        </div>
        {ruleset && (
          <button
            onClick={onAddRule}
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', fontSize: 12, flexShrink: 0 }}
          >
            <PlusIcon style={{ width: 13, height: 13 }} />
            New Rule
          </button>
        )}
      </div>

      {/* No selection */}
      {!ruleset && !loading && !error && (
        <div style={{ padding: 64, textAlign: 'center' }}>
          <ChevronLeftIcon style={{ width: 26, height: 26, color: C.dim, marginBottom: 12 }} />
          <div style={{ color: C.muted, fontSize: 13, fontFamily: C.mono }}>
            Select a ruleset to view its rules
          </div>
        </div>
      )}

      {loading && (
        <div style={{ padding: 64, textAlign: 'center' }}>
          <ArrowPathIcon style={{ width: 24, height: 24, color: C.dim, animation: 'spin 1s linear infinite' }} />
          <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
        </div>
      )}

      {!loading && error && (
        <div style={{ padding: 56, textAlign: 'center' }}>
          <XCircleIcon style={{ width: 26, height: 26, color: C.red, marginBottom: 12 }} />
          <div style={{ color: C.red, fontSize: 13, fontFamily: C.mono }}>{error}</div>
        </div>
      )}

      {!loading && !error && ruleset && ruleset.rules.length === 0 && (
        <div style={{ padding: 56, textAlign: 'center' }}>
          <DocumentTextIcon style={{ width: 26, height: 26, color: C.dim, marginBottom: 12 }} />
          <div style={{ color: C.muted, fontSize: 13, fontFamily: C.mono }}>
            No rules yet — add one to make this ruleset do something.
          </div>
        </div>
      )}

      {!loading && !error && ruleset && ruleset.rules.length > 0 && (
        <>
          <div style={{
            display: 'grid', gridTemplateColumns: GRID, gap: 12,
            padding: '10px 20px', borderBottom: `1px solid ${C.border}`,
            fontFamily: C.mono, fontSize: 10, color: C.dim,
            letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>
            <span>Condition</span>
            <span>Action</span>
            <span>Description</span>
            <span />
          </div>

          {ruleset.rules.map(rule => (
            <div
              key={rule.id}
              style={{
                display: 'grid', gridTemplateColumns: GRID, gap: 12,
                padding: '14px 20px', borderBottom: `1px solid ${C.border}`,
                alignItems: 'center', transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = C.surface)}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{ color: C.text, fontSize: 12, fontFamily: C.mono, lineHeight: 1.5, wordBreak: 'break-word' }}>
                {describeCondition(rule.condition)}
              </div>
              <div style={{ color: C.cyan, fontSize: 12, fontFamily: C.mono, lineHeight: 1.5, wordBreak: 'break-word' }}>
                {describeAction(rule.action)}
              </div>
              <div style={{ color: C.dim, fontSize: 12, fontFamily: C.sans, lineHeight: 1.5 }}>
                {rule.description || '—'}
              </div>
              <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => onEditRule(rule)}
                  title="Edit rule"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, padding: 4, display: 'flex' }}
                >
                  <PencilSquareIcon style={{ width: 15, height: 15 }} />
                </button>
                <button
                  onClick={() => onDeleteRule(rule)}
                  title="Delete rule"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.dim, padding: 4, display: 'flex' }}
                  onMouseEnter={e => (e.currentTarget.style.color = C.red)}
                  onMouseLeave={e => (e.currentTarget.style.color = C.dim)}
                >
                  <TrashIcon style={{ width: 15, height: 15 }} />
                </button>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
