'use client'

import React, { useState, useEffect, useRef, type ReactNode } from 'react'
import type { Lang } from '../aj-scoring/types'
import type { PanelJudge, MockPerf, JudgeScore, RoutineResult, PenaltyState } from '../cjp/types'
import { calcCjpPenalty, droppedIndices, computeResult, DEFAULT_PENALTY } from '../cjp/types'
import { categoryLabel } from '@/components/admin/types'

// ─── translations ──────────────────────────────────────────────────────────────

const T = {
  en: {
    performances: 'Performances',
    open: 'Open', skip: 'Skip', skipped: 'Skipped',
    final: 'Final', prov: 'Prov.',
    noPerf: 'No performance open',
    noPerfSub: 'Select a performance from the list to open it.',
    reviewing: 'Reviewing', backToLive: 'Back to live',
    submitProv: 'Submit provisional', submitFinal: 'Submit final',
    confirmFinal: 'Confirm final', nextPerf: 'Next performance',
    updateProv: 'Update provisional',
    tsPdfTitle: 'Tariff Sheet', pdfNote: 'PDF will appear here once uploaded',
    ej: 'EJ', aj: 'AJ', dj: 'DJ',
    avg: 'Avg', djDif: 'DJ Dif.', djPen: 'Pen.',
    cjpPen: 'CJP Pen.',
    reopenAll: 'Re-open all', reopen: 'Re-open', editScore: 'Edit score',
    scoreE: 'E', scoreA: 'A', scoreD: 'D', scorePen: 'Pen.', scoreTotal: 'Total',
    ranking: 'Ranking', rankCol: '#', teamCol: 'Team',
    balance: 'Balance', dynamic: 'Dynamic', combined: 'Combined',
  },
  es: {
    performances: 'Actuaciones',
    open: 'Abrir', skip: 'Saltar', skipped: 'Saltada',
    final: 'Final', prov: 'Prov.',
    noPerf: 'Sin actuación abierta',
    noPerfSub: 'Selecciona una actuación de la lista para abrirla.',
    reviewing: 'Revisando', backToLive: 'Volver en directo',
    submitProv: 'Enviar provisional', submitFinal: 'Enviar final',
    confirmFinal: 'Confirmar final', nextPerf: 'Siguiente actuación',
    updateProv: 'Actualizar provisional',
    tsPdfTitle: 'Hoja de Tarifa', pdfNote: 'El PDF aparecerá aquí una vez subido',
    ej: 'EJ', aj: 'AJ', dj: 'DJ',
    avg: 'Media', djDif: 'DJ Dif.', djPen: 'Pen.',
    cjpPen: 'CJP Pen.',
    reopenAll: 'Reabrir todo', reopen: 'Reabrir', editScore: 'Editar puntuación',
    scoreE: 'E', scoreA: 'A', scoreD: 'D', scorePen: 'Pen.', scoreTotal: 'Total',
    ranking: 'Clasificación', rankCol: '#', teamCol: 'Equipo',
    balance: 'Balance', dynamic: 'Dinámico', combined: 'Combinado',
  },
}

// ─── score cell ────────────────────────────────────────────────────────────────

export function ScoreCell({ value, dropped }: { value: number | null | undefined; dropped?: boolean }) {
  if (value == null) return <span className="text-slate-300">—</span>
  return (
    <span className={['tabular-nums font-mono text-sm', dropped ? 'line-through text-slate-300' : 'text-slate-800'].join(' ')}>
      {value}
    </span>
  )
}

// ─── judge row ─────────────────────────────────────────────────────────────────

export function JudgeRow({ judge, value, dropped, roleLabel, reopenLabel, editLabel, canReopen, canEdit, showReopen, field, editState, setEditState, onReopen, onEdit }: {
  judge: PanelJudge
  value: number | null | undefined
  dropped?: boolean
  roleLabel: string
  reopenLabel: string
  editLabel?: string
  canReopen: boolean
  canEdit?: boolean
  showReopen: boolean
  field?: 'ejScore' | 'ajScore'
  editState?: { judgeId: string; field: string; value: string } | null
  setEditState?: (s: { judgeId: string; field: string; value: string } | null) => void
  onReopen: (id: string) => void
  onEdit?: (judgeId: string, field: string, value: number) => void
}) {
  const isEditing = !!(editState && editState.judgeId === judge.id && editState.field === field)
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
      <span className="text-xs text-slate-500 truncate">{roleLabel}{judge.roleNumber} {judge.name}</span>
      <div className="flex items-center gap-1.5 shrink-0">
        {isEditing && setEditState && onEdit && field ? (
          <div className="flex items-center gap-1">
            <input type="number" min="0" max="10" step="0.1"
              value={editState!.value}
              onChange={(e) => setEditState({ ...editState!, value: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { const n = parseFloat(editState!.value); if (!isNaN(n) && n >= 0) onEdit(judge.id, field, n); setEditState(null) }
                if (e.key === 'Escape') setEditState(null)
              }}
              className="w-14 text-xs font-mono text-slate-800 border border-blue-300 rounded px-1 py-0.5 text-center focus:outline-none focus:ring-1 focus:ring-blue-400"
              autoFocus
            />
            <button onClick={() => { const n = parseFloat(editState!.value); if (!isNaN(n) && n >= 0) onEdit(judge.id, field, n); setEditState(null) }}
              className="w-5 h-5 rounded text-emerald-500 hover:bg-emerald-50 transition-colors flex items-center justify-center text-xs font-bold">✓</button>
            <button onClick={() => setEditState(null)}
              className="w-5 h-5 rounded text-slate-400 hover:bg-slate-50 transition-colors flex items-center justify-center text-xs">✗</button>
          </div>
        ) : (
          <>
            <ScoreCell value={value} dropped={dropped} />
            {canReopen && showReopen && value != null && (
              <button onClick={() => onReopen(judge.id)} title={reopenLabel}
                className="w-5 h-5 rounded text-slate-300 hover:text-amber-500 hover:bg-amber-50 transition-colors flex items-center justify-center">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 9a9 9 0 0114.65-3.65L20 7M4 17l1.35 1.65A9 9 0 0020 15" />
                </svg>
              </button>
            )}
            {canEdit && value != null && field && setEditState && (
              <button onClick={() => setEditState({ judgeId: judge.id, field, value: String(value) })} title={editLabel}
                className="w-5 h-5 rounded text-slate-300 hover:text-blue-500 hover:bg-blue-50 transition-colors flex items-center justify-center">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ─── score grid ────────────────────────────────────────────────────────────────

export function ScoreGrid({ scores, panelJudges, lang, locked, hideLabelCol, onReopen, onEditScore }: {
  scores: JudgeScore[]
  panelJudges: PanelJudge[]
  lang: Lang
  locked?: boolean
  hideLabelCol?: boolean
  onReopen: (panelJudgeId: string | 'all') => void
  onEditScore?: (panelJudgeId: string, field: 'ejScore' | 'ajScore' | 'djDifficulty' | 'djPenalty', value: number) => void
}) {
  const t = T[lang]
  const ejJudges = panelJudges.filter((j) => j.role === 'EJ').sort((a, b) => a.roleNumber - b.roleNumber)
  const ajJudges = panelJudges.filter((j) => j.role === 'AJ').sort((a, b) => a.roleNumber - b.roleNumber)
  const djJudges = panelJudges.filter((j) => j.role === 'DJ').sort((a, b) => a.roleNumber - b.roleNumber)

  const ejVals = ejJudges.map((j) => scores.find((s) => s.panelJudgeId === j.id)?.ejScore)
  const ajVals = ajJudges.map((j) => scores.find((s) => s.panelJudgeId === j.id)?.ajScore)
  const ejNums = ejVals.filter((v): v is number => v != null)
  const ajNums = ajVals.filter((v): v is number => v != null)
  const ejDropped = droppedIndices(ejNums)
  const ajDropped = droppedIndices(ajNums)
  const ejAvg = ejNums.length > 0
    ? ejNums.filter((_, i) => !ejDropped.has(i)).reduce((s, v) => s + v, 0) / (ejNums.length - ejDropped.size || 1)
    : null
  const ajAvg = ajNums.length > 0
    ? ajNums.filter((_, i) => !ajDropped.has(i)).reduce((s, v) => s + v, 0) / (ajNums.length - ajDropped.size || 1)
    : null
  const anyScore = scores.length > 0
  const canReopen = !locked
  const canEdit = !locked && !!onEditScore

  type EditField = 'ejScore' | 'ajScore' | 'djDifficulty' | 'djPenalty'
  const [editState, setEditState] = useState<{ judgeId: string; field: EditField; value: string } | null>(null)

  function commitDjEdit(judgeId: string, field: 'djDifficulty' | 'djPenalty', rawValue: string) {
    const n = parseFloat(rawValue)
    if (!isNaN(n) && n >= 0) onEditScore?.(judgeId, field, n)
    setEditState(null)
  }

  const PencilIcon = () => (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  )

  function DjFieldRow({ label, judgeId, field, value }: { label: string; judgeId: string; field: 'djDifficulty' | 'djPenalty'; value: number | null | undefined }) {
    const isEditing = editState?.judgeId === judgeId && editState?.field === field
    const displayValue = field === 'djPenalty' && value != null ? -value : value
    return (
      <div className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
        <span className="text-xs text-slate-500">{label}</span>
        <div className="flex items-center gap-1.5">
          {isEditing ? (
            <>
              <input type="number" min="0" step="0.1"
                value={editState!.value}
                onChange={(e) => setEditState((prev) => prev ? { ...prev, value: e.target.value } : prev)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitDjEdit(judgeId, field, editState!.value)
                  if (e.key === 'Escape') setEditState(null)
                }}
                className="w-14 text-xs font-mono text-slate-800 border border-blue-300 rounded px-1 py-0.5 text-center focus:outline-none focus:ring-1 focus:ring-blue-400"
                autoFocus
              />
              <button onClick={() => commitDjEdit(judgeId, field, editState!.value)}
                className="w-5 h-5 rounded text-emerald-500 hover:bg-emerald-50 transition-colors flex items-center justify-center text-xs font-bold">✓</button>
              <button onClick={() => setEditState(null)}
                className="w-5 h-5 rounded text-slate-400 hover:bg-slate-50 transition-colors flex items-center justify-center text-xs">✗</button>
            </>
          ) : (
            <>
              <ScoreCell value={displayValue} />
              {field === 'djDifficulty' && canReopen && value != null && (
                <button onClick={() => onReopen(judgeId)} title={t.reopen}
                  className="w-5 h-5 rounded text-slate-300 hover:text-amber-500 hover:bg-amber-50 transition-colors flex items-center justify-center">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 9a9 9 0 0114.65-3.65L20 7M4 17l1.35 1.65A9 9 0 0020 15" />
                  </svg>
                </button>
              )}
              {canEdit && value != null && (
                <button onClick={() => setEditState({ judgeId, field, value: String(value) })} title={t.editScore}
                  className="w-5 h-5 rounded text-slate-300 hover:text-blue-500 hover:bg-blue-50 transition-colors flex items-center justify-center">
                  <PencilIcon />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    )
  }

  const maxCols = Math.max(ejJudges.length, ajJudges.length, djJudges.length > 0 ? 2 : 1)

  const ReopenBtn = ({ judgeId }: { judgeId: string }) => (
    <button onClick={() => onReopen(judgeId)} title={t.reopen}
      className="w-5 h-5 rounded text-slate-300 hover:text-amber-500 hover:bg-amber-50 transition-colors flex items-center justify-center">
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 9a9 9 0 0114.65-3.65L20 7M4 17l1.35 1.65A9 9 0 0020 15" />
      </svg>
    </button>
  )

  const EditBtn = ({ judgeId, field, value }: { judgeId: string; field: EditField; value: number }) => (
    <button onClick={() => setEditState({ judgeId, field, value: String(value) })} title={t.editScore}
      className="w-5 h-5 rounded text-slate-300 hover:text-blue-500 hover:bg-blue-50 transition-colors flex items-center justify-center">
      <PencilIcon />
    </button>
  )

  const EditInput = ({ judgeId, field }: { judgeId: string; field: 'djDifficulty' | 'djPenalty' }) => (
    <div className="flex items-center gap-1">
      <input type="number" min="0" step="0.1"
        value={editState!.value}
        onChange={(e) => setEditState((prev) => prev ? { ...prev, value: e.target.value } : prev)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commitDjEdit(judgeId, field, editState!.value)
          if (e.key === 'Escape') setEditState(null)
        }}
        className="w-14 text-xs font-mono text-slate-800 border border-blue-300 rounded px-1 py-0.5 text-center focus:outline-none focus:ring-1 focus:ring-blue-400"
        autoFocus
      />
      <button onClick={() => commitDjEdit(judgeId, field, editState!.value)}
        className="w-5 h-5 rounded text-emerald-500 hover:bg-emerald-50 transition-colors flex items-center justify-center text-xs font-bold">✓</button>
      <button onClick={() => setEditState(null)}
        className="w-5 h-5 rounded text-slate-400 hover:bg-slate-50 transition-colors flex items-center justify-center text-xs">✗</button>
    </div>
  )

  const tdBase = 'px-3 py-2 border-t border-slate-100 align-top'
  const tdLabel = `${tdBase} text-xs font-bold text-slate-400 uppercase tracking-wide whitespace-nowrap`
  const tdScore = `${tdBase} border-l border-slate-100`
  const tdEmpty = `${tdBase} border-l border-slate-100 text-slate-300 text-xs`
  const tdAvg  = `${tdBase} border-l border-slate-100`

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      {canReopen && anyScore && (
        <div className="flex justify-end px-3 py-1.5 bg-slate-50 border-b border-slate-200">
          <button onClick={() => onReopen('all')} className="text-xs text-amber-500 hover:text-amber-700 font-medium flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 9a9 9 0 0114.65-3.65L20 7M4 17l1.35 1.65A9 9 0 0020 15" />
            </svg>
            {t.reopenAll}
          </button>
        </div>
      )}

      {/* ── DJ mismatch warning ── */}
      {djJudges.length >= 2 && (() => {
        const djScores  = djJudges.map(j => scores.find(s => s.panelJudgeId === j.id))
        const diffs     = djScores.map(s => s?.djDifficulty).filter((v): v is number => v != null)
        const pens      = djScores.map(s => s?.djPenalty).filter((v): v is number => v != null)
        const diffSpread = diffs.length >= 2 ? Math.max(...diffs) - Math.min(...diffs) : 0
        const penSpread  = pens.length  >= 2 ? Math.max(...pens)  - Math.min(...pens)  : 0
        if (diffSpread <= 0.5 && penSpread === 0) return null
        const parts: string[] = []
        if (diffSpread > 0.5) parts.push(`D: ${diffs.map(v => v.toFixed(2)).join(' / ')} · Δ ${diffSpread.toFixed(2)}`)
        if (penSpread  > 0)   parts.push(`Pen: ${pens.map(v => v.toFixed(2)).join(' / ')}`)
        return (
          <div className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 border-b border-amber-200">
            <svg className="w-3.5 h-3.5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <span className="text-xs font-semibold text-amber-700">
              DJ mismatch — {parts.join('  ·  ')}
            </span>
          </div>
        )
      })()}

      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <tbody>

            {/* ── DJ row (single row with all DJs horizontally) ── */}
            <tr>
              {!hideLabelCol && <td className={tdLabel}>{t.dj}</td>}
              {djJudges.map((j) => {
                const s = scores.find((sc) => sc.panelJudgeId === j.id)
                const isEditingDif = editState?.judgeId === j.id && editState?.field === 'djDifficulty'
                const isEditingPen = editState?.judgeId === j.id && editState?.field === 'djPenalty'
                return (
                  <React.Fragment key={j.id}>
                    {/* Col 1: Difficulty */}
                    <td className={tdScore}>
                      <div className="text-[10px] text-slate-400 mb-0.5 truncate">DJ{j.roleNumber} {j.name}</div>
                      {isEditingDif ? <EditInput judgeId={j.id} field="djDifficulty" /> : (
                        <div className="flex items-center gap-1">
                          <ScoreCell value={s?.djDifficulty} />
                          {canReopen && s?.djDifficulty != null && <ReopenBtn judgeId={j.id} />}
                          {canEdit && s?.djDifficulty != null && <EditBtn judgeId={j.id} field="djDifficulty" value={s.djDifficulty!} />}
                        </div>
                      )}
                    </td>
                    {/* Col 2: Penalty */}
                    <td className={tdScore}>
                      <div className="text-[10px] text-red-500 mb-0.5 font-medium">DJ{j.roleNumber} {t.djPen}</div>
                      {isEditingPen ? <EditInput judgeId={j.id} field="djPenalty" /> : (
                        <div className="flex items-center gap-1">
                          <ScoreCell value={s?.djPenalty != null ? -s.djPenalty : null} />
                          {canEdit && s?.djPenalty != null && <EditBtn judgeId={j.id} field="djPenalty" value={s.djPenalty!} />}
                        </div>
                      )}
                    </td>
                  </React.Fragment>
                )
              })}
              {/* Fill remaining columns if needed */}
              {Array.from({ length: maxCols - (djJudges.length * 2) }).map((_, i) => (
                <td key={`dj-e-${i}`} className={tdEmpty}>—</td>
              ))}
              <td className={tdAvg + ' text-slate-300'}>—</td>
            </tr>

            {/* ── EJ row ── */}
            <tr>
              {!hideLabelCol && <td className={tdLabel}>{t.ej}</td>}
              {ejJudges.map((j, i) => {
                const isEditing = editState?.judgeId === j.id && editState?.field === 'ejScore'
                return (
                  <td key={j.id} className={tdScore}>
                    <div className="text-[10px] text-slate-400 mb-0.5 truncate">EJ{j.roleNumber} {j.name}</div>
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <input type="number" min="0" max="10" step="0.1"
                          value={editState!.value}
                          onChange={(e) => setEditState((prev) => prev ? { ...prev, value: e.target.value } : prev)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') { const n = parseFloat(editState!.value); if (!isNaN(n) && n >= 0) onEditScore?.(j.id, 'ejScore', n); setEditState(null) }
                            if (e.key === 'Escape') setEditState(null)
                          }}
                          className="w-14 text-xs font-mono text-slate-800 border border-blue-300 rounded px-1 py-0.5 text-center focus:outline-none focus:ring-1 focus:ring-blue-400"
                          autoFocus
                        />
                        <button onClick={() => { const n = parseFloat(editState!.value); if (!isNaN(n) && n >= 0) onEditScore?.(j.id, 'ejScore', n); setEditState(null) }}
                          className="w-5 h-5 rounded text-emerald-500 hover:bg-emerald-50 transition-colors flex items-center justify-center text-xs font-bold">✓</button>
                        <button onClick={() => setEditState(null)}
                          className="w-5 h-5 rounded text-slate-400 hover:bg-slate-50 transition-colors flex items-center justify-center text-xs">✗</button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <ScoreCell value={ejVals[i]} dropped={ejDropped.has(i)} />
                        {canReopen && ejVals[i] != null && <ReopenBtn judgeId={j.id} />}
                        {canEdit && ejVals[i] != null && <EditBtn judgeId={j.id} field="ejScore" value={ejVals[i]!} />}
                      </div>
                    )}
                  </td>
                )
              })}
              {Array.from({ length: maxCols - ejJudges.length }).map((_, i) => (
                <td key={`ej-e-${i}`} className={tdEmpty}>—</td>
              ))}
              <td className={tdAvg}>
                <div className="text-[10px] text-slate-400 mb-0.5">{t.avg}</div>
                <span className="font-bold tabular-nums text-slate-600">
                  {ejAvg != null ? ejAvg.toFixed(3) : '—'}
                </span>
              </td>
            </tr>

            {/* ── AJ row ── */}
            <tr>
              {!hideLabelCol && <td className={tdLabel}>{t.aj}</td>}
              {ajJudges.map((j, i) => {
                const isEditing = editState?.judgeId === j.id && editState?.field === 'ajScore'
                return (
                  <td key={j.id} className={tdScore}>
                    <div className="text-[10px] text-slate-400 mb-0.5 truncate">AJ{j.roleNumber} {j.name}</div>
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <input type="number" min="0" max="10" step="0.1"
                          value={editState!.value}
                          onChange={(e) => setEditState((prev) => prev ? { ...prev, value: e.target.value } : prev)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') { const n = parseFloat(editState!.value); if (!isNaN(n) && n >= 0) onEditScore?.(j.id, 'ajScore', n); setEditState(null) }
                            if (e.key === 'Escape') setEditState(null)
                          }}
                          className="w-14 text-xs font-mono text-slate-800 border border-blue-300 rounded px-1 py-0.5 text-center focus:outline-none focus:ring-1 focus:ring-blue-400"
                          autoFocus
                        />
                        <button onClick={() => { const n = parseFloat(editState!.value); if (!isNaN(n) && n >= 0) onEditScore?.(j.id, 'ajScore', n); setEditState(null) }}
                          className="w-5 h-5 rounded text-emerald-500 hover:bg-emerald-50 transition-colors flex items-center justify-center text-xs font-bold">✓</button>
                        <button onClick={() => setEditState(null)}
                          className="w-5 h-5 rounded text-slate-400 hover:bg-slate-50 transition-colors flex items-center justify-center text-xs">✗</button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <ScoreCell value={ajVals[i]} dropped={ajDropped.has(i)} />
                        {canReopen && ajVals[i] != null && <ReopenBtn judgeId={j.id} />}
                        {canEdit && ajVals[i] != null && <EditBtn judgeId={j.id} field="ajScore" value={ajVals[i]!} />}
                      </div>
                    )}
                  </td>
                )
              })}
              {Array.from({ length: maxCols - ajJudges.length }).map((_, i) => (
                <td key={`aj-e-${i}`} className={tdEmpty}>—</td>
              ))}
              <td className={tdAvg}>
                <div className="text-[10px] text-slate-400 mb-0.5">{t.avg}</div>
                <span className="font-bold tabular-nums text-slate-600">
                  {ajAvg != null ? ajAvg.toFixed(3) : '—'}
                </span>
              </td>
            </tr>

          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── score preview ─────────────────────────────────────────────────────────────

export function ScorePreview({ scores, panelJudges, cjpPenalty, lang, compact }: {
  scores: JudgeScore[]
  panelJudges: PanelJudge[]
  cjpPenalty: number
  lang: Lang
  compact?: boolean
}) {
  const t = T[lang]
  const ejJudges = panelJudges.filter((j) => j.role === 'EJ')
  const ajJudges = panelJudges.filter((j) => j.role === 'AJ')
  const djJudges = panelJudges.filter((j) => j.role === 'DJ')
  const ejNums = ejJudges.map((j) => scores.find((s) => s.panelJudgeId === j.id)?.ejScore).filter((v): v is number => v != null)
  const ajNums = ajJudges.map((j) => scores.find((s) => s.panelJudgeId === j.id)?.ajScore).filter((v): v is number => v != null)
  const djScore = djJudges.map((j) => scores.find((s) => s.panelJudgeId === j.id)).find(Boolean)
  if (ejNums.length === 0 && ajNums.length === 0 && !djScore) return null
  const ejDropped = droppedIndices(ejNums)
  const ajDropped = droppedIndices(ajNums)
  const ejAvg = ejNums.length > 0
    ? ejNums.filter((_, i) => !ejDropped.has(i)).reduce((s, v) => s + v, 0) / (ejNums.length - ejDropped.size || 1)
    : 0
  const ajAvg = ajNums.length > 0
    ? ajNums.filter((_, i) => !ajDropped.has(i)).reduce((s, v) => s + v, 0) / (ajNums.length - ajDropped.size || 1)
    : 0
  const difScore = djScore?.djDifficulty ?? 0
  const difPenalty = djScore?.djPenalty ?? 0
  const total = Math.max(0, ejAvg * 2 + ajAvg + difScore - difPenalty - cjpPenalty)

  if (compact) {
    return (
      <div className="bg-slate-800 text-white rounded-xl px-4 py-2 flex items-center gap-3 flex-wrap">
        <span className="text-xs text-slate-400">{t.scoreE} <span className="text-slate-200 font-mono tabular-nums">{(ejAvg * 2).toFixed(3)}</span></span>
        <span className="text-xs text-slate-400">{t.scoreA} <span className="text-slate-200 font-mono tabular-nums">{ajAvg.toFixed(3)}</span></span>
        <span className="text-xs text-slate-400">{t.scoreD} <span className="text-slate-200 font-mono tabular-nums">{difScore.toFixed(2)}</span></span>
        {difPenalty > 0 && <span className="text-xs text-red-400 font-mono tabular-nums">−{difPenalty.toFixed(1)}</span>}
        {cjpPenalty > 0 && <span className="text-xs text-red-400 font-mono tabular-nums">−{cjpPenalty.toFixed(1)}</span>}
        <span className="ml-auto text-xl font-bold tabular-nums">{total.toFixed(3)}</span>
      </div>
    )
  }

  return (
    <div className="bg-slate-800 text-white rounded-xl p-4">
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400 mb-3">
        <span>{t.scoreE} <span className="text-slate-200 font-mono tabular-nums">{(ejAvg * 2).toFixed(3)}</span></span>
        <span>{t.scoreA} <span className="text-slate-200 font-mono tabular-nums">{ajAvg.toFixed(3)}</span></span>
        <span>{t.scoreD} <span className="text-slate-200 font-mono tabular-nums">{difScore.toFixed(2)}</span></span>
        {difPenalty > 0 && <span>{t.djPen} <span className="text-red-400 font-mono tabular-nums">−{difPenalty.toFixed(1)}</span></span>}
        {cjpPenalty > 0 && <span>{t.cjpPen} <span className="text-red-400 font-mono tabular-nums">−{cjpPenalty.toFixed(1)}</span></span>}
      </div>
      <div className="text-right">
        <p className="text-4xl font-bold tabular-nums">{total.toFixed(3)}</p>
      </div>
    </div>
  )
}

// ─── ranking table ─────────────────────────────────────────────────────────────

export function RankingTable({ performances, results, lang, selectedPerfId, onSelectPerf }: {
  performances: MockPerf[]
  results: Record<string, RoutineResult>
  lang: Lang
  selectedPerfId?: string | null
  onSelectPerf?: (perfId: string) => void
}) {
  const t = T[lang]
  if (Object.values(results).length === 0) return null

  const routineLabel = (rt: string) => ({ Balance: t.balance, Dynamic: t.dynamic, Combined: t.combined }[rt] ?? rt)
  const groupKey = (p: MockPerf) => `${p.ageGroup}||${p.category}||${p.routineType}`
  const groupLabel = (p: MockPerf) => `${p.ageGroup} · ${categoryLabel(p.category, lang)} · ${routineLabel(p.routineType)}`

  const groupOrder: string[] = []
  for (const p of performances) {
    const k = groupKey(p)
    if (!groupOrder.includes(k) && results[p.id]) groupOrder.push(k)
  }

  const [activeTab, setActiveTab] = useState<string>(groupOrder[groupOrder.length - 1] ?? '')
  useEffect(() => {
    if (groupOrder.length > 0) setActiveTab(groupOrder[groupOrder.length - 1])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupOrder.length])

  const currentTab = groupOrder.includes(activeTab) ? activeTab : groupOrder[groupOrder.length - 1]
  const rows = performances
    .filter((p) => groupKey(p) === currentTab && results[p.id])
    .sort((a, b) => (results[b.id]?.finalScore ?? 0) - (results[a.id]?.finalScore ?? 0))

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden mt-4">
      <div className="bg-slate-50 px-3 py-2 border-b border-slate-200">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">{t.ranking}</p>
        {groupOrder.length > 1 && (
          <div className="flex gap-1.5 flex-wrap">
            {groupOrder.map((k) => {
              const perf = performances.find((p) => groupKey(p) === k)
              return (
                <button key={k} onClick={() => setActiveTab(k)}
                  className={['px-2.5 py-1 rounded-lg text-xs font-medium transition-all', currentTab === k ? 'bg-slate-800 text-white' : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-400'].join(' ')}>
                  {perf ? groupLabel(perf) : k}
                </button>
              )
            })}
          </div>
        )}
        {groupOrder.length === 1 && (
          <p className="text-xs text-slate-600 font-medium">
            {groupLabel(performances.find((p) => groupKey(p) === groupOrder[0])!)}
          </p>
        )}
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            {[t.rankCol, t.teamCol, t.scoreE, t.scoreA, t.scoreD, t.scorePen, t.scoreTotal, ''].map((h, i) => (
              <th key={i} className="px-3 py-2 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {rows.map((perf, rank) => {
            const r = results[perf.id]!
            const totalPen = r.difPenalty + r.cjpPenalty
            return (
              <tr key={perf.id} onClick={() => onSelectPerf?.(perf.id)}
                className={['transition-colors', onSelectPerf ? 'cursor-pointer' : '', selectedPerfId === perf.id ? 'bg-blue-50' : 'hover:bg-slate-50'].join(' ')}>
                <td className="px-3 py-2 font-bold text-slate-500">{rank + 1}</td>
                <td className="px-3 py-2 font-medium text-slate-800 max-w-[160px] truncate">{perf.gymnasts}</td>
                <td className="px-3 py-2 tabular-nums font-mono text-slate-700">{(r.eScore * 2).toFixed(3)}</td>
                <td className="px-3 py-2 tabular-nums font-mono text-slate-700">{r.aScore.toFixed(3)}</td>
                <td className="px-3 py-2 tabular-nums font-mono text-slate-700">{r.difScore.toFixed(2)}</td>
                <td className="px-3 py-2 tabular-nums font-mono">
                  <span className={totalPen > 0 ? 'text-red-500' : 'text-slate-300'}>{totalPen > 0 ? `−${totalPen.toFixed(1)}` : '—'}</span>
                </td>
                <td className="px-3 py-2 tabular-nums font-bold text-slate-800">{r.finalScore.toFixed(3)}</td>
                <td className="px-3 py-2">
                  <span className={['text-xs font-medium px-2 py-0.5 rounded-full', r.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'border border-amber-300 text-amber-600'].join(' ')}>
                    {r.status === 'approved' ? t.final : t.prov}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ─── main shell ────────────────────────────────────────────────────────────────

export type CJPTabletShellProps = {
  lang: Lang
  performances: MockPerf[]
  currentPerfId: string | null
  panelJudges: PanelJudge[]
  judgeScores: Record<string, JudgeScore[]>
  results: Record<string, RoutineResult>
  penaltyStates: Record<string, PenaltyState>
  onOpen: (perfId: string) => void
  onSkip?: (perfId: string) => void
  onSubmit?: (status: 'provisional' | 'approved', result: RoutineResult) => void
  onReopenScore?: (perfId: string, panelJudgeId: string | 'all') => void
  onEditScore?: (perfId: string, panelJudgeId: string, field: 'ejScore' | 'ajScore' | 'djDifficulty' | 'djPenalty', value: number) => void
  /** Render the right panel. activePerfId = reviewed perf during review mode, else currentPerfId. */
  renderRightPanel: (activePerfId: string | null, isReviewMode: boolean) => ReactNode
  rightPanelClassName?: string
}

export default function CJPTabletShell({
  lang, performances, currentPerfId, panelJudges, judgeScores, results,
  penaltyStates, onOpen, onSkip, onSubmit, onReopenScore, onEditScore,
  renderRightPanel, rightPanelClassName = 'w-80',
}: CJPTabletShellProps) {
  const t = T[lang]
  const [reviewPerfId,    setReviewPerfId]    = useState<string | null>(null)
  const [leftOpen,        setLeftOpen]        = useState(true)
  const [bottomTab,       setBottomTab]       = useState<'ts' | 'ranking'>('ranking')
  const [rightPanelWidth, setRightPanelWidth] = useState(320)
  const resizeStartX     = useRef(0)
  const resizeStartWidth = useRef(0)

  const routineLabel = (rt: string) => ({ Balance: t.balance, Dynamic: t.dynamic, Combined: t.combined }[rt] ?? rt)

  const currentPerf = performances.find((p) => p.id === currentPerfId) ?? null
  const currentScores = currentPerfId ? (judgeScores[currentPerfId] ?? []) : []
  const currentResult = currentPerfId ? results[currentPerfId] ?? null : null
  const currentPenalty = currentPerfId ? (penaltyStates[currentPerfId] ?? DEFAULT_PENALTY) : DEFAULT_PENALTY
  const cjpPenalty = calcCjpPenalty(currentPenalty)

  const reviewPerf = reviewPerfId ? performances.find((p) => p.id === reviewPerfId) ?? null : null
  const reviewScores = reviewPerfId ? (judgeScores[reviewPerfId] ?? []) : []
  const reviewResult = reviewPerfId ? results[reviewPerfId] ?? null : null
  const reviewPenalty = reviewPerfId ? (penaltyStates[reviewPerfId] ?? DEFAULT_PENALTY) : DEFAULT_PENALTY
  const reviewCjpPenalty = calcCjpPenalty(reviewPenalty)

  const isReviewMode = reviewPerfId !== null && reviewPerfId !== currentPerfId
  const activePerfId = isReviewMode ? reviewPerfId : currentPerfId
  const nextPending = performances.find((p) => !p.skipped && !results[p.id] && p.id !== currentPerfId)

  function handleCJPSubmit(status: 'provisional' | 'approved') {
    if (!currentPerfId) return
    const result = computeResult(currentPerfId, currentScores, panelJudges, cjpPenalty, status)
    onSubmit?.(status, result)
  }

  function handleConfirmFinalFromReview() {
    if (!reviewPerfId) return
    const result = computeResult(reviewPerfId, reviewScores, panelJudges, reviewCjpPenalty, 'approved')
    onSubmit?.('approved', result)
  }

  function handleUpdateProvisional() {
    if (!reviewPerfId) return
    const result = computeResult(reviewPerfId, reviewScores, panelJudges, reviewCjpPenalty, 'provisional')
    onSubmit?.('provisional', result)
  }

  function handleRankingRowClick(perfId: string) {
    if (perfId === currentPerfId) { setReviewPerfId(null); return }
    setReviewPerfId((prev) => prev === perfId ? null : perfId)
  }

  return (
    <div className="flex gap-0 h-[calc(100vh-60px)]">

      {/* ── left: performances list ── */}
      <div className={['border-r border-slate-200 bg-white flex flex-col min-h-0 shrink-0 transition-all duration-200', leftOpen ? 'w-64' : 'w-9'].join(' ')}>
        <div className="px-2 py-2.5 border-b border-slate-200 flex items-center justify-between shrink-0">
          {leftOpen && <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{t.performances}</p>}
          <button
            onClick={() => setLeftOpen(o => !o)}
            className="ml-auto p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
            title={leftOpen ? 'Collapse' : 'Expand'}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {leftOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />}
            </svg>
          </button>
        </div>
        <div className={['flex-1 overflow-y-auto', leftOpen ? '' : 'hidden'].join(' ')}>
          {performances.map((perf) => {
            const result = results[perf.id]
            const isCurrent = perf.id === currentPerfId
            const canOpen = !perf.skipped && !result && !isCurrent
            const canSkip = !perf.skipped && !result
            return (
              <div key={perf.id}
                className={['group px-3 py-2.5 border-b border-slate-100 transition-colors', isCurrent ? 'bg-blue-50 border-l-2 border-l-blue-500' : 'hover:bg-slate-50'].join(' ')}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      {isCurrent && (
                        <span className="relative flex h-2 w-2 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
                        </span>
                      )}
                      <span className="text-xs text-slate-400 font-mono shrink-0">{perf.position}</span>
                      <span className="text-xs font-medium text-slate-700 truncate">{perf.gymnasts}</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs text-slate-400">{routineLabel(perf.routineType)}</span>
                      {perf.skipped && <span className="text-xs bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded-full">{t.skipped}</span>}
                      {result && (
                        <span className={['text-xs px-1.5 py-0.5 rounded-full font-medium', result.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'border border-slate-300 text-slate-500'].join(' ')}>
                          {result.status === 'approved' ? t.final : t.prov} {result.finalScore.toFixed(3)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {canOpen && (
                      <button onClick={() => onOpen(perf.id)} title={t.open}
                        className="w-6 h-6 rounded bg-blue-100 text-blue-600 hover:bg-blue-200 flex items-center justify-center transition-colors">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                      </button>
                    )}
                    {canSkip && onSkip && (
                      <button onClick={() => onSkip(perf.id)} title={t.skip}
                        className="w-6 h-6 rounded bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── center: single scroll area ── */}
      <div className="flex-1 overflow-y-auto">

        {/* ── scores section ── */}
        <div className="px-4 py-3 space-y-2">
          {isReviewMode && reviewPerf ? (
            <>
              <div className="bg-slate-700 text-white px-4 py-2 rounded-xl flex items-center gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs text-slate-400 uppercase tracking-wide">{t.reviewing}</span>
                    <button onClick={() => setReviewPerfId(null)}
                      className="text-xs text-slate-300 hover:text-white flex items-center gap-1 transition-colors">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                      {t.backToLive}
                    </button>
                  </div>
                  <p className="text-sm font-semibold truncate">{reviewPerf.gymnasts}</p>
                </div>
                <span className="text-xs text-slate-400 shrink-0 text-right leading-snug">
                  #{reviewPerf.position} · {reviewPerf.ageGroup}<br />{categoryLabel(reviewPerf.category, lang)} · {routineLabel(reviewPerf.routineType)}
                </span>
              </div>
              <ScoreGrid scores={reviewScores} panelJudges={panelJudges} lang={lang}
                hideLabelCol
                locked={reviewResult?.status === 'approved'}
                onReopen={(id) => { onReopenScore?.(reviewPerfId!, id); onOpen(reviewPerfId!); setReviewPerfId(null) }}
                onEditScore={reviewResult?.status === 'provisional' && onEditScore
                  ? (judgeId, field, value) => onEditScore(reviewPerfId!, judgeId, field, value)
                  : undefined
                } />
              <ScorePreview scores={reviewScores} panelJudges={panelJudges} cjpPenalty={reviewCjpPenalty} lang={lang} compact />
              {reviewResult?.status === 'provisional' && (
                <div className="flex gap-2">
                  <button onClick={handleUpdateProvisional}
                    className="flex-1 py-2 rounded-xl border-2 border-slate-300 text-slate-700 text-sm font-semibold hover:border-slate-400 hover:bg-slate-50 active:scale-95 transition-all">
                    {t.updateProv}
                  </button>
                  <button onClick={handleConfirmFinalFromReview}
                    className="flex-1 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 active:scale-95 transition-all">
                    ✓ {t.confirmFinal}
                  </button>
                </div>
              )}
              {reviewResult?.status === 'approved' && (
                <div className="py-2 rounded-xl bg-emerald-50 border-2 border-emerald-200 text-center">
                  <span className="text-sm font-semibold text-emerald-700">✓ {t.final} · {reviewResult.finalScore.toFixed(3)}</span>
                </div>
              )}
            </>
          ) : currentPerf ? (
            <>
              <div className="bg-slate-800 text-white px-4 py-2 rounded-xl flex items-center gap-2">
                <p className="text-sm font-semibold truncate flex-1">{currentPerf.gymnasts}</p>
                <span className="text-xs text-slate-400 shrink-0 text-right leading-snug">
                  #{currentPerf.position} · {currentPerf.ageGroup}<br />{categoryLabel(currentPerf.category, lang)} · {routineLabel(currentPerf.routineType)}
                </span>
              </div>
              <ScoreGrid scores={currentScores} panelJudges={panelJudges} lang={lang}
                hideLabelCol
                locked={currentResult?.status === 'approved'}
                onReopen={(id) => onReopenScore?.(currentPerfId!, id)}
                onEditScore={onEditScore && currentPerfId
                  ? (judgeId, field, value) => onEditScore(currentPerfId, judgeId, field, value)
                  : undefined
                } />
              <ScorePreview scores={currentScores} panelJudges={panelJudges} cjpPenalty={cjpPenalty} lang={lang} compact />
              {!currentResult && (
                <div className="flex gap-2">
                  <button onClick={() => handleCJPSubmit('provisional')}
                    className="flex-1 py-2 rounded-xl border-2 border-slate-300 text-slate-700 text-sm font-semibold hover:border-slate-400 hover:bg-slate-50 active:scale-95 transition-all">
                    {t.submitProv}
                  </button>
                  <button onClick={() => handleCJPSubmit('approved')}
                    className="flex-1 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 active:scale-95 transition-all">
                    ✓ {t.submitFinal}
                  </button>
                </div>
              )}
              {currentResult?.status === 'provisional' && (
                <div className="flex items-center gap-2">
                  <div className="flex-1 py-2 rounded-xl border-2 border-slate-200 text-center">
                    <span className="text-sm font-medium text-slate-500">{t.prov} · {currentResult.finalScore.toFixed(3)}</span>
                  </div>
                  <button onClick={() => handleCJPSubmit('approved')}
                    className="flex-1 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 active:scale-95 transition-all">
                    ✓ {t.confirmFinal}
                  </button>
                </div>
              )}
              {currentResult?.status === 'approved' && (
                <div className="flex items-center gap-2">
                  <div className="flex-1 py-2 rounded-xl bg-emerald-50 border-2 border-emerald-200 text-center">
                    <span className="text-sm font-semibold text-emerald-700">✓ {t.final} · {currentResult.finalScore.toFixed(3)}</span>
                  </div>
                  {nextPending && (
                    <button onClick={() => onOpen(nextPending.id)}
                      className="flex-1 py-2 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 active:scale-95 transition-all flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                      {t.nextPerf}
                    </button>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-36 text-center gap-2">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 5v14l11-7z" />
                </svg>
              </div>
              <p className="text-base font-semibold text-slate-600">{t.noPerf}</p>
              <p className="text-xs text-slate-400">{t.noPerfSub}</p>
            </div>
          )}
        </div>

        {/* ── sticky tab bar: TS / Ranking ── */}
        <div className="sticky top-0 z-10 flex border-y border-slate-200 bg-white">
          {(['ranking', 'ts'] as const).map((tab) => (
            <button key={tab} onClick={() => setBottomTab(tab)}
              className={['flex-1 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors',
                bottomTab === tab
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-slate-400 hover:text-slate-600'].join(' ')}>
              {tab === 'ts' ? 'TS' : t.ranking}
            </button>
          ))}
        </div>

        {/* ── tab content ── */}
        {bottomTab === 'ts' && (() => {
          const activePerf = isReviewMode ? reviewPerf : currentPerf
          return activePerf?.tsUrl ? (
            <iframe src={activePerf.tsUrl} className="w-full border-0" style={{ height: '65vh' }} title={t.tsPdfTitle} />
          ) : (
            <div className="flex flex-col items-center justify-center h-48 gap-2 text-slate-300">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm">{t.pdfNote}</p>
            </div>
          )
        })()}
        {bottomTab === 'ranking' && (
          <div className="px-4 py-3">
            <RankingTable performances={performances} results={results} lang={lang}
              selectedPerfId={activePerfId}
              onSelectPerf={handleRankingRowClick} />
          </div>
        )}
      </div>

      {/* ── resize handle ── */}
      <div
        className="w-1.5 shrink-0 cursor-col-resize bg-slate-200 hover:bg-blue-400 active:bg-blue-500 transition-colors select-none touch-none"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          resizeStartX.current     = e.clientX
          resizeStartWidth.current = rightPanelWidth
        }}
        onPointerMove={(e) => {
          if (e.buttons === 0) return
          const delta    = resizeStartX.current - e.clientX
          const newWidth = Math.max(180, Math.min(640, resizeStartWidth.current + delta))
          setRightPanelWidth(newWidth)
        }}
      />

      {/* ── right panel: slot ── */}
      <div style={{ width: rightPanelWidth }} className="border-l border-slate-200 bg-white flex flex-col min-h-0 shrink-0 overflow-hidden">
        {renderRightPanel(activePerfId, isReviewMode)}
      </div>
    </div>
  )
}
