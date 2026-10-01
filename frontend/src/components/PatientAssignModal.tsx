import React, { useState } from 'react';
import type { Patient, Bed } from '../types';
import { useHospital } from '../context/HospitalContext';
import { X, UserPlus, BedDouble, Check } from 'lucide-react';

interface PatientAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetPatient?: Patient | null;
  targetBed?: Bed | null;
}

export const PatientAssignModal: React.FC<PatientAssignModalProps> = ({
  isOpen,
  onClose,
  targetPatient,
  targetBed,
}) => {
  const { beds, patients, assignPatientToBed, isActionLoading } = useHospital();

  const [selectedPatientId, setSelectedPatientId] = useState<string>(targetPatient?.id || '');
  const [selectedBedId, setSelectedBedId] = useState<string>(targetBed?.id || '');
  const [guestName, setGuestName] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  // Available beds
  const availableBeds = beds.filter(b => b.status === 'Available');
  // Unassigned patients
  const awaitingPatients = patients.filter(p => p.status === 'Awaiting Bed' || !p.bedId);

  const handleAssign = async () => {
    const bedIdToAssign = targetBed ? targetBed.id : selectedBedId;
    if (!bedIdToAssign) return;

    let success = false;
    if (selectedPatientId) {
      success = await assignPatientToBed(selectedPatientId, bedIdToAssign, notes.trim() || undefined);
    } else if (guestName.trim()) {
      // If typing a quick intake name
      success = await assignPatientToBed('PT-TEMP', bedIdToAssign, `Admitted as: ${guestName.trim()}`);
    }

    if (success) {
      onClose();
    }
  };

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="modal-container" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '540px' }}
      >
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-header-icon">
              <UserPlus size={24} />
            </div>
            <div>
              <h3 className="modal-header-title">Assign Patient to Bed</h3>
              <p className="modal-header-subtitle">Select patient and available bed</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Patient Selection */}
          <div>
            <label className="section-label" style={{ display: 'block', marginBottom: '8px' }}>
              1. Select Patient
            </label>
            {targetPatient ? (
              <div 
                style={{ 
                  padding: '12px 16px', 
                  borderRadius: '8px', 
                  background: '#f8fafc',
                  border: '1.5px solid #cbd5e1',
                  fontWeight: 700 
                }}
              >
                {targetPatient.name} ({targetPatient.id}) • {targetPatient.ward}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <select
                  className="filter-select"
                  style={{ width: '100%', height: '44px' }}
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                >
                  <option value="">Select waiting patient...</option>
                  {awaitingPatients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.id}) — {p.condition}
                    </option>
                  ))}
                </select>

                <div style={{ fontSize: '12px', color: '#64748b', textAlign: 'center' }}>- OR -</div>

                <input
                  type="text"
                  placeholder="Or enter new patient intake name..."
                  className="search-input"
                  style={{ height: '42px' }}
                  value={guestName}
                  onChange={(e) => {
                    setGuestName(e.target.value);
                    if (e.target.value) setSelectedPatientId('');
                  }}
                />
              </div>
            )}
          </div>

          {/* Bed Selection */}
          <div>
            <label className="section-label" style={{ display: 'block', marginBottom: '8px' }}>
              2. Select Available Bed
            </label>
            {targetBed ? (
              <div 
                style={{ 
                  padding: '12px 16px', 
                  borderRadius: '8px', 
                  background: '#ecfdf5',
                  border: '1.5px solid #86efac',
                  fontWeight: 700,
                  color: '#166534',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <BedDouble size={18} />
                <span>{targetBed.code} ({targetBed.wardName} • {targetBed.room})</span>
              </div>
            ) : (
              <select
                className="filter-select"
                style={{ width: '100%', height: '44px' }}
                value={selectedBedId}
                onChange={(e) => setSelectedBedId(e.target.value)}
              >
                <option value="">Choose an Available Bed ({availableBeds.length} ready)...</option>
                {availableBeds.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.code} — {b.wardName} ({b.room}, {b.type})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Intake Notes */}
          <div>
            <label className="section-label" style={{ display: 'block', marginBottom: '8px' }}>
              Admission Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Admitted via ER triage or OR stepdown"
              className="search-input"
              style={{ height: '42px' }}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={handleAssign}
            disabled={isActionLoading || ((!targetPatient && !selectedPatientId && !guestName.trim()) || (!targetBed && !selectedBedId))}
          >
            {isActionLoading ? 'Saving to Database...' : 'Confirm Bed Assignment'}
          </button>
        </div>
      </div>
    </div>
  );
};
