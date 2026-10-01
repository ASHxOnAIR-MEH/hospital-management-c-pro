import React from 'react';
import type { Ward, Bed } from '../types';
import { Building, Phone, UserCheck, ArrowRight } from 'lucide-react';

interface WardSectionProps {
  ward: Ward;
  beds: Bed[];
  onViewBeds: (wardId: string) => void;
}

export const WardSection: React.FC<WardSectionProps> = ({ ward, beds, onViewBeds }) => {
  const wardBeds = beds.filter(b => b.wardId === ward.id);
  const total = wardBeds.length;
  const available = wardBeds.filter(b => b.status === 'Available').length;
  const occupied = wardBeds.filter(b => b.status === 'Occupied').length;
  const cleaning = wardBeds.filter(b => b.status === 'Cleaning').length;
  const reserved = wardBeds.filter(b => b.status === 'Reserved').length;
  const maintenance = wardBeds.filter(b => b.status === 'Maintenance').length;

  const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0;

  // Color for progress bar based on capacity pressure
  const getProgressColor = () => {
    if (occupancyRate >= 85) return '#ef4444'; // Red (High pressure)
    if (occupancyRate >= 65) return '#f59e0b'; // Amber (Moderate)
    return '#10b981'; // Green (Healthy)
  };

  return (
    <div className="ward-card">
      <div className="ward-card-header">
        <div className="ward-title-area">
          <h3>{ward.name}</h3>
          <span className="ward-floor-tag">{ward.floor}</span>
        </div>
        <span 
          style={{
            fontSize: '12px',
            fontWeight: 800,
            padding: '4px 10px',
            borderRadius: '999px',
            background: available > 0 ? '#dcfce7' : '#fee2e2',
            color: available > 0 ? '#15803d' : '#b91c1c'
          }}
        >
          {available} Available
        </span>
      </div>

      <p style={{ fontSize: '13px', color: '#64748b', margin: '0' }}>
        {ward.description}
      </p>

      {/* Occupancy Progress Bar */}
      <div className="occupancy-meter-wrap">
        <div className="meter-header">
          <span style={{ color: '#475569' }}>Ward Occupancy</span>
          <span style={{ fontWeight: 800, color: '#0f172a' }}>{occupancyRate}% ({occupied}/{total})</span>
        </div>
        <div className="progress-track">
          <div 
            className="progress-fill" 
            style={{ 
              width: `${occupancyRate}%`,
              backgroundColor: getProgressColor() 
            }} 
          />
        </div>
      </div>

      {/* Status Breakdown Pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        <span className="mini-badge Available" title="Available Beds">
          {available} Avail
        </span>
        <span className="mini-badge Occupied" title="Occupied Beds">
          {occupied} Occupied
        </span>
        {cleaning > 0 && (
          <span className="mini-badge Cleaning" title="Cleaning in Progress">
            {cleaning} Clean
          </span>
        )}
        {reserved > 0 && (
          <span className="mini-badge Reserved" title="Reserved Beds">
            {reserved} Rsvd
          </span>
        )}
        {maintenance > 0 && (
          <span className="mini-badge Maintenance" title="Under Maintenance">
            {maintenance} Maint
          </span>
        )}
      </div>

      {/* Footer Info & Quick Link */}
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderTop: '1px solid #f1f5f9',
          paddingTop: '12px',
          marginTop: 'auto',
          fontSize: '12px',
          color: '#64748b'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Phone size={12} />
          <span>Ext: {ward.contactExt}</span>
        </div>

        <button
          type="button"
          onClick={() => onViewBeds(ward.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '13px',
            fontWeight: 700,
            color: '#2563eb'
          }}
        >
          <span>View Beds</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};
