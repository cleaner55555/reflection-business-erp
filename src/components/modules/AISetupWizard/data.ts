export const MODULE_GROUPS: Record<string, { id: string; label: string; icon: string }[]> = {
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

export const ALL_MODULE_IDS = Object.values(MODULE_GROUPS).flat().map(m => m.id);

export const SUGGESTIONS = [
  { label: 'Automehaničarska radnja', desc: 'Treba mi sistem za automehaničarsku radnju - servis, delovi, fakture, partneri' },
  { label: 'Veleprodaja', desc: 'Veleprodaja robe - nabavka, magacin, fakture, dostava, partneri' },
  { label: 'Maloprodaja / Trgovina', desc: 'Maloprodaja u prodavnici - kasa, robno magacin, računi' },
  { label: 'Kafe / Restoran', desc: 'Restoran - meni, narudžbe, kasa, zaposleni, nabavka hrane' },
  { label: 'Gradjevinska firma', desc: 'Gradjevina - projekti, mašine, nabavka, fakturisanje' },
  { label: 'Knjigovodstvena agencija', desc: 'Knjigovodstvo - fakture, partneri, izveštaji, dokumenta' },
]

export const { setEnabledModules, setSetupComplete } = useAppStore();

export const setupDone = localStorage.getItem('setupComplete');

export const timer = setTimeout(() => setOpen(true), 1500);

export const handleAnalyze = async () => {
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

export const toggleModule = (id: string) => {
    setSelectedModules(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

export const toggleGroup = (groupModules: { id: string }[]) => {
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

export const handleConfirm = () => {
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

export const handleSkip = () => {
    setSetupComplete(true)
    setOpen(false)
  }

export const allSelected = modules.every(m => selectedModules.has(m.id));

export const isSelected = selectedModules.has(m.id);

export function openAISetupWizard() { _setOpen(true) }
