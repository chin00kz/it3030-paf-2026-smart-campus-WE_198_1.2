import { useState, useEffect } from "react"
import { dashboardService } from "@/lib/api-client"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, ShieldCheck, FileText, Activity, ChevronRight, Zap, ArrowRight, ShieldAlert, Box, Grid, CheckCircle, XCircle } from "lucide-react"

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const data = await dashboardService.getStats()
        setStats(data)
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center p-12">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#3b82f6] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-8 p-1">
      {/* Header Section */}
      <div className="space-y-1">
        <h1 className="text-3xl font-black tracking-tighter text-[#3b82f6] uppercase">Global Dashboard</h1>
        <p className="text-slate-500 font-medium">Welcome back! Here's the pulse of Smart Campus today.</p>
      </div>

      <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Users className="text-[#3b82f6]" size={20} /> User Governance</h2>
          {/* Stats Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="TOTAL USERS" 
          value={stats?.totalUsers || 0} 
          description="Registered students & staff" 
          icon={Users} 
          trend="+5% from last month"
        />
        <StatCard 
          title="ACTIVE ADMINS" 
          value={stats?.activeAdmins || 0} 
          description="System administrators" 
          icon={ShieldCheck} 
        />
        <StatCard 
          title="PENDING APPROVALS" 
          value={stats?.pendingUsers || 0} 
          description="Users awaiting review" 
          icon={FileText} 
        />
        <StatCard 
          title="BANNED USERS" 
          value={stats?.bannedUsers || 0} 
          description="Accounts currently restricted" 
          icon={ShieldAlert} 
        />
      </div>
      </div>

      <div className="space-y-4 pt-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Box className="text-[#3b82f6]" size={20} /> Resource Overview</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard 
              title="TOTAL RESOURCES" 
              value={stats?.totalResources || 0} 
              description="Tracked campus assets" 
              icon={Box} 
            />
            <StatCard 
              title="ACTIVE ASSETS" 
              value={stats?.activeResources || 0} 
              description="Currently available" 
              icon={CheckCircle} 
            />
            <StatCard 
              title="OUT OF SERVICE" 
              value={stats?.outOfServiceResources || 0} 
              description="Unavailable / Maintenance" 
              icon={XCircle} 
            />
            <StatCard 
              title="CATEGORIES" 
              value={stats?.resourcesByType ? Object.keys(stats.resourcesByType).length : 0} 
              description="Distinct classifications" 
              icon={Grid} 
            />
          </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Activity Chart Area */}
        <Card className="lg:col-span-4 border-none shadow-[var(--unisync-card-shadow)] bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-800">Moderation Activity</CardTitle>
            <CardDescription className="text-sm font-medium">Activity overview from the last 7 days.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] relative overflow-hidden flex flex-col justify-end pb-8">
            {/* Visual Chart Bars */}
            <div className="absolute inset-0 flex items-end px-6 pb-20 justify-between opacity-10 pointer-events-none">
                {stats?.activityData?.map((item, i) => {
                    const maxCount = Math.max(...stats.activityData.map(d => d.count), 1);
                    const height = (item.count / maxCount) * 80 + 10;
                    return (
                        <div key={i} className="w-12 bg-[#3b82f6] rounded-t-lg transition-all duration-500" style={{ height: `${height}%` }} />
                    )
                })}
            </div>
            
            {/* SVG Area Chart - Dynamic Path */}
            <svg className="w-full h-[200px] text-[#3b82f6] drop-shadow-lg" viewBox="0 0 400 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="currentColor" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path 
                d={`M0,100 ${stats?.activityData?.map((item, i) => {
                    const maxCount = Math.max(...stats.activityData.map(d => d.count), 1);
                    const y = 100 - (item.count / maxCount) * 80 - 10;
                    const x = (i / (stats.activityData.length - 1)) * 400;
                    return `L${x},${y}`;
                }).join(' ')} L400,100 Z`} 
                fill="url(#chartGradient)" 
              />
              <path 
                d={stats?.activityData?.map((item, i) => {
                    const maxCount = Math.max(...stats.activityData.map(d => d.count), 1);
                    const y = 100 - (item.count / maxCount) * 80 - 10;
                    const x = (i / (stats.activityData.length - 1)) * 400;
                    return `${i === 0 ? 'M' : 'L'}${x},${y}`;
                }).join(' ')} 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="3" 
                strokeLinecap="round"
              />
            </svg>

            {/* Labels */}
            <div className="flex justify-between mt-6 text-xs font-bold text-slate-400">
              {stats?.activityData?.map((item, i) => (
                <span key={i}>{item.day}</span>
              ))}
            </div>

            {/* Tooltip Mockup - Now dynamic */}
            <div className="absolute top-1/2 left-1/2 -translate-x-4 -translate-y-12 bg-white shadow-xl rounded-lg p-3 border border-slate-100 hidden lg:block">
              <p className="text-[10px] font-bold text-slate-400 mb-1">Today</p>
              <p className="text-xs font-black text-[#3b82f6]">actions : {stats?.activityData?.[6]?.count || 0}</p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Panel */}
        <Card className="lg:col-span-3 border-none shadow-[var(--unisync-card-shadow)] bg-white flex flex-col">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-800">Quick Actions</CardTitle>
            <CardDescription className="text-sm font-medium">Common management tasks.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            <QuickActionButton label="Review Pending Approvals" />
            <QuickActionButton label="Manage User Roles" />
            <QuickActionButton label="View Banned Accounts" />
            
            <div className="pt-6 space-y-3 mt-auto">
              <Button className="w-full bg-[#1e293b] hover:bg-[#0f172a] h-12 font-bold rounded-xl gap-2 shadow-lg">
                <ShieldCheck className="h-4 w-4" />
                Enable Maintenance Mode
              </Button>
              <Button className="w-full h-12 font-bold rounded-xl gap-2 shadow-lg text-white transition-opacity hover:opacity-90" style={{ background: 'var(--unisync-gradient)' }}>
                Generate System Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({ title, value, description, icon: Icon, trend }) {
  return (
    <Card className="border-none shadow-[var(--unisync-card-shadow)] bg-white transition-transform hover:scale-[1.02]">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <p className="text-[11px] font-black text-slate-400 tracking-wider uppercase">{title}</p>
            <div className="text-4xl font-black text-slate-800 tracking-tighter">{value}</div>
          </div>
          <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 shadow-inner">
            <Icon className="h-6 w-6" />
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-1">
          <p className="text-xs font-bold text-slate-500">{description}</p>
          {trend && (
            <div className="flex items-center gap-1 text-[10px] font-black text-pink-500">
               <Zap className="h-3 w-3 fill-current" />
               {trend}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function QuickActionButton({ label }) {
  return (
    <div className="group flex items-center justify-between p-4 rounded-xl border border-slate-50 hover:bg-slate-50/50 hover:border-slate-100 transition-all cursor-pointer">
      <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900">{label}</span>
      <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
    </div>
  )
}
