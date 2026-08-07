// frontend/src/components/compliance/RulesetFormModal.tsx
//
// Create / edit a ruleset's metadata. Local form state only; the parent owns
// persistence and closes the modal on success.

import { useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { C } from '../../theme'
import { inputStyle, labelStyle } from '../developer/types'
import type { ComplianceRuleset } from './types'
import type { RulesetFormValues } from './useComplianceRulesets'

export interface RulesetFormModalProps {
  mode: 'create' | 'edit'
  initial: ComplianceRuleset | null
  saving: boolean
  onSave: (values: RulesetFormValues) => void
  onClose: () => void
}

const NAME_MAX = 200

export function RulesetFormModal({ mode, initial, saving, onSave, onClose }: RulesetFormModalProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [isActive, setIsActive] = useState(initial?.is_active ?? true)
  const [priority, setPriority] = useState(String(initial?.priority ?? 100))

  const trimmedName = name.trim()
  const priorityNum = Number(priority)
  const priorityValid = priority.trim() !== '' && Number.isInteger(priorityNum)

  const error =
    trimmedName === '' ? 'Name is required'
      : trimmedName.length > NAME_MAX ? `Name must be ${NAME_MAX} characters or fewer`
      : !priorityValid ? 'Priority must be a whole number'
      : null

  const canSave = !saving && error === null

  const handleSave = () => {
    if (!canSave) return
    onSave({ name: trimmedName, description, is_active: isActive, priority: priorityNum })
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
          width: 480, maxWidth: '100%', boxShadow: '0 24px 80px rgba(0,0,0,0.5)', fontFamily: C.sans,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontFamily: C.mono, color: C.text, fontSize: 18, fontWeight: 600, margin: 0 }}>
            {mode === 'create' ? 'New Ruleset' : 'Edit Ruleset'}
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.dim, padding: 4, display: 'flex' }}
          >
            <XMarkIcon style={{ width: 18, height: 18 }} />
          </button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={labelStyle}>Name</div>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={NAME_MAX}
            placeholder="EU High Risk"
            autoFocus
            style={inputStyle}
            onFocus={e => (e.currentTarget.style.borderColor = C.cyanBorder)}
            onBlur={e => (e.currentTarget.style.borderColor = C.borderStrong)}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={labelStyle}>Description (optional)</div>
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="What this ruleset covers"
            style={inputStyle}
            onFocus={e => (e.currentTarget.style.borderColor = C.cyanBorder)}
            onBlur={e => (e.currentTarget.style.borderColor = C.borderStrong)}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={labelStyle}>Priority</div>
          <input
            type="number"
            value={priority}
            onChange={e => setPriority(e.target.value)}
            style={{ ...inputStyle, fontFamily: C.mono }}
            onFocus={e => (e.currentTarget.style.borderColor = C.cyanBorder)}
            onBlur={e => (e.currentTarget.style.borderColor = C.borderStrong)}
          />
          <div style={{ color: C.dim, fontSize: 11, marginTop: 6, fontFamily: C.mono, lineHeight: 1.6 }}>
            Lower runs first. Merging is order-independent except when several rules
            set a non-head_turn liveness.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            aria-pressed={isActive}
            style={{
              width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
              background: isActive ? C.accent : C.border, position: 'relative',
              transition: 'background 0.2s', flexShrink: 0, padding: 0,
            }}
          >
            <div style={{
              width: 18, height: 18, borderRadius: '50%', background: '#fff',
              position: 'absolute', top: 3, left: isActive ? 23 : 3, transition: 'left 0.2s',
            }} />
          </button>
          <span style={{ color: C.text, fontSize: 13, fontFamily: C.mono }}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        {error && name !== '' && (
          <div style={{
            marginBottom: 16, background: C.redDim, border: '1px solid rgba(248,113,113,0.4)',
            padding: '8px 12px', color: C.red, fontSize: 12, fontFamily: C.mono,
          }}>
            {error}
          </div>
        )}

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
              fontSize: 13, fontFamily: C.mono, fontWeight: 600, opacity: canSave ? 1 : 0.4,
            }}
          >
            {saving ? 'Saving...' : mode === 'create' ? 'Create' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
