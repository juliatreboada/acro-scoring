'use client'

import type { Lang } from '../scoring/types'

const T = {
  en: {
    title: 'Choose your scoring mode',
    sub: 'This applies to the full session and cannot be changed once you start.',
    keypadTitle: 'Keypad',
    keypadDesc: 'Enter difficulty and penalty directly using a numeric keypad. Fast and simple.',
    elementsTitle: 'Elements',
    elementsDesc: 'Score each element individually — mark done / not done, retries, SR, forbidden.',
  },
  es: {
    title: 'Elige tu modo de puntuación',
    sub: 'Se aplica a toda la sesión y no puede cambiarse una vez empezada.',
    keypadTitle: 'Teclado',
    keypadDesc: 'Introduce dificultad y penalización directamente con teclado numérico. Rápido y sencillo.',
    elementsTitle: 'Elementos',
    elementsDesc: 'Puntúa cada elemento individualmente — realizado / no realizado, reintentos, SR, prohibido.',
  },
}

export type DJPhoneMode = 'keypad' | 'elements'

export default function DJModeSelector({ lang, onSelect }: {
  lang: Lang
  onSelect: (mode: DJPhoneMode) => void
}) {
  const t = T[lang]

  return (
    <div className="px-4 py-10 flex flex-col items-center gap-6 min-h-[60vh] justify-center">
      <div className="text-center">
        <p className="text-lg font-bold text-slate-800">{t.title}</p>
        <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto">{t.sub}</p>
      </div>

      <div className="w-full space-y-3">
        {/* Keypad */}
        <button
          onClick={() => onSelect('keypad')}
          className="w-full text-left border-2 border-slate-200 rounded-2xl p-5 hover:border-emerald-400 hover:bg-emerald-50/30 transition-all group"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-emerald-100 flex items-center justify-center shrink-0 transition-colors">
              <svg className="w-5 h-5 text-slate-500 group-hover:text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <rect x="4" y="5" width="4" height="4" rx="1" />
                <rect x="10" y="5" width="4" height="4" rx="1" />
                <rect x="16" y="5" width="4" height="4" rx="1" />
                <rect x="4" y="11" width="4" height="4" rx="1" />
                <rect x="10" y="11" width="4" height="4" rx="1" />
                <rect x="16" y="11" width="4" height="4" rx="1" />
                <rect x="4" y="17" width="4" height="4" rx="1" />
                <rect x="10" y="17" width="4" height="4" rx="1" />
                <rect x="16" y="17" width="4" height="4" rx="1" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">{t.keypadTitle}</p>
              <p className="text-sm text-slate-500 mt-0.5 leading-snug">{t.keypadDesc}</p>
            </div>
          </div>
        </button>

        {/* Elements */}
        <button
          onClick={() => onSelect('elements')}
          className="w-full text-left border-2 border-slate-200 rounded-2xl p-5 hover:border-blue-400 hover:bg-blue-50/30 transition-all group"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center shrink-0 transition-colors">
              <svg className="w-5 h-5 text-slate-500 group-hover:text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6M9 16h4" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{t.elementsTitle}</p>
              <p className="text-sm text-slate-500 mt-0.5 leading-snug">{t.elementsDesc}</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  )
}
