export type Viewing = {
  id: string
  propertyTitle: string
  clientName: string
  phone: string
  agent: string
  date: string
  time: string
  duration: number
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show'
  clientInterest: 'high' | 'medium' | 'low' | 'none'
  feedback: string
  notes: string
}
