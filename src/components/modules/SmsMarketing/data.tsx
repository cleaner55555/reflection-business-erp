import { Card } from '@/components/ui/card'
import { useAppStore } from '@/lib/store'
// eslint-disable-next-line react-hooks/rules-of-hooks
export const { activeCompanyId } = useAppStore()

export const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: 'Nacrt', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
  scheduled: { label: 'Zakazano', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  sending: { label: 'Slanje...', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  sent: { label: 'Poslato', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  failed: { label: 'Greška', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  delivered: { label: 'Isporučeno', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
}

export const TEMPLATE_CATEGORIES = [
  { value: 'marketing', label: 'Marketing' },
  { value: 'transactional', label: 'Transakciona' },
  { value: 'notification', label: 'Obaveštenje' },
  { value: 'promotional', label: 'Promocija' },
  { value: 'otp', label: 'OTP/Jednokratna šifra' },
  { value: 'reminder', label: 'Podsetnik' },
]

export const CONTACT_GROUPS = ['Svi klijenti', 'VIP', 'Newsletter', 'Lead-ovi', 'Neaktivni', 'Zaposleni', 'Partners']

export const CONTACT_STATUS: Record<string, { label: string; color: string }> = {
  active: { label: 'Aktivan', color: 'bg-green-100 text-green-700' },
  inactive: { label: 'Neaktivan', color: 'bg-gray-100 text-gray-600' },
  unsubscribed: { label: 'Odjavljen', color: 'bg-red-100 text-red-700' },
}

export const SMS_MAX_CHARS = 160;

export const SMS_UNICODE_MAX = 70;

export const DEMO_CAMPAIGNS: SmsCampaign[] = [
  { id: 'sc1', name: 'Zimska rasprodaja', content: 'POZOVNA ZIMSKA RASPRODAJA! -30% na sve zimske artikle. Ponuda važi do 31.01.2025. Koristite kod: ZIMA30 na sajtu. Odustanak: STOP', category: 'promotional', recipientCount: 2500, sentCount: 2500, deliveredCount: 2380, failedCount: 120, replyCount: 85, status: 'delivered', scheduledDate: '2025-01-15', sentDate: '2025-01-15', costPerSms: 3.5, totalCost: 8750, senderId: 'REFLECTION', tags: ['zima', 'akcija'], createdAt: '2025-01-10T10:00:00Z', updatedAt: '2025-01-15T10:30:00Z' },
  { id: 'sc2', name: 'Podsetnik plaćanja', content: 'Postovani, podsecamo vas da faktura br. {faktura} dospeva {datum}. Iznos: {iznos} RSD. Placanje: racun {racun}. Hvala!', category: 'transactional', recipientCount: 45, sentCount: 45, deliveredCount: 44, failedCount: 1, replyCount: 3, status: 'delivered', scheduledDate: '2025-01-20', sentDate: '2025-01-20', costPerSms: 3.5, totalCost: 157.5, senderId: 'REFLECTION', tags: ['faktura'], createdAt: '2025-01-18T10:00:00Z', updatedAt: '2025-01-20T09:00:00Z' },
  { id: 'sc3', name: 'Novi proizvodi', content: 'Novi asortiman je stigao! Pogledajte najnovije proizvode na sajtu. Besplatna dostava za porudzbine pre 5000 RSD. Sajt: www.shop.example.rs', category: 'marketing', recipientCount: 1200, sentCount: 1200, deliveredCount: 1150, failedCount: 50, replyCount: 42, status: 'delivered', scheduledDate: '2025-01-22', sentDate: '2025-01-22', costPerSms: 3.5, totalCost: 4200, senderId: 'REFLECTION', tags: ['novosti'], createdAt: '2025-01-21T10:00:00Z', updatedAt: '2025-01-22T11:00:00Z' },
  { id: 'sc4', name: 'Valentinska ponuda', content: 'VALENTINSKA PONUDA -20% za sve parove! Poklonite vašoj voljenoj nešto posebno. Ponuda važi do 14.02.2025. KOD: LJOV2025', category: 'promotional', recipientCount: 3000, sentCount: 0, deliveredCount: 0, failedCount: 0, replyCount: 0, status: 'scheduled', scheduledDate: '2025-02-10', sentDate: null, costPerSms: 3.5, totalCost: 0, senderId: 'REFLECTION', tags: ['ljubav', 'akcija'], createdAt: '2025-01-25T10:00:00Z', updatedAt: '2025-01-25T10:00:00Z' },
  { id: 'sc5', name: 'OTP verifikacija', content: 'Vas verifikacioni kod je: {kod}. Vazi 5 minuta. Ne delite ga.', category: 'otp', recipientCount: 1, sentCount: 1, deliveredCount: 1, failedCount: 0, replyCount: 0, status: 'delivered', scheduledDate: null, sentDate: null, costPerSms: 3.5, totalCost: 3.5, senderId: 'OTP', tags: ['sigurnost'], createdAt: '2025-01-28T10:00:00Z', updatedAt: '2025-01-28T10:00:00Z' },
]

export const DEMO_TEMPLATES: SmsTemplate[] = [
  { id: 'st1', name: 'Dobrodošlica', category: 'marketing', body: 'Dobrodosli u Reflection! Vas nalog je kreiran. Posetite nas na www.shop.example.rs', variables: [], isDefault: false, usedCount: 456, createdAt: '2024-01-01' },
  { id: 'st2', name: 'Potvrda narudžbe', category: 'transactional', body: 'Vasa narudzba {broj} je zaprimljena! Iznos: {iznos} RSD. Stice za {dostava} radnih dana.', variables: ['broj', 'iznos', 'dostava'], isDefault: true, usedCount: 1230, createdAt: '2024-01-15' },
  { id: 'st3', name: 'Status isporuke', category: 'notification', body: 'Vasa posiljka {broj} je {status}. Pratite na: {link}', variables: ['broj', 'status', 'link'], isDefault: true, usedCount: 890, createdAt: '2024-02-01' },
  { id: 'st4', name: 'Podsetnik plaćanja', category: 'reminder', body: 'Podsecamo vas da faktura br. {faktura} dospeva {datum}. Iznos: {iznos} RSD.', variables: ['faktura', 'datum', 'iznos'], isDefault: true, usedCount: 567, createdAt: '2024-03-01' },
  { id: 'st5', name: 'OTP', category: 'otp', body: 'Vas kod je: {kod}. Vazi {vreme} minuta.', variables: ['kod', 'vreme'], isDefault: true, usedCount: 3450, createdAt: '2024-04-01' },
  { id: 'st6', name: 'Anketa zadovoljstva', category: 'marketing', body: 'Kako ste zadovoljni nasom uslugom? Ocenite 1-5 na: {link}', variables: ['link'], isDefault: false, usedCount: 234, createdAt: '2024-05-01' },
]

export const DEMO_CONTACTS: SmsContact[] = [
  { id: 'sc1', name: 'Jovan Petrovic', phone: '+381631234567', groups: ['VIP'], status: 'active', totalReceived: 12, totalSent: 8, lastActivity: '2025-01-28T10:00:00Z', createdAt: '2024-01-15' },
  { id: 'sc2', name: 'Ana Stankovic', phone: '+381647890123', groups: ['Newsletter'], status: 'active', totalReceived: 5, totalSent: 15, lastActivity: '2025-01-25T14:00:00Z', createdAt: '2024-02-20' },
  { id: 'sc3', name: 'Marko Nikolic', phone: '+381651112233', groups: ['Lead-ovi'], status: 'active', totalReceived: 3, totalSent: 4, lastActivity: '2025-01-20T09:00:00Z', createdAt: '2024-06-10' },
  { id: 'sc4', name: 'Milica Jovanovic', phone: '+381605554444', groups: ['Svi klijenti', 'VIP'], status: 'active', totalReceived: 20, totalSent: 25, lastActivity: '2025-01-28T16:00:00Z', createdAt: '2024-01-01' },
  { id: 'sc5', name: 'Nikola Dordevic', phone: '+381623334444', groups: ['Svi klijenti'], status: 'inactive', totalReceived: 2, totalSent: 3, lastActivity: '2024-11-15T10:00:00Z', createdAt: '2024-03-05' },
  { id: 'sc6', name: 'Jelena Milic', phone: '+381649998887', groups: ['Neaktivni'], status: 'unsubscribed', totalReceived: 0, totalSent: 5, lastActivity: '2024-10-01T10:00:00Z', createdAt: '2024-04-10' },
]

export const DEMO_LOGS: SmsLog[] = [
  { id: 'l1', phone: '+381631234567', contactName: 'Jovan Petrovic', direction: 'outbound', content: 'ZIMSKA RASPRODAJA! -30% na sve zimske artikle. KOD: ZIMA30', status: 'delivered', campaignId: 'sc1', cost: 3.5, createdAt: '2025-01-15T10:05:00Z' },
  { id: 'l2', phone: '+381647890123', contactName: 'Ana Stankovic', direction: 'outbound', content: 'ZIMSKA RASPRODAJA! -30% na sve zimske artikle. KOD: ZIMA30', status: 'delivered', campaignId: 'sc1', cost: 3.5, createdAt: '2025-01-15T10:05:01Z' },
  { id: 'l3', phone: '+381651112233', contactName: 'Marko Nikolic', direction: 'inbound', content: 'DA', status: 'received', campaignId: null, cost: 0, createdAt: '2025-01-15T10:10:00Z' },
  { id: 'l4', phone: '+381605554444', contactName: 'Milica Jovanovic', direction: 'outbound', content: 'Novi asortiman je stigao! Pogledajte najnovije proizvode.', status: 'delivered', campaignId: 'sc3', cost: 3.5, createdAt: '2025-01-22T11:00:00Z' },
  { id: 'l5', phone: '+381623334444', contactName: 'Nikola Dordevic', direction: 'outbound', content: 'Novi asortiman je stigao!', status: 'failed', campaignId: 'sc3', cost: 0, createdAt: '2025-01-22T11:00:01Z' },
  { id: 'l6', phone: '+381649998887', contactName: 'Jelena Milic', direction: 'inbound', content: 'STOP', status: 'received', campaignId: null, cost: 0, createdAt: '2024-10-01T10:00:00Z' },
]

export const DEMO_KEYWORDS: SmsKeyword[] = [
  { id: 'k1', keyword: 'INFO', response: 'Reflection Business - www.shop.example.rs\nTel: +381 11 123 4567\nRadno vreme: Pon-Pet 9-17h', autoReply: true, forwardTo: null, matchCount: 234, enabled: true, createdAt: '2024-01-01' },
  { id: 'k2', keyword: 'STOP', response: 'Odjavili ste se sa primanja SMS poruka. Za ponovnu prijavu posaljite START.', autoReply: true, forwardTo: null, matchCount: 45, enabled: true, createdAt: '2024-01-01' },
  { id: 'k3', keyword: 'START', response: 'Dobrodosli nazad! Od sada cete ponovo primalati nase SMS poruke.', autoReply: true, forwardTo: null, matchCount: 12, enabled: true, createdAt: '2024-01-01' },
  { id: 'k4', keyword: 'CENE', response: 'Nase cene su dostupne na www.shop.example.rs/cenovnik ili nas pozovite na +381 11 123 4567', autoReply: true, forwardTo: null, matchCount: 89, enabled: true, createdAt: '2024-02-15' },
  { id: 'k5', keyword: 'DA', response: '', autoReply: false, forwardTo: 'marketing@example.rs', matchCount: 156, enabled: true, createdAt: '2024-03-01' },
  { id: 'k6', keyword: 'NE', response: '', autoReply: false, forwardTo: null, matchCount: 34, enabled: false, createdAt: '2024-03-01' },
]

export const KpiCard = ({ label, value, icon: Icon, sub, color, bg }: { label: string; value: string | number; icon: React.ElementType; sub?: string; color?: string; bg?: string }) => (
  <Card className="p-4">
    <div className="flex items-start justify-between mb-2">
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      <div className={`p-1.5 rounded-lg ${bg || 'bg-muted'}`}><Icon className={`h-4 w-4 ${color || 'text-muted-foreground'}`} /></div>
    </div>
    <p className="text-2xl font-bold">{value}</p>
    {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
  </Card>
);

// useAppStore already called at top of file
