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
import { ProtectedRoute } from "@/components/protected-route"

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Admin Routes (Protected) */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
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

        {/* Catch all - redirect home or login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
