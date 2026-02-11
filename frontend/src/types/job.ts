import type { Resume } from './resume';

export interface Job {
  id: string;
  user_id: string;
  title: string;
  department?: string;
  location?: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  description: string;
  requirements: string[];
  salary_range?: string;
  status: 'open' | 'closed' | 'draft';
  createdAt: string;
  updatedAt: string;
  matched_resumes?: Resume[];
}

export interface JobFilters {
  search: string;
  department: string;
  status: string;
}
