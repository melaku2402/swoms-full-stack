// ============================================
// FILE: src/test/insertNRPTestData.js
// ============================================
import { query } from "../config/database.js";

async function insertTestNRPData() {
  console.log("📝 Inserting test NRP workload data...");

  try {
    // First, let's get existing data to ensure we have the right IDs
    console.log("🔍 Getting existing data...");

    // Get a test instructor
    const [instructors] = await query(
      `SELECT u.user_id, sp.staff_id 
       FROM users u 
       JOIN staff_profiles sp ON u.user_id = sp.user_id 
       WHERE u.role = 'instructor' 
       LIMIT 1`
    );

    if (instructors.length === 0) {
      console.log("❌ No instructor found. Creating test instructor first...");

      // Create a test instructor user
      const bcrypt = await import("bcryptjs");
      const hashedPassword = await bcrypt.default.hash("instructor123", 10);

      await query(
        `INSERT INTO users (username, email, password_hash, role, is_active) 
         VALUES (?, ?, ?, 'instructor', TRUE)`,
        ["test_instructor", "test_instructor@injibara.edu.et", hashedPassword]
      );

      const [newUser] = await query(
        "SELECT user_id FROM users WHERE username = ?",
        ["test_instructor"]
      );

      // Get a department for the instructor
      const [departments] = await query(
        "SELECT department_id FROM departments LIMIT 1"
      );

      if (departments.length === 0) {
        throw new Error("No departments found");
      }

      // Create staff profile
      await query(
        `INSERT INTO staff_profiles 
         (user_id, employee_id, first_name, last_name, department_id, academic_rank, employment_type) 
         VALUES (?, 'EMP_TEST001', 'Test', 'Instructor', ?, 'lecturer', 'full_time')`,
        [newUser.user_id, departments[0].department_id]
      );

      const [staff] = await query(
        "SELECT staff_id FROM staff_profiles WHERE user_id = ?",
        [newUser.user_id]
      );

      instructors.push({ user_id: newUser.user_id, staff_id: staff.staff_id });
    }

    const instructor = instructors[0];
    console.log(
      `👤 Using instructor: User ID=${instructor.user_id}, Staff ID=${instructor.staff_id}`
    );

    // Get an active semester
    const [semesters] = await query(
      `SELECT semester_id, semester_code 
       FROM semesters 
       WHERE is_active = TRUE 
       LIMIT 1`
    );

    if (semesters.length === 0) {
      // Create a test semester
      const [years] = await query(
        "SELECT academic_year_id FROM academic_years LIMIT 1"
      );

      if (years.length === 0) {
        await query(
          `INSERT INTO academic_years (year_code, year_name, start_date, end_date, is_active) 
           VALUES ('2024-2025', 'Academic Year 2024/2025', '2024-09-01', '2025-08-31', TRUE)`
        );

        const [newYear] = await query(
          "SELECT academic_year_id FROM academic_years WHERE year_code = ?",
          ["2024-2025"]
        );

        await query(
          `INSERT INTO semesters (academic_year_id, semester_code, semester_name, semester_type, start_date, end_date, is_active) 
           VALUES (?, '2024-TEST', 'Test Semester', 'semester_i', '2024-09-01', '2024-12-31', TRUE)`,
          [newYear.academic_year_id]
        );
      } else {
        await query(
          `INSERT INTO semesters (academic_year_id, semester_code, semester_name, semester_type, start_date, end_date, is_active) 
           VALUES (?, '2024-TEST', 'Test Semester', 'semester_i', '2024-09-01', '2024-12-31', TRUE)`,
          [years[0].academic_year_id]
        );
      }

      const [newSemester] = await query(
        "SELECT semester_id, semester_code FROM semesters WHERE semester_code = ?",
        ["2024-TEST"]
      );
      semesters.push(newSemester);
    }

    const semester = semesters[0];
    console.log(
      `📅 Using semester: ID=${semester.semester_id}, Code=${semester.semester_code}`
    );

    // Get or create a test course
    const [courses] = await query(
      `SELECT course_id, course_code FROM courses LIMIT 1`
    );

    let courseId = null;
    if (courses.length > 0) {
      courseId = courses[0].course_id;
      console.log(
        `📚 Using course: ID=${courseId}, Code=${courses[0].course_code}`
      );
    }

    // Insert 3 test NRP workloads with different program types
    const testWorkloads = [
      {
        // Extension program
        staff_id: instructor.staff_id,
        semester_id: semester.semester_id,
        program_type: "extension",
        contract_number: "EXT-2024-001",
        academic_year: "2024/2025",
        contract_type: "teaching",
        course_id: courseId,
        credit_hours: 3.0,
        lecture_credit_hours: 3.0,
        teaching_hours: 45, // 3 credits * 15 weeks
        student_count: 35,
        rate_category: "B",
        teaching_payment: 1350.0, // 3 credits * 450
        total_payment: 1350.0,
        total_hours_worked: 45.0,
        status: "draft",
      },
      {
        // Summer program
        staff_id: instructor.staff_id,
        semester_id: semester.semester_id,
        program_type: "summer",
        contract_number: "SUM-2024-001",
        academic_year: "2024/2025",
        contract_type: "combined",
        course_id: courseId,
        teaching_hours: 30,
        tutorial_sessions: 5,
        assignment_students: 30,
        exam_students: 30,
        student_count: 30,
        teaching_payment: 13500.0, // 30 hours * 450
        tutorial_payment: 750.0, // 5 sessions * 150
        assignment_payment: 300.0, // 30 students * 10
        exam_payment: 450.0, // 30 students * 15
        total_payment: 15000.0,
        total_hours_worked: 30.0,
        status: "submitted",
      },
      {
        // Distance program
        staff_id: instructor.staff_id,
        semester_id: semester.semester_id,
        program_type: "distance",
        contract_number: "DIS-2024-001",
        academic_year: "2024/2025",
        contract_type: "teaching",
        course_id: courseId,
        module_hours: 40,
        student_count: 50,
        teaching_payment: 20800.0, // 40 hours * 520
        project_payment: 500.0, // 50 students * 10
        total_payment: 21300.0,
        total_hours_worked: 40.0,
        status: "finance_approved",
      },
    ];

    console.log("📥 Inserting test NRP workloads...");

    for (let i = 0; i < testWorkloads.length; i++) {
      const workload = testWorkloads[i];

      const fields = Object.keys(workload);
      const placeholders = fields.map(() => "?").join(", ");
      const values = fields.map((field) => workload[field]);

      const sql = `INSERT INTO workload_nrp (${fields.join(
        ", "
      )}, created_at, updated_at) 
                   VALUES (${placeholders}, NOW(), NOW())`;

      await query(sql, values);
      console.log(
        `✅ Inserted ${workload.program_type} workload ${i + 1}/${
          testWorkloads.length
        }`
      );
    }

    console.log("🎉 Test NRP data inserted successfully!");
    console.log("\n📋 Summary:");
    console.log(`   Instructor: Staff ID ${instructor.staff_id}`);
    console.log(`   Semester: ${semester.semester_code}`);
    console.log(`   Created 3 NRP workloads:`);
    console.log(`   1. Extension program (draft)`);
    console.log(`   2. Summer program (submitted)`);
    console.log(`   3. Distance program (finance_approved)`);
    console.log(
      "\n🔗 Test endpoint: GET http://localhost:5000/api/workload/nrp/me"
    );
  } catch (error) {
    console.error("❌ Error inserting test data:", error);
  }
}

// Run the script
insertTestNRPData();
