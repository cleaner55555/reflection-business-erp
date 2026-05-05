export const MODULES_DEFAULTS: Omit<ModuleDef, 'enabled'>[] = [
  { key: 'module_finansije_enabled', name: 'Finansije', descriptionKey: 'settings.mod_finansije', icon: '💰' },
  { key: 'module_fakture_enabled', name: 'Fakture', descriptionKey: 'settings.mod_fakture', icon: '📄' },
  { key: 'module_magacin_enabled', name: 'Magacin', descriptionKey: 'settings.mod_magacin', icon: '🏭' },
  { key: 'module_partneri_enabled', name: 'Partneri', descriptionKey: 'settings.mod_partneri', icon: '🤝' },
  { key: 'module_nabavka_enabled', name: 'Nabavka', descriptionKey: 'settings.mod_nabavka', icon: '🛒' },
  { key: 'module_crm_enabled', name: 'CRM', descriptionKey: 'settings.mod_crm', icon: '❤️' },
  { key: 'module_kalendar_enabled', name: 'Kalendar', descriptionKey: 'settings.mod_kalendar', icon: '📅' },
  { key: 'module_zaposleni_enabled', name: 'Zaposleni', descriptionKey: 'settings.mod_zaposleni', icon: '👥' },
  { key: 'module_projekti_enabled', name: 'Projekti', descriptionKey: 'settings.mod_projekti', icon: '📁' },
  { key: 'module_sredstva_enabled', name: 'Osnovna sredstva', descriptionKey: 'settings.mod_sredstva', icon: '🏗️' },
  { key: 'module_dokumenta_enabled', name: 'Dokumenta', descriptionKey: 'settings.mod_dokumenta', icon: '📂' },
  { key: 'module_knjigovodstvo_enabled', name: 'Knjigovodstvo', descriptionKey: 'settings.mod_knjigovodstvo', icon: '📒' },
  { key: 'module_protokol_enabled', name: 'Protokol', descriptionKey: 'settings.mod_protokol', icon: '📬' },
  { key: 'module_edukacija_enabled', name: 'Edukacija', descriptionKey: 'settings.mod_edukacija', icon: '🎓' },
  { key: 'module_vozni_park_enabled', name: 'Vozni park', descriptionKey: 'settings.mod_vozni_park', icon: '🚗' },
  { key: 'module_rent_a_car_enabled', name: 'Rent a car', descriptionKey: 'settings.mod_rent_a_car', icon: '🚙' },
  { key: 'module_kafe_restoran_enabled', name: 'Kafe restoran', descriptionKey: 'settings.mod_kafe_restoran', icon: '☕' },
  { key: 'module_email_marketing_enabled', name: 'Email Marketing', descriptionKey: 'settings.mod_email_marketing', icon: '✉️' },
]

export const COMPANY_DEFAULTS: CompanySettings = {
  company_name: '',
  company_pib: '',
  company_maticni_broj: '',
  company_address: '',
  company_city: '',
  company_zip: '',
  company_phone: '',
  company_email: '',
  company_website: '',
  company_bank_account: '',
}

export const DEFAULT_ACTIVE_LANGUAGES = ['sr', 'sr-latn', 'en']

export const GENERAL_DEFAULTS: GeneralSettings = {
  default_currency: 'RSD',
  default_tax_rate: '20',
  default_payment_method: 'racun',
  fiscal_year_start: '1',
  language: 'sr',
  active_languages: JSON.stringify(DEFAULT_ACTIVE_LANGUAGES),
}

export const { t } = useTranslation();

export const filtered = search.length > 0;

export const regionRanges: Array<{ label: string; start: number; end: number }> = [
    { label: 'Evropa', start: 0, end: 45 },
    { label: 'Azija', start: 45, end: 72 },
    { label: 'Afrika', start: 72, end: 80 },
    { label: 'Amerike', start: 80, end: 86 },
    { label: 'Okeanija', start: 86, end: 90 },
    { label: 'Ostalo', start: 90, end: ALL_LANGUAGES.length },
  ]

export const idx = ALL_LANGUAGES.indexOf(l);

export const isActive = activeCodes.includes(lang.code);

export const { t, locale, setLocale } = useTranslation();

export const {
    primaryColor,
    primaryForeground,
    accentColor,
    sidebarColor,
    sidebarForeground,
    borderRadius,
    logo,
    companyName: themeCompanyName,
    _initialized,
    updateThemeSettings,
    resetTheme,
  } = useThemeStore();

export const activeLangCodes: string[] = (() => {
    try { return JSON.parse(general.active_languages) || DEFAULT_ACTIVE_LANGUAGES }
    catch { return DEFAULT_ACTIVE_LANGUAGES }
  })();

export const toggleActiveLang = (code: string) => {
    setGeneral((prev) => {
      const current = (() => {
        try { return JSON.parse(prev.active_languages) || [...DEFAULT_ACTIVE_LANGUAGES] }
        catch { return [...DEFAULT_ACTIVE_LANGUAGES] }
      })()
      const next = current.includes(code)
        ? current.filter((c: string) => c !== code)
        : [...current, code]
      return { ...prev, active_languages: JSON.stringify(next) }
    })
  }

export const res = await fetch(`/api/settings?group=${group}`);

export const data: AppSettingResponse[] = await res.json();

export const map: Record<string, string> = {}

export const map: Record<string, string> = {}

export const handleSaveModules = async () => {
    setModulesSaving(true)
    try {
      const items = modules.map((m) => ({
        key: m.key, value: String(m.enabled), label: m.name, type: 'boolean', group: 'modules',
      }))
      const res = await fetch('/api/settings', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(items),
      })
      if (!res.ok) throw new Error('Greška')
      toast.success(t('settings.modulesSaved'))
    } catch {
      toast.error(t('settings.modulesSaveError'))
    } finally { setModulesSaving(false) }
  }

export const handleSaveCompany = async () => {
    setCompanySaving(true)
    try {
      const items: Array<{ key: string; value: string; label: string; type: string; group: string }> = []
      const labels: Record<string, string> = {
        company_name: t('settings.companyName'),
        company_pib: t('settings.companyPIB'),
        company_maticni_broj: t('settings.companyRegistration'),
        company_address: t('settings.companyAddress'),
        company_city: t('settings.companyCity'),
        company_zip: t('settings.companyZip'),
        company_phone: t('settings.companyPhone'),
        company_email: t('settings.companyEmail'),
        company_website: t('settings.companyWebsite'),
        company_bank_account: t('settings.companyBankAccount'),
      }
      Object.entries(company).forEach(([key, value]) => {
        items.push({ key, value, label: labels[key] || key, type: 'text', group: 'company' })
      })
      const res = await fetch('/api/settings', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(items),
      })
      if (!res.ok) throw new Error('Greška')
      toast.success(t('settings.companySaved'))
    } catch {
      toast.error(t('settings.companySaveError'))
    } finally { setCompanySaving(false) }
  }

export const handleSaveGeneral = async () => {
    setGeneralSaving(true)
    try {
      const items: Array<{ key: string; value: string; label: string; type: string; group: string }> = []
      const labels: Record<string, string> = {
        default_currency: t('settings.defaultCurrency'),
        default_tax_rate: t('settings.defaultTaxRate'),
        default_payment_method: t('settings.defaultPaymentMethod'),
        fiscal_year_start: t('settings.fiscalYearStart'),
        language: t('settings.language'),
      }
      Object.entries(general).forEach(([key, value]) => {
        items.push({ key, value, label: labels[key] || key, type: 'text', group: 'general' })
      })
      const res = await fetch('/api/settings', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(items),
      })
      if (!res.ok) throw new Error('Greška')
      // Also update locale if language changed
      setLocale(general.language)
      toast.success(t('settings.generalSaved'))
    } catch {
      toast.error(t('settings.generalSaveError'))
    } finally { setGeneralSaving(false) }
  }

export const handleApplyPreset = (preset: typeof themePresets[0]) => {
    setLocalPrimary(preset.settings.primaryColor)
    setLocalPrimaryFg(preset.settings.primaryForeground)
    setLocalAccent(preset.settings.accentColor)
    setLocalSidebar(preset.settings.sidebarColor)
    setLocalSidebarFg(preset.settings.sidebarForeground)
    setLocalRadius(preset.settings.borderRadius)
  }

export const handleSaveTheme = async () => {
    setThemeSaving(true)
    try {
      await updateThemeSettings({
        primaryColor: localPrimary,
        primaryForeground: localPrimaryFg,
        accentColor: localAccent,
        sidebarColor: localSidebar,
        sidebarForeground: localSidebarFg,
        borderRadius: localRadius,
        companyName: localCompanyName,
      })
      toast.success(t('common.saveSuccess'))
    } catch {
      toast.error(t('common.errorOccurred'))
    } finally { setThemeSaving(false) }
  }

export const handleResetTheme = async () => {
    setThemeResetting(true)
    try {
      await resetTheme()
      toast.success(t('common.reset'))
    } catch {
      toast.error(t('common.errorOccurred'))
    } finally { setThemeResetting(false) }
  }

export const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 500000) {
      toast.error('Logo mora biti manji od 500KB')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      updateThemeSettings({ logo: reader.result as string })
      toast.success(t('common.saveSuccess'))
    }
    reader.readAsDataURL(file)
  }

export const handleRemoveLogo = () => {
    updateThemeSettings({ logo: null })
    if (fileInputRef.current) fileInputRef.current.value = ''
    toast.success(t('common.saveSuccess'))
  }

export const enabledCount = modules.filter((m) => m.enabled).length;

export const MONTH_LABELS: Record<string, string> = {
    '1': 'Januar', '2': 'Februar', '3': 'Mart', '4': 'April',
    '5': 'Maj', '6': 'Jun', '7': 'Jul', '8': 'Avgust',
    '9': 'Septembar', '10': 'Oktobar', '11': 'Novembar', '12': 'Decembar',
  }

export const isPresetActive = (preset: typeof themePresets[0]) =>;

export const ColorPicker = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
    <div className="flex items-center gap-3">
      <div className="relative">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-10 cursor-pointer rounded-lg border-2 border-border p-0.5"
        />
      </div>
      <div className="flex-1">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 text-xs font-mono mt-1"
          maxLength={7}
        />
      </div>
    </div>
  );
