import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import type { UserRole } from '../context/FarmContext';

export const Login: React.FC = () => {
  const { login } = useFarm();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('Admin');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    // Simulate short network delay for premium experience
    setTimeout(() => {
      // Hardcode simple passwords: 'admin' for Admin and 'employee' for Employee
      const expectedPassword = role === 'Admin' ? 'admin' : 'employee';
      
      if (password === expectedPassword) {
        const success = login(username, role);
        if (!success) {
          setError('Failed to create session. Please try again.');
        }
      } else {
        setError('Invalid credentials. Hint: Password matches the role lowercase.');
      }
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="login-container">
      <div className="login-bg-glows">
        <div className="glow glow-1"></div>
        <div className="glow glow-2"></div>
      </div>

      <div className="login-card glass-card">
        <div className="login-header">
          <div className="login-logo">🐔</div>
          <h2>AKSHA FARM ERP</h2>
          <p>Poultry Farm Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="role-selector">
            <button
              type="button"
              className={`role-btn ${role === 'Admin' ? 'active admin' : ''}`}
              onClick={() => setRole('Admin')}
            >
              👑 Admin
            </button>
            <button
              type="button"
              className={`role-btn ${role === 'Employee' ? 'active employee' : ''}`}
              onClick={() => setRole('Employee')}
            >
              🧑‍🌾 Employee
            </button>
          </div>

          {error && <div className="login-error-alert">{error}</div>}

          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-control"
              placeholder={role === 'Admin' ? 'e.g. admin' : 'e.g. employee'}
              value={username}
              onChange={e => setUsername(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary login-submit-btn" disabled={isLoading}>
            {isLoading ? (
              <span className="spinner-loader"></span>
            ) : (
              'Access Dashboard'
            )}
          </button>
        </form>

        <div className="login-hint">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
          <span>Use password <b>admin</b> for Admin and <b>employee</b> for Employee.</span>
        </div>
      </div>

      <style>{`
        .login-container {
          width: 100vw;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #060913;
          position: relative;
          overflow: hidden;
          font-family: var(--font-family);
        }

        .login-bg-glows {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          z-index: 0;
          overflow: hidden;
        }

        .login-bg-glows .glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(140px);
          opacity: 0.15;
        }

        .glow-1 {
          width: 400px;
          height: 400px;
          background: var(--color-emerald);
          top: -100px;
          left: -100px;
        }

        .glow-2 {
          width: 500px;
          height: 500px;
          background: var(--color-indigo);
          bottom: -150px;
          right: -100px;
        }

        .login-card {
          width: 100%;
          max-width: 420px;
          padding: var(--spacing-xl) !important;
          z-index: 10;
          border-radius: var(--radius-xl) !important;
        }

        .login-header {
          text-align: center;
          margin-bottom: var(--spacing-xl);
        }

        .login-logo {
          font-size: 3rem;
          margin-bottom: var(--spacing-sm);
          filter: drop-shadow(0 0 10px rgba(16, 185, 129, 0.4));
        }

        .login-header h2 {
          font-size: 1.6rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .login-header p {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-top: var(--spacing-xs);
        }

        .role-selector {
          display: flex;
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-lg);
          background: rgba(10, 14, 23, 0.6);
          padding: var(--spacing-xs);
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
        }

        .role-btn {
          flex: 1;
          background: none;
          border: none;
          color: var(--text-secondary);
          padding: 0.5rem;
          border-radius: var(--radius-sm);
          font-family: var(--font-family);
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .role-btn:hover {
          color: var(--text-primary);
        }

        .role-btn.active {
          color: #ffffff;
        }

        .role-btn.active.admin {
          background: var(--color-indigo);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        .role-btn.active.employee {
          background: var(--color-emerald);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .login-error-alert {
          background: var(--color-rose-glow);
          color: var(--color-rose);
          border: 1px solid rgba(244, 63, 94, 0.2);
          padding: 0.75rem;
          border-radius: var(--radius-md);
          font-size: 0.82rem;
          font-weight: 500;
          margin-bottom: var(--spacing-lg);
          animation: slideUp 0.2s ease-out;
        }

        .login-submit-btn {
          width: 100%;
          padding: 0.8rem;
          font-size: 1rem;
          margin-top: var(--spacing-sm);
        }

        .login-hint {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          margin-top: var(--spacing-lg);
          font-size: 0.75rem;
          color: var(--text-muted);
          line-height: 1.4;
          text-align: center;
          justify-content: center;
        }

        .login-hint svg {
          margin-top: 2px;
          flex-shrink: 0;
        }

        /* Spinner Loader */
        .spinner-loader {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

