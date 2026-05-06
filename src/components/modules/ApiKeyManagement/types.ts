export interface ApiKeyItem {
  id: string
  name: string
  key: string
  permissions: string
  lastUsedAt: string | null
  expiresAt: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
  }

export interface UserOption {
  id: string
  email: string
  firstName: string
  lastName: string
}

export interface NewKeyForm {
  name: string
  userId: string
  permissions: string[]
  expiresAt: Date | undefined
}
