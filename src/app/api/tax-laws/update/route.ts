import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

// Search queries per country for tax rate verification
const TAX_SEARCH_QUERIES: Record<string, string[]> = {
  RS: ['Srbija PDV stopa 2025', 'Srbija porez na dobit 2025 stopa', 'Srbija minimalna plata 2025', 'Srbija doprinosi zaposleni 2025'],
  DE: ['Germany VAT rate 2025', 'Germany corporate tax rate 2025', 'Germany minimum wage 2025'],
  FR: ['France TVA taux 2025', 'France impôt sociétés 2025', 'France SMIC 2025'],
  GB: ['UK VAT rate 2025', 'UK corporation tax 2025', 'UK minimum wage 2025'],
  IT: ['Italia IVA aliquota 2025', 'Italia IRES 2025', 'Italia stipendio minimo 2025'],
  ES: ['España IVA tipo 2025', 'España impuesto sociedades 2025', 'España salario mínimo 2025'],
  HR: ['Hrvatska PDV stopa 2025', 'Hrvatska porez na dobit 2025', 'Hrvatska minimalna plaća 2025'],
  BA: ['Bosna i Hercegovina PDV stopa 2025', 'BIH porez na dobit 2025'],
  ME: ['Crna Gora PDV stopa 2025', 'Crna Gora porez na dobit 2025'],
  MK: ['Severna Makedonija DDV 2025', 'Makedonija porez na dobit 2025'],
  SI: ['Slovenija DDV 2025', 'Slovenija dohodnina 2025'],
  PL: ['Polska VAT 2025 stawka', 'Polska podatek dochodowy 2025', 'Polska minimalna 2025'],
  CZ: ['Česko DPH 2025', 'Česko daň z příjmu 2025'],
  AT: ['Österreich USt 2025', 'Österreich Körperschaftsteuer 2025'],
  NL: ['Nederlanden BTW 2025', 'Nederlanden vennootschapsbelasting 2025'],
  BE: ['Belgique TVA 2025', 'Belgique impôt sociétés 2025'],
  US: ['US federal corporate tax rate 2025', 'US federal income tax brackets 2025'],
  CA: ['Canada GST rate 2025', 'Canada corporate tax rate 2025'],
  TR: ['Türkiye KDV oran 2025', 'Türkiye kurumlar vergisi 2025'],
  AE: ['UAE VAT rate 2025', 'UAE corporate tax 2025'],
}

const FALLBACK_QUERIES = [
  '{country} VAT rate 2025',
  '{country} corporate tax rate 2025',
  '{country} income tax rate 2025',
  '{country} minimum wage 2025',
  '{country} social security contributions 2025',
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

interface TaxUpdateResult {
  countryCode: string
  verifiedAt: string
  changes: { field: string; oldValue: string; newValue: string; source: string }[]
  status: 'verified' | 'updated' | 'error'
  message: string
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

// Simple rate extraction from text
function extractRate(text: string, field: string): number | null {
  // Look for percentage patterns
  const patterns: Record<string, RegExp[]> = {
    vat: [/(\d+(?:\.\d+)?)\s*%/g, /VAT.*?(\d+(?:\.\d+)?)/gi, /PDV.*?(\d+(?:\.\d+)?)/gi, /TVA.*?(\d+(?:\.\d+)?)/gi, /MwSt.*?(\d+(?:\.\d+)?)/gi],
    corporate: [/(\d+(?:\.\d+)?)\s*%/g, /corporate.*?(\d+(?:\.\d+)?)/gi, /porez.*?(\d+(?:\.\d+)?)/gi],
    minWage: [/(\d[\d\s,.]*)\s*(?:EUR|€|RSD|USD|\$|BAM|MKD|PLN|CZK|RON|BGN|TRY|AED|SEK|DKK|CHF)/gi],
  }
  
  const fieldPatterns = patterns[field] || patterns.vat
  for (const pattern of fieldPatterns) {
    const matches = text.match(pattern)
    if (matches) {
      const num = parseFloat(matches[1].replace(/[\s,]/g, ''))
      if (!isNaN(num) && num > 0 && num < 100) return num
    }
  }
  return null
}

// POST /api/tax-laws/update - Check for tax law updates via web search
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { countryCode } = body
    const companyId = request.headers.get('x-company-id')

    if (!countryCode) {
      return NextResponse.json({ error: 'countryCode is required' }, { status: 400 })
    }

    const results: TaxUpdateResult = {
      countryCode,
      verifiedAt: new Date().toISOString(),
      changes: [],
      status: 'verified',
      message: '',
    }

    // Get queries for this country
    const queries = TAX_SEARCH_QUERIES[countryCode] || FALLBACK_QUERIES.map(
      q => q.replace('{country}', COUNTRY_NAMES[countryCode] || countryCode)
    )

    // Search in parallel (max 3 at a time to avoid rate limiting)
    let allSnippets: string[] = []
    for (let i = 0; i < queries.length; i += 3) {
      const batch = queries.slice(i, i + 3)
      const batchResults = await Promise.all(batch.map(q => searchTaxInfo(q)))
      allSnippets = allSnippets.concat(...batchResults.flat())
    }

    const fullText = allSnippets.join(' ')

    // Extract potential new rates
    const extractedVAT = extractRate(fullText, 'vat')
    const extractedCorp = extractRate(fullText, 'corporate')

    // Check against stored override
    if (companyId) {
      const existingSetting = await db.appSetting.findFirst({
        where: { companyId, key: `tax_override_${countryCode}` },
      })

      if (existingSetting) {
        const overrides = JSON.parse(existingSetting.value || '{}')
        results.message = 'Existing overrides found, checking for changes...'
        
        // If we found new rates, compare and update
        if (extractedVAT && extractedVAT !== overrides.vatStandardRate) {
          results.changes.push({
            field: 'vatStandardRate',
            oldValue: String(overrides.vatStandardRate),
            newValue: String(extractedVAT),
            source: allSnippets[0] || 'web search',
          })
          overrides.vatStandardRate = extractedVAT
        }
        
        if (extractedCorp && extractedCorp !== overrides.corporateTaxRate) {
          results.changes.push({
            field: 'corporateTaxRate',
            oldValue: String(overrides.corporateTaxRate),
            newValue: String(extractedCorp),
            source: allSnippets[0] || 'web search',
          })
          overrides.corporateTaxRate = extractedCorp
        }

        if (results.changes.length > 0) {
          overrides.verifiedAt = new Date().toISOString()
          overrides.sources = allSnippets.slice(0, 5)
          await db.appSetting.update({
            where: { id: existingSetting.id },
            data: { value: JSON.stringify(overrides), updatedAt: new Date() },
          })
          results.status = 'updated'
          results.message = `Found ${results.changes.length} potential changes`
        }
      } else {
        // No override exists yet, create initial one with extracted data
        const overrides: Record<string, any> = {
          verifiedAt: new Date().toISOString(),
          sources: allSnippets.slice(0, 5),
        }
        if (extractedVAT) overrides.vatStandardRate = extractedVAT
        if (extractedCorp) overrides.corporateTaxRate = extractedCorp

        await db.appSetting.create({
          data: {
            companyId,
            key: `tax_override_${countryCode}`,
            label: `Tax Law Override - ${countryCode}`,
            value: JSON.stringify(overrides),
            type: 'json',
            group: 'tax_laws',
          },
        })
        results.message = 'Initial verification completed'
        results.status = 'verified'
      }
    } else {
      results.message = 'No company ID provided, search results only'
      results.status = 'verified'
    }

    return NextResponse.json({
      ...results,
      searchResults: allSnippets.slice(0, 5),
      extractedRates: { vat: extractedVAT, corporate: extractedCorp },
    })
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      error: error.message || 'Update failed',
    }, { status: 500 })
  }
}

// GET /api/tax-laws/update - Get last update status for a country
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const countryCode = searchParams.get('code') || 'RS'
    const companyId = request.headers.get('x-company-id')

    if (!companyId) {
      return NextResponse.json({ error: 'companyId required' }, { status: 400 })
    }

    const setting = await db.appSetting.findFirst({
      where: { companyId, key: `tax_override_${countryCode}` },
    })

    if (!setting) {
      return NextResponse.json({
        countryCode,
        lastVerified: null,
        overrides: null,
        status: 'not_verified',
      })
    }

    const overrides = JSON.parse(setting.value || '{}')
    return NextResponse.json({
      countryCode,
      lastVerified: overrides.verifiedAt || setting.updatedAt,
      overrides,
      sources: overrides.sources || [],
      status: 'verified',
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
