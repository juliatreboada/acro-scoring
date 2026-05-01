'use client'

import type { ReactNode } from 'react'
import AuthBar from './AuthBar'
import type { Lang } from '../scoring/types'

export function JudgeScoringShell({
  loading, sessionId, lang, onLangChange, children, className, submitError, onClearError,
}: {
  loading: boolean
  sessionId: string | null
  lang: Lang
  onLangChange: (l: Lang) => void
  children: ReactNode
  className?: string
  submitError?: string | null
  onClearError?: () => void
}) {
  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
    </div>
  )

  if (!sessionId) return (
    <div className="min-h-screen bg-slate-50">
      <AuthBar />
      <div className="flex flex-col items-center justify-center h-[calc(100vh-48px)] gap-3 px-4">
        <p className="text-xl font-semibold text-slate-600">No active session</p>
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
      {children}
    </div>
  )
}
