export const STAGE_CONFIG: Record<string, { label: string; color: string }> = {
  concept: { label: 'Koncept', color: 'bg-slate-100 text-slate-700' },
  design: { label: 'Dizajn', color: 'bg-violet-100 text-violet-700' },
  prototype: { label: 'Prototip', color: 'bg-cyan-100 text-cyan-700' },
  testing: { label: 'Testiranje', color: 'bg-amber-100 text-amber-700' },
  launch: { label: 'Lansiranje', color: 'bg-emerald-100 text-emerald-700' },
  production: { label: 'Proizvodnja', color: 'bg-green-100 text-green-700' },
  eol: { label: 'Kraj života', color: 'bg-red-100 text-red-700' },
}

export const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  active: { label: 'Aktivan', color: 'bg-green-100 text-green-700' },
  development: { label: 'U razvoju', color: 'bg-amber-100 text-amber-700' },
  discontinued: { label: 'Prekinut', color: 'bg-red-100 text-red-700' },
}

export const REVISION_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: 'Nacrt', color: 'bg-slate-100 text-slate-700' },
  submitted: { label: 'Podnet', color: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Odobren', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Odbijen', color: 'bg-red-100 text-red-700' },
}

export const DOC_TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  drawing: { label: 'Crtež', color: 'bg-blue-100 text-blue-700' },
  specification: { label: 'Specifikacija', color: 'bg-violet-100 text-violet-700' },
  material_cert: { label: 'Sertifikat', color: 'bg-emerald-100 text-emerald-700' },
  test_report: { label: 'Izveštaj testa', color: 'bg-amber-100 text-amber-700' },
  manual: { label: 'Uputstvo', color: 'bg-cyan-100 text-cyan-700' },
}

export const ECR_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: 'Nacrt', color: 'bg-slate-100 text-slate-700' },
  under_review: { label: 'Na pregledu', color: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Odobren', color: 'bg-green-100 text-green-700' },
  implemented: { label: 'Implementiran', color: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: 'Odbijen', color: 'bg-red-100 text-red-700' },
}

export const ECO_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  planned: { label: 'Planirano', color: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'U toku', color: 'bg-amber-100 text-amber-700' },
  completed: { label: 'Završeno', color: 'bg-green-100 text-green-700' },
  on_hold: { label: 'Na čekanju', color: 'bg-slate-100 text-slate-700' },
}

export const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  low: { label: 'Nizak', color: 'bg-slate-100 text-slate-700' },
  medium: { label: 'Srednji', color: 'bg-amber-100 text-amber-700' },
  high: { label: 'Visok', color: 'bg-orange-100 text-orange-700' },
  critical: { label: 'Kritičan', color: 'bg-red-100 text-red-700' },
}

export const PIE_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#22c55e', '#ef4444']

export const MOCK_PRODUCTS: PLMProduct[] = [
  { id: 'p1', name: 'Kontrolna ploča KP-200', sku: 'KP-200-001', category: 'Elektronika', lifecycleStage: 'production', status: 'active', version: '3.2.1', owner: 'Marko Petrović', lastUpdated: '2024-12-08', createdAt: '2023-06-15', description: 'Glavna kontrolna ploča za industrijske sisteme', bomRef: 'BOM-KP200-v3', revisionCount: 7 },
  { id: 'p2', name: 'Hidraulični cilindar HC-150', sku: 'HC-150-002', category: 'Mehanika', lifecycleStage: 'design', status: 'development', version: '2.0.0', owner: 'Jelena Stanković', lastUpdated: '2024-12-10', createdAt: '2024-03-01', description: 'Hidraulični cilindar nove generacije', bomRef: 'BOM-HC150-v2', revisionCount: 4 },
  { id: 'p3', name: 'Senzor temperature ST-80', sku: 'ST-80-003', category: 'Elektronika', lifecycleStage: 'testing', status: 'development', version: '1.5.0', owner: 'Nenad Jovanović', lastUpdated: '2024-12-09', createdAt: '2024-01-20', description: 'Digitalni senzor temperature sa I2C interfejsom', bomRef: 'BOM-ST80-v1', revisionCount: 5 },
  { id: 'p4', name: 'Aluminijsko kućište AK-300', sku: 'AK-300-004', category: 'Mehanika', lifecycleStage: 'production', status: 'active', version: '4.1.0', owner: 'Ana Nikolić', lastUpdated: '2024-11-28', createdAt: '2022-09-10', description: 'Aluminijsko kućište za elektroniku', bomRef: 'BOM-AK300-v4', revisionCount: 9 },
  { id: 'p5', name: 'Power Supply PS-500', sku: 'PS-500-005', category: 'Elektronika', lifecycleStage: 'prototype', status: 'development', version: '1.0.0', owner: 'Dejan Milić', lastUpdated: '2024-12-11', createdAt: '2024-08-15', description: 'Prekidački napajanje 500W', bomRef: 'BOM-PS500-v1', revisionCount: 2 },
  { id: 'p6', name: 'Plastična maska PM-100', sku: 'PM-100-006', category: 'Dizajn', lifecycleStage: 'launch', status: 'active', version: '2.3.0', owner: 'Ivana Đorđević', lastUpdated: '2024-12-05', createdAt: '2023-11-22', description: 'Prednja maska za kontrolni panel', bomRef: 'BOM-PM100-v2', revisionCount: 6 },
  { id: 'p7', name: 'Servo motor SM-60', sku: 'SM-60-007', category: 'Mehanika', lifecycleStage: 'concept', status: 'development', version: '0.1.0', owner: 'Slobodan Tanasijević', lastUpdated: '2024-12-12', createdAt: '2024-11-01', description: 'Servo motor za robotiku', bomRef: '', revisionCount: 1 },
  { id: 'p8', name: 'Konektor za ploču CP-12', sku: 'CP-12-008', category: 'Elektronika', lifecycleStage: 'production', status: 'active', version: '5.0.2', owner: 'Marko Petrović', lastUpdated: '2024-12-01', createdAt: '2021-04-08', description: 'Visokopin konektor za PCB', bomRef: 'BOM-CP12-v5', revisionCount: 11 },
  { id: 'p9', name: 'Ventil za rashladni sistem VR-45', sku: 'VR-45-009', category: 'Mehanika', lifecycleStage: 'eol', status: 'discontinued', version: '3.8.0', owner: 'Jelena Stanković', lastUpdated: '2024-06-15', createdAt: '2019-02-20', description: 'Ventil za rashladni sistem - zastareo', bomRef: 'BOM-VR45-v3', revisionCount: 8 },
  { id: 'p10', name: 'LED modul LM-250', sku: 'LM-250-010', category: 'Elektronika', lifecycleStage: 'production', status: 'active', version: '2.0.0', owner: 'Nenad Jovanović', lastUpdated: '2024-12-07', createdAt: '2023-08-05', description: 'LED modul za indikaciju', bomRef: 'BOM-LM250-v2', revisionCount: 3 },
]

export const MOCK_REVISIONS: PLMRevision[] = [
  { id: 'r1', productId: 'p1', productName: 'Kontrolna ploča KP-200', version: '3.2.1', description: 'Dodat novi ADC kanal za senzor pritiska', author: 'Marko Petrović', date: '2024-12-08', status: 'approved', changeType: 'Minor', affectedComponents: 'U9, R12, C5' },
  { id: 'r2', productId: 'p1', productName: 'Kontrolna ploča KP-200', version: '3.2.0', description: 'Popravka bug-a u firmware bootloaderu', author: 'Marko Petrović', date: '2024-11-20', status: 'approved', changeType: 'Patch', affectedComponents: 'U1 firmware' },
  { id: 'r3', productId: 'p2', productName: 'Hidraulični cilindar HC-150', version: '2.0.0', description: 'Kompletna redizajn osovine i zaptivki', author: 'Jelena Stanković', date: '2024-12-10', status: 'submitted', changeType: 'Major', affectedComponents: 'Osovina, zaptivke, cilindar' },
  { id: 'r4', productId: 'p3', productName: 'Senzor temperature ST-80', version: '1.5.0', description: 'Prošireni temperaturni raspon na -40°C do +125°C', author: 'Nenad Jovanović', date: '2024-12-09', status: 'draft', changeType: 'Major', affectedComponents: 'NTC termistor, kalibracija' },
  { id: 'r5', productId: 'p4', productName: 'Aluminijsko kućište AK-300', version: '4.1.0', description: 'Nova ventilaciona rupa na gornjoj strani', author: 'Ana Nikolić', date: '2024-11-28', status: 'approved', changeType: 'Minor', affectedComponents: 'Gornji poklopac' },
  { id: 'r6', productId: 'p5', productName: 'Power Supply PS-500', version: '1.0.0', description: 'Inicijalna revizija - prototip napravljen', author: 'Dejan Milić', date: '2024-12-11', status: 'submitted', changeType: 'Major', affectedComponents: 'Kompletna ploča' },
  { id: 'r7', productId: 'p6', productName: 'Plastična maska PM-100', version: '2.3.0', description: 'Promena boje i logotipa', author: 'Ivana Đorđević', date: '2024-12-05', status: 'approved', changeType: 'Patch', affectedComponents: 'Prednja površina' },
  { id: 'r8', productId: 'p8', productName: 'Konektor za ploču CP-12', version: '5.0.2', description: 'Ispravka tolerancije pinova', author: 'Marko Petrović', date: '2024-12-01', status: 'approved', changeType: 'Patch', affectedComponents: 'Pinovi konektora' },
]

export const MOCK_DOCUMENTS: PLMDocument[] = [
  { id: 'd1', title: 'Šema KP-200 Rev 3.2', productId: 'p1', productName: 'Kontrolna ploča KP-200', docType: 'drawing', version: '3.2.1', status: 'approved', author: 'Marko Petrović', date: '2024-12-08', hasFile: true, size: '2.4 MB' },
  { id: 'd2', title: 'Specifikacija KP-200', productId: 'p1', productName: 'Kontrolna ploča KP-200', docType: 'specification', version: '3.2', status: 'approved', author: 'Jelena Stanković', date: '2024-12-08', hasFile: true, size: '1.1 MB' },
  { id: 'd3', title: 'Crtež cilindra HC-150', productId: 'p2', productName: 'Hidraulični cilindar HC-150', docType: 'drawing', version: '2.0', status: 'submitted', author: 'Ana Nikolić', date: '2024-12-10', hasFile: true, size: '3.7 MB' },
  { id: 'd4', title: 'Test izveštaj ST-80', productId: 'p3', productName: 'Senzor temperature ST-80', docType: 'test_report', version: '1.5', status: 'draft', author: 'Nenad Jovanović', date: '2024-12-09', hasFile: true, size: '890 KB' },
  { id: 'd5', title: 'Sertifikat materijala AK-300', productId: 'p4', productName: 'Aluminijsko kućište AK-300', docType: 'material_cert', version: '4.1', status: 'approved', author: 'Dejan Milić', date: '2024-11-28', hasFile: true, size: '450 KB' },
  { id: 'd6', title: 'Uputstvo za montažu PM-100', productId: 'p6', productName: 'Plastična maska PM-100', docType: 'manual', version: '2.3', status: 'approved', author: 'Ivana Đorđević', date: '2024-12-05', hasFile: true, size: '1.8 MB' },
  { id: 'd7', title: 'Specifikacija napajanja PS-500', productId: 'p5', productName: 'Power Supply PS-500', docType: 'specification', version: '1.0', status: 'submitted', author: 'Dejan Milić', date: '2024-12-11', hasFile: false, size: '-' },
  { id: 'd8', title: 'Crtež kućišta PS-500', productId: 'p5', productName: 'Power Supply PS-500', docType: 'drawing', version: '1.0', status: 'draft', author: 'Ana Nikolić', date: '2024-12-11', hasFile: true, size: '5.2 MB' },
  { id: 'd9', title: 'Test izveštaj CP-12', productId: 'p8', productName: 'Konektor za ploču CP-12', docType: 'test_report', version: '5.0', status: 'approved', author: 'Nenad Jovanović', date: '2024-12-01', hasFile: true, size: '670 KB' },
  { id: 'd10', title: 'Sertifikat LM-250 CE', productId: 'p10', productName: 'LED modul LM-250', docType: 'material_cert', version: '2.0', status: 'approved', author: 'Jelena Stanković', date: '2024-12-07', hasFile: true, size: '320 KB' },
  { id: 'd11', title: 'Uputstvo za kalibraciju ST-80', productId: 'p3', productName: 'Senzor temperature ST-80', docType: 'manual', version: '1.4', status: 'approved', author: 'Nenad Jovanović', date: '2024-10-15', hasFile: true, size: '1.5 MB' },
  { id: 'd12', title: 'Crtež konektora CP-12', productId: 'p8', productName: 'Konektor za ploču CP-12', docType: 'drawing', version: '5.0.2', status: 'approved', author: 'Marko Petrović', date: '2024-12-01', hasFile: true, size: '4.1 MB' },
]

export const MOCK_ECRS: PLM_ECR[] = [
  { id: 'ecr1', number: 'ECR-2024-001', productId: 'p1', productName: 'Kontrolna ploča KP-200', description: 'Zamena ADC konvertora za bolju preciznost', priority: 'high', requester: 'Nenad Jovanović', status: 'approved', justification: 'Trenutni ADC ima grešku od ±2 LSB, potrebno ±0.5 LSB', affectedAreas: 'Hardver, Firmware', createdAt: '2024-11-25', convertedToECO: true, ecoNumber: 'ECO-2024-001' },
  { id: 'ecr2', number: 'ECR-2024-002', productId: 'p2', productName: 'Hidraulični cilindar HC-150', description: 'Promena materijala zaptivki na Viton', priority: 'critical', requester: 'Jelena Stanković', status: 'under_review', justification: 'Trenutne zaptivke ne podnose visoke temperature', affectedAreas: 'Mehanika, Nabavka', createdAt: '2024-12-01', convertedToECO: false, ecoNumber: null },
  { id: 'ecr3', number: 'ECR-2024-003', productId: 'p3', productName: 'Senzor temperature ST-80', description: 'Proširenje temperaturnog raspona', priority: 'medium', requester: 'Dejan Milić', status: 'approved', justification: 'Klijent zahteva rad na temperaturama ispod -20°C', affectedAreas: 'Hardver, Testiranje', createdAt: '2024-12-03', convertedToECO: true, ecoNumber: 'ECO-2024-002' },
  { id: 'ecr4', number: 'ECR-2024-004', productId: 'p4', productName: 'Aluminijsko kućište AK-300', description: 'Dodat konektor za spoljni ventilator', priority: 'low', requester: 'Ana Nikolić', status: 'draft', justification: 'Poboljšanje hlađenja za nove konfiguracije', affectedAreas: 'Mehanika, Dizajn', createdAt: '2024-12-08', convertedToECO: false, ecoNumber: null },
  { id: 'ecr5', number: 'ECR-2024-005', productId: 'p8', productName: 'Konektor za ploču CP-12', description: 'Povećanje broja pinova sa 12 na 16', priority: 'high', requester: 'Marko Petrović', status: 'implemented', justification: 'Novi interfejs zahteva 4 dodatna signala', affectedAreas: 'Hardver, Proizvodnja', createdAt: '2024-11-10', convertedToECO: true, ecoNumber: 'ECO-2024-003' },
  { id: 'ecr6', number: 'ECR-2024-006', productId: 'p10', productName: 'LED modul LM-250', description: 'Prebačen na SMD LED diode', priority: 'medium', requester: 'Nenad Jovanović', status: 'rejected', justification: 'Smanjenje troškova proizvodnje za 30%', affectedAreas: 'Hardver, Proizvodnja, Nabavka', createdAt: '2024-11-18', convertedToECO: false, ecoNumber: null },
]

export const MOCK_ECOS: PLM_ECO[] = [
  { id: 'eco1', ecrNumber: 'ECR-2024-001', productName: 'Kontrolna ploča KP-200', implementationPlan: 'Zamena ADC chipa, ažuriranje PCB layauta, testiranje', assignedTeam: 'Tim za elektroniku', targetDate: '2025-01-15', completion: 65, status: 'in_progress', approvalChain: ['Nenad J.', 'Marko P.', 'Jelena S.'] },
  { id: 'eco2', ecrNumber: 'ECR-2024-003', productName: 'Senzor temperature ST-80', implementationPlan: 'Novi NTC termistor, rekalibracija, test na ekstremnim temperaturama', assignedTeam: 'Tim za senzore', targetDate: '2025-02-01', completion: 30, status: 'in_progress', approvalChain: ['Dejan M.', 'Nenad J.'] },
  { id: 'eco3', ecrNumber: 'ECR-2024-005', productName: 'Konektor za ploču CP-12', implementationPlan: 'Redizajn konektora, nova masnica, kvalitetna kontrola', assignedTeam: 'Tim za konektore', targetDate: '2024-12-20', completion: 100, status: 'completed', approvalChain: ['Marko P.', 'Ana N.', 'Ivana Đ.'] },
]

export const MOCK_STAGE_PIE = [
  { name: 'Koncept', value: 1 },
  { name: 'Dizajn', value: 1 },
  { name: 'Prototip', value: 1 },
  { name: 'Testiranje', value: 1 },
  { name: 'Lansiranje', value: 1 },
  { name: 'Proizvodnja', value: 4 },
  { name: 'Kraj života', value: 1 },
]

export const MOCK_NPD_TREND = [
  { month: 'Jul', count: 2 },
  { month: 'Avg', count: 1 },
  { month: 'Sep', count: 3 },
  { month: 'Okt', count: 2 },
  { month: 'Nov', count: 4 },
  { month: 'Dec', count: 3 },
]

export const MOCK_MILESTONES = [
  { id: 'm1', title: 'PS-500 Prototip', date: '2024-12-20', stage: 'prototype', status: 'upcoming' },
  { id: 'm2', title: 'HC-150 Testiranje', date: '2024-12-25', stage: 'testing', status: 'upcoming' },
  { id: 'm3', title: 'KP-200 Rev 3.3', date: '2025-01-10', stage: 'production', status: 'planned' },
  { id: 'm4', title: 'SM-60 Koncept', date: '2025-01-15', stage: 'concept', status: 'planned' },
  { id: 'm5', title: 'LM-250 CE sertifikacija', date: '2025-01-20', stage: 'testing', status: 'planned' },
]

export const MOCK_TTM_TREND = [
  { month: 'Jul', days: 145 },
  { month: 'Avg', days: 132 },
  { month: 'Sep', days: 128 },
  { month: 'Okt', days: 120 },
  { month: 'Nov', days: 115 },
  { month: 'Dec', days: 108 },
]

export const MOCK_COMPLEXITY_COST = [
  { name: 'KP-200', complexity: 82, cost: 12500, category: 'Elektronika' },
  { name: 'HC-150', complexity: 65, cost: 8900, category: 'Mehanika' },
  { name: 'ST-80', complexity: 45, cost: 3200, category: 'Elektronika' },
  { name: 'AK-300', complexity: 55, cost: 5600, category: 'Mehanika' },
  { name: 'PS-500', complexity: 90, cost: 15800, category: 'Elektronika' },
  { name: 'PM-100', complexity: 30, cost: 1800, category: 'Dizajn' },
  { name: 'SM-60', complexity: 75, cost: 11200, category: 'Mehanika' },
  { name: 'CP-12', complexity: 40, cost: 2800, category: 'Elektronika' },
  { name: 'VR-45', complexity: 60, cost: 7500, category: 'Mehanika' },
  { name: 'LM-250', complexity: 35, cost: 2100, category: 'Elektronika' },
]

export const MOCK_CHANGE_FREQ = [
  { name: 'CP-12', changes: 11 },
  { name: 'AK-300', changes: 9 },
  { name: 'VR-45', changes: 8 },
  { name: 'KP-200', changes: 7 },
  { name: 'PM-100', changes: 6 },
  { name: 'ST-80', changes: 5 },
  { name: 'HC-150', changes: 4 },
  { name: 'LM-250', changes: 3 },
]

export const MOCK_APPROVAL_CYCLE = [
  { range: '1-3 dana', count: 3 },
  { range: '4-7 dana', count: 5 },
  { range: '8-14 dana', count: 2 },
  { range: '15+ dana', count: 1 },
]

export const MOCK_TOP_INNOVATORS = [
  { name: 'Marko Petrović', approved: 8 },
  { name: 'Nenad Jovanović', approved: 6 },
  { name: 'Jelena Stanković', approved: 5 },
  { name: 'Ana Nikolić', approved: 4 },
  { name: 'Dejan Milić', approved: 3 },
]

export const { activeCompanyId } = useAppStore();
