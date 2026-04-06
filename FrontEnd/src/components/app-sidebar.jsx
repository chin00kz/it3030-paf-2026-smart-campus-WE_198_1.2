import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Settings,
  BookOpen,
  Calendar,
  MessageSquare,
  ShieldCheck,
  FileText,
  UserX,
  History
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { useAuth } from "@/contexts/AuthContext"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: LayoutDashboard,
      allowedRoles: ["ADMIN"],
    },
    {
      title: "User Management",
      url: "/admin/user-management",
      icon: Users,
      allowedRoles: ["ADMIN"],
    },
    {
      title: "Admin Management",
      url: "/admin/admin-management",
      icon: ShieldCheck,
      allowedRoles: ["ADMIN"],
    },
    {
      title: "Banned Users",
      url: "/admin/banned-users",
      icon: UserX,
      allowedRoles: ["ADMIN"],
    },
    {
      title: "Manager Tools",
      url: "/manager",
      icon: ShieldCheck,
      allowedRoles: ["MANAGER"],
    },
    {
      title: "Maintenance Jobs",
      url: "/technician",
      icon: Calendar,
      allowedRoles: ["TECHNICIAN"],
    },
    {
      title: "Student Dashboard",
      url: "/dashboard",
      icon: GraduationCap,
      allowedRoles: ["USER"],
    },
    {
      title: "Reports",
      url: "/admin/reports",
      icon: FileText,
      allowedRoles: ["ADMIN", "MANAGER"],
    },
    {
      title: "Audit Logs",
      url: "/admin/audit-logs",
      icon: History,
      allowedRoles: ["ADMIN"],
    },
    {
      title: "Settings",
      url: "/admin/settings",
      icon: Settings,
      allowedRoles: ["ADMIN", "MANAGER", "TECHNICIAN", "USER"],
    },
  ],
}

export function AppSidebar({ ...props }) {
  const { user } = useAuth()
  
  const filteredNavMain = data.navMain.filter(item => 
    !item.allowedRoles || item.allowedRoles.includes(user?.role)
  )

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-2 font-bold text-xl">
          <div className="bg-primary text-primary-foreground p-1.5 rounded flex items-center justify-center h-8 w-8 text-sm">
            SC
          </div>
          <span className="truncate group-data-[collapsible=icon]:hidden">
            SmartCampus
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavMain} />
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
        <NavUser user={user || { name: "Guest", email: "", avatar: "" }} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
