import api from './api';
import type { ApiResponse } from '../types';

export interface DashboardOverview {
  summary: {
    total_documents: number;
    documents_by_type: {
      invoice: number;
      receipt: number;
      resume: number;
      contract: number;
    };
    processing_status: {
      pending: number;
      processing: number;
      completed: number;
      failed: number;
    };
  };
  financial: {
    invoices: {
      total_count: number;
      total_amount: number;
      by_status: {
        pending: number;
        paid: number;
        overdue: number;
      };
      pending_amount: number;
      paid_amount: number;
    };
    receipts: {
      total_count: number;
      total_amount: number;
      business_expenses: number;
      personal_expenses: number;
      top_categories: Array<{
        category: string;
        amount: number;
      }>;
    };
  };
  recent_activity: Array<{
    id: string;
    type: string;
    document_type: string;
    filename: string;
    status: string;
    created_at: string;
  }>;
  trends: {
    uploads_last_7_days: number;
    uploads_last_30_days: number;
    documents_by_date: Array<{
      date: string;
      count: number;
    }>;
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
