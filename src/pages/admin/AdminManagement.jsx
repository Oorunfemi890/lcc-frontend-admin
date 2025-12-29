import React, { useState, useEffect } from 'react';
import { adminAPI } from '@/Services/adminAPI';
import { membersAPI } from '@/Services/membersAPI';
import { toast } from 'react-toastify';
import { useAuth } from '@/contexts/AuthContext';
import ConfirmDialog from '@/components/ConfirmDialog';

const AdminManagement = () => {
    const { admin } = useAuth();
    const [admins, setAdmins] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);

    // Form data for creating/editing admin
    const [formData, setFormData] = useState({
        memberId: '',
        role: 'VIEWER',
        active: true
    });

    // Role-based permissions
    const canCreate = ['SUPER_ADMIN', 'ADMIN'].includes(admin?.role);
    const canEditRole = (targetRole) => {
        if (admin?.role === 'SUPER_ADMIN') return true;
        if (admin?.role === 'ADMIN') {
            return ['EDITOR', 'VIEWER'].includes(targetRole);
        }
        return false;
    };
    const canDelete = admin?.role === 'SUPER_ADMIN';
    const canBlock = admin?.role === 'SUPER_ADMIN';
    const canResetPassword = (targetRole) => {
        if (admin?.role === 'SUPER_ADMIN') return true;
        if (admin?.role === 'ADMIN') {
            return ['EDITOR', 'VIEWER'].includes(targetRole);
        }
        return false;
    };

    useEffect(() => {
        fetchAdmins();
        fetchMembers();
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

    const fetchMembers = async () => {
        try {
            const response = await membersAPI.getMembers();
            if (response.success && Array.isArray(response.data)) {
                setMembers(response.data);
            }
        } catch (error) {
            console.error('Error fetching members:', error);
        }
    };

    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        try {
            const response = await adminAPI.createAdmin({
                memberId: formData.memberId,
                role: formData.role
            });
            if (response.success) {
                toast.success(response.message || 'Admin created successfully. Credentials sent via email and WhatsApp.');
                setShowCreateModal(false);
                resetForm();
                fetchAdmins();
            } else {
                toast.error(response.message || 'Failed to create admin');
            }
        } catch (error) {
            toast.error('Failed to create admin');
        }
    };

    const handleEditAdmin = async (e) => {
        e.preventDefault();
        try {
            const response = await adminAPI.updateAdmin(selectedAdmin.id, {
                email: formData.email,
                role: formData.role,
                active: formData.active
            });
            if (response.success) {
                toast.success('Admin updated successfully');
                setShowEditModal(false);
                resetForm();
                fetchAdmins();
            } else {
                toast.error(response.message || 'Failed to update admin');
            }
        } catch (error) {
            toast.error('Failed to update admin');
        }
    };

    const handleToggleActive = async (adminUser) => {
        setConfirmAction({
            type: 'toggle',
            admin: adminUser,
            action: async () => {
                try {
                    const response = await adminAPI.blockAdmin(adminUser.id, adminUser.active);
                    if (response.success) {
                        toast.success(`Admin ${adminUser.active ? 'deactivated' : 'activated'} successfully`);
                        fetchAdmins();
                    } else {
                        toast.error(response.message);
                    }
                } catch (error) {
                    toast.error('Failed to update admin status');
                }
            }
        });
        setShowConfirmDialog(true);
    };

    const handleResetPassword = async (adminUser) => {
        setConfirmAction({
            type: 'reset',
            admin: adminUser,
            action: async () => {
                try {
                    const response = await adminAPI.resetAdminPassword(adminUser.id);
                    if (response.success) {
                        toast.success('Password reset successfully. New password: ' + response.data.temporaryPassword);
                    } else {
                        toast.error(response.message);
                    }
                } catch (error) {
                    toast.error('Failed to reset password');
                }
            }
        });
        setShowConfirmDialog(true);
    };

    const handleDeleteAdmin = async (adminUser) => {
        setConfirmAction({
            type: 'delete',
            admin: adminUser,
            action: async () => {
                try {
                    const response = await adminAPI.deleteAdmin(adminUser.id);
                    if (response.success) {
                        toast.success('Admin deleted successfully');
                        fetchAdmins();
                    } else {
                        toast.error(response.message);
                    }
                } catch (error) {
                    toast.error('Failed to delete admin');
                }
            }
        });
        setShowConfirmDialog(true);
    };

    const openEditModal = (adminUser) => {
        setSelectedAdmin(adminUser);
        setFormData({
            email: adminUser.email,
            role: adminUser.role,
            active: adminUser.active
        });
        setShowEditModal(true);
    };

    const resetForm = () => {
        setFormData({
            memberId: '',
            role: 'VIEWER',
            active: true
        });
        setSelectedAdmin(null);
    };

    const getConfirmMessage = () => {
        if (!confirmAction) return '';
        switch (confirmAction.type) {
            case 'toggle':
                return `Are you sure you want to ${confirmAction.admin.active ? 'deactivate' : 'activate'} ${confirmAction.admin.email}?`;
            case 'reset':
                return `Are you sure you want to reset the password for ${confirmAction.admin.email}? A new temporary password will be generated.`;
            case 'delete':
                return `Are you sure you want to delete ${confirmAction.admin.email}? This action cannot be undone.`;
            default:
                return '';
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
                {canCreate && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <i className="ri-add-line mr-2"></i>
                        Add Admin
                    </button>
                )}
            </div>

            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {admins.map((adminUser) => (
                                <tr key={adminUser.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{adminUser.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {adminUser.member ? `${adminUser.member.firstName} ${adminUser.member.lastName}` : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${adminUser.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' :
                                            adminUser.role === 'ADMIN' ? 'bg-blue-100 text-blue-800' :
                                                adminUser.role === 'EDITOR' ? 'bg-green-100 text-green-800' :
                                                    'bg-gray-100 text-gray-800'
                                            }`}>
                                            {adminUser.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${adminUser.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {adminUser.active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-2">
                                            {canEditRole(adminUser.role) && (
                                                <button
                                                    onClick={() => openEditModal(adminUser)}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                    title="Edit"
                                                >
                                                    <i className="ri-edit-line text-lg"></i>
                                                </button>
                                            )}
                                            {canBlock && adminUser.id !== admin.id && (
                                                <button
                                                    onClick={() => handleToggleActive(adminUser)}
                                                    className={`${adminUser.active ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'}`}
                                                    title={adminUser.active ? 'Deactivate' : 'Activate'}
                                                >
                                                    <i className={`ri-${adminUser.active ? 'lock' : 'lock-unlock'}-line text-lg`}></i>
                                                </button>
                                            )}
                                            {canResetPassword(adminUser.role) && adminUser.id !== admin.id && (
                                                <button
                                                    onClick={() => handleResetPassword(adminUser)}
                                                    className="text-indigo-600 hover:text-blue-900"
                                                    title="Reset Password"
                                                >
                                                    <i className="ri-key-line text-lg"></i>
                                                </button>
                                            )}
                                            {canDelete && adminUser.id !== admin.id && (
                                                <button
                                                    onClick={() => handleDeleteAdmin(adminUser)}
                                                    className="text-red-600 hover:text-red-900"
                                                    title="Delete"
                                                >
                                                    <i className="ri-delete-bin-line text-lg"></i>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Admin Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Create New Admin</h3>
                            <button onClick={() => { setShowCreateModal(false); resetForm(); }} className="text-gray-400 hover:text-gray-600">
                                <i className="ri-close-line text-xl"></i>
                            </button>
                        </div>
                        <form onSubmit={handleCreateAdmin} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Member <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.memberId}
                                    onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">Select Member</option>
                                    {members.map(member => (
                                        <option key={member.id} value={member.id}>
                                            {member.firstName} {member.lastName} - {member.email}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                <div className="flex items-start">
                                    <i className="ri-information-line text-indigo-600 text-xl mr-3 mt-0.5"></i>
                                    <div className="text-sm text-blue-800">
                                        <p className="font-semibold mb-1">Auto-Generated Credentials</p>
                                        <p>The system will automatically use the member's email and generate a secure password. Credentials will be sent to the member via email and WhatsApp.</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Role <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    {admin?.role === 'SUPER_ADMIN' && <option value="SUPER_ADMIN">Super Admin</option>}
                                    {admin?.role === 'SUPER_ADMIN' && <option value="ADMIN">Admin</option>}
                                    <option value="EDITOR">Editor</option>
                                    <option value="VIEWER">Viewer</option>
                                </select>
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => { setShowCreateModal(false); resetForm(); }}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                >
                                    Create Admin
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Admin Modal */}
            {showEditModal && selectedAdmin && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Edit Admin</h3>
                            <button onClick={() => { setShowEditModal(false); resetForm(); }} className="text-gray-400 hover:text-gray-600">
                                <i className="ri-close-line text-xl"></i>
                            </button>
                        </div>
                        <form onSubmit={handleEditAdmin} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Role <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    {admin?.role === 'SUPER_ADMIN' && <option value="SUPER_ADMIN">Super Admin</option>}
                                    {admin?.role === 'SUPER_ADMIN' && <option value="ADMIN">Admin</option>}
                                    <option value="EDITOR">Editor</option>
                                    <option value="VIEWER">Viewer</option>
                                </select>
                            </div>

                            <div>
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.active}
                                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                        className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Active</span>
                                </label>
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => { setShowEditModal(false); resetForm(); }}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                >
                                    Update Admin
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmDialog
                isOpen={showConfirmDialog}
                onClose={() => setShowConfirmDialog(false)}
                onConfirm={async () => {
                    if (confirmAction?.action) {
                        await confirmAction.action();
                    }
                    setConfirmAction(null);
                }}
                title={confirmAction?.type === 'delete' ? 'Delete Admin' : confirmAction?.type === 'reset' ? 'Reset Password' : 'Toggle Admin Status'}
                message={getConfirmMessage()}
            />
        </div>
    );
};

export default AdminManagement;
