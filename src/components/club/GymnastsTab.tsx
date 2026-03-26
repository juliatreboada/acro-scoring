'use client'

import { useState } from 'react'
import type { Lang } from '@/components/aj-scoring/types'
import type { Gymnast } from '@/components/admin/types'

const T = {
  en: {
    addGymnast: 'Add gymnast',
    firstName: 'First name',
    lastName1: 'First surname',
    lastName2: 'Second surname',
    dob: 'Date of birth',
    save: 'Save',
    cancel: 'Cancel',
    empty: 'No gymnasts yet. Add your first gymnast to get started.',
    yrs: 'yrs',
    confirmDelete: 'Remove this gymnast from the roster?',
  },
  es: {
    addGymnast: 'Añadir gimnasta',
    firstName: 'Nombre',
    lastName1: 'Primer apellido',
    lastName2: 'Segundo apellido',
    dob: 'Fecha de nacimiento',
    save: 'Guardar',
    cancel: 'Cancelar',
    empty: 'Aún no hay gimnastas. Añade el primero para empezar.',
    yrs: 'años',
    confirmDelete: '¿Eliminar este gimnasta del registro?',
  },
}

function computeAge(dob: string): number {
  const today = new Date()
  const birth = new Date(dob + 'T00:00:00')
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

export function gymnastFullName(g: Gymnast): string {
  return `${g.first_name} ${g.last_name_1} ${g.last_name_2}`.trim()
}

type FormState = { first_name: string; last_name_1: string; last_name_2: string; date_of_birth: string }
const EMPTY_FORM: FormState = { first_name: '', last_name_1: '', last_name_2: '', date_of_birth: '' }

function GymnastForm({ lang, initial, onSave, onCancel }: {
  lang: Lang
  initial: FormState
  onSave: (f: FormState) => void
  onCancel: () => void
}) {
  const t = T[lang]
  const [form, setForm] = useState<FormState>(initial)
  const inputCls = 'w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.first_name.trim() || !form.last_name_1.trim() || !form.date_of_birth) return
    onSave({ first_name: form.first_name.trim(), last_name_1: form.last_name_1.trim(), last_name_2: form.last_name_2.trim(), date_of_birth: form.date_of_birth })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">{t.firstName} *</label>
          <input type="text" required value={form.first_name} onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))} className={inputCls} autoFocus />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">{t.lastName1} *</label>
          <input type="text" required value={form.last_name_1} onChange={(e) => setForm((f) => ({ ...f, last_name_1: e.target.value }))} className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">{t.lastName2}</label>
          <input type="text" value={form.last_name_2} onChange={(e) => setForm((f) => ({ ...f, last_name_2: e.target.value }))} className={inputCls} />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">{t.dob} *</label>
        <input type="date" required value={form.date_of_birth} onChange={(e) => setForm((f) => ({ ...f, date_of_birth: e.target.value }))} className={inputCls} />
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

export default function GymnastsTab({
  lang, gymnasts, onAdd, onUpdate, onDelete,
}: {
  lang: Lang
  gymnasts: Gymnast[]
  onAdd: (g: Omit<Gymnast, 'id' | 'club_id'>) => void
  onUpdate: (id: string, g: Omit<Gymnast, 'id' | 'club_id'>) => void
  onDelete: (id: string) => void
}) {
  const t = T[lang]
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const sorted = [...gymnasts].sort((a, b) => (a.last_name_1 ?? '').localeCompare(b.last_name_1 ?? ''))

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-slate-500">{gymnasts.length} gymnast{gymnasts.length !== 1 ? 's' : ''}</p>
        {!showAdd && (
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            {t.addGymnast}
          </button>
        )}
      </div>

      {showAdd && (
        <div className="mb-4">
          <GymnastForm lang={lang} initial={EMPTY_FORM}
            onCancel={() => setShowAdd(false)}
            onSave={(f) => { onAdd(f); setShowAdd(false) }} />
        </div>
      )}

      {sorted.length === 0 && !showAdd ? (
        <p className="text-sm text-slate-400 text-center py-16">{t.empty}</p>
      ) : (
        <div className="space-y-2">
          {sorted.map((g) =>
            editingId === g.id ? (
              <GymnastForm key={g.id} lang={lang}
                initial={{ first_name: g.first_name, last_name_1: g.last_name_1, last_name_2: g.last_name_2, date_of_birth: g.date_of_birth }}
                onCancel={() => setEditingId(null)}
                onSave={(f) => { onUpdate(g.id, f); setEditingId(null) }} />
            ) : (
              <div key={g.id} className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-3">
                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-sm font-semibold text-slate-500">
                  {g.first_name[0]}{g.last_name_1[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{gymnastFullName(g)}</p>
                  <p className="text-xs text-slate-400">
                    {new Date(g.date_of_birth + 'T00:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                    {' · '}
                    {computeAge(g.date_of_birth)} {t.yrs}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => setEditingId(g.id)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                    </svg>
                  </button>
                  <button onClick={() => { if (confirm(t.confirmDelete)) onDelete(g.id) }}
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
