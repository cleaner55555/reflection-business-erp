 
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import {
  Plus, Search, Eye, Trash2, RefreshCw, Filter,
  CheckCircle2, Clock, XCircle, AlertTriangle, FileText,
  TrendingUp, CalendarDays, ShieldCheck, Users, ClipboardCheck,
  BarChart3, ChevronRight, AlertOctagon, Download, Upload,
  ListChecks, GraduationCap, Target, Zap, CircleDot
} from 'lucide-react'
import { formatDate } from '@/lib/helpers'
import { toast } from 'sonner'

// ============ TYPES ============

interface Requirement {
  id: string
  number: string
  title: string
  regulation: string
  category: string
  priority: string
  status: string
  owner: string
  department: string
  dueDate: string
  description: string
  evidence: string
  compliant: boolean
  notes: string
  createdAt: string
  updatedAt: string
}

interface Audit {
  id: string
  number: string
  title: string
  type: string
  status: string
  auditor: string
  department: string
  scheduledDate: string
  completedDate: string | null
  score: number | null
  maxScore: number
  findings: number
  criticalFindings: number
  description: string
  scope: string
  checklist: AuditCheckItem[]
}

interface AuditCheckItem {
  id: string
  clause: string
  requirement: string
  status: 'pass' | 'fail' | 'na' | 'partial'
  notes: string
  evidence: string
}

interface NonConformance {
  id: string
  number: string
  title: string
  type: string
  severity: string
  status: string
  source: string
  department: string
  detectedBy: string
  detectedDate: string
  rootCause: string
  description: string
  correctiveAction: string
  responsible: string
  dueDate: string
  closedDate: string | null
  verification: string
  linkedAudit: string
  costImpact: number
}

interface CAPA {
  id: string
  number: string
  title: string
  type: string
  priority: string
  status: string
  source: string
  linkedNc: string
  department: string
  owner: string
  description: string
  rootCause: string
  actionPlan: string
  implementationDate: string
  verificationDate: string
  effectiveness: string
  dueDate: string
  completedDate: string | null
}

interface RiskAssessment {
  id: string
  number: string
  title: string
  category: string
  department: string
  owner: string
  likelihood: number
  impact: number
  riskScore: number
  riskLevel: string
  existingControls: string
  mitigationPlan: string
  residualLikelihood: number
  residualImpact: number
  residualScore: number
  residualLevel: string
  status: string
  reviewDate: string
  createdAt: string
}

interface ComplianceStats {
  totalRequirements: number
  compliantRequirements: number
  pendingRequirements: number
  nonCompliantRequirements: number
  complianceRate: number
  totalAudits: number
  openAudits: number
  completedAudits: number
  avgAuditScore: number
  totalNC: number
  openNC: number
  criticalNC: number
  closedNC: number
  totalCAPA: number
  openCAPA: number
  overdueCAPA: number
  totalRisks: number
  highRisks: number
  mediumRisks: number
  lowRisks: number
  overdueRequirements: number
  byCategory: Array<{ category: string; total: number; compliant: number; rate: number }>
  byDepartment: Array<{ department: string; total: number; compliant: number; rate: number }>
  monthlyTrend: Array<{ month: string; rate: number; audits: number; nc: number }>
}

// ============ CONFIG ============

const REQ_STATUS: Record<string, { label: string; color: string }> = {
  compliant: { label: 'Usklađeno', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  partial: { label: 'Delimično', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  non_compliant: { label: 'Neusklađeno', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  pending: { label: 'Na čekanju', color: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400' },
  not_assessed: { label: 'Nije procenjeno', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
}

const AUDIT_STATUS: Record<string, { label: string; color: string }> = {
  planned: { label: 'Planirano', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  in_progress: { label: 'U toku', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  completed: { label: 'Završeno', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  cancelled: { label: 'Otkazano', color: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400' },
}

const NC_SEVERITY: Record<string, { label: string; color: string }> = {
  critical: { label: 'Kritično', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  major: { label: 'Veće', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  minor: { label: 'Manje', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  observation: { label: 'Posmatranje', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
}

const NC_STATUS: Record<string, { label: string; color: string }> = {
  open: { label: 'Otvoreno', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  in_progress: { label: 'U toku', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  closed: { label: 'Zatvoreno', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  verified: { label: 'Verifikovano', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
}

const CAPA_STATUS: Record<string, { label: string; color: string }> = {
  draft: { label: 'Nacrt', color: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400' },
  open: { label: 'Otvoreno', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  in_progress: { label: 'U implementaciji', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  completed: { label: 'Završeno', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  verified: { label: 'Verifikovano', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
}

const RISK_LEVELS: Record<string, { label: string; color: string }> = {
  extreme: { label: 'Ekstremno', color: 'bg-red-600 text-white' },
  high: { label: 'Visoko', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  medium: { label: 'Srednje', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  low: { label: 'Nisko', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
}

const DEPARTMENTS = ['Svi', 'Proizvodnja', 'Kvalitet', 'Nabavka', 'Magacin', 'Finansije', 'HR', 'IT', 'Marketing', 'Bezbednost']
const CATEGORIES = ['Sve', 'ISO 9001', 'ISO 14001', 'ISO 45001', 'Zakonski', 'Regulatorni', 'Interni', 'HACCP', 'GDPR', 'CES']

const OWNERS = ['Jelena Popović', 'Marko Stanković', 'Ana Nikolić', 'Petar Đorđević', 'Ivana Jovanović', 'Nikola Milić']

// ============ MOCK DATA ============

const mockRequirements: Requirement[] = [
  { id: 'req-1', number: 'REQ-2025-001', title: 'Dokumentovani postupci kontrole kvaliteta', regulation: 'ISO 9001:2015 kl.8.5.1', category: 'ISO 9001', priority: 'high', status: 'compliant', owner: 'Jelena Popović', department: 'Kvalitet', dueDate: '2025-03-31', description: 'Svi proizvodni postupci moraju biti dokumentovani sa definisanim koracima, parametrima i kriterijumima prihvatanja.', evidence: 'QP-KV-001 do QP-KV-012 rev.3', compliant: true, notes: 'Svi postupci ažurirani u januaru', createdAt: '2025-01-10', updatedAt: '2025-01-20' },
  { id: 'req-2', number: 'REQ-2025-002', title: 'Procena rizika i prilika', regulation: 'ISO 9001:2015 kl.6.1', category: 'ISO 9001', priority: 'high', status: 'compliant', owner: 'Marko Stanković', department: 'Kvalitet', dueDate: '2025-02-28', description: 'Organizacija mora da sprovede analizu rizika i prilika relevantnih za kontekst i ciljeve kvaliteta.', evidence: 'RA-2025-001', compliant: true, notes: '', createdAt: '2025-01-10', updatedAt: '2025-02-15' },
  { id: 'req-3', number: 'REQ-2025-003', title: 'Evidencija obuke zaposlenih', regulation: 'ISO 45001:2018 kl.7.2', category: 'ISO 45001', priority: 'medium', status: 'partial', owner: 'Ana Nikolić', department: 'HR', dueDate: '2025-04-30', description: 'Evidencija o kompetencijama, obuci i obučenosti svih zaposlenih mora biti vođena i ažurirana.', evidence: 'Delimična evidencija za 2024', compliant: false, notes: 'Nedostaju certifikati za 3 zaposlena u proizvodnji', createdAt: '2025-01-10', updatedAt: '2025-03-01' },
  { id: 'req-4', number: 'REQ-2025-004', title: 'Upravljanje opasnim materijama', regulation: 'Zakon o zaštiti životne sredine', category: 'Zakonski', priority: 'high', status: 'compliant', owner: 'Petar Đorđević', department: 'Proizvodnja', dueDate: '2025-06-30', description: 'Svi opasni materijali moraju biti adekvatno obeleženi, skladišteni i praćeni.', evidence: 'Registrovano kod APO', compliant: true, notes: '', createdAt: '2025-01-15', updatedAt: '2025-02-20' },
  { id: 'req-5', number: 'REQ-2025-005', title: 'Zaštita ličnih podataka zaposlenih', regulation: 'GDPR čl.30', category: 'GDPR', priority: 'high', status: 'non_compliant', owner: 'Ivana Jovanović', department: 'IT', dueDate: '2025-03-15', description: 'Voditi registar obrade ličnih podataka zaposlenih i osigurati pravo pristupa i brisanja.', evidence: 'Nema registra', compliant: false, notes: 'Hitno: rok je prošao!', createdAt: '2025-01-10', updatedAt: '2025-03-20' },
  { id: 'req-6', number: 'REQ-2025-006', title: 'Kontrola temperature u hladnjačama', regulation: 'HACCP princip 3', category: 'HACCP', priority: 'high', status: 'compliant', owner: 'Nikola Milić', department: 'Magacin', dueDate: '2025-12-31', description: 'Temperature u svim hladnjačama moraju se beležiti najmanje 2x dnevno.', evidence: 'Dnevnik temperature 2025', compliant: true, notes: 'Automatski monitoring uveden feb 2025', createdAt: '2025-01-10', updatedAt: '2025-02-10' },
  { id: 'req-7', number: 'REQ-2025-007', title: 'Interni audit sistema menadžmenta', regulation: 'ISO 9001:2015 kl.9.2', category: 'ISO 9001', priority: 'medium', status: 'pending', owner: 'Jelena Popović', department: 'Kvalitet', dueDate: '2025-09-30', description: 'Sprovesti interni audit programa za 2025. godinu prema godišnjem planu.', evidence: '', compliant: false, notes: 'Planirano za Q3', createdAt: '2025-01-10', updatedAt: '2025-01-10' },
  { id: 'req-8', number: 'REQ-2025-008', title: 'CES izveštavanje o otpadnim materijama', regulation: 'CES Pravilnik sl.155', category: 'CES', priority: 'medium', status: 'compliant', owner: 'Petar Đorđević', department: 'Proizvodnja', dueDate: '2025-03-31', description: 'Podneti godišnji izveštaj o generisanom i odlaganim otpadu za prethodnu godinu.', evidence: 'Izveštaj CES 2024', compliant: true, notes: 'Podnet na vreme', createdAt: '2025-01-10', updatedAt: '2025-03-15' },
]

const mockAudits: Audit[] = [
  { id: 'aud-1', number: 'IA-2025-001', title: 'Interni audit - ISO 9001', type: 'internal', status: 'completed', auditor: 'Jelena Popović', department: 'Kvalitet', scheduledDate: '2025-02-15', completedDate: '2025-02-16', score: 87, maxScore: 100, findings: 3, criticalFindings: 0, description: 'Godišnji interni audit sistema menadžmenta kvalitetom prema ISO 9001:2015.', scope: 'Svi procesi sistema menadžmenta kvalitetom', checklist: [
    { id: 'ci-1', clause: '4.1', requirement: 'Razumevanje organizacije', status: 'pass', notes: 'Kontekst dokumentovan', evidence: 'STR-001' },
    { id: 'ci-2', clause: '5.1', requirement: 'Leadership', status: 'pass', notes: 'Politika kvaliteta ažurirana', evidence: 'POL-KV-001' },
    { id: 'ci-3', clause: '7.1.5', requirement: 'Resursi za praćenje i merenje', status: 'partial', notes: 'Nedostaju kalibracioni certifikati za 2 instrumenta', evidence: 'Partial' },
    { id: 'ci-4', clause: '8.5.1', requirement: 'Kontrola proizvodnje', status: 'pass', notes: 'Postupci ažurirani', evidence: 'QP-KV-001..012' },
    { id: 'ci-5', clause: '9.1.2', requirement: 'Zadovoljstvo kupaca', status: 'pass', notes: 'Ankete sprovodene redovno', evidence: 'ANK-2025' },
    { id: 'ci-6', clause: '10.2', requirement: 'Neusaglašenosti', status: 'partial', notes: 'Neki NC zakasneli sa rešavanjem', evidence: 'NC registar' },
  ] },
  { id: 'aud-2', number: 'IA-2025-002', title: 'Audit HACCP - Magacin', type: 'internal', status: 'in_progress', auditor: 'Nikola Milić', department: 'Magacin', scheduledDate: '2025-03-20', completedDate: null, score: null, maxScore: 100, findings: 1, criticalFindings: 0, description: 'Provera usaglašenosti sa HACCP principima u magacinskom prostoru.', scope: 'Priem robe, skladištenje, temperature, čistoća', checklist: [
    { id: 'ci-7', clause: 'Pr.1', requirement: 'Analiza opasnosti', status: 'pass', notes: '', evidence: 'HACCP plan rev.4' },
    { id: 'ci-8', clause: 'Pr.3', requirement: 'Kritične kontrolne tačke', status: 'fail', notes: 'Logger br.3 ne radi', evidence: 'Nedostaje' },
    { id: 'ci-9', clause: 'Pr.5', requirement: 'Korektivne mere', status: 'pass', notes: '', evidence: 'KP-HACCP-001' },
  ] },
  { id: 'aud-3', number: 'EA-2025-001', title: 'Eksterni certifikacioni audit', type: 'external', status: 'planned', auditor: 'TUV SUD', department: 'Kvalitet', scheduledDate: '2025-06-10', completedDate: null, score: null, maxScore: 100, findings: 0, criticalFindings: 0, description: 'Periodički nadzorni audit za održavanje ISO 9001:2015 sertifikata.', scope: 'Sistem menadžmenta kvalitetom - kompletno', checklist: [] },
]

const mockNC: NonConformance[] = [
  { id: 'nc-1', number: 'NC-2025-001', title: 'Neispravan kalibracioni instrument', type: 'product', severity: 'major', status: 'in_progress', source: 'Interni audit', department: 'Proizvodnja', detectedBy: 'Jelena Popović', detectedDate: '2025-02-16', rootCause: 'Preostao kalibracioni interval', description: 'Mikrometar br.MK-012 nije kalibrisan na vreme. Poslednja kalibracija bila pre 14 meseci (interval je 12 meseci).', correctiveAction: 'Hitna kalibracija instrumenta. Uvođenje automatickog sistema za praćenje kalibracija.', responsible: 'Petar Đorđević', dueDate: '2025-03-16', closedDate: null, verification: '', linkedAudit: 'IA-2025-001', costImpact: 15000 },
  { id: 'nc-2', number: 'NC-2025-002', title: 'Nedostajući GDPR registar', type: 'process', severity: 'critical', status: 'open', source: 'Zakonska zahteva', department: 'IT', detectedBy: 'Ivana Jovanović', detectedDate: '2025-03-01', rootCause: 'Nije formiran registar', description: 'Organizacija ne vodi registar obrade ličnih podataka kao što zahteva GDPR član 30.', correctiveAction: '', responsible: 'Ivana Jovanović', dueDate: '2025-04-01', closedDate: null, verification: '', linkedAudit: '', costImpact: 500000 },
  { id: 'nc-3', number: 'NC-2025-003', title: 'Neadekvatno skladištenje hemikalija', type: 'safety', severity: 'major', status: 'closed', source: 'Inspekcija', department: 'Proizvodnja', detectedBy: 'Inspekcija rada', detectedDate: '2025-01-20', rootCause: 'Nedostatak skladišnog prostora', description: 'Hemikalije različitih klasa nisu odvojene u skladu sa SDS listama.', correctiveAction: 'Nabavka novih sklopova za hemikalije, obeležavanje, obuka osoblja.', responsible: 'Petar Đorđević', dueDate: '2025-02-28', closedDate: '2025-02-25', verification: 'Inspekcija prihvatila mere', linkedAudit: '', costImpact: 85000 },
  { id: 'nc-4', number: 'NC-2025-004', title: 'Greška u etiketiranju proizvoda', type: 'product', severity: 'minor', status: 'verified', source: 'Kontrola kvaliteta', department: 'Proizvodnja', detectedBy: 'Ana Nikolić', detectedDate: '2025-01-10', rootCause: 'Greska u šabloni etikete', description: 'Serija proizvoda P-2025-045 imala pogrešan sastav na etiketi (nedostajao alergen).', correctiveAction: 'Korekcija šablone, dodatna provera alergena, povrat serije.', responsible: 'Marko Stanković', dueDate: '2025-01-20', closedDate: '2025-01-18', verification: 'Rešen CAPA CAP-2025-001', linkedAudit: '', costImpact: 120000 },
]

const mockCAPA: CAPA[] = [
  { id: 'capa-1', number: 'CAP-2025-001', title: 'Sistem za praćenje kalibracija', type: 'corrective', priority: 'high', status: 'in_progress', source: 'NC-2025-001', linkedNc: 'NC-2025-001', department: 'Proizvodnja', owner: 'Petar Đorđević', description: 'Uvesti softversko rešenje za automatsko praćenje kalibracionih intervala instrumenta.', rootCause: 'Rukovno praćenje kalibracija u Excel tabeli', actionPlan: '1. Izbor softvera (nedelja 1)\n2. Import podataka (nedelja 2)\n3. Obuka (nedelja 3)\n4. Puno sprovođenje (nedelja 4)', implementationDate: '2025-03-10', verificationDate: '2025-04-10', effectiveness: '', dueDate: '2025-04-01', completedDate: null },
  { id: 'capa-2', number: 'CAP-2025-002', title: 'GDPR registar obrade podataka', type: 'corrective', priority: 'high', status: 'open', source: 'NC-2025-002', linkedNc: 'NC-2025-002', department: 'IT', owner: 'Ivana Jovanović', description: 'Kreirati i voditi registar obrade ličnih podataka za sve procese u organizaciji.', rootCause: 'Nedostatak svesti o GDPR obavezama', actionPlan: '1. Mapiranje svih procesa obrade\n2. Kreiranje registra\n3. Obuka zaposlenih\n4. Obaveštenje nadležnog organa', implementationDate: '2025-03-20', verificationDate: '2025-04-20', effectiveness: '', dueDate: '2025-04-01', completedDate: null },
  { id: 'capa-3', number: 'CAP-2025-003', title: 'Poboljšanje sistema etiketiranja', type: 'corrective', priority: 'medium', status: 'verified', source: 'NC-2025-004', linkedNc: 'NC-2025-004', department: 'Proizvodnja', owner: 'Marko Stanković', description: 'Uvesti dodatnu proveru alergena i dvostruko odobrenje pre štampe etiketa.', rootCause: 'Nije bilo dvostrukog pregleda', actionPlan: '1. Ažuriranje procedure etiketiranja\n2. Obuka operatera\n3. Dvostruko odobrenje (QC + proizvodnja)\n4. Test period 2 nedelje', implementationDate: '2025-01-15', verificationDate: '2025-02-01', effectiveness: 'Efektivno - nema novih grešaka u 6 nedelja', dueDate: '2025-01-25', completedDate: '2025-01-22' },
]

const mockRisks: RiskAssessment[] = [
  { id: 'risk-1', number: 'RA-2025-001', title: 'Kvar na proizvodnoj liniji', category: 'Operativno', department: 'Proizvodnja', owner: 'Petar Đorđević', likelihood: 3, impact: 5, riskScore: 15, riskLevel: 'high', existingControls: 'Redovno održavanje, rezervni delovi', mitigationPlan: 'Prediktivno održavanje, dodatne rezerve kritičnih delova', residualLikelihood: 2, residualImpact: 4, residualScore: 8, residualLevel: 'medium', status: 'active', reviewDate: '2025-06-01', createdAt: '2025-01-15' },
  { id: 'risk-2', number: 'RA-2025-002', title: 'Curenje ličnih podataka', category: 'IT Sigurnost', department: 'IT', owner: 'Ivana Jovanović', likelihood: 3, impact: 5, riskScore: 15, riskLevel: 'high', existingControls: 'Firewall, antivirus', mitigationPlan: 'Dodatak: enkripcija, DLP, penetration test, obuka zaposlenih', residualLikelihood: 2, residualImpact: 4, residualScore: 8, residualLevel: 'medium', status: 'active', reviewDate: '2025-06-01', createdAt: '2025-01-15' },
  { id: 'risk-3', number: 'RA-2025-003', title: 'Nedostatak sirovina', category: 'Nabavka', department: 'Nabavka', owner: 'Ana Nikolić', likelihood: 4, impact: 4, riskScore: 16, riskLevel: 'high', existingControls: 'Više dobavljača, minimalne zalihe', mitigationPlan: 'Dugoročni ugovori, alternativni dobavljači, veće sigurnosne zalihe', residualLikelihood: 3, residualImpact: 3, residualScore: 9, residualLevel: 'medium', status: 'active', reviewDate: '2025-06-01', createdAt: '2025-01-15' },
  { id: 'risk-4', number: 'RA-2025-004', title: 'Radna povreda u proizvodnji', category: 'Bezbednost', department: 'Proizvodnja', owner: 'Nikola Milić', likelihood: 2, impact: 5, riskScore: 10, riskLevel: 'medium', existingControls: 'PPE, obuka, oznake', mitigationPlan: 'Dodatni sigurnosni senzori, redovni bezbednosni pregledi', residualLikelihood: 1, residualImpact: 4, residualScore: 4, residualLevel: 'low', status: 'active', reviewDate: '2025-06-01', createdAt: '2025-01-15' },
  { id: 'risk-5', number: 'RA-2025-005', title: 'Promena regulatornih zahteva', category: 'Regulatorni', department: 'Kvalitet', owner: 'Jelena Popović', likelihood: 3, impact: 3, riskScore: 9, riskLevel: 'medium', existingControls: 'Praćenje propisa', mitigationPlan: 'Članstvo u stručnim udruženjima, pretplata na regulative', residualLikelihood: 2, residualImpact: 2, residualScore: 4, residualLevel: 'low', status: 'active', reviewDate: '2025-06-01', createdAt: '2025-01-15' },
  { id: 'risk-6', number: 'RA-2025-006', title: 'Požar u magacinu', category: 'Bezbednost', department: 'Magacin', owner: 'Nikola Milić', likelihood: 1, impact: 5, riskScore: 5, riskLevel: 'low', existingControls: 'Vatrodojavna instalacija, gasenje', mitigationPlan: 'Automatski sistem gašenja, osiguranje', residualLikelihood: 1, residualImpact: 3, residualScore: 3, residualLevel: 'low', status: 'active', reviewDate: '2025-06-01', createdAt: '2025-01-15' },
]

const mockStats: ComplianceStats = {
  totalRequirements: 24, compliantRequirements: 18, pendingRequirements: 3, nonCompliantRequirements: 2, complianceRate: 75,
  totalAudits: 8, openAudits: 2, completedAudits: 5, avgAuditScore: 84,
  totalNC: 12, openNC: 2, criticalNC: 1, closedNC: 8,
  totalCAPA: 6, openCAPA: 2, overdueCAPA: 1,
  totalRisks: 6, highRisks: 3, mediumRisks: 2, lowRisks: 1,
  overdueRequirements: 1,
  byCategory: [
    { category: 'ISO 9001', total: 8, compliant: 6, rate: 75 },
    { category: 'ISO 14001', total: 3, compliant: 3, rate: 100 },
    { category: 'ISO 45001', total: 2, compliant: 1, rate: 50 },
    { category: 'Zakonski', total: 3, compliant: 3, rate: 100 },
    { category: 'GDPR', total: 2, compliant: 1, rate: 50 },
    { category: 'HACCP', total: 3, compliant: 3, rate: 100 },
    { category: 'CES', total: 2, compliant: 2, rate: 100 },
    { category: 'Interni', total: 1, compliant: 1, rate: 100 },
  ],
  byDepartment: [
    { department: 'Kvalitet', total: 8, compliant: 7, rate: 88 },
    { department: 'Proizvodnja', total: 5, compliant: 3, rate: 60 },
    { department: 'IT', total: 3, compliant: 1, rate: 33 },
    { department: 'HR', total: 2, compliant: 1, rate: 50 },
    { department: 'Magacin', total: 3, compliant: 3, rate: 100 },
    { department: 'Bezbednost', total: 2, compliant: 2, rate: 100 },
    { department: 'Nabavka', total: 1, compliant: 1, rate: 100 },
  ],
  monthlyTrend: [
    { month: 'Jan', rate: 70, audits: 1, nc: 2 },
    { month: 'Feb', rate: 72, audits: 2, nc: 1 },
    { month: 'Mar', rate: 75, audits: 1, nc: 3 },
    { month: 'Apr', rate: 78, audits: 0, nc: 1 },
    { month: 'Maj', rate: 80, audits: 1, nc: 0 },
    { month: 'Jun', rate: 0, audits: 1, nc: 0 },
  ],
}

const formatCurrency = (val: number) => `${val.toLocaleString('sr-RS', { minimumFractionDigits: 2 })} RSD`

// ============ COMPONENT ============

export function Compliance() {
  const { activeCompanyId } = useAppStore()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState<ComplianceStats | null>(null)
  const [requirements, setRequirements] = useState<Requirement[]>([])
  const [audits, setAudits] = useState<Audit[]>([])
  const [ncList, setNcList] = useState<NonConformance[]>([])
  const [capaList, setCapaList] = useState<CAPA[]>([])
  const [risks, setRisks] = useState<RiskAssessment[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('Sve')
  const [deptFilter, setDeptFilter] = useState('Svi')

  const [detailOpen, setDetailOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [createType, setCreateType] = useState<'requirement' | 'nc' | 'capa' | 'risk'>('requirement')
  const [selectedItem, setSelectedItem] = useState<Requirement | Audit | NonConformance | CAPA | RiskAssessment | null>(null)

  const emptyReqForm = { title: '', regulation: '', category: 'ISO 9001', priority: 'medium', owner: OWNERS[0], department: DEPARTMENTS[1], dueDate: '', description: '', evidence: '', notes: '' }
  const emptyNcForm = { title: '', type: 'product', severity: 'minor', source: 'Interna kontrola', department: DEPARTMENTS[1], detectedBy: OWNERS[0], description: '', rootCause: '', correctiveAction: '', responsible: OWNERS[0], dueDate: '' }
  const emptyCapaForm = { title: '', type: 'corrective', priority: 'medium', department: DEPARTMENTS[1], owner: OWNERS[0], description: '', rootCause: '', actionPlan: '', dueDate: '' }
  const emptyRiskForm = { title: '', category: 'Operativno', department: DEPARTMENTS[1], owner: OWNERS[0], likelihood: 3, impact: 3, existingControls: '', mitigationPlan: '', reviewDate: '' }

  const [reqForm, setReqForm] = useState(emptyReqForm)
  const [ncForm, setNcForm] = useState(emptyNcForm)
  const [capaForm, setCapaForm] = useState(emptyCapaForm)
  const [riskForm, setRiskForm] = useState(emptyRiskForm)

  const loadData = useCallback(async () => {
    if (!activeCompanyId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/compliance?companyId=${activeCompanyId}`)
      if (res.ok) {
        const d = await res.json()
        setRequirements(d.requirements?.length ? d.requirements : mockRequirements)
        setAudits(d.audits?.length ? d.audits : mockAudits)
        setNcList(d.nonConformances?.length ? d.nonConformances : mockNC)
        setCapaList(d.capa?.length ? d.capa : mockCAPA)
        setRisks(d.risks?.length ? d.risks : mockRisks)
        setStats(d.stats || mockStats)
      } else {
        setRequirements(mockRequirements)
        setAudits(mockAudits)
        setNcList(mockNC)
        setCapaList(mockCAPA)
        setRisks(mockRisks)
        setStats(mockStats)
      }
    } catch {
      setRequirements(mockRequirements)
      setAudits(mockAudits)
      setNcList(mockNC)
      setCapaList(mockCAPA)
      setRisks(mockRisks)
      setStats(mockStats)
    }
    setLoading(false)
  }, [activeCompanyId])

  useEffect(() => { loadData() }, [loadData])

  const handleCreate = async () => {
    if (!activeCompanyId) return
    try {
      let body: Record<string, unknown> = {}
      let endpoint = '/api/compliance'
      if (createType === 'requirement') {
        if (!reqForm.title.trim()) return
        body = { companyId: activeCompanyId, type: 'requirement', ...reqForm }
        endpoint = '/api/compliance/requirements'
      } else if (createType === 'nc') {
        if (!ncForm.title.trim()) return
        body = { companyId: activeCompanyId, type: 'nc', ...ncForm }
        endpoint = '/api/compliance/nonconformances'
      } else if (createType === 'capa') {
        if (!capaForm.title.trim()) return
        body = { companyId: activeCompanyId, type: 'capa', ...capaForm }
        endpoint = '/api/compliance/capa'
      } else {
        if (!riskForm.title.trim()) return
        body = { companyId: activeCompanyId, type: 'risk', ...riskForm, riskScore: riskForm.likelihood * riskForm.impact }
        endpoint = '/api/compliance/risks'
      }
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (res.ok) { setCreateOpen(false); loadData(); toast.success('Zapis kreiran') }
    } catch { /* silent */ }
  }

  const handleStatusChange = async (type: string, id: string, newStatus: string) => {
    try {
      await fetch('/api/compliance', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, id, status: newStatus }) })
      loadData()
      toast.success('Status ažuriran')
    } catch { /* silent */ }
  }

  const handleDelete = async (type: string, id: string) => {
    if (!confirm('Obrisati ovaj zapis?')) return
    try {
      await fetch(`/api/compliance?type=${type}&id=${id}`, { method: 'DELETE' })
      loadData()
    } catch { /* silent */ }
  }

  const openCreate = (type: 'requirement' | 'nc' | 'capa' | 'risk') => {
    setCreateType(type)
    setCreateOpen(true)
  }

  const openDetail = (item: Requirement | Audit | NonConformance | CAPA | RiskAssessment) => {
    setSelectedItem(item)
    setDetailOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Usklađenost</h1>
          <p className="text-sm text-muted-foreground">Upravljanje usklađenošću, auditima, neusklađenostima i rizicima</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadData}><RefreshCw className="h-4 w-4 mr-1" /> Osveži</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-1" /> Pregled</TabsTrigger>
          <TabsTrigger value="requirements"><ListChecks className="h-4 w-4 mr-1" /> Zahtevi</TabsTrigger>
          <TabsTrigger value="audits"><ClipboardCheck className="h-4 w-4 mr-1" /> Auditi</TabsTrigger>
          <TabsTrigger value="nc"><AlertOctagon className="h-4 w-4 mr-1" /> NC</TabsTrigger>
          <TabsTrigger value="capa"><Target className="h-4 w-4 mr-1" /> CAPA</TabsTrigger>
          <TabsTrigger value="risks"><Zap className="h-4 w-4 mr-1" /> Rizici</TabsTrigger>
        </TabsList>

        {/* ===== PREGLED ===== */}
        <TabsContent value="overview" className="space-y-6">
          {!stats ? (
            <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Usklađenost</span><ShieldCheck className="h-4 w-4 text-green-500" /></div>
                  <p className="text-2xl font-bold text-green-600">{stats.complianceRate}%</p>
                  <Progress value={stats.complianceRate} className="mt-2 h-2" />
                  <p className="text-[10px] text-muted-foreground mt-1">{stats.compliantRequirements}/{stats.totalRequirements} zahteva</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Otvoreni NC</span><AlertOctagon className="h-4 w-4 text-red-500" /></div>
                  <p className="text-2xl font-bold text-red-600">{stats.openNC}</p>
                  <p className="text-[10px] text-muted-foreground">od {stats.totalNC} ukupno · {stats.criticalNC} kritično</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">CAPA</span><Target className="h-4 w-4 text-amber-500" /></div>
                  <p className="text-2xl font-bold text-amber-600">{stats.openCAPA}</p>
                  <p className="text-[10px] text-muted-foreground">{stats.overdueCAPA} prekoračenih roka</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Prosek audit</span><ClipboardCheck className="h-4 w-4 text-primary" /></div>
                  <p className="text-2xl font-bold">{stats.avgAuditScore}%</p>
                  <p className="text-[10px] text-muted-foreground">{stats.completedAudits} od {stats.totalAudits} završenih</p>
                </Card>
              </div>

              {stats.overdueRequirements > 0 && (
                <Card className="border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900/30 p-4">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="text-sm font-medium text-red-700 dark:text-red-400">{stats.overdueRequirements} zahtev(a) prekoračio rok usklađenosti!</p>
                      <p className="text-xs text-red-600/70 dark:text-red-400/70">Hitno pregledati i preduzeti mere</p>
                    </div>
                  </div>
                </Card>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm">Usklađenost po kategoriji</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {stats.byCategory.map((c) => (
                      <div key={c.category} className="flex items-center gap-3">
                        <span className="text-xs w-20 truncate">{c.category}</span>
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div className={`h-2 rounded-full ${c.rate >= 80 ? 'bg-green-500' : c.rate >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${c.rate}%` }} />
                        </div>
                        <span className={`text-xs font-bold w-10 text-right ${c.rate >= 80 ? 'text-green-600' : c.rate >= 50 ? 'text-amber-600' : 'text-red-600'}`}>{c.rate}%</span>
                        <span className="text-[10px] text-muted-foreground w-14 text-right">{c.compliant}/{c.total}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm">Usklađenost po odeljenju</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {stats.byDepartment.map((d) => (
                      <div key={d.department} className="flex items-center gap-3">
                        <span className="text-xs w-24 truncate">{d.department}</span>
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div className={`h-2 rounded-full ${d.rate >= 80 ? 'bg-green-500' : d.rate >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${d.rate}%` }} />
                        </div>
                        <span className={`text-xs font-bold w-10 text-right ${d.rate >= 80 ? 'text-green-600' : d.rate >= 50 ? 'text-amber-600' : 'text-red-600'}`}>{d.rate}%</span>
                        <span className="text-[10px] text-muted-foreground w-14 text-right">{d.compliant}/{d.total}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm">Rizici po nivou</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-900/10">
                        <p className="text-2xl font-bold text-red-600">{stats.highRisks}</p>
                        <p className="text-[10px] text-red-600/70">Visoko</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10">
                        <p className="text-2xl font-bold text-amber-600">{stats.mediumRisks}</p>
                        <p className="text-[10px] text-amber-600/70">Srednje</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-900/10">
                        <p className="text-2xl font-bold text-green-600">{stats.lowRisks}</p>
                        <p className="text-[10px] text-green-600/70">Nisko</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm">Mesečni trend</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    {stats.monthlyTrend.map((m) => (
                      <div key={m.month} className="flex items-center gap-3">
                        <span className="text-xs w-10">{m.month}</span>
                        <div className="flex-1 bg-muted rounded-full h-3 relative">
                          <div className="h-3 rounded-full bg-primary/70" style={{ width: `${m.rate}%` }} />
                          <span className="absolute inset-0 flex items-center justify-center text-[9px] font-medium">{m.rate > 0 ? `${m.rate}%` : ''}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground w-16 text-right">{m.audits} aud · {m.nc} NC</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* ===== ZAHTEVI ===== */}
        <TabsContent value="requirements" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Pretraži zahteve..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}><SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger><SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
            <Select value={deptFilter} onValueChange={setDeptFilter}><SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger><SelectContent>{DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select>
            <Button size="sm" onClick={() => { setReqForm(emptyReqForm); openCreate('requirement') }}><Plus className="h-4 w-4 mr-1" /> Novi zahtev</Button>
          </div>

          {loading ? <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div> : (
            <div className="space-y-3">
              {requirements.filter((r) => {
                if (categoryFilter !== 'Sve' && r.category !== categoryFilter) return false
                if (deptFilter !== 'Svi' && r.department !== deptFilter) return false
                if (search) { const s = search.toLowerCase(); return r.title.toLowerCase().includes(s) || r.regulation.toLowerCase().includes(s) || r.number.toLowerCase().includes(s) }
                return true
              }).map((r) => {
                const sc = REQ_STATUS[r.status]
                return (
                  <Card key={r.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => openDetail(r)}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-xs font-mono text-muted-foreground">{r.number}</span>
                            <Badge variant="outline" className={`text-[10px] ${sc?.color}`}>{sc?.label}</Badge>
                            <Badge variant="secondary" className="text-[10px]">{r.category}</Badge>
                            <Badge variant="outline" className="text-[10px]">{r.regulation}</Badge>
                          </div>
                          <h3 className="text-sm font-medium">{r.title}</h3>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span><Users className="h-3 w-3 inline mr-1" />{r.owner}</span>
                            <span>{r.department}</span>
                            <span><CalendarDays className="h-3 w-3 inline mr-1" />Rok: {formatDate(r.dueDate)}</span>
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          {r.status === 'non_compliant' && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); handleStatusChange('requirement', r.id, 'partial') }}>Na čekanju</Button>}
                          {r.status === 'pending' && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); handleStatusChange('requirement', r.id, 'partial') }}>Započni</Button>}
                          {r.status === 'partial' && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); handleStatusChange('requirement', r.id, 'compliant') }}>Usklađeno</Button>}
                          <Button size="sm" variant="ghost" className="h-7 text-xs text-red-500" onClick={(e) => { e.stopPropagation(); handleDelete('requirement', r.id) }}><Trash2 className="h-3 w-3" /></Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* ===== AUDITI ===== */}
        <TabsContent value="audits" className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => toast.info('Audit zakazivanje - uskoro')}><Plus className="h-4 w-4 mr-1" /> Novi audit</Button>
          </div>
          <div className="space-y-3">
            {audits.map((a) => {
              const sc = AUDIT_STATUS[a.status]
              return (
                <Card key={a.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => openDetail(a)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-xs font-mono text-muted-foreground">{a.number}</span>
                          <Badge variant="outline" className={`text-[10px] ${sc?.color}`}>{sc?.label}</Badge>
                          <Badge variant="secondary" className="text-[10px]">{a.type === 'internal' ? 'Interni' : 'Eksterni'}</Badge>
                          <Badge variant="outline" className="text-[10px]">{a.department}</Badge>
                        </div>
                        <h3 className="text-sm font-medium">{a.title}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-1">{a.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span><Users className="h-3 w-3 inline mr-1" />{a.auditor}</span>
                          <span><CalendarDays className="h-3 w-3 inline mr-1" />{formatDate(a.scheduledDate)}</span>
                          {a.score !== null && <span className="font-medium text-foreground">Ocena: {a.score}/{a.maxScore}</span>}
                          {a.findings > 0 && <span className="text-red-500">{a.findings} nalaza{a.criticalFindings > 0 ? ` (${a.criticalFindings} krit.)` : ''}</span>}
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        {a.status === 'planned' && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); handleStatusChange('audit', a.id, 'in_progress') }}>Započni</Button>}
                        {a.status === 'in_progress' && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); handleStatusChange('audit', a.id, 'completed') }}>Završi</Button>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* ===== NC ===== */}
        <TabsContent value="nc" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Pretraži neusklađenosti..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            <Button size="sm" onClick={() => { setNcForm(emptyNcForm); openCreate('nc') }}><Plus className="h-4 w-4 mr-1" /> Novi NC</Button>
          </div>
          <div className="space-y-3">
            {ncList.filter((n) => {
              if (search) { const s = search.toLowerCase(); return n.title.toLowerCase().includes(s) || n.number.toLowerCase().includes(s) }
              return true
            }).map((n) => {
              const sev = NC_SEVERITY[n.severity]
              const st = NC_STATUS[n.status]
              const isOverdue = new Date(n.dueDate) < new Date() && (n.status === 'open' || n.status === 'in_progress')
              return (
                <Card key={n.id} className={`hover:shadow-md transition-shadow cursor-pointer ${isOverdue ? 'border-red-200' : ''}`} onClick={() => openDetail(n)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-xs font-mono text-muted-foreground">{n.number}</span>
                          <Badge variant="outline" className={`text-[10px] ${sev?.color}`}>{sev?.label}</Badge>
                          <Badge variant="outline" className={`text-[10px] ${st?.color}`}>{st?.label}</Badge>
                          <Badge variant="secondary" className="text-[10px]">{n.type === 'product' ? 'Proizvod' : n.type === 'process' ? 'Proces' : n.type === 'safety' ? 'Bezbednost' : 'Dokument'}</Badge>
                          {isOverdue && <Badge className="text-[10px] bg-red-500 text-white">PREKORAČEN ROK</Badge>}
                        </div>
                        <h3 className="text-sm font-medium">{n.title}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-1">{n.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span><Users className="h-3 w-3 inline mr-1" />{n.responsible}</span>
                          <span>{n.department}</span>
                          <span><CalendarDays className="h-3 w-3 inline mr-1" />Rok: {formatDate(n.dueDate)}</span>
                          {n.costImpact > 0 && <span className="text-red-500 font-medium">{formatCurrency(n.costImpact)}</span>}
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        {n.status === 'open' && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); handleStatusChange('nc', n.id, 'in_progress') }}>Rešavaj</Button>}
                        {n.status === 'in_progress' && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); handleStatusChange('nc', n.id, 'closed') }}>Zatvori</Button>}
                        {n.status === 'closed' && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); handleStatusChange('nc', n.id, 'verified') }}>Verifikuj</Button>}
                        <Button size="sm" variant="ghost" className="h-7 text-xs text-red-500" onClick={(e) => { e.stopPropagation(); handleDelete('nc', n.id) }}><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* ===== CAPA ===== */}
        <TabsContent value="capa" className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => { setCapaForm(emptyCapaForm); openCreate('capa') }}><Plus className="h-4 w-4 mr-1" /> Novi CAPA</Button>
          </div>
          <div className="space-y-3">
            {capaList.map((c) => {
              const st = CAPA_STATUS[c.status]
              const isOverdue = new Date(c.dueDate) < new Date() && (c.status === 'open' || c.status === 'in_progress')
              return (
                <Card key={c.id} className={`hover:shadow-md transition-shadow cursor-pointer ${isOverdue ? 'border-red-200' : ''}`} onClick={() => openDetail(c)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-xs font-mono text-muted-foreground">{c.number}</span>
                          <Badge variant="outline" className={`text-[10px] ${st?.color}`}>{st?.label}</Badge>
                          <Badge variant="secondary" className="text-[10px]">{c.type === 'corrective' ? 'Korektivna' : 'Preventivna'}</Badge>
                          {c.linkedNc && <Badge variant="outline" className="text-[10px]">→ {c.linkedNc}</Badge>}
                          {isOverdue && <Badge className="text-[10px] bg-red-500 text-white">PREKORAČEN ROK</Badge>}
                        </div>
                        <h3 className="text-sm font-medium">{c.title}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-1">{c.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span><Users className="h-3 w-3 inline mr-1" />{c.owner}</span>
                          <span>{c.department}</span>
                          <span><CalendarDays className="h-3 w-3 inline mr-1" />Rok: {formatDate(c.dueDate)}</span>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        {c.status === 'open' && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); handleStatusChange('capa', c.id, 'in_progress') }}>Implementiraj</Button>}
                        {c.status === 'in_progress' && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); handleStatusChange('capa', c.id, 'completed') }}>Završi</Button>}
                        {c.status === 'completed' && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); handleStatusChange('capa', c.id, 'verified') }}>Verifikuj</Button>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* ===== RIZICI ===== */}
        <TabsContent value="risks" className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => { setRiskForm(emptyRiskForm); openCreate('risk') }}><Plus className="h-4 w-4 mr-1" /> Novi rizik</Button>
          </div>
          <div className="space-y-3">
            {risks.map((r) => {
              const lv = RISK_LEVELS[r.riskLevel]
              const rlv = RISK_LEVELS[r.residualLevel]
              return (
                <Card key={r.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => openDetail(r)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-xs font-mono text-muted-foreground">{r.number}</span>
                          <Badge variant="outline" className={`text-[10px] ${lv?.color}`}>{lv?.label} ({r.riskScore})</Badge>
                          <Badge variant="secondary" className="text-[10px]">{r.category}</Badge>
                          <Badge variant="outline" className="text-[10px]">{r.department}</Badge>
                        </div>
                        <h3 className="text-sm font-medium">{r.title}</h3>
                        <div className="flex items-center gap-6 mt-2 text-xs text-muted-foreground">
                          <span>Verovatnoća: <strong>{r.likelihood}</strong></span>
                          <span>Uticaj: <strong>{r.impact}</strong></span>
                          <span>Rezidualni: <Badge variant="outline" className={`text-[9px] ${rlv?.color}`}>{rlv?.label} ({r.residualScore})</Badge></span>
                          <span><CalendarDays className="h-3 w-3 inline mr-1" />Pregled: {formatDate(r.reviewDate)}</span>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button size="sm" variant="ghost" className="h-7 text-xs text-red-500" onClick={(e) => { e.stopPropagation(); handleDelete('risk', r.id) }}><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* ===== DETAIL DIALOG ===== */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh]">
          <ScrollArea className="max-h-[75vh] pr-4">
            {selectedItem && 'owner' in selectedItem && 'description' in selectedItem && (
              <div className="space-y-6">
                <DialogHeader>
                  <DialogTitle className="text-lg">
                    {'number' in selectedItem ? `${(selectedItem as { number: string }).number}` : ''} — {(selectedItem as { title: string }).title}
                  </DialogTitle>
                  <DialogDescription>{'department' in selectedItem ? (selectedItem as { department: string }).department : ''} · {'owner' in selectedItem ? (selectedItem as { owner: string }).owner : ''}</DialogDescription>
                </DialogHeader>

                {/* Requirement detail */}
                {'regulation' in selectedItem && (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Badge variant="outline" className={REQ_STATUS[(selectedItem as Requirement).status]?.color}>{REQ_STATUS[(selectedItem as Requirement).status]?.label}</Badge>
                      <Badge variant="secondary">{(selectedItem as Requirement).category}</Badge>
                      <Badge variant="outline">{(selectedItem as Requirement).regulation}</Badge>
                    </div>
                    <div><h4 className="text-sm font-medium mb-2">Opis</h4><div className="p-3 rounded-lg bg-muted/50 text-sm whitespace-pre-wrap">{(selectedItem as Requirement).description}</div></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground">Dokaz</p><p className="text-sm">{(selectedItem as Requirement).evidence || '—'}</p></div>
                      <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground">Rok</p><p className="text-sm">{formatDate((selectedItem as Requirement).dueDate)}</p></div>
                    </div>
                    {(selectedItem as Requirement).notes && <div><h4 className="text-sm font-medium mb-2">Napomene</h4><div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-sm">{(selectedItem as Requirement).notes}</div></div>}
                  </div>
                )}

                {/* NC detail */}
                {'severity' in selectedItem && 'costImpact' in selectedItem && !('checklist' in selectedItem) && (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Badge variant="outline" className={NC_SEVERITY[(selectedItem as NonConformance).severity]?.color}>{NC_SEVERITY[(selectedItem as NonConformance).severity]?.label}</Badge>
                      <Badge variant="outline" className={NC_STATUS[(selectedItem as NonConformance).status]?.color}>{NC_STATUS[(selectedItem as NonConformance).status]?.label}</Badge>
                    </div>
                    <div><h4 className="text-sm font-medium mb-2">Opis</h4><div className="p-3 rounded-lg bg-muted/50 text-sm whitespace-pre-wrap">{(selectedItem as NonConformance).description}</div></div>
                    {(selectedItem as NonConformance).rootCause && <div><h4 className="text-sm font-medium mb-2">Koreni uzrok</h4><div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-sm">{(selectedItem as NonConformance).rootCause}</div></div>}
                    {(selectedItem as NonConformance).correctiveAction && <div><h4 className="text-sm font-medium mb-2">Korektivna mera</h4><div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-sm whitespace-pre-wrap">{(selectedItem as NonConformance).correctiveAction}</div></div>}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground">Odgovoran</p><p className="text-sm">{(selectedItem as NonConformance).responsible}</p></div>
                      <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground">Finansijski uticaj</p><p className="text-sm font-bold text-red-600">{formatCurrency((selectedItem as NonConformance).costImpact)}</p></div>
                    </div>
                    {(selectedItem as NonConformance).verification && <div><h4 className="text-sm font-medium mb-2">Verifikacija</h4><div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-sm">{(selectedItem as NonConformance).verification}</div></div>}
                  </div>
                )}

                {/* Audit detail */}
                {'checklist' in selectedItem && (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Badge variant="outline" className={AUDIT_STATUS[(selectedItem as Audit).status]?.color}>{AUDIT_STATUS[(selectedItem as Audit).status]?.label}</Badge>
                      <Badge variant="secondary">{(selectedItem as Audit).type === 'internal' ? 'Interni' : 'Eksterni'}</Badge>
                      {(selectedItem as Audit).score !== null && <Badge variant="outline">Ocena: {(selectedItem as Audit).score}/{(selectedItem as Audit).maxScore}</Badge>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground">Auditor</p><p className="text-sm">{(selectedItem as Audit).auditor}</p></div>
                      <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground">Datum</p><p className="text-sm">{formatDate((selectedItem as Audit).scheduledDate)}</p></div>
                    </div>
                    {(selectedItem as Audit).checklist.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-3">Checklista ({(selectedItem as Audit).checklist.length} stavki)</h4>
                        <div className="space-y-2">
                          {(selectedItem as Audit).checklist.map((ci) => (
                            <div key={ci.id} className="flex items-center gap-3 p-2 rounded border text-xs">
                              <Badge variant={ci.status === 'pass' ? 'default' : ci.status === 'fail' ? 'destructive' : ci.status === 'partial' ? 'secondary' : 'outline'} className="text-[9px] w-14 justify-center">
                                {ci.status === 'pass' ? 'OK' : ci.status === 'fail' ? 'NOK' : ci.status === 'partial' ? 'DEO' : 'N/A'}
                              </Badge>
                              <span className="font-mono text-muted-foreground w-10">{ci.clause}</span>
                              <span className="flex-1">{ci.requirement}</span>
                              {ci.notes && <span className="text-muted-foreground truncate max-w-[200px]">{ci.notes}</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* CAPA detail */}
                {'actionPlan' in selectedItem && !('checklist' in selectedItem) && !('severity' in selectedItem) && !('regulation' in selectedItem) && (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Badge variant="outline" className={CAPA_STATUS[(selectedItem as CAPA).status]?.color}>{CAPA_STATUS[(selectedItem as CAPA).status]?.label}</Badge>
                      <Badge variant="secondary">{(selectedItem as CAPA).type === 'corrective' ? 'Korektivna' : 'Preventivna'}</Badge>
                      {(selectedItem as CAPA).linkedNc && <Badge variant="outline">→ {(selectedItem as CAPA).linkedNc}</Badge>}
                    </div>
                    <div><h4 className="text-sm font-medium mb-2">Opis</h4><div className="p-3 rounded-lg bg-muted/50 text-sm whitespace-pre-wrap">{(selectedItem as CAPA).description}</div></div>
                    {(selectedItem as CAPA).rootCause && <div><h4 className="text-sm font-medium mb-2">Koreni uzrok</h4><div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-sm">{(selectedItem as CAPA).rootCause}</div></div>}
                    {(selectedItem as CAPA).actionPlan && <div><h4 className="text-sm font-medium mb-2">Plan akcija</h4><div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-sm whitespace-pre-wrap">{(selectedItem as CAPA).actionPlan}</div></div>}
                    {(selectedItem as CAPA).effectiveness && <div><h4 className="text-sm font-medium mb-2">Efektivnost</h4><div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-sm">{(selectedItem as CAPA).effectiveness}</div></div>}
                  </div>
                )}

                {/* Risk detail */}
                {'riskScore' in selectedItem && 'mitigationPlan' in selectedItem && 'likelihood' in selectedItem && !('actionPlan' in selectedItem) && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground">Nivo rizika</p><p className="text-lg font-bold">{(selectedItem as RiskAssessment).riskScore} - <Badge variant="outline" className={RISK_LEVELS[(selectedItem as RiskAssessment).riskLevel]?.color}>{RISK_LEVELS[(selectedItem as RiskAssessment).riskLevel]?.label}</Badge></p></div>
                      <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground">Rezidualni</p><p className="text-lg font-bold">{(selectedItem as RiskAssessment).residualScore} - <Badge variant="outline" className={RISK_LEVELS[(selectedItem as RiskAssessment).residualLevel]?.color}>{RISK_LEVELS[(selectedItem as RiskAssessment).residualLevel]?.label}</Badge></p></div>
                    </div>
                    <div className="grid grid-cols-4 gap-3 text-center">
                      <div className="p-2 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground">Verovatnoća</p><p className="font-bold">{(selectedItem as RiskAssessment).likelihood}</p></div>
                      <div className="p-2 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground">Uticaj</p><p className="font-bold">{(selectedItem as RiskAssessment).impact}</p></div>
                      <div className="p-2 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground">Rez. ver.</p><p className="font-bold">{(selectedItem as RiskAssessment).residualLikelihood}</p></div>
                      <div className="p-2 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground">Rez. ut.</p><p className="font-bold">{(selectedItem as RiskAssessment).residualImpact}</p></div>
                    </div>
                    <div><h4 className="text-sm font-medium mb-2">Postojeće kontrole</h4><div className="p-3 rounded-lg bg-muted/50 text-sm">{(selectedItem as RiskAssessment).existingControls}</div></div>
                    <div><h4 className="text-sm font-medium mb-2">Plan mitigacije</h4><div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-sm whitespace-pre-wrap">{(selectedItem as RiskAssessment).mitigationPlan}</div></div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* ===== CREATE DIALOG ===== */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {createType === 'requirement' ? 'Novi zahtev usklađenosti' : createType === 'nc' ? 'Nova neusklađenost' : createType === 'capa' ? 'Novi CAPA' : 'Nova procena rizika'}
            </DialogTitle>
            <DialogDescription>Popunite podatke za novi zapis</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-2">
            {createType === 'requirement' && (
              <>
                <div className="space-y-2"><Label>Naslov *</Label><Input value={reqForm.title} onChange={(e) => setReqForm({ ...reqForm, title: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Regulativa</Label><Input value={reqForm.regulation} onChange={(e) => setReqForm({ ...reqForm, regulation: e.target.value })} placeholder="npr. ISO 9001 kl.8.5" /></div>
                  <div className="space-y-2"><Label>Kategorija</Label><Select value={reqForm.category} onValueChange={(v) => setReqForm({ ...reqForm, category: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CATEGORIES.filter((c) => c !== 'Sve').map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2"><Label>Prioritet</Label><Select value={reqForm.priority} onValueChange={(v) => setReqForm({ ...reqForm, priority: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Nizak</SelectItem><SelectItem value="medium">Srednji</SelectItem><SelectItem value="high">Visok</SelectItem></SelectContent></Select></div>
                  <div className="space-y-2"><Label>Odeljenje</Label><Select value={reqForm.department} onValueChange={(v) => setReqForm({ ...reqForm, department: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{DEPARTMENTS.filter((d) => d !== 'Svi').map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></div>
                  <div className="space-y-2"><Label>Odgovoran</Label><Select value={reqForm.owner} onValueChange={(v) => setReqForm({ ...reqForm, owner: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{OWNERS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select></div>
                </div>
                <div className="space-y-2"><Label>Rok</Label><Input type="date" value={reqForm.dueDate} onChange={(e) => setReqForm({ ...reqForm, dueDate: e.target.value })} /></div>
                <div className="space-y-2"><Label>Opis</Label><Textarea rows={3} value={reqForm.description} onChange={(e) => setReqForm({ ...reqForm, description: e.target.value })} /></div>
                <div className="space-y-2"><Label>Dokaz</Label><Input value={reqForm.evidence} onChange={(e) => setReqForm({ ...reqForm, evidence: e.target.value })} placeholder="Referenca dokumenta" /></div>
              </>
            )}

            {createType === 'nc' && (
              <>
                <div className="space-y-2"><Label>Naslov *</Label><Input value={ncForm.title} onChange={(e) => setNcForm({ ...ncForm, title: e.target.value })} /></div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2"><Label>Ozbiljnost</Label><Select value={ncForm.severity} onValueChange={(v) => setNcForm({ ...ncForm, severity: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="critical">Kritično</SelectItem><SelectItem value="major">Veće</SelectItem><SelectItem value="minor">Manje</SelectItem><SelectItem value="observation">Posmatranje</SelectItem></SelectContent></Select></div>
                  <div className="space-y-2"><Label>Tip</Label><Select value={ncForm.type} onValueChange={(v) => setNcForm({ ...ncForm, type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="product">Proizvod</SelectItem><SelectItem value="process">Proces</SelectItem><SelectItem value="safety">Bezbednost</SelectItem><SelectItem value="document">Dokument</SelectItem></SelectContent></Select></div>
                  <div className="space-y-2"><Label>Izvor</Label><Select value={ncForm.source} onValueChange={(v) => setNcForm({ ...ncForm, source: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Interna kontrola">Interna kontrola</SelectItem><SelectItem value="Interni audit">Interni audit</SelectItem><SelectItem value="Inspekcija">Inspekcija</SelectItem><SelectItem value="Kupac">Kupac</SelectItem><SelectItem value="Zakonska zahteva">Zakonska zahteva</SelectItem></SelectContent></Select></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Odeljenje</Label><Select value={ncForm.department} onValueChange={(v) => setNcForm({ ...ncForm, department: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{DEPARTMENTS.filter((d) => d !== 'Svi').map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></div>
                  <div className="space-y-2"><Label>Odgovoran</Label><Select value={ncForm.responsible} onValueChange={(v) => setNcForm({ ...ncForm, responsible: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{OWNERS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select></div>
                </div>
                <div className="space-y-2"><Label>Rok rešavanja</Label><Input type="date" value={ncForm.dueDate} onChange={(e) => setNcForm({ ...ncForm, dueDate: e.target.value })} /></div>
                <div className="space-y-2"><Label>Opis neusklađenosti</Label><Textarea rows={3} value={ncForm.description} onChange={(e) => setNcForm({ ...ncForm, description: e.target.value })} /></div>
                <div className="space-y-2"><Label>Koreni uzrok</Label><Textarea rows={2} value={ncForm.rootCause} onChange={(e) => setNcForm({ ...ncForm, rootCause: e.target.value })} /></div>
              </>
            )}

            {createType === 'capa' && (
              <>
                <div className="space-y-2"><Label>Naslov *</Label><Input value={capaForm.title} onChange={(e) => setCapaForm({ ...capaForm, title: e.target.value })} /></div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2"><Label>Tip</Label><Select value={capaForm.type} onValueChange={(v) => setCapaForm({ ...capaForm, type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="corrective">Korektivna</SelectItem><SelectItem value="preventive">Preventivna</SelectItem></SelectContent></Select></div>
                  <div className="space-y-2"><Label>Prioritet</Label><Select value={capaForm.priority} onValueChange={(v) => setCapaForm({ ...capaForm, priority: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Nizak</SelectItem><SelectItem value="medium">Srednji</SelectItem><SelectItem value="high">Visok</SelectItem></SelectContent></Select></div>
                  <div className="space-y-2"><Label>Odeljenje</Label><Select value={capaForm.department} onValueChange={(v) => setCapaForm({ ...capaForm, department: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{DEPARTMENTS.filter((d) => d !== 'Svi').map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Odgovoran</Label><Select value={capaForm.owner} onValueChange={(v) => setCapaForm({ ...capaForm, owner: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{OWNERS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select></div>
                  <div className="space-y-2"><Label>Rok</Label><Input type="date" value={capaForm.dueDate} onChange={(e) => setCapaForm({ ...capaForm, dueDate: e.target.value })} /></div>
                </div>
                <div className="space-y-2"><Label>Opis</Label><Textarea rows={2} value={capaForm.description} onChange={(e) => setCapaForm({ ...capaForm, description: e.target.value })} /></div>
                <div className="space-y-2"><Label>Koreni uzrok</Label><Textarea rows={2} value={capaForm.rootCause} onChange={(e) => setCapaForm({ ...capaForm, rootCause: e.target.value })} /></div>
                <div className="space-y-2"><Label>Plan akcija</Label><Textarea rows={3} value={capaForm.actionPlan} onChange={(e) => setCapaForm({ ...capaForm, actionPlan: e.target.value })} /></div>
              </>
            )}

            {createType === 'risk' && (
              <>
                <div className="space-y-2"><Label>Naslov *</Label><Input value={riskForm.title} onChange={(e) => setRiskForm({ ...riskForm, title: e.target.value })} /></div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2"><Label>Kategorija</Label><Select value={riskForm.category} onValueChange={(v) => setRiskForm({ ...riskForm, category: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Operativno">Operativno</SelectItem><SelectItem value="Finansijsko">Finansijsko</SelectItem><SelectItem value="IT Sigurnost">IT Sigurnost</SelectItem><SelectItem value="Regulatorni">Regulatorni</SelectItem><SelectItem value="Bezbednost">Bezbednost</SelectItem><SelectItem value="Nabavka">Nabavka</SelectItem><SelectItem value="Reputaciono">Reputaciono</SelectItem></SelectContent></Select></div>
                  <div className="space-y-2"><Label>Odeljenje</Label><Select value={riskForm.department} onValueChange={(v) => setRiskForm({ ...riskForm, department: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{DEPARTMENTS.filter((d) => d !== 'Svi').map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></div>
                  <div className="space-y-2"><Label>Odgovoran</Label><Select value={riskForm.owner} onValueChange={(v) => setRiskForm({ ...riskForm, owner: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{OWNERS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Verovatnoća (1-5)</Label><Input type="number" min={1} max={5} value={riskForm.likelihood} onChange={(e) => setRiskForm({ ...riskForm, likelihood: parseInt(e.target.value) || 1 })} /></div>
                  <div className="space-y-2"><Label>Uticaj (1-5)</Label><Input type="number" min={1} max={5} value={riskForm.impact} onChange={(e) => setRiskForm({ ...riskForm, impact: parseInt(e.target.value) || 1 })} /></div>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                  <p className="text-xs text-muted-foreground">Skor rizika</p>
                  <p className="text-xl font-bold">{riskForm.likelihood * riskForm.impact} - <Badge variant="outline" className={RISK_LEVELS[riskForm.likelihood * riskForm.impact >= 20 ? 'extreme' : riskForm.likelihood * riskForm.impact >= 12 ? 'high' : riskForm.likelihood * riskForm.impact >= 6 ? 'medium' : 'low']?.color}>{RISK_LEVELS[riskForm.likelihood * riskForm.impact >= 20 ? 'extreme' : riskForm.likelihood * riskForm.impact >= 12 ? 'high' : riskForm.likelihood * riskForm.impact >= 6 ? 'medium' : 'low']?.label}</Badge></p>
                </div>
                <div className="space-y-2"><Label>Datum pregleda</Label><Input type="date" value={riskForm.reviewDate} onChange={(e) => setRiskForm({ ...riskForm, reviewDate: e.target.value })} /></div>
                <div className="space-y-2"><Label>Postojeće kontrole</Label><Textarea rows={2} value={riskForm.existingControls} onChange={(e) => setRiskForm({ ...riskForm, existingControls: e.target.value })} /></div>
                <div className="space-y-2"><Label>Plan mitigacije</Label><Textarea rows={2} value={riskForm.mitigationPlan} onChange={(e) => setRiskForm({ ...riskForm, mitigationPlan: e.target.value })} /></div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Otkaži</Button>
            <Button onClick={handleCreate}><Plus className="h-4 w-4 mr-1" /> Kreiraj</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
