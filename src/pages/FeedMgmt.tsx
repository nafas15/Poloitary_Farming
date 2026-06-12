import React, { useState } from 'react';
import { useFarm, FeedType } from '../context/FarmContext';
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

  return (
    <div className="feed-mgmt-page animate-fade-in">
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
          <button className="btn btn-primary" onClick={() => setIsPurchaseModalOpen(true)}>
            ➕ Record Feed Purchase
          </button>
          <button className="btn btn-secondary" onClick={() => setIsConsumptionModalOpen(true)}>
            📝 Log Daily Consumption
          </button>
        </div>
      </div>

      {subTab === 'inventory' && (
        <div className="glass-card">
          <h3>Current Feed Stock Levels</h3>
          <p className="chart-subtitle" style={{ marginBottom: '1.5rem' }}>Real-time inventory minus consumption</p>
          <div className="inventory-grid">
            {feedTypes.map(type => {
              const stock = getFeedStock(type);
              const isLow = stock < 300;
              const isCritical = stock < 100;
              return (
                <div key={type} className={`inventory-card ${isCritical ? 'critical' : isLow ? 'warning' : 'normal'}`}>
                  <div className="inventory-header">
                    <span className="feed-type-name">{type}</span>
                    <span className={`stock-status-badge ${isCritical ? 'badge-danger' : isLow ? 'badge-warning' : 'badge-success'}`}>
                      {isCritical ? '🚨 CRITICAL' : isLow ? '⚠️ LOW' : '✅ OK'}
                    </span>
                  </div>
                  <div className="inventory-qty">
                    <span className="qty-value">{stock.toLocaleString()}</span>
                    <span className="qty-unit">kg</span>
                  </div>
                  {isLow && <div className="inventory-alert">Order immediately for smooth operations</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {subTab === 'purchases' && (
        <div className="glass-card">
          <h3>Feed Purchase History</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Feed Type</th>
                <th>Quantity (kg)</th>
                <th>Vendor</th>
                <th>Unit Cost</th>
                <th>Total Cost</th>
              </tr>
            </thead>
            <tbody>
              {feedPurchases.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center' }}>No feed purchases recorded</td></tr>
              ) : (
                feedPurchases.map(fp => (
                  <tr key={fp.id}>
                    <td>{fp.date}</td>
                    <td><span className="badge badge-cyan">{fp.feedType}</span></td>
                    <td>{fp.quantityKg.toLocaleString()} kg</td>
                    <td>{fp.vendor}</td>
                    <td>${(fp.cost / fp.quantityKg).toFixed(2)}/kg</td>
                    <td><strong>${fp.cost.toFixed(2)}</strong></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {subTab === 'consumption' && (
        <div className="glass-card">
          <h3>Daily Feed Consumption Logs</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Feed Type</th>
                <th>Batch ID</th>
                <th>Quantity (kg)</th>
              </tr>
            </thead>
            <tbody>
              {feedConsumption.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center' }}>No consumption records yet</td></tr>
              ) : (
                feedConsumption.map(fc => (
                  <tr key={fc.id}>
                    <td>{fc.date}</td>
                    <td><span className="badge badge-amber">{fc.feedType}</span></td>
                    <td><span className="batch-badge">{fc.batchId}</span></td>
                    <td>{fc.quantityKg.toLocaleString()} kg</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        title="Record Feed Purchase"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsPurchaseModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handlePurchaseSubmit}>Save Purchase</button>
          </>
        }
      >
        <form onSubmit={handlePurchaseSubmit} className="modal-form-grid">
          <div className="form-group">
            <label className="form-label">Purchase Date</label>
            <input type="date" className="form-control" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Feed Type</label>
            <select className="form-control" value={purchaseType} onChange={e => setPurchaseType(e.target.value as FeedType)}>
              <option value="Starter">Starter</option>
              <option value="Grower">Grower</option>
              <option value="Finisher">Finisher</option>
              <option value="Layer Mash">Layer Mash</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Quantity (kg)</label>
            <input type="number" min="1" className="form-control" value={purchaseQty} onChange={e => setPurchaseQty(Number(e.target.value))} required />
          </div>
          <div className="form-group">
            <label className="form-label">Total Cost ($)</label>
            <input type="number" step="0.01" className="form-control" value={purchaseCost} onChange={e => setPurchaseCost(Number(e.target.value))} required />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Vendor Name</label>
            <input type="text" className="form-control" placeholder="Feed supplier name" value={purchaseVendor} onChange={e => setPurchaseVendor(e.target.value)} required />
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isConsumptionModalOpen}
        onClose={() => setIsConsumptionModalOpen(false)}
        title="Log Daily Feed Consumption"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsConsumptionModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleConsumptionSubmit}>Log Consumption</button>
          </>
        }
      >
        <form onSubmit={handleConsumptionSubmit} className="modal-form-grid">
          <div className="form-group">
            <label className="form-label">Date</label>
            <input type="date" className="form-control" value={consumptionDate} onChange={e => setConsumptionDate(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Feed Type</label>
            <select className="form-control" value={consumptionType} onChange={e => setConsumptionType(e.target.value as FeedType)}>
              <option value="Starter">Starter</option>
              <option value="Grower">Grower</option>
              <option value="Finisher">Finisher</option>
              <option value="Layer Mash">Layer Mash</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Batch ID</label>
            <select className="form-control" value={consumptionBatchId} onChange={e => setConsumptionBatchId(e.target.value)} required>
              <option value="">Select batch...</option>
              {activeBatches.map(b => <option key={b.id} value={b.id}>{b.id} ({b.type})</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Quantity Consumed (kg)</label>
            <input type="number" min="0.1" step="0.1" className="form-control" value={consumptionQty} onChange={e => setConsumptionQty(Number(e.target.value))} required />
          </div>
        </form>
      </Modal>
    </div>
  );
};

