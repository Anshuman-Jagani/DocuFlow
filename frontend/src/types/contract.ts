export interface Contract {
  id: string;
  document_id: string;
  user_id: string;
  contract_title: string | null;
  contract_type: string | null;
  contract_value: number | null;
  currency: string;
  parties: ContractParty[];
  effective_date: string | null;
  expiration_date: string | null;
  auto_renewal: boolean;
  payment_terms?: any;
  key_obligations?: string[] | any[];
  termination_clauses?: string[] | any[];
  penalties?: string[] | any[];
  confidentiality_terms?: string;
  liability_limitations?: string;
  governing_law?: string;
  special_conditions?: string[] | any[];
  risk_score: number | null;
  red_flags?: (string | ContractRedFlag)[];
  requires_legal_review: boolean;
  summary?: string;
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

export interface ContractParty {
  name: string;
  role: string;
}

export interface ContractRedFlag {
  category?: string;
  severity?: string;
  description: string;
  clause_reference?: string;
  recommendation?: string;
  impact?: string;
}

export interface ContractFilters {
  search: string;
  type: string;
  status: string;
  risk: string;
}

export type ContractSortField = 'contract_title' | 'contract_type' | 'expiration_date' | 'contract_value' | 'risk_score';
