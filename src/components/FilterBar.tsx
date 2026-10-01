import React from 'react';
import { useHospital } from '../context/HospitalContext';
import { RotateCcw, Filter, Building, Layers, Activity } from 'lucide-react';
import type { BedStatus } from '../types';

interface FilterBarProps {
  totalCount: number;
  filteredCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({ totalCount, filteredCount }) => {
  const {
    wards,
    selectedWardFilter,
    setSelectedWardFilter,
    selectedFloorFilter,
    setSelectedFloorFilter,
    selectedStatusFilter,
    setSelectedStatusFilter,
    searchQuery,
    setSearchQuery,
  } = useHospital();

  // Extract unique floors
  const floors = ['Floor 1', 'Floor 2', 'Floor 3', 'Floor 4'];
  const statuses: BedStatus[] = ['Available', 'Occupied', 'Cleaning', 'Reserved', 'Maintenance'];

  const hasActiveFilters = 
    selectedWardFilter !== 'ALL' || 
    selectedFloorFilter !== 'ALL' || 
    selectedStatusFilter !== 'ALL' || 
    searchQuery.trim() !== '';

  const handleReset = () => {
    setSelectedWardFilter('ALL');
    setSelectedFloorFilter('ALL');
    setSelectedStatusFilter('ALL');
    setSearchQuery('');
  };

  return (
    <div className="filter-bar-card">
      <div className="filter-group-cluster">
        {/* Ward Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="filter-label-tag">
            <Building size={16} /> Ward:
          </span>
          <select
            className="filter-select"
            value={selectedWardFilter}
            onChange={(e) => setSelectedWardFilter(e.target.value)}
            aria-label="Filter by Ward"
          >
            <option value="ALL">All Wards</option>
            {wards.map((ward) => (
              <option key={ward.id} value={ward.id}>
                {ward.name} ({ward.floor})
              </option>
            ))}
          </select>
        </div>

        {/* Floor Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="filter-label-tag">
            <Layers size={16} /> Floor:
          </span>
          <select
            className="filter-select"
            value={selectedFloorFilter}
            onChange={(e) => setSelectedFloorFilter(e.target.value)}
            aria-label="Filter by Floor"
          >
            <option value="ALL">All Floors</option>
            {floors.map((floor) => (
              <option key={floor} value={floor}>
                {floor}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="filter-label-tag">
            <Activity size={16} /> Status:
          </span>
          <select
            className="filter-select"
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            aria-label="Filter by Status"
          >
            <option value="ALL">All Status</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button 
            className="filter-reset-btn" 
            onClick={handleReset}
            title="Reset all filters"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        )}
      </div>

      <div className="results-count-pill">
        Showing <strong>{filteredCount}</strong> of <strong>{totalCount}</strong> beds
      </div>
    </div>
  );
};
