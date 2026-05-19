import nodemailer, { type Transporter } from 'nodemailer'

// ── Types ────────────────────────────────────────────────────────────────────
export interface EmailPayload {
  to: string | string[]
  subject: string
  html: string
  text?: string
  cc?: string | string[]
  bcc?: string | string[]
  replyTo?: string
}

export interface SendResult {
  success: boolean
  messageId?: string
  error?: string
}

// ── SMTP Config from env ─────────────────────────────────────────────────────
function getSmtpConfig() {
  return {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || '',
    secure: process.env.SMTP_SECURE === 'true',
  }
}

export function isSmtpConfigured(): boolean {
  const c = getSmtpConfig()
  return !!(c.host && c.user && c.pass && c.from)
}

// ── Singleton transporter ────────────────────────────────────────────────────
let _transporter: Transporter | null = null

function getTransporter(): Transporter | null {
  if (_transporter) return _transporter

  const c = getSmtpConfig()
  if (!c.host || !c.user || !c.pass) return null

  _transporter = nodemailer.createTransport({
    host: c.host,
    port: c.port,
    secure: c.secure,
    auth: { user: c.user, pass: c.pass },
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    rateLimit: 10,
  })

  return _transporter
}

// ── sendEmail ────────────────────────────────────────────────────────────────
export async function sendEmail(payload: EmailPayload): Promise<SendResult> {
  const c = getSmtpConfig()

  // Fallback: log to console when SMTP is not configured
  if (!isSmtpConfigured()) {
    console.log('📧 [EMAIL - CONSOLE FALLBACK] SMTP not configured. Email would be sent:')
    console.log(`  To: ${Array.isArray(payload.to) ? payload.to.join(', ') : payload.to}`)
    console.log(`  Subject: ${payload.subject}`)
    console.log(`  From: ${c.from || '(not configured)'}`)
    if (payload.cc) console.log(`  CC: ${Array.isArray(payload.cc) ? payload.cc.join(', ') : payload.cc}`)
    if (payload.bcc) console.log(`  BCC: ${Array.isArray(payload.bcc) ? payload.bcc.join(', ') : payload.bcc}`)
    console.log(`  HTML:\n${payload.html.substring(0, 500)}${payload.html.length > 500 ? '...(truncated)' : ''}`)
    return { success: true, messageId: `console-${Date.now()}` }
  }

  try {
    const transporter = getTransporter()
    if (!transporter) {
      return { success: false, error: 'Could not create SMTP transporter' }
    }

    const info = await transporter.sendMail({
      from: `"${c.from}" <${c.from}>`,
      to: Array.isArray(payload.to) ? payload.to.join(', ') : payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
      cc: payload.cc ? (Array.isArray(payload.cc) ? payload.cc.join(', ') : payload.cc) : undefined,
      bcc: payload.bcc ? (Array.isArray(payload.bcc) ? payload.bcc.join(', ') : payload.bcc) : undefined,
      replyTo: payload.replyTo,
    })

    return { success: true, messageId: info.messageId }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('📧 [EMAIL ERROR]', msg)
    return { success: false, error: msg }
  }
}

// ── sendEmailBatch (rate limited: max 10/second) ─────────────────────────────
export async function sendEmailBatch(
  emails: EmailPayload[],
  onProgress?: (index: number, total: number, result: SendResult) => void,
): Promise<{ sent: number; failed: number; results: SendResult[] }> {
  const results: SendResult[] = []
  let sent = 0
  let failed = 0

  const BATCH_SIZE = 10
  const BATCH_DELAY_MS = 1000 // 1 second between batches

  for (let i = 0; i < emails.length; i += BATCH_SIZE) {
    const batch = emails.slice(i, i + BATCH_SIZE)

    const batchResults = await Promise.allSettled(
      batch.map((email) => sendEmail(email)),
    )

    batchResults.forEach((result, idx) => {
      const r =
        result.status === 'fulfilled'
          ? result.value
          : { success: false, error: result.reason?.message || String(result.reason) }
      results.push(r)
      if (r.success) sent++
      else failed++

      if (onProgress) {
        onProgress(i + idx, emails.length, r)
      }
    })

    // Rate limiting: wait before next batch
    if (i + BATCH_SIZE < emails.length) {
      await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS))
    }
  }

  return { sent, failed, results }
}

// ── verifySmtpConnection ─────────────────────────────────────────────────────
export async function verifySmtpConnection(): Promise<{ success: boolean; error?: string }> {
  const transporter = getTransporter()
  if (!transporter) {
    return { success: false, error: 'SMTP not configured' }
  }

  try {
    await transporter.verify()
    return { success: true }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return { success: false, error: msg }
  }
}
