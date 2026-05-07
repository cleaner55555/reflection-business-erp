/**
 * Phase B: Industry Module Sets
 * 10 industry templates with pre-configured module lists.
 * User selects industry during registration → only relevant modules appear.
 */

export type IndustryId =
  | 'general'
  | 'school'
  | 'restaurant'
  | 'manufacturing'
  | 'healthcare'
  | 'construction'
  | 'ecommerce'
  | 'services'
  | 'logistics'
  | 'realestate'

export interface IndustrySet {
  id: IndustryId
  name: string
  nameSr: string
  icon: string // lucide-react icon name
  color: string // tailwind color class for gradient
  description: string
  descriptionSr: string
  /** Core modules always included for this industry */
  modules: string[]
  /** Optional extra modules user can add */
  optionalModules: string[]
}

export const INDUSTRY_SETS: IndustrySet[] = [
  {
    id: 'general',
    name: 'General Business',
    nameSr: 'Opšte Poslovanje',
    icon: 'Briefcase',
    color: 'from-blue-500 to-blue-700',
    description: 'For any business — invoicing, inventory, HR, projects',
    descriptionSr: 'Za svako preduzeće — fakture, magacin, ljudski resursi, projekti',
    modules: [
      'dashboard', 'contacts', 'invoices', 'inventory', 'projects', 'calendar',
      'employees', 'expenses', 'finance', 'accounting', 'documents',
      'reports', 'settings', 'notes', 'appointments',
    ],
    optionalModules: [
      'crm', 'procurement', 'assets', 'maintenance', 'recruitment', 'leave',
      'signatures', 'contracts', 'ecommerce', 'website', 'blog', 'email-marketing',
      'scheduler', 'fleet', 'pos', 'shipping',
    ],
  },
  {
    id: 'school',
    name: 'School / Education',
    nameSr: 'Škola / Obrazovanje',
    icon: 'GraduationCap',
    color: 'from-emerald-500 to-emerald-700',
    description: 'Schools, universities, training centers',
    descriptionSr: 'Škole, univerziteti, edukativni centri',
    modules: [
      'dashboard', 'employees', 'recruitment', 'education', 'calendar',
      'leave', 'scheduler', 'forum', 'surveys', 'knowledge-base', 'chat',
      'support', 'ratings', 'health-fund', 'suggestions', 'reports',
      'spreadsheet',
    ],
    optionalModules: [
      'homework', 'enrollment', 'timetable', 'library', 'classroom', 'tuition',
      'lab', 'finance', 'accounting', 'invoices', 'notes',
      'appointments', 'skills', 'gamification',
    ],
  },
  {
    id: 'restaurant',
    name: 'Restaurant / Cafe',
    nameSr: 'Restoran / Kafana',
    icon: 'UtensilsCrossed',
    color: 'from-orange-500 to-orange-700',
    description: 'Restaurants, cafes, bars, catering',
    descriptionSr: 'Restorani, kafane, barovi, catering',
    modules: [
      'dashboard', 'restaurant', 'pos', 'contacts', 'inventory', 'invoices',
      'expenses', 'employees', 'workforce-planner', 'leave', 'reports',
    ],
    optionalModules: [
      'reservations', 'menu', 'kitchen', 'orders', 'delivery',
      'finance', 'accounting', 'complaints', 'reviews', 'settings',
    ],
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing',
    nameSr: 'Proizvodnja',
    icon: 'Factory',
    color: 'from-slate-500 to-slate-700',
    description: 'Factories, workshops, production lines',
    descriptionSr: 'Fabrike, radionice, proizvodne linije',
    modules: [
      'dashboard', 'manufacturing', 'inventory', 'procurement', 'quality',
      'maintenance', 'assets', 'employees', 'workforce-planner',
      'finance', 'reports',
    ],
    optionalModules: [
      'field-service', 'service-center', 'work-orders', 'standards', 'labels',
      'barcode', 'measurements', 'safety', 'fleet', 'procurement-manager',
      'plm', 'accounting',
    ],
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    nameSr: 'Zdravstvo',
    icon: 'HeartPulse',
    color: 'from-red-500 to-red-700',
    description: 'Clinics, hospitals, pharmacies, labs',
    descriptionSr: 'Ambulante, bolnice, apoteke, laboratorije',
    modules: [
      'dashboard', 'contacts', 'appointments', 'invoices', 'health-fund',
      'employees', 'calendar', 'documents', 'reports',
    ],
    optionalModules: [
      'signatures', 'patients', 'medical-records', 'prescriptions', 'lab',
      'accounting', 'finance', 'notes', 'surveys',
    ],
  },
  {
    id: 'construction',
    name: 'Construction',
    nameSr: 'Građevina',
    icon: 'HardHat',
    color: 'from-amber-500 to-amber-700',
    description: 'Construction companies, engineering firms',
    descriptionSr: 'Građevinska preduzeća, inženjerske firme',
    modules: [
      'dashboard', 'projects', 'employees', 'inventory', 'procurement', 'invoices',
      'assets', 'maintenance', 'field-service', 'geolocation', 'reports',
    ],
    optionalModules: [
      'construction-site', 'blueprints', 'subcontractors', 'measurements', 'safety',
      'fleet', 'finance', 'accounting', 'workforce-planner',
    ],
  },
  {
    id: 'ecommerce',
    name: 'E-Commerce',
    nameSr: 'Online Prodaja',
    icon: 'ShoppingCart',
    color: 'from-violet-500 to-violet-700',
    description: 'Online stores, marketplaces, digital products',
    descriptionSr: 'Online prodavnice, marketplace, digitalni proizvodi',
    modules: [
      'dashboard', 'ecommerce', 'marketplace', 'contacts', 'inventory',
      'invoices', 'shipping', 'finance',
    ],
    optionalModules: [
      'social-media', 'marketing-automation', 'sms-marketing', 'email-marketing',
      'reports', 'returns', 'coupons', 'reviews', 'seo', 'payments',
      'orders', 'price-lists', 'barcode', 'stores', 'website', 'blog',
    ],
  },
  {
    id: 'services',
    name: 'Professional Services',
    nameSr: 'Savetovanje / IT',
    icon: 'UserCheck',
    color: 'from-cyan-500 to-cyan-700',
    description: 'Consulting, IT, legal, accounting firms',
    descriptionSr: 'Savetovanje, IT, pravne i računovodstvene firme',
    modules: [
      'dashboard', 'crm', 'projects', 'invoices', 'employees', 'appointments',
      'calendar', 'notes', 'chat', 'documents', 'contracts', 'reports',
    ],
    optionalModules: [
      'time-tracking', 'time-billing', 'client-portal',
      'accounting', 'finance', 'email-marketing', 'website', 'blog',
      'signatures',
    ],
  },
  {
    id: 'logistics',
    name: 'Logistics / Transport',
    nameSr: 'Logistika / Transport',
    icon: 'Truck',
    color: 'from-teal-500 to-teal-700',
    description: 'Transport, delivery, warehousing companies',
    descriptionSr: 'Transport, dostava, skladištenje',
    modules: [
      'dashboard', 'fleet', 'shipping', 'inventory', 'geolocation',
      'field-service', 'contacts', 'invoices', 'employees', 'reports',
    ],
    optionalModules: [
      'routes', 'loading-dock', 'customs-docs', 'trucks', 'packaging',
      'delivery', 'maintenance', 'assets', 'accounting', 'finance',
      'procurement-manager',
    ],
  },
  {
    id: 'realestate',
    name: 'Real Estate',
    nameSr: 'Nekretnine',
    icon: 'Building2',
    color: 'from-rose-500 to-rose-700',
    description: 'Real estate agencies, property management',
    descriptionSr: 'Agencije za nekretnine, upravljanje nekretninama',
    modules: [
      'dashboard', 'contacts', 'projects', 'contracts', 'invoices', 'calendar',
      'appointments', 'documents', 'signatures', 'reports',
    ],
    optionalModules: [
      'property', 'rentals', 'property-viewings', 'utilities',
      'finance', 'accounting', 'notes', 'email-marketing', 'reviews',
    ],
  },
]

/** Always-visible modules regardless of industry set */
export const ALWAYS_VISIBLE_MODULES = [
  'dashboard',
  'settings',
  'notifications',
  'ai-assistant',
]

/**
 * Get an industry set by ID
 */
export function getIndustrySet(id: IndustryId): IndustrySet | undefined {
  return INDUSTRY_SETS.find(s => s.id === id)
}

/**
 * Get all module IDs that are always available (core + settings)
 */
export function getAllCoreModuleIds(): string[] {
  return ALWAYS_VISIBLE_MODULES
}
