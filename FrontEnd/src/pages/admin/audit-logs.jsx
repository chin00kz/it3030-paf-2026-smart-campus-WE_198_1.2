import { useState, useEffect } from "react"
import { auditLogService } from "@/lib/api-client"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Activity, 
  Clock, 
  Terminal, 
  Shield, 
  User, 
  Filter,
  Download
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function AuditLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const data = await auditLogService.getAllLogs()
      setLogs(data)
    } catch (error) {
      console.error("Failed to fetch logs:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  const getActionBadge = (action) => {
    const configs = {
      LOGIN: "bg-slate-100 text-slate-800 border-none",
      USER_CREATE: "bg-emerald-100 text-emerald-700 border-none",
      USER_UPDATE: "bg-amber-100 text-amber-700 border-none",
      USER_STATUS_CHANGE: "bg-rose-100 text-rose-700 border-none",
      ROLE_CHANGE: "bg-purple-100 text-purple-700 border-none",
      SETTINGS_UPDATE: "bg-blue-100 text-blue-700 border-none",
      SECURITY_ALERT: "bg-red-500 text-white border-none",
    }
    
    return (
      <Badge className={cn(
        "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest",
        configs[action] || "bg-slate-50 text-slate-500"
      )}>
        {action.replace(/_/g, " ")}
      </Badge>
    )
  }

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "N/A"
    const date = new Date(timestamp)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date)
  }

  return (
    <div className="space-y-8 p-1">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-[#3b82f6] uppercase">System Audit Logs</h1>
          <p className="text-slate-500 font-medium">Detailed history of all administrative actions performed on the platform.</p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-11 rounded-xl font-bold border-slate-200 gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" className="h-11 rounded-xl font-bold border-slate-200 gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-2xl border-none shadow-[var(--unisync-card-shadow)] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
              <TableHead className="py-5 px-6 font-bold text-slate-400 text-xs uppercase tracking-wider">Admin</TableHead>
              <TableHead className="py-5 px-6 font-bold text-slate-400 text-xs uppercase tracking-wider">Action</TableHead>
              <TableHead className="py-5 px-6 font-bold text-slate-400 text-xs uppercase tracking-wider">Target</TableHead>
              <TableHead className="py-5 px-6 font-bold text-slate-400 text-xs uppercase tracking-wider">Details</TableHead>
              <TableHead className="py-5 px-6 font-bold text-slate-400 text-xs uppercase tracking-wider">Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Terminal className="h-8 w-8 text-[#3b82f6] animate-pulse" />
                    <p className="text-sm font-bold text-slate-400">Syncing with security logs...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 opacity-50">
                    <Activity className="h-10 w-10 text-slate-300" />
                    <p className="font-bold text-slate-400">No activity recorded yet.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id} className="group hover:bg-slate-50/50 transition-colors border-slate-100">
                  <TableCell className="py-4 px-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-9 w-9 shadow-sm border border-slate-100">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${log.adminEmail}`} />
                        <AvatarFallback className="bg-slate-100 text-slate-500 font-bold text-xs uppercase">
                          {log.adminName?.charAt(0) || "A"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-sm leading-tight">{log.adminName}</span>
                        <span className="text-[10px] font-bold text-slate-400">{log.adminEmail}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    {getActionBadge(log.action)}
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <span className="font-black text-slate-800 text-xs tabular-nums tracking-widest bg-slate-100/50 px-2 py-1 rounded">
                      ID-{log.targetId}
                    </span>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <p className="text-xs font-bold text-slate-500 max-w-[300px] line-clamp-2">
                      {log.details}
                    </p>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock className="h-3 w-3" />
                      <span className="text-xs font-bold">{formatTimestamp(log.timestamp)}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
