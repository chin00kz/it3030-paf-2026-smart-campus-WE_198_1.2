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
import { Button } from "@/components/ui/button"
import { ShieldAlert, ShieldCheck, Mail, UserX } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function BannedUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchBannedUsers = async () => {
    try {
      setLoading(true)
      const allUsers = await userService.getAllUsers()
      setUsers(allUsers.filter(u => u.status === "BANNED"))
    } catch (error) {
      console.error("Failed to fetch banned users:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBannedUsers()
  }, [])

  const handleActivate = async (id) => {
    try {
      await userService.updateStatus(id, "ACTIVE")
      fetchBannedUsers()
    } catch (error) {
      console.error("Failed to activate user:", error)
    }
  }

  return (
    <div className="space-y-8 p-1">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-[#3b82f6] uppercase">Banned Users</h1>
          <p className="text-slate-500 font-medium">Review and manage restricted accounts blocked from platform access.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border-none shadow-[var(--unisync-card-shadow)] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-rose-50/30 hover:bg-rose-50/30">
              <TableHead className="py-5 px-6 font-bold text-slate-400 text-xs uppercase tracking-wider">User</TableHead>
              <TableHead className="py-5 px-6 font-bold text-slate-400 text-xs uppercase tracking-wider text-center">Status</TableHead>
              <TableHead className="py-5 px-6 font-bold text-slate-400 text-xs uppercase tracking-wider text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-slate-500">
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    Loading banned list...
                  </div>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                    <ShieldCheck className="h-10 w-10 text-emerald-500 mb-2" />
                    <span className="font-medium text-lg text-slate-900 dark:text-slate-50">No Banned Users</span>
                    <span>All your platform users currently have active status.</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} className="group hover:bg-rose-50/30 transition-colors border-slate-100">
                  <TableCell className="py-4 px-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-11 w-11 shadow-sm border border-slate-100">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} />
                        <AvatarFallback className="bg-rose-100 text-rose-500 font-black">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-black text-slate-800 leading-tight">{user.name}</span>
                        <span className="text-xs font-bold text-slate-400">{user.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-6 text-center">
                    <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-none px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest gap-1">
                      <ShieldAlert className="h-3 w-3" />
                      Banned
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 px-6 text-right">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-xl font-bold text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-800"
                      onClick={() => handleActivate(user.id)}
                    >
                      <ShieldCheck className="h-4 w-4 mr-1.5" />
                      Restore Access
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
