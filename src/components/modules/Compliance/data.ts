export const REQ_STATUS: Record<string, { label: string; color: string }> = {
  compliant: { label: 'Usklađeno', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  partial: { label: 'Delimično', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  non_compliant: { label: 'Neusklađeno', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  pending: { label: 'Na čekanju', color: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400' },
  not_assessed: { label: 'Nije procenjeno', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
}

export const AUDIT_STATUS: Record<string, { label: string; color: string }> = {
  planned: { label: 'Planirano', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  in_progress: { label: 'U toku', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  completed: { label: 'Završeno', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  cancelled: { label: 'Otkazano', color: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400' },
}

export const NC_SEVERITY: Record<string, { label: string; color: string }> = {
  critical: { label: 'Kritično', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  major: { label: 'Veće', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  minor: { label: 'Manje', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  observation: { label: 'Posmatranje', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
}

export const NC_STATUS: Record<string, { label: string; color: string }> = {
  open: { label: 'Otvoreno', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  in_progress: { label: 'U toku', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  closed: { label: 'Zatvoreno', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  verified: { label: 'Verifikovano', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
}

export const CAPA_STATUS: Record<string, { label: string; color: string }> = {
  draft: { label: 'Nacrt', color: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400' },
  open: { label: 'Otvoreno', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  in_progress: { label: 'U implementaciji', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  completed: { label: 'Završeno', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  verified: { label: 'Verifikovano', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
}

export const RISK_LEVELS: Record<string, { label: string; color: string }> = {
  extreme: { label: 'Ekstremno', color: 'bg-red-600 text-white' },
  high: { label: 'Visoko', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  medium: { label: 'Srednje', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  low: { label: 'Nisko', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
}

export const DEPARTMENTS = ['Svi', 'Proizvodnja', 'Kvalitet', 'Nabavka', 'Magacin', 'Finansije', 'HR', 'IT', 'Marketing', 'Bezbednost']

export const CATEGORIES = ['Sve', 'ISO 9001', 'ISO 14001', 'ISO 45001', 'Zakonski', 'Regulatorni', 'Interni', 'HACCP', 'GDPR', 'CES']

export const OWNERS = ['Jelena Popović', 'Marko Stanković', 'Ana Nikolić', 'Petar Đorđević', 'Ivana Jovanović', 'Nikola Milić']

export const mockRequirements: Requirement[] = [
  { id: 'req-1', number: 'REQ-2025-001', title: 'Dokumentovani postupci kontrole kvaliteta', regulation: 'ISO 9001:2015 kl.8.5.1', category: 'ISO 9001', priority: 'high', status: 'compliant', owner: 'Jelena Popović', department: 'Kvalitet', dueDate: '2025-03-31', description: 'Svi proizvodni postupci moraju biti dokumentovani sa definisanim koracima, parametrima i kriterijumima prihvatanja.', evidence: 'QP-KV-001 do QP-KV-012 rev.3', compliant: true, notes: 'Svi postupci ažurirani u januaru', createdAt: '2025-01-10', updatedAt: '2025-01-20' },
  { id: 'req-2', number: 'REQ-2025-002', title: 'Procena rizika i prilika', regulation: 'ISO 9001:2015 kl.6.1', category: 'ISO 9001', priority: 'high', status: 'compliant', owner: 'Marko Stanković', department: 'Kvalitet', dueDate: '2025-02-28', description: 'Organizacija mora da sprovede analizu rizika i prilika relevantnih za kontekst i ciljeve kvaliteta.', evidence: 'RA-2025-001', compliant: true, notes: '', createdAt: '2025-01-10', updatedAt: '2025-02-15' },
  { id: 'req-3', number: 'REQ-2025-003', title: 'Evidencija obuke zaposlenih', regulation: 'ISO 45001:2018 kl.7.2', category: 'ISO 45001', priority: 'medium', status: 'partial', owner: 'Ana Nikolić', department: 'HR', dueDate: '2025-04-30', description: 'Evidencija o kompetencijama, obuci i obučenosti svih zaposlenih mora biti vođena i ažurirana.', evidence: 'Delimična evidencija za 2024', compliant: false, notes: 'Nedostaju certifikati za 3 zaposlena u proizvodnji', createdAt: '2025-01-10', updatedAt: '2025-03-01' },
  { id: 'req-4', number: 'REQ-2025-004', title: 'Upravljanje opasnim materijama', regulation: 'Zakon o zaštiti životne sredine', category: 'Zakonski', priority: 'high', status: 'compliant', owner: 'Petar Đorđević', department: 'Proizvodnja', dueDate: '2025-06-30', description: 'Svi opasni materijali moraju biti adekvatno obeleženi, skladišteni i praćeni.', evidence: 'Registrovano kod APO', compliant: true, notes: '', createdAt: '2025-01-15', updatedAt: '2025-02-20' },
  { id: 'req-5', number: 'REQ-2025-005', title: 'Zaštita ličnih podataka zaposlenih', regulation: 'GDPR čl.30', category: 'GDPR', priority: 'high', status: 'non_compliant', owner: 'Ivana Jovanović', department: 'IT', dueDate: '2025-03-15', description: 'Voditi registar obrade ličnih podataka zaposlenih i osigurati pravo pristupa i brisanja.', evidence: 'Nema registra', compliant: false, notes: 'Hitno: rok je prošao!', createdAt: '2025-01-10', updatedAt: '2025-03-20' },
  { id: 'req-6', number: 'REQ-2025-006', title: 'Kontrola temperature u hladnjačama', regulation: 'HACCP princip 3', category: 'HACCP', priority: 'high', status: 'compliant', owner: 'Nikola Milić', department: 'Magacin', dueDate: '2025-12-31', description: 'Temperature u svim hladnjačama moraju se beležiti najmanje 2x dnevno.', evidence: 'Dnevnik temperature 2025', compliant: true, notes: 'Automatski monitoring uveden feb 2025', createdAt: '2025-01-10', updatedAt: '2025-02-10' },
  { id: 'req-7', number: 'REQ-2025-007', title: 'Interni audit sistema menadžmenta', regulation: 'ISO 9001:2015 kl.9.2', category: 'ISO 9001', priority: 'medium', status: 'pending', owner: 'Jelena Popović', department: 'Kvalitet', dueDate: '2025-09-30', description: 'Sprovesti interni audit programa za 2025. godinu prema godišnjem planu.', evidence: '', compliant: false, notes: 'Planirano za Q3', createdAt: '2025-01-10', updatedAt: '2025-01-10' },
  { id: 'req-8', number: 'REQ-2025-008', title: 'CES izveštavanje o otpadnim materijama', regulation: 'CES Pravilnik sl.155', category: 'CES', priority: 'medium', status: 'compliant', owner: 'Petar Đorđević', department: 'Proizvodnja', dueDate: '2025-03-31', description: 'Podneti godišnji izveštaj o generisanom i odlaganim otpadu za prethodnu godinu.', evidence: 'Izveštaj CES 2024', compliant: true, notes: 'Podnet na vreme', createdAt: '2025-01-10', updatedAt: '2025-03-15' },
]

export const mockAudits: Audit[] = [
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

export const mockNC: NonConformance[] = [
  { id: 'nc-1', number: 'NC-2025-001', title: 'Neispravan kalibracioni instrument', type: 'product', severity: 'major', status: 'in_progress', source: 'Interni audit', department: 'Proizvodnja', detectedBy: 'Jelena Popović', detectedDate: '2025-02-16', rootCause: 'Preostao kalibracioni interval', description: 'Mikrometar br.MK-012 nije kalibrisan na vreme. Poslednja kalibracija bila pre 14 meseci (interval je 12 meseci).', correctiveAction: 'Hitna kalibracija instrumenta. Uvođenje automatickog sistema za praćenje kalibracija.', responsible: 'Petar Đorđević', dueDate: '2025-03-16', closedDate: null, verification: '', linkedAudit: 'IA-2025-001', costImpact: 15000 },
  { id: 'nc-2', number: 'NC-2025-002', title: 'Nedostajući GDPR registar', type: 'process', severity: 'critical', status: 'open', source: 'Zakonska zahteva', department: 'IT', detectedBy: 'Ivana Jovanović', detectedDate: '2025-03-01', rootCause: 'Nije formiran registar', description: 'Organizacija ne vodi registar obrade ličnih podataka kao što zahteva GDPR član 30.', correctiveAction: '', responsible: 'Ivana Jovanović', dueDate: '2025-04-01', closedDate: null, verification: '', linkedAudit: '', costImpact: 500000 },
  { id: 'nc-3', number: 'NC-2025-003', title: 'Neadekvatno skladištenje hemikalija', type: 'safety', severity: 'major', status: 'closed', source: 'Inspekcija', department: 'Proizvodnja', detectedBy: 'Inspekcija rada', detectedDate: '2025-01-20', rootCause: 'Nedostatak skladišnog prostora', description: 'Hemikalije različitih klasa nisu odvojene u skladu sa SDS listama.', correctiveAction: 'Nabavka novih sklopova za hemikalije, obeležavanje, obuka osoblja.', responsible: 'Petar Đorđević', dueDate: '2025-02-28', closedDate: '2025-02-25', verification: 'Inspekcija prihvatila mere', linkedAudit: '', costImpact: 85000 },
  { id: 'nc-4', number: 'NC-2025-004', title: 'Greška u etiketiranju proizvoda', type: 'product', severity: 'minor', status: 'verified', source: 'Kontrola kvaliteta', department: 'Proizvodnja', detectedBy: 'Ana Nikolić', detectedDate: '2025-01-10', rootCause: 'Greska u šabloni etikete', description: 'Serija proizvoda P-2025-045 imala pogrešan sastav na etiketi (nedostajao alergen).', correctiveAction: 'Korekcija šablone, dodatna provera alergena, povrat serije.', responsible: 'Marko Stanković', dueDate: '2025-01-20', closedDate: '2025-01-18', verification: 'Rešen CAPA CAP-2025-001', linkedAudit: '', costImpact: 120000 },
]

export const mockCAPA: CAPA[] = [
  { id: 'capa-1', number: 'CAP-2025-001', title: 'Sistem za praćenje kalibracija', type: 'corrective', priority: 'high', status: 'in_progress', source: 'NC-2025-001', linkedNc: 'NC-2025-001', department: 'Proizvodnja', owner: 'Petar Đorđević', description: 'Uvesti softversko rešenje za automatsko praćenje kalibracionih intervala instrumenta.', rootCause: 'Rukovno praćenje kalibracija u Excel tabeli', actionPlan: '1. Izbor softvera (nedelja 1)\n2. Import podataka (nedelja 2)\n3. Obuka (nedelja 3)\n4. Puno sprovođenje (nedelja 4)', implementationDate: '2025-03-10', verificationDate: '2025-04-10', effectiveness: '', dueDate: '2025-04-01', completedDate: null },
  { id: 'capa-2', number: 'CAP-2025-002', title: 'GDPR registar obrade podataka', type: 'corrective', priority: 'high', status: 'open', source: 'NC-2025-002', linkedNc: 'NC-2025-002', department: 'IT', owner: 'Ivana Jovanović', description: 'Kreirati i voditi registar obrade ličnih podataka za sve procese u organizaciji.', rootCause: 'Nedostatak svesti o GDPR obavezama', actionPlan: '1. Mapiranje svih procesa obrade\n2. Kreiranje registra\n3. Obuka zaposlenih\n4. Obaveštenje nadležnog organa', implementationDate: '2025-03-20', verificationDate: '2025-04-20', effectiveness: '', dueDate: '2025-04-01', completedDate: null },
  { id: 'capa-3', number: 'CAP-2025-003', title: 'Poboljšanje sistema etiketiranja', type: 'corrective', priority: 'medium', status: 'verified', source: 'NC-2025-004', linkedNc: 'NC-2025-004', department: 'Proizvodnja', owner: 'Marko Stanković', description: 'Uvesti dodatnu proveru alergena i dvostruko odobrenje pre štampe etiketa.', rootCause: 'Nije bilo dvostrukog pregleda', actionPlan: '1. Ažuriranje procedure etiketiranja\n2. Obuka operatera\n3. Dvostruko odobrenje (QC + proizvodnja)\n4. Test period 2 nedelje', implementationDate: '2025-01-15', verificationDate: '2025-02-01', effectiveness: 'Efektivno - nema novih grešaka u 6 nedelja', dueDate: '2025-01-25', completedDate: '2025-01-22' },
]

export const mockRisks: RiskAssessment[] = [
  { id: 'risk-1', number: 'RA-2025-001', title: 'Kvar na proizvodnoj liniji', category: 'Operativno', department: 'Proizvodnja', owner: 'Petar Đorđević', likelihood: 3, impact: 5, riskScore: 15, riskLevel: 'high', existingControls: 'Redovno održavanje, rezervni delovi', mitigationPlan: 'Prediktivno održavanje, dodatne rezerve kritičnih delova', residualLikelihood: 2, residualImpact: 4, residualScore: 8, residualLevel: 'medium', status: 'active', reviewDate: '2025-06-01', createdAt: '2025-01-15' },
  { id: 'risk-2', number: 'RA-2025-002', title: 'Curenje ličnih podataka', category: 'IT Sigurnost', department: 'IT', owner: 'Ivana Jovanović', likelihood: 3, impact: 5, riskScore: 15, riskLevel: 'high', existingControls: 'Firewall, antivirus', mitigationPlan: 'Dodatak: enkripcija, DLP, penetration test, obuka zaposlenih', residualLikelihood: 2, residualImpact: 4, residualScore: 8, residualLevel: 'medium', status: 'active', reviewDate: '2025-06-01', createdAt: '2025-01-15' },
  { id: 'risk-3', number: 'RA-2025-003', title: 'Nedostatak sirovina', category: 'Nabavka', department: 'Nabavka', owner: 'Ana Nikolić', likelihood: 4, impact: 4, riskScore: 16, riskLevel: 'high', existingControls: 'Više dobavljača, minimalne zalihe', mitigationPlan: 'Dugoročni ugovori, alternativni dobavljači, veće sigurnosne zalihe', residualLikelihood: 3, residualImpact: 3, residualScore: 9, residualLevel: 'medium', status: 'active', reviewDate: '2025-06-01', createdAt: '2025-01-15' },
  { id: 'risk-4', number: 'RA-2025-004', title: 'Radna povreda u proizvodnji', category: 'Bezbednost', department: 'Proizvodnja', owner: 'Nikola Milić', likelihood: 2, impact: 5, riskScore: 10, riskLevel: 'medium', existingControls: 'PPE, obuka, oznake', mitigationPlan: 'Dodatni sigurnosni senzori, redovni bezbednosni pregledi', residualLikelihood: 1, residualImpact: 4, residualScore: 4, residualLevel: 'low', status: 'active', reviewDate: '2025-06-01', createdAt: '2025-01-15' },
  { id: 'risk-5', number: 'RA-2025-005', title: 'Promena regulatornih zahteva', category: 'Regulatorni', department: 'Kvalitet', owner: 'Jelena Popović', likelihood: 3, impact: 3, riskScore: 9, riskLevel: 'medium', existingControls: 'Praćenje propisa', mitigationPlan: 'Članstvo u stručnim udruženjima, pretplata na regulative', residualLikelihood: 2, residualImpact: 2, residualScore: 4, residualLevel: 'low', status: 'active', reviewDate: '2025-06-01', createdAt: '2025-01-15' },
  { id: 'risk-6', number: 'RA-2025-006', title: 'Požar u magacinu', category: 'Bezbednost', department: 'Magacin', owner: 'Nikola Milić', likelihood: 1, impact: 5, riskScore: 5, riskLevel: 'low', existingControls: 'Vatrodojavna instalacija, gasenje', mitigationPlan: 'Automatski sistem gašenja, osiguranje', residualLikelihood: 1, residualImpact: 3, residualScore: 3, residualLevel: 'low', status: 'active', reviewDate: '2025-06-01', createdAt: '2025-01-15' },
]

export const mockStats: ComplianceStats = {
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

export const formatCurrency = (val: number) => `${val.toLocaleString('sr-RS', { minimumFractionDigits: 2 })} RSD`;

export const { activeCompanyId } = useAppStore();

export const { t } = useTranslation();

export const emptyReqForm = { title: '', regulation: '', category: 'ISO 9001', priority: 'medium', owner: OWNERS[0], department: DEPARTMENTS[1], dueDate: '', description: '', evidence: '', notes: '' }

export const emptyNcForm = { title: '', type: 'product', severity: 'minor', source: 'Interna kontrola', department: DEPARTMENTS[1], detectedBy: OWNERS[0], description: '', rootCause: '', correctiveAction: '', responsible: OWNERS[0], dueDate: '' }

export const emptyCapaForm = { title: '', type: 'corrective', priority: 'medium', department: DEPARTMENTS[1], owner: OWNERS[0], description: '', rootCause: '', actionPlan: '', dueDate: '' }

export const emptyRiskForm = { title: '', category: 'Operativno', department: DEPARTMENTS[1], owner: OWNERS[0], likelihood: 3, impact: 3, existingControls: '', mitigationPlan: '', reviewDate: '' }

export const res = await fetch(`/api/compliance?companyId=${activeCompanyId}`);

export const d = await res.json();

export const handleCreate = async () => {
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

export const handleStatusChange = async (type: string, id: string, newStatus: string) => {
    try {
      await fetch('/api/compliance', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, id, status: newStatus }) })
      loadData()
      toast.success('Status ažuriran')
    } catch { /* silent */ }
  }

export const handleDelete = async (type: string, id: string) => {
    if (!confirm('Obrisati ovaj zapis?')) return
    try {
      await fetch(`/api/compliance?type=${type}&id=${id}`, { method: 'DELETE' })
      loadData()
    } catch { /* silent */ }
  }

export const openCreate = (type: 'requirement' | 'nc' | 'capa' | 'risk') => {
    setCreateType(type)
    setCreateOpen(true)
  }

export const openDetail = (item: Requirement | Audit | NonConformance | CAPA | RiskAssessment) => {
    setSelectedItem(item)
    setDetailOpen(true)
  }

export const sc = REQ_STATUS[r.status]

export const sc = AUDIT_STATUS[a.status]

export const sev = NC_SEVERITY[n.severity]

export const st = NC_STATUS[n.status]

export const isOverdue = new Date(n.dueDate) < new Date() && (n.status === 'open' || n.status === 'in_progress');

export const st = CAPA_STATUS[c.status]

export const isOverdue = new Date(c.dueDate) < new Date() && (c.status === 'open' || c.status === 'in_progress');

export const lv = RISK_LEVELS[r.riskLevel]

export const rlv = RISK_LEVELS[r.residualLevel]
