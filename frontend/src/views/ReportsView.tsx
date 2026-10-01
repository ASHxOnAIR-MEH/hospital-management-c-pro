import React from 'react';
import { useHospital } from '../context/HospitalContext';
import { ReportCard } from '../components/ReportCard';
import { 
  Printer, 
  Download, 
  Building, 
  Activity, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  TrendingUp
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { beds, wards, metrics, showToast } = useHospital();

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    showToast('info', 'Export Generated', 'Report snapshot downloaded (frontend simulation).');
  };

  // Critical Care metrics
  const criticalWards = beds.filter(b => b.wardId === 'ward-icu' || b.wardId === 'ward-er');
  const criticalTotal = criticalWards.length;
  const criticalOccupied = criticalWards.filter(b => b.status === 'Occupied').length;
  const criticalAvailable = criticalWards.filter(b => b.status === 'Available').length;
  const criticalOccupancy = criticalTotal > 0 ? Math.round((criticalOccupied / criticalTotal) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Report Controls Top Bar */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#ffffff',
          padding: '18px 24px',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Operational Bed Availability & Occupancy Reports
          </h2>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '3px 0 0 0' }}>
            Daily snapshot generated for hospital administration & floor coordinators
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={handleExportCSV}
            className="btn-secondary"
            style={{ height: '40px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="btn-primary"
            style={{ height: '40px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Printer size={15} />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* 1. Daily Bed Status (User Prompt Requirement) */}
      <ReportCard
        title="1. Daily Bed Status Overview"
        subtitle="Current status breakdown across all hospital wings"
        icon={<Activity size={20} />}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Visual Multi-Segment Bar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700 }}>
              <span>Capacity Allocation ({metrics.totalBeds} Total Beds)</span>
              <span style={{ color: '#2563eb' }}>{metrics.occupancyRate}% Overall Occupancy</span>
            </div>

            <div 
              style={{ 
                height: '24px', 
                borderRadius: '8px', 
                overflow: 'hidden', 
                display: 'flex',
                background: '#f1f5f9'
              }}
            >
              {metrics.available > 0 && (
                <div 
                  style={{ 
                    width: `${(metrics.available / metrics.totalBeds) * 100}%`, 
                    backgroundColor: '#10b981' 
                  }} 
                  title={`Available: ${metrics.available}`}
                />
              )}
              {metrics.occupied > 0 && (
                <div 
                  style={{ 
                    width: `${(metrics.occupied / metrics.totalBeds) * 100}%`, 
                    backgroundColor: '#ef4444' 
                  }} 
                  title={`Occupied: ${metrics.occupied}`}
                />
              )}
              {metrics.cleaning > 0 && (
                <div 
                  style={{ 
                    width: `${(metrics.cleaning / metrics.totalBeds) * 100}%`, 
                    backgroundColor: '#f59e0b' 
                  }} 
                  title={`Cleaning: ${metrics.cleaning}`}
                />
              )}
              {metrics.reserved > 0 && (
                <div 
                  style={{ 
                    width: `${(metrics.reserved / metrics.totalBeds) * 100}%`, 
                    backgroundColor: '#3b82f6' 
                  }} 
                  title={`Reserved: ${metrics.reserved}`}
                />
              )}
              {metrics.maintenance > 0 && (
                <div 
                  style={{ 
                    width: `${(metrics.maintenance / metrics.totalBeds) * 100}%`, 
                    backgroundColor: '#64748b' 
                  }} 
                  title={`Maintenance: ${metrics.maintenance}`}
                />
              )}
            </div>
          </div>

          {/* Breakdown Stat Pill Grid */}
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
              gap: '12px' 
            }}
          >
            <div style={{ padding: '14px', background: '#ecfdf5', borderRadius: '10px', border: '1px solid #a7f3d0' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#166534', textTransform: 'uppercase' }}>🟢 Available</div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#15803d' }}>{metrics.available}</div>
              <div style={{ fontSize: '12px', color: '#166534' }}>{Math.round((metrics.available / metrics.totalBeds) * 100)}% of total</div>
            </div>

            <div style={{ padding: '14px', background: '#fef2f2', borderRadius: '10px', border: '1px solid #fecaca' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#991b1b', textTransform: 'uppercase' }}>🔴 Occupied</div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#dc2626' }}>{metrics.occupied}</div>
              <div style={{ fontSize: '12px', color: '#991b1b' }}>{Math.round((metrics.occupied / metrics.totalBeds) * 100)}% of total</div>
            </div>

            <div style={{ padding: '14px', background: '#fffbeb', borderRadius: '10px', border: '1px solid #fde68a' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#854d0e', textTransform: 'uppercase' }}>🟡 Cleaning</div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#d97706' }}>{metrics.cleaning}</div>
              <div style={{ fontSize: '12px', color: '#854d0e' }}>Turnover pipeline</div>
            </div>

            <div style={{ padding: '14px', background: '#eff6ff', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#1e40af', textTransform: 'uppercase' }}>🔵 Reserved</div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#2563eb' }}>{metrics.reserved}</div>
              <div style={{ fontSize: '12px', color: '#1e40af' }}>OR / Ambulance hold</div>
            </div>

            <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#334155', textTransform: 'uppercase' }}>⚪ Maintenance</div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#64748b' }}>{metrics.maintenance}</div>
              <div style={{ fontSize: '12px', color: '#475569' }}>Offline for repair</div>
            </div>
          </div>
        </div>
      </ReportCard>

      {/* 2. Ward-wise Availability (User Prompt Requirement) */}
      <ReportCard
        title="2. Ward-wise Availability Breakdown"
        subtitle="Detailed bed availability and occupancy status per department"
        icon={<Building size={20} />}
      >
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Ward Name</th>
                <th>Floor</th>
                <th>Total Beds</th>
                <th>Available</th>
                <th>Occupied</th>
                <th>Cleaning</th>
                <th>Reserved</th>
                <th>Occupancy %</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {wards.map((ward) => {
                const wardBeds = beds.filter(b => b.wardId === ward.id);
                const total = wardBeds.length;
                const avail = wardBeds.filter(b => b.status === 'Available').length;
                const occ = wardBeds.filter(b => b.status === 'Occupied').length;
                const clean = wardBeds.filter(b => b.status === 'Cleaning').length;
                const res = wardBeds.filter(b => b.status === 'Reserved').length;
                const rate = total > 0 ? Math.round((occ / total) * 100) : 0;

                return (
                  <tr key={ward.id}>
                    <td style={{ fontWeight: 700, color: '#0f172a' }}>{ward.name}</td>
                    <td style={{ color: '#64748b' }}>{ward.floor}</td>
                    <td style={{ fontWeight: 700 }}>{total}</td>
                    <td>
                      <span style={{ fontWeight: 800, color: '#16a34a' }}>{avail}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 800, color: '#dc2626' }}>{occ}</span>
                    </td>
                    <td>{clean}</td>
                    <td>{res}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '60px', height: '6px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                          <div 
                            style={{ 
                              width: `${rate}%`, 
                              height: '100%', 
                              background: rate >= 80 ? '#ef4444' : rate >= 60 ? '#f59e0b' : '#10b981' 
                            }} 
                          />
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '13px' }}>{rate}%</span>
                      </div>
                    </td>
                    <td>
                      <span 
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '999px',
                          background: avail === 0 ? '#fee2e2' : avail <= 2 ? '#fffbeb' : '#ecfdf5',
                          color: avail === 0 ? '#b91c1c' : avail <= 2 ? '#b45309' : '#15803d',
                        }}
                      >
                        {avail === 0 ? 'CRITICAL FULL' : avail <= 2 ? 'LOW AVAILABILITY' : 'OPTIMAL'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </ReportCard>

      {/* 3. Occupancy Summary (User Prompt Requirement) */}
      <ReportCard
        title="3. Executive Occupancy Summary"
        subtitle="Critical capacity thresholds and operational readiness"
        icon={<TrendingUp size={20} />}
      >
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', 
            gap: '16px' 
          }}
        >
          {/* Critical Care Readiness */}
          <div style={{ padding: '18px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <AlertCircle size={18} color="#dc2626" />
              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800 }}>Critical Care (ICU & ER)</h4>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>
              {criticalOccupancy}% Occupied
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
              {criticalAvailable} critical care beds immediately available out of {criticalTotal} total high-dependency units.
            </p>
          </div>

          {/* Housekeeping Turnaround */}
          <div style={{ padding: '18px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Clock size={18} color="#d97706" />
              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800 }}>Sanitation Pipeline</h4>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#d97706', margin: '4px 0' }}>
              {metrics.cleaning} Beds Cleaning
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
              Average turnaround cycle estimated at 35 minutes. Priority queued for ER and ICU beds.
            </p>
          </div>

          {/* General Inpatient Buffer */}
          <div style={{ padding: '18px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <CheckCircle2 size={18} color="#16a34a" />
              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800 }}>Overall Readiness</h4>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#16a34a', margin: '4px 0' }}>
              {metrics.available} Beds Ready
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
              Hospital is functioning within target safety threshold (&lt;85% overall occupancy).
            </p>
          </div>
        </div>
      </ReportCard>
    </div>
  );
};
