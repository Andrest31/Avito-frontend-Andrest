const API_BASE = "http://localhost:3001/api/v1";

export interface Advertisement {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  categoryId: number;
  status: "pending" | "approved" | "rejected" | "draft";
  priority: "normal" | "urgent";
  createdAt: string;
  updatedAt: string;
  images: string[];
  seller: {
    id: number;
    name: string;
    rating: string;
    totalAds: number;
    registeredAt: string;
  };
  characteristics: Record<string, string>;
  moderationHistory: {
    id: number;
    moderatorId: number;
    moderatorName: string;
    action: "approved" | "rejected" | "requestChanges";
    reason: string | null;
    comment: string;
    timestamp: string;
  }[];
}

export interface AdsResponse {
  ads: Advertisement[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

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

export const adsApi = {
  async getAll(signal?: AbortSignal): Promise<AdsResponse> {
    return request<AdsResponse>(`${API_BASE}/ads`, { signal });
  },

  async getById(id: number): Promise<Advertisement> {
    return request<Advertisement>(`${API_BASE}/ads/${id}`);
  },

  async approve(id: number): Promise<Advertisement> {
    const res = await request<{ ad: Advertisement }>(
      `${API_BASE}/ads/${id}/approve`,
      { method: "POST" }
    );
    return res.ad;
  },

  async reject(
    id: number,
    reason: string,
    comment?: string
  ): Promise<Advertisement> {
    const res = await request<{ ad: Advertisement }>(
      `${API_BASE}/ads/${id}/reject`,
      {
        method: "POST",
        body: JSON.stringify({ reason, comment }),
      }
    );
    return res.ad;
  },

  async requestChanges(
    id: number,
    reason: string,
    comment?: string
  ): Promise<Advertisement> {
    const res = await request<{ ad: Advertisement }>(
      `${API_BASE}/ads/${id}/request-changes`,
      {
        method: "POST",
        body: JSON.stringify({ reason, comment }),
      }
    );
    return res.ad;
  },
};
