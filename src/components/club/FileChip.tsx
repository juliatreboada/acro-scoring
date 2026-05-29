'use client'

import { useRef } from 'react'

export function FileChip({ label, filename, accept, locked, onUpload, onRemove, onPreview }: {
  label: string
  filename: string | null | undefined
  accept: string
  locked: boolean
  onUpload: (file: File) => void
  onRemove: () => void
  onPreview?: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) onUpload(file)
    if (inputRef.current) inputRef.current.value = ''
  }
  const displayName = filename
    ? decodeURIComponent(filename.split('/').pop() ?? filename)
    : null
  return (
    <span className="flex items-center gap-1 min-w-0">
      <span className="text-xs font-semibold text-slate-400">{label}</span>
      {displayName ? (
        <span className="flex items-center gap-1 bg-green-50 border border-green-200 rounded-full pl-2 pr-1 py-0.5 max-w-[140px]">
          {onPreview ? (
            <button onClick={onPreview} className="text-xs text-green-700 truncate hover:underline underline-offset-2 text-left">
              {displayName}
            </button>
          ) : (
            <span className="text-xs text-green-700 truncate">{displayName}</span>
          )}
          {!locked && (
            <button onClick={onRemove} className="text-green-400 hover:text-red-500 transition-colors ml-0.5 shrink-0 leading-none">✕</button>
          )}
        </span>
      ) : locked ? (
        <span className="text-xs text-slate-300 border border-dashed border-slate-200 rounded-full px-2 py-0.5">—</span>
      ) : (
        <button onClick={() => inputRef.current?.click()}
          className="text-xs text-slate-400 hover:text-blue-600 border border-dashed border-slate-300 hover:border-blue-400 rounded-full px-2 py-0.5 transition-all">
          + upload
        </button>
      )}
      {!locked && <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleChange} />}
    </span>
  )
}
