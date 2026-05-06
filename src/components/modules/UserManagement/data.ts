// Static data for UserManagement module
export const USER_ROLES = [
  { value: 'admin', label: 'Administrator', color: 'bg-red-50 text-red-700 border-red-200' },
  { value: 'manager', label: 'Menadžer', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'user', label: 'Korisnik', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'viewer', label: 'Posmatrač', color: 'bg-gray-50 text-gray-600 border-gray-200' },
] as const

export function getUserRoleBadge(role: string) {
  return USER_ROLES.find(r => r.value === role) || USER_ROLES[2]
}

export const emptyUserForm = {
  name: '',
  email: '',
  password: '',
  role: 'user',
  isActive: true,
}
