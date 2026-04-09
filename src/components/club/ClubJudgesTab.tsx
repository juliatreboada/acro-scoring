'use client'

import { useRef, useState } from 'react'
import type { Lang } from '@/components/aj-scoring/types'
import type { Judge } from '@/components/admin/types'

const T = {
  en: {
    inviteJudge: 'Invite new judge',
    name: 'Full name',
    email: 'Email',
    phone: 'Phone',
    licence: 'Licence no.',
    send: 'Send invitation',
    cancel: 'Cancel',
    inviteSent: 'Invitation sent to',
    inviteInfo: 'The judge will receive an email to set up their account and will appear in the list once they accept.',
    empty: 'No judges in the system yet.',
    confirmDelete: 'Remove this judge from the system?',
    edit: 'Edit',
    save: 'Save',
    search: 'Search judges…',
    judges: (n: number) => `${n} judge${n !== 1 ? 's' : ''} in pool`,
    noResults: 'No judges match your search.',
  },
  es: {
    inviteJudge: 'Invitar nuevo juez',
    name: 'Nombre completo',
    email: 'Email',
    phone: 'Teléfono',
    licence: 'Nº licencia',
    send: 'Enviar invitación',
    cancel: 'Cancelar',
    inviteSent: 'Invitación enviada a',
    inviteInfo: 'El juez recibirá un email para crear su cuenta y aparecerá en la lista cuando acepte.',
    empty: 'Aún no hay jueces en el sistema.',
    confirmDelete: '¿Eliminar este juez del sistema?',
    edit: 'Editar',
    save: 'Guardar',
    search: 'Buscar jueces…',
    judges: (n: number) => `${n} jue${n !== 1 ? 'ces' : 'z'}`,
    noResults: 'Ningún juez coincide con tu búsqueda.',
  },
}

type InviteForm = { full_name: string; email: string; phone: string; licence: string }
const EMPTY_INVITE: InviteForm = { full_name: '', email: '', phone: '', licence: '' }
type EditForm = { full_name: string; phone: string; licence: string }

function InviteJudgeForm({ lang, onSend, onCancel }: {
  lang: Lang
  onSend: (f: InviteForm) => Promise<void>
  onCancel: () => void
}) {
  const t = T[lang]
  const [form, setForm] = useState<InviteForm>(EMPTY_INVITE)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputCls = 'w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'

  function set(k: keyof InviteForm, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.full_name.trim() || !form.email.trim()) return
    setSending(true); setError(null)
    try {
      await onSend({ ...form, full_name: form.full_name.trim(), email: form.email.trim() })
      setSent(form.email.trim())
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-4 space-y-2">
        <p className="text-sm font-semibold text-green-800">{t.inviteSent} {sent}</p>
        <p className="text-xs text-green-700">{t.inviteInfo}</p>
        <div className="flex justify-end">
          <button onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm font-medium text-green-700 hover:bg-green-100 transition-all">
            {t.cancel}
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-500 mb-1">{t.name} *</label>
          <input type="text" required value={form.full_name} onChange={(e) => set('full_name', e.target.value)} className={inputCls} autoFocus />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-500 mb-1">{t.email} *</label>
          <input type="email" required value={form.email} onChange={(e) => set('email', e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">{t.phone}</label>
          <input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">{t.licence}</label>
          <input type="text" value={form.licence} onChange={(e) => set('licence', e.target.value)} className={inputCls} />
        </div>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel}
          className="px-4 py-2 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-100 transition-all">
          {t.cancel}
        </button>
        <button type="submit" disabled={sending}
          className="px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-all">
          {t.send}
        </button>
      </div>
    </form>
  )
}

function JudgeAvatar({ judge, onUpload }: { judge: Judge; onUpload: (file: File) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <div className="relative shrink-0 group cursor-pointer" onClick={() => inputRef.current?.click()}>
      <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-sm font-semibold text-slate-500 overflow-hidden">
        {judge.avatar_url
          ? <img src={judge.avatar_url} alt={judge.full_name} className="w-full h-full object-cover" />
          : judge.full_name.charAt(0)}
      </div>
      <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
        </svg>
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); if (inputRef.current) inputRef.current.value = '' }} />
    </div>
  )
}

export default function ClubJudgesTab({ lang, judges, onInvite, onUpdate, onDelete, onUploadPhoto }: {
  lang: Lang
  judges: Judge[]
  onInvite: (f: { full_name: string; email: string; phone?: string; licence?: string }) => Promise<void>
  onUpdate: (id: string, f: Omit<Judge, 'id' | 'avatar_url'>) => void
  onDelete: (id: string) => void
  onUploadPhoto: (id: string, file: File) => Promise<void>
}) {
  const t = T[lang]
  const [showInvite, setShowInvite] = useState(false)
  const [query, setQuery] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<EditForm>({ full_name: '', phone: '', licence: '' })

  const inputCls = 'w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'

  const q = query.trim().toLowerCase()
  const filtered = [...judges]
    .sort((a, b) => a.full_name.localeCompare(b.full_name))
    .filter(j =>
      !q ||
      j.full_name.toLowerCase().includes(q) ||
      (j.email ?? '').toLowerCase().includes(q) ||
      (j.licence ?? '').toLowerCase().includes(q)
    )

  function startEdit(judge: Judge) {
    setEditingId(judge.id)
    setEditForm({ full_name: judge.full_name, phone: judge.phone ?? '', licence: judge.licence ?? '' })
  }

  function saveEdit(judge: Judge) {
    onUpdate(judge.id, { full_name: editForm.full_name, email: judge.email, phone: editForm.phone || null, licence: editForm.licence || null })
    setEditingId(null)
  }

  return (
    <div>
      {/* header row */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">{t.judges(judges.length)}</p>
        {!showInvite && (
          <button onClick={() => setShowInvite(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            {t.inviteJudge}
          </button>
        )}
      </div>

      {/* invite form */}
      {showInvite && (
        <div className="mb-4">
          <InviteJudgeForm
            lang={lang}
            onSend={async (f) => onInvite({ full_name: f.full_name, email: f.email, phone: f.phone || undefined, licence: f.licence || undefined })}
            onCancel={() => setShowInvite(false)}
          />
        </div>
      )}

      {/* search bar */}
      {judges.length > 0 && (
        <div className="relative mb-4">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t.search}
            className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}

      {/* list */}
      {judges.length === 0 && !showInvite ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-6 text-center">
          <p className="text-sm text-amber-700">{t.empty}</p>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-8">{t.noResults}</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((judge) =>
            editingId === judge.id ? (
              <div key={judge.id} className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-500 mb-1">{t.name}</label>
                    <input type="text" value={editForm.full_name} onChange={e => setEditForm(f => ({ ...f, full_name: e.target.value }))} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">{t.phone}</label>
                    <input type="tel" value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">{t.licence}</label>
                    <input type="text" value={editForm.licence} onChange={e => setEditForm(f => ({ ...f, licence: e.target.value }))} className={inputCls} />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setEditingId(null)}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-100 transition-all">
                    {t.cancel}
                  </button>
                  <button onClick={() => saveEdit(judge)}
                    className="px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-all">
                    {t.save}
                  </button>
                </div>
              </div>
            ) : (
              <div key={judge.id} className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-3">
                <JudgeAvatar judge={judge} onUpload={(file) => onUploadPhoto(judge.id, file)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-slate-800">{judge.full_name}</p>
                    {judge.licence && (
                      <span className="text-xs font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{judge.licence}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-3 mt-0.5">
                    {judge.email && <p className="text-xs text-slate-400">{judge.email}</p>}
                    {judge.phone && <p className="text-xs text-slate-400">{judge.phone}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => startEdit(judge)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                    </svg>
                  </button>
                  <button onClick={() => { if (confirm(t.confirmDelete)) onDelete(judge.id) }}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  )
}
