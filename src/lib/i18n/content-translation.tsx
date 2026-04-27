'use client'

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
} from 'react'

// ============ TYPES ============

interface ContentTranslationContextValue {
  /** Current UI locale */
  locale: string
  /** Source locale for content (usually 'sr') */
  sourceLocale: string
  /** Map of original → translated text */
  translations: Record<string, string>
  /** Whether content is currently being translated */
  isTranslating: boolean
  /** Queue texts for translation (debounced batch) */
  translateTexts: (texts: string[]) => void
  /** Get translated text or return original */
  tc: (text: string) => string
}

const ContentTranslationContext = createContext<ContentTranslationContextValue | null>(null)

// ============ PROVIDER ============

interface ContentTranslationProviderProps {
  children: ReactNode
  locale: string
  sourceLocale?: string
}

export function ContentTranslationProvider({
  children,
  locale,
  sourceLocale = 'sr',
}: ContentTranslationProviderProps) {
  const [translations, setTranslations] = useState<Record<string, string>>({})
  const [isTranslating, setIsTranslating] = useState(false)
  const pendingRef = useRef<Set<string>>(new Set())
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const currentLocaleRef = useRef(locale)

  // Clear translations when locale changes
  useEffect(() => {
    if (currentLocaleRef.current !== locale) {
      setTranslations({})
      pendingRef.current.clear()
      currentLocaleRef.current = locale
    }
  }, [locale])

  // Base locales that don't need translation
  const baseLocales = ['sr', 'sr-latn', 'en']
  const needsTranslation = !baseLocales.includes(locale)

  const translateTexts = useCallback(
    (texts: string[]) => {
      if (!needsTranslation || texts.length === 0) return

      const newPending = texts.filter(
        (t) => t && t.trim() && !translations[t] && !pendingRef.current.has(t)
      )
      if (newPending.length === 0) return

      newPending.forEach((t) => pendingRef.current.add(t))

      // Debounce: collect all texts, then send batch request
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(async () => {
        const textsToTranslate = Array.from(pendingRef.current)
        pendingRef.current.clear()
        setIsTranslating(true)

        try {
          const res = await fetch('/api/i18n/translate-content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ texts: textsToTranslate, locale, sourceLocale }),
          })
          if (res.ok) {
            const data = await res.json()
            if (data.translations) {
              setTranslations((prev) => ({ ...prev, ...data.translations }))
            }
          }
        } catch (err) {
          console.error('Content translation failed:', err)
        } finally {
          setIsTranslating(false)
        }
      }, 200)
    },
    [locale, sourceLocale, needsTranslation, translations]
  )

  // tc = translate content
  const tc = useCallback(
    (text: string): string => {
      if (!text || !needsTranslation) return text
      return translations[text] || text
    },
    [translations, needsTranslation]
  )

  return (
    <ContentTranslationContext.Provider
      value={{ locale, sourceLocale, translations, isTranslating, translateTexts, tc }}
    >
      {children}
    </ContentTranslationContext.Provider>
  )
}

// ============ HOOK ============

export function useContentTranslation(): ContentTranslationContextValue {
  const ctx = useContext(ContentTranslationContext)
  if (!ctx) {
    // Return no-op version if used outside provider
    return {
      locale: 'sr',
      sourceLocale: 'sr',
      translations: {},
      isTranslating: false,
      translateTexts: () => {},
      tc: (text: string) => text,
    }
  }
  return ctx
}

// ============ TRANSLATABLE TEXT COMPONENT ============

interface TranslatableTextProps {
  /** The original text to translate */
  text: string
  /** Optional CSS class */
  className?: string
  /** HTML element to render as (default: span) */
  as?: keyof JSX.IntrinsicElements
  /** If true, don't trigger translation (e.g. for forms) */
  noTranslate?: boolean
}

export function TranslatableText({
  text,
  className,
  as: Tag = 'span',
  noTranslate = false,
}: TranslatableTextProps) {
  const { translations, translateTexts, locale, tc } = useContentTranslation()

  // Trigger translation on mount/when text or locale changes
  useEffect(() => {
    if (text && text.trim() && !noTranslate) {
      translateTexts([text])
    }
  }, [text, locale, translateTexts, noTranslate])

  const displayText = noTranslate ? text : tc(text)

  return React.createElement(Tag, { className }, displayText)
}

// ============ HOOK FOR MODULE DATA ============

/**
 * Hook that translates an array of items' text fields in batch.
 *
 * @example
 * ```tsx
 * const { tc, translateTexts, translatedData } = useDataTranslation(items, 'name')
 * // translatedData = items with name field auto-translated
 * ```
 */
export function useDataTranslation<T extends Record<string, unknown>>(
  items: T[],
  field: keyof T
): {
  tc: (text: string) => string
  translateTexts: (texts: string[]) => void
  isTranslating: boolean
  getTranslated: (item: T) => string
} {
  const { translations, translateTexts, isTranslating } = useContentTranslation()

  // Trigger translation when items change
  useEffect(() => {
    if (items.length > 0) {
      const texts = items.map((item) => String(item[field] || '')).filter(Boolean)
      translateTexts(texts)
    }
  }, [items, field, translateTexts])

  const tc = useCallback(
    (text: string): string => {
      if (!text) return text
      return translations[text] || text
    },
    [translations]
  )

  const getTranslated = useCallback(
    (item: T): string => {
      const val = String(item[field] || '')
      return translations[val] || val
    },
    [field, translations]
  )

  return { tc, translateTexts, isTranslating, getTranslated }
}
