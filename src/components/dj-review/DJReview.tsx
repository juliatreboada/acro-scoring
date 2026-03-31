'use client'

import { useState } from 'react'
import type { Lang } from '../aj-scoring/types'
import type { Sheet, ReviewElement, ElementType } from './types'

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
    reopen: 'Reopen',
    reviewedBy: 'Reviewed',
    deleteElement: 'Delete',
    balance: 'Balance',
    mount: 'Mount',
    dynamic: 'Dynamic',
    individual: 'Individual',
    motion: 'Motion',
    routineBalance: 'Balance',
    routineDynamic: 'Dynamic',
    routineCombined: 'Combined',
    totalDifficulty: 'Total D',
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
    reopen: 'Reabrir',
    reviewedBy: 'Revisada',
    deleteElement: 'Eliminar',
    balance: 'Balance',
    mount: 'Mount',
    dynamic: 'Dinámico',
    individual: 'Individual',
    motion: 'Motion',
    routineBalance: 'Equilibrio',
    routineDynamic: 'Dinámico',
    routineCombined: 'Combinado',
    totalDifficulty: 'D total',
  },
}

// ─── helpers ──────────────────────────────────────────────────────────────────

// Youth / Junior / Senior / Absoluta categories enter difficulty as integers (÷100)
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
  onAdd: (el: Omit<ReviewElement, 'id' | 'position'>) => void
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

  function handleSubmit() {
    if (!isValid || form.elementType === '') return
    onAdd({
      elementType: form.elementType,
      isStatic: form.isStatic,
      label: form.label.trim(),
      difficultyValue: parseFloat(diffNum.toFixed(2)),
    })
    setForm(EMPTY_FORM)
  }

  return (
    <div className="border border-dashed border-slate-200 rounded-xl p-3 bg-slate-50 space-y-3">
      {/* type selector */}
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

      {/* label + difficulty */}
      <div className="flex gap-2">
        <input
          type="text"
          value={form.label}
          onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder={t.label}
          className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-slate-400 placeholder:text-slate-300 bg-white"
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
            className="w-28 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-slate-400 placeholder:text-slate-300 bg-white text-right tabular-nums"
          />
          {integerMode && form.difficultyValue !== '' && !isNaN(rawNum) && (
            <span className="text-xs text-slate-400 tabular-nums">
              = {diffNum.toFixed(2)}
            </span>
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

// ─── sheet panel ──────────────────────────────────────────────────────────────

function SheetPanel({ sheet, lang, onAddElement, onDeleteElement, onMarkReviewed, onReopen }: {
  sheet: Sheet
  lang: Lang
  onAddElement: (sheetId: string, el: Omit<ReviewElement, 'id' | 'position'>) => void
  onDeleteElement: (sheetId: string, elementId: string) => void
  onMarkReviewed: (sheetId: string) => void
  onReopen: (sheetId: string) => void
}) {
  const t = T[lang]
  const isReviewed = sheet.reviewedAt !== null
  const integerMode = usesIntegerDifficulty(sheet.ageGroup)
  const totalD = sheet.elements.reduce((s, el) => s + el.difficultyValue, 0)

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

      {/* elements panel */}
      <div className="w-[400px] flex flex-col gap-3 min-h-0">
        {/* element list */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 min-h-0">
          {sheet.elements.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">{t.noElements}</p>
          ) : (
            sheet.elements.map((el) => {
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
                  {!isReviewed && (
                    <button
                      onClick={() => onDeleteElement(sheet.id, el.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400 transition-all ml-1 shrink-0"
                      aria-label={t.deleteElement}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
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

        {/* form or reviewed state */}
        {!isReviewed ? (
          <>
            <ElementForm lang={lang} integerMode={integerMode} onAdd={(el) => onAddElement(sheet.id, el)} />
            <button
              onClick={() => onMarkReviewed(sheet.id)}
              className="w-full py-3 rounded-xl text-sm font-medium bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white transition-all shrink-0"
            >
              ✓ {t.markReviewed}
            </button>
          </>
        ) : (
          <div className="flex items-center justify-between px-3 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm text-emerald-700 font-medium">{t.reviewedBy}</span>
            </div>
            <button
              onClick={() => onReopen(sheet.id)}
              className="text-xs text-slate-400 hover:text-slate-600 underline underline-offset-2"
            >
              {t.reopen}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── main component ───────────────────────────────────────────────────────────

type DJReviewProps = {
  initialSheets: Sheet[]
  lang: Lang
}

export default function DJReview({ initialSheets, lang }: DJReviewProps) {
  const t = T[lang]
  const [sheets, setSheets] = useState<Sheet[]>(initialSheets)
  const [modalSheetId, setModalSheetId] = useState<string | null>(null)

  const reviewedCount = sheets.filter((s) => s.reviewedAt !== null).length

  function handleAddElement(sheetId: string, el: Omit<ReviewElement, 'id' | 'position'>) {
    setSheets((prev) => prev.map((s) => {
      if (s.id !== sheetId) return s
      const position = s.elements.length + 1
      return {
        ...s,
        elements: [...s.elements, { ...el, id: `el-${Date.now()}-${Math.random()}`, position }],
      }
    }))
  }

  function handleDeleteElement(sheetId: string, elementId: string) {
    setSheets((prev) => prev.map((s) => {
      if (s.id !== sheetId) return s
      const elements = s.elements
        .filter((el) => el.id !== elementId)
        .map((el, i) => ({ ...el, position: i + 1 }))
      return { ...s, elements }
    }))
  }

  function handleMarkReviewed(sheetId: string) {
    setSheets((prev) => prev.map((s) =>
      s.id === sheetId ? { ...s, reviewedAt: new Date().toISOString() } : s
    ))
  }

  function handleReopen(sheetId: string) {
    setSheets((prev) => prev.map((s) =>
      s.id === sheetId ? { ...s, reviewedAt: null } : s
    ))
  }

  function routineLabel(rt: string) {
    return { Balance: t.routineBalance, Dynamic: t.routineDynamic, Combined: t.routineCombined }[rt] ?? rt
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
            const isReviewed = sheet.reviewedAt !== null

            return (
              <button
                key={sheet.id}
                onClick={() => setModalSheetId(sheet.id)}
                className="w-full flex items-center gap-3 px-4 py-3 border border-slate-200 rounded-2xl bg-white hover:bg-slate-50 transition-colors text-left"
              >
                {/* reviewed indicator */}
                <div className={[
                  'w-2 h-2 rounded-full shrink-0',
                  isReviewed ? 'bg-emerald-500' : 'bg-slate-200',
                ].join(' ')} />

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{sheet.gymnasts}</p>
                  <p className="text-xs text-slate-400">
                    {sheet.ageGroup} · {sheet.category} · {routineLabel(sheet.routineType)}
                    {sheet.elements.length > 0 && (
                      <span className="ml-2 text-slate-300">
                        {sheet.elements.length} el · D {sheet.elements.reduce((s, e) => s + e.difficultyValue, 0).toFixed(2)}
                      </span>
                    )}
                  </p>
                </div>

                <svg
                  className="w-4 h-4 text-slate-400 shrink-0"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
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
                {modalSheet.ageGroup} · {modalSheet.category} · {routineLabel(modalSheet.routineType)}
              </span>
            </div>
          </div>

          {/* modal body */}
          <div className="flex-1 min-h-0 p-4">
            <SheetPanel
              sheet={modalSheet}
              lang={lang}
              onAddElement={handleAddElement}
              onDeleteElement={handleDeleteElement}
              onMarkReviewed={handleMarkReviewed}
              onReopen={handleReopen}
            />
          </div>
        </div>
      )}
    </>
  )
}
