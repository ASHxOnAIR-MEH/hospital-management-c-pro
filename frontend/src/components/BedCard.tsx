import React from 'react';
import type { Bed } from '../types';
import { Clock, User, BedDouble, AlertCircle } from 'lucide-react';

interface BedCardProps {
  bed: Bed;
  onClick: (bed: Bed) => void;
}

export const BedCard: React.FC<BedCardProps> = ({ bed, onClick }) => {
  return (
    <div
      className={`bed-card status-${bed.status}`}
      onClick={() => onClick(bed)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(bed);
        }
      }}
      aria-label={`Bed ${bed.code}, ${bed.room}, Status ${bed.status}`}
    >
      <div>
        <div className="bed-card-header">
          <div>
            <div className="bed-code-badge">{bed.code}</div>
            <div className="bed-room-tag">
              <span>{bed.room}</span>
              <span>•</span>
              <span>{bed.floor}</span>
            </div>
          </div>
          <span className="bed-type-tag" title={bed.type}>
            {bed.type}
          </span>
        </div>
      </div>

      {/* Large Status Indicator */}
      <div className={`bed-status-indicator ${bed.status}`}>
        <span className="status-dot" />
        <span>{bed.status}</span>
      </div>

      {/* Patient Name Preview (if occupied or reserved) */}
      {bed.patientName ? (
        <div className="bed-patient-info" title={`Patient: ${bed.patientName}`}>
          <User size={14} className="patient-icon" />
          <span className="patient-name-text">{bed.patientName}</span>
          {bed.patientId && (
            <span className="patient-id-badge">({bed.patientId})</span>
          )}
        </div>
      ) : bed.status === 'Cleaning' ? (
        <div className="bed-patient-info" style={{ background: '#fffbeb', borderColor: '#fde68a' }}>
          <AlertCircle size={14} color="#d97706" />
          <span className="patient-name-text" style={{ color: '#854d0e', fontSize: '12px' }}>
            Sanitization in progress
          </span>
        </div>
      ) : null}

      {/* Footer Info */}
      <div className="bed-card-footer">
        <div className="bed-update-time" title={`Last updated by ${bed.updatedBy}`}>
          <Clock size={12} />
          <span>{bed.lastUpdated}</span>
        </div>
        <span className="bed-tap-hint">Tap to change →</span>
      </div>
    </div>
  );
};
