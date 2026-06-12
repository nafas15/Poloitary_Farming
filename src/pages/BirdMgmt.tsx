import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import type { BirdType } from '../context/FarmContext';
import { Modal } from '../components/Modal';

export const BirdMgmt: React.FC = () => {
  const { batches, addBatch, logMortality } = useFarm();
  
  // Tab Filter
  const [filter, setFilter] = useState<'Active' | 'Sold'>('Active');
  
  // Modals Open State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMortalityModalOpen, setIsMortalityModalOpen] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');

  // Form Fields - Add Batch
  const [newBatchId, setNewBatchId] = useState('');
  const [newType, setNewType] = useState<BirdType>('Broiler');
  const [newArrivalDate, setNewArrivalDate] = useState(new Date().toISOString().split('T')[0]);
  const [newQty, setNewQty] = useState<number>(1000);
  const [newPrice, setNewPrice] = useState<number>(1.20);

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
    if (!selectedBatchId) return;

    logMortality(selectedBatchId, Number(mortalityQty), mortalityReason, mortalityDate);

    // Reset and Close
    setMortalityQty(1);
    setMortalityReason('');
    setIsMortalityModalOpen(false);
  };

  const filteredBatches = batches.filter(b => b.status === filter);

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
            📦 Sold / Archived
          </button>
        </div>

        <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
          ➕ Add New Bird Batch
        </button>
      </div>

      {/* Batches Table */}
      <div className="glass-card table-section">
        {filteredBatches.length === 0 ? (
          <div className="empty-state">
            <p>No {filter.toLowerCase()} batches found. Click "Add New Bird Batch" to register.</p>
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
                  <th>Current Qty</th>
                  <th>Mortality</th>
                  <th>Mortality %</th>
                  <th>Cost per Bird</th>
                  {filter === 'Active' && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredBatches.map(batch => {
                  const totalDead = batch.initialQuantity - batch.currentQuantity;
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
                      <td>
                        {batch.status === 'Active' ? (
                          <span className="current-qty-active">🐔 {batch.currentQuantity.toLocaleString()}</span>
                        ) : (
                          <span className="current-qty-sold">Sold Out</span>
                        )}
                      </td>
                      <td>{totalDead > 0 ? `💀 ${totalDead}` : '0'}</td>
                      <td>
                        <span className={Number(mortalityPercent) > 5 ? 'mortality-high' : ''}>
                          {mortalityPercent}%
                        </span>
                      </td>
                      <td>${batch.purchasePrice.toFixed(2)}</td>
                      {filter === 'Active' && (
                        <td>
                          <button
                            className="btn btn-secondary btn-sm-custom"
                            onClick={() => {
                              setSelectedBatchId(batch.id);
                              setIsMortalityModalOpen(true);
                            }}
                          >
                            ☠️ Log Death
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
            <label className="form-label">Purchase Price per Bird ($)</label>
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

      {/* 2. Modal Log Mortality */}
      <Modal
        isOpen={isMortalityModalOpen}
        onClose={() => setIsMortalityModalOpen(false)}
        title={`Log Bird Mortality: Batch ${selectedBatchId}`}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsMortalityModalOpen(false)}>Cancel</button>
            <button className="btn btn-danger" onClick={handleMortalitySubmit}>Log Death Record</button>
          </>
        }
      >
        <form onSubmit={handleMortalitySubmit}>
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
      `}</style>
    </div>
  );
};
