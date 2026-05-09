'use client'

import { useState, useEffect, useRef } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sparkles, ArrowRight, Check, Loader2, X, Building2,
  LayoutDashboard, Wallet, Package, Users, Settings, BarChart3,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/helpers'

// Module grouping
const MODULE_GROUPS: Record<string, { id: string; label: string; icon: string }[]> = {
  'Pregled': [
    { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  ],
  'Poslovanje': [
    { id: 'finansije', label: 'Finansije', icon: 'Wallet' },
    { id: 'fakture', label: 'Fakture', icon: 'FileText' },
    { id: 'ponude', label: 'Ponude', icon: 'ClipboardList' },
    { id: 'magacin', label: 'Magacin', icon: 'Package' },
    { id: 'nabavka', label: 'Nabavka', icon: 'ShoppingCart' },
    { id: 'bank-sync', label: 'Banka', icon: 'Landmark' },
    { id: 'pos', label: 'Maloprodaja', icon: 'Monitor' },
    { id: 'shipping', label: 'Shipping', icon: 'Truck' },
    { id: 'proizvodnja', label: 'Proizvodnja', icon: 'Factory' },
    { id: 'troškovi', label: 'Troškovi', icon: 'Receipt' },
    { id: 'pretplate', label: 'Pretplate', icon: 'CreditCard' },
  ],
  'CRM & Prodaja': [
    { id: 'crm', label: 'CRM', icon: 'HeartHandshake' },
    { id: 'partneri', label: 'Partneri', icon: 'Users' },
    { id: 'kalendar', label: 'Kalendar', icon: 'CalendarDays' },
    { id: 'marketplace', label: 'Marketplace', icon: 'Store' },
    { id: 'podrska', label: 'Podrška', icon: 'HeadphonesIcon' },
    { id: 'potpisi', label: 'Potpisi', icon: 'PenTool' },
  ],
  'Organizacija': [
    { id: 'zaposleni', label: 'Zaposleni', icon: 'UserCog' },
    { id: 'odsustva', label: 'Odsustva', icon: 'Palmtree' },
    { id: 'regrutacija', label: 'Regrutacija', icon: 'Briefcase' },
    { id: 'preporuke', label: 'Preporuke', icon: 'ThumbsUp' },
    { id: 'projekti', label: 'Projekti', icon: 'FolderKanban' },
    { id: 'zakazivanja', label: 'Zakazivanja', icon: 'CalendarClock' },
    { id: 'planer', label: 'Planer', icon: 'CalendarRange' },
    { id: 'sredstva', label: 'Sredstva', icon: 'Building2' },
    { id: 'odrzavanje', label: 'Održavanje', icon: 'Wrench' },
    { id: 'kvalitet', label: 'Kvalitet', icon: 'ShieldCheck' },
    { id: 'dokumenta', label: 'Dokumenta', icon: 'Files' },
    { id: 'knjigovodstvo', label: 'Knjigovodstvo', icon: 'BookOpen' },
    { id: 'edukacija', label: 'Edukacija', icon: 'GraduationCap' },
    { id: 'baza-znanja', label: 'Baza znanja', icon: 'BookMarked' },
  ],
  'Marketing': [
    { id: 'email-marketing', label: 'Email marketing', icon: 'Mail' },
    { id: 'drustvene-mreze', label: 'Društvene mreže', icon: 'Share2' },
    { id: 'sms-marketing', label: 'SMS marketing', icon: 'Megaphone' },
    { id: 'dogadjaji', label: 'Događaji', icon: 'PartyPopper' },
    { id: 'mkt-automatizacija', label: 'MKT automatizacija', icon: 'Workflow' },
    { id: 'ankete', label: 'Ankete', icon: 'ClipboardCheck' },
  ],
  'Specijalizovano': [
    { id: 'vozni-park', label: 'Vožni park', icon: 'Car' },
    { id: 'kafe-restoran', label: 'Kafe/Restoran', icon: 'UtensilsCrossed' },
    { id: 'rent-a-car', label: 'Rent-a-car', icon: 'CarFront' },
    { id: 'terenski-servis', label: 'Terenski servis', icon: 'MapPin' },
  ],
  'Komunikacija': [
    { id: 'chet', label: 'Čet', icon: 'MessageCircle' },
    { id: 'beleske', label: 'Beleške', icon: 'StickyNote' },
    { id: 'odobrenja', label: 'Odobrenja', icon: 'CheckCircle2' },
    { id: 'vestine', label: 'Veštine', icon: 'Award' },
    { id: 'ugovori', label: 'Ugovori', icon: 'FileSignature' },
  ],
  'Web & IT': [
    { id: 'website', label: 'Website', icon: 'Globe2' },
    { id: 'blog', label: 'Blog', icon: 'PenLine' },
    { id: 'voip', label: 'VoIP', icon: 'Phone' },
    { id: 'iot', label: 'IoT', icon: 'Wifi' },
    { id: 'whatsapp', label: 'Poruke', icon: 'MessageCircleReply' },
    { id: 'forum', label: 'Forum', icon: 'UsersRound' },
    { id: 'plm', label: 'PLM', icon: 'GitBranch' },
    { id: 'ecommerce', label: 'ECommerce', icon: 'ShoppingBag' },
    { id: 'spreadsheet', label: 'Spreadsheet', icon: 'Table2' },
    { id: 'cms', label: 'CMS', icon: 'FileCode' },
  ],
  'Dodatno': [
    { id: 'ocene', label: 'Ocene', icon: 'Star' },
    { id: 'gamifikacija', label: 'Gamifikacija', icon: 'Gamepad2' },
    { id: 'reklamacije', label: 'Reklamacije', icon: 'ShieldAlert' },
    { id: 'natečaji', label: 'Natečaji', icon: 'Gavel' },
    { id: 'garancije', label: 'Garancije', icon: 'ShieldCheck' },
    { id: 'servis', label: 'Servis', icon: 'Wrench' },
    { id: 'uskladenost', label: 'Usklađenost', icon: 'Shield' },
    { id: 'program-lojalnosti', label: 'Lojalnost', icon: 'Crown' },
    { id: 'planer-radne-sile', label: 'Planer radne snage', icon: 'CalendarRange' },
    { id: 'posetioci', label: 'Posetioci', icon: 'UserCheck' },
    { id: 'predlozi', label: 'Predlozi', icon: 'Lightbulb' },
    { id: 'taksacija', label: 'Taksacija', icon: 'Target' },
    { id: 'fond-zdravlja', label: 'Fond zdravlja', icon: 'Heart' },
    { id: 'geolokacija', label: 'Geolokacija', icon: 'MapPin' },
    { id: 'kamere', label: 'Kamere', icon: 'Camera' },
    { id: 'menadzer-nabavke', label: 'Menadžer nabavke', icon: 'PackageSearch' },
  ],
  'Analitika': [
    { id: 'izvestaji', label: 'Izveštaji', icon: 'BarChart3' },
    { id: 'integracije', label: 'Integracije', icon: 'Plug' },
    { id: 'zakoni', label: 'Zakoni', icon: 'Scale' },
  ],
  'Sistem': [
    { id: 'podesavanja', label: 'Podešavanja', icon: 'Settings' },
  ],
}

const ALL_MODULE_IDS = Object.values(MODULE_GROUPS).flat().map(m => m.id)

// Suggested descriptions
const SUGGESTIONS = [
  { label: 'Automehaničarska radnja', desc: 'Treba mi sistem za automehaničarsku radnju - servis, delovi, fakture, partneri' },
  { label: 'Veleprodaja', desc: 'Veleprodaja robe - nabavka, magacin, fakture, dostava, partneri' },
  { label: 'Maloprodaja / Trgovina', desc: 'Maloprodaja u prodavnici - kasa, robno magacin, računi' },
  { label: 'Kafe / Restoran', desc: 'Restoran - meni, narudžbe, kasa, zaposleni, nabavka hrane' },
  { label: 'Gradjevinska firma', desc: 'Gradjevina - projekti, mašine, nabavka, fakturisanje' },
  { label: 'Knjigovodstvena agencija', desc: 'Knjigovodstvo - fakture, partneri, izveštaji, dokumenta' },
]

// Export functions
let _setOpen: (open: boolean) => void = () => {}
export function openAISetupWizard() { _setOpen(true) }

export function AISetupWizard() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(1) // 1=describe, 2=analyzing, 3=confirm
  const [description, setDescription] = useState('')
  const [selectedModules, setSelectedModules] = useState<Set<string>>(new Set())
  const [aiResult, setAiResult] = useState<{ modules: string[]; industry: string; explanation: string } | null>(null)
  const [error, setError] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { setEnabledModules, setSetupComplete } = useAppStore()

  useEffect(() => { _setOpen = setOpen }, [setOpen])

  // Auto-show on first login
  useEffect(() => {
    const setupDone = localStorage.getItem('setupComplete')
    if (!setupDone) {
      const timer = setTimeout(() => setOpen(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  // Focus textarea on open
  useEffect(() => {
    if (open && step === 1) {
      setTimeout(() => textareaRef.current?.focus(), 300)
    }
  }, [open, step])

  const handleAnalyze = async () => {
    if (!description.trim()) return
    setStep(2)
    setError('')
    setAiResult(null)

    try {
      const res = await fetch('/api/ai-modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: description.trim() }),
      })

      if (!res.ok) throw new Error('Greška')

      const data = await res.json()
      if (data.error) throw new Error(data.error)

      setAiResult(data)
      setSelectedModules(new Set(data.modules || []))
      setStep(3)
    } catch {
      setError('Greška pri analizi. Pokušajte ponovo.')
      setStep(1)
    }
  }

  const toggleModule = (id: string) => {
    setSelectedModules(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleGroup = (groupModules: { id: string }[]) => {
    const allInGroup = groupModules.every(m => selectedModules.has(m.id))
    setSelectedModules(prev => {
      const next = new Set(prev)
      if (allInGroup) {
        groupModules.forEach(m => next.delete(m.id))
      } else {
        groupModules.forEach(m => next.add(m.id))
      }
      return next
    })
  }

  const handleConfirm = () => {
    const modules = Array.from(selectedModules)
    setEnabledModules(modules)
    setSetupComplete(true)
    setOpen(false)
    // Reset
    setStep(1)
    setDescription('')
    setSelectedModules(new Set())
    setAiResult(null)
  }

  const handleSkip = () => {
    setSetupComplete(true)
    setOpen(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={handleSkip} />

      {/* Content */}
      <div className="relative z-10 w-full max-w-2xl bg-white dark:bg-gray-950 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="shrink-0 px-6 py-5 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Reflection AI Setup
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Pustite AI da podesi sistem za vas
                </p>
              </div>
            </div>
            <button onClick={handleSkip} className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              Preskoči
            </button>
          </div>

          {/* Steps indicator */}
          <div className="flex items-center gap-2 mt-4">
            {[1, 2, 3].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className={cn(
                  'h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors',
                  step >= s
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                )}>
                  {step > s ? <Check className="h-3.5 w-3.5" /> : s}
                </div>
                {s < 3 && <div className={cn('h-0.5 w-8 rounded-full transition-colors', step > s ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-800')} />}
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden">
          {/* STEP 1: Describe business */}
          {step === 1 && (
            <div className="p-6 space-y-5">
              <div>
                <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">
                  Opišite vaše poslovanje
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Napišite šta radite i AI će odabrati prave module za vas.
                </p>
              </div>

              <Textarea
                ref={textareaRef}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Npr: Imamo automehaničarsku radnju sa 5 zaposlenih. Servisiramo automobile, prodajemo delove, i treba nam fakturisanje..."
                className="min-h-[120px] text-sm resize-none"
              />

              {/* Suggestions */}
              <div>
                <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-2">Predlozi:</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map(s => (
                    <button
                      key={s.label}
                      onClick={() => setDescription(s.desc)}
                      className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:border-primary/40 hover:bg-primary/5 transition-colors"
                    >
                      <Building2 className="h-3 w-3" />
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-500">{error}</p>
              )}

              <div className="flex justify-end">
                <Button onClick={handleAnalyze} disabled={!description.trim()} className="gap-2">
                  Analiziraj
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: Analyzing */}
          {step === 2 && (
            <div className="p-6 flex flex-col items-center justify-center py-16 gap-4">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <div className="text-center">
                <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">
                  AI analizira vaše potrebe...
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Odabirem module koji su vam potrebni
                </p>
              </div>
              <Loader2 className="h-5 w-5 text-primary animate-spin" />
            </div>
          )}

          {/* STEP 3: Confirm modules */}
          {step === 3 && (
            <div className="flex flex-col h-full">
              {/* AI explanation */}
              {aiResult && (
                <div className="px-6 pt-4 shrink-0">
                  <div className="flex items-start gap-3 rounded-lg bg-primary/5 border border-primary/10 p-3">
                    <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                        {aiResult.industry}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {aiResult.explanation}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Izabrano: {selectedModules.size} od {ALL_MODULE_IDS.length} modula
                    </p>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setSelectedModules(new Set(ALL_MODULE_IDS))}
                        className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 px-1.5 py-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        Izaberi sve
                      </button>
                      <span className="text-gray-300 dark:text-gray-600">·</span>
                      <button
                        onClick={() => setSelectedModules(new Set())}
                        className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 px-1.5 py-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        Poništi
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Modules grid */}
              <ScrollArea className="flex-1 px-6 py-3">
                <div className="space-y-3">
                  {Object.entries(MODULE_GROUPS).map(([group, modules]) => {
                    const allSelected = modules.every(m => selectedModules.has(m.id))
                    return (
                      <div key={group}>
                        <button
                          onClick={() => toggleGroup(modules)}
                          className="flex items-center gap-2 w-full text-left mb-1.5 group"
                        >
                          <div className={cn(
                            'h-4 w-4 rounded border flex items-center justify-center transition-colors',
                            allSelected
                              ? 'bg-primary border-primary text-primary-foreground'
                              : 'border-gray-300 dark:border-gray-600'
                          )}>
                            {allSelected && <Check className="h-2.5 w-2.5" />}
                          </div>
                          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300">
                            {group}
                          </span>
                          <Badge variant="outline" className="text-xs h-4 px-1">
                            {modules.filter(m => selectedModules.has(m.id)).length}/{modules.length}
                          </Badge>
                        </button>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 ml-6">
                          {modules.map(m => {
                            const isSelected = selectedModules.has(m.id)
                            return (
                              <button
                                key={m.id}
                                onClick={() => toggleModule(m.id)}
                                className={cn(
                                  'flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition-all duration-150',
                                  isSelected
                                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                )}
                              >
                                <div className={cn(
                                  'h-3.5 w-3.5 rounded border flex items-center justify-center shrink-0 transition-colors',
                                  isSelected
                                    ? 'border-transparent bg-current'
                                    : 'border-gray-300 dark:border-gray-600'
                                )}>
                                  {isSelected && <Check className="h-2 w-2 text-inherit" />}
                                </div>
                                <span className="truncate font-medium">{m.label}</span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>

              {/* Footer buttons */}
              <div className="shrink-0 px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)} className="gap-1">
                  Nazad
                </Button>
                <Button onClick={handleConfirm} className="gap-2" disabled={selectedModules.size === 0}>
                  <Check className="h-4 w-4" />
                  Započni sa {selectedModules.size} modula
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
