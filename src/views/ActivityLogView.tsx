import React from 'react';
import { useHospital } from '../context/HospitalContext';
import { ActivityTable } from '../components/ActivityTable';

export const ActivityLogView: React.FC = () => {
  const { activityLogs } = useHospital();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <ActivityTable logs={activityLogs} />
    </div>
  );
};
