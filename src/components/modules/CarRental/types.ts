export interface RentalVehicle {
  id: string
  name: string
  make: string
  model: string
  year: number
  registration: string
  fuelType: string
  transmission: string
  seats: number
  dailyRate: number
  weeklyRate?: number | null
  monthlyRate?: number | null
  mileage: number
  status: string
  ac: boolean
  gps: boolean
  notes?: string
  createdAt: string
  _count?: { rentals: number }

export interface RentalVehicleFull {
  id: string
  name: string
  make: string
  model: string
  year: number
  registration: string
  fuelType: string
  transmission: string
  seats: number
  dailyRate: number
  weeklyRate?: number | null
  monthlyRate?: number | null
  mileage: number
  status: string
  ac: boolean
  gps: boolean
  notes?: string
  createdAt: string
  _count?: { rentals: number }

export interface Rental {
  id: string
  number: string
  vehicleId: string
  clientName: string
  clientPhone?: string
  clientEmail?: string
  clientIdDoc?: string
  startDate: string
  endDate: string
  pickupMileage: number
  returnMileage?: number | null
  dailyRate: number
  totalDays: number
  totalAmount: number
  deposit: number
  status: string
  notes?: string
  createdAt: string
  vehicle?: { id: string; name: string; make: string; model: string; registration: string }
