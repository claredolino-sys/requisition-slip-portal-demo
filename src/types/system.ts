export interface AuditLog {
  id: number;
  user_id?: number;
  action: string;
  details: string;
  ip_address?: string;
  timestamp: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  created_at: string;
  read?: boolean;
}

export interface SystemStats {
  totalUsers: number;
  totalRis: number;
  approvedRis: number;
  pendingRis: number;
  totalInventoryItems: number;
  lowStockItems: number;
}
