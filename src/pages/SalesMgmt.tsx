import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import type { Sale } from '../context/FarmContext';
import { Modal } from '../components/Modal';

export const SalesMgmt: React.FC = () => {
  const { batches, sales, sellBatch, addEggSale } = useFarm();
  
  const [subTab, setSubTab] = useState<'logs' | 'sell-birds' | 'sell-eggs'>('logs');

  // Modal Invoice viewer
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState<Sale | null>(null);

  // Form Fields - Bird Sale
  const [birdBatchId, setBirdBatchId] = useState('');
  const [birdQty, setBirdQty] = useState<number>(100);
  const [birdUnitPrice, setBirdUnitPrice] = useState<number>(4.50);
  const [birdCustomer, setBirdCustomer] = useState('');
  const [birdContact, setBirdContact] = useState('');
  const [birdDetails, setBirdDetails] = useState('');

  // Form Fields - Egg Sale
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
      alert(`Insufficient birds in Batch ${birdBatchId}. Remaining quantity: ${selectedBatch?.currentQuantity}`);
      return;
    }

    sellBatch(birdBatchId, birdQty, birdUnitPrice, birdCustomer, birdContact);
    
    // Reset and Switch tab
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

    // Reset and Switch tab
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

  const handlePrint = () => {
    window.print();
  };

  const activeBatches = batches.filter(b => b.status === 'Active' && b.currentQuantity > 0);

  return (
    <div className="sales-mgmt-page animate-fade-in">
      <div className="page-header-actions">
        <div className="filter-tabs">
          <button
            className={`tab-btn ${subTab === 'logs' ? 'active' : ''}`}
            onClick={() => setSubTab('logs')}
          >
            📋 Sales Records
          </button>
          <button
            className={`tab-btn ${subTab === 'sell-birds' ? 'active' : ''}`}
            onClick={() => setSubTab('sell-birds')}
          >
            🐔 Sell Bird Batch
          </button>
          <button
            className={`tab-btn ${subTab === 'sell-eggs' ? 'active' : ''}`}
            onClick={() => setSubTab('sell-eggs')}
          >
            🥚 Sell Eggs (Crates)
          </button>
        </div>
      </div>

      {/* SUBTAB 1: SALES RECORDS TABLE */}
      {subTab === 'logs' && (
        <div className="glass-card">
          <h4>Sales Transactions Ledger</h4>
          <p className="chart-subtitle" style={{ marginBottom: '1rem' }}>Invoices generated for customers</p>
          {sales.length === 0 ? (
            <div className="empty-state">No sales transactions logged.</div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Invoice ID</th>
                    <th>Date</th>
                    <th>Customer Name</th>
                    <th>Category</th>
                    <th>Quantity Sold</th>
                    <th>Total Price</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map(s => (
                    <tr key={s.id}>
                      <td><span className="invoice-badge">{s.invoiceId}</span></td>
                      <td>{s.date}</td>
                      <td><b>{s.customerName}</b></td>
                      <td>
                        <span className={`badge ${s.type === 'Bird' ? 'badge-amber' : 'badge-emerald'}`}>
                          {s.type} Sale
                        </span>
                      </td>
                      <td>
                        {s.quantity.toLocaleString()} {s.type === 'Bird' ? 'birds' : 'crates'}
                      </td>
                      <td><b>${s.totalAmount.toFixed(2)}</b></td>
                      <td>
                        <button
                          className="btn btn-secondary btn-sm-custom"
                          onClick={() => handleViewInvoice(s)}
                        >
                          👁️ View Invoice
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

      {/* SUBTAB 2: BIRD SALE FORM */}
      {subTab === 'sell-birds' && (
        <div className="glass-card max-width-form">
          <h4>Register Bird Sales Invoice</h4>
          <p className="chart-subtitle" style={{ marginBottom: '1.5rem' }}>Deducts quantity instantly from target batch</p>
          
          {activeBatches.length === 0 ? (
            <div className="empty-state">
              No active bird batches with stock available to sell. Add bird batches first.
            </div>
          ) : (
            <form onSubmit={handleBirdSaleSubmit} className="form-layout-stacked">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Target Batch ID</label>
                  <select
                    className="form-control"
                    value={birdBatchId}
                    onChange={e => setBirdBatchId(e.target.value)}
                    required
                  >
                    <option value="">-- Select Batch --</option>
                    {activeBatches.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.id} ({b.type} - {b.currentQuantity} remaining)
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Quantity to Sell</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    value={birdQty}
                    onChange={e => setBirdQty(Number(e.target.value))}
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
                    placeholder="e.g. Premium Meat Wholesalers"
                    value={birdCustomer}
                    onChange={e => setBirdCustomer(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Price per Bird ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    className="form-control"
                    value={birdUnitPrice}
                    onChange={e => setBirdUnitPrice(Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Customer Contact Number</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. +1 (555) 019-2834"
                  value={birdContact}
                  onChange={e => setBirdContact(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Sale Remarks / Notes</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Average weight 2.0kg, transport provided by client"
                  value={birdDetails}
                  onChange={e => setBirdDetails(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                📈 Complete Bird Sale & Create Invoice
              </button>
            </form>
          )}
        </div>
      )}

      {/* SUBTAB 3: EGG SALE FORM */}
      {subTab === 'sell-eggs' && (
        <div className="glass-card max-width-form">
          <h4>Register Egg Sales Invoice</h4>
          <p className="chart-subtitle" style={{ marginBottom: '1.5rem' }}>Sell eggs in crates of 30 eggs each</p>

          <form onSubmit={handleEggSaleSubmit} className="form-layout-stacked">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Quantity Sold (Crates of 30)</label>
                <input
                  type="number"
                  min="1"
                  className="form-control"
                  value={eggCrates}
                  onChange={e => setEggCrates(Number(e.target.value))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Price per Crate ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.1"
                  className="form-control"
                  value={eggPricePerCrate}
                  onChange={e => setEggPricePerCrate(Number(e.target.value))}
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

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              📈 Complete Egg Sale & Create Invoice
            </button>
          </form>
        </div>
      )}

      {/* Invoice Viewer Modal */}
      <Modal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        title={`Invoice: ${activeInvoice?.invoiceId}`}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsInvoiceOpen(false)}>Close</button>
            <button className="btn btn-primary" onClick={handlePrint}>🖨️ Print Invoice</button>
          </>
        }
      >
        {activeInvoice && (
          <div className="printable-invoice-container print-invoice">
            <div className="invoice-header-branding">
              <div>
                <h2>FEATHERFLOW ERP</h2>
                <p className="subtitle">Premium Poultry Farm ERP</p>
                <p>128 Green Valley Farm Rd, Agriculture Zone</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h3 style={{ color: 'var(--color-emerald)' }}>INVOICE</h3>
                <p><b>No:</b> {activeInvoice.invoiceId}</p>
                <p><b>Date:</b> {activeInvoice.date}</p>
              </div>
            </div>

            <div className="invoice-addresses">
              <div className="address-block">
                <h5>Billed To:</h5>
                <p><b>{activeInvoice.customerName}</b></p>
                <p>Contact: {activeInvoice.customerContact}</p>
              </div>
              <div className="address-block" style={{ textAlign: 'right' }}>
                <h5>Payment Status:</h5>
                <span className="badge badge-emerald">PAID IN FULL</span>
              </div>
            </div>

            <table className="invoice-items-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Quantity</th>
                  <th>Unit Rate</th>
                  <th style={{ textAlign: 'right' }}>Total Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    {activeInvoice.type === 'Bird' 
                      ? `Broiler/Layer live poultry birds (Batch: ${activeInvoice.batchId})`
                      : 'Fresh organic layers eggs (Crates of 30 eggs)'}
                    <br />
                    <small style={{ color: 'var(--text-muted)' }}>{activeInvoice.details}</small>
                  </td>
                  <td>{activeInvoice.quantity.toLocaleString()} {activeInvoice.type === 'Bird' ? 'birds' : 'crates'}</td>
                  <td>${activeInvoice.unitPrice.toFixed(2)}</td>
                  <td style={{ textAlign: 'right' }}><b>${activeInvoice.totalAmount.toFixed(2)}</b></td>
                </tr>
              </tbody>
            </table>

            <div className="invoice-calculations">
              <div className="calc-row">
                <span>Subtotal:</span>
                <span>${activeInvoice.totalAmount.toFixed(2)}</span>
              </div>
              <div className="calc-row">
                <span>Sales Tax (0%):</span>
                <span>$0.00</span>
              </div>
              <div className="calc-row grand-total">
                <span>Grand Total (USD):</span>
                <span>${activeInvoice.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="invoice-footer-notes">
              <p>Thank you for your business! Health certificates are attached for live bird shipments.</p>
            </div>
          </div>
        )}
      </Modal>

      <style>{`
        .sales-mgmt-page {
          display: flex;
          flex-direction: column;
        }

        .page-header-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--spacing-lg);
        }

        .invoice-badge {
          font-family: monospace;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-color);
          padding: 0.25rem 0.5rem;
          border-radius: var(--radius-sm);
          font-weight: 700;
        }

        .max-width-form {
          max-width: 550px;
          margin: 0 auto;
        }

        .form-layout-stacked {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .btn-sm-custom {
          padding: 0.35rem 0.75rem;
          font-size: 0.75rem;
        }

        /* Printable Invoice Styles */
        .printable-invoice-container {
          padding: var(--spacing-md);
          font-family: var(--font-family);
        }

        .invoice-header-branding {
          display: flex;
          justify-content: space-between;
          border-bottom: 2px solid var(--border-color);
          padding-bottom: var(--spacing-lg);
          margin-bottom: var(--spacing-lg);
        }

        .invoice-header-branding h2 {
          font-size: 1.4rem;
          letter-spacing: 0.05em;
        }

        .invoice-header-branding .subtitle {
          color: var(--text-muted);
          font-size: 0.8rem;
          margin-bottom: 0.25rem;
        }

        .invoice-addresses {
          display: flex;
          justify-content: space-between;
          margin-bottom: var(--spacing-xl);
        }

        .address-block h5 {
          font-size: 0.75rem;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 0.25rem;
        }

        .invoice-items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: var(--spacing-xl);
        }

        .invoice-items-table th {
          border-bottom: 1px solid var(--border-color-hover);
          padding-bottom: 0.5rem;
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .invoice-items-table td {
          border-bottom: 1px solid var(--border-color);
          padding: 1rem 0;
        }

        .invoice-calculations {
          margin-left: auto;
          width: 250px;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          border-top: 1px solid var(--border-color-hover);
          padding-top: var(--spacing-md);
          margin-bottom: var(--spacing-xl);
        }

        .calc-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.88rem;
          color: var(--text-secondary);
        }

        .calc-row.grand-total {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-primary);
          border-top: 1px solid var(--border-color-hover);
          padding-top: 0.5rem;
        }

        .invoice-footer-notes {
          text-align: center;
          font-size: 0.78rem;
          color: var(--text-muted);
          border-top: 1px solid var(--border-color);
          padding-top: var(--spacing-md);
        }
      `}</style>
    </div>
  );
};
