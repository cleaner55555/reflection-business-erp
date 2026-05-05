export interface MessagingMessage {
  id: string
  conversationId: string
  contactName: string
  contactPhone: string
  contactAvatar: string | null
  direction: 'inbound' | 'outbound' | 'system'
  type: 'text' | 'image' | 'document' | 'audio' | 'video' | 'location' | 'template'
  content: string
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed'
  timestamp: string
  assignedTo: string | null
  tags: string[]
  starred: boolean
}

export interface Conversation {
  id: string
  contactName: string
  contactPhone: string
  contactAvatar: string | null
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  status: 'open' | 'closed' | 'pending'
  assignedTo: string | null
  tags: string[]
  isStarred: boolean
  messages: MessagingMessage[]
}

export interface MessagingTemplate {
  id: string
  name: string
  category: string
  language: string
  status: 'approved' | 'pending' | 'rejected'
  body: string
  variables: number
  createdAt: string
  usedCount: number
  lastUsedAt: string | null
}

export interface AutoReply {
  id: string
  name: string
  description: string
  trigger: 'keyword' | 'greeting' | 'away' | 'offline' | 'always'
  keyword: string | null
  response: string
  delaySeconds: number
  enabled: boolean
  matchCount: number
  createdAt: string
}

export interface MessagingCampaign {
  id: string
  name: string
  templateId: string | null
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed'
  recipientCount: number
  sentCount: number
  deliveredCount: number
  readCount: number
  failedCount: number
  scheduledAt: string | null
  createdAt: string
  completedAt: string | null
}
