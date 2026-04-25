import axios from "axios"

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
})

// Add request interceptor for authentication and role headers
api.interceptors.request.use(
  (config) => {
    const savedUser = localStorage.getItem("sc_user")
    if (savedUser) {
      const user = JSON.parse(savedUser)
      if (user.role) {
        config.headers["X-User-Role"] = user.role
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Add response interceptor for maintenance mode
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If system is in maintenance mode (503 Service Unavailable)
    if (error.response && error.response.status === 503) {
      // Don't redirect if already on maintenance page to avoid loops
      if (!window.location.pathname.includes('/maintenance')) {
        window.location.href = '/maintenance'
      }
    }
    return Promise.reject(error)
  }
)

export const userService = {
  getAllUsers: () => api.get("/users").then((res) => res.data),
  createUser: (userData) => api.post("/users", userData).then((res) => res.data),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData).then((res) => res.data),
  updateStatus: (id, status) => api.patch(`/users/${id}/status?status=${status}`).then((res) => res.data),
  deleteUser: (id) => api.delete(`/users/${id}`).then((res) => res.data),
  login: (credentials) => api.post("/auth/login", credentials).then((res) => res.data),
  loginWithGoogle: (credential) => api.post("/auth/google", { credential }).then((res) => res.data),
}

export const auditLogService = {
  getAllLogs: () => api.get("/audit-logs").then(res => res.data),
}

export const notificationService = {
  getAllNotifications: () => api.get(`/notifications/all`).then((res) => res.data),
  getNotifications: (userId) => api.get(`/notifications/user/${userId}`).then((res) => res.data),
  getUnreadCount: (userId) => api.get(`/notifications/user/${userId}/unread-count`).then((res) => res.data),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`).then((res) => res.data),
  markAllAsRead: (userId) => api.patch(`/notifications/user/${userId}/read-all`).then((res) => res.data),
}


export const dashboardService = {
  getStats: () => api.get("/dashboard/stats").then((res) => res.data),
}

export const settingsService = {
  getMaintenanceStatus: () => api.get("/settings/maintenance").then((res) => res.data),
  toggleMaintenance: (enabled, adminInfo) => api.post("/settings/maintenance", { enabled }, {
    headers: {
      "X-Admin-Email": adminInfo.email,
      "X-Admin-Name": adminInfo.name
    }
  }).then((res) => res.data),
}

export default api
