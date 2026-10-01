import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import { PatientTable } from '../components/PatientTable';
import { PatientAssignModal } from '../components/PatientAssignModal';
import { ConfirmationModal } from '../components/ConfirmationModal';
import type { Patient } from '../types';
import { Users, UserCheck, Clock, UserPlus } from 'lucide-react';

export const PatientsView: React.FC = () => {
  const { patients, dischargePatientFromBed, beds } = useHospital();

  const [selectedPatientForAssign, setSelectedPatientForAssign] = useState<Patient | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [bedIdToDischarge, setBedIdToDischarge] = useState<string | null>(null);

  const totalPatients = patients.length;
  const admittedPatients = patients.filter(p => p.status === 'Admitted').length;
  const awaitingPatients = patients.filter(p => p.status === 'Awaiting Bed').length;
  const dischargedPatients = patients.filter(p => p.status === 'Discharged').length;

  const handleAssignClick = (patient: Patient) => {
    setSelectedPatientForAssign(patient);
    setIsAssignModalOpen(true);
  };

  const handleDischargePrompt = (bedId: string) => {
    setBedIdToDischarge(bedId);
  };

  const handleConfirmDischarge = () => {
    if (bedIdToDischarge) {
      dischargePatientFromBed(bedIdToDischarge, true);
      setBedIdToDischarge(null);
    }
  };

  const bedToDischargeObj = bedIdToDischarge ? beds.find(b => b.id === bedIdToDischarge) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Summary KPI Strip */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}
      >
        <div className="stat-card total" style={{ padding: '16px 20px' }}>
          <div className="stat-card-header">
            <span className="stat-card-label">Total Registered</span>
            <Users size={16} />
          </div>
          <div className="stat-card-value" style={{ fontSize: '28px' }}>{totalPatients}</div>
          <div className="stat-card-subtext">Active patient intake list</div>
        </div>

        <div className="stat-card occupied" style={{ padding: '16px 20px' }}>
          <div className="stat-card-header">
            <span className="stat-card-label">In Beds (Admitted)</span>
            <UserCheck size={16} />
          </div>
          <div className="stat-card-value" style={{ fontSize: '28px' }}>{admittedPatients}</div>
          <div className="stat-card-subtext">Currently assigned to beds</div>
        </div>

        <div className="stat-card cleaning" style={{ padding: '16px 20px' }}>
          <div className="stat-card-header">
            <span className="stat-card-label">Awaiting Bed</span>
            <Clock size={16} />
          </div>
          <div className="stat-card-value" style={{ fontSize: '28px' }}>{awaitingPatients}</div>
          <div className="stat-card-subtext">Waiting in triage / transfer</div>
        </div>

        <div className="stat-card available" style={{ padding: '16px 20px' }}>
          <div className="stat-card-header">
            <span className="stat-card-label">Discharged Today</span>
            <UserCheck size={16} />
          </div>
          <div className="stat-card-value" style={{ fontSize: '28px' }}>{dischargedPatients}</div>
          <div className="stat-card-subtext">Beds released for cleaning</div>
        </div>
      </div>

      {/* Patient Assignment Table */}
      <PatientTable
        patients={patients}
        onAssignBedClick={handleAssignClick}
        onDischargeClick={handleDischargePrompt}
      />

      {/* Assign Patient Modal */}
      {isAssignModalOpen && (
        <PatientAssignModal
          isOpen={isAssignModalOpen}
          targetPatient={selectedPatientForAssign}
          onClose={() => {
            setIsAssignModalOpen(false);
            setSelectedPatientForAssign(null);
          }}
        />
      )}

      {/* Safety Discharge Confirmation Modal */}
      {bedIdToDischarge && (
        <ConfirmationModal
          isOpen={true}
          title="Confirm Patient Discharge"
          message={`Are you sure you want to discharge ${bedToDischargeObj?.patientName || 'patient'} from ${bedToDischargeObj?.code}? The bed will be placed in Cleaning status for sanitation.`}
          confirmLabel="Yes, Discharge & Mark Cleaning"
          cancelLabel="Cancel"
          isDestructive={true}
          onConfirm={handleConfirmDischarge}
          onCancel={() => setBedIdToDischarge(null)}
        />
      )}
    </div>
  );
};
