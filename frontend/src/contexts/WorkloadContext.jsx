import React, { createContext, useState, useContext, useEffect } from "react";
import toast from "react-hot-toast";
import { workloadAPI } from "../api";

const WorkloadContext = createContext();

export const useWorkload = () => {
  const context = useContext(WorkloadContext);
  if (!context) {
    throw new Error("useWorkload must be used within a WorkloadProvider");
  }
  return context;
};

export const WorkloadProvider = ({ children }) => {
  const [workloads, setWorkloads] = useState({
    rp: [],
    nrp: [],
    assignments: [],
    dashboard: null,
    summary: null,
    statistics: null,
    overload: null,
  });

  const [loading, setLoading] = useState({
    rp: false,
    nrp: false,
    assignments: false,
    dashboard: false,
    summary: false,
  });

  const [filters, setFilters] = useState({
    semester_id: null,
    status: null,
    program_type: null,
    page: 1,
    limit: 20,
  });

  const [activeSemester, setActiveSemester] = useState(null);

  // Fetch workload dashboard
  const fetchWorkloadDashboard = async () => {
    try {
      setLoading((prev) => ({ ...prev, dashboard: true }));
      const response = await workloadAPI.getWorkloadDashboard();
      if (response.success) {
        setWorkloads((prev) => ({ ...prev, dashboard: response.data }));
      }
      return response;
    } catch (error) {
      toast.error("Failed to load workload dashboard");
      console.error(error);
    } finally {
      setLoading((prev) => ({ ...prev, dashboard: false }));
    }
  };

  // Fetch RP workloads
  const fetchRPWorkloads = async (customFilters = {}) => {
    try {
      setLoading((prev) => ({ ...prev, rp: true }));
      const response = await workloadAPI.getAllRPWorkloads({
        ...filters,
        ...customFilters,
      });
      if (response.success) {
        setWorkloads((prev) => ({
          ...prev,
          rp: response.data.workloads || [],
        }));
      }
      return response;
    } catch (error) {
      toast.error("Failed to load RP workloads");
      console.error(error);
    } finally {
      setLoading((prev) => ({ ...prev, rp: false }));
    }
  };

  // Fetch NRP workloads
  const fetchNRPWorkloads = async (customFilters = {}) => {
    try {
      setLoading((prev) => ({ ...prev, nrp: true }));
      const response = await workloadAPI.getAllNRPWorkloads({
        ...filters,
        ...customFilters,
      });
      if (response.success) {
        setWorkloads((prev) => ({
          ...prev,
          nrp: response.data.workloads || [],
        }));
      }
      return response;
    } catch (error) {
      toast.error("Failed to load NRP workloads");
      console.error(error);
    } finally {
      setLoading((prev) => ({ ...prev, nrp: false }));
    }
  };

  // Fetch my assignments
  const fetchMyAssignments = async (customFilters = {}) => {
    try {
      setLoading((prev) => ({ ...prev, assignments: true }));
      const response = await workloadAPI.getMyAssignments({
        ...filters,
        ...customFilters,
      });
      if (response.success) {
        // setWorkloads((prev) => ({ ...prev, assignments: response.data || [] }));
        setWorkloads((prev) => ({
          ...prev,
          assignments: Array.isArray(response.data)
            ? response.data
            : response.data?.assignments || [],
        }));

      }
      console.log(response);
      
      return response;
    } catch (error) {
      toast.error("Failed to load assignments");
      console.error(error);
    } finally {
      setLoading((prev) => ({ ...prev, assignments: false }));
    }
  };

  // Fetch workload summary
  const fetchWorkloadSummary = async (semesterId = null) => {
    try {
      setLoading((prev) => ({ ...prev, summary: true }));
      const response = await workloadAPI.getWorkloadSummary(semesterId);
      if (response.success) {
        setWorkloads((prev) => ({ ...prev, summary: response.data }));
      }
      return response;
    } catch (error) {
      toast.error("Failed to load workload summary");
      console.error(error);
    } finally {
      setLoading((prev) => ({ ...prev, summary: false }));
    }
  };

  // Create RP workload
  const createRPWorkload = async (data) => {
    try {
      const response = await workloadAPI.createOrUpdateRPWorkload(data);
      if (response.success) {
        toast.success("RP workload created successfully");
        fetchRPWorkloads();
        return response;
      }
      throw new Error(response.message || "Failed to create RP workload");
    } catch (error) {
      toast.error(error.message || "Failed to create RP workload");
      throw error;
    }
  };

  // Create NRP workload
  const createNRPWorkload = async (data) => {
    try {
      const response = await workloadAPI.createNRPWorkload(data);
      if (response.success) {
        toast.success("NRP workload created successfully");
        fetchNRPWorkloads();
        return response;
      }
      throw new Error(response.message || "Failed to create NRP workload");
    } catch (error) {
      toast.error(error.message || "Failed to create NRP workload");
      throw error;
    }
  };

  // Update assignment status
  const updateAssignmentStatus = async (id, status, comments = "") => {
    try {
      const response = await workloadAPI.updateAssignmentStatus(
        id,
        status,
        comments
      );
      if (response.success) {
        toast.success(`Assignment ${status} successfully`);
        fetchMyAssignments();
        return response;
      }
      throw new Error(response.message || "Failed to update assignment");
    } catch (error) {
      toast.error(error.message || "Failed to update assignment");
      throw error;
    }
  };

  // Submit workload for approval
  const submitWorkloadForApproval = async (type, id) => {
    try {
      let response;
      if (type === "rp") {
        response = await workloadAPI.submitRPWorkloadForApproval(id);
      } else {
        response = await workloadAPI.submitNRPWorkloadForApproval(id);
      }

      if (response.success) {
        toast.success("Workload submitted for approval");
        if (type === "rp") {
          fetchRPWorkloads();
        } else {
          fetchNRPWorkloads();
        }
        return response;
      }
      throw new Error(response.message || "Failed to submit workload");
    } catch (error) {
      toast.error(error.message || "Failed to submit workload");
      throw error;
    }
  };

  // Delete workload
  const deleteWorkload = async (type, id) => {
    try {
      let response;
      if (type === "rp") {
        response = await workloadAPI.deleteRPWorkload(id);
      }
      // Add NRP delete when API is ready

      if (response?.success) {
        toast.success("Workload deleted successfully");
        if (type === "rp") {
          fetchRPWorkloads();
        }
        return response;
      }
      throw new Error(response?.message || "Failed to delete workload");
    } catch (error) {
      toast.error(error.message || "Failed to delete workload");
      throw error;
    }
  };

  // Check overload status
  const checkOverloadStatus = async (semesterId = null) => {
    try {
      const response = await workloadAPI.checkOverloadStatus(semesterId);
      if (response.success) {
        setWorkloads((prev) => ({ ...prev, overload: response.data }));
      }
      return response;
    } catch (error) {
      toast.error("Failed to check overload status");
      console.error(error);
    }
  };

  // Update filters
  const updateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  // Clear all workloads
  const clearWorkloads = () => {
    setWorkloads({
      rp: [],
      nrp: [],
      assignments: [],
      dashboard: null,
      summary: null,
      statistics: null,
      overload: null,
    });
  };

  // Initial data fetch
  useEffect(() => {
    fetchWorkloadDashboard();
    fetchRPWorkloads();
    fetchNRPWorkloads();
    fetchMyAssignments();
  }, [filters.semester_id, filters.status]);

  const value = {
    workloads,
    loading,
    filters,
    activeSemester,
    setActiveSemester,
    fetchWorkloadDashboard,
    fetchRPWorkloads,
    fetchNRPWorkloads,
    fetchMyAssignments,
    fetchWorkloadSummary,
    createRPWorkload,
    createNRPWorkload,
    updateAssignmentStatus,
    submitWorkloadForApproval,
    deleteWorkload,
    checkOverloadStatus,
    updateFilters,
    clearWorkloads,
    
  };

  return (
    <WorkloadContext.Provider value={value}>
      {children}
    </WorkloadContext.Provider>
  );
};
