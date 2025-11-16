const API_BASE = "http://localhost:3001/api/v1";

export type Period = "today" | "week" | "month";

export type ActivityPoint = {
  date: string;
  approved: number;
  rejected: number;
  requestChanges: number;
};

export type StatsSummaryResponse = {
  totalReviewed: number;
  totalReviewedToday: number;
  totalReviewedThisWeek: number;
  totalReviewedThisMonth: number;
  approvedPercentage: number;
  rejectedPercentage: number;
  requestChangesPercentage: number;
  averageReviewTime: number;
};

export type CategoriesMap = Record<string, number>;

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }

  return res.json();
}

export const statsApi = {
  async getSummary(
    period: Period,
    signal?: AbortSignal
  ): Promise<StatsSummaryResponse> {
    const params = new URLSearchParams();
    params.set("period", period);

    return request<StatsSummaryResponse>(
      `${API_BASE}/stats/summary?${params.toString()}`,
      { signal }
    );
  },

  async getActivity(
    period: Period,
    signal?: AbortSignal
  ): Promise<ActivityPoint[]> {
    const params = new URLSearchParams();
    params.set("period", period);

    return request<ActivityPoint[]>(
      `${API_BASE}/stats/chart/activity?${params.toString()}`,
      { signal }
    );
  },

  async getCategories(
    period: Period,
    signal?: AbortSignal
  ): Promise<CategoriesMap> {
    const params = new URLSearchParams();
    params.set("period", period);

    return request<CategoriesMap>(
      `${API_BASE}/stats/chart/categories?${params.toString()}`,
      { signal }
    );
  },
};
