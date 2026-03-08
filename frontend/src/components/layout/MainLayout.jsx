
// src/components/layout/MainLayout.jsx
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  Home,
  Users,
  BookOpen,
  FileText,
  DollarSign,
  Settings,
  LogOut,
  Menu,
  X,
  BarChart3,
  Bell,
  UserCircle,
  Shield,
  ClipboardCheck,
  ChevronRight,
  Building,
  GraduationCap,
  Calendar,
  Award,
  PieChart,
  TrendingUp,
  Database,
  CreditCard,
  School,
  Library,
  Layers,
  History,
  ShieldCheck,
  UserPlus,
  CheckSquare,
  Calculator,
  FileSpreadsheet,
  Receipt,
  LineChart,
  Briefcase,
  FolderOpen,
  AlertCircle,
  ChartBar,
  ClipboardList,
  Book,
  FileBarChart,
  Workflow,
  CalendarDays,
  Building2,
  Target,
  Cpu,
  Zap,
  Activity,
  Search,
  Filter,
  Upload,
  Download,
  Eye,
  Edit,
  Lock,
  Key,
  Grid,
  Server,
  HardDrive,
  Network,
  Cloud,
  Database as DatabaseIcon,
  FolderTree,
  GitBranch,
  Clock,
  Mail,
  HelpCircle,
  File,
  UserCheck,
  CheckCircle,
  XCircle,
  TrendingDown,
  PieChart as PieChartIcon,
  BarChart2,
  DownloadCloud,
  UploadCloud,
  RefreshCw,
  MoreVertical,
  ChevronDown,
  Star,
  Target as TargetIcon,
  Zap as ZapIcon,
  AlertTriangle,
  Check,
  Plus,
  Minus,
  EyeOff,
  Eye as EyeIcon,
  BellRing,
  Inbox,
  MessageSquare,
  Phone,
  Video,
  MapPin,
  Globe,
  Shield as ShieldIcon,
  Users as UsersIcon,
  Briefcase as BriefcaseIcon,
  School as SchoolIcon,
  DollarSign as DollarSignIcon,
  Calendar as CalendarIcon
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";

const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(3);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "New Workload Assignment",
      message: "You have been assigned 3 new courses for Spring 2024",
      time: "10 minutes ago",
      unread: true,
      type: "workload",
      icon: ClipboardCheck,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      id: 2,
      title: "Payment Processed",
      message: "Your payment for October 2024 has been successfully processed",
      time: "2 hours ago",
      unread: true,
      type: "payment",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      id: 3,
      title: "System Maintenance",
      message: "Scheduled maintenance this Friday from 10 PM to 2 AM",
      time: "1 day ago",
      unread: false,
      type: "system",
      icon: Server,
      color: "text-amber-600",
      bgColor: "bg-amber-50"
    },
    {
      id: 4,
      title: "Overload Alert",
      message: "You are approaching your maximum workload limit",
      time: "2 days ago",
      unread: false,
      type: "alert",
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      id: 5,
      title: "Course Request Approved",
      message: "Your request for 'Advanced Programming' has been approved",
      time: "3 days ago",
      unread: false,
      type: "academic",
      icon: CheckCircle,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50"
    }
  ]);
  
  const [userStats, setUserStats] = useState({
    workloadHours: 42,
    pendingApprovals: 3,
    paymentAmount: 2840,
    overloadLevel: 85,
    coursesAssigned: 5,
    students: 150,
    completionRate: 92
  });

  // Refs for click outside detection
  const notificationsRef = useRef(null);
  const profileRef = useRef(null);
  const searchRef = useRef(null);

  // Format date and time
  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour12: true,
    hour: '2-digit',
    minute: '2-digit'
  });

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  // Handle click outside notifications and profile dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast.success(`Searching for "${searchQuery}"`);
      // Implement actual search logic here
      setSearchQuery("");
    }
  };

  const markNotificationAsRead = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, unread: false } : notif
    ));
    setUnreadNotifications(prev => Math.max(0, prev - 1));
    toast.success("Notification marked as read");
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, unread: false })));
    setUnreadNotifications(0);
    toast.success("All notifications marked as read");
  };

  const clearNotification = (id) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
    toast.success("Notification cleared");
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadNotifications(0);
    toast.success("All notifications cleared");
  };

  const handleQuickAction = (action) => {
    switch(action) {
      case 'upload':
        toast.success("Opening file upload...");
        // Implement upload logic
        break;
      case 'export':
        toast.success("Exporting data...");
        // Implement export logic
        break;
      case 'refresh':
        toast.success("Refreshing data...");
        // Implement refresh logic
        break;
      default:
        break;
    }
  };

  // Get role-based navigation based on BACKEND ROUTES
  const getRoleNavigation = () => {
    const role = user?.role || "instructor";

    // COMMON ITEMS FOR ALL ROLES
    const commonItems = [
      {
        icon: Home,
        label: "Dashboard",
        path: "/dashboard",
        isDashboard: true,
      },
      {
        icon: UserCircle,
        label: "My Profile",
        path: "/profile",
        submenu: [
          { label: "View Profile", path: "/profile" },
          { label: "Edit Profile", path: "/profile/edit" },
          { label: "Change Password", path: "/profile/change-password" },
        ],
      },
    ];

    // ========== ADMIN (Full System Access) ==========
    const adminItems = [
      {
        icon: Users,
        label: "User Management",
        path: "/admin/users",
        submenu: [
          { label: "All Users", path: "/admin/users" },
          { label: "Create User", path: "/admin/users/create" },
          { label: "Reset Password", path: "/admin/users/reset-password" },
          // { label: "Deactivate Users", path: "/admin/users/deactivate" },
        ],
      },
      {
        icon: UserPlus,
        label: "Role Registration",
        path: "/role-registration",
        submenu: [
          {
            label: "Create Executives",
            path: "/role-registration/admin/create-executives",
          },
          {
            label: "Admin Creatable Roles",
            path: "/role-registration/admin/creatable-roles",
          },
          {
            label: "My Created Users",
            path: "/role-registration/my-created-users",
          },
        ],
      },
      {
        icon: Building2,
        label: "Academic Structure",
        path: "/academic",
        submenu: [
          { label: "Colleges", path: "/academic/colleges" },
          { label: "Departments", path: "/academic/departments" },
          { label: "Programs", path: "/academic/programs" },
          { label: "Courses", path: "/academic/courses" },
          { label: "Sections", path: "/academic/sections" },
        ],
      },
      {
        icon: CalendarDays,
        label: "Academic Timeline",
        path: "/academic-timeline",
        submenu: [
          { label: "Academic Years", path: "/academic/years" },
          { label: "Semesters", path: "/academic/semesters" },
          { label: "Active Academic Year", path: "/academic/years/active" },
          { label: "Current Semester", path: "/academic/semesters/current" },
        ],
      },
      {
        icon: Shield,
        label: "System Rules",
        path: "/system/rules",
        submenu: [
          { label: "All Rules", path: "/system/rules" },
          { label: "Create Rule", path: "/system/rules/create" },
          { label: "Rate Tables", path: "/system/rules/rate-tables" },
          { label: "Tax Rules", path: "/system/rules/tax-rules" },
          { label: "Clear Cache", path: "/system/rules/cache" },
        ],
      },
      {
        icon: CreditCard,
        label: "Financial System",
        path: "/finance",
        submenu: [
          { label: "Payment Sheets", path: "/finance/sheets" },
          { label: "Payment Processing", path: "/finance/process" },
          { label: "Payment Statistics", path: "/finance/statistics" },
          { label: "Bulk Update", path: "/finance/bulk-update" },
          { label: "Export Sheets", path: "/finance/export" },
        ],
      },
      {
        icon: Activity,
        label: "Monitoring",
        path: "/monitoring",
        submenu: [
          { label: "Overload Detection", path: "/monitoring/overload" },
          {
            label: "Department Overload",
            path: "/monitoring/department-overload",
          },
          { label: "Overload Alerts", path: "/monitoring/alerts" },
          { label: "Trend Prediction", path: "/monitoring/trends" },
          { label: "Overload Reports", path: "/monitoring/reports" },
        ],
      },
      {
        icon: ChartBar,
        label: "Reports & Analytics",
        path: "/reports",
        submenu: [
          { label: "Academic Reports", path: "/reports/academic" },
          { label: "Workload Reports", path: "/reports/workload" },
          { label: "Financial Reports", path: "/reports/financial" },
          { label: "Staff Reports", path: "/reports/staff" },
          { label: "Department Reports", path: "/reports/department" },
          { label: "College Reports", path: "/reports/college" },
          { label: "Overload Reports", path: "/reports/overload" },
        ],
      },
    ];

    // ========== INSTRUCTOR ==========
    const instructorItems = [
      {
        icon: FolderOpen,
        label: "My Workload",
        path: "/workload",
        submenu: [
          { label: "Workload Dashboard", path: "/workload" },
          { label: "My Assignments", path: "/workload/assignments" },
          // { label: "Accept/Decline", path: "/workload/assignments/approve" },
            // import CompleteWorkloadManager from "./pages/workload/CompleteWorkloadManager";

          { label: "Complete WorkloadManager", path: "/workload/complete/rp" },
          { label: "Regular Program", path: "/workload/rp" },
          { label: "NRP Workload", path: "/workload/nrp" },
          { label: "Workload Summary", path: "/workload/summary" },
        ],
      },
      {
        icon: Receipt,
        label: "My Payments",
        path: "/payments",
        submenu: [
          { label: "Payment Sheets", path: "/payments/sheets" },
          { label: "Payment History", path: "/payments/history" },
        ],
      },
      {
        icon: AlertCircle,
        label: "Overload Status",
        path: "/overload",
        submenu: [
          { label: "Check My Overload", path: "/overload/check" },
          { label: "Overload Report", path: "/overload/report" },
        ],
      },
      {
        icon: BookOpen,
        label: "Course Requests",
        path: "/course-requests",
        submenu: [
          { label: "Create Request", path: "/course-requests/create" },
          { label: "My Requests", path: "/course-requests/my" },
          { label: "Available Courses", path: "/course-requests/available" },
        ],
      },
    ];
    // ========== DEPARTMENT HEAD ==========
    const departmentHeadItems = [
      // {
      //   icon: Building,
      //   label: "Department",
      //   path: "/department",
      //   submenu: [
      //     { label: "Department Dashboard", path: "/department" },
      //     { label: "Department Staff", path: "/department/staff" },
      //     { label: "Department Statistics", path: "/department/stats" },
      //   ],
      // },
      {
        icon: FolderOpen,
        label: "Workload Management",
        path: "/workload/dept",
        submenu: [
          { label: "Course Assignments", path: "/workload/dept/assignments" },
         { label: "Complete WorkloadManager", path: "/workload/complete/rp" },

          {
            label: "Program Structure",
            path: "/workload/dept/program-structure",
          },
          {
            label: "Staff Availability",
            path: "/workload/dept/availability",
          },
          { label: "Bulk Assignments", path: "/workload/dept/bulk" },
          { label: "Assignment Overview", path: "/workload/dept/overview" },
          {
            label: "Year Level Assignments",
            path: "/workload/dept/year-levels",
          },
        ],
      },
      {
        icon: ClipboardCheck,
        label: "Approvals",
        path: "/approvals",
        submenu: [
          { label: "Course Requests", path: "/approvals/course-requests" },
          { label: "Pending Requests", path: "/approvals/pending" },
          { label: "Workload Approvals", path: "/approvals/workload" },
        ],
      },
      {
        icon: Target,
        label: "Overload Control",
        path: "/overload/dept",
        submenu: [
          { label: "Department Overload", path: "/overload/dept" },
          { label: "Overload Alerts", path: "/overload/dept/alerts" },
          { label: "Staff Overload Check", path: "/overload/dept/staff" },
        ],
      },
    ];

    // ========== DEAN ==========
    const deanItems = [
      {
        icon: Building2,
        label: "College Management",
        path: "/college",
        submenu: [
          { label: "College Dashboard", path: "/college" },
          { label: "Departments", path: "/college/departments" },
          { label: "College Statistics", path: "/college/stats" },
          { label: "Assign Dean", path: "/college/assign-dean" },
        ],
      },
      {
        icon: UserPlus,
        label: "Role Registration",
        path: "/role-registration/dean",
        submenu: [
          {
            label: "Create Department Heads",
            path: "/role-registration/dean/create-department-heads",
          },
        ],
      },
      {
        icon: Eye,
        label: "College Oversight",
        path: "/oversight",
        submenu: [
          { label: "Workload Approval", path: "/oversight/workload" },
          { label: "Overload Monitoring", path: "/oversight/overload" },
          { label: "Department Review", path: "/oversight/departments" },
        ],
      },
    ];

    // ========== REGISTRAR ==========
    const registrarItems = [
      {
        icon: BookOpen,
        label: "Academic Records",
        path: "/academic/records",
        submenu: [
          { label: "Academic Years", path: "/academic/years" },
          { label: "Semesters", path: "/academic/semesters" },
          { label: "Programs", path: "/academic/programs" },
          { label: "Courses", path: "/academic/courses" },
          { label: "Sections", path: "/academic/sections" },
        ],
      },
      {
        icon: ClipboardList,
        label: "Registration",
        path: "/registrar",
        submenu: [
          { label: "Course Management", path: "/registrar/courses" },
          { label: "Section Management", path: "/registrar/sections" },
          { label: "Program Management", path: "/registrar/programs" },
        ],
      },
    ];

    // ========== HR DIRECTOR ==========
    const hrDirectorItems = [
      {
        icon: Users,
        label: "HR Management",
        path: "/hr",
        submenu: [
          { label: "Staff Directory", path: "/hr/staff" },
          {
            label: "Create Instructor",
            path: "/role-registration/hr/create-instructors",
          },
          { label: "Activate/Deactivate", path: "/hr/activation" },
          { label: "Update Staff Rank", path: "/hr/rank" },
          { label: "Assign to Department", path: "/hr/assign-dept" },
        ],
      },
      {
        icon: ShieldCheck,
        label: "HR Approvals",
        path: "/approvals/hr",
        submenu: [
          { label: "Workload Approvals", path: "/approvals/hr/workload" },
          { label: "Staff Approvals", path: "/approvals/hr/staff" },
        ],
      },
      {
        icon: ChartBar,
        label: "HR Reports",
        path: "/reports/hr",
        submenu: [
          { label: "Staff Statistics", path: "/reports/hr/staff" },
          { label: "Workload Analysis", path: "/reports/hr/workload" },
          { label: "Rank Distribution", path: "/reports/hr/ranks" },
        ],
      },
    ];

    // ========== FINANCE ==========
    const financeItems = [
      {
        icon: CreditCard,
        label: "Payment Processing",
        path: "/finance/process",
        submenu: [
          { label: "Payment Sheets", path: "/finance/process/sheets" },
          { label: "Payment Status", path: "/finance/process/status" },
          { label: "Bulk Update", path: "/finance/process/bulk" },
          { label: "Export Sheets", path: "/finance/process/export" },
        ],
      },
      {
        icon: Calculator,
        label: "Rules & Rates",
        path: "/rules",
        submenu: [
          { label: "All Rules", path: "/rules" },
          { label: "Create Rule", path: "/rules/create" },
          { label: "Payment Rates", path: "/rules/rates" },
          { label: "Tax Rules", path: "/rules/tax" },
        ],
      },
      {
        icon: DollarSign,
        label: "Financial Oversight",
        path: "/finance/oversight",
        submenu: [
          { label: "Payment Statistics", path: "/finance/oversight/stats" },
          { label: "Payment Reports", path: "/finance/oversight/reports" },
        ],
      },
    ];

    // ========== VPAA ==========
    const vpaaItems = [
      {
        icon: UserPlus,
        label: "Role Registration",
        path: "/role-registration/vpaa",
        submenu: [
          {
            label: "Create Deans & Registrar",
            path: "/role-registration/vpaa/create-deans-registrar",
          },
        ],
      },
      {
        icon: CheckSquare,
        label: "Academic Approvals",
        path: "/vpaa/approvals",
        submenu: [
          { label: "Workload Approvals", path: "/vpaa/approvals/workload" },
        ],
      },
    ];

    // ========== VPAF ==========
    const vpafItems = [
      {
        icon: DollarSign,
        label: "Financial Oversight",
        path: "/vpaf",
        submenu: [
          { label: "Payment Approval", path: "/vpaf/approvals" },
          { label: "Financial Reports", path: "/vpaf/reports" },
        ],
      },
    ];

    // ========== CDE DIRECTOR ==========
    const cdeDirectorItems = [
      {
        icon: School,
        label: "CDE Management",
        path: "/cde",
        submenu: [
          { label: "CDE Workload", path: "/cde/workload" },
          { label: "CDE Payments", path: "/cde/payments" },
        ],
      },
    ];

    // ========== COMBINE BASED ON ROLE ==========
    switch (role) {
      case "admin":
        return [...commonItems, ...adminItems];
      case "instructor":
        return [...commonItems, ...instructorItems];
      case "department_head":
        return [...commonItems, ...departmentHeadItems];
      case "dean":
        return [...commonItems, ...deanItems];
      case "registrar":
        return [...commonItems, ...registrarItems];
      case "hr_director":
        return [...commonItems, ...hrDirectorItems];
      case "finance":
        return [...commonItems, ...financeItems];
      case "vpaf":
        return [...commonItems, ...vpafItems];
      case "vpaa":
        return [...commonItems, ...vpaaItems];
      case "cde_director":
        return [...commonItems, ...cdeDirectorItems];
      default:
        return [...commonItems, ...instructorItems];
    }
  };

  const navigationItems = getRoleNavigation();

  // Get breadcrumbs from current path
  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(p => p);
    const breadcrumbs = [{ label: 'Home', path: '/dashboard', icon: Home }];
    
    let currentPath = '';
    paths.forEach((path, index) => {
      currentPath += `/${path}`;
      const navItem = navigationItems.find(item => 
        item.path === currentPath || 
        (item.submenu && item.submenu.some(sub => sub.path === currentPath))
      );
      
      if (navItem) {
        if (navItem.submenu) {
          const subItem = navItem.submenu.find(sub => sub.path === currentPath);
          if (subItem) {
            breadcrumbs.push({ 
              label: subItem.label, 
              path: currentPath,
              icon: navItem.icon 
            });
          }
        } else {
          breadcrumbs.push({ 
            label: navItem.label, 
            path: currentPath,
            icon: navItem.icon 
          });
        }
      } else if (path !== 'dashboard') {
        // Fallback for unknown paths
        breadcrumbs.push({ 
          label: path.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' '), 
          path: currentPath,
          icon: File 
        });
      }
    });
    
    return breadcrumbs;
  };

  // Get role-specific dashboard stats
  const getDashboardStats = () => {
    const role = user?.role || "instructor";
    const baseStats = [
      {
        title: "Workload Hours",
        value: userStats.workloadHours,
        change: "+5%",
        changeType: "positive",
        icon: Clock,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        description: "Current weekly hours"
      },
      {
        title: "Pending Approvals",
        value: userStats.pendingApprovals,
        change: "Requires attention",
        changeType: "warning",
        icon: AlertCircle,
        color: "text-amber-600",
        bgColor: "bg-amber-50",
        description: "Waiting for review"
      },
      {
        title: "Payment Amount",
        value: `$${userStats.paymentAmount}`,
        change: "+12%",
        changeType: "positive",
        icon: DollarSign,
        color: "text-green-600",
        bgColor: "bg-green-50",
        description: "This month's payment"
      },
      {
        title: "Overload Level",
        value: `${userStats.overloadLevel}%`,
        change: "Approaching limit",
        changeType: "negative",
        icon: Activity,
        color: "text-red-600",
        bgColor: "bg-red-50",
        description: "Current capacity"
      }
    ];

    // Role-specific adjustments
    switch(role) {
      case "admin":
        baseStats[0] = {
          title: "Total Users",
          value: 1452,
          change: "+8%",
          changeType: "positive",
          icon: Users,
          color: "text-purple-600",
          bgColor: "bg-purple-50",
          description: "Active system users"
        };
        baseStats[1] = {
          title: "Active Departments",
          value: 28,
          change: "+2",
          changeType: "positive",
          icon: Building,
          color: "text-cyan-600",
          bgColor: "bg-cyan-50",
          description: "Departments this semester"
        };
        break;
      case "department_head":
        baseStats[0] = {
          title: "Department Staff",
          value: 42,
          change: "+3",
          changeType: "positive",
          icon: Users,
          color: "text-indigo-600",
          bgColor: "bg-indigo-50",
          description: "Active department members"
        };
        baseStats[1] = {
          title: "Courses Assigned",
          value: 156,
          change: "+12",
          changeType: "positive",
          icon: BookOpen,
          color: "text-emerald-600",
          bgColor: "bg-emerald-50",
          description: "This semester"
        };
        break;
      case "dean":
        baseStats[0] = {
          title: "College Departments",
          value: 8,
          change: "+1",
          changeType: "positive",
          icon: Building2,
          color: "text-teal-600",
          bgColor: "bg-teal-50",
          description: "Under management"
        };
        baseStats[1] = {
          title: "Total Faculty",
          value: 245,
          change: "+15",
          changeType: "positive",
          icon: GraduationCap,
          color: "text-amber-600",
          bgColor: "bg-amber-50",
          description: "College-wide"
        };
        break;
    }

    return baseStats;
  };

  const dashboardStats = getDashboardStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      {/* Professional Header */}
      <header className="fixed top-0 left-0 right-0 lg:left-64 h-16 bg-[#08387F] border-b border-white/10 z-50">
        <div className="h-full px-4 lg:px-6 flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Breadcrumb */}
            <div className="hidden lg:flex items-center space-x-2 text-sm">
              {getBreadcrumbs().map((crumb, index) => (
                <div key={index} className="flex items-center">
                  {index > 0 && <ChevronRight className="h-4 w-4 text-blue-300 mx-2" />}
                  <Link
                    to={crumb.path}
                    className={`flex items-center space-x-2 ${
                      index === getBreadcrumbs().length - 1
                        ? "text-white font-semibold"
                        : "text-blue-200 hover:text-white"
                    }`}
                  >
                    {index === 0 && <crumb.icon className="h-4 w-4" />}
                    <span>{crumb.label}</span>
                  </Link>
                </div>
              ))}
            </div>

            {/* Search Bar */}
            <div className="hidden lg:block relative" ref={searchRef}>
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-300" />
                <input
                  type="text"
                  placeholder="Search modules, users, or reports..."
                  className="pl-10 pr-10 py-2 w-80 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-transparent transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-300 hover:text-white"
                  >
                    <X size={14} />
                  </button>
                )}
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 opacity-0 pointer-events-none"
                >
                  <Search size={14} />
                </button>
              </form>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Date & Time Display */}
            <div className="hidden lg:block text-right">
              <div className="text-xs text-blue-200">{formattedDate}</div>
              <div className="text-sm font-semibold text-white flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                {formattedTime}
              </div>
            </div>


               
            {/* Quick Actions */}
            <div className="hidden lg:flex items-center space-x-2 border-r border-white/20 pr-4">
              <button 
                onClick={() => handleQuickAction('upload')}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors relative group"
                title="Upload Files"
              >
                <Upload className="h-5 w-5 text-blue-200" />
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  Upload Files
                </div>
              </button>
              <button 
                onClick={() => handleQuickAction('export')}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors relative group"
                title="Export Data"
              >
                <Download className="h-5 w-5 text-blue-200" />
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  Export Data
                </div>
              </button>
              <button 
                onClick={() => handleQuickAction('refresh')}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors relative group"
                title="Refresh"
              >
                <RefreshCw className="h-5 w-5 text-blue-200" />
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  Refresh
                </div>
              </button>
            </div>

            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfileMenu(false);
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors relative"
              >
                <Bell className="h-5 w-5 text-blue-200" />
                {unreadNotifications > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-xs rounded-full flex items-center justify-center text-white font-bold animate-pulse">
                    {unreadNotifications}
                  </div>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                  <div className="p-4 border-b">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-gray-800">Notifications</h3>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={markAllAsRead}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Mark all read
                        </button>
                        <button 
                          onClick={clearAllNotifications}
                          className="text-xs text-red-600 hover:text-red-800"
                        >
                          Clear all
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${notif.unread ? 'bg-blue-50' : ''}`}
                          onClick={() => markNotificationAsRead(notif.id)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-lg ${notif.color} ${notif.bgColor}`}>
                              <notif.icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <h4 className="font-medium text-gray-900">{notif.title}</h4>
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs text-gray-500">{notif.time}</span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      clearNotification(notif.id);
                                    }}
                                    className="text-gray-400 hover:text-red-500"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                              {notif.unread && (
                                <div className="flex items-center mt-2">
                                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                                  <span className="text-xs text-blue-600">Unread</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No notifications</p>
                        <p className="text-sm text-gray-400 mt-1">You're all caught up!</p>
                      </div>
                    )}
                  </div>
                  <div className="p-3 border-t">
                    <Link
                      to="/notifications"
                      className="block text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                      onClick={() => setShowNotifications(false)}
                    >
                      View all notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Menu */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotifications(false);
                }}
                className="flex items-center space-x-3 p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-sm font-medium text-white">{user?.name || "User"}</div>
                  <div className="text-xs text-blue-200 capitalize">
                    {user?.role?.replace("_", " ") || "Staff"}
                  </div>
                </div>
                <ChevronDown className={`h-4 w-4 text-blue-300 transition-transform ${showProfileMenu ? "rotate-180" : ""}`} />
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50 py-1">
                  <div className="px-4 py-3 border-b">
                    <div className="text-sm font-semibold text-gray-900">{user?.name}</div>
                    <div className="text-xs text-gray-500 truncate">{user?.email || "user@university.edu"}</div>
                    <div className="mt-1">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                        {user?.role?.replace("_", " ") || "Staff"}
                      </span>
                    </div>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <UserCircle className="h-4 w-4 mr-3 text-gray-500" />
                      My Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <Settings className="h-4 w-4 mr-3 text-gray-500" />
                      Settings
                    </Link>
                    <Link
                      to="/help"
                      className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <HelpCircle className="h-4 w-4 mr-3 text-gray-500" />
                      Help & Support
                    </Link>
                    <div className="border-t my-1"></div>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        handleLogout();
                      }}
                      className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-[#08387F] via-[#10396D] to-[#08387F] backdrop-blur-lg border-r border-blue-800/30 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 transition-transform duration-300 ease-in-out overflow-y-auto`}
      >
        <div className="h-full flex flex-col">
          {/* University Header */}
          <div className="p-6 border-b border-blue-800/30">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                <GraduationCap className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">INJIBARA</h1>
                <p className="text-xs text-blue-300">University SWOMS</p>
                <p className="text-xs text-amber-400 mt-1 capitalize">
                  {user?.role?.replace("_", " ") || "Staff"} Portal
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-1">
              {navigationItems.map((item) => (
                <li key={item.path}>
                  {item.submenu && item.submenu.length > 0 ? (
                    <div className="mb-1">
                      <button
                        onClick={() =>
                          setActiveSubmenu(
                            activeSubmenu === item.path ? null : item.path
                          )
                        }
                        className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg transition-all ${
                          location.pathname.startsWith(item.path)
                            ? "bg-gradient-to-r from-amber-500/30 to-transparent border-l-4 border-amber-500"
                            : "text-blue-300 hover:text-white hover:bg-blue-800/30"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <item.icon size={20} className="flex-shrink-0" />
                          <span className="text-sm font-medium">
                            {item.label}
                          </span>
                        </div>
                        <ChevronRight
                          className={`h-4 w-4 transition-transform flex-shrink-0 ${
                            activeSubmenu === item.path ? "rotate-90" : ""
                          }`}
                        />
                      </button>
                      {activeSubmenu === item.path && (
                        <ul className="ml-4 mt-1 space-y-1">
                          {item.submenu.map((subItem) => (
                            <li key={subItem.path}>
                              <Link
                                to={subItem.path}
                                className={`flex items-center space-x-3 px-3 py-2.5 text-sm rounded-lg transition-all ${
                                  location.pathname === subItem.path
                                    ? "bg-amber-500 text-white font-semibold shadow-sm"
                                    : "text-blue-300 hover:text-white hover:bg-blue-800/20"
                                }`}
                                onClick={() => setSidebarOpen(false)}
                              >
                                <div className={`w-2 h-2 rounded-full ${
                                  location.pathname === subItem.path 
                                    ? "bg-white" 
                                    : "bg-amber-400/50"
                                }`}></div>
                                <span>{subItem.label}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <Link
                      to={item.path}
                      className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all ${
                        location.pathname === item.path
                          ? "bg-gradient-to-r from-amber-500/30 to-transparent border-l-4 border-amber-500"
                          : "text-blue-300 hover:text-white hover:bg-blue-800/30"
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon size={20} className="flex-shrink-0" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* System Status & Footer */}
          <div className="p-4 border-t border-blue-800/30 space-y-4">
            {/* System Status */}
          

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center justify-center space-x-3 px-4 py-2.5 w-full rounded-lg text-blue-300 hover:bg-red-500/20 hover:text-red-300 transition-all border border-blue-800/50 hover:border-red-500/30 group"
            >
              <LogOut size={20} className="group-hover:animate-pulse" />
              <span className="text-sm font-medium">Logout</span>
            </button>

            {/* Copyright */}
            <div className="text-center">
              <p className="text-xs text-blue-400/70">© <span>{new Date().getFullYear()}</span> Injibara University</p>
              <p className="text-xs text-blue-400/50 mt-1">All rights reserved</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64 pt-16 lg:pt-16 min-h-screen">
        <div className="p-4 md:p-6">
          {/* Dashboard Stats Section */}
          {location.pathname === "/dashboard" && (
            <>
              {/* Welcome Header */}
              {/* <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋
                </h1>
                <p className="text-gray-600 mt-2">
                  Here's what's happening with your workload and payments today.
                </p>
              </div> */}

              {/* Stats Grid */}
              {/* <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {dashboardStats.map((stat, index) => (
                  <div 
                    key={index} 
                    className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                        <div className="flex items-center mt-2">
                          <span className={`text-xs font-medium ${
                            stat.changeType === 'positive' ? 'text-green-600' :
                            stat.changeType === 'negative' ? 'text-red-600' : 'text-amber-600'
                          }`}>
                            {stat.change}
                          </span>
                          <span className="text-xs text-gray-500 ml-2">{stat.description}</span>
                        </div>
                      </div>
                      <div className={`p-3 ${stat.bgColor} rounded-lg`}>
                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            stat.changeType === 'positive' ? 'bg-green-500' :
                            stat.changeType === 'negative' ? 'bg-red-500' : 'bg-amber-500'
                          }`}
                          style={{ width: stat.title.includes('Level') ? `${stat.value}` : '70%' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div> */}

              {/* Quick Actions */}
              {/* <div className="mb-8 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Link
                    to="/workload"
                    className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <FolderOpen className="h-5 w-5 text-blue-600" />
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                    </div>
                    <p className="font-medium text-gray-900">View Workload</p>
                    <p className="text-sm text-gray-500">Check assignments</p>
                  </Link>
                  <Link
                    to="/payments/sheets"
                    className="bg-white rounded-lg p-4 border border-gray-200 hover:border-green-300 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <DollarSign className="h-5 w-5 text-green-600" />
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-green-600" />
                    </div>
                    <p className="font-medium text-gray-900">Payment Sheets</p>
                    <p className="text-sm text-gray-500">View payments</p>
                  </Link>
                  <Link
                    to="/course-requests/create"
                    className="bg-white rounded-lg p-4 border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 bg-purple-50 rounded-lg">
                        <BookOpen className="h-5 w-5 text-purple-600" />
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600" />
                    </div>
                    <p className="font-medium text-gray-900">Request Course</p>
                    <p className="text-sm text-gray-500">Add new course</p>
                  </Link>
                  <Link
                    to="/profile/edit"
                    className="bg-white rounded-lg p-4 border border-gray-200 hover:border-amber-300 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 bg-amber-50 rounded-lg">
                        <UserCircle className="h-5 w-5 text-amber-600" />
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-amber-600" />
                    </div>
                    <p className="font-medium text-gray-900">Update Profile</p>
                    <p className="text-sm text-gray-500">Edit information</p>
                  </Link>
                </div>
              </div> */}
            </>
          )}
          
          {/* Page Content */}
          <Outlet />
        </div>

        {/* Footer */}
        <footer className="mt-8 px-6 py-4 bg-[#234A6B] text-white border-t border-white/10">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="text-sm">
              <span className="font-semibold">Injibara University</span>
              <span className="mx-2">•</span>
              <span>Staff Workload Management System</span>
              <span className="mx-2">•</span>
              <span className="text-blue-300 capitalize">
                {user?.role?.replace("_", " ")} Interface
              </span>
            </div>
            <div className="mt-2 md:mt-0 text-xs text-blue-300">
              <div className="flex items-center space-x-4">
                <span>© {new Date().getFullYear()} All rights reserved</span>
                <span className="text-blue-400">v3.2.1</span>
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></div>
                  System Online
                </span>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default MainLayout;

// // src/components/layout/MainLayout.jsx
// import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
// import { useAuth } from "../../contexts/AuthContext";
// import {
//   Home,
//   Users,
//   BookOpen,
//   FileText,
//   DollarSign,
//   Settings,
//   LogOut,
//   Menu,
//   X,
//   BarChart3,
//   Bell,
//   UserCircle,
//   Shield,
//   ClipboardCheck,
//   ChevronRight,
//   ChevronLeft,
//   Building,
//   GraduationCap,
//   Calendar,
//   Award,
//   PieChart,
//   TrendingUp,
//   Database,
//   CreditCard,
//   School,
//   Library,
//   Layers,
//   History,
//   ShieldCheck,
//   UserPlus,
//   CheckSquare,
//   Calculator,
//   FileSpreadsheet,
//   Receipt,
//   LineChart,
//   Briefcase,
//   FolderOpen,
//   AlertCircle,
//   ChartBar,
//   ClipboardList,
//   Book,
//   FileBarChart,
//   Workflow,
//   CalendarDays,
//   Building2,
//   Target,
//   Cpu,
//   Zap,
//   Activity,
//   Search,
//   Filter,
//   Upload,
//   Download,
//   Eye,
//   Edit,
//   Lock,
//   Key,
//   Grid,
//   Server,
//   HardDrive,
//   Network,
//   Cloud,
//   Database as DatabaseIcon,
//   FolderTree,
//   GitBranch,
//   Clock,
//   Mail,
//   HelpCircle,
//   File,
//   UserCheck,
//   CheckCircle,
//   XCircle,
//   TrendingDown,
//   PieChart as PieChartIcon,
//   BarChart2,
//   DownloadCloud,
//   UploadCloud,
//   RefreshCw,
//   MoreVertical,
//   ChevronDown,
//   Star,
//   Target as TargetIcon,
//   Zap as ZapIcon,
//   AlertTriangle,
//   Check,
//   Plus,
//   Minus,
//   EyeOff,
//   Eye as EyeIcon,
//   BellRing,
//   Inbox,
//   MessageSquare,
//   Phone,
//   Video,
//   MapPin,
//   Globe,
//   Shield as ShieldIcon,
//   Users as UsersIcon,
//   Briefcase as BriefcaseIcon,
//   School as SchoolIcon,
//   DollarSign as DollarSignIcon,
//   Calendar as CalendarIcon
// } from "lucide-react";
// import { useState, useEffect, useRef } from "react";
// import toast from "react-hot-toast";

// const MainLayout = () => {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
//   const [activeSubmenu, setActiveSubmenu] = useState(null);
//   const [currentTime, setCurrentTime] = useState(new Date());
//   const [searchQuery, setSearchQuery] = useState("");
//   const [showNotifications, setShowNotifications] = useState(false);
//   const [showProfileMenu, setShowProfileMenu] = useState(false);
//   const [unreadNotifications, setUnreadNotifications] = useState(3);
//   const [notifications, setNotifications] = useState([
//     {
//       id: 1,
//       title: "New Workload Assignment",
//       message: "You have been assigned 3 new courses for Spring 2024",
//       time: "10 minutes ago",
//       unread: true,
//       type: "workload",
//       icon: ClipboardCheck,
//       color: "text-blue-600",
//       bgColor: "bg-blue-50"
//     },
//     {
//       id: 2,
//       title: "Payment Processed",
//       message: "Your payment for October 2024 has been successfully processed",
//       time: "2 hours ago",
//       unread: true,
//       type: "payment",
//       icon: DollarSign,
//       color: "text-green-600",
//       bgColor: "bg-green-50"
//     },
//     {
//       id: 3,
//       title: "System Maintenance",
//       message: "Scheduled maintenance this Friday from 10 PM to 2 AM",
//       time: "1 day ago",
//       unread: false,
//       type: "system",
//       icon: Server,
//       color: "text-amber-600",
//       bgColor: "bg-amber-50"
//     },
//     {
//       id: 4,
//       title: "Overload Alert",
//       message: "You are approaching your maximum workload limit",
//       time: "2 days ago",
//       unread: false,
//       type: "alert",
//       icon: AlertCircle,
//       color: "text-red-600",
//       bgColor: "bg-red-50"
//     },
//     {
//       id: 5,
//       title: "Course Request Approved",
//       message: "Your request for 'Advanced Programming' has been approved",
//       time: "3 days ago",
//       unread: false,
//       type: "academic",
//       icon: CheckCircle,
//       color: "text-emerald-600",
//       bgColor: "bg-emerald-50"
//     }
//   ]);
  
//   const [userStats, setUserStats] = useState({
//     workloadHours: 42,
//     pendingApprovals: 3,
//     paymentAmount: 2840,
//     overloadLevel: 85,
//     coursesAssigned: 5,
//     students: 150,
//     completionRate: 92
//   });

//   // Refs for click outside detection
//   const notificationsRef = useRef(null);
//   const profileRef = useRef(null);
//   const searchRef = useRef(null);
//   const sidebarRef = useRef(null);

//   // Format date and time
//   const formattedDate = currentTime.toLocaleDateString('en-US', {
//     weekday: 'long',
//     year: 'numeric',
//     month: 'long',
//     day: 'numeric'
//   });

//   const formattedTime = currentTime.toLocaleTimeString('en-US', {
//     hour12: true,
//     hour: '2-digit',
//     minute: '2-digit'
//   });

//   // Update time every minute
//   useEffect(() => {
//     const timer = setInterval(() => {
//       setCurrentTime(new Date());
//     }, 60000); // Update every minute
//     return () => clearInterval(timer);
//   }, []);

//   // Handle click outside notifications and profile dropdowns
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
//         setShowNotifications(false);
//       }
//       if (profileRef.current && !profileRef.current.contains(event.target)) {
//         setShowProfileMenu(false);
//       }
//       if (sidebarRef.current && !sidebarRef.current.contains(event.target) && sidebarOpen) {
//         if (window.innerWidth < 1024) {
//           setSidebarOpen(false);
//         }
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, [sidebarOpen]);

//   // Close submenu when sidebar is collapsed
//   useEffect(() => {
//     if (sidebarCollapsed && activeSubmenu) {
//       setActiveSubmenu(null);
//     }
//   }, [sidebarCollapsed]);

//   const handleLogout = async () => {
//     try {
//       await logout();
//       toast.success("Logged out successfully");
//       navigate("/login");
//     } catch (error) {
//       toast.error("Logout failed");
//     }
//   };

//   const handleSearch = (e) => {
//     e.preventDefault();
//     if (searchQuery.trim()) {
//       toast.success(`Searching for "${searchQuery}"`);
//       // Implement actual search logic here
//       setSearchQuery("");
//     }
//   };

//   const markNotificationAsRead = (id) => {
//     setNotifications(notifications.map(notif => 
//       notif.id === id ? { ...notif, unread: false } : notif
//     ));
//     setUnreadNotifications(prev => Math.max(0, prev - 1));
//     toast.success("Notification marked as read");
//   };

//   const markAllAsRead = () => {
//     setNotifications(notifications.map(notif => ({ ...notif, unread: false })));
//     setUnreadNotifications(0);
//     toast.success("All notifications marked as read");
//   };

//   const clearNotification = (id) => {
//     setNotifications(notifications.filter(notif => notif.id !== id));
//     toast.success("Notification cleared");
//   };

//   const clearAllNotifications = () => {
//     setNotifications([]);
//     setUnreadNotifications(0);
//     toast.success("All notifications cleared");
//   };

//   const handleQuickAction = (action) => {
//     switch(action) {
//       case 'upload':
//         toast.success("Opening file upload...");
//         // Implement upload logic
//         break;
//       case 'export':
//         toast.success("Exporting data...");
//         // Implement export logic
//         break;
//       case 'refresh':
//         toast.success("Refreshing data...");
//         // Implement refresh logic
//         break;
//       default:
//         break;
//     }
//   };

//   // Toggle sidebar collapse for desktop
//   const toggleSidebarCollapse = () => {
//     setSidebarCollapsed(!sidebarCollapsed);
//   };

//   // Get role-based navigation based on BACKEND ROUTES
//   const getRoleNavigation = () => {
//     const role = user?.role || "instructor";

//     // COMMON ITEMS FOR ALL ROLES
//     const commonItems = [
//       {
//         icon: Home,
//         label: "Dashboard",
//         path: "/dashboard",
//         isDashboard: true,
//       },
//       {
//         icon: UserCircle,
//         label: "My Profile",
//         path: "/profile",
//         submenu: [
//           { label: "View Profile", path: "/profile" },
//           { label: "Edit Profile", path: "/profile/edit" },
//           { label: "Change Password", path: "/profile/change-password" },
//         ],
//       },
//     ];

//     // ========== ADMIN (Full System Access) ==========
//     const adminItems = [
//       {
//         icon: Users,
//         label: "User Management",
//         path: "/admin/users",
//         submenu: [
//           { label: "All Users", path: "/admin/users" },
//           { label: "Create User", path: "/admin/users/create" },
//           { label: "Reset Password", path: "/admin/users/reset-password" },
//           // { label: "Deactivate Users", path: "/admin/users/deactivate" },
//         ],
//       },
//       {
//         icon: UserPlus,
//         label: "Role Registration",
//         path: "/role-registration",
//         submenu: [
//           {
//             label: "Create Executives",
//             path: "/role-registration/admin/create-executives",
//           },
//           {
//             label: "Admin Creatable Roles",
//             path: "/role-registration/admin/creatable-roles",
//           },
//           {
//             label: "My Created Users",
//             path: "/role-registration/my-created-users",
//           },
//         ],
//       },
//       {
//         icon: Building2,
//         label: "Academic Structure",
//         path: "/academic",
//         submenu: [
//           { label: "Colleges", path: "/academic/colleges" },
//           { label: "Departments", path: "/academic/departments" },
//           { label: "Programs", path: "/academic/programs" },
//           { label: "Courses", path: "/academic/courses" },
//           { label: "Sections", path: "/academic/sections" },
//         ],
//       },
//       {
//         icon: CalendarDays,
//         label: "Academic Timeline",
//         path: "/academic-timeline",
//         submenu: [
//           { label: "Academic Years", path: "/academic/years" },
//           { label: "Semesters", path: "/academic/semesters" },
//           { label: "Active Academic Year", path: "/academic/years/active" },
//           { label: "Current Semester", path: "/academic/semesters/current" },
//         ],
//       },
//       {
//         icon: Shield,
//         label: "System Rules",
//         path: "/system/rules",
//         submenu: [
//           { label: "All Rules", path: "/system/rules" },
//           { label: "Create Rule", path: "/system/rules/create" },
//           { label: "Rate Tables", path: "/system/rules/rate-tables" },
//           { label: "Tax Rules", path: "/system/rules/tax-rules" },
//           { label: "Clear Cache", path: "/system/rules/cache" },
//         ],
//       },
//       {
//         icon: CreditCard,
//         label: "Financial System",
//         path: "/finance",
//         submenu: [
//           { label: "Payment Sheets", path: "/finance/sheets" },
//           { label: "Payment Processing", path: "/finance/process" },
//           { label: "Payment Statistics", path: "/finance/statistics" },
//           { label: "Bulk Update", path: "/finance/bulk-update" },
//           { label: "Export Sheets", path: "/finance/export" },
//         ],
//       },
//       {
//         icon: Activity,
//         label: "Monitoring",
//         path: "/monitoring",
//         submenu: [
//           { label: "Overload Detection", path: "/monitoring/overload" },
//           {
//             label: "Department Overload",
//             path: "/monitoring/department-overload",
//           },
//           { label: "Overload Alerts", path: "/monitoring/alerts" },
//           { label: "Trend Prediction", path: "/monitoring/trends" },
//           { label: "Overload Reports", path: "/monitoring/reports" },
//         ],
//       },
//       {
//         icon: ChartBar,
//         label: "Reports & Analytics",
//         path: "/reports",
//         submenu: [
//           { label: "Academic Reports", path: "/reports/academic" },
//           { label: "Workload Reports", path: "/reports/workload" },
//           { label: "Financial Reports", path: "/reports/financial" },
//           { label: "Staff Reports", path: "/reports/staff" },
//           { label: "Department Reports", path: "/reports/department" },
//           { label: "College Reports", path: "/reports/college" },
//           { label: "Overload Reports", path: "/reports/overload" },
//         ],
//       },
//     ];

//     // ========== INSTRUCTOR ==========
//     const instructorItems = [
//       {
//         icon: FolderOpen,
//         label: "My Workload",
//         path: "/workload",
//         submenu: [
//           { label: "Workload Dashboard", path: "/workload" },
//           { label: "My Assignments", path: "/workload/assignments" },
//           { label: "Accept/Decline", path: "/workload/assignments/approve" },
//           { label: "Regular Program", path: "/workload/rp" },
//           { label: "NRP Workload", path: "/workload/nrp" },
//           { label: "Workload Summary", path: "/workload/summary" },
//         ],
//       },
//       {
//         icon: Receipt,
//         label: "My Payments",
//         path: "/payments",
//         submenu: [
//           { label: "Payment Sheets", path: "/payments/sheets" },
//           { label: "Payment History", path: "/payments/history" },
//         ],
//       },
//       {
//         icon: AlertCircle,
//         label: "Overload Status",
//         path: "/overload",
//         submenu: [
//           { label: "Check My Overload", path: "/overload/check" },
//           { label: "Overload Report", path: "/overload/report" },
//         ],
//       },
//       {
//         icon: BookOpen,
//         label: "Course Requests",
//         path: "/course-requests",
//         submenu: [
//           { label: "Create Request", path: "/course-requests/create" },
//           { label: "My Requests", path: "/course-requests/my" },
//           { label: "Available Courses", path: "/course-requests/available" },
//         ],
//       },
//     ];
//     // ========== DEPARTMENT HEAD ==========
//     const departmentHeadItems = [
//       // {
//       //   icon: Building,
//       //   label: "Department",
//       //   path: "/department",
//       //   submenu: [
//       //     { label: "Department Dashboard", path: "/department" },
//       //     { label: "Department Staff", path: "/department/staff" },
//       //     { label: "Department Statistics", path: "/department/stats" },
//       //   ],
//       // },
//       {
//         icon: FolderOpen,
//         label: "Workload Management",
//         path: "/workload/dept",
//         submenu: [
//           { label: "Course Assignments", path: "/workload/dept/assignments" },
//           {
//             label: "Program Structure",
//             path: "/workload/dept/program-structure",
//           },
//           {
//             label: "Staff Availability",
//             path: "/workload/dept/availability",
//           },
//           { label: "Bulk Assignments", path: "/workload/dept/bulk" },
//           { label: "Assignment Overview", path: "/workload/dept/overview" },
//           {
//             label: "Year Level Assignments",
//             path: "/workload/dept/year-levels",
//           },
//         ],
//       },
//       {
//         icon: ClipboardCheck,
//         label: "Approvals",
//         path: "/approvals",
//         submenu: [
//           { label: "Course Requests", path: "/approvals/course-requests" },
//           { label: "Pending Requests", path: "/approvals/pending" },
//           { label: "Workload Approvals", path: "/approvals/workload" },
//         ],
//       },
//       {
//         icon: Target,
//         label: "Overload Control",
//         path: "/overload/dept",
//         submenu: [
//           { label: "Department Overload", path: "/overload/dept" },
//           { label: "Overload Alerts", path: "/overload/dept/alerts" },
//           { label: "Staff Overload Check", path: "/overload/dept/staff" },
//         ],
//       },
//     ];

//     // ========== DEAN ==========
//     const deanItems = [
//       {
//         icon: Building2,
//         label: "College Management",
//         path: "/college",
//         submenu: [
//           { label: "College Dashboard", path: "/college" },
//           { label: "Departments", path: "/college/departments" },
//           { label: "College Statistics", path: "/college/stats" },
//           { label: "Assign Dean", path: "/college/assign-dean" },
//         ],
//       },
//       {
//         icon: UserPlus,
//         label: "Role Registration",
//         path: "/role-registration/dean",
//         submenu: [
//           {
//             label: "Create Department Heads",
//             path: "/role-registration/dean/create-department-heads",
//           },
//         ],
//       },
//       {
//         icon: Eye,
//         label: "College Oversight",
//         path: "/oversight",
//         submenu: [
//           { label: "Workload Approval", path: "/oversight/workload" },
//           { label: "Overload Monitoring", path: "/oversight/overload" },
//           { label: "Department Review", path: "/oversight/departments" },
//         ],
//       },
//     ];

//     // ========== REGISTRAR ==========
//     const registrarItems = [
//       {
//         icon: BookOpen,
//         label: "Academic Records",
//         path: "/academic/records",
//         submenu: [
//           { label: "Academic Years", path: "/academic/years" },
//           { label: "Semesters", path: "/academic/semesters" },
//           { label: "Programs", path: "/academic/programs" },
//           { label: "Courses", path: "/academic/courses" },
//           { label: "Sections", path: "/academic/sections" },
//         ],
//       },
//       {
//         icon: ClipboardList,
//         label: "Registration",
//         path: "/registrar",
//         submenu: [
//           { label: "Course Management", path: "/registrar/courses" },
//           { label: "Section Management", path: "/registrar/sections" },
//           { label: "Program Management", path: "/registrar/programs" },
//         ],
//       },
//     ];

//     // ========== HR DIRECTOR ==========
//     const hrDirectorItems = [
//       {
//         icon: Users,
//         label: "HR Management",
//         path: "/hr",
//         submenu: [
//           { label: "Staff Directory", path: "/hr/staff" },
//           {
//             label: "Create Instructor",
//             path: "/role-registration/hr/create-instructors",
//           },
//           { label: "Activate/Deactivate", path: "/hr/activation" },
//           { label: "Update Staff Rank", path: "/hr/rank" },
//           { label: "Assign to Department", path: "/hr/assign-dept" },
//         ],
//       },
//       {
//         icon: ShieldCheck,
//         label: "HR Approvals",
//         path: "/approvals/hr",
//         submenu: [
//           { label: "Workload Approvals", path: "/approvals/hr/workload" },
//           { label: "Staff Approvals", path: "/approvals/hr/staff" },
//         ],
//       },
//       {
//         icon: ChartBar,
//         label: "HR Reports",
//         path: "/reports/hr",
//         submenu: [
//           { label: "Staff Statistics", path: "/reports/hr/staff" },
//           { label: "Workload Analysis", path: "/reports/hr/workload" },
//           { label: "Rank Distribution", path: "/reports/hr/ranks" },
//         ],
//       },
//     ];

//     // ========== FINANCE ==========
//     const financeItems = [
//       {
//         icon: CreditCard,
//         label: "Payment Processing",
//         path: "/finance/process",
//         submenu: [
//           { label: "Payment Sheets", path: "/finance/process/sheets" },
//           { label: "Payment Status", path: "/finance/process/status" },
//           { label: "Bulk Update", path: "/finance/process/bulk" },
//           { label: "Export Sheets", path: "/finance/process/export" },
//         ],
//       },
//       {
//         icon: Calculator,
//         label: "Rules & Rates",
//         path: "/rules",
//         submenu: [
//           { label: "All Rules", path: "/rules" },
//           { label: "Create Rule", path: "/rules/create" },
//           { label: "Payment Rates", path: "/rules/rates" },
//           { label: "Tax Rules", path: "/rules/tax" },
//         ],
//       },
//       {
//         icon: DollarSign,
//         label: "Financial Oversight",
//         path: "/finance/oversight",
//         submenu: [
//           { label: "Payment Statistics", path: "/finance/oversight/stats" },
//           { label: "Payment Reports", path: "/finance/oversight/reports" },
//         ],
//       },
//     ];

//     // ========== VPAA ==========
//     const vpaaItems = [
//       {
//         icon: UserPlus,
//         label: "Role Registration",
//         path: "/role-registration/vpaa",
//         submenu: [
//           {
//             label: "Create Deans & Registrar",
//             path: "/role-registration/vpaa/create-deans-registrar",
//           },
//         ],
//       },
//       {
//         icon: CheckSquare,
//         label: "Academic Approvals",
//         path: "/vpaa/approvals",
//         submenu: [
//           { label: "Workload Approvals", path: "/vpaa/approvals/workload" },
//         ],
//       },
//     ];

//     // ========== VPAF ==========
//     const vpafItems = [
//       {
//         icon: DollarSign,
//         label: "Financial Oversight",
//         path: "/vpaf",
//         submenu: [
//           { label: "Payment Approval", path: "/vpaf/approvals" },
//           { label: "Financial Reports", path: "/vpaf/reports" },
//         ],
//       },
//     ];

//     // ========== CDE DIRECTOR ==========
//     const cdeDirectorItems = [
//       {
//         icon: School,
//         label: "CDE Management",
//         path: "/cde",
//         submenu: [
//           { label: "CDE Workload", path: "/cde/workload" },
//           { label: "CDE Payments", path: "/cde/payments" },
//         ],
//       },
//     ];

//     // ========== COMBINE BASED ON ROLE ==========
//     switch (role) {
//       case "admin":
//         return [...commonItems, ...adminItems];
//       case "instructor":
//         return [...commonItems, ...instructorItems];
//       case "department_head":
//         return [...commonItems, ...departmentHeadItems];
//       case "dean":
//         return [...commonItems, ...deanItems];
//       case "registrar":
//         return [...commonItems, ...registrarItems];
//       case "hr_director":
//         return [...commonItems, ...hrDirectorItems];
//       case "finance":
//         return [...commonItems, ...financeItems];
//       case "vpaf":
//         return [...commonItems, ...vpafItems];
//       case "vpaa":
//         return [...commonItems, ...vpaaItems];
//       case "cde_director":
//         return [...commonItems, ...cdeDirectorItems];
//       default:
//         return [...commonItems, ...instructorItems];
//     }
//   };

//   const navigationItems = getRoleNavigation();

//   // Get breadcrumbs from current path
//   const getBreadcrumbs = () => {
//     const paths = location.pathname.split('/').filter(p => p);
//     const breadcrumbs = [{ label: 'Home', path: '/dashboard', icon: Home }];
    
//     let currentPath = '';
//     paths.forEach((path, index) => {
//       currentPath += `/${path}`;
//       const navItem = navigationItems.find(item => 
//         item.path === currentPath || 
//         (item.submenu && item.submenu.some(sub => sub.path === currentPath))
//       );
      
//       if (navItem) {
//         if (navItem.submenu) {
//           const subItem = navItem.submenu.find(sub => sub.path === currentPath);
//           if (subItem) {
//             breadcrumbs.push({ 
//               label: subItem.label, 
//               path: currentPath,
//               icon: navItem.icon 
//             });
//           }
//         } else {
//           breadcrumbs.push({ 
//             label: navItem.label, 
//             path: currentPath,
//             icon: navItem.icon 
//           });
//         }
//       } else if (path !== 'dashboard') {
//         // Fallback for unknown paths
//         breadcrumbs.push({ 
//           label: path.split('-').map(word => 
//             word.charAt(0).toUpperCase() + word.slice(1)
//           ).join(' '), 
//           path: currentPath,
//           icon: File 
//         });
//       }
//     });
    
//     return breadcrumbs;
//   };

//   // Get role-specific dashboard stats
//   const getDashboardStats = () => {
//     const role = user?.role || "instructor";
//     const baseStats = [
//       {
//         title: "Workload Hours",
//         value: userStats.workloadHours,
//         change: "+5%",
//         changeType: "positive",
//         icon: Clock,
//         color: "text-blue-600",
//         bgColor: "bg-blue-50",
//         description: "Current weekly hours"
//       },
//       {
//         title: "Pending Approvals",
//         value: userStats.pendingApprovals,
//         change: "Requires attention",
//         changeType: "warning",
//         icon: AlertCircle,
//         color: "text-amber-600",
//         bgColor: "bg-amber-50",
//         description: "Waiting for review"
//       },
//       {
//         title: "Payment Amount",
//         value: `$${userStats.paymentAmount}`,
//         change: "+12%",
//         changeType: "positive",
//         icon: DollarSign,
//         color: "text-green-600",
//         bgColor: "bg-green-50",
//         description: "This month's payment"
//       },
//       {
//         title: "Overload Level",
//         value: `${userStats.overloadLevel}%`,
//         change: "Approaching limit",
//         changeType: "negative",
//         icon: Activity,
//         color: "text-red-600",
//         bgColor: "bg-red-50",
//         description: "Current capacity"
//       }
//     ];

//     // Role-specific adjustments
//     switch(role) {
//       case "admin":
//         baseStats[0] = {
//           title: "Total Users",
//           value: 1452,
//           change: "+8%",
//           changeType: "positive",
//           icon: Users,
//           color: "text-purple-600",
//           bgColor: "bg-purple-50",
//           description: "Active system users"
//         };
//         baseStats[1] = {
//           title: "Active Departments",
//           value: 28,
//           change: "+2",
//           changeType: "positive",
//           icon: Building,
//           color: "text-cyan-600",
//           bgColor: "bg-cyan-50",
//           description: "Departments this semester"
//         };
//         break;
//       case "department_head":
//         baseStats[0] = {
//           title: "Department Staff",
//           value: 42,
//           change: "+3",
//           changeType: "positive",
//           icon: Users,
//           color: "text-indigo-600",
//           bgColor: "bg-indigo-50",
//           description: "Active department members"
//         };
//         baseStats[1] = {
//           title: "Courses Assigned",
//           value: 156,
//           change: "+12",
//           changeType: "positive",
//           icon: BookOpen,
//           color: "text-emerald-600",
//           bgColor: "bg-emerald-50",
//           description: "This semester"
//         };
//         break;
//       case "dean":
//         baseStats[0] = {
//           title: "College Departments",
//           value: 8,
//           change: "+1",
//           changeType: "positive",
//           icon: Building2,
//           color: "text-teal-600",
//           bgColor: "bg-teal-50",
//           description: "Under management"
//         };
//         baseStats[1] = {
//           title: "Total Faculty",
//           value: 245,
//           change: "+15",
//           changeType: "positive",
//           icon: GraduationCap,
//           color: "text-amber-600",
//           bgColor: "bg-amber-50",
//           description: "College-wide"
//         };
//         break;
//     }

//     return baseStats;
//   };

//   const dashboardStats = getDashboardStats();

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
//       {/* Professional Header */}
//       <header className={`fixed top-0 left-0 right-0 ${
//         sidebarCollapsed ? "lg:left-20" : "lg:left-64"
//       } h-16 bg-[#234A6B] border-b border-white/10 z-50 transition-all duration-300`}>
//         <div className="h-full px-4 lg:px-6 flex items-center justify-between">
//           {/* Left Section */}
//           <div className="flex items-center space-x-4">
//             {/* Mobile Menu Button */}
//             <button
//               onClick={() => setSidebarOpen(!sidebarOpen)}
//               className="lg:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
//             >
//               {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
//             </button>

//             {/* Desktop Collapse Button */}
//             <button
//               onClick={toggleSidebarCollapse}
//               className="hidden lg:flex items-center justify-center w-10 h-10 rounded-lg bg-blue-800/50 hover:bg-blue-700/50 transition-colors text-white"
//               title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
//             >
//               {sidebarCollapsed ? (
//                 <ChevronRight className="h-5 w-5" />
//               ) : (
//                 <ChevronLeft className="h-5 w-5" />
//               )}
//             </button>

//             {/* Breadcrumb */}
//             <div className="hidden lg:flex items-center space-x-2 text-sm">
//               {getBreadcrumbs().map((crumb, index) => (
//                 <div key={index} className="flex items-center">
//                   {index > 0 && <ChevronRight className="h-4 w-4 text-blue-300 mx-2" />}
//                   <Link
//                     to={crumb.path}
//                     className={`flex items-center space-x-2 ${
//                       index === getBreadcrumbs().length - 1
//                         ? "text-white font-semibold"
//                         : "text-blue-200 hover:text-white"
//                     }`}
//                   >
//                     {index === 0 && <crumb.icon className="h-4 w-4" />}
//                     <span>{crumb.label}</span>
//                   </Link>
//                 </div>
//               ))}
//             </div>

//             {/* Search Bar */}
//             <div className="hidden lg:block relative" ref={searchRef}>
//               <form onSubmit={handleSearch} className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-300" />
//                 <input
//                   type="text"
//                   placeholder="Search modules, users, or reports..."
//                   className="pl-10 pr-10 py-2 w-80 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-transparent transition-all"
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                 />
//                 {searchQuery && (
//                   <button
//                     type="button"
//                     onClick={() => setSearchQuery("")}
//                     className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-300 hover:text-white"
//                   >
//                     <X size={14} />
//                   </button>
//                 )}
//                 <button
//                   type="submit"
//                   className="absolute right-3 top-1/2 transform -translate-y-1/2 opacity-0 pointer-events-none"
//                 >
//                   <Search size={14} />
//                 </button>
//               </form>
//             </div>
//           </div>

//           {/* Right Section */}
//           <div className="flex items-center space-x-4">
//             {/* Date & Time Display */}
//             <div className="hidden lg:block text-right">
//               <div className="text-xs text-blue-200">{formattedDate}</div>
//               <div className="text-sm font-semibold text-white flex items-center">
//                 <Clock className="h-4 w-4 mr-2" />
//                 {formattedTime}
//               </div>
//             </div>

//             {/* Quick Actions */}
//             <div className="hidden lg:flex items-center space-x-2 border-r border-white/20 pr-4">
//               <button 
//                 onClick={() => handleQuickAction('upload')}
//                 className="p-2 hover:bg-white/10 rounded-lg transition-colors relative group"
//                 title="Upload Files"
//               >
//                 <Upload className="h-5 w-5 text-blue-200" />
//                 <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
//                   Upload Files
//                 </div>
//               </button>
//               <button 
//                 onClick={() => handleQuickAction('export')}
//                 className="p-2 hover:bg-white/10 rounded-lg transition-colors relative group"
//                 title="Export Data"
//               >
//                 <Download className="h-5 w-5 text-blue-200" />
//                 <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
//                   Export Data
//                 </div>
//               </button>
//               <button 
//                 onClick={() => handleQuickAction('refresh')}
//                 className="p-2 hover:bg-white/10 rounded-lg transition-colors relative group"
//                 title="Refresh"
//               >
//                 <RefreshCw className="h-5 w-5 text-blue-200" />
//                 <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
//                   Refresh
//                 </div>
//               </button>
//             </div>

//             {/* Notifications */}
//             <div className="relative" ref={notificationsRef}>
//               <button
//                 onClick={() => {
//                   setShowNotifications(!showNotifications);
//                   setShowProfileMenu(false);
//                 }}
//                 className="p-2 hover:bg-white/10 rounded-lg transition-colors relative"
//               >
//                 <Bell className="h-5 w-5 text-blue-200" />
//                 {unreadNotifications > 0 && (
//                   <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-xs rounded-full flex items-center justify-center text-white font-bold animate-pulse">
//                     {unreadNotifications}
//                   </div>
//                 )}
//               </button>

//               {/* Notifications Dropdown */}
//               {showNotifications && (
//                 <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
//                   <div className="p-4 border-b">
//                     <div className="flex justify-between items-center">
//                       <h3 className="font-semibold text-gray-800">Notifications</h3>
//                       <div className="flex items-center space-x-2">
//                         <button 
//                           onClick={markAllAsRead}
//                           className="text-xs text-blue-600 hover:text-blue-800"
//                         >
//                           Mark all read
//                         </button>
//                         <button 
//                           onClick={clearAllNotifications}
//                           className="text-xs text-red-600 hover:text-red-800"
//                         >
//                           Clear all
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="max-h-96 overflow-y-auto">
//                     {notifications.length > 0 ? (
//                       notifications.map((notif) => (
//                         <div
//                           key={notif.id}
//                           className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${notif.unread ? 'bg-blue-50' : ''}`}
//                           onClick={() => markNotificationAsRead(notif.id)}
//                         >
//                           <div className="flex items-start space-x-3">
//                             <div className={`p-2 rounded-lg ${notif.color} ${notif.bgColor}`}>
//                               <notif.icon className="h-5 w-5" />
//                             </div>
//                             <div className="flex-1 min-w-0">
//                               <div className="flex justify-between items-start">
//                                 <h4 className="font-medium text-gray-900">{notif.title}</h4>
//                                 <div className="flex items-center space-x-2">
//                                   <span className="text-xs text-gray-500">{notif.time}</span>
//                                   <button
//                                     onClick={(e) => {
//                                       e.stopPropagation();
//                                       clearNotification(notif.id);
//                                     }}
//                                     className="text-gray-400 hover:text-red-500"
//                                   >
//                                     <X size={14} />
//                                   </button>
//                                 </div>
//                               </div>
//                               <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
//                               {notif.unread && (
//                                 <div className="flex items-center mt-2">
//                                   <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
//                                   <span className="text-xs text-blue-600">Unread</span>
//                                 </div>
//                               )}
//                             </div>
//                           </div>
//                         </div>
//                       ))
//                     ) : (
//                       <div className="p-8 text-center">
//                         <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
//                         <p className="text-gray-500">No notifications</p>
//                         <p className="text-sm text-gray-400 mt-1">You're all caught up!</p>
//                       </div>
//                     )}
//                   </div>
//                   <div className="p-3 border-t">
//                     <Link
//                       to="/notifications"
//                       className="block text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
//                       onClick={() => setShowNotifications(false)}
//                     >
//                       View all notifications
//                     </Link>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Profile Menu */}
//             <div className="relative" ref={profileRef}>
//               <button
//                 onClick={() => {
//                   setShowProfileMenu(!showProfileMenu);
//                   setShowNotifications(false);
//                 }}
//                 className="flex items-center space-x-3 p-2 hover:bg-white/10 rounded-lg transition-colors"
//               >
//                 <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
//                   {user?.name?.charAt(0)?.toUpperCase() || "U"}
//                 </div>
//                 <div className="hidden lg:block text-left">
//                   <div className="text-sm font-medium text-white">{user?.name || "User"}</div>
//                   <div className="text-xs text-blue-200 capitalize">
//                     {user?.role?.replace("_", " ") || "Staff"}
//                   </div>
//                 </div>
//                 <ChevronDown className={`h-4 w-4 text-blue-300 transition-transform ${showProfileMenu ? "rotate-180" : ""}`} />
//               </button>

//               {/* Profile Dropdown */}
//               {showProfileMenu && (
//                 <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50 py-1">
//                   <div className="px-4 py-3 border-b">
//                     <div className="text-sm font-semibold text-gray-900">{user?.name}</div>
//                     <div className="text-xs text-gray-500 truncate">{user?.email || "user@university.edu"}</div>
//                     <div className="mt-1">
//                       <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
//                         {user?.role?.replace("_", " ") || "Staff"}
//                       </span>
//                     </div>
//                   </div>
//                   <div className="py-1">
//                     <Link
//                       to="/profile"
//                       className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
//                       onClick={() => setShowProfileMenu(false)}
//                     >
//                       <UserCircle className="h-4 w-4 mr-3 text-gray-500" />
//                       My Profile
//                     </Link>
//                     <Link
//                       to="/settings"
//                       className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
//                       onClick={() => setShowProfileMenu(false)}
//                     >
//                       <Settings className="h-4 w-4 mr-3 text-gray-500" />
//                       Settings
//                     </Link>
//                     <Link
//                       to="/help"
//                       className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
//                       onClick={() => setShowProfileMenu(false)}
//                     >
//                       <HelpCircle className="h-4 w-4 mr-3 text-gray-500" />
//                       Help & Support
//                     </Link>
//                     <div className="border-t my-1"></div>
//                     <button
//                       onClick={() => {
//                         setShowProfileMenu(false);
//                         handleLogout();
//                       }}
//                       className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
//                     >
//                       <LogOut className="h-4 w-4 mr-3" />
//                       Logout
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>

//           </div>
//         </div>
//       </header>

//       {/* Sidebar */}
//       <div
//         ref={sidebarRef}
//         className={`fixed inset-y-0 left-0 z-40 bg-gradient-to-b from-[#234A6B] via-[#1a3a57] to-[#234A6B] backdrop-blur-lg border-r border-blue-800/30 transform ${
//           sidebarOpen ? "translate-x-0" : "-translate-x-full"
//         } ${
//           sidebarCollapsed ? "lg:w-20" : "lg:w-64"
//         } lg:translate-x-0 transition-all duration-300 ease-in-out overflow-y-auto`}
//       >
//         <div className="h-full flex flex-col">
//           {/* University Header */}
//           <div className="p-6 border-b border-blue-800/30">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center space-x-3">
//                 <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
//                   <GraduationCap className="h-7 w-7 text-white" />
//                 </div>
//                 {!sidebarCollapsed && (
//                   <div>
//                     <h1 className="text-xl font-bold text-white">INJIBARA</h1>
//                     <p className="text-xs text-blue-300">University SWOMS</p>
//                     <p className="text-xs text-amber-400 mt-1 capitalize">
//                       {user?.role?.replace("_", " ") || "Staff"} Portal
//                     </p>
//                   </div>
//                 )}
//               </div>
              
//               {/* Sidebar Collapse Button */}
//               {/* <button
//                 onClick={toggleSidebarCollapse}
//                 className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg bg-blue-800/50 hover:bg-blue-700/50 transition-colors text-white"
//                 title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
//               >
//                 {sidebarCollapsed ? (
//                   <ChevronRight className="h-4 w-4" />
//                 ) : (
//                   <ChevronLeft className="h-4 w-4" />
//                 )}
//               </button> */}
//             </div>
            
//             {/* Show university name when collapsed */}
//             {sidebarCollapsed && (
//               <div className="mt-4 text-center">
//                 <p className="text-xs font-bold text-white truncate">IU</p>
//                 <p className="text-[10px] text-blue-300 truncate">SWOMS</p>
//               </div>
//             )}
//           </div>

//           {/* Navigation */}
//           <nav className="flex-1 p-4 overflow-y-auto">
//             <ul className="space-y-1">
//               {navigationItems.map((item) => (
//                 <li key={item.path}>
//                   {item.submenu && item.submenu.length > 0 ? (
//                     <div className="mb-1 relative">
//                       <button
//                         onClick={() =>
//                           setActiveSubmenu(
//                             activeSubmenu === item.path ? null : item.path
//                           )
//                         }
//                         onMouseEnter={() => {
//                           if (sidebarCollapsed && window.innerWidth >= 1024) {
//                             setActiveSubmenu(item.path);
//                           }
//                         }}
//                         onMouseLeave={() => {
//                           if (sidebarCollapsed && window.innerWidth >= 1024 && activeSubmenu === item.path) {
//                             setTimeout(() => {
//                               setActiveSubmenu(null);
//                             }, 300);
//                           }
//                         }}
//                         className={`flex items-center ${
//                           sidebarCollapsed ? "justify-center px-2" : "justify-between w-full px-3"
//                         } py-2.5 rounded-lg transition-all group relative ${
//                           location.pathname.startsWith(item.path)
//                             ? "bg-gradient-to-r from-amber-500/30 to-transparent border-l-4 border-amber-500"
//                             : "text-blue-300 hover:text-white hover:bg-blue-800/30"
//                         }`}
//                       >
//                         <div className="flex items-center space-x-3">
//                           <item.icon size={20} className="flex-shrink-0" />
//                           {!sidebarCollapsed && (
//                             <span className="text-sm font-medium">
//                               {item.label}
//                             </span>
//                           )}
//                         </div>
                        
//                         {/* Submenu indicator - only show when not collapsed */}
//                         {!sidebarCollapsed && (
//                           <ChevronRight
//                             className={`h-4 w-4 transition-transform flex-shrink-0 ${
//                               activeSubmenu === item.path ? "rotate-90" : ""
//                             }`}
//                           />
//                         )}
                        
//                         {/* Tooltip for collapsed state */}
//                         {sidebarCollapsed && (
//                           <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg">
//                             {item.label}
//                             <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-0 border-r-4 border-r-gray-900 border-t-transparent border-b-transparent"></div>
//                           </div>
//                         )}
//                       </button>
                      
//                       {/* Submenu - Show as popup when collapsed */}
//                       {activeSubmenu === item.path && (
//                         <ul className={`${
//                           sidebarCollapsed 
//                             ? "absolute left-full top-0 ml-1 w-48 bg-gradient-to-b from-[#234A6B] via-[#1a3a57] to-[#234A6B] rounded-lg shadow-xl border border-blue-800/30 p-2 z-50"
//                             : "ml-4 mt-1 space-y-1"
//                         }`}>
//                           {item.submenu.map((subItem) => (
//                             <li key={subItem.path}>
//                               <Link
//                                 to={subItem.path}
//                                 className={`flex items-center space-x-3 px-3 py-2.5 text-sm rounded-lg transition-all ${
//                                   location.pathname === subItem.path
//                                     ? "bg-amber-500 text-white font-semibold shadow-sm"
//                                     : "text-blue-300 hover:text-white hover:bg-blue-800/20"
//                                 }`}
//                                 onClick={() => {
//                                   setSidebarOpen(false);
//                                   if (sidebarCollapsed) {
//                                     setActiveSubmenu(null);
//                                   }
//                                 }}
//                               >
//                                 <div className={`w-2 h-2 rounded-full ${
//                                   location.pathname === subItem.path 
//                                     ? "bg-white" 
//                                     : "bg-amber-400/50"
//                                 }`}></div>
//                                 <span>{subItem.label}</span>
//                               </Link>
//                             </li>
//                           ))}
//                         </ul>
//                       )}
//                     </div>
//                   ) : (
//                     <Link
//                       to={item.path}
//                       className={`flex items-center ${
//                         sidebarCollapsed ? "justify-center px-2" : "space-x-3 px-3"
//                       } py-2.5 rounded-lg transition-all group relative ${
//                         location.pathname === item.path
//                           ? "bg-gradient-to-r from-amber-500/30 to-transparent border-l-4 border-amber-500"
//                           : "text-blue-300 hover:text-white hover:bg-blue-800/30"
//                       }`}
//                       onClick={() => {
//                         if (window.innerWidth < 1024) {
//                           setSidebarOpen(false);
//                         }
//                       }}
//                     >
//                       <item.icon size={20} className="flex-shrink-0" />
//                       {!sidebarCollapsed && (
//                         <span className="text-sm font-medium">{item.label}</span>
//                       )}
                      
//                       {/* Tooltip for collapsed state */}
//                       {sidebarCollapsed && (
//                         <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg">
//                           {item.label}
//                           <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-0 border-r-4 border-r-gray-900 border-t-transparent border-b-transparent"></div>
//                         </div>
//                       )}
//                     </Link>
//                   )}
//                 </li>
//               ))}
//             </ul>
//           </nav>

//           {/* System Status & Footer */}
//           <div className="p-4 border-t border-blue-800/30 space-y-4">
//             {/* Logout */}
//             <button
//               onClick={handleLogout}
//               className={`flex items-center ${
//                 sidebarCollapsed ? "justify-center px-2" : "justify-center space-x-3 px-4"
//               } py-2.5 w-full rounded-lg text-blue-300 hover:bg-red-500/20 hover:text-red-300 transition-all border border-blue-800/50 hover:border-red-500/30 group relative`}
//             >
//               <LogOut size={20} className="group-hover:animate-pulse" />
//               {!sidebarCollapsed && (
//                 <span className="text-sm font-medium">Logout</span>
//               )}
              
//               {/* Tooltip for collapsed state */}
//               {sidebarCollapsed && (
//                 <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg">
//                   Logout
//                   <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-0 border-r-4 border-r-gray-900 border-t-transparent border-b-transparent"></div>
//                 </div>
//               )}
//             </button>

//             {/* Copyright - Hide when collapsed */}
//             {!sidebarCollapsed && (
//               <div className="text-center">
//                 <p className="text-xs text-blue-400/70">© <span>{new Date().getFullYear()}</span> Injibara University</p>
//                 <p className="text-xs text-blue-400/50 mt-1">All rights reserved</p>
//               </div>
//             )}
            
//             {/* Mini copyright when collapsed */}
//             {sidebarCollapsed && (
//               <div className="text-center">
//                 <p className="text-[10px] text-blue-400/70">© {new Date().getFullYear()}</p>
//                 <p className="text-[10px] text-blue-400/50">IU</p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Main content */}
//       <div className={`${
//         sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
//       } pt-16 lg:pt-16 min-h-screen transition-all duration-300`}>
//         <div className="p-4 md:p-6">
//           {/* Dashboard Stats Section */}
//           {location.pathname === "/dashboard" && (
//             <>
//               {/* Welcome Header */}
//               {/* <div className="mb-6">
//                 <h1 className="text-2xl font-bold text-gray-900">
//                   Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋
//                 </h1>
//                 <p className="text-gray-600 mt-2">
//                   Here's what's happening with your workload and payments today.
//                 </p>
//               </div> */}

//               {/* Stats Grid */}
//               {/* <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//                 {dashboardStats.map((stat, index) => (
//                   <div 
//                     key={index} 
//                     className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow"
//                   >
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
//                         <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
//                         <div className="flex items-center mt-2">
//                           <span className={`text-xs font-medium ${
//                             stat.changeType === 'positive' ? 'text-green-600' :
//                             stat.changeType === 'negative' ? 'text-red-600' : 'text-amber-600'
//                           }`}>
//                             {stat.change}
//                           </span>
//                           <span className="text-xs text-gray-500 ml-2">{stat.description}</span>
//                         </div>
//                       </div>
//                       <div className={`p-3 ${stat.bgColor} rounded-lg`}>
//                         <stat.icon className={`h-6 w-6 ${stat.color}`} />
//                       </div>
//                     </div>
//                     <div className="mt-4">
//                       <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
//                         <div 
//                           className={`h-full ${
//                             stat.changeType === 'positive' ? 'bg-green-500' :
//                             stat.changeType === 'negative' ? 'bg-red-500' : 'bg-amber-500'
//                           }`}
//                           style={{ width: stat.title.includes('Level') ? `${stat.value}` : '70%' }}
//                         ></div>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div> */}

//               {/* Quick Actions */}
//               {/* <div className="mb-8 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100 p-6">
//                 <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
//                   <Link
//                     to="/workload"
//                     className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group"
//                   >
//                     <div className="flex items-center justify-between mb-2">
//                       <div className="p-2 bg-blue-50 rounded-lg">
//                         <FolderOpen className="h-5 w-5 text-blue-600" />
//                       </div>
//                       <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
//                     </div>
//                     <p className="font-medium text-gray-900">View Workload</p>
//                     <p className="text-sm text-gray-500">Check assignments</p>
//                   </Link>
//                   <Link
//                     to="/payments/sheets"
//                     className="bg-white rounded-lg p-4 border border-gray-200 hover:border-green-300 hover:shadow-md transition-all group"
//                   >
//                     <div className="flex items-center justify-between mb-2">
//                       <div className="p-2 bg-green-50 rounded-lg">
//                         <DollarSign className="h-5 w-5 text-green-600" />
//                       </div>
//                       <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-green-600" />
//                     </div>
//                     <p className="font-medium text-gray-900">Payment Sheets</p>
//                     <p className="text-sm text-gray-500">View payments</p>
//                   </Link>
//                   <Link
//                     to="/course-requests/create"
//                     className="bg-white rounded-lg p-4 border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all group"
//                   >
//                     <div className="flex items-center justify-between mb-2">
//                       <div className="p-2 bg-purple-50 rounded-lg">
//                         <BookOpen className="h-5 w-5 text-purple-600" />
//                       </div>
//                       <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600" />
//                     </div>
//                     <p className="font-medium text-gray-900">Request Course</p>
//                     <p className="text-sm text-gray-500">Add new course</p>
//                   </Link>
//                   <Link
//                     to="/profile/edit"
//                     className="bg-white rounded-lg p-4 border border-gray-200 hover:border-amber-300 hover:shadow-md transition-all group"
//                   >
//                     <div className="flex items-center justify-between mb-2">
//                       <div className="p-2 bg-amber-50 rounded-lg">
//                         <UserCircle className="h-5 w-5 text-amber-600" />
//                       </div>
//                       <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-amber-600" />
//                     </div>
//                     <p className="font-medium text-gray-900">Update Profile</p>
//                     <p className="text-sm text-gray-500">Edit information</p>
//                   </Link>
//                 </div>
//               </div> */}
//             </>
//           )}
          
//           {/* Page Content */}
//           <Outlet />
//         </div>

//         {/* Footer */}
//         <footer className="mt-8 px-6 py-4 bg-[#234A6B] text-white border-t border-white/10">
//           <div className="flex flex-col md:flex-row md:items-center justify-between">
//             <div className="text-sm">
//               <span className="font-semibold">Injibara University</span>
//               <span className="mx-2">•</span>
//               <span>Staff Workload Management System</span>
//               <span className="mx-2">•</span>
//               <span className="text-blue-300 capitalize">
//                 {user?.role?.replace("_", " ")} Interface
//               </span>
//             </div>
//             <div className="mt-2 md:mt-0 text-xs text-blue-300">
//               <div className="flex items-center space-x-4">
//                 <span>© {new Date().getFullYear()} All rights reserved</span>
//                 <span className="text-blue-400">v3.2.1</span>
//                 <span className="flex items-center">
//                   <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></div>
//                   System Online
//                 </span>
//               </div>
//             </div>
//           </div>
//         </footer>
//       </div>

//       {/* Mobile overlay */}
//       {sidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}
//     </div>
//   );
// };

// export default MainLayout;