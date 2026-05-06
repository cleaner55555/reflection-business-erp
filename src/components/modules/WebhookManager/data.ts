export const WEBHOOK_EVENTS = [
  { value: 'invoice.created', label: 'Faktura kreirana', icon: '📄' },
  { value: 'invoice.paid', label: 'Faktura plaćena', icon: '✅' },
  { value: 'invoice.sent', label: 'Faktura poslata', icon: '📤' },
  { value: 'partner.created', label: 'Partner kreiran', icon: '🤝' },
  { value: 'partner.updated', label: 'Partner ažuriran', icon: '✏️' },
  { value: 'stock.low', label: 'Niska zaliha', icon: '⚠️' },
  { value: 'stock.movement', label: 'Kretanje zaliha', icon: '📦' },
  { value: 'payment.received', label: 'Plaćanje primljeno', icon: '💰' },
  { value: 'journal.entry', label: 'Knjiženje', icon: '📒' },
  { value: 'deal.won', label: 'Poslovna prilika - uspeh', icon: '🎉' },
  { value: 'deal.lost', label: 'Poslovna prilika - gubitak', icon: '😔' },
  { value: 'employee.created', label: 'Zaposleni kreiran', icon: '👤' },
  { value: 'payroll.created', label: 'Plata kreirana', icon: '💵' },
  { value: 'project.completed', label: 'Projekat završen', icon: '📁' },
  { value: 'user.login', label: 'Prijava korisnika', icon: '🔐' },
  { value: 'audit.critical', label: 'Kritičan audit događaj', icon: '🚨' },
]

export const EVENT_GROUPS = [
  { label: 'Fakture', events: ['invoice.created', 'invoice.paid', 'invoice.sent'] },
  { label: 'Partneri', events: ['partner.created', 'partner.updated'] },
  { label: 'Magacin', events: ['stock.low', 'stock.movement'] },
  { label: 'Finansije', events: ['payment.received', 'journal.entry'] },
  { label: 'CRM', events: ['deal.won', 'deal.lost'] },
  { label: 'Zaposleni', events: ['employee.created', 'payroll.created'] },
  { label: 'Projekti', events: ['project.completed'] },
  { label: 'Sistem', events: ['user.login', 'audit.critical'] },
]

export const activeCompanyId = useAppStore((s) => s.activeCompanyId);
