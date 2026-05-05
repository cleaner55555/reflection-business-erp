export interface SmsCampaign {
  id: string
  name: string
  content: string
  category: string
  recipientCount: number
  sentCount: number
  deliveredCount: number
  failedCount: number
  replyCount: number
  status: string
  scheduledDate: string | null
  sentDate: string | null
  costPerSms: number
  totalCost: number
  senderId: string | null
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface SmsTemplate {
  id: string
  name: string
  category: string
  body: string
  variables: string[]
  isDefault: boolean
  usedCount: number
  createdAt: string
}

export interface SmsContact {
  id: string
  name: string
  phone: string
  groups: string[]
  status: 'active' | 'inactive' | 'unsubscribed'
  totalReceived: number
  totalSent: number
  lastActivity: string | null
  createdAt: string
}

export interface SmsLog {
  id: string
  phone: string
  contactName: string | null
  direction: 'inbound' | 'outbound'
  content: string
  status: string
  campaignId: string | null
  cost: number
  createdAt: string
}

export interface SmsKeyword {
  id: string
  keyword: string
  response: string
  autoReply: boolean
  forwardTo: string | null
  matchCount: number
  enabled: boolean
  createdAt: string
}
