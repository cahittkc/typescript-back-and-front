import axios from 'axios'
import { useAuthStore } from '../stores/auth'

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token directly from localStorage
    const authData = localStorage.getItem('authStore')
    if (authData) {
      const { accessToken } = JSON.parse(authData)
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear auth data from localStorage
      localStorage.removeItem('authStore')
      // You might want to redirect to login page here
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default axiosInstance 