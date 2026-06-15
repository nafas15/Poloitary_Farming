import React, { useState, useEffect } from 'react';
import { useFarm } from '../context/FarmContext';

interface HeaderProps {
  activeTab: string;
}

export const Header: React.FC<HeaderProps> = ({ activeTab }) => {
  const { batches, sales, expenses, currentUser } = useFarm();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate live statistics
  const activeBirds = batches
    .filter(b => b.status === 'Active')
    .reduce((sum, b) => sum + b.currentQuantity, 0);

  const totalSales = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalSales - totalExpenses;

  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard Overview';
      case 'birds': return 'Bird Batch Management';
      case 'feed': return 'Feed Stock & Consumption';
      case 'health': return 'Vaccinations & Medical Logs';
      case 'eggs': return 'Egg Production Reports';
      case 'sales': return 'Sales Ledger & Invoicing';
      case 'expenses': return 'Expense Tracker';
      case 'profit-loss': return 'Profit & Loss Statement';
      case 'reports': return 'Farm Performance Reports';
      default: return 'Farm Management';
    }
  };

  const formatCurrency = (amount: number) => {
    const formatted = Math.abs(amount).toLocaleString(undefined, { maximumFractionDigits: 0 });
    return amount < 0 ? `-Rs ${formatted}` : `Rs ${formatted}`;
  };

  return (
    <header className="header no-print">
      <div className="header-left">
        <h1 className="text-gradient">{getTitle()}</h1>
        <div className="system-time">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>{time.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} | {time.toLocaleTimeString()}</span>
        </div>
      </div>

      <div className="header-right">
        <div className="header-stat">
          <div className="stat-icon birds">🐤</div>
          <div className="stat-info">
            <span className="stat-label">Active Birds</span>
            <span className="stat-value">{activeBirds.toLocaleString()}</span>
          </div>
        </div>

        {currentUser?.role === 'Admin' && (
          <div className="header-stat">
            <div className="stat-icon profit">💰</div>
            <div className="stat-info">
              <span className="stat-label">Net Profit</span>
              <span className={`stat-value ${netProfit >= 0 ? 'positive' : 'negative'}`}>
                {netProfit >= 0 ? '+' : ''}{formatCurrency(netProfit)}
              </span>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: var(--spacing-xl);
          border-bottom: 1px solid var(--border-color);
          margin-bottom: var(--spacing-xl);
        }

        .header-left h1 {
          font-size: 1.75rem;
          margin-bottom: var(--spacing-xs);
        }

        .system-time {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.82rem;
          color: var(--text-secondary);
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: var(--spacing-lg);
        }

        .header-stat {
          background: rgba(22, 31, 48, 0.4);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 0.5rem 1rem;
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
        }

        .stat-icon {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.15rem;
        }

        .stat-icon.birds {
          background: var(--color-amber-glow);
        }

        .stat-icon.profit {
          background: var(--color-emerald-glow);
        }

        .stat-info {
          display: flex;
          flex-direction: column;
        }

        .stat-label {
          font-size: 0.72rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .stat-value {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .stat-value.positive {
          color: var(--color-emerald);
        }

        .stat-value.negative {
          color: var(--color-rose);
        }

        @media (max-width: 768px) {
          .header {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--spacing-md);
            padding-bottom: var(--spacing-md);
            margin-bottom: var(--spacing-md);
          }
          
          .header-right {
            width: 100%;
            justify-content: flex-start;
          }
        }
      `}</style>
    </header>
  );
};

