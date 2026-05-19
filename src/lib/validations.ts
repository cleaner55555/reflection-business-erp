import { z } from 'zod'
import { validatePassword } from './password-policy'

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email('Email adresa nije ispravna'),
  password: z.string().min(6, 'Lozinka mora imati najmanje 6 karaktera'),
})

export const registerSchema = z.object({
  email: z.string().email('Email adresa nije ispravna'),
  password: z.string().min(8, 'Lozinka mora imati najmanje 8 karaktera'),
  firstName: z.string().min(1, 'Ime je obavezno'),
  lastName: z.string().min(1, 'Prezime je obavezno'),
  phone: z.string().optional(),
}).refine(data => {
  const result = validatePassword(data.password)
  return result.valid
}, { message: 'Lozinka ne ispunjava bezbednosne zahteve', path: ['password'] })

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email adresa nije ispravna'),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token je obavezan'),
  password: z.string().min(8, 'Lozinka mora imati najmanje 8 karaktera'),
}).refine(data => {
  const result = validatePassword(data.password)
  return result.valid
}, { message: 'Lozinka ne ispunjava bezbednosne zahteve', path: ['password'] })

// ─── Invoices ─────────────────────────────────────────────────────────────────

const invoiceItemSchema = z.object({
  productId: z.string().min(1, 'ProductId je obavezan'),
  productName: z.string().min(1, 'Naziv proizvoda je obavezan'),
  quantity: z.union([z.string(), z.number()]),
  unitPrice: z.union([z.string(), z.number()]),
  discountPct: z.union([z.string(), z.number()]).optional().default('0'),
  taxRate: z.union([z.string(), z.number()]).optional().default('20'),
})

export const invoiceSchema = z.object({
  partnerId: z.string().min(1, 'Partner je obavezan'),
  number: z.string().min(1, 'Broj fakture je obavezan'),
  dueDate: z.string().min(1, 'Datum valute je obavezan'),
  date: z.string().optional(),
  status: z.string().optional().default('nacrt'),
  type: z.string().optional().default('izlazna'),
  discountPct: z.union([z.string(), z.number()]).optional(),
  notes: z.string().optional(),
  paymentMethod: z.string().optional().default('racun'),
  items: z
    .array(invoiceItemSchema)
    .min(1, 'Faktura mora imati najmanje jednu stavku'),
})

// ─── Contacts ─────────────────────────────────────────────────────────────────

export const contactSchema = z.object({
  firstName: z.string().min(1, 'Ime je obavezno'),
  lastName: z.string().min(1, 'Prezime je obavezno'),
  email: z.string().email('Email adresa nije ispravna').optional().or(z.literal('')),
  phone: z.string().optional(),
  position: z.string().optional(),
  company: z.string().optional(),
  partnerId: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isClient: z.boolean().optional(),
  isSupplier: z.boolean().optional(),
  isLead: z.boolean().optional(),
})

// ─── Products ─────────────────────────────────────────────────────────────────

export const productSchema = z.object({
  name: z.string().min(1, 'Naziv proizvoda je obavezan'),
  sku: z.string().min(1, 'SKU je obavezan'),
  barcode: z.string().optional(),
  category: z.string().optional(),
  unit: z.string().optional().default('kom'),
  purchasePrice: z.union([z.string(), z.number()]),
  sellingPrice: z.union([z.string(), z.number()]),
  minStock: z.union([z.string(), z.number()]).optional().default(0),
  currentStock: z.union([z.string(), z.number()]).optional().default(0),
  description: z.string().optional(),
})

// ─── Companies ────────────────────────────────────────────────────────────────

export const companySchema = z.object({
  name: z.string().min(1, 'Naziv firme je obavezan'),
  pib: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
})

// ─── Settings ─────────────────────────────────────────────────────────────────

export const settingsSchema = z.object({
  key: z.string().min(1, 'Key je obavezan'),
  value: z.union([z.string(), z.number(), z.boolean(), z.record(z.unknown())]),
  group: z.string().optional(),
})

// ─── Helper ───────────────────────────────────────────────────────────────────

/**
 * Validates data against a Zod schema and returns a formatted error response
 * if invalid, or null if valid.
 */
export function validateRequest<T>(
  schema: z.ZodType<T>,
  data: unknown
): { success: true; data: T } | { success: false; response: Response } {
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }

  const flattened = result.error.flatten()
  const fieldErrors: Record<string, string[]> = flattened.fieldErrors as Record<string, string[]>
  const messages: string[] = []

  for (const [field, errors] of Object.entries(fieldErrors)) {
    if (errors && errors.length > 0) {
      messages.push(`${field}: ${errors[0]}`)
    }
  }

  // Fallback to form errors if no field errors
  if (messages.length === 0 && flattened.formErrors.length > 0) {
    messages.push(...flattened.formErrors)
  }

  return {
    success: false,
    response: Response.json(
      {
        error: messages.length > 0 ? messages.join('; ') : 'Neispravni podaci',
        details: fieldErrors,
      },
      { status: 400 }
    ),
  }
}
