'use client'

import { useState } from 'react'
import type { Lang } from '@/components/scoring/types'
import type { RoutineMusic, Apparatus } from '@/components/admin/types'
import { FileChip } from './FileChip'
import { MusicPlayerModal } from './MusicPlayerModal'
import { useT } from '@/lib/useT'

export function ApparatusRow({
  lang, apparatus, record, locked, onSet,
}: {
  lang: Lang
  apparatus: Apparatus
  record: RoutineMusic | undefined
  locked: boolean
  onSet: (file: File | null) => void
}) {
  const t = useT('ApparatusRow', lang)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const appName = lang === 'es' && apparatus.name_es ? apparatus.name_es : apparatus.name

  return (
    <>
      <div className="py-2 border-t border-slate-100 first:border-0">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="w-20 shrink-0 text-xs font-semibold text-slate-600">{appName}</span>
          <FileChip label={t.music} filename={record?.music_filename}
            accept="audio/*,.mp3,.wav,.aac,.m4a"
            locked={locked}
            onPreview={record?.music_filename ? () => setPreviewUrl(record.music_filename!) : undefined}
            onUpload={file => onSet(file)}
            onRemove={() => onSet(null)} />
        </div>
      </div>
      {previewUrl && (
        <MusicPlayerModal url={previewUrl} title={`${appName} — Music`} onClose={() => setPreviewUrl(null)} />
      )}
    </>
  )
}
