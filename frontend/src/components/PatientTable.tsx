import React, { useState } from 'react';
import type { Patient } from '../types';
import { Users, BedDouble, UserPlus, LogOut, Search } from 'lucide-react';

interface PatientTableProps {
  patients: Patient[];
  onAssignBedClick: (patient: Patient) => void;
  onDischargeClick: (bedId: string) => void;
}

export const PatientTable: React.FC<PatientTableProps> = ({
  patients,
  onAssignBedClick,
  onDischargeClick,
}) => {
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Admitted' | 'Awaiting Bed' | 'Discharged'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPatients = patients.filter((patient) => {
    const matchesStatus = statusFilter === 'ALL' || patient.status === statusFilter;
    const matchesSearch = 
      searchTerm.trim() === '' ||
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.bedId && patient.bedId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      patient.ward.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="table-card">
      <div className="table-header-bar">
        <div className="table-title">
          <Users size={20} color="#2563eb" />
          <span>Patient Bed Assignments ({filteredPatients.length} records)</span>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative', width: '220px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search patient or bed..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              style={{ height: '36px', paddingLeft: '32px', fontSize: '13px' }}
            />
          </div>

          {/* Status Tabs */}
          <select
            className="filter-select"
            style={{ height: '36px', fontSize: '13px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            aria-label="Filter patients by status"
          >
            <option value="ALL">All Patients</option>
            <option value="Admitted">Admitted (Has Bed)</option>
            <option value="Awaiting Bed">Awaiting Bed</option>
            <option value="Discharged">Discharged</option>
          </select>
        </div>
      </div>

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Patient ID</th>
              <th>Patient Name</th>
              <th>Bed ID</th>
              <th>Ward</th>
              <th>Room</th>
              <th>Admission Date</th>
              <th>Status</th>
              <th>Quick Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                  No patients found matching the selected filter.
                </td>
              </tr>
            ) : (
              filteredPatients.map((patient) => (
                <tr key={patient.id}>
                  {/* Patient ID */}
                  <td>
                    <span 
                      style={{ 
                        fontFamily: 'var(--font-mono)', 
                        fontWeight: 700, 
                        color: '#0f172a',
                        background: '#f1f5f9',
                        padding: '4px 8px',
                        borderRadius: '6px'
                      }}
                    >
                      {patient.id}
                    </span>
                  </td>

                  {/* Patient Name */}
                  <td>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{patient.name}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        {patient.gender}, {patient.age} yrs • {patient.condition}
                      </div>
                    </div>
                  </td>

                  {/* Bed ID */}
                  <td>
                    {patient.bedId ? (
                      <span 
                        style={{ 
                          fontFamily: 'var(--font-sans)', 
                          fontWeight: 800, 
                          color: '#2563eb',
                          background: '#eff6ff',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <BedDouble size={14} />
                        {patient.bedId}
                      </span>
                    ) : (
                      <span style={{ fontSize: '13px', color: '#dc2626', fontWeight: 600 }}>
                        ⚠️ No Bed Assigned
                      </span>
                    )}
                  </td>

                  {/* Ward */}
                  <td style={{ fontWeight: 600 }}>{patient.ward}</td>

                  {/* Room */}
                  <td style={{ color: '#475569' }}>{patient.room}</td>

                  {/* Admission Date */}
                  <td style={{ color: '#475569' }}>{patient.admissionDate}</td>

                  {/* Status */}
                  <td>
                    <span 
                      style={{
                        padding: '4px 10px',
                        borderRadius: '999px',
                        fontSize: '11px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        background: 
                          patient.status === 'Admitted' ? '#ecfdf5' : 
                          patient.status === 'Awaiting Bed' ? '#fffbeb' : '#f1f5f9',
                        color: 
                          patient.status === 'Admitted' ? '#166534' : 
                          patient.status === 'Awaiting Bed' ? '#854d0e' : '#475569',
                      }}
                    >
                      {patient.status}
                    </span>
                  </td>

                  {/* Action */}
                  <td>
                    {patient.bedId ? (
                      <button
                        type="button"
                        onClick={() => onDischargeClick(patient.bedId!)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '12px',
                          fontWeight: 700,
                          color: '#b91c1c',
                          background: '#fee2e2',
                          padding: '6px 12px',
                          borderRadius: '6px',
                        }}
                        title={`Discharge from ${patient.bedId}`}
                      >
                        <LogOut size={13} />
                        <span>Discharge</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onAssignBedClick(patient)}
                        className="btn-primary"
                        style={{
                          height: '32px',
                          padding: '0 12px',
                          fontSize: '12px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <UserPlus size={13} />
                        <span>Assign Bed</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
