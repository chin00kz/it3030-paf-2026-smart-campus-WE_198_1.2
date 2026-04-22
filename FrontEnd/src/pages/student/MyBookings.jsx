import { useState, useEffect } from "react";
import { Trash2, ChevronLeft, Clock, CheckCircle, History as HistoryIcon, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";

export default function MyBookings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  
  // Mock Data (පසුව මෙය API එකට සම්බන්ධ කළ හැක)
  const [bookings, setBookings] = useState([
    { id: 1, title: "Electronic Lab - Bench 05", date: "2026-04-25", time: "09:00 AM", status: "pending" },
    { id: 2, title: "Study Room 02", date: "2026-04-26", time: "02:00 PM", status: "pending" },
    { id: 3, title: "Main Hall - Seminar", date: "2026-04-20", time: "10:30 AM", status: "accepted" },
    { id: 4, title: "Computer Lab 01", date: "2026-04-10", time: "08:00 AM", status: "history" },
  ]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 800);
  }, []);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this pending booking?")) {
      setBookings(bookings.filter(booking => booking.id !== id));
    }
  };

  const filteredBookings = bookings.filter(b => b.status === activeTab);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-8 max-w-5xl mx-auto">
      {/* Back Button & Title */}
      <div className="flex flex-col gap-4">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors w-fit"
        >
          <ChevronLeft size={20} /> Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
      </div>

      {/* Custom Tabs */}
      <div className="flex gap-2 bg-slate-100 p-1 rounded-xl w-fit">
        <TabButton 
          label="Pending" 
          active={activeTab === "pending"} 
          onClick={() => setActiveTab("pending")} 
          icon={<Clock size={16} />}
        />
        <TabButton 
          label="Accepted" 
          active={activeTab === "accepted"} 
          onClick={() => setActiveTab("accepted")} 
          icon={<CheckCircle size={16} />}
        />
        <TabButton 
          label="History" 
          active={activeTab === "history"} 
          onClick={() => setActiveTab("history")} 
          icon={<HistoryIcon size={16} />}
        />
      </div>

      {/* Bookings List */}
      <div className="grid gap-4 mt-2">
        {filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => (
            <Card key={booking.id} className="p-5 flex items-center justify-between hover:shadow-md transition-all border-l-4 border-l-primary/50">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${activeTab === 'pending' ? 'bg-amber-100 text-amber-600' : activeTab === 'accepted' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-600'}`}>
                  {activeTab === 'pending' ? <Clock size={20} /> : activeTab === 'accepted' ? <CheckCircle size={20} /> : <HistoryIcon size={20} />}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{booking.title}</h3>
                  <p className="text-sm text-muted-foreground">{booking.date} • {booking.time}</p>
                </div>
              </div>

              {activeTab === "pending" && (
                <button 
                  onClick={() => handleDelete(booking.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  title="Delete Booking"
                >
                  <Trash2 size={20} />
                </button>
              )}
            </Card>
          ))
        ) : (
          <div className="text-center py-20 border-2 border-dashed rounded-2xl">
            <p className="text-muted-foreground italic">No {activeTab} bookings to show.</p>
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
        active 
          ? "bg-white text-primary shadow-sm" 
          : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
      }`}
    >
      {icon} {label}
    </button>
  );
}