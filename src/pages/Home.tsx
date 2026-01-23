import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../lib/api';
import { API_ENDPOINTS } from '../config/api';
import './Home.css';

const Home: React.FC = () => {
  const { user, isAdmin } = useAuth();
  
  // Fetch stats for dashboard
  const { data: books } = useQuery({
    queryKey: ['books'],
    queryFn: async () => {
      const response = await apiClient.get(API_ENDPOINTS.BOOKS);
      return response.data;
    },
  });
  
  const { data: documents } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const response = await apiClient.get(API_ENDPOINTS.DOCUMENTS);
      return response.data;
    },
  });

  return (
    <div className="home-page">
      <div className="hero-section">
        <h1>Welcome to Book Management System</h1>
        <p className="subtitle">
          Manage books, documents, and get AI-powered answers using RAG
        </p>
        {(books || documents) && (
          <div className="stats-bar">
            <div className="stat-item">
              <span className="stat-number">{books?.length || 0}</span>
              <span className="stat-label">Books</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{documents?.length || 0}</span>
              <span className="stat-label">Documents</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {documents?.filter((d: any) => d.ingestion_status === 'completed').length || 0}
              </span>
              <span className="stat-label">Ingested</span>
            </div>
          </div>
        )}
      </div>

      <div className="features-grid">
        <div className="feature-card">
          <h3>📚 Books</h3>
          <p>Manage your book collection with AI-generated summaries</p>
          <Link to="/books" className="feature-link">
            Go to Books →
          </Link>
        </div>

        <div className="feature-card">
          <h3>📄 Documents</h3>
          <p>Upload and manage documents for RAG-based Q&A</p>
          <Link to="/documents" className="feature-link">
            Go to Documents →
          </Link>
        </div>

        <div className="feature-card">
          <h3>❓ Q&A</h3>
          <p>Ask questions and get AI-powered answers from your documents</p>
          <Link to="/qa" className="feature-link">
            Go to Q&A →
          </Link>
        </div>

        {isAdmin && (
          <div className="feature-card">
            <h3>👥 Users</h3>
            <p>Manage users and assign roles (Admin only)</p>
            <Link to="/users" className="feature-link">
              Go to Users →
            </Link>
          </div>
        )}
      </div>

      {user && (
        <div className="user-info">
          <p>Logged in as: <strong>{user.full_name || user.email}</strong></p>
          {isAdmin && <span className="admin-badge">Admin</span>}
        </div>
      )}
    </div>
  );
};

export default Home;
