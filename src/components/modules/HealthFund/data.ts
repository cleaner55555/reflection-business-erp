export const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  paid: { label: 'Plaćeno', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  pending: { label: 'Na čekanju', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  rejected: { label: 'Odbijeno', color: 'bg-red-50 text-red-700 border-red-200' },
  submitted: { label: 'Podneto', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  approved: { label: 'Odobreno', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
}

export const SERVICE_TYPES = [
  'Opšta praksa', 'Specijalistički pregled', 'Laboratorija', 'Dijagnostika',
  'Hospitalizacija', 'Stomatologija', 'Fizikalna terapija', 'Apoteka',
  'Hirurgija', 'Mentalno zdravlje'
]

export const formatCurrency = (val: number) => {
  return `${val.toLocaleString('sr-RS')} RSD`
}

export const formatShort = (val: number) => {
  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M RSD`
  if (val >= 1000) return `${(val / 1000).toFixed(0)}K RSD`
  return `${val.toFixed(0)} RSD`
}

export const mockContributions: Contribution[] = [
  { id: 'd-1', employeeId: 'e1', employeeName: 'Jelena Marković', month: 'januar', year: 2025, baseAmount: 120000, employerShare: 16200, employeeShare: 9240, totalAmount: 25440, status: 'paid', paymentDate: '2025-01-31', dueDate: '2025-01-31', createdAt: '2025-01-05' },
  { id: 'd-2', employeeId: 'e2', employeeName: 'Dragan Petrović', month: 'januar', year: 2025, baseAmount: 95000, employerShare: 12825, employeeShare: 7310, totalAmount: 20135, status: 'paid', paymentDate: '2025-01-30', dueDate: '2025-01-31', createdAt: '2025-01-05' },
  { id: 'd-3', employeeId: 'e3', employeeName: 'Ana Stanković', month: 'januar', year: 2025, baseAmount: 110000, employerShare: 14850, employeeShare: 8470, totalAmount: 23320, status: 'pending', paymentDate: null, dueDate: '2025-01-31', createdAt: '2025-01-08' },
  { id: 'd-4', employeeId: 'e4', employeeName: 'Milan Ilić', month: 'januar', year: 2025, baseAmount: 88000, employerShare: 11880, employeeShare: 6776, totalAmount: 18656, status: 'paid', paymentDate: '2025-01-29', dueDate: '2025-01-31', createdAt: '2025-01-05' },
  { id: 'd-5', employeeId: 'e5', employeeName: 'Sara Jovanović', month: 'januar', year: 2025, baseAmount: 75000, employerShare: 10125, employeeShare: 5775, totalAmount: 15900, status: 'rejected', paymentDate: null, dueDate: '2025-01-31', createdAt: '2025-01-10' },
  { id: 'd-6', employeeId: 'e6', employeeName: 'Nikola Đorđević', month: 'decembar', year: 2024, baseAmount: 105000, employerShare: 14175, employeeShare: 8085, totalAmount: 22260, status: 'paid', paymentDate: '2024-12-30', dueDate: '2024-12-31', createdAt: '2024-12-05' },
  { id: 'd-7', employeeId: 'e7', employeeName: 'Ivana Kovačević', month: 'decembar', year: 2024, baseAmount: 130000, employerShare: 17550, employeeShare: 10010, totalAmount: 27560, status: 'paid', paymentDate: '2024-12-31', dueDate: '2024-12-31', createdAt: '2024-12-05' },
  { id: 'd-8', employeeId: 'e8', employeeName: 'Marko Nikolić', month: 'decembar', year: 2024, baseAmount: 92000, employerShare: 12420, employeeShare: 7084, totalAmount: 19504, status: 'paid', paymentDate: '2024-12-28', dueDate: '2024-12-31', createdAt: '2024-12-05' },
  { id: 'd-9', employeeId: 'e1', employeeName: 'Jelena Marković', month: 'decembar', year: 2024, baseAmount: 120000, employerShare: 16200, employeeShare: 9240, totalAmount: 25440, status: 'paid', paymentDate: '2024-12-31', dueDate: '2024-12-31', createdAt: '2024-12-05' },
  { id: 'd-10', employeeId: 'e2', employeeName: 'Dragan Petrović', month: 'decembar', year: 2024, baseAmount: 95000, employerShare: 12825, employeeShare: 7310, totalAmount: 20135, status: 'paid', paymentDate: '2024-12-30', dueDate: '2024-12-31', createdAt: '2024-12-05' },
]

export const mockClaims: HealthClaim[] = [
  { id: 'z-1', employeeId: 'e1', employeeName: 'Jelena Marković', claimNumber: 'FZ-2025-0001', status: 'paid', amount: 8500, approvedAmount: 8500, serviceType: 'Specijalistički pregled', diagnosisCode: 'J06.9', diagnosisName: 'Infekcija gornjih disajnih puteva', providerName: 'Dom zdravlja Stari Grad', serviceDate: '2025-01-10', submittedDate: '2025-01-12', processedDate: '2025-01-20', notes: 'Pregled kod otorinolaringologa' },
  { id: 'z-2', employeeId: 'e3', employeeName: 'Ana Stanković', claimNumber: 'FZ-2025-0002', status: 'approved', amount: 15200, approvedAmount: 12800, serviceType: 'Laboratorija', diagnosisCode: 'E11.9', diagnosisName: 'Dijabetes tip 2', providerName: 'Medicinski laboratorij Beograd', serviceDate: '2025-01-05', submittedDate: '2025-01-08', processedDate: '2025-01-18', notes: 'Kontrolni panel - HbA1c, lipidi' },
  { id: 'z-3', employeeId: 'e4', employeeName: 'Milan Ilić', claimNumber: 'FZ-2025-0003', status: 'submitted', amount: 22000, approvedAmount: null, serviceType: 'Dijagnostika', diagnosisCode: 'M54.5', diagnosisName: 'Lumbalni sindrom', providerName: 'Klinički centar Srbije', serviceDate: '2025-01-15', submittedDate: '2025-01-22', processedDate: null, notes: 'MRI lumbalnog dela kičme' },
  { id: 'z-4', employeeId: 'e5', employeeName: 'Sara Jovanović', claimNumber: 'FZ-2025-0004', status: 'rejected', amount: 6300, approvedAmount: 0, serviceType: 'Stomatologija', diagnosisCode: 'K04.7', diagnosisName: 'Apsces zuba', providerName: 'Stomatološka ordinacija DentalArt', serviceDate: '2025-01-08', submittedDate: '2025-01-10', processedDate: '2025-01-16', notes: 'Nije pokrivena usluga estetske stomatologije' },
  { id: 'z-5', employeeId: 'e6', employeeName: 'Nikola Đorđević', claimNumber: 'FZ-2024-0089', status: 'paid', amount: 45000, approvedAmount: 38500, serviceType: 'Hospitalizacija', diagnosisCode: 'I21.0', diagnosisName: 'Akutni infarkt miokarda', providerName: 'Klinika za kardiovaskularne bolesti', serviceDate: '2024-12-10', submittedDate: '2024-12-15', processedDate: '2024-12-28', notes: 'Hitna hospitalizacija 5 dana' },
  { id: 'z-6', employeeId: 'e7', employeeName: 'Ivana Kovačević', claimNumber: 'FZ-2025-0005', status: 'submitted', amount: 12000, approvedAmount: null, serviceType: 'Fizikalna terapija', diagnosisCode: 'M17.1', diagnosisName: 'Primarna gonartroza', providerName: 'Rehabilitacioni centar Vračar', serviceDate: '2025-01-18', submittedDate: '2025-01-25', processedDate: null, notes: 'Serija od 10 tretmana fizikalne terapije' },
  { id: 'z-7', employeeId: 'e8', employeeName: 'Marko Nikolić', claimNumber: 'FZ-2025-0006', status: 'approved', amount: 4800, approvedAmount: 4200, serviceType: 'Opšta praksa', diagnosisCode: 'J00', diagnosisName: 'Akutni faringitis', providerName: 'Dom zdravlja Novi Beograd', serviceDate: '2025-01-20', submittedDate: '2025-01-21', processedDate: '2025-01-23', notes: 'Lekarski pregled i recept' },
  { id: 'z-8', employeeId: 'e2', employeeName: 'Dragan Petrović', claimNumber: 'FZ-2024-0085', status: 'paid', amount: 18500, approvedAmount: 16200, serviceType: 'Apoteka', diagnosisCode: 'K29.5', diagnosisName: 'Hronični gastritis', providerName: 'Apoteka Jevremovac', serviceDate: '2024-12-05', submittedDate: '2024-12-08', processedDate: '2024-12-18', notes: 'Lekovi na recept - PPI i antacidi' },
]

export const mockStats: FundStats = {
  totalContributions: 238760,
  monthlyTotal: 103451,
  employerShare: 79005,
  employeeShare: 44581,
  pendingClaims: 3,
  totalClaims: 8,
  approvedClaims: 4,
  paidClaims: 2,
  rejectedClaims: 1,
  utilizationRate: 62,
  avgClaimAmount: 16538,
  monthlyTrend: [
    { month: 'Avg', contributions: 95000, claims: 12000 },
    { month: 'Sep', contributions: 98000, claims: 8500 },
    { month: 'Okt', contributions: 102000, claims: 18000 },
    { month: 'Nov', contributions: 101000, claims: 15000 },
    { month: 'Dec', contributions: 135309, claims: 72300 },
    { month: 'Jan', contributions: 103451, claims: 43700 },
  ],
  topCategories: [
    { category: 'Hospitalizacija', count: 1, amount: 45000 },
    { category: 'Dijagnostika', count: 1, amount: 22000 },
    { category: 'Laboratorija', count: 1, amount: 15200 },
    { category: 'Specijalistički pregled', count: 1, amount: 8500 },
    { category: 'Fizikalna terapija', count: 1, amount: 12000 },
    { category: 'Apoteka', count: 1, amount: 18500 },
    { category: 'Stomatologija', count: 1, amount: 6300 },
  ],
  yearlyTotals: [
    { year: 2023, contributions: 820000, claims: 340000, balance: 480000 },
    { year: 2024, contributions: 1150000, claims: 520000, balance: 630000 },
    { year: 2025, contributions: 103451, claims: 43700, balance: 59751 },
  ],
}

export const { activeCompanyId } = useAppStore();
