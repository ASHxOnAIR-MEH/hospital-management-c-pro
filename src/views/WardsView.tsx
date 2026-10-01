import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import { WardSection } from '../components/WardSection';
import { Building2, Search, Filter } from 'lucide-react';

export const WardsView: React.FC = () => {
  const { wards, beds, setSelectedWardFilter, setActivePage } = useHospital();
  const [floorFilter, setFloorFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const floors = ['Floor 1', 'Floor 2', 'Floor 3', 'Floor 4'];

  const filteredWards = wards.filter((ward) => {
    const matchesFloor = floorFilter === 'ALL' || ward.floor === floorFilter;
    const matchesSearch = 
      searchTerm.trim() === '' ||
      ward.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ward.shortCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ward.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFloor && matchesSearch;
  });

  const handleViewWardBeds = (wardId: string) => {
    setSelectedWardFilter(wardId);
    setActivePage('beds');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Bar */}
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          flexWrap: 'wrap',
          gap: '16px',
          background: '#ffffff',
          padding: '20px 24px',
          borderRadius: '16px',
          border: '1px solid #e2e8f0'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div 
            style={{ 
              width: '44px', 
              height: '44px', 
              borderRadius: '12px', 
              background: '#eff6ff', 
              color: '#2563eb', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}
          >
            <Building2 size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Hospital Wards & Clinical Units
            </h2>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0 0' }}>
              Select a ward to view live occupancy or manage assigned beds
            </p>
          </div>
        </div>

        {/* Filter Bar Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '220px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search ward name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              style={{ height: '40px', paddingLeft: '36px', fontSize: '13px' }}
            />
          </div>

          <select
            className="filter-select"
            style={{ height: '40px', fontSize: '13px' }}
            value={floorFilter}
            onChange={(e) => setFloorFilter(e.target.value)}
          >
            <option value="ALL">All Hospital Floors</option>
            {floors.map((floor) => (
              <option key={floor} value={floor}>{floor}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Ward Cards Grid */}
      <div className="ward-grid">
        {filteredWards.map((ward) => (
          <WardSection
            key={ward.id}
            ward={ward}
            beds={beds}
            onViewBeds={handleViewWardBeds}
          />
        ))}
      </div>
    </div>
  );
};
