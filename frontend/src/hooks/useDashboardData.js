// src/hooks/useDepartment.js
import { useState, useEffect, useCallback } from "react";
import { departmentAPI } from "../api";
import { useAuth } from "../contexts/AuthContext";

export const useDepartment = () => {
  const { user } = useAuth();
  const [department, setDepartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDepartmentData = useCallback(async () => {
    if (!user?.department_id) return;

    try {
      setLoading(true);
      const response = await departmentAPI.getDepartmentById(
        user.department_id
      );
      setDepartment(response.data);
      setError(null);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch department data"
      );
      console.error("Department fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.department_id]);

  const updateDepartment = useCallback(
    async (data) => {
      try {
        setLoading(true);
        const response = await departmentAPI.updateDepartment(
          user.department_id,
          data
        );
        setDepartment(response.data);
        setError(null);
        return response.data;
      } catch (err) {
        setError(err.response?.data?.message || "Failed to update department");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user?.department_id]
  );

  const getDepartmentStats = useCallback(
    async (type = "detailed") => {
      try {
        const response = await departmentAPI.getDepartmentStats(
          user.department_id,
          type
        );
        return response.data;
      } catch (err) {
        console.error("Department stats error:", err);
        throw err;
      }
    },
    [user?.department_id]
  );

  const getDepartmentStaff = useCallback(
    async (params = {}) => {
      try {
        const response = await departmentAPI.getDepartmentStaff(
          user.department_id,
          params
        );
        return response.data;
      } catch (err) {
        console.error("Department staff error:", err);
        throw err;
      }
    },
    [user?.department_id]
  );

  useEffect(() => {
    fetchDepartmentData();
  }, [fetchDepartmentData]);

  return {
    department,
    loading,
    error,
    fetchDepartmentData,
    updateDepartment,
    getDepartmentStats,
    getDepartmentStaff,
    refetch: fetchDepartmentData,
  };
};

// Additional hook for department workload
export const useDepartmentWorkload = (semesterId = null) => {
  const { user } = useAuth();
  const [workload, setWorkload] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchWorkloadSummary = useCallback(async () => {
    if (!user?.department_id) return;

    try {
      setLoading(true);
      const response = await departmentAPI.getDepartmentWorkloadSummary(
        user.department_id,
        semesterId
      );
      setWorkload(response.data);
    } catch (err) {
      console.error("Workload summary error:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.department_id, semesterId]);

  useEffect(() => {
    fetchWorkloadSummary();
  }, [fetchWorkloadSummary]);

  return {
    workload,
    loading,
    refetch: fetchWorkloadSummary,
  };
};

export default useDepartment