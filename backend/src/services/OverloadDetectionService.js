import { query } from "../config/database.js";

class OverloadDetectionService {
  // Detect overload for a specific staff member
  static async detectStaffOverload(staffId, semesterId) {
    try {
      // Get staff information
      const [staff] = await query(
        `SELECT sp.*, d.department_name, c.college_name
         FROM staff_profiles sp
         LEFT JOIN departments d ON sp.department_id = d.department_id
         LEFT JOIN colleges c ON d.college_id = c.college_id
         WHERE sp.staff_id = ?`,
        [staffId]
      );

      if (!staff) {
        throw new Error("Staff not found");
      }

      // Get rank limits
      const rankLimits = await this.getRankLimits(staff.academic_rank);

      // Calculate total workload
      const workloadSummary = await this.calculateTotalWorkload(
        staffId,
        semesterId
      );

      // Check for overload
      const isOverloaded = workloadSummary.total_hours > rankLimits.max;
      const overloadHours = Math.max(
        0,
        workloadSummary.total_hours - rankLimits.max
      );

      // Calculate overload payment if applicable
      let overloadPayment = 0;
      if (isOverloaded) {
        const overloadRate = await this.getOverloadRate();
        overloadPayment = overloadHours * overloadRate;
      }

      // Get detailed breakdown
      const breakdown = await this.getWorkloadBreakdown(staffId, semesterId);

      return {
        staff_id: staffId,
        staff_name: `${staff.first_name} ${staff.last_name}`,
        employee_id: staff.employee_id,
        academic_rank: staff.academic_rank,
        department: staff.department_name,
        college: staff.college_name,
        semester_id: semesterId,

        // Limits
        rank_limits: rankLimits,

        // Current workload
        current_workload: {
          total_hours: workloadSummary.total_hours,
          rp_hours: workloadSummary.rp_hours,
          assignments_hours: workloadSummary.assignments_hours,
          nrp_hours: workloadSummary.nrp_hours,
          overload_hours: overloadHours,
        },

        // Status
        is_overloaded: isOverloaded,
        load_percentage: (workloadSummary.total_hours / rankLimits.max) * 100,
        status: this.getLoadStatus(workloadSummary.total_hours, rankLimits),

        // Overload details
        overload_details: {
          overload_hours: overloadHours,
          overload_rate: isOverloaded ? await this.getOverloadRate() : 0,
          estimated_payment: overloadPayment,
          requires_approval: overloadHours > 5, // Threshold for requiring special approval
        },

        // Detailed breakdown
        breakdown: breakdown,

        // Recommendations
        recommendations: this.generateRecommendations(
          workloadSummary.total_hours,
          rankLimits,
          breakdown
        ),

        // Timestamp
        checked_at: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Detect staff overload error:", error);
      throw error;
    }
  }

  // Detect department-wide overload
  static async detectDepartmentOverload(departmentId, semesterId) {
    try {
      // Get all staff in department
      const staffList = await query(
        `SELECT sp.staff_id, sp.first_name, sp.last_name, sp.employee_id, sp.academic_rank
         FROM staff_profiles sp
         WHERE sp.department_id = ?`,
        [departmentId]
      );

      const overloadReport = {
        department_id: departmentId,
        semester_id: semesterId,
        total_staff: staffList.length,
        overloaded_staff: 0,
        moderate_load_staff: 0,
        normal_load_staff: 0,
        underloaded_staff: 0,
        staff_details: [],
        summary: {
          total_overload_hours: 0,
          estimated_overload_payment: 0,
          average_load_percentage: 0,
        },
        generated_at: new Date().toISOString(),
      };

      let totalLoadPercentage = 0;
      const overloadRate = await this.getOverloadRate();

      // Check each staff member
      for (const staff of staffList) {
        const staffOverload = await this.detectStaffOverload(
          staff.staff_id,
          semesterId
        );

        overloadReport.staff_details.push({
          staff_id: staff.staff_id,
          name: `${staff.first_name} ${staff.last_name}`,
          employee_id: staff.employee_id,
          academic_rank: staff.academic_rank,
          total_hours: staffOverload.current_workload.total_hours,
          max_hours: staffOverload.rank_limits.max,
          load_percentage: staffOverload.load_percentage,
          status: staffOverload.status,
          is_overloaded: staffOverload.is_overloaded,
          overload_hours: staffOverload.overload_details.overload_hours,
          estimated_payment: staffOverload.overload_details.estimated_payment,
        });

        // Update counters
        totalLoadPercentage += staffOverload.load_percentage;

        if (staffOverload.is_overloaded) {
          overloadReport.overloaded_staff++;
          overloadReport.summary.total_overload_hours +=
            staffOverload.overload_details.overload_hours;
          overloadReport.summary.estimated_overload_payment +=
            staffOverload.overload_details.estimated_payment;
        } else if (staffOverload.load_percentage >= 80) {
          overloadReport.moderate_load_staff++;
        } else if (staffOverload.load_percentage >= 50) {
          overloadReport.normal_load_staff++;
        } else {
          overloadReport.underloaded_staff++;
        }
      }

      // Calculate averages
      overloadReport.summary.average_load_percentage =
        staffList.length > 0 ? totalLoadPercentage / staffList.length : 0;

      // Generate department recommendations
      overloadReport.recommendations =
        this.generateDepartmentRecommendations(overloadReport);

      return overloadReport;
    } catch (error) {
      console.error("Detect department overload error:", error);
      throw error;
    }
  }

  // Calculate total workload for staff
  static async calculateTotalWorkload(staffId, semesterId) {
    try {
      let totalHours = 0;
      let rpHours = 0;
      let assignmentsHours = 0;
      let nrpHours = 0;

      // 1. Regular Program (RP) workload
      const [rpWorkload] = await query(
        `SELECT COALESCE(SUM(total_load), 0) as total
         FROM workload_rp 
         WHERE staff_id = ? AND semester_id = ? AND status NOT IN ('rejected', 'draft')`,
        [staffId, semesterId]
      );
      rpHours = parseFloat(rpWorkload.total || 0);
      totalHours += rpHours;

      // 2. Course assignments (accepted)
      const assignments = await query(
        `SELECT ca.*, c.credit_hours
         FROM course_assignments ca
         LEFT JOIN courses c ON ca.course_id = c.course_id
         WHERE ca.staff_id = ? AND ca.semester_id = ? AND ca.status = 'accepted'`,
        [staffId, semesterId]
      );

      for (const assignment of assignments) {
        const assignmentHours = assignment.credit_hours * 1.5; // Load factor
        assignmentsHours += assignmentHours;
        totalHours += assignmentHours;
      }

      // 3. Non-Regular Program (NRP) workload (convert payment to hours)
      const [nrpWorkload] = await query(
        `SELECT COALESCE(SUM(total_hours_worked), 0) as total_hours
         FROM workload_nrp 
         WHERE staff_id = ? AND semester_id = ? AND status NOT IN ('rejected', 'draft')`,
        [staffId, semesterId]
      );
      nrpHours = parseFloat(nrpWorkload.total_hours || 0);
      totalHours += nrpHours;

      // 4. Administrative duties (from workload_rp)
      const [adminDuties] = await query(
        `SELECT 
          COALESCE(SUM(elip_load), 0) as elip,
          COALESCE(SUM(hdp_load), 0) as hdp,
          COALESCE(SUM(course_chair_load), 0) as course_chair,
          COALESCE(SUM(section_advisor_load), 0) as section_advisor,
          COALESCE(SUM(advising_load), 0) as advising,
          COALESCE(SUM(position_load), 0) as position
         FROM workload_rp 
         WHERE staff_id = ? AND semester_id = ?`,
        [staffId, semesterId]
      );

      const adminHours =
        parseFloat(adminDuties.elip || 0) +
        parseFloat(adminDuties.hdp || 0) +
        parseFloat(adminDuties.course_chair || 0) +
        parseFloat(adminDuties.section_advisor || 0) +
        parseFloat(adminDuties.advising || 0) +
        parseFloat(adminDuties.position || 0);

      totalHours += adminHours;

      return {
        total_hours: parseFloat(totalHours.toFixed(2)),
        rp_hours: parseFloat(rpHours.toFixed(2)),
        assignments_hours: parseFloat(assignmentsHours.toFixed(2)),
        nrp_hours: parseFloat(nrpHours.toFixed(2)),
        admin_hours: parseFloat(adminHours.toFixed(2)),
        assignment_count: assignments.length,
      };
    } catch (error) {
      console.error("Calculate total workload error:", error);
      return {
        total_hours: 0,
        rp_hours: 0,
        assignments_hours: 0,
        nrp_hours: 0,
        admin_hours: 0,
        assignment_count: 0,
      };
    }
  }

  // Get detailed workload breakdown
  static async getWorkloadBreakdown(staffId, semesterId) {
    try {
      const breakdown = {
        regular_program: [],
        course_assignments: [],
        non_regular_program: [],
        administrative_duties: [],
      };

      // Regular Program courses
      const rpCourses = await query(
        `SELECT course_code, total_load, status
         FROM workload_rp 
         WHERE staff_id = ? AND semester_id = ? AND status NOT IN ('rejected', 'draft')
         ORDER BY total_load DESC`,
        [staffId, semesterId]
      );
      breakdown.regular_program = rpCourses;

      // Course assignments
      const assignments = await query(
        `SELECT ca.*, c.course_code, c.course_title, c.credit_hours
         FROM course_assignments ca
         LEFT JOIN courses c ON ca.course_id = c.course_id
         WHERE ca.staff_id = ? AND ca.semester_id = ? AND ca.status = 'accepted'
         ORDER BY c.course_code`,
        [staffId, semesterId]
      );
      breakdown.course_assignments = assignments.map((a) => ({
        ...a,
        estimated_load: a.credit_hours * 1.5,
      }));

      // Non-Regular Program
      const nrpCourses = await query(
        `SELECT program_type, course_code, total_hours_worked, total_payment, status
         FROM workload_nrp 
         WHERE staff_id = ? AND semester_id = ? AND status NOT IN ('rejected', 'draft')
         ORDER BY total_hours_worked DESC`,
        [staffId, semesterId]
      );
      breakdown.non_regular_program = nrpCourses;

      // Administrative duties
      const [adminDetails] = await query(
        `SELECT 
          COALESCE(SUM(elip_load), 0) as elip,
          COALESCE(SUM(hdp_load), 0) as hdp,
          COALESCE(SUM(course_chair_load), 0) as course_chair,
          COALESCE(SUM(section_advisor_load), 0) as section_advisor,
          COALESCE(SUM(advising_load), 0) as advising,
          COALESCE(SUM(position_load), 0) as position
         FROM workload_rp 
         WHERE staff_id = ? AND semester_id = ?`,
        [staffId, semesterId]
      );

      breakdown.administrative_duties = [
        { type: "ELIP", hours: parseFloat(adminDetails.elip || 0) },
        { type: "HDP", hours: parseFloat(adminDetails.hdp || 0) },
        {
          type: "Course Chair",
          hours: parseFloat(adminDetails.course_chair || 0),
        },
        {
          type: "Section Advisor",
          hours: parseFloat(adminDetails.section_advisor || 0),
        },
        { type: "Advising", hours: parseFloat(adminDetails.advising || 0) },
        { type: "Position", hours: parseFloat(adminDetails.position || 0) },
      ].filter((d) => d.hours > 0);

      return breakdown;
    } catch (error) {
      console.error("Get workload breakdown error:", error);
      return {
        regular_program: [],
        course_assignments: [],
        non_regular_program: [],
        administrative_duties: [],
      };
    }
  }

  // Get rank limits
  static async getRankLimits(academicRank) {
    try {
      const [minRule] = await query(
        `SELECT rule_value FROM system_rules 
         WHERE rule_name = CONCAT('rank_min_', ?) 
           AND (effective_to IS NULL OR effective_to >= CURDATE())`,
        [academicRank]
      );

      const [maxRule] = await query(
        `SELECT rule_value FROM system_rules 
         WHERE rule_name = CONCAT('rank_max_', ?) 
           AND (effective_to IS NULL OR effective_to >= CURDATE())`,
        [academicRank]
      );

      return {
        min: minRule ? parseFloat(minRule.rule_value) : 0,
        max: maxRule ? parseFloat(maxRule.rule_value) : 0,
      };
    } catch (error) {
      console.error("Get rank limits error:", error);
      // Default limits
      const defaultLimits = {
        graduate_assistant: { min: 12, max: 16 },
        assistant_lecturer: { min: 10, max: 14 },
        lecturer: { min: 8, max: 12 },
        assistant_professor: { min: 6, max: 10 },
        associate_professor: { min: 4, max: 8 },
        professor: { min: 4, max: 6 },
      };
      return defaultLimits[academicRank] || { min: 8, max: 12 };
    }
  }

  // Get overload rate
  static async getOverloadRate() {
    try {
      const [rateRule] = await query(
        `SELECT rule_value FROM system_rules 
         WHERE rule_name = 'overload_rate' 
           AND (effective_to IS NULL OR effective_to >= CURDATE())
         ORDER BY effective_from DESC LIMIT 1`
      );
      return rateRule ? parseFloat(rateRule.rule_value) : 450;
    } catch (error) {
      console.error("Get overload rate error:", error);
      return 450; // Default rate
    }
  }

  // Get load status
  static getLoadStatus(totalHours, limits) {
    const percentage = (totalHours / limits.max) * 100;

    if (totalHours <= 0) return "No Load";
    if (percentage < 50) return "Underloaded";
    if (percentage < 80) return "Normal";
    if (percentage < 100) return "High Load";
    if (percentage < 120) return "Moderate Overload";
    if (percentage < 150) return "High Overload";
    return "Critical Overload";
  }

  // Generate recommendations
  static generateRecommendations(totalHours, limits, breakdown) {
    const recommendations = [];
    const percentage = (totalHours / limits.max) * 100;

    if (percentage < 50) {
      recommendations.push(
        "Consider requesting additional courses to meet minimum requirements"
      );
      recommendations.push(
        "Check with department head for available teaching opportunities"
      );
    } else if (percentage >= 100) {
      recommendations.push("Reduce teaching load to stay within rank limits");
      recommendations.push("Consider delegating administrative duties");
      recommendations.push(
        "Request overload payment approval if continuing with current load"
      );

      // Specific recommendations based on breakdown
      if (breakdown.administrative_duties.length > 3) {
        recommendations.push(
          "Consider reducing administrative duties (currently have " +
            breakdown.administrative_duties.length +
            " types)"
        );
      }

      const highLoadCourses = breakdown.regular_program.filter(
        (c) => c.total_load > 3
      );
      if (highLoadCourses.length > 0) {
        recommendations.push(
          "High-load courses detected. Consider splitting or reducing credit hours"
        );
      }
    } else if (percentage >= 80) {
      recommendations.push(
        "Monitor workload carefully - approaching overload threshold"
      );
      recommendations.push("Consider workload distribution for next semester");
    }

    // Check for imbalanced distribution
    if (breakdown.regular_program.length > 4) {
      recommendations.push(
        "Teaching many different courses may increase preparation time"
      );
    }

    return recommendations;
  }

  // Generate department recommendations
  static generateDepartmentRecommendations(report) {
    const recommendations = [];

    if (report.overloaded_staff > 0) {
      recommendations.push(
        `${report.overloaded_staff} staff members are overloaded. Review their assignments.`
      );

      if (report.overloaded_staff > report.staff_details.length * 0.3) {
        recommendations.push(
          "High percentage of overloaded staff. Consider hiring additional instructors or adjusting course offerings."
        );
      }
    }

    if (report.underloaded_staff > 0) {
      recommendations.push(
        `${report.underloaded_staff} staff members are underloaded. Consider redistributing courses.`
      );
    }

    if (report.summary.average_load_percentage > 90) {
      recommendations.push(
        "Department average load is high. Monitor overall department capacity."
      );
    }

    if (report.summary.estimated_overload_payment > 10000) {
      recommendations.push(
        `Significant overload payments estimated (${report.summary.estimated_overload_payment.toFixed(
          2
        )} Birr). Consider budget implications.`
      );
    }

    // Identify staff with extreme loads
    const extremeLoads = report.staff_details.filter(
      (s) => s.load_percentage > 150
    );
    if (extremeLoads.length > 0) {
      recommendations.push(
        `${extremeLoads.length} staff members have critical overload. Immediate review required.`
      );
    }

    return recommendations;
  }

  // Predict future overload based on trends
  static async predictOverloadTrend(staffId, upcomingSemesterId) {
    try {
      // Get current semester workload
      const [currentSemester] = await query(
        "SELECT semester_id FROM semesters WHERE is_active = TRUE LIMIT 1"
      );

      if (!currentSemester) {
        throw new Error("No active semester found");
      }

      const currentWorkload = await this.calculateTotalWorkload(
        staffId,
        currentSemester.semester_id
      );
      const staff = await query(
        "SELECT academic_rank FROM staff_profiles WHERE staff_id = ?",
        [staffId]
      );

      if (!staff[0]) {
        throw new Error("Staff not found");
      }

      const rankLimits = await this.getRankLimits(staff[0].academic_rank);

      // Get historical trend (last 3 semesters)
      const historicalSemesters = await query(
        `SELECT s.semester_id, s.semester_code, s.semester_name
         FROM semesters s
         WHERE s.semester_id != ? AND s.end_date < CURDATE()
         ORDER BY s.end_date DESC
         LIMIT 3`,
        [currentSemester.semester_id]
      );

      const historicalWorkloads = [];
      for (const semester of historicalSemesters) {
        const workload = await this.calculateTotalWorkload(
          staffId,
          semester.semester_id
        );
        historicalWorkloads.push({
          semester: semester.semester_code,
          total_hours: workload.total_hours,
        });
      }

      // Calculate trend
      let trend = "stable";
      if (historicalWorkloads.length >= 2) {
        const recentChange =
          historicalWorkloads[0].total_hours -
          (historicalWorkloads[1]?.total_hours ||
            historicalWorkloads[0].total_hours);

        if (recentChange > 2) trend = "increasing";
        else if (recentChange < -2) trend = "decreasing";
      }

      // Predict based on trend
      let predictedHours = currentWorkload.total_hours;
      if (trend === "increasing") {
        predictedHours *= 1.1; // 10% increase
      } else if (trend === "decreasing") {
        predictedHours *= 0.9; // 10% decrease
      }

      const predictedOverload = predictedHours > rankLimits.max;
      const predictedOverloadHours = Math.max(
        0,
        predictedHours - rankLimits.max
      );

      return {
        staff_id: staffId,
        current_semester: currentSemester.semester_id,
        upcoming_semester: upcomingSemesterId,
        current_workload: currentWorkload.total_hours,
        predicted_workload: parseFloat(predictedHours.toFixed(2)),
        rank_limit: rankLimits.max,
        trend: trend,
        predicted_overload: predictedOverload,
        predicted_overload_hours: parseFloat(predictedOverloadHours.toFixed(2)),
        confidence: historicalWorkloads.length > 1 ? "medium" : "low",
        historical_data: historicalWorkloads,
        recommendation: predictedOverload
          ? "Consider reducing workload for upcoming semester"
          : "Current trend suggests manageable workload",
      };
    } catch (error) {
      console.error("Predict overload trend error:", error);
      throw error;
    }
  }

  // Generate overload report for approval
  static async generateOverloadReport(staffId, semesterId) {
    const overloadData = await this.detectStaffOverload(staffId, semesterId);

    if (!overloadData.is_overloaded) {
      return {
        requires_report: false,
        message: "No overload detected",
      };
    }

    const report = {
      report_type: "overload_detection",
      staff_id: staffId,
      semester_id: semesterId,
      generated_date: new Date().toISOString(),
      data: overloadData,

      // Approval workflow
      approval_required: overloadData.overload_details.requires_approval,
      approval_steps: [
        { role: "department_head", status: "pending", required: true },
        {
          role: "dean",
          status: "pending",
          required: overloadData.overload_details.overload_hours > 10,
        },
        { role: "hr_director", status: "pending", required: true },
        { role: "finance", status: "pending", required: true },
      ],

      // Financial details
      financial_summary: {
        overload_hours: overloadData.overload_details.overload_hours,
        rate_per_hour: overloadData.overload_details.overload_rate,
        gross_amount: overloadData.overload_details.estimated_payment,
        tax_rate: 10, // Default tax rate
        tax_amount: overloadData.overload_details.estimated_payment * 0.1,
        net_amount: overloadData.overload_details.estimated_payment * 0.9,
      },

      // Justification required
      justification_required: true,
      justification_fields: [
        "reason_for_overload",
        "alternative_options_considered",
        "duration_of_overload",
        "impact_on_other_duties",
      ],
    };

    return report;
  }
}

export default OverloadDetectionService;
