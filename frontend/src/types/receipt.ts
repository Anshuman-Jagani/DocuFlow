export interface Receipt {
  id: string;
  document_id: string;
  user_id: string;
  merchant_name: string | null;
  purchase_date: string | null;
  purchase_time?: string | null;
  total_amount: number | null;
  subtotal?: number | null;
  tax?: number | null;
  tip?: number | null;
  currency: string;
  category: string | null;
  payment_method: string | null;
  is_business_expense: boolean;
  is_reimbursable: boolean;
  tax_deductible: boolean;
  items: ReceiptItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  document?: {
    id: string;
    original_filename: string;
    file_path: string;
    mime_type: string;
    file_size: number;
    file_url?: string;
  };
}

export interface ReceiptItem {
  name: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

export interface ReceiptFilters {
  search: string;
  category: string;
  dateFrom: string;
  dateTo: string;
  isBusiness: string | boolean;
}

export interface ReceiptStats {
  total_amount: number;
  count: number;
  category_breakdown: {
    category: string;
    amount: number;
  }[];
  monthly_spending: {
    month: string;
    amount: number;
  }[];
  business_total: number;
  personal_total: number;
  avg_amount: number;
}
