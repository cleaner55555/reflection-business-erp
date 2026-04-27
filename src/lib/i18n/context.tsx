'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react'
import { translations, DEFAULT_LOCALE, type TranslationMap } from './translations'
import { LANGUAGES_BY_CODE } from './languages'

// ============ TYPES ============

interface I18nContextValue {
  /** Current locale */
  locale: string
  /** Change the active locale (also persists to settings API) */
  setLocale: (locale: string) => void
  /** Translate a key using dot notation: t('common.save') */
  t: (key: string, params?: Record<string, string | number>) => string
  /** Translation map for the current locale */
  translations: TranslationMap
  /** Whether a translation is currently being loaded from AI */
  isTranslating: boolean
}

const I18nContext = createContext<I18nContextValue | null>(null)

// ============ PROVIDER ============

interface I18nProviderProps {
  children: ReactNode
  /** Override the initial locale (useful for testing) */
  initialLocale?: string
}

export function I18nProvider({ children, initialLocale }: I18nProviderProps) {
  const hasInitialLocale = !!initialLocale
  const [locale, setLocaleState] = useState<string>(initialLocale ?? DEFAULT_LOCALE)
  const [isLoaded, setIsLoaded] = useState(hasInitialLocale)
  const [isTranslating, setIsTranslating] = useState(false)
  const [aiTranslations, setAiTranslations] = useState<Record<string, TranslationMap>>({})
  const translatingRef = useRef<string | null>(null)

  // Hardcoded locales that have static translations
  const HARDCODED = new Set(['sr', 'sr-latn', 'en'])

  // Load saved locale from settings API on mount
  useEffect(() => {
    if (hasInitialLocale) {
      return
    }

    let cancelled = false

    fetch('/api/settings?group=general')
      .then((res) => {
        if (!res.ok || cancelled) return null
        return res.json()
      })
      .then((data) => {
        if (cancelled) return
        if (data && Array.isArray(data)) {
          const langSetting = data.find((s: { key: string; value: string }) => s.key === 'language')
          if (langSetting?.value && LANGUAGES_BY_CODE[langSetting.value]) {
            setLocaleState(langSetting.value)
          }
        }
      })
      .catch(() => {
        // Silently fail — use default locale
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoaded(true)
        }
      })

    return () => {
      cancelled = true
    }
  }, [hasInitialLocale])

  // Fetch AI translations for non-hardcoded locales
  const fetchTranslation = useCallback(async (targetLocale: string) => {
    if (HARDCODED.has(targetLocale)) return

    // Skip if already translating or already cached
    if (translatingRef.current === targetLocale) return
    if (aiTranslations[targetLocale]) return

    translatingRef.current = targetLocale
    setIsTranslating(true)

    try {
      // Try GET first (check cache)
      const getRes = await fetch(`/api/i18n/translate?locale=${encodeURIComponent(targetLocale)}`)
      const getData = await getRes.json()

      if (getData.translations && getData.source !== 'not-found') {
        setAiTranslations((prev) => ({ ...prev, [targetLocale]: getData.translations }))
        setIsTranslating(false)
        translatingRef.current = null
        return
      }

      // Not cached — trigger AI translation
      const postRes = await fetch('/api/i18n/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale: targetLocale }),
      })

      if (postRes.ok) {
        const postData = await postRes.json()
        if (postData.translations) {
          setAiTranslations((prev) => ({ ...prev, [targetLocale]: postData.translations }))
        }
      }
    } catch (err) {
      console.error('Failed to fetch translation:', err)
    } finally {
      setIsTranslating(false)
      translatingRef.current = null
    }
  }, [aiTranslations])

  // When locale changes to a non-hardcoded locale, fetch translations
  useEffect(() => {
    if (!isLoaded) return
    if (!HARDCODED.has(locale)) {
      fetchTranslation(locale)
    }
  }, [locale, isLoaded, fetchTranslation])

  // Persist locale to settings API
  const setLocale = useCallback((newLocale: string) => {
    setLocaleState(newLocale)

    // Persist to settings API (fire and forget)
    fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([
        {
          key: 'language',
          value: newLocale,
          label: 'Language',
          type: 'text',
          group: 'general',
        },
      ]),
    }).catch(() => {
      // Silently fail — locale is still set locally
    })
  }, [])

  // Get current translation map
  const getCurrentTranslations = useCallback((): TranslationMap => {
    // 1. Check hardcoded translations
    if (translations[locale]) {
      return translations[locale]
    }
    // 2. Check AI translations
    if (aiTranslations[locale]) {
      return aiTranslations[locale]
    }
    // 3. Fallback to English
    return translations[DEFAULT_LOCALE] || translations['en']
  }, [locale, aiTranslations])

  // Translation function with dot notation support
  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const currentTranslations = getCurrentTranslations()
      const parts = key.split('.')
      let result: string | undefined

      // Navigate through dot notation
      let current: unknown = currentTranslations
      for (const part of parts) {
        if (current && typeof current === 'object' && part in current) {
          current = (current as Record<string, unknown>)[part]
        } else {
          current = undefined
          break
        }
      }

      result = typeof current === 'string' ? current : undefined

      // Fallback: try English, then return the key itself
      if (result === undefined && locale !== DEFAULT_LOCALE && locale !== 'en') {
        let fallback: unknown = translations[DEFAULT_LOCALE] || translations['en']
        for (const part of parts) {
          if (fallback && typeof fallback === 'object' && part in fallback) {
            fallback = (fallback as Record<string, unknown>)[part]
          } else {
            fallback = undefined
            break
          }
        }
        result = typeof fallback === 'string' ? fallback : undefined
      }

      // Still not found — return the key itself
      if (result === undefined) {
        return key
      }

      // Interpolate parameters: {paramName}
      if (params) {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
          result = (result as string).replace(
            new RegExp(`\\{${paramKey}\\}`, 'g'),
            String(paramValue)
          )
        })
      }

      return result
    },
    [locale, getCurrentTranslations]
  )

  const currentTranslations = getCurrentTranslations()

  // Don't render children until locale is loaded from API (prevents flash)
  if (!isLoaded) {
    return null
  }

  return (
    <I18nContext.Provider
      value={{
        locale,
        setLocale,
        t,
        translations: currentTranslations,
        isTranslating,
      }}
    >
      {children}
    </I18nContext.Provider>
  )
}

// ============ HOOK ============

/**
 * Hook for accessing the i18n translation system.
 *
 * @example
 * ```tsx
 * const { t, locale, setLocale, isTranslating } = useTranslation()
 *
 * // Simple lookup
 * t('common.save') // => 'Сачувај'
 *
 * // With parameters
 * t('common.countOf', { count: 5 }) // => '5 од'
 *
 * // Change locale
 * setLocale('de') // => auto-translates to German via AI
 * ```
 */
export function useTranslation(): I18nContextValue {
  const context = useContext(I18nContext)

  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider. ' +
      'Wrap your app with <I18nProvider> in the root layout.')
  }

  return context
}
