const API_BASE_URL = "http://localhost:3001/api/v1";

type HttpMethod = "GET" | "POST";

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  signal?: AbortSignal;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  const res = await fetch(url, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  });

  if (!res.ok) {
    let msg = `API error ${res.status}`;

    try {
      const data = await res.json();
      if (data && typeof data === "object" && "error" in data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        msg = String((data as any).error);
      }
    } catch {
      // тело не JSON — оставляем дефолт
    }

    throw new Error(msg);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export const apiClient = {
  get<T>(path: string, options: { signal?: AbortSignal } = {}) {
    return request<T>(path, { method: "GET", ...options });
  },
  post<T>(path: string, body?: unknown, options: { signal?: AbortSignal } = {}) {
    return request<T>(path, { method: "POST", body, ...options });
  },
};
