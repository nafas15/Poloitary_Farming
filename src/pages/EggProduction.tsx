import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import { Modal } from '../components/Modal';

export const EggProduction: React.FC = () => {
  const { eggCollections, addEggCollection } = useFarm();
  
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);

  // Form Fields - Egg Collection
  const [collectDate, setCollectDate] = useState(new Date().toISOString().split('T')[0]);
  const [collectQty, setCollectQty] = useState<number>(800);
  const [collectDamaged, setCollectDamaged] = useState<number>(10);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    addEggCollection({
      date: collectDate,
      collectedQty: Number(collectQty),
      damagedQty: Number(collectDamaged),
      netQty: Number(collectQty) - Number(collectDamaged)
    });

    // Reset and Close
    setCollectQty(800);
    setCollectDamaged(10);
    setIsCollectModalOpen(false);
  };

  // Performance calculations
  const totalCollected = eggCollections.reduce((sum, c) => sum + c.collectedQty, 0);
  const totalDamaged = eggCollections.reduce((sum, c) => sum + c.damagedQty, 0);

  const damageRate = totalCollected > 0 ? ((totalDamaged / totalCollected) * 100).toFixed(2) : '0.00';
  const averageYield = eggCollections.length > 0 ? Math.round(totalCollected / eggCollections.length) : 0;

  return (
    <div className="egg-production-page animate-fade-in">
      <div className="page-header-actions">
        <h4 className="section-title">Egg Collection Dashboard</h4>
        <button className="btn btn-primary" onClick={() => setIsCollectModalOpen(true)}>
          🥚 Log Daily Egg Collection
        </button>
      </div>

      {/* Yield Analytics Cards */}
      <div className="grid-cols-4 yield-analytics-container">
        <div className="glass-card yield-stat-card">
          <span className="yield-stat-label">Total Eggs Collected</span>
          <h3 className="yield-stat-value text-gradient-amber">{totalCollected.toLocaleString()}</h3>
          <span className="yield-stat-subtext">All collections to date</span>
        </div>

        <div className="glass-card yield-stat-card">
          <span className="yield-stat-label">Average Daily Yield</span>
          <h3 className="yield-stat-value">{averageYield.toLocaleString()}</h3>
          <span className="yield-stat-subtext">Eggs per collection day</span>
        </div>

        <div className="glass-card yield-stat-card">
          <span className="yield-stat-label">Damaged Eggs</span>
          <h3 className="yield-stat-value text-gradient-rose">{totalDamaged.toLocaleString()}</h3>
          <span className="yield-stat-subtext">Broken or thin shell rate</span>
        </div>

        <div className="glass-card yield-stat-card">
          <span className="yield-stat-label">Overall Damage Rate</span>
          <h3 className="yield-stat-value">{damageRate}%</h3>
          <span className={`badge ${Number(damageRate) < 1.5 ? 'badge-emerald' : 'badge-rose'} yield-badge`}>
            {Number(damageRate) < 1.5 ? 'Excellent' : 'Check Feed Calcium'}
          </span>
        </div>
      </div>

      {/* Collection Logs */}
      <div className="glass-card" style={{ marginTop: '2rem' }}>
        <h4>Daily Collection Log</h4>
        <p className="chart-subtitle" style={{ marginBottom: '1rem' }}>Log of morning and afternoon egg trays</p>
        
        {eggCollections.length === 0 ? (
          <div className="empty-state">No collections logged. Start layer records!</div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Collection Date</th>
                  <th>Collected Count</th>
                  <th>Damaged Count</th>
                  <th>Usable Eggs (Net)</th>
                  <th>Tray Equivalent (30/Tray)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {eggCollections.map(c => {
                  const trays = (c.netQty / 30).toFixed(1);
                  return (
                    <tr key={c.date}>
                      <td>{c.date}</td>
                      <td><b>{c.collectedQty.toLocaleString()}</b></td>
                      <td><span className="color-rose">{c.damagedQty}</span></td>
                      <td><span className="color-emerald"><b>{c.netQty.toLocaleString()}</b></span></td>
                      <td>{trays} trays</td>
                      <td>
                        <span className={`badge ${c.damagedQty / c.collectedQty < 0.02 ? 'badge-emerald' : 'badge-amber'}`}>
                          {c.damagedQty / c.collectedQty < 0.02 ? 'Optimal' : 'Needs attention'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Log Collection */}
      <Modal
        isOpen={isCollectModalOpen}
        onClose={() => setIsCollectModalOpen(false)}
        title="Log Daily Egg Collection"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsCollectModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit}>Save Log</button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="modal-form-grid">
          <div className="form-group">
            <label className="form-label">Collection Date</label>
            <input
              type="date"
              className="form-control"
              value={collectDate}
              onChange={e => setCollectDate(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Total Eggs Collected</label>
              <input
                type="number"
                min="1"
                className="form-control"
                value={collectQty}
                onChange={e => setCollectQty(Number(e.target.value))}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Damaged Eggs Count</label>
              <input
                type="number"
                min="0"
                className="form-control"
                value={collectDamaged}
                onChange={e => setCollectDamaged(Number(e.target.value))}
                required
              />
            </div>
          </div>
        </form>
      </Modal>

      <style>{`
        .egg-production-page {
          display: flex;
          flex-direction: column;
        }

        .page-header-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--spacing-lg);
        }

        .yield-analytics-container {
          margin-top: var(--spacing-sm);
        }

        .yield-stat-card {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          position: relative;
        }

        .yield-stat-label {
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-secondary);
        }

        .yield-stat-value {
          font-size: 1.6rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .yield-stat-subtext {
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .yield-badge {
          position: absolute;
          right: var(--spacing-md);
          bottom: var(--spacing-md);
          font-size: 0.62rem;
        }
      `}</style>
    </div>
  );
};
