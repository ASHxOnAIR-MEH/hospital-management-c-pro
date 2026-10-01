export type BedStatus = 'Available' | 'Occupied' | 'Cleaning' | 'Reserved' | 'Maintenance';

export type BedType = 
  | 'Standard Care' 
  | 'ICU Ventilator' 
  | 'Cardiac Monitoring' 
  | 'Isolation / Negative Pressure' 
  | 'Pediatric Crib' 
  | 'Maternity / Delivery' 
  | 'Post-Surgical Recovery';

export interface Bed {
  id: string; // e.g. "ICU-001"
  code: string;
  wardId: string;
  wardName: string;
  floor: string; // e.g. "Floor 1", "Floor 2"
  room: string; // e.g. "Room 101"
  type: BedType;
  status: BedStatus;
  patientId: string | null;
  patientName: string | null;
  lastUpdated: string; // e.g. "10:30 AM"
  lastUpdatedDate: string;
  updatedBy: string; // e.g. "Nurse Jhanvi"
  equipment?: string[];
  notes?: string;
}

export interface Ward {
  id: string;
  name: string;
  shortCode: string;
  floor: string;
  description: string;
  headNurse: string;
  contactExt: string;
}

export interface Patient {
  id: string; // e.g. "PT-9402"
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  bedId: string | null;
  ward: string;
  room: string;
  admissionDate: string;
  status: 'Admitted' | 'Awaiting Bed' | 'Discharged';
  primaryDoctor: string;
  condition: string;
  notes?: string;
}

export interface ActivityLogItem {
  id: string;
  timestamp: string;
  date: string;
  staff: string;
  staffRole: string;
  bed: string;
  action: string;
  previousStatus: BedStatus;
  newStatus: BedStatus;
  patientName?: string;
  notes?: string;
}

export interface StaffProfile {
  id: string;
  name: string;
  role: string;
  department: string;
  shift: string;
  avatarText: string;
}

export type NavigationPage = 
  | 'dashboard' 
  | 'beds' 
  | 'wards' 
  | 'patients' 
  | 'reports' 
  | 'activity' 
  | 'settings';
