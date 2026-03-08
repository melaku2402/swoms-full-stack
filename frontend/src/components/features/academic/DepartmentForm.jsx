import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Building, Users } from "lucide-react";
import { academicAPI } from "../../../api/academic";

const departmentSchema = z.object({
  department_code: z
    .string()
    .min(2, "Department code must be at least 2 characters")
    .max(20, "Department code must be less than 20 characters")
    .regex(/^[A-Z]+$/, "Department code must be uppercase letters only"),
  department_name: z
    .string()
    .min(3, "Department name must be at least 3 characters")
    .max(150, "Department name must be less than 150 characters"),
  college_id: z.string().min(1, "College is required"),
  head_user_id: z.string().optional(),
  status: z.enum(["active", "inactive"]).default("active"),
});

const DepartmentForm = ({ initialData, onSubmit, onCancel, loading }) => {
  const [colleges, setColleges] = useState([]);
  const [departmentHeads, setDepartmentHeads] = useState([]);
  const [fetching, setFetching] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(departmentSchema),
    defaultValues: initialData || {
      department_code: "",
      department_name: "",
      college_id: "",
      head_user_id: "",
      status: "active",
    },
  });

  const selectedCollegeId = watch("college_id");

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
    fetchColleges();
  }, [initialData, reset]);

  useEffect(() => {
    if (selectedCollegeId) {
      fetchDepartmentHeads(selectedCollegeId);
    }
  }, [selectedCollegeId]);

  const fetchColleges = async () => {
    try {
      setFetching(true);
      const response = await academicAPI.getColleges({ status: "active" });
      setColleges(response.colleges || response);
    } catch (error) {
      console.error("Failed to fetch colleges:", error);
    } finally {
      setFetching(false);
    }
  };

  const fetchDepartmentHeads = async (collegeId) => {
    try {
      // This would be an API call to fetch users eligible to be department heads
      // For now, using mock data
      setDepartmentHeads([
        {
          user_id: 4,
          name: "Prof. Sarah Johnson",
          email: "sarah@injibara.edu.et",
        },
        {
          user_id: 5,
          name: "Dr. David Wilson",
          email: "david@injibara.edu.et",
        },
      ]);
    } catch (error) {
      console.error("Failed to fetch department heads:", error);
    }
  };

  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Department Code */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Department Code *
          </label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              {...register("department_code")}
              type="text"
              className={`pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.department_code ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="e.g., CS, MATH, ECON"
              maxLength={20}
              disabled={loading || fetching}
            />
          </div>
          {errors.department_code && (
            <p className="mt-1 text-sm text-red-600">
              {errors.department_code.message}
            </p>
          )}
        </div>

        {/* College Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            College *
          </label>
          <select
            {...register("college_id")}
            className={`input ${errors.college_id ? "border-red-500" : ""}`}
            disabled={loading || fetching}
          >
            <option value="">Select a College</option>
            {colleges.map((college) => (
              <option key={college.college_id} value={college.college_id}>
                {college.college_name} ({college.college_code})
              </option>
            ))}
          </select>
          {errors.college_id && (
            <p className="mt-1 text-sm text-red-600">
              {errors.college_id.message}
            </p>
          )}
        </div>
      </div>

      {/* Department Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Department Name *
        </label>
        <input
          {...register("department_name")}
          type="text"
          className={`input ${errors.department_name ? "border-red-500" : ""}`}
          placeholder="e.g., Computer Science, Mathematics"
          maxLength={150}
          disabled={loading || fetching}
        />
        {errors.department_name && (
          <p className="mt-1 text-sm text-red-600">
            {errors.department_name.message}
          </p>
        )}
      </div>

      {/* Department Head */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Department Head (Optional)
        </label>
        <div className="relative">
          <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <select
            {...register("head_user_id")}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            disabled={loading || fetching || !selectedCollegeId}
          >
            <option value="">Select a Department Head</option>
            {departmentHeads.map((head) => (
              <option key={head.user_id} value={head.user_id}>
                {head.name} ({head.email})
              </option>
            ))}
          </select>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          {!selectedCollegeId
            ? "Select a college first"
            : "Assign a head to manage this department"}
        </p>
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <div className="flex space-x-4">
          <label className="inline-flex items-center">
            <input
              {...register("status")}
              type="radio"
              value="active"
              className="h-4 w-4 text-primary-600"
              disabled={loading || fetching}
            />
            <span className="ml-2">Active</span>
          </label>
          <label className="inline-flex items-center">
            <input
              {...register("status")}
              type="radio"
              value="inactive"
              className="h-4 w-4 text-primary-600"
              disabled={loading || fetching}
            />
            <span className="ml-2">Inactive</span>
          </label>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading || fetching}
          className="btn-secondary px-6 py-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || fetching || !isDirty}
          className="btn-primary px-6 py-2"
        >
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {initialData ? "Updating..." : "Creating..."}
            </div>
          ) : initialData ? (
            "Update Department"
          ) : (
            "Create Department"
          )}
        </button>
      </div>
    </form>
  );
};

export default DepartmentForm;
