import React from 'react';
import { useHospital } from '../context/HospitalContext';
import { 
  Settings, 
  RotateCcw, 
  Server, 
  User, 
  PhoneCall, 
  ShieldCheck, 
  Check, 
  Sparkles,
  Info
} from 'lucide-react';
import { API_BASE_URL } from '../config/api';

export const SettingsView: React.FC = () => {
  const { currentStaff, allStaff, switchStaff, resetToMockData, showToast } = useHospital();

  const handleTestAudio = () => {
    showToast('info', 'Audio Cue', 'Audible alert tone played for high-priority bed changes.');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '860px' }}>
      {/* Staff Profile Switcher */}
      <div className="table-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <User size={20} color="#2563eb" />
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Active Staff Profile
          </h3>
        </div>
        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
          Select the active staff member for audit attribution and activity logging.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
          {allStaff.map((staff) => {
            const isCurrent = currentStaff.id === staff.id;
            return (
              <div
                key={staff.id}
                onClick={() => switchStaff(staff.id)}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: isCurrent ? '2px solid #2563eb' : '1.5px solid #e2e8f0',
                  background: isCurrent ? '#eff6ff' : '#f8fafc',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.15s ease',
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: isCurrent ? '#2563eb' : '#94a3b8',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '14px',
                  }}
                >
                  {staff.avatarText}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '14px' }}>
                    {staff.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    {staff.role}
                  </div>
                  <div style={{ fontSize: '11px', color: '#2563eb', fontWeight: 600 }}>
                    {staff.shift}
                  </div>
                </div>
                {isCurrent && <Check size={18} color="#2563eb" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* API Readiness & Architecture */}
      <div className="table-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Server size={20} color="#2563eb" />
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Backend & API Integration Ready
          </h3>
        </div>
        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '14px' }}>
          This frontend is decoupled and ready to connect to Google Apps Script, REST API, or Google Sheets in the next stage.
        </p>

        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
            <span style={{ fontWeight: 700, color: '#475569' }}>Configuration File:</span>
            <code style={{ fontFamily: 'var(--font-mono)', color: '#2563eb' }}>src/config/api.ts</code>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <span style={{ fontWeight: 700, color: '#475569' }}>API Base URL:</span>
            <code style={{ fontFamily: 'var(--font-mono)', color: '#64748b' }}>
              {API_BASE_URL ? `"${API_BASE_URL}"` : '"" (Mock Frontend Mode)'}
            </code>
          </div>
        </div>
      </div>

      {/* Hospital Quick Extensions */}
      <div className="table-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <PhoneCall size={20} color="#2563eb" />
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Hospital Rapid Escalation Numbers
          </h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <div style={{ padding: '12px', background: '#fee2e2', borderRadius: '8px', color: '#991b1b' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>Emergency Trauma Bay</div>
            <div style={{ fontSize: '18px', fontWeight: 800 }}>Ext. 1100</div>
          </div>
          <div style={{ padding: '12px', background: '#eff6ff', borderRadius: '8px', color: '#1e40af' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>ICU Central Station</div>
            <div style={{ fontSize: '18px', fontWeight: 800 }}>Ext. 2100</div>
          </div>
          <div style={{ padding: '12px', background: '#fffbeb', borderRadius: '8px', color: '#92400e' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>Housekeeping & Sanitization</div>
            <div style={{ fontSize: '18px', fontWeight: 800 }}>Ext. 4040</div>
          </div>
        </div>
      </div>

      {/* Reset Mock Data Action */}
      <div className="table-card" style={{ padding: '24px', borderLeft: '5px solid #d97706' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
              Reset Hospital Mock Data
            </h4>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
              Clears changes saved in browser localStorage and restores original 48 hospital beds and activity history.
            </p>
          </div>

          <button
            type="button"
            onClick={resetToMockData}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              background: '#fef3c7',
              color: '#b45309',
              border: '1.5px solid #fde68a',
              fontSize: '13px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <RotateCcw size={15} />
            <span>Reset to Default Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
