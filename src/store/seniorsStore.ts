import { create } from 'zustand';
import { SeniorCitizen, SMSLog, Benefit } from '../types';
import { seniorsService, smsLogsService, benefitsService, auditLogsService } from '../services/supabaseService';
import { uploadProfilePhoto, uploadSignature } from '../services/storageService';

interface SeniorsState {
  seniors: SeniorCitizen[];
  benefits: Benefit[];
  smsLogs: SMSLog[];
  searchQuery: string;
  selectedBarangay: string;
  selectedStatus: string;
  isLoading: boolean;
  isInitialized: boolean;

  // Init & realtime
  initialize: () => Promise<void>;

  setSearchQuery: (query: string) => void;
  setSelectedBarangay: (brgy: string) => void;
  setSelectedStatus: (status: string) => void;

  addSenior: (senior: Omit<SeniorCitizen, 'id' | 'oscaNumber' | 'registeredDate'>, encoderName: string) => Promise<string>;
  updateSenior: (id: string, data: Partial<SeniorCitizen>, actorName?: string) => Promise<void>;
  deleteSenior: (id: string, actorName?: string) => Promise<void>;
  approveSenior: (id: string, officerName: string) => Promise<void>;
  rejectSenior: (id: string, reason: string, officerName: string) => Promise<void>;
  verifySenior: (id: string, officerName: string) => Promise<void>;

  sendSMS: (recipientName: string, recipientPhone: string, barangay: string, message: string, sentBy: string) => Promise<boolean>;
  sendBatchSMS: (barangay: string, message: string, sentBy: string) => Promise<number>;
  resendSMS: (logId: string) => Promise<void>;
}

export const useSeniorsStore = create<SeniorsState>((set, get) => ({
  seniors: [],
  benefits: [],
  smsLogs: [],
  searchQuery: '',
  selectedBarangay: 'All',
  selectedStatus: 'All',
  isLoading: false,
  isInitialized: false,

  initialize: async () => {
    if (get().isInitialized) return;
    set({ isLoading: true });

    try {
      const [seniors, benefits, smsLogs] = await Promise.all([
        seniorsService.getAll(),
        benefitsService.getAll(),
        smsLogsService.getAll(),
      ]);

      set({ seniors, benefits, smsLogs, isInitialized: true, isLoading: false });

      // Subscribe to realtime changes
      seniorsService.subscribe((updatedSeniors) => {
        set({ seniors: updatedSeniors });
      });

      smsLogsService.subscribe((updatedLogs) => {
        set({ smsLogs: updatedLogs });
      });

      benefitsService.subscribe((updatedBenefits) => {
        set({ benefits: updatedBenefits });
      });
    } catch (error) {
      console.error('Failed to initialize seniors store:', error);
      set({ isLoading: false });
    }
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedBarangay: (brgy) => set({ selectedBarangay: brgy }),
  setSelectedStatus: (status) => set({ selectedStatus: status }),

  addSenior: async (seniorData, encoderName) => {
    set({ isLoading: true });
    try {
      // Generate a temp ID for file naming
      const tempId = `sen-${Date.now()}`;

      // Upload profile photo to Storage bucket if it's base64
      let processedData = { ...seniorData };
      if (processedData.profilePhoto && processedData.profilePhoto.startsWith('data:')) {
        const photoUrl = await uploadProfilePhoto(processedData.profilePhoto, tempId);
        processedData.profilePhoto = photoUrl;
      }

      // Upload signature to Storage bucket if it's base64
      if (processedData.signatureData && processedData.signatureData.startsWith('data:')) {
        const sigUrl = await uploadSignature(processedData.signatureData, tempId);
        processedData.signatureData = sigUrl;
      }

      const oscaNumber = await seniorsService.create(processedData, encoderName);

      // Trigger Realtime Audit Log
      auditLogsService.log({
        action: 'CREATE',
        entity: 'Senior',
        details: `Idinagdag si Senior: ${processedData.firstName} ${processedData.lastName} (${processedData.barangay})`,
        actorName: encoderName || 'System Encoder',
        actorRole: 'encoder',
        barangay: processedData.barangay,
        severity: 'success',
      });

      // Realtime subscription will auto-update the list
      set({ isLoading: false });
      return oscaNumber;
    } catch (error) {
      console.error('Failed to add senior:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  updateSenior: async (id, updatedFields, actorName = 'System User') => {
    set({ isLoading: true });
    try {
      let processedFields = { ...updatedFields };

      // Upload new profile photo if it's base64
      if (processedFields.profilePhoto && processedFields.profilePhoto.startsWith('data:')) {
        const photoUrl = await uploadProfilePhoto(processedFields.profilePhoto, id);
        processedFields.profilePhoto = photoUrl;
      }

      // Upload new signature if it's base64
      if (processedFields.signatureData && processedFields.signatureData.startsWith('data:')) {
        const sigUrl = await uploadSignature(processedFields.signatureData, id);
        processedFields.signatureData = sigUrl;
      }

      await seniorsService.update(id, processedFields);

      const target = get().seniors.find(s => s.id === id);
      const name = target ? `${target.firstName} ${target.lastName}` : id;

      auditLogsService.log({
        action: 'UPDATE',
        entity: 'Senior',
        details: `Updated senior record of: ${name}`,
        actorName: actorName,
        actorRole: 'user',
        barangay: target?.barangay,
        severity: 'info',
      });

      // Optimistic update
      const updated = get().seniors.map((s) => 
        s.id === id ? { ...s, ...processedFields } : s
      );
      set({ seniors: updated, isLoading: false });
    } catch (error) {
      console.error('Failed to update senior:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  deleteSenior: async (id, actorName = 'System User') => {
    set({ isLoading: true });
    try {
      const target = get().seniors.find(s => s.id === id);
      const name = target ? `${target.firstName} ${target.lastName}` : id;

      await seniorsService.delete(id);

      auditLogsService.log({
        action: 'DELETE',
        entity: 'Senior',
        details: `Archived / deleted senior record of: ${name}`,
        actorName: actorName,
        actorRole: 'admin',
        barangay: target?.barangay,
        severity: 'warning',
      });

      const updated = get().seniors.filter((s) => s.id !== id);
      set({ seniors: updated, isLoading: false });
    } catch (error) {
      console.error('Failed to delete senior:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  approveSenior: async (id, officerName) => {
    const target = get().seniors.find(s => s.id === id);
    const name = target ? `${target.firstName} ${target.lastName}` : id;

    await get().updateSenior(id, {
      status: 'Approved',
      remarks: `Approved by ${officerName} on ${new Date().toLocaleDateString()}.`,
    }, officerName);

    auditLogsService.log({
      action: 'APPROVE',
      entity: 'Senior',
      details: `Approved by ${officerName} the registration of ${name}`,
      actorName: officerName,
      actorRole: 'approver',
      barangay: target?.barangay,
      severity: 'success',
    });
  },

  rejectSenior: async (id, reason, officerName) => {
    const target = get().seniors.find(s => s.id === id);
    const name = target ? `${target.firstName} ${target.lastName}` : id;

    await get().updateSenior(id, {
      status: 'Rejected',
      remarks: `Rejected by ${officerName} on ${new Date().toLocaleDateString()}. Reason: ${reason}`,
    }, officerName);

    auditLogsService.log({
      action: 'REJECT',
      entity: 'Senior',
      details: `Rejected by ${officerName} the registration of ${name} (Cause: ${reason})`,
      actorName: officerName,
      actorRole: 'approver',
      barangay: target?.barangay,
      severity: 'danger',
    });
  },

  verifySenior: async (id, officerName) => {
    await get().updateSenior(id, {
      status: 'For Verification',
      remarks: `Set to verification review by ${officerName} on ${new Date().toLocaleDateString()}.`,
    });
  },

  sendSMS: async (recipientName, recipientPhone, barangay, message, sentBy) => {
    set({ isLoading: true });
    try {
      await smsLogsService.create({
        recipientName,
        recipientPhone,
        barangay,
        message,
        status: 'Pending',
        timestamp: new Date().toISOString(),
        sentBy,
      });
      set({ isLoading: false });
      return true;
    } catch (error) {
      console.error('Failed to send SMS:', error);
      set({ isLoading: false });
      return false;
    }
  },

  sendBatchSMS: async (barangay, message, sentBy) => {
    set({ isLoading: true });
    try {
      const recipients = get().seniors.filter((s) =>
        (barangay === 'All' || s.barangay === barangay) && s.contactNumber
      );

      if (recipients.length === 0) {
        set({ isLoading: false });
        return 0;
      }

      const timestamp = new Date().toISOString();
      const logs = recipients.map((r) => ({
        recipientName: `${r.firstName} ${r.lastName}`,
        recipientPhone: r.contactNumber,
        barangay: r.barangay,
        message: message.replace('[name]', r.firstName).replace('[barangay]', r.barangay),
        status: 'Pending' as const,
        timestamp,
        sentBy,
      }));

      const count = await smsLogsService.createBatch(logs);
      set({ isLoading: false });
      return count;
    } catch (error) {
      console.error('Failed to send batch SMS:', error);
      set({ isLoading: false });
      return 0;
    }
  },

  resendSMS: async (logId) => {
    try {
      await smsLogsService.updateStatus(logId, 'Pending');
      // Update local state immediately
      set((state) => ({
        smsLogs: state.smsLogs.map((log) =>
          log.id === logId ? { ...log, status: 'Pending' as const } : log
        ),
      }));
    } catch (error) {
      console.error('Failed to resend SMS:', error);
    }
  },
}));
