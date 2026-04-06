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
import { PlusCircle, UserPlus, Mail, Shield, Key } from "lucide-react"

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await userService.createUser(formData)
      setIsDialogOpen(false)
      setFormData({ name: "", email: "", password: "", role: "USER" })
      fetchUsers()
    } catch (error) {
      console.error("Failed to create user:", error)
      alert("Failed to create user. Please check if the email already exists.")
    }
  }

  const getRoleBadge = (role) => {
    const styles = {
      ADMIN: "bg-red-100 text-red-700 border-red-200",
      MANAGER: "bg-blue-100 text-blue-700 border-blue-200",
      TECHNICIAN: "bg-green-100 text-green-700 border-green-200",
      USER: "bg-gray-100 text-gray-700 border-gray-200",
    }
    return (
      <Badge variant="outline" className={styles[role] || styles.USER}>
        {role}
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

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 shadow-sm gap-2">
              <UserPlus className="h-4 w-4" />
              New User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle className="text-xl">Create New User</DialogTitle>
                <DialogDescription>
                  Enter the details for the new platform user.
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
                  <Label htmlFor="password text-sm font-medium">Initial Password</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
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
                <Button type="submit">Create Account</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white dark:bg-slate-950 rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 dark:bg-slate-900/50">
              <TableHead className="w-[80px] font-semibold text-slate-900 dark:text-slate-50">ID</TableHead>
              <TableHead className="font-semibold text-slate-900 dark:text-slate-50">Name</TableHead>
              <TableHead className="font-semibold text-slate-900 dark:text-slate-50">Email</TableHead>
              <TableHead className="font-semibold text-slate-900 dark:text-slate-50">Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-slate-500">
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    Loading users...
                  </div>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-slate-500">
                  No users found. Create your first user account to get started.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} className="group transition-colors hover:bg-slate-50 dark:hover:bg-slate-900">
                  <TableCell className="font-medium text-slate-500">#{user.id}</TableCell>
                  <TableCell className="font-medium text-slate-900 dark:text-slate-50">{user.name}</TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-400">{user.email}</TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
