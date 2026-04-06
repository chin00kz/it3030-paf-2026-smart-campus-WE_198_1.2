import { useState, useEffect } from "react"
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
  DialogTrigger,
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
import { PlusCircle, UserPlus, Mail, Shield, Key, Edit2, ShieldAlert, ShieldCheck } from "lucide-react"

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER",
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
      password: "", // Keep password empty unless changing
      role: user.role,
    })
    setIsDialogOpen(true)
  }

  const handleToggleStatus = async (user) => {
    try {
      await userService.toggleUserStatus(user.id)
      fetchUsers()
    } catch (error) {
      console.error("Failed to toggle status:", error)
      alert("Failed to update user status.")
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
      alert("Failed to save user. Please check if the email already exists.")
    }
  }

  const resetForm = () => {
    setIsEditing(false)
    setSelectedUserId(null)
    setFormData({ name: "", email: "", password: "", role: "USER" })
  }

  const getRoleBadge = (role) => {
    const styles = {
      ADMIN: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
      MANAGER: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
      TECHNICIAN: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
      USER: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
    }
    return (
      <Badge variant="outline" className={styles[role] || styles.USER}>
        {role}
      </Badge>
    )
  }

  const getStatusBadge = (user) => {
    return user.active ? (
      <Badge 
        variant="outline" 
        className="bg-emerald-50 text-emerald-700 border-emerald-200 cursor-pointer hover:bg-emerald-100 transition-colors gap-1"
        onClick={() => handleToggleStatus(user)}
      >
        <ShieldCheck className="h-3 w-3" />
        Active
      </Badge>
    ) : (
      <Badge 
        variant="outline" 
        className="bg-rose-50 text-rose-700 border-rose-200 cursor-pointer hover:bg-rose-100 transition-colors gap-1"
        onClick={() => handleToggleStatus(user)}
      >
        <ShieldAlert className="h-3 w-3" />
        Banned
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">User Management</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage platform access and roles for students and staff.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 shadow-sm gap-2">
              <UserPlus className="h-4 w-4" />
              New User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle className="text-xl">{isEditing ? "Edit User Profile" : "Create New User"}</DialogTitle>
                <DialogDescription>
                  {isEditing ? "Update the account details for this user." : "Enter the details for the new platform user."}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-5 py-6">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                  <div className="relative">
                    <PlusCircle className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      id="name"
                      name="name"
                      placeholder="John Doe"
                      className="pl-10"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="john@example.com"
                      className="pl-10"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password" title={isEditing ? "Leave blank to keep current password" : ""} className="text-sm font-medium">
                    {isEditing ? "Reset Password (Optional)" : "Initial Password"}
                  </Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder={isEditing ? "Leave blank to keep current" : "••••••••"}
                      className="pl-10"
                      value={formData.password}
                      onChange={handleInputChange}
                      required={!isEditing}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role" className="text-sm font-medium">System Role</Label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 z-10" />
                    <Select value={formData.role} onValueChange={handleRoleChange}>
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USER">User (Student/Staff)</SelectItem>
                        <SelectItem value="TECHNICIAN">Technician</SelectItem>
                        <SelectItem value="MANAGER">Manager</SelectItem>
                        <SelectItem value="ADMIN">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-primary">
                  {isEditing ? "Save Changes" : "Create Account"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white dark:bg-slate-950 rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 dark:bg-slate-900/50">
              <TableHead className="w-[80px] font-semibold text-slate-900 dark:text-slate-50 text-center">ID</TableHead>
              <TableHead className="font-semibold text-slate-900 dark:text-slate-50">User Details</TableHead>
              <TableHead className="font-semibold text-slate-900 dark:text-slate-50">System Role</TableHead>
              <TableHead className="font-semibold text-slate-900 dark:text-slate-50 text-center">Status</TableHead>
              <TableHead className="font-semibold text-slate-900 dark:text-slate-50 text-right pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    Loading users...
                  </div>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                  No users found. Create your first user account to get started.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} className="group transition-colors hover:bg-slate-50 dark:hover:bg-slate-900">
                  <TableCell className="text-center font-medium text-slate-500 font-mono text-xs">#{user.id}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900 dark:text-slate-50">{user.name}</span>
                      <span className="text-xs text-slate-500">{user.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell className="text-center">
                    {getStatusBadge(user)}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-slate-500 hover:text-primary hover:bg-primary/10"
                      onClick={() => handleEditClick(user)}
                    >
                      <Edit2 className="h-4 w-4" />
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
