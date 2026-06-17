import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import type { Sale } from '../context/FarmContext';
import { Modal } from '../components/Modal';

export const SalesMgmt: React.FC = () => {
  const { batches, sales, deleteSale, updateSale } = useFarm();

  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState<Sale | null>(null);
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [extraCharges, setExtraCharges] = useState<{ label: string; amount: number }[]>([]);
  const [newChargeLabel, setNewChargeLabel] = useState('Transport');
  const [newChargeAmount, setNewChargeAmount] = useState<number>(0);
  const [ledgerFilter, setLedgerFilter] = useState<'All' | 'Bird' | 'Egg'>('All');

  // Edit Sale States
  const [isEditSaleModalOpen, setIsEditSaleModalOpen] = useState(false);
  const [editingSaleId, setEditingSaleId] = useState('');
  const [editSaleType, setEditSaleType] = useState<'Bird' | 'Egg'>('Bird');
  const [editSaleDate, setEditSaleDate] = useState('');
  const [editSaleCustomerName, setEditSaleCustomerName] = useState('');
  const [editSaleCustomerContact, setEditSaleCustomerContact] = useState('');
  const [editSaleQty, setEditSaleQty] = useState<number>(0);
  const [editSaleUnitPrice, setEditSaleUnitPrice] = useState<number>(0);
  const [editSaleBatchId, setEditSaleBatchId] = useState('');
  const [editSaleDetails, setEditSaleDetails] = useState('');

  const handleOpenEditSale = (s: Sale) => {
    setEditingSaleId(s.id);
    setEditSaleType(s.type);
    setEditSaleDate(s.date);
    setEditSaleCustomerName(s.customerName);
    setEditSaleCustomerContact(s.customerContact);
    setEditSaleQty(s.quantity);
    setEditSaleUnitPrice(s.unitPrice);
    setEditSaleBatchId(s.batchId || '');
    setEditSaleDetails(s.details || '');
    setIsEditSaleModalOpen(true);
  };

  const handleEditSaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSaleId) return;
    await updateSale(editingSaleId, {
      type: editSaleType,
      date: editSaleDate,
      customerName: editSaleCustomerName,
      customerContact: editSaleCustomerContact,
      quantity: Number(editSaleQty),
      unitPrice: Number(editSaleUnitPrice),
      totalAmount: Number(editSaleQty) * Number(editSaleUnitPrice),
      batchId: editSaleType === 'Bird' ? editSaleBatchId : undefined,
      details: editSaleDetails
    });
    setIsEditSaleModalOpen(false);
  };

  const handleViewInvoice = (sale: Sale) => {
    setActiveInvoice(sale);
    setAmountPaid(sale.totalAmount); // default to exact amount
    setExtraCharges([]);
    setNewChargeLabel('Transport');
    setNewChargeAmount(0);
    setIsInvoiceOpen(true);
  };

  const totalRevenue = sales.reduce((s, sale) => s + sale.totalAmount, 0);
  const birdSales = sales.filter(s => s.type === 'Bird');
  const eggSales = sales.filter(s => s.type === 'Egg');

  // Filtered sales for the ledger
  const filteredSales = sales.filter(s => {
    if (ledgerFilter === 'All') return true;
    return s.type === ledgerFilter;
  });

  const filteredRevenue = filteredSales.reduce((sum, s) => sum + s.totalAmount, 0);
  const filteredCost = filteredSales.reduce((sum, s) => {
    if (s.type === 'Egg') return sum;
    const batch = batches.find(b => b.id === s.batchId);
    const purchasePrice = batch ? batch.purchasePrice : 0;
    return sum + (s.quantity * purchasePrice);
  }, 0);
  const filteredProfit = filteredRevenue - filteredCost;

  return (
    <div className="sales-mgmt-page animate-fade-in">

      {/* ── Summary Stats ── */}
      <div className="sales-stats-row">
        <div className="sales-stat-card">
          <span className="sales-stat-icon">💰</span>
          <div>
            <div className="sales-stat-value">Rs {totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
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

      <div className="glass-card">
        <div className="sm-card-header">
          <div>
            <h3>Sales Transactions Ledger</h3>
            <p className="chart-subtitle">{sales.length} invoices · Rs {totalRevenue.toFixed(2)} total revenue</p>
          </div>
          <div className="ledger-filter-controls">
            <button 
              type="button"
              className={`ledger-filter-btn ${ledgerFilter === 'All' ? 'active' : ''}`} 
              onClick={() => setLedgerFilter('All')}
            >
              All
            </button>
            <button 
              type="button"
              className={`ledger-filter-btn ${ledgerFilter === 'Bird' ? 'active' : ''}`} 
              onClick={() => setLedgerFilter('Bird')}
            >
              🐔 Bird Profit
            </button>
            <button 
              type="button"
              className={`ledger-filter-btn ${ledgerFilter === 'Egg' ? 'active' : ''}`} 
              onClick={() => setLedgerFilter('Egg')}
            >
              🥚 Egg Profit
            </button>
          </div>
        </div>

        {sales.length === 0 ? (
          <div className="sm-empty-state">
            <div className="sm-empty-icon">🧾</div>
            <p>No sales transactions recorded yet.</p>
          </div>
        ) : (
          <>
            {/* Mini-stats summary bar */}
            <div className="ledger-summary-bar">
              <div className="ledger-summary-card">
                <span className="ledger-summary-label">Revenue (Selected)</span>
                <span className="ledger-summary-value color-emerald">
                  Rs {filteredRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="ledger-summary-card">
                <span className="ledger-summary-label">Initial Cost</span>
                <span className="ledger-summary-value color-rose">
                  Rs {filteredCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="ledger-summary-card">
                <span className="ledger-summary-label">Net Profit</span>
                <span className={`ledger-summary-value ${filteredProfit >= 0 ? 'color-emerald' : 'color-rose'}`}>
                  Rs {filteredProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {filteredSales.length === 0 ? (
              <div className="sm-empty-state">
                <div className="sm-empty-icon">🧾</div>
                <p>No {ledgerFilter.toLowerCase()} sales transactions found.</p>
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
                      <th>Profit</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...filteredSales].sort((a, b) => b.date.localeCompare(a.date)).map(s => {
                      const cost = s.type === 'Bird' ? (batches.find(b => b.id === s.batchId)?.purchasePrice ?? 0) * s.quantity : 0;
                      const profit = s.totalAmount - cost;
                      return (
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
                          <td>{s.quantity.toLocaleString()} {s.type === 'Bird' ? 'birds' : 'eggs'}</td>
                          <td>Rs {s.unitPrice.toFixed(2)}</td>
                          <td><strong className="revenue-amount">Rs {s.totalAmount.toFixed(2)}</strong></td>
                          <td>
                            <strong className={profit >= 0 ? "profit-amount-pos" : "profit-amount-neg"}>
                              Rs {profit.toFixed(2)}
                            </strong>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                              <button type="button" className="btn btn-secondary btn-xs-custom" onClick={() => handleViewInvoice(s)}>
                                👁️ Invoice
                              </button>
                              <button
                                type="button"
                                className="btn btn-secondary btn-xs-custom"
                                onClick={() => handleOpenEditSale(s)}
                              >
                                ✏️ Edit
                              </button>
                              <button 
                                type="button"
                                className="btn btn-danger btn-xs-custom" 
                                onClick={() => {
                                  if (window.confirm(`Are you sure you want to delete invoice ${s.invoiceId}?`)) {
                                    deleteSale(s.id);
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
          </>
        )}
      </div>

      {/* ── Edit Sale Modal ── */}
      <Modal
        isOpen={isEditSaleModalOpen}
        onClose={() => setIsEditSaleModalOpen(false)}
        title={`✏️ Edit Sale Invoice: ${sales.find(s => s.id === editingSaleId)?.invoiceId || ''}`}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsEditSaleModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleEditSaleSubmit}>Save Changes</button>
          </>
        }
      >
        <form onSubmit={handleEditSaleSubmit} className="modal-form-grid">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Sale Date</label>
              <input type="date" className="form-control" value={editSaleDate} onChange={e => setEditSaleDate(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Sale Type</label>
              <select className="form-control" value={editSaleType} onChange={e => setEditSaleType(e.target.value as 'Bird' | 'Egg')}>
                <option value="Bird">🐔 Bird Sale</option>
                <option value="Egg">🥚 Egg Sale</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Customer Name</label>
              <input type="text" className="form-control" value={editSaleCustomerName} onChange={e => setEditSaleCustomerName(e.target.value)} maxLength={128} required />
            </div>
            <div className="form-group">
              <label className="form-label">Customer Contact</label>
              <input type="text" className="form-control" value={editSaleCustomerContact} onChange={e => setEditSaleCustomerContact(e.target.value)} maxLength={32} required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Quantity ({editSaleType === 'Bird' ? 'birds' : 'eggs'})</label>
              <input type="number" min="1" className="form-control" value={editSaleQty} onChange={e => setEditSaleQty(Number(e.target.value))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Price per {editSaleType === 'Bird' ? 'Bird' : 'Egg'} (Rs)</label>
              <input type="number" step="0.01" min="0.01" className="form-control" value={editSaleUnitPrice} onChange={e => setEditSaleUnitPrice(Number(e.target.value))} required />
            </div>
          </div>

          {editSaleType === 'Bird' && (
            <div className="form-group">
              <label className="form-label">Target Batch ID</label>
              <select className="form-control" value={editSaleBatchId} onChange={e => setEditSaleBatchId(e.target.value)} required>
                <option value="">Select active batch...</option>
                {batches.filter(b => b.status === 'Active').map(b => (
                  <option key={b.id} value={b.id}>{b.id} — {b.type} ({b.currentQuantity.toLocaleString()} birds available)</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Details / Remarks</label>
            <input type="text" className="form-control" value={editSaleDetails} onChange={e => setEditSaleDetails(e.target.value)} maxLength={256} />
          </div>

          {editSaleQty > 0 && editSaleUnitPrice > 0 && (
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
                <span>Subtotal</span>
                <strong>Rs {(editSaleQty * editSaleUnitPrice).toFixed(2)}</strong>
              </div>
            </div>
          )}
        </form>
      </Modal>

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
                <h2>AKSHA FARM ERP</h2>
                <p className="inv-subtitle">Premium Poultry Farm Management</p>
                <p className="inv-address">Kekunagoll, Kurunegala</p>
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
                <h5>Amount Paid (Rs)</h5>
                <input
                  id="amountPaidInput"
                  type="number"
                  min="0"
                  step="0.01"
                  className="inv-paid-input inv-paid-input-header"
                  value={amountPaid}
                  onChange={e => setAmountPaid(Number(e.target.value))}
                />
                <span className="inv-paid-print-value">Rs {amountPaid.toFixed(2)}</span>
                <div style={{ marginTop: '0.4rem' }}>
                  {amountPaid >= (activeInvoice?.totalAmount ?? 0) ? (
                    <span className="paid-badge">✅ PAID IN FULL</span>
                  ) : (
                    <span className="partial-badge">⏳ PARTIAL PAYMENT</span>
                  )}
                </div>
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
                        : 'Fresh Eggs'}
                    </div>
                    {activeInvoice.details && (
                      <div className="inv-item-note">{activeInvoice.details}</div>
                    )}
                  </td>
                  <td>{activeInvoice.quantity.toLocaleString()} {activeInvoice.type === 'Bird' ? 'birds' : 'eggs'}</td>
                  <td>Rs {activeInvoice.unitPrice.toFixed(2)}</td>
                  <td><strong>Rs {activeInvoice.totalAmount.toFixed(2)}</strong></td>
                </tr>
              </tbody>
            </table>

            <div className="invoice-calculations">
              <div className="calc-row"><span>Subtotal:</span><span>Rs {activeInvoice.totalAmount.toFixed(2)}</span></div>

              {/* ── Extra Charges ── */}
              {extraCharges.map((c, i) => (
                <div key={i} className={`calc-row extra-charge-row ${c.amount < 0 ? 'charge-deduction' : 'charge-addition'}`}>
                  <span>{c.amount < 0 ? '− ' : '+ '}{c.label}:</span>
                  <span className="extra-charge-right">
                    <span className={c.amount < 0 ? 'charge-neg-val' : 'charge-pos-val'}>
                      {c.amount < 0 ? '−' : '+'} Rs {Math.abs(c.amount).toFixed(2)}
                    </span>
                    <button
                      type="button"
                      className="remove-charge-btn"
                      onClick={() => {
                        const updated = extraCharges.filter((_, idx) => idx !== i);
                        setExtraCharges(updated);
                        const newGrandTotal = (activeInvoice?.totalAmount ?? 0) + updated.reduce((s, x) => s + x.amount, 0);
                        setAmountPaid(newGrandTotal);
                      }}
                      title="Remove charge"
                    >✕</button>
                  </span>
                </div>
              ))}

              {/* ── Add Charge Row ── */}
              <div className="add-charge-row">
                <select
                  className="charge-label-select"
                  value={newChargeLabel}
                  onChange={e => setNewChargeLabel(e.target.value)}
                >
                  <option>Transport</option>
                  <option>Packing</option>
                  <option>Loading</option>
                  <option>Handling</option>
                  <option>Discount</option>
                  <option>Advance Deduction</option>
                  <option>Other</option>
                </select>
                {/* ± toggle: positive or negative */}
                <button
                  type="button"
                  className={`charge-sign-toggle ${newChargeAmount < 0 ? 'sign-neg' : 'sign-pos'}`}
                  title={newChargeAmount < 0 ? 'Currently Deduction (−). Click to switch to Addition (+)' : 'Currently Addition (+). Click to switch to Deduction (−)'}
                  onClick={() => setNewChargeAmount(prev => prev === 0 ? -0.01 : -prev)}
                >
                  {newChargeAmount < 0 ? '−' : '+'}
                </button>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="charge-amount-input"
                  placeholder="Amount"
                  value={newChargeAmount === 0 ? '' : Math.abs(newChargeAmount)}
                  onChange={e => {
                    const abs = Math.abs(Number(e.target.value));
                    setNewChargeAmount(newChargeAmount < 0 ? -abs : abs);
                  }}
                />
                <button
                  type="button"
                  className="add-charge-btn"
                  onClick={() => {
                    if (newChargeAmount !== 0) {
                      const newCharge = { label: newChargeLabel, amount: newChargeAmount };
                      const updated = [...extraCharges, newCharge];
                      setExtraCharges(updated);
                      const newGrandTotal = (activeInvoice?.totalAmount ?? 0) + updated.reduce((s, c) => s + c.amount, 0);
                      setAmountPaid(newGrandTotal);
                      setNewChargeAmount(0);
                    }
                  }}
                >+ Add</button>
              </div>

              {/* ── Grand Total ── */}
              {(() => {
                const totalExtras = extraCharges.reduce((s, c) => s + c.amount, 0);
                const grandTotal = activeInvoice.totalAmount + totalExtras;
                const change = amountPaid - grandTotal;
                return (
                  <>
                    <div className="calc-row grand-total"><span>Grand Total:</span><span>Rs {grandTotal.toFixed(2)}</span></div>
                    {/* ── Balance Section ── */}
                    <div className="calc-row payment-given-row">
                      <span>Payment Given:</span>
                      <span>Rs {amountPaid.toFixed(2)}</span>
                    </div>
                    {change >= 0 ? (
                      <div className="calc-row balance-row change-positive">
                        <span>Change to Return:</span>
                        <span>Rs {change.toFixed(2)}</span>
                      </div>
                    ) : (
                      <div className="calc-row balance-row balance-due">
                        <span>Balance Due:</span>
                        <span>Rs {(-change).toFixed(2)}</span>
                      </div>
                    )}
                  </>
                );
              })()}
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

        .sm-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--spacing-lg); flex-wrap: wrap; gap: var(--spacing-md); }
        .sm-card-header h3 { margin: 0; }

        /* Ledger Filter Controls */
        .ledger-filter-controls {
          display: flex;
          gap: 0.35rem;
          background: rgba(22, 31, 48, 0.4);
          padding: 0.2rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-color);
        }
        .ledger-filter-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          padding: 0.35rem 0.75rem;
          border-radius: var(--radius-xs);
          cursor: pointer;
          font-family: var(--font-family);
          font-weight: 600;
          font-size: 0.78rem;
          transition: all var(--transition-fast);
          white-space: nowrap;
        }
        .ledger-filter-btn:hover {
          color: var(--text-primary);
        }
        .ledger-filter-btn.active {
          background: rgba(255, 255, 255, 0.08);
          color: var(--text-primary);
        }

        /* Ledger Summary Mini Bar */
        .ledger-summary-bar {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-lg);
        }
        @media (max-width: 600px) {
          .ledger-summary-bar {
            grid-template-columns: 1fr;
            gap: var(--spacing-sm);
          }
        }
        .ledger-summary-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: var(--spacing-sm) var(--spacing-md);
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }
        .ledger-summary-label {
          font-size: 0.68rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .ledger-summary-value {
          font-size: 1.05rem;
          font-weight: 700;
        }
        .color-emerald { color: var(--color-emerald) !important; }
        .color-rose { color: var(--color-rose) !important; }

        /* Profit Column Values */
        .profit-amount-pos {
          color: var(--color-emerald);
        }
        .profit-amount-neg {
          color: var(--color-rose);
        }

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
        .partial-badge {
          background: rgba(245,158,11,0.12); border: 1px solid rgba(245,158,11,0.25);
          color: var(--color-amber); padding: 0.3rem 0.75rem; border-radius: 999px;
          font-size: 0.8rem; font-weight: 700;
        }
        .inv-paid-input {
          width: 110px; padding: 0.25rem 0.5rem; font-size: 0.88rem; font-weight: 600;
          background: rgba(255,255,255,0.06); border: 1px solid var(--border-color-hover);
          border-radius: var(--radius-sm); color: var(--text-primary);
          text-align: right; font-family: var(--font-family);
        }
        .inv-paid-input-header {
          width: auto; max-width: 140px; font-size: 0.9rem; padding: 0.3rem 0.5rem; text-align: right;
          border-color: rgba(16,185,129,0.3); display: block;
        }
        .inv-paid-input-header:focus { border-color: var(--color-emerald); }
        .inv-paid-input:focus { outline: none; border-color: var(--color-emerald); }
        .payment-input-row { align-items: center; margin-top: 0.5rem; }
        .balance-row { font-size: 1rem; font-weight: 700; border-top: 1px solid var(--border-color-hover); padding-top: 0.5rem; margin-top: 0.15rem; }
        .change-positive { color: var(--color-emerald); }
        .balance-due { color: var(--color-rose); }
        .payment-given-row {
          color: var(--color-amber); font-weight: 600;
          border-top: 1px dashed rgba(245,158,11,0.25); padding-top: 0.4rem; margin-top: 0.1rem;
        }

        .invoice-items-table { width: 100%; border-collapse: collapse; margin-bottom: var(--spacing-xl); }
        .invoice-items-table th { border-bottom: 1px solid var(--border-color-hover); padding-bottom: 0.5rem; font-size: 0.75rem; color: var(--text-secondary); text-align: left; }
        .invoice-items-table td { border-bottom: 1px solid var(--border-color); padding: 0.85rem 0; vertical-align: top; }
        .inv-item-desc { font-weight: 500; }
        .inv-item-note { font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem; }

        .invoice-calculations {
          margin-left: auto; width: 320px;
          border-top: 1px solid var(--border-color-hover); padding-top: var(--spacing-md);
          margin-bottom: var(--spacing-xl); display: flex; flex-direction: column; gap: 0.4rem;
        }
        .calc-row { display: flex; justify-content: space-between; font-size: 0.88rem; color: var(--text-secondary); }
        .calc-row.grand-total {
          font-size: 1rem; font-weight: 700; color: var(--text-primary);
          border-top: 1px solid var(--border-color-hover); padding-top: 0.5rem; margin-top: 0.25rem;
        }


        /* Extra charge rows */
        .extra-charge-row { }
        .charge-addition { color: #38bdf8; }
        .charge-deduction { color: var(--color-rose); }
        .charge-pos-val { color: #38bdf8; font-weight: 600; }
        .charge-neg-val { color: var(--color-rose); font-weight: 600; }
        .extra-charge-right { display: flex; align-items: center; gap: 0.35rem; }

        /* ± sign toggle button */
        .charge-sign-toggle {
          width: 1.6rem; height: 1.6rem; flex-shrink: 0;
          border-radius: var(--radius-sm); font-size: 0.95rem; font-weight: 800;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          border: 1px solid; transition: all var(--transition-fast); font-family: var(--font-family);
          line-height: 1;
        }
        .charge-sign-toggle.sign-pos {
          background: rgba(16,185,129,0.12); border-color: rgba(16,185,129,0.35);
          color: var(--color-emerald);
        }
        .charge-sign-toggle.sign-pos:hover {
          background: rgba(16,185,129,0.25);
        }
        .charge-sign-toggle.sign-neg {
          background: rgba(239,68,68,0.12); border-color: rgba(239,68,68,0.35);
          color: var(--color-rose);
        }
        .charge-sign-toggle.sign-neg:hover {
          background: rgba(239,68,68,0.25);
        }

        .remove-charge-btn {
          background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.2);
          color: var(--color-rose); border-radius: 50%; width: 1.1rem; height: 1.1rem;
          font-size: 0.55rem; cursor: pointer; display: flex; align-items: center;
          justify-content: center; padding: 0; line-height: 1; flex-shrink: 0;
          transition: background var(--transition-fast);
        }
        .remove-charge-btn:hover { background: rgba(239,68,68,0.25); }

        /* Add charge form row */
        .add-charge-row {
          display: flex; align-items: center; gap: 0.3rem; margin-top: 0.25rem;
          padding: 0.4rem 0.5rem;
          background: rgba(255,255,255,0.03);
          border: 1px dashed var(--border-color);
          border-radius: var(--radius-sm);
        }
        .charge-label-select {
          flex: 1; background: #1e2a3a; border: 1px solid var(--border-color-hover);
          border-radius: var(--radius-sm); color: #e2e8f0;
          font-family: var(--font-family); font-size: 0.75rem; padding: 0.25rem 0.35rem;
          appearance: auto; -webkit-appearance: auto;
        }
        .charge-label-select option {
          background: #1e2a3a; color: #e2e8f0;
        }
        .charge-amount-input {
          width: 72px; background: #1e2a3a; border: 1px solid var(--border-color-hover);
          border-radius: var(--radius-sm); color: #e2e8f0;
          font-family: var(--font-family); font-size: 0.75rem; padding: 0.25rem 0.35rem;
          text-align: right;
        }
        .charge-label-select:focus, .charge-amount-input:focus { outline: none; border-color: var(--color-emerald); }
        .add-charge-btn {
          background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.3);
          color: var(--color-emerald); border-radius: var(--radius-sm);
          font-size: 0.72rem; font-weight: 700; padding: 0.25rem 0.5rem;
          cursor: pointer; white-space: nowrap; font-family: var(--font-family);
          transition: background var(--transition-fast);
        }
        .add-charge-btn:hover { background: rgba(16,185,129,0.25); }

        .invoice-footer-notes {
          text-align: center; font-size: 0.78rem; color: var(--text-muted);
          border-top: 1px solid var(--border-color); padding-top: var(--spacing-md);
        }

        @media print {
          .add-charge-row { display: none !important; }
          .remove-charge-btn { display: none !important; }
          .inv-paid-input-header { display: none !important; }
          .inv-paid-print-value { display: block !important; }
        }
        .inv-paid-print-value { display: none; font-size: 0.95rem; font-weight: 700; color: #e2e8f0; }
      `}</style>
    </div>
  );
};

