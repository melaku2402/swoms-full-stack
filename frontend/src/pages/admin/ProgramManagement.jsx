// import React, { useState, useEffect } from "react";
// import { programAPI, programUtils } from "../api";

// const ProgramManagement = () => {
//   const [programs, setPrograms] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [filters, setFilters] = useState({
//     page: 1,
//     limit: 10,
//     department_id: "",
//     program_type: "",
//     status: "active",
//     search: "",
//   });

//   useEffect(() => {
//     loadPrograms();
//   }, [filters]);

//   const loadPrograms = async () => {
//     try {
//       setLoading(true);
//       const response = await programAPI.getAllPrograms(filters);
//       setPrograms(response.data?.programs || []);
//     } catch (error) {
//       console.error("Failed to load programs:", error);
//       const errorInfo = programAPI.handleProgramError(error);
//       alert(errorInfo.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCreateProgram = async (programData) => {
//     try {
//       // Validate data
//       const errors = programAPI.validateProgramData(programData);
//       if (Object.keys(errors).length > 0) {
//         alert("Please fix validation errors");
//         return;
//       }

//       const response = await programAPI.createProgram(programData);
//       alert("Program created successfully!");
//       loadPrograms(); // Refresh list
//       return response;
//     } catch (error) {
//       const errorInfo = programAPI.handleProgramError(error);
//       alert(errorInfo.message);
//       throw error;
//     }
//   };

//   const handleDeleteProgram = async (programId, program) => {
//     if (!programAPI.canDeleteProgram(program)) {
//       alert("Cannot delete program with existing courses");
//       return;
//     }

//     if (window.confirm("Are you sure you want to delete this program?")) {
//       try {
//         await programAPI.deleteProgram(programId);
//         alert("Program deleted successfully!");
//         loadPrograms(); // Refresh list
//       } catch (error) {
//         const errorInfo = programAPI.handleProgramError(error);
//         alert(errorInfo.message);
//       }
//     }
//   };

//   if (loading) return <div>Loading programs...</div>;

//   return (
//     <div className="program-management">
//       <h2>Program Management</h2>

//       {/* Filters */}
//       <div className="filters-section">
//         <input
//           type="text"
//           placeholder="Search programs..."
//           value={filters.search}
//           onChange={(e) =>
//             setFilters({ ...filters, search: e.target.value, page: 1 })
//           }
//         />

//         <select
//           value={filters.program_type}
//           onChange={(e) =>
//             setFilters({ ...filters, program_type: e.target.value, page: 1 })
//           }
//         >
//           <option value="">All Types</option>
//           {Object.values(PROGRAM_TYPES).map((type) => (
//             <option key={type} value={type}>
//               {programAPI.getProgramTypeDisplay(type)}
//             </option>
//           ))}
//         </select>

//         <select
//           value={filters.status}
//           onChange={(e) =>
//             setFilters({ ...filters, status: e.target.value, page: 1 })
//           }
//         >
//           <option value="active">Active</option>
//           <option value="inactive">Inactive</option>
//           <option value="">All Status</option>
//         </select>
//       </div>

//       {/* Programs Table */}
//       <div className="programs-table">
//         <table>
//           <thead>
//             <tr>
//               <th>Code</th>
//               <th>Name</th>
//               <th>Type</th>
//               <th>Department</th>
//               <th>Courses</th>
//               <th>Status</th>
//               <th>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {programs.map((program) => {
//               const transformed =
//                 programAPI.transformProgramForDisplay(program);

//               return (
//                 <tr key={program.program_id}>
//                   <td>{program.program_code}</td>
//                   <td>{program.program_name}</td>
//                   <td>
//                     <span className={`badge badge-${transformed.type_color}`}>
//                       {transformed.type_display}
//                     </span>
//                   </td>
//                   <td>{program.department_name}</td>
//                   <td>{program.course_count || 0}</td>
//                   <td>
//                     <span className={`badge badge-${transformed.status_color}`}>
//                       {transformed.status_display}
//                     </span>
//                   </td>
//                   <td>
//                     <button className="btn btn-sm btn-primary">View</button>
//                     <button className="btn btn-sm btn-warning">Edit</button>
//                     <button
//                       className="btn btn-sm btn-danger"
//                       onClick={() =>
//                         handleDeleteProgram(program.program_id, program)
//                       }
//                       disabled={!transformed.can_delete}
//                     >
//                       Delete
//                     </button>
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>

//       {/* Pagination */}
//       {response?.data?.pagination && (
//         <div className="pagination">
//           <button
//             disabled={filters.page === 1}
//             onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
//           >
//             Previous
//           </button>
//           <span>
//             Page {filters.page} of {response.data.pagination.pages}
//           </span>
//           <button
//             disabled={filters.page >= response.data.pagination.pages}
//             onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
//           >
//             Next
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ProgramManagement;
