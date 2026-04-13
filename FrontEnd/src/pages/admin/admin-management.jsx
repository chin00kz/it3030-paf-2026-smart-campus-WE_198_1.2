import { useState, useEffect } from "react"
import { userService } from "@/lib/api-client"
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
import { Button } from "@/components/ui/button"
import { 
  Plus, 
  Trash2, 
  UserPlus, 
  Mail, 
  Phone, 
  Calendar,
  MoreVertical,
  ShieldCheck
} from "lucide-react"

export default function AdminManagement() {
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAdmins = async () => {
    try {
      setLoading(true)
      const data = await userService.getAllUsers()
      // Filter for ADMIN and SUPER_ADMIN role users
      setAdmins(data.filter(user => user.role === "ADMIN" || user.role === "SUPER_ADMIN"))
    } catch (error) {
      console.error("Failed to fetch admins:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAdmins()
  }, [])

  return (
    <div className="space-y-8 p-1">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-[#3b82f6] uppercase">Admin Management</h1>
          <p className="text-slate-500 font-medium">Manage and monitor system administrators.</p>
        </div>

        <Button className="h-11 px-6 rounded-xl font-bold bg-[#3b82f6] hover:bg-[#2563eb] shadow-lg shadow-blue-500/20 gap-2">
          <Plus className="h-5 w-5" />
          Add New User
        </Button>
      </div>

      {/* Admins Table */}
      <div className="bg-white rounded-2xl border-none shadow-[var(--unisync-card-shadow)] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
              <TableHead className="py-5 px-6 font-bold text-slate-400 text-xs uppercase tracking-wider">Administrator</TableHead>
              <TableHead className="py-5 px-6 font-bold text-slate-400 text-xs uppercase tracking-wider">SLIIT ID</TableHead>
              <TableHead className="py-5 px-6 font-bold text-slate-400 text-xs uppercase tracking-wider">Phone</TableHead>
              <TableHead className="py-5 px-6 font-bold text-slate-400 text-xs uppercase tracking-wider">Joined Date</TableHead>
              <TableHead className="py-5 px-6 font-bold text-slate-400 text-xs uppercase tracking-wider text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#3b82f6] border-t-transparent mx-auto mb-3" />
                  <p className="text-sm font-bold text-slate-400">Fetching administrators...</p>
                </TableCell>
              </TableRow>
            ) : admins.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <p className="font-bold text-slate-400">No administrators found.</p>
                </TableCell>
              </TableRow>
            ) : (
              admins.map((admin, index) => (
                <TableRow key={admin.id} className="group hover:bg-slate-50/50 transition-colors border-slate-100">
                  <TableCell className="py-4 px-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-11 w-11 shadow-sm border border-slate-100">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${admin.email}`} />
                        <AvatarFallback className="bg-[#3b82f6]/10 text-[#3b82f6] font-black">
                          {admin.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-800 leading-tight">{admin.name}</span>
                          {admin.role === "SUPER_ADMIN" ? (
                            <Badge className="bg-amber-100 text-amber-600 hover:bg-amber-100 border-none px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm">
                              SuperAdmin
                            </Badge>
                          ) : (
                            <Badge className="bg-rose-100 text-rose-600 hover:bg-rose-100 border-none px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest">
                              Admin
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs font-bold text-slate-400">{admin.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <span className="font-black text-slate-800 text-sm tracking-tighter">IT{23194762 + admin.id}</span>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <span className="font-black text-slate-800 text-xs tabular-nums tracking-wider px-2 py-1 bg-slate-50 rounded-lg">
                      0711562231
                    </span>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <span className="text-sm font-bold text-slate-500 tracking-tight">3/21/2026</span>
                  </TableCell>
                  <TableCell className="py-4 px-6 text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      disabled={admin.role === "SUPER_ADMIN"}
                      className="h-9 w-9 rounded-full text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
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
