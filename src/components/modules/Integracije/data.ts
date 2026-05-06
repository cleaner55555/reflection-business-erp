// Integracije module – static data & configuration maps

export const CONNECTOR_TYPES: Record<string, string> = {
  external_accounting_1: 'Spoljni knjigovodstveni sistem 1',
  external_accounting_2: 'Spoljni knjigovodstveni sistem 2',
  external_accounting_3: 'Spoljni knjigovodstveni sistem 3',
  einvoice_system: 'eFakturisanje (SEF)',
  enterprise_erp: 'Enterprise ERP',
  external_accounting_4: 'Spoljni knjigovodstveni sistem 4',
  custom_api: 'Custom API',
};

export const ENTITY_OPTIONS = [
  { value: 'partners', label: 'Partners' },
  { value: 'products', label: 'Products' },
  { value: 'transactions', label: 'Transactions' },
  { value: 'contacts', label: 'Contacts' },
  { value: 'invoices', label: 'Invoices' },
  { value: 'stock', label: 'Stock' },
  { value: 'employees', label: 'Employees' },
];
