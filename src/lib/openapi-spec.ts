// ─── OpenAPI Specification Generator ─────────────────────────────────────────
// Auto-generates OpenAPI 3.0 spec from the 384 API routes

const TAGS = [
  { name: 'Autentifikacija', description: 'Login, registracija, reset lozinke, verifikacija' },
  { name: 'Fakturisanje', description: 'Fakture, predračuni, ponavljajuće fakture, eFakture' },
  { name: 'Proizvodi', description: 'Katalog proizvoda i usluga' },
  { name: 'Partneri', description: 'Klijenti, dobavljači, analitika' },
  { name: 'CRM', description: 'Pipeline, deal-ovi, aktivnosti, automatizacija' },
  { name: 'Skladište', description: 'Zalihe, kretanja, lotovi, inventura, lokacije' },
  { name: 'HR', description: 'Zaposleni, plate, odsustva, regrutacija, evaluacije' },
  { name: 'Računovodstvo', description: 'Kontni plan, dnevnik, analitika, fiskalne godine, PDV' },
  { name: 'POS', description: 'Point of Sale, smene, narudžbe, sinhronizacija' },
  { name: 'Restoran', description: 'Meni, narudžbe, stoovi, kategorije, kuhinja' },
  { name: 'Nekretnine', description: 'Nekretnine, zakupi, procene, pregledi' },
  { name: 'Zdravstvo', description: 'Pacijenti, kartoni, recepti, laboratorija' },
  { name: 'Obrazovanje', description: 'Kursevi, časovi, knjižnica, upisi, raspored' },
  { name: 'Marketing', description: 'Email, SMS, društvene mreže, automatizacija' },
  { name: 'Logistika', description: 'Dostava, carina, pakovanje, rute, kamioni' },
  { name: 'Integracije', description: 'Import, export, konektori, parsiranje' },
  { name: 'Administracija', description: 'Settings, role, backup, API ključevi, webhooks' },
  { name: 'Vozi park', description: 'Vozila, servisi, troškovi, rent-a-car' },
  { name: 'Projekti', description: 'Projekti, taskovi' },
  { name: 'Proizvodnja', description: 'BOM, radni nalozi, PLM' },
  { name: 'Notifikacije', description: 'Notifikacije, generisanje' },
  { name: 'Fajlovi', description: 'Upload, download, brisanje fajlova' },
  { name: 'Kalendar', description: 'Kalendar događaja' },
  { name: 'Dokumenta', description: 'Dokumenta, podnesci' },
  { name: 'Blog', description: 'Blog postovi' },
  { name: 'Forum', description: 'Teme, odgovori, kategorije, tagovi' },
  { name: 'Događaji', description: 'Događaji, registracije, karte, venue' },
  { name: 'Trgovina', description: 'Cene, kuponi, recenzije, povrati, SEO' },
  { name: 'Servis', description: 'Terenski servis, radni nalozi, garancije' },
  { name: 'Fleet', description: 'Kamioni, troškovi, održavanje' },
  { name: 'Pakovanje', description: 'Pakovanje, utovar' },
  { name: 'Usluge', description: 'Terenski servis, zakazivanje, planer' },
]

// Route → Tag mapping
function getTag(path: string): string {
  const p = path.toLowerCase()
  if (p.includes('/auth/')) return 'Autentifikacija'
  if (p.includes('/invoice') || p.includes('/efaktur') || p.includes('/recurring-invoice')) return 'Fakturisanje'
  if (p.includes('/product') || p.includes('/stock') || p.includes('/warehouse') || p.includes('/lot') || p.includes('/inventory')) return 'Skladište'
  if (p.includes('/partner') || p.includes('/contact')) return 'Partneri'
  if (p.includes('/deal') || p.includes('/crm-') || p.includes('/crm/')) return 'CRM'
  if (p.includes('/employee') || p.includes('/payroll') || p.includes('/attendance') || p.includes('/leave') || p.includes('/recruitment') || p.includes('/evaluation')) return 'HR'
  if (p.includes('/account') || p.includes('/journal') || p.includes('/fiscal') || p.includes('/pdv') || p.includes('/protocol')) return 'Računovodstvo'
  if (p.includes('/pos/') || p.includes('/cash-register')) return 'POS'
  if (p.includes('/resto-') || p.includes('/kitchen')) return 'Restoran'
  if (p.includes('/propert') || p.includes('/rental') || p.includes('/utilit')) return 'Nekretnine'
  if (p.includes('/patient') || p.includes('/medical') || p.includes('/prescription') || p.includes('/lab') || p.includes('/health')) return 'Zdravstvo'
  if (p.includes('/course') || p.includes('/lesson') || p.includes('/homework') || p.includes('/timetable') || p.includes('/library') || p.includes('/classroom') || p.includes('/enrollment') || p.includes('/tuition')) return 'Obrazovanje'
  if (p.includes('/email-') || p.includes('/sms/') || p.includes('/social/') || p.includes('/marketing/')) return 'Marketing'
  if (p.includes('/shipping') || p.includes('/delivery') || p.includes('/customs') || p.includes('/packaging') || p.includes('/loading')) return 'Logistika'
  if (p.includes('/integrat') || p.includes('/import') || p.includes('/export') || p.includes('/sync')) return 'Integracije'
  if (p.includes('/setting') || p.includes('/role') || p.includes('/backup') || p.includes('/api-key') || p.includes('/webhook') || p.includes('/companies') || p.includes('/user')) return 'Administracija'
  if (p.includes('/vehicle') || p.includes('/rent-a-car') || p.includes('/fleet')) return 'Vozi park'
  if (p.includes('/project') || p.includes('/task')) return 'Projekti'
  if (p.includes('/manufactur') || p.includes('/plm') || p.includes('/bom') || p.includes('/work-order') || p.includes('/standard') || p.includes('/label')) return 'Proizvodnja'
  if (p.includes('/notification')) return 'Notifikacije'
  if (p.includes('/file')) return 'Fajlovi'
  if (p.includes('/calendar')) return 'Kalendar'
  if (p.includes('/document')) return 'Dokumenta'
  if (p.includes('/blog')) return 'Blog'
  if (p.includes('/forum')) return 'Forum'
  if (p.includes('/event') || p.includes('/venue') || p.includes('/ticket')) return 'Događaji'
  if (p.includes('/price-list') || p.includes('/coupon') || p.includes('/review') || p.includes('/return') || p.includes('/seo') || p.includes('/payment') || p.includes('/stores') || p.includes('/barcode') || p.includes('/cash-regist')) return 'Trgovina'
  if (p.includes('/field-service') || p.includes('/complaint') || p.includes('/warranty') || p.includes('/service-center') || p.includes('/compliance')) return 'Servis'
  if (p.includes('/truck')) return 'Fleet'
  if (p.includes('/route')) return 'Logistika'
  if (p.includes('/appointment') || p.includes('/planning')) return 'Usluge'
  if (p.includes('/chat') || p.includes('/discuss') || p.includes('/messaging') || p.includes('/voip') || p.includes('/knowledge')) return 'Administracija'
  return 'Ostalo'
}

function getDescription(path: string, method: string): string {
  const p = path.replace('/api/', '').replace(/\[.*?\]/g, ':id')
  const pathMap: Record<string, Record<string, string>> = {
    '/auth/login': { post: 'Prijavljivanje korisnika — vraća JWT token' },
    '/auth/register': { post: 'Registracija novog korisnika' },
    '/auth/forgot-password': { post: 'Zahtev za resetovanje lozinke' },
    '/auth/reset-password': { post: 'Resetovanje lozinke pomoću tokena' },
    '/auth/verify-email': { get: 'Verifikacija email adrese' },
    '/invoices': { get: 'Lista faktura (paginacija, filteri)', post: 'Kreiranje nove fakture' },
    '/invoices/:id': { get: 'Detalji fakture', put: 'Ažuriranje fakture', delete: 'Brisanje fakture' },
    '/invoices/:id/epc-qr': { get: 'Generisanje EPC QR koda' },
    '/invoices/post-to-journal': { post: 'Knjiženje fakture u dnevnik' },
    '/products': { get: 'Lista proizvoda', post: 'Kreiranje novog proizvoda' },
    '/partners': { get: 'Lista partnera', post: 'Kreiranje novog partnera' },
    '/contacts': { get: 'Lista kontakata', post: 'Kreiranje novog kontakta' },
    '/employees': { get: 'Lista zaposlenih', post: 'Kreiranje zaposlenog' },
    '/transactions': { get: 'Lista transakcija', post: 'Nova transakcija' },
    '/calendar': { get: 'Lista kalendarskih događaja', post: 'Novi događaj' },
    '/dashboard': { get: 'Dashboard KPI podaci' },
    '/reports/generate': { post: 'Generisanje izveštaja' },
    '/files': { get: 'Lista fajlova', post: 'Upload fajla' },
    '/files/:id': { get: 'Preuzimanje fajla', delete: 'Brisanje fajla' },
  }

  const cleanPath = '/' + path.replace('/api/', '')
  const entry = pathMap[cleanPath]
  if (entry && entry[method]) return entry[method]

  const methodVerbs: Record<string, string> = { get: 'Dobavi', post: 'Kreiraj', put: 'Ažuriraj', patch: 'Ažuriraj', delete: 'Obriši' }
  const verb = methodVerbs[method] || method.toUpperCase()
  return `${verb} ${p}`
}

// Generate OpenAPI spec
export function generateOpenAPISpec() {
  const paths: Record<string, any> = {}

  // All API routes
  const routes = [
    // Auth
    { path: '/api/auth/login', methods: ['POST'] },
    { path: '/api/auth/register', methods: ['POST'] },
    { path: '/api/auth/forgot-password', methods: ['POST'] },
    { path: '/api/auth/reset-password', methods: ['POST'] },
    { path: '/api/auth/verify-email', methods: ['GET'] },
    { path: '/api/auth/me', methods: ['GET'] },
    // Core
    { path: '/api/dashboard', methods: ['GET'] },
    { path: '/api/invoices', methods: ['GET', 'POST'] },
    { path: '/api/invoices/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/invoices/{id}/epc-qr', methods: ['GET'] },
    { path: '/api/invoices/post-to-journal', methods: ['POST'] },
    { path: '/api/recurring-invoices', methods: ['GET', 'POST'] },
    { path: '/api/recurring-invoices/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/recurring-invoices/{id}/generate', methods: ['POST'] },
    { path: '/api/recurring-invoices/check', methods: ['POST'] },
    { path: '/api/efakture/generate', methods: ['POST'] },
    { path: '/api/efakture/status', methods: ['GET'] },
    { path: '/api/products', methods: ['GET', 'POST'] },
    { path: '/api/products/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/partners', methods: ['GET', 'POST'] },
    { path: '/api/partners/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/partners/{id}/analytics', methods: ['GET'] },
    { path: '/api/partners/{id}/stats', methods: ['GET'] },
    { path: '/api/partners/stats', methods: ['GET'] },
    { path: '/api/contacts', methods: ['GET', 'POST'] },
    { path: '/api/contacts/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/transactions', methods: ['GET', 'POST'] },
    { path: '/api/transactions/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/bank-accounts', methods: ['GET', 'POST'] },
    { path: '/api/bank-accounts/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/bank-transactions', methods: ['GET', 'POST'] },
    { path: '/api/bank-transactions/{id}/match', methods: ['POST'] },
    { path: '/api/bank-transactions/import', methods: ['POST'] },
    { path: '/api/bank-transactions/reconcile', methods: ['POST'] },
    { path: '/api/budgets', methods: ['GET', 'POST'] },
    { path: '/api/budgets/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/stock', methods: ['GET'] },
    { path: '/api/stock/movement', methods: ['GET', 'POST'] },
    { path: '/api/stock/movement/{id}', methods: ['DELETE'] },
    { path: '/api/stock/transfer', methods: ['POST'] },
    { path: '/api/warehouse-locations', methods: ['GET', 'POST'] },
    { path: '/api/warehouse-locations/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/lots', methods: ['GET', 'POST'] },
    { path: '/api/lots/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/inventory-counts', methods: ['GET', 'POST'] },
    { path: '/api/inventory-counts/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/calendar', methods: ['GET', 'POST'] },
    { path: '/api/calendar/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/documents', methods: ['GET', 'POST'] },
    { path: '/api/documents/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    // CRM
    { path: '/api/crm-activities', methods: ['GET', 'POST'] },
    { path: '/api/crm-activities/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/deals', methods: ['GET', 'POST'] },
    { path: '/api/deals/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/deals/recalculate-scores', methods: ['POST'] },
    { path: '/api/crm-automation-rules', methods: ['GET', 'POST'] },
    { path: '/api/crm-automation-rules/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    // HR
    { path: '/api/employees', methods: ['GET', 'POST'] },
    { path: '/api/employees/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/employees/stats', methods: ['GET'] },
    { path: '/api/payroll', methods: ['GET', 'POST'] },
    { path: '/api/payroll/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/attendances', methods: ['GET', 'POST'] },
    { path: '/api/attendances/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/leave-requests', methods: ['GET', 'POST'] },
    { path: '/api/leave-requests/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/leave-requests/dashboard', methods: ['GET'] },
    { path: '/api/recruitment/jobs', methods: ['GET', 'POST'] },
    { path: '/api/recruitment/jobs/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/recruitment/jobs/dashboard', methods: ['GET'] },
    { path: '/api/employee-evaluations', methods: ['GET', 'POST'] },
    { path: '/api/employee-evaluations/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/time-tracking', methods: ['GET', 'POST'] },
    { path: '/api/timesheets', methods: ['GET', 'POST'] },
    { path: '/api/time-billing', methods: ['GET', 'POST'] },
    // POS
    { path: '/api/pos/dashboard', methods: ['GET'] },
    { path: '/api/pos/orders', methods: ['GET', 'POST'] },
    { path: '/api/pos/shifts', methods: ['GET', 'POST'] },
    { path: '/api/pos/shifts/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/pos/sync', methods: ['POST'] },
    { path: '/api/cash-register', methods: ['GET', 'POST'] },
    { path: '/api/cash-register/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    // Restaurant
    { path: '/api/resto-orders', methods: ['GET', 'POST'] },
    { path: '/api/resto-orders/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/resto-menu-items', methods: ['GET', 'POST'] },
    { path: '/api/resto-menu-items/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/resto-tables', methods: ['GET', 'POST'] },
    { path: '/api/resto-tables/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/resto-categories', methods: ['GET', 'POST'] },
    { path: '/api/resto-categories/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/kitchen-items', methods: ['GET', 'POST'] },
    { path: '/api/kitchen-items/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/reservations', methods: ['GET', 'POST'] },
    { path: '/api/reservations/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/menu', methods: ['GET'] },
    { path: '/api/orders', methods: ['GET', 'POST'] },
    { path: '/api/orders/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/delivery', methods: ['GET', 'POST'] },
    { path: '/api/delivery/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    // Accounting
    { path: '/api/accounts', methods: ['GET', 'POST'] },
    { path: '/api/accounts/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/accounts/statement', methods: ['GET'] },
    { path: '/api/accounts/trial-balance', methods: ['GET'] },
    { path: '/api/accounts/import-serbian', methods: ['POST'] },
    { path: '/api/journal-entries', methods: ['GET', 'POST'] },
    { path: '/api/journal-entries/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/journal', methods: ['GET'] },
    { path: '/api/fiscal-periods', methods: ['GET', 'POST'] },
    { path: '/api/fiscal-periods/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/accounting/dashboard', methods: ['GET'] },
    { path: '/api/accounting/analitika', methods: ['GET'] },
    { path: '/api/accounting/analytic', methods: ['GET'] },
    { path: '/api/accounting/pdv-report', methods: ['GET'] },
    { path: '/api/accounting/pdv', methods: ['GET'] },
    { path: '/api/accounting/close-fiscal-year', methods: ['POST'] },
    { path: '/api/accounting/year-close', methods: ['POST'] },
    // Properties
    { path: '/api/properties', methods: ['GET', 'POST'] },
    { path: '/api/properties/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/rentals', methods: ['GET', 'POST'] },
    { path: '/api/rentals/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/property-viewings', methods: ['GET', 'POST'] },
    { path: '/api/property-viewings/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/utilities', methods: ['GET', 'POST'] },
    { path: '/api/utilities/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    // Healthcare
    { path: '/api/patients', methods: ['GET', 'POST'] },
    { path: '/api/patients/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/medical-records', methods: ['GET', 'POST'] },
    { path: '/api/medical-records/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/prescriptions', methods: ['GET', 'POST'] },
    { path: '/api/prescriptions/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/lab', methods: ['GET', 'POST'] },
    { path: '/api/lab/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    // Education
    { path: '/api/courses', methods: ['GET', 'POST'] },
    { path: '/api/courses/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/lessons', methods: ['GET', 'POST'] },
    { path: '/api/lessons/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/homework', methods: ['GET', 'POST'] },
    { path: '/api/homework/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/timetable', methods: ['GET', 'POST'] },
    { path: '/api/timetable/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/library', methods: ['GET', 'POST'] },
    { path: '/api/library/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/classrooms', methods: ['GET', 'POST'] },
    { path: '/api/classrooms/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/enrollment', methods: ['GET', 'POST'] },
    { path: '/api/enrollment/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/tuition', methods: ['GET', 'POST'] },
    { path: '/api/tuition/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    // Marketing
    { path: '/api/email-campaigns', methods: ['GET', 'POST'] },
    { path: '/api/email-campaigns/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/email-lists', methods: ['GET', 'POST'] },
    { path: '/api/email-lists/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/email-subscribers', methods: ['GET', 'POST'] },
    { path: '/api/email-subscribers/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/email-templates', methods: ['GET', 'POST'] },
    { path: '/api/email-templates/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/email/send', methods: ['POST'] },
    { path: '/api/email/batch', methods: ['POST'] },
    { path: '/api/email/templates', methods: ['GET'] },
    { path: '/api/sms/campaigns', methods: ['GET', 'POST'] },
    { path: '/api/sms/campaigns/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/social/posts', methods: ['GET', 'POST'] },
    { path: '/api/social/posts/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/marketing/workflows', methods: ['GET', 'POST'] },
    { path: '/api/marketing/workflows/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    // Logistics
    { path: '/api/shipping/dashboard', methods: ['GET'] },
    { path: '/api/shipping/carriers', methods: ['GET', 'POST'] },
    { path: '/api/shipping/orders', methods: ['GET', 'POST'] },
    { path: '/api/delivery-notes', methods: ['GET', 'POST'] },
    { path: '/api/delivery-notes/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/customs-docs', methods: ['GET', 'POST'] },
    { path: '/api/customs-docs/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/packaging', methods: ['GET', 'POST'] },
    { path: '/api/packaging/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/loading-docks', methods: ['GET', 'POST'] },
    { path: '/api/loading-docks/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/routes', methods: ['GET', 'POST'] },
    { path: '/api/routes/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/trucks', methods: ['GET', 'POST'] },
    { path: '/api/trucks/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/trucks/costs', methods: ['GET', 'POST'] },
    { path: '/api/trucks/costs/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/trucks/maintenance', methods: ['GET', 'POST'] },
    { path: '/api/trucks/maintenance/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    // Vehicles
    { path: '/api/vehicles', methods: ['GET', 'POST'] },
    { path: '/api/vehicles/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/vehicle-services', methods: ['GET', 'POST'] },
    { path: '/api/vehicle-services/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/vehicle-expenses', methods: ['GET', 'POST'] },
    { path: '/api/vehicle-expenses/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/rental-vehicles', methods: ['GET', 'POST'] },
    { path: '/api/rental-vehicles/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    // Admin
    { path: '/api/settings', methods: ['GET', 'POST'] },
    { path: '/api/roles', methods: ['GET', 'POST'] },
    { path: '/api/roles/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/companies', methods: ['GET', 'POST'] },
    { path: '/api/companies/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/companies/{id}/settings', methods: ['GET', 'PUT'] },
    { path: '/api/companies/{id}/modules', methods: ['GET', 'PUT'] },
    { path: '/api/companies/{id}/users', methods: ['GET', 'POST'] },
    { path: '/api/companies/{id}/users/{userId}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/users', methods: ['GET', 'PUT'] },
    { path: '/api/api-keys', methods: ['GET', 'POST'] },
    { path: '/api/webhooks', methods: ['GET', 'POST'] },
    { path: '/api/webhooks/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/audit-logs', methods: ['GET'] },
    { path: '/api/backups', methods: ['GET', 'POST'] },
    { path: '/api/backups/{id}', methods: ['GET', 'DELETE'] },
    { path: '/api/backups/schedules', methods: ['GET', 'POST'] },
    { path: '/api/backups/schedules/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/notifications', methods: ['GET', 'POST'] },
    { path: '/api/notifications/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/notifications/generate', methods: ['POST'] },
    { path: '/api/notifications/read-all', methods: ['POST'] },
    { path: '/api/tenant', methods: ['GET', 'POST'] },
    { path: '/api/tenant/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/usage', methods: ['GET'] },
    { path: '/api/seed', methods: ['POST'] },
    { path: '/api/search', methods: ['GET'] },
    // Projects
    { path: '/api/projects', methods: ['GET', 'POST'] },
    { path: '/api/projects/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/project-tasks', methods: ['GET', 'POST'] },
    { path: '/api/assets', methods: ['GET', 'POST'] },
    { path: '/api/assets/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/maintenance/orders', methods: ['GET', 'POST'] },
    { path: '/api/maintenance/orders/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/maintenance/orders/dashboard', methods: ['GET'] },
    { path: '/api/manufacturing', methods: ['GET', 'POST'] },
    { path: '/api/manufacturing/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/manufacturing/bom', methods: ['GET', 'POST'] },
    { path: '/api/manufacturing/bom/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/manufacturing/orders', methods: ['GET', 'POST'] },
    { path: '/api/manufacturing/orders/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/plm', methods: ['GET', 'POST'] },
    { path: '/api/plm/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/protocol', methods: ['GET', 'POST'] },
    { path: '/api/protocol/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    // Files
    { path: '/api/files', methods: ['GET', 'POST'] },
    { path: '/api/files/{id}', methods: ['GET', 'DELETE'] },
    { path: '/api/files/{id}/download', methods: ['GET'] },
    // Blog
    { path: '/api/blog/posts', methods: ['GET', 'POST'] },
    { path: '/api/blog/posts/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    // Forum
    { path: '/api/forum-topics', methods: ['GET', 'POST'] },
    { path: '/api/forum-topics/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/forum-replies', methods: ['GET', 'POST'] },
    { path: '/api/forum-replies/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/forum-categories', methods: ['GET', 'POST'] },
    { path: '/api/forum-categories/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/forum-tags', methods: ['GET', 'POST'] },
    { path: '/api/forum-tags/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    // Events
    { path: '/api/events', methods: ['GET', 'POST'] },
    { path: '/api/events/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/event-registrations', methods: ['GET', 'POST'] },
    { path: '/api/event-registrations/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/event-tickets', methods: ['GET', 'POST'] },
    { path: '/api/event-tickets/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/event-venues', methods: ['GET', 'POST'] },
    { path: '/api/event-venues/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    // Marketplace
    { path: '/api/marketplace/dashboard', methods: ['GET'] },
    { path: '/api/marketplace/products', methods: ['GET', 'POST'] },
    { path: '/api/marketplace/products/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/marketplace/orders', methods: ['GET', 'POST'] },
    { path: '/api/marketplace/orders/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/marketplace/vendors', methods: ['GET', 'POST'] },
    { path: '/api/marketplace/vendors/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/marketplace/reviews', methods: ['GET'] },
    { path: '/api/marketplace/disputes', methods: ['GET', 'POST'] },
    { path: '/api/marketplace/disputes/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/marketplace/coupons', methods: ['GET', 'POST'] },
    // Trade
    { path: '/api/price-lists', methods: ['GET', 'POST'] },
    { path: '/api/price-lists/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/price-lists-v2', methods: ['GET', 'POST'] },
    { path: '/api/price-lists-v2/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/coupons', methods: ['GET', 'POST'] },
    { path: '/api/coupons/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/reviews', methods: ['GET', 'POST'] },
    { path: '/api/reviews/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/returns', methods: ['GET', 'POST'] },
    { path: '/api/returns/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/seo-pages', methods: ['GET', 'POST'] },
    { path: '/api/payments', methods: ['GET', 'POST'] },
    { path: '/api/payments/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/stores', methods: ['GET', 'POST'] },
    { path: '/api/stores/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/barcode-items', methods: ['GET', 'POST'] },
    { path: '/api/barcode-items/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/barcodes/generate', methods: ['POST'] },
    { path: '/api/sales-orders', methods: ['GET', 'POST'] },
    { path: '/api/sales-orders/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/sales-orders/dashboard', methods: ['GET'] },
    { path: '/api/purchase-orders', methods: ['GET', 'POST'] },
    { path: '/api/purchase-orders/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/expenses', methods: ['GET', 'POST'] },
    { path: '/api/expenses/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/subscriptions', methods: ['GET', 'POST'] },
    { path: '/api/subscriptions/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    // Services
    { path: '/api/field-service/orders', methods: ['GET', 'POST'] },
    { path: '/api/field-service/orders/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/field-service/orders/dashboard', methods: ['GET'] },
    { path: '/api/appointments', methods: ['GET', 'POST'] },
    { path: '/api/appointments/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/appointments/dashboard', methods: ['GET'] },
    { path: '/api/planning/slots', methods: ['GET', 'POST'] },
    { path: '/api/planning/slots/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/complaints', methods: ['GET', 'POST'] },
    { path: '/api/complaints/stats', methods: ['GET'] },
    { path: '/api/work-orders', methods: ['GET', 'POST'] },
    { path: '/api/helpdesk/tickets', methods: ['GET', 'POST'] },
    { path: '/api/helpdesk/tickets/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/helpdesk/tickets/dashboard', methods: ['GET'] },
    // Other
    { path: '/api/approvals/dashboard', methods: ['GET'] },
    { path: '/api/contracts/dashboard', methods: ['GET'] },
    { path: '/api/signing-requests', methods: ['GET', 'POST'] },
    { path: '/api/signing-requests/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/signing-requests/dashboard', methods: ['GET'] },
    { path: '/api/skills/dashboard', methods: ['GET'] },
    { path: '/api/referrals', methods: ['GET', 'POST'] },
    { path: '/api/referrals/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/referrals/dashboard', methods: ['GET'] },
    { path: '/api/ratings/dashboard', methods: ['GET'] },
    { path: '/api/gamification', methods: ['GET', 'POST'] },
    { path: '/api/gamification/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/surveys', methods: ['GET', 'POST'] },
    { path: '/api/surveys/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/loyalty', methods: ['GET'] },
    { path: '/api/visitors/dashboard', methods: ['GET'] },
    { path: '/api/suggestions', methods: ['GET'] },
    { path: '/api/valuation', methods: ['GET'] },
    { path: '/api/tenders', methods: ['GET'] },
    { path: '/api/warranty', methods: ['GET'] },
    { path: '/api/service-center', methods: ['GET'] },
    { path: '/api/compliance', methods: ['GET'] },
    { path: '/api/geolocation', methods: ['GET'] },
    { path: '/api/cameras', methods: ['GET'] },
    { path: '/api/iot', methods: ['GET'] },
    { path: '/api/notes/dashboard', methods: ['GET'] },
    { path: '/api/spreadsheet', methods: ['GET'] },
    { path: '/api/knowledge-base', methods: ['GET', 'POST'] },
    { path: '/api/knowledge-base/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/discuss/channels', methods: ['GET', 'POST'] },
    { path: '/api/discuss/channels/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/voip', methods: ['GET', 'POST'] },
    { path: '/api/voip/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/voip/calls', methods: ['GET', 'POST'] },
    { path: '/api/website/pages', methods: ['GET', 'POST'] },
    { path: '/api/website/pages/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/reports/generate', methods: ['POST'] },
    { path: '/api/tax-laws', methods: ['GET'] },
    { path: '/api/tax-laws/calculate', methods: ['POST'] },
    { path: '/api/tax-laws/update', methods: ['POST'] },
    { path: '/api/integrations/connectors', methods: ['GET', 'POST'] },
    { path: '/api/integrations/connectors/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/integrations/connectors/{id}/sync', methods: ['POST'] },
    { path: '/api/integrations/import', methods: ['POST'] },
    { path: '/api/integrations/export', methods: ['POST'] },
    { path: '/api/integrations/jobs', methods: ['GET'] },
    { path: '/api/integrations/templates', methods: ['GET'] },
    { path: '/api/integrations/sync-logs', methods: ['GET'] },
    { path: '/api/integrations/ai-map', methods: ['GET'] },
    { path: '/api/integrations/parse-csv', methods: ['POST'] },
    { path: '/api/import', methods: ['POST'] },
    { path: '/api/export', methods: ['POST'] },
    { path: '/api/industry-templates', methods: ['GET'] },
    { path: '/api/client-portal', methods: ['GET'] },
    { path: '/api/client-portal/docs', methods: ['GET', 'POST'] },
    { path: '/api/client-portal/docs/{id}', methods: ['GET', 'DELETE'] },
    { path: '/api/client-portal/invoices', methods: ['GET'] },
    { path: '/api/client-portal/invoices/{id}', methods: ['GET'] },
    { path: '/api/client-portal/orders', methods: ['GET'] },
    { path: '/api/client-portal/orders/{id}', methods: ['GET'] },
    { path: '/api/client-portal/tickets', methods: ['GET', 'POST'] },
    { path: '/api/client-portal/tickets/{id}', methods: ['GET', 'PUT'] },
    { path: '/api/safety', methods: ['GET'] },
    { path: '/api/standards', methods: ['GET', 'POST'] },
    { path: '/api/standards/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/measurements', methods: ['GET', 'POST'] },
    { path: '/api/measurements/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/labels', methods: ['GET', 'POST'] },
    { path: '/api/labels/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/construction-sites', methods: ['GET', 'POST'] },
    { path: '/api/construction-sites/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/blueprints', methods: ['GET', 'POST'] },
    { path: '/api/blueprints/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/subcontractors', methods: ['GET'] },
    { path: '/api/quality/inspections', methods: ['GET', 'POST'] },
    { path: '/api/quality/inspections/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/quality/inspections/dashboard', methods: ['GET'] },
    { path: '/api/wms/dashboard', methods: ['GET'] },
    { path: '/api/wms/waves', methods: ['GET', 'POST'] },
    { path: '/api/wms/waves/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/wms/receiving', methods: ['GET', 'POST'] },
    { path: '/api/wms/receiving/{id}', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/api/wms/putaway', methods: ['POST'] },
    { path: '/api/i18n/translate', methods: ['POST'] },
    { path: '/api/i18n/translate-content', methods: ['POST'] },
    { path: '/api/ai-assistant', methods: ['POST'] },
    { path: '/api/ai-modules', methods: ['GET'] },
    { path: '/api/ai-team', methods: ['GET', 'POST'] },
    { path: '/api/ecommerce', methods: ['GET'] },
    { path: '/api/chat', methods: ['GET'] },
    { path: '/api/bank-sync', methods: ['GET'] },
    { path: '/api/laws', methods: ['GET'] },
    { path: '/api/migration/legacy-accounting', methods: ['POST'] },
  ]

  const responses = {
    200: { description: 'Uspešno' },
    201: { description: 'Kreirano uspešno' },
    400: { description: 'Neispravni podaci', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
    401: { description: 'Neautorizovan pristup' },
    403: { description: 'Nemate dozvolu' },
    404: { description: 'Resurs nije pronađen' },
    429: { description: 'Previše zahteva (rate limited)' },
    500: { description: 'Interna greška servera' },
  }

  for (const route of routes) {
    if (!paths[route.path]) paths[route.path] = {}
    const tag = getTag(route.path)

    for (const method of route.methods) {
      const methodLower = method.toLowerCase() as 'get' | 'post' | 'put' | 'patch' | 'delete'
      paths[route.path][methodLower] = {
        summary: getDescription(route.path, methodLower),
        operationId: `${methodLower}${route.path.replace(/[\/{}]/g, '_').substring(1)}`,
        tags: [tag],
        security: route.path.includes('/auth/login') || route.path.includes('/auth/register') || route.path.includes('/seed') ? [] : [{ bearerAuth: [] }],
        parameters: route.path.includes('{id}') ? [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID resursa' }
        ] : [],
        responses: {
          ...(methodLower === 'post' ? { 201: responses[201] } : { 200: responses[200] }),
          400: responses[400],
          401: responses[401],
          403: responses[403],
          404: responses[404],
          500: responses[500],
        },
      }

      // Add request body for POST/PUT/PATCH
      if (['post', 'put', 'patch'].includes(methodLower)) {
        paths[route.path][methodLower].requestBody = {
          description: 'Podaci zahteva',
          content: { 'application/json': { schema: { type: 'object' } } },
        }
      }
    }
  }

  return {
    openapi: '3.0.3',
    info: {
      title: 'Reflection Business ERP API',
      version: '1.0.0',
      description: 'Kompletna ERP/CRM API za upravljanje biznisom. Pokriva finansije, fakturisanje, skladište, CRM, HR, proizvodnju, logistiku, nekretnine, zdravstvo, obrazovanje, marketing i još mnogo toga.',
      contact: { name: 'Reflection Business', email: 'api@reflection.rs', url: 'https://reflection.rs' },
      license: { name: 'Proprietary' },
    },
    servers: [{ url: '/', description: 'Trenutni server (gateway)' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', description: 'JWT token dobijen putem /api/auth/login' },
        apiKeyAuth: { type: 'apiKey', in: 'query', name: 'apiKey', description: 'API ključ generisan u Settings' },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', description: 'Poruka o grešci' },
            details: { type: 'object', description: 'Detalji greške (validaciona greška)' },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            data: { type: 'array', items: { type: 'object' } },
            total: { type: 'number' },
            page: { type: 'number' },
            limit: { type: 'number' },
          },
        },
      },
    },
    tags: TAGS,
    paths,
  }
}

export type OpenAPISpec = ReturnType<typeof generateOpenAPISpec>
