'use client'

import type { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import AuthBar from './AuthBar'
import type { Lang } from '../scoring/types'

export function JudgeScoringShell({
  loading, sessionId, lang, onLangChange, children, className, submitError, onClearError, practiceMode, onStartPractice, onStopPractice, canControlPractice,
}: {
  loading: boolean
  sessionId: string | null
  lang: Lang
  onLangChange: (l: Lang) => void
  children: ReactNode
  className?: string
  submitError?: string | null
  onClearError?: () => void
  practiceMode?: boolean
  onStartPractice?: () => void
  onStopPractice?: () => void
  canControlPractice?: boolean
}) {
  const router = useRouter()

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
    </div>
  )

  if (!sessionId) return (
    <div className="min-h-screen bg-slate-50">
      <AuthBar lang={lang} onLangChange={onLangChange} />
      <div className="flex flex-col items-center justify-center h-[calc(100vh-48px)] gap-3 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
          </svg>
        </div>
        <p className="text-xl font-semibold text-slate-600">
          {lang === 'en' ? 'No active session' : 'Sin sesión activa'}
        </p>
        <p className="text-sm text-slate-400">
          {lang === 'en' ? 'Contact your competition administrator.' : 'Contacta con el administrador de la competición.'}
        </p>
      </div>
    </div>
  )

  return (
    <div className={className ?? 'min-h-[100dvh] flex flex-col md:h-[100dvh] md:overflow-hidden bg-slate-100'}>
      <AuthBar lang={lang} onLangChange={onLangChange} />
      {submitError && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2.5 flex items-center gap-3">
          <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <span className="text-sm text-red-700 flex-1">{submitError}</span>
          {onClearError && (
            <button onClick={onClearError} className="text-red-400 hover:text-red-600 text-lg leading-none shrink-0">×</button>
          )}
        </div>
      )}
      {practiceMode && (
        <div className="bg-violet-50 border-b border-violet-200 px-4 py-2 flex items-center justify-between gap-3">
          <span className="text-sm text-violet-700">
            {lang === 'en'
              ? 'Practice mode active: this rehearsal does not save scores to official results.'
              : 'Modo práctica activo: este ensayo no guarda puntuaciones en resultados oficiales.'}
          </span>
          {!canControlPractice && (
            <button
              onClick={() => router.push('/judge')}
              className="flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-800 shrink-0"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              {lang === 'en' ? 'Back' : 'Volver'}
            </button>
          )}
        </div>
      )}
      {canControlPractice && (
        <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
          <span className="text-sm text-slate-600">
            {lang === 'en' ? 'Section rehearsal' : 'Ensayo de sección'}
          </span>
          {practiceMode ? (
            <button
              onClick={onStopPractice}
              className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-slate-700 text-white hover:bg-slate-800"
            >
              {lang === 'en' ? 'Finish rehearsal' : 'Finalizar ensayo'}
            </button>
          ) : (
            <button
              onClick={onStartPractice}
              className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-violet-600 text-white hover:bg-violet-700"
            >
              {lang === 'en' ? 'Start rehearsal' : 'Iniciar ensayo'}
            </button>
          )}
        </div>
      )}
      {children}
    </div>
  )
}
