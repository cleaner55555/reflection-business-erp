export interface Tender {
  id: string
  number: string
  title: string
  description: string
  type: string
  procedureType: string
  status: string
  priority: string
  sector: string
  buyerName: string
  buyerPib: string
  buyerAddress: string
  estimatedValue: number
  currency: string
  cpvCode: string
  deadlineSubmission: string
  deadlineClarification: string
  openingDate: string
  awardDate: string
  contractSigningDate: string
  requirements: string[]
  criteria: TenderCriterion[]
  bidders: TenderBidder[]
  winnerId: string | null
  notes: string
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  timeline: TenderEvent[]

}
export interface TenderCriterion {
  id: string
  name: string
  weight: number
  type: string

}
export interface TenderBidder {
  id: string
  name: string
  pib: string
  price: number
  score: number
  status: string
  submittedAt: string | null
  disqualified: boolean
  disqualificationReason: string

}
export interface TenderEvent {
  id: string
  action: string
  description: string
  performedBy: string
  timestamp: string

}
export interface TenderStats {
  total: number
  open: number
  inEvaluation: number
  awarded: number
  cancelled: number
  totalValue: number
  avgBidders: number
  byType: Array<{ type: string; count: number; label: string }>

}