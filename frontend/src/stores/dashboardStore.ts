import { create } from 'zustand';
import dashboardService, { type DashboardOverview, type Activity, type TrendData, type FinancialSummary } from '../services/dashboardService';

interface DashboardState {
  overview: DashboardOverview | null;
  activities: Activity[];
  trends: TrendData[];
  financial: FinancialSummary | null;
  trendPeriod: 7 | 30;
  isLoading: boolean;
  error: string | null;
  
  fetchOverview: () => Promise<void>;
  fetchActivities: (limit?: number) => Promise<void>;
  fetchTrends: (period?: 7 | 30) => Promise<void>;
  fetchFinancial: () => Promise<void>;
  setTrendPeriod: (period: 7 | 30) => void;
  refreshAll: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  overview: null,
  activities: [],
  trends: [],
  financial: null,
  trendPeriod: 7,
  isLoading: false,
  error: null,

  fetchOverview: async () => {
    try {
      set({ isLoading: true, error: null });
      const overview = await dashboardService.getOverview();
      
      // Extract activities and trends from the overview response
      const activities = overview.recent_activity.map(activity => ({
        id: activity.id,
        type: activity.type as 'upload' | 'process' | 'delete' | 'export',
        documentType: activity.document_type as 'invoice' | 'resume' | 'contract' | 'receipt',
        documentName: activity.filename,
        timestamp: activity.created_at,
        status: activity.status
      }));
      
      const trends = overview.trends.documents_by_date.map(item => ({
        date: item.date,
        uploads: item.count,
        processed: 0 // Not provided in current API
      }));
      
      set({ overview, activities, trends, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch overview', isLoading: false });
    }
  },

  fetchActivities: async () => {
    // Activities are now fetched as part of overview
    // This method is kept for backwards compatibility
    return;
  },

  fetchTrends: async () => {
    // Trends are now fetched as part of overview
    // This method is kept for backwards compatibility
    return;
  },

  fetchFinancial: async () => {
    // Financial data is now part of overview
    // This method is kept for backwards compatibility
    return;
  },

  setTrendPeriod: (period: 7 | 30) => {
    set({ trendPeriod: period });
    // Could potentially refetch with period parameter if needed
  },

  refreshAll: async () => {
    // Now we only need to fetch overview since it contains everything
    await get().fetchOverview();
  },
}));
