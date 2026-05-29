import type { Lang } from '@/components/scoring/types'
import * as en from '@/locales/en'
import * as es from '@/locales/es'

const locales = { en, es }

export function useT<K extends keyof typeof en>(namespace: K, lang: Lang): typeof en[K] {
  return locales[lang][namespace] as typeof en[K]
}
