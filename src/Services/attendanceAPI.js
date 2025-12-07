import { apiClient } from './apiClient';

export const attendanceAPI = {
  // Create new attendance record
  create: async (data) => {
    try {
      const response = await apiClient.post('/attendance', data);
      return { success: true, data: response.data?.data, message: response.data?.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create attendance record'
      };
    }
  },

  // Get all attendance records
  getAll: async (params = {}) => {
    try {
      const response = await apiClient.get('/attendance', { params });
      // Ensure we handle the data structure correctly (pagination is separate from data)
      const rows = response.data?.data || [];
      const pagination = response.data?.pagination || {};
      return {
        success: true,
        data: rows,
        pagination,
        message: response.data?.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch attendance records'
      };
    }
  },

  // Get single attendance record
  getById: async (id) => {
    try {
      const response = await apiClient.get(`/attendance/${id}`);
      return { success: true, data: response.data?.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch attendance record'
      };
    }
  },

  // Update attendance record
  update: async (id, data) => {
    try {
      const response = await apiClient.put(`/attendance/${id}`, data);
      return { success: true, data: response.data?.data, message: response.data?.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update attendance record'
      };
    }
  },

  // Delete attendance record
  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/attendance/${id}`);
      return { success: true, message: response.data?.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete attendance record'
      };
    }
  },

  // Get attendance statistics
  getAttendanceStats: async () => {
    try {
      const response = await apiClient.get('/attendance/stats');
      return { success: true, data: response.data?.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch attendance statistics'
      };
    }
  }
};