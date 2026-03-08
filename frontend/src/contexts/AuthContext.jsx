


// import React, { createContext, useContext, useState, useEffect } from "react";
// import { authAPI } from "../api/auth";
// import { useNavigate } from "react-router-dom";

// const AuthContext = createContext(null);

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuth must be used within AuthProvider");
//   }
//   return context;
// };

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   // Initialize auth state on app load
//   useEffect(() => {
//     const initAuth = async () => {
//       try {
//         const token = localStorage.getItem("swoms_token");
//         const storedUser = localStorage.getItem("swoms_user");

//         if (token && storedUser) {
//           const parsedUser = JSON.parse(storedUser);
//           setUser(parsedUser);

//           // Optionally validate token with backend
//           try {
//             // Comment this out if you don't want to validate on every load
//             // await authAPI.getProfile();
//           } catch (error) {
//             console.warn("Token validation warning:", error.message);
//             // Don't logout on validation error, just use stored user
//           }
//         }
//       } catch (error) {
//         console.error("Auth initialization error:", error);
//         // Clear invalid auth data
//         localStorage.removeItem("swoms_token");
//         localStorage.removeItem("swoms_user");
//         setUser(null);
//       } finally {
//         setLoading(false);
//       }
//     };

//     initAuth();
//   }, []);

//   // Login function
//   const login = async (credentials) => {
//     setLoading(true);
//     try {
//       const response = await authAPI.login(credentials);

//       if (response.success) {
//         // Get the updated user from localStorage (set by authAPI.login)
//         const updatedUser = authAPI.getCurrentUser();
//         setUser(updatedUser);

//         return {
//           success: true,
//           data: {
//             ...response.data,
//             user: updatedUser,
//           },
//         };
//       } else {
//         return {
//           success: false,
//           error: response.message || "Login failed",
//         };
//       }
//     } catch (error) {
//       console.error("Login error:", error);
//       return {
//         success: false,
//         error: error.message || "Login failed. Please check credentials.",
//       };
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Logout function
//   const logout = async () => {
//     setLoading(true);
//     try {
//       await authAPI.logout();
//       setUser(null);
//       navigate("/login");
//     } catch (error) {
//       console.error("Logout error:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Check if user has specific role
//   const hasRole = (role) => {
//     if (!user || !user.role) return false;
//     return user.role === role;
//   };

//   // Check if user has any of the specified roles
//   const hasAnyRole = (roles) => {
//     if (!user || !user.role) return false;
//     return roles.includes(user.role);
//   };

//   // Refresh user data from backend
//   const refreshUser = async () => {
//     try {
//       const updatedUser = await authAPI.getProfile();
//       setUser(updatedUser);
//       return updatedUser;
//     } catch (error) {
//       console.error("Refresh user error:", error);
//       throw error;
//     }
//   };

//   const value = {
//     user,
//     loading,
//     login,
//     logout,
//     refreshUser,
//     isAuthenticated: !!user,
//     hasRole,
//     hasAnyRole,
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading application...</p>
//         </div>
//       </div>
//     );
//   }

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { authAPI } from "../api/auth";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize auth state on app load
  const initAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem("swoms_token");
      const storedUser = localStorage.getItem("swoms_user");

      if (token && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (parseError) {
          console.error("Error parsing user data:", parseError);
          localStorage.removeItem("swoms_token");
          localStorage.removeItem("swoms_user");
          setUser(null);
        }
      }
    } catch (error) {
      console.error("Auth initialization error:", error);
      localStorage.removeItem("swoms_token");
      localStorage.removeItem("swoms_user");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Login function
  const login = async (credentials) => {
    setLoading(true);
    try {
      const response = await authAPI.login(credentials);

      if (response.success && response.data?.token) {
        const userData = response.data.user || response.data;
        setUser(userData);

        // Store auth data
        localStorage.setItem("swoms_token", response.data.token);
        localStorage.setItem("swoms_user", JSON.stringify(userData));

        return {
          success: true,
          data: response.data,
        };
      } else {
        return {
          success: false,
          error:
            response.message || "Login failed. Invalid response from server.",
        };
      }
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: error.message || "Login failed. Please check credentials.",
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setLoading(true);
    try {
      // Clear local storage
      localStorage.removeItem("swoms_token");
      localStorage.removeItem("swoms_user");

      // Clear state
      setUser(null);

      // Call API logout if needed
      try {
        await authAPI.logout();
      } catch (apiError) {
        console.warn("API logout failed:", apiError);
      }

      // Navigate to login
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Check if user has specific role
  const hasRole = (role) => {
    if (!user || !user.role) return false;
    return user.role === role;
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles) => {
    if (!user || !user.role) return false;
    return roles.includes(user.role);
  };

  // Refresh user data from backend
  const refreshUser = async () => {
    try {
      const token = localStorage.getItem("swoms_token");
      if (!token) {
        throw new Error("No token found");
      }

      const updatedUser = await authAPI.getProfile();
      if (updatedUser) {
        setUser(updatedUser);
        localStorage.setItem("swoms_user", JSON.stringify(updatedUser));
      }
      return updatedUser;
    } catch (error) {
      console.error("Refresh user error:", error);
      // If refresh fails, logout user
      logout();
      throw error;
    }
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    const token = localStorage.getItem("swoms_token");
    const storedUser = localStorage.getItem("swoms_user");
    return !!(token && storedUser);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    refreshUser,
    isAuthenticated: isAuthenticated(),
    hasRole,
    hasAnyRole,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};