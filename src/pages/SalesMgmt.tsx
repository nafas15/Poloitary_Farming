import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import type { Sale } from '../context/FarmContext';
import { Modal } from '../components/Modal';

export const SalesMgmt: React.FC = () => {
  const { batches, sales, sellBatch, addEggSale } = useFarm();

  const [subTab, setSubTab] = useState<'logs' | 'sell-birds' | 'sell-eggs'>('logs');
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState<Sale | null>(null);

  const [birdBatchId, setBirdBatchId] = useState('');
  const [birdQty, setBirdQty] = useState<number>(100);
  const [birdUnitPrice, setBirdUnitPrice] = useState<number>(4.50);
  const [birdCustomer, setBirdCustomer] = useState('');
  const [birdContact, setBirdContact] = useState('');
  const [birdDetails, setBirdDetails] = useState('');

  const [eggCrates, setEggCrates] = useState<number>(10);
  const [eggPricePerCrate, setEggPricePerCrate] = useState<number>(5.50);
  const [eggCustomer, setEggCustomer] = useState('');
  const [eggContact, setEggContact] = useState('');
  const [eggDetails, setEggDetails] = useState('');

  const handleBirdSaleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!birdBatchId || !birdCustomer.trim() || birdQty <= 0) return;
    const selectedBatch = batches.find(b => b.id === birdBatchId);
    if (!selectedBatch || selectedBatch.currentQuantity < birdQty) {
      alert(`Insufficient birds in Batch ${birdBatchId}. Remaining: ${selectedBatch?.currentQuantity}`);
      return;
    }
    sellBatch(birdBatchId, birdQty, birdUnitPrice, birdCustomer, birdContact);
    setBirdCustomer('');
    setBirdContact('');
    setBirdDetails('');
    setBirdQty(100);
    setSubTab('logs');
  };

  const handleEggSaleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eggCustomer.trim() || eggCrates <= 0) return;
    addEggSale({
      date: new Date().toISOString().split('T')[0],
      customerName: eggCustomer,
      customerContact: eggContact,
      quantity: eggCrates,
      unitPrice: eggPricePerCrate,
      totalAmount: eggCrates * eggPricePerCrate,
      details: eggDetails || `Egg Sale: ${eggCrates} crates (30 eggs/crate)`
    });
    setEggCustomer('');
    setEggContact('');
    setEggDetails('');
    setEggCrates(10);
    setSubTab('logs');
  };

  const handleViewInvoice = (sale: Sale) => {
    setActiveInvoice(sale);
    setIsInvoiceOpen(true);
  };

  const activeBatches = batches.filter(b => b.status === 'Active' && b.currentQuantity > 0);

  const totalRevenue = sales.reduce((s, sale) => s + sale.totalAmount, 0);
  const birdSales = sales.filter(s => s.type === 'Bird');
  const eggSales = sales.filter(s => s.type === 'Egg');
  const selectedBatch = batches.find(b => b.id === birdBatchId);

  return (
    <div className="sales-mgmt-page animate-fade-in">

      {/* ── Summary Stats ── */}
      <div className="sales-stats-row">
        <div className="sales-stat-card">
          <span className="sales-stat-icon">💰</span>
          <div>
            <div className="sales-stat-value">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="sales-stat-label">Total Revenue</div>
          </div>
        </div>
        <div className="sales-stat-card">
          <span className="sales-stat-icon">🧾</span>
          <div>
            <div className="sales-stat-value">{sales.length}</div>
            <div className="sales-stat-label">Total Invoices</div>
          </div>
        </div>
        <div className="sales-stat-card">
          <span className="sales-stat-icon">🐔</span>
          <div>
            <div className="sales-stat-value">{birdSales.length}</div>
            <div className="sales-stat-label">Bird Sales</div>
          </div>
        </div>
        <div className="sales-stat-card">
          <span className="sales-stat-icon">🥚</span>
          <div>
            <div className="sales-stat-value">{eggSales.length}</div>
            <div className="sales-stat-label">Egg Sales</div>
          </div>
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div className="page-header-actions">
        <div className="filter-tabs">
          <button className={`tab-btn ${subTab === 'logs' ? 'active' : ''}`} onClick={() => setSubTab('logs')}>
            📋 Sales Records
          </button>
          <button className={`tab-btn ${subTab === 'sell-birds' ? 'active' : ''}`} onClick={() => setSubTab('sell-birds')}>
            🐔 Sell Birds
          </button>
          <button className={`tab-btn ${subTab === 'sell-eggs' ? 'active' : ''}`} onClick={() => setSubTab('sell-eggs')}>
            🥚 Sell Eggs
          </button>
        </div>
        <div className="sales-quick-actions">
          <button className="btn btn-secondary" onClick={() => setSubTab('sell-eggs')}>🥚 New Egg Sale</button>
          <button className="btn btn-primary" onClick={() => setSubTab('sell-birds')}>🐔 New Bird Sale</button>
        </div>
      </div>

      {/* ── Sales Records Tab ── */}
      {subTab === 'logs' && (
        <div className="glass-card">
          <div className="sm-card-header">
            <div>
              <h3>Sales Transactions Ledger</h3>
              <p className="chart-subtitle">{sales.length} invoices · ${totalRevenue.toFixed(2)} total revenue</p>
            </div>
          </div>

          {sales.length === 0 ? (
            <div className="sm-empty-state">
              <div className="sm-empty-icon">🧾</div>
              <p>No sales transactions yet.</p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '0.75rem' }}>
                <button className="btn btn-secondary" onClick={() => setSubTab('sell-eggs')}>🥚 Sell Eggs</button>
                <button className="btn btn-primary" onClick={() => setSubTab('sell-birds')}>🐔 Sell Birds</button>
              </div>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Invoice ID</th>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Type</th>
                    <th>Qty Sold</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[...sales].sort((a, b) => b.date.localeCompare(a.date)).map(s => (
                    <tr key={s.id}>
                      <td><span className="invoice-badge">{s.invoiceId}</span></td>
                      <td>{s.date}</td>
                      <td>
                        <div className="customer-cell">
                          <strong>{s.customerName}</strong>
                          {s.customerContact && <span className="customer-contact">{s.customerContact}</span>}
                        </div>
                      </td>
                      <td>
                        <span className={`sm-type-badge ${s.type === 'Bird' ? 'type-bird' : 'type-egg'}`}>
                          {s.type === 'Bird' ? '🐔 Bird' : '🥚 Egg'}
                        </span>
                      </td>
                      <td>{s.quantity.toLocaleString()} {s.type === 'Bird' ? 'birds' : 'crates'}</td>
                      <td>${s.unitPrice.toFixed(2)}</td>
                      <td><strong className="revenue-amount">${s.totalAmount.toFixed(2)}</strong></td>
                      <td>
                        <button className="btn btn-secondary btn-xs-custom" onClick={() => handleViewInvoice(s)}>
                          👁️ Invoice
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Bird Sale Form Tab ── */}
      {subTab === 'sell-birds' && (
        <div className="sm-sale-form-wrapper">
          <div className="glass-card sm-sale-form-card">
            <div className="sm-card-header">
              <div>
                <h3>🐔 Register Bird Sale</h3>
                <p className="chart-subtitle">Quantity deducted from batch automatically</p>
              </div>
            </div>

            {activeBatches.length === 0 ? (
              <div className="sm-empty-state">
                <div className="sm-empty-icon">🐔</div>
                <p>No active bird batches with stock to sell.</p>
              </div>
            ) : (
              <form onSubmit={handleBirdSaleSubmit} className="sm-form-layout">
                <div className="sm-form-row">
                  <div className="form-group">
                    <label className="form-label">Target Batch</label>
                    <select className="form-control" value={birdBatchId} onChange={e => setBirdBatchId(e.target.value)} required>
                      <option value="">Select batch...</option>
                      {activeBatches.map(b => (
                        <option key={b.id} value={b.id}>{b.id} — {b.type} ({b.currentQuantity} remaining)</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Quantity to Sell</label>
                    <input type="number" min="1" className="form-control" value={birdQty} onChange={e => setBirdQty(Number(e.target.value))} required />
                  </div>
                </div>

                <div className="sm-form-row">
                  <div className="form-group">
                    <label className="form-label">Customer Name</label>
                    <input type="text" className="form-control" placeholder="e.g. Premium Wholesalers" value={birdCustomer} onChange={e => setBirdCustomer(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Price per Bird (Rs)</label>
                    <input type="number" step="0.01" min="0.1" className="form-control" value={birdUnitPrice} onChange={e => setBirdUnitPrice(Number(e.target.value))} required />
                  </div>
                </div>

                <div className="sm-form-row">
                  <div className="form-group">
                    <label className="form-label">Customer Contact</label>
                    <input type="text" className="form-control" placeholder="e.g. +1 (555) 019-2834" value={birdContact} onChange={e => setBirdContact(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Remarks / Notes</label>
                    <input type="text" className="form-control" placeholder="e.g. Transport by client" value={birdDetails} onChange={e => setBirdDetails(e.target.value)} />
                  </div>
                </div>

                {birdQty > 0 && birdUnitPrice > 0 && (
                  <div className="sm-order-summary">
                    <div className="summary-row">
                      <span>Quantity</span>
                      <strong>{birdQty.toLocaleString()} birds</strong>
                    </div>
                    <div className="summary-row">
                      <span>Unit Price</span>
                      <strong>${birdUnitPrice.toFixed(2)}/bird</strong>
                    </div>
                    {selectedBatch && (
                      <div className="summary-row">
                        <span>Stock After Sale</span>
                        <strong className={selectedBatch.currentQuantity - birdQty < 0 ? 'text-danger' : ''}>
                          {Math.max(0, selectedBatch.currentQuantity - birdQty).toLocaleString()} birds
                        </strong>
                      </div>
                    )}
                    <div className="summary-row summary-total">
                      <span>Invoice Total</span>
                      <strong>${(birdQty * birdUnitPrice).toFixed(2)}</strong>
                    </div>
                  </div>
                )}

                <button type="submit" className="btn btn-primary sm-submit-btn">
                  📈 Complete Bird Sale & Generate Invoice
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── Egg Sale Form Tab ── */}
      {subTab === 'sell-eggs' && (
        <div className="sm-sale-form-wrapper">
          <div className="glass-card sm-sale-form-card">
            <div className="sm-card-header">
              <div>
                <h3>🥚 Register Egg Sale</h3>
                <p className="chart-subtitle">Sell eggs in crates of 30 eggs each</p>
              </div>
            </div>

            <form onSubmit={handleEggSaleSubmit} className="sm-form-layout">
              <div className="sm-form-row">
                <div className="form-group">
                  <label className="form-label">Quantity (Crates of 30)</label>
                  <input type="number" min="1" className="form-control" value={eggCrates} onChange={e => setEggCrates(Number(e.target.value))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Price per Crate (Rs)</label>
                  <input type="number" step="0.01" min="0.1" className="form-control" value={eggPricePerCrate} onChange={e => setEggPricePerCrate(Number(e.target.value))} required />
                </div>
              </div>

              <div className="sm-form-row">
                <div className="form-group">
                  <label className="form-label">Customer Name</label>
                  <input type="text" className="form-control" placeholder="e.g. Sunny Bakehouses Co." value={eggCustomer} onChange={e => setEggCustomer(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Customer Contact</label>
                  <input type="text" className="form-control" placeholder="e.g. +1 (555) 012-9900" value={eggContact} onChange={e => setEggContact(e.target.value)} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Remarks / Description</label>
                <input type="text" className="form-control" placeholder="e.g. Grade A large brown eggs" value={eggDetails} onChange={e => setEggDetails(e.target.value)} />
              </div>

              {eggCrates > 0 && eggPricePerCrate > 0 && (
                <div className="sm-order-summary">
                  <div className="summary-row">
                    <span>Crates</span>
                    <strong>{eggCrates.toLocaleString()}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Eggs Total</span>
                    <strong>{(eggCrates * 30).toLocaleString()} eggs</strong>
                  </div>
                  <div className="summary-row summary-total">
                    <span>Invoice Total</span>
                    <strong>${(eggCrates * eggPricePerCrate).toFixed(2)}</strong>
                  </div>
                </div>
              )}

              <button type="submit" className="btn btn-primary sm-submit-btn">
                📈 Complete Egg Sale & Generate Invoice
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Invoice Viewer Modal ── */}
      <Modal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        title={`🧾 Invoice: ${activeInvoice?.invoiceId}`}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsInvoiceOpen(false)}>Close</button>
            <button className="btn btn-primary" onClick={() => window.print()}>🖨️ Print Invoice</button>
          </>
        }
      >
        {activeInvoice && (
          <div className="printable-invoice-container print-invoice">
            <div className="invoice-header-branding">
              <div>
                <h2>FEATHERFLOW ERP</h2>
                <p className="inv-subtitle">Premium Poultry Farm Management</p>
                <p className="inv-address">128 Green Valley Farm Rd, Agriculture Zone</p>
              </div>
              <div className="invoice-id-block">
                <div className="invoice-label">INVOICE</div>
                <div className="invoice-meta-row"><span>No:</span><strong>{activeInvoice.invoiceId}</strong></div>
                <div className="invoice-meta-row"><span>Date:</span><strong>{activeInvoice.date}</strong></div>
              </div>
            </div>

            <div className="invoice-addresses">
              <div className="address-block">
                <h5>Billed To</h5>
                <p><strong>{activeInvoice.customerName}</strong></p>
                <p className="inv-contact">📞 {activeInvoice.customerContact}</p>
              </div>
              <div className="address-block invoice-status-block">
                <h5>Payment Status</h5>
                <span className="paid-badge">✅ PAID IN FULL</span>
              </div>
            </div>

            <table className="invoice-items-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Quantity</th>
                  <th>Unit Rate</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className="inv-item-desc">
                      {activeInvoice.type === 'Bird'
                        ? `Live Poultry Birds (Batch: ${activeInvoice.batchId})`
                        : 'Fresh Eggs — Crates of 30 eggs'}
                    </div>
                    {activeInvoice.details && (
                      <div className="inv-item-note">{activeInvoice.details}</div>
                    )}
                  </td>
                  <td>{activeInvoice.quantity.toLocaleString()} {activeInvoice.type === 'Bird' ? 'birds' : 'crates'}</td>
                  <td>${activeInvoice.unitPrice.toFixed(2)}</td>
                  <td><strong>${activeInvoice.totalAmount.toFixed(2)}</strong></td>
                </tr>
              </tbody>
            </table>

            <div className="invoice-calculations">
              <div className="calc-row"><span>Subtotal:</span><span>${activeInvoice.totalAmount.toFixed(2)}</span></div>
              <div className="calc-row"><span>Tax (0%):</span><span>Rs 0.00</span></div>
              <div className="calc-row grand-total"><span>Grand Total:</span><span>${activeInvoice.totalAmount.toFixed(2)}</span></div>
            </div>

            <div className="invoice-footer-notes">
              <p>Thank you for your business! Health certificates attached for live bird shipments.</p>
            </div>
          </div>
        )}
      </Modal>

      <style>{`
        .sales-stats-row {
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: var(--spacing-md); margin-bottom: var(--spacing-lg);
        }
        @media (max-width: 900px) { .sales-stats-row { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 500px)  { .sales-stats-row { grid-template-columns: 1fr; } }

        .sales-stat-card {
          background: var(--bg-card); border: 1px solid var(--border-color);
          border-radius: var(--radius-md); padding: var(--spacing-md) var(--spacing-lg);
          display: flex; align-items: center; gap: var(--spacing-md);
          backdrop-filter: var(--glass-blur);
          transition: border-color var(--transition-fast), transform var(--transition-fast);
        }
        .sales-stat-card:hover { border-color: var(--border-color-hover); transform: translateY(-2px); }
        .sales-stat-icon  { font-size: 1.75rem; }
        .sales-stat-value { font-size: 1.2rem; font-weight: 700; color: var(--text-primary); }
        .sales-stat-label { font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; margin-top: 0.1rem; }

        .page-header-actions {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: var(--spacing-lg); gap: var(--spacing-md); flex-wrap: wrap;
        }
        .filter-tabs {
          display: flex; gap: var(--spacing-sm);
          background: rgba(22,31,48,0.4); padding: 0.25rem;
          border-radius: var(--radius-md); border: 1px solid var(--border-color); flex-wrap: wrap;
        }
        .tab-btn {
          background: none; border: none; color: var(--text-secondary);
          padding: 0.5rem 1rem; border-radius: var(--radius-sm); cursor: pointer;
          font-family: var(--font-family); font-weight: 600; font-size: 0.85rem;
          transition: all var(--transition-fast); white-space: nowrap;
        }
        .tab-btn.active { background: rgba(255,255,255,0.08); color: var(--text-primary); }
        .sales-quick-actions { display: flex; gap: var(--spacing-sm); flex-wrap: wrap; }

        .sm-card-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: var(--spacing-lg); }
        .sm-card-header h3 { margin: 0 0 0.25rem; }

        .invoice-badge {
          font-family: monospace; background: rgba(255,255,255,0.05);
          border: 1px solid var(--border-color); padding: 0.2rem 0.5rem;
          border-radius: var(--radius-sm); font-weight: 700; font-size: 0.82rem;
        }

        .customer-cell { display: flex; flex-direction: column; gap: 0.1rem; }
        .customer-contact { font-size: 0.75rem; color: var(--text-muted); }

        .sm-type-badge {
          font-size: 0.75rem; font-weight: 600; padding: 0.2rem 0.6rem;
          border-radius: 999px; display: inline-block;
        }
        .type-bird { background: rgba(245,158,11,0.12); color: var(--color-amber); }
        .type-egg  { background: rgba(16,185,129,0.12); color: var(--color-emerald); }

        .revenue-amount { color: var(--color-emerald); }
        .btn-xs-custom  { padding: 0.3rem 0.65rem; font-size: 0.72rem; font-weight: 600; border-radius: var(--radius-sm); }

        .sm-empty-state { text-align: center; padding: var(--spacing-xl) 0; color: var(--text-muted); }
        .sm-empty-icon  { font-size: 2.5rem; margin-bottom: 0.5rem; }

        .sm-sale-form-wrapper { display: flex; justify-content: center; }
        .sm-sale-form-card { width: 100%; max-width: 680px; }

        .sm-form-layout { display: flex; flex-direction: column; gap: var(--spacing-md); }
        .sm-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md); }
        @media (max-width: 560px) { .sm-form-row { grid-template-columns: 1fr; } }

        .sm-order-summary {
          background: rgba(16,185,129,0.05); border: 1px solid rgba(16,185,129,0.15);
          border-radius: var(--radius-md); padding: var(--spacing-md) var(--spacing-lg);
          display: flex; flex-direction: column; gap: 0.4rem;
        }
        .summary-row { display: flex; justify-content: space-between; font-size: 0.88rem; color: var(--text-secondary); }
        .summary-row.summary-total {
          font-size: 1rem; font-weight: 700; color: var(--color-emerald);
          border-top: 1px solid rgba(16,185,129,0.2); padding-top: 0.4rem; margin-top: 0.2rem;
        }
        .text-danger { color: var(--color-rose); }
        .sm-submit-btn { width: 100%; margin-top: 0.25rem; }

        /* ── Invoice Styles ── */
        .printable-invoice-container { padding: var(--spacing-md); font-family: var(--font-family); }

        .invoice-header-branding {
          display: flex; justify-content: space-between; align-items: flex-start;
          border-bottom: 2px solid var(--border-color);
          padding-bottom: var(--spacing-lg); margin-bottom: var(--spacing-lg);
        }
        .invoice-header-branding h2 { font-size: 1.4rem; letter-spacing: 0.05em; margin: 0 0 0.25rem; }
        .inv-subtitle { color: var(--color-emerald); font-size: 0.78rem; margin-bottom: 0.2rem; }
        .inv-address  { font-size: 0.75rem; color: var(--text-muted); }

        .invoice-id-block { text-align: right; }
        .invoice-label { font-size: 1.2rem; font-weight: 800; color: var(--color-emerald); letter-spacing: 0.1em; margin-bottom: 0.5rem; }
        .invoice-meta-row { display: flex; gap: 0.5rem; justify-content: flex-end; font-size: 0.85rem; margin-bottom: 0.15rem; }

        .invoice-addresses { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--spacing-xl); }
        .address-block h5 { font-size: 0.7rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.4rem; letter-spacing: 0.05em; }
        .inv-contact { font-size: 0.82rem; color: var(--text-secondary); margin-top: 0.2rem; }
        .invoice-status-block { text-align: right; }
        .paid-badge {
          background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.25);
          color: var(--color-emerald); padding: 0.3rem 0.75rem; border-radius: 999px;
          font-size: 0.8rem; font-weight: 700;
        }

        .invoice-items-table { width: 100%; border-collapse: collapse; margin-bottom: var(--spacing-xl); }
        .invoice-items-table th { border-bottom: 1px solid var(--border-color-hover); padding-bottom: 0.5rem; font-size: 0.75rem; color: var(--text-secondary); text-align: left; }
        .invoice-items-table td { border-bottom: 1px solid var(--border-color); padding: 0.85rem 0; vertical-align: top; }
        .inv-item-desc { font-weight: 500; }
        .inv-item-note { font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem; }

        .invoice-calculations {
          margin-left: auto; width: 260px;
          border-top: 1px solid var(--border-color-hover); padding-top: var(--spacing-md);
          margin-bottom: var(--spacing-xl); display: flex; flex-direction: column; gap: 0.4rem;
        }
        .calc-row { display: flex; justify-content: space-between; font-size: 0.88rem; color: var(--text-secondary); }
        .calc-row.grand-total {
          font-size: 1rem; font-weight: 700; color: var(--text-primary);
          border-top: 1px solid var(--border-color-hover); padding-top: 0.5rem; margin-top: 0.25rem;
        }

        .invoice-footer-notes {
          text-align: center; font-size: 0.78rem; color: var(--text-muted);
          border-top: 1px solid var(--border-color); padding-top: var(--spacing-md);
        }
      `}</style>
    </div>
  );
};

