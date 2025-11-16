import { apiClient } from './client';

export interface SummaryStats {
  totalReviewed: number;
  approvedPercent: number;
  rejectedPercent: number;
  changesRequestedPercent: number;
  avgReviewTimeSec: number;
}

export interface ActivityPoint {
  date: string; 
  count: number;
}

export interface DecisionSharePoint {
  type: 'approved' | 'rejected' | 'changes_requested';
  value: number;
}

export interface CategoryStatsPoint {
  categoryId: number;
  categoryName?: string;
  count: number;
}

export const statsApi = {
  getSummary(signal?: AbortSignal) {
    return apiClient.get<SummaryStats>('/stats/summary', { signal });
  },

  getActivityChart(signal?: AbortSignal) {
    return apiClient.get<ActivityPoint[]>('/stats/chart/activity', { signal });
  },

  getDecisionsChart(signal?: AbortSignal) {
    return apiClient.get<DecisionSharePoint[]>('/stats/chart/decisions', {
      signal,
    });
  },

  getCategoryChart(signal?: AbortSignal) {
    return apiClient.get<CategoryStatsPoint[]>('/stats/chart/categories', {
      signal,
    });
  },
};
