

// // src/pages/workload/CompleteWorkloadManager.jsx
// import React, { useState, useEffect, useRef } from "react";
// import { Link, useNavigate, useParams } from "react-router-dom";
// import {
//   FileText,
//   Plus,
//   Edit,
//   Trash2,
//   CheckCircle,
//   XCircle,
//   Clock,
//   AlertCircle,
//   Download,
//   Filter,
//   Search,
//   RefreshCw,
//   Eye,
//   Calendar,
//   BookOpen,
//   DollarSign,
//   ChevronDown,
//   Save,
//   Send,
//   X,
//   AlertTriangle,
// } from "lucide-react";
// import toast from "react-hot-toast";
// import { format } from "date-fns";
// import { useAuth } from "../../contexts/AuthContext";

// // API imports
// import {
//   semesterAPI,
//   courseAPI,
//   staffAPI,
//   workloadRPAPI,
//   workloadNRPAPI,
// } from "../../api";


// const formatDate = (dateString) => {
//   if (!dateString) return "N/A";
//   try {
//     return format(new Date(dateString), "MMM dd, yyyy");
//   } catch {
//     return dateString;
//   }
// };

// // const formatCurrency = (amount) => {
// //   if (!amount) return "0.00";
// //   return parseFloat(amount).toLocaleString("en-ET", {
// //     minimumFractionDigits: 2,
// //     maximumFractionDigits: 2,
// //   });
// // };
// const CompleteWorkloadManager = () => {

//   const { user } = useAuth();
//   const navigate = useNavigate();
//   const { workloadId, workloadType } = useParams();

//   // State for workload type (RP or NRP)
//   const [activeTab, setActiveTab] = useState(workloadType || "rp");
//   const [loading, setLoading] = useState({
//     workloads: true,
//     semesters: true,
//     courses: true,
//     form: false,
//   });

//   // Data states
//   const [workloads, setWorkloads] = useState({
//     rp: [],
//     nrp: [],
//   });
//   const [filteredWorkloads, setFilteredWorkloads] = useState([]);
//   const [semesters, setSemesters] = useState([]);
//   const [courses, setCourses] = useState([]);
//   const [staffMembers, setStaffMembers] = useState([]);
//   const [activeSemester, setActiveSemester] = useState(null);

//   // Form states
//   const [showForm, setShowForm] = useState(false);
//   const [editMode, setEditMode] = useState(false);
//   const [currentWorkload, setCurrentWorkload] = useState(null);

//   // RP Form fields
//   const [rpForm, setRpForm] = useState({
//     staff_id: "",
//     semester_id: "",
//     course_code: "",
//     course_credit_hours: "",
//     lecture_credit_hours: "",
//     tutorial_credit_hours: "",
//     lab_credit_hours: "",
//     student_department: "",
//     academic_year: "",
//     number_of_sections: 1,
//     each_section_course_load: "",
//     variety_of_course_load: "",
//     research_load: "",
//     community_service_load: "",
//     elip_load: "",
//     hdp_load: "",
//     course_chair_load: "",
//     section_advisor_load: "",
//     advising_load: "",
//     position_load: "",
//     total_load: "",
//     over_payment_birr: "",
//     status: "draft",
//   });

//   // NRP Form fields
//   const [nrpForm, setNrpForm] = useState({
//     staff_id: "",
//     semester_id: "",
//     program_type: "extension",
//     contract_number: "",
//     academic_year: "",
//     academic_year_ec: "",
//     contract_type: "teaching",
//     course_id: "",
//     course_code: "",
//     course_title: "",
//     credit_hours: "",
//     lecture_credit_hours: "",
//     lab_credit_hours: "",
//     tutorial_credit_hours: "",
//     lecture_sections: 0,
//     lab_sections: 0,
//     teaching_hours: "",
//     module_hours: "",
//     student_count: 0,
//     assignment_students: 0,
//     exam_students: 0,
//     project_advising: "",
//     project_groups: 0,
//     rate_category: "default",
//     rate_per_rank: "",
//     assignment_rate: "25.00",
//     exam_rate: "20.00",
//     tutorial_rate_per_hour: "100.00",
//     teaching_payment: "",
//     tutorial_payment: "",
//     assignment_payment: "",
//     exam_payment: "",
//     project_payment: "",
//     total_payment: "",
//     total_hours_worked: "",
//     contract_duration_from: "",
//     contract_duration_to: "",
//     is_overload: false,
//     overload_hours: "",
//     overload_payment: "",
//     status: "draft",
//   });

//   // Filters
//   const [filters, setFilters] = useState({
//     status: "all",
//     semester: "all",
//     search: "",
//     program_type: "all",
//   });

//   // Stats
//   const [stats, setStats] = useState({
//     rp: {
//       total: 0,
//       draft: 0,
//       submitted: 0,
//       approved: 0,
//       totalHours: 0,
//       totalPayment: 0,
//     },
//     nrp: {
//       total: 0,
//       draft: 0,
//       submitted: 0,
//       approved: 0,
//       totalHours: 0,
//       totalPayment: 0,
//     },
//   });

//   // Modal states
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [showDetailsModal, setShowDetailsModal] = useState(false);
//   const [showSubmitModal, setShowSubmitModal] = useState(false);
//   const [selectedWorkload, setSelectedWorkload] = useState(null);

//   // Refs
//   const formRef = useRef(null);

//   // Load initial data
//   useEffect(() => {
//     fetchAllData();
//   }, []);

//   // Filter workloads when filters change
//   useEffect(() => {
//     filterWorkloads();
//   }, [workloads, filters, activeTab]);

//   // Set edit mode if workloadId is provided
//   useEffect(() => {
//     if (workloadId) {
//       handleEditWorkload(workloadId);
//     }
//   }, [workloadId]);

//   const fetchAllData = async () => {
//     try {
//       setLoading((prev) => ({
//         ...prev,
//         workloads: true,
//         semesters: true,
//         courses: true,
//       }));

//       // Fetch semesters - CORRECTED: Response is {semesters: [], pagination: {}}
//       const semestersResponse = await semesterAPI.getAllSemesters();
//       console.log("Full semesters response:", semestersResponse);
      
//       // Extract the semesters array from the response object
//       const semestersData = semestersResponse.semesters || 
//                            (semestersResponse.data && semestersResponse.data.semesters) || 
//                            [];
//       console.log("Extracted semesters:", semestersData);
//       setSemesters(semestersData);

//       // Fetch active semester
//       if (semestersData.length > 0) {
//         const active = semestersData.find((s) => s.is_active) || semestersData[0];
//         setActiveSemester(active);
//       }

//       // Fetch courses - CORRECTED: Response is {courses: [], pagination: {}}
//       const coursesResponse = await courseAPI.getAllCourses();
//       console.log("Full courses response:", coursesResponse);
      
//       // Extract the courses array from the response object
//       const coursesData = coursesResponse.courses || 
//                          (coursesResponse.data && coursesResponse.data.courses) || 
//                          [];
//       console.log("Extracted courses:", coursesData);
//       setCourses(coursesData);

//       // Fetch staff members (for admin/dept head/dean)
//       if (["admin", "department_head", "dean"].includes(user?.role)) {
//         const staffResponse = await staffAPI.getAllStaff();
//         // Extract the staff array from the response object
//         const staffData = staffResponse.staff || 
//                          (staffResponse.data && staffResponse.data.staff) || 
//                          staffResponse.data || 
//                          [];
//         console.log("Extracted staff:", staffData);
//         setStaffMembers(staffData);
//       }

//       // Fetch workloads
//       await fetchWorkloads();
//     } catch (error) {
//       console.error("Error fetching data:", error);
//       toast.error("Failed to load data");
//     } finally {
//       setLoading((prev) => ({
//         ...prev,
//         workloads: false,
//         semesters: false,
//         courses: false,
//       }));
//     }
//   };

//   const fetchWorkloads = async () => {
//     try {
//       // Fetch RP workloads - CORRECTED: Response is {workloads: [], pagination: {}}
//       const rpResponse = await workloadRPAPI.getAllWorkloads({
//         staff_id: user?.role === "instructor" ? user.staff_id : undefined,
//       });
//       console.log("Full RP response:", rpResponse);
      
//       // Extract the workloads array from the response object
//       const rpData = rpResponse.workloads || 
//                     (rpResponse.data && rpResponse.data.workloads) || 
//                     [];
//       console.log("Extracted RP workloads:", rpData);

//       // Fetch NRP workloads - CORRECTED: Response is {workloads: [], pagination: {}}
//       const nrpResponse = await workloadNRPAPI.getAllNRPWorkloads({
//         staff_id: user?.role === "instructor" ? user.staff_id : undefined,
//       });
//       console.log("Full NRP response:", nrpResponse);
      
//       // Extract the workloads array from the response object
//       const nrpData = nrpResponse.workloads || 
//                      (nrpResponse.data && nrpResponse.data.workloads) || 
//                      [];
//       console.log("Extracted NRP workloads:", nrpData);

//       setWorkloads({
//         rp: rpData,
//         nrp: nrpData,
//       });

//       // Calculate stats
//       calculateStats(rpData, nrpData);
//     } catch (error) {
//       console.error("Error fetching workloads:", error);
//       toast.error("Failed to load workloads");
//     }
//   };

//   const calculateStats = (rpWorkloads, nrpWorkloads) => {
//     // Ensure both parameters are arrays
//     const rpArray = Array.isArray(rpWorkloads) ? rpWorkloads : [];
//     const nrpArray = Array.isArray(nrpWorkloads) ? nrpWorkloads : [];

//     console.log("Calculating stats for RP:", rpArray);
//     console.log("Calculating stats for NRP:", nrpArray);

//     // RP Stats
//     const rpStats = {
//       total: rpArray.length,
//       draft: rpArray.filter((w) => w.status === "draft").length,
//       submitted: rpArray.filter((w) => w.status === "submitted").length,
//       approved: rpArray.filter((w) => w.status?.includes("approved")).length,
//       totalHours: rpArray.reduce(
//         (sum, w) => sum + (parseFloat(w.total_load) || 0),
//         0
//       ),
//       totalPayment: rpArray.reduce(
//         (sum, w) => sum + (parseFloat(w.over_payment_birr) || 0),
//         0
//       ),
//     };

//     // NRP Stats
//     const nrpStats = {
//       total: nrpArray.length,
//       draft: nrpArray.filter((w) => w.status === "draft").length,
//       submitted: nrpArray.filter((w) => w.status === "submitted").length,
//       approved: nrpArray.filter((w) =>
//         ["finance_approved", "paid"].includes(w.status)
//       ).length,
//       totalHours: nrpArray.reduce(
//         (sum, w) => sum + (parseFloat(w.total_hours_worked) || 0),
//         0
//       ),
//       totalPayment: nrpArray.reduce(
//         (sum, w) => sum + (parseFloat(w.total_payment) || 0),
//         0
//       ),
//     };

//     console.log("RP Stats:", rpStats);
//     console.log("NRP Stats:", nrpStats);

//     setStats({ rp: rpStats, nrp: nrpStats });
//   };

//   const filterWorkloads = () => {
//     // Get current workloads based on active tab
//     const currentWorkloads = activeTab === "rp" ? workloads.rp : workloads.nrp;
    
//     // Ensure it's an array
//     const workloadsArray = Array.isArray(currentWorkloads) ? currentWorkloads : [];
    
//     console.log(`Filtering ${activeTab} workloads:`, workloadsArray);

//     let filtered = [...workloadsArray];

//     // Apply status filter
//     if (filters.status !== "all") {
//       filtered = filtered.filter((w) => w.status === filters.status);
//     }

//     // Apply semester filter
//     if (filters.semester !== "all") {
//       filtered = filtered.filter(
//         (w) => w.semester_id?.toString() === filters.semester
//       );
//     }

//     // Apply program type filter (for NRP)
//     if (activeTab === "nrp" && filters.program_type !== "all") {
//       filtered = filtered.filter(
//         (w) => w.program_type === filters.program_type
//       );
//     }

//     // Apply search filter
//     if (filters.search) {
//       const searchLower = filters.search.toLowerCase();
//       filtered = filtered.filter(
//         (w) =>
//           w.course_code?.toLowerCase().includes(searchLower) ||
//           w.course_title?.toLowerCase().includes(searchLower) ||
//           (activeTab === "nrp" &&
//             w.contract_number?.toLowerCase().includes(searchLower))
//       );
//     }

//     console.log("Filtered workloads:", filtered);
//     setFilteredWorkloads(filtered);
//   };

//   const handleTabChange = (tab) => {
//     setActiveTab(tab);
//     setShowForm(false);
//     setEditMode(false);
//     setCurrentWorkload(null);
//   };

//   const handleNewWorkload = () => {
//     setShowForm(true);
//     setEditMode(false);
//     setCurrentWorkload(null);

//     // Reset forms
//     if (activeTab === "rp") {
//       setRpForm({
//         staff_id: user?.role === "instructor" ? user.staff_id : "",
//         semester_id: activeSemester?.semester_id || "",
//         course_code: "",
//         course_credit_hours: "",
//         lecture_credit_hours: "",
//         tutorial_credit_hours: "",
//         lab_credit_hours: "",
//         student_department: "",
//         academic_year: "",
//         number_of_sections: 1,
//         each_section_course_load: "",
//         variety_of_course_load: "",
//         research_load: "",
//         community_service_load: "",
//         elip_load: "",
//         hdp_load: "",
//         course_chair_load: "",
//         section_advisor_load: "",
//         advising_load: "",
//         position_load: "",
//         total_load: "",
//         over_payment_birr: "",
//         status: "draft",
//       });
//     } else {
//       setNrpForm({
//         staff_id: user?.role === "instructor" ? user.staff_id : "",
//         semester_id: activeSemester?.semester_id || "",
//         program_type: "extension",
//         contract_number: `CONTRACT-${Date.now()}`,
//         academic_year: new Date().getFullYear().toString(),
//         academic_year_ec: "",
//         contract_type: "teaching",
//         course_id: "",
//         course_code: "",
//         course_title: "",
//         credit_hours: "",
//         lecture_credit_hours: "",
//         lab_credit_hours: "",
//         tutorial_credit_hours: "",
//         lecture_sections: 0,
//         lab_sections: 0,
//         teaching_hours: "",
//         module_hours: "",
//         student_count: 0,
//         assignment_students: 0,
//         exam_students: 0,
//         project_advising: "",
//         project_groups: 0,
//         rate_category: "default",
//         rate_per_rank: "",
//         assignment_rate: "25.00",
//         exam_rate: "20.00",
//         tutorial_rate_per_hour: "100.00",
//         teaching_payment: "",
//         tutorial_payment: "",
//         assignment_payment: "",
//         exam_payment: "",
//         project_payment: "",
//         total_payment: "",
//         total_hours_worked: "",
//         contract_duration_from: "",
//         contract_duration_to: "",
//         is_overload: false,
//         overload_hours: "",
//         overload_payment: "",
//         status: "draft",
//       });
//     }

//     // Scroll to form
//     setTimeout(() => {
//       formRef.current?.scrollIntoView({ behavior: "smooth" });
//     }, 100);
//   };

//   const handleEditWorkload = (id) => {
//     // Get the correct workloads array
//     const workloadsArray = activeTab === "rp" ? workloads.rp : workloads.nrp;
    
//     // Ensure it's an array
//     if (!Array.isArray(workloadsArray)) {
//       toast.error("Cannot edit: Workloads data is not available");
//       return;
//     }
    
//     const workload = workloadsArray.find(
//       (w) => w[activeTab === "rp" ? "workload_id" : "nrp_id"] === parseInt(id)
//     );

//     if (workload) {
//       setCurrentWorkload(workload);
//       setEditMode(true);
//       setShowForm(true);

//       if (activeTab === "rp") {
//         setRpForm({
//           staff_id: workload.staff_id || "",
//           semester_id: workload.semester_id || "",
//           course_code: workload.course_code || "",
//           course_credit_hours: workload.course_credit_hours || "",
//           lecture_credit_hours: workload.lecture_credit_hours || "",
//           tutorial_credit_hours: workload.tutorial_credit_hours || "",
//           lab_credit_hours: workload.lab_credit_hours || "",
//           student_department: workload.student_department || "",
//           academic_year: workload.academic_year || "",
//           number_of_sections: workload.number_of_sections || 1,
//           each_section_course_load: workload.each_section_course_load || "",
//           variety_of_course_load: workload.variety_of_course_load || "",
//           research_load: workload.research_load || "",
//           community_service_load: workload.community_service_load || "",
//           elip_load: workload.elip_load || "",
//           hdp_load: workload.hdp_load || "",
//           course_chair_load: workload.course_chair_load || "",
//           section_advisor_load: workload.section_advisor_load || "",
//           advising_load: workload.advising_load || "",
//           position_load: workload.position_load || "",
//           total_load: workload.total_load || "",
//           over_payment_birr: workload.over_payment_birr || "",
//           status: workload.status || "draft",
//         });
//       } else {
//         setNrpForm({
//           staff_id: workload.staff_id || "",
//           semester_id: workload.semester_id || "",
//           program_type: workload.program_type || "extension",
//           contract_number: workload.contract_number || `CONTRACT-${Date.now()}`,
//           academic_year: workload.academic_year || new Date().getFullYear().toString(),
//           academic_year_ec: workload.academic_year_ec || "",
//           contract_type: workload.contract_type || "teaching",
//           course_id: workload.course_id || "",
//           course_code: workload.course_code || "",
//           course_title: workload.course_title || "",
//           credit_hours: workload.credit_hours || "",
//           lecture_credit_hours: workload.lecture_credit_hours || "",
//           lab_credit_hours: workload.lab_credit_hours || "",
//           tutorial_credit_hours: workload.tutorial_credit_hours || "",
//           lecture_sections: workload.lecture_sections || 0,
//           lab_sections: workload.lab_sections || 0,
//           teaching_hours: workload.teaching_hours || "",
//           module_hours: workload.module_hours || "",
//           student_count: workload.student_count || 0,
//           assignment_students: workload.assignment_students || 0,
//           exam_students: workload.exam_students || 0,
//           project_advising: workload.project_advising || "",
//           project_groups: workload.project_groups || 0,
//           rate_category: workload.rate_category || "default",
//           rate_per_rank: workload.rate_per_rank || "",
//           assignment_rate: workload.assignment_rate || "25.00",
//           exam_rate: workload.exam_rate || "20.00",
//           tutorial_rate_per_hour: workload.tutorial_rate_per_hour || "100.00",
//           teaching_payment: workload.teaching_payment || "",
//           tutorial_payment: workload.tutorial_payment || "",
//           assignment_payment: workload.assignment_payment || "",
//           exam_payment: workload.exam_payment || "",
//           project_payment: workload.project_payment || "",
//           total_payment: workload.total_payment || "",
//           total_hours_worked: workload.total_hours_worked || "",
//           contract_duration_from: workload.contract_duration_from || "",
//           contract_duration_to: workload.contract_duration_to || "",
//           is_overload: workload.is_overload || false,
//           overload_hours: workload.overload_hours || "",
//           overload_payment: workload.overload_payment || "",
//           status: workload.status || "draft",
//         });
//       }

//       // Scroll to form
//       setTimeout(() => {
//         formRef.current?.scrollIntoView({ behavior: "smooth" });
//       }, 100);
//     } else {
//       toast.error("Workload not found");
//     }
//   };

//   const handleViewDetails = (workload) => {
//     setSelectedWorkload(workload);
//     setShowDetailsModal(true);
//   };

//   const handleDeleteClick = (workload) => {
//     setSelectedWorkload(workload);
//     setShowDeleteModal(true);
//   };

//   const handleSubmitClick = (workload) => {
//     setSelectedWorkload(workload);
//     setShowSubmitModal(true);
//   };

//   const handleDeleteConfirm = async () => {
//     if (!selectedWorkload) return;

//     try {
//       setLoading((prev) => ({ ...prev, form: true }));

//       if (activeTab === "rp") {
//         await workloadRPAPI.deleteWorkload(selectedWorkload.workload_id);
//       } else {
//         await workloadNRPAPI.deleteNRPWorkload(selectedWorkload.nrp_id);
//       }

//       toast.success("Workload deleted successfully");
//       await fetchWorkloads();
//       setShowDeleteModal(false);
//       setSelectedWorkload(null);
//     } catch (error) {
//       console.error("Error deleting workload:", error);
//       toast.error("Failed to delete workload");
//     } finally {
//       setLoading((prev) => ({ ...prev, form: false }));
//     }
//   };

//   const handleSubmitConfirm = async () => {
//     if (!selectedWorkload) return;

//     try {
//       setLoading((prev) => ({ ...prev, form: true }));

//       if (activeTab === "rp") {
//         await workloadRPAPI.submitWorkload(selectedWorkload.workload_id);
//       } else {
//         await workloadNRPAPI.submitForApproval(selectedWorkload.nrp_id);
//       }

//       toast.success("Workload submitted for approval");
//       await fetchWorkloads();
//       setShowSubmitModal(false);
//       setSelectedWorkload(null);
//     } catch (error) {
//       console.error("Error submitting workload:", error);
//       toast.error("Failed to submit workload");
//     } finally {
//       setLoading((prev) => ({ ...prev, form: false }));
//     }
//   };

//   const handleRpFormChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setRpForm((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value,
//     }));

//     // Auto-calculate total load if component values change
//     if (name.includes("load") && name !== "total_load") {
//       setTimeout(calculateRpTotalLoad, 100);
//     }
//   };

//   const calculateRpTotalLoad = () => {
//     const courseLoad =
//       (parseFloat(rpForm.each_section_course_load) || 0) *
//       (parseInt(rpForm.number_of_sections) || 1);
//     const varietyLoad = parseFloat(rpForm.variety_of_course_load) || 0;
//     const researchLoad = parseFloat(rpForm.research_load) || 0;
//     const communityLoad = parseFloat(rpForm.community_service_load) || 0;
//     const elipLoad = parseFloat(rpForm.elip_load) || 0;
//     const hdpLoad = parseFloat(rpForm.hdp_load) || 0;
//     const courseChairLoad = parseFloat(rpForm.course_chair_load) || 0;
//     const sectionAdvisorLoad = parseFloat(rpForm.section_advisor_load) || 0;
//     const advisingLoad = parseFloat(rpForm.advising_load) || 0;
//     const positionLoad = parseFloat(rpForm.position_load) || 0;

//     const totalLoad =
//       courseLoad +
//       varietyLoad +
//       researchLoad +
//       communityLoad +
//       elipLoad +
//       hdpLoad +
//       courseChairLoad +
//       sectionAdvisorLoad +
//       advisingLoad +
//       positionLoad;

//     setRpForm((prev) => ({
//       ...prev,
//       total_load: totalLoad.toFixed(2),
//     }));
//   };

//   const handleNrpFormChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setNrpForm((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value,
//     }));

//     // Auto-calculate if payment-related fields change
//     if (
//       name.includes("payment") ||
//       name.includes("hours") ||
//       name === "rate_per_rank"
//     ) {
//       setTimeout(calculateNrpPayments, 100);
//     }
//   };

//   const calculateNrpPayments = () => {
//     // Calculate teaching payment based on hours and rate
//     const teachingHours = parseFloat(nrpForm.teaching_hours) || 0;
//     const moduleHours = parseFloat(nrpForm.module_hours) || 0;
//     const ratePerRank = parseFloat(nrpForm.rate_per_rank) || 500;

//     let teachingPayment = 0;
//     let totalHours = 0;

//     switch (nrpForm.program_type) {
//       case "extension":
//       case "weekend":
//         const creditHours = parseFloat(nrpForm.credit_hours) || 0;
//         teachingPayment = creditHours * ratePerRank;
//         totalHours = creditHours * 15; // Assuming 15 hours per credit
//         break;
//       case "summer":
//         teachingPayment = teachingHours * ratePerRank;
//         totalHours = teachingHours;
//         break;
//       case "distance":
//         teachingPayment = moduleHours * ratePerRank;
//         totalHours = moduleHours;
//         break;
//       default:
//         teachingPayment = (parseFloat(nrpForm.credit_hours) || 0) * ratePerRank;
//         totalHours = (parseFloat(nrpForm.credit_hours) || 0) * 15;
//     }

//     // Calculate additional payments
//     const assignmentPayment =
//       (parseInt(nrpForm.assignment_students) || 0) *
//       (parseFloat(nrpForm.assignment_rate) || 25);
//     const examPayment =
//       (parseInt(nrpForm.exam_students) || 0) *
//       (parseFloat(nrpForm.exam_rate) || 20);
//     const tutorialPayment =
//       (parseFloat(nrpForm.tutorial_credit_hours) || 0) *
//       (parseFloat(nrpForm.tutorial_rate_per_hour) || 100);
//     const overloadPayment =
//       (parseFloat(nrpForm.overload_hours) || 0) * (ratePerRank * 1.5); // 150% for overload

//     const totalPayment =
//       teachingPayment +
//       assignmentPayment +
//       examPayment +
//       tutorialPayment +
//       overloadPayment;

//     setNrpForm((prev) => ({
//       ...prev,
//       teaching_payment: teachingPayment.toFixed(2),
//       assignment_payment: assignmentPayment.toFixed(2),
//       exam_payment: examPayment.toFixed(2),
//       tutorial_payment: tutorialPayment.toFixed(2),
//       overload_payment: overloadPayment.toFixed(2),
//       total_payment: totalPayment.toFixed(2),
//       total_hours_worked: totalHours.toFixed(2),
//     }));
//   };

//   const handleRpSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       setLoading((prev) => ({ ...prev, form: true }));

//       const formData = {
//         ...rpForm,
//         staff_id: user?.role === "instructor" ? user.staff_id : rpForm.staff_id,
//         course_credit_hours: parseFloat(rpForm.course_credit_hours) || 0,
//         lecture_credit_hours: parseFloat(rpForm.lecture_credit_hours) || 0,
//         tutorial_credit_hours: parseFloat(rpForm.tutorial_credit_hours) || 0,
//         lab_credit_hours: parseFloat(rpForm.lab_credit_hours) || 0,
//         number_of_sections: parseInt(rpForm.number_of_sections) || 1,
//         each_section_course_load:
//           parseFloat(rpForm.each_section_course_load) || 0,
//         variety_of_course_load: parseFloat(rpForm.variety_of_course_load) || 0,
//         research_load: parseFloat(rpForm.research_load) || 0,
//         community_service_load: parseFloat(rpForm.community_service_load) || 0,
//         elip_load: parseFloat(rpForm.elip_load) || 0,
//         hdp_load: parseFloat(rpForm.hdp_load) || 0,
//         course_chair_load: parseFloat(rpForm.course_chair_load) || 0,
//         section_advisor_load: parseFloat(rpForm.section_advisor_load) || 0,
//         advising_load: parseFloat(rpForm.advising_load) || 0,
//         position_load: parseFloat(rpForm.position_load) || 0,
//         total_load: parseFloat(rpForm.total_load) || 0,
//         over_payment_birr: parseFloat(rpForm.over_payment_birr) || 0,
//       };

//       if (editMode && currentWorkload) {
//         await workloadRPAPI.updateWorkload(
//           currentWorkload.workload_id,
//           formData
//         );
//         toast.success("RP workload updated successfully");
//       } else {
//         await workloadRPAPI.createWorkload(formData);
//         toast.success("RP workload created successfully");
//       }

//       // Reset and refresh
//       setShowForm(false);
//       setEditMode(false);
//       setCurrentWorkload(null);
//       await fetchWorkloads();
//     } catch (error) {
//       console.error("Error saving RP workload:", error);
//       toast.error(error.response?.data?.message || "Failed to save workload");
//     } finally {
//       setLoading((prev) => ({ ...prev, form: false }));
//     }
//   };

//   const handleNrpSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       setLoading((prev) => ({ ...prev, form: true }));

//       const formData = {
//         ...nrpForm,
//         staff_id:
//           user?.role === "instructor" ? user.staff_id : nrpForm.staff_id,
//         credit_hours: parseFloat(nrpForm.credit_hours) || 0,
//         lecture_credit_hours: parseFloat(nrpForm.lecture_credit_hours) || 0,
//         lab_credit_hours: parseFloat(nrpForm.lab_credit_hours) || 0,
//         tutorial_credit_hours: parseFloat(nrpForm.tutorial_credit_hours) || 0,
//         lecture_sections: parseInt(nrpForm.lecture_sections) || 0,
//         lab_sections: parseInt(nrpForm.lab_sections) || 0,
//         teaching_hours: parseFloat(nrpForm.teaching_hours) || 0,
//         module_hours: parseFloat(nrpForm.module_hours) || 0,
//         student_count: parseInt(nrpForm.student_count) || 0,
//         assignment_students: parseInt(nrpForm.assignment_students) || 0,
//         exam_students: parseInt(nrpForm.exam_students) || 0,
//         project_groups: parseInt(nrpForm.project_groups) || 0,
//         rate_per_rank: parseFloat(nrpForm.rate_per_rank) || 0,
//         assignment_rate: parseFloat(nrpForm.assignment_rate) || 25.0,
//         exam_rate: parseFloat(nrpForm.exam_rate) || 20.0,
//         tutorial_rate_per_hour:
//           parseFloat(nrpForm.tutorial_rate_per_hour) || 100.0,
//         teaching_payment: parseFloat(nrpForm.teaching_payment) || 0,
//         tutorial_payment: parseFloat(nrpForm.tutorial_payment) || 0,
//         assignment_payment: parseFloat(nrpForm.assignment_payment) || 0,
//         exam_payment: parseFloat(nrpForm.exam_payment) || 0,
//         project_payment: parseFloat(nrpForm.project_payment) || 0,
//         total_payment: parseFloat(nrpForm.total_payment) || 0,
//         total_hours_worked: parseFloat(nrpForm.total_hours_worked) || 0,
//         overload_hours: parseFloat(nrpForm.overload_hours) || 0,
//         overload_payment: parseFloat(nrpForm.overload_payment) || 0,
//         is_overload: nrpForm.is_overload ? 1 : 0,
//       };

//       if (editMode && currentWorkload) {
//         await workloadNRPAPI.updateNRPWorkload(
//           currentWorkload.nrp_id,
//           formData
//         );
//         toast.success("NRP workload updated successfully");
//       } else {
//         await workloadNRPAPI.createNRPWorkload(formData);
//         toast.success("NRP workload created successfully");
//       }

//       // Reset and refresh
//       setShowForm(false);
//       setEditMode(false);
//       setCurrentWorkload(null);
//       await fetchWorkloads();
//     } catch (error) {
//       console.error("Error saving NRP workload:", error);
//       toast.error(error.response?.data?.message || "Failed to save workload");
//     } finally {
//       setLoading((prev) => ({ ...prev, form: false }));
//     }
//   };

//   const handleCourseSelect = (courseId) => {
//     // Ensure courses is an array and courseId is valid
//     if (!Array.isArray(courses) || !courseId || courses.length === 0) {
//       return;
//     }
    
//     const course = courses.find((c) => c.course_id === parseInt(courseId));
//     if (course) {
//       if (activeTab === "rp") {
//         setRpForm((prev) => ({
//           ...prev,
//           course_code: course.course_code || "",
//           course_credit_hours: course.credit_hours || "",
//           lecture_credit_hours: course.lecture_hours || "",
//           lab_credit_hours: course.lab_hours || "",
//           tutorial_credit_hours: course.tutorial_hours || "",
//         }));
//       } else {
//         setNrpForm((prev) => ({
//           ...prev,
//           course_id: course.course_id || "",
//           course_code: course.course_code || "",
//           course_title: course.course_title || "",
//           credit_hours: course.credit_hours || "",
//           lecture_credit_hours: course.lecture_hours || "",
//           lab_credit_hours: course.lab_hours || "",
//           tutorial_credit_hours: course.tutorial_hours || "",
//         }));
//       }
//     }
//   };

//   const getStatusColor = (status) => {
//     const statusMap = {
//       draft: { bg: "bg-gray-100", text: "text-gray-800", icon: Clock },
//       submitted: {
//         bg: "bg-blue-100",
//         text: "text-blue-800",
//         icon: AlertCircle,
//       },
//       dh_approved: {
//         bg: "bg-amber-100",
//         text: "text-amber-800",
//         icon: CheckCircle,
//       },
//       dean_approved: {
//         bg: "bg-purple-100",
//         text: "text-purple-800",
//         icon: CheckCircle,
//       },
//       hr_approved: {
//         bg: "bg-indigo-100",
//         text: "text-indigo-800",
//         icon: CheckCircle,
//       },
//       vpaa_approved: {
//         bg: "bg-pink-100",
//         text: "text-pink-800",
//         icon: CheckCircle,
//       },
//       vpaf_approved: {
//         bg: "bg-rose-100",
//         text: "text-rose-800",
//         icon: CheckCircle,
//       },
//       finance_approved: {
//         bg: "bg-green-100",
//         text: "text-green-800",
//         icon: CheckCircle,
//       },
//       cde_approved: {
//         bg: "bg-teal-100",
//         text: "text-teal-800",
//         icon: CheckCircle,
//       },
//       paid: {
//         bg: "bg-emerald-100",
//         text: "text-emerald-800",
//         icon: CheckCircle,
//       },
//       rejected: { bg: "bg-red-100", text: "text-red-800", icon: XCircle },
//     };

//     return statusMap[status] || statusMap.draft;
//   };

//   const getStatusText = (status) => {
//     const statusMap = {
//       draft: "Draft",
//       submitted: "Submitted",
//       dh_approved: "Dept Head Approved",
//       dean_approved: "Dean Approved",
//       hr_approved: "HR Approved",
//       vpaa_approved: "VPAA Approved",
//       vpaf_approved: "VPAF Approved",
//       finance_approved: "Finance Approved",
//       cde_approved: "CDE Approved",
//       paid: "Paid",
//       rejected: "Rejected",
//     };

//     return statusMap[status] || status;
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return "N/A";
//     try {
//       return format(new Date(dateString), "MMM dd, yyyy");
//     } catch {
//       return dateString;
//     }
//   };

//   const formatCurrency = (amount) => {
//     if (!amount) return "0.00";
//     return parseFloat(amount).toLocaleString("en-ET", {
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2,
//     });
//   };

//   // Loading state - Wait for semesters and courses to load
//   if (loading.semesters || loading.courses) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading workload manager...</p>
//         </div>
//       </div>
//     );
//   }

//   // Debug logging
//   console.log("Current state:", {
//     semesters: semesters,
//     courses: courses,
//     workloads: workloads,
//     filteredWorkloads: filteredWorkloads,
//     stats: stats,
//     activeTab: activeTab,
//     rpData: workloads.rp,
//     nrpData: workloads.nrp,
//   });

//   const currentStats = activeTab === "rp" ? stats.rp : stats.nrp;

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
//       {/* Header */}
//       <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-b-2xl shadow-lg">
//         <div className="container mx-auto px-6 py-8">
//           <div className="flex flex-col md:flex-row md:items-center justify-between">
//             <div>
//               <h1 className="text-3xl font-bold mb-2">
//                 {activeTab === "rp" ? "Regular Program" : "Non-Regular Program"}{" "}
//                 Workload Management
//               </h1>
//               <p className="text-blue-100">
//                 {activeTab === "rp"
//                   ? "Manage your regular teaching workload and administrative duties"
//                   : "Manage extension, weekend, summer, and distance program workloads"}
//               </p>
//             </div>
//             <div className="flex items-center space-x-3 mt-4 md:mt-0">
//               <button
//                 onClick={fetchWorkloads}
//                 className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg flex items-center space-x-2 transition-colors"
//               >
//                 <RefreshCw className="h-4 w-4" />
//                 <span>Refresh</span>
//               </button>
//               <button
//                 onClick={handleNewWorkload}
//                 className="px-4 py-2 bg-white hover:text-blue-600 text-blue-600 rounded-lg flex items-center space-x-2 transition-colors"
//                 disabled={loading.form}
//               >
//                 <Plus className="h-4 w-4" />
//                 <span>New Workload</span>
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Tabs */}
//       <div className="container mx-auto px-6 py-6 -mt-4">
//         <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
//           <div className="flex border-b">
//             <button
//               onClick={() => handleTabChange("rp")}
//               className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
//                 activeTab === "rp"
//                   ? "text-blue-600 border-b-2 border-blue-600"
//                   : "text-gray-600 hover:text-gray-900"
//               }`}
//             >
//               <div className="flex items-center justify-center space-x-2">
//                 <BookOpen className="h-5 w-5" />
//                 <span>Regular Program (RP)</span>
//               </div>
//             </button>
//             <button
//               onClick={() => handleTabChange("nrp")}
//               className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
//                 activeTab === "nrp"
//                   ? "text-blue-600 border-b-2 border-blue-600"
//                   : "text-gray-600 hover:text-gray-900"
//               }`}
//             >
//               <div className="flex items-center justify-center space-x-2">
//                 <Calendar className="h-5 w-5" />
//                 <span>Non-Regular Program (NRP)</span>
//               </div>
//             </button>
//           </div>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
//           <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">
//                   Total Workloads
//                 </p>
//                 <p className="text-2xl font-bold text-gray-900 mt-1">
//                   {currentStats.total}
//                 </p>
//               </div>
//               <div className="p-3 bg-blue-50 rounded-lg">
//                 <FileText className="h-6 w-6 text-blue-600" />
//               </div>
//             </div>
//           </div>
//           <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Draft</p>
//                 <p className="text-2xl font-bold text-blue-600 mt-1">
//                   {currentStats.draft}
//                 </p>
//               </div>
//               <div className="p-3 bg-blue-50 rounded-lg">
//                 <Clock className="h-6 w-6 text-blue-600" />
//               </div>
//             </div>
//           </div>
//           <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Submitted</p>
//                 <p className="text-2xl font-bold text-amber-600 mt-1">
//                   {currentStats.submitted}
//                 </p>
//               </div>
//               <div className="p-3 bg-amber-50 rounded-lg">
//                 <AlertCircle className="h-6 w-6 text-amber-600" />
//               </div>
//             </div>
//           </div>
//           <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">
//                   Total {activeTab === "rp" ? "Hours" : "Payment"}
//                 </p>
//                 <p className="text-2xl font-bold text-emerald-600 mt-1">
//                   {activeTab === "rp"
//                     ? `${currentStats.totalHours.toFixed(1)}h`
//                     : `ETB ${formatCurrency(currentStats.totalPayment)}`}
//                 </p>
//               </div>
//               <div className="p-3 bg-emerald-50 rounded-lg">
//                 {activeTab === "rp" ? (
//                   <Clock className="h-6 w-6 text-emerald-600" />
//                 ) : (
//                   <DollarSign className="h-6 w-6 text-emerald-600" />
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Workload Form */}
//         {showForm && (
//           <div
//             ref={formRef}
//             className="bg-white rounded-xl border border-gray-200 shadow-sm mb-8"
//           >
//             <div className="p-6 border-b">
//               <div className="flex items-center justify-between">
//                 <h3 className="text-xl font-semibold text-gray-900">
//                   {editMode ? "Edit" : "Create New"}{" "}
//                   {activeTab === "rp" ? "RP" : "NRP"} Workload
//                 </h3>
//                 <button
//                   onClick={() => {
//                     setShowForm(false);
//                     setEditMode(false);
//                     setCurrentWorkload(null);
//                   }}
//                   className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//                 >
//                   <X className="h-5 w-5 text-gray-500" />
//                 </button>
//               </div>
//             </div>

//             <form
//               onSubmit={activeTab === "rp" ? handleRpSubmit : handleNrpSubmit}
//               className="p-6"
//             >
//               {activeTab === "rp" ? (
//                 <div className="space-y-6">
//                   {/* Basic Information */}
//                   <div>
//                     <h4 className="text-lg font-medium text-gray-900 mb-4">
//                       Basic Information
//                     </h4>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Semester *
//                         </label>
//                         <select
//                           name="semester_id"
//                           value={rpForm.semester_id}
//                           onChange={handleRpFormChange}
//                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                           required
//                         >
//                           <option value="">Select Semester</option>
//                           {Array.isArray(semesters) && semesters.length > 0 ? (
//                             semesters.map((semester) => (
//                               <option
//                                 key={semester.semester_id}
//                                 value={semester.semester_id}
//                               >
//                                 {semester.semester_name} ({semester.semester_code})
//                               </option>
//                             ))
//                           ) : (
//                             <option value="" disabled>
//                               No semesters available
//                             </option>
//                           )}
//                         </select>
//                       </div>

//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Course *
//                         </label>
//                         <select
//                           name="course_code"
//                           value={rpForm.course_code}
//                           onChange={(e) => {
//                             handleRpFormChange(e);
//                             if (Array.isArray(courses) && courses.length > 0) {
//                               const course = courses.find(
//                                 (c) => c.course_code === e.target.value
//                               );
//                               if (course) {
//                                 setRpForm((prev) => ({
//                                   ...prev,
//                                   course_credit_hours: course.credit_hours || "",
//                                   lecture_credit_hours: course.lecture_hours || "",
//                                   lab_credit_hours: course.lab_hours || "",
//                                   tutorial_credit_hours: course.tutorial_hours || "",
//                                 }));
//                               }
//                             }
//                           }}
//                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                           required
//                         >
//                           <option value="">Select Course</option>
//                           {Array.isArray(courses) && courses.length > 0 ? (
//                             courses.map((course) => (
//                               <option
//                                 key={course.course_id}
//                                 value={course.course_code}
//                               >
//                                 {course.course_code} - {course.course_title}
//                               </option>
//                             ))
//                           ) : (
//                             <option value="" disabled>
//                               No courses available
//                             </option>
//                           )}
//                         </select>
//                       </div>

//                       {["admin", "department_head", "dean"].includes(
//                         user?.role
//                       ) && (
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-2">
//                             Staff Member
//                           </label>
//                           <select
//                             name="staff_id"
//                             value={rpForm.staff_id}
//                             onChange={handleRpFormChange}
//                             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                           >
//                             <option value="">Select Staff</option>
//                             {Array.isArray(staffMembers) && staffMembers.length > 0 ? (
//                               staffMembers.map((staff) => (
//                                 <option
//                                   key={staff.staff_id}
//                                   value={staff.staff_id}
//                                 >
//                                   {staff.first_name} {staff.last_name} (
//                                   {staff.employee_id})
//                                 </option>
//                               ))
//                             ) : (
//                               <option value="" disabled>
//                                 No staff members available
//                               </option>
//                             )}
//                           </select>
//                         </div>
//                       )}

//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Student Department
//                         </label>
//                         <input
//                           type="text"
//                           name="student_department"
//                           value={rpForm.student_department}
//                           onChange={handleRpFormChange}
//                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                           placeholder="e.g., Software Engineering"
//                         />
//                       </div>

//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Academic Year
//                         </label>
//                         <input
//                           type="text"
//                           name="academic_year"
//                           value={rpForm.academic_year}
//                           onChange={handleRpFormChange}
//                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                           placeholder="e.g., 2024-2025"
//                         />
//                       </div>

//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Number of Sections
//                         </label>
//                         <input
//                           type="number"
//                           name="number_of_sections"
//                           value={rpForm.number_of_sections}
//                           onChange={handleRpFormChange}
//                           min="1"
//                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                         />
//                       </div>
//                     </div>
//                   </div>

//                   {/* Credit Hours */}
//                   <div>
//                     <h4 className="text-lg font-medium text-gray-900 mb-4">
//                       Credit Hours
//                     </h4>
//                     <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Course Credit Hours
//                         </label>
//                         <input
//                           type="number"
//                           step="0.01"
//                           name="course_credit_hours"
//                           value={rpForm.course_credit_hours}
//                           onChange={handleRpFormChange}
//                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Lecture Hours
//                         </label>
//                         <input
//                           type="number"
//                           step="0.01"
//                           name="lecture_credit_hours"
//                           value={rpForm.lecture_credit_hours}
//                           onChange={handleRpFormChange}
//                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Lab Hours
//                         </label>
//                         <input
//                           type="number"
//                           step="0.01"
//                           name="lab_credit_hours"
//                           value={rpForm.lab_credit_hours}
//                           onChange={handleRpFormChange}
//                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Tutorial Hours
//                         </label>
//                         <input
//                           type="number"
//                           step="0.01"
//                           name="tutorial_credit_hours"
//                           value={rpForm.tutorial_credit_hours}
//                           onChange={handleRpFormChange}
//                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                         />
//                       </div>
//                     </div>
//                   </div>

//                   {/* Load Distribution */}
//                   <div>
//                     <h4 className="text-lg font-medium text-gray-900 mb-4">
//                       Load Distribution
//                     </h4>
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Per Section Course Load
//                         </label>
//                         <input
//                           type="number"
//                           step="0.01"
//                           name="each_section_course_load"
//                           value={rpForm.each_section_course_load}
//                           onChange={handleRpFormChange}
//                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Variety of Course Load
//                         </label>
//                         <input
//                           type="number"
//                           step="0.01"
//                           name="variety_of_course_load"
//                           value={rpForm.variety_of_course_load}
//                           onChange={handleRpFormChange}
//                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Research Load
//                         </label>
//                         <input
//                           type="number"
//                           step="0.01"
//                           name="research_load"
//                           value={rpForm.research_load}
//                           onChange={handleRpFormChange}
//                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Community Service Load
//                         </label>
//                         <input
//                           type="number"
//                           step="0.01"
//                           name="community_service_load"
//                           value={rpForm.community_service_load}
//                           onChange={handleRpFormChange}
//                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                         />
//                       </div>
//                     </div>
//                   </div>

//                   {/* Administrative Load */}
//                   <div>
//                     <h4 className="text-lg font-medium text-gray-900 mb-4">
//                       Administrative Load
//                     </h4>
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           ELIP Load
//                         </label>
//                         <input
//                           type="number"
//                           step="0.01"
//                           name="elip_load"
//                           value={rpForm.elip_load}
//                           onChange={handleRpFormChange}
//                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           HDP Load
//                         </label>
//                         <input
//                           type="number"
//                           step="0.01"
//                           name="hdp_load"
//                           value={rpForm.hdp_load}
//                           onChange={handleRpFormChange}
//                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Course Chair Load
//                         </label>
//                         <input
//                           type="number"
//                           step="0.01"
//                           name="course_chair_load"
//                           value={rpForm.course_chair_load}
//                           onChange={handleRpFormChange}
//                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Section Advisor Load
//                         </label>
//                         <input
//                           type="number"
//                           step="0.01"
//                           name="section_advisor_load"
//                           value={rpForm.section_advisor_load}
//                           onChange={handleRpFormChange}
//                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Advising Load
//                         </label>
//                         <input
//                           type="number"
//                           step="0.01"
//                           name="advising_load"
//                           value={rpForm.advising_load}
//                           onChange={handleRpFormChange}
//                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Position Load
//                         </label>
//                         <input
//                           type="number"
//                           step="0.01"
//                           name="position_load"
//                           value={rpForm.position_load}
//                           onChange={handleRpFormChange}
//                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                         />
//                       </div>
//                     </div>
//                   </div>

//                   {/* Summary */}
//                   <div className="bg-blue-50 p-6 rounded-lg">
//                     <h4 className="text-lg font-medium text-gray-900 mb-4">
//                       Summary
//                     </h4>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Total Load
//                         </label>
//                         <input
//                           type="number"
//                           step="0.01"
//                           name="total_load"
//                           value={rpForm.total_load}
//                           onChange={handleRpFormChange}
//                           className="w-full px-4 py-2 border border-blue-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                           readOnly
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Over Payment (Birr)
//                         </label>
//                         <input
//                           type="number"
//                           step="0.01"
//                           name="over_payment_birr"
//                           value={rpForm.over_payment_birr}
//                           onChange={handleRpFormChange}
//                           className="w-full px-4 py-2 border border-blue-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="space-y-6">
//                   {/* Basic Information */}
//                   <div>
//                     <h4 className="text-lg font-medium text-gray-900 mb-4">
//                       Basic Information
//                     </h4>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Program Type *
//                         </label>
//                         <select
//                           name="program_type"
//                           value={nrpForm.program_type}
//                           onChange={handleNrpFormChange}
//                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                           required
//                         >
//                           <option value="extension">Extension</option>
//                           <option value="weekend">Weekend</option>
//                           <option value="summer">Summer</option>
//                           <option value="distance">Distance</option>
//                         </select>
//                       </div>

//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Semester *
//                         </label>
//                         <select
//                           name="semester_id"
//                           value={nrpForm.semester_id}
//                           onChange={handleNrpFormChange}
//                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                           required
//                         >
//                           <option value="">Select Semester</option>
//                           {Array.isArray(semesters) && semesters.length > 0 ? (
//                             semesters.map((semester) => (
//                               <option
//                                 key={semester.semester_id}
//                                 value={semester.semester_id}
//                               >
//                                 {semester.semester_name} ({semester.semester_code})
//                               </option>
//                             ))
//                           ) : (
//                             <option value="" disabled>
//                               No semesters available
//                             </option>
//                           )}
//                         </select>
//                       </div>

//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Contract Number
//                         </label>
//                         <input
//                           type="text"
//                           name="contract_number"
//                           value={nrpForm.contract_number}
//                           onChange={handleNrpFormChange}
//                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                           placeholder="Auto-generated"
//                         />
//                       </div>

//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Academic Year
//                         </label>
//                         <input
//                           type="text"
//                           name="academic_year"
//                           value={nrpForm.academic_year}
//                           onChange={handleNrpFormChange}
//                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                           placeholder="e.g., 2024-2025"
//                         />
//                       </div>

//                       {["admin", "department_head", "dean"].includes(
//                         user?.role
//                       ) && (
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-2">
//                             Staff Member
//                           </label>
//                           <select
//                             name="staff_id"
//                             value={nrpForm.staff_id}
//                             onChange={handleNrpFormChange}
//                             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                           >
//                             <option value="">Select Staff</option>
//                             {Array.isArray(staffMembers) && staffMembers.length > 0 ? (
//                               staffMembers.map((staff) => (
//                                 <option
//                                   key={staff.staff_id}
//                                   value={staff.staff_id}
//                                 >
//                                   {staff.first_name} {staff.last_name} (
//                                   {staff.employee_id})
//                                 </option>
//                               ))
//                             ) : (
//                               <option value="" disabled>
//                                 No staff members available
//                               </option>
//                             )}
//                           </select>
//                         </div>
//                       )}

//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Contract Type
//                         </label>
//                         <select
//                           name="contract_type"
//                           value={nrpForm.contract_type}
//                           onChange={handleNrpFormChange}
//                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                         >
//                           <option value="teaching">Teaching</option>
//                           <option value="tutorial_correction">
//                             Tutorial/Correction
//                           </option>
//                           <option value="combined">Combined</option>
//                         </select>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Course Information */}
//                   <div>
//                     <h4 className="text-lg font-medium text-gray-900 mb-4">
//                       Course Information
//                     </h4>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Select Course
//                         </label>
//                         <select
//                           value={nrpForm.course_id}
//                           onChange={(e) => handleCourseSelect(e.target.value)}
//                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                         >
//                           <option value="">Select Course</option>
//                           {Array.isArray(courses) && courses.length > 0 ? (
//                             courses.map((course) => (
//                               <option
//                                 key={course.course_id}
//                                 value={course.course_id}
//                               >
//                                 {course.course_code} - {course.course_title}
//                               </option>
//                             ))
//                           ) : (
//                             <option value="" disabled>
//                               No courses available
//                             </option>
//                           )}
//                         </select>
//                       </div>

//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Course Code
//                         </label>
//                         <input
//                           type="text"
//                           name="course_code"
//                           value={nrpForm.course_code}
//                           onChange={handleNrpFormChange}
//                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                           placeholder="e.g., SEng4021"
//                         />
//                       </div>

//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Course Title
//                         </label>
//                         <input
//                           type="text"
//                           name="course_title"
//                           value={nrpForm.course_title}
//                           onChange={handleNrpFormChange}
//                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                           placeholder="e.g., Database Systems"
//                         />
//                       </div>

//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Credit Hours
//                         </label>
//                         <input
//                           type="number"
//                           step="0.01"
//                           name="credit_hours"
//                           value={nrpForm.credit_hours}
//                           onChange={handleNrpFormChange}
//                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                         />
//                       </div>
//                     </div>
//                   </div>

//                   {/* Hours Breakdown */}
//                   <div>
//                     <h4 className="text-lg font-medium text-gray-900 mb-4">
//                       Hours Breakdown
//                     </h4>
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Lecture Credit Hours
//                         </label>
//                         <input
//                           type="number"
//                           step="0.01"
//                           name="lecture_credit_hours"
//                           value={nrpForm.lecture_credit_hours}
//                           onChange={handleNrpFormChange}
//                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Lab Credit Hours
//                         </label>
//                         <input
//                           type="number"
//                           step="0.01"
//                           name="lab_credit_hours"
//                           value={nrpForm.lab_credit_hours}
//                           onChange={handleNrpFormChange}
//                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Tutorial Credit Hours
//                         </label>
//                         <input
//                           type="number"
//                           step="0.01"
//                           name="tutorial_credit_hours"
//                           value={nrpForm.tutorial_credit_hours}
//                           onChange={handleNrpFormChange}
//                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Teaching Hours
//                         </label>
//                         <input
//                           type="number"
//                           step="0.01"
//                           name="teaching_hours"
//                           value={nrpForm.teaching_hours}
//                           onChange={handleNrpFormChange}
//                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Module Hours (Distance)
//                         </label>
//                         <input
//                           type="number"
//                           step="0.01"
//                           name="module_hours"
//                           value={nrpForm.module_hours}
//                           onChange={handleNrpFormChange}
//                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Total Hours Worked
//                         </label>
//                         <input
//                           type="number"
//                           step="0.01"
//                           name="total_hours_worked"
//                           value={nrpForm.total_hours_worked}
//                           onChange={handleNrpFormChange}
//                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                           readOnly
//                         />
//                       </div>
//                     </div>
//                   </div>

//                   {/* Student Information */}
//                   <div>
//                     <h4 className="text-lg font-medium text-gray-900 mb-4">
//                       Student Information
//                     </h4>
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Total Students
//                         </label>
//                         <input
//                           type="number"
//                           name="student_count"
//                           value={nrpForm.student_count}
//                           onChange={handleNrpFormChange}
//                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Assignment Students
//                         </label>
//                         <input
//                           type="number"
//                           name="assignment_students"
//                           value={nrpForm.assignment_students}
//                           onChange={handleNrpFormChange}
//                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Exam Students
//                         </label>
//                         <input
//                           type="number"
//                           name="exam_students"
//                           value={nrpForm.exam_students}
//                           onChange={handleNrpFormChange}
//                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                         />
//                       </div>
//                       <div className="md:col-span-2">
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Project Advising
//                         </label>
//                         <input
//                           type="text"
//                           name="project_advising"
//                           value={nrpForm.project_advising}
//                           onChange={handleNrpFormChange}
//                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                           placeholder="e.g., Final year project groups"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Project Groups
//                         </label>
//                         <input
//                           type="number"
//                           name="project_groups"
//                           value={nrpForm.project_groups}
//                           onChange={handleNrpFormChange}
//                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                         />
//                       </div>
//                     </div>
//                   </div>

//                   {/* Rates & Payments */}
//                   <div>
//                     <h4 className="text-lg font-medium text-gray-900 mb-4">
//                       Rates & Payments
//                     </h4>
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Rate Category
//                         </label>
//                         <select
//                           name="rate_category"
//                           value={nrpForm.rate_category}
//                           onChange={handleNrpFormChange}
//                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                         >
//                           <option value="default">Default</option>
//                           <option value="A">Category A</option>
//                           <option value="B">Category B</option>
//                           <option value="C">Category C</option>
//                         </select>
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Rate per Rank (ETB)
//                         </label>
//                         <input
//                           type="number"
//                           step="0.01"
//                           name="rate_per_rank"
//                           value={nrpForm.rate_per_rank}
//                           onChange={handleNrpFormChange}
//                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                           placeholder="e.g., 500.00"
//                         />
//                       </div>
//                       <div>
//                         <div className="flex items-center space-x-4">
//                           <div className="flex-1">
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                               Is Overload?
//                             </label>
//                             <div className="flex items-center space-x-2">
//                               <input
//                                 type="checkbox"
//                                 name="is_overload"
//                                 checked={nrpForm.is_overload}
//                                 onChange={handleNrpFormChange}
//                                 className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
//                               />
//                               <span className="text-sm text-gray-700">Yes</span>
//                             </div>
//                           </div>
//                           {nrpForm.is_overload && (
//                             <div className="flex-1">
//                               <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 Overload Hours
//                               </label>
//                               <input
//                                 type="number"
//                                 step="0.01"
//                                 name="overload_hours"
//                                 value={nrpForm.overload_hours}
//                                 onChange={handleNrpFormChange}
//                                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                               />
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     </div>

//                     <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Assignment Rate
//                         </label>
//                         <input
//                           type="number"
//                           step="0.01"
//                           name="assignment_rate"
//                           value={nrpForm.assignment_rate}
//                           onChange={handleNrpFormChange}
//                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Exam Rate
//                         </label>
//                         <input
//                           type="number"
//                           step="0.01"
//                           name="exam_rate"
//                           value={nrpForm.exam_rate}
//                           onChange={handleNrpFormChange}
//                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Tutorial Rate/Hour
//                         </label>
//                         <input
//                           type="number"
//                           step="0.01"
//                           name="tutorial_rate_per_hour"
//                           value={nrpForm.tutorial_rate_per_hour}
//                           onChange={handleNrpFormChange}
//                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Overload Payment
//                         </label>
//                         <input
//                           type="number"
//                           step="0.01"
//                           name="overload_payment"
//                           value={nrpForm.overload_payment}
//                           onChange={handleNrpFormChange}
//                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                           readOnly
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Total Payment
//                         </label>
//                         <input
//                           type="number"
//                           step="0.01"
//                           name="total_payment"
//                           value={nrpForm.total_payment}
//                           onChange={handleNrpFormChange}
//                           className="w-full px-4 py-2 border border-blue-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold"
//                           readOnly
//                         />
//                       </div>
//                     </div>
//                   </div>

//                   {/* Contract Duration */}
//                   <div>
//                     <h4 className="text-lg font-medium text-gray-900 mb-4">
//                       Contract Duration
//                     </h4>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           From Date
//                         </label>
//                         <input
//                           type="date"
//                           name="contract_duration_from"
//                           value={nrpForm.contract_duration_from}
//                           onChange={handleNrpFormChange}
//                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           To Date
//                         </label>
//                         <input
//                           type="date"
//                           name="contract_duration_to"
//                           value={nrpForm.contract_duration_to}
//                           onChange={handleNrpFormChange}
//                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Form Actions */}
//               <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setShowForm(false);
//                     setEditMode(false);
//                     setCurrentWorkload(null);
//                   }}
//                   className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
//                   disabled={loading.form}
//                 >
//                   Cancel
//                 </button>
//                 {rpForm.status === "draft" && (
//                   <button
//                     type="submit"
//                     className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
//                     disabled={loading.form}
//                   >
//                     {loading.form ? (
//                       <>
//                         <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                         <span>Saving...</span>
//                       </>
//                     ) : (
//                       <>
//                         <Save className="h-4 w-4" />
//                         <span>{editMode ? "Update" : "Save"} as Draft</span>
//                       </>
//                     )}
//                   </button>
//                 )}
//                 <button
//                   type="button"
//                   onClick={() => {
//                     if (activeTab === "rp") {
//                       setRpForm((prev) => ({ ...prev, status: "submitted" }));
//                     } else {
//                       setNrpForm((prev) => ({ ...prev, status: "submitted" }));
//                     }
//                   }}
//                   className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center space-x-2"
//                   disabled={loading.form}
//                 >
//                   <Send className="h-4 w-4" />
//                   <span>Save & Submit for Approval</span>
//                 </button>
//               </div>
//             </form>
//           </div>
//         )}

//         {/* Filters */}
//         <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
//           <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
//             <div className="flex-1">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//                 <input
//                   type="text"
//                   placeholder={`Search ${
//                     activeTab === "rp" ? "RP" : "NRP"
//                   } workloads...`}
//                   className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   value={filters.search}
//                   onChange={(e) =>
//                     setFilters((prev) => ({ ...prev, search: e.target.value }))
//                   }
//                 />
//               </div>
//             </div>
//             <div className="flex items-center space-x-4">
//               <div className="relative">
//                 <select
//                   className="appearance-none bg-white border border-gray-300 rounded-lg py-3 pl-4 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   value={filters.status}
//                   onChange={(e) =>
//                     setFilters((prev) => ({ ...prev, status: e.target.value }))
//                   }
//                 >
//                   <option value="all">All Status</option>
//                   <option value="draft">Draft</option>
//                   <option value="submitted">Submitted</option>
//                   <option value="approved">Approved</option>
//                   <option value="rejected">Rejected</option>
//                 </select>
//                 <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
//               </div>

//               <div className="relative">
//                 <select
//                   className="appearance-none bg-white border border-gray-300 rounded-lg py-3 pl-4 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   value={filters.semester}
//                   onChange={(e) =>
//                     setFilters((prev) => ({
//                       ...prev,
//                       semester: e.target.value,
//                     }))
//                   }
//                 >
//                   <option value="all">All Semesters</option>
//                   {Array.isArray(semesters) && semesters.length > 0 ? (
//                     semesters.map((semester) => (
//                       <option
//                         key={semester.semester_id}
//                         value={semester.semester_id}
//                       >
//                         {semester.semester_code}
//                       </option>
//                     ))
//                   ) : (
//                     <option value="" disabled>
//                       No semesters
//                     </option>
//                   )}
//                 </select>
//                 <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
//               </div>

//               {activeTab === "nrp" && (
//                 <div className="relative">
//                   <select
//                     className="appearance-none bg-white border border-gray-300 rounded-lg py-3 pl-4 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                     value={filters.program_type}
//                     onChange={(e) =>
//                       setFilters((prev) => ({
//                         ...prev,
//                         program_type: e.target.value,
//                       }))
//                     }
//                   >
//                     <option value="all">All Programs</option>
//                     <option value="extension">Extension</option>
//                     <option value="weekend">Weekend</option>
//                     <option value="summer">Summer</option>
//                     <option value="distance">Distance</option>
//                   </select>
//                   <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
//                 </div>
//               )}

//               <button
//                 onClick={() => {
//                   setFilters({
//                     status: "all",
//                     semester: "all",
//                     search: "",
//                     program_type: "all",
//                   });
//                 }}
//                 className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
//               >
//                 <Filter className="h-5 w-5 text-gray-600" />
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Workloads List */}
//         <div className="space-y-6">
//           {filteredWorkloads.length === 0 ? (
//             <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-12 text-center">
//               <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
//               <h3 className="text-xl font-semibold text-gray-900 mb-2">
//                 No {activeTab === "rp" ? "RP" : "NRP"} Workloads Found
//               </h3>
//               <p className="text-gray-600 mb-6">
//                 {filters.search ||
//                 filters.status !== "all" ||
//                 filters.semester !== "all"
//                   ? "Try adjusting your filters"
//                   : `You haven't created any ${
//                       activeTab === "rp" ? "RP" : "NRP"
//                     } workloads yet`}
//               </p>
//               <button
//                 onClick={handleNewWorkload}
//                 className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center space-x-2 mx-auto"
//               >
//                 <Plus className="h-5 w-5" />
//                 <span>Create Your First Workload</span>
//               </button>
//             </div>
//           ) : (
//             Array.isArray(filteredWorkloads) && filteredWorkloads.map((workload) => (
//               <WorkloadCard
//                 key={
//                   activeTab === "rp" ? workload.workload_id : workload.nrp_id
//                 }
//                 workload={workload}
//                 type={activeTab}
//                 onView={handleViewDetails}
//                 onEdit={handleEditWorkload}
//                 onDelete={handleDeleteClick}
//                 onSubmit={handleSubmitClick}
//                 userRole={user?.role}
//               />
//             ))
//           )}
//         </div>
//       </div>

//       {/* Details Modal */}
//       {showDetailsModal && selectedWorkload && (
//         <DetailsModal
//           workload={selectedWorkload}
//           type={activeTab}
//           onClose={() => {
//             setShowDetailsModal(false);
//             setSelectedWorkload(null);
//           }}
//         />
//       )}

//       {/* Delete Confirmation Modal */}
//       {showDeleteModal && selectedWorkload && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
//             <div className="p-6">
//               <div className="flex items-center space-x-3 mb-4">
//                 <div className="p-2 bg-red-100 rounded-lg">
//                   <AlertCircle className="h-6 w-6 text-red-600" />
//                 </div>
//                 <h3 className="text-lg font-semibold text-gray-900">
//                   Delete Workload
//                 </h3>
//               </div>
//               <p className="text-gray-600 mb-6">
//                 Are you sure you want to delete this{" "}
//                 {activeTab === "rp" ? "RP" : "NRP"} workload? This action cannot
//                 be undone.
//               </p>
//               <div className="flex justify-end space-x-3">
//                 <button
//                   onClick={() => {
//                     setShowDeleteModal(false);
//                     setSelectedWorkload(null);
//                   }}
//                   className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleDeleteConfirm}
//                   className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
//                   disabled={loading.form}
//                 >
//                   {loading.form ? "Deleting..." : "Delete"}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Submit Confirmation Modal */}
//       {showSubmitModal && selectedWorkload && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
//             <div className="p-6">
//               <div className="flex items-center space-x-3 mb-4">
//                 <div className="p-2 bg-emerald-100 rounded-lg">
//                   <CheckCircle className="h-6 w-6 text-emerald-600" />
//                 </div>
//                 <h3 className="text-lg font-semibold text-gray-900">
//                   Submit for Approval
//                 </h3>
//               </div>
//               <p className="text-gray-600 mb-6">
//                 Are you ready to submit this {activeTab === "rp" ? "RP" : "NRP"}{" "}
//                 workload for approval? Once submitted, you won't be able to edit
//                 it without approval.
//               </p>
//               <div className="flex justify-end space-x-3">
//                 <button
//                   onClick={() => {
//                     setShowSubmitModal(false);
//                     setSelectedWorkload(null);
//                   }}
//                   className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleSubmitConfirm}
//                   className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
//                   disabled={loading.form}
//                 >
//                   {loading.form ? "Submitting..." : "Submit for Approval"}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // Workload Card Component (keep as is)
// const WorkloadCard = ({
//   workload,
//   type,
//   onView,
//   onEdit,
//   onDelete,
//   onSubmit,
//   userRole,
// }) => {
//   const statusConfig = getStatusColor(workload.status);
//   const StatusIcon = statusConfig.icon;

//   const canEdit =
//     workload.status === "draft" &&
//     (userRole === "admin" ||
//       (userRole === "instructor" && workload.staff_id === workload.staff_id) ||
//       (userRole === "department_head" &&
//         workload.department_id === workload.department_id));

//   const canDelete =
//     workload.status === "draft" &&
//     (userRole === "admin" ||
//       (userRole === "instructor" && workload.staff_id === workload.staff_id));

//   const canSubmit =
//     workload.status === "draft" &&
//     userRole === "instructor" &&
//     workload.staff_id === workload.staff_id;

//   return (
//     <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
//       <div className="p-6">
//         <div className="flex items-start justify-between mb-4">
//           <div className="flex-1">
//             <div className="flex items-center space-x-3 mb-2">
//               <div className={`p-2 ${statusConfig.bg} rounded-lg`}>
//                 <StatusIcon className={`h-5 w-5 ${statusConfig.text}`} />
//               </div>
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-900">
//                   {workload.course_code} -{" "}
//                   {workload.course_title || "Untitled Workload"}
//                 </h3>
//                 {type === "nrp" && (
//                   <div className="flex items-center space-x-4 mt-1">
//                     <span
//                       className={`px-2 py-1 rounded text-xs font-medium ${getProgramTypeColor(
//                         workload.program_type
//                       )}`}
//                     >
//                       {workload.program_type?.toUpperCase()}
//                     </span>
//                     <span className="text-sm text-gray-600">
//                       Contract: {workload.contract_number}
//                     </span>
//                   </div>
//                 )}
//               </div>
//             </div>
//             <div className="flex items-center space-x-4 mt-3">
//               <span className="text-sm text-gray-600">
//                 Semester: {workload.semester_name || "N/A"}
//               </span>
//               {type === "rp" ? (
//                 <>
//                   <span className="text-sm text-gray-600">
//                     Sections: {workload.number_of_sections || 1}
//                   </span>
//                   <span className="text-sm text-gray-600">
//                     Hours: {parseFloat(workload.total_load || 0).toFixed(1)}h
//                   </span>
//                 </>
//               ) : (
//                 <>
//                   <span className="text-sm text-gray-600">
//                     Students: {workload.student_count || 0}
//                   </span>
//                   <span className="text-sm text-gray-600">
//                     Hours:{" "}
//                     {parseFloat(workload.total_hours_worked || 0).toFixed(1)}h
//                   </span>
//                 </>
//               )}
//             </div>

//             {type === "rp" && (
//               <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
//                 <div>
//                   <p className="text-xs text-gray-500 mb-1">Credit Hours</p>
//                   <p className="text-sm font-medium text-gray-900">
//                     {parseFloat(workload.course_credit_hours || 0).toFixed(1)}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-xs text-gray-500 mb-1">
//                     Student Department
//                   </p>
//                   <p className="text-sm font-medium text-gray-900">
//                     {workload.student_department || "N/A"}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-xs text-gray-500 mb-1">Over Payment</p>
//                   <p className="text-sm font-medium text-emerald-600">
//                     ETB{" "}
//                     {parseFloat(
//                       workload.over_payment_birr || 0
//                     ).toLocaleString()}
//                   </p>
//                 </div>
//               </div>
//             )}

//             {type === "nrp" && (
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
//                 <div>
//                   <p className="text-xs text-gray-500 mb-1">Credit Hours</p>
//                   <p className="text-sm font-medium text-gray-900">
//                     {parseFloat(workload.credit_hours || 0).toFixed(1)}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-xs text-gray-500 mb-1">Teaching Hours</p>
//                   <p className="text-sm font-medium text-gray-900">
//                     {parseFloat(workload.teaching_hours || 0).toFixed(1)}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-xs text-gray-500 mb-1">Module Hours</p>
//                   <p className="text-sm font-medium text-gray-900">
//                     {parseFloat(workload.module_hours || 0).toFixed(1)}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-xs text-gray-500 mb-1">Total Payment</p>
//                   <p className="text-sm font-medium text-emerald-600">
//                     ETB{" "}
//                     {parseFloat(workload.total_payment || 0).toLocaleString()}
//                   </p>
//                 </div>
//               </div>
//             )}
//           </div>
//           <div className="ml-4">
//             <span
//               className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}
//             >
//               {getStatusText(workload.status)}
//             </span>
//           </div>
//         </div>

//         {/* Load Breakdown for RP */}
//         {type === "rp" && workload.total_load > 0 && (
//           <div className="mt-4">
//             <div className="flex items-center justify-between mb-2">
//               <span className="text-sm font-medium text-gray-700">
//                 Load Distribution
//               </span>
//               <span className="text-xs text-gray-500">
//                 Total: {parseFloat(workload.total_load).toFixed(1)}h
//               </span>
//             </div>
//             <div className="flex h-2 bg-gray-200 rounded-full overflow-hidden">
//               <div
//                 className="bg-blue-500"
//                 style={{
//                   width: `${
//                     ((workload.each_section_course_load *
//                       workload.number_of_sections) /
//                       workload.total_load) *
//                       100 || 0
//                   }%`,
//                 }}
//                 title="Course Load"
//               ></div>
//               <div
//                 className="bg-green-500"
//                 style={{
//                   width: `${
//                     (workload.research_load / workload.total_load) * 100 || 0
//                   }%`,
//                 }}
//                 title="Research Load"
//               ></div>
//               <div
//                 className="bg-purple-500"
//                 style={{
//                   width: `${
//                     (workload.community_service_load / workload.total_load) *
//                       100 || 0
//                   }%`,
//                 }}
//                 title="Community Service"
//               ></div>
//               <div
//                 className="bg-amber-500"
//                 style={{
//                   width: `${
//                     ((workload.elip_load +
//                       workload.hdp_load +
//                       workload.course_chair_load +
//                       workload.section_advisor_load +
//                       workload.advising_load +
//                       workload.position_load) /
//                       workload.total_load) *
//                       100 || 0
//                   }%`,
//                 }}
//                 title="Administrative Load"
//               ></div>
//             </div>
//             <div className="flex justify-between mt-1 text-xs text-gray-500">
//               <span>Course</span>
//               <span>Research</span>
//               <span>Community</span>
//               <span>Admin</span>
//             </div>
//           </div>
//         )}

//         {/* Action Buttons */}
//         <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
//           <div className="flex items-center space-x-3">
//             <button
//               onClick={() => onView(workload)}
//               className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-2"
//             >
//               <Eye className="h-4 w-4" />
//               <span>View Details</span>
//             </button>
//             <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-2">
//               <Download className="h-4 w-4" />
//               <span>Export</span>
//             </button>
//           </div>
//           <div className="flex items-center space-x-3">
//             {canEdit && (
//               <button
//                 onClick={() =>
//                   onEdit(type === "rp" ? workload.workload_id : workload.nrp_id)
//                 }
//                 className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2"
//               >
//                 <Edit className="h-4 w-4" />
//                 <span>Edit</span>
//               </button>
//             )}
//             {canSubmit && (
//               <button
//                 onClick={() => onSubmit(workload)}
//                 className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors flex items-center space-x-2"
//               >
//                 <Send className="h-4 w-4" />
//                 <span>Submit</span>
//               </button>
//             )}
//             {canDelete && (
//               <button
//                 onClick={() => onDelete(workload)}
//                 className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center space-x-2"
//               >
//                 <Trash2 className="h-4 w-4" />
//                 <span>Delete</span>
//               </button>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Details Modal Component (keep as is)
// const DetailsModal = ({ workload, type, onClose }) => {
//   const statusConfig = getStatusColor(workload.status);
//   const StatusIcon = statusConfig.icon;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
//         <div className="p-6">
//           <div className="flex items-center justify-between mb-6">
//             <div>
//               <h3 className="text-xl font-semibold text-gray-900">
//                 Workload Details
//               </h3>
//               <p className="text-gray-600">
//                 {workload.course_code} -{" "}
//                 {workload.course_title || "Untitled Workload"}
//               </p>
//             </div>
//             <button
//               onClick={onClose}
//               className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//             >
//               <X className="h-6 w-6 text-gray-400" />
//             </button>
//           </div>

//           <div className="space-y-6">
//             {/* Basic Info */}
//             <div className="bg-gray-50 p-4 rounded-lg">
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600">Status</p>
//                   <div className="flex items-center space-x-2 mt-1">
//                     <StatusIcon className={`h-4 w-4 ${statusConfig.text}`} />
//                     <span className={`font-medium ${statusConfig.text}`}>
//                       {getStatusText(workload.status)}
//                     </span>
//                   </div>
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium text-gray-600">Semester</p>
//                   <p className="text-gray-900 mt-1">{workload.semester_name}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium text-gray-600">
//                     Academic Year
//                   </p>
//                   <p className="text-gray-900 mt-1">
//                     {workload.year_name || workload.academic_year}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Course Details */}
//             <div>
//               <h4 className="text-lg font-medium text-gray-900 mb-4">
//                 Course Details
//               </h4>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600">
//                     Course Code
//                   </p>
//                   <p className="text-gray-900 mt-1">{workload.course_code}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium text-gray-600">
//                     Course Title
//                   </p>
//                   <p className="text-gray-900 mt-1">{workload.course_title}</p>
//                 </div>
//                 {type === "rp" ? (
//                   <>
//                     <div>
//                       <p className="text-sm font-medium text-gray-600">
//                         Student Department
//                       </p>
//                       <p className="text-gray-900 mt-1">
//                         {workload.student_department || "N/A"}
//                       </p>
//                     </div>
//                     <div>
//                       <p className="text-sm font-medium text-gray-600">
//                         Academic Year
//                       </p>
//                       <p className="text-gray-900 mt-1">
//                         {workload.academic_year || "N/A"}
//                       </p>
//                     </div>
//                   </>
//                 ) : (
//                   <>
//                     <div>
//                       <p className="text-sm font-medium text-gray-600">
//                         Program Type
//                       </p>
//                       <p className="text-gray-900 mt-1 capitalize">
//                         {workload.program_type}
//                       </p>
//                     </div>
//                     <div>
//                       <p className="text-sm font-medium text-gray-600">
//                         Contract Number
//                       </p>
//                       <p className="text-gray-900 mt-1">
//                         {workload.contract_number}
//                       </p>
//                     </div>
//                   </>
//                 )}
//               </div>
//             </div>

//             {/* Load/Payment Details */}
//             {type === "rp" ? (
//               <div>
//                 <h4 className="text-lg font-medium text-gray-900 mb-4">
//                   Load Details
//                 </h4>
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                   <div className="bg-blue-50 p-4 rounded-lg">
//                     <p className="text-sm font-medium text-blue-700">
//                       Total Load
//                     </p>
//                     <p className="text-2xl font-bold text-blue-900 mt-1">
//                       {parseFloat(workload.total_load || 0).toFixed(1)} hours
//                     </p>
//                   </div>
//                   <div className="bg-green-50 p-4 rounded-lg">
//                     <p className="text-sm font-medium text-green-700">
//                       Number of Sections
//                     </p>
//                     <p className="text-2xl font-bold text-green-900 mt-1">
//                       {workload.number_of_sections || 1}
//                     </p>
//                   </div>
//                   <div className="bg-emerald-50 p-4 rounded-lg">
//                     <p className="text-sm font-medium text-emerald-700">
//                       Over Payment
//                     </p>
//                     <p className="text-2xl font-bold text-emerald-900 mt-1">
//                       ETB{" "}
//                       {parseFloat(
//                         workload.over_payment_birr || 0
//                       ).toLocaleString()}
//                     </p>
//                   </div>
//                 </div>

//                 {/* Load Breakdown */}
//                 <div className="mt-6">
//                   <h5 className="text-md font-medium text-gray-900 mb-3">
//                     Load Breakdown
//                   </h5>
//                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                     <div className="text-center">
//                       <p className="text-sm text-gray-600">Course Load</p>
//                       <p className="text-lg font-semibold text-gray-900">
//                         {parseFloat(
//                           workload.each_section_course_load *
//                             workload.number_of_sections || 0
//                         ).toFixed(1)}
//                         h
//                       </p>
//                     </div>
//                     <div className="text-center">
//                       <p className="text-sm text-gray-600">Research Load</p>
//                       <p className="text-lg font-semibold text-gray-900">
//                         {parseFloat(workload.research_load || 0).toFixed(1)}h
//                       </p>
//                     </div>
//                     <div className="text-center">
//                       <p className="text-sm text-gray-600">Community Service</p>
//                       <p className="text-lg font-semibold text-gray-900">
//                         {parseFloat(
//                           workload.community_service_load || 0
//                         ).toFixed(1)}
//                         h
//                       </p>
//                     </div>
//                     <div className="text-center">
//                       <p className="text-sm text-gray-600">Administrative</p>
//                       <p className="text-lg font-semibold text-gray-900">
//                         {parseFloat(
//                           (workload.elip_load || 0) +
//                             (workload.hdp_load || 0) +
//                             (workload.course_chair_load || 0) +
//                             (workload.section_advisor_load || 0) +
//                             (workload.advising_load || 0) +
//                             (workload.position_load || 0)
//                         ).toFixed(1)}
//                         h
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ) : (
//               <div>
//                 <h4 className="text-lg font-medium text-gray-900 mb-4">
//                   Payment Details
//                 </h4>
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                   <div className="bg-blue-50 p-4 rounded-lg">
//                     <p className="text-sm font-medium text-blue-700">
//                       Total Hours
//                     </p>
//                     <p className="text-2xl font-bold text-blue-900 mt-1">
//                       {parseFloat(workload.total_hours_worked || 0).toFixed(1)}{" "}
//                       hours
//                     </p>
//                   </div>
//                   <div className="bg-green-50 p-4 rounded-lg">
//                     <p className="text-sm font-medium text-green-700">
//                       Total Students
//                     </p>
//                     <p className="text-2xl font-bold text-green-900 mt-1">
//                       {workload.student_count || 0}
//                     </p>
//                   </div>
//                   <div className="bg-emerald-50 p-4 rounded-lg">
//                     <p className="text-sm font-medium text-emerald-700">
//                       Total Payment
//                     </p>
//                     <p className="text-2xl font-bold text-emerald-900 mt-1">
//                       ETB{" "}
//                       {parseFloat(workload.total_payment || 0).toLocaleString()}
//                     </p>
//                   </div>
//                 </div>

//                 {/* Payment Breakdown */}
//                 <div className="mt-6">
//                   <h5 className="text-md font-medium text-gray-900 mb-3">
//                     Payment Breakdown
//                   </h5>
//                   <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
//                     <div className="text-center">
//                       <p className="text-sm text-gray-600">Teaching</p>
//                       <p className="text-lg font-semibold text-gray-900">
//                         ETB{" "}
//                         {parseFloat(
//                           workload.teaching_payment || 0
//                         ).toLocaleString()}
//                       </p>
//                     </div>
//                     <div className="text-center">
//                       <p className="text-sm text-gray-600">Tutorial</p>
//                       <p className="text-lg font-semibold text-gray-900">
//                         ETB{" "}
//                         {parseFloat(
//                           workload.tutorial_payment || 0
//                         ).toLocaleString()}
//                       </p>
//                     </div>
//                     <div className="text-center">
//                       <p className="text-sm text-gray-600">Assignment</p>
//                       <p className="text-lg font-semibold text-gray-900">
//                         ETB{" "}
//                         {parseFloat(
//                           workload.assignment_payment || 0
//                         ).toLocaleString()}
//                       </p>
//                     </div>
//                     <div className="text-center">
//                       <p className="text-sm text-gray-600">Exam</p>
//                       <p className="text-lg font-semibold text-gray-900">
//                         ETB{" "}
//                         {parseFloat(
//                           workload.exam_payment || 0
//                         ).toLocaleString()}
//                       </p>
//                     </div>
//                     <div className="text-center">
//                       <p className="text-sm text-gray-600">Overload</p>
//                       <p className="text-lg font-semibold text-gray-900">
//                         ETB{" "}
//                         {parseFloat(
//                           workload.overload_payment || 0
//                         ).toLocaleString()}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Dates */}
//             <div>
//               <h4 className="text-lg font-medium text-gray-900 mb-4">Dates</h4>
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600">
//                     Created At
//                   </p>
//                   <p className="text-gray-900 mt-1">
//                     {formatDate(workload.created_at)}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium text-gray-600">
//                     Updated At
//                   </p>
//                   <p className="text-gray-900 mt-1">
//                     {formatDate(workload.updated_at)}
//                   </p>
//                 </div>
//                 {type === "nrp" && workload.contract_duration_from && (
//                   <div>
//                     <p className="text-sm font-medium text-gray-600">
//                       Contract Duration
//                     </p>
//                     <p className="text-gray-900 mt-1">
//                       {formatDate(workload.contract_duration_from)} to{" "}
//                       {formatDate(workload.contract_duration_to)}
//                     </p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Actions */}
//           <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
//             <button
//               onClick={onClose}
//               className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
//             >
//               Close
//             </button>
//             {workload.status === "draft" && (
//               <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
//                 Edit Workload
//               </button>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Helper function for program type colors
// const getProgramTypeColor = (type) => {
//   const colors = {
//     extension: "bg-blue-100 text-blue-800",
//     weekend: "bg-purple-100 text-purple-800",
//     summer: "bg-amber-100 text-amber-800",
//     distance: "bg-teal-100 text-teal-800",
//   };
//   return colors[type] || "bg-gray-100 text-gray-800";
// };

// // Helper functions for status
// const getStatusColor = (status) => {
//   const statusMap = {
//     draft: { bg: "bg-gray-100", text: "text-gray-800", icon: Clock },
//     submitted: {
//       bg: "bg-blue-100",
//       text: "text-blue-800",
//       icon: AlertCircle,
//     },
//     dh_approved: {
//       bg: "bg-amber-100",
//       text: "text-amber-800",
//       icon: CheckCircle,
//     },
//     dean_approved: {
//       bg: "bg-purple-100",
//       text: "text-purple-800",
//       icon: CheckCircle,
//     },
//     hr_approved: {
//       bg: "bg-indigo-100",
//       text: "text-indigo-800",
//       icon: CheckCircle,
//     },
//     vpaa_approved: {
//       bg: "bg-pink-100",
//       text: "text-pink-800",
//       icon: CheckCircle,
//     },
//     vpaf_approved: {
//       bg: "bg-rose-100",
//       text: "text-rose-800",
//       icon: CheckCircle,
//     },
//     finance_approved: {
//       bg: "bg-green-100",
//       text: "text-green-800",
//       icon: CheckCircle,
//     },
//     cde_approved: {
//       bg: "bg-teal-100",
//       text: "text-teal-800",
//       icon: CheckCircle,
//     },
//     paid: {
//       bg: "bg-emerald-100",
//       text: "text-emerald-800",
//       icon: CheckCircle,
//     },
//     rejected: { bg: "bg-red-100", text: "text-red-800", icon: XCircle },
//   };

//   return statusMap[status] || statusMap.draft;
// };

// const getStatusText = (status) => {
//   const statusMap = {
//     draft: "Draft",
//     submitted: "Submitted",
//     dh_approved: "Dept Head Approved",
//     dean_approved: "Dean Approved",
//     hr_approved: "HR Approved",
//     vpaa_approved: "VPAA Approved",
//     vpaf_approved: "VPAF Approved",
//     finance_approved: "Finance Approved",
//     cde_approved: "CDE Approved",
//     paid: "Paid",
//     rejected: "Rejected",
//   };

//   return statusMap[status] || status;
// };

// export default CompleteWorkloadManager;

// src/pages/workload/CompleteWorkloadManager.jsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import {
  FileText, Plus, Edit, Trash2, CheckCircle, XCircle, Clock,
  AlertCircle, Download, Filter, Search, RefreshCw, Eye, Calendar,
  BookOpen, DollarSign, ChevronDown, Save, Send, X, AlertTriangle,
  Users, Building, GraduationCap, BarChart, Shield, UserCheck,
  CheckSquare, Percent, Calculator, Zap, TrendingUp, FileCheck,
  Loader, Archive, History, FileSpreadsheet, ClipboardList, Target
} from "lucide-react";
import toast from "react-hot-toast";
import { format, parseISO } from "date-fns";
import { useAuth } from "../../contexts/AuthContext";

// API imports
import {
  semesterAPI, courseAPI, staffAPI, workloadRPAPI,
  workloadNRPAPI, rulesAPI, exportAPI, overloadDetectionAPI
} from "../../api";
// =============================================
// MISSING COMPONENTS - Added directly in file
// =============================================

// LoadingSpinner Component
const LoadingSpinner = ({ message = "Loading...", size = "default" }) => {
  const spinnerSize = {
    small: "h-6 w-6",
    default: "h-12 w-12",
    large: "h-16 w-16"
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${spinnerSize[size]}`}></div>
      {message && <p className="mt-4 text-gray-600 text-center">{message}</p>}
    </div>
  );
};

// ErrorBoundary Component (Simplified for this use case)
const ErrorBoundary = ({ children }) => {
  // In a real implementation, this would be a class component with componentDidCatch
  // But for now, we'll use a simple wrapper
  const [hasError, setHasError] = useState(false);
  
  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 p-8">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-red-700 mb-2">Something went wrong</h3>
          <p className="text-gray-600 mb-4">Please try refreshing the page</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
};

// PermissionGuard Component
const PermissionGuard = ({ allowedRoles, currentRole, children }) => {
  if (!currentRole || !allowedRoles.includes(currentRole)) {
    return null;
  }
  return <>{children}</>;
};

// RoleBadge Component
const RoleBadge = ({ role }) => {
  const getRoleConfig = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return { label: 'Admin', color: 'bg-red-100 text-red-800 border-red-200' };
      case 'department_head':
        return { label: 'Dept Head', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'dean':
        return { label: 'Dean', color: 'bg-green-100 text-green-800 border-green-200' };
      case 'instructor':
        return { label: 'Instructor', color: 'bg-gray-100 text-gray-800 border-gray-200' };
      case 'hr_director':
        return { label: 'HR Director', color: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'finance':
        return { label: 'Finance', color: 'bg-amber-100 text-amber-800 border-amber-200' };
      default:
        return { label: role || 'Unknown', color: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };
  
  const config = getRoleConfig(role);
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
      {config.label}
    </span>
  );
};

// StatusBadge Component
const StatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case 'draft':
        return { label: 'Draft', color: 'bg-gray-100 text-gray-800 border-gray-200' };
      case 'submitted':
        return { label: 'Submitted', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
      case 'dh_approved':
        return { label: 'Dept Approved', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'dean_approved':
        return { label: 'Dean Approved', color: 'bg-green-100 text-green-800 border-green-200' };
      case 'finance_approved':
        return { label: 'Finance Approved', color: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'paid':
        return { label: 'Paid', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'rejected':
        return { label: 'Rejected', color: 'bg-red-100 text-red-800 border-red-200' };
      case 'approved':
        return { label: 'Approved', color: 'bg-green-100 text-green-800 border-green-200' };
      default:
        return { label: status || 'Unknown', color: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };
  
  const config = getStatusConfig(status);
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
      {config.label}
    </span>
  );
};

// =============================================
// END OF MISSING COMPONENTS
// =============================================

// Constants
const WORKLOAD_TYPES = {
  RP: 'rp',
  NRP: 'nrp'
};

const PROGRAM_TYPES = {
  EXTENSION: 'extension',
  WEEKEND: 'weekend',
  SUMMER: 'summer',
  DISTANCE: 'distance'
};

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'dh_approved', label: 'Dept Head Approved' },
  { value: 'dean_approved', label: 'Dean Approved' },
  { value: 'finance_approved', label: 'Finance Approved' },
  { value: 'paid', label: 'Paid' },
  { value: 'rejected', label: 'Rejected' }
];

// Utility functions
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    return format(parseISO(dateString), "MMM dd, yyyy HH:mm");
  } catch {
    return dateString;
  }
};

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return "0.00";
  return parseFloat(amount).toLocaleString("en-ET", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatHours = (hours) => {
  if (hours === null || hours === undefined || isNaN(hours)) return "0.00";
  return parseFloat(hours).toFixed(2);
};

const calculateLoadPercentage = (current, max) => {
  if (!max || max === 0) return 0;
  return Math.min(100, (current / max) * 100);
};

// Custom hooks
const useWorkloadData = (workloadType, userId, userRole, staffId) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      const baseFilters = {
        ...filters,
        ...(userRole === 'instructor' && { staff_id: staffId }),
        ...(userRole === 'department_head' && { department_id: filters.department_id }),
        ...(userRole === 'dean' && { college_id: filters.college_id })
      };

      if (workloadType === WORKLOAD_TYPES.RP) {
        response = await workloadRPAPI.getAllWorkloads(baseFilters);
      } else {
        response = await workloadNRPAPI.getAllNRPWorkloads(baseFilters);
      }

      const workloads = response?.data?.workloads || response?.workloads || [];
      setData(Array.isArray(workloads) ? workloads : []);
    } catch (err) {
      console.error('Error fetching workload data:', err);
      setError(err.message || 'Failed to fetch data');
      toast.error('Failed to load workloads');
    } finally {
      setLoading(false);
    }
  }, [workloadType, userId, userRole, staffId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

const useSemesterData = () => {
  const [semesters, setSemesters] = useState([]);
  const [activeSemester, setActiveSemester] = useState(null);

  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        const response = await semesterAPI.getAllSemesters();
        const semestersData = response?.data?.semesters || response?.semesters || [];
        setSemesters(Array.isArray(semestersData) ? semestersData : []);
        
        if (semestersData.length > 0) {
          const active = semestersData.find(s => s.is_active) || semestersData[0];
          setActiveSemester(active);
        }
      } catch (error) {
        console.error('Error fetching semesters:', error);
        toast.error('Failed to load semesters');
      }
    };

    fetchSemesters();
  }, []);

  return { semesters, activeSemester };
};

// Enhanced Workload Manager Component
const CompleteWorkloadManager = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { workloadId, workloadType } = useParams();
  const location = useLocation();
  
  // Initialize active tab from URL or params
  const [activeTab, setActiveTab] = useState(
    workloadType || 
    location.state?.activeTab || 
    WORKLOAD_TYPES.RP
  );

  // Loading states
  const [loading, setLoading] = useState({
    workloads: false,
    calculations: false,
    form: false,
    submit: false
  });

  // Data states
  const [workloads, setWorkloads] = useState({
    [WORKLOAD_TYPES.RP]: [],
    [WORKLOAD_TYPES.NRP]: []
  });
  const [filteredWorkloads, setFilteredWorkloads] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [courses, setCourses] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [activeSemester, setActiveSemester] = useState(null);
  const [rules, setRules] = useState(null);
  const [rankLimits, setRankLimits] = useState({});
  const [loadFactors, setLoadFactors] = useState({});

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentWorkload, setCurrentWorkload] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // RP Form fields with validation
  const [rpForm, setRpForm] = useState({
    staff_id: "",
    semester_id: "",
    course_code: "",
    course_credit_hours: "",
    lecture_credit_hours: "",
    tutorial_credit_hours: "",
    lab_credit_hours: "",
    student_department: "",
    academic_year: "",
    number_of_sections: 1,
    each_section_course_load: "",
    variety_of_course_load: "",
    research_load: "",
    community_service_load: "",
    elip_load: "",
    hdp_load: "",
    course_chair_load: "",
    section_advisor_load: "",
    advising_load: "",
    position_load: "",
    total_load: "",
    over_payment_birr: "",
    status: "draft",
  });

  // NRP Form fields with validation
  const [nrpForm, setNrpForm] = useState({
    staff_id: "",
    semester_id: "",
    program_type: PROGRAM_TYPES.EXTENSION,
    contract_number: "",
    academic_year: "",
    academic_year_ec: "",
    contract_type: "teaching",
    course_id: "",
    course_code: "",
    course_title: "",
    credit_hours: "",
    lecture_credit_hours: "",
    lab_credit_hours: "",
    tutorial_credit_hours: "",
    lecture_sections: 0,
    lab_sections: 0,
    teaching_hours: "",
    module_hours: "",
    student_count: 0,
    assignment_students: 0,
    exam_students: 0,
    project_advising: "",
    project_groups: 0,
    rate_category: "default",
    rate_per_rank: "",
    assignment_rate: "25.00",
    exam_rate: "20.00",
    tutorial_rate_per_hour: "100.00",
    teaching_payment: "",
    tutorial_payment: "",
    assignment_payment: "",
    exam_payment: "",
    project_payment: "",
    total_payment: "",
    total_hours_worked: "",
    contract_duration_from: "",
    contract_duration_to: "",
    is_overload: false,
    overload_hours: "",
    overload_payment: "",
    status: "draft",
  });

  // Filters
  const [filters, setFilters] = useState({
    status: "all",
    semester: "all",
    search: "",
    program_type: "all",
    date_from: "",
    date_to: "",
    department_id: "",
    academic_rank: ""
  });

  // Stats
  const [stats, setStats] = useState({
    [WORKLOAD_TYPES.RP]: {
      total: 0, draft: 0, submitted: 0, approved: 0,
      totalHours: 0, totalPayment: 0, averageLoad: 0
    },
    [WORKLOAD_TYPES.NRP]: {
      total: 0, draft: 0, submitted: 0, approved: 0,
      totalHours: 0, totalPayment: 0, averagePayment: 0
    },
    overload: {
      totalStaff: 0, overloaded: 0, warning: 0, normal: 0,
      totalOverloadHours: 0, estimatedPayment: 0
    }
  });

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showCalculateModal, setShowCalculateModal] = useState(false);
  const [showOverloadModal, setShowOverloadModal] = useState(false);
  const [selectedWorkload, setSelectedWorkload] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);

  // Refs
  const formRef = useRef(null);
  const calculationRef = useRef(null);

  // Memoized values
  const userStaffId = useMemo(() => user?.staff_id, [user]);
  const userRole = useMemo(() => user?.role, [user]);
  const userDepartmentId = useMemo(() => user?.department_id, [user]);
  const userCollegeId = useMemo(() => user?.college_id, [user]);

  const canManageOthers = useMemo(() => 
    ['admin', 'department_head', 'dean', 'hr_director'].includes(userRole),
    [userRole]
  );

  const currentWorkloads = useMemo(() => 
    workloads[activeTab] || [],
    [workloads, activeTab]
  );

  // Fetch all initial data
  useEffect(() => {
    
   // In CompleteWorkloadManager.jsx - Fix the initializeData function
const initializeData = async () => {
  try {
    setLoading(prev => ({ ...prev, workloads: true }));

    // Fetch in parallel for better performance
    const fetchPromises = [
      semesterAPI.getAllSemesters(),
      courseAPI.getAllCourses()
    ];

    // Only add rules API call if user has permission
    const userRole = user?.role;
    const allowedRoles = ['admin', 'finance', 'hr_director', 'dean', 'department_head', 'instructor'];
    
    if (userRole && allowedRoles.includes(userRole)) {
      fetchPromises.push(rulesAPI.getAllRankLoadLimits());
    }

    const [semestersRes, coursesRes, rulesRes] = await Promise.allSettled(fetchPromises);

    // Process semesters
    if (semestersRes.status === 'fulfilled') {
      const semestersData = semestersRes.value?.data?.semesters || semestersRes.value?.semesters || [];
      setSemesters(semestersData);
      if (semestersData.length > 0) {
        const active = semestersData.find(s => s.is_active) || semestersData[0];
        setActiveSemester(active);
        setSelectedSemester(active.semester_id);
      }
    } else {
      console.warn('Failed to fetch semesters:', semestersRes.reason);
    }

    // Process courses
    if (coursesRes.status === 'fulfilled') {
      const coursesData = coursesRes.value?.data?.courses || coursesRes.value?.courses || [];
      setCourses(coursesData);
    } else {
      console.warn('Failed to fetch courses:', coursesRes.reason);
    }

    // Process rules - handle permission errors gracefully
    if (rulesRes) {
      if (rulesRes.status === 'fulfilled') {
        setRules(rulesRes.value?.data || {});
        setRankLimits(rulesRes.value?.data || {});
      } else {
        // Handle permission error - set default limits
        console.warn('Failed to fetch rank limits:', rulesRes.reason);
        setRankLimits({
          graduate_assistant: { min: 12, max: 16 },
          assistant_lecturer: { min: 10, max: 14 },
          lecturer: { min: 8, max: 12 },
          assistant_professor: { min: 6, max: 10 },
          associate_professor: { min: 4, max: 8 },
          professor: { min: 4, max: 6 }
        });
      }
    }

    // Load load factors
    try {
      const factorsRes = await rulesAPI.getLoadFactors();
      setLoadFactors(factorsRes?.data || {});
    } catch (error) {
      console.warn('Could not load load factors:', error);
      setLoadFactors({
        lab: 0.75,
        tutorial: 0.5,
        lecture: 1.0,
        module_distance: 1.0
      });
    }

    // Fetch staff members for admins and department heads
    if (canManageOthers) {
      try {
        const staffRes = await staffAPI.getAllStaff();
        const staffData = staffRes?.data?.staff || staffRes?.staff || [];
        setStaffMembers(staffData);
      } catch (error) {
        console.warn('Could not load staff members:', error);
      }
    }

    // Fetch workloads
    await fetchWorkloads();
  } catch (error) {
    console.error('Error initializing data:', error);
    toast.error('Failed to initialize application data');
  } finally {
    setLoading(prev => ({ ...prev, workloads: false }));
  }
};

    initializeData();
  }, [canManageOthers]);

  // Update URL when tab changes
  useEffect(() => {
    if (workloadType && workloadType !== activeTab) {
      navigate(`/workload/${activeTab}`, { replace: true });
    }
  }, [activeTab, navigate, workloadType]);

  // Set edit mode if workloadId is provided
  useEffect(() => {
    if (workloadId) {
      handleEditWorkload(workloadId);
    }
  }, [workloadId]);

  // Filter workloads when filters change
  useEffect(() => {
    filterWorkloads();
  }, [currentWorkloads, filters, activeTab]);

  // Main data fetching function
  const fetchWorkloads = async () => {
    try {
      setLoading(prev => ({ ...prev, workloads: true }));

      const baseFilters = {
        ...(userRole === 'instructor' && { staff_id: userStaffId }),
        ...(userRole === 'department_head' && userDepartmentId && { department_id: userDepartmentId }),
        ...(userRole === 'dean' && userCollegeId && { college_id: userCollegeId })
      };

      // Fetch both RP and NRP workloads in parallel
      const [rpResponse, nrpResponse, overloadResponse] = await Promise.all([
        workloadRPAPI.getAllWorkloads(baseFilters),
        workloadNRPAPI.getAllNRPWorkloads(baseFilters),
        // overloadAPI.getOverloadAlerts({ threshold: 80 })
       overloadDetectionAPI.getOverloadAlerts({ threshold: 80 }) 

      ]);

      // Process RP workloads
      const rpWorkloads = rpResponse?.data?.workloads || rpResponse?.workloads || [];
      
      // Process NRP workloads
      const nrpWorkloads = nrpResponse?.data?.workloads || nrpResponse?.workloads || [];
      
      // Process overload data
      const overloadData = overloadResponse?.data || {};

      setWorkloads({
        [WORKLOAD_TYPES.RP]: Array.isArray(rpWorkloads) ? rpWorkloads : [],
        [WORKLOAD_TYPES.NRP]: Array.isArray(nrpWorkloads) ? nrpWorkloads : []
      });

      // Calculate statistics
      calculateStats(rpWorkloads, nrpWorkloads, overloadData);
    } catch (error) {
      console.error('Error fetching workloads:', error);
      toast.error('Failed to load workloads');
    } finally {
      setLoading(prev => ({ ...prev, workloads: false }));
    }
  };

  // In CompleteWorkloadManager.jsx - Fix the fetchWorkloads function
// const fetchWorkloads = async () => {
//   try {
//     setLoading(prev => ({ ...prev, workloads: true }));

//     const baseFilters = {
//       ...(userRole === 'instructor' && { staff_id: userStaffId }),
//       ...(userRole === 'department_head' && userDepartmentId && { department_id: userDepartmentId }),
//       ...(userRole === 'dean' && userCollegeId && { college_id: userCollegeId })
//     };

//     // Fetch RP and NRP workloads
//     const [rpResponse, nrpResponse] = await Promise.allSettled([
//       workloadRPAPI.getAllWorkloads(baseFilters),
//       workloadNRPAPI.getAllNRPWorkloads(baseFilters),
//     ]);

//     // Process RP workloads
//     let rpWorkloads = [];
//     if (rpResponse.status === 'fulfilled') {
//       rpWorkloads = rpResponse.value?.data?.workloads || rpResponse.value?.workloads || [];
//       if (!Array.isArray(rpWorkloads)) {
//         console.warn('RP workloads is not an array:', rpWorkloads);
//         rpWorkloads = [];
//       }
//     } else {
//       console.error('Failed to fetch RP workloads:', rpResponse.reason);
//       toast.error('Failed to load RP workloads');
//     }

//     // Process NRP workloads
//     let nrpWorkloads = [];
//     if (nrpResponse.status === 'fulfilled') {
//       nrpWorkloads = nrpResponse.value?.data?.workloads || nrpResponse.value?.workloads || [];
//       if (!Array.isArray(nrpWorkloads)) {
//         console.warn('NRP workloads is not an array:', nrpWorkloads);
//         nrpWorkloads = [];
//       }
//     } else {
//       console.error('Failed to fetch NRP workloads:', nrpResponse.reason);
//       toast.error('Failed to load NRP workloads');
//     }

//     // Try to fetch overload alerts (non-critical, can fail)
//     let overloadData = {};
//     try {
//       if (['admin', 'hr_director', 'dean', 'department_head', 'instructor'].includes(userRole)) {
//         const overloadResponse = await overloadDetectionAPI.getOverloadAlerts({ 
//           threshold: 80,
//           department_id: userDepartmentId 
//         });
//         overloadData = overloadResponse || {};
//       }
//     } catch (overloadError) {
//       console.warn('Could not fetch overload alerts (non-critical):', overloadError);
//       // Don't show error toast for this as it's not critical
//       overloadData = {
//         total_staff: 0,
//         overloaded_staff: 0,
//         moderate_load_staff: 0,
//         normal_load_staff: 0,
//         summary: {
//           total_overload_hours: 0,
//           estimated_overload_payment: 0,
//           average_load_percentage: 0
//         }
//       };
//     }

//     setWorkloads({
//       [WORKLOAD_TYPES.RP]: rpWorkloads,
//       [WORKLOAD_TYPES.NRP]: nrpWorkloads
//     });

//     // Calculate statistics
//     calculateStats(rpWorkloads, nrpWorkloads, overloadData);
//   } catch (error) {
//     console.error('Error in fetchWorkloads:', error);
//     toast.error('Failed to load workloads. Please try again.');
    
//     // Set empty state on error
//     setWorkloads({
//       [WORKLOAD_TYPES.RP]: [],
//       [WORKLOAD_TYPES.NRP]: []
//     });
//     setFilteredWorkloads([]);
//   } finally {
//     setLoading(prev => ({ ...prev, workloads: false }));
//   }
// };

  // Calculate statistics
  const calculateStats = (rpWorkloads, nrpWorkloads, overloadData = {}) => {
    const rpArray = Array.isArray(rpWorkloads) ? rpWorkloads : [];
    const nrpArray = Array.isArray(nrpWorkloads) ? nrpWorkloads : [];

    // RP Stats
    const rpStats = {
      total: rpArray.length,
      draft: rpArray.filter(w => w.status === 'draft').length,
      submitted: rpArray.filter(w => w.status === 'submitted').length,
      approved: rpArray.filter(w => w.status?.includes('approved')).length,
      totalHours: rpArray.reduce((sum, w) => sum + (parseFloat(w.total_load) || 0), 0),
      totalPayment: rpArray.reduce((sum, w) => sum + (parseFloat(w.over_payment_birr) || 0), 0),
      averageLoad: rpArray.length > 0 ? 
        rpArray.reduce((sum, w) => sum + (parseFloat(w.total_load) || 0), 0) / rpArray.length : 0
    };

    // NRP Stats
    const nrpStats = {
      total: nrpArray.length,
      draft: nrpArray.filter(w => w.status === 'draft').length,
      submitted: nrpArray.filter(w => w.status === 'submitted').length,
      approved: nrpArray.filter(w => ['finance_approved', 'paid'].includes(w.status)).length,
      totalHours: nrpArray.reduce((sum, w) => sum + (parseFloat(w.total_hours_worked) || 0), 0),
      totalPayment: nrpArray.reduce((sum, w) => sum + (parseFloat(w.total_payment) || 0), 0),
      averagePayment: nrpArray.length > 0 ? 
        nrpArray.reduce((sum, w) => sum + (parseFloat(w.total_payment) || 0), 0) / nrpArray.length : 0
    };

    // Overload Stats
    const overloadStats = {
      totalStaff: overloadData.total_staff || 0,
      overloaded: overloadData.overloaded_staff || 0,
      warning: overloadData.moderate_load_staff || 0,
      normal: overloadData.normal_load_staff || 0,
      totalOverloadHours: overloadData.summary?.total_overload_hours || 0,
      estimatedPayment: overloadData.summary?.estimated_overload_payment || 0
    };

    setStats({
      [WORKLOAD_TYPES.RP]: rpStats,
      [WORKLOAD_TYPES.NRP]: nrpStats,
      overload: overloadStats
    });
  };

  // Filter workloads
  const filterWorkloads = () => {
    let filtered = [...currentWorkloads];

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(w => w.status === filters.status);
    }

    // Apply semester filter
    if (filters.semester !== 'all') {
      filtered = filtered.filter(w => w.semester_id?.toString() === filters.semester);
    }

    // Apply program type filter (for NRP)
    if (activeTab === WORKLOAD_TYPES.NRP && filters.program_type !== 'all') {
      filtered = filtered.filter(w => w.program_type === filters.program_type);
    }

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(w => 
        w.course_code?.toLowerCase().includes(searchLower) ||
        w.course_title?.toLowerCase().includes(searchLower) ||
        (activeTab === WORKLOAD_TYPES.NRP && w.contract_number?.toLowerCase().includes(searchLower)) ||
        w.staff_name?.toLowerCase().includes(searchLower)
      );
    }

    // Apply date filters
    if (filters.date_from) {
      filtered = filtered.filter(w => new Date(w.created_at) >= new Date(filters.date_from));
    }
    if (filters.date_to) {
      filtered = filtered.filter(w => new Date(w.created_at) <= new Date(filters.date_to));
    }

    // Apply department filter
    if (filters.department_id) {
      filtered = filtered.filter(w => w.department_id?.toString() === filters.department_id);
    }

    // Apply academic rank filter
    if (filters.academic_rank) {
      filtered = filtered.filter(w => w.academic_rank === filters.academic_rank);
    }

    setFilteredWorkloads(filtered);
  };

  // Tab change handler
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setShowForm(false);
    setEditMode(false);
    setCurrentWorkload(null);
    setFormErrors({});
  };

  // New workload handler
  const handleNewWorkload = () => {
    setShowForm(true);
    setEditMode(false);
    setCurrentWorkload(null);
    setFormErrors({});

    // Reset forms with defaults
    if (activeTab === WORKLOAD_TYPES.RP) {
      setRpForm({
        staff_id: userRole === 'instructor' ? userStaffId : '',
        semester_id: activeSemester?.semester_id || '',
        course_code: '',
        course_credit_hours: '',
        lecture_credit_hours: '',
        tutorial_credit_hours: '',
        lab_credit_hours: '',
        student_department: '',
        academic_year: new Date().getFullYear().toString(),
        number_of_sections: 1,
        each_section_course_load: '',
        variety_of_course_load: '',
        research_load: '',
        community_service_load: '',
        elip_load: '',
        hdp_load: '',
        course_chair_load: '',
        section_advisor_load: '',
        advising_load: '',
        position_load: '',
        total_load: '',
        over_payment_birr: '',
        status: 'draft',
      });
    } else {
      const currentYear = new Date().getFullYear();
      setNrpForm({
        staff_id: userRole === 'instructor' ? userStaffId : '',
        semester_id: activeSemester?.semester_id || '',
        program_type: PROGRAM_TYPES.EXTENSION,
        contract_number: `CONTRACT-${Date.now()}`,
        academic_year: `${currentYear}`,
        academic_year_ec: `${currentYear - 8}`, // Ethiopian calendar offset
        contract_type: 'teaching',
        course_id: '',
        course_code: '',
        course_title: '',
        credit_hours: '',
        lecture_credit_hours: '',
        lab_credit_hours: '',
        tutorial_credit_hours: '',
        lecture_sections: 0,
        lab_sections: 0,
        teaching_hours: '',
        module_hours: '',
        student_count: 0,
        assignment_students: 0,
        exam_students: 0,
        project_advising: '',
        project_groups: 0,
        rate_category: 'default',
        rate_per_rank: '500.00', // Default rate
        assignment_rate: '25.00',
        exam_rate: '20.00',
        tutorial_rate_per_hour: '100.00',
        teaching_payment: '',
        tutorial_payment: '',
        assignment_payment: '',
        exam_payment: '',
        project_payment: '',
        total_payment: '',
        total_hours_worked: '',
        contract_duration_from: format(new Date(), 'yyyy-MM-dd'),
        contract_duration_to: format(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        is_overload: false,
        overload_hours: '',
        overload_payment: '',
        status: 'draft',
      });
    }

    // Scroll to form
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Edit workload handler
  const handleEditWorkload = (id) => {
    const workload = currentWorkloads.find(w => 
      (activeTab === WORKLOAD_TYPES.RP ? w.workload_id : w.nrp_id) === parseInt(id)
    );

    if (workload) {
      // Check permissions
      if (!hasEditPermission(workload)) {
        toast.error('You do not have permission to edit this workload');
        return;
      }

      setCurrentWorkload(workload);
      setEditMode(true);
      setShowForm(true);
      setFormErrors({});

      if (activeTab === WORKLOAD_TYPES.RP) {
        setRpForm({
          staff_id: workload.staff_id || '',
          semester_id: workload.semester_id || '',
          course_code: workload.course_code || '',
          course_credit_hours: formatHours(workload.course_credit_hours),
          lecture_credit_hours: formatHours(workload.lecture_credit_hours),
          tutorial_credit_hours: formatHours(workload.tutorial_credit_hours),
          lab_credit_hours: formatHours(workload.lab_credit_hours),
          student_department: workload.student_department || '',
          academic_year: workload.academic_year || '',
          number_of_sections: workload.number_of_sections || 1,
          each_section_course_load: formatHours(workload.each_section_course_load),
          variety_of_course_load: formatHours(workload.variety_of_course_load),
          research_load: formatHours(workload.research_load),
          community_service_load: formatHours(workload.community_service_load),
          elip_load: formatHours(workload.elip_load),
          hdp_load: formatHours(workload.hdp_load),
          course_chair_load: formatHours(workload.course_chair_load),
          section_advisor_load: formatHours(workload.section_advisor_load),
          advising_load: formatHours(workload.advising_load),
          position_load: formatHours(workload.position_load),
          total_load: formatHours(workload.total_load),
          over_payment_birr: formatCurrency(workload.over_payment_birr),
          status: workload.status || 'draft',
        });
      } else {
        setNrpForm({
          staff_id: workload.staff_id || '',
          semester_id: workload.semester_id || '',
          program_type: workload.program_type || PROGRAM_TYPES.EXTENSION,
          contract_number: workload.contract_number || '',
          academic_year: workload.academic_year || '',
          academic_year_ec: workload.academic_year_ec || '',
          contract_type: workload.contract_type || 'teaching',
          course_id: workload.course_id || '',
          course_code: workload.course_code || '',
          course_title: workload.course_title || '',
          credit_hours: formatHours(workload.credit_hours),
          lecture_credit_hours: formatHours(workload.lecture_credit_hours),
          lab_credit_hours: formatHours(workload.lab_credit_hours),
          tutorial_credit_hours: formatHours(workload.tutorial_credit_hours),
          lecture_sections: workload.lecture_sections || 0,
          lab_sections: workload.lab_sections || 0,
          teaching_hours: formatHours(workload.teaching_hours),
          module_hours: formatHours(workload.module_hours),
          student_count: workload.student_count || 0,
          assignment_students: workload.assignment_students || 0,
          exam_students: workload.exam_students || 0,
          project_advising: workload.project_advising || '',
          project_groups: workload.project_groups || 0,
          rate_category: workload.rate_category || 'default',
          rate_per_rank: formatCurrency(workload.rate_per_rank || '500.00'),
          assignment_rate: formatCurrency(workload.assignment_rate || '25.00'),
          exam_rate: formatCurrency(workload.exam_rate || '20.00'),
          tutorial_rate_per_hour: formatCurrency(workload.tutorial_rate_per_hour || '100.00'),
          teaching_payment: formatCurrency(workload.teaching_payment),
          tutorial_payment: formatCurrency(workload.tutorial_payment),
          assignment_payment: formatCurrency(workload.assignment_payment),
          exam_payment: formatCurrency(workload.exam_payment),
          project_payment: formatCurrency(workload.project_payment),
          total_payment: formatCurrency(workload.total_payment),
          total_hours_worked: formatHours(workload.total_hours_worked),
          contract_duration_from: workload.contract_duration_from || '',
          contract_duration_to: workload.contract_duration_to || '',
          is_overload: Boolean(workload.is_overload),
          overload_hours: formatHours(workload.overload_hours),
          overload_payment: formatCurrency(workload.overload_payment),
          status: workload.status || 'draft',
        });
      }

      // Scroll to form
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      toast.error('Workload not found');
    }
  };

  // Permission checks
  const hasEditPermission = (workload) => {
    if (userRole === 'admin') return true;
    if (userRole === 'instructor' && workload.staff_id === userStaffId && workload.status === 'draft') return true;
    if (userRole === 'department_head' && workload.department_id === userDepartmentId && ['draft', 'rejected'].includes(workload.status)) return true;
    return false;
  };

  const hasDeletePermission = (workload) => {
    if (userRole === 'admin') return true;
    if (userRole === 'instructor' && workload.staff_id === userStaffId && workload.status === 'draft') return true;
    return false;
  };

  const hasSubmitPermission = (workload) => {
    if (userRole === 'instructor' && workload.staff_id === userStaffId && workload.status === 'draft') return true;
    return false;
  };

  // View details handler
  const handleViewDetails = (workload) => {
    setSelectedWorkload(workload);
    setShowDetailsModal(true);
  };

  // Delete click handler
  const handleDeleteClick = (workload) => {
    if (!hasDeletePermission(workload)) {
      toast.error('You do not have permission to delete this workload');
      return;
    }
    setSelectedWorkload(workload);
    setShowDeleteModal(true);
  };

  // Submit click handler
  const handleSubmitClick = (workload) => {
    if (!hasSubmitPermission(workload)) {
      toast.error('You do not have permission to submit this workload');
      return;
    }
    setSelectedWorkload(workload);
    setShowSubmitModal(true);
  };

  // Calculate click handler
  const handleCalculateClick = (workload) => {
    setSelectedWorkload(workload);
    setShowCalculateModal(true);
  };

  // Overload check handler
  const handleOverloadCheck = async () => {
    try {
      setLoading(prev => ({ ...prev, calculations: true }));
      const response = await overloadDetectionAPI.checkMyOverload({ semester_id: selectedSemester });
      setSelectedWorkload(response.data);
      setShowOverloadModal(true);
    } catch (error) {
      console.error('Error checking overload:', error);
      toast.error('Failed to check overload status');
    } finally {
      setLoading(prev => ({ ...prev, calculations: false }));
    }
  };

  // Delete confirm handler
  const handleDeleteConfirm = async () => {
    if (!selectedWorkload) return;

    try {
      setLoading(prev => ({ ...prev, form: true }));
      
      if (activeTab === WORKLOAD_TYPES.RP) {
        await workloadRPAPI.deleteWorkload(selectedWorkload.workload_id);
      } else {
        await workloadNRPAPI.deleteNRPWorkload(selectedWorkload.nrp_id);
      }
      
      toast.success('Workload deleted successfully');
      await fetchWorkloads();
      setShowDeleteModal(false);
      setSelectedWorkload(null);
    } catch (error) {
      console.error('Error deleting workload:', error);
      toast.error(error.response?.data?.message || 'Failed to delete workload');
    } finally {
      setLoading(prev => ({ ...prev, form: false }));
    }
  };

  // Submit confirm handler
  const handleSubmitConfirm = async () => {
    if (!selectedWorkload) return;

    try {
      setLoading(prev => ({ ...prev, submit: true }));
      
      // Validate workload before submission
      if (activeTab === WORKLOAD_TYPES.RP) {
        const validation = await workloadRPAPI.validateWorkload(selectedWorkload.workload_id);
        if (!validation.data?.valid) {
          toast.error('Please fix validation errors before submission');
          return;
        }
        await workloadRPAPI.submitWorkload(selectedWorkload.workload_id);
      } else {
        const validation = await workloadNRPAPI.validateWorkload(selectedWorkload.nrp_id);
        if (!validation.data?.valid) {
          toast.error('Please fix validation errors before submission');
          return;
        }
        await workloadNRPAPI.submitForApproval(selectedWorkload.nrp_id);
      }
      
      toast.success('Workload submitted for approval');
      await fetchWorkloads();
      setShowSubmitModal(false);
      setSelectedWorkload(null);
    } catch (error) {
      console.error('Error submitting workload:', error);
      toast.error(error.response?.data?.message || 'Failed to submit workload');
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  // Form change handlers
  const handleRpFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setRpForm(prev => {
      const updated = { ...prev, [name]: newValue };
      
      // Recalculate total load if load-related field changes
      if (name.includes('_load') && name !== 'total_load') {
        const total = calculateRpTotalLoad(updated);
        updated.total_load = total.toFixed(2);
      }
      
      return updated;
    });

    // Clear field error
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleNrpFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setNrpForm(prev => {
      const updated = { ...prev, [name]: newValue };
      
      // Recalculate if payment-related field changes
      if (name.includes('_hours') || name.includes('rate') || name === 'credit_hours' || name === 'student_count') {
        const calculations = calculateNrpPayments(updated);
        Object.assign(updated, calculations);
      }
      
      return updated;
    });

    // Clear field error
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Calculation functions
  const calculateRpTotalLoad = (formData) => {
    const courseLoad = (parseFloat(formData.each_section_course_load) || 0) * (parseInt(formData.number_of_sections) || 1);
    const varietyLoad = parseFloat(formData.variety_of_course_load) || 0;
    const researchLoad = parseFloat(formData.research_load) || 0;
    const communityLoad = parseFloat(formData.community_service_load) || 0;
    const elipLoad = parseFloat(formData.elip_load) || 0;
    const hdpLoad = parseFloat(formData.hdp_load) || 0;
    const courseChairLoad = parseFloat(formData.course_chair_load) || 0;
    const sectionAdvisorLoad = parseFloat(formData.section_advisor_load) || 0;
    const advisingLoad = parseFloat(formData.advising_load) || 0;
    const positionLoad = parseFloat(formData.position_load) || 0;
    
    return courseLoad + varietyLoad + researchLoad + communityLoad + 
           elipLoad + hdpLoad + courseChairLoad + sectionAdvisorLoad + 
           advisingLoad + positionLoad;
  };

  const calculateNrpPayments = (formData) => {
    const calculations = {};
    const programType = formData.program_type;
    const ratePerRank = parseFloat(formData.rate_per_rank) || 500;
    
    // Calculate based on program type
    switch (programType) {
      case PROGRAM_TYPES.EXTENSION:
      case PROGRAM_TYPES.WEEKEND:
        const creditHours = parseFloat(formData.credit_hours) || 0;
        calculations.teaching_payment = (creditHours * ratePerRank).toFixed(2);
        calculations.total_hours_worked = (creditHours * 15).toFixed(2); // 15 hours per credit
        break;
        
      case PROGRAM_TYPES.SUMMER:
        const teachingHours = parseFloat(formData.teaching_hours) || 0;
        calculations.teaching_payment = (teachingHours * ratePerRank).toFixed(2);
        calculations.total_hours_worked = teachingHours.toFixed(2);
        break;
        
      case PROGRAM_TYPES.DISTANCE:
        const moduleHours = parseFloat(formData.module_hours) || 0;
        calculations.teaching_payment = (moduleHours * ratePerRank * 1.2).toFixed(2); // 20% extra for distance
        calculations.total_hours_worked = moduleHours.toFixed(2);
        break;
    }
    
    // Calculate additional payments
    const assignmentPayment = (parseInt(formData.assignment_students) || 0) * (parseFloat(formData.assignment_rate) || 25);
    const examPayment = (parseInt(formData.exam_students) || 0) * (parseFloat(formData.exam_rate) || 20);
    const tutorialPayment = (parseFloat(formData.tutorial_credit_hours) || 0) * (parseFloat(formData.tutorial_rate_per_hour) || 100);
    const overloadPayment = formData.is_overload ? 
      (parseFloat(formData.overload_hours) || 0) * (ratePerRank * 1.5) : 0;
    
    calculations.assignment_payment = assignmentPayment.toFixed(2);
    calculations.exam_payment = examPayment.toFixed(2);
    calculations.tutorial_payment = tutorialPayment.toFixed(2);
    calculations.overload_payment = overloadPayment.toFixed(2);
    
    // Calculate total payment
    const totalPayment = parseFloat(calculations.teaching_payment || 0) +
                        parseFloat(calculations.assignment_payment || 0) +
                        parseFloat(calculations.exam_payment || 0) +
                        parseFloat(calculations.tutorial_payment || 0) +
                        parseFloat(calculations.overload_payment || 0);
    
    calculations.total_payment = totalPayment.toFixed(2);
    
    return calculations;
  };

  // Form validation
  const validateRpForm = () => {
    const errors = {};
    
    if (!rpForm.semester_id) errors.semester_id = 'Semester is required';
    if (!rpForm.course_code) errors.course_code = 'Course code is required';
    if (!rpForm.number_of_sections || rpForm.number_of_sections < 1) 
      errors.number_of_sections = 'Number of sections must be at least 1';
    
    // Validate numeric fields
    const numericFields = ['course_credit_hours', 'lecture_credit_hours', 'tutorial_credit_hours', 
                          'lab_credit_hours', 'each_section_course_load'];
    
    numericFields.forEach(field => {
      if (rpForm[field] && (isNaN(rpForm[field]) || parseFloat(rpForm[field]) < 0)) {
        errors[field] = 'Must be a valid positive number';
      }
    });
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateNrpForm = () => {
    const errors = {};
    
    if (!nrpForm.semester_id) errors.semester_id = 'Semester is required';
    if (!nrpForm.program_type) errors.program_type = 'Program type is required';
    if (!nrpForm.course_code && !nrpForm.course_title) 
      errors.course_code = 'Course code or title is required';
    
    // Validate based on program type
    switch (nrpForm.program_type) {
      case PROGRAM_TYPES.EXTENSION:
      case PROGRAM_TYPES.WEEKEND:
        if (!nrpForm.credit_hours) errors.credit_hours = 'Credit hours are required';
        break;
      case PROGRAM_TYPES.SUMMER:
        if (!nrpForm.teaching_hours) errors.teaching_hours = 'Teaching hours are required';
        break;
      case PROGRAM_TYPES.DISTANCE:
        if (!nrpForm.module_hours) errors.module_hours = 'Module hours are required';
        break;
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form submission handlers
  const handleRpSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateRpForm()) {
      toast.error('Please fix form errors');
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, form: true }));
      
      const formData = {
        ...rpForm,
        staff_id: userRole === 'instructor' ? userStaffId : rpForm.staff_id,
        course_credit_hours: parseFloat(rpForm.course_credit_hours) || 0,
        lecture_credit_hours: parseFloat(rpForm.lecture_credit_hours) || 0,
        tutorial_credit_hours: parseFloat(rpForm.tutorial_credit_hours) || 0,
        lab_credit_hours: parseFloat(rpForm.lab_credit_hours) || 0,
        number_of_sections: parseInt(rpForm.number_of_sections) || 1,
        each_section_course_load: parseFloat(rpForm.each_section_course_load) || 0,
        variety_of_course_load: parseFloat(rpForm.variety_of_course_load) || 0,
        research_load: parseFloat(rpForm.research_load) || 0,
        community_service_load: parseFloat(rpForm.community_service_load) || 0,
        elip_load: parseFloat(rpForm.elip_load) || 0,
        hdp_load: parseFloat(rpForm.hdp_load) || 0,
        course_chair_load: parseFloat(rpForm.course_chair_load) || 0,
        section_advisor_load: parseFloat(rpForm.section_advisor_load) || 0,
        advising_load: parseFloat(rpForm.advising_load) || 0,
        position_load: parseFloat(rpForm.position_load) || 0,
        total_load: parseFloat(rpForm.total_load) || 0,
        over_payment_birr: parseFloat(rpForm.over_payment_birr) || 0,
      };
      
      let response;
      if (editMode && currentWorkload) {
        response = await workloadRPAPI.updateWorkload(currentWorkload.workload_id, formData);
        toast.success('RP workload updated successfully');
      } else {
        response = await workloadRPAPI.createWorkload(formData);
        toast.success('RP workload created successfully');
      }
      
      // Reset and refresh
      setShowForm(false);
      setEditMode(false);
      setCurrentWorkload(null);
      setFormErrors({});
      await fetchWorkloads();
      
    } catch (error) {
      console.error('Error saving RP workload:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to save workload';
      toast.error(errorMessage);
      
      // Set form errors from API response
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
      }
    } finally {
      setLoading(prev => ({ ...prev, form: false }));
    }
  };

  const handleNrpSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateNrpForm()) {
      toast.error('Please fix form errors');
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, form: true }));
      
      const formData = {
        ...nrpForm,
        staff_id: userRole === 'instructor' ? userStaffId : nrpForm.staff_id,
        credit_hours: parseFloat(nrpForm.credit_hours) || 0,
        lecture_credit_hours: parseFloat(nrpForm.lecture_credit_hours) || 0,
        lab_credit_hours: parseFloat(nrpForm.lab_credit_hours) || 0,
        tutorial_credit_hours: parseFloat(nrpForm.tutorial_credit_hours) || 0,
        lecture_sections: parseInt(nrpForm.lecture_sections) || 0,
        lab_sections: parseInt(nrpForm.lab_sections) || 0,
        teaching_hours: parseFloat(nrpForm.teaching_hours) || 0,
        module_hours: parseFloat(nrpForm.module_hours) || 0,
        student_count: parseInt(nrpForm.student_count) || 0,
        assignment_students: parseInt(nrpForm.assignment_students) || 0,
        exam_students: parseInt(nrpForm.exam_students) || 0,
        project_groups: parseInt(nrpForm.project_groups) || 0,
        rate_per_rank: parseFloat(nrpForm.rate_per_rank) || 0,
        assignment_rate: parseFloat(nrpForm.assignment_rate) || 25.0,
        exam_rate: parseFloat(nrpForm.exam_rate) || 20.0,
        tutorial_rate_per_hour: parseFloat(nrpForm.tutorial_rate_per_hour) || 100.0,
        teaching_payment: parseFloat(nrpForm.teaching_payment) || 0,
        tutorial_payment: parseFloat(nrpForm.tutorial_payment) || 0,
        assignment_payment: parseFloat(nrpForm.assignment_payment) || 0,
        exam_payment: parseFloat(nrpForm.exam_payment) || 0,
        project_payment: parseFloat(nrpForm.project_payment) || 0,
        total_payment: parseFloat(nrpForm.total_payment) || 0,
        total_hours_worked: parseFloat(nrpForm.total_hours_worked) || 0,
        overload_hours: parseFloat(nrpForm.overload_hours) || 0,
        overload_payment: parseFloat(nrpForm.overload_payment) || 0,
        is_overload: nrpForm.is_overload ? 1 : 0,
      };
      
      let response;
      if (editMode && currentWorkload) {
        response = await workloadNRPAPI.updateNRPWorkload(currentWorkload.nrp_id, formData);
        toast.success('NRP workload updated successfully');
      } else {
        response = await workloadNRPAPI.createNRPWorkload(formData);
        toast.success('NRP workload created successfully');
      }
      
      // Reset and refresh
      setShowForm(false);
      setEditMode(false);
      setCurrentWorkload(null);
      setFormErrors({});
      await fetchWorkloads();
      
    } catch (error) {
      console.error('Error saving NRP workload:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to save workload';
      toast.error(errorMessage);
      
      // Set form errors from API response
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
      }
    } finally {
      setLoading(prev => ({ ...prev, form: false }));
    }
  };

  // Course select handler
  const handleCourseSelect = (courseId) => {
    const course = courses.find(c => c.course_id === parseInt(courseId));
    if (!course) return;
    
    if (activeTab === WORKLOAD_TYPES.RP) {
      setRpForm(prev => ({
        ...prev,
        course_code: course.course_code || '',
        course_credit_hours: formatHours(course.credit_hours),
        lecture_credit_hours: formatHours(course.lecture_hours),
        lab_credit_hours: formatHours(course.lab_hours),
        tutorial_credit_hours: formatHours(course.tutorial_hours),
        each_section_course_load: formatHours(course.credit_hours * 1.5), // Default calculation
      }));
    } else {
      setNrpForm(prev => ({
        ...prev,
        course_id: course.course_id || '',
        course_code: course.course_code || '',
        course_title: course.course_title || '',
        credit_hours: formatHours(course.credit_hours),
        lecture_credit_hours: formatHours(course.lecture_hours),
        lab_credit_hours: formatHours(course.lab_hours),
        tutorial_credit_hours: formatHours(course.tutorial_hours),
      }));
    }
  };

  // Export functionality
  const handleExportWorkloads = async () => {
    try {
     const response = await exportAPI.generateReport({ // ✅ NEW
        format: 'excel',
        report_type: activeTab === WORKLOAD_TYPES.RP ? 'rp_workloads' : 'nrp_workloads',
        filters: {
          ...filters,
          semester_id: filters.semester !== 'all' ? filters.semester : undefined,
          status: filters.status !== 'all' ? filters.status : undefined,
          program_type: filters.program_type !== 'all' ? filters.program_type : undefined,
        }
      });
      
      // Create download link
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `workloads_${activeTab}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Workloads exported successfully');
    } catch (error) {
      console.error('Error exporting workloads:', error);
      toast.error('Failed to export workloads');
    }
  };

  // Calculate from sections
  const handleCalculateFromSections = async () => {
    try {
      setLoading(prev => ({ ...prev, calculations: true }));
      const response = await workloadRPAPI.calculateFromSections({
        staff_id: userStaffId,
        semester_id: activeSemester?.semester_id
      });
      
      if (response.data) {
        setRpForm(prev => ({
          ...prev,
          ...response.data,
          status: 'draft'
        }));
        toast.success('Workload calculated from sections');
      }
    } catch (error) {
      console.error('Error calculating from sections:', error);
      toast.error('Failed to calculate from sections');
    } finally {
      setLoading(prev => ({ ...prev, calculations: false }));
    }
  };

  // Calculate payment
  const handleCalculatePayment = async () => {
    try {
      setLoading(prev => ({ ...prev, calculations: true }));
      const response = await workloadNRPAPI.calculatePayment(selectedWorkload.nrp_id);
      
      if (response.data) {
        setNrpForm(prev => ({
          ...prev,
          ...response.data
        }));
        toast.success('Payment calculated successfully');
      }
    } catch (error) {
      console.error('Error calculating payment:', error);
      toast.error('Failed to calculate payment');
    } finally {
      setLoading(prev => ({ ...prev, calculations: false }));
    }
  };

  // Loading state
  if (loading.workloads && !workloads[activeTab]?.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner message="Loading workload manager..." />
      </div>
    );
  }

  const currentStats = stats[activeTab];
  const totalWorkloads = filteredWorkloads.length;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-800 via-blue-1000 to-blue-800 text-white shadow-xl">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    {activeTab === WORKLOAD_TYPES.RP ? (
                      <BookOpen className="h-8 w-8" />
                    ) : (
                      <Calendar className="h-8 w-8" />
                    )}
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold mb-1">
                      {activeTab === WORKLOAD_TYPES.RP ? 'Regular Program' : 'Non-Regular Program'} Workload Management
                    </h1>
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2 text-blue-100">
                        <RoleBadge role={userRole} />
                        <span className="text-sm">{user?.email}</span>
                      </div>
                      {activeSemester && (
                        <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm">{activeSemester.semester_name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-blue-100 max-w-3xl">
                  {activeTab === WORKLOAD_TYPES.RP 
                    ? 'Manage your regular teaching workload, administrative duties, and track your load distribution'
                    : 'Manage extension, weekend, summer, and distance program workloads with payment calculations'}
                </p>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={fetchWorkloads}
                  disabled={loading.workloads}
                  className="px-4 py-2.5 bg-white/20 hover:bg-white/30 rounded-lg flex items-center gap-2 transition-all duration-200 disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${loading.workloads ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
                
                <button
                  onClick={handleOverloadCheck}
                  disabled={loading.calculations}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 rounded-lg flex items-center gap-2 transition-all duration-200 disabled:opacity-50"
                >
                  <AlertCircle className="h-4 w-4" />
                  <span>Check Overload</span>
                </button>
                
                <PermissionGuard
                  allowedRoles={['instructor', 'department_head', 'dean', 'admin']}
                  currentRole={userRole}
                >
                  <button
                    onClick={handleNewWorkload}
                    disabled={loading.form || loading.submit}
                    className="px-4 py-2.5 bg-white hover:bg-gray-50 text-blue-600 rounded-lg flex items-center gap-2 transition-all duration-200 disabled:opacity-50 shadow-lg"
                  >
                    <Plus className="h-5 w-5" />
                    <span className="font-semibold">New Workload</span>
                  </button>
                </PermissionGuard>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 -mt-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex border-b">
              <button
                onClick={() => handleTabChange(WORKLOAD_TYPES.RP)}
                className={`flex-1 px-6 py-4 text-center font-medium transition-all duration-200 ${
                  activeTab === WORKLOAD_TYPES.RP
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  <span>Regular Program (RP)</span>
                  {stats[WORKLOAD_TYPES.RP].total > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      activeTab === WORKLOAD_TYPES.RP
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {stats[WORKLOAD_TYPES.RP].total}
                    </span>
                  )}
                </div>
              </button>
              
              <button
                onClick={() => handleTabChange(WORKLOAD_TYPES.NRP)}
                className={`flex-1 px-6 py-4 text-center font-medium transition-all duration-200 ${
                  activeTab === WORKLOAD_TYPES.NRP
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>Non-Regular Program (NRP)</span>
                  {stats[WORKLOAD_TYPES.NRP].total > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      activeTab === WORKLOAD_TYPES.NRP
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {stats[WORKLOAD_TYPES.NRP].total}
                    </span>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Dashboard */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Workloads</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{currentStats.total}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${currentStats.draft > 0 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                      {currentStats.draft} Draft
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${currentStats.submitted > 0 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                      {currentStats.submitted} Submitted
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {activeTab === WORKLOAD_TYPES.RP ? 'Total Hours' : 'Total Payment'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {activeTab === WORKLOAD_TYPES.RP
                      ? `${formatHours(currentStats.totalHours)}h`
                      : `ETB ${formatCurrency(currentStats.totalPayment)}`}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Avg: {activeTab === WORKLOAD_TYPES.RP
                      ? `${formatHours(currentStats.averageLoad)}h/workload`
                      : `ETB ${formatCurrency(currentStats.averagePayment)}/workload`}
                  </p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-lg">
                  {activeTab === WORKLOAD_TYPES.RP ? (
                    <Clock className="h-6 w-6 text-emerald-600" />
                  ) : (
                    <DollarSign className="h-6 w-6 text-emerald-600" />
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approval Status</p>
                  <p className="text-2xl font-bold text-amber-600 mt-2">{currentStats.approved}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {((currentStats.approved / (currentStats.total || 1)) * 100).toFixed(1)}% approved rate
                  </p>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overload Status</p>
                  <p className="text-2xl font-bold text-red-600 mt-2">{stats.overload.overloaded}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {stats.overload.totalStaff > 0
                      ? `${((stats.overload.overloaded / stats.overload.totalStaff) * 100).toFixed(1)}% overloaded`
                      : 'No staff data'}
                  </p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-8 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                {activeTab === WORKLOAD_TYPES.RP && (
                  <button
                    onClick={handleCalculateFromSections}
                    disabled={loading.calculations}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <Calculator className="h-4 w-4" />
                    <span>Calculate from Sections</span>
                  </button>
                )}
                
                <button
                  onClick={handleExportWorkloads}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>Export to Excel</span>
                </button>
                
                <button
                  onClick={() => navigate('/reports/workload-summary')}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <BarChart className="h-4 w-4" />
                  <span>View Reports</span>
                </button>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  {totalWorkloads} workload{totalWorkloads !== 1 ? 's' : ''} found
                </span>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
              <div className="flex-1">
                <div className="relative max-w-lg">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={`Search ${activeTab.toUpperCase()} workloads...`}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                <select
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                >
                  {STATUS_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                
                <select
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filters.semester}
                  onChange={(e) => setFilters(prev => ({ ...prev, semester: e.target.value }))}
                >
                  <option value="all">All Semesters</option>
                  {semesters.map(semester => (
                    <option key={semester.semester_id} value={semester.semester_id}>
                      {semester.semester_code} - {semester.semester_name}
                    </option>
                  ))}
                </select>
                
                {activeTab === WORKLOAD_TYPES.NRP && (
                  <select
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={filters.program_type}
                    onChange={(e) => setFilters(prev => ({ ...prev, program_type: e.target.value }))}
                  >
                    <option value="all">All Programs</option>
                    {Object.values(PROGRAM_TYPES).map(type => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                )}
                
                <button
                  onClick={() => setFilters({
                    status: "all",
                    semester: "all",
                    search: "",
                    program_type: "all",
                    date_from: "",
                    date_to: "",
                    department_id: "",
                    academic_rank: ""
                  })}
                  className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <Filter className="h-5 w-5 text-gray-600" />
                  <span>Clear Filters</span>
                </button>
              </div>
            </div>
            
            {/* Advanced Filters */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">From:</span>
                  <input
                    type="date"
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                    value={filters.date_from}
                    onChange={(e) => setFilters(prev => ({ ...prev, date_from: e.target.value }))}
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">To:</span>
                  <input
                    type="date"
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                    value={filters.date_to}
                    onChange={(e) => setFilters(prev => ({ ...prev, date_to: e.target.value }))}
                  />
                </div>
                
                {canManageOthers && (
                  <>
                    <select
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                      value={filters.department_id}
                      onChange={(e) => setFilters(prev => ({ ...prev, department_id: e.target.value }))}
                    >
                      <option value="">All Departments</option>
                      {/* Add department options here */}
                    </select>
                    
                    <select
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                      value={filters.academic_rank}
                      onChange={(e) => setFilters(prev => ({ ...prev, academic_rank: e.target.value }))}
                    >
                      <option value="">All Ranks</option>
                      <option value="professor">Professor</option>
                      <option value="associate_professor">Associate Professor</option>
                      <option value="assistant_professor">Assistant Professor</option>
                      <option value="lecturer">Lecturer</option>
                      <option value="assistant_lecturer">Assistant Lecturer</option>
                      <option value="graduate_assistant">Graduate Assistant</option>
                    </select>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Workload Form */}
          {showForm && (
            <div ref={formRef} className="bg-white rounded-xl border border-gray-200 shadow-lg mb-8 animate-fadeIn">
              <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {editMode ? 'Edit' : 'Create New'} {activeTab.toUpperCase()} Workload
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {editMode ? 'Update the workload details' : 'Fill in all required fields to create a new workload'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditMode(false);
                      setCurrentWorkload(null);
                      setFormErrors({});
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
              </div>
              
              <form
                onSubmit={activeTab === WORKLOAD_TYPES.RP ? handleRpSubmit : handleNrpSubmit}
                className="p-6"
              >
                {activeTab === WORKLOAD_TYPES.RP ? (
                  // RP Workload Form
                  <div className="space-y-8">
                    {/* Basic Information */}
                    <FormSection
                      title="Basic Information"
                      icon={BookOpen}
                      description="Select semester, course, and basic workload information"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FormField
                          label="Semester *"
                          error={formErrors.semester_id}
                        >
                          <select
                            name="semester_id"
                            value={rpForm.semester_id}
                            onChange={handleRpFormChange}
                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              formErrors.semester_id ? 'border-red-300' : 'border-gray-300'
                            }`}
                            required
                          >
                            <option value="">Select Semester</option>
                            {semesters.map(semester => (
                              <option key={semester.semester_id} value={semester.semester_id}>
                                {semester.semester_name} ({semester.semester_code})
                              </option>
                            ))}
                          </select>
                        </FormField>
                        
                        <FormField
                          label="Course *"
                          error={formErrors.course_code}
                        >
                          <select
                            name="course_code"
                            value={rpForm.course_code}
                            onChange={handleRpFormChange}
                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              formErrors.course_code ? 'border-red-300' : 'border-gray-300'
                            }`}
                            required
                          >
                            <option value="">Select Course</option>
                            {courses.map(course => (
                              <option key={course.course_id} value={course.course_code}>
                                {course.course_code} - {course.course_title}
                              </option>
                            ))}
                          </select>
                        </FormField>
                        
                        {canManageOthers && (
                          <FormField
                            label="Staff Member"
                            error={formErrors.staff_id}
                          >
                            <select
                              name="staff_id"
                              value={rpForm.staff_id}
                              onChange={handleRpFormChange}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Select Staff</option>
                              {staffMembers.map(staff => (
                                <option key={staff.staff_id} value={staff.staff_id}>
                                  {staff.first_name} {staff.last_name} ({staff.employee_id})
                                </option>
                              ))}
                            </select>
                          </FormField>
                        )}
                        
                        <FormField
                          label="Student Department"
                          error={formErrors.student_department}
                        >
                          <input
                            type="text"
                            name="student_department"
                            value={rpForm.student_department}
                            onChange={handleRpFormChange}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., Software Engineering"
                          />
                        </FormField>
                        
                        <FormField
                          label="Academic Year"
                          error={formErrors.academic_year}
                        >
                          <input
                            type="text"
                            name="academic_year"
                            value={rpForm.academic_year}
                            onChange={handleRpFormChange}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., 2024-2025"
                          />
                        </FormField>
                        
                        <FormField
                          label="Number of Sections *"
                          error={formErrors.number_of_sections}
                        >
                          <input
                            type="number"
                            name="number_of_sections"
                            value={rpForm.number_of_sections}
                            onChange={handleRpFormChange}
                            min="1"
                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              formErrors.number_of_sections ? 'border-red-300' : 'border-gray-300'
                            }`}
                            required
                          />
                        </FormField>
                      </div>
                    </FormSection>
                    
                    {/* Credit Hours */}
                    <FormSection
                      title="Credit Hours"
                      icon={GraduationCap}
                      description="Enter course credit hours distribution"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <FormField
                          label="Course Credit Hours"
                          error={formErrors.course_credit_hours}
                        >
                          <input
                            type="number"
                            step="0.01"
                            name="course_credit_hours"
                            value={rpForm.course_credit_hours}
                            onChange={handleRpFormChange}
                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              formErrors.course_credit_hours ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="0.00"
                          />
                        </FormField>
                        
                        <FormField
                          label="Lecture Hours"
                          error={formErrors.lecture_credit_hours}
                        >
                          <input
                            type="number"
                            step="0.01"
                            name="lecture_credit_hours"
                            value={rpForm.lecture_credit_hours}
                            onChange={handleRpFormChange}
                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              formErrors.lecture_credit_hours ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="0.00"
                          />
                        </FormField>
                        
                        <FormField
                          label="Lab Hours"
                          error={formErrors.lab_credit_hours}
                        >
                          <input
                            type="number"
                            step="0.01"
                            name="lab_credit_hours"
                            value={rpForm.lab_credit_hours}
                            onChange={handleRpFormChange}
                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              formErrors.lab_credit_hours ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="0.00"
                          />
                        </FormField>
                        
                        <FormField
                          label="Tutorial Hours"
                          error={formErrors.tutorial_credit_hours}
                        >
                          <input
                            type="number"
                            step="0.01"
                            name="tutorial_credit_hours"
                            value={rpForm.tutorial_credit_hours}
                            onChange={handleRpFormChange}
                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              formErrors.tutorial_credit_hours ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="0.00"
                          />
                        </FormField>
                      </div>
                    </FormSection>
                    
                    {/* Load Distribution */}
                    <FormSection
                      title="Load Distribution"
                      icon={Target}
                      description="Distribute teaching, research, and community service loads"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FormField
                          label="Per Section Course Load"
                          error={formErrors.each_section_course_load}
                        >
                          <input
                            type="number"
                            step="0.01"
                            name="each_section_course_load"
                            value={rpForm.each_section_course_load}
                            onChange={handleRpFormChange}
                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              formErrors.each_section_course_load ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="0.00"
                          />
                        </FormField>
                        
                        <FormField
                          label="Variety of Course Load"
                          error={formErrors.variety_of_course_load}
                        >
                          <input
                            type="number"
                            step="0.01"
                            name="variety_of_course_load"
                            value={rpForm.variety_of_course_load}
                            onChange={handleRpFormChange}
                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              formErrors.variety_of_course_load ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="0.00"
                          />
                        </FormField>
                        
                        <FormField
                          label="Research Load"
                          error={formErrors.research_load}
                        >
                          <input
                            type="number"
                            step="0.01"
                            name="research_load"
                            value={rpForm.research_load}
                            onChange={handleRpFormChange}
                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              formErrors.research_load ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="0.00"
                          />
                        </FormField>
                        
                        <FormField
                          label="Community Service Load"
                          error={formErrors.community_service_load}
                        >
                          <input
                            type="number"
                            step="0.01"
                            name="community_service_load"
                            value={rpForm.community_service_load}
                            onChange={handleRpFormChange}
                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              formErrors.community_service_load ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="0.00"
                          />
                        </FormField>
                      </div>
                    </FormSection>
                    
                    {/* Administrative Load */}
                    <FormSection
                      title="Administrative Load"
                      icon={Building}
                      description="Enter administrative and leadership duties"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FormField
                          label="ELIP Load"
                          error={formErrors.elip_load}
                        >
                          <input
                            type="number"
                            step="0.01"
                            name="elip_load"
                            value={rpForm.elip_load}
                            onChange={handleRpFormChange}
                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              formErrors.elip_load ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="0.00"
                          />
                        </FormField>
                        
                        <FormField
                          label="HDP Load"
                          error={formErrors.hdp_load}
                        >
                          <input
                            type="number"
                            step="0.01"
                            name="hdp_load"
                            value={rpForm.hdp_load}
                            onChange={handleRpFormChange}
                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              formErrors.hdp_load ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="0.00"
                          />
                        </FormField>
                        
                        <FormField
                          label="Course Chair Load"
                          error={formErrors.course_chair_load}
                        >
                          <input
                            type="number"
                            step="0.01"
                            name="course_chair_load"
                            value={rpForm.course_chair_load}
                            onChange={handleRpFormChange}
                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              formErrors.course_chair_load ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="0.00"
                          />
                        </FormField>
                        
                        <FormField
                          label="Section Advisor Load"
                          error={formErrors.section_advisor_load}
                        >
                          <input
                            type="number"
                            step="0.01"
                            name="section_advisor_load"
                            value={rpForm.section_advisor_load}
                            onChange={handleRpFormChange}
                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              formErrors.section_advisor_load ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="0.00"
                          />
                        </FormField>
                        
                        <FormField
                          label="Advising Load"
                          error={formErrors.advising_load}
                        >
                          <input
                            type="number"
                            step="0.01"
                            name="advising_load"
                            value={rpForm.advising_load}
                            onChange={handleRpFormChange}
                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              formErrors.advising_load ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="0.00"
                          />
                        </FormField>
                        
                        <FormField
                          label="Position Load"
                          error={formErrors.position_load}
                        >
                          <input
                            type="number"
                            step="0.01"
                            name="position_load"
                            value={rpForm.position_load}
                            onChange={handleRpFormChange}
                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              formErrors.position_load ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="0.00"
                          />
                        </FormField>
                      </div>
                    </FormSection>
                    
                    {/* Summary Section */}
                    <div className="bg-gradient-to-r from-blue-50 to-emerald-50 p-6 rounded-xl border border-blue-200">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <BarChart className="h-5 w-5" />
                        Workload Summary
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField label="Total Load">
                          <input
                            type="number"
                            step="0.01"
                            name="total_load"
                            value={rpForm.total_load}
                            onChange={handleRpFormChange}
                            className="w-full px-4 py-2.5 border border-blue-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold"
                            readOnly
                          />
                        </FormField>
                        
                        <FormField label="Over Payment (Birr)">
                          <input
                            type="number"
                            step="0.01"
                            name="over_payment_birr"
                            value={rpForm.over_payment_birr}
                            onChange={handleRpFormChange}
                            className="w-full px-4 py-2.5 border border-emerald-300 bg-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            placeholder="0.00"
                          />
                        </FormField>
                      </div>
                      
                      {/* Load Breakdown Visualization */}
                      {rpForm.total_load && parseFloat(rpForm.total_load) > 0 && (
                        <div className="mt-6">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Load Distribution</span>
                            <span className="text-sm font-semibold text-blue-600">
                              {formatHours(rpForm.total_load)} hours total
                            </span>
                          </div>
                          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                              style={{
                                width: `${calculateLoadPercentage(
                                  (parseFloat(rpForm.each_section_course_load) || 0) * 
                                  (parseInt(rpForm.number_of_sections) || 1),
                                  parseFloat(rpForm.total_load)
                                )}%`
                              }}
                              title="Course Load"
                            ></div>
                            <div
                              className="h-full bg-gradient-to-r from-green-500 to-green-600"
                              style={{
                                width: `${calculateLoadPercentage(
                                  parseFloat(rpForm.research_load) || 0,
                                  parseFloat(rpForm.total_load)
                                )}%`
                              }}
                              title="Research Load"
                            ></div>
                            <div
                              className="h-full bg-gradient-to-r from-purple-500 to-purple-600"
                              style={{
                                width: `${calculateLoadPercentage(
                                  parseFloat(rpForm.community_service_load) || 0,
                                  parseFloat(rpForm.total_load)
                                )}%`
                              }}
                              title="Community Service"
                            ></div>
                          </div>
                          <div className="flex justify-between mt-2 text-xs text-gray-600">
                            <span>Teaching</span>
                            <span>Research</span>
                            <span>Community</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  // NRP Workload Form
                  <div className="space-y-8">
                    {/* Basic Information */}
                    <FormSection
                      title="Basic Information"
                      icon={Calendar}
                      description="Select program type, semester, and contract details"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FormField
                          label="Program Type *"
                          error={formErrors.program_type}
                        >
                          <select
                            name="program_type"
                            value={nrpForm.program_type}
                            onChange={handleNrpFormChange}
                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              formErrors.program_type ? 'border-red-300' : 'border-gray-300'
                            }`}
                            required
                          >
                            {Object.values(PROGRAM_TYPES).map(type => (
                              <option key={type} value={type}>
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                              </option>
                            ))}
                          </select>
                        </FormField>
                        
                        <FormField
                          label="Semester *"
                          error={formErrors.semester_id}
                        >
                          <select
                            name="semester_id"
                            value={nrpForm.semester_id}
                            onChange={handleNrpFormChange}
                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              formErrors.semester_id ? 'border-red-300' : 'border-gray-300'
                            }`}
                            required
                          >
                            <option value="">Select Semester</option>
                            {semesters.map(semester => (
                              <option key={semester.semester_id} value={semester.semester_id}>
                                {semester.semester_name} ({semester.semester_code})
                              </option>
                            ))}
                          </select>
                        </FormField>
                        
                        <FormField
                          label="Contract Number"
                          error={formErrors.contract_number}
                        >
                          <input
                            type="text"
                            name="contract_number"
                            value={nrpForm.contract_number}
                            onChange={handleNrpFormChange}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Auto-generated"
                          />
                        </FormField>
                        
                        {canManageOthers && (
                          <FormField
                            label="Staff Member"
                            error={formErrors.staff_id}
                          >
                            <select
                              name="staff_id"
                              value={nrpForm.staff_id}
                              onChange={handleNrpFormChange}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Select Staff</option>
                              {staffMembers.map(staff => (
                                <option key={staff.staff_id} value={staff.staff_id}>
                                  {staff.first_name} {staff.last_name} ({staff.employee_id})
                                </option>
                              ))}
                            </select>
                          </FormField>
                        )}
                        
                        <FormField
                          label="Academic Year"
                          error={formErrors.academic_year}
                        >
                          <input
                            type="text"
                            name="academic_year"
                            value={nrpForm.academic_year}
                            onChange={handleNrpFormChange}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., 2024"
                          />
                        </FormField>
                        
                        <FormField
                          label="Contract Type"
                          error={formErrors.contract_type}
                        >
                          <select
                            name="contract_type"
                            value={nrpForm.contract_type}
                            onChange={handleNrpFormChange}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="teaching">Teaching</option>
                            <option value="tutorial_correction">Tutorial/Correction</option>
                            <option value="combined">Combined</option>
                          </select>
                        </FormField>
                      </div>
                    </FormSection>
                    
                    {/* Course Information */}
                    <FormSection
                      title="Course Information"
                      icon={BookOpen}
                      description="Select course and enter course details"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FormField
                          label="Select Course"
                          error={formErrors.course_id}
                        >
                          <select
                            value={nrpForm.course_id}
                            onChange={(e) => handleCourseSelect(e.target.value)}
                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              formErrors.course_id ? 'border-red-300' : 'border-gray-300'
                            }`}
                          >
                            <option value="">Select Course</option>
                            {courses.map(course => (
                              <option key={course.course_id} value={course.course_id}>
                                {course.course_code} - {course.course_title}
                              </option>
                            ))}
                          </select>
                        </FormField>
                        
                        <FormField
                          label="Course Code *"
                          error={formErrors.course_code}
                        >
                          <input
                            type="text"
                            name="course_code"
                            value={nrpForm.course_code}
                            onChange={handleNrpFormChange}
                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              formErrors.course_code ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="e.g., SEng4021"
                            required
                          />
                        </FormField>
                        
                        <FormField
                          label="Course Title"
                          error={formErrors.course_title}
                        >
                          <input
                            type="text"
                            name="course_title"
                            value={nrpForm.course_title}
                            onChange={handleNrpFormChange}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., Database Systems"
                          />
                        </FormField>
                        
                        <FormField
                          label="Credit Hours"
                          error={formErrors.credit_hours}
                        >
                          <input
                            type="number"
                            step="0.01"
                            name="credit_hours"
                            value={nrpForm.credit_hours}
                            onChange={handleNrpFormChange}
                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              formErrors.credit_hours ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="0.00"
                          />
                        </FormField>
                      </div>
                    </FormSection>
                    
                    {/* Hours Breakdown */}
                    <FormSection
                      title="Hours Breakdown"
                      icon={Clock}
                      description="Enter teaching, lab, and tutorial hours"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FormField
                          label="Lecture Credit Hours"
                          error={formErrors.lecture_credit_hours}
                        >
                          <input
                            type="number"
                            step="0.01"
                            name="lecture_credit_hours"
                            value={nrpForm.lecture_credit_hours}
                            onChange={handleNrpFormChange}
                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              formErrors.lecture_credit_hours ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="0.00"
                          />
                        </FormField>
                        
                        <FormField
                          label="Lab Credit Hours"
                          error={formErrors.lab_credit_hours}
                        >
                          <input
                            type="number"
                            step="0.01"
                            name="lab_credit_hours"
                            value={nrpForm.lab_credit_hours}
                            onChange={handleNrpFormChange}
                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              formErrors.lab_credit_hours ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="0.00"
                          />
                        </FormField>
                        
                        <FormField
                          label="Tutorial Credit Hours"
                          error={formErrors.tutorial_credit_hours}
                        >
                          <input
                            type="number"
                            step="0.01"
                            name="tutorial_credit_hours"
                            value={nrpForm.tutorial_credit_hours}
                            onChange={handleNrpFormChange}
                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              formErrors.tutorial_credit_hours ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="0.00"
                          />
                        </FormField>
                        
                        <FormField
                          label="Teaching Hours"
                          error={formErrors.teaching_hours}
                        >
                          <input
                            type="number"
                            step="0.01"
                            name="teaching_hours"
                            value={nrpForm.teaching_hours}
                            onChange={handleNrpFormChange}
                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              formErrors.teaching_hours ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="0.00"
                          />
                        </FormField>
                        
                        <FormField
                          label="Module Hours"
                          error={formErrors.module_hours}
                        >
                          <input
                            type="number"
                            step="0.01"
                            name="module_hours"
                            value={nrpForm.module_hours}
                            onChange={handleNrpFormChange}
                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              formErrors.module_hours ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="0.00"
                          />
                        </FormField>
                        
                        <FormField label="Total Hours Worked">
                          <input
                            type="number"
                            step="0.01"
                            name="total_hours_worked"
                            value={nrpForm.total_hours_worked}
                            onChange={handleNrpFormChange}
                            className="w-full px-4 py-2.5 border border-gray-300 bg-gray-50 rounded-lg"
                            readOnly
                          />
                        </FormField>
                      </div>
                    </FormSection>
                    
                    {/* Student Information */}
                    <FormSection
                      title="Student Information"
                      icon={Users}
                      description="Enter student counts and project information"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FormField
                          label="Total Students"
                          error={formErrors.student_count}
                        >
                          <input
                            type="number"
                            name="student_count"
                            value={nrpForm.student_count}
                            onChange={handleNrpFormChange}
                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              formErrors.student_count ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="0"
                          />
                        </FormField>
                        
                        <FormField
                          label="Assignment Students"
                          error={formErrors.assignment_students}
                        >
                          <input
                            type="number"
                            name="assignment_students"
                            value={nrpForm.assignment_students}
                            onChange={handleNrpFormChange}
                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              formErrors.assignment_students ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="0"
                          />
                        </FormField>
                        
                        <FormField
                          label="Exam Students"
                          error={formErrors.exam_students}
                        >
                          <input
                            type="number"
                            name="exam_students"
                            value={nrpForm.exam_students}
                            onChange={handleNrpFormChange}
                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              formErrors.exam_students ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="0"
                          />
                        </FormField>
                        
                        <FormField
                          label="Project Advising"
                          error={formErrors.project_advising}
                        >
                          <input
                            type="text"
                            name="project_advising"
                            value={nrpForm.project_advising}
                            onChange={handleNrpFormChange}
                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              formErrors.project_advising ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="e.g., Final year project groups"
                          />
                        </FormField>
                        
                        <FormField
                          label="Project Groups"
                          error={formErrors.project_groups}
                        >
                          <input
                            type="number"
                            name="project_groups"
                            value={nrpForm.project_groups}
                            onChange={handleNrpFormChange}
                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              formErrors.project_groups ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="0"
                          />
                        </FormField>
                      </div>
                    </FormSection>
                    
                    {/* Rates & Payments */}
                    <FormSection
                      title="Rates & Payments"
                      icon={DollarSign}
                      description="Configure rates and calculate payments"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FormField
                          label="Rate Category"
                          error={formErrors.rate_category}
                        >
                          <select
                            name="rate_category"
                            value={nrpForm.rate_category}
                            onChange={handleNrpFormChange}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="default">Default</option>
                            <option value="A">Category A</option>
                            <option value="B">Category B</option>
                            <option value="C">Category C</option>
                          </select>
                        </FormField>
                        
                        <FormField
                          label="Rate per Rank (ETB) *"
                          error={formErrors.rate_per_rank}
                        >
                          <input
                            type="number"
                            step="0.01"
                            name="rate_per_rank"
                            value={nrpForm.rate_per_rank}
                            onChange={handleNrpFormChange}
                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              formErrors.rate_per_rank ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="500.00"
                            required
                          />
                        </FormField>
                        
                        <div className="space-y-4">
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              name="is_overload"
                              checked={nrpForm.is_overload}
                              onChange={handleNrpFormChange}
                              className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                              id="is_overload"
                            />
                            <label htmlFor="is_overload" className="text-sm font-medium text-gray-700">
                              Is Overload?
                            </label>
                          </div>
                          
                          {nrpForm.is_overload && (
                            <FormField
                              label="Overload Hours"
                              error={formErrors.overload_hours}
                            >
                              <input
                                type="number"
                                step="0.01"
                                name="overload_hours"
                                value={nrpForm.overload_hours}
                                onChange={handleNrpFormChange}
                                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                  formErrors.overload_hours ? 'border-red-300' : 'border-gray-300'
                                }`}
                                placeholder="0.00"
                              />
                            </FormField>
                          )}
                        </div>
                      </div>
                      
                      {/* Additional Rates */}
                      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField
                          label="Assignment Rate"
                          error={formErrors.assignment_rate}
                        >
                          <input
                            type="number"
                            step="0.01"
                            name="assignment_rate"
                            value={nrpForm.assignment_rate}
                            onChange={handleNrpFormChange}
                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              formErrors.assignment_rate ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="25.00"
                          />
                        </FormField>
                        
                        <FormField
                          label="Exam Rate"
                          error={formErrors.exam_rate}
                        >
                          <input
                            type="number"
                            step="0.01"
                            name="exam_rate"
                            value={nrpForm.exam_rate}
                            onChange={handleNrpFormChange}
                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              formErrors.exam_rate ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="20.00"
                          />
                        </FormField>
                        
                        <FormField
                          label="Tutorial Rate/Hour"
                          error={formErrors.tutorial_rate_per_hour}
                        >
                          <input
                            type="number"
                            step="0.01"
                            name="tutorial_rate_per_hour"
                            value={nrpForm.tutorial_rate_per_hour}
                            onChange={handleNrpFormChange}
                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              formErrors.tutorial_rate_per_hour ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="100.00"
                          />
                        </FormField>
                      </div>
                    </FormSection>
                    
                    {/* Payment Summary */}
                    <div className="bg-gradient-to-r from-emerald-50 to-blue-50 p-6 rounded-xl border border-emerald-200">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Payment Summary
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FormField label="Teaching Payment">
                          <input
                            type="number"
                            step="0.01"
                            name="teaching_payment"
                            value={nrpForm.teaching_payment}
                            onChange={handleNrpFormChange}
                            className="w-full px-4 py-2.5 border border-emerald-300 bg-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            readOnly
                          />
                        </FormField>
                        
                        <FormField label="Assignment Payment">
                          <input
                            type="number"
                            step="0.01"
                            name="assignment_payment"
                            value={nrpForm.assignment_payment}
                            onChange={handleNrpFormChange}
                            className="w-full px-4 py-2.5 border border-emerald-300 bg-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            readOnly
                          />
                        </FormField>
                        
                        <FormField label="Exam Payment">
                          <input
                            type="number"
                            step="0.01"
                            name="exam_payment"
                            value={nrpForm.exam_payment}
                            onChange={handleNrpFormChange}
                            className="w-full px-4 py-2.5 border border-emerald-300 bg-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            readOnly
                          />
                        </FormField>
                        
                        <FormField label="Tutorial Payment">
                          <input
                            type="number"
                            step="0.01"
                            name="tutorial_payment"
                            value={nrpForm.tutorial_payment}
                            onChange={handleNrpFormChange}
                            className="w-full px-4 py-2.5 border border-emerald-300 bg-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            readOnly
                          />
                        </FormField>
                        
                        <FormField label="Overload Payment">
                          <input
                            type="number"
                            step="0.01"
                            name="overload_payment"
                            value={nrpForm.overload_payment}
                            onChange={handleNrpFormChange}
                            className="w-full px-4 py-2.5 border border-emerald-300 bg-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            readOnly
                          />
                        </FormField>
                        
                        <FormField label="Total Payment">
                          <input
                            type="number"
                            step="0.01"
                            name="total_payment"
                            value={nrpForm.total_payment}
                            onChange={handleNrpFormChange}
                            className="w-full px-4 py-2.5 border border-emerald-400 bg-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-semibold text-emerald-700"
                            readOnly
                          />
                        </FormField>
                      </div>
                    </div>
                    
                    {/* Contract Duration */}
                    <FormSection
                      title="Contract Duration"
                      icon={Calendar}
                      description="Set contract start and end dates"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          label="From Date"
                          error={formErrors.contract_duration_from}
                        >
                          <input
                            type="date"
                            name="contract_duration_from"
                            value={nrpForm.contract_duration_from}
                            onChange={handleNrpFormChange}
                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              formErrors.contract_duration_from ? 'border-red-300' : 'border-gray-300'
                            }`}
                          />
                        </FormField>
                        
                        <FormField
                          label="To Date"
                          error={formErrors.contract_duration_to}
                        >
                          <input
                            type="date"
                            name="contract_duration_to"
                            value={nrpForm.contract_duration_to}
                            onChange={handleNrpFormChange}
                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              formErrors.contract_duration_to ? 'border-red-300' : 'border-gray-300'
                            }`}
                          />
                        </FormField>
                      </div>
                    </FormSection>
                  </div>
                )}
                
                {/* Form Actions */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditMode(false);
                      setCurrentWorkload(null);
                      setFormErrors({});
                    }}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    disabled={loading.form}
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 min-w-[140px]"
                    disabled={loading.form}
                  >
                    {loading.form ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>{editMode ? 'Update' : 'Save'} as Draft</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      const statusField = activeTab === WORKLOAD_TYPES.RP ? 'rpForm' : 'nrpForm';
                      const formData = statusField === 'rpForm' ? rpForm : nrpForm;
                      
                      if (statusField === 'rpForm') {
                        setRpForm(prev => ({ ...prev, status: 'submitted' }));
                      } else {
                        setNrpForm(prev => ({ ...prev, status: 'submitted' }));
                      }
                      
                      // Submit form with submitted status
                      if (activeTab === WORKLOAD_TYPES.RP) {
                        handleRpSubmit({ preventDefault: () => {} });
                      } else {
                        handleNrpSubmit({ preventDefault: () => {} });
                      }
                    }}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 min-w-[180px]"
                    disabled={loading.form || loading.submit}
                  >
                    {loading.submit ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Save & Submit for Approval</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Workloads List */}
          <div className="space-y-6">
            {filteredWorkloads.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-12 text-center">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No {activeTab.toUpperCase()} Workloads Found
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {filters.search || filters.status !== 'all' || filters.semester !== 'all'
                    ? 'Try adjusting your filters or clear them to see all workloads'
                    : `You haven't created any ${activeTab.toUpperCase()} workloads yet. Start by creating your first workload.`}
                </p>
                <button
                  onClick={handleNewWorkload}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2 mx-auto"
                >
                  <Plus className="h-5 w-5" />
                  <span>Create Your First Workload</span>
                </button>
              </div>
            ) : (
              filteredWorkloads.map(workload => (
                <WorkloadCard
                  key={activeTab === WORKLOAD_TYPES.RP ? workload.workload_id : workload.nrp_id}
                  workload={workload}
                  type={activeTab}
                  userRole={userRole}
                  userStaffId={userStaffId}
                  userDepartmentId={userDepartmentId}
                  onView={handleViewDetails}
                  onEdit={handleEditWorkload}
                  onDelete={handleDeleteClick}
                  onSubmit={handleSubmitClick}
                  onCalculate={handleCalculateClick}
                />
              ))
            )}
          </div>
        </div>

        {/* Modals */}
        {/* Details Modal */}
        {showDetailsModal && selectedWorkload && (
          <DetailsModal
            workload={selectedWorkload}
            type={activeTab}
            onClose={() => {
              setShowDetailsModal(false);
              setSelectedWorkload(null);
            }}
            onEdit={() => {
              setShowDetailsModal(false);
              handleEditWorkload(
                activeTab === WORKLOAD_TYPES.RP 
                  ? selectedWorkload.workload_id 
                  : selectedWorkload.nrp_id
              );
            }}
          />
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedWorkload && (
          <ConfirmationModal
            title="Delete Workload"
            message={`Are you sure you want to delete this ${activeTab.toUpperCase()} workload? This action cannot be undone.`}
            confirmText="Delete"
            confirmColor="red"
            onConfirm={handleDeleteConfirm}
            onCancel={() => {
              setShowDeleteModal(false);
              setSelectedWorkload(null);
            }}
            loading={loading.form}
          />
        )}

        {/* Submit Confirmation Modal */}
        {showSubmitModal && selectedWorkload && (
          <ConfirmationModal
            title="Submit for Approval"
            message={`Are you ready to submit this ${activeTab.toUpperCase()} workload for approval? Once submitted, you won't be able to edit it without approval.`}
            confirmText="Submit for Approval"
            confirmColor="emerald"
            onConfirm={handleSubmitConfirm}
            onCancel={() => {
              setShowSubmitModal(false);
              setSelectedWorkload(null);
            }}
            loading={loading.submit}
          />
        )}
      </div>
    </ErrorBoundary>
  );
};

// Supporting Components
const FormSection = ({ title, icon: Icon, description, children }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-blue-50 rounded-lg">
        <Icon className="h-5 w-5 text-blue-600" />
      </div>
      <div>
        <h4 className="text-lg font-semibold text-gray-900">{title}</h4>
        {description && (
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        )}
      </div>
    </div>
    <div>{children}</div>
  </div>
);

const FormField = ({ label, error, children, className = '' }) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    {children}
    {error && (
      <p className="mt-1 text-sm text-red-600">{error}</p>
    )}
  </div>
);

const WorkloadCard = ({
  workload,
  type,
  userRole,
  userStaffId,
  userDepartmentId,
  onView,
  onEdit,
  onDelete,
  onSubmit,
  onCalculate
}) => {
  const isRP = type === WORKLOAD_TYPES.RP;
  const canEdit = workload.status === 'draft' && (
    userRole === 'admin' ||
    (userRole === 'instructor' && workload.staff_id === userStaffId) ||
    (userRole === 'department_head' && workload.department_id === userDepartmentId)
  );
  const canDelete = workload.status === 'draft' && (
    userRole === 'admin' ||
    (userRole === 'instructor' && workload.staff_id === userStaffId)
  );
  const canSubmit = workload.status === 'draft' && 
    userRole === 'instructor' && 
    workload.staff_id === userStaffId;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                {isRP ? (
                  <BookOpen className="h-5 w-5 text-blue-600" />
                ) : (
                  <Calendar className="h-5 w-5 text-blue-600" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {workload.course_code} - {workload.course_title || 'Untitled Workload'}
                  </h3>
                  <StatusBadge status={workload.status} />
                </div>
                
                {!isRP && (
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      workload.program_type === 'extension' ? 'bg-blue-100 text-blue-800' :
                      workload.program_type === 'weekend' ? 'bg-purple-100 text-purple-800' :
                      workload.program_type === 'summer' ? 'bg-amber-100 text-amber-800' :
                      'bg-teal-100 text-teal-800'
                    }`}>
                      {workload.program_type?.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-600">
                      Contract: {workload.contract_number}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Semester</p>
                <p className="text-sm font-medium text-gray-900">
                  {workload.semester_name || 'N/A'}
                </p>
              </div>
              
              {isRP ? (
                <>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Sections</p>
                    <p className="text-sm font-medium text-gray-900">
                      {workload.number_of_sections || 1}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Total Hours</p>
                    <p className="text-sm font-medium text-blue-600">
                      {formatHours(workload.total_load)}h
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Over Payment</p>
                    <p className="text-sm font-medium text-emerald-600">
                      ETB {formatCurrency(workload.over_payment_birr)}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Students</p>
                    <p className="text-sm font-medium text-gray-900">
                      {workload.student_count || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Total Hours</p>
                    <p className="text-sm font-medium text-blue-600">
                      {formatHours(workload.total_hours_worked)}h
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Total Payment</p>
                    <p className="text-sm font-medium text-emerald-600">
                      ETB {formatCurrency(workload.total_payment)}
                    </p>
                  </div>
                </>
              )}
            </div>
            
            {/* Staff Info for Admins and Department Heads */}
            {['admin', 'department_head', 'dean'].includes(userRole) && workload.staff_name && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    {workload.staff_name} • {workload.employee_id} • {workload.department_name}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onView(workload)}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              <span>View Details</span>
            </button>
            
            {!isRP && workload.status === 'draft' && (
              <button
                onClick={() => onCalculate && onCalculate(workload)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
              >
                <Calculator className="h-4 w-4" />
                <span>Calculate Payment</span>
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {canEdit && (
              <button
                onClick={() => onEdit(isRP ? workload.workload_id : workload.nrp_id)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </button>
            )}
            
            {canSubmit && (
              <button
                onClick={() => onSubmit(workload)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                <span>Submit</span>
              </button>
            )}
            
            {canDelete && (
              <button
                onClick={() => onDelete(workload)}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailsModal = ({ workload, type, onClose, onEdit }) => {
  const isRP = type === WORKLOAD_TYPES.RP;
  const totalLoad = parseFloat(workload.total_load) || 0;
  const totalPayment = parseFloat(workload.total_payment) || 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Workload Details</h3>
              <p className="text-gray-600">
                {workload.course_code} - {workload.course_title || 'Untitled Workload'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-gray-400" />
            </button>
          </div>
          
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge status={workload.status} />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Semester</p>
                  <p className="text-gray-900 mt-1">{workload.semester_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Academic Year</p>
                  <p className="text-gray-900 mt-1">
                    {workload.year_name || workload.academic_year}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Course Details */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Course Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-600">Course Code</p>
                  <p className="text-gray-900 mt-1">{workload.course_code}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Course Title</p>
                  <p className="text-gray-900 mt-1">{workload.course_title}</p>
                </div>
                {isRP ? (
                  <>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Student Department</p>
                      <p className="text-gray-900 mt-1">
                        {workload.student_department || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Academic Year</p>
                      <p className="text-gray-900 mt-1">
                        {workload.academic_year || 'N/A'}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Program Type</p>
                      <p className="text-gray-900 mt-1 capitalize">
                        {workload.program_type}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Contract Number</p>
                      <p className="text-gray-900 mt-1">
                        {workload.contract_number}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* Load/Payment Summary */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                {isRP ? 'Load Summary' : 'Payment Summary'}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`p-4 rounded-lg ${
                  isRP ? 'bg-blue-50' : 'bg-emerald-50'
                }`}>
                  <p className="text-sm font-medium text-gray-600">
                    {isRP ? 'Total Hours' : 'Total Payment'}
                  </p>
                  <p className={`text-2xl font-bold mt-1 ${
                    isRP ? 'text-blue-900' : 'text-emerald-900'
                  }`}>
                    {isRP 
                      ? `${formatHours(totalLoad)} hours`
                      : `ETB ${formatCurrency(totalPayment)}`
                    }
                  </p>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-600">
                    {isRP ? 'Number of Sections' : 'Total Students'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {isRP ? workload.number_of_sections || 1 : workload.student_count || 0}
                  </p>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-600">Created Date</p>
                  <p className="text-gray-900 mt-1">{formatDate(workload.created_at)}</p>
                </div>
              </div>
            </div>
            
            {/* Dates */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Dates</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-600">Created At</p>
                  <p className="text-gray-900 mt-1">{formatDate(workload.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Updated At</p>
                  <p className="text-gray-900 mt-1">{formatDate(workload.updated_at)}</p>
                </div>
                {!isRP && workload.contract_duration_from && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Contract Duration</p>
                    <p className="text-gray-900 mt-1">
                      {formatDate(workload.contract_duration_from)} to{' '}
                      {formatDate(workload.contract_duration_to)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            {workload.status === 'draft' && (
              <button
                onClick={onEdit}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Edit Workload
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ConfirmationModal = ({
  title,
  message,
  confirmText,
  confirmColor,
  onConfirm,
  onCancel,
  loading
}) => {
  const colorClasses = {
    red: 'bg-red-600 hover:bg-red-700',
    emerald: 'bg-emerald-600 hover:bg-emerald-700',
    blue: 'bg-blue-600 hover:bg-blue-700'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-lg ${
              confirmColor === 'red' ? 'bg-red-100' :
              confirmColor === 'emerald' ? 'bg-emerald-100' :
              'bg-blue-100'
            }`}>
              <AlertCircle className={`h-6 w-6 ${
                confirmColor === 'red' ? 'text-red-600' :
                confirmColor === 'emerald' ? 'text-emerald-600' :
                'text-blue-600'
              }`} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 text-white rounded-lg transition-colors flex items-center gap-2 ${
                colorClasses[confirmColor] || colorClasses.blue
              }`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteWorkloadManager;