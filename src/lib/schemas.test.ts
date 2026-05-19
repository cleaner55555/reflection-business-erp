import { describe, it, expect } from 'vitest'
import { partnerSchema, employeeSchema, projectSchema } from './schemas'

describe('Schemas', () => {
  it('partnerSchema validates correct data', () => {
    const result = partnerSchema.safeParse({
      name: 'Test Company',
      type: 'kupac',
      email: 'test@test.com',
      phone: '+38111111111',
    })
    expect(result.success).toBe(true)
  })
  it('partnerSchema rejects invalid email', () => {
    const result = partnerSchema.safeParse({
      name: 'Test',
      type: 'kupac',
      email: 'not-an-email',
    })
    expect(result.success).toBe(false)
  })
  it('employeeSchema validates correct data', () => {
    const result = employeeSchema.safeParse({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      department: 'Engineering',
    })
    expect(result.success).toBe(true)
  })
})
