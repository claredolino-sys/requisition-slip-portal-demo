export type RISStatus = 
  | 'pending'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'issued'
  | 'completed'
  | 'cancelled';

export interface RISItem {
  id?: number;
  ris_id?: number;
  inventory_id?: number;
  stock_no: string;
  unit: string;
  description: string;
  quantity_requisition: number | string;
  stock_available_yes: boolean;
  stock_available_no: boolean;
  quantity_issue: number | string;
  remarks: string;
}

export interface RISFormData {
  entity_name: string;
  fund_cluster: string;
  division: string;
  office: string;
  responsibility_center_code: string;
  purpose: string;
  requested_by_name: string;
  requested_by_designation: string;
  approved_by_name: string;
  approved_by_designation: string;
  issued_by_name: string;
  issued_by_designation: string;
  received_by_name: string;
  received_by_designation: string;
  requested_by_date: string;
  approved_by_date: string;
  issued_by_date: string;
  received_by_date: string;
}

export interface RISRequest extends RISFormData {
  id: number;
  ris_no?: string;
  user_id?: number;
  status: RISStatus;
  created_at?: string;
  updated_at?: string;
  items: RISItem[];
  rejection_reason?: string;
  notes?: string;
}
