import React, { useState, useEffect } from "react"
import { 
  ShieldAlert, 
  Settings, 
  ShieldCheck, 
  RefreshCw, 
  Lock, 
  Unlock,
  AlertTriangle,
  Info
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { useAuth } from "@/contexts/AuthContext"
import { settingsService } from "@/lib/api-client"

export default function SettingsPage() {
  const { user } = useAuth()
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    console.log("Current User Role:", user?.role)
    fetchMaintenanceStatus()
  }, [user])

  const fetchMaintenanceStatus = async () => {
    try {
      setIsLoading(true)
      const data = await settingsService.getMaintenanceStatus()
      console.log("Maintenance status fetched:", data)
      setMaintenanceMode(data.enabled)
    } catch (error) {
      console.error("Failed to fetch maintenance status:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleMaintenance = async (checked) => {
    console.log("Attempting to toggle maintenance to:", checked)
    try {
      setIsUpdating(true)
      await settingsService.toggleMaintenance(checked, {
        email: user.email,
        name: user.name
      })
      console.log("Maintenance status successfully updated")
      setMaintenanceMode(checked)
    } catch (error) {
      console.error("Failed to toggle maintenance mode:", error)
      alert("Failed to update status. Check console for CORS or network errors.")
    } finally {
      setIsUpdating(false)
    }
  }

  const isAdmin = user?.role === "SUPER_ADMIN" || user?.role === "ADMIN"

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {!isAdmin && (
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Access Restricted</AlertTitle>
          <AlertDescription>
            You do not have the required permissions to modify system settings.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-primary/10 p-2 rounded-lg">
          <Settings className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground text-sm">Manage global configuration and platform status.</p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card className="border-2 overflow-hidden">
          <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-xl flex items-center gap-2">
                  <ShieldAlert className={`h-5 w-5 ${maintenanceMode ? "text-amber-500" : "text-slate-400"}`} />
                  Maintenance Mode
                </CardTitle>
                <CardDescription>
                  Restrict platform access to administrative personnel only.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-2 rounded-full border shadow-sm px-4">
                 {maintenanceMode ? (
                   <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                     <Lock className="h-3 w-3" /> ACTIVE
                   </span>
                 ) : (
                   <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                     <Unlock className="h-3 w-3" /> DISABLED
                   </span>
                 )}
                 <Switch 
                  checked={maintenanceMode}
                  onCheckedChange={handleToggleMaintenance}
                  disabled={isUpdating || !isAdmin}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl h-fit">
                   <Info className="h-6 w-6 text-blue-500" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-sm">What happens when enabled?</h4>
                  <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-4">
                    <li>All non-admin users will be redirected to a dedicated maintenance page.</li>
                    <li>Currently active sessions for non-admins will be intercepted on their next action.</li>
                    <li>New logins will be blocked for Student, Technician, and Manager roles.</li>
                    <li>Super Admins and Admins retain full access to manage the system.</li>
                  </ul>
                </div>
              </div>

              {maintenanceMode && (
                <div className="bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800 p-4 rounded-lg flex gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                  <div>
                    <h5 className="font-bold text-amber-800 dark:text-amber-400 text-sm">Caution</h5>
                    <p className="text-amber-700 dark:text-amber-500/80 text-xs mt-1">
                      The platform is currently in maintenance mode. Active users are being redirected.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50 dark:bg-slate-900/50 border-t py-3 px-6">
             <p className="text-xs text-muted-foreground flex items-center gap-1">
               <ShieldCheck className="h-3 w-3" /> Only accessible by System Administrators
             </p>
          </CardFooter>
        </Card>

        {/* Placeholder for other settings */}
        <Card className="opacity-50 grayscale pointer-events-none">
          <CardHeader>
            <CardTitle className="text-lg">Database Backup</CardTitle>
            <CardDescription>Configure automated database snapshots.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}
