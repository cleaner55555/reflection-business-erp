import { db } from '@/lib/db'

async function seed() {
  console.log('🌱 Seeding database...')

  // Clear existing data
  await db.invoiceItem.deleteMany()
  await db.invoice.deleteMany()
  await db.purchaseOrderItem.deleteMany()
  await db.purchaseOrder.deleteMany()
  await db.stockMovement.deleteMany()
  await db.transaction.deleteMany()
  await db.cashRegister.deleteMany()
  await db.product.deleteMany()
  await db.partner.deleteMany()

  // Partners
  const partners = await Promise.all([
    db.partner.create({
      data: {
        name: 'Delta Trade D.O.O.',
        pib: '108923456',
        maticniBr: '20123456',
        address: 'Bulevar Mihajla Pupina 10',
        city: 'Novi Sad',
        zipCode: '21000',
        phone: '+381 21 123 4567',
        email: 'info@deltatrade.rs',
        type: 'kupac',
        account: '265-123456-78',
        bank: 'Banca Intesa',
      },
    }),
    db.partner.create({
      data: {
        name: 'Metal-Pro D.O.O.',
        pib: '109876543',
        maticniBr: '20543210',
        address: 'Industrijska zona bb',
        city: 'Niš',
        zipCode: '18000',
        phone: '+381 18 987 6543',
        email: 'kontakt@metalpro.rs',
        type: 'dobavljac',
        account: '160-543210-98',
        bank: 'Komercijalna Banka',
      },
    }),
    db.partner.create({
      data: {
        name: 'TehnoShop S.O.',
        pib: '105678901',
        maticniBr: '20234567',
        address: 'Knez Mihailova 25',
        city: 'Beograd',
        zipCode: '11000',
        phone: '+381 11 321 4567',
        email: 'prodaja@tehnoshop.rs',
        type: 'kupac',
        account: '265-678901-23',
        bank: 'Raiffeisen Bank',
      },
    }),
    db.partner.create({
      data: {
        name: 'Eko-Pak D.O.O.',
        pib: '103456789',
        maticniBr: '20111111',
        address: 'Vojvodjanska 42',
        city: 'Subotica',
        zipCode: '24000',
        phone: '+381 24 555 1234',
        email: 'office@ekopak.rs',
        type: 'dobavljac',
        account: '265-111111-11',
        bank: 'OTP Banka',
      },
    }),
    db.partner.create({
      data: {
        name: 'Alfa Gradnja D.O.O.',
        pib: '107890123',
        maticniBr: '20333333',
        address: 'Cara Dušana 88',
        city: 'Beograd',
        zipCode: '11000',
        phone: '+381 11 777 8899',
        email: 'info@alfagradnja.rs',
        type: 'partner',
        account: '265-333333-33',
        bank: 'UniCredit Bank',
      },
    }),
    db.partner.create({
      data: {
        name: 'Auto-Part D.O.O.',
        pib: '106543210',
        maticniBr: '20444444',
        address: 'Zmaj Jovina 15',
        city: 'Kragujevac',
        zipCode: '34000',
        phone: '+381 34 222 3333',
        email: 'narudzbe@autopart.rs',
        type: 'kupac',
        account: '265-444444-44',
        bank: 'Banca Intesa',
      },
    }),
  ])

  // Products
  const products = await Promise.all([
    db.product.create({
      data: {
        name: 'USB-C Kabel 2m',
        sku: 'USB-C-2M',
        barcode: '8601234567890',
        category: 'Elektronika',
        unit: 'kom',
        purchasePrice: 350,
        sellingPrice: 690,
        minStock: 50,
        currentStock: 12,
      },
    }),
    db.product.create({
      data: {
        name: 'Aluminijski profil L-40mm',
        sku: 'ALU-L40',
        barcode: '8601234567891',
        category: 'Metalurgija',
        unit: 'kom',
        purchasePrice: 1200,
        sellingPrice: 1890,
        minStock: 30,
        currentStock: 45,
      },
    }),
    db.product.create({
      data: {
        name: 'LED Panel 60x60',
        sku: 'LED-P60',
        barcode: '8601234567892',
        category: 'Osvetljenje',
        unit: 'kom',
        purchasePrice: 2800,
        sellingPrice: 4500,
        minStock: 20,
        currentStock: 8,
      },
    }),
    db.product.create({
      data: {
        name: 'Pak papira A4 500list',
        sku: 'PAP-A4',
        barcode: '8601234567893',
        category: 'Kancelarija',
        unit: 'pak',
        purchasePrice: 450,
        sellingPrice: 720,
        minStock: 100,
        currentStock: 200,
      },
    }),
    db.product.create({
      data: {
        name: 'Zatvarač za vrata YKK',
        sku: 'ZAT-YKK',
        barcode: '8601234567894',
        category: 'Gradja',
        unit: 'kom',
        purchasePrice: 1800,
        sellingPrice: 2900,
        minStock: 25,
        currentStock: 3,
      },
    }),
    db.product.create({
      data: {
        name: 'Auto filter ulja MANN',
        sku: 'AFO-MANN',
        barcode: '8601234567895',
        category: 'Auto delovi',
        unit: 'kom',
        purchasePrice: 1500,
        sellingPrice: 2400,
        minStock: 40,
        currentStock: 55,
      },
    }),
    db.product.create({
      data: {
        name: 'Ethernet kabel CAT6 50m',
        sku: 'NET-C6-50',
        barcode: '8601234567896',
        category: 'Elektronika',
        unit: 'kom',
        purchasePrice: 2200,
        sellingPrice: 3500,
        minStock: 15,
        currentStock: 22,
      },
    }),
    db.product.create({
      data: {
        name: 'Farba za zid 10L (bela)',
        sku: 'FAR-10L',
        barcode: '8601234567897',
        category: 'Gradja',
        unit: 'kom',
        purchasePrice: 3200,
        sellingPrice: 4800,
        minStock: 10,
        currentStock: 18,
      },
    }),
    db.product.create({
      data: {
        name: 'Ventilator 12V DC',
        sku: 'VEN-12V',
        barcode: '8601234567898',
        category: 'Elektronika',
        unit: 'kom',
        purchasePrice: 800,
        sellingPrice: 1400,
        minStock: 30,
        currentStock: 0,
      },
    }),
    db.product.create({
      data: {
        name: 'Silikon za kupatilo 310ml',
        sku: 'SIL-310',
        barcode: '8601234567899',
        category: 'Gradja',
        unit: 'kom',
        purchasePrice: 350,
        sellingPrice: 650,
        minStock: 50,
        currentStock: 88,
      },
    }),
  ])

  // Transactions (monthly revenue and expenses over last 6 months)
  const now = new Date()
  const categories = ['promet', 'nabavka', 'plata', 'režije', 'ostalo']
  const descriptions = [
    'Prodaja robe - faktura',
    'Usluga IT održavanja',
    'Nabavka sirovina',
    'Plata zaposlenih',
    'Struja i režije',
    'Plaćanje dobavljača',
    'Konsultantske usluge',
    'Zamena opreme',
    'Licence softvera',
    'Transport robe',
  ]

  const transactions = []
  for (let monthOffset = 5; monthOffset >= 0; monthOffset--) {
    const month = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1)

    // Income transactions (3-6 per month)
    const incomeCount = 3 + Math.floor(Math.random() * 4)
    for (let i = 0; i < incomeCount; i++) {
      const day = 1 + Math.floor(Math.random() * 28)
      const date = new Date(month.getFullYear(), month.getMonth(), day)
      const amount = 80000 + Math.floor(Math.random() * 420000)
      transactions.push({
        date,
        type: 'prihod',
        category: categories[Math.floor(Math.random() * 2)], // promet or nabavka
        amount,
        description: descriptions[Math.floor(Math.random() * 2)],
        documentRef: `FAC-${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}-${String(i + 1).padStart(3, '0')}`,
      })
    }

    // Expense transactions (4-7 per month)
    const expenseCount = 4 + Math.floor(Math.random() * 4)
    for (let i = 0; i < expenseCount; i++) {
      const day = 1 + Math.floor(Math.random() * 28)
      const date = new Date(month.getFullYear(), month.getMonth(), day)
      const catIdx = 2 + Math.floor(Math.random() * 3) // nabavka, plata, režije, ostalo
      let amount: number
      if (categories[catIdx] === 'plata') {
        amount = 200000 + Math.floor(Math.random() * 300000)
      } else if (categories[catIdx] === 'režije') {
        amount = 15000 + Math.floor(Math.random() * 85000)
      } else {
        amount = 30000 + Math.floor(Math.random() * 170000)
      }
      transactions.push({
        date,
        type: 'rashod',
        category: categories[catIdx],
        amount,
        description: descriptions[3 + Math.floor(Math.random() * 7)],
        documentRef: undefined,
      })
    }
  }

  await Promise.all(
    transactions.map((t) =>
      db.transaction.create({ data: t })
    )
  )

  // Invoices (last 15)
  const statuses = ['nacrt', 'poslata', 'placena', 'placena', 'placena', 'otkazana']
  for (let i = 0; i < 15; i++) {
    const monthOffset = Math.floor(i / 3)
    const month = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1)
    const day = 1 + Math.floor(Math.random() * 28)
    const date = new Date(month.getFullYear(), month.getMonth(), day)
    const dueDate = new Date(date)
    dueDate.setDate(dueDate.getDate() + 15 + Math.floor(Math.random() * 15))
    const partner = partners[Math.floor(Math.random() * partners.length)]
    const status = statuses[Math.floor(Math.random() * statuses.length)]

    const numItems = 1 + Math.floor(Math.random() * 3)
    const items: Array<{ productId: string; productName: string; quantity: number; unitPrice: number; discountPct: number; taxRate: number; total: number }> = []
    let totalAmount = 0
    let taxAmount = 0

    for (let j = 0; j < numItems; j++) {
      const product = products[Math.floor(Math.random() * products.length)]
      const quantity = 1 + Math.floor(Math.random() * 20)
      const unitPrice = product.sellingPrice
      const discountPct = Math.random() > 0.7 ? 5 + Math.floor(Math.random() * 10) : 0
      const taxRate = 20
      const subtotal = quantity * unitPrice
      const discount = subtotal * (discountPct / 100)
      const tax = (subtotal - discount) * (taxRate / 100)
      const total = subtotal - discount + tax
      totalAmount += total
      taxAmount += tax
      items.push({ productId: product.id, productName: product.name, quantity, unitPrice, discountPct, taxRate, total })
    }

    await db.invoice.create({
      data: {
        number: `F-${now.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}-${String(i + 1).padStart(4, '0')}`,
        date,
        dueDate,
        partnerId: partner.id,
        status,
        totalAmount,
        taxAmount,
        discountPct: 0,
        notes: i === 0 ? 'Hitna isporuka' : undefined,
        paymentMethod: ['racun', 'gotovina', 'kartica'][Math.floor(Math.random() * 3)],
        items: { create: items },
      },
    })
  }

  // Cash register entries
  for (let monthOffset = 3; monthOffset >= 0; monthOffset--) {
    const month = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1)
    const entryCount = 8 + Math.floor(Math.random() * 10)
    for (let i = 0; i < entryCount; i++) {
      const day = 1 + Math.floor(Math.random() * 28)
      const date = new Date(month.getFullYear(), month.getMonth(), day)
      const type = Math.random() > 0.4 ? 'ulaz' : 'izlaz'
      const amount = type === 'ulaz'
        ? 5000 + Math.floor(Math.random() * 95000)
        : 3000 + Math.floor(Math.random() * 50000)
      const partner = partners[Math.floor(Math.random() * partners.length)]
      await db.cashRegister.create({
        data: {
          date,
          type,
          amount,
          description: type === 'ulaz'
            ? `Uplata - ${partner.name.substring(0, 20)}`
            : `Isplata - ${['režije', 'transport', 'materijal', 'kancelarijski materijal'][Math.floor(Math.random() * 4)]}`,
          partnerName: type === 'ulaz' ? partner.name : undefined,
          paymentMethod: ['gotovina', 'kartica'][Math.floor(Math.random() * 2)],
        },
      })
    }
  }

  // Stock movements
  const movementTypes = ['prijem', 'izdavanje', 'inventura']
  for (let i = 0; i < 30; i++) {
    const monthOffset = Math.floor(i / 6)
    const month = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1)
    const day = 1 + Math.floor(Math.random() * 28)
    const date = new Date(month.getFullYear(), month.getMonth(), day)
    const product = products[Math.floor(Math.random() * products.length)]
    const type = movementTypes[Math.floor(Math.random() * movementTypes.length)]
    const quantity = 1 + Math.floor(Math.random() * 100)
    await db.stockMovement.create({
      data: {
        productId: product.id,
        date,
        type,
        quantity,
        documentRef: type === 'prijem' ? `PO-${String(i + 1).padStart(3, '0')}` : type === 'izdavanje' ? `IZ-${String(i + 1).padStart(3, '0')}` : `INV-${String(i + 1).padStart(3, '0')}`,
        notes: type === 'inventura' ? 'Godišnja inventura' : undefined,
      },
    })
  }

  // Purchase orders
  const poStatuses = ['nacrt', 'poslata', 'primljena', 'primljena', 'otkazana']
  for (let i = 0; i < 8; i++) {
    const monthOffset = Math.floor(i / 2)
    const month = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1)
    const day = 1 + Math.floor(Math.random() * 28)
    const date = new Date(month.getFullYear(), month.getMonth(), day)
    const supplier = partners.filter((p) => p.type === 'dobavljac')[Math.floor(Math.random() * 2)]
    const status = poStatuses[Math.floor(Math.random() * poStatuses.length)]

    const numItems = 1 + Math.floor(Math.random() * 3)
    const items: Array<{ productId: string; productName: string; quantity: number; unitPrice: number; total: number }> = []
    let totalAmount = 0

    for (let j = 0; j < numItems; j++) {
      const product = products[Math.floor(Math.random() * products.length)]
      const quantity = 10 + Math.floor(Math.random() * 100)
      const unitPrice = product.purchasePrice
      const total = quantity * unitPrice
      totalAmount += total
      items.push({ productId: product.id, productName: product.name, quantity, unitPrice, total })
    }

    await db.purchaseOrder.create({
      data: {
        number: `PO-${now.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}-${String(i + 1).padStart(3, '0')}`,
        date,
        partnerId: supplier.id,
        status,
        totalAmount,
        notes: i === 0 ? 'Hitna nabavka' : undefined,
        items: { create: items },
      },
    })
  }

  console.log('✅ Database seeded successfully!')
  console.log(`  - ${partners.length} partners`)
  console.log(`  - ${products.length} products`)
  console.log(`  - ${transactions.length} transactions`)
  console.log(`  - 15 invoices`)
  console.log(`  - ~50 cash register entries`)
  console.log(`  - 30 stock movements`)
  console.log(`  - 8 purchase orders`)
}

seed()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(() => {
    process.exit(0)
  })
