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
    // NCSC-aligned fields
    placeOfBirth: row.place_of_birth || '',
    ethnicOrigin: row.ethnic_origin || '',
    languageSpoken: row.language_spoken || '',
    scAssocOrgId: row.sc_assoc_org_id || '',
    otherGovtId: row.other_govt_id || '',
    capabilityToTravel: row.capability_to_travel ?? true,
    serviceBusinessEmployment: row.service_business_employment || '',
    // Family Composition
    spouseLastName: row.spouse_last_name || '',
    spouseFirstName: row.spouse_first_name || '',
    spouseMiddleName: row.spouse_middle_name || '',
    spouseExtension: row.spouse_extension || '',
    fatherLastName: row.father_last_name || '',
    fatherFirstName: row.father_first_name || '',
    fatherMiddleName: row.father_middle_name || '',
    fatherExtension: row.father_extension || '',
    motherLastName: row.mother_last_name || '',
    motherFirstName: row.mother_first_name || '',
    motherMiddleName: row.mother_middle_name || '',
    children: row.children || [],
    dependents: row.dependents || [],
    // III. Education / HR Profile
    specializations: row.specializations || [],
    specOthersText: row.spec_others_text || '',
    shareSkills: row.share_skills || ['', '', ''],
    communityServices: row.community_services || [],
    commOthersText: row.comm_others_text || '',
    // IV. Dependency Profile
    livingWith: row.living_with || [],
    livingOthersText: row.living_others_text || '',
    householdCondition: row.household_condition || [],
    householdOthersText: row.household_others_text || '',
    // V. Economic Profile
    incomeSources: row.income_sources || [],
    incomeOthersText: row.income_others_text || '',
    realProperties: row.real_properties || [],
    realPropOthersText: row.real_prop_others_text || '',
    movableProperties: row.movable_properties || [],
    movablePropOthersText: row.movable_prop_others_text || '',
    monthlyIncomeRange: row.monthly_income_range || '',
    problemsNeeds: row.problems_needs || [],
    problemsSkillsText: row.problems_skills_text || '',
    problemsLivelihoodText: row.problems_livelihood_text || '',
    problemsOthersText: row.problems_others_text || '',
    // VI. Health Profile
    physicalDisability: row.physical_disability || false,
    physicalDisabilityText: row.physical_disability_text || '',
    medicalConcerns: row.medical_concerns || [],
    medicalOthersText: row.medical_others_text || '',
    dentalConcerns: row.dental_concerns || [],
    dentalOthersText: row.dental_others_text || '',
    opticalConcerns: row.optical_concerns || [],
    opticalOthersText: row.optical_others_text || '',
    hearingConcerns: row.hearing_concerns || [],
    hearingOthersText: row.hearing_others_text || '',
    socialEmotional: row.social_emotional || [],
    socialEmotionalOthersText: row.social_emotional_others_text || '',
    areaDifficulty: row.area_difficulty || [],
    areaDifficultyOthersText: row.area_difficulty_others_text || '',
    checkupFrequency: row.checkup_frequency || '',
    medicines: row.medicines || [{ name: '', dosage: '', notes: '' }, { name: '', dosage: '', notes: '' }, { name: '', dosage: '', notes: '' }],
    scheduledCheckup: row.scheduled_checkup || '',
    // IX. Assisting Person
    assistingPerson1Name: row.assisting_person1_name || '',
    assistingPerson1Relationship: row.assisting_person1_relationship || '',
    assistingPerson2Name: row.assisting_person2_name || '',
    assistingPerson2Relationship: row.assisting_person2_relationship || '',
    assistingPerson1Signature: row.assisting_person1_signature || '',
    assistingPerson2Signature: row.assisting_person2_signature || '',
    interviewerSignature: row.interviewer_signature || '',
    interviewerName: row.interviewer_name || '',
    interviewerOrganization: row.interviewer_organization || '',
    interviewDate: row.interview_date || '',
    ncscReferenceCode: row.ncsc_reference_code || '',

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
  // NCSC-aligned fields
  if (senior.placeOfBirth !== undefined) mapped.place_of_birth = senior.placeOfBirth;
  if (senior.ethnicOrigin !== undefined) mapped.ethnic_origin = senior.ethnicOrigin;
  if (senior.languageSpoken !== undefined) mapped.language_spoken = senior.languageSpoken;
  if (senior.scAssocOrgId !== undefined) mapped.sc_assoc_org_id = senior.scAssocOrgId;
  if (senior.otherGovtId !== undefined) mapped.other_govt_id = senior.otherGovtId;
  if (senior.capabilityToTravel !== undefined) mapped.capability_to_travel = senior.capabilityToTravel;
  if (senior.serviceBusinessEmployment !== undefined) mapped.service_business_employment = senior.serviceBusinessEmployment;
  // Family Composition
  if (senior.spouseLastName !== undefined) mapped.spouse_last_name = senior.spouseLastName;
  if (senior.spouseFirstName !== undefined) mapped.spouse_first_name = senior.spouseFirstName;
  if (senior.spouseMiddleName !== undefined) mapped.spouse_middle_name = senior.spouseMiddleName;
  if (senior.spouseExtension !== undefined) mapped.spouse_extension = senior.spouseExtension;
  if (senior.fatherLastName !== undefined) mapped.father_last_name = senior.fatherLastName;
  if (senior.fatherFirstName !== undefined) mapped.father_first_name = senior.fatherFirstName;
  if (senior.fatherMiddleName !== undefined) mapped.father_middle_name = senior.fatherMiddleName;
  if (senior.fatherExtension !== undefined) mapped.father_extension = senior.fatherExtension;
  if (senior.motherLastName !== undefined) mapped.mother_last_name = senior.motherLastName;
  if (senior.motherFirstName !== undefined) mapped.mother_first_name = senior.motherFirstName;
  if (senior.motherMiddleName !== undefined) mapped.mother_middle_name = senior.motherMiddleName;
  if (senior.children !== undefined) mapped.children = senior.children;
  if (senior.dependents !== undefined) mapped.dependents = senior.dependents;
  // III. Education / HR Profile
  if (senior.specializations !== undefined) mapped.specializations = senior.specializations;
  if (senior.specOthersText !== undefined) mapped.spec_others_text = senior.specOthersText;
  if (senior.shareSkills !== undefined) mapped.share_skills = senior.shareSkills;
  if (senior.communityServices !== undefined) mapped.community_services = senior.communityServices;
  if (senior.commOthersText !== undefined) mapped.comm_others_text = senior.commOthersText;
  // IV. Dependency Profile
  if (senior.livingWith !== undefined) mapped.living_with = senior.livingWith;
  if (senior.livingOthersText !== undefined) mapped.living_others_text = senior.livingOthersText;
  if (senior.householdCondition !== undefined) mapped.household_condition = senior.householdCondition;
  if (senior.householdOthersText !== undefined) mapped.household_others_text = senior.householdOthersText;
  // V. Economic Profile
  if (senior.incomeSources !== undefined) mapped.income_sources = senior.incomeSources;
  if (senior.incomeOthersText !== undefined) mapped.income_others_text = senior.incomeOthersText;
  if (senior.realProperties !== undefined) mapped.real_properties = senior.realProperties;
  if (senior.realPropOthersText !== undefined) mapped.real_prop_others_text = senior.realPropOthersText;
  if (senior.movableProperties !== undefined) mapped.movable_properties = senior.movableProperties;
  if (senior.movablePropOthersText !== undefined) mapped.movable_prop_others_text = senior.movablePropOthersText;
  if (senior.monthlyIncomeRange !== undefined) mapped.monthly_income_range = senior.monthlyIncomeRange;
  if (senior.problemsNeeds !== undefined) mapped.problems_needs = senior.problemsNeeds;
  if (senior.problemsSkillsText !== undefined) mapped.problems_skills_text = senior.problemsSkillsText;
  if (senior.problemsLivelihoodText !== undefined) mapped.problems_livelihood_text = senior.problemsLivelihoodText;
  if (senior.problemsOthersText !== undefined) mapped.problems_others_text = senior.problemsOthersText;
  // VI. Health Profile
  if (senior.physicalDisability !== undefined) mapped.physical_disability = senior.physicalDisability;
  if (senior.physicalDisabilityText !== undefined) mapped.physical_disability_text = senior.physicalDisabilityText;
  if (senior.medicalConcerns !== undefined) mapped.medical_concerns = senior.medicalConcerns;
  if (senior.medicalOthersText !== undefined) mapped.medical_others_text = senior.medicalOthersText;
  if (senior.dentalConcerns !== undefined) mapped.dental_concerns = senior.dentalConcerns;
  if (senior.dentalOthersText !== undefined) mapped.dental_others_text = senior.dentalOthersText;
  if (senior.opticalConcerns !== undefined) mapped.optical_concerns = senior.opticalConcerns;
  if (senior.opticalOthersText !== undefined) mapped.optical_others_text = senior.opticalOthersText;
  if (senior.hearingConcerns !== undefined) mapped.hearing_concerns = senior.hearingConcerns;
  if (senior.hearingOthersText !== undefined) mapped.hearing_others_text = senior.hearingOthersText;
  if (senior.socialEmotional !== undefined) mapped.social_emotional = senior.socialEmotional;
  if (senior.socialEmotionalOthersText !== undefined) mapped.social_emotional_others_text = senior.socialEmotionalOthersText;
  if (senior.areaDifficulty !== undefined) mapped.area_difficulty = senior.areaDifficulty;
  if (senior.areaDifficultyOthersText !== undefined) mapped.area_difficulty_others_text = senior.areaDifficultyOthersText;
  if (senior.checkupFrequency !== undefined) mapped.checkup_frequency = senior.checkupFrequency;
  if (senior.medicines !== undefined) mapped.medicines = senior.medicines;
  if (senior.scheduledCheckup !== undefined) mapped.scheduled_checkup = senior.scheduledCheckup;
  // IX. Assisting Person
  if (senior.assistingPerson1Name !== undefined) mapped.assisting_person1_name = senior.assistingPerson1Name;
  if (senior.assistingPerson1Relationship !== undefined) mapped.assisting_person1_relationship = senior.assistingPerson1Relationship;
  if (senior.assistingPerson2Name !== undefined) mapped.assisting_person2_name = senior.assistingPerson2Name;
  if (senior.assistingPerson2Relationship !== undefined) mapped.assisting_person2_relationship = senior.assistingPerson2Relationship;
  if (senior.assistingPerson1Signature !== undefined) mapped.assisting_person1_signature = senior.assistingPerson1Signature;
  if (senior.assistingPerson2Signature !== undefined) mapped.assisting_person2_signature = senior.assistingPerson2Signature;
  if (senior.interviewerSignature !== undefined) mapped.interviewer_signature = senior.interviewerSignature;
  if (senior.interviewerName !== undefined) mapped.interviewer_name = senior.interviewerName;
  if (senior.interviewerOrganization !== undefined) mapped.interviewer_organization = senior.interviewerOrganization;
  if (senior.interviewDate !== undefined) mapped.interview_date = senior.interviewDate;
  if (senior.ncscReferenceCode !== undefined) mapped.ncsc_reference_code = senior.ncscReferenceCode;

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

  async create(name: string): Promise<Barangay> {
    const id = 'brgy-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
    const { data, error } = await supabase
      .from('barangays')
      .insert({ id, name, population: 0, senior_count: 0 })
      .select()
      .single();
    if (error) throw error;
    return {
      id: data.id,
      name: data.name,
      population: data.population,
      seniorCount: data.senior_count,
      centerCoordinates: { lat: data.center_lat || 0, lng: data.center_lng || 0 },
      barangayHallAddress: data.barangay_hall_address || '',
    };
  },

  async update(id: string, name: string): Promise<void> {
    const { error } = await supabase
      .from('barangays')
      .update({ name, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase
      .from('barangays')
      .delete()
      .eq('id', id);
    if (error) throw error;
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
  signatureData: string;
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
    signatureData: row.signature_data || '',
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
    if (signatory.signatureData !== undefined) dbFields.signature_data = signatory.signatureData;
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
    if (fields.signatureData !== undefined) dbFields.signature_data = fields.signatureData;

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
// TRANSMITTAL BARANGAY SIGNATURES SERVICE
// ============================================================

export interface TransmittalBarangaySignature {
  id: string;
  documentType: string;
  barangayName: string;
  signatureCount: number;
  sortOrder: number;
}

export const transmittalBarangayService = {
  async getByDocumentType(documentType: string): Promise<TransmittalBarangaySignature[]> {
    const { data, error } = await supabase
      .from('transmittal_barangay_signatures')
      .select('*')
      .eq('document_type', documentType)
      .order('sort_order');
    if (error) throw error;
    return (data || []).map((row: any) => ({
      id: row.id,
      documentType: row.document_type,
      barangayName: row.barangay_name,
      signatureCount: row.signature_count,
      sortOrder: row.sort_order,
    }));
  },

  async saveAll(documentType: string, rows: { name: string; count: string }[]): Promise<void> {
    // Delete all existing rows for this document type
    const { error: delError } = await supabase
      .from('transmittal_barangay_signatures')
      .delete()
      .eq('document_type', documentType);
    if (delError) throw delError;

    // Insert new rows (only non-empty ones)
    const insertRows = rows
      .filter(r => r.name.trim())
      .map((r, idx) => ({
        document_type: documentType,
        barangay_name: r.name.trim(),
        signature_count: parseInt(r.count) || 0,
        sort_order: idx,
      }));

    if (insertRows.length > 0) {
      const { error: insError } = await supabase
        .from('transmittal_barangay_signatures')
        .insert(insertRows);
      if (insError) throw insError;
    }
  },
};

// ============================================================
// PHILHEALTH TRANSMITTAL SERVICE
// ============================================================

export const philhealthTransmittalService = {
  /** Get all selected senior IDs (optionally filtered by barangay) */
  async getSelectedSeniors(barangayFilter = ''): Promise<string[]> {
    const query = supabase
      .from('philhealth_transmittal_seniors')
      .select('senior_id')
      .eq('barangay_filter', barangayFilter);
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map((r: any) => r.senior_id);
  },

  /** Save selected seniors (replace all for a given barangay filter) */
  async saveSelectedSeniors(seniorIds: string[], barangayFilter = ''): Promise<void> {
    // Delete existing
    const { error: delErr } = await supabase
      .from('philhealth_transmittal_seniors')
      .delete()
      .eq('barangay_filter', barangayFilter);
    if (delErr) throw delErr;

    // Insert new
    if (seniorIds.length > 0) {
      const rows = seniorIds.map(id => ({ senior_id: id, barangay_filter: barangayFilter }));
      const { error: insErr } = await supabase
        .from('philhealth_transmittal_seniors')
        .insert(rows);
      if (insErr) throw insErr;
    }
  },

  /** Get a setting value */
  async getSetting(key: string): Promise<string> {
    const { data, error } = await supabase
      .from('philhealth_transmittal_settings')
      .select('setting_value')
      .eq('setting_key', key)
      .single();
    if (error) return '';
    return data?.setting_value || '';
  },

  /** Save a setting */
  async saveSetting(key: string, value: string): Promise<void> {
    const { error } = await supabase
      .from('philhealth_transmittal_settings')
      .upsert({ setting_key: key, setting_value: value }, { onConflict: 'setting_key' });
    if (error) throw error;
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

// ==================== Interviewers Service ====================
export interface Interviewer {
  id?: string;
  name: string;
  organization: string;
  place: string;
  signature: string;
}

export const interviewerService = {
  async search(query: string): Promise<Interviewer[]> {
    const { data, error } = await supabase
      .from('interviewers')
      .select('*')
      .ilike('name', `%${query}%`)
      .order('name')
      .limit(10);
    if (error) throw error;
    return data || [];
  },

  async upsert(interviewer: Interviewer): Promise<Interviewer> {
    const { data, error } = await supabase
      .from('interviewers')
      .upsert(
        {
          name: interviewer.name,
          organization: interviewer.organization,
          place: interviewer.place,
          signature: interviewer.signature,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'name' }
      )
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// ====== ID CARD CONFIG SERVICE ======
export interface IdCardConfigField {
  id: string;
  variant: 'variant1' | 'variant2';
  fieldKey: string;
  fieldValue: string;
  fieldLabel: string;
  sortOrder: number;
}

function mapIdCardConfigFromDB(row: any): IdCardConfigField {
  return {
    id: row.id,
    variant: row.variant,
    fieldKey: row.field_key,
    fieldValue: row.field_value,
    fieldLabel: row.field_label || '',
    sortOrder: row.sort_order || 0,
  };
}

export const idCardConfigService = {
  async getByVariant(variant: 'variant1' | 'variant2'): Promise<IdCardConfigField[]> {
    const { data, error } = await supabase
      .from('id_card_config')
      .select('*')
      .eq('variant', variant)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return (data || []).map(mapIdCardConfigFromDB);
  },

  async getAll(): Promise<IdCardConfigField[]> {
    const { data, error } = await supabase
      .from('id_card_config')
      .select('*')
      .order('variant', { ascending: true })
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return (data || []).map(mapIdCardConfigFromDB);
  },

  async upsert(field: { variant: string; fieldKey: string; fieldValue: string; fieldLabel?: string; sortOrder?: number }): Promise<void> {
    const { error } = await supabase
      .from('id_card_config')
      .upsert({
        variant: field.variant,
        field_key: field.fieldKey,
        field_value: field.fieldValue,
        field_label: field.fieldLabel || '',
        sort_order: field.sortOrder || 0,
      }, { onConflict: 'variant,field_key' });
    if (error) throw error;
  },

  async bulkUpsert(fields: { variant: string; fieldKey: string; fieldValue: string; fieldLabel?: string; sortOrder?: number }[]): Promise<void> {
    const dbRows = fields.map(f => ({
      variant: f.variant,
      field_key: f.fieldKey,
      field_value: f.fieldValue,
      field_label: f.fieldLabel || '',
      sort_order: f.sortOrder || 0,
    }));
    const { error } = await supabase
      .from('id_card_config')
      .upsert(dbRows, { onConflict: 'variant,field_key' });
    if (error) throw error;
  },

  async addField(field: { variant: string; fieldKey: string; fieldValue: string; fieldLabel: string; sortOrder?: number }): Promise<void> {
    const { error } = await supabase
      .from('id_card_config')
      .insert({
        variant: field.variant,
        field_key: field.fieldKey,
        field_value: field.fieldValue,
        field_label: field.fieldLabel,
        sort_order: field.sortOrder || 0,
      });
    if (error) throw error;
  },

  async deleteField(variant: string, fieldKey: string): Promise<void> {
    const { error } = await supabase
      .from('id_card_config')
      .delete()
      .eq('variant', variant)
      .eq('field_key', fieldKey);
    if (error) throw error;
  },
};

// ====== SYSTEM SETTINGS SERVICE ======
export interface SystemSetting {
  id: string;
  settingKey: string;
  settingValue: string;
  settingType: 'text' | 'image' | 'richtext' | 'color';
  settingLabel: string;
  settingGroup: 'logo' | 'brand' | 'landing' | 'general';
  sortOrder: number;
}

function mapSystemSettingFromDB(row: any): SystemSetting {
  return {
    id: row.id,
    settingKey: row.setting_key,
    settingValue: row.setting_value,
    settingType: row.setting_type || 'text',
    settingLabel: row.setting_label || '',
    settingGroup: row.setting_group || 'general',
    sortOrder: row.sort_order || 0,
  };
}

export const systemSettingsService = {
  async getAll(): Promise<SystemSetting[]> {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .order('setting_group', { ascending: true })
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return (data || []).map(mapSystemSettingFromDB);
  },

  async getByGroup(group: string): Promise<SystemSetting[]> {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .eq('setting_group', group)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return (data || []).map(mapSystemSettingFromDB);
  },

  async get(key: string): Promise<SystemSetting | null> {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .eq('setting_key', key)
      .single();
    if (error || !data) return null;
    return mapSystemSettingFromDB(data);
  },

  async upsert(key: string, value: string): Promise<void> {
    const { error } = await supabase
      .from('system_settings')
      .update({ setting_value: value })
      .eq('setting_key', key);
    if (error) throw error;
  },

  async bulkUpsert(settings: { settingKey: string; settingValue: string }[]): Promise<void> {
    for (const s of settings) {
      const { error } = await supabase
        .from('system_settings')
        .update({ setting_value: s.settingValue })
        .eq('setting_key', s.settingKey);
      if (error) throw error;
    }
  },

  async uploadImage(file: File, bucket: string = 'system-assets'): Promise<string> {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileName = `${Date.now()}-${safeName}`;
    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, { upsert: true });
    if (error) throw error;
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return urlData.publicUrl;
  },
};

