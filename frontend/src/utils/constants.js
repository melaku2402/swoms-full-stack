// // User roles matching backend
// export const ROLES = {
//   ADMIN: 'admin',
//   INSTRUCTOR: 'instructor',
//   DEPARTMENT_HEAD: 'department_head',
//   DEAN: 'dean',
//   CDE_DIRECTOR: 'cde_director',
//   HR_DIRECTOR: 'hr_director',
//   VPAA: 'vpaa',
//   VPAF: 'vpaf',
//   FINANCE: 'finance',
//   REGISTRAR: 'registrar',
// };

// // Academic ranks
// export const ACADEMIC_RANKS = [
//   { value: 'graduate_assistant', label: 'Graduate Assistant' },
//   { value: 'assistant_lecturer', label: 'Assistant Lecturer' },
//   { value: 'lecturer', label: 'Lecturer' },
//   { value: 'assistant_professor', label: 'Assistant Professor' },
//   { value: 'associate_professor', label: 'Associate Professor' },
//   { value: 'professor', label: 'Professor' },
// ];

// // Program types
// export const PROGRAM_TYPES = [
//   { value: 'regular', label: 'Regular Program' },
//   { value: 'extension', label: 'Extension Program' },
//   { value: 'weekend', label: 'Weekend Program' },
//   { value: 'summer', label: 'Summer Program' },
//   { value: 'distance', label: 'Distance Program' },
// ];

// // Semester types
// export const SEMESTER_TYPES = [
//   { value: 'semester_i', label: 'Semester I' },
//   { value: 'semester_ii', label: 'Semester II' },
//   { value: 'summer', label: 'Summer' },
//   { value: 'distance', label: 'Distance' },
//   { value: 'extension', label: 'Extension' },
//   { value: 'weekend', label: 'Weekend' },
// ];

// // Workload statuses
// export const WORKLOAD_STATUSES = {
//   DRAFT: { value: 'draft', label: 'Draft', color: 'gray' },
//   SUBMITTED: { value: 'submitted', label: 'Submitted', color: 'blue' },
//   DH_APPROVED: { value: 'dh_approved', label: 'DH Approved', color: 'green' },
//   DEAN_APPROVED: { value: 'dean_approved', label: 'Dean Approved', color: 'green' },
//   HR_APPROVED: { value: 'hr_approved', label: 'HR Approved', color: 'green' },
//   VPAA_APPROVED: { value: 'vpaa_approved', label: 'VPAA Approved', color: 'green' },
//   VPAF_APPROVED: { value: 'vpaf_approved', label: 'VPAF Approved', color: 'green' },
//   FINANCE_APPROVED: { value: 'finance_approved', label: 'Finance Approved', color: 'green' },
//   REJECTED: { value: 'rejected', label: 'Rejected', color: 'red' },
// };

// User roles matching backend
export const ROLES = {
  ADMIN: 'admin',
  INSTRUCTOR: 'instructor',
  DEPARTMENT_HEAD: 'department_head',
  DEAN: 'dean',
  CDE_DIRECTOR: 'cde_director',
  HR_DIRECTOR: 'hr_director',
  VPAA: 'vpaa',
  VPAF: 'vpaf',
  FINANCE: 'finance',
  REGISTRAR: 'registrar',
};

// Academic ranks
export const ACADEMIC_RANKS = [
  { value: 'graduate_assistant', label: 'Graduate Assistant' },
  { value: 'assistant_lecturer', label: 'Assistant Lecturer' },
  { value: 'lecturer', label: 'Lecturer' },
  { value: 'assistant_professor', label: 'Assistant Professor' },
  { value: 'associate_professor', label: 'Associate Professor' },
  { value: 'professor', label: 'Professor' },
];

// Program types
export const PROGRAM_TYPES = [
  { value: 'regular', label: 'Regular Program' },
  { value: 'extension', label: 'Extension Program' },
  { value: 'weekend', label: 'Weekend Program' },
  { value: 'summer', label: 'Summer Program' },
  { value: 'distance', label: 'Distance Program' },
];

// Semester types
export const SEMESTER_TYPES = [
  { value: 'semester_i', label: 'Semester I' },
  { value: 'semester_ii', label: 'Semester II' },
  { value: 'summer', label: 'Summer' },
  { value: 'distance', label: 'Distance' },
  { value: 'extension', label: 'Extension' },
  { value: 'weekend', label: 'Weekend' },
];

// Workload statuses
export const WORKLOAD_STATUSES = {
  DRAFT: { value: 'draft', label: 'Draft', color: 'gray', tailwind: 'bg-gray-100 text-gray-800 border-gray-200' },
  SUBMITTED: { value: 'submitted', label: 'Submitted', color: 'blue', tailwind: 'bg-blue-100 text-blue-800 border-blue-200' },
  DH_APPROVED: { value: 'dh_approved', label: 'DH Approved', color: 'green', tailwind: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  DEAN_APPROVED: { value: 'dean_approved', label: 'Dean Approved', color: 'green', tailwind: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  HR_APPROVED: { value: 'hr_approved', label: 'HR Approved', color: 'green', tailwind: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  VPAA_APPROVED: { value: 'vpaa_approved', label: 'VPAA Approved', color: 'green', tailwind: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  VPAF_APPROVED: { value: 'vpaf_approved', label: 'VPAF Approved', color: 'green', tailwind: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  FINANCE_APPROVED: { value: 'finance_approved', label: 'Finance Approved', color: 'green', tailwind: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  REJECTED: { value: 'rejected', label: 'Rejected', color: 'red', tailwind: 'bg-red-100 text-red-800 border-red-200' },
};

// Workload types
export const WORKLOAD_TYPES = {
  RP: 'regular_program',
  NRP: 'non_regular_program',
  SUMMER: 'summer',
  CDE: 'cde',
};

// Payment statuses
export const PAYMENT_STATUSES = {
  PENDING: { value: 'pending', label: 'Pending', color: 'yellow' },
  PROCESSED: { value: 'processed', label: 'Processed', color: 'green' },
  APPROVED: { value: 'approved', label: 'Approved', color: 'blue' },
  REJECTED: { value: 'rejected', label: 'Rejected', color: 'red' },
  PAID: { value: 'paid', label: 'Paid', color: 'green' },
};

// Load threshold colors
export const LOAD_THRESHOLDS = {
  UNDERLOADED: { min: 0, max: 79, color: 'blue', label: 'Underloaded' },
  BALANCED: { min: 80, max: 100, color: 'green', label: 'Balanced' },
  APPROACHING_LIMIT: { min: 101, max: 119, color: 'yellow', label: 'Approaching Limit' },
  OVERLOADED: { min: 120, max: 139, color: 'orange', label: 'Overloaded' },
  CRITICAL: { min: 140, max: 200, color: 'red', label: 'Critical' },
};

// Academic levels
export const ACADEMIC_LEVELS = [
  { value: 'undergraduate', label: 'Undergraduate' },
  { value: 'graduate', label: 'Graduate' },
  { value: 'phd', label: 'PhD' },
  { value: 'diploma', label: 'Diploma' },
  { value: 'certificate', label: 'Certificate' },
];

// Course types
export const COURSE_TYPES = [
  { value: 'lecture', label: 'Lecture' },
  { value: 'lab', label: 'Laboratory' },
  { value: 'tutorial', label: 'Tutorial' },
  { value: 'seminar', label: 'Seminar' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'practical', label: 'Practical' },
  { value: 'thesis', label: 'Thesis' },
  { value: 'internship', label: 'Internship' },
];

// Gender options
export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

// Employment types
export const EMPLOYMENT_TYPES = [
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'visiting', label: 'Visiting' },
  { value: 'adjunct', label: 'Adjunct' },
];

// Timeframe options for filters
export const TIMEFRAME_OPTIONS = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'semester', label: 'This Semester' },
  { id: 'year', label: 'This Year' },
  { id: 'custom', label: 'Custom Range' },
];

// Export formats
export const EXPORT_FORMATS = [
  { value: 'excel', label: 'Excel (.xlsx)', icon: '📊' },
  { value: 'pdf', label: 'PDF (.pdf)', icon: '📄' },
  { value: 'csv', label: 'CSV (.csv)', icon: '📋' },
  { value: 'json', label: 'JSON (.json)', icon: '🔧' },
];

// System health statuses
export const SYSTEM_HEALTH_STATUSES = {
  HEALTHY: { value: 'healthy', label: 'Healthy', color: 'green' },
  WARNING: { value: 'warning', label: 'Warning', color: 'yellow' },
  CRITICAL: { value: 'critical', label: 'Critical', color: 'red' },
  OFFLINE: { value: 'offline', label: 'Offline', color: 'gray' },
};

// Helper functions
export const getWorkloadStatusInfo = (statusValue) => {
  const status = Object.values(WORKLOAD_STATUSES).find(s => s.value === statusValue);
  return status || WORKLOAD_STATUSES.DRAFT;
};

export const getLoadThreshold = (percentage) => {
  if (percentage <= LOAD_THRESHOLDS.UNDERLOADED.max) return LOAD_THRESHOLDS.UNDERLOADED;
  if (percentage <= LOAD_THRESHOLDS.BALANCED.max) return LOAD_THRESHOLDS.BALANCED;
  if (percentage <= LOAD_THRESHOLDS.APPROACHING_LIMIT.max) return LOAD_THRESHOLDS.APPROACHING_LIMIT;
  if (percentage <= LOAD_THRESHOLDS.OVERLOADED.max) return LOAD_THRESHOLDS.OVERLOADED;
  return LOAD_THRESHOLDS.CRITICAL;
};

export const formatAcademicRank = (rankValue) => {
  const rank = ACADEMIC_RANKS.find(r => r.value === rankValue);
  return rank ? rank.label : rankValue;
};

export const formatProgramType = (typeValue) => {
  const type = PROGRAM_TYPES.find(t => t.value === typeValue);
  return type ? type.label : typeValue;
};

export const formatSemesterType = (typeValue) => {
  const type = SEMESTER_TYPES.find(t => t.value === typeValue);
  return type ? type.label : typeValue;
};