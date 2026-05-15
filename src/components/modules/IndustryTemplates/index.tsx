'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import {
  Compass, Search, Star, Check, Loader2, ChevronRight, Building2, Palette, GraduationCap,
  PartyPopper, UtensilsCrossed, Heart, Hotel, Factory, ShoppingBag, Wrench, Briefcase,
  X, Shield, Eye, Crown, RotateCcw, ShieldCheck, Scale, Code2, BookOpen, Frame,
  Camera, PenTool, Laptop, UserCheck, Trophy, Dumbbell, Medal, Ring, Beer, Wine,
  Burger, Mountain, Glasses, Activity, Pill, Syringe, Sparkles, Flower2, Waves,
  Home, Building, Car, Sprout, Shirt, Package, Monitor, ShoppingCart, Sofa, Puzzle,
  Bike, SprayCan, Zap, Screwdriver, Footprints, Map, ChefHat, Truck, Warehouse,
  Gift, Armchair, Cog, Scissors, Grape, Crane, HardHat, Thermometer, Sun,
  Megaphone, Landmark, Tent, Music, Drama, Lock, Trees, Disc, Cabin, Fuel, Leaf,
  UserSearch, LayoutDashboard, Circle, SquareSigma
} from 'lucide-react'
import { toast } from 'sonner'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/helpers'

// ============ TYPES ============

interface Template {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  category: string
  modules: string[]
  featured: boolean
  sortOrder: number
}

// ============ MODULE LABELS (SR) ============

const MODULE_LABELS: Record<string, string> = {
  'dashboard': 'Kontrolna ploča', 'finance': 'Finansije', 'invoices': 'Fakture',
  'inventory': 'Magacin', 'contacts': 'Partneri', 'reports': 'Izveštaji',
  'settings': 'Podešavanja', 'calendar': 'Kalendar', 'documents': 'Dokumenta',
  'offers': 'Ponude', 'expenses': 'Troškovi', 'automation': 'Automatizacija',
  'employees': 'Zaposleni', 'recruitment': 'Regrutacija', 'leave': 'Odsustva',
  'skills': 'Veštine', 'approvals': 'Odobrenja', 'workforce-planner': 'Planer radne snage',
  'visitors': 'Posetioci', 'suggestions': 'Predlozi', 'time-tracking': 'Praćenje vremena',
  'time-billing': 'Fakturisanje vremena', 'gamification': 'Gamifikacija', 'signatures': 'Potpisi',
  'accounting': 'Knjigovodstvo', 'bank-sync': 'Banka', 'payments': 'Plaćanja',
  'cash-register': 'Blagajna', 'pos': 'POS', 'subscriptions': 'Pretplate',
  'contracts': 'Ugovori', 'procurement': 'Nabavka', 'procurement-manager': 'Menadžer nabavke',
  'returns': 'Povrati', 'coupons': 'Kuponi', 'price-lists': 'Cenovnici',
  'crm': 'CRM', 'support': 'Podrška', 'email-marketing': 'Email marketing',
  'sms-marketing': 'SMS marketing', 'social-media': 'Društvene mreže',
  'marketing-automation': 'Marketing auto.', 'surveys': 'Ankete', 'events': 'Događaji',
  'loyalty': 'Lojalnost', 'ratings': 'Ocene', 'referrals': 'Preporuke',
  'complaints': 'Žalbe', 'projects': 'Projekti', 'assets': 'Osnovna sredstva',
  'maintenance': 'Održavanje', 'manufacturing': 'Proizvodnja', 'quality': 'Kvalitet',
  'protocol': 'Protokol', 'plm': 'PLM', 'standards': 'Standardi',
  'labels': 'Etikete', 'barcode': 'Barkod', 'tenders': 'Tenderi', 'warranty': 'Garancije',
  'chat': 'Chat', 'knowledge-base': 'Baza znanja', 'website': 'Web sajt',
  'blog': 'Blog', 'forum': 'Forum', 'spreadsheet': 'Tabela', 'notes': 'Beleške',
  'integrations': 'Integracije', 'backup': 'Backup', 'laws': 'Zakoni',
  'iot': 'IoT', 'voip': 'VoIP', 'shipping': 'Isporuka', 'fleet': 'Vozni park',
  'rent-a-car': 'Rent a car', 'delivery': 'Dostava', 'routes': 'Rute',
  'loading-dock': 'Rampa utovar', 'customs-docs': 'Carinski dok.', 'trucks': 'Kamioni',
  'packaging': 'Pakovanje', 'measurements': 'Merenja', 'marketplace': 'Marketplace',
  'ecommerce': 'E-commerce', 'education': 'Edukacija', 'homework': 'Domaći zadaci',
  'enrollment': 'Upis', 'timetable': 'Raspored', 'library': 'Biblioteka',
  'classroom': 'Učionica', 'tuition': 'Školovanje', 'restaurant': 'Restoran',
  'reservations': 'Rezervacije', 'menu': 'Meni', 'kitchen': 'Kuhinja', 'orders': 'Porudžbine',
  'construction-site': 'Gradilište', 'blueprints': 'Nacrti', 'subcontractors': 'Podizvođači',
  'safety': 'Bezbednost', 'property': 'Nekretnine', 'rentals': 'Iznajmljivanje',
  'property-viewings': 'Pregledi', 'utilities': 'Komunalije', 'work-orders': 'Radni nalozi',
  'valuation': 'Procena', 'patients': 'Pacijenti', 'medical-records': 'Zdrav. kartoni',
  'prescriptions': 'Recepti', 'lab': 'Laboratorija', 'health-fund': 'Zdrav. fond',
  'service-center': 'Servis', 'field-service': 'Terenski servis',
  'appointments': 'Zakazivanja', 'scheduler': 'Planer', 'compliance': 'Usklađenost',
  'stores': 'Poslovnice', 'client-portal': 'Klijentski portal', 'seo': 'SEO',
  'reviews': 'Recenzije', 'cms': 'CMS', 'geolocation': 'Geolokacija',
  'cameras': 'Kamere', 'messaging': 'Poruke',
}

// ============ ICON MAP ============

const ICON_MAP: Record<string, React.ElementType> = {
  Calculator: SquareSigma, ShieldCheck, Scale, Code2, BookOpen, Frame, Camera, PenTool,
  Laptop, PartyPopper, UserCheck, Heart, Trophy, Dumbbell, Medal, Ring,
  Beer, Wine, UtensilsCrossed, Burger, ShoppingBag, Mountain, Glasses,
  Activity, Pill, Syringe, Sparkles, Flower2, Waves, Home, Building,
  Car, Sprout, Shirt, Package, Monitor, ShoppingCart, Sofa, Wrench, Puzzle,
  Bike, SprayCan, Zap, Screwdriver, Footprints, Map, ChefHat, Truck,
  Warehouse, Gift, Armchair, Cog, Scissors, Grape, Crane, HardHat,
  Thermometer, Sun, Hotel, Building2, Briefcase, Palette, GraduationCap,
  Megaphone, Landmark, Tent, Music, Drama, Lock, Trees, Disc, Cabin,
  Fuel, Leaf, UserSearch, LayoutDashboard, Circle, Compass,
}

function getIcon(iconName: string): React.ElementType {
  return ICON_MAP[iconName] || Building2
}

// ============ CATEGORY CONFIG ============

const CATEGORY_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  'Biznis servisi':      { icon: Briefcase,    color: 'text-blue-600 dark:text-blue-400',    bg: 'bg-blue-100 dark:bg-blue-900/30' },
  'Kultura i umetnost':  { icon: Palette,      color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/30' },
  'Obrazovanje':         { icon: GraduationCap, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  'Događaji i zajednica':{ icon: PartyPopper,  color: 'text-pink-600 dark:text-pink-400',      bg: 'bg-pink-100 dark:bg-pink-900/30' },
  'Hrana i piće':        { icon: UtensilsCrossed, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  'Zdravlje i wellness': { icon: Heart,        color: 'text-rose-600 dark:text-rose-400',      bg: 'bg-rose-100 dark:bg-rose-900/30' },
  'Ugostiteljstvo i turizam': { icon: Hotel,   color: 'text-cyan-600 dark:text-cyan-400',      bg: 'bg-cyan-100 dark:bg-cyan-900/30' },
  'Proizvodnja i logistika': { icon: Factory,  color: 'text-amber-600 dark:text-amber-400',     bg: 'bg-amber-100 dark:bg-amber-900/30' },
  'Nekretnine i građevina':  { icon: Building2, color: 'text-stone-600 dark:text-stone-400',    bg: 'bg-stone-100 dark:bg-stone-900/30' },
  'Trgovina':            { icon: ShoppingBag,   color: 'text-teal-600 dark:text-teal-400',      bg: 'bg-teal-100 dark:bg-teal-900/30' },
  'Zanati i kućni servisi':  { icon: Wrench,   color: 'text-lime-600 dark:text-lime-400',      bg: 'bg-lime-100 dark:bg-lime-900/30' },
}

const DEFAULT_CAT = { icon: Briefcase, color: 'text-muted-foreground', bg: 'bg-muted' }

function getCatConfig(cat: string) { return CATEGORY_CONFIG[cat] || DEFAULT_CAT }

// ============ MAIN COMPONENT ============

export default function IndustryTemplates() {
  const { activeCompanyId, currentUser, setEnabledModules, enabledModules } = useAppStore()

  const [allTemplates, setAllTemplates] = useState<Template[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [applying, setApplying] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [currentIndustry, setCurrentIndustry] = useState<string | null>(null)

  // ============ FETCH ============

  const fetchTemplates = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      const res = await fetch(`/api/industry-templates?${params.toString()}`)
      if (!res.ok) throw new Error('Greška')
      const data = await res.json()
      setAllTemplates(data.templates || [])
      setCategories(data.categories || [])
    } catch {
      toast.error('Greška pri učitavanju predložaka')
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => { fetchTemplates() }, [fetchTemplates])

  // Detect current active industry from enabledModules
  useEffect(() => {
    if (!enabledModules || enabledModules.length === 0) {
      setCurrentIndustry(null)
      return
    }
    // Find which template matches current enabledModules
    const match = allTemplates.find(t =>
      t.modules.length > 0 &&
      t.modules.length === enabledModules.length &&
      t.modules.every(m => enabledModules.includes(m))
    )
    setCurrentIndustry(match?.name || null)
  }, [enabledModules, allTemplates])

  // ============ APPLY TEMPLATE ============

  const handleApply = async () => {
    if (!selectedTemplate || !activeCompanyId) return
    setApplying(true)
    try {
      const res = await fetch('/api/industry-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: selectedTemplate.slug, companyId: activeCompanyId }),
      })
      if (!res.ok) throw new Error('Greška')
      const data = await res.json()
      // Sync to store so sidebar updates immediately
      setEnabledModules(data.modules)
      setCurrentIndustry(selectedTemplate.name)
      toast.success(data.message)
      setDialogOpen(false)
      setSelectedTemplate(null)
    } catch {
      toast.error('Greška pri primeni predloška')
    } finally {
      setApplying(false)
    }
  }

  // ============ RESET TO ALL MODULES (admin) ============

  const handleResetModules = () => {
    setEnabledModules([])
    setCurrentIndustry(null)
    if (activeCompanyId) {
      // Also reset in DB
      fetch('/api/industry-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: '__reset__', companyId: activeCompanyId }),
      }).catch(() => {})
    }
    toast.success('Svi moduli su ponovo aktivirani')
  }

  // ============ GROUP TEMPLATES BY CATEGORY ============

  const filteredTemplates = search
    ? allTemplates.filter(t => t.name.toLowerCase().includes(search.toLowerCase()))
    : allTemplates

  const groupedByCategory = categories
    .map(cat => ({
      name: cat,
      config: getCatConfig(cat),
      templates: filteredTemplates.filter(t => t.category === cat),
    }))
    .filter(g => g.templates.length > 0)

  const featuredTemplates = allTemplates.filter(t => t.featured)
  const isAdmin = currentUser?.isSuperAdmin || false

  // ============ RENDER ============

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Compass className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Namene</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Odaberite industriju — sistem konfiguriše module za tu namenu.
            Kada odaberete, sidebar prikazuje samo module za tu industriju.
          </p>
        </div>
      </div>

      {/* Current state + Admin controls */}
      <Card className="border-dashed">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {isAdmin && (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                  <Crown className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-foreground">
                  {currentIndustry ? (
                    <>Aktivna namena: <span className="text-primary">{currentIndustry}</span></>
                  ) : (
                    'Nema aktivne namene — svi moduli su prikazani'
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isAdmin
                    ? 'Admin: vidite sve module. Primenom namene se menja prikaz klijentima.'
                    : `Aktivnih modula: ${enabledModules?.length || 'svi'}`
                  }
                </p>
              </div>
            </div>
            {(currentIndustry || enabledModules) && (
              <Button variant="outline" size="sm" onClick={handleResetModules} className="gap-1.5 shrink-0">
                <RotateCcw className="h-3.5 w-3.5" />
                Poništi namenu
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Pretraži namene..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>

      {/* Featured strip */}
      {featuredTemplates.length > 0 && !search && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
            <h2 className="text-sm font-semibold text-foreground">Najpopularnije</h2>
            <Separator className="flex-1" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
            {featuredTemplates.map(t => {
              const IconComp = getIcon(t.icon)
              const catConfig = getCatConfig(t.category)
              const isActive = currentIndustry === t.name
              return (
                <button
                  key={t.id}
                  onClick={() => { setSelectedTemplate(t); setDialogOpen(true) }}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2 rounded-xl border whitespace-nowrap text-sm transition-all shrink-0',
                    isActive
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border bg-background hover:border-primary/30 hover:shadow-sm'
                  )}
                >
                  <div className={cn('flex h-7 w-7 items-center justify-center rounded-md', catConfig.bg)}>
                    <IconComp className={cn('h-3.5 w-3.5', catConfig.color)} />
                  </div>
                  <span className="font-medium text-foreground">{t.name}</span>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{t.modules.length}</Badge>
                  {isActive && <Check className="h-3.5 w-3.5 text-primary" />}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Accordion by category */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse"><CardContent className="p-4 h-16" /></Card>
          ))}
        </div>
      ) : (
        <Accordion type="multiple" defaultValue={categories.slice(0, 3)} className="space-y-2">
          {groupedByCategory.map(group => {
            const CatIcon = group.config.icon
            const activeInCategory = group.templates.find(t => t.name === currentIndustry)

            return (
              <AccordionItem key={group.name} value={group.name} className="border rounded-xl px-1 overflow-hidden">
                <AccordionTrigger className="hover:no-underline py-3 px-1">
                  <div className="flex items-center gap-3">
                    <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', group.config.bg)}>
                      <CatIcon className={cn('h-4 w-4', group.config.color)} />
                    </div>
                    <span className="font-semibold text-sm text-foreground">{group.name}</span>
                    <Badge variant="secondary" className="text-[10px] px-1.5">{group.templates.length}</Badge>
                    {activeInCategory && (
                      <Badge variant="default" className="text-[10px] px-1.5 gap-1">
                        <Check className="h-2.5 w-2.5" /> Aktivna
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-3 px-1">
                  <div className="grid gap-2 sm:grid-cols-2">
                    {group.templates.map(template => {
                      const IconComp = getIcon(template.icon)
                      const isActive = currentIndustry === template.name

                      return (
                        <Card
                          key={template.id}
                          className={cn(
                            'group cursor-pointer transition-all duration-200 hover:shadow-md',
                            isActive
                              ? 'border-primary bg-primary/[0.03] shadow-sm'
                              : 'border-border hover:border-primary/30'
                          )}
                          onClick={() => { setSelectedTemplate(template); setDialogOpen(true) }}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors',
                                isActive ? 'bg-primary/10' : 'bg-muted/60 group-hover:bg-muted'
                              )}>
                                <IconComp className={cn(
                                  'h-4 w-4',
                                  isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                                )} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <h3 className="font-medium text-sm text-foreground truncate">{template.name}</h3>
                                  {template.featured && <Star className="h-3 w-3 text-amber-500 fill-amber-500 shrink-0" />}
                                </div>
                                <p className="text-xs text-muted-foreground truncate">{template.description}</p>
                              </div>
                              <div className="flex flex-col items-end gap-1 shrink-0">
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                  {template.modules.length}
                                </Badge>
                                {isActive && <Check className="h-3.5 w-3.5 text-primary" />}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      )}

      {/* ============ PREVIEW / APPLY DIALOG ============ */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedTemplate && (() => {
                const IconComp = getIcon(selectedTemplate.icon)
                const catConfig = getCatConfig(selectedTemplate.category)
                return (
                  <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', catConfig.bg)}>
                    <IconComp className={cn('h-5 w-5', catConfig.color)} />
                  </div>
                )
              })()}
              {selectedTemplate?.name}
            </DialogTitle>
            <DialogDescription>{selectedTemplate?.description}</DialogDescription>
          </DialogHeader>

          {selectedTemplate && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Badge variant="outline" className="gap-1">
                  {(() => {
                    const CatIcon = getCatConfig(selectedTemplate.category).icon
                    return <CatIcon className="h-3 w-3" />
                  })()}
                  {selectedTemplate.category}
                </Badge>
                <Badge variant="secondary">{selectedTemplate.modules.length} modula</Badge>
                {selectedTemplate.featured && (
                  <Badge variant="outline" className="border-amber-400 text-amber-600 gap-1">
                    <Star className="h-3 w-3 fill-amber-400" /> Popularna
                  </Badge>
                )}
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Moduli koji će biti aktivirani ({selectedTemplate.modules.length}):
                </p>
                <ScrollArea className="max-h-48">
                  <div className="flex flex-wrap gap-1.5 pr-2">
                    {selectedTemplate.modules.map(mod => (
                      <Badge key={mod} variant="outline" className="text-[11px] font-normal">
                        {MODULE_LABELS[mod] || mod}
                      </Badge>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {isAdmin && (
                <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3 text-xs text-amber-800 dark:text-amber-200">
                  <div className="flex items-center gap-2 font-medium mb-1">
                    <Shield className="h-3.5 w-3.5" /> Admin režim
                  </div>
                  Kao admin i dalje ćete videti sve module. Ova namena se primenjuje za klijente — njihov sidebar će pokazivati samo module za ovu industriju.
                </div>
              )}

              <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                Primenom ovog predloška biće aktivirani gore navedeni moduli. Ostali moduli će biti sakriveni iz sidebar-a. Možete poništiti u bilo kom trenutku.
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Otkaži</Button>
            <Button onClick={handleApply} disabled={applying || !activeCompanyId}>
              {applying ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Primena...</>
              ) : currentIndustry === selectedTemplate?.name ? (
                <><Check className="h-4 w-4 mr-2" /> Već aktivna</>
              ) : (
                <><Check className="h-4 w-4 mr-2" /> Primeni namenu</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
