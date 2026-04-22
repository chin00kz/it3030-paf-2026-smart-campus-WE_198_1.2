import { Calendar, AlertTriangle, BookOpen, Clock, LayoutDashboard } from "lucide-react";

export default function StudentDashboard() {
  return (
    <div className="flex flex-1 flex-col gap-8 p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, Student! 👋</h1>
        <p className="text-muted-foreground mt-1">Here is your daily campus overview.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-card p-6 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg text-blue-600"><Calendar size={24}/></div>
          <div>
            <p className="text-sm text-muted-foreground">Active Bookings</p>
            <h2 className="text-2xl font-bold">3</h2>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-100 rounded-lg text-amber-600"><AlertTriangle size={24}/></div>
          <div>
            <p className="text-sm text-muted-foreground">Open Tickets</p>
            <h2 className="text-2xl font-bold">1</h2>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-lg text-green-600"><Clock size={24}/></div>
          <div>
            <p className="text-sm text-muted-foreground">Study Hours</p>
            <h2 className="text-2xl font-bold">12h</h2>
          </div>
        </div>
      </div>

      {/* Main Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="group rounded-xl border bg-card p-6 shadow-sm hover:border-primary transition-all cursor-pointer hover:shadow-md">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
            <BookOpen size={24} />
          </div>
          <h3 className="text-xl font-semibold">Facilities Catalogue</h3>
          <p className="text-sm text-muted-foreground mt-2">Browse labs, study rooms, and other resources. Book your spot in seconds.</p>
        </div>

        <div className="group rounded-xl border bg-card p-6 shadow-sm hover:border-red-400 transition-all cursor-pointer hover:shadow-md">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-4 group-hover:scale-110 transition-transform">
            <AlertTriangle size={24} />
          </div>
          <h3 className="text-xl font-semibold">Report an Incident</h3>
          <p className="text-sm text-muted-foreground mt-2">Found a broken facility or technical issue? Let us know so we can fix it.</p>
        </div>
      </div>
    </div>
  )
}