// import apiClient from './client';

// export const rulesAPI = {
//   // System Rules
//   getSystemRules: (params) => apiClient.get('/api/rules', { params }),
//   getRuleById: (id) => apiClient.get(`/api/rules/${id}`),
//   createRule: (data) => apiClient.post('/api/rules', data),
//   updateRule: (id, data) => apiClient.put(`/api/rules/${id}`, data),
//   deleteRule: (id) => apiClient.delete(`/api/rules/${id}`),
//   activateRule: (id) => apiClient.post(`/api/rules/${id}/activate`),

//   // Load Factors
//   getLoadFactors: () => apiClient.get('/api/rules/load-factors'),
//   updateLoadFactors: (data) => apiClient.put('/api/rules/load-factors', data),

//   // Rank Limits
//   getRankLimits: () => apiClient.get('/api/rules/rank-limits'),
//   updateRankLimits: (data) => apiClient.put('/api/rules/rank-limits', data),

//   // Summer Distribution
//   getSummerDistribution: () => apiClient.get('/api/rules/summer-distribution'),
//   updateSummerDistribution: (data) => apiClient.put('/api/rules/summer-distribution', data),
// };

// export default rulesAPI;
// src/api/rules.js
import apiClient from './client';

export const rulesAPI = {
  // System Rules - DIRECT MATCH to controller methods
  getSystemRules: (params) => {
    console.log('📋 Fetching system rules with params:', params);
    return apiClient.get('/api/rules', { params }).then(response => {
      console.log('📋 Rules response:', response.data);
      return response;
    });
  },
  
  getRuleById: (id) => {
    console.log('📋 Fetching rule by ID:', id);
    return apiClient.get(`/api/rules/${id}`).then(response => {
      console.log('📋 Rule by ID response:', response.data);
      return response;
    });
  },
  
  createRule: (data) => {
    console.log('📋 Creating rule:', data);
    return apiClient.post('/api/rules', data).then(response => {
      console.log('📋 Create rule response:', response.data);
      return response;
    });
  },
  
  updateRule: (id, data) => {
    console.log('📋 Updating rule:', id, data);
    return apiClient.put(`/api/rules/${id}`, data).then(response => {
      console.log('📋 Update rule response:', response.data);
      return response;
    });
  },
  
  deleteRule: (id) => {
    console.log('📋 Deleting rule:', id);
    return apiClient.delete(`/api/rules/${id}`).then(response => {
      console.log('📋 Delete rule response:', response.data);
      return response;
    });
  },
  
  activateRule: (id) => {
    console.log('📋 Activating rule:', id);
    return apiClient.post(`/api/rules/${id}/activate`).then(response => {
      console.log('📋 Activate rule response:', response.data);
      return response;
    });
  },
  
  deactivateRule: (id) => {
    console.log('📋 Deactivating rule:', id);
    return apiClient.post(`/api/rules/${id}/deactivate`).then(response => {
      console.log('📋 Deactivate rule response:', response.data);
      return response;
    });
  },

  // Business Logic - DIRECT MATCH to controller methods
  evaluateRule: (data) => {
    console.log('📋 Evaluating rule:', data);
    return apiClient.post('/api/rules/evaluate', data).then(response => {
      console.log('📋 Evaluate rule response:', response.data);
      return response;
    });
  },
  
  calculateLoad: (data) => {
    console.log('📋 Calculating load:', data);
    return apiClient.post('/api/rules/calculate-load', data).then(response => {
      console.log('📋 Calculate load response:', response.data);
      return response;
    });
  },
  
  validateRankLoad: (data) => {
    console.log('📋 Validating rank load:', data);
    return apiClient.post('/api/rules/validate-rank-load', data).then(response => {
      console.log('📋 Validate rank load response:', response.data);
      return response;
    });
  },
  
  calculateNRPPayment: (data) => {
    console.log('📋 Calculating NRP payment:', data);
    return apiClient.post('/api/rules/calculate-nrp-payment', data).then(response => {
      console.log('📋 Calculate NRP payment response:', response.data);
      return response;
    });
  },
  
  calculateOverloadPayment: (data) => {
    console.log('📋 Calculating overload payment:', data);
    return apiClient.post('/api/rules/calculate-overload-payment', data).then(response => {
      console.log('📋 Calculate overload payment response:', response.data);
      return response;
    });
  },

  // Query Routes - DIRECT MATCH to controller methods
  getRuleByName: (name) => {
    console.log('📋 Fetching rule by name:', name);
    return apiClient.get(`/api/rules/name/${name}`).then(response => {
      console.log('📋 Rule by name response:', response.data);
      return response;
    });
  },
  
  getRulesByType: (type) => {
    console.log('📋 Fetching rules by type:', type);
    return apiClient.get(`/api/rules/type/${type}`).then(response => {
      console.log('📋 Rules by type response:', response.data);
      return response;
    });
  },
  
  getRuleHistory: (name) => {
    console.log('📋 Fetching rule history:', name);
    return apiClient.get(`/api/rules/history/${name}`).then(response => {
      console.log('📋 Rule history response:', response.data);
      return response;
    });
  },
  
  getRankLoadLimits: (rank) => {
    console.log('📋 Fetching rank load limits:', rank);
    return apiClient.get(`/api/rules/rank-limits/${rank}`).then(response => {
      console.log('📋 Rank load limits response:', response.data);
      return response;
    });
  },
  
  getAllRankLoadLimits: () => {
    console.log('📋 Fetching all rank load limits');
    return apiClient.get('/api/rules/rank-limits').then(response => {
      console.log('📋 All rank load limits response:', response.data);
      return response;
    });
  },
  
  getLoadFactors: () => {
    console.log('📋 Fetching load factors');
    return apiClient.get('/api/rules/load-factors').then(response => {
      console.log('📋 Load factors response:', response.data);
      return response;
    });
  },
  
  getPaymentRates: (program_type) => {
    console.log('📋 Fetching payment rates for program:', program_type);
    return apiClient.get(`/api/rules/payment-rates/${program_type}`).then(response => {
      console.log('📋 Payment rates response:', response.data);
      return response;
    });
  },
  
  getSummerDistribution: () => {
    console.log('📋 Fetching summer distribution');
    return apiClient.get('/api/rules/summer-distribution').then(response => {
      console.log('📋 Summer distribution response:', response.data);
      return response;
    });
  },
  
  getCorrectionRates: () => {
    console.log('📋 Fetching correction rates');
    return apiClient.get('/api/rules/correction-rates').then(response => {
      console.log('📋 Correction rates response:', response.data);
      return response;
    });
  },

  // Utility Routes - DIRECT MATCH to controller methods
  validateWorkload: (data) => {
    console.log('📋 Validating workload:', data);
    return apiClient.post('/api/rules/validate-workload', data).then(response => {
      console.log('📋 Validate workload response:', response.data);
      return response;
    });
  },
  
  bulkUpdateRules: (data) => {
    console.log('📋 Bulk updating rules:', data);
    return apiClient.post('/api/rules/bulk-update', data).then(response => {
      console.log('📋 Bulk update response:', response.data);
      return response;
    });
  },
  
  getRulesDashboard: () => {
    console.log('📋 Fetching rules dashboard');
    return apiClient.get('/api/rules/dashboard/summary').then(response => {
      console.log('📋 Rules dashboard response:', response.data);
      return response;
    });
  },
  
  getActiveRateTables: () => {
    console.log('📋 Fetching active rate tables');
    return apiClient.get('/api/rules/rate-tables/active').then(response => {
      console.log('📋 Active rate tables response:', response.data);
      return response;
    });
  },
  
  getActiveTaxRules: () => {
    console.log('📋 Fetching active tax rules');
    return apiClient.get('/api/rules/tax-rules/active').then(response => {
      console.log('📋 Active tax rules response:', response.data);
      return response;
    });
  },
  
  applySummerDistribution: (data) => {
    console.log('📋 Applying summer distribution:', data);
    return apiClient.post('/api/rules/apply-summer-distribution', data).then(response => {
      console.log('📋 Apply summer distribution response:', response.data);
      return response;
    });
  },
  
  clearCache: () => {
    console.log('📋 Clearing cache');
    return apiClient.post('/api/rules/cache/clear').then(response => {
      console.log('📋 Clear cache response:', response.data);
      return response;
    });
  }
};

// Remove the duplicate default export
// export default rulesAPI;