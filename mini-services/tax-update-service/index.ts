import { createServer } from 'http'
import { Server } from 'socket.io'

// ─── Configuration ───────────────────────────────────────────────────────────
const PORT = 3021
const BATCH_SIZE = 3          // Countries per batch
const BATCH_DELAY_MS = 3000  // Delay between batches (3 seconds)

// ─── Country Data (inline to avoid importing Next.js module) ─────────────────
const COUNTRIES = [
  { code: 'RS', name: 'Serbia', flag: '🇷🇸', currency: 'RSD', region: 'europe', vat: 20, corpTax: 15, minWage: 47000 },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', currency: 'EUR', region: 'europe', vat: 19, corpTax: 15.825, minWage: 2387 },
  { code: 'FR', name: 'France', flag: '🇫🇷', currency: 'EUR', region: 'europe', vat: 20, corpTax: 25, minWage: 1398 },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', currency: 'GBP', region: 'europe', vat: 20, corpTax: 25, minWage: 1858 },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', currency: 'EUR', region: 'europe', vat: 22, corpTax: 24, minWage: 0 },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', currency: 'EUR', region: 'europe', vat: 21, corpTax: 25, minWage: 1134 },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', currency: 'EUR', region: 'europe', vat: 21, corpTax: 25.8, minWage: 1995 },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪', currency: 'EUR', region: 'europe', vat: 21, corpTax: 25, minWage: 1991 },
  { code: 'AT', name: 'Austria', flag: '🇦🇹', currency: 'EUR', region: 'europe', vat: 20, corpTax: 23, minWage: 1500 },
  { code: 'PL', name: 'Poland', flag: '🇵🇱', currency: 'PLN', region: 'europe', vat: 23, corpTax: 19, minWage: 3222 },
  { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿', currency: 'CZK', region: 'europe', vat: 21, corpTax: 21, minWage: 18675 },
  { code: 'HR', name: 'Croatia', flag: '🇭🇷', currency: 'EUR', region: 'europe', vat: 25, corpTax: 18, minWage: 840 },
  { code: 'BA', name: 'Bosnia and Herzegovina', flag: '🇧🇦', currency: 'BAM', region: 'europe', vat: 17, corpTax: 10, minWage: 655 },
  { code: 'MK', name: 'North Macedonia', flag: '🇲🇰', currency: 'MKD', region: 'europe', vat: 18, corpTax: 10, minWage: 35200 },
  { code: 'ME', name: 'Montenegro', flag: '🇲🇪', currency: 'EUR', region: 'europe', vat: 21, corpTax: 15, minWage: 563 },
  { code: 'SI', name: 'Slovenia', flag: '🇸🇮', currency: 'EUR', region: 'europe', vat: 22, corpTax: 19, minWage: 1253 },
  { code: 'LU', name: 'Luxembourg', flag: '🇱🇺', currency: 'EUR', region: 'europe', vat: 17, corpTax: 24.9, minWage: 2320 },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪', currency: 'EUR', region: 'europe', vat: 23, corpTax: 25, minWage: 2143 },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭', currency: 'CHF', region: 'europe', vat: 8.1, corpTax: 14.9, minWage: 0 },
  { code: 'RO', name: 'Romania', flag: '🇷🇴', currency: 'RON', region: 'europe', vat: 19, corpTax: 16, minWage: 3300 },
  { code: 'BG', name: 'Bulgaria', flag: '🇧🇬', currency: 'BGN', region: 'europe', vat: 20, corpTax: 10, minWage: 933 },
  { code: 'GR', name: 'Greece', flag: '🇬🇷', currency: 'EUR', region: 'europe', vat: 24, corpTax: 22, minWage: 880 },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', currency: 'EUR', region: 'europe', vat: 23, corpTax: 21, minWage: 820 },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪', currency: 'SEK', region: 'europe', vat: 25, corpTax: 20.6, minWage: 0 },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰', currency: 'DKK', region: 'europe', vat: 25, corpTax: 22, minWage: 0 },
  { code: 'US', name: 'United States', flag: '🇺🇸', currency: 'USD', region: 'americas', vat: 0, corpTax: 21, minWage: 0 },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', currency: 'CAD', region: 'americas', vat: 5, corpTax: 15, minWage: 0 },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷', currency: 'TRY', region: 'asia', vat: 20, corpTax: 20, minWage: 20002 },
  { code: 'AE', name: 'UAE', flag: '🇦🇪', currency: 'AED', region: 'asia', vat: 5, corpTax: 9, minWage: 0 },
]

// ─── Search queries per country ──────────────────────────────────────────────
const SEARCH_QUERIES: Record<string, string[]> = {
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
  LU: ['Luxembourg TVA 2025', 'Luxembourg impôt sociétés 2025'],
  IE: ['Ireland VAT rate 2025', 'Ireland corporate tax 2025'],
  CH: ['Switzerland MWSt 2025', 'Switzerland corporate tax 2025'],
}

// ─── Types ───────────────────────────────────────────────────────────────────
interface BatchProgress {
  totalCountries: number
  batchIndex: number
  batchSize: number
  currentCountry: string | null
  processed: number
  changes: number
  results: CountryResult[]
  status: 'idle' | 'running' | 'complete' | 'error'
  startedAt: string | null
  completedAt: string | null
  errorMessage: string | null
}

interface CountryResult {
  code: string
  name: string
  flag: string
  status: 'pending' | 'processing' | 'verified' | 'updated' | 'error'
  changes: { field: string; oldValue: string; newValue: string }[]
  message: string
  verifiedAt: string | null
  confidence: string
  summary: string
}

// ─── State ───────────────────────────────────────────────────────────────────
let currentProgress: BatchProgress = {
  totalCountries: COUNTRIES.length,
  batchIndex: 0,
  batchSize: BATCH_SIZE,
  currentCountry: null,
  processed: 0,
  changes: 0,
  results: COUNTRIES.map(c => ({
    code: c.code,
    name: c.name,
    flag: c.flag,
    status: 'pending' as const,
    changes: [],
    message: '',
    verifiedAt: null,
    confidence: '',
    summary: '',
  })),
  status: 'idle',
  startedAt: null,
  completedAt: null,
  errorMessage: null,
}

let isRunning = false
let autoUpdateInterval: ReturnType<typeof setInterval> | null = null
let autoUpdateEnabled = false

// ─── Helpers ─────────────────────────────────────────────────────────────────
function log(level: 'info' | 'warn' | 'error', msg: string) {
  const ts = new Date().toISOString()
  const prefix = { info: 'INFO ', warn: 'WARN ', error: 'ERROR' }[level]
  console.log(`[${ts}] [${prefix}] ${msg}`)
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ─── Z-AI SDK Functions ──────────────────────────────────────────────────────
async function searchTaxInfo(query: string): Promise<string[]> {
  try {
    const ZAI = await import('z-ai-web-dev-sdk').then(m => m.default)
    const zai = await ZAI.create()
    const results = await zai.functions.invoke('web_search', {
      query: query,
      num: 5,
    })
    return (results || []).map((r: any) => `${r.name || ''}: ${r.snippet || ''}`).filter(Boolean)
  } catch (err) {
    log('warn', `Search failed for "${query}": ${err}`)
    return []
  }
}

async function extractRatesWithAI(
  countryName: string,
  countryCode: string,
  snippets: string[],
  current: { vat: number; corpTax: number; minWage: number; currency: string }
): Promise<{
  vat: number | null
  corporateTax: number | null
  minWage: number | null
  confidence: 'high' | 'medium' | 'low'
  summary: string
}> {
  if (snippets.length === 0) {
    return { vat: null, corporateTax: null, minWage: null, confidence: 'low', summary: 'No search results found' }
  }

  try {
    const ZAI = await import('z-ai-web-dev-sdk').then(m => m.default)
    const zai = await ZAI.create()
    const prompt = `You are a tax law expert. Analyze these web search results about ${countryName} (${countryCode}) tax rates for 2025.

Current stored rates:
- VAT/GST standard rate: ${current.vat}%
- Corporate tax rate: ${current.corpTax}%
- Minimum wage: ${current.minWage} ${current.currency}

Search results:
${snippets.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Extract the CURRENT 2025 tax rates. Return ONLY valid JSON:
{"vat":<number|null>,"corporateTax":<number|null>,"minWage":<number|null>,"confidence":"high"|"medium"|"low","summary":"<1-2 sentences>"}

Only extract rates you are confident about. If unsure, return null.`

    const response = await zai.chat.completions.create({
      model: 'default',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
    })

    const content = response.choices?.[0]?.message?.content || ''
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return { vat: null, corporateTax: null, minWage: null, confidence: 'low', summary: 'Could not parse AI response' }
    }

    const parsed = JSON.parse(jsonMatch[0])
    return {
      vat: typeof parsed.vat === 'number' ? parsed.vat : null,
      corporateTax: typeof parsed.corporateTax === 'number' ? parsed.corporateTax : null,
      minWage: typeof parsed.minWage === 'number' ? parsed.minWage : null,
      confidence: parsed.confidence || 'low',
      summary: parsed.summary || '',
    }
  } catch (err) {
    log('warn', `AI extraction failed for ${countryCode}: ${err}`)
    return { vat: null, corporateTax: null, minWage: null, confidence: 'low', summary: 'AI extraction failed, using fallback' }
  }
}

// ─── Core: Process one country ───────────────────────────────────────────────
async function processCountry(country: typeof COUNTRIES[0]): Promise<CountryResult> {
  const startTime = Date.now()
  log('info', `Processing ${country.flag} ${country.name} (${country.code})...`)

  const queries = SEARCH_QUERIES[country.code] || [
    `${country.name} VAT rate 2025`,
    `${country.name} corporate tax rate 2025`,
    `${country.name} minimum wage 2025`,
  ]

  // Search in batches of 2
  let allSnippets: string[] = []
  for (let i = 0; i < queries.length; i += 2) {
    const batch = queries.slice(i, i + 2)
    const results = await Promise.all(batch.map(q => searchTaxInfo(q)))
    allSnippets = allSnippets.concat(...results.flat())
  }

  // Use AI to extract rates
  const extracted = await extractRatesWithAI(
    country.name,
    country.code,
    allSnippets,
    { vat: country.vat, corpTax: country.corpTax, minWage: country.minWage, currency: country.currency }
  )

  const changes: { field: string; oldValue: string; newValue: string }[] = []

  if (extracted.vat !== null && extracted.vat !== country.vat && extracted.confidence !== 'low') {
    changes.push({ field: `VAT (${country.code})`, oldValue: `${country.vat}%`, newValue: `${extracted.vat}%` })
  }
  if (extracted.corporateTax !== null && extracted.corporateTax !== country.corpTax && extracted.confidence !== 'low') {
    changes.push({ field: `Corp Tax (${country.code})`, oldValue: `${country.corpTax}%`, newValue: `${extracted.corporateTax}%` })
  }
  if (extracted.minWage !== null && extracted.minWage !== country.minWage && extracted.confidence !== 'low') {
    changes.push({ field: `Min Wage (${country.code})`, oldValue: `${country.minWage} ${country.currency}`, newValue: `${extracted.minWage} ${country.currency}` })
  }

  const elapsed = Date.now() - startTime
  const status: CountryResult['status'] = changes.length > 0 ? 'updated' : 'verified'
  const message = changes.length > 0
    ? `Found ${changes.length} potential changes`
    : (extracted.summary || 'Tax laws appear up to date')

  log('info', `${country.flag} ${country.name}: ${status} (${elapsed}ms) - ${message}`)

  return {
    code: country.code,
    name: country.name,
    flag: country.flag,
    status,
    changes,
    message,
    verifiedAt: new Date().toISOString(),
    confidence: extracted.confidence,
    summary: extracted.summary,
  }
}

// ─── Core: Run batch update ─────────────────────────────────────────────────
async function runBatchUpdate(
  io: Server,
  socketId: string,
  countryCodes?: string[], // optional: specific countries only
): Promise<void> {
  if (isRunning) {
    io.to(socketId).emit('error', { message: 'Update already in progress' })
    return
  }

  isRunning = true
  const targets = countryCodes
    ? COUNTRIES.filter(c => countryCodes.includes(c.code))
    : COUNTRIES

  // Reset progress
  currentProgress = {
    totalCountries: targets.length,
    batchIndex: 0,
    batchSize: BATCH_SIZE,
    currentCountry: null,
    processed: 0,
    changes: 0,
    results: targets.map(c => ({
      code: c.code,
      name: c.name,
      flag: c.flag,
      status: 'pending' as const,
      changes: [],
      message: '',
      verifiedAt: null,
      confidence: '',
      summary: '',
    })),
    status: 'running',
    startedAt: new Date().toISOString(),
    completedAt: null,
    errorMessage: null,
  }

  io.to(socketId).emit('batch-start', { totalCountries: targets.length, batchSize: BATCH_SIZE })
  log('info', `Starting batch update: ${targets.length} countries in batches of ${BATCH_SIZE}`)

  try {
    // Process in batches
    for (let i = 0; i < targets.length; i += BATCH_SIZE) {
      const batch = targets.slice(i, i + BATCH_SIZE)
      currentProgress.batchIndex = Math.floor(i / BATCH_SIZE)

      // Process each country in the batch
      for (const country of batch) {
        currentProgress.currentCountry = country.code
        const resultIndex = currentProgress.results.findIndex(r => r.code === country.code)
        if (resultIndex >= 0) {
          currentProgress.results[resultIndex].status = 'processing'
        }

        // Send progress update for current country
        io.to(socketId).emit('country-start', {
          code: country.code,
          name: country.name,
          flag: country.flag,
          index: i + batch.indexOf(country),
          total: targets.length,
        })

        try {
          const result = await processCountry(country)
          if (resultIndex >= 0) {
            currentProgress.results[resultIndex] = result
          }
          currentProgress.processed++
          currentProgress.changes += result.changes.length

          io.to(socketId).emit('country-done', result)
        } catch (err: any) {
          if (resultIndex >= 0) {
            currentProgress.results[resultIndex].status = 'error'
            currentProgress.results[resultIndex].message = err.message || 'Processing failed'
          }
          currentProgress.processed++
          io.to(socketId).emit('country-done', {
            code: country.code,
            name: country.name,
            flag: country.flag,
            status: 'error',
            changes: [],
            message: err.message || 'Processing failed',
            verifiedAt: new Date().toISOString(),
            confidence: 'low',
            summary: '',
          })
        }
      }

      // Emit batch progress
      io.to(socketId).emit('batch-progress', {
        batchIndex: currentProgress.batchIndex,
        processed: currentProgress.processed,
        total: targets.length,
        changes: currentProgress.changes,
        results: currentProgress.results,
      })

      // Delay between batches (except after last batch)
      if (i + BATCH_SIZE < targets.length) {
        io.to(socketId).emit('batch-delay', {
          message: `Batch ${currentProgress.batchIndex + 1} complete, waiting ${BATCH_DELAY_MS / 1000}s before next batch...`,
          delay: BATCH_DELAY_MS,
        })
        await sleep(BATCH_DELAY_MS)
      }
    }

    // Complete
    currentProgress.status = 'complete'
    currentProgress.completedAt = new Date().toISOString()
    currentProgress.currentCountry = null

    io.to(socketId).emit('batch-complete', {
      totalCountries: targets.length,
      totalChanges: currentProgress.changes,
      results: currentProgress.results,
      verifiedAt: currentProgress.completedAt,
    })

    log('info', `Batch update complete: ${targets.length} countries, ${currentProgress.changes} changes found`)

  } catch (err: any) {
    currentProgress.status = 'error'
    currentProgress.errorMessage = err.message || 'Batch update failed'
    io.to(socketId).emit('error', { message: err.message || 'Batch update failed' })
    log('error', `Batch update failed: ${err.message}`)
  } finally {
    isRunning = false
  }
}

// ─── Auto-Update Scheduler ───────────────────────────────────────────────────
function startAutoUpdate(io: Server) {
  if (autoUpdateInterval) return
  autoUpdateEnabled = true

  // Run every 6 hours
  autoUpdateInterval = setInterval(() => {
    if (!isRunning && autoUpdateEnabled) {
      log('info', 'Auto-update triggered (scheduled)')
      // Process in background - no socket to send to directly
      runAutoUpdateBackground(io)
    }
  }, 6 * 60 * 60 * 1000)

  log('info', 'Auto-update scheduler started (every 6 hours)')
}

function stopAutoUpdate() {
  if (autoUpdateInterval) {
    clearInterval(autoUpdateInterval)
    autoUpdateInterval = null
  }
  autoUpdateEnabled = false
  log('info', 'Auto-update scheduler stopped')
}

async function runAutoUpdateBackground(io: Server) {
  if (isRunning) return

  isRunning = true
  const targets = COUNTRIES

  currentProgress = {
    totalCountries: targets.length,
    batchIndex: 0,
    batchSize: BATCH_SIZE,
    currentCountry: null,
    processed: 0,
    changes: 0,
    results: targets.map(c => ({
      code: c.code, name: c.name, flag: c.flag,
      status: 'pending' as const, changes: [], message: '',
      verifiedAt: null, confidence: '', summary: '',
    })),
    status: 'running',
    startedAt: new Date().toISOString(),
    completedAt: null,
    errorMessage: null,
  }

  log('info', `Auto-update started: ${targets.length} countries`)

  try {
    for (let i = 0; i < targets.length; i += BATCH_SIZE) {
      const batch = targets.slice(i, i + BATCH_SIZE)
      currentProgress.batchIndex = Math.floor(i / BATCH_SIZE)

      for (const country of batch) {
        currentProgress.currentCountry = country.code
        const resultIndex = currentProgress.results.findIndex(r => r.code === country.code)
        if (resultIndex >= 0) {
          currentProgress.results[resultIndex].status = 'processing'
        }

        // Broadcast to all connected sockets
        io.emit('auto-country-start', {
          code: country.code, name: country.name, flag: country.flag,
          index: i + batch.indexOf(country), total: targets.length,
        })

        try {
          const result = await processCountry(country)
          if (resultIndex >= 0) currentProgress.results[resultIndex] = result
          currentProgress.processed++
          currentProgress.changes += result.changes.length
          io.emit('auto-country-done', result)
        } catch (err: any) {
          if (resultIndex >= 0) {
            currentProgress.results[resultIndex].status = 'error'
            currentProgress.results[resultIndex].message = err.message || 'Failed'
          }
          currentProgress.processed++
          io.emit('auto-country-done', {
            code: country.code, name: country.name, flag: country.flag,
            status: 'error', changes: [], message: err.message || 'Failed',
            verifiedAt: new Date().toISOString(), confidence: 'low', summary: '',
          })
        }
      }

      io.emit('auto-batch-progress', {
        batchIndex: currentProgress.batchIndex,
        processed: currentProgress.processed,
        total: targets.length,
        changes: currentProgress.changes,
        results: currentProgress.results,
      })

      if (i + BATCH_SIZE < targets.length) {
        await sleep(BATCH_DELAY_MS)
      }
    }

    currentProgress.status = 'complete'
    currentProgress.completedAt = new Date().toISOString()
    currentProgress.currentCountry = null

    io.emit('auto-batch-complete', {
      totalCountries: targets.length,
      totalChanges: currentProgress.changes,
      results: currentProgress.results,
      verifiedAt: currentProgress.completedAt,
    })

    log('info', `Auto-update complete: ${targets.length} countries, ${currentProgress.changes} changes`)
  } catch (err: any) {
    currentProgress.status = 'error'
    currentProgress.errorMessage = err.message
    log('error', `Auto-update failed: ${err.message}`)
  } finally {
    isRunning = false
  }
}

// ─── WebSocket Server ────────────────────────────────────────────────────────
const httpServer = createServer()
const ioServer = new Server(httpServer, {
  path: '/',
  cors: { origin: '*', methods: ['GET', 'POST'] },
  pingTimeout: 60000,
  pingInterval: 25000,
})

ioServer.on('connection', (socket) => {
  log('info', `Client connected: ${socket.id}`)

  // Send current status on connect
  socket.emit('status', {
    isRunning,
    autoUpdateEnabled,
    progress: currentProgress,
  })

  // Start manual batch update
  socket.on('start-batch', (data?: { countries?: string[] }) => {
    log('info', `Manual batch update requested by ${socket.id}`)
    socket.join(socket.id)
    runBatchUpdate(ioServer, socket.id, data?.countries)
  })

  // Get current progress
  socket.on('get-progress', () => {
    socket.emit('progress', currentProgress)
  })

  // Toggle auto-update
  socket.on('set-auto-update', (data: { enabled: boolean }) => {
    if (data.enabled) {
      startAutoUpdate(ioServer)
    } else {
      stopAutoUpdate()
    }
    socket.emit('auto-update-status', { enabled: autoUpdateEnabled })
  })

  // Get auto-update status
  socket.on('get-auto-update', () => {
    socket.emit('auto-update-status', { enabled: autoUpdateEnabled })
  })

  // Process single country
  socket.on('check-country', async (data: { countryCode: string }) => {
    const country = COUNTRIES.find(c => c.code === data.countryCode)
    if (!country) {
      socket.emit('error', { message: `Unknown country: ${data.countryCode}` })
      return
    }
    socket.join(socket.id)
    socket.emit('country-start', {
      code: country.code, name: country.name, flag: country.flag,
      index: 0, total: 1,
    })
    try {
      const result = await processCountry(country)
      socket.emit('country-done', result)
    } catch (err: any) {
      socket.emit('country-done', {
        code: country.code, name: country.name, flag: country.flag,
        status: 'error', changes: [], message: err.message || 'Failed',
        verifiedAt: new Date().toISOString(), confidence: 'low', summary: '',
      })
    }
  })

  socket.on('disconnect', () => {
    log('info', `Client disconnected: ${socket.id}`)
  })
})

httpServer.listen(PORT, () => {
  log('info', `Tax Update Service running on port ${PORT}`)
  log('info', `Batch size: ${BATCH_SIZE} countries, delay: ${BATCH_DELAY_MS / 1000}s between batches`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  log('info', 'Shutting down...')
  if (autoUpdateInterval) clearInterval(autoUpdateInterval)
  httpServer.close(() => process.exit(0))
})

process.on('SIGINT', () => {
  log('info', 'Shutting down...')
  if (autoUpdateInterval) clearInterval(autoUpdateInterval)
  httpServer.close(() => process.exit(0))
})
