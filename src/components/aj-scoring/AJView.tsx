'use client'

import { useState, useEffect, useRef } from 'react'
import type { Answers, Lang, Performance } from './types'
import { getSections, getQuestionValues, calcSectionScore, calcTotal } from './aj-content'
import type { PanelJudge, JudgeScore, RoutineResult } from '../cjp/types'
import ScoreBoard from '../shared/ScoreBoard'

// ─── translations ────────────────────────────────────────────────────────────

const T = {
  en: {
    waiting: 'Waiting for performance…',
    waitingSub: 'The panel chief has not opened a routine yet.',
    section: 'Section',
    of: 'of',
    next: 'Next section',
    summary: 'Summary',
    total: 'Total',
    submit: 'Submit score',
    submitted: 'Score submitted',
    waitingOtherScores: 'Waiting for your other scores…',
    balance: 'Balance',
    dynamic: 'Dynamic',
    combined: 'Combined',
    info: 'More info',
    close: 'Close',
    sectionScore: 'Section score',
    scoreRange: '(range 1.0 – 2.0)',
    totalRange: '(range 5.0 – 10.0)',
  },
  es: {
    waiting: 'Esperando actuación…',
    waitingSub: 'El juez coordinador no ha abierto ninguna rutina todavía.',
    section: 'Jornada',
    of: 'de',
    next: 'Siguiente jornada',
    summary: 'Resumen',
    total: 'Total',
    submit: 'Enviar puntuación',
    submitted: 'Puntuación enviada',
    waitingOtherScores: 'Esperando tus otras puntuaciones…',
    balance: 'Equilibrio',
    dynamic: 'Dinámico',
    combined: 'Combinado',
    info: 'Más info',
    close: 'Cerrar',
    sectionScore: 'Puntuación jornada',
    scoreRange: '(rango 1.0 – 2.0)',
    totalRange: '(rango 5.0 – 10.0)',
  },
}

// ─── sub-components ──────────────────────────────────────────────────────────

function PerformanceHeader({ perf, lang }: { perf: Performance; lang: Lang }) {
  const t = T[lang]
  const routineLabel = {
    Balance: t.balance,
    Dynamic: t.dynamic,
    Combined: t.combined,
  }[perf.routineType] ?? perf.routineType

  return (
    <div className="bg-slate-800 text-white px-4 py-3 rounded-xl mb-4 space-y-0.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400 uppercase tracking-wide font-medium">
          #{perf.position} · {perf.ageGroup} · {perf.category} · {routineLabel}
        </span>
      </div>
      <p className="text-lg font-semibold leading-tight">{perf.gymnasts}</p>
    </div>
  )
}

function ProgressBar({
  totalSections,
  currentSection,
  answers,
  onDotClick,
}: {
  totalSections: number
  currentSection: number
  answers: Answers
  onDotClick: (i: number) => void
}) {
  function sectionState(i: number): 'complete' | 'active' | 'pending' {
    const allAnswered =
      answers[`${i}:0`] !== undefined &&
      answers[`${i}:1`] !== undefined &&
      answers[`${i}:2`] !== undefined
    if (allAnswered) return 'complete'
    if (i === currentSection) return 'active'
    return 'pending'
  }

  return (
    <div className="flex items-center gap-2 mb-6">
      {Array.from({ length: totalSections }).map((_, i) => {
        const state = sectionState(i)
        return (
          <button
            key={i}
            onClick={() => onDotClick(i)}
            className={[
              'flex-1 h-2 rounded-full transition-all duration-300',
              state === 'complete' ? 'bg-emerald-500' : '',
              state === 'active' ? 'bg-blue-500' : '',
              state === 'pending' ? 'bg-slate-200' : '',
            ].join(' ')}
            aria-label={`Section ${i + 1}`}
          />
        )
      })}
    </div>
  )
}

type QuestionRowProps = {
  text: string
  description: string
  qIndex: number
  sIndex: number
  value: number | undefined
  locked: boolean
  visible: boolean
  lang: Lang
  onAnswer: (sIndex: number, qIndex: number, value: number) => void
}

function QuestionRow({
  text,
  description,
  qIndex,
  sIndex,
  value,
  locked,
  visible,
  lang,
  onAnswer,
}: QuestionRowProps) {
  const [showInfo, setShowInfo] = useState(false)
  const t = T[lang]
  const vals = getQuestionValues(qIndex)

  if (!visible) return null

  const buttons: { label: string; color: string; activeColor: string; val: number }[] = [
    {
      label: '●',
      color: 'bg-red-100 text-red-500 border border-red-200',
      activeColor: 'bg-red-500 text-white border border-red-500',
      val: vals.red,
    },
    {
      label: '●',
      color: 'bg-amber-100 text-amber-500 border border-amber-200',
      activeColor: 'bg-amber-400 text-white border border-amber-400',
      val: vals.yellow,
    },
    {
      label: '●',
      color: 'bg-emerald-100 text-emerald-600 border border-emerald-200',
      activeColor: 'bg-emerald-500 text-white border border-emerald-500',
      val: vals.green,
    },
  ]

  return (
    <div className="mb-4 last:mb-0">
      <div className="flex items-start gap-2 mb-2">
        <span className="text-sm font-medium text-slate-700 flex-1 leading-snug">{text}</span>
        <button
          onClick={() => setShowInfo((v) => !v)}
          className="text-slate-400 hover:text-slate-600 transition-colors shrink-0 mt-0.5"
          aria-label={t.info}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {showInfo && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 mb-2 text-xs text-slate-600 leading-snug">
          {description}
        </div>
      )}

      <div className="flex gap-2">
        {buttons.map((btn, bi) => {
          const isSelected = value === btn.val
          // red always has value 0 — special handling: only show selected if this button was explicitly chosen
          // We track by checking if the answer key exists and value matches
          return (
            <button
              key={bi}
              disabled={locked}
              onClick={() => !locked && onAnswer(sIndex, qIndex, btn.val)}
              className={[
                'flex-1 py-3 rounded-xl text-xl font-bold transition-all duration-150 active:scale-95',
                locked && isSelected ? btn.activeColor + ' opacity-100' : '',
                locked && !isSelected ? btn.color + ' opacity-30 cursor-not-allowed' : '',
                !locked ? btn.color + ' hover:opacity-80 cursor-pointer' : '',
              ].join(' ')}
            >
              {btn.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── main component ───────────────────────────────────────────────────────────

type AJViewProps = {
  currentPerf: Performance | null
  lang: Lang
  onSubmit?: (score: number) => void
  // scoreboard props (multi-role)
  waitingForOtherScores?: boolean
  judgeScores?: JudgeScore[]
  panelJudges?: PanelJudge[]
  result?: RoutineResult | null
}

export default function AJView({ currentPerf, lang, onSubmit, waitingForOtherScores, judgeScores, panelJudges, result }: AJViewProps) {
  const t = T[lang]
  const sections = getSections(lang)

  const [answers, setAnswers] = useState<Answers>({})
  const [currentSection, setCurrentSection] = useState(0)
  const [showSummary, setShowSummary] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submittedScore, setSubmittedScore] = useState<number | null>(null)
  // track which "red" buttons were explicitly tapped (since value is 0, same as unanswered)
  const [redTapped, setRedTapped] = useState<Set<string>>(new Set())

  const prevPerfId = useRef<string | null>(null)

  // reset state when performance changes
  useEffect(() => {
    if (currentPerf?.id !== prevPerfId.current) {
      setAnswers({})
      setRedTapped(new Set())
      setCurrentSection(0)
      setShowSummary(false)
      setSubmitted(false)
      setSubmittedScore(null)
      prevPerfId.current = currentPerf?.id ?? null
    }
  }, [currentPerf?.id])

  function isAnswered(sIdx: number, qIdx: number): boolean {
    const key = `${sIdx}:${qIdx}`
    return redTapped.has(key) || answers[key] !== undefined
  }

  function isSectionComplete(sIdx: number): boolean {
    return isAnswered(sIdx, 0) && isAnswered(sIdx, 1) && isAnswered(sIdx, 2)
  }

  function allComplete(): boolean {
    return Array.from({ length: 5 }, (_, i) => i).every(isSectionComplete)
  }

  function handleAnswer(sIdx: number, qIdx: number, value: number) {
    const key = `${sIdx}:${qIdx}`
    if (isAnswered(sIdx, qIdx)) return // locked

    if (value === 0) {
      setRedTapped((prev) => new Set(prev).add(key))
    }
    setAnswers((prev) => ({ ...prev, [key]: value }))

    // check if section is now complete
    const newAnswers = { ...answers, [key]: value }
    const newRedTapped = value === 0 ? new Set([...redTapped, key]) : redTapped

    const sectionDone =
      (newRedTapped.has(`${sIdx}:0`) || newAnswers[`${sIdx}:0`] !== undefined) &&
      (newRedTapped.has(`${sIdx}:1`) || newAnswers[`${sIdx}:1`] !== undefined) &&
      (newRedTapped.has(`${sIdx}:2`) || newAnswers[`${sIdx}:2`] !== undefined)

    if (sectionDone) {
      const allDone = Array.from({ length: 5 }, (_, i) => i).every((si) => {
        if (si === sIdx) return true
        return (
          (newRedTapped.has(`${si}:0`) || newAnswers[`${si}:0`] !== undefined) &&
          (newRedTapped.has(`${si}:1`) || newAnswers[`${si}:1`] !== undefined) &&
          (newRedTapped.has(`${si}:2`) || newAnswers[`${si}:2`] !== undefined)
        )
      })

      if (allDone) {
        setTimeout(() => setShowSummary(true), 300)
      } else if (currentSection === sIdx && sIdx < 4) {
        setTimeout(() => setCurrentSection(sIdx + 1), 300)
      }
    }
  }

  function handleSubmit() {
    const score = calcTotal(answers)
    setSubmittedScore(score)
    setSubmitted(true)
    onSubmit?.(score)
  }

  // ── waiting state ──
  if (!currentPerf) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6 gap-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
          </svg>
        </div>
        <p className="text-xl font-semibold text-slate-700">{t.waiting}</p>
        <p className="text-sm text-slate-400">{t.waitingSub}</p>
      </div>
    )
  }

  // ── submitted state ──
  if (submitted && submittedScore !== null) {
    return (
      <div className="overflow-y-auto px-4 py-8 space-y-6 max-w-lg mx-auto">
        {/* confirmation */}
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-slate-500 font-medium uppercase tracking-wide text-sm">{t.submitted}</p>
          <p className="text-6xl font-bold text-slate-800">{submittedScore.toFixed(2)}</p>
        </div>

        {/* waiting for other roles */}
        {waitingForOtherScores && (
          <div className="flex items-center justify-center gap-2 text-slate-400">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 9a9 9 0 0114.65-3.65L20 7M4 17l1.35 1.65A9 9 0 0020 15" />
            </svg>
            <p className="text-sm">{t.waitingOtherScores}</p>
          </div>
        )}

        {/* panel scoreboard */}
        {!waitingForOtherScores && judgeScores && panelJudges && (
          <ScoreBoard judgeScores={judgeScores} panelJudges={panelJudges} result={result} lang={lang} />
        )}
      </div>
    )
  }

  // ── summary state ──
  if (showSummary) {
    const total = calcTotal(answers)
    return (
      <div className="px-4 pb-8">
        <PerformanceHeader perf={currentPerf} lang={lang} />
        <h2 className="text-lg font-bold text-slate-800 mb-4">{t.summary}</h2>
        <div className="space-y-2 mb-6">
          {sections.map((sec, i) => {
            const score = calcSectionScore(answers, i)
            return (
              <div key={i} className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
                <span className="font-medium text-slate-700">{sec.name}</span>
                <span className="font-bold text-slate-800 tabular-nums">{score.toFixed(2)}</span>
              </div>
            )
          })}
        </div>
        <div className="flex items-center justify-between bg-slate-800 text-white rounded-xl px-4 py-4 mb-6">
          <span className="font-bold text-lg">{t.total}</span>
          <span className="font-bold text-3xl tabular-nums">{total.toFixed(2)}</span>
        </div>
        <button
          onClick={handleSubmit}
          className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold text-lg py-4 rounded-2xl transition-all duration-150"
        >
          {t.submit} · {total.toFixed(2)}
        </button>
      </div>
    )
  }

  // ── scoring state ──
  const sec = sections[currentSection]
  const sectionScore = calcSectionScore(answers, currentSection)
  const sectionComplete = isSectionComplete(currentSection)

  return (
    <div className="px-4 pb-8">
      <PerformanceHeader perf={currentPerf} lang={lang} />

      <ProgressBar
        totalSections={sections.length}
        currentSection={currentSection}
        answers={answers}
        onDotClick={setCurrentSection}
      />

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-800">{sec.name}</h2>
        <span className="text-sm text-slate-400">
          {t.section} {currentSection + 1} {t.of} {sections.length}
        </span>
      </div>

      <div className="space-y-4 mb-6">
        {sec.questions.map((q, qi) => (
          <QuestionRow
            key={qi}
            sIndex={currentSection}
            qIndex={qi}
            text={q.text}
            description={q.description}
            value={answers[`${currentSection}:${qi}`]}
            locked={isAnswered(currentSection, qi)}
            visible={true}
            lang={lang}
            onAnswer={handleAnswer}
          />
        ))}
      </div>

      {/* footer: section scores */}
      <div className="border-t border-slate-100 pt-3 space-y-1">
        <div className="flex justify-between text-xs text-slate-400">
          <span>{t.sectionScore} {t.scoreRange}</span>
          <span className="font-semibold text-slate-600 tabular-nums">
            {sectionComplete ? sectionScore.toFixed(2) : '—'}
          </span>
        </div>
        <div className="flex justify-between text-xs text-slate-400">
          <span>{t.total} {t.totalRange}</span>
          <span className="font-semibold text-slate-600 tabular-nums">
            {calcTotal(answers) > 0 ? calcTotal(answers).toFixed(2) : '—'}
          </span>
        </div>
      </div>

      {/* manual next button (fallback) */}
      {sectionComplete && currentSection < sections.length - 1 && (
        <button
          onClick={() => setCurrentSection(currentSection + 1)}
          className="mt-4 w-full border border-slate-200 text-slate-600 font-medium py-3 rounded-xl hover:bg-slate-50 active:scale-95 transition-all"
        >
          {t.next} →
        </button>
      )}
    </div>
  )
}
