import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { ArrowPathIcon } from '@heroicons/react/24/outline'
import { API_BASE_URL } from '../../config/api'
import { csrfHeader } from '../../lib/csrf'
import { C } from '../../theme'

type UnreadableDocumentAction = 'reject' | 'manual_review'

interface VerificationPolicySectionProps {
  authHeaders: Record<string, string>
}

const RETRY_OPTIONS = [0, 1, 2, 3, 4, 5] as const
const SETTINGS_URL = `${API_BASE_URL}/api/developer/settings/verification-policy`

const ACTION_OPTIONS: { value: UnreadableDocumentAction; label: string; description: string }[] = [
  {
    value: 'reject',
    label: 'Reject',
    description: 'The verification fails and the user has to start a new one.',
  },
  {
    value: 'manual_review',
    label: 'Send to manual review',
    description: 'The user continues the flow and the verification ends in manual review, so a reviewer decides with the photos they sent.',
  },
]

export function VerificationPolicySection({ authHeaders }: VerificationPolicySectionProps) {
  const [maxGateRetries, setMaxGateRetries] = useState(0)
  const [unreadableAction, setUnreadableAction] = useState<UnreadableDocumentAction>('reject')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch(SETTINGS_URL, { headers: authHeaders, credentials: 'include' })
      .then(res => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then(data => {
        if (cancelled) return
        setMaxGateRetries(data.max_gate_retries ?? 0)
        setUnreadableAction(data.unreadable_document_action ?? 'reject')
      })
      .catch(() => { if (!cancelled) toast.error('Failed to load verification policy') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
    // authHeaders is rebuilt every render; the token it carries does not change while the modal is open
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch(SETTINGS_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders, ...csrfHeader() },
        credentials: 'include',
        body: JSON.stringify({ max_gate_retries: maxGateRetries, unreadable_document_action: unreadableAction }),
      })
      if (res.ok) {
        toast.success('Verification policy saved')
      } else {
        const err = await res.json().catch(() => ({}))
        toast.error(err.error || err.message || 'Failed to save verification policy')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <ArrowPathIcon style={{ width: 16, height: 16, color: C.accent }} />
        <div style={{ fontFamily: C.mono, fontWeight: 600, fontSize: 13, color: C.text }}>Unreadable Documents</div>
      </div>
      <div style={{ color: C.muted, fontSize: 13, marginBottom: 16, lineHeight: 1.6 }}>
        What happens when the photo of the ID cannot be read. Applies to new verifications;
        the <code style={{ fontFamily: C.mono }}>initialize</code> request can still override both values.
      </div>

      {loading ? (
        <div style={{ color: C.muted, fontSize: 13 }}>Loading...</div>
      ) : (
        <>
          <label htmlFor="policy-retries" style={{ display: 'block', color: C.text, fontSize: 13, marginBottom: 6 }}>
            Retakes allowed in the same verification
          </label>
          <select
            id="policy-retries"
            value={maxGateRetries}
            onChange={e => setMaxGateRetries(Number(e.target.value))}
            className="form-input"
            style={{ maxWidth: 120, marginBottom: 16 }}
          >
            {RETRY_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
          </select>

          <div style={{ color: C.text, fontSize: 13, marginBottom: 8 }}>
            {maxGateRetries > 0 ? 'When the retakes run out' : 'When the photo cannot be read'}
          </div>
          <div role="radiogroup" style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {ACTION_OPTIONS.map(option => (
              <label
                key={option.value}
                style={{
                  display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer', padding: '10px 12px',
                  border: `1px solid ${unreadableAction === option.value ? C.accent : C.border}`,
                }}
              >
                <input
                  type="radio"
                  name="unreadable-document-action"
                  value={option.value}
                  checked={unreadableAction === option.value}
                  onChange={() => setUnreadableAction(option.value)}
                  style={{ marginTop: 3 }}
                />
                <span>
                  <span style={{ display: 'block', color: C.text, fontSize: 13, fontWeight: 500 }}>{option.label}</span>
                  <span style={{ display: 'block', color: C.muted, fontSize: 12, lineHeight: 1.5 }}>{option.description}</span>
                </span>
              </label>
            ))}
          </div>

          <button onClick={save} disabled={saving} className="btn-accent" style={{ opacity: saving ? 0.5 : 1 }}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </>
      )}
    </div>
  )
}
