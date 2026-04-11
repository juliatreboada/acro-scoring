'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import CompetitionsView from '@/components/admin/CompetitionsView'
import AuthBar from '@/components/shared/AuthBar'
import ProfileEditor from '@/components/shared/ProfileEditor'
import type { Lang } from '@/components/aj-scoring/types'
import type { Competition } from '@/components/admin/types'
import { useProfile } from '@/contexts/ProfileContext'

// ─── page ─────────────────────────────────────────────────────────────────────

export default function Page() {
  const [lang, setLang]             = useState<Lang>('es')
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [loading, setLoading]       = useState(true)
  const [view, setView]             = useState<'competitions' | 'profile'>('competitions')
  const router   = useRouter()
  const supabase = createClient()
  const { activeProfile } = useProfile()

  const TAB_LABELS = {
    en: { competitions: 'Competitions', profile: 'Profile' },
    es: { competitions: 'Competiciones', profile: 'Perfil' },
  }

  useEffect(() => {
    async function load() {
      if (!activeProfile) return
      const { data } = await supabase
        .from('competitions')
        .select('id,name,status,location,start_date,end_date,registration_deadline,ts_music_deadline,age_groups,poster_url,admin_id,created_at')
        .eq('admin_id', activeProfile.id)
        .order('created_at', { ascending: false })

      const mapped: Competition[] = (data ?? []).map(({ admin_id: _, ...c }) => ({
        ...c,
        admin: null, // comp_admin sees their own competitions — admin field not needed here
      }))

      setCompetitions(mapped)
      setLoading(false)
    }
    load()
  }, [activeProfile?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const tabs = TAB_LABELS[lang]

  return (
    <div className="min-h-screen bg-slate-50">
      <AuthBar lang={lang} onLangChange={setLang} />

      {/* tab bar */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 flex">
          {(['competitions', 'profile'] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={[
                'px-4 py-2.5 text-sm font-semibold border-b-2 transition-all',
                view === v ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600',
              ].join(' ')}>
              {v === 'competitions' ? tabs.competitions : tabs.profile}
            </button>
          ))}
        </div>
      </div>

      {view === 'profile' && (
        <div className="max-w-4xl mx-auto px-4 py-6">
          <ProfileEditor lang={lang} />
        </div>
      )}

      {view === 'competitions' && (
        loading ? (
          <div className="flex justify-center py-24">
            <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
          </div>
        ) : (
          <CompetitionsView
            lang={lang}
            ageGroupRules={[]}
            availableAdmins={[]}
            competitions={competitions}
            canCreate={false}
            onCreate={() => {}}
            onManage={(id) => router.push(`/comp-admin/competitions/${id}`)}
          />
        )
      )}
    </div>
  )
}
