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
      'dashboard', 'partneri', 'fakture', 'magacin', 'projekti', 'kalendar',
      'zaposleni', 'troskovi', 'finansije', 'knjigovodstvo', 'dokumenta',
      'izvestaji', 'podesavanja', 'beleske', 'zakazivanja',
    ],
    optionalModules: [
      'crm', 'nabavka', 'sredstva', 'odrzavanje', 'regrutacija', 'odsustva',
      'potpisi', 'ugovori', 'ecommerce', 'website', 'blog', 'email-marketing',
      'planer', 'vozni-park', 'pos', 'shipping',
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
      'dashboard', 'zaposleni', 'regrutacija', 'edukacija', 'kalendar',
      'odsustva', 'planer', 'forum', 'ankete', 'baza-znanja', 'chet',
      'podrska', 'ocene', 'fond-zdravlja', 'predlozi', 'izvestaji',
      'spreadsheet',
    ],
    optionalModules: [
      'obaveze', 'prijave', 'raspored', 'biblioteka', 'ucionica', 'skolarina',
      'laboratorija', 'finansije', 'knjigovodstvo', 'fakture', 'beleske',
      'zakazivanja', 'vestine', 'gamifikacija',
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
      'dashboard', 'kafe-restoran', 'pos', 'partneri', 'magacin', 'fakture',
      'troskovi', 'zaposleni', 'planer-radne-sile', 'odsustva', 'izvestaji',
    ],
    optionalModules: [
      'rezervacije', 'jelovnik', 'kuhinja', 'narudzbe', 'dostava',
      'finansije', 'knjigovodstvo', 'reklamacije', 'recenzije', 'podesavanja',
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
      'dashboard', 'proizvodnja', 'magacin', 'nabavka', 'kvalitet',
      'odrzavanje', 'sredstva', 'zaposleni', 'planer-radne-sile',
      'finansije', 'izvestaji',
    ],
    optionalModules: [
      'terenski-servis', 'servis', 'radni-nalozi', 'normativ', 'etikete',
      'barkod', 'merenja', 'bezbednost', 'vozni-park', 'menadzer-nabavke',
      'plm', 'knjigovodstvo',
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
      'dashboard', 'partneri', 'zakazivanja', 'fakture', 'fond-zdravlja',
      'zaposleni', 'kalendar', 'dokumenta', 'izvestaji',
    ],
    optionalModules: [
      'potpisi', 'pacijenti', 'kartoni', 'recepti', 'laboratorija',
      'knjigovodstvo', 'finansije', 'beleske', 'ankete',
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
      'dashboard', 'projekti', 'zaposleni', 'magacin', 'nabavka', 'fakture',
      'sredstva', 'odrzavanje', 'terenski-servis', 'geolokacija', 'izvestaji',
    ],
    optionalModules: [
      'gradiliste', 'projektovanje', 'subodradaci', 'merenja', 'bezbednost',
      'vozni-park', 'finansije', 'knjigovodstvo', 'planer-radne-sile',
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
      'dashboard', 'ecommerce', 'marketplace', 'partneri', 'magacin',
      'fakture', 'shipping', 'finansije',
    ],
    optionalModules: [
      'drustvene-mreze', 'mkt-automatizacija', 'sms-marketing', 'email-marketing',
      'izvestaji', 'povrat', 'kuponi', 'recenzije', 'seo', 'naplate',
      'narudzbe', 'cenovnici', 'barkod', 'poslovnice', 'website', 'blog',
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
      'dashboard', 'crm', 'projekti', 'fakture', 'zaposleni', 'zakazivanja',
      'kalendar', 'beleske', 'chet', 'dokumenta', 'ugovori', 'izvestaji',
    ],
    optionalModules: [
      'vremenski-trag', 'fakturisanje-vremena', 'klijentski-portal',
      'knjigovodstvo', 'finansije', 'email-marketing', 'website', 'blog',
      'potpisi',
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
      'dashboard', 'vozni-park', 'shipping', 'magacin', 'geolokacija',
      'terenski-servis', 'partneri', 'fakture', 'zaposleni', 'izvestaji',
    ],
    optionalModules: [
      'rute', 'utovar-istovar', 'carinski-dokument', 'kamioni', 'pakovanje',
      'dostava', 'odrzavanje', 'sredstva', 'knjigovodstvo', 'finansije',
      'menadzer-nabavke',
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
      'dashboard', 'partneri', 'projekti', 'ugovori', 'fakture', 'kalendar',
      'zakazivanja', 'dokumenta', 'potpisi', 'izvestaji',
    ],
    optionalModules: [
      'nekretnine', 'iznajmljivanje', 'pregledi-nekretnine', 'komunalije',
      'finansije', 'knjigovodstvo', 'beleske', 'email-marketing', 'recenzije',
    ],
  },
]

/** Always-visible modules regardless of industry set */
export const ALWAYS_VISIBLE_MODULES = [
  'dashboard',
  'podesavanja',
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
