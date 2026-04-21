import { useState, useEffect } from "react"
import { dashboardService } from "@/lib/api-client"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Box, Grid, CheckCircle, XCircle } from "lucide-react"

export default function ManagerDashboard() {
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
        <h1 className="text-3xl font-black tracking-tighter text-[#3b82f6] uppercase">Manager Dashboard</h1>
        <p className="text-slate-500 font-medium">Manage and monitor campus resources.</p>
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
    </div>
  )
}

function StatCard({ title, value, description, icon: Icon }) {
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
        </div>
      </CardContent>
    </Card>
  )
}

