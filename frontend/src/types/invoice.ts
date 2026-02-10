export interface Invoice {
  id: string;
  document_id: string;
  user_id: string;
  invoice_number: string | null;
  vendor_name: string | null;
  vendor_address?: string | null;
  vendor_tax_id?: string | null;
  vendor_email?: string | null;
  customer_name?: string | null;
  customer_address?: string | null;
  invoice_date: string | null;
  due_date?: string | null;
  total_amount: number | null;
  tax?: number | null;
  subtotal?: number | null;
  currency: string;
  payment_terms?: string | null;
  status: 'paid' | 'unpaid' | 'overdue' | 'partial' | 'pending';
  validation_status?: string | null;
  validation_errors?: any[];
  confidence_score?: number | null;
  line_items?: InvoiceLineItem[];
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

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

export interface InvoiceFilters {
  search: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  minAmount: string;
  maxAmount: string;
}

export interface InvoiceStats {
  total_invoices: number;
  total_amount: number;
  paid_amount: number;
  unpaid_amount: number;
  overdue_count: number;
}

export interface InvoicePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export type SortField = 'invoice_number' | 'vendor_name' | 'invoice_date' | 'due_date' | 'total_amount' | 'status';
export type SortOrder = 'asc' | 'desc';
