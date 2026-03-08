// src/pages/profile/EditProfile.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { authAPI } from '../../api'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Save,
  X,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";

const EditProfile = () => {
  const { user: currentUser, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    address: "",
    first_name: "",
    last_name: "",
    middle_name: "",
    gender: "",
    date_of_birth: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getProfile();

      if (response.success) {
        const { user, staff_profile } = response.data;

        setFormData({
          username: user.username || "",
          email: user.email || "",
          phone: staff_profile?.phone || "",
          address: staff_profile?.address || "",
          first_name: staff_profile?.first_name || "",
          last_name: staff_profile?.last_name || "",
          middle_name: staff_profile?.middle_name || "",
          gender: staff_profile?.gender || "",
          date_of_birth: staff_profile?.date_of_birth
            ? staff_profile.date_of_birth.split("T")[0]
            : "",
        });
      } else {
        toast.error(response.message || "Failed to load profile");
      }
    } catch (error) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (currentUser?.role !== "admin") {
      // For non-admin users, validate staff fields
      if (
        [
          "instructor",
          "department_head",
          "dean",
          "hr_director",
          "registrar",
        ].includes(currentUser?.role)
      ) {
        if (!formData.first_name.trim()) {
          newErrors.first_name = "First name is required";
        }

        if (!formData.last_name.trim()) {
          newErrors.last_name = "Last name is required";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setHasChanges(true);

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);

    try {
      const updateData = {
        username: formData.username,
        email: formData.email,
      };

      // Include staff profile data for academic roles
      if (
        [
          "instructor",
          "department_head",
          "dean",
          "hr_director",
          "registrar",
        ].includes(currentUser?.role)
      ) {
        updateData.staff_profile = {
          phone: formData.phone || null,
          address: formData.address || null,
          first_name: formData.first_name,
          last_name: formData.last_name,
          middle_name: formData.middle_name || null,
          gender: formData.gender || null,
          date_of_birth: formData.date_of_birth || null,
        };
      }

      const response = await authAPI.updateUserProfile(
        currentUser.user_id,
        updateData
      );

      if (response.success) {
        toast.success("Profile updated successfully");
        setHasChanges(false);

        // Update context if needed
        if (updateData.username || updateData.email) {
          updateProfile({
            ...currentUser,
            ...updateData,
          });
        }

        navigate("/profile");
      } else {
        toast.error(response.message || "Failed to update profile");
      }
    } catch (error) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSubmitting(false);
    }
  };

  const isAdmin = currentUser?.role === "admin";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
         

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
              <p className="text-gray-600 mt-2">
                Update your personal information
              </p>
            </div>

            {hasChanges && (
              <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 px-4 py-2 rounded-lg">
                <AlertCircle className="h-5 w-5" />
                <span className="text-sm font-medium">
                  You have unsaved changes
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Account Information */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <User className="h-5 w-5 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Account Information
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    disabled={!isAdmin}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.username ? "border-red-500" : "border-gray-300"
                    } ${!isAdmin ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  />
                  {errors.username && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.username}
                    </p>
                  )}
                  {!isAdmin && (
                    <p className="mt-2 text-sm text-gray-500">
                      Contact administrator to change username
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isAdmin}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    } ${!isAdmin ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  />
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.email}
                    </p>
                  )}
                  {!isAdmin && (
                    <p className="mt-2 text-sm text-gray-500">
                      Contact administrator to change email
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Personal Information */}
            {[
              "instructor",
              "department_head",
              "dean",
              "hr_director",
              "registrar",
            ].includes(currentUser?.role) && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Briefcase className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Personal Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.first_name ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.first_name && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.first_name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.last_name ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.last_name && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.last_name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Middle Name
                    </label>
                    <input
                      type="text"
                      name="middle_name"
                      value={formData.middle_name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      name="date_of_birth"
                      value={formData.date_of_birth}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer_not_to_say">
                        Prefer not to say
                      </option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter your full address"
                  />
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex items-center justify-between pt-8 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center gap-2"
                disabled={submitting}
              >
                <X className="h-4 w-4" />
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting || !hasChanges}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
