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
      set({ overview, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch overview', isLoading: false });
    }
  },

  fetchActivities: async (limit = 10) => {
    try {
      const activities = await dashboardService.getActivity(limit);
      set({ activities });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch activities' });
    }
  },

  fetchTrends: async (period) => {
    try {
      const trendPeriod = period || get().trendPeriod;
      const trends = await dashboardService.getTrends(trendPeriod);
      set({ trends, trendPeriod });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch trends' });
    }
  },

  fetchFinancial: async () => {
    try {
      const financial = await dashboardService.getFinancialSummary();
      set({ financial });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch financial data' });
    }
  },

  setTrendPeriod: (period: 7 | 30) => {
    set({ trendPeriod: period });
    get().fetchTrends(period);
  },

  refreshAll: async () => {
    const { fetchOverview, fetchActivities, fetchTrends, fetchFinancial } = get();
    await Promise.all([
      fetchOverview(),
      fetchActivities(),
      fetchTrends(),
      fetchFinancial(),
    ]);
  },
}));
