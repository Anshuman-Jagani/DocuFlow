import api from './api';
import type { ApiResponse } from '../types';

export interface DashboardOverview {
  totalDocuments: number;
  documentsByType: {
    invoice: number;
    receipt: number;
    resume: number;
    contract: number;
  };
  processingStatus: {
    pending: number;
    completed: number;
    failed: number;
  };
  thisMonth: {
    uploaded: number;
    processed: number;
  };
}

export interface Activity {
  id: string;
  type: 'upload' | 'process' | 'delete' | 'export';
  documentType: 'invoice' | 'resume' | 'contract' | 'receipt';
  documentName: string;
  timestamp: string;
  status?: string;
}

export interface TrendData {
  date: string;
  uploads: number;
  processed: number;
}

export interface FinancialSummary {
  totalInvoiceAmount: number;
  totalReceiptAmount: number;
  pendingInvoices: number;
  currency: string;
  byStatus: {
    paid: number;
    pending: number;
    overdue: number;
  };
}

class DashboardService {
  async getOverview(): Promise<DashboardOverview> {
    const response = await api.get<ApiResponse<DashboardOverview>>('/api/dashboard/overview');
    return response.data.data;
  }

  async getActivity(limit: number = 10): Promise<Activity[]> {
    const response = await api.get<ApiResponse<{ activities: Activity[] }>>(
      `/api/dashboard/activity?limit=${limit}`
    );
    return response.data.data.activities;
  }

  async getTrends(period: 7 | 30 = 7): Promise<TrendData[]> {
    const response = await api.get<ApiResponse<{ trends: TrendData[] }>>(
      `/api/dashboard/trends?period=${period}`
    );
    return response.data.data.trends;
  }

  async getFinancialSummary(): Promise<FinancialSummary> {
    const response = await api.get<ApiResponse<FinancialSummary>>('/api/dashboard/financial');
    return response.data.data;
  }
}

export default new DashboardService();
