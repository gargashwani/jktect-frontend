/**
 * Type Definitions
 */

export interface User {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at: string;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  genre: string;
  year_published: number;
  summary?: string;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: number;
  book_id: number;
  user_id: number;
  review_text: string;
  rating: number;
  created_at: string;
  updated_at: string;
}

export interface BookSummary {
  book: Book;
  average_rating?: number;
  total_reviews: number;
  summary?: string;
}

export interface Document {
  id: number;
  filename: string;
  file_path: string;
  file_size: number;
  mime_type?: string;
  content?: string;
  ingestion_status: 'pending' | 'processing' | 'completed' | 'failed';
  ingestion_error?: string;
  uploaded_by: number;
  created_at: string;
  updated_at: string;
}

export interface Ingestion {
  id: number;
  document_id: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  error_message?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface QARequest {
  question: string;
  document_ids?: number[];
}

export interface QAResponse {
  question: string;
  answer: string;
  sources: Array<{
    content: string;
    document_id: number;
    chunk_index: number;
    filename: string;
    distance?: number;
  }>;
  confidence?: number;
}

export interface LoginRequest {
  username: string; // email
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  is_superuser?: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}
