import React, { useState, useEffect } from 'react';
import type { Bed, BedStatus } from '../types';
import { useHospital } from '../context/HospitalContext';
import { ConfirmationModal } from './ConfirmationModal';
import { 
  X, 
  BedDouble, 
  User, 
  Clock, 
  Wrench, 
  Sparkles, 
  CheckCircle, 
  UserCheck, 
  LogOut,
  CalendarCheck
} from 'lucide-react';

interface BedModalProps {
  bed: Bed | null;
  onClose: () => void;
  onOpenAssignModal?: (bed: Bed) => void;
}

export const BedModal: React.FC<BedModalProps> = ({ 
  bed, 
  onClose,
  onOpenAssignModal
}) => {
  const { updateBedStatus, dischargePatientFromBed, isActionLoading } = useHospital();

  const [selectedStatus, setSelectedStatus] = useState<BedStatus | ''>('');
  const [patientNameInput, setPatientNameInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [isDischargeConfirmOpen, setIsDischargeConfirmOpen] = useState(false);
  const [pendingConfirmation, setPendingConfirmation] = useState<{
    targetStatus: BedStatus;
    title: string;
    message: string;
    isDestructive?: boolean;
    customPatientName?: string;
  } | null>(null);

  useEffect(() => {
    if (bed) {
      setSelectedStatus(bed.status);
      setPatientNameInput(bed.patientName || '');
      setNotesInput(bed.notes || '');
    }
  }, [bed]);

  if (!bed) return null;

  const statuses: BedStatus[] = ['Available', 'Occupied', 'Cleaning', 'Reserved', 'Maintenance'];

  const handleQuickAction = (targetStatus: BedStatus) => {
    if (targetStatus === bed.status) return;

    let message = `Are you sure you want to mark ${bed.code} as ${targetStatus}?`;
    let isDestructive = false;

    if (targetStatus === 'Maintenance') {
      message = `Warning: Setting ${bed.code} to Maintenance will make it unavailable for new hospital admissions. Proceed?`;
      isDestructive = true;
    } else if (targetStatus === 'Available' && bed.patientName) {
      message = `${bed.code} currently has patient "${bed.patientName}". Marking as Available will discharge/unassign this patient. Are you sure?`;
      isDestructive = true;
    } else if (targetStatus === 'Occupied') {
      message = `Are you sure you want to mark ${bed.code} as Occupied?`;
    }

    setPendingConfirmation({
      targetStatus,
      title: `Confirm Status: ${targetStatus}`,
      message,
      isDestructive,
      customPatientName: patientNameInput.trim() || undefined,
    });
  };

  const handleDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as BedStatus;
    setSelectedStatus(val);
    handleQuickAction(val);
  };

  const handleExecuteConfirmedChange = async () => {
    if (!pendingConfirmation) return;

    const { targetStatus, customPatientName } = pendingConfirmation;
    setPendingConfirmation(null);
    const success = await updateBedStatus(
      bed.id, 
      targetStatus, 
      notesInput.trim() || undefined, 
      customPatientName,
      bed.patientId
    );

    if (success) {
      onClose();
    }
  };

  const handleConfirmDischarge = async () => {
    setIsDischargeConfirmOpen(false);
    const success = await dischargePatientFromBed(bed.id, true);
    if (success) {
      onClose();
    }
  };

  return (
    <>
      <div 
        className="modal-overlay" 
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bed-modal-title"
      >
        <div 
          className="modal-container" 
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="modal-header">
            <div className="modal-title-wrap">
              <div className="modal-header-icon">
                <BedDouble size={26} />
              </div>
              <div>
                <h2 id="bed-modal-title" className="modal-header-title">
                  {bed.code} Details
                </h2>
                <p className="modal-header-subtitle">
                  {bed.wardName} • {bed.room}
                </p>
              </div>
            </div>
            <button 
              className="modal-close-btn" 
              onClick={onClose}
              aria-label="Close Bed Details"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="modal-body">
            {/* Current Status Pill Bar */}
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                borderRadius: '12px',
                backgroundColor: '#f8fafc',
                border: '1.5px solid #e2e8f0',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748b' }}>
                  Current Bed Status:
                </span>
                <span className={`bed-status-indicator ${bed.status}`} style={{ padding: '6px 14px', fontSize: '13px' }}>
                  <span className="status-dot" />
                  {bed.status}
                </span>
              </div>

              {/* Status Dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label htmlFor="bed-status-select" style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>
                  Change to:
                </label>
                <select
                  id="bed-status-select"
                  className="filter-select"
                  style={{ height: '38px', fontSize: '13px' }}
                  value={selectedStatus}
                  onChange={handleDropdownChange}
                >
                  {statuses.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Action Buttons Grid (Prompt Requirement: Large, tap-friendly) */}
            <div className="quick-actions-section">
              <span className="section-label">Quick Status Actions</span>
              <div className="quick-action-buttons-grid">
                <button
                  type="button"
                  className="quick-btn btn-occupy"
                  onClick={() => handleQuickAction('Occupied')}
                  disabled={bed.status === 'Occupied'}
                  title="Mark Bed as Occupied"
                >
                  <UserCheck size={18} />
                  <span>Occupy Bed</span>
                </button>

                <button
                  type="button"
                  className="quick-btn btn-cleaning"
                  onClick={() => handleQuickAction('Cleaning')}
                  disabled={bed.status === 'Cleaning'}
                  title="Mark for Sanitization / Housekeeping"
                >
                  <Sparkles size={18} />
                  <span>Mark Cleaning</span>
                </button>

                <button
                  type="button"
                  className="quick-btn btn-available"
                  onClick={() => handleQuickAction('Available')}
                  disabled={bed.status === 'Available'}
                  title="Mark Ready for Patient Intake"
                >
                  <CheckCircle size={18} />
                  <span>Mark Available</span>
                </button>

                <button
                  type="button"
                  className="quick-btn btn-reserve"
                  onClick={() => handleQuickAction('Reserved')}
                  disabled={bed.status === 'Reserved'}
                  title="Reserve for incoming patient"
                >
                  <CalendarCheck size={18} />
                  <span>Reserve Bed</span>
                </button>

                <button
                  type="button"
                  className="quick-btn btn-maintenance"
                  onClick={() => handleQuickAction('Maintenance')}
                  disabled={bed.status === 'Maintenance'}
                  title="Take offline for repairs"
                >
                  <Wrench size={18} />
                  <span>Maintenance</span>
                </button>
              </div>
            </div>

            {/* Key Information Grid */}
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Bed ID</span>
                <span className="detail-value">{bed.code}</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Ward</span>
                <span className="detail-value">{bed.wardName}</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Floor</span>
                <span className="detail-value">{bed.floor}</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Room / Bay</span>
                <span className="detail-value">{bed.room}</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Bed Type</span>
                <span className="detail-value">{bed.type}</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Patient ID</span>
                <span className="detail-value">
                  {bed.patientId ? bed.patientId : <em style={{ color: '#94a3b8' }}>None (Vacant)</em>}
                </span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Last Updated</span>
                <span className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={14} color="#64748b" />
                  {bed.lastUpdated} ({bed.lastUpdatedDate})
                </span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Updated By Staff</span>
                <span className="detail-value" style={{ color: '#2563eb' }}>
                  {bed.updatedBy}
                </span>
              </div>
            </div>

            {/* Patient Assignment / Occupancy Section */}
            <div 
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="section-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={16} /> Patient Information
                </span>
                {bed.patientName && (
                  <button
                    type="button"
                    onClick={() => setIsDischargeConfirmOpen(true)}
                    disabled={isActionLoading}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#dc2626',
                      background: '#fee2e2',
                      padding: '4px 10px',
                      borderRadius: '6px',
                    }}
                  >
                    <LogOut size={14} /> Discharge Patient
                  </button>
                )}
              </div>

              {bed.patientName ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div 
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: '#dbeafe',
                      color: '#1d4ed8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800
                    }}
                  >
                    PT
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                      {bed.patientName}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      ID: {bed.patientId || 'Unregistered'} • Admitted in {bed.room}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <p style={{ fontSize: '13px', color: '#64748b' }}>
                    No patient currently registered in this bed. You can enter patient name or assign from waitlist.
                  </p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="text"
                      placeholder="Enter patient name (optional)..."
                      className="search-input"
                      style={{ height: '40px', flex: 1, padding: '0 12px' }}
                      value={patientNameInput}
                      onChange={(e) => setPatientNameInput(e.target.value)}
                    />
                    {onOpenAssignModal && (
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ height: '40px', fontSize: '13px', whiteSpace: 'nowrap' }}
                        onClick={() => {
                          onOpenAssignModal(bed);
                          onClose();
                        }}
                      >
                        Select from Patients List
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Notes Section */}
            <div>
              <label 
                htmlFor="bed-notes-textarea" 
                className="section-label" 
                style={{ display: 'block', marginBottom: '6px' }}
              >
                Nurse & Maintenance Notes
              </label>
              <textarea
                id="bed-notes-textarea"
                rows={2}
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                placeholder="Add clinical or cleaning notes for this bed..."
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '13px',
                  color: '#0f172a',
                  resize: 'vertical',
                }}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={onClose}
            >
              Close
            </button>
            <button 
              type="button" 
              className="btn-primary" 
              disabled={isActionLoading}
              onClick={async () => {
                if (notesInput !== bed.notes || patientNameInput !== bed.patientName) {
                  await updateBedStatus(
                    bed.id, 
                    bed.status, 
                    notesInput, 
                    patientNameInput || null, 
                    bed.patientId
                  );
                }
                onClose();
              }}
            >
              {isActionLoading ? 'Saving...' : 'Save Notes & Close'}
            </button>
          </div>
        </div>
      </div>

      {/* Safety Confirmation Dialog */}
      {pendingConfirmation && (
        <ConfirmationModal
          isOpen={true}
          title={pendingConfirmation.title}
          message={pendingConfirmation.message}
          targetStatus={pendingConfirmation.targetStatus}
          confirmLabel={`Yes, Mark as ${pendingConfirmation.targetStatus}`}
          cancelLabel="No, Cancel"
          isDestructive={pendingConfirmation.isDestructive}
          onConfirm={handleExecuteConfirmedChange}
          onCancel={() => setPendingConfirmation(null)}
        />
      )}

      {/* Discharge Confirmation Dialog */}
      {isDischargeConfirmOpen && (
        <ConfirmationModal
          isOpen={true}
          title="Confirm Patient Discharge"
          message={`Are you sure you want to discharge patient "${bed.patientName || bed.patientId}" from ${bed.code}? The bed will be placed in Cleaning status for sanitization.`}
          targetStatus="Cleaning"
          confirmLabel="Yes, Discharge & Mark Cleaning"
          cancelLabel="No, Cancel"
          isDestructive={true}
          onConfirm={handleConfirmDischarge}
          onCancel={() => setIsDischargeConfirmOpen(false)}
        />
      )}
    </>
  );
};
