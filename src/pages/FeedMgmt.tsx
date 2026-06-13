import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import type { FeedType } from '../context/FarmContext';
import { Modal } from '../components/Modal';

export const FeedMgmt: React.FC = () => {
  const { batches, feedPurchases, feedConsumption, addFeedPurchase, addFeedConsumption, getFeedStock } = useFarm();

  const [subTab, setSubTab] = useState<'inventory' | 'purchases' | 'consumption'>('inventory');
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isConsumptionModalOpen, setIsConsumptionModalOpen] = useState(false);

  const [purchaseType, setPurchaseType] = useState<FeedType>('Starter');
  const [purchaseQty, setPurchaseQty] = useState<number>(500);
  const [purchaseCost, setPurchaseCost] = useState<number>(250);
  const [purchaseVendor, setPurchaseVendor] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);

  const [consumptionType, setConsumptionType] = useState<FeedType>('Starter');
  const [consumptionBatchId, setConsumptionBatchId] = useState('');
  const [consumptionQty, setConsumptionQty] = useState<number>(50);
  const [consumptionDate, setConsumptionDate] = useState(new Date().toISOString().split('T')[0]);

  const handlePurchaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!purchaseVendor.trim()) return;
    addFeedPurchase({
      date: purchaseDate,
      feedType: purchaseType,
      quantityKg: Number(purchaseQty),
      cost: Number(purchaseCost),
      vendor: purchaseVendor
    });
    setPurchaseVendor('');
    setPurchaseQty(500);
    setPurchaseCost(250);
    setIsPurchaseModalOpen(false);
  };

  const handleConsumptionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consumptionBatchId) return;
    addFeedConsumption({
      date: consumptionDate,
      feedType: consumptionType,
      batchId: consumptionBatchId,
      quantityKg: Number(consumptionQty)
    });
    setConsumptionBatchId('');
    setConsumptionQty(50);
    setIsConsumptionModalOpen(false);
  };

  const feedTypes: FeedType[] = ['Starter', 'Grower', 'Finisher', 'Layer Mash'];
  const activeBatches = batches.filter(b => b.status === 'Active');

  const feedIcons: Record<FeedType, string> = {
    'Starter': '🐣',
    'Grower': '🌱',
    'Finisher': '🏁',
    'Layer Mash': '🥚'
  };

  const feedColors: Record<FeedType, string> = {
    'Starter': 'var(--color-cyan)',
    'Grower': 'var(--color-emerald)',
    'Finisher': 'var(--color-amber)',
    'Layer Mash': 'var(--color-indigo)'
  };

  const totalPurchasedKg = feedPurchases.reduce((s, p) => s + p.quantityKg, 0);
  const totalConsumedKg = feedConsumption.reduce((s, c) => s + c.quantityKg, 0);
  const totalStockKg = feedTypes.reduce((s, t) => s + getFeedStock(t), 0);
  const totalSpent = feedPurchases.reduce((s, p) => s + p.cost, 0);
  const maxStock = Math.max(...feedTypes.map(t => getFeedStock(t)), 1000);

  return (
    <div className="feed-mgmt-page animate-fade-in">

      {/* ── Summary Stats ── */}
      <div className="feed-stats-row">
        <div className="feed-stat-card">
          <span className="feed-stat-icon">📦</span>
          <div>
            <div className="feed-stat-value">{totalStockKg.toLocaleString()} kg</div>
            <div className="feed-stat-label">Total Stock</div>
          </div>
        </div>
        <div className="feed-stat-card">
          <span className="feed-stat-icon">🛒</span>
          <div>
            <div className="feed-stat-value">{totalPurchasedKg.toLocaleString()} kg</div>
            <div className="feed-stat-label">Total Purchased</div>
          </div>
        </div>
        <div className="feed-stat-card">
          <span className="feed-stat-icon">🍽️</span>
          <div>
            <div className="feed-stat-value">{totalConsumedKg.toLocaleString()} kg</div>
            <div className="feed-stat-label">Total Consumed</div>
          </div>
        </div>
        <div className="feed-stat-card">
          <span className="feed-stat-icon">💰</span>
          <div>
            <div className="feed-stat-value">
              ${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="feed-stat-label">Total Spent</div>
          </div>
        </div>
      </div>

      {/* ── Tab Bar + Action Buttons ── */}
      <div className="page-header-actions">
        <div className="filter-tabs">
          <button className={`tab-btn ${subTab === 'inventory' ? 'active' : ''}`} onClick={() => setSubTab('inventory')}>
            📊 Inventory Levels
          </button>
          <button className={`tab-btn ${subTab === 'purchases' ? 'active' : ''}`} onClick={() => setSubTab('purchases')}>
            🛒 Feed Purchases
          </button>
          <button className={`tab-btn ${subTab === 'consumption' ? 'active' : ''}`} onClick={() => setSubTab('consumption')}>
            🍽️ Daily Consumption
          </button>
        </div>

        <div className="action-buttons">
          <button className="btn btn-secondary" onClick={() => setIsConsumptionModalOpen(true)}>
            📝 Log Consumption
          </button>
          <button className="btn btn-primary" onClick={() => setIsPurchaseModalOpen(true)}>
            ➕ Record Purchase
          </button>
        </div>
      </div>

      {/* ── Inventory Tab ── */}
      {subTab === 'inventory' && (
        <div className="glass-card">
          <div className="card-header-row">
            <div>
              <h3>Current Feed Stock Levels</h3>
              <p className="chart-subtitle">Real-time inventory after deducting consumption</p>
            </div>
          </div>
          <div className="inventory-grid">
            {feedTypes.map(type => {
              const stock = getFeedStock(type);
              const purchased = feedPurchases.filter(p => p.feedType === type).reduce((s, p) => s + p.quantityKg, 0);
              const consumed = feedConsumption.filter(c => c.feedType === type).reduce((s, c) => s + c.quantityKg, 0);
              const isLow = stock < 300;
              const isCritical = stock < 100;
              const progressPct = Math.min(100, (stock / Math.max(maxStock, 1)) * 100);
              const color = feedColors[type];
              return (
                <div key={type} className={`inventory-card ${isCritical ? 'critical' : isLow ? 'warning' : 'normal'}`}>
                  <div className="inventory-header">
                    <span className="feed-icon">{feedIcons[type]}</span>
                    <div className="feed-type-info">
                      <span className="feed-type-name">{type}</span>
                      <span className={`stock-status-badge ${isCritical ? 'badge-danger' : isLow ? 'badge-warning' : 'badge-success'}`}>
                        {isCritical ? '🚨 Critical' : isLow ? '⚠️ Low Stock' : '✅ Sufficient'}
                      </span>
                    </div>
                  </div>

                  <div className="inventory-qty">
                    <span className="qty-value">{stock.toLocaleString()}</span>
                    <span className="qty-unit">kg remaining</span>
                  </div>

                  <div className="inventory-progress-bar">
                    <div className="inventory-progress-fill" style={{ width: `${progressPct}%`, background: color }} />
                  </div>

                  <div className="inventory-breakdown">
                    <span>📥 {purchased.toLocaleString()} kg purchased</span>
                    <span>📤 {consumed.toLocaleString()} kg used</span>
                  </div>

                  {isLow && (
                    <div className="inventory-alert">
                      {isCritical ? '🚨 Stock critically low! Order immediately.' : '⚠️ Running low — consider restocking soon.'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Purchases Tab ── */}
      {subTab === 'purchases' && (
        <div className="glass-card">
          <div className="card-header-row">
            <div>
              <h3>Feed Purchase History</h3>
              <p className="chart-subtitle">{feedPurchases.length} records · ${totalSpent.toFixed(2)} total spent</p>
            </div>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Feed Type</th>
                  <th>Quantity</th>
                  <th>Vendor</th>
                  <th>Unit Cost</th>
                  <th>Total Cost</th>
                </tr>
              </thead>
              <tbody>
                {feedPurchases.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="empty-state">
                        <div className="empty-icon">🛒</div>
                        <p>No feed purchases recorded yet.</p>
                        <button className="btn btn-primary" style={{ marginTop: '0.75rem' }} onClick={() => setIsPurchaseModalOpen(true)}>
                          ➕ Record First Purchase
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  [...feedPurchases].sort((a, b) => b.date.localeCompare(a.date)).map(fp => (
                    <tr key={fp.id}>
                      <td>{fp.date}</td>
                      <td>
                        <span style={{ marginRight: '0.4rem' }}>{feedIcons[fp.feedType]}</span>
                        <span className="badge badge-cyan">{fp.feedType}</span>
                      </td>
                      <td><strong>{fp.quantityKg.toLocaleString()} kg</strong></td>
                      <td>{fp.vendor}</td>
                      <td>${(fp.cost / fp.quantityKg).toFixed(2)}/kg</td>
                      <td><strong className="color-emerald">${fp.cost.toFixed(2)}</strong></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Consumption Tab ── */}
      {subTab === 'consumption' && (
        <div className="glass-card">
          <div className="card-header-row">
            <div>
              <h3>Daily Feed Consumption Logs</h3>
              <p className="chart-subtitle">{feedConsumption.length} records · {totalConsumedKg.toLocaleString()} kg consumed</p>
            </div>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Feed Type</th>
                  <th>Batch ID</th>
                  <th>Quantity Consumed</th>
                </tr>
              </thead>
              <tbody>
                {feedConsumption.length === 0 ? (
                  <tr>
                    <td colSpan={4}>
                      <div className="empty-state">
                        <div className="empty-icon">🍽️</div>
                        <p>No consumption records logged yet.</p>
                        <button className="btn btn-secondary" style={{ marginTop: '0.75rem' }} onClick={() => setIsConsumptionModalOpen(true)}>
                          📝 Log First Record
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  [...feedConsumption].sort((a, b) => b.date.localeCompare(a.date)).map(fc => (
                    <tr key={fc.id}>
                      <td>{fc.date}</td>
                      <td>
                        <span style={{ marginRight: '0.4rem' }}>{feedIcons[fc.feedType]}</span>
                        <span className="badge badge-amber">{fc.feedType}</span>
                      </td>
                      <td><span className="batch-badge">{fc.batchId}</span></td>
                      <td><strong>{fc.quantityKg.toLocaleString()} kg</strong></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Purchase Modal ── */}
      <Modal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        title="🛒 Record Feed Purchase"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsPurchaseModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handlePurchaseSubmit}>Save Purchase</button>
          </>
        }
      >
        <form onSubmit={handlePurchaseSubmit} className="modal-form-grid">
          <div className="fm-form-row">
            <div className="form-group">
              <label className="form-label">Purchase Date</label>
              <input type="date" className="form-control" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Feed Type</label>
              <select className="form-control" value={purchaseType} onChange={e => setPurchaseType(e.target.value as FeedType)}>
                <option value="Starter">🐣 Starter</option>
                <option value="Grower">🌱 Grower</option>
                <option value="Finisher">🏁 Finisher</option>
                <option value="Layer Mash">🥚 Layer Mash</option>
              </select>
            </div>
          </div>
          <div className="fm-form-row">
            <div className="form-group">
              <label className="form-label">Quantity (kg)</label>
              <input type="number" min="1" className="form-control" value={purchaseQty} onChange={e => setPurchaseQty(Number(e.target.value))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Total Cost (Rs)</label>
              <input type="number" step="0.01" className="form-control" value={purchaseCost} onChange={e => setPurchaseCost(Number(e.target.value))} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Vendor / Supplier Name</label>
            <input type="text" className="form-control" placeholder="e.g. AgriFeeds Ltd." value={purchaseVendor} onChange={e => setPurchaseVendor(e.target.value)} required />
          </div>
          {purchaseQty > 0 && purchaseCost > 0 && (
            <div className="form-preview-pill">
              💡 Cost per kg: <strong>${(purchaseCost / purchaseQty).toFixed(2)}</strong>
            </div>
          )}
        </form>
      </Modal>

      {/* ── Consumption Modal ── */}
      <Modal
        isOpen={isConsumptionModalOpen}
        onClose={() => setIsConsumptionModalOpen(false)}
        title="🍽️ Log Daily Feed Consumption"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsConsumptionModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleConsumptionSubmit}>Log Consumption</button>
          </>
        }
      >
        <form onSubmit={handleConsumptionSubmit} className="modal-form-grid">
          <div className="fm-form-row">
            <div className="form-group">
              <label className="form-label">Date</label>
              <input type="date" className="form-control" value={consumptionDate} onChange={e => setConsumptionDate(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Feed Type</label>
              <select className="form-control" value={consumptionType} onChange={e => setConsumptionType(e.target.value as FeedType)}>
                <option value="Starter">🐣 Starter</option>
                <option value="Grower">🌱 Grower</option>
                <option value="Finisher">🏁 Finisher</option>
                <option value="Layer Mash">🥚 Layer Mash</option>
              </select>
            </div>
          </div>
          <div className="fm-form-row">
            <div className="form-group">
              <label className="form-label">Batch</label>
              <select className="form-control" value={consumptionBatchId} onChange={e => setConsumptionBatchId(e.target.value)} required>
                <option value="">Select active batch...</option>
                {activeBatches.map(b => (
                  <option key={b.id} value={b.id}>{b.id} — {b.type} ({b.currentQuantity} birds)</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Quantity Consumed (kg)</label>
              <input type="number" min="0.1" step="0.1" className="form-control" value={consumptionQty} onChange={e => setConsumptionQty(Number(e.target.value))} required />
            </div>
          </div>
          {consumptionType && (
            <div className="form-preview-pill">
              📦 Current {consumptionType} stock: <strong>{getFeedStock(consumptionType).toLocaleString()} kg</strong>
            </div>
          )}
        </form>
      </Modal>

      <style>{`
        .feed-stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-lg);
        }
        @media (max-width: 900px) { .feed-stats-row { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 500px)  { .feed-stats-row { grid-template-columns: 1fr; } }

        .feed-stat-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: var(--spacing-md) var(--spacing-lg);
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          backdrop-filter: var(--glass-blur);
          transition: border-color var(--transition-fast), transform var(--transition-fast);
        }
        .feed-stat-card:hover { border-color: var(--border-color-hover); transform: translateY(-2px); }
        .feed-stat-icon { font-size: 1.75rem; }
        .feed-stat-value { font-size: 1.25rem; font-weight: 700; color: var(--text-primary); }
        .feed-stat-label { font-size: 0.75rem; color: var(--text-muted); margin-top: 0.1rem; text-transform: uppercase; letter-spacing: 0.04em; }

        .page-header-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--spacing-lg);
          gap: var(--spacing-md);
          flex-wrap: wrap;
        }
        .filter-tabs {
          display: flex;
          gap: var(--spacing-sm);
          background: rgba(22, 31, 48, 0.4);
          padding: 0.25rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          flex-wrap: wrap;
        }
        .tab-btn {
          background: none; border: none; color: var(--text-secondary);
          padding: 0.5rem 1rem; border-radius: var(--radius-sm); cursor: pointer;
          font-family: var(--font-family); font-weight: 600; font-size: 0.85rem;
          transition: all var(--transition-fast); white-space: nowrap;
        }
        .tab-btn.active { background: rgba(255,255,255,0.08); color: var(--text-primary); }
        .action-buttons { display: flex; gap: var(--spacing-sm); flex-wrap: wrap; }

        .card-header-row { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: var(--spacing-lg); }
        .card-header-row h3 { margin: 0 0 0.25rem; }

        .inventory-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: var(--spacing-md);
        }
        .inventory-card {
          background: rgba(255,255,255,0.02);
          border-radius: var(--radius-md);
          padding: var(--spacing-md) var(--spacing-lg);
          border: 1px solid var(--border-color);
          transition: border-color var(--transition-fast), transform var(--transition-fast);
          display: flex; flex-direction: column; gap: 0.6rem;
        }
        .inventory-card:hover { transform: translateY(-2px); border-color: var(--border-color-hover); }
        .inventory-card.critical { border-color: rgba(244,63,94,0.35); background: rgba(244,63,94,0.04); }
        .inventory-card.warning  { border-color: rgba(245,158,11,0.35); background: rgba(245,158,11,0.04); }

        .inventory-header { display: flex; align-items: center; gap: var(--spacing-sm); }
        .feed-icon { font-size: 1.5rem; }
        .feed-type-info { display: flex; flex-direction: column; gap: 0.2rem; }
        .feed-type-name { font-weight: 700; font-size: 1rem; color: var(--text-primary); }

        .inventory-qty { display: flex; align-items: baseline; gap: 0.4rem; }
        .qty-value { font-size: 2rem; font-weight: 800; color: var(--text-primary); line-height: 1; }
        .qty-unit  { font-size: 0.8rem; color: var(--text-muted); }

        .inventory-progress-bar { height: 6px; background: rgba(255,255,255,0.07); border-radius: 999px; overflow: hidden; }
        .inventory-progress-fill { height: 100%; border-radius: 999px; transition: width 0.5s ease; min-width: 4px; }

        .inventory-breakdown { display: flex; gap: var(--spacing-md); font-size: 0.75rem; color: var(--text-muted); flex-wrap: wrap; }

        .inventory-alert {
          font-size: 0.78rem; padding: 0.4rem 0.75rem; border-radius: var(--radius-sm);
          background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.2); color: var(--color-amber);
        }
        .inventory-card.critical .inventory-alert {
          background: rgba(244,63,94,0.1); border-color: rgba(244,63,94,0.2); color: var(--color-rose);
        }

        .stock-status-badge { font-size: 0.7rem; font-weight: 600; padding: 0.15rem 0.5rem; border-radius: 999px; display: inline-block; }
        .badge-success { background: rgba(16,185,129,0.15); color: var(--color-emerald); }
        .badge-warning { background: rgba(245,158,11,0.15); color: var(--color-amber); }
        .badge-danger  { background: rgba(244,63,94,0.15);  color: var(--color-rose); }

        .empty-state { text-align: center; padding: var(--spacing-xl) 0; color: var(--text-muted); }
        .empty-icon  { font-size: 2.5rem; margin-bottom: 0.5rem; }

        .modal-form-grid { display: flex; flex-direction: column; gap: var(--spacing-md); }
        .fm-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md); }
        @media (max-width: 480px) { .fm-form-row { grid-template-columns: 1fr; } }

        .form-preview-pill {
          background: rgba(99,102,241,0.08); border: 1px solid rgba(99,102,241,0.2);
          border-radius: var(--radius-sm); padding: 0.5rem 0.85rem; font-size: 0.82rem; color: var(--text-secondary);
        }
        .form-preview-pill strong { color: var(--color-indigo); }

        .color-emerald { color: var(--color-emerald); }
        .batch-badge {
          background: rgba(255,255,255,0.05); border: 1px solid var(--border-color);
          padding: 0.2rem 0.5rem; border-radius: var(--radius-sm); font-weight: 700; font-family: monospace; font-size: 0.85rem;
        }
      `}</style>
    </div>
  );
};

