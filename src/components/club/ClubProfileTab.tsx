'use client'

import { useRef, useState } from 'react'
import type { Lang } from '@/components/aj-scoring/types'
import type { Club } from '@/components/admin/types'
import ClickableImg from '@/components/shared/ClickableImg'

const T = {
  en: {
    clubName: 'Club name',
    contactName: 'Contact person',
    phone: 'Phone',
    save: 'Save changes',
    saved: 'Saved',
    cancel: 'Cancel',
    edit: 'Edit profile',
    avatar: 'Change photo',
    uploading: 'Uploading…',
  },
  es: {
    clubName: 'Nombre del club',
    contactName: 'Persona de contacto',
    phone: 'Teléfono',
    save: 'Guardar cambios',
    saved: 'Guardado',
    cancel: 'Cancelar',
    edit: 'Editar perfil',
    avatar: 'Cambiar foto',
    uploading: 'Subiendo…',
  },
}

export default function ClubProfileTab({ lang, club, onUpdate, onUploadAvatar }: {
  lang: Lang
  club: Club
  onUpdate: (data: Partial<Pick<Club, 'club_name' | 'contact_name' | 'phone'>>) => void
  onUploadAvatar: (file: File) => Promise<void>
}) {
  const t = T[lang]
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ club_name: club.club_name, contact_name: club.contact_name ?? '', phone: club.phone ?? '' })
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function startEdit() {
    setForm({ club_name: club.club_name, contact_name: club.contact_name ?? '', phone: club.phone ?? '' })
    setEditing(true)
    setSaved(false)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    onUpdate({ club_name: form.club_name, contact_name: form.contact_name || null, phone: form.phone || null })
    setEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      await onUploadAvatar(file)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const inputCls = 'w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'

  return (
    <div className="max-w-lg">
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        {/* avatar */}
        <div className="bg-slate-50 border-b border-slate-100 px-5 py-6 flex items-center gap-4">
          <div className="relative shrink-0">
            {club.avatar_url ? (
              <ClickableImg src={club.avatar_url} alt={club.club_name}
                className="w-16 h-16 rounded-2xl object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-slate-200 flex items-center justify-center text-2xl font-bold text-slate-400">
                {club.club_name.charAt(0)}
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
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
          <div>
            <p className="text-base font-bold text-slate-800">{club.club_name}</p>
            {club.contact_name && <p className="text-sm text-slate-400">{club.contact_name}</p>}
            {uploading && <p className="text-xs text-blue-500 mt-0.5">{t.uploading}</p>}
          </div>
        </div>

        <div className="px-5 py-5">
          {editing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">{t.clubName}</label>
                <input type="text" required value={form.club_name}
                  onChange={e => setForm(f => ({ ...f, club_name: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">{t.contactName}</label>
                <input type="text" value={form.contact_name}
                  onChange={e => setForm(f => ({ ...f, contact_name: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">{t.phone}</label>
                <input type="tel" value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className={inputCls} />
              </div>
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
                { label: t.clubName,     value: club.club_name },
                { label: t.contactName,  value: club.contact_name },
                { label: t.phone,        value: club.phone },
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
