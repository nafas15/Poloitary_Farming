import React from 'react';
import { useFarm } from '../context/FarmContext';

export const ProfitLoss: React.FC = () => {
  const { sales, expenses } = useFarm();

  // Financial aggregates
  const totalIncome = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const birdIncome = sales.filter(s => s.type === 'Bird').reduce((sum, s) => sum + s.totalAmount, 0);
  const eggIncome = sales.filter(s => s.type === 'Egg').reduce((sum, s) => sum + s.totalAmount, 0);

  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
  
  const netProfit = totalIncome - totalExpense;
  const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : '0.0';

  // Group by Month (YYYY-MM)
  const monthlyData: { [key: string]: { month: string; income: number; expenses: number; net: number } } = {};

  sales.forEach(s => {
    const month = s.date.substring(0, 7); // "2026-05"
    if (!monthlyData[month]) {
      monthlyData[month] = { month, income: 0, expenses: 0, net: 0 };
    }
    monthlyData[month].income += s.totalAmount;
  });

  expenses.forEach(e => {
    const month = e.date.substring(0, 7);
    if (!monthlyData[month]) {
      monthlyData[month] = { month, income: 0, expenses: 0, net: 0 };
    }
    monthlyData[month].expenses += e.amount;
  });

  // Convert to array and sort by month chronological
  const monthlyReportList = Object.values(monthlyData).map(m => {
    const net = m.income - m.expenses;
    return { ...m, net };
  }).sort((a, b) => a.month.localeCompare(b.month));

  const formatCurrency = (amount: number) => {
    const formatted = Math.abs(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return amount < 0 ? `-Rs ${formatted}` : `Rs ${formatted}`;
  };

  const getMonthName = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="profit-loss-page animate-fade-in">
      <div className="page-header-actions">
        <h4 className="section-title">Income & Expenditure Statement</h4>
        <span className="badge badge-emerald">Admin Auditor View</span>
      </div>

      {/* P&L Cards */}
      <div className="grid-cols-4 financials-overview">
        <div className="glass-card stat-card-profit">
          <span className="card-lbl">Gross Income</span>
          <h3 className="card-val color-emerald">Rs {totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
          <span className="card-helper-text">
            Birds: Rs {birdIncome.toLocaleString()} | Eggs: Rs {eggIncome.toLocaleString()}
          </span>
        </div>

        <div className="glass-card stat-card-profit">
          <span className="card-lbl">Gross Expenses</span>
          <h3 className="card-val color-rose">Rs {totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
          <span className="card-helper-text">Feed, wages, and maintenance bills</span>
        </div>

        <div className="glass-card stat-card-profit">
          <span className="card-lbl">Net Profit / Loss</span>
          <h3 className={`card-val ${netProfit >= 0 ? 'color-emerald' : 'color-rose'}`}>
            {netProfit >= 0 ? '+' : ''}Rs {netProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h3>
          <span className="card-helper-text">Net earnings after all cost deductions</span>
        </div>

        <div className="glass-card stat-card-profit">
          <span className="card-lbl">Net Profit Margin</span>
          <h3 className="card-val">{profitMargin}%</h3>
          <span className={`badge ${Number(profitMargin) > 10 ? 'badge-emerald' : 'badge-amber'} margin-status-badge`}>
            {Number(profitMargin) > 10 ? 'Healthy Margin' : 'Thin Margin'}
          </span>
        </div>
      </div>

      {/* Monthly Financial Progress Table */}
      <div className="glass-card" style={{ marginTop: '2rem' }}>
        <h4>Monthly Financial Report</h4>
        <p className="chart-subtitle" style={{ marginBottom: '1.25rem' }}>Fiscal breakdown grouped by month</p>
        
        {monthlyReportList.length === 0 ? (
          <div className="empty-state">No fiscal transactions logged.</div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Revenue (Cash In)</th>
                  <th>Expenses (Cash Out)</th>
                  <th>Net Earnings</th>
                  <th>Growth / Status</th>
                </tr>
              </thead>
              <tbody>
                {monthlyReportList.map(item => (
                  <tr key={item.month}>
                    <td><b>{getMonthName(item.month)}</b></td>
                    <td className="color-emerald"><b>{formatCurrency(item.income)}</b></td>
                    <td className="color-rose">{formatCurrency(item.expenses)}</td>
                    <td>
                      <span className={`net-earning-pill ${item.net >= 0 ? 'pos' : 'neg'}`}>
                        {formatCurrency(item.net)}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${item.net >= 0 ? 'badge-emerald' : 'badge-rose'}`}>
                        {item.net >= 0 ? '🟢 Profit' : '🔴 Deficit'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Profit Breakdown by Category */}
      <div className="grid-cols-2" style={{ marginTop: '2rem' }}>
        <div className="glass-card">
          <h4>Revenue Streams</h4>
          <p className="chart-subtitle" style={{ marginBottom: '1.25rem' }}>Sources of income</p>
          <div className="progress-list">
            <div className="progress-item-financial">
              <div className="item-labels">
                <span>Bird Batch Sales</span>
                <b>{formatCurrency(birdIncome)} ({totalIncome > 0 ? ((birdIncome/totalIncome)*100).toFixed(0) : 0}%)</b>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill fill-amber" style={{ width: `${totalIncome > 0 ? (birdIncome/totalIncome)*100 : 0}%` }}></div>
              </div>
            </div>
            <div className="progress-item-financial" style={{ marginTop: '1rem' }}>
              <div className="item-labels">
                <span>Egg Production Sales</span>
                <b>{formatCurrency(eggIncome)} ({totalIncome > 0 ? ((eggIncome/totalIncome)*100).toFixed(0) : 0}%)</b>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill fill-emerald" style={{ width: `${totalIncome > 0 ? (eggIncome/totalIncome)*100 : 0}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card">
          <h4>Expense Allocation</h4>
          <p className="chart-subtitle" style={{ marginBottom: '1.25rem' }}>Distribution of costs</p>
          <div className="progress-list">
            {(['Feed', 'Medicine', 'Electricity', 'Labor', 'Water', 'Other'] as const).map(cat => {
              const amount = expenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0);
              const percent = totalExpense > 0 ? ((amount / totalExpense) * 100).toFixed(0) : '0';
              return (
                <div className="progress-item-financial" key={cat} style={{ marginBottom: '0.75rem' }}>
                  <div className="item-labels">
                    <span>{cat} Expenses</span>
                    <b>{formatCurrency(amount)} ({percent}%)</b>
                  </div>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill fill-rose" style={{ width: `${percent}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        .profit-loss-page {
          display: flex;
          flex-direction: column;
        }

        .page-header-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--spacing-lg);
        }

        .financials-overview {
          margin-top: var(--spacing-sm);
        }

        .stat-card-profit {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          position: relative;
        }

        .card-lbl {
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-secondary);
        }

        .card-val {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .card-val.color-emerald { color: var(--color-emerald); }
        .card-val.color-rose { color: var(--color-rose); }

        .card-helper-text {
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .margin-status-badge {
          position: absolute;
          right: var(--spacing-md);
          bottom: var(--spacing-md);
          font-size: 0.62rem;
        }

        .net-earning-pill {
          padding: 0.25rem 0.5rem;
          border-radius: var(--radius-sm);
          font-weight: 700;
        }

        .net-earning-pill.pos {
          background: rgba(16, 185, 129, 0.08);
          color: var(--color-emerald);
          border: 1px solid rgba(16, 185, 129, 0.15);
        }

        .net-earning-pill.neg {
          background: rgba(244, 63, 94, 0.08);
          color: var(--color-rose);
          border: 1px solid rgba(244, 63, 94, 0.15);
        }

        .progress-item-financial {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .item-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.82rem;
          color: var(--text-secondary);
        }

        .progress-bar-fill.fill-amber {
          background: var(--color-amber);
          box-shadow: 0 0 8px rgba(245, 158, 11, 0.4);
        }

        .progress-bar-fill.fill-emerald {
          background: var(--color-emerald);
          box-shadow: 0 0 8px rgba(16, 185, 129, 0.4);
        }

        .progress-bar-fill.fill-rose {
          background: var(--color-rose);
          box-shadow: 0 0 8px rgba(244, 63, 94, 0.4);
        }
      `}</style>
    </div>
  );
};

