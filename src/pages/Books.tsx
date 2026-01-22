import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/api';
import { API_ENDPOINTS } from '../config/api';
import type { Book, Review } from '../types';
import './Books.css';

const Books: React.FC = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState<number | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const queryClient = useQueryClient();

  const { data: books, isLoading } = useQuery<Book[]>({
    queryKey: ['books'],
    queryFn: async () => {
      const response = await apiClient.get(API_ENDPOINTS.BOOKS);
      return response.data;
    },
  });

  const createBookMutation = useMutation({
    mutationFn: async (bookData: Partial<Book>) => {
      const response = await apiClient.post(API_ENDPOINTS.BOOKS, bookData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      setShowAddModal(false);
    },
  });

  const deleteBookMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(API_ENDPOINTS.BOOK_BY_ID(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });

  const handleAddBook = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const yearPublished = formData.get('year_published') as string;
    const summary = formData.get('summary') as string;
    const yearPublishedInt = parseInt(yearPublished, 10);
    
    // Validate year before sending
    if (isNaN(yearPublishedInt) || yearPublishedInt < 1000 || yearPublishedInt > 2100) {
      alert('Year published must be between 1000 and 2100');
      return;
    }
    
    createBookMutation.mutate({
      title: formData.get('title') as string,
      author: formData.get('author') as string,
      genre: formData.get('genre') as string,
      year_published: yearPublishedInt,
      summary: summary || undefined, // Convert empty string to undefined
    });
  };

  if (isLoading) return <div className="loading">Loading books...</div>;

  return (
    <div className="books-page">
      <div className="page-header">
        <h1>Books</h1>
        <button onClick={() => setShowAddModal(true)} className="btn-primary">
          Add Book
        </button>
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add New Book</h2>
            <form onSubmit={handleAddBook}>
              <input name="title" placeholder="Title" required />
              <input name="author" placeholder="Author" required />
              <input name="genre" placeholder="Genre" required />
              <input
                name="year_published"
                type="number"
                placeholder="Year Published (1000-2100)"
                min="1000"
                max="2100"
                required
              />
              <textarea name="summary" placeholder="Summary" rows={4} />
              <div className="modal-actions">
                <button type="submit" className="btn-primary">
                  Add Book
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="books-grid">
        {books?.map((book) => (
          <div key={book.id} className="book-card">
            <h3>{book.title}</h3>
            <p className="book-author">by {book.author}</p>
            <p className="book-genre">{book.genre} • {book.year_published}</p>
            {book.summary && <p className="book-summary">{book.summary}</p>}
            <div className="book-actions">
              <button
                onClick={() => {
                  setSelectedBook(book);
                  setShowReviewModal(book.id);
                }}
                className="btn-secondary"
              >
                View Details
              </button>
              <button
                onClick={() => deleteBookMutation.mutate(book.id)}
                className="btn-danger"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showReviewModal && selectedBook && (
        <BookDetailsModal
          book={selectedBook}
          onClose={() => {
            setShowReviewModal(null);
            setSelectedBook(null);
          }}
        />
      )}
    </div>
  );
};

const BookDetailsModal: React.FC<{ book: Book; onClose: () => void }> = ({
  book,
  onClose,
}) => {
  const [showAddReview, setShowAddReview] = useState(false);
  const queryClient = useQueryClient();

  const { data: reviews } = useQuery<Review[]>({
    queryKey: ['reviews', book.id],
    queryFn: async () => {
      const response = await apiClient.get(API_ENDPOINTS.BOOK_REVIEWS(book.id));
      return response.data;
    },
  });

  const { data: summary } = useQuery({
    queryKey: ['book-summary', book.id],
    queryFn: async () => {
      const response = await apiClient.get(API_ENDPOINTS.BOOK_SUMMARY(book.id));
      return response.data;
    },
  });

  const addReviewMutation = useMutation({
    mutationFn: async (reviewData: { review_text: string; rating: number }) => {
      const response = await apiClient.post(API_ENDPOINTS.BOOK_REVIEWS(book.id), {
        book_id: book.id,
        ...reviewData,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', book.id] });
      queryClient.invalidateQueries({ queryKey: ['book-summary', book.id] });
      setShowAddReview(false);
    },
  });

  const handleAddReview = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    addReviewMutation.mutate({
      review_text: formData.get('review_text') as string,
      rating: parseInt(formData.get('rating') as string),
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <h2>{book.title}</h2>
        <p><strong>Author:</strong> {book.author}</p>
        <p><strong>Genre:</strong> {book.genre}</p>
        <p><strong>Year:</strong> {book.year_published}</p>
        {summary && (
          <div className="summary-section">
            <h3>Summary</h3>
            <p>{summary.summary || 'No summary available'}</p>
            {summary.average_rating && (
              <p><strong>Average Rating:</strong> {summary.average_rating.toFixed(1)}/5 ({summary.total_reviews} reviews)</p>
            )}
          </div>
        )}
        <div className="reviews-section">
          <div className="section-header">
            <h3>Reviews</h3>
            <button onClick={() => setShowAddReview(true)} className="btn-primary">
              Add Review
            </button>
          </div>
          {showAddReview && (
            <form onSubmit={handleAddReview} className="review-form">
              <textarea
                name="review_text"
                placeholder="Write your review..."
                required
                rows={4}
              />
              <select name="rating" required>
                <option value="">Select Rating</option>
                <option value="5">5 - Excellent</option>
                <option value="4">4 - Very Good</option>
                <option value="3">3 - Good</option>
                <option value="2">2 - Fair</option>
                <option value="1">1 - Poor</option>
              </select>
              <div className="form-actions">
                <button type="submit" className="btn-primary">Submit</button>
                <button
                  type="button"
                  onClick={() => setShowAddReview(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
          <div className="reviews-list">
            {reviews?.map((review) => (
              <div key={review.id} className="review-item">
                <div className="review-rating">⭐ {review.rating}/5</div>
                <p>{review.review_text}</p>
              </div>
            ))}
            {!reviews || reviews.length === 0 && (
              <p>No reviews yet. Be the first to review!</p>
            )}
          </div>
        </div>
        <button onClick={onClose} className="btn-secondary">Close</button>
      </div>
    </div>
  );
};

export default Books;
