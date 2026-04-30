import { db } from '@/lib/db'

async function seed() {
  console.log('🌱 Seeding database...')

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()

  // Clear existing data - new modules first (due to FK)
  await db.rental.deleteMany()
  await db.rentalVehicle.deleteMany()
  await db.restoOrderItem.deleteMany()
  await db.restoOrder.deleteMany()
  await db.restoMenuItem.deleteMany()
  await db.restoCategory.deleteMany()
  await db.restoTable.deleteMany()
  await db.emailCampaign.deleteMany()
  await db.emailSubscriber.deleteMany()
  await db.emailList.deleteMany()
  await db.emailTemplate.deleteMany()
  await db.appSetting.deleteMany()
  await db.vehicleExpense.deleteMany()
  await db.vehicleService.deleteMany()
  await db.vehicle.deleteMany()
  await db.lesson.deleteMany()
  await db.course.deleteMany()
  await db.protocolEntry.deleteMany()
  await db.journalEntry.deleteMany()
  await db.account.deleteMany()
  await db.projectTask.deleteMany()
  await db.project.deleteMany()
  await db.document.deleteMany()
  await db.attendance.deleteMany()
  await db.payroll.deleteMany()
  await db.employee.deleteMany()
  await db.asset.deleteMany()
  await db.calendarEvent.deleteMany()
  await db.crmActivity.deleteMany()
  await db.deal.deleteMany()
  await db.contact.deleteMany()
  await db.deliveryNoteItem.deleteMany()
  await db.deliveryNote.deleteMany()
  await db.priceListItem.deleteMany()
  await db.priceList.deleteMany()
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

    const invTypes = ['izlazna', 'izlazna', 'izlazna', 'ulazna', 'predracun']
    const invType = invTypes[Math.floor(Math.random() * invTypes.length)]

    await db.invoice.create({
      data: {
        number: `${invType === 'predracun' ? 'PR' : 'F'}-${now.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}-${String(i + 1).padStart(4, '0')}`,
        date,
        dueDate,
        partnerId: partner.id,
        status,
        type: invType,
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

  // Delivery notes
  const dnStatuses = ['nacrt', 'pripremljena', 'otpremljena', 'otpremljena', 'stornirana']
  const customers = partners.filter(p => p.type === 'kupac' || p.type === 'partner')
  for (let i = 0; i < 6; i++) {
    const monthOffset = Math.floor(i / 2)
    const month = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1)
    const day = 1 + Math.floor(Math.random() * 28)
    const date = new Date(month.getFullYear(), month.getMonth(), day)
    const customer = customers[Math.floor(Math.random() * customers.length)] || partners[0]
    const status = dnStatuses[Math.floor(Math.random() * dnStatuses.length)]
    const numItems = 1 + Math.floor(Math.random() * 3)
    const items: Array<{ productId: string; productName: string; quantity: number; unitPrice: number }> = []
    for (let j = 0; j < numItems; j++) {
      const product = products[Math.floor(Math.random() * products.length)]
      const quantity = 1 + Math.floor(Math.random() * 20)
      items.push({ productId: product.id, productName: product.name, quantity, unitPrice: product.sellingPrice })
    }
    await db.deliveryNote.create({
      data: {
        number: `OT-${now.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}-${String(i + 1).padStart(3, '0')}`,
        date,
        partnerId: customer.id,
        status,
        invoiceNumber: i < 3 ? `F-${now.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}-${String(i + 1).padStart(4, '0')}` : undefined,
        items: { create: items },
      },
    })
  }

  // Price lists
  const priceListData = [
    { name: 'Standardni cenovnik', description: 'Redovne cene za sve kupce', validFrom: new Date(now.getFullYear(), 0, 1) },
    { name: 'Veleprodajni cenovnik', description: 'Cene za veleprodajne partnere', validFrom: new Date(now.getFullYear(), 0, 1) },
    { name: 'Aktuelno - Leto 2025', description: 'Sezonski cenovnik za leto 2025', validFrom: new Date(now.getFullYear(), 4, 1), validTo: new Date(now.getFullYear(), 8, 31) },
  ]
  for (const pl of priceListData) {
    const plItems = products.slice(0, 5 + Math.floor(Math.random() * 4)).map(p => ({
      productId: p.id,
      price: Math.round(p.sellingPrice * (0.85 + Math.random() * 0.3)),
      discountPct: Math.random() > 0.5 ? Math.round(Math.random() * 15) : 0,
    }))
    await db.priceList.create({
      data: {
        name: pl.name,
        description: pl.description,
        validFrom: pl.validFrom,
        validTo: pl.validTo,
        items: { create: plItems },
      },
    })
  }

  console.log('  - 3 price lists')

  // CRM - Contacts
  const contacts = await Promise.all([
    db.contact.create({ data: { firstName: 'Marko', lastName: 'Petrović', email: 'marko@delta.rs', phone: '+381 63 111 222', position: 'Direktor', company: 'Delta Trade', isLead: false, isClient: true, tags: 'vip,IT' } }),
    db.contact.create({ data: { firstName: 'Jelena', lastName: 'Stanković', email: 'jelena@metalpro.rs', phone: '+381 63 222 333', position: 'Komercijalista', company: 'Metal-Pro', isLead: false, isClient: true, isSupplier: true, tags: 'metalurgija' } }),
    db.contact.create({ data: { firstName: 'Nenad', lastName: 'Jovanović', email: 'nenad@techshop.rs', phone: '+381 11 444 555', position: 'Vlasnik', company: 'TehnoShop', isClient: true, tags: 'IT,elektronika' } }),
    db.contact.create({ data: { firstName: 'Ana', lastName: 'Milić', email: 'ana@ekopak.rs', position: 'Menadžer', company: 'Eko-Pak', isLead: false, isSupplier: true, tags: 'pakovanje' } }),
    db.contact.create({ data: { firstName: 'Ivan', lastName: 'Nikolić', email: 'ivan@slobodan.rs', phone: '+381 65 888 999', position: 'Inženjer', isLead: true, tags: 'IT,konsalting' } }),
    db.contact.create({ data: { firstName: 'Maja', lastName: 'Đorđević', email: 'maja@startup.rs', phone: '+381 11 555 666', position: 'CEO', isLead: true, tags: 'startup' } }),
    db.contact.create({ data: { firstName: 'Stefan', lastName: 'Popović', email: 'stefan@autopart.rs', position: 'Tehničar', company: 'Auto-Part', isClient: true, tags: 'auto' } }),
    db.contact.create({ data: { firstName: 'Luka', lastName: 'Simić', email: 'luka@gradnja.rs', position: 'Projektant', company: 'Alfa Gradnja', isClient: true, tags: 'gradja' } }),
  ])

  // CRM - Deals
  await Promise.all([
    db.deal.create({ data: { title: 'IT oprema za Delta Trade', value: 350000, stage: 'pregovaranje', probability: 70, contactId: contacts[0].id, partnerId: partners[0].id, assignedTo: 'Ana Milić', closeDate: new Date(year, month + 2, 15), notes: 'Veliki ugovor za kompletnu IT infrastrukturu' } }),
    db.deal.create({ data: { title: 'Aluminijski profili - kvartalna narudžba', value: 120000, stage: 'predlog', probability: 40, contactId: contacts[1].id, partnerId: partners[1].id, assignedTo: 'Marko Petrović' } }),
    db.deal.create({ data: { title: 'LED paneli za novo sedište', value: 85000, stage: 'won', probability: 100, contactId: contacts[2].id, partnerId: partners[2].id, closeDate: new Date(year, month - 1, 5) } }),
    db.deal.create({ data: { title: 'Pakovanje za e-commerce', value: 45000, stage: 'kvalifikacija', probability: 25, contactId: contacts[3].id, notes: 'Inicijalni upit' } }),
    db.deal.create({ data: { title: 'ERP konsalting za startup', value: 200000, stage: 'lead', probability: 10, contactId: contacts[4].id } }),
    db.deal.create({ data: { title: 'Auto delovi - godišnji ugovor', value: 180000, stage: 'pregovaranje', probability: 60, contactId: contacts[6].id, partnerId: partners[5].id, assignedTo: 'Jelena Stanković' } }),
  ])

  // CRM - Activities
  const dealIds = await db.deal.findMany({ select: { id: true } })
  await Promise.all([
    db.crmActivity.create({ data: { type: 'sastanak', title: 'Sastanak sa Delta Trade - IT oprema', contactId: contacts[0].id, dealId: dealIds[0].id, dueDate: new Date(year, month + 1, 10) } }),
    db.crmActivity.create({ data: { type: 'poziv', title: 'Poziv za potvrdu narudžbe profila', contactId: contacts[1].id, dealId: dealIds[1].id, dueDate: new Date(year, month + 1, 5), completed: true } }),
    db.crmActivity.create({ data: { type: 'email', title: 'Poslata ponude za LED panele', contactId: contacts[2].id, dealId: dealIds[2].id, completed: true } }),
    db.crmActivity.create({ data: { type: 'task', title: 'Pripremiti ponudu za pakovanje', contactId: contacts[3].id, dealId: dealIds[3].id, dueDate: new Date(year, month + 1, 20) } }),
    db.crmActivity.create({ data: { type: 'sastanak', title: 'Demo ERP sistema', contactId: contacts[4].id, dealId: dealIds[4].id, dueDate: new Date(year, month + 2, 1) } }),
    db.crmActivity.create({ data: { type: 'napomena', title: 'Slediti rok za auto delove', contactId: contacts[6].id, dealId: dealIds[5].id } }),
    db.crmActivity.create({ data: { type: 'task', title: 'Ažurirati cenovnik za Delta', contactId: contacts[0].id, dueDate: new Date(year, month + 1, 15) } }),
  ])

  // Calendar events
  await Promise.all([
    db.calendarEvent.create({ data: { title: 'Sastanak sa Delta Trade', description: 'Predstaviti novu ponudu', startTime: new Date(year, month + 1, 10, 10, 0), endTime: new Date(year, month + 1, 10, 11, 30), color: 'blue', type: 'sastanak' } }),
    db.calendarEvent.create({ data: { title: 'Rok za predračun', startTime: new Date(year, month + 1, 15, 0, 0), color: 'red', type: 'rok' } }),
    db.calendarEvent.create({ data: { title: 'Team sastanak', description: 'Sedmični sastanak tima', startTime: new Date(year, month + 1, 8, 9, 0), endTime: new Date(year, month + 1, 8, 10, 0), color: 'green', type: 'sastanak', allDay: false } }),
    db.calendarEvent.create({ data: { title: 'Rođendan firme', startTime: new Date(year, month + 3, 1, 0, 0), color: 'purple', type: 'podsetnik', allDay: true } }),
    db.calendarEvent.create({ data: { title: 'Obuka za nove zaposlene', startTime: new Date(year, month + 1, 20, 14, 0), endTime: new Date(year, month + 1, 20, 16, 0), color: 'orange', type: 'task' } }),
    db.calendarEvent.create({ data: { title: 'Predstavaćenje za Metal-Pro', startTime: new Date(year, month + 2, 5, 11, 0), endTime: new Date(year, month + 2, 5, 12, 0), color: 'primary', type: 'sastanak' } }),
  ])

  // Employees
  const employees = await Promise.all([
    db.employee.create({ data: { firstName: 'Marko', lastName: 'Petrović', email: 'marko@reflection.rs', phone: '+381 63 111 000', position: 'Direktor', department: 'Menadžment', baseSalary: 250000, bankAccount: '265-111111-11' } }),
    db.employee.create({ data: { firstName: 'Ana', lastName: 'Milić', email: 'ana@reflection.rs', phone: '+381 63 222 000', position: 'Komercijalac', department: 'Prodaja', baseSalary: 180000, bankAccount: '265-222222-22' } }),
    db.employee.create({ data: { firstName: 'Jelena', lastName: 'Stanković', email: 'jelena@reflection.rs', phone: '+381 63 333 000', position: 'Knjigovođa', department: 'Finansije', baseSalary: 160000, bankAccount: '265-333333-33' } }),
    db.employee.create({ data: { firstName: 'Stefan', lastName: 'Ilić', email: 'stefan@reflection.rs', position: 'IT stručnjak', department: 'IT', baseSalary: 200000, bankAccount: '265-444444-44' } }),
    db.employee.create({ data: { firstName: 'Milica', lastName: 'Vasić', email: 'milica@reflection.rs', position: 'Magacioner', department: 'Magacin', baseSalary: 120000, bankAccount: '265-555555-55' } }),
    db.employee.create({ data: { firstName: 'Nikola', lastName: 'Perić', email: 'nikola@reflection.rs', position: 'Vozač', department: 'Logistika', baseSalary: 100000, bankAccount: '265-666666-66' } }),
  ])

  // Payrolls
  for (const emp of employees) {
    const bonuses = Math.random() > 0.5 ? 20000 + Math.floor(Math.random() * 30000) : 0
    const deductions = 15000 + Math.floor(Math.random() * 10000)
    await db.payroll.create({
      data: { employeeId: emp.id, month, year, baseSalary: emp.baseSalary, bonuses, deductions, netSalary: emp.baseSalary + bonuses - deductions, status: 'isplaceno', payDate: new Date(year, month + 1, 5) },
    })
  }

  // Attendances
  for (const emp of employees) {
    for (let d = 1; d <= 25; d++) {
      const type = Math.random() > 0.95 ? 'bolovanje' : Math.random() > 0.97 ? 'godisnji' : 'rad'
      const hours = type === 'rad' ? 8 : 0
      await db.attendance.create({ data: { employeeId: emp.id, date: new Date(year, month, d), hoursWorked: hours, type, notes: type === 'rad' ? '' : undefined } })
    }
  }

  // Assets
  await Promise.all([
    db.asset.create({ data: { name: 'Dell Latitude 5540', category: 'IT oprema', serialNumber: 'DL5540-2024-001', purchasePrice: 180000, currentValue: 140000, depreciation: 40000, usefulLife: 48, location: 'Kancelarija', status: 'aktivno' } }),
    db.asset.create({ data: { name: 'Volkswagen Transporter', category: 'Vozila', serialNumber: 'WV-TR-2024-001', purchasePrice: 4500000, currentValue: 4000000, depreciation: 500000, usefulLife: 60, location: 'Garaža', status: 'aktivno' } }),
    db.asset.create({ data: { name: 'HP LaserJet Pro M404', category: 'IT oprema', serialNumber: 'HP-M404-2024-001', purchasePrice: 85000, currentValue: 60000, depreciation: 25000, usefulLife: 36, location: 'Kancelarija', status: 'aktivno' } }),
    db.asset.create({ data: { name: 'Stanley alatni set', category: 'Alat', serialNumber: 'ST-SET-001', purchasePrice: 25000, currentValue: 20000, depreciation: 5000, usefulLife: 60, location: 'Magacin', status: 'aktivno' } }),
    db.asset.create({ data: { name: 'Klima uređaj Gree 12000', category: 'IT oprema', serialNumber: 'GR-12000-001', purchasePrice: 120000, currentValue: 90000, depreciation: 30000, usefulLife: 60, location: 'Server soba', status: 'aktivno' } }),
  ])

  // Projects
  const projects = await Promise.all([
    db.project.create({ data: { name: 'Migracija na cloud', description: 'Migracija server infrastrukture na AWS/Azure', status: 'aktivan', budget: 500000, spent: 180000, priority: 'visok', assignedTo: 'Stefan Ilić' } }),
    db.project.create({ data: { name: 'Redizajn web sajta', description: 'Kompletan redizajn korporativnog sajta', status: 'aktivan', budget: 200000, spent: 75000, priority: 'srednji', assignedTo: 'Ana Milić' } }),
    db.project.create({ data: { name: 'Implementacija ERP modula', description: 'Dodavanje CRM i HR modula', status: 'aktivan', budget: 300000, spent: 120000, priority: 'hitan', assignedTo: 'Stefan Ilić' } }),
    db.project.create({ data: { name: 'Renovacija kancelarije', description: 'Renovacija i opremanje novog prostora', status: 'zavrsen', budget: 150000, spent: 145000, priority: 'nizak', assignedTo: 'Marko Petrović', endDate: new Date(year, month - 1, 15) } }),
  ])

  // Project Tasks
  for (const proj of projects) {
    const tasks = [
      { title: 'Planiranje', status: proj.status === 'zavrsen' ? 'zavrseno' : 'zavrseno', priority: 'visok' },
      { title: 'Izvršenje', status: proj.status === 'zavrsen' ? 'zavrseno' : 'u_toku', priority: 'visok' },
      { title: 'Testiranje', status: proj.status === 'zavrsen' ? 'zavrseno' : 'todo', priority: 'srednji' },
      { title: 'Dokumentacija', status: proj.status === 'zavrsen' ? 'zavrseno' : 'todo', priority: 'nizak' },
    ]
    for (const t of tasks) {
      await db.projectTask.create({ data: { projectId: proj.id, ...t } })
    }
  }

  // Documents
  await Promise.all([
    db.document.create({ data: { title: 'Ugovor o saradnji - Delta Trade', type: 'ugovor', category: 'Partneri', status: 'aktivno', partnerId: partners[0].id } }),
    db.document.create({ data: { title: 'Godišnji izveštaj 2024', type: 'izvestaj', category: 'Izveštaji', status: 'aktivno' } }),
    db.document.create({ data: { title: 'Ponuda za IT opremu', type: 'ponuda', category: 'Prodaja', status: 'aktivno', expiresAt: new Date(year, month + 3, 1) } }),
    db.document.create({ data: { title: 'Ugovor o zakupi vozila', type: 'ugovor', category: 'Logistika', status: 'aktivno' } }),
    db.document.create({ data: { title: 'Račun br. 1-2025', type: 'faktura', category: 'Finansije', status: 'aktivno' } }),
  ])

  // Accounts (Kontni plan)
  await Promise.all([
    db.account.create({ data: { code: '110', name: 'Gotovina', type: 'aktivna' } }),
    db.account.create({ data: { code: '200', name: 'Dobavljači', type: 'pasivna' } }),
    db.account.create({ data: { code: '201', name: 'Kupci', type: 'aktivna' } }),
    db.account.create({ data: { code: '240', name: 'Zalihe robe', type: 'aktivna' } }),
    db.account.create({ data: { code: '410', name: 'Ukupni prihodi od prodaje', type: 'prihodka' } }),
    db.account.create({ data: { code: '420', name: 'Nabavna vrednost prodate robe', type: 'rashodna' } }),
    db.account.create({ data: { code: '500', name: 'Materijalni troškovi', type: 'rashodna' } }),
    db.account.create({ data: { code: '510', name: 'Troškovi zarada', type: 'rashodna' } }),
    db.account.create({ data: { code: '520', name: 'Troškovi režija', type: 'rashodna' } }),
    db.account.create({ data: { code: '020', name: 'Osnovna sredstva', type: 'aktivna', parentCode: '01' } }),
    db.account.create({ data: { code: '028', name: 'Amortizacija osnovnih sredstava', type: 'aktivna' } }),
    db.account.create({ data: { code: '601', name: 'Amortizacija', type: 'rashodna' } }),
  ])

  // Journal entries
  await Promise.all([
    db.journalEntry.create({ data: { date: new Date(year, month, 5), accountCode: '110', debit: 250000, credit: 0, description: 'Uplata od Delta Trade' } }),
    db.journalEntry.create({ data: { date: new Date(year, month, 5), accountCode: '201', debit: 0, credit: 250000, description: 'Uplata od Delta Trade' } }),
    db.journalEntry.create({ data: { date: new Date(year, month, 10), accountCode: '240', debit: 85000, credit: 0, description: 'Nabavka robe - Metal-Pro', documentRef: 'PO-001' } }),
    db.journalEntry.create({ data: { date: new Date(year, month, 10), accountCode: '200', debit: 0, credit: 85000, description: 'Nabavka robe - Metal-Pro', documentRef: 'PO-001' } }),
    db.journalEntry.create({ data: { date: new Date(year, month, 15), accountCode: '201', debit: 145000, credit: 0, description: 'Prodaja robe - TehnoShop', documentRef: 'F-001' } }),
    db.journalEntry.create({ data: { date: new Date(year, month, 15), accountCode: '410', debit: 0, credit: 145000, description: 'Prodaja robe - TehnoShop', documentRef: 'F-001' } }),
    db.journalEntry.create({ data: { date: new Date(year, month, 20), accountCode: '520', debit: 35000, credit: 0, description: 'Struja za januar', documentRef: 'R-STR-001' } }),
    db.journalEntry.create({ data: { date: new Date(year, month, 20), accountCode: '110', debit: 0, credit: 35000, description: 'Struja za januar', documentRef: 'R-STR-001' } }),
  ])

  // Protocol entries
  await Promise.all([
    db.protocolEntry.create({ data: { number: 'PROT-2025-0001', direction: 'ulaz', sender: 'Poreska uprava', subject: 'Rešenje o PDV obrascu', documentType: 'rešenje', responsible: 'Jelena Stanković', status: 'odgovoren', priority: 'srednji' } }),
    db.protocolEntry.create({ data: { number: 'PROT-2025-0002', direction: 'ulaz', sender: 'Delta Trade D.O.O.', subject: 'Zahtev za ponudu IT opreme', documentType: 'pismo', responsible: 'Ana Milić', status: 'u_radu', priority: 'visok', dueDate: new Date(year, month + 1, 5) } }),
    db.protocolEntry.create({ data: { number: 'PROT-2025-0003', direction: 'izlaz', recipient: 'Metal-Pro D.O.O.', subject: 'Narudžbenica za aluminijumske profile', documentType: 'ponuda', responsible: 'Marko Petrović', status: 'završen', priority: 'hitan' } }),
    db.protocolEntry.create({ data: { number: 'PROT-2025-0004', direction: 'ulaz', sender: 'Banca Intesa', subject: 'Obaveštenje o transakciji', documentType: 'pismo', responsible: 'Jelena Stanković', status: 'primljen', priority: 'nizak' } }),
    db.protocolEntry.create({ data: { number: 'PROT-2025-0005', direction: 'izlaz', recipient: 'TehnoShop S.O.', subject: 'Ponuda za LED panele', documentType: 'ponuda', responsible: 'Ana Milić', status: 'u_radu', priority: 'srednji', dueDate: new Date(year, month + 2, 1) } }),
    db.protocolEntry.create({ data: { number: 'PROT-2025-0006', direction: 'ulaz', sender: 'Eko-Pak D.O.O.', subject: 'Ugovor o saradnji', documentType: 'ugovor', responsible: 'Marko Petrović', status: 'proslijeđen', priority: 'visok' } }),
  ])

  // Courses (LMS)
  const courses = await Promise.all([
    db.course.create({ data: { title: 'Uvod u ERP sisteme', description: 'Osnovni koncepti i prednosti ERP sistema', category: 'IT', instructor: 'Stefan Ilić', duration: 120, status: 'aktivno' } }),
    db.course.create({ data: { title: 'Prodajne tehnike', description: 'Moderne prodajne tehnike i komunikacija sa klijentima', category: 'Menadžment', instructor: 'Ana Milić', duration: 90, status: 'aktivno' } }),
    db.course.create({ data: { title: 'Osnovne radnje u Excel-u', description: 'Formule, pivot tabele i grafikoni', category: 'IT', instructor: 'Stefan Ilić', duration: 180, status: 'aktivno' } }),
    db.course.create({ data: { title: 'Bezbednost na radu', description: 'Propisi i praksa bezbednosti na radnom mestu', category: 'HR', instructor: 'Nikola Perić', duration: 60, status: 'aktivno' } }),
  ])

  // Lessons
  for (const course of courses) {
    const lessons = [
      { title: 'Uvod i postavke', type: 'tekst', orderNum: 1 },
      { title: 'Osnovni koncepti', type: 'tekst', orderNum: 2 },
      { title: 'Praktični primer', type: 'video', orderNum: 3 },
      { title: 'Test znanja', type: 'test', orderNum: 4 },
    ]
    for (const l of lessons) {
      await db.lesson.create({ data: { courseId: course.id, ...l } })
    }
  }

  // Vehicles
  const vehicles = await Promise.all([
    db.vehicle.create({ data: { registration: 'BG-123-AB', make: 'Volkswagen', model: 'Transporter', year: 2022, fuelType: 'dizel', mileage: 85000, status: 'aktivno', assignedTo: 'Nikola Perić' } }),
    db.vehicle.create({ data: { registration: 'NS-456-CD', make: 'Peugeot', model: 'Partner', year: 2023, fuelType: 'dizel', mileage: 42000, status: 'aktivno', assignedTo: 'Milica Vasić' } }),
    db.vehicle.create({ data: { registration: 'BG-789-EF', make: 'Skoda', model: 'Octavia', year: 2021, fuelType: 'benzin', mileage: 65000, status: 'na_servisu', assignedTo: 'Marko Petrović' } }),
  ])

  // Vehicle services & expenses
  await Promise.all([
    db.vehicleService.create({ data: { vehicleId: vehicles[0].id, type: 'promjena_ulja', description: 'Zamena ulja i filtera', cost: 15000, mileage: 82000, nextDue: new Date(year, month + 3, 15) } }),
    db.vehicleService.create({ data: { vehicleId: vehicles[2].id, type: 'servis', description: 'Zamena kočionih pločica', cost: 35000, mileage: 63000, nextDue: new Date(year, month + 1, 20) } }),
    db.vehicleExpense.create({ data: { vehicleId: vehicles[0].id, type: 'gorivo', description: 'Gorivo - NOVI SAD', amount: 12000, mileage: 84500 } }),
    db.vehicleExpense.create({ data: { vehicleId: vehicles[0].id, type: 'putarina', description: 'Putarina NS-BG', amount: 1200, mileage: 84000 } }),
    db.vehicleExpense.create({ data: { vehicleId: vehicles[1].id, type: 'gorivo', description: 'Gorivo - SUBOTICA', amount: 8500, mileage: 41500 } }),
    db.vehicleExpense.create({ data: { vehicleId: vehicles[1].id, type: 'parking', description: 'Parking - BG centar', amount: 300, mileage: 41200 } }),
  ])

  // ===== RENT A CAR =====
  const rentalVehicles = await Promise.all([
    db.rentalVehicle.create({ data: { name: 'VW Golf 8', make: 'Volkswagen', model: 'Golf 8', year: 2023, registration: 'BG-R-001', fuelType: 'dizel', transmission: 'automatski', seats: 5, dailyRate: 4500, weeklyRate: 28000, monthlyRate: 95000, mileage: 25000, status: 'dostupno', ac: true, gps: true } }),
    db.rentalVehicle.create({ data: { name: 'Škoda Octavia', make: 'Škoda', model: 'Octavia', year: 2022, registration: 'BG-R-002', fuelType: 'benzin', transmission: 'automatski', seats: 5, dailyRate: 4000, weeklyRate: 25000, monthlyRate: 85000, mileage: 42000, status: 'iznajmljeno', ac: true, gps: true } }),
    db.rentalVehicle.create({ data: { name: 'Peugeot 308', make: 'Peugeot', model: '308', year: 2023, registration: 'BG-R-003', fuelType: 'dizel', transmission: 'manuelni', seats: 5, dailyRate: 3500, weeklyRate: 22000, monthlyRate: 75000, mileage: 18000, status: 'dostupno', ac: true, gps: false } }),
    db.rentalVehicle.create({ data: { name: 'Citroen C3', make: 'Citroen', model: 'C3', year: 2024, registration: 'BG-R-004', fuelType: 'benzin', transmission: 'manuelni', seats: 5, dailyRate: 2800, weeklyRate: 18000, monthlyRate: 60000, mileage: 8000, status: 'rezervisano', ac: true, gps: false } }),
    db.rentalVehicle.create({ data: { name: 'Dacia Duster', make: 'Dacia', model: 'Duster', year: 2022, registration: 'BG-R-005', fuelType: 'dizel', transmission: 'manuelni', seats: 5, dailyRate: 3800, weeklyRate: 24000, monthlyRate: 80000, mileage: 35000, status: 'dostupno', ac: true, gps: true } }),
    db.rentalVehicle.create({ data: { name: 'Fiat 500', make: 'Fiat', model: '500', year: 2024, registration: 'BG-R-006', fuelType: 'benzin', transmission: 'manuelni', seats: 4, dailyRate: 2200, weeklyRate: 14000, monthlyRate: 48000, mileage: 5000, status: 'na_servisu', ac: false, gps: false } }),
  ])

  await Promise.all([
    db.rental.create({ data: { number: 'RNT-2025-001', vehicleId: rentalVehicles[1].id, clientName: 'Jovan Marković', clientPhone: '+381 63 999 111', clientEmail: 'jovan@gmail.com', startDate: new Date(year, month, 10), endDate: new Date(year, month, 15), pickupMileage: 40000, dailyRate: 4000, totalDays: 5, totalAmount: 20000, deposit: 5000, status: 'aktivna' } }),
    db.rental.create({ data: { number: 'RNT-2025-002', vehicleId: rentalVehicles[3].id, clientName: 'Ana Savić', clientPhone: '+381 64 888 222', startDate: new Date(year, month + 1, 1), endDate: new Date(year, month + 1, 7), pickupMileage: 7000, dailyRate: 2800, totalDays: 6, totalAmount: 16800, deposit: 3000, status: 'rezervacija' } }),
    db.rental.create({ data: { number: 'RNT-2025-003', vehicleId: rentalVehicles[0].id, clientName: 'Petar Nikolić', clientPhone: '+381 65 777 333', clientIdDoc: '1209987654321', startDate: new Date(year, month - 1, 5), endDate: new Date(year, month - 1, 12), pickupMileage: 22000, returnMileage: 24500, dailyRate: 4500, totalDays: 7, totalAmount: 31500, deposit: 8000, status: 'zavrsena' } }),
    db.rental.create({ data: { number: 'RNT-2025-004', vehicleId: rentalVehicles[2].id, clientName: 'Milan Đorđević', clientPhone: '+381 62 666 444', clientEmail: 'milan@yahoo.com', startDate: new Date(year, month - 2, 1), endDate: new Date(year, month - 2, 3), pickupMileage: 16000, returnMileage: 16200, dailyRate: 3500, totalDays: 2, totalAmount: 7000, deposit: 3000, status: 'zavrsena' } }),
  ])

  // ===== KAFE RESTORAN =====
  const restoCategories = await Promise.all([
    db.restoCategory.create({ data: { name: 'Kafa i napitci', sortOrder: 1, isActive: true } }),
    db.restoCategory.create({ data: { name: 'Predjela', sortOrder: 2, isActive: true } }),
    db.restoCategory.create({ data: { name: 'Glavna jela', sortOrder: 3, isActive: true } }),
    db.restoCategory.create({ data: { name: 'Deserti', sortOrder: 4, isActive: true } }),
    db.restoCategory.create({ data: { name: 'Alkoholna pića', sortOrder: 5, isActive: true } }),
  ])

  const menuItems = await Promise.all([
    // Kafa i napitci
    db.restoMenuItem.create({ data: { categoryId: restoCategories[0].id, name: 'Espresso', description: 'Dvostruki espresso', price: 220, cost: 40, sortOrder: 1, isAvailable: true } }),
    db.restoMenuItem.create({ data: { categoryId: restoCategories[0].id, name: 'Cappuccino', description: 'Sa penom od mleka', price: 300, cost: 60, sortOrder: 2, isAvailable: true } }),
    db.restoMenuItem.create({ data: { categoryId: restoCategories[0].id, name: 'Latte', description: 'Dvostruki espresso sa toplim mlekom', price: 350, cost: 70, sortOrder: 3, isAvailable: true } }),
    db.restoMenuItem.create({ data: { categoryId: restoCategories[0].id, name: 'Čaj', description: 'Čaj od kamilice, nane, limuna', price: 200, cost: 30, sortOrder: 4, isAvailable: true } }),
    db.restoMenuItem.create({ data: { categoryId: restoCategories[0].id, name: 'Sok od pomorandže', description: 'Sveži sok 250ml', price: 350, cost: 120, sortOrder: 5, isAvailable: true } }),
    // Predjela
    db.restoMenuItem.create({ data: { categoryId: restoCategories[1].id, name: 'Supa dana', description: 'Sveža domaća supa', price: 350, cost: 100, sortOrder: 1, isAvailable: true } }),
    db.restoMenuItem.create({ data: { categoryId: restoCategories[1].id, name: 'Salata sa tunom', description: 'Mešana salata sa tunom, paradajzom, maslinama', price: 550, cost: 200, sortOrder: 2, isAvailable: true } }),
    db.restoMenuItem.create({ data: { categoryId: restoCategories[1].id, name: 'Bruskete', description: 'Bruskete sa paradajzom i bosiljkom', price: 450, cost: 120, sortOrder: 3, isAvailable: true } }),
    // Glavna jela
    db.restoMenuItem.create({ data: { categoryId: restoCategories[2].id, name: 'Ćevapi', description: '10 komada sa lepinjom, kajmakom i lukom', price: 750, cost: 280, sortOrder: 1, isAvailable: true } }),
    db.restoMenuItem.create({ data: { categoryId: restoCategories[2].id, name: 'Pljeskavica', description: 'Goveđa pljeskavica sa lepinjom', price: 680, cost: 250, sortOrder: 2, isAvailable: true } }),
    db.restoMenuItem.create({ data: { categoryId: restoCategories[2].id, name: 'Pasta Carbonara', description: 'Spaghetti sa slaninom, jajima i parmezanom', price: 620, cost: 180, sortOrder: 3, isAvailable: true } }),
    db.restoMenuItem.create({ data: { categoryId: restoCategories[2].id, name: 'Steak sa pečurkama', description: 'Svinjski steak sa sosom od pečuraka', price: 950, cost: 380, sortOrder: 4, isAvailable: true } }),
    db.restoMenuItem.create({ data: { categoryId: restoCategories[2].id, name: 'Grilovano pile', description: 'Pileće grlo na žaru sa povrćem', price: 720, cost: 260, sortOrder: 5, isAvailable: true } }),
    // Deserti
    db.restoMenuItem.create({ data: { categoryId: restoCategories[3].id, name: 'Torta čokolada', description: 'Čokoladna torta sa ganache', price: 380, cost: 100, sortOrder: 1, isAvailable: true } }),
    db.restoMenuItem.create({ data: { categoryId: restoCategories[3].id, name: 'Palacinke', description: 'Palacinke sa džemom/nutellom', price: 300, cost: 60, sortOrder: 2, isAvailable: true } }),
    db.restoMenuItem.create({ data: { categoryId: restoCategories[3].id, name: 'Sladoled', description: '3 kugle sladoleda po izboru', price: 280, cost: 70, sortOrder: 3, isAvailable: true } }),
    // Alkoholna pića
    db.restoMenuItem.create({ data: { categoryId: restoCategories[4].id, name: 'Lager pivo', description: 'Točeno pivo 0.5L', price: 280, cost: 100, sortOrder: 1, isAvailable: true } }),
    db.restoMenuItem.create({ data: { categoryId: restoCategories[4].id, name: 'Crno vino', description: 'Vino čaša 0.2L', price: 320, cost: 80, sortOrder: 2, isAvailable: true } }),
    db.restoMenuItem.create({ data: { categoryId: restoCategories[4].id, name: 'Žestočka', description: 'Rakija od šljive 0.05L', price: 250, cost: 60, sortOrder: 3, isAvailable: true } }),
  ])

  // Resto tables
  const restoTables = await Promise.all([
    db.restoTable.create({ data: { number: 1, name: 'Prozor 1', capacity: 2, status: 'slobodan', location: 'sprat' } }),
    db.restoTable.create({ data: { number: 2, name: 'Prozor 2', capacity: 2, status: 'zauzet', location: 'sprat' } }),
    db.restoTable.create({ data: { number: 3, name: 'Centar', capacity: 4, status: 'slobodan', location: 'sprat' } }),
    db.restoTable.create({ data: { number: 4, name: 'Sofa', capacity: 6, status: 'slobodan', location: 'sprat' } }),
    db.restoTable.create({ data: { number: 5, name: 'Terasa 1', capacity: 4, status: 'rezervisan', location: 'terasa' } }),
    db.restoTable.create({ data: { number: 6, name: 'Terasa 2', capacity: 4, status: 'slobodan', location: 'terasa' } }),
    db.restoTable.create({ data: { number: 7, name: 'Bašta 1', capacity: 8, status: 'slobodan', location: 'bašta' } }),
    db.restoTable.create({ data: { number: 8, name: 'Bašta 2', capacity: 8, status: 'slobodan', location: 'bašta' } }),
  ])

  // Resto orders
  await Promise.all([
    db.restoOrder.create({
      data: {
        orderNumber: 1, tableId: restoTables[1].id, status: 'u_toku', type: 'restoran', waiter: 'Milica',
        totalAmount: 1270,
        items: { create: [
          { menuItemId: menuItems[0].id, menuItemName: 'Espresso', quantity: 2, unitPrice: 220, total: 440 },
          { menuItemId: menuItems[4].id, menuItemName: 'Sok od pomorandže', quantity: 1, unitPrice: 350, total: 350 },
          { menuItemId: menuItems[6].id, menuItemName: 'Salata sa tunom', quantity: 1, unitPrice: 550, total: 550, status: 'spremno' },
        ] }
      }
    }),
    db.restoOrder.create({
      data: {
        orderNumber: 2, tableId: restoTables[2].id, status: 'spremno', type: 'restoran', waiter: 'Ana',
        totalAmount: 2030,
        items: { create: [
          { menuItemId: menuItems[1].id, menuItemName: 'Cappuccino', quantity: 2, unitPrice: 300, total: 600 },
          { menuItemId: menuItems[8].id, menuItemName: 'Ćevapi', quantity: 1, unitPrice: 750, total: 750, status: 'spremno' },
          { menuItemId: menuItems[11].id, menuItemName: 'Pasta Carbonara', quantity: 1, unitPrice: 620, total: 620, status: 'spremno' },
        ] }
      }
    }),
    db.restoOrder.create({
      data: {
        orderNumber: 3, tableId: null, status: 'zavrseno', type: 'dostava', waiter: 'Milica', totalAmount: 1050,
        items: { create: [
          { menuItemId: menuItems[8].id, menuItemName: 'Ćevapi', quantity: 1, unitPrice: 750, total: 750, status: 'usluženo' },
          { menuItemId: menuItems[0].id, menuItemName: 'Espresso', quantity: 1, unitPrice: 220, total: 220, status: 'usluženo' },
        ] }
      }
    }),
  ])

  // ===== EMAIL MARKETING (MAILERLITE) =====
  const emailLists = await Promise.all([
    db.emailList.create({ data: { name: 'Glavna lista', description: 'Svi pretplatnici - newsletter' } }),
    db.emailList.create({ data: { name: 'VIP klijenti', description: 'VIP i verni klijenti' } }),
    db.emailList.create({ data: { name: 'Poslovni partneri', description: 'B2B partneri i dobavljači' } }),
  ])

  await Promise.all([
    db.emailSubscriber.create({ data: { listId: emailLists[0].id, email: 'marko@delta.rs', firstName: 'Marko', lastName: 'Petrović', status: 'aktivan', source: 'ručno' } }),
    db.emailSubscriber.create({ data: { listId: emailLists[0].id, email: 'jelena@metalpro.rs', firstName: 'Jelena', lastName: 'Stanković', status: 'aktivan', source: 'web forma' } }),
    db.emailSubscriber.create({ data: { listId: emailLists[0].id, email: 'nenad@techshop.rs', firstName: 'Nenad', lastName: 'Jovanović', status: 'aktivan', source: 'ručno' } }),
    db.emailSubscriber.create({ data: { listId: emailLists[0].id, email: 'ana@ekopak.rs', firstName: 'Ana', lastName: 'Milić', status: 'neaktivan', source: 'uvoz' } }),
    db.emailSubscriber.create({ data: { listId: emailLists[1].id, email: 'ivan@slobodan.rs', firstName: 'Ivan', lastName: 'Nikolić', status: 'aktivan', source: 'ručno' } }),
    db.emailSubscriber.create({ data: { listId: emailLists[1].id, email: 'maja@startup.rs', firstName: 'Maja', lastName: 'Đorđević', status: 'aktivan', source: 'web forma' } }),
    db.emailSubscriber.create({ data: { listId: emailLists[2].id, email: 'stefan@autopart.rs', firstName: 'Stefan', lastName: 'Popović', status: 'aktivan', source: 'ručno' } }),
    db.emailSubscriber.create({ data: { listId: emailLists[2].id, email: 'luka@gradnja.rs', firstName: 'Luka', lastName: 'Simić', status: 'aktivan', source: 'ručno' } }),
  ])

  await Promise.all([
    db.emailCampaign.create({ data: { name: 'Januarski newsletter', subject: 'Novosti za januar 2025', preheader: 'Pogledajte šta je novo kod nas', content: '<h1>Novosti</h1><p>Dobrodošli u novu godinu!</p>', status: 'zavrsena', listId: emailLists[0].id, sentCount: 3, openRate: 66.7, clickRate: 33.3, sentAt: new Date(year, month - 2, 5) } }),
    db.emailCampaign.create({ data: { name: 'Febuarska promocija', subject: '🔥 20% popusta na sve usluge', preheader: 'Vreme je za uštedu', content: '<h1>Promocija!</h1><p>20% popusta za sve partnere</p>', status: 'poslata', listId: emailLists[0].id, sentCount: 4, openRate: 50, clickRate: 25, sentAt: new Date(year, month - 1, 10) } }),
    db.emailCampaign.create({ data: { name: 'VIP ponuda - Mart', subject: 'Ekskluzivna ponuda za naše VIP partnere', content: '<h1>VIP ponuda</h1><p>Posebna ponuda samo za vas</p>', status: 'nacrt', listId: emailLists[1].id } }),
    db.emailCampaign.create({ data: { name: 'B2B obaveštenje', subject: 'Ažuriranje cenovnika', content: '<h1>Cenovnik</h1><p>Nove cene važe od 1. aprila</p>', status: 'nacrt', listId: emailLists[2].id } }),
  ])

  await Promise.all([
    db.emailTemplate.create({ data: { name: 'Newsletter šablon', subject: 'Novosti od {{company}}', content: '<div style="font-family:sans-serif"><h1>{{title}}</h1><p>{{content}}</p></div>', category: 'promotivno' } }),
    db.emailTemplate.create({ data: { name: 'Dobrodošlica', subject: 'Dobrodošli {{firstName}}!', content: '<div><h1>Zdravo {{firstName}}!</h1><p>Hvala vam na prijavi.</p></div>', category: 'transakciono' } }),
    db.emailTemplate.create({ data: { name: 'Obaveštenje o narudžbi', subject: 'Vaša narudžbina je {{status}}', content: '<div><h1>Narudžbina #{{orderNumber}}</h1><p>Status: {{status}}</p></div>', category: 'obavestenje' } }),
  ])

  // ===== APP SETTINGS =====
  const defaultSettings = [
    // Module toggles
    { key: 'module_finansije_enabled', value: 'true', label: 'Finansije', type: 'boolean', group: 'modules' },
    { key: 'module_fakture_enabled', value: 'true', label: 'Fakture', type: 'boolean', group: 'modules' },
    { key: 'module_magacin_enabled', value: 'true', label: 'Magacin', type: 'boolean', group: 'modules' },
    { key: 'module_partneri_enabled', value: 'true', label: 'Partneri', type: 'boolean', group: 'modules' },
    { key: 'module_nabavka_enabled', value: 'true', label: 'Nabavka', type: 'boolean', group: 'modules' },
    { key: 'module_crm_enabled', value: 'true', label: 'CRM', type: 'boolean', group: 'modules' },
    { key: 'module_kalendar_enabled', value: 'true', label: 'Kalendar', type: 'boolean', group: 'modules' },
    { key: 'module_zaposleni_enabled', value: 'true', label: 'Zaposleni', type: 'boolean', group: 'modules' },
    { key: 'module_projekti_enabled', value: 'true', label: 'Projekti', type: 'boolean', group: 'modules' },
    { key: 'module_sredstva_enabled', value: 'true', label: 'Osnovna sredstva', type: 'boolean', group: 'modules' },
    { key: 'module_dokumenta_enabled', value: 'true', label: 'Dokumenta', type: 'boolean', group: 'modules' },
    { key: 'module_knjigovodstvo_enabled', value: 'true', label: 'Knjigovodstvo', type: 'boolean', group: 'modules' },
    { key: 'module_protokol_enabled', value: 'true', label: 'Protokol', type: 'boolean', group: 'modules' },
    { key: 'module_edukacija_enabled', value: 'true', label: 'Edukacija', type: 'boolean', group: 'modules' },
    { key: 'module_vozni_park_enabled', value: 'true', label: 'Vozni park', type: 'boolean', group: 'modules' },
    { key: 'module_rent_a_car_enabled', value: 'true', label: 'Rent a Car', type: 'boolean', group: 'modules' },
    { key: 'module_kafe_restoran_enabled', value: 'true', label: 'Kafe Restoran', type: 'boolean', group: 'modules' },
    { key: 'module_email_marketing_enabled', value: 'true', label: 'Email Marketing', type: 'boolean', group: 'modules' },
    // Company settings
    { key: 'company_name', value: 'Reflection Business D.O.O.', label: 'Naziv firme', type: 'text', group: 'company' },
    { key: 'company_pib', value: '100000000', label: 'PIB', type: 'text', group: 'company' },
    { key: 'company_maticni_br', value: '20000000', label: 'Matični broj', type: 'text', group: 'company' },
    { key: 'company_address', value: 'Bulevar oslobođenja 1', label: 'Adresa', type: 'text', group: 'company' },
    { key: 'company_city', value: 'Beograd', label: 'Grad', type: 'text', group: 'company' },
    { key: 'company_zip', value: '11000', label: 'Poštanski broj', type: 'text', group: 'company' },
    { key: 'company_phone', value: '+381 11 000 0000', label: 'Telefon', type: 'text', group: 'company' },
    { key: 'company_email', value: 'info@reflection.rs', label: 'Email', type: 'text', group: 'company' },
    { key: 'company_website', value: 'www.reflection.rs', label: 'Web sajt', type: 'text', group: 'company' },
    { key: 'company_bank_account', value: '265-000000-00', label: 'Žiro račun', type: 'text', group: 'company' },
    // General settings
    { key: 'general_currency', value: 'RSD', label: 'Valuta', type: 'text', group: 'general' },
    { key: 'general_tax_rate', value: '20', label: 'Stopa PDV (%)', type: 'number', group: 'general' },
    { key: 'general_payment_method', value: 'racun', label: 'Način plaćanja', type: 'text', group: 'general' },
    { key: 'general_fiscal_year_start', value: '1', label: 'Početak fiskalne godine (mesec)', type: 'number', group: 'general' },
    { key: 'general_language', value: 'sr', label: 'Jezik', type: 'text', group: 'general' },
  ]

  await Promise.all(
    defaultSettings.map((s) => db.appSetting.create({ data: s }))
  )

  console.log('✅ Database seeded successfully!')
  console.log(`  - ${partners.length} partners`)
  console.log(`  - ${products.length} products`)
  console.log(`  - ${transactions.length} transactions`)
  console.log(`  - 15 invoices`)
  console.log(`  - ~50 cash register entries`)
  console.log(`  - 30 stock movements`)
  console.log(`  - 8 purchase orders`)
  console.log(`  - 6 delivery notes`)
  console.log(`  - 3 price lists`)
  console.log(`  - 8 CRM contacts`)
  console.log(`  - 6 deals`)
  console.log(`  - 7 CRM activities`)
  console.log(`  - 6 calendar events`)
  console.log(`  - 6 employees`)
  console.log(`  - 6 payrolls`)
  console.log(`  - ~150 attendance records`)
  console.log(`  - 5 assets`)
  console.log(`  - 4 projects with tasks`)
  console.log(`  - 5 documents`)
  console.log(`  - 12 accounts`)
  console.log(`  - 8 journal entries`)
  console.log(`  - 6 protocol entries`)
  console.log(`  - 4 courses with lessons`)
  console.log(`  - 3 vehicles`)
  console.log(`  - ${rentalVehicles.length} rental vehicles + 4 rentals`)
  console.log(`  - ${restoCategories.length} resto categories + ${menuItems.length} menu items`)
  console.log(`  - ${restoTables.length} tables + 3 orders`)
  console.log(`  - ${emailLists.length} email lists + 8 subscribers + 4 campaigns`)
  console.log(`  - 3 email templates`)
  console.log(`  - ${defaultSettings.length} app settings`)
}

seed()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(() => {
    process.exit(0)
  })
