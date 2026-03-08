import apiClient from "./client";

const collegeAPI = {
  getAllColleges: async (params = {}) => {
    return apiClient.get("/api/colleges", { params });
  },

  getCollegeById: async (id) => {
    return apiClient.get(`/api/colleges/${id}`);
  },

  createCollege: async (data) => {
    return apiClient.post("/api/colleges", data);
  },

  updateCollege: async (id, data) => {
    return apiClient.put(`/api/colleges/${id}`, data);
  },

  deleteCollege: async (id) => {
    return apiClient.delete(`/api/colleges/${id}`);
  },

  getCollegeStats: async (id) => {
    return apiClient.get(`/api/colleges/${id}/statistics`);
  },

  assignDean: async (id, data) => {
    return apiClient.post(`/api/colleges/${id}/assign-dean`, data);
  },
};

export default collegeAPI;
