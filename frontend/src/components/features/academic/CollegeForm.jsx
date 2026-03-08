import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Building, User } from "lucide-react";

const collegeSchema = z.object({
  college_code: z
    .string()
    .min(2, "College code must be at least 2 characters")
    .max(20, "College code must be less than 20 characters")
    .regex(/^[A-Z]+$/, "College code must be uppercase letters only"),
  college_name: z
    .string()
    .min(3, "College name must be at least 3 characters")
    .max(150, "College name must be less than 150 characters"),
  dean_user_id: z.string().optional(),
  status: z.enum(["active", "inactive"]).default("active"),
});

const CollegeForm = ({ initialData, onSubmit, onCancel, loading }) => {
  const [availableDeans, setAvailableDeans] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(collegeSchema),
    defaultValues: initialData || {
      college_code: "",
      college_name: "",
      dean_user_id: "",
      status: "active",
    },
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }

    // Fetch available deans (users with dean role)
    // This would typically be an API call
    setAvailableDeans([
      { user_id: 1, name: "Dr. John Doe", email: "john@injibara.edu.et" },
      { user_id: 2, name: "Dr. Jane Smith", email: "jane@injibara.edu.et" },
      {
        user_id: 3,
        name: "Dr. Michael Brown",
        email: "michael@injibara.edu.et",
      },
    ]);
  }, [initialData, reset]);

  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* College Code */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            College Code *
          </label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              {...register("college_code")}
              type="text"
              className={`pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.college_code ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="e.g., COS, CONA"
              maxLength={20}
              disabled={loading}
            />
          </div>
          {errors.college_code && (
            <p className="mt-1 text-sm text-red-600">
              {errors.college_code.message}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Unique uppercase code (e.g., COS for College of Social Sciences)
          </p>
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

      {/* College Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          College Name *
        </label>
        <input
          {...register("college_name")}
          type="text"
          className={`input ${errors.college_name ? "border-red-500" : ""}`}
          placeholder="e.g., College of Social Sciences"
          maxLength={150}
          disabled={loading}
        />
        {errors.college_name && (
          <p className="mt-1 text-sm text-red-600">
            {errors.college_name.message}
          </p>
        )}
      </div>

      {/* Dean Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Dean (Optional)
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <select
            {...register("dean_user_id")}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            disabled={loading}
          >
            <option value="">Select a Dean</option>
            {availableDeans.map((dean) => (
              <option key={dean.user_id} value={dean.user_id}>
                {dean.name} ({dean.email})
              </option>
            ))}
          </select>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Assign a dean to manage this college
        </p>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="btn-secondary px-6 py-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || !isDirty}
          className="btn-primary px-6 py-2"
        >
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {initialData ? "Updating..." : "Creating..."}
            </div>
          ) : initialData ? (
            "Update College"
          ) : (
            "Create College"
          )}
        </button>
      </div>
    </form>
  );
};

export default CollegeForm;
