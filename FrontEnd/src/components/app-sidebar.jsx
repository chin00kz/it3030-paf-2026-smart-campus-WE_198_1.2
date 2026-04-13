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
  History,
  Bell
} from "lucide-react"
import React from "react"

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
      allowedRoles: ["ADMIN", "SUPER_ADMIN"],
    },
    {
      title: "User Management",
      url: "/admin/user-management",
      icon: Users,
      allowedRoles: ["ADMIN", "SUPER_ADMIN"],
    },
    {
      title: "Admin Management",
      url: "/admin/admin-management",
      icon: ShieldCheck,
      allowedRoles: ["ADMIN", "SUPER_ADMIN"],
    },
    {
      title: "Banned Users",
      url: "/admin/banned-users",
      icon: UserX,
      allowedRoles: ["ADMIN", "SUPER_ADMIN"],
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
      allowedRoles: ["ADMIN", "SUPER_ADMIN", "MANAGER"],
    },
    {
      title: "Audit Logs",
      url: "/admin/audit-logs",
      icon: History,
      allowedRoles: ["ADMIN", "SUPER_ADMIN"],
    },
    {
      title: "Notifications",
      url: "notifications", // relative - will be resolved per role in component
      icon: Bell,
    },
    {
      title: "Settings",
      url: "settings", // relative - will be resolved per role in component
      icon: Settings,
      allowedRoles: ["ADMIN", "SUPER_ADMIN", "MANAGER", "TECHNICIAN", "USER"],
    },
  ],
}

export function AppSidebar({ ...props }) {
  const { user } = useAuth()
  const [unreadCount, setUnreadCount] = React.useState(0)

  const fetchUnreadCount = async () => {
    if (!user?.id) return
    try {
      const { notificationService } = await import("@/lib/api-client")
      const count = await notificationService.getUnreadCount(user.id)
      setUnreadCount(count)
    } catch (error) {
      console.error("Failed to fetch unread count:", error)
    }
  }

  React.useEffect(() => {
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30000) // Poll every 30s
    return () => clearInterval(interval)
  }, [user?.id])
  
  const rolePrefix = user?.role === "USER" ? "/dashboard" : 
                     user?.role === "SUPER_ADMIN" ? "/admin" : 
                     `/${user?.role?.toLowerCase()}`

  const filteredNavMain = data.navMain.filter(item =>
    !item.allowedRoles || item.allowedRoles.includes(user?.role)
  ).map(item => ({
    ...item,
    // Resolve relative items (notifications, settings) against role prefix
    // Absolute items (already start with /) are kept as-is
    url: item.url.startsWith("/") ? item.url : `${rolePrefix}/${item.url}`,
    badge: item.title === "Notifications" && unreadCount > 0 ? unreadCount : null
  }))

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
