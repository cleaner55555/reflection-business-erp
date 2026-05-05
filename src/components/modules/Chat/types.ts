export interface Channel {
  id: string
  name: string
  description?: string
  type: string
  memberCount: number
  unreadCount: number
  lastMessage?: string
  lastMessageAt?: string
  isPinned?: boolean
}

export interface Message {
  id: string
  channelId: string
  senderName: string
  content: string
  timestamp: string
  isOwn?: boolean
}
