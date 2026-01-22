/**
 * API Configuration
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  ME: '/users/me',
  
  // Users
  USERS: '/users',
  
  // Books
  BOOKS: '/books',
  BOOK_BY_ID: (id: number) => `/books/${id}`,
  BOOK_REVIEWS: (id: number) => `/books/${id}/reviews`,
  BOOK_SUMMARY: (id: number) => `/books/${id}/summary`,
  GENERATE_SUMMARY: '/generate-summary',
  RECOMMENDATIONS: '/recommendations',
  
  // Documents
  DOCUMENTS: '/documents',
  DOCUMENT_BY_ID: (id: number) => `/documents/${id}`,
  DOCUMENT_INGEST: (id: number) => `/documents/${id}/ingest`,
  
  // Ingestion
  INGESTIONS: '/ingestions',
  INGESTION_BY_ID: (id: number) => `/ingestions/${id}`,
  
  // Q&A
  QA: '/qa',
};
