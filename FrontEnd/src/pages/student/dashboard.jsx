import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { getMyBookings } from "@/api/bookingApi";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState({
    name: "Student",
    status: "ACTIVE",
    bookings: [],
  });

  useEffect(() => {
    const loadStudentDashboard = async () => {
      try {
        setLoading(true);

        if (!user?.email) {
          setStudentData({
            name: user?.name || "Student",
            status: user?.status || "ACTIVE",
            bookings: [],
          });
          return;
        }

        const bookings = await getMyBookings(user.email);
        setStudentData({
          name: user?.name || "Student",
          status: user?.status || "ACTIVE",
          bookings: Array.isArray(bookings) ? bookings : [],
        });
      } catch (error) {
        console.error("Error loading student dashboard:", error);
        setStudentData({
          name: user?.name || "Student",
          status: user?.status || "ACTIVE",
          bookings: [],
        });
      } finally {
        setLoading(false);
      }
    };

    loadStudentDashboard();
  }, [user?.email, user?.name, user?.status]);

  const toBookingDateTime = (booking) => {
    const bookingDate = booking.bookingDate || booking.date;
    const rawStartTime = booking.startTime || booking.time;

    if (!bookingDate || !rawStartTime) {
      return null;
    }

    const [hoursStr, minutesStr] = String(rawStartTime).split(":");
    const hours = Number.parseInt(hoursStr, 10);
    const minutes = Number.parseInt(minutesStr, 10);

    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
      return null;
    }

    const date = new Date(`${bookingDate}T00:00:00`);
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const nextBooking = useMemo(() => {
    if (!studentData?.bookings?.length) {
      return null;
    }

    const now = new Date();

    return studentData.bookings
      .filter((booking) => {
        const normalizedStatus = (booking.status || "").toUpperCase();
        return normalizedStatus === "CONFIRMED" || normalizedStatus === "ACCEPTED";
      })
      .map((booking) => ({
        booking,
        startDateTime: toBookingDateTime(booking),
      }))
      .filter(({ startDateTime }) => startDateTime && startDateTime >= now)
      .sort((a, b) => a.startDateTime - b.startDateTime)[0]?.booking || null;
  }, [studentData?.bookings]);

  const isActive = String(studentData.status || "").toUpperCase() === "ACTIVE";

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-8 p-8 max-w-5xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Welcome back, {(studentData.name || "Student").split(' ')[0]}! 👋
          </h1>
          <p className="text-slate-500 mt-1">Manage your campus bookings and schedule easily.</p>
        </div>
        
        {/* Status Badge */}
        <div className={`px-4 py-2 rounded-full border flex items-center gap-2 shadow-sm ${
          isActive ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'
        }`}>
          <div className={`w-2.5 h-2.5 rounded-full ${
            isActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
          }`} />
          <span className={`text-sm font-bold ${
            isActive ? 'text-emerald-700' : 'text-amber-700'
          }`}>
            {String(studentData.status || "ACTIVE")} Account
          </span>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        
        {/* Next Session Card (Replacement for Active Bookings) */}
        <Card className="p-8 flex items-center gap-6 border-2 border-indigo-100 bg-indigo-50/50">
          <div className="p-4 bg-white rounded-2xl shadow-sm text-indigo-600">
            <Clock size={28} />
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-indigo-600/70">Next Session</p>
            {nextBooking ? (
              <>
                <h2 className="text-xl font-black mt-1 text-slate-800">
                  {nextBooking.resourceName || nextBooking.title || "Campus Resource"}
                </h2>
                <p className="text-sm font-medium text-slate-500 flex items-center gap-1 mt-1">
                    <Calendar size={14}/> {nextBooking.bookingDate || nextBooking.date} • {nextBooking.startTime || nextBooking.time}
                </p>
              </>
            ) : (
              <h2 className="text-xl font-bold mt-1 text-slate-600">No upcoming sessions</h2>
            )}
          </div>
        </Card>

        {/* My Bookings Action */}
        <ActionCard 
          title="My Bookings" 
          description="Access your upcoming schedule and modify your reservations."
          iconElement={<Calendar size={28} />}
          onClick={() => navigate('my-bookings')}
        />
      </div>
    </div>
  );
}

function ActionCard({ title, description, iconElement, onClick }) {
  return (
    <Card 
      onClick={onClick}
      className="group p-8 flex flex-col justify-center border-2 border-slate-100 hover:border-primary hover:shadow-lg transition-all cursor-pointer bg-white"
    >
      <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-600 mb-4 group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm">
        {iconElement}
      </div>
      <h3 className="text-xl font-bold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-500 mt-2 leading-relaxed">{description}</p>
    </Card>
  );
}