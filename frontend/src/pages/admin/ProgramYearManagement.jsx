// import React, { useState, useEffect } from "react";
// import { programYearAPI, programAPI } from "../api";

// const ProgramYearManagement = ({ programId }) => {
//   const [programYears, setProgramYears] = useState([]);
//   const [program, setProgram] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [formData, setFormData] = useState({
//     year_number: "",
//     year_name: "",
//     total_credits: 0,
//   });

//   useEffect(() => {
//     if (programId) {
//       loadProgramData();
//       loadProgramYears();
//     }
//   }, [programId]);

//   const loadProgramData = async () => {
//     try {
//       const response = await programAPI.getProgramById(programId);
//       setProgram(response.data);
//     } catch (error) {
//       console.error("Failed to load program:", error);
//     }
//   };

//   const loadProgramYears = async () => {
//     try {
//       setLoading(true);
//       const response = await programYearAPI.getProgramYearsByProgram(programId);
//       setProgramYears(response.data?.programYears || []);
//     } catch (error) {
//       console.error("Failed to load program years:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       const errors = programAPI.validateProgramYearData({
//         ...formData,
//         program_id: programId,
//       });

//       if (Object.keys(errors).length > 0) {
//         alert("Please fix validation errors");
//         return;
//       }

//       await programYearAPI.createProgramYear({
//         program_id: parseInt(programId),
//         year_number: parseInt(formData.year_number),
//         year_name: formData.year_name,
//         total_credits: parseFloat(formData.total_credits || 0),
//       });

//       alert("Program year created successfully!");
//       setFormData({ year_number: "", year_name: "", total_credits: 0 });
//       loadProgramYears(); // Refresh list
//     } catch (error) {
//       alert(`Error: ${error.message}`);
//     }
//   };

//   const handleDeleteYear = async (yearId) => {
//     if (window.confirm("Are you sure you want to delete this program year?")) {
//       try {
//         await programYearAPI.deleteProgramYear(yearId);
//         alert("Program year deleted successfully!");
//         loadProgramYears(); // Refresh list
//       } catch (error) {
//         alert(`Error: ${error.message}`);
//       }
//     }
//   };

//   if (loading) return <div>Loading program years...</div>;

//   return (
//     <div className="program-year-management">
//       {program && (
//         <div className="program-header">
//           <h3>
//             {program.program_code} - {program.program_name}
//           </h3>
//           <p>Manage Program Years</p>
//         </div>
//       )}

//       {/* Add Year Form */}
//       <div className="add-year-form">
//         <h4>Add New Year</h4>
//         <form onSubmit={handleSubmit}>
//           <div className="form-group">
//             <label>Year Number</label>
//             <input
//               type="number"
//               min="1"
//               max="10"
//               value={formData.year_number}
//               onChange={(e) =>
//                 setFormData({ ...formData, year_number: e.target.value })
//               }
//               required
//             />
//           </div>

//           <div className="form-group">
//             <label>Year Name (Optional)</label>
//             <input
//               type="text"
//               value={formData.year_name}
//               onChange={(e) =>
//                 setFormData({ ...formData, year_name: e.target.value })
//               }
//               placeholder="e.g., First Year, Foundation Year"
//             />
//           </div>

//           <div className="form-group">
//             <label>Total Credits (Optional)</label>
//             <input
//               type="number"
//               step="0.5"
//               min="0"
//               max="200"
//               value={formData.total_credits}
//               onChange={(e) =>
//                 setFormData({ ...formData, total_credits: e.target.value })
//               }
//             />
//           </div>

//           <button type="submit" className="btn btn-primary">
//             Add Year
//           </button>
//         </form>
//       </div>

//       {/* Years List */}
//       <div className="years-list">
//         <h4>Program Years ({programYears.length})</h4>
//         {programYears.length === 0 ? (
//           <p>No program years added yet.</p>
//         ) : (
//           <div className="years-grid">
//             {programYears.map((year) => {
//               const transformed = programYearAPI.transformForDisplay(year);

//               return (
//                 <div key={year.program_year_id} className="year-card">
//                   <div className="year-header">
//                     <h5>{transformed.display_name}</h5>
//                     <span className="badge badge-info">
//                       {year.course_count || 0} courses
//                     </span>
//                   </div>

//                   <div className="year-details">
//                     <div className="detail-item">
//                       <span className="label">Credits:</span>
//                       <span className="value">{year.total_credits || 0}</span>
//                     </div>
//                     <div className="detail-item">
//                       <span className="label">Courses:</span>
//                       <span className="value">{year.course_count || 0}</span>
//                     </div>
//                   </div>

//                   <div className="year-actions">
//                     <button className="btn btn-sm btn-primary">
//                       View Courses
//                     </button>
//                     <button className="btn btn-sm btn-warning">Edit</button>
//                     <button
//                       className="btn btn-sm btn-danger"
//                       onClick={() => handleDeleteYear(year.program_year_id)}
//                       disabled={(year.course_count || 0) > 0}
//                     >
//                       Delete
//                     </button>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>

//       {/* Statistics */}
//       <div className="year-statistics">
//         <h4>Year Statistics</h4>
//         <div className="stats-grid">
//           <div className="stat-card">
//             <span className="stat-label">Total Years</span>
//             <span className="stat-value">{programYears.length}</span>
//           </div>
//           <div className="stat-card">
//             <span className="stat-label">Total Courses</span>
//             <span className="stat-value">
//               {programYears.reduce(
//                 (sum, year) => sum + (year.course_count || 0),
//                 0
//               )}
//             </span>
//           </div>
//           <div className="stat-card">
//             <span className="stat-label">Total Credits</span>
//             <span className="stat-value">
//               {programYears.reduce(
//                 (sum, year) => sum + (year.total_credits || 0),
//                 0
//               )}
//             </span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProgramYearManagement;
