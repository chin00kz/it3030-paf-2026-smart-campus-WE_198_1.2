import { useState, useEffect } from "react";
import { getAllBookings, updateBookingStatus } from "@/api/bookingApi";
import { 
    Calendar, Clock, User, Mail, MessageSquare, CheckCircle, XCircle, 
    AlertCircle, Loader, Search, Filter, Info, ChevronRight, X 
} from "lucide-react";

export default function AdminBookingsPage() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [declineReason, setDeclineReason] = useState("");
    const [showDeclineModal, setShowDeclineModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        setLoading(true);
        try {
            const data = await getAllBookings();
            setBookings(data);
        } catch (err) {
            setError("Failed to load bookings");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status, reason = "") => {
        setActionLoading(true);
        try {
            await updateBookingStatus(id, status, reason);
            setShowDeclineModal(false);
            setDeclineReason("");
            loadBookings();
        } catch (err) {
            setError("Failed to update booking status");
            console.error(err);
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'CONFIRMED': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-emerald-100';
            case 'DECLINED': return 'bg-red-500/10 text-red-600 border-red-500/20 shadow-red-100';
            case 'CANCELLED': return 'bg-slate-500/10 text-slate-500 border-slate-500/20 shadow-slate-100';
            default: return 'bg-amber-500/10 text-amber-600 border-amber-500/20 shadow-amber-100';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 -m-6 pb-20">
            {/* Compact Admin Hero */}
            <div className="mesh-gradient h-36 w-full flex flex-col items-center justify-center relative overflow-hidden px-6 rounded-b-[2rem] shadow-xl">
                <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]"></div>
                <div className="relative z-10 w-full max-w-7xl">
                    <div className="text-center md:text-left space-y-0.5">
                        <h1 className="text-2xl font-black text-white tracking-tight drop-shadow-2xl uppercase italic">
                            Reservation <span className="text-emerald-300">Authority</span>
                        </h1>
                        <p className="text-white/80 text-xs font-medium drop-shadow-md">
                            Orchestrating campus resource utilization and student requests
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-20 space-y-6">

                {/* Professional Error Banners */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 backdrop-blur-md rounded-xl p-3 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                        <div className="bg-red-500 p-1.5 rounded-lg">
                            <AlertCircle className="text-white" size={16} />
                        </div>
                        <p className="text-xs font-bold text-red-900">{error}</p>
                        <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600 font-black text-lg px-2">×</button>
                    </div>
                )}

                {/* Glass Dashboard Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass-morphism p-6 rounded-2xl border-white/60 shadow-lg group hover:scale-105 transition-all duration-500">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Pending Requests</p>
                        <div className="flex items-end justify-between">
                            <p className="text-4xl font-black text-amber-500 drop-shadow-sm">{bookings.filter(b => b.status === "PENDING").length}</p>
                            <div className="p-3 bg-amber-50 rounded-xl text-amber-500">
                                <Clock size={24} />
                            </div>
                        </div>
                    </div>
                    <div className="glass-morphism p-6 rounded-2xl border-white/60 shadow-lg group hover:scale-105 transition-all duration-500">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Registry volume</p>
                        <div className="flex items-end justify-between">
                            <p className="text-4xl font-black text-blue-600 drop-shadow-sm">{bookings.length}</p>
                            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                                <Calendar size={24} />
                            </div>
                        </div>
                    </div>
                    <div className="glass-morphism p-6 rounded-2xl border-white/60 shadow-lg group hover:scale-105 transition-all duration-500">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Confirmed Slots</p>
                        <div className="flex items-end justify-between">
                            <p className="text-4xl font-black text-emerald-500 drop-shadow-sm">{bookings.filter(b => b.status === "CONFIRMED").length}</p>
                            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-500">
                                <CheckCircle size={24} />
                            </div>
                        </div>
                    </div>
                </div>

            {/* Main Table Container */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Filter size={16} className="text-gray-400" />
                        <span className="text-sm font-bold text-gray-600">All Reservations</span>
                    </div>
                </div>

                {/* Refined Table Architecture */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/60 overflow-hidden">
                    <div className="p-5 border-b border-slate-100 bg-slate-900/[0.02] flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Info size={18} className="text-blue-500" />
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Reservation Registry</span>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16 space-y-3">
                            <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                            <span className="text-slate-400 font-black uppercase tracking-widest text-xs">Synchronizing Records...</span>
                        </div>
                    ) : bookings.length === 0 ? (
                        <div className="text-center py-16 space-y-3">
                            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-inner">
                                <Calendar size={32} className="text-slate-200" />
                            </div>
                            <p className="text-slate-800 font-black uppercase tracking-tight text-sm">No reservations found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-900/[0.01] border-b border-slate-50">
                                        <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Resource & Protocol</th>
                                        <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Deployment Identity</th>
                                        <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Schedule</th>
                                        <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-[0.2em] text-center">Status</th>
                                        <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {bookings.map((booking) => (
                                        <tr key={booking.id} className="hover:bg-blue-600/[0.01] transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <p className="font-black text-slate-800 group-hover:text-blue-600 transition-colors uppercase tracking-tight text-sm">{booking.resourceName}</p>
                                                    <div className="flex items-center gap-2 text-xs text-slate-400 font-black uppercase tracking-wider bg-slate-50 w-fit px-2.5 py-1 rounded-lg border border-slate-100">
                                                        <MessageSquare size={14} className="text-blue-500" />
                                                        <span className="truncate max-w-[200px] italic">{booking.purpose}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-[12px] shadow-md shadow-blue-100">
                                                            {booking.bookedByName?.charAt(0)}
                                                        </div>
                                                        <p className="font-black text-slate-800 text-xs uppercase tracking-tight">{booking.bookedByName}</p>
                                                    </div>
                                                    <p className="text-xs text-slate-400 font-bold tracking-widest pl-11 italic">{booking.bookedByEmail}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-lg w-fit">
                                                        <Calendar size={14} />
                                                        {booking.bookingDate}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-slate-400 font-black tracking-widest pl-1">
                                                        <Clock size={14} />
                                                        {booking.startTime} - {booking.endTime}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest border transition-all ${getStatusStyle(booking.status)}`}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-end gap-2.5">
                                                    {booking.status === "PENDING" ? (
                                                        <>
                                                            <button 
                                                                onClick={() => handleStatusUpdate(booking.id, "CONFIRMED")}
                                                                className="h-10 w-10 rounded-xl bg-slate-50 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center shadow-sm"
                                                                title="Approve Booking"
                                                            >
                                                                <CheckCircle size={20} />
                                                            </button>
                                                            <button 
                                                                onClick={() => {
                                                                    setSelectedBooking(booking);
                                                                    setShowDeclineModal(true);
                                                                }}
                                                                className="h-10 w-10 rounded-xl bg-slate-50 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center shadow-sm"
                                                                title="Decline Booking"
                                                            >
                                                                <XCircle size={20} />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-200 border border-slate-100">
                                                            <ChevronRight size={20} />
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Compact Decline Reason Modal */}
            {showDeclineModal && (
                <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
                        <div className="bg-gradient-to-r from-red-600 to-rose-700 p-6 text-white flex items-center justify-between">
                            <h2 className="text-xl font-black uppercase tracking-tighter italic flex items-center gap-3">
                                <XCircle size={18} /> Decline <span className="text-red-200">Request</span>
                            </h2>
                            <button onClick={() => setShowDeclineModal(false)} className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-all">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="bg-slate-50/50 p-5 rounded-xl border border-slate-100 space-y-2 shadow-inner">
                                <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Protocol Metadata</p>
                                <div className="space-y-1">
                                    <p className="font-black text-slate-800 uppercase tracking-tight text-sm">{selectedBooking?.resourceName}</p>
                                    <p className="text-xs text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded-md w-fit">{selectedBooking?.bookingDate}</p>
                                    <p className="text-xs text-slate-400 font-black uppercase tracking-widest pt-0.5 italic">{selectedBooking?.bookedByName}</p>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Exclusion Justification</label>
                                <textarea 
                                    value={declineReason}
                                    onChange={(e) => setDeclineReason(e.target.value)}
                                    className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm font-bold focus:bg-white focus:ring-2 focus:ring-red-500/10 transition-all shadow-inner min-h-[100px]"
                                    placeholder="Describe the objective for this rejection..."
                                />
                            </div>

                            <div className="flex gap-4 pt-2">
                                <button 
                                    onClick={() => setShowDeclineModal(false)}
                                    className="flex-1 px-6 py-3 rounded-xl border border-slate-200 font-black text-slate-400 hover:bg-slate-50 transition-all uppercase tracking-widest text-xs"
                                >
                                    Abort
                                </button>
                                <button 
                                    onClick={() => handleStatusUpdate(selectedBooking.id, "DECLINED", declineReason)}
                                    disabled={!declineReason.trim() || actionLoading}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-xl font-black uppercase tracking-[0.1em] text-xs hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {actionLoading ? <Loader className="animate-spin" size={18} /> : (
                                        <>
                                            Confirm <ChevronRight size={14} />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
    );
}
