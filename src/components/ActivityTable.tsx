import React, { useState } from 'react';
import type { ActivityLogItem } from '../types';
import { ArrowRight, Clock, History } from 'lucide-react';

interface ActivityTableProps {
  logs: ActivityLogItem[];
}

export const ActivityTable: React.FC<ActivityTableProps> = ({ logs }) => {
  const [filterStaff, setFilterStaff] = useState('ALL');
  const [filterBed, setFilterBed] = useState('ALL');

  // Extract unique staff members and beds for filtering
  const staffList = Array.from(new Set(logs.map(l => l.staff)));
  const bedList = Array.from(new Set(logs.map(l => l.bed)));

  const filteredLogs = logs.filter(log => {
    const matchesStaff = filterStaff === 'ALL' || log.staff === filterStaff;
    const matchesBed = filterBed === 'ALL' || log.bed === filterBed;
    return matchesStaff && matchesBed;
  });

  return (
    <div className="table-card">
      <div className="table-header-bar">
        <div className="table-title">
          <History size={20} color="#2563eb" />
          <span>Real-time Activity Log ({filteredLogs.length} events)</span>
        </div>

        {/* Filter controls */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select
            className="filter-select"
            style={{ height: '36px', fontSize: '13px' }}
            value={filterStaff}
            onChange={(e) => setFilterStaff(e.target.value)}
            aria-label="Filter logs by staff"
          >
            <option value="ALL">All Staff</option>
            {staffList.map(staff => (
              <option key={staff} value={staff}>{staff}</option>
            ))}
          </select>

          <select
            className="filter-select"
            style={{ height: '36px', fontSize: '13px' }}
            value={filterBed}
            onChange={(e) => setFilterBed(e.target.value)}
            aria-label="Filter logs by bed"
          >
            <option value="ALL">All Beds</option>
            {bedList.map(bed => (
              <option key={bed} value={bed}>{bed}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Staff Member</th>
              <th>Bed</th>
              <th>Action</th>
              <th>Previous Status</th>
              <th>New Status</th>
              <th>Details & Notes</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                  No activity log entries match the selected filters.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id}>
                  {/* Time */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                      <Clock size={13} color="#64748b" />
                      <span>{log.timestamp}</span>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>({log.date})</span>
                    </div>
                  </td>

                  {/* Staff */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '50%',
                          background: '#eff6ff',
                          color: '#2563eb',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: 700
                        }}
                      >
                        {log.staff.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{log.staff}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{log.staffRole}</div>
                      </div>
                    </div>
                  </td>

                  {/* Bed */}
                  <td>
                    <span
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontWeight: 800,
                        color: '#0f172a',
                        background: '#f1f5f9',
                        padding: '4px 8px',
                        borderRadius: '6px'
                      }}
                    >
                      {log.bed}
                    </span>
                  </td>

                  {/* Action */}
                  <td>
                    <span style={{ fontWeight: 600, color: '#334155' }}>
                      {log.action}
                    </span>
                  </td>

                  {/* Previous Status */}
                  <td>
                    <span className={`mini-badge ${log.previousStatus}`}>
                      {log.previousStatus}
                    </span>
                  </td>

                  {/* New Status */}
                  <td>
                    <div className="status-transition-pill">
                      <ArrowRight size={14} color="#94a3b8" />
                      <span className={`mini-badge ${log.newStatus}`}>
                        {log.newStatus}
                      </span>
                    </div>
                  </td>

                  {/* Notes & Details */}
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {log.patientName && (
                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e40af' }}>
                          Patient: {log.patientName}
                        </div>
                      )}
                      <span style={{ fontSize: '12px', color: '#64748b' }}>
                        {log.notes || '—'}
                      </span>
                    </div>
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
