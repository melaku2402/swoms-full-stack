import { query } from "../config/database.js";

class WorkloadDetailModel {
  // Get detailed workload breakdown for instructor
  static async getInstructorWorkloadReport(
    staffId,
    semesterId,
    academicYearId
  ) {
    const [instructor] = await query(
      `SELECT 
        sp.staff_id,
        sp.first_name,
        sp.last_name,
        sp.middle_name,
        sp.academic_rank,
        d.department_name,
        d.department_code,
        c.college_name,
        c.college_code,
        ay.year_code,
        ay.year_name,
        s.semester_code,
        s.semester_name,
        s.semester_type
       FROM staff_profiles sp
       JOIN departments d ON sp.department_id = d.department_id
       JOIN colleges c ON d.college_id = c.college_id
       JOIN semesters s ON s.semester_id = ?
       JOIN academic_years ay ON s.academic_year_id = ay.academic_year_id
       WHERE sp.staff_id = ?`,
      [semesterId, staffId]
    );

    if (!instructor) return null;

    // Get course assignments for the semester
    const courseAssignments = await query(
      `SELECT 
        c.course_id,
        c.course_code,
        c.course_title,
        c.credit_hours,
        c.lecture_hours,
        c.tutorial_hours,
        c.lab_hours,
        s.section_code,
        s.student_count,
        s.max_capacity,
        d.department_name as course_department,
        p.program_name,
        p.program_type,
        (SELECT COUNT(DISTINCT section_id) 
         FROM sections 
         WHERE course_id = c.course_id 
         AND semester_id = ?) as total_sections,
        (SELECT COUNT(*) 
         FROM sections 
         WHERE course_id = c.course_id 
         AND semester_id = ? 
         AND instructor_id = ?) as instructor_sections
       FROM sections s
       JOIN courses c ON s.course_id = c.course_id
       JOIN departments d ON c.department_id = d.department_id
       LEFT JOIN programs p ON c.program_id = p.program_id
       WHERE s.semester_id = ?
         AND s.instructor_id = ?
         AND s.is_active = TRUE
       ORDER BY c.course_code, s.section_code`,
      [semesterId, semesterId, staffId, semesterId, staffId]
    );

    // Get workload details
    const [workload] = await query(
      `SELECT 
        wr.*,
        aw_dh.status as dh_approval_status,
        aw_dh.comments as dh_comments,
        aw_dh.updated_at as dh_approval_date,
        aw_dean.status as dean_approval_status,
        aw_dean.comments as dean_comments,
        aw_dean.updated_at as dean_approval_date,
        aw_hr.status as hr_approval_status,
        aw_hr.comments as hr_comments,
        aw_hr.updated_at as hr_approval_date
       FROM workload_rp wr
       LEFT JOIN approval_workflow aw_dh ON wr.workload_id = aw_dh.entity_id 
         AND aw_dh.entity_type = 'workload_rp' 
         AND aw_dh.approver_role = 'department_head'
       LEFT JOIN approval_workflow aw_dean ON wr.workload_id = aw_dean.entity_id 
         AND aw_dean.entity_type = 'workload_rp' 
         AND aw_dean.approver_role = 'dean'
       LEFT JOIN approval_workflow aw_hr ON wr.workload_id = aw_hr.entity_id 
         AND aw_hr.entity_type = 'workload_rp' 
         AND aw_hr.approver_role = 'hr_director'
       WHERE wr.staff_id = ? AND wr.semester_id = ?`,
      [staffId, semesterId]
    );

    // Get administrative duties
    const adminDuties = await query(
      `SELECT 
        duty_type,
        duty_description,
        duty_hours,
        assigned_date,
        status
       FROM admin_duties 
       WHERE staff_id = ? 
         AND semester_id = ?
         AND status = 'active'`,
      [staffId, semesterId]
    );

    // Get research activities
    const researchActivities = await query(
      `SELECT 
        activity_type,
        activity_description,
        hours_per_week,
        start_date,
        end_date,
        status
       FROM research_activities 
       WHERE staff_id = ? 
         AND semester_id = ?`,
      [staffId, semesterId]
    );

    // Get community services
    const communityServices = await query(
      `SELECT 
        service_type,
        service_description,
        hours,
        service_date,
        status
       FROM community_services 
       WHERE staff_id = ? 
         AND semester_id = ?`,
      [staffId, semesterId]
    );

    // Calculate total loads
    let teachingLoad = 0;
    let adminLoad = 0;
    let researchLoad = 0;
    let communityLoad = 0;
    let positionLoad = 0;

    // Calculate teaching load from course assignments
    courseAssignments.forEach((course) => {
      teachingLoad += course.credit_hours;
    });

    // Calculate admin load
    adminDuties.forEach((duty) => {
      adminLoad += duty.duty_hours || 0;
    });

    // Calculate research load
    researchActivities.forEach((activity) => {
      researchLoad += activity.hours_per_week || 0;
    });

    // Calculate community load
    communityServices.forEach((service) => {
      communityLoad += service.hours || 0;
    });

    // Get position load (if department head, dean, etc.)
    const [position] = await query(
      `SELECT 
        role,
        load_hours,
        start_date,
        end_date
       FROM position_loads 
       WHERE staff_id = ? 
         AND semester_id = ?
         AND status = 'active'`,
      [staffId, semesterId]
    );

    if (position) {
      positionLoad = position.load_hours || 0;
    }

    const totalLoad =
      teachingLoad + adminLoad + researchLoad + communityLoad + positionLoad;

    // Get rank limits
    const [rankLimit] = await query(
      `SELECT 
        rule_value as max_load
       FROM system_rules 
       WHERE rule_name = CONCAT('rank_max_', ?)
         AND (effective_to IS NULL OR effective_to >= CURDATE())
         AND effective_from <= CURDATE()
       ORDER BY effective_from DESC
       LIMIT 1`,
      [instructor.academic_rank]
    );

    const maxLoad = rankLimit ? parseFloat(rankLimit.max_load) : 0;
    const overloadHours = totalLoad > maxLoad ? totalLoad - maxLoad : 0;

    // Get overload payment if any
    const [overloadPayment] = await query(
      `SELECT 
        gross_amount,
        tax_amount,
        net_amount,
        payment_status
       FROM overload_payments 
       WHERE staff_id = ? 
         AND semester_id = ?`,
      [staffId, semesterId]
    );

    return {
      instructor_info: instructor,
      academic_info: {
        college: instructor.college_name,
        department: instructor.department_name,
        academic_rank: instructor.academic_rank,
        program: "Regular",
        academic_year: instructor.year_name,
        semester: instructor.semester_name,
      },
      course_assignments: courseAssignments.map((course) => ({
        course_code: course.course_code,
        course_title: course.course_title,
        credit_hours: course.credit_hours,
        lecture_hours: course.lecture_hours,
        tutorial_hours: course.tutorial_hours,
        lab_hours: course.lab_hours,
        department: course.course_department,
        program: course.program_name,
        year: instructor.year_code,
        sections: course.instructor_sections,
        student_count: course.student_count,
        variety_of_course_load:
          course.credit_hours * course.instructor_sections,
      })),
      load_breakdown: {
        teaching_load: parseFloat(teachingLoad.toFixed(2)),
        research_load: parseFloat(researchLoad.toFixed(2)),
        community_service_load: parseFloat(communityLoad.toFixed(2)),
        admin_load: parseFloat(adminLoad.toFixed(2)),
        research_council_load: researchActivities
          .filter((a) => a.activity_type === "research_council")
          .reduce((sum, a) => sum + (a.hours_per_week || 0), 0),
        hdp_load: adminDuties
          .filter((d) => d.duty_type === "hdp")
          .reduce((sum, d) => sum + (d.duty_hours || 0), 0),
        elip_load: adminDuties
          .filter((d) => d.duty_type === "elip")
          .reduce((sum, d) => sum + (d.duty_hours || 0), 0),
        course_chair_load: adminDuties
          .filter((d) => d.duty_type === "course_chair")
          .reduce((sum, d) => sum + (d.duty_hours || 0), 0),
        section_advisor_load: adminDuties
          .filter((d) => d.duty_type === "section_advisor")
          .reduce((sum, d) => sum + (d.duty_hours || 0), 0),
        advising_load: adminDuties
          .filter((d) => d.duty_type === "advising")
          .reduce((sum, d) => sum + (d.duty_hours || 0), 0),
        position_load: parseFloat(positionLoad.toFixed(2)),
        load_total: parseFloat(totalLoad.toFixed(2)),
      },
      overload_info: {
        is_overload: overloadHours > 0,
        overload_hours: parseFloat(overloadHours.toFixed(2)),
        max_allowed: maxLoad,
        payment_birr: overloadPayment ? overloadPayment.net_amount : 0,
        payment_status: overloadPayment
          ? overloadPayment.payment_status
          : "none",
      },
      approval_workflow: {
        department_head: {
          status: workload?.dh_approval_status || "pending",
          comments: workload?.dh_comments,
          date: workload?.dh_approval_date,
        },
        dean: {
          status: workload?.dean_approval_status || "pending",
          comments: workload?.dean_comments,
          date: workload?.dean_approval_date,
        },
        hr_director: {
          status: workload?.hr_approval_status || "pending",
          comments: workload?.hr_comments,
          date: workload?.hr_approval_date,
        },
        vpaa: {
          status: "pending",
        },
        vpaf: {
          status: "pending",
        },
        finance: {
          status: "pending",
        },
      },
      summary: {
        total_courses: courseAssignments.length,
        total_sections: courseAssignments.reduce(
          (sum, c) => sum + (c.instructor_sections || 0),
          0
        ),
        total_students: courseAssignments.reduce(
          (sum, c) => sum + (c.student_count || 0),
          0
        ),
        total_credit_hours: courseAssignments.reduce(
          (sum, c) => sum + (c.credit_hours || 0),
          0
        ),
        compliance_status:
          overloadHours > 0
            ? "overload"
            : totalLoad < maxLoad * 0.8
            ? "underload"
            : "compliant",
      },
    };
  }

  // Get department courses for assignment
  static async getDepartmentCoursesForAssignment(departmentId, semesterId) {
    const courses = await query(
      `SELECT 
        c.course_id,
        c.course_code,
        c.course_title,
        c.credit_hours,
        c.lecture_hours,
        c.tutorial_hours,
        c.lab_hours,
        c.program_type,
        p.program_name,
        (SELECT COUNT(*) 
         FROM sections s 
         WHERE s.course_id = c.course_id 
           AND s.semester_id = ?) as total_sections,
        (SELECT COUNT(*) 
         FROM sections s 
         WHERE s.course_id = c.course_id 
           AND s.semester_id = ?
           AND s.instructor_id IS NOT NULL) as assigned_sections,
        (SELECT COUNT(*) 
         FROM sections s 
         WHERE s.course_id = c.course_id 
           AND s.semester_id = ?
           AND s.instructor_id IS NULL) as available_sections
       FROM courses c
       LEFT JOIN programs p ON c.program_id = p.program_id
       WHERE c.department_id = ?
         AND c.status = 'active'
         AND c.program_type = 'regular'
       ORDER BY c.course_code`,
      [semesterId, semesterId, semesterId, departmentId]
    );

    // Get department instructors
    const instructors = await query(
      `SELECT 
        sp.staff_id,
        sp.first_name,
        sp.last_name,
        sp.academic_rank,
        u.username,
        u.email,
        (SELECT COUNT(*) 
         FROM sections s 
         WHERE s.instructor_id = sp.staff_id 
           AND s.semester_id = ?) as current_assignments,
        (SELECT SUM(wr.total_hours) 
         FROM workload_rp wr 
         WHERE wr.staff_id = sp.staff_id 
           AND wr.semester_id = ?) as current_load
       FROM staff_profiles sp
       JOIN users u ON sp.user_id = u.user_id
       WHERE sp.department_id = ?
         AND u.is_active = TRUE
       ORDER BY sp.last_name, sp.first_name`,
      [semesterId, semesterId, departmentId]
    );

    // Get rank limits for each instructor
    const instructorsWithLimits = await Promise.all(
      instructors.map(async (instructor) => {
        const [limit] = await query(
          `SELECT rule_value as max_load
           FROM system_rules 
           WHERE rule_name = CONCAT('rank_max_', ?)
             AND (effective_to IS NULL OR effective_to >= CURDATE())
           ORDER BY effective_from DESC
           LIMIT 1`,
          [instructor.academic_rank]
        );

        return {
          ...instructor,
          max_load: limit ? parseFloat(limit.max_load) : 0,
          available_capacity: limit
            ? parseFloat(limit.max_load) - (instructor.current_load || 0)
            : 0,
        };
      })
    );

    return {
      courses,
      instructors: instructorsWithLimits,
      semester_id: semesterId,
      department_id: departmentId,
      summary: {
        total_courses: courses.length,
        total_sections: courses.reduce(
          (sum, c) => sum + (c.total_sections || 0),
          0
        ),
        assigned_sections: courses.reduce(
          (sum, c) => sum + (c.assigned_sections || 0),
          0
        ),
        available_sections: courses.reduce(
          (sum, c) => sum + (c.available_sections || 0),
          0
        ),
        total_instructors: instructors.length,
        available_instructors: instructorsWithLimits.filter(
          (i) => i.available_capacity > 0
        ).length,
      },
    };
  }

  // Assign course to instructor
  static async assignCourseToInstructor(assignmentData) {
    const {
      section_id,
      instructor_id,
      assigned_by,
      department_id,
      semester_id,
    } = assignmentData;

    // Check if section exists and is available
    const [section] = await query(
      `SELECT 
        s.*,
        c.course_code,
        c.course_title,
        c.credit_hours
       FROM sections s
       JOIN courses c ON s.course_id = c.course_id
       WHERE s.section_id = ?
         AND s.semester_id = ?
         AND c.department_id = ?`,
      [section_id, semester_id, department_id]
    );

    if (!section) {
      throw new Error("Section not found or not in your department");
    }

    if (section.instructor_id && section.instructor_id !== instructor_id) {
      throw new Error("Section already assigned to another instructor");
    }

    // Check instructor's current load
    const [instructor] = await query(
      `SELECT 
        sp.academic_rank,
        (SELECT SUM(wr.total_hours) 
         FROM workload_rp wr 
         WHERE wr.staff_id = ? 
           AND wr.semester_id = ?) as current_load
       FROM staff_profiles sp
       WHERE sp.staff_id = ?`,
      [instructor_id, semester_id, instructor_id]
    );

    // Get instructor's max load
    const [limit] = await query(
      `SELECT rule_value as max_load
       FROM system_rules 
       WHERE rule_name = CONCAT('rank_max_', ?)
         AND (effective_to IS NULL OR effective_to >= CURDATE())
       ORDER BY effective_from DESC
       LIMIT 1`,
      [instructor.academic_rank]
    );

    const maxLoad = limit ? parseFloat(limit.max_load) : 0;
    const currentLoad = instructor.current_load || 0;
    const courseLoad = section.credit_hours || 3; // Default 3 credit hours

    if (currentLoad + courseLoad > maxLoad) {
      throw new Error(
        `Assignment would exceed instructor's maximum load (Current: ${currentLoad}, Max: ${maxLoad}, Course: ${courseLoad})`
      );
    }

    // Update section with instructor assignment
    await query(
      `UPDATE sections 
       SET instructor_id = ?, updated_at = CURRENT_TIMESTAMP
       WHERE section_id = ?`,
      [instructor_id, section_id]
    );

    // Log the assignment
    await query(
      `INSERT INTO course_assignments 
       (section_id, instructor_id, assigned_by, department_id, semester_id, assignment_date)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [section_id, instructor_id, assigned_by, department_id, semester_id]
    );

    // Update or create workload record
    const existingWorkload = await query(
      `SELECT workload_id FROM workload_rp 
       WHERE staff_id = ? AND semester_id = ?`,
      [instructor_id, semester_id]
    );

    if (existingWorkload.length > 0) {
      // Update existing workload
      await query(
        `UPDATE workload_rp 
         SET teaching_hours = teaching_hours + ?,
             total_hours = total_hours + ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE workload_id = ?`,
        [courseLoad, courseLoad, existingWorkload[0].workload_id]
      );
    } else {
      // Create new workload
      await query(
        `INSERT INTO workload_rp 
         (staff_id, semester_id, teaching_hours, total_hours, status)
         VALUES (?, ?, ?, ?, 'draft')`,
        [instructor_id, semester_id, courseLoad, courseLoad]
      );
    }

    // Return assignment details
    return {
      section_id,
      instructor_id,
      course_code: section.course_code,
      course_title: section.course_title,
      section_code: section.section_code,
      credit_hours: courseLoad,
      assignment_date: new Date(),
      assigned_by,
      status: "assigned",
    };
  }

  // Bulk assign courses
  static async bulkAssignCourses(
    assignments,
    assignedBy,
    departmentId,
    semesterId
  ) {
    const results = [];
    const errors = [];

    for (const assignment of assignments) {
      try {
        const result = await this.assignCourseToInstructor({
          section_id: assignment.section_id,
          instructor_id: assignment.instructor_id,
          assigned_by: assignedBy,
          department_id: departmentId,
          semester_id: semesterId,
        });
        results.push(result);
      } catch (error) {
        errors.push({
          section_id: assignment.section_id,
          instructor_id: assignment.instructor_id,
          error: error.message,
        });
      }
    }

    return {
      success: results,
      errors,
      summary: {
        total_assignments: assignments.length,
        successful: results.length,
        failed: errors.length,
      },
    };
  }

  // Get assignment history for department
  static async getAssignmentHistory(
    departmentId,
    semesterId,
    page = 1,
    limit = 20
  ) {
    const offset = (page - 1) * limit;

    const assignments = await query(
      `SELECT 
        ca.*,
        c.course_code,
        c.course_title,
        s.section_code,
        sp.first_name,
        sp.last_name,
        sp.academic_rank,
        ua.username as assigned_by_name
       FROM course_assignments ca
       JOIN sections s ON ca.section_id = s.section_id
       JOIN courses c ON s.course_id = c.course_id
       JOIN staff_profiles sp ON ca.instructor_id = sp.staff_id
       JOIN users ua ON ca.assigned_by = ua.user_id
       WHERE ca.department_id = ?
         AND ca.semester_id = ?
       ORDER BY ca.assignment_date DESC
       LIMIT ? OFFSET ?`,
      [departmentId, semesterId, limit, offset]
    );

    const totalResult = await query(
      `SELECT COUNT(*) as count 
       FROM course_assignments 
       WHERE department_id = ? AND semester_id = ?`,
      [departmentId, semesterId]
    );

    const total = totalResult[0].count;

    return {
      assignments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}

export default WorkloadDetailModel;
