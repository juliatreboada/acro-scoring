'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { Lang } from '@/components/aj-scoring/types'
import type { Database } from '@/lib/database.types'

type Competition = Pick<
  Database['public']['Tables']['competitions']['Row'],
  'id' | 'name' | 'status' | 'location' | 'start_date' | 'end_date'
>

// ─── translations ─────────────────────────────────────────────────────────────

const T = {
  en: {
    title: 'Results',
    subtitle: 'Select a competition to view its results.',
    live: 'Live',
    finished: 'Finished',
    noCompetitions: 'No results available yet.',
  },
  es: {
    title: 'Resultados',
    subtitle: 'Selecciona una competición para ver sus resultados.',
    live: 'En vivo',
    finished: 'Finalizada',
    noCompetitions: 'Aún no hay resultados disponibles.',
  },
}

const STATUS_BADGE: Partial<Record<Competition['status'], string>> = {
  active:   'bg-blue-600 text-white',
  finished: 'bg-slate-100 text-slate-500',
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatDateRange(start: string | null, end: string | null): string {
  const fmt = (d: string) =>
    new Date(d + 'T00:00:00').toLocaleDateString(undefined, {
      day: 'numeric', month: 'short', year: 'numeric',
    })
  if (start && end && start !== end) return `${fmt(start)} – ${fmt(end)}`
  if (start) return fmt(start)
  if (end) return fmt(end)
  return ''
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function Page() {
  const [lang, setLang]       = useState<Lang>('en')
  const [comps, setComps]     = useState<Competition[]>([])
  const [loading, setLoading] = useState(true)
  const router   = useRouter()
  const supabase = createClient()
  const t = T[lang]

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('competitions')
        .select('id, name, status, location, start_date, end_date')
        .in('status', ['active', 'finished'])
        .order('start_date', { ascending: false })
      setComps(data ?? [])
      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const visible = comps

  return (
    <div className="min-h-screen bg-slate-50">
      {/* dev toolbar */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center gap-4 sticky top-0 z-10">
        <span className="text-xs font-mono text-slate-400 uppercase tracking-wide">Results · dev</span>
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          {(['en', 'es'] as Lang[]).map((l) => (
            <button key={l} onClick={() => setLang(l)}
              className={['px-3 py-1 rounded-md text-sm font-medium transition-all', lang === l ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'].join(' ')}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">{t.title}</h1>
        <p className="text-sm text-slate-400 mb-8">{t.subtitle}</p>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
          </div>
        ) : visible.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-16">{t.noCompetitions}</p>
        ) : (
          <div className="space-y-3">
            {visible.map((comp) => {
              const dateStr = formatDateRange(comp.start_date, comp.end_date)
              const badgeCls = STATUS_BADGE[comp.status] ?? ''
              const statusLabel = comp.status === 'active' ? t.live : t.finished

              return (
                <button
                  key={comp.id}
                  onClick={() => router.push(`/results/${comp.id}`)}
                  className="w-full text-left bg-white border border-slate-200 rounded-2xl px-5 py-4 hover:border-blue-300 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className={['px-2 py-0.5 rounded-md text-xs font-semibold flex items-center gap-1', badgeCls].join(' ')}>
                          {comp.status === 'active' && (
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shrink-0" />
                          )}
                          {statusLabel}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                        {comp.name}
                      </p>
                      <div className="flex flex-wrap gap-x-3 mt-1.5">
                        {comp.location && (
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                            </svg>
                            {comp.location}
                          </span>
                        )}
                        {dateStr && (
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
                            </svg>
                            {dateStr}
                          </span>
                        )}
                      </div>
                    </div>
                    <svg className="w-4 h-4 text-slate-300 group-hover:text-blue-400 shrink-0 mt-1 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
