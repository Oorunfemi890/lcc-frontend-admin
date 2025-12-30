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
    const [followUpMode, setFollowUpMode] = useState('digital'); // 'digital' or 'physical'
    const [messageType, setMessageType] = useState([]); // Array of strings
    const [workers, setWorkers] = useState([]); // Members who are workers

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const [firstTimers, setFirstTimers] = useState([]);
    const [members, setMembers] = useState([]);
    const [selectedPerson, setSelectedPerson] = useState(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        firstTimerId: '',
        targetMemberId: '', // For existing members
        assignedToMemberId: '',
        followUpType: '', // Unused in state, but used in submission
        scheduledDate: new Date().toISOString().split('T')[0],
        notes: '' // Renamed to Message in UI
    });

    useEffect(() => {
        if (step === 2 && individualType === 'first_timer') {
            fetchRecentFirstTimers();
        } else if (step === 2 && individualType === 'member') {
            fetchMembers();
        }

        // Fetch workers for assignment dropdown
        if (step === 3) {
            fetchWorkers();
        }
    }, [step, individualType]);

    const fetchRecentFirstTimers = async () => {
        try {
            setLoading(true);
            const params = { limit: 50 };
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            if (searchTerm) params.search = searchTerm;

            const response = await firstTimerAPI.getAll(params);
            if (response.success && Array.isArray(response.data)) {
                setFirstTimers(response.data);
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
            const params = { limit: 50 };
            if (searchTerm) params.search = searchTerm;

            const response = await membersAPI.getMembers(params);
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

    const fetchWorkers = async () => {
        try {
            // Fetch members who are workers
            const response = await membersAPI.getMembers({ isWorker: true, limit: 100 });
            if (response.success && Array.isArray(response.data)) {
                setWorkers(response.data);
            }
        } catch (error) {
            console.error('Error fetching workers:', error);
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
        setSearchTerm('');
        setStep(2);
    };

    const handlePersonSelect = (person) => {
        setSelectedPerson(person);
        if (individualType === 'first_timer') {
            setFormData({ ...formData, firstTimerId: person.id, targetMemberId: '' });
        } else {
            // Validate if we should use assignedToMemberId or targetMemberId?
            // "Select Member" implies TARGET.
            // "Assign To" implies WORKER.
            // Previous logic was wrong, setting assignedToMemberId.
            // Correct: Set targetMemberId.
            setFormData({ ...formData, targetMemberId: person.id, firstTimerId: '' });
        }
        setStep(3);
    };

    const handleMessageTypeSelect = (type) => {
        if (followUpMode === 'physical') {
            // Physical mode: single selection only
            setMessageType([type]);
        } else {
            // Digital mode: multi-selection
            setMessageType(prev => {
                if (prev.includes(type)) {
                    return prev.filter(t => t !== type);
                } else {
                    return [...prev, type];
                }
            });
        }
    };

    const handleModeChange = (mode) => {
        setFollowUpMode(mode);
        setMessageType([]); // Clear selections when switching modes
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            if (messageType.length === 0) {
                toast.error('Please select at least one message type');
                setSubmitting(false);
                return;
            }

            // Single API call with followUpType as array
            const response = await followUpAPI.create({
                ...formData,
                followUpType: messageType // Send array directly
            });

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
        setFollowUpMode('digital');
        setMessageType([]);
        setSelectedPerson(null);
        setFormData({
            firstTimerId: '',
            targetMemberId: '',
            assignedToMemberId: '',
            followUpType: '',
            scheduledDate: new Date().toISOString().split('T')[0],
            notes: ''
        });
    };

    const goBack = () => {
        if (step === 3) {
            setStep(2);
            setMessageType([]);
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
                            <p className="text-gray-600">Follow up with a new first timer</p>
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
                        {individualType === 'first_timer' ? 'Select First Timer' : 'Select Member'}
                    </h2>

                    {individualType === 'first_timer' && (
                        <div className="flex flex-wrap gap-4 mb-6 items-end bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Search Name/Phone</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search by name, phone..."
                                        className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                                    />
                                    <i className="ri-search-line absolute left-3 top-2.5 text-gray-400"></i>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                                />
                            </div>
                            <button
                                onClick={fetchRecentFirstTimers}
                                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors h-[38px]"
                            >
                                Filter
                            </button>
                            {(startDate || endDate) && (
                                <button
                                    onClick={() => {
                                        setStartDate('');
                                        setEndDate('');
                                        // Note: Users needs to click Filter again to reset, or we could auto-fetch here but state update is async
                                    }}
                                    className="px-3 py-2 text-gray-600 hover:text-gray-900 text-sm"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    )}

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
                                    <p>No first timers found {startDate || endDate || searchTerm ? 'matching your filters' : ''}</p>
                                </div>
                            )}

                            {individualType === 'member' && (
                                <div className="flex gap-4 mb-6 items-end bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Search Member</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                placeholder="Search by name, email, phone..."
                                                className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                                            />
                                            <i className="ri-search-line absolute left-3 top-2.5 text-gray-400"></i>
                                        </div>
                                    </div>
                                    <button
                                        onClick={fetchMembers}
                                        className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors h-[38px]"
                                    >
                                        Search
                                    </button>
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
                        {/* Mode Toggle */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Follow-Up Method <span className="text-red-500">*</span>
                            </label>
                            <div className="flex gap-2 mb-4">
                                <button
                                    type="button"
                                    onClick={() => handleModeChange('digital')}
                                    className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${followUpMode === 'digital'
                                        ? 'bg-indigo-600 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    <i className="ri-smartphone-line mr-2"></i>
                                    Digital Follow-Up
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleModeChange('physical')}
                                    className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${followUpMode === 'physical'
                                        ? 'bg-indigo-600 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    <i className="ri-map-pin-line mr-2"></i>
                                    Physical Visit
                                </button>
                            </div>
                        </div>

                        {/* Message Type Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                {followUpMode === 'digital' ? 'Select Channel(s)' : 'Select Visit Type'} <span className="text-red-500">*</span>
                            </label>
                            <p className="text-xs text-gray-500 mb-3">
                                {followUpMode === 'digital'
                                    ? 'You can select multiple digital channels'
                                    : 'Select one visit type (requires worker assignment)'}
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {followUpMode === 'digital' ? [
                                    { value: 'phone_call', icon: 'ri-phone-line', label: 'Phone Call' },
                                    { value: 'sms', icon: 'ri-message-2-line', label: 'SMS' },
                                    { value: 'whatsapp', icon: 'ri-whatsapp-line', label: 'WhatsApp' },
                                    { value: 'email', icon: 'ri-mail-line', label: 'Email' }
                                ].map(type => (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => handleMessageTypeSelect(type.value)}
                                        className={`p-4 border-2 rounded-lg transition-all ${messageType.includes(type.value)
                                            ? 'border-indigo-500 bg-indigo-50'
                                            : 'border-gray-200 hover:border-indigo-300'
                                            }`}
                                    >
                                        <i className={`${type.icon} text-2xl ${messageType.includes(type.value) ? 'text-indigo-600' : 'text-gray-600'}`}></i>
                                        <p className={`mt-2 text-sm font-medium ${messageType.includes(type.value) ? 'text-indigo-900' : 'text-gray-700'}`}>
                                            {type.label}
                                        </p>
                                    </button>
                                )) : [
                                    { value: 'home_visit', icon: 'ri-home-4-line', label: 'Home Visit' },
                                    { value: 'church_visit', icon: 'ri-building-line', label: 'Church Visit' }
                                ].map(type => (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => handleMessageTypeSelect(type.value)}
                                        className={`p-4 border-2 rounded-lg transition-all ${messageType.includes(type.value)
                                            ? 'border-indigo-500 bg-indigo-50'
                                            : 'border-gray-200 hover:border-indigo-300'
                                            }`}
                                    >
                                        <i className={`${type.icon} text-2xl ${messageType.includes(type.value) ? 'text-indigo-600' : 'text-gray-600'}`}></i>
                                        <p className={`mt-2 text-sm font-medium ${messageType.includes(type.value) ? 'text-indigo-900' : 'text-gray-700'}`}>
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

                        {/* Assign To (Worker) - Only show for physical visits */}
                        {followUpMode === 'physical' && (
                            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Assign To (Worker) <span className="text-red-500">*</span>
                                </label>
                                <p className="text-xs text-gray-500 mb-2">Required for Physical Visits. The worker will receive a notification.</p>
                                <select
                                    value={formData.assignedToMemberId}
                                    onChange={(e) => setFormData({ ...formData, assignedToMemberId: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    required={followUpMode === 'physical'}
                                >
                                    <option value="">Select Worker</option>
                                    {workers.map(worker => (
                                        <option key={worker.id} value={worker.id}>
                                            {worker.firstName} {worker.lastName} ({worker.membershipType})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Message / Notes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Message (Content to Send) <span className="text-red-500">*</span></label>
                            <p className="text-xs text-gray-500 mb-2">
                                This message will be sent to the {followUpMode === 'physical' ? 'assigned worker' : 'recipient'} via the selected channels.
                            </p>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                rows="4"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Enter the message content here..."
                                required
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
                                disabled={messageType.length === 0 || submitting}
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
