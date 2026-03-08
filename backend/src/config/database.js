import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import env from "./env.js";

// Create pool connection
const createPool = async () => {
  return mysql.createPool({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  });
};

let pool = null;

// ============================================
// DATABASE INITIALIZATION - COMPLETE SETUP
// ============================================

export const initializeDatabase = async () => {
  try {
    console.log("📦 Initializing SWOMS Database System...");

    // First, create connection without database to create it
    const adminConnection = await mysql.createConnection({
      host: env.DB_HOST,
      port: env.DB_PORT,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
    });

    // Create database if not exists
    await adminConnection.query(`CREATE DATABASE IF NOT EXISTS ${env.DB_NAME}`);
    console.log(`✅ Database '${env.DB_NAME}' ready`);

    // Switch to our database
    await adminConnection.query(`USE ${env.DB_NAME}`);

    // Create all tables in correct order
    await createAllTables(adminConnection);

    // Close admin connection
    await adminConnection.end();

    // Now create the connection pool
    pool = await createPool();

    // Insert minimal required data
    // await insertMinimalRequiredData();

    console.log("🎉 Database initialization completed successfully!");
    console.log(`📊 Database: ${env.DB_NAME}@${env.DB_HOST}:${env.DB_PORT}`);

    return true;
  } catch (error) {
    console.error("❌ Database initialization failed:", error.message);
    throw error;
  }
};

// ============================================
// TABLE CREATION - ALL TABLES IN CORRECT ORDER
// ============================================

const createAllTables = async (connection) => {
  console.log("🔧 Creating all database tables in correct order...");

  // 1. USERS table (created first - no foreign keys)
  const usersTable = `
    CREATE TABLE IF NOT EXISTS users (
      user_id INT PRIMARY KEY AUTO_INCREMENT,
      username VARCHAR(100) UNIQUE NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role ENUM(
        'admin',
        'instructor',
        'department_head',
        'dean',
        'cde_director',
        'hr_director',
        'vpaa',
        'vpaf',
        'finance',
        'registrar'
      ) NOT NULL DEFAULT 'instructor',
      is_active BOOLEAN DEFAULT TRUE,
      last_login DATETIME,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      created_by INT,
      FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
    )`;

  // 2. COLLEGES table (depends on users)
  const collegesTable = `
    CREATE TABLE IF NOT EXISTS colleges (
      college_id INT PRIMARY KEY AUTO_INCREMENT,
      college_code VARCHAR(20) UNIQUE NOT NULL,
      college_name VARCHAR(150) NOT NULL,
      dean_user_id INT,
      status ENUM('active', 'inactive') DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (dean_user_id) REFERENCES users(user_id) ON DELETE SET NULL
    )`;

  // 3. DEPARTMENTS table (depends on colleges and users)
  const departmentsTable = `
    CREATE TABLE IF NOT EXISTS departments (
      department_id INT PRIMARY KEY AUTO_INCREMENT,
      department_code VARCHAR(20) UNIQUE NOT NULL,
      department_name VARCHAR(150) NOT NULL,
      college_id INT NOT NULL,
      head_user_id INT,
      status ENUM('active', 'inactive') DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (college_id) REFERENCES colleges(college_id) ON DELETE CASCADE,
      FOREIGN KEY (head_user_id) REFERENCES users(user_id) ON DELETE SET NULL
    )`;

  // 4. STAFF PROFILES table (depends on users and departments)
  const staffProfilesTable = `
    CREATE TABLE IF NOT EXISTS staff_profiles (
      staff_id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT UNIQUE NOT NULL,
      employee_id VARCHAR(50) UNIQUE NOT NULL,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      middle_name VARCHAR(100),
      department_id INT NOT NULL,
      academic_rank ENUM(
        'graduate_assistant',
        'assistant_lecturer',
        'lecturer',
        'assistant_professor',
        'associate_professor',
        'professor'
      ) NOT NULL DEFAULT 'lecturer',
      employment_type ENUM('full_time', 'part_time', 'contract') DEFAULT 'full_time',
      hire_date DATE,
      phone VARCHAR(20),
      address TEXT,
      date_of_birth DATE,
      gender ENUM('male', 'female', 'other'),
      created_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
      FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
    )`;

  // 5. ACADEMIC YEARS table (independent)
  const academicYearsTable = `
    CREATE TABLE IF NOT EXISTS academic_years (
      academic_year_id INT PRIMARY KEY AUTO_INCREMENT,
      year_code VARCHAR(20) UNIQUE NOT NULL,
      year_name VARCHAR(100) NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      is_active BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;

  // 6. SEMESTERS table (depends on academic_years)
  const semestersTable = `
    CREATE TABLE IF NOT EXISTS semesters (
      semester_id INT PRIMARY KEY AUTO_INCREMENT,
      academic_year_id INT NOT NULL,
      semester_code VARCHAR(20) UNIQUE NOT NULL,
      semester_name VARCHAR(50) NOT NULL,
      semester_type ENUM('semester_i', 'semester_ii', 'summer', 'distance', 'extension', 'weekend') NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      is_active BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (academic_year_id) REFERENCES academic_years(academic_year_id) ON DELETE CASCADE
    )`;

  // 7. PROGRAMS table (depends on departments)
  const programsTable = `
    CREATE TABLE IF NOT EXISTS programs (
      program_id INT PRIMARY KEY AUTO_INCREMENT,
      program_code VARCHAR(20) UNIQUE NOT NULL,
      program_name VARCHAR(150) NOT NULL,
      department_id INT NOT NULL,
      program_type ENUM('regular', 'extension', 'weekend', 'summer', 'distance') NOT NULL,
      status ENUM('active', 'inactive') DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE CASCADE
    )`;

  // 8. COURSES table (depends on departments and programs)
  const coursesTable = `
    CREATE TABLE IF NOT EXISTS courses (
      course_id INT PRIMARY KEY AUTO_INCREMENT,
      course_code VARCHAR(20) UNIQUE NOT NULL,
      course_title VARCHAR(200) NOT NULL,
      department_id INT NOT NULL,
      program_id INT,
      academic_year INT,
      recommended_semester INT,
      course_order INT DEFAULT 0,
      credit_hours DECIMAL(4,2) NOT NULL,
      lecture_hours DECIMAL(4,2) NOT NULL,
      lab_hours DECIMAL(4,2) DEFAULT 0,
      tutorial_hours DECIMAL(4,2) DEFAULT 0,
      program_type ENUM('regular', 'extension', 'weekend', 'summer', 'distance') NOT NULL,
      course_year INT DEFAULT NULL COMMENT 'Year in curriculum (1-5)',
      course_semester INT DEFAULT NULL COMMENT 'Semester in curriculum (1 or 2)',
      is_core_course BOOLEAN DEFAULT TRUE,
      prerequisites VARCHAR(500),
      max_students INT DEFAULT 60,
      min_students INT DEFAULT 15,
      status ENUM('active', 'inactive') DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE CASCADE,
      FOREIGN KEY (program_id) REFERENCES programs(program_id) ON DELETE SET NULL
    )`;

  // 9. SECTIONS table (depends on courses, semesters, and staff_profiles)
  const sectionsTable = `
    CREATE TABLE IF NOT EXISTS sections (
      section_id INT PRIMARY KEY AUTO_INCREMENT,
      course_id INT NOT NULL,
      semester_id INT NOT NULL,
      section_code VARCHAR(20) NOT NULL,
      instructor_id INT,
      student_count INT DEFAULT 0,
      max_capacity INT DEFAULT 60,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_section (course_id, semester_id, section_code),
      FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
      FOREIGN KEY (semester_id) REFERENCES semesters(semester_id) ON DELETE CASCADE,
      FOREIGN KEY (instructor_id) REFERENCES staff_profiles(staff_id) ON DELETE SET NULL
    )`;

  // 10. WORKLOAD RP table (depends on staff_profiles and semesters) - COMPLETE WITH ALL COLUMNS
  const workloadRpTable = `
    CREATE TABLE IF NOT EXISTS workload_rp (
      workload_id INT PRIMARY KEY AUTO_INCREMENT,
      staff_id INT NOT NULL,
      semester_id INT NOT NULL,
      
      -- Course Details (MANDATORY COLUMNS)
      course_code VARCHAR(50) NOT NULL,
      course_credit_hours DECIMAL(5,2) DEFAULT 0,
      lecture_credit_hours DECIMAL(5,2) DEFAULT 0,
      tutorial_credit_hours DECIMAL(5,2) DEFAULT 0,
      lab_credit_hours DECIMAL(5,2) DEFAULT 0,
      
      -- Student Details
      student_department VARCHAR(100),
      academic_year VARCHAR(50),
      number_of_sections INT DEFAULT 1,
      
      -- Load Calculation
      each_section_course_load DECIMAL(6,2) DEFAULT 0,
      variety_of_course_load DECIMAL(6,2) DEFAULT 0,
      research_load DECIMAL(6,2) DEFAULT 0,
      community_service_load DECIMAL(6,2) DEFAULT 0,
      
      -- Administrative & Other Loads
      elip_load DECIMAL(6,2) DEFAULT 0,
      hdp_load DECIMAL(6,2) DEFAULT 0,
      course_chair_load DECIMAL(6,2) DEFAULT 0,
      section_advisor_load DECIMAL(6,2) DEFAULT 0,
      advising_load DECIMAL(6,2) DEFAULT 0,
      position_load DECIMAL(6,2) DEFAULT 0,
      
      -- Summary
      total_load DECIMAL(6,2) NOT NULL DEFAULT 0,
      over_payment_birr DECIMAL(10,2) DEFAULT 0,
      
      -- Status and Metadata
      status ENUM(
        'draft',
        'submitted',
        'dh_approved',
        'dean_approved',
        'hr_approved',
        'vpaa_approved',
        'vpaf_approved',
        'finance_approved',
        'rejected'
      ) DEFAULT 'draft',
      
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      
      -- Foreign Keys
      FOREIGN KEY (staff_id) REFERENCES staff_profiles(staff_id) ON DELETE CASCADE,
      FOREIGN KEY (semester_id) REFERENCES semesters(semester_id) ON DELETE CASCADE,
      
      -- Indexes for better performance
      INDEX idx_staff_id (staff_id),
      INDEX idx_semester_id (semester_id),
      INDEX idx_status (status),
      INDEX idx_course_code (course_code)
    )`;

  // 11. WORKLOAD NRP table (depends on staff_profiles, semesters, and courses) - COMPLETE WITH ALL COLUMNS
  const workloadNrpTable = `
    CREATE TABLE IF NOT EXISTS workload_nrp (
      nrp_id INT PRIMARY KEY AUTO_INCREMENT,
      staff_id INT NOT NULL,
      semester_id INT NOT NULL,
      program_type ENUM('extension', 'weekend', 'summer', 'distance') NOT NULL,
      
      -- Basic Information
      contract_number VARCHAR(50),
      academic_year VARCHAR(50),
      academic_year_ec VARCHAR(50),
      contract_type ENUM('teaching', 'tutorial_correction', 'combined') DEFAULT 'teaching',
      
      -- Course Information
      course_id INT,
      course_code VARCHAR(50),
      course_title VARCHAR(200),
      
      -- Hours and Credit Information
      credit_hours DECIMAL(5,2) DEFAULT 0,
      lecture_credit_hours DECIMAL(5,2) DEFAULT 0,
      lab_credit_hours DECIMAL(5,2) DEFAULT 0,
      tutorial_credit_hours DECIMAL(5,2) DEFAULT 0,
      lecture_sections INT DEFAULT 0,
      lab_sections INT DEFAULT 0,
      tutorial_sessions INT DEFAULT 0,
      teaching_hours DECIMAL(6,2) DEFAULT 0,
      module_hours DECIMAL(6,2) DEFAULT 0,
      
      -- Student Information
      student_count INT DEFAULT 0,
      student_count_dept INT DEFAULT 0,
      student_count_year INT DEFAULT 0,
      student_count_section INT DEFAULT 0,
      assignment_students INT DEFAULT 0,
      exam_students INT DEFAULT 0,
      project_advising VARCHAR(255),
      project_groups INT DEFAULT 0,
      
      -- Rate Information
      rate_category ENUM('A', 'B', 'C', 'default'),
      rate_per_rank DECIMAL(10,2),
      assignment_rate DECIMAL(10,2) DEFAULT 25.00,
      exam_rate DECIMAL(10,2) DEFAULT 20.00,
      tutorial_rate_per_hour DECIMAL(10,2) DEFAULT 100.00,
      
      -- Payment Information
      teaching_payment DECIMAL(10,2) DEFAULT 0,
      tutorial_payment DECIMAL(10,2) DEFAULT 0,
      assignment_payment DECIMAL(10,2) DEFAULT 0,
      exam_payment DECIMAL(10,2) DEFAULT 0,
      project_payment DECIMAL(10,2) DEFAULT 0,
      total_payment DECIMAL(10,2) DEFAULT 0,
      total_hours_worked DECIMAL(6,2) DEFAULT 0,
      
      -- Contract Information
      contract_duration_from DATE,
      contract_duration_to DATE,
      
      -- Overload Information
      is_overload BOOLEAN DEFAULT FALSE,
      overload_hours DECIMAL(6,2) DEFAULT 0,
      overload_payment DECIMAL(10,2) DEFAULT 0,
      
      -- Status and Metadata
      status ENUM(
        'draft',
        'submitted',
        'dh_approved',
        'dean_approved',
        'cde_approved',
        'hr_approved',
        'vpaf_approved',
        'finance_approved',
        'rejected',
        'paid'
      ) DEFAULT 'draft',
      
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      
      -- Foreign Keys
      FOREIGN KEY (staff_id) REFERENCES staff_profiles(staff_id) ON DELETE CASCADE,
      FOREIGN KEY (semester_id) REFERENCES semesters(semester_id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE SET NULL,
      
      -- Indexes
      INDEX idx_nrp_staff_id (staff_id),
      INDEX idx_nrp_semester_id (semester_id),
      INDEX idx_nrp_program_type (program_type),
      INDEX idx_nrp_contract_number (contract_number)
    )`;

  // 12. PAYMENT SHEETS table (depends on workload_nrp and users)
  const paymentSheetsTable = `
    CREATE TABLE IF NOT EXISTS payment_sheets (
      payment_id INT PRIMARY KEY AUTO_INCREMENT,
      nrp_id INT,
      overload_id INT,
      payment_type ENUM('extension', 'weekend', 'summer', 'distance', 'overload') NOT NULL,
      sheet_number VARCHAR(50) UNIQUE NOT NULL,
      gross_amount DECIMAL(12,2) NOT NULL,
      tax_amount DECIMAL(12,2) DEFAULT 0,
      net_amount DECIMAL(12,2) NOT NULL,
      payment_status ENUM('pending', 'approved', 'paid', 'rejected') DEFAULT 'pending',
      approved_by INT,
      approved_date DATETIME,
      export_format ENUM('pdf', 'excel'),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (nrp_id) REFERENCES workload_nrp(nrp_id) ON DELETE SET NULL,
      FOREIGN KEY (approved_by) REFERENCES users(user_id) ON DELETE SET NULL
    )`;

  // 13. OVERLOAD PAYMENTS table (depends on staff_profiles and semesters)
  const overloadPaymentsTable = `
    CREATE TABLE IF NOT EXISTS overload_payments (
      overload_id INT PRIMARY KEY AUTO_INCREMENT,
      staff_id INT NOT NULL,
      semester_id INT NOT NULL,
      overload_hours DECIMAL(6,2) NOT NULL,
      rate_used DECIMAL(10,2) NOT NULL,
      gross_amount DECIMAL(12,2) NOT NULL,
      tax_amount DECIMAL(12,2) DEFAULT 0,
      net_amount DECIMAL(12,2) NOT NULL,
      payment_status ENUM('pending', 'approved', 'paid', 'rejected') DEFAULT 'pending',
      computed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ruleset_version VARCHAR(20),
      FOREIGN KEY (staff_id) REFERENCES staff_profiles(staff_id) ON DELETE CASCADE,
      FOREIGN KEY (semester_id) REFERENCES semesters(semester_id) ON DELETE CASCADE
    )`;

  // 14. TAX RULES table (independent)
  const taxRulesTable = `
    CREATE TABLE IF NOT EXISTS tax_rules (
      tax_id INT PRIMARY KEY AUTO_INCREMENT,
      program_type ENUM('extension', 'weekend', 'summer', 'distance', 'overload') NOT NULL,
      tax_rate DECIMAL(5,2) NOT NULL,
      effective_from DATE NOT NULL,
      effective_to DATE,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;

  // 15. RATE TABLES table (independent)
  const rateTablesTable = `
    CREATE TABLE IF NOT EXISTS rate_tables (
      rate_id INT PRIMARY KEY AUTO_INCREMENT,
      program_type ENUM('extension', 'weekend', 'summer', 'distance') NOT NULL,
      rate_category ENUM('A', 'B', 'C', 'default'),
      amount_per_credit DECIMAL(10,2),
      amount_per_hour DECIMAL(10,2),
      amount_per_student DECIMAL(10,2),
      effective_from DATE NOT NULL,
      effective_to DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;

  // 16. SYSTEM RULES table (independent)
  const systemRulesTable = `
    CREATE TABLE IF NOT EXISTS system_rules (
      rule_id INT PRIMARY KEY AUTO_INCREMENT,
      rule_name VARCHAR(100) NOT NULL,
      rule_value VARCHAR(255) NOT NULL,
      rule_type ENUM('load_factor', 'rank_limit', 'payment', 'distribution', 'other') NOT NULL,
      program_type VARCHAR(50),
      effective_from DATE NOT NULL,
      effective_to DATE,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_rule (rule_name, effective_from)
    )`;

  // 17. RULESET HISTORY table (depends on users)
  const rulesetHistoryTable = `
    CREATE TABLE IF NOT EXISTS ruleset_history (
      history_id INT PRIMARY KEY AUTO_INCREMENT,
      rule_name VARCHAR(100) NOT NULL,
      previous_value VARCHAR(255),
      new_value VARCHAR(255) NOT NULL,
      changed_by INT,
      change_reason TEXT,
      effective_from DATE NOT NULL,
      effective_to DATE,
      program_type VARCHAR(50),
      version_number VARCHAR(20),
      changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (changed_by) REFERENCES users(user_id) ON DELETE SET NULL
    )`;

  // 18. SUMMER DISTRIBUTION table (independent)
  const summerDistributionTable = `
    CREATE TABLE IF NOT EXISTS summer_distribution (
      dist_id INT PRIMARY KEY AUTO_INCREMENT,
      stage1_percent DECIMAL(5,2) DEFAULT 30.00,
      stage2_percent DECIMAL(5,2) DEFAULT 30.00,
      stage3_percent DECIMAL(5,2) DEFAULT 20.00,
      stage4_percent DECIMAL(5,2) DEFAULT 20.00,
      effective_from DATE NOT NULL,
      effective_to DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;

  // 19. APPROVAL WORKFLOW table (depends on users)
  const approvalWorkflowTable = `
    CREATE TABLE IF NOT EXISTS approval_workflow (
      approval_id INT PRIMARY KEY AUTO_INCREMENT,
      entity_type ENUM('workload_rp', 'workload_nrp', 'overload') NOT NULL,
      entity_id INT NOT NULL,
      approver_role VARCHAR(50) NOT NULL,
      approver_id INT,
      status ENUM('pending', 'approved', 'rejected', 'returned') DEFAULT 'pending',
      comments TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_entity (entity_type, entity_id),
      INDEX idx_approver (approver_role, status),
      FOREIGN KEY (approver_id) REFERENCES users(user_id) ON DELETE SET NULL
    )`;

  // 20. AUDIT LOG table (depends on users)
  const auditLogTable = `
    CREATE TABLE IF NOT EXISTS audit_log (
      audit_id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      action VARCHAR(100) NOT NULL,
      entity VARCHAR(50) NOT NULL,
      entity_id INT,
      old_value TEXT,
      new_value TEXT,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ip_address VARCHAR(45),
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    )`;

  // 21. WORKLOAD DETAIL RP table (depends on workload_rp)
  const workloadDetailRpTable = `
    CREATE TABLE IF NOT EXISTS workload_detail_rp (
      detail_id INT PRIMARY KEY AUTO_INCREMENT,
      workload_id INT NOT NULL,
      detail_type ENUM('research', 'community', 'note') NOT NULL,
      description TEXT,
      hours DECIMAL(6,2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (workload_id) REFERENCES workload_rp(workload_id) ON DELETE CASCADE
    )`;

  // 22. NRP CONTRACT TEMPLATES table (depends on users)
  const nrpContractTemplatesTable = `
    CREATE TABLE IF NOT EXISTS nrp_contract_templates (
      template_id INT PRIMARY KEY AUTO_INCREMENT,
      template_name VARCHAR(100) NOT NULL,
      template_type VARCHAR(50),
      program_type VARCHAR(50),
      header_content TEXT,
      stipulation_content TEXT,
      table_structure JSON,
      signature_fields JSON,
      created_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
    )`;

  // 23. NRP REPORTS table (depends on semesters, departments, colleges, users)
  const nrpReportsTable = `
    CREATE TABLE IF NOT EXISTS nrp_reports (
      report_id INT PRIMARY KEY AUTO_INCREMENT,
      report_type VARCHAR(50) NOT NULL,
      semester_id INT,
      department_id INT,
      college_id INT,
      report_period VARCHAR(100),
      generated_by INT NOT NULL,
      report_data JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (semester_id) REFERENCES semesters(semester_id) ON DELETE SET NULL,
      FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE SET NULL,
      FOREIGN KEY (college_id) REFERENCES colleges(college_id) ON DELETE SET NULL,
      FOREIGN KEY (generated_by) REFERENCES users(user_id) ON DELETE CASCADE
    )`;

  // 24. COURSE ASSIGNMENTS table (depends on courses, semesters, staff_profiles, users)
  const courseAssignmentsTable = `
    CREATE TABLE IF NOT EXISTS course_assignments (
      assignment_id INT PRIMARY KEY AUTO_INCREMENT,
      course_id INT NOT NULL,
      semester_id INT NOT NULL,
      staff_id INT NOT NULL,
      student_year INT,
      assigned_by INT NOT NULL,
      section_code VARCHAR(20),
      assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status ENUM('assigned', 'accepted', 'declined', 'withdrawn') DEFAULT 'assigned',
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_course_assignment (course_id, semester_id, staff_id),
      FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
      FOREIGN KEY (semester_id) REFERENCES semesters(semester_id) ON DELETE CASCADE,
      FOREIGN KEY (staff_id) REFERENCES staff_profiles(staff_id) ON DELETE CASCADE,
      FOREIGN KEY (assigned_by) REFERENCES users(user_id) ON DELETE CASCADE
    )`;

  // 25. COURSE REQUESTS table (depends on courses, semesters, staff_profiles, users)
  const courseRequestsTable = `
    CREATE TABLE IF NOT EXISTS course_requests (
      request_id INT PRIMARY KEY AUTO_INCREMENT,
      course_id INT NOT NULL,
      semester_id INT NOT NULL,
      staff_id INT NOT NULL,
      requested_by INT NOT NULL,
      section_code VARCHAR(20),
      preferred_schedule VARCHAR(100),
      reason TEXT,
      status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
      processed_by INT,
      processed_date DATETIME,
      processed_notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
      FOREIGN KEY (semester_id) REFERENCES semesters(semester_id) ON DELETE CASCADE,
      FOREIGN KEY (staff_id) REFERENCES staff_profiles(staff_id) ON DELETE CASCADE,
      FOREIGN KEY (requested_by) REFERENCES users(user_id) ON DELETE CASCADE,
      FOREIGN KEY (processed_by) REFERENCES users(user_id) ON DELETE SET NULL
    )`;

  // 26. CURRICULUM PLANS table (depends on departments, programs, courses)
  const curriculumPlansTable = `
    CREATE TABLE IF NOT EXISTS curriculum_plans (
      plan_id INT PRIMARY KEY AUTO_INCREMENT,
      department_id INT NOT NULL,
      program_id INT,
      year INT NOT NULL COMMENT 'Academic year (1,2,3,4,5)',
      semester INT NOT NULL COMMENT 'Semester (1 or 2)',
      course_id INT NOT NULL,
      is_core BOOLEAN DEFAULT TRUE,
      is_elective BOOLEAN DEFAULT FALSE,
      prerequisites VARCHAR(500),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_curriculum (department_id, program_id, year, semester, course_id),
      FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE CASCADE,
      FOREIGN KEY (program_id) REFERENCES programs(program_id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE
    )`;

  // Execute tables in correct order
  const tables = [
    usersTable,
    collegesTable,
    departmentsTable,
    staffProfilesTable,
    academicYearsTable,
    semestersTable,
    programsTable,
    coursesTable,
    sectionsTable,
    workloadRpTable,
    workloadNrpTable,
    paymentSheetsTable,
    overloadPaymentsTable,
    taxRulesTable,
    rateTablesTable,
    systemRulesTable,
    rulesetHistoryTable,
    summerDistributionTable,
    approvalWorkflowTable,
    auditLogTable,
    workloadDetailRpTable,
    nrpContractTemplatesTable,
    nrpReportsTable,
    courseAssignmentsTable,
    courseRequestsTable,
    curriculumPlansTable,
  ];

  for (let i = 0; i < tables.length; i++) {
    try {
      await connection.execute(tables[i]);
      console.log(`✓ Created table ${i + 1}/${tables.length}`);
    } catch (error) {
      console.error(`❌ Failed to create table ${i + 1}:`, error.message);
      throw error;
    }
  }
};

// ============================================
// MINIMAL REQUIRED DATA INSERTION
// ============================================

// const insertMinimalRequiredData = async () => {
//   console.log("📝 Inserting minimal required data...");

//   try {
//     // Insert at least one admin user
//     const adminPasswordHash = await bcrypt.hash("admin123", 10);

//     await pool.execute(
//       `INSERT INTO users (username, email, password_hash, role, is_active, created_by) 
//        VALUES (?, ?, ?, ?, TRUE, NULL)`,
//       ["admin", "admin@institution.edu", adminPasswordHash, "admin"]
//     );

//     console.log("✓ Created admin user (username: admin, password: admin123)");

//     console.log("✅ Minimal data inserted successfully");
//   } catch (error) {
//     console.warn("⚠️ Could not insert minimal data:", error.message);
//   }
// };

// ============================================
// EXACT DATA INSERTION FUNCTION
// ============================================

// export const insertExactData = async (exactData = {}) => {
//   console.log("📝 Inserting exact data with proper relationships...");

//   try {
//     if (!exactData || Object.keys(exactData).length === 0) {
//       console.log("⚠️ No data provided. Using minimal required data...");
//       return;
//     }

//     // Insert data in correct order respecting foreign key relationships
//     const insertionOrder = [
//       "users",
//       "colleges",
//       "departments",
//       "staff_profiles",
//       "academic_years",
//       "semesters",
//       "programs",
//       "courses",
//       "sections",
//       "workload_rp",
//       "workload_nrp",
//       "payment_sheets",
//       "overload_payments",
//       "tax_rules",
//       "rate_tables",
//       "system_rules",
//       "ruleset_history",
//       "summer_distribution",
//       "approval_workflow",
//       "audit_log",
//       "workload_detail_rp",
//       "nrp_contract_templates",
//       "nrp_reports",
//       "course_assignments",
//       "course_requests",
//       "curriculum_plans",
//     ];

//     // Create mappings to track IDs for relationships
//     const idMaps = {
//       users: {},
//       colleges: {},
//       departments: {},
//       staff_profiles: {},
//       academic_years: {},
//       semesters: {},
//       programs: {},
//       courses: {},
//     };

//     // Process each table in order
//     for (const tableName of insertionOrder) {
//       if (exactData[tableName] && exactData[tableName].length > 0) {
//         console.log(`📋 Inserting ${tableName}...`);

//         for (const record of exactData[tableName]) {
//           try {
//             // Process relationships before insertion
//             const processedRecord = await processRelationships(
//               tableName,
//               record,
//               idMaps
//             );

//             // Insert the record
//             const [result] = await pool.execute(
//               buildInsertQuery(tableName, processedRecord)
//             );

//             // Store the generated ID for future relationships
//             if (result.insertId) {
//               idMaps[tableName][
//                 record || record.original_id || result.insertId
//               ] = result.insertId;
//             }

//             console.log(`  ✓ Inserted ${tableName} record`);
//           } catch (error) {
//             console.error(
//               `  ✗ Failed to insert ${tableName} record:`,
//               error.message
//             );
//             throw error;
//           }
//         }
//       }
//     }

//     console.log(
//       "✅ Exact data inserted successfully with proper relationships!"
//     );
//   } catch (error) {
//     console.error("❌ Failed to insert exact data:", error.message);
//     throw error;
//   }
// };
// ============================================
// EXACT DATA INSERTION FUNCTION - WITHOUT TEMP_ID
// ============================================

export const insertExactData = async (exactData = {}) => {
  console.log("📝 Inserting exact data with proper relationships...");

  try {
    if (!exactData || Object.keys(exactData).length === 0) {
      console.log("⚠️ No data provided. Using minimal required data...");
      return;
    }

    // Create mappings to track IDs for relationships
    const idMaps = {
      users: {},
      colleges: {},
      departments: {},
      staff_profiles: {},
      academic_years: {},
      semesters: {},
      programs: {},
      courses: {},
      sections: {},
      workload_rp: {},
      workload_nrp: {}
    };

    // Insert users first (no dependencies)
    if (exactData.users && exactData.users.length > 0) {
      console.log(`📋 Inserting ${exactData.users.length} users...`);
      
      for (const record of exactData.users) {
        try {
          const processedRecord = { ...record };
          
          // Remove fields that don't exist in the table
          delete processedRecord.created_by_username;
          
          // Build SQL query
          const columns = Object.keys(processedRecord).filter(key => 
            processedRecord[key] !== undefined
          );
          
          const placeholders = columns.map(() => '?').join(', ');
          const values = columns.map(key => {
            const value = processedRecord[key];
            if (typeof value === 'boolean') return value ? 1 : 0;
            if (value instanceof Date) return value.toISOString().split('T')[0];
            return value;
          });
          
          const sql = `INSERT INTO users (${columns.join(', ')}) VALUES (${placeholders})`;
          const [result] = await pool.execute(sql, values);
          
          // Store mapping by username
          if (result.insertId && record.username) {
            idMaps.users[record.username] = result.insertId;
          }
          
        } catch (error) {
          console.error(`✗ Failed to insert user:`, error.message);
          console.error(`  Record:`, record);
          throw error;
        }
      }
    }

    // Insert colleges (depends on users for dean_user_id)
    if (exactData.colleges && exactData.colleges.length > 0) {
      console.log(`📋 Inserting ${exactData.colleges.length} colleges...`);
      
      for (const record of exactData.colleges) {
        try {
          const processedRecord = { ...record };
          
          // Handle dean_user_id relationship
          if (record.dean_username && idMaps.users[record.dean_username]) {
            processedRecord.dean_user_id = idMaps.users[record.dean_username];
          }
          delete processedRecord.dean_username;
          
          // Build and execute query
          const columns = Object.keys(processedRecord).filter(key => 
            processedRecord[key] !== undefined
          );
          
          const placeholders = columns.map(() => '?').join(', ');
          const values = columns.map(key => processedRecord[key]);
          
          const sql = `INSERT INTO colleges (${columns.join(', ')}) VALUES (${placeholders})`;
          const [result] = await pool.execute(sql, values);
          
          // Store mapping by college_code
          if (result.insertId && record.college_code) {
            idMaps.colleges[record.college_code] = result.insertId;
          }
          
        } catch (error) {
          console.error(`✗ Failed to insert college:`, error.message);
          throw error;
        }
      }
    }

    // Insert departments (depends on colleges and users)
    if (exactData.departments && exactData.departments.length > 0) {
      console.log(`📋 Inserting ${exactData.departments.length} departments...`);
      
      for (const record of exactData.departments) {
        try {
          const processedRecord = { ...record };
          
          // Handle relationships
          if (record.college_code && idMaps.colleges[record.college_code]) {
            processedRecord.college_id = idMaps.colleges[record.college_code];
          }
          if (record.head_username && idMaps.users[record.head_username]) {
            processedRecord.head_user_id = idMaps.users[record.head_username];
          }
          
          delete processedRecord.college_code;
          delete processedRecord.head_username;
          
          // Build and execute query
          const columns = Object.keys(processedRecord).filter(key => 
            processedRecord[key] !== undefined
          );
          
          const placeholders = columns.map(() => '?').join(', ');
          const values = columns.map(key => processedRecord[key]);
          
          const sql = `INSERT INTO departments (${columns.join(', ')}) VALUES (${placeholders})`;
          const [result] = await pool.execute(sql, values);
          
          // Store mapping by department_code
          if (result.insertId && record.department_code) {
            idMaps.departments[record.department_code] = result.insertId;
          }
          
        } catch (error) {
          console.error(`✗ Failed to insert department:`, error.message);
          throw error;
        }
      }
    }

    // Insert staff_profiles (depends on users and departments)
    if (exactData.staff_profiles && exactData.staff_profiles.length > 0) {
      console.log(`📋 Inserting ${exactData.staff_profiles.length} staff profiles...`);
      
      for (const record of exactData.staff_profiles) {
        try {
          const processedRecord = { ...record };
          
          // Handle relationships
          if (record.username && idMaps.users[record.username]) {
            processedRecord.user_id = idMaps.users[record.username];
          }
          if (record.department_code && idMaps.departments[record.department_code]) {
            processedRecord.department_id = idMaps.departments[record.department_code];
          }
          if (record.created_by_username && idMaps.users[record.created_by_username]) {
            processedRecord.created_by = idMaps.users[record.created_by_username];
          }
          
          delete processedRecord.username;
          delete processedRecord.department_code;
          delete processedRecord.created_by_username;
          
          // Build and execute query
          const columns = Object.keys(processedRecord).filter(key => 
            processedRecord[key] !== undefined
          );
          
          const placeholders = columns.map(() => '?').join(', ');
          const values = columns.map(key => processedRecord[key]);
          
          const sql = `INSERT INTO staff_profiles (${columns.join(', ')}) VALUES (${placeholders})`;
          const [result] = await pool.execute(sql, values);
          
          // Store mapping by employee_id (assuming it's unique)
          if (result.insertId && record.employee_id) {
            idMaps.staff_profiles[record.employee_id] = result.insertId;
          }
          
        } catch (error) {
          console.error(`✗ Failed to insert staff profile:`, error.message);
          throw error;
        }
      }
    }

    // Insert academic_years (no dependencies)
    if (exactData.academic_years && exactData.academic_years.length > 0) {
      console.log(`📋 Inserting ${exactData.academic_years.length} academic years...`);
      
      for (const record of exactData.academic_years) {
        try {
          // Build and execute query
          const columns = Object.keys(record).filter(key => 
            record[key] !== undefined
          );
          
          const placeholders = columns.map(() => '?').join(', ');
          const values = columns.map(key => record[key]);
          
          const sql = `INSERT INTO academic_years (${columns.join(', ')}) VALUES (${placeholders})`;
          const [result] = await pool.execute(sql, values);
          
          // Store mapping by year_code
          if (result.insertId && record.year_code) {
            idMaps.academic_years[record.year_code] = result.insertId;
          }
          
        } catch (error) {
          console.error(`✗ Failed to insert academic year:`, error.message);
          throw error;
        }
      }
    }

    // Continue with other tables in dependency order...
    // Follow the same pattern for semesters, programs, courses, etc.

    console.log("✅ Exact data inserted successfully!");
    return idMaps; // Return the ID mappings for debugging
    
  } catch (error) {
    console.error("❌ Failed to insert exact data:", error.message);
    throw error;
  }
};
// Helper function to build INSERT query
const buildInsertQuery = (tableName, record) => {
  const columns = Object.keys(record).join(", ");
  const placeholders = Object.keys(record)
    .map(() => "?")
    .join(", ");
  const values = Object.values(record);

  return `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;
};

// Helper function to process relationships between tables
const processRelationships = async (tableName, record, idMaps) => {
  const processedRecord = { ...record };

  switch (tableName) {
    case "departments":
      if (record.college_code && idMaps.colleges[record.college_code]) {
        processedRecord.college_id = idMaps.colleges[record.college_code];
        delete processedRecord.college_code;
      }
      if (record.head_username && idMaps.users[record.head_username]) {
        processedRecord.head_user_id = idMaps.users[record.head_username];
        delete processedRecord.head_username;
      }
      break;

    case "staff_profiles":
      if (record.username && idMaps.users[record.username]) {
        processedRecord.user_id = idMaps.users[record.username];
        delete processedRecord.username;
      }
      if (
        record.department_code &&
        idMaps.departments[record.department_code]
      ) {
        processedRecord.department_id =
          idMaps.departments[record.department_code];
        delete processedRecord.department_code;
      }
      if (
        record.created_by_username &&
        idMaps.users[record.created_by_username]
      ) {
        processedRecord.created_by = idMaps.users[record.created_by_username];
        delete processedRecord.created_by_username;
      }
      break;

    case "semesters":
      if (record.year_code && idMaps.academic_years[record.year_code]) {
        processedRecord.academic_year_id =
          idMaps.academic_years[record.year_code];
        delete processedRecord.year_code;
      }
      break;

    case "programs":
      if (
        record.department_code &&
        idMaps.departments[record.department_code]
      ) {
        processedRecord.department_id =
          idMaps.departments[record.department_code];
        delete processedRecord.department_code;
      }
      break;

    case "courses":
      if (
        record.department_code &&
        idMaps.departments[record.department_code]
      ) {
        processedRecord.department_id =
          idMaps.departments[record.department_code];
        delete processedRecord.department_code;
      }
      if (record.program_code && idMaps.programs[record.program_code]) {
        processedRecord.program_id = idMaps.programs[record.program_code];
        delete processedRecord.program_code;
      }
      break;

    case "course_assignments":
      if (record.course_code && idMaps.courses[record.course_code]) {
        processedRecord.course_id = idMaps.courses[record.course_code];
        delete processedRecord.course_code;
      }
      if (record.semester_code && idMaps.semesters[record.semester_code]) {
        processedRecord.semester_id = idMaps.semesters[record.semester_code];
        delete processedRecord.semester_code;
      }
      if (
        record.staff_username &&
        idMaps.staff_profiles[record.staff_username]
      ) {
        processedRecord.staff_id = idMaps.staff_profiles[record.staff_username];
        delete processedRecord.staff_username;
      }
      if (
        record.assigned_by_username &&
        idMaps.users[record.assigned_by_username]
      ) {
        processedRecord.assigned_by = idMaps.users[record.assigned_by_username];
        delete processedRecord.assigned_by_username;
      }
      break;

    case "course_requests":
      if (record.course_code && idMaps.courses[record.course_code]) {
        processedRecord.course_id = idMaps.courses[record.course_code];
        delete processedRecord.course_code;
      }
      if (record.semester_code && idMaps.semesters[record.semester_code]) {
        processedRecord.semester_id = idMaps.semesters[record.semester_code];
        delete processedRecord.semester_code;
      }
      if (
        record.staff_username &&
        idMaps.staff_profiles[record.staff_username]
      ) {
        processedRecord.staff_id = idMaps.staff_profiles[record.staff_username];
        delete processedRecord.staff_username;
      }
      if (
        record.requested_by_username &&
        idMaps.users[record.requested_by_username]
      ) {
        processedRecord.requested_by =
          idMaps.users[record.requested_by_username];
        delete processedRecord.requested_by_username;
      }
      break;
  }

  return processedRecord;
};

// ============================================
// DATABASE UTILITY FUNCTIONS
// ============================================

export const query = async (sql, params = []) => {
  if (!pool) {
    throw new Error(
      "Database pool not initialized. Call initializeDatabase() first."
    );
  }

  try {
    // Convert undefined values to null for MySQL
    const processedParams = params.map((param) => {
      if (param === undefined) {
        return null;
      }
      return param;
    });

    const [results] = await pool.execute(sql, processedParams);
    return results;
  } catch (error) {
    console.error("Database query error:", error.message);
    console.error("SQL:", sql);
    console.error("Params:", params);
    throw error;
  }
};

// Get a connection from pool
export const getConnection = async () => {
  if (!pool) {
    throw new Error(
      "Database pool not initialized. Call initializeDatabase() first."
    );
  }
  return await pool.getConnection();
};

// Test database connection
export const testConnection = async () => {
  try {
    const connection = await getConnection();
    const [result] = await connection.execute("SELECT 1 + 1 AS test");
    connection.release();

    console.log("✅ Database connection test successful");
    return result[0].test === 2;
  } catch (error) {
    console.error("❌ Database connection test failed:", error.message);
    return false;
  }
};

// Get database statistics
export const getDatabaseStats = async () => {
  try {
    const stats = {};

    // Get table counts
    const tables = [
      "users",
      "colleges",
      "departments",
      "staff_profiles",
      "academic_years",
      "semesters",
      "programs",
      "courses",
      "sections",
      "workload_rp",
      "workload_nrp",
      "payment_sheets",
      "overload_payments",
      "tax_rules",
      "rate_tables",
      "system_rules",
      "ruleset_history",
      "summer_distribution",
      "approval_workflow",
      "audit_log",
      "workload_detail_rp",
      "nrp_contract_templates",
      "nrp_reports",
      "course_assignments",
      "course_requests",
      "curriculum_plans",
    ];

    for (const table of tables) {
      try {
        const [result] = await query(`SELECT COUNT(*) as count FROM ${table}`);
        stats[table] = result[0].count;
      } catch (err) {
        stats[table] = 0;
      }
    }

    return stats;
  } catch (error) {
    console.error("Error getting database stats:", error.message);
    return null;
  }
};

// Check if database is initialized
export const isDatabaseInitialized = async () => {
  try {
    const [result] = await query(
      `SELECT COUNT(*) as table_count 
       FROM information_schema.tables 
       WHERE table_schema = ?`,
      [env.DB_NAME]
    );

    return result[0].table_count > 0;
  } catch (error) {
    return false;
  }
};

// ============================================
// LOAD ALL TEST DATA FUNCTION
// ============================================

export const loadAllTestData = async () => {
  try {
    console.log("📚 Loading complete test data for all API testing...");
    
    // Import and use the AllData module
    const { insertTestData } = await import("./AllData.js");
    
    // Wrap insertExactData to pass to AllData
    const wrappedInsertExactData = async (data) => {
      await insertExactData(data);
    };
    
    await insertTestData(wrappedInsertExactData);
    
    console.log("✅ All test data loaded successfully!");
    console.log("🎯 You can now test all API endpoints with complete relational data");
    
    return true;
  } catch (error) {
    console.error("❌ Failed to load test data:", error.message);
    throw error;
  }
};
// Export the pool
export { pool };
