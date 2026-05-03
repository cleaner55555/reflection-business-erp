import React from 'react'
import { Dashboard } from '@/components/modules/Dashboard'
import { Finansije } from '@/components/modules/Finance'
import { Fakture } from '@/components/modules/Invoices'
import { Magacin } from '@/components/modules/Inventory'
import { Partneri } from '@/components/modules/Contacts'
import { Nabavka } from '@/components/modules/Procurement'
import { Izvestaji } from '@/components/modules/Reports'
import { CRM } from '@/components/modules/CRM'
import { Kalendar } from '@/components/modules/Calendar'
import { Zaposleni } from '@/components/modules/Employees'
import { Projekti } from '@/components/modules/Projects'
import { Sredstva } from '@/components/modules/Assets'
import { Dokumenta } from '@/components/modules/Documents'
import { Knjigovodstvo } from '@/components/modules/Accounting'
import { Protokol } from '@/components/modules/Protocol'
import { Edukacija } from '@/components/modules/Education'
import { VozniPark } from '@/components/modules/Fleet'
import { MailerLite } from '@/components/modules/EmailMarketing'
import { RentACar } from '@/components/modules/CarRental'
import { Podesavanja } from '@/components/modules/Settings'
import { Integracije } from '@/components/modules/Integracije'
import { BankSync } from '@/components/modules/BankSync'
import { AIAssistant } from '@/components/modules/AIAssistant'
import { Zakoni } from '@/components/modules/Zakoni'
import { Maloprodaja } from '@/components/modules/Retail'
import { Shipping } from '@/components/modules/Shipping'
import { Marketplace } from '@/components/modules/Marketplace'
import { Ponude } from '@/components/modules/Offers'
import { Pretplate } from '@/components/modules/Subscriptions'
import { Troškovi } from '@/components/modules/Expenses'
import { Potpisi } from '@/components/modules/Signatures'
import { Proizvodnja } from '@/components/modules/Manufacturing'
import { Kvalitet } from '@/components/modules/Quality'
import { Održavanje } from '@/components/modules/Maintenance'
import { Regrutacija } from '@/components/modules/Recruitment'
import { Odsustva } from '@/components/modules/Leave'
import { Preporuke } from '@/components/modules/Referrals'
import { Podrška } from '@/components/modules/Support'
import { TerenskiServis } from '@/components/modules/FieldService'
import { Zakazivanja } from '@/components/modules/Appointments'
import { Planer } from '@/components/modules/Scheduler'
import { DruštveneMreže } from '@/components/modules/SocialMedia'
import { SmsMarketing } from '@/components/modules/SmsMarketing'
import { Događaji } from '@/components/modules/Events'
import { MktAutomatizacija } from '@/components/modules/MarketingAutomation'
import { Ankete } from '@/components/modules/Surveys'
import { Čet } from '@/components/modules/Chat'
import { BazaZnanja } from '@/components/modules/KnowledgeBase'
import { WebsiteBuilder } from '@/components/modules/WebsiteBuilder'
import { BlogModul } from '@/components/modules/Blog'
import { VoIP } from '@/components/modules/VoIP'
import { IoT } from '@/components/modules/IoT'
import { Messaging } from '@/components/modules/Messaging'
import { Forum } from '@/components/modules/Forum'
import { PLM } from '@/components/modules/PLM'
import { ECommerce } from '@/components/modules/ECommerce'
import { Spreadsheet } from '@/components/modules/Spreadsheet'
import { Beleške } from '@/components/modules/Notes'
import { Odobrenja } from '@/components/modules/Approvals'
import { Veštine } from '@/components/modules/Skills'
import { Ugovori } from '@/components/modules/Contracts'
import { Ocene } from '@/components/modules/Ratings'
import { Gamifikacija } from '@/components/modules/Gamification'
import { Reklamacije } from '@/components/modules/Complaints'
import { Natečaji } from '@/components/modules/Tenders'
import { Garancije } from '@/components/modules/Warranty'
import { Servis } from '@/components/modules/ServiceCenter'
import { Usklađenost } from '@/components/modules/Compliance'
import { ProgramLojalnosti } from '@/components/modules/Loyalty'
import { PlanerRadneSile } from '@/components/modules/WorkforcePlanner'
import { Posetioci } from '@/components/modules/Visitors'
import { Predlozi } from '@/components/modules/Suggestions'
import { Taksacija } from '@/components/modules/Valuation'
import { FondZdravlja } from '@/components/modules/HealthFund'
import { Geolokacija } from '@/components/modules/Geolocation'
import { Kamere } from '@/components/modules/Cameras'
import { MenadzerNabavke } from '@/components/modules/ProcurementManager'
import { CMS } from '@/components/modules/CMS'
import { Obaveze } from '@/components/modules/Homework'
import { Prijave } from '@/components/modules/Enrollment'
import { Raspored } from '@/components/modules/Timetable'
import { Biblioteka } from '@/components/modules/Library'
import { Ucionica } from '@/components/modules/Classroom'
import { Skolarina } from '@/components/modules/Tuition'
import { Pacijenti } from '@/components/modules/Patients'
import { Kartoni } from '@/components/modules/MedicalRecords'
import { Recepti } from '@/components/modules/Prescriptions'
import { Laboratorija } from '@/components/modules/Lab'
import { Rezervacije } from '@/components/modules/Reservations'
import { Jelovnik } from '@/components/modules/Menu'
import { Kuhinja } from '@/components/modules/Kitchen'
import { Narudzbe } from '@/components/modules/Orders'
import { DostavaModul } from '@/components/modules/Delivery'
import { Gradiliste } from '@/components/modules/ConstructionSite'
import { Projektovanje } from '@/components/modules/Blueprints'
import { Subodradaci } from '@/components/modules/Subcontractors'
import { Merenja } from '@/components/modules/Measurements'
import { Bezbednost } from '@/components/modules/Safety'
import { Rute } from '@/components/modules/Routes'
import { UtovarIstovar } from '@/components/modules/LoadingDock'
import { CarinskiDokument } from '@/components/modules/CustomsDocs'
import { Kamioni } from '@/components/modules/Trucks'
import { Pakovanje } from '@/components/modules/Packaging'
import { Nekretnine } from '@/components/modules/Property'
import { Iznajmljivanje } from '@/components/modules/Rentals'
import { PreglediNekretnine } from '@/components/modules/PropertyViewings'
import { Komunalije } from '@/components/modules/Utilities'
import { RadniNalozi } from '@/components/modules/WorkOrders'
import { Normativ } from '@/components/modules/Standards'
import { Etikete } from '@/components/modules/Labels'
import { Barkod } from '@/components/modules/Barcode'
import { Cenovnici } from '@/components/modules/PriceLists'
import { Kuponi } from '@/components/modules/Coupons'
import { Recenzije } from '@/components/modules/Reviews'
import { SEO } from '@/components/modules/SEO'
import { Naplate } from '@/components/modules/Payments'
import { Povrat } from '@/components/modules/Returns'
import { Blagajna } from '@/components/modules/CashRegister'
import { VremenskiTrag } from '@/components/modules/TimeTracking'
import { FakturisanjeVremena } from '@/components/modules/TimeBilling'
import { KlijentskiPortal } from '@/components/modules/ClientPortal'
import { Automatizacija } from '@/components/modules/Automation'
import { Poslovnice } from '@/components/modules/Stores'
import { Backup } from '@/components/modules/Backup'
import { KafeRestoran } from '@/components/modules/Restaurant'

export const moduleComponents: Record<string, React.ComponentType> = {
  dashboard: Dashboard,
  finansije: Finansije,
  fakture: Fakture,
  magacin: Magacin,
  partneri: Partneri,
  nabavka: Nabavka,
  crm: CRM,
  kalendar: Kalendar,
  zaposleni: Zaposleni,
  projekti: Projekti,
  sredstva: Sredstva,
  dokumenta: Dokumenta,
  knjigovodstvo: Knjigovodstvo,
  protokol: Protokol,
  edukacija: Edukacija,
  'vozni-park': VozniPark,
  'kafe-restoran': KafeRestoran,
  'email-marketing': MailerLite,
  'rent-a-car': RentACar,
  izvestaji: Izvestaji,
  podesavanja: Podesavanja,
  integracije: Integracije,
  'bank-sync': BankSync,
  zakoni: Zakoni,
  pos: Maloprodaja,
  shipping: Shipping,
  marketplace: Marketplace,
  ponude: Ponude,
  pretplate: Pretplate,
  troskovi: Troškovi,
  potpisi: Potpisi,
  proizvodnja: Proizvodnja,
  kvalitet: Kvalitet,
  odrzavanje: Održavanje,
  regrutacija: Regrutacija,
  odsustva: Odsustva,
  preporuke: Preporuke,
  podrska: Podrška,
  'terenski-servis': TerenskiServis,
  zakazivanja: Zakazivanja,
  planer: Planer,
  'drustvene-mreze': DruštveneMreže,
  'sms-marketing': SmsMarketing,
  dogadjaji: Događaji,
  'mkt-automatizacija': MktAutomatizacija,
  ankete: Ankete,
  chet: Čet,
  'baza-znanja': BazaZnanja,
  website: WebsiteBuilder,
  blog: BlogModul,
  voip: VoIP,
  iot: IoT,
  whatsapp: Messaging,
  forum: Forum,
  plm: PLM,
  ecommerce: ECommerce,
  spreadsheet: Spreadsheet,
  beleske: Beleške,
  odobrenja: Odobrenja,
  vestine: Veštine,
  ugovori: Ugovori,
  ocene: Ocene,
  gamifikacija: Gamifikacija,
  reklamacije: Reklamacije,
  'natečaji': Natečaji,
  garancije: Garancije,
  servis: Servis,
  uskladenost: Usklađenost,
  'program-lojalnosti': ProgramLojalnosti,
  'planer-radne-sile': PlanerRadneSile,
  posetioci: Posetioci,
  predlozi: Predlozi,
  taksacija: Taksacija,
  'fond-zdravlja': FondZdravlja,
  geolokacija: Geolokacija,
  kamere: Kamere,
  'menadzer-nabavke': MenadzerNabavke,
  cms: CMS,
  obaveze: Obaveze,
  prijave: Prijave,
  raspored: Raspored,
  biblioteka: Biblioteka,
  ucionica: Ucionica,
  skolarina: Skolarina,
  pacijenti: Pacijenti,
  kartoni: Kartoni,
  recepti: Recepti,
  laboratorija: Laboratorija,
  rezervacije: Rezervacije,
  jelovnik: Jelovnik,
  kuhinja: Kuhinja,
  narudzbe: Narudzbe,
  dostava: DostavaModul,
  gradiliste: Gradiliste,
  projektovanje: Projektovanje,
  subodradaci: Subodradaci,
  merenja: Merenja,
  bezbednost: Bezbednost,
  rute: Rute,
  'utovar-istovar': UtovarIstovar,
  'carinski-dokument': CarinskiDokument,
  kamioni: Kamioni,
  pakovanje: Pakovanje,
  nekretnine: Nekretnine,
  iznajmljivanje: Iznajmljivanje,
  'pregledi-nekretnine': PreglediNekretnine,
  komunalije: Komunalije,
  'radni-nalozi': RadniNalozi,
  normativ: Normativ,
  etikete: Etikete,
  barkod: Barkod,
  cenovnici: Cenovnici,
  kuponi: Kuponi,
  recenzije: Recenzije,
  seo: SEO,
  naplate: Naplate,
  povrat: Povrat,
  blagajna: Blagajna,
  'vremenski-trag': VremenskiTrag,
  'fakturisanje-vremena': FakturisanjeVremena,
  'klijentski-portal': KlijentskiPortal,
  automatizacija: Automatizacija,
  poslovnice: Poslovnice,
  backup: Backup,
}
