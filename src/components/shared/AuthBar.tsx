'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useProfile } from '@/contexts/ProfileContext'
import type { DbRole } from '@/contexts/ProfileContext'

// ─── constants ────────────────────────────────────────────────────────────────

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

const AVATAR_BG: Record<DbRole, string> = {
  super_admin: 'bg-violet-500',
  admin:       'bg-blue-500',
  judge:       'bg-amber-500',
  club:        'bg-emerald-500',
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?'
}

function Avatar({ name, role, url, size }: { name: string; role: DbRole; url: string | null; size: number }) {
  if (url) {
    return <img src={url} alt={name} width={size} height={size} className="w-full h-full object-cover" />
  }
  return (
    <div className={['w-full h-full flex items-center justify-center text-white text-xs font-bold', AVATAR_BG[role]].join(' ')}>
      {initials(name)}
    </div>
  )
}

// ─── component ────────────────────────────────────────────────────────────────

export default function AuthBar({ lang, onLangChange }: {
  lang?: string
  onLangChange?: (lang: 'en' | 'es') => void
} = {}) {
  const router   = useRouter()
  const supabase = createClient()
  const { activeProfile, allProfiles, switchProfile } = useProfile()
  const [open, setOpen] = useState(false)
  const dropdownRef     = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  if (!activeProfile) return null

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="bg-white border-b border-slate-100 px-4 py-1.5 flex items-center justify-between gap-4">

      {/* left: role badge + name */}
      <div className="flex items-center gap-2">
        <span className={['inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold', ROLE_BADGE[activeProfile.role]].join(' ')}>
          {ROLE_LABEL[activeProfile.role]}
        </span>
        <span className="text-sm text-slate-600 font-medium">{activeProfile.name}</span>
      </div>

      {/* right: lang + avatar menu */}
      <div className="flex items-center gap-3">
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

        {/* avatar button → dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen(o => !o)}
            className="w-7 h-7 rounded-full overflow-hidden transition-opacity hover:opacity-80 shrink-0"
          >
            <Avatar name={activeProfile.name} role={activeProfile.role} url={activeProfile.avatar_url} size={28} />
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50">

              {/* profile list */}
              {allProfiles.map(p => (
                <button
                  key={p.id}
                  onClick={() => { setOpen(false); if (p.id !== activeProfile.id) switchProfile(p.id) }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="w-7 h-7 rounded-full overflow-hidden shrink-0">
                    <Avatar name={p.name} role={p.role} url={p.avatar_url} size={28} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 font-medium truncate">{p.name}</p>
                    <p className={['text-xs font-medium', ROLE_BADGE[p.role].replace('bg-', 'text-').split(' ')[1]].join(' ')}>
                      {ROLE_LABEL[p.role]}
                    </p>
                  </div>
                  {p.id === activeProfile.id && (
                    <svg className="w-3.5 h-3.5 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}

              {/* divider + sign out */}
              <div className="border-t border-slate-100 mt-1 pt-1">
                <button
                  onClick={() => { setOpen(false); handleSignOut() }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm text-red-500 hover:bg-red-50 transition-colors rounded-b-xl"
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                  </svg>
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
