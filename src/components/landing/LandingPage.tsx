'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { AuthPage } from '@/components/modules/AuthPage'
import {
  ArrowRight,
  Play,
  BookOpen,
  Users,
  Warehouse,
  ShoppingBag,
  Store,
  BarChart3,
  Brain,
  Globe,
  CheckCircle2,
  Star,
  Zap,
  Shield,
  Clock,
  ChevronRight,
  Moon,
  Sun,
  Menu,
  X,
  Building2,
  Factory,
  Wrench,
  HardHat,
  HeartPulse,
  GraduationCap,
  UtensilsCrossed,
  Monitor,
} from 'lucide-react'

// ─── Animation Variants ─────────────────────────────────────────────
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

// ─── Data ────────────────────────────────────────────────────────────

const features = [
  {
    icon: BookOpen,
    title: 'Knjigovodstvo',
    description: 'Kompletno finansijsko knjigovodstvo sa automatskim obračunom PDV-a, poreza i finansijskih izveštaja.',
  },
  {
    icon: Users,
    title: 'CRM',
    description: 'Upravljanje odnosima sa klijentima, praćenje prodajnog levka i automatizacija marketinških kampanja.',
  },
  {
    icon: Warehouse,
    title: 'Magacin',
    description: 'Napredno upravljanje zalihama, praćenje stanja u realnom vremenu i automatske narudžbe.',
  },
  {
    icon: ShoppingBag,
    title: 'POS',
    description: 'Brzi i pouzdani point-of-sale sistem za maloprodaju sa podrškom za barkod skenere.',
  },
  {
    icon: Store,
    title: 'Maloprodaja',
    description: 'Kompletno rešenje za maloprodaju: e-commerce, online prodaja, naplate i povrati robe.',
  },
  {
    icon: BarChart3,
    title: 'Izveštaji',
    description: 'Napredni analitički izveštaji sa prilagodljivim dashboardima i vizualizacijom podataka.',
  },
  {
    icon: Brain,
    title: 'AI Asistent',
    description: 'Veštačka inteligencija za automatizaciju poslovnih procesa, predviđanja i preporuke.',
  },
  {
    icon: Globe,
    title: 'Multi-jezički',
    description: 'Podrška za 82 jezika sa automatskim prevodima i prilagođavanjem sadržaja.',
  },
]

const steps = [
  {
    step: '01',
    title: 'Registruj se',
    description: 'Kreirajte besplatni nalog za manje od 2 minuta. Bez kreditne kartice.',
    icon: Zap,
  },
  {
    step: '02',
    title: 'Konfiguriši',
    description: 'Izaberite module i prilagodite sistem potrebama vaše kompanije.',
    icon: Shield,
  },
  {
    step: '03',
    title: 'Upravljaj',
    description: 'Počnite da upravljate celokupnim poslovanjem sa jedne platforme.',
    icon: Clock,
  },
]

const industries = [
  { name: 'Trgovina', icon: ShoppingBag },
  { name: 'Proizvodnja', icon: Factory },
  { name: 'Usluge', icon: Wrench },
  { name: 'Građevina', icon: HardHat },
  { name: 'Zdravstvo', icon: HeartPulse },
  { name: 'Edukacija', icon: GraduationCap },
  { name: 'Ugostiteljstvo', icon: UtensilsCrossed },
  { name: 'IT & Tehnologija', icon: Monitor },
]

const plans = [
  {
    name: 'Starter',
    price: '0',
    period: 'besplatno',
    description: 'Idealno za mala preduzeća koja tek počinju.',
    features: [
      'Do 3 korisnika',
      '5 osnovnih modula',
      '1 GB skladište',
      'E-mail podrška',
      'Osnovni izveštaji',
    ],
    cta: 'Započni besplatno',
    highlighted: false,
  },
  {
    name: 'Professional',
    price: '49',
    period: '/mesec',
    description: 'Za rastuće kompanije koje žele više.',
    features: [
      'Do 25 korisnika',
      'Svi moduli',
      '50 GB skladište',
      'Prioritetna podrška',
      'AI asistent',
      'Napredni izveštaji',
      'API pristup',
    ],
    cta: 'Započni probni period',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Kontakt',
    period: '',
    description: 'Prilagođeno rešenje za velike organizacije.',
    features: [
      'Neograničeni korisnici',
      'Svi moduli + prilagođeni',
      'Neograničeno skladište',
      'Dedikovana podrška 24/7',
      'AI asistent (Premium)',
      'Custom integracije',
      'SLA garancija',
      'On-premise opcija',
    ],
    cta: 'Kontaktirajte nas',
    highlighted: false,
  },
]

const testimonials = [
  {
    name: 'Marko Petrović',
    role: 'Direktor, TradePro d.o.o.',
    content: 'Reflection Business nam je potpuno transformisao poslovanje. Umesto 5 različitih programa, sada sve imamo na jednom mestu. Produktivnost je porasla za 40%.',
    avatar: 'MP',
    rating: 5,
  },
  {
    name: 'Jelena Nikolić',
    role: 'Finansijski menadžer, BuildMax',
    content: 'Knjigovodstveni modul je izuzetno precizan i u skladu sa srpskim propisima. Štedimo vreme na obračunu PDV-a i finansijskim izveštajima.',
    avatar: 'JN',
    rating: 5,
  },
  {
    name: 'Nenad Stanković',
    role: 'CEO, MediTech Solutions',
    content: 'AI asistent nam pomaže da donosimo bolje odluke na osnovu podataka. Multi-jezička podrška je ključna za naš internacionalni biznis.',
    avatar: 'NS',
    rating: 5,
  },
]

const footerLinks = {
  Proizvod: ['Funkcionalnosti', 'Cene', 'Integracije', 'API dokumentacija', 'Ažuriranja'],
  Kompanija: ['O nama', 'Karijere', 'Blog', 'Partneri', 'Kontakt'],
  Resursi: ['Dokumentacija', 'Tutorijali', 'Webinari', 'Zajednica', 'FAQ'],
  'Pravne informacije': ['Politika privatnosti', 'Uslovi korišćenja', 'Cookie politika', 'GDPR'],
}

// ─── Section: Navbar ────────────────────────────────────────────────

function Navbar({ onAuth, onScrollTo }: { onAuth: () => void; onScrollTo: (id: string) => void }) {
  const { theme, setTheme } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <button onClick={() => onScrollTo('hero')} className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <Building2 className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            Reflection<span className="text-emerald-600 dark:text-emerald-400">Business</span>
          </span>
        </button>

        {/* Desktop links */}
        <div className="hidden items-center gap-6 md:flex">
          {[
            { label: 'Funkcionalnosti', id: 'features' },
            { label: 'Kako radi', id: 'how-it-works' },
            { label: 'Industrije', id: 'industries' },
            { label: 'Cene', id: 'pricing' },
          ].map((link) => (
            <button
              key={link.id}
              onClick={() => onScrollTo(link.id)}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Promeni temu"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
          </button>
          <Button variant="ghost" className="hidden sm:inline-flex" onClick={onAuth}>
            Prijavi se
          </Button>
          <Button className="hidden sm:inline-flex bg-emerald-600 hover:bg-emerald-700 text-white" onClick={onAuth}>
            Započni besplatno
          </Button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-muted-foreground md:hidden"
            aria-label="Meni"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t bg-background px-4 py-4 md:hidden"
        >
          <div className="flex flex-col gap-3">
            {[
              { label: 'Funkcionalnosti', id: 'features' },
              { label: 'Kako radi', id: 'how-it-works' },
              { label: 'Industrije', id: 'industries' },
              { label: 'Cene', id: 'pricing' },
            ].map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  onScrollTo(link.id)
                  setMobileOpen(false)
                }}
                className="text-left text-sm text-muted-foreground transition-colors hover:text-foreground py-2"
              >
                {link.label}
              </button>
            ))}
            <Separator className="my-2" />
            <Button variant="outline" className="w-full" onClick={() => { onAuth(); setMobileOpen(false) }}>
              Prijavi se
            </Button>
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => { onAuth(); setMobileOpen(false) }}>
              Započni besplatno
            </Button>
          </div>
        </motion.div>
      )}
    </motion.nav>
  )
}

// ─── Section: Hero ──────────────────────────────────────────────────

function HeroSection({ onAuth }: { onAuth: () => void }) {
  return (
    <section
      id="hero"
      className="relative overflow-hidden pt-16"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-background to-emerald-50/30 dark:from-emerald-950/20 dark:via-background dark:to-emerald-950/10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-emerald-500/5 blur-3xl dark:bg-emerald-500/10" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(0 0 0 / 1)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")`,
          }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-28 sm:pb-24 lg:pt-36 lg:pb-32">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="mx-auto max-w-4xl text-center"
        >
          {/* Badge */}
          <motion.div variants={fadeInUp} custom={0}>
            <Badge variant="outline" className="mb-6 gap-1.5 border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400 px-3 py-1">
              <Zap className="h-3 w-3" />
              Nova verzija 2.0 — AI pokretan ERP
            </Badge>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeInUp}
            custom={1}
            className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl"
          >
            ERP Sistem za vaše{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-emerald-300">
              poslovanje
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={fadeInUp}
            custom={2}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl leading-relaxed"
          >
            Reflection Business je sve-u-jednom platforma koja objedinjuje knjigovodstvo, CRM, magacin, prodaju i još
            mnogo toga. Napredna AI tehnologija za pametnije poslovanje.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={fadeInUp} custom={3} className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              className="h-12 px-8 text-base bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40 transition-all"
              onClick={onAuth}
            >
              Započni besplatno
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 px-8 text-base"
              onClick={() => {}}
            >
              <Play className="mr-1 h-4 w-4" />
              Pogledaj demo
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={fadeInUp}
            custom={4}
            className="mt-16 grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-4"
          >
            {[
              { value: '148+', label: 'Modula' },
              { value: '82', label: 'Zemalja' },
              { value: '82', label: 'Jezika' },
              { value: '10+', label: 'Industrija' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-foreground sm:text-3xl">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

// ─── Section: Features ──────────────────────────────────────────────

function FeaturesSection() {
  return (
    <section id="features" className="py-20 sm:py-28 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={stagger}
          className="mx-auto max-w-2xl text-center mb-16"
        >
          <motion.p variants={fadeInUp} className="text-sm font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Funkcionalnosti
          </motion.p>
          <motion.h2 variants={fadeInUp} className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Sve što vam je potrebno za uspeh
          </motion.h2>
          <motion.p variants={fadeInUp} className="mt-4 text-lg text-muted-foreground">
            Kompletna ERP platforma sa 148+ modula koji pokrivaju sve aspekte vašeg poslovanja.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={stagger}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {features.map((feature, i) => (
            <motion.div key={feature.title} variants={fadeInUp} custom={i}>
              <Card className="group relative h-full border-border/50 bg-card/50 backdrop-blur-sm hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 py-6 gap-4">
                <CardContent className="px-6 pt-0">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white dark:group-hover:bg-emerald-600 dark:group-hover:text-white transition-colors duration-300">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ─── Section: How it Works ──────────────────────────────────────────

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={stagger}
          className="mx-auto max-w-2xl text-center mb-16"
        >
          <motion.p variants={fadeInUp} className="text-sm font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Kako radi
          </motion.p>
          <motion.h2 variants={fadeInUp} className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Počnite za 3 jednostavna koraka
          </motion.h2>
          <motion.p variants={fadeInUp} className="mt-4 text-lg text-muted-foreground">
            Nema složenih instalacija. Registrujte se, konfigurišite i počnite da radite.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={stagger}
          className="grid gap-8 md:grid-cols-3"
        >
          {steps.map((step, i) => (
            <motion.div key={step.step} variants={fadeInUp} custom={i} className="relative">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="absolute top-12 left-[calc(50%+40px)] hidden h-px w-[calc(100%-80px)] bg-gradient-to-r from-emerald-300 to-transparent dark:from-emerald-700 md:block" />
              )}
              <div className="text-center">
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/50 dark:to-emerald-900/30 border border-emerald-200/50 dark:border-emerald-800/50">
                  <step.icon className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="mb-2 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  KORAK {step.step}
                </div>
                <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-muted-foreground">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ─── Section: Industries ────────────────────────────────────────────

function IndustriesSection() {
  return (
    <section id="industries" className="py-20 sm:py-28 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={stagger}
          className="mx-auto max-w-2xl text-center mb-16"
        >
          <motion.p variants={fadeInUp} className="text-sm font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Industrije
          </motion.p>
          <motion.h2 variants={fadeInUp} className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Prilagođen za vašu industriju
          </motion.h2>
          <motion.p variants={fadeInUp} className="mt-4 text-lg text-muted-foreground">
            Specijalizovani moduli za svaku industriju. Od trgovine do zdravstva.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={stagger}
          className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-4"
        >
          {industries.map((industry, i) => (
            <motion.div key={industry.name} variants={fadeInUp} custom={i}>
              <Card className="group h-full cursor-pointer border-border/50 bg-card/50 hover:border-emerald-200 hover:shadow-md hover:shadow-emerald-500/5 transition-all duration-300 py-6 gap-4">
                <CardContent className="px-6 pt-0 flex flex-col items-center text-center">
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-muted group-hover:bg-emerald-100 dark:group-hover:bg-emerald-950/50 transition-colors duration-300">
                    <industry.icon className="h-7 w-7 text-muted-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">{industry.name}</h3>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ─── Section: Pricing ───────────────────────────────────────────────

function PricingSection({ onAuth }: { onAuth: () => void }) {
  return (
    <section id="pricing" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={stagger}
          className="mx-auto max-w-2xl text-center mb-16"
        >
          <motion.p variants={fadeInUp} className="text-sm font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Cene
          </motion.p>
          <motion.h2 variants={fadeInUp} className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Jednostavno cenovne opcije
          </motion.h2>
          <motion.p variants={fadeInUp} className="mt-4 text-lg text-muted-foreground">
            Bez skrivenih troškova. Odustanite u bilo kom trenutku.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={stagger}
          className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3"
        >
          {plans.map((plan, i) => (
            <motion.div key={plan.name} variants={fadeInUp} custom={i}>
              <Card
                className={`relative h-full flex flex-col ${
                  plan.highlighted
                    ? 'border-emerald-300 dark:border-emerald-700 shadow-xl shadow-emerald-500/10'
                    : 'border-border/50'
                } bg-card/50 backdrop-blur-sm py-6 gap-0`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-emerald-600 text-white border-0 px-3 py-1">
                      Najpopularniji
                    </Badge>
                  </div>
                )}
                <CardHeader className="pb-2 px-6">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription className="mt-1">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="px-6 pt-2 flex-1">
                  <div className="mb-6">
                    {plan.price === 'Kontakt' ? (
                      <div className="text-3xl font-bold text-foreground">Kontakt</div>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm text-muted-foreground">&euro;</span>
                        <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                        {plan.period && <span className="text-sm text-muted-foreground">{plan.period}</span>}
                      </div>
                    )}
                  </div>
                  <Separator className="mb-6" />
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-sm">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <div className="px-6 pt-2 mt-auto">
                  <Button
                    className={`w-full ${
                      plan.highlighted
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25'
                        : 'bg-muted hover:bg-muted/80 text-foreground'
                    }`}
                    onClick={onAuth}
                  >
                    {plan.cta}
                    {plan.highlighted && <ChevronRight className="ml-1 h-4 w-4" />}
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ─── Section: Testimonials ──────────────────────────────────────────

function TestimonialsSection() {
  return (
    <section className="py-20 sm:py-28 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={stagger}
          className="mx-auto max-w-2xl text-center mb-16"
        >
          <motion.p variants={fadeInUp} className="text-sm font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Utisci klijenata
          </motion.p>
          <motion.h2 variants={fadeInUp} className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Veruju nam hiljade kompanija
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={stagger}
          className="grid gap-6 md:grid-cols-3"
        >
          {testimonials.map((testimonial, i) => (
            <motion.div key={testimonial.name} variants={fadeInUp} custom={i}>
              <Card className="h-full border-border/50 bg-card/50 py-6 gap-0">
                <CardContent className="px-6 pt-0">
                  {/* Stars */}
                  <div className="mb-4 flex gap-0.5">
                    {Array.from({ length: testimonial.rating }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  {/* Quote */}
                  <p className="text-sm leading-relaxed text-muted-foreground mb-6">
                    &ldquo;{testimonial.content}&rdquo;
                  </p>
                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 text-sm font-semibold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">{testimonial.name}</div>
                      <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ─── Section: CTA ───────────────────────────────────────────────────

function CTASection({ onAuth }: { onAuth: () => void }) {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={scaleIn}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-600 to-emerald-700 dark:from-emerald-800 dark:via-emerald-700 dark:to-emerald-900 px-6 py-16 sm:px-12 sm:py-20 text-center"
        >
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 h-64 w-64 rounded-full bg-white/5 blur-2xl" />
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 h-48 w-48 rounded-full bg-white/5 blur-2xl" />

          <div className="relative z-10 mx-auto max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Spremni da transformišete vaše poslovanje?
            </h2>
            <p className="mt-4 text-lg text-emerald-100">
              Pridružite se hiljadama kompanija koje već koriste Reflection Business za efikasnije poslovanje.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                className="h-12 px-8 text-base bg-white text-emerald-700 hover:bg-emerald-50 shadow-lg shadow-black/10 transition-all"
                onClick={onAuth}
              >
                Započni besplatno
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 text-base border-white/30 text-white hover:bg-white/10 hover:text-white"
              >
                Kontaktirajte nas
              </Button>
            </div>
            <p className="mt-4 text-sm text-emerald-200">
              Besplatno za uvek • Bez kreditne kartice • Postavka za 2 minuta
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ─── Section: Footer ────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <Building2 className="h-4 w-4" />
              </div>
              <span className="text-base font-bold tracking-tight text-foreground">
                Reflection<span className="text-emerald-600 dark:text-emerald-400">Business</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Sve-u-jednom ERP platforma za efikasnije poslovanje vaše kompanije.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-foreground mb-3">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <button className="text-sm text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Reflection Business. Sva prava zadržana.
          </p>
          <div className="flex items-center gap-4">
            <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Uslovi korišćenja
            </button>
            <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Privatnost
            </button>
            <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Podrška
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}

// ─── Main Landing Page ─────────────────────────────────────────────

export function LandingPage() {
  const [showAuth, setShowAuth] = useState(false)

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  if (showAuth) {
    return <AuthPage />
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar onAuth={() => setShowAuth(true)} onScrollTo={scrollToSection} />
      <main className="flex-1">
        <HeroSection onAuth={() => setShowAuth(true)} />
        <FeaturesSection />
        <HowItWorksSection />
        <IndustriesSection />
        <PricingSection onAuth={() => setShowAuth(true)} />
        <TestimonialsSection />
        <CTASection onAuth={() => setShowAuth(true)} />
      </main>
      <Footer />
    </div>
  )
}
