'use client'

import { useState } from 'react'
import type { Lang } from '@/components/aj-scoring/types'
import type { Judge } from '@/components/admin/types'

const T = {
  en: {
    addJudge: 'Add judge',
    name: 'Full name',
    email: 'Email',
    phone: 'Phone',
    licence: 'Licence no.',
    save: 'Save',
    cancel: 'Cancel',
    empty: 'No judges registered yet. Add at least one — competitions require clubs to provide judges.',
    confirmDelete: 'Remove this judge from the registry?',
  },
  es: {
    addJudge: 'Añadir juez',
    name: 'Nombre completo',
    email: 'Email',
    phone: 'Teléfono',
    licence: 'Nº licencia',
    save: 'Guardar',
    cancel: 'Cancelar',
    empty: 'Aún no hay jueces registrados. Añade al menos uno — las competiciones requieren que los clubs aporten jueces.',
    confirmDelete: '¿Eliminar este juez del registro?',
  },
}

type FormState = { full_name: string; email: string; phone: string; licence: string }
const EMPTY: FormState = { full_name: '', email: '', phone: '', licence: '' }

function JudgeForm({ lang, initial, onSave, onCancel }: {
  lang: Lang
  initial: FormState
  onSave: (f: FormState) => void
  onCancel: () => void
}) {
  const t = T[lang]
  const [form, setForm] = useState<FormState>(initial)
  const inputCls = 'w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'

  function set(k: keyof FormState, v: string) { setForm((f) => ({ ...f, [k]: v })) }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.full_name.trim()) return
    onSave({ full_name: form.full_name.trim(), email: form.email.trim(), phone: form.phone.trim(), licence: form.licence.trim() })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-slate-500 mb-1">{t.name} *</label>
          <input type="text" required value={form.full_name} onChange={(e) => set('full_name', e.target.value)} className={inputCls} autoFocus />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">{t.email}</label>
          <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className={inputCls} />
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
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel}
          className="px-4 py-2 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-100 transition-all">
          {t.cancel}
        </button>
        <button type="submit"
          className="px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-all">
          {t.save}
        </button>
      </div>
    </form>
  )
}

export default function ClubJudgesTab({ lang, judges, onAdd, onUpdate, onDelete }: {
  lang: Lang
  judges: Judge[]
  onAdd: (f: Omit<Judge, 'id' | 'avatar_url'>) => void
  onUpdate: (id: string, f: Omit<Judge, 'id' | 'avatar_url'>) => void
  onDelete: (id: string) => void
}) {
  const t = T[lang]
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const sorted = [...judges].sort((a, b) => a.full_name.localeCompare(b.full_name))

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-slate-500">{judges.length} judge{judges.length !== 1 ? 's' : ''}</p>
        {!showAdd && (
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            {t.addJudge}
          </button>
        )}
      </div>

      {showAdd && (
        <div className="mb-4">
          <JudgeForm lang={lang} initial={EMPTY}
            onCancel={() => setShowAdd(false)}
            onSave={(f) => {
              const duplicate = judges.find((j) =>
                (f.licence && j.licence && j.licence === f.licence) ||
                (f.email && j.email && j.email.toLowerCase() === f.email.toLowerCase())
              )
              if (duplicate) { alert(`A judge with this ${f.licence ? 'licence' : 'email'} already exists.`); return }
              onAdd({ full_name: f.full_name, email: f.email || null, phone: f.phone || null, licence: f.licence || null })
              setShowAdd(false)
            }} />
        </div>
      )}

      {sorted.length === 0 && !showAdd ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-6 text-center">
          <p className="text-sm text-amber-700">{t.empty}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((judge) =>
            editingId === judge.id ? (
              <JudgeForm key={judge.id} lang={lang}
                initial={{ full_name: judge.full_name, email: judge.email ?? '', phone: judge.phone ?? '', licence: judge.licence ?? '' }}
                onCancel={() => setEditingId(null)}
                onSave={(f) => {
                  onUpdate(judge.id, { full_name: f.full_name, email: f.email || null, phone: f.phone || null, licence: f.licence || null })
                  setEditingId(null)
                }} />

            ) : (
              <div key={judge.id} className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-3">
                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-sm font-semibold text-slate-500">
                  {judge.full_name.charAt(0)}
                </div>
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
                  <button onClick={() => setEditingId(judge.id)}
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
