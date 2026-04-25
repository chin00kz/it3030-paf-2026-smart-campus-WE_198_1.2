import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { useEffect, useRef } from "react"
import { Client } from "@stomp/stompjs"
import { Toaster, toast } from "sonner"

export default function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const stompClientRef = useRef(null)
  
  // Simple breadcrumb logic
  const pathnames = location.pathname.split("/").filter((x) => x)
  const lastPath = pathnames[pathnames.length - 1] || "Dashboard"
  const formattedPath = lastPath.charAt(0).toUpperCase() + lastPath.slice(1).replace(/-/g, " ")

  useEffect(() => {
    const client = new Client({
      brokerURL: "ws://localhost:8080/ws/websocket",
      reconnectDelay: 5000,
      debug: () => {},
      onConnect: () => {
        client.subscribe("/topic/admin/bookings", (message) => {
          if (message.body) {
            const bookingInfo = JSON.parse(message.body)
            toast.success("New Booking Request!", {
              description: `${bookingInfo.bookedByName} requested '${bookingInfo.resourceName}' on ${bookingInfo.bookingDate}`,
              duration: 8000,
              position: "top-right",
              action: {
                label: "View",
                onClick: () => navigate("/dashboard/admin/resources")
              }
            })
          }
        })
      },
      onStompError: (frame) => {
        console.warn("STOMP error:", frame)
      }
    })

    stompClientRef.current = client
    client.activate()

    return () => {
      client.deactivate()
    }
  }, [])

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 sticky top-0 bg-background z-10 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <nav className="flex items-center space-x-2 text-sm font-medium">
              <span className="text-muted-foreground">Admin</span>
              <span className="text-muted-foreground">/</span>
              <span>{formattedPath}</span>
            </nav>
          </div>
        </header>
        <main className="p-6 h-[calc(100vh-4rem)] overflow-auto">
          <Outlet />
        </main>
      </SidebarInset>
      <Toaster richColors closeButton />
    </SidebarProvider>
  )
}
