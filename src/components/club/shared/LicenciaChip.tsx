'use client'

import { useRef } from 'react'

export function LicenciaChip({ url, onUpload, onRemove, labels }: {
  url: string | null | undefined
  onUpload: (file: File) => void
  onRemove?: () => void
  labels: { view: string; upload: string; replace: string; remove?: string }
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
          {onRemove && (
            <button type="button" onClick={onRemove} title={labels.remove}
              className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </>
      )}
      <input ref={ref} type="file" accept=".pdf,application/pdf" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) { onUpload(f); e.target.value = '' } }} />
    </div>
  )
}
