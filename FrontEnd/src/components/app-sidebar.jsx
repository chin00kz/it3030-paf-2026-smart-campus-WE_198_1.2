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

const data = {
  user: {
    name: "Admin User",
    email: "admin@smartcampus.edu",
    avatar: "/avatars/admin.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: LayoutDashboard,
    },
    {
      title: "User Management",
      url: "/admin/user-management",
      icon: Users,
    },
    {
      title: "Admin Management",
      url: "/admin/admin-management",
      icon: ShieldCheck,
    },
    {
      title: "Audit Logs",
      url: "/admin/audit-logs",
      icon: History,
    },
    {
      title: "Banned Users",
      url: "/admin/banned-users",
      icon: UserX,
    },
    {
      title: "Reports",
      url: "/admin/reports",
      icon: FileText,
    },
    {
      title: "Settings",
      url: "/admin/settings",
      icon: Settings,
    },
  ],
}

export function AppSidebar({ ...props }) {
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
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
