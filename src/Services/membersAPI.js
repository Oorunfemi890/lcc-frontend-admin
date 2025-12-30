// src/Services/membersAPI.js - Production Ready
import { apiClient } from './apiClient';

export const membersAPI = {
  // Get all members
  getMembers: async (filters = {}) => {
    try {
      const response = await apiClient.get('/member', { params: filters });
      return {
        success: true,
        data: response.data.data,
        message: 'Members retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch members'
      };
    }
  },

  // Get member by ID
  getMemberById: async (id) => {
    try {
      const response = await apiClient.get(`/member/${id}`);
      return {
        success: true,
        data: response.data.data,
        message: 'Member details retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch member details'
      };
    }
  },

  // Add new member
  addMember: async (memberData) => {
    try {
      const response = await apiClient.post('/member', memberData);
      return {
        success: true,
        data: response.data.data,
        message: 'Member added successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to add member'
      };
    }
  },

  // Update member
  updateMember: async (id, memberData) => {
    try {
      const response = await apiClient.put(`/member/${id}`, memberData);
      return {
        success: true,
        data: response.data.data,
        message: 'Member updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update member'
      };
    }
  },

  // Block member (for block button - sets blockReason)
  blockMember: async (id, reason = 'Blocked by admin') => {
    try {
      const response = await apiClient.patch(`/member/${id}/block`, { reason });
      return {
        success: true,
        data: response.data.data,
        message: 'Member blocked successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to block member'
      };
    }
  },

  // Unblock member (clears blockReason)
  unblockMember: async (id) => {
    try {
      const response = await apiClient.patch(`/member/${id}/unblock`);
      return {
        success: true,
        data: response.data.data,
        message: 'Member unblocked successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to unblock member'
      };
    }
  },

  // Activate member (for status toggle - just sets active=true)
  activateMember: async (id) => {
    try {
      const response = await apiClient.patch(`/member/${id}/activate`);
      return {
        success: true,
        data: response.data.data,
        message: 'Member activated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to activate member'
      };
    }
  },

  // Deactivate member (for status toggle - just sets active=false)
  deactivateMember: async (id) => {
    try {
      const response = await apiClient.patch(`/member/${id}/deactivate`);
      return {
        success: true,
        data: response.data.data,
        message: 'Member deactivated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to deactivate member'
      };
    }
  },

  // Delete member (soft delete - set inactive)
  deleteMember: async (id) => {
    try {
      await apiClient.delete(`/member/${id}`);
      return {
        success: true,
        message: 'Member deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete member'
      };
    }
  },

  // Get member statistics
  getMemberStats: async () => {
    try {
      const response = await apiClient.get('/member/stats');
      return {
        success: true,
        data: response.data.data,
        message: 'Member statistics retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch member statistics'
      };
    }
  },

  // Search members
  searchMembers: async (query) => {
    try {
      const response = await apiClient.get(`/member/search?q=${encodeURIComponent(query)}`);
      return {
        success: true,
        data: response.data.data,
        message: `Found ${response.data.data.length} members`
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to search members'
      };
    }
  },

  // Get departments list
  getDepartments: async () => {
    try {
      const response = await apiClient.get('/member/departments');
      return {
        success: true,
        data: response.data.data,
        message: 'Departments retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch departments'
      };
    }
  },

  // Import members from CSV/Excel
  importMembers: async (file, onProgress = null) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post('/member/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      });

      return {
        success: true,
        data: response.data.data,
        message: 'Members imported successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to import members'
      };
    }
  },

  // Export members to CSV/Excel
  exportMembers: async (format = 'csv', filters = {}) => {
    try {
      const response = await apiClient.get('/member/export', {
        params: { format, ...filters },
        responseType: 'blob',
      });

      const filename = `members_export_${new Date().toISOString().split('T')[0]}.${format}`;
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return {
        success: true,
        data: { filename },
        message: 'Members exported successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to export members'
      };
    }
  }
};