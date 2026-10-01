import React from 'react';

interface ReportCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
}

export const ReportCard: React.FC<ReportCardProps> = ({
  title,
  subtitle,
  icon,
  headerAction,
  children,
}) => {
  return (
    <div className="table-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '14px',
          gap: '12px',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {icon && (
            <div 
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {icon}
            </div>
          )}
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              {title}
            </h3>
            {subtitle && (
              <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {headerAction && <div>{headerAction}</div>}
      </div>

      <div>{children}</div>
    </div>
  );
};
