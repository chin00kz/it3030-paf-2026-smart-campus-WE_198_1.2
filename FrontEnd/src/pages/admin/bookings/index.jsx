import { useState, useEffect } from "react";
import { getAllBookings, updateBookingStatus } from "@/api/bookingApi";
import { 
    Calendar, Clock, User, Mail, MessageSquare, CheckCircle, XCircle, 
    AlertCircle, Loader, Search, Filter, Info, ChevronRight 
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
            case 'CONFIRMED': return 'bg-green-100 text-green-700 border-green-200';
            case 'DECLINED': return 'bg-red-100 text-red-700 border-red-200';
            case 'CANCELLED': return 'bg-gray-100 text-gray-700 border-gray-200';
            default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Resource Bookings</h1>
                <p className="text-sm text-gray-500 mt-1">Review and manage student facility requests</p>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
                    <AlertCircle className="text-red-600" size={20} />
                    <p className="text-sm font-medium text-red-800">{error}</p>
                    <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600 font-bold">×</button>
                </div>
            )}

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Pending Requests</p>
                    <p className="text-3xl font-black text-yellow-600">{bookings.filter(b => b.status === "PENDING").length}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Bookings</p>
                    <p className="text-3xl font-black text-blue-600">{bookings.length}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Confirmed Slots</p>
                    <p className="text-3xl font-black text-green-600">{bookings.filter(b => b.status === "CONFIRMED").length}</p>
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

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader className="animate-spin text-blue-600 mb-4" size={40} />
                        <p className="text-gray-500 font-medium">Fetching booking data...</p>
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                            <Calendar size={32} className="text-gray-300" />
                        </div>
                        <p className="text-gray-600 font-bold text-lg">No bookings found</p>
                        <p className="text-sm text-gray-400">Student requests will appear here once submitted</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Resource & Info</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Booked By</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Schedule</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {bookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-blue-50/20 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="space-y-1">
                                                <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{booking.resourceName}</p>
                                                <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium bg-gray-50 w-fit px-2 py-0.5 rounded-md">
                                                    <MessageSquare size={12} />
                                                    <span className="truncate max-w-[200px]">{booking.purpose}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-[10px]">
                                                        {booking.bookedByName?.charAt(0)}
                                                    </div>
                                                    <p className="font-semibold text-gray-800 text-sm">{booking.bookedByName}</p>
                                                </div>
                                                <p className="text-[11px] text-gray-400 ml-9 font-medium">{booking.bookedByEmail}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2 text-gray-700 font-bold text-xs bg-gray-100 px-2 py-1 rounded-lg w-fit">
                                                    <Calendar size={13} className="text-blue-500" />
                                                    {booking.bookingDate}
                                                </div>
                                                <div className="flex items-center gap-2 text-[11px] text-gray-500 font-semibold pl-1">
                                                    <Clock size={13} className="text-gray-400" />
                                                    {booking.startTime} - {booking.endTime}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(booking.status)}`}>
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex justify-end gap-2">
                                                {booking.status === "PENDING" ? (
                                                    <>
                                                        <button 
                                                            onClick={() => handleStatusUpdate(booking.id, "CONFIRMED")}
                                                            className="h-9 w-9 rounded-xl bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition-all flex items-center justify-center shadow-sm"
                                                            title="Approve Booking"
                                                        >
                                                            <CheckCircle size={18} />
                                                        </button>
                                                        <button 
                                                            onClick={() => {
                                                                setSelectedBooking(booking);
                                                                setShowDeclineModal(true);
                                                            }}
                                                            className="h-9 w-9 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center shadow-sm"
                                                            title="Decline Booking"
                                                        >
                                                            <XCircle size={18} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <div className="h-9 w-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-300">
                                                        <ChevronRight size={18} />
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

            {/* Decline Reason Modal */}
            {showDeclineModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden scale-in-center">
                        <div className="bg-red-600 p-6 text-white flex items-center justify-between">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <XCircle size={22} /> Decline Booking
                            </h2>
                            <button onClick={() => setShowDeclineModal(false)} className="hover:bg-red-700 p-1 rounded-xl transition-colors">
                                <XCircle size={24} className="opacity-70" />
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Booking Info</p>
                                <p className="font-bold text-gray-900">{selectedBooking?.resourceName} - {selectedBooking?.bookingDate}</p>
                                <p className="text-sm text-gray-500 font-medium">{selectedBooking?.bookedByName}</p>
                            </div>
                            
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-widest">Reason for declining</label>
                                <textarea 
                                    value={declineReason}
                                    onChange={(e) => setDeclineReason(e.target.value)}
                                    className="w-full border-2 border-gray-100 rounded-2xl p-4 text-sm min-h-[120px] focus:outline-none focus:border-red-500 transition-colors bg-gray-50"
                                    placeholder="e.g., Room is closed for maintenance, Conflict with priority event..."
                                />
                            </div>

                            <div className="flex gap-4 pt-2">
                                <button 
                                    onClick={() => setShowDeclineModal(false)}
                                    className="flex-1 px-6 py-3 rounded-2xl border-2 border-gray-100 font-bold text-gray-500 hover:bg-gray-50 transition-all"
                                >
                                    Go Back
                                </button>
                                <button 
                                    onClick={() => handleStatusUpdate(selectedBooking.id, "DECLINED", declineReason)}
                                    disabled={!declineReason.trim() || actionLoading}
                                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 disabled:opacity-50 shadow-lg shadow-red-100 flex items-center justify-center transition-all"
                                >
                                    {actionLoading ? <Loader className="animate-spin" size={18} /> : 'Decline Request'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
