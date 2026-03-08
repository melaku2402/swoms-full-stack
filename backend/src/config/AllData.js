


import  bcrypt  from "bcryptjs";

// Function to generate hashed password
const generateHashedPassword = async () => {
  const saltRounds = 10;
  const password = "password123"; // Default password for all test users
  return await bcrypt.hash(password, saltRounds);
};

// Main function to insert test data
const insertTestData = async (connection) => {
  console.log("📝 Inserting test data in correct order...");

  try {
    // Start transaction
    // await connection.execute("START TRANSACTION");
           await connection.query("START TRANSACTION");

    // Generate hashed password
    const hashedPassword = await generateHashedPassword();

    // 1. Insert users first (self-referencing, so created_by will be set later)
    console.log("Inserting users...");
    const usersData = [
      // System Admin
      ["admin", "admin@iu.edu.et", hashedPassword, "admin", 1, null],
      // Deans
      ["dr.abebe", "abebe.tesfaye@iu.edu.et", hashedPassword, "dean", 1, 1],
      ["dr.almaz", "almaz.mengesha@iu.edu.et", hashedPassword, "dean", 1, 1],
      ["dr.solomon", "solomon.kebede@iu.edu.et", hashedPassword, "dean", 1, 1],
      // Department Heads
      [
        "dr.getachew",
        "getachew.haile@iu.edu.et",
        hashedPassword,
        "department_head",
        1,
        2,
      ],
      [
        "dr.tilahun",
        "tilahun.abate@iu.edu.et",
        hashedPassword,
        "department_head",
        1,
        2,
      ],
      [
        "dr.meron",
        "meron.girma@iu.edu.et",
        hashedPassword,
        "department_head",
        1,
        2,
      ],
      [
        "dr.yohannes",
        "yohannes.asrat@iu.edu.et",
        hashedPassword,
        "department_head",
        1,
        3,
      ],
      // Instructors
      [
        "mr.alemayehu",
        "alemayehu.wondimu@iu.edu.et",
        hashedPassword,
        "instructor",
        1,
        5,
      ],
      [
        "ms.kidan",
        "kidan.tadesse@iu.edu.et",
        hashedPassword,
        "instructor",
        1,
        5,
      ],
      [
        "dr.samuel",
        "samuel.mekonnen@iu.edu.et",
        hashedPassword,
        "instructor",
        1,
        6,
      ],
      ["mr.eyob", "eyob.berhanu@iu.edu.et", hashedPassword, "instructor", 1, 7],
      // Other roles
      [
        "ms.hirut",
        "hirut.molla@iu.edu.et",
        hashedPassword,
        "hr_director",
        1,
        1,
      ],
      [
        "mr.tadesse",
        "tadesse.lemma@iu.edu.et",
        hashedPassword,
        "finance",
        1,
        1,
      ],
      [
        "dr.zelalem",
        "zelalem.bezabih@iu.edu.et",
        hashedPassword,
        "cde_director",
        1,
        1,
      ],
      [
        "mr.bekele",
        "bekele.wolde@iu.edu.et",
        hashedPassword,
        "registrar",
        1,
        1,
      ],
      ["dr.mesfin", "mesfin.tadesse@iu.edu.et", hashedPassword, "vpaa", 1, 1],
      ["dr.helen", "helen.girma@iu.edu.et", hashedPassword, "vpaf", 1, 1],
    ];

    for (const user of usersData) {
      const [username, email, password_hash, role, is_active, created_by] =
        user;
      const sql =
        "INSERT INTO users (username, email, password_hash, role, is_active, created_by) VALUES (?, ?, ?, ?, ?, ?)";
      await connection.execute(sql, [
        username,
        email,
        password_hash,
        role,
        is_active,
        created_by,
      ]);
    }
    console.log("✓ Users inserted");

    // 2. Insert colleges
    console.log("Inserting colleges...");
    const collegesData = [
      ["COET", "College of Engineering and Technology", 2, "active"],
      ["CONS", "College of Natural Sciences", 3, "active"],
      ["COBE", "College of Business and Economics", 4, "active"],
      ["COHS", "College of Health Sciences", null, "active"],
      ["COA", "College of Agriculture", null, "active"],
    ];

    for (const college of collegesData) {
      const [college_code, college_name, dean_user_id, status] = college;
      const sql =
        "INSERT INTO colleges (college_code, college_name, dean_user_id, status) VALUES (?, ?, ?, ?)";
      await connection.execute(sql, [
        college_code,
        college_name,
        dean_user_id,
        status,
      ]);
    }
    console.log("✓ Colleges inserted");

    // 3. Insert departments
    console.log("Inserting departments...");
    // Get college IDs first
    const [colleges] = await connection.execute(
      "SELECT college_id, college_code FROM colleges"
    );
    const collegeMap = {};
    colleges.forEach((college) => {
      collegeMap[college.college_code] = college.college_id;
    });

    // Get user IDs for department heads
    const [users] = await connection.execute(
      "SELECT user_id, username FROM users"
    );
    const userMap = {};
    users.forEach((user) => {
      userMap[user.username] = user.user_id;
    });

    const departmentsData = [
      // College of Engineering and Technology departments
      [
        "SE",
        "Software Engineering",
        collegeMap["COET"],
        userMap["dr.getachew"],
        "active",
      ],
      [
        "CS",
        "Computer Science",
        collegeMap["COET"],
        userMap["dr.tilahun"],
        "active",
      ],
      [
        "EE",
        "Electrical Engineering",
        collegeMap["COET"],
        userMap["dr.meron"],
        "active",
      ],
      ["CE", "Civil Engineering", collegeMap["COET"], null, "active"],
      // College of Natural Sciences departments
      [
        "MATH",
        "Mathematics",
        collegeMap["CONS"],
        userMap["dr.yohannes"],
        "active",
      ],
      ["PHYS", "Physics", collegeMap["CONS"], null, "active"],
      ["CHEM", "Chemistry", collegeMap["CONS"], null, "active"],
      ["BIO", "Biology", collegeMap["CONS"], null, "active"],
      // College of Business and Economics departments
      ["ACC", "Accounting", collegeMap["COBE"], null, "active"],
      ["MGMT", "Management", collegeMap["COBE"], null, "active"],
      ["ECON", "Economics", collegeMap["COBE"], null, "active"],
    ];

    for (const dept of departmentsData) {
      const [
        department_code,
        department_name,
        college_id,
        head_user_id,
        status,
      ] = dept;
      const sql =
        "INSERT INTO departments (department_code, department_name, college_id, head_user_id, status) VALUES (?, ?, ?, ?, ?)";
      await connection.execute(sql, [
        department_code,
        department_name,
        college_id,
        head_user_id,
        status,
      ]);
    }
    console.log("✓ Departments inserted");

    // 4. Insert staff profiles
    console.log("Inserting staff profiles...");
    // Get department IDs
    const [departments] = await connection.execute(
      "SELECT department_id, department_code FROM departments"
    );
    const departmentMap = {};
    departments.forEach((dept) => {
      departmentMap[dept.department_code] = dept.department_id;
    });

    const staffProfilesData = [
      // Software Engineering Department Staff
      [
        userMap["dr.getachew"],
        "EMP001",
        "Getachew",
        "Haile",
        "",
        departmentMap["SE"],
        "professor",
        "full_time",
        "2015-09-01",
        "+251911223344",
        "Addis Ababa, Ethiopia",
        "1978-05-15",
        "male",
        userMap["admin"],
      ],
      [
        userMap["mr.alemayehu"],
        "EMP002",
        "Alemayehu",
        "Wondimu",
        "",
        departmentMap["SE"],
        "lecturer",
        "full_time",
        "2020-01-15",
        "+251922334455",
        "Addis Ababa, Ethiopia",
        "1985-08-20",
        "male",
        userMap["dr.getachew"],
      ],
      [
        userMap["ms.kidan"],
        "EMP003",
        "Kidan",
        "Tadesse",
        "",
        departmentMap["SE"],
        "assistant_professor",
        "full_time",
        "2019-03-01",
        "+251933445566",
        "Addis Ababa, Ethiopia",
        "1988-11-30",
        "female",
        userMap["dr.getachew"],
      ],
      // Computer Science Department Staff
      [
        userMap["dr.tilahun"],
        "EMP004",
        "Tilahun",
        "Abate",
        "",
        departmentMap["CS"],
        "professor",
        "full_time",
        "2016-07-01",
        "+251944556677",
        "Addis Ababa, Ethiopia",
        "1975-03-25",
        "male",
        userMap["dr.abebe"],
      ],
      [
        userMap["dr.samuel"],
        "EMP005",
        "Samuel",
        "Mekonnen",
        "",
        departmentMap["CS"],
        "associate_professor",
        "full_time",
        "2018-09-01",
        "+251955667788",
        "Addis Ababa, Ethiopia",
        "1980-12-10",
        "male",
        userMap["dr.tilahun"],
      ],
      // Electrical Engineering Department Staff
      [
        userMap["dr.meron"],
        "EMP006",
        "Meron",
        "Girma",
        "",
        departmentMap["EE"],
        "associate_professor",
        "full_time",
        "2017-11-01",
        "+251966778899",
        "Addis Ababa, Ethiopia",
        "1982-07-18",
        "female",
        userMap["dr.abebe"],
      ],
      [
        userMap["mr.eyob"],
        "EMP007",
        "Eyob",
        "Berhanu",
        "",
        departmentMap["EE"],
        "lecturer",
        "full_time",
        "2021-02-01",
        "+251977889900",
        "Addis Ababa, Ethiopia",
        "1990-04-22",
        "male",
        userMap["dr.meron"],
      ],
      // Mathematics Department Staff
      [
        userMap["dr.yohannes"],
        "EMP008",
        "Yohannes",
        "Asrat",
        "",
        departmentMap["MATH"],
        "professor",
        "full_time",
        "2014-08-01",
        "+251988990011",
        "Addis Ababa, Ethiopia",
        "1972-09-14",
        "male",
        userMap["dr.almaz"],
      ],
    ];

    for (const staff of staffProfilesData) {
      const sql = `INSERT INTO staff_profiles (user_id, employee_id, first_name, last_name, middle_name, department_id, academic_rank, employment_type, hire_date, phone, address, date_of_birth, gender, created_by) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      await connection.execute(sql, staff);
    }
    console.log("✓ Staff profiles inserted");

    // 5. Insert academic years
    console.log("Inserting academic years...");
    const academicYearsData = [
      ["2024-2025", "Academic Year 2024/2025", "2024-09-01", "2025-08-31", 1],
      ["2023-2024", "Academic Year 2023/2024", "2023-09-01", "2024-08-31", 0],
      ["2025-2026", "Academic Year 2025/2026", "2025-09-01", "2026-08-31", 0],
    ];

    for (const year of academicYearsData) {
      const [year_code, year_name, start_date, end_date, is_active] = year;
      const sql =
        "INSERT INTO academic_years (year_code, year_name, start_date, end_date, is_active) VALUES (?, ?, ?, ?, ?)";
      await connection.execute(sql, [
        year_code,
        year_name,
        start_date,
        end_date,
        is_active,
      ]);
    }
    console.log("✓ Academic years inserted");

    // 6. Insert semesters
    console.log("Inserting semesters...");
    // Get academic year IDs
    const [academicYears] = await connection.execute(
      "SELECT academic_year_id, year_code FROM academic_years"
    );
    const academicYearMap = {};
    academicYears.forEach((year) => {
      academicYearMap[year.year_code] = year.academic_year_id;
    });

    const semestersData = [
      // 2024-2025 Academic Year
      [
        academicYearMap["2024-2025"],
        "2024-I",
        "Semester I 2024/2025",
        "semester_i",
        "2024-09-01",
        "2025-01-31",
        1,
      ],
      [
        academicYearMap["2024-2025"],
        "2024-II",
        "Semester II 2024/2025",
        "semester_ii",
        "2025-02-01",
        "2025-06-30",
        0,
      ],
      [
        academicYearMap["2024-2025"],
        "2024-SU",
        "Summer 2025",
        "summer",
        "2025-07-01",
        "2025-08-31",
        0,
      ],
      [
        academicYearMap["2024-2025"],
        "2024-DIS",
        "Distance 2025",
        "distance",
        "2025-01-15",
        "2025-05-15",
        0,
      ],
      [
        academicYearMap["2024-2025"],
        "2024-EXT",
        "Extension 2025",
        "extension",
        "2025-03-01",
        "2025-07-01",
        0,
      ],
      [
        academicYearMap["2024-2025"],
        "2024-WK",
        "Weekend 2025",
        "weekend",
        "2025-02-15",
        "2025-06-15",
        0,
      ],
      // 2023-2024 Academic Year
      [
        academicYearMap["2023-2024"],
        "2023-I",
        "Semester I 2023/2024",
        "semester_i",
        "2023-09-01",
        "2024-01-31",
        0,
      ],
      [
        academicYearMap["2023-2024"],
        "2023-II",
        "Semester II 2023/2024",
        "semester_ii",
        "2024-02-01",
        "2024-06-30",
        0,
      ],
    ];

    for (const semester of semestersData) {
      const sql =
        "INSERT INTO semesters (academic_year_id, semester_code, semester_name, semester_type, start_date, end_date, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)";
      await connection.execute(sql, semester);
    }
    console.log("✓ Semesters inserted");

    // 7. Insert programs
    console.log("Inserting programs...");
    const programsData = [
      // Software Engineering Programs
      [
        "SE-REG",
        "Software Engineering Regular",
        departmentMap["SE"],
        "regular",
        "active",
      ],
      [
        "SE-EXT",
        "Software Engineering Extension",
        departmentMap["SE"],
        "extension",
        "active",
      ],
      [
        "SE-WK",
        "Software Engineering Weekend",
        departmentMap["SE"],
        "weekend",
        "active",
      ],
      [
        "SE-SU",
        "Software Engineering Summer",
        departmentMap["SE"],
        "summer",
        "active",
      ],
      [
        "SE-DIS",
        "Software Engineering Distance",
        departmentMap["SE"],
        "distance",
        "active",
      ],
      // Computer Science Programs
      [
        "CS-REG",
        "Computer Science Regular",
        departmentMap["CS"],
        "regular",
        "active",
      ],
      [
        "CS-EXT",
        "Computer Science Extension",
        departmentMap["CS"],
        "extension",
        "active",
      ],
      // Electrical Engineering Programs
      [
        "EE-REG",
        "Electrical Engineering Regular",
        departmentMap["EE"],
        "regular",
        "active",
      ],
      // Mathematics Programs
      [
        "MATH-REG",
        "Mathematics Regular",
        departmentMap["MATH"],
        "regular",
        "active",
      ],
    ];

    for (const program of programsData) {
      const sql =
        "INSERT INTO programs (program_code, program_name, department_id, program_type, status) VALUES (?, ?, ?, ?, ?)";
      await connection.execute(sql, program);
    }
    console.log("✓ Programs inserted");

    // 8. Insert courses
    console.log("Inserting courses...");
    // Get program IDs
    const [programs] = await connection.execute(
      "SELECT program_id, program_code FROM programs"
    );
    const programMap = {};
    programs.forEach((program) => {
      programMap[program.program_code] = program.program_id;
    });

    // Create department code to ID map for courses
    const deptCodeMap = {
      SE: departmentMap["SE"],
      CS: departmentMap["CS"],
      EE: departmentMap["EE"],
      MATH: departmentMap["MATH"],
      PHYS: departmentMap["PHYS"],
      BIO: departmentMap["BIO"],
      ECON: departmentMap["ECON"],
    };

    // Insert some sample courses
    const coursesData = [
      // Software Engineering Courses
      [
        "SEng4021",
        "Fundamentals of Database System",
        deptCodeMap["SE"],
        programMap["SE-REG"],
        2024,
        1,
        1,
        5.0,
        3.0,
        2.0,
        0.0,
        "regular",
        2,
        1,
        1,
        "",
        80,
        20,
        "active",
      ],
      [
        "SEng5021",
        "Fundamental of Software Engineering",
        deptCodeMap["SE"],
        programMap["SE-REG"],
        2024,
        1,
        2,
        7.0,
        5.0,
        2.0,
        0.0,
        "regular",
        2,
        1,
        1,
        "",
        70,
        15,
        "active",
      ],
      // Computer Science Courses
      [
        "CSc101",
        "Introduction to Computer Science",
        deptCodeMap["CS"],
        programMap["CS-REG"],
        2024,
        1,
        1,
        4.0,
        3.0,
        1.0,
        0.0,
        "regular",
        1,
        1,
        1,
        "",
        120,
        30,
        "active",
      ],
      // Electrical Engineering Courses
      [
        "EEng101",
        "Circuit Analysis",
        deptCodeMap["EE"],
        programMap["EE-REG"],
        2024,
        1,
        1,
        5.0,
        4.0,
        1.0,
        0.0,
        "regular",
        1,
        1,
        1,
        "",
        100,
        25,
        "active",
      ],
      // Mathematics Courses
      [
        "Math111",
        "Calculus I",
        deptCodeMap["MATH"],
        programMap["MATH-REG"],
        2024,
        1,
        1,
        6.0,
        5.0,
        1.0,
        0.0,
        "regular",
        1,
        1,
        1,
        "",
        150,
        40,
        "active",
      ],
    ];

    for (const course of coursesData) {
      const sql = `INSERT INTO courses (course_code, course_title, department_id, program_id, academic_year, recommended_semester, course_order, credit_hours, lecture_hours, lab_hours, tutorial_hours, program_type, course_year, course_semester, is_core_course, prerequisites, max_students, min_students, status) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      await connection.execute(sql, course);
    }
    console.log("✓ Courses inserted");

    // 9. Insert sections
    console.log("Inserting sections...");
    // Get course IDs
    const [courseList] = await connection.execute(
      "SELECT course_id, course_code FROM courses"
    );
    const courseMap = {};
    courseList.forEach((course) => {
      courseMap[course.course_code] = course.course_id;
    });

    // Get semester IDs
    const [semesterList] = await connection.execute(
      "SELECT semester_id, semester_code FROM semesters"
    );
    const semesterMap = {};
    semesterList.forEach((semester) => {
      semesterMap[semester.semester_code] = semester.semester_id;
    });

    // Get staff IDs
    const [staffList] = await connection.execute(
      "SELECT staff_id, user_id FROM staff_profiles"
    );
    const staffIdMap = {};
    staffList.forEach((staff) => {
      // Find username from user_id
      const user = users.find((u) => u.user_id === staff.user_id);
      if (user) {
        staffIdMap[user.username] = staff.staff_id;
      }
    });

    const sectionsData = [
      [
        courseMap["SEng4021"],
        semesterMap["2024-I"],
        "A",
        staffIdMap["mr.alemayehu"],
        45,
        60,
        1,
      ],
      [
        courseMap["SEng4021"],
        semesterMap["2024-I"],
        "B",
        staffIdMap["ms.kidan"],
        38,
        60,
        1,
      ],
      [
        courseMap["SEng5021"],
        semesterMap["2024-I"],
        "A",
        staffIdMap["dr.getachew"],
        35,
        50,
        1,
      ],
      [
        courseMap["CSc101"],
        semesterMap["2024-I"],
        "A",
        staffIdMap["dr.samuel"],
        55,
        70,
        1,
      ],
      [
        courseMap["EEng101"],
        semesterMap["2024-I"],
        "A",
        staffIdMap["mr.eyob"],
        48,
        60,
        1,
      ],
      [
        courseMap["Math111"],
        semesterMap["2024-I"],
        "A",
        staffIdMap["dr.yohannes"],
        65,
        80,
        1,
      ],
    ];

    for (const section of sectionsData) {
      const sql =
        "INSERT INTO sections (course_id, semester_id, section_code, instructor_id, student_count, max_capacity, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)";
      await connection.execute(sql, section);
    }
    console.log("✓ Sections inserted");

    // 10. Insert workload RP
    console.log("Inserting workload RP...");
    const workloadRpData = [
      [
        staffIdMap["mr.alemayehu"],
        semesterMap["2024-I"],
        "SEng4021",
        5.0,
        3.0,
        0,
        2.0,
        "SE",
        "2nd Year",
        1,
        12.5,
        2.5,
        5.0,
        2.0,
        0,
        0,
        3.0,
        2.0,
        3.0,
        0,
        30.0,
        0,
        "submitted",
      ],
      [
        staffIdMap["ms.kidan"],
        semesterMap["2024-I"],
        "SEng4021",
        5.0,
        3.0,
        0,
        2.0,
        "SE",
        "2nd Year",
        1,
        12.5,
        2.5,
        8.0,
        3.0,
        0,
        0,
        0,
        2.0,
        2.0,
        0,
        30.0,
        0,
        "dh_approved",
      ],
    ];

    for (const workload of workloadRpData) {
      const sql = `INSERT INTO workload_rp (staff_id, semester_id, course_code, course_credit_hours, lecture_credit_hours, tutorial_credit_hours, lab_credit_hours, student_department, academic_year, number_of_sections, each_section_course_load, variety_of_course_load, research_load, community_service_load, elip_load, hdp_load, course_chair_load, section_advisor_load, advising_load, position_load, total_load, over_payment_birr, status) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      await connection.execute(sql, workload);
    }
    console.log("✓ Workload RP inserted");

    // 11. Insert workload NRP
    console.log("Inserting workload NRP...");
    const workloadNrpData = [
      [
        staffIdMap["mr.alemayehu"],
        semesterMap["2024-SU"],
        "summer",
        "CON-2024-SU-001",
        "2024-2025",
        "2016 EC",
        "teaching",
        courseMap["CSc101"],
        "CSc101",
        "Computer Programming",
        5.0,
        3.0,
        2.0,
        0,
        1,
        2,
        0,
        45,
        15,
        60,
        60,
        1,
        30,
        60,
        60,
        "Final project groups",
        5,
        "A",
        500.0,
        25.0,
        20.0,
        100.0,
        22500.0,
        0,
        1500.0,
        1200.0,
        2500.0,
        27700.0,
        60,
        "2025-07-01",
        "2025-08-15",
        0,
        0,
        0,
        "draft",
      ],
    ];

    for (const nrp of workloadNrpData) {
      const sql = `INSERT INTO workload_nrp (staff_id, semester_id, program_type, contract_number, academic_year, academic_year_ec, contract_type, course_id, course_code, course_title, credit_hours, lecture_credit_hours, lab_credit_hours, tutorial_credit_hours, lecture_sections, lab_sections, tutorial_sessions, teaching_hours, module_hours, student_count, student_count_dept, student_count_year, student_count_section, assignment_students, exam_students, project_advising, project_groups, rate_category, rate_per_rank, assignment_rate, exam_rate, tutorial_rate_per_hour, teaching_payment, tutorial_payment, assignment_payment, exam_payment, project_payment, total_payment, total_hours_worked, contract_duration_from, contract_duration_to, is_overload, overload_hours, overload_payment, status) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      await connection.execute(sql, nrp);
    }
    console.log("✓ Workload NRP inserted");

    // 12. Insert overload payments
    console.log("Inserting overload payments...");
    const overloadPaymentsData = [
      [
        staffIdMap["mr.alemayehu"],
        semesterMap["2024-I"],
        10,
        450.0,
        4500.0,
        450.0,
        4050.0,
        "pending",
        "1.0",
      ],
    ];

    for (const overload of overloadPaymentsData) {
      const sql =
        "INSERT INTO overload_payments (staff_id, semester_id, overload_hours, rate_used, gross_amount, tax_amount, net_amount, payment_status, ruleset_version) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
      await connection.execute(sql, overload);
    }
    console.log("✓ Overload payments inserted");

    // 13. Insert payment sheets
    console.log("Inserting payment sheets...");
    // Get NRP ID
    const [nrpList] = await connection.execute(
      "SELECT nrp_id FROM workload_nrp LIMIT 1"
    );
    const nrpId = nrpList[0]?.nrp_id;

    // Get overload ID
    const [overloadList] = await connection.execute(
      "SELECT overload_id FROM overload_payments LIMIT 1"
    );
    const overloadId = overloadList[0]?.overload_id;

    const paymentSheetsData = [
      [
        nrpId,
        overloadId,
        "summer",
        "PS-2024-SU-001",
        27700.0,
        2770.0,
        24930.0,
        "pending",
        null,
        null,
        "pdf",
      ],
    ];

    for (const payment of paymentSheetsData) {
      const sql =
        "INSERT INTO payment_sheets (nrp_id, overload_id, payment_type, sheet_number, gross_amount, tax_amount, net_amount, payment_status, approved_by, approved_date, export_format) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
      await connection.execute(sql, payment);
    }
    console.log("✓ Payment sheets inserted");

    // 14. Insert tax rules
    console.log("Inserting tax rules...");
    const taxRulesData = [
      ["extension", 10.0, "2024-09-01", null, "Extension program tax rate"],
      ["weekend", 10.0, "2024-09-01", null, "Weekend program tax rate"],
      ["summer", 10.0, "2024-09-01", null, "Summer program tax rate"],
      ["distance", 10.0, "2024-09-01", null, "Distance program tax rate"],
      ["overload", 10.0, "2024-09-01", null, "Overload payment tax rate"],
    ];

    for (const tax of taxRulesData) {
      const sql =
        "INSERT INTO tax_rules (program_type, tax_rate, effective_from, effective_to, description) VALUES (?, ?, ?, ?, ?)";
      await connection.execute(sql, tax);
    }
    console.log("✓ Tax rules inserted");

    // 15. Insert rate tables
    console.log("Inserting rate tables...");
    const rateTablesData = [
      ["extension", "A", 500.0, null, null, "2024-09-01", null],
      ["extension", "B", 450.0, null, null, "2024-09-01", null],
      ["weekend", "A", 500.0, null, null, "2024-09-01", null],
      ["summer", "default", null, 450.0, null, "2024-09-01", null],
      ["distance", "default", null, 520.0, null, "2024-09-01", null],
    ];

    for (const rate of rateTablesData) {
      const sql =
        "INSERT INTO rate_tables (program_type, rate_category, amount_per_credit, amount_per_hour, amount_per_student, effective_from, effective_to) VALUES (?, ?, ?, ?, ?, ?, ?)";
      await connection.execute(sql, rate);
    }
    console.log("✓ Rate tables inserted");

    // 16. Insert system rules
    console.log("Inserting system rules...");
    const systemRulesData = [
      [
        "lecture_factor",
        "1.0",
        "load_factor",
        "regular",
        "2024-09-01",
        null,
        "Lecture hour conversion factor",
      ],
      [
        "lab_factor",
        "0.75",
        "load_factor",
        "regular",
        "2024-09-01",
        null,
        "Laboratory hour conversion factor",
      ],
      [
        "tutorial_factor",
        "0.5",
        "load_factor",
        "regular",
        "2024-09-01",
        null,
        "Tutorial hour conversion factor",
      ],
      [
        "rank_min_lecturer",
        "8",
        "rank_limit",
        "regular",
        "2024-09-01",
        null,
        "Minimum load for Lecturer",
      ],
      [
        "rank_max_lecturer",
        "12",
        "rank_limit",
        "regular",
        "2024-09-01",
        null,
        "Maximum load for Lecturer",
      ],
      [
        "overload_rate",
        "450",
        "payment",
        "overload",
        "2024-09-01",
        null,
        "Overload payment rate per hour",
      ],
    ];

    for (const rule of systemRulesData) {
      const sql =
        "INSERT INTO system_rules (rule_name, rule_value, rule_type, program_type, effective_from, effective_to, description) VALUES (?, ?, ?, ?, ?, ?, ?)";
      await connection.execute(sql, rule);
    }
    console.log("✓ System rules inserted");

    // 17. Insert ruleset history
    console.log("Inserting ruleset history...");
    const rulesetHistoryData = [
      [
        "overload_rate",
        "400",
        "450",
        userMap["admin"],
        "Updated based on new salary scale",
        "2024-09-01",
        null,
        "overload",
        "2.0",
      ],
    ];

    for (const history of rulesetHistoryData) {
      const sql =
        "INSERT INTO ruleset_history (rule_name, previous_value, new_value, changed_by, change_reason, effective_from, effective_to, program_type, version_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
      await connection.execute(sql, history);
    }
    console.log("✓ Ruleset history inserted");

    // 18. Insert summer distribution
    console.log("Inserting summer distribution...");
    const summerDistributionData = [
      [30.0, 30.0, 20.0, 20.0, "2024-09-01", null],
    ];

    for (const dist of summerDistributionData) {
      const sql =
        "INSERT INTO summer_distribution (stage1_percent, stage2_percent, stage3_percent, stage4_percent, effective_from, effective_to) VALUES (?, ?, ?, ?, ?, ?)";
      await connection.execute(sql, dist);
    }
    console.log("✓ Summer distribution inserted");

    // 19. Insert approval workflow
    console.log("Inserting approval workflow...");
    // Get workload RP IDs
    const [workloadRpList] = await connection.execute(
      "SELECT workload_id FROM workload_rp"
    );

    const approvalWorkflowData = [
      [
        "workload_rp",
        workloadRpList[0]?.workload_id || 1,
        "department_head",
        userMap["dr.getachew"],
        "approved",
        "Workload looks appropriate",
      ],
      [
        "workload_rp",
        workloadRpList[1]?.workload_id || 2,
        "department_head",
        userMap["dr.getachew"],
        "approved",
        "Approved for semester",
      ],
      [
        "workload_nrp",
        nrpId,
        "department_head",
        userMap["dr.getachew"],
        "pending",
        "Awaiting review",
      ],
    ];

    for (const approval of approvalWorkflowData) {
      const sql =
        "INSERT INTO approval_workflow (entity_type, entity_id, approver_role, approver_id, status, comments) VALUES (?, ?, ?, ?, ?, ?)";
      await connection.execute(sql, approval);
    }
    console.log("✓ Approval workflow inserted");

    // 20. Insert audit log
    console.log("Inserting audit log...");
    const auditLogData = [
      [
        userMap["admin"],
        "CREATE",
        "user",
        userMap["admin"],
        null,
        '{"username": "admin", "role": "admin"}',
        "127.0.0.1",
      ],
      [
        userMap["admin"],
        "CREATE",
        "college",
        1,
        null,
        '{"college_code": "COET", "college_name": "College of Engineering and Technology"}',
        "127.0.0.1",
      ],
    ];

    for (const audit of auditLogData) {
      const sql =
        "INSERT INTO audit_log (user_id, action, entity, entity_id, old_value, new_value, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?)";
      await connection.execute(sql, audit);
    }
    console.log("✓ Audit log inserted");

    // 21. Insert workload detail RP
    console.log("Inserting workload detail RP...");
    const workloadDetailRpData = [
      [
        workloadRpList[0]?.workload_id || 1,
        "research",
        "Published paper on Database Optimization Techniques",
        5.0,
      ],
      [
        workloadRpList[0]?.workload_id || 1,
        "community",
        "Community service at local high school",
        2.0,
      ],
      [
        workloadRpList[1]?.workload_id || 2,
        "research",
        "Ongoing research on Machine Learning Applications",
        8.0,
      ],
    ];

    for (const detail of workloadDetailRpData) {
      const sql =
        "INSERT INTO workload_detail_rp (workload_id, detail_type, description, hours) VALUES (?, ?, ?, ?)";
      await connection.execute(sql, detail);
    }
    console.log("✓ Workload detail RP inserted");

    // 22. Insert NRP contract templates
    console.log("Inserting NRP contract templates...");
    const nrpContractTemplatesData = [
      [
        "Summer Teaching Contract",
        "teaching",
        "summer",
        "SUMMER TEACHING CONTRACT\nInjibara University\nCollege of Engineering and Technology",
        "This contract is made between Injibara University and the instructor...",
        '{"columns": ["Course", "Hours", "Rate", "Total"]}',
        '["Instructor", "Department Head", "Dean"]',
        userMap["admin"],
      ],
    ];

    for (const template of nrpContractTemplatesData) {
      const sql =
        "INSERT INTO nrp_contract_templates (template_name, template_type, program_type, header_content, stipulation_content, table_structure, signature_fields, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
      await connection.execute(sql, template);
    }
    console.log("✓ NRP contract templates inserted");

    // 23. Insert NRP reports
    console.log("Inserting NRP reports...");
    const nrpReportsData = [
      [
        "payment_summary",
        semesterMap["2024-SU"],
        departmentMap["SE"],
        collegeMap["COET"],
        "July 2025",
        userMap["mr.tadesse"],
        '{"total_payments": 27700, "total_instructors": 1, "average_payment": 27700}',
      ],
    ];

    for (const report of nrpReportsData) {
      const sql =
        "INSERT INTO nrp_reports (report_type, semester_id, department_id, college_id, report_period, generated_by, report_data) VALUES (?, ?, ?, ?, ?, ?, ?)";
      await connection.execute(sql, report);
    }
    console.log("✓ NRP reports inserted");

    // 24. Insert course assignments
    console.log("Inserting course assignments...");
    const courseAssignmentsData = [
      [
        courseMap["SEng4021"],
        semesterMap["2024-I"],
        staffIdMap["mr.alemayehu"],
        2,
        userMap["dr.getachew"],
        "A",
        "assigned",
        "Regular teaching assignment for Database Systems",
      ],
      [
        courseMap["SEng4021"],
        semesterMap["2024-I"],
        staffIdMap["ms.kidan"],
        2,
        userMap["dr.getachew"],
        "B",
        "accepted",
        "Regular teaching assignment for Database Systems",
      ],
      [
        courseMap["SEng5021"],
        semesterMap["2024-I"],
        staffIdMap["dr.getachew"],
        2,
        userMap["dr.getachew"],
        "A",
        "accepted",
        "Department head teaching Software Engineering",
      ],
      [
        courseMap["CSc101"],
        semesterMap["2024-I"],
        staffIdMap["dr.samuel"],
        1,
        userMap["dr.tilahun"],
        "A",
        "accepted",
        "Introduction to Computer Science",
      ],
      [
        courseMap["EEng101"],
        semesterMap["2024-I"],
        staffIdMap["mr.eyob"],
        1,
        userMap["dr.meron"],
        "A",
        "accepted",
        "Circuit Analysis for first year",
      ],
      [
        courseMap["Math111"],
        semesterMap["2024-I"],
        staffIdMap["dr.yohannes"],
        1,
        userMap["dr.yohannes"],
        "A",
        "accepted",
        "Calculus I for engineering students",
      ],
    ];

    for (const assignment of courseAssignmentsData) {
      const sql =
        "INSERT INTO course_assignments (course_id, semester_id, staff_id, student_year, assigned_by, section_code, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
      await connection.execute(sql, assignment);
    }
    console.log("✓ Course assignments inserted");

    // 25. Insert course requests
    console.log("Inserting course requests...");
    const courseRequestsData = [
      [
        courseMap["CSc101"],
        semesterMap["2024-II"],
        staffIdMap["dr.samuel"],
        userMap["dr.samuel"],
        "A",
        "Monday 10-12, Wednesday 8-10",
        "Teaching this course for the past 3 years",
        "approved",
        userMap["dr.tilahun"],
        "2024-01-15 10:00:00",
        "Approved based on expertise",
      ],
    ];

    for (const request of courseRequestsData) {
      const sql =
        "INSERT INTO course_requests (course_id, semester_id, staff_id, requested_by, section_code, preferred_schedule, reason, status, processed_by, processed_date, processed_notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
      await connection.execute(sql, request);
    }
    console.log("✓ Course requests inserted");

    // 26. Insert curriculum plans
    console.log("Inserting curriculum plans...");
    // Add some more courses for curriculum
    const additionalCourses = [
      [
        "CoSc1012",
        "Computer Programming",
        deptCodeMap["CS"],
        programMap["SE-REG"],
        2024,
        2,
        1,
        5.0,
        3.0,
        2.0,
        0.0,
        "regular",
        1,
        2,
        1,
        "",
        120,
        30,
        "active",
      ],
    ];

    for (const course of additionalCourses) {
      const sql = `INSERT INTO courses (course_code, course_title, department_id, program_id, academic_year, recommended_semester, course_order, credit_hours, lecture_hours, lab_hours, tutorial_hours, program_type, course_year, course_semester, is_core_course, prerequisites, max_students, min_students, status) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      await connection.execute(sql, course);
    }

    // Update course map
    const [newCourses] = await connection.execute(
      'SELECT course_id, course_code FROM courses WHERE course_code = "CoSc1012"'
    );
    if (newCourses.length > 0) {
      courseMap["CoSc1012"] = newCourses[0].course_id;
    }

    const curriculumPlansData = [
      [
        departmentMap["SE"],
        programMap["SE-REG"],
        1,
        1,
        courseMap["Math111"],
        1,
        0,
        "",
      ],
      [
        departmentMap["SE"],
        programMap["SE-REG"],
        1,
        2,
        courseMap["CoSc1012"],
        1,
        0,
        "",
      ],
      [
        departmentMap["SE"],
        programMap["SE-REG"],
        2,
        1,
        courseMap["SEng4021"],
        1,
        0,
        "CoSc1012",
      ],
      [
        departmentMap["SE"],
        programMap["SE-REG"],
        2,
        1,
        courseMap["SEng5021"],
        1,
        0,
        "CoSc1012",
      ],
      [
        departmentMap["CS"],
        programMap["CS-REG"],
        1,
        1,
        courseMap["CSc101"],
        1,
        0,
        "",
      ],
    ];

    for (const plan of curriculumPlansData) {
      const sql =
        "INSERT INTO curriculum_plans (department_id, program_id, year, semester, course_id, is_core, is_elective, prerequisites) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
      await connection.execute(sql, plan);
    }
    console.log("✓ Curriculum plans inserted");

    // Commit transaction
    await connection.query("COMMIT");

    console.log("✅ All test data inserted successfully!");
  } catch (error) {
    // Rollback on error
    await connection.query("ROLLBACK");

    console.error("❌ Error inserting test data:", error.message);
    throw error;
  }
};


export default insertTestData;

