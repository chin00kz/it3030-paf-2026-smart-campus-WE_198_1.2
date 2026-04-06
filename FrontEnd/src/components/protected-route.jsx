import { Navigate, useLocation } from "react-router-dom"

/**
 * ProtectedRoute component - Placeholder for authentication and role-based access.
 * Currently allows all access, but redirects to login if user is null.
 * 
 * TODO: Implement real authentication check with backend.
 */
export function ProtectedRoute({ children }) {
  const location = useLocation()
  
  // Real implementation: const { user, loading } = useAuth()
  const user = { role: "admin" } // Mocked user
  
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
