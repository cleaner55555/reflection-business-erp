import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Mock data generators for each entity type

interface SyncResult {
  entityType: string
  totalRecords: number
  successRecords: number
  failedRecords: number
  errors: string[]
  details: Record<string, unknown>[]
}

const MOCK_PARTNERS = [
  {
    name: 'ABC doo Beograd',
    pib: '108492847',
    maticniBr: '21018327',
    address: 'Bulevar Mihajla Pupina 10',
    city: 'Beograd',
    zipCode: '11070',
    phone: '+381 11 234 5678',
    email: 'info@abc-doo.rs',
    type: 'partner',
    bank: 'Banca Intesa',
    account: '160-345678-12',
  },
  {
    name: 'Delta Trade d.o.o.',
    pib: '109876543',
    maticniBr: '17529810',
    address: 'Industrijska zona bb',
    city: 'Novi Sad',
    zipCode: '21000',
    phone: '+381 21 456 7890',
    email: 'office@deltatrade.rs',
    type: 'dobavljac',
    bank: 'Erste Bank',
    account: '160-987654-34',
  },
  {
    name: 'Morava Commerce',
    pib: '112345678',
    maticniBr: '20194083',
    address: 'Trg Kralja Milana 5',
    city: 'Niš',
    zipCode: '18000',
    phone: '+381 18 567 890',
    email: 'kontakt@morava-commerce.rs',
    type: 'kupac',
    bank: 'Raiffeisen Bank',
    account: '160-112233-56',
  },
  {
    name: 'Zvezda Inženjering',
    pib: '105678901',
    maticniBr: '17052841',
    address: 'Vojvode Stepe 88',
    city: 'Beograd',
    zipCode: '11000',
    phone: '+381 11 345 6789',
    email: 'inzenjering@zvezda.rs',
    type: 'partner',
    bank: 'UniCredit Bank',
    account: '160-445566-78',
  },
  {
    name: 'Balkan Logistics',
    pib: '114567890',
    maticniBr: '19085732',
    address: 'Dimitrija Tucovića 22',
    city: 'Subotica',
    zipCode: '24000',
    phone: '+381 24 678 9012',
    email: 'logistika@balkan.rs',
    type: 'dobavljac',
    bank: 'OTP Bank',
    account: '160-778899-01',
  },
]

const MOCK_PRODUCTS = [
  {
    name: 'Kancelarijski papir A4 80g',
    sku: 'PAP-A4-80',
    barcode: '8606012345678',
    category: 'Kancelarijski materijal',
    unit: 'pak',
    purchasePrice: 350,
    sellingPrice: 520,
    minStock: 20,
    currentStock: 150,
  },
  {
    name: 'Tonercartuž HP 26A crni',
    sku: 'TON-HP26A-BK',
    barcode: '8606023456789',
    category: 'Potrošni materijal',
    unit: 'kom',
    purchasePrice: 3200,
    sellingPrice: 4800,
    minStock: 5,
    currentStock: 12,
  },
  {
    name: 'USB C kabel 1.5m',
    sku: 'KAB-USBC-15',
    barcode: '8606034567890',
    category: 'IT oprema',
    unit: 'kom',
    purchasePrice: 280,
    sellingPrice: 450,
    minStock: 30,
    currentStock: 85,
  },
  {
    name: 'Binders A4 plavi 50mm',
    sku: 'BIN-A4-B50',
    barcode: '8606045678901',
    category: 'Kancelarijski materijal',
    unit: 'kom',
    purchasePrice: 120,
    sellingPrice: 210,
    minStock: 50,
    currentStock: 200,
  },
  {
    name: 'Monitor LED 24" Full HD',
    sku: 'MON-LED24-FHD',
    barcode: '8606056789012',
    category: 'IT oprema',
    unit: 'kom',
    purchasePrice: 18500,
    sellingPrice: 24500,
    minStock: 3,
    currentStock: 8,
  },
]

const MOCK_TRANSACTIONS = [
  {
    date: new Date(),
    type: 'prihod',
    category: 'promet',
    amount: 48500,
    description: 'Plaćanje fakture br. FAK-2024-089 — ABC doo',
    documentRef: 'FAK-2024-089',
  },
  {
    date: new Date(),
    type: 'rashod',
    category: 'nabavka',
    amount: 22400,
    description: 'Nabavka kancelarijskog materijala — Delta Trade',
    documentRef: 'NAB-2024-034',
  },
  {
    date: new Date(),
    type: 'prihod',
    category: 'promet',
    amount: 120000,
    description: 'Plaćanje ugovora o saradnji — Zvezda Inženjering',
    documentRef: 'UGO-2024-012',
  },
]

const MOCK_CONTACTS = [
  {
    firstName: 'Jelena',
    lastName: 'Popović',
    email: 'jelena.popovic@abc-doo.rs',
    phone: '+381 63 111 2233',
    position: 'Komercijalista',
    company: 'ABC doo Beograd',
    isClient: true,
    isSupplier: false,
    isLead: false,
  },
  {
    firstName: 'Marko',
    lastName: 'Stanković',
    email: 'marko.stankovic@deltatrade.rs',
    phone: '+381 64 444 5566',
    position: 'Direktor',
    company: 'Delta Trade d.o.o.',
    isClient: false,
    isSupplier: true,
    isLead: false,
  },
  {
    firstName: 'Ana',
    lastName: 'Nikolić',
    email: 'ana.nikolic@gmail.com',
    phone: '+381 65 777 8899',
    position: 'Savetnik za razvoj',
    company: 'Morava Commerce',
    isClient: true,
    isSupplier: false,
    isLead: true,
  },
]

const MOCK_INVOICES = [
  {
    number: 'FAK-SYNC-2024-001',
    status: 'poslata',
    type: 'izlazna',
    paymentMethod: 'racun',
    notes: 'Automatski generisana faktura putem sync konektora',
  },
  {
    number: 'FAK-SYNC-2024-002',
    status: 'nacrt',
    type: 'izlazna',
    paymentMethod: 'gotovina',
    notes: 'Predračun za Balkan Logistics — na čekanju odobrenja',
  },
]

// POST /api/integrations/connectors/[id]/sync — Trigger manual sync
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const connector = await db.syncConnector.findUnique({
      where: { id },
    })

    if (!connector) {
      return NextResponse.json(
        { error: 'Connector not found' },
        { status: 404 }
      )
    }

    // Set status to syncing
    await db.syncConnector.update({
      where: { id },
      data: { status: 'syncing' },
    })

    const syncStart = Date.now()
    let parsedEntities: string[]

    try {
      parsedEntities = JSON.parse(connector.syncEntities)
    } catch {
      return NextResponse.json(
        { error: 'Invalid syncEntities format in connector config' },
        { status: 400 }
      )
    }

    // Parse field mapping if available
    let fieldMapping: Record<string, Record<string, string>> | null = null
    if (connector.fieldMapping) {
      try {
        fieldMapping = JSON.parse(connector.fieldMapping)
      } catch {
        // Ignore invalid field mapping
      }
    }

    const results: SyncResult[] = []
    let totalSuccess = 0

    for (const entityType of parsedEntities) {
      const result = await syncEntity(entityType, connector.direction, fieldMapping)
      results.push(result)
      totalSuccess += result.successRecords

      // Create sync log entry
      await db.syncLog.create({
        data: {
          connectorId: connector.id,
          direction: connector.direction,
          entityType,
          status: result.failedRecords > 0 ? 'partial' : 'completed',
          totalRecords: result.totalRecords,
          successRecords: result.successRecords,
          failedRecords: result.failedRecords,
          errors:
            result.errors.length > 0
              ? JSON.stringify(result.errors)
              : null,
          duration: Date.now() - syncStart,
          triggerType: 'manual',
          notes: `Synced via ${connector.name} (${connector.type})`,
        },
      })
    }

    const syncDuration = Date.now() - syncStart
    const syncStatus =
      results.every((r) => r.failedRecords === 0) ? 'completed' : 'partial'

    // Update connector stats
    const updatedConnector = await db.syncConnector.update({
      where: { id },
      data: {
        status: 'connected',
        lastSyncAt: new Date(),
        lastSyncStatus: syncStatus,
        totalSyncs: { increment: 1 },
        totalRecords: { increment: totalSuccess },
      },
    })

    return NextResponse.json({
      success: true,
      connectorId: id,
      connectorName: updatedConnector.name,
      duration: syncDuration,
      status: syncStatus,
      entities: results.map((r) => ({
        type: r.entityType,
        total: r.totalRecords,
        succeeded: r.successRecords,
        failed: r.failedRecords,
      })),
      totalRecordsSynced: totalSuccess,
    })
  } catch (error) {
    console.error('Error during sync:', error)

    // Reset connector status to error
    try {
      await db.syncConnector.update({
        where: { id },
        data: { status: 'error' },
      })
    } catch {
      // Ignore if connector update fails
    }

    return NextResponse.json(
      { error: 'Sync failed' },
      { status: 500 }
    )
  }
}

// Entity-specific sync logic with upsert
async function syncEntity(
  entityType: string,
  direction: string,
  fieldMapping: Record<string, Record<string, string>> | null
): Promise<SyncResult> {
  const result: SyncResult = {
    entityType,
    totalRecords: 0,
    successRecords: 0,
    failedRecords: 0,
    errors: [],
    details: [],
  }

  // Only import for now (export would push data out)
  if (direction === 'export') {
    result.totalRecords = 0
    result.successRecords = 0
    return result
  }

  const mapping = fieldMapping?.[entityType] || null

  try {
    switch (entityType) {
      case 'partners': {
        // Pick 3-5 random partners
        const count = 3 + Math.floor(Math.random() * 3) // 3-5
        const selected = shuffleArray([...MOCK_PARTNERS]).slice(0, count)
        result.totalRecords = selected.length

        for (const partner of selected) {
          try {
            const data = applyMapping(partner, mapping)
            // Upsert by PIB
            await db.partner.upsert({
              where: { pib: data.pib as string },
              create: data as Parameters<typeof db.partner.create>[0]['data'],
              update: {
                name: data.name as string,
                maticniBr: data.maticniBr as string | undefined,
                address: data.address as string | undefined,
                city: data.city as string | undefined,
                zipCode: data.zipCode as string | undefined,
                phone: data.phone as string | undefined,
                email: data.email as string | undefined,
                type: data.type as string,
                bank: data.bank as string | undefined,
                account: data.account as string | undefined,
              },
            })
            result.successRecords++
            result.details.push({ pib: data.pib, name: data.name })
          } catch (err: unknown) {
            result.failedRecords++
            result.errors.push(
              `Partner ${partner.name}: ${(err as Error).message}`
            )
          }
        }
        break
      }

      case 'products': {
        const count = 3 + Math.floor(Math.random() * 3) // 3-5
        const selected = shuffleArray([...MOCK_PRODUCTS]).slice(0, count)
        result.totalRecords = selected.length

        for (const product of selected) {
          try {
            const data = applyMapping(product, mapping)
            // Upsert by SKU
            await db.product.upsert({
              where: { sku: data.sku as string },
              create: {
                name: data.name as string,
                sku: data.sku as string,
                barcode: (data.barcode as string) || null,
                category: (data.category as string) || null,
                unit: (data.unit as string) || 'kom',
                purchasePrice: Number(data.purchasePrice) || 0,
                sellingPrice: Number(data.sellingPrice) || 0,
                minStock: Number(data.minStock) || 0,
                currentStock: Number(data.currentStock) || 0,
                isActive: true,
              },
              update: {
                name: data.name as string,
                barcode: (data.barcode as string) || null,
                category: (data.category as string) || null,
                unit: (data.unit as string) || 'kom',
                purchasePrice: Number(data.purchasePrice) || 0,
                sellingPrice: Number(data.sellingPrice) || 0,
                minStock: Number(data.minStock) || 0,
                currentStock: Number(data.currentStock) || 0,
                isActive: true,
              },
            })
            result.successRecords++
            result.details.push({ sku: data.sku, name: data.name })
          } catch (err: unknown) {
            result.failedRecords++
            result.errors.push(
              `Product ${product.name}: ${(err as Error).message}`
            )
          }
        }
        break
      }

      case 'transactions': {
        const count = 2 + Math.floor(Math.random() * 2) // 2-3
        const selected = shuffleArray([...MOCK_TRANSACTIONS]).slice(0, count)
        result.totalRecords = selected.length

        for (const txn of selected) {
          try {
            const data = applyMapping(txn, mapping)
            // Randomize amount slightly to avoid exact duplicates
            const amountVariation = 1 + (Math.random() - 0.5) * 0.1
            const finalAmount = Math.round(
              (Number(data.amount) || 0) * amountVariation
            )
            await db.transaction.create({
              data: {
                date: data.date as Date || new Date(),
                type: data.type as string,
                category: data.category as string,
                amount: finalAmount,
                description: data.description as string,
                documentRef: (data.documentRef as string) || null,
              },
            })
            result.successRecords++
            result.details.push({
              description: data.description,
              amount: finalAmount,
            })
          } catch (err: unknown) {
            result.failedRecords++
            result.errors.push(
              `Transaction: ${(err as Error).message}`
            )
          }
        }
        break
      }

      case 'contacts': {
        const count = 2 + Math.floor(Math.random() * 2) // 2-3
        const selected = shuffleArray([...MOCK_CONTACTS]).slice(0, count)
        result.totalRecords = selected.length

        for (const contact of selected) {
          try {
            const data = applyMapping(contact, mapping)
            // Try to find a matching partner
            let partnerId: string | null = null
            if (data.company) {
              const partner = await db.partner.findFirst({
                where: { name: { contains: data.company as string } },
              })
              if (partner) {
                partnerId = partner.id
              }
            }
            await db.contact.create({
              data: {
                firstName: data.firstName as string,
                lastName: data.lastName as string,
                email: (data.email as string) || null,
                phone: (data.phone as string) || null,
                position: (data.position as string) || null,
                company: (data.company as string) || null,
                partnerId,
                isClient: Boolean(data.isClient),
                isSupplier: Boolean(data.isSupplier),
                isLead: Boolean(data.isLead),
              },
            })
            result.successRecords++
            result.details.push({
              name: `${data.firstName} ${data.lastName}`,
            })
          } catch (err: unknown) {
            result.failedRecords++
            result.errors.push(
              `Contact ${contact.firstName} ${contact.lastName}: ${(err as Error).message}`
            )
          }
        }
        break
      }

      case 'invoices': {
        const count = 1 + Math.floor(Math.random() * 2) // 1-2
        const selected = shuffleArray([...MOCK_INVOICES]).slice(0, count)
        result.totalRecords = selected.length

        // Find a partner for the invoices
        const anyPartner = await db.partner.findFirst()
        if (!anyPartner) {
          result.errors.push(
            'No partners found — cannot create invoices without a partner'
          )
          result.failedRecords = selected.length
          break
        }

        // Find products for invoice items
        const availableProducts = await db.product.findMany({
          take: 3,
        })

        for (const invoice of selected) {
          try {
            // Generate a unique invoice number to avoid collisions
            const uniqueSuffix = Date.now().toString(36).toUpperCase()
            const invoiceNumber = `${invoice.number}-${uniqueSuffix}`
            const now = new Date()
            const dueDate = new Date(
              now.getTime() + 30 * 24 * 60 * 60 * 1000
            ) // 30 days

            // Create invoice items from available products
            const items =
              availableProducts.length > 0
                ? availableProducts.slice(0, 2).map((product) => {
                    const quantity = 1 + Math.floor(Math.random() * 5)
                    const total =
                      quantity * product.sellingPrice *
                      (1 - 0) // no discount
                    return {
                      productId: product.id,
                      productName: product.name,
                      quantity,
                      unitPrice: product.sellingPrice,
                      discountPct: 0,
                      taxRate: 20,
                      total,
                    }
                  })
                : []

            const totalAmount = items.reduce(
              (sum, item) => sum + item.total,
              0
            )
            const taxAmount = totalAmount * 0.2

            await db.invoice.create({
              data: {
                number: invoiceNumber,
                date: now,
                dueDate,
                partnerId: anyPartner.id,
                status: invoice.status,
                type: invoice.type,
                totalAmount,
                taxAmount,
                discountPct: 0,
                notes: invoice.notes,
                paymentMethod: invoice.paymentMethod,
                items: {
                  create: items,
                },
              },
            })
            result.successRecords++
            result.details.push({
              number: invoiceNumber,
              amount: totalAmount,
            })
          } catch (err: unknown) {
            result.failedRecords++
            result.errors.push(
              `Invoice ${invoice.number}: ${(err as Error).message}`
            )
          }
        }
        break
      }

      case 'stock': {
        // Stock sync — adjust stock levels of random products
        const existingProducts = await db.product.findMany({
          take: 5,
        })
        if (existingProducts.length === 0) {
          result.totalRecords = 0
          result.errors.push('No products found to adjust stock')
          break
        }
        result.totalRecords = existingProducts.length

        for (const product of existingProducts) {
          try {
            const adjustment = Math.floor(Math.random() * 20) - 5 // -5 to +14
            const newStock = Math.max(0, product.currentStock + adjustment)

            await db.stockMovement.create({
              data: {
                productId: product.id,
                date: new Date(),
                type: adjustment >= 0 ? 'prijem' : 'izdavanje',
                quantity: Math.abs(adjustment),
                documentRef: `SYNC-${Date.now().toString(36).toUpperCase()}`,
                notes: 'Automatska sinhronizacija zaliha',
              },
            })

            await db.product.update({
              where: { id: product.id },
              data: { currentStock: newStock },
            })

            result.successRecords++
            result.details.push({
              sku: product.sku,
              adjustment,
              newStock,
            })
          } catch (err: unknown) {
            result.failedRecords++
            result.errors.push(
              `Stock ${product.sku}: ${(err as Error).message}`
            )
          }
        }
        break
      }

      case 'employees': {
        // Employee sync — create sample employees
        const mockEmployees = [
          {
            firstName: 'Petar',
            lastName: 'Jovanović',
            email: 'petar.jovanovic@firma.rs',
            phone: '+381 63 222 3344',
            position: 'Menadžer prodaje',
            department: 'Prodaja',
            baseSalary: 120000,
            isActive: true,
          },
          {
            firstName: 'Ivana',
            lastName: 'Đorđević',
            email: 'ivana.djordjevic@firma.rs',
            phone: '+381 64 555 6677',
            position: 'Knjigovodja',
            department: 'Finansije',
            baseSalary: 95000,
            isActive: true,
          },
          {
            firstName: 'Nenad',
            lastName: 'Petrović',
            email: 'nenad.petrovic@firma.rs',
            phone: '+381 61 888 9900',
            position: 'IT administrator',
            department: 'IT',
            baseSalary: 110000,
            isActive: true,
          },
        ]

        const count = 2 + Math.floor(Math.random() * 2) // 2-3
        const selected = shuffleArray([...mockEmployees]).slice(0, count)
        result.totalRecords = selected.length

        for (const emp of selected) {
          try {
            const data = applyMapping(emp, mapping)
            // Upsert by email to avoid duplicates
            const existingEmp = await db.employee.findFirst({
              where: { email: data.email as string },
            })
            if (existingEmp) {
              await db.employee.update({
                where: { id: existingEmp.id },
                data: {
                  firstName: data.firstName as string,
                  lastName: data.lastName as string,
                  phone: (data.phone as string) || null,
                  position: (data.position as string) || null,
                  department: (data.department as string) || null,
                  baseSalary: Number(data.baseSalary) || 0,
                  isActive: true,
                },
              })
            } else {
              await db.employee.create({
                data: {
                  firstName: data.firstName as string,
                  lastName: data.lastName as string,
                  email: (data.email as string) || null,
                  phone: (data.phone as string) || null,
                  position: (data.position as string) || null,
                  department: (data.department as string) || null,
                  baseSalary: Number(data.baseSalary) || 0,
                  isActive: true,
                },
              })
            }
            result.successRecords++
            result.details.push({
              name: `${data.firstName} ${data.lastName}`,
            })
          } catch (err: unknown) {
            result.failedRecords++
            result.errors.push(
              `Employee ${emp.firstName} ${emp.lastName}: ${(err as Error).message}`
            )
          }
        }
        break
      }

      default:
        result.errors.push(`Unknown entity type: ${entityType}`)
        break
    }
  } catch (err: unknown) {
    result.errors.push(`Sync error for ${entityType}: ${(err as Error).message}`)
  }

  return result
}

// Apply field mapping (renames fields from external names to internal names)
function applyMapping(
  data: Record<string, unknown>,
  mapping: Record<string, string> | null
): Record<string, unknown> {
  if (!mapping) return { ...data }

  const mapped: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(data)) {
    const mappedKey = mapping[key] || key
    mapped[mappedKey] = value
  }
  return mapped
}

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]
  }
  return array
}
