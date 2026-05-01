# REFLECTION Business SaaS — Master Plan

> **Product Name**: Reflection Business  
> **Type**: Multi-tenant SaaS ERP Platform  
> **License**: Commercial SaaS  
> **Target**: Small-to-medium businesses worldwide (80+ countries)

---

## 1. BRAND CLEANUP

### 1.1 Remove all third-party brand references
- [ ] `/src/lib/rbac.ts` line 22: Remove "Odoo-style" comment
- [ ] Search all files for: `odoo`, `Odoo`, `ODOO`, `bitnami`, `BN`, `erpnext`, `sap`, `oracle`
- [ ] Replace with "Reflection Business" where applicable
- [ ] Update package.json name/description
- [ ] Update any README or docs

### 1.2 Branding guidelines
- Product name: **Reflection Business** (or **Refleksija Poslovanje** for Serbian market)
- Short name: **Reflection**
- Domain: reflection.business (suggested)
- All UI text: "Reflection Business" branding only
- No competitor names in code, comments, or UI

---

## 2. WINDOW MANAGER — Virtual Desktop UI

### 2.1 Reference: WP Desktop Mode (WordPress plugin)
- GitHub: https://github.com/WordPress/desktop-mode
- Key features: draggable, resizable, minimizable windows on desktop, dock menu
- Reimagines admin as a desktop OS interface

### 2.2 Core Window Manager Features

#### Window System
- **Draggable windows** — drag title bar to move anywhere on desktop
- **Resizable windows** — drag edges/corners to resize (min/max width/height)
- **Minimize** — minimize to dock/taskbar with animation
- **Maximize/Restore** — double-click title bar or maximize button
- **Close** — close window with animation
- **Snap to edges** — snap left half, right half, top half, bottom half, corners (quarter)
- **Snap to other windows** — when dragging near another window edge, snap side-by-side
- **Always on top** — pin window option
- **Minimize to tray** — option to hide instead of close
- **Window z-index management** — click to bring to front
- **Cascade/Tile** — auto-arrange all open windows
- **Remember window positions** — save layout per user in localStorage

#### Dock / Taskbar (bottom)
- Shows icons for open windows (with indicator dot)
- Minimized window previews on hover
- Quick-launch shortcuts for pinned modules
- System tray area (notifications, language, theme)
- Clock / calendar widget
- "Show Desktop" button (far right)

#### Virtual Desktops (Workspaces)
- Multiple virtual desktops (like Linux workspaces / Windows 11)
- Default desktops: "Main", "Communication", "Analytics"
- User can add/remove/rename desktops
- Drag windows between desktops
- Desktop switcher indicator (dots or thumbnails)
- Keyboard shortcuts: Ctrl+1/2/3 for desktop switch

#### Desktop Background
- Clean desktop with wallpaper (customizable or default gradient)
- Desktop icons for quick module access
- Right-click context menu (New Window, Settings, Arrange Windows, etc.)

#### Window Menu Bar
- Each window has: Icon + Title | Minimize | Maximize | Close
- Optional menu bar per window (File, Edit, View, Tools, Help)

### 2.3 Technical Implementation

```
src/components/window-manager/
├── Desktop.tsx          — Main desktop container (background, workspace switcher)
├── Dock.tsx             — Bottom dock/taskbar
├── WindowManager.tsx    — Window state manager (z-index, positions, sizes)
├── WindowFrame.tsx      — Individual window wrapper (title bar, controls, resize)
├── SnapGuide.tsx        — Visual snap indicators when dragging
├── VirtualDesktops.tsx  — Desktop workspace management
├── WindowMenu.tsx       — Right-click context menu
├── useWindowManager.ts  — Zustand store for window state
├── types.ts             — Window interface definitions
└── constants.ts         — Default sizes, snap zones, etc.
```

#### Key Dependencies
- `@dnd-kit/core` + `@dnd-kit/modifiers` — for drag/resize
- `zustand` — window state management
- `framer-motion` — open/close/minimize animations
- `react-rnd` — resizable & draggable (alternative to dnd-kit)

#### Window State Store
```typescript
interface WindowState {
  id: string
  moduleId: string
  title: string
  icon: string
  x: number
  y: number
  width: number
  height: number
  minWidth: number
  minHeight: number
  isMinimized: boolean
  isMaximized: boolean
  isClosed: boolean
  zIndex: number
  desktopId: string  // virtual desktop
  isPinned: boolean  // always on top
  snapZone: 'left' | 'right' | 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | null
}
```

### 2.4 Snap Behavior (Linux-style)
| Drag to Edge | Result |
|---|---|
| Left edge | Snap to left half of screen |
| Right edge | Snap to right half |
| Top edge | Maximize |
| Bottom edge | Minimize |
| Top-left corner | Snap to top-left quarter |
| Top-right corner | Snap to top-right quarter |
| Bottom-left corner | Snap to bottom-left quarter |
| Bottom-right corner | Snap to bottom-right quarter |
| Near another window edge | Snap side-by-side (50/50 or 60/40) |

### 2.5 Keyboard Shortcuts
| Shortcut | Action |
|---|---|
| `Ctrl+W` | Close active window |
| `Ctrl+M` | Minimize active window |
| `Ctrl+Shift+M` | Maximize/Restore active window |
| `Alt+Tab` | Cycle through open windows |
| `Win+Left/Right` | Snap active window left/right |
| `Win+Up` | Maximize |
| `Win+Down` | Minimize |
| `Ctrl+Alt+1/2/3` | Switch virtual desktop |
| `Ctrl+Shift+N` | New window (module selector) |
| `F11` | Toggle fullscreen mode |

---

## 3. MODULE SETS — Industry Templates

### 3.1 Concept
Users choose their industry/business type during onboarding. Only relevant modules load. Each "Set" is a curated collection of modules optimized for that industry.

### 3.2 Available Module Sets

#### 🔵 SET 1: General Business (Opšte poslovanje)
**Target**: Small businesses, agencies, freelancers
| Module | Purpose |
|---|---|
| Dashboard | KPI overview |
| Partneri (CRM) | Contacts, leads, deals |
| Fakture | Invoicing, payments |
| Magacin | Inventory management |
| Projekti | Project management |
| Kalendar | Scheduling, events |
| Zaposleni | Employee records |
| Troškovi | Expense tracking |
| Finansije | Financial overview |
| Knjigovodstvo | Accounting |
| Dokumenta | Document management |
| Izveštaji | Reports & analytics |
| Podešavanja | Settings |
| Beleške | Notes |
| Zakazivanja | Appointments |

#### 🔴 SET 2: School / Education (Škola / Obrazovanje)
**Target**: Schools, universities, training centers
| Module | Purpose |
|---|---|
| Dashboard | School overview |
| Zaposleni | Teachers & staff |
| Regrutacija | Staff hiring |
| Edukacija | Courses & training |
| Kalendar | Academic calendar |
| Odsustva | Student/teacher attendance |
| Planer | Class scheduling |
| Forum | Student discussions |
| Ankete | Quizzes & surveys |
| BazaZnanja | Knowledge base |
| Čet | Messaging |
| Podrška | Student support |
| Ocene | Grading |
| FondZdravlja | Health records |
| Predlozi | Suggestions box |
| Izveštaji | Academic reports |
| Spreadsheet | Grade sheets |

**Missing modules to create:**
- [ ] **Obaveze** — Homework assignments, submission, grading
- [ ] **Prijave** — Enrollment applications, student registration
- [ ] **Raspored** — Timetable generator (auto-conflict detection)
- [ ] **Biblioteka** — Library management (books, lending, returns)
- [ ] **Učionica** — Classroom management (capacity, equipment, booking)
- [ ] **Školarina** — Tuition fees, payment plans, invoices

#### 🟢 SET 3: Restaurant / Cafe (Restoran / Kafić)
**Target**: Restaurants, cafes, bars, catering
| Module | Purpose |
|---|---|
| Dashboard | Daily overview |
| KafeRestoran | POS & kitchen display |
| Maloprodaja | Retail POS |
| Partneri | Suppliers & vendors |
| Magacin | Ingredient inventory |
| Fakture | Invoicing |
| Troškovi | Cost tracking |
| Zaposleni | Staff management |
| PlanerRadneSile | Shift scheduling |
| Odsustva | Absence tracking |
| Izveštaji | Daily/monthly reports |
| Reservations | Table reservations |

**Missing modules to create:**
- [ ] **Rezervacije** — Table reservations, waitlist, seating chart
- [ ] **Jelovnik** — Menu management (items, categories, prices, allergens, photos)
- [ ] **Kuhinja** — Kitchen display system (KDS), order queue, prep times
- [ ] **Dostava** — Delivery management (drivers, routes, tracking)
- [ ] **Narudžbe** — Order management ( dine-in, takeaway, delivery)

#### 🟡 SET 4: Manufacturing / Production (Proizvodnja)
**Target**: Factories, workshops, assembly lines
| Module | Purpose |
|---|---|
| Dashboard | Production KPIs |
| Proizvodnja | Manufacturing orders, BOM |
| Magacin | Raw materials & finished goods |
| Nabavka | Procurement |
| Kvalitet | Quality control |
| Održavanje | Equipment maintenance |
| Sredstva | Fixed assets |
| Zaposleni | Workers |
| PlanerRadneSile | Shift planning |
| Finansije | Cost management |
| Izveštaji | Production reports |
| TerenskiServis | Field service |
| Servis | Service & repair |

**Missing modules to create:**
- [ ] **KontrolaKvaliteta** — Inspection checklists, defect tracking, SPC charts
- [ ] **RadniNalozi** — Work orders, routing, time tracking
- [ ] **Normativ** — Standards & specifications management
- [ ] **Etikete** — Label printing (product labels, barcode, QR)

#### 🟠 SET 5: Healthcare / Clinic (Zdravstvo / Ambulanta)
**Target**: Clinics, hospitals, dental offices
| Module | Purpose |
|---|---|
| Dashboard | Clinic overview |
| Partneri | Patient records |
| Zakazivanja | Appointments |
| Fakture | Billing |
| FondZdravlja | Health insurance |
| Zaposleni | Medical staff |
| Kalendar | Scheduling |
| Dokumenta | Medical records |
| Izveštaji | Reports |
| Potpisi | Digital signatures |

**Missing modules to create:**
- [ ] **Pacijenti** — Full patient management (history, allergies, medications)
- [ ] **Kartoni** — Electronic health records (EHR)
- [ ] **Recepti** — Prescription management |
- [ ] **Laboratorija** — Lab results & orders
- [ ] **Naplate** — Insurance billing & claims

#### 🟣 SET 6: Construction / Building (Građevina)
**Target**: Construction companies, contractors
| Module | Purpose |
|---|---|
| Dashboard | Project overview |
| Projekti | Project management |
| Zaposleni | Workers & subcontractors |
| Magacin | Materials inventory |
| Nabavka | Procurement |
| Fakture | Invoicing |
| Sredstva | Equipment & vehicles |
| Održavanje | Equipment maintenance |
| TerenskiServis | Field operations |
| Geolokacija | Site tracking |
| Izveštaji | Cost & progress reports |

**Missing modules to create:**
- [ ] **Gradilište** — Site diary, daily logs, weather tracking
- [ ] **Projektovanje** — Blueprints, drawings, document control
- [ ] **Subodabradači** — Subcontractor management (contracts, payments, performance)
- [ ] **Merenja** — Quantity surveying, measurements, variations
- [ ] **Bezbednost** — HSE compliance, safety incidents, inspections

#### 🔷 SET 7: E-Commerce / Online Store (Online Prodaja)
**Target**: Online retailers, dropshipping
| Module | Purpose |
|---|---|
| Dashboard | Sales overview |
| ECommerce | Online store |
| Marketplace | Multi-vendor |
| Partneri | Customers & suppliers |
| Magacin | Product inventory |
| Fakture | Invoices |
| Shipping | Order fulfillment |
| Finansije | Revenue tracking |
| DruštveneMreže | Social media |
| MktAutomatizacija | Marketing automation |
| SmsMarketing | SMS campaigns |
| EmailMarketing | Email campaigns |
| Izveštaji | Sales analytics |

**Missing modules to create:**
- [ ] **Povrat** — Return & refund management
- [ ] **Kupon** — Coupon & discount management
- [ ] **Recenzije** — Product reviews & ratings
- [ ] **SEO** — SEO management (meta tags, sitemap, analytics)
- [ ] **Naplate** — Payment gateway integration

#### ⚪ SET 8: Professional Services (Savetovanje / IT)
**Target:** Law firms, accounting, IT companies, consulting
| Module | Purpose |
|---|---|
| Dashboard | Overview |
| CRM | Client management |
| Projekti | Client projects |
| Fakture | Time-based billing |
| Zaposleni | Staff |
| Zakazivanja | Client meetings |
| Kalendar | Scheduling |
| Beleške | Meeting notes |
| Čet | Team chat |
| Dokumenta | Documents |
| Ugovori | Contract management |
| Izveštaji | Reports |

**Missing modules to create:**
- [ ] **VremenskiTrag** — Time tracking per client/project (billable hours)
- [ ] **FakturisanjeVremena** — Time-based invoicing (hours × rate)
- [ ] **KlijentskiPortal** — Client portal (view invoices, documents, project status)

#### 🟤 SET 9: Logistics / Transport (Logistika / Transport)
**Target:** Trucking companies, warehouses, delivery services
| Module | Purpose |
|---|---|
| Dashboard | Fleet overview |
| VozniPark | Vehicle fleet |
| Shipping | Shipment tracking |
| Magacin | Warehouse |
| Geolokacija | GPS tracking |
| TerenskiServis | Field service |
| Partneri | Clients & partners |
| Fakture | Invoicing |
| Zaposleni | Drivers & staff |
| Izveštaji | Reports |

**Missing modules to create:**
- [ ] **Rute** — Route planning & optimization
- [ ] **UtovarIstovar** — Loading/unloading management
- [ ] **CarinskiDokument** — Customs documentation
- [ ] **Kamioni** — Vehicle maintenance & inspections

#### 🟤 SET 10: Real Estate (Nekretnine)
**Target:** Agencies, property management
| Module | Purpose |
|---|---|
| Dashboard | Overview |
| Partneri | Clients & tenants |
| Projekti | Property listings |
| Ugovori | Lease contracts |
| Fakture | Rent invoicing |
| Kalendar | Viewings schedule |
| Zakazivanja | Appointments |
| Dokumenta | Property docs |
| Potpisi | Digital contracts |
| Izveštaji | Reports |

**Missing modules to create:**
- [ ] **Nekretnine** — Property database (address, type, area, price, photos)
- [ ] **Iznajmljivanje** — Rental management (leases, payments, deposits)
- [ ] **Pregledi** — Property viewings scheduler
- [ ] **Komunalije** — Utilities tracking per property

### 3.3 Module Set Architecture

```
src/lib/module-sets/
├── index.ts              — Set registry & loader
├── types.ts              — ModuleSet interface
├── sets/
│   ├── general.ts        — General Business (15 modules)
│   ├── school.ts         — Education (16+ modules)
│   ├── restaurant.ts     — Restaurant/Cafe (12+ modules)
│   ├── manufacturing.ts  — Production (13+ modules)
│   ├── healthcare.ts     — Clinic (10+ modules)
│   ├── construction.ts   — Building (11+ modules)
│   ├── ecommerce.ts      — Online Store (13+ modules)
│   ├── services.ts       — Professional Services (12+ modules)
│   ├── logistics.ts      — Transport (10+ modules)
│   └── realestate.ts     — Real Estate (11+ modules)
```

#### Module Set Interface
```typescript
interface ModuleSet {
  id: string
  name: Record<string, string>  // { sr, sr-latn, en }
  icon: string                  // lucide-react icon name
  description: Record<string, string>
  category: string
  modules: string[]             // module IDs from store.ts ModuleType
  missingModules?: string[]     // modules that need to be created
  color: string                 // accent color for the set
  isPremium: boolean            // free or paid add-on
}
```

### 3.4 Onboarding Flow
1. User registers → chooses business type from module sets
2. System loads only relevant modules
3. User can later add/remove individual modules
4. Modules not in current set show as "Available" in module browser
5. Premium sets require subscription upgrade

---

## 4. BACKEND & INFRASTRUCTURE

### 4.1 Priority Order
```
🔴 P0 (Critical — Without this it's just a demo)
├── Real auth system (JWT + refresh tokens)
├── PostgreSQL database with multi-tenant schema isolation
├── Role-based access control (RBAC) per company
├── API routes for all 80+ modules (CRUD)
└── File storage (S3-compatible)

🟡 P1 (Important — First market launch)
├── Serbia SEF integration (e-invoicing)
├── Real-time WebSocket updates
├── Audit log (who changed what)
├── Backup & restore
└── CI/CD pipeline

🟢 P2 (Growth — Scaling)
├── Multi-country support (taxes, currencies)
├── GDPR compliance tools
├── 2FA authentication
├── Rate limiting & abuse prevention
├── Performance monitoring
└── Mobile app (React Native)
```

### 4.2 Auth System
- JWT access token (15 min) + refresh token (7 days)
- Roles: SuperAdmin, Admin, Manager, User, ReadOnly
- Per-module permissions: read, write, delete, admin
- Multi-company: user can belong to multiple companies
- Password reset via email
- 2FA (TOTP) for admin accounts

### 4.3 Database Migration
- Current: SQLite (development/demo only)
- Target: PostgreSQL with schema-per-tenant isolation
- Prisma migrations for all models
- Seed data per industry template

### 4.4 API Routes Status
Current → Target per module:
- GET (list with filters/search/pagination)
- POST (create with validation)
- PUT (update with optimistic locking)
- DELETE (soft delete with audit trail)
- Custom actions (status changes, exports, reports)

---

## 5. MISSING MODULES TO CREATE

### 5.1 Priority by Module Set Demand

#### High Priority (shared across multiple sets)
| Module ID | Name | Used In Sets |
|---|---|---|
| rezervacije | Rezervacije (Reservations) | Restaurant, Healthcare, RealEstate |
| vremenski-trag | Vremenski Trag (Time Tracking) | Services, Manufacturing |
| povrat | Povrat (Returns) | ECommerce, General |
| raspored | Raspored (Timetable) | School, Services |
| naplate | Naplate (Payment Gateway) | ECommerce, General |
| kuponi | Kuponi (Coupons) | ECommerce, Restaurant |

#### Medium Priority (industry-specific)
| Module ID | Name | Used In Sets |
|---|---|---|
| pacijenti | Pacijenti (Patients) | Healthcare |
| recepti | Recepti (Prescriptions) | Healthcare |
| jelovnik | Jelovnik (Menu Management) | Restaurant |
| kuhinja | Kuhinja (Kitchen Display) | Restaurant |
| dostava | Dostava (Delivery) | Restaurant, ECommerce, Logistics |
| nekretnine | Nekretnine (Property DB) | RealEstate |
| iznajmljivanje | Iznajmljivanje (Rentals) | RealEstate |
| gradiliste | Gradilište (Site Diary) | Construction |
| biblioteka | Biblioteka (Library) | School |
| obaveze | Obaveze (Homework) | School |
| skolarina | Školarina (Tuition) | School |
| rutiranje | Rutiranje (Route Planning) | Logistics |
| recenzije | Recenzije (Reviews) | ECommerce |

---

## 6. EXECUTION ORDER

### Phase A: Window Manager (2-3 days)
1. Create `useWindowManager` Zustand store
2. Build `WindowFrame` component (drag, resize, min/max/close)
3. Build `Dock` component (taskbar with window previews)
4. Build `Desktop` component (background, workspace)
5. Implement snap zones (half, quarter, edge)
6. Implement virtual desktops (workspaces)
7. Integrate with existing module system
8. Keyboard shortcuts
9. Window position persistence (localStorage)

### Phase B: Module Sets (1-2 days)
1. Create module set registry with all 10 sets
2. Build module set selector UI (onboarding + settings)
3. Dynamic module loading based on active set
4. Module browser (install/uninstall individual modules)
5. Industry onboarding wizard

### Phase C: Brand Cleanup (0.5 days)
1. Remove all Odoo/competitor references
2. Update branding to "Reflection Business"
3. Update package.json, meta tags
4. Add Reflection logo/branding to UI

### Phase D: Create Missing Modules (3-5 days)
1. High-priority shared modules (6-8 modules)
2. Industry-specific modules per set (2-3 per set)

### Phase E: Shell Modules Enhancement (3-5 days)
1. All remaining modules under 1000 lines → enhance to Odoo+ level
2. Priority: modules used in most sets first

### Phase E2: Refaktoring — Podela fajlova i optimizacija (2-3 days)

> ⚠️ URADITI POSLE Phase D i E — kada su SVI moduli finalni!
> Zbog toga što se prave novi moduli, deljenje fajlova pre toga znači dupli rad.

#### E2.1 — Pronađi najveće fajlove
```bash
find src/components/modules -name "*.tsx" -o -name "*.ts" | xargs wc -l | sort -rn | head -30
```

#### E2.2 — Podeli svaki fajl preko 800 linija

**Struktura podele:**
```
modules/module-name/
├── index.tsx          ← samo import/export
├── ModuleMain.tsx     ← glavni render (JSX return)
├── ModuleDialogs.tsx  ← svi Dialog elementi
├── ModuleTable.tsx    ← tabela/lista
├── ModuleForm.tsx     ← forme
├── useModule.ts       ← useState, useEffect, useCallback, logika
└── types.ts           ← interfejsi i tipovi
```

**Pravila podele:**
- ✅ SAMO fizički premesti kod u manje fajlove
- ✅ Svaki fajl mora biti IDENTIČAN originalu po funkcionalnosti
- ❌ NE menjaj funkcionalnost
- ❌ NE uklanjaj feature-e
- ❌ NE uprošćavaj logiku
- ❌ NE smanjuj broj linija da bi izgledalo bolje
- Iskopiraj kod — ne prepisuj, ne menjaj
- Iseci delove i stavi u odgovarajuće fajlove
- Dodaj import/export između fajlova
- `index.tsx` = `export { default } from './ModuleMain'`

#### E2.3 — Optimizacija (bez uprošćavanja)
- Dodaj `useMemo` gde se heavy kalkulacija radi bez njega
- Dodaj `useCallback` na event handlere koji se prosleđuju kao props
- Zameni `any` sa pravim TypeScript tipovima gde je očigledno
- NE menjaj logiku, samo dodaj memoizaciju

#### E2.4 — Build check nakon svake podele
```bash
bun run lint
```
Ako ima grešaka — popravi SAMO greške, ne diraj ostali kod.

#### E2.5 — Ažuriranje importa
Svaki split fajl zahteva ažuriranje:
- `src/lib/store.ts` — import putanja
- `src/app/page.tsx` — dynamic import putanja
- `src/components/modules/AppSidebar.tsx` — ako treba
- `src/lib/translations.ts` — ako treba

#### E2.6 — Procena posla
```
Trenutno fajlova preko 800 linija: ~60 komada
Svaki → 6-7 podfajlova = ~360-420 novih fajlova
Nakon Phase D (+~25 novih modula): ~85 fajlova za deliti = ~500-600 podfajlova
```

### Phase F: Backend (separate project, 2-4 weeks)
1. Auth system
2. PostgreSQL migration
3. API routes
4. File storage
5. Real-time (WebSocket)
6. Audit logging
7. SEF integration (Serbia)

---

## 7. TECHNICAL NOTES

### Window Manager Dependencies
```
npm install @dnd-kit/core @dnd-kit/modifiers @dnd-kit/utilities
# OR
npm install react-rnd
```

### Module Sets Loading Strategy
- Lazy load module components with `next/dynamic`
- Only render modules in active set
- Preload sidebar icons for all modules (lightweight)
- Module browser shows all available modules with "Install" button

### Desktop Mode Toggle
- Users can switch between:
  - **Desktop Mode** (window manager) — power users, desktop
  - **Mobile Mode** (current tab-based) — mobile users, simple navigation
- Auto-detect based on screen size
- Manual toggle in settings

### File Naming Convention
- All files: PascalCase for components, camelCase for utilities
- Module files: English names (e.g., `Reservations.tsx` not `Rezervacije.tsx`)
- Wait for final refactoring phase (after all modules complete)

---

## 8. SUMMARY

| Phase | Task | Estimated | Status |
|---|---|---|---|
| E | Enhance Shell Modules (15+) | 3-5 days | 🔄 IN PROGRESS |
| D | Create Missing Modules (20+) | 3-5 days | ⬅️ NEXT |
| A | Window Manager + Virtual Desktops | 2-3 days | ⬜ Pending |
| B | Module Sets (10 industry templates) | 1-2 days | ⬜ Pending |
| C | Brand Cleanup | 0.5 days | ⬜ Pending |
| E2 | **Refaktoring — Podela fajlova** | 2-3 days | ⬜ Pending |
| F | Backend & Infrastructure | 2-4 weeks | ⬜ Pending |
| G | English Refactoring (file names + code) | 1-2 days | ⬜ Pending |

**Total Frontend: ~14-22 days**  
**Total Backend: ~2-4 weeks (separate phase)**

> **Trenutni fokus:** Phase E — enhancment preostalih modula na 1000+ linija

---

*Last updated: 2025-06-12*  
*Status: Phase E — Enhancing shell modules to Odoo+ level*
