import { db } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import {
  invoiceEmail,
  paymentReminderEmail,
  taskAssignedEmail,
  weeklyReportEmail,
  getEmailTemplate,
} from '@/lib/email-templates'

// ── Type mapping: Notification.type → template handler ───────────────────────
type NotificationTemplateMap = {
  [key: string]: (data: Record<string, unknown>) => {
    subject: string
    html: string
    text: string
  }
}

const TEMPLATE_MAP: NotificationTemplateMap = {
  invoice_created: invoiceEmail,
  payment_reminder: paymentReminderEmail,
  task_assigned: taskAssignedEmail,
  weekly_report: weeklyReportEmail,
}

// ── Main function: send notification as email ────────────────────────────────
export async function sendNotificationEmail(
  notificationId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Load notification from DB
    const notification = await db.notification.findUnique({
      where: { id: notificationId },
      include: {
        company: true,
      },
    })

    if (!notification) {
      return { success: false, error: `Notifikacija ID ${notificationId} nije pronađena` }
    }

    // 2. Determine template
    const templateHandler = TEMPLATE_MAP[notification.type]
    if (!templateHandler) {
      console.log(
        `📧 [SKIP] Nema templejta za tip notifikacije: "${notification.type}". Raspoloživi: ${Object.keys(TEMPLATE_MAP).join(', ')}`,
      )
      return { success: false, error: `Nema templejta za tip: ${notification.type}` }
    }

    // 3. Build template data based on notification type + entityType/entityId
    const templateData = await buildTemplateData(notification)

    // 4. Generate email content
    const emailContent = templateHandler(templateData)

    // 5. Determine recipient
    let recipientEmail = ''
    if (notification.userId) {
      // Find the user's email
      const user = await db.user.findUnique({
        where: { id: notification.userId },
      })
      if (user) {
        recipientEmail = user.email
      }
    }

    // Fallback: use company email
    if (!recipientEmail && notification.company?.email) {
      recipientEmail = notification.company.email
    }

    if (!recipientEmail) {
      return { success: false, error: 'Nema email adrese primaoca' }
    }

    // 6. Send email
    const result = await sendEmail({
      to: recipientEmail,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    })

    return result
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('📧 [NOTIFICATION EMAIL ERROR]', msg)
    return { success: false, error: msg }
  }
}

// ── Build template data based on notification context ────────────────────────
async function buildTemplateData(
  notification: {
    type: string
    entityType?: string | null
    entityId?: string | null
    title: string
    message: string
    companyId: string
    company: { name: string; email?: string | null }
  },
): Promise<Record<string, unknown>> {
  const data: Record<string, unknown> = {
    companyName: notification.company?.name || 'Nepoznato',
  }

  // Try to load related entity data
  if (notification.entityType && notification.entityId) {
    switch (notification.entityType) {
      case 'invoice': {
        const invoice = await db.invoice.findUnique({
          where: { id: notification.entityId },
          include: { partner: true },
        })
        if (invoice) {
          data.number = invoice.number
          data.amount = `${invoice.totalAmount.toLocaleString('sr-RS')} ${invoice.currency || 'RSD'}`
          data.dueDate = new Date(invoice.dueDate).toLocaleDateString('sr-RS')
          data.partnerName = invoice.partner?.name || 'Nepoznat partner'
        }
        break
      }
      case 'project_task':
      case 'task': {
        // Try to find task data from message/title parsing
        data.taskName = notification.title
        data.projectName = 'Nepoznato'
        data.assigneeName = ''
        break
      }
      default:
        break
    }
  }

  // For generic template fallback, pass title/message
  data.title = notification.title
  data.message = notification.message

  return data
}

// ── Convenience: send email from notification type + custom data ─────────────
export async function sendTypedNotificationEmail(
  type: string,
  data: Record<string, unknown>,
  to: string,
): Promise<{ success: boolean; error?: string }> {
  const content = getEmailTemplate(type, data)
  if (!content) {
    return { success: false, error: `Nepoznat tip templejta: ${type}` }
  }

  return sendEmail({
    to,
    subject: content.subject,
    html: content.html,
    text: content.text,
  })
}
