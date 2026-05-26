'use client'

import { useState } from 'react'
import type { Lang } from '@/components/scoring/types'
import { INPUT_CLS } from '@/lib/uiConstants'

const T = {
  en: {
    name: 'Full name',
    email: 'Email',
    phone: 'Phone',
    licence: 'Licence no.',
    send: 'Send invitation',
    cancel: 'Cancel',
    inviteSent: 'Invitation sent to',
    inviteInfo: 'The judge will receive an email to set up their account and will appear in the list once they accept.',
  },
  es: {
    name: 'Nombre completo',
    email: 'Email',
    phone: 'Teléfono',
    licence: 'Nº licencia',
    send: 'Enviar invitación',
    cancel: 'Cancelar',
    inviteSent: 'Invitación enviada a',
    inviteInfo: 'El juez recibirá un email para crear su cuenta y aparecerá en la lista cuando acepte.',
  },
}

export type InviteForm = { full_name: string; email: string; phone: string; licence: string }
const EMPTY_INVITE: InviteForm = { full_name: '', email: '', phone: '', licence: '' }

export function InviteJudgeForm({ lang, onSend, onCancel }: {
  lang: Lang
  onSend: (f: InviteForm) => Promise<void>
  onCancel: () => void
}) {
  const t = T[lang]
  const [form, setForm] = useState<InviteForm>(EMPTY_INVITE)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputCls = INPUT_CLS

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
