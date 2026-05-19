import { describe, it, expect } from 'vitest'
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  invoiceSchema,
  contactSchema,
  productSchema,
  companySchema,
  settingsSchema,
  validateRequest,
} from './validations'

describe('loginSchema', () => {
  it('accepts valid login data', () => {
    expect(loginSchema.safeParse({ email: 'test@test.com', password: 'password123' }).success).toBe(true)
  })

  it('rejects invalid email', () => {
    expect(loginSchema.safeParse({ email: 'not-email', password: 'password123' }).success).toBe(false)
  })

  it('rejects short password', () => {
    expect(loginSchema.safeParse({ email: 'test@test.com', password: '12345' }).success).toBe(false)
  })

  it('rejects missing fields', () => {
    expect(loginSchema.safeParse({}).success).toBe(false)
  })
})

describe('registerSchema', () => {
  it('accepts valid registration with strong password', () => {
    const result = registerSchema.safeParse({
      email: 'test@test.com',
      password: 'StrongP@ss1',
      firstName: 'John',
      lastName: 'Doe',
    })
    expect(result.success).toBe(true)
  })

  it('rejects weak password (common password)', () => {
    const result = registerSchema.safeParse({
      email: 'test@test.com',
      password: 'password',
      firstName: 'John',
      lastName: 'Doe',
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing first name', () => {
    const result = registerSchema.safeParse({
      email: 'test@test.com',
      password: 'StrongP@ss1',
      firstName: '',
      lastName: 'Doe',
    })
    expect(result.success).toBe(false)
  })

  it('accepts optional phone field', () => {
    const result = registerSchema.safeParse({
      email: 'test@test.com',
      password: 'StrongP@ss1',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+381111111',
    })
    expect(result.success).toBe(true)
  })
})

describe('forgotPasswordSchema', () => {
  it('accepts valid email', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'test@test.com' }).success).toBe(true)
  })

  it('rejects invalid email', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'bad' }).success).toBe(false)
  })
})

describe('resetPasswordSchema', () => {
  it('accepts valid token and strong password', () => {
    const result = resetPasswordSchema.safeParse({
      token: 'some-token',
      password: 'NewStr0ng!Pass',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty token', () => {
    expect(resetPasswordSchema.safeParse({ token: '', password: 'NewStr0ng!Pass' }).success).toBe(false)
  })

  it('rejects weak password', () => {
    expect(resetPasswordSchema.safeParse({ token: 'tok', password: 'weak' }).success).toBe(false)
  })
})

describe('invoiceSchema', () => {
  const validItem = {
    productId: '1',
    productName: 'Test Product',
    quantity: 2,
    unitPrice: 1000,
  }

  it('accepts valid invoice with items', () => {
    const result = invoiceSchema.safeParse({
      partnerId: 'p1',
      number: 'INV-001',
      dueDate: '2024-12-31',
      items: [validItem],
    })
    expect(result.success).toBe(true)
  })

  it('rejects invoice without items', () => {
    const result = invoiceSchema.safeParse({
      partnerId: 'p1',
      number: 'INV-001',
      dueDate: '2024-12-31',
      items: [],
    })
    expect(result.success).toBe(false)
  })

  it('rejects invoice without partner', () => {
    const result = invoiceSchema.safeParse({
      partnerId: '',
      number: 'INV-001',
      dueDate: '2024-12-31',
      items: [validItem],
    })
    expect(result.success).toBe(false)
  })

  it('applies default status "nacrt"', () => {
    const result = invoiceSchema.safeParse({
      partnerId: 'p1',
      number: 'INV-001',
      dueDate: '2024-12-31',
      items: [validItem],
    })
    if (result.success) {
      expect(result.data.status).toBe('nacrt')
    }
  })

  it('applies default type "izlazna"', () => {
    const result = invoiceSchema.safeParse({
      partnerId: 'p1',
      number: 'INV-001',
      dueDate: '2024-12-31',
      items: [validItem],
    })
    if (result.success) {
      expect(result.data.type).toBe('izlazna')
    }
  })
})

describe('contactSchema', () => {
  it('accepts valid contact with required fields', () => {
    const result = contactSchema.safeParse({
      firstName: 'John',
      lastName: 'Doe',
    })
    expect(result.success).toBe(true)
  })

  it('accepts empty email (as optional)', () => {
    const result = contactSchema.safeParse({
      firstName: 'John',
      lastName: 'Doe',
      email: '',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid email format', () => {
    const result = contactSchema.safeParse({
      firstName: 'John',
      lastName: 'Doe',
      email: 'bad-email',
    })
    expect(result.success).toBe(false)
  })

  it('accepts all optional fields', () => {
    const result = contactSchema.safeParse({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@test.com',
      phone: '+38111111',
      position: 'Developer',
      company: 'ACME',
      partnerId: 'p1',
      notes: 'Some notes',
      tags: ['vip'],
      isClient: true,
      isSupplier: false,
      isLead: true,
    })
    expect(result.success).toBe(true)
  })
})

describe('productSchema', () => {
  it('accepts valid product', () => {
    const result = productSchema.safeParse({
      name: 'Widget',
      sku: 'WDG-001',
      purchasePrice: 100,
      sellingPrice: 200,
    })
    expect(result.success).toBe(true)
  })

  it('rejects product without name', () => {
    expect(productSchema.safeParse({ name: '', sku: 'WDG-001' }).success).toBe(false)
  })

  it('rejects product without SKU', () => {
    expect(productSchema.safeParse({ name: 'Widget', sku: '' }).success).toBe(false)
  })

  it('accepts string prices', () => {
    const result = productSchema.safeParse({
      name: 'Widget',
      sku: 'WDG-001',
      purchasePrice: '100',
      sellingPrice: '200',
    })
    expect(result.success).toBe(true)
  })

  it('applies default unit "kom"', () => {
    const result = productSchema.safeParse({
      name: 'Widget',
      sku: 'WDG-001',
      purchasePrice: 100,
      sellingPrice: 200,
    })
    if (result.success) {
      expect(result.data.unit).toBe('kom')
    }
  })
})

describe('companySchema', () => {
  it('accepts valid company', () => {
    expect(companySchema.safeParse({ name: 'ACME Inc.' }).success).toBe(true)
  })

  it('rejects empty name', () => {
    expect(companySchema.safeParse({ name: '' }).success).toBe(false)
  })

  it('accepts all optional fields', () => {
    expect(companySchema.safeParse({
      name: 'ACME',
      pib: '123456789',
      address: 'Main St 1',
      city: 'Belgrade',
    }).success).toBe(true)
  })
})

describe('settingsSchema', () => {
  it('accepts valid settings', () => {
    expect(settingsSchema.safeParse({ key: 'locale', value: 'sr' }).success).toBe(true)
  })

  it('accepts number value', () => {
    expect(settingsSchema.safeParse({ key: 'limit', value: 100 }).success).toBe(true)
  })

  it('accepts boolean value', () => {
    expect(settingsSchema.safeParse({ key: 'enabled', value: true }).success).toBe(true)
  })

  it('rejects null value', () => {
    expect(settingsSchema.safeParse({ key: 'config', value: null }).success).toBe(false)
  })

  it('rejects missing key', () => {
    expect(settingsSchema.safeParse({ value: 'test' }).success).toBe(false)
  })
})

describe('validateRequest', () => {
  it('returns success with parsed data for valid input', () => {
    const result = validateRequest(loginSchema, { email: 'test@test.com', password: '123456' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.email).toBe('test@test.com')
    }
  })

  it('returns error response for invalid input', () => {
    const result = validateRequest(loginSchema, { email: 'bad' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.response.status).toBe(400)
    }
  })
})
