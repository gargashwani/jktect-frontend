import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/api';
import { API_ENDPOINTS } from '../config/api';
import type { Document } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../contexts/ToastContext';
import './Documents.css';

const Documents: React.FC = () => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  const { data: documents, isLoading } = useQuery<Document[]>({
    queryKey: ['documents'],
    queryFn: async () => {
      const response = await apiClient.get(API_ENDPOINTS.DOCUMENTS);
      return response.data;
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await apiClient.post(API_ENDPOINTS.DOCUMENTS, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setShowUploadModal(false);
      showSuccess('Document uploaded successfully!');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.detail || 'Failed to upload document';
      showError(errorMessage);
    },
  });

  const ingestMutation = useMutation({
    mutationFn: async (documentId: number) => {
      const response = await apiClient.post(API_ENDPOINTS.DOCUMENT_INGEST(documentId));
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['ingestions'] });
      showSuccess('Document ingestion started!');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.detail || 'Failed to start ingestion';
      showError(errorMessage);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(API_ENDPOINTS.DOCUMENT_BY_ID(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      showSuccess('Document deleted successfully!');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.detail || 'Failed to delete document';
      showError(errorMessage);
    },
  });

  const handleUpload = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const file = formData.get('file') as File;
    
    if (!file) {
      alert('Please select a file to upload');
      return;
    }
    
    // Validate file extension - only .txt files allowed
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.txt')) {
      showError('Only .txt files are allowed. Please select a text file.');
      return;
    }
    
    if (!file) {
      showError('Please select a file to upload');
      return;
    }
    
    uploadMutation.mutate(file);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#27ae60';
      case 'processing':
        return '#3498db';
      case 'failed':
        return '#e74c3c';
      default:
        return '#95a5a6';
    }
  };

  if (isLoading) return <LoadingSpinner message="Loading documents..." />;

  return (
    <div className="documents-page">
      <div className="page-header">
        <h1>Documents</h1>
        <button onClick={() => setShowUploadModal(true)} className="btn-primary">
          Upload Document
        </button>
      </div>

      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Upload Document</h2>
            <form onSubmit={handleUpload}>
              <input
                type="file"
                name="file"
                required
                accept=".txt,text/plain"
              />
              <p className="file-hint" style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>
                Only .txt files are allowed
              </p>
              <div className="modal-actions">
                <button type="submit" className="btn-primary" disabled={uploadMutation.isPending}>
                  {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="documents-list">
        {documents?.map((doc) => (
          <div key={doc.id} className="document-card">
            <div className="document-header">
              <h3>{doc.filename}</h3>
              <span
                className="status-badge"
                style={{ backgroundColor: getStatusColor(doc.ingestion_status) }}
              >
                {doc.ingestion_status}
              </span>
            </div>
            <div className="document-info">
              <p>Size: {(doc.file_size / 1024).toFixed(2)} KB</p>
              <p>Type: {doc.mime_type || 'Unknown'}</p>
              <p>Uploaded: {new Date(doc.created_at).toLocaleDateString()}</p>
            </div>
            {doc.ingestion_error && (
              <div className="error-message">{doc.ingestion_error}</div>
            )}
            <div className="document-actions">
              {doc.ingestion_status === 'pending' && (
                <button
                  onClick={() => ingestMutation.mutate(doc.id)}
                  className="btn-primary"
                  disabled={ingestMutation.isPending}
                >
                  Start Ingestion
                </button>
              )}
              {doc.ingestion_status === 'processing' && (
                <span className="processing">Processing...</span>
              )}
              <button
                onClick={() => deleteMutation.mutate(doc.id)}
                className="btn-danger"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {!documents || documents.length === 0 && (
          <p className="empty-state">No documents uploaded yet.</p>
        )}
      </div>
    </div>
  );
};

export default Documents;
