import { create } from 'zustand';
import { SeniorCitizen, SMSLog, Benefit } from '../types';
import initialSeniors from '../Dummy/data/seniors.json';
import initialBenefits from '../Dummy/data/benefits.json';
import initialSmsLogs from '../Dummy/data/sms-logs.json';

interface SeniorsState {
  seniors: SeniorCitizen[];
  benefits: Benefit[];
  smsLogs: SMSLog[];
  searchQuery: string;
  selectedBarangay: string;
  selectedStatus: string;
  isLoading: boolean;

  setSearchQuery: (query: string) => void;
  setSelectedBarangay: (brgy: string) => void;
  setSelectedStatus: (status: string) => void;

  addSenior: (senior: Omit<SeniorCitizen, 'id' | 'oscaNumber' | 'registeredDate'>, encoderName: string) => Promise<string>;
  updateSenior: (id: string, data: Partial<SeniorCitizen>) => Promise<void>;
  deleteSenior: (id: string) => Promise<void>;
  approveSenior: (id: string, officerName: string) => Promise<void>;
  rejectSenior: (id: string, reason: string, officerName: string) => Promise<void>;
  verifySenior: (id: string, officerName: string) => Promise<void>;

  sendSMS: (recipientName: string, recipientPhone: string, barangay: string, message: string, sentBy: string) => Promise<boolean>;
  sendBatchSMS: (barangay: string, message: string, sentBy: string) => Promise<number>;
}

const getStoredSeniors = (): SeniorCitizen[] => {
  const stored = localStorage.getItem('senior_system_seniors');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return initialSeniors as SeniorCitizen[];
    }
  }
  localStorage.setItem('senior_system_seniors', JSON.stringify(initialSeniors));
  return initialSeniors as SeniorCitizen[];
};

const getStoredSmsLogs = (): SMSLog[] => {
  const stored = localStorage.getItem('senior_system_sms_logs');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return initialSmsLogs as SMSLog[];
    }
  }
  localStorage.setItem('senior_system_sms_logs', JSON.stringify(initialSmsLogs));
  return initialSmsLogs as SMSLog[];
};

export const useSeniorsStore = create<SeniorsState>((set, get) => ({
  seniors: getStoredSeniors(),
  benefits: initialBenefits as Benefit[],
  smsLogs: getStoredSmsLogs(),
  searchQuery: '',
  selectedBarangay: 'All',
  selectedStatus: 'All',
  isLoading: false,

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedBarangay: (brgy) => set({ selectedBarangay: brgy }),
  setSelectedStatus: (status) => set({ selectedStatus: status }),

  addSenior: async (seniorData, encoderName) => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const id = `sen-${Date.now()}`;
    const date = new Date();
    const year = date.getFullYear();
    const count = String(get().seniors.length + 1).padStart(4, '0');
    const oscaNumber = `OSCA-JUB-${year}-${count}`;
    const registeredDate = date.toISOString().split('T')[0];

    const newSenior: SeniorCitizen = {
      ...seniorData,
      id,
      oscaNumber,
      registeredDate,
      registeredBy: encoderName
    };

    const updated = [newSenior, ...get().seniors];
    localStorage.setItem('senior_system_seniors', JSON.stringify(updated));
    set({ seniors: updated, isLoading: false });
    return oscaNumber;
  },

  updateSenior: async (id, updatedFields) => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 800));

    const updated = get().seniors.map((s) => {
      if (s.id === id) {
        return { ...s, ...updatedFields };
      }
      return s;
    });

    localStorage.setItem('senior_system_seniors', JSON.stringify(updated));
    set({ seniors: updated, isLoading: false });
  },

  deleteSenior: async (id) => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 600));

    const updated = get().seniors.filter((s) => s.id !== id);
    localStorage.setItem('senior_system_seniors', JSON.stringify(updated));
    set({ seniors: updated, isLoading: false });
  },

  approveSenior: async (id, officerName) => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 800));

    const updated = get().seniors.map((s) => {
      if (s.id === id) {
        return { 
          ...s, 
          status: 'Approved' as const, 
          remarks: `Approved by ${officerName} on ${new Date().toLocaleDateString()}.` 
        };
      }
      return s;
    });

    localStorage.setItem('senior_system_seniors', JSON.stringify(updated));
    set({ seniors: updated, isLoading: false });
  },

  rejectSenior: async (id, reason, officerName) => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 800));

    const updated = get().seniors.map((s) => {
      if (s.id === id) {
        return { 
          ...s, 
          status: 'Rejected' as const, 
          remarks: `Rejected by ${officerName} on ${new Date().toLocaleDateString()}. Reason: ${reason}` 
        };
      }
      return s;
    });

    localStorage.setItem('senior_system_seniors', JSON.stringify(updated));
    set({ seniors: updated, isLoading: false });
  },

  verifySenior: async (id, officerName) => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 800));

    const updated = get().seniors.map((s) => {
      if (s.id === id) {
        return { 
          ...s, 
          status: 'For Verification' as const, 
          remarks: `Set to verification review by ${officerName} on ${new Date().toLocaleDateString()}.` 
        };
      }
      return s;
    });

    localStorage.setItem('senior_system_seniors', JSON.stringify(updated));
    set({ seniors: updated, isLoading: false });
  },

  sendSMS: async (recipientName, recipientPhone, barangay, message, sentBy) => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 700));

    const id = `sms-${Date.now()}`;
    const newLog: SMSLog = {
      id,
      recipientName,
      recipientPhone,
      barangay,
      message,
      status: 'Sent',
      timestamp: new Date().toISOString(),
      sentBy
    };

    const updated = [newLog, ...get().smsLogs];
    localStorage.setItem('senior_system_sms_logs', JSON.stringify(updated));
    set({ smsLogs: updated, isLoading: false });
    return true;
  },

  sendBatchSMS: async (barangay, message, sentBy) => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const recipients = get().seniors.filter((s) => 
      (barangay === 'All' || s.barangay === barangay) && s.contactNumber
    );

    if (recipients.length === 0) {
      set({ isLoading: false });
      return 0;
    }

    const timestamp = new Date().toISOString();
    const newLogs: SMSLog[] = recipients.map((r, idx) => ({
      id: `sms-${Date.now()}-${idx}`,
      recipientName: `${r.firstName} ${r.lastName}`,
      recipientPhone: r.contactNumber,
      barangay: r.barangay,
      message: message.replace('[name]', r.firstName).replace('[barangay]', r.barangay),
      status: 'Sent',
      timestamp,
      sentBy
    }));

    const updated = [...newLogs, ...get().smsLogs];
    localStorage.setItem('senior_system_sms_logs', JSON.stringify(updated));
    set({ smsLogs: updated, isLoading: false });
    return recipients.length;
  }
}));
