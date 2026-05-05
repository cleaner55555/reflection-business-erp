export interface ForumTopic {
  id: string
  title: string
  content: string
  category?: string
  tags?: string[]
  authorName?: string
  authorAvatar?: string
  views: number
  replyCount: number
  likes: number
  isPinned?: boolean
  isLocked?: boolean
  isSolved?: boolean
  createdAt: string
  updatedAt?: string
}

export interface ForumReply {
  id: string
  topicId: string
  authorName: string
  content: string
  likes: number
  isBest?: boolean
  createdAt: string
}

export interface ForumCategory {
  id: string
  key: string
  label: string
  description: string
  color: string
  icon: string
  topicCount: number
  sortOrder: number
}

export interface ForumQuestion {
  id: string
  title: string
  content: string
  authorName: string
  votes: number
  answerCount: number
  hasAccepted: boolean
  tags: string[]
  createdAt: string
  answers?: ForumAnswer[]
}

export interface ForumAnswer {
  id: string
  questionId: string
  authorName: string
  content: string
  votes: number
  isAccepted: boolean
  createdAt: string
}

export interface ForumTag {
  id: string
  name: string
  slug: string
  description: string
  color: string
  usageCount: number
  createdAt: string
}

export interface ForumSettings {
  allowAnonymous: boolean
  requireApproval: boolean
  maxTopicPerDay: number
  reputationThreshold: number
  enableReactions: boolean
  enableVoting: boolean
  enableBadges: boolean
  autoLockDays: number
  maxReplyLength: number
  enableMarkdown: boolean
  spamFilterLevel: 'low' | 'medium' | 'high'
}
