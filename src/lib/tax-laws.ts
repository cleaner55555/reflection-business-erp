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
  region: 'europe' | 'americas' | 'asia' | 'africa' | 'oceania'
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

  // ===== PORTUGAL =====
  {
    code: 'PT',
    name: 'Portugal',
    flag: '🇵🇹',
    region: 'europe',
    currency: 'EUR',
    currencySymbol: '€',
    language: 'Portuguese',
    vat: {
      standardRate: 23,
      reducedRates: [
        { rate: 13, description: 'Some food, wine, hospitality (Azores/Madeira 12%)' },
        { rate: 6, description: 'Basic food, books, medicine' },
      ],
      registrationThreshold: 14350,
      exemptions: ['Medical care', 'Education', 'Financial services', 'Postal services'],
      isReverseChargeApplicable: true,
    },
    corporateTax: {
      rate: 21,
      reducedRates: [
        { threshold: 50000, rate: 17 },
      ],
      specialRegimes: ['Simplified regime for small businesses', 'Madeira free trade zone incentives'],
      taxLossCarryForward: 5,
    },
    incomeTax: {
      type: 'progressive',
      flatRate: null,
      brackets: [
        { from: 0, to: 7479, rate: 0 },
        { from: 7479, to: 11284, rate: 14.5 },
        { from: 11284, to: 15992, rate: 21 },
        { from: 15992, to: 20700, rate: 26.5 },
        { from: 20700, to: 26355, rate: 28.5 },
        { from: 26355, to: 38632, rate: 35 },
        { from: 38632, to: 50480, rate: 37 },
        { from: 50480, to: 78834, rate: 43.5 },
        { from: 78834, to: null, rate: 48 },
      ],
      taxFreeAllowance: 7479,
    },
    socialContributions: [
      { name: 'Social Security', employeeRate: 11, employerRate: 23.75, cap: null },
    ],
    withholdingTax: {
      dividends: 28,
      interest: 28,
      royalties: 15,
      notes: ['Participation exemption for dividends from qualifying EU companies'],
    },
    invoice: {
      mandatoryFields: [
        { field: 'invoiceNumber', label: 'Invoice Number', required: true },
        { field: 'invoiceDate', label: 'Invoice Date', required: true },
        { field: 'sellerName', label: 'Seller Details', required: true },
        { field: 'sellerNIF', label: 'Seller NIF', required: true },
        { field: 'buyerName', label: 'Buyer Details', required: true },
        { field: 'buyerNIF', label: 'Buyer NIF', required: true },
        { field: 'items', label: 'Line Items', required: true },
        { field: 'totalAmount', label: 'Total Amount', required: true },
        { field: 'taxBreakdown', label: 'Tax Breakdown', required: true },
      ],
      eInvoicing: { system: 'ATCUD / Comunicação de faturas', description: 'Mandatory SAF-T reporting, e-invoicing being phased in', mandatory: false, startDate: '', url: '' },
      fiscalization: 'Certified invoicing software required (SAF-T)',
      retentionPeriod: '10 years',
      format: 'PDF / XML (SAF-T)',
      seriesPrefix: 'FT',
    },
    taxForms: [
      { code: 'IVA', name: 'VAT Return', frequency: 'Monthly', description: 'Periodic VAT declaration', authority: 'Autoridade Tributária' },
      { code: 'Modelo 22', name: 'Corporate Tax Return', frequency: 'Annually', description: 'IRC - Imposto sobre o Rendimento das Pessoas Colectivas', authority: 'Autoridade Tributária' },
      { code: 'IRS', name: 'Personal Income Tax', frequency: 'Annually', description: 'Annual personal income tax return', authority: 'Autoridade Tributária' },
    ],
    payroll: {
      minimumWage: 820,
      minimumWageCurrency: 'EUR',
      payPeriod: 'Monthly',
      overtimeMultiplier: 1.5,
      standardWorkHours: 40,
      annualLeaveDays: 22,
      sickLeaveDays: 1095,
      sickLeavePayPercent: 70,
      maternityLeaveWeeks: 22,
      maternityPayPercent: 100,
      pensionAge: { male: 66, female: 66 },
      noticePeriodDays: 30,
      probationPeriodDays: 90,
    },
  },

  // ===== BELGIUM =====
  {
    code: 'BE',
    name: 'Belgium',
    flag: '🇧🇪',
    region: 'europe',
    currency: 'EUR',
    currencySymbol: '€',
    language: 'Dutch/French/German',
    vat: {
      standardRate: 21,
      reducedRates: [
        { rate: 12, description: 'Social housing, some food' },
        { rate: 6, description: 'Essential goods, books, newspapers, art' },
        { rate: 0, description: 'Newspapers, weekly magazines' },
      ],
      registrationThreshold: 25000,
      exemptions: ['Exports', 'Healthcare', 'Education', 'Financial services'],
      isReverseChargeApplicable: true,
    },
    corporateTax: {
      rate: 25,
      reducedRates: [
        { threshold: 100000, rate: 20 },
        { threshold: 395000, rate: 25 },
      ],
      specialRegimes: ['Innovation income deduction', 'Patent income deduction', 'Notional interest deduction'],
      taxLossCarryForward: 7,
    },
    incomeTax: {
      type: 'progressive',
      flatRate: null,
      brackets: [
        { from: 0, to: 9920, rate: 0 },
        { from: 9920, to: 14460, rate: 25 },
        { from: 14460, to: 23720, rate: 40 },
        { from: 23720, to: 40680, rate: 45 },
        { from: 40680, to: null, rate: 50 },
      ],
      taxFreeAllowance: 9920,
    },
    socialContributions: [
      { name: 'Pension', employeeRate: 7.35, employerRate: 8.86, cap: 62344 },
      { name: 'Health Insurance', employeeRate: 3.55, employerRate: 3.80, cap: null },
      { name: 'Unemployment', employeeRate: 2.07, employerRate: 1.69, cap: null },
      { name: 'Family Allowances', employeeRate: 0, employerRate: 7, cap: null },
      { name: 'Work Accident', employeeRate: 0, employerRate: 0.30, cap: null },
    ],
    withholdingTax: {
      dividends: 30,
      interest: 30,
      royalties: 15,
      notes: ['Participation exemption for qualifying dividends'],
    },
    invoice: {
      mandatoryFields: [
        { field: 'invoiceNumber', label: 'Invoice Number', required: true },
        { field: 'invoiceDate', label: 'Invoice Date', required: true },
        { field: 'sellerName', label: 'Seller Details', required: true },
        { field: 'sellerVAT', label: 'Seller VAT ID', required: true },
        { field: 'buyerName', label: 'Buyer Details', required: true },
        { field: 'items', label: 'Line Items', required: true },
        { field: 'taxBreakdown', label: 'Tax Breakdown', required: true },
        { field: 'totalAmount', label: 'Total Amount', required: true },
      ],
      eInvoicing: { system: 'Peppol / Mercurius', description: 'B2B e-invoicing via Peppol network', mandatory: false, startDate: '2026 (planned)', url: '' },
      fiscalization: 'Not applicable',
      retentionPeriod: '7 years',
      format: 'PDF / XML (Peppol UBL)',
      seriesPrefix: 'FAC',
    },
    taxForms: [
      { code: 'Periodieke Aangifte', name: 'VAT Return', frequency: 'Monthly/Quarterly', description: 'BTW aangifte', authority: 'FOD Financiën' },
      { code: 'Aangifte Vennootschapsbelasting', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Corporate income tax', authority: 'FOD Financiën' },
      { code: 'Personenbelasting', name: 'Personal Income Tax', frequency: 'Annually', description: 'Personal income tax return', authority: 'FOD Financiën' },
    ],
    payroll: {
      minimumWage: 1994.94,
      minimumWageCurrency: 'EUR',
      payPeriod: 'Monthly',
      overtimeMultiplier: 1.5,
      standardWorkHours: 38,
      annualLeaveDays: 20,
      sickLeaveDays: 365,
      sickLeavePayPercent: 100,
      maternityLeaveWeeks: 15,
      maternityPayPercent: 82,
      pensionAge: { male: 65, female: 65 },
      noticePeriodDays: 28,
      probationPeriodDays: 90,
    },
  },

  // ===== LUXEMBOURG =====
  {
    code: 'LU',
    name: 'Luxembourg',
    flag: '🇱🇺',
    region: 'europe',
    currency: 'EUR',
    currencySymbol: '€',
    language: 'Luxembourgish/French/German',
    vat: {
      standardRate: 17,
      reducedRates: [
        { rate: 14, description: 'Wine, some agriculture, domestic services' },
        { rate: 8, description: 'Some food, books, electricity' },
        { rate: 3, description: 'Food, medicine, books, newspapers' },
      ],
      registrationThreshold: 35000,
      exemptions: ['Exports', 'Healthcare', 'Education', 'Financial services'],
      isReverseChargeApplicable: true,
    },
    corporateTax: {
      rate: 24.88,
      reducedRates: [
        { threshold: 25000, rate: 15 },
        { threshold: 175000, rate: 17 },
      ],
      specialRegimes: ['IP regime (intellectual property)', 'Holding regime'],
      taxLossCarryForward: 7,
    },
    incomeTax: {
      type: 'progressive',
      flatRate: null,
      brackets: [
        { from: 0, to: 12815, rate: 0 },
        { from: 12816, to: 33154, rate: 8 },
        { from: 33155, to: 79365, rate: 14 },
        { from: 79366, to: 141498, rate: 22 },
        { from: 141499, to: 298583, rate: 30 },
        { from: 298584, to: null, rate: 38 },
      ],
      taxFreeAllowance: 12815,
    },
    socialContributions: [
      { name: 'Pension', employeeRate: 8, employerRate: 8, cap: 128154 },
      { name: 'Health Insurance', employeeRate: 2.8, employerRate: 2.8, cap: null },
      { name: 'Unemployment', employeeRate: 0.8, employerRate: 2.5, cap: 128154 },
      { name: 'Dependency Insurance', employeeRate: 1.4, employerRate: 1.4, cap: null },
    ],
    withholdingTax: {
      dividends: 15,
      interest: 0,
      royalties: 0,
      notes: ['No withholding tax on interest and royalties'],
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
      eInvoicing: { system: 'Peppol', description: 'B2G mandatory since 2024', mandatory: true, startDate: '2024', url: '' },
      fiscalization: 'Not applicable',
      retentionPeriod: '10 years',
      format: 'PDF / XML',
      seriesPrefix: 'FAC',
    },
    taxForms: [
      { code: 'VAT Return', name: 'VAT Return', frequency: 'Monthly/Quarterly', description: 'VAT declaration', authority: 'Administration de l\'enregistrement' },
      { code: 'Corporate Tax Return', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Impôt sur les sociétés', authority: 'Administration des contributions directes' },
    ],
    payroll: {
      minimumWage: 2321.33,
      minimumWageCurrency: 'EUR',
      payPeriod: 'Monthly',
      overtimeMultiplier: 1.5,
      standardWorkHours: 40,
      annualLeaveDays: 25,
      sickLeaveDays: 365,
      sickLeavePayPercent: 100,
      maternityLeaveWeeks: 20,
      maternityPayPercent: 100,
      pensionAge: { male: 65, female: 65 },
      noticePeriodDays: 30,
      probationPeriodDays: 90,
    },
  },

  // ===== IRELAND =====
  {
    code: 'IE',
    name: 'Ireland',
    flag: '🇮🇪',
    region: 'europe',
    currency: 'EUR',
    currencySymbol: '€',
    language: 'English/Irish',
    vat: {
      standardRate: 23,
      reducedRates: [
        { rate: 13.5, description: 'Domestic fuel, electricity, veterinary, agriculture' },
        { rate: 9, description: 'Hospitality, newspapers, printed matter' },
        { rate: 4.8, description: 'Agricultural livestock' },
        { rate: 0, description: 'Most food, children clothing, medicine, books' },
      ],
      registrationThreshold: 80000,
      exemptions: ['Exports', 'Financial services', 'Healthcare', 'Education'],
      isReverseChargeApplicable: true,
    },
    corporateTax: {
      rate: 25,
      reducedRates: null,
      specialRegimes: ['12.5% for trading income (qualifying)', 'Knowledge Development Box 6.25%'],
      taxLossCarryForward: 1,
    },
    incomeTax: {
      type: 'progressive',
      flatRate: null,
      brackets: [
        { from: 0, to: 42000, rate: 20 },
        { from: 42000, to: null, rate: 40 },
      ],
      taxFreeAllowance: 0,
    },
    socialContributions: [
      { name: 'PRSI (Social Insurance)', employeeRate: 4, employerRate: 11.05, cap: null },
      { name: 'USC (Universal Social Charge)', employeeRate: 4.5, employerRate: 0, cap: null },
    ],
    withholdingTax: {
      dividends: 25,
      interest: 20,
      royalties: 20,
      notes: ['Substantial participation exemption available'],
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
      eInvoicing: { system: 'Peppol', description: 'B2G mandatory, B2B voluntary', mandatory: false, startDate: '2025 (B2G)', url: '' },
      fiscalization: 'Not applicable',
      retentionPeriod: '6 years',
      format: 'PDF / XML (Peppol UBL)',
      seriesPrefix: 'INV',
    },
    taxForms: [
      { code: 'VAT3', name: 'VAT Return', frequency: 'Bi-monthly', description: 'VAT3 VAT return', authority: 'Revenue Commissioners' },
      { code: 'CT1', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Form CT1 Corporation Tax', authority: 'Revenue Commissioners' },
    ],
    payroll: {
      minimumWage: 12.70,
      minimumWageCurrency: 'EUR',
      payPeriod: 'Monthly',
      overtimeMultiplier: 1.25,
      standardWorkHours: 39,
      annualLeaveDays: 20,
      sickLeaveDays: 365,
      sickLeavePayPercent: 70,
      maternityLeaveWeeks: 42,
      maternityPayPercent: 70,
      pensionAge: { male: 66, female: 66 },
      noticePeriodDays: 14,
      probationPeriodDays: 90,
    },
  },

  // ===== CZECH REPUBLIC =====
  {
    code: 'CZ',
    name: 'Czech Republic',
    flag: '🇨🇿',
    region: 'europe',
    currency: 'CZK',
    currencySymbol: 'Kč',
    language: 'Czech',
    vat: {
      standardRate: 21,
      reducedRates: [
        { rate: 12, description: 'Food, books, newspapers, medicine, transport' },
      ],
      registrationThreshold: 2000000,
      exemptions: ['Exports', 'Healthcare', 'Education', 'Financial services'],
      isReverseChargeApplicable: true,
    },
    corporateTax: {
      rate: 21,
      reducedRates: null,
      specialRegimes: ['Reduced 5% for first 2 years of new companies', 'Investment incentives'],
      taxLossCarryForward: 5,
    },
    incomeTax: {
      type: 'flat',
      flatRate: 15,
      brackets: [
        { from: 0, to: 48 * 17360, rate: 15 },
        { from: 48 * 17360, to: null, rate: 23 },
      ],
      taxFreeAllowance: 27840,
    },
    socialContributions: [
      { name: 'Social Security', employeeRate: 6.5, employerRate: 21.5, cap: 1949280 },
      { name: 'Health Insurance', employeeRate: 4.5, employerRate: 9, cap: null },
    ],
    withholdingTax: {
      dividends: 15,
      interest: 15,
      royalties: 15,
      notes: ['EU Parent-Subsidiary directive exemption available'],
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
      eInvoicing: { system: 'Kontrolní hlášení / EET', description: 'Kontrolní hlášení mandatory since 2023, EET for retail', mandatory: true, startDate: '2023', url: '' },
      fiscalization: 'EET (Electronic Registration of Sales) for retail',
      retentionPeriod: '10 years',
      format: 'PDF / XML (Kontrovní hlášení)',
      seriesPrefix: 'FV',
    },
    taxForms: [
      { code: 'DPH', name: 'VAT Return', frequency: 'Monthly/Quarterly', description: 'Daňové přiznání k DPH', authority: 'Finanční úřad' },
      { code: 'DPH-3', name: 'Control Statement', frequency: 'Monthly', description: 'Kontrolní hlášení', authority: 'Finanční úřad' },
      { code: 'Silniční daň', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Přiznání k dani z příjmů právnických osob', authority: 'Finanční úřad' },
    ],
    payroll: {
      minimumWage: 18890,
      minimumWageCurrency: 'CZK',
      payPeriod: 'Monthly',
      overtimeMultiplier: 1.5,
      standardWorkHours: 40,
      annualLeaveDays: 20,
      sickLeaveDays: 365,
      sickLeavePayPercent: 60,
      maternityLeaveWeeks: 28,
      maternityPayPercent: 70,
      pensionAge: { male: 65, female: 63 },
      noticePeriodDays: 60,
      probationPeriodDays: 90,
    },
  },

  // ===== SLOVAKIA =====
  {
    code: 'SK',
    name: 'Slovakia',
    flag: '🇸🇰',
    region: 'europe',
    currency: 'EUR',
    currencySymbol: '€',
    language: 'Slovak',
    vat: {
      standardRate: 20,
      reducedRates: [
        { rate: 10, description: 'Medicine, books, some food' },
      ],
      registrationThreshold: 49000,
      exemptions: ['Exports', 'Healthcare', 'Education', 'Financial services'],
      isReverseChargeApplicable: true,
    },
    corporateTax: {
      rate: 21,
      reducedRates: null,
      specialRegimes: ['Reduced 15% for companies with revenue < EUR 100k'],
      taxLossCarryForward: 4,
    },
    incomeTax: {
      type: 'progressive',
      flatRate: null,
      brackets: [
        { from: 0, to: 49790, rate: 19 },
        { from: 49790, to: null, rate: 25 },
      ],
      taxFreeAllowance: 5648,
    },
    socialContributions: [
      { name: 'Social Insurance', employeeRate: 11.25, employerRate: 25.2, cap: 82408 },
      { name: 'Health Insurance', employeeRate: 4, employerRate: 10, cap: null },
      { name: 'Guarantee Insurance', employeeRate: 0.25, employerRate: 0.8, cap: null },
    ],
    withholdingTax: {
      dividends: 0,
      interest: 19,
      royalties: 19,
      notes: ['No withholding tax on dividends (as of 2024)'],
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
      eInvoicing: { system: 'Peppol / MFČR', description: 'E-invoicing being developed', mandatory: false, url: '' },
      fiscalization: 'E-kasa (electronic cash register) for retail',
      retentionPeriod: '10 years',
      format: 'PDF / XML',
      seriesPrefix: 'FV',
    },
    taxForms: [
      { code: 'DPH', name: 'VAT Return', frequency: 'Monthly', description: 'Daňové priznanie k DPH', authority: 'Finančné riaditeľstvo' },
      { code: 'Daňové priznanie', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Corporate income tax return', authority: 'Finančné riaditeľstvo' },
    ],
    payroll: {
      minimumWage: 700,
      minimumWageCurrency: 'EUR',
      payPeriod: 'Monthly',
      overtimeMultiplier: 1.5,
      standardWorkHours: 40,
      annualLeaveDays: 20,
      sickLeaveDays: 365,
      sickLeavePayPercent: 55,
      maternityLeaveWeeks: 34,
      maternityPayPercent: 75,
      pensionAge: { male: 64, female: 63 },
      noticePeriodDays: 30,
      probationPeriodDays: 90,
    },
  },

  // ===== HUNGARY =====
  {
    code: 'HU',
    name: 'Hungary',
    flag: '🇭🇺',
    region: 'europe',
    currency: 'HUF',
    currencySymbol: 'Ft',
    language: 'Hungarian',
    vat: {
      standardRate: 27,
      reducedRates: [
        { rate: 18, description: 'Dairy, bakery products, hotel accommodation' },
        { rate: 5, description: 'Basic food, books, medicine, domestic heating' },
      ],
      registrationThreshold: 12000000,
      exemptions: ['Exports', 'Healthcare', 'Education', 'Financial services'],
      isReverseChargeApplicable: true,
    },
    corporateTax: {
      rate: 9,
      reducedRates: null,
      specialRegimes: ['Lowest CIT in EU'],
      taxLossCarryForward: 5,
    },
    incomeTax: {
      type: 'flat',
      flatRate: 15,
      brackets: [
        { from: 0, to: null, rate: 15 },
      ],
      taxFreeAllowance: 0,
    },
    socialContributions: [
      { name: 'Social Contribution Tax (SZOCHO)', employeeRate: 0, employerRate: 13, cap: null },
      { name: 'Pension', employeeRate: 10, employerRate: 0, cap: null },
      { name: 'Health Care', employeeRate: 7, employerRate: 0, cap: null },
      { name: 'Vocational Training', employeeRate: 1.5, employerRate: 0, cap: null },
    ],
    withholdingTax: {
      dividends: 15,
      interest: 0,
      royalties: 0,
      notes: ['No WHT on interest and royalties under EU law'],
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
      eInvoicing: { system: 'RTIR (Real-Time Invoice Reporting)', description: 'Real-time invoice reporting to NAV since 2018', mandatory: true, startDate: '2018', url: 'https://onlineszamla.nav.gov.hu' },
      fiscalization: 'Online invoice reporting to NAV (RTIR)',
      retentionPeriod: '8 years',
      format: 'XML (RTIR 2.0)',
      seriesPrefix: 'SZÁM',
    },
    taxForms: [
      { code: 'ÁFA', name: 'VAT Return', frequency: 'Monthly/Quarterly', description: 'Áfa-bevallás', authority: 'NAV (Nemzeti Adó- és Vámhivatal)' },
      { code: 'Tao', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Társasági adó bevallás', authority: 'NAV' },
    ],
    payroll: {
      minimumWage: 266800,
      minimumWageCurrency: 'HUF',
      payPeriod: 'Monthly',
      overtimeMultiplier: 1.5,
      standardWorkHours: 40,
      annualLeaveDays: 20,
      sickLeaveDays: 365,
      sickLeavePayPercent: 70,
      maternityLeaveWeeks: 24,
      maternityPayPercent: 70,
      pensionAge: { male: 65, female: 65 },
      noticePeriodDays: 30,
      probationPeriodDays: 90,
    },
  },

  // ===== ROMANIA =====
  {
    code: 'RO',
    name: 'Romania',
    flag: '🇷🇴',
    region: 'europe',
    currency: 'RON',
    currencySymbol: 'lei',
    language: 'Romanian',
    vat: {
      standardRate: 19,
      reducedRates: [
        { rate: 9, description: 'Food, medicine, books, hotel accommodation' },
        { rate: 5, description: 'Newspapers, textbooks' },
      ],
      registrationThreshold: 300000,
      exemptions: ['Exports', 'Healthcare', 'Education', 'Financial services'],
      isReverseChargeApplicable: true,
    },
    corporateTax: {
      rate: 16,
      reducedRates: null,
      specialRegimes: ['Microenterprise tax: 1-3% on revenue', 'IT/CAD workers exempt from CIT (10% income tax only)'],
      taxLossCarryForward: 7,
    },
    incomeTax: {
      type: 'flat',
      flatRate: 10,
      brackets: [
        { from: 0, to: null, rate: 10 },
      ],
      taxFreeAllowance: 0,
    },
    socialContributions: [
      { name: 'Pension (CAS)', employeeRate: 15, employerRate: 15.8, cap: 60480 },
      { name: 'Health (CASS)', employeeRate: 6.25, employerRate: 5.2, cap: null },
      { name: 'Unemployment (CAM)', employeeRate: 0.5, employerRate: 0.25, cap: null },
      { name: 'Work Insurance', employeeRate: 0, employerRate: 0.25, cap: null },
    ],
    withholdingTax: {
      dividends: 8,
      interest: 10,
      royalties: 10,
      notes: ['Reduced rates under EU treaties'],
    },
    invoice: {
      mandatoryFields: [
        { field: 'invoiceNumber', label: 'Invoice Number', required: true },
        { field: 'invoiceDate', label: 'Invoice Date', required: true },
        { field: 'sellerName', label: 'Seller Details', required: true },
        { field: 'sellerCUI', label: 'Seller CUI (Tax ID)', required: true },
        { field: 'buyerName', label: 'Buyer Details', required: true },
        { field: 'items', label: 'Line Items', required: true },
        { field: 'totalAmount', label: 'Total Amount', required: true },
      ],
      eInvoicing: { system: 'RO e-Factura (SPV)', description: 'Mandatory B2B e-invoicing via ANAF platform since 2024', mandatory: true, startDate: '2024', url: 'https://efactura.ro' },
      fiscalization: 'Not applicable (e-invoicing is mandatory)',
      retentionPeriod: '10 years',
      format: 'XML (RO e-Factura / UBL)',
      seriesPrefix: 'FAC',
    },
    taxForms: [
      { code: 'D300 / D390', name: 'VAT Return', frequency: 'Monthly', description: 'Decontare TVA', authority: 'ANAF' },
      { code: 'D100', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Declarație informativă', authority: 'ANAF' },
    ],
    payroll: {
      minimumWage: 3700,
      minimumWageCurrency: 'RON',
      payPeriod: 'Monthly',
      overtimeMultiplier: 1.5,
      standardWorkHours: 40,
      annualLeaveDays: 20,
      sickLeaveDays: 183,
      sickLeavePayPercent: 75,
      maternityLeaveWeeks: 17,
      maternityPayPercent: 85,
      pensionAge: { male: 65, female: 63 },
      noticePeriodDays: 20,
      probationPeriodDays: 90,
    },
  },

  // ===== BULGARIA =====
  {
    code: 'BG',
    name: 'Bulgaria',
    flag: '🇧🇬',
    region: 'europe',
    currency: 'BGN',
    currencySymbol: 'лв',
    language: 'Bulgarian',
    vat: {
      standardRate: 20,
      reducedRates: [
        { rate: 9, description: 'Hotels, tour operator services, books' },
      ],
      registrationThreshold: 100000,
      exemptions: ['Exports', 'Healthcare', 'Education', 'Financial services'],
      isReverseChargeApplicable: true,
    },
    corporateTax: {
      rate: 10,
      reducedRates: null,
      specialRegimes: ['One of lowest CIT rates in EU'],
      taxLossCarryForward: 5,
    },
    incomeTax: {
      type: 'flat',
      flatRate: 10,
      brackets: [
        { from: 0, to: null, rate: 10 },
      ],
      taxFreeAllowance: 0,
    },
    socialContributions: [
      { name: 'Pension (DFZ)', employeeRate: 7.8, employerRate: 10.57, cap: 3400 },
      { name: 'Health (NZOK)', employeeRate: 3.2, employerRate: 4.1, cap: 3400 },
      { name: 'Unemployment', employeeRate: 0.4, employerRate: 0.6, cap: 3400 },
      { name: 'Work Accident', employeeRate: 0, employerRate: 0.4, cap: 3400 },
    ],
    withholdingTax: {
      dividends: 5,
      interest: 10,
      royalties: 10,
      notes: ['EU Parent-Subsidiary directive applies'],
    },
    invoice: {
      mandatoryFields: [
        { field: 'invoiceNumber', label: 'Invoice Number', required: true },
        { field: 'invoiceDate', label: 'Invoice Date', required: true },
        { field: 'sellerName', label: 'Seller Details', required: true },
        { field: 'sellerVAT', label: 'Seller VAT / EIK', required: true },
        { field: 'buyerName', label: 'Buyer Details', required: true },
        { field: 'items', label: 'Line Items', required: true },
        { field: 'totalAmount', label: 'Total Amount', required: true },
      ],
      eInvoicing: { system: 'BIS / NRA', description: 'E-invoicing planned, e-reporting mandatory', mandatory: false, startDate: '2025 (planned)', url: '' },
      fiscalization: 'NRA certified POS for retail',
      retentionPeriod: '10 years',
      format: 'PDF / XML',
      seriesPrefix: 'ФАК',
    },
    taxForms: [
      { code: 'ДДС', name: 'VAT Return', frequency: 'Monthly', description: 'Декларация по ДДС', authority: 'НАП' },
      { code: 'ГДП', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Годишен данъчен отчет', authority: 'НАП' },
    ],
    payroll: {
      minimumWage: 933,
      minimumWageCurrency: 'BGN',
      payPeriod: 'Monthly',
      overtimeMultiplier: 1.5,
      standardWorkHours: 40,
      annualLeaveDays: 20,
      sickLeaveDays: 365,
      sickLeavePayPercent: 80,
      maternityLeaveWeeks: 58,
      maternityPayPercent: 90,
      pensionAge: { male: 64, female: 61 },
      noticePeriodDays: 30,
      probationPeriodDays: 90,
    },
  },

  // ===== ALBANIA =====
  {
    code: 'AL',
    name: 'Albania',
    flag: '🇦🇱',
    region: 'europe',
    currency: 'ALL',
    currencySymbol: 'L',
    language: 'Albanian',
    vat: {
      standardRate: 20,
      reducedRates: [
        { rate: 6, description: 'Medicine, medical equipment, books' },
      ],
      registrationThreshold: 10000000,
      exemptions: ['Financial services', 'Insurance', 'Education', 'Healthcare'],
      isReverseChargeApplicable: true,
    },
    corporateTax: {
      rate: 15,
      reducedRates: null,
      specialRegimes: ['Reduced 5% for companies in technology parks', 'Tax holidays for strategic investments'],
      taxLossCarryForward: 3,
    },
    incomeTax: {
      type: 'progressive',
      flatRate: null,
      brackets: [
        { from: 0, to: 30000, rate: 0 },
        { from: 30000, to: 120000, rate: 13 },
        { from: 120000, to: null, rate: 23 },
      ],
      taxFreeAllowance: 30000,
    },
    socialContributions: [
      { name: 'Pension & Health', employeeRate: 9, employerRate: 15, cap: null },
      { name: 'Unemployment', employeeRate: 0.5, employerRate: 1, cap: null },
      { name: 'Work Insurance', employeeRate: 0, employerRate: 0.5, cap: null },
    ],
    withholdingTax: {
      dividends: 15,
      interest: 15,
      royalties: 15,
      notes: ['Reduced rates under double tax treaties'],
    },
    invoice: {
      mandatoryFields: [
        { field: 'invoiceNumber', label: 'Invoice Number', required: true },
        { field: 'invoiceDate', label: 'Invoice Date', required: true },
        { field: 'sellerName', label: 'Seller Details', required: true },
        { field: 'sellerNIPT', label: 'Seller NIPT (Tax ID)', required: true },
        { field: 'buyerName', label: 'Buyer Details', required: true },
        { field: 'items', label: 'Line Items', required: true },
        { field: 'totalAmount', label: 'Total Amount', required: true },
      ],
      eInvoicing: { system: 'None', description: 'E-invoicing being developed', mandatory: false, url: '' },
      fiscalization: 'Fiscal cash register required for retail',
      retentionPeriod: '10 years',
      format: 'PDF',
      seriesPrefix: 'FAT',
    },
    taxForms: [
      { code: 'TVSH', name: 'VAT Return', frequency: 'Monthly', description: 'TVSH (Taxa mbi Vlerën e Shtuar)', authority: ' Tatimi i Përgjithshëm i Taksave' },
      { code: 'TVSH-deklarim', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Corporate income tax', authority: 'Tatimi i Përgjithshëm i Taksave' },
    ],
    payroll: {
      minimumWage: 40000,
      minimumWageCurrency: 'ALL',
      payPeriod: 'Monthly',
      overtimeMultiplier: 1.5,
      standardWorkHours: 40,
      annualLeaveDays: 20,
      sickLeaveDays: 365,
      sickLeavePayPercent: 70,
      maternityLeaveWeeks: 52,
      maternityPayPercent: 80,
      pensionAge: { male: 65, female: 61 },
      noticePeriodDays: 30,
      probationPeriodDays: 90,
    },
  },

  // ===== RUSSIA =====
  {
    code: 'RU',
    name: 'Russia',
    flag: '🇷🇺',
    region: 'europe',
    currency: 'RUB',
    currencySymbol: '₽',
    language: 'Russian',
    vat: {
      standardRate: 20,
      reducedRates: [
        { rate: 10, description: 'Food, children goods, medicine, books' },
      ],
      registrationThreshold: 2000000,
      exemptions: ['Exports', 'Financial services', 'Healthcare', 'Education'],
      isReverseChargeApplicable: true,
    },
    corporateTax: {
      rate: 20,
      reducedRates: null,
      specialRegimes: ['Simplified regime (6% revenue / 15% profit)', 'Free trade zone incentives'],
      taxLossCarryForward: 10,
    },
    incomeTax: {
      type: 'flat',
      flatRate: 13,
      brackets: [
        { from: 0, to: 2400000, rate: 13 },
        { from: 2400000, to: 5000000, rate: 15 },
        { from: 5000000, to: 20000000, rate: 18 },
        { from: 20000000, to: 50000000, rate: 20 },
        { from: 50000000, to: null, rate: 22 },
      ],
      taxFreeAllowance: 0,
    },
    socialContributions: [
      { name: 'Pension', employeeRate: 22, employerRate: 22, cap: 1917000 },
      { name: 'Social Insurance', employeeRate: 0, employerRate: 2.9, cap: 1917000 },
      { name: 'Medical Insurance', employeeRate: 5.1, employerRate: 5.1, cap: 1917000 },
    ],
    withholdingTax: {
      dividends: 15,
      interest: 20,
      royalties: 20,
      notes: ['Reduced under double tax treaties'],
    },
    invoice: {
      mandatoryFields: [
        { field: 'invoiceNumber', label: 'Invoice Number', required: true },
        { field: 'invoiceDate', label: 'Invoice Date', required: true },
        { field: 'sellerName', label: 'Seller Details', required: true },
        { field: 'sellerINN', label: 'Seller INN', required: true },
        { field: 'buyerName', label: 'Buyer Details', required: true },
        { field: 'buyerINN', label: 'Buyer INN', required: true },
        { field: 'items', label: 'Line Items', required: true },
        { field: 'totalAmount', label: 'Total Amount', required: true },
      ],
      eInvoicing: { system: 'EDO (ЭДО)', description: 'Electronic document management widely adopted, mandatory for government contracts', mandatory: false, startDate: '', url: '' },
      fiscalization: 'OFD/KKT (online cash register) required for retail',
      retentionPeriod: '5 years',
      format: 'PDF / XML (УПД, СЧФДОП)',
      seriesPrefix: 'СФ',
    },
    taxForms: [
      { code: 'Декларация НДС', name: 'VAT Return', frequency: 'Quarterly', description: 'НДС декларация', authority: 'ФНС' },
      { code: 'Декларация по налогу на прибыль', name: 'Corporate Tax Return', frequency: 'Quarterly', description: 'Corporate income tax', authority: 'ФНС' },
    ],
    payroll: {
      minimumWage: 22440,
      minimumWageCurrency: 'RUB',
      payPeriod: 'Monthly',
      overtimeMultiplier: 1.5,
      standardWorkHours: 40,
      annualLeaveDays: 28,
      sickLeaveDays: 365,
      sickLeavePayPercent: 60,
      maternityLeaveWeeks: 20,
      maternityPayPercent: 100,
      pensionAge: { male: 65, female: 60 },
      noticePeriodDays: 30,
      probationPeriodDays: 90,
    },
  },

  // ===== UKRAINE =====
  {
    code: 'UA',
    name: 'Ukraine',
    flag: '🇺🇦',
    region: 'europe',
    currency: 'UAH',
    currencySymbol: '₴',
    language: 'Ukrainian',
    vat: {
      standardRate: 20,
      reducedRates: [
        { rate: 7, description: 'Some medicines and medical devices' },
      ],
      registrationThreshold: 1000000,
      exemptions: ['Exports', 'Healthcare', 'Education', 'Financial services'],
      isReverseChargeApplicable: true,
    },
    corporateTax: {
      rate: 18,
      reducedRates: null,
      specialRegimes: ['Reduced for agriculture (income tax based on normative value of land)'],
      taxLossCarryForward: null,
    },
    incomeTax: {
      type: 'flat',
      flatRate: 18,
      brackets: [
        { from: 0, to: null, rate: 18 },
      ],
      taxFreeAllowance: 0,
    },
    socialContributions: [
      { name: 'ESV (Single Social Contribution)', employeeRate: 0, employerRate: 22, cap: 24470 },
    ],
    withholdingTax: {
      dividends: 0,
      interest: 0,
      royalties: 0,
      notes: ['No withholding tax on dividends, interest and royalties (reformed 2024)'],
    },
    invoice: {
      mandatoryFields: [
        { field: 'invoiceNumber', label: 'Invoice Number', required: true },
        { field: 'invoiceDate', label: 'Invoice Date', required: true },
        { field: 'sellerName', label: 'Seller Details', required: true },
        { field: 'sellerIPN', label: 'Seller IPN/TIN', required: true },
        { field: 'buyerName', label: 'Buyer Details', required: true },
        { field: 'items', label: 'Line Items', required: true },
        { field: 'totalAmount', label: 'Total Amount', required: true },
      ],
      eInvoicing: { system: 'Vchasno / PRRO', description: 'PRRO (program registrators) mandatory for retail; e-invoicing developing', mandatory: false, url: '' },
      fiscalization: 'PRRO (Program Registrators of Settlement Operations) for retail',
      retentionPeriod: '7 years',
      format: 'PDF / XML',
      seriesPrefix: 'НН',
    },
    taxForms: [
      { code: 'ПДВ', name: 'VAT Return', frequency: 'Monthly', description: 'Податкова декларація з ПДВ', authority: 'ДПС' },
      { code: 'Податкова декларація', name: 'Corporate Tax Return', frequency: 'Quarterly', description: 'Corporate income tax return', authority: 'ДПС' },
    ],
    payroll: {
      minimumWage: 8000,
      minimumWageCurrency: 'UAH',
      payPeriod: 'Monthly',
      overtimeMultiplier: 1.5,
      standardWorkHours: 40,
      annualLeaveDays: 24,
      sickLeaveDays: 365,
      sickLeavePayPercent: 50,
      maternityLeaveWeeks: 18,
      maternityPayPercent: 100,
      pensionAge: { male: 60, female: 60 },
      noticePeriodDays: 30,
      probationPeriodDays: 90,
    },
  },

  // ===== DENMARK =====
  {
    code: 'DK',
    name: 'Denmark',
    flag: '🇩🇰',
    region: 'europe',
    currency: 'DKK',
    currencySymbol: 'kr',
    language: 'Danish',
    vat: {
      standardRate: 25,
      reducedRates: [],
      registrationThreshold: 50000,
      exemptions: ['Exports', 'Healthcare', 'Education', 'Financial services'],
      isReverseChargeApplicable: true,
    },
    corporateTax: {
      rate: 22,
      reducedRates: null,
      specialRegimes: [],
      taxLossCarryForward: 20,
    },
    incomeTax: {
      type: 'progressive',
      flatRate: null,
      brackets: [
        { from: 0, to: 58800, rate: 0 },
        { from: 58801, to: 544800, rate: 8 },
        { from: 544801, to: null, rate: 15 },
      ],
      taxFreeAllowance: 58800,
    },
    socialContributions: [
      { name: 'AM-bidrag (Labor Market)', employeeRate: 8, employerRate: 0, cap: null },
      { name: 'ATP (Supplementary Pension)', employeeRate: 0, employerRate: 2.3, cap: null },
      { name: 'AUB (Unemployment Insurance)', employeeRate: 2.0, employerRate: 1.23, cap: null },
    ],
    withholdingTax: {
      dividends: 27,
      interest: 0,
      royalties: 0,
      notes: ['No WHT on interest and royalties; 15% under EU treaties'],
    },
    invoice: {
      mandatoryFields: [
        { field: 'invoiceNumber', label: 'Invoice Number', required: true },
        { field: 'invoiceDate', label: 'Invoice Date', required: true },
        { field: 'sellerName', label: 'Seller Details', required: true },
        { field: 'sellerVAT', label: 'Seller VAT ID / CVR', required: true },
        { field: 'buyerName', label: 'Buyer Details', required: true },
        { field: 'items', label: 'Line Items', required: true },
        { field: 'totalAmount', label: 'Total Amount', required: true },
      ],
      eInvoicing: { system: 'Nemhandel / Peppol', description: 'B2G mandatory since 2005, B2B voluntary', mandatory: false, url: '' },
      fiscalization: 'Not applicable',
      retentionPeriod: '5 years',
      format: 'PDF / OIOXML',
      seriesPrefix: 'FAK',
    },
    taxForms: [
      { code: 'Momsangivelse', name: 'VAT Return', frequency: 'Quarterly/6-monthly', description: 'Moms return', authority: 'Skattestyrelsen' },
      { code: 'Selskabsindkomstskat', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Corporate income tax', authority: 'Skattestyrelsen' },
    ],
    payroll: {
      minimumWage: null,
      minimumWageCurrency: 'DKK',
      payPeriod: 'Monthly',
      overtimeMultiplier: 1.5,
      standardWorkHours: 37,
      annualLeaveDays: 25,
      sickLeaveDays: 365,
      sickLeavePayPercent: 100,
      maternityLeaveWeeks: 18,
      maternityPayPercent: 100,
      pensionAge: { male: 67, female: 67 },
      noticePeriodDays: 30,
      probationPeriodDays: 90,
    },
  },

  // ===== SWEDEN =====
  {
    code: 'SE',
    name: 'Sweden',
    flag: '🇸🇪',
    region: 'europe',
    currency: 'SEK',
    currencySymbol: 'kr',
    language: 'Swedish',
    vat: {
      standardRate: 25,
      reducedRates: [
        { rate: 12, description: 'Food, restaurant, hotels, culture' },
        { rate: 6, description: 'Books, newspapers, public transport' },
      ],
      registrationThreshold: 80000,
      exemptions: ['Exports', 'Healthcare', 'Education', 'Financial services'],
      isReverseChargeApplicable: true,
    },
    corporateTax: {
      rate: 20.6,
      reducedRates: null,
      specialRegimes: [],
      taxLossCarryForward: 20,
    },
    incomeTax: {
      type: 'progressive',
      flatRate: null,
      brackets: [
        { from: 0, to: 23800, rate: 0 },
        { from: 23801, to: 54000, rate: 10 },
        { from: 54001, to: null, rate: 20 },
      ],
      taxFreeAllowance: 23800,
    },
    socialContributions: [
      { name: 'Employer Social Contributions', employeeRate: 7, employerRate: 31.42, cap: null },
    ],
    withholdingTax: {
      dividends: 30,
      interest: 0,
      royalties: 0,
      notes: ['Exemption under EU Parent-Subsidiary directive'],
    },
    invoice: {
      mandatoryFields: [
        { field: 'invoiceNumber', label: 'Invoice Number', required: true },
        { field: 'invoiceDate', label: 'Invoice Date', required: true },
        { field: 'sellerName', label: 'Seller Details', required: true },
        { field: 'sellerVAT', label: 'Seller VAT ID / Org.nr', required: true },
        { field: 'buyerName', label: 'Buyer Details', required: true },
        { field: 'items', label: 'Line Items', required: true },
        { field: 'totalAmount', label: 'Total Amount', required: true },
      ],
      eInvoicing: { system: 'Peppol / Visma Spcs', description: 'B2G mandatory, B2B widely adopted', mandatory: false, startDate: '2024 (B2G)', url: '' },
      fiscalization: 'Not applicable',
      retentionPeriod: '7 years',
      format: 'PDF / XML (Peppol BIS Billing 3)',
      seriesPrefix: 'FAK',
    },
    taxForms: [
      { code: 'Skattedeklaration', name: 'VAT Return', frequency: 'Monthly/Quarterly', description: 'Momsdeklaration', authority: 'Skatteverket' },
      { code: 'Inkomstdeklaration 2', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Corporate income tax', authority: 'Skatteverket' },
    ],
    payroll: {
      minimumWage: null,
      minimumWageCurrency: 'SEK',
      payPeriod: 'Monthly',
      overtimeMultiplier: 1.5,
      standardWorkHours: 40,
      annualLeaveDays: 25,
      sickLeaveDays: 365,
      sickLeavePayPercent: 80,
      maternityLeaveWeeks: 18,
      maternityPayPercent: 80,
      pensionAge: { male: 66, female: 66 },
      noticePeriodDays: 30,
      probationPeriodDays: 90,
    },
  },

  // ===== NORWAY =====
  {
    code: 'NO',
    name: 'Norway',
    flag: '🇳🇴',
    region: 'europe',
    currency: 'NOK',
    currencySymbol: 'kr',
    language: 'Norwegian',
    vat: {
      standardRate: 25,
      reducedRates: [
        { rate: 15, description: 'Food and beverages' },
        { rate: 12, description: 'Services (hotels, transport, culture)' },
      ],
      registrationThreshold: 140000,
      exemptions: ['Exports', 'Healthcare', 'Education', 'Financial services'],
      isReverseChargeApplicable: true,
    },
    corporateTax: {
      rate: 22,
      reducedRates: null,
      specialRegimes: [],
      taxLossCarryForward: 20,
    },
    incomeTax: {
      type: 'progressive',
      flatRate: null,
      brackets: [
        { from: 0, to: 208050, rate: 0 },
        { from: 208051, to: 296850, rate: 1.7 },
        { from: 296851, to: 670000, rate: 4.0 },
        { from: 670001, to: 937900, rate: 13.6 },
        { from: 937901, to: 1350000, rate: 16.6 },
        { from: 1350001, to: null, rate: 17.6 },
      ],
      taxFreeAllowance: 208050,
    },
    socialContributions: [
      { name: 'Social Security (Folketrygden)', employeeRate: 7.8, employerRate: 14.1, cap: null },
    ],
    withholdingTax: {
      dividends: 25,
      interest: 0,
      royalties: 0,
      notes: ['Exemption under EEA rules for qualifying companies'],
    },
    invoice: {
      mandatoryFields: [
        { field: 'invoiceNumber', label: 'Invoice Number', required: true },
        { field: 'invoiceDate', label: 'Invoice Date', required: true },
        { field: 'sellerName', label: 'Seller Details', required: true },
        { field: 'sellerOrgNo', label: 'Seller Organization Number', required: true },
        { field: 'buyerName', label: 'Buyer Details', required: true },
        { field: 'items', label: 'Line Items', required: true },
        { field: 'totalAmount', label: 'Total Amount', required: true },
      ],
      eInvoicing: { system: 'Peppol / ELMA', description: 'B2G mandatory since 2019, B2B widely used', mandatory: true, startDate: '2019', url: '' },
      fiscalization: 'Cash register regulations for retail (kassasystem)',
      retentionPeriod: '10 years',
      format: 'PDF / EHF (Peppol BIS)',
      seriesPrefix: 'FAK',
    },
    taxForms: [
      { code: 'Mva-melding', name: 'VAT Return', frequency: 'Bimonthly', description: 'Mva-omsetningsoppgave', authority: 'Skatteetaten' },
      { code: 'Skattemelding', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Corporate income tax', authority: 'Skatteetaten' },
    ],
    payroll: {
      minimumWage: null,
      minimumWageCurrency: 'NOK',
      payPeriod: 'Monthly',
      overtimeMultiplier: 1.5,
      standardWorkHours: 40,
      annualLeaveDays: 25,
      sickLeaveDays: 365,
      sickLeavePayPercent: 100,
      maternityLeaveWeeks: 15,
      maternityPayPercent: 100,
      pensionAge: { male: 67, female: 67 },
      noticePeriodDays: 30,
      probationPeriodDays: 90,
    },
  },

  // ===== FINLAND =====
  {
    code: 'FI',
    name: 'Finland',
    flag: '🇫🇮',
    region: 'europe',
    currency: 'EUR',
    currencySymbol: '€',
    language: 'Finnish/Swedish',
    vat: {
      standardRate: 25.5,
      reducedRates: [
        { rate: 14, description: 'Food, animal feed, restaurant services' },
        { rate: 10, description: 'Books, medicine, public transport, culture' },
      ],
      registrationThreshold: 15000,
      exemptions: ['Exports', 'Healthcare', 'Education', 'Financial services'],
      isReverseChargeApplicable: true,
    },
    corporateTax: {
      rate: 20,
      reducedRates: null,
      specialRegimes: [],
      taxLossCarryForward: 10,
    },
    incomeTax: {
      type: 'progressive',
      flatRate: null,
      brackets: [
        { from: 0, to: 19700, rate: 0 },
        { from: 19701, to: 30700, rate: 6 },
        { from: 30701, to: 46600, rate: 17.25 },
        { from: 46601, to: 84900, rate: 21.25 },
        { from: 84901, to: null, rate: 31.25 },
      ],
      taxFreeAllowance: 19700,
    },
    socialContributions: [
      { name: 'Employer Social Contributions', employeeRate: 8.55, employerRate: 19.25, cap: null },
    ],
    withholdingTax: {
      dividends: 30,
      interest: 0,
      royalties: 0,
      notes: ['Exemption under EU Parent-Subsidiary directive'],
    },
    invoice: {
      mandatoryFields: [
        { field: 'invoiceNumber', label: 'Invoice Number', required: true },
        { field: 'invoiceDate', label: 'Invoice Date', required: true },
        { field: 'sellerName', label: 'Seller Details', required: true },
        { field: 'sellerVAT', label: 'Seller VAT ID / Y-tunnus', required: true },
        { field: 'buyerName', label: 'Buyer Details', required: true },
        { field: 'items', label: 'Line Items', required: true },
        { field: 'totalAmount', label: 'Total Amount', required: true },
      ],
      eInvoicing: { system: 'Peppol / Finvoice', description: 'B2G mandatory since 2020, B2B widely adopted', mandatory: true, startDate: '2020', url: '' },
      fiscalization: 'Not applicable',
      retentionPeriod: '10 years',
      format: 'PDF / XML (Finvoice / Peppol)',
      seriesPrefix: 'LASKU',
    },
    taxForms: [
      { code: 'ALV-ilmoitus', name: 'VAT Return', frequency: 'Monthly', description: 'ALV-ilmoitus', authority: 'Vero' },
      { code: 'Yritysveroilmoitus', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Corporate income tax', authority: 'Vero' },
    ],
    payroll: {
      minimumWage: null,
      minimumWageCurrency: 'EUR',
      payPeriod: 'Monthly',
      overtimeMultiplier: 1.5,
      standardWorkHours: 40,
      annualLeaveDays: 25,
      sickLeaveDays: 365,
      sickLeavePayPercent: 70,
      maternityLeaveWeeks: 18,
      maternityPayPercent: 70,
      pensionAge: { male: 65, female: 65 },
      noticePeriodDays: 30,
      probationPeriodDays: 90,
    },
  },

  // ===== ESTONIA =====
  {
    code: 'EE',
    name: 'Estonia',
    flag: '🇪🇪',
    region: 'europe',
    currency: 'EUR',
    currencySymbol: '€',
    language: 'Estonian',
    vat: {
      standardRate: 22,
      reducedRates: [
        { rate: 12, description: 'Books, medicines, medical equipment' },
        { rate: 9, description: 'Some food, heating, hotel accommodation' },
      ],
      registrationThreshold: 40000,
      exemptions: ['Exports', 'Healthcare', 'Education', 'Financial services'],
      isReverseChargeApplicable: true,
    },
    corporateTax: {
      rate: 0,
      reducedRates: null,
      specialRegimes: ['CIT only on distributed profits (20%), not on retained earnings — unique system'],
      taxLossCarryForward: null,
    },
    incomeTax: {
      type: 'progressive',
      flatRate: null,
      brackets: [
        { from: 0, to: 7800, rate: 0 },
        { from: 7801, to: 14400, rate: 10 },
        { from: 14401, to: 25200, rate: 20 },
        { from: 25201, to: null, rate: 22 },
      ],
      taxFreeAllowance: 7800,
    },
    socialContributions: [
      { name: 'Social Tax', employeeRate: 2.0, employerRate: 33, cap: null },
      { name: 'Unemployment', employeeRate: 1.6, employerRate: 0.8, cap: null },
    ],
    withholdingTax: {
      dividends: 20,
      interest: 0,
      royalties: 10,
      notes: ['CIT applied when profits are distributed (20%)'],
    },
    invoice: {
      mandatoryFields: [
        { field: 'invoiceNumber', label: 'Invoice Number', required: true },
        { field: 'invoiceDate', label: 'Invoice Date', required: true },
        { field: 'sellerName', label: 'Seller Details', required: true },
        { field: 'sellerVAT', label: 'Seller VAT ID / KMKR', required: true },
        { field: 'buyerName', label: 'Buyer Details', required: true },
        { field: 'items', label: 'Line Items', required: true },
        { field: 'totalAmount', label: 'Total Amount', required: true },
      ],
      eInvoicing: { system: 'Peppol / e-Invoice', description: 'B2G mandatory since 2018, B2B widely used', mandatory: true, startDate: '2018', url: '' },
      fiscalization: 'Not applicable',
      retentionPeriod: '7 years',
      format: 'PDF / XML (Peppol / eInvoice)',
      seriesPrefix: 'ARVE',
    },
    taxForms: [
      { code: 'KM-OK', name: 'VAT Return', frequency: 'Monthly', description: 'Käibemaksudeklaratsioon', authority: 'Maksu- ja Tolliamet' },
      { code: 'Tulumaksudeklaratsioon', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Tulumaksudeklaratsioon', authority: 'Maksu- ja Tolliamet' },
    ],
    payroll: {
      minimumWage: 820,
      minimumWageCurrency: 'EUR',
      payPeriod: 'Monthly',
      overtimeMultiplier: 1.5,
      standardWorkHours: 40,
      annualLeaveDays: 28,
      sickLeaveDays: 365,
      sickLeavePayPercent: 70,
      maternityLeaveWeeks: 20,
      maternityPayPercent: 100,
      pensionAge: { male: 65, female: 65 },
      noticePeriodDays: 30,
      probationPeriodDays: 90,
    },
  },

  // ===== LATVIA =====
  {
    code: 'LV',
    name: 'Latvia',
    flag: '🇱🇻',
    region: 'europe',
    currency: 'EUR',
    currencySymbol: '€',
    language: 'Latvian',
    vat: {
      standardRate: 21,
      reducedRates: [
        { rate: 12, description: 'Medicine, medical equipment, heating' },
        { rate: 5, description: 'Books, newspapers, accommodation' },
      ],
      registrationThreshold: 40000,
      exemptions: ['Exports', 'Healthcare', 'Education', 'Financial services'],
      isReverseChargeApplicable: true,
    },
    corporateTax: {
      rate: 20,
      reducedRates: null,
      specialRegimes: ['Microenterprise tax (1-15% based on turnover)', 'Special economic zones'],
      taxLossCarryForward: 8,
    },
    incomeTax: {
      type: 'progressive',
      flatRate: null,
      brackets: [
        { from: 0, to: 20400, rate: 0 },
        { from: 20401, to: 78100, rate: 23 },
        { from: 78101, to: null, rate: 31 },
      ],
      taxFreeAllowance: 20400,
    },
    socialContributions: [
      { name: 'Social Security', employeeRate: 10.5, employerRate: 23.59, cap: 78000 },
      { name: 'Unemployment', employeeRate: 1, employerRate: 1.2, cap: 78000 },
    ],
    withholdingTax: {
      dividends: 0,
      interest: 10,
      royalties: 15,
      notes: ['No WHT on dividends (as of 2024)'],
    },
    invoice: {
      mandatoryFields: [
        { field: 'invoiceNumber', label: 'Invoice Number', required: true },
        { field: 'invoiceDate', label: 'Invoice Date', required: true },
        { field: 'sellerName', label: 'Seller Details', required: true },
        { field: 'sellerVAT', label: 'Seller VAT ID / PVN', required: true },
        { field: 'buyerName', label: 'Buyer Details', required: true },
        { field: 'items', label: 'Line Items', required: true },
        { field: 'totalAmount', label: 'Total Amount', required: true },
      ],
      eInvoicing: { system: 'E-invoice / Peppol', description: 'B2G mandatory since 2022', mandatory: true, startDate: '2022', url: '' },
      fiscalization: 'Not applicable',
      retentionPeriod: '10 years',
      format: 'PDF / XML (E-invoice)',
      seriesPrefix: 'RĒ',
    },
    taxForms: [
      { code: 'PVN deklarācija', name: 'VAT Return', frequency: 'Monthly', description: 'Pievienotās vērtības nodokļa deklarācija', authority: 'VID' },
      { code: 'Gada pārskats', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Corporate income tax', authority: 'VID' },
    ],
    payroll: {
      minimumWage: 700,
      minimumWageCurrency: 'EUR',
      payPeriod: 'Monthly',
      overtimeMultiplier: 1.5,
      standardWorkHours: 40,
      annualLeaveDays: 20,
      sickLeaveDays: 365,
      sickLeavePayPercent: 80,
      maternityLeaveWeeks: 16,
      maternityPayPercent: 80,
      pensionAge: { male: 65, female: 65 },
      noticePeriodDays: 30,
      probationPeriodDays: 90,
    },
  },

  // ===== LITHUANIA =====
  {
    code: 'LT',
    name: 'Lithuania',
    flag: '🇱🇹',
    region: 'europe',
    currency: 'EUR',
    currencySymbol: '€',
    language: 'Lithuanian',
    vat: {
      standardRate: 21,
      reducedRates: [
        { rate: 9, description: 'Medicine, books, newspapers, hotel accommodation' },
        { rate: 5, description: 'Some food, heating, agricultural supplies' },
      ],
      registrationThreshold: 45000,
      exemptions: ['Exports', 'Healthcare', 'Education', 'Financial services'],
      isReverseChargeApplicable: true,
    },
    corporateTax: {
      rate: 15,
      reducedRates: null,
      specialRegimes: ['Reduced 5% for small businesses (revenue < EUR 300k)', 'Free economic zones'],
      taxLossCarryForward: 10,
    },
    incomeTax: {
      type: 'progressive',
      flatRate: null,
      brackets: [
        { from: 0, to: 5560, rate: 0 },
        { from: 5561, to: 9260, rate: 20 },
        { from: 9261, to: 27780, rate: 32 },
        { from: 27781, to: null, rate: 36 },
      ],
      taxFreeAllowance: 5560,
    },
    socialContributions: [
      { name: 'Social Security (SODRA)', employeeRate: 6.98, employerRate: 19.5, cap: null },
      { name: 'Health Insurance', employeeRate: 6.98, employerRate: 3.98, cap: null },
      { name: 'Unemployment', employeeRate: 1.47, employerRate: 0.62, cap: null },
      { name: 'Guarantee Fund', employeeRate: 0, employerRate: 0.16, cap: null },
    ],
    withholdingTax: {
      dividends: 15,
      interest: 10,
      royalties: 10,
      notes: ['Reduced rates under EU treaties'],
    },
    invoice: {
      mandatoryFields: [
        { field: 'invoiceNumber', label: 'Invoice Number', required: true },
        { field: 'invoiceDate', label: 'Invoice Date', required: true },
        { field: 'sellerName', label: 'Seller Details', required: true },
        { field: 'sellerVAT', label: 'Seller VAT ID / PVM', required: true },
        { field: 'buyerName', label: 'Buyer Details', required: true },
        { field: 'items', label: 'Line Items', required: true },
        { field: 'totalAmount', label: 'Total Amount', required: true },
      ],
      eInvoicing: { system: 'E-invoice / Peppol', description: 'B2G mandatory, B2B widely used', mandatory: true, startDate: '2023', url: '' },
      fiscalization: 'Not applicable',
      retentionPeriod: '10 years',
      format: 'PDF / XML (E-invoice)',
      seriesPrefix: 'SĄSK',
    },
    taxForms: [
      { code: 'PVM deklaracija', name: 'VAT Return', frequency: 'Monthly', description: 'PVM mokėstininko deklaracija', authority: 'VMI' },
      { code: 'Grynųjų pajamų deklaracija', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Corporate income tax', authority: 'VMI' },
    ],
    payroll: {
      minimumWage: 924,
      minimumWageCurrency: 'EUR',
      payPeriod: 'Monthly',
      overtimeMultiplier: 1.5,
      standardWorkHours: 40,
      annualLeaveDays: 20,
      sickLeaveDays: 365,
      sickLeavePayPercent: 62,
      maternityLeaveWeeks: 18,
      maternityPayPercent: 78,
      pensionAge: { male: 65, female: 65 },
      noticePeriodDays: 30,
      probationPeriodDays: 90,
    },
  },

  // ===== ICELAND =====
  {
    code: 'IS',
    name: 'Iceland',
    flag: '🇮🇸',
    region: 'europe',
    currency: 'ISK',
    currencySymbol: 'kr',
    language: 'Icelandic',
    vat: {
      standardRate: 24,
      reducedRates: [
        { rate: 11, description: 'Food, books, newspapers, hotel accommodation' },
      ],
      registrationThreshold: 2000000,
      exemptions: ['Exports', 'Healthcare', 'Education', 'Financial services'],
      isReverseChargeApplicable: true,
    },
    corporateTax: {
      rate: 20,
      reducedRates: null,
      specialRegimes: [],
      taxLossCarryForward: 10,
    },
    incomeTax: {
      type: 'progressive',
      flatRate: null,
      brackets: [
        { from: 0, to: 518900, rate: 0 },
        { from: 518901, to: 1196700, rate: 31.45 },
        { from: 1196701, to: null, rate: 37.95 },
      ],
      taxFreeAllowance: 518900,
    },
    socialContributions: [
      { name: 'Social Security', employeeRate: 0, employerRate: 6.0, cap: null },
      { name: 'Pension Fund', employeeRate: 4, employerRate: 8, cap: null },
    ],
    withholdingTax: {
      dividends: 20,
      interest: 20,
      royalties: 0,
      notes: ['Reduced rates under EEA treaties'],
    },
    invoice: {
      mandatoryFields: [
        { field: 'invoiceNumber', label: 'Invoice Number', required: true },
        { field: 'invoiceDate', label: 'Invoice Date', required: true },
        { field: 'sellerName', label: 'Seller Details', required: true },
        { field: 'sellerVAT', label: 'Seller VAT ID / VSK', required: true },
        { field: 'buyerName', label: 'Buyer Details', required: true },
        { field: 'items', label: 'Line Items', required: true },
        { field: 'totalAmount', label: 'Total Amount', required: true },
      ],
      eInvoicing: { system: 'None', description: 'Not yet implemented', mandatory: false, url: '' },
      fiscalization: 'Not applicable',
      retentionPeriod: '7 years',
      format: 'PDF',
      seriesPrefix: 'REIK',
    },
    taxForms: [
      { code: 'VSK', name: 'VAT Return', frequency: 'Monthly', description: 'VSK skil', authority: 'Skatturinn' },
      { code: 'Skattframtal', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Corporate income tax', authority: 'Skatturinn' },
    ],
    payroll: {
      minimumWage: 466620,
      minimumWageCurrency: 'ISK',
      payPeriod: 'Monthly',
      overtimeMultiplier: 1.5,
      standardWorkHours: 40,
      annualLeaveDays: 24,
      sickLeaveDays: 365,
      sickLeavePayPercent: 100,
      maternityLeaveWeeks: 12,
      maternityPayPercent: 80,
      pensionAge: { male: 67, female: 67 },
      noticePeriodDays: 30,
      probationPeriodDays: 90,
    },
  },

  // ===== MALTA =====
  {
    code: 'MT',
    name: 'Malta',
    flag: '🇲🇹',
    region: 'europe',
    currency: 'EUR',
    currencySymbol: '€',
    language: 'Maltese/English',
    vat: {
      standardRate: 18,
      reducedRates: [
        { rate: 5, description: 'Food, medicine, books, accommodation' },
      ],
      registrationThreshold: 35000,
      exemptions: ['Exports', 'Healthcare', 'Education', 'Financial services'],
      isReverseChargeApplicable: true,
    },
    corporateTax: {
      rate: 35,
      reducedRates: null,
      specialRegimes: ['Full imputation system (shareholders get refund of tax paid)', 'Gaming companies 5%', 'IP box regime'],
      taxLossCarryForward: null,
    },
    incomeTax: {
      type: 'progressive',
      flatRate: null,
      brackets: [
        { from: 0, to: 10200, rate: 0 },
        { from: 10201, to: 31400, rate: 15 },
        { from: 31401, to: 60000, rate: 25 },
        { from: 60001, to: null, rate: 35 },
      ],
      taxFreeAllowance: 10200,
    },
    socialContributions: [
      { name: 'Social Security (NI)', employeeRate: 10, employerRate: 10, cap: null },
    ],
    withholdingTax: {
      dividends: 0,
      interest: 15,
      royalties: 0,
      notes: ['No WHT on dividends (full imputation system)'],
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
      eInvoicing: { system: 'None', description: 'Not yet implemented', mandatory: false, url: '' },
      fiscalization: 'Not applicable',
      retentionPeriod: '10 years',
      format: 'PDF',
      seriesPrefix: 'INV',
    },
    taxForms: [
      { code: 'VAT Return', name: 'VAT Return', frequency: 'Monthly', description: 'VAT declaration', authority: 'CIRD' },
      { code: 'Corporate Tax Return', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Corporate income tax', authority: 'CIRD' },
    ],
    payroll: {
      minimumWage: null,
      minimumWageCurrency: 'EUR',
      payPeriod: 'Monthly',
      overtimeMultiplier: 1.5,
      standardWorkHours: 40,
      annualLeaveDays: 25,
      sickLeaveDays: 365,
      sickLeavePayPercent: 100,
      maternityLeaveWeeks: 18,
      maternityPayPercent: 100,
      pensionAge: { male: 63, female: 63 },
      noticePeriodDays: 30,
      probationPeriodDays: 90,
    },
  },

  // ===== CYPRUS =====
  {
    code: 'CY',
    name: 'Cyprus',
    flag: '🇨🇾',
    region: 'europe',
    currency: 'EUR',
    currencySymbol: '€',
    language: 'Greek/Turkish',
    vat: {
      standardRate: 19,
      reducedRates: [
        { rate: 9, description: 'Food, medicine, books, hotel accommodation' },
        { rate: 5, description: 'Some basic goods and services' },
      ],
      registrationThreshold: 15600,
      exemptions: ['Exports', 'Healthcare', 'Education', 'Financial services'],
      isReverseChargeApplicable: true,
    },
    corporateTax: {
      rate: 12.5,
      reducedRates: null,
      specialRegimes: ['IP box regime 2.5% on qualifying IP income', 'Shipping companies exempt'],
      taxLossCarryForward: 5,
    },
    incomeTax: {
      type: 'progressive',
      flatRate: null,
      brackets: [
        { from: 0, to: 19500, rate: 0 },
        { from: 19501, to: 28000, rate: 20 },
        { from: 28001, to: 36300, rate: 25 },
        { from: 36301, to: 60000, rate: 30 },
        { from: 60001, to: null, rate: 35 },
      ],
      taxFreeAllowance: 19500,
    },
    socialContributions: [
      { name: 'Social Insurance', employeeRate: 8.3, employerRate: 8.3, cap: 62700 },
      { name: 'Health (GeSY)', employeeRate: 2.65, employerRate: 2.9, cap: null },
      { name: 'Redundancy Fund', employeeRate: 1.2, employerRate: 1.2, cap: null },
      { name: 'Social Cohesion Fund', employeeRate: 2.0, employerRate: 2.0, cap: null },
    ],
    withholdingTax: {
      dividends: 0,
      interest: 0,
      royalties: 0,
      notes: ['No WHT on dividends, interest and royalties (Cyprus non-dom regime)'],
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
      eInvoicing: { system: 'Ariadne / Peppol', description: 'Being developed', mandatory: false, url: '' },
      fiscalization: 'Not applicable',
      retentionPeriod: '7 years',
      format: 'PDF / XML',
      seriesPrefix: 'INV',
    },
    taxForms: [
      { code: 'VAT Return', name: 'VAT Return', frequency: 'Monthly/Bimonthly', description: 'VAT declaration', authority: 'Tax Department' },
      { code: 'Corporate Tax Return', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Corporate income tax', authority: 'Tax Department' },
    ],
    payroll: {
      minimumWage: null,
      minimumWageCurrency: 'EUR',
      payPeriod: 'Monthly',
      overtimeMultiplier: 1.5,
      standardWorkHours: 38,
      annualLeaveDays: 20,
      sickLeaveDays: 365,
      sickLeavePayPercent: 75,
      maternityLeaveWeeks: 18,
      maternityPayPercent: 72,
      pensionAge: { male: 65, female: 65 },
      noticePeriodDays: 30,
      probationPeriodDays: 90,
    },
  },

  // ===== BELARUS =====
  {
    code: 'BY',
    name: 'Belarus',
    flag: '🇧🇾',
    region: 'europe',
    currency: 'BYN',
    currencySymbol: 'Br',
    language: 'Belarusian/Russian',
    vat: {
      standardRate: 20,
      reducedRates: [
        { rate: 10, description: 'Food, children goods, medicine, books' },
      ],
      registrationThreshold: 60000,
      exemptions: ['Exports', 'Healthcare', 'Education', 'Financial services'],
      isReverseChargeApplicable: true,
    },
    corporateTax: {
      rate: 20,
      reducedRates: null,
      specialRegimes: ['Simplified system (5-10% on revenue)', 'IT Park residents 0-5%'],
      taxLossCarryForward: 10,
    },
    incomeTax: {
      type: 'progressive',
      flatRate: null,
      brackets: [
        { from: 0, to: 1560, rate: 9 },
        { from: 1560, to: 4680, rate: 13 },
        { from: 4680, to: null, rate: 13 },
      ],
      taxFreeAllowance: 1560,
    },
    socialContributions: [
      { name: 'Pension Fund', employeeRate: 0, employerRate: 28, cap: null },
    ],
    withholdingTax: {
      dividends: 13,
      interest: 0,
      royalties: 15,
      notes: ['Reduced under double tax treaties'],
    },
    invoice: {
      mandatoryFields: [
        { field: 'invoiceNumber', label: 'Invoice Number', required: true },
        { field: 'invoiceDate', label: 'Invoice Date', required: true },
        { field: 'sellerName', label: 'Seller Details', required: true },
        { field: 'sellerUNP', label: 'Seller UNP', required: true },
        { field: 'buyerName', label: 'Buyer Details', required: true },
        { field: 'items', label: 'Line Items', required: true },
        { field: 'totalAmount', label: 'Total Amount', required: true },
      ],
      eInvoicing: { system: 'None', description: 'Not yet implemented', mandatory: false, url: '' },
      fiscalization: 'Cash register required for retail',
      retentionPeriod: '5 years',
      format: 'PDF',
      seriesPrefix: 'СЧ',
    },
    taxForms: [
      { code: 'НДС', name: 'VAT Return', frequency: 'Monthly', description: 'НДС декларация', authority: 'МНС' },
      { code: 'Налог на прибыль', name: 'Corporate Tax Return', frequency: 'Quarterly', description: 'Corporate income tax', authority: 'МНС' },
    ],
    payroll: {
      minimumWage: 690,
      minimumWageCurrency: 'BYN',
      payPeriod: 'Monthly',
      overtimeMultiplier: 1.5,
      standardWorkHours: 40,
      annualLeaveDays: 24,
      sickLeaveDays: 365,
      sickLeavePayPercent: 80,
      maternityLeaveWeeks: 18,
      maternityPayPercent: 100,
      pensionAge: { male: 63, female: 58 },
      noticePeriodDays: 30,
      probationPeriodDays: 90,
    },
  },

  // ===== GEORGIA =====
  {
    code: 'GE',
    name: 'Georgia',
    flag: '🇬🇪',
    region: 'europe',
    currency: 'GEL',
    currencySymbol: '₾',
    language: 'Georgian',
    vat: {
      standardRate: 18,
      reducedRates: [],
      registrationThreshold: 100000,
      exemptions: ['Exports', 'Financial services', 'Healthcare', 'Education'],
      isReverseChargeApplicable: true,
    },
    corporateTax: {
      rate: 15,
      reducedRates: null,
      specialRegimes: ['Small business status (1-3% on turnover)', 'Free Industrial Zones — 0% CIT'],
      taxLossCarryForward: 5,
    },
    incomeTax: {
      type: 'flat',
      flatRate: 20,
      brackets: [
        { from: 0, to: null, rate: 20 },
      ],
      taxFreeAllowance: 0,
    },
    socialContributions: [
      { name: 'Pension', employeeRate: 2, employerRate: 2, cap: null },
    ],
    withholdingTax: {
      dividends: 0,
      interest: 5,
      royalties: 5,
      notes: ['No WHT on dividends (distributed profit tax applies)'],
    },
    invoice: {
      mandatoryFields: [
        { field: 'invoiceNumber', label: 'Invoice Number', required: true },
        { field: 'invoiceDate', label: 'Invoice Date', required: true },
        { field: 'sellerName', label: 'Seller Details', required: true },
        { field: 'sellerTIN', label: 'Seller TIN', required: true },
        { field: 'buyerName', label: 'Buyer Details', required: true },
        { field: 'items', label: 'Line Items', required: true },
        { field: 'totalAmount', label: 'Total Amount', required: true },
      ],
      eInvoicing: { system: 'None', description: 'Not yet implemented', mandatory: false, url: '' },
      fiscalization: 'Not applicable',
      retentionPeriod: '5 years',
      format: 'PDF',
      seriesPrefix: 'ინვ',
    },
    taxForms: [
      { code: 'დღვ', name: 'VAT Return', frequency: 'Monthly', description: 'დამატებითი მნიშვნელოვნების გადასახადი', authority: 'Revenue Service' },
      { code: 'მოგება', name: 'Corporate Tax Return', frequency: 'Annually', description: 'მოგების გადასახადი', authority: 'Revenue Service' },
    ],
    payroll: {
      minimumWage: null,
      minimumWageCurrency: 'GEL',
      payPeriod: 'Monthly',
      overtimeMultiplier: 1.5,
      standardWorkHours: 40,
      annualLeaveDays: 24,
      sickLeaveDays: 365,
      sickLeavePayPercent: 100,
      maternityLeaveWeeks: 18,
      maternityPayPercent: 100,
      pensionAge: { male: 65, female: 60 },
      noticePeriodDays: 30,
      probationPeriodDays: 90,
    },
  },

  // ===== MOLDOVA =====
  {
    code: 'MD',
    name: 'Moldova',
    flag: '🇲🇩',
    region: 'europe',
    currency: 'MDL',
    currencySymbol: 'L',
    language: 'Moldovan/Romanian',
    vat: {
      standardRate: 20,
      reducedRates: [
        { rate: 8, description: 'Medicine, medical equipment' },
      ],
      registrationThreshold: 1200000,
      exemptions: ['Exports', 'Healthcare', 'Education', 'Financial services'],
      isReverseChargeApplicable: true,
    },
    corporateTax: {
      rate: 12,
      reducedRates: null,
      specialRegimes: ['Reduced 3% for IT park residents', 'Tax incentives for Gagauzia and Transnistria'],
      taxLossCarryForward: 5,
    },
    incomeTax: {
      type: 'progressive',
      flatRate: null,
      brackets: [
        { from: 0, to: 36000, rate: 0 },
        { from: 36000, to: 60000, rate: 10 },
        { from: 60000, to: null, rate: 15 },
      ],
      taxFreeAllowance: 36000,
    },
    socialContributions: [
      { name: 'Social Security', employeeRate: 6, employerRate: 23.8, cap: null },
      { name: 'Health Insurance', employeeRate: 1.5, employerRate: 4.5, cap: null },
    ],
    withholdingTax: {
      dividends: 6,
      interest: 15,
      royalties: 15,
      notes: ['Reduced under double tax treaties'],
    },
    invoice: {
      mandatoryFields: [
        { field: 'invoiceNumber', label: 'Invoice Number', required: true },
        { field: 'invoiceDate', label: 'Invoice Date', required: true },
        { field: 'sellerName', label: 'Seller Details', required: true },
        { field: 'sellerIDNO', label: 'Seller IDNO', required: true },
        { field: 'buyerName', label: 'Buyer Details', required: true },
        { field: 'items', label: 'Line Items', required: true },
        { field: 'totalAmount', label: 'Total Amount', required: true },
      ],
      eInvoicing: { system: 'e-Factura', description: 'Pilot program, being developed', mandatory: false, url: '' },
      fiscalization: 'Cash register required for retail',
      retentionPeriod: '5 years',
      format: 'PDF',
      seriesPrefix: 'FAC',
    },
    taxForms: [
      { code: 'TVA', name: 'VAT Return', frequency: 'Monthly', description: 'Declarație TVA', authority: 'SFS' },
      { code: 'Impozit pe venit', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Corporate income tax', authority: 'SFS' },
    ],
    payroll: {
      minimumWage: 4500,
      minimumWageCurrency: 'MDL',
      payPeriod: 'Monthly',
      overtimeMultiplier: 1.5,
      standardWorkHours: 40,
      annualLeaveDays: 28,
      sickLeaveDays: 365,
      sickLeavePayPercent: 75,
      maternityLeaveWeeks: 18,
      maternityPayPercent: 100,
      pensionAge: { male: 63, female: 58 },
      noticePeriodDays: 30,
      probationPeriodDays: 90,
    },
  },

  // ===== ARMENIA =====
  {
    code: 'AM',
    name: 'Armenia',
    flag: '🇦🇲',
    region: 'europe',
    currency: 'AMD',
    currencySymbol: '֏',
    language: 'Armenian',
    vat: {
      standardRate: 20,
      reducedRates: [],
      registrationThreshold: 115000000,
      exemptions: ['Exports', 'Financial services', 'Healthcare', 'Education'],
      isReverseChargeApplicable: true,
    },
    corporateTax: {
      rate: 18,
      reducedRates: null,
      specialRegimes: ['Small business turnover tax (1-5%)', 'IT sector reduced rates', 'Free economic zones'],
      taxLossCarryForward: 5,
    },
    incomeTax: {
      type: 'progressive',
      flatRate: null,
      brackets: [
        { from: 0, to: 120000, rate: 0 },
        { from: 120000, to: 500000, rate: 15 },
        { from: 500000, to: 1500000, rate: 20 },
        { from: 1500000, to: 3500000, rate: 23 },
        { from: 3500000, to: null, rate: 36 },
      ],
      taxFreeAllowance: 120000,
    },
    socialContributions: [
      { name: 'Social Security', employeeRate: 2.5, employerRate: 5, cap: null },
    ],
    withholdingTax: {
      dividends: 5,
      interest: 5,
      royalties: 10,
      notes: ['Reduced under double tax treaties'],
    },
    invoice: {
      mandatoryFields: [
        { field: 'invoiceNumber', label: 'Invoice Number', required: true },
        { field: 'invoiceDate', label: 'Invoice Date', required: true },
        { field: 'sellerName', label: 'Seller Details', required: true },
        { field: 'sellerTIN', label: 'Seller TIN', required: true },
        { field: 'buyerName', label: 'Buyer Details', required: true },
        { field: 'items', label: 'Line Items', required: true },
        { field: 'totalAmount', label: 'Total Amount', required: true },
      ],
      eInvoicing: { system: 'None', description: 'Not yet implemented', mandatory: false, url: '' },
      fiscalization: 'Cash register required for retail',
      retentionPeriod: '5 years',
      format: 'PDF',
      seriesPrefix: 'AY',
    },
    taxForms: [
      { code: 'ԱԱՀ', name: 'VAT Return', frequency: 'Monthly', description: 'Ավելավոր արժեքի հարկ', authority: 'ՀՆԱհ', },
      { code: 'Եկամտային հարկ', name: 'Corporate Tax Return', frequency: 'Quarterly', description: 'Corporate income tax', authority: 'ՀՆԱհ' },
    ],
    payroll: {
      minimumWage: 75000,
      minimumWageCurrency: 'AMD',
      payPeriod: 'Monthly',
      overtimeMultiplier: 1.5,
      standardWorkHours: 40,
      annualLeaveDays: 20,
      sickLeaveDays: 365,
      sickLeavePayPercent: 60,
      maternityLeaveWeeks: 18,
      maternityPayPercent: 100,
      pensionAge: { male: 65, female: 63 },
      noticePeriodDays: 30,
      probationPeriodDays: 90,
    },
  },

  // ===== AZERBAIJAN =====
  {
    code: 'AZ',
    name: 'Azerbaijan',
    flag: '🇦🇿',
    region: 'europe',
    currency: 'AZN',
    currencySymbol: '₼',
    language: 'Azerbaijani',
    vat: {
      standardRate: 18,
      reducedRates: [],
      registrationThreshold: 200000,
      exemptions: ['Exports', 'Financial services', 'Education'],
      isReverseChargeApplicable: false,
    },
    corporateTax: {
      rate: 20,
      reducedRates: null,
      specialRegimes: ['Tech park residents reduced rate', 'Industrial parks — 0% CIT for 10 years'],
      taxLossCarryForward: 5,
    },
    incomeTax: {
      type: 'progressive',
      flatRate: null,
      brackets: [
        { from: 0, to: 8000, rate: 0 },
        { from: 8000, to: 25000, rate: 14 },
        { from: 25000, to: 60000, rate: 25 },
        { from: 60000, to: 100000, rate: 30 },
        { from: 100000, to: null, rate: 35 },
      ],
      taxFreeAllowance: 8000,
    },
    socialContributions: [
      { name: 'Social Insurance', employeeRate: 3, employerRate: 20, cap: null },
      { name: 'Unemployment', employeeRate: 0.5, employerRate: 0.5, cap: null },
    ],
    withholdingTax: {
      dividends: 10,
      interest: 10,
      royalties: 14,
      notes: ['Reduced under double tax treaties'],
    },
    invoice: {
      mandatoryFields: [
        { field: 'invoiceNumber', label: 'Invoice Number', required: true },
        { field: 'invoiceDate', label: 'Invoice Date', required: true },
        { field: 'sellerName', label: 'Seller Details', required: true },
        { field: 'sellerTIN', label: 'Seller TIN / VÖEN', required: true },
        { field: 'buyerName', label: 'Buyer Details', required: true },
        { field: 'items', label: 'Line Items', required: true },
        { field: 'totalAmount', label: 'Total Amount', required: true },
      ],
      eInvoicing: { system: 'E-invoice', description: 'Pilot program for B2G', mandatory: false, url: '' },
      fiscalization: 'Cash register required for retail',
      retentionPeriod: '5 years',
      format: 'PDF',
      seriesPrefix: 'QƏ',
    },
    taxForms: [
      { code: 'ƏDV', name: 'VAT Return', frequency: 'Monthly', description: 'Əlavə dəyər vergisi', authority: 'VÖEN' },
      { code: 'Müəssisə vergisi', name: 'Corporate Tax Return', frequency: 'Quarterly', description: 'Corporate income tax', authority: 'VÖEN' },
    ],
    payroll: {
      minimumWage: 345,
      minimumWageCurrency: 'AZN',
      payPeriod: 'Monthly',
      overtimeMultiplier: 1.5,
      standardWorkHours: 40,
      annualLeaveDays: 21,
      sickLeaveDays: 365,
      sickLeavePayPercent: 60,
      maternityLeaveWeeks: 18,
      maternityPayPercent: 70,
      pensionAge: { male: 65, female: 60 },
      noticePeriodDays: 30,
      probationPeriodDays: 90,
    },
  },

  // ===== PAKISTAN =====
  {
    code: 'PK',
    name: 'Pakistan',
    flag: '🇵🇰',
    region: 'asia',
    currency: 'PKR',
    currencySymbol: 'Rs',
    language: 'Urdu/English',
    vat: { standardRate: 18, reducedRates: [], registrationThreshold: 4000000, exemptions: ['Exports', 'Healthcare', 'Education', 'Financial services'], isReverseChargeApplicable: true },
    corporateTax: { rate: 29, reducedRates: [{ threshold: 80000000, rate: 20 }, { threshold: 400000000, rate: 29 }, { threshold: 800000000, rate: 35 }], specialRegimes: ['Reduced for small companies', 'Tax incentives for IT sector'], taxLossCarryForward: 6 },
    incomeTax: { type: 'progressive', flatRate: null, brackets: [{ from: 0, to: 600000, rate: 0 }, { from: 600001, to: 1200000, rate: 5 }, { from: 1200001, to: 2200000, rate: 15 }, { from: 2200001, to: 3200000, rate: 25 }, { from: 3200001, to: 4100000, rate: 30 }, { from: 4100001, to: null, rate: 35 }], taxFreeAllowance: 600000 },
    socialContributions: [{ name: 'EOBI (Pension)', employeeRate: 1, employerRate: 5, cap: null }, { name: 'Social Security', employeeRate: 0, employerRate: 6, cap: null }],
    withholdingTax: { dividends: 15, interest: 15, royalties: 15, notes: ['Reduced under double tax treaties'] },
    invoice: { mandatoryFields: [{ field: 'invoiceNumber', label: 'Invoice Number', required: true }, { field: 'invoiceDate', label: 'Invoice Date', required: true }, { field: 'sellerName', label: 'Seller Details', required: true }, { field: 'sellerNTN', label: 'Seller NTN', required: true }, { field: 'buyerName', label: 'Buyer Details', required: true }, { field: 'items', label: 'Line Items', required: true }, { field: 'totalAmount', label: 'Total Amount', required: true }], eInvoicing: { system: 'PRAL / FBR', description: 'IRIS system for large taxpayers', mandatory: false, url: '' }, fiscalization: 'POS for large retailers', retentionPeriod: '6 years', format: 'PDF', seriesPrefix: 'INV' },
    taxForms: [{ code: 'Sales Tax Return', name: 'VAT Return', frequency: 'Monthly', description: 'Sales tax return', authority: 'FBR' }, { code: 'Corporate Tax Return', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Corporate income tax', authority: 'FBR' }],
    payroll: { minimumWage: 32000, minimumWageCurrency: 'PKR', payPeriod: 'Monthly', overtimeMultiplier: 2.0, standardWorkHours: 48, annualLeaveDays: 14, sickLeaveDays: 120, sickLeavePayPercent: 75, maternityLeaveWeeks: 12, maternityPayPercent: 100, pensionAge: { male: 60, female: 60 }, noticePeriodDays: 30, probationPeriodDays: 90 },
  },

  // ===== BANGLADESH =====
  {
    code: 'BD',
    name: 'Bangladesh',
    flag: '🇧🇩',
    region: 'asia',
    currency: 'BDT',
    currencySymbol: '৳',
    language: 'Bengali',
    vat: { standardRate: 15, reducedRates: [], registrationThreshold: 3000000, exemptions: ['Exports', 'Healthcare', 'Education', 'Financial services'], isReverseChargeApplicable: false },
    corporateTax: { rate: 25, reducedRates: [{ threshold: 50000000, rate: 22.5 }, { threshold: 100000000, rate: 20 }], specialRegimes: ['Tax holiday for new industries (5-12 years)', 'EPZ incentives'], taxLossCarryForward: 8 },
    incomeTax: { type: 'progressive', flatRate: null, brackets: [{ from: 0, to: 350000, rate: 0 }, { from: 350001, to: 500000, rate: 5 }, { from: 500001, to: 700000, rate: 10 }, { from: 700001, to: 1100000, rate: 15 }, { from: 1100001, to: 1600000, rate: 20 }, { from: 1600001, to: null, rate: 25 }], taxFreeAllowance: 350000 },
    socialContributions: [{ name: 'Provident Fund', employeeRate: 8.33, employerRate: 8.33, cap: null }],
    withholdingTax: { dividends: 20, interest: 10, royalties: 10, notes: ['Reduced under double tax treaties'] },
    invoice: { mandatoryFields: [{ field: 'invoiceNumber', label: 'Invoice Number', required: true }, { field: 'invoiceDate', label: 'Invoice Date', required: true }, { field: 'sellerName', label: 'Seller Details', required: true }, { field: 'sellerBIN', label: 'Seller BIN', required: true }, { field: 'buyerName', label: 'Buyer Details', required: true }, { field: 'items', label: 'Line Items', required: true }, { field: 'totalAmount', label: 'Total Amount', required: true }], eInvoicing: { system: 'None', description: 'Not yet implemented', mandatory: false, url: '' }, fiscalization: 'Electronic cash register for large businesses', retentionPeriod: '7 years', format: 'PDF', seriesPrefix: 'INV' },
    taxForms: [{ code: 'VAT Return', name: 'VAT Return', frequency: 'Monthly', description: 'Mushok (VAT return)', authority: 'NBR' }, { code: 'Corporate Tax Return', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Corporate income tax', authority: 'NBR' }],
    payroll: { minimumWage: 12500, minimumWageCurrency: 'BDT', payPeriod: 'Monthly', overtimeMultiplier: 2.0, standardWorkHours: 48, annualLeaveDays: 10, sickLeaveDays: 14, sickLeavePayPercent: 100, maternityLeaveWeeks: 16, maternityPayPercent: 100, pensionAge: { male: 60, female: 60 }, noticePeriodDays: 60, probationPeriodDays: 90 },
  },

  // ===== IRAN =====
  {
    code: 'IR',
    name: 'Iran',
    flag: '🇮🇷',
    region: 'asia',
    currency: 'IRR',
    currencySymbol: '﷼',
    language: 'Persian',
    vat: { standardRate: 10, reducedRates: [], registrationThreshold: 10000000000, exemptions: ['Exports', 'Healthcare', 'Education', 'Financial services'], isReverseChargeApplicable: false },
    corporateTax: { rate: 25, reducedRates: null, specialRegimes: ['Free trade zones 0%', 'Knowledge-based companies 3-5%'], taxLossCarryForward: 5 },
    incomeTax: { type: 'progressive', flatRate: null, brackets: [{ from: 0, to: 120000000, rate: 0 }, { from: 120000001, to: 420000000, rate: 10 }, { from: 420000001, to: 1000000000, rate: 15 }, { from: 1000000001, to: null, rate: 20 }], taxFreeAllowance: 120000000 },
    socialContributions: [{ name: 'Social Security', employeeRate: 7, employerRate: 23, cap: null }],
    withholdingTax: { dividends: 0, interest: 0, royalties: 0, notes: ['Tax is borne by the Iranian company'] },
    invoice: { mandatoryFields: [{ field: 'invoiceNumber', label: 'Invoice Number', required: true }, { field: 'invoiceDate', label: 'Invoice Date', required: true }, { field: 'sellerName', label: 'Seller Details', required: true }, { field: 'sellerNationalId', label: 'Seller National ID', required: true }, { field: 'buyerName', label: 'Buyer Details', required: true }, { field: 'items', label: 'Line Items', required: true }, { field: 'totalAmount', label: 'Total Amount', required: true }], eInvoicing: { system: 'Samaneh Moodiat', description: 'Mandatory electronic invoicing system', mandatory: true, startDate: '2023', url: '' }, fiscalization: 'Electronic invoicing required', retentionPeriod: '10 years', format: 'XML', seriesPrefix: 'INV' },
    taxForms: [{ code: 'Arzesh Afzudeh', name: 'VAT Return', frequency: 'Quarterly', description: 'VAT return', authority: 'IRS' }, { code: 'Salar', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Corporate income tax', authority: 'IRS' }],
    payroll: { minimumWage: 7169590, minimumWageCurrency: 'IRR', payPeriod: 'Monthly', overtimeMultiplier: 1.4, standardWorkHours: 44, annualLeaveDays: 26, sickLeaveDays: 365, sickLeavePayPercent: 70, maternityLeaveWeeks: 9, maternityPayPercent: 100, pensionAge: { male: 60, female: 55 }, noticePeriodDays: 30, probationPeriodDays: 90 },
  },

  // ===== SAUDI ARABIA =====
  {
    code: 'SA',
    name: 'Saudi Arabia',
    flag: '🇸🇦',
    region: 'asia',
    currency: 'SAR',
    currencySymbol: '﷼',
    language: 'Arabic',
    vat: { standardRate: 15, reducedRates: [], registrationThreshold: 375000, exemptions: ['Financial services', 'Healthcare', 'Education', 'Real estate (residential rent)'], isReverseChargeApplicable: true },
    corporateTax: { rate: 20, reducedRates: null, specialRegimes: ['Zakat 2.5% on Saudi/GCC nationals', 'Free zone incentives'], taxLossCarryForward: null },
    incomeTax: { type: 'flat', flatRate: 0, brackets: [{ from: 0, to: null, rate: 0 }], taxFreeAllowance: 0 },
    socialContributions: [{ name: 'GOSI', employeeRate: 9.75, employerRate: 11.75, cap: null }],
    withholdingTax: { dividends: 5, interest: 5, royalties: 15, notes: ['WHT on foreign investors; Saudis pay Zakat instead of CIT'] },
    invoice: { mandatoryFields: [{ field: 'invoiceNumber', label: 'Invoice Number', required: true }, { field: 'invoiceDate', label: 'Invoice Date', required: true }, { field: 'sellerName', label: 'Seller Details', required: true }, { field: 'sellerVAT', label: 'Seller VAT ID', required: true }, { field: 'buyerName', label: 'Buyer Details', required: true }, { field: 'items', label: 'Line Items', required: true }, { field: 'totalAmount', label: 'Total Amount', required: true }], eInvoicing: { system: 'Fatoorah', description: 'Phase 2 mandatory e-invoicing (XML format)', mandatory: true, startDate: '2023', url: '' }, fiscalization: 'E-invoicing mandatory', retentionPeriod: '6 years', format: 'XML / PDF', seriesPrefix: 'INV' },
    taxForms: [{ code: 'VAT Return', name: 'VAT Return', frequency: 'Quarterly', description: 'VAT return', authority: 'ZATCA' }, { code: 'Corporate Tax Return', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Corporate income tax / Zakat', authority: 'ZATCA' }],
    payroll: { minimumWage: 4000, minimumWageCurrency: 'SAR', payPeriod: 'Monthly', overtimeMultiplier: 1.5, standardWorkHours: 48, annualLeaveDays: 21, sickLeaveDays: 120, sickLeavePayPercent: 75, maternityLeaveWeeks: 10, maternityPayPercent: 50, pensionAge: { male: 60, female: 60 }, noticePeriodDays: 30, probationPeriodDays: 90 },
  },

  // ===== ISRAEL =====
  {
    code: 'IL',
    name: 'Israel',
    flag: '🇮🇱',
    region: 'asia',
    currency: 'ILS',
    currencySymbol: '₪',
    language: 'Hebrew/Arabic',
    vat: { standardRate: 17, reducedRates: [{ rate: 0, description: 'Exports, basic food, medicine' }], registrationThreshold: 97200, exemptions: ['Exports', 'Healthcare', 'Education', 'Financial services'], isReverseChargeApplicable: true },
    corporateTax: { rate: 23, reducedRates: null, specialRegimes: ['IP box 5-12% on qualifying income', 'Reduced 7.5% for preferred enterprises'], taxLossCarryForward: 5 },
    incomeTax: { type: 'progressive', flatRate: null, brackets: [{ from: 0, to: 88560, rate: 10 }, { from: 88561, to: 158400, rate: 14 }, { from: 158401, to: 247440, rate: 20 }, { from: 247441, to: 523080, rate: 31 }, { from: 523081, to: 704880, rate: 35 }, { from: 704881, to: null, rate: 47 }], taxFreeAllowance: 88560 },
    socialContributions: [{ name: 'Bituach Leumi', employeeRate: 7.6, employerRate: 7.6, cap: null }, { name: 'Health Insurance', employeeRate: 3.1, employerRate: 3.1, cap: null }],
    withholdingTax: { dividends: 25, interest: 25, royalties: 25, notes: ['Reduced rates under tax treaties'] },
    invoice: { mandatoryFields: [{ field: 'invoiceNumber', label: 'Invoice Number', required: true }, { field: 'invoiceDate', label: 'Invoice Date', required: true }, { field: 'sellerName', label: 'Seller Details', required: true }, { field: 'sellerTaxId', label: 'Seller Tax ID', required: true }, { field: 'buyerName', label: 'Buyer Details', required: true }, { field: 'items', label: 'Line Items', required: true }, { field: 'totalAmount', label: 'Total Amount', required: true }], eInvoicing: { system: 'None', description: 'Not yet mandatory', mandatory: false, url: '' }, fiscalization: 'Certified cash register for retail', retentionPeriod: '7 years', format: 'PDF', seriesPrefix: 'INV' },
    taxForms: [{ code: 'Maam', name: 'VAT Return', frequency: 'Monthly/Bimonthly', description: 'VAT return', authority: 'Mas Hachnasa' }, { code: 'Corporate Tax Return', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Corporate income tax', authority: 'Mas Hachnasa' }],
    payroll: { minimumWage: 5300, minimumWageCurrency: 'ILS', payPeriod: 'Monthly', overtimeMultiplier: 1.25, standardWorkHours: 43, annualLeaveDays: 12, sickLeaveDays: 90, sickLeavePayPercent: 75, maternityLeaveWeeks: 15, maternityPayPercent: 100, pensionAge: { male: 67, female: 62 }, noticePeriodDays: 30, probationPeriodDays: 90 },
  },

  // ===== THAILAND =====
  {
    code: 'TH',
    name: 'Thailand',
    flag: '🇹🇭',
    region: 'asia',
    currency: 'THB',
    currencySymbol: '฿',
    language: 'Thai',
    vat: { standardRate: 7, reducedRates: [], registrationThreshold: 1800000, exemptions: ['Exports', 'Healthcare', 'Education', 'Financial services'], isReverseChargeApplicable: false },
    corporateTax: { rate: 20, reducedRates: [{ threshold: 300000, rate: 0 }, { threshold: 3000000, rate: 15 }], specialRegimes: ['BOI promoted companies reduced rates', 'SME reduced 15%'], taxLossCarryForward: 5 },
    incomeTax: { type: 'progressive', flatRate: null, brackets: [{ from: 0, to: 150000, rate: 0 }, { from: 150001, to: 300000, rate: 5 }, { from: 300001, to: 500000, rate: 10 }, { from: 500001, to: 750000, rate: 15 }, { from: 750001, to: 1000000, rate: 20 }, { from: 1000001, to: 2000000, rate: 25 }, { from: 2000001, to: 5000000, rate: 30 }, { from: 5000001, to: null, rate: 35 }], taxFreeAllowance: 150000 },
    socialContributions: [{ name: 'Social Security', employeeRate: 5, employerRate: 5, cap: 20000 }],
    withholdingTax: { dividends: 10, interest: 15, royalties: 15, notes: ['Reduced under double tax treaties'] },
    invoice: { mandatoryFields: [{ field: 'invoiceNumber', label: 'Invoice Number', required: true }, { field: 'invoiceDate', label: 'Invoice Date', required: true }, { field: 'sellerName', label: 'Seller Details', required: true }, { field: 'sellerTaxId', label: 'Seller Tax ID', required: true }, { field: 'buyerName', label: 'Buyer Details', required: true }, { field: 'items', label: 'Line Items', required: true }, { field: 'totalAmount', label: 'Total Amount', required: true }], eInvoicing: { system: 'e-Tax Invoice', description: 'Being phased in by RD', mandatory: false, url: '' }, fiscalization: 'Not applicable', retentionPeriod: '5 years', format: 'PDF / XML', seriesPrefix: 'INV' },
    taxForms: [{ code: 'PP30', name: 'VAT Return', frequency: 'Monthly', description: 'VAT return', authority: 'Revenue Department' }, { code: 'Corporate Tax Return', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Corporate income tax', authority: 'Revenue Department' }],
    payroll: { minimumWage: 330, minimumWageCurrency: 'THB', payPeriod: 'Monthly', overtimeMultiplier: 1.5, standardWorkHours: 48, annualLeaveDays: 6, sickLeaveDays: 30, sickLeavePayPercent: 100, maternityLeaveWeeks: 13, maternityPayPercent: 100, pensionAge: { male: 60, female: 55 }, noticePeriodDays: 30, probationPeriodDays: 119 },
  },

  // ===== VIETNAM =====
  {
    code: 'VN',
    name: 'Vietnam',
    flag: '🇻🇳',
    region: 'asia',
    currency: 'VND',
    currencySymbol: '₫',
    language: 'Vietnamese',
    vat: { standardRate: 10, reducedRates: [{ rate: 5, description: 'Some essential goods and services' }], registrationThreshold: 1000000000, exemptions: ['Exports', 'Healthcare', 'Education', 'Financial services'], isReverseChargeApplicable: false },
    corporateTax: { rate: 20, reducedRates: null, specialRegimes: ['Reduced 10-17% for favored sectors', 'Tax incentives for EZ/high-tech parks'], taxLossCarryForward: 5 },
    incomeTax: { type: 'progressive', flatRate: null, brackets: [{ from: 0, to: 5000000, rate: 5 }, { from: 5000001, to: 10000000, rate: 10 }, { from: 10000001, to: 18000000, rate: 15 }, { from: 18000001, to: 32000000, rate: 20 }, { from: 32000001, to: 52000000, rate: 25 }, { from: 52000001, to: 80000000, rate: 30 }, { from: 80000001, to: null, rate: 35 }], taxFreeAllowance: 0 },
    socialContributions: [{ name: 'Social Insurance', employeeRate: 8, employerRate: 17.5, cap: null }, { name: 'Health Insurance', employeeRate: 1.5, employerRate: 3, cap: null }, { name: 'Unemployment', employeeRate: 1, employerRate: 1, cap: null }],
    withholdingTax: { dividends: 5, interest: 5, royalties: 10, notes: ['Reduced under tax treaties'] },
    invoice: { mandatoryFields: [{ field: 'invoiceNumber', label: 'Invoice Number', required: true }, { field: 'invoiceDate', label: 'Invoice Date', required: true }, { field: 'sellerName', label: 'Seller Details', required: true }, { field: 'sellerTaxCode', label: 'Seller Tax Code', required: true }, { field: 'buyerName', label: 'Buyer Details', required: true }, { field: 'items', label: 'Line Items', required: true }, { field: 'totalAmount', label: 'Total Amount', required: true }], eInvoicing: { system: 'e-Invoice', description: 'Mandatory electronic invoicing for most businesses', mandatory: true, startDate: '2022', url: '' }, fiscalization: 'Electronic invoicing required', retentionPeriod: '10 years', format: 'XML / PDF', seriesPrefix: 'HD' },
    taxForms: [{ code: 'VAT Return', name: 'VAT Return', frequency: 'Monthly/Quarterly', description: 'VAT return', authority: 'GDT' }, { code: 'Corporate Tax Return', name: 'Corporate Tax Return', frequency: 'Quarterly/Annually', description: 'Corporate income tax', authority: 'GDT' }],
    payroll: { minimumWage: 1800000, minimumWageCurrency: 'VND', payPeriod: 'Monthly', overtimeMultiplier: 1.5, standardWorkHours: 48, annualLeaveDays: 12, sickLeaveDays: 180, sickLeavePayPercent: 75, maternityLeaveWeeks: 26, maternityPayPercent: 100, pensionAge: { male: 60, female: 55 }, noticePeriodDays: 30, probationPeriodDays: 60 },
  },

  // ===== INDONESIA =====
  {
    code: 'ID',
    name: 'Indonesia',
    flag: '🇮🇩',
    region: 'asia',
    currency: 'IDR',
    currencySymbol: 'Rp',
    language: 'Indonesian',
    vat: { standardRate: 12, reducedRates: [], registrationThreshold: 4800000000, exemptions: ['Exports', 'Healthcare', 'Education', 'Financial services'], isReverseChargeApplicable: true },
    corporateTax: { rate: 22, reducedRates: [{ threshold: 4.8e9, rate: 11 }], specialRegimes: ['Publicly listed companies reduced rate 19%', 'Free trade zone incentives'], taxLossCarryForward: 5 },
    incomeTax: { type: 'progressive', flatRate: null, brackets: [{ from: 0, to: 60000000, rate: 5 }, { from: 60000001, to: 250000000, rate: 15 }, { from: 250000001, to: 500000000, rate: 25 }, { from: 500000001, to: 5000000000, rate: 30 }, { from: 5000000001, to: null, rate: 35 }], taxFreeAllowance: 54000000 },
    socialContributions: [{ name: 'BPJS Employment', employeeRate: 2, employerRate: 5.7, cap: null }, { name: 'BPJS Health', employeeRate: 1, employerRate: 4, cap: null }],
    withholdingTax: { dividends: 15, interest: 20, royalties: 15, notes: ['Reduced under tax treaties'] },
    invoice: { mandatoryFields: [{ field: 'invoiceNumber', label: 'Invoice Number', required: true }, { field: 'invoiceDate', label: 'Invoice Date', required: true }, { field: 'sellerName', label: 'Seller Details', required: true }, { field: 'sellerNPWP', label: 'Seller NPWP', required: true }, { field: 'buyerName', label: 'Buyer Details', required: true }, { field: 'items', label: 'Line Items', required: true }, { field: 'totalAmount', label: 'Total Amount', required: true }], eInvoicing: { system: 'e-Faktur / Coretax', description: 'Mandatory electronic VAT invoice for PKP', mandatory: true, startDate: '2014', url: '' }, fiscalization: 'e-Faktur mandatory for VAT-registered businesses', retentionPeriod: '10 years', format: 'XML / PDF', seriesPrefix: 'INV' },
    taxForms: [{ code: 'SPT Masa PPN', name: 'VAT Return', frequency: 'Monthly', description: 'VAT return', authority: 'DJP' }, { code: 'SPT Tahunan PPh', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Corporate income tax', authority: 'DJP' }],
    payroll: { minimumWage: null, minimumWageCurrency: 'IDR', payPeriod: 'Monthly', overtimeMultiplier: 1.5, standardWorkHours: 40, annualLeaveDays: 12, sickLeaveDays: 365, sickLeavePayPercent: 100, maternityLeaveWeeks: 13, maternityPayPercent: 100, pensionAge: { male: 56, female: 56 }, noticePeriodDays: 30, probationPeriodDays: 90 },
  },

  // ===== MALAYSIA =====
  {
    code: 'MY',
    name: 'Malaysia',
    flag: '🇲🇾',
    region: 'asia',
    currency: 'MYR',
    currencySymbol: 'RM',
    language: 'Malay/English',
    vat: { standardRate: 8, reducedRates: [], registrationThreshold: 500000, exemptions: ['Exports', 'Healthcare', 'Education', 'Financial services'], isReverseChargeApplicable: false },
    corporateTax: { rate: 24, reducedRates: [{ threshold: 2500000, rate: 15 }], specialRegimes: ['Labuan offshore 3%', 'Pioneer status incentives'], taxLossCarryForward: 10 },
    incomeTax: { type: 'progressive', flatRate: null, brackets: [{ from: 0, to: 5000, rate: 0 }, { from: 5001, to: 20000, rate: 1 }, { from: 20001, to: 35000, rate: 3 }, { from: 35001, to: 50000, rate: 6 }, { from: 50001, to: 70000, rate: 10 }, { from: 70001, to: 100000, rate: 14 }, { from: 100001, to: 400000, rate: 21 }, { from: 400001, to: 600000, rate: 24 }, { from: 600001, to: 2000000, rate: 26 }, { from: 2000001, to: null, rate: 28 }], taxFreeAllowance: 5000 },
    socialContributions: [{ name: 'EPF', employeeRate: 11, employerRate: 13, cap: null }, { name: 'SOCSO', employeeRate: 0.5, employerRate: 1.25, cap: null }, { name: 'EIS', employeeRate: 0.2, employerRate: 0.2, cap: null }],
    withholdingTax: { dividends: 0, interest: 15, royalties: 10, notes: ['No WHT on dividends (single-tier system)'] },
    invoice: { mandatoryFields: [{ field: 'invoiceNumber', label: 'Invoice Number', required: true }, { field: 'invoiceDate', label: 'Invoice Date', required: true }, { field: 'sellerName', label: 'Seller Details', required: true }, { field: 'sellerTIN', label: 'Seller TIN', required: true }, { field: 'buyerName', label: 'Buyer Details', required: true }, { field: 'items', label: 'Line Items', required: true }, { field: 'totalAmount', label: 'Total Amount', required: true }], eInvoicing: { system: 'e-Invoice', description: 'Phased mandatory implementation from 2024', mandatory: false, startDate: '2024', url: '' }, fiscalization: 'Not applicable', retentionPeriod: '7 years', format: 'PDF / XML', seriesPrefix: 'INV' },
    taxForms: [{ code: 'GST/SST Return', name: 'VAT Return', frequency: 'Bimonthly', description: 'Sales and Services Tax return', authority: 'IRBM' }, { code: 'Form C', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Corporate income tax', authority: 'IRBM' }],
    payroll: { minimumWage: null, minimumWageCurrency: 'MYR', payPeriod: 'Monthly', overtimeMultiplier: 1.5, standardWorkHours: 48, annualLeaveDays: 8, sickLeaveDays: 60, sickLeavePayPercent: 100, maternityLeaveWeeks: 14, maternityPayPercent: 100, pensionAge: { male: 60, female: 60 }, noticePeriodDays: 30, probationPeriodDays: 90 },
  },

  // ===== PHILIPPINES =====
  {
    code: 'PH',
    name: 'Philippines',
    flag: '🇵🇭',
    region: 'asia',
    currency: 'PHP',
    currencySymbol: '₱',
    language: 'Filipino/English',
    vat: { standardRate: 12, reducedRates: [], registrationThreshold: 3000000, exemptions: ['Exports', 'Healthcare', 'Education', 'Financial services'], isReverseChargeApplicable: false },
    corporateTax: { rate: 25, reducedRates: [{ threshold: 5000000, rate: 20 }], specialRegimes: ['Reduced for MSMEs', 'PEZA incentives'], taxLossCarryForward: 3 },
    incomeTax: { type: 'progressive', flatRate: null, brackets: [{ from: 0, to: 250000, rate: 0 }, { from: 250001, to: 400000, rate: 15 }, { from: 400001, to: 800000, rate: 20 }, { from: 800001, to: 2000000, rate: 25 }, { from: 2000001, to: 8000000, rate: 30 }, { from: 8000001, to: null, rate: 35 }], taxFreeAllowance: 250000 },
    socialContributions: [{ name: 'SSS', employeeRate: 4.5, employerRate: 7.5, cap: null }, { name: 'PhilHealth', employeeRate: 2.5, employerRate: 2.5, cap: null }, { name: 'Pag-IBIG', employeeRate: 100, employerRate: 100, cap: null }],
    withholdingTax: { dividends: 15, interest: 20, royalties: 20, notes: ['Reduced under tax treaties'] },
    invoice: { mandatoryFields: [{ field: 'invoiceNumber', label: 'Invoice Number', required: true }, { field: 'invoiceDate', label: 'Invoice Date', required: true }, { field: 'sellerName', label: 'Seller Details', required: true }, { field: 'sellerTIN', label: 'Seller TIN', required: true }, { field: 'buyerName', label: 'Buyer Details', required: true }, { field: 'items', label: 'Line Items', required: true }, { field: 'totalAmount', label: 'Total Amount', required: true }], eInvoicing: { system: 'None', description: 'Not yet implemented', mandatory: false, url: '' }, fiscalization: 'BIR-registered POS for large businesses', retentionPeriod: '10 years', format: 'PDF', seriesPrefix: 'SI' },
    taxForms: [{ code: 'BIR Form 2550M', name: 'VAT Return', frequency: 'Monthly', description: 'Monthly VAT declaration', authority: 'BIR' }, { code: 'BIR Form 1702', name: 'Corporate Tax Return', frequency: 'Quarterly/Annually', description: 'Corporate income tax', authority: 'BIR' }],
    payroll: { minimumWage: null, minimumWageCurrency: 'PHP', payPeriod: 'Monthly', overtimeMultiplier: 1.25, standardWorkHours: 48, annualLeaveDays: 5, sickLeaveDays: 15, sickLeavePayPercent: 100, maternityLeaveWeeks: 14, maternityPayPercent: 100, pensionAge: { male: 60, female: 60 }, noticePeriodDays: 30, probationPeriodDays: 180 },
  },

  // ===== ARGENTINA =====
  {
    code: 'AR', name: 'Argentina', flag: '🇦🇷', region: 'americas', currency: 'ARS', currencySymbol: '$', language: 'Spanish',
    vat: { standardRate: 21, reducedRates: [{ rate: 10.5, description: 'Some essential goods' }], registrationThreshold: null, exemptions: ['Exports', 'Healthcare', 'Education', 'Financial services'], isReverseChargeApplicable: true },
    corporateTax: { rate: 35, reducedRates: null, specialRegimes: ['Reduced for small taxpayers (monotributo)'], taxLossCarryForward: 5 },
    incomeTax: { type: 'progressive', flatRate: null, brackets: [{ from: 0, to: 2100000, rate: 5 }, { from: 2100001, to: 2700000, rate: 9 }, { from: 2700001, to: 3400000, rate: 12 }, { from: 3400001, to: 4600000, rate: 15 }, { from: 4600001, to: null, rate: 35 }], taxFreeAllowance: 0 },
    socialContributions: [{ name: 'Pension', employeeRate: 11, employerRate: 16, cap: null }, { name: 'Health (Obra Social)', employeeRate: 3, employerRate: 6, cap: null }, { name: 'PAMI', employeeRate: 3, employerRate: 2, cap: null }],
    withholdingTax: { dividends: 35, interest: 15, royalties: 15, notes: ['Reduced under tax treaties'] },
    invoice: { mandatoryFields: [{ field: 'invoiceNumber', label: 'Invoice Number', required: true }, { field: 'invoiceDate', label: 'Invoice Date', required: true }, { field: 'sellerName', label: 'Seller Details', required: true }, { field: 'sellerCUIT', label: 'Seller CUIT', required: true }, { field: 'buyerName', label: 'Buyer Details', required: true }, { field: 'items', label: 'Line Items', required: true }, { field: 'totalAmount', label: 'Total Amount', required: true }], eInvoicing: { system: 'AFIP Factura Electrónica', description: 'Mandatory electronic invoicing since 2019', mandatory: true, startDate: '2019', url: '' }, fiscalization: 'AFIP electronic invoicing', retentionPeriod: '10 years', format: 'XML / PDF', seriesPrefix: 'A/B/C' },
    taxForms: [{ code: 'IVA', name: 'VAT Return', frequency: 'Monthly', description: 'VAT return (F.2002)', authority: 'AFIP' }, { code: 'Ganancias', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Corporate income tax', authority: 'AFIP' }],
    payroll: { minimumWage: 234315, minimumWageCurrency: 'ARS', payPeriod: 'Monthly', overtimeMultiplier: 1.5, standardWorkHours: 48, annualLeaveDays: 14, sickLeaveDays: 365, sickLeavePayPercent: 100, maternityLeaveWeeks: 14, maternityPayPercent: 100, pensionAge: { male: 65, female: 60 }, noticePeriodDays: 30, probationPeriodDays: 90 },
  },

  // ===== COLOMBIA =====
  {
    code: 'CO', name: 'Colombia', flag: '🇨🇴', region: 'americas', currency: 'COP', currencySymbol: '$', language: 'Spanish',
    vat: { standardRate: 19, reducedRates: [{ rate: 5, description: 'Basic food basket, medicine' }], registrationThreshold: null, exemptions: ['Exports', 'Healthcare', 'Education', 'Financial services'], isReverseChargeApplicable: true },
    corporateTax: { rate: 35, reducedRates: null, specialRegimes: ['Simplified regime for small taxpayers (6%)', 'Free trade zone incentives'], taxLossCarryForward: 12 },
    incomeTax: { type: 'progressive', flatRate: null, brackets: [{ from: 0, to: 1090, rate: 0 }, { from: 1091, to: 1700, rate: 19 }, { from: 1701, to: 4100, rate: 28 }, { from: 4101, to: 8600, rate: 33 }, { from: 8601, to: null, rate: 35 }], taxFreeAllowance: 1090 },
    socialContributions: [{ name: 'Pension', employeeRate: 4, employerRate: 12, cap: null }, { name: 'Health', employeeRate: 4, employerRate: 8.5, cap: null }, { name: 'Risks (ARL)', employeeRate: 0, employerRate: 6.96, cap: null }],
    withholdingTax: { dividends: 15, interest: 15, royalties: 20, notes: ['Reduced under tax treaties'] },
    invoice: { mandatoryFields: [{ field: 'invoiceNumber', label: 'Invoice Number', required: true }, { field: 'invoiceDate', label: 'Invoice Date', required: true }, { field: 'sellerName', label: 'Seller Details', required: true }, { field: 'sellerNIT', label: 'Seller NIT', required: true }, { field: 'buyerName', label: 'Buyer Details', required: true }, { field: 'items', label: 'Line Items', required: true }, { field: 'totalAmount', label: 'Total Amount', required: true }], eInvoicing: { system: 'DIAN Factura Electrónica', description: 'Mandatory electronic invoicing being phased in', mandatory: true, startDate: '2024', url: '' }, fiscalization: 'DIAN electronic invoicing', retentionPeriod: '10 years', format: 'XML / PDF', seriesPrefix: 'FE' },
    taxForms: [{ code: 'IVA', name: 'VAT Return', frequency: 'Bimonthly', description: 'IVA return', authority: 'DIAN' }, { code: 'Renta', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Corporate income tax', authority: 'DIAN' }],
    payroll: { minimumWage: 1423500, minimumWageCurrency: 'COP', payPeriod: 'Monthly', overtimeMultiplier: 1.5, standardWorkHours: 48, annualLeaveDays: 15, sickLeaveDays: 365, sickLeavePayPercent: 67, maternityLeaveWeeks: 18, maternityPayPercent: 100, pensionAge: { male: 62, female: 57 }, noticePeriodDays: 30, probationPeriodDays: 90 },
  },

  // ===== CHILE =====
  {
    code: 'CL', name: 'Chile', flag: '🇨🇱', region: 'americas', currency: 'CLP', currencySymbol: '$', language: 'Spanish',
    vat: { standardRate: 19, reducedRates: [], registrationThreshold: null, exemptions: ['Exports', 'Healthcare', 'Education', 'Financial services'], isReverseChargeApplicable: false },
    corporateTax: { rate: 27, reducedRates: null, specialRegimes: ['SME reduced rate (25%)', 'Start-up regime'], taxLossCarryForward: null },
    incomeTax: { type: 'progressive', flatRate: null, brackets: [{ from: 0, to: 8474080, rate: 0 }, { from: 8474081, to: 20248640, rate: 4 }, { from: 20248641, to: 35216320, rate: 8 }, { from: 35216321, to: 53293680, rate: 13.5 }, { from: 53293681, to: 70676640, rate: 23 }, { from: 70676641, to: 184714080, rate: 30.4 }, { from: 184714081, to: null, rate: 35 }], taxFreeAllowance: 8474080 },
    socialContributions: [{ name: 'Pension (AFP)', employeeRate: 10, employerRate: 0, cap: null }, { name: 'Health (FONASA/ISAPRE)', employeeRate: 7, employerRate: 0, cap: null }, { name: 'Unemployment', employeeRate: 0, employerRate: 2.4, cap: null }],
    withholdingTax: { dividends: 35, interest: 35, royalties: 15, notes: ['WHT is a credit against final tax'] },
    invoice: { mandatoryFields: [{ field: 'invoiceNumber', label: 'Invoice Number', required: true }, { field: 'invoiceDate', label: 'Invoice Date', required: true }, { field: 'sellerName', label: 'Seller Details', required: true }, { field: 'sellerRUT', label: 'Seller RUT', required: true }, { field: 'buyerName', label: 'Buyer Details', required: true }, { field: 'items', label: 'Line Items', required: true }, { field: 'totalAmount', label: 'Total Amount', required: true }], eInvoicing: { system: 'SII Factura Electrónica', description: 'Mandatory electronic invoicing', mandatory: true, startDate: '2018', url: '' }, fiscalization: 'SII electronic invoicing', retentionPeriod: '6 years', format: 'XML / PDF', seriesPrefix: 'FE' },
    taxForms: [{ code: 'F29', name: 'VAT Return', frequency: 'Monthly', description: 'Formulario 29 IVA', authority: 'SII' }, { code: 'Form 22', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Corporate income tax', authority: 'SII' }],
    payroll: { minimumWage: 500000, minimumWageCurrency: 'CLP', payPeriod: 'Monthly', overtimeMultiplier: 1.5, standardWorkHours: 45, annualLeaveDays: 15, sickLeaveDays: 365, sickLeavePayPercent: 100, maternityLeaveWeeks: 24, maternityPayPercent: 100, pensionAge: { male: 65, female: 60 }, noticePeriodDays: 30, probationPeriodDays: 90 },
  },

  // ===== PERU =====
  {
    code: 'PE', name: 'Peru', flag: '🇵🇪', region: 'americas', currency: 'PEN', currencySymbol: 'S/', language: 'Spanish',
    vat: { standardRate: 18, reducedRates: [], registrationThreshold: 84000, exemptions: ['Exports', 'Healthcare', 'Education', 'Financial services'], isReverseChargeApplicable: true },
    corporateTax: { rate: 29.5, reducedRates: null, specialRegimes: ['Reduced for Amazon region', 'Tax stability agreements'], taxLossCarryForward: 4 },
    incomeTax: { type: 'progressive', flatRate: null, brackets: [{ from: 0, to: 10500, rate: 8 }, { from: 10501, to: 21000, rate: 14 }, { from: 21001, to: 84000, rate: 17 }, { from: 84001, to: 147000, rate: 20 }, { from: 147001, to: null, rate: 30 }], taxFreeAllowance: 10500 },
    socialContributions: [{ name: 'Pension (ONP/AFP)', employeeRate: 13, employerRate: 9, cap: null }, { name: 'Health (EsSalud)', employeeRate: 0, employerRate: 9, cap: null }],
    withholdingTax: { dividends: 5, interest: 0, royalties: 15, notes: ['Reduced under tax treaties'] },
    invoice: { mandatoryFields: [{ field: 'invoiceNumber', label: 'Invoice Number', required: true }, { field: 'invoiceDate', label: 'Invoice Date', required: true }, { field: 'sellerName', label: 'Seller Details', required: true }, { field: 'sellerRUC', label: 'Seller RUC', required: true }, { field: 'buyerName', label: 'Buyer Details', required: true }, { field: 'items', label: 'Line Items', required: true }, { field: 'totalAmount', label: 'Total Amount', required: true }], eInvoicing: { system: 'SUNAT CPE', description: 'Mandatory electronic invoicing since 2020', mandatory: true, startDate: '2020', url: '' }, fiscalization: 'SUNAT CPE electronic invoicing', retentionPeriod: '10 years', format: 'XML / PDF', seriesPrefix: 'F001' },
    taxForms: [{ code: 'IVA', name: 'VAT Return', frequency: 'Monthly', description: 'IGV/IVA return', authority: 'SUNAT' }, { code: 'Renta', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Corporate income tax', authority: 'SUNAT' }],
    payroll: { minimumWage: 1025, minimumWageCurrency: 'PEN', payPeriod: 'Monthly', overtimeMultiplier: 1.5, standardWorkHours: 48, annualLeaveDays: 30, sickLeaveDays: 365, sickLeavePayPercent: 100, maternityLeaveWeeks: 13, maternityPayPercent: 100, pensionAge: { male: 65, female: 60 }, noticePeriodDays: 30, probationPeriodDays: 90 },
  },

  // ===== NEW ZEALAND =====
  {
    code: 'NZ', name: 'New Zealand', flag: '🇳🇿', region: 'oceania', currency: 'NZD', currencySymbol: 'NZ$', language: 'English/Māori',
    vat: { standardRate: 15, reducedRates: [], registrationThreshold: 60000, exemptions: ['Financial services', 'Residential rent', 'Healthcare'], isReverseChargeApplicable: true },
    corporateTax: { rate: 28, reducedRates: null, specialRegimes: [], taxLossCarryForward: null },
    incomeTax: { type: 'progressive', flatRate: null, brackets: [{ from: 0, to: 14000, rate: 10.5 }, { from: 14001, to: 48000, rate: 17.5 }, { from: 48001, to: 70000, rate: 30 }, { from: 70001, to: 180000, rate: 33 }, { from: 180001, to: null, rate: 39 }], taxFreeAllowance: 0 },
    socialContributions: [{ name: 'ACC (Accident Compensation)', employeeRate: 1.53, employerRate: 1.67, cap: null }, { name: 'KiwiSaver', employeeRate: 3, employerRate: 3, cap: null }],
    withholdingTax: { dividends: 0, interest: 0, royalties: 0, notes: ['No WHT on dividends, interest, royalties'] },
    invoice: { mandatoryFields: [{ field: 'invoiceNumber', label: 'Invoice Number', required: true }, { field: 'invoiceDate', label: 'Invoice Date', required: true }, { field: 'sellerName', label: 'Seller Details', required: true }, { field: 'sellerGST', label: 'Seller GST Number', required: true }, { field: 'buyerName', label: 'Buyer Details', required: true }, { field: 'items', label: 'Line Items', required: true }, { field: 'totalAmount', label: 'Total Amount', required: true }], eInvoicing: { system: 'None', description: 'Being considered', mandatory: false, url: '' }, fiscalization: 'Not applicable', retentionPeriod: '7 years', format: 'PDF', seriesPrefix: 'INV' },
    taxForms: [{ code: 'GST Return', name: 'VAT Return', frequency: 'Monthly/Bimonthly', description: 'GST return', authority: 'IRD' }, { code: 'Corporate Tax Return', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Corporate income tax', authority: 'IRD' }],
    payroll: { minimumWage: 22.70, minimumWageCurrency: 'NZD', payPeriod: 'Hourly', overtimeMultiplier: 1.5, standardWorkHours: 40, annualLeaveDays: 20, sickLeaveDays: 10, sickLeavePayPercent: 100, maternityLeaveWeeks: 26, maternityPayPercent: 100, pensionAge: { male: 65, female: 65 }, noticePeriodDays: 30, probationPeriodDays: 90 },
  },

  // ===== NIGERIA =====
  {
    code: 'NG', name: 'Nigeria', flag: '🇳🇬', region: 'africa', currency: 'NGN', currencySymbol: '₦', language: 'English',
    vat: { standardRate: 7.5, reducedRates: [], registrationThreshold: 25000000, exemptions: ['Exports', 'Healthcare', 'Education', 'Financial services'], isReverseChargeApplicable: false },
    corporateTax: { rate: 30, reducedRates: null, specialRegimes: ['Reduced for small companies (20-25%)', 'Pioneer status 0-5%'], taxLossCarryForward: 4 },
    incomeTax: { type: 'progressive', flatRate: null, brackets: [{ from: 0, to: 300000, rate: 7 }, { from: 300001, to: 600000, rate: 11 }, { from: 600001, to: 1600000, rate: 15 }, { from: 1600001, to: 3200000, rate: 19 }, { from: 3200001, to: null, rate: 24 }], taxFreeAllowance: 0 },
    socialContributions: [{ name: 'Pension (PFA)', employeeRate: 8, employerRate: 10, cap: null }, { name: 'NHIS', employeeRate: 1.25, employerRate: 1.25, cap: null }],
    withholdingTax: { dividends: 10, interest: 10, royalties: 10, notes: ['Reduced under tax treaties'] },
    invoice: { mandatoryFields: [{ field: 'invoiceNumber', label: 'Invoice Number', required: true }, { field: 'invoiceDate', label: 'Invoice Date', required: true }, { field: 'sellerName', label: 'Seller Details', required: true }, { field: 'sellerTIN', label: 'Seller TIN', required: true }, { field: 'buyerName', label: 'Buyer Details', required: true }, { field: 'items', label: 'Line Items', required: true }, { field: 'totalAmount', label: 'Total Amount', required: true }], eInvoicing: { system: 'e-Invoice', description: 'Being developed by FIRS', mandatory: false, url: '' }, fiscalization: 'Not applicable', retentionPeriod: '6 years', format: 'PDF', seriesPrefix: 'INV' },
    taxForms: [{ code: 'VAT Return', name: 'VAT Return', frequency: 'Monthly', description: 'VAT return', authority: 'FIRS' }, { code: 'Corporate Tax Return', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Corporate income tax', authority: 'FIRS' }],
    payroll: { minimumWage: 70000, minimumWageCurrency: 'NGN', payPeriod: 'Monthly', overtimeMultiplier: 1.5, standardWorkHours: 40, annualLeaveDays: 6, sickLeaveDays: 12, sickLeavePayPercent: 100, maternityLeaveWeeks: 16, maternityPayPercent: 100, pensionAge: { male: 60, female: 60 }, noticePeriodDays: 30, probationPeriodDays: 90 },
  },

  // ===== KENYA =====
  {
    code: 'KE', name: 'Kenya', flag: '🇰🇪', region: 'africa', currency: 'KES', currencySymbol: 'KSh', language: 'English/Swahili',
    vat: { standardRate: 16, reducedRates: [], registrationThreshold: 5000000, exemptions: ['Exports', 'Healthcare', 'Education', 'Financial services'], isReverseChargeApplicable: true },
    corporateTax: { rate: 30, reducedRates: null, specialRegimes: ['Reduced 15% for companies listed on NSE', 'SEZ incentives'], taxLossCarryForward: null },
    incomeTax: { type: 'progressive', flatRate: null, brackets: [{ from: 0, to: 24000, rate: 10 }, { from: 24001, to: 32333, rate: 15 }, { from: 32334, to: 500000, rate: 20 }, { from: 500001, to: 800000, rate: 25 }, { from: 800001, to: null, rate: 30 }], taxFreeAllowance: 24000 },
    socialContributions: [{ name: 'NSSF', employeeRate: 6, employerRate: 6, cap: 18000 }, { name: 'NHIF', employeeRate: 2.75, employerRate: 2.75, cap: null }],
    withholdingTax: { dividends: 15, interest: 15, royalties: 20, notes: ['Reduced under tax treaties'] },
    invoice: { mandatoryFields: [{ field: 'invoiceNumber', label: 'Invoice Number', required: true }, { field: 'invoiceDate', label: 'Invoice Date', required: true }, { field: 'sellerName', label: 'Seller Details', required: true }, { field: 'sellerPIN', label: 'Seller PIN', required: true }, { field: 'buyerName', label: 'Buyer Details', required: true }, { field: 'items', label: 'Line Items', required: true }, { field: 'totalAmount', label: 'Total Amount', required: true }], eInvoicing: { system: 'TIMS / iTax', description: 'Mandatory electronic invoicing', mandatory: true, startDate: '2024', url: '' }, fiscalization: 'TIMS electronic invoicing', retentionPeriod: '5 years', format: 'XML / PDF', seriesPrefix: 'INV' },
    taxForms: [{ code: 'VAT Return', name: 'VAT Return', frequency: 'Monthly', description: 'VAT return', authority: 'KRA' }, { code: 'Corporate Tax Return', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Corporate income tax', authority: 'KRA' }],
    payroll: { minimumWage: null, minimumWageCurrency: 'KES', payPeriod: 'Monthly', overtimeMultiplier: 1.5, standardWorkHours: 52, annualLeaveDays: 21, sickLeaveDays: 90, sickLeavePayPercent: 100, maternityLeaveWeeks: 13, maternityPayPercent: 100, pensionAge: { male: 60, female: 60 }, noticePeriodDays: 28, probationPeriodDays: 90 },
  },

  // ===== SOUTH AFRICA =====
  {
    code: 'ZA', name: 'South Africa', flag: '🇿🇦', region: 'africa', currency: 'ZAR', currencySymbol: 'R', language: 'English/Zulu/Xhosa/Afrikaans',
    vat: { standardRate: 15, reducedRates: [], registrationThreshold: 1000000, exemptions: ['Exports', 'Healthcare', 'Education', 'Financial services'], isReverseChargeApplicable: true },
    corporateTax: { rate: 27, reducedRates: null, specialRegimes: ['Sect 12I tax incentive', 'Headquarters company regime'], taxLossCarryForward: null },
    incomeTax: { type: 'progressive', flatRate: null, brackets: [{ from: 0, to: 95750, rate: 18 }, { from: 95751, to: 237100, rate: 26 }, { from: 237101, to: 370500, rate: 31 }, { from: 370501, to: 512800, rate: 36 }, { from: 512801, to: 673000, rate: 39 }, { from: 673001, to: 852000, rate: 41 }, { from: 852001, to: 1817000, rate: 45 }, { from: 1817001, to: null, rate: 48 }], taxFreeAllowance: 95750 },
    socialContributions: [{ name: 'UIF', employeeRate: 1, employerRate: 1, cap: 17712 }, { name: 'COIDA', employeeRate: 0, employerRate: 1, cap: null }],
    withholdingTax: { dividends: 20, interest: 15, royalties: 15, notes: ['Reduced under tax treaties'] },
    invoice: { mandatoryFields: [{ field: 'invoiceNumber', label: 'Invoice Number', required: true }, { field: 'invoiceDate', label: 'Invoice Date', required: true }, { field: 'sellerName', label: 'Seller Details', required: true }, { field: 'sellerVAT', label: 'Seller VAT Number', required: true }, { field: 'buyerName', label: 'Buyer Details', required: true }, { field: 'items', label: 'Line Items', required: true }, { field: 'totalAmount', label: 'Total Amount', required: true }], eInvoicing: { system: 'None', description: 'Not yet implemented', mandatory: false, url: '' }, fiscalization: 'Not applicable', retentionPeriod: '5 years', format: 'PDF', seriesPrefix: 'INV' },
    taxForms: [{ code: 'VAT201', name: 'VAT Return', frequency: 'Monthly/Bimonthly', description: 'VAT return', authority: 'SARS' }, { code: 'IT14', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Corporate income tax', authority: 'SARS' }],
    payroll: { minimumWage: null, minimumWageCurrency: 'ZAR', payPeriod: 'Monthly', overtimeMultiplier: 1.5, standardWorkHours: 45, annualLeaveDays: 21, sickLeaveDays: 30, sickLeavePayPercent: 100, maternityLeaveWeeks: 17, maternityPayPercent: 100, pensionAge: { male: 60, female: 60 }, noticePeriodDays: 30, probationPeriodDays: 90 },
  },

  // ===== EGYPT =====
  {
    code: 'EG', name: 'Egypt', flag: '🇪🇬', region: 'africa', currency: 'EGP', currencySymbol: 'E£', language: 'Arabic',
    vat: { standardRate: 14, reducedRates: [], registrationThreshold: 500000, exemptions: ['Exports', 'Healthcare', 'Education', 'Financial services'], isReverseChargeApplicable: false },
    corporateTax: { rate: 22.5, reducedRates: null, specialRegimes: ['Free zone incentives 10%', 'Investment law incentives'], taxLossCarryForward: null },
    incomeTax: { type: 'progressive', flatRate: null, brackets: [{ from: 0, to: 65000, rate: 0 }, { from: 65001, to: 300000, rate: 10 }, { from: 300001, to: 600000, rate: 15 }, { from: 600001, to: 1000000, rate: 20 }, { from: 1000001, to: null, rate: 22.5 }], taxFreeAllowance: 65000 },
    socialContributions: [{ name: 'Social Insurance', employeeRate: 7.5, employerRate: 12, cap: null }, { name: 'Health Insurance', employeeRate: 1, employerRate: 4.5, cap: null }],
    withholdingTax: { dividends: 10, interest: 20, royalties: 20, notes: ['Reduced under tax treaties'] },
    invoice: { mandatoryFields: [{ field: 'invoiceNumber', label: 'Invoice Number', required: true }, { field: 'invoiceDate', label: 'Invoice Date', required: true }, { field: 'sellerName', label: 'Seller Details', required: true }, { field: 'sellerTRN', label: 'Seller Tax Registration', required: true }, { field: 'buyerName', label: 'Buyer Details', required: true }, { field: 'items', label: 'Line Items', required: true }, { field: 'totalAmount', label: 'Total Amount', required: true }], eInvoicing: { system: 'E-invoice', description: 'Being developed by ETA', mandatory: false, url: '' }, fiscalization: 'Not applicable', retentionPeriod: '10 years', format: 'PDF', seriesPrefix: 'INV' },
    taxForms: [{ code: 'VAT Return', name: 'VAT Return', frequency: 'Monthly/Bimonthly', description: 'VAT return', authority: 'ETA' }, { code: 'Corporate Tax Return', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Corporate income tax', authority: 'ETA' }],
    payroll: { minimumWage: 3500, minimumWageCurrency: 'EGP', payPeriod: 'Monthly', overtimeMultiplier: 1.5, standardWorkHours: 48, annualLeaveDays: 21, sickLeaveDays: 180, sickLeavePayPercent: 75, maternityLeaveWeeks: 14, maternityPayPercent: 100, pensionAge: { male: 60, female: 59 }, noticePeriodDays: 30, probationPeriodDays: 90 },
  },

  // ===== MOROCCO =====
  {
    code: 'MA', name: 'Morocco', flag: '🇲🇦', region: 'africa', currency: 'MAD', currencySymbol: 'DH', language: 'Arabic/French',
    vat: { standardRate: 20, reducedRates: [{ rate: 14, description: 'Some food, transport, hospitality' }, { rate: 10, description: 'Basic food, medicine' }, { rate: 7, description: 'Essential goods' }], registrationThreshold: 5000000, exemptions: ['Exports', 'Healthcare', 'Education', 'Financial services'], isReverseChargeApplicable: true },
    corporateTax: { rate: 30, reducedRates: null, specialRegimes: ['Reduced 15% for exporters', 'Reduced 10% for Casablanca SE listed'], taxLossCarryForward: 4 },
    incomeTax: { type: 'progressive', flatRate: null, brackets: [{ from: 0, to: 40000, rate: 0 }, { from: 40001, to: 50000, rate: 10 }, { from: 50001, to: 60000, rate: 20 }, { from: 60001, to: 80000, rate: 30 }, { from: 80001, to: 180000, rate: 34 }, { from: 180001, to: null, rate: 38 }], taxFreeAllowance: 40000 },
    socialContributions: [{ name: 'CNSS', employeeRate: 6.29, employerRate: 16.57, cap: 6000 }, { name: 'AMO', employeeRate: 2.26, employerRate: 4.11, cap: null }, { name: 'CIMR', employeeRate: 0, employerRate: 1.6, cap: null }],
    withholdingTax: { dividends: 15, interest: 20, royalties: 15, notes: ['Reduced under tax treaties'] },
    invoice: { mandatoryFields: [{ field: 'invoiceNumber', label: 'Invoice Number', required: true }, { field: 'invoiceDate', label: 'Invoice Date', required: true }, { field: 'sellerName', label: 'Seller Details', required: true }, { field: 'sellerICE', label: 'Seller ICE', required: true }, { field: 'buyerName', label: 'Buyer Details', required: true }, { field: 'items', label: 'Line Items', required: true }, { field: 'totalAmount', label: 'Total Amount', required: true }], eInvoicing: { system: 'e-Facturation', description: 'Being phased in', mandatory: false, url: '' }, fiscalization: 'Not applicable', retentionPeriod: '10 years', format: 'PDF', seriesPrefix: 'INV' },
    taxForms: [{ code: 'TVA', name: 'VAT Return', frequency: 'Monthly', description: 'TVA declaration', authority: 'DGI' }, { code: 'Corporate Tax Return', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Corporate income tax', authority: 'DGI' }],
    payroll: { minimumWage: null, minimumWageCurrency: 'MAD', payPeriod: 'Monthly', overtimeMultiplier: 1.5, standardWorkHours: 44, annualLeaveDays: 18, sickLeaveDays: 365, sickLeavePayPercent: 67, maternityLeaveWeeks: 14, maternityPayPercent: 100, pensionAge: { male: 63, female: 63 }, noticePeriodDays: 30, probationPeriodDays: 90 },
  },

  // ===== ETHIOPIA =====
  {
    code: 'ET', name: 'Ethiopia', flag: '🇪🇹', region: 'africa', currency: 'ETB', currencySymbol: 'Br', language: 'Amharic',
    vat: { standardRate: 15, reducedRates: [], registrationThreshold: 1000000, exemptions: ['Exports', 'Healthcare', 'Education', 'Financial services'], isReverseChargeApplicable: false },
    corporateTax: { rate: 30, reducedRates: null, specialRegimes: ['Reduced for priority sectors (10-20%)', 'Industrial park incentives'], taxLossCarryForward: null },
    incomeTax: { type: 'progressive', flatRate: null, brackets: [{ from: 0, to: 600, rate: 0 }, { from: 601, to: 1650, rate: 10 }, { from: 1651, to: 3200, rate: 15 }, { from: 3201, to: 5250, rate: 20 }, { from: 5251, to: 7770, rate: 25 }, { from: 7771, to: 10950, rate: 30 }, { from: 10951, to: null, rate: 35 }], taxFreeAllowance: 600 },
    socialContributions: [{ name: 'Pension', employeeRate: 7, employerRate: 11, cap: null }],
    withholdingTax: { dividends: 10, interest: 10, royalties: 10, notes: ['Reduced under tax treaties'] },
    invoice: { mandatoryFields: [{ field: 'invoiceNumber', label: 'Invoice Number', required: true }, { field: 'invoiceDate', label: 'Invoice Date', required: true }, { field: 'sellerName', label: 'Seller Details', required: true }, { field: 'sellerTIN', label: 'Seller TIN', required: true }, { field: 'buyerName', label: 'Buyer Details', required: true }, { field: 'items', label: 'Line Items', required: true }, { field: 'totalAmount', label: 'Total Amount', required: true }], eInvoicing: { system: 'None', description: 'Not yet implemented', mandatory: false, url: '' }, fiscalization: 'Not applicable', retentionPeriod: '10 years', format: 'PDF', seriesPrefix: 'INV' },
    taxForms: [{ code: 'VAT Return', name: 'VAT Return', frequency: 'Monthly', description: 'VAT return', authority: 'ERCA' }, { code: 'Corporate Tax Return', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Corporate income tax', authority: 'ERCA' }],
    payroll: { minimumWage: null, minimumWageCurrency: 'ETB', payPeriod: 'Monthly', overtimeMultiplier: 1.5, standardWorkHours: 48, annualLeaveDays: 16, sickLeaveDays: 30, sickLeavePayPercent: 100, maternityLeaveWeeks: 16, maternityPayPercent: 100, pensionAge: { male: 60, female: 60 }, noticePeriodDays: 30, probationPeriodDays: 90 },
  },

  // ===== NEPAL =====
  {
    code: 'NP', name: 'Nepal', flag: '🇳🇵', region: 'asia', currency: 'NPR', currencySymbol: 'Rs', language: 'Nepali',
    vat: { standardRate: 13, reducedRates: [], registrationThreshold: 2000000, exemptions: ['Exports', 'Healthcare', 'Education', 'Financial services'], isReverseChargeApplicable: false },
    corporateTax: { rate: 25, reducedRates: null, specialRegimes: ['Reduced for IT exporters', 'Industrial estate incentives'], taxLossCarryForward: 3 },
    incomeTax: { type: 'progressive', flatRate: null, brackets: [{ from: 0, to: 500000, rate: 1 }, { from: 500001, to: 700000, rate: 10 }, { from: 700001, to: 1000000, rate: 15 }, { from: 1000001, to: 2000000, rate: 20 }, { from: 2000001, to: 3000000, rate: 25 }, { from: 3000001, to: 4000000, rate: 30 }, { from: 4000001, to: null, rate: 36 }], taxFreeAllowance: 500000 },
    socialContributions: [{ name: 'Provident Fund', employeeRate: 10, employerRate: 10, cap: null }],
    withholdingTax: { dividends: 5, interest: 15, royalties: 15, notes: ['Reduced under tax treaties'] },
    invoice: { mandatoryFields: [{ field: 'invoiceNumber', label: 'Invoice Number', required: true }, { field: 'invoiceDate', label: 'Invoice Date', required: true }, { field: 'sellerName', label: 'Seller Details', required: true }, { field: 'sellerPAN', label: 'Seller PAN', required: true }, { field: 'buyerName', label: 'Buyer Details', required: true }, { field: 'items', label: 'Line Items', required: true }, { field: 'totalAmount', label: 'Total Amount', required: true }], eInvoicing: { system: 'None', description: 'Not yet implemented', mandatory: false, url: '' }, fiscalization: 'Not applicable', retentionPeriod: '7 years', format: 'PDF', seriesPrefix: 'INV' },
    taxForms: [{ code: 'VAT Return', name: 'VAT Return', frequency: 'Monthly', description: 'VAT return', authority: 'IRD' }, { code: 'Corporate Tax Return', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Corporate income tax', authority: 'IRD' }],
    payroll: { minimumWage: 15000, minimumWageCurrency: 'NPR', payPeriod: 'Monthly', overtimeMultiplier: 1.5, standardWorkHours: 48, annualLeaveDays: 13, sickLeaveDays: 365, sickLeavePayPercent: 50, maternityLeaveWeeks: 14, maternityPayPercent: 100, pensionAge: { male: 58, female: 58 }, noticePeriodDays: 30, probationPeriodDays: 90 },
  },

  // ===== SRI LANKA =====
  {
    code: 'LK', name: 'Sri Lanka', flag: '🇱🇰', region: 'asia', currency: 'LKR', currencySymbol: 'Rs', language: 'Sinhala/Tamil/English',
    vat: { standardRate: 15, reducedRates: [], registrationThreshold: 3000000, exemptions: ['Exports', 'Healthcare', 'Education', 'Financial services'], isReverseChargeApplicable: false },
    corporateTax: { rate: 30, reducedRates: null, specialRegimes: ['Reduced for BOI companies (14%)', 'Strategic investments'], taxLossCarryForward: null },
    incomeTax: { type: 'progressive', flatRate: null, brackets: [{ from: 0, to: 1200000, rate: 6 }, { from: 1200001, to: 1700000, rate: 12 }, { from: 1700001, to: 2600000, rate: 18 }, { from: 2600001, to: 3500000, rate: 24 }, { from: 3500001, to: null, rate: 30 }], taxFreeAllowance: 1200000 },
    socialContributions: [{ name: 'EPF', employeeRate: 8, employerRate: 12, cap: null }, { name: 'ETF', employeeRate: 3, employerRate: 3, cap: null }],
    withholdingTax: { dividends: 14, interest: 14, royalties: 14, notes: ['Reduced under tax treaties'] },
    invoice: { mandatoryFields: [{ field: 'invoiceNumber', label: 'Invoice Number', required: true }, { field: 'invoiceDate', label: 'Invoice Date', required: true }, { field: 'sellerName', label: 'Seller Details', required: true }, { field: 'sellerVAT', label: 'Seller VAT ID', required: true }, { field: 'buyerName', label: 'Buyer Details', required: true }, { field: 'items', label: 'Line Items', required: true }, { field: 'totalAmount', label: 'Total Amount', required: true }], eInvoicing: { system: 'None', description: 'Not yet implemented', mandatory: false, url: '' }, fiscalization: 'Not applicable', retentionPeriod: '7 years', format: 'PDF', seriesPrefix: 'INV' },
    taxForms: [{ code: 'VAT Return', name: 'VAT Return', frequency: 'Monthly', description: 'VAT return', authority: 'IRD' }, { code: 'Corporate Tax Return', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Corporate income tax', authority: 'IRD' }],
    payroll: { minimumWage: 20000, minimumWageCurrency: 'LKR', payPeriod: 'Monthly', overtimeMultiplier: 1.5, standardWorkHours: 45, annualLeaveDays: 14, sickLeaveDays: 365, sickLeavePayPercent: 60, maternityLeaveWeeks: 16, maternityPayPercent: 100, pensionAge: { male: 60, female: 60 }, noticePeriodDays: 30, probationPeriodDays: 90 },
  },

  // ===== MONGOLIA =====
  {
    code: 'MN', name: 'Mongolia', flag: '🇲🇳', region: 'asia', currency: 'MNT', currencySymbol: '₮', language: 'Mongolian',
    vat: { standardRate: 10, reducedRates: [], registrationThreshold: 100000000, exemptions: ['Exports', 'Healthcare', 'Education', 'Financial services'], isReverseChargeApplicable: false },
    corporateTax: { rate: 25, reducedRates: null, specialRegimes: ['Reduced 10% for priority sectors', 'Free zone incentives'], taxLossCarryForward: null },
    incomeTax: { type: 'progressive', flatRate: null, brackets: [{ from: 0, to: 12000000, rate: 10 }, { from: 12000001, to: 42000000, rate: 15 }, { from: 42000001, to: 84000000, rate: 20 }, { from: 84000001, to: 150000000, rate: 25 }, { from: 150000001, to: null, rate: 30 }], taxFreeAllowance: 0 },
    socialContributions: [{ name: 'Social Insurance', employeeRate: 10, employerRate: 11.5, cap: null }, { name: 'Health Insurance', employeeRate: 2, employerRate: 2, cap: null }],
    withholdingTax: { dividends: 20, interest: 20, royalties: 20, notes: ['Reduced under tax treaties'] },
    invoice: { mandatoryFields: [{ field: 'invoiceNumber', label: 'Invoice Number', required: true }, { field: 'invoiceDate', label: 'Invoice Date', required: true }, { field: 'sellerName', label: 'Seller Details', required: true }, { field: 'sellerTIN', label: 'Seller TIN', required: true }, { field: 'buyerName', label: 'Buyer Details', required: true }, { field: 'items', label: 'Line Items', required: true }, { field: 'totalAmount', label: 'Total Amount', required: true }], eInvoicing: { system: 'E-invoice', description: 'Being developed', mandatory: false, url: '' }, fiscalization: 'Not applicable', retentionPeriod: '5 years', format: 'PDF', seriesPrefix: 'INV' },
    taxForms: [{ code: 'VAT Return', name: 'VAT Return', frequency: 'Monthly', description: 'VAT return', authority: 'MNTA' }, { code: 'Corporate Tax Return', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Corporate income tax', authority: 'MNTA' }],
    payroll: { minimumWage: 600000, minimumWageCurrency: 'MNT', payPeriod: 'Monthly', overtimeMultiplier: 1.5, standardWorkHours: 48, annualLeaveDays: 15, sickLeaveDays: 365, sickLeavePayPercent: 70, maternityLeaveWeeks: 17, maternityPayPercent: 70, pensionAge: { male: 60, female: 55 }, noticePeriodDays: 30, probationPeriodDays: 90 },
  },

  // ===== KAZAKHSTAN =====
  {
    code: 'KZ', name: 'Kazakhstan', flag: '🇰🇿', region: 'asia', currency: 'KZT', currencySymbol: '₸', language: 'Kazakh/Russian',
    vat: { standardRate: 12, reducedRates: [], registrationThreshold: null, exemptions: ['Exports', 'Healthcare', 'Education', 'Financial services'], isReverseChargeApplicable: false },
    corporateTax: { rate: 20, reducedRates: null, specialRegimes: ['Reduced for priority activities (10-15%)', 'Special economic zones'], taxLossCarryForward: 10 },
    incomeTax: { type: 'progressive', flatRate: null, brackets: [{ from: 0, to: 1704000, rate: 0 }, { from: 1704001, to: 2280000, rate: 5 }, { from: 2280001, to: 3420000, rate: 10 }, { from: 3420001, to: 5700000, rate: 15 }, { from: 5700001, to: 9120000, rate: 20 }, { from: 9120001, to: 13860000, rate: 25 }, { from: 13860001, to: null, rate: 30 }], taxFreeAllowance: 1704000 },
    socialContributions: [{ name: 'Pension', employeeRate: 10, employerRate: 9, cap: null }, { name: 'Social Insurance', employeeRate: 2, employerRate: 5.5, cap: null }, { name: 'Medical', employeeRate: 0, employerRate: 2, cap: null }],
    withholdingTax: { dividends: 15, interest: 15, royalties: 15, notes: ['Reduced under tax treaties'] },
    invoice: { mandatoryFields: [{ field: 'invoiceNumber', label: 'Invoice Number', required: true }, { field: 'invoiceDate', label: 'Invoice Date', required: true }, { field: 'sellerName', label: 'Seller Details', required: true }, { field: 'sellerBIN', label: 'Seller BIN', required: true }, { field: 'buyerName', label: 'Buyer Details', required: true }, { field: 'items', label: 'Line Items', required: true }, { field: 'totalAmount', label: 'Total Amount', required: true }], eInvoicing: { system: 'E-invoice', description: 'Mandatory electronic invoicing since 2022', mandatory: true, startDate: '2022', url: '' }, fiscalization: 'Cash register control system (KKM)', retentionPeriod: '5 years', format: 'XML / PDF', seriesPrefix: 'ЭТ' },
    taxForms: [{ code: 'VAT Return', name: 'VAT Return', frequency: 'Monthly', description: 'VAT return', authority: 'STC' }, { code: 'Corporate Tax Return', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Corporate income tax', authority: 'STC' }],
    payroll: { minimumWage: 85000, minimumWageCurrency: 'KZT', payPeriod: 'Monthly', overtimeMultiplier: 1.5, standardWorkHours: 40, annualLeaveDays: 24, sickLeaveDays: 365, sickLeavePayPercent: 80, maternityLeaveWeeks: 20, maternityPayPercent: 100, pensionAge: { male: 63, female: 58 }, noticePeriodDays: 30, probationPeriodDays: 90 },
  },

  // ===== TAIWAN =====
  {
    code: 'TW', name: 'Taiwan', flag: '🇹🇼', region: 'asia', currency: 'TWD', currencySymbol: 'NT$', language: 'Mandarin Chinese',
    vat: { standardRate: 5, reducedRates: [], registrationThreshold: 4800000, exemptions: ['Exports', 'Healthcare', 'Education', 'Financial services'], isReverseChargeApplicable: false },
    corporateTax: { rate: 20, reducedRates: null, specialRegimes: ['Reduced for industries with high R&D spending'], taxLossCarryForward: 10 },
    incomeTax: { type: 'progressive', flatRate: null, brackets: [{ from: 0, to: 560000, rate: 5 }, { from: 560001, to: 1260000, rate: 12 }, { from: 1260001, to: 2520000, rate: 20 }, { from: 2520001, to: 4720000, rate: 30 }, { from: 4720001, to: null, rate: 40 }], taxFreeAllowance: 0 },
    socialContributions: [{ name: 'Labor Insurance', employeeRate: 7, employerRate: 7, cap: null }, { name: 'NHI', employeeRate: 1.91, employerRate: 2.55, cap: null }, { name: 'Pension', employeeRate: 6, employerRate: 6, cap: null }],
    withholdingTax: { dividends: 20, interest: 15, royalties: 20, notes: ['Reduced under tax treaties'] },
    invoice: { mandatoryFields: [{ field: 'invoiceNumber', label: 'Invoice Number', required: true }, { field: 'invoiceDate', label: 'Invoice Date', required: true }, { field: 'sellerName', label: 'Seller Details', required: true }, { field: 'sellerTaxID', label: 'Seller Tax ID', required: true }, { field: 'buyerName', label: 'Buyer Details', required: true }, { field: 'items', label: 'Line Items', required: true }, { field: 'totalAmount', label: 'Total Amount', required: true }], eInvoicing: { system: 'e-Invoice Platform', description: 'Government e-invoice platform mandatory for B2B', mandatory: true, startDate: '2017', url: 'https://www.einvoice.nat.gov.tw' }, fiscalization: 'Not applicable', retentionPeriod: '10 years', format: 'XML / PDF', seriesPrefix: 'INV' },
    taxForms: [{ code: 'VAT401', name: 'VAT Return', frequency: 'Monthly/Bimonthly', description: 'Business Tax Return', authority: 'National Tax Administration' }, { code: 'Corporate Tax Return', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Corporate income tax', authority: 'National Tax Administration' }],
    payroll: { minimumWage: null, minimumWageCurrency: 'TWD', payPeriod: 'Monthly', overtimeMultiplier: 1.33, standardWorkHours: 40, annualLeaveDays: 7, sickLeaveDays: 30, sickLeavePayPercent: 50, maternityLeaveWeeks: 8, maternityPayPercent: 100, pensionAge: { male: 65, female: 65 }, noticePeriodDays: 30, probationPeriodDays: 90 },
  },

  // ===== CAMBODIA =====
  {
    code: 'KH', name: 'Cambodia', flag: '🇰🇭', region: 'asia', currency: 'KHR', currencySymbol: '៛', language: 'Khmer',
    vat: { standardRate: 10, reducedRates: [], registrationThreshold: 60000000, exemptions: ['Exports', 'Healthcare', 'Education', 'Financial services'], isReverseChargeApplicable: false },
    corporateTax: { rate: 20, reducedRates: null, specialRegimes: ['Simplified regime for small taxpayers (1% turnover)', 'Qualified Investment Project incentives'], taxLossCarryForward: 5 },
    incomeTax: { type: 'progressive', flatRate: null, brackets: [{ from: 0, to: 1200000, rate: 0 }, { from: 1200001, to: 8200000, rate: 5 }, { from: 8200001, to: 10000000, rate: 10 }, { from: 10000001, to: 12500000, rate: 15 }, { from: 12500001, to: null, rate: 20 }], taxFreeAllowance: 1200000 },
    socialContributions: [{ name: 'NSSF', employeeRate: 1.5, employerRate: 3.8, cap: null }, { name: 'Health Insurance', employeeRate: 1, employerRate: 2, cap: null }],
    withholdingTax: { dividends: 14, interest: 15, royalties: 15, notes: ['Reduced under tax treaties'] },
    invoice: { mandatoryFields: [{ field: 'invoiceNumber', label: 'Invoice Number', required: true }, { field: 'invoiceDate', label: 'Invoice Date', required: true }, { field: 'sellerName', label: 'Seller Details', required: true }, { field: 'sellerTIN', label: 'Seller TIN', required: true }, { field: 'buyerName', label: 'Buyer Details', required: true }, { field: 'items', label: 'Line Items', required: true }, { field: 'totalAmount', label: 'Total Amount', required: true }], eInvoicing: { system: 'None', description: 'Not yet implemented', mandatory: false, url: '' }, fiscalization: 'Not applicable', retentionPeriod: '10 years', format: 'PDF', seriesPrefix: 'INV' },
    taxForms: [{ code: 'VAT Return', name: 'VAT Return', frequency: 'Monthly', description: 'Monthly VAT return', authority: 'GDT' }, { code: 'Corporate Tax Return', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Annual corporate income tax', authority: 'GDT' }],
    payroll: { minimumWage: 208000, minimumWageCurrency: 'KHR', payPeriod: 'Monthly', overtimeMultiplier: 1.5, standardWorkHours: 48, annualLeaveDays: 18, sickLeaveDays: 30, sickLeavePayPercent: 50, maternityLeaveWeeks: 13, maternityPayPercent: 100, pensionAge: { male: 60, female: 55 }, noticePeriodDays: 30, probationPeriodDays: 90 },
  },

  // ===== LAOS =====
  {
    code: 'LA', name: 'Laos', flag: '🇱🇦', region: 'asia', currency: 'LAK', currencySymbol: '₭', language: 'Lao',
    vat: { standardRate: 10, reducedRates: [], registrationThreshold: 600000000, exemptions: ['Exports', 'Healthcare', 'Education', 'Financial services'], isReverseChargeApplicable: false },
    corporateTax: { rate: 20, reducedRates: null, specialRegimes: ['Reduced 10% for agriculture, forestry, industry', 'SEZ incentives'], taxLossCarryForward: 3 },
    incomeTax: { type: 'progressive', flatRate: null, brackets: [{ from: 0, to: 5000000, rate: 0 }, { from: 5000001, to: 10000000, rate: 5 }, { from: 10000001, to: 30000000, rate: 10 }, { from: 30000001, to: 50000000, rate: 15 }, { from: 50000001, to: null, rate: 25 }], taxFreeAllowance: 5000000 },
    socialContributions: [{ name: 'Social Security', employeeRate: 5.5, employerRate: 6, cap: null }],
    withholdingTax: { dividends: 10, interest: 10, royalties: 5, notes: ['Reduced under tax treaties'] },
    invoice: { mandatoryFields: [{ field: 'invoiceNumber', label: 'Invoice Number', required: true }, { field: 'invoiceDate', label: 'Invoice Date', required: true }, { field: 'sellerName', label: 'Seller Details', required: true }, { field: 'sellerTIN', label: 'Seller TIN', required: true }, { field: 'buyerName', label: 'Buyer Details', required: true }, { field: 'items', label: 'Line Items', required: true }, { field: 'totalAmount', label: 'Total Amount', required: true }], eInvoicing: { system: 'None', description: 'Not yet implemented', mandatory: false, url: '' }, fiscalization: 'Not applicable', retentionPeriod: '10 years', format: 'PDF', seriesPrefix: 'INV' },
    taxForms: [{ code: 'VAT Return', name: 'VAT Return', frequency: 'Monthly', description: 'Monthly VAT return', authority: 'Tax Department' }, { code: 'Corporate Tax Return', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Corporate income tax', authority: 'Tax Department' }],
    payroll: { minimumWage: 1600000, minimumWageCurrency: 'LAK', payPeriod: 'Monthly', overtimeMultiplier: 1.5, standardWorkHours: 48, annualLeaveDays: 15, sickLeaveDays: 30, sickLeavePayPercent: 60, maternityLeaveWeeks: 14, maternityPayPercent: 100, pensionAge: { male: 60, female: 55 }, noticePeriodDays: 30, probationPeriodDays: 90 },
  },

  // ===== MYANMAR =====
  {
    code: 'MM', name: 'Myanmar', flag: '🇲🇲', region: 'asia', currency: 'MMK', currencySymbol: 'K', language: 'Burmese',
    vat: { standardRate: 5, reducedRates: [], registrationThreshold: null, exemptions: ['Exports', 'Healthcare', 'Education', 'Financial services'], isReverseChargeApplicable: false },
    corporateTax: { rate: 25, reducedRates: null, specialRegimes: ['Reduced 10% for export-oriented businesses', 'SEZ incentives'], taxLossCarryForward: 3 },
    incomeTax: { type: 'progressive', flatRate: null, brackets: [{ from: 0, to: 2000000, rate: 0 }, { from: 2000001, to: 5000000, rate: 5 }, { from: 5000001, to: 10000000, rate: 10 }, { from: 10000001, to: 20000000, rate: 15 }, { from: 20000001, to: 30000000, rate: 20 }, { from: 30000001, to: null, rate: 25 }], taxFreeAllowance: 2000000 },
    socialContributions: [{ name: 'Social Security', employeeRate: 2, employerRate: 3, cap: null }],
    withholdingTax: { dividends: 15, interest: 15, royalties: 15, notes: ['Reduced under tax treaties'] },
    invoice: { mandatoryFields: [{ field: 'invoiceNumber', label: 'Invoice Number', required: true }, { field: 'invoiceDate', label: 'Invoice Date', required: true }, { field: 'sellerName', label: 'Seller Details', required: true }, { field: 'sellerTIN', label: 'Seller TIN', required: true }, { field: 'buyerName', label: 'Buyer Details', required: true }, { field: 'items', label: 'Line Items', required: true }, { field: 'totalAmount', label: 'Total Amount', required: true }], eInvoicing: { system: 'None', description: 'Not yet implemented', mandatory: false, url: '' }, fiscalization: 'Not applicable', retentionPeriod: '5 years', format: 'PDF', seriesPrefix: 'INV' },
    taxForms: [{ code: 'VAT Return', name: 'VAT Return', frequency: 'Monthly', description: 'Commercial Tax return', authority: 'IRD' }, { code: 'Corporate Tax Return', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Corporate income tax', authority: 'IRD' }],
    payroll: { minimumWage: 6800, minimumWageCurrency: 'MMK', payPeriod: 'Daily', overtimeMultiplier: 1.5, standardWorkHours: 48, annualLeaveDays: 10, sickLeaveDays: 30, sickLeavePayPercent: 67, maternityLeaveWeeks: 14, maternityPayPercent: 100, pensionAge: { male: 60, female: 55 }, noticePeriodDays: 30, probationPeriodDays: 90 },
  },

  // ===== UZBEKISTAN =====
  {
    code: 'UZ', name: 'Uzbekistan', flag: '🇺🇿', region: 'asia', currency: 'UZS', currencySymbol: 'сўм', language: 'Uzbek',
    vat: { standardRate: 12, reducedRates: [], registrationThreshold: 100000000, exemptions: ['Exports', 'Healthcare', 'Education', 'Financial services'], isReverseChargeApplicable: false },
    corporateTax: { rate: 15, reducedRates: null, specialRegimes: ['Reduced 7.5% for small businesses', 'Free economic zone incentives'], taxLossCarryForward: 5 },
    incomeTax: { type: 'progressive', flatRate: null, brackets: [{ from: 0, to: 2860000, rate: 0 }, { from: 2860001, to: 5160000, rate: 7.5 }, { from: 5160001, to: 8200000, rate: 15 }, { from: 8200001, to: null, rate: 22 }], taxFreeAllowance: 2860000 },
    socialContributions: [{ name: 'Pension Fund', employeeRate: 8, employerRate: 19, cap: null }, { name: 'Social Insurance', employeeRate: 1.5, employerRate: 2, cap: null }],
    withholdingTax: { dividends: 10, interest: 10, royalties: 20, notes: ['Reduced under tax treaties'] },
    invoice: { mandatoryFields: [{ field: 'invoiceNumber', label: 'Invoice Number', required: true }, { field: 'invoiceDate', label: 'Invoice Date', required: true }, { field: 'sellerName', label: 'Seller Details', required: true }, { field: 'sellerTIN', label: 'Seller TIN', required: true }, { field: 'buyerName', label: 'Buyer Details', required: true }, { field: 'items', label: 'Line Items', required: true }, { field: 'totalAmount', label: 'Total Amount', required: true }], eInvoicing: { system: 'E-invoice', description: 'Mandatory electronic invoicing being phased in', mandatory: true, startDate: '2024', url: '' }, fiscalization: 'Not applicable', retentionPeriod: '5 years', format: 'XML / PDF', seriesPrefix: 'INV' },
    taxForms: [{ code: 'VAT Return', name: 'VAT Return', frequency: 'Monthly', description: 'Monthly VAT return', authority: 'STC' }, { code: 'Corporate Tax Return', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Corporate income tax', authority: 'STC' }],
    payroll: { minimumWage: 1000000, minimumWageCurrency: 'UZS', payPeriod: 'Monthly', overtimeMultiplier: 2, standardWorkHours: 40, annualLeaveDays: 15, sickLeaveDays: 365, sickLeavePayPercent: 80, maternityLeaveWeeks: 16, maternityPayPercent: 100, pensionAge: { male: 60, female: 55 }, noticePeriodDays: 30, probationPeriodDays: 90 },
  },

  // ===== RWANDA =====
  {
    code: 'RW', name: 'Rwanda', flag: '🇷🇼', region: 'africa', currency: 'RWF', currencySymbol: 'FRw', language: 'Kinyarwanda',
    vat: { standardRate: 18, reducedRates: [], registrationThreshold: 20000000, exemptions: ['Exports', 'Healthcare', 'Education', 'Financial services'], isReverseChargeApplicable: false },
    corporateTax: { rate: 30, reducedRates: null, specialRegimes: ['Reduced 0% for exports and strategic sectors', 'SEZ incentives'], taxLossCarryForward: 5 },
    incomeTax: { type: 'progressive', flatRate: null, brackets: [{ from: 0, to: 36000, rate: 0 }, { from: 36001, to: 120000, rate: 20 }, { from: 120001, to: null, rate: 30 }], taxFreeAllowance: 36000 },
    socialContributions: [{ name: 'Pension', employeeRate: 3, employerRate: 5, cap: null }, { name: 'Health Insurance', employeeRate: 2, employerRate: 3, cap: null }, { name: 'Maternity', employeeRate: 0.3, employerRate: 0.3, cap: null }],
    withholdingTax: { dividends: 15, interest: 15, royalties: 15, notes: ['Reduced under tax treaties'] },
    invoice: { mandatoryFields: [{ field: 'invoiceNumber', label: 'Invoice Number', required: true }, { field: 'invoiceDate', label: 'Invoice Date', required: true }, { field: 'sellerName', label: 'Seller Details', required: true }, { field: 'sellerTIN', label: 'Seller TIN', required: true }, { field: 'buyerName', label: 'Buyer Details', required: true }, { field: 'items', label: 'Line Items', required: true }, { field: 'totalAmount', label: 'Total Amount', required: true }], eInvoicing: { system: 'e-Billing', description: 'Mandatory electronic invoicing', mandatory: true, startDate: '2023', url: '' }, fiscalization: 'Not applicable', retentionPeriod: '10 years', format: 'XML / PDF', seriesPrefix: 'INV' },
    taxForms: [{ code: 'VAT Return', name: 'VAT Return', frequency: 'Monthly', description: 'Monthly VAT return', authority: 'RRA' }, { code: 'Corporate Tax Return', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Corporate income tax', authority: 'RRA' }],
    payroll: { minimumWage: null, minimumWageCurrency: 'RWF', payPeriod: 'Monthly', overtimeMultiplier: 1.5, standardWorkHours: 45, annualLeaveDays: 18, sickLeaveDays: 26, sickLeavePayPercent: 100, maternityLeaveWeeks: 12, maternityPayPercent: 100, pensionAge: { male: 60, female: 55 }, noticePeriodDays: 15, probationPeriodDays: 90 },
  },

  // ===== HAITI =====
  {
    code: 'HT', name: 'Haiti', flag: '🇭🇹', region: 'americas', currency: 'HTG', currencySymbol: 'G', language: 'Haitian Creole/French',
    vat: { standardRate: 10, reducedRates: [], registrationThreshold: 1500000, exemptions: ['Exports', 'Healthcare', 'Education', 'Financial services'], isReverseChargeApplicable: false },
    corporateTax: { rate: 30, reducedRates: null, specialRegimes: ['Reduced for tourism sector', 'Free zone incentives'], taxLossCarryForward: 3 },
    incomeTax: { type: 'progressive', flatRate: null, brackets: [{ from: 0, to: 240000, rate: 0 }, { from: 240001, to: 960000, rate: 10 }, { from: 960001, to: 2400000, rate: 15 }, { from: 2400001, to: null, rate: 30 }], taxFreeAllowance: 240000 },
    socialContributions: [{ name: 'Social Security (ONA)', employeeRate: 3, employerRate: 6, cap: null }],
    withholdingTax: { dividends: 15, interest: 15, royalties: 15, notes: ['Reduced under tax treaties'] },
    invoice: { mandatoryFields: [{ field: 'invoiceNumber', label: 'Invoice Number', required: true }, { field: 'invoiceDate', label: 'Invoice Date', required: true }, { field: 'sellerName', label: 'Seller Details', required: true }, { field: 'sellerNIF', label: 'Seller NIF', required: true }, { field: 'buyerName', label: 'Buyer Details', required: true }, { field: 'items', label: 'Line Items', required: true }, { field: 'totalAmount', label: 'Total Amount', required: true }], eInvoicing: { system: 'None', description: 'Not yet implemented', mandatory: false, url: '' }, fiscalization: 'Not applicable', retentionPeriod: '10 years', format: 'PDF', seriesPrefix: 'INV' },
    taxForms: [{ code: 'VAT Return', name: 'VAT Return', frequency: 'Monthly', description: 'Monthly VAT return', authority: 'DGI' }, { code: 'Corporate Tax Return', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Corporate income tax', authority: 'DGI' }],
    payroll: { minimumWage: 500, minimumWageCurrency: 'HTG', payPeriod: 'Daily', overtimeMultiplier: 1.5, standardWorkHours: 48, annualLeaveDays: 15, sickLeaveDays: 14, sickLeavePayPercent: 67, maternityLeaveWeeks: 12, maternityPayPercent: 100, pensionAge: { male: 60, female: 60 }, noticePeriodDays: 15, probationPeriodDays: 90 },
  },

  // ===== PARAGUAY =====
  {
    code: 'PY', name: 'Paraguay', flag: '🇵🇾', region: 'americas', currency: 'PYG', currencySymbol: '₲', language: 'Spanish/Guarani',
    vat: { standardRate: 10, reducedRates: [{ rate: 5, description: 'Basic food basket, medicines' }], registrationThreshold: null, exemptions: ['Exports', 'Healthcare', 'Education', 'Financial services'], isReverseChargeApplicable: true },
    corporateTax: { rate: 10, reducedRates: null, specialRegimes: ['Unified agricultural income tax 10%', 'MAquiladora incentives'], taxLossCarryForward: 3 },
    incomeTax: { type: 'progressive', flatRate: null, brackets: [{ from: 0, to: 12000000, rate: 0 }, { from: 12000001, to: 36000000, rate: 8 }, { from: 36000001, to: 72000000, rate: 10 }, { from: 72000001, to: null, rate: 10 }], taxFreeAllowance: 12000000 },
    socialContributions: [{ name: 'IPS (Pension)', employeeRate: 9, employerRate: 16.5, cap: null }, { name: 'Health', employeeRate: 1.5, employerRate: 5.5, cap: null }],
    withholdingTax: { dividends: 15, interest: 15, royalties: 15, notes: ['Reduced under tax treaties'] },
    invoice: { mandatoryFields: [{ field: 'invoiceNumber', label: 'Invoice Number', required: true }, { field: 'invoiceDate', label: 'Invoice Date', required: true }, { field: 'sellerName', label: 'Seller Details', required: true }, { field: 'sellerRUC', label: 'Seller RUC', required: true }, { field: 'buyerName', label: 'Buyer Details', required: true }, { field: 'items', label: 'Line Items', required: true }, { field: 'totalAmount', label: 'Total Amount', required: true }], eInvoicing: { system: 'Marangatu', description: 'Electronic invoicing being phased in by SET', mandatory: false, startDate: '2025 (planned)', url: '' }, fiscalization: 'Not applicable', retentionPeriod: '10 years', format: 'PDF / XML', seriesPrefix: 'INV' },
    taxForms: [{ code: 'IVA', name: 'VAT Return', frequency: 'Monthly', description: 'Monthly VAT return', authority: 'SET' }, { code: 'IRE', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Corporate income tax', authority: 'SET' }],
    payroll: { minimumWage: 2787575, minimumWageCurrency: 'PYG', payPeriod: 'Monthly', overtimeMultiplier: 1.5, standardWorkHours: 48, annualLeaveDays: 12, sickLeaveDays: 365, sickLeavePayPercent: 67, maternityLeaveWeeks: 18, maternityPayPercent: 100, pensionAge: { male: 60, female: 55 }, noticePeriodDays: 30, probationPeriodDays: 90 },
  },

  // ===== SAMOA =====
  {
    code: 'WS', name: 'Samoa', flag: '🇼🇸', region: 'oceania', currency: 'WST', currencySymbol: 'WS$', language: 'Samoan/English',
    vat: { standardRate: 15, reducedRates: [], registrationThreshold: 100000, exemptions: ['Exports', 'Healthcare', 'Education', 'Financial services'], isReverseChargeApplicable: false },
    corporateTax: { rate: 27, reducedRates: null, specialRegimes: ['Reduced for manufacturing and tourism', 'Development incentive areas'], taxLossCarryForward: null },
    incomeTax: { type: 'progressive', flatRate: null, brackets: [{ from: 0, to: 20000, rate: 0 }, { from: 20001, to: 30000, rate: 15 }, { from: 30001, to: 60000, rate: 20 }, { from: 60001, to: 100000, rate: 27 }, { from: 100001, to: null, rate: 27 }], taxFreeAllowance: 20000 },
    socialContributions: [{ name: 'NPF', employeeRate: 5, employerRate: 5, cap: null }],
    withholdingTax: { dividends: 15, interest: 15, royalties: 15, notes: ['Reduced under tax treaties'] },
    invoice: { mandatoryFields: [{ field: 'invoiceNumber', label: 'Invoice Number', required: true }, { field: 'invoiceDate', label: 'Invoice Date', required: true }, { field: 'sellerName', label: 'Seller Details', required: true }, { field: 'sellerTIN', label: 'Seller TIN', required: true }, { field: 'buyerName', label: 'Buyer Details', required: true }, { field: 'items', label: 'Line Items', required: true }, { field: 'totalAmount', label: 'Total Amount', required: true }], eInvoicing: { system: 'None', description: 'Not yet implemented', mandatory: false, url: '' }, fiscalization: 'Not applicable', retentionPeriod: '7 years', format: 'PDF', seriesPrefix: 'INV' },
    taxForms: [{ code: 'VAT Return', name: 'VAT Return', frequency: 'Monthly', description: 'VAT/GST return', authority: 'MNR' }, { code: 'Corporate Tax Return', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Corporate income tax', authority: 'MNR' }],
    payroll: { minimumWage: null, minimumWageCurrency: 'WST', payPeriod: 'Monthly', overtimeMultiplier: 1.5, standardWorkHours: 40, annualLeaveDays: 10, sickLeaveDays: 30, sickLeavePayPercent: 80, maternityLeaveWeeks: 13, maternityPayPercent: 100, pensionAge: { male: 55, female: 55 }, noticePeriodDays: 14, probationPeriodDays: 90 },
  },

  // ===== TONGA =====
  {
    code: 'TO', name: 'Tonga', flag: '🇹🇴', region: 'oceania', currency: 'TOP', currencySymbol: 'T$', language: 'Tongan/English',
    vat: { standardRate: 15, reducedRates: [], registrationThreshold: 100000, exemptions: ['Exports', 'Healthcare', 'Education', 'Financial services'], isReverseChargeApplicable: false },
    corporateTax: { rate: 25, reducedRates: null, specialRegimes: ['Reduced for approved industries', 'Tax holidays for new investments'], taxLossCarryForward: null },
    incomeTax: { type: 'progressive', flatRate: null, brackets: [{ from: 0, to: 7500, rate: 0 }, { from: 7501, to: 30000, rate: 10 }, { from: 30001, to: 60000, rate: 20 }, { from: 60001, to: 100000, rate: 25 }, { from: 100001, to: null, rate: 30 }], taxFreeAllowance: 7500 },
    socialContributions: [{ name: 'Superannuation', employeeRate: 5, employerRate: 5, cap: null }],
    withholdingTax: { dividends: 15, interest: 10, royalties: 15, notes: ['Reduced under tax treaties'] },
    invoice: { mandatoryFields: [{ field: 'invoiceNumber', label: 'Invoice Number', required: true }, { field: 'invoiceDate', label: 'Invoice Date', required: true }, { field: 'sellerName', label: 'Seller Details', required: true }, { field: 'sellerTIN', label: 'Seller TIN', required: true }, { field: 'buyerName', label: 'Buyer Details', required: true }, { field: 'items', label: 'Line Items', required: true }, { field: 'totalAmount', label: 'Total Amount', required: true }], eInvoicing: { system: 'None', description: 'Not yet implemented', mandatory: false, url: '' }, fiscalization: 'Not applicable', retentionPeriod: '7 years', format: 'PDF', seriesPrefix: 'INV' },
    taxForms: [{ code: 'VAT Return', name: 'VAT Return', frequency: 'Monthly', description: 'Consumption tax return', authority: 'TRD' }, { code: 'Corporate Tax Return', name: 'Corporate Tax Return', frequency: 'Annually', description: 'Corporate income tax', authority: 'TRD' }],
    payroll: { minimumWage: null, minimumWageCurrency: 'TOP', payPeriod: 'Monthly', overtimeMultiplier: 1.5, standardWorkHours: 40, annualLeaveDays: 10, sickLeaveDays: 30, sickLeavePayPercent: 80, maternityLeaveWeeks: 13, maternityPayPercent: 100, pensionAge: { male: 60, female: 55 }, noticePeriodDays: 14, probationPeriodDays: 90 },
  },
]

// ============ UTILITY FUNCTIONS ============

export function getTaxLaw(countryCode: string): TaxLaw | undefined {
  return COUNTRY_TAX_LAWS.find(c => c.code === countryCode)
}

export function getCountriesByRegion(region: 'europe' | 'americas' | 'asia' | 'africa' | 'oceania' | 'all'): TaxLaw[] {
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
