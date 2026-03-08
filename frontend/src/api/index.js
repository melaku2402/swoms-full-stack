

// // src/utils/api/index.js - COMPLETE MATCHING VERSION
// import apiClient from './client';
// import workloadAPI from './workload';
// import academicAPI from './academic';
// import { courseAPI, courseUtils } from './course';
// import collegeAPI from './college';
// import authAPI from './auth';
// import departmentAPI from './department';
// import { courseAssignmentAPI, courseAssignmentUtils } from "./courseAssignment";
// import { courseRequestAPI, courseRequestUtils  } from "./courseRequest";
// import { exportAPI } from './export';
// import { programAPI } from './program';
// import {
//   overloadDetectionAPI,
//   overloadDetectionUtils,
// } from "./overloadDetection";
// import workloadRPAPI from './workloadRPAPI';
// import workloadNRPAPI from './workloadNRPAPI';
// import { paymentAPI } from './payment';
// import { systemAPI } from './system';
// import { rulesAPI } from './rules';
// import { staffAPI } from './staffAPI';
// import {semesterAPI,semesterUtils} from './semester'
// export default apiClient;

// // ================ COURSE API (UPDATED 

// export {
//   authAPI,
//   academicAPI,
//   collegeAPI,
//   courseAPI,          // Updated course API
//   courseUtils,        // Added course utilities
//   courseAssignmentAPI,
//   courseAssignmentUtils,
//   courseRequestAPI,
//   courseRequestUtils,
//   departmentAPI,
//   overloadDetectionAPI,
//   overloadDetectionUtils,
//   workloadNRPAPI,
//   workloadRPAPI,
//   paymentAPI,
//   systemAPI,
//   exportAPI,
//   programAPI ,
//  // roleRegistrationAPI,
//   rulesAPI,
//   staffAPI,
//   workloadAPI,
//   semesterAPI,
//   semesterUtils
// };

// src/api/index.js (Updated API integration)
import apiClient from "./client";

// Import all API modules
import workloadAPI from "./workload";
import academicAPI from "./academic";
import { courseAPI, courseUtils } from "./course";
import collegeAPI from "./college";
import authAPI from "./auth";
import departmentAPI from "./department";
import { courseAssignmentAPI, courseAssignmentUtils,useCourseAssignment } from "./courseAssignment";
import { courseRequestAPI, courseRequestUtils } from "./courseRequest";
import { exportAPI } from './export';
import { programAPI } from './program';
import { overloadDetectionAPI, overloadDetectionUtils } from "./overloadDetection";
import workloadRPAPI from './workloadRPAPI';
import workloadNRPAPI from './workloadNRPAPI';
import { paymentAPI } from './payment';
import { systemAPI } from './system';
import { rulesAPI } from './rules';
import { staffAPI, staffUtils } from "./staffAPI";
import { semesterAPI, semesterUtils } from './semester';
import { workloadDeptAPI,workloadDeptUtils } from "./workloadDeptAPI";
import workloadReportAPI from "./workloadReportAPI";
export default apiClient;

export {
  authAPI,
  academicAPI,
  collegeAPI,
  courseAPI,
  courseUtils,
  courseAssignmentAPI,
  courseAssignmentUtils,
  courseRequestAPI,
  courseRequestUtils,
  departmentAPI,
  overloadDetectionAPI,
  overloadDetectionUtils,
  workloadNRPAPI,
  workloadRPAPI,
  paymentAPI,
  systemAPI,
  exportAPI,
  programAPI,
  rulesAPI,
  staffAPI,
  staffUtils,
  workloadAPI,
  semesterAPI,
  semesterUtils,
  workloadDeptAPI,
  workloadDeptUtils,
 useCourseAssignment,
 workloadReportAPI
};