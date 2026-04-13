import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { userService } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  UserPlus, 
  Mail, 
  Shield, 
  Key, 
  Edit2, 
  Search, 
  MoreVertical, 
  Trash2, 
  UserCheck, 
  UserX,
  History,
  PlusCircle
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const navigate = useNavigate()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null) // { id, name }
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER",
    status: "ACTIVE",
  })

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const data = await userService.getAllUsers()
      setUsers(data)
    } catch (error) {
      console.error("Failed to fetch users:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRoleChange = (value) => {
    setFormData((prev) => ({ ...prev, role: value }))
  }

  const handleEditClick = (user) => {
    setIsEditing(true)
    setSelectedUserId(user.id)
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
    })
    setIsDialogOpen(true)
  }

  const handleStatusToggle = async (user, isChecked) => {
    const newStatus = isChecked ? "ACTIVE" : "BANNED"
    try {
      await userService.updateStatus(user.id, newStatus)
      fetchUsers()
    } catch (error) {
      console.error("Failed to update status:", error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (isEditing) {
        await userService.updateUser(selectedUserId, formData)
      } else {
        await userService.createUser(formData)
      }
      setIsDialogOpen(false)
      resetForm()
      fetchUsers()
    } catch (error) {
      console.error("Failed to save user:", error)
    }
  }

  const resetForm = () => {
    setIsEditing(false)
    setSelectedUserId(null)
    setFormData({ name: "", email: "", password: "", role: "USER", status: "ACTIVE" })
  }

  const handleDeleteUser = async () => {
    if (!deleteTarget) return
    try {
      await userService.deleteUser(deleteTarget.id)
      setDeleteTarget(null)
      fetchUsers()
    } catch (error) {
      console.error("Failed to delete user:", error)
      alert(error.response?.data || "Failed to delete user.")
      setDeleteTarget(null)
    }
  }

  const getRoleBadge = (role) => {
    const styles = {
      SUPER_ADMIN: "bg-amber-100 text-amber-700 hover:bg-amber-100 border-none px-3 py-1 rounded-full text-[10px] font-black tracking-widest shadow-sm",
      ADMIN: "bg-purple-100 text-purple-700 hover:bg-purple-100 border-none px-3 py-1 rounded-full text-[10px] font-black tracking-wider",
      MANAGER: "bg-orange-100 text-orange-700 hover:bg-orange-100 border-none px-3 py-1 rounded-full text-[10px] font-black tracking-wider",
      TECHNICIAN: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-3 py-1 rounded-full text-[10px] font-black tracking-wider",
      USER: "bg-blue-50 text-blue-600 hover:bg-blue-50 border-none px-3 py-1 rounded-full text-[10px] font-black tracking-wider",
    }
    return (
      <Badge className={styles[role] || styles.USER}>
        {role === "SUPER_ADMIN" ? "SuperAdmin" : role === "ADMIN" ? "Admin" : role}
      </Badge>
    )
  }

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8 p-1">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-[#3b82f6] uppercase">User Management</h1>
          <p className="text-slate-500 font-medium">View and manage all registered accounts on the platform.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#3b82f6] transition-colors" />
            <Input 
              placeholder="Search users..." 
              className="pl-10 h-11 w-[260px] bg-white border-slate-200 rounded-xl shadow-sm focus:ring-[#3b82f6] focus:border-[#3b82f6]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            className="h-11 px-6 rounded-xl font-bold bg-[#1e293b] hover:bg-[#0f172a] shadow-lg gap-2"
            onClick={() => {
              resetForm()
              setIsDialogOpen(true)
            }}
          >
            <UserPlus className="h-4 w-4" />
            Add New User
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border-none shadow-[var(--unisync-card-shadow)] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
              <TableHead className="py-5 px-6 font-bold text-slate-400 text-xs uppercase tracking-wider">User</TableHead>
              <TableHead className="py-5 px-6 font-bold text-slate-400 text-xs uppercase tracking-wider">SLIIT ID</TableHead>
              <TableHead className="py-5 px-6 font-bold text-slate-400 text-xs uppercase tracking-wider">Role</TableHead>
              <TableHead className="py-5 px-6 font-bold text-slate-400 text-xs uppercase tracking-wider text-center">Status</TableHead>
              <TableHead className="py-5 px-6 font-bold text-slate-400 text-xs uppercase tracking-wider">Joined</TableHead>
              <TableHead className="py-5 px-6 font-bold text-slate-400 text-xs uppercase tracking-wider text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#3b82f6] border-t-transparent" />
                    <p className="text-sm font-bold text-slate-400">Loading directory...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                  <p className="font-bold text-slate-400">No matching accounts found.</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id} className="group hover:bg-slate-50/50 transition-colors border-slate-100">
                  <TableCell className="py-4 px-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-11 w-11 shadow-sm border border-slate-100">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} />
                        <AvatarFallback className="bg-[#3b82f6]/10 text-[#3b82f6] font-black">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-black text-slate-800 leading-tight">{user.name}</span>
                        <span className="text-xs font-bold text-slate-400">{user.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <span className="font-black text-slate-800 text-sm tracking-tighter">IT{23000000 + user.id}</span>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    {getRoleBadge(user.role)}
                  </TableCell>
                  <TableCell className="py-4 px-6 text-center">
                    <div className="flex flex-col items-center gap-1.5">
                      <Switch 
                        checked={user.status === "ACTIVE"} 
                        disabled={user.role === "SUPER_ADMIN"}
                        onCheckedChange={(checked) => handleStatusToggle(user, checked)}
                      />
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-widest",
                        user.status === "ACTIVE" ? "text-emerald-500" : "text-rose-500"
                      )}>
                        {user.status}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <span className="text-sm font-bold text-slate-500 tracking-tight">3/21/2026</span>
                  </TableCell>
                  <TableCell className="py-4 px-6 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={(props) => (
                          <Button 
                            {...props}
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9 rounded-full text-slate-400 hover:text-slate-900 group-hover:bg-white shadow-none transition-all"
                          >
                            <MoreVertical className="h-5 w-5" />
                          </Button>
                        )}
                      />
                      <DropdownMenuContent align="end" className="w-48 rounded-xl p-2 border-slate-100 shadow-xl">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 py-1.5">Actions</div>
                        <DropdownMenuItem className="rounded-lg gap-2 font-bold focus:bg-[#3b82f6]/5 focus:text-[#3b82f6] cursor-pointer" onClick={() => handleEditClick(user)}>
                          <Edit2 className="h-4 w-4" />
                          Edit Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-lg gap-2 font-bold focus:bg-[#3b82f6]/5 focus:text-[#3b82f6] cursor-pointer" onClick={() => navigate("/admin/audit-logs")}>
                          <History className="h-4 w-4" />
                          Activity Logs
                        </DropdownMenuItem>
                        <div className="my-1 h-px bg-slate-100" />
                        <DropdownMenuItem 
                          disabled={user.role === "SUPER_ADMIN"}
                          onClick={() => user.role !== "SUPER_ADMIN" && setDeleteTarget({ id: user.id, name: user.name })}
                          className="rounded-lg gap-2 font-bold text-rose-500 focus:bg-rose-50 focus:text-rose-600 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Account
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Management Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open)
        if (!open) resetForm()
      }}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl border-none shadow-2xl">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="text-2xl font-black tracking-tighter text-slate-800">
                {isEditing ? "Edit Profile" : "Create Account"}
              </DialogTitle>
              <DialogDescription className="font-medium text-slate-500 underline decoration-[#3b82f6]/20 decoration-2 underline-offset-4">
                {isEditing ? "Update account credentials and system access." : "Initialize a new user on the Smart Campus platform."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-5 py-6">
              <div className="grid gap-2">
                <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Full Name</Label>
                <div className="relative">
                  <PlusCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  <Input
                    name="name"
                    placeholder="John Doe"
                    className="pl-10 h-11 rounded-xl bg-slate-50/50 border-slate-200"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  <Input
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    className="pl-10 h-11 rounded-xl bg-slate-50/50 border-slate-200 disabled:opacity-70"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isEditing}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  {isEditing ? "New Password (Optional)" : "Security Key"}
                </Label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  <Input
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 h-11 rounded-xl bg-slate-50/50 border-slate-200"
                    value={formData.password}
                    onChange={handleInputChange}
                    required={!isEditing}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Platform Role</Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 z-10" />
                  <Select value={formData.role} onValueChange={handleRoleChange}>
                    <SelectTrigger className="pl-10 h-11 rounded-xl bg-slate-50/50 border-slate-200">
                      <SelectValue placeholder="Access Level" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl p-1">
                      <SelectItem value="USER" className="rounded-lg font-bold">Student / Staff</SelectItem>
                      <SelectItem value="TECHNICIAN" className="rounded-lg font-bold">Technician</SelectItem>
                      <SelectItem value="MANAGER" className="rounded-lg font-bold">Facility Manager</SelectItem>
                      <SelectItem value="ADMIN" className="rounded-lg font-bold">Global Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" className="h-11 rounded-xl font-bold border-slate-200" onClick={() => setIsDialogOpen(false)}>
                Discard
              </Button>
              <Button type="submit" className="h-11 rounded-xl font-bold bg-[#3b82f6] hover:bg-[#2563eb] shadow-lg shadow-blue-500/20 px-8">
                {isEditing ? "Save Changes" : "Create Account"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-[380px] rounded-2xl border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black tracking-tighter text-slate-800">
              Delete Account
            </DialogTitle>
            <DialogDescription className="font-medium text-slate-500">
              Are you sure you want to permanently delete{" "}
              <span className="font-black text-slate-800">{deleteTarget?.name}</span>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-xl font-bold border-slate-200"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="h-11 rounded-xl font-bold bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-500/20 px-8"
              onClick={handleDeleteUser}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
