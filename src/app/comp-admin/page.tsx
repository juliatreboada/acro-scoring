'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import CompetitionsView from '@/components/admin/CompetitionsView'
import AuthBar from '@/components/shared/AuthBar'
import type { Lang } from '@/components/aj-scoring/types'
import type { Competition } from '@/components/admin/types'

// ─── page ─────────────────────────────────────────────────────────────────────

export default function Page() {
  const [lang, setLang]             = useState<Lang>('es')
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [loading, setLoading]       = useState(true)
  const router   = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data } = await supabase
        .from('competitions')
        .select('id,name,status,location,start_date,end_date,registration_deadline,age_groups,poster_url,admin_id,created_at')
        .eq('admin_id', user.id)
        .order('created_at', { ascending: false })

      const mapped: Competition[] = (data ?? []).map(({ admin_id: _, ...c }) => ({
        ...c,
        admin: null, // comp_admin sees their own competitions — admin field not needed here
      }))

      setCompetitions(mapped)
      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-slate-50">
      <AuthBar lang={lang} onLangChange={setLang} />

      {loading ? (
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
      )}
    </div>
  )
}
