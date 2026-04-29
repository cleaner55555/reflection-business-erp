import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'
import { COUNTRY_TAX_LAWS, getTaxLaw } from '@/lib/tax-laws'

// ============ IN-MEMORY CACHE FOR UPDATE STATUS ============
const updateCache: Record<string, {
  verifiedAt: string | null
  changes: { field: string; oldValue: string; newValue: string }[]
  status: 'verified' | 'updated' | 'error' | 'not_verified'
  message?: string
}> = {}

// Search queries per country for tax rate verification
const TAX_SEARCH_QUERIES: Record<string, string[]> = {
  RS: ['Srbija PDV stopa 2025', 'Srbija porez na dobit 2025 stopa', 'Srbija minimalna plata 2025'],
  DE: ['Germany VAT rate 2025', 'Germany corporate tax rate 2025', 'Germany minimum wage 2025'],
  FR: ['France TVA taux 2025', 'France impôt sociétés 2025', 'France SMIC 2025'],
  GB: ['UK VAT rate 2025', 'UK corporation tax 2025', 'UK national minimum wage 2025'],
  IT: ['Italia IVA aliquota 2025', 'Italia IRES 2025', 'Italia stipendio minimo 2025'],
  ES: ['España IVA tipo 2025', 'España impuesto sociedades 2025', 'España salario mínimo 2025'],
  HR: ['Hrvatska PDV stopa 2025', 'Hrvatska porez na dobit 2025', 'Hrvatska minimalna plaća 2025'],
  BA: ['Bosna PDV stopa 2025', 'BIH porez na dobit 2025'],
  ME: ['Crna Gora PDV stopa 2025', 'Crna Gora porez na dobit 2025'],
  MK: ['Severna Makedonija DDV 2025', 'Makedonija porez na dobit 2025'],
  SI: ['Slovenija DDV 2025', 'Slovenija dohodnina 2025'],
  PL: ['Polska VAT 2025 stawka', 'Polska podatek dochodowy 2025', 'Polska minimalne wynagrodzenie 2025'],
  CZ: ['Česko DPH 2025', 'Česko daň z příjmu 2025'],
  AT: ['Österreich USt 2025', 'Österreich Körperschaftsteuer 2025'],
  NL: ['Nederlanden BTW 2025', 'Nederlanden vennootschapsbelasting 2025'],
  BE: ['Belgique TVA 2025', 'Belgique impôt sociétés 2025'],
  US: ['US federal corporate tax rate 2025', 'US federal income tax brackets 2025'],
  CA: ['Canada GST rate 2025', 'Canada corporate tax rate 2025'],
  TR: ['Türkiye KDV oran 2025', 'Türkiye kurumlar vergisi 2025'],
  AE: ['UAE VAT rate 2025', 'UAE corporate tax 2025'],
  SE: ['Sverige moms 2025', 'Sverige bolagsskatt 2025'],
  DK: ['Danmark moms 2025', 'Danmark selskabsskat 2025'],
  RO: ['România TVA 2025', 'România impozit profit 2025'],
  BG: ['България ДДС 2025', 'България корпоративен данък 2025'],
  GR: ['Ελλάδα ΦΠΑ 2025', 'Ελλάδα φόρος εισοδήματος 2025'],
  PT: ['Portugal IVA 2025', 'Portugal IRC 2025'],
}

const FALLBACK_QUERIES = [
  '{country} VAT rate 2025',
  '{country} corporate tax rate 2025',
  '{country} minimum wage 2025',
]

// Country names in English for search
const COUNTRY_NAMES: Record<string, string> = {
  RS: 'Serbia', DE: 'Germany', FR: 'France', GB: 'United Kingdom', IT: 'Italy',
  ES: 'Spain', NL: 'Netherlands', BE: 'Belgium', AT: 'Austria', PL: 'Poland',
  CZ: 'Czech Republic', HR: 'Croatia', BA: 'Bosnia and Herzegovina', MK: 'North Macedonia',
  ME: 'Montenegro', SI: 'Slovenia', LU: 'Luxembourg', IE: 'Ireland', CH: 'Switzerland',
  RO: 'Romania', BG: 'Bulgaria', US: 'United States', CA: 'Canada', TR: 'Turkey',
  AE: 'United Arab Emirates', SE: 'Sweden', DK: 'Denmark', GR: 'Greece', PT: 'Portugal',
}

async function searchTaxInfo(query: string): Promise<string[]> {
  try {
    const zai = await ZAI.create()
    const results = await zai.functions.invoke('web_search', {
      query: query,
      num: 5,
    })
    return results.map((r: any) => `${r.name}: ${r.snippet}`).filter(Boolean)
  } catch {
    return []
  }
}

// Use LLM to intelligently extract tax rates from search results
async function extractRatesWithAI(
  countryName: string,
  countryCode: string,
  searchSnippets: string[],
  currentRates: { vat: number; corporateTax: number; minWage: number; currency: string }
): Promise<{
  vat: number | null
  corporateTax: number | null
  minWage: number | null
  incomeTax: number | null
  confidence: 'high' | 'medium' | 'low'
  summary: string
}> {
  if (searchSnippets.length === 0) {
    return { vat: null, corporateTax: null, minWage: null, incomeTax: null, confidence: 'low', summary: 'No search results' }
  }

  try {
    const zai = await ZAI.create()
    const prompt = `You are a tax law expert. Analyze these web search results about ${countryName} (${countryCode}) tax rates for 2025.

Current stored rates:
- VAT/GST standard rate: ${currentRates.vat}%
- Corporate tax rate: ${currentRates.corporateTax}%
- Minimum wage: ${currentRates.minWage} ${currentRates.currency}

Search results:
${searchSnippets.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Extract the CURRENT 2025 tax rates. Return ONLY valid JSON (no markdown, no explanation):
{
  "vat": <number or null>,
  "corporateTax": <number or null>,
  "minWage": <number or null>,
  "incomeTax": <number or null>,
  "confidence": "high" or "medium" or "low",
  "summary": "<brief description of what you found, 1-2 sentences>"
}

Only extract rates you are confident about. If unsure, return null.`

    const response = await zai.chat.completions.create({
      model: 'default',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
    })

    const content = response.choices?.[0]?.message?.content || ''
    // Try to parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return { vat: null, corporateTax: null, minWage: null, incomeTax: null, confidence: 'low', summary: 'Could not parse AI response' }
    }

    const parsed = JSON.parse(jsonMatch[0])
    return {
      vat: typeof parsed.vat === 'number' ? parsed.vat : null,
      corporateTax: typeof parsed.corporateTax === 'number' ? parsed.corporateTax : null,
      minWage: typeof parsed.minWage === 'number' ? parsed.minWage : null,
      incomeTax: typeof parsed.incomeTax === 'number' ? parsed.incomeTax : null,
      confidence: parsed.confidence || 'low',
      summary: parsed.summary || '',
    }
  } catch {
    // Fallback to regex extraction
    return extractRatesFallback(searchSnippets, currentRates)
  }
}

// Fallback regex extraction
function extractRatesFallback(
  searchSnippets: string[],
  currentRates: { vat: number; corporateTax: number; minWage: number; currency: string }
) {
  const fullText = searchSnippets.join(' ')

  function extractFirstRate(patterns: RegExp[]): number | null {
    for (const pattern of patterns) {
      const matches = fullText.match(pattern)
      if (matches) {
        const num = parseFloat(matches[1].replace(/[\s,]/g, ''))
        if (!isNaN(num) && num > 0 && num < 100) return num
      }
    }
    return null
  }

  const vat = extractFirstRate([
    /VAT.*?(\d+(?:\.\d+)?)\s*%/gi,
    /PDV.*?(\d+(?:\.\d+)?)\s*%/gi,
    /TVA.*?(\d+(?:\.\d+)?)\s*%/gi,
    /IVA.*?(\d+(?:\.\d+)?)\s*%/gi,
    /MwSt.*?(\d+(?:\.\d+)?)\s*%/gi,
    /BTW.*?(\d+(?:\.\d+)?)\s*%/gi,
    /moms.*?(\d+(?:\.\d+)?)\s*%/gi,
    /DPH.*?(\d+(?:\.\d+)?)\s*%/gi,
    /DDV.*?(\d+(?:\.\d+)?)\s*%/gi,
    /standard.*?rate.*?(\d+(?:\.\d+)?)\s*%/gi,
  ])

  const corporateTax = extractFirstRate([
    /corporate.*?tax.*?(\d+(?:\.\d+)?)\s*%/gi,
    /porez.*?dobit.*?(\d+(?:\.\d+)?)\s*%/gi,
    /impôt.*?sociétés.*?(\d+(?:\.\d+)?)\s*%/gi,
    /Körperschaftsteuer.*?(\d+(?:\.\d+)?)\s*%/gi,
  ])

  return {
    vat,
    corporateTax,
    minWage: null,
    incomeTax: null,
    confidence: 'low' as const,
    summary: 'Extracted via regex fallback',
  }
}

// ============ CHECK SINGLE COUNTRY ============

async function checkCountry(
  countryCode: string,
  companyId?: string | null
): Promise<{
  countryCode: string
  verifiedAt: string
  changes: { field: string; oldValue: string; newValue: string }[]
  status: 'verified' | 'updated' | 'error'
  message: string
  confidence?: string
  summary?: string
}> {
  const law = getTaxLaw(countryCode)
  if (!law) {
    return {
      countryCode,
      verifiedAt: new Date().toISOString(),
      changes: [],
      status: 'error',
      message: `Unknown country: ${countryCode}`,
    }
  }

  try {
    // Get search queries
    const queries = TAX_SEARCH_QUERIES[countryCode] || FALLBACK_QUERIES.map(
      q => q.replace('{country}', COUNTRY_NAMES[countryCode] || countryCode)
    )

    // Search in parallel (max 2 at a time)
    let allSnippets: string[] = []
    for (let i = 0; i < queries.length; i += 2) {
      const batch = queries.slice(i, i + 2)
      const batchResults = await Promise.all(batch.map(q => searchTaxInfo(q)))
      allSnippets = allSnippets.concat(...batchResults.flat())
    }

    // Use AI to extract rates
    const extracted = await extractRatesWithAI(
      law.name,
      countryCode,
      allSnippets,
      { vat: law.vat.standardRate, corporateTax: law.corporateTax.rate, minWage: law.payroll.minimumWage, currency: law.currency }
    )

    const changes: { field: string; oldValue: string; newValue: string }[] = []

    // Compare extracted rates with current rates
    if (extracted.vat !== null && extracted.vat !== law.vat.standardRate && extracted.confidence !== 'low') {
      changes.push({ field: `VAT (${countryCode})`, oldValue: `${law.vat.standardRate}%`, newValue: `${extracted.vat}%` })
    }
    if (extracted.corporateTax !== null && extracted.corporateTax !== law.corporateTax.rate && extracted.confidence !== 'low') {
      changes.push({ field: `Corporate Tax (${countryCode})`, oldValue: `${law.corporateTax.rate}%`, newValue: `${extracted.corporateTax}%` })
    }
    if (extracted.minWage !== null && extracted.minWage !== law.payroll.minimumWage && extracted.confidence !== 'low') {
      changes.push({ field: `Min Wage (${countryCode})`, oldValue: `${law.payroll.minimumWage} ${law.currency}`, newValue: `${extracted.minWage} ${law.currency}` })
    }

    const result: {
      countryCode: string
      verifiedAt: string
      changes: typeof changes
      status: 'verified' | 'updated'
      message: string
      confidence: string
      summary: string
    } = {
      countryCode,
      verifiedAt: new Date().toISOString(),
      changes,
      status: changes.length > 0 ? 'updated' : 'verified',
      message: changes.length > 0 ? `Found ${changes.length} potential changes` : (extracted.summary || 'Tax laws appear to be up to date'),
      confidence: extracted.confidence,
      summary: extracted.summary,
    }

    // Save to in-memory cache
    updateCache[countryCode] = {
      verifiedAt: result.verifiedAt,
      changes: result.changes,
      status: result.status,
      message: result.message,
    }

    // Also save to DB if companyId provided
    if (companyId && companyId !== '') {
      const settingKey = `tax_update_${countryCode}`
      const existing = await db.appSetting.findFirst({
        where: { companyId, key: settingKey },
      })

      const updateData = JSON.stringify({
        verifiedAt: result.verifiedAt,
        extractedRates: extracted,
        changes: result.changes,
        sources: allSnippets.slice(0, 3),
      })

      if (existing) {
        await db.appSetting.update({
          where: { id: existing.id },
          data: { value: updateData, updatedAt: new Date() },
        })
      } else {
        await db.appSetting.create({
          data: {
            companyId,
            key: settingKey,
            label: `Tax Update - ${countryCode}`,
            value: updateData,
            type: 'json',
            group: 'tax_laws',
          },
        })
      }
    }

    return result
  } catch (error: any) {
    return {
      countryCode,
      verifiedAt: new Date().toISOString(),
      changes: [],
      status: 'error',
      message: error.message || 'Update check failed',
    }
  }
}

// ============ POST: CHECK UPDATES ============

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json()
    const { countryCode, batch } = body
    const companyId = request.headers.get('x-company-id')

    // BATCH MODE: Check all countries
    if (batch === true) {
      const countries = COUNTRY_TAX_LAWS.map(c => c.code)
      const results: any[] = []
      let totalChanges = 0

      // Process countries in groups of 3 (to avoid rate limiting)
      for (let i = 0; i < countries.length; i += 3) {
        const batchCountries = countries.slice(i, i + 3)
        const batchResults = await Promise.all(
          batchCountries.map(code => checkCountry(code, companyId))
        )
        results.push(...batchResults)
        totalChanges += batchResults.reduce((sum, r) => sum + r.changes.length, 0)
      }

      return NextResponse.json({
        status: 'batch_complete',
        totalCountries: countries.length,
        totalChanges,
        results,
        verifiedAt: new Date().toISOString(),
      })
    }

    // SINGLE COUNTRY MODE
    if (!countryCode) {
      return NextResponse.json({ error: 'countryCode is required' }, { status: 400 })
    }

    const result = await checkCountry(countryCode, companyId)
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      error: error.message || 'Update failed',
    }, { status: 500 })
  }
}

// ============ GET: LAST UPDATE STATUS ============

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const countryCode = searchParams.get('code') || 'RS'
    const companyId = request.headers.get('x-company-id')

    // First check in-memory cache
    const cached = updateCache[countryCode]
    if (cached) {
      return NextResponse.json({
        countryCode,
        lastVerified: cached.verifiedAt,
        status: cached.status,
        changes: cached.changes,
        message: cached.message,
      })
    }

    // Then check DB (only if companyId is provided)
    if (companyId && companyId !== '') {
      const setting = await db.appSetting.findFirst({
        where: { companyId, key: `tax_update_${countryCode}` },
      })

      if (setting) {
        const data = JSON.parse(setting.value || '{}')
        return NextResponse.json({
          countryCode,
          lastVerified: data.verifiedAt || setting.updatedAt,
          status: 'verified',
          changes: data.changes || [],
          extractedRates: data.extractedRates || null,
        })
      }
    }

    // No data found
    return NextResponse.json({
      countryCode,
      lastVerified: null,
      status: 'not_verified',
      changes: [],
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
