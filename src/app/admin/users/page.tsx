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
  club_id: string | null   // only for role='club'
  name: string
  email: string
  role: Role
  detail: string | null
  avatar_url: string | null
  phone: string | null
  licence: string | null
  contact_name: string | null
  club_name: string | null
}

type ClubOption = { id: string; club_name: string }

// ─── translations ──────────────────────────────────────────────────────────────

const T = {
  en: {
    title: 'Users',
    tabs: { admin: 'Admins', judge: 'Judges', club: 'Clubs' },
    invite: 'Invite new',
    addProfile: 'Add to existing user',
    inviteTitle: { admin: 'Invite Admin', judge: 'Invite Judge', club: 'Invite Club' },
    addProfileTitle: { admin: 'Add Admin profile', judge: 'Add Judge profile', club: 'Add Club profile' },
    editTitle: { admin: 'Edit Admin', judge: 'Edit Judge', club: 'Edit Club' },
    email: 'Email',
    fullName: 'Full name', clubName: 'Club name', contactName: 'Contact name',
    licence: 'Licence', phone: 'Phone (optional)',
    send: 'Send invite', cancel: 'Cancel', sending: 'Sending…',
    save: 'Save', saving: 'Saving…',
    add: 'Add profile', adding: 'Adding…',
    lookup: 'Look up user',
    lookupBtn: 'Search',
    lookupHint: 'Enter the email of the existing user',
    userFound: 'User found',
    userNotFound: 'No user found with that email',
    currentProfiles: 'Current profiles',
    noUsers: 'No users yet.',
    backToAdmin: '← Admin',
    confirmRemove: 'Remove this profile? This cannot be undone.',
    roleLabel: { admin: 'Admin', judge: 'Judge', club: 'Club' },
  },
  es: {
    title: 'Usuarios',
    tabs: { admin: 'Admins', judge: 'Jueces', club: 'Clubs' },
    invite: 'Invitar nuevo',
    addProfile: 'Añadir a usuario existente',
    inviteTitle: { admin: 'Invitar Admin', judge: 'Invitar Juez', club: 'Invitar Club' },
    addProfileTitle: { admin: 'Añadir perfil Admin', judge: 'Añadir perfil Juez', club: 'Añadir perfil Club' },
    editTitle: { admin: 'Editar Admin', judge: 'Editar Juez', club: 'Editar Club' },
    email: 'Email',
    fullName: 'Nombre completo', clubName: 'Nombre del club', contactName: 'Persona de contacto',
    licence: 'Licencia', phone: 'Teléfono (opcional)',
    send: 'Enviar invitación', cancel: 'Cancelar', sending: 'Enviando…',
    save: 'Guardar', saving: 'Guardando…',
    add: 'Añadir perfil', adding: 'Añadiendo…',
    lookup: 'Buscar usuario',
    lookupBtn: 'Buscar',
    lookupHint: 'Introduce el email del usuario existente',
    userFound: 'Usuario encontrado',
    userNotFound: 'No se encontró ningún usuario con ese email',
    currentProfiles: 'Perfiles actuales',
    noUsers: 'Sin usuarios aún.',
    backToAdmin: '← Admin',
    confirmRemove: '¿Eliminar este perfil? Esta acción no se puede deshacer.',
    roleLabel: { admin: 'Admin', judge: 'Juez', club: 'Club' },
  },
}

const roleBadgeClass: Record<Role, string> = {
  admin: 'bg-purple-100 text-purple-700',
  judge: 'bg-blue-100 text-blue-700',
  club:  'bg-green-100 text-green-700',
}

// ─── page ──────────────────────────────────────────────────────────────────────

export default function Page() {
  const supabase = createClient()
  const router   = useRouter()

  async function getToken(): Promise<string | undefined> {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token
  }
  const [lang, setLang] = useState<Lang>('es')
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Role>('admin')

  const [users, setUsers] = useState<UserRow[]>([])

  // ── invite modal (new user) ───────────────────────────────────────────────────
  const [showInvite, setShowInvite]         = useState(false)
  const [inviteRole, setInviteRole]         = useState<Role>('admin')
  const [invEmail,   setInvEmail]           = useState('')
  const [invFullName, setInvFullName]       = useState('')
  const [invClubName, setInvClubName]       = useState('')
  const [invContactName, setInvContactName] = useState('')
  const [invLicence, setInvLicence]         = useState('')
  const [invPhone,   setInvPhone]           = useState('')
  const [sending, setSending]               = useState(false)
  const [invError, setInvError]             = useState('')
  const [invClubMode, setInvClubMode]       = useState<'existing' | 'new'>('existing')
  const [invSelectedClubId, setInvSelectedClubId] = useState<string>('')

  // ── add-profile modal (existing user) ────────────────────────────────────────
  const [showAdd, setShowAdd]               = useState(false)
  const [addRole, setAddRole]               = useState<Role>('judge')
  const [addEmail, setAddEmail]             = useState('')
  const [addLookupDone, setAddLookupDone]   = useState(false)
  const [addFoundName, setAddFoundName]     = useState('')
  const [addFoundProfiles, setAddFoundProfiles] = useState<Role[]>([])
  const [addFullName, setAddFullName]       = useState('')
  const [addClubName, setAddClubName]       = useState('')
  const [addContactName, setAddContactName] = useState('')
  const [addLicence, setAddLicence]         = useState('')
  const [addPhone, setAddPhone]             = useState('')
  const [adding, setAdding]                 = useState(false)
  const [addError, setAddError]             = useState('')
  const [looking, setLooking]               = useState(false)
  // club-specific: existing club lookup
  const [clubOptions, setClubOptions]       = useState<ClubOption[]>([])
  const [selectedClubId, setSelectedClubId] = useState<string>('')
  const [clubMode, setClubMode]             = useState<'existing' | 'new'>('existing')

  // ── edit modal ────────────────────────────────────────────────────────────────
  const [editUser, setEditUser]             = useState<UserRow | null>(null)
  const [editFullName, setEditFullName]     = useState('')
  const [editClubName, setEditClubName]     = useState('')
  const [editContactName, setEditContactName] = useState('')
  const [editLicence, setEditLicence]       = useState('')
  const [editPhone, setEditPhone]           = useState('')
  const [saving, setSaving]                 = useState(false)
  const [editError, setEditError]           = useState('')

  const t = T[lang]

  // ── load ─────────────────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      const [profilesRes, judgesRes, clubsRes, adminsRes] = await Promise.all([
        supabase.from('profiles').select('id, email, role, club_id').in('role', ['admin', 'judge', 'club']),
        supabase.from('judges').select('id, full_name, licence, phone, avatar_url'),
        supabase.from('clubs').select('id, club_name, contact_name, phone, avatar_url'),
        supabase.from('admins').select('id, full_name, phone, avatar_url'),
      ])

      const profiles = profilesRes.data ?? []
      const judgeMap = Object.fromEntries((judgesRes.data ?? []).map(j => [j.id, j]))
      const clubMap  = Object.fromEntries((clubsRes.data  ?? []).map(c => [c.id, c]))
      const adminMap = Object.fromEntries((adminsRes.data ?? []).map(a => [a.id, a]))

      const rows: UserRow[] = (profiles as Array<{ id: string; email: string | null; role: string; club_id: string | null }>).map(p => {
        if (p.role === 'judge') {
          const j = judgeMap[p.id]
          return { id: p.id, club_id: null, name: j?.full_name ?? '—', email: p.email ?? '', role: 'judge' as Role,
            detail: j?.licence ?? null, avatar_url: j?.avatar_url ?? null,
            phone: j?.phone ?? null, licence: j?.licence ?? null, contact_name: null, club_name: null }
        }
        if (p.role === 'club') {
          const c = clubMap[p.club_id ?? '']
          return { id: p.id, club_id: p.club_id, name: c?.club_name ?? '—', email: p.email ?? '', role: 'club' as Role,
            detail: c?.contact_name ?? null, avatar_url: c?.avatar_url ?? null,
            phone: c?.phone ?? null, licence: null, contact_name: c?.contact_name ?? null, club_name: c?.club_name ?? null }
        }
        const a = adminMap[p.id]
        return { id: p.id, club_id: null, name: a?.full_name ?? '—', email: p.email ?? '', role: 'admin' as Role,
          detail: null, avatar_url: a?.avatar_url ?? null,
          phone: a?.phone ?? null, licence: null, contact_name: null, club_name: null }
      })

      setUsers(rows)
      setClubOptions((clubsRes.data ?? []).map(c => ({ id: c.id, club_name: c.club_name ?? '' })))
      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── invite (new user) ─────────────────────────────────────────────────────────
  function openInvite(role: Role) {
    setInviteRole(role)
    setInvEmail(''); setInvFullName(''); setInvClubName('')
    setInvContactName(''); setInvLicence(''); setInvPhone('')
    setInvError(''); setInvClubMode('existing'); setInvSelectedClubId('')
    setShowInvite(true)
  }

  async function handleSendInvite() {
    if (!invEmail) return
    if ((inviteRole === 'admin' || inviteRole === 'judge') && !invFullName) {
      setInvError('Full name is required'); return
    }
    if (inviteRole === 'club') {
      if (invClubMode === 'existing' && !invSelectedClubId) {
        setInvError('Select a club'); return
      }
      if (invClubMode === 'new' && !invClubName) {
        setInvError('Club name is required'); return
      }
    }

    setSending(true); setInvError('')

    const body: Record<string, string> = { role: inviteRole, email: invEmail }
    if (inviteRole === 'admin' || inviteRole === 'judge') {
      body.full_name = invFullName
      if (inviteRole === 'judge' && invLicence) body.licence = invLicence
    }
    if (inviteRole === 'club') {
      if (invClubMode === 'existing') {
        body.club_id = invSelectedClubId
      } else {
        body.club_name = invClubName
        if (invContactName) body.contact_name = invContactName
      }
    }
    if (invPhone) body.phone = invPhone

    const token = await getToken()
    const res = await fetch('/api/admin/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(body),
    })
    setSending(false)
    if (!res.ok) { const j = await res.json().catch(() => ({})); setInvError(j.error ?? 'Something went wrong'); return }
    setShowInvite(false)
    window.location.reload()
  }

  // ── add profile (existing user) ───────────────────────────────────────────────
  function openAdd(role: Role) {
    setAddRole(role)
    setAddEmail(''); setAddLookupDone(false); setAddFoundName(''); setAddFoundProfiles([])
    setAddFullName(''); setAddClubName(''); setAddContactName(''); setAddLicence(''); setAddPhone('')
    setAddError(''); setSelectedClubId(''); setClubMode('existing')
    setShowAdd(true)
  }

  async function handleLookup() {
    if (!addEmail) return
    setLooking(true); setAddError(''); setAddLookupDone(false)

    // look up by email in profiles table client-side
    const { data } = await supabase
      .from('profiles').select('id, role, email, club_id')
      .eq('email', addEmail)

    setLooking(false)
    if (!data?.length) { setAddError(t.userNotFound); return }

    // Derive name from entity tables
    const typedData = data as Array<{ id: string; role: string; email: string | null; club_id: string | null }>
    const roles = typedData.map(p => p.role as Role)
    let name = addEmail
    if (roles.includes('judge')) {
      const { data: j } = await supabase.from('judges').select('full_name').eq('id',
        typedData.find(p => p.role === 'judge')!.id).single()
      if (j) name = j.full_name
    } else if (roles.includes('admin')) {
      const { data: a } = await supabase.from('admins').select('full_name').eq('id',
        typedData.find(p => p.role === 'admin')!.id).single()
      if (a) name = a.full_name
    } else if (roles.includes('club')) {
      const clubProfile = typedData.find(p => p.role === 'club')!
      if (clubProfile.club_id) {
        const { data: c } = await supabase.from('clubs').select('club_name').eq('id', clubProfile.club_id).single()
        if (c) name = c.club_name
      }
    }

    setAddFoundName(name)
    setAddFoundProfiles(roles.filter(r => ['admin', 'judge', 'club'].includes(r)) as Role[])
    setAddLookupDone(true)
  }

  async function handleAddProfile() {
    if (!addLookupDone) return

    if ((addRole === 'admin' || addRole === 'judge') && !addFullName) {
      setAddError('Full name is required'); return
    }
    if (addRole === 'club') {
      if (clubMode === 'existing' && !selectedClubId) {
        setAddError('Select a club'); return
      }
      if (clubMode === 'new' && !addClubName) {
        setAddError('Club name is required'); return
      }
    }

    setAdding(true); setAddError('')
    const body: Record<string, string> = { email: addEmail, role: addRole }
    if (addFullName)    body.full_name    = addFullName
    if (addLicence)     body.licence      = addLicence
    if (addPhone)       body.phone        = addPhone

    if (addRole === 'club') {
      if (clubMode === 'existing') {
        body.club_id = selectedClubId
      } else {
        body.club_name = addClubName
        if (addContactName) body.contact_name = addContactName
      }
    }

    const token = await getToken()
    const res = await fetch('/api/admin/profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(body),
    })
    setAdding(false)
    if (!res.ok) { setAddError((await res.json()).error ?? 'Something went wrong'); return }
    setShowAdd(false)
    window.location.reload()
  }

  // ── edit ──────────────────────────────────────────────────────────────────────
  function openEdit(u: UserRow) {
    setEditUser(u)
    setEditFullName(u.name)
    setEditClubName(u.club_name ?? '')
    setEditContactName(u.contact_name ?? '')
    setEditLicence(u.licence ?? '')
    setEditPhone(u.phone ?? '')
    setEditError('')
  }

  async function handleSave() {
    if (!editUser) return
    setSaving(true); setEditError('')
    const body: Record<string, string> = { profileId: editUser.id }
    if (editUser.role === 'judge') {
      body.full_name = editFullName
      body.licence   = editLicence
      body.phone     = editPhone
    } else if (editUser.role === 'admin') {
      body.full_name = editFullName
      body.phone     = editPhone
    } else if (editUser.role === 'club') {
      body.club_name    = editClubName
      body.contact_name = editContactName
      body.phone        = editPhone
    }

    const token = await getToken()
    const res = await fetch('/api/admin/profiles', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(body),
    })
    setSaving(false)
    if (!res.ok) { setEditError((await res.json()).error ?? 'Something went wrong'); return }
    setEditUser(null)
    window.location.reload()
  }

  // ── delete ────────────────────────────────────────────────────────────────────
  async function handleDelete(u: UserRow) {
    if (!confirm(t.confirmRemove)) return
    const token = await getToken()
    await fetch(`/api/admin/profiles?profileId=${u.id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    setUsers(prev => prev.filter(x => x.id !== u.id))
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

        {/* action buttons */}
        <div className="flex justify-end gap-2 mb-4">
          <button onClick={() => openAdd(tab)}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
            + {t.addProfile}
          </button>
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
                <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {u.avatar_url
                    ? <img src={u.avatar_url} alt={u.name} className="w-full h-full object-cover" />
                    : <span className="text-sm font-semibold text-slate-500">{u.name.charAt(0).toUpperCase()}</span>
                  }
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
                {/* edit + delete */}
                <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                  <button onClick={() => openEdit(u)}
                    title="Edit"
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" />
                    </svg>
                  </button>
                  <button onClick={() => handleDelete(u)}
                    title="Remove"
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── invite modal (new user) ─────────────────────────────────────────────── */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-5">{t.inviteTitle[inviteRole]}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">{t.email}</label>
                <input type="email" value={invEmail} onChange={e => setInvEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              {(inviteRole === 'admin' || inviteRole === 'judge') && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">{t.fullName}</label>
                  <input type="text" value={invFullName} onChange={e => setInvFullName(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
              )}
              {inviteRole === 'judge' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">{t.licence}</label>
                  <input type="text" value={invLicence} onChange={e => setInvLicence(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
              )}
              {inviteRole === 'club' && (
                <>
                  <div className="flex gap-2">
                    {(['existing', 'new'] as const).map(m => (
                      <button key={m} type="button" onClick={() => setInvClubMode(m)}
                        className={['flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors',
                          invClubMode === m
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'].join(' ')}>
                        {m === 'existing' ? (lang === 'es' ? 'Club existente' : 'Existing club') : (lang === 'es' ? 'Nuevo club' : 'New club')}
                      </button>
                    ))}
                  </div>
                  {invClubMode === 'existing' ? (
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">{t.clubName}</label>
                      <select value={invSelectedClubId} onChange={e => setInvSelectedClubId(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white">
                        <option value="">{lang === 'es' ? '— Seleccionar club —' : '— Select club —'}</option>
                        {clubOptions.map(c => (
                          <option key={c.id} value={c.id}>{c.club_name}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">{t.clubName}</label>
                        <input type="text" value={invClubName} onChange={e => setInvClubName(e.target.value)}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">{t.contactName}</label>
                        <input type="text" value={invContactName} onChange={e => setInvContactName(e.target.value)}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                      </div>
                    </>
                  )}
                </>
              )}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">{t.phone}</label>
                <input type="tel" value={invPhone} onChange={e => setInvPhone(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400" />
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

      {/* ── add profile modal (existing user) ─────────────────────────────────── */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-1">{t.addProfileTitle[addRole]}</h2>
            <p className="text-xs text-slate-400 mb-5">{t.lookupHint}</p>

            {/* step 1: email lookup */}
            <div className="space-y-4">
              <div className="flex gap-2">
                <input type="email" value={addEmail} onChange={e => { setAddEmail(e.target.value); setAddLookupDone(false) }}
                  placeholder="name@example.com"
                  className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                <button onClick={handleLookup} disabled={looking || !addEmail}
                  className="px-3 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors">
                  {looking ? '…' : t.lookupBtn}
                </button>
              </div>

              {/* lookup result */}
              {addLookupDone && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                  <p className="text-xs font-semibold text-slate-500 mb-1">{t.userFound}</p>
                  <p className="text-sm font-semibold text-slate-800">{addFoundName}</p>
                  <p className="text-xs text-slate-400">{addEmail}</p>
                  {addFoundProfiles.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {addFoundProfiles.map(r => (
                        <span key={r} className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleBadgeClass[r]}`}>
                          {t.roleLabel[r]}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* step 2: data fields (only when user found) */}
              {addLookupDone && (
                <>
                  {(addRole === 'admin' || addRole === 'judge') && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">{t.fullName}</label>
                      <input type="text" value={addFullName} onChange={e => setAddFullName(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                    </div>
                  )}
                  {addRole === 'judge' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">{t.licence}</label>
                      <input type="text" value={addLicence} onChange={e => setAddLicence(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                    </div>
                  )}
                  {addRole === 'club' && (
                    <>
                      {/* toggle existing / new */}
                      <div className="flex gap-2">
                        {(['existing', 'new'] as const).map(m => (
                          <button key={m} type="button" onClick={() => setClubMode(m)}
                            className={['flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors',
                              clubMode === m
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'].join(' ')}>
                            {m === 'existing' ? (lang === 'es' ? 'Club existente' : 'Existing club') : (lang === 'es' ? 'Nuevo club' : 'New club')}
                          </button>
                        ))}
                      </div>
                      {clubMode === 'existing' ? (
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">{t.clubName}</label>
                          <select value={selectedClubId} onChange={e => setSelectedClubId(e.target.value)}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white">
                            <option value="">{lang === 'es' ? '— Seleccionar club —' : '— Select club —'}</option>
                            {clubOptions.map(c => (
                              <option key={c.id} value={c.id}>{c.club_name}</option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <>
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">{t.clubName}</label>
                            <input type="text" value={addClubName} onChange={e => setAddClubName(e.target.value)}
                              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">{t.contactName}</label>
                            <input type="text" value={addContactName} onChange={e => setAddContactName(e.target.value)}
                              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                          </div>
                        </>
                      )}
                    </>
                  )}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">{t.phone}</label>
                    <input type="tel" value={addPhone} onChange={e => setAddPhone(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  </div>
                </>
              )}

              {addError && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{addError}</p>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowAdd(false)}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition-colors">
                {t.cancel}
              </button>
              {addLookupDone && (
                <button onClick={handleAddProfile} disabled={adding}
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
                  {adding ? t.adding : t.add}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── edit modal ─────────────────────────────────────────────────────────── */}
      {editUser && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-1">{t.editTitle[editUser.role]}</h2>
            <p className="text-xs text-slate-400 mb-5">{editUser.email}</p>
            <div className="space-y-4">
              {(editUser.role === 'admin' || editUser.role === 'judge') && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">{t.fullName}</label>
                  <input type="text" value={editFullName} onChange={e => setEditFullName(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
              )}
              {editUser.role === 'judge' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">{t.licence}</label>
                  <input type="text" value={editLicence} onChange={e => setEditLicence(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
              )}
              {editUser.role === 'club' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">{t.clubName}</label>
                    <input type="text" value={editClubName} onChange={e => setEditClubName(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">{t.contactName}</label>
                    <input type="text" value={editContactName} onChange={e => setEditContactName(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  </div>
                </>
              )}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">{t.phone}</label>
                <input type="tel" value={editPhone} onChange={e => setEditPhone(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              {editError && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{editError}</p>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setEditUser(null)}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition-colors">
                {t.cancel}
              </button>
              <button onClick={handleSave} disabled={saving}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {saving ? t.saving : t.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
