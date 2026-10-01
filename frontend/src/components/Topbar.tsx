import React, { useState } from 'react';
import { Search, Menu, X, ChevronDown, Check, UserCheck } from 'lucide-react';
import { useHospital } from '../context/HospitalContext';

interface TopbarProps {
  onToggleMobileSidebar: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleMobileSidebar }) => {
  const { 
    searchQuery, 
    setSearchQuery, 
    currentStaff, 
    allStaff, 
    switchStaff,
    activePage 
  } = useHospital();

  const [isStaffMenuOpen, setIsStaffMenuOpen] = useState(false);

  // Friendly title based on active page
  const pageTitles: Record<string, { title: string; subtitle: string }> = {
    dashboard: { 
      title: 'Hospital Bed Monitoring System', 
      subtitle: 'Real-time bed availability & department overview' 
    },
    beds: { 
      title: 'Bed Inventory & Status', 
      subtitle: 'Click any bed to view details or change status' 
    },
    wards: { 
      title: 'Ward Overview & Capacity', 
      subtitle: 'Occupancy statistics and ward allocations' 
    },
    patients: { 
      title: 'Patient Bed Assignments', 
      subtitle: 'Manage patient intake and room assignments' 
    },
    reports: { 
      title: 'Hospital Occupancy Reports', 
      subtitle: 'Daily status breakdowns and analytics summary' 
    },
    activity: { 
      title: 'System Activity Log', 
      subtitle: 'Chronological audit trail of all bed status changes' 
    },
    settings: { 
      title: 'System Preferences', 
      subtitle: 'Staff profiles and local workspace configurations' 
    },
  };

  const currentMeta = pageTitles[activePage] || {
    title: 'Hospital Bed Monitoring System',
    subtitle: 'Bed availability dashboard',
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button 
          className="mobile-menu-btn" 
          onClick={onToggleMobileSidebar}
          aria-label="Open Navigation Menu"
        >
          <Menu size={22} />
        </button>
        <div className="topbar-title">
          <h2>{currentMeta.title}</h2>
          <p>{currentMeta.subtitle}</p>
        </div>
      </div>

      <div className="search-box-container">
        <Search className="search-icon-inside" size={18} />
        <input
          type="text"
          className="search-input"
          placeholder="Search bed, ward, room or patient..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search beds, wards, rooms, or patients"
        />
        {searchQuery && (
          <button 
            className="search-clear-btn" 
            onClick={() => setSearchQuery('')}
            title="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="topbar-right">
        {/* User profile dropdown */}
        <div style={{ position: 'relative' }}>
          <button 
            className="profile-card"
            onClick={() => setIsStaffMenuOpen(!isStaffMenuOpen)}
            aria-expanded={isStaffMenuOpen}
            aria-label="Switch Staff Profile"
          >
            <div className="profile-avatar">
              {currentStaff.avatarText}
            </div>
            <div className="profile-info">
              <span className="profile-name">{currentStaff.name}</span>
              <span className="profile-role">{currentStaff.role}</span>
            </div>
            <ChevronDown size={16} color="#64748b" />
          </button>

          {isStaffMenuOpen && (
            <div 
              style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 8px)',
                width: '260px',
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                border: '1px solid #e2e8f0',
                padding: '8px',
                zIndex: 50,
              }}
            >
              <div style={{ padding: '8px 12px 6px', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                Active Hospital Staff
              </div>
              {allStaff.map(staff => (
                <button
                  key={staff.id}
                  onClick={() => {
                    switchStaff(staff.id);
                    setIsStaffMenuOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    textAlign: 'left',
                    backgroundColor: currentStaff.id === staff.id ? '#eff6ff' : 'transparent',
                    color: currentStaff.id === staff.id ? '#1d4ed8' : '#0f172a',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                >
                  <div 
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: currentStaff.id === staff.id ? '#2563eb' : '#94a3b8',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 700,
                    }}
                  >
                    {staff.avatarText}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div>{staff.name}</div>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>{staff.role}</div>
                  </div>
                  {currentStaff.id === staff.id && <Check size={16} color="#2563eb" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
