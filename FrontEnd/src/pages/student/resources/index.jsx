import { useState, useEffect } from "react";
import { getResources, getErrorMessage } from "@/api/resourceApi";
import { createBooking } from "@/api/bookingApi";
import { Search, AlertCircle, Loader, MapPin, Users, Clock, X, Calendar, Plus, ChevronRight } from "lucide-react";

export default function StudentResourcesPage() {
    const [resources, setResources] = useState([]);
    const [filters, setFilters] = useState({ type: "", capacity: "", location: "", name: "", status: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({ page: 0, size: 10, totalPages: 0, totalElements: 0 });
    const [selectedResource, setSelectedResource] = useState(null);

    const resourceTypes = ["LECTURE_HALL", "LAB", "MEETING_ROOM", "EQUIPMENT"];
    const resourceStatuses = ["AVAILABLE", "UNAVAILABLE"];

    const [bookingData, setBookingData] = useState({
        bookedByName: "",
        bookedByEmail: "",
        bookingDate: new Date().toISOString().split('T')[0],
        startTime: "09:00",
        endTime: "10:00",
        purpose: ""
    });
    const [bookingLoading, setBookingLoading] = useState(false);
    const [showBookingModal, setShowBookingModal] = useState(false);

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

    const handleBookingChange = (e) => {
        const { name, value } = e.target;
        setBookingData(prev => ({ ...prev, [name]: value }));
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < pagination.totalPages) {
            setPagination(prev => ({ ...prev, page: newPage }));
        }
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        setBookingLoading(true);
        setError(null);
        try {
            await createBooking({
                ...bookingData,
                resourceId: selectedResource.id,
                startTime: bookingData.startTime + ":00", // Format for Backend LocalTime
                endTime: bookingData.endTime + ":00"
            });
            setShowBookingModal(false);
            setSelectedResource(null);
            setError(null); // Clear errors on success
            loadResources(); // Refresh list to update availability
            alert("Booking request submitted successfully!");
        } catch (error) {
            setError(getErrorMessage(error));
        } finally {
            setBookingLoading(false);
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
        <div className="min-h-screen bg-slate-50/50 -m-6 pb-20">
            {/* Premium Mesh Hero Section */}
            <div className="mesh-gradient h-64 w-full flex flex-col items-center justify-center relative overflow-hidden px-6 rounded-b-[4rem] shadow-2xl">
                <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]"></div>
                <div className="relative z-10 text-center space-y-3 pt-0">
                    <h1 className="text-4xl font-black text-white tracking-tight drop-shadow-2xl">
                        Campus <span className="text-emerald-300">Resources</span>
                    </h1>
                    <p className="text-white/90 text-xl font-medium max-w-2xl mx-auto drop-shadow-md">
                        Reserve world-class facilities and assets with our intelligent campus ecosystem.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-20 space-y-12">
                {/* Global Error Banner */}
                {error && !showBookingModal && (
                    <div className="bg-red-500/10 border border-red-500/20 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="bg-red-500 p-2 rounded-xl">
                            <AlertCircle className="text-white" size={20} />
                        </div>
                        <p className="text-sm font-bold text-red-900">{error}</p>
                        <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600 font-black text-xl px-2">×</button>
                    </div>
                )}

                {/* Futuristic Filter Architecture */}
                <div className="glass-morphism rounded-[2rem] p-4 flex flex-col lg:flex-row items-center gap-4 transition-all hover:shadow-2xl hover:bg-white/80 border-white/60 group">
                    <div className="flex-1 w-full relative">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                        <input 
                            type="text" 
                            name="name" 
                            value={filters.name} 
                            onChange={handleFilterChange}
                            placeholder="Explore campus resources..."
                            className="w-full bg-white/40 border-none rounded-[1.5rem] pl-14 pr-6 py-3.5 transition-all text-slate-800 placeholder:text-slate-400 font-bold text-lg focus:ring-0 focus:bg-white shadow-inner"
                        />
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-6 w-full lg:w-auto">
                        <div className="flex p-2 bg-slate-200/50 rounded-[1.5rem] gap-1 shrink-0 overflow-x-auto max-w-full backdrop-blur-md">
                            <button 
                                onClick={() => handleFilterChange({ target: { name: 'type', value: '' } })}
                                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${!filters.type ? 'bg-white text-blue-600 shadow-xl scale-105' : 'text-slate-500 hover:text-slate-800 hover:bg-white/30'}`}
                            >
                                All Types
                            </button>
                            {resourceTypes.map(t => (
                                <button 
                                    key={t}
                                    onClick={() => handleFilterChange({ target: { name: 'type', value: t } })}
                                    className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${filters.type === t ? 'bg-white text-blue-600 shadow-xl scale-105' : 'text-slate-500 hover:text-slate-800 hover:bg-white/30'}`}
                                >
                                    {t.replace(/_/g, ' ')}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Immersive Loading State */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-4">
                        <div className="relative">
                            <div className="w-20 h-20 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                            <Loader className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600 animate-pulse" size={32} />
                        </div>
                        <span className="text-slate-400 font-black uppercase tracking-[0.3em] text-sm animate-pulse">Synchronizing Resources...</span>
                    </div>
                ) : resources.length === 0 ? (
                    /* Elegant Empty State */
                    <div className="text-center py-32 glass-morphism rounded-[3rem] border-dashed border-2 border-slate-200">
                        <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <Search size={40} className="text-slate-300" />
                        </div>
                        <p className="text-slate-800 font-black text-2xl uppercase tracking-tight">No Resources Found</p>
                        <p className="text-slate-400 font-medium mt-2 max-w-sm mx-auto">Try refining your search or filters to discover available campus assets.</p>
                    </div>
                ) : (
                    <>
                        {/* High-End Resources Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mt-4">
                            {resources.map(r => (
                                <div 
                                    key={r.id}
                                    onClick={() => {
                                        setError(null);
                                        setSelectedResource(r);
                                    }}
                                    className="group bg-white rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer hover:-translate-y-2 border border-slate-100"
                                >
                                    {/* Immersive Card Header */}
                                    <div className={`h-44 relative flex items-center justify-center overflow-hidden bg-gradient-to-br ${
                                        r.type === 'LECTURE_HALL' ? 'from-blue-600 to-indigo-700' :
                                        r.type === 'LAB' ? 'from-emerald-500 to-teal-700' :
                                        r.type === 'MEETING_ROOM' ? 'from-sky-400 to-blue-600' :
                                        'from-amber-400 to-orange-600'
                                    }`}>
                                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                        <span className="text-7xl drop-shadow-2xl transform group-hover:scale-125 transition-transform duration-700 ease-out">{getTypeIcon(r.type)}</span>
                                        
                                        <div className="absolute top-6 right-6">
                                            <span className={`glass-morphism px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border-white/40 shadow-lg ${
                                                r.status !== 'UNAVAILABLE' ? 'text-emerald-500' : 'text-red-500'
                                            }`}>
                                                {r.status !== 'UNAVAILABLE' ? 'Available' : 'Offline'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Refined Card Content */}
                                    <div className="p-8 space-y-6">
                                        <div className="space-y-1">
                                            <h3 className="text-2xl font-black text-slate-900 leading-tight group-hover:text-blue-600 transition-colors uppercase tracking-tight">{r.name}</h3>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                                {r.type.replace(/_/g, ' ')}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2.5 bg-slate-50 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                                    <Users size={18} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Capacity</span>
                                                    <span className="text-sm font-black text-slate-700">{r.capacity}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="p-2.5 bg-slate-50 rounded-xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                                                    <MapPin size={18} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Location</span>
                                                    <span className="text-sm font-black text-slate-700 truncate max-w-[100px]">{r.location}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <button className="w-full py-4 rounded-2xl bg-blue-50/50 border border-blue-100/50 text-blue-700 font-black text-sm uppercase tracking-widest group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-lg group-hover:shadow-blue-200/50">
                                            Dive Deeper
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                    {/* Modern Pagination Architecture */}
                    {pagination.totalPages > 1 && (
                        <div className="flex flex-col md:flex-row items-center justify-between glass-morphism p-6 rounded-[2rem] border-white/60 gap-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                Showing <span className="text-blue-600">{resources.length > 0 ? pagination.page * pagination.size + 1 : 0} — {Math.min((pagination.page + 1) * pagination.size, pagination.totalElements)}</span> of <span className="text-slate-800">{pagination.totalElements}</span> resources
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page === 0}
                                    className="px-6 py-3 rounded-xl border-2 border-slate-100 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    Previous
                                </button>
                                <div className="flex items-center gap-2">
                                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handlePageChange(i)}
                                            className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${pagination.page === i ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-110' : 'bg-slate-50 text-slate-400 hover:bg-white hover:text-slate-800'}`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page >= pagination.totalPages - 1}
                                    className="px-6 py-3 rounded-xl border-2 border-slate-100 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
            </div>

            {/* Premium Detail Modal */}
            {selectedResource && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-500">
                    <div className="bg-white/90 backdrop-blur-xl rounded-[3rem] shadow-2xl w-full max-w-xl overflow-hidden border border-white/40 animate-in zoom-in-95 duration-300">
                        <div className={`h-40 relative flex flex-col justify-end p-8 bg-gradient-to-br ${
                            selectedResource.type === 'LECTURE_HALL' ? 'from-blue-600 to-indigo-700' :
                            selectedResource.type === 'LAB' ? 'from-emerald-500 to-teal-700' :
                            'from-sky-400 to-blue-600'
                        }`}>
                            <div className="absolute top-8 right-8">
                                <button 
                                    onClick={() => setSelectedResource(null)}
                                    className="bg-white/20 hover:bg-white/40 rounded-2xl p-3 text-white transition-all backdrop-blur-md border border-white/20"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                            <h2 className="text-4xl font-black text-white tracking-tight drop-shadow-md uppercase italic">{selectedResource.name}</h2>
                        </div>
                        
                        <div className="p-10 space-y-8">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Facility Type</p>
                                    <p className="text-lg font-black text-slate-800">{selectedResource.type.replace(/_/g, ' ')}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Capacity</p>
                                    <p className="text-lg font-black text-slate-800 flex items-center gap-2">
                                        <Users className="text-blue-500" size={18} />
                                        {selectedResource.capacity} Seats
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Exact Location</p>
                                    <p className="text-lg font-black text-slate-800 flex items-center gap-2">
                                        <MapPin className="text-emerald-500" size={18} />
                                        {selectedResource.location}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operational Hours</p>
                                    <p className="text-lg font-black text-slate-800 flex items-center gap-2">
                                        <Clock className="text-amber-500" size={18} />
                                        {selectedResource.availabilityStartTime || '08:00'} - {selectedResource.availabilityEndTime || '18:00'}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-8 flex gap-5 border-t border-slate-100">
                                <button 
                                    onClick={() => setSelectedResource(null)}
                                    className="flex-1 px-8 py-5 rounded-2xl bg-slate-50 border border-slate-200 font-black text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all uppercase tracking-widest text-xs shadow-sm"
                                >
                                    Exit
                                </button>
                                <button 
                                    onClick={() => setShowBookingModal(true)}
                                    disabled={selectedResource.status === 'UNAVAILABLE'}
                                    className={`flex-1 px-8 py-5 rounded-2xl font-black transition-all shadow-xl uppercase tracking-[0.2em] text-xs ${
                                        selectedResource.status !== 'UNAVAILABLE' 
                                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200' 
                                        : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                                    }`}
                                >
                                    {selectedResource.status !== 'UNAVAILABLE' ? 'Launch Booking' : 'Resource Offline'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* High-End Booking Modal */}
            {showBookingModal && (
                <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-[60] backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white flex items-center justify-between">
                            <h2 className="text-2xl font-black flex items-center gap-3 uppercase tracking-tighter italic">
                                <Calendar size={24} className="text-emerald-300" /> Confirm Sequence
                            </h2>
                            <button 
                                onClick={() => {
                                    setShowBookingModal(false);
                                    setError(null);
                                }} 
                                className="bg-white/20 hover:bg-white/30 p-2 rounded-xl transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleBookingSubmit} className="p-10 space-y-6">
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
                                    <AlertCircle className="text-red-500 shrink-0" size={20} />
                                    <p className="text-sm font-bold text-red-900">{error}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Protocol Alias</label>
                                    <input 
                                        required name="bookedByName" value={bookingData.bookedByName} onChange={handleBookingChange}
                                        type="text" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all shadow-inner" 
                                        placeholder="Full Name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Digital Identity</label>
                                    <input 
                                        required name="bookedByEmail" value={bookingData.bookedByEmail} onChange={handleBookingChange}
                                        type="email" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all shadow-inner" 
                                        placeholder="Email Address"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Target Sequence Date</label>
                                <input 
                                    required name="bookingDate" value={bookingData.bookingDate} onChange={handleBookingChange}
                                    type="date" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all shadow-inner"
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Inception</label>
                                    <input 
                                        required name="startTime" value={bookingData.startTime} onChange={handleBookingChange}
                                        type="time" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all shadow-inner"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Conclusion</label>
                                    <input 
                                        required name="endTime" value={bookingData.endTime} onChange={handleBookingChange}
                                        type="time" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all shadow-inner"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Operation Purpose</label>
                                <textarea 
                                    required name="purpose" value={bookingData.purpose} onChange={handleBookingChange}
                                    className="w-full bg-slate-50 border-none rounded-[1.5rem] p-5 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all shadow-inner min-h-[100px]" 
                                    placeholder="Describe the objective of this resource utilization..."
                                />
                            </div>

                            <div className="pt-6 flex gap-5">
                                <button 
                                    type="button" onClick={() => setShowBookingModal(false)}
                                    className="flex-1 px-8 py-4 rounded-2xl bg-slate-50 border border-slate-200 font-black text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all uppercase tracking-widest text-[10px]"
                                >
                                    Abort
                                </button>
                                <button 
                                    type="submit" disabled={bookingLoading}
                                    className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:shadow-xl hover:shadow-blue-200 transition-all disabled:opacity-50 flex justify-center items-center gap-2 shadow-lg"
                                >
                                    {bookingLoading ? <Loader className="animate-spin" size={16} /> : (
                                        <>
                                            Initialize <ChevronRight size={14} />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
