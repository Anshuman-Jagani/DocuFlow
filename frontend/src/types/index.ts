export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: number;
  filename: string;
  original_filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  document_type: 'invoice' | 'resume' | 'contract' | 'receipt';
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: number;
  document_id: number;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  vendor_name: string;
  vendor_address: string;
  customer_name: string;
  customer_address: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  payment_terms: string;
  line_items: LineItem[];
  validation_status: 'valid' | 'needs_review' | 'invalid';
  confidence_score: number;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Resume {
  id: number;
  document_id: number;
  candidate_name: string;
  email: string;
  phone: string;
  linkedin_url: string;
  github_url: string;
  summary: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
  certifications: string[];
  years_of_experience: number;
  match_score: number;
  matched_job_id: number | null;
  recommendation: 'strong_yes' | 'yes' | 'maybe' | 'no';
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface Experience {
  company: string;
  position: string;
  start_date: string;
  end_date: string | null;
  description: string;
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  graduation_date: string;
}

export interface Contract {
  id: number;
  document_id: number;
  contract_type: string;
  parties: string[];
  effective_date: string;
  expiration_date: string;
  payment_terms: string;
  key_obligations: string[];
  termination_clauses: string[];
  risk_score: number;
  requires_legal_review: boolean;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface Receipt {
  id: number;
  document_id: number;
  merchant_name: string;
  transaction_date: string;
  total_amount: number;
  currency: string;
  category: string;
  payment_method: string;
  is_business_expense: boolean;
  is_reimbursable: boolean;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface JobPosting {
  id: number;
  title: string;
  description: string;
  required_skills: string[];
  preferred_skills: string[];
  experience_required: number;
  status: 'open' | 'closed';
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  total_documents: number;
  pending_documents: number;
  total_invoice_amount: number;
  active_candidates: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
