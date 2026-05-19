// ── Email Templates (Serbian) ────────────────────────────────────────────────
// All email content is in Serbian using inline CSS for compatibility.

interface EmailTemplateResult {
  subject: string
  html: string
  text: string
}

// ── Shared Layout ────────────────────────────────────────────────────────────
function emailLayout(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="sr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);padding:28px 40px;color:#ffffff;">
              <h1 style="margin:0;font-size:20px;font-weight:600;color:#ffffff;">${title}</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;color:#334155;font-size:15px;line-height:1.7;">
              ${bodyHtml}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;background-color:#f8fafc;border-top:1px solid #e2e8f0;color:#94a3b8;font-size:12px;text-align:center;">
              Ova poruka je generisana automatski. Molimo vas da ne odgovarate na ovaj email.<br />
              &copy; ${new Date().getFullYear()} Reflection Business — ERP + CRM Sistem
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<\/tr>/gi, '\n')
    .replace(/<\/td>/gi, ' | ')
    .replace(/<li>/gi, '• ')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

// ── 1. Welcome Email ─────────────────────────────────────────────────────────
export function welcomeEmail(data: {
  firstName: string
  lastName: string
  companyName: string
}): EmailTemplateResult {
  const subject = `Dobrodošli/a u ${data.companyName}!`

  const bodyHtml = `
        <p style="margin-top:0;">Poštovani/a <strong>${data.firstName} ${data.lastName}</strong>,</p>
        <p>Dobrodošli/a u Reflection Business ERP + CRM sistem! Vaš nalog je uspešno kreiran.</p>
        <p>Zahvaljujemo vam se što ste odabrali naš sistem za vođenje poslovanja kompanije <strong>${data.companyName}</strong>.</p>
        <h3 style="color:#0f172a;margin:24px 0 12px;font-size:16px;">Šta možete uraditi odmah?</h3>
        <ul style="margin:0;padding-left:20px;">
          <li style="margin-bottom:8px;">Istražite <strong>Dashboard</strong> za pregled ključnih pokazatelja</li>
          <li style="margin-bottom:8px;">Kreirajte prve fakture u modulu <strong>Fakture</strong></li>
          <li style="margin-bottom:8px;">Dodajte partnere u modulu <strong>Partneri</strong></li>
          <li style="margin-bottom:8px;">Podesite kompaniju u <strong>Podešavanja → Firma</strong></li>
        </ul>
        <p>Ukoliko imate pitanja, naša podrška vam je na raspolaganju.</p>
        <p style="margin-bottom:0;">Srdačan pozdrav,<br /><strong>Tim Reflection Business</strong></p>
  `

  return {
    subject,
    html: emailLayout(subject, bodyHtml),
    text: stripHtml(bodyHtml),
  }
}

// ── 2. Invoice Email ─────────────────────────────────────────────────────────
export function invoiceEmail(data: {
  number: string
  amount: string
  dueDate: string
  partnerName: string
}): EmailTemplateResult {
  const subject = `Nova faktura br. ${data.number} — ${data.partnerName}`

  const bodyHtml = `
        <p style="margin-top:0;">Poštovani,</p>
        <p>Kreirana je nova faktura za kompaniju <strong>${data.partnerName}</strong>.</p>
        <table role="presentation" width="100%" cellpadding="8" cellspacing="0" style="background-color:#f8fafc;border-radius:8px;margin:20px 0;border:1px solid #e2e8f0;">
          <tr>
            <td style="color:#64748b;font-size:13px;padding:8px 16px;border-bottom:1px solid #e2e8f0;">Broj fakture</td>
            <td style="font-weight:600;padding:8px 16px;border-bottom:1px solid #e2e8f0;">${data.number}</td>
          </tr>
          <tr>
            <td style="color:#64748b;font-size:13px;padding:8px 16px;border-bottom:1px solid #e2e8f0;">Iznos</td>
            <td style="font-weight:600;padding:8px 16px;border-bottom:1px solid #e2e8f0;color:#059669;">${data.amount}</td>
          </tr>
          <tr>
            <td style="color:#64748b;font-size:13px;padding:8px 16px;">Rok plaćanja</td>
            <td style="font-weight:600;padding:8px 16px;">${data.dueDate}</td>
          </tr>
        </table>
        <p>Detalje fakture možete pogledati u modulu <strong>Fakture</strong> unutar sistema.</p>
        <p style="margin-bottom:0;">Srdačan pozdrav,<br /><strong>Reflection Business</strong></p>
  `

  return {
    subject,
    html: emailLayout(subject, bodyHtml),
    text: stripHtml(bodyHtml),
  }
}

// ── 3. Payment Reminder Email ────────────────────────────────────────────────
export function paymentReminderEmail(data: {
  number: string
  amount: string
  dueDate: string
  partnerName: string
}): EmailTemplateResult {
  const subject = `⏰ Podsjetnik za plaćanje: faktura br. ${data.number}`

  const bodyHtml = `
        <p style="margin-top:0;">Poštovani,</p>
        <p>Podsjećamo vas da faktura <strong>br. ${data.number}</strong> za partnera <strong>${data.partnerName}</strong> još nije plaćena.</p>
        <table role="presentation" width="100%" cellpadding="8" cellspacing="0" style="background-color:#fef2f2;border-radius:8px;margin:20px 0;border:1px solid #fecaca;">
          <tr>
            <td style="color:#991b1b;font-size:13px;padding:8px 16px;border-bottom:1px solid #fecaca;">Broj fakture</td>
            <td style="font-weight:600;padding:8px 16px;border-bottom:1px solid #fecaca;color:#991b1b;">${data.number}</td>
          </tr>
          <tr>
            <td style="color:#991b1b;font-size:13px;padding:8px 16px;border-bottom:1px solid #fecaca;">Iznos</td>
            <td style="font-weight:600;padding:8px 16px;border-bottom:1px solid #fecaca;color:#991b1b;">${data.amount}</td>
          </tr>
          <tr>
            <td style="color:#991b1b;font-size:13px;padding:8px 16px;">Rok plaćanja</td>
            <td style="font-weight:600;padding:8px 16px;color:#991b1b;">${data.dueDate}</td>
          </tr>
        </table>
        <p>Molimo vas da poduzmete potrebne korake kako bi faktura bila izmirena na vrijeme.</p>
        <p style="margin-bottom:0;">Srdačan pozdrav,<br /><strong>Reflection Business</strong></p>
  `

  return {
    subject,
    html: emailLayout(subject, bodyHtml),
    text: stripHtml(bodyHtml),
  }
}

// ── 4. Task Assigned Email ───────────────────────────────────────────────────
export function taskAssignedEmail(data: {
  taskName: string
  projectName: string
  assigneeName: string
}): EmailTemplateResult {
  const subject = `Novi zadatak: ${data.taskName}`

  const bodyHtml = `
        <p style="margin-top:0;">Poštovani/a <strong>${data.assigneeName}</strong>,</p>
        <p>Dodijeljen vam je novi zadatak u projektu <strong>${data.projectName}</strong>.</p>
        <div style="background-color:#f0fdf4;border-left:4px solid #22c55e;padding:16px 20px;border-radius:0 8px 8px 0;margin:20px 0;">
          <p style="margin:0 0 4px;color:#15803d;font-size:13px;font-weight:600;">📋 ZADATAK</p>
          <p style="margin:0 0 8px;font-size:17px;font-weight:600;color:#0f172a;">${data.taskName}</p>
          <p style="margin:0;color:#64748b;font-size:14px;">Projekat: ${data.projectName}</p>
        </div>
        <p>Detalje zadatka možete pogledati u modulu <strong>Projekti</strong> unutar sistema.</p>
        <p style="margin-bottom:0;">Srdačan pozdrav,<br /><strong>Reflection Business</strong></p>
  `

  return {
    subject,
    html: emailLayout(subject, bodyHtml),
    text: stripHtml(bodyHtml),
  }
}

// ── 5. Weekly Report Email ───────────────────────────────────────────────────
export function weeklyReportEmail(data: {
  companyName: string
  kpis: {
    totalRevenue?: string
    totalExpenses?: string
    newInvoices?: string
    paidInvoices?: string
    openTasks?: string
  }
  topInvoices?: Array<{ number: string; partner: string; amount: string }>
  tasks?: Array<{ name: string; project: string; status: string }>
}): EmailTemplateResult {
  const subject = `📊 Nedeljni izveštaj — ${data.companyName}`

  const kpiRows = Object.entries(data.kpis)
    .filter(([, v]) => v !== undefined)
    .map(([key, value]) => {
      const labels: Record<string, string> = {
        totalRevenue: 'Ukupni prihodi',
        totalExpenses: 'Ukupni rashodi',
        newInvoices: 'Nove fakture',
        paidInvoices: 'Plaćene fakture',
        openTasks: 'Otvoreni zadaci',
      }
      return `
          <tr>
            <td style="color:#64748b;font-size:13px;padding:8px 16px;border-bottom:1px solid #e2e8f0;">${labels[key] || key}</td>
            <td style="font-weight:600;padding:8px 16px;border-bottom:1px solid #e2e8f0;">${value}</td>
          </tr>`
    })
    .join('')

  let topInvoicesHtml = ''
  if (data.topInvoices && data.topInvoices.length > 0) {
    topInvoicesHtml = `
        <h3 style="color:#0f172a;margin:28px 0 12px;font-size:16px;">🏁 Najveće fakture</h3>
        <table role="presentation" width="100%" cellpadding="8" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:16px;">
          <tr style="background-color:#f1f5f9;">
            <th style="text-align:left;font-size:12px;color:#64748b;padding:8px 16px;">Broj</th>
            <th style="text-align:left;font-size:12px;color:#64748b;padding:8px 16px;">Partner</th>
            <th style="text-align:right;font-size:12px;color:#64748b;padding:8px 16px;">Iznos</th>
          </tr>
          ${data.topInvoices
            .map(
              (inv) => `
          <tr>
            <td style="padding:8px 16px;font-size:13px;">${inv.number}</td>
            <td style="padding:8px 16px;font-size:13px;">${inv.partner}</td>
            <td style="padding:8px 16px;font-size:13px;text-align:right;font-weight:600;">${inv.amount}</td>
          </tr>`,
            )
            .join('')}
        </table>`
  }

  let tasksHtml = ''
  if (data.tasks && data.tasks.length > 0) {
    tasksHtml = `
        <h3 style="color:#0f172a;margin:28px 0 12px;font-size:16px;">📌 Aktivni zadaci</h3>
        <ul style="margin:0;padding-left:20px;">
          ${data.tasks.map((t) => `<li style="margin-bottom:6px;font-size:14px;"><strong>${t.name}</strong> (${t.project}) — ${t.status}</li>`).join('')}
        </ul>`
  }

  const bodyHtml = `
        <p style="margin-top:0;">Poštovani,</p>
        <p>Evo vašeg nedeljnog izveštaja za kompaniju <strong>${data.companyName}</strong>.</p>
        <h3 style="color:#0f172a;margin:24px 0 12px;font-size:16px;">📈 Ključni pokazatelji</h3>
        <table role="presentation" width="100%" cellpadding="8" cellspacing="0" style="background-color:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;">
          ${kpiRows}
        </table>
        ${topInvoicesHtml}
        ${tasksHtml}
        <p style="margin-bottom:0;">Srdačan pozdrav,<br /><strong>Reflection Business</strong></p>
  `

  return {
    subject,
    html: emailLayout(subject, bodyHtml),
    text: stripHtml(bodyHtml),
  }
}

// ── Template Registry ────────────────────────────────────────────────────────
export const EMAIL_TEMPLATES = [
  {
    id: 'welcome',
    name: 'Dobrodošlica',
    description: 'Email dobrodošlice za novog korisnika',
    handler: welcomeEmail,
  },
  {
    id: 'invoice_created',
    name: 'Nova faktura',
    description: 'Obavještenje o kreiranoj fakturi',
    handler: invoiceEmail,
  },
  {
    id: 'payment_reminder',
    name: 'Podsjetnik za plaćanje',
    description: 'Podsjetnik za nefakture koje nisu plaćene',
    handler: paymentReminderEmail,
  },
  {
    id: 'task_assigned',
    name: 'Novi zadatak',
    description: 'Obavještenje o dodijeljenom zadatku',
    handler: taskAssignedEmail,
  },
  {
    id: 'weekly_report',
    name: 'Nedeljni izveštaj',
    description: 'Sedmični pregled ključnih pokazatelja',
    handler: weeklyReportEmail,
  },
] as const

export type EmailTemplateId = (typeof EMAIL_TEMPLATES)[number]['id']

export function getTemplateById(id: string) {
  return EMAIL_TEMPLATES.find((t) => t.id === id) || null
}

export function getEmailTemplate(
  templateId: string,
  data: Record<string, unknown>,
): EmailTemplateResult | null {
  const tmpl = getTemplateById(templateId)
  if (!tmpl) return null
  return tmpl.handler(data as Parameters<typeof tmpl.handler>[0])
}
