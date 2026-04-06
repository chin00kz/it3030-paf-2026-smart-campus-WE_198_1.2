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
import ManagerDashboard from "@/pages/manager/dashboard"
import TechnicianDashboard from "@/pages/technician/dashboard"
import StudentDashboard from "@/pages/student/dashboard"
import { ProtectedRoute } from "@/components/protected-route"
import { AuthProvider, useAuth } from "@/contexts/AuthContext"

// Helper to handle "/" redirect based on role
function RootRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  
  switch (user.role) {
    case "ADMIN": return <Navigate to="/admin" replace />
    case "MANAGER": return <Navigate to="/manager" replace />
    case "TECHNICIAN": return <Navigate to="/technician" replace />
    default: return <Navigate to="/dashboard" replace />
  }
}

function App() {
  return (
    <AuthProvider>
      <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
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
          <Route path="settings" element={<div>Settings Page</div>} />
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
          <Route path="settings" element={<div>Settings Page</div>} />
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
          <Route path="settings" element={<div>Settings Page</div>} />
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
          <Route path="settings" element={<div>Settings Page</div>} />
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
