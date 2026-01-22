/**
 * Layout Component
 */

import React from 'react';
import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Layout.css';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="nav-brand">
            Book Management System
          </Link>
          <div className="nav-links">
            <Link to="/books">Books</Link>
            <Link to="/documents">Documents</Link>
            <Link to="/qa">Q&A</Link>
            {isAdmin && <Link to="/users">Users</Link>}
            {user && (
              <div className="user-menu">
                <span className="user-name">{user.full_name || user.email}</span>
                <button onClick={handleLogout} className="btn-logout">
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
      <main className="main-content">{children}</main>
    </div>
  );
};

export default Layout;
