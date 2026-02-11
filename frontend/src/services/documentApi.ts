import api from './api';
import type { Invoice } from '../types/invoice';
import type { InvoiceFilters, SortField, SortOrder } from '../types/invoice';
import type { ResumeFilters, ResumeSortField } from '../types/resume';
import type { ContractFilters, ContractSortField } from '../types/contract';
import type { ReceiptFilters } from '../types/receipt';
import type { Job, JobFilters } from '../types/job';

// Invoice API
export const invoiceApi = {
  getInvoices: async (
    filters: Partial<InvoiceFilters> = {},
    page = 1,
    limit = 25,
    sortField: SortField = 'invoice_date',
    sortOrder: SortOrder = 'desc'
  ) => {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    if (filters.minAmount) params.append('minAmount', filters.minAmount);
    if (filters.maxAmount) params.append('maxAmount', filters.maxAmount);
    
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    params.append('sortBy', sortField);
    params.append('order', sortOrder);

    const response = await api.get(`/api/invoices?${params.toString()}`);
    return response.data;
  },

  getInvoiceById: async (id: number) => {
    const response = await api.get(`/api/invoices/${id}`);
    return response.data;
  },

  updateInvoice: async (id: number, data: Partial<Invoice>) => {
    const response = await api.put(`/api/invoices/${id}`, data);
    return response.data;
  },

  deleteInvoice: async (id: number) => {
    const response = await api.delete(`/api/invoices/${id}`);
    return response.data;
  },

  exportInvoices: async (filters: Partial<InvoiceFilters> = {}) => {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    if (filters.minAmount) params.append('minAmount', filters.minAmount);
    if (filters.maxAmount) params.append('maxAmount', filters.maxAmount);

    const response = await api.get(`/api/invoices/export?${params.toString()}`, {
      responseType: 'blob',
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `invoices_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

// Resume API
export const resumeApi = {
  getResumes: async (
    filters: Partial<ResumeFilters> = {},
    page = 1,
    limit = 25,
    sortField: ResumeSortField = 'created_at',
    sortOrder: SortOrder = 'desc'
  ) => {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.skills && filters.skills.length > 0) {
      params.append('skills', filters.skills.join(','));
    }
    if (filters.minExperience !== undefined) {
      params.append('minExperience', filters.minExperience.toString());
    }
    if (filters.maxExperience !== undefined) {
      params.append('maxExperience', filters.maxExperience.toString());
    }
    if (filters.minScore !== undefined) {
      params.append('minScore', filters.minScore.toString());
    }
    if (filters.maxScore !== undefined) {
      params.append('maxScore', filters.maxScore.toString());
    }
    
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    params.append('sortBy', sortField);
    params.append('order', sortOrder);

    const response = await api.get(`/api/resumes?${params.toString()}`);
    return response.data;
  },

  getResumeById: async (id: number) => {
    const response = await api.get(`/api/resumes/${id}`);
    return response.data;
  },

  deleteResume: async (id: number) => {
    const response = await api.delete(`/api/resumes/${id}`);
    return response.data;
  },

  downloadResume: async (id: number, filename: string) => {
    const response = await api.get(`/api/resumes/${id}/download`, {
      responseType: 'blob',
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  matchResumeToJob: async (resumeId: number, jobId: number) => {
    const response = await api.post(`/api/resumes/${resumeId}/match`, { jobId });
    return response.data;
  },
};

// Contract API
export const contractApi = {
  getContracts: async (
    filters: Partial<ContractFilters> = {},
    page = 1,
    limit = 25,
    sortField: ContractSortField = 'expiration_date',
    sortOrder: SortOrder = 'asc'
  ) => {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.type) params.append('type', filters.type);
    if (filters.status) params.append('status', filters.status);
    if (filters.risk) params.append('risk', filters.risk);
    
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    params.append('sortBy', sortField);
    params.append('order', sortOrder);

    const response = await api.get(`/api/contracts?${params.toString()}`);
    return response.data;
  },

  getContractById: async (id: string) => {
    const response = await api.get(`/api/contracts/${id}`);
    return response.data;
  },

  deleteContract: async (id: string) => {
    const response = await api.delete(`/api/contracts/${id}`);
    return response.data;
  },
};

// Receipt API
export const receiptApi = {
  getReceipts: async (
    filters: Partial<ReceiptFilters> = {},
    page = 1,
    limit = 25
  ) => {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.category) params.append('category', filters.category);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    if (filters.isBusiness !== undefined) params.append('isBusiness', filters.isBusiness.toString());
    
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await api.get(`/api/receipts?${params.toString()}`);
    return response.data;
  },

  getReceiptById: async (id: string) => {
    const response = await api.get(`/api/receipts/${id}`);
    return response.data;
  },

  getReceiptStats: async () => {
    const response = await api.get('/api/receipts/stats');
    return response.data;
  },

  deleteReceipt: async (id: string) => {
    const response = await api.delete(`/api/receipts/${id}`);
    return response.data;
  },
};

// Job API
export const jobApi = {
  getJobs: async (filters: Partial<JobFilters> = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.department) params.append('department', filters.department);
    if (filters.status) params.append('status', filters.status);

    const response = await api.get(`/api/jobs?${params.toString()}`);
    return response.data;
  },

  getJobById: async (id: string) => {
    const response = await api.get(`/api/jobs/${id}`);
    return response.data;
  },

  createJob: async (data: Partial<Job>) => {
    const response = await api.post('/api/jobs', data);
    return response.data;
  },

  updateJob: async (id: string, data: Partial<Job>) => {
    const response = await api.put(`/api/jobs/${id}`, data);
    return response.data;
  },

  deleteJob: async (id: string) => {
    const response = await api.delete(`/api/jobs/${id}`);
    return response.data;
  },
};
