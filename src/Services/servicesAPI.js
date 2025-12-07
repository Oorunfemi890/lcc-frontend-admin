import { apiClient } from './apiClient';

export const servicesAPI = {
    // Get all services
    getAll: async (filters = {}) => {
        try {
            const response = await apiClient.get('/service', { params: filters });
            return {
                success: true,
                data: response.data.data,
                message: 'Services retrieved successfully'
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch services'
            };
        }
    },

    // Get service by ID
    getById: async (id) => {
        try {
            const response = await apiClient.get(`/service/${id}`);
            return {
                success: true,
                data: response.data.data,
                message: 'Service details retrieved successfully'
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch service details'
            };
        }
    },

    // Add new service
    create: async (data) => {
        try {
            const response = await apiClient.post('/service', data);
            return {
                success: true,
                data: response.data.data,
                message: 'Service added successfully'
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to add service'
            };
        }
    },

    // Update service
    update: async (id, data) => {
        try {
            const response = await apiClient.put(`/service/${id}`, data);
            return {
                success: true,
                data: response.data.data,
                message: 'Service updated successfully'
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to update service'
            };
        }
    },

    // Delete service
    delete: async (id) => {
        try {
            await apiClient.delete(`/service/${id}`);
            return {
                success: true,
                message: 'Service deleted successfully'
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to delete service'
            };
        }
    },

    // Group by day
    groupByDay: async () => {
        try {
            const response = await apiClient.get('/service/group-by-day');
            return {
                success: true,
                data: response.data.data,
                message: 'Services grouped by day retrieved successfully'
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch grouped services'
            };
        }
    }
};
