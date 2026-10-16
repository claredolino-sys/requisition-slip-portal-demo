export interface InventoryItem {
  id: number;
  stock_no: string;
  item_code?: string;
  description: string;
  unit: string;
  quantity_on_hand: number;
  reorder_level: number;
  unit_cost?: number;
  category?: string;
  is_available: boolean;
  created_at?: string;
  updated_at?: string;
}

export type InventoryFilter = 'all' | 'available' | 'out' | 'low';

export interface StockTransaction {
  id: number;
  inventory_id: number;
  ris_id?: number;
  transaction_type: 'in' | 'out' | 'adjustment';
  quantity: number;
  balance_after: number;
  created_at: string;
  performed_by?: string;
}
