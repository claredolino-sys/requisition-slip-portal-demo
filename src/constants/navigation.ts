import { UserRole } from '../types';

export interface NavItemConfig {
  path: string;
  label: string;
  employeeLabel?: string;
  iconName: 'Home' | 'PlusCircle' | 'Inbox' | 'Package' | 'FileText';
  roles: UserRole[];
}

export const NAVIGATION_ITEMS: NavItemConfig[] = [
  { 
    path: '/dashboard', 
    label: 'Dashboard',
    employeeLabel: 'My RIS Records',
    iconName: 'Home', 
    roles: ['employee', 'admin', 'admin_administrative', 'superadmin'] 
  },
  { 
    path: '/new-ris', 
    label: 'New RIS Slip', 
    iconName: 'PlusCircle', 
    roles: ['employee'] 
  },
  { 
    path: '/admin-inbox', 
    label: 'Admin Inbox', 
    iconName: 'Inbox', 
    roles: ['admin', 'admin_administrative'] 
  },
  { 
    path: '/inventory', 
    label: 'Inventory Management', 
    iconName: 'Package', 
    roles: ['admin', 'admin_administrative', 'superadmin'] 
  },
  { 
    path: '/approved-ris', 
    label: 'Approved RIS', 
    iconName: 'FileText', 
    roles: ['superadmin'] 
  },
  { 
    path: '/reports', 
    label: 'Reports & Analytics', 
    iconName: 'FileText', 
    roles: ['admin', 'admin_administrative'] 
  },
];
