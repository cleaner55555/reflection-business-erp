'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Compass, Search, Star, Check, Loader2, ChevronRight, Building2, Palette, GraduationCap, PartyPopper, UtensilsCrossed, Heart, Hotel, Factory, ShoppingBag, Wrench, Briefcase, X } from 'lucide-react'
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
  createdAt: string
  updatedAt: string
}

interface CategoryInfo {
  name: string
  icon: string
  count: number
}

// ============ MODULE LABELS (SR) ============

const MODULE_LABELS: Record<string, string> = {
  'dashboard': 'Kontrolna ploča',
  'finance': 'Finansije',
  'invoices': 'Fakture',
  'inventory': 'Magacin',
  'contacts': 'Partneri/Kontakti',
  'reports': 'Izveštaji',
  'settings': 'Podešavanja',
  'calendar': 'Kalendar',
  'documents': 'Dokumenta',
  'offers': 'Ponude',
  'expenses': 'Troškovi',
  'automation': 'Automatizacija',
  'employees': 'Zaposleni',
  'recruitment': 'Regrutacija',
  'leave': 'Odsustva',
  'skills': 'Veštine',
  'approvals': 'Odobrenja',
  'workforce-planner': 'Planer radne snage',
  'visitors': 'Posetioci',
  'suggestions': 'Predlozi',
  'time-tracking': 'Praćenje vremena',
  'time-billing': 'Fakturisanje vremena',
  'gamification': 'Gamifikacija',
  'signatures': 'Potpisi',
  'accounting': 'Knjigovodstvo',
  'bank-sync': 'Bankovna sinkronizacija',
  'payments': 'Plaćanja',
  'cash-register': 'Blagajna',
  'pos': 'POS',
  'subscriptions': 'Pretplate',
  'contracts': 'Ugovori',
  'procurement': 'Nabavka',
  'procurement-manager': 'Menadžer nabavke',
  'returns': 'Povrati',
  'coupons': 'Kuponi',
  'price-lists': 'Cenovnici',
  'crm': 'CRM',
  'support': 'Podrška',
  'email-marketing': 'Email marketing',
  'sms-marketing': 'SMS marketing',
  'social-media': 'Društvene mreže',
  'marketing-automation': 'Marketing automatizacija',
  'surveys': 'Ankete',
  'events': 'Događaji',
  'loyalty': 'Lojalnost',
  'ratings': 'Ocene',
  'referrals': 'Preporuke',
  'complaints': 'Žalbe',
  'projects': 'Projekti',
  'assets': 'Osnovna sredstva',
  'maintenance': 'Održavanje',
  'manufacturing': 'Proizvodnja',
  'quality': 'Kvalitet',
  'protocol': 'Protokol',
  'plm': 'PLM',
  'standards': 'Standardi',
  'labels': 'Etikete',
  'barcode': 'Barkod',
  'tenders': 'Tenderi',
  'warranty': 'Garancije',
  'chat': 'Chat',
  'knowledge-base': 'Baza znanja',
  'website': 'Web sajt',
  'blog': 'Blog',
  'forum': 'Forum',
  'spreadsheet': 'Tabela',
  'notes': 'Beleške',
  'integrations': 'Integracije',
  'backup': 'Backup',
  'laws': 'Zakoni',
  'iot': 'IoT',
  'voip': 'VoIP',
  'shipping': 'Isporuka',
  'fleet': 'Vozni park',
  'rent-a-car': 'Rent a car',
  'delivery': 'Dostava',
  'routes': 'Rute',
  'loading-dock': 'Rampa za utovar',
  'customs-docs': 'Carinski dokumenti',
  'trucks': 'Kamioni',
  'packaging': 'Pakovanje',
  'measurements': 'Merenja',
  'marketplace': 'Marketplace',
  'ecommerce': 'E-commerce',
  'education': 'Edukacija',
  'homework': 'Domaći zadaci',
  'enrollment': 'Upis',
  'timetable': 'Raspored',
  'library': 'Biblioteka',
  'classroom': 'Učionica',
  'tuition': 'Školovanje',
  'restaurant': 'Restoran',
  'reservations': 'Rezervacije',
  'menu': 'Meni',
  'kitchen': 'Kuhinja',
  'orders': 'Porudžbine',
  'construction-site': 'Gradilište',
  'blueprints': 'Nacrti',
  'subcontractors': 'Podizvođači',
  'safety': 'Bezbednost',
  'property': 'Nekretnine',
  'rentals': 'Iznajmljivanje',
  'property-viewings': 'Pregledi nekretnina',
  'utilities': 'Komunalije',
  'work-orders': 'Radni nalozi',
  'valuation': 'Procena',
  'patients': 'Pacijenti',
  'medical-records': 'Zdravstveni kartoni',
  'prescriptions': 'Recepti',
  'lab': 'Laboratorija',
  'health-fund': 'Zdravstveni fond',
  'service-center': 'Servisni centar',
  'field-service': 'Terenski servis',
  'appointments': 'Zakazivanja',
  'scheduler': 'Planer',
  'compliance': 'Usklađenost',
  'stores': 'Poslovnice',
  'client-portal': 'Klijentski portal',
  'seo': 'SEO',
  'reviews': 'Recenzije',
  'cms': 'CMS',
  'geolocation': 'Geolokacija',
  'cameras': 'Kamere',
  'messaging': 'Poruke',
  'production': 'Proizvodnja hrane',
  'warehouse': 'Skladište',
  'search': 'Pretraga',
  'gallery': 'Galerija',
  'tasks': 'Zadaci',
  'housekeeping': 'Sobarica',
}

// ============ ICON MAP ============

const ICON_MAP: Record<string, React.ElementType> = {
  Calculator, ShieldCheck, Scale, Code2, BookOpen, Frame, Camera, PenTool, Hammer, Laptop,
  PartyPopper, UserCheck, Heart, Trophy, Dumbbell, Medal, Ring, Beer, Wine, UtensilsCrossed,
  Burger, ShoppingBag, Mountain, Glasses, Activity, Pill, Syringe, Sparkles, Flower2,
  Waves, Compass, Home, Building, Car, Sprout, BookOpen, Shirt, Package, Monitor,
  ShoppingCart, Sofa, Wrench, Puzzle, Bike, SprayCan, Zap, Screwdriver, Footprints, Map,
  ChefHat, Truck, Warehouse, Gift, Armchair, Cog, Scissors, Grape, Crane, HardHat,
  Thermometer, Sun, Hotel, Building2, Briefcase, Palette, GraduationCap, Megaphone,
  Landmark, Tent, Music, Drama, Lock, Trees, Disc, Cabin, Fuel, Leaf, UserSearch,
  LayoutDashboard, Circle, TabsList: Compass,
}

function getIcon(iconName: string): React.ElementType {
  return ICON_MAP[iconName] || Building2
}

// ============ CATEGORY ICONS ============

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  'Biznis servisi': Briefcase,
  'Kultura i umetnost': Palette,
  'Obrazovanje': GraduationCap,
  'Događaji i zajednica': PartyPopper,
  'Hrana i piće': UtensilsCrossed,
  'Zdravlje i wellness': Heart,
  'Ugostiteljstvo i turizam': Hotel,
  'Proizvodnja i logistika': Factory,
  'Nekretnine i građevina': Building2,
  'Trgovina': ShoppingBag,
  'Zanati i kućni servisi': Wrench,
}

// ============ CATEGORY COLORS ============

const CATEGORY_COLORS: Record<string, string> = {
  'Biznis servisi': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'Kultura i umetnost': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  'Obrazovanje': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  'Događaji i zajednica': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  'Hrana i piće': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  'Zdravlje i wellness': 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  'Ugostiteljstvo i turizam': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  'Proizvodnja i logistika': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'Nekretnine i građevina': 'bg-stone-100 text-stone-700 dark:bg-stone-900/30 dark:text-stone-400',
  'Trgovina': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  'Zanati i kućni servisi': 'bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400',
}

// ============ MAIN COMPONENT ============

export default function IndustryTemplates() {
  const { activeCompanyId } = useAppStore()

  const [templates, setTemplates] = useState<Template[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [applying, setApplying] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('browse')

  // ============ FETCH ============

  const fetchTemplates = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (activeCategory !== 'all') params.set('category', activeCategory)
      if (search) params.set('search', search)
      if (activeTab === 'featured') params.set('featured', 'true')

      const res = await fetch(`/api/industry-templates?${params.toString()}`)
      if (!res.ok) throw new Error('Greška')
      const data = await res.json()
      setTemplates(data.templates || [])
      setCategories(data.categories || [])
    } catch {
      toast.error('Greška pri učitavanju predložaka')
    } finally {
      setLoading(false)
    }
  }, [activeCategory, search, activeTab])

  useEffect(() => { fetchTemplates() }, [fetchTemplates])

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
      toast.success(data.message)
      setDialogOpen(false)
      setSelectedTemplate(null)
    } catch {
      toast.error('Greška pri primeni predloška')
    } finally {
      setApplying(false)
    }
  }

  // ============ FILTERED ============

  const filteredTemplates = templates

  const featuredTemplates = templates.filter(t => t.featured)

  // ============ RENDER ============

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Compass className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Namene</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Odaberite industriju ili oblast delovanja - sistem će automatski konfigurisati aktuelne module za vaše poslovanje.
          </p>
        </div>
      </div>

      {/* Tabs: Browse / Featured */}
      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); if (v === 'featured') setActiveCategory('all') }} className="space-y-4">
        <TabsList>
          <TabsTrigger value="browse">Sve namene ({templates.length})</TabsTrigger>
          <TabsTrigger value="featured">
            <Star className="h-3.5 w-3.5 mr-1" /> Istočene ({featuredTemplates.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
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

          {/* Category pills */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory('all')}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                activeCategory === 'all'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-muted-foreground border-border hover:bg-accent'
              )}
            >
              Sve ({templates.length})
            </button>
            {categories.map(cat => {
              const CatIcon = CATEGORY_ICONS[cat] || Building2
              const count = templates.filter(t => t.category === cat).length
              if (count === 0 && activeCategory !== cat) return null
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(activeCategory === cat ? 'all' : cat)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors flex items-center gap-1.5',
                    activeCategory === cat
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-muted-foreground border-border hover:bg-accent'
                  )}
                >
                  <CatIcon className="h-3 w-3" />
                  {cat} ({count})
                </button>
              )
            })}
          </div>

          {/* Template Grid */}
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-5 w-32 bg-muted rounded mb-2" />
                    <div className="h-4 w-full bg-muted rounded mb-1" />
                    <div className="h-4 w-2/3 bg-muted rounded mb-3" />
                    <div className="flex gap-2">
                      <div className="h-6 w-16 bg-muted rounded-full" />
                      <div className="h-6 w-20 bg-muted rounded-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-16">
              <Compass className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">Nije pronađena nijedna namena</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.map(template => {
                const IconComp = getIcon(template.icon)
                const catColor = CATEGORY_COLORS[template.category] || 'bg-muted text-muted-foreground'
                const CatIcon = CATEGORY_ICONS[template.category] || Building2

                return (
                  <Card
                    key={template.id}
                    className={cn(
                      'group relative transition-all duration-200 hover:shadow-md hover:border-primary/30 cursor-pointer',
                      template.featured && 'border-amber-300 dark:border-amber-600'
                    )}
                    onClick={() => { setSelectedTemplate(template); setDialogOpen(true) }}
                  >
                    {template.featured && (
                      <div className="absolute -top-2 -right-2">
                        <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                          catColor
                        )}>
                          <IconComp className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-sm text-foreground truncate">{template.name}</h3>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{template.description}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              {template.modules.length} modula
                            </Badge>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 gap-1">
                              <CatIcon className="h-2.5 w-2.5" />
                              {template.category}
                            </Badge>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors shrink-0 mt-1" />
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ============ PREVIEW / APPLY DIALOG ============ */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedTemplate && (() => {
                const IconComp = getIcon(selectedTemplate.icon)
                const catColor = CATEGORY_COLORS[selectedTemplate.category] || 'bg-muted text-muted-foreground'
                return (
                  <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', catColor)}>
                    <IconComp className="h-5 w-5" />
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
                  {(() => { const CatIcon = CATEGORY_ICONS[selectedTemplate.category] || Building2; return <CatIcon className="h-3 w-3" /> })()}
                  {selectedTemplate.category}
                </Badge>
                <Badge variant="secondary">{selectedTemplate.modules.length} modula</Badge>
                {selectedTemplate.featured && (
                  <Badge variant="outline" className="border-amber-400 text-amber-600 gap-1">
                    <Star className="h-3 w-3 fill-amber-400" /> Istočena
                  </Badge>
                )}
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Moduli koji će biti aktivirani:
                </p>
                <ScrollArea className="max-h-56">
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTemplate.modules.map(mod => (
                      <Badge key={mod} variant="outline" className="text-[11px] font-normal">
                        {MODULE_LABELS[mod] || mod}
                      </Badge>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                Primenom ovog predloška biće aktivirani gore navedeni moduli. Trenutno aktivni moduli koji nisu na listi biće deaktivirani. Preporučujemo da napravite backup pre primene.
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Otkaži</Button>
            <Button
              onClick={handleApply}
              disabled={applying || !activeCompanyId}
            >
              {applying ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Primena...</>
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
