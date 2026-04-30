// ============ TYPES ============

export interface VATInfo {
  standardRate: number
  reducedRates: { rate: number; description: string }[]
  registrationThreshold: number | null
  exemptions: string[]
  isReverseChargeApplicable: boolean
}

export interface CorporateTaxInfo {
  rate: number
  reducedRates: { threshold: number; rate: number }[] | null
  specialRegimes: string[]
  taxLossCarryForward: number // years
}

export interface IncomeTaxBracket {
  from: number
  to: number | null
  rate: number
}

export interface IncomeTaxInfo {
  type: 'progressive' | 'flat'
  flatRate: number | null
  brackets: IncomeTaxBracket[]
  taxFreeAllowance: number
}

export interface SocialContribution {
  name: string
  employeeRate: number
  employerRate: number
  cap: number | null // max base
}

export interface WithholdingTaxInfo {
  dividends: number
  interest: number
  royalties: number
  notes: string[]
}

export interface InvoiceField {
  field: string
  label: string
  required: boolean
  description?: string
}

export interface EInvoiceInfo {
  system: string
  description: string
  mandatory: boolean
  startDate?: string
  url?: string
}

export interface InvoiceInfo {
  mandatoryFields: InvoiceField[]
  eInvoicing: EInvoiceInfo
  fiscalization: string
  retentionPeriod: string
  format: string
  seriesPrefix: string
}

export interface TaxForm {
  code: string
  name: string
  frequency: string
  description: string
  authority: string
}

export interface PayrollInfo {
  minimumWage: number
  minimumWageCurrency: string
  payPeriod: string
  overtimeMultiplier: number
  standardWorkHours: number
  annualLeaveDays: number
  sickLeaveDays: number
  sickLeavePayPercent: number
  maternityLeaveWeeks: number
  maternityPayPercent: number
  pensionAge: { male: number; female: number }
  noticePeriodDays: number
  probationPeriodDays: number
}

export interface TaxLaw {
  code: string
  name: string
  flag: string
  region: 'europe' | 'americas' | 'asia'
  currency: string
  currencySymbol: string
  language: string
  vat: VATInfo
  corporateTax: CorporateTaxInfo
  incomeTax: IncomeTaxInfo
  socialContributions: SocialContribution[]
  withholdingTax: WithholdingTaxInfo
  invoice: InvoiceInfo
  taxForms: TaxForm[]
  payroll: PayrollInfo
}

// ============ COUNTRY DATA ============

export const COUNTRY_TAX_LAWS: TaxLaw[] = [
  // ===== SERBIA =====
  {
    code: 'RS',
    name: 'Serbia',
    flag: '🇷🇸',
    region: 'europe',
    currency: 'RSD',
    currencySymbol: 'дин.',
    language: 'Serbian',
    vat: {
      standardRate: 20,
      reducedRates: [
        { rate: 10, description: 'Basic food, medicine, books' },
      ],
      registrationThreshold: 8000000,
      exemptions: ['Financial services', 'Insurance', 'Postal services', 'Education', 'Healthcare'],
      isReverseChargeApplicable: true,
    },
    corporateTax: {
      rate: 15,
      reducedRates: null,
      specialRegimes: ['Small business (up to 48M RSD): taxed on revenue 1-3%'],
      taxLossCarryForward: 5,
    },
    incomeTax: {
      type: 'progressive',
      flatRate: null,
      brackets: [
        { from: 0, to: 3648000, rate: 10 },
        { from: 3648000, to: null, rate: 15 },
      ],
      taxFreeAllowance: 0,
    },
    socialContributions: [
      { name: 'Pension & Disability', employeeRate: 14, employerRate: 10.5, cap: null },
      { name: 'Health Insurance', employeeRate: 5.15, employerRate: 5.15, cap: null },
      { name: 'Unemployment', employeeRate: 0.75, employerRate: 0.75, cap: null },
    ],
    withholdingTax: {
      dividends: 15,
      interest: 20,
      royalties: 20,
      notes: ['Reduced rates under double tax treaties'],
    },
    invoice: {
      mandatoryFields: [
        { field: 'invoiceNumber', label: 'Invoice Number', required: true, description: 'Unique sequential number' },
        { field: 'invoiceDate', label: 'Invoice Date', required: true },
        { field: 'dueDate', label: 'Due Date', required: true },
        { field: 'sellerName', label: 'Seller Name & Address', required: true },
        { field: 'sellerPIB', label: 'Seller PIB (Tax ID)', required: true },
        { field: 'sellerMB', label: 'Seller Registration Number', required: true },
        { field: 'sellerAccount', label: 'Seller Bank Account', required: true },
        { field: 'buyerName', label: 'Buyer Name & Address', required: true },
        { field: 'buyerPIB', label: 'Buyer PIB (Tax ID)', required: true },
        { field: 'items', label: 'Line Items (name, qty, price, VAT rate)', required: true },
        { field: 'totalAmount', label: 'Total Amount', required: true },
        { field: 'vatAmount', label: 'VAT Amount', required: true },
        { field: 'paymentMethod', label: 'Payment Method', required: true },
      ],
      eInvoicing: { system: 'SEF (Stari eFakture)', description: 'SEF platform for B2B/B2G electronic invoicing', mandatory: true, startDate: '2022', url: 'https://sef.purs.gov.rs' },
      fiscalization: 'Fiscalization required for retail POS',
      retentionPeriod: '10 years',
      format: 'PDF / XML (SEF)',
      seriesPrefix: 'Fak',
    },
    taxForms: [
      { code: 'PP-PO', name: 'Corporate Income Tax Return', frequency: 'Monthly', description: 'Monthly advance tax payment', authority: 'Tax Administration' },
      { code: 'PP-DOP', name: 'Personal Income Tax Return', frequency: 'Monthly', description: 'Personal income tax and contributions', authority: 'Tax Administration' },
      { code: 'PP-OPP', name: 'VAT Return', frequency: 'Monthly', description: 'Monthly VAT calculation', authority: 'Tax Administration' },
      { code: 'PP-ODP', name: 'Advance CIT Payment', frequency: 'Quarterly', description: 'Quarterly advance CIT payment', authority: 'Tax Administration' },
      { code: 'PP-PD', name: 'Annual CIT Return', frequency: 'Annually', description: 'Annual corporate income tax return', authority: 'Tax Administration' },
    ],
    payroll: {
      minimumWage: 504.42,
      minimumWageCurrency: 'EUR',
      payPeriod: 'Monthly',
      overtimeMultiplier: 1.26,
      standardWorkHours: 40,
      annualLeaveDays: 20,
      sickLeaveDays: 30,
      sickLeavePayPercent: 65,
      maternityLeaveWeeks: 52,
      maternityPayPercent: 100,
      pensionAge: { male: 65, female: 63 },
      noticePeriodDays: 15,
      probationPeriodDays: 90,
    },
  },

  // ===== GERMANY =====
  {
    code: 'DE',
    name: 'Germany',
    flag: '🇩🇪',
    region: 'europe',
    currency: 'EUR',
    currencySymbol: '€',
    language: 'German',
    vat: {
      standardRate: 19,
      reducedRates: [
        { rate: 7, description: 'Food, books, newspapers, cultural events' },
      ],
      registrationThreshold: 22500,
      exemptions: ['Exports', 'Financial services', 'Healthcare', 'Education'],
      isReverseChargeApplicable: true,
    },
    corporateTax: {
      rate: 15,
      reducedRates: null,
      specialRegimes: ['Trade tax (Gewerbesteuer) ~14-17% additional'],
      taxLossCarryForward: 1,
    },
    incomeTax: {
      type: 'progressive',
      flatRate: null,
      brackets: [
        { from: 0, to: 11604, rate: 0 },
        { from: 11605, to: 66760, rate: 14 },
        { from: 66761, to: 277826, rate: 42 },
        { from: 277826, to: null, rate: 45 },
      ],
      taxFreeAllowance: 11604,
    },
    socialContributions: [
      { name: 'Pension Insurance', employeeRate: 9.3, employerRate: 9.3, cap: 90600 },
      { name: 'Health Insurance', employeeRate: 7.3, employerRate: 7.3, cap: 62525 },
      { name: 'Unemployment', employeeRate: 1.3, employerRate: 1.3, cap: 90600 },
      { name: 'Long-term Care', employeeRate: 1.7, employerRate: 1.7, cap: 62525 },
    ],
    withholdingTax: {
      dividends: 26.375,
      interest: 25,
      royalties: 15,
      notes: ['Abgeltungsteuer + solidarity surcharge on dividends'],
    },
    invoice: {
      mandatoryFields: [
        { field: 'invoiceNumber', label: 'Invoice Number', required: true },
        { field: 'invoiceDate', label: 'Invoice Date', required: true },
        { field: 'dueDate', label: 'Due Date', required: true },
        { field: 'sellerName', label: 'Seller Name & Address', required: true },
        { field: 'sellerVAT', label: 'Seller VAT ID', required: true },
        { field: 'buyerName', label: 'Buyer Name & Address', required: true },
        { field: 'buyerVAT', label: 'Buyer VAT ID', required: false },
        { field: 'items', label: 'Line Items', required: true },
        { field: 'taxBreakdown', label: 'Tax Breakdown per Rate', required: true },
        { field: 'totalAmount', label: 'Total Amount', required: true },
      ],
      eInvoicing: { system: 'EN 16931 / ZUGFeRD', description: 'EN 16931 European standard, ZUGFeRD for PDF invoices', mandatory: false, startDate: '2027 (planned)', url: '' },
      fiscalization: 'Not applicable',
      retentionPeriod: '10 years',
      format: 'PDF/A (ZUGFeRD) / XRechnung (XML)',
      seriesPrefix: 'RE',
    },
    taxForms: [
      { code: 'UStVA', name: 'VAT Return', frequency: 'Monthly/Quarterly', description: 'Umsatzsteuer-Voranmeldung', authority: 'Finanzamt' },
      { code: 'KSt-Erklärung', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Körperschaftsteuererklärung', authority: 'Finanzamt' },
      { code: 'Lohnsteuer', name: 'Payroll Tax', frequency: 'Monthly', description: 'Lohnsteuer-Anmeldung', authority: 'Finanzamt' },
      { code: 'Gewerbesteuer', name: 'Trade Tax Return', frequency: 'Annually', description: 'Gewerbesteuererklärung', authority: 'Finanzamt' },
    ],
    payroll: {
      minimumWage: 12.41,
      minimumWageCurrency: 'EUR',
      payPeriod: 'Monthly',
      overtimeMultiplier: 1.25,
      standardWorkHours: 40,
      annualLeaveDays: 25,
      sickLeaveDays: 42,
      sickLeavePayPercent: 100,
      maternityLeaveWeeks: 52,
      maternityPayPercent: 67,
      pensionAge: { male: 65, female: 65 },
      noticePeriodDays: 28,
      probationPeriodDays: 180,
    },
  },

  // ===== ITALY =====
  {
    code: 'IT',
    name: 'Italy',
    flag: '🇮🇹',
    region: 'europe',
    currency: 'EUR',
    currencySymbol: '€',
    language: 'Italian',
    vat: {
      standardRate: 22,
      reducedRates: [
        { rate: 10, description: 'Electricity, some food services' },
        { rate: 5, description: 'Some food, books' },
        { rate: 4, description: 'Basic necessities' },
      ],
      registrationThreshold: 65000,
      exemptions: ['Exports', 'Healthcare', 'Education', 'Financial services'],
      isReverseChargeApplicable: true,
    },
    corporateTax: {
      rate: 24,
      reducedRates: null,
      specialRegimes: ['Flat tax regime for new businesses (15%)'],
      taxLossCarryForward: 5,
    },
    incomeTax: {
      type: 'progressive',
      flatRate: null,
      brackets: [
        { from: 0, to: 28000, rate: 23 },
        { from: 28000, to: 50000, rate: 35 },
        { from: 50000, to: null, rate: 43 },
      ],
      taxFreeAllowance: 0,
    },
    socialContributions: [
      { name: 'INPS (Social Security)', employeeRate: 9.19, employerRate: 23.81, cap: null },
      { name: 'INAIL (Work Insurance)', employeeRate: 0, employerRate: 0.84, cap: null },
    ],
    withholdingTax: {
      dividends: 26,
      interest: 26,
      royalties: 30,
      notes: ['Reduced rates under EU directives and treaties'],
    },
    invoice: {
      mandatoryFields: [
        { field: 'invoiceNumber', label: 'Invoice Number', required: true },
        { field: 'invoiceDate', label: 'Invoice Date', required: true },
        { field: 'sellerName', label: 'Seller Details', required: true },
        { field: 'sellerVAT', label: 'Seller VAT ID', required: true },
        { field: 'buyerName', label: 'Buyer Details', required: true },
        { field: 'items', label: 'Line Items', required: true },
        { field: 'totalAmount', label: 'Total Amount', required: true },
        { field: 'taxBreakdown', label: 'Tax Breakdown', required: true },
      ],
      eInvoicing: { system: 'SDI (Sistema di Interscambio)', description: 'B2B e-invoicing through SDI exchange system', mandatory: true, startDate: '2019', url: 'https://www.fatturapa.gov.it' },
      fiscalization: 'Not applicable (e-invoicing is mandatory)',
      retentionPeriod: '10 years',
      format: 'XML (FatturaPA)',
      seriesPrefix: 'FT',
    },
    taxForms: [
      { code: 'F24', name: 'Tax Payment Form', frequency: 'Monthly/Quarterly', description: 'Unified tax payment', authority: 'Agenzia delle Entrate' },
      { code: 'Dichiarazione IVA', name: 'VAT Return', frequency: 'Annually', description: 'Annual VAT declaration', authority: 'Agenzia delle Entrate' },
      { code: 'Modello REDDITI', name: 'Income Tax Return', frequency: 'Annually', description: 'Income tax declaration', authority: 'Agenzia delle Entrate' },
    ],
    payroll: {
      minimumWage: null,
      minimumWageCurrency: 'EUR',
      payPeriod: 'Monthly',
      overtimeMultiplier: 1.1,
      standardWorkHours: 40,
      annualLeaveDays: 20,
      sickLeaveDays: 180,
      sickLeavePayPercent: 50,
      maternityLeaveWeeks: 22,
      maternityPayPercent: 80,
      pensionAge: { male: 67, female: 67 },
      noticePeriodDays: 30,
      probationPeriodDays: 180,
    },
  },

  // ===== FRANCE =====
  {
    code: 'FR',
    name: 'France',
    flag: '🇫🇷',
    region: 'europe',
    currency: 'EUR',
    currencySymbol: '€',
    language: 'French',
    vat: {
      standardRate: 20,
      reducedRates: [
        { rate: 10, description: 'Restaurant, transport, some renovation' },
        { rate: 5.5, description: 'Food, books, energy' },
        { rate: 2.1, description: 'Press, medicines' },
      ],
      registrationThreshold: 94800,
      exemptions: ['Exports', 'Banking', 'Insurance', 'Healthcare'],
      isReverseChargeApplicable: true,
    },
    corporateTax: {
      rate: 25,
      reducedRates: [
        { threshold: 42500, rate: 15 },
      ],
      specialRegimes: ['Micro-enterprise regime available'],
      taxLossCarryForward: 5,
    },
    incomeTax: {
      type: 'progressive',
      flatRate: null,
      brackets: [
        { from: 0, to: 11294, rate: 0 },
        { from: 11295, to: 28797, rate: 11 },
        { from: 28798, to: 82341, rate: 30 },
        { from: 82342, to: 177106, rate: 41 },
        { from: 177106, to: null, rate: 45 },
      ],
      taxFreeAllowance: 11294,
    },
    socialContributions: [
      { name: 'Health (Assurance Maladie)', employeeRate: 0, employerRate: 7, cap: null },
      { name: 'Pension', employeeRate: 6.9, employerRate: 8.55, cap: 46368 },
      { name: 'Unemployment', employeeRate: 0, employerRate: 4.05, cap: 13812 },
      { name: 'CSG/CRDS', employeeRate: 9.7, employerRate: 0, cap: null },
    ],
    withholdingTax: {
      dividends: 30,
      interest: 30,
      royalties: 25,
      notes: ['Flat tax (Prélèvement Forfaitaire Unique) 30% for most'],
    },
    invoice: {
      mandatoryFields: [
        { field: 'invoiceNumber', label: 'Invoice Number', required: true },
        { field: 'invoiceDate', label: 'Invoice Date', required: true },
        { field: 'sellerName', label: 'Seller Details', required: true },
        { field: 'sellerSIRET', label: 'SIRET Number', required: true },
        { field: 'sellerVAT', label: 'VAT ID', required: true },
        { field: 'buyerName', label: 'Buyer Details', required: true },
        { field: 'items', label: 'Line Items', required: true },
        { field: 'taxBreakdown', label: 'Tax Breakdown', required: true },
        { field: 'totalAmount', label: 'Total Amount', required: true },
      ],
      eInvoicing: { system: 'Chorus Pro / Portail de facturation', description: 'B2G mandatory since 2020, B2B from 2026', mandatory: false, startDate: '2026 (B2B planned)', url: '' },
      fiscalization: 'Not applicable',
      retentionPeriod: '10 years',
      format: 'PDF / Factur-X (XML embedded PDF)',
      seriesPrefix: 'FAC',
    },
    taxForms: [
      { code: 'CA3', name: 'VAT Return (Monthly)', frequency: 'Monthly', description: 'Monthly VAT return', authority: 'DGFiP' },
      { code: 'Liasse Fiscale', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Annual corporate income tax', authority: 'DGFiP' },
      { code: 'DSN', name: 'Payroll Declaration', frequency: 'Monthly', description: 'Déclaration Sociale Nominative', authority: 'URSSAF' },
    ],
    payroll: {
      minimumWage: 11.88,
      minimumWageCurrency: 'EUR',
      payPeriod: 'Monthly',
      overtimeMultiplier: 1.25,
      standardWorkHours: 35,
      annualLeaveDays: 25,
      sickLeaveDays: 365,
      sickLeavePayPercent: 50,
      maternityLeaveWeeks: 16,
      maternityPayPercent: 100,
      pensionAge: { male: 62, female: 62 },
      noticePeriodDays: 30,
      probationPeriodDays: 90,
    },
  },

  // ===== CROATIA =====
  {
    code: 'HR',
    name: 'Croatia',
    flag: '🇭🇷',
    region: 'europe',
    currency: 'EUR',
    currencySymbol: '€',
    language: 'Croatian',
    vat: {
      standardRate: 25,
      reducedRates: [
        { rate: 13, description: 'Food, books, newspapers, water supply' },
        { rate: 5, description: 'Basic necessities' },
      ],
      registrationThreshold: 300000,
      exemptions: ['Financial services', 'Insurance', 'Healthcare'],
      isReverseChargeApplicable: true,
    },
    corporateTax: {
      rate: 18,
      reducedRates: null,
      specialRegimes: ['Reduced 10% for companies with revenue < 3M EUR'],
      taxLossCarryForward: 5,
    },
    incomeTax: {
      type: 'progressive',
      flatRate: null,
      brackets: [
        { from: 0, to: 4400, rate: 0 },
        { from: 4400, to: 30000, rate: 20 },
        { from: 30000, to: null, rate: 30 },
      ],
      taxFreeAllowance: 5600,
    },
    socialContributions: [
      { name: 'Pension 1st pillar', employeeRate: 15, employerRate: 15, cap: null },
      { name: 'Pension 2nd pillar', employeeRate: 5, employerRate: 0, cap: null },
      { name: 'Health Insurance', employeeRate: 5, employerRate: 0, cap: null },
      { name: 'Employer Health', employeeRate: 0, employerRate: 5, cap: null },
      { name: 'Unemployment', employeeRate: 0.85, employerRate: 0.85, cap: null },
    ],
    withholdingTax: {
      dividends: 12,
      interest: 12,
      royalties: 20,
      notes: ['Reduced rates under double tax treaties'],
    },
    invoice: {
      mandatoryFields: [
        { field: 'invoiceNumber', label: 'Invoice Number', required: true },
        { field: 'invoiceDate', label: 'Invoice Date', required: true },
        { field: 'sellerName', label: 'Seller Details', required: true },
        { field: 'sellerOIB', label: 'Seller OIB', required: true },
        { field: 'buyerName', label: 'Buyer Details', required: true },
        { field: 'items', label: 'Line Items', required: true },
        { field: 'totalAmount', label: 'Total Amount', required: true },
      ],
      eInvoicing: { system: 'Fiskalizacija + Fina', description: 'Fiscalization required for retail, e-invoicing developing', mandatory: false, startDate: '', url: '' },
      fiscalization: 'Fiscalization (Fiskalizacija) required for retail',
      retentionPeriod: '10 years',
      format: 'PDF / XML',
      seriesPrefix: 'Fak',
    },
    taxForms: [
      { code: 'PDV-P', name: 'VAT Return', frequency: 'Monthly', description: 'Monthly VAT return', authority: 'PU Tax Administration' },
      { code: 'PP-OPO', name: 'Income Tax Return', frequency: 'Monthly', description: 'Monthly income tax and contributions', authority: 'PU Tax Administration' },
      { code: 'TP', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Annual corporate income tax', authority: 'PU Tax Administration' },
    ],
    payroll: {
      minimumWage: 840,
      minimumWageCurrency: 'EUR',
      payPeriod: 'Monthly',
      overtimeMultiplier: 1.5,
      standardWorkHours: 40,
      annualLeaveDays: 20,
      sickLeaveDays: 42,
      sickLeavePayPercent: 67,
      maternityLeaveWeeks: 28,
      maternityPayPercent: 100,
      pensionAge: { male: 65, female: 63 },
      noticePeriodDays: 30,
      probationPeriodDays: 90,
    },
  },

  // ===== BOSNIA AND HERZEGOVINA =====
  {
    code: 'BA',
    name: 'Bosnia & Herzegovina',
    flag: '🇧🇦',
    region: 'europe',
    currency: 'BAM',
    currencySymbol: 'КМ',
    language: 'Bosnian/Croatian/Serbian',
    vat: {
      standardRate: 17,
      reducedRates: [],
      registrationThreshold: 50000,
      exemptions: ['Financial services', 'Healthcare', 'Education'],
      isReverseChargeApplicable: true,
    },
    corporateTax: {
      rate: 10,
      reducedRates: null,
      specialRegimes: ['Varies by entity (RS, FBiH, BD)'],
      taxLossCarryForward: 5,
    },
    incomeTax: {
      type: 'progressive',
      flatRate: null,
      brackets: [
        { from: 0, to: 36000, rate: 0 },
        { from: 36000, to: 108000, rate: 10 },
        { from: 108000, to: null, rate: 15 },
      ],
      taxFreeAllowance: 36000,
    },
    socialContributions: [
      { name: 'Pension & Disability', employeeRate: 9, employerRate: 5.5, cap: null },
      { name: 'Health Insurance', employeeRate: 5, employerRate: 4, cap: null },
      { name: 'Unemployment', employeeRate: 1, employerRate: 1, cap: null },
    ],
    withholdingTax: {
      dividends: 10,
      interest: 10,
      royalties: 10,
      notes: ['Varies by entity'],
    },
    invoice: {
      mandatoryFields: [
        { field: 'invoiceNumber', label: 'Invoice Number', required: true },
        { field: 'invoiceDate', label: 'Invoice Date', required: true },
        { field: 'sellerName', label: 'Seller Details', required: true },
        { field: 'sellerJIB', label: 'Seller JIB', required: true },
        { field: 'buyerName', label: 'Buyer Details', required: true },
        { field: 'items', label: 'Line Items', required: true },
        { field: 'totalAmount', label: 'Total Amount', required: true },
      ],
      eInvoicing: { system: 'None', description: 'E-invoicing not yet implemented', mandatory: false, url: '' },
      fiscalization: 'Not mandatory (varies by entity)',
      retentionPeriod: '10 years',
      format: 'PDF',
      seriesPrefix: 'Fak',
    },
    taxForms: [
      { code: 'PDV', name: 'VAT Return', frequency: 'Monthly', description: 'Monthly VAT return', authority: 'Tax Administration' },
      { code: 'PPD', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Annual corporate income tax', authority: 'Tax Administration' },
    ],
    payroll: {
      minimumWage: 565,
      minimumWageCurrency: 'BAM',
      payPeriod: 'Monthly',
      overtimeMultiplier: 1.5,
      standardWorkHours: 40,
      annualLeaveDays: 20,
      sickLeaveDays: 42,
      sickLeavePayPercent: 70,
      maternityLeaveWeeks: 52,
      maternityPayPercent: 100,
      pensionAge: { male: 65, female: 62 },
      noticePeriodDays: 30,
      probationPeriodDays: 90,
    },
  },

  // ===== NORTH MACEDONIA =====
  {
    code: 'MK',
    name: 'North Macedonia',
    flag: '🇲🇰',
    region: 'europe',
    currency: 'MKD',
    currencySymbol: 'ден.',
    language: 'Macedonian',
    vat: {
      standardRate: 18,
      reducedRates: [],
      registrationThreshold: 2000000,
      exemptions: ['Exports', 'Financial services', 'Healthcare'],
      isReverseChargeApplicable: true,
    },
    corporateTax: {
      rate: 10,
      reducedRates: null,
      specialRegimes: ['Flat rate for all companies'],
      taxLossCarryForward: 3,
    },
    incomeTax: {
      type: 'progressive',
      flatRate: null,
      brackets: [
        { from: 0, to: 81000, rate: 0 },
        { from: 81000, to: 130000, rate: 10 },
        { from: 130000, to: null, rate: 18 },
      ],
      taxFreeAllowance: 81000,
    },
    socialContributions: [
      { name: 'Pension & Disability', employeeRate: 7.7, employerRate: 7.7, cap: null },
      { name: 'Health Insurance', employeeRate: 3.2, employerRate: 3.2, cap: null },
      { name: 'Unemployment', employeeRate: 0.6, employerRate: 0.6, cap: null },
    ],
    withholdingTax: {
      dividends: 10,
      interest: 10,
      royalties: 15,
      notes: ['Attractive flat CIT rate'],
    },
    invoice: {
      mandatoryFields: [
        { field: 'invoiceNumber', label: 'Invoice Number', required: true },
        { field: 'invoiceDate', label: 'Invoice Date', required: true },
        { field: 'sellerName', label: 'Seller Details', required: true },
        { field: 'sellerEMBG', label: 'Seller EMBG/ЕМБГ', required: true },
        { field: 'buyerName', label: 'Buyer Details', required: true },
        { field: 'items', label: 'Line Items', required: true },
        { field: 'totalAmount', label: 'Total Amount', required: true },
      ],
      eInvoicing: { system: 'SEF MK', description: 'Electronic invoicing system being developed', mandatory: false, url: '' },
      fiscalization: 'Fiscalization required for retail',
      retentionPeriod: '10 years',
      format: 'PDF / XML',
      seriesPrefix: 'Fak',
    },
    taxForms: [
      { code: 'PP-DVV', name: 'VAT Return', frequency: 'Monthly', description: 'Monthly VAT return', authority: 'Revenue Office' },
      { code: 'PP-DPP', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Annual corporate tax return', authority: 'Revenue Office' },
    ],
    payroll: {
      minimumWage: 370,
      minimumWageCurrency: 'EUR',
      payPeriod: 'Monthly',
      overtimeMultiplier: 1.5,
      standardWorkHours: 40,
      annualLeaveDays: 20,
      sickLeaveDays: 30,
      sickLeavePayPercent: 70,
      maternityLeaveWeeks: 9,
      maternityPayPercent: 100,
      pensionAge: { male: 64, female: 62 },
      noticePeriodDays: 30,
      probationPeriodDays: 90,
    },
  },

  // ===== MONTENEGRO =====
  {
    code: 'ME',
    name: 'Montenegro',
    flag: '🇲🇪',
    region: 'europe',
    currency: 'EUR',
    currencySymbol: '€',
    language: 'Montenegrin',
    vat: {
      standardRate: 21,
      reducedRates: [
        { rate: 7, description: 'Basic foodstuffs, medicine, books' },
      ],
      registrationThreshold: 30000,
      exemptions: ['Financial services', 'Insurance', 'Healthcare'],
      isReverseChargeApplicable: true,
    },
    corporateTax: {
      rate: 15,
      reducedRates: null,
      specialRegimes: ['Reduced 9% for small taxpayers'],
      taxLossCarryForward: 3,
    },
    incomeTax: {
      type: 'progressive',
      flatRate: null,
      brackets: [
        { from: 0, to: 1000, rate: 9 },
        { from: 1000, to: null, rate: 15 },
      ],
      taxFreeAllowance: 0,
    },
    socialContributions: [
      { name: 'Pension & Disability', employeeRate: 15, employerRate: 5.5, cap: null },
      { name: 'Health Insurance', employeeRate: 9, employerRate: 3.8, cap: null },
      { name: 'Unemployment', employeeRate: 0.5, employerRate: 0.5, cap: null },
    ],
    withholdingTax: {
      dividends: 15,
      interest: 15,
      royalties: 15,
      notes: ['Reduced under treaties'],
    },
    invoice: {
      mandatoryFields: [
        { field: 'invoiceNumber', label: 'Invoice Number', required: true },
        { field: 'invoiceDate', label: 'Invoice Date', required: true },
        { field: 'sellerName', label: 'Seller Details', required: true },
        { field: 'sellerPIB', label: 'Seller PIB', required: true },
        { field: 'buyerName', label: 'Buyer Details', required: true },
        { field: 'items', label: 'Line Items', required: true },
        { field: 'totalAmount', label: 'Total Amount', required: true },
      ],
      eInvoicing: { system: 'None', description: 'E-invoicing not yet implemented', mandatory: false, url: '' },
      fiscalization: 'Fiscalization required for retail (cash register)',
      retentionPeriod: '10 years',
      format: 'PDF',
      seriesPrefix: 'Fak',
    },
    taxForms: [
      { code: 'PP-DOP', name: 'VAT Return', frequency: 'Monthly', description: 'Monthly VAT return', authority: 'Tax Administration' },
      { code: 'PP-PPD', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Annual corporate tax', authority: 'Tax Administration' },
    ],
    payroll: {
      minimumWage: 450,
      minimumWageCurrency: 'EUR',
      payPeriod: 'Monthly',
      overtimeMultiplier: 1.5,
      standardWorkHours: 40,
      annualLeaveDays: 20,
      sickLeaveDays: 42,
      sickLeavePayPercent: 70,
      maternityLeaveWeeks: 52,
      maternityPayPercent: 100,
      pensionAge: { male: 65, female: 60 },
      noticePeriodDays: 30,
      probationPeriodDays: 90,
    },
  },

  // ===== SLOVENIA =====
  {
    code: 'SI',
    name: 'Slovenia',
    flag: '🇸🇮',
    region: 'europe',
    currency: 'EUR',
    currencySymbol: '€',
    language: 'Slovenian',
    vat: {
      standardRate: 22,
      reducedRates: [
        { rate: 9.5, description: 'Food, books, medicine' },
        { rate: 5, description: 'Basic necessities' },
      ],
      registrationThreshold: 50000,
      exemptions: ['Exports', 'Financial services', 'Healthcare'],
      isReverseChargeApplicable: true,
    },
    corporateTax: {
      rate: 19,
      reducedRates: null,
      specialRegimes: ['Reduced 7% for companies with revenue < 1M EUR'],
      taxLossCarryForward: 7,
    },
    incomeTax: {
      type: 'progressive',
      flatRate: null,
      brackets: [
        { from: 0, to: 8500, rate: 16 },
        { from: 8500, to: 25000, rate: 26 },
        { from: 25000, to: 50000, rate: 33 },
        { from: 50000, to: null, rate: 39 },
      ],
      taxFreeAllowance: 3500,
    },
    socialContributions: [
      { name: 'Pension', employeeRate: 15.5, employerRate: 8.85, cap: null },
      { name: 'Health Insurance', employeeRate: 6.36, employerRate: 6.56, cap: null },
      { name: 'Unemployment', employeeRate: 0.14, employerRate: 0.14, cap: null },
      { name: 'Parental Care', employeeRate: 0.14, employerRate: 0.15, cap: null },
    ],
    withholdingTax: {
      dividends: 25,
      interest: 25,
      royalties: 25,
      notes: ['Reduced under EU treaties'],
    },
    invoice: {
      mandatoryFields: [
        { field: 'invoiceNumber', label: 'Invoice Number', required: true },
        { field: 'invoiceDate', label: 'Invoice Date', required: true },
        { field: 'sellerName', label: 'Seller Details', required: true },
        { field: 'sellerVAT', label: 'Seller VAT ID', required: true },
        { field: 'buyerName', label: 'Buyer Details', required: true },
        { field: 'items', label: 'Line Items', required: true },
        { field: 'totalAmount', label: 'Total Amount', required: true },
      ],
      eInvoicing: { system: 'eDavki / FURS', description: 'Electronic tax filing system', mandatory: false, url: 'https://edavki.durs.gov.si' },
      fiscalization: 'Not applicable',
      retentionPeriod: '10 years',
      format: 'PDF / UBL XML',
      seriesPrefix: 'Fak',
    },
    taxForms: [
      { code: 'DDV-P', name: 'VAT Return', frequency: 'Monthly', description: 'Monthly VAT return', authority: 'FURS' },
      { code: 'Doh-P', name: 'Income Tax Return', frequency: 'Annually', description: 'Annual income tax return', authority: 'FURS' },
      { code: 'DOb-P', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Corporate income tax', authority: 'FURS' },
    ],
    payroll: {
      minimumWage: 1253.90,
      minimumWageCurrency: 'EUR',
      payPeriod: 'Monthly',
      overtimeMultiplier: 1.5,
      standardWorkHours: 40,
      annualLeaveDays: 20,
      sickLeaveDays: 260,
      sickLeavePayPercent: 80,
      maternityLeaveWeeks: 15,
      maternityPayPercent: 100,
      pensionAge: { male: 65, female: 63 },
      noticePeriodDays: 30,
      probationPeriodDays: 90,
    },
  },

  // ===== AUSTRIA =====
  {
    code: 'AT',
    name: 'Austria',
    flag: '🇦🇹',
    region: 'europe',
    currency: 'EUR',
    currencySymbol: '€',
    language: 'German',
    vat: {
      standardRate: 20,
      reducedRates: [
        { rate: 10, description: 'Food, books, domestic transport' },
        { rate: 13, description: 'Some agriculture, wine' },
      ],
      registrationThreshold: 35000,
      exemptions: ['Exports', 'Healthcare', 'Education', 'Financial services'],
      isReverseChargeApplicable: true,
    },
    corporateTax: {
      rate: 23,
      reducedRates: null,
      specialRegimes: [],
      taxLossCarryForward: 7,
    },
    incomeTax: {
      type: 'progressive',
      flatRate: null,
      brackets: [
        { from: 0, to: 12316, rate: 0 },
        { from: 12316, to: 20440, rate: 20 },
        { from: 20440, to: 60000, rate: 30 },
        { from: 60000, to: 93000, rate: 40 },
        { from: 93000, to: 1000000, rate: 50 },
        { from: 1000000, to: null, rate: 55 },
      ],
      taxFreeAllowance: 12316,
    },
    socialContributions: [
      { name: 'Health Insurance', employeeRate: 3.95, employerRate: 3.75, cap: 7590 },
      { name: 'Pension', employeeRate: 10.25, employerRate: 12.55, cap: 7590 },
      { name: 'Unemployment', employeeRate: 3, employerRate: 3, cap: 7590 },
    ],
    withholdingTax: {
      dividends: 27.5,
      interest: 25,
      royalties: 20,
      notes: ['KESt (Kapitalertragsteuer) applies'],
    },
    invoice: {
      mandatoryFields: [
        { field: 'invoiceNumber', label: 'Invoice Number', required: true },
        { field: 'invoiceDate', label: 'Invoice Date', required: true },
        { field: 'sellerName', label: 'Seller Details', required: true },
        { field: 'sellerVAT', label: 'Seller UID', required: true },
        { field: 'buyerName', label: 'Buyer Details', required: true },
        { field: 'items', label: 'Line Items', required: true },
        { field: 'totalAmount', label: 'Total Amount', required: true },
      ],
      eInvoicing: { system: 'ERSTE / UBL', description: 'E-invoicing developing', mandatory: false, url: '' },
      fiscalization: 'Not applicable',
      retentionPeriod: '7 years',
      format: 'PDF / UBL XML',
      seriesPrefix: 'RE',
    },
    taxForms: [
      { code: 'U30', name: 'VAT Return', frequency: 'Monthly', description: 'Umsatzsteuervoranmeldung', authority: 'Finanzamt' },
      { code: 'K1', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Körperschaftsteuererklärung', authority: 'Finanzamt' },
      { code: 'L16', name: 'Payroll Tax', frequency: 'Monthly', description: 'Lohnsteuer', authority: 'Finanzamt' },
    ],
    payroll: {
      minimumWage: 1500,
      minimumWageCurrency: 'EUR',
      payPeriod: 'Monthly',
      overtimeMultiplier: 1.5,
      standardWorkHours: 40,
      annualLeaveDays: 25,
      sickLeaveDays: 52,
      sickLeavePayPercent: 100,
      maternityLeaveWeeks: 16,
      maternityPayPercent: 80,
      pensionAge: { male: 65, female: 60 },
      noticePeriodDays: 30,
      probationPeriodDays: 90,
    },
  },

  // ===== GREECE =====
  {
    code: 'GR',
    name: 'Greece',
    flag: '🇬🇷',
    region: 'europe',
    currency: 'EUR',
    currencySymbol: '€',
    language: 'Greek',
    vat: {
      standardRate: 24,
      reducedRates: [
        { rate: 13, description: 'Food, restaurants, energy' },
        { rate: 6, description: 'Books, medicine, newspapers' },
      ],
      registrationThreshold: 10000,
      exemptions: ['Exports', 'Financial services', 'Healthcare'],
      isReverseChargeApplicable: true,
    },
    corporateTax: {
      rate: 22,
      reducedRates: null,
      specialRegimes: [],
      taxLossCarryForward: 5,
    },
    incomeTax: {
      type: 'progressive',
      flatRate: null,
      brackets: [
        { from: 0, to: 10000, rate: 9 },
        { from: 10000, to: 20000, rate: 22 },
        { from: 20000, to: 30000, rate: 28 },
        { from: 30000, to: 40000, rate: 36 },
        { from: 40000, to: null, rate: 44 },
      ],
      taxFreeAllowance: 0,
    },
    socialContributions: [
      { name: 'Social Insurance (EFKA)', employeeRate: 6.67, employerRate: 14.62, cap: null },
      { name: 'Health Fund (EFKA)', employeeRate: 2.84, employerRate: 3.96, cap: null },
      { name: 'Unemployment', employeeRate: 1, employerRate: 4, cap: null },
    ],
    withholdingTax: {
      dividends: 15,
      interest: 15,
      royalties: 20,
      notes: ['Reduced rates under treaties'],
    },
    invoice: {
      mandatoryFields: [
        { field: 'invoiceNumber', label: 'Invoice Number', required: true },
        { field: 'invoiceDate', label: 'Invoice Date', required: true },
        { field: 'sellerName', label: 'Seller Details', required: true },
        { field: 'sellerVAT', label: 'Seller VAT / AFM', required: true },
        { field: 'buyerName', label: 'Buyer Details', required: true },
        { field: 'items', label: 'Line Items', required: true },
        { field: 'totalAmount', label: 'Total Amount', required: true },
      ],
      eInvoicing: { system: 'myDATA (ΑΑΔΕ)', description: 'Mandatory e-invoicing platform', mandatory: true, startDate: '2024', url: 'https://mydata.aade.gr' },
      fiscalization: 'Not applicable',
      retentionPeriod: '10 years',
      format: 'XML (myDATA)',
      seriesPrefix: 'Fak',
    },
    taxForms: [
      { code: 'VAT Return', name: 'VAT Return', frequency: 'Monthly', description: 'Periodic VAT declaration', authority: 'AADE' },
      { code: 'N', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Annual corporate income tax', authority: 'AADE' },
    ],
    payroll: {
      minimumWage: 880,
      minimumWageCurrency: 'EUR',
      payPeriod: 'Monthly',
      overtimeMultiplier: 1.25,
      standardWorkHours: 40,
      annualLeaveDays: 20,
      sickLeaveDays: 365,
      sickLeavePayPercent: 50,
      maternityLeaveWeeks: 17,
      maternityPayPercent: 67,
      pensionAge: { male: 67, female: 62 },
      noticePeriodDays: 30,
      probationPeriodDays: 90,
    },
  },

  // ===== SPAIN =====
  {
    code: 'ES',
    name: 'Spain',
    flag: '🇪🇸',
    region: 'europe',
    currency: 'EUR',
    currencySymbol: '€',
    language: 'Spanish',
    vat: {
      standardRate: 21,
      reducedRates: [
        { rate: 10, description: 'Food, transport, hospitality' },
        { rate: 4, description: 'Basic necessities, medicine, books' },
      ],
      registrationThreshold: null,
      exemptions: ['Exports', 'Healthcare', 'Education'],
      isReverseChargeApplicable: true,
    },
    corporateTax: {
      rate: 25,
      reducedRates: [
        { threshold: 1000000, rate: 23 },
      ],
      specialRegimes: ['New companies 15% for first 2 years'],
      taxLossCarryForward: 15,
    },
    incomeTax: {
      type: 'progressive',
      flatRate: null,
      brackets: [
        { from: 0, to: 12450, rate: 19 },
        { from: 12450, to: 20200, rate: 24 },
        { from: 20200, to: 35200, rate: 30 },
        { from: 35200, to: 60000, rate: 37 },
        { from: 60000, to: 300000, rate: 45 },
        { from: 300000, to: null, rate: 47 },
      ],
      taxFreeAllowance: 0,
    },
    socialContributions: [
      { name: 'Social Security', employeeRate: 6.35, employerRate: 23.6, cap: 49800 },
      { name: 'Unemployment', employeeRate: 1.55, employerRate: 5.5, cap: 49800 },
    ],
    withholdingTax: {
      dividends: 19,
      interest: 19,
      royalties: 24,
      notes: ['Reduced under EU/treaty provisions'],
    },
    invoice: {
      mandatoryFields: [
        { field: 'invoiceNumber', label: 'Invoice Number', required: true },
        { field: 'invoiceDate', label: 'Invoice Date', required: true },
        { field: 'sellerName', label: 'Seller Details', required: true },
        { field: 'sellerNIF', label: 'Seller NIF', required: true },
        { field: 'buyerName', label: 'Buyer Details', required: true },
        { field: 'items', label: 'Line Items', required: true },
        { field: 'totalAmount', label: 'Total Amount', required: true },
      ],
      eInvoicing: { system: 'Facturae / SII', description: 'Suministro Inmediato de Información for reporting', mandatory: false, startDate: '', url: '' },
      fiscalization: 'Not applicable',
      retentionPeriod: '10 years',
      format: 'PDF / Facturae XML',
      seriesPrefix: 'FAC',
    },
    taxForms: [
      { code: 'Modelo 303', name: 'VAT Return', frequency: 'Quarterly', description: 'Quarterly VAT declaration', authority: 'AEAT' },
      { code: 'Modelo 200', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Corporate income tax', authority: 'AEAT' },
      { code: 'Modelo 111', name: 'Withholding Tax', frequency: 'Quarterly', description: 'Payments on account', authority: 'AEAT' },
    ],
    payroll: {
      minimumWage: 1166.67,
      minimumWageCurrency: 'EUR',
      payPeriod: 'Monthly',
      overtimeMultiplier: 1.25,
      standardWorkHours: 40,
      annualLeaveDays: 22,
      sickLeaveDays: 365,
      sickLeavePayPercent: 60,
      maternityLeaveWeeks: 16,
      maternityPayPercent: 100,
      pensionAge: { male: 66, female: 66 },
      noticePeriodDays: 30,
      probationPeriodDays: 90,
    },
  },

  // ===== UK (UNITED KINGDOM) =====
  {
    code: 'GB',
    name: 'United Kingdom',
    flag: '🇬🇧',
    region: 'europe',
    currency: 'GBP',
    currencySymbol: '£',
    language: 'English',
    vat: {
      standardRate: 20,
      reducedRates: [
        { rate: 5, description: 'Energy, children car seats, home energy' },
      ],
      registrationThreshold: 90000,
      exemptions: ['Exports', 'Financial services', 'Healthcare', 'Education'],
      isReverseChargeApplicable: true,
    },
    corporateTax: {
      rate: 25,
      reducedRates: [
        { threshold: 50000, rate: 19 },
      ],
      specialRegimes: ['Marginal relief between 50K-250K profits'],
      taxLossCarryForward: 3,
    },
    incomeTax: {
      type: 'progressive',
      flatRate: null,
      brackets: [
        { from: 0, to: 12570, rate: 0 },
        { from: 12570, to: 50270, rate: 20 },
        { from: 50270, to: 125140, rate: 40 },
        { from: 125140, to: null, rate: 45 },
      ],
      taxFreeAllowance: 12570,
    },
    socialContributions: [
      { name: 'National Insurance (Class 1)', employeeRate: 8, employerRate: 13.8, cap: 96700 },
    ],
    withholdingTax: {
      dividends: 0,
      interest: 20,
      royalties: 20,
      notes: ['No withholding on dividends'],
    },
    invoice: {
      mandatoryFields: [
        { field: 'invoiceNumber', label: 'Invoice Number', required: true },
        { field: 'invoiceDate', label: 'Invoice Date', required: true },
        { field: 'sellerName', label: 'Seller Details', required: true },
        { field: 'sellerVAT', label: 'Seller VAT Number', required: true },
        { field: 'buyerName', label: 'Buyer Details', required: true },
        { field: 'items', label: 'Line Items', required: true },
        { field: 'totalAmount', label: 'Total Amount', required: true },
      ],
      eInvoicing: { system: 'Peppol / HMRC', description: 'Voluntary e-invoicing via Peppol', mandatory: false, startDate: '', url: '' },
      fiscalization: 'Not applicable',
      retentionPeriod: '6 years',
      format: 'PDF / UBL XML',
      seriesPrefix: 'INV',
    },
    taxForms: [
      { code: 'VAT Return', name: 'VAT Return', frequency: 'Quarterly', description: 'Quarterly VAT return via MTD', authority: 'HMRC' },
      { code: 'CT600', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Company tax return', authority: 'HMRC' },
      { code: 'P11D', name: 'Benefits in Kind', frequency: 'Annually', description: 'Employee benefits report', authority: 'HMRC' },
    ],
    payroll: {
      minimumWage: 11.44,
      minimumWageCurrency: 'GBP',
      payPeriod: 'Monthly',
      overtimeMultiplier: 1.5,
      standardWorkHours: 40,
      annualLeaveDays: 28,
      sickLeaveDays: 28,
      sickLeavePayPercent: 100,
      maternityLeaveWeeks: 52,
      maternityPayPercent: 90,
      pensionAge: { male: 66, female: 66 },
      noticePeriodDays: 30,
      probationPeriodDays: 90,
    },
  },

  // ===== USA =====
  {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    region: 'americas',
    currency: 'USD',
    currencySymbol: '$',
    language: 'English',
    vat: {
      standardRate: 0,
      reducedRates: [],
      registrationThreshold: null,
      exemptions: [],
      isReverseChargeApplicable: false,
    },
    corporateTax: {
      rate: 21,
      reducedRates: null,
      specialRegimes: ['State taxes may apply additional 0-12%'],
      taxLossCarryForward: 20,
    },
    incomeTax: {
      type: 'progressive',
      flatRate: null,
      brackets: [
        { from: 0, to: 11600, rate: 10 },
        { from: 11600, to: 47150, rate: 12 },
        { from: 47150, to: 100525, rate: 22 },
        { from: 100525, to: 191950, rate: 24 },
        { from: 191950, to: 243725, rate: 32 },
        { from: 243725, to: 609350, rate: 35 },
        { from: 609350, to: null, rate: 37 },
      ],
      taxFreeAllowance: 14600,
    },
    socialContributions: [
      { name: 'Social Security (FICA)', employeeRate: 6.2, employerRate: 6.2, cap: 168600 },
      { name: 'Medicare', employeeRate: 1.45, employerRate: 1.45, cap: null },
      { name: 'Medicare Additional', employeeRate: 0.9, employerRate: 0, cap: null },
    ],
    withholdingTax: {
      dividends: 30,
      interest: 30,
      royalties: 30,
      notes: ['Reduced under double tax treaties; 30% statutory rate'],
    },
    invoice: {
      mandatoryFields: [
        { field: 'invoiceNumber', label: 'Invoice Number', required: true },
        { field: 'invoiceDate', label: 'Invoice Date', required: true },
        { field: 'sellerName', label: 'Seller Details', required: true },
        { field: 'sellerEIN', label: 'Seller EIN', required: false },
        { field: 'buyerName', label: 'Buyer Details', required: true },
        { field: 'items', label: 'Line Items', required: true },
        { field: 'totalAmount', label: 'Total Amount', required: true },
      ],
      eInvoicing: { system: 'Peppol / Various', description: 'No federal mandate; varies by state', mandatory: false, url: '' },
      fiscalization: 'Not applicable',
      retentionPeriod: '7 years',
      format: 'PDF / EDI',
      seriesPrefix: 'INV',
    },
    taxForms: [
      { code: 'W-2', name: 'Wage & Tax Statement', frequency: 'Annually', description: 'Employee wage reporting', authority: 'IRS' },
      { code: '1099', name: 'Miscellaneous Income', frequency: 'Annually', description: 'Non-employee compensation', authority: 'IRS' },
      { code: '1120', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Corporate income tax return', authority: 'IRS' },
      { code: '941', name: 'Quarterly Payroll Tax', frequency: 'Quarterly', description: 'Employer quarterly federal tax return', authority: 'IRS' },
    ],
    payroll: {
      minimumWage: 7.25,
      minimumWageCurrency: 'USD',
      payPeriod: 'Bi-weekly/Monthly',
      overtimeMultiplier: 1.5,
      standardWorkHours: 40,
      annualLeaveDays: 10,
      sickLeaveDays: 0,
      sickLeavePayPercent: 0,
      maternityLeaveWeeks: 12,
      maternityPayPercent: 0,
      pensionAge: { male: 67, female: 67 },
      noticePeriodDays: 14,
      probationPeriodDays: 90,
    },
  },

  // ===== CANADA =====
  {
    code: 'CA',
    name: 'Canada',
    flag: '🇨🇦',
    region: 'americas',
    currency: 'CAD',
    currencySymbol: 'C$',
    language: 'English/French',
    vat: {
      standardRate: 5,
      reducedRates: [],
      registrationThreshold: 30000,
      exemptions: ['Financial services', 'Healthcare', 'Education'],
      isReverseChargeApplicable: false,
    },
    corporateTax: {
      rate: 15,
      reducedRates: null,
      specialRegimes: ['Small business deduction 9% on first 500K'],
      taxLossCarryForward: 20,
    },
    incomeTax: {
      type: 'progressive',
      flatRate: null,
      brackets: [
        { from: 0, to: 15705, rate: 0 },
        { from: 15705, to: 55867, rate: 15 },
        { from: 55867, to: 111733, rate: 20.5 },
        { from: 111733, to: 154906, rate: 26 },
        { from: 154906, to: 220000, rate: 29 },
        { from: 220000, to: null, rate: 33 },
      ],
      taxFreeAllowance: 15705,
    },
    socialContributions: [
      { name: 'CPP', employeeRate: 5.95, employerRate: 5.95, cap: 68500 },
      { name: 'EI', employeeRate: 1.66, employerRate: 2.32, cap: 63200 },
    ],
    withholdingTax: {
      dividends: 25,
      interest: 25,
      royalties: 25,
      notes: ['Part IV withholding on dividends'],
    },
    invoice: {
      mandatoryFields: [
        { field: 'invoiceNumber', label: 'Invoice Number', required: true },
        { field: 'invoiceDate', label: 'Invoice Date', required: true },
        { field: 'sellerName', label: 'Seller Details', required: true },
        { field: 'sellerGST', label: 'Seller GST/HST Number', required: true },
        { field: 'buyerName', label: 'Buyer Details', required: true },
        { field: 'items', label: 'Line Items', required: true },
        { field: 'totalAmount', label: 'Total Amount', required: true },
      ],
      eInvoicing: { system: 'Peppol / Various', description: 'No federal mandate', mandatory: false, url: '' },
      fiscalization: 'Not applicable',
      retentionPeriod: '6 years',
      format: 'PDF / EDI',
      seriesPrefix: 'INV',
    },
    taxForms: [
      { code: 'GST34', name: 'GST/HST Return', frequency: 'Monthly/Quarterly', description: 'GST/HST return', authority: 'CRA' },
      { code: 'T2', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Corporate income tax', authority: 'CRA' },
      { code: 'T4', name: 'T4 Summary', frequency: 'Annually', description: 'Employee remuneration summary', authority: 'CRA' },
    ],
    payroll: {
      minimumWage: 16.65,
      minimumWageCurrency: 'CAD',
      payPeriod: 'Bi-weekly',
      overtimeMultiplier: 1.5,
      standardWorkHours: 40,
      annualLeaveDays: 10,
      sickLeaveDays: 3,
      sickLeavePayPercent: 0,
      maternityLeaveWeeks: 17,
      maternityPayPercent: 55,
      pensionAge: { male: 65, female: 65 },
      noticePeriodDays: 14,
      probationPeriodDays: 90,
    },
  },

  // ===== BRAZIL =====
  {
    code: 'BR',
    name: 'Brazil',
    flag: '🇧🇷',
    region: 'americas',
    currency: 'BRL',
    currencySymbol: 'R$',
    language: 'Portuguese',
    vat: {
      standardRate: 0,
      reducedRates: [],
      registrationThreshold: null,
      exemptions: [],
      isReverseChargeApplicable: false,
    },
    corporateTax: {
      rate: 15,
      reducedRates: [
        { threshold: 240000, rate: 10 },
      ],
      specialRegimes: ['IRPJ 15% + CSLL 9%; Simples Nacional for small biz'],
      taxLossCarryForward: 5,
    },
    incomeTax: {
      type: 'progressive',
      flatRate: null,
      brackets: [
        { from: 0, to: 24600, rate: 0 },
        { from: 24600, to: 52320, rate: 7.5 },
        { from: 52320, to: 78780, rate: 15 },
        { from: 78780, to: 105360, rate: 22.5 },
        { from: 105360, to: null, rate: 27.5 },
      ],
      taxFreeAllowance: 24600,
    },
    socialContributions: [
      { name: 'INSS (Social Security)', employeeRate: 7.5, employerRate: 20, cap: null },
      { name: 'FGTS', employeeRate: 0, employerRate: 8, cap: null },
    ],
    withholdingTax: {
      dividends: 0,
      interest: 15,
      royalties: 15,
      notes: ['Dividends exempt from withholding tax since 2026 reform'],
    },
    invoice: {
      mandatoryFields: [
        { field: 'invoiceNumber', label: 'Invoice Number (NF-e)', required: true },
        { field: 'invoiceDate', label: 'Invoice Date', required: true },
        { field: 'sellerName', label: 'Seller Details (CNPJ)', required: true },
        { field: 'buyerName', label: 'Buyer Details (CNPJ/CPF)', required: true },
        { field: 'items', label: 'Line Items (CFOP code)', required: true },
        { field: 'totalAmount', label: 'Total Amount', required: true },
      ],
      eInvoicing: { system: 'NF-e / NFC-e', description: 'Mandatory electronic invoicing (Nota Fiscal Eletrônica)', mandatory: true, startDate: '2008', url: 'https://www.nfe.fazenda.gov.br' },
      fiscalization: 'NFC-e fiscal for retail, SPED for accounting',
      retentionPeriod: '10 years',
      format: 'XML (NF-e)',
      seriesPrefix: 'NF',
    },
    taxForms: [
      { code: 'SPED Fiscal', name: 'Tax Accounting', frequency: 'Monthly', description: 'SPED Fiscal reporting', authority: 'Receita Federal' },
      { code: 'DCTF', name: 'Federal Tax Declaration', frequency: 'Monthly', description: 'Federal taxes declaration', authority: 'Receita Federal' },
      { code: 'ECF', name: 'Commercial Books', frequency: 'Annually', description: 'Escrituração Contábil Fiscal', authority: 'Receita Federal' },
    ],
    payroll: {
      minimumWage: 1412,
      minimumWageCurrency: 'BRL',
      payPeriod: 'Monthly',
      overtimeMultiplier: 1.5,
      standardWorkHours: 44,
      annualLeaveDays: 30,
      sickLeaveDays: 15,
      sickLeavePayPercent: 100,
      maternityLeaveWeeks: 24,
      maternityPayPercent: 100,
      pensionAge: { male: 65, female: 62 },
      noticePeriodDays: 30,
      probationPeriodDays: 45,
    },
  },

  // ===== MEXICO =====
  {
    code: 'MX',
    name: 'Mexico',
    flag: '🇲🇽',
    region: 'americas',
    currency: 'MXN',
    currencySymbol: 'Mex$',
    language: 'Spanish',
    vat: {
      standardRate: 16,
      reducedRates: [],
      registrationThreshold: null,
      exemptions: ['Food, medicine', 'Exports'],
      isReverseChargeApplicable: false,
    },
    corporateTax: {
      rate: 30,
      reducedRates: null,
      specialRegimes: ['Coordinated entities, flat-rate taxpayers'],
      taxLossCarryForward: 10,
    },
    incomeTax: {
      type: 'progressive',
      flatRate: null,
      brackets: [
        { from: 0, to: 10960, rate: 1.92 },
        { from: 10960, to: 97887, rate: 6.4 },
        { from: 97887, to: 176838, rate: 10.88 },
        { from: 176838, to: 283077, rate: 16 },
        { from: 283077, to: 498757, rate: 17.92 },
        { from: 498757, to: 965936, rate: 21.36 },
        { from: 965936, to: null, rate: 23.52 },
      ],
      taxFreeAllowance: 0,
    },
    socialContributions: [
      { name: 'IMSS', employeeRate: 1.3, employerRate: 8.5, cap: null },
      { name: 'Infonavit', employeeRate: 0, employerRate: 5, cap: null },
      { name: 'SAR', employeeRate: 0, employerRate: 2, cap: null },
    ],
    withholdingTax: {
      dividends: 10,
      interest: 25,
      royalties: 25,
      notes: ['Treaty rates apply for non-residents'],
    },
    invoice: {
      mandatoryFields: [
        { field: 'invoiceNumber', label: 'Folio / UUID', required: true },
        { field: 'invoiceDate', label: 'Invoice Date', required: true },
        { field: 'sellerName', label: 'Seller RFC', required: true },
        { field: 'buyerName', label: 'Buyer RFC', required: true },
        { field: 'items', label: 'Line Items', required: true },
        { field: 'totalAmount', label: 'Total Amount', required: true },
      ],
      eInvoicing: { system: 'CFDI (SAT)', description: 'Comprobante Fiscal Digital por Internet', mandatory: true, startDate: '2014', url: 'https://www.sat.gob.mx' },
      fiscalization: 'CFDI is the fiscalization system',
      retentionPeriod: '5 years',
      format: 'XML (CFDI 4.0)',
      seriesPrefix: 'FAC',
    },
    taxForms: [
      { code: 'Declaración Anual', name: 'Annual Tax Return', frequency: 'Annually', description: 'Annual income tax declaration', authority: 'SAT' },
      { code: 'ISR Retenciones', name: 'Withholding Return', frequency: 'Monthly', description: 'Monthly ISR withholding', authority: 'SAT' },
      { code: 'IVA', name: 'VAT Return', frequency: 'Monthly', description: 'Monthly VAT declaration', authority: 'SAT' },
    ],
    payroll: {
      minimumWage: 248.93,
      minimumWageCurrency: 'MXN',
      payPeriod: 'Bi-weekly',
      overtimeMultiplier: 2,
      standardWorkHours: 48,
      annualLeaveDays: 6,
      sickLeaveDays: 3,
      sickLeavePayPercent: 60,
      maternityLeaveWeeks: 12,
      maternityPayPercent: 100,
      pensionAge: { male: 65, female: 65 },
      noticePeriodDays: 7,
      probationPeriodDays: 30,
    },
  },

  // ===== CHINA =====
  {
    code: 'CN',
    name: 'China',
    flag: '🇨🇳',
    region: 'asia',
    currency: 'CNY',
    currencySymbol: '¥',
    language: 'Chinese',
    vat: {
      standardRate: 13,
      reducedRates: [
        { rate: 9, description: 'Transport, construction, basic services' },
        { rate: 6, description: 'Services, financial services' },
      ],
      registrationThreshold: 500000,
      exemptions: ['Some agriculture, education services'],
      isReverseChargeApplicable: true,
    },
    corporateTax: {
      rate: 25,
      reducedRates: [
        { threshold: 100000, rate: 5 },
        { threshold: 300000, rate: 10 },
      ],
      specialRegimes: ['High-tech enterprises: 15%', 'Qualified small/medium: 20%'],
      taxLossCarryForward: 10,
    },
    incomeTax: {
      type: 'progressive',
      flatRate: null,
      brackets: [
        { from: 0, to: 36000, rate: 3 },
        { from: 36000, to: 144000, rate: 10 },
        { from: 144000, to: 300000, rate: 20 },
        { from: 300000, to: 420000, rate: 25 },
        { from: 420000, to: 660000, rate: 30 },
        { from: 660000, to: 960000, rate: 35 },
        { from: 960000, to: null, rate: 45 },
      ],
      taxFreeAllowance: 60000,
    },
    socialContributions: [
      { name: 'Pension', employeeRate: 8, employerRate: 16, cap: null },
      { name: 'Medical', employeeRate: 2, employerRate: 10, cap: null },
      { name: 'Unemployment', employeeRate: 0.5, employerRate: 0.5, cap: null },
      { name: 'Housing Fund', employeeRate: 5, employerRate: 5, cap: null },
    ],
    withholdingTax: {
      dividends: 10,
      interest: 10,
      royalties: 10,
      notes: ['Reduced under double tax treaties'],
    },
    invoice: {
      mandatoryFields: [
        { field: 'invoiceNumber', label: 'Fapiao Number', required: true },
        { field: 'invoiceDate', label: 'Invoice Date', required: true },
        { field: 'sellerName', label: 'Seller Name (Tax ID)', required: true },
        { field: 'buyerName', label: 'Buyer Name (Tax ID)', required: true },
        { field: 'items', label: 'Line Items', required: true },
        { field: 'totalAmount', label: 'Total Amount (with & without tax)', required: true },
      ],
      eInvoicing: { system: 'Golden Tax (Golden Tax System)', description: 'State Administration of Taxation Golden Tax system', mandatory: true, startDate: '2013', url: '' },
      fiscalization: 'Fapiao system is the fiscalization system',
      retentionPeriod: '10 years',
      format: 'Electronic Fapiao / Paper Fapiao',
      seriesPrefix: 'FP',
    },
    taxForms: [
      { code: 'VAT Return', name: 'VAT Return', frequency: 'Monthly', description: 'Monthly VAT return', authority: 'SAT' },
      { code: 'CIT Annual', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Annual CIT return', authority: 'SAT' },
      { code: 'IIT Monthly', name: 'Individual Income Tax', frequency: 'Monthly', description: 'Monthly IIT withholding', authority: 'SAT' },
    ],
    payroll: {
      minimumWage: 2690,
      minimumWageCurrency: 'CNY',
      payPeriod: 'Monthly',
      overtimeMultiplier: 1.5,
      standardWorkHours: 40,
      annualLeaveDays: 5,
      sickLeaveDays: 3,
      sickLeavePayPercent: 60,
      maternityLeaveWeeks: 14,
      maternityPayPercent: 100,
      pensionAge: { male: 60, female: 55 },
      noticePeriodDays: 30,
      probationPeriodDays: 90,
    },
  },

  // ===== JAPAN =====
  {
    code: 'JP',
    name: 'Japan',
    flag: '🇯🇵',
    region: 'asia',
    currency: 'JPY',
    currencySymbol: '¥',
    language: 'Japanese',
    vat: {
      standardRate: 10,
      reducedRates: [
        { rate: 8, description: 'Food, newspapers, non-alcoholic beverages' },
      ],
      registrationThreshold: 10000000,
      exemptions: ['Exports', 'Financial services', 'Medical care'],
      isReverseChargeApplicable: true,
    },
    corporateTax: {
      rate: 23.2,
      reducedRates: null,
      specialRegimes: ['Local enterprise tax adds additional ~7%'],
      taxLossCarryForward: 9,
    },
    incomeTax: {
      type: 'progressive',
      flatRate: null,
      brackets: [
        { from: 0, to: 1950000, rate: 5 },
        { from: 1950000, to: 3300000, rate: 10 },
        { from: 3300000, to: 6950000, rate: 20 },
        { from: 6950000, to: 9000000, rate: 23 },
        { from: 9000000, to: 18000000, rate: 33 },
        { from: 18000000, to: null, rate: 40 },
      ],
      taxFreeAllowance: 480000,
    },
    socialContributions: [
      { name: 'Health Insurance', employeeRate: 5, employerRate: 5, cap: null },
      { name: 'Pension', employeeRate: 9.15, employerRate: 9.15, cap: 650000 },
      { name: 'Unemployment', employeeRate: 0.3, employerRate: 0.6, cap: null },
    ],
    withholdingTax: {
      dividends: 20.42,
      interest: 20.42,
      royalties: 20.42,
      notes: ['Includes 2.1% reconstruction tax'],
    },
    invoice: {
      mandatoryFields: [
        { field: 'invoiceNumber', label: 'Invoice Number', required: true },
        { field: 'invoiceDate', label: 'Invoice Date', required: true },
        { field: 'sellerName', label: 'Seller Name (TIN)', required: true },
        { field: 'buyerName', label: 'Buyer Name', required: true },
        { field: 'items', label: 'Line Items', required: true },
        { field: 'totalAmount', label: 'Total Amount', required: true },
      ],
      eInvoicing: { system: 'Peppol / Qualified Invoice System', description: 'Qualified Invoice System since 2023', mandatory: false, startDate: '2023', url: '' },
      fiscalization: 'Not applicable',
      retentionPeriod: '7 years',
      format: 'PDF',
      seriesPrefix: '請求書',
    },
    taxForms: [
      { code: 'Withholding Tax', name: 'Withholding Return', frequency: 'Monthly', description: 'Income tax withholding slip', authority: 'NTA' },
      { code: 'CIT Return', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Corporate income tax return', authority: 'NTA' },
      { code: 'Consumption Tax', name: 'Consumption Tax Return', frequency: 'Annually', description: 'Consumption tax return', authority: 'NTA' },
    ],
    payroll: {
      minimumWage: 1113,
      minimumWageCurrency: 'JPY',
      payPeriod: 'Monthly',
      overtimeMultiplier: 1.25,
      standardWorkHours: 40,
      annualLeaveDays: 10,
      sickLeaveDays: 0,
      sickLeavePayPercent: 0,
      maternityLeaveWeeks: 14,
      maternityPayPercent: 67,
      pensionAge: { male: 65, female: 65 },
      noticePeriodDays: 30,
      probationPeriodDays: 90,
    },
  },

  // ===== INDIA =====
  {
    code: 'IN',
    name: 'India',
    flag: '🇮🇳',
    region: 'asia',
    currency: 'INR',
    currencySymbol: '₹',
    language: 'Hindi/English',
    vat: {
      standardRate: 18,
      reducedRates: [
        { rate: 5, description: 'Essential goods, transport' },
        { rate: 12, description: 'Some services' },
        { rate: 28, description: 'Luxury goods, automobiles' },
      ],
      registrationThreshold: 2000000,
      exemptions: ['Some essential services, agriculture'],
      isReverseChargeApplicable: true,
    },
    corporateTax: {
      rate: 25.17,
      reducedRates: null,
      specialRegimes: ['New manufacturing: 15%', 'Companies <400M INR turnover: 25.17%'],
      taxLossCarryForward: 8,
    },
    incomeTax: {
      type: 'progressive',
      flatRate: null,
      brackets: [
        { from: 0, to: 300000, rate: 0 },
        { from: 300000, to: 700000, rate: 5 },
        { from: 700000, to: 1000000, rate: 10 },
        { from: 1000000, to: 1200000, rate: 15 },
        { from: 1200000, to: 1500000, rate: 20 },
        { from: 1500000, to: null, rate: 30 },
      ],
      taxFreeAllowance: 300000,
    },
    socialContributions: [
      { name: 'EPF (Provident Fund)', employeeRate: 12, employerRate: 12, cap: 15000 },
      { name: 'ESI (Health)', employeeRate: 0.75, employerRate: 3.25, cap: 21000 },
      { name: 'Labour Welfare', employeeRate: 0, employerRate: 2, cap: null },
    ],
    withholdingTax: {
      dividends: 20,
      interest: 20,
      royalties: 10,
      notes: ['Treaty rates may reduce WHT'],
    },
    invoice: {
      mandatoryFields: [
        { field: 'invoiceNumber', label: 'Invoice Number', required: true },
        { field: 'invoiceDate', label: 'Invoice Date', required: true },
        { field: 'sellerName', label: 'Seller GSTIN', required: true },
        { field: 'buyerName', label: 'Buyer GSTIN', required: true },
        { field: 'items', label: 'Line Items (HSN code, CGST, SGST/IGST)', required: true },
        { field: 'totalAmount', label: 'Total Amount', required: true },
      ],
      eInvoicing: { system: 'e-Invoice (GSTN)', description: 'Mandatory e-invoicing for B2B', mandatory: true, startDate: '2021', url: 'https://einvoice1.gst.gov.in' },
      fiscalization: 'Not applicable',
      retentionPeriod: '8 years',
      format: 'JSON / PDF',
      seriesPrefix: 'INV',
    },
    taxForms: [
      { code: 'GSTR-1', name: 'Outward Supplies', frequency: 'Monthly', description: 'GST outward supply return', authority: 'GSTN' },
      { code: 'GSTR-3B', name: 'GST Summary Return', frequency: 'Monthly', description: 'Monthly GST summary', authority: 'GSTN' },
      { code: 'ITR-6', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Corporate income tax return', authority: 'CBDT' },
      { code: 'TDS Return', name: 'TDS Return', frequency: 'Quarterly', description: 'Tax deducted at source return', authority: 'CBDT' },
    ],
    payroll: {
      minimumWage: 178,
      minimumWageCurrency: 'INR',
      payPeriod: 'Monthly',
      overtimeMultiplier: 2,
      standardWorkHours: 48,
      annualLeaveDays: 12,
      sickLeaveDays: 12,
      sickLeavePayPercent: 70,
      maternityLeaveWeeks: 26,
      maternityPayPercent: 100,
      pensionAge: { male: 60, female: 60 },
      noticePeriodDays: 30,
      probationPeriodDays: 90,
    },
  },

  // ===== SOUTH KOREA =====
  {
    code: 'KR',
    name: 'South Korea',
    flag: '🇰🇷',
    region: 'asia',
    currency: 'KRW',
    currencySymbol: '₩',
    language: 'Korean',
    vat: {
      standardRate: 10,
      reducedRates: [],
      registrationThreshold: null,
      exemptions: ['Exports', 'Financial services', 'Some food'],
      isReverseChargeApplicable: true,
    },
    corporateTax: {
      rate: 24,
      reducedRates: [
        { threshold: 200000000, rate: 9 },
        { threshold: 20000000000, rate: 19 },
      ],
      specialRegimes: ['Local income tax adds 10% surcharge'],
      taxLossCarryForward: 5,
    },
    incomeTax: {
      type: 'progressive',
      flatRate: null,
      brackets: [
        { from: 0, to: 14000000, rate: 6 },
        { from: 14000000, to: 50000000, rate: 15 },
        { from: 50000000, to: 88000000, rate: 24 },
        { from: 88000000, to: 150000000, rate: 35 },
        { from: 150000000, to: 300000000, rate: 38 },
        { from: 300000000, to: 500000000, rate: 40 },
        { from: 500000000, to: 1000000000, rate: 42 },
        { from: 1000000000, to: null, rate: 45 },
      ],
      taxFreeAllowance: 0,
    },
    socialContributions: [
      { name: 'National Pension', employeeRate: 4.5, employerRate: 4.5, cap: null },
      { name: 'Health Insurance', employeeRate: 3.53, employerRate: 3.53, cap: null },
      { name: 'Unemployment', employeeRate: 0.65, employerRate: 0.9, cap: null },
      { name: 'Industrial Accident', employeeRate: 0, employerRate: 1.42, cap: null },
    ],
    withholdingTax: {
      dividends: 20,
      interest: 20,
      royalties: 20,
      notes: ['Reduced under double tax treaties'],
    },
    invoice: {
      mandatoryFields: [
        { field: 'invoiceNumber', label: 'Tax Invoice Number', required: true },
        { field: 'invoiceDate', label: 'Invoice Date', required: true },
        { field: 'sellerName', label: 'Seller Business Number', required: true },
        { field: 'buyerName', label: 'Buyer Business Number', required: true },
        { field: 'items', label: 'Line Items', required: true },
        { field: 'totalAmount', label: 'Total Amount', required: true },
      ],
      eInvoicing: { system: 'Hometax / NTAS', description: 'Electronic Tax Invoice (Seonjeong-ui Chŏngsŏ)', mandatory: true, startDate: '2011', url: 'https://www.hometax.go.kr' },
      fiscalization: 'Not applicable',
      retentionPeriod: '10 years',
      format: 'XML (Electronic Tax Invoice)',
      seriesPrefix: 'INV',
    },
    taxForms: [
      { code: 'VAT Return', name: 'VAT Return', frequency: 'Quarterly', description: 'Quarterly VAT declaration', authority: 'NTS' },
      { code: 'CIT Return', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Corporate income tax', authority: 'NTS' },
      { code: 'Year-end Settlement', name: 'Year-end Tax Settlement', frequency: 'Annually', description: 'Annual year-end tax adjustment', authority: 'NTS' },
    ],
    payroll: {
      minimumWage: 10030,
      minimumWageCurrency: 'KRW',
      payPeriod: 'Monthly',
      overtimeMultiplier: 1.5,
      standardWorkHours: 40,
      annualLeaveDays: 15,
      sickLeaveDays: 0,
      sickLeavePayPercent: 0,
      maternityLeaveWeeks: 13,
      maternityPayPercent: 100,
      pensionAge: { male: 63, female: 63 },
      noticePeriodDays: 30,
      probationPeriodDays: 90,
    },
  },

  // ===== TURKEY =====
  {
    code: 'TR',
    name: 'Turkey',
    flag: '🇹🇷',
    region: 'asia',
    currency: 'TRY',
    currencySymbol: '₺',
    language: 'Turkish',
    vat: {
      standardRate: 20,
      reducedRates: [
        { rate: 10, description: 'Basic food, medicine' },
        { rate: 1, description: 'Some essential goods' },
      ],
      registrationThreshold: 1700000,
      exemptions: ['Exports', 'Financial services', 'Education'],
      isReverseChargeApplicable: true,
    },
    corporateTax: {
      rate: 20,
      reducedRates: null,
      specialRegimes: ['Reduced for export-heavy companies'],
      taxLossCarryForward: 5,
    },
    incomeTax: {
      type: 'progressive',
      flatRate: null,
      brackets: [
        { from: 0, to: 110000, rate: 15 },
        { from: 110000, to: 230000, rate: 20 },
        { from: 230000, to: 580000, rate: 27 },
        { from: 580000, to: 3000000, rate: 35 },
        { from: 3000000, to: null, rate: 40 },
      ],
      taxFreeAllowance: 0,
    },
    socialContributions: [
      { name: 'SGK (Social Security)', employeeRate: 14, employerRate: 20.5, cap: null },
    ],
    withholdingTax: {
      dividends: 15,
      interest: 15,
      royalties: 20,
      notes: ['Reduced under treaties'],
    },
    invoice: {
      mandatoryFields: [
        { field: 'invoiceNumber', label: 'Invoice Number', required: true },
        { field: 'invoiceDate', label: 'Invoice Date', required: true },
        { field: 'sellerName', label: 'Seller Tax Number', required: true },
        { field: 'buyerName', label: 'Buyer Details', required: true },
        { field: 'items', label: 'Line Items', required: true },
        { field: 'totalAmount', label: 'Total Amount', required: true },
      ],
      eInvoicing: { system: 'e-Fatura (GİB)', description: 'Electronic invoicing system by Revenue Administration', mandatory: true, startDate: '2012', url: 'https://efatura.gov.tr' },
      fiscalization: 'Obligation for certain sectors',
      retentionPeriod: '10 years',
      format: 'XML (UBL TR)',
      seriesPrefix: 'FAT',
    },
    taxForms: [
      { code: 'KDV Beyannamesi', name: 'VAT Return', frequency: 'Monthly', description: 'Monthly VAT declaration', authority: 'GİB' },
      { code: 'Kurumlar Beyannamesi', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Corporate income tax', authority: 'GİB' },
      { code: 'Beyanname', name: 'Income Tax Return', frequency: 'Annually', description: 'Personal income tax', authority: 'GİB' },
    ],
    payroll: {
      minimumWage: 20002.50,
      minimumWageCurrency: 'TRY',
      payPeriod: 'Monthly',
      overtimeMultiplier: 1.5,
      standardWorkHours: 45,
      annualLeaveDays: 14,
      sickLeaveDays: 0,
      sickLeavePayPercent: 60,
      maternityLeaveWeeks: 16,
      maternityPayPercent: 67,
      pensionAge: { male: 65, female: 58 },
      noticePeriodDays: 14,
      probationPeriodDays: 60,
    },
  },

  // ===== UAE =====
  {
    code: 'AE',
    name: 'United Arab Emirates',
    flag: '🇦🇪',
    region: 'asia',
    currency: 'AED',
    currencySymbol: 'د.إ',
    language: 'Arabic/English',
    vat: {
      standardRate: 5,
      reducedRates: [],
      registrationThreshold: 375000,
      exemptions: ['Financial services', 'Healthcare', 'Education', 'Residential property'],
      isReverseChargeApplicable: true,
    },
    corporateTax: {
      rate: 9,
      reducedRates: null,
      specialRegimes: ['Free zone companies may be exempt', 'Natural persons: 0% up to 375K AED'],
      taxLossCarryForward: 3,
    },
    incomeTax: {
      type: 'flat',
      flatRate: 0,
      brackets: [],
      taxFreeAllowance: 0,
    },
    socialContributions: [],
    withholdingTax: {
      dividends: 0,
      interest: 0,
      royalties: 0,
      notes: ['No personal income tax or withholding tax in most cases'],
    },
    invoice: {
      mandatoryFields: [
        { field: 'invoiceNumber', label: 'Invoice Number', required: true },
        { field: 'invoiceDate', label: 'Invoice Date', required: true },
        { field: 'sellerName', label: 'Seller Name (TRN)', required: true },
        { field: 'sellerTRN', label: 'Seller TRN (Tax Registration Number)', required: true },
        { field: 'buyerName', label: 'Buyer Name', required: true },
        { field: 'items', label: 'Line Items', required: true },
        { field: 'totalAmount', label: 'Total Amount (VAT separate)', required: true },
      ],
      eInvoicing: { system: 'None', description: 'No mandatory e-invoicing yet', mandatory: false, url: '' },
      fiscalization: 'Not applicable',
      retentionPeriod: '5 years',
      format: 'PDF',
      seriesPrefix: 'INV',
    },
    taxForms: [
      { code: 'VAT Return', name: 'VAT Return', frequency: 'Quarterly', description: 'VAT return via EmaraTax portal', authority: 'FTA' },
      { code: 'CIT Return', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Corporate income tax return', authority: 'FTA' },
    ],
    payroll: {
      minimumWage: null,
      minimumWageCurrency: 'AED',
      payPeriod: 'Monthly',
      overtimeMultiplier: 1.25,
      standardWorkHours: 48,
      annualLeaveDays: 30,
      sickLeaveDays: 90,
      sickLeavePayPercent: 75,
      maternityLeaveWeeks: 13,
      maternityPayPercent: 100,
      pensionAge: { male: 65, female: 60 },
      noticePeriodDays: 30,
      probationPeriodDays: 90,
    },
  },

  // ===== SINGAPORE =====
  {
    code: 'SG',
    name: 'Singapore',
    flag: '🇸🇬',
    region: 'asia',
    currency: 'SGD',
    currencySymbol: 'S$',
    language: 'English',
    vat: {
      standardRate: 9,
      reducedRates: [],
      registrationThreshold: 1000000,
      exemptions: ['Exports', 'Financial services', 'Residential property'],
      isReverseChargeApplicable: true,
    },
    corporateTax: {
      rate: 17,
      reducedRates: null,
      specialRegimes: ['Partial tax exemption: 75% on first 10K, 50% on next 190K', 'New startups: 75% on first 200K for 3 years'],
      taxLossCarryForward: 3,
    },
    incomeTax: {
      type: 'progressive',
      flatRate: null,
      brackets: [
        { from: 0, to: 20000, rate: 0 },
        { from: 20000, to: 30000, rate: 2 },
        { from: 30000, to: 40000, rate: 3.5 },
        { from: 40000, to: 80000, rate: 5.5 },
        { from: 80000, to: 120000, rate: 8 },
        { from: 120000, to: 160000, rate: 11.5 },
        { from: 160000, to: 200000, rate: 15 },
        { from: 200000, to: 240000, rate: 18 },
        { from: 240000, to: 320000, rate: 19 },
        { from: 320000, to: 500000, rate: 19.5 },
        { from: 500000, to: 1000000, rate: 22 },
        { from: 1000000, to: null, rate: 22 },
      ],
      taxFreeAllowance: 20000,
    },
    socialContributions: [
      { name: 'CPF', employeeRate: 20, employerRate: 17, cap: 6800 },
    ],
    withholdingTax: {
      dividends: 0,
      interest: 15,
      royalties: 10,
      notes: ['No WHT on dividends (one-tier system)'],
    },
    invoice: {
      mandatoryFields: [
        { field: 'invoiceNumber', label: 'Invoice Number', required: true },
        { field: 'invoiceDate', label: 'Invoice Date', required: true },
        { field: 'sellerName', label: 'Seller UEN', required: true },
        { field: 'buyerName', label: 'Buyer Details', required: true },
        { field: 'items', label: 'Line Items', required: true },
        { field: 'totalAmount', label: 'Total Amount', required: true },
      ],
      eInvoicing: { system: 'InvoiceNow', description: 'Nationwide e-invoicing network (Peppol-based)', mandatory: false, startDate: '', url: 'https://invoicenow.sg' },
      fiscalization: 'Not applicable',
      retentionPeriod: '5 years',
      format: 'PDF / UBL XML (Peppol)',
      seriesPrefix: 'INV',
    },
    taxForms: [
      { code: 'GST F5', name: 'GST Return', frequency: 'Quarterly', description: 'GST return', authority: 'IRAS' },
      { code: 'Form C-S', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Simplified corporate tax return', authority: 'IRAS' },
      { code: 'IR8A', name: 'Employee Income', frequency: 'Annually', description: 'Employee annual income', authority: 'IRAS' },
    ],
    payroll: {
      minimumWage: null,
      minimumWageCurrency: 'SGD',
      payPeriod: 'Monthly',
      overtimeMultiplier: 1.5,
      standardWorkHours: 44,
      annualLeaveDays: 7,
      sickLeaveDays: 14,
      sickLeavePayPercent: 100,
      maternityLeaveWeeks: 16,
      maternityPayPercent: 100,
      pensionAge: { male: 65, female: 65 },
      noticePeriodDays: 14,
      probationPeriodDays: 90,
    },
  },

  // ===== AUSTRALIA =====
  {
    code: 'AU',
    name: 'Australia',
    flag: '🇦🇺',
    region: 'asia',
    currency: 'AUD',
    currencySymbol: 'A$',
    language: 'English',
    vat: {
      standardRate: 10,
      reducedRates: [],
      registrationThreshold: 75000,
      exemptions: ['Basic food, healthcare, education', 'Exports (GST-free)'],
      isReverseChargeApplicable: false,
    },
    corporateTax: {
      rate: 25,
      reducedRates: null,
      specialRegimes: ['Base rate entities (<50M turnover): 25%'],
      taxLossCarryForward: 15,
    },
    incomeTax: {
      type: 'progressive',
      flatRate: null,
      brackets: [
        { from: 0, to: 18200, rate: 0 },
        { from: 18200, to: 45000, rate: 16 },
        { from: 45000, to: 120000, rate: 30 },
        { from: 120000, to: 180000, rate: 37 },
        { from: 180000, to: null, rate: 45 },
      ],
      taxFreeAllowance: 18200,
    },
    socialContributions: [
      { name: 'Superannuation', employeeRate: 0, employerRate: 11.5, cap: 270000 },
    ],
    withholdingTax: {
      dividends: 30,
      interest: 10,
      royalties: 30,
      notes: ['Franking credits reduce dividend WHT effectively'],
    },
    invoice: {
      mandatoryFields: [
        { field: 'invoiceNumber', label: 'Invoice Number', required: true },
        { field: 'invoiceDate', label: 'Invoice Date', required: true },
        { field: 'sellerName', label: 'Seller ABN', required: true },
        { field: 'buyerName', label: 'Buyer Details', required: true },
        { field: 'items', label: 'Line Items', required: true },
        { field: 'totalAmount', label: 'Total Amount (incl. GST)', required: true },
      ],
      eInvoicing: { system: 'Peppol / ATO', description: 'E-invoicing via Peppol network', mandatory: false, startDate: '', url: '' },
      fiscalization: 'Not applicable',
      retentionPeriod: '5 years',
      format: 'PDF / Peppol UBL XML',
      seriesPrefix: 'INV',
    },
    taxForms: [
      { code: 'BAS', name: 'BAS / GST Return', frequency: 'Monthly/Quarterly', description: 'Business Activity Statement', authority: 'ATO' },
      { code: 'Tax Return', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Corporate income tax return', authority: 'ATO' },
      { code: 'STP', name: 'Single Touch Payroll', frequency: 'Each pay event', description: 'Payroll reporting', authority: 'ATO' },
    ],
    payroll: {
      minimumWage: 24.10,
      minimumWageCurrency: 'AUD',
      payPeriod: 'Bi-weekly/Monthly',
      overtimeMultiplier: 1.5,
      standardWorkHours: 38,
      annualLeaveDays: 20,
      sickLeaveDays: 10,
      sickLeavePayPercent: 100,
      maternityLeaveWeeks: 12,
      maternityPayPercent: 0,
      pensionAge: { male: 67, female: 67 },
      noticePeriodDays: 28,
      probationPeriodDays: 90,
    },
  },

  // ===== SWITZERLAND =====
  {
    code: 'CH',
    name: 'Switzerland',
    flag: '🇨🇭',
    region: 'europe',
    currency: 'CHF',
    currencySymbol: 'CHF',
    language: 'German/French/Italian',
    vat: {
      standardRate: 8.1,
      reducedRates: [
        { rate: 2.6, description: 'Basic necessities' },
        { rate: 3.8, description: 'Hotels, accommodation' },
      ],
      registrationThreshold: 100000,
      exemptions: ['Healthcare', 'Education', 'Financial services'],
      isReverseChargeApplicable: true,
    },
    corporateTax: {
      rate: 14.9,
      reducedRates: null,
      specialRegimes: ['Cantonal/municipal taxes add ~11-21%', 'Patent box regime'],
      taxLossCarryForward: 7,
    },
    incomeTax: {
      type: 'progressive',
      flatRate: null,
      brackets: [
        { from: 0, to: 14500, rate: 0 },
        { from: 14500, to: 31600, rate: 0.77 },
        { from: 31600, to: 41400, rate: 0.88 },
        { from: 41400, to: 55200, rate: 2.64 },
        { from: 55200, to: 72500, rate: 2.97 },
        { from: 72500, to: 78100, rate: 5.94 },
        { from: 78100, to: 103600, rate: 6.6 },
        { from: 103600, to: 134600, rate: 8.8 },
        { from: 134600, to: 176000, rate: 11 },
        { from: 176000, to: 755200, rate: 13.2 },
        { from: 755200, to: null, rate: 11.5 },
      ],
      taxFreeAllowance: 14500,
    },
    socialContributions: [
      { name: 'AHV/IV (Pension)', employeeRate: 5.125, employerRate: 5.125, cap: 88200 },
      { name: 'ALV (Unemployment)', employeeRate: 0.7, employerRate: 1.1, cap: 148200 },
      { name: 'NBU', employeeRate: 0, employerRate: 0.03, cap: null },
    ],
    withholdingTax: {
      dividends: 35,
      interest: 35,
      royalties: 0,
      notes: ['Reduced under treaties; domestic WHT refundable for EU residents'],
    },
    invoice: {
      mandatoryFields: [
        { field: 'invoiceNumber', label: 'Invoice Number', required: true },
        { field: 'invoiceDate', label: 'Invoice Date', required: true },
        { field: 'sellerName', label: 'Seller Details (UID)', required: true },
        { field: 'buyerName', label: 'Buyer Details', required: true },
        { field: 'items', label: 'Line Items', required: true },
        { field: 'totalAmount', label: 'Total Amount', required: true },
      ],
      eInvoicing: { system: 'E-invoicing Switzerland', description: 'Swiss E-invoicing standard developing', mandatory: false, startDate: '', url: '' },
      fiscalization: 'Not applicable',
      retentionPeriod: '10 years',
      format: 'PDF / Swiss QR-bill',
      seriesPrefix: 'RE',
    },
    taxForms: [
      { code: 'MWST', name: 'VAT Return', frequency: 'Quarterly', description: 'Quarterly VAT return', authority: 'ESTV' },
      { code: 'Tax Return', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Federal/cantonal tax return', authority: 'Cantonal tax office' },
    ],
    payroll: {
      minimumWage: null,
      minimumWageCurrency: 'CHF',
      payPeriod: 'Monthly',
      overtimeMultiplier: 1.25,
      standardWorkHours: 42,
      annualLeaveDays: 20,
      sickLeaveDays: 180,
      sickLeavePayPercent: 80,
      maternityLeaveWeeks: 14,
      maternityPayPercent: 80,
      pensionAge: { male: 65, female: 64 },
      noticePeriodDays: 30,
      probationPeriodDays: 90,
    },
  },

  // ===== POLAND =====
  {
    code: 'PL',
    name: 'Poland',
    flag: '🇵🇱',
    region: 'europe',
    currency: 'PLN',
    currencySymbol: 'zł',
    language: 'Polish',
    vat: {
      standardRate: 23,
      reducedRates: [
        { rate: 8, description: 'Food, accommodation, books' },
        { rate: 5, description: 'Basic foodstuffs' },
        { rate: 0, description: 'Some intra-EU supplies' },
      ],
      registrationThreshold: 200000,
      exemptions: ['Exports', 'Financial services', 'Healthcare'],
      isReverseChargeApplicable: true,
    },
    corporateTax: {
      rate: 19,
      reducedRates: null,
      specialRegimes: ['Reduced 9% for revenue < 2M EUR', 'Estonian CIT option'],
      taxLossCarryForward: 5,
    },
    incomeTax: {
      type: 'progressive',
      flatRate: null,
      brackets: [
        { from: 0, to: 30000, rate: 0 },
        { from: 30000, to: 120000, rate: 12 },
        { from: 120000, to: null, rate: 32 },
      ],
      taxFreeAllowance: 30000,
    },
    socialContributions: [
      { name: 'ZUS (Social Security)', employeeRate: 13.71, employerRate: 20.48, cap: null },
      { name: 'Health Contribution', employeeRate: 9, employerRate: 0, cap: null },
    ],
    withholdingTax: {
      dividends: 19,
      interest: 20,
      royalties: 20,
      notes: ['Reduced under EU/treaty provisions'],
    },
    invoice: {
      mandatoryFields: [
        { field: 'invoiceNumber', label: 'Invoice Number', required: true },
        { field: 'invoiceDate', label: 'Invoice Date', required: true },
        { field: 'sellerName', label: 'Seller Details (NIP)', required: true },
        { field: 'buyerName', label: 'Buyer Details (NIP)', required: true },
        { field: 'items', label: 'Line Items', required: true },
        { field: 'totalAmount', label: 'Total Amount', required: true },
      ],
      eInvoicing: { system: 'KSeF', description: 'National e-invoicing system (Krajowy System e-Faktur)', mandatory: true, startDate: '2025 (planned)', url: 'https://ksef.mf.gov.pl' },
      fiscalization: 'Not applicable',
      retentionPeriod: '5 years',
      format: 'XML (KSeF) / FA XML',
      seriesPrefix: 'FV',
    },
    taxForms: [
      { code: 'JPK_V7', name: 'VAT Return', frequency: 'Monthly', description: 'Monthly VAT with SAF-T file', authority: 'KAS' },
      { code: 'CIT-8', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Corporate income tax return', authority: 'KAS' },
      { code: 'PIT-11', name: 'Employee Income', frequency: 'Annually', description: 'Employee annual income statement', authority: 'KAS' },
    ],
    payroll: {
      minimumWage: 4666,
      minimumWageCurrency: 'PLN',
      payPeriod: 'Monthly',
      overtimeMultiplier: 1.5,
      standardWorkHours: 40,
      annualLeaveDays: 20,
      sickLeaveDays: 182,
      sickLeavePayPercent: 80,
      maternityLeaveWeeks: 20,
      maternityPayPercent: 100,
      pensionAge: { male: 65, female: 60 },
      noticePeriodDays: 30,
      probationPeriodDays: 90,
    },
  },

  // ===== NETHERLANDS =====
  {
    code: 'NL',
    name: 'Netherlands',
    flag: '🇳🇱',
    region: 'europe',
    currency: 'EUR',
    currencySymbol: '€',
    language: 'Dutch',
    vat: {
      standardRate: 21,
      reducedRates: [
        { rate: 9, description: 'Food, medicine, books' },
      ],
      registrationThreshold: 20000,
      exemptions: ['Exports', 'Healthcare', 'Education', 'Financial services'],
      isReverseChargeApplicable: true,
    },
    corporateTax: {
      rate: 25.8,
      reducedRates: [
        { threshold: 200000, rate: 19 },
      ],
      specialRegimes: ['Innovation box: 9% on qualifying profits'],
      taxLossCarryForward: 6,
    },
    incomeTax: {
      type: 'progressive',
      flatRate: null,
      brackets: [
        { from: 0, to: 75518, rate: 36.93 },
        { from: 75518, to: null, rate: 49.5 },
      ],
      taxFreeAllowance: 0,
    },
    socialContributions: [
      { name: 'Pension (AOW)', employeeRate: 17.9, employerRate: 0, cap: 73212 },
      { name: 'Unemployment (WW)', employeeRate: 0, employerRate: 2.64, cap: 71228 },
      { name: 'Health (ZVW)', employeeRate: 6.57, employerRate: 6.57, cap: 71228 },
    ],
    withholdingTax: {
      dividends: 15,
      interest: 0,
      royalties: 0,
      notes: ['Low WHT regime; innovation box available'],
    },
    invoice: {
      mandatoryFields: [
        { field: 'invoiceNumber', label: 'Invoice Number', required: true },
        { field: 'invoiceDate', label: 'Invoice Date', required: true },
        { field: 'sellerName', label: 'Seller Details', required: true },
        { field: 'sellerVAT', label: 'Seller BTW Number', required: true },
        { field: 'buyerName', label: 'Buyer Details', required: true },
        { field: 'items', label: 'Line Items', required: true },
        { field: 'totalAmount', label: 'Total Amount', required: true },
      ],
      eInvoicing: { system: 'Peppol / Digikoppeling', description: 'Peppol-based e-invoicing', mandatory: false, startDate: '', url: '' },
      fiscalization: 'Not applicable',
      retentionPeriod: '7 years',
      format: 'PDF / UBL XML (Peppol)',
      seriesPrefix: 'FAC',
    },
    taxForms: [
      { code: 'IB01', name: 'VAT Return', frequency: 'Quarterly', description: 'Omzetbelasting aangifte', authority: 'Belastingdienst' },
      { code: 'CIT Return', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Vennootschapsbelasting', authority: 'Belastingdienst' },
      { code: 'Payroll Tax', name: 'Payroll Tax Return', frequency: 'Monthly', description: 'Loonheffingen', authority: 'Belastingdienst' },
    ],
    payroll: {
      minimumWage: 13.27,
      minimumWageCurrency: 'EUR',
      payPeriod: 'Monthly',
      overtimeMultiplier: 1.5,
      standardWorkHours: 40,
      annualLeaveDays: 20,
      sickLeaveDays: 104,
      sickLeavePayPercent: 70,
      maternityLeaveWeeks: 16,
      maternityPayPercent: 100,
      pensionAge: { male: 66, female: 66 },
      noticePeriodDays: 30,
      probationPeriodDays: 60,
    },
  },
]

// ============ UTILITY FUNCTIONS ============

export function getTaxLaw(countryCode: string): TaxLaw | undefined {
  return COUNTRY_TAX_LAWS.find(c => c.code === countryCode)
}

export function getCountriesByRegion(region: 'europe' | 'americas' | 'asia' | 'all'): TaxLaw[] {
  if (region === 'all') return COUNTRY_TAX_LAWS
  return COUNTRY_TAX_LAWS.filter(c => c.region === region)
}

export function searchCountries(query: string): TaxLaw[] {
  if (!query || query.trim() === '') return COUNTRY_TAX_LAWS
  const q = query.toLowerCase().trim()
  return COUNTRY_TAX_LAWS.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.code.toLowerCase().includes(q) ||
    c.currency.toLowerCase().includes(q)
  )
}

export function getInvoiceMandatoryFields(countryCode: string): InvoiceField[] {
  const law = getTaxLaw(countryCode)
  if (!law) return []
  return law.invoice.mandatoryFields
}

export function getTaxForms(countryCode: string): TaxForm[] {
  const law = getTaxLaw(countryCode)
  if (!law) return []
  return law.taxForms
}

// ============ CALCULATION FUNCTIONS ============

export function calculateVAT(amount: number, vatRate: number, mode: 'net' | 'gross'): { net: number; tax: number; gross: number } {
  if (mode === 'net') {
    const tax = amount * (vatRate / 100)
    return { net: amount, tax, gross: amount + tax }
  }
  // gross mode
  const net = amount / (1 + vatRate / 100)
  const tax = amount - net
  return { net, tax, gross: amount }
}

export function calculateIncomeTax(taxableBase: number, incomeTax: IncomeTaxInfo): { tax: number; effectiveRate: number } {
  if (incomeTax.type === 'flat' && incomeTax.flatRate !== null) {
    const tax = taxableBase * (incomeTax.flatRate / 100)
    return { tax, effectiveRate: incomeTax.flatRate }
  }

  let remaining = taxableBase
  let totalTax = 0

  for (const bracket of incomeTax.brackets) {
    if (remaining <= 0) break
    const upperLimit = bracket.to !== null ? bracket.to : remaining
    const taxableInBracket = Math.min(remaining, upperLimit - bracket.from + (bracket.from > 0 ? 0 : bracket.from))

    // Correct calculation: taxable in this bracket
    const range = bracket.to !== null ? bracket.to - bracket.from : remaining
    const actual = Math.min(remaining, range)
    totalTax += actual * (bracket.rate / 100)
    remaining -= actual
  }

  const effectiveRate = taxableBase > 0 ? (totalTax / taxableBase) * 100 : 0
  return { tax: totalTax, effectiveRate: Math.round(effectiveRate * 100) / 100 }
}

export function calculateEmployerCost(grossSalary: number, socialContributions: SocialContribution[]): {
  totalEmployeeContributions: number
  totalEmployerContributions: number
  employerCost: number
  breakdown: { name: string; employeeAmount: number; employerAmount: number }[]
} {
  const breakdown = socialContributions.map(sc => ({
    name: sc.name,
    employeeAmount: grossSalary * (sc.employeeRate / 100),
    employerAmount: grossSalary * (sc.employerRate / 100),
  }))

  const totalEmployeeContributions = breakdown.reduce((sum, b) => sum + b.employeeAmount, 0)
  const totalEmployerContributions = breakdown.reduce((sum, b) => sum + b.employerAmount, 0)
  const employerCost = grossSalary + totalEmployerContributions

  return { totalEmployeeContributions, totalEmployerContributions, employerCost, breakdown }
}

export function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    RSD: 'din', EUR: '€', USD: '$', GBP: '£', CHF: 'CHF', BAM: 'KM',
    HRK: 'kn', MKD: 'ден', BGN: 'лв', RON: 'lei', PLN: 'zł', CZK: 'Kč',
    HUF: 'Ft', SEK: 'kr', NOK: 'kr', DKK: 'kr', ISK: 'kr',
    TRY: '₺', UAH: '₴', GEL: '₾', RUB: '₽', CNY: '¥', JPY: '¥',
  }
  return symbols[currency] || currency
}
