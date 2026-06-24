import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import type { UserRole } from '../context/FarmContext';

export const Login: React.FC = () => {
  const { login, usersList, registerUser } = useFarm();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  
  // Form fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('Admin');
  
  // Notification states
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    // Simulate short network delay for premium experience
    setTimeout(() => {
      // Match case-insensitively for username and check password exactly
      const matchedUser = usersList.find(
        u => u.username.toLowerCase() === username.trim().toLowerCase()
      );

      if (matchedUser && matchedUser.password === password) {
        if (!matchedUser.approved) {
          setError('Your account is pending admin approval. Please check back later.');
        } else {
          const success = login(matchedUser.username, matchedUser.role);
          if (!success) {
            setError('Failed to create session. Please try again.');
          }
        }
      } else {
        setError('Invalid username or password.');
      }
      setIsLoading(false);
    }, 800);
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const trimmedUser = username.trim();
    if (!trimmedUser || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const result = registerUser({
        username: trimmedUser,
        password,
        role,
        approved: false // will default to false, requiring approval
      });

      if (result.success) {
        setSuccessMsg(result.message);
        setMode('login');
        setPassword('');
        setConfirmPassword('');
      } else {
        setError(result.message);
      }
      setIsLoading(false);
    }, 800);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const trimmedUser = username.trim();
    if (!trimmedUser) {
      setError('Please enter your username');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Look for user matching this username
      const matchedUser = usersList.find(
        u => u.username.toLowerCase() === trimmedUser.toLowerCase()
      );

      if (matchedUser) {
        setSuccessMsg(`Account verified! Password reset instructions simulated. (Dev mode: Password is "${matchedUser.password}")`);
      } else {
        setError(`No account found with username "${trimmedUser}".`);
      }
      setIsLoading(false);
    }, 800);
  };

  const switchMode = (newMode: 'login' | 'signup' | 'forgot') => {
    setError('');
    setSuccessMsg('');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setMode(newMode);
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

        {error && <div className="login-error-alert">{error}</div>}
        {successMsg && <div className="login-success-alert">{successMsg}</div>}

        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="login-form">
            <h3 className="form-section-title">Sign In</h3>

            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter your username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                disabled={isLoading}
                maxLength={64}
                required
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">Password</label>
                <button
                  type="button"
                  className="link-btn"
                  style={{ fontSize: '0.75rem', color: 'var(--color-indigo)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  onClick={() => switchMode('forgot')}
                  disabled={isLoading}
                >
                  Forgot Password?
                </button>
              </div>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={isLoading}
                maxLength={64}
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

            <div className="auth-footer-links">
              <span>Don't have an account? </span>
              <button
                type="button"
                className="text-link"
                onClick={() => switchMode('signup')}
                disabled={isLoading}
              >
                Sign Up
              </button>
            </div>
          </form>
        )}

        {mode === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="login-form">
            <h3 className="form-section-title">Create Account</h3>

            <div className="role-selector">
              <button
                type="button"
                className={`role-btn ${role === 'Admin' ? 'active admin' : ''}`}
                onClick={() => setRole('Admin')}
                disabled={isLoading}
              >
                👑 Register Admin
              </button>
              <button
                type="button"
                className={`role-btn ${role === 'Employee' ? 'active employee' : ''}`}
                onClick={() => setRole('Employee')}
                disabled={isLoading}
              >
                🧑‍🌾 Register Employee
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                disabled={isLoading}
                maxLength={64}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Min 4 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={isLoading}
                maxLength={64}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                maxLength={64}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary login-submit-btn" disabled={isLoading}>
              {isLoading ? (
                <span className="spinner-loader"></span>
              ) : (
                'Register Account'
              )}
            </button>

            <div className="auth-footer-links">
              <span>Already have an account? </span>
              <button
                type="button"
                className="text-link"
                onClick={() => switchMode('login')}
                disabled={isLoading}
              >
                Sign In
              </button>
            </div>
          </form>
        )}

        {mode === 'forgot' && (
          <form onSubmit={handleForgotSubmit} className="login-form">
            <h3 className="form-section-title">Reset Password</h3>
            <p className="form-section-desc">Enter your username and we will verify the account details.</p>

            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter registered username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                disabled={isLoading}
                maxLength={64}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary login-submit-btn" disabled={isLoading}>
              {isLoading ? (
                <span className="spinner-loader"></span>
              ) : (
                'Verify Account'
              )}
            </button>

            <div className="auth-footer-links">
              <button
                type="button"
                className="text-link"
                onClick={() => switchMode('login')}
                disabled={isLoading}
              >
                ← Back to Sign In
              </button>
            </div>
          </form>
        )}
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
          background: var(--bg-card);
          box-shadow: var(--card-shadow);
          border: 1px solid var(--border-color);
          transition: background-color var(--transition-normal), border-color var(--transition-normal);
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

        .form-section-title {
          font-size: 1.2rem;
          font-weight: 650;
          color: var(--text-primary);
          margin-bottom: var(--spacing-md);
          text-align: center;
        }

        .form-section-desc {
          font-size: 0.82rem;
          color: var(--text-secondary);
          margin-bottom: var(--spacing-md);
          text-align: center;
          line-height: 1.4;
        }

        .role-selector {
          display: flex;
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-lg);
          background: var(--glass-button-bg);
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

        .login-success-alert {
          background: var(--color-emerald-glow);
          color: var(--color-emerald);
          border: 1px solid rgba(16, 185, 129, 0.2);
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

        .auth-footer-links {
          display: flex;
          justify-content: center;
          gap: 0.25rem;
          font-size: 0.82rem;
          color: var(--text-secondary);
          margin-top: var(--spacing-lg);
        }

        .text-link {
          background: none;
          border: none;
          color: var(--color-emerald);
          font-weight: 600;
          cursor: pointer;
          padding: 0;
          font-family: var(--font-family);
          font-size: 0.82rem;
          transition: color var(--transition-fast);
        }

        .text-link:hover {
          color: var(--color-cyan);
          text-decoration: underline;
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

        @media (max-width: 480px) {
          .login-card {
            padding: var(--spacing-lg) !important;
            margin: var(--spacing-md);
            max-width: calc(100% - 2rem);
          }
          .role-selector {
            flex-direction: column;
            gap: var(--spacing-xs);
          }
        }
      `}</style>
    </div>
  );
};
