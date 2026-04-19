import { useState, useEffect } from "react";
import { getResources, getErrorMessage } from "@/api/resourceApi";
import { Search, AlertCircle, Loader, MapPin, Users, Clock, X } from "lucide-react";

export default function StudentResourcesPage() {
    const [resources, setResources] = useState([]);
    const [filters, setFilters] = useState({ type: "", capacity: "", location: "", name: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({ page: 0, size: 10, totalPages: 0, totalElements: 0 });
    const [selectedResource, setSelectedResource] = useState(null);

    const resourceTypes = ["LECTURE_HALL", "LAB", "MEETING_ROOM", "EQUIPMENT"];

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
        setPagination(prev => ({ ...prev, page: 0 }));
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < pagination.totalPages) {
            setPagination(prev => ({ ...prev, page: newPage }));
        }
    };

    const getTypeColor = (type) => {
        const colors = {
            'LECTURE_HALL': 'from-blue-500 to-blue-600',
            'LAB': 'from-purple-500 to-purple-600',
            'MEETING_ROOM': 'from-green-500 to-green-600',
            'EQUIPMENT': 'from-orange-500 to-orange-600'
        };
        return colors[type] || 'from-gray-500 to-gray-600';
    };

    const getTypeIcon = (type) => {
        const icons = {
            'LECTURE_HALL': '📚',
            'LAB': '🔬',
            'MEETING_ROOM': '💼',
            'EQUIPMENT': '🎛'
        };
        return icons[type] || '📍';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Campus Facilities & Resources</h1>
                <p className="text-sm text-gray-600 mt-1">Browse available resources and facilities on campus</p>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                    <AlertCircle className="text-red-600" size={20} />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-red-800">{error}</p>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-4">
                <h3 className="font-semibold text-gray-900">Search & Filter</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">Name</label>
                        <input 
                            type="text" 
                            name="name" 
                            value={filters.name} 
                            onChange={handleFilterChange}
                            placeholder="Search by name..."
                            className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">Type</label>
                        <select 
                            name="type" 
                            value={filters.type} 
                            onChange={handleFilterChange}
                            className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Types</option>
                            {resourceTypes.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">Min Capacity</label>
                        <input 
                            type="number" 
                            name="capacity" 
                            value={filters.capacity} 
                            onChange={handleFilterChange}
                            placeholder="Capacity" 
                            min="0"
                            className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">Location</label>
                        <input 
                            type="text" 
                            name="location" 
                            value={filters.location} 
                            onChange={handleFilterChange}
                            placeholder="Location"
                            className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader className="animate-spin text-blue-600" size={40} />
                    <span className="ml-3 text-gray-600 text-lg">Loading resources...</span>
                </div>
            ) : resources.length === 0 ? (
                /* Empty State */
                <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                    <Search size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 font-medium text-lg">No resources found</p>
                    <p className="text-sm text-gray-500 mt-1">Try adjusting your search filters or check back later</p>
                </div>
            ) : (
                <>
                    {/* Resources Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {resources.map(r => (
                            <div 
                                key={r.id}
                                onClick={() => setSelectedResource(r)}
                                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer hover:scale-[1.02] transform"
                            >
                                {/* Card Header with Type */}
                                <div className={`bg-gradient-to-r ${getTypeColor(r.type)} p-4 text-white`}>
                                    <div className="flex items-center justify-between">
                                        <span className="text-3xl">{getTypeIcon(r.type)}</span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${r.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {r.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="p-5 space-y-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">{r.name}</h3>
                                        <p className="text-sm text-gray-600 mt-1">{r.type.replace(/_/g, ' ')}</p>
                                    </div>

                                    {/* Details */}
                                    <div className="space-y-2.5 pt-2 border-t border-gray-100">
                                        <div className="flex items-center gap-3 text-sm text-gray-700">
                                            <Users size={16} className="text-gray-500 flex-shrink-0" />
                                            <span>Capacity: <span className="font-semibold">{r.capacity}</span></span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-gray-700">
                                            <MapPin size={16} className="text-gray-500 flex-shrink-0" />
                                            <span>{r.location}</span>
                                        </div>
                                        {r.availabilityStartTime && r.availabilityEndTime && (
                                            <div className="flex items-center gap-3 text-sm text-gray-700">
                                                <Clock size={16} className="text-gray-500 flex-shrink-0" />
                                                <span>{r.availabilityStartTime} - {r.availabilityEndTime}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Button */}
                                    <button className="w-full mt-4 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
                            <p className="text-sm text-gray-600">
                                Showing {resources.length > 0 ? pagination.page * pagination.size + 1 : 0} to {Math.min((pagination.page + 1) * pagination.size, pagination.totalElements)} of {pagination.totalElements} resources
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page === 0}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Previous
                                </button>
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handlePageChange(i)}
                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pagination.page === i ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-100'}`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page >= pagination.totalPages - 1}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Detail Modal */}
            {selectedResource && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto animate-in fade-in duration-300">
                        <div className={`bg-gradient-to-r ${getTypeColor(selectedResource.type)} p-6 text-white`}>
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold">{selectedResource.name}</h2>
                                <button 
                                    onClick={() => setSelectedResource(null)}
                                    className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            {/* Type */}
                            <div>
                                <p className="text-xs text-gray-600 uppercase tracking-wider font-semibold mb-1">Type</p>
                                <p className="text-lg font-semibold text-gray-900">{selectedResource.type.replace(/_/g, ' ')}</p>
                            </div>

                            {/* Capacity */}
                            <div>
                                <p className="text-xs text-gray-600 uppercase tracking-wider font-semibold mb-1 flex items-center gap-2">
                                    <Users size={14} /> Capacity
                                </p>
                                <p className="text-lg font-semibold text-gray-900">{selectedResource.capacity} people</p>
                            </div>

                            {/* Location */}
                            <div>
                                <p className="text-xs text-gray-600 uppercase tracking-wider font-semibold mb-1 flex items-center gap-2">
                                    <MapPin size={14} /> Location
                                </p>
                                <p className="text-lg font-semibold text-gray-900">{selectedResource.location}</p>
                            </div>

                            {/* Availability */}
                            {selectedResource.availabilityStartTime && selectedResource.availabilityEndTime && (
                                <div>
                                    <p className="text-xs text-gray-600 uppercase tracking-wider font-semibold mb-1 flex items-center gap-2">
                                        <Clock size={14} /> Availability
                                    </p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {selectedResource.availabilityStartTime} - {selectedResource.availabilityEndTime}
                                    </p>
                                </div>
                            )}

                            {/* Status */}
                            <div>
                                <p className="text-xs text-gray-600 uppercase tracking-wider font-semibold mb-1">Status</p>
                                <span className={`inline-block px-4 py-2 rounded-lg text-sm font-semibold ${selectedResource.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {selectedResource.status}
                                </span>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 pt-4 border-t">
                                <button 
                                    onClick={() => setSelectedResource(null)}
                                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700 transition-colors"
                                >
                                    Close
                                </button>
                                <button 
                                    disabled={selectedResource.status !== 'ACTIVE'}
                                    className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors ${selectedResource.status === 'ACTIVE' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                                >
                                    {selectedResource.status === 'ACTIVE' ? 'Request Booking' : 'Not Available'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
