
// export default WorkloadService;
import { query } from "../config/database.js";

class WorkloadService {
  // Validate workload compliance
  static async validateWorkloadCompliance(workload) {
    const {
      staff_id,
      academic_rank,
      total_load,
      each_section_course_load,
      number_of_sections,
    } = workload;

    // Get rank limits
    const rankLimits = await this.getRankLimits(academic_rank);
    
    // Get current semester's approved workload
    const currentWorkload = await this.getCurrentWorkloadHours(staff_id);

    const validation = {
      status: "compliant",
      warnings: [],
      errors: [],
      compliance: {
        rank_limits: rankLimits,
        current_total: currentWorkload,
        remaining_capacity: rankLimits.max - currentWorkload,
      },
    };

    // Check rank limits
    if (total_load < rankLimits.min) {
      validation.warnings.push(`Total load (${total_load}) is below minimum requirement (${rankLimits.min}) for ${academic_rank}`);
    }

    if (total_load > rankLimits.max) {
      validation.errors.push(`Total load (${total_load}) exceeds maximum limit (${rankLimits.max}) for ${academic_rank}`);
      validation.status = "non_compliant";
    }

    // Check course load calculation
    const calculatedCourseLoad = each_section_course_load * number_of_sections;
    const reportedCourseLoad = workload.total_course_load || 0;
    
    if (Math.abs(calculatedCourseLoad - reportedCourseLoad) > 0.1) {
      validation.warnings.push(`Course load calculation mismatch. Calculated: ${calculatedCourseLoad}, Reported: ${reportedCourseLoad}`);
    }

    // Check total load calculation
    const calculatedTotal = reportedCourseLoad + 
                           (workload.variety_of_course_load || 0) + 
                           (workload.research_load || 0) + 
                           (workload.community_service_load || 0) + 
                           (workload.elip_load || 0) + 
                           (workload.hdp_load || 0) + 
                           (workload.course_chair_load || 0) + 
                           (workload.section_advisor_load || 0) + 
                           (workload.advising_load || 0) + 
                           (workload.position_load || 0);

    if (Math.abs(calculatedTotal - total_load) > 0.1) {
      validation.warnings.push(`Total load calculation mismatch. Calculated: ${calculatedTotal}, Reported: ${total_load}`);
    }

    if (validation.errors.length > 0) {
      validation.status = "non_compliant";
    } else if (validation.warnings.length > 0) {
      validation.status = "needs_review";
    }

    return validation;
  }

  // Get rank limits
  static async getRankLimits(academicRank) {
    const [rules] = await query(
      `SELECT 
        MAX(CASE WHEN rule_name = CONCAT('rank_min_', ?) THEN CAST(rule_value AS DECIMAL) END) as min_load,
        MAX(CASE WHEN rule_name = CONCAT('rank_max_', ?) THEN CAST(rule_value AS DECIMAL) END) as max_load
       FROM system_rules 
       WHERE rule_type = 'rank_limit' 
         AND (effective_to IS NULL OR effective_to >= CURDATE())`,
      [academicRank, academicRank]
    );

    return {
      min: rules.min_load || 0,
      max: rules.max_load || 0,
    };
  }

  // Get current workload hours
  static async getCurrentWorkloadHours(staffId) {
    const [result] = await query(
      `SELECT COALESCE(SUM(total_load), 0) as total_hours 
       FROM workload_rp 
       WHERE staff_id = ? 
         AND status IN ('submitted', 'dh_approved', 'dean_approved', 'hr_approved', 'vpaa_approved', 'vpaf_approved', 'finance_approved')`,
      [staffId]
    );
    return result.total_hours || 0;
  }

  // Calculate overload payment
  static async calculateOverloadPayment(workload) {
    const { total_load, academic_rank } = workload;
    const rankLimits = await this.getRankLimits(academic_rank);

    if (total_load <= rankLimits.max) {
      return {
        is_overload: false,
        overload_hours: 0,
        overload_rate: 0,
        overload_payment: 0,
      };
    }

    // Get overload rate from system rules
    const [rateRule] = await query(
      "SELECT rule_value FROM system_rules WHERE rule_name = 'overload_rate' AND rule_type = 'payment'"
    );

    const overloadRate = parseFloat(rateRule?.rule_value) || 450;
    const overloadHours = total_load - rankLimits.max;

    return {
      is_overload: true,
      overload_hours: overloadHours,
      overload_rate: overloadRate,
      overload_payment: overloadHours * overloadRate,
    };
  }

  // Get workload summary for staff
  static async getWorkloadSummary(staffId) {
    const workloads = await query(
      `SELECT 
        wr.*,
        s.semester_code,
        s.semester_name,
        s.start_date,
        s.end_date,
        ay.year_name
       FROM workload_rp wr
       JOIN semesters s ON wr.semester_id = s.semester_id
       JOIN academic_years ay ON s.academic_year_id = ay.academic_year_id
       WHERE wr.staff_id = ?
       ORDER BY s.start_date DESC`,
      [staffId]
    );

    if (!workloads.length) return null;

    // Calculate statistics
    const stats = {
      total_workloads: workloads.length,
      total_load_hours: workloads.reduce((sum, w) => sum + (w.total_load || 0), 0),
      average_load: workloads.reduce((sum, w) => sum + (w.total_load || 0), 0) / workloads.length,
      total_over_payment: workloads.reduce((sum, w) => sum + (w.over_payment_birr || 0), 0),
    };

    return {
      staff_id: staffId,
      workloads: workloads.map(w => this.formatWorkloadSummary(w)),
      statistics: stats,
    };
  }

  // Format workload summary
  static formatWorkloadSummary(workload) {
    return {
      workload_id: workload.workload_id,
      semester: workload.semester_name,
      academic_year: workload.year_name,
      course_code: workload.course_code,
      total_load: workload.total_load,
      over_payment_birr: workload.over_payment_birr,
      status: workload.status,
      period: `${workload.start_date} to ${workload.end_date}`,
    };
  }
}

export default WorkloadService;