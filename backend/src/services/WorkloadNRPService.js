
// src/services/WorkloadNRPService.js
import { query } from "../config/database.js";

class WorkloadNRPService {
  // Calculate payment for NRP workload
  static async calculatePayment(workloadData) {
    const {
      program_type,
      credit_hours = 0,
      lecture_credit_hours = 0,
      lab_credit_hours = 0,
      tutorial_credit_hours = 0,
      teaching_hours = 0,
      module_hours = 0,
      // tutorial_sessions = 0,
      assignment_students = 0,
      exam_students = 0,
      project_groups = 0,
      student_count = 0,
      rate_category = "default",
      academic_rank,
      is_overload = false,
      overload_hours = 0,
    } = workloadData;

    let totalPayment = 0;
    let teachingPayment = 0;
    let tutorialPayment = 0;
    let assignmentPayment = 0;
    let examPayment = 0;
    let projectPayment = 0;
    let overloadPayment = 0;

    // Get rates from database
    const [rate] = await query(
      `SELECT * FROM rate_tables 
       WHERE program_type = ? 
         AND (rate_category = ? OR rate_category = 'default')
         AND (effective_to IS NULL OR effective_to >= CURDATE())
       ORDER BY rate_category DESC
       LIMIT 1`,
      [program_type, rate_category]
    );

    // Get tax rate
    const [taxRule] = await query(
      `SELECT tax_rate FROM tax_rules 
       WHERE program_type = ? 
         AND (effective_to IS NULL OR effective_to >= CURDATE())
       ORDER BY effective_from DESC
       LIMIT 1`,
      [program_type]
    );

    const taxRate = taxRule?.tax_rate || 10.0; // Default 10%

    switch (program_type) {
      case "extension":
      case "weekend":
        // Payment based on credit hours
        const ratePerCredit = rate?.amount_per_credit || 500;
        const totalCredits = credit_hours || lecture_credit_hours + lab_credit_hours + tutorial_credit_hours;
        teachingPayment = totalCredits * ratePerCredit;
        
        // Additional payments for assignments and exams
        assignmentPayment = assignment_students * (rate?.assignment_rate || 25);
        examPayment = exam_students * (rate?.exam_rate || 20);
        
        totalPayment = teachingPayment + assignmentPayment + examPayment;
        break;

      case "summer":
        // Payment based on teaching hours
        const ratePerHour = rate?.amount_per_hour || 450;
        teachingPayment = teaching_hours * ratePerHour;
        
        // Tutorial payments
        tutorialPayment = 0;
        // Assignment and exam corrections
        assignmentPayment = assignment_students * (rate?.assignment_rate || 25);
        examPayment = exam_students * (rate?.exam_rate || 20);
        
        totalPayment = teachingPayment + tutorialPayment + assignmentPayment + examPayment;
        break;

      case "distance":
        // Payment based on module hours
        const moduleRatePerHour = rate?.amount_per_hour || 520;
        teachingPayment = module_hours * moduleRatePerHour;
        
        // Student-based payment
        const studentRate = rate?.amount_per_student || 10;
        assignmentPayment = student_count * studentRate;
        
        totalPayment = teachingPayment + assignmentPayment;
        break;

      default:
        throw new Error(`Unsupported program type: ${program_type}`);
    }

    // Calculate overload payment if applicable
    if (is_overload && overload_hours > 0) {
      const [overloadRate] = await query(
        `SELECT rule_value FROM system_rules 
         WHERE rule_name = 'overload_rate' 
           AND (effective_to IS NULL OR effective_to >= CURDATE())
         ORDER BY effective_from DESC
         LIMIT 1`
      );
      const overloadRatePerHour = parseFloat(overloadRate?.rule_value) || 450;
      overloadPayment = overload_hours * overloadRatePerHour;
      totalPayment += overloadPayment;
    }


    return {
      teaching_payment: teachingPayment,
      tutorial_payment: tutorialPayment,
      assignment_payment: assignmentPayment,
      exam_payment: examPayment,
      project_payment: projectPayment,
      overload_payment: overloadPayment,
      total_payment: totalPayment
    
    };
  }

  // Validate NRP workload
  static async validateWorkload(workloadData) {
    const errors = [];
    const warnings = [];

    // Required fields validation
    if (!workloadData.staff_id) {
      errors.push("Staff ID is required");
    }

    if (!workloadData.semester_id) {
      errors.push("Semester ID is required");
    }

    if (!workloadData.program_type) {
      errors.push("Program type is required");
    }

    if (!workloadData.course_code && !workloadData.course_title) {
      warnings.push("Course code or title is recommended");
    }

    // Hours validation
    if (workloadData.credit_hours < 0) {
      errors.push("Credit hours cannot be negative");
    }

    if (workloadData.teaching_hours < 0) {
      errors.push("Teaching hours cannot be negative");
    }

    if (workloadData.student_count < 0) {
      errors.push("Student count cannot be negative");
    }

    // Check if staff exists
    const [staff] = await query(
      "SELECT staff_id FROM staff_profiles WHERE staff_id = ?",
      [workloadData.staff_id]
    );
    if (!staff) {
      errors.push("Staff member not found");
    }

    // Check if semester exists
    const [semester] = await query(
      "SELECT semester_id FROM semesters WHERE semester_id = ?",
      [workloadData.semester_id]
    );
    if (!semester) {
      errors.push("Semester not found");
    }

    // Check for duplicate workload (same staff, semester, program, course)
    if (workloadData.course_code) {
      const [existing] = await query(
        `SELECT nrp_id FROM workload_nrp 
         WHERE staff_id = ? 
           AND semester_id = ? 
           AND program_type = ? 
           AND course_code = ? 
           AND status NOT IN ('rejected', 'draft')`,
        [
          workloadData.staff_id,
          workloadData.semester_id,
          workloadData.program_type,
          workloadData.course_code,
        ]
      );
      if (existing) {
        warnings.push("Similar workload already exists for this course");
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // Generate contract number
  static async generateContractNumber(programType, semesterId) {
    const [semester] = await query(
      "SELECT semester_code FROM semesters WHERE semester_id = ?",
      [semesterId]
    );
    
    const prefixMap = {
      extension: "EXT",
      weekend: "WKD",
      summer: "SUM",
      distance: "DST",
    };
    
    const prefix = prefixMap[programType] || "NRP";
    const semesterCode = semester?.semester_code || "UNKN";
    const timestamp = Date.now().toString().slice(-6);
    
    return `${prefix}-${semesterCode}-${timestamp}`;
  }

  // Get NRP dashboard statistics
  static async getDashboardStats(userRole, userId = null, filters = {}) {
    let whereClause = "WHERE 1=1";
    const params = [];

    // Role-based filtering
    if (userRole === "department_head") {
      const [staff] = await query(
        "SELECT department_id FROM staff_profiles WHERE user_id = ?",
        [userId]
      );
      if (staff?.department_id) {
        whereClause += ` AND sp.department_id = ?`;
        params.push(staff.department_id);
      }
    } else if (userRole === "dean") {
      const [college] = await query(
        `SELECT c.college_id FROM colleges c
         JOIN departments d ON c.college_id = d.college_id
         JOIN staff_profiles sp ON d.department_id = sp.department_id
         WHERE sp.user_id = ?`,
        [userId]
      );
      if (college?.college_id) {
        whereClause += ` AND c.college_id = ?`;
        params.push(college.college_id);
      }
    }

    // Additional filters
    if (filters.semester_id) {
      whereClause += " AND wn.semester_id = ?";
      params.push(filters.semester_id);
    }

    if (filters.program_type) {
      whereClause += " AND wn.program_type = ?";
      params.push(filters.program_type);
    }

    if (filters.status) {
      whereClause += " AND wn.status = ?";
      params.push(filters.status);
    }

    if (filters.date_from) {
      whereClause += " AND wn.created_at >= ?";
      params.push(filters.date_from);
    }

    if (filters.date_to) {
      whereClause += " AND wn.created_at <= ?";
      params.push(filters.date_to);
    }

    const stats = await query(
      `SELECT 
        -- Counts
        COUNT(*) as total_workloads,
        COUNT(CASE WHEN wn.status = 'draft' THEN 1 END) as draft_count,
        COUNT(CASE WHEN wn.status = 'submitted' THEN 1 END) as submitted_count,
        COUNT(CASE WHEN wn.status = 'finance_approved' THEN 1 END) as approved_count,
        COUNT(CASE WHEN wn.status = 'paid' THEN 1 END) as paid_count,
        
        -- Financials
        COALESCE(SUM(wn.total_payment), 0) as total_payments,
        COALESCE(AVG(wn.total_payment), 0) as average_payment,
        
        -- Program breakdown
        COUNT(CASE WHEN wn.program_type = 'extension' THEN 1 END) as extension_count,
        COUNT(CASE WHEN wn.program_type = 'weekend' THEN 1 END) as weekend_count,
        COUNT(CASE WHEN wn.program_type = 'summer' THEN 1 END) as summer_count,
        COUNT(CASE WHEN wn.program_type = 'distance' THEN 1 END) as distance_count,
        
        -- Staff statistics
        COUNT(DISTINCT wn.staff_id) as unique_staff,
        COUNT(DISTINCT sp.department_id) as departments_involved
       
       FROM workload_nrp wn
       LEFT JOIN staff_profiles sp ON wn.staff_id = sp.staff_id
       LEFT JOIN departments d ON sp.department_id = d.department_id
       LEFT JOIN colleges c ON d.college_id = c.college_id
       ${whereClause}`,
      params
    );

    return stats[0] || {};
  }

  // Calculate total hours worked
  static calculateTotalHours(workloadData) {
    const {
      teaching_hours = 0,
      module_hours = 0,
      // tutorial_sessions = 0,
      overload_hours = 0,
    } = workloadData;

    // Assuming each tutorial session is 2 hours
    const tutorialHours = 0;
    
    return teaching_hours + module_hours + tutorialHours + overload_hours;
  }

  // Get rate based on academic rank
  static async getRankRate(academicRank, programType) {
    const rankRateMap = {
      professor: { A: 600, B: 550, C: 500 },
      associate_professor: { A: 550, B: 500, C: 450 },
      assistant_professor: { A: 500, B: 450, C: 400 },
      lecturer: { A: 450, B: 400, C: 350 },
      assistant_lecturer: { A: 400, B: 350, C: 300 },
      graduate_assistant: { A: 350, B: 300, C: 250 },
    };

    // Get default rates from database
    const [defaultRate] = await query(
      `SELECT amount_per_credit, amount_per_hour 
       FROM rate_tables 
       WHERE program_type = ? AND rate_category = 'default'
         AND (effective_to IS NULL OR effective_to >= CURDATE())
       ORDER BY effective_from DESC
       LIMIT 1`,
      [programType]
    );

    const rankRates = rankRateMap[academicRank] || { A: 450, B: 400, C: 350 };
    
    return {
      rank_rates: rankRates,
      default_rate: defaultRate,
    };
  }
}

export default WorkloadNRPService;