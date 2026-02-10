export interface Resume {
  id: number;
  document_id: number;
  user_id: number;
  candidate_name: string;
  email?: string;
  phone?: string;
  location?: string;
  summary?: string;
  total_experience_years: number;
  skills: string[];
  education: Education[];
  experience: Experience[];
  certifications?: string[];
  languages?: string[];
  match_score?: number;
  created_at: string;
  updated_at: string;
  document?: {
    id: number;
    filename: string;
    file_path: string;
    file_url?: string;
  };
}

export interface Education {
  degree: string;
  institution: string;
  field_of_study?: string;
  graduation_year?: number;
  gpa?: string;
}

export interface Experience {
  company: string;
  position: string;
  start_date: string;
  end_date?: string;
  duration?: string;
  description?: string;
  responsibilities?: string[];
  is_current?: boolean;
}

export interface ResumeFilters {
  search: string;
  skills: string[];
  minExperience: number;
  maxExperience: number;
  minScore: number;
  maxScore: number;
}

export interface SkillCategory {
  category: string;
  skills: string[];
}

export interface MatchScoreBreakdown {
  overall_score: number;
  skills_match: number;
  experience_match: number;
  education_match: number;
}

export type ViewMode = 'grid' | 'table';
export type ResumeSortField = 'candidate_name' | 'total_experience_years' | 'match_score' | 'created_at';
export type SortOrder = 'asc' | 'desc';
