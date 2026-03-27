'use client'

import { useState } from 'react'
import JudgeLobby from '@/components/judge/JudgeLobby'
import AuthBar from '@/components/shared/AuthBar'
import type { Lang } from '@/components/aj-scoring/types'

export default function Page() {
  const [lang, setLang] = useState<Lang>('es')

  return (
    <div className="min-h-screen bg-slate-50">
      <AuthBar />
      <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center gap-4 sticky top-0 z-10">
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          {(['en', 'es'] as Lang[]).map((l) => (
            <button key={l} onClick={() => setLang(l)}
              className={['px-3 py-1 rounded-md text-sm font-medium transition-all',
                lang === l ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'].join(' ')}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <JudgeLobby lang={lang} />
    </div>
  )
}
