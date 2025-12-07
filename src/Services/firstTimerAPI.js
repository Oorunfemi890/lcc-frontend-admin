import { apiClient } from './apiClient';

export const firstTimerAPI = {
    // Get all first timers
    getAll: async (filters = {}) => {
        try {
            const response = await apiClient.get('/firsttimer', { params: filters });
            return {
                success: true,
                data: response.data.data,
                message: 'First timers retrieved successfully'
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch first timers'
            };
        }
    },

    // Get first timer by ID
    getById: async (id) => {
        try {
            const response = await apiClient.get(`/firsttimer/${id}`);
            return {
                success: true,
                data: response.data.data,
                message: 'First timer details retrieved successfully'
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch first timer details'
            };
        }
    },

    // Add new first timer
    create: async (data) => {
        try {
            const response = await apiClient.post('/firsttimer', data);
            return {
                success: true,
                data: response.data.data,
                message: 'First timer added successfully'
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to add first timer'
            };
        }
    },

    // Update first timer
    update: async (id, data) => {
        try {
            const response = await apiClient.put(`/firsttimer/${id}`, data);
            return {
                success: true,
                data: response.data.data,
                message: 'First timer updated successfully'
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to update first timer'
            };
        }
    },

    // Delete first timer
    delete: async (id) => {
        try {
            await apiClient.delete(`/firsttimer/${id}`);
            return {
                success: true,
                message: 'First timer deleted successfully'
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to delete first timer'
            };
        }
    }
};
