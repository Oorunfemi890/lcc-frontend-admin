import { apiClient } from './apiClient';

export const settingsAPI = {
    // Get all settings
    getSettings: async () => {
        try {
            const response = await apiClient.get('/settings');
            return {
                success: true,
                data: response.data.data,
                message: response.data.message
            };
        } catch (error) {
            console.error('Get settings error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch settings',
                error: error
            };
        }
    },

    // Update settings (bulk or single)
    // settingsObj: { "key": "value", ... }
    updateSettings: async (settingsObj) => {
        try {
            const response = await apiClient.put('/settings', settingsObj);
            return {
                success: true,
                message: response.data.message
            };
        } catch (error) {
            console.error('Update settings error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to update settings',
                error: error
            };
        }
    },

    // Create new setting
    createSetting: async (data) => {
        try {
            const response = await apiClient.post('/settings', data);
            return {
                success: true,
                message: response.data.message,
                data: response.data.data
            };
        } catch (error) {
            console.error('Create setting error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to create setting',
                error: error
            };
        }
    },

    // Patch existing setting
    patchSetting: async (key, data) => {
        try {
            const response = await apiClient.patch(`/settings/${key}`, data);
            return {
                success: true,
                message: response.data.message,
                data: response.data.data
            };
        } catch (error) {
            console.error('Patch setting error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to update setting',
                error: error
            };
        }
    }
};
