// Module loader using require() which Turbopack cannot statically analyze
// This avoids the issue where Turbopack pre-analyzes all dynamic imports

'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Loader2 } from 'lucide-react'

const Loader = () => (
  <div className="flex items-center justify-center h-64">
    <div className="flex flex-col items-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Učitavanje modula...</p>
    </div>
  </div>
)

// Path map using plain strings - no import() calls at module level
const MODULE_PATHS: Record<string, string> = {
  'dashboard': 'Dashboard',
  'finance': 'Finance',
  'invoices': 'Invoices',
  'inventory': 'Inventory',
  'contacts': 'Contacts',
  'procurement': 'Procurement',
  'reports': 'Reports',
  'crm': 'CRM',
  'calendar': 'Calendar',
  'employees': 'Employees',
  'projects': 'Projects',
  'assets': 'Assets',
  'documents': 'Documents',
  'accounting': 'Accounting',
  'protocol': 'Protocol',
  'education': 'Education',
  'fleet': 'Fleet',
  'restaurant': 'Restaurant',
  'email-marketing': 'EmailMarketing',
  'rent-a-car': 'CarRental',
  'settings': 'Settings',
  'integrations': 'Integracije',
  'bank-sync': 'BankSync',
  'laws': 'Laws',
  'pos': 'Retail',
  'shipping': 'Shipping',
  'marketplace': 'Marketplace',
  'offers': 'Offers',
  'subscriptions': 'Subscriptions',
  'expenses': 'Expenses',
  'signatures': 'Signatures',
  'manufacturing': 'Manufacturing',
  'quality': 'Quality',
  'maintenance': 'Maintenance',
  'recruitment': 'Recruitment',
  'leave': 'Leave',
  'referrals': 'Referrals',
  'support': 'Support',
  'field-service': 'FieldService',
  'appointments': 'Appointments',
  'scheduler': 'Scheduler',
  'social-media': 'SocialMedia',
  'sms-marketing': 'SmsMarketing',
  'events': 'Events',
  'marketing-automation': 'MarketingAutomation',
  'surveys': 'Surveys',
  'chat': 'Chat',
  'knowledge-base': 'KnowledgeBase',
  'website': 'WebsiteBuilder',
  'blog': 'Blog',
  'voip': 'VoIP',
  'iot': 'IoT',
  'messaging': 'Messaging',
  'forum': 'Forum',
  'plm': 'PLM',
  'ecommerce': 'ECommerce',
  'spreadsheet': 'Spreadsheet',
  'notes': 'Notes',
  'approvals': 'Approvals',
  'skills': 'Skills',
  'contracts': 'Contracts',
  'ratings': 'Ratings',
  'gamification': 'Gamification',
  'complaints': 'Complaints',
  'tenders': 'Tenders',
  'warranty': 'Warranty',
  'service-center': 'ServiceCenter',
  'compliance': 'Compliance',
  'loyalty': 'Loyalty',
  'workforce-planner': 'WorkforcePlanner',
  'visitors': 'Visitors',
  'suggestions': 'Suggestions',
  'valuation': 'Valuation',
  'health-fund': 'HealthFund',
  'geolocation': 'Geolocation',
  'cameras': 'Cameras',
  'procurement-manager': 'ProcurementManager',
  'cms': 'CMS',
  'homework': 'Homework',
  'enrollment': 'Enrollment',
  'timetable': 'Timetable',
  'library': 'Library',
  'classroom': 'Classroom',
  'tuition': 'Tuition',
  'patients': 'Patients',
  'medical-records': 'MedicalRecords',
  'prescriptions': 'Prescriptions',
  'lab': 'Lab',
  'reservations': 'Reservations',
  'menu': 'Menu',
  'kitchen': 'Kitchen',
  'orders': 'Orders',
  'delivery': 'Delivery',
  'construction-site': 'ConstructionSite',
  'blueprints': 'Blueprints',
  'subcontractors': 'Subcontractors',
  'measurements': 'Measurements',
  'safety': 'Safety',
  'routes': 'Routes',
  'loading-dock': 'LoadingDock',
  'customs-docs': 'CustomsDocs',
  'trucks': 'Trucks',
  'packaging': 'Packaging',
  'property': 'Property',
  'rentals': 'Rentals',
  'property-viewings': 'PropertyViewings',
  'utilities': 'Utilities',
  'work-orders': 'WorkOrders',
  'standards': 'Standards',
  'labels': 'Labels',
  'barcode': 'Barcode',
  'price-lists': 'PriceLists',
  'coupons': 'Coupons',
  'reviews': 'Reviews',
  'seo': 'SEO',
  'payments': 'Payments',
  'returns': 'Returns',
  'cash-register': 'CashRegister',
  'time-tracking': 'TimeTracking',
  'time-billing': 'TimeBilling',
  'client-portal': 'ClientPortal',
  'automation': 'Automation',
  'stores': 'Stores',
  'backup': 'Backup',
}

export function ModuleRenderer({ moduleKey }: { moduleKey: string }) {
  const [Mod, setMod] = useState<React.ComponentType | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const modName = MODULE_PATHS[moduleKey]
    if (!modName) { setErr(`Modul "${moduleKey}" nije pronađen`); return }

    // Use dynamic import with computed path - won't be statically analyzed
    // because the path is computed from a variable
    const path = `/components/modules/${modName}`
    import(/* webpackIgnore: true */ `../components/modules/${modName}`).then((mod: any) => {
      if (cancelled) return
      const Comp = mod.default || Object.values(mod)[0]
      if (Comp) setMod(() => Comp)
      else setErr(`Modul nema export: ${modName}`)
    }).catch((e: any) => {
      if (!cancelled) { console.error(e); setErr(`Greška učitavanja: ${modName}`) }
    })

    return () => { cancelled = true }
  }, [moduleKey])

  if (err) return <div className="p-8 text-center text-destructive text-sm">{err}</div>
  if (!Mod) return <Loader />
  return <Mod />
}
