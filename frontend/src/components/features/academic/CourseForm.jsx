import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { BookOpen, Clock, Hash } from "lucide-react";
import { academicAPI } from "../../../api/academic";

const courseSchema = z.object({
  course_code: z
    .string()
    .min(3, "Course code must be at least 3 characters")
    .max(20, "Course code must be less than 20 characters")
    .regex(
      /^[A-Z0-9]+$/,
      "Course code must be uppercase letters and numbers only"
    ),
  course_title: z
    .string()
    .min(5, "Course title must be at least 5 characters")
    .max(200, "Course title must be less than 200 characters"),
  department_id: z.string().min(1, "Department is required"),
  credit_hours: z
    .number()
    .min(0.5, "Credit hours must be at least 0.5")
    .max(10, "Credit hours cannot exceed 10"),
  lecture_hours: z
    .number()
    .min(0, "Lecture hours cannot be negative")
    .max(10, "Lecture hours cannot exceed 10"),
  lab_hours: z
    .number()
    .min(0, "Lab hours cannot be negative")
    .max(10, "Lab hours cannot exceed 10")
    .default(0),
  tutorial_hours: z
    .number()
    .min(0, "Tutorial hours cannot be negative")
    .max(10, "Tutorial hours cannot exceed 10")
    .default(0),
  program_type: z.enum([
    "regular",
    "extension",
    "weekend",
    "summer",
    "distance",
  ]),
  status: z.enum(["active", "inactive"]).default("active"),
});

const CourseForm = ({ initialData, onSubmit, onCancel, loading }) => {
  const [departments, setDepartments] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [totalHours, setTotalHours] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(courseSchema),
    defaultValues: initialData || {
      course_code: "",
      course_title: "",
      department_id: "",
      credit_hours: 3,
      lecture_hours: 3,
      lab_hours: 0,
      tutorial_hours: 0,
      program_type: "regular",
      status: "active",
    },
  });

  const watchHours = watch(["lecture_hours", "lab_hours", "tutorial_hours"]);

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
    fetchDepartments();
    fetchPrograms();
  }, [initialData, reset]);

  useEffect(() => {
    const [lecture, lab, tutorial] = watchHours.map((h) => parseFloat(h) || 0);
    setTotalHours(lecture + lab + tutorial);
  }, [watchHours]);

  const fetchDepartments = async () => {
    try {
      setFetching(true);
      const response = await academicAPI.getDepartments({ status: "active" });
      setDepartments(response.departments || response);
    } catch (error) {
      console.error("Failed to fetch departments:", error);
    } finally {
      setFetching(false);
    }
  };

  const fetchPrograms = async () => {
    try {
      // This would fetch programs for the selected department
      // For now, we'll use program types directly
    } catch (error) {
      console.error("Failed to fetch programs:", error);
    }
  };

  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  const handleNumberChange = (field, value) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setValue(field, numValue, { shouldDirty: true });
    }
  };

  const programTypes = [
    { value: "regular", label: "Regular Program" },
    { value: "extension", label: "Extension Program" },
    { value: "weekend", label: "Weekend Program" },
    { value: "summer", label: "Summer Program" },
    { value: "distance", label: "Distance Program" },
  ];

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Course Code */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Course Code *
          </label>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              {...register("course_code")}
              type="text"
              className={`pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.course_code ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="e.g., CS101, MATH201"
              maxLength={20}
              disabled={loading || fetching}
            />
          </div>
          {errors.course_code && (
            <p className="mt-1 text-sm text-red-600">
              {errors.course_code.message}
            </p>
          )}
        </div>

        {/* Department */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Department *
          </label>
          <select
            {...register("department_id")}
            className={`input ${errors.department_id ? "border-red-500" : ""}`}
            disabled={loading || fetching}
          >
            <option value="">Select a Department</option>
            {departments.map((dept) => (
              <option key={dept.department_id} value={dept.department_id}>
                {dept.department_name} ({dept.department_code})
              </option>
            ))}
          </select>
          {errors.department_id && (
            <p className="mt-1 text-sm text-red-600">
              {errors.department_id.message}
            </p>
          )}
        </div>
      </div>

      {/* Course Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Course Title *
        </label>
        <div className="relative">
          <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            {...register("course_title")}
            type="text"
            className={`pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.course_title ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="e.g., Introduction to Programming, Calculus I"
            maxLength={200}
            disabled={loading || fetching}
          />
        </div>
        {errors.course_title && (
          <p className="mt-1 text-sm text-red-600">
            {errors.course_title.message}
          </p>
        )}
      </div>

      {/* Hours Configuration */}
      <div className="border rounded-lg p-6 bg-gray-50">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Hours Configuration
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Credit Hours */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Credit Hours *
            </label>
            <div className="relative">
              <input
                {...register("credit_hours", { valueAsNumber: true })}
                type="number"
                step="0.5"
                min="0.5"
                max="10"
                onChange={(e) =>
                  handleNumberChange("credit_hours", e.target.value)
                }
                className={`input ${
                  errors.credit_hours ? "border-red-500" : ""
                }`}
                disabled={loading}
              />
            </div>
            {errors.credit_hours && (
              <p className="mt-1 text-sm text-red-600">
                {errors.credit_hours.message}
              </p>
            )}
          </div>

          {/* Lecture Hours */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lecture Hours *
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                {...register("lecture_hours", { valueAsNumber: true })}
                type="number"
                step="0.5"
                min="0"
                max="10"
                onChange={(e) =>
                  handleNumberChange("lecture_hours", e.target.value)
                }
                className={`pl-10 input ${
                  errors.lecture_hours ? "border-red-500" : ""
                }`}
                disabled={loading}
              />
            </div>
            {errors.lecture_hours && (
              <p className="mt-1 text-sm text-red-600">
                {errors.lecture_hours.message}
              </p>
            )}
          </div>

          {/* Lab Hours */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lab Hours
            </label>
            <input
              {...register("lab_hours", { valueAsNumber: true })}
              type="number"
              step="0.5"
              min="0"
              max="10"
              onChange={(e) => handleNumberChange("lab_hours", e.target.value)}
              className={`input ${errors.lab_hours ? "border-red-500" : ""}`}
              disabled={loading}
            />
          </div>

          {/* Tutorial Hours */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tutorial Hours
            </label>
            <input
              {...register("tutorial_hours", { valueAsNumber: true })}
              type="number"
              step="0.5"
              min="0"
              max="10"
              onChange={(e) =>
                handleNumberChange("tutorial_hours", e.target.value)
              }
              className={`input ${
                errors.tutorial_hours ? "border-red-500" : ""
              }`}
              disabled={loading}
            />
          </div>
        </div>

        {/* Total Hours Display */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total Contact Hours:</span>
            <span
              className={`text-lg font-semibold ${
                totalHours > 10 ? "text-red-600" : "text-green-600"
              }`}
            >
              {totalHours.toFixed(1)} hours
            </span>
          </div>
          {totalHours > 10 && (
            <p className="mt-1 text-sm text-red-600">
              Total contact hours should not exceed 10 hours
            </p>
          )}
        </div>
      </div>

      {/* Program Type and Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Program Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Program Type *
          </label>
          <select
            {...register("program_type")}
            className="input"
            disabled={loading || fetching}
          >
            {programTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <div className="flex space-x-4 mt-2">
            <label className="inline-flex items-center">
              <input
                {...register("status")}
                type="radio"
                value="active"
                className="h-4 w-4 text-primary-600"
                disabled={loading}
              />
              <span className="ml-2">Active</span>
            </label>
            <label className="inline-flex items-center">
              <input
                {...register("status")}
                type="radio"
                value="inactive"
                className="h-4 w-4 text-primary-600"
                disabled={loading}
              />
              <span className="ml-2">Inactive</span>
            </label>
          </div>
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
          disabled={loading || fetching || !isDirty || totalHours > 10}
          className="btn-primary px-6 py-2"
        >
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {initialData ? "Updating..." : "Creating..."}
            </div>
          ) : initialData ? (
            "Update Course"
          ) : (
            "Create Course"
          )}
        </button>
      </div>
    </form>
  );
};

export default CourseForm;
