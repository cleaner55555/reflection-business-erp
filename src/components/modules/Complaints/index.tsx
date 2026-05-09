 
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import {
  Plus, Search, Eye, Trash2, Edit3, RefreshCw, Filter,
  AlertTriangle, CheckCircle2, Clock, XCircle, MessageSquare,
  FileText, TrendingDown, TrendingUp, ArrowRight, CalendarDays,
  Users, Package, CreditCard, RotateCcw, Truck, Shield,
  ChevronRight, ChevronDown, BarChart3, PieChart, Star,
  Send, Camera, Paperclip, X, Copy, Printer
} from 'lucide-react'
import { formatDate } from '@/lib/helpers'
import { toast } from 'sonner'

// ============ TYPES ============

interface Complaint {
  id: string
  number: string
  partnerName: string
  partnerEmail: string
  partnerPhone: string
  productCode: string
  productName: string
  batchNumber: string
  category: string
  priority: string
  status: string
  resolutionType: string
  subject: string
  description: string
  customerNote: string
  internalNote: string
  reportedBy: string
  assignedTo: string
  requestedResolution: string
  amountRequested: number
  amountApproved: number
  currency: string
  deadline: string
  resolvedAt: string | null
  createdAt: string
  updatedAt: string
  timeline: ComplaintEvent[]
  attachments: ComplaintAttachment[]
  qualityScore: number
}

interface ComplaintEvent {
  id: string
  type: string
  description: string
  performedBy: string
  timestamp: string
}

interface ComplaintAttachment {
  id: string
  fileName: string
  fileType: string
  fileSize: number
  uploadedAt: string
}

interface ComplaintStats {
  total: number
  new: number
  inProgress: number
  resolved: number
  rejected: number
  overdueCount: number
  avgResolutionDays: number
  avgSatisfaction: number
  totalAmountRequested: number
  totalAmountApproved: number
  byCategory: Array<{ category: string; count: number; label: string; amountRequested: number; amountApproved: number }>
  byPriority: Array<{ priority: string; count: number }>
  byResolution: Array<{ resolution: string; count: number; label: string }>
  byMonth: Array<{ month: string; opened: number; resolved: number; rejected: number }>
  topProducts: Array<{ product: string; count: number; percentage: number }>
  topPartners: Array<{ partner: string; count: number; amount: number }>
  satisfactionTrend: Array<{ month: string; score: number }>
}

// ============ CONFIG ============

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  new: { label: 'Nova', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: <AlertTriangle className="h-3.5 w-3.5" /> },
  acknowledged: { label: 'Priznata', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400', icon: <Clock className="h-3.5 w-3.5" /> },
  investigating: { label: 'U istrazi', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: <Search className="h-3.5 w-3.5" /> },
  waiting_supplier: { label: 'Čeka dobavljača', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', icon: <Truck className="h-3.5 w-3.5" /> },
  waiting_customer: { label: 'Čeka kupca', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', icon: <Users className="h-3.5 w-3.5" /> },
  resolved: { label: 'Rešena', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  rejected: { label: 'Odbijena', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: <XCircle className="h-3.5 w-3.5" /> },
  cancelled: { label: 'Otkazana', color: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400', icon: <X className="h-3.5 w-3.5" /> },
}

const CATEGORY_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  defective: { label: 'Defektan proizvod', color: 'bg-red-50 text-red-700', icon: '🔴' },
  wrong_item: { label: 'Pogrešan artikal', color: 'bg-orange-50 text-orange-700', icon: '🟠' },
  damaged: { label: 'Oštećeno pri transportu', color: 'bg-amber-50 text-amber-700', icon: '📦' },
  missing: { label: 'Nedostaje iz pošiljke', color: 'bg-blue-50 text-blue-700', icon: '❓' },
  quantity: { label: 'Pogrešna količina', color: 'bg-cyan-50 text-cyan-700', icon: '🔢' },
  quality: { label: 'Nekvalitetno', color: 'bg-purple-50 text-purple-700', icon: '⭐' },
  not_as_described: { label: 'Ne odgovara opisu', color: 'bg-pink-50 text-pink-700', icon: '📝' },
  late_delivery: { label: 'Kasna isporuka', color: 'bg-indigo-50 text-indigo-700', icon: '🕐' },
  overcharged: { label: 'Previše naplaćeno', color: 'bg-rose-50 text-rose-700', icon: '💰' },
  service: { label: 'Usluga', color: 'bg-teal-50 text-teal-700', icon: '🔧' },
  other: { label: 'Ostalo', color: 'bg-gray-50 text-gray-700', icon: '📋' },
}

const PRIORITY_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  low: { label: 'Nizak', color: 'bg-gray-100 text-gray-700', dot: 'bg-gray-400' },
  medium: { label: 'Srednji', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-400' },
  high: { label: 'Visok', color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
  critical: { label: 'Kritičan', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
}

const RESOLUTION_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  refund: { label: 'Povrat novca', color: 'bg-green-50 text-green-700', icon: '💰' },
  replacement: { label: 'Zamena proizvoda', color: 'bg-blue-50 text-blue-700', icon: '🔄' },
  repair: { label: 'Popravka', color: 'bg-amber-50 text-amber-700', icon: '🔧' },
  discount: { label: 'Popust na sledeću kupovinu', color: 'bg-purple-50 text-purple-700', icon: '🏷️' },
  credit_note: { label: 'Knjižno odobrenje', color: 'bg-cyan-50 text-cyan-700', icon: '📄' },
  apology: { label: 'Izvinjenje / kompenzacija', color: 'bg-pink-50 text-pink-700', icon: '💝' },
  rejected: { label: 'Odbijena reklamacija', color: 'bg-red-50 text-red-700', icon: '❌' },
  no_action: { label: 'Bez akcije', color: 'bg-gray-50 text-gray-700', icon: '➖' },
}

const REQUESTED_RESOLUTION_CONFIG: Record<string, string> = {
  refund: 'Povrat novca',
  replacement: 'Zamena proizvoda',
  repair: 'Popravka',
  discount: 'Popust',
  credit_note: 'Knjižno odobrenje',
  info: 'Samo informacija',
  other: 'Ostalo',
}

// ============ MOCK DATA ============

const mockComplaints: Complaint[] = [
  {
    id: 'cmp-1', number: 'REK-2025-001', partnerName: 'Jovan Petrović', partnerEmail: 'jovan@email.com', partnerPhone: '+381631234567',
    productCode: 'ART-001', productName: 'Samsung Galaxy S24 Ultra', batchNumber: 'BT-2025-001',
    category: 'defective', priority: 'high', status: 'investigating', resolutionType: '', subject: 'Ne radi kamera',
    description: 'Kamera na zadnjoj strani ne fokusira pravilno. Fotografije su zamagljene bez obzira na uslove osvetljenja. Problem je prisutan od prvog dana korišćenja.',
    customerNote: '', internalNote: 'Proveriti sa servisom da li je hardverski problem.',
    reportedBy: 'Jovan Petrović', assignedTo: 'Ana Stanković', requestedResolution: 'replacement',
    amountRequested: 0, amountApproved: 0, currency: 'RSD', deadline: '2025-02-01',
    resolvedAt: null, createdAt: '2025-01-15T10:00:00', updatedAt: '2025-01-17T14:00:00', qualityScore: 0,
    timeline: [
      { id: 'e1', type: 'created', description: 'Reklamacija kreirana', performedBy: 'Sistem', timestamp: '2025-01-15T10:00:00' },
      { id: 'e2', type: 'status_change', description: 'Status: Nova → Priznata', performedBy: 'Ana Stanković', timestamp: '2025-01-15T14:30:00' },
      { id: 'e3', type: 'status_change', description: 'Status: Priznata → U istrazi', performedBy: 'Ana Stanković', timestamp: '2025-01-17T14:00:00' },
      { id: 'e4', type: 'note', description: 'Proveriti sa servisom da li je hardverski problem', performedBy: 'Ana Stanković', timestamp: '2025-01-17T14:00:00' },
    ],
    attachments: [
      { id: 'a1', fileName: 'foto-kamera.jpg', fileType: 'image/jpeg', fileSize: 2450000, uploadedAt: '2025-01-15T10:05:00' },
    ],
  },
  {
    id: 'cmp-2', number: 'REK-2025-002', partnerName: 'D.o.o. TechPro', partnerEmail: 'office@techpro.rs', partnerPhone: '+38111234567',
    productCode: 'ART-045', productName: 'Dell UltraSharp 27" Monitor', batchNumber: 'BT-2024-156',
    category: 'damaged', priority: 'medium', status: 'waiting_supplier', resolutionType: '', subject: 'Pukao ekran pri transportu',
    description: 'Monitor je stigao sa puknutim ekranom. Ambalaža je očigledno bila nedovoljno zaštićena. Kutija je imala vidljiva oštećenja.',
    customerNote: 'Tražimo hitnu zamenu ili povrat novca.', internalNote: 'Kontaktirati kurira za štetu.',
    reportedBy: 'Marko Đorđević', assignedTo: 'Petar Nikolić', requestedResolution: 'replacement',
    amountRequested: 85000, amountApproved: 0, currency: 'RSD', deadline: '2025-01-30',
    resolvedAt: null, createdAt: '2025-01-10T09:00:00', updatedAt: '2025-01-16T11:00:00', qualityScore: 0,
    timeline: [
      { id: 'e5', type: 'created', description: 'Reklamacija kreirana', performedBy: 'Sistem', timestamp: '2025-01-10T09:00:00' },
      { id: 'e6', type: 'status_change', description: 'Status: Nova → Priznata', performedBy: 'Petar Nikolić', timestamp: '2025-01-10T15:00:00' },
      { id: 'e7', type: 'status_change', description: 'Status: Priznata → Čeka dobavljača', performedBy: 'Petar Nikolić', timestamp: '2025-01-16T11:00:00' },
    ],
    attachments: [],
  },
  {
    id: 'cmp-3', number: 'REK-2025-003', partnerName: 'Milica Jovanović', partnerEmail: 'milica@gmail.com', partnerPhone: '+381648765432',
    productCode: 'ART-078', productName: 'Nike Air Max 90', batchNumber: 'BT-2025-012',
    category: 'wrong_item', priority: 'low', status: 'resolved', resolutionType: 'replacement', subject: 'Stigla pogrešna veličina',
    description: 'Naručila sam veličinu 42, a stigla je 39. Etiketa na kutiji je ispravna ali unutra je pogrešna veličina.',
    customerNote: '', internalNote: '',
    reportedBy: 'Milica Jovanović', assignedTo: 'Ana Stanković', requestedResolution: 'replacement',
    amountRequested: 0, amountApproved: 0, currency: 'RSD', deadline: '2025-01-25',
    resolvedAt: '2025-01-18T16:00:00', createdAt: '2025-01-12T08:00:00', updatedAt: '2025-01-18T16:00:00', qualityScore: 4,
    timeline: [
      { id: 'e8', type: 'created', description: 'Reklamacija kreirana', performedBy: 'Sistem', timestamp: '2025-01-12T08:00:00' },
      { id: 'e9', type: 'status_change', description: 'Status: Nova → Priznata', performedBy: 'Ana Stanković', timestamp: '2025-01-12T12:00:00' },
      { id: 'e10', type: 'status_change', description: 'Status: Priznata → Rešena (Zamena)', performedBy: 'Ana Stanković', timestamp: '2025-01-18T16:00:00' },
    ],
    attachments: [],
  },
  {
    id: 'cmp-4', number: 'REK-2025-004', partnerName: 'B2B Solutions d.o.o.', partnerEmail: 'info@b2bsolutions.rs', partnerPhone: '+381113456789',
    productCode: 'ART-120', productName: 'HP LaserJet Pro M404dn', batchNumber: 'BT-2024-089',
    category: 'defective', priority: 'critical', status: 'new', resolutionType: '', subject: 'Stampa crne trake',
    description: 'Stampač stampa konstantnu crnu traku na svakoj stranici, bez obzira na sadržaj. Pokušano je zamena tonera ali problem ostaje. Garancija je još aktivna.',
    customerNote: 'Imamo 15 ovih stampaća u firmi — brinite se da se ne ponovi.', internalNote: '',
    reportedBy: 'Nikola Marković', assignedTo: '', requestedResolution: 'replacement',
    amountRequested: 120000, amountApproved: 0, currency: 'RSD', deadline: '2025-02-05',
    resolvedAt: null, createdAt: '2025-01-19T08:00:00', updatedAt: '2025-01-19T08:00:00', qualityScore: 0,
    timeline: [
      { id: 'e11', type: 'created', description: 'Reklamacija kreirana', performedBy: 'Sistem', timestamp: '2025-01-19T08:00:00' },
    ],
    attachments: [
      { id: 'a2', fileName: 'scan-test-page.pdf', fileType: 'application/pdf', fileSize: 890000, uploadedAt: '2025-01-19T08:02:00' },
      { id: 'a3', fileName: 'photo-defect.jpg', fileType: 'image/jpeg', fileSize: 3100000, uploadedAt: '2025-01-19T08:03:00' },
    ],
  },
  {
    id: 'cmp-5', number: 'REK-2025-005', partnerName: 'Sara Ilić', partnerEmail: 'sara.ilic@yahoo.com', partnerPhone: '+381651112233',
    productCode: 'ART-055', productName: 'KitchenAid Mixer Artisan', batchNumber: 'BT-2024-201',
    category: 'not_as_described', priority: 'medium', status: 'resolved', resolutionType: 'discount', subject: 'Boja ne odgovara slici',
    description: 'Naručila sam mixer u boji "Empire Red" (tamno crvena), a stigla je svetlo crvena/narandžasta boja. Slika na sajtu je prevarena.',
    customerNote: 'Ne želim zamenu, tražim popust od minimum 20%.', internalNote: 'Popust odobren — specijalna ponuda za zadovoljstvo.',
    reportedBy: 'Sara Ilić', assignedTo: 'Ana Stanković', requestedResolution: 'discount',
    amountRequested: 15000, amountApproved: 10000, currency: 'RSD', deadline: '2025-01-28',
    resolvedAt: '2025-01-20T10:00:00', createdAt: '2025-01-13T11:00:00', updatedAt: '2025-01-20T10:00:00', qualityScore: 3,
    timeline: [
      { id: 'e12', type: 'created', description: 'Reklamacija kreirana', performedBy: 'Sistem', timestamp: '2025-01-13T11:00:00' },
      { id: 'e13', type: 'status_change', description: 'Status: Nova → Priznata', performedBy: 'Ana Stanković', timestamp: '2025-01-13T15:00:00' },
      { id: 'e14', type: 'status_change', description: 'Status: Priznata → Rešena (Popust)', performedBy: 'Ana Stanković', timestamp: '2025-01-20T10:00:00' },
    ],
    attachments: [],
  },
  {
    id: 'cmp-6', number: 'REK-2025-006', partnerName: 'ABC Trade d.o.o.', partnerEmail: 'orders@abctrade.rs', partnerPhone: '+38111222333',
    productCode: 'ART-200', productName: 'Canon EOS R6 Mark II', batchNumber: 'BT-2025-005',
    category: 'quantity', priority: 'high', status: 'resolved', resolutionType: 'replacement', subject: 'Nedostaje 3 komada',
    description: 'Naručili smo 10 komada, a primili samo 7. Avans je plaćen za 10 komada. Potvrda narudžbenice je priložena.',
    customerNote: 'Očekujemo isporuku preostala 3 komada u roku od 48h.', internalNote: 'Greška u pakovanju — 3 komada su ostala na skladištu.',
    reportedBy: 'Ljubiša Tomić', assignedTo: 'Petar Nikolić', requestedResolution: 'replacement',
    amountRequested: 0, amountApproved: 0, currency: 'RSD', deadline: '2025-01-22',
    resolvedAt: '2025-01-21T09:00:00', createdAt: '2025-01-18T08:00:00', updatedAt: '2025-01-21T09:00:00', qualityScore: 5,
    timeline: [
      { id: 'e15', type: 'created', description: 'Reklamacija kreirana', performedBy: 'Sistem', timestamp: '2025-01-18T08:00:00' },
      { id: 'e16', type: 'status_change', description: 'Status: Nova → Rešena (Zamena)', performedBy: 'Petar Nikolić', timestamp: '2025-01-21T09:00:00' },
    ],
    attachments: [
      { id: 'a4', fileName: 'narudzbenica-2025-0045.pdf', fileType: 'application/pdf', fileSize: 156000, uploadedAt: '2025-01-18T08:01:00' },
    ],
  },
  {
    id: 'cmp-7', number: 'REK-2025-007', partnerName: 'Ivana Stojković', partnerEmail: 'ivana.s@outlook.com', partnerPhone: '+381664445566',
    productCode: 'ART-033', productName: 'Bosch Dishwasher SMS6ECI01E', batchNumber: 'BT-2024-178',
    category: 'defective', priority: 'medium', status: 'waiting_customer', resolutionType: '', subject: 'Mašina ne pere pravilno',
    description: 'Mašina za sudove ne pere pravilno — ostaju mrlje i tragovi deterdženta. Serviser je obišao i rekao da je u redu ali problem i dalje postoji.',
    customerNote: 'Serviser je bio već 2 puta — problem nije rešen. Tražim zamenu.', internalNote: 'Serviser izveštava da je mašina funkcionalna. Čekamo odgovor kupca.',
    reportedBy: 'Ivana Stojković', assignedTo: 'Ana Stanković', requestedResolution: 'replacement',
    amountRequested: 0, amountApproved: 0, currency: 'RSD', deadline: '2025-02-10',
    resolvedAt: null, createdAt: '2025-01-05T14:00:00', updatedAt: '2025-01-19T09:00:00', qualityScore: 0,
    timeline: [
      { id: 'e17', type: 'created', description: 'Reklamacija kreirana', performedBy: 'Sistem', timestamp: '2025-01-05T14:00:00' },
      { id: 'e18', type: 'status_change', description: 'Status: Nova → Priznata', performedBy: 'Ana Stanković', timestamp: '2025-01-06T10:00:00' },
      { id: 'e19', type: 'note', description: 'Serviser zakazan za 10.01.', performedBy: 'Ana Stanković', timestamp: '2025-01-07T09:00:00' },
      { id: 'e20', type: 'status_change', description: 'Status: Priznata → U istrazi', performedBy: 'Ana Stanković', timestamp: '2025-01-10T11:00:00' },
      { id: 'e21', type: 'note', description: 'Serviser izveštava: mašina funkcionalna, korisnik koristi pogrešan program', performedBy: 'Servis', timestamp: '2025-01-15T16:00:00' },
      { id: 'e22', type: 'status_change', description: 'Status: U istrazi → Čeka kupca', performedBy: 'Ana Stanković', timestamp: '2025-01-19T09:00:00' },
    ],
    attachments: [],
  },
  {
    id: 'cmp-8', number: 'REK-2025-008', partnerName: 'Gamma Corp d.o.o.', partnerEmail: 'procurement@gammacorp.rs', partnerPhone: '+381114556677',
    productCode: 'ART-310', productName: 'Cisco Meraki MR46 Access Point', batchNumber: 'BT-2024-320',
    category: 'service', priority: 'low', status: 'rejected', resolutionType: 'rejected', subject: 'Problem sa garancijom',
    description: 'Kupili smo 20 AP uređaja u avgustu 2023. Sa garancijom ne znamo da li pokriva ovaj tip kvara (Wi-Fi intermittently pada).',
    customerNote: '', internalNote: 'Garancija istekla avgust 2024. Nije pokriveno.',
    reportedBy: 'Dragan Milić', assignedTo: 'Petar Nikolić', requestedResolution: 'repair',
    amountRequested: 45000, amountApproved: 0, currency: 'RSD', deadline: '2025-01-20',
    resolvedAt: '2025-01-16T14:00:00', createdAt: '2025-01-08T13:00:00', updatedAt: '2025-01-16T14:00:00', qualityScore: 2,
    timeline: [
      { id: 'e23', type: 'created', description: 'Reklamacija kreirana', performedBy: 'Sistem', timestamp: '2025-01-08T13:00:00' },
      { id: 'e24', type: 'status_change', description: 'Status: Nova → Odbijena (Garancija istekla)', performedBy: 'Petar Nikolić', timestamp: '2025-01-16T14:00:00' },
    ],
    attachments: [],
  },
]

const mockStats: ComplaintStats = {
  total: 147, new: 12, inProgress: 28, resolved: 95, rejected: 8, overdueCount: 3,
  avgResolutionDays: 4.2, avgSatisfaction: 3.8, totalAmountRequested: 2850000, totalAmountApproved: 1920000,
  byCategory: [
    { category: 'defective', count: 42, label: 'Defektan proizvod', amountRequested: 980000, amountApproved: 720000 },
    { category: 'damaged', count: 28, label: 'Oštećeno pri transportu', amountRequested: 650000, amountApproved: 480000 },
    { category: 'wrong_item', count: 25, label: 'Pogrešan artikal', amountRequested: 320000, amountApproved: 280000 },
    { category: 'quantity', count: 18, label: 'Pogrešna količina', amountRequested: 180000, amountApproved: 140000 },
    { category: 'not_as_described', count: 15, label: 'Ne odgovara opisu', amountRequested: 450000, amountApproved: 200000 },
    { category: 'quality', count: 12, label: 'Nekvalitetno', amountRequested: 200000, amountApproved: 70000 },
    { category: 'late_delivery', count: 5, label: 'Kasna isporuka', amountRequested: 50000, amountApproved: 20000 },
    { category: 'other', count: 2, label: 'Ostalo', amountRequested: 20000, amountApproved: 10000 },
  ],
  byPriority: [
    { priority: 'low', count: 35 },
    { priority: 'medium', count: 62 },
    { priority: 'high', count: 38 },
    { priority: 'critical', count: 12 },
  ],
  byResolution: [
    { resolution: 'replacement', count: 48, label: 'Zamena' },
    { resolution: 'refund', count: 25, label: 'Povrat novca' },
    { resolution: 'discount', count: 12, label: 'Popust' },
    { resolution: 'repair', count: 7, label: 'Popravka' },
    { resolution: 'credit_note', count: 3, label: 'Knjižno odobrenje' },
    { resolution: 'rejected', count: 8, label: 'Odbijena' },
  ],
  byMonth: [
    { month: 'Avg', opened: 18, resolved: 15, rejected: 1 },
    { month: 'Sep', opened: 22, resolved: 19, rejected: 2 },
    { month: 'Okt', opened: 20, resolved: 18, rejected: 1 },
    { month: 'Nov', opened: 25, resolved: 22, rejected: 2 },
    { month: 'Dec', opened: 30, resolved: 25, rejected: 1 },
    { month: 'Jan', opened: 32, resolved: 28, rejected: 1 },
  ],
  topProducts: [
    { product: 'Samsung Galaxy S24', count: 8, percentage: 5.4 },
    { product: 'Dell Monitor 27"', count: 6, percentage: 4.1 },
    { product: 'HP LaserJet Pro', count: 5, percentage: 3.4 },
    { product: 'Canon EOS R6', count: 4, percentage: 2.7 },
    { product: 'Nike Air Max', count: 4, percentage: 2.7 },
  ],
  topPartners: [
    { partner: 'B2B Solutions d.o.o.', count: 12, amount: 450000 },
    { partner: 'ABC Trade d.o.o.', count: 9, amount: 380000 },
    { partner: 'Gamma Corp d.o.o.', count: 7, amount: 220000 },
    { partner: 'Jovan Petrović', count: 5, amount: 85000 },
    { partner: 'Milica Jovanović', count: 4, amount: 45000 },
  ],
  satisfactionTrend: [
    { month: 'Avg', score: 3.5 },
    { month: 'Sep', score: 3.7 },
    { month: 'Okt', score: 3.4 },
    { month: 'Nov', score: 3.9 },
    { month: 'Dec', score: 4.0 },
    { month: 'Jan', score: 3.8 },
  ],
}

const STATUS_FLOW = ['new', 'acknowledged', 'investigating', 'waiting_supplier', 'waiting_customer', 'resolved', 'rejected']

const formatCurrency = (val: number) => `${val.toLocaleString('sr-RS', { minimumFractionDigits: 2 })} RSD`

// ============ COMPONENT ============

export function Complaints() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [stats, setStats] = useState<ComplaintStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')

  // Dialogs
  const [detailOpen, setDetailOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [resolveOpen, setResolveOpen] = useState(false)
  const [selected, setSelected] = useState<Complaint | null>(null)
  const [noteInput, setNoteInput] = useState('')
  const [customerReplyInput, setCustomerReplyInput] = useState('')

  // Create form
  const emptyForm = {
    partnerName: '', partnerEmail: '', partnerPhone: '',
    productCode: '', productName: '', batchNumber: '',
    category: 'defective', priority: 'medium', requestedResolution: 'replacement',
    subject: '', description: '', amountRequested: '', deadline: '',
  }
  const [form, setForm] = useState(emptyForm)

  // Resolve form
  const [resolveForm, setResolveForm] = useState({ resolutionType: 'refund', amountApproved: '', internalNote: '', customerNote: '' })

  // ============ Data Loading ============

  const loadComplaints = useCallback(async () => {
    if (!activeCompanyId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/complaints?companyId=${activeCompanyId}&limit=100`)
      if (res.ok) {
        const data = await res.json()
        setComplaints(data.items?.length ? data.items : mockComplaints)
      } else {
        setComplaints(mockComplaints)
      }
    } catch {
      setComplaints(mockComplaints)
    }
    setLoading(false)
  }, [activeCompanyId])

  const loadStats = useCallback(async () => {
    if (!activeCompanyId) return
    try {
      const res = await fetch(`/api/complaints/stats?companyId=${activeCompanyId}`)
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      } else {
        setStats(mockStats)
      }
    } catch {
      setStats(mockStats)
    }
  }, [activeCompanyId])

  useEffect(() => {
    loadComplaints()
    loadStats()
  }, [activeCompanyId, loadComplaints, loadStats])

  // ============ Computed ============

  const filtered = complaints.filter((c) => {
    if (activeTab === 'active' && (c.status === 'resolved' || c.status === 'rejected' || c.status === 'cancelled')) return false
    if (activeTab === 'resolved' && c.status !== 'resolved') return false
    if (activeTab === 'rejected' && c.status !== 'rejected') return false
    if (activeTab === 'overdue' && (!c.deadline || c.status === 'resolved' || c.status === 'rejected' || new Date(c.deadline) > new Date())) return false
    if (statusFilter !== 'all' && c.status !== statusFilter) return false
    if (categoryFilter !== 'all' && c.category !== categoryFilter) return false
    if (priorityFilter !== 'all' && c.priority !== priorityFilter) return false
    if (search) {
      const s = search.toLowerCase()
      return c.number.toLowerCase().includes(s) || c.partnerName.toLowerCase().includes(s) || c.productName.toLowerCase().includes(s) || c.subject.toLowerCase().includes(s)
    }
    return true
  })

  // ============ Handlers ============

  const handleCreate = async () => {
    if (!activeCompanyId || !form.subject.trim()) return
    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: activeCompanyId,
          ...form,
          amountRequested: form.amountRequested ? parseFloat(form.amountRequested) : 0,
          status: 'new',
          timeline: [{ id: `e-${Date.now()}`, type: 'created', description: 'Reklamacija kreirana', performedBy: 'Trenutni korisnik', timestamp: new Date().toISOString() }],
        }),
      })
      if (res.ok) {
        setCreateOpen(false)
        setForm(emptyForm)
        loadComplaints()
        loadStats()
        toast.success('Reklamacija kreirana')
      }
    } catch { /* silent */ }
  }

  const handleStatusChange = async (complaint: Complaint, newStatus: string) => {
    try {
      const res = await fetch('/api/complaints', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: complaint.id,
          status: newStatus,
          event: { id: `e-${Date.now()}`, type: 'status_change', description: `Status: ${STATUS_CONFIG[complaint.status]?.label} → ${STATUS_CONFIG[newStatus]?.label}`, performedBy: 'Trenutni korisnik', timestamp: new Date().toISOString() },
        }),
      })
      if (res.ok) {
        loadComplaints()
        loadStats()
        toast.success(`Status: ${STATUS_CONFIG[newStatus]?.label}`)
      }
    } catch { /* silent */ }
  }

  const handleResolve = async () => {
    if (!selected) return
    try {
      const res = await fetch('/api/complaints', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selected.id,
          status: 'resolved',
          resolutionType: resolveForm.resolutionType,
          amountApproved: resolveForm.amountApproved ? parseFloat(resolveForm.amountApproved) : 0,
          resolvedAt: new Date().toISOString(),
          internalNote: resolveForm.internalNote,
          customerNote: resolveForm.customerNote,
          event: { id: `e-${Date.now()}`, type: 'resolved', description: `Rešena (${RESOLUTION_CONFIG[resolveForm.resolutionType]?.label})`, performedBy: 'Trenutni korisnik', timestamp: new Date().toISOString() },
        }),
      })
      if (res.ok) {
        setResolveOpen(false)
        setSelected(null)
        setDetailOpen(false)
        loadComplaints()
        loadStats()
        toast.success('Reklamacija rešena')
      }
    } catch { /* silent */ }
  }

  const handleReject = async () => {
    if (!selected) return
    try {
      const res = await fetch('/api/complaints', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selected.id,
          status: 'rejected',
          resolutionType: 'rejected',
          resolvedAt: new Date().toISOString(),
          event: { id: `e-${Date.now()}`, type: 'rejected', description: 'Odbijena', performedBy: 'Trenutni korisnik', timestamp: new Date().toISOString() },
        }),
      })
      if (res.ok) {
        setSelected(null)
        setDetailOpen(false)
        loadComplaints()
        loadStats()
        toast.success('Reklamacija odbijena')
      }
    } catch { /* silent */ }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Obrisati reklamaciju?')) return
    try {
      await fetch(`/api/complaints?id=${id}`, { method: 'DELETE' })
      loadComplaints()
      loadStats()
    } catch { /* silent */ }
  }

  const handleAddNote = () => {
    if (!selected || !noteInput.trim()) return
    const newEvent: ComplaintEvent = { id: `e-${Date.now()}`, type: 'note', description: noteInput.trim(), performedBy: 'Trenutni korisnik', timestamp: new Date().toISOString() }
    setSelected({ ...selected, timeline: [...selected.timeline, newEvent] })
    setNoteInput('')
    toast.success('Napomena dodata')
  }

  const getNextStatus = (current: string): string | null => {
    const idx = STATUS_FLOW.indexOf(current)
    return idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null
  }

  const isOverdue = (deadline: string, status: string) => deadline && status !== 'resolved' && status !== 'rejected' && status !== 'cancelled' && new Date(deadline) < new Date()

  // ============ RENDER ============

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reklamacije</h1>
          <p className="text-sm text-muted-foreground">Upravljanje reklamacijama kupaca i zaštita potrošača</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { loadComplaints(); loadStats(); }}>
            <RefreshCw className="h-4 w-4 mr-1" /> Osveži
          </Button>
          <Button size="sm" onClick={() => { setForm(emptyForm); setCreateOpen(true); }}>
            <Plus className="h-4 w-4 mr-1" /> Nova reklamacija
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-1" /> Pregled</TabsTrigger>
          <TabsTrigger value="active"><AlertTriangle className="h-4 w-4 mr-1" /> Aktivne</TabsTrigger>
          <TabsTrigger value="resolved"><CheckCircle2 className="h-4 w-4 mr-1" /> Rešene</TabsTrigger>
          <TabsTrigger value="rejected"><XCircle className="h-4 w-4 mr-1" /> Odbijene</TabsTrigger>
          <TabsTrigger value="overdue"><Clock className="h-4 w-4 mr-1" /> Prekoračene</TabsTrigger>
        </TabsList>

        {/* ─── PREGLED ─── */}
        <TabsContent value="overview" className="space-y-6">
          {!stats ? (
            <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Nove</span>
                    <AlertTriangle className="h-4 w-4 text-blue-500" />
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
                  <p className="text-xs text-muted-foreground">{stats.overdueCount} prekoračenih</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">U procesu</span>
                    <Clock className="h-4 w-4 text-amber-500" />
                  </div>
                  <p className="text-2xl font-bold text-amber-600">{stats.inProgress}</p>
                  <p className="text-xs text-muted-foreground">prosek {stats.avgResolutionDays} dana</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Rešene</span>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
                  <p className="text-xs text-muted-foreground">prosecna ocena {stats.avgSatisfaction}/5</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Odbijene</span>
                    <XCircle className="h-4 w-4 text-red-500" />
                  </div>
                  <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                  <p className="text-xs text-muted-foreground">{stats.total > 0 ? Math.round((stats.rejected / stats.total) * 100) : 0}% ukupno</p>
                </Card>
              </div>

              {/* Resolution Rate + Amounts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm">Stopa rešavanja</CardTitle></CardHeader>
                  <CardContent>
                    <Progress value={stats.total > 0 ? ((stats.resolved + stats.rejected) / stats.total) * 100 : 0} className="h-3 mb-2" />
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span className="text-green-600 font-medium">Rešene: {stats.resolved}</span>
                      <span className="text-red-600 font-medium">Odbijene: {stats.rejected}</span>
                      <span className="text-blue-600 font-medium">Aktivne: {stats.new + stats.inProgress}</span>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm">Finansijski pregled</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Zahtevano</p>
                        <p className="text-lg font-bold">{formatCurrency(stats.totalAmountRequested)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Odobreno</p>
                        <p className="text-lg font-bold text-green-600">{formatCurrency(stats.totalAmountApproved)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Ušteda</p>
                        <p className="text-lg font-bold text-primary">{formatCurrency(stats.totalAmountRequested - stats.totalAmountApproved)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Stopa odobrenja</p>
                        <p className="text-lg font-bold">{stats.totalAmountRequested > 0 ? Math.round((stats.totalAmountApproved / stats.totalAmountRequested) * 100) : 0}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* By Category */}
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">Po kategoriji</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {stats.byCategory.map((cat) => {
                    const cfg = CATEGORY_CONFIG[cat.category]
                    const maxCount = Math.max(...stats.byCategory.map((c) => c.count))
                    return (
                      <div key={cat.category} className="flex items-center gap-3">
                        <span className="text-sm w-5">{cfg?.icon}</span>
                        <span className="text-xs w-40 truncate">{cat.label}</span>
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div className="h-2 rounded-full bg-primary" style={{ width: `${(cat.count / maxCount) * 100}%` }} />
                        </div>
                        <span className="text-xs font-medium w-8 text-right">{cat.count}</span>
                        <span className="text-xs text-muted-foreground w-24 text-right">{formatCurrency(cat.amountRequested)}</span>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>

              {/* By Resolution + Monthly Trend */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm">Tipovi rešenja</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {stats.byResolution.map((r) => {
                      const cfg = RESOLUTION_CONFIG[r.resolution]
                      const maxCount = Math.max(...stats.byResolution.map((x) => x.count))
                      return (
                        <div key={r.resolution} className="flex items-center gap-3">
                          <span className="text-sm w-5">{cfg?.icon}</span>
                          <span className="text-xs w-32">{r.label}</span>
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${(r.count / maxCount) * 100}%` }} />
                          </div>
                          <span className="text-xs font-medium w-8 text-right">{r.count}</span>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm">Mesečni trend</CardTitle></CardHeader>
                  <CardContent>
                    <div className="flex items-end gap-3 h-40">
                      {stats.byMonth.map((m) => {
                        const maxVal = Math.max(...stats.byMonth.map((x) => Math.max(x.opened, x.resolved)))
                        return (
                          <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                            <div className="w-full flex gap-0.5 items-end justify-center" style={{ height: '120px' }}>
                              <div className="w-3 bg-blue-400 rounded-t" style={{ height: `${maxVal > 0 ? (m.opened / maxVal) * 100 : 0}%` }} title={`Otvorene: ${m.opened}`} />
                              <div className="w-3 bg-green-400 rounded-t" style={{ height: `${maxVal > 0 ? (m.resolved / maxVal) * 100 : 0}%` }} title={`Rešene: ${m.resolved}`} />
                              <div className="w-2 bg-red-400 rounded-t" style={{ height: `${maxVal > 0 ? (m.rejected / maxVal) * 100 : 0}%` }} title={`Odbijene: ${m.rejected}`} />
                            </div>
                            <span className="text-xs text-muted-foreground">{m.month}</span>
                          </div>
                        )
                      })}
                    </div>
                    <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><div className="w-2.5 h-2.5 bg-blue-400 rounded" /> Otvorene</span>
                      <span className="flex items-center gap-1"><div className="w-2.5 h-2.5 bg-green-400 rounded" /> Rešene</span>
                      <span className="flex items-center gap-1"><div className="w-2.5 h-2.5 bg-red-400 rounded" /> Odbijene</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Top Products + Partners */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm">Proizvodi sa najviše reklamacija</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {stats.topProducts.map((p, i) => (
                      <div key={p.product} className="flex items-center gap-3">
                        <span className="text-xs font-bold w-5 text-muted-foreground">{i + 1}.</span>
                        <span className="text-xs flex-1 truncate">{p.product}</span>
                        <Badge variant="outline" className="text-xs">{p.count}</Badge>
                        <span className="text-xs text-muted-foreground w-12 text-right">{p.percentage}%</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm">Partneri sa najviše reklamacija</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {stats.topPartners.map((p, i) => (
                      <div key={p.partner} className="flex items-center gap-3">
                        <span className="text-xs font-bold w-5 text-muted-foreground">{i + 1}.</span>
                        <span className="text-xs flex-1 truncate">{p.partner}</span>
                        <Badge variant="outline" className="text-xs">{p.count}</Badge>
                        <span className="text-xs text-muted-foreground w-24 text-right">{formatCurrency(p.amount)}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* ─── LIST TABS ─── */}
        {['active', 'resolved', 'rejected', 'overdue'].map((tabKey) => (
          <TabsContent key={tabKey} value={tabKey} className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Pretraži reklamacije..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]"><SelectValue placeholder="Svi statusi" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Svi statusi</SelectItem>
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="Sve kategorije" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Sve kategorije</SelectItem>
                  {Object.entries(CATEGORY_CONFIG).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.icon} {v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[130px]"><SelectValue placeholder="Prioritet" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Svi</SelectItem>
                  {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : filtered.length === 0 ? (
              <Card className="p-8 text-center">
                <Shield className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">Nema reklamacija</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {filtered.map((c) => {
                  const sCfg = STATUS_CONFIG[c.status]
                  const cCfg = CATEGORY_CONFIG[c.category]
                  const pCfg = PRIORITY_CONFIG[c.priority]
                  const overdue = isOverdue(c.deadline, c.status)
                  const nextSt = c.status !== 'resolved' && c.status !== 'rejected' && c.status !== 'cancelled' ? getNextStatus(c.status) : null

                  return (
                    <Card key={c.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => { setSelected(c); setDetailOpen(true); }}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-xs font-mono text-muted-foreground">{c.number}</span>
                              <Badge variant="outline" className={`text-xs shrink-0 ${sCfg?.color}`}>{sCfg?.icon} {sCfg?.label}</Badge>
                              <Badge variant="outline" className={`text-xs shrink-0 ${pCfg?.color}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${pCfg?.dot} mr-1`} />
                                {pCfg?.label}
                              </Badge>
                              {overdue && <Badge variant="destructive" className="text-xs">Prekoračeno!</Badge>}
                              {c.attachments.length > 0 && <Badge variant="secondary" className="text-xs"><Paperclip className="h-3 w-3 mr-1" />{c.attachments.length}</Badge>}
                            </div>
                            <h3 className="text-sm font-medium truncate">{c.subject}</h3>
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{cCfg?.icon} {cCfg?.label} — {c.productName}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                              <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {c.partnerName}</span>
                              <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {formatDate(c.createdAt)}</span>
                              {c.assignedTo && <span className="flex items-center gap-1"><ArrowRight className="h-3 w-3" /> {c.assignedTo}</span>}
                              {c.deadline && <span className={overdue ? 'text-red-500 font-medium' : ''}>Rok: {formatDate(c.deadline)}</span>}
                              {c.amountRequested > 0 && <span className="font-medium text-foreground">{formatCurrency(c.amountRequested)}</span>}
                            </div>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            {nextSt && (
                              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); handleStatusChange(c, nextSt); }}>
                                {STATUS_CONFIG[nextSt]?.label} <ChevronRight className="h-3 w-3 ml-1" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* ─── DETAIL DIALOG ─── */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh]">
          <ScrollArea className="max-h-[75vh] pr-4">
            {selected && (
              <div className="space-y-6">
                <DialogHeader>
                  <div className="flex items-center gap-3">
                    <DialogTitle className="text-lg">{selected.number} — {selected.subject}</DialogTitle>
                    <Badge variant="outline" className={`${STATUS_CONFIG[selected.status]?.color}`}>{STATUS_CONFIG[selected.status]?.icon} {STATUS_CONFIG[selected.status]?.label}</Badge>
                  </div>
                  <DialogDescription>{selected.partnerName} · {selected.partnerEmail} · {selected.partnerPhone}</DialogDescription>
                </DialogHeader>

                {/* Status Flow */}
                <div className="flex items-center gap-1 overflow-x-auto pb-2">
                  {STATUS_FLOW.map((s, i) => {
                    const isCurrent = s === selected.status
                    const isPast = STATUS_FLOW.indexOf(selected.status) > i || selected.status === 'resolved' || selected.status === 'rejected'
                    return (
                      <div key={s} className="flex items-center gap-1 shrink-0">
                        <div className={`px-2 py-1 rounded text-xs font-medium ${isCurrent ? 'bg-primary text-primary-foreground' : isPast ? 'bg-muted text-muted-foreground' : 'bg-muted/50 text-muted-foreground/50'}`}>
                          {STATUS_CONFIG[s]?.label}
                        </div>
                        {i < STATUS_FLOW.length - 1 && <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />}
                      </div>
                    )
                  })}
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Kategorija</p>
                    <p className="text-xs font-medium">{CATEGORY_CONFIG[selected.category]?.icon} {CATEGORY_CONFIG[selected.category]?.label}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Prioritet</p>
                    <p className="text-xs font-medium"><span className={`w-2 h-2 rounded-full ${PRIORITY_CONFIG[selected.priority]?.dot} inline-block mr-1`} />{PRIORITY_CONFIG[selected.priority]?.label}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Proizvod</p>
                    <p className="text-xs font-medium">{selected.productName}</p>
                    <p className="text-xs text-muted-foreground">{selected.productCode} · {selected.batchNumber}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Zahtevana resolvacija</p>
                    <p className="text-xs font-medium">{REQUESTED_RESOLUTION_CONFIG[selected.requestedResolution] || selected.requestedResolution}</p>
                    {selected.amountRequested > 0 && <p className="text-xs font-medium text-green-600">{formatCurrency(selected.amountRequested)}</p>}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Opis reklamacije</h4>
                  <div className="p-3 rounded-lg bg-muted/50 text-sm whitespace-pre-wrap">{selected.description}</div>
                </div>

                {/* Internal & Customer Notes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Interna napomena</h4>
                    <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-sm whitespace-pre-wrap min-h-[60px]">{selected.internalNote || '—'}</div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Napomena kupca</h4>
                    <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-sm whitespace-pre-wrap min-h-[60px]">{selected.customerNote || '—'}</div>
                  </div>
                </div>

                {/* Attachments */}
                {selected.attachments.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Dokumenta ({selected.attachments.length})</h4>
                    <div className="space-y-2">
                      {selected.attachments.map((a) => (
                        <div key={a.id} className="flex items-center gap-3 p-2 rounded-lg border">
                          <Paperclip className="h-4 w-4 text-muted-foreground" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{a.fileName}</p>
                            <p className="text-xs text-muted-foreground">{(a.fileSize / 1024).toFixed(0)} KB · {formatDate(a.uploadedAt)}</p>
                          </div>
                          <Button size="sm" variant="ghost" className="h-7"><Eye className="h-3 w-3" /></Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resolution Info */}
                {selected.status === 'resolved' && selected.resolutionType && (
                  <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <h4 className="text-sm font-medium text-green-700 dark:text-green-400 mb-2">
                      {RESOLUTION_CONFIG[selected.resolutionType]?.icon} Rešeno: {RESOLUTION_CONFIG[selected.resolutionType]?.label}
                    </h4>
                    {selected.amountApproved > 0 && <p className="text-sm text-green-600">Odobren iznos: {formatCurrency(selected.amountApproved)}</p>}
                    {selected.resolvedAt && <p className="text-xs text-muted-foreground mt-1">Datum rešenja: {formatDate(selected.resolvedAt)}</p>}
                  </div>
                )}

                {/* Timeline */}
                <div>
                  <h4 className="text-sm font-medium mb-3">Vremenska linija</h4>
                  <div className="space-y-3">
                    {selected.timeline.map((ev) => (
                      <div key={ev.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-2.5 h-2.5 rounded-full ${ev.type === 'status_change' ? 'bg-primary' : ev.type === 'note' ? 'bg-amber-400' : ev.type === 'resolved' ? 'bg-green-400' : 'bg-gray-400'}`} />
                          <div className="w-px flex-1 bg-border" />
                        </div>
                        <div className="pb-3">
                          <p className="text-xs font-medium">{ev.description}</p>
                          <p className="text-xs text-muted-foreground">{ev.performedBy} · {new Date(ev.timestamp).toLocaleString('sr-RS')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add Note */}
                {selected.status !== 'resolved' && selected.status !== 'rejected' && (
                  <div className="flex gap-2">
                    <Input placeholder="Dodaj internu napomenu..." value={noteInput} onChange={(e) => setNoteInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddNote()} />
                    <Button size="sm" onClick={handleAddNote} disabled={!noteInput.trim()}><Send className="h-4 w-4" /></Button>
                  </div>
                )}

                {/* Actions */}
                {selected.status !== 'resolved' && selected.status !== 'rejected' && selected.status !== 'cancelled' && (
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => { setResolveForm({ resolutionType: 'refund', amountApproved: String(selected.amountRequested), internalNote: '', customerNote: '' }); setResolveOpen(true); }}>
                      <CheckCircle2 className="h-4 w-4 mr-1" /> Reši reklamaciju
                    </Button>
                    <Button size="sm" variant="destructive" onClick={handleReject}>
                      <XCircle className="h-4 w-4 mr-1" /> Odbij
                    </Button>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* ─── CREATE DIALOG ─── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nova reklamacija</DialogTitle>
            <DialogDescription>Unesite podatke o reklamaciji kupca</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ime kupca *</Label>
                <Input value={form.partnerName} onChange={(e) => setForm({ ...form, partnerName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Telefon</Label>
                <Input value={form.partnerPhone} onChange={(e) => setForm({ ...form, partnerPhone: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.partnerEmail} onChange={(e) => setForm({ ...form, partnerEmail: e.target.value })} />
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Šifra proizvoda</Label>
                <Input value={form.productCode} onChange={(e) => setForm({ ...form, productCode: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Naziv proizvoda</Label>
                <Input value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Batch / Lot</Label>
                <Input value={form.batchNumber} onChange={(e) => setForm({ ...form, batchNumber: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Kategorija</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_CONFIG).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v.icon} {v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Predmet *</Label>
              <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Opis</Label>
              <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Prioritet</Label>
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                      <SelectItem key={k} value={k}><span className={`w-2 h-2 rounded-full ${v.dot} inline-block mr-1`} />{v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Resolvacija</Label>
                <Select value={form.requestedResolution} onValueChange={(v) => setForm({ ...form, requestedResolution: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(REQUESTED_RESOLUTION_CONFIG).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Rok</Label>
                <Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Zateženi iznos (RSD)</Label>
              <Input type="number" value={form.amountRequested} onChange={(e) => setForm({ ...form, amountRequested: e.target.value })} placeholder="0" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Otkaži</Button>
            <Button onClick={handleCreate} disabled={!form.subject.trim() || !form.partnerName.trim()}>
              <Plus className="h-4 w-4 mr-1" /> Kreiraj reklamaciju
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── RESOLVE DIALOG ─── */}
      <Dialog open={resolveOpen} onOpenChange={setResolveOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reši reklamaciju</DialogTitle>
            <DialogDescription>{selected?.number} — {selected?.subject}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tip rešenja</Label>
              <Select value={resolveForm.resolutionType} onValueChange={(v) => setResolveForm({ ...resolveForm, resolutionType: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(RESOLUTION_CONFIG).filter(([k]) => k !== 'rejected').map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.icon} {v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {['refund', 'discount', 'credit_note'].includes(resolveForm.resolutionType) && (
              <div className="space-y-2">
                <Label>Odobren iznos (RSD)</Label>
                <Input type="number" value={resolveForm.amountApproved} onChange={(e) => setResolveForm({ ...resolveForm, amountApproved: e.target.value })} />
              </div>
            )}
            <div className="space-y-2">
              <Label>Interna napomena</Label>
              <Textarea rows={2} value={resolveForm.internalNote} onChange={(e) => setResolveForm({ ...resolveForm, internalNote: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Napomena za kupca</Label>
              <Textarea rows={2} value={resolveForm.customerNote} onChange={(e) => setResolveForm({ ...resolveForm, customerNote: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResolveOpen(false)}>Otkaži</Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleResolve}>
              <CheckCircle2 className="h-4 w-4 mr-1" /> Potvrdi rešenje
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
