import React, { useState, useEffect } from 'react';
import { followUpAPI } from '@/Services/followUpAPI';
import { firstTimerAPI } from '@/Services/firstTimerAPI';
import { membersAPI } from '@/Services/membersAPI';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';
import ConfirmDialog from '@/components/ConfirmDialog';

const NewFollowUp = () => {
    const { admin } = useAuth();
    const [step, setStep] = useState(1); // 1: Choose type, 2: Select person, 3: Message details
    const [followUpCategory, setFollowUpCategory] = useState(''); // 'individual' or 'group'
    const [individualType, setIndividualType] = useState(''); // 'first_timer' or 'member'
    const [messageType, setMessageType] = useState(''); // 'phone_call', 'whatsapp', 'email', etc.

    const [firstTimers, setFirstTimers] = useState([]);
    const [members, setMembers] = useState([]);
    const [selectedPerson, setSelectedPerson] = useState(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        firstTimerId: '',
        assignedToMemberId: '',
        followUpType: '',
        scheduledDate: new Date().toISOString().split('T')[0],
        notes: ''
    });

    useEffect(() => {
        if (step === 2 && individualType === 'first_timer') {
            fetchRecentFirstTimers();
        } else if (step === 2 && individualType === 'member') {
            fetchMembers();
        }
    }, [step, individualType]);

    const fetchRecentFirstTimers = async () => {
        try {
            setLoading(true);
            const response = await firstTimerAPI.getAll();
            if (response.success && Array.isArray(response.data)) {
                // Filter first timers from the last 2 weeks
                const twoWeeksAgo = new Date();
                twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

                const recentFirstTimers = response.data.filter(ft => {
                    const createdDate = new Date(ft.createdAt);
                    return createdDate >= twoWeeksAgo;
                });

                setFirstTimers(recentFirstTimers);
            }
        } catch (error) {
            console.error('Error fetching first timers:', error);
            toast.error('Failed to load first timers');
        } finally {
            setLoading(false);
        }
    };

    const fetchMembers = async () => {
        try {
            setLoading(true);
            const response = await membersAPI.getMembers();
            if (response.success && Array.isArray(response.data)) {
                setMembers(response.data);
            }
        } catch (error) {
            console.error('Error fetching members:', error);
            toast.error('Failed to load members');
        } finally {
            setLoading(false);
        }
    };

    const handleCategorySelect = (category) => {
        setFollowUpCategory(category);
        if (category === 'individual') {
            setStep(1.5); // Show individual type selection
        }
    };

    const handleIndividualTypeSelect = (type) => {
        setIndividualType(type);
        setStep(2);
    };

    const handlePersonSelect = (person) => {
        setSelectedPerson(person);
        if (individualType === 'first_timer') {
            setFormData({ ...formData, firstTimerId: person.id });
        } else {
            setFormData({ ...formData, assignedToMemberId: person.id });
        }
        setStep(3);
    };

    const handleMessageTypeSelect = (type) => {
        setMessageType(type);
        setFormData({ ...formData, followUpType: type });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const response = await followUpAPI.create(formData);
            if (response.success) {
                toast.success('Follow-up created successfully');
                resetForm();
            } else {
                toast.error(response.message || 'Failed to create follow-up');
            }
        } catch (error) {
            toast.error('Failed to create follow-up');
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setStep(1);
        setFollowUpCategory('');
        setIndividualType('');
        setMessageType('');
        setSelectedPerson(null);
        setFormData({
            firstTimerId: '',
            assignedToMemberId: '',
            followUpType: '',
            scheduledDate: new Date().toISOString().split('T')[0],
            notes: ''
        });
    };

    const goBack = () => {
        if (step === 3) {
            setStep(2);
            setMessageType('');
        } else if (step === 2) {
            setStep(1.5);
            setSelectedPerson(null);
        } else if (step === 1.5) {
            setStep(1);
            setIndividualType('');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Create Follow-Up</h1>
                    <p className="text-gray-600 mt-1">Set up a new follow-up activity</p>
                </div>
                {step > 1 && (
                    <button
                        onClick={goBack}
                        className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        <i className="ri-arrow-left-line mr-2"></i>
                        Back
                    </button>
                )}
            </div>

            {/* Progress Indicator */}
            <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                    <div className={`flex items-center ${step >= 1 ? 'text-indigo-600' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>1</div>
                        <span className="ml-2 font-medium">Category</span>
                    </div>
                    <div className="flex-1 h-1 mx-4 bg-gray-200">
                        <div className={`h-full ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-200'}`} style={{ width: step >= 2 ? '100%' : '0%' }}></div>
                    </div>
                    <div className={`flex items-center ${step >= 2 ? 'text-indigo-600' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>2</div>
                        <span className="ml-2 font-medium">Select Person</span>
                    </div>
                    <div className="flex-1 h-1 mx-4 bg-gray-200">
                        <div className={`h-full ${step >= 3 ? 'bg-indigo-600' : 'bg-gray-200'}`} style={{ width: step >= 3 ? '100%' : '0%' }}></div>
                    </div>
                    <div className={`flex items-center ${step >= 3 ? 'text-indigo-600' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>3</div>
                        <span className="ml-2 font-medium">Details</span>
                    </div>
                </div>
            </div>

            {/* Step 1: Choose Category */}
            {step === 1 && (
                <div className="bg-white p-8 rounded-lg shadow-sm border">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Choose Follow-Up Category</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <button
                            onClick={() => handleCategorySelect('individual')}
                            className="p-6 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left"
                        >
                            <div className="flex items-center mb-3">
                                <i className="ri-user-line text-3xl text-indigo-600"></i>
                                <h3 className="ml-3 text-lg font-semibold text-gray-900">Individual Follow-Up</h3>
                            </div>
                            <p className="text-gray-600">Follow up with a specific first-timer or member</p>
                        </button>

                        <button
                            onClick={() => handleCategorySelect('group')}
                            className="p-6 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left opacity-50 cursor-not-allowed"
                            disabled
                        >
                            <div className="flex items-center mb-3">
                                <i className="ri-group-line text-3xl text-indigo-600"></i>
                                <h3 className="ml-3 text-lg font-semibold text-gray-900">Group Follow-Up</h3>
                            </div>
                            <p className="text-gray-600">Coming soon: Follow up with multiple people at once</p>
                        </button>
                    </div>
                </div>
            )}

            {/* Step 1.5: Choose Individual Type */}
            {step === 1.5 && (
                <div className="bg-white p-8 rounded-lg shadow-sm border">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Who would you like to follow up with?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <button
                            onClick={() => handleIndividualTypeSelect('first_timer')}
                            className="p-6 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left"
                        >
                            <div className="flex items-center mb-3">
                                <i className="ri-user-star-line text-3xl text-indigo-600"></i>
                                <h3 className="ml-3 text-lg font-semibold text-gray-900">First Timer</h3>
                            </div>
                            <p className="text-gray-600">Follow up with someone who visited in the last 2 weeks</p>
                        </button>

                        <button
                            onClick={() => handleIndividualTypeSelect('member')}
                            className="p-6 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left"
                        >
                            <div className="flex items-center mb-3">
                                <i className="ri-user-heart-line text-3xl text-indigo-600"></i>
                                <h3 className="ml-3 text-lg font-semibold text-gray-900">Member</h3>
                            </div>
                            <p className="text-gray-600">Follow up with an existing church member</p>
                        </button>
                    </div>
                </div>
            )}

            {/* Step 2: Select Person */}
            {step === 2 && (
                <div className="bg-white p-8 rounded-lg shadow-sm border">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">
                        {individualType === 'first_timer' ? 'Select First Timer (Last 2 Weeks)' : 'Select Member'}
                    </h2>

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                            <span className="ml-3 text-gray-600">Loading...</span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                            {individualType === 'first_timer' && firstTimers.length === 0 && (
                                <div className="text-center py-12 text-gray-500">
                                    <i className="ri-user-search-line text-5xl mb-3"></i>
                                    <p>No first timers found in the last 2 weeks</p>
                                </div>
                            )}

                            {individualType === 'member' && members.length === 0 && (
                                <div className="text-center py-12 text-gray-500">
                                    <i className="ri-user-search-line text-5xl mb-3"></i>
                                    <p>No members found</p>
                                </div>
                            )}

                            {individualType === 'first_timer' && firstTimers.map(person => (
                                <button
                                    key={person.id}
                                    onClick={() => handlePersonSelect(person)}
                                    className="p-4 border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold text-gray-900">
                                                {person.surname} {person.otherNames}
                                            </h3>
                                            <p className="text-sm text-gray-600">{person.phoneNumber}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Visited: {formatDate(person.createdAt)}
                                            </p>
                                        </div>
                                        <i className="ri-arrow-right-line text-xl text-gray-400"></i>
                                    </div>
                                </button>
                            ))}

                            {individualType === 'member' && members.map(person => (
                                <button
                                    key={person.id}
                                    onClick={() => handlePersonSelect(person)}
                                    className="p-4 border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold text-gray-900">
                                                {person.firstName} {person.lastName}
                                            </h3>
                                            <p className="text-sm text-gray-600">{person.email}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {person.phoneNumber} • {person.membershipType}
                                            </p>
                                        </div>
                                        <i className="ri-arrow-right-line text-xl text-gray-400"></i>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Step 3: Message Type and Details */}
            {step === 3 && (
                <div className="bg-white p-8 rounded-lg shadow-sm border">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">Follow-Up Details</h2>
                        <div className="mt-2 p-3 bg-indigo-50 rounded-lg">
                            <p className="text-sm text-gray-700">
                                <span className="font-semibold">Selected: </span>
                                {selectedPerson && individualType === 'first_timer' && `${selectedPerson.surname} ${selectedPerson.otherNames}`}
                                {selectedPerson && individualType === 'member' && `${selectedPerson.firstName} ${selectedPerson.lastName}`}
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Message Type Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Message Type <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {[
                                    { value: 'phone_call', icon: 'ri-phone-line', label: 'Phone Call' },
                                    { value: 'whatsapp', icon: 'ri-whatsapp-line', label: 'WhatsApp' },
                                    { value: 'email', icon: 'ri-mail-line', label: 'Email' },
                                    { value: 'sms', icon: 'ri-message-2-line', label: 'SMS' },
                                    { value: 'home_visit', icon: 'ri-home-4-line', label: 'Home Visit' },
                                    { value: 'church_visit', icon: 'ri-building-line', label: 'Church Visit' }
                                ].map(type => (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => handleMessageTypeSelect(type.value)}
                                        className={`p-4 border-2 rounded-lg transition-all ${messageType === type.value
                                                ? 'border-indigo-500 bg-indigo-50'
                                                : 'border-gray-200 hover:border-indigo-300'
                                            }`}
                                    >
                                        <i className={`${type.icon} text-2xl ${messageType === type.value ? 'text-indigo-600' : 'text-gray-600'}`}></i>
                                        <p className={`mt-2 text-sm font-medium ${messageType === type.value ? 'text-indigo-900' : 'text-gray-700'}`}>
                                            {type.label}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Scheduled Date */}
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

                        {/* Assign To (Optional for first timers) */}
                        {individualType === 'first_timer' && (
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
                        )}

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                rows="4"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Add any notes about this follow-up..."
                            ></textarea>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex justify-end space-x-3 pt-4 border-t">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={!messageType || submitting}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? 'Creating...' : 'Create Follow-Up'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default NewFollowUp;
