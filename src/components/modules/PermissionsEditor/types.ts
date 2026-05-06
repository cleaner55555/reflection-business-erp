export interface Role {
  id: string
  name: string
  displayName: string
  description?: string | null
  permissions: string
  isDefault: boolean
  _count?: { userCompanies: number }

export interface Permissions {
  [module: string]: string[]
}

export interface ModuleGroup {
  label: string
  icon: string
  modules: string[]
}
