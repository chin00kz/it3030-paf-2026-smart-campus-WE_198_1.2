import axios from "axios"

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
})

export const userService = {
  getAllUsers: () => api.get("/users").then((res) => res.data),
  createUser: (userData) => api.post("/users", userData).then((res) => res.data),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData).then((res) => res.data),
  updateStatus: (id, status) => api.patch(`/users/${id}/status?status=${status}`).then((res) => res.data),
  login: (credentials) => api.post("/auth/login", credentials).then((res) => res.data),
  loginWithGoogle: (credential) => api.post("/auth/google", { credential }).then((res) => res.data),
}

export const auditLogService = {
  getAllLogs: () => api.get("/audit-logs").then(res => res.data),
}

export const notificationService = {
  getNotifications: (userId) => api.get(`/notifications/user/${userId}`).then((res) => res.data),
  getUnreadCount: (userId) => api.get(`/notifications/user/${userId}/unread-count`).then((res) => res.data),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`).then((res) => res.data),
  markAllAsRead: (userId) => api.patch(`/notifications/user/${userId}/read-all`).then((res) => res.data),
}

export default api
