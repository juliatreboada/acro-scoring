'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase'
import type { Lang } from '@/components/scoring/types'
import type { Judge, SectionPanelJudge, Session, Team } from '@/components/admin/types'
import { useT } from '@/lib/useT'

type DraftRow = {
  sectionPanelJudgeId: string
  role: SectionPanelJudge['role']
  roleNumber: number
  judgeName: string
  ejScore: string
  ajScore: string
  djDifficulty: string
  djPenalty: string
  cjpPenalty: string
  dbScore: string
}

function numToInput(v: number | null | undefined): string {
  return v == null ? '' : String(v)
}

function judgeLabel(role: string, roleNumber: number, name: string) {
  return `${role}${roleNumber > 1 ? roleNumber : ''} · ${name}`
}

export default function ManualScoresModal({
  lang,
  competitionId,
  sportType,
  session,
  team,
  assignments,
  judges,
  onClose,
}: {
  lang: Lang
  competitionId: string
  sportType: string
  session: Session
  team: Team
  assignments: SectionPanelJudge[]
  judges: Judge[]
  onClose: () => void
}) {
  const t = useT('ManualScoresModal', lang)
  const isRg = sportType === 'rg'
  const judgeNameById = useMemo(
    () => Object.fromEntries(judges.map((j) => [j.id, j.full_name])),
    [judges],
  )

  const panelSlots = useMemo(
    () =>
      assignments
        .filter((a) => a.section_id === session.section_id && a.panel_id === session.panel_id)
        .sort((a, b) => a.role.localeCompare(b.role) || a.role_number - b.role_number),
    [assignments, session.section_id, session.panel_id],
  )

  const [rows, setRows] = useState<DraftRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [queueOnTv, setQueueOnTv] = useState(true)
  const [resultStatus, setResultStatus] = useState<'provisional' | 'approved'>('approved')

  const loadScores = useCallback(async () => {
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { data, error: loadErr } = await supabase
      .from('scores')
      .select('section_panel_judge_id,ej_score,aj_score,dj_difficulty,dj_penalty,cjp_penalty,db_score')
      .eq('session_id', session.id)
      .eq('team_id', team.id)

    if (loadErr) {
      setError(loadErr.message)
      setLoading(false)
      return
    }

    const byJudge = Object.fromEntries((data ?? []).map((s) => [s.section_panel_judge_id, s]))
    setRows(
      panelSlots.map((slot) => {
        const existing = byJudge[slot.id]
        const name = slot.judge_id ? (judgeNameById[slot.judge_id] ?? t.unassigned) : t.unassigned
        return {
          sectionPanelJudgeId: slot.id,
          role: slot.role,
          roleNumber: slot.role_number,
          judgeName: name,
          ejScore: numToInput(existing?.ej_score),
          ajScore: numToInput(existing?.aj_score),
          djDifficulty: numToInput(existing?.dj_difficulty),
          djPenalty: numToInput(existing?.dj_penalty),
          cjpPenalty: numToInput(existing?.cjp_penalty),
          dbScore: numToInput(existing?.db_score),
        }
      }),
    )
    setLoading(false)
  }, [session.id, team.id, panelSlots, judgeNameById, t.unassigned])

  useEffect(() => {
    void loadScores()
  }, [loadScores])

  function patchRow(id: string, patch: Partial<DraftRow>) {
    setRows((prev) => prev.map((r) => (r.sectionPanelJudgeId === id ? { ...r, ...patch } : r)))
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      const supabase = createClient()
      const { data: { session: authSession } } = await supabase.auth.getSession()
      const token = authSession?.access_token
      const res = await fetch('/api/admin/scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          competitionId,
          sessionId: session.id,
          teamId: team.id,
          queueOnTv,
          resultStatus,
          scores: rows.map((r) => ({
            sectionPanelJudgeId: r.sectionPanelJudgeId,
            ejScore: r.ejScore === '' ? null : parseFloat(r.ejScore),
            ajScore: r.ajScore === '' ? null : parseFloat(r.ajScore),
            djDifficulty: r.djDifficulty === '' ? null : parseFloat(r.djDifficulty),
            djPenalty: r.djPenalty === '' ? null : parseFloat(r.djPenalty),
            cjpPenalty: r.cjpPenalty === '' ? null : parseFloat(r.cjpPenalty),
            dbScore: r.dbScore === '' ? null : parseFloat(r.dbScore),
          })),
        }),
      })
      const json = await res.json() as { error?: string }
      if (!res.ok) throw new Error(json.error ?? t.saveFailed)
      setSaved(true)
      await loadScores()
    } catch (e) {
      setError(e instanceof Error ? e.message : t.saveFailed)
    } finally {
      setSaving(false)
    }
  }

  function fieldForRole(row: DraftRow, field: keyof Pick<DraftRow, 'ejScore' | 'ajScore' | 'djDifficulty' | 'djPenalty' | 'cjpPenalty' | 'dbScore'>) {
    const role = row.role
    const show =
      (field === 'ejScore' && (isRg ? role === 'E' : role === 'EJ')) ||
      (field === 'ajScore' && (isRg ? role === 'A' : role === 'AJ')) ||
      (field === 'djDifficulty' && (isRg ? role === 'DA' : role === 'DJ')) ||
      (field === 'djPenalty' && !isRg && role === 'DJ') ||
      (field === 'cjpPenalty' && (isRg ? role === 'RJ' : role === 'CJP')) ||
      (field === 'dbScore' && isRg && role === 'DB')
    if (!show) return null
    const labels: Record<string, string> = {
      ejScore: isRg ? t.eScore : t.ej,
      ajScore: isRg ? t.aScore : t.aj,
      djDifficulty: isRg ? t.da : t.djDiff,
      djPenalty: t.djPen,
      cjpPenalty: isRg ? t.rjPen : t.cjpPen,
      dbScore: t.db,
    }
    return (
      <label key={field} className="flex flex-col gap-0.5 min-w-[4.5rem]">
        <span className="text-[10px] font-semibold text-slate-400 uppercase">{labels[field]}</span>
        <input
          type="number"
          step="0.1"
          min="0"
          value={row[field]}
          onChange={(e) => patchRow(row.sectionPanelJudgeId, { [field]: e.target.value })}
          className="w-full text-sm font-mono text-slate-800 border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400"
        />
      </label>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[min(90vh,36rem)] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-3 border-b border-slate-100 flex items-start justify-between gap-3 shrink-0">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{t.title}</p>
            <p className="text-sm font-bold text-slate-800 truncate">{team.gymnast_display}</p>
            <p className="text-xs text-slate-500 truncate">{session.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 w-8 h-8 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 flex items-center justify-center"
            aria-label={t.close}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-500 rounded-full animate-spin" />
            </div>
          ) : panelSlots.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">{t.noJudges}</p>
          ) : (
            rows.map((row) => (
              <div key={row.sectionPanelJudgeId} className="rounded-xl border border-slate-200 p-3 bg-slate-50/50">
                <p className="text-xs font-semibold text-slate-700 mb-2">
                  {judgeLabel(row.role, row.roleNumber, row.judgeName)}
                </p>
                <div className="flex flex-wrap gap-2">
                  {fieldForRole(row, 'ejScore')}
                  {fieldForRole(row, 'ajScore')}
                  {fieldForRole(row, 'djDifficulty')}
                  {fieldForRole(row, 'djPenalty')}
                  {fieldForRole(row, 'cjpPenalty')}
                  {fieldForRole(row, 'dbScore')}
                </div>
              </div>
            ))
          )}
          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
          )}
          {saved && !error && (
            <p className="text-xs text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
              {queueOnTv ? t.savedWithTv : t.savedWithResults}
            </p>
          )}
          {!loading && panelSlots.length > 0 && (
            <div className="rounded-xl border border-slate-200 p-3 bg-white space-y-3">
              <div>
                <p className="text-xs font-semibold text-slate-600 mb-1.5">{t.resultStatusLabel}</p>
                <div className="flex gap-2">
                  {(['approved', 'provisional'] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => { setResultStatus(status); setSaved(false) }}
                      className={[
                        'px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors',
                        resultStatus === status
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300',
                      ].join(' ')}
                    >
                      {status === 'provisional' ? t.provisional : t.approved}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">{t.resultStatusHint}</p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={queueOnTv}
                  onChange={(e) => { setQueueOnTv(e.target.checked); setSaved(false) }}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">{t.queueOnTv}</span>
              </label>
              <p className="text-[11px] text-slate-400 pl-6">{t.queueOnTvHint}</p>
            </div>
          )}
        </div>

        <div className="px-4 py-3 border-t border-slate-100 flex justify-end gap-2 shrink-0 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            {t.cancel}
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving || loading || panelSlots.length === 0}
            className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? t.saving : t.save}
          </button>
        </div>
      </div>
    </div>
  )
}
