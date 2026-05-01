'use client'

import { useState, useEffect, useRef } from 'react'
import type { Lang, Answers } from '../scoring/types'
import { getSections, getQuestionValues, calcSectionScore, calcTotal } from '../scoring/aj-content'

// ─── translations ─────────────────────────────────────────────────────────────

const T = {
  en: {
    section: 'Section',
    of: 'of',
    next: 'Next section',
    summary: 'Summary',
    total: 'Total',
    submit: 'Submit score',
    submitted: 'Score submitted',
    info: 'More info',
    sectionScore: 'Section score',
    scoreRange: '(range 1.0 – 2.0)',
    totalRange: '(range 5.0 – 10.0)',
  },
  es: {
    section: 'Jornada',
    of: 'de',
    next: 'Siguiente Jornada',
    summary: 'Resumen',
    total: 'Total',
    submit: 'Enviar puntuación',
    submitted: 'Puntuación enviada',
    info: 'Más info',
    sectionScore: 'Puntuación jornada',
    scoreRange: '(rango 1.0 – 2.0)',
    totalRange: '(rango 5.0 – 10.0)',
  },
}

// ─── progress bar ─────────────────────────────────────────────────────────────

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

// ─── question row ─────────────────────────────────────────────────────────────

type QuestionRowProps = {
  text: string
  description: string
  qIndex: number
  sIndex: number
  value: number | undefined
  locked: boolean
  lang: Lang
  onAnswer: (sIndex: number, qIndex: number, value: number) => void
}

function QuestionRow({ text, description, qIndex, sIndex, value, locked, lang, onAnswer }: QuestionRowProps) {
  const [showInfo, setShowInfo] = useState(false)
  const t = T[lang]
  const vals = getQuestionValues(qIndex)

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

// ─── main panel ───────────────────────────────────────────────────────────────

export type AJScoringPanelProps = {
  lang: Lang
  perfId: string | null
  onSubmit: (score: number) => void
}

export default function AJScoringPanel({ lang, perfId, onSubmit }: AJScoringPanelProps) {
  const t = T[lang]
  const sections = getSections(lang)

  const [answers, setAnswers] = useState<Answers>({})
  const [currentSection, setCurrentSection] = useState(0)
  const [showSummary, setShowSummary] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submittedScore, setSubmittedScore] = useState<number | null>(null)
  const [redTapped, setRedTapped] = useState<Set<string>>(new Set())

  const prevPerfId = useRef<string | null>(null)

  useEffect(() => {
    if (perfId !== prevPerfId.current) {
      setAnswers({})
      setRedTapped(new Set())
      setCurrentSection(0)
      setShowSummary(false)
      setSubmitted(false)
      setSubmittedScore(null)
      prevPerfId.current = perfId
    }
  }, [perfId])

  function isAnswered(sIdx: number, qIdx: number): boolean {
    const key = `${sIdx}:${qIdx}`
    return redTapped.has(key) || answers[key] !== undefined
  }

  function isSectionComplete(sIdx: number): boolean {
    return isAnswered(sIdx, 0) && isAnswered(sIdx, 1) && isAnswered(sIdx, 2)
  }

  function handleAnswer(sIdx: number, qIdx: number, value: number) {
    const key = `${sIdx}:${qIdx}`
    if (isAnswered(sIdx, qIdx)) return

    if (value === 0) {
      setRedTapped((prev) => new Set(prev).add(key))
    }
    setAnswers((prev) => ({ ...prev, [key]: value }))

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
    onSubmit(score)
  }

  // ── submitted ──
  if (submitted && submittedScore !== null) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 px-4">
        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
          <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">{t.submitted}</p>
        <p className="text-4xl font-bold text-slate-800 tabular-nums">{submittedScore.toFixed(2)}</p>
      </div>
    )
  }

  // ── summary ──
  if (showSummary) {
    const total = calcTotal(answers)
    return (
      <div className="px-4 pb-6">
        <h2 className="text-base font-bold text-slate-800 mb-3">{t.summary}</h2>
        <div className="space-y-2 mb-4">
          {sections.map((sec, i) => {
            const score = calcSectionScore(answers, i)
            return (
              <div key={i} className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
                <span className="text-sm font-medium text-slate-700">{sec.name}</span>
                <span className="text-sm font-bold text-slate-800 tabular-nums">{score.toFixed(2)}</span>
              </div>
            )
          })}
        </div>
        <div className="flex items-center justify-between bg-slate-800 text-white rounded-xl px-4 py-3 mb-4">
          <span className="font-bold">{t.total}</span>
          <span className="font-bold text-2xl tabular-nums">{total.toFixed(2)}</span>
        </div>
        <button
          onClick={handleSubmit}
          className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold py-3 rounded-xl transition-all duration-150"
        >
          {t.submit} · {total.toFixed(2)}
        </button>
      </div>
    )
  }

  // ── scoring ──
  const sec = sections[currentSection]
  const sectionScore = calcSectionScore(answers, currentSection)
  const sectionComplete = isSectionComplete(currentSection)

  return (
    <div className="px-4 pb-6">
      <ProgressBar
        totalSections={sections.length}
        currentSection={currentSection}
        answers={answers}
        onDotClick={setCurrentSection}
      />

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-slate-800">{sec.name}</h2>
        <span className="text-xs text-slate-400">
          {t.section} {currentSection + 1} {t.of} {sections.length}
        </span>
      </div>

      <div className="space-y-4 mb-4">
        {sec.questions.map((q, qi) => (
          <QuestionRow
            key={qi}
            sIndex={currentSection}
            qIndex={qi}
            text={q.text}
            description={q.description}
            value={answers[`${currentSection}:${qi}`]}
            locked={isAnswered(currentSection, qi)}
            lang={lang}
            onAnswer={handleAnswer}
          />
        ))}
      </div>

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
