'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useProfile } from '@/contexts/ProfileContext'
import type { Lang } from '@/components/scoring/types'
import ClickableImg from '@/components/shared/ClickableImg'
import { LicenciaChip } from '@/components/club/shared/LicenciaChip'
import { INPUT_CLS } from '@/lib/uiConstants'
import { useT } from '@/lib/useT'

// ─── types ────────────────────────────────────────────────────────────────────

type ProfileData = {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  licence?: string | null     // judges only — licence number text
  licencia_url?: string | null // judges only — licence document PDF
  sport_type?: string | null  // judges only
  avatar_url: string | null
  role: 'judge' | 'admin'
}

// ─── component ────────────────────────────────────────────────────────────────

export default function ProfileEditor({ lang }: { lang: Lang }) {
  const t = useT('ProfileEditor', lang)
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { activeProfile } = useProfile()

  const licenciaInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading]               = useState(true)
  const [profile, setProfile]               = useState<ProfileData | null>(null)
  const [editing, setEditing]               = useState(false)
  const [saved, setSaved]                   = useState(false)
  const [uploading, setUploading]           = useState(false)
  const [uploadingLicencia, setUploadingLicencia] = useState(false)
  const [form, setForm] = useState({ full_name: '', phone: '', licence: '' })

  useEffect(() => {
    async function load() {
      if (!activeProfile) return
      const { data: { user } } = await supabase.auth.getUser()

      const role = activeProfile.role as 'judge' | 'admin'
      const table = role === 'judge' ? 'judges' : 'admins'
      const fields = role === 'judge'
        ? 'id,full_name,phone,licence,licencia_url,sport_type,avatar_url'
        : 'id,full_name,phone,avatar_url'

      const { data: row } = await supabase.from(table as 'judges').select(fields).eq('id', activeProfile.id).single()

      setProfile({
        id:           activeProfile.id,
        full_name:    (row as any)?.full_name ?? '',
        email:        user?.email ?? null,
        phone:        (row as any)?.phone ?? null,
        licence:      role === 'judge' ? ((row as any)?.licence ?? null) : undefined,
        licencia_url: role === 'judge' ? ((row as any)?.licencia_url ?? null) : undefined,
        sport_type:   role === 'judge' ? ((row as any)?.sport_type ?? 'acro') : undefined,
        avatar_url:   (row as any)?.avatar_url ?? null,
        role,
      })
      setLoading(false)
    }
    load()
  }, [activeProfile?.id]) // eslint-disable-line react-hooks/exhaustive-deps

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

    const { error } = await supabase.from(table as 'judges').update(updates as any).eq('id', profile.id)
    if (error) return

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

  async function handleRemoveAvatar() {
    if (!profile) return
    const table = profile.role === 'judge' ? 'judges' : 'admins'
    await supabase.from(table as 'judges').update({ avatar_url: null } as any).eq('id', profile.id)
    setProfile(prev => prev ? { ...prev, avatar_url: null } : prev)
  }

  async function handleLicenciaUpload(file: File) {
    if (!profile || profile.role !== 'judge') return
    setUploadingLicencia(true)
    try {
      const ext = file.name.split('.').pop() ?? 'pdf'
      const path = `${profile.id}/licencia.${ext}`
      await supabase.storage.from('judge-licencias').upload(path, file, { upsert: true })
      const { data } = supabase.storage.from('judge-licencias').getPublicUrl(path)
      const url = data.publicUrl + `?t=${Date.now()}`
      await supabase.from('judges').update({ licencia_url: url } as any).eq('id', profile.id)
      setProfile(prev => prev ? { ...prev, licencia_url: url } : prev)
    } finally {
      setUploadingLicencia(false)
    }
  }

  const inputCls = INPUT_CLS

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
          <div className="relative shrink-0 group">
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
            {profile.avatar_url && (
              <button
                onClick={handleRemoveAvatar}
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all shadow-sm z-10">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-base font-bold text-slate-800 truncate">{profile.full_name}</p>
              {profile.role === 'judge' && profile.sport_type && (
                <span className={[
                  'px-2 py-0.5 rounded-md text-xs font-bold shrink-0',
                  profile.sport_type === 'rg'
                    ? 'bg-violet-100 text-violet-700'
                    : 'bg-blue-100 text-blue-700',
                ].join(' ')}>
                  {profile.sport_type === 'rg' ? 'RG' : 'Acro'}
                </span>
              )}
            </div>
            {profile.email && <p className="text-sm text-slate-400 truncate">{profile.email}</p>}
            {uploading && <p className="text-xs text-blue-500 mt-0.5">{t.uploading}</p>}
          </div>
        </div>

        {/* fields */}
        <div className="px-5 py-5">
          {profile.role === 'judge' && (!profile.avatar_url || !profile.licencia_url) && (
            <div className="mb-4 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
              <svg className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <div>
                <p className="text-xs font-semibold text-amber-800">{t.incompleteProfile}</p>
                <ul className="mt-0.5">
                  {!profile.avatar_url && <li className="text-xs text-amber-700">· {t.missingPhoto}</li>}
                  {!profile.licencia_url && <li className="text-xs text-amber-700">· {t.missingLicencia}</li>}
                </ul>
              </div>
            </div>
          )}
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
              {profile.role === 'judge' && (
                <div>
                  <p className="text-xs font-medium text-slate-400 mb-1.5">{t.licenciaDoc}</p>
                  {uploadingLicencia ? (
                    <span className="text-xs text-blue-500">{t.uploading}</span>
                  ) : (
                    <LicenciaChip
                      url={profile.licencia_url}
                      onUpload={handleLicenciaUpload}
                      labels={{ view: t.viewLicencia, upload: t.uploadLicencia, replace: t.replaceLicencia }}
                    />
                  )}
                </div>
              )}
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
