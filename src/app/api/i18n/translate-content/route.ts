import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// In-memory cache: `${sourceLang}|${targetLang}` → `{ originalText: translatedText }`
const memoryCache = new Map<string, Record<string, string>>()

// MyMemory API language code mapping
const langMap: Record<string, string> = {
  'sr-latn': 'sr',
  'sr': 'sr',
  'zh': 'zh-CN',
  'zh-tw': 'zh-TW',
  'pt-br': 'pt-BR',
  'es-mx': 'es-MX',
  'es-ar': 'es-AR',
  'fr-ca': 'fr-CA',
}

interface TranslateRequest {
  texts: string[]
  locale: string
  sourceLocale?: string
}

export async function POST(req: NextRequest) {
  try {
    const body: TranslateRequest = await req.json()
    const { texts, locale, sourceLocale = 'sr' } = body

    if (!texts || !Array.isArray(texts) || texts.length === 0 || !locale) {
      return NextResponse.json({ error: 'texts and locale are required' }, { status: 400 })
    }

    // Deduplicate
    const uniqueTexts = [...new Set(texts)]

    // Map locale codes for MyMemory
    const targetLang = langMap[locale] || locale
    const sourceLang = langMap[sourceLocale] || sourceLocale

    // Skip if same language
    if (sourceLang === targetLang) {
      const result: Record<string, string> = {}
      uniqueTexts.forEach((t) => (result[t] = t))
      return NextResponse.json({ translations: result, source: 'same-lang' })
    }

    // Check in-memory cache
    const cacheKey = `${sourceLang}|${targetLang}`
    const cached = memoryCache.get(cacheKey)
    const uncached: string[] = []
    const result: Record<string, string> = {}

    for (const text of uniqueTexts) {
      if (cached && cached[text]) {
        result[text] = cached[text]
      } else {
        uncached.push(text)
      }
    }

    // Check DB cache for uncached texts
    if (uncached.length > 0) {
      const dbCacheKey = `content_${cacheKey}`
      let dbTranslations: Record<string, string> = {}

      try {
        const dbCached = await db.appSetting.findUnique({
          where: { key: dbCacheKey },
        })
        if (dbCached?.value) {
          dbTranslations = JSON.parse(dbCached.value)
        }
      } catch {
        /* corrupt cache entry, will be overwritten */
      }

      const toTranslate: string[] = []
      for (const text of uncached) {
        if (dbTranslations[text]) {
          result[text] = dbTranslations[text]
        } else {
          toTranslate.push(text)
        }
      }

      // Translate uncached texts via MyMemory API
      if (toTranslate.length > 0) {
        const newTranslations: Record<string, string> = {}

        // Process in batches of 5 concurrent requests
        const CONCURRENT = 5
        for (let i = 0; i < toTranslate.length; i += CONCURRENT) {
          const batch = toTranslate.slice(i, i + CONCURRENT)
          const promises = batch.map(async (text) => {
            try {
              const encoded = encodeURIComponent(text.substring(0, 500)) // MyMemory limit
              const url = `https://api.mymemory.translated.net/get?q=${encoded}&langpair=${sourceLang}|${targetLang}&de=reflection.erp@gmail.com`
              const controller = new AbortController()
              const timeout = setTimeout(() => controller.abort(), 8000)

              const res = await fetch(url, { signal: controller.signal })
              clearTimeout(timeout)
              const data = await res.json()

              if (
                data.responseStatus === 200 &&
                data.responseData?.translatedText &&
                !data.responseData.translatedText.toUpperCase().startsWith('MYMEMORY WARNING')
              ) {
                return { original: text, translated: data.responseData.translatedText }
              }
              // If translated text is same as source (no translation available), return original
              return { original: text, translated: text }
            } catch {
              return { original: text, translated: text }
            }
          })

          const batchResults = await Promise.all(promises)
          batchResults.forEach((r) => {
            newTranslations[r.original] = r.translated
            result[r.original] = r.translated
          })

          // Small delay between batches to respect rate limits
          if (i + CONCURRENT < toTranslate.length) {
            await new Promise((resolve) => setTimeout(resolve, 300))
          }
        }

        // Merge new translations into DB cache
        const allCached = { ...dbTranslations, ...newTranslations }
        try {
          await db.appSetting.upsert({
            where: { key: dbCacheKey },
            update: { value: JSON.stringify(allCached) },
            create: {
              key: dbCacheKey,
              value: JSON.stringify(allCached),
              label: `Content translation: ${cacheKey}`,
              type: 'json',
              group: 'content_i18n_cache',
            },
          })
        } catch {
          /* DB save failed, translations still work in memory */
        }

        // Update memory cache
        if (!memoryCache.has(cacheKey)) {
          memoryCache.set(cacheKey, {})
        }
        Object.assign(memoryCache.get(cacheKey)!, allCached)
      }
    }

    return NextResponse.json({ translations: result, source: 'translated' })
  } catch (err) {
    console.error('Content translation error:', err)
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 })
  }
}
