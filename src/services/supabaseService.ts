import { supabase } from '../../utils/supabase';
import { SeniorCitizen, User, Benefit, SMSLog, Barangay, RolePermission, ReportTemplate } from '../types';

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
  return mapped;
}

function mapUserFromDB(row: any): User {
  return {
    id: row.id,
    username: row.username,
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
    const channel = supabase
      .channel('seniors-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'seniors' }, async () => {
        // Refetch all on any change
        const seniors = await seniorsService.getAll();
        callback(seniors);
      })
      .subscribe();

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

    const { error } = await supabase.from('users').update(dbFields).eq('id', id);
    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) throw error;
  },

  subscribe(callback: (users: User[]) => void) {
    const channel = supabase
      .channel('users-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, async () => {
        const users = await usersService.getAll();
        callback(users);
      })
      .subscribe();
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

  subscribe(callback: (logs: SMSLog[]) => void) {
    const channel = supabase
      .channel('sms-logs-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sms_logs' }, async () => {
        const logs = await smsLogsService.getAll();
        callback(logs);
      })
      .subscribe();
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
};

// ============================================================
// ROLES SERVICE
// ============================================================

export const rolesService = {
  async getAll(): Promise<RolePermission[]> {
    const { data, error } = await supabase.from('roles').select('*');
    if (error) throw error;
    return (data || []).map((row: any) => ({
      role: row.role,
      permissions: {
        canViewSeniors: row.can_view_seniors,
        canCreateSenior: row.can_create_senior,
        canEditSenior: row.can_edit_senior,
        canApproveReject: row.can_approve_reject,
        canManageUsers: row.can_manage_users,
        canGenerateReports: row.can_generate_reports,
        canSendSMS: row.can_send_sms,
      },
    }));
  },
};
