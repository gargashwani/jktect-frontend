import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '../lib/api';
import { API_ENDPOINTS } from '../config/api';
import type { QAResponse, Document } from '../types';
import './QA.css';

const QA: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]);

  const { data: documents } = useQuery<Document[]>({
    queryKey: ['documents'],
    queryFn: async () => {
      const response = await apiClient.get(API_ENDPOINTS.DOCUMENTS);
      return response.data.filter((doc: Document) => doc.ingestion_status === 'completed');
    },
  });

  const askQuestionMutation = useMutation({
    mutationFn: async (data: { question: string; document_ids?: number[] }) => {
      const response = await apiClient.post<QAResponse>(API_ENDPOINTS.QA, data);
      return response.data;
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    askQuestionMutation.mutate({
      question,
      document_ids: selectedDocuments.length > 0 ? selectedDocuments : undefined,
    });
  };

  const toggleDocument = (docId: number) => {
    setSelectedDocuments((prev) =>
      prev.includes(docId)
        ? prev.filter((id) => id !== docId)
        : [...prev, docId]
    );
  };

  return (
    <div className="qa-page">
      <h1>Ask Questions</h1>
      <p className="subtitle">
        Ask questions about your documents and get AI-powered answers using RAG
      </p>

      <div className="qa-container">
        <div className="documents-filter">
          <h3>Filter by Documents (Optional)</h3>
          {documents && documents.length > 0 ? (
            <div className="documents-checkboxes">
              <label>
                <input
                  type="checkbox"
                  checked={selectedDocuments.length === 0}
                  onChange={() => setSelectedDocuments([])}
                />
                All Documents
              </label>
              {documents.map((doc) => (
                <label key={doc.id}>
                  <input
                    type="checkbox"
                    checked={selectedDocuments.includes(doc.id)}
                    onChange={() => toggleDocument(doc.id)}
                  />
                  {doc.filename}
                </label>
              ))}
            </div>
          ) : (
            <p className="no-documents">
              No documents available. Upload and ingest documents first.
            </p>
          )}
        </div>

        <div className="qa-form-section">
          <form onSubmit={handleSubmit} className="qa-form">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question about your documents..."
              rows={4}
              required
            />
            <button
              type="submit"
              className="btn-primary"
              disabled={askQuestionMutation.isPending || !question.trim()}
            >
              {askQuestionMutation.isPending ? 'Asking...' : 'Ask Question'}
            </button>
          </form>

          {askQuestionMutation.data && (
            <div className="qa-response">
              <div className="response-header">
                <h3>Answer</h3>
                {askQuestionMutation.data.confidence && (
                  <span className="confidence">
                    Confidence: {(askQuestionMutation.data.confidence * 100).toFixed(0)}%
                  </span>
                )}
              </div>
              <div className="answer">{askQuestionMutation.data.answer}</div>

              {askQuestionMutation.data.sources && askQuestionMutation.data.sources.length > 0 && (
                <div className="sources">
                  <h4>Sources</h4>
                  {askQuestionMutation.data.sources.map((source, index) => (
                    <div key={index} className="source-item">
                      <div className="source-header">
                        <strong>{source.filename}</strong>
                        {source.distance && (
                          <span className="distance">
                            Distance: {source.distance.toFixed(3)}
                          </span>
                        )}
                      </div>
                      <p className="source-content">{source.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {askQuestionMutation.isError && (
            <div className="error-message">
              Error: {askQuestionMutation.error instanceof Error
                ? askQuestionMutation.error.message
                : 'Failed to get answer'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QA;
