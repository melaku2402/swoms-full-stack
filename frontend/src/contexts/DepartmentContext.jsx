// src/contexts/DepartmentContext.jsx
import React, { createContext, useContext, useState, useCallback } from "react";
import { departmentAPI, staffAPI } from "../api";
import { useAuth } from "./AuthContext";

const DepartmentContext = createContext();

export const useDepartmentContext = () => {
  const context = useContext(DepartmentContext);
  if (!context) {
    throw new Error(
      "useDepartmentContext must be used within DepartmentProvider"
    );
  }
  return context;
};

export const DepartmentProvider = ({ children }) => {
  const { user } = useAuth();
  const [department, setDepartment] = useState(null);
  const [staff, setStaff] = useState([]);
  const [courses, setCourses] = useState([]);
  const [workloads, setWorkloads] = useState([]);
  const [loading, setLoading] = useState({
    department: false,
    staff: false,
    courses: false,
    workloads: false,
  });

  const fetchDepartment = useCallback(async () => {
    if (!user?.department_id) return;

    try {
      setLoading((prev) => ({ ...prev, department: true }));
      const response = await departmentAPI.getDepartmentById(
        user.department_id
      );
      setDepartment(response.data);
    } catch (error) {
      console.error("Failed to fetch department:", error);
    } finally {
      setLoading((prev) => ({ ...prev, department: false }));
    }
  }, [user?.department_id]);

  const fetchDepartmentStaff = useCallback(
    async (params = {}) => {
      if (!user?.department_id) return;

      try {
        setLoading((prev) => ({ ...prev, staff: true }));
        const response = await departmentAPI.getDepartmentStaff(
          user.department_id,
          params
        );
        setStaff(response.data?.staff || []);
        return response.data;
      } catch (error) {
        console.error("Failed to fetch department staff:", error);
        throw error;
      } finally {
        setLoading((prev) => ({ ...prev, staff: false }));
      }
    },
    [user?.department_id]
  );

  const fetchDepartmentCourses = useCallback(
    async (semesterId = null) => {
      if (!user?.department_id) return;

      try {
        setLoading((prev) => ({ ...prev, courses: true }));
        const response = await departmentAPI.getDepartmentCourses(
          user.department_id,
          semesterId
        );
        setCourses(response.data?.courses || []);
        return response.data;
      } catch (error) {
        console.error("Failed to fetch department courses:", error);
        throw error;
      } finally {
        setLoading((prev) => ({ ...prev, courses: false }));
      }
    },
    [user?.department_id]
  );

  const fetchWorkloadSummary = useCallback(
    async (semesterId = null) => {
      if (!user?.department_id) return;

      try {
        setLoading((prev) => ({ ...prev, workloads: true }));
        const response = await departmentAPI.getDepartmentWorkloadSummary(
          user.department_id,
          semesterId
        );
        setWorkloads(response.data?.workloads || []);
        return response.data;
      } catch (error) {
        console.error("Failed to fetch workload summary:", error);
        throw error;
      } finally {
        setLoading((prev) => ({ ...prev, workloads: false }));
      }
    },
    [user?.department_id]
  );

  const assignCourse = useCallback(async (courseData) => {
    // Implementation for assigning courses to staff
    try {
      // Use courseAssignmentAPI here
      const response = await courseAssignmentAPI.createAssignment(courseData);
      return response.data;
    } catch (error) {
      console.error("Failed to assign course:", error);
      throw error;
    }
  }, []);

  const updateStaffWorkload = useCallback(async (staffId, data) => {
    // Implementation for updating staff workload
    try {
      const response = await staffAPI.updateStaff(staffId, data);
      return response.data;
    } catch (error) {
      console.error("Failed to update staff workload:", error);
      throw error;
    }
  }, []);

  const generateReport = useCallback(
    async (reportType, params = {}) => {
      if (!user?.department_id) return;

      try {
        const response = await departmentAPI.generateReport(
          user.department_id,
          reportType,
          params
        );
        return response.data;
      } catch (error) {
        console.error("Failed to generate report:", error);
        throw error;
      }
    },
    [user?.department_id]
  );

  const value = {
    department,
    staff,
    courses,
    workloads,
    loading,
    fetchDepartment,
    fetchDepartmentStaff,
    fetchDepartmentCourses,
    fetchWorkloadSummary,
    assignCourse,
    updateStaffWorkload,
    generateReport,
    refetchStaff: fetchDepartmentStaff,
    refetchCourses: fetchDepartmentCourses,
  };

  return (
    <DepartmentContext.Provider value={value}>
      {children}
    </DepartmentContext.Provider>
  );
};
