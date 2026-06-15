import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import type { BirdType } from '../context/FarmContext';
import { Modal } from '../components/Modal';

export const BirdMgmt: React.FC = () => {
  const { batches, addBatch, logMortality, deleteBatch, sellBatch, sales } = useFarm();
  
  // Tab Filter
  const [filter, setFilter] = useState<'Active' | 'Sold'>('Active');
  
  // Modals Open State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [isMortalityModalOpen, setIsMortalityModalOpen] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');

  // Form Fields - Add Batch
  const [newBatchId, setNewBatchId] = useState('');
  const [newType, setNewType] = useState<BirdType>('Broiler');
  const [newArrivalDate, setNewArrivalDate] = useState(new Date().toISOString().split('T')[0]);
  const [newQty, setNewQty] = useState<number>(1000);
  const [newPrice, setNewPrice] = useState<number>(1.20);

  // Form Fields - Sell Batch
  const [sellBatchId, setSellBatchId] = useState('');
  const [sellQty, setSellQty] = useState<number>(100);
  const [sellUnitPrice, setSellUnitPrice] = useState<number>(0);
  const [sellCustomer, setSellCustomer] = useState('');
  const [sellContact, setSellContact] = useState('');

  // Form Fields - Log Mortality
  const [mortalityQty, setMortalityQty] = useState<number>(1);
  const [mortalityReason, setMortalityReason] = useState('');
  const [mortalityDate, setMortalityDate] = useState(new Date().toISOString().split('T')[0]);

  // Utility to calculate bird age in weeks
  const calculateAgeWeeks = (arrivalDateStr: string): number => {
    const arrival = new Date(arrivalDateStr);
    const today = new Date();
    const diffMs = today.getTime() - arrival.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return Math.max(0, Math.floor(diffDays / 7));
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBatchId.trim()) return;

    addBatch({
      id: newBatchId.toUpperCase(),
      type: newType,
      arrivalDate: newArrivalDate,
      initialQuantity: Number(newQty),
      purchasePrice: Number(newPrice)
    });

    // Reset and Close
    setNewBatchId('');
    setNewQty(1000);
    setNewPrice(1.20);
    setIsAddModalOpen(false);
  };

  const handleMortalitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchId) {
      alert("Please select a batch first.");
      return;
    }

    logMortality(selectedBatchId, Number(mortalityQty), mortalityReason, mortalityDate);

    // Reset and Close
    setMortalityQty(1);
    setMortalityReason('');
    setIsMortalityModalOpen(false);
  };

  const handleSellSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellBatchId || !sellCustomer.trim() || sellQty <= 0) return;
    const batch = batches.find(b => b.id === sellBatchId);
    if (!batch || batch.currentQuantity < sellQty) {
      alert(`Insufficient birds. Only ${batch?.currentQuantity ?? 0} remaining in Batch ${sellBatchId}.`);
      return;
    }
    sellBatch(sellBatchId, sellQty, sellUnitPrice, sellCustomer, sellContact);
    // Reset and Close
    setSellBatchId('');
    setSellQty(100);
    setSellUnitPrice(0);
    setSellCustomer('');
    setSellContact('');
    setIsSellModalOpen(false);
  };

  const activeBatches = batches.filter(b => b.status === 'Active' && b.currentQuantity > 0);
  const selectedSellBatch = activeBatches.find(b => b.id === sellBatchId);

  const filteredBatches = batches.filter(b => b.status === filter);

  // Filter and sort sold/inactive batches for the Mortality tab
  const soldBatches = batches.filter(b => b.status === 'Sold');
  soldBatches.sort((a, b) => new Date(b.arrivalDate).getTime() - new Date(a.arrivalDate).getTime());

  // Compute mortality stats for inactive/archived batches
  const totalDeadInactive = soldBatches.reduce((sum, b) => sum + b.mortalityLogs.reduce((s, m) => s + m.quantity, 0), 0);
  const totalInitialInactive = soldBatches.reduce((sum, b) => sum + b.initialQuantity, 0);
  const avgMortalityRate = totalInitialInactive > 0 ? ((totalDeadInactive / totalInitialInactive) * 100).toFixed(1) : '0.0';

  return (
    <div className="bird-mgmt-page animate-fade-in">
        <div className="page-header-actions">
        <div className="filter-tabs">
          <button
            className={`tab-btn ${filter === 'Active' ? 'active' : ''}`}
            onClick={() => setFilter('Active')}
          >
            🐔 Active Batches
          </button>
          <button
            className={`tab-btn ${filter === 'Sold' ? 'active' : ''}`}
            onClick={() => setFilter('Sold')}
          >
            📦 Mortality
          </button>
        </div>

        {filter === 'Active' ? (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setSellBatchId('');
                setIsSellModalOpen(true);
              }}
            >
              🐔 Sell Bird Batch
            </button>
            <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
              ➕ Add New Bird Batch
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-danger" onClick={() => {
              setSelectedBatchId('');
              setIsMortalityModalOpen(true);
            }}>
              ☠️ Log Mortality
            </button>
          </div>
        )}
      </div>

      {/* ── Batches Table — ACTIVE TAB ── */}
      {filter === 'Active' && (
        <div className="glass-card table-section">
          {filteredBatches.length === 0 ? (
            <div className="empty-state">
              <p>No active batches found. Click "Add New Bird Batch" to register one.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Batch ID</th>
                    <th>Type</th>
                    <th>Arrival Date</th>
                    <th>Age (Weeks)</th>
                    <th>Initial Birds</th>
                    <th>Sold Birds</th>
                    <th>Mortality</th>
                    <th>Mortality %</th>
                    <th>Current Qty</th>
                    <th>Cost per Bird</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBatches.map(batch => {
                    const totalDead = batch.mortalityLogs.reduce((sum, m) => sum + m.quantity, 0);
                    const totalSold = sales.filter(s => s.type === 'Bird' && s.batchId === batch.id).reduce((sum, s) => sum + s.quantity, 0);
                    const mortalityPercent = ((totalDead / batch.initialQuantity) * 100).toFixed(1);
                    return (
                      <tr key={batch.id}>
                        <td><span className="batch-badge">{batch.id}</span></td>
                        <td>
                          <span className={`badge ${batch.type === 'Broiler' ? 'badge-amber' : 'badge-emerald'}`}>
                            {batch.type}
                          </span>
                        </td>
                        <td>{batch.arrivalDate}</td>
                        <td><b>{calculateAgeWeeks(batch.arrivalDate)} weeks</b></td>
                        <td>{batch.initialQuantity.toLocaleString()}</td>
                        <td><strong>{totalSold > 0 ? `${totalSold.toLocaleString()} birds` : '0'}</strong></td>
                        <td>{totalDead > 0 ? `💀 ${totalDead}` : '0'}</td>
                        <td>
                          <span className={Number(mortalityPercent) > 5 ? 'mortality-high' : ''}>
                            {mortalityPercent}%
                          </span>
                        </td>
                        <td><span className="current-qty-active">🐔 {batch.currentQuantity.toLocaleString()}</span></td>
                        <td>Rs {batch.purchasePrice.toFixed(2)}</td>
                        <td>
                          <div className="batch-action-group">
                            <button
                              className="btn btn-secondary btn-sm-custom"
                              onClick={() => {
                                setSelectedBatchId(batch.id);
                                setIsMortalityModalOpen(true);
                              }}
                            >
                              ☠️ Log Death
                            </button>
                            <button
                              className="btn btn-secondary btn-sm-custom"
                              style={{ color: 'var(--color-emerald)', borderColor: 'rgba(16, 185, 129, 0.3)' }}
                              onClick={() => {
                                setSellBatchId(batch.id);
                                setIsSellModalOpen(true);
                              }}
                            >
                              💰 Sell
                            </button>
                            <button
                              className="btn btn-danger btn-sm-custom"
                              onClick={() => {
                                if (confirm(`Delete Batch ${batch.id}? This will permanently remove the batch, its mortality logs, and the associated purchase expense. This cannot be undone.`)) {
                                  deleteBatch(batch.id);
                                }
                              }}
                            >
                              🗑️ Delete
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
      )}

      {/* ── Mortality Tab ── */}
      {filter === 'Sold' && (
        <div className="glass-card table-section">
          {soldBatches.length === 0 ? (
            <div className="empty-state">
              <p>No archived/sold batches found.</p>
            </div>
          ) : (
            <>
              {/* Mortality Summary Bar */}
              <div className="sold-summary-bar">
                <div className="sold-stat">
                  <span className="sold-stat-label">📦 Archived Batches</span>
                  <span className="sold-stat-value">{soldBatches.length}</span>
                </div>
                <div className="sold-stat">
                  <span className="sold-stat-label">💀 Total Mortality</span>
                  <span className="sold-stat-value color-rose">{totalDeadInactive.toLocaleString()} birds</span>
                </div>
                <div className="sold-stat">
                  <span className="sold-stat-label">📈 Avg. Mortality Rate</span>
                  <span className="sold-stat-value color-amber">{avgMortalityRate}%</span>
                </div>
              </div>

              <div className="table-wrapper" style={{ marginTop: '1rem' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Batch ID</th>
                      <th>Type</th>
                      <th>Arrival Date</th>
                      <th>Initial Birds</th>
                      <th>Mortality (💀 count)</th>
                      <th>Mortality %</th>
                      <th>Sold / Disposed</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {soldBatches.map(batch => {
                      const totalDead = batch.mortalityLogs.reduce((sum, m) => sum + m.quantity, 0);
                      const mortalityPercent = ((totalDead / batch.initialQuantity) * 100).toFixed(1);
                      const totalSold = batch.initialQuantity - totalDead;

                      return (
                        <tr key={batch.id}>
                          <td><span className="batch-badge">{batch.id}</span></td>
                          <td>
                            <span className={`badge ${batch.type === 'Broiler' ? 'badge-amber' : 'badge-emerald'}`}>
                              {batch.type}
                            </span>
                          </td>
                          <td>{batch.arrivalDate}</td>
                          <td>{batch.initialQuantity.toLocaleString()}</td>
                          <td>
                            {totalDead > 0 ? (
                              <span className="color-rose">💀 {totalDead}</span>
                            ) : '0'}
                          </td>
                          <td>
                            <span className={Number(mortalityPercent) > 5 ? 'mortality-high' : ''}>
                              {mortalityPercent}%
                            </span>
                          </td>
                          <td><strong>{totalSold.toLocaleString()} birds</strong></td>
                          <td>
                            <span className="badge badge-secondary" style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)' }}>
                              Archived
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* Mortality Audit Logs Card */}
      <div className="glass-card mortality-audit-logs" style={{ marginTop: '2rem' }}>
        <h4>Mortality Audit Records</h4>
        <p className="chart-subtitle" style={{ marginBottom: '1rem' }}>Historical death logs for track analysis</p>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Batch</th>
                <th>Log Date</th>
                <th>Quantity</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {batches
                .flatMap(b => b.mortalityLogs.map(m => ({ batchId: b.id, ...m })))
                .sort((a, b) => b.date.localeCompare(a.date))
                .slice(0, 10)
                .map((log) => (
                  <tr key={log.id}>
                    <td><span className="batch-badge">{log.batchId}</span></td>
                    <td>{log.date}</td>
                    <td><span className="color-rose">💀 {log.quantity} birds</span></td>
                    <td>{log.reason}</td>
                  </tr>
                ))}
              {batches.flatMap(b => b.mortalityLogs).length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    No mortality audits logged. Healthy farm!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 1. Modal Add Batch */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Bird Batch"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAddSubmit}>Save Batch</button>
          </>
        }
      >
        <form onSubmit={handleAddSubmit} className="modal-form-grid">
          <div className="form-group">
            <label className="form-label">Batch ID / Reference</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. B-103"
              value={newBatchId}
              onChange={e => setNewBatchId(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Bird Type</label>
            <select
              className="form-control"
              value={newType}
              onChange={e => setNewType(e.target.value as BirdType)}
            >
              <option value="Broiler">Broiler (Meat)</option>
              <option value="Layer">Layer (Eggs)</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Arrival Date</label>
              <input
                type="date"
                className="form-control"
                value={newArrivalDate}
                onChange={e => setNewArrivalDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Quantity Arrived</label>
              <input
                type="number"
                min="1"
                className="form-control"
                value={newQty}
                onChange={e => setNewQty(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Purchase Price per Bird (Rs)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              className="form-control"
              value={newPrice}
              onChange={e => setNewPrice(Number(e.target.value))}
              required
            />
          </div>
        </form>
      </Modal>

      {/* 2. Modal - Sell Bird Batch */}
      <Modal
        isOpen={isSellModalOpen}
        onClose={() => setIsSellModalOpen(false)}
        title="🐔 Sell Bird Batch"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsSellModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSellSubmit}>Complete Sale</button>
          </>
        }
      >
        <form onSubmit={handleSellSubmit} className="modal-form-grid">
          <div className="form-group">
            <label className="form-label">Batch ID / Reference</label>
            {activeBatches.length === 0 ? (
              <div style={{ color: 'var(--color-rose)', fontSize: '0.88rem', padding: '0.5rem 0' }}>
                ⚠️ No active batches with available stock to sell.
              </div>
            ) : (
              <select
                className="form-control"
                value={sellBatchId}
                onChange={e => setSellBatchId(e.target.value)}
                required
              >
                <option value="">Select a batch...</option>
                {activeBatches.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.id} — {b.type} ({b.currentQuantity.toLocaleString()} birds available)
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Quantity to Sell</label>
              <input
                type="number"
                min="1"
                max={selectedSellBatch?.currentQuantity ?? undefined}
                className="form-control"
                value={sellQty}
                onChange={e => setSellQty(Number(e.target.value))}
                required
              />
              {selectedSellBatch && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Max: {selectedSellBatch.currentQuantity.toLocaleString()} birds
                </span>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Price per Bird (Rs)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="form-control"
                value={sellUnitPrice}
                onChange={e => setSellUnitPrice(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Customer Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Fresh Meats Co."
                value={sellCustomer}
                onChange={e => setSellCustomer(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Customer Contact</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. +91 98765 43210"
                value={sellContact}
                onChange={e => setSellContact(e.target.value)}
                required
              />
            </div>
          </div>

          {sellQty > 0 && sellUnitPrice > 0 && (
            <div className="sell-summary-preview">
              <div className="sell-summary-row"><span>Quantity</span><strong>{sellQty.toLocaleString()} birds</strong></div>
              <div className="sell-summary-row"><span>Unit Price</span><strong>Rs {sellUnitPrice.toFixed(2)}/bird</strong></div>
              <div className="sell-summary-row sell-summary-total">
                <span>Invoice Total</span>
                <strong>Rs {(sellQty * sellUnitPrice).toFixed(2)}</strong>
              </div>
            </div>
          )}
        </form>
      </Modal>

      {/* 3. Modal Log Mortality */}
      <Modal
        isOpen={isMortalityModalOpen}
        onClose={() => {
          setIsMortalityModalOpen(false);
          setSelectedBatchId('');
        }}
        title={`Log Bird Mortality${selectedBatchId ? `: Batch ${selectedBatchId}` : ''}`}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => {
              setIsMortalityModalOpen(false);
              setSelectedBatchId('');
            }}>Cancel</button>
            <button className="btn btn-danger" onClick={handleMortalitySubmit}>Log Death Record</button>
          </>
        }
      >
        <form onSubmit={handleMortalitySubmit}>
          {!selectedBatchId && (
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label">Batch ID / Reference</label>
              {activeBatches.length === 0 ? (
                <div style={{ color: 'var(--color-rose)', fontSize: '0.88rem', padding: '0.5rem 0' }}>
                  ⚠️ No active batches to log mortality.
                </div>
              ) : (
                <select
                  className="form-control"
                  value={selectedBatchId}
                  onChange={e => setSelectedBatchId(e.target.value)}
                  required
                >
                  <option value="">Select a batch...</option>
                  {activeBatches.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.id} — {b.type} ({b.currentQuantity.toLocaleString()} birds remaining)
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date of Event</label>
              <input
                type="date"
                className="form-control"
                value={mortalityDate}
                onChange={e => setMortalityDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Quantity Lost</label>
              <input
                type="number"
                min="1"
                className="form-control"
                value={mortalityQty}
                onChange={e => setMortalityQty(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Reason / Diagnosis</label>
            <textarea
              className="form-control"
              placeholder="e.g. Heat stress, respiratory disease, smothered, etc."
              rows={3}
              value={mortalityReason}
              onChange={e => setMortalityReason(e.target.value)}
              required
              style={{ resize: 'vertical' }}
            ></textarea>
          </div>
        </form>
      </Modal>

      <style>{`
        .bird-mgmt-page {
          display: flex;
          flex-direction: column;
        }

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
        }

        .tab-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          padding: 0.5rem 1rem;
          border-radius: var(--radius-sm);
          cursor: pointer;
          font-family: var(--font-family);
          font-weight: 600;
          font-size: 0.85rem;
          transition: all var(--transition-fast);
        }

        .tab-btn.active {
          background: rgba(255, 255, 255, 0.08);
          color: var(--text-primary);
        }

        .batch-badge {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-color);
          padding: 0.25rem 0.5rem;
          border-radius: var(--radius-sm);
          font-weight: 700;
          font-family: monospace;
        }

        .current-qty-active {
          color: var(--color-emerald);
          font-weight: 600;
        }

        .current-qty-sold {
          color: var(--text-muted);
          font-style: italic;
        }

        .mortality-high {
          color: var(--color-rose);
          font-weight: 600;
        }

        .btn-sm-custom {
          padding: 0.35rem 0.75rem;
          font-size: 0.75rem;
        }

        .batch-action-group {
          display: flex;
          gap: 0.4rem;
          align-items: center;
          flex-wrap: wrap;
        }

        .empty-state {
          text-align: center;
          padding: var(--spacing-xl) 0;
          color: var(--text-muted);
        }

        .modal-form-grid {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .sell-summary-preview {
          background: rgba(16, 185, 129, 0.05);
          border: 1px solid rgba(16, 185, 129, 0.15);
          border-radius: var(--radius-md);
          padding: var(--spacing-md) var(--spacing-lg);
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .sell-summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.88rem;
          color: var(--text-secondary);
        }

        .sell-summary-total {
          font-size: 1rem;
          font-weight: 700;
          color: var(--color-emerald);
          border-top: 1px solid rgba(16, 185, 129, 0.2);
          padding-top: 0.4rem;
          margin-top: 0.2rem;
        }

        /* Sold/Archived tab styles */
        .sold-summary-bar {
          display: flex;
          gap: var(--spacing-lg);
          flex-wrap: wrap;
          padding-bottom: var(--spacing-lg);
          border-bottom: 1px solid var(--border-color);
          margin-bottom: 0.25rem;
        }

        .sold-stat {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          min-width: 140px;
        }

        .sold-stat-label {
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          font-weight: 500;
        }

        .sold-stat-value {
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .invoice-id-badge {
          font-family: monospace;
          background: rgba(99, 102, 241, 0.08);
          border: 1px solid rgba(99, 102, 241, 0.2);
          color: var(--color-indigo);
          padding: 0.2rem 0.5rem;
          border-radius: var(--radius-sm);
          font-size: 0.8rem;
          font-weight: 700;
          white-space: nowrap;
        }

        .customer-cell {
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
        }

        .customer-contact-text {
          font-size: 0.72rem;
          color: var(--text-muted);
        }

        .color-emerald { color: var(--color-emerald); }
        .color-rose    { color: var(--color-rose); }

        /* rowSpan border fix */
        td[rowspan] {
          vertical-align: top;
          padding-top: 1rem;
        }
      `}</style>
    </div>
  );
};

