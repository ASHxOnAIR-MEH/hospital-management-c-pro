import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import { FilterBar } from '../components/FilterBar';
import { BedGrid } from '../components/BedGrid';
import { BedModal } from '../components/BedModal';
import { PatientAssignModal } from '../components/PatientAssignModal';
import type { Bed, BedStatus } from '../types';
import { Layers, LayoutGrid, PlusCircle, CheckCircle } from 'lucide-react';

export const BedsView: React.FC = () => {
  const {
    beds,
    selectedWardFilter,
    selectedFloorFilter,
    selectedStatusFilter,
    setSelectedStatusFilter,
    searchQuery,
    selectedBedForModal,
    setSelectedBedForModal,
  } = useHospital();

  const [groupByWard, setGroupByWard] = useState(true);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [targetBedForAssign, setTargetBedForAssign] = useState<Bed | null>(null);

  // Status Filter Tabs
  const statusTabs: { status: 'ALL' | BedStatus; label: string; count: number }[] = [
    { status: 'ALL', label: 'All Beds', count: beds.length },
    { status: 'Available', label: 'Available', count: beds.filter(b => b.status === 'Available').length },
    { status: 'Occupied', label: 'Occupied', count: beds.filter(b => b.status === 'Occupied').length },
    { status: 'Cleaning', label: 'Cleaning', count: beds.filter(b => b.status === 'Cleaning').length },
    { status: 'Reserved', label: 'Reserved', count: beds.filter(b => b.status === 'Reserved').length },
    { status: 'Maintenance', label: 'Maintenance', count: beds.filter(b => b.status === 'Maintenance').length },
  ];

  const filteredBeds = beds.filter((bed) => {
    if (selectedWardFilter !== 'ALL' && bed.wardId !== selectedWardFilter) return false;
    if (selectedFloorFilter !== 'ALL' && bed.floor !== selectedFloorFilter) return false;
    if (selectedStatusFilter !== 'ALL' && bed.status !== selectedStatusFilter) return false;
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Quick Status Tabs Strip (Easy 1-tap for tablet nurses & reception) */}
      <div 
        style={{ 
          display: 'flex', 
          gap: '8px', 
          overflowX: 'auto', 
          paddingBottom: '4px',
          alignItems: 'center' 
        }}
      >
        {statusTabs.map((tab) => {
          const isSelected = selectedStatusFilter === tab.status;
          return (
            <button
              key={tab.status}
              type="button"
              onClick={() => setSelectedStatusFilter(tab.status)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 700,
                whiteSpace: 'nowrap',
                backgroundColor: isSelected ? '#0f172a' : '#ffffff',
                color: isSelected ? '#ffffff' : '#475569',
                border: '1.5px solid',
                borderColor: isSelected ? '#0f172a' : '#e2e8f0',
                boxShadow: isSelected ? '0 4px 10px rgba(15, 23, 42, 0.2)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <span>{tab.label}</span>
              <span 
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '2px 7px',
                  borderRadius: '999px',
                  background: isSelected ? 'rgba(255,255,255,0.2)' : '#f1f5f9',
                  color: isSelected ? '#ffffff' : '#0f172a',
                }}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Filter Bar */}
      <FilterBar 
        totalCount={beds.length} 
        filteredCount={filteredBeds.length} 
      />

      {/* Grid Controls Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ fontSize: '14px', color: '#64748b' }}>
          Showing <strong>{filteredBeds.length}</strong> matching hospital beds
        </div>

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
            <LayoutGrid size={14} /> Flat Grid
          </button>
        </div>
      </div>

      {/* Bed Grid Visualization */}
      <BedGrid 
        beds={filteredBeds} 
        onSelectBed={(b) => setSelectedBedForModal(b)} 
        groupByWard={groupByWard} 
      />

      {/* Bed Modal */}
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
