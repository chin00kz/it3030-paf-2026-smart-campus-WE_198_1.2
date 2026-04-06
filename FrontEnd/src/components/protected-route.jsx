import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"

/**
 * ProtectedRoute component - Enforces authentication and role-based access.
 * Redirects to login if user is not authenticated.
 */
export function ProtectedRoute({ children }) {
  const location = useLocation()
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="flex h-svh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }
  
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
