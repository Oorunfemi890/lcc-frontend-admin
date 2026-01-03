import React, { useState, useEffect } from 'react';
import { settingsAPI } from '@/Services/settingsAPI';
import { toast } from 'react-toastify';
import { useAuth } from '@/contexts/AuthContext';

const Settings = () => {
    const { admin } = useAuth();
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);

    // Permisson check variables
    const isAdmin = ['admin', 'super_admin'].includes(admin?.role?.toLowerCase());

    // Define known settings metadata for better UI
    // Helper to get metadata dynamically based on the key name
    const getMetadata = (key) => {
        // Format Label: 'some_key_name' -> 'Some Key Name'
        const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

        // Determine Icon based on keywords in the key
        let icon = 'ri-settings-3-line'; // Default
        const lowerKey = key.toLowerCase();

        if (lowerKey.includes('sms') || lowerKey.includes('message')) icon = 'ri-message-2-line';
        else if (lowerKey.includes('whatsapp')) icon = 'ri-whatsapp-line';
        else if (lowerKey.includes('mail') || lowerKey.includes('smtp')) icon = 'ri-mail-line';
        else if (lowerKey.includes('call') || lowerKey.includes('phone')) icon = 'ri-phone-line';
        else if (lowerKey.includes('server') || lowerKey.includes('db') || lowerKey.includes('host')) icon = 'ri-server-line';
        else if (lowerKey.includes('user') || lowerKey.includes('account')) icon = 'ri-user-settings-line';
        else if (lowerKey.includes('pay') || lowerKey.includes('money')) icon = 'ri-money-dollar-circle-line';
        else if (lowerKey.includes('security') || lowerKey.includes('auth')) icon = 'ri-shield-check-line';
        else if (lowerKey.includes('notif')) icon = 'ri-notification-3-line';

        return { label, icon };
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        const response = await settingsAPI.getSettings();
        if (response.success) {
            setSettings(response.data);
        } else {
            toast.error(response.message);
        }
        setLoading(false);
    };

    const handleToggle = async (key, currentActive) => {
        // Optimistic update
        const newActive = !currentActive;

        setSettings(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                active: newActive
            }
        }));

        // API call using patchSetting
        const response = await settingsAPI.patchSetting(key, { active: newActive });

        if (response.success) {
            toast.success('Setting updated');
        } else {
            // Revert on failure
            setSettings(prev => ({
                ...prev,
                [key]: {
                    ...prev[key],
                    active: currentActive
                }
            }));
            toast.error('Failed to update setting');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="text-center py-10">
                <h2 className="text-xl font-semibold text-gray-700">Access Denied</h2>
                <p className="text-gray-500 mt-2">You do not have permission to view this page.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage application configuration and preferences
                    </p>
                </div>
            </div>

            {/* Dynamic Settings List */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                        <i className="ri-sound-module-line mr-2 text-indigo-500"></i>
                        Application Configuration
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        Toggle features on or off. Values are displayed for reference.
                    </p>
                </div>
                <ul className="divide-y divide-gray-200">
                    {Object.keys(settings).sort().map((key) => {
                        const setting = settings[key];
                        const { label, icon } = getMetadata(key);
                        const isActive = setting.active === true; // Ensure boolean

                        return (
                            <li key={key} className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex-shrink-0">
                                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${isActive ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
                                                <i className={`${icon} text-xl`}></i>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{label}</p>
                                            <p className="text-sm text-gray-500">{setting.description}</p>
                                            {/* Display Value */}
                                            <div className="mt-1 flex items-center text-xs text-gray-400">
                                                <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">
                                                    Config: {String(setting.value)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        {/* Toggle Switch */}
                                        <button
                                            onClick={() => handleToggle(key, isActive)}
                                            type="button"
                                            className={`${isActive ? 'bg-indigo-600' : 'bg-gray-200'
                                                } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                                            role="switch"
                                            aria-checked={isActive}
                                        >
                                            <span className="sr-only">Use setting</span>
                                            <span
                                                aria-hidden="true"
                                                className={`${isActive ? 'translate-x-5' : 'translate-x-0'
                                                    } pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                                            />
                                        </button>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
};

export default Settings;
