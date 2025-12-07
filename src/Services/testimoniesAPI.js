import { apiClient } from './apiClient';

export const testimoniesAPI = {
    // Get all testimonies
    getAll: async (filters = {}) => {
        try {
            const response = await apiClient.get('/testimony', { params: filters });
            return {
                success: true,
                data: response.data.data,
                message: 'Testimonies retrieved successfully'
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch testimonies'
            };
        }
    },

    // Get testimony by ID
    getById: async (id) => {
        try {
            const response = await apiClient.get(`/testimony/${id}`);
            return {
                success: true,
                data: response.data.data,
                message: 'Testimony details retrieved successfully'
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch testimony details'
            };
        }
    },

    // Add new testimony
    create: async (data) => {
        try {
            const response = await apiClient.post('/testimony', data);
            return {
                success: true,
                data: response.data.data,
                message: 'Testimony added successfully'
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to add testimony'
            };
        }
    },

    // Update testimony
    update: async (id, data) => {
        try {
            const response = await apiClient.put(`/testimony/${id}`, data);
            return {
                success: true,
                data: response.data.data,
                message: 'Testimony updated successfully'
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to update testimony'
            };
        }
    },

    // Delete testimony - note: Route might not exist or be different?
    // Checking routes/testimony.route.js: Only POST, GET, PUT. No DELETE route defined in the file I viewed. 
    // I will omit delete for now or implement it optimistically if it wasn't shown in the truncated view, 
    // but looking back at my `view_file` for `testimony.route.js`, it ended at line 85 without a delete route.
    // I will mark it as unavailable/error for now or just skip it.

    /* 
    delete: async (id) => { ... } // Not implemented in backend yet based on file view
    */
};
