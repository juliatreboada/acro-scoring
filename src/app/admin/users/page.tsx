'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import AuthBar from '@/components/shared/AuthBar'
import { useRouter } from 'next/navigation'
import type { Lang } from '@/components/aj-scoring/types'

// ─── types ─────────────────────────────────────────────────────────────────────

type Role = 'admin' | 'judge' | 'club'

type UserRow = {
  id: string
  name: string    // full_name (judges/admins) or club_name (clubs)
  email: string
  role: Role
  detail: string | null  // licence (judge) or contact_name (club) or club_name (admin)
}

// ─── translations ──────────────────────────────────────────────────────────────

const T = {
  en: {
    title: 'Users',
    tabs: { admin: 'Admins', judge: 'Judges', club: 'Clubs' },
    invite: 'Invite',
    inviteTitle: { admin: 'Invite Admin', judge: 'Invite Judge', club: 'Invite Club' },
    email: 'Email',
    fullName: 'Full name', clubName: 'Club name', contactName: 'Contact name',
    licence: 'Licence', phone: 'Phone (optional)',
    send: 'Send invite', cancel: 'Cancel', sending: 'Sending…',
    noUsers: 'No users yet.',
    backToAdmin: '← Admin',
  },
  es: {
    title: 'Usuarios',
    tabs: { admin: 'Admins', judge: 'Jueces', club: 'Clubs' },
    invite: 'Invitar',
    inviteTitle: { admin: 'Invitar Admin', judge: 'Invitar Juez', club: 'Invitar Club' },
    email: 'Email',
    fullName: 'Nombre completo', clubName: 'Nombre del club', contactName: 'Persona de contacto',
    licence: 'Licencia', phone: 'Teléfono (opcional)',
    send: 'Enviar invitación', cancel: 'Cancelar', sending: 'Enviando…',
    noUsers: 'Sin usuarios aún.',
    backToAdmin: '← Admin',
  },
}

// ─── page ──────────────────────────────────────────────────────────────────────

export default function Page() {
  const supabase = createClient()
  const router   = useRouter()
  const [lang, setLang] = useState<Lang>('es')
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Role>('admin')

  const [users, setUsers] = useState<UserRow[]>([])

  // invite modal
  const [showInvite, setShowInvite]       = useState(false)
  const [inviteRole, setInviteRole]       = useState<Role>('admin')
  const [invEmail,   setInvEmail]         = useState('')
  const [invFullName, setInvFullName]     = useState('')
  const [invClubName, setInvClubName]     = useState('')
  const [invContactName, setInvContactName] = useState('')
  const [invLicence, setInvLicence]       = useState('')
  const [invPhone,   setInvPhone]         = useState('')
  const [sending, setSending]             = useState(false)
  const [invError, setInvError]           = useState('')

  const t = T[lang]

  // ── load ─────────────────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      const [profilesRes, judgesRes, clubsRes, adminsRes] = await Promise.all([
        supabase.from('profiles').select('id, email, role').in('role', ['admin', 'judge', 'club']),
        supabase.from('judges').select('id, full_name, licence'),
        supabase.from('clubs').select('id, club_name, contact_name'),
        supabase.from('admins').select('id, full_name, club_name'),
      ])

      const profiles = profilesRes.data ?? []
      const judgeMap = Object.fromEntries((judgesRes.data ?? []).map(j => [j.id, j]))
      const clubMap  = Object.fromEntries((clubsRes.data  ?? []).map(c => [c.id, c]))
      const adminMap = Object.fromEntries((adminsRes.data ?? []).map(a => [a.id, a]))

      const rows: UserRow[] = profiles.map(p => {
        if (p.role === 'judge') {
          const j = judgeMap[p.id]
          return { id: p.id, name: j?.full_name ?? '—', email: p.email ?? '', role: 'judge', detail: j?.licence ?? null }
        }
        if (p.role === 'club') {
          const c = clubMap[p.id]
          return { id: p.id, name: c?.club_name ?? '—', email: p.email ?? '', role: 'club', detail: c?.contact_name ?? null }
        }
        // admin / super_admin both shown in 'admin' tab
        const a = adminMap[p.id]
        return { id: p.id, name: a?.full_name ?? '—', email: p.email ?? '', role: 'admin', detail: a?.club_name ?? null }
      })

      setUsers(rows)
      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── invite ────────────────────────────────────────────────────────────────────
  function openInvite(role: Role) {
    setInviteRole(role)
    setInvEmail(''); setInvFullName(''); setInvClubName('')
    setInvContactName(''); setInvLicence(''); setInvPhone('')
    setInvError('')
    setShowInvite(true)
  }

  async function handleSendInvite() {
    if (!invEmail) return
    if ((inviteRole === 'admin' || inviteRole === 'judge') && !invFullName) {
      setInvError('Full name is required'); return
    }
    if (inviteRole === 'club' && !invClubName) {
      setInvError('Club name is required'); return
    }

    setSending(true)
    setInvError('')

    const body: Record<string, string> = { role: inviteRole, email: invEmail }
    if (inviteRole === 'admin' || inviteRole === 'judge') {
      body.full_name = invFullName
      if (inviteRole === 'judge' && invLicence) body.licence = invLicence
    }
    if (inviteRole === 'club') {
      body.club_name = invClubName
      if (invContactName) body.contact_name = invContactName
    }
    if (invPhone) body.phone = invPhone

    const res = await fetch('/api/admin/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    setSending(false)

    if (!res.ok) {
      const err = await res.json()
      setInvError(err.error ?? 'Something went wrong')
      return
    }

    setShowInvite(false)
    window.location.reload()
  }

  const tabUsers = users.filter(u => u.role === tab)

  // ─── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">
      <AuthBar lang={lang} onLangChange={setLang} />

      {/* toolbar */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center gap-4 sticky top-0 z-10">
        <button onClick={() => router.push('/admin')}
          className="text-sm text-slate-500 hover:text-slate-700 transition-colors">
          {t.backToAdmin}
        </button>
        <span className="text-slate-300">|</span>
        <span className="text-sm font-semibold text-slate-700">{t.title}</span>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* tab bar */}
        <div className="flex items-center gap-0 border-b border-slate-200 mb-6">
          {(['admin', 'judge', 'club'] as Role[]).map((r) => (
            <button key={r} onClick={() => setTab(r)}
              className={['px-5 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-all',
                tab === r ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'].join(' ')}>
              {t.tabs[r]}
              <span className={['ml-2 text-xs rounded-full px-1.5 py-0.5',
                tab === r ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'].join(' ')}>
                {users.filter(u => u.role === r).length}
              </span>
            </button>
          ))}
        </div>

        {/* invite button */}
        <div className="flex justify-end mb-4">
          <button onClick={() => openInvite(tab)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            + {t.invite}
          </button>
        </div>

        {/* user list */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
          </div>
        ) : tabUsers.length === 0 ? (
          <p className="text-center text-slate-400 py-16 text-sm">{t.noUsers}</p>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
            {tabUsers.map((u) => (
              <div key={u.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-slate-500">
                    {u.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{u.name}</p>
                  <p className="text-xs text-slate-400 truncate">{u.email}</p>
                </div>
                {u.detail && (
                  <span className="flex-shrink-0 text-xs bg-slate-50 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full">
                    {u.detail}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* invite modal */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-5">{t.inviteTitle[inviteRole]}</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">{t.email}</label>
                <input type="email" value={invEmail} onChange={e => setInvEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>

              {(inviteRole === 'admin' || inviteRole === 'judge') && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">{t.fullName}</label>
                  <input type="text" value={invFullName} onChange={e => setInvFullName(e.target.value)}
                    placeholder="Full name"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
              )}

              {inviteRole === 'judge' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">{t.licence}</label>
                  <input type="text" value={invLicence} onChange={e => setInvLicence(e.target.value)}
                    placeholder="Licence number (optional)"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
              )}

              {inviteRole === 'club' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">{t.clubName}</label>
                    <input type="text" value={invClubName} onChange={e => setInvClubName(e.target.value)}
                      placeholder="Club name"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">{t.contactName}</label>
                    <input type="text" value={invContactName} onChange={e => setInvContactName(e.target.value)}
                      placeholder="Contact person name (optional)"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">{t.phone}</label>
                <input type="tel" value={invPhone} onChange={e => setInvPhone(e.target.value)}
                  placeholder="+34 600 000 000"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>

              {invError && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{invError}</p>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowInvite(false)}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition-colors">
                {t.cancel}
              </button>
              <button onClick={handleSendInvite} disabled={sending}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {sending ? t.sending : t.send}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
