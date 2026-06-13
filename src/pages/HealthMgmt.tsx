import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import { Modal } from '../components/Modal';

export const HealthMgmt: React.FC = () => {
  const { batches, vaccines, medicalRecords, addVaccineSchedule, updateVaccineStatus, addMedicalRecord } = useFarm();

  const [subTab, setSubTab] = useState<'vaccines' | 'medical'>('vaccines');
  const [isVaccineModalOpen, setIsVaccineModalOpen] = useState(false);
  const [isMedicalModalOpen, setIsMedicalModalOpen] = useState(false);

  const [vaccineName, setVaccineName] = useState('Newcastle Disease');
  const [vaccineBatchId, setVaccineBatchId] = useState('');
  const [vaccineDate, setVaccineDate] = useState(new Date().toISOString().split('T')[0]);

  const [medicalDate, setMedicalDate] = useState(new Date().toISOString().split('T')[0]);
  const [medicalBatchId, setMedicalBatchId] = useState('');
  const [disease, setDisease] = useState('');
  const [medicine, setMedicine] = useState('');
  const [dosage, setDosage] = useState('');
  const [medicalCost, setMedicalCost] = useState<number>(100);

  const handleVaccineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vaccineBatchId) return;
    addVaccineSchedule({ vaccineName, batchId: vaccineBatchId, scheduledDate: vaccineDate });
    setVaccineName('Newcastle Disease');
    setVaccineBatchId('');
    setIsVaccineModalOpen(false);
  };

  const handleMedicalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicalBatchId || !disease || !medicine) return;
    addMedicalRecord({ date: medicalDate, batchId: medicalBatchId, disease, medicine, dosage, cost: Number(medicalCost) });
    setMedicalBatchId('');
    setDisease('');
    setMedicine('');
    setDosage('');
    setMedicalCost(100);
    setIsMedicalModalOpen(false);
  };

  const activeBatches = batches.filter(b => b.status === 'Active');

  const pendingVaccines = vaccines.filter(v => v.status === 'Pending').length;
  const completedVaccines = vaccines.filter(v => v.status === 'Completed').length;
  const totalMedCost = medicalRecords.reduce((s, m) => s + m.cost, 0);

  return (
    <div className="health-mgmt-page animate-fade-in">

      {/* ── Summary Stats ── */}
      <div className="health-stats-row">
        <div className="health-stat-card">
          <span className="health-stat-icon">💉</span>
          <div>
            <div className="health-stat-value">{vaccines.length}</div>
            <div className="health-stat-label">Total Vaccines</div>
          </div>
        </div>
        <div className="health-stat-card stat-warning">
          <span className="health-stat-icon">⏳</span>
          <div>
            <div className="health-stat-value">{pendingVaccines}</div>
            <div className="health-stat-label">Pending</div>
          </div>
        </div>
        <div className="health-stat-card stat-success">
          <span className="health-stat-icon">✅</span>
          <div>
            <div className="health-stat-value">{completedVaccines}</div>
            <div className="health-stat-label">Completed</div>
          </div>
        </div>
        <div className="health-stat-card">
          <span className="health-stat-icon">💊</span>
          <div>
            <div className="health-stat-value">${totalMedCost.toFixed(2)}</div>
            <div className="health-stat-label">Medical Spend</div>
          </div>
        </div>
      </div>

      {/* ── Tab Bar + Action Buttons ── */}
      <div className="page-header-actions">
        <div className="filter-tabs">
          <button className={`tab-btn ${subTab === 'vaccines' ? 'active' : ''}`} onClick={() => setSubTab('vaccines')}>
            💉 Vaccination Schedule
          </button>
          <button className={`tab-btn ${subTab === 'medical' ? 'active' : ''}`} onClick={() => setSubTab('medical')}>
            💊 Medical Records
          </button>
        </div>
        <div className="action-buttons-group">
          {subTab === 'vaccines' ? (
            <button className="btn btn-primary" onClick={() => setIsVaccineModalOpen(true)}>
              📅 Schedule Vaccine
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => setIsMedicalModalOpen(true)}>
              🩺 Add Medical Record
            </button>
          )}
        </div>
      </div>

      {/* ── Vaccines Tab ── */}
      {subTab === 'vaccines' && (
        <div className="glass-card">
          <div className="hm-card-header">
            <div>
              <h3>Immunization Log & Planner</h3>
              <p className="chart-subtitle">Preventative vaccine schedules per bird batch</p>
            </div>
            {pendingVaccines > 0 && (
              <div className="pending-alert-pill">
                ⏳ {pendingVaccines} vaccine{pendingVaccines > 1 ? 's' : ''} pending
              </div>
            )}
          </div>

          {vaccines.length === 0 ? (
            <div className="hm-empty-state">
              <div className="hm-empty-icon">💉</div>
              <p>No vaccine schedules yet.</p>
              <button className="btn btn-primary" style={{ marginTop: '0.75rem' }} onClick={() => setIsVaccineModalOpen(true)}>
                📅 Schedule First Vaccine
              </button>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Vaccine Name</th>
                    <th>Batch ID</th>
                    <th>Scheduled Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[...vaccines].sort((a, b) => b.scheduledDate.localeCompare(a.scheduledDate)).map(v => (
                    <tr key={v.id} className={v.status === 'Completed' ? 'row-completed' : ''}>
                      <td><strong>💉 {v.vaccineName}</strong></td>
                      <td><span className="batch-badge">{v.batchId}</span></td>
                      <td>{v.scheduledDate}</td>
                      <td>
                        <span className={`hm-status-pill ${v.status === 'Completed' ? 'status-done' : 'status-pending'}`}>
                          {v.status === 'Completed' ? '✅ Completed' : '⏳ Pending'}
                        </span>
                      </td>
                      <td>
                        {v.status === 'Pending' ? (
                          <button className="btn btn-primary btn-xs-custom" onClick={() => updateVaccineStatus(v.id, 'Completed')}>
                            ✓ Mark Done
                          </button>
                        ) : (
                          <button className="btn btn-secondary btn-xs-custom" onClick={() => updateVaccineStatus(v.id, 'Pending')}>
                            ↺ Revert
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Medical Records Tab ── */}
      {subTab === 'medical' && (
        <div className="glass-card">
          <div className="hm-card-header">
            <div>
              <h3>Medical Record & Treatment Log</h3>
              <p className="chart-subtitle">{medicalRecords.length} treatments · ${totalMedCost.toFixed(2)} total spent</p>
            </div>
          </div>

          {medicalRecords.length === 0 ? (
            <div className="hm-empty-state">
              <div className="hm-empty-icon">🐔</div>
              <p>No diseases logged. Healthy flock!</p>
              <button className="btn btn-primary" style={{ marginTop: '0.75rem' }} onClick={() => setIsMedicalModalOpen(true)}>
                🩺 Add First Record
              </button>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Batch ID</th>
                    <th>Disease</th>
                    <th>Medicine</th>
                    <th>Dosage</th>
                    <th>Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {[...medicalRecords].sort((a, b) => b.date.localeCompare(a.date)).map(m => (
                    <tr key={m.id}>
                      <td>{m.date}</td>
                      <td><span className="batch-badge">{m.batchId}</span></td>
                      <td><span className="disease-tag">🦠 {m.disease}</span></td>
                      <td><span className="medicine-tag">💊 {m.medicine}</span></td>
                      <td className="dosage-cell">{m.dosage}</td>
                      <td><strong className="cost-highlight">${m.cost.toFixed(2)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Vaccine Modal ── */}
      <Modal
        isOpen={isVaccineModalOpen}
        onClose={() => setIsVaccineModalOpen(false)}
        title="💉 Schedule Vaccination Event"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsVaccineModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleVaccineSubmit}>Schedule</button>
          </>
        }
      >
        <form onSubmit={handleVaccineSubmit} className="hm-modal-form">
          <div className="form-group">
            <label className="form-label">Vaccine / Disease Target</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Fowl Pox, Newcastle Lasota"
              value={vaccineName}
              onChange={e => setVaccineName(e.target.value)}
              required
            />
          </div>
          <div className="hm-form-row">
            <div className="form-group">
              <label className="form-label">Target Batch</label>
              <select className="form-control" value={vaccineBatchId} onChange={e => setVaccineBatchId(e.target.value)} required>
                <option value="">Select active batch...</option>
                {activeBatches.map(b => (
                  <option key={b.id} value={b.id}>{b.id} ({b.type} · {b.currentQuantity} birds)</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Scheduled Date</label>
              <input type="date" className="form-control" value={vaccineDate} onChange={e => setVaccineDate(e.target.value)} required />
            </div>
          </div>
          {vaccineBatchId && (
            <div className="hm-info-pill">
              📋 Scheduling <strong>{vaccineName}</strong> for batch <strong>{vaccineBatchId}</strong>
            </div>
          )}
        </form>
      </Modal>

      {/* ── Medical Record Modal ── */}
      <Modal
        isOpen={isMedicalModalOpen}
        onClose={() => setIsMedicalModalOpen(false)}
        title="🩺 Add Medical Record & Remedy"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsMedicalModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleMedicalSubmit}>Log Remedy</button>
          </>
        }
      >
        <form onSubmit={handleMedicalSubmit} className="hm-modal-form">
          <div className="hm-form-row">
            <div className="form-group">
              <label className="form-label">Treatment Date</label>
              <input type="date" className="form-control" value={medicalDate} onChange={e => setMedicalDate(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Target Batch</label>
              <select className="form-control" value={medicalBatchId} onChange={e => setMedicalBatchId(e.target.value)} required>
                <option value="">Select batch...</option>
                {activeBatches.map(b => (
                  <option key={b.id} value={b.id}>{b.id} ({b.type} · {b.currentQuantity} birds)</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Disease Diagnosed</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Coccidiosis, Coryza, Bird Flu symptoms"
              value={disease}
              onChange={e => setDisease(e.target.value)}
              required
            />
          </div>

          <div className="hm-form-row">
            <div className="form-group">
              <label className="form-label">Medicine / Remedy</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Amprolium, Tylosin"
                value={medicine}
                onChange={e => setMedicine(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Treatment Cost (Rs)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-control"
                value={medicalCost}
                onChange={e => setMedicalCost(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Dosage & Administration</label>
            <textarea
              className="form-control"
              placeholder="e.g. 5g per gallon of drinking water for 3 days"
              rows={2}
              value={dosage}
              onChange={e => setDosage(e.target.value)}
              required
              style={{ resize: 'vertical' }}
            />
          </div>
        </form>
      </Modal>

      <style>{`
        .health-stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-lg);
        }
        @media (max-width: 900px) { .health-stats-row { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 500px)  { .health-stats-row { grid-template-columns: 1fr; } }

        .health-stat-card {
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
        .health-stat-card:hover { border-color: var(--border-color-hover); transform: translateY(-2px); }
        .health-stat-card.stat-warning { border-color: rgba(245,158,11,0.25); }
        .health-stat-card.stat-success { border-color: rgba(16,185,129,0.25); }
        .health-stat-icon { font-size: 1.75rem; }
        .health-stat-value { font-size: 1.35rem; font-weight: 700; color: var(--text-primary); }
        .health-stat-label { font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; margin-top: 0.1rem; }

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
        .action-buttons-group { display: flex; gap: var(--spacing-sm); }

        .hm-card-header {
          display: flex; align-items: flex-start; justify-content: space-between;
          margin-bottom: var(--spacing-lg); gap: var(--spacing-md);
        }
        .hm-card-header h3 { margin: 0 0 0.25rem; }

        .pending-alert-pill {
          background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.25);
          color: var(--color-amber); border-radius: 999px; padding: 0.35rem 0.85rem;
          font-size: 0.78rem; font-weight: 600; white-space: nowrap;
        }

        .hm-status-pill {
          font-size: 0.75rem; font-weight: 600; padding: 0.25rem 0.65rem;
          border-radius: 999px; display: inline-block;
        }
        .status-done    { background: rgba(16,185,129,0.12); color: var(--color-emerald); }
        .status-pending { background: rgba(245,158,11,0.12); color: var(--color-amber); }

        .row-completed td { opacity: 0.6; }

        .btn-xs-custom { padding: 0.3rem 0.65rem; font-size: 0.72rem; font-weight: 600; border-radius: var(--radius-sm); }

        .disease-tag  { color: #fca5a5; font-weight: 500; }
        .medicine-tag { color: var(--color-cyan); font-size: 0.85rem; }
        .dosage-cell  { max-width: 200px; font-size: 0.8rem; color: var(--text-secondary); }
        .cost-highlight { color: var(--color-rose); }

        .batch-badge {
          background: rgba(255,255,255,0.05); border: 1px solid var(--border-color);
          padding: 0.2rem 0.5rem; border-radius: var(--radius-sm);
          font-weight: 700; font-family: monospace; font-size: 0.85rem;
        }

        .hm-empty-state { text-align: center; padding: var(--spacing-xl) 0; color: var(--text-muted); }
        .hm-empty-icon  { font-size: 2.5rem; margin-bottom: 0.5rem; }

        .hm-modal-form { display: flex; flex-direction: column; gap: var(--spacing-md); }
        .hm-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md); }
        @media (max-width: 480px) { .hm-form-row { grid-template-columns: 1fr; } }

        .hm-info-pill {
          background: rgba(6,182,212,0.07); border: 1px solid rgba(6,182,212,0.2);
          border-radius: var(--radius-sm); padding: 0.5rem 0.85rem;
          font-size: 0.82rem; color: var(--text-secondary);
        }
        .hm-info-pill strong { color: var(--color-cyan); }
      `}</style>
    </div>
  );
};

