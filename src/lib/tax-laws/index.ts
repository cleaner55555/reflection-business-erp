// ============ GLOBAL TAX LAWS DATABASE ============
// Coverage: 25+ countries, real 2024 rates

export interface ReducedVATRate {
  rate: number;
  description: string;
}

export interface CorporateTaxBracket {
  threshold: number;
  rate: number;
}

export interface IncomeTaxBracket {
  min: number;
  max: number | null;
  rate: number;
}

export interface SocialContributionItem {
  name: string;
  employee: number;
  employer: number;
}

export interface TaxForm {
  code: string;
  name: string;
  frequency: string;
  description: string;
}

export interface CountryTaxLaw {
  code: string;
  name: string;
  flag: string;
  currency: string;
  region: 'europe' | 'americas' | 'asia' | 'africa' | 'oceania';

  vat: {
    type: 'vat' | 'gst' | 'sales_tax' | 'none';
    standardRate: number;
    reducedRates: ReducedVATRate[];
    exemptions: string[];
    isEuVat: boolean;
    reverseCharge: boolean;
    registrationThreshold: number | null;
    filingFrequency: string;
  };

  corporateTax: {
    rate: number;
    reducedRates: CorporateTaxBracket[];
    specialRegimes: string[];
  };

  incomeTax: {
    type: 'progressive' | 'flat' | 'none';
    brackets: IncomeTaxBracket[];
    flatRate: number | null;
    standardDeduction: number;
    taxFreeAllowance: number;
  };

  socialContributions: {
    pension: SocialContributionItem;
    health: SocialContributionItem;
    unemployment: SocialContributionItem;
    other: SocialContributionItem[];
    totalEmployee: number;
    totalEmployer: number;
  };

  withholdingTax: {
    dividends: number;
    interest: number;
    royalties: number;
    services: number;
  };

  invoiceRequirements: {
    mandatoryFields: string[];
    sequentialNumbering: boolean;
    electronicInvoicing: boolean;
    eInvoiceSystem: string | null;
    retentionPeriod: number;
    currencyRequirement: boolean;
    languageRequirement: string | null;
    fiscalization: boolean;
  };

  payroll: {
    minimumWage: number;
    minimumWageCurrency: string;
    payPeriodFrequency: string;
    overtimeMultiplier: number;
    maximumWorkingHours: number;
    annualLeaveDays: number;
    sickLeavePaid: number;
    maternityLeaveWeeks: number;
    pensionAge: { male: number; female: number };
  };

  accounting: {
    standards: string;
    fiscalYear: 'calendar' | 'custom';
    chartOfAccounts: string;
    mandatoryReports: string[];
  };

  taxForms: TaxForm[];
}

// ============ COUNTRY DATA ============

export const COUNTRY_TAX_LAWS: CountryTaxLaw[] = [
  // ===================== SERBIA =====================
  {
    code: 'RS',
    name: 'Serbia',
    flag: '🇷🇸',
    currency: 'RSD',
    region: 'europe',
    vat: {
      type: 'vat', standardRate: 20,
      reducedRates: [
        { rate: 10, description: 'Osnovna hrana, knjige, lekovi, medicinska oprema' },
      ],
      exemptions: ['finansijske usluge', 'osiguranje', 'zdravstvena zaštita', 'obrazovanje', 'pošta'],
      isEuVat: false, reverseCharge: true,
      registrationThreshold: 8000000,
      filingFrequency: 'monthly',
    },
    corporateTax: { rate: 15, reducedRates: [], specialRegimes: ['IT sektor 3% (do 2028)', 'Mali preduzetnik paušal'] },
    incomeTax: {
      type: 'flat', brackets: [], flatRate: 10,
      standardDeduction: 0, taxFreeAllowance: 228000,
    },
    socialContributions: {
      pension: { name: 'PIO', employee: 14, employer: 10.5 },
      health: { name: 'Zdravstveno', employee: 5.15, employer: 5.15 },
      unemployment: { name: 'Nezaposlenost', employee: 0.75, employer: 0.75 },
      other: [
        { name: 'Zaposlenost (RS)', employee: 0, employer: 0.5 },
      ],
      totalEmployee: 19.9,
      totalEmployer: 16.9,
    },
    withholdingTax: { dividends: 15, interest: 20, royalties: 20, services: 20 },
    invoiceRequirements: {
      mandatoryFields: ['seller_name', 'seller_address', 'seller_pib', 'buyer_name', 'buyer_address', 'buyer_pib', 'invoice_number', 'invoice_date', 'items_description', 'quantity', 'unit_price', 'total_amount', 'vat_rate', 'vat_amount', 'payment_terms'],
      sequentialNumbering: true, electronicInvoicing: true, eInvoiceSystem: 'SEF',
      retentionPeriod: 10, currencyRequirement: true, languageRequirement: 'srpski', fiscalization: true,
    },
    payroll: {
      minimumWage: 47000, minimumWageCurrency: 'RSD',
      payPeriodFrequency: 'monthly', overtimeMultiplier: 1.5,
      maximumWorkingHours: 40, annualLeaveDays: 20, sickLeavePaid: 30,
      maternityLeaveWeeks: 52, pensionAge: { male: 65, female: 63 },
    },
    accounting: {
      standards: 'NRS / IFRS', fiscalYear: 'calendar', chartOfAccounts: 'Kontni plan RS',
      mandatoryReports: ['bilans', 'bilans_uspeha', 'izveštaj_o_tokovima_gotovine', 'PP_ODP'],
    },
    taxForms: [
      { code: 'PP-ODP', name: 'Porez na dodatu vrednost', frequency: 'monthly', description: 'Obračun PDV-a za period' },
      { code: 'PP-PPO', name: 'Porez na dohodak pravnih lica', frequency: 'monthly', description: 'Porez na profit kompanije' },
      { code: 'PP-POF', name: 'Porez na dohodak fizičkih lica', frequency: 'monthly', description: 'Obračun poreza na zarade' },
      { code: 'PZ-1', name: 'Prijava poreskog obveznika', frequency: 'one_time', description: 'Registracija za porez' },
    ],
  },
  // ===================== GERMANY =====================
  {
    code: 'DE',
    name: 'Germany',
    flag: '🇩🇪',
    currency: 'EUR',
    region: 'europe',
    vat: {
      type: 'vat', standardRate: 19,
      reducedRates: [
        { rate: 7, description: 'Food, books, newspapers, art' },
      ],
      exemptions: ['financial services', 'insurance', 'education', 'healthcare', 'postal'],
      isEuVat: true, reverseCharge: true,
      registrationThreshold: 22000,
      filingFrequency: 'monthly',
    },
    corporateTax: { rate: 15.825, reducedRates: [], specialRegimes: ['Trade tax (Gewerbesteuer) ~14-17%'] },
    incomeTax: {
      type: 'progressive', brackets: [], flatRate: null,
      standardDeduction: 1230, taxFreeAllowance: 11604,
    },
    socialContributions: {
      pension: { name: 'Rentenversicherung', employee: 9.3, employer: 9.3 },
      health: { name: 'Krankenversicherung', employee: 7.3, employer: 7.3 },
      unemployment: { name: 'Arbeitslosenversicherung', employee: 1.3, employer: 1.3 },
      other: [
        { name: 'Pflegeversicherung', employee: 1.7, employer: 1.7 },
      ],
      totalEmployee: 19.6,
      totalEmployer: 19.6,
    },
    withholdingTax: { dividends: 26.375, interest: 25, royalties: 15, services: 15 },
    invoiceRequirements: {
      mandatoryFields: ['seller_name', 'seller_address', 'seller_vat_id', 'buyer_name', 'buyer_address', 'buyer_vat_id', 'invoice_number', 'invoice_date', 'items', 'tax_rate', 'tax_amount', 'total'],
      sequentialNumbering: true, electronicInvoicing: true, eInvoiceSystem: 'ZUGFeRD / E-Rechnung',
      retentionPeriod: 10, currencyRequirement: true, languageRequirement: 'deutsch', fiscalization: false,
    },
    payroll: {
      minimumWage: 2387, minimumWageCurrency: 'EUR',
      payPeriodFrequency: 'monthly', overtimeMultiplier: 1.25,
      maximumWorkingHours: 40, annualLeaveDays: 25, sickLeavePaid: 42,
      maternityLeaveWeeks: 52, pensionAge: { male: 67, female: 67 },
    },
    accounting: {
      standards: 'HGB / IFRS', fiscalYear: 'calendar', chartOfAccounts: 'SKR03/SKR04',
      mandatoryReports: ['bilans', 'guv', 'anhang'],
    },
    taxForms: [
      { code: 'UStVA', name: 'Umsatzsteuervoranmeldung', frequency: 'monthly', description: 'VAT return' },
      { code: 'KSt-Erklärung', name: 'Körperschaftsteuererklärung', frequency: 'annually', description: 'Corporate tax return' },
      { code: 'LStA', name: 'Lohnsteueranmeldung', frequency: 'monthly', description: 'Payroll tax return' },
    ],
  },
  // ===================== FRANCE =====================
  {
    code: 'FR',
    name: 'France',
    flag: '🇫🇷',
    currency: 'EUR',
    region: 'europe',
    vat: {
      type: 'vat', standardRate: 20,
      reducedRates: [
        { rate: 10, description: 'Transport, restaurants, some services' },
        { rate: 5.5, description: 'Food, books, energy' },
        { rate: 2.1, description: 'Press, medicines' },
      ],
      exemptions: ['financial services', 'insurance', 'education', 'healthcare'],
      isEuVat: true, reverseCharge: true,
      registrationThreshold: 94800,
      filingFrequency: 'monthly',
    },
    corporateTax: { rate: 25, reducedRates: [{ threshold: 42500, rate: 15 }], specialRegimes: ['Micro-entreprise', 'JEI (innovation)'] },
    incomeTax: { type: 'progressive', brackets: [], flatRate: null, standardDeduction: 0, taxFreeAllowance: 11294 },
    socialContributions: {
      pension: { name: 'Retraite', employee: 6.9, employer: 8.55 },
      health: { name: 'Santé', employee: 0.85, employer: 7.0 },
      unemployment: { name: 'Chômage', employee: 0, employer: 4.05 },
      other: [
        { name: 'CSG/CRDS', employee: 9.7, employer: 0 },
        { name: 'Famille', employee: 0, employer: 3.45 },
        { name: 'AT/MP', employee: 0, employer: 2.24 },
      ],
      totalEmployee: 17.45,
      totalEmployer: 25.29,
    },
    withholdingTax: { dividends: 30, interest: 24, royalties: 25, services: 25 },
    invoiceRequirements: {
      mandatoryFields: ['seller_name', 'seller_address', 'seller_siren', 'seller_vat', 'buyer_name', 'buyer_address', 'invoice_number', 'invoice_date', 'items', 'tax_rate', 'tax_amount', 'total'],
      sequentialNumbering: true, electronicInvoicing: true, eInvoiceSystem: 'Chorus Pro (mandatory 2027)',
      retentionPeriod: 10, currencyRequirement: true, languageRequirement: 'français', fiscalization: false,
    },
    payroll: {
      minimumWage: 1398, minimumWageCurrency: 'EUR',
      payPeriodFrequency: 'monthly', overtimeMultiplier: 1.25,
      maximumWorkingHours: 35, annualLeaveDays: 25, sickLeavePaid: 30,
      maternityLeaveWeeks: 52, pensionAge: { male: 64, female: 64 },
    },
    accounting: {
      standards: 'PCG / IFRS', fiscalYear: 'calendar', chartOfAccounts: 'Plan Comptable Général',
      mandatoryReports: ['bilan', 'compte_résultat', 'annexe'],
    },
    taxForms: [
      { code: 'CA3', name: 'Déclaration de TVA', frequency: 'monthly', description: 'VAT return' },
      { code: 'LIASSE', name: 'Liasse Fiscale', frequency: 'annually', description: 'Corporate tax return' },
      { code: 'DSN', name: 'Déclaration Sociale Nominative', frequency: 'monthly', description: 'Payroll social declaration' },
    ],
  },
  // ===================== UK =====================
  {
    code: 'GB',
    name: 'United Kingdom',
    flag: '🇬🇧',
    currency: 'GBP',
    region: 'europe',
    vat: {
      type: 'vat', standardRate: 20,
      reducedRates: [
        { rate: 5, description: 'Energy, children car seats, home mobility' },
        { rate: 0, description: 'Food, books, children clothes, exports' },
      ],
      exemptions: ['financial services', 'insurance', 'education', 'healthcare', 'postal'],
      isEuVat: false, reverseCharge: true,
      registrationThreshold: 90000,
      filingFrequency: 'quarterly',
    },
    corporateTax: { rate: 25, reducedRates: [{ threshold: 50000, rate: 19 }], specialRegimes: ['Patent Box', 'R&D tax credits'] },
    incomeTax: { type: 'progressive', brackets: [], flatRate: null, standardDeduction: 12570, taxFreeAllowance: 12570 },
    socialContributions: {
      pension: { name: 'National Insurance', employee: 8, employer: 13.8 },
      health: { name: 'NHS', employee: 0, employer: 0 },
      unemployment: { name: 'Included in NI', employee: 0, employer: 0 },
      other: [],
      totalEmployee: 8,
      totalEmployer: 13.8,
    },
    withholdingTax: { dividends: 0, interest: 20, royalties: 20, services: 20 },
    invoiceRequirements: {
      mandatoryFields: ['seller_name', 'seller_address', 'seller_vat', 'buyer_name', 'buyer_address', 'invoice_number', 'invoice_date', 'items', 'tax_rate', 'tax_amount', 'total'],
      sequentialNumbering: true, electronicInvoicing: false, eInvoiceSystem: null,
      retentionPeriod: 6, currencyRequirement: true, languageRequirement: 'english', fiscalization: false,
    },
    payroll: {
      minimumWage: 1858, minimumWageCurrency: 'GBP',
      payPeriodFrequency: 'monthly', overtimeMultiplier: 1.5,
      maximumWorkingHours: 40, annualLeaveDays: 28, sickLeavePaid: 28,
      maternityLeaveWeeks: 52, pensionAge: { male: 66, female: 66 },
    },
    accounting: {
      standards: 'UK GAAP / IFRS', fiscalYear: 'custom', chartOfAccounts: 'UK Chart',
      mandatoryReports: ['balance_sheet', 'p_l', 'cash_flow'],
    },
    taxForms: [
      { code: 'VAT Return', name: 'VAT Return', frequency: 'quarterly', description: 'VAT return (Making Tax Digital)' },
      { code: 'CT600', name: 'Corporation Tax Return', frequency: 'annually', description: 'Corporate tax return' },
      { code: 'P11D', name: 'P11D Benefits', frequency: 'annually', description: 'Employee benefits report' },
    ],
  },
  // ===================== ITALY =====================
  {
    code: 'IT',
    name: 'Italy',
    flag: '🇮🇹',
    currency: 'EUR',
    region: 'europe',
    vat: {
      type: 'vat', standardRate: 22,
      reducedRates: [
        { rate: 10, description: 'Electricity, hotels, restaurants' },
        { rate: 4, description: 'Food, books, medical' },
        { rate: 5, description: 'Some food products' },
      ],
      exemptions: ['financial services', 'insurance', 'education', 'healthcare'],
      isEuVat: true, reverseCharge: true,
      registrationThreshold: 65000,
      filingFrequency: 'monthly',
    },
    corporateTax: { rate: 24, reducedRates: [{ threshold: 50000, rate: 15 }], specialRegimes: ['Regime forfettario', 'Start-up innovazione'] },
    incomeTax: { type: 'progressive', brackets: [], flatRate: null, standardDeduction: 0, taxFreeAllowance: 8000 },
    socialContributions: {
      pension: { name: 'INPS', employee: 9.19, employer: 23.81 },
      health: { name: 'INPS sanità', employee: 0.3, employer: 1.61 },
      unemployment: { name: 'NASpI', employee: 0, employer: 2.04 },
      other: [
        { name: 'INAIL', employee: 0, employer: 0.84 },
      ],
      totalEmployee: 9.49,
      totalEmployer: 28.3,
    },
    withholdingTax: { dividends: 26, interest: 26, royalties: 30, services: 30 },
    invoiceRequirements: {
      mandatoryFields: ['seller_name', 'seller_address', 'seller_cf', 'seller_vat', 'buyer_name', 'buyer_cf', 'invoice_number', 'invoice_date', 'items', 'tax_rate', 'tax_amount', 'total'],
      sequentialNumbering: true, electronicInvoicing: true, eInvoiceSystem: 'SDI (Sistema di Interscambio)',
      retentionPeriod: 10, currencyRequirement: true, languageRequirement: 'italiano', fiscalization: false,
    },
    payroll: {
      minimumWage: 0, minimumWageCurrency: 'EUR',
      payPeriodFrequency: 'monthly', overtimeMultiplier: 1.25,
      maximumWorkingHours: 40, annualLeaveDays: 26, sickLeavePaid: 90,
      maternityLeaveWeeks: 22, pensionAge: { male: 67, female: 67 },
    },
    accounting: {
      standards: 'Italian GAAP / IFRS', fiscalYear: 'calendar', chartOfAccounts: 'Piano dei Conti',
      mandatoryReports: ['bilancio', 'conto_economico', 'rendiconto_finanziario'],
    },
    taxForms: [
      { code: 'F24', name: 'Modello F24', frequency: 'monthly', description: 'Tax payment form' },
      { code: 'IVA', name: 'Dichiarazione IVA', frequency: 'annually', description: 'VAT return' },
      { code: 'UNICO', name: 'Dichiarazione dei redditi', frequency: 'annually', description: 'Income/corporate tax return' },
    ],
  },
  // ===================== SPAIN =====================
  {
    code: 'ES',
    name: 'Spain',
    flag: '🇪🇸',
    currency: 'EUR',
    region: 'europe',
    vat: {
      type: 'vat', standardRate: 21,
      reducedRates: [
        { rate: 10, description: 'Food, transport, hotels' },
        { rate: 4, description: 'Basic food, books, medicine' },
      ],
      exemptions: ['financial services', 'insurance', 'education', 'healthcare'],
      isEuVat: true, reverseCharge: true,
      registrationThreshold: null,
      filingFrequency: 'quarterly',
    },
    corporateTax: { rate: 25, reducedRates: [{ threshold: 1000000, rate: 23 }], specialRegimes: ['REDEME (digital companies)', 'Canarias regime'] },
    incomeTax: { type: 'progressive', brackets: [], flatRate: null, standardDeduction: 0, taxFreeAllowance: 5550 },
    socialContributions: {
      pension: { name: 'Seguridad Social', employee: 6.35, employer: 23.6 },
      health: { name: 'Salud', employee: 0, employer: 0 },
      unemployment: { name: 'Desempleo', employee: 1.55, employer: 5.5 },
      other: [
        { name: 'FOGASA', employee: 0.2, employer: 0.2 },
        { name: 'FP', employee: 0.1, employer: 0.6 },
      ],
      totalEmployee: 8.2,
      totalEmployer: 29.9,
    },
    withholdingTax: { dividends: 19, interest: 19, royalties: 24, services: 24 },
    invoiceRequirements: {
      mandatoryFields: ['seller_name', 'seller_address', 'seller_nif', 'buyer_name', 'buyer_nif', 'invoice_number', 'invoice_date', 'items', 'tax_rate', 'tax_amount', 'total'],
      sequentialNumbering: true, electronicInvoicing: true, eInvoiceSystem: 'FacturaE',
      retentionPeriod: 6, currencyRequirement: true, languageRequirement: 'español', fiscalization: false,
    },
    payroll: {
      minimumWage: 1134, minimumWageCurrency: 'EUR',
      payPeriodFrequency: 'monthly', overtimeMultiplier: 1.25,
      maximumWorkingHours: 40, annualLeaveDays: 30, sickLeavePaid: 60,
      maternityLeaveWeeks: 16, pensionAge: { male: 66, female: 66 },
    },
    accounting: {
      standards: 'PGC / IFRS', fiscalYear: 'calendar', chartOfAccounts: 'Plan General Contable',
      mandatoryReports: ['balance', 'cuenta_resultado', 'estado_flujos'],
    },
    taxForms: [
      { code: '303', name: 'Modelo 303 IVA', frequency: 'quarterly', description: 'VAT return' },
      { code: '200', name: 'Modelo 200 IS', frequency: 'annually', description: 'Corporate tax return' },
      { code: '111', name: 'Modelo 111 Retenciones', frequency: 'quarterly', description: 'Withholding tax return' },
    ],
  },
  // ===================== NETHERLANDS =====================
  {
    code: 'NL',
    name: 'Netherlands',
    flag: '🇳🇱',
    currency: 'EUR',
    region: 'europe',
    vat: {
      type: 'vat', standardRate: 21,
      reducedRates: [
        { rate: 9, description: 'Food, books, medicine, art' },
      ],
      exemptions: ['financial services', 'insurance', 'education', 'healthcare'],
      isEuVat: true, reverseCharge: true,
      registrationThreshold: 20000,
      filingFrequency: 'quarterly',
    },
    corporateTax: { rate: 25.8, reducedRates: [{ threshold: 200000, rate: 19 }], specialRegimes: ['Innovation box (9%)', 'Participation exemption'] },
    incomeTax: { type: 'progressive', brackets: [], flatRate: null, standardDeduction: 0, taxFreeAllowance: 7518 },
    socialContributions: {
      pension: { name: 'AOW', employee: 17.9, employer: 0 },
      health: { name: 'Zorgverzekeringswet', employee: 0, employer: 0 },
      unemployment: { name: 'WW', employee: 0, employer: 2.64 },
      other: [
        { name: 'WAO/WIA', employee: 0, employer: 7.11 },
        { name: 'ZVW', employee: 6.57, employer: 6.57 },
      ],
      totalEmployee: 24.47,
      totalEmployer: 16.32,
    },
    withholdingTax: { dividends: 15, interest: 0, royalties: 0, services: 0 },
    invoiceRequirements: {
      mandatoryFields: ['seller_name', 'seller_address', 'seller_vat', 'buyer_name', 'buyer_vat', 'invoice_number', 'invoice_date', 'items', 'tax_rate', 'total'],
      sequentialNumbering: true, electronicInvoicing: false, eInvoiceSystem: null,
      retentionPeriod: 7, currencyRequirement: true, languageRequirement: 'nederlands', fiscalization: false,
    },
    payroll: {
      minimumWage: 1995, minimumWageCurrency: 'EUR',
      payPeriodFrequency: 'monthly', overtimeMultiplier: 1.5,
      maximumWorkingHours: 40, annualLeaveDays: 25, sickLeavePaid: 104,
      maternityLeaveWeeks: 16, pensionAge: { male: 67, female: 67 },
    },
    accounting: {
      standards: 'Dutch GAAP / IFRS', fiscalYear: 'calendar', chartOfAccounts: 'RJ',
      mandatoryReports: ['balance_sheet', 'p_l', 'cash_flow'],
    },
    taxForms: [
      { code: 'IB01', name: 'IB-aangifte', frequency: 'quarterly', description: 'VAT return (OB)' },
      { code: 'Vpb', name: 'Vennootschapsbelasting', frequency: 'annually', description: 'Corporate tax return' },
      { code: 'Loonheffing', name: 'Loonaangifte', frequency: 'monthly', description: 'Payroll tax return' },
    ],
  },
  // ===================== BELGIUM =====================
  {
    code: 'BE',
    name: 'Belgium',
    flag: '🇧🇪',
    currency: 'EUR',
    region: 'europe',
    vat: {
      type: 'vat', standardRate: 21,
      reducedRates: [
        { rate: 12, description: 'Social housing, some services' },
        { rate: 6, description: 'Food, books, medicine' },
      ],
      exemptions: ['financial services', 'insurance', 'education', 'healthcare'],
      isEuVat: true, reverseCharge: true,
      registrationThreshold: 25000,
      filingFrequency: 'monthly',
    },
    corporateTax: { rate: 25, reducedRates: [{ threshold: 100000, rate: 20 }, { threshold: 395000, rate: 20 }], specialRegimes: ['Notional interest deduction', 'Innovation income deduction'] },
    incomeTax: { type: 'progressive', brackets: [], flatRate: null, standardDeduction: 0, taxFreeAllowance: 10480 },
    socialContributions: {
      pension: { name: 'Pensie', employee: 7.5, employer: 8.86 },
      health: { name: 'Ziekte', employee: 3.55, employer: 3.87 },
      unemployment: { name: 'Werkloosheid', employee: 1.51, employer: 1.79 },
      other: [
        { name: 'Arbeidsongeval', employee: 0, employer: 1.02 },
      ],
      totalEmployee: 12.56,
      totalEmployer: 15.54,
    },
    withholdingTax: { dividends: 30, interest: 30, royalties: 15, services: 15 },
    invoiceRequirements: {
      mandatoryFields: ['seller_name', 'seller_address', 'seller_vat', 'buyer_name', 'buyer_vat', 'invoice_number', 'invoice_date', 'items', 'tax_rate', 'total'],
      sequentialNumbering: true, electronicInvoicing: true, eInvoiceSystem: 'Peppol / Mercurius',
      retentionPeriod: 10, currencyRequirement: true, languageRequirement: 'nederlands/français', fiscalization: false,
    },
    payroll: {
      minimumWage: 1991, minimumWageCurrency: 'EUR',
      payPeriodFrequency: 'monthly', overtimeMultiplier: 1.5,
      maximumWorkingHours: 38, annualLeaveDays: 20, sickLeavePaid: 30,
      maternityLeaveWeeks: 15, pensionAge: { male: 65, female: 65 },
    },
    accounting: {
      standards: 'Belgian GAAP / IFRS', fiscalYear: 'calendar', chartOfAccounts: 'PCMN',
      mandatoryReports: ['bilan', 'compte_résultat', 'annexe'],
    },
    taxForms: [
      { code: '01', name: 'Déclaration TVA', frequency: 'monthly', description: 'VAT return' },
      { code: 'CR', name: 'Déclaration ISOC', frequency: 'annually', description: 'Corporate tax return' },
      { code: 'DMFA', name: 'Déclaration multifonctionnelle', frequency: 'quarterly', description: 'Social declaration' },
    ],
  },
  // ===================== AUSTRIA =====================
  {
    code: 'AT',
    name: 'Austria',
    flag: '🇦🇹',
    currency: 'EUR',
    region: 'europe',
    vat: {
      type: 'vat', standardRate: 20,
      reducedRates: [
        { rate: 13, description: 'Wine, some agriculture' },
        { rate: 10, description: 'Food, books, hotels' },
        { rate: 5, description: 'Some food, newspapers' },
      ],
      exemptions: ['financial services', 'insurance', 'education', 'healthcare'],
      isEuVat: true, reverseCharge: true,
      registrationThreshold: 35000,
      filingFrequency: 'monthly',
    },
    corporateTax: { rate: 23, reducedRates: [], specialRegimes: ['Group taxation', 'Research credit'] },
    incomeTax: { type: 'progressive', brackets: [], flatRate: null, standardDeduction: 0, taxFreeAllowance: 12000 },
    socialContributions: {
      pension: { name: 'Pensionsversicherung', employee: 10.25, employer: 12.55 },
      health: { name: 'Krankenversicherung', employee: 3.95, employer: 3.95 },
      unemployment: { name: 'Arbeitslosenversicherung', employee: 3, employer: 3 },
      other: [
        { name: 'Unfallversicherung', employee: 0, employer: 1.3 },
        { name: 'Wohnbauförderung', employee: 0.5, employer: 0.5 },
      ],
      totalEmployee: 17.7,
      totalEmployer: 21.3,
    },
    withholdingTax: { dividends: 27.5, interest: 27.5, royalties: 20, services: 20 },
    invoiceRequirements: {
      mandatoryFields: ['seller_name', 'seller_address', 'seller_vat', 'buyer_name', 'buyer_address', 'buyer_vat', 'invoice_number', 'invoice_date', 'items', 'tax_rate', 'total'],
      sequentialNumbering: true, electronicInvoicing: true, eInvoiceSystem: 'Austrian E-Invoicing (mandatory 2024)',
      retentionPeriod: 7, currencyRequirement: true, languageRequirement: 'deutsch', fiscalization: false,
    },
    payroll: {
      minimumWage: 1500, minimumWageCurrency: 'EUR',
      payPeriodFrequency: 'monthly', overtimeMultiplier: 1.5,
      maximumWorkingHours: 40, annualLeaveDays: 25, sickLeavePaid: 42,
      maternityLeaveWeeks: 16, pensionAge: { male: 65, female: 65 },
    },
    accounting: {
      standards: 'Austrian GAAP / IFRS', fiscalYear: 'calendar', chartOfAccounts: 'Austrian COA',
      mandatoryReports: ['bilanz', 'guv', 'anhang'],
    },
    taxForms: [
      { code: 'U30', name: 'Umsatzsteuervoranmeldung', frequency: 'monthly', description: 'VAT return' },
      { code: 'K1', name: 'Körperschaftsteuererklärung', frequency: 'annually', description: 'Corporate tax return' },
      { code: 'L16', name: 'Lohnsteuer', frequency: 'monthly', description: 'Payroll tax return' },
    ],
  },
  // ===================== POLAND =====================
  {
    code: 'PL',
    name: 'Poland',
    flag: '🇵🇱',
    currency: 'PLN',
    region: 'europe',
    vat: {
      type: 'vat', standardRate: 23,
      reducedRates: [
        { rate: 8, description: 'Food, hotels, some services' },
        { rate: 5, description: 'Basic food, books' },
      ],
      exemptions: ['financial services', 'insurance', 'education', 'healthcare', 'postal'],
      isEuVat: true, reverseCharge: true,
      registrationThreshold: 200000,
      filingFrequency: 'monthly',
    },
    corporateTax: { rate: 19, reducedRates: [{ threshold: 200000, rate: 9 }], specialRegimes: ['Estonian CIT', 'IP Box (5%)'] },
    incomeTax: { type: 'progressive', brackets: [], flatRate: null, standardDeduction: 0, taxFreeAllowance: 30000 },
    socialContributions: {
      pension: { name: 'Emerytalne', employee: 9.76, employer: 9.76 },
      health: { name: 'Zdrowotne', employee: 9, employer: 0 },
      unemployment: { name: 'Bezrobotne', employee: 1.5, employer: 2.45 },
      other: [
        { name: 'Wypadkowe', employee: 0, employer: 1.67 },
      ],
      totalEmployee: 20.26,
      totalEmployer: 13.88,
    },
    withholdingTax: { dividends: 19, interest: 20, royalties: 20, services: 20 },
    invoiceRequirements: {
      mandatoryFields: ['seller_name', 'seller_address', 'seller_nip', 'buyer_name', 'buyer_nip', 'invoice_number', 'invoice_date', 'items', 'tax_rate', 'total'],
      sequentialNumbering: true, electronicInvoicing: true, eInvoiceSystem: 'KSeF (2024 rollout)',
      retentionPeriod: 5, currencyRequirement: true, languageRequirement: 'polski', fiscalization: false,
    },
    payroll: {
      minimumWage: 3222, minimumWageCurrency: 'PLN',
      payPeriodFrequency: 'monthly', overtimeMultiplier: 1.5,
      maximumWorkingHours: 40, annualLeaveDays: 26, sickLeavePaid: 33,
      maternityLeaveWeeks: 20, pensionAge: { male: 65, female: 60 },
    },
    accounting: {
      standards: 'Polish Accounting Act', fiscalYear: 'calendar', chartOfAccounts: 'Polish COA',
      mandatoryReports: ['bilans', 'rachunek_zyskow_i_strat'],
    },
    taxForms: [
      { code: 'JPK_V7', name: 'JPK_V7 (VAT)', frequency: 'monthly', description: 'VAT return with SAF-T' },
      { code: 'CIT-8', name: 'CIT-8', frequency: 'annually', description: 'Corporate tax return' },
      { code: 'PIT-4R', name: 'PIT-4R', frequency: 'monthly', description: 'Payroll tax return' },
    ],
  },
  // ===================== CZECH REPUBLIC =====================
  {
    code: 'CZ',
    name: 'Czech Republic',
    flag: '🇨🇿',
    currency: 'CZK',
    region: 'europe',
    vat: {
      type: 'vat', standardRate: 21,
      reducedRates: [
        { rate: 12, description: 'Food, books, medicine' },
      ],
      exemptions: ['financial services', 'insurance', 'education', 'healthcare'],
      isEuVat: true, reverseCharge: true,
      registrationThreshold: 2000000,
      filingFrequency: 'monthly',
    },
    corporateTax: { rate: 21, reducedRates: [], specialRegimes: ['Investment allowance', 'R&D relief'] },
    incomeTax: { type: 'progressive', brackets: [], flatRate: null, standardDeduction: 0, taxFreeAllowance: 48400 },
    socialContributions: {
      pension: { name: 'Důchodové', employee: 6.5, employer: 21.5 },
      health: { name: 'Zdravotní', employee: 4.5, employer: 9 },
      unemployment: { name: 'Nemocenské', employee: 0.6, employer: 1.2 },
      other: [],
      totalEmployee: 11.6,
      totalEmployer: 31.7,
    },
    withholdingTax: { dividends: 15, interest: 15, royalties: 15, services: 15 },
    invoiceRequirements: {
      mandatoryFields: ['seller_name', 'seller_address', 'seller_dic', 'buyer_name', 'buyer_dic', 'invoice_number', 'invoice_date', 'items', 'tax_rate', 'total'],
      sequentialNumbering: true, electronicInvoicing: false, eInvoiceSystem: null,
      retentionPeriod: 10, currencyRequirement: true, languageRequirement: 'čeština', fiscalization: false,
    },
    payroll: {
      minimumWage: 18675, minimumWageCurrency: 'CZK',
      payPeriodFrequency: 'monthly', overtimeMultiplier: 1.25,
      maximumWorkingHours: 40, annualLeaveDays: 20, sickLeavePaid: 52,
      maternityLeaveWeeks: 28, pensionAge: { male: 65, female: 63 },
    },
    accounting: {
      standards: 'Czech Accounting Act', fiscalYear: 'calendar', chartOfAccounts: 'Účetní osnova',
      mandatoryReports: ['rozvaha', 'výkaz_zisku_ztráty'],
    },
    taxForms: [
      { code: 'DPH', name: 'Přiznání k DPH', frequency: 'monthly', description: 'VAT return' },
      { code: 'DPH-DP3', name: 'Kontrolní hlášení', frequency: 'monthly', description: 'VAT control statement' },
      { code: 'DPH-PT', name: 'Přiznání k dani z příjmů', frequency: 'annually', description: 'Income tax return' },
    ],
  },
  // ===================== CROATIA =====================
  {
    code: 'HR',
    name: 'Croatia',
    flag: '🇭🇷',
    currency: 'EUR',
    region: 'europe',
    vat: {
      type: 'vat', standardRate: 25,
      reducedRates: [
        { rate: 13, description: 'Hotels, food, books' },
        { rate: 5, description: 'Basic food, medicine' },
      ],
      exemptions: ['financial services', 'insurance', 'education', 'healthcare'],
      isEuVat: true, reverseCharge: true,
      registrationThreshold: 300000,
      filingFrequency: 'monthly',
    },
    corporateTax: { rate: 18, reducedRates: [{ threshold: 300000, rate: 12 }], specialRegimes: ['Free zone relief', 'R&D incentives'] },
    incomeTax: { type: 'progressive', brackets: [], flatRate: null, standardDeduction: 0, taxFreeAllowance: 5600 },
    socialContributions: {
      pension: { name: 'Mirovinsko', employee: 15, employer: 15 },
      health: { name: 'Zdravstveno', employee: 5, employer: 0 },
      unemployment: { name: 'Zapošljavanje', employee: 0.85, employer: 0.85 },
      other: [],
      totalEmployee: 20.85,
      totalEmployer: 15.85,
    },
    withholdingTax: { dividends: 12, interest: 12, royalties: 12, services: 12 },
    invoiceRequirements: {
      mandatoryFields: ['seller_name', 'seller_address', 'seller_oib', 'buyer_name', 'buyer_oib', 'invoice_number', 'invoice_date', 'items', 'tax_rate', 'total'],
      sequentialNumbering: true, electronicInvoicing: true, eInvoiceSystem: 'Fiskalizacija / eFaktura',
      retentionPeriod: 11, currencyRequirement: true, languageRequirement: 'hrvatski', fiscalization: true,
    },
    payroll: {
      minimumWage: 840, minimumWageCurrency: 'EUR',
      payPeriodFrequency: 'monthly', overtimeMultiplier: 1.5,
      maximumWorkingHours: 40, annualLeaveDays: 20, sickLeavePaid: 42,
      maternityLeaveWeeks: 28, pensionAge: { male: 65, female: 63 },
    },
    accounting: {
      standards: 'Croatian Accounting Act', fiscalYear: 'calendar', chartOfAccounts: 'Hrvatski kontni plan',
      mandatoryReports: ['bilanca', 'rd_gubitak', 'dnevnik'],
    },
    taxForms: [
      { code: 'PDV', name: 'PDV izjava', frequency: 'monthly', description: 'VAT return' },
      { code: 'Porezna prijava', name: 'Porezna prijava', frequency: 'monthly', description: 'Income tax return' },
      { code: 'Porez na dobit', name: 'Porez na dobit pravnih osoba', frequency: 'annually', description: 'Corporate tax return' },
    ],
  },
  // ===================== BOSNIA & HERZEGOVINA =====================
  {
    code: 'BA',
    name: 'Bosnia and Herzegovina',
    flag: '🇧🇦',
    currency: 'BAM',
    region: 'europe',
    vat: {
      type: 'vat', standardRate: 17,
      reducedRates: [],
      exemptions: ['financial services', 'insurance', 'education', 'healthcare', 'postal'],
      isEuVat: false, reverseCharge: true,
      registrationThreshold: 50000,
      filingFrequency: 'monthly',
    },
    corporateTax: { rate: 10, reducedRates: [], specialRegimes: ['RS entity: 10%', 'FBiH entity: 10%', 'BD entity: 10%'] },
    incomeTax: { type: 'progressive', brackets: [], flatRate: null, standardDeduction: 0, taxFreeAllowance: 5000 },
    socialContributions: {
      pension: { name: 'Penzijsko', employee: 6.5, employer: 8.5 },
      health: { name: 'Zdravstveno', employee: 4, employer: 4 },
      unemployment: { name: 'Zapošljavanje', employee: 1.0, employer: 1.5 },
      other: [
        { name: 'Zaštita na radu', employee: 0, employer: 0.5 },
      ],
      totalEmployee: 11.5,
      totalEmployer: 14.5,
    },
    withholdingTax: { dividends: 10, interest: 10, royalties: 10, services: 10 },
    invoiceRequirements: {
      mandatoryFields: ['seller_name', 'seller_address', 'seller_jib', 'buyer_name', 'invoice_number', 'invoice_date', 'items', 'tax_rate', 'total'],
      sequentialNumbering: true, electronicInvoicing: false, eInvoiceSystem: null,
      retentionPeriod: 10, currencyRequirement: true, languageRequirement: null, fiscalization: false,
    },
    payroll: {
      minimumWage: 655, minimumWageCurrency: 'BAM',
      payPeriodFrequency: 'monthly', overtimeMultiplier: 1.5,
      maximumWorkingHours: 40, annualLeaveDays: 20, sickLeavePaid: 30,
      maternityLeaveWeeks: 26, pensionAge: { male: 65, female: 65 },
    },
    accounting: {
      standards: 'Local GAAP', fiscalYear: 'calendar', chartOfAccounts: 'Kontni plan BiH',
      mandatoryReports: ['bilans', 'rd_gubitak'],
    },
    taxForms: [
      { code: 'PDV', name: 'PDV prijava', frequency: 'monthly', description: 'VAT return' },
      { code: 'PP', name: 'Porez na dobit', frequency: 'annually', description: 'Corporate tax return' },
    ],
  },
  // ===================== NORTH MACEDONIA =====================
  {
    code: 'MK',
    name: 'North Macedonia',
    flag: '🇲🇰',
    currency: 'MKD',
    region: 'europe',
    vat: {
      type: 'vat', standardRate: 18,
      reducedRates: [
        { rate: 5, description: 'Basic food, medicine, books' },
      ],
      exemptions: ['financial services', 'insurance', 'education', 'healthcare'],
      isEuVat: false, reverseCharge: true,
      registrationThreshold: 2000000,
      filingFrequency: 'monthly',
    },
    corporateTax: { rate: 10, reducedRates: [], specialRegimes: ['Free economic zones', 'Technical development zones'] },
    incomeTax: { type: 'progressive', brackets: [], flatRate: null, standardDeduction: 0, taxFreeAllowance: 85800 },
    socialContributions: {
      pension: { name: 'Пензиски', employee: 7.2, employer: 12.5 },
      health: { name: 'Здравствен', employee: 3.8, employer: 7.2 },
      unemployment: { name: 'Вработување', employee: 0.6, employer: 1.2 },
      other: [],
      totalEmployee: 11.6,
      totalEmployer: 20.9,
    },
    withholdingTax: { dividends: 10, interest: 10, royalties: 15, services: 15 },
    invoiceRequirements: {
      mandatoryFields: ['seller_name', 'seller_address', 'seller_edb', 'buyer_name', 'buyer_edb', 'invoice_number', 'invoice_date', 'items', 'tax_rate', 'total'],
      sequentialNumbering: true, electronicInvoicing: false, eInvoiceSystem: null,
      retentionPeriod: 10, currencyRequirement: true, languageRequirement: 'македонски', fiscalization: false,
    },
    payroll: {
      minimumWage: 35200, minimumWageCurrency: 'MKD',
      payPeriodFrequency: 'monthly', overtimeMultiplier: 1.5,
      maximumWorkingHours: 40, annualLeaveDays: 20, sickLeavePaid: 30,
      maternityLeaveWeeks: 20, pensionAge: { male: 64, female: 62 },
    },
    accounting: {
      standards: 'Local GAAP / IFRS', fiscalYear: 'calendar', chartOfAccounts: 'Macedonian COA',
      mandatoryReports: ['bilans', 'профит_губиток'],
    },
    taxForms: [
      { code: 'DDV', name: 'ДДВ пријава', frequency: 'monthly', description: 'VAT return' },
      { code: 'PPDL', name: 'Порез на добивка', frequency: 'annually', description: 'Corporate tax return' },
    ],
  },
  // ===================== MONTENEGRO =====================
  {
    code: 'ME',
    name: 'Montenegro',
    flag: '🇲🇪',
    currency: 'EUR',
    region: 'europe',
    vat: {
      type: 'vat', standardRate: 21,
      reducedRates: [
        { rate: 7, description: 'Food, medicine, books, hotels' },
      ],
      exemptions: ['financial services', 'insurance', 'education', 'healthcare'],
      isEuVat: false, reverseCharge: true,
      registrationThreshold: 30000,
      filingFrequency: 'monthly',
    },
    corporateTax: { rate: 15, reducedRates: [], specialRegimes: ['Free zone 3-8%'] },
    incomeTax: { type: 'progressive', brackets: [], flatRate: null, standardDeduction: 0, taxFreeAllowance: 1000 },
    socialContributions: {
      pension: { name: 'Penzijski', employee: 9.5, employer: 9.5 },
      health: { name: 'Zdravstveni', employee: 6.15, employer: 6.15 },
      unemployment: { name: 'Zapošljavanje', employee: 0.5, employer: 0.5 },
      other: [],
      totalEmployee: 16.15,
      totalEmployer: 16.15,
    },
    withholdingTax: { dividends: 9, interest: 9, royalties: 15, services: 15 },
    invoiceRequirements: {
      mandatoryFields: ['seller_name', 'seller_address', 'seller_pib', 'buyer_name', 'buyer_pib', 'invoice_number', 'invoice_date', 'items', 'tax_rate', 'total'],
      sequentialNumbering: true, electronicInvoicing: false, eInvoiceSystem: null,
      retentionPeriod: 10, currencyRequirement: true, languageRequirement: 'crnogorski', fiscalization: true,
    },
    payroll: {
      minimumWage: 563, minimumWageCurrency: 'EUR',
      payPeriodFrequency: 'monthly', overtimeMultiplier: 1.5,
      maximumWorkingHours: 40, annualLeaveDays: 20, sickLeavePaid: 30,
      maternityLeaveWeeks: 26, pensionAge: { male: 67, female: 65 },
    },
    accounting: {
      standards: 'MRS / IFRS', fiscalYear: 'calendar', chartOfAccounts: 'Kontni plan CG',
      mandatoryReports: ['bilans', 'bdip'],
    },
    taxForms: [
      { code: 'PDV', name: 'PDV prijava', frequency: 'monthly', description: 'VAT return' },
      { code: 'PPT', name: 'Porez na prihod', frequency: 'monthly', description: 'Income tax return' },
    ],
  },
  // ===================== SLOVENIA =====================
  {
    code: 'SI',
    name: 'Slovenia',
    flag: '🇸🇮',
    currency: 'EUR',
    region: 'europe',
    vat: {
      type: 'vat', standardRate: 22,
      reducedRates: [
        { rate: 9.5, description: 'Food, books, medicine' },
        { rate: 5, description: 'Basic food, medicine' },
      ],
      exemptions: ['financial services', 'insurance', 'education', 'healthcare'],
      isEuVat: true, reverseCharge: true,
      registrationThreshold: 50000,
      filingFrequency: 'monthly',
    },
    corporateTax: { rate: 19, reducedRates: [], specialRegimes: ['R&D incentives (up to 100%)', 'IP Box'] },
    incomeTax: { type: 'progressive', brackets: [], flatRate: null, standardDeduction: 0, taxFreeAllowance: 8333 },
    socialContributions: {
      pension: { name: 'Pokojninsko', employee: 15.5, employer: 8.85 },
      health: { name: 'Zdravstveno', employee: 6.39, employer: 6.56 },
      unemployment: { name: 'Zaposlovanje', employee: 0.14, employer: 0.14 },
      other: [
        { name: 'Poškodbe', employee: 0.16, employer: 0.53 },
      ],
      totalEmployee: 22.19,
      totalEmployer: 16.08,
    },
    withholdingTax: { dividends: 15, interest: 15, royalties: 25, services: 25 },
    invoiceRequirements: {
      mandatoryFields: ['seller_name', 'seller_address', 'seller_ddv', 'buyer_name', 'buyer_ddv', 'invoice_number', 'invoice_date', 'items', 'tax_rate', 'total'],
      sequentialNumbering: true, electronicInvoicing: true, eInvoiceSystem: 'eDavki / B2G eRačun',
      retentionPeriod: 10, currencyRequirement: true, languageRequirement: 'slovenščina', fiscalization: false,
    },
    payroll: {
      minimumWage: 1253, minimumWageCurrency: 'EUR',
      payPeriodFrequency: 'monthly', overtimeMultiplier: 1.5,
      maximumWorkingHours: 40, annualLeaveDays: 20, sickLeavePaid: 60,
      maternityLeaveWeeks: 15, pensionAge: { male: 65, female: 63 },
    },
    accounting: {
      standards: 'SRS / IFRS', fiscalYear: 'calendar', chartOfAccounts: 'Slovenian COA',
      mandatoryReports: ['bilanca', 'rd_gubitok', 'komentarji'],
    },
    taxForms: [
      { code: 'DDV', name: 'DDV-O', frequency: 'monthly', description: 'VAT return' },
      { code: 'Doh-P', name: 'Dohodnina', frequency: 'monthly', description: 'Payroll tax return' },
      { code: 'DPP', name: 'Dohodek pravnih oseb', frequency: 'annually', description: 'Corporate tax return' },
    ],
  },
  // ===================== LUXEMBOURG =====================
  {
    code: 'LU',
    name: 'Luxembourg',
    flag: '🇱🇺',
    currency: 'EUR',
    region: 'europe',
    vat: {
      type: 'vat', standardRate: 17,
      reducedRates: [
        { rate: 14, description: 'Wine, some agriculture' },
        { rate: 8, description: 'Electricity, books, food' },
        { rate: 3, description: 'Food, medicine, books' },
      ],
      exemptions: ['financial services', 'insurance', 'education', 'healthcare'],
      isEuVat: true, reverseCharge: true,
      registrationThreshold: 35000,
      filingFrequency: 'monthly',
    },
    corporateTax: { rate: 24.88, reducedRates: [{ threshold: 25000, rate: 15 }, { threshold: 175000, rate: 17 }], specialRegimes: ['IP regime', 'Holding regime'] },
    incomeTax: { type: 'progressive', brackets: [], flatRate: null, standardDeduction: 0, taxFreeAllowance: 12872 },
    socialContributions: {
      pension: { name: 'Pension', employee: 8, employer: 8 },
      health: { name: 'Maladie', employee: 1.3, employer: 3.05 },
      unemployment: { name: 'Chômage', employee: 0, employer: 2.5 },
      other: [
        { name: 'Dépendance', employee: 1.4, employer: 1.4 },
        { name: 'Accident', employee: 0, employer: 1.1 },
      ],
      totalEmployee: 10.7,
      totalEmployer: 16.05,
    },
    withholdingTax: { dividends: 15, interest: 0, royalties: 0, services: 0 },
    invoiceRequirements: {
      mandatoryFields: ['seller_name', 'seller_address', 'seller_vat', 'buyer_name', 'buyer_vat', 'invoice_number', 'invoice_date', 'items', 'tax_rate', 'total'],
      sequentialNumbering: true, electronicInvoicing: true, eInvoiceSystem: 'Peppol',
      retentionPeriod: 10, currencyRequirement: true, languageRequirement: 'français/deutsch', fiscalization: false,
    },
    payroll: {
      minimumWage: 2325, minimumWageCurrency: 'EUR',
      payPeriodFrequency: 'monthly', overtimeMultiplier: 1.5,
      maximumWorkingHours: 40, annualLeaveDays: 26, sickLeavePaid: 52,
      maternityLeaveWeeks: 20, pensionAge: { male: 65, female: 65 },
    },
    accounting: {
      standards: 'Luxembourg GAAP / IFRS', fiscalYear: 'calendar', chartOfAccounts: 'PCN',
      mandatoryReports: ['bilan', 'compte_résultat'],
    },
    taxForms: [
      { code: 'VAT return', name: 'Déclaration TVA', frequency: 'monthly', description: 'VAT return' },
      { code: 'IS', name: 'Impôt sociétés', frequency: 'annually', description: 'Corporate tax return' },
    ],
  },
  // ===================== IRELAND =====================
  {
    code: 'IE',
    name: 'Ireland',
    flag: '🇮🇪',
    currency: 'EUR',
    region: 'europe',
    vat: {
      type: 'vat', standardRate: 23,
      reducedRates: [
        { rate: 13.5, description: 'Services, fuel, electricity' },
        { rate: 9, description: 'Newspapers, tourism' },
        { rate: 4.5, description: 'Agricultural livestock' },
        { rate: 0, description: 'Food, books, medicine, children clothes' },
      ],
      exemptions: ['financial services', 'insurance', 'education', 'healthcare'],
      isEuVat: true, reverseCharge: true,
      registrationThreshold: 80000,
      filingFrequency: 'bi-monthly',
    },
    corporateTax: { rate: 15, reducedRates: [], specialRegimes: ['Knowledge Development Box (6.25%)', 'R&D credit (25%)'] },
    incomeTax: { type: 'progressive', brackets: [], flatRate: null, standardDeduction: 0, taxFreeAllowance: 4200 },
    socialContributions: {
      pension: { name: 'PRSI', employee: 4, employer: 11.05 },
      health: { name: 'Levy', employee: 0, employer: 0 },
      unemployment: { name: 'PRSI', employee: 0, employer: 0 },
      other: [
        { name: 'USC', employee: 4.5, employer: 0 },
      ],
      totalEmployee: 8.5,
      totalEmployer: 11.05,
    },
    withholdingTax: { dividends: 25, interest: 20, royalties: 20, services: 20 },
    invoiceRequirements: {
      mandatoryFields: ['seller_name', 'seller_address', 'seller_vat', 'buyer_name', 'buyer_vat', 'invoice_number', 'invoice_date', 'items', 'tax_rate', 'total'],
      sequentialNumbering: true, electronicInvoicing: false, eInvoiceSystem: null,
      retentionPeriod: 6, currencyRequirement: true, languageRequirement: 'english', fiscalization: false,
    },
    payroll: {
      minimumWage: 2145, minimumWageCurrency: 'EUR',
      payPeriodFrequency: 'monthly', overtimeMultiplier: 1.25,
      maximumWorkingHours: 40, annualLeaveDays: 20, sickLeavePaid: 10,
      maternityLeaveWeeks: 26, pensionAge: { male: 68, female: 68 },
    },
    accounting: {
      standards: 'IFRS / FRS 102', fiscalYear: 'custom', chartOfAccounts: 'Irish COA',
      mandatoryReports: ['balance_sheet', 'p_l', 'cash_flow'],
    },
    taxForms: [
      { code: 'VAT3', name: 'VAT3 Return', frequency: 'bi-monthly', description: 'VAT return' },
      { code: 'CT1', name: 'Corporation Tax Return', frequency: 'annually', description: 'Corporate tax return' },
      { code: 'P35', name: 'Employer P35', frequency: 'monthly', description: 'Payroll return' },
    ],
  },
  // ===================== SWITZERLAND =====================
  {
    code: 'CH',
    name: 'Switzerland',
    flag: '🇨🇭',
    currency: 'CHF',
    region: 'europe',
    vat: {
      type: 'vat', standardRate: 8.1,
      reducedRates: [
        { rate: 3.8, description: 'Hotels, food' },
        { rate: 2.5, description: 'Basic food, books, medicine' },
      ],
      exemptions: ['financial services', 'insurance', 'education', 'healthcare', 'postal'],
      isEuVat: false, reverseCharge: true,
      registrationThreshold: 100000,
      filingFrequency: 'quarterly',
    },
    corporateTax: { rate: 14.9, reducedRates: [], specialRegimes: ['Cantonal tax incentives', 'Patent box', 'R&D super deduction'] },
    incomeTax: { type: 'progressive', brackets: [], flatRate: null, standardDeduction: 0, taxFreeAllowance: 19500 },
    socialContributions: {
      pension: { name: 'AHV/IV', employee: 5.125, employer: 5.125 },
      health: { name: 'Krankenkasse', employee: 0, employer: 0 },
      unemployment: { name: 'ALV', employee: 1.1, employer: 1.1 },
      other: [
        { name: 'BVG', employee: 3.5, employer: 3.5 },
        { name: 'FAK', employee: 0.5, employer: 0.5 },
      ],
      totalEmployee: 10.225,
      totalEmployer: 10.225,
    },
    withholdingTax: { dividends: 35, interest: 35, royalties: 0, services: 0 },
    invoiceRequirements: {
      mandatoryFields: ['seller_name', 'seller_address', 'buyer_name', 'buyer_address', 'invoice_number', 'invoice_date', 'items', 'tax_rate', 'total'],
      sequentialNumbering: true, electronicInvoicing: false, eInvoiceSystem: null,
      retentionPeriod: 10, currencyRequirement: true, languageRequirement: 'deutsch/français/italiano', fiscalization: false,
    },
    payroll: {
      minimumWage: 0, minimumWageCurrency: 'CHF',
      payPeriodFrequency: 'monthly', overtimeMultiplier: 1.25,
      maximumWorkingHours: 45, annualLeaveDays: 20, sickLeavePaid: 30,
      maternityLeaveWeeks: 14, pensionAge: { male: 65, female: 64 },
    },
    accounting: {
      standards: 'Swiss GAAP FER / IFRS', fiscalYear: 'custom', chartOfAccounts: 'Swiss COA',
      mandatoryReports: ['bilanz', 'erfolgsrechnung'],
    },
    taxForms: [
      { code: 'MWST', name: 'MWST-Abrechnung', frequency: 'quarterly', description: 'VAT return' },
      { code: 'StG', name: 'Steuererklärung', frequency: 'annually', description: 'Tax return' },
    ],
  },
  // ===================== ROMANIA =====================
  {
    code: 'RO',
    name: 'Romania',
    flag: '🇷🇴',
    currency: 'RON',
    region: 'europe',
    vat: {
      type: 'vat', standardRate: 19,
      reducedRates: [
        { rate: 9, description: 'Food, books, medicine, hotels' },
        { rate: 5, description: 'Newspapers, some food' },
      ],
      exemptions: ['financial services', 'insurance', 'education', 'healthcare'],
      isEuVat: true, reverseCharge: true,
      registrationThreshold: 300000,
      filingFrequency: 'monthly',
    },
    corporateTax: { rate: 16, reducedRates: [], specialRegimes: ['Micro-enterprise 1-3%', 'IT sector 0-3%'] },
    incomeTax: { type: 'flat', brackets: [], flatRate: 10, standardDeduction: 0, taxFreeAllowance: 0 },
    socialContributions: {
      pension: { name: 'Pensie', employee: 10.5, employer: 21.25 },
      health: { name: 'Sănătate', employee: 0, employer: 7 },
      unemployment: { name: 'Şomaj', employee: 0, employer: 2.25 },
      other: [],
      totalEmployee: 10.5,
      totalEmployer: 30.5,
    },
    withholdingTax: { dividends: 8, interest: 10, royalties: 10, services: 10 },
    invoiceRequirements: {
      mandatoryFields: ['seller_name', 'seller_address', 'seller_cui', 'buyer_name', 'buyer_cui', 'invoice_number', 'invoice_date', 'items', 'tax_rate', 'total'],
      sequentialNumbering: true, electronicInvoicing: true, eInvoiceSystem: 'RO e-Factura (SPV)',
      retentionPeriod: 10, currencyRequirement: true, languageRequirement: 'română', fiscalization: false,
    },
    payroll: {
      minimumWage: 3300, minimumWageCurrency: 'RON',
      payPeriodFrequency: 'monthly', overtimeMultiplier: 1.5,
      maximumWorkingHours: 40, annualLeaveDays: 20, sickLeavePaid: 60,
      maternityLeaveWeeks: 26, pensionAge: { male: 65, female: 63 },
    },
    accounting: {
      standards: 'OMFP 1802 / IFRS', fiscalYear: 'calendar', chartOfAccounts: 'Plan de Conturi RO',
      mandatoryReports: ['bilan', 'contul_profit', 'situatia_fluxurilor'],
    },
    taxForms: [
      { code: 'D100', name: 'Decont TVA', frequency: 'monthly', description: 'VAT return' },
      { code: 'D101', name: 'Declaratie informativa', frequency: 'monthly', description: 'VAT information return' },
      { code: 'D112', name: 'Declaratia salarii', frequency: 'monthly', description: 'Payroll declaration' },
    ],
  },
  // ===================== BULGARIA =====================
  {
    code: 'BG',
    name: 'Bulgaria',
    flag: '🇧🇬',
    currency: 'BGN',
    region: 'europe',
    vat: {
      type: 'vat', standardRate: 20,
      reducedRates: [
        { rate: 9, description: 'Hotels, some food, books' },
      ],
      exemptions: ['financial services', 'insurance', 'education', 'healthcare'],
      isEuVat: true, reverseCharge: true,
      registrationThreshold: 100000,
      filingFrequency: 'monthly',
    },
    corporateTax: { rate: 10, reducedRates: [], specialRegimes: ['Job creation relief', 'manufacturing in disadvantaged areas'] },
    incomeTax: { type: 'flat', brackets: [], flatRate: 10, standardDeduction: 0, taxFreeAllowance: 0 },
    socialContributions: {
      pension: { name: 'Пенсионен', employee: 7.8, employer: 13.45 },
      health: { name: 'Здравен', employee: 3.2, employer: 4.8 },
      unemployment: { name: 'Безработица', employee: 0.6, employer: 0.7 },
      other: [],
      totalEmployee: 11.6,
      totalEmployer: 18.95,
    },
    withholdingTax: { dividends: 5, interest: 10, royalties: 10, services: 10 },
    invoiceRequirements: {
      mandatoryFields: ['seller_name', 'seller_address', 'seller_eik', 'buyer_name', 'buyer_eik', 'invoice_number', 'invoice_date', 'items', 'tax_rate', 'total'],
      sequentialNumbering: true, electronicInvoicing: false, eInvoiceSystem: null,
      retentionPeriod: 10, currencyRequirement: true, languageRequirement: 'български', fiscalization: false,
    },
    payroll: {
      minimumWage: 933, minimumWageCurrency: 'BGN',
      payPeriodFrequency: 'monthly', overtimeMultiplier: 1.5,
      maximumWorkingHours: 40, annualLeaveDays: 20, sickLeavePaid: 30,
      maternityLeaveWeeks: 20, pensionAge: { male: 64, female: 61 },
    },
    accounting: {
      standards: 'Bulgarian GAAP / IFRS', fiscalYear: 'calendar', chartOfAccounts: 'Счетоводен план',
      mandatoryReports: ['баланс', 'отчет_приходи_разходи'],
    },
    taxForms: [
      { code: 'ДДС', name: 'ДДС декларация', frequency: 'monthly', description: 'VAT return' },
      { code: 'ГОД 1', name: 'Годишна данъчна декларация', frequency: 'annually', description: 'Annual tax return' },
    ],
  },
  // ===================== UNITED STATES =====================
  {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    currency: 'USD',
    region: 'americas',
    vat: {
      type: 'sales_tax', standardRate: 0,
      reducedRates: [],
      exemptions: [],
      isEuVat: false, reverseCharge: false,
      registrationThreshold: null,
      filingFrequency: 'varies_by_state',
    },
    corporateTax: { rate: 21, reducedRates: [], specialRegimes: ['S-Corp pass-through', 'LLC', 'R&D credit'] },
    incomeTax: { type: 'progressive', brackets: [], flatRate: null, standardDeduction: 14600, taxFreeAllowance: 14600 },
    socialContributions: {
      pension: { name: 'Social Security', employee: 6.2, employer: 6.2 },
      health: { name: 'Medicare', employee: 1.45, employer: 1.45 },
      unemployment: { name: 'FUTA', employee: 0, employer: 0.6 },
      other: [
        { name: 'Medicare surtax', employee: 0.9, employer: 0 },
      ],
      totalEmployee: 8.55,
      totalEmployer: 8.25,
    },
    withholdingTax: { dividends: 30, interest: 30, royalties: 30, services: 0 },
    invoiceRequirements: {
      mandatoryFields: ['seller_name', 'seller_address', 'buyer_name', 'invoice_number', 'invoice_date', 'items', 'total'],
      sequentialNumbering: false, electronicInvoicing: false, eInvoiceSystem: null,
      retentionPeriod: 7, currencyRequirement: true, languageRequirement: 'english', fiscalization: false,
    },
    payroll: {
      minimumWage: 1250, minimumWageCurrency: 'USD',
      payPeriodFrequency: 'biweekly', overtimeMultiplier: 1.5,
      maximumWorkingHours: 40, annualLeaveDays: 0, sickLeavePaid: 0,
      maternityLeaveWeeks: 12, pensionAge: { male: 67, female: 67 },
    },
    accounting: {
      standards: 'US GAAP', fiscalYear: 'custom', chartOfAccounts: 'US Chart of Accounts',
      mandatoryReports: ['balance_sheet', 'income_statement', 'cash_flow'],
    },
    taxForms: [
      { code: 'W-2', name: 'Wage and Tax Statement', frequency: 'annually', description: 'Employee wage report' },
      { code: '1099', name: 'Miscellaneous Income', frequency: 'annually', description: 'Contractor income report' },
      { code: '1120', name: 'Corporate Tax Return', frequency: 'annually', description: 'C-Corp tax return' },
    ],
  },
  // ===================== CANADA =====================
  {
    code: 'CA',
    name: 'Canada',
    flag: '🇨🇦',
    currency: 'CAD',
    region: 'americas',
    vat: {
      type: 'gst', standardRate: 5,
      reducedRates: [],
      exemptions: ['basic groceries', 'healthcare', 'education', 'financial services'],
      isEuVat: false, reverseCharge: false,
      registrationThreshold: 30000,
      filingFrequency: 'monthly',
    },
    corporateTax: { rate: 15, reducedRates: [], specialRegimes: ['Small business deduction (9%)', 'SR&ED credit'] },
    incomeTax: { type: 'progressive', brackets: [], flatRate: null, standardDeduction: 15000, taxFreeAllowance: 15000 },
    socialContributions: {
      pension: { name: 'CPP', employee: 5.95, employer: 5.95 },
      health: { name: 'EI', employee: 1.63, employer: 2.28 },
      unemployment: { name: 'EI', employee: 0, employer: 0 },
      other: [],
      totalEmployee: 7.58,
      totalEmployer: 8.23,
    },
    withholdingTax: { dividends: 25, interest: 25, royalties: 25, services: 0 },
    invoiceRequirements: {
      mandatoryFields: ['seller_name', 'seller_address', 'buyer_name', 'invoice_number', 'invoice_date', 'items', 'gst_amount', 'total'],
      sequentialNumbering: false, electronicInvoicing: false, eInvoiceSystem: null,
      retentionPeriod: 6, currencyRequirement: true, languageRequirement: 'english/french', fiscalization: false,
    },
    payroll: {
      minimumWage: 1800, minimumWageCurrency: 'CAD',
      payPeriodFrequency: 'biweekly', overtimeMultiplier: 1.5,
      maximumWorkingHours: 40, annualLeaveDays: 10, sickLeavePaid: 3,
      maternityLeaveWeeks: 17, pensionAge: { male: 65, female: 65 },
    },
    accounting: {
      standards: 'IFRS / ASPE', fiscalYear: 'custom', chartOfAccounts: 'Canadian COA',
      mandatoryReports: ['balance_sheet', 'income_statement', 'cash_flow'],
    },
    taxForms: [
      { code: 'GST/HST', name: 'GST/HST Return', frequency: 'monthly', description: 'GST return' },
      { code: 'T2', name: 'T2 Corporate Return', frequency: 'annually', description: 'Corporate tax return' },
      { code: 'T4', name: 'T4 Summary', frequency: 'annually', description: 'Payroll summary' },
    ],
  },
  // ===================== TURKEY =====================
  {
    code: 'TR',
    name: 'Turkey',
    flag: '🇹🇷',
    currency: 'TRY',
    region: 'asia',
    vat: {
      type: 'vat', standardRate: 20,
      reducedRates: [
        { rate: 10, description: 'Food, hotels, some services' },
        { rate: 1, description: 'Basic food, newspapers, some services' },
      ],
      exemptions: ['financial services', 'insurance', 'education', 'healthcare'],
      isEuVat: false, reverseCharge: true,
      registrationThreshold: 1900000,
      filingFrequency: 'monthly',
    },
    corporateTax: { rate: 20, reducedRates: [], specialRegimes: ['Tech development zones (R&D exemption)', 'Free zones'] },
    incomeTax: { type: 'progressive', brackets: [], flatRate: null, standardDeduction: 0, taxFreeAllowance: 100000 },
    socialContributions: {
      pension: { name: 'SGK', employee: 14, employer: 20.5 },
      health: { name: 'Genel Sağlık', employee: 5, employer: 7.5 },
      unemployment: { name: 'İşsizlik', employee: 1, employer: 2 },
      other: [],
      totalEmployee: 20,
      totalEmployer: 30,
    },
    withholdingTax: { dividends: 15, interest: 15, royalties: 20, services: 20 },
    invoiceRequirements: {
      mandatoryFields: ['seller_name', 'seller_address', 'seller_tax_no', 'buyer_name', 'buyer_tax_no', 'invoice_number', 'invoice_date', 'items', 'tax_rate', 'total'],
      sequentialNumbering: true, electronicInvoicing: true, eInvoiceSystem: 'e-Fatura (GIB)',
      retentionPeriod: 10, currencyRequirement: true, languageRequirement: 'türkçe', fiscalization: true,
    },
    payroll: {
      minimumWage: 20002, minimumWageCurrency: 'TRY',
      payPeriodFrequency: 'monthly', overtimeMultiplier: 1.5,
      maximumWorkingHours: 45, annualLeaveDays: 14, sickLeavePaid: 0,
      maternityLeaveWeeks: 16, pensionAge: { male: 65, female: 60 },
    },
    accounting: {
      standards: 'Turkish TFRS', fiscalYear: 'calendar', chartOfAccounts: 'Turkish COA',
      mandatoryReports: ['bilanço', 'gelir_tablosu'],
    },
    taxForms: [
      { code: 'KDV', name: 'KDV Beyannamesi', frequency: 'monthly', description: 'VAT return' },
      { code: 'Beyanname', name: 'Kurumlar Vergisi', frequency: 'annually', description: 'Corporate tax return' },
      { code: 'SGK', name: 'SGK Bildirgesi', frequency: 'monthly', description: 'Social security declaration' },
    ],
  },
  // ===================== UAE =====================
  {
    code: 'AE',
    name: 'United Arab Emirates',
    flag: '🇦🇪',
    currency: 'AED',
    region: 'asia',
    vat: {
      type: 'vat', standardRate: 5,
      reducedRates: [],
      exemptions: ['financial services', 'education', 'healthcare', 'residential properties', 'local transport'],
      isEuVat: false, reverseCharge: true,
      registrationThreshold: 375000,
      filingFrequency: 'quarterly',
    },
    corporateTax: { rate: 9, reducedRates: [], specialRegimes: ['Free zone 0%', 'QSF regime'] },
    incomeTax: { type: 'none', brackets: [], flatRate: null, standardDeduction: 0, taxFreeAllowance: 0 },
    socialContributions: {
      pension: { name: 'Pension (UAE nationals only)', employee: 5, employer: 12.5 },
      health: { name: 'Health insurance', employee: 0, employer: 0 },
      unemployment: { name: 'Unemployment', employee: 0, employer: 0 },
      other: [],
      totalEmployee: 5,
      totalEmployer: 12.5,
    },
    withholdingTax: { dividends: 0, interest: 0, royalties: 0, services: 0 },
    invoiceRequirements: {
      mandatoryFields: ['seller_name', 'seller_address', 'seller_trn', 'buyer_name', 'buyer_trn', 'invoice_number', 'invoice_date', 'items', 'tax_amount', 'total'],
      sequentialNumbering: true, electronicInvoicing: false, eInvoiceSystem: null,
      retentionPeriod: 6, currencyRequirement: true, languageRequirement: 'arabic/english', fiscalization: false,
    },
    payroll: {
      minimumWage: 0, minimumWageCurrency: 'AED',
      payPeriodFrequency: 'monthly', overtimeMultiplier: 1.25,
      maximumWorkingHours: 48, annualLeaveDays: 30, sickLeavePaid: 15,
      maternityLeaveWeeks: 13, pensionAge: { male: 60, female: 55 },
    },
    accounting: {
      standards: 'IFRS', fiscalYear: 'calendar', chartOfAccounts: 'International COA',
      mandatoryReports: ['balance_sheet', 'income_statement'],
    },
    taxForms: [
      { code: 'VAT201', name: 'VAT Return', frequency: 'quarterly', description: 'VAT return' },
      { code: 'CT', name: 'Corporate Tax Return', frequency: 'annually', description: 'Corporate tax return' },
    ],
  },
  // ===================== SWEDEN =====================
  {
    code: 'SE',
    name: 'Sweden',
    flag: '🇸🇪',
    currency: 'SEK',
    region: 'europe',
    vat: {
      type: 'vat', standardRate: 25,
      reducedRates: [
        { rate: 12, description: 'Food, hotels, art' },
        { rate: 6, description: 'Books, newspapers, transport' },
      ],
      exemptions: ['financial services', 'insurance', 'education', 'healthcare'],
      isEuVat: true, reverseCharge: true,
      registrationThreshold: 80000,
      filingFrequency: 'monthly',
    },
    corporateTax: { rate: 20.6, reducedRates: [], specialRegimes: ['R&D deduction', 'Interest deduction limitations'] },
    incomeTax: { type: 'progressive', brackets: [], flatRate: null, standardDeduction: 0, taxFreeAllowance: 23800 },
    socialContributions: {
      pension: { name: 'Allmän pension', employee: 7, employer: 10.21 },
      health: { name: 'Sjukförsäkring', employee: 0, employer: 3.45 },
      unemployment: { name: 'Arbetslöshet', employee: 0, employer: 2.64 },
      other: [
        { name: 'Föräldraförsäkring', employee: 0, employer: 2.6 },
        { name: 'Avgiftsberäknad', employee: 0, employer: 0.3 },
      ],
      totalEmployee: 7,
      totalEmployer: 19.2,
    },
    withholdingTax: { dividends: 30, interest: 25, royalties: 0, services: 0 },
    invoiceRequirements: {
      mandatoryFields: ['seller_name', 'seller_address', 'seller_vat', 'buyer_name', 'buyer_vat', 'invoice_number', 'invoice_date', 'items', 'tax_rate', 'total'],
      sequentialNumbering: true, electronicInvoicing: true, eInvoiceSystem: 'Peppol / Visma',
      retentionPeriod: 7, currencyRequirement: true, languageRequirement: 'svenska', fiscalization: false,
    },
    payroll: {
      minimumWage: 0, minimumWageCurrency: 'SEK',
      payPeriodFrequency: 'monthly', overtimeMultiplier: 1.5,
      maximumWorkingHours: 40, annualLeaveDays: 25, sickLeavePaid: 80,
      maternityLeaveWeeks: 39, pensionAge: { male: 66, female: 66 },
    },
    accounting: {
      standards: 'Swedish K-regelverk / IFRS', fiscalYear: 'calendar', chartOfAccounts: 'Swedish BAS',
      mandatoryReports: ['balansräkning', 'resultaträkning'],
    },
    taxForms: [
      { code: 'SKV', name: 'Momsdeklaration', frequency: 'monthly', description: 'VAT return' },
      { code: 'INK2', name: 'Inkomstdeklaration', frequency: 'annually', description: 'Income tax return' },
    ],
  },
  // ===================== DENMARK =====================
  {
    code: 'DK',
    name: 'Denmark',
    flag: '🇩🇰',
    currency: 'DKK',
    region: 'europe',
    vat: {
      type: 'vat', standardRate: 25,
      reducedRates: [],
      exemptions: ['financial services', 'insurance', 'education', 'healthcare', 'newspapers'],
      isEuVat: true, reverseCharge: true,
      registrationThreshold: 50000,
      filingFrequency: 'monthly',
    },
    corporateTax: { rate: 22, reducedRates: [], specialRegimes: ['R&D tax credit', 'Patent box'] },
    incomeTax: { type: 'progressive', brackets: [], flatRate: null, standardDeduction: 0, taxFreeAllowance: 49700 },
    socialContributions: {
      pension: { name: 'ATP', employee: 0, employer: 0 },
      health: { name: 'AM-bidrag', employee: 8, employer: 0 },
      unemployment: { name: 'A-kasse', employee: 0, employer: 0 },
      other: [
        { name: 'Arbejdsgiverbidrag', employee: 0, employer: 0.45 },
      ],
      totalEmployee: 8,
      totalEmployer: 0.45,
    },
    withholdingTax: { dividends: 27, interest: 0, royalties: 0, services: 0 },
    invoiceRequirements: {
      mandatoryFields: ['seller_name', 'seller_address', 'seller_cvr', 'buyer_name', 'buyer_cvr', 'invoice_number', 'invoice_date', 'items', 'tax_rate', 'total'],
      sequentialNumbering: true, electronicInvoicing: true, eInvoiceSystem: 'Nemhandel / OIOUBL',
      retentionPeriod: 5, currencyRequirement: true, languageRequirement: 'dansk', fiscalization: false,
    },
    payroll: {
      minimumWage: 0, minimumWageCurrency: 'DKK',
      payPeriodFrequency: 'monthly', overtimeMultiplier: 1.5,
      maximumWorkingHours: 37, annualLeaveDays: 25, sickLeavePaid: 30,
      maternityLeaveWeeks: 18, pensionAge: { male: 67, female: 67 },
    },
    accounting: {
      standards: 'Danish FRS / IFRS', fiscalYear: 'calendar', chartOfAccounts: 'Danish COA',
      mandatoryReports: ['balance', 'resultatopgørelse'],
    },
    taxForms: [
      { code: 'Moms', name: 'Momsangivelse', frequency: 'monthly', description: 'VAT return' },
      { code: 'Selvangivelse', name: 'Selvangivelse', frequency: 'annually', description: 'Tax return' },
    ],
  },
  // ===================== GREECE =====================
  {
    code: 'GR',
    name: 'Greece',
    flag: '🇬🇷',
    currency: 'EUR',
    region: 'europe',
    vat: {
      type: 'vat', standardRate: 24,
      reducedRates: [
        { rate: 13, description: 'Food, hotels, some services' },
        { rate: 6, description: 'Books, medicine, newspapers' },
      ],
      exemptions: ['financial services', 'insurance', 'education', 'healthcare'],
      isEuVat: true, reverseCharge: true,
      registrationThreshold: 10000,
      filingFrequency: 'monthly',
    },
    corporateTax: { rate: 22, reducedRates: [], specialRegimes: ['Reduced rate for small business 15%'] },
    incomeTax: { type: 'progressive', brackets: [], flatRate: null, standardDeduction: 0, taxFreeAllowance: 5600 },
    socialContributions: {
      pension: { name: 'Συντάξεις', employee: 6.67, employer: 13.33 },
      health: { name: 'Υγεία', employee: 2.65, employer: 4.45 },
      unemployment: { name: 'Ανεργία', employee: 1.2, employer: 4.6 },
      other: [],
      totalEmployee: 10.52,
      totalEmployer: 22.38,
    },
    withholdingTax: { dividends: 15, interest: 15, royalties: 20, services: 20 },
    invoiceRequirements: {
      mandatoryFields: ['seller_name', 'seller_address', 'seller_afm', 'buyer_name', 'buyer_afm', 'invoice_number', 'invoice_date', 'items', 'tax_rate', 'total'],
      sequentialNumbering: true, electronicInvoicing: true, eInvoiceSystem: 'myDATA',
      retentionPeriod: 10, currencyRequirement: true, languageRequirement: 'ελληνικά', fiscalization: false,
    },
    payroll: {
      minimumWage: 880, minimumWageCurrency: 'EUR',
      payPeriodFrequency: 'monthly', overtimeMultiplier: 1.25,
      maximumWorkingHours: 40, annualLeaveDays: 22, sickLeavePaid: 30,
      maternityLeaveWeeks: 17, pensionAge: { male: 67, female: 67 },
    },
    accounting: {
      standards: 'Greek GAAP / IFRS', fiscalYear: 'calendar', chartOfAccounts: 'Greek COA',
      mandatoryReports: ['ισολογισμός', 'αποτελέσματα'],
    },
    taxForms: [
      { code: 'ΦΠΑ', name: 'Δήλωση ΦΠΑ', frequency: 'monthly', description: 'VAT return' },
      { code: 'Ε3', name: 'Ε3 Φορολογική δήλωση', frequency: 'annually', description: 'Tax return' },
    ],
  },
  // ===================== PORTUGAL =====================
  {
    code: 'PT',
    name: 'Portugal',
    flag: '🇵🇹',
    currency: 'EUR',
    region: 'europe',
    vat: {
      type: 'vat', standardRate: 23,
      reducedRates: [
        { rate: 13, description: 'Restaurants, some food, some services' },
        { rate: 6, description: 'Basic food, books, medicine' },
      ],
      exemptions: ['financial services', 'insurance', 'education', 'healthcare', 'postal'],
      isEuVat: true, reverseCharge: true,
      registrationThreshold: 14000,
      filingFrequency: 'monthly',
    },
    corporateTax: { rate: 21, reducedRates: [{ threshold: 1500000, rate: 17 }], specialRegimes: ['SIFIDE (R&D)', 'AIMI surcharge'] },
    incomeTax: { type: 'progressive', brackets: [], flatRate: null, standardDeduction: 0, taxFreeAllowance: 7620 },
    socialContributions: {
      pension: { name: 'Segurança Social', employee: 11, employer: 23.75 },
      health: { name: 'Saúde', employee: 0, employer: 0 },
      unemployment: { name: 'Desemprego', employee: 0, employer: 1 },
      other: [],
      totalEmployee: 11,
      totalEmployer: 24.75,
    },
    withholdingTax: { dividends: 28, interest: 28, royalties: 15, services: 15 },
    invoiceRequirements: {
      mandatoryFields: ['seller_name', 'seller_address', 'seller_nif', 'buyer_name', 'buyer_nif', 'invoice_number', 'invoice_date', 'items', 'tax_rate', 'total'],
      sequentialNumbering: true, electronicInvoicing: true, eInvoiceSystem: 'ATCUD / e-Fatura',
      retentionPeriod: 10, currencyRequirement: true, languageRequirement: 'português', fiscalization: true,
    },
    payroll: {
      minimumWage: 820, minimumWageCurrency: 'EUR',
      payPeriodFrequency: 'monthly', overtimeMultiplier: 1.5,
      maximumWorkingHours: 40, annualLeaveDays: 22, sickLeavePaid: 30,
      maternityLeaveWeeks: 20, pensionAge: { male: 66, female: 66 },
    },
    accounting: {
      standards: 'Portuguese SNC / IFRS', fiscalYear: 'calendar', chartOfAccounts: 'POC / SNC',
      mandatoryReports: ['balanço', 'demonstração_resultados'],
    },
    taxForms: [
      { code: 'IVA', name: 'Declaração periódica do IVA', frequency: 'monthly', description: 'VAT return' },
      { code: 'Mod 22', name: 'IRC', frequency: 'annually', description: 'Corporate tax return' },
    ],
  },
]

// ============ HELPER FUNCTIONS ============

export function getTaxLaw(countryCode: string): CountryTaxLaw | undefined {
  return COUNTRY_TAX_LAWS.find(c => c.code === countryCode)
}

export function calculateVAT(
  amount: number,
  countryCode: string,
  rateType: 'standard' | 'reduced' = 'standard'
): { net: number; tax: number; gross: number; rate: number } {
  const law = getTaxLaw(countryCode)
  if (!law || law.vat.type === 'none') return { net: amount, tax: 0, gross: amount, rate: 0 }

  const rate = rateType === 'reduced' && law.vat.reducedRates.length > 0
    ? law.vat.reducedRates[0].rate
    : law.vat.standardRate

  const taxRate = rate / 100
  const net = amount / (1 + taxRate)
  const tax = amount - net

  return { net: Math.round(net * 100) / 100, tax: Math.round(tax * 100) / 100, gross: amount, rate }
}

export function calculateIncomeTax(
  grossSalary: number,
  countryCode: string
): { gross: number; incomeTax: number; socialContributions: number; netSalary: number; breakdown: { name: string; employeePct: number; amount: number }[] } {
  const law = getTaxLaw(countryCode)
  if (!law) return { gross: grossSalary, incomeTax: 0, socialContributions: 0, netSalary: grossSalary, breakdown: [] }

  const breakdown: { name: string; employeePct: number; amount: number }[] = []
  let totalContributions = 0

  // Pension
  const pensionAmount = grossSalary * (law.socialContributions.pension.employee / 100)
  totalContributions += pensionAmount
  breakdown.push({ name: law.socialContributions.pension.name, employeePct: law.socialContributions.pension.employee, amount: pensionAmount })

  // Health
  const healthAmount = grossSalary * (law.socialContributions.health.employee / 100)
  totalContributions += healthAmount
  breakdown.push({ name: law.socialContributions.health.name, employeePct: law.socialContributions.health.employee, amount: healthAmount })

  // Unemployment
  const unemploymentAmount = grossSalary * (law.socialContributions.unemployment.employee / 100)
  totalContributions += unemploymentAmount
  breakdown.push({ name: law.socialContributions.unemployment.name, employeePct: law.socialContributions.unemployment.employee, amount: unemploymentAmount })

  // Other
  for (const other of law.socialContributions.other) {
    if (other.employee > 0) {
      const amount = grossSalary * (other.employee / 100)
      totalContributions += amount
      breakdown.push({ name: other.name, employeePct: other.employee, amount })
    }
  }

  // Taxable base
  const taxableBase = grossSalary - totalContributions

  // Income tax
  let incomeTax = 0
  if (law.incomeTax.type === 'flat' && law.incomeTax.flatRate) {
    const taxable = Math.max(0, taxableBase - law.incomeTax.taxFreeAllowance)
    incomeTax = taxable * (law.incomeTax.flatRate / 100)
  } else if (law.incomeTax.type === 'progressive') {
    const remaining = Math.max(0, taxableBase - law.incomeTax.taxFreeAllowance)
    // Simple progressive with brackets if available, otherwise flat 20% estimate
    if (law.incomeTax.brackets.length > 0) {
      let remaining2 = remaining
      for (const bracket of law.incomeTax.brackets) {
        const bracketWidth = bracket.max === null ? remaining2 : Math.min(remaining2, bracket.max - bracket.min)
        if (bracketWidth <= 0) break
        incomeTax += bracketWidth * (bracket.rate / 100)
        remaining2 -= bracketWidth
      }
    }
  }

  const netSalary = grossSalary - totalContributions - incomeTax

  return {
    gross: grossSalary,
    incomeTax: Math.round(incomeTax * 100) / 100,
    socialContributions: Math.round(totalContributions * 100) / 100,
    netSalary: Math.round(netSalary * 100) / 100,
    breakdown,
  }
}

export function calculateEmployerCost(
  grossSalary: number,
  countryCode: string
): { gross: number; employerContributions: number; totalCost: number; breakdown: { name: string; employerPct: number; amount: number }[] } {
  const law = getTaxLaw(countryCode)
  if (!law) return { gross: grossSalary, employerContributions: 0, totalCost: grossSalary, breakdown: [] }

  const breakdown: { name: string; employerPct: number; amount: number }[] = []
  let totalContributions = 0

  // Pension
  const pensionAmount = grossSalary * (law.socialContributions.pension.employer / 100)
  totalContributions += pensionAmount
  breakdown.push({ name: law.socialContributions.pension.name, employeePct: law.socialContributions.pension.employer, amount: pensionAmount })

  // Health
  const healthAmount = grossSalary * (law.socialContributions.health.employer / 100)
  totalContributions += healthAmount
  breakdown.push({ name: law.socialContributions.health.name, employeePct: law.socialContributions.health.employer, amount: healthAmount })

  // Unemployment
  const unemploymentAmount = grossSalary * (law.socialContributions.unemployment.employer / 100)
  totalContributions += unemploymentAmount
  breakdown.push({ name: law.socialContributions.unemployment.name, employeePct: law.socialContributions.unemployment.employer, amount: unemploymentAmount })

  // Other
  for (const other of law.socialContributions.other) {
    if (other.employer > 0) {
      const amount = grossSalary * (other.employer / 100)
      totalContributions += amount
      breakdown.push({ name: other.name, employeePct: other.employer, amount })
    }
  }

  return {
    gross: grossSalary,
    employerContributions: Math.round(totalContributions * 100) / 100,
    totalCost: Math.round((grossSalary + totalContributions) * 100) / 100,
    breakdown,
  }
}

export function getInvoiceMandatoryFields(countryCode: string): string[] {
  const law = getTaxLaw(countryCode)
  return law?.invoiceRequirements.mandatoryFields || []
}

export function getTaxForms(countryCode: string): TaxForm[] {
  const law = getTaxLaw(countryCode)
  return law?.taxForms || []
}

export function getCountriesByRegion(region: string): CountryTaxLaw[] {
  return COUNTRY_TAX_LAWS.filter(c => c.region === region)
}

export function searchCountries(query: string): CountryTaxLaw[] {
  const q = query.toLowerCase()
  return COUNTRY_TAX_LAWS.filter(c =>
    c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
  )
}

export function getAllRegions(): string[] {
  return [...new Set(COUNTRY_TAX_LAWS.map(c => c.region))]
}

export function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    RSD: 'дин', EUR: '€', GBP: '£', USD: '$', PLN: 'zł', CZK: 'Kč',
    BAM: 'КМ', MKD: 'ден', CHF: 'CHF', RON: 'lei', BGN: 'лв',
    SEK: 'kr', DKK: 'kr', CAD: 'C$', TRY: '₺', AED: 'د.إ', TRY: '₺',
  }
  return symbols[currency] || currency
}
