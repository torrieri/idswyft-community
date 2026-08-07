// frontend/src/components/compliance/useComplianceRulesets.ts
//
// Owns all server state for the compliance page: the ruleset list, the selected
// ruleset's detail, and every mutation.
//
// No optimistic updates. POST /rulesets returns a partial object (no updated_at,
// no rule_count — compliance.ts:93), so appending it would render undefined
// counts and crash date formatting. Every mutation refetches instead.

import { useCallback, useState } from 'react'
import * as api from './api'
import { ComplianceApiError } from './api'
import { normalizeAction } from './validation'
import type { ComplianceRule, ComplianceRuleset, ComplianceRulesetDetail, ComplianceAction, Condition } from './types'

export interface RulesetFormValues {
  name: string
  description: string
  is_active: boolean
  priority: number
}

export interface RuleDraft {
  condition: Condition
  action: ComplianceAction
  description: string
}

export interface UseComplianceRulesets {
  rulesets: ComplianceRuleset[]
  listLoading: boolean
  listError: string | null
  detail: ComplianceRulesetDetail | null
  detailLoading: boolean
  detailError: string | null
  saving: boolean
  refreshList: () => Promise<void>
  loadDetail: (id: string) => Promise<void>
  saveRuleset: (id: string | null, values: RulesetFormValues) => Promise<boolean>
  toggleRulesetActive: (rs: ComplianceRuleset, next: boolean) => Promise<void>
  removeRuleset: (id: string) => Promise<boolean>
  saveRule: (rulesetId: string, ruleId: string | null, draft: RuleDraft) => Promise<boolean>
  removeRule: (rulesetId: string, ruleId: string) => Promise<boolean>
}

export function useComplianceRulesets(
  enabled: boolean,
  onError: (message: string) => void,
  onSuccess: (message: string) => void,
  onUnauthorized: (status: number) => void,
): UseComplianceRulesets {
  const [rulesets, setRulesets] = useState<ComplianceRuleset[]>([])
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)

  const [detail, setDetail] = useState<ComplianceRulesetDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)

  const [saving, setSaving] = useState(false)

  /** Route auth failures to the page guard; surface everything else as a toast. */
  const handleError = useCallback((err: unknown, fallback: string): string => {
    if (err instanceof ComplianceApiError) {
      if (err.status === 401 || err.status === 403) {
        onUnauthorized(err.status)
        return err.message
      }
      return err.message
    }
    return err instanceof Error ? err.message : fallback
  }, [onUnauthorized])

  const refreshList = useCallback(async () => {
    if (!enabled) return
    setListLoading(true)
    setListError(null)
    try {
      setRulesets(await api.listRulesets())
    } catch (err) {
      setListError(handleError(err, 'Failed to load rulesets'))
    } finally {
      setListLoading(false)
    }
  }, [enabled, handleError])

  const loadDetail = useCallback(async (id: string) => {
    setDetailLoading(true)
    setDetailError(null)
    try {
      setDetail(await api.getRuleset(id))
    } catch (err) {
      setDetail(null)
      setDetailError(handleError(err, 'Failed to load rules'))
    } finally {
      setDetailLoading(false)
    }
  }, [handleError])

  const saveRuleset = useCallback(async (id: string | null, values: RulesetFormValues): Promise<boolean> => {
    setSaving(true)
    try {
      if (id) {
        // Partial PUT: the backend assigns whatever is defined, so sending
        // description:'' would write an empty string. That is intended here —
        // the form treats a cleared field as an explicit clear.
        await api.updateRuleset(id, {
          name: values.name.trim(),
          description: values.description.trim() || null,
          is_active: values.is_active,
          priority: values.priority,
        })
        onSuccess('Ruleset updated')
      } else {
        await api.createRuleset({
          name: values.name.trim(),
          description: values.description.trim() || null,
          is_active: values.is_active,
          priority: values.priority,
        })
        onSuccess('Ruleset created')
      }
      await refreshList()
      if (id && detail?.id === id) await loadDetail(id)
      return true
    } catch (err) {
      onError(handleError(err, 'Failed to save ruleset'))
      return false
    } finally {
      setSaving(false)
    }
  }, [detail?.id, handleError, loadDetail, onError, onSuccess, refreshList])

  const toggleRulesetActive = useCallback(async (rs: ComplianceRuleset, next: boolean) => {
    try {
      await api.updateRuleset(rs.id, { is_active: next })
      onSuccess(`${rs.name} ${next ? 'activated' : 'deactivated'}`)
      await refreshList()
    } catch (err) {
      onError(handleError(err, 'Failed to update ruleset'))
    }
  }, [handleError, onError, onSuccess, refreshList])

  const removeRuleset = useCallback(async (id: string): Promise<boolean> => {
    setSaving(true)
    try {
      await api.deleteRuleset(id)
      onSuccess('Ruleset deleted')
      if (detail?.id === id) setDetail(null)
      await refreshList()
      return true
    } catch (err) {
      onError(handleError(err, 'Failed to delete ruleset'))
      return false
    } finally {
      setSaving(false)
    }
  }, [detail?.id, handleError, onError, onSuccess, refreshList])

  const saveRule = useCallback(async (rulesetId: string, ruleId: string | null, draft: RuleDraft): Promise<boolean> => {
    setSaving(true)
    try {
      const body = {
        condition: draft.condition,
        action: normalizeAction(draft.action),
        description: draft.description.trim() || null,
      }
      if (ruleId) {
        await api.updateRule(ruleId, body)
        onSuccess('Rule updated')
      } else {
        await api.createRule(rulesetId, body)
        onSuccess('Rule created')
      }
      await Promise.all([loadDetail(rulesetId), refreshList()])
      return true
    } catch (err) {
      onError(handleError(err, 'Failed to save rule'))
      return false
    } finally {
      setSaving(false)
    }
  }, [handleError, loadDetail, onError, onSuccess, refreshList])

  const removeRule = useCallback(async (rulesetId: string, ruleId: string): Promise<boolean> => {
    setSaving(true)
    try {
      await api.deleteRule(ruleId)
      onSuccess('Rule deleted')
      await Promise.all([loadDetail(rulesetId), refreshList()])
      return true
    } catch (err) {
      onError(handleError(err, 'Failed to delete rule'))
      return false
    } finally {
      setSaving(false)
    }
  }, [handleError, loadDetail, onError, onSuccess, refreshList])

  return {
    rulesets, listLoading, listError,
    detail, detailLoading, detailError,
    saving,
    refreshList, loadDetail,
    saveRuleset, toggleRulesetActive, removeRuleset,
    saveRule, removeRule,
  }
}

/** Re-exported so the page can type its rule-modal state without importing types.ts directly. */
export type { ComplianceRule }
