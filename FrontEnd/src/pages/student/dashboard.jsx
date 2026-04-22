import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);

  useEffect(() => {
    // API Mock Data
    setTimeout(() => {
      setStudentData({
        name: "Udula Athulathmudali",
        status: "Active",
        activeBookings: 2,
      });
      setLoading(false);
    }, 1000);
  }, []);

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
            Welcome back, {studentData.name.split(' ')[0]}! 👋
          </h1>
          <p className="text-slate-500 mt-1">Manage your campus bookings and schedule easily.</p>
        </div>
        
        {/* Status Badge */}
        <div className={`px-4 py-2 rounded-full border flex items-center gap-2 shadow-sm ${
          studentData.status === 'Active' ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'
        }`}>
          <div className={`w-2.5 h-2.5 rounded-full ${
            studentData.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
          }`} />
          <span className={`text-sm font-bold ${
            studentData.status === 'Active' ? 'text-emerald-700' : 'text-amber-700'
          }`}>
            {studentData.status} Account
          </span>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Active Bookings Stat - Clickable */}
        <StatCard 
          title="Active Bookings" 
          value={studentData.activeBookings} 
          iconElement={<Calendar size={28} />} 
          color="bg-blue-50 text-blue-600 border-blue-100"
          onClick={() => navigate('my-bookings')}
        />

        {/* My Bookings Action - Clickable */}
        <ActionCard 
          title="My Bookings" 
          description="Access your upcoming schedule and modify your reservations."
          iconElement={<Clock size={28} />}
          onClick={() => navigate('my-bookings')}
        />
      </div>
    </div>
  );
}

function StatCard({ title, value, iconElement, color, onClick }) {
  return (
    <Card 
      onClick={onClick}
      className={`p-8 flex items-center gap-6 border-2 transition-all cursor-pointer hover:shadow-md ${color}`}
    >
      <div className="p-4 bg-white rounded-2xl shadow-sm leading-none">
        {iconElement}
      </div>
      <div>
        <p className="text-sm font-bold uppercase tracking-wider opacity-80">{title}</p>
        <h2 className="text-4xl font-black mt-1">{value}</h2>
      </div>
    </Card>
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