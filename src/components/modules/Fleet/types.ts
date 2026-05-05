export interface VehicleService {
  id: string
  vehicleId: string
  date: string
  type: string
  description: string
  cost: number
  mileage: number
  nextDue?: string
}

export interface VehicleExpense {
  id: string
  vehicleId: string
  date: string
  type: string
  amount: number
  description: string
  mileage: number
}

export interface Vehicle {
  id: string
  registration: string
  make: string
  model: string
  year: number
  fuelType: string
  mileage: number
  status: string
  assignedTo?: string
  notes?: string
  _count?: { services: number; expenses: number }
