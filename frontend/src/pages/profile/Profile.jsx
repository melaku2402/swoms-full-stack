
// src/pages/profile/Profile.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../api';
import { 
  User, Mail, Shield, Calendar, Building, 
  Phone, MapPin, Briefcase, Award, 
  Edit2, Key, CheckCircle, XCircle,
  Clock, FileText, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import MainLayout from '../../components/layout/MainLayout';

const Profile = () => {
   < MainLayout/>
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching profile...');
      
      const response = await authAPI.getProfile();
      console.log('Profile API Response:', response); // Debug log
      
      if (response.success) {
        console.log('Profile Data:', response.data); // Debug log
        setProfileData(response.data);
      } else {
        setError(response.message || 'Failed to load profile');
        toast.error(response.message || 'Failed to load profile');
      }
    } catch (error) {
      console.error('Profile fetch error:', error); // Debug log
      setError(error.message || 'Failed to load profile');
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  const getRoleDisplay = (role) => {
    const roleMap = {
      admin: 'Administrator',
      instructor: 'Instructor',
      department_head: 'Department Head',
      dean: 'Dean',
      registrar: 'Registrar',
      hr_director: 'HR Director',
      vpaa: 'VP Academic Affairs',
      vpaf: 'VP Admin & Finance',
      finance: 'Finance Officer',
      cde_director: 'CDE Director'
    };
    return roleMap[role] || role?.replace('_', ' ').toUpperCase() || 'Unknown';
  };

  // Debug: Check data structure
//   console.log('Current State - profileData:', profileData);
//   console.log('Current State - loading:', loading);
//   console.log('Current State - error:', error);

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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Profile</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchUserProfile}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Check if profileData has expected structure
  const user = profileData?.user || profileData || {};
  const staffProfile = profileData?.staff_profile || profileData?.staff_profile || {};

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">View Profile</h1>
            <p className="text-gray-600 mt-2">
              View your account information and details
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate("/profile/change-password")}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:text-[#9619FA]  hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors cursor-pointer"
            >
              <Key className="h-4 w-4" />
              Change Password
            </button>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-8">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="h-28 w-28 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 flex items-center justify-center text-white text-4xl font-bold">
                  {(user?.username?.charAt(0) || "U").toUpperCase()}
                </div>
                <div
                  className={`absolute bottom-2 right-2 h-6 w-6 rounded-full border-3 border-white ${
                    user?.is_active ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
              </div>

              <div className="flex-1 text-white">
                <h2 className="text-3xl font-bold">
                  {staffProfile?.first_name || staffProfile?.last_name
                    ? `${staffProfile.first_name || ""} ${
                        staffProfile.last_name || ""
                      }`.trim()
                    : user?.username || "User"}
                </h2>

                <div className="flex items-center flex-wrap gap-4 mt-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span className="text-white/90">
                      {user?.email || "No email"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                      {getRoleDisplay(user?.role)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {user?.is_active !== false ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <XCircle className="h-4 w-4" />
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Account Information */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <User className="h-5 w-5 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Account Information
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600">Username</span>
                    <span className="font-medium">
                      {user?.username || "N/A"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600">Email</span>
                    <span className="font-medium">{user?.email || "N/A"}</span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600">User ID</span>
                    <span className="font-medium">
                      #{user?.user_id || user?.id || "N/A"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600">Last Login</span>
                    <span className="font-medium">
                      {formatDate(user?.last_login)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600">Member Since</span>
                    <span className="font-medium">
                      {formatDate(user?.created_at)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Staff Information */}
              {staffProfile && Object.keys(staffProfile).length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Briefcase className="h-5 w-5 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Staff Information
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {staffProfile.employee_id && (
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-gray-600">Employee ID</span>
                        <span className="font-medium">
                          {staffProfile.employee_id}
                        </span>
                      </div>
                    )}

                    {staffProfile.department_id && (
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-gray-600">Department</span>
                        <span className="font-medium">
                          Dept #{staffProfile.department_id}
                        </span>
                      </div>
                    )}

                    {staffProfile.academic_rank && (
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-gray-600">Academic Rank</span>
                        <span className="font-medium capitalize">
                          {staffProfile.academic_rank.replace("_", " ")}
                        </span>
                      </div>
                    )}

                    {staffProfile.employment_type && (
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-gray-600">Employment Type</span>
                        <span className="font-medium capitalize">
                          {staffProfile.employment_type.replace("_", " ")}
                        </span>
                      </div>
                    )}

                    {staffProfile.hire_date && (
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
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
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Phone className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Contact Information
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {staffProfile.phone && (
                      <div className="bg-gray-50 rounded-xl p-5">
                        <div className="flex items-center gap-2 text-gray-600 mb-2">
                          <Phone className="h-4 w-4" />
                          <span className="text-sm font-medium">Phone</span>
                        </div>
                        <p className="font-semibold text-lg">
                          {staffProfile.phone}
                        </p>
                      </div>
                    )}

                    {staffProfile.date_of_birth && (
                      <div className="bg-gray-50 rounded-xl p-5">
                        <div className="flex items-center gap-2 text-gray-600 mb-2">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            Date of Birth
                          </span>
                        </div>
                        <p className="font-semibold text-lg">
                          {formatDate(staffProfile.date_of_birth)}
                        </p>
                      </div>
                    )}

                    {staffProfile.gender && (
                      <div className="bg-gray-50 rounded-xl p-5">
                        <div className="flex items-center gap-2 text-gray-600 mb-2">
                          <User className="h-4 w-4" />
                          <span className="text-sm font-medium">Gender</span>
                        </div>
                        <p className="font-semibold text-lg capitalize">
                          {staffProfile.gender}
                        </p>
                      </div>
                    )}
                  </div>

                  {staffProfile.address && (
                    <div className="mt-6 bg-gray-50 rounded-xl p-5">
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm font-medium">Address</span>
                      </div>
                      <p className="font-medium">{staffProfile.address}</p>
                    </div>
                  )}
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;