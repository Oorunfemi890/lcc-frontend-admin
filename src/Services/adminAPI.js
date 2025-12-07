// src/Services/adminAPI.js
import { apiClient } from './apiClient';

export const adminAPI = {
    // Get all admin users with filtering
    getAdmins: async (filters = {}) => {
        try {
            const queryParams = new URLSearchParams();

            if (filters.page) queryParams.append('page', filters.page);
            if (filters.limit) queryParams.append('limit', filters.limit);
            if (filters.role) queryParams.append('role', filters.role);
            if (filters.active !== undefined) queryParams.append('active', filters.active);
            if (filters.search) queryParams.append('search', filters.search);

            const response = await apiClient.get(`/admin/users?${queryParams.toString()}`);

            return {
                success: true,
                data: response.data.data,
                pagination: response.data.pagination,
                message: response.data.message || 'Admins retrieved successfully'
            };
        } catch (error) {
            console.error('Get admins error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch admins',
                error: error.response?.data
            };
        }
    },

    // Create new admin
    createAdmin: async (adminData) => {
        try {
            const response = await apiClient.post('/admin/users', adminData);

            return {
                success: true,
                data: response.data.data,
                message: response.data.message || 'Admin created successfully'
            };
        } catch (error) {
            console.error('Create admin error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to create admin',
                errors: error.response?.data?.errors
            };
        }
    },

    // Update admin
    updateAdmin: async (id, adminData) => {
        try {
            const response = await apiClient.put(`/admin/users/${id}`, adminData);

            return {
                success: true,
                data: response.data.data,
                message: response.data.message || 'Admin updated successfully'
            };
        } catch (error) {
            console.error('Update admin error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to update admin',
                errors: error.response?.data?.errors
            };
        }
    },

    // Block/unblock admin
    blockAdmin: async (id, blocked) => {
        try {
            const response = await apiClient.patch(`/admin/users/${id}/block`, { blocked });

            return {
                success: true,
                data: response.data.data,
                message: response.data.message || `Admin ${blocked ? 'blocked' : 'unblocked'} successfully`
            };
        } catch (error) {
            console.error('Block admin error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to block/unblock admin'
            };
        }
    },

    // Reset admin password
    resetAdminPassword: async (id) => {
        try {
            const response = await apiClient.post(`/admin/users/${id}/reset-password`);

            return {
                success: true,
                data: response.data.data,
                message: response.data.message || 'Password reset successfully'
            };
        } catch (error) {
            console.error('Reset password error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to reset password'
            };
        }
    },

    // Delete admin
    deleteAdmin: async (id) => {
        try {
            const response = await apiClient.delete(`/admin/users/${id}`);

            return {
                success: true,
                message: response.data.message || 'Admin deleted successfully'
            };
        } catch (error) {
            console.error('Delete admin error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to delete admin'
            };
        }
    }
};
