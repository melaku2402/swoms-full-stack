

// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../../contexts/AuthContext";
// import toast from "react-hot-toast";
// import {
//   Lock,
//   User,
//   Eye,
//   EyeOff,
//   University,
//   Shield,
//   GraduationCap,
//   CheckCircle,
//   Sparkles,
//   Key,
//   ShieldCheck,
//   Server,
//   Cpu,
//   Database,
//   Network,
// } from "lucide-react";

// const Login = () => {
//   const [form, setForm] = useState({ username: "", password: "" });
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [isHovered, setIsHovered] = useState(false);
//   const navigate = useNavigate();
//   const { login } = useAuth();

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!form.username.trim() || !form.password.trim()) {
//       toast.error("Please enter username and password");
//       return;
//     }

//     setLoading(true);

//     try {
//       const result = await login(form);

//       if (result.success) {
//         toast.success("Welcome back! Login successful", {
//           icon: "🎉",
//           duration: 2000,
//           style: {
//             background: "#10B981",
//             color: "#fff",
//           },
//         });

//         const user = result.data.user;

//         if (!user || !user.role) {
//           toast.error("User data incomplete. Please contact administrator.");
//           return;
//         }

//         const redirects = {
//           admin: "/dashboard",
//           instructor: "/dashboard",
//           department_head: "/dashboard",
//           dean: "/dashboard",
//           hr_director: "/admin/users",
//           finance: "/dashboard",
//           registrar: "/dashboard",
//           vpaa: "/dashboard",
//           vpaf: "/dashboard",
//           cde_director: "/dashboard",
//         };

//         const redirectPath = redirects[user.role] || "/dashboard";
//          navigate(redirectPath);
//         // setTimeout(() => {
         
//         // }, 500);
//       } else {
//         toast.error(result.error || "Login failed", {
//           icon: "⚠️",
//         });
//       }
//     } catch (error) {
//       console.error("Login error:", error);
//       toast.error(error.message || "An unexpected error occurred", {
//         icon: "❌",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden relative">
//       {/* Animated background elements */}
//       <div className="absolute inset-0 overflow-hidden">
//         <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
//         <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
//         <div className="absolute -top-20 left-1/4 w-60 h-60 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
//         <div className="absolute -bottom-20 right-1/4 w-60 h-60 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-6000"></div>
//       </div>

//       {/* Floating network nodes */}
//       <div className="absolute inset-0">
//         {[...Array(12)].map((_, i) => {
//           const size = 3 + Math.random() * 3;
//           return (
//             <div
//               key={i}
//               className="absolute rounded-full bg-gradient-to-r from-cyan-400/30 to-blue-400/30"
//               style={{
//                 left: `${Math.random() * 100}%`,
//                 top: `${Math.random() * 100}%`,
//                 width: `${size}px`,
//                 height: `${size}px`,
//                 animationDelay: `${Math.random() * 5}s`,
//                 animationDuration: `${8 + Math.random() * 8}s`,
//               }}
//             />
//           );
//         })}
//       </div>

//       {/* Network lines */}
//       <div className="absolute inset-0">
//         <svg className="w-full h-full opacity-20">
//           <defs>
//             <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
//               <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.3" />
//               <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.3" />
//             </linearGradient>
//           </defs>
//           <path
//             d="M100,100 Q250,50 400,150 Q550,250 700,150"
//             stroke="url(#gradient)"
//             strokeWidth="1"
//             fill="none"
//             className="animate-dash"
//           />
//           <path
//             d="M100,300 Q250,250 400,350 Q550,450 700,350"
//             stroke="url(#gradient)"
//             strokeWidth="1"
//             fill="none"
//             className="animate-dash animation-delay-1000"
//           />
//           <path
//             d="M100,500 Q250,450 400,550 Q550,650 700,550"
//             stroke="url(#gradient)"
//             strokeWidth="1"
//             fill="none"
//             className="animate-dash animation-delay-2000"
//           />
//         </svg>
//       </div>

//       {/* Main container */}
//       <div className="relative min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
//         {/* Header with logo */}
//         {/* <div className="text-center mb-8 sm:mb-12 animate-fade-in">
//           <div className="inline-flex items-center justify-center mb-6">
//             <div className="relative">
//               <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center transform rotate-12 shadow-2xl shadow-blue-500/30">
//                 <GraduationCap className="h-8 w-8 text-white transform -rotate-12" />
//               </div>
//               <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-4 border-gray-900 animate-pulse"></div>
//               <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-purple-400 rounded-full border-4 border-gray-900"></div>
//             </div>
//           </div>

//           <h1 className="text-2xl sm:text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight">
//             Staff Workload
//             <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
//               Management System
//             </span>
//           </h1>
//           <p className="text-gray-400 text-sm sm:text-base max-w-md mx-auto">
//             Secure access to Injibara University's academic management platform
//           </p>
//         </div> */}

//         {/* Login Card */}
//         <div className="w-full max-w-md animate-slide-up">
//           <div className="card-glass p-6 sm:p-8">
//             {/* Card header */}
//             <div className="text-center mb-8">
//               <div className="inline-flex items-center justify-center w-14 h-14 mb-4 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-400/20 backdrop-blur-sm">
//                 <Key className="h-7 w-7 text-cyan-400" />
//               </div>
//               <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
//                 Secure Login
//               </h2>
//               <p className="text-gray-400 text-sm">
//                 Enter your credentials to continue
//               </p>
//             </div>

//             {/* Security status */}
//             <div className="flex items-center justify-center space-x-4 mb-6 p-3 rounded-lg bg-gradient-to-r from-gray-900/50 to-gray-800/50 border border-white/10">
//               <div className="flex items-center space-x-2">
//                 <div className="relative">
//                   <Server className="h-5 w-5 text-emerald-400" />
//                   <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
//                 </div>
//                 <span className="text-sm text-gray-300">System Active</span>
//               </div>
//               <div className="w-px h-6 bg-white/20"></div>
//               <div className="flex items-center space-x-2">
//                 <ShieldCheck className="h-5 w-5 text-cyan-400" />
//                 <span className="text-sm text-gray-300">Encrypted</span>
//               </div>
//             </div>

//             {/* Login Form */}
//             <form onSubmit={handleSubmit} className="space-y-6">
//               {/* Username Field */}
//               <div className="space-y-2">
//                 <label className="block text-sm font-medium text-gray-300">
//                   Username or Email
//                 </label>
//                 <div className="relative group">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <User
//                       className={`h-5 w-5 transition-colors duration-300 ${
//                         form.username ? "text-cyan-400" : "text-gray-500"
//                       }`}
//                     />
//                   </div>
//                   <input
//                     type="text"
//                     required
//                     value={form.username}
//                     onChange={(e) =>
//                       setForm({ ...form, username: e.target.value.trim() })
//                     }
//                     className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all duration-300 backdrop-blur-sm"
//                     placeholder="Enter your username or email"
//                     disabled={loading}
//                     autoComplete="username"
//                   />
//                   <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400/0 via-cyan-400/0 to-cyan-400/0 group-hover:from-cyan-400/5 group-hover:via-cyan-400/2 group-hover:to-cyan-400/0 transition-all duration-500 -z-10"></div>
//                 </div>
//               </div>

//               {/* Password Field */}
//               <div className="space-y-2">
//                 <div className="flex items-center justify-between">
//                   <label className="block text-sm font-medium text-gray-300">
//                     Password
//                   </label>
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors flex items-center"
//                   >
//                     {showPassword ? (
//                       <>
//                         <EyeOff className="h-3 w-3 mr-1" />
//                         Hide
//                       </>
//                     ) : (
//                       <>
//                         <Eye className="h-3 w-3 mr-1" />
//                         Show
//                       </>
//                     )}
//                   </button>
//                 </div>
//                 <div className="relative group">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <Lock
//                       className={`h-5 w-5 transition-colors duration-300 ${
//                         form.password ? "text-cyan-400" : "text-gray-500"
//                       }`}
//                     />
//                   </div>
//                   <input
//                     type={showPassword ? "text" : "password"}
//                     required
//                     value={form.password}
//                     onChange={(e) =>
//                       setForm({ ...form, password: e.target.value })
//                     }
//                     className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all duration-300 backdrop-blur-sm"
//                     placeholder="Enter your password"
//                     disabled={loading}
//                     autoComplete="current-password"
//                   />
//                   <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400/0 via-cyan-400/0 to-cyan-400/0 group-hover:from-cyan-400/5 group-hover:via-cyan-400/2 group-hover:to-cyan-400/0 transition-all duration-500 -z-10"></div>
//                 </div>
//               </div>

//               {/* Remember & Forgot */}
//               <div className="flex items-center justify-between text-sm">
//                 <label className="flex items-center space-x-2 cursor-pointer">
//                   <div className="relative">
//                     <input type="checkbox" className="sr-only" />
//                     <div className="w-4 h-4 rounded border border-white/20 bg-white/5 flex items-center justify-center">
//                       <CheckCircle className="h-3 w-3 text-cyan-400 hidden" />
//                     </div>
//                   </div>
//                   <span className="text-gray-300">Remember this device</span>
//                 </label>
//                 <button
//                   type="button"
//                   className="text-cyan-400 hover:text-cyan-300 transition-colors"
//                 >
//                   Forgot password?
//                 </button>
//               </div>

//               {/* Submit Button */}
//               <button
//                 type="submit"
//                 disabled={loading}
//                 onMouseEnter={() => setIsHovered(true)}
//                 onMouseLeave={() => setIsHovered(false)}
//                 className="w-full relative overflow-hidden group mt-2"
//               >
//                 {/* Button background */}
//                 <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 group-hover:from-cyan-600 group-hover:via-blue-600 group-hover:to-purple-600 transition-all duration-300"></div>
//                 <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

//                 {/* Animated shine effect */}
//                 <div className="absolute inset-0 overflow-hidden">
//                   <div className="absolute -inset-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
//                 </div>

//                 {/* Button content */}
//                 <div className="relative flex items-center justify-center py-3.5 px-6 rounded-xl text-white font-semibold text-base sm:text-lg shadow-lg transform transition-transform duration-300 group-hover:scale-[1.02]">
//                   {loading ? (
//                     <>
//                       <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
//                       Authenticating...
//                     </>
//                   ) : (
//                     <>
//                       <span>Sign In</span>
//                       <div
//                         className={`ml-3 transform transition-transform duration-300 ${
//                           isHovered ? "translate-x-1.5" : "translate-x-0"
//                         }`}
//                       >
//                         <svg
//                           className="w-4 h-4"
//                           fill="none"
//                           viewBox="0 0 24 24"
//                           stroke="currentColor"
//                         >
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth={2}
//                             d="M14 5l7 7m0 0l-7 7m7-7H3"
//                           />
//                         </svg>
//                       </div>
//                     </>
//                   )}
//                 </div>
//               </button>
//             </form>

//             {/* Alternative login methods */}
//             <div className="mt-8 pt-8 border-t border-white/10">
//               <p className="text-center text-gray-400 text-sm mb-4">
//                 Or sign in with
//               </p>
//               <div className="grid grid-cols-2 gap-3">
//                 <button
//                   type="button"
//                   className="flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300 group"
//                 >
//                   <University className="h-4 w-4 text-gray-400 group-hover:text-blue-400" />
//                   <span className="text-sm text-gray-300 group-hover:text-white">
//                     University SSO
//                   </span>
//                 </button>
//                 <button
//                   type="button"
//                   className="flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300 group"
//                 >
//                   <Database className="h-4 w-4 text-gray-400 group-hover:text-green-400" />
//                   <span className="text-sm text-gray-300 group-hover:text-white">
//                     Active Directory
//                   </span>
//                 </button>
//               </div>
//             </div>

//             {/* Security badges */}
//             <div className="mt-8 flex flex-wrap justify-center gap-3">
//               <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
//                 <Shield className="h-3 w-3 mr-1.5" />
//                 ISO 27001
//               </div>
//               <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20">
//                 <Cpu className="h-3 w-3 mr-1.5" />
//                 AES-256
//               </div>
//               <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20">
//                 <Network className="h-3 w-3 mr-1.5" />
//                 Zero Trust
//               </div>
//             </div>

//             {/* Footer */}
//             <div className="mt-8 pt-6 border-t border-white/10 text-center">
//               <p className="text-xs text-gray-500">
//                 © {new Date().getFullYear()} Injibara University - SWOMS v2.0
//                 <br />
//                 <span className="text-gray-600">
//                   All access is logged and monitored
//                 </span>
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Quick tips */}
//         <div className="mt-8 text-center animate-fade-in animation-delay-500">
//           <div className="inline-flex items-center space-x-2 text-sm text-gray-400">
//             <Sparkles className="h-3 w-3 text-cyan-400" />
//             <span>Tip: Use your university credentials for SSO login</span>
//           </div>
//         </div>
//       </div>

//       {/* Add custom animations to CSS */}
//       <style jsx>{`
//         @keyframes blob {
//           0% {
//             transform: translate(0px, 0px) scale(1);
//           }
//           33% {
//             transform: translate(30px, -50px) scale(1.1);
//           }
//           66% {
//             transform: translate(-20px, 20px) scale(0.9);
//           }
//           100% {
//             transform: translate(0px, 0px) scale(1);
//           }
//         }
//         @keyframes dash {
//           to {
//             stroke-dashoffset: 1000;
//           }
//         }
//         @keyframes slide-up {
//           from {
//             opacity: 0;
//             transform: translateY(20px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }
//         @keyframes fade-in {
//           from {
//             opacity: 0;
//           }
//           to {
//             opacity: 1;
//           }
//         }
//         .animate-blob {
//           animation: blob 7s infinite;
//         }
//         .animate-dash {
//           stroke-dasharray: 10;
//           animation: dash 30s linear infinite;
//         }
//         .animate-slide-up {
//           animation: slide-up 0.6s ease-out;
//         }
//         .animate-fade-in {
//           animation: fade-in 0.8s ease-out;
//         }
//         .animation-delay-1000 {
//           animation-delay: 1s;
//         }
//         .animation-delay-2000 {
//           animation-delay: 2s;
//         }
//         .animation-delay-4000 {
//           animation-delay: 4s;
//         }
//         .animation-delay-6000 {
//           animation-delay: 6s;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default Login;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import IULogo from "../../assets/IUlogo.jpg";
import toast from "react-hot-toast";
import {
  Lock,
  User,
  Eye,
  EyeOff,
  University,
  Shield,
  GraduationCap,
  CheckCircle,
  Sparkles,
  Key,
  ShieldCheck,
  Server,
  Cpu,
  Database,
  Network,
  Clock,
  Building2,
  BookOpen,
  Users,
  TrendingUp,
  Star,
  Target,
  Award,
} from "lucide-react";

// Import your university logo (adjust the path accordingly)
// import UniversityLogo from "../../assets/university-logo.png";

const Login = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.username.trim() || !form.password.trim()) {
      toast.error("Please enter username and password");
      return;
    }

    setLoading(true);

    try {
      const result = await login(form);

      if (result.success) {
        toast.success("Welcome back! Login successful", {
          icon: "🎓",
          duration: 2000,
          style: {
            background: "#059669",
            color: "#fff",
          },
        });

        const user = result.data.user;

        if (!user || !user.role) {
          toast.error("User data incomplete. Please contact administrator.");
          return;
        }

        const redirects = {
          admin: "/dashboard",
          instructor: "/dashboard",
          department_head: "/dashboard",
          dean: "/dashboard",
          hr_director: "/admin/users",
          finance: "/dashboard",
          registrar: "/dashboard",
          vpaa: "/dashboard",
          vpaf: "/dashboard",
          cde_director: "/dashboard",
        };

        const redirectPath = redirects[user.role] || "/dashboard";
        navigate(redirectPath);
      } else {
        toast.error(result.error || "Login failed", {
          icon: "⚠️",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.message || "An unexpected error occurred", {
        icon: "❌",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#08387F] via-[#10396D] to-[#08387F] overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute -top-20 left-1/4 w-60 h-60 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
        <div className="absolute -bottom-20 right-1/4 w-60 h-60 bg-emerald-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-6000"></div>
      </div>

      {/* Geometric background patterns */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-32 h-32 border-2 border-amber-500/30 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute top-0 right-0 w-48 h-48 border-2 border-cyan-500/30 rounded-full translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-1/4 w-64 h-64 border-2 border-blue-500/30 rounded-full -translate-x-1/2 translate-y-1/2"></div>
      </div>

      {/* Main container */}
      <div className="relative min-h-screen flex flex-col lg:flex-row items-center justify-center p-4 sm:p-6 lg:p-8">
        {/* Left side - University Information */}
        <div className="lg:w-1/2 lg:pr-12 mb-12 lg:mb-0 animate-fade-in">
          <div className="max-w-lg mx-auto">
            {/* University Logo Section */}
            <div className="relative group mb-10">
              <div className="flex flex-col items-center">
                {/* Main Logo Container */}
                <div className="relative mb-6">
                  {/* Glowing outer ring */}
                  <div className="absolute -inset-4 bg-gradient-to-r from-amber-400/20 via-amber-500/20 to-amber-400/20 rounded-full blur-xl opacity-70 animate-pulse"></div>

                  {/* Logo with golden border */}
                  {/* Logo with golden border */}
                  <div className="relative w-48 h-48 rounded-full bg-white border-8 border-amber-500 shadow-2xl shadow-amber-500/30 overflow-hidden flex items-center justify-center transform hover:scale-105 transition-transform duration-500">
                    {/* University Circle Logo */}
                    <div className="relative w-full h-full flex items-center justify-center">
                      {/* Fixed Image Logic */}
                      <img
                        src={IULogo}
                        alt="Injibara University Logo"
                        className="w-full h-full object-cover"
                      />

                      {/* Animated rings around logo */}
                      <div className="absolute inset-0 border-2 border-amber-300/30 rounded-full animate-spin-slow pointer-events-none"></div>
                      <div className="absolute inset-2 border-2 border-white/20 rounded-full animate-spin-slow-reverse pointer-events-none"></div>
                    </div>

                    {/* Top right badge */}
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg z-10 border border-amber-300 flex items-center">
                      <Target className="h-3 w-3 mr-1" />
                      EXCELLENCE
                    </div>

                    {/* Bottom left badge */}
                    <div className="absolute -bottom-2 -left-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg z-10 border border-cyan-300 flex items-center">
                      <Award className="h-3 w-3 mr-1" />
                      EST. 2024
                    </div>
                  </div>

                  {/* Outer decorative rings */}
                  <div className="absolute -inset-6 border-2 border-amber-400/20 rounded-full animate-spin-slower"></div>
                  <div className="absolute -inset-8 border-2 border-white/10 rounded-full animate-spin-slower-reverse"></div>
                </div>

                {/* University Name and Tagline */}
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-white mb-2 tracking-wider">
                    INJIBARA <span className="text-amber-400">UNIVERSITY</span>
                  </h1>
                  <div className="inline-flex items-center bg-gradient-to-r from-blue-900/50 to-cyan-900/50 px-6 py-2 rounded-full border border-white/20 mb-3">
                    <Star className="h-4 w-4 text-amber-400 mr-2 animate-pulse" />
                    <span className="text-lg text-amber-300 font-semibold">
                      Center of Academic Excellence
                    </span>
                    <Star className="h-4 w-4 text-amber-400 ml-2 animate-pulse" />
                  </div>
                  <p className="text-xl text-blue-300 font-medium">
                    Staff Workload & Overload Management System
                  </p>
                  <p className="text-sm text-blue-400 mt-2 max-w-md">
                    Empowering educators through innovative workload management
                    and academic resource optimization
                  </p>
                </div>
              </div>

              {/* Logo tag on hover */}
              <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white px-4 py-2 rounded-r-lg shadow-lg">
                  <div className="text-xs font-bold">OFFICIAL SEAL</div>
                  <div className="text-[10px]">University Identity</div>
                </div>
                <div className="w-0 h-0 border-t-4 border-b-4 border-l-0 border-r-4 border-r-amber-600 absolute left-0 top-1/2 transform -translate-y-1/2"></div>
              </div>
            </div>

          
            {/* System Features */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:border-amber-400/30 transition-all group">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                    <Users className="h-5 w-5 text-blue-400" />
                  </div>
                  <span className="text-sm font-medium text-white">
                    Multi-Role Access
                  </span>
                </div>
                <p className="text-xs text-blue-300">12 distinct user roles</p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:border-emerald-400/30 transition-all group">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
                    <TrendingUp className="h-5 w-5 text-emerald-400" />
                  </div>
                  <span className="text-sm font-medium text-white">
                    Real-time Analytics
                  </span>
                </div>
                <p className="text-xs text-blue-300">Live monitoring</p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:border-amber-400/30 transition-all group">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center group-hover:bg-amber-500/30 transition-colors">
                    <ShieldCheck className="h-5 w-5 text-amber-400" />
                  </div>
                  <span className="text-sm font-medium text-white">
                    Secure Payments
                  </span>
                </div>
                <p className="text-xs text-blue-300">AES-256 encrypted</p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:border-cyan-400/30 transition-all group">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center group-hover:bg-cyan-500/30 transition-colors">
                    <BookOpen className="h-5 w-5 text-cyan-400" />
                  </div>
                  <span className="text-sm font-medium text-white">
                    Academic Tools
                  </span>
                </div>
                <p className="text-xs text-blue-300">Complete management</p>
              </div>
            </div>
            
          </div>
          
        </div>

        {/* Right side - Login Card */}
        <div className="lg:w-1/2 animate-slide-up">
          <div className="max-w-md mx-auto">
            <div className="relative">
              {/* Login Card */}
              <div className="card-glass p-8 rounded-2xl border border-white/20 backdrop-blur-xl bg-gradient-to-br from-[#08387F]/80 via-[#10396D]/80 to-[#08387F]/80 shadow-2xl">
                {/* Card header with small university logo */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 mb-4 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/20 border-2 border-amber-400/30 backdrop-blur-sm p-2">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">IU</span>
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    University Portal Login
                  </h2>
                  <p className="text-blue-300 text-sm">
                    Access the Staff Workload Management System
                  </p>
                  <div className="inline-flex items-center mt-2 px-3 py-1 bg-blue-900/50 rounded-full">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse"></div>
                    <span className="text-xs text-emerald-400">
                      Secure Connection Established
                    </span>
                  </div>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Username Field */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-blue-300">
                      <span className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        University ID or Email
                      </span>
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-blue-400" />
                      </div>
                      <input
                        type="text"
                        required
                        value={form.username}
                        onChange={(e) =>
                          setForm({ ...form, username: e.target.value.trim() })
                        }
                        className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 transition-all duration-300 backdrop-blur-sm"
                        placeholder="e.g., staff_id@injibara.edu.et"
                        disabled={loading}
                        autoComplete="username"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-blue-300">
                        <span className="flex items-center">
                          <Lock className="h-4 w-4 mr-2" />
                          Password
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-xs text-amber-400 hover:text-amber-300 transition-colors flex items-center"
                      >
                        {showPassword ? (
                          <>
                            <EyeOff className="h-3 w-3 mr-1" />
                            Hide
                          </>
                        ) : (
                          <>
                            <Eye className="h-3 w-3 mr-1" />
                            Show
                          </>
                        )}
                      </button>
                    </div>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-blue-400" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={form.password}
                        onChange={(e) =>
                          setForm({ ...form, password: e.target.value })
                        }
                        className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 transition-all duration-300 backdrop-blur-sm"
                        placeholder="Enter your password"
                        disabled={loading}
                        autoComplete="current-password"
                      />
                    </div>
                  </div>

                  {/* Remember & Forgot */}
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <div className="relative">
                        <input type="checkbox" className="sr-only" />
                        <div className="w-4 h-4 rounded border border-white/30 bg-white/10 flex items-center justify-center hover:border-amber-400 transition-colors">
                          <CheckCircle className="h-3 w-3 text-amber-400 opacity-0" />
                        </div>
                      </div>
                      <span className="text-blue-300">
                        Remember this device
                      </span>
                    </label>
                    <button
                      type="button"
                      className="text-amber-400 hover:text-amber-300 transition-colors hover:underline text-xs"
                    >
                      Forgot password?
                    </button>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    className="w-full relative overflow-hidden group mt-2 "
                  >
                    {/* Button background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 group-hover:from-amber-600 group-hover:via-amber-700 group-hover:to-amber-800 transition-all duration-300 rounded-2xl"></div>

                    {/* Animated shine effect */}
                    <div className="absolute inset-0 overflow-hidden">
                      <div className="absolute -inset-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                    </div>

                    {/* Button content */}
                    <div className="relative flex items-center justify-center py-4 px-6 rounded-xl text-white font-semibold text-base sm:text-lg shadow-lg transform transition-transform duration-300 group-hover:scale-[1.02] roun">
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                          Authenticating...
                        </>
                      ) : (
                        <>
                          <Key className="h-5 w-5 mr-3" />
                          <span>Login</span>
                          <div
                            className={`ml-3 transform transition-transform duration-300 ${
                              isHovered ? "translate-x-1.5" : "translate-x-0"
                            }`}
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M14 5l7 7m0 0l-7 7m7-7H3"
                              />
                            </svg>
                          </div>
                        </>
                      )}
                    </div>
                  </button>
                </form>

              </div>

              {/* Floating elements around card */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-amber-500/20 rounded-full blur-sm animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-cyan-500/20 rounded-full blur-sm animate-pulse animation-delay-1000"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom info bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#08387F]/90 border-t border-white/10 backdrop-blur-sm z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between text-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-amber-400" />
                <span className="text-blue-300">
                  {new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-blue-300">
                  System Status: Operational
                </span>
              </div>
              <div className="hidden md:flex items-center space-x-2">
                <div className="w-1 h-1 bg-amber-400 rounded-full"></div>
                <span className="text-blue-400">
                  Official University System
                </span>
              </div>
            </div>
            <div className="mt-2 md:mt-0">
              <span className="text-blue-400">
                IT Support: support@injibara.edu.et • Ext: 1234
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Add custom animations to CSS */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes spin-slow-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }
        @keyframes spin-slower {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(-360deg);
          }
        }
        @keyframes spin-slower-reverse {
          from {
            transform: rotate(-360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        .animate-spin-slow-reverse {
          animation: spin-slow-reverse 25s linear infinite;
        }
        .animate-spin-slower {
          animation: spin-slower 30s linear infinite;
        }
        .animate-spin-slower-reverse {
          animation: spin-slower-reverse 35s linear infinite;
        }
        .animation-delay-300 {
          animation-delay: 300ms;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animation-delay-6000 {
          animation-delay: 6s;
        }

        .card-glass {
          background: linear-gradient(
            135deg,
            rgba(8, 56, 127, 0.9) 0%,
            rgba(16, 57, 109, 0.9) 100%
          );
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
};

export default Login;