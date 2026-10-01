/**
 * apiService.ts - Hospital Bed Monitoring System
 * 
 * Central API communication layer connecting React Frontend to Google Apps Script.
 * The frontend NEVER accesses Google Sheets directly; all requests flow through this client.
 */

import { API_BASE_URL, ERROR_MESSAGES } from '../config/api';
import type { Bed, Ward, Patient, ActivityLogItem, BedStatus } from '../types';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
}

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Universal GET dispatcher compatible with both Google Apps Script Web App URLs
 * and local REST / API endpoints.
 */
async function apiGet<T = any>(endpoint: string): Promise<ApiResponse<T>> {
  const isGoogleAppsScript = API_BASE_URL.includes('script.google.com');

  let url: string;
  if (!API_BASE_URL || API_BASE_URL.trim() === '') {
    throw new ApiError(ERROR_MESSAGES.UNABLE_TO_CONNECT);
  }

  if (isGoogleAppsScript) {
    // Google Apps Script query param routing: ?action=beds
    const sep = API_BASE_URL.includes('?') ? '&' : '?';
    url = `${API_BASE_URL}${sep}action=${encodeURIComponent(endpoint)}`;
  } else {
    // Standard endpoint: /api/beds or ?action=beds
    const cleanBase = API_BASE_URL.replace(/\/+$/, '');
    const cleanEndpoint = endpoint.replace(/^\/+/, '');
    url = `${cleanBase}/${cleanEndpoint}`;
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: ApiResponse<T> = await response.json();
    return data;
  } catch (err: any) {
    console.error(`API GET [${endpoint}] failed:`, err);
    throw new ApiError(ERROR_MESSAGES.UNABLE_TO_CONNECT);
  }
}

/**
 * Universal POST dispatcher.
 * For Google Apps Script, sends Content-Type: text/plain to prevent CORS preflight OPTIONS blocks.
 */
async function apiPost<T = any>(endpoint: string, payload: any): Promise<ApiResponse<T>> {
  const isGoogleAppsScript = API_BASE_URL.includes('script.google.com');

  if (!API_BASE_URL || API_BASE_URL.trim() === '') {
    throw new ApiError(ERROR_MESSAGES.UNABLE_TO_CONNECT);
  }

  let url: string;
  const bodyPayload = {
    action: endpoint.replace(/^\/+/, ''),
    ...payload,
  };

  if (isGoogleAppsScript) {
    const sep = API_BASE_URL.includes('?') ? '&' : '?';
    url = `${API_BASE_URL}${sep}action=${encodeURIComponent(endpoint)}`;
  } else {
    const cleanBase = API_BASE_URL.replace(/\/+$/, '');
    const cleanEndpoint = endpoint.replace(/^\/+/, '');
    url = `${cleanBase}/${cleanEndpoint}`;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      // text/plain prevents browser CORS preflight (OPTIONS) on Google Apps Script Web Apps
      headers: isGoogleAppsScript 
        ? { 'Content-Type': 'text/plain;charset=utf-8' }
        : { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyPayload),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: ApiResponse<T> = await response.json();
    return data;
  } catch (err: any) {
    console.error(`API POST [${endpoint}] failed:`, err);
    throw new ApiError(ERROR_MESSAGES.UNABLE_TO_CONNECT);
  }
}

export const hospitalApi = {
  /**
   * GET /beds
   */
  async getBeds(): Promise<Bed[]> {
    const res = await apiGet<any[]>('beds');
    if (!res.success || !res.data) {
      throw new ApiError(res.message || ERROR_MESSAGES.UNABLE_TO_CONNECT);
    }
    // Map sheet columns to frontend Bed model
    return res.data.map((b: any) => ({
      id: b.bed_id,
      code: b.bed_id,
      wardId: b.ward_id,
      wardName: b.ward_name,
      floor: b.floor ? (b.floor.toString().startsWith('Floor') ? b.floor : `Floor ${b.floor}`) : 'Floor 1',
      room: b.room || '',
      type: b.bed_type || 'Standard Care',
      status: b.status as BedStatus,
      patientId: b.patient_id === '-' || !b.patient_id ? null : b.patient_id,
      patientName: null, // Joined from patients if available
      lastUpdated: b.last_updated || 'Just now',
      lastUpdatedDate: 'Today',
      updatedBy: b.updated_by || 'Staff',
      notes: b.details || '',
    }));
  },

  /**
   * GET /wards
   */
  async getWards(): Promise<Ward[]> {
    const res = await apiGet<any[]>('wards');
    if (!res.success || !res.data) {
      throw new ApiError(res.message || ERROR_MESSAGES.UNABLE_TO_CONNECT);
    }
    return res.data.map((w: any) => ({
      id: w.ward_id,
      name: w.ward_name,
      shortCode: w.ward_id,
      floor: w.floor ? (w.floor.toString().startsWith('Floor') ? w.floor : `Floor ${w.floor}`) : 'Floor 1',
      description: `${w.ward_name} department located on ${w.floor}`,
      headNurse: 'Charge Nurse',
      contactExt: '1000',
    }));
  },

  /**
   * GET /patients
   */
  async getPatients(): Promise<Patient[]> {
    const res = await apiGet<any[]>('patients');
    if (!res.success || !res.data) {
      throw new ApiError(res.message || ERROR_MESSAGES.UNABLE_TO_CONNECT);
    }
    return res.data.map((p: any) => ({
      id: p.patient_id,
      name: `Patient ${p.patient_id}`,
      age: 45,
      gender: 'Other',
      bedId: p.bed_id === '-' || !p.bed_id ? null : p.bed_id,
      ward: 'Clinical Ward',
      room: '-',
      admissionDate: p.admission_date || '-',
      status: p.status,
      primaryDoctor: 'Attending Physician',
      condition: 'Inpatient Care',
    }));
  },

  /**
   * GET /users
   */
  async getUsers(): Promise<any[]> {
    const res = await apiGet<any[]>('users');
    if (!res.success || !res.data) {
      throw new ApiError(res.message || ERROR_MESSAGES.UNABLE_TO_CONNECT);
    }
    return res.data;
  },

  /**
   * GET /activity
   */
  async getActivityLogs(): Promise<ActivityLogItem[]> {
    const res = await apiGet<any[]>('activity');
    if (!res.success || !res.data) {
      throw new ApiError(res.message || ERROR_MESSAGES.UNABLE_TO_CONNECT);
    }
    return res.data.map((log: any, index: number) => ({
      id: `act-${index}-${Date.now()}`,
      timestamp: log.timestamp || '',
      date: 'Today',
      staff: log.user_name || 'Staff',
      staffRole: 'Staff',
      bed: log.bed_id || '-',
      action: log.action || 'STATUS_CHANGE',
      previousStatus: log.old_status as BedStatus,
      newStatus: log.new_status as BedStatus,
      notes: log.details || '',
    }));
  },

  /**
   * GET /dashboard
   */
  async getDashboard(): Promise<any> {
    const res = await apiGet<any>('dashboard');
    if (!res.success || !res.data) {
      throw new ApiError(res.message || ERROR_MESSAGES.UNABLE_TO_CONNECT);
    }
    return res.data;
  },

  /**
   * POST /bed/update
   */
  async updateBed(payload: {
    bed_id: string;
    status: BedStatus;
    updated_by: string;
    user_id?: string;
    patient_id?: string | null;
    details?: string;
  }): Promise<ApiResponse> {
    const res = await apiPost('bed/update', payload);
    if (!res.success) {
      throw new ApiError(res.message || 'Failed to update bed');
    }
    return res;
  },

  /**
   * POST /bed/create
   */
  async createBed(payload: {
    bed_id: string;
    ward_id: string;
    ward_name: string;
    floor: string;
    room: string;
    bed_type?: string;
    status?: BedStatus;
    updated_by: string;
    user_id?: string;
  }): Promise<ApiResponse> {
    const res = await apiPost('bed/create', payload);
    if (!res.success) {
      throw new ApiError(res.message || 'Failed to create bed');
    }
    return res;
  },

  /**
   * POST /bed/deactivate
   */
  async deactivateBed(payload: {
    bed_id: string;
    updated_by: string;
    user_id?: string;
  }): Promise<ApiResponse> {
    const res = await apiPost('bed/deactivate', payload);
    if (!res.success) {
      throw new ApiError(res.message || 'Failed to deactivate bed');
    }
    return res;
  },

  /**
   * POST /patient/assign
   */
  async assignPatient(payload: {
    patient_id: string;
    bed_id: string;
    admission_date?: string;
    updated_by: string;
    user_id?: string;
    details?: string;
  }): Promise<ApiResponse> {
    const res = await apiPost('patient/assign', payload);
    if (!res.success) {
      throw new ApiError(res.message || 'Failed to assign patient');
    }
    return res;
  },

  /**
   * POST /patient/discharge
   */
  async dischargePatient(payload: {
    bed_id?: string;
    patient_id?: string;
    target_bed_status?: BedStatus;
    updated_by: string;
    user_id?: string;
    details?: string;
  }): Promise<ApiResponse> {
    const res = await apiPost('patient/discharge', payload);
    if (!res.success) {
      throw new ApiError(res.message || 'Failed to discharge patient');
    }
    return res;
  },

  /**
   * POST /ward/create
   */
  async createWard(payload: {
    ward_id: string;
    ward_name: string;
    floor: string;
    total_beds?: number;
    updated_by: string;
    user_id?: string;
  }): Promise<ApiResponse> {
    const res = await apiPost('ward/create', payload);
    if (!res.success) {
      throw new ApiError(res.message || 'Failed to create ward');
    }
    return res;
  },
};
