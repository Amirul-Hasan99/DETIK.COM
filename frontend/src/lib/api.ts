const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (username: string, password: string) =>
    fetchAPI<any>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  register: (username: string, email: string, password: string, role: string = "user") =>
    fetchAPI<any>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password, role }),
    }),

  getMe: () => fetchAPI<any>("/auth/me"),

  // Dashboard
  getDashboard: () => fetchAPI<any>("/dashboard"),

  // Dataset
  getDataset: (params: {
    page?: number;
    page_size?: number;
    search?: string;
    label?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set("page", String(params.page));
    if (params.page_size) searchParams.set("page_size", String(params.page_size));
    if (params.search) searchParams.set("search", params.search);
    if (params.label) searchParams.set("label", params.label);
    return fetchAPI<any>(`/dataset?${searchParams.toString()}`);
  },

  getCategories: () => fetchAPI<any>("/dataset/categories"),

  clearDataset: () => fetchAPI<any>("/dataset/clear", { method: "DELETE" }),

  // Crawling
  importCSV: () => fetchAPI<any>("/crawl/import-csv", { method: "POST" }),

  // Preprocessing
  runPreprocessing: () =>
    fetchAPI<any>("/preprocess/run", { method: "POST" }),

  previewPreprocessing: (text: string) =>
    fetchAPI<any>("/preprocess/preview", {
      method: "POST",
      body: JSON.stringify({ text }),
    }),

  getPreprocessingComparison: (limit: number = 10) =>
    fetchAPI<any>(`/preprocess/comparison?limit=${limit}`),

  // Analysis
  getDataUnderstanding: () => fetchAPI<any>("/analysis/understanding"),

  getEDA: () => fetchAPI<any>("/analysis/eda"),

  // Training
  runTraining: (config?: any) =>
    fetchAPI<any>("/training/run", {
      method: "POST",
      body: JSON.stringify(config || {}),
    }),

  // Evaluation
  getEvaluation: (sessionId?: string) => {
    const params = sessionId ? `?session_id=${sessionId}` : "";
    return fetchAPI<any>(`/evaluation${params}`);
  },

  // Prediction
  predict: (text: string) =>
    fetchAPI<any>("/predict", {
      method: "POST",
      body: JSON.stringify({ text }),
    }),

  getPredictionHistory: (limit: number = 50) =>
    fetchAPI<any>(`/predict/history?limit=${limit}`),

  reloadModel: () =>
    fetchAPI<any>("/predict/reload-model", { method: "POST" }),

  // Insights
  getInsights: () => fetchAPI<any>("/insights"),

  // Export
  exportRaw: () => `${API_BASE}/export/raw`,
  exportPreprocessed: () => `${API_BASE}/export/preprocessed`,
  exportPredictions: () => `${API_BASE}/export/predictions`,
};
