import { supabase } from '../../utils/supabase';
import { SeniorCitizen, User, Benefit, SMSLog, Barangay, RolePermission, ReportTemplate, AuditLogNotification, NCSCDataForm, CentenarianApplication } from '../types';

// ============================================================
// TYPE MAPPERS (DB snake_case → App camelCase)
// ============================================================

function mapSeniorFromDB(row: any): SeniorCitizen {
  return {
    id: row.id,
    oscaNumber: row.osca_number,
    firstName: row.first_name,
    middleName: row.middle_name || '',
    lastName: row.last_name,
    suffix: row.suffix || '',
    birthdate: row.birthdate,
    age: row.age,
    sex: row.sex,
    civilStatus: row.civil_status,
    contactNumber: row.contact_number || '',
    barangay: row.barangay,
    address: row.address || '',
    coordinates: { lat: row.lat || 0, lng: row.lng || 0 },
    profilePhoto: row.profile_photo || '',
    thumbprintData: row.thumbprint_data || null,
    signatureData: row.signature_data || null,
    status: row.status,
    registeredDate: row.registered_date,
    registeredBy: row.registered_by || '',
    pensionBeneficiary: row.pension_beneficiary || false,
    remarks: row.remarks || '',
    region: row.region,
    province: row.province,
    cityTown: row.city_town,
    telephone: row.telephone,
    emailAddress: row.email_address,
    bloodType: row.blood_type,
    religion: row.religion,
    highestEducationalAttainment: row.highest_educational_attainment,
    gsis: row.gsis,
    sss: row.sss,
    tin: row.tin,
    philHealth: row.phil_health,
    employmentStatus: row.employment_status,
    classification: row.classification,
    monthlyPension: row.monthly_pension,
    emergencyContactName: row.emergency_contact_name,
    emergencyContactPhone: row.emergency_contact_phone,
    validIdPhoto: row.valid_id_photo,
    inRiskArea: row.in_risk_area,
    riskType: row.risk_type,
    riskDetails: row.risk_details,
    riskSeverity: row.risk_severity,
    // Deceased / Vital Status
    isDeceased: row.is_deceased || false,
    dateOfDeath: row.date_of_death || '',
    causeOfDeath: row.cause_of_death || '',
  };
}

function mapSeniorToDB(senior: Partial<SeniorCitizen>): Record<string, any> {
  const mapped: Record<string, any> = {};
  if (senior.id !== undefined) mapped.id = senior.id;
  if (senior.oscaNumber !== undefined) mapped.osca_number = senior.oscaNumber;
  if (senior.firstName !== undefined) mapped.first_name = senior.firstName;
  if (senior.middleName !== undefined) mapped.middle_name = senior.middleName;
  if (senior.lastName !== undefined) mapped.last_name = senior.lastName;
  if (senior.suffix !== undefined) mapped.suffix = senior.suffix;
  if (senior.birthdate !== undefined) mapped.birthdate = senior.birthdate;
  if (senior.age !== undefined) mapped.age = senior.age;
  if (senior.sex !== undefined) mapped.sex = senior.sex;
  if (senior.civilStatus !== undefined) mapped.civil_status = senior.civilStatus;
  if (senior.contactNumber !== undefined) mapped.contact_number = senior.contactNumber;
  if (senior.barangay !== undefined) mapped.barangay = senior.barangay;
  if (senior.address !== undefined) mapped.address = senior.address;
  if (senior.coordinates !== undefined) {
    mapped.lat = senior.coordinates.lat;
    mapped.lng = senior.coordinates.lng;
  }
  if (senior.profilePhoto !== undefined) mapped.profile_photo = senior.profilePhoto;
  if (senior.thumbprintData !== undefined) mapped.thumbprint_data = senior.thumbprintData;
  if (senior.signatureData !== undefined) mapped.signature_data = senior.signatureData;
  if (senior.status !== undefined) mapped.status = senior.status;
  if (senior.registeredDate !== undefined) mapped.registered_date = senior.registeredDate;
  if (senior.registeredBy !== undefined) mapped.registered_by = senior.registeredBy;
  if (senior.pensionBeneficiary !== undefined) mapped.pension_beneficiary = senior.pensionBeneficiary;
  if (senior.remarks !== undefined) mapped.remarks = senior.remarks;
  if (senior.region !== undefined) mapped.region = senior.region;
  if (senior.province !== undefined) mapped.province = senior.province;
  if (senior.cityTown !== undefined) mapped.city_town = senior.cityTown;
  if (senior.telephone !== undefined) mapped.telephone = senior.telephone;
  if (senior.emailAddress !== undefined) mapped.email_address = senior.emailAddress;
  if (senior.bloodType !== undefined) mapped.blood_type = senior.bloodType;
  if (senior.religion !== undefined) mapped.religion = senior.religion;
  if (senior.highestEducationalAttainment !== undefined) mapped.highest_educational_attainment = senior.highestEducationalAttainment;
  if (senior.gsis !== undefined) mapped.gsis = senior.gsis;
  if (senior.sss !== undefined) mapped.sss = senior.sss;
  if (senior.tin !== undefined) mapped.tin = senior.tin;
  if (senior.philHealth !== undefined) mapped.phil_health = senior.philHealth;
  if (senior.employmentStatus !== undefined) mapped.employment_status = senior.employmentStatus;
  if (senior.classification !== undefined) mapped.classification = senior.classification;
  if (senior.monthlyPension !== undefined) mapped.monthly_pension = senior.monthlyPension;
  if (senior.emergencyContactName !== undefined) mapped.emergency_contact_name = senior.emergencyContactName;
  if (senior.emergencyContactPhone !== undefined) mapped.emergency_contact_phone = senior.emergencyContactPhone;
  if (senior.validIdPhoto !== undefined) mapped.valid_id_photo = senior.validIdPhoto;
  if (senior.inRiskArea !== undefined) mapped.in_risk_area = senior.inRiskArea;
  if (senior.riskType !== undefined) mapped.risk_type = senior.riskType;
  if (senior.riskDetails !== undefined) mapped.risk_details = senior.riskDetails;
  if (senior.riskSeverity !== undefined) mapped.risk_severity = senior.riskSeverity;
  if (senior.isDeceased !== undefined) mapped.is_deceased = senior.isDeceased;
  if (senior.dateOfDeath !== undefined) mapped.date_of_death = senior.dateOfDeath;
  if (senior.causeOfDeath !== undefined) mapped.cause_of_death = senior.causeOfDeath;
  return mapped;
}

function mapUserFromDB(row: any): User {
  return {
    id: row.id,
    username: row.username,
    profilePhoto: row.profile_photo || '',
    fullName: row.full_name,
    role: row.role,
    barangayAssigned: row.barangay_assigned || undefined,
    contactNumber: row.contact_number || '',
    email: row.email || '',
    status: row.status,
  };
}

function mapSmsLogFromDB(row: any): SMSLog {
  return {
    id: row.id,
    recipientName: row.recipient_name,
    recipientPhone: row.recipient_phone || '',
    barangay: row.barangay || '',
    message: row.message,
    status: row.status,
    timestamp: row.timestamp,
    sentBy: row.sent_by || '',
  };
}

function mapBenefitFromDB(row: any): Benefit {
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    amount: Number(row.amount) || 0,
    frequency: row.frequency,
    status: row.status,
    distributionDate: row.distribution_date || '',
  };
}

// ============================================================
// SENIORS SERVICE
// ============================================================

export const seniorsService = {
  async getAll(): Promise<SeniorCitizen[]> {
    const { data, error } = await supabase
      .from('seniors')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapSeniorFromDB);
  },

  async getById(id: string): Promise<SeniorCitizen | null> {
    const { data, error } = await supabase
      .from('seniors')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return null;
    return mapSeniorFromDB(data);
  },

  async create(senior: Omit<SeniorCitizen, 'id' | 'oscaNumber' | 'registeredDate'>, encoderName: string): Promise<string> {
    // Generate ID and OSCA number
    const id = `sen-${Date.now()}`;
    const date = new Date();
    const year = date.getFullYear();
    
    // Get current count for OSCA number
    const { count } = await supabase
      .from('seniors')
      .select('*', { count: 'exact', head: true });
    
    const num = String((count || 0) + 1).padStart(4, '0');
    const oscaNumber = `OSCA-JUB-${year}-${num}`;
    const registeredDate = date.toISOString().split('T')[0];

    const dbData = mapSeniorToDB({
      ...senior,
      id,
      oscaNumber,
      registeredDate,
      registeredBy: encoderName,
    });

    const { error } = await supabase.from('seniors').insert(dbData);
    if (error) throw error;
    return oscaNumber;
  },

  async update(id: string, data: Partial<SeniorCitizen>): Promise<void> {
    const dbData = mapSeniorToDB(data);
    const { error } = await supabase.from('seniors').update(dbData).eq('id', id);
    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('seniors').delete().eq('id', id);
    if (error) throw error;
  },

  // Realtime subscription
  subscribe(callback: (seniors: SeniorCitizen[]) => void) {
    // Remove existing channel if any (prevents double-subscribe in StrictMode)
    supabase.removeChannel(supabase.channel('seniors-realtime'));
    
    const channel = supabase
      .channel('seniors-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'seniors' }, async () => {
        // Refetch all on any change
        const seniors = await seniorsService.getAll();
        callback(seniors);
      });
    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};

// ============================================================
// USERS SERVICE
// ============================================================

export const usersService = {
  async getAll(): Promise<User[]> {
    const { data, error } = await supabase.from('users').select('*');
    if (error) throw error;
    return (data || []).map(mapUserFromDB);
  },

  async getByUsername(username: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .ilike('username', username)
      .eq('status', 'Active')
      .single();
    if (error) return null;
    return mapUserFromDB(data);
  },

  async verifyLogin(username: string, passwordHash: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .ilike('username', username)
      .eq('status', 'Active')
      .eq('password', passwordHash)
      .single();
    if (error || !data) return null;
    return mapUserFromDB(data);
  },

  async create(user: Omit<User, 'id'>): Promise<User> {
    const id = `usr-${Date.now()}`;
    const { data, error } = await supabase
      .from('users')
      .insert({
        id,
        username: user.username,
        full_name: user.fullName,
        role: user.role,
        barangay_assigned: user.barangayAssigned || null,
        contact_number: user.contactNumber,
        email: user.email,
        status: user.status,
        password: (user as any).password || null,
        profile_photo: user.profilePhoto || null,
      })
      .select()
      .single();
    if (error) throw error;
    return mapUserFromDB(data);
  },

  async update(id: string, fields: Partial<User>): Promise<void> {
    const dbFields: Record<string, any> = {};
    if (fields.fullName !== undefined) dbFields.full_name = fields.fullName;
    if (fields.role !== undefined) dbFields.role = fields.role;
    if (fields.barangayAssigned !== undefined) dbFields.barangay_assigned = fields.barangayAssigned;
    if (fields.contactNumber !== undefined) dbFields.contact_number = fields.contactNumber;
    if (fields.email !== undefined) dbFields.email = fields.email;
    if (fields.status !== undefined) dbFields.status = fields.status;
    if (fields.username !== undefined) dbFields.username = fields.username;
    if ((fields as any).password !== undefined) dbFields.password = (fields as any).password;

    if (fields.profilePhoto !== undefined) dbFields.profile_photo = fields.profilePhoto;

    const { error } = await supabase.from('users').update(dbFields).eq('id', id);
    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) throw error;
  },

  subscribe(callback: (users: User[]) => void) {
    supabase.removeChannel(supabase.channel('users-realtime'));
    
    const channel = supabase
      .channel('users-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, async () => {
        const users = await usersService.getAll();
        callback(users);
      });
    channel.subscribe();
    return () => { supabase.removeChannel(channel); };
  },
};

// ============================================================
// BENEFITS SERVICE
// ============================================================

export const benefitsService = {
  async getAll(): Promise<Benefit[]> {
    const { data, error } = await supabase
      .from('benefits')
      .select('*')
      .order('distribution_date', { ascending: true });
    if (error) throw error;
    return (data || []).map(mapBenefitFromDB);
  },


  subscribe(callback: (benefits: Benefit[]) => void) {
    supabase.removeChannel(supabase.channel('benefits-realtime'));
    const channel = supabase
      .channel('benefits-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'benefits' }, async () => {
        const data = await benefitsService.getAll();
        callback(data);
      });
    channel.subscribe();
    return () => { supabase.removeChannel(channel); };
  },
};

// ============================================================
// SMS LOGS SERVICE
// ============================================================

export const smsLogsService = {
  async getAll(): Promise<SMSLog[]> {
    const { data, error } = await supabase
      .from('sms_logs')
      .select('*')
      .order('timestamp', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapSmsLogFromDB);
  },

  async create(log: Omit<SMSLog, 'id'>): Promise<SMSLog> {
    const id = `sms-${Date.now()}`;
    const { data, error } = await supabase
      .from('sms_logs')
      .insert({
        id,
        recipient_name: log.recipientName,
        recipient_phone: log.recipientPhone,
        barangay: log.barangay,
        message: log.message,
        status: log.status,
        sent_by: log.sentBy,
        timestamp: log.timestamp || new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    return mapSmsLogFromDB(data);
  },

  async createBatch(logs: Omit<SMSLog, 'id'>[]): Promise<number> {
    const rows = logs.map((log, idx) => ({
      id: `sms-${Date.now()}-${idx}`,
      recipient_name: log.recipientName,
      recipient_phone: log.recipientPhone,
      barangay: log.barangay,
      message: log.message,
      status: log.status,
      sent_by: log.sentBy,
      timestamp: log.timestamp || new Date().toISOString(),
    }));

    const { error } = await supabase.from('sms_logs').insert(rows);
    if (error) throw error;
    return rows.length;
  },

  async updateStatus(id: string, status: SMSLog['status']): Promise<void> {
    const { error } = await supabase
      .from('sms_logs')
      .update({ status })
      .eq('id', id);
    if (error) throw error;
  },

  subscribe(callback: (logs: SMSLog[]) => void) {
    supabase.removeChannel(supabase.channel('sms-logs-realtime'));
    
    const channel = supabase
      .channel('sms-logs-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sms_logs' }, async () => {
        const logs = await smsLogsService.getAll();
        callback(logs);
      });
    channel.subscribe();
    return () => { supabase.removeChannel(channel); };
  },
};

// ============================================================
// BARANGAYS SERVICE
// ============================================================

export const barangaysService = {
  async getAll(): Promise<Barangay[]> {
    const { data, error } = await supabase.from('barangays').select('*').order('name');
    if (error) throw error;
    return (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      population: row.population,
      seniorCount: row.senior_count,
      centerCoordinates: { lat: row.center_lat, lng: row.center_lng },
      barangayHallAddress: row.barangay_hall_address || '',
    }));
  },


  subscribe(callback: (barangays: Barangay[]) => void) {
    supabase.removeChannel(supabase.channel('barangays-realtime'));
    const channel = supabase
      .channel('barangays-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'barangays' }, async () => {
        const data = await barangaysService.getAll();
        callback(data);
      });
    channel.subscribe();
    return () => { supabase.removeChannel(channel); };
  },
};

// ============================================================
// ROLES SERVICE
// ============================================================

export const rolesService = {
  async getAll(): Promise<RolePermission[]> {
    let localRoles: RolePermission[] = [];
    try {
      const stored = localStorage.getItem('osca_roles_config');
      if (stored) localRoles = JSON.parse(stored);
    } catch { /* ignore */ }

    const { data, error } = await supabase.from('roles').select('*');
    if (error || !data) return localRoles;

    return data.map((row: any) => {
      const match = localRoles.find((r) => r.role === row.role);
      const isSuperAdmin = row.role === 'super-admin' || row.role === 'Super Admin';

      return {
        role: row.role,
        permissions: {
          // Records CRUD (Seniors)
          canViewSeniors: match?.permissions.canViewSeniors ?? row.can_view_seniors ?? true,
          canCreateSenior: match?.permissions.canCreateSenior ?? row.can_create_senior ?? isSuperAdmin,
          canEditSenior: match?.permissions.canEditSenior ?? row.can_edit_senior ?? isSuperAdmin,
          canDeleteSenior: match?.permissions.canDeleteSenior ?? row.can_delete_senior ?? isSuperAdmin,
          canApproveReject: match?.permissions.canApproveReject ?? row.can_approve_reject ?? isSuperAdmin,

          // User Administration (Users)
          canViewUsers: match?.permissions.canViewUsers ?? row.can_view_users ?? (row.can_manage_users || isSuperAdmin),
          canCreateUser: match?.permissions.canCreateUser ?? row.can_create_user ?? (row.can_manage_users || isSuperAdmin),
          canEditUser: match?.permissions.canEditUser ?? row.can_edit_user ?? (row.can_manage_users || isSuperAdmin),
          canDeleteUser: match?.permissions.canDeleteUser ?? row.can_delete_user ?? isSuperAdmin,
          canManageUsers: match?.permissions.canManageUsers ?? row.can_manage_users ?? isSuperAdmin,

          // Reports & Documents
          canGenerateReports: match?.permissions.canGenerateReports ?? row.can_generate_reports ?? true,
          canDeleteReports: match?.permissions.canDeleteReports ?? row.can_delete_reports ?? isSuperAdmin,

          // Notifications & SMS
          canSendSMS: match?.permissions.canSendSMS ?? row.can_send_sms ?? true,
          canManageNotifications: match?.permissions.canManageNotifications ?? row.can_manage_notifications ?? true,

          // Page Access Control
          canAccessDashboard: match?.permissions.canAccessDashboard ?? row.can_access_dashboard ?? true,
          canAccessSeniorsList: match?.permissions.canAccessSeniorsList ?? row.can_access_seniors_list ?? true,
          canAccessSeniorProfile: match?.permissions.canAccessSeniorProfile ?? row.can_access_senior_profile ?? true,
          canAccessRegister: match?.permissions.canAccessRegister ?? row.can_access_register ?? (row.can_create_senior || isSuperAdmin),
          canAccessReports: match?.permissions.canAccessReports ?? row.can_access_reports ?? (row.can_generate_reports || isSuperAdmin),
          canAccessSMSCenter: match?.permissions.canAccessSMSCenter ?? row.can_access_sms_center ?? (row.can_send_sms || isSuperAdmin),
          canAccessUserManagement: match?.permissions.canAccessUserManagement ?? row.can_access_user_management ?? (row.can_manage_users || isSuperAdmin),
          canAccessFindUser: match?.permissions.canAccessFindUser ?? row.can_access_find_user ?? true,
          canAccessConfiguration: match?.permissions.canAccessConfiguration ?? row.can_access_configuration ?? (row.can_manage_users || isSuperAdmin),
          canAccessMapping: match?.permissions.canAccessMapping ?? row.can_access_mapping ?? true,
        },
      };
    });
  },


  subscribe(callback: (roles: RolePermission[]) => void) {
    supabase.removeChannel(supabase.channel('roles-realtime'));
    const channel = supabase
      .channel('roles-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'roles' }, async () => {
        const data = await rolesService.getAll();
        callback(data);
      });
    channel.subscribe();
    return () => { supabase.removeChannel(channel); };
  },
};

// ============================================================
// USER SETTINGS SERVICE (per-user theme/configuration)
// ============================================================

export interface UserThemeSettings {
  fontFamily: string;
  fontSize: string;
  primaryColor: string;
  secondaryColor: string;
  infoColor: string;
  dangerColor: string;
  warningColor: string;
  bgTint: string;
  mode: 'light' | 'dark';
}

export const userSettingsService = {
  async get(userId: string): Promise<UserThemeSettings | null> {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) return null;

    return {
      fontFamily: data.font_family || 'Inter',
      fontSize: data.font_size || '14px',
      primaryColor: data.primary_color || '#02A952',
      secondaryColor: data.secondary_color || '#0F766E',
      infoColor: data.info_color || '#0284C7',
      dangerColor: data.danger_color || '#DC2626',
      warningColor: data.warning_color || '#D97706',
      bgTint: data.bg_tint || '#f8fafc',
      mode: (data.mode as 'light' | 'dark') || 'light',
    };
  },

  async upsert(userId: string, settings: UserThemeSettings): Promise<void> {
    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: userId,
        font_family: settings.fontFamily,
        font_size: settings.fontSize,
        primary_color: settings.primaryColor,
        secondary_color: settings.secondaryColor,
        info_color: settings.infoColor,
        danger_color: settings.dangerColor,
        warning_color: settings.warningColor,
        bg_tint: settings.bgTint,
        mode: settings.mode,
      }, { onConflict: 'user_id' });

    if (error) throw error;
  },

  async remove(userId: string): Promise<void> {
    const { error } = await supabase
      .from('user_settings')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
  },
};

// ============================================================
// AUDIT LOGS & REAL-TIME NOTIFICATIONS SERVICE
// ============================================================

export const auditLogsService = {
  async getAll(): Promise<AuditLogNotification[]> {
    let localLogs: AuditLogNotification[] = [];
    try {
      const stored = localStorage.getItem('osca_audit_logs');
      if (stored) localLogs = JSON.parse(stored);
    } catch { /* ignore */ }

    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error || !data) return localLogs;

    const dbLogs = data.map((row: any) => ({
      id: row.id,
      action: row.action,
      entity: row.entity,
      details: row.details,
      actorName: row.actor_name,
      actorRole: row.actor_role,
      barangay: row.barangay || '',
      timestamp: row.timestamp,
      read: row.read ?? false,
      severity: row.severity || 'info',
    }));

    const combinedMap = new Map<string, AuditLogNotification>();
    localLogs.forEach((l) => combinedMap.set(l.id, l));
    dbLogs.forEach((l) => combinedMap.set(l.id, l));

    return Array.from(combinedMap.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  },

  async log(logItem: Omit<AuditLogNotification, 'id' | 'timestamp' | 'read'>): Promise<AuditLogNotification> {
    const newLog: AuditLogNotification = {
      ...logItem,
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      read: false,
    };

    // 1. Save to Local Cache
    try {
      const existing = await auditLogsService.getAll();
      const updated = [newLog, ...existing].slice(0, 100);
      localStorage.setItem('osca_audit_logs', JSON.stringify(updated));
    } catch { /* ignore */ }

    // 2. Dispatch Custom Realtime Event
    window.dispatchEvent(new CustomEvent('osca-audit-log-new', { detail: newLog }));

    // 3. Persist to Supabase Table (if table exists)
    try {
      await supabase.from('audit_logs').insert({
        id: newLog.id,
        action: newLog.action,
        entity: newLog.entity,
        details: newLog.details,
        actor_name: newLog.actorName,
        actor_role: newLog.actorRole,
        barangay: newLog.barangay,
        timestamp: newLog.timestamp,
        read: newLog.read,
        severity: newLog.severity,
      });
    } catch (err) {
      console.warn('[SUPABASE AUDIT LOG NOTICE]', err);
    }

    return newLog;
  },

  subscribe(callback: (logs: AuditLogNotification[]) => void) {
    const handleCustomEvent = async () => {
      const logs = await auditLogsService.getAll();
      callback(logs);
    };

    window.addEventListener('osca-audit-log-new', handleCustomEvent);

    supabase.removeChannel(supabase.channel('audit-logs-realtime'));
    const channel = supabase
      .channel('audit-logs-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'audit_logs' }, async () => {
        const logs = await auditLogsService.getAll();
        callback(logs);
      });
    channel.subscribe();

    return () => {
      window.removeEventListener('osca-audit-log-new', handleCustomEvent);
      supabase.removeChannel(channel);
    };
  },

  async markAllAsRead(): Promise<void> {
    try {
      const logs = await auditLogsService.getAll();
      const updated = logs.map((l) => ({ ...l, read: true }));
      localStorage.setItem('osca_audit_logs', JSON.stringify(updated));
      await supabase.from('audit_logs').update({ read: true }).neq('id', '');
    } catch { /* ignore */ }
    window.dispatchEvent(new CustomEvent('osca-audit-log-new'));
  },

  async clearAll(): Promise<void> {
    localStorage.removeItem('osca_audit_logs');
    try {
      await supabase.from('audit_logs').delete().neq('id', '');
    } catch { /* ignore */ }
    window.dispatchEvent(new CustomEvent('osca-audit-log-new'));
  },
};


// ====== DOCUMENT SIGNATORIES SERVICE ======
export interface DocumentSignatory {
  id: string;
  documentType: string;
  roleKey: string;
  fullName: string;
  title: string;
  designation: string;
  licenseNo: string;
  address: string;
  isDefault: boolean;
}

function mapSignatoryFromDB(row: any): DocumentSignatory {
  return {
    id: row.id,
    documentType: row.document_type,
    roleKey: row.role_key,
    fullName: row.full_name,
    title: row.title || '',
    designation: row.designation || '',
    licenseNo: row.license_no || '',
    address: row.address || '',
    isDefault: row.is_default ?? true,
  };
}

export const signatoriesService = {
  async getByDocumentType(documentType: string): Promise<DocumentSignatory[]> {
    const { data, error } = await supabase
      .from('document_signatories')
      .select('*')
      .eq('document_type', documentType);
    if (error) throw error;
    return (data || []).map(mapSignatoryFromDB);
  },

  async getAll(): Promise<DocumentSignatory[]> {
    const { data, error } = await supabase.from('document_signatories').select('*');
    if (error) throw error;
    return (data || []).map(mapSignatoryFromDB);
  },

  async upsert(signatory: Partial<DocumentSignatory> & { documentType: string; roleKey: string }): Promise<void> {
    const dbFields: Record<string, any> = {
      document_type: signatory.documentType,
      role_key: signatory.roleKey,
    };
    if (signatory.fullName !== undefined) dbFields.full_name = signatory.fullName;
    if (signatory.title !== undefined) dbFields.title = signatory.title;
    if (signatory.designation !== undefined) dbFields.designation = signatory.designation;
    if (signatory.licenseNo !== undefined) dbFields.license_no = signatory.licenseNo;
    if (signatory.address !== undefined) dbFields.address = signatory.address;
    if (signatory.id) dbFields.id = signatory.id;

    const { error } = await supabase
      .from('document_signatories')
      .upsert(dbFields, { onConflict: 'document_type,role_key' });
    if (error) throw error;
  },

  async update(id: string, fields: Partial<DocumentSignatory>): Promise<void> {
    const dbFields: Record<string, any> = {};
    if (fields.fullName !== undefined) dbFields.full_name = fields.fullName;
    if (fields.title !== undefined) dbFields.title = fields.title;
    if (fields.designation !== undefined) dbFields.designation = fields.designation;
    if (fields.licenseNo !== undefined) dbFields.license_no = fields.licenseNo;
    if (fields.address !== undefined) dbFields.address = fields.address;

    const { error } = await supabase.from('document_signatories').update(dbFields).eq('id', id);
    if (error) throw error;
  },

  subscribe(callback: (signatories: DocumentSignatory[]) => void) {
    supabase.removeChannel(supabase.channel('signatories-realtime'));
    const channel = supabase
      .channel('signatories-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'document_signatories' }, async () => {
        const signatories = await signatoriesService.getAll();
        callback(signatories);
      });
    channel.subscribe();
    return () => { supabase.removeChannel(channel); };
  },
};

// ============================================================
// NCSC DATA FORM SERVICE
// ============================================================

function mapNCSCFromDB(row: any): NCSCDataForm {
  return {
    id: row.id,
    seniorId: row.senior_id,
    referenceCode: row.reference_code,
    interviewDate: row.interview_date,
    interviewedBy: row.interviewed_by,
    incomeSource: row.income_source,
    estimatedMonthlyIncome: row.estimated_monthly_income,
    receivingPension: row.receiving_pension || false,
    pensionType: row.pension_type,
    pensionAmount: row.pension_amount,
    receivingSocialPension: row.receiving_social_pension || false,
    isIndigent: row.is_indigent || false,
    ownsProperty: row.owns_property || false,
    propertyType: row.property_type,
    healthCondition: row.health_condition,
    existingIllnesses: row.existing_illnesses || [],
    medications: row.medications || [],
    mobility: row.mobility,
    mentalHealthStatus: row.mental_health_status,
    hasPhilHealth: row.has_phil_health || false,
    philHealthCategory: row.phil_health_category,
    lastCheckupDate: row.last_checkup_date,
    hospitalPreference: row.hospital_preference,
    livingArrangement: row.living_arrangement,
    householdSize: row.household_size,
    caregiverName: row.caregiver_name,
    caregiverRelationship: row.caregiver_relationship,
    caregiverContact: row.caregiver_contact,
    housingType: row.housing_type,
    hasAccessToWater: row.has_access_to_water ?? true,
    hasAccessToElectricity: row.has_access_to_electricity ?? true,
    hasAccessToSanitation: row.has_access_to_sanitation ?? true,
    memberOfSeniorOrg: row.member_of_senior_org || false,
    seniorOrgName: row.senior_org_name,
    participatesInActivities: row.participates_in_activities || false,
    activitiesJoined: row.activities_joined || [],
    primaryNeeds: row.primary_needs || [],
    suggestedPrograms: row.suggested_programs || [],
    status: row.status,
    completedDate: row.completed_date,
  };
}

export const ncscDataFormService = {
  async getAll(): Promise<NCSCDataForm[]> {
    const { data, error } = await supabase
      .from('ncsc_data_forms')
      .select('*')
      .order('interview_date', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapNCSCFromDB);
  },

  async getBySeniorId(seniorId: string): Promise<NCSCDataForm | null> {
    const { data, error } = await supabase
      .from('ncsc_data_forms')
      .select('*')
      .eq('senior_id', seniorId)
      .single();
    if (error) return null;
    return mapNCSCFromDB(data);
  },

  async create(form: Omit<NCSCDataForm, 'id'>): Promise<string> {
    const id = `ncsc-${Date.now()}`;
    const { error } = await supabase.from('ncsc_data_forms').insert({
      id,
      senior_id: form.seniorId,
      reference_code: form.referenceCode,
      interview_date: form.interviewDate,
      interviewed_by: form.interviewedBy,
      income_source: form.incomeSource,
      estimated_monthly_income: form.estimatedMonthlyIncome,
      receiving_pension: form.receivingPension,
      pension_type: form.pensionType,
      pension_amount: form.pensionAmount,
      receiving_social_pension: form.receivingSocialPension,
      is_indigent: form.isIndigent,
      owns_property: form.ownsProperty,
      property_type: form.propertyType,
      health_condition: form.healthCondition,
      existing_illnesses: form.existingIllnesses,
      medications: form.medications,
      mobility: form.mobility,
      mental_health_status: form.mentalHealthStatus,
      has_phil_health: form.hasPhilHealth,
      phil_health_category: form.philHealthCategory,
      last_checkup_date: form.lastCheckupDate,
      hospital_preference: form.hospitalPreference,
      living_arrangement: form.livingArrangement,
      household_size: form.householdSize,
      caregiver_name: form.caregiverName,
      caregiver_relationship: form.caregiverRelationship,
      caregiver_contact: form.caregiverContact,
      housing_type: form.housingType,
      has_access_to_water: form.hasAccessToWater,
      has_access_to_electricity: form.hasAccessToElectricity,
      has_access_to_sanitation: form.hasAccessToSanitation,
      member_of_senior_org: form.memberOfSeniorOrg,
      senior_org_name: form.seniorOrgName,
      participates_in_activities: form.participatesInActivities,
      activities_joined: form.activitiesJoined,
      primary_needs: form.primaryNeeds,
      suggested_programs: form.suggestedPrograms,
      status: form.status,
      completed_date: form.completedDate,
    });
    if (error) throw error;
    return id;
  },

  async update(id: string, fields: Partial<NCSCDataForm>): Promise<void> {
    const dbFields: Record<string, any> = {};
    if (fields.status !== undefined) dbFields.status = fields.status;
    if (fields.completedDate !== undefined) dbFields.completed_date = fields.completedDate;
    // Add more as needed
    const { error } = await supabase.from('ncsc_data_forms').update(dbFields).eq('id', id);
    if (error) throw error;
  },
};

// ============================================================
// CENTENARIAN HONORING SERVICE
// ============================================================

function mapCentenarianFromDB(row: any): CentenarianApplication {
  return {
    id: row.id,
    seniorId: row.senior_id,
    milestoneType: row.milestone_type,
    milestoneAge: row.milestone_age,
    milestoneDateReached: row.milestone_date_reached,
    cashGiftAmount: row.cash_gift_amount,
    applicationDate: row.application_date,
    applicantType: row.applicant_type,
    representativeName: row.representative_name,
    representativeRelationship: row.representative_relationship,
    representativeContact: row.representative_contact,
    hasApplicationForm: row.has_application_form || false,
    hasFullBodyPhoto: row.has_full_body_photo || false,
    hasEndorsementLetter: row.has_endorsement_letter || false,
    hasBirthCertificate: row.has_birth_certificate || false,
    hasValidId: row.has_valid_id || false,
    hasDeathCertificate: row.has_death_certificate || false,
    status: row.status,
    endorsedBy: row.endorsed_by,
    endorsedDate: row.endorsed_date,
    claimDeadline: row.claim_deadline,
    claimedDate: row.claimed_date,
    remarks: row.remarks,
  };
}

export const centenarianService = {
  async getAll(): Promise<CentenarianApplication[]> {
    const { data, error } = await supabase
      .from('centenarian_applications')
      .select('*')
      .order('application_date', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapCentenarianFromDB);
  },

  async getBySeniorId(seniorId: string): Promise<CentenarianApplication[]> {
    const { data, error } = await supabase
      .from('centenarian_applications')
      .select('*')
      .eq('senior_id', seniorId);
    if (error) return [];
    return (data || []).map(mapCentenarianFromDB);
  },

  async create(app: Omit<CentenarianApplication, 'id'>): Promise<string> {
    const id = `cent-${Date.now()}`;
    const { error } = await supabase.from('centenarian_applications').insert({
      id,
      senior_id: app.seniorId,
      milestone_type: app.milestoneType,
      milestone_age: app.milestoneAge,
      milestone_date_reached: app.milestoneDateReached,
      cash_gift_amount: app.cashGiftAmount,
      application_date: app.applicationDate,
      applicant_type: app.applicantType,
      representative_name: app.representativeName,
      representative_relationship: app.representativeRelationship,
      representative_contact: app.representativeContact,
      has_application_form: app.hasApplicationForm,
      has_full_body_photo: app.hasFullBodyPhoto,
      has_endorsement_letter: app.hasEndorsementLetter,
      has_birth_certificate: app.hasBirthCertificate,
      has_valid_id: app.hasValidId,
      has_death_certificate: app.hasDeathCertificate,
      status: app.status,
      endorsed_by: app.endorsedBy,
      endorsed_date: app.endorsedDate,
      claim_deadline: app.claimDeadline,
      claimed_date: app.claimedDate,
      remarks: app.remarks,
    });
    if (error) throw error;
    return id;
  },

  async update(id: string, fields: Partial<CentenarianApplication>): Promise<void> {
    const dbFields: Record<string, any> = {};
    if (fields.status !== undefined) dbFields.status = fields.status;
    if (fields.endorsedBy !== undefined) dbFields.endorsed_by = fields.endorsedBy;
    if (fields.endorsedDate !== undefined) dbFields.endorsed_date = fields.endorsedDate;
    if (fields.claimedDate !== undefined) dbFields.claimed_date = fields.claimedDate;
    if (fields.remarks !== undefined) dbFields.remarks = fields.remarks;
    const { error } = await supabase.from('centenarian_applications').update(dbFields).eq('id', id);
    if (error) throw error;
  },
};
