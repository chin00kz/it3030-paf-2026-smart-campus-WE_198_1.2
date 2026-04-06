import { createContext, useContext, useState, useEffect } from "react"
import { userService } from "@/lib/api-client"

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("sc_user")
    return savedUser ? JSON.parse(savedUser) : null
  })
  const [loading, setLoading] = useState(false)

  const login = async (credentials) => {
    setLoading(true)
    try {
      const userData = await userService.login(credentials)
      setUser(userData)
      localStorage.setItem("sc_user", JSON.stringify(userData))
      return userData
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("sc_user")
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
