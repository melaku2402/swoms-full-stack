// src/config/constants.js
// User roles constants
export const ROLES = {
  ADMIN: "admin",
  INSTRUCTOR: "instructor",
  DEPARTMENT_HEAD: "department_head",
  DEAN: "dean",
  CDE_DIRECTOR: "cde_director",
  HR_DIRECTOR: "hr_director",
  VPAA: "vpaa",
  VPAF: "vpaf",
  FINANCE: "finance",
  REGISTRAR: "registrar",
};
// Semester types
export const SEMESTER_TYPES = {
  SEMESTER_I: "semester_i",
  SEMESTER_II: "semester_ii",
  SUMMER: "summer",
  DISTANCE: "distance",
  EXTENSION: "extension",
  WEEKEND: "weekend",
};

// Academic ranks
export const ACADEMIC_RANKS = {
  GRADUATE_ASSISTANT: "graduate_assistant",
  ASSISTANT_LECTURER: "assistant_lecturer",
  LECTURER: "lecturer",
  ASSISTANT_PROFESSOR: "assistant_professor",
  ASSOCIATE_PROFESSOR: "associate_professor",
  PROFESSOR: "professor",
};

// Program types
export const PROGRAM_TYPES = {
  REGULAR: "regular",
  EXTENSION: "extension",
  WEEKEND: "weekend",
  SUMMER: "summer",
  DISTANCE: "distance",
};

// Roles that can create other users
export const CAN_REGISTER_USERS = ["admin", "registrar", "hr_director"];

// Academic staff roles (require staff profile)
export const ACADEMIC_STAFF_ROLES = [
  "instructor",
  "department_head",
  "dean",
  "cde_director",
  "hr_director",
  "vpaa",
  "vpaf",
];

// Administrative/non-academic roles
export const ADMINISTRATIVE_ROLES = ["admin", "registrar", "finance"];

// Roles that admin can create
export const ADMIN_CREATABLE_ROLES = [
  "admin",
  "registrar",
  "hr_director",
  "finance",
  "vpaa",
  "vpaf",
  "dean",
  "department_head",
  "cde_director",
  "instructor",
];

// Roles that registrar can create
export const REGISTRAR_CREATABLE_ROLES = ["instructor", "department_head"];

// Roles that HR director can create
export const HR_CREATABLE_ROLES = [
  "instructor",
  "department_head",
  "dean",
  "cde_director",
  "hr_director",
  "vpaa",
  "vpaf",
];

// Approval workflow roles
export const APPROVAL_WORKFLOW_ROLES = {
  REGULAR_PROGRAM: [
    "department_head",
    "dean",
    "hr_director",
    "vpaa",
    "vpaf",
    "finance",
  ],
  EXTENSION_PROGRAM: [
    "department_head",
    "dean",
    "cde_director",
    "hr_director",
    "vpaf",
    "finance",
  ],
  WEEKEND_PROGRAM: [
    "department_head",
    "dean",
    "cde_director",
    "hr_director",
    "vpaf",
    "finance",
  ],
  SUMMER_PROGRAM: [
    "department_head",
    "dean",
    "cde_director",
    "hr_director",
    "vpaf",
    "finance",
  ],
  DISTANCE_PROGRAM: [
    "cde_director",
    "department_head",
    "dean",
    "hr_director",
    "vpaf",
    "finance",
  ],
};
// Default load factors (from SRS)
export const DEFAULT_LOAD_FACTORS = {
  LECTURE: 1.0,
  LAB: 0.75,
  TUTORIAL: 0.5,
  MODULE_DISTANCE: 1.0,
};

// Default rank load limits (from SRS Section 4.7.1.2)
export const DEFAULT_RANK_LOAD_LIMITS = {
  graduate_assistant: { min: 12, max: 16 },
  assistant_lecturer: { min: 10, max: 14 },
  lecturer: { min: 8, max: 12 },
  assistant_professor: { min: 6, max: 10 },
  associate_professor: { min: 4, max: 8 },
  professor: { min: 4, max: 6 },
};
// ... existing constants ...

// Employment types
export const EMPLOYMENT_TYPES = {
  FULL_TIME: "full_time",
  PART_TIME: "part_time",
  CONTRACT: "contract",
};

// Gender options
export const GENDER_OPTIONS = {
  MALE: "male",
  FEMALE: "female",
  OTHER: "other",
};

// Workload statuses (for reference)
export const WORKLOAD_STATUSES = {
  DRAFT: "draft",
  SUBMITTED: "submitted",
  DH_APPROVED: "dh_approved",
  DEAN_APPROVED: "dean_approved",
  HR_APPROVED: "hr_approved",
  VPAA_APPROVED: "vpaa_approved",
  VPAF_APPROVED: "vpaf_approved",
  FINANCE_APPROVED: "finance_approved",
  REJECTED: "rejected",
};

// NRP Program types
export const NRP_PROGRAM_TYPES = {
  EXTENSION: "extension",
  WEEKEND: "weekend",
  SUMMER: "summer",
  DISTANCE: "distance",
};

// Rate categories
export const RATE_CATEGORIES = {
  A: "A",
  B: "B",
  C: "C",
  DEFAULT: "default",
};

// Payment statuses
export const PAYMENT_STATUSES = {
  PENDING: "pending",
  APPROVED: "approved",
  PAID: "paid",
  REJECTED: "rejected",
};

// Rule types
export const RULE_TYPES = {
  LOAD_FACTOR: "load_factor",
  RANK_LIMIT: "rank_limit",
  PAYMENT: "payment",
  DISTRIBUTION: "distribution",
  OTHER: "other",
};
// role registration hierarchy

// Update this in src/config/constants.js

// Role Hierarchy - Who can create whom
export const ROLE_CREATION_HIERARCHY = {
  admin: [
    'admin',           // Can create other admins
    'vpaa',            // Vice President Academic Affairs
    'hr_director',     // HR Director
    'finance',         // Finance Director
    'cde_director',    // CDE Director
    'vpaf',            // Vice President Administration & Finance
    'dean',            // College Dean
    'registrar',       // Registrar
    'department_head', // Department Head
    'instructor'       // Instructor
  ], // Admin can create ALL roles
  
  vpaa: ['dean', 'registrar', 'vpaf'], // VPAA creates Deans, Registrar, and VPAF
  
  dean: ['department_head'], // Deans create Department Heads
  
  hr_director: ['instructor'], // HR Director creates Instructors
  
  // These roles cannot create other users
  department_head: [],
  instructor: [],
  registrar: [],
  cde_director: [],
  vpaf: [],
  finance: []
};

// Get all possible roles (for admin to create all)
export const ALL_ROLES = [
  'admin',
  'vpaa',
  'hr_director',
  'finance',
  'cde_director',
  'vpaf',
  'dean',
  'registrar',
  'department_head',
  'instructor'
];

// Phase 1: System Setup creation order
export const PHASE_1_CREATION_ORDER = [
  'admin', // First admin must exist
  'vpaa', 'hr_director', 'finance', 'cde_director', 'vpaf', // Admin creates these
  'dean', 'registrar', // VPAA creates these
  'department_head', // Deans create these
  'instructor' // HR Director creates these
];

// Valid academic ranks for instructors (from HR Director)
export const VALID_ACADEMIC_RANKS = [
  'graduate_assistant',
  'assistant_lecturer',
  'lecturer',
  'assistant_professor',
  'associate_professor',
  'professor',
  'doctor'
];

// export const PROGRAM_TYPES = {
//   REGULAR: 'regular',
//   EXTENSION: 'extension',
//   WEEKEND: 'weekend',
//   SUMMER: 'summer',
//   DISTANCE: 'distance',
//   UG: 'UG',
//   PG: 'PG',
//   PHD: 'PHD',
//   DIPLOMA: 'diploma',
//   CERTIFICATE: 'certificate',
// };
// ... rest of existing code ...