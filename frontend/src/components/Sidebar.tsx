import React from 'react';
import { 
  LayoutDashboard, 
  BedDouble, 
  Building2, 
  Users, 
  FileBarChart2, 
  History, 
  Settings, 
  Activity,
  X
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import type { NavigationPage } from '../types';

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const { activePage, setActivePage, metrics, patients } = useHospital();

  const awaitingCount = patients.filter(p => p.status === 'Awaiting Bed').length;

  const navItems: { id: NavigationPage; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
    },
    {
      id: 'beds',
      label: 'Beds',
      icon: <BedDouble size={20} />,
      badge: metrics.totalBeds,
    },
    {
      id: 'wards',
      label: 'Wards',
      icon: <Building2 size={20} />,
    },
    {
      id: 'patients',
      label: 'Patients',
      icon: <Users size={20} />,
      badge: awaitingCount > 0 ? `${awaitingCount} wait` : undefined,
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: <FileBarChart2 size={20} />,
    },
    {
      id: 'activity',
      label: 'Activity Log',
      icon: <History size={20} />,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings size={20} />,
    },
  ];

  const handleSelectPage = (page: NavigationPage) => {
    setActivePage(page);
    onCloseMobile();
  };

  return (
    <>
      {isMobileOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}
      <aside className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="hospital-logo-badge" title="Hospital Bed Monitor">
            🏥
          </div>
          <div className="brand-text">
            <h1>Bed Monitor</h1>
            <span>Hospital Operations</span>
          </div>
          {isMobileOpen && (
            <button 
              className="modal-close-btn" 
              style={{ marginLeft: 'auto', background: 'transparent', color: '#fff' }}
              onClick={onCloseMobile}
              aria-label="Close Menu"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <nav className="sidebar-nav" aria-label="Main Navigation">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleSelectPage(item.id)}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="nav-badge">{item.badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="system-status-indicator">
            <span className="live-pulse" />
            <div>
              <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '13px' }}>Live Monitoring</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Real-time Ward Sync</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
