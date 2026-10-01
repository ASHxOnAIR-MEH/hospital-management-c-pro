import React from 'react';
import type { Bed } from '../types';
import { BedCard } from './BedCard';
import { BedDouble } from 'lucide-react';

interface BedGridProps {
  beds: Bed[];
  onSelectBed: (bed: Bed) => void;
  groupByWard?: boolean;
}

export const BedGrid: React.FC<BedGridProps> = ({ 
  beds, 
  onSelectBed, 
  groupByWard = false 
}) => {
  if (beds.length === 0) {
    return (
      <div className="empty-state-card">
        <BedDouble className="empty-state-icon" size={48} />
        <h3>No beds match your current search or filters</h3>
        <p>Try resetting the Ward, Floor, or Status filters, or clear your search term.</p>
      </div>
    );
  }

  if (!groupByWard) {
    return (
      <div className="bed-grid">
        {beds.map((bed) => (
          <BedCard key={bed.id} bed={bed} onClick={onSelectBed} />
        ))}
      </div>
    );
  }

  // Group beds by wardName
  const groupedBeds = beds.reduce<Record<string, Bed[]>>((acc, bed) => {
    if (!acc[bed.wardName]) {
      acc[bed.wardName] = [];
    }
    acc[bed.wardName].push(bed);
    return acc;
  }, {});

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {Object.entries(groupedBeds).map(([wardName, wardBeds]) => {
        const availableInWard = wardBeds.filter(b => b.status === 'Available').length;
        return (
          <div key={wardName} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                paddingBottom: '8px',
                borderBottom: '2px solid #e2e8f0'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                  {wardName}
                </h3>
                <span style={{ fontSize: '13px', color: '#64748b' }}>
                  ({wardBeds[0]?.floor})
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span 
                  style={{ 
                    fontSize: '12px', 
                    fontWeight: 700, 
                    padding: '4px 10px', 
                    borderRadius: '999px',
                    background: availableInWard > 0 ? '#dcfce7' : '#fee2e2',
                    color: availableInWard > 0 ? '#15803d' : '#b91c1c'
                  }}
                >
                  {availableInWard} of {wardBeds.length} Available
                </span>
              </div>
            </div>

            <div className="bed-grid">
              {wardBeds.map((bed) => (
                <BedCard key={bed.id} bed={bed} onClick={onSelectBed} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
