import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../lib/api';
import { API_ENDPOINTS } from '../config/api';
import type { User } from '../types';
import './Users.css';

const Users: React.FC = () => {
  const { isAdmin } = useAuth();
  const [showEditModal, setShowEditModal] = useState<User | null>(null);
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await apiClient.get(API_ENDPOINTS.USERS);
      return response.data;
    },
    enabled: isAdmin,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`${API_ENDPOINTS.USERS}/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: number; updates: Partial<User> }) => {
      const response = await apiClient.put(
        `${API_ENDPOINTS.USERS}/${data.id}`,
        data.updates
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowEditModal(null);
    },
  });

  if (!isAdmin) {
    return (
      <div className="error-container">
        <h2>Access Denied</h2>
        <p>You need admin privileges to access this page.</p>
      </div>
    );
  }

  if (isLoading) return <div className="loading">Loading users...</div>;

  return (
    <div className="users-page">
      <div className="page-header">
        <h1>User Management</h1>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Full Name</th>
              <th>Status</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.email}</td>
                <td>{user.full_name || '-'}</td>
                <td>
                  <span
                    className={`status-badge ${
                      user.is_active ? 'active' : 'inactive'
                    }`}
                  >
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <span
                    className={`role-badge ${
                      user.is_superuser ? 'admin' : 'user'
                    }`}
                  >
                    {user.is_superuser ? 'Admin' : 'User'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      onClick={() => setShowEditModal(user)}
                      className="btn-edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(user.id)}
                      className="btn-danger"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showEditModal && (
        <EditUserModal
          user={showEditModal}
          onClose={() => setShowEditModal(null)}
          onUpdate={(updates) =>
            updateMutation.mutate({ id: showEditModal.id, updates })
          }
        />
      )}
    </div>
  );
};

const EditUserModal: React.FC<{
  user: User;
  onClose: () => void;
  onUpdate: (updates: Partial<User>) => void;
}> = ({ user, onClose, onUpdate }) => {
  const [fullName, setFullName] = useState(user.full_name || '');
  const [isActive, setIsActive] = useState(user.is_active);
  const [isSuperuser, setIsSuperuser] = useState(user.is_superuser);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      full_name: fullName,
      is_active: isActive,
      is_superuser: isSuperuser,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Edit User</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={user.email} disabled />
          </div>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              Active
            </label>
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={isSuperuser}
                onChange={(e) => setIsSuperuser(e.target.checked)}
              />
              Admin
            </label>
          </div>
          <div className="modal-actions">
            <button type="submit" className="btn-primary">
              Update
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Users;
