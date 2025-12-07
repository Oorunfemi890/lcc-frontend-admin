import React, { useState, useEffect } from 'react';
import { followUpAPI } from '@/Services/followUpAPI';
import { firstTimerAPI } from '@/Services/firstTimerAPI';
import { membersAPI } from '@/Services/membersAPI';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';
import ConfirmDialog from '@/components/ConfirmDialog';

const FollowUpManagement = () => {
    const { admin } = useAuth();
    const [followUps, setFollowUps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Modal and form state
    const [showModal, setShowModal] = useState(false);
    const [firstTimers, setFirstTimers] = useState([]);
    const [members, setMembers] = useState([]);
    const [formData, setFormData] = useState({
        firstTimerId: '',
        assignedToMemberId: '',
        followUpType: 'phone_call',
        scheduledDate: new Date().toISOString().split('T')[0],
        notes: ''
    });

    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedFollowUp, setSelectedFollowUp] = useState(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [followUpToDelete, setFollowUpToDelete] = useState(null);

    // Role-based permissions
    const canView = true; // All roles can view
    const canEdit = ['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(admin?.role);
    const canDelete = admin?.role === 'SUPER_ADMIN';
    const canCreate = ['SUPER_ADMIN', 'ADMIN'].includes(admin?.role);

    useEffect(() => {
        fetchFollowUps();
        fetchFirstTimers();
        fetchMembers();
    }, []);

    const fetchFollowUps = async () => {
        try {
            setLoading(true);
            const response = await followUpAPI.getAll();
            if (response.success && Array.isArray(response.data)) {
                setFollowUps(response.data);
            } else {
                setFollowUps([]);
            }
        } catch (error) {
            console.error('Error fetching follow ups:', error);
            toast.error('Failed to load follow up records');
        } finally {
            setLoading(false);
        }
    };

    const fetchFirstTimers = async () => {
        try {
            const response = await firstTimerAPI.getAll();
            if (response.success && Array.isArray(response.data)) {
                setFirstTimers(response.data);
            }
        } catch (error) {
            console.error('Error fetching first timers:', error);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await followUpAPI.create(formData);
            if (response.success) {
                toast.success('Follow-up created successfully');
                setShowModal(false);
                setFormData({
                    firstTimerId: '',
                    assignedToMemberId: '',
                    followUpType: 'phone_call',
                    scheduledDate: new Date().toISOString().split('T')[0],
                    notes: ''
                });
                fetchFollowUps();
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            toast.error('Failed to create follow-up');
        }
    };

    const handleDelete = (id) => {
        setFollowUpToDelete(id);
        setShowConfirmDialog(true);
    };

    const confirmDelete = async () => {
        if (!followUpToDelete) return;
        try {
            const response = await followUpAPI.delete(followUpToDelete);
            if (response.success) {
                toast.success('Follow up record deleted successfully');
                fetchFollowUps();
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            toast.error('Failed to delete record');
        } finally {
            setFollowUpToDelete(null);
        }
    };

    const handleView = (followUp) => {
        setSelectedFollowUp(followUp);
        setShowViewModal(true);
    };

    // Client-side filtering
    const filteredItems = followUps.filter(item => {
        const searchLower = searchTerm.toLowerCase();
        const noteMatch = item.notes && item.notes.toLowerCase().includes(searchLower);
        const typeMatch = item.followUpType && item.followUpType.toLowerCase().includes(searchLower);
        return noteMatch || typeMatch;
    });

    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <span className="ml-3 text-gray-600">Loading follow ups...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Follow Up</h1>
                    <p className="text-gray-600 mt-1">Track member follow-up activities</p>
                </div>
                {canCreate && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <i className="ri-add-line mr-2"></i>
                        Add Follow-Up
                    </button>
                )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search notes or type..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <i className="ri-search-line absolute left-3 top-3 text-gray-400"></i>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {paginatedItems.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatDate(item.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <span className="capitalize">{item.followUpType}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${item.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {item.status || 'Pending'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                onClick={() => handleView(item)}
                                                className="text-gray-500 hover:text-gray-700"
                                                title="View"
                                            >
                                                <i className="ri-eye-line text-lg"></i>
                                            </button>
                                            {canEdit && (
                                                <button className="text-indigo-600 hover:text-indigo-900" title="Edit">
                                                    <i className="ri-edit-line text-lg"></i>
                                                </button>
                                            )}
                                            {canDelete && (
                                                <button
                                                    onClick={() => handleDelete(item.id)}
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
                            {paginatedItems.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                        No records found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {totalPages > 1 && (
                    <div className="bg-white px-4 py-3 border-t border-gray-200 flex items-center justify-between sm:px-6">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">Previous</button>
                            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">Next</button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div className="text-sm text-gray-700">Page {currentPage} of {totalPages}</div>
                            <div>
                                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"><i className="ri-arrow-left-s-line"></i></button>
                                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"><i className="ri-arrow-right-s-line"></i></button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Follow-Up Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Create Follow-Up</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <i className="ri-close-line text-xl"></i>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    First Timer <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.firstTimerId}
                                    onChange={(e) => setFormData({ ...formData, firstTimerId: e.target.value })}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">Select First Timer</option>
                                    {firstTimers.map(ft => (
                                        <option key={ft.id} value={ft.id}>
                                            {ft.firstName} {ft.lastName} - {ft.phoneNumber}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Assign To (Worker)
                                </label>
                                <select
                                    value={formData.assignedToMemberId}
                                    onChange={(e) => setFormData({ ...formData, assignedToMemberId: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">Select Worker (Optional)</option>
                                    {members.map(member => (
                                        <option key={member.id} value={member.id}>
                                            {member.firstName} {member.lastName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Follow-Up Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.followUpType}
                                    onChange={(e) => setFormData({ ...formData, followUpType: e.target.value })}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="phone_call">Phone Call</option>
                                    <option value="home_visit">Home Visit</option>
                                    <option value="church_visit">Church Visit</option>
                                    <option value="whatsapp">WhatsApp</option>
                                    <option value="email">Email</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Scheduled Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={formData.scheduledDate}
                                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    rows="3"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Add any notes about this follow-up..."
                                ></textarea>
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                >
                                    Create Follow-Up
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Follow-Up Modal */}
            {showViewModal && selectedFollowUp && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Follow-Up Details</h3>
                            <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-600">
                                <i className="ri-close-line text-xl"></i>
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2 border-b pb-3 mb-2">
                                <h4 className="text-md font-semibold text-gray-800">Follow-Up Information</h4>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">First-Timer</label>
                                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                                    {selectedFollowUp.FirstTimer ? `${selectedFollowUp.FirstTimer.surname} ${selectedFollowUp.FirstTimer.otherNames}` : 'N/A'}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                                    {selectedFollowUp.AssignedMember ? `${selectedFollowUp.AssignedMember.firstName} ${selectedFollowUp.AssignedMember.lastName}` : 'N/A'}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Follow-Up Type</label>
                                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg capitalize">{selectedFollowUp.followUpType?.replace('_', ' ')}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <p className="text-sm"><span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${selectedFollowUp.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{selectedFollowUp.status || 'Pending'}</span></p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date</label>
                                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                                    {selectedFollowUp.scheduledDate ? new Date(selectedFollowUp.scheduledDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Completed Date</label>
                                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                                    {selectedFollowUp.completedDate ? new Date(selectedFollowUp.completedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                                </p>
                            </div>
                            {selectedFollowUp.notes && (
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                    <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg whitespace-pre-wrap">{selectedFollowUp.notes}</p>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end mt-6">
                            <button onClick={() => setShowViewModal(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Close</button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmDialog
                isOpen={showConfirmDialog}
                onClose={() => setShowConfirmDialog(false)}
                onConfirm={confirmDelete}
                title="Delete Follow-Up Record"
                message="Are you sure you want to delete this follow-up record? This action cannot be undone."
            />
        </div>
    );
};

export default FollowUpManagement;

