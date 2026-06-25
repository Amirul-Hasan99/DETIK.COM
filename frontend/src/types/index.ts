export interface NewsArticle {
  id: number;
  tanggal: string;
  judul_berita: string;
  url: string;
  label: string;
  judul_bersih?: string;
  tokenisasi?: string;
  jumlah_kata?: number;
  is_preprocessed: boolean;
  created_at?: string;
}

export interface NewsListResponse {
  data: NewsArticle[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface DashboardKPI {
  total_news: number;
  total_categories: number;
  best_model: string;
  best_accuracy: number;
  preprocessed_count: number;
  prediction_count: number;
  model_ready: boolean;
}

export interface DashboardResponse {
  kpi: DashboardKPI;
  category_distribution: { name: string; value: number }[];
  recent_training: { model_name: string; accuracy: number } | null;
}

export interface TrainingResult {
  id: number;
  model_name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  confusion_matrix: number[][];
  classification_report: Record<string, any>;
  is_best: boolean;
  training_session_id: string;
  created_at?: string;
}

export interface TrainingResponse {
  results: TrainingResult[];
  best_model: string;
  best_accuracy: number;
  session_id: string;
}

export interface PredictionResponse {
  input_text: string;
  preprocessed_text: string;
  predicted_label: string;
  confidence: number | null;
  model_used: string | null;
}

export interface PredictionHistory {
  id: number;
  input_text: string;
  preprocessed_text: string;
  predicted_label: string;
  confidence: number | null;
  model_used: string | null;
  created_at: string | null;
}

export interface DataUnderstanding {
  total_rows: number;
  duplicate_count: number;
  null_count: number;
  avg_title_length: number;
  category_distribution: Record<string, number>;
  top_frequent_words: { word: string; count: number }[];
}

export interface EDAResponse {
  category_distribution: { name: string; value: number }[];
  word_cloud_data: { text: string; value: number }[];
  title_length_histogram: { range: string; count: number }[];
  top_tokens: { token: string; count: number }[];
  dataset_preview: Record<string, any>[];
}

export interface PreprocessingComparison {
  id: number;
  original: string;
  preprocessed: string;
  tokens: string;
  word_count: number;
}

export interface PreprocessingSteps {
  original: string;
  final: string;
  tokens: string[];
  word_count: number;
  steps: { step: string; result: string }[];
}

export interface Insight {
  icon: string;
  title: string;
  description: string;
  type: "info" | "success" | "warning" | "error";
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  created_at: string | null;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface CrawlConfig {
  categories: Record<string, number>;
}
