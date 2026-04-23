import { useState, useEffect, useCallback } from "react";
import { Trash2, ChevronLeft, Clock, CheckCircle, History as HistoryIcon, Loader2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { getMyBookings, cancelBooking } from "@/api/bookingApi";

export default function MyBookings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState(null);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.email) {
        setBookings([]);
        return;
      }

      const data = await getMyBookings(user.email);
      setBookings(data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setError("Failed to load bookings. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Delete a pending booking
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this pending booking?")) {
      try {
        await cancelBooking(id, user?.email);
        setBookings(bookings.map((booking) =>
          booking.id === id ? { ...booking, status: "CANCELLED" } : booking
        ));
      } catch (error) {
        alert("Failed to delete the booking. It might already be processed.");
        console.error(error);
      }
    }
  };

  const getStatusTab = (status) => {
    const normalized = (status || "").toUpperCase();
    if (normalized === "PENDING") return "pending";
    if (normalized === "CONFIRMED") return "accepted";
    return "history";
  };

  const filteredBookings = bookings.filter((booking) => getStatusTab(booking.status) === activeTab);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-8 max-w-5xl mx-auto">
      {/* Header with Back Button */}
      <div className="flex flex-col gap-4">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors w-fit"
        >
          <ChevronLeft size={20} /> Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
      </div>

      {/* API Error Message */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 border border-red-100">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex gap-2 bg-slate-100 p-1 rounded-xl w-fit">
        <TabButton label="Pending" active={activeTab === "pending"} onClick={() => setActiveTab("pending")} icon={<Clock size={16} />} />
        <TabButton label="Accepted" active={activeTab === "accepted"} onClick={() => setActiveTab("accepted")} icon={<CheckCircle size={16} />} />
        <TabButton label="History" active={activeTab === "history"} onClick={() => setActiveTab("history")} icon={<HistoryIcon size={16} />} />
      </div>

      {/* Bookings Display Area */}
      <div className="grid gap-4 mt-2">
        {filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => (
            <Card key={booking.id} className="p-5 flex items-center justify-between hover:shadow-md transition-all border-l-4 border-l-primary/50">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${
                  activeTab === 'pending' ? 'bg-amber-100 text-amber-600' : 
                  activeTab === 'accepted' ? 'bg-green-100 text-green-600' : 
                  'bg-slate-100 text-slate-600'
                }`}>
                  {activeTab === 'pending' ? <Clock size={20} /> : 
                   activeTab === 'accepted' ? <CheckCircle size={20} /> : 
                   <HistoryIcon size={20} />}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{booking.resourceName || "Campus Resource"}</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(booking.bookingDate).toLocaleDateString()} • {booking.startTime}
                  </p>
                  {booking.status === "DECLINED" && booking.declineReason && (
                    <p className="text-xs text-red-600 mt-1">Rejected: {booking.declineReason}</p>
                  )}
                </div>
              </div>

              {/* Show delete button only for pending bookings */}
              {activeTab === "pending" && (
                <button 
                  onClick={() => handleDelete(booking.id)} 
                  className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              )}
            </Card>
          ))
        ) : (
          <div className="text-center py-20 border-2 border-dashed rounded-2xl bg-slate-50/50">
            <p className="text-muted-foreground italic">No {activeTab} bookings found.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({ label, active, onClick, icon }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all ${
        active ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
      }`}
    >
      {icon} {label}
    </button>
  );
}