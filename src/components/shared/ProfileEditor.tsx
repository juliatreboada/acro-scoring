'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase'
import type { Lang } from '@/components/aj-scoring/types'
import ClickableImg from '@/components/shared/ClickableImg'

// ─── translations ─────────────────────────────────────────────────────────────

const T = {
  en: {
    profile:     'Profile',
    fullName:    'Full name',
    email:       'Email',
    phone:       'Phone',
    licence:     'Licence',
    edit:        'Edit profile',
    save:        'Save changes',
    cancel:      'Cancel',
    saved:       'Saved',
    uploading:   'Uploading…',
    changePhoto: 'Change photo',
    loading:     'Loading…',
  },
  es: {
    profile:     'Perfil',
    fullName:    'Nombre completo',
    email:       'Email',
    phone:       'Teléfono',
    licence:     'Licencia',
    edit:        'Editar perfil',
    save:        'Guardar cambios',
    cancel:      'Cancelar',
    saved:       'Guardado',
    uploading:   'Subiendo…',
    changePhoto: 'Cambiar foto',
    loading:     'Cargando…',
  },
}

// ─── types ────────────────────────────────────────────────────────────────────

type ProfileData = {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  licence?: string | null   // judges only
  avatar_url: string | null
  role: 'judge' | 'admin'
}

// ─── component ────────────────────────────────────────────────────────────────

export default function ProfileEditor({ lang }: { lang: Lang }) {
  const t = T[lang]
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading]     = useState(true)
  const [profile, setProfile]     = useState<ProfileData | null>(null)
  const [editing, setEditing]     = useState(false)
  const [saved, setSaved]         = useState(false)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({ full_name: '', phone: '', licence: '' })

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data: prof } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (!prof) { setLoading(false); return }

      const role = prof.role as 'judge' | 'admin'
      const table = role === 'judge' ? 'judges' : 'admins'
      const fields = role === 'judge'
        ? 'id,full_name,phone,licence,avatar_url'
        : 'id,full_name,phone,avatar_url'

      const { data: row } = await supabase.from(table as 'judges').select(fields).eq('id', user.id).single()

      setProfile({
        id:         user.id,
        full_name:  (row as any)?.full_name ?? '',
        email:      user.email ?? null,
        phone:      (row as any)?.phone ?? null,
        licence:    role === 'judge' ? ((row as any)?.licence ?? null) : undefined,
        avatar_url: (row as any)?.avatar_url ?? null,
        role,
      })
      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function startEdit() {
    if (!profile) return
    setForm({
      full_name: profile.full_name,
      phone:     profile.phone ?? '',
      licence:   profile.licence ?? '',
    })
    setEditing(true)
    setSaved(false)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!profile) return

    const table = profile.role === 'judge' ? 'judges' : 'admins'
    const updates: Record<string, string | null> = {
      full_name: form.full_name.trim() || profile.full_name,
      phone:     form.phone.trim() || null,
    }
    if (profile.role === 'judge') updates.licence = form.licence.trim() || null

    await supabase.from(table as 'judges').update(updates as any).eq('id', profile.id)

    setProfile(prev => prev ? {
      ...prev,
      full_name: updates.full_name as string,
      phone:     updates.phone,
      ...(prev.role === 'judge' ? { licence: updates.licence } : {}),
    } : prev)
    setEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !profile) return
    setUploading(true)
    try {
      const bucket = profile.role === 'judge' ? 'judge-photos' : 'admin-avatars'
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `${profile.id}/avatar.${ext}`
      await supabase.storage.from(bucket).upload(path, file, { upsert: true })
      const { data } = supabase.storage.from(bucket).getPublicUrl(path)
      const url = data.publicUrl + `?t=${Date.now()}`
      const table = profile.role === 'judge' ? 'judges' : 'admins'
      await supabase.from(table as 'judges').update({ avatar_url: url } as any).eq('id', profile.id)
      setProfile(prev => prev ? { ...prev, avatar_url: url } : prev)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const inputCls = 'w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!profile) return null

  const initials = profile.full_name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">

        {/* avatar + name */}
        <div className="bg-slate-50 border-b border-slate-100 px-5 py-6 flex items-center gap-4">
          <div className="relative shrink-0">
            {profile.avatar_url ? (
              <ClickableImg src={profile.avatar_url} alt={profile.full_name}
                className="w-16 h-16 rounded-2xl object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-slate-200 flex items-center justify-center text-xl font-bold text-slate-400">
                {initials}
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              title={t.changePhoto}
              className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-50 shadow-sm">
              {uploading ? (
                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                </svg>
              )}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <div className="min-w-0">
            <p className="text-base font-bold text-slate-800 truncate">{profile.full_name}</p>
            {profile.email && <p className="text-sm text-slate-400 truncate">{profile.email}</p>}
            {uploading && <p className="text-xs text-blue-500 mt-0.5">{t.uploading}</p>}
          </div>
        </div>

        {/* fields */}
        <div className="px-5 py-5">
          {editing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">{t.fullName} *</label>
                <input type="text" required value={form.full_name}
                  onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">{t.email}</label>
                <input type="email" disabled value={profile.email ?? ''} className={inputCls + ' opacity-50 cursor-not-allowed'} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">{t.phone}</label>
                <input type="tel" value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className={inputCls} />
              </div>
              {profile.role === 'judge' && (
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">{t.licence}</label>
                  <input type="text" value={form.licence}
                    onChange={e => setForm(f => ({ ...f, licence: e.target.value }))} className={inputCls} />
                </div>
              )}
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setEditing(false)}
                  className="flex-1 py-2 rounded-xl text-sm text-slate-500 hover:bg-slate-100 transition-all">
                  {t.cancel}
                </button>
                <button type="submit"
                  className="flex-1 py-2 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-all">
                  {t.save}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              {[
                { label: t.fullName, value: profile.full_name },
                { label: t.email,    value: profile.email },
                { label: t.phone,    value: profile.phone },
                ...(profile.role === 'judge' ? [{ label: t.licence, value: profile.licence }] : []),
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs font-medium text-slate-400">{label}</p>
                  <p className="text-sm text-slate-800 mt-0.5">{value ?? <span className="text-slate-300">—</span>}</p>
                </div>
              ))}
              <div className="flex items-center gap-3 pt-2">
                <button onClick={startEdit}
                  className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all">
                  {t.edit}
                </button>
                {saved && <span className="text-xs text-green-600 font-medium">{t.saved}</span>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
