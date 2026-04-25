import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { notificationService } from "@/lib/api-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Check, ExternalLink, Inbox, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN"]

// Normalize backend response — Jackson serializes boolean `isRead` as `read` due to is-prefix convention
function normalizeNotif(n) {
  return {
    ...n,
    isRead: n.isRead ?? n.read ?? false,
  }
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  const isAdmin = user && ADMIN_ROLES.includes(user.role)

  const fetchNotifications = async () => {
    if (!user) return
    try {
      setLoading(true)
      let data
      if (isAdmin) {
        // Admins see ALL system notifications
        data = await notificationService.getAllNotifications()
      } else {
        // Other roles see only their own notifications
        data = await notificationService.getNotifications(user.id)
      }
      setNotifications((data || []).map(normalizeNotif))
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [user?.id])

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id)
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      )
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return
    try {
      await notificationService.markAllAsRead(user.id)
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch (error) {
      console.error("Failed to mark all as read:", error)
    }
  }

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      await handleMarkAsRead(notif.id)
    }
    if (notif.link) {
      navigate(notif.link)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            {isAdmin
              ? "All system-wide notifications and booking alerts."
              : "Stay updated with the latest events in Smart Campus."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-sm px-3 py-1">
              {unreadCount} unread
            </Badge>
          )}
          {unreadCount > 0 && !isAdmin && (
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead} className="gap-2">
              <Check className="h-4 w-4" />
              Mark all as read
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={fetchNotifications} className="gap-2">
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="h-10 w-10 animate-spin mb-4" />
          <p>Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-20 text-muted-foreground text-center">
            <Inbox className="h-12 w-12 mb-4 opacity-20" />
            <h3 className="text-lg font-medium text-foreground">No notifications yet</h3>
            <p className="max-w-xs mt-1">
              {isAdmin
                ? "When students make booking requests they will appear here."
                : "When you get alerts about bookings or system updates, they will appear here."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {notifications.map((notif) => (
            <Card
              key={notif.id}
              className={cn(
                "transition-all cursor-pointer hover:shadow-md border-l-4",
                notif.isRead ? "border-l-transparent" : "border-l-primary bg-primary/5"
              )}
              onClick={() => handleNotificationClick(notif)}
            >
              <CardHeader className="p-4 pb-1">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={cn(
                      "p-1.5 rounded-full shrink-0",
                      notif.isRead ? "bg-muted text-muted-foreground" : "bg-primary/20 text-primary"
                    )}>
                      <Bell className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-base font-semibold truncate">{notif.title}</CardTitle>
                    {!notif.isRead && <Badge className="ml-1 shrink-0 bg-primary text-primary-foreground">New</Badge>}
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{formatDate(notif.createdAt)}</span>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-1 flex items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">{notif.message}</p>
                {notif.link && (
                  <ExternalLink className="h-4 w-4 text-muted-foreground opacity-50 shrink-0" />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
