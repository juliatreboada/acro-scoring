'use client'

import { useState } from 'react'
import JudgeLobby from '@/components/judge/JudgeLobby'
import AuthBar from '@/components/shared/AuthBar'
import type { Lang } from '@/components/aj-scoring/types'

export default function Page() {
  const [lang, setLang] = useState<Lang>('es')

  return (
    <div className="min-h-screen bg-slate-50">
      <AuthBar lang={lang} onLangChange={setLang} />
      <JudgeLobby lang={lang} />
    </div>
  )
}
