import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { Outlet, useLocation } from "react-router-dom"

export default function AdminLayout() {
  const location = useLocation()
  
  // Simple breadcrumb logic
  const pathnames = location.pathname.split("/").filter((x) => x)
  const lastPath = pathnames[pathnames.length - 1] || "Dashboard"
  const formattedPath = lastPath.charAt(0).toUpperCase() + lastPath.slice(1).replace(/-/g, " ")

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 sticky top-0 bg-background z-10 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <nav className="flex items-center space-x-2 text-sm font-medium">
              {pathnames.map((segment, index) => (
                <div key={segment} className="flex items-center gap-2">
                  <span className={index === pathnames.length - 1 ? "text-foreground font-bold" : "text-muted-foreground"}>
                    {segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ")}
                  </span>
                  {index < pathnames.length - 1 && <span className="text-muted-foreground">/</span>}
                </div>
              ))}
              {pathnames.length === 0 && <span className="text-foreground font-bold">Dashboard</span>}
            </nav>
          </div>
        </header>
        <main className="p-6 h-[calc(100vh-4rem)] overflow-auto">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
