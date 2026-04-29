import { db } from '@/lib/db'
import { DEFAULT_ROLES } from './company-context'

// Simple password hashing using SHA-256 (for demo/development)
// In production, use bcrypt or argon2
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + 'reflection_salt_2024')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password)
  return passwordHash === hash
}

export { hashPassword, verifyPassword }

/**
 * Seed the database with default data
 */
export async function seedDatabase() {
  // Check if already seeded
  const existingCompany = await db.company.findFirst()
  if (existingCompany) {
    console.log('Database already seeded, skipping...')
    return
  }

  console.log('Seeding database...')

  // Create default company
  const company = await db.company.create({
    data: {
      name: 'Reflection Business Demo',
      pib: '123456789',
      maticniBr: '12345678',
      address: 'Bulevar Mihajla Pupina 10',
      city: 'Beograd',
      zipCode: '11070',
      phone: '+381 11 123 4567',
      email: 'info@reflection.rs',
      website: 'https://reflection.rs',
      bankName: 'Intesa',
      bankAccount: '160-0000000123456-78',
      plan: 'pro',
      isActive: true,
    },
  })
  console.log(`Created company: ${company.name} (${company.id})`)

  // Create default roles
  for (const [key, roleData] of Object.entries(DEFAULT_ROLES)) {
    const role = await db.role.create({
      data: {
        name: key,
        displayName: roleData.displayName,
        description: roleData.description,
        permissions: roleData.permissions,
        isDefault: roleData.isDefault,
      },
    })
    console.log(`Created role: ${role.displayName}`)
  }

  // Create admin user
  const adminRole = await db.role.findUnique({ where: { name: 'admin' } })
  if (adminRole) {
    const adminPassword = await hashPassword('admin123')
    const admin = await db.user.create({
      data: {
        email: 'admin@reflection.rs',
        passwordHash: adminPassword,
        firstName: 'Admin',
        lastName: 'Reflection',
        isSuperAdmin: true,
        isActive: true,
      },
    })
    console.log(`Created admin user: ${admin.email}`)

    // Link admin to company
    await db.userCompany.create({
      data: {
        userId: admin.id,
        companyId: company.id,
        roleId: adminRole.id,
        isDefault: true,
        jobTitle: 'Administrator',
      },
    })
    console.log(`Linked admin to company`)
  }

  console.log('Database seeded successfully!')
}
