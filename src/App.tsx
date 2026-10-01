import React, { useState } from 'react';
import { HospitalProvider, useHospital } from './context/HospitalContext';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { ToastNotification } from './components/ToastNotification';
import { DashboardView } from './views/DashboardView';
import { BedsView } from './views/BedsView';
import { WardsView } from './views/WardsView';
import { PatientsView } from './views/PatientsView';
import { ReportsView } from './views/ReportsView';
import { ActivityLogView } from './views/ActivityLogView';
import { SettingsView } from './views/SettingsView';
import { AlertTriangle, RotateCcw, Loader2 } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activePage, apiError, refreshData, isLoading, isActionLoading } = useHospital();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const renderActiveView = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardView />;
      case 'beds':
        return <BedsView />;
      case 'wards':
        return <WardsView />;
      case 'patients':
        return <PatientsView />;
      case 'reports':
        return <ReportsView />;
      case 'activity':
        return <ActivityLogView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar 
        isMobileOpen={isMobileNavOpen} 
        onCloseMobile={() => setIsMobileNavOpen(false)} 
      />

      <div className="main-wrapper">
        <Topbar 
          onToggleMobileSidebar={() => setIsMobileNavOpen(!isMobileNavOpen)} 
        />

        {/* Global Loading Bar */}
        {(isLoading || isActionLoading) && (
          <div 
            style={{
              height: '3px',
              width: '100%',
              backgroundColor: '#e2e8f0',
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            <div 
              style={{
                height: '100%',
                backgroundColor: '#2563eb',
                width: '50%',
                position: 'absolute',
                animation: 'indeterminate 1.2s infinite linear'
              }}
            />
          </div>
        )}

        {/* API Error Banner (Prompt Requirement) */}
        {apiError && (
          <div 
            style={{
              margin: '16px 32px 0',
              padding: '16px 20px',
              backgroundColor: '#fee2e2',
              border: '2px solid #ef4444',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              color: '#991b1b',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)'
            }}
            role="alert"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AlertTriangle size={24} color="#dc2626" style={{ flexShrink: 0 }} />
              <div>
                <strong style={{ fontSize: '15px', display: 'block' }}>Database Connection Error</strong>
                <span style={{ fontSize: '13px' }}>{apiError}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => refreshData()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                backgroundColor: '#dc2626',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '13px',
                whiteSpace: 'nowrap'
              }}
            >
              <RotateCcw size={14} />
              <span>Retry Connection</span>
            </button>
          </div>
        )}

        <main className="content-scrollable">
          {renderActiveView()}
        </main>
      </div>

      <ToastNotification />
    </div>
  );
};

export function App() {
  return (
    <HospitalProvider>
      <MainLayout />
    </HospitalProvider>
  );
}

export default App;
