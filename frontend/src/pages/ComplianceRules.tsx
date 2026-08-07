// frontend/src/pages/ComplianceRules.tsx
//
// Admin page for the compliance rule engine (/api/v2/compliance).
//
// Auth note: the backend accepts ONLY a reviewer JWT with role='admin'
// (compliance.ts:15-46). Platform-admin cookies (audience idswyft-admin) are
// rejected by design, and plain reviewers fail the role check. So the guard
// branches: 401 → login, 403 → back to verifications. The role badge is static
// because nothing but an org admin can reach a rendered page here.

import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeftIcon, ArrowPathIcon, BeakerIcon, CheckCircleIcon,
  ComputerDesktopIcon, ShieldCheckIcon, XCircleIcon, XMarkIcon,
} from '@heroicons/react/24/outline'
import { API_BASE_URL } from '../config/api'
import { fetchCsrfToken, getCsrfToken, csrfHeader, clearCsrfToken } from '../lib/csrf'
import { C, injectFonts } from '../theme'
import '../styles/patterns.css'
import { RulesetList } from '../components/compliance/RulesetList'
import { RulesetFormModal } from '../components/compliance/RulesetFormModal'
import { RulesTable } from '../components/compliance/RulesTable'
import { RuleEditorModal } from '../components/compliance/RuleEditorModal'
import { EvaluatePanel } from '../components/compliance/EvaluatePanel'
import { useComplianceRulesets } from '../components/compliance/useComplianceRulesets'
import type { ComplianceRule, ComplianceRuleset } from '../components/compliance/types'

type Toast = { message: string; type: 'success' | 'error' }
type RulesetModal = { mode: 'create' | 'edit'; initial: ComplianceRuleset | null }
type RuleModal = { initial: ComplianceRule | null }
type ConfirmDelete =
  | { kind: 'ruleset'; ruleset: ComplianceRuleset }
  | { kind: 'rule'; rule: ComplianceRule }

export function ComplianceRules() {
  const navigate = useNavigate()

  useEffect(() => { injectFonts() }, [])

  const [authReady, setAuthReady] = useState(() => !!getCsrfToken())
  const [isMobile, setIsMobile] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [rulesetModal, setRulesetModal] = useState<RulesetModal | null>(null)
  const [ruleModal, setRuleModal] = useState<RuleModal | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<ConfirmDelete | null>(null)
  const [showEvaluate, setShowEvaluate] = useState(false)

  // ── Mobile viewport detection ──
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // ── Auth guard ──
  // Probes the compliance endpoint itself, so a plain reviewer (403) is bounced
  // before the page renders rather than seeing an empty shell.
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v2/compliance/rulesets`, { credentials: 'include' })
      .then(res => {
        if (res.ok) { setAuthReady(true); fetchCsrfToken(); return }
        clearCsrfToken()
        if (res.status === 401) navigate('/admin/login')
        else navigate('/admin/verifications')
      })
      .catch(() => { clearCsrfToken(); navigate('/admin/login') })
  }, [navigate])

  // ── Toast auto-dismiss ──
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(t)
  }, [toast])

  const showError = useCallback((message: string) => setToast({ message, type: 'error' }), [])
  const showSuccess = useCallback((message: string) => setToast({ message, type: 'success' }), [])
  const handleUnauthorized = useCallback((status: number) => {
    clearCsrfToken()
    navigate(status === 401 ? '/admin/login' : '/admin/verifications')
  }, [navigate])

  const store = useComplianceRulesets(authReady, showError, showSuccess, handleUnauthorized)
  const { refreshList, loadDetail } = store

  useEffect(() => { if (authReady) refreshList() }, [authReady, refreshList])

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id)
    loadDetail(id)
  }, [loadDetail])

  const executeDelete = async () => {
    if (!confirmDelete) return
    if (confirmDelete.kind === 'ruleset') {
      const ok = await store.removeRuleset(confirmDelete.ruleset.id)
      if (ok && selectedId === confirmDelete.ruleset.id) setSelectedId(null)
    } else if (selectedId) {
      await store.removeRule(selectedId, confirmDelete.rule.id)
    }
    setConfirmDelete(null)
  }

  // ── Mobile guard ──
  if (isMobile) {
    return (
      <div style={{
        background: C.bg, minHeight: '100vh', fontFamily: C.sans,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '32px 24px', textAlign: 'center',
      }}>
        <div style={{ background: C.panel, padding: '48px 32px', border: `1px solid ${C.border}`, maxWidth: 400 }}>
          <ComputerDesktopIcon style={{ width: 48, height: 48, color: C.cyan, margin: '0 auto 20px' }} />
          <h2 style={{ color: C.text, fontSize: 20, fontWeight: 600, margin: '0 0 12px', fontFamily: C.sans }}>
            Desktop Required
          </h2>
          <p style={{ color: C.muted, fontSize: 14, margin: '0 0 24px', lineHeight: 1.6 }}>
            Compliance rules need a larger screen to edit safely.
          </p>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'none', border: `1px solid ${C.border}`, color: C.text,
              padding: '10px 24px', cursor: 'pointer', fontFamily: C.sans, fontSize: 14, fontWeight: 500,
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const selectedRuleset = store.rulesets.find(r => r.id === selectedId) ?? null

  return (
    <div
      className="pattern-crosshatch pattern-faint pattern-fade-edges pattern-full"
      style={{ background: C.bg, minHeight: '100vh', fontFamily: C.sans }}
    >
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              onClick={() => navigate('/admin/verifications')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, display: 'flex', padding: 4 }}
              title="Back to verifications"
            >
              <ArrowLeftIcon style={{ width: 20, height: 20 }} />
            </button>
            <div>
              <div style={{ fontFamily: C.mono, fontSize: 11, color: C.muted, letterSpacing: '0.08em', marginBottom: 8 }}>
                idswyft / compliance-rules
              </div>
              <h1 style={{ fontFamily: C.mono, color: C.text, fontSize: 24, fontWeight: 600, margin: 0 }}>
                Compliance Rules
              </h1>
              <p style={{ color: C.dim, fontSize: 13, margin: '4px 0 0', fontFamily: C.mono }}>
                Conditions that adjust verification requirements at session start
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => setShowEvaluate(true)}
              className="btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', fontSize: 13 }}
            >
              <BeakerIcon style={{ width: 14, height: 14 }} />
              Dry-run
            </button>
            <span className="badge" style={{ background: C.cyanDim, color: C.cyan, borderColor: C.cyanBorder }}>
              Org Admin
            </span>
            <button
              onClick={() => { refreshList(); if (selectedId) loadDetail(selectedId) }}
              className="btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', fontSize: 13 }}
            >
              <ArrowPathIcon style={{ width: 14, height: 14 }} />
              Refresh
            </button>
            <button
              onClick={() => {
                fetch(`${API_BASE_URL}/api/auth/logout`, { method: 'POST', credentials: 'include', headers: csrfHeader() }).catch(() => {})
                clearCsrfToken()
                navigate('/admin/login')
              }}
              className="btn-outline"
              style={{ padding: '8px 16px', fontSize: 13 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.red; e.currentTarget.style.color = C.red }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--rule)'; e.currentTarget.style.color = 'var(--ink)' }}
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* ── Engine note ── */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 10,
          background: C.panel, border: `1px solid ${C.border}`, padding: '12px 16px', marginBottom: 16,
        }}>
          <ShieldCheckIcon style={{ width: 15, height: 15, color: C.cyan, flexShrink: 0, marginTop: 1 }} />
          <div style={{ color: C.dim, fontSize: 12, fontFamily: C.mono, lineHeight: 1.6 }}>
            Rules are evaluated when a verification session is created. Only <strong>active</strong> rulesets
            run, and all matches merge into one resolved action — the most restrictive mode wins.
            Use the dry-run before activating anything.
          </div>
        </div>

        {/* ── Two-pane layout ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 16, alignItems: 'start' }}>
          <RulesetList
            rulesets={store.rulesets}
            selectedId={selectedId}
            loading={store.listLoading}
            error={store.listError}
            onSelect={handleSelect}
            onToggleActive={store.toggleRulesetActive}
            onEdit={rs => setRulesetModal({ mode: 'edit', initial: rs })}
            onDelete={rs => setConfirmDelete({ kind: 'ruleset', ruleset: rs })}
            onCreate={() => setRulesetModal({ mode: 'create', initial: null })}
            onRetry={refreshList}
          />

          <RulesTable
            ruleset={selectedId ? store.detail : null}
            loading={store.detailLoading}
            error={store.detailError}
            onAddRule={() => setRuleModal({ initial: null })}
            onEditRule={rule => setRuleModal({ initial: rule })}
            onDeleteRule={rule => setConfirmDelete({ kind: 'rule', rule })}
          />
        </div>
      </div>

      {/* ── Modals ── */}
      {rulesetModal && (
        <RulesetFormModal
          mode={rulesetModal.mode}
          initial={rulesetModal.initial}
          saving={store.saving}
          onSave={async values => {
            const ok = await store.saveRuleset(rulesetModal.initial?.id ?? null, values)
            if (ok) setRulesetModal(null)
          }}
          onClose={() => setRulesetModal(null)}
        />
      )}

      {ruleModal && selectedId && (
        <RuleEditorModal
          rulesetName={selectedRuleset?.name ?? ''}
          initial={ruleModal.initial}
          saving={store.saving}
          onSave={async draft => {
            const ok = await store.saveRule(selectedId, ruleModal.initial?.id ?? null, draft)
            if (ok) setRuleModal(null)
          }}
          onClose={() => setRuleModal(null)}
        />
      )}

      {showEvaluate && <EvaluatePanel onClose={() => setShowEvaluate(false)} />}

      {/* ── Delete confirmation ── */}
      {confirmDelete && (
        <div
          onClick={() => setConfirmDelete(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 160,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: C.panel, border: `1px solid ${C.borderStrong}`, padding: 28,
              width: 440, maxWidth: '100%', boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
            }}
          >
            <h2 style={{ fontFamily: C.mono, color: C.text, fontSize: 17, fontWeight: 600, margin: '0 0 12px' }}>
              {confirmDelete.kind === 'ruleset' ? 'Delete ruleset?' : 'Delete rule?'}
            </h2>
            <div style={{ color: C.muted, fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>
              {confirmDelete.kind === 'ruleset' ? (
                <>
                  <strong style={{ color: C.text }}>{confirmDelete.ruleset.name}</strong> and its{' '}
                  {confirmDelete.ruleset.rule_count ?? 0}{' '}
                  {confirmDelete.ruleset.rule_count === 1 ? 'rule' : 'rules'} will be deleted. This cannot be undone.
                </>
              ) : (
                <>This rule will be deleted. This cannot be undone.</>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setConfirmDelete(null)}
                disabled={store.saving}
                style={{
                  background: C.surface, border: `1px solid ${C.border}`, color: C.muted,
                  padding: '10px 20px', cursor: 'pointer', fontSize: 13, fontFamily: C.mono, fontWeight: 500,
                }}
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                disabled={store.saving}
                style={{
                  background: C.redDim, border: '1px solid rgba(248,113,113,0.4)', color: C.red,
                  padding: '10px 24px', cursor: store.saving ? 'wait' : 'pointer',
                  fontSize: 13, fontFamily: C.mono, fontWeight: 600, opacity: store.saving ? 0.6 : 1,
                }}
              >
                {store.saving ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 200,
          background: toast.type === 'success' ? C.greenDim : C.redDim,
          border: `1px solid ${toast.type === 'success' ? 'rgba(52,211,153,0.4)' : 'rgba(248,113,113,0.4)'}`,
          padding: '14px 20px', maxWidth: 400,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          display: 'flex', alignItems: 'center', gap: 10,
          animation: 'slideUp 0.3s ease-out',
        }}>
          {toast.type === 'success'
            ? <CheckCircleIcon style={{ width: 18, height: 18, color: C.green, flexShrink: 0 }} />
            : <XCircleIcon style={{ width: 18, height: 18, color: C.red, flexShrink: 0 }} />}
          <span style={{ color: toast.type === 'success' ? C.green : C.red, fontSize: 13, fontWeight: 500 }}>
            {toast.message}
          </span>
          <button
            onClick={() => setToast(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.dim, padding: 2, marginLeft: 4, flexShrink: 0 }}
          >
            <XMarkIcon style={{ width: 14, height: 14 }} />
          </button>
          <style>{'@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }'}</style>
        </div>
      )}
    </div>
  )
}
