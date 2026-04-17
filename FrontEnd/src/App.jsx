import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import AdminLayout from "@/layouts/admin-layout"
import AdminDashboard from "@/pages/admin/dashboard"
import AdminAccount from "@/pages/admin/account"
import UserManagement from "@/pages/admin/user-management"
import AdminManagement from "@/pages/admin/admin-management"
import AuditLogs from "@/pages/admin/audit-logs"
import BannedUsers from "@/pages/admin/banned-users"
import Reports from "@/pages/admin/reports"
import LoginPage from "@/pages/login"
import ResourcesPage from "@/pages/admin/resources/index"
import StudentResourcesPage from "@/pages/student/resources/index"
import ManagerDashboard from "@/pages/manager/dashboard"
import TechnicianDashboard from "@/pages/technician/dashboard"
import StudentDashboard from "@/pages/student/dashboard"
import NotificationsPage from "@/pages/notifications"
import MaintenancePage from "@/pages/maintenance"
import SettingsPage from "@/pages/admin/settings"
import { ProtectedRoute } from "@/components/protected-route"
import { AuthProvider, useAuth } from "@/contexts/AuthContext"

// Helper to handle "/" redirect based on role
function RootRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  
  switch (user.role) {
    case "SUPER_ADMIN":
    case "ADMIN": return <Navigate to="/admin" replace />
    case "MANAGER": return <Navigate to="/manager" replace />
    case "TECHNICIAN": return <Navigate to="/technician" replace />
    default: return <Navigate to="/dashboard" replace />
  }
}

function App() {
  const [isMaintenance, setIsMaintenance] = import.meta.env.MODE === 'development' ? [false, () => {}] : [false, () => {}] // Initial state
  // We'll actually use a hook or effect here if needed, but for now let's use the ProtectedRoute logic
  // and a global interceptor in the background.
  
  return (
    <AuthProvider>
      <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/maintenance" element={<MaintenancePage />} />
        
        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={
          <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="account" element={<AdminAccount />} />
          <Route path="user-management" element={<UserManagement />} />
          <Route path="admin-management" element={<AdminManagement />} />
          <Route path="audit-logs" element={<AuditLogs />} />
          <Route path="banned-users" element={<BannedUsers />} />
          <Route path="reports" element={<Reports />} />
          <Route path="resources" element={<ResourcesPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Manager Routes */}
        <Route 
          path="/manager" 
          element={
            <ProtectedRoute allowedRoles={["MANAGER"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ManagerDashboard />} />
          <Route path="reports" element={<Reports />} />
          <Route path="resources" element={<ResourcesPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Technician Routes */}
        <Route 
          path="/technician" 
          element={
            <ProtectedRoute allowedRoles={["TECHNICIAN"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<TechnicianDashboard />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Student/User Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute allowedRoles={["USER"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<StudentDashboard />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="resources" element={<StudentResourcesPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Catch all - redirect home or based on role */}
        <Route path="/" element={<RootRedirect />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
