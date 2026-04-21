import { useState, useEffect } from "react";
import {
    getResources, createResource, updateResource, deleteResource, getErrorMessage
} from "@/api/resourceApi";
import { Plus, Edit, Trash2, Search, X, AlertCircle, CheckCircle, Loader, Upload, FileText } from "lucide-react";
import BulkUploadModal from "./BulkUploadModal";
import ResourceInsightsModal from "./ResourceInsightsModal";

export default function ResourcesPage() {
    const [resources, setResources] = useState([]);
    const [filters, setFilters] = useState({ type: "", capacity: "", location: "", name: "", status: "" });
    const [showForm, setShowForm] = useState(false);
    const [showBulkUpload, setShowBulkUpload] = useState(false);
    const [showInsights, setShowInsights] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
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

        if (name === 'name') {
            if (value.trim().length > 0) {
                getResources({ name: value }, 0, 5).then(res => setSuggestions(res.content || []));
            } else {
                setSuggestions([]);
            }
        }
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
        if (!formData.availableDays || formData.availableDays.trim() === "") errors.availableDays = "At least one available day is required";
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
            availabilityEndTime: "18:00",
            availableDays: "MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY,SATURDAY,SUNDAY"
        });
        setFormErrors({});
        setIsEditing(false);
        setShowForm(true);
    };

    const handleEdit = (resource) => {
        setFormData({
            ...resource,
            availabilityStartTime: resource.availabilityStartTime || "08:00",
            availabilityEndTime: resource.availabilityEndTime || "18:00",
            availableDays: resource.availableDays || "MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY,SATURDAY,SUNDAY"
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
            'LECTURE_HALL': 'bg-blue-500/10 text-blue-600 border border-blue-500/20',
            'LAB': 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20',
            'MEETING_ROOM': 'bg-cyan-500/10 text-cyan-600 border border-cyan-500/20',
            'EQUIPMENT': 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
        };
        return colors[type] || 'bg-slate-100 text-slate-500';
    };

    return (
        <div className="min-h-screen bg-slate-50/50 -m-6 pb-20">
            {/* Compact Admin Hero */}
            <div className="mesh-gradient h-36 w-full flex flex-col items-center justify-center relative overflow-hidden px-6 rounded-b-[2rem] shadow-xl">
                <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]"></div>
                <div className="relative z-10 w-full max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-center md:text-left space-y-0.5">
                        <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-2xl uppercase italic">
                            Facility <span className="text-emerald-300">Management</span>
                        </h1>
                        <p className="text-white/80 text-sm font-medium drop-shadow-md">
                            Architecting the campus resource ecosystem
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowInsights(true)}
                            className="bg-slate-900/10 text-slate-800 border border-slate-200 backdrop-blur-md px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-slate-900 hover:text-white transition-all shadow-lg flex items-center gap-2 group"
                        >
                            <FileText size={18} className="group-hover:-translate-y-0.5 transition-transform" /> Insights
                        </button>
                        <button
                            onClick={() => setShowBulkUpload(true)}
                            className="bg-blue-600/20 text-white border border-white/20 backdrop-blur-md px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all shadow-lg flex items-center gap-2 group"
                        >
                            <Plus size={18} className="group-hover:-translate-y-0.5 transition-transform" /> Import CSV
                        </button>
                        <button
                            onClick={handleAddNew}
                            className="bg-white text-blue-600 px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-blue-50 transition-all shadow-lg flex items-center gap-2 group"
                        >
                            <Plus size={18} className="group-hover:rotate-90 transition-transform" /> Add Asset
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-20 space-y-6">

                {/* Professional Status Banners */}
                {success && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md rounded-xl p-3 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                        <div className="bg-emerald-500 p-1.5 rounded-lg">
                            <CheckCircle className="text-white" size={16} />
                        </div>
                        <p className="text-xs font-bold text-emerald-900">{success}</p>
                        <button onClick={() => setSuccess(null)} className="ml-auto text-emerald-400 hover:text-emerald-600 font-black text-lg px-2">×</button>
                    </div>
                )}

                {/* Error Alert */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 backdrop-blur-md rounded-xl p-3 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                        <div className="bg-red-500 p-1.5 rounded-lg">
                            <AlertCircle className="text-white" size={16} />
                        </div>
                        <p className="text-xs font-bold text-red-900">{error}</p>
                        <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600 font-black text-lg px-2">×</button>
                    </div>
                )}

                {/* Compact Filter Architecture */}
                <div className="glass-morphism rounded-2xl p-5 border-white/60 space-y-3 shadow-lg relative z-50">
                    <div className="flex items-center gap-2 px-1">
                        <Search size={18} className="text-blue-500" />
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Registry Filters</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="space-y-2 relative z-50">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Resource Alias</label>
                            <input
                                type="text" name="name" value={filters.name} 
                                onChange={(e) => {
                                    handleFilterChange(e);
                                    setShowSuggestions(true);
                                }}
                                onFocus={() => setShowSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                placeholder="Search..."
                                className="w-full bg-white/50 border-none rounded-xl px-4 py-2.5 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all shadow-inner"
                            />
                            {showSuggestions && filters.name && suggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-2xl overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2">
                                    {suggestions.map(r => (
                                        <button 
                                            key={r.id}
                                            type="button"
                                            onClick={() => {
                                                setFilters(prev => ({ ...prev, name: r.name }));
                                                setShowSuggestions(false);
                                            }}
                                            className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 flex items-center gap-3 group"
                                        >
                                            <Search size={14} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                                            <div>
                                                <span className="block text-sm font-black text-slate-700">{r.name}</span>
                                                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">{r.type.replace(/_/g, ' ')}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Classification</label>
                            <select
                                name="type" value={filters.type} onChange={handleFilterChange}
                                className="w-full bg-white/50 border-none rounded-xl px-4 py-2.5 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all shadow-inner"
                            >
                                <option value="">All Types</option>
                                {resourceTypes.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Min Threshold</label>
                            <input
                                type="number" name="capacity" value={filters.capacity} onChange={handleFilterChange}
                                placeholder="0" min="0"
                                className="w-full bg-white/50 border-none rounded-xl px-4 py-2.5 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all shadow-inner"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Sector</label>
                            <input
                                type="text" name="location" value={filters.location} onChange={handleFilterChange}
                                placeholder="Location"
                                className="w-full bg-white/50 border-none rounded-xl px-4 py-2.5 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all shadow-inner"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Operational Status</label>
                            <select
                                name="status" value={filters.status} onChange={handleFilterChange}
                                className="w-full bg-white/50 border-none rounded-xl px-4 py-2.5 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all shadow-inner"
                            >
                                <option value="">All Statuses</option>
                                {resourceStatuses.map(s => (
                                    <option key={s} value={s}>
                                        {s === 'AVAILABLE' ? 'Available' : s === 'UNAVAILABLE' ? 'Unavailable' : s.replace(/_/g, ' ')}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Refined Table Architecture */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/60 overflow-hidden">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16 space-y-3">
                            <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                            <span className="text-slate-400 font-black uppercase tracking-widest text-xs">Synchronizing Assets...</span>
                        </div>
                    ) : resources.length === 0 ? (
                        <div className="text-center py-16 space-y-3">
                            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-inner">
                                <Search size={28} className="text-slate-300" />
                            </div>
                            <p className="text-slate-800 font-black uppercase tracking-tight text-sm">No match found in registry</p>
                        </div>
                    ) : (
                        <>
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="bg-slate-900/[0.02] border-b border-slate-100">
                                        <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Asset Name</th>
                                        <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Classification</th>
                                        <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Capacity</th>
                                        <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Sectors</th>
                                        <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                        <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {resources.map(r => (
                                        <tr key={r.id} className="hover:bg-blue-600/[0.01] transition-colors group">
                                            <td className="px-6 py-4">
                                                <p className="font-black text-slate-800 group-hover:text-blue-600 transition-colors uppercase tracking-tight text-sm">{r.name}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest shadow-sm ${getTypeColor(r.type)}`}>
                                                    {r.type.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-blue-600 font-black text-xs ring-1 ring-slate-100">{r.capacity}</span>
                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter italic">Seats</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-xs font-bold text-slate-600 italic bg-slate-50 px-2.5 py-0.5 rounded-lg border border-slate-100 w-fit">{r.location}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest border transition-all ${r.status !== 'UNAVAILABLE'
                                                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-emerald-100/50'
                                                    : 'bg-red-500/10 text-red-600 border-red-500/20 shadow-red-100/50'
                                                    }`}>
                                                    {r.status !== 'UNAVAILABLE' ? 'Available' : 'Unavailable'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEdit(r)}
                                                        className="p-2.5 bg-slate-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-all shadow-sm"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(r.id, r.name)}
                                                        disabled={deletingId === r.id}
                                                        className="p-2.5 bg-slate-50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all shadow-sm disabled:opacity-50"
                                                    >
                                                        {deletingId === r.id ? <Loader size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Refined Pagination Architecture */}
                            {pagination.totalPages > 1 && (
                                <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                                        <span className="text-blue-600">{resources.length > 0 ? pagination.page * pagination.size + 1 : 0} — {Math.min((pagination.page + 1) * pagination.size, pagination.totalElements)}</span> of <span className="text-slate-800">{pagination.totalElements}</span> assets
                                    </p>
                                    <div className="flex gap-1.5">
                                        <button
                                            onClick={() => handlePageChange(pagination.page - 1)}
                                            disabled={pagination.page === 0}
                                            className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all disabled:opacity-30"
                                        >
                                            Prev
                                        </button>
                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => handlePageChange(i)}
                                                    className={`w-9 h-9 rounded-lg text-xs font-black transition-all ${pagination.page === i ? 'bg-blue-600 text-white shadow-md shadow-blue-100' : 'bg-white text-slate-400 hover:bg-slate-50 border border-slate-100'}`}
                                                >
                                                    {i + 1}
                                                </button>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => handlePageChange(pagination.page + 1)}
                                            disabled={pagination.page >= pagination.totalPages - 1}
                                            className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all disabled:opacity-30"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Compact Asset Management Modal */}
                {showForm && (
                    <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[95vh] overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-5 md:p-6 text-white flex items-center justify-between shrink-0">
                                <h2 className="text-xl font-black uppercase tracking-tighter italic">
                                    {isEditing ? 'Sync' : 'Initialize'} <span className="text-emerald-300">Asset</span>
                                </h2>
                                <button type="button" onClick={() => setShowForm(false)} className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-all">
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-4 overflow-y-auto">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Designation Alias</label>
                                    <input
                                        type="text" name="name" value={formData?.name || ""} onChange={handleFormChange}
                                        className={`w-full bg-slate-50 border-none rounded-xl p-3 text-sm font-bold focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all shadow-inner ${formErrors.name ? 'ring-1 ring-red-500' : ''}`}
                                    />
                                    {formErrors.name && <p className="text-xs text-red-500 font-bold px-1 uppercase tracking-wider">{formErrors.name}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Classification Pool</label>
                                        <select
                                            name="type" value={formData?.type || ""} onChange={handleFormChange}
                                            className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm font-bold focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all shadow-inner"
                                        >
                                            {resourceTypes.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Capacity Limit</label>
                                        <input
                                            type="number" min="1" max="10000" name="capacity" value={formData?.capacity || ""} onChange={handleFormChange}
                                            className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm font-bold focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all shadow-inner"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Deployment Sector</label>
                                    <input
                                        type="text" name="location" value={formData?.location || ""} onChange={handleFormChange}
                                        className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm font-bold focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all shadow-inner"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Ops Start</label>
                                        <input
                                            type="time" name="availabilityStartTime" value={formData?.availabilityStartTime || "08:00"} onChange={handleFormChange}
                                            className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm font-bold focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all shadow-inner"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Ops End</label>
                                        <input
                                            type="time" name="availabilityEndTime" value={formData?.availabilityEndTime || "18:00"} onChange={handleFormChange}
                                            className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm font-bold focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all shadow-inner"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5 pt-1">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Available Days</label>
                                    <div className="flex gap-1.5">
                                        {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map((day) => {
                                            const currentDays = formData?.availableDays ? formData.availableDays.split(',') : [];
                                            const isSelected = currentDays.includes(day);
                                            const shortDay = day.substring(0, 3);
                                            return (
                                                <button
                                                    key={day}
                                                    type="button"
                                                    onClick={() => {
                                                        const newDays = isSelected 
                                                            ? currentDays.filter(d => d !== day)
                                                            : [...currentDays, day];
                                                        setFormData(prev => ({...prev, availableDays: newDays.join(',')}));
                                                    }}
                                                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${isSelected ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                                                >
                                                    {shortDay}
                                                </button>
                                            )
                                        })}
                                    </div>
                                    {formErrors.availableDays && <p className="text-xs text-red-500 font-bold px-1 uppercase tracking-wider">{formErrors.availableDays}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Asset Status</label>
                                    <select
                                        name="status" value={formData?.status || ""} onChange={handleFormChange}
                                        className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm font-bold focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all shadow-inner"
                                    >
                                        {resourceStatuses.map(s => <option key={s} value={s}>{s === 'AVAILABLE' ? 'Available' : 'Unavailable'}</option>)}
                                    </select>
                                </div>

                                <div className="pt-2 flex gap-4 mt-2">
                                    <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-6 py-2.5 rounded-xl border border-slate-200 font-black text-slate-400 hover:bg-slate-50 transition-all uppercase tracking-widest text-xs">
                                        Abort
                                    </button>
                                    <button
                                        type="submit" disabled={submitting}
                                        className="flex-1 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl font-black uppercase tracking-[0.1em] text-xs hover:shadow-lg transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                                    >
                                        {submitting ? <Loader className="animate-spin" size={16} /> : (isEditing ? 'Commit' : 'Launch')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {showBulkUpload && (
                    <BulkUploadModal
                        onClose={() => setShowBulkUpload(false)}
                        onUploadSuccess={loadResources}
                    />
                )}

                {showInsights && (
                    <ResourceInsightsModal 
                        onClose={() => setShowInsights(false)}
                    />
                )}
            </div>
        </div>
    );
}
