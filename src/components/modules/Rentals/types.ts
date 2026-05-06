export type Rental = {
  id: string
  contractNo: string
  tenantName: string
  phone: string
  email: string
  propertyTitle: string
  propertyAddress: string
  monthlyRent: number
  deposit: number
  startDate: string
  endDate: string
  paymentDay: number
  status: 'active' | 'expiring' | 'expired' | 'terminated' | 'pending'
  lastPayment: string
  nextPayment: string
  paymentMethod: 'bank_transfer' | 'cash' | 'standing_order'
  securityDeposit: number
  notes: string
}
