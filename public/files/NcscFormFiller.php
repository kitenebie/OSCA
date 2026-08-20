<?php
/**
 * NCSC Senior Citizen Data Form (NCSC-SCDF v. 4.0b3) Filler
 * ------------------------------------------------------------
 * Ginagamit ang `pdftk` (PDF Toolkit) command-line tool para i-fill ang
 * fillable AcroForm fields ng NCSC PDF form. Ang pdftk ang pinaka-reliable
 * na paraan sa PHP para dito dahil hindi nito sinisira ang layout/fonts
 * ng original na PDF (unlike sa manual redraw gamit ang FPDF/TCPDF).
 *
 * REQUIREMENT: Kailangang naka-install ang `pdftk` sa server.
 *   Ubuntu/Debian: sudo apt-get install pdftk-java
 *   (ang "pdftk-java" ang maintained fork ngayon; "pdftk" na lang din
 *    ang command pagkatapos i-install)
 *
 * Paano gamitin:
 *   $filler = new NcscFormFiller('/path/to/blank_ncsc_form.pdf');
 *   $filler->setValue('last_name', 'Dela Cruz');
 *   $filler->setValue('first_name', 'Juan');
 *   $filler->checkBox('educ_college_graduate');
 *   $filler->addChild('Maria Dela Cruz', 'Teacher', 25000, 32, 'Working');
 *   $outputPath = $filler->save('/path/to/output/filled_form.pdf');
 */

class NcscFormFiller
{
    /** @var string Absolute path sa blangkong (source) NCSC PDF */
    protected string $sourcePdf;

    /** @var array<string, string> field_id => value na ilalagay */
    protected array $values = [];

    /**
     * @var array<string, true> Set ng field_ids na checkbox type (hindi
     * text). Kailangan ito dahil sa FDF format, ang checkbox/radio values
     * (/Yes, /Off) ay dapat isulat bilang PDF Name objects (walang
     * parenthesis), habang ang text field values ay dapat isulat bilang
     * string literals (naka-loob sa parenthesis). Iisang paraan lang ng
     * pag-escape ang dating ginagamit dati para sa dalawa, kaya hindi
     * na-a-apply nang tama ang mga checkbox - naayos na ito ngayon sa
     * pamamagitan ng pag-track kung alin ang checkbox field.
     */
    protected array $checkboxFieldIds = [];

    /** @var string Path kung saan gagawin ang temporary FDF file */
    protected string $tmpDir;

    /**
     * Ito ang "friendly name" => "actual PDF field_id" mapping.
     * Ang mga field_id (Text Field0, Check Box14, atbp.) ay galing
     * direkta sa AcroForm structure ng orihinal na PDF - hindi ito
     * dapat baguhin maliban kung magbago ang source PDF template.
     */
    public const FIELD_MAP = [
        // ===== Reference Code (NCSC use only, pwede iwan blank) =====
        'ref_code_1' => 'Text Field0',
        'ref_code_2' => 'Text Field1',
        'ref_code_3' => 'Text Field2',
        'ref_code_4' => 'Text Field3',
        'ref_code_5' => 'Text Field4',

        // ===== I. IDENTIFYING INFORMATION =====
        // 1. Name of Senior Citizen
        'last_name'        => 'Text Field5',
        'first_name'       => 'Text Field6',
        'middle_name'      => 'Text Field7',
        'name_extension'   => 'Text Field8', // Jr./Sr.

        // 2. Address
        'region'           => 'Text Field9',
        'province'         => 'Text Field10',
        'city_municipality'=> 'Text Field11',
        'barangay'         => 'Text Field12',
        'house_no_zone'    => 'Text Field13', // House No./Zone/Purok/Sitio
        'street'           => 'Text Field14',

        // 3. Date of Birth (mm-dd-yy, isang letra bawat box)
        'dob_m1'           => 'Text Field15',
        'dob_m2'           => 'Text Field16',
        'dob_d1'           => 'Text Field17',
        'dob_d2'           => 'Text Field18',
        'dob_y1'           => 'Text Field19',
        'dob_y2'           => 'Text Field20',

        'place_of_birth'   => 'Text Field21',
        'marital_status'   => 'Text Field22',
        'gender_sex'       => 'Text Field23',
        'contact_number'   => 'Text Field24',
        'email_address'    => 'Text Field25',
        'religion'         => 'Text Field26',
        'ethnic_origin'    => 'Text Field27',
        'language_spoken'  => 'Text Field28',
        'osca_id_number'   => 'Text Field29',
        'gsis_sss'         => 'Text Field30',
        'tin'              => 'Text Field31',
        'philhealth'       => 'Text Field32',
        'sc_assoc_org_id'  => 'Text Field33',
        'other_govt_id'    => 'Text Field34',

        // 18. Capability to Travel (checkbox, pumili lang ng isa)
        'travel_yes'       => 'Check Box0',
        'travel_no'        => 'Check Box1',

        'service_business_employment' => 'Text Field35',
        'current_pension'  => 'Text Field36',

        // ===== II. FAMILY COMPOSITION =====
        // 21. Name of Spouse
        'spouse_last_name'   => 'Text Field37',
        'spouse_first_name'  => 'Text Field38',
        'spouse_middle_name' => 'Text Field39',
        'spouse_extension'   => 'Text Field40',

        // 22. Father's Name
        'father_last_name'   => 'Text Field41',
        'father_first_name'  => 'Text Field42',
        'father_middle_name' => 'Text Field43',
        'father_extension'   => 'Text Field44',

        // 23. Mother's Maiden Name
        'mother_last_name'   => 'Text Field45',
        'mother_first_name'  => 'Text Field46',
        'mother_middle_name' => 'Text Field47',

        // 24. Child(ren) - 5 rows x [full_name, occupation, income, age, working_status]
        'child_1_name' => 'Text Field48', 'child_1_occupation' => 'Text Field49',
        'child_1_income' => 'Text Field50', 'child_1_age' => 'Text Field51',
        'child_1_working' => 'Text Field52',

        'child_2_name' => 'Text Field53', 'child_2_occupation' => 'Text Field54',
        'child_2_income' => 'Text Field55', 'child_2_age' => 'Text Field56',
        'child_2_working' => 'Text Field57',

        'child_3_name' => 'Text Field58', 'child_3_occupation' => 'Text Field59',
        'child_3_income' => 'Text Field60', 'child_3_age' => 'Text Field61',
        'child_3_working' => 'Text Field62',

        'child_4_name' => 'Text Field63', 'child_4_occupation' => 'Text Field64',
        'child_4_income' => 'Text Field65', 'child_4_age' => 'Text Field66',
        'child_4_working' => 'Text Field67',

        'child_5_name' => 'Text Field68', 'child_5_occupation' => 'Text Field69',
        'child_5_income' => 'Text Field70', 'child_5_age' => 'Text Field71',
        'child_5_working' => 'Text Field72',

        // 25. Other Dependents - 2 rows x [full_name, occupation, income, age, working_status]
        'dependent_1_name' => 'Text Field73', 'dependent_1_occupation' => 'Text Field74',
        'dependent_1_income' => 'Text Field75', 'dependent_1_age' => 'Text Field76',
        'dependent_1_working' => 'Text Field77',

        'dependent_2_name' => 'Text Field78', 'dependent_2_occupation' => 'Text Field79',
        'dependent_2_income' => 'Text Field80', 'dependent_2_age' => 'Text Field81',
        'dependent_2_working' => 'Text Field82',

        // ===== III. EDUCATION / HR PROFILE =====
        // 26. Educational Attainment (checkbox, pumili ng isa)
        'educ_elementary_level'    => 'Check Box2',
        'educ_hs_graduate'         => 'Check Box4',
        'educ_post_graduate'       => 'Check Box3',
        'educ_elementary_graduate' => 'Check Box5',
        'educ_college_level'       => 'Check Box6',
        'educ_vocational'          => 'Check Box7',
        'educ_hs_level'            => 'Check Box8',
        'educ_college_graduate'    => 'Check Box9',
        'educ_not_attended_school' => 'Check Box10',

        // 27. Areas of Specialization / Technical Skills (check all applicable)
        'spec_medical'       => 'Check Box11',
        'spec_dental'        => 'Check Box12',
        'spec_fishing'       => 'Check Box13',
        'spec_engineering'   => 'Check Box14',
        'spec_barber'        => 'Check Box15',
        'spec_evangelization'=> 'Check Box16',
        'spec_millwright'    => 'Check Box17',
        'spec_teaching'      => 'Check Box18',
        'spec_counseling'    => 'Check Box19',
        'spec_cooking'       => 'Check Box20',
        'spec_carpenter'     => 'Check Box21',
        'spec_mason'         => 'Check Box22',
        'spec_tailor'        => 'Check Box23',
        'spec_others_flag'   => 'Check Box24', // "Others, specify" checkbox
        'spec_others_text'   => 'Text Field86', // text field kasunod
        'spec_legal_services'=> 'Check Box25',
        'spec_farming'       => 'Check Box26',
        'spec_arts'          => 'Check Box27',
        'spec_plumber'       => 'Check Box28',
        'spec_sapatero'      => 'Check Box29',
        'spec_chef_cook'     => 'Check Box30',

        // 28. Share Skill (Community Service) - 3 checkbox+text pairs
        'share_skill_1_check' => 'Check Box31', 'share_skill_1_text' => 'Text Field83',
        'share_skill_2_check' => 'Check Box32', 'share_skill_2_text' => 'Text Field84',
        'share_skill_3_check' => 'Check Box33', 'share_skill_3_text' => 'Text Field85',

        // 29. Community Service and Involvement (check all applicable)
        'comm_medical'              => 'Check Box34',
        'comm_org_leader'           => 'Check Box35',
        'comm_neighborhood_support' => 'Check Box36',
        'comm_counseling_referral'  => 'Check Box37',
        'comm_resource_volunteer'   => 'Check Box38',
        'comm_dental'               => 'Check Box39',
        'comm_legal_services'       => 'Check Box40',
        'comm_sponsorship'          => 'Check Box41',
        'comm_beautification'       => 'Check Box42',
        'comm_friendly_visits'      => 'Check Box43',
        'comm_religious'            => 'Check Box44',
        'comm_others_flag'          => 'Check Box45', // "Others, specify"
        'comm_others_text'          => 'Text Field87',

        // ===== IV. DEPENDENCY PROFILE =====
        // 30. Living/Residing with (check all applicable)
        'living_alone'          => 'Check Box125',
        'living_spouse'         => 'Check Box126',
        'living_children'       => 'Check Box127',
        'living_others_flag'    => 'Check Box128',
        'living_others_text'    => 'Text Field130',
        'living_grandchildren'  => 'Check Box129',
        'living_inlaws'         => 'Check Box130',
        'living_relatives'      => 'Check Box131',
        'living_common_law_spouse' => 'Check Box132',
        'living_care_institution'  => 'Check Box133',
        'living_friends'           => 'Check Box134',

        // 31. Household Condition (check all applicable)
        'household_no_privacy'       => 'Check Box135',
        'household_informal_settler' => 'Check Box136',
        'household_high_cost_rent'   => 'Check Box137',
        'household_others_flag'      => 'Check Box138',
        'household_others_text'      => 'Text Field131',
        'household_overcrowded'      => 'Check Box139',
        'household_no_permanent_house' => 'Check Box140',
        'household_longing_independent'=> 'Check Box141',

        // ===== V. ECONOMIC PROFILE =====
        // 32. Source of Income and Assistance (check all applicable)
        'income_own_earnings'      => 'Check Box142',
        'income_dependent_on_children' => 'Check Box143',
        'income_spouse_pension'    => 'Check Box144',
        'income_livestock_farm'    => 'Check Box145',
        'income_own_pension'       => 'Check Box146',
        'income_spouse_salary'     => 'Check Box147',
        'income_rentals_sharecrops'=> 'Check Box148',
        'income_fishing'           => 'Check Box149',
        'income_stocks_dividends'  => 'Check Box150',
        'income_insurance'         => 'Check Box151',
        'income_savings'           => 'Check Box152',
        'income_other_flag'        => 'Check Box153',
        'income_other_text'        => 'Text Field132',

        // 33. Assets: Real and Immovable Properties
        'asset_house'             => 'Check Box154',
        'asset_lot_farmland'      => 'Check Box155',
        'asset_house_and_lot'     => 'Check Box156',
        'asset_commercial_building' => 'Check Box157',
        'asset_fishpond_resort'   => 'Check Box158',
        'asset_real_others_flag'  => 'Check Box159',
        'asset_real_others_text'  => 'Text Field133',

        // 34. Assets: Personal and Movable Properties
        'asset_automobile'        => 'Check Box160',
        'asset_heavy_equipment'   => 'Check Box161',
        'asset_motorcycle'        => 'Check Box162',
        'asset_personal_computer' => 'Check Box163',
        'asset_laptops'           => 'Check Box164',
        'asset_mobile_phones'     => 'Check Box165',
        'asset_boats'             => 'Check Box166',
        'asset_drones'            => 'Check Box167',
        'asset_movable_specify_flag' => 'Check Box168',
        'asset_movable_specify_text' => 'Text Field134',

        // 35. Monthly Income (in Philippine Peso) - pumili ng isa
        'monthly_income_60k_above'    => 'Check Box169',
        'monthly_income_30k_40k'      => 'Check Box170',
        'monthly_income_5k_10k'       => 'Check Box171',
        'monthly_income_50k_60k'      => 'Check Box172',
        'monthly_income_20k_30k'      => 'Check Box173',
        'monthly_income_1k_5k'        => 'Check Box174',
        'monthly_income_40k_50k'      => 'Check Box175',
        'monthly_income_10k_20k'      => 'Check Box176',
        'monthly_income_below_1k'     => 'Check Box177',

        // 36. Problems / Needs Commonly Encountered (check all applicable)
        'problem_lack_income'       => 'Check Box178',
        'problem_loss_income'       => 'Check Box179',
        'problem_skills_training_flag' => 'Check Box180',
        'problem_skills_training_text' => 'Text Field136',
        'problem_livelihood_flag'   => 'Check Box181',
        'problem_livelihood_text'   => 'Text Field137',
        'problem_others_flag'       => 'Check Box182',
        'problem_others_text'       => 'Text Field138',

        // ===== VI. HEALTH PROFILE =====
        // 37. Medical Concern
        'blood_type_o'        => 'Check Box184',
        'blood_type_a'        => 'Check Box185',
        'blood_type_b'        => 'Check Box186',
        'blood_type_ab'       => 'Check Box187',
        'blood_type_dont_know'=> 'Check Box188',
        'physical_disability_flag' => 'Check Box189',
        'physical_disability_text' => 'Text Field139',
        'health_problems_ailments' => 'Check Box190',
        'health_hypertension'      => 'Check Box191',
        'health_diabetes'          => 'Check Box192',
        'health_alzheimers_dementia'=> 'Check Box193',
        'health_copd'               => 'Check Box194', // Chronic Obstructive Pulmonary Disease
        'health_others_flag'        => 'Check Box195',
        'health_others_text'        => 'Text Field141',
        'health_arthritis_gout'     => 'Check Box196',
        'health_chronic_kidney_disease' => 'Check Box197',
        'health_coronary_heart_disease' => 'Check Box198',

        // 38. Dental Concern
        'dental_needs_care'   => 'Check Box207',
        'dental_others_flag'  => 'Check Box208',
        'dental_others_text'  => 'Text Field143',

        // 39. Optical
        'optical_eye_impairment' => 'Check Box209',
        'optical_needs_eye_care' => 'Check Box210',
        'optical_others_flag'    => 'Check Box211',
        'optical_others_text'    => 'Text Field144',

        // 40. Hearing
        'hearing_aural_impairment' => 'Check Box199',
        'hearing_others_flag'      => 'Check Box200',
        'hearing_others_text'      => 'Text Field140',

        // 41. Social / Emotional
        'social_feeling_neglect'      => 'Check Box201',
        'social_feeling_helplessness' => 'Check Box202',
        'social_feeling_loneliness'   => 'Check Box203',
        'social_lack_leisure'         => 'Check Box204',
        'social_lack_sc_friendly_env' => 'Check Box205',
        'social_others_flag'          => 'Check Box206',
        'social_others_text'          => 'Text Field142',

        // 42. Area / Difficulty
        'difficulty_high_cost_medicines' => 'Check Box212',
        'difficulty_lack_medicines'      => 'Check Box213',
        'difficulty_lack_medical_attention' => 'Check Box214',
        'difficulty_others_flag'         => 'Check Box215',
        'difficulty_others_text'         => 'Text Field145',

        // 43. List of Medicines for Maintenance (4 rows x 3 columns)
        'medicine_1_col1' => 'Text Field146', 'medicine_1_col2' => 'Text Field150', 'medicine_1_col3' => 'Text Field154',
        'medicine_2_col1' => 'Text Field147', 'medicine_2_col2' => 'Text Field151', 'medicine_2_col3' => 'Text Field155',
        'medicine_3_col1' => 'Text Field148', 'medicine_3_col2' => 'Text Field152', 'medicine_3_col3' => 'Text Field156',
        'medicine_4_col1' => 'Text Field149', 'medicine_4_col2' => 'Text Field153', 'medicine_4_col3' => 'Text Field157',

        // 44. Do you have a scheduled medical/physical check-up?
        'checkup_yes' => 'Check Box216',
        'checkup_no'  => 'Check Box217',

        // 45. If Yes, when is it done?
        'checkup_yearly'       => 'Check Box218',
        'checkup_every_6_months' => 'Check Box219',
        'checkup_others'       => 'Check Box220',

        // ===== Signature Block =====
        'sig_senior_citizen'        => 'Text Field158',
        'sig_assisting_person_1'    => 'Text Field159',
        'sig_assisting_person_1_relationship' => 'Text Field162',
        'sig_assisting_person_2'    => 'Text Field160',
        'sig_assisting_person_2_relationship' => 'Text Field163',
        'sig_interviewer_verifier'  => 'Text Field161',
        'sig_organization_office'   => 'Text Field164',
        'interview_date'            => 'Text Field165',
        'interview_place'           => 'Text Field166',
    ];

    /**
     * Mga checkbox field_id na naka-group sa "pumili lang ng isa" pattern
     * (radio-button-like behavior kahit checkbox ang totoong type).
     * Kapag tinawag ang checkBox() para dito, awtomatikong ide-de-check
     * ang ibang miyembro ng parehong grupo.
     */
    public const EXCLUSIVE_GROUPS = [
        'travel' => ['travel_yes', 'travel_no'],
        'educational_attainment' => [
            'educ_elementary_level', 'educ_elementary_graduate', 'educ_hs_level',
            'educ_hs_graduate', 'educ_college_level', 'educ_college_graduate',
            'educ_post_graduate', 'educ_vocational', 'educ_not_attended_school',
        ],
        'monthly_income' => [
            'monthly_income_60k_above', 'monthly_income_50k_60k', 'monthly_income_40k_50k',
            'monthly_income_30k_40k', 'monthly_income_20k_30k', 'monthly_income_10k_20k',
            'monthly_income_5k_10k', 'monthly_income_1k_5k', 'monthly_income_below_1k',
        ],
        'blood_type' => ['blood_type_o', 'blood_type_a', 'blood_type_b', 'blood_type_ab', 'blood_type_dont_know'],
        'checkup_scheduled' => ['checkup_yes', 'checkup_no'],
        'checkup_frequency' => ['checkup_yearly', 'checkup_every_6_months', 'checkup_others'],
    ];

    public function __construct(string $sourcePdf, ?string $tmpDir = null)
    {
        if (!is_file($sourcePdf)) {
            throw new InvalidArgumentException("Hindi nahanap ang source PDF: {$sourcePdf}");
        }
        $this->sourcePdf = $sourcePdf;
        $this->tmpDir = $tmpDir ?? sys_get_temp_dir();
    }

    /**
     * Maglagay ng value sa isang text field, gamit ang "friendly name"
     * (hal. 'last_name') mula sa FIELD_MAP - hindi ang raw field_id.
     */
    public function setValue(string $friendlyName, ?string $value): static
    {
        $fieldId = $this->resolveFieldId($friendlyName);
        $this->values[$fieldId] = $value ?? '';
        return $this;
    }

    /**
     * I-check ang isang checkbox field. Kung kabilang ito sa isa sa
     * EXCLUSIVE_GROUPS, awtomatikong ide-de-check (unchecked) ang ibang
     * kasapi ng grupong iyon.
     */
    public function checkBox(string $friendlyName, bool $checked = true): static
    {
        $fieldId = $this->resolveFieldId($friendlyName);
        $this->values[$fieldId] = $checked ? '/Yes' : '/Off';
        $this->checkboxFieldIds[$fieldId] = true;

        if ($checked) {
            foreach (self::EXCLUSIVE_GROUPS as $group) {
                if (in_array($friendlyName, $group, true)) {
                    foreach ($group as $sibling) {
                        if ($sibling !== $friendlyName) {
                            $siblingFieldId = $this->resolveFieldId($sibling);
                            $this->values[$siblingFieldId] = '/Off';
                            $this->checkboxFieldIds[$siblingFieldId] = true;
                        }
                    }
                }
            }
        }
        return $this;
    }

    /** Convenience: itakda ang buong petsa ng kapanganakan mula sa isang DateTime o "YYYY-MM-DD" string. */
    public function setDateOfBirth(string|DateTimeInterface $date): static
    {
        $dt = $date instanceof DateTimeInterface ? $date : new DateTime($date);
        $this->setValue('dob_m1', $dt->format('m')[0]);
        $this->setValue('dob_m2', $dt->format('m')[1]);
        $this->setValue('dob_d1', $dt->format('d')[0]);
        $this->setValue('dob_d2', $dt->format('d')[1]);
        $this->setValue('dob_y1', $dt->format('y')[0]);
        $this->setValue('dob_y2', $dt->format('y')[1]);
        return $this;
    }

    /**
     * Convenience: maglagay ng isang buong row sa Section 24 (Child).
     * $rowNumber = 1..5
     */
    public function setChild(int $rowNumber, string $fullName, string $occupation = '', string $income = '', string $age = '', string $workingStatus = ''): static
    {
        if ($rowNumber < 1 || $rowNumber > 5) {
            throw new InvalidArgumentException('Ang child row ay dapat 1 hanggang 5 lamang.');
        }
        $this->setValue("child_{$rowNumber}_name", $fullName);
        $this->setValue("child_{$rowNumber}_occupation", $occupation);
        $this->setValue("child_{$rowNumber}_income", $income);
        $this->setValue("child_{$rowNumber}_age", $age);
        $this->setValue("child_{$rowNumber}_working", $workingStatus);
        return $this;
    }

    /** Convenience: maglagay ng isang buong row sa Section 25 (Other Dependents). $rowNumber = 1..2 */
    public function setDependent(int $rowNumber, string $fullName, string $occupation = '', string $income = '', string $age = '', string $workingStatus = ''): static
    {
        if ($rowNumber < 1 || $rowNumber > 2) {
            throw new InvalidArgumentException('Ang dependent row ay dapat 1 hanggang 2 lamang.');
        }
        $this->setValue("dependent_{$rowNumber}_name", $fullName);
        $this->setValue("dependent_{$rowNumber}_occupation", $occupation);
        $this->setValue("dependent_{$rowNumber}_income", $income);
        $this->setValue("dependent_{$rowNumber}_age", $age);
        $this->setValue("dependent_{$rowNumber}_working", $workingStatus);
        return $this;
    }

    /** Convenience: maglagay ng isang buong row sa Section 43 (List of Medicines). $rowNumber = 1..4 */
    public function setMedicine(int $rowNumber, string $col1 = '', string $col2 = '', string $col3 = ''): static
    {
        if ($rowNumber < 1 || $rowNumber > 4) {
            throw new InvalidArgumentException('Ang medicine row ay dapat 1 hanggang 4 lamang.');
        }
        $this->setValue("medicine_{$rowNumber}_col1", $col1);
        $this->setValue("medicine_{$rowNumber}_col2", $col2);
        $this->setValue("medicine_{$rowNumber}_col3", $col3);
        return $this;
    }

    /** Ibalik ang raw field_id na kaugnay ng ibinigay na friendly name. */
    protected function resolveFieldId(string $friendlyName): string
    {
        if (!isset(self::FIELD_MAP[$friendlyName])) {
            throw new InvalidArgumentException("Walang ganitong field sa NCSC form: '{$friendlyName}'. Tingnan ang NcscFormFiller::FIELD_MAP para sa listahan ng valid na field names.");
        }
        return self::FIELD_MAP[$friendlyName];
    }

    /**
     * Gumawa ng FDF (Forms Data Format) content mula sa mga naka-set na values.
     * Ito ang "data file" na ipapasa sa pdftk.
     */
    protected function buildFdf(): string
    {
        $fdf = "%FDF-1.2\n1 0 obj<</FDF<</Fields[\n";
        foreach ($this->values as $fieldId => $value) {
            $escapedName = $this->escapeFdfString($fieldId);

            if (isset($this->checkboxFieldIds[$fieldId])) {
                // Checkbox/radio values ay PDF Name objects - dapat isulat
                // nang WALANG parenthesis (hal. /V/Yes>>, hindi /V(/Yes)>>).
                // Ang value dito ay laging '/Yes' o '/Off' na, kaya ligtas
                // na direktang isingit nang walang extra escaping.
                $fdf .= "<</T({$escapedName})/V{$value}>>\n";
            } else {
                // Text field values ay string literals - dapat naka-loob
                // sa parenthesis, may proper escaping.
                $escapedValue = $this->escapeFdfString((string) $value);
                $fdf .= "<</T({$escapedName})/V({$escapedValue})>>\n";
            }
        }
        $fdf .= "]>>>>\nendobj\ntrailer<</Root 1 0 R>>\n%%EOF";
        return $fdf;
    }

    /**
     * I-escape ang mga special characters na kailangang i-escape sa loob
     * ng FDF string literals: backslash at mga parenthesis.
     * Sapat na ang plain UTF-8 dito - tinatanggap ito ng pdftk-java
     * (ang modernong maintained fork) nang walang extra hex-encoding.
     */
    protected function escapeFdfString(string $value): string
    {
        return str_replace(['\\', '(', ')'], ['\\\\', '\\(', '\\)'], $value);
    }

    /**
     * I-fill ang PDF gamit ang pdftk at i-save sa ibinigay na output path.
     * Ibabalik ang absolute path ng na-generate na PDF.
     *
     * @param string $outputPath  Saan ise-save ang filled PDF
     * @param bool   $flatten     Kung true, gagawing hindi na ma-eedit ang mga
     *                            field (parang "print" na version) - default false
     *                            para maaari pa ring baguhin sa Adobe/browser kung kinakailangan.
     */
    public function save(string $outputPath, bool $flatten = false): string
    {
        if (empty($this->values)) {
            throw new RuntimeException('Walang laman na i-fi-fill - tumawag muna ng setValue()/checkBox() bago mag-save().');
        }

        $outputDir = dirname($outputPath);
        if (!is_dir($outputDir) && !mkdir($outputDir, 0775, true) && !is_dir($outputDir)) {
            throw new RuntimeException("Hindi magawa ang output directory: {$outputDir}");
        }

        $fdfPath = tempnam($this->tmpDir, 'ncsc_fdf_') . '.fdf';
        file_put_contents($fdfPath, $this->buildFdf());

        $sourcePdfEsc = escapeshellarg($this->sourcePdf);
        $fdfPathEsc = escapeshellarg($fdfPath);
        $outputPathEsc = escapeshellarg($outputPath);

        $flattenFlag = $flatten ? 'flatten' : '';
        $command = "pdftk {$sourcePdfEsc} fill_form {$fdfPathEsc} output {$outputPathEsc} {$flattenFlag} 2>&1";

        exec($command, $outputLines, $exitCode);
        @unlink($fdfPath);

        if ($exitCode !== 0 || !is_file($outputPath)) {
            $errorDetail = implode("\n", $outputLines);
            throw new RuntimeException("Nabigo ang pdftk sa pag-fill ng NCSC form (exit code {$exitCode}): {$errorDetail}");
        }

        return $outputPath;
    }

    /** Ibalik ang listahan ng lahat ng valid na friendly field names (para sa validation/UI building). */
    public static function availableFields(): array
    {
        return array_keys(self::FIELD_MAP);
    }
}
