export interface Role {
  id: string;
  name: string;
  displayName: string;
  description?: string;
}

export interface CompanyUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string | null;
  phone?: string | null;
  jobTitle?: string | null;
  roleName: string;
  roleDisplayName: string;
  roleId: string;
  isActive: boolean;
  lastLoginAt?: string | null;
}

export interface NewUserForm {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  phone: string;
  roleId: string;
  jobTitle: string;
}
