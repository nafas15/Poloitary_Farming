import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import { Modal } from '../components/Modal';

export const EggProduction: React.FC = () => {
  const { eggCollections, addEggCollection, deleteEggCollection, addEggSale, updateEggCollection } = useFarm();
  
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);

  // Form Fields - Egg Collection
  const [collectDate, setCollectDate] = useState(new Date().toISOString().split('T')[0]);
  const [collectQty, setCollectQty] = useState<number>(800);
  const [collectDamaged, setCollectDamaged] = useState<number>(10);

  // Edit Collection States
  const [isEditCollectModalOpen, setIsEditCollectModalOpen] = useState(false);
  const [editingCollectionOriginalDate, setEditingCollectionOriginalDate] = useState('');
  const [editCollectDate, setEditCollectDate] = useState('');
  const [editCollectQty, setEditCollectQty] = useState<number>(800);
  const [editCollectDamaged, setEditCollectDamaged] = useState<number>(10);

  const handleOpenEditCollect = (c: any) => {
    setEditingCollectionOriginalDate(c.date);
    setEditCollectDate(c.date);
    setEditCollectQty(c.collectedQty);
    setEditCollectDamaged(c.damagedQty);
    setIsEditCollectModalOpen(true);
  };

  const handleEditCollectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCollectionOriginalDate) return;
    await updateEggCollection(editingCollectionOriginalDate, {
      date: editCollectDate,
      collectedQty: Number(editCollectQty),
      damagedQty: Number(editCollectDamaged),
      netQty: Number(editCollectQty) - Number(editCollectDamaged)
    });
    setIsEditCollectModalOpen(false);
  };

  // Form Fields - Sell Eggs
  const [eggQty, setEggQty] = useState<number>(300);
  const [eggPricePerEgg, setEggPricePerEgg] = useState<number>(0.20);
  const [eggCustomer, setEggCustomer] = useState('');
  const [eggContact, setEggContact] = useState('');
  const [eggDetails, setEggDetails] = useState('');

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

  const handleEggSaleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eggCustomer.trim() || eggQty <= 0) return;
    addEggSale({
      date: new Date().toISOString().split('T')[0],
      customerName: eggCustomer,
      customerContact: eggContact,
      quantity: eggQty,
      unitPrice: eggPricePerEgg,
      totalAmount: eggQty * eggPricePerEgg,
      details: eggDetails || `Egg Sale: ${eggQty} eggs`
    });
    setEggCustomer('');
    setEggContact('');
    setEggDetails('');
    setEggQty(300);
    setIsSellModalOpen(false);
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
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="button" className="btn btn-secondary" onClick={() => setIsSellModalOpen(true)}>
            🥚 Sell Eggs
          </button>
          <button type="button" className="btn btn-primary" onClick={() => setIsCollectModalOpen(true)}>
            🥚 Log Daily Egg Collection
          </button>
        </div>
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
                  <th>Boxes Needed (260/Box)</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {eggCollections.map(c => {
                  const boxesFull = Math.floor(c.netQty / 260);
                  const remainder = c.netQty % 260;
                  const boxesNeeded = remainder > 0 ? boxesFull + 1 : boxesFull;
                  return (
                    <tr key={c.date}>
                      <td>{c.date}</td>
                      <td><b>{c.collectedQty.toLocaleString()}</b></td>
                      <td><span className="color-rose">{c.damagedQty}</span></td>
                      <td><span className="color-emerald"><b>{c.netQty.toLocaleString()}</b></span></td>
                      <td>
                        <span style={{ fontWeight: 700 }}>{boxesNeeded} boxes</span>
                        {remainder > 0 && (
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                            ({boxesFull} full + {remainder} eggs)
                          </span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${c.damagedQty / c.collectedQty < 0.02 ? 'badge-emerald' : 'badge-amber'}`}>
                          {c.damagedQty / c.collectedQty < 0.02 ? 'Optimal' : 'Needs attention'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => handleOpenEditCollect(c)}
                            style={{
                              padding: '0.25rem 0.5rem',
                              fontSize: '0.75rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="btn btn-danger"
                            onClick={() => {
                              if (confirm(`Delete egg collection record for ${c.date}?`)) {
                                deleteEggCollection(c.date);
                              }
                            }}
                            style={{
                              padding: '0.25rem 0.5rem',
                              fontSize: '0.75rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem'
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

      {/* Modal: Edit Egg Collection */}
      <Modal
        isOpen={isEditCollectModalOpen}
        onClose={() => setIsEditCollectModalOpen(false)}
        title="✏️ Edit Egg Collection"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsEditCollectModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleEditCollectSubmit}>Save Changes</button>
          </>
        }
      >
        <form onSubmit={handleEditCollectSubmit} className="modal-form-grid">
          <div className="form-group">
            <label className="form-label">Collection Date</label>
            <input
              type="date"
              className="form-control"
              value={editCollectDate}
              onChange={e => setEditCollectDate(e.target.value)}
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
                value={editCollectQty}
                onChange={e => setEditCollectQty(Number(e.target.value))}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Damaged Eggs Count</label>
              <input
                type="number"
                min="0"
                className="form-control"
                value={editCollectDamaged}
                onChange={e => setEditCollectDamaged(Number(e.target.value))}
                required
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Modal: Sell Eggs */}
      <Modal
        isOpen={isSellModalOpen}
        onClose={() => setIsSellModalOpen(false)}
        title="Register Egg Sale"
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setIsSellModalOpen(false)}>Cancel</button>
            <button type="button" className="btn btn-primary" onClick={handleEggSaleSubmit}>Complete Sale</button>
          </>
        }
      >
        <form onSubmit={handleEggSaleSubmit} className="modal-form-grid">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Quantity of eggs</label>
              <input
                type="number"
                min="1"
                className="form-control"
                value={eggQty}
                onChange={e => setEggQty(Number(e.target.value))}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Price per egg (Rs)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="form-control"
                value={eggPricePerEgg}
                onChange={e => setEggPricePerEgg(Number(e.target.value))}
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
                placeholder="e.g. Sunny Bakehouses Co."
                value={eggCustomer}
                onChange={e => setEggCustomer(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Customer Contact</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. +1 (555) 012-9900"
                value={eggContact}
                onChange={e => setEggContact(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Remarks / Description</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Grade A large brown eggs"
              value={eggDetails}
              onChange={e => setEggDetails(e.target.value)}
            />
          </div>

          {eggQty > 0 && eggPricePerEgg > 0 && (
            <div className="sm-order-summary" style={{
              background: 'rgba(16,185,129,0.05)',
              border: '1px solid rgba(16,185,129,0.15)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--spacing-md) var(--spacing-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem',
              marginTop: '0.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                <span>Eggs Total</span>
                <strong>{eggQty.toLocaleString()} eggs</strong>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '1rem',
                fontWeight: '700',
                color: 'var(--color-emerald)',
                borderTop: '1px solid rgba(16,185,129,0.2)',
                paddingTop: '0.4rem',
                marginTop: '0.2rem'
              }}>
                <span>Invoice Total</span>
                <strong>Rs {(eggQty * eggPricePerEgg).toFixed(2)}</strong>
              </div>
            </div>
          )}
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

