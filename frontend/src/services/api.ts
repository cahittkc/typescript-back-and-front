import axios from 'axios'
import type { LoginPayload, AuthResponse } from '@/types'

// Types
export interface User {
  id: number
  username: string
  firstName: string
  lastName: string
  email: string
  role: Role
  bio?: string
  skills?: string[]
  experience?: string
  hourlyRate?: number
  portfolio?: string
  location?: string
  phoneNumber?: string
  languages?: string[]
  rating?: number
  completedProjects?: number
  createdAt: string
  updatedAt: string
}

export interface Role {
  id: number
  name: string
  description: string
}

export interface LoginCredentials {
  emailOrUsername: string
  password: string
}

export interface RegisterCredentials {
  username: string
  firstName: string
  lastName: string
  email: string
  password: string
  role: 'client' | 'freelancer'
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
}

export interface LoginResponse extends AuthResponse {}
export interface RegisterResponse extends AuthResponse {}
export interface RefreshTokenResponse {
  accessToken: string
  expiresIn: number
}

// API Client
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Flag to track if we're refreshing the token
let isRefreshing = false
// Store callbacks for requests that are waiting for the new token
let refreshSubscribers: ((token: string) => void)[] = []

// Subscribe to token refresh
const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb)
}

// Execute subscribers with new token
const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach(cb => cb(token))
  refreshSubscribers = []
}

// Auth Service
export const authService = {
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', credentials)
    
    // Store auth data in localStorage  
    if (response.data.data) {
      const { user, accessToken, refreshToken, expiresIn } = response.data.data
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('expiresIn', expiresIn.toString())
    }
    
    return response.data
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials)
    
    console.log('Login Response:', response.data)
    
    // Store auth data in localStorage
    if (response.data.success) {
      const userData = response.data.data
      const { accessToken, expiresIn } = userData
      
      // Remove tokens from user object before storing
      const { accessToken: _, expiresIn: __, ...userWithoutTokens } = userData
      
      localStorage.setItem('user', JSON.stringify(userWithoutTokens))
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('expiresIn', expiresIn.toString())
    }
    
    return response.data
  },

  async refreshToken(): Promise<RefreshTokenResponse> {
    const response = await api.post<RefreshTokenResponse>('/auth/refresh-token')
    return response.data
  },

  logout() {
    localStorage.removeItem('user')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('expiresIn')
  },

  getToken() {
    return localStorage.getItem('accessToken')
  }
}

// Add request interceptor
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// Add response interceptor
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    // If error is not 401 or request already retried, reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    // Check if we have an active user session
    const user = localStorage.getItem('user')
    const refreshToken = localStorage.getItem('refreshToken')
    if (!user || !refreshToken) {
      // No active session, clear any remaining auth data
      localStorage.removeItem('user')
      localStorage.removeItem('accessToken') 
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('expiresIn')
      return Promise.reject(error)
    }

    // If already refreshing, wait for the new token
    if (isRefreshing) {
      return new Promise(resolve => {
        subscribeTokenRefresh(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          resolve(api(originalRequest))
        })
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const response = await api.post<AuthResponse>('/auth/refresh-token', {
        refreshToken
      })

      const { accessToken } = response.data.data
      localStorage.setItem('accessToken', accessToken)

      // Update authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
      originalRequest.headers.Authorization = `Bearer ${accessToken}`

      // Notify subscribers about new token
      onTokenRefreshed(accessToken)
      isRefreshing = false

      // Retry original request
      return api(originalRequest)
    } catch (refreshError) {
      isRefreshing = false
      refreshSubscribers = []
      
      // Clear auth data and redirect to login
      localStorage.removeItem('user')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('expiresIn')
      window.location.reload()
      
      return Promise.reject(refreshError)
    }
  }
)

export default api 