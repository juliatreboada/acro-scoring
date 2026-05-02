'use client'

import AuthBar from '@/components/shared/AuthBar'
import type { Lang } from '@/components/scoring/types'

export function CompetitionPageSkeleton({ lang, onLangChange }: {
  lang: Lang
  onLangChange: (lang: Lang) => void
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <AuthBar lang={lang} onLangChange={onLangChange} />
      <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center gap-4 sticky top-0 z-10">
        <div className="h-4 w-16 bg-slate-100 rounded animate-pulse" />
        <div className="h-4 w-px bg-slate-200" />
        <div className="h-4 w-48 bg-slate-100 rounded animate-pulse" />
      </div>
      <div className="bg-white border-b border-slate-200 px-4">
        <div className="max-w-5xl mx-auto flex gap-1 py-1">
          {[80, 64, 72, 88, 56, 76, 60].map((w, i) => (
            <div key={i} className="h-8 bg-slate-100 rounded-lg animate-pulse" style={{ width: w }} />
          ))}
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
          <div className="h-5 w-40 bg-slate-100 rounded animate-pulse" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="space-y-1.5">
                <div className="h-3 w-20 bg-slate-100 rounded animate-pulse" />
                <div className="h-9 bg-slate-50 border border-slate-100 rounded-xl animate-pulse" />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-3">
          <div className="h-5 w-32 bg-slate-100 rounded animate-pulse" />
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3 py-2">
              <div className="w-9 h-9 rounded-full bg-slate-100 animate-pulse shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-36 bg-slate-100 rounded animate-pulse" />
                <div className="h-3 w-24 bg-slate-100 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
