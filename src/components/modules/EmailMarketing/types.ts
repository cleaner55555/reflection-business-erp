export interface EmailList {
  id: string
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
  _count?: { subscribers: number; campaigns: number }

}
export interface EmailSubscriber {
  id: string
  listId: string | null
  email: string
  firstName: string | null
  lastName: string | null
  status: string
  source: string | null
  createdAt: string
  updatedAt: string
  list?: { id: string; name: string }

}
export interface EmailCampaign {
  id: string
  name: string
  subject: string
  preheader: string | null
  content: string
  status: string
  listId: string | null
  sentCount: number
  openRate: number
  clickRate: number
  bounceRate: number
  scheduledAt: string | null
  sentAt: string | null
  createdAt: string
  updatedAt: string
  list?: { id: string; name: string }

}
export interface EmailTemplate {
  id: string
  name: string
  subject: string
  content: string
  category: string | null
  createdAt: string
  updatedAt: string
}
