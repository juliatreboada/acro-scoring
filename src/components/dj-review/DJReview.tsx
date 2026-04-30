'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import type { Lang } from '../scoring/types'
import type { Sheet, ReviewElement, ElementType, TsReviewStatus } from './types'
import { categoryLabel } from '@/components/admin/types'

// ─── translations ─────────────────────────────────────────────────────────────

const T = {
  en: {
    title: 'Tariff Sheet Review',
    reviewed: 'reviewed',
    of: 'of',
    sheets: 'sheets reviewed',
    pdfPlaceholder: 'Tariff Sheet PDF',
    pdfNote: 'PDF will appear here once uploaded',
    openPdf: 'Open in new tab',
    elements: 'Elements',
    noElements: 'No elements added yet',
    position: 'Pos',
    type: 'Type',
    label: 'Label (optional)',
    difficulty: 'Difficulty',
    difficultyHint: '0.00 – 4.00',
    difficultyHintInt: 'e.g. 30 → 0.30',
    isStatic: 'Static',
    addElement: 'Add element',
    markReviewed: 'Mark as reviewed',
    markIncorrect: 'Mark as incorrect',
    incorrectPlaceholder: 'Describe what is wrong with this tariff sheet…',
    send: 'Send',
    cancel: 'Cancel',
    reopen: 'Reopen',
    reviewedBy: 'Reviewed',
    clubNotified: 'Club notified — TS marked as incorrect',
    waitingDJ2: 'Waiting for the other DJ to confirm…',
    dj2Header: 'The other DJ marked this TS as:',
    dj2MarkCorrect: 'Mark as correct',
    dj2Confirm: 'Confirm & send to club',
    newTs: 'Club uploaded a new TS — please review again',
    incorrect: 'Incorrect',
    deleteElement: 'Delete',
    editElement: 'Edit',
    saveElement: 'Save',
    cancelEdit: 'Cancel',
    balance: 'Balance',
    mount: 'Mount',
    dynamic: 'Dynamic',
    individual: 'Individual',
    motion: 'Motion',
    routineBalance: 'Balance',
    routineDynamic: 'Dynamic',
    routineCombined: 'Combined',
    totalDifficulty: 'Total D',
    refresh: 'Refresh',
  },
  es: {
    title: 'Revisión de Hojas de Tarifa',
    reviewed: 'revisadas',
    of: 'de',
    sheets: 'hojas revisadas',
    pdfPlaceholder: 'PDF Hoja de Tarifa',
    pdfNote: 'El PDF aparecerá aquí una vez subido',
    openPdf: 'Abrir en nueva pestaña',
    elements: 'Elementos',
    noElements: 'No hay elementos añadidos',
    position: 'Pos',
    type: 'Tipo',
    label: 'Etiqueta (opcional)',
    difficulty: 'Dificultad',
    difficultyHint: '0.00 – 4.00',
    difficultyHintInt: 'ej. 30 → 0.30',
    isStatic: 'Estático',
    addElement: 'Añadir elemento',
    markReviewed: 'Marcar como revisada',
    markIncorrect: 'Marcar como incorrecta',
    incorrectPlaceholder: 'Describe qué hay incorrecto en esta hoja de tarifa…',
    send: 'Enviar',
    cancel: 'Cancelar',
    reopen: 'Reabrir',
    reviewedBy: 'Revisada',
    clubNotified: 'Club notificado — TS marcada como incorrecta',
    waitingDJ2: 'Esperando confirmación del otro DJ…',
    dj2Header: 'El otro DJ ha marcado esta TS como:',
    dj2MarkCorrect: 'Marcar como correcta',
    dj2Confirm: 'Confirmar y enviar al club',
    newTs: 'El club ha subido una nueva TS — revísala de nuevo',
    incorrect: 'Incorrecta',
    deleteElement: 'Eliminar',
    editElement: 'Editar',
    saveElement: 'Guardar',
    cancelEdit: 'Cancelar',
    balance: 'Balance',
    mount: 'Mount',
    dynamic: 'Dinámico',
    individual: 'Individual',
    motion: 'Motion',
    routineBalance: 'Equilibrio',
    routineDynamic: 'Dinámico',
    routineCombined: 'Combinado',
    totalDifficulty: 'D total',
    refresh: 'Actualizar',
  },
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function usesIntegerDifficulty(ageGroup: string): boolean {
  const lower = ageGroup.toLowerCase()
  return (
    lower.includes('youth') ||
    lower.includes('junior') ||
    lower.includes('senior') ||
    lower.includes('absoluta')
  )
}

function typeBadge(type: ElementType, isStatic: boolean, t: typeof T['en']) {
  if (type === 'balance') return { label: t.balance,  color: 'bg-blue-100 text-blue-700' }
  if (type === 'mount')   return { label: t.mount,    color: 'bg-blue-100 text-blue-700' }
  if (type === 'dynamic') return { label: t.dynamic,  color: 'bg-purple-100 text-purple-700' }
  if (type === 'motion')  return { label: t.motion,   color: 'bg-slate-100 text-slate-500' }
  if (isStatic) return { label: `${t.individual} · ${t.isStatic}`, color: 'bg-amber-100 text-amber-700' }
  return { label: t.individual, color: 'bg-amber-100 text-amber-700' }
}

// ─── element form ─────────────────────────────────────────────────────────────

type ElementFormState = {
  elementType: ElementType | ''
  isStatic: boolean
  label: string
  difficultyValue: string
}

const EMPTY_FORM: ElementFormState = {
  elementType: '',
  isStatic: false,
  label: '',
  difficultyValue: '',
}

function ElementForm({ lang, integerMode, onAdd }: {
  lang: Lang
  integerMode: boolean
  onAdd: (el: Omit<ReviewElement, 'id' | 'position'>) => Promise<void>
}) {
  const t = T[lang]
  const [form, setForm] = useState<ElementFormState>(EMPTY_FORM)

  const rawNum = parseFloat(form.difficultyValue)
  const diffNum = integerMode ? rawNum / 100 : rawNum
  const isValid =
    form.elementType !== '' &&
    form.difficultyValue !== '' &&
    !isNaN(rawNum) &&
    rawNum >= 0 &&
    (integerMode ? rawNum <= 400 : rawNum <= 4)

  async function handleSubmit() {
    if (!isValid || form.elementType === '') return
    setForm(EMPTY_FORM)
    await onAdd({
      elementType: form.elementType,
      isStatic: form.isStatic,
      label: form.label.trim(),
      difficultyValue: parseFloat(diffNum.toFixed(2)),
    })
  }

  return (
    <div className="border border-dashed border-slate-200 rounded-xl p-3 bg-slate-50 space-y-3">
      <div className="flex gap-1.5 flex-wrap">
        {(['balance', 'mount', 'dynamic', 'individual', 'motion'] as ElementType[]).map((type) => (
          <button
            key={type}
            onClick={() => setForm((f) => ({ ...f, elementType: type, isStatic: false }))}
            className={[
              'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize',
              form.elementType === type
                ? 'bg-slate-800 text-white border-slate-800'
                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400',
            ].join(' ')}
          >
            {t[type as 'balance' | 'dynamic' | 'individual']}
          </button>
        ))}
        {form.elementType === 'individual' && (
          <button
            onClick={() => setForm((f) => ({ ...f, isStatic: !f.isStatic }))}
            className={[
              'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
              form.isStatic
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white text-slate-400 border-slate-200 hover:border-blue-300',
            ].join(' ')}
          >
            {t.isStatic}
          </button>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={form.label}
          onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder={t.label}
          className="flex-1 text-sm text-slate-800 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-slate-400 placeholder:text-slate-300 bg-white"
        />
        <div className="flex flex-col items-end gap-0.5">
          <input
            type="number"
            value={form.difficultyValue}
            onChange={(e) => setForm((f) => ({ ...f, difficultyValue: e.target.value }))}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder={integerMode ? '0 – 400' : t.difficultyHint}
            min={0}
            max={integerMode ? 400 : 4}
            step={integerMode ? 1 : 0.01}
            className="w-28 text-sm text-slate-800 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-slate-400 placeholder:text-slate-300 bg-white text-right tabular-nums"
          />
          {integerMode && form.difficultyValue !== '' && !isNaN(rawNum) && (
            <span className="text-xs text-slate-400 tabular-nums">= {diffNum.toFixed(2)}</span>
          )}
        </div>
      </div>

      <button
        disabled={!isValid}
        onClick={handleSubmit}
        className={[
          'w-full py-2 rounded-lg text-sm font-medium transition-all',
          isValid
            ? 'bg-slate-800 text-white hover:bg-slate-700 active:scale-95'
            : 'bg-slate-100 text-slate-300 cursor-not-allowed',
        ].join(' ')}
      >
        + {t.addElement}
      </button>
    </div>
  )
}

// ─── inline element edit ──────────────────────────────────────────────────────

function ElementEditRow({ el, lang, integerMode, onSave, onCancel }: {
  el: ReviewElement
  lang: Lang
  integerMode: boolean
  onSave: (updated: Omit<ReviewElement, 'id' | 'position'>) => void
  onCancel: () => void
}) {
  const t = T[lang]
  const [form, setForm] = useState<ElementFormState>({
    elementType: el.elementType,
    isStatic: el.isStatic,
    label: el.label,
    difficultyValue: integerMode
      ? String(Math.round(el.difficultyValue * 100))
      : String(el.difficultyValue),
  })

  const rawNum = parseFloat(form.difficultyValue)
  const diffNum = integerMode ? rawNum / 100 : rawNum
  const isValid =
    form.elementType !== '' &&
    form.difficultyValue !== '' &&
    !isNaN(rawNum) &&
    rawNum >= 0 &&
    (integerMode ? rawNum <= 400 : rawNum <= 4)

  function handleSave() {
    if (!isValid || form.elementType === '') return
    onSave({
      elementType: form.elementType,
      isStatic: form.isStatic,
      label: form.label.trim(),
      difficultyValue: parseFloat(diffNum.toFixed(2)),
    })
  }

  return (
    <div className="border border-blue-200 rounded-xl p-3 bg-blue-50 space-y-2">
      <div className="flex gap-1 flex-wrap">
        {(['balance', 'mount', 'dynamic', 'individual', 'motion'] as ElementType[]).map((type) => (
          <button key={type} onClick={() => setForm((f) => ({ ...f, elementType: type, isStatic: false }))}
            className={['px-2.5 py-1 rounded-lg text-xs font-medium border transition-all capitalize',
              form.elementType === type
                ? 'bg-slate-800 text-white border-slate-800'
                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400',
            ].join(' ')}
          >
            {t[type as 'balance' | 'dynamic' | 'individual']}
          </button>
        ))}
        {form.elementType === 'individual' && (
          <button onClick={() => setForm((f) => ({ ...f, isStatic: !f.isStatic }))}
            className={['px-2.5 py-1 rounded-lg text-xs font-medium border transition-all',
              form.isStatic ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-slate-400 border-slate-200 hover:border-blue-300',
            ].join(' ')}
          >
            {t.isStatic}
          </button>
        )}
      </div>
      <div className="flex gap-2">
        <input type="text" value={form.label}
          onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          placeholder={t.label}
          className="flex-1 text-sm text-slate-800 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-400 placeholder:text-slate-300 bg-white"
        />
        <input type="number" value={form.difficultyValue}
          onChange={(e) => setForm((f) => ({ ...f, difficultyValue: e.target.value }))}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          min={0} max={integerMode ? 400 : 4} step={integerMode ? 1 : 0.01}
          className="w-24 text-sm text-slate-800 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-400 bg-white text-right tabular-nums"
        />
      </div>
      <div className="flex gap-2">
        <button onClick={handleSave} disabled={!isValid}
          className={['flex-1 py-1.5 rounded-lg text-xs font-medium transition-all',
            isValid ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-300 cursor-not-allowed',
          ].join(' ')}
        >
          {t.saveElement}
        </button>
        <button onClick={onCancel}
          className="px-4 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-700 border border-slate-200 hover:border-slate-300 transition-all"
        >
          {t.cancelEdit}
        </button>
      </div>
    </div>
  )
}

// ─── review actions ───────────────────────────────────────────────────────────

function ReviewActions({ sheet, myJudgeId, lang, onMarkChecked, onMarkIncorrect, onDJ2Confirm, onReopen }: {
  sheet: Sheet
  myJudgeId: string
  lang: Lang
  onMarkChecked: () => void
  onMarkIncorrect: (comment: string) => void
  onDJ2Confirm: (decision: 'checked' | 'incorrect', comment: string) => void
  onReopen: () => void
}) {
  const t = T[lang]
  const [showIncorrectForm, setShowIncorrectForm] = useState(false)
  // Pre-fill comment from DJ1 for DJ2's confirmation view
  const [comment, setComment] = useState(sheet.dj1Comment ?? '')

  const iAmDJ1 = !sheet.dj1Id || sheet.dj1Id === myJudgeId
  const awaitingMyAction = sheet.reviewStatus === 'awaiting_dj2' && !iAmDJ1
  const waitingForOther = sheet.reviewStatus === 'awaiting_dj2' && iAmDJ1

  // ── checked ──
  if (sheet.reviewStatus === 'checked') {
    return (
      <div className="flex items-center justify-between px-3 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-sm text-emerald-700 font-medium">{t.reviewedBy}</span>
        </div>
        <button onClick={onReopen} className="text-xs text-slate-400 hover:text-slate-600 underline underline-offset-2">
          {t.reopen}
        </button>
      </div>
    )
  }

  // ── incorrect ──
  if (sheet.reviewStatus === 'incorrect') {
    return (
      <div className="space-y-2 shrink-0">
        <div className="px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center shrink-0">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <span className="text-xs text-red-700 font-medium">{t.clubNotified}</span>
            </div>
            <button onClick={onReopen} className="text-xs text-slate-400 hover:text-slate-600 underline underline-offset-2">
              {t.reopen}
            </button>
          </div>
          {sheet.finalComment && (
            <p className="text-xs text-red-600 pl-7 leading-snug">{sheet.finalComment}</p>
          )}
        </div>
      </div>
    )
  }

  // ── awaiting DJ2 — DJ1's view (locked) ──
  if (waitingForOther) {
    return (
      <div className="px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-xl shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-amber-400 animate-pulse shrink-0" />
          <span className="text-sm text-amber-700 font-medium">{t.waitingDJ2}</span>
        </div>
        {sheet.dj1Comment && (
          <p className="text-xs text-amber-600 pl-6 mt-1 leading-snug">{sheet.dj1Comment}</p>
        )}
      </div>
    )
  }

  // ── awaiting DJ2 — DJ2's view (must act) ──
  if (awaitingMyAction) {
    return (
      <div className="space-y-2 shrink-0">
        <div className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-xs text-amber-600 font-medium mb-0.5">{t.dj2Header}</p>
          <p className="text-sm font-semibold text-amber-900">
            {sheet.dj1Decision === 'checked' ? `✓ ${t.reviewedBy}` : `✗ ${t.incorrect}`}
          </p>
        </div>

        {/* Pre-filled comment for DJ2 to edit (shown when DJ1 flagged as incorrect OR when DJ2 wants to override to incorrect) */}
        {(sheet.dj1Decision === 'incorrect' || showIncorrectForm) && (
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t.incorrectPlaceholder}
            rows={3}
            className="w-full text-sm text-slate-800 border border-amber-300 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-400 placeholder:text-slate-300 bg-amber-50 resize-none"
          />
        )}

        <div className="flex gap-2">
          {/* Confirm as correct */}
          <button
            onClick={() => onDJ2Confirm('checked', '')}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white transition-all"
          >
            ✓ {t.dj2MarkCorrect}
          </button>
          {/* Confirm / trigger incorrect */}
          {sheet.dj1Decision === 'incorrect' ? (
            <button
              onClick={() => onDJ2Confirm('incorrect', comment)}
              disabled={!comment.trim()}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-red-500 hover:bg-red-600 active:scale-95 disabled:opacity-50 text-white transition-all"
            >
              ✗ {t.dj2Confirm}
            </button>
          ) : !showIncorrectForm ? (
            <button
              onClick={() => setShowIncorrectForm(true)}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-white hover:bg-red-50 border border-red-200 text-red-500 hover:text-red-600 transition-all"
            >
              ✗ {t.markIncorrect}
            </button>
          ) : (
            <button
              onClick={() => onDJ2Confirm('incorrect', comment)}
              disabled={!comment.trim()}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-red-500 hover:bg-red-600 active:scale-95 disabled:opacity-50 text-white transition-all"
            >
              ✗ {t.dj2Confirm}
            </button>
          )}
        </div>
      </div>
    )
  }

  // ── pending / new_ts: both action buttons ──
  return (
    <div className="space-y-2 shrink-0">
      {sheet.reviewStatus === 'new_ts' && (
        <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-xs text-blue-700 font-medium">{t.newTs}</p>
        </div>
      )}

      {!showIncorrectForm ? (
        <>
          <button
            onClick={onMarkChecked}
            className="w-full py-3 rounded-xl text-sm font-medium bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white transition-all"
          >
            ✓ {t.markReviewed}
          </button>
          <button
            onClick={() => setShowIncorrectForm(true)}
            className="w-full py-2.5 rounded-xl text-sm font-medium bg-white hover:bg-red-50 border border-red-200 text-red-500 hover:text-red-600 transition-all"
          >
            ✗ {t.markIncorrect}
          </button>
        </>
      ) : (
        <>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t.incorrectPlaceholder}
            rows={3}
            autoFocus
            className="w-full text-sm text-slate-800 border border-red-300 rounded-xl px-3 py-2 focus:outline-none focus:border-red-400 placeholder:text-slate-300 bg-red-50 resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={() => { onMarkIncorrect(comment); setShowIncorrectForm(false) }}
              disabled={!comment.trim()}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-red-500 hover:bg-red-600 active:scale-95 disabled:opacity-50 text-white transition-all"
            >
              {t.send}
            </button>
            <button
              onClick={() => { setShowIncorrectForm(false); setComment('') }}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-700 border border-slate-200 hover:border-slate-300 transition-all"
            >
              {t.cancel}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// ─── sheet panel ──────────────────────────────────────────────────────────────

function SheetPanel({ sheet, myJudgeId, lang, onAddElement, onDeleteElement, onEditElement,
  onMarkChecked, onMarkIncorrect, onDJ2Confirm, onReopen }: {
  sheet: Sheet
  myJudgeId: string
  lang: Lang
  onAddElement: (sheetId: string, el: Omit<ReviewElement, 'id' | 'position'>) => Promise<void>
  onDeleteElement: (sheetId: string, elementId: string) => Promise<void>
  onEditElement: (sheetId: string, elementId: string, el: Omit<ReviewElement, 'id' | 'position'>) => Promise<void>
  onMarkChecked: (sheetId: string) => Promise<void>
  onMarkIncorrect: (sheetId: string, comment: string) => Promise<void>
  onDJ2Confirm: (sheetId: string, decision: 'checked' | 'incorrect', comment: string) => Promise<void>
  onReopen: (sheetId: string) => Promise<void>
}) {
  const t = T[lang]
  const isLocked = sheet.reviewStatus === 'checked' || sheet.reviewStatus === 'incorrect' || sheet.reviewStatus === 'awaiting_dj2'
  const integerMode = usesIntegerDifficulty(sheet.ageGroup)
  const totalD = sheet.elements.reduce((s, el) => s + el.difficultyValue, 0)
  const [editingId, setEditingId] = useState<string | null>(null)

  return (
    <div className="flex gap-4 h-full min-h-0">
      {/* PDF panel */}
      <div className="flex-1 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-3 bg-white text-slate-400 min-h-0">
        {sheet.pdfUrl ? (
          <iframe src={sheet.pdfUrl} className="w-full h-full rounded-2xl" />
        ) : (
          <>
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6M9 17h4" />
            </svg>
            <p className="font-medium">{t.pdfPlaceholder}</p>
            <p className="text-xs">{t.pdfNote}</p>
          </>
        )}
      </div>

      {/* elements + review panel */}
      <div className="w-[400px] flex flex-col gap-3 min-h-0">
        {/* element list */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 min-h-0">
          {sheet.elements.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">{t.noElements}</p>
          ) : (
            sheet.elements.map((el) => {
              if (!isLocked && editingId === el.id) {
                return (
                  <ElementEditRow
                    key={el.id}
                    el={el}
                    lang={lang}
                    integerMode={integerMode}
                    onSave={async (updated) => {
                      setEditingId(null)
                      await onEditElement(sheet.id, el.id, updated)
                    }}
                    onCancel={() => setEditingId(null)}
                  />
                )
              }
              const badge = typeBadge(el.elementType, el.isStatic, t)
              return (
                <div
                  key={el.id}
                  className="group flex items-center gap-2 px-3 py-2 bg-white border border-slate-100 rounded-xl"
                >
                  <span className="text-xs text-slate-400 font-mono w-5 shrink-0">{el.position}</span>
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded shrink-0 ${badge.color}`}>
                    {badge.label}
                  </span>
                  <span className="text-sm text-slate-700 flex-1 leading-snug min-w-0 truncate">
                    {el.label || <span className="text-slate-300 italic">—</span>}
                  </span>
                  <span className="text-xs font-mono text-slate-500 shrink-0 tabular-nums">
                    {el.difficultyValue.toFixed(2)}
                  </span>
                  {!isLocked && (
                    <>
                      <button
                        onClick={() => setEditingId(el.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-blue-400 transition-all shrink-0"
                        aria-label={t.editElement}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => onDeleteElement(sheet.id, el.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400 transition-all shrink-0"
                        aria-label={t.deleteElement}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* total D */}
        {sheet.elements.length > 0 && (
          <div className="flex justify-between items-center px-3 py-2 bg-slate-50 rounded-xl border border-slate-100 shrink-0">
            <span className="text-xs text-slate-500">{t.totalDifficulty}</span>
            <span className="text-sm font-bold text-slate-700 tabular-nums">{totalD.toFixed(2)}</span>
          </div>
        )}

        {/* add element form (only when editable) */}
        {!isLocked && (
          <ElementForm lang={lang} integerMode={integerMode} onAdd={(el) => onAddElement(sheet.id, el)} />
        )}

        {/* review actions */}
        <ReviewActions
          sheet={sheet}
          myJudgeId={myJudgeId}
          lang={lang}
          onMarkChecked={() => onMarkChecked(sheet.id)}
          onMarkIncorrect={(c) => onMarkIncorrect(sheet.id, c)}
          onDJ2Confirm={(d, c) => onDJ2Confirm(sheet.id, d, c)}
          onReopen={() => onReopen(sheet.id)}
        />
      </div>
    </div>
  )
}

// ─── main component ───────────────────────────────────────────────────────────

type DJReviewProps = {
  initialSheets: Sheet[]
  myJudgeId: string
  lang: Lang
  practiceMode?: boolean
}

export default function DJReview({ initialSheets, myJudgeId, lang, practiceMode = false }: DJReviewProps) {
  const supabase = createClient()
  const t = T[lang]
  const [sheets, setSheets] = useState<Sheet[]>(initialSheets)
  const [modalSheetId, setModalSheetId] = useState<string | null>(null)

  const reviewedCount = sheets.filter((s) => s.reviewStatus === 'checked').length

  // ── element handlers (unchanged) ──────────────────────────────────────────

  async function handleAddElement(sheetId: string, el: Omit<ReviewElement, 'id' | 'position'>) {
    const sheet = sheets.find((s) => s.id === sheetId)
    if (!sheet) return
    const position = sheet.elements.length + 1
    const tempId = `temp-${Date.now()}-${Math.random()}`

    setSheets((prev) => prev.map((s) => {
      if (s.id !== sheetId) return s
      return { ...s, elements: [...s.elements, { ...el, id: tempId, position }] }
    }))

    if (!practiceMode) {
      const { data } = await supabase
        .from('ts_elements')
        .insert({
          team_id: sheet.teamId,
          competition_id: sheet.competitionId,
          routine_type: sheet.routineType as 'Balance' | 'Dynamic' | 'Combined',
          position,
          label: el.label,
          element_type: el.elementType,
          is_static: el.isStatic,
          difficulty_value: el.difficultyValue,
        })
        .select('id')
        .single()

      if (data) {
        setSheets((prev) => prev.map((s) => {
          if (s.id !== sheetId) return s
          return {
            ...s,
            elements: s.elements.map((e) => e.id === tempId ? { ...e, id: data.id } : e),
          }
        }))
      }
    }
  }

  async function handleDeleteElement(sheetId: string, elementId: string) {
    if (!practiceMode) await supabase.from('ts_elements').delete().eq('id', elementId)

    setSheets((prev) => prev.map((s) => {
      if (s.id !== sheetId) return s
      const elements = s.elements
        .filter((el) => el.id !== elementId)
        .map((el, i) => ({ ...el, position: i + 1 }))
      return { ...s, elements }
    }))
  }

  async function handleEditElement(sheetId: string, elementId: string, el: Omit<ReviewElement, 'id' | 'position'>) {
    setSheets((prev) => prev.map((s) => {
      if (s.id !== sheetId) return s
      return {
        ...s,
        elements: s.elements.map((e) => e.id === elementId ? { ...e, ...el } : e),
      }
    }))

    if (!practiceMode) {
      await supabase
        .from('ts_elements')
        .update({
          label: el.label,
          element_type: el.elementType,
          is_static: el.isStatic,
          difficulty_value: el.difficultyValue,
        })
        .eq('id', elementId)
    }
  }

  // ── review status handlers ────────────────────────────────────────────────

  function updateSheetReview(sheetId: string, patch: Partial<Sheet>) {
    setSheets((prev) => prev.map((s) => s.id === sheetId ? { ...s, ...patch } : s))
  }

  async function handleMarkChecked(sheetId: string) {
    const sheet = sheets.find((s) => s.id === sheetId)
    if (!sheet) return
    const now = new Date().toISOString()
    const isSecondDJ = sheet.hasTwoDJs && sheet.dj1Id !== null && sheet.dj1Id !== myJudgeId
    const newStatus: TsReviewStatus = (!sheet.hasTwoDJs || isSecondDJ) ? 'checked' : 'awaiting_dj2'

    if (!practiceMode) {
      if (isSecondDJ) {
        await supabase.from('ts_review_status')
          .update({ status: newStatus, dj2_id: myJudgeId, dj2_decision: 'checked', dj2_comment: null, dj2_at: now })
          .eq('team_id', sheet.teamId).eq('competition_id', sheet.competitionId).eq('routine_type', sheet.routineType as "Balance" | "Dynamic" | "Combined")
      } else {
        await supabase.from('ts_review_status').upsert({
          team_id: sheet.teamId, competition_id: sheet.competitionId,
          routine_type: sheet.routineType as 'Balance' | 'Dynamic' | 'Combined',
          status: newStatus,
          dj1_id: myJudgeId, dj1_decision: 'checked', dj1_comment: null, dj1_at: now,
          dj2_id: null, dj2_decision: null, dj2_comment: null, dj2_at: null,
          final_comment: null, notified_at: null,
        }, { onConflict: 'team_id,competition_id,routine_type' })
      }
    }

    updateSheetReview(sheetId, {
      reviewStatus: newStatus,
      dj1Id: isSecondDJ ? sheet.dj1Id : myJudgeId,
      dj1Decision: isSecondDJ ? sheet.dj1Decision : 'checked',
      dj2Id: isSecondDJ ? myJudgeId : null,
    })
  }

  async function handleMarkIncorrect(sheetId: string, comment: string) {
    const sheet = sheets.find((s) => s.id === sheetId)
    if (!sheet) return
    const now = new Date().toISOString()
    const isSecondDJ = sheet.hasTwoDJs && sheet.dj1Id !== null && sheet.dj1Id !== myJudgeId
    const newStatus: TsReviewStatus = (!sheet.hasTwoDJs || isSecondDJ) ? 'incorrect' : 'awaiting_dj2'
    const isFinal = newStatus === 'incorrect'

    if (!practiceMode) {
      if (isSecondDJ) {
        await supabase.from('ts_review_status')
          .update({
            status: newStatus, dj2_id: myJudgeId, dj2_decision: 'incorrect',
            dj2_comment: comment, dj2_at: now,
            ...(isFinal ? { final_comment: comment, notified_at: now } : {}),
          })
          .eq('team_id', sheet.teamId).eq('competition_id', sheet.competitionId).eq('routine_type', sheet.routineType as "Balance" | "Dynamic" | "Combined")
      } else {
        await supabase.from('ts_review_status').upsert({
          team_id: sheet.teamId, competition_id: sheet.competitionId,
          routine_type: sheet.routineType as 'Balance' | 'Dynamic' | 'Combined',
          status: newStatus,
          dj1_id: myJudgeId, dj1_decision: 'incorrect', dj1_comment: comment, dj1_at: now,
          dj2_id: null, dj2_decision: null, dj2_comment: null, dj2_at: null,
          ...(isFinal ? { final_comment: comment, notified_at: now } : { final_comment: null, notified_at: null }),
        }, { onConflict: 'team_id,competition_id,routine_type' })
      }
    }

    updateSheetReview(sheetId, {
      reviewStatus: newStatus,
      dj1Id: isSecondDJ ? sheet.dj1Id : myJudgeId,
      dj1Decision: isSecondDJ ? sheet.dj1Decision : 'incorrect',
      dj1Comment: isSecondDJ ? sheet.dj1Comment : comment,
      dj2Id: isSecondDJ ? myJudgeId : null,
      finalComment: isFinal ? comment : null,
    })
  }

  async function handleDJ2Confirm(sheetId: string, decision: 'checked' | 'incorrect', comment: string) {
    const sheet = sheets.find((s) => s.id === sheetId)
    if (!sheet) return
    const now = new Date().toISOString()
    const newStatus: TsReviewStatus = decision === 'checked' ? 'checked' : 'incorrect'
    const isFinalComment = decision === 'incorrect' ? comment : null

    if (!practiceMode) {
      await supabase.from('ts_review_status')
        .update({
          status: newStatus,
          dj2_id: myJudgeId, dj2_decision: decision,
          dj2_comment: comment || null, dj2_at: now,
          ...(decision === 'incorrect' ? { final_comment: isFinalComment, notified_at: now } : { final_comment: null }),
        })
        .eq('team_id', sheet.teamId).eq('competition_id', sheet.competitionId).eq('routine_type', sheet.routineType as "Balance" | "Dynamic" | "Combined")
    }

    updateSheetReview(sheetId, {
      reviewStatus: newStatus,
      dj2Id: myJudgeId,
      finalComment: isFinalComment,
    })
  }

  async function handleReopen(sheetId: string) {
    const sheet = sheets.find((s) => s.id === sheetId)
    if (!sheet) return

    if (!practiceMode) {
      await supabase.from('ts_review_status')
        .update({
          status: 'pending',
          dj1_id: null, dj1_decision: null, dj1_comment: null, dj1_at: null,
          dj2_id: null, dj2_decision: null, dj2_comment: null, dj2_at: null,
          final_comment: null, notified_at: null,
        })
        .eq('team_id', sheet.teamId).eq('competition_id', sheet.competitionId).eq('routine_type', sheet.routineType as "Balance" | "Dynamic" | "Combined")
    }

    updateSheetReview(sheetId, {
      reviewStatus: 'pending',
      dj1Id: null, dj1Decision: null, dj1Comment: null,
      dj2Id: null, finalComment: null,
    })
  }

  // ── routing helpers ───────────────────────────────────────────────────────

  function routineLabel(rt: string) {
    return { Balance: t.routineBalance, Dynamic: t.routineDynamic, Combined: t.routineCombined }[rt] ?? rt
  }

  function dotColor(sheet: Sheet): string {
    const iAmDJ1 = !sheet.dj1Id || sheet.dj1Id === myJudgeId
    if (sheet.reviewStatus === 'checked')   return 'bg-emerald-500'
    if (sheet.reviewStatus === 'incorrect') return 'bg-red-500'
    if (sheet.reviewStatus === 'new_ts')    return 'bg-blue-400'
    if (sheet.reviewStatus === 'awaiting_dj2' && !iAmDJ1) return 'bg-amber-400 animate-pulse'
    if (sheet.reviewStatus === 'awaiting_dj2' &&  iAmDJ1) return 'bg-amber-300'
    return 'bg-slate-200'
  }

  const modalSheet = modalSheetId ? sheets.find((s) => s.id === modalSheetId) ?? null : null

  return (
    <>
      <div className="px-4 pb-8">
        {/* header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-bold text-slate-800">{t.title}</h1>
          <span className={[
            'text-sm font-medium px-3 py-1 rounded-full',
            reviewedCount === sheets.length && sheets.length > 0
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-slate-100 text-slate-500',
          ].join(' ')}>
            {reviewedCount} {t.of} {sheets.length} {t.sheets}
          </span>
        </div>

        {/* sheet list */}
        <div className="space-y-2">
          {sheets.map((sheet) => {
            const iAmDJ1 = !sheet.dj1Id || sheet.dj1Id === myJudgeId
            const needsMyAction = sheet.reviewStatus === 'awaiting_dj2' && !iAmDJ1
            return (
              <button
                key={sheet.id}
                onClick={() => setModalSheetId(sheet.id)}
                className="w-full flex items-center gap-3 px-4 py-3 border border-slate-200 rounded-2xl bg-white hover:bg-slate-50 transition-colors text-left"
              >
                {/* status dot */}
                <div className={`w-2 h-2 rounded-full shrink-0 ${dotColor(sheet)}`} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-slate-800 truncate">{sheet.gymnasts}</p>
                    {needsMyAction && (
                      <span className="text-xs font-semibold px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                        {lang === 'es' ? 'Tu confirmación' : 'Your confirmation'}
                      </span>
                    )}
                    {sheet.reviewStatus === 'new_ts' && (
                      <span className="text-xs font-semibold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                        {lang === 'es' ? 'Nueva TS' : 'New TS'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    {sheet.ageGroup} · {categoryLabel(sheet.category, lang)} · {routineLabel(sheet.routineType)}
                    {sheet.elements.length > 0 && (
                      <span className="ml-2 text-slate-300">
                        {sheet.elements.length} el · D {sheet.elements.reduce((s, e) => s + e.difficultyValue, 0).toFixed(2)}
                      </span>
                    )}
                  </p>
                </div>

                <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )
          })}
        </div>
      </div>

      {/* full-screen modal */}
      {modalSheet && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          {/* modal header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 shrink-0">
            <button
              onClick={() => setModalSheetId(null)}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              {t.title}
            </button>
            <span className="text-slate-300">|</span>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-semibold text-slate-800 truncate">{modalSheet.gymnasts}</span>
              <span className="text-xs text-slate-400 ml-2">
                {modalSheet.ageGroup} · {categoryLabel(modalSheet.category, lang)} · {routineLabel(modalSheet.routineType)}
              </span>
            </div>
          </div>

          {/* modal body */}
          <div className="flex-1 min-h-0 p-4">
            <SheetPanel
              sheet={modalSheet}
              myJudgeId={myJudgeId}
              lang={lang}
              onAddElement={handleAddElement}
              onDeleteElement={handleDeleteElement}
              onEditElement={handleEditElement}
              onMarkChecked={handleMarkChecked}
              onMarkIncorrect={handleMarkIncorrect}
              onDJ2Confirm={handleDJ2Confirm}
              onReopen={handleReopen}
            />
          </div>
        </div>
      )}
    </>
  )
}
