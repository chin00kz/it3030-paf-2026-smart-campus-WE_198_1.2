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

export default function BannedUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchBannedUsers = async () => {
    try {
      setLoading(true)
      const allUsers = await userService.getAllUsers()
      setUsers(allUsers.filter(u => !u.active))
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
      await userService.toggleUserStatus(id)
      fetchBannedUsers()
    } catch (error) {
      console.error("Failed to activate user:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-3">
          <UserX className="h-8 w-8 text-rose-500" />
          Banned Users
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Review and manage restricted accounts that have been blocked from platform access.</p>
      </div>

      <div className="bg-white dark:bg-slate-950 rounded-xl border border-rose-100 dark:border-rose-900/30 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-rose-50/50 hover:bg-rose-50/50 dark:bg-rose-900/10">
              <TableHead className="w-[80px] font-semibold text-slate-900 dark:text-slate-50 text-center">ID</TableHead>
              <TableHead className="font-semibold text-slate-900 dark:text-slate-50">User Details</TableHead>
              <TableHead className="font-semibold text-slate-900 dark:text-slate-50 text-center">Status</TableHead>
              <TableHead className="font-semibold text-slate-900 dark:text-slate-50 text-right pr-6">Action</TableHead>
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
                <TableRow key={user.id} className="group transition-colors hover:bg-rose-50/30 dark:hover:bg-rose-900/5">
                  <TableCell className="text-center font-medium text-slate-500 font-mono text-xs">#{user.id}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900 dark:text-slate-50">{user.name}</span>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 gap-1 pr-2">
                      <ShieldAlert className="h-3 w-3" />
                      Restricted
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-800"
                      onClick={() => handleActivate(user.id)}
                    >
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
