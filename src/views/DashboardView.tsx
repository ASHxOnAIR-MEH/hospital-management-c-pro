import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import { StatCard } from '../components/StatCard';
import { FilterBar } from '../components/FilterBar';
import { BedGrid } from '../components/BedGrid';
import { BedModal } from '../components/BedModal';
import { PatientAssignModal } from '../components/PatientAssignModal';
import { 
  BedDouble, 
  CheckCircle, 
  UserCheck, 
  Sparkles, 
  CalendarCheck, 
  Wrench,
  AlertTriangle,
  ArrowRight,
  LayoutGrid,
  Layers
} from 'lucide-react';
import type { Bed } from '../types';

export const DashboardView: React.FC = () => {
  const {
    beds,
    metrics,
    selectedWardFilter,
    selectedFloorFilter,
    selectedStatusFilter,
    setSelectedStatusFilter,
    searchQuery,
    selectedBedForModal,
    setSelectedBedForModal,
    setActivePage,
  } = useHospital();

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [targetBedForAssign, setTargetBedForAssign] = useState<Bed | null>(null);
  const [groupByWard, setGroupByWard] = useState(true);

  // Filter beds according to filters and search
  const filteredBeds = beds.filter((bed) => {
    // Ward filter
    if (selectedWardFilter !== 'ALL' && bed.wardId !== selectedWardFilter) {
      return false;
    }
    // Floor filter
    if (selectedFloorFilter !== 'ALL' && bed.floor !== selectedFloorFilter) {
      return false;
    }
    // Status filter
    if (selectedStatusFilter !== 'ALL' && bed.status !== selectedStatusFilter) {
      return false;
    }
    // Search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchCode = bed.code.toLowerCase().includes(q);
      const matchRoom = bed.room.toLowerCase().includes(q);
      const matchWard = bed.wardName.toLowerCase().includes(q);
      const matchType = bed.type.toLowerCase().includes(q);
      const matchPatient = bed.patientName ? bed.patientName.toLowerCase().includes(q) : false;
      const matchPatientId = bed.patientId ? bed.patientId.toLowerCase().includes(q) : false;
      return matchCode || matchRoom || matchWard || matchType || matchPatient || matchPatientId;
    }
    return true;
  });

  const handleOpenAssignModal = (bed: Bed) => {
    setTargetBedForAssign(bed);
    setIsAssignModalOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner / Rapid Notice */}
      <div 
        style={{ 
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', 
          borderRadius: '16px', 
          padding: '24px 28px', 
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 10px 25px rgba(37, 99, 235, 0.25)',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div style={{ maxWidth: '640px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 700, marginBottom: '10px' }}>
            <span>🏥 Hospital Live Status</span>
            <span>•</span>
            <span>Occupancy {metrics.occupancyRate}%</span>
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            {metrics.available} Beds Currently Available
          </h2>
          <p style={{ fontSize: '14px', opacity: 0.9, margin: 0, lineHeight: 1.4 }}>
            Click on any bed below to quickly update status, assign an incoming patient, or request sanitation cleaning.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setActivePage('wards')}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: '#ffffff',
              padding: '12px 18px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>Ward Directory</span>
            <ArrowRight size={14} />
          </button>
          <button
            type="button"
            onClick={() => setActivePage('patients')}
            style={{
              background: '#ffffff',
              color: '#1d4ed8',
              padding: '12px 20px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 800,
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)'
            }}
          >
            Manage Patients
          </button>
        </div>
      </div>

      {/* Large Summary Stat Cards (User Prompt Requirement) */}
      <section aria-label="Bed Summary Statistics">
        <div className="stat-cards-grid">
          <StatCard
            label="Total Beds"
            value={metrics.totalBeds}
            type="total"
            icon={<BedDouble size={18} />}
            isActiveFilter={selectedStatusFilter === 'ALL'}
            onClick={() => setSelectedStatusFilter('ALL')}
          />
          <StatCard
            label="Available"
            value={metrics.available}
            total={metrics.totalBeds}
            type="available"
            icon={<CheckCircle size={18} />}
            isActiveFilter={selectedStatusFilter === 'Available'}
            onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'Available' ? 'ALL' : 'Available')}
          />
          <StatCard
            label="Occupied"
            value={metrics.occupied}
            total={metrics.totalBeds}
            type="occupied"
            icon={<UserCheck size={18} />}
            isActiveFilter={selectedStatusFilter === 'Occupied'}
            onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'Occupied' ? 'ALL' : 'Occupied')}
          />
          <StatCard
            label="Cleaning"
            value={metrics.cleaning}
            total={metrics.totalBeds}
            type="cleaning"
            icon={<Sparkles size={18} />}
            isActiveFilter={selectedStatusFilter === 'Cleaning'}
            onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'Cleaning' ? 'ALL' : 'Cleaning')}
          />
          <StatCard
            label="Reserved"
            value={metrics.reserved}
            total={metrics.totalBeds}
            type="reserved"
            icon={<CalendarCheck size={18} />}
            isActiveFilter={selectedStatusFilter === 'Reserved'}
            onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'Reserved' ? 'ALL' : 'Reserved')}
          />
          <StatCard
            label="Maintenance"
            value={metrics.maintenance}
            total={metrics.totalBeds}
            type="maintenance"
            icon={<Wrench size={18} />}
            isActiveFilter={selectedStatusFilter === 'Maintenance'}
            onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'Maintenance' ? 'ALL' : 'Maintenance')}
          />
        </div>
      </section>

      {/* Notification Strip if beds are in cleaning or maintenance */}
      {(metrics.cleaning > 0 || metrics.maintenance > 0) && (
        <div 
          style={{
            background: '#fffbeb',
            border: '1.5px solid #fde68a',
            borderRadius: '12px',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={18} color="#d97706" />
            <span style={{ fontSize: '13px', color: '#92400e', fontWeight: 600 }}>
              Staff Notice: <strong>{metrics.cleaning} beds</strong> currently awaiting housekeeping sanitization, and <strong>{metrics.maintenance} bed</strong> under maintenance.
            </span>
          </div>

          <button
            type="button"
            onClick={() => setSelectedStatusFilter('Cleaning')}
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#b45309',
              background: '#fef3c7',
              padding: '6px 12px',
              borderRadius: '6px'
            }}
          >
            Show Cleaning Beds →
          </button>
        </div>
      )}

      {/* Filter Bar with Ward, Floor, Status, Search */}
      <FilterBar 
        totalCount={beds.length} 
        filteredCount={filteredBeds.length} 
      />

      {/* Bed Visualization Section */}
      <section aria-label="Hospital Beds">
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            marginBottom: '16px' 
          }}
        >
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
              Bed Availability Map
            </h3>
            <span style={{ fontSize: '13px', color: '#64748b' }}>
              Tap on any bed card to inspect or change status
            </span>
          </div>

          {/* Grouping switcher */}
          <div style={{ display: 'flex', gap: '6px', background: '#f1f5f9', padding: '3px', borderRadius: '8px' }}>
            <button
              type="button"
              onClick={() => setGroupByWard(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                background: groupByWard ? '#ffffff' : 'transparent',
                color: groupByWard ? '#0f172a' : '#64748b',
                boxShadow: groupByWard ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              <Layers size={14} /> Group by Ward
            </button>
            <button
              type="button"
              onClick={() => setGroupByWard(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                background: !groupByWard ? '#ffffff' : 'transparent',
                color: !groupByWard ? '#0f172a' : '#64748b',
                boxShadow: !groupByWard ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              <LayoutGrid size={14} /> All Beds Grid
            </button>
          </div>
        </div>

        {/* The Bed Grid */}
        <BedGrid
          beds={filteredBeds}
          onSelectBed={(bed) => setSelectedBedForModal(bed)}
          groupByWard={groupByWard}
        />
      </section>

      {/* Bed Details Modal */}
      {selectedBedForModal && (
        <BedModal
          bed={selectedBedForModal}
          onClose={() => setSelectedBedForModal(null)}
          onOpenAssignModal={handleOpenAssignModal}
        />
      )}

      {/* Patient Assignment Modal */}
      {isAssignModalOpen && (
        <PatientAssignModal
          isOpen={isAssignModalOpen}
          targetBed={targetBedForAssign}
          onClose={() => {
            setIsAssignModalOpen(false);
            setTargetBedForAssign(null);
          }}
        />
      )}
    </div>
  );
};
