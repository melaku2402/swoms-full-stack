const getAllData = async () => {
  const hashedPassword = await generateHashedPasswords();

  return {
    users: [
      // System Admin (user_id: 1)
      {
        user_id: 1,
        username: "admin",
        email: "admin@iu.edu.et",
        password_hash: hashedPassword,
        role: "admin",
        is_active: true,
        created_by: null,
      },

      // College of Engineering and Technology - Dean (user_id: 2)
      {
        user_id: 2,
        username: "dr.abebe",
        email: "abebe.tesfaye@iu.edu.et",
        password_hash: hashedPassword,
        role: "dean",
        is_active: true,
        created_by: 1,
      },

      // College of Natural Sciences - Dean (user_id: 3)
      {
        user_id: 3,
        username: "dr.almaz",
        email: "almaz.mengesha@iu.edu.et",
        password_hash: hashedPassword,
        role: "dean",
        is_active: true,
        created_by: 1,
      },

      // College of Business and Economics - Dean (user_id: 4)
      {
        user_id: 4,
        username: "dr.solomon",
        email: "solomon.kebede@iu.edu.et",
        password_hash: hashedPassword,
        role: "dean",
        is_active: true,
        created_by: 1,
      },

      // Department Heads
      {
        user_id: 5,
        username: "dr.getachew",
        email: "getachew.haile@iu.edu.et",
        password_hash: hashedPassword,
        role: "department_head",
        is_active: true,
        created_by: 2, // dean_eng_001
      },
      {
        user_id: 6,
        username: "dr.tilahun",
        email: "tilahun.abate@iu.edu.et",
        password_hash: hashedPassword,
        role: "department_head",
        is_active: true,
        created_by: 2, // dean_eng_001
      },
      {
        user_id: 7,
        username: "dr.meron",
        email: "meron.girma@iu.edu.et",
        password_hash: hashedPassword,
        role: "department_head",
        is_active: true,
        created_by: 2, // dean_eng_001
      },
      {
        user_id: 8,
        username: "dr.yohannes",
        email: "yohannes.asrat@iu.edu.et",
        password_hash: hashedPassword,
        role: "department_head",
        is_active: true,
        created_by: 3, // dean_ns_001
      },

      // Instructors
      {
        user_id: 9,
        username: "mr.alemayehu",
        email: "alemayehu.wondimu@iu.edu.et",
        password_hash: hashedPassword,
        role: "instructor",
        is_active: true,
        created_by: 5, // depthead_se_001
      },
      {
        user_id: 10,
        username: "ms.kidan",
        email: "kidan.tadesse@iu.edu.et",
        password_hash: hashedPassword,
        role: "instructor",
        is_active: true,
        created_by: 5, // depthead_se_001
      },
      {
        user_id: 11,
        username: "dr.samuel",
        email: "samuel.mekonnen@iu.edu.et",
        password_hash: hashedPassword,
        role: "instructor",
        is_active: true,
        created_by: 6, // depthead_cs_001
      },
      {
        user_id: 12,
        username: "mr.eyob",
        email: "eyob.berhanu@iu.edu.et",
        password_hash: hashedPassword,
        role: "instructor",
        is_active: true,
        created_by: 7, // depthead_ee_001
      },

      // Other roles
      {
        user_id: 13,
        username: "ms.hirut",
        email: "hirut.molla@iu.edu.et",
        password_hash: hashedPassword,
        role: "hr_director",
        is_active: true,
        created_by: 1,
      },
      {
        user_id: 14,
        username: "mr.tadesse",
        email: "tadesse.lemma@iu.edu.et",
        password_hash: hashedPassword,
        role: "finance",
        is_active: true,
        created_by: 1,
      },
      {
        user_id: 15,
        username: "dr.zelalem",
        email: "zelalem.bezabih@iu.edu.et",
        password_hash: hashedPassword,
        role: "cde_director",
        is_active: true,
        created_by: 1,
      },
      {
        user_id: 16,
        username: "mr.bekele",
        email: "bekele.wolde@iu.edu.et",
        password_hash: hashedPassword,
        role: "registrar",
        is_active: true,
        created_by: 1,
      },
      {
        user_id: 17,
        username: "dr.mesfin",
        email: "mesfin.tadesse@iu.edu.et",
        password_hash: hashedPassword,
        role: "vpaa",
        is_active: true,
        created_by: 1,
      },
      {
        user_id: 18,
        username: "dr.helen",
        email: "helen.girma@iu.edu.et",
        password_hash: hashedPassword,
        role: "vpaf",
        is_active: true,
        created_by: 1,
      },
    ],

    colleges: [
      {
        college_id: 1,
        college_code: "COET",
        college_name: "College of Engineering and Technology",
        dean_user_id: 2, // dr.abebe
        status: "active",
      },
      {
        college_id: 2,
        college_code: "CONS",
        college_name: "College of Natural Sciences",
        dean_user_id: 3, // dr.almaz
        status: "active",
      },
      {
        college_id: 3,
        college_code: "COBE",
        college_name: "College of Business and Economics",
        dean_user_id: 4, // dr.solomon
        status: "active",
      },
      {
        college_id: 4,
        college_code: "COHS",
        college_name: "College of Health Sciences",
        dean_user_id: null,
        status: "active",
      },
      {
        college_id: 5,
        college_code: "COA",
        college_name: "College of Agriculture",
        dean_user_id: null,
        status: "active",
      },
    ],

    departments: [
      // College of Engineering and Technology departments
      {
        department_id: 1,
        department_code: "SE",
        department_name: "Software Engineering",
        college_id: 1, // COET
        head_user_id: 5, // dr.getachew
        status: "active",
      },
      {
        department_id: 2,
        department_code: "CS",
        department_name: "Computer Science",
        college_id: 1, // COET
        head_user_id: 6, // dr.tilahun
        status: "active",
      },
      {
        department_id: 3,
        department_code: "EE",
        department_name: "Electrical Engineering",
        college_id: 1, // COET
        head_user_id: 7, // dr.meron
        status: "active",
      },
      {
        department_id: 4,
        department_code: "CE",
        department_name: "Civil Engineering",
        college_id: 1, // COET
        head_user_id: null,
        status: "active",
      },

      // College of Natural Sciences departments
      {
        department_id: 5,
        department_code: "MATH",
        department_name: "Mathematics",
        college_id: 2, // CONS
        head_user_id: 8, // dr.yohannes
        status: "active",
      },
      {
        department_id: 6,
        department_code: "PHYS",
        department_name: "Physics",
        college_id: 2, // CONS
        head_user_id: null,
        status: "active",
      },
      {
        department_id: 7,
        department_code: "CHEM",
        department_name: "Chemistry",
        college_id: 2, // CONS
        head_user_id: null,
        status: "active",
      },
      {
        department_id: 8,
        department_code: "BIO",
        department_name: "Biology",
        college_id: 2, // CONS
        head_user_id: null,
        status: "active",
      },

      // College of Business and Economics departments
      {
        department_id: 9,
        department_code: "ACC",
        department_name: "Accounting",
        college_id: 3, // COBE
        head_user_id: null,
        status: "active",
      },
      {
        department_id: 10,
        department_code: "MGMT",
        department_name: "Management",
        college_id: 3, // COBE
        head_user_id: null,
        status: "active",
      },
      {
        department_id: 11,
        department_code: "ECON",
        department_name: "Economics",
        college_id: 3, // COBE
        head_user_id: null,
        status: "active",
      },
    ],

    staff_profiles: [
      // Software Engineering Department Staff (staff_id: 1)
      {
        staff_id: 1,
        user_id: 5, // dr.getachew
        employee_id: "EMP001",
        first_name: "Getachew",
        last_name: "Haile",
        middle_name: "",
        department_id: 1, // SE
        academic_rank: "professor",
        employment_type: "full_time",
        hire_date: "2015-09-01",
        phone: "+251911223344",
        address: "Addis Ababa, Ethiopia",
        date_of_birth: "1978-05-15",
        gender: "male",
        created_by: 1, // admin
      },
      {
        staff_id: 2,
        user_id: 9, // mr.alemayehu
        employee_id: "EMP002",
        first_name: "Alemayehu",
        last_name: "Wondimu",
        middle_name: "",
        department_id: 1, // SE
        academic_rank: "lecturer",
        employment_type: "full_time",
        hire_date: "2020-01-15",
        phone: "+251922334455",
        address: "Addis Ababa, Ethiopia",
        date_of_birth: "1985-08-20",
        gender: "male",
        created_by: 5, // dr.getachew
      },
      {
        staff_id: 3,
        user_id: 10, // ms.kidan
        employee_id: "EMP003",
        first_name: "Kidan",
        last_name: "Tadesse",
        middle_name: "",
        department_id: 1, // SE
        academic_rank: "assistant_professor",
        employment_type: "full_time",
        hire_date: "2019-03-01",
        phone: "+251933445566",
        address: "Addis Ababa, Ethiopia",
        date_of_birth: "1988-11-30",
        gender: "female",
        created_by: 5, // dr.getachew
      },

      // Computer Science Department Staff (staff_id: 4)
      {
        staff_id: 4,
        user_id: 6, // dr.tilahun
        employee_id: "EMP004",
        first_name: "Tilahun",
        last_name: "Abate",
        middle_name: "",
        department_id: 2, // CS
        academic_rank: "professor",
        employment_type: "full_time",
        hire_date: "2016-07-01",
        phone: "+251944556677",
        address: "Addis Ababa, Ethiopia",
        date_of_birth: "1975-03-25",
        gender: "male",
        created_by: 2, // dr.abebe
      },
      {
        staff_id: 5,
        user_id: 11, // dr.samuel
        employee_id: "EMP005",
        first_name: "Samuel",
        last_name: "Mekonnen",
        middle_name: "",
        department_id: 2, // CS
        academic_rank: "associate_professor",
        employment_type: "full_time",
        hire_date: "2018-09-01",
        phone: "+251955667788",
        address: "Addis Ababa, Ethiopia",
        date_of_birth: "1980-12-10",
        gender: "male",
        created_by: 6, // dr.tilahun
      },

      // Electrical Engineering Department Staff (staff_id: 6)
      {
        staff_id: 6,
        user_id: 7, // dr.meron
        employee_id: "EMP006",
        first_name: "Meron",
        last_name: "Girma",
        middle_name: "",
        department_id: 3, // EE
        academic_rank: "associate_professor",
        employment_type: "full_time",
        hire_date: "2017-11-01",
        phone: "+251966778899",
        address: "Addis Ababa, Ethiopia",
        date_of_birth: "1982-07-18",
        gender: "female",
        created_by: 2, // dr.abebe
      },
      {
        staff_id: 7,
        user_id: 12, // mr.eyob
        employee_id: "EMP007",
        first_name: "Eyob",
        last_name: "Berhanu",
        middle_name: "",
        department_id: 3, // EE
        academic_rank: "lecturer",
        employment_type: "full_time",
        hire_date: "2021-02-01",
        phone: "+251977889900",
        address: "Addis Ababa, Ethiopia",
        date_of_birth: "1990-04-22",
        gender: "male",
        created_by: 7, // dr.meron
      },

      // Mathematics Department Staff (staff_id: 8)
      {
        staff_id: 8,
        user_id: 8, // dr.yohannes
        employee_id: "EMP008",
        first_name: "Yohannes",
        last_name: "Asrat",
        middle_name: "",
        department_id: 5, // MATH
        academic_rank: "professor",
        employment_type: "full_time",
        hire_date: "2014-08-01",
        phone: "+251988990011",
        address: "Addis Ababa, Ethiopia",
        date_of_birth: "1972-09-14",
        gender: "male",
        created_by: 3, // dr.almaz
      },
    ],

    academic_years: [
      {
        academic_year_id: 1,
        year_code: "2024-2025",
        year_name: "Academic Year 2024/2025",
        start_date: "2024-09-01",
        end_date: "2025-08-31",
        is_active: true,
      },
      {
        academic_year_id: 2,
        year_code: "2023-2024",
        year_name: "Academic Year 2023/2024",
        start_date: "2023-09-01",
        end_date: "2024-08-31",
        is_active: false,
      },
      {
        academic_year_id: 3,
        year_code: "2025-2026",
        year_name: "Academic Year 2025/2026",
        start_date: "2025-09-01",
        end_date: "2026-08-31",
        is_active: false,
      },
    ],

    semesters: [
      // 2024-2025 Academic Year
      {
        semester_id: 1,
        semester_code: "2024-I",
        semester_name: "Semester I 2024/2025",
        academic_year_id: 1, // 2024-2025
        semester_type: "semester_i",
        start_date: "2024-09-01",
        end_date: "2025-01-31",
        is_active: true,
      },
      {
        semester_id: 2,
        semester_code: "2024-II",
        semester_name: "Semester II 2024/2025",
        academic_year_id: 1, // 2024-2025
        semester_type: "semester_ii",
        start_date: "2025-02-01",
        end_date: "2025-06-30",
        is_active: false,
      },
      {
        semester_id: 3,
        semester_code: "2024-SU",
        semester_name: "Summer 2025",
        academic_year_id: 1, // 2024-2025
        semester_type: "summer",
        start_date: "2025-07-01",
        end_date: "2025-08-31",
        is_active: false,
      },
      {
        semester_id: 4,
        semester_code: "2024-DIS",
        semester_name: "Distance 2025",
        academic_year_id: 1, // 2024-2025
        semester_type: "distance",
        start_date: "2025-01-15",
        end_date: "2025-05-15",
        is_active: false,
      },
      {
        semester_id: 5,
        semester_code: "2024-EXT",
        semester_name: "Extension 2025",
        academic_year_id: 1, // 2024-2025
        semester_type: "extension",
        start_date: "2025-03-01",
        end_date: "2025-07-01",
        is_active: false,
      },
      {
        semester_id: 6,
        semester_code: "2024-WK",
        semester_name: "Weekend 2025",
        academic_year_id: 1, // 2024-2025
        semester_type: "weekend",
        start_date: "2025-02-15",
        end_date: "2025-06-15",
        is_active: false,
      },

      // 2023-2024 Academic Year
      {
        semester_id: 7,
        semester_code: "2023-I",
        semester_name: "Semester I 2023/2024",
        academic_year_id: 2, // 2023-2024
        semester_type: "semester_i",
        start_date: "2023-09-01",
        end_date: "2024-01-31",
        is_active: false,
      },
      {
        semester_id: 8,
        semester_code: "2023-II",
        semester_name: "Semester II 2023/2024",
        academic_year_id: 2, // 2023-2024
        semester_type: "semester_ii",
        start_date: "2024-02-01",
        end_date: "2024-06-30",
        is_active: false,
      },
    ],

    programs: [
      // Software Engineering Programs
      {
        program_id: 1,
        program_code: "SE-REG",
        program_name: "Software Engineering Regular",
        department_id: 1, // SE
        program_type: "regular",
        status: "active",
      },
      {
        program_id: 2,
        program_code: "SE-EXT",
        program_name: "Software Engineering Extension",
        department_id: 1, // SE
        program_type: "extension",
        status: "active",
      },
      {
        program_id: 3,
        program_code: "SE-WK",
        program_name: "Software Engineering Weekend",
        department_id: 1, // SE
        program_type: "weekend",
        status: "active",
      },
      {
        program_id: 4,
        program_code: "SE-SU",
        program_name: "Software Engineering Summer",
        department_id: 1, // SE
        program_type: "summer",
        status: "active",
      },
      {
        program_id: 5,
        program_code: "SE-DIS",
        program_name: "Software Engineering Distance",
        department_id: 1, // SE
        program_type: "distance",
        status: "active",
      },

      // Computer Science Programs
      {
        program_id: 6,
        program_code: "CS-REG",
        program_name: "Computer Science Regular",
        department_id: 2, // CS
        program_type: "regular",
        status: "active",
      },
      {
        program_id: 7,
        program_code: "CS-EXT",
        program_name: "Computer Science Extension",
        department_id: 2, // CS
        program_type: "extension",
        status: "active",
      },

      // Electrical Engineering Programs
      {
        program_id: 8,
        program_code: "EE-REG",
        program_name: "Electrical Engineering Regular",
        department_id: 3, // EE
        program_type: "regular",
        status: "active",
      },

      // Mathematics Programs
      {
        program_id: 9,
        program_code: "MATH-REG",
        program_name: "Mathematics Regular",
        department_id: 5, // MATH
        program_type: "regular",
        status: "active",
      },
    ],

    courses: [
      // Software Engineering Courses (Year 1 - Semester 1)
      {
        course_id: 1,
        course_code: "Math1011",
        course_title: "Mathematics for Natural Sciences",
        department_id: 5, // MATH
        program_id: 1, // SE-REG
        academic_year: 1,
        recommended_semester: 1,
        course_order: 1,
        credit_hours: 5,
        lecture_hours: 5,
        lab_hours: 0,
        tutorial_hours: 0,
        program_type: "regular",
        course_year: 1,
        course_semester: 1,
        is_core_course: true,
        prerequisites: "",
        max_students: 200,
        min_students: 50,
        status: "active",
      },
      {
        course_id: 2,
        course_code: "Phys1011",
        course_title: "General Physics",
        department_id: 6, // PHYS
        program_id: 1, // SE-REG
        academic_year: 1,
        recommended_semester: 1,
        course_order: 2,
        credit_hours: 5,
        lecture_hours: 4,
        lab_hours: 1,
        tutorial_hours: 0,
        program_type: "regular",
        course_year: 1,
        course_semester: 1,
        is_core_course: true,
        prerequisites: "",
        max_students: 150,
        min_students: 40,
        status: "active",
      },
      {
        course_id: 3,
        course_code: "Psyc1011",
        course_title: "General Psychology",
        department_id: 8, // BIO
        program_id: 1, // SE-REG
        academic_year: 1,
        recommended_semester: 1,
        course_order: 3,
        credit_hours: 5,
        lecture_hours: 5,
        lab_hours: 0,
        tutorial_hours: 0,
        program_type: "regular",
        course_year: 1,
        course_semester: 1,
        is_core_course: true,
        prerequisites: "",
        max_students: 180,
        min_students: 45,
        status: "active",
      },
      {
        course_id: 4,
        course_code: "SpSc1011",
        course_title: "Physical Fitness",
        department_id: 1, // SE
        program_id: 1, // SE-REG
        academic_year: 1,
        recommended_semester: 1,
        course_order: 4,
        credit_hours: 2,
        lecture_hours: 1,
        lab_hours: 1,
        tutorial_hours: 0,
        program_type: "regular",
        course_year: 1,
        course_semester: 1,
        is_core_course: true,
        prerequisites: "",
        max_students: 100,
        min_students: 25,
        status: "active",
      },
      {
        course_id: 5,
        course_code: "GeES1011",
        course_title: "Geography of Ethiopia and the Horn",
        department_id: 1, // SE
        program_id: 1, // SE-REG
        academic_year: 1,
        recommended_semester: 1,
        course_order: 5,
        credit_hours: 5,
        lecture_hours: 5,
        lab_hours: 0,
        tutorial_hours: 0,
        program_type: "regular",
        course_year: 1,
        course_semester: 1,
        is_core_course: true,
        prerequisites: "",
        max_students: 180,
        min_students: 50,
        status: "active",
      },
      {
        course_id: 6,
        course_code: "FLEn1011",
        course_title: "Communicative English Language Skills I",
        department_id: 1, // SE
        program_id: 1, // SE-REG
        academic_year: 1,
        recommended_semester: 1,
        course_order: 6,
        credit_hours: 5,
        lecture_hours: 4,
        lab_hours: 1,
        tutorial_hours: 0,
        program_type: "regular",
        course_year: 1,
        course_semester: 1,
        is_core_course: true,
        prerequisites: "",
        max_students: 200,
        min_students: 50,
        status: "active",
      },
      {
        course_id: 7,
        course_code: "LoCT1011",
        course_title: "Logic and Critical Thinking",
        department_id: 1, // SE
        program_id: 1, // SE-REG
        academic_year: 1,
        recommended_semester: 1,
        course_order: 7,
        credit_hours: 5,
        lecture_hours: 5,
        lab_hours: 0,
        tutorial_hours: 0,
        program_type: "regular",
        course_year: 1,
        course_semester: 1,
        is_core_course: true,
        prerequisites: "",
        max_students: 150,
        min_students: 40,
        status: "active",
      },

      // Year 1 - Semester 2
      {
        course_id: 8,
        course_code: "EmTe1012",
        course_title: "Introduction to Emerging Technologies",
        department_id: 2, // CS
        program_id: 1, // SE-REG
        academic_year: 1,
        recommended_semester: 2,
        course_order: 1,
        credit_hours: 5,
        lecture_hours: 4,
        lab_hours: 1,
        tutorial_hours: 0,
        program_type: "regular",
        course_year: 1,
        course_semester: 2,
        is_core_course: true,
        prerequisites: "",
        max_students: 150,
        min_students: 40,
        status: "active",
      },
      {
        course_id: 9,
        course_code: "Anth1012",
        course_title: "Social Anthropology",
        department_id: 1, // SE
        program_id: 1, // SE-REG
        academic_year: 1,
        recommended_semester: 2,
        course_order: 2,
        credit_hours: 4,
        lecture_hours: 4,
        lab_hours: 0,
        tutorial_hours: 0,
        program_type: "regular",
        course_year: 1,
        course_semester: 2,
        is_core_course: true,
        prerequisites: "",
        max_students: 150,
        min_students: 40,
        status: "active",
      },
      {
        course_id: 10,
        course_code: "Math1012",
        course_title: "Applied Mathematics",
        department_id: 5, // MATH
        program_id: 1, // SE-REG
        academic_year: 1,
        recommended_semester: 2,
        course_order: 3,
        credit_hours: 5,
        lecture_hours: 5,
        lab_hours: 0,
        tutorial_hours: 0,
        program_type: "regular",
        course_year: 1,
        course_semester: 2,
        is_core_course: true,
        prerequisites: "Math1011",
        max_students: 150,
        min_students: 40,
        status: "active",
      },
      {
        course_id: 11,
        course_code: "MCiE1012",
        course_title: "Moral and Civic Education",
        department_id: 1, // SE
        program_id: 1, // SE-REG
        academic_year: 1,
        recommended_semester: 2,
        course_order: 4,
        credit_hours: 4,
        lecture_hours: 4,
        lab_hours: 0,
        tutorial_hours: 0,
        program_type: "regular",
        course_year: 1,
        course_semester: 2,
        is_core_course: true,
        prerequisites: "",
        max_students: 200,
        min_students: 50,
        status: "active",
      },
      {
        course_id: 12,
        course_code: "FLEn1012",
        course_title: "Communicative English Language Skills II",
        department_id: 1, // SE
        program_id: 1, // SE-REG
        academic_year: 1,
        recommended_semester: 2,
        course_order: 5,
        credit_hours: 5,
        lecture_hours: 4,
        lab_hours: 1,
        tutorial_hours: 0,
        program_type: "regular",
        course_year: 1,
        course_semester: 2,
        is_core_course: true,
        prerequisites: "FLEn1011",
        max_students: 150,
        min_students: 40,
        status: "active",
      },
      {
        course_id: 13,
        course_code: "GlTr1012",
        course_title: "Global Trends",
        department_id: 1, // SE
        program_id: 1, // SE-REG
        academic_year: 1,
        recommended_semester: 2,
        course_order: 6,
        credit_hours: 4,
        lecture_hours: 4,
        lab_hours: 0,
        tutorial_hours: 0,
        program_type: "regular",
        course_year: 1,
        course_semester: 2,
        is_core_course: true,
        prerequisites: "",
        max_students: 150,
        min_students: 40,
        status: "active",
      },
      {
        course_id: 14,
        course_code: "CoSc1012",
        course_title: "Computer Programming",
        department_id: 2, // CS
        program_id: 1, // SE-REG
        academic_year: 1,
        recommended_semester: 2,
        course_order: 7,
        credit_hours: 5,
        lecture_hours: 3,
        lab_hours: 2,
        tutorial_hours: 0,
        program_type: "regular",
        course_year: 1,
        course_semester: 2,
        is_core_course: true,
        prerequisites: "",
        max_students: 120,
        min_students: 30,
        status: "active",
      },

      // Year 2 - Semester 1 (Software Engineering Core Courses)
      {
        course_id: 15,
        course_code: "SEng4021",
        course_title: "Fundamentals of Database System",
        department_id: 1, // SE
        program_id: 1, // SE-REG
        academic_year: 2,
        recommended_semester: 1,
        course_order: 1,
        credit_hours: 5,
        lecture_hours: 3,
        lab_hours: 2,
        tutorial_hours: 0,
        program_type: "regular",
        course_year: 2,
        course_semester: 1,
        is_core_course: true,
        prerequisites: "CoSc1012",
        max_students: 80,
        min_students: 20,
        status: "active",
      },
      {
        course_id: 16,
        course_code: "SEng5021",
        course_title: "Fundamental of Software Engineering",
        department_id: 1, // SE
        program_id: 1, // SE-REG
        academic_year: 2,
        recommended_semester: 1,
        course_order: 2,
        credit_hours: 7,
        lecture_hours: 5,
        lab_hours: 2,
        tutorial_hours: 0,
        program_type: "regular",
        course_year: 2,
        course_semester: 1,
        is_core_course: true,
        prerequisites: "CoSc1012",
        max_students: 70,
        min_students: 15,
        status: "active",
      },
      {
        course_id: 17,
        course_code: "SEng2021",
        course_title: "Computer Programming II",
        department_id: 2, // CS
        program_id: 1, // SE-REG
        academic_year: 2,
        recommended_semester: 1,
        course_order: 3,
        credit_hours: 5,
        lecture_hours: 3,
        lab_hours: 2,
        tutorial_hours: 0,
        program_type: "regular",
        course_year: 2,
        course_semester: 1,
        is_core_course: true,
        prerequisites: "CoSc1012",
        max_students: 80,
        min_students: 20,
        status: "active",
      },
      {
        course_id: 18,
        course_code: "Math2011",
        course_title: "Discrete Mathematics and Combinatory",
        department_id: 5, // MATH
        program_id: 1, // SE-REG
        academic_year: 2,
        recommended_semester: 1,
        course_order: 4,
        credit_hours: 5,
        lecture_hours: 5,
        lab_hours: 0,
        tutorial_hours: 0,
        program_type: "regular",
        course_year: 2,
        course_semester: 1,
        is_core_course: true,
        prerequisites: "Math1011, Math1012",
        max_students: 100,
        min_students: 25,
        status: "active",
      },
      {
        course_id: 19,
        course_code: "Incl1012",
        course_title: "Inclusiveness",
        department_id: 1, // SE
        program_id: 1, // SE-REG
        academic_year: 2,
        recommended_semester: 1,
        course_order: 5,
        credit_hours: 4,
        lecture_hours: 4,
        lab_hours: 0,
        tutorial_hours: 0,
        program_type: "regular",
        course_year: 2,
        course_semester: 1,
        is_core_course: true,
        prerequisites: "",
        max_students: 120,
        min_students: 30,
        status: "active",
      },
      {
        course_id: 20,
        course_code: "Econ1011",
        course_title: "Introduction to Economics",
        department_id: 11, // ECON
        program_id: 1, // SE-REG
        academic_year: 2,
        recommended_semester: 1,
        course_order: 6,
        credit_hours: 5,
        lecture_hours: 5,
        lab_hours: 0,
        tutorial_hours: 0,
        program_type: "regular",
        course_year: 2,
        course_semester: 1,
        is_core_course: true,
        prerequisites: "",
        max_students: 150,
        min_students: 40,
        status: "active",
      },

      // Year 2 - Semester 2
      {
        course_id: 21,
        course_code: "SEng2122",
        course_title: "Data Structure and Algorithms",
        department_id: 2, // CS
        program_id: 1, // SE-REG
        academic_year: 2,
        recommended_semester: 2,
        course_order: 1,
        credit_hours: 5,
        lecture_hours: 3,
        lab_hours: 2,
        tutorial_hours: 0,
        program_type: "regular",
        course_year: 2,
        course_semester: 2,
        is_core_course: true,
        prerequisites: "SEng2021",
        max_students: 70,
        min_students: 15,
        status: "active",
      },
      {
        course_id: 22,
        course_code: "SEng3122",
        course_title: "Operating Systems and Systems Programming",
        department_id: 2, // CS
        program_id: 1, // SE-REG
        academic_year: 2,
        recommended_semester: 2,
        course_order: 2,
        credit_hours: 7,
        lecture_hours: 5,
        lab_hours: 2,
        tutorial_hours: 0,
        program_type: "regular",
        course_year: 2,
        course_semester: 2,
        is_core_course: true,
        prerequisites: "SEng2021",
        max_students: 60,
        min_students: 15,
        status: "active",
      },
      {
        course_id: 23,
        course_code: "SEng3022",
        course_title: "Computer Organization and Architecture",
        department_id: 3, // EE
        program_id: 1, // SE-REG
        academic_year: 2,
        recommended_semester: 2,
        course_order: 3,
        credit_hours: 5,
        lecture_hours: 4,
        lab_hours: 1,
        tutorial_hours: 0,
        program_type: "regular",
        course_year: 2,
        course_semester: 2,
        is_core_course: true,
        prerequisites: "EmTe1012",
        max_students: 80,
        min_students: 20,
        status: "active",
      },
      {
        course_id: 24,
        course_code: "Stat4012",
        course_title: "Probability and Statistics",
        department_id: 5, // MATH
        program_id: 1, // SE-REG
        academic_year: 2,
        recommended_semester: 2,
        course_order: 4,
        credit_hours: 5,
        lecture_hours: 5,
        lab_hours: 0,
        tutorial_hours: 0,
        program_type: "regular",
        course_year: 2,
        course_semester: 2,
        is_core_course: true,
        prerequisites: "Math1011, Math1012",
        max_students: 100,
        min_students: 25,
        status: "active",
      },
      {
        course_id: 25,
        course_code: "SEng6022",
        course_title: "Object Oriented Programming",
        department_id: 2, // CS
        program_id: 1, // SE-REG
        academic_year: 2,
        recommended_semester: 2,
        course_order: 5,
        credit_hours: 5,
        lecture_hours: 3,
        lab_hours: 2,
        tutorial_hours: 0,
        program_type: "regular",
        course_year: 2,
        course_semester: 2,
        is_core_course: true,
        prerequisites: "SEng2021",
        max_students: 70,
        min_students: 15,
        status: "active",
      },
      {
        course_id: 26,
        course_code: "SEng7022",
        course_title: "Fundamental of Networking",
        department_id: 3, // EE
        program_id: 1, // SE-REG
        academic_year: 2,
        recommended_semester: 2,
        course_order: 6,
        credit_hours: 7,
        lecture_hours: 5,
        lab_hours: 2,
        tutorial_hours: 0,
        program_type: "regular",
        course_year: 2,
        course_semester: 2,
        is_core_course: true,
        prerequisites: "EmTe1012",
        max_students: 60,
        min_students: 15,
        status: "active",
      },

      // Computer Science Courses
      {
        course_id: 27,
        course_code: "CSc101",
        course_title: "Introduction to Computer Science",
        department_id: 2, // CS
        program_id: 6, // CS-REG
        academic_year: 1,
        recommended_semester: 1,
        course_order: 1,
        credit_hours: 4,
        lecture_hours: 3,
        lab_hours: 1,
        tutorial_hours: 0,
        program_type: "regular",
        course_year: 1,
        course_semester: 1,
        is_core_course: true,
        prerequisites: "",
        max_students: 120,
        min_students: 30,
        status: "active",
      },
      {
        course_id: 28,
        course_code: "CSc102",
        course_title: "Data Structures and Algorithms",
        department_id: 2, // CS
        program_id: 6, // CS-REG
        academic_year: 2,
        recommended_semester: 1,
        course_order: 2,
        credit_hours: 5,
        lecture_hours: 3,
        lab_hours: 2,
        tutorial_hours: 0,
        program_type: "regular",
        course_year: 2,
        course_semester: 1,
        is_core_course: true,
        prerequisites: "CSc101",
        max_students: 80,
        min_students: 20,
        status: "active",
      },

      // Electrical Engineering Courses
      {
        course_id: 29,
        course_code: "EEng101",
        course_title: "Circuit Analysis",
        department_id: 3, // EE
        program_id: 8, // EE-REG
        academic_year: 1,
        recommended_semester: 1,
        course_order: 1,
        credit_hours: 5,
        lecture_hours: 4,
        lab_hours: 1,
        tutorial_hours: 0,
        program_type: "regular",
        course_year: 1,
        course_semester: 1,
        is_core_course: true,
        prerequisites: "",
        max_students: 100,
        min_students: 25,
        status: "active",
      },
      {
        course_id: 30,
        course_code: "EEng102",
        course_title: "Digital Logic Design",
        department_id: 3, // EE
        program_id: 8, // EE-REG
        academic_year: 1,
        recommended_semester: 2,
        course_order: 2,
        credit_hours: 4,
        lecture_hours: 3,
        lab_hours: 1,
        tutorial_hours: 0,
        program_type: "regular",
        course_year: 1,
        course_semester: 2,
        is_core_course: true,
        prerequisites: "EEng101",
        max_students: 80,
        min_students: 20,
        status: "active",
      },

      // Mathematics Courses
      {
        course_id: 31,
        course_code: "Math111",
        course_title: "Calculus I",
        department_id: 5, // MATH
        program_id: 9, // MATH-REG
        academic_year: 1,
        recommended_semester: 1,
        course_order: 1,
        credit_hours: 6,
        lecture_hours: 5,
        lab_hours: 1,
        tutorial_hours: 0,
        program_type: "regular",
        course_year: 1,
        course_semester: 1,
        is_core_course: true,
        prerequisites: "",
        max_students: 150,
        min_students: 40,
        status: "active",
      },
      {
        course_id: 32,
        course_code: "Math112",
        course_title: "Calculus II",
        department_id: 5, // MATH
        program_id: 9, // MATH-REG
        academic_year: 1,
        recommended_semester: 2,
        course_order: 2,
        credit_hours: 6,
        lecture_hours: 5,
        lab_hours: 1,
        tutorial_hours: 0,
        program_type: "regular",
        course_year: 1,
        course_semester: 2,
        is_core_course: true,
        prerequisites: "Math111",
        max_students: 140,
        min_students: 35,
        status: "active",
      },
    ],

    sections: [
      // Semester I 2024 Sections
      {
        section_id: 1,
        course_id: 15, // SEng4021
        semester_id: 1, // 2024-I
        section_code: "A",
        instructor_id: 2, // mr.alemayehu (staff_id: 2)
        student_count: 45,
        max_capacity: 60,
        is_active: true,
      },
      {
        section_id: 2,
        course_id: 15, // SEng4021
        semester_id: 1, // 2024-I
        section_code: "B",
        instructor_id: 3, // ms.kidan (staff_id: 3)
        student_count: 38,
        max_capacity: 60,
        is_active: true,
      },
      {
        section_id: 3,
        course_id: 16, // SEng5021
        semester_id: 1, // 2024-I
        section_code: "A",
        instructor_id: 1, // dr.getachew (staff_id: 1)
        student_count: 35,
        max_capacity: 50,
        is_active: true,
      },
      {
        section_id: 4,
        course_id: 27, // CSc101
        semester_id: 1, // 2024-I
        section_code: "A",
        instructor_id: 5, // dr.samuel (staff_id: 5)
        student_count: 55,
        max_capacity: 70,
        is_active: true,
      },
      {
        section_id: 5,
        course_id: 29, // EEng101
        semester_id: 1, // 2024-I
        section_code: "A",
        instructor_id: 7, // mr.eyob (staff_id: 7)
        student_count: 48,
        max_capacity: 60,
        is_active: true,
      },
      {
        section_id: 6,
        course_id: 31, // Math111
        semester_id: 1, // 2024-I
        section_code: "A",
        instructor_id: 8, // dr.yohannes (staff_id: 8)
        student_count: 65,
        max_capacity: 80,
        is_active: true,
      },
    ],

    curriculum_plans: [
      // Software Engineering Curriculum - Year 1, Semester 1
      {
        plan_id: 1,
        department_id: 1, // SE
        program_id: 1, // SE-REG
        year: 1,
        semester: 1,
        course_id: 1, // Math1011
        is_core: true,
        is_elective: false,
        prerequisites: "",
      },
      {
        plan_id: 2,
        department_id: 1, // SE
        program_id: 1, // SE-REG
        year: 1,
        semester: 1,
        course_id: 2, // Phys1011
        is_core: true,
        is_elective: false,
        prerequisites: "",
      },
      {
        plan_id: 3,
        department_id: 1, // SE
        program_id: 1, // SE-REG
        year: 1,
        semester: 1,
        course_id: 3, // Psyc1011
        is_core: true,
        is_elective: false,
        prerequisites: "",
      },
      {
        plan_id: 4,
        department_id: 1, // SE
        program_id: 1, // SE-REG
        year: 1,
        semester: 1,
        course_id: 4, // SpSc1011
        is_core: true,
        is_elective: false,
        prerequisites: "",
      },
      {
        plan_id: 5,
        department_id: 1, // SE
        program_id: 1, // SE-REG
        year: 1,
        semester: 1,
        course_id: 5, // GeES1011
        is_core: true,
        is_elective: false,
        prerequisites: "",
      },
      {
        plan_id: 6,
        department_id: 1, // SE
        program_id: 1, // SE-REG
        year: 1,
        semester: 1,
        course_id: 6, // FLEn1011
        is_core: true,
        is_elective: false,
        prerequisites: "",
      },
      {
        plan_id: 7,
        department_id: 1, // SE
        program_id: 1, // SE-REG
        year: 1,
        semester: 1,
        course_id: 7, // LoCT1011
        is_core: true,
        is_elective: false,
        prerequisites: "",
      },

      // Year 1, Semester 2
      {
        plan_id: 8,
        department_id: 1, // SE
        program_id: 1, // SE-REG
        year: 1,
        semester: 2,
        course_id: 8, // EmTe1012
        is_core: true,
        is_elective: false,
        prerequisites: "",
      },
      {
        plan_id: 9,
        department_id: 1, // SE
        program_id: 1, // SE-REG
        year: 1,
        semester: 2,
        course_id: 9, // Anth1012
        is_core: true,
        is_elective: false,
        prerequisites: "",
      },
      {
        plan_id: 10,
        department_id: 1, // SE
        program_id: 1, // SE-REG
        year: 1,
        semester: 2,
        course_id: 10, // Math1012
        is_core: true,
        is_elective: false,
        prerequisites: "Math1011",
      },
      {
        plan_id: 11,
        department_id: 1, // SE
        program_id: 1, // SE-REG
        year: 1,
        semester: 2,
        course_id: 11, // MCiE1012
        is_core: true,
        is_elective: false,
        prerequisites: "",
      },
      {
        plan_id: 12,
        department_id: 1, // SE
        program_id: 1, // SE-REG
        year: 1,
        semester: 2,
        course_id: 12, // FLEn1012
        is_core: true,
        is_elective: false,
        prerequisites: "FLEn1011",
      },
      {
        plan_id: 13,
        department_id: 1, // SE
        program_id: 1, // SE-REG
        year: 1,
        semester: 2,
        course_id: 13, // GlTr1012
        is_core: true,
        is_elective: false,
        prerequisites: "",
      },
      {
        plan_id: 14,
        department_id: 1, // SE
        program_id: 1, // SE-REG
        year: 1,
        semester: 2,
        course_id: 14, // CoSc1012
        is_core: true,
        is_elective: false,
        prerequisites: "",
      },

      // Year 2, Semester 1
      {
        plan_id: 15,
        department_id: 1, // SE
        program_id: 1, // SE-REG
        year: 2,
        semester: 1,
        course_id: 15, // SEng4021
        is_core: true,
        is_elective: false,
        prerequisites: "CoSc1012",
      },
      {
        plan_id: 16,
        department_id: 1, // SE
        program_id: 1, // SE-REG
        year: 2,
        semester: 1,
        course_id: 16, // SEng5021
        is_core: true,
        is_elective: false,
        prerequisites: "CoSc1012",
      },
      {
        plan_id: 17,
        department_id: 1, // SE
        program_id: 1, // SE-REG
        year: 2,
        semester: 1,
        course_id: 17, // SEng2021
        is_core: true,
        is_elective: false,
        prerequisites: "CoSc1012",
      },
      {
        plan_id: 18,
        department_id: 1, // SE
        program_id: 1, // SE-REG
        year: 2,
        semester: 1,
        course_id: 18, // Math2011
        is_core: true,
        is_elective: false,
        prerequisites: "Math1011, Math1012",
      },
      {
        plan_id: 19,
        department_id: 1, // SE
        program_id: 1, // SE-REG
        year: 2,
        semester: 1,
        course_id: 19, // Incl1012
        is_core: true,
        is_elective: false,
        prerequisites: "",
      },
      {
        plan_id: 20,
        department_id: 1, // SE
        program_id: 1, // SE-REG
        year: 2,
        semester: 1,
        course_id: 20, // Econ1011
        is_core: true,
        is_elective: false,
        prerequisites: "",
      },

      // Computer Science Curriculum
      {
        plan_id: 21,
        department_id: 2, // CS
        program_id: 6, // CS-REG
        year: 1,
        semester: 1,
        course_id: 27, // CSc101
        is_core: true,
        is_elective: false,
        prerequisites: "",
      },
      {
        plan_id: 22,
        department_id: 2, // CS
        program_id: 6, // CS-REG
        year: 2,
        semester: 1,
        course_id: 28, // CSc102
        is_core: true,
        is_elective: false,
        prerequisites: "CSc101",
      },
    ],

    course_assignments: [
      {
        assignment_id: 1,
        course_id: 15, // SEng4021
        semester_id: 1, // 2024-I
        staff_id: 2, // mr.alemayehu (staff_id: 2)
        student_year: 2,
        assigned_by: 5, // dr.getachew (user_id: 5)
        section_code: "A",
        status: "accepted",
        notes: "Regular teaching assignment for Database Systems",
      },
      {
        assignment_id: 2,
        course_id: 15, // SEng4021
        semester_id: 1, // 2024-I
        staff_id: 3, // ms.kidan (staff_id: 3)
        student_year: 2,
        assigned_by: 5, // dr.getachew (user_id: 5)
        section_code: "B",
        status: "accepted",
        notes: "Regular teaching assignment for Database Systems",
      },
      {
        assignment_id: 3,
        course_id: 16, // SEng5021
        semester_id: 1, // 2024-I
        staff_id: 1, // dr.getachew (staff_id: 1)
        student_year: 2,
        assigned_by: 5, // dr.getachew (user_id: 5)
        section_code: "A",
        status: "assigned",
        notes: "Department head teaching Software Engineering",
      },
      {
        assignment_id: 4,
        course_id: 27, // CSc101
        semester_id: 1, // 2024-I
        staff_id: 5, // dr.samuel (staff_id: 5)
        student_year: 1,
        assigned_by: 6, // dr.tilahun (user_id: 6)
        section_code: "A",
        status: "accepted",
        notes: "Introduction to Computer Science",
      },
      {
        assignment_id: 5,
        course_id: 29, // EEng101
        semester_id: 1, // 2024-I
        staff_id: 7, // mr.eyob (staff_id: 7)
        student_year: 1,
        assigned_by: 7, // dr.meron (user_id: 7)
        section_code: "A",
        status: "accepted",
        notes: "Circuit Analysis for first year",
      },
      {
        assignment_id: 6,
        course_id: 31, // Math111
        semester_id: 1, // 2024-I
        staff_id: 8, // dr.yohannes (staff_id: 8)
        student_year: 1,
        assigned_by: 8, // dr.yohannes (user_id: 8)
        section_code: "A",
        status: "accepted",
        notes: "Calculus I for engineering students",
      },
    ],

    course_requests: [
      {
        request_id: 1,
        course_id: 21, // SEng2122
        semester_id: 2, // 2024-II
        staff_id: 2, // mr.alemayehu (staff_id: 2)
        requested_by: 9, // mr.alemayehu (user_id: 9)
        section_code: "A",
        preferred_schedule: "Monday 8-10, Wednesday 10-12",
        reason: "Expertise in algorithms and data structures",
        status: "pending",
      },
      {
        request_id: 2,
        course_id: 25, // SEng6022
        semester_id: 2, // 2024-II
        staff_id: 3, // ms.kidan (staff_id: 3)
        requested_by: 10, // ms.kidan (user_id: 10)
        section_code: "A",
        preferred_schedule: "Tuesday 2-4, Thursday 2-4",
        reason: "Strong background in object-oriented programming",
        status: "pending",
      },
      {
        request_id: 3,
        course_id: 28, // CSc102
        semester_id: 2, // 2024-II
        staff_id: 5, // dr.samuel (staff_id: 5)
        requested_by: 11, // dr.samuel (user_id: 11)
        section_code: "A",
        preferred_schedule: "Monday 10-12, Wednesday 8-10",
        reason: "Teaching this course for the past 3 years",
        status: "approved",
        processed_by: 6, // dr.tilahun (user_id: 6)
        processed_date: "2024-01-15",
        processed_notes: "Approved based on expertise",
      },
    ],

    workload_rp: [
      {
        workload_id: 1,
        staff_id: 2, // mr.alemayehu (staff_id: 2)
        semester_id: 1, // 2024-I
        course_code: "SEng4021",
        course_credit_hours: 5,
        lecture_credit_hours: 3,
        tutorial_credit_hours: 0,
        lab_credit_hours: 2,
        student_department: "SE",
        academic_year: "2nd Year",
        number_of_sections: 1,
        each_section_course_load: 12.5,
        variety_of_course_load: 2.5,
        research_load: 5.0,
        community_service_load: 2.0,
        elip_load: 0,
        hdp_load: 0,
        course_chair_load: 3.0,
        section_advisor_load: 2.0,
        advising_load: 3.0,
        position_load: 0,
        total_load: 30.0,
        over_payment_birr: 0,
        status: "submitted",
      },
      {
        workload_id: 2,
        staff_id: 3, // ms.kidan (staff_id: 3)
        semester_id: 1, // 2024-I
        course_code: "SEng4021",
        course_credit_hours: 5,
        lecture_credit_hours: 3,
        tutorial_credit_hours: 0,
        lab_credit_hours: 2,
        student_department: "SE",
        academic_year: "2nd Year",
        number_of_sections: 1,
        each_section_course_load: 12.5,
        variety_of_course_load: 2.5,
        research_load: 8.0,
        community_service_load: 3.0,
        elip_load: 0,
        hdp_load: 0,
        course_chair_load: 0,
        section_advisor_load: 2.0,
        advising_load: 2.0,
        position_load: 0,
        total_load: 30.0,
        over_payment_birr: 0,
        status: "dh_approved",
      },
    ],

    workload_nrp: [
      {
        nrp_id: 1,
        staff_id: 2, // mr.alemayehu (staff_id: 2)
        semester_id: 3, // 2024-SU
        program_type: "summer",
        contract_number: "CON-2024-SU-001",
        academic_year: "2024-2025",
        academic_year_ec: "2016 EC",
        contract_type: "teaching",
        course_id: 14, // CoSc1012
        course_code: "CoSc1012",
        course_title: "Computer Programming",
        credit_hours: 5,
        lecture_credit_hours: 3,
        lab_credit_hours: 2,
        tutorial_credit_hours: 0,
        lecture_sections: 1,
        lab_sections: 2,
        tutorial_sessions: 0,
        teaching_hours: 45,
        module_hours: 15,
        student_count: 60,
        student_count_dept: 60,
        student_count_year: 1,
        student_count_section: 30,
        assignment_students: 60,
        exam_students: 60,
        project_advising: "Final project groups",
        project_groups: 5,
        rate_category: "A",
        rate_per_rank: 500.0,
        assignment_rate: 25.0,
        exam_rate: 20.0,
        tutorial_rate_per_hour: 100.0,
        teaching_payment: 22500.0,
        tutorial_payment: 0,
        assignment_payment: 1500.0,
        exam_payment: 1200.0,
        project_payment: 2500.0,
        total_payment: 27700.0,
        total_hours_worked: 60,
        contract_duration_from: "2025-07-01",
        contract_duration_to: "2025-08-15",
        is_overload: false,
        overload_hours: 0,
        overload_payment: 0,
        status: "draft",
      },
    ],

    payment_sheets: [
      {
        payment_id: 1,
        nrp_id: 1, // workload_nrp nrp_id: 1
        overload_id: null,
        payment_type: "summer",
        sheet_number: "PS-2024-SU-001",
        gross_amount: 27700.0,
        tax_amount: 2770.0,
        net_amount: 24930.0,
        payment_status: "pending",
        approved_by: null,
        approved_date: null,
        export_format: "pdf",
      },
    ],

    overload_payments: [
      {
        overload_id: 1,
        staff_id: 2, // mr.alemayehu (staff_id: 2)
        semester_id: 1, // 2024-I
        overload_hours: 10,
        rate_used: 450.0,
        gross_amount: 4500.0,
        tax_amount: 450.0,
        net_amount: 4050.0,
        payment_status: "pending",
        ruleset_version: "1.0",
      },
    ],

    tax_rules: [
      {
        tax_id: 1,
        program_type: "extension",
        tax_rate: 10.0,
        effective_from: "2024-09-01",
        description: "Extension program tax rate",
      },
      {
        tax_id: 2,
        program_type: "weekend",
        tax_rate: 10.0,
        effective_from: "2024-09-01",
        description: "Weekend program tax rate",
      },
      {
        tax_id: 3,
        program_type: "summer",
        tax_rate: 10.0,
        effective_from: "2024-09-01",
        description: "Summer program tax rate",
      },
      {
        tax_id: 4,
        program_type: "distance",
        tax_rate: 10.0,
        effective_from: "2024-09-01",
        description: "Distance program tax rate",
      },
      {
        tax_id: 5,
        program_type: "overload",
        tax_rate: 10.0,
        effective_from: "2024-09-01",
        description: "Overload payment tax rate",
      },
    ],

    rate_tables: [
      {
        rate_id: 1,
        program_type: "extension",
        rate_category: "A",
        amount_per_credit: 500.0,
        amount_per_hour: null,
        amount_per_student: null,
        effective_from: "2024-09-01",
      },
      {
        rate_id: 2,
        program_type: "extension",
        rate_category: "B",
        amount_per_credit: 450.0,
        amount_per_hour: null,
        amount_per_student: null,
        effective_from: "2024-09-01",
      },
      {
        rate_id: 3,
        program_type: "weekend",
        rate_category: "A",
        amount_per_credit: 500.0,
        amount_per_hour: null,
        amount_per_student: null,
        effective_from: "2024-09-01",
      },
      {
        rate_id: 4,
        program_type: "summer",
        rate_category: "default",
        amount_per_credit: null,
        amount_per_hour: 450.0,
        amount_per_student: null,
        effective_from: "2024-09-01",
      },
      {
        rate_id: 5,
        program_type: "distance",
        rate_category: "default",
        amount_per_credit: null,
        amount_per_hour: 520.0,
        amount_per_student: null,
        effective_from: "2024-09-01",
      },
    ],

    system_rules: [
      {
        rule_id: 1,
        rule_name: "lecture_factor",
        rule_value: "1.0",
        rule_type: "load_factor",
        program_type: "regular",
        effective_from: "2024-09-01",
        description: "Lecture hour conversion factor",
      },
      {
        rule_id: 2,
        rule_name: "lab_factor",
        rule_value: "0.75",
        rule_type: "load_factor",
        program_type: "regular",
        effective_from: "2024-09-01",
        description: "Laboratory hour conversion factor",
      },
      {
        rule_id: 3,
        rule_name: "tutorial_factor",
        rule_value: "0.5",
        rule_type: "load_factor",
        program_type: "regular",
        effective_from: "2024-09-01",
        description: "Tutorial hour conversion factor",
      },
      {
        rule_id: 4,
        rule_name: "rank_min_lecturer",
        rule_value: "8",
        rule_type: "rank_limit",
        program_type: "regular",
        effective_from: "2024-09-01",
        description: "Minimum load for Lecturer",
      },
      {
        rule_id: 5,
        rule_name: "rank_max_lecturer",
        rule_value: "12",
        rule_type: "rank_limit",
        program_type: "regular",
        effective_from: "2024-09-01",
        description: "Maximum load for Lecturer",
      },
      {
        rule_id: 6,
        rule_name: "overload_rate",
        rule_value: "450",
        rule_type: "payment",
        program_type: "overload",
        effective_from: "2024-09-01",
        description: "Overload payment rate per hour",
      },
    ],

    ruleset_history: [
      {
        history_id: 1,
        rule_name: "overload_rate",
        previous_value: "400",
        new_value: "450",
        changed_by: 1, // admin (user_id: 1)
        change_reason: "Updated based on new salary scale",
        effective_from: "2024-09-01",
        effective_to: null,
        program_type: "overload",
        version_number: "2.0",
      },
    ],

    summer_distribution: [
      {
        dist_id: 1,
        stage1_percent: 30.0,
        stage2_percent: 30.0,
        stage3_percent: 20.0,
        stage4_percent: 20.0,
        effective_from: "2024-09-01",
      },
    ],

    approval_workflow: [
      {
        approval_id: 1,
        entity_type: "workload_rp",
        entity_id: 1, // workload_rp workload_id: 1
        approver_role: "department_head",
        approver_id: 5, // dr.getachew (user_id: 5)
        status: "approved",
        comments: "Workload looks appropriate",
      },
      {
        approval_id: 2,
        entity_type: "workload_rp",
        entity_id: 2, // workload_rp workload_id: 2
        approver_role: "department_head",
        approver_id: 5, // dr.getachew (user_id: 5)
        status: "approved",
        comments: "Approved for semester",
      },
      {
        approval_id: 3,
        entity_type: "workload_nrp",
        entity_id: 1, // workload_nrp nrp_id: 1
        approver_role: "department_head",
        approver_id: null,
        status: "pending",
        comments: "Awaiting review",
      },
    ],

    audit_log: [
      {
        audit_id: 1,
        user_id: 1, // admin
        action: "CREATE",
        entity: "user",
        entity_id: 1,
        old_value: null,
        new_value: '{"username": "admin", "role": "admin"}',
        ip_address: "127.0.0.1",
      },
      {
        audit_id: 2,
        user_id: 1, // admin
        action: "CREATE",
        entity: "college",
        entity_id: 1,
        old_value: null,
        new_value:
          '{"college_code": "COET", "college_name": "College of Engineering and Technology"}',
        ip_address: "127.0.0.1",
      },
    ],

    workload_detail_rp: [
      {
        detail_id: 1,
        workload_id: 1, // workload_rp workload_id: 1
        detail_type: "research",
        description: "Published paper on Database Optimization Techniques",
        hours: 5.0,
      },
      {
        detail_id: 2,
        workload_id: 1, // workload_rp workload_id: 1
        detail_type: "community",
        description: "Community service at local high school",
        hours: 2.0,
      },
      {
        detail_id: 3,
        workload_id: 2, // workload_rp workload_id: 2
        detail_type: "research",
        description: "Ongoing research on Machine Learning Applications",
        hours: 8.0,
      },
    ],

    nrp_contract_templates: [
      {
        template_id: 1,
        template_name: "Summer Teaching Contract",
        template_type: "teaching",
        program_type: "summer",
        header_content:
          "SUMMER TEACHING CONTRACT\nInjibara University\nCollege of Engineering and Technology",
        stipulation_content:
          "This contract is made between Injibara University and the instructor...",
        table_structure: '{"columns": ["Course", "Hours", "Rate", "Total"]}',
        signature_fields: '["Instructor", "Department Head", "Dean"]',
        created_by: 1, // admin
      },
    ],

    nrp_reports: [
      {
        report_id: 1,
        report_type: "payment_summary",
        semester_id: 3, // 2024-SU
        department_id: 1, // SE
        college_id: 1, // COET
        report_period: "July 2025",
        generated_by: 14, // finance (user_id: 14)
        report_data:
          '{"total_payments": 27700, "total_instructors": 1, "average_payment": 27700}',
      },
    ],
  };
};
