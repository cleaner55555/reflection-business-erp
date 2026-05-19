// ─── Extended Zod Validation Schemas ──────────────────────────────────────────
// Comprehensive validation for all major API entities

import { z } from 'zod'

// ─── Shared field validators ─────────────────────────────────────────────────

export const emailField = z.string().email('Email adresa nije ispravna').or(z.literal(''))
export const phoneField = z.string().regex(/^[\d\s\-\+\(\)]*$/, 'Neispravan format telefona').optional()
export const pibField = z.string().regex(/^\d{9}$/, 'PIB mora imati tačno 9 cifara').optional().or(z.literal(''))
export const maticniBrField = z.string().regex(/^\d{8}$/, 'Matični broj mora imati tačno 8 cifara').optional().or(z.literal(''))
// Accepts string or number, outputs number
export const numOrStr = z.union([z.number(), z.string().transform(Number)])
export const numOpt = z.union([z.number(), z.string().transform(Number)]).optional()

// ─── Partners / Klijenti / Dobavljači ────────────────────────────────────────

export const partnerSchema = z.object({
  name: z.string().min(1, 'Naziv partnera je obavezan').max(200),
  pib: pibField,
  maticniBr: maticniBrField,
  address: z.string().max(300).optional(),
  city: z.string().max(100).optional(),
  zipCode: z.string().max(20).optional(),
  phone: phoneField,
  email: emailField,
  website: z.string().url('Neispravan URL').optional().or(z.literal('')),
  type: z.enum(['kupac', 'dobavljac', 'partner']).default('kupac'),
  account: z.string().max(30).optional(),
  bank: z.string().max(200).optional(),
  notes: z.string().max(2000).optional(),
  creditLimit: numOpt,
  paymentTerms: numOpt,
  priceListId: z.string().optional(),
  parentId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
})

// ─── Employees / Zaposleni ──────────────────────────────────────────────────

export const employeeSchema = z.object({
  firstName: z.string().min(1, 'Ime je obavezno').max(100),
  lastName: z.string().min(1, 'Prezime je obavezno').max(100),
  email: emailField,
  phone: phoneField,
  position: z.string().max(100).optional(),
  department: z.string().max(100).optional(),
  startDate: z.string().optional(),
  salary: numOpt,
  contractType: z.enum(['full_time', 'part_time', 'contractor', 'intern']).optional(),
  status: z.enum(['active', 'inactive', 'on_leave', 'terminated']).optional(),
  jmbg: z.string().regex(/^\d{13}$/, 'JMBG mora imati tačno 13 cifara').optional().or(z.literal('')),
  bankAccount: z.string().max(30).optional(),
  notes: z.string().max(2000).optional(),
})

// ─── Projects ───────────────────────────────────────────────────────────────

export const projectSchema = z.object({
  name: z.string().min(1, 'Naziv projekta je obavezan').max(200),
  description: z.string().max(5000).optional(),
  status: z.enum(['planning', 'active', 'on_hold', 'completed', 'cancelled']).default('planning'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  budget: numOpt,
  clientId: z.string().optional(),
  assignedTo: z.string().max(100).optional(),
  progress: numOpt,
  tags: z.array(z.string()).optional(),
})

// ─── Transactions ───────────────────────────────────────────────────────────

export const transactionSchema = z.object({
  date: z.string().optional(),
  type: z.enum(['prihod', 'rashod']),
  category: z.string().min(1, 'Kategorija je obavezna'),
  amount: numOrStr,
  description: z.string().min(1, 'Opis je obavezan').max(1000),
  documentRef: z.string().max(50).optional(),
  partnerId: z.string().optional(),
})

// ─── Calendar Events ────────────────────────────────────────────────────────

export const calendarEventSchema = z.object({
  title: z.string().min(1, 'Naziv je obavezan').max(200),
  description: z.string().max(2000).optional(),
  startDate: z.string().min(1, 'Datum početka je obavezan'),
  endDate: z.string().optional(),
  allDay: z.boolean().default(false),
  location: z.string().max(200).optional(),
  category: z.enum(['meeting', 'task', 'reminder', 'personal', 'holiday', 'deadline']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  assignedTo: z.string().max(100).optional(),
  partnerId: z.string().optional(),
  color: z.string().max(7).optional(),
})

// ─── Deals (CRM) ────────────────────────────────────────────────────────────

export const dealSchema = z.object({
  title: z.string().min(1, 'Naziv posla je obavezan').max(200),
  value: numOrStr.default(0),
  stage: z.enum(['lead', 'kvalifikacija', 'predlog', 'pregovaranje', 'won', 'lost']).default('lead'),
  probability: numOpt,
  source: z.enum(['manual', 'web', 'referral', 'cold_call', 'email', 'social', 'trade_show', 'advertising', 'other']).optional(),
  contactId: z.string().optional(),
  partnerId: z.string().optional(),
  assignedTo: z.string().max(100).optional(),
  closeDate: z.string().optional(),
  notes: z.string().max(5000).optional(),
  tags: z.array(z.string()).optional(),
  lostReason: z.string().max(500).optional(),
})

// ─── Purchase Orders ────────────────────────────────────────────────────────

export const purchaseOrderItemSchema = z.object({
  productId: z.string().min(1),
  productName: z.string().min(1),
  quantity: numOrStr,
  unitPrice: numOrStr,
})

export const purchaseOrderSchema = z.object({
  partnerId: z.string().min(1, 'Dobavljač je obavezan'),
  number: z.string().min(1, 'Broj narudžbenice je obavezan'),
  date: z.string().optional(),
  status: z.enum(['nacrt', 'poslata', 'primljena', 'otkazana']).default('nacrt'),
  notes: z.string().max(2000).optional(),
  items: z.array(purchaseOrderItemSchema).min(1, 'Narudžbenica mora imati najmanje jednu stavku'),
})

// ─── Vehicles ───────────────────────────────────────────────────────────────

export const vehicleSchema = z.object({
  plate: z.string().min(1, 'Registracija je obavezna').max(20),
  brand: z.string().min(1, 'Marka je obavezna').max(50),
  model: z.string().min(1, 'Model je obavezan').max(50),
  year: numOrStr,
  vin: z.string().max(17).optional(),
  fuelType: z.enum(['diesel', 'gasoline', 'electric', 'hybrid', 'lpg', 'cng']).optional(),
  mileage: numOpt,
  status: z.enum(['active', 'maintenance', 'out_of_service', 'sold']).optional(),
  notes: z.string().max(2000).optional(),
})

// ─── Properties (Real Estate) ───────────────────────────────────────────────

export const propertySchema = z.object({
  title: z.string().min(1, 'Naziv nekretnine je obavezan').max(200),
  type: z.enum(['apartment', 'house', 'commercial', 'land', 'garage', 'office']).default('apartment'),
  transactionType: z.enum(['sale', 'rent', 'both']).default('sale'),
  status: z.enum(['available', 'reserved', 'sold', 'rented', 'off_market']).default('available'),
  address: z.string().max(300).optional(),
  city: z.string().max(100).optional(),
  neighborhood: z.string().max(100).optional(),
  area: numOpt,
  landArea: numOpt,
  price: numOpt,
  bedrooms: numOpt,
  bathrooms: numOpt,
  yearBuilt: numOpt,
  notes: z.string().max(2000).optional(),
})

// ─── Reservations (Restaurant) ──────────────────────────────────────────────

export const reservationSchema = z.object({
  guestName: z.string().min(1, 'Ime gosta je obavezno').max(200),
  phone: z.string().min(1, 'Telefon je obavezan').max(30),
  email: emailField,
  date: z.string().min(1, 'Datum je obavezan'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Format vremena mora biti HH:MM').default('19:00'),
  partySize: numOrStr.default(2),
  tableNo: z.string().max(20).optional(),
  area: z.enum(['indoor', 'outdoor', 'terrace', 'vip', 'bar']).optional(),
  occasion: z.string().max(200).optional(),
  specialRequests: z.string().max(1000).optional(),
  notes: z.string().max(1000).optional(),
})

// ─── Surveys ────────────────────────────────────────────────────────────────

export const surveySchema = z.object({
  title: z.string().min(1, 'Naslov ankete je obavezan').max(200),
  description: z.string().max(2000).optional(),
  status: z.enum(['draft', 'active', 'closed', 'archived']).default('draft'),
  targetAudience: z.string().max(200).optional(),
  questions: z.array(z.object({
    id: z.string(),
    text: z.string().min(1),
    type: z.enum(['text', 'single_choice', 'multiple_choice', 'rating', 'yes_no']),
    options: z.array(z.string()).optional(),
    required: z.boolean().default(false),
  })).min(1, 'Anketa mora imati najmanje jedno pitanje'),
})

// ─── CRM Activities ─────────────────────────────────────────────────────────

export const crmActivitySchema = z.object({
  type: z.enum(['poziv', 'sastanak', 'email', 'task', 'napomena']),
  title: z.string().min(1, 'Naslov aktivnosti je obavezan').max(200),
  description: z.string().max(5000).optional(),
  dueDate: z.string().optional(),
  priority: z.enum(['nizak', 'srednji', 'visok', 'hitan']).default('srednji'),
  assignedTo: z.string().max(100).optional(),
  contactId: z.string().optional(),
  dealId: z.string().optional(),
})

// ─── Webhooks ───────────────────────────────────────────────────────────────

export const webhookSchema = z.object({
  name: z.string().min(1, 'Naziv je obavezan').max(100),
  url: z.string().url('Neispravan URL'),
  events: z.array(z.string()).min(1, 'Izaberite barem jedan event'),
  secret: z.string().max(100).optional(),
  isActive: z.boolean().default(true),
})

// ─── API Keys ───────────────────────────────────────────────────────────────

export const apiKeySchema = z.object({
  name: z.string().min(1, 'Naziv API ključa je obavezan').max(100),
  permissions: z.array(z.enum(['read', 'write', 'admin'])).min(1),
  expiresAt: z.string().optional(),
})

// ─── Roles ──────────────────────────────────────────────────────────────────

export const roleSchema = z.object({
  name: z.string().min(1, 'Naziv role je obavezan').max(50),
  displayName: z.string().min(1, 'Prikazani naziv je obavezan').max(100),
  description: z.string().max(500).optional(),
  permissions: z.string().min(1, 'Dozvole su obavezne'),
  isDefault: z.boolean().default(false),
})

// ─── Helper: validate and return parsed data or error response ──────────────

export function validate<T>(schema: z.ZodType<T>, data: unknown):
  { success: true; data: T } | { success: false; errors: Record<string, string[]>; message: string } {
  const result = schema.safeParse(data)
  if (result.success) return { success: true, data: result.data }

  const flattened = result.error.flatten()
  const fieldErrors = (flattened.fieldErrors || {}) as Record<string, string[]>
  const messages = Object.entries(fieldErrors)
    .filter(([, errs]) => errs && errs.length > 0)
    .map(([field, errs]) => `${field}: ${errs![0]}`)

  return {
    success: false,
    errors: fieldErrors,
    message: messages.length > 0 ? messages.join('; ') : 'Neispravni podaci',
  }
}
