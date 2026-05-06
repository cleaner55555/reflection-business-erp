export const JOURNAL_TYPE_OPTIONS = [
  { value: 'all', label: 'common.all' },
  { value: 'faktura_izlazna', label: 'invoices.outgoing' },
  { value: 'faktura_ulazna', label: 'invoices.incoming' },
  { value: 'predracun', label: 'invoices.preinvoice' },
  { value: 'transakcija', label: 'finance.transaction' },
  { value: 'kasa', label: 'finance.cashRegister' },
  { value: 'nabavka', label: 'finance.purchase' },
  { value: 'otpremnica', label: 'finance.deliveryNote' },
] as const;
