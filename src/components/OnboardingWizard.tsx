'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { ALL_LANGUAGES } from '@/lib/i18n'
import { COUNTRY_TAX_LAWS } from '@/lib/tax-laws/index'
import { industryTemplatesData, industryCategories } from '@/lib/industry-templates-data'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  Globe,
  MapPin,
  Building2,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2,
  ArrowRight,
} from 'lucide-react'

// ============ CONSTANTS ============

const ONBOARDING_KEY = 'onboarding_completed'
const STEPS = [
  { id: 1, title: 'Welcome', icon: Globe },
  { id: 2, title: 'Country', icon: MapPin },
  { id: 3, title: 'Company', icon: Building2 },
  { id: 4, title: 'Industry', icon: Sparkles },
] as const

type StepNumber = 1 | 2 | 3 | 4

const REGION_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'europe', label: 'Europe' },
  { key: 'americas', label: 'Americas' },
  { key: 'asia', label: 'Asia' },
  { key: 'africa', label: 'Africa' },
  { key: 'oceania', label: 'Oceania' },
] as const

// ============ TYPES ============

interface CompanyInfo {
  name: string
  taxId: string
  address: string
  city: string
  phone: string
  email: string
}

// ============ HOOK ============

export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const completed = localStorage.getItem(ONBOARDING_KEY)
    if (!completed) {
      setShowOnboarding(true)
    }
    setMounted(true)
  }, [])

  const completeOnboarding = useCallback(() => {
    localStorage.setItem(ONBOARDING_KEY, 'true')
    setShowOnboarding(false)
  }, [])

  return {
    showOnboarding: mounted && showOnboarding,
    completeOnboarding,
  }
}

// ============ STEP ANIMATION WRAPPER ============

function StepContainer({
  step,
  currentStep,
  direction,
  children,
}: {
  step: StepNumber
  currentStep: StepNumber
  direction: 'forward' | 'backward'
  children: React.ReactNode
}) {
  if (step !== currentStep) return null

  return (
    <div
      className="animate-step-enter"
      style={{
        animation: direction === 'forward' ? 'stepFadeInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1) both' : 'stepFadeInLeft 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
      }}
    >
      {children}
    </div>
  )
}

// ============ STEP 1: WELCOME + LANGUAGE ============

function StepWelcome({
  selectedLang,
  onSelectLang,
}: {
  selectedLang: string | null
  onSelectLang: (code: string) => void
}) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return ALL_LANGUAGES
    const q = search.toLowerCase()
    return ALL_LANGUAGES.filter(
      (l) =>
        l.nativeName.toLowerCase().includes(q) ||
        l.englishName.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q)
    )
  }, [search])

  return (
    <div className="space-y-6">
      {/* Hero section */}
      <div className="text-center space-y-3 pb-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-2">
          <Globe className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Reflection Business ERP</h2>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Your complete business management platform. Let&apos;s set up your workspace in just a few steps.
        </p>
      </div>

      {/* Language search */}
      <div className="relative max-w-sm mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search languages..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Language grid */}
      <div className="max-h-72 overflow-y-auto rounded-lg border p-2">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {filtered.map((lang) => {
            const isSelected = selectedLang === lang.code
            return (
              <button
                key={lang.code}
                onClick={() => onSelectLang(lang.code)}
                className={`
                  flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left text-sm transition-all duration-150
                  hover:bg-accent hover:press
                  ${isSelected
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm ring-2 ring-primary/30'
                    : 'bg-card border border-border'
                  }
                `}
              >
                <span className="text-base leading-none flex-shrink-0">{lang.flag}</span>
                <span className="truncate font-medium">{lang.nativeName}</span>
              </button>
            )
          })}
        </div>
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-6">No languages found.</p>
        )}
      </div>

      {selectedLang && (
        <p className="text-center text-sm text-muted-foreground">
          Selected: {ALL_LANGUAGES.find((l) => l.code === selectedLang)?.flag}{' '}
          {ALL_LANGUAGES.find((l) => l.code === selectedLang)?.englishName}
        </p>
      )}
    </div>
  )
}

// ============ STEP 2: COUNTRY ============

function StepCountry({
  selectedCountry,
  onSelectCountry,
}: {
  selectedCountry: string | null
  onSelectCountry: (code: string) => void
}) {
  const [search, setSearch] = useState('')
  const [region, setRegion] = useState<string>('all')

  const filtered = useMemo(() => {
    let list = COUNTRY_TAX_LAWS
    if (region !== 'all') {
      list = list.filter((c) => c.region === region)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          c.currency.toLowerCase().includes(q)
      )
    }
    return list
  }, [search, region])

  return (
    <div className="space-y-5">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Choose Your Country</h2>
        <p className="text-muted-foreground text-sm">
          This configures tax rates, currency, and invoicing rules.
        </p>
      </div>

      {/* Region filter buttons */}
      <div className="flex flex-wrap gap-2 justify-center">
        {REGION_FILTERS.map((r) => (
          <Button
            key={r.key}
            variant={region === r.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setRegion(r.key)}
            className="rounded-full px-4"
          >
            {r.label}
          </Button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search countries..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Country grid */}
      <div className="max-h-72 overflow-y-auto rounded-lg border p-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {filtered.map((country) => {
            const isSelected = selectedCountry === country.code
            return (
              <button
                key={country.code}
                onClick={() => onSelectCountry(country.code)}
                className={`
                  flex items-center gap-3 px-3 py-3 rounded-lg text-left text-sm transition-all duration-150
                  hover:press
                  ${isSelected
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm ring-2 ring-primary/30'
                    : 'bg-card border border-border hover:bg-accent'
                  }
                `}
              >
                <span className="text-2xl leading-none flex-shrink-0">{country.flag}</span>
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">{country.name}</div>
                  <div
                    className={`text-xs mt-0.5 ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}
                  >
                    {country.currency} &middot; {country.vat.type.toUpperCase()} {country.vat.standardRate}%
                  </div>
                </div>
                {country.vat.isEuVat && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 flex-shrink-0">
                    EU
                  </Badge>
                )}
                {isSelected && <Check className="w-4 h-4 flex-shrink-0 ml-auto" />}
              </button>
            )
          })}
        </div>
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-6">No countries found.</p>
        )}
      </div>
    </div>
  )
}

// ============ STEP 3: COMPANY INFO ============

function StepCompanyInfo({
  company,
  onChange,
}: {
  company: CompanyInfo
  onChange: (field: keyof CompanyInfo, value: string) => void
}) {
  return (
    <div className="space-y-5">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Company Information</h2>
        <p className="text-muted-foreground text-sm">
          Tell us about your business. You can update this later in Settings.
        </p>
      </div>

      <div className="max-w-md mx-auto space-y-4">
        <div className="space-y-2">
          <Label htmlFor="company-name">Company Name</Label>
          <Input
            id="company-name"
            placeholder="e.g. Acme Corp"
            value={company.name}
            onChange={(e) => onChange('name', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tax-id">Tax ID / PIB</Label>
          <Input
            id="tax-id"
            placeholder="e.g. 123456789"
            value={company.taxId}
            onChange={(e) => onChange('taxId', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            placeholder="Street address"
            value={company.address}
            onChange={(e) => onChange('address', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              placeholder="City"
              value={company.city}
              onChange={(e) => onChange('city', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 555 0000"
              value={company.phone}
              onChange={(e) => onChange('phone', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="office@company.com"
            value={company.email}
            onChange={(e) => onChange('email', e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}

// ============ STEP 4: INDUSTRY TEMPLATE ============

function StepIndustry({
  selectedTemplate,
  onSelectTemplate,
}: {
  selectedTemplate: string | null
  onSelectTemplate: (slug: string) => void
}) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const filteredTemplates = useMemo(() => {
    if (!activeCategory) return industryTemplatesData.filter((t) => t.featured)
    return industryTemplatesData.filter((t) => t.category === activeCategory)
  }, [activeCategory])

  return (
    <div className="space-y-5">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Choose Your Industry</h2>
        <p className="text-muted-foreground text-sm">
          Select a template to pre-configure modules for your business type.
        </p>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-1.5 justify-center">
        <Button
          variant={!activeCategory ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveCategory(null)}
          className="rounded-full px-3 text-xs"
        >
          Featured
        </Button>
        {industryCategories.map((cat) => (
          <Button
            key={cat.name}
            variant={activeCategory === cat.name ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveCategory(cat.name)}
            className="rounded-full px-3 text-xs"
          >
            {cat.name} ({cat.count})
          </Button>
        ))}
      </div>

      {/* Template grid */}
      <div className="max-h-72 overflow-y-auto rounded-lg border p-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {filteredTemplates.map((tpl) => {
            const isSelected = selectedTemplate === tpl.slug
            return (
              <button
                key={tpl.slug}
                onClick={() => onSelectTemplate(tpl.slug)}
                className={`
                  flex flex-col items-start gap-1 px-3 py-3 rounded-lg text-left text-sm transition-all duration-150
                  hover:press
                  ${isSelected
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm ring-2 ring-primary/30'
                    : 'bg-card border border-border hover:bg-accent'
                  }
                `}
              >
                <div className="flex items-center gap-2 w-full">
                  <span className="font-medium truncate flex-1">{tpl.name}</span>
                  {isSelected && <Check className="w-4 h-4 flex-shrink-0" />}
                </div>
                <p
                  className={`text-xs line-clamp-2 leading-relaxed ${
                    isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'
                  }`}
                >
                  {tpl.description}
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  <Badge
                    variant={isSelected ? 'secondary' : 'outline'}
                    className="text-[10px] px-1.5 py-0"
                  >
                    {tpl.category}
                  </Badge>
                  <Badge
                    variant={isSelected ? 'secondary' : 'outline'}
                    className="text-[10px] px-1.5 py-0"
                  >
                    {tpl.modules.length} modules
                  </Badge>
                </div>
              </button>
            )
          })}
        </div>
        {filteredTemplates.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-6">No templates in this category.</p>
        )}
      </div>
    </div>
  )
}

// ============ MAIN WIZARD COMPONENT ============

export function OnboardingWizard() {
  const { showOnboarding, completeOnboarding } = useOnboarding()
  const [currentStep, setCurrentStep] = useState<StepNumber>(1)
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward')
  const [isSaving, setIsSaving] = useState(false)

  // Form state
  const [selectedLang, setSelectedLang] = useState<string | null>(null)
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
  const [company, setCompany] = useState<CompanyInfo>({
    name: '',
    taxId: '',
    address: '',
    city: '',
    phone: '',
    email: '',
  })
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  const handleCompanyChange = useCallback((field: keyof CompanyInfo, value: string) => {
    setCompany((prev) => ({ ...prev, [field]: value }))
  }, [])

  const goToStep = useCallback(
    (step: StepNumber) => {
      setDirection(step > currentStep ? 'forward' : 'backward')
      setCurrentStep(step)
    },
    [currentStep]
  )

  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 1:
        return !!selectedLang
      case 2:
        return !!selectedCountry
      case 3:
        return !!company.name.trim()
      case 4:
        return !!selectedTemplate
      default:
        return false
    }
  }, [currentStep, selectedLang, selectedCountry, company.name, selectedTemplate])

  const handleSave = useCallback(async () => {
    if (!canProceed || !selectedCountry) return
    setIsSaving(true)

    try {
      const country = COUNTRY_TAX_LAWS.find((c) => c.code === selectedCountry)
      const template = industryTemplatesData.find((t) => t.slug === selectedTemplate)

      // Save all settings via PUT /api/settings
      const settings = [
        { key: 'locale', value: selectedLang || 'en', label: 'Language', type: 'text', group: 'general' },
        { key: 'country_code', value: selectedCountry, label: 'Country', type: 'text', group: 'general' },
        { key: 'country_name', value: country?.name || '', label: 'Country Name', type: 'text', group: 'general' },
        { key: 'currency', value: country?.currency || '', label: 'Currency', type: 'text', group: 'general' },
        { key: 'vat_rate', value: String(country?.vat.standardRate || 0), label: 'VAT Rate', type: 'text', group: 'general' },
        { key: 'vat_type', value: country?.vat.type || 'none', label: 'VAT Type', type: 'text', group: 'general' },
        { key: 'company_name', value: company.name, label: 'Company Name', type: 'text', group: 'company' },
        { key: 'company_tax_id', value: company.taxId, label: 'Tax ID', type: 'text', group: 'company' },
        { key: 'company_address', value: company.address, label: 'Address', type: 'text', group: 'company' },
        { key: 'company_city', value: company.city, label: 'City', type: 'text', group: 'company' },
        { key: 'company_phone', value: company.phone, label: 'Phone', type: 'text', group: 'company' },
        { key: 'company_email', value: company.email, label: 'Email', type: 'text', group: 'company' },
        { key: 'industry_template', value: selectedTemplate || '', label: 'Industry Template', type: 'text', group: 'general' },
        { key: 'industry_name', value: template?.name || '', label: 'Industry Name', type: 'text', group: 'general' },
        {
          key: 'active_modules',
          value: JSON.stringify(template?.modules || []),
          label: 'Active Modules',
          type: 'json',
          group: 'general',
        },
      ]

      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
    } catch (err) {
      console.error('Failed to save onboarding settings:', err)
      // Still mark as complete so user isn't stuck
    } finally {
      completeOnboarding()
      setIsSaving(false)
    }
  }, [canProceed, selectedLang, selectedCountry, company, selectedTemplate, completeOnboarding])

  // Don't render if not visible
  if (!showOnboarding) return null

  const isLastStep = currentStep === 4
  const isFirstStep = currentStep === 1
  const progressPercent = (currentStep / 4) * 100

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        style={{ animation: 'fadeIn 0.25s ease-out both' }}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-2xl mx-4 animate-scale-in"
        style={{
          animation: 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
        }}
      >
        <Card className="shadow-2xl border-border/50">
          <CardHeader className="pb-0">
            {/* Progress bar */}
            <div className="mb-4">
              <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Step indicators */}
            <div className="flex items-center justify-center gap-1 mb-2">
              {STEPS.map((step, idx) => {
                const Icon = step.icon
                const isActive = step.id === currentStep
                const isComplete = step.id < currentStep
                return (
                  <React.Fragment key={step.id}>
                    <button
                      onClick={() => {
                        // Allow jumping back to completed steps
                        if (isComplete) goToStep(step.id as StepNumber)
                      }}
                      className={`
                        flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all
                        ${isActive
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : isComplete
                            ? 'bg-primary/10 text-primary cursor-pointer hover:bg-primary/20'
                            : 'bg-muted text-muted-foreground'
                        }
                      `}
                      disabled={!isComplete && !isActive}
                    >
                      {isComplete ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Icon className="w-3.5 h-3.5" />
                      )}
                      <span className="hidden sm:inline">{step.title}</span>
                      <span className="sm:hidden">{step.id}</span>
                    </button>
                    {idx < STEPS.length - 1 && (
                      <div
                        className={`w-6 h-px flex-shrink-0 ${step.id < currentStep ? 'bg-primary' : 'bg-border'}`}
                      />
                    )}
                  </React.Fragment>
                )
              })}
            </div>
          </CardHeader>

          <CardContent className="pt-2">
            {/* Step content */}
            <StepContainer step={1} currentStep={currentStep} direction={direction}>
              <StepWelcome selectedLang={selectedLang} onSelectLang={setSelectedLang} />
            </StepContainer>

            <StepContainer step={2} currentStep={currentStep} direction={direction}>
              <StepCountry selectedCountry={selectedCountry} onSelectCountry={setSelectedCountry} />
            </StepContainer>

            <StepContainer step={3} currentStep={currentStep} direction={direction}>
              <StepCompanyInfo company={company} onChange={handleCompanyChange} />
            </StepContainer>

            <StepContainer step={4} currentStep={currentStep} direction={direction}>
              <StepIndustry selectedTemplate={selectedTemplate} onSelectTemplate={setSelectedTemplate} />
            </StepContainer>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-5 mt-4 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => goToStep((currentStep - 1) as StepNumber)}
                disabled={isFirstStep || isSaving}
                className="gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>

              <div className="text-xs text-muted-foreground">
                Step {currentStep} of 4
              </div>

              {isLastStep ? (
                <Button
                  onClick={handleSave}
                  disabled={!canProceed || isSaving}
                  className="gap-1.5 min-w-[120px]"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Get Started
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={() => goToStep((currentStep + 1) as StepNumber)}
                  disabled={!canProceed}
                  className="gap-1"
                >
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Step transition keyframes are defined via inline style animation on StepContainer */}
    </div>
  )
}

export default OnboardingWizard
