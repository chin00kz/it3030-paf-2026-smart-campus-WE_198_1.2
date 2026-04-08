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
  toggleUserStatus: (id) => api.patch(`/users/${id}/toggle-status`).then((res) => res.data),
  login: (credentials) => api.post("/auth/login", credentials).then((res) => res.data),
  loginWithGoogle: (credential) => api.post("/auth/google", { credential }).then((res) => res.data),
}

export default api
