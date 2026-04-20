import { useState, useEffect } from "react";
import { 
    getResources, createResource, updateResource, deleteResource, getErrorMessage 
} from "@/api/resourceApi";
import { Plus, Edit, Trash2, Search, X, AlertCircle, CheckCircle, Loader } from "lucide-react";

export default function ResourcesPage() {
    const [resources, setResources] = useState([]);
    const [filters, setFilters] = useState({ type: "", capacity: "", location: "", name: "", status: "" });
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState(null);
    const [formErrors, setFormErrors] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [pagination, setPagination] = useState({ page: 0, size: 10, totalPages: 0, totalElements: 0 });
    const [deletingId, setDeletingId] = useState(null);

    const resourceTypes = ["LECTURE_HALL", "LAB", "MEETING_ROOM", "EQUIPMENT"];
    const resourceStatuses = ["AVAILABLE", "UNAVAILABLE"];

    useEffect(() => {
        loadResources();
    }, [filters, pagination.page]);

    const loadResources = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getResources(filters, pagination.page, pagination.size);
            setResources(data.content || []);
            setPagination(prev => ({
                ...prev,
                totalPages: data.totalPages || 0,
                totalElements: data.totalElements || 0
            }));
        } catch (error) {
            const errorMsg = getErrorMessage(error);
            setError(errorMsg);
            console.error("Failed to fetch resources", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setPagination(prev => ({ ...prev, page: 0 })); // Reset to first page when filter changes
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear field error when user starts editing
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.name || formData.name.trim() === "") errors.name = "Name is required";
        if (!formData.type) errors.type = "Type is required";
        if (!formData.capacity || formData.capacity < 1) errors.capacity = "Capacity must be at least 1";
        if (formData.capacity > 10000) errors.capacity = "Capacity cannot exceed 10000";
        if (!formData.location || formData.location.trim() === "") errors.location = "Location is required";
        if (!formData.status) errors.status = "Status is required";
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleAddNew = () => {
        setFormData({ 
            name: "", 
            type: "LECTURE_HALL", 
            capacity: 1, 
            location: "", 
            status: "AVAILABLE", 
            availabilityStartTime: "08:00", 
            availabilityEndTime: "18:00" 
        });
        setFormErrors({});
        setIsEditing(false);
        setShowForm(true);
    };

    const handleEdit = (resource) => {
        setFormData({
            ...resource,
            availabilityStartTime: resource.availabilityStartTime || "08:00",
            availabilityEndTime: resource.availabilityEndTime || "18:00"
        });
        setFormErrors({});
        setIsEditing(true);
        setShowForm(true);
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
            setDeletingId(id);
            try {
                await deleteResource(id);
                setSuccess(`Resource "${name}" deleted successfully`);
                setTimeout(() => setSuccess(null), 3000);
                loadResources();
            } catch (error) {
                const errorMsg = getErrorMessage(error);
                setError(errorMsg);
                console.error("Failed to delete resource", error);
            } finally {
                setDeletingId(null);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSubmitting(true);
        setError(null);
        try {
            if (isEditing) {
                await updateResource(formData.id, formData);
                setSuccess(`Resource "${formData.name}" updated successfully`);
            } else {
                await createResource(formData);
                setSuccess(`Resource "${formData.name}" created successfully`);
            }
            setTimeout(() => setSuccess(null), 3000);
            setShowForm(false);
            loadResources();
        } catch (error) {
            const errorMsg = getErrorMessage(error);
            setError(errorMsg);
            console.error("Failed to save resource", error);
        } finally {
            setSubmitting(false);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < pagination.totalPages) {
            setPagination(prev => ({ ...prev, page: newPage }));
        }
    };

    const getTypeColor = (type) => {
        const colors = {
            'LECTURE_HALL': 'bg-blue-100 text-blue-700',
            'LAB': 'bg-purple-100 text-purple-700',
            'MEETING_ROOM': 'bg-green-100 text-green-700',
            'EQUIPMENT': 'bg-orange-100 text-orange-700'
        };
        return colors[type] || 'bg-gray-100 text-gray-700';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Facilities & Assets</h1>
                    <p className="text-sm text-gray-600 mt-1">Manage campus resources and equipment</p>
                </div>
                <button 
                    onClick={handleAddNew}
                    className="bg-blue-600 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                >
                    <Plus size={18} /> Add Resource
                </button>
            </div>

            {/* Success Alert */}
            {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-gap-3">
                    <CheckCircle className="text-green-600" size={20} />
                    <div className="flex-1 ml-3">
                        <p className="text-sm font-medium text-green-800">{success}</p>
                    </div>
                </div>
            )}

            {/* Error Alert */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                    <AlertCircle className="text-red-600" size={20} />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-red-800">{error}</p>
                    </div>
                    <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
                        <X size={20} />
                    </button>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-4">
                <h3 className="font-semibold text-gray-900">Search & Filter</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">Name</label>
                        <input 
                            type="text" name="name" value={filters.name} onChange={handleFilterChange}
                            placeholder="Search by name..."
                            className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">Type</label>
                        <select 
                            name="type" value={filters.type} onChange={handleFilterChange}
                            className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Types</option>
                            {resourceTypes.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">Min Capacity</label>
                        <input 
                            type="number" name="capacity" value={filters.capacity} onChange={handleFilterChange}
                            placeholder="Capacity" min="0"
                            className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">Location</label>
                        <input 
                            type="text" name="location" value={filters.location} onChange={handleFilterChange}
                            placeholder="Location"
                            className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">Status</label>
                        <select 
                            name="status" value={filters.status} onChange={handleFilterChange}
                            className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Statuses</option>
                            {resourceStatuses.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader className="animate-spin text-blue-600" size={32} />
                        <span className="ml-2 text-gray-600">Loading resources...</span>
                    </div>
                ) : resources.length === 0 ? (
                    <div className="text-center py-12">
                        <Search size={40} className="mx-auto text-gray-400 mb-3" />
                        <p className="text-gray-600 font-medium">No resources found</p>
                        <p className="text-sm text-gray-500">Try adjusting your search filters</p>
                    </div>
                ) : (
                    <>
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-3.5 font-semibold text-gray-900">Name</th>
                                    <th className="px-4 py-3.5 font-semibold text-gray-900">Type</th>
                                    <th className="px-4 py-3.5 font-semibold text-gray-900">Capacity</th>
                                    <th className="px-4 py-3.5 font-semibold text-gray-900">Location</th>
                                    <th className="px-4 py-3.5 font-semibold text-gray-900">Status</th>
                                    <th className="px-4 py-3.5 font-semibold text-gray-900 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {resources.map(r => (
                                    <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-4 py-3.5 font-medium text-gray-900">{r.name}</td>
                                        <td className="px-4 py-3.5 text-xs">
                                            <span className={`px-3 py-1.5 rounded-full font-medium ${getTypeColor(r.type)}`}>
                                                {r.type.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 text-gray-700">{r.capacity}</td>
                                        <td className="px-4 py-3.5 text-gray-700">{r.location}</td>
                                        <td className="px-4 py-3.5">
                                            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                                                r.status !== 'UNAVAILABLE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                                {r.status !== 'UNAVAILABLE' ? 'Available' : 'Unavailable'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 flex justify-end gap-2">
                                            <button 
                                                onClick={() => handleEdit(r)} 
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit resource"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(r.id, r.name)} 
                                                disabled={deletingId === r.id}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                title="Delete resource"
                                            >
                                                {deletingId === r.id ? <Loader size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="px-4 py-3.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                                <p className="text-sm text-gray-600">
                                    Showing {resources.length > 0 ? pagination.page * pagination.size + 1 : 0} to {Math.min((pagination.page + 1) * pagination.size, pagination.totalElements)} of {pagination.totalElements} resources
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handlePageChange(pagination.page - 1)}
                                        disabled={pagination.page === 0}
                                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                            const pageNum = i;
                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => handlePageChange(pageNum)}
                                                    className={`px-2.5 py-1.5 rounded-lg text-sm ${pagination.page === pageNum ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-100'}`}
                                                >
                                                    {pageNum + 1}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <button
                                        onClick={() => handlePageChange(pagination.page + 1)}
                                        disabled={pagination.page >= pagination.totalPages - 1}
                                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modal Form */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
                            <h2 className="text-xl font-bold text-gray-900">{isEditing ? 'Edit Resource' : 'Add New Resource'}</h2>
                            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="font-medium text-gray-900">Name *</label>
                                <input 
                                    type="text" 
                                    name="name" 
                                    value={formData?.name || ""} 
                                    onChange={handleFormChange} 
                                    placeholder="Enter resource name"
                                    className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${formErrors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                                />
                                {formErrors.name && <p className="text-xs text-red-600">{formErrors.name}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="font-medium text-gray-900">Type *</label>
                                    <select 
                                        name="type" 
                                        value={formData?.type || ""} 
                                        onChange={handleFormChange} 
                                        className={`w-full border rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 ${formErrors.type ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                                    >
                                        {resourceTypes.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                                    </select>
                                    {formErrors.type && <p className="text-xs text-red-600">{formErrors.type}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <label className="font-medium text-gray-900">Capacity *</label>
                                    <input 
                                        type="number" 
                                        min="1" 
                                        max="10000"
                                        name="capacity" 
                                        value={formData?.capacity || ""} 
                                        onChange={handleFormChange} 
                                        placeholder="e.g., 50"
                                        className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${formErrors.capacity ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                                    />
                                    {formErrors.capacity && <p className="text-xs text-red-600">{formErrors.capacity}</p>}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="font-medium text-gray-900">Location *</label>
                                <input 
                                    type="text" 
                                    name="location" 
                                    value={formData?.location || ""} 
                                    onChange={handleFormChange} 
                                    placeholder="e.g., Building A, Floor 2"
                                    className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${formErrors.location ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                                />
                                {formErrors.location && <p className="text-xs text-red-600">{formErrors.location}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="font-medium text-gray-900 text-sm">Available From</label>
                                    <input 
                                        type="time" 
                                        name="availabilityStartTime" 
                                        value={formData?.availabilityStartTime || "08:00"} 
                                        onChange={handleFormChange} 
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="font-medium text-gray-900 text-sm">Available To</label>
                                    <input 
                                        type="time" 
                                        name="availabilityEndTime" 
                                        value={formData?.availabilityEndTime || "18:00"} 
                                        onChange={handleFormChange} 
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="font-medium text-gray-900">Status *</label>
                                <select 
                                    name="status" 
                                    value={formData?.status || ""} 
                                    onChange={handleFormChange} 
                                    className={`w-full border rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 ${formErrors.status ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                                >
                                    {resourceStatuses.map(s => (
                                        <option key={s} value={s}>
                                            {s === 'AVAILABLE' ? 'Available' : 'Unavailable'}
                                        </option>
                                    ))}
                                </select>
                                {formErrors.status && <p className="text-xs text-red-600">{formErrors.status}</p>}
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t">
                                <button 
                                    type="button" 
                                    onClick={() => setShowForm(false)} 
                                    className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={submitting}
                                    className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {submitting && <Loader size={16} className="animate-spin" />}
                                    {isEditing ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
