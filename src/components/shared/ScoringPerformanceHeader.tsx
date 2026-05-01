import type { ReactNode } from 'react'
import type { Performance } from '@/components/scoring/types'
import type { Lang } from '@/components/scoring/types'
import { categoryLabel } from '@/components/admin/types'

const ROUTINE: Record<Lang, Record<string, string>> = {
  es: { Balance: 'Balance', Dynamic: 'Dinámico', Combined: 'Combinado' },
  en: { Balance: 'Balance', Dynamic: 'Dynamic', Combined: 'Combined' },
}

export function ScoringPerformanceHeader({ perf, lang, rounded = true, mb = 'mb-4', children }: {
  perf: Performance
  lang: Lang
  rounded?: boolean
  mb?: string
  children?: ReactNode
}) {
  const routineLabel = ROUTINE[lang][perf.routineType] ?? perf.routineType
  return (
    <div className={['bg-slate-800 text-white px-4 py-3', rounded ? 'rounded-xl' : '', mb, 'space-y-0.5'].filter(Boolean).join(' ')}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400 uppercase tracking-wide font-medium">
          #{perf.position} · {perf.ageGroup} · {categoryLabel(perf.category, lang)} · {routineLabel}
        </span>
        {children}
      </div>
      <p className="text-lg font-semibold leading-tight">{perf.gymnasts}</p>
    </div>
  )
}
