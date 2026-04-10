'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

type DbRole = 'super_admin' | 'admin' | 'judge' | 'club'

const ROLE_BADGE: Record<DbRole, string> = {
  super_admin: 'bg-violet-100  text-violet-700',
  admin:       'bg-blue-100    text-blue-700',
  judge:       'bg-amber-100   text-amber-700',
  club:        'bg-emerald-100 text-emerald-700',
}

const ROLE_LABEL: Record<DbRole, string> = {
  super_admin: 'Super Admin',
  admin:       'Admin',
  judge:       'Judge',
  club:        'Club',
}

export default function AuthBar({ lang, onLangChange }: {
  lang?: string
  onLangChange?: (lang: 'en' | 'es') => void
} = {}) {
  const router = useRouter()
  const supabase = createClient()
  const [profile, setProfile] = useState<{ name: string; role: DbRole } | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: prof } = await supabase
        .from('profiles').select('id, role').eq('auth_id', user.id).single()
      if (!prof) return

      const role = prof.role as DbRole
      let name = user.email?.split('@')[0] ?? '—'

      if (role === 'judge') {
        const { data } = await supabase.from('judges').select('full_name').eq('id', prof.id).single()
        if (data) name = data.full_name
      } else if (role === 'club') {
        const { data } = await supabase.from('clubs').select('club_name').eq('id', prof.id).single()
        if (data) name = data.club_name
      } else {
        const { data } = await supabase.from('admins').select('full_name').eq('id', prof.id).single()
        if (data) name = data.full_name
      }

      setProfile({ name, role })
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!profile) return null

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="bg-white border-b border-slate-100 px-4 py-1.5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <span className={['inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold', ROLE_BADGE[profile.role]].join(' ')}>
          {ROLE_LABEL[profile.role]}
        </span>
        <span className="text-sm text-slate-600 font-medium">{profile.name}</span>
      </div>
      <div className="flex items-center gap-3 ml-auto">
        {lang && onLangChange && (
          <div className="flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5">
            {(['en', 'es'] as const).map((l) => (
              <button key={l} onClick={() => onLangChange(l)}
                className={['px-2.5 py-0.5 rounded-md text-xs font-medium transition-all',
                  lang === l ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'].join(' ')}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        )}
        <button onClick={handleSignOut}
          className="text-xs text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
          Sign out
        </button>
      </div>
    </div>
  )
}
