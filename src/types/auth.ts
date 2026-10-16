export type UserRole = 'superadmin' | 'admin' | 'admin_administrative' | 'employee';

export interface User {
  id: number;
  employee_id: string;
  full_name: string;
  email: string;
  role: UserRole;
  department: string;
  division: string;
  office: string;
  designation: string;
  entity_name?: string;
  fund_cluster?: string;
  responsibility_center_code?: string;
  is_active?: boolean;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  updateUser: (userData: Partial<User>) => void;
  logout: () => void;
}

export interface LoginCredentials {
  employee_id: string;
  password?: string;
}
