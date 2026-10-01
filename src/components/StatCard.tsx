import React from 'react';

interface StatCardProps {
  label: string;
  value: number;
  total?: number;
  type: 'total' | 'available' | 'occupied' | 'cleaning' | 'reserved' | 'maintenance';
  icon: React.ReactNode;
  isActiveFilter?: boolean;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  total,
  type,
  icon,
  isActiveFilter = false,
  onClick,
}) => {
  const percentage = total && total > 0 ? Math.round((value / total) * 100) : null;

  return (
    <div
      className={`stat-card ${type} ${isActiveFilter ? 'active-filter' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      title={`Click to filter by ${label}`}
    >
      <div className="stat-card-header">
        <span className="stat-card-label">{label}</span>
        <div className="stat-card-icon-bubble">{icon}</div>
      </div>

      <div className="stat-card-value">{value}</div>

      <div className="stat-card-subtext">
        {percentage !== null ? (
          <>
            <strong>{percentage}%</strong> of total capacity
          </>
        ) : (
          <span>Hospital wide</span>
        )}
      </div>
    </div>
  );
};
