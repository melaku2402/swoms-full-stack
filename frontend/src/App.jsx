

import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { Toaster } from "react-hot-toast";

// Layouts
import MainLayout from "./components/layout/MainLayout";
import AuthLayout from "./components/layout/AuthLayout";

// Auth Pages
import Login from "./pages/auth/Login";

// Dashboard Pages
import Dashboard from "./pages/dashboard/Dashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import InstructorDashboard from "./pages/dashboard/views/InstructorDashboard";
import DepartmentHeadDashboard from "./pages/dashboard/views/DepartmentHeadDashboard";
import DeanDashboard from "./pages/dashboard/views/DeanDashboard";
import FinanceDashboard from "./pages/dashboard/views/FinanceDashboard";

// Profile Pages
import Profile from "./pages/profile/Profile";
import EditProfile from "./pages/profile/EditProfile";
import ChangePassword from "./pages/profile/ChangePassword";

// Academic Pages
import CollegeManagement from "./pages/academic/College";
import Departments from "./pages/academic/Departments";
import Courses from "./pages/academic/Courses";

// Admin Pages
import Users from "./pages/admin/Users";
import EditUser from "./pages/admin/EditUser";

// In your App.jsx, add these routes:
import CourseAssignments from "./pages/workload/dept/CourseAssignments";
// import ProgramStructure from "./pages/workload/dept/ProgramStructure";
// import StaffAvailability from "./pages/workload/dept/StaffAvailability";
// import BulkAssignments from "./pages/workload/dept/BulkAssignments";
// import AssignmentOverview from "./pages/workload/dept/AssignmentOverview";
// import YearLevelAssignments from "./pages/workload/dept/YearLevelAssignments";
import CreateAssignment from "./pages/workload/dept/CreateAssignment";
import EditAssignment from "./pages/workload/dept/EditAssignment";



// Add to your existing imports
import WorkloadDashboard from './pages/workload/WorkloadDashboard';
import MyAssignments from './pages/workload/MyAssignments';
// import AcceptDeclineAssignments from './pages/workload/AcceptDeclineAssignments';
import RegularProgram from './pages/workload/RegularProgram';
import NRPWorkload from './pages/workload/NRPWorkload';
import WorkloadReport from "./pages/workload/WorkloadReport";
import AcceptDeclineAssignments from "./pages/workload/AcceptDeclineAssignments";
import ViewAssignment from "./pages/workload/dept/ViewAssignment";
import CompleteWorkloadManager from "./pages/workload/CompleteWorkloadManager";
// Workload Pages (if needed in future)
// import WorkloadList from "./pages/workload/WorkloadList";
// import WorkloadRP from "./pages/workload/WorkloadRP";
// import WorkloadNRP from "./pages/workload/WorkloadNRP";

// Payment Pages (if needed in future)
// import PaymentSheets from "./pages/payments/PaymentSheets";
// import RateTables from "./pages/payments/RateTables";
// import TaxRules from "./pages/payments/TaxRules";

// Other Admin Pages (if needed in future)
// import SystemRules from "./pages/admin/SystemRules";
// import AuditLog from "./pages/admin/AuditLog";

// Report Pages (if needed in future)
// import WorkloadReport from "./pages/reports/WorkloadReport";
// import PaymentReport from "./pages/reports/PaymentReport";

// Protected Route Component
const ProtectedRoute = ({ children, roles = [] }) => {
  const user = JSON.parse(localStorage.getItem("swoms_user") || "null");

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    //  <WorkloadProvider>
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#363636",
              color: "#fff",
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: "#10B981",
                secondary: "#fff",
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: "#EF4444",
                secondary: "#fff",
              },
            },
          }}
        />
        <Routes>
          {/* Public Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
          </Route>
          {/* Protected Routes with MainLayout */}
          <Route element={<MainLayout />}>
            {/* Dashboard */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            {/* Academic Routes */}
            <Route
              path="/academic/colleges"
              element={
                <ProtectedRoute roles={["admin", "dean", "registrar"]}>
                  <CollegeManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/academic/departments"
              element={
                <ProtectedRoute
                  roles={["admin", "dean", "department_head", "registrar"]}
                >
                  <Departments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/academic/courses"
              element={
                <ProtectedRoute
                  roles={["admin", "dean", "department_head", "registrar"]}
                >
                  <Courses />
                </ProtectedRoute>
              }
            />
            {/* Workload Routes (Uncomment when ready) */}
            {/* <Route
              path="/workload"
              element={
                <ProtectedRoute
                  roles={["admin", "instructor", "department_head"]}
                >
                  <WorkloadList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/workload/rp"
              element={
                <ProtectedRoute roles={["admin", "instructor"]}>
                  <WorkloadRP />
                </ProtectedRoute>
              }
            />

            <Route
              path="/workload/nrp"
              element={
                <ProtectedRoute roles={["admin", "instructor"]}>
                  <WorkloadNRP />
                </ProtectedRoute>
              }
            /> */}
            {/* Payment Routes (Uncomment when ready) */}
            {/* <Route
              path="/payments/sheets"
              element={
                <ProtectedRoute roles={["admin", "finance", "vpaf"]}>
                  <PaymentSheets />
                </ProtectedRoute>
              }
            />

            <Route
              path="/payments/rates"
              element={
                <ProtectedRoute roles={["admin", "finance"]}>
                  <RateTables />
                </ProtectedRoute>
              }
            />

            <Route
              path="/payments/tax-rules"
              element={
                <ProtectedRoute roles={["admin", "finance"]}>
                  <TaxRules />
                </ProtectedRoute>
              }
            /> */}
            {/* User Management Routes */}
            <Route
              path="/admin/users/*"
              element={
                <ProtectedRoute roles={["admin", "hr_director", "registrar"]}>
                  <Users />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users/edit/:id"
              element={
                <ProtectedRoute roles={["admin", "hr_director", "registrar"]}>
                  <EditUser />
                </ProtectedRoute>
              }
            />
            {/* Other Admin Routes (Uncomment when ready) */}
            {/* <Route
              path="/admin/rules"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <SystemRules />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/audit-log"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <AuditLog />
                </ProtectedRoute>
              }
            /> */}
            {/* Report Routes (Uncomment when ready) */}
            {/* <Route
              path="/reports/workload"
              element={
                <ProtectedRoute roles={["admin", "dean", "department_head"]}>
                  <WorkloadReport />
                </ProtectedRoute>
              }
            />

            <Route
              path="/reports/payments"
              element={
                <ProtectedRoute roles={["admin", "finance", "vpaf"]}>
                  <PaymentReport />
                </ProtectedRoute>
              }
            /> */}
            {/* Profile Routes */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/edit"
              element={
                <ProtectedRoute>
                  <EditProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/change-password"
              element={
                <ProtectedRoute>
                  <ChangePassword />
                </ProtectedRoute>
              }
            />
            {/*  Add these routes inside your Routes component: */}
            <Route
              path="/workload/dept/assignments"
              element={
                <ProtectedRoute roles={["department_head"]}>
                  <CourseAssignments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workload/dept/assignments/create"
              element={
                <ProtectedRoute roles={["department_head"]}>
                  <CreateAssignment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workload/dept/assignments/edit/:id"
              element={
                <ProtectedRoute roles={["department_head"]}>
                  <EditAssignment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workload/dept/assignments/view/:id"
              element={
                <ProtectedRoute roles={["department_head", "instructor"]}>
                  <ViewAssignment />
                </ProtectedRoute>
              }
            />
            {/* <Route
            path="/workload/dept/program-structure"
            element={
              <ProtectedRoute roles={["department_head"]}>
                <ProgramStructure />
              </ProtectedRoute>
            }
          /> */}
            {/* <Route
            path="/workload/dept/availability"
            element={
              <ProtectedRoute roles={["department_head"]}>
                <StaffAvailability />
              </ProtectedRoute>
            }
          /> */}
            {/* <Route
            path="/workload/dept/bulk"
            element={
              <ProtectedRoute roles={["department_head"]}>
                <BulkAssignments />
              </ProtectedRoute>
            }
          /> */}
            {/* <Route
            path="/workload/dept/overview"
            element={
              <ProtectedRoute roles={["department_head"]}>
                <AssignmentOverview />
              </ProtectedRoute>
            }
          /> */}
            {/* <Route
            path="/workload/dept/year-levels"
            element={
              <ProtectedRoute roles={["department_head"]}>
                <YearLevelAssignments />
              </ProtectedRoute>
            }
          /> */}
            {/* Default redirect */}
            <Route
              path="/workload"
              element={
                <ProtectedRoute roles={["instructor"]}>
                  <WorkloadDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workload/assignments"
              element={
                <ProtectedRoute roles={["instructor"]}>
                  <MyAssignments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workload/assignments/approve"
              element={
                <ProtectedRoute roles={["instructor"]}>
                  <AcceptDeclineAssignments />
                </ProtectedRoute>
              }
            />
            {/* <Route
              path="/workload/assignments/approve"
              element={
                <ProtectedRoute roles={["instructor"]}>
                  <CompleteWorkloadManager />
                </ProtectedRoute>
              }
            /> */}
            <Route
              path="/workload/rp"
              element={
                <ProtectedRoute roles={["instructor"]}>
                  <RegularProgram />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workload/nrp"
              element={
                <ProtectedRoute roles={["instructor"]}>
                  <NRPWorkload />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workload/summary"
              element={
                <ProtectedRoute roles={["instructor"]}>
                  <WorkloadReport />
                </ProtectedRoute>
              }
            />
            {/* // In your App.jsx, add this import: import CompleteWorkloadManager
            from './pages/workload/CompleteWorkloadManager'; // Then add this
            route in your Routes component: */}
            <Route
              path="/workload/complete/:workloadType?/:workloadId?"
              element={
                <ProtectedRoute
                  roles={[
                    "admin",
                    "instructor",
                    "department_head",
                    "dean",
                    "finance",
                  ]}
                >
                  <CompleteWorkloadManager />
                </ProtectedRoute>
              }
            />
            {/* // Or if you want separate routes for RP and NRP: */}
            <Route
              path="/workload/complete/rp"
              element={
                <ProtectedRoute
                  roles={[
                    "admin",
                    "instructor",
                    "department_head",
                    "dean",
                    "finance",
                  ]}
                >
                  <CompleteWorkloadManager />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workload/complete/rp/:workloadId"
              element={
                <ProtectedRoute
                  roles={[
                    "admin",
                    "instructor",
                    "department_head",
                    "dean",
                    "finance",
                  ]}
                >
                  <CompleteWorkloadManager />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workload/complete/nrp"
              element={
                <ProtectedRoute
                  roles={[
                    "admin",
                    "instructor",
                    "department_head",
                    "dean",
                    "finance",
                  ]}
                >
                  <CompleteWorkloadManager />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workload/complete/nrp/:workloadId"
              element={
                <ProtectedRoute
                  roles={[
                    "admin",
                    "instructor",
                    "department_head",
                    "dean",
                    "finance",
                  ]}
                >
                  <CompleteWorkloadManager />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          {/* 404 Page */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                  <p className="text-xl text-gray-600 mb-8">Page not found</p>
                  <Link
                    to="/dashboard"
                    className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Go to Dashboard
                  </Link>
                </div>
              </div>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
    //  </WorkloadProvider>
  
  );
}

export default App;


