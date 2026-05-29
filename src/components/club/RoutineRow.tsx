'use client'

import { useState } from 'react'
import type { Lang } from '@/components/scoring/types'
import type { RoutineMusic } from '@/components/admin/types'
import { FileChip } from './FileChip'
import { PDFViewerModal } from './PDFViewerModal'
import { MusicPlayerModal } from './MusicPlayerModal'
import { useT } from '@/lib/useT'

export function RoutineRow({
  lang, routineType, record, locked, reviewStatus, reviewComment, onSet,
}: {
  lang: Lang
  routineType: 'Balance' | 'Dynamic' | 'Combined'
  record: RoutineMusic | undefined
  locked: boolean
  reviewStatus?: string
  reviewComment?: string | null
  onSet: (field: 'music' | 'ts', file: File | null) => void
}) {
  const t = useT('RoutineRow', lang)
  const [tsPreviewUrl, setTsPreviewUrl] = useState<string | null>(null)
  const [musicPreviewUrl, setMusicPreviewUrl] = useState<string | null>(null)
  return (
    <>
      <div className="py-2 border-t border-slate-100 first:border-0">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="w-16 shrink-0 text-xs font-semibold text-slate-600">{routineType}</span>
          <FileChip label={t.ts} filename={record?.ts_filename}
            accept=".pdf,application/pdf"
            locked={locked && reviewStatus !== 'incorrect'}
            onPreview={record?.ts_filename ? () => setTsPreviewUrl(record.ts_filename!) : undefined}
            onUpload={(file) => onSet('ts', file)}
            onRemove={() => onSet('ts', null)} />
          {reviewStatus === 'checked' && (
            <span className="text-xs font-medium text-emerald-600 flex items-center gap-0.5">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {lang === 'es' ? 'Revisada' : 'Reviewed'}
            </span>
          )}
          <FileChip label={t.music} filename={record?.music_filename}
            accept="audio/*,.mp3,.wav,.aac,.m4a"
            locked={locked}
            onPreview={record?.music_filename ? () => setMusicPreviewUrl(record.music_filename!) : undefined}
            onUpload={(file) => onSet('music', file)}
            onRemove={() => onSet('music', null)} />
        </div>
        {reviewStatus === 'incorrect' && (
          <div className="mt-2 ml-16 px-3 py-2 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-xs font-semibold text-red-700 mb-0.5">
              {lang === 'es' ? 'TS marcada como incorrecta por el juez DJ:' : 'TS marked as incorrect by DJ judge:'}
            </p>
            {reviewComment && (
              <p className="text-xs text-red-600 leading-snug">{reviewComment}</p>
            )}
            <p className="text-xs text-red-400 mt-1">
              {lang === 'es' ? 'Sube una nueva TS para corregirla.' : 'Upload a new TS to correct it.'}
            </p>
          </div>
        )}
        {reviewStatus === 'new_ts' && (
          <p className="text-xs text-blue-500 ml-16 mt-1">
            {lang === 'es' ? 'Nueva TS enviada — pendiente de revisión por el juez.' : 'New TS sent — pending DJ review.'}
          </p>
        )}
      </div>
      {tsPreviewUrl && (
        <PDFViewerModal
          url={tsPreviewUrl}
          title={`${routineType} — TS`}
          onClose={() => setTsPreviewUrl(null)}
        />
      )}
      {musicPreviewUrl && (
        <MusicPlayerModal
          url={musicPreviewUrl}
          title={`${routineType} — Music`}
          onClose={() => setMusicPreviewUrl(null)}
        />
      )}
    </>
  )
}
