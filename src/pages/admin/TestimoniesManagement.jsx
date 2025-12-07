import React, { useState, useEffect } from 'react';
import { testimoniesAPI } from '@/Services/testimoniesAPI';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';
import ConfirmDialog from '@/components/ConfirmDialog';

const TestimoniesManagement = () => {
    const { admin } = useAuth();
    const [testimonies, setTestimonies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedTestimony, setSelectedTestimony] = useState(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [testimonyToDelete, setTestimonyToDelete] = useState(null);

    // Role-based permissions
    const canView = true; // All roles can view
    const canEdit = ['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(admin?.role);
    const canDelete = admin?.role === 'SUPER_ADMIN';
    const canCreate = ['SUPER_ADMIN', 'ADMIN'].includes(admin?.role);

    useEffect(() => {
        fetchTestimonies();
    }, []);

    const fetchTestimonies = async () => {
        try {
            setLoading(true);
            const response = await testimoniesAPI.getAll();
            if (response.success && Array.isArray(response.data)) {
                setTestimonies(response.data);
            } else {
                setTestimonies([]);
                // if (!response.success) toast.error(response.message);
            }
        } catch (error) {
            console.error('Error fetching testimonies:', error);
            toast.error('Failed to load testimonies');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id) => {
        setTestimonyToDelete(id);
        setShowConfirmDialog(true);
    };

    const confirmDelete = async () => {
        if (!testimonyToDelete) return;
        try {
            const response = await testimoniesAPI.delete(testimonyToDelete);
            if (response.success) {
                toast.success('Testimony deleted successfully');
                fetchTestimonies();
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            toast.error('Failed to delete testimony');
        } finally {
            setTestimonyToDelete(null);
        }
    };

    const handleView = (testimony) => {
        setSelectedTestimony(testimony);
        setShowViewModal(true);
    };

    const filteredItems = testimonies.filter(item => {
        const searchLower = searchTerm.toLowerCase();
        return (
            (item.content && item.content.toLowerCase().includes(searchLower)) ||
            (item.category && item.category.toLowerCase().includes(searchLower))
            // Add member name check if populated
        );
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
                <span className="ml-3 text-gray-600">Loading testimonies...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Testimonies</h1>
                    <p className="text-gray-600 mt-1">Manage member testimonies</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search content or category..."
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Content</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Public</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {paginatedItems.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatDate(item.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-md truncate">
                                        {item.content}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${item.isPublic
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {item.isPublic ? 'Public' : 'Private'}
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
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        No testimonies found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div >
                {/* Pagination Controls */}
                {
                    totalPages > 1 && (
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
                    )
                }
            </div >

            {/* View Testimony Modal */}
            {showViewModal && selectedTestimony && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Testimony Details</h3>
                            <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-600">
                                <i className="ri-close-line text-xl"></i>
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Member</label>
                                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                                    {selectedTestimony.member ? `${selectedTestimony.member.firstName} ${selectedTestimony.member.lastName}` : 'N/A'}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Experience</label>
                                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                                    {selectedTestimony.dateOfExperience ? new Date(selectedTestimony.dateOfExperience).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg capitalize">{selectedTestimony.category || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Visibility</label>
                                <p className="text-sm"><span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${selectedTestimony.isPublic ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{selectedTestimony.isPublic ? 'Public' : 'Private'}</span></p>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg whitespace-pre-wrap">{selectedTestimony.content}</p>
                            </div>
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
                title="Delete Testimony"
                message="Are you sure you want to delete this testimony? This action cannot be undone."
            />
        </div >
    );
};

export default TestimoniesManagement;
