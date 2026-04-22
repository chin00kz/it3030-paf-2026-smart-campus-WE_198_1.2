import { useState, useEffect } from "react";
import { Calendar, BookOpen, Clock, History, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function StudentDashboard() {
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);

  useEffect(() => {
    // API එකෙන් data ගන්නා කොටස (Mock data)
    setTimeout(() => {
      setStudentData({
        name: "Udula Athulathmudali",
        status: "Active", // මෙතනට API එකෙන් එන status එක දෙන්න (Active/Pending)
        activeBookings: 2,
        totalBookings: 15
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
    <div className="flex flex-1 flex-col gap-6 p-8 max-w-7xl mx-auto">
      {/* Header with Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {studentData.name.split(' ')[0]}! 👋</h1>
          <p className="text-muted-foreground mt-1">Here is your campus dashboard overview.</p>
        </div>
        
        {/* Status Badge */}
        <div className={`px-4 py-2 rounded-full border flex items-center gap-2 ${studentData.status === 'Active' ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
          <div className={`w-2 h-2 rounded-full ${studentData.status === 'Active' ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
          <span className={`text-sm font-semibold ${studentData.status === 'Active' ? 'text-green-700' : 'text-amber-700'}`}>
            Account Status: {studentData.status}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        <StatCard title="Active Bookings" value={studentData.activeBookings} iconElement={<Calendar size={24} />} color="bg-blue-100 text-blue-600" />
        <StatCard title="Total Bookings" value={studentData.totalBookings} iconElement={<History size={24} />} color="bg-purple-100 text-purple-600" />
      </div>

      {/* Main Actions */}
      <div className="grid gap-6 md:grid-cols-2 mt-4">
        <ActionCard 
          title="Facilities Catalogue" 
          description="Browse labs, study rooms, and other resources. Book your spot in seconds."
          iconElement={<BookOpen size={24} />}
        />
        <ActionCard 
          title="My Bookings" 
          description="View your upcoming schedule, modify or cancel existing facility bookings."
          iconElement={<Clock size={24} />}
        />
      </div>
    </div>
  );
}

function StatCard({ title, value, iconElement, color }) {
  return (
    <Card className="p-6 flex items-center gap-4 hover:shadow-md transition-all border-l-4 border-l-transparent hover:border-l-primary">
      <div className={`p-3 rounded-lg ${color}`}>{iconElement}</div>
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <h2 className="text-2xl font-bold">{value}</h2>
      </div>
    </Card>
  );
}

function ActionCard({ title, description, iconElement }) {
  return (
    <div className="group rounded-xl border bg-card p-6 shadow-sm hover:border-primary transition-all cursor-pointer hover:shadow-lg">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
        {iconElement}
      </div>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground mt-2">{description}</p>
    </div>
  );
}