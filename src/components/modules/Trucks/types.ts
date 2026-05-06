// ============================================================
// Truck Fleet Management — Reflection Business ERP
// Types for Kamioni module (Serbian truck fleet)
// Vozni park · Registracija · Održavanje · Troškovi
// ============================================================

// ────────────────────────────────────────────────────────────
// ENUM TYPES
// ────────────────────────────────────────────────────────────

/** Fuel type options for Serbian market */
export type FuelType =
  | "dizel" // Дизел — most common for trucks
  | "benzin" // Бензин
  | "gas" // TNG (гас) — compressed natural gas
  | "hibrid" // Хибрид
  | "elektricni"; // Електрични

/** Truck operational status */
export type TruckStatus =
  | "aktivan" // On the road — active dispatch
  | "na_servisu" // In workshop — under repair
  | "u_garazi" // Parked / standby — available
  | "prodato" // Sold — decommissioned
  | "kvar"; // Breakdown — immobilized

/** Maintenance record status */
export type MaintenanceStatus =
  | "zakazano" // Scheduled
  | "u_toku" // In progress
  | "zavrseno" // Completed
  | "otkazano"; // Cancelled

/** Maintenance work types */
export type MaintenanceType =
  | "redovni_servis" // Regular service
  | "promena_ulja" // Oil change
  | "promena_guma" // Tire change
  | "tehnicki_pregled" // Technical inspection
  | "registracija" // Registration
  | "klima_servis" // AC service
  | "kocioni_sistem" // Brakes
  | "motor" // Engine
  | "menjac" // Transmission
  | "elektrika" // Electrical
  | "karoserija" // Bodywork
  | "adr_oprema" // ADR equipment
  | "ostalo"; // Other

/** Cost / expense categories */
export type CostType =
  | "gorivo" // Fuel
  | "putarina" // Tolls
  | "parking" // Parking
  | "servis" // Service/repairs
  | "delovi" // Spare parts
  | "osiguranje" // Insurance
  | "registracija" // Registration fees
  | "tehnicki" // Technical inspection
  | "gume" // Tires
  | "podmazivanje" // Lubricants
  | "adr_oprema" // ADR equipment
  | "ostalo"; // Other

/** Registration document types */
export type RegistrationDocType =
  | "registracija" // Vehicle registration
  | "tehnicki" // Technical inspection
  | "osiguranje"; // Insurance

/** Registration status */
export type RegStatus =
  | "važeće" // Valid
  | "ističe_uskoro" // Expiring soon
  | "isteklo"; // Expired

/** Active tab identifier */
export type TruckTab =
  | "vozni_park" // Fleet overview
  | "registracija" // Registration tracking
  | "odrzavanje" // Maintenance
  | "troskovi"; // Costs & expenses

// ────────────────────────────────────────────────────────────
// DATA INTERFACES
// ────────────────────────────────────────────────────────────

/** Main truck profile — core entity */
export interface Truck {
  id: string;
  plate: string; // Registarski broj, нпр. "БГ-001-AB"
  make: string; // Marka: Mercedes, MAN, Scania, Volvo...
  model: string; // Model: Actros, TGX, R450...
  year: number; // Godište
  vin: string; // VIN број шасије
  fuelType: FuelType;
  status: TruckStatus;
  mileage: number; // Tренутна километража
  driver: string; // Vozač (име)
  registrationExpiry: string; // Datum isteka registracije
  techInspectionExpiry: string; // Datum isteka tehničkog pregleda
  insuranceExpiry: string; // Datum isteka osiguranja
  notes: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
  // Computed / joined fields
  totalCosts?: number;
  lastServiceDate?: string;
  nextServiceDue?: string;
}

/** Maintenance service record */
export interface MaintenanceRecord {
  id: string;
  truckId: string;
  truckPlate?: string;
  type: MaintenanceType;
  description: string;
  date: string;
  cost: number; // RSD
  mileage: number;
  workshop: string; // Servis / radionica
  nextDueDate: string;
  nextDueMileage: number;
  status: MaintenanceStatus;
  createdAt: string;
}

/** Cost / expense record */
export interface TruckCost {
  id: string;
  truckId: string;
  truckPlate?: string;
  type: CostType;
  description: string;
  date: string;
  amount: number; // RSD
  mileage: number;
  documentRef: string; // Broj dokumenta / računa
  supplier: string; // Dobavljač
  createdAt: string;
}

/** Registration tracking item (derived from truck data) */
export interface RegistrationItem {
  id: string;
  truckId: string;
  truckPlate: string;
  type: RegistrationDocType;
  expiryDate: string;
  issueDate: string;
  cost: number;
  documentNumber: string;
  status: RegStatus;
  daysRemaining: number;
}

/** Monthly cost summary for charts */
export interface MonthlyCost {
  month: string; // "2024-01", "2024-02"...
  fuel: number;
  service: number;
  other: number;
  total: number;
}

/** Fleet-wide aggregated statistics */
export interface FleetStats {
  totalTrucks: number;
  activeTrucks: number;
  inService: number;
  inGarage: number;
  breakdowns: number;
  sold: number;
  totalMileage: number;
  avgMileage: number;
  totalCosts: number;
  maintenanceDueCount: number;
  registrationDueCount: number;
  insuranceDueCount: number;
  fuelCostsTotal: number;
  serviceCostsTotal: number;
  monthlyCosts: MonthlyCost[];
}

/** Per-truck cost breakdown for bar chart */
export interface TruckCostBreakdown {
  truck: Truck;
  total: number;
  fuelTotal: number;
  otherTotal: number;
  count: number;
}
// ────────────────────────────────────────────────────────────
// FORM DATA INTERFACES
// ────────────────────────────────────────────────────────────

/** Form data for adding/editing a truck */
export interface TruckFormData {
  plate: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  fuelType: FuelType;
  status: TruckStatus;
  mileage: number;
  driver: string;
  registrationExpiry: string;
  techInspectionExpiry: string;
  insuranceExpiry: string;
  notes: string;
}

/** Form data for maintenance record */
export interface MaintenanceFormData {
  truckId: string;
  type: MaintenanceType;
  description: string;
  date: string;
  cost: number;
  mileage: number;
  workshop: string;
  nextDueDate: string;
  nextDueMileage: number;
  status: MaintenanceStatus;
}

/** Form data for cost record */
export interface CostFormData {
  truckId: string;
  type: CostType;
  description: string;
  date: string;
  amount: number;
  mileage: number;
  documentRef: string;
  supplier: string;
}
// ────────────────────────────────────────────────────────────
// FILTER / SORT OPTIONS
// ────────────────────────────────────────────────────────────

/** Sort / filter options for the fleet table */
export interface TruckFilters {
  search: string;
  status: TruckStatus | "";
  fuelType: FuelType | "";
  sortBy: "plate" | "make" | "year" | "mileage" | "status";
  sortDir: "asc" | "desc";
}

/** Urgency alert for expiring documents */
export interface UrgencyAlert {
  truckPlate: string;
  type: "registration" | "tech" | "insurance";
  message: string;
  days: number;
}
