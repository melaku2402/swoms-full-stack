// import { ROLES } from './constants';

// export const PERMISSIONS = {
//   [ROLES.ADMIN]: {
//     canManageUsers: true,
//     canManageColleges: true,
//     canManageDepartments: true,
//     canManageCourses: true,
//     canManagePrograms: true,
//     canManageWorkload: true,
//     canApproveWorkload: true,
//     canManagePayments: true,
//     canManageRules: true,
//     canViewReports: true,
//     canViewAuditLog: true,
//   },
//   [ROLES.INSTRUCTOR]: {
//     canManageUsers: false,
//     canManageColleges: false,
//     canManageDepartments: false,
//     canManageCourses: false,
//     canManagePrograms: false,
//     canManageWorkload: true,
//     canApproveWorkload: false,
//     canManagePayments: false,
//     canManageRules: false,
//     canViewReports: false,
//     canViewAuditLog: false,
//   },
//   [ROLES.DEPARTMENT_HEAD]: {
//     canManageUsers: false,
//     canManageColleges: false,
//     canManageDepartments: true,
//     canManageCourses: true,
//     canManagePrograms: true,
//     canManageWorkload: true,
//     canApproveWorkload: true,
//     canManagePayments: false,
//     canManageRules: false,
//     canViewReports: true,
//     canViewAuditLog: false,
//   },
//   // ... other roles
// };

// export const hasPermission = (role, permission) => {
//   return PERMISSIONS[role]?.[permission] || false;
// };

// export const getRoleLabel = (role) => {
//   const labels = {
//     [ROLES.ADMIN]: 'Administrator',
//     [ROLES.INSTRUCTOR]: 'Instructor',
//     [ROLES.DEPARTMENT_HEAD]: 'Department Head',
//     [ROLES.DEAN]: 'Dean',
//     [ROLES.CDE_DIRECTOR]: 'CDE Director',
//     [ROLES.HR_DIRECTOR]: 'HR Director',
//     [ROLES.VPAA]: 'VPAA',
//     [ROLES.VPAF]: 'VPAF',
//     [ROLES.FINANCE]: 'Finance',
//     [ROLES.REGISTRAR]: 'Registrar',
//   };
//   return labels[role] || role;
// };

import { ROLES } from "./constants";

export const PERMISSIONS = {
  [ROLES.ADMIN]: {
    // User Management
    canManageUsers: true,
    canCreateUsers: true,
    canDeleteUsers: true,
    canResetPasswords: true,
    canDeactivateUsers: true,

    // Academic Management
    canManageColleges: true,
    canManageDepartments: true,
    canManageCourses: true,
    canManagePrograms: true,
    canManageSections: true,

    // Academic Timeline
    canManageAcademicYears: true,
    canManageSemesters: true,
    canActivateAcademicYear: true,

    // Workload Management
    canManageWorkload: true,
    canApproveWorkload: true,
    canRejectWorkload: true,
    canViewAllWorkloads: true,
    canOverrideWorkload: true,

    // Payment Management
    canManagePayments: true,
    canProcessPayments: true,
    canApprovePayments: true,
    canViewAllPayments: true,
    canExportPayments: true,

    // System Management
    canManageRules: true,
    canManageRateTables: true,
    canManageTaxRules: true,
    canClearCache: true,

    // Monitoring & Reports
    canViewReports: true,
    canViewAuditLog: true,
    canViewSystemHealth: true,
    canExportData: true,

    // Role Registration
    canCreateExecutives: true,
    canCreateDeans: true,
    canCreateDepartmentHeads: true,
    canCreateRegistrar: true,
    canCreateFinance: true,
    canCreateHRDirector: true,
    canCreateCDEDirector: true,
    canCreateVPAA: true,
    canCreateVPAF: true,
    canCreateInstructors: true,
  },

  [ROLES.INSTRUCTOR]: {
    canManageUsers: false,
    canCreateUsers: false,
    canManageColleges: false,
    canManageDepartments: false,
    canManageCourses: false,
    canManagePrograms: false,
    canManageWorkload: true, // Only their own
    canApproveWorkload: false,
    canRejectWorkload: false,
    canViewAllWorkloads: false,
    canManagePayments: false,
    canViewReports: false,
    canViewAuditLog: false,
    canManageRules: false,
    canExportData: false,
  },

  [ROLES.DEPARTMENT_HEAD]: {
    canManageUsers: false,
    canCreateUsers: false,
    canManageColleges: false,
    canManageDepartments: true, // Only their department
    canManageCourses: true, // For their department
    canManagePrograms: true, // For their department
    canManageWorkload: true, // For department staff
    canApproveWorkload: true, // Department level
    canRejectWorkload: true,
    canViewAllWorkloads: true, // Within department
    canManagePayments: false,
    canViewReports: true, // Department reports
    canViewAuditLog: false,
    canManageRules: false,
    canExportData: true, // Department data
    canCreateInstructors: true, // For department
  },

  [ROLES.DEAN]: {
    canManageUsers: false,
    canCreateUsers: false,
    canManageColleges: true, // Their college
    canManageDepartments: true, // Within college
    canManageCourses: true, // Within college
    canManagePrograms: true, // Within college
    canManageWorkload: true, // College staff
    canApproveWorkload: true, // College level
    canRejectWorkload: true,
    canViewAllWorkloads: true, // Within college
    canManagePayments: false,
    canViewReports: true, // College reports
    canViewAuditLog: false,
    canManageRules: false,
    canExportData: true, // College data
    canCreateDepartmentHeads: true,
  },

  [ROLES.REGISTRAR]: {
    canManageUsers: false,
    canCreateUsers: false,
    canManageColleges: false,
    canManageDepartments: false,
    canManageCourses: true, // Course management only
    canManagePrograms: true, // Program management only
    canManageAcademicYears: true,
    canManageSemesters: true,
    canManageSections: true,
    canManageWorkload: false,
    canApproveWorkload: false,
    canViewAllWorkloads: false,
    canManagePayments: false,
    canViewReports: true, // Academic reports
    canViewAuditLog: false,
    canManageRules: false,
    canExportData: true, // Academic data
  },

  [ROLES.HR_DIRECTOR]: {
    canManageUsers: true, // Staff management
    canCreateUsers: true, // Create instructors
    canManageColleges: false,
    canManageDepartments: false,
    canManageCourses: false,
    canManagePrograms: false,
    canManageWorkload: true, // For HR approval
    canApproveWorkload: true, // HR level
    canRejectWorkload: true,
    canViewAllWorkloads: true, // All workloads
    canManagePayments: false,
    canViewReports: true, // HR reports
    canViewAuditLog: false,
    canManageRules: false,
    canExportData: true, // HR data
    canUpdateStaffRank: true,
    canActivateDeactivate: true,
  },

  [ROLES.FINANCE]: {
    canManageUsers: false,
    canCreateUsers: false,
    canManageColleges: false,
    canManageDepartments: false,
    canManageCourses: false,
    canManagePrograms: false,
    canManageWorkload: true, // For payment calculation
    canApproveWorkload: false,
    canViewAllWorkloads: true, // For payment processing
    canManagePayments: true,
    canProcessPayments: true,
    canApprovePayments: true,
    canViewReports: true, // Financial reports
    canViewAuditLog: true, // Payment audit
    canManageRules: true, // Payment rules
    canExportData: true, // Financial data
    canManageRateTables: true,
    canManageTaxRules: true,
  },

  [ROLES.VPAA]: {
    canManageUsers: false,
    canCreateUsers: true, // Create deans & registrar
    canManageColleges: false,
    canManageDepartments: false,
    canManageCourses: false,
    canManagePrograms: false,
    canManageWorkload: true, // For VPAA approval
    canApproveWorkload: true, // VPAA level
    canRejectWorkload: true,
    canViewAllWorkloads: true, // All workloads
    canManagePayments: false,
    canViewReports: true, // Academic reports
    canViewAuditLog: false,
    canManageRules: false,
    canExportData: true,
    canCreateDeans: true,
    canCreateRegistrar: true,
  },

  [ROLES.VPAF]: {
    canManageUsers: false,
    canCreateUsers: false,
    canManageColleges: false,
    canManageDepartments: false,
    canManageCourses: false,
    canManagePrograms: false,
    canManageWorkload: false,
    canApproveWorkload: false,
    canViewAllWorkloads: true, // For oversight
    canManagePayments: true, // Final approval
    canApprovePayments: true, // VPAF level
    canViewReports: true, // Financial oversight
    canViewAuditLog: true,
    canManageRules: false,
    canExportData: true,
  },

  [ROLES.CDE_DIRECTOR]: {
    canManageUsers: false,
    canCreateUsers: false,
    canManageColleges: false,
    canManageDepartments: false,
    canManageCourses: false,
    canManagePrograms: true, // CDE programs
    canManageWorkload: true, // CDE workloads
    canApproveWorkload: true, // CDE level
    canRejectWorkload: true,
    canViewAllWorkloads: true, // CDE workloads
    canManagePayments: true, // CDE payments
    canViewReports: true, // CDE reports
    canViewAuditLog: false,
    canManageRules: false,
    canExportData: true, // CDE data
  },
};

// Permission check helper
export const hasPermission = (role, permission) => {
  return PERMISSIONS[role]?.[permission] || false;
};

// Get all permissions for a role
export const getRolePermissions = (role) => {
  return PERMISSIONS[role] || {};
};

// Check if user can perform action
export const can = (user, permission) => {
  if (!user || !user.role) return false;
  return hasPermission(user.role, permission);
};

// Get creatable roles for a given role
export const getCreatableRoles = (role) => {
  const creatableRoles = {
    [ROLES.ADMIN]: [
      ROLES.DEAN,
      ROLES.REGISTRAR,
      ROLES.HR_DIRECTOR,
      ROLES.FINANCE,
      ROLES.VPAA,
      ROLES.VPAF,
      ROLES.CDE_DIRECTOR,
      ROLES.DEPARTMENT_HEAD,
      ROLES.INSTRUCTOR,
    ],
    [ROLES.VPAA]: [ROLES.DEAN, ROLES.REGISTRAR],
    [ROLES.VPAF]: [ROLES.FINANCE],
    [ROLES.DEAN]: [ROLES.DEPARTMENT_HEAD],
    [ROLES.HR_DIRECTOR]: [ROLES.INSTRUCTOR],
    [ROLES.DEPARTMENT_HEAD]: [ROLES.INSTRUCTOR],
    [ROLES.CDE_DIRECTOR]: [ROLES.INSTRUCTOR], // For CDE only
  };

  return creatableRoles[role] || [];
};

// Get role label
export const getRoleLabel = (role) => {
  const labels = {
    [ROLES.ADMIN]: "Administrator",
    [ROLES.INSTRUCTOR]: "Instructor",
    [ROLES.DEPARTMENT_HEAD]: "Department Head",
    [ROLES.DEAN]: "Dean",
    [ROLES.CDE_DIRECTOR]: "CDE Director",
    [ROLES.HR_DIRECTOR]: "HR Director",
    [ROLES.VPAA]: "Vice President for Academic Affairs",
    [ROLES.VPAF]: "Vice President for Administration & Finance",
    [ROLES.FINANCE]: "Finance Officer",
    [ROLES.REGISTRAR]: "Registrar",
  };
  return labels[role] || role.replace("_", " ").toUpperCase();
};

// Get role icon (Lucide React icons)
export const getRoleIcon = (role) => {
  const icons = {
    [ROLES.ADMIN]: "Shield",
    [ROLES.INSTRUCTOR]: "UserCircle",
    [ROLES.DEPARTMENT_HEAD]: "Building",
    [ROLES.DEAN]: "GraduationCap",
    [ROLES.CDE_DIRECTOR]: "School",
    [ROLES.HR_DIRECTOR]: "Users",
    [ROLES.VPAA]: "Award",
    [ROLES.VPAF]: "Briefcase",
    [ROLES.FINANCE]: "CreditCard",
    [ROLES.REGISTRAR]: "BookOpen",
  };
  return icons[role] || "User";
};

// Get role color scheme
export const getRoleColor = (role) => {
  const colors = {
    [ROLES.ADMIN]: {
      bg: "bg-gradient-to-r from-purple-600 to-pink-600",
      text: "text-white",
      light: "bg-purple-50 text-purple-700",
    },
    [ROLES.INSTRUCTOR]: {
      bg: "bg-gradient-to-r from-blue-600 to-cyan-600",
      text: "text-white",
      light: "bg-blue-50 text-blue-700",
    },
    [ROLES.DEPARTMENT_HEAD]: {
      bg: "bg-gradient-to-r from-emerald-600 to-green-600",
      text: "text-white",
      light: "bg-emerald-50 text-emerald-700",
    },
    [ROLES.DEAN]: {
      bg: "bg-gradient-to-r from-amber-600 to-orange-600",
      text: "text-white",
      light: "bg-amber-50 text-amber-700",
    },
    [ROLES.CDE_DIRECTOR]: {
      bg: "bg-gradient-to-r from-indigo-600 to-purple-600",
      text: "text-white",
      light: "bg-indigo-50 text-indigo-700",
    },
    [ROLES.HR_DIRECTOR]: {
      bg: "bg-gradient-to-r from-pink-600 to-rose-600",
      text: "text-white",
      light: "bg-pink-50 text-pink-700",
    },
    [ROLES.VPAA]: {
      bg: "bg-gradient-to-r from-violet-600 to-purple-600",
      text: "text-white",
      light: "bg-violet-50 text-violet-700",
    },
    [ROLES.VPAF]: {
      bg: "bg-gradient-to-r from-gray-700 to-gray-900",
      text: "text-white",
      light: "bg-gray-50 text-gray-700",
    },
    [ROLES.FINANCE]: {
      bg: "bg-gradient-to-r from-green-600 to-emerald-600",
      text: "text-white",
      light: "bg-green-50 text-green-700",
    },
    [ROLES.REGISTRAR]: {
      bg: "bg-gradient-to-r from-sky-600 to-blue-600",
      text: "text-white",
      light: "bg-sky-50 text-sky-700",
    },
  };
  return (
    colors[role] || {
      bg: "bg-gradient-to-r from-gray-600 to-gray-800",
      text: "text-white",
      light: "bg-gray-50 text-gray-700",
    }
  );
};

// Workflow steps for each role
export const WORKFLOW_STEPS = {
  workload_approval: {
    [ROLES.INSTRUCTOR]: { order: 1, action: "submit" },
    [ROLES.DEPARTMENT_HEAD]: { order: 2, action: "approve" },
    [ROLES.DEAN]: { order: 3, action: "approve" },
    [ROLES.HR_DIRECTOR]: { order: 4, action: "approve" },
    [ROLES.VPAA]: { order: 5, action: "approve" },
    [ROLES.FINANCE]: { order: 6, action: "process_payment" },
    [ROLES.VPAF]: { order: 7, action: "final_approve" },
  },
  payment_approval: {
    [ROLES.FINANCE]: { order: 1, action: "process" },
    [ROLES.VPAF]: { order: 2, action: "approve" },
  },
  user_creation: {
    [ROLES.ADMIN]: { order: 1, action: "create_executive" },
    [ROLES.VPAA]: { order: 2, action: "create_academic_staff" },
    [ROLES.VPAF]: { order: 3, action: "create_finance_staff" },
    [ROLES.HR_DIRECTOR]: { order: 4, action: "create_instructor" },
    [ROLES.DEAN]: { order: 5, action: "create_department_head" },
    [ROLES.DEPARTMENT_HEAD]: { order: 6, action: "create_instructor" },
  },
};

// Check if role can approve workload
export const canApproveWorkload = (role, currentStatus) => {
  const workflow = WORKFLOW_STEPS.workload_approval;
  const userStep = workflow[role];

  if (!userStep) return false;

  // Get current step based on status
  const statusSteps = {
    draft: 0,
    submitted: 1,
    dh_approved: 2,
    dean_approved: 3,
    hr_approved: 4,
    vpaa_approved: 5,
    finance_approved: 6,
    vpaf_approved: 7,
  };

  const currentStep = statusSteps[currentStatus] || 0;
  return userStep.order === currentStep + 1;
};

// Check if role can view workload
export const canViewWorkload = (user, workloadOwner, workloadDepartment) => {
  if (!user) return false;

  // Admin can view all
  if (user.role === ROLES.ADMIN) return true;

  // Users can view their own
  if (user.id === workloadOwner) return true;

  // Department heads can view department workloads
  if (
    user.role === ROLES.DEPARTMENT_HEAD &&
    user.department_id === workloadDepartment
  ) {
    return true;
  }

  // Deans can view college workloads
  if (
    user.role === ROLES.DEAN &&
    user.college_id === workloadDepartment?.college_id
  ) {
    return true;
  }

  // HR can view all
  if (user.role === ROLES.HR_DIRECTOR) return true;

  // Finance can view all (for payment)
  if (user.role === ROLES.FINANCE) return true;

  // VPAA can view all
  if (user.role === ROLES.VPAA) return true;

  // VPAF can view all
  if (user.role === ROLES.VPAF) return true;

  return false;
};