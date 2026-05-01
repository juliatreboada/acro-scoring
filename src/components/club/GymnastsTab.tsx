'use client'

import { useRef, useState } from 'react'
import * as XLSX from 'xlsx'
import type { Lang } from '@/components/scoring/types'
import type { Gymnast } from '@/components/admin/types'

const T = {
  en: {
    addGymnast: 'Add gymnast',
    search: 'Search by name or surname…',
    importGymnasts: 'Import from Excel RFEG',
    importTitle: 'Import gymnasts',
    importFound: (n: number) => `${n} gymnast${n !== 1 ? 's' : ''} found in file`,
    importDuplicateNote: (n: number) => `${n} already exist and will be skipped`,
    importDuplicate: 'Already exists',
    importConfirm: 'Add gymnasts',
    importConfirming: 'Saving…',
    importCancel: 'Cancel',
    importEmpty: 'No valid gymnasts found in the file.',
    importDone: (n: number) => `${n} gymnast${n !== 1 ? 's' : ''} added.`,
    licenciaNacional: 'Nat. Licence',
    firstName: 'First name',
    lastName1: 'First surname',
    lastName2: 'Second surname',
    dob: 'Date of birth',
    save: 'Save',
    cancel: 'Cancel',
    empty: 'No gymnasts yet. Add your first gymnast to get started.',
    yrs: 'yrs',
    confirmDelete: 'Remove this gymnast from the roster?',
    gymnasts: (n: number) => `${n} gymnast${n !== 1 ? 's' : ''}`,
    licencia: 'Licence',
    uploadLicencia: 'Upload licence',
    replaceLicencia: 'Replace',
    removeLicencia: 'Remove licence',
  },
  es: {
    addGymnast: 'Añadir gimnasta',
    search: 'Buscar por nombre o apellido…',
    importGymnasts: 'Importar desde Excel de licencias RFEG',
    importTitle: 'Importar gimnastas',
    importFound: (n: number) => `${n} gimnasta${n !== 1 ? 's' : ''} encontrado${n !== 1 ? 's' : ''} en el archivo`,
    importDuplicateNote: (n: number) => `${n} ya existen y se omitirán`,
    importDuplicate: 'Ya existe',
    importConfirm: 'Añadir gimnastas',
    importConfirming: 'Guardando…',
    importCancel: 'Cancelar',
    importEmpty: 'No se encontraron gimnastas válidos en el archivo.',
    importDone: (n: number) => `${n} gimnasta${n !== 1 ? 's' : ''} añadido${n !== 1 ? 's' : ''}.`,
    licenciaNacional: 'Lic. Nacional',
    firstName: 'Nombre',
    lastName1: 'Primer apellido',
    lastName2: 'Segundo apellido',
    dob: 'Fecha de nacimiento',
    save: 'Guardar',
    cancel: 'Cancelar',
    empty: 'Aún no hay gimnastas. Añade el primero para empezar.',
    yrs: 'años',
    confirmDelete: '¿Eliminar este gimnasta del registro?',
    gymnasts: (n: number) => `${n} gimnasta${n !== 1 ? 's' : ''}`,
    licencia: 'Licencia',
    uploadLicencia: 'Subir licencia',
    replaceLicencia: 'Reemplazar',
    removeLicencia: 'Eliminar licencia',
  },
}

function normalizeStr(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}

// ─── gymnast excel import ─────────────────────────────────────────────────────

type ImportRow = {
  _id: string
  first_name: string
  last_name_1: string
  last_name_2: string
  date_of_birth: string
  licencia: string
  licencia_nacional: string
  isDuplicate: boolean
  removed: boolean
}

// Column indices (0-based): F=5 Licencia, G=6 Lic.Nac., I=8 Nombre, J=9 Ap1, K=10 Ap2, O=14 DOB
function parseGymnastFile(buffer: ArrayBuffer, existing: Gymnast[]): ImportRow[] {
  const wb = XLSX.read(buffer, { type: 'array', cellDates: false })
  const ws = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<(string | number)[]>(ws, { header: 1, defval: '' })

  const existingKeys = new Set(
    existing.map(g => `${normalizeStr(g.first_name)}|${normalizeStr(g.last_name_1)}`)
  )

  const result: ImportRow[] = []
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    const firstName = String(row[8] ?? '').trim()
    const lastName1 = String(row[9] ?? '').trim()
    if (!firstName && !lastName1) continue

    const lastName2  = String(row[10] ?? '').trim()
    const dob        = String(row[14] ?? '').trim()
    const licencia   = String(row[5]  ?? '').trim()
    const licNac     = String(row[6]  ?? '').trim()

    const key = `${normalizeStr(firstName)}|${normalizeStr(lastName1)}`
    result.push({
      _id: crypto.randomUUID(),
      first_name: firstName,
      last_name_1: lastName1,
      last_name_2: lastName2,
      date_of_birth: dob,
      licencia,
      licencia_nacional: licNac,
      isDuplicate: existingKeys.has(key),
      removed: false,
    })
  }
  return result
}

function GymnastImportModal({ lang, rows, onConfirm, onClose }: {
  lang: Lang
  rows: ImportRow[]
  onConfirm: (gymnasts: Array<Omit<Gymnast, 'id' | 'club_id'>>) => Promise<void>
  onClose: () => void
}) {
  const t = T[lang]
  const inputCls = 'w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500'
  const [list, setList] = useState<ImportRow[]>(rows)
  const [saving, setSaving] = useState(false)

  function update(id: string, patch: Partial<ImportRow>) {
    setList(prev => prev.map(r => r._id === id ? { ...r, ...patch } : r))
  }

  const activeCount = list.filter(r => !r.removed && !r.isDuplicate).length
  const dupCount    = list.filter(r => r.isDuplicate).length

  async function handleConfirm() {
    setSaving(true)
    const toAdd = list
      .filter(r => !r.removed && !r.isDuplicate)
      .map(r => ({
        first_name:    r.first_name.trim(),
        last_name_1:   r.last_name_1.trim(),
        last_name_2:   r.last_name_2.trim() || null,
        date_of_birth: r.date_of_birth,
        photo_url:     null,
        licencia_url:  null,
      }))
    await onConfirm(toAdd)
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl my-8">
        {/* header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-800">{t.importTitle}</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {t.importFound(list.length)}
              {dupCount > 0 && <span className="text-amber-500"> · {t.importDuplicateNote(dupCount)}</span>}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* list */}
        <div className="divide-y divide-slate-100 max-h-[60vh] overflow-y-auto">
          {list.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-10">{t.importEmpty}</p>
          ) : list.map(row => (
            <div key={row._id} className={['px-5 py-3 flex items-center gap-3', row.removed ? 'opacity-40' : ''].join(' ')}>
              {/* ref licencias */}
              <div className="shrink-0 w-28 space-y-0.5">
                {row.licencia && (
                  <p className="text-xs text-slate-400 truncate"><span className="font-medium">{t.licencia}:</span> {row.licencia}</p>
                )}
                {row.licencia_nacional && (
                  <p className="text-xs text-slate-400 truncate"><span className="font-medium">{t.licenciaNacional}:</span> {row.licencia_nacional}</p>
                )}
              </div>

              {/* editable fields */}
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2">
                <input value={row.first_name} disabled={row.removed || row.isDuplicate}
                  onChange={e => update(row._id, { first_name: e.target.value })}
                  placeholder={T[lang].firstName} className={inputCls} />
                <input value={row.last_name_1} disabled={row.removed || row.isDuplicate}
                  onChange={e => update(row._id, { last_name_1: e.target.value })}
                  placeholder={T[lang].lastName1} className={inputCls} />
                <input value={row.last_name_2} disabled={row.removed || row.isDuplicate}
                  onChange={e => update(row._id, { last_name_2: e.target.value })}
                  placeholder={T[lang].lastName2} className={inputCls} />
                <input type="date" value={row.date_of_birth} disabled={row.removed || row.isDuplicate}
                  onChange={e => update(row._id, { date_of_birth: e.target.value })}
                  className={inputCls} />
              </div>

              {/* status / remove */}
              <div className="shrink-0 flex items-center gap-2">
                {row.isDuplicate && (
                  <span className="text-xs font-medium px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-200 rounded-full">
                    {t.importDuplicate}
                  </span>
                )}
                {!row.isDuplicate && (
                  <button type="button" onClick={() => update(row._id, { removed: !row.removed })}
                    className={['p-1 rounded-lg transition-all', row.removed
                      ? 'text-blue-400 hover:text-blue-600 hover:bg-blue-50'
                      : 'text-slate-300 hover:text-red-500 hover:bg-red-50'].join(' ')}>
                    {row.removed ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-100 transition-all">
            {t.importCancel}
          </button>
          <button onClick={handleConfirm} disabled={saving || activeCount === 0}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
            {saving && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
            {saving ? t.importConfirming : `${t.importConfirm} (${activeCount})`}
          </button>
        </div>
      </div>
    </div>
  )
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
  return [g.first_name, g.last_name_1, g.last_name_2].filter(Boolean).join(' ')
}

// ─── photo avatar ─────────────────────────────────────────────────────────────

function PhotoAvatar({ photoUrl, initials, size = 'md', onUpload }: {
  photoUrl: string | null
  initials: string
  size?: 'sm' | 'md'
  onUpload: (file: File) => void
}) {
  const ref = useRef<HTMLInputElement>(null)
  const dim = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm'

  return (
    <div className={`relative shrink-0 ${dim}`}>
      <div className={`${dim} rounded-full bg-slate-100 flex items-center justify-center font-semibold text-slate-500 overflow-hidden`}>
        {photoUrl
          ? <img src={photoUrl} alt="" className="w-full h-full object-cover" />
          : initials}
      </div>
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className="absolute inset-0 rounded-full bg-black/0 hover:bg-black/25 flex items-center justify-center opacity-0 hover:opacity-100 transition-all cursor-pointer">
        <svg className="w-3 h-3 text-white drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
        </svg>
      </button>
      <input ref={ref} type="file" accept="image/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) { onUpload(f); e.target.value = '' } }} />
    </div>
  )
}

// Export so TeamsTab can reuse
export { PhotoAvatar }

// ─── licencia chip ────────────────────────────────────────────────────────────

type LicenciaLabels = { view: string; upload: string; replace: string; remove: string }

function LicenciaChip({ url, onUpload, onRemove, labels }: {
  url: string | null | undefined
  onUpload: (file: File) => void
  onRemove: () => void
  labels: LicenciaLabels
}) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <div className="flex items-center gap-1 shrink-0">
      <button
        type="button"
        onClick={() => url ? window.open(url, '_blank') : ref.current?.click()}
        className={[
          'flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border transition-all',
          url
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
            : 'bg-slate-50 text-slate-400 border-slate-200 hover:border-slate-300 hover:text-slate-500',
        ].join(' ')}
      >
        <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
        {url ? labels.view : labels.upload}
      </button>
      {url && (
        <>
          <button type="button" onClick={() => ref.current?.click()} title={labels.replace}
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
          </button>
          <button type="button" onClick={onRemove} title={labels.remove}
            className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </>
      )}
      <input ref={ref} type="file" accept=".pdf,application/pdf" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) { onUpload(f); e.target.value = '' } }} />
    </div>
  )
}

// ─── gymnast form ─────────────────────────────────────────────────────────────

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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

// ─── tab ─────────────────────────────────────────────────────────────────────

export default function GymnastsTab({
  lang, gymnasts, onAdd, onAddBulk, onUpdate, onDelete, onUploadPhoto, onUploadLicencia, onRemoveLicencia,
}: {
  lang: Lang
  gymnasts: Gymnast[]
  onAdd: (g: Omit<Gymnast, 'id' | 'club_id'>) => void
  onAddBulk: (gymnasts: Array<Omit<Gymnast, 'id' | 'club_id'>>) => Promise<void>
  onUpdate: (id: string, g: Omit<Gymnast, 'id' | 'club_id'>) => void
  onDelete: (id: string) => void
  onUploadPhoto: (id: string, file: File) => Promise<void>
  onUploadLicencia: (id: string, file: File) => Promise<void>
  onRemoveLicencia: (id: string) => Promise<void>
}) {
  const t = T[lang]
  const licenciaLabels = { view: t.licencia, upload: t.uploadLicencia, replace: t.replaceLicencia, remove: t.removeLicencia }
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [importRows, setImportRows] = useState<ImportRow[] | null>(null)
  const [search, setSearch] = useState('')
  const importFileRef = useRef<HTMLInputElement>(null)

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const buf = ev.target?.result
      if (buf instanceof ArrayBuffer) {
        const rows = parseGymnastFile(buf, gymnasts)
        setImportRows(rows)
      }
    }
    reader.readAsArrayBuffer(file)
    e.target.value = ''
  }

  const sorted = [...gymnasts].sort((a, b) => (a.last_name_1 ?? '').localeCompare(b.last_name_1 ?? ''))
  const q = normalizeStr(search)
  const filtered = q
    ? sorted.filter(g => normalizeStr(gymnastFullName(g)).includes(q))
    : sorted

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-slate-500">{t.gymnasts(gymnasts.length)}</p>
        {!showAdd && (
          <div className="flex items-center gap-2">
            <button onClick={() => importFileRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-all">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              {t.importGymnasts}
            </button>
            <input ref={importFileRef} type="file" accept=".xlsx,.xls,.ods,.csv" className="hidden" onChange={handleImportFile} />
            <button onClick={() => setShowAdd(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              {t.addGymnast}
            </button>
          </div>
        )}
      </div>

      {importRows !== null && (
        <GymnastImportModal
          lang={lang}
          rows={importRows}
          onConfirm={onAddBulk}
          onClose={() => setImportRows(null)}
        />
      )}

      {gymnasts.length > 0 && (
        <div className="relative mb-4">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t.search}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}

      {showAdd && (
        <div className="mb-4">
          <GymnastForm lang={lang} initial={EMPTY_FORM}
            onCancel={() => setShowAdd(false)}
            onSave={(f) => { onAdd({ ...f, photo_url: null }); setShowAdd(false) }} />
        </div>
      )}

      {filtered.length === 0 && !showAdd ? (
        <p className="text-sm text-slate-400 text-center py-16">{t.empty}</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((g) =>
            editingId === g.id ? (
              <GymnastForm key={g.id} lang={lang}
                initial={{ first_name: g.first_name, last_name_1: g.last_name_1, last_name_2: g.last_name_2 ?? '', date_of_birth: g.date_of_birth }}
                onCancel={() => setEditingId(null)}
                onSave={(f) => { onUpdate(g.id, { ...f, photo_url: g.photo_url }); setEditingId(null) }} />
            ) : (
              <div key={g.id} className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-3">
                <PhotoAvatar
                  photoUrl={g.photo_url}
                  initials={`${g.first_name[0]}${g.last_name_1[0]}`}
                  onUpload={(file) => onUploadPhoto(g.id, file)}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{gymnastFullName(g)}</p>
                  <p className="text-xs text-slate-400">
                    {new Date(g.date_of_birth + 'T00:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                    {' · '}
                    {computeAge(g.date_of_birth)} {t.yrs}
                  </p>
                </div>
                <LicenciaChip
                  url={g.licencia_url}
                  onUpload={(file) => onUploadLicencia(g.id, file)}
                  onRemove={() => onRemoveLicencia(g.id)}
                  labels={licenciaLabels}
                />
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
