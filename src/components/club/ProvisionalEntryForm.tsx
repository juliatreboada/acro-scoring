'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import type { Lang } from '@/components/scoring/types'
import type { Competition, AgeGroupRule } from '@/components/admin/types'
import { categoriesForRuleset, categoryLabel } from '@/components/admin/types'

const T = {
  en: {
    title: 'Provisional Entry',
    clubLabel: 'Club',
    instructions: 'Indicate how many teams you expect to bring for each category.',
    zeroHint: 'Leave at 0 for categories you will not participate in.',
    save: 'Save',
    saving: 'Saving…',
    saved: 'Saved',
    close: 'Close',
    error: 'Failed to save. Please try again.',
  },
  es: {
    title: 'Inscripción provisional',
    clubLabel: 'Club',
    instructions: 'Indica cuántos equipos prevés presentar por categoría.',
    zeroHint: 'Deja en 0 las categorías en las que no participarás.',
    save: 'Guardar',
    saving: 'Guardando…',
    saved: 'Guardado',
    close: 'Cerrar',
    error: 'Error al guardar. Inténtalo de nuevo.',
  },
}

type Props = {
  lang: Lang
  competition: Competition
  clubId: string
  clubName: string
  ageGroupRules: AgeGroupRule[]
  onClose: () => void
}

export default function ProvisionalEntryForm({ lang, competition, clubId, clubName, ageGroupRules, onClose }: Props) {
  const t = T[lang]
  const supabase = createClient()

  const [counts, setCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const competitionRules = ageGroupRules.filter(r => competition.age_groups.includes(r.id))

  useEffect(() => {
    async function load() {
      const { data } = await (supabase as any)
        .from('provisional_entries')
        .select('teams_per_category')
        .eq('competition_id', competition.id)
        .eq('club_id', clubId)
        .maybeSingle()
      if (data) setCounts((data.teams_per_category as Record<string, number>) ?? {})
      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function setCount(key: string, delta: number) {
    setCounts(prev => ({ ...prev, [key]: Math.max(0, (prev[key] ?? 0) + delta) }))
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true); setError(null); setSaved(false)
    try {
      const { error: err } = await (supabase as any)
        .from('provisional_entries')
        .upsert(
          { competition_id: competition.id, club_id: clubId, teams_per_category: counts },
          { onConflict: 'competition_id,club_id' },
        )
      if (err) throw err
      setSaved(true)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
        {/* header */}
        <div className="flex items-start gap-3 px-5 py-4 border-b border-slate-100">
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-slate-800">{t.title}</p>
            <p className="text-xs text-slate-400 truncate mt-0.5">{competition.name}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors shrink-0 mt-0.5">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* body */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-400">{t.clubLabel}:</span>
            <span className="text-sm font-semibold text-slate-700">{clubName}</span>
          </div>
          <p className="text-xs text-slate-500">{t.instructions} {t.zeroHint}</p>

          {competitionRules.map(rule => {
            const categories = categoriesForRuleset(rule.age_group)
            return (
              <div key={rule.id}>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
                  {rule.age_group}
                </p>
                <div className="space-y-1.5">
                  {categories.map(cat => {
                    const key = `${rule.id}|${cat}`
                    const count = counts[key] ?? 0
                    return (
                      <div key={key} className="flex items-center justify-between gap-3 py-2 px-3 rounded-xl bg-slate-50">
                        <span className="text-sm text-slate-700">{categoryLabel(cat, lang)}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setCount(key, -1)}
                            disabled={count === 0}
                            className="w-7 h-7 rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 disabled:opacity-30 flex items-center justify-center text-lg leading-none transition-all">
                            −
                          </button>
                          <span className="w-6 text-center text-sm font-bold text-slate-800 tabular-nums">{count}</span>
                          <button
                            onClick={() => setCount(key, +1)}
                            className="w-7 h-7 rounded-full border border-violet-200 bg-violet-50 text-violet-600 hover:bg-violet-100 flex items-center justify-center text-lg leading-none transition-all">
                            +
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* footer */}
        <div className="px-5 py-4 border-t border-slate-100 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            {error && <p className="text-xs text-red-600">{t.error}</p>}
            {saved && !error && <p className="text-xs text-green-600">{t.saved} ✓</p>}
          </div>
          <button onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-100 transition-all shrink-0">
            {t.close}
          </button>
          <button onClick={handleSave} disabled={saving}
            className="px-5 py-2 rounded-xl text-sm font-semibold bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50 transition-all shrink-0">
            {saving ? t.saving : t.save}
          </button>
        </div>
      </div>
    </div>
  )
}
