import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';

export const EmployeeMgmt: React.FC = () => {
  const { usersList, approveUser, updateUserRole, deleteUser, currentUser } = useFarm();
  const [searchTerm, setSearchTerm] = useState('');

  // Statistics
  const totalUsers = usersList.length;
  const pendingUsers = usersList.filter(u => !u.approved);
  const approvedUsers = usersList.filter(u => u.approved);
  const activeAdmins = approvedUsers.filter(u => u.role === 'Admin').length;
  const activeEmployees = approvedUsers.filter(u => u.role === 'Employee').length;

  const filteredApproved = approvedUsers.filter(u =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="employee-page animate-fade-in">
      {/* 1. Statistics Cards */}
      <div className="grid-cols-4 stat-grid">
        <div className="glass-card stat-card border-indigo">
          <div className="stat-icon">👥</div>
          <div className="stat-data">
            <span className="stat-label">Total Registered</span>
            <h3 className="stat-value">{totalUsers}</h3>
            <span className="stat-subtext">Accounts in database</span>
          </div>
        </div>

        <div className="glass-card stat-card border-emerald">
          <div className="stat-icon">👑</div>
          <div className="stat-data">
            <span className="stat-label">Active Admins</span>
            <h3 className="stat-value">{activeAdmins}</h3>
            <span className="stat-subtext">Full permissions</span>
          </div>
        </div>

        <div className="glass-card stat-card border-cyan">
          <div className="stat-icon">🧑‍🌾</div>
          <div className="stat-data">
            <span className="stat-label">Active Employees</span>
            <h3 className="stat-value">{activeEmployees}</h3>
            <span className="stat-subtext">Limited permissions</span>
          </div>
        </div>

        <div className="glass-card stat-card border-amber">
          <div className="stat-icon">⌛</div>
          <div className="stat-data">
            <span className="stat-label">Pending Approval</span>
            <h3 className="stat-value color-amber">{pendingUsers.length}</h3>
            <span className="stat-subtext">Require admin action</span>
          </div>
        </div>
      </div>

      {/* 2. Pending Approvals Section */}
      <div className="glass-card table-section">
        <div className="section-header">
          <div>
            <h4>Pending Registration Requests</h4>
            <p className="subtitle">New users waiting for access authorization</p>
          </div>
          {pendingUsers.length > 0 && (
            <span className="badge badge-amber">{pendingUsers.length} Pending</span>
          )}
        </div>

        {pendingUsers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✅</div>
            <h5>All Caught Up!</h5>
            <p>There are no pending account approval requests at the moment.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Requested Role</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingUsers.map(user => (
                  <tr key={user.username}>
                    <td>
                      <div className="user-cell">
                        <div className="avatar-small">
                          {user.username.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="user-name">{user.username}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`role-badge ${user.role.toLowerCase()}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span className="status-dot pending"></span> Pending Approval
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="actions-cell">
                        <button
                          className="btn-action approve"
                          onClick={() => approveUser(user.username)}
                          title="Approve Account"
                        >
                          ✔ Approve
                        </button>
                        <button
                          className="btn-action reject"
                          onClick={() => deleteUser(user.username)}
                          title="Reject Account"
                        >
                          ✖ Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3. Approved Users Section */}
      <div className="glass-card table-section">
        <div className="section-header search-row">
          <div>
            <h4>Authorized Users</h4>
            <p className="subtitle">Manage system access roles and credentials</p>
          </div>
          <div className="search-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
              <circle cx="11" cy="11" r="8" />
              <line x1="21" x2="16.65" y1="21" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {filteredApproved.length === 0 ? (
          <div className="empty-state">
            <p>No authorized users match your search criteria.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApproved.map(user => {
                  const isSelf = currentUser?.username.toLowerCase() === user.username.toLowerCase();
                  return (
                    <tr key={user.username}>
                      <td>
                        <div className="user-cell">
                          <div className="avatar-small">
                            {user.username.substring(0, 2).toUpperCase()}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span className="user-name">{user.username} {isSelf && <span className="self-tag">(You)</span>}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`role-badge ${user.role.toLowerCase()}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span className="status-dot approved"></span> Active
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="actions-cell">
                          <button
                            className="btn-action toggle-role"
                            onClick={() => updateUserRole(user.username, user.role === 'Admin' ? 'Employee' : 'Admin')}
                            disabled={isSelf}
                            title="Toggle Access Role"
                          >
                            🔄 Switch to {user.role === 'Admin' ? 'Employee' : 'Admin'}
                          </button>
                          <button
                            className="btn-action delete"
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete user "${user.username}"?`)) {
                                deleteUser(user.username);
                              }
                            }}
                            disabled={isSelf}
                            title="Delete User"
                          >
                            🗑 Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .employee-page {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg);
        }

        .stat-grid {
          margin-bottom: var(--spacing-sm);
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: var(--spacing-lg);
          padding: var(--spacing-lg);
          border-left: 4px solid var(--border-color);
        }

        .stat-card.border-indigo { border-left-color: var(--color-indigo); }
        .stat-card.border-emerald { border-left-color: var(--color-emerald); }
        .stat-card.border-cyan { border-left-color: var(--color-cyan); }
        .stat-card.border-amber { border-left-color: var(--color-amber); }

        .stat-icon {
          font-size: 2rem;
          width: 50px;
          height: 50px;
          border-radius: var(--radius-md);
          background: rgba(255, 255, 255, 0.03);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-data {
          display: flex;
          flex-direction: column;
        }

        .stat-label {
          font-size: 0.75rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 500;
        }

        .stat-value {
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0.1rem 0;
        }

        .stat-subtext {
          font-size: 0.72rem;
          color: var(--text-muted);
        }

        .color-amber {
          color: var(--color-amber) !important;
        }

        .table-section {
          padding: var(--spacing-lg) !important;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-lg);
          border-bottom: 1px solid var(--border-color);
          padding-bottom: var(--spacing-md);
        }

        .section-header h4 {
          font-size: 1.1rem;
          font-weight: 650;
          color: var(--text-primary);
        }

        .section-header .subtitle {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-top: 2px;
        }

        .search-row {
          flex-wrap: wrap;
          gap: var(--spacing-md);
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          background: rgba(0, 0, 0, 0.15);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 0.4rem 0.8rem;
          width: 100%;
          max-width: 280px;
        }

        .search-box input {
          background: none;
          border: none;
          color: var(--text-primary);
          font-family: var(--font-family);
          font-size: 0.85rem;
          width: 100%;
          outline: none;
        }

        .empty-state {
          padding: var(--spacing-xl) 0;
          text-align: center;
          color: var(--text-muted);
          font-size: 0.9rem;
        }

        .empty-icon {
          font-size: 2.2rem;
          margin-bottom: var(--spacing-sm);
        }

        .empty-state h5 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: var(--spacing-xs);
        }

        .user-cell {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
        }

        .avatar-small {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--color-indigo) 0%, #4338ca 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.72rem;
          color: #ffffff;
        }

        .user-name {
          font-weight: 550;
          color: var(--text-primary);
        }

        .self-tag {
          font-size: 0.7rem;
          color: var(--color-emerald);
          font-style: italic;
          margin-left: 4px;
        }

        .role-badge {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.15rem 0.5rem;
          border-radius: var(--radius-sm);
        }

        .role-badge.admin {
          background: var(--color-indigo-glow);
          color: var(--color-indigo);
          border: 1px solid rgba(99, 102, 241, 0.2);
        }

        .role-badge.employee {
          background: var(--color-emerald-glow);
          color: var(--color-emerald);
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .status-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-right: 6px;
        }

        .status-dot.approved { background: var(--color-emerald); }
        .status-dot.pending { background: var(--color-amber); }

        .actions-cell {
          display: flex;
          gap: var(--spacing-sm);
          justify-content: flex-end;
        }

        .btn-action {
          border: none;
          font-family: var(--font-family);
          font-size: 0.8rem;
          font-weight: 600;
          padding: 0.35rem 0.7rem;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all var(--transition-fast);
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .btn-action.approve {
          background: var(--color-emerald-glow);
          color: var(--color-emerald);
          border: 1px solid rgba(16, 185, 129, 0.15);
        }

        .btn-action.approve:hover {
          background: var(--color-emerald);
          color: #ffffff;
        }

        .btn-action.reject, .btn-action.delete {
          background: var(--color-rose-glow);
          color: var(--color-rose);
          border: 1px solid rgba(244, 63, 94, 0.15);
        }

        .btn-action.reject:hover, .btn-action.delete:hover:not(:disabled) {
          background: var(--color-rose);
          color: #ffffff;
        }

        .btn-action.toggle-role {
          background: var(--glass-button-bg);
          color: var(--text-secondary);
          border: 1px solid var(--border-color);
        }

        .btn-action.toggle-role:hover:not(:disabled) {
          background: var(--glass-button-hover);
          color: var(--text-primary);
          border-color: var(--border-color-hover);
        }

        .btn-action:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};
