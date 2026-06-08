'use client'

import { useRef, useState } from 'react'
import type { Lang } from '@/components/scoring/types'
import type { Coach } from '@/components/admin/types'
import { PhotoAvatar } from './GymnastsTab'
import { normalizeForSearch } from '@/lib/normalizeString'
import { LicenciaChip } from './shared/LicenciaChip'
import { INPUT_CLS } from '@/lib/uiConstants'
import { useT } from '@/lib/useT'

// ─── coach form ───────────────────────────────────────────────────────────────

type FormState = { full_name: string; licence: string }
const EMPTY_FORM: FormState = { full_name: '', licence: '' }

function CoachForm({ lang, initial, onSave, onCancel }: {
  lang: Lang
  initial: FormState
  onSave: (f: FormState) => void
  onCancel: () => void
}) {
  const t = useT('CoachesTab', lang)
  const [form, setForm] = useState<FormState>(initial)
  const inputCls = INPUT_CLS

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.full_name.trim()) return
    onSave({ full_name: form.full_name.trim(), licence: form.licence.trim() })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">{t.fullName} *</label>
          <input type="text" required value={form.full_name}
            onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
            className={inputCls} autoFocus />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">{t.licence}</label>
          <input type="text" value={form.licence}
            onChange={e => setForm(f => ({ ...f, licence: e.target.value }))}
            className={inputCls} />
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

// ─── tab ─────────────────────────────────────────────────────────────────────

export default function CoachesTab({
  lang, coaches, onAdd, onUpdate, onDelete, onUploadPhoto, onRemovePhoto, onUploadLicencia,
}: {
  lang: Lang
  coaches: Coach[]
  onAdd: (c: Omit<Coach, 'id' | 'club_id'>) => void
  onUpdate: (id: string, c: Omit<Coach, 'id' | 'club_id'>) => void
  onDelete: (id: string) => void
  onUploadPhoto: (id: string, file: File) => Promise<void>
  onRemovePhoto: (id: string) => Promise<void>
  onUploadLicencia: (id: string, file: File) => Promise<void>
}) {
  const t = useT('CoachesTab', lang)
  const licenciaLabels = { view: t.licencia, upload: t.uploadLicencia, replace: t.replaceLicencia }
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const sorted = [...coaches].sort((a, b) => a.full_name.localeCompare(b.full_name))
  const q = normalizeForSearch(search)
  const filtered = q ? sorted.filter(c => normalizeForSearch(c.full_name).includes(q)) : sorted

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-slate-500">{t.coaches(coaches.length)}</p>
        {!showAdd && (
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            {t.add}
          </button>
        )}
      </div>

      {coaches.length > 0 && (
        <div className="relative mb-4">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder={t.search}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
      )}

      {showAdd && (
        <div className="mb-4">
          <CoachForm lang={lang} initial={EMPTY_FORM}
            onCancel={() => setShowAdd(false)}
            onSave={f => { onAdd({ full_name: f.full_name, licence: f.licence || null, photo_url: null }); setShowAdd(false) }} />
        </div>
      )}

      {filtered.length === 0 && !showAdd ? (
        <p className="text-sm text-slate-400 text-center py-16">{t.empty}</p>
      ) : (
        <div className="space-y-2">
          {filtered.map(c =>
            editingId === c.id ? (
              <CoachForm key={c.id} lang={lang}
                initial={{ full_name: c.full_name, licence: c.licence ?? '' }}
                onCancel={() => setEditingId(null)}
                onSave={f => { onUpdate(c.id, { full_name: f.full_name, licence: f.licence || null, photo_url: c.photo_url }); setEditingId(null) }} />
            ) : (
              <div key={c.id} className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-3">
                <PhotoAvatar
                  photoUrl={c.photo_url}
                  initials={c.full_name.charAt(0).toUpperCase()}
                  onUpload={file => onUploadPhoto(c.id, file)}
                  onRemove={() => onRemovePhoto(c.id)}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{c.full_name}</p>
                  {c.licence && <p className="text-xs text-slate-400">{c.licence}</p>}
                </div>
                <LicenciaChip
                  url={c.licencia_url}
                  onUpload={file => onUploadLicencia(c.id, file)}
                  labels={licenciaLabels}
                />
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => setEditingId(c.id)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                    </svg>
                  </button>
                  <button onClick={() => { if (confirm(t.confirmDelete)) onDelete(c.id) }}
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
