<?php
/**
 * Test script para sa NcscFormFiller.
 * Gumagamit ng dummy data (senior citizen na fictional) para i-verify
 * na gumagana ang buong pipeline: PHP -> FDF -> pdftk -> filled PDF.
 */

require_once __DIR__ . '/NcscFormFiller.php';

$sourcePdf = '/mnt/user-data/uploads/1d227f_d71595eadc864e58bbccfd1c755f2381.pdf';
$outputPdf = '/home/claude/ncsc_form/php_solution/test_output.pdf';

$filler = new NcscFormFiller($sourcePdf);

// ===== I. IDENTIFYING INFORMATION =====
$filler->setValue('last_name', 'Santos')
    ->setValue('first_name', 'Rosario')
    ->setValue('middle_name', 'Villanueva')
    ->setValue('name_extension', '')
    ->setValue('region', 'Region IV-A (CALABARZON)')
    ->setValue('province', 'Cavite')
    ->setValue('city_municipality', 'Carmona')
    ->setValue('barangay', 'Poblacion')
    ->setValue('house_no_zone', 'Blk 5 Lot 12, Purok 3')
    ->setValue('street', 'Mabini Street')
    ->setDateOfBirth('1958-03-14')
    ->setValue('place_of_birth', 'Carmona, Cavite')
    ->setValue('marital_status', 'Widowed')
    ->setValue('gender_sex', 'Female')
    ->setValue('contact_number', '0917-123-4567')
    ->setValue('email_address', 'rosario.santos@example.com')
    ->setValue('religion', 'Roman Catholic')
    ->setValue('ethnic_origin', 'Tagalog')
    ->setValue('language_spoken', 'Tagalog, English')
    ->setValue('osca_id_number', 'OSCA-2024-00123')
    ->setValue('gsis_sss', 'SSS-03-1234567-8')
    ->setValue('tin', '123-456-789-000')
    ->setValue('philhealth', 'PH-01-234567890-1')
    ->setValue('sc_assoc_org_id', 'FSCAC-0456')
    ->setValue('other_govt_id', 'Passport P1234567A');

$filler->checkBox('travel_yes');
$filler->setValue('service_business_employment', 'Retired Public School Teacher');
$filler->setValue('current_pension', 'GSIS Pension - PHP 8,500/month');

// ===== II. FAMILY COMPOSITION =====
$filler->setValue('spouse_last_name', 'Santos')
    ->setValue('spouse_first_name', 'Eduardo')
    ->setValue('spouse_middle_name', 'Reyes')
    ->setValue('spouse_extension', 'Sr.');

$filler->setValue('father_last_name', 'Villanueva')
    ->setValue('father_first_name', 'Pedro')
    ->setValue('father_middle_name', 'Cruz');

$filler->setValue('mother_last_name', 'Cruz')
    ->setValue('mother_first_name', 'Maria')
    ->setValue('mother_middle_name', 'Garcia');

$filler->setChild(1, 'Juan Carlos Santos', 'Engineer', '45,000', '38', 'Working');
$filler->setChild(2, 'Ana Marie Santos-Reyes', 'Nurse', '35,000', '35', 'Working');
$filler->setDependent(1, 'Sofia Santos', 'Student', '0', '16', 'Not working');

// ===== III. EDUCATION / HR PROFILE =====
$filler->checkBox('educ_college_graduate');
$filler->checkBox('spec_teaching');
$filler->setValue('share_skill_1_text', 'Basic literacy tutoring for out-of-school youth');
$filler->checkBox('share_skill_1_check');
$filler->checkBox('comm_org_leader');
$filler->checkBox('comm_religious');

// ===== IV. DEPENDENCY PROFILE =====
$filler->checkBox('living_children');
$filler->checkBox('household_no_permanent_house', false); // explicitly unchecked for clarity

// ===== V. ECONOMIC PROFILE =====
$filler->checkBox('income_own_pension');
$filler->checkBox('asset_house_and_lot');
$filler->checkBox('asset_mobile_phones');
$filler->checkBox('monthly_income_5k_10k');
$filler->checkBox('problem_lack_income');

// ===== VI. HEALTH PROFILE =====
$filler->checkBox('blood_type_o');
$filler->checkBox('health_hypertension');
$filler->checkBox('health_diabetes');
$filler->setMedicine(1, 'Metformin', '500mg, 2x daily', 'Maintenance');
$filler->setMedicine(2, 'Losartan', '50mg, 1x daily', 'Maintenance');
$filler->checkBox('dental_needs_care');
$filler->checkBox('optical_needs_eye_care');
$filler->checkBox('difficulty_high_cost_medicines');
$filler->checkBox('checkup_yes');
$filler->checkBox('checkup_every_6_months');

// ===== Signature Block =====
$filler->setValue('sig_senior_citizen', 'Rosario V. Santos');
$filler->setValue('sig_assisting_person_1', 'Juan Carlos Santos');
$filler->setValue('sig_assisting_person_1_relationship', 'Son');
$filler->setValue('sig_interviewer_verifier', 'Maria Fe Dela Cruz');
$filler->setValue('sig_organization_office', 'OSCA Carmona, Cavite');
$filler->setValue('interview_date', 'August 20, 2026');
$filler->setValue('interview_place', 'OSCA Office, Carmona Municipal Hall');

try {
    $result = $filler->save($outputPdf);
    echo "SUCCESS: Na-save ang filled form sa: {$result}\n";
    echo "File size: " . filesize($result) . " bytes\n";
} catch (Throwable $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
    exit(1);
}
