import { describe, it, expect } from 'vitest'
import {
  partnerSchema,
  employeeSchema,
  projectSchema,
  transactionSchema,
  dealSchema,
  vehicleSchema,
  propertySchema,
  reservationSchema,
  webhookSchema,
  apiKeySchema,
  roleSchema,
  validate,
} from './schemas'

describe('partnerSchema', () => {
  it('validates correct data', () => {
    const result = partnerSchema.safeParse({
      name: 'Test Company',
      type: 'kupac',
      email: 'test@test.com',
      phone: '+38111111111',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid email', () => {
    const result = partnerSchema.safeParse({
      name: 'Test',
      type: 'kupac',
      email: 'not-an-email',
    })
    expect(result.success).toBe(false)
  })

  it('accepts empty string for email', () => {
    const result = partnerSchema.safeParse({
      name: 'Test',
      type: 'kupac',
      email: '',
    })
    expect(result.success).toBe(true)
  })

  it('accepts all three partner types', () => {
    for (const type of ['kupac', 'dobavljac', 'partner'] as const) {
      expect(partnerSchema.safeParse({ name: 'Test', type, email: '' }).success).toBe(true)
    }
  })

  it('rejects empty name', () => {
    const result = partnerSchema.safeParse({ name: '', type: 'kupac' })
    expect(result.success).toBe(false)
  })

  it('accepts valid PIB (9 digits)', () => {
    const result = partnerSchema.safeParse({ name: 'Test', type: 'kupac', pib: '123456789', email: '' })
    expect(result.success).toBe(true)
  })

  it('rejects invalid PIB (not 9 digits)', () => {
    const result = partnerSchema.safeParse({ name: 'Test', type: 'kupac', pib: '12345' })
    expect(result.success).toBe(false)
  })

  it('accepts all optional fields', () => {
    const result = partnerSchema.safeParse({
      name: 'Test',
      pib: '123456789',
      maticniBr: '12345678',
      address: 'Main St 1',
      city: 'Belgrade',
      zipCode: '11000',
      phone: '+381111111',
      email: 'test@test.com',
      website: 'https://test.com',
      type: 'partner',
      account: '265-1234567-89',
      bank: 'Banka Intesa',
      notes: 'Some notes',
      creditLimit: 10000,
      paymentTerms: 30,
      priceListId: 'pl1',
      parentId: 'p1',
      tags: ['vip', 'important'],
      isActive: true,
    })
    expect(result.success).toBe(true)
  })
})

describe('employeeSchema', () => {
  it('validates correct data', () => {
    const result = employeeSchema.safeParse({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      department: 'Engineering',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty firstName', () => {
    expect(employeeSchema.safeParse({ firstName: '', lastName: 'Doe' }).success).toBe(false)
  })

  it('rejects empty lastName', () => {
    expect(employeeSchema.safeParse({ firstName: 'John', lastName: '' }).success).toBe(false)
  })

  it('accepts valid JMBG (13 digits)', () => {
    const result = employeeSchema.safeParse({
      firstName: 'John',
      lastName: 'Doe',
      email: '',
      jmbg: '1234567890123',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid JMBG', () => {
    const result = employeeSchema.safeParse({
      firstName: 'John',
      lastName: 'Doe',
      jmbg: '12345',
    })
    expect(result.success).toBe(false)
  })

  it('accepts contract types', () => {
    for (const type of ['full_time', 'part_time', 'contractor', 'intern'] as const) {
      expect(employeeSchema.safeParse({
        firstName: 'A', lastName: 'B', email: '', contractType: type,
      }).success).toBe(true)
    }
  })

  it('accepts status values', () => {
    for (const status of ['active', 'inactive', 'on_leave', 'terminated'] as const) {
      expect(employeeSchema.safeParse({
        firstName: 'A', lastName: 'B', email: '', status,
      }).success).toBe(true)
    }
  })
})

describe('projectSchema', () => {
  it('validates correct data', () => {
    const result = projectSchema.safeParse({ name: 'My Project' })
    expect(result.success).toBe(true)
  })

  it('rejects empty name', () => {
    expect(projectSchema.safeParse({ name: '' }).success).toBe(false)
  })

  it('applies default status "planning"', () => {
    const result = projectSchema.safeParse({ name: 'Project' })
    if (result.success) expect(result.data.status).toBe('planning')
  })

  it('applies default priority "medium"', () => {
    const result = projectSchema.safeParse({ name: 'Project' })
    if (result.success) expect(result.data.priority).toBe('medium')
  })

  it('accepts all status values', () => {
    for (const s of ['planning', 'active', 'on_hold', 'completed', 'cancelled'] as const) {
      expect(projectSchema.safeParse({ name: 'P', status: s }).success).toBe(true)
    }
  })

  it('accepts all priority values', () => {
    for (const p of ['low', 'medium', 'high', 'urgent'] as const) {
      expect(projectSchema.safeParse({ name: 'P', priority: p }).success).toBe(true)
    }
  })
})

describe('transactionSchema', () => {
  it('accepts valid income transaction', () => {
    const result = transactionSchema.safeParse({
      type: 'prihod',
      category: 'Sales',
      amount: 1000,
      description: 'Invoice payment',
    })
    expect(result.success).toBe(true)
  })

  it('accepts valid expense transaction', () => {
    const result = transactionSchema.safeParse({
      type: 'rashod',
      category: 'Office',
      amount: '500',
      description: 'Office supplies',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid transaction type', () => {
    expect(transactionSchema.safeParse({
      type: 'invalid',
      category: 'Test',
      amount: 100,
      description: 'Test',
    }).success).toBe(false)
  })

  it('rejects missing category', () => {
    expect(transactionSchema.safeParse({
      type: 'prihod',
      category: '',
      amount: 100,
      description: 'Test',
    }).success).toBe(false)
  })

  it('accepts string amount', () => {
    const result = transactionSchema.safeParse({
      type: 'prihod',
      category: 'Sales',
      amount: '1500.50',
      description: 'Test',
    })
    expect(result.success).toBe(true)
  })
})

describe('dealSchema', () => {
  it('accepts valid deal', () => {
    const result = dealSchema.safeParse({ title: 'Big Deal' })
    expect(result.success).toBe(true)
  })

  it('applies default stage "lead"', () => {
    const result = dealSchema.safeParse({ title: 'Deal' })
    if (result.success) expect(result.data.stage).toBe('lead')
  })

  it('accepts all CRM stages', () => {
    for (const stage of ['lead', 'kvalifikacija', 'predlog', 'pregovaranje', 'won', 'lost'] as const) {
      expect(dealSchema.safeParse({ title: 'Deal', stage }).success).toBe(true)
    }
  })
})

describe('vehicleSchema', () => {
  it('accepts valid vehicle', () => {
    const result = vehicleSchema.safeParse({
      plate: 'BG-123-AB',
      brand: 'VW',
      model: 'Golf',
      year: 2020,
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty plate', () => {
    expect(vehicleSchema.safeParse({ plate: '', brand: 'VW', model: 'Golf' }).success).toBe(false)
  })

  it('accepts fuel types', () => {
    for (const ft of ['diesel', 'gasoline', 'electric', 'hybrid', 'lpg', 'cng'] as const) {
      expect(vehicleSchema.safeParse({
        plate: 'P', brand: 'B', model: 'M', year: 2020, fuelType: ft,
      }).success).toBe(true)
    }
  })
})

describe('propertySchema', () => {
  it('accepts valid property', () => {
    const result = propertySchema.safeParse({ title: 'Nice Apartment' })
    expect(result.success).toBe(true)
  })

  it('applies default type "apartment"', () => {
    const result = propertySchema.safeParse({ title: 'Prop' })
    if (result.success) expect(result.data.type).toBe('apartment')
  })

  it('accepts all property types', () => {
    for (const t of ['apartment', 'house', 'commercial', 'land', 'garage', 'office'] as const) {
      expect(propertySchema.safeParse({ title: 'Prop', type: t }).success).toBe(true)
    }
  })
})

describe('webhookSchema', () => {
  it('accepts valid webhook', () => {
    const result = webhookSchema.safeParse({
      name: 'Test Hook',
      url: 'https://example.com/hook',
      events: ['invoice.created'],
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid URL', () => {
    expect(webhookSchema.safeParse({
      name: 'Hook',
      url: 'not-a-url',
      events: ['invoice.created'],
    }).success).toBe(false)
  })

  it('rejects empty events array', () => {
    expect(webhookSchema.safeParse({
      name: 'Hook',
      url: 'https://example.com/hook',
      events: [],
    }).success).toBe(false)
  })

  it('applies default isActive true', () => {
    const result = webhookSchema.safeParse({
      name: 'Hook',
      url: 'https://example.com/hook',
      events: ['invoice.created'],
    })
    if (result.success) expect(result.data.isActive).toBe(true)
  })
})

describe('apiKeySchema', () => {
  it('accepts valid API key', () => {
    const result = apiKeySchema.safeParse({
      name: 'My Key',
      permissions: ['read'],
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty permissions', () => {
    expect(apiKeySchema.safeParse({
      name: 'My Key',
      permissions: [],
    }).success).toBe(false)
  })

  it('accepts all permission levels', () => {
    expect(apiKeySchema.safeParse({
      name: 'Key',
      permissions: ['read', 'write', 'admin'],
    }).success).toBe(true)
  })
})

describe('roleSchema', () => {
  it('accepts valid role', () => {
    const result = roleSchema.safeParse({
      name: 'manager',
      displayName: 'Manager',
      permissions: '{"dashboard":["read"]}',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty name', () => {
    expect(roleSchema.safeParse({
      name: '',
      displayName: 'Role',
      permissions: '{}',
    }).success).toBe(false)
  })

  it('rejects empty permissions', () => {
    expect(roleSchema.safeParse({
      name: 'role',
      displayName: 'Role',
      permissions: '',
    }).success).toBe(false)
  })
})

describe('validate helper', () => {
  it('returns success: true for valid data', () => {
    const result = validate(partnerSchema, { name: 'Test', type: 'kupac', email: '' })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.name).toBe('Test')
  })

  it('returns success: false with errors for invalid data', () => {
    const result = validate(partnerSchema, { name: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.message).toBeTruthy()
      expect(result.errors).toBeDefined()
    }
  })
})
