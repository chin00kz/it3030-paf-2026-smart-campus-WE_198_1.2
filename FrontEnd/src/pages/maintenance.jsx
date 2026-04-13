import React from "react"
import { Hammer, RefreshCw, LogOut, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { useNavigate } from "react-router-dom"

export default function MaintenancePage() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    // Add a slight delay for better UX
    setTimeout(() => {
      window.location.href = "/"
    }, 800)
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white overflow-hidden relative">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />
      
      <div className="max-w-md w-full text-center space-y-8 relative z-10">
        <div className="flex justify-center">
          <div className="relative">
             <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl animate-pulse" />
             <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl relative">
                <Hammer className="w-16 h-16 text-blue-400 animate-bounce" />
             </div>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            System Maintenance
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            SmartCampus is currently undergoing planned maintenance to improve your experience. 
            We'll be back online shortly.
          </p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800/50 p-4 rounded-2xl flex items-center gap-3 text-sm text-amber-400/90 text-left">
           <ShieldAlert className="w-5 h-5 shrink-0" />
           <p>Only administrators and maintenance personnel can access the system at this time.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all shadow-lg shadow-blue-900/20 group"
          >
            <RefreshCw className={`mr-2 w-4 h-4 ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
            {isRefreshing ? "Checking..." : "Refresh Page"}
          </Button>
          <Button 
            onClick={handleLogout}
            variant="outline"
            className="flex-1 h-12 rounded-xl border-slate-700 bg-transparent hover:bg-slate-800 text-slate-300 font-semibold"
          >
            <LogOut className="mr-2 w-4 h-4" />
            Logout
          </Button>
        </div>

        <div className="pt-12 text-slate-500 text-sm">
          © {new Date().getFullYear()} SmartCampus Platform. All rights reserved.
        </div>
      </div>
    </div>
  )
}
