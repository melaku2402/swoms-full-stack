import { useState } from "react";
import { academicAPI } from "../api/academic";

export const useAcademic = () => {
  const [colleges, setColleges] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchColleges = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await academicAPI.getColleges(params);
      setColleges(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await academicAPI.getDepartments(params);
      setDepartments(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await academicAPI.getCourses(params);
      setCourses(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    colleges,
    departments,
    courses,
    loading,
    error,
    fetchColleges,
    fetchDepartments,
    fetchCourses,
  };
};
