'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import CompetitionsView from '@/components/admin/CompetitionsView'
import AuthBar from '@/components/shared/AuthBar'
import type { Lang } from '@/components/aj-scoring/types'
import type { Competition, AgeGroupRule, AdminUser } from '@/components/admin/types'

const T_USERS = { en: 'Users', es: 'Usuarios' }

// ─── page ─────────────────────────────────────────────────────────────────────

export default function Page() {
  const [lang, setLang]               = useState<Lang>('es')
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [ageGroupRules, setAgeGroupRules] = useState<AgeGroupRule[]>([])
  const [availableAdmins, setAvailableAdmins] = useState<AdminUser[]>([])
  const [loading, setLoading]         = useState(true)
  const router   = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      // ── parallel: age_group_rules + competitions + comp_admin profiles ─────
      const [rulesRes, compsRes, adminsRes] = await Promise.all([
        supabase.from('age_group_rules').select('id, age_group, ruleset, min_age, max_age, sort_order').order('sort_order'),
        supabase.from('competitions')
          .select('id, name, status, location, start_date, end_date, registration_deadline, age_groups, poster_url, admin_id, created_at')
          .order('created_at', { ascending: false }),
        supabase.from('profiles')
          .select('id, email')
          .eq('role', 'admin'),
      ])

      // ── fetch emails for comp_admin users via API route ─────────────────────
      const adminProfiles = adminsRes.data ?? []
      let adminsWithEmail: AdminUser[] = []
      if (adminProfiles.length > 0) {
        const res = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: adminProfiles.map((p) => p.id) }),
        })
        if (res.ok) {
          adminsWithEmail = await res.json()
        } else {
          // fallback: no email
          adminsWithEmail = adminProfiles.map((p) => ({ id: p.id, full_name: '', email: p.email ?? '' }))
        }
      }

      // ── merge admin info into competitions ─────────────────────────────────
      const adminMap = Object.fromEntries(adminsWithEmail.map((a) => [a.id, a]))
      const rawComps = compsRes.data ?? []
      const mapped: Competition[] = rawComps.map(({ admin_id, ...c }) => ({
        ...c,
        admin: admin_id ? (adminMap[admin_id] ?? null) : null,
      }))

      setAgeGroupRules((rulesRes.data ?? []) as unknown as AgeGroupRule[])
      setAvailableAdmins(adminsWithEmail)
      setCompetitions(mapped)
      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleCreate(data: Omit<Competition, 'id' | 'created_at'>) {
    const { data: created, error } = await supabase
      .from('competitions')
      .insert({
        name:                  data.name,
        status:                data.status,
        location:              data.location,
        start_date:            data.start_date,
        end_date:              data.end_date,
        registration_deadline: data.registration_deadline,
        age_groups:            data.age_groups,
        poster_url:            data.poster_url,
        admin_id:              data.admin?.id ?? null,
      })
      .select('id, name, status, location, start_date, end_date, registration_deadline, age_groups, poster_url, admin_id, created_at')
      .single()

    if (error || !created) return

    const { admin_id, ...rest } = created
    const newComp: Competition = {
      ...rest,
      admin: admin_id ? (availableAdmins.find((a) => a.id === admin_id) ?? null) : null,
    }
    setCompetitions((prev) => [newComp, ...prev])
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AuthBar lang={lang} onLangChange={setLang} />
      <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center sticky top-0 z-10">
        <button onClick={() => router.push('/admin/users')}
          className="ml-auto text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100">
          {T_USERS[lang]}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
        </div>
      ) : (
        <CompetitionsView
          lang={lang}
          ageGroupRules={ageGroupRules}
          availableAdmins={availableAdmins}
          competitions={competitions}
          onCreate={handleCreate}
          onManage={(id) => router.push(`/admin/competitions/${id}`)}
        />
      )}
    </div>
  )
}
