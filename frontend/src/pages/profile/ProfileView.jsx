// src/components/profile/ProfileView.jsx
import {
  User,
  Mail,
  Shield,
  Calendar,
  Building,
  Phone,
  MapPin,
  Briefcase,
  Award,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

const ProfileView = ({ user, staffProfile }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getRoleDisplay = (role) => {
    const roleMap = {
      admin: "Administrator",
      instructor: "Instructor",
      department_head: "Department Head",
      dean: "Dean",
      registrar: "Registrar",
      hr_director: "HR Director",
      vpaa: "VP Academic Affairs",
      vpaf: "VP Admin & Finance",
      finance: "Finance Officer",
      cde_director: "CDE Director",
    };
    return roleMap[role] || role.replace("_", " ").toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex items-center gap-6 pb-6 border-b border-gray-200">
        <div className="relative">
          <div className="h-24 w-24 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
            {user?.username?.charAt(0).toUpperCase() || "U"}
          </div>
          <div
            className={`absolute bottom-1 right-1 h-5 w-5 rounded-full border-2 border-white ${
              user?.is_active ? "bg-green-500" : "bg-red-500"
            }`}
          ></div>
        </div>

        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900">
            {staffProfile
              ? `${staffProfile.first_name || ""} ${
                  staffProfile.last_name || ""
                }`.trim()
              : user?.username}
          </h2>

          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Shield className="h-4 w-4" />
              <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">
                {getRoleDisplay(user?.role)}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="h-4 w-4" />
              <span>{user?.email}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              {user?.is_active ? (
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  Active
                </span>
              ) : (
                <span className="flex items-center gap-1 text-red-600">
                  <XCircle className="h-4 w-4" />
                  Inactive
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <User className="h-5 w-5 text-gray-500" />
            Account Information
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Username</span>
              <span className="font-medium">{user?.username}</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Email</span>
              <span className="font-medium">{user?.email}</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">User ID</span>
              <span className="font-medium">#{user?.user_id}</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Last Login</span>
              <span className="font-medium">
                {formatDate(user?.last_login)}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Member Since</span>
              <span className="font-medium">
                {formatDate(user?.created_at)}
              </span>
            </div>
          </div>
        </div>

        {/* Staff Information (if available) */}
        {staffProfile && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-gray-500" />
              Staff Information
            </h3>

            <div className="space-y-3">
              {staffProfile.employee_id && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Employee ID</span>
                  <span className="font-medium">
                    {staffProfile.employee_id}
                  </span>
                </div>
              )}

              {staffProfile.department_id && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Department</span>
                  <span className="font-medium">
                    Dept #{staffProfile.department_id}
                  </span>
                </div>
              )}

              {staffProfile.academic_rank && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Academic Rank</span>
                  <span className="font-medium capitalize">
                    {staffProfile.academic_rank.replace("_", " ")}
                  </span>
                </div>
              )}

              {staffProfile.employment_type && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Employment Type</span>
                  <span className="font-medium capitalize">
                    {staffProfile.employment_type.replace("_", " ")}
                  </span>
                </div>
              )}

              {staffProfile.hire_date && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Hire Date</span>
                  <span className="font-medium">
                    {formatDate(staffProfile.hire_date)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Contact Information */}
      {staffProfile &&
        (staffProfile.phone ||
          staffProfile.address ||
          staffProfile.date_of_birth) && (
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <Phone className="h-5 w-5 text-gray-500" />
              Contact Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {staffProfile.phone && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm">Phone</span>
                  </div>
                  <p className="font-medium">{staffProfile.phone}</p>
                </div>
              )}

              {staffProfile.date_of_birth && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">Date of Birth</span>
                  </div>
                  <p className="font-medium">
                    {formatDate(staffProfile.date_of_birth)}
                  </p>
                </div>
              )}

              {staffProfile.gender && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <User className="h-4 w-4" />
                    <span className="text-sm">Gender</span>
                  </div>
                  <p className="font-medium capitalize">
                    {staffProfile.gender}
                  </p>
                </div>
              )}
            </div>

            {staffProfile.address && (
              <div className="mt-4 bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">Address</span>
                </div>
                <p className="font-medium">{staffProfile.address}</p>
              </div>
            )}
          </div>
        )}
    </div>
  );
};

export default ProfileView;
