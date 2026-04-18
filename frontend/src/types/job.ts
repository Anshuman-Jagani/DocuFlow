import type { Resume } from './resume';

export interface Job {
  id: string;
  user_id: string;
  title: string;
  description: string;
  required_skills: string[];
  preferred_skills?: string[];
  experience_required?: string;
  department?: string;
  location?: string;
  type?: 'full-time' | 'part-time' | 'contract' | 'internship';
  status: 'open' | 'closed';
  createdAt: string;
  updatedAt: string;
  matched_resumes?: Resume[];
}

export interface JobFilters {
  search: string;
  department: string;
  status: string;
}
