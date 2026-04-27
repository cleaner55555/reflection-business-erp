import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { translations, DEFAULT_LOCALE } from '@/lib/i18n/translations'

// Hardcoded locales that don't need AI translation
const HARDCODED_LOCALES = ['sr', 'sr-latn', 'en']

// In-memory cache to avoid hitting DB every request
const cache = new Map<string, Record<string, Record<string, string>>>()

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const locale = searchParams.get('locale')

  if (!locale) {
    return NextResponse.json({ error: 'locale is required' }, { status: 400 })
  }

  // If hardcoded locale, return the static translations
  if (HARDCODED_LOCALES.includes(locale)) {
    return NextResponse.json({ translations: translations[locale] || translations[DEFAULT_LOCALE], source: 'static' })
  }

  // Check in-memory cache first
  if (cache.has(locale)) {
    return NextResponse.json({ translations: cache.get(locale), source: 'cache' })
  }

  // Check DB cache
  const cached = await db.appSetting.findUnique({
    where: { key: `translation_${locale}` },
  })

  if (cached && cached.value) {
    try {
      const parsed = JSON.parse(cached.value)
      cache.set(locale, parsed)
      return NextResponse.json({ translations: parsed, source: 'db-cache' })
    } catch {
      // corrupted cache, regenerate
    }
  }

  // Not cached — trigger translation
  return NextResponse.json({ translations: null, source: 'not-found' })
}

export async function POST(req: NextRequest) {
  const { locale } = await req.json()

  if (!locale || HARDCODED_LOCALES.includes(locale)) {
    return NextResponse.json({ error: 'Invalid locale' }, { status: 400 })
  }

  // Get language name for the prompt
  const languageNames: Record<string, string> = {
    de: 'German', fr: 'French', it: 'Italian', es: 'Spanish', pt: 'Portuguese',
    nl: 'Dutch', pl: 'Polish', cs: 'Czech', sk: 'Slovak', hu: 'Hungarian',
    ro: 'Romanian', bg: 'Bulgarian', hr: 'Croatian', sl: 'Slovenian', sq: 'Albanian',
    tr: 'Turkish', el: 'Greek', ru: 'Russian', uk: 'Ukrainian', ar: 'Arabic',
    zh: 'Chinese', ja: 'Japanese', ko: 'Korean', hi: 'Hindi', bn: 'Bengali',
    sv: 'Swedish', no: 'Norwegian', da: 'Danish', fi: 'Finnish', et: 'Estonian',
    lv: 'Latvian', lt: 'Lithuanian', he: 'Hebrew', th: 'Thai', vi: 'Vietnamese',
    id: 'Indonesian', ms: 'Malay', tl: 'Filipino', af: 'Afrikaans', ca: 'Catalan',
    eu: 'Basque', gl: 'Galician', ka: 'Georgian', hy: 'Armenian', az: 'Azerbaijani',
    kk: 'Kazakh', uz: 'Uzbek', mn: 'Mongolian', km: 'Khmer', lo: 'Lao',
    my: 'Burmese', ne: 'Nepali', si: 'Sinhala', ur: 'Urdu', fa: 'Persian',
    ku: 'Kurdish', ps: 'Pashto', am: 'Amharic', sw: 'Swahili', iw: 'Hebrew',
  }

  const langName = languageNames[locale] || locale

  // Get English source translations (flat list of key->value)
  const sourceMap = translations[DEFAULT_LOCALE] || translations['en']
  const flatPairs: Array<[string, string]> = []

  for (const [section, entries] of Object.entries(sourceMap)) {
    for (const [key, value] of Object.entries(entries as Record<string, string>)) {
      if (typeof value === 'string' && value.trim().length > 0) {
        flatPairs.push([`${section}.${key}`, value])
      }
    }
  }

  // Translate in batches of 60 to avoid token limits
  const BATCH_SIZE = 60
  const translatedFlat: Record<string, string> = {}

  for (let i = 0; i < flatPairs.length; i += BATCH_SIZE) {
    const batch = flatPairs.slice(i, i + BATCH_SIZE)

    const pairsText = batch
      .map(([k, v]) => `"${k}": "${v.replace(/"/g, '\\"')}"`)
      .join('\n')

    const prompt = `You are a professional translator for a business ERP application. Translate ALL values from English to ${langName}.

IMPORTANT RULES:
- Keep translations concise (they are UI labels, not sentences)
- Keep technical terms like "CRM", "Rent a Car", "Email Marketing", "PIB", "RSD", "EUR" UNTRANSLATED
- Keep brand names and proper nouns untranslated
- For sidebar group labels that are ALL CAPS, keep them ALL CAPS in translation too
- Return ONLY a JSON object with the same keys and translated values
- No explanations, no markdown, just the JSON object

Here are the entries to translate:
${pairsText}`

    try {
      const ZAI = await import('z-ai-web-dev-sdk').then(m => m.default || m)
      const zai = await ZAI.create()

      const completion = await zai.chat.completions.create({
        messages: [
          { role: 'assistant', content: 'You are a professional translator. Translate UI text. Return only valid JSON.' },
          { role: 'user', content: prompt },
        ],
        thinking: { type: 'disabled' },
      })

      let responseText = completion.choices[0]?.message?.content || ''

      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        responseText = jsonMatch[0]
      }

      const parsed = JSON.parse(responseText)
      Object.assign(translatedFlat, parsed)
    } catch (err) {
      console.error(`Translation batch ${i / BATCH_SIZE} failed for ${locale}:`, err)
      // On error, keep English values for this batch
      for (const [k, v] of batch) {
        translatedFlat[k] = v
      }
    }
  }

  // Rebuild nested structure from flat pairs
  const result: Record<string, Record<string, string>> = {}
  for (const [dotKey, value] of Object.entries(translatedFlat)) {
    const [section, key] = dotKey.split('.')
    if (section && key) {
      if (!result[section]) result[section] = {}
      result[section][key] = value
    }
  }

  // Cache in memory
  cache.set(locale, result)

  // Cache in DB
  try {
    await db.appSetting.upsert({
      where: { key: `translation_${locale}` },
      update: { value: JSON.stringify(result) },
      create: {
        key: `translation_${locale}`,
        value: JSON.stringify(result),
        label: `Translation cache: ${locale}`,
        type: 'json',
        group: 'i18n_cache',
      },
    })
  } catch (err) {
    console.error('Failed to cache translation in DB:', err)
  }

  return NextResponse.json({ translations: result, source: 'ai-translated' })
}
