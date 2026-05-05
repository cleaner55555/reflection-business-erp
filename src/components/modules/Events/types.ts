export interface EventItem {
  id: string
  title: string
  type: string
  description: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  venue: string
  capacity: number
  registered: number
  price: number
  maxAttendees: number
  organizer: string
  notes: string
  status: 'draft' | 'published' | 'cancelled' | 'completed'
}

export interface RegistrationItem {
  id: string
  attendee: string
  eventId: string
  eventTitle: string
  date: string
  status: 'registered' | 'checked_in' | 'cancelled' | 'no_show'
  ticketType: string
  paymentStatus: 'paid' | 'pending' | 'failed'
  emailSent: boolean
}

export interface VenueItem {
  id: string
  name: string
  address: string
  capacity: number
  equipment: string[]
  contact: string
  rating: number
}

export interface TicketItem {
  id: string
  eventId: string
  eventTitle: string
  name: string
  tier: string
  price: number
  available: number
  sold: number
}
