import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { 
  Bed, 
  Ward, 
  Patient, 
  ActivityLogItem, 
  StaffProfile, 
  BedStatus, 
  NavigationPage 
} from '../types';
import { 
  INITIAL_BEDS, 
  WARDS as DEFAULT_WARDS, 
  INITIAL_PATIENTS, 
  INITIAL_ACTIVITY_LOGS, 
  INITIAL_STAFF 
} from '../data/mockData';
import { hospitalApi, ApiError } from '../services/apiService';
import { ERROR_MESSAGES } from '../config/api';

interface ToastInfo {
  id: string;
  type: 'success' | 'info' | 'warning';
  title: string;
  message: string;
}

interface HospitalContextType {
  // Data
  beds: Bed[];
  wards: Ward[];
  patients: Patient[];
  activityLogs: ActivityLogItem[];
  allStaff: StaffProfile[];
  currentStaff: StaffProfile;

  // Status & Connectivity
  isLoading: boolean;
  isActionLoading: boolean;
  apiError: string | null;
  refreshData: () => Promise<void>;
  
  // Navigation & Search
  activePage: NavigationPage;
  setActivePage: (page: NavigationPage) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Filters
  selectedWardFilter: string;
  setSelectedWardFilter: (ward: string) => void;
  selectedFloorFilter: string;
  setSelectedFloorFilter: (floor: string) => void;
  selectedStatusFilter: string;
  setSelectedStatusFilter: (status: string) => void;
  
  // Modal states
  selectedBedForModal: Bed | null;
  setSelectedBedForModal: (bed: Bed | null) => void;
  isAssignModalOpen: boolean;
  setIsAssignModalOpen: (open: boolean) => void;
  preSelectedBedForAssign: Bed | null;
  setPreSelectedBedForAssign: (bed: Bed | null) => void;

  // Actions
  updateBedStatus: (
    bedId: string, 
    newStatus: BedStatus, 
    notes?: string, 
    patientName?: string | null, 
    patientId?: string | null
  ) => Promise<boolean>;
  assignPatientToBed: (patientId: string, bedId: string, notes?: string) => Promise<boolean>;
  dischargePatientFromBed: (bedId: string, autoClean?: boolean) => Promise<boolean>;
  switchStaff: (staffId: string) => void;
  resetToMockData: () => void;
  
  // Notifications
  toasts: ToastInfo[];
  removeToast: (id: string) => void;
  showToast: (type: 'success' | 'info' | 'warning', title: string, message: string) => void;

  // Summary Metrics
  metrics: {
    totalBeds: number;
    available: number;
    occupied: number;
    cleaning: number;
    reserved: number;
    maintenance: number;
    occupancyRate: number;
  };
}

const HospitalContext = createContext<HospitalContextType | undefined>(undefined);

export const HospitalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [beds, setBeds] = useState<Bed[]>(INITIAL_BEDS);
  const [wards, setWards] = useState<Ward[]>(DEFAULT_WARDS);
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>(INITIAL_ACTIVITY_LOGS);
  const [allStaff] = useState<StaffProfile[]>(INITIAL_STAFF);

  const [currentStaffId, setCurrentStaffId] = useState<string>(() => {
    return localStorage.getItem('hbm_current_staff_id') || INITIAL_STAFF[0].id;
  });

  const currentStaff = allStaff.find(s => s.id === currentStaffId) || allStaff[0];

  // Loading & Network Error States
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Navigation & Search
  const [activePage, setActivePage] = useState<NavigationPage>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filters
  const [selectedWardFilter, setSelectedWardFilter] = useState<string>('ALL');
  const [selectedFloorFilter, setSelectedFloorFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');

  // Modals
  const [selectedBedForModal, setSelectedBedForModal] = useState<Bed | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false);
  const [preSelectedBedForAssign, setPreSelectedBedForAssign] = useState<Bed | null>(null);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  const showToast = (type: 'success' | 'info' | 'warning', title: string, message: string) => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Fetch real database data from Google Apps Script / Local API
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const [fetchedBeds, fetchedWards, fetchedPatients, fetchedLogs] = await Promise.all([
        hospitalApi.getBeds(),
        hospitalApi.getWards(),
        hospitalApi.getPatients(),
        hospitalApi.getActivityLogs()
      ]);

      // Merge patient names into beds for rich display
      const patientsMap = new Map<string, string>();
      fetchedPatients.forEach(p => {
        if (p.id) patientsMap.set(p.id, p.name || p.id);
      });

      const enrichedBeds = fetchedBeds.map(b => ({
        ...b,
        patientName: b.patientId ? (patientsMap.get(b.patientId) || b.patientId) : null
      }));

      setBeds(enrichedBeds);
      if (fetchedWards && fetchedWards.length > 0) setWards(fetchedWards);
      if (fetchedPatients) setPatients(fetchedPatients);
      if (fetchedLogs) setActivityLogs(fetchedLogs);
      setApiError(null);
    } catch (err: any) {
      console.error('Failed to load database records:', err);
      const errorMsg = err instanceof ApiError ? err.message : ERROR_MESSAGES.UNABLE_TO_CONNECT;
      setApiError(errorMsg);
      showToast('warning', 'Database Connection Alert', errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Keep selectedBedForModal synced
  useEffect(() => {
    if (selectedBedForModal) {
      const updated = beds.find(b => b.id === selectedBedForModal.id);
      if (updated) setSelectedBedForModal(updated);
    }
  }, [beds]);

  // Status Change API Call
  const updateBedStatus = async (
    bedId: string, 
    newStatus: BedStatus, 
    notes?: string,
    patientName?: string | null,
    patientId?: string | null
  ): Promise<boolean> => {
    const bed = beds.find(b => b.id === bedId);
    if (!bed) {
      showToast('warning', 'Bed Not Found', `Bed ${bedId} was not found in the database.`);
      return false;
    }

    setIsActionLoading(true);
    try {
      const response = await hospitalApi.updateBed({
        bed_id: bedId,
        status: newStatus,
        updated_by: currentStaff.name,
        user_id: currentStaff.id,
        patient_id: patientId !== undefined ? patientId : bed.patientId,
        details: notes || `Status changed from ${bed.status} to ${newStatus}`
      });

      if (!response.success) {
        showToast('warning', 'Update Blocked by Server', response.message || 'Operation failed');
        return false;
      }

      showToast('success', 'Bed Updated in Google Sheets', response.message || `Bed ${bed.code} marked as ${newStatus}`);
      await refreshData();
      return true;
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : ERROR_MESSAGES.UNABLE_TO_CONNECT;
      showToast('warning', 'Database Error', msg);
      return false;
    } finally {
      setIsActionLoading(false);
    }
  };

  // Assign Patient API Call
  const assignPatientToBed = async (patientId: string, bedId: string, notes?: string): Promise<boolean> => {
    setIsActionLoading(true);
    try {
      const response = await hospitalApi.assignPatient({
        patient_id: patientId,
        bed_id: bedId,
        updated_by: currentStaff.name,
        user_id: currentStaff.id,
        details: notes
      });

      if (!response.success) {
        showToast('warning', 'Assignment Rejected', response.message || 'Server rejected assignment');
        return false;
      }

      showToast('success', 'Patient Assigned in Database', response.message || `Patient ${patientId} assigned to ${bedId}`);
      await refreshData();
      return true;
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : ERROR_MESSAGES.UNABLE_TO_CONNECT;
      showToast('warning', 'Database Error', msg);
      return false;
    } finally {
      setIsActionLoading(false);
    }
  };

  // Discharge Patient API Call
  const dischargePatientFromBed = async (bedId: string, autoClean: boolean = true): Promise<boolean> => {
    setIsActionLoading(true);
    try {
      const targetStatus: BedStatus = autoClean ? 'Cleaning' : 'Available';
      const response = await hospitalApi.dischargePatient({
        bed_id: bedId,
        target_bed_status: targetStatus,
        updated_by: currentStaff.name,
        user_id: currentStaff.id,
        details: `Discharged by ${currentStaff.name}; placed in ${targetStatus}`
      });

      if (!response.success) {
        showToast('warning', 'Discharge Failed', response.message || 'Server rejected discharge');
        return false;
      }

      showToast('info', 'Patient Discharged', response.message || `Bed ${bedId} queued for ${targetStatus}`);
      await refreshData();
      return true;
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : ERROR_MESSAGES.UNABLE_TO_CONNECT;
      showToast('warning', 'Database Error', msg);
      return false;
    } finally {
      setIsActionLoading(false);
    }
  };

  const switchStaff = (staffId: string) => {
    const selected = allStaff.find(s => s.id === staffId);
    if (selected) {
      setCurrentStaffId(selected.id);
      localStorage.setItem('hbm_current_staff_id', selected.id);
      showToast('info', 'Staff Switched', `Active staff: ${selected.name} (${selected.role})`);
    }
  };

  const resetToMockData = async () => {
    refreshData();
    showToast('info', 'Database Synced', 'Refreshed records directly from backend database.');
  };

  // Calculate live metrics
  const totalBeds = beds.length;
  const available = beds.filter(b => b.status === 'Available').length;
  const occupied = beds.filter(b => b.status === 'Occupied').length;
  const cleaning = beds.filter(b => b.status === 'Cleaning').length;
  const reserved = beds.filter(b => b.status === 'Reserved').length;
  const maintenance = beds.filter(b => b.status === 'Maintenance').length;
  const occupancyRate = totalBeds > 0 ? Math.round((occupied / totalBeds) * 100) : 0;

  return (
    <HospitalContext.Provider
      value={{
        beds,
        wards,
        patients,
        activityLogs,
        allStaff,
        currentStaff,
        isLoading,
        isActionLoading,
        apiError,
        refreshData,
        activePage,
        setActivePage,
        searchQuery,
        setSearchQuery,
        selectedWardFilter,
        setSelectedWardFilter,
        selectedFloorFilter,
        setSelectedFloorFilter,
        selectedStatusFilter,
        setSelectedStatusFilter,
        selectedBedForModal,
        setSelectedBedForModal,
        isAssignModalOpen,
        setIsAssignModalOpen,
        preSelectedBedForAssign,
        setPreSelectedBedForAssign,
        updateBedStatus,
        assignPatientToBed,
        dischargePatientFromBed,
        switchStaff,
        resetToMockData,
        toasts,
        removeToast,
        showToast,
        metrics: {
          totalBeds,
          available,
          occupied,
          cleaning,
          reserved,
          maintenance,
          occupancyRate,
        },
      }}
    >
      {children}
    </HospitalContext.Provider>
  );
};

export const useHospital = () => {
  const context = useContext(HospitalContext);
  if (!context) {
    throw new Error('useHospital must be used within a HospitalProvider');
  }
  return context;
};
