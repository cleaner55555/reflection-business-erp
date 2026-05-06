export type Reservation = {
  id: string
  reservationNo: string
  guestName: string
  phone: string
  email: string
  date: string
  time: string
  partySize: number
  tableNo: string
  area: 'indoor' | 'outdoor' | 'terrace' | 'vip' | 'bar'
  status: 'confirmed' | 'pending' | 'checked_in' | 'completed' | 'cancelled' | 'no_show'
  occasion: string
  specialRequests: string
  source: 'phone' | 'website' | 'walk_in' | 'app' | 'email'
  duration: number
  deposit: number
  notes: string
}
