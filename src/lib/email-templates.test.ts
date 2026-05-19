import { describe, it, expect } from 'vitest'
import {
  welcomeEmail,
  invoiceEmail,
  paymentReminderEmail,
  taskAssignedEmail,
  weeklyReportEmail,
  EMAIL_TEMPLATES,
  getTemplateById,
  getEmailTemplate,
} from './email-templates'

describe('welcomeEmail', () => {
  it('returns subject, html, and text', () => {
    const result = welcomeEmail({
      firstName: 'John',
      lastName: 'Doe',
      companyName: 'ACME Inc.',
    })
    expect(result.subject).toContain('Dobrodošli')
    expect(result.subject).toContain('ACME Inc.')
    expect(result.html).toContain('<!DOCTYPE html>')
    expect(result.text).toBeTruthy()
    expect(typeof result.text).toBe('string')
  })

  it('includes recipient name in the body', () => {
    const result = welcomeEmail({
      firstName: 'Jane',
      lastName: 'Smith',
      companyName: 'Test Corp',
    })
    expect(result.html).toContain('Jane Smith')
    expect(result.text).toContain('Jane Smith')
  })

  it('includes company name in the body', () => {
    const result = welcomeEmail({
      firstName: 'A',
      lastName: 'B',
      companyName: 'My Company',
    })
    expect(result.html).toContain('My Company')
  })
})

describe('invoiceEmail', () => {
  it('returns subject with invoice number and partner', () => {
    const result = invoiceEmail({
      number: 'INV-2024-001',
      amount: '15.000 RSD',
      dueDate: '31.12.2024',
      partnerName: 'Client Corp',
    })
    expect(result.subject).toContain('INV-2024-001')
    expect(result.subject).toContain('Client Corp')
  })

  it('includes invoice details in the body', () => {
    const result = invoiceEmail({
      number: 'INV-001',
      amount: '5.000 RSD',
      dueDate: '15.01.2025',
      partnerName: 'Partner',
    })
    expect(result.html).toContain('INV-001')
    expect(result.html).toContain('5.000 RSD')
    expect(result.html).toContain('15.01.2025')
  })

  it('has text version without HTML tags', () => {
    const result = invoiceEmail({
      number: 'INV-001',
      amount: '100 RSD',
      dueDate: '01.01.2024',
      partnerName: 'Test',
    })
    expect(result.text).not.toContain('<p>')
    expect(result.text).not.toContain('<strong>')
  })
})

describe('paymentReminderEmail', () => {
  it('returns subject with reminder emoji and invoice number', () => {
    const result = paymentReminderEmail({
      number: 'INV-001',
      amount: '10.000 RSD',
      dueDate: '01.12.2024',
      partnerName: 'Partner',
    })
    expect(result.subject).toContain('⏰')
    expect(result.subject).toContain('INV-001')
  })

  it('includes payment amount and due date', () => {
    const result = paymentReminderEmail({
      number: 'INV-002',
      amount: '25.000 RSD',
      dueDate: '15.12.2024',
      partnerName: 'Client',
    })
    expect(result.html).toContain('25.000 RSD')
    expect(result.html).toContain('15.12.2024')
  })
})

describe('taskAssignedEmail', () => {
  it('returns subject with task name', () => {
    const result = taskAssignedEmail({
      taskName: 'Fix Bug #123',
      projectName: 'Website Redesign',
      assigneeName: 'Developer',
    })
    expect(result.subject).toContain('Fix Bug #123')
  })

  it('includes assignee name and project in the body', () => {
    const result = taskAssignedEmail({
      taskName: 'Design UI',
      projectName: 'Mobile App',
      assigneeName: 'Designer',
    })
    expect(result.html).toContain('Designer')
    expect(result.html).toContain('Mobile App')
  })
})

describe('weeklyReportEmail', () => {
  it('includes company name in subject', () => {
    const result = weeklyReportEmail({
      companyName: 'ACME',
      kpis: {},
    })
    expect(result.subject).toContain('ACME')
  })

  it('includes KPIs in the body', () => {
    const result = weeklyReportEmail({
      companyName: 'Test',
      kpis: {
        totalRevenue: '100.000 RSD',
        totalExpenses: '50.000 RSD',
        newInvoices: '5',
      },
    })
    expect(result.html).toContain('100.000 RSD')
    expect(result.html).toContain('50.000 RSD')
  })

  it('includes top invoices when provided', () => {
    const result = weeklyReportEmail({
      companyName: 'Test',
      kpis: {},
      topInvoices: [
        { number: 'INV-001', partner: 'Client A', amount: '10.000 RSD' },
      ],
    })
    expect(result.html).toContain('INV-001')
    expect(result.html).toContain('Client A')
  })

  it('includes tasks when provided', () => {
    const result = weeklyReportEmail({
      companyName: 'Test',
      kpis: {},
      tasks: [
        { name: 'Task 1', project: 'Project A', status: 'In progress' },
      ],
    })
    expect(result.html).toContain('Task 1')
    expect(result.html).toContain('Project A')
  })
})

describe('EMAIL_TEMPLATES registry', () => {
  it('has at least 5 templates', () => {
    expect(EMAIL_TEMPLATES.length).toBeGreaterThanOrEqual(5)
  })

  it('all templates have required fields', () => {
    for (const tmpl of EMAIL_TEMPLATES) {
      expect(tmpl.id).toBeTruthy()
      expect(tmpl.name).toBeTruthy()
      expect(tmpl.description).toBeTruthy()
      expect(typeof tmpl.handler).toBe('function')
    }
  })

  it('has no duplicate ids', () => {
    const ids = EMAIL_TEMPLATES.map(t => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('getTemplateById', () => {
  it('returns the template for a known id', () => {
    const tmpl = getTemplateById('welcome')
    expect(tmpl).not.toBeNull()
    expect(tmpl!.id).toBe('welcome')
  })

  it('returns null for unknown id', () => {
    expect(getTemplateById('nonexistent')).toBeNull()
  })
})

describe('getEmailTemplate', () => {
  it('returns email result for valid template id and data', () => {
    const result = getEmailTemplate('welcome', {
      firstName: 'John',
      lastName: 'Doe',
      companyName: 'ACME',
    })
    expect(result).not.toBeNull()
    expect(result!.subject).toContain('Dobrodošli')
  })

  it('returns null for invalid template id', () => {
    expect(getEmailTemplate('nonexistent', {})).toBeNull()
  })
})
