import React, { useState, useEffect } from 'react';
import { adminAPI } from '@/Services/adminAPI';
import { membersAPI } from '@/Services/membersAPI';
import { toast } from 'react-toastify';
import { useAuth } from '@/contexts/AuthContext';

const AdminManagement = () => {
    const { admin } = useAuth();
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getAdmins({ page: 1, limit: 100 });
            if (response.success) {
                setAdmins(response.data);
            }
        } catch (error) {
            console.error('Error fetching admins:', error);
            toast.error('Failed to load admins');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <span className="ml-3 text-gray-600">Loading admins...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Admin Management</h1>
                    <p className="text-gray-600 mt-1">Manage admin users and their permissions</p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {admins.map((adminUser) => (
                                <tr key={adminUser.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{adminUser.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{adminUser.role}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${adminUser.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {adminUser.active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminManagement;
