'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { authFetch } from '@/lib/authFetch'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Slider } from '@/components/ui/slider'
import {
  Building2, Plus, Pencil, Trash2, Users, ArrowRightLeft, Loader2, Shield,
  Mail, Phone, MapPin, Globe, Banknote, Hash, Calendar, Layers,
  ChevronLeft, Check, AlertTriangle, UserPlus, UserMinus, Settings,
  Package, FileText, Briefcase, X, Search
} from 'lucide-react'

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface CompanyCount {
  users: number
  partners: number
  invoices: number
  products: number
}

interface Company {
  id: string
  name: string
  pib?: string | null
  maticniBr?: string | null
  address?: string | null
  city?: string | null
  zipCode?: string | null
  phone?: string | null
  email?: string | null
  website?: string | null
  bankName?: string | null
  bankAccount?: string | null
  logo?: string | null
  isActive: boolean
  plan: string
  maxUsers: number
  currency: string
  timezone: string
  locale: string
  modules: string
  maxStorageMb: number
  trialEndsAt?: string | null
  createdAt: string
  _count: CompanyCount
}

interface CompanyMember {
  id: string
  userId: string
  email: string
  firstName: string
  lastName: string
  fullName: string
  avatar?: string | null
  phone?: string | null
  isActive: boolean
  isSuperAdmin: boolean
  lastLoginAt?: string | null
  roleId: string
  roleName: string
  roleDisplayName: string
  permissions: string
  jobTitle?: string | null
  isDefault: boolean
  joinedAt: string
}

interface Role {
  id: string
  name: string
  displayName: string
  description?: string | null
  permissions: string
  isDefault: boolean
  _count?: { userCompanies: number }
  permissionsParsed?: Record<string, string[]>
}

interface CompanyModules {
  companyId: string
  companyName: string
  plan: string
  modules: string[]
  moduleCount: number
}

interface CompanyUsers {
  companyId: string
  companyName: string
  maxUsers: number
  currentUsers: number
  users: CompanyMember[]
}

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const PLAN_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
  free: { label: 'Besplatno', variant: 'secondary', className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  starter: { label: 'Starter', variant: 'default', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' },
  pro: { label: 'Pro', variant: 'default', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' },
  enterprise: { label: 'Enterprise', variant: 'default', className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300' },
}

const PLAN_MAX_USERS: Record<string, [number, number]> = {
  free: [5, 5],
  starter: [5, 25],
  pro: [5, 50],
  enterprise: [5, 100],
}

const MODULE_GROUPS: Record<string, { label: string; icon: React.ReactNode; modules: { key: string; label: string }[] }> = {
  core: {
    label: 'Позадина',
    icon: <Layers className="h-4 w-4" />,
    modules: [
      { key: 'dashboard', label: 'Контролна табла' },
      { key: 'settings', label: 'Подешавања' },
      { key: 'documents', label: 'Документа' },
      { key: 'notes', label: 'Белешке' },
      { key: 'calendar', label: 'Календар' },
      { key: 'reports', label: 'Извештаји' },
    ],
  },
  finance: {
    label: 'Финансије',
    icon: <Banknote className="h-4 w-4" />,
    modules: [
      { key: 'invoices', label: 'Фактуре' },
      { key: 'finance', label: 'Финансије' },
      { key: 'accounting', label: 'Рачуноводство' },
      { key: 'expenses', label: 'Трошкови' },
      { key: 'bank-sync', label: 'Банковно синхр.' },
      { key: 'pos', label: 'Каса (POS)' },
      { key: 'payments', label: 'Плаћања' },
      { key: 'cash-register', label: 'Благајна' },
      { key: 'currency', label: 'Валуте' },
    ],
  },
  inventory: {
    label: 'Магацин и продаја',
    icon: <Package className="h-4 w-4" />,
    modules: [
      { key: 'inventory', label: 'Магацин' },
      { key: 'products', label: 'Производи' },
      { key: 'procurement', label: 'Набавка' },
      { key: 'barcode', label: 'Баркодови' },
      { key: 'price-lists', label: 'Ценовници' },
      { key: 'shipping', label: 'Испорука' },
      { key: 'ecommerce', label: 'E-на продаја' },
      { key: 'marketplace', label: 'Маркетплейс' },
    ],
  },
  partners: {
    label: 'Партнери и CRM',
    icon: <Briefcase className="h-4 w-4" />,
    modules: [
      { key: 'contacts', label: 'Контакти' },
      { key: 'crm', label: 'CRM' },
      { key: 'offers', label: 'Понуде' },
      { key: 'contracts', label: 'Уговори' },
      { key: 'subscriptions', label: 'Претплате' },
      { key: 'loyalty', label: 'Лојалност' },
      { key: 'reviews', label: 'Рецензије' },
    ],
  },
  hr: {
    label: 'Људски ресурси',
    icon: <Users className="h-4 w-4" />,
    modules: [
      { key: 'employees', label: 'Запослени' },
      { key: 'recruitment', label: 'Рекрутација' },
      { key: 'leave', label: 'Одсуства' },
      { key: 'approvals', label: 'Одобрења' },
      { key: 'skills', label: 'Вештине' },
      { key: 'gamification', label: 'Гамификација' },
      { key: 'workforce-planner', label: 'Планер ангаж.' },
    ],
  },
  projects: {
    label: 'Пројекти и сервис',
    icon: <FileText className="h-4 w-4" />,
    modules: [
      { key: 'projects', label: 'Пројекти' },
      { key: 'tasks', label: 'Задаци' },
      { key: 'time-tracking', label: 'Време праћење' },
      { key: 'time-billing', label: 'Фактурисање' },
      { key: 'field-service', label: 'Теренски сервис' },
      { key: 'service-center', label: 'Сервисни центар' },
      { key: 'support', label: 'Подршка' },
      { key: 'appointments', label: 'Заказивања' },
    ],
  },
  communication: {
    label: 'Комуникације и маркетинг',
    icon: <Mail className="h-4 w-4" />,
    modules: [
      { key: 'email-marketing', label: 'И-мејл маркетинг' },
      { key: 'sms-marketing', label: 'SMS маркетинг' },
      { key: 'social-media', label: 'Друштв. мреже' },
      { key: 'marketing-automation', label: 'Мрк. аутомација' },
      { key: 'surveys', label: 'Анкете' },
      { key: 'chat', label: 'Чат' },
      { key: 'notifications', label: 'Обавештења' },
      { key: 'blog', label: 'Блог' },
      { key: 'website', label: 'Вебсајт' },
    ],
  },
}

const ALL_MODULE_KEYS = Object.values(MODULE_GROUPS).flatMap(g => g.modules.map(m => m.key))

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleDateString('sr-Latn', { day: '2-digit', month: '2-digit', year: 'numeric' })
  } catch {
    return dateStr
  }
}

function getInitialsColor(name: string): string {
  const colors = [
    'bg-rose-500/15 text-rose-700 dark:text-rose-300',
    'bg-orange-500/15 text-orange-700 dark:text-orange-300',
    'bg-amber-500/15 text-amber-700 dark:text-amber-300',
    'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
    'bg-teal-500/15 text-teal-700 dark:text-teal-300',
    'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300',
    'bg-blue-500/15 text-blue-700 dark:text-blue-300',
    'bg-purple-500/15 text-purple-700 dark:text-purple-300',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

// ─── LOADING SKELETON ────────────────────────────────────────────────────────

function OrganizationCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1 min-w-0">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-12 rounded-lg" />
          ))}
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </CardContent>
    </Card>
  )
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export function OrganizationManager() {
  const { activeCompanyId, activeCompanyName, setActiveCompany, currentUser, userCompanies } = useAppStore()

  // State
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [membersOpen, setMembersOpen] = useState(false)
  const [modulesOpen, setModulesOpen] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)

  // ─── API FUNCTIONS ─────────────────────────────────────────────────────────

  const loadCompanies = useCallback(async () => {
    setLoading(true)
    try {
      const res = await authFetch('/api/companies')
      if (res.ok) {
        const data = await res.json()
        setCompanies(Array.isArray(data) ? data : [data])
      } else {
        toast.error('Greška pri učitavanju organizacija')
      }
    } catch {
      toast.error('Greška pri učitavanju organizacija')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadCompanies() }, [loadCompanies])

  const filteredCompanies = companies.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.city && c.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (c.pib && c.pib.includes(searchQuery))
  )

  // ─── ACTION HANDLERS ───────────────────────────────────────────────────────

  const handleSwitchCompany = (company: Company) => {
    setActiveCompany(company.id, company.name)
    toast.success(`Prebačeni ste na "${company.name}"`)
  }

  const handleEditCompany = (company: Company) => {
    setSelectedCompany(company)
    setEditOpen(true)
  }

  const handleDeleteCompany = (company: Company) => {
    setSelectedCompany(company)
    setDeleteOpen(true)
  }

  const handleManageMembers = (company: Company) => {
    setSelectedCompany(company)
    setMembersOpen(true)
  }

  const handleManageModules = (company: Company) => {
    setSelectedCompany(company)
    setModulesOpen(true)
  }

  const handleCompanyCreated = () => {
    loadCompanies()
    setCreateOpen(false)
  }

  const handleCompanyUpdated = () => {
    loadCompanies()
    setEditOpen(false)
    setSelectedCompany(null)
  }

  const handleCompanyDeleted = async () => {
    if (!selectedCompany) return
    try {
      const res = await authFetch(`/api/companies/${selectedCompany.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success(`"${selectedCompany.name}" je deaktivirana`)
        if (activeCompanyId === selectedCompany.id) {
          const remaining = companies.filter(c => c.id !== selectedCompany.id && c.isActive)
          if (remaining.length > 0) {
            setActiveCompany(remaining[0].id, remaining[0].name)
          }
        }
        loadCompanies()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Greška pri brisanju')
      }
    } catch {
      toast.error('Greška pri brisanju kompanije')
    } finally {
      setDeleteOpen(false)
      setSelectedCompany(null)
    }
  }

  // ─── RENDER ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            Управљање организацијама
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Управљајте kompanijama, članovima i modulima
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          Нова организација
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Претрага по имену, граду, ПИБ..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Organization Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <OrganizationCardSkeleton key={i} />)}
        </div>
      ) : filteredCompanies.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-12 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">Нема организација</h3>
          <p className="text-muted-foreground text-sm mt-1 max-w-sm">
            {searchQuery
              ? 'Нема rezultata za vašu pretragu.'
              : 'Креирајте prvu organizaciju da započnete sa radom.'}
          </p>
          {!searchQuery && (
            <Button className="mt-4" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Kreiraj organizaciju
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredCompanies.map(company => (
            <OrgCard
              key={company.id}
              company={company}
              isActive={company.id === activeCompanyId}
              onSwitch={() => handleSwitchCompany(company)}
              onEdit={() => handleEditCompany(company)}
              onDelete={() => handleDeleteCompany(company)}
              onManageMembers={() => handleManageMembers(company)}
              onManageModules={() => handleManageModules(company)}
            />
          ))}
        </div>
      )}

      {/* Create Dialog */}
      {createOpen && (
        <CreateOrgDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          onCreated={handleCompanyCreated}
        />
      )}

      {/* Edit Dialog */}
      {editOpen && selectedCompany && (
        <EditOrgDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          company={selectedCompany}
          onUpdated={handleCompanyUpdated}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Deaktivacija organizacije
            </AlertDialogTitle>
            <AlertDialogDescription>
              Да ли сте сигурни да желите да deaktivirate{' '}
              <strong>{selectedCompany?.name}</strong>?
              <br />
              Ova akcija je reverzibilna, ali organizacija neće biti dostupna dok se ponovo ne aktivira.
              <br />
              <span className="text-muted-foreground mt-2 block">
                {selectedCompany?._count?.users || 0} korisnika · {selectedCompany?._count?.invoices || 0} faktura
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Otkaži</AlertDialogCancel>
            <AlertDialogAction onClick={handleCompanyDeleted} className="bg-destructive text-white hover:bg-destructive/90">
              <Trash2 className="h-4 w-4 mr-2" />
              Deaktiviraj
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Members Sheet */}
      {membersOpen && selectedCompany && (
        <MembersSheet
          open={membersOpen}
          onOpenChange={setMembersOpen}
          company={selectedCompany}
          isActiveCompany={selectedCompany.id === activeCompanyId}
        />
      )}

      {/* Modules Sheet */}
      {modulesOpen && selectedCompany && (
        <ModulesSheet
          open={modulesOpen}
          onOpenChange={setModulesOpen}
          company={selectedCompany}
        />
      )}
    </div>
  )
}

// ─── ORG CARD ────────────────────────────────────────────────────────────────

function OrgCard({
  company,
  isActive,
  onSwitch,
  onEdit,
  onDelete,
  onManageMembers,
  onManageModules,
}: {
  company: Company
  isActive: boolean
  onSwitch: () => void
  onEdit: () => void
  onDelete: () => void
  onManageMembers: () => void
  onManageModules: () => void
}) {
  const planConf = PLAN_CONFIG[company.plan] || PLAN_CONFIG.free

  return (
    <Card className={`relative overflow-hidden transition-all duration-200 ${isActive ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'}`}>
      {/* Active indicator */}
      {isActive && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary" />
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-sm shrink-0">
                {getInitials(company.name)}
              </div>
              <div className="min-w-0">
                <CardTitle className="text-base truncate flex items-center gap-2">
                  {company.name}
                  {isActive && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded-full shrink-0">
                      <Check className="h-2.5 w-2.5" />
                      Aktivna
                    </span>
                  )}
                </CardTitle>
                <CardDescription className="text-xs truncate flex items-center gap-1">
                  {company.city && <MapPin className="h-3 w-3 shrink-0" />}
                  {company.city || (company.pib ? `PIB: ${company.pib}` : '—')}
                </CardDescription>
              </div>
            </div>
          </div>
          <Badge variant={planConf.variant} className={`text-[10px] px-2 py-0 shrink-0 ${planConf.className}`}>
            {planConf.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Korisnika</p>
              <p className="text-sm font-semibold">{company._count?.users || 0}/{company.maxUsers}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Faktura</p>
              <p className="text-sm font-semibold">{company._count?.invoices || 0}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            <Package className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Proizvoda</p>
              <p className="text-sm font-semibold">{company._count?.products || 0}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            <Briefcase className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Partnera</p>
              <p className="text-sm font-semibold">{company._count?.partners || 0}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <Separator />
        <div className="flex flex-wrap gap-1.5">
          {!isActive && (
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={onSwitch}>
              <ArrowRightLeft className="h-3.5 w-3.5 mr-1.5" />
              Prebaci
            </Button>
          )}
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={onManageMembers}>
            <Users className="h-3.5 w-3.5 mr-1.5" />
            Članovi
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={onManageModules}>
            <Layers className="h-3.5 w-3.5 mr-1.5" />
            Moduli
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={onEdit}>
            <Pencil className="h-3.5 w-3.5 mr-1.5" />
            Uredi
          </Button>
          {company._count?.users === 0 && (
            <Button variant="outline" size="sm" className="h-8 text-xs text-destructive hover:text-destructive" onClick={onDelete}>
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Ukloni
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── CREATE ORG DIALOG ───────────────────────────────────────────────────────

function CreateOrgDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
}) {
  const [form, setForm] = useState({
    name: '',
    pib: '',
    city: '',
    address: '',
    email: '',
    phone: '',
    plan: 'free',
    maxUsers: 5,
  })
  const [creating, setCreating] = useState(false)

  const updateField = (field: string, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handlePlanChange = (plan: string) => {
    const [min] = PLAN_MAX_USERS[plan] || [5, 5]
    setForm(prev => ({ ...prev, plan, maxUsers: min }))
  }

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error('Naziv organizacije je obavezan')
      return
    }
    setCreating(true)
    try {
      const res = await authFetch('/api/companies', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name,
          pib: form.pib || undefined,
          city: form.city || undefined,
          address: form.address || undefined,
          email: form.email || undefined,
          phone: form.phone || undefined,
          plan: form.plan,
          maxUsers: form.maxUsers,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Greška pri kreiranju')
        return
      }
      toast.success(`Organizacija "${form.name}" je kreirana`)
      setForm({ name: '', pib: '', city: '', address: '', email: '', phone: '', plan: 'free', maxUsers: 5 })
      onCreated()
    } catch {
      toast.error('Greška pri kreiranju organizacije')
    } finally {
      setCreating(false)
    }
  }

  const [minUsers, maxUsers] = PLAN_MAX_USERS[form.plan] || [5, 100]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Nova organizacija
          </DialogTitle>
          <DialogDescription>
            Popunite podatke za novu organizaciju
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="create-name">Naziv organizacije *</Label>
            <Input
              id="create-name"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="Moja Firma doo"
            />
          </div>

          {/* PIB & City */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="create-pib">PIB</Label>
              <Input
                id="create-pib"
                value={form.pib}
                onChange={(e) => updateField('pib', e.target.value)}
                placeholder="123456789"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-city">Grad</Label>
              <Input
                id="create-city"
                value={form.city}
                onChange={(e) => updateField('city', e.target.value)}
                placeholder="Beograd"
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="create-address">Adresa</Label>
            <Input
              id="create-address"
              value={form.address}
              onChange={(e) => updateField('address', e.target.value)}
              placeholder="Bulevar Mihajla Pupina 10"
            />
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="create-email">Email</Label>
              <Input
                id="create-email"
                type="email"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="info@firma.rs"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-phone">Telefon</Label>
              <Input
                id="create-phone"
                type="tel"
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="+381 11 123 4567"
              />
            </div>
          </div>

          <Separator />

          {/* Plan */}
          <div className="space-y-2">
            <Label>Paket</Label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(PLAN_CONFIG).map(([key, conf]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handlePlanChange(key)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    form.plan === key
                      ? 'border-primary bg-primary/5'
                      : 'border-muted hover:border-muted-foreground/30'
                  }`}
                >
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${conf.className}`}>
                    {conf.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Max Users Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Maks. korisnika</Label>
              <span className="text-sm font-semibold text-primary">{form.maxUsers}</span>
            </div>
            <Slider
              value={[form.maxUsers]}
              min={minUsers}
              max={maxUsers}
              step={1}
              onValueChange={([val]) => updateField('maxUsers', val)}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{minUsers}</span>
              <span>{maxUsers}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Otkaži</Button>
          <Button onClick={handleSubmit} disabled={creating || !form.name.trim()}>
            {creating ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Kreiranje...</>
            ) : (
              <><Plus className="h-4 w-4 mr-2" /> Kreiraj organizaciju</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── EDIT ORG DIALOG ─────────────────────────────────────────────────────────

function EditOrgDialog({
  open,
  onOpenChange,
  company,
  onUpdated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  company: Company
  onUpdated: () => void
}) {
  const [form, setForm] = useState({
    name: company.name || '',
    pib: company.pib || '',
    maticniBr: company.maticniBr || '',
    address: company.address || '',
    city: company.city || '',
    zipCode: company.zipCode || '',
    phone: company.phone || '',
    email: company.email || '',
    website: company.website || '',
    bankName: company.bankName || '',
    bankAccount: company.bankAccount || '',
    plan: company.plan || 'free',
    maxUsers: company.maxUsers || 5,
    currency: company.currency || 'RSD',
    timezone: company.timezone || 'Europe/Belgrade',
    locale: company.locale || 'sr',
    maxStorageMb: company.maxStorageMb || 100,
  })
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')

  const updateField = (field: string, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handlePlanChange = (plan: string) => {
    const [min] = PLAN_MAX_USERS[plan] || [5, 5]
    setForm(prev => ({ ...prev, plan, maxUsers: Math.max(prev.maxUsers, min) }))
  }

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error('Naziv organizacije je obavezan')
      return
    }
    setSaving(true)
    try {
      const res = await authFetch(`/api/companies/${company.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: form.name,
          pib: form.pib || null,
          maticniBr: form.maticniBr || null,
          address: form.address || null,
          city: form.city || null,
          zipCode: form.zipCode || null,
          phone: form.phone || null,
          email: form.email || null,
          website: form.website || null,
          bankName: form.bankName || null,
          bankAccount: form.bankAccount || null,
          plan: form.plan,
          maxUsers: form.maxUsers,
          currency: form.currency,
          timezone: form.timezone,
          locale: form.locale,
          maxStorageMb: form.maxStorageMb,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Greška pri čuvanju')
        return
      }
      toast.success(`"${form.name}" je ažurirana`)
      onUpdated()
    } catch {
      toast.error('Greška pri ažuriranju organizacije')
    } finally {
      setSaving(false)
    }
  }

  const [minUsers, maxUsers] = PLAN_MAX_USERS[form.plan] || [5, 100]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5 text-primary" />
            Uredi organizaciju
          </DialogTitle>
          <DialogDescription>
            Ažurirajte podatke za {company.name}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
          <TabsList className="w-full">
            <TabsTrigger value="basic" className="flex-1">Osnovni podaci</TabsTrigger>
            <TabsTrigger value="billing" className="flex-1">Paket & Limiti</TabsTrigger>
            <TabsTrigger value="regional" className="flex-1">Lokalizacija</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[400px] pr-1">
            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-4 pt-4 px-1">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Naziv organizacije *</Label>
                <Input id="edit-name" value={form.name} onChange={(e) => updateField('name', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="edit-pib">PIB</Label>
                  <Input id="edit-pib" value={form.pib} onChange={(e) => updateField('pib', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-maticniBr">Matični broj</Label>
                  <Input id="edit-maticniBr" value={form.maticniBr} onChange={(e) => updateField('maticniBr', e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-address">Adresa</Label>
                <Input id="edit-address" value={form.address} onChange={(e) => updateField('address', e.target.value)} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="edit-city">Grad</Label>
                  <Input id="edit-city" value={form.city} onChange={(e) => updateField('city', e.target.value)} />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="edit-zipCode">Poštanski broj</Label>
                  <Input id="edit-zipCode" value={form.zipCode} onChange={(e) => updateField('zipCode', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input id="edit-email" type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Telefon</Label>
                  <Input id="edit-phone" type="tel" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-website">Web sajt</Label>
                <Input id="edit-website" value={form.website} onChange={(e) => updateField('website', e.target.value)} placeholder="https://www.firma.rs" />
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="edit-bankName">Banka</Label>
                  <Input id="edit-bankName" value={form.bankName} onChange={(e) => updateField('bankName', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-bankAccount">Žiro račun</Label>
                  <Input id="edit-bankAccount" value={form.bankAccount} onChange={(e) => updateField('bankAccount', e.target.value)} />
                </div>
              </div>
            </TabsContent>

            {/* Billing Tab */}
            <TabsContent value="billing" className="space-y-4 pt-4 px-1">
              <div className="space-y-2">
                <Label>Paket</Label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(PLAN_CONFIG).map(([key, conf]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handlePlanChange(key)}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        form.plan === key
                          ? 'border-primary bg-primary/5'
                          : 'border-muted hover:border-muted-foreground/30'
                      }`}
                    >
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${conf.className}`}>
                        {conf.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Maks. korisnika</Label>
                  <span className="text-sm font-semibold text-primary">{form.maxUsers}</span>
                </div>
                <Slider
                  value={[form.maxUsers]}
                  min={minUsers}
                  max={maxUsers}
                  step={1}
                  onValueChange={([val]) => updateField('maxUsers', val)}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{minUsers}</span>
                  <span>{maxUsers}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Maks. skladište (MB)</Label>
                  <span className="text-sm font-semibold text-primary">{form.maxStorageMb}</span>
                </div>
                <Slider
                  value={[form.maxStorageMb]}
                  min={100}
                  max={10000}
                  step={100}
                  onValueChange={([val]) => updateField('maxStorageMb', val)}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>100 MB</span>
                  <span>10 GB</span>
                </div>
              </div>
            </TabsContent>

            {/* Regional Tab */}
            <TabsContent value="regional" className="space-y-4 pt-4 px-1">
              <div className="space-y-2">
                <Label htmlFor="edit-currency">Valuta</Label>
                <Select value={form.currency} onValueChange={(v) => updateField('currency', v)}>
                  <SelectTrigger id="edit-currency"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RSD">RSD (RSD)</SelectItem>
                    <SelectItem value="EUR">EUR (Evro)</SelectItem>
                    <SelectItem value="USD">USD (Dolar)</SelectItem>
                    <SelectItem value="GBP">GBP (Funta)</SelectItem>
                    <SelectItem value="CHF">CHF (Franc)</SelectItem>
                    <SelectItem value="BAM">BAM (KM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-timezone">Vremenska zona</Label>
                <Select value={form.timezone} onValueChange={(v) => updateField('timezone', v)}>
                  <SelectTrigger id="edit-timezone"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Europe/Belgrade">Beograd (CET/CEST)</SelectItem>
                    <SelectItem value="Europe/Podgorica">Podgorica (CET/CEST)</SelectItem>
                    <SelectItem value="Europe/Sarajevo">Sarajevo (CET/CEST)</SelectItem>
                    <SelectItem value="Europe/Skopje">Skoplje (CET/CEST)</SelectItem>
                    <SelectItem value="Europe/Zagreb">Zagreb (CET/CEST)</SelectItem>
                    <SelectItem value="Europe/Ljubljana">Ljubljana (CET/CEST)</SelectItem>
                    <SelectItem value="Europe/Berlin">Berlin (CET/CEST)</SelectItem>
                    <SelectItem value="Europe/London">London (GMT/BST)</SelectItem>
                    <SelectItem value="US/Eastern">New York (EST/EDT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-locale">Jezik interfejsa</Label>
                <Select value={form.locale} onValueChange={(v) => updateField('locale', v)}>
                  <SelectTrigger id="edit-locale"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sr">Српски (ћирилица)</SelectItem>
                    <SelectItem value="sr-latn">Srpski (latinica)</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter className="gap-2 shrink-0 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Otkaži</Button>
          <Button onClick={handleSubmit} disabled={saving || !form.name.trim()}>
            {saving ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Čuvanje...</>
            ) : (
              <><Check className="h-4 w-4 mr-2" /> Sačuvaj izmene</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── MEMBERS SHEET ───────────────────────────────────────────────────────────

function MembersSheet({
  open,
  onOpenChange,
  company,
  isActiveCompany,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  company: Company
  isActiveCompany: boolean
}) {
  const [membersData, setMembersData] = useState<CompanyUsers | null>(null)
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)

  // Invite form
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteForm, setInviteForm] = useState({ email: '', firstName: '', lastName: '', roleId: '', jobTitle: '' })
  const [inviting, setInviting] = useState(false)

  // Edit role dialog
  const [editRoleOpen, setEditRoleOpen] = useState(false)
  const [editRoleMember, setEditRoleMember] = useState<CompanyMember | null>(null)
  const [editRoleForm, setEditRoleForm] = useState({ roleId: '', jobTitle: '' })
  const [savingRole, setSavingRole] = useState(false)

  // Delete member
  const [removeOpen, setRemoveOpen] = useState(false)
  const [removeMember, setRemoveMember] = useState<CompanyMember | null>(null)
  const [removing, setRemoving] = useState(false)

  const loadMembers = useCallback(async () => {
    setLoading(true)
    try {
      const [membersRes, rolesRes] = await Promise.all([
        authFetch(`/api/companies/${company.id}/users`),
        authFetch('/api/roles'),
      ])
      if (membersRes.ok) setMembersData(await membersRes.json())
      if (rolesRes.ok) setRoles(await rolesRes.json())
    } catch {
      toast.error('Greška pri učitavanju članova')
    } finally {
      setLoading(false)
    }
  }, [company.id])

  useEffect(() => { if (open) loadMembers() }, [open, loadMembers])

  const handleInvite = async () => {
    if (!inviteForm.email.trim() || !inviteForm.firstName.trim() || !inviteForm.lastName.trim()) {
      toast.error('Email, ime i prezime su obavezni')
      return
    }
    if (!inviteForm.roleId) {
      toast.error('Izaberite ulogu')
      return
    }
    setInviting(true)
    try {
      const res = await authFetch(`/api/companies/${company.id}/users`, {
        method: 'POST',
        body: JSON.stringify(inviteForm),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Greška pri pozivu')
        return
      }
      toast.success(`${inviteForm.firstName} ${inviteForm.lastName} je dodat/a`)
      setInviteForm({ email: '', firstName: '', lastName: '', roleId: '', jobTitle: '' })
      setInviteOpen(false)
      loadMembers()
    } catch {
      toast.error('Greška pri pozivu korisnika')
    } finally {
      setInviting(false)
    }
  }

  const handleEditRole = (member: CompanyMember) => {
    setEditRoleMember(member)
    setEditRoleForm({ roleId: member.roleId, jobTitle: member.jobTitle || '' })
    setEditRoleOpen(true)
  }

  const handleSaveRole = async () => {
    if (!editRoleMember || !editRoleForm.roleId) return
    setSavingRole(true)
    try {
      const res = await authFetch(`/api/companies/${company.id}/users/${editRoleMember.userId}`, {
        method: 'PUT',
        body: JSON.stringify({
          roleId: editRoleForm.roleId,
          jobTitle: editRoleForm.jobTitle || null,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Greška pri ažuriranju uloge')
        return
      }
      toast.success(`Uloga za ${editRoleMember.firstName} je ažurirana`)
      setEditRoleOpen(false)
      loadMembers()
    } catch {
      toast.error('Greška pri ažuriranju uloge')
    } finally {
      setSavingRole(false)
    }
  }

  const handleRemoveMember = (member: CompanyMember) => {
    setRemoveMember(member)
    setRemoveOpen(true)
  }

  const confirmRemoveMember = async () => {
    if (!removeMember) return
    setRemoving(true)
    try {
      const res = await authFetch(`/api/companies/${company.id}/users/${removeMember.userId}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Greška pri uklanjanju')
        return
      }
      toast.success(`${removeMember.firstName} ${removeMember.lastName} je uklonjen/a`)
      loadMembers()
    } catch {
      toast.error('Greška pri uklanjanju korisnika')
    } finally {
      setRemoving(false)
      setRemoveOpen(false)
      setRemoveMember(null)
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-lg flex flex-col">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Članovi — {company.name}
            </SheetTitle>
            <SheetDescription>
              Upravljajte članovima ove organizacije
              {membersData && (
                <span className="block mt-1 text-xs">
                  {membersData.currentUsers} od {membersData.maxUsers} korisnika
                </span>
              )}
            </SheetDescription>
          </SheetHeader>

          {/* Invite button */}
          <div className="flex items-center gap-2 mt-2">
            <Button
              size="sm"
              className="h-8"
              onClick={() => setInviteOpen(true)}
              disabled={!!(membersData && membersData.currentUsers >= membersData.maxUsers)}
            >
              <UserPlus className="h-3.5 w-3.5 mr-1.5" />
              Dodaj člana
            </Button>
            {membersData && membersData.currentUsers >= membersData.maxUsers && (
              <span className="text-xs text-destructive">Dostignut limit korisnika</span>
            )}
          </div>

          {/* Members list */}
          <div className="flex-1 overflow-hidden mt-2">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-3 p-2">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-8 w-16" />
                  </div>
                ))}
              </div>
            ) : membersData?.users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-10 w-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">Nema članova</p>
                <p className="text-xs text-muted-foreground mt-1">Dodajte prvog člana u ovu organizaciju</p>
              </div>
            ) : (
              <ScrollArea className="h-[calc(100vh-280px)]">
                <div className="space-y-1 pr-2">
                  {membersData?.users.map(member => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors group"
                    >
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarFallback className={`text-xs font-medium ${getInitialsColor(member.fullName)}`}>
                          {getInitials(member.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-medium truncate">{member.fullName}</p>
                          {member.isSuperAdmin && (
                            <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">SuperAdmin</Badge>
                          )}
                          {member.isDefault && isActiveCompany && (
                            <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 text-primary">Vi</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                        {member.jobTitle && (
                          <p className="text-[11px] text-muted-foreground/70 truncate">{member.jobTitle}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                          {member.roleDisplayName}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {formatDate(member.joinedAt)}
                        </span>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleEditRole(member)}
                          title="Promeni ulogu"
                        >
                          <Shield className="h-3.5 w-3.5" />
                        </Button>
                        {!member.isDefault && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => handleRemoveMember(member)}
                            title="Ukloni člana"
                          >
                            <UserMinus className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Invite Dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Dodaj člana
            </DialogTitle>
            <DialogDescription>
              Pozovite novog korisnika u {company.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="invite-fname">Ime *</Label>
                <Input id="invite-fname" value={inviteForm.firstName} onChange={(e) => setInviteForm(p => ({ ...p, firstName: e.target.value }))} placeholder="Marko" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="invite-lname">Prezime *</Label>
                <Input id="invite-lname" value={inviteForm.lastName} onChange={(e) => setInviteForm(p => ({ ...p, lastName: e.target.value }))} placeholder="Petrović" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="invite-email">Email *</Label>
              <Input id="invite-email" type="email" value={inviteForm.email} onChange={(e) => setInviteForm(p => ({ ...p, email: e.target.value }))} placeholder="marko@firma.rs" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="invite-role">Uloga *</Label>
              <Select value={inviteForm.roleId} onValueChange={(v) => setInviteForm(p => ({ ...p, roleId: v }))}>
                <SelectTrigger id="invite-role"><SelectValue placeholder="Izaberite ulogu" /></SelectTrigger>
                <SelectContent>
                  {roles.map(role => (
                    <SelectItem key={role.id} value={role.id}>{role.displayName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="invite-title">Pozicija (opcionalno)</Label>
              <Input id="invite-title" value={inviteForm.jobTitle} onChange={(e) => setInviteForm(p => ({ ...p, jobTitle: e.target.value }))} placeholder="Računovođa" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setInviteOpen(false)}>Otkaži</Button>
            <Button onClick={handleInvite} disabled={inviting || !inviteForm.email.trim() || !inviteForm.firstName.trim() || !inviteForm.lastName.trim() || !inviteForm.roleId}>
              {inviting ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Dodavanje...</>
              ) : (
                <><UserPlus className="h-4 w-4 mr-2" /> Dodaj člana</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={editRoleOpen} onOpenChange={setEditRoleOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Promeni ulogu
            </DialogTitle>
            <DialogDescription>
              {editRoleMember && `Za korisnika ${editRoleMember.fullName}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-role-select">Uloga</Label>
              <Select value={editRoleForm.roleId} onValueChange={(v) => setEditRoleForm(p => ({ ...p, roleId: v }))}>
                <SelectTrigger id="edit-role-select"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {roles.map(role => (
                    <SelectItem key={role.id} value={role.id}>{role.displayName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-jobtitle">Pozicija</Label>
              <Input id="edit-jobtitle" value={editRoleForm.jobTitle} onChange={(e) => setEditRoleForm(p => ({ ...p, jobTitle: e.target.value }))} placeholder="Računovođa" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditRoleOpen(false)}>Otkaži</Button>
            <Button onClick={handleSaveRole} disabled={savingRole || !editRoleForm.roleId}>
              {savingRole ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Čuvanje...</>
              ) : (
                <><Check className="h-4 w-4 mr-2" /> Sačuvaj</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Confirmation */}
      <AlertDialog open={removeOpen} onOpenChange={setRemoveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Uklanjanje člana
            </AlertDialogTitle>
            <AlertDialogDescription>
              Da li ste sigurni da želite da uklonite{' '}
              <strong>{removeMember?.fullName}</strong> iz organizacije &quot;{company.name}&quot;?
              <br />
              Korisnik će izgubiti pristup svim podacima ove organizacije.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Otkaži</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemoveMember} className="bg-destructive text-white hover:bg-destructive/90" disabled={removing}>
              {removing ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uklanjanje...</>
              ) : (
                <><UserMinus className="h-4 w-4 mr-2" /> Ukloni člana</>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

// ─── MODULES SHEET ───────────────────────────────────────────────────────────

function ModulesSheet({
  open,
  onOpenChange,
  company,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  company: Company
}) {
  const [modulesData, setModulesData] = useState<CompanyModules | null>(null)
  const [enabledModules, setEnabledModules] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const loadModules = useCallback(async () => {
    setLoading(true)
    try {
      const res = await authFetch(`/api/companies/${company.id}/modules`)
      if (res.ok) {
        const data: CompanyModules = await res.json()
        setModulesData(data)
        setEnabledModules(data.modules || [])
      }
    } catch {
      toast.error('Greška pri učitavanju modula')
    } finally {
      setLoading(false)
    }
  }, [company.id])

  useEffect(() => { if (open) loadModules() }, [open, loadModules])

  const toggleModule = (moduleKey: string) => {
    // dashboard and settings are always enabled
    if (moduleKey === 'dashboard' || moduleKey === 'settings') return
    setEnabledModules(prev => {
      const next = prev.includes(moduleKey)
        ? prev.filter(m => m !== moduleKey)
        : [...prev, moduleKey]
      setHasChanges(true)
      return next
    })
  }

  const enableAll = () => {
    setEnabledModules(ALL_MODULE_KEYS)
    setHasChanges(true)
  }

  const disableAll = () => {
    setEnabledModules(['dashboard', 'settings'])
    setHasChanges(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await authFetch(`/api/companies/${company.id}/modules`, {
        method: 'PUT',
        body: JSON.stringify({ modules: enabledModules }),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Greška pri čuvanju modula')
        return
      }
      toast.success(`Moduli za "${company.name}" su ažurirani (${enabledModules.length} aktivnih)`)
      setHasChanges(false)
      loadModules()
    } catch {
      toast.error('Greška pri čuvanju modula')
    } finally {
      setSaving(false)
    }
  }

  const totalEnabled = enabledModules.length
  const totalAvailable = ALL_MODULE_KEYS.length

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v && hasChanges) { onOpenChange(v) } else { onOpenChange(v) } }}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Moduli — {company.name}
          </SheetTitle>
          <SheetDescription>
            Upravljajte aktivnim modulima za ovu organizaciju
            <span className="block mt-1 text-xs">
              {totalEnabled} od {totalAvailable} modula aktivno · {PLAN_CONFIG[company.plan]?.label || 'Free'}
            </span>
          </SheetDescription>
        </SheetHeader>

        {/* Quick actions */}
        <div className="flex items-center gap-2 mt-2">
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={enableAll}>
            Aktiveri sve
          </Button>
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={disableAll}>
            Deaktiveri sve
          </Button>
          <div className="flex-1" />
          {hasChanges && (
            <Button size="sm" className="h-7 text-xs" onClick={handleSave} disabled={saving}>
              {saving ? (
                <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Čuvanje...</>
              ) : (
                <><Check className="h-3 w-3 mr-1" /> Sačuvaj ({totalEnabled})</>
              )}
            </Button>
          )}
        </div>

        {/* Modules list */}
        <div className="flex-1 overflow-hidden mt-2">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-5 w-24" />
                  {[1, 2, 3].map(j => (
                    <div key={j} className="flex items-center justify-between p-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-5 w-9" />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-260px)]">
              <div className="space-y-5 pr-2">
                {Object.entries(MODULE_GROUPS).map(([groupKey, group]) => (
                  <div key={groupKey}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-muted-foreground">{group.icon}</span>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {group.label}
                      </h4>
                    </div>
                    <div className="space-y-0.5">
                      {group.modules.map(mod => {
                        const isEnabled = enabledModules.includes(mod.key)
                        const isLocked = mod.key === 'dashboard' || mod.key === 'settings'
                        return (
                          <div
                            key={mod.key}
                            className={`flex items-center justify-between px-3 py-2 rounded-md transition-colors ${
                              isEnabled ? 'bg-primary/5' : ''
                            } ${isLocked ? 'opacity-70' : 'cursor-pointer hover:bg-muted/50'}`}
                            onClick={() => !isLocked && toggleModule(mod.key)}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <Switch
                                checked={isEnabled}
                                disabled={isLocked}
                                className="pointer-events-none shrink-0"
                              />
                              <span className={`text-sm ${isEnabled ? '' : 'text-muted-foreground'}`}>
                                {mod.label}
                              </span>
                              {isLocked && (
                                <span className="text-[10px] text-muted-foreground">(obavezan)</span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
