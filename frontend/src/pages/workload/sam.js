// src/pages/workload/CompleteWorkloadManager.jsx
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Download,
  Filter,
  Search,
  RefreshCw,
  Eye,
  Calendar,
  BookOpen,
  DollarSign,
  ChevronDown,
  Save,
  Send,
  X,
  AlertTriangle,
  Users,
  Building,
  GraduationCap,
  BarChart,
  Shield,
  UserCheck,
  CheckSquare,
  Percent,
  Calculator,
  Zap,
  TrendingUp,
  FileCheck,
  Loader,
  Archive,
  History,
  FileSpreadsheet,
  ClipboardList,
  Target,
} from "lucide-react";
import toast from "react-hot-toast";
import { format, parseISO } from "date-fns";
import { useAuth } from "../../contexts/AuthContext";

// API imports - UPDATED to match actual API exports
import {
  semesterAPI,
  courseAPI,
  staffAPI,
  workloadRPAPI,
  workloadNRPAPI,
  rulesAPI,
  exportAPI,
  overloadDetectionAPI,
} from "../../api";

// =============================================
// REST OF THE COMPONENT CODE REMAINS THE SAME
// =============================================

// Then in the fetchWorkloads function (around line 380-381), update:
const fetchWorkloads = async () => {
  try {
    setLoading((prev) => ({ ...prev, workloads: true }));

    const baseFilters = {
      ...(userRole === "instructor" && { staff_id: userStaffId }),
      ...(userRole === "department_head" &&
        userDepartmentId && { department_id: userDepartmentId }),
      ...(userRole === "dean" &&
        userCollegeId && { college_id: userCollegeId }),
    };

    // Fetch both RP and NRP workloads in parallel - UPDATED API names
    const [rpResponse, nrpResponse, overloadResponse] = await Promise.all([
      workloadRPAPI.getAllWorkloads(baseFilters),
      workloadNRPAPI.getAllNRPWorkloads(baseFilters),
      overloadDetectionAPI.getOverloadAlerts({ threshold: 80 }), // UPDATED: overloadDetectionAPI.getOverloadAlerts
    ]);

    // Process RP workloads
    const rpWorkloads =
      rpResponse?.data?.workloads || rpResponse?.workloads || [];

    // Process NRP workloads
    const nrpWorkloads =
      nrpResponse?.data?.workloads || nrpResponse?.workloads || [];

    // Process overload data
    const overloadData = overloadResponse?.data || {};

    setWorkloads({
      [WORKLOAD_TYPES.RP]: Array.isArray(rpWorkloads) ? rpWorkloads : [],
      [WORKLOAD_TYPES.NRP]: Array.isArray(nrpWorkloads) ? nrpWorkloads : [],
    });

    // Calculate statistics
    calculateStats(rpWorkloads, nrpWorkloads, overloadData);
  } catch (error) {
    console.error("Error fetching workloads:", error);
    toast.error("Failed to load workloads");
  } finally {
    setLoading((prev) => ({ ...prev, workloads: false }));
  }
};

// In the handleOverloadCheck function (around line 737), update:
const handleOverloadCheck = async () => {
  try {
    setLoading((prev) => ({ ...prev, calculations: true }));
    const response = await overloadDetectionAPI.checkMyOverload({
      semester_id: selectedSemester,
    }); // UPDATED: overloadDetectionAPI.checkMyOverload
    setSelectedWorkload(response.data);
    setShowOverloadModal(true);
  } catch (error) {
    console.error("Error checking overload:", error);
    toast.error("Failed to check overload status");
  } finally {
    setLoading((prev) => ({ ...prev, calculations: false }));
  }
};

// In the fetchRules function (around line 290), update:
useEffect(() => {
  const initializeData = async () => {
    try {
      setLoading((prev) => ({ ...prev, workloads: true }));

      // Fetch in parallel for better performance - UPDATED API names
      const [semestersRes, coursesRes, rulesRes] = await Promise.all([
        semesterAPI.getAllSemesters(),
        courseAPI.getAllCourses(),
        rulesAPI.getAllRankLoadLimits(), // UPDATED: rulesAPI.getAllRankLoadLimits (no params)
      ]);

      // Process semesters
      const semestersData =
        semestersRes?.data?.semesters || semestersRes?.semesters || [];
      setSemesters(semestersData);
      if (semestersData.length > 0) {
        const active =
          semestersData.find((s) => s.is_active) || semestersData[0];
        setActiveSemester(active);
        setSelectedSemester(active.semester_id);
      }

      // Process courses
      const coursesData =
        coursesRes?.data?.courses || coursesRes?.courses || [];
      setCourses(coursesData);

      // Process rules
      setRules(rulesRes?.data || {});
      setRankLimits(rulesRes?.data || {});

      // Load load factors
      try {
        const factorsRes = await rulesAPI.getLoadFactors(); // UPDATED: rulesAPI.getLoadFactors
        setLoadFactors(factorsRes?.data || {});
      } catch (error) {
        console.warn("Could not load load factors:", error);
        setLoadFactors({
          lab: 0.75,
          tutorial: 0.5,
          lecture: 1.0,
          module_distance: 1.0,
        });
      }

      // Fetch staff members for admins and department heads
      if (canManageOthers) {
        try {
          const staffRes = await staffAPI.getAllStaff();
          const staffData = staffRes?.data?.staff || staffRes?.staff || [];
          setStaffMembers(staffData);
        } catch (error) {
          console.warn("Could not load staff members:", error);
        }
      }

      // Fetch workloads
      await fetchWorkloads();
    } catch (error) {
      console.error("Error initializing data:", error);
      toast.error("Failed to initialize application data");
    } finally {
      setLoading((prev) => ({ ...prev, workloads: false }));
    }
  };

  initializeData();
}, [canManageOthers]);

// In the handleExportWorkloads function (around line 653), update:
const handleExportWorkloads = async () => {
  try {
    // UPDATED: Use exportAPI.generateReport with correct parameters
    const response = await exportAPI.generateReport(
      activeTab === WORKLOAD_TYPES.RP ? "rp_workloads" : "nrp_workloads",
      {
        format: "excel",
        ...filters,
        semester_id: filters.semester !== "all" ? filters.semester : undefined,
        status: filters.status !== "all" ? filters.status : undefined,
        program_type:
          filters.program_type !== "all" ? filters.program_type : undefined,
      }
    );

    // Create download link
    const blob = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `workloads_${activeTab}_${format(
      new Date(),
      "yyyy-MM-dd"
    )}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast.success("Workloads exported successfully");
  } catch (error) {
    console.error("Error exporting workloads:", error);
    toast.error("Failed to export workloads");
  }
};

// =============================================
// REST OF THE COMPONENT CODE REMAINS THE SAME
// =============================================
