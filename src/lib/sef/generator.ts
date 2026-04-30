/**
 * SEF (Servis elektronskih faktura) XML Generator
 *
 * Generates SEF-compliant XML invoices based on EN16931 EU standard
 * with Serbian extensions for submission to the Serbian Tax Authority portal.
 */

// ==================== TYPES ====================

export interface SEFSeller {
  name: string
  address: string
  city: string
  pib: string
  maticniBr: string
  account: string
  bank: string
}

export interface SEFBuyer {
  name: string
  address: string
  city: string
  pib: string
  maticniBr: string | null
}

export interface SEFInvoiceLine {
  name: string
  quantity: number
  unitPrice: number
  total: number
  taxRate: number
  taxAmount: number
}

export interface SEFInvoiceData {
  uuid: string
  invoiceNumber: string
  issueDate: string // ISO date
  dueDate: string // ISO date
  invoiceTypeCode: string // 380 = standard, 384 = corrected, 381 = proforma
  currency: string
  seller: SEFSeller
  buyer: SEFBuyer
  lines: SEFInvoiceLine[]
  totalWithoutTax: number
  taxAmount: number
  totalWithTax: number
  paymentMethod: string
  paymentAccount: string
  notes?: string
}

// ==================== COMPANY DEFAULTS ====================

export const DEFAULT_SELLER: SEFSeller = {
  name: 'Reflection Business',
  address: 'Bulevar Mihajla Pupina 10a',
  city: 'Beograd',
  pib: '123456789',
  maticniBr: '21012345',
  account: '265-12345678-12',
  bank: 'Banca Intesa Beograd',
}

// ==================== UUID GENERATOR ====================

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// ==================== XML ESCAPING ====================

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function formatAmount(num: number): string {
  return num.toFixed(2)
}

function formatDateSEF(isoDate: string | Date): string {
  // SEF expects YYYY-MM-DD format
  if (isoDate instanceof Date) {
    return isoDate.toISOString().split('T')[0]
  }
  return String(isoDate).split('T')[0]
}

// ==================== PAYMENT MEANS CODE ====================

function getPaymentMeansCode(method: string): string {
  switch (method) {
    case 'gotovina':
      return '10' // Cash
    case 'kartica':
      return '48' // Card
    case 'racun':
    default:
      return '30' // Credit transfer (bank account)
  }
}

// ==================== MAIN GENERATOR ====================

export function generateSEFXML(data: Omit<SEFInvoiceData, 'uuid'> & { uuid?: string }): string {
  const uuid = data.uuid || generateUUID()
  const paymentMeansCode = getPaymentMeansCode(data.paymentMethod)

  // Group tax lines by rate for tax breakdown
  const taxBreakdown = new Map<number, { taxableAmount: number; taxAmount: number }>()
  for (const line of data.lines) {
    const existing = taxBreakdown.get(line.taxRate) || { taxableAmount: 0, taxAmount: 0 }
    const lineBase = line.total - line.taxAmount
    existing.taxableAmount += lineBase
    existing.taxAmount += line.taxAmount
    taxBreakdown.set(line.taxRate, existing)
  }

  // Build invoice lines XML
  const invoiceLinesXml = data.lines
    .map(
      (line, index) => `
    <cbc:ID>${index + 1}</cbc:ID>
    <cbc:InvoicedQuantity unitCode="C62">${formatAmount(line.quantity)}</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="${data.currency}">${formatAmount(line.total)}</cbc:LineExtensionAmount>
    <cac:Item>
      <cbc:Name>${escapeXml(line.name)}</cbc:Name>
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="${data.currency}">${formatAmount(line.unitPrice)}</cbc:PriceAmount>
    </cac:Price>`,
    )
    .join('')

  // Wrap lines in InvoiceLine elements
  const wrappedLines = data.lines
    .map(
      (line, index) => `    <cac:InvoiceLine>
    <cbc:ID>${index + 1}</cbc:ID>
    <cbc:InvoicedQuantity unitCode="C62">${formatAmount(line.quantity)}</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="${data.currency}">${formatAmount(line.total)}</cbc:LineExtensionAmount>
    <cac:Item>
      <cbc:Name>${escapeXml(line.name)}</cbc:Name>
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="${data.currency}">${formatAmount(line.unitPrice)}</cbc:PriceAmount>
    </cac:Price>
    ${line.taxRate > 0
      ? `    <cac:TaxCategory>
      <cbc:ID schemeID="UN/ECE 5305" schemeAgencyID="6">${line.taxRate === 20 ? 'S' : line.taxRate === 10 ? 'AA' : 'Z'}</cbc:ID>
      <cbc:Percent>${formatAmount(line.taxRate)}</cbc:Percent>
      <cac:TaxScheme>
        <cbc:ID schemeID="UN/ECE 5153" schemeAgencyID="6">VAT</cbc:ID>
      </cac:TaxScheme>
    </cac:TaxCategory>`
      : ''
    }
  </cac:InvoiceLine>`,
    )
    .join('\n')

  // Build tax breakdown XML
  const taxBreakdownXml = Array.from(taxBreakdown.entries())
    .map(
      ([rate, amounts]) => `      <cac:TaxSubtotal>
        <cbc:TaxableAmount currencyID="${data.currency}">${formatAmount(amounts.taxableAmount)}</cbc:TaxableAmount>
        <cbc:TaxAmount currencyID="${data.currency}">${formatAmount(amounts.taxAmount)}</cbc:TaxAmount>
        <cac:TaxCategory>
          <cbc:ID schemeID="UN/ECE 5305" schemeAgencyID="6">${rate === 20 ? 'S' : rate === 10 ? 'AA' : 'Z'}</cbc:ID>
          <cbc:Percent>${formatAmount(rate)}</cbc:Percent>
          <cac:TaxScheme>
            <cbc:ID schemeID="UN/ECE 5153" schemeAgencyID="6">VAT</cbc:ID>
          </cac:TaxScheme>
        </cac:TaxCategory>
      </cac:TaxSubtotal>`,
    )
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:ext="urn:sef:extension:xsd:SEFExtension-1">
  <ext:UBLExtensions>
    <ext:UBLExtension>
      <ext:ExtensionContent>
        <ext:TaxRegistration>
          <ext:TaxSchemeID>VAT</ext:TaxSchemeID>
          <ext:TaxRegistrationID schemeID="RS_PIB">${escapeXml(data.seller.pib)}</ext:TaxRegistrationID>
        </ext:TaxRegistration>
      </ext:ExtensionContent>
    </ext:UBLExtension>
  </ext:UBLExtensions>
  <cbc:CustomizationID>urn:cen.eu:en16931:2017</cbc:CustomizationID>
  <cbc:ProfileID>urn:fdc:peppol.eu:2017:poacc:billing:01:1.0</cbc:ProfileID>
  <cbc:ID>${escapeXml(data.invoiceNumber)}</cbc:ID>
  <cbc:IssueDate>${formatDateSEF(data.issueDate)}</cbc:IssueDate>
  <cbc:DueDate>${formatDateSEF(data.dueDate)}</cbc:DueDate>
  <cbc:InvoiceTypeCode>${data.invoiceTypeCode}</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>${data.currency}</cbc:DocumentCurrencyCode>
  <cbc:AccountingCost>SEF-${uuid}</cbc:AccountingCost>
  ${data.notes ? `  <cbc:Note>${escapeXml(data.notes)}</cbc:Note>` : ''}
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cbc:EndpointID schemeID="RS_PIB">${escapeXml(data.seller.pib)}</cbc:EndpointID>
      <cac:PartyIdentification>
        <cbc:ID schemeID="RS_PIB">${escapeXml(data.seller.pib)}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PostalAddress>
        <cbc:StreetName>${escapeXml(data.seller.address)}</cbc:StreetName>
        <cbc:CityName>${escapeXml(data.seller.city)}</cbc:CityName>
        <cbc:PostalZone>11070</cbc:PostalZone>
        <cac:Country>
          <cbc:IdentificationCode>RS</cbc:IdentificationCode>
        </cac:Country>
      </cac:PostalAddress>
      <cac:PartyTaxScheme>
        <cbc:CompanyID schemeID="RS_PIB">${escapeXml(data.seller.pib)}</cbc:CompanyID>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${escapeXml(data.seller.name)}</cbc:RegistrationName>
        <cbc:CompanyID schemeID="RS_MBR">${escapeXml(data.seller.maticniBr)}</cbc:CompanyID>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cbc:EndpointID schemeID="RS_PIB">${escapeXml(data.buyer.pib)}</cbc:EndpointID>
      <cac:PartyIdentification>
        <cbc:ID schemeID="RS_PIB">${escapeXml(data.buyer.pib)}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PostalAddress>
        <cbc:StreetName>${escapeXml(data.buyer.address)}</cbc:StreetName>
        <cbc:CityName>${escapeXml(data.buyer.city)}</cbc:CityName>
        <cac:Country>
          <cbc:IdentificationCode>RS</cbc:IdentificationCode>
        </cac:Country>
      </cac:PostalAddress>
      <cac:PartyTaxScheme>
        <cbc:CompanyID schemeID="RS_PIB">${escapeXml(data.buyer.pib)}</cbc:CompanyID>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${escapeXml(data.buyer.name)}</cbc:RegistrationName>
        ${data.buyer.maticniBr ? `<cbc:CompanyID schemeID="RS_MBR">${escapeXml(data.buyer.maticniBr)}</cbc:CompanyID>` : ''}
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingCustomerParty>
  <cac:PaymentMeans>
    <cbc:PaymentMeansCode>${paymentMeansCode}</cbc:PaymentMeansCode>
    <cbc:PaymentID>${escapeXml(data.invoiceNumber)}</cbc:PaymentID>
    ${paymentMeansCode === '30' ? `  <cac:PayeeFinancialAccount>
      <cbc:ID schemeID="RS_BANK_ACCOUNT">${escapeXml(data.paymentAccount)}</cbc:ID>
      <cac:FinancialInstitutionBranch>
        <cbc:ID>${escapeXml(data.seller.bank)}</cbc:ID>
      </cac:FinancialInstitutionBranch>
    </cac:PayeeFinancialAccount>` : ''}
  </cac:PaymentMeans>
  <cac:PaymentTerms>
    <cbc:Note>${formatDateSEF(data.dueDate)}</cbc:Note>
  </cac:PaymentTerms>
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="${data.currency}">${formatAmount(data.taxAmount)}</cbc:TaxAmount>
${taxBreakdownXml}
  </cac:TaxTotal>
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="${data.currency}">${formatAmount(data.totalWithoutTax)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="${data.currency}">${formatAmount(data.totalWithoutTax)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="${data.currency}">${formatAmount(data.totalWithTax)}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="${data.currency}">${formatAmount(data.totalWithTax)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
${wrappedLines}
</Invoice>`

  return xml.trim()
}

// ==================== DATABASE TO SEF DATA CONVERTER ====================

interface DBInvoice {
  id: string
  number: string
  date: string | Date
  dueDate: string | Date
  status: string
  type: string
  totalAmount: number
  taxAmount: number
  discountPct: number
  paymentMethod: string
  notes: string | null
  sefUuid: string | null
  partner: {
    name: string
    pib: string
    maticniBr: string | null
    address: string | null
    city: string | null
    zipCode: string | null
    account: string | null
    bank: string | null
  }
  items: {
    productName: string
    quantity: number
    unitPrice: number
    discountPct: number
    taxRate: number
    total: number
  }[]
}

export function convertInvoiceToSEFData(invoice: DBInvoice): SEFInvoiceData {
  const seller = DEFAULT_SELLER

  const buyer: SEFBuyer = {
    name: invoice.partner.name,
    address: invoice.partner.address || '',
    city: invoice.partner.city || '',
    pib: invoice.partner.pib,
    maticniBr: invoice.partner.maticniBr,
  }

  // Calculate line-level amounts
  const lines: SEFInvoiceLine[] = invoice.items.map((item) => {
    const baseAmount = item.quantity * item.unitPrice * (1 - (item.discountPct || 0) / 100)
    const lineTax = baseAmount * ((item.taxRate || 20) / 100)
    const lineTotal = baseAmount + lineTax

    return {
      name: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: lineTotal,
      taxRate: item.taxRate || 20,
      taxAmount: lineTax,
    }
  })

  // Calculate totals
  const totalWithoutTax = lines.reduce((sum, line) => sum + (line.total - line.taxAmount), 0)
  const totalTax = lines.reduce((sum, line) => sum + line.taxAmount, 0)
  const totalWithTax = totalWithoutTax + totalTax

  // Determine invoice type code
  let invoiceTypeCode = '380' // Standard commercial invoice
  if (invoice.type === 'predracun') {
    invoiceTypeCode = '381' // Proforma invoice
  }

  return {
    uuid: invoice.sefUuid || generateUUID(),
    invoiceNumber: invoice.number,
    issueDate: invoice.date instanceof Date ? invoice.date.toISOString() : String(invoice.date),
    dueDate: invoice.dueDate instanceof Date ? invoice.dueDate.toISOString() : String(invoice.dueDate),
    invoiceTypeCode,
    currency: 'RSD',
    seller,
    buyer,
    lines,
    totalWithoutTax,
    taxAmount: totalTax,
    totalWithTax,
    paymentMethod: invoice.paymentMethod,
    paymentAccount: seller.account,
    notes: invoice.notes || undefined,
  }
}

export { generateUUID }
