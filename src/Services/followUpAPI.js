import { apiClient } from './apiClient';

export const followUpAPI = {
    // Get all follow ups
    getAll: async (filters = {}) => {
        try {
            const response = await apiClient.get('/followup', { params: filters });
            return {
                success: true,
                data: response.data.data,
                message: 'Follow-up records retrieved successfully'
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch follow-up records'
            };
        }
    },

    // Get follow up by ID
    getById: async (id) => {
        try {
            const response = await apiClient.get(`/followup/${id}`);
            return {
                success: true,
                data: response.data.data,
                message: 'Follow-up details retrieved successfully'
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch follow-up details'
            };
        }
    },

    // Add new follow up
    create: async (data) => {
        try {
            const response = await apiClient.post('/followup', data);
            return {
                success: true,
                data: response.data.data,
                message: 'Follow-up record added successfully'
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to add follow-up record'
            };
        }
    },

    // Update follow up
    update: async (id, data) => {
        try {
            const response = await apiClient.put(`/followup/${id}`, data);
            return {
                success: true,
                data: response.data.data,
                message: 'Follow-up updated successfully'
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to update follow-up record'
            };
        }
    },

    // Delete follow up
    delete: async (id) => {
        try {
            await apiClient.delete(`/followup/${id}`);
            return {
                success: true,
                message: 'Follow-up deleted successfully'
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to delete follow-up record'
            };
        }
    }
};
