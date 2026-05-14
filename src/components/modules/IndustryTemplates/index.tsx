'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import {
  Search, Building2, Utensils, Heart, GraduationCap, Wrench,
  ShoppingBag, Truck, Factory, HardHat, PartyPopper, Check,
  ArrowRight, Sparkles, LayoutGrid, Filter,
} from 'lucide-react'
import { toast } from 'sonner'

interface Template {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  category: string
  modules: string[]
  featured: boolean
}

const categoryIcons: Record<string, React.ReactNode> = {
  'Biznis servisi': <Building2 className="h-4 w-4" />,
  'Kultura i umetnost': <Sparkles className="h-4 w-4" />,
  'Obrazovanje': <GraduationCap className="h-4 w-4" />,
  'Događaji i zajednica': <PartyPopper className="h-4 w-4" />,
  'Hrana i piće': <Utensils className="h-4 w-4" />,
  'Zdravlje i wellness': <Heart className="h-4 w-4" />,
  'Ugostiteljstvo i turizam': <Wrench className="h-4 w-4" />,
  'Proizvodnja i logistika': <Factory className="h-4 w-4" />,
  'Nekretnine i građevina': <HardHat className="h-4 w-4" />,
  'Trgovina': <ShoppingBag className="h-4 w-4" />,
  'Zanati i kućni servisi': <Truck className="h-4 w-4" />,
}

const moduleLabels: Record<string, string> = {
  dashboard: 'Dashboard', finance: 'Finansije', invoices: 'Fakture', inventory: 'Inventar',
  contacts: 'Kontakti', reports: 'Izveštaji', settings: 'Podešavanja', calendar: 'Kalendar',
  documents: 'Dokumenta', offers: 'Ponude', expenses: 'Troškovi', automation: 'Automatizacija',
  employees: 'Zaposleni', recruitment: 'Regrutacija', leave: 'Odsustva', skills: 'Veštine',
  approvals: 'Odobrenja', 'workforce-planner': 'Planer', visitors: 'Posetioci',
  suggestions: 'Predlozi', 'time-tracking': 'Vremenski praćenje', 'time-billing': 'Naplaćivanje vremena',
  gamification: 'Gamifikacija', signatures: 'Potpisi', accounting: 'Knjigovodstvo',
  'bank-sync': 'Banka sinhronizacija', payments: 'Plaćanja', 'cash-register': 'Blagajna',
  pos: 'POS', subscriptions: 'Pretplate', contracts: 'Ugovori', procurement: 'Nabavka',
  'procurement-manager': 'Upravljanje nabavkom', returns: 'Povrat', coupons: 'Kuponi',
  'price-lists': 'Cenovnici', crm: 'CRM', support: 'Podrška',
  'email-marketing': 'Email marketing', 'sms-marketing': 'SMS marketing',
  'social-media': 'Društvene mreže', 'marketing-automation': 'Marketing automatizacija',
  surveys: 'Ankete', events: 'Događaji', loyalty: 'Lojalnost', ratings: 'Ocene',
  referrals: 'Preporuke', complaints: 'Žalbe', projects: 'Projekti', assets: 'Sredstva',
  maintenance: 'Održavanje', manufacturing: 'Proizvodnja', quality: 'Kvalitet',
  protocol: 'Protokol', plm: 'PLM', standards: 'Standardi', labels: 'Etikete',
  barcode: 'Barkod', tenders: 'Tenderi', warranty: 'Garancija', chat: 'Chat',
  'knowledge-base': 'Baza znanja', website: 'Website', blog: 'Blog', forum: 'Forum',
  spreadsheet: 'Tabela', notes: 'Beleške', integrations: 'Integracije', backup: 'Backup',
  laws: 'Zakoni', iot: 'IoT', voip: 'VoIP', shipping: 'Spediranje', fleet: 'Flota',
  'rent-a-car': 'Rent a car', delivery: 'Dostava', routes: 'Rute', 'loading-dock': 'Rampa utovara',
  'customs-docs': 'Carinski dokumenti', trucks: 'Kamioni', packaging: 'Pakovanje',
  measurements: 'Merenja', marketplace: 'Marketplejs', ecommerce: 'eCommerce',
  education: 'Obrazovanje', homework: 'Domaci', enrollment: 'Upis', timetable: 'Raspored',
  library: 'Biblioteka', classroom: 'Učionica', tuition: 'Školarina', restaurant: 'Restoran',
  reservations: 'Rezervacije', menu: 'Meni', kitchen: 'Kuhinja', orders: 'Narudžbine',
  'construction-site': 'Gradilište', blueprints: 'Nacrte', subcontractors: 'Podizvođači',
  safety: 'Sigurnost', property: 'Nekretnine', rentals: 'Izdavanje',
  'property-viewings': 'Pregledi', utilities: 'Komunalije', 'work-orders': 'Radni nalozi',
  valuation: 'Procena', patients: 'Pacijenti', 'medical-records': 'Med. kartoni',
  prescriptions: 'Recepti', lab: 'Laboratorija', 'health-fund': 'Zdravstveni fond',
  'service-center': 'Servis', 'field-service': 'Terenski servis', appointments: 'Zakazivanja',
  scheduler: 'Planer', compliance: 'Usaglašenost', stores: 'Prodavnice',
  'client-portal': 'Klijent portal', seo: 'SEO', reviews: 'Recenzije', cms: 'CMS',
  geolocation: 'Geolokacija', cameras: 'Kamere', messaging: 'Poruke',
}

export default function IndustryTemplates() {
  const { activeCompanyId } = useAppStore()
  const [templates, setTemplates] = useState<Template[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [applying, setApplying] = useState(false)
  const [activeTab, setActiveTab] = useState('browse')

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (activeCategory !== 'all') params.set('category', activeCategory)
      if (search) params.set('search', search)
      if (activeTab === 'featured') params.set('featured', 'true')

      const res = await fetch(`/api/industry-templates?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setTemplates(data.templates)
        if (!search && activeCategory === 'all' && activeTab !== 'featured') {
          setCategories(data.categories)
        }
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [activeCategory, search, activeTab])

  useEffect(() => { loadData() }, [loadData])

  const handleApply = async () => {
    if (!selectedTemplate || !activeCompanyId) return
    try {
      setApplying(true)
      const res = await fetch('/api/industry-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: selectedTemplate.slug, companyId: activeCompanyId }),
      })
      if (res.ok) {
        const data = await res.json()
        toast.success(data.message)
        setSelectedTemplate(null)
      }
    } catch {
      toast.error('Greška pri primeni namene')
    } finally {
      setApplying(false)
    }
  }

  const filteredTemplates = templates.filter(t =>
    !search || t.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Namene</h2>
          <p className="text-sm text-muted-foreground">
            Odaberite industriju — sistem automatski aktivira odgovarajuće module
          </p>
        </div>
        <Badge variant="secondary" className="text-xs">{templates.length} namena</Badge>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Pretraži namene..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="browse"><LayoutGrid className="h-4 w-4 mr-1" /> Sve</TabsTrigger>
          <TabsTrigger value="featured"><Sparkles className="h-4 w-4 mr-1" /> Popularne</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {!search && activeTab !== 'featured' && categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              <Button size="sm" variant={activeCategory === 'all' ? 'default' : 'outline'} onClick={() => setActiveCategory('all')}>Sve</Button>
              {categories.map(cat => (
                <Button key={cat} size="sm" variant={activeCategory === cat ? 'default' : 'outline'} onClick={() => setActiveCategory(cat)} className="gap-1">
                  {categoryIcons[cat]} {cat}
                </Button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-16">
              <Filter className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">Nema pronađenih namena</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredTemplates.map(t => (
                <Card key={t.id} className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50 group" onClick={() => setSelectedTemplate(t)}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                        <span className="text-lg">{t.icon}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-medium text-sm truncate">{t.name}</h3>
                          {t.featured && <Sparkles className="h-3 w-3 text-amber-500 shrink-0" />}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{t.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant="outline" className="text-[10px]">{t.modules.length} modula</Badge>
                          <Badge variant="outline" className="text-[10px]">{t.category}</Badge>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-xl">{selectedTemplate?.icon}</span> {selectedTemplate?.name}
            </DialogTitle>
            <DialogDescription>{selectedTemplate?.description}</DialogDescription>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Moduli koji će biti aktivirani ({selectedTemplate.modules.length}):</p>
                <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                  {selectedTemplate.modules.map(mod => (
                    <Badge key={mod} variant="secondary" className="text-xs">{moduleLabels[mod] || mod}</Badge>
                  ))}
                </div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">💡 Nakon primene biće aktivirani samo gore navedeni moduli. Vaši postojeći podaci neće biti obrisani.</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedTemplate(null)}>Otkaži</Button>
            <Button onClick={handleApply} disabled={applying || !activeCompanyId}>
              {applying ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent mr-1" /> : <Check className="h-4 w-4 mr-1" />}
              Primeni namenu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
