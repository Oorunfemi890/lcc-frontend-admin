import React, { useState, useEffect } from 'react';
import { settingsAPI } from '@/Services/settingsAPI';
import { toast } from 'react-toastify';
import { useAuth } from '@/contexts/AuthContext';

const Settings = () => {
    const { admin } = useAuth();
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Permisson check variables
    const isAdmin = ['admin', 'super_admin'].includes(admin?.role?.toLowerCase());

    // Define known settings categories
    const notificationSettings = [
        { key: 'sms', label: 'SMS Notifications', icon: 'ri-message-2-line', description: 'Enable sending SMS for follow-ups and announcements' },
        { key: 'whatsapp', label: 'WhatsApp Notifications', icon: 'ri-whatsapp-line', description: 'Enable sending WhatsApp messages via API' },
        { key: 'voice_call', label: 'Voice Calls', icon: 'ri-phone-line', description: 'Enable automated voice calls' },
        { key: 'email', label: 'Email Notifications', icon: 'ri-mail-line', description: 'Enable sending email notifications' },
    ];

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

    const handleToggle = async (key, currentValue) => {
        // Optimistic update
        const newValue = currentValue === 'true' ? 'false' : 'true';

        setSettings(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                value: newValue
            }
        }));

        // API call using patchSetting
        const response = await settingsAPI.patchSetting(key, newValue);

        if (response.success) {
            toast.success('Setting updated');
        } else {
            // Revert on failure
            setSettings(prev => ({
                ...prev,
                [key]: {
                    ...prev[key],
                    value: currentValue
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

            {/* Notification Channels Section */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                        <i className="ri-notification-3-line mr-2 text-indigo-500"></i>
                        Notification Channels
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        Control which communication channels are active. Disabling a channel prevents cost accrual.
                    </p>
                </div>
                <ul className="divide-y divide-gray-200">
                    {notificationSettings.map((item) => {
                        const isEnabled = settings[item.key]?.value === 'true';

                        return (
                            <li key={item.key} className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex-shrink-0">
                                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${isEnabled ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
                                                <i className={`${item.icon} text-xl`}></i>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{item.label}</p>
                                            <p className="text-sm text-gray-500">{item.description}</p>
                                        </div>
                                    </div>
                                    <div>
                                        {/* Toggle Switch */}
                                        <button
                                            onClick={() => handleToggle(item.key, settings[item.key]?.value)}
                                            type="button"
                                            className={`${isEnabled ? 'bg-indigo-600' : 'bg-gray-200'
                                                } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                                            role="switch"
                                            aria-checked={isEnabled}
                                        >
                                            <span className="sr-only">Use setting</span>
                                            <span
                                                aria-hidden="true"
                                                className={`${isEnabled ? 'translate-x-5' : 'translate-x-0'
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

            {/* Future sections can be added here */}
        </div>
    );
};

export default Settings;
