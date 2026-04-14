'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

// ─── types ────────────────────────────────────────────────────────────────────

export type DbRole = 'super_admin' | 'admin' | 'judge' | 'club'

export type ProfileEntry = {
  id:         string
  role:       DbRole
  name:       string
  club_id:    string | null  // only set for role='club'
  avatar_url: string | null
}

type ProfileContextValue = {
  profileLoading: boolean
  activeProfile:  ProfileEntry | null
  allProfiles:    ProfileEntry[]
  switchProfile:  (id: string) => void
}

// ─── constants ────────────────────────────────────────────────────────────────

const ROLE_PRIORITY: Record<DbRole, number> = { super_admin: 4, admin: 3, club: 2, judge: 1 }

export const ROLE_HOME: Record<DbRole, string> = {
  super_admin: '/admin',
  admin:       '/admin',
  club:        '/club',
  judge:       '/judge',
}

function storageKey(authId: string) { return `active_profile_${authId}` }

// ─── context ──────────────────────────────────────────────────────────────────

const ProfileContext = createContext<ProfileContextValue>({
  profileLoading: true,
  activeProfile:  null,
  allProfiles:    [],
  switchProfile:  () => {},
})

// ─── provider ─────────────────────────────────────────────────────────────────

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const supabase = createClient()

  const [profileLoading,   setProfileLoading]   = useState(true)
  const [authId,           setAuthId]           = useState<string | null>(null)
  const [allProfiles,      setAllProfiles]      = useState<ProfileEntry[]>([])
  const [activeProfileId,  setActiveProfileId]  = useState<string | null>(null)

  useEffect(() => {
    async function load(userId: string, userEmail: string | undefined) {
      const { data: rows } = await supabase
        .from('profiles')
        .select('id, role, club_id')
        .eq('auth_id', userId)

      if (!rows?.length) { setProfileLoading(false); return }

      // Load display name for each profile in parallel
      const entries: ProfileEntry[] = await Promise.all(
        rows.map(async (p) => {
          const role       = p.role as DbRole
          const club_id    = p.club_id ?? null
          let name         = userEmail?.split('@')[0] ?? '—'
          let avatar_url: string | null = null

          if (role === 'judge') {
            const { data } = await supabase.from('judges').select('full_name, avatar_url').eq('id', p.id).single()
            if (data) { name = data.full_name; avatar_url = data.avatar_url ?? null }
          } else if (role === 'club' && club_id) {
            const { data } = await supabase.from('clubs').select('club_name, avatar_url').eq('id', club_id).single()
            if (data) { name = data.club_name; avatar_url = data.avatar_url ?? null }
          } else if (role === 'admin' || role === 'super_admin') {
            const { data } = await supabase.from('admins').select('full_name, avatar_url').eq('id', p.id).single()
            if (data) { name = data.full_name; avatar_url = data.avatar_url ?? null }
          }

          return { id: p.id, role, name, club_id, avatar_url }
        })
      )

      setAllProfiles(entries)

      // Restore from localStorage, fall back to highest-priority role
      const stored    = localStorage.getItem(storageKey(userId))
      const validId   = stored && entries.find(e => e.id === stored) ? stored : null
      const defaultId = [...entries].sort((a, b) => ROLE_PRIORITY[b.role] - ROLE_PRIORITY[a.role])[0]?.id ?? null
      setActiveProfileId(validId ?? defaultId)

      setProfileLoading(false)
    }

    // Subscribe to auth changes so sign-out / sign-in reload profiles correctly
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setAuthId(session.user.id)
        setProfileLoading(true)
        load(session.user.id, session.user.email)
      } else {
        // Signed out — clear everything
        setAuthId(null)
        setAllProfiles([])
        setActiveProfileId(null)
        setProfileLoading(false)
      }
    })

    return () => { subscription.unsubscribe() }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const switchProfile = useCallback((id: string) => {
    const profile = allProfiles.find(p => p.id === id)
    if (!profile || !authId) return
    localStorage.setItem(storageKey(authId), id)
    setActiveProfileId(id)
    router.push(ROLE_HOME[profile.role])
  }, [allProfiles, authId, router])

  const activeProfile = allProfiles.find(p => p.id === activeProfileId) ?? null

  return (
    <ProfileContext.Provider value={{ profileLoading, activeProfile, allProfiles, switchProfile }}>
      {children}
    </ProfileContext.Provider>
  )
}

// ─── hook ─────────────────────────────────────────────────────────────────────

export function useProfile() {
  return useContext(ProfileContext)
}
