import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import { Modal } from '../components/Modal';

export const HealthMgmt: React.FC = () => {
  const { batches, vaccines, medicalRecords, addVaccineSchedule, updateVaccineStatus, addMedicalRecord } = useFarm();
  
  const [subTab, setSubTab] = useState<'vaccines' | 'medical'>('vaccines');

  // Modals Open State
  const [isVaccineModalOpen, setIsVaccineModalOpen] = useState(false);
  const [isMedicalModalOpen, setIsMedicalModalOpen] = useState(false);

  // Form Fields - Vaccine
  const [vaccineName, setVaccineName] = useState('Newcastle Disease');
  const [vaccineBatchId, setVaccineBatchId] = useState('');
  const [vaccineDate, setVaccineDate] = useState(new Date().toISOString().split('T')[0]);

  // Form Fields - Medical Record
  const [medicalDate, setMedicalDate] = useState(new Date().toISOString().split('T')[0]);
  const [medicalBatchId, setMedicalBatchId] = useState('');
  const [disease, setDisease] = useState('');
  const [medicine, setMedicine] = useState('');
  const [dosage, setDosage] = useState('');
  const [medicalCost, setMedicalCost] = useState<number>(100);

  const handleVaccineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vaccineBatchId) return;

    addVaccineSchedule({
      vaccineName,
      batchId: vaccineBatchId,
      scheduledDate: vaccineDate
    });

    setVaccineName('Newcastle Disease');
    setVaccineBatchId('');
    setIsVaccineModalOpen(false);
  };

  const handleMedicalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicalBatchId || !disease || !medicine) return;

    addMedicalRecord({
      date: medicalDate,
      batchId: medicalBatchId,
      disease,
      medicine,
      dosage,
      cost: Number(medicalCost)
    });

    setMedicalBatchId('');
    setDisease('');
    setMedicine('');
    setDosage('');
    setMedicalCost(100);
    setIsMedicalModalOpen(false);
  };

  const activeBatches = batches.filter(b => b.status === 'Active');

  return (
    <div className="health-mgmt-page animate-fade-in">
      <div className="page-header-actions">
        <div className="filter-tabs">
          <button
            className={`tab-btn ${subTab === 'vaccines' ? 'active' : ''}`}
            onClick={() => setSubTab('vaccines')}
          >
            💉 Vaccination Schedule
          </button>
          <button
            className={`tab-btn ${subTab === 'medical' ? 'active' : ''}`}
            onClick={() => setSubTab('medical')}
          >
            💊 Medical Remedies
          </button>
        </div>

        <div className="action-buttons-group">
          {subTab === 'vaccines' ? (
            <button className="btn btn-primary" onClick={() => setIsVaccineModalOpen(true)}>
              📅 Schedule Vaccine Event
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => setIsMedicalModalOpen(true)}>
              🩺 Add Medical Record
            </button>
          )}
        </div>
      </div>

      {/* SUBTAB 1: VACCINES TABLE */}
      {subTab === 'vaccines' && (
        <div className="glass-card">
          <h4>Immunization Log & Planner</h4>
          <p className="chart-subtitle" style={{ marginBottom: '1rem' }}>Preventative vaccine schedules per bird batch</p>
          {vaccines.length === 0 ? (
            <div className="empty-state">No vaccine records.</div>
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
                  {vaccines.map(v => (
                    <tr key={v.id}>
                      <td><b>{v.vaccineName}</b></td>
                      <td><span className="batch-badge">{v.batchId}</span></td>
                      <td>{v.scheduledDate}</td>
                      <td>
                        <span className={`badge ${v.status === 'Completed' ? 'badge-emerald' : 'badge-amber'}`}>
                          {v.status}
                        </span>
                      </td>
                      <td>
                        {v.status === 'Pending' ? (
                          <button
                            className="btn btn-primary btn-xs-custom"
                            onClick={() => updateVaccineStatus(v.id, 'Completed')}
                          >
                            ✓ Mark Done
                          </button>
                        ) : (
                          <button
                            className="btn btn-secondary btn-xs-custom"
                            onClick={() => updateVaccineStatus(v.id, 'Pending')}
                          >
                            ↺ Mark Pending
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

      {/* SUBTAB 2: MEDICAL REMEDIES */}
      {subTab === 'medical' && (
        <div className="glass-card">
          <h4>Medical Record & Treatment Log</h4>
          <p className="chart-subtitle" style={{ marginBottom: '1rem' }}>Diagnosed diseases and medical expenses</p>
          {medicalRecords.length === 0 ? (
            <div className="empty-state">No diseases logged. Perfect flock health!</div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Batch ID</th>
                    <th>Disease Diagnosed</th>
                    <th>Medicine Given</th>
                    <th>Dosage Administered</th>
                    <th>Treatment Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {medicalRecords.map(m => (
                    <tr key={m.id}>
                      <td>{m.date}</td>
                      <td><span className="batch-badge">{m.batchId}</span></td>
                      <td><span className="color-rose-text">{m.disease}</span></td>
                      <td>{m.medicine}</td>
                      <td>{m.dosage}</td>
                      <td><b>${m.cost.toFixed(2)}</b></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 1. Modal: Schedule Vaccine */}
      <Modal
        isOpen={isVaccineModalOpen}
        onClose={() => setIsVaccineModalOpen(false)}
        title="Schedule Vaccination Event"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsVaccineModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleVaccineSubmit}>Schedule</button>
          </>
        }
      >
        <form onSubmit={handleVaccineSubmit} className="modal-form-grid">
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

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Target Batch</label>
              <select
                className="form-control"
                value={vaccineBatchId}
                onChange={e => setVaccineBatchId(e.target.value)}
                required
              >
                <option value="">-- Select Active Batch --</option>
                {activeBatches.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.id} ({b.type} - {b.currentQuantity} birds)
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Scheduled Date</label>
              <input
                type="date"
                className="form-control"
                value={vaccineDate}
                onChange={e => setVaccineDate(e.target.value)}
                required
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* 2. Modal: Medical Treatment */}
      <Modal
        isOpen={isMedicalModalOpen}
        onClose={() => setIsMedicalModalOpen(false)}
        title="Add Medical Record & Remedy"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsMedicalModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleMedicalSubmit}>Log Remedy</button>
          </>
        }
      >
        <form onSubmit={handleMedicalSubmit} className="modal-form-grid">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Treatment Date</label>
              <input
                type="date"
                className="form-control"
                value={medicalDate}
                onChange={e => setMedicalDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Target Batch</label>
              <select
                className="form-control"
                value={medicalBatchId}
                onChange={e => setMedicalBatchId(e.target.value)}
                required
              >
                <option value="">-- Select Active Batch --</option>
                {activeBatches.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.id} ({b.type} - {b.currentQuantity} birds)
                  </option>
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

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Medicine / Remedy Name</label>
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
              <label className="form-label">Remedy Cost ($)</label>
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
            <label className="form-label">Dosage & Administration Method</label>
            <textarea
              className="form-control"
              placeholder="e.g. 5g per gallon of drinking water for 3 days"
              rows={2}
              value={dosage}
              onChange={e => setDosage(e.target.value)}
              required
              style={{ resize: 'vertical' }}
            ></textarea>
          </div>
        </form>
      </Modal>

      <style>{`
        .health-mgmt-page {
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

        .action-buttons-group {
          display: flex;
          gap: var(--spacing-sm);
        }

        .btn-xs-custom {
          padding: 0.25rem 0.5rem;
          font-size: 0.72rem;
          font-weight: 600;
          border-radius: var(--radius-sm);
        }

        .color-rose-text {
          color: #fca5a5;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};
