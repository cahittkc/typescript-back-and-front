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

export interface RefreshTokenResponse extends ApiResponse<{
  accessToken: string
  expiresIn: number
}> {}

// API Client
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Auth Service
export const authService = {
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', credentials)
    return response.data
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials)
    return response.data
  },

  async logout(): Promise<ApiResponse<string>> {
    const response = await api.post<ApiResponse<string>>('/auth/logout')
    return response.data
  },

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await api.post<RefreshTokenResponse>('/auth/refresh-token', { refreshToken })
    return response.data
  }
}

// Add request interceptor
api.interceptors.request.use(
  config => {
    const authData = localStorage.getItem('authStore')
    if (authData) {
      const { accessToken } = JSON.parse(authData)
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`
      }
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
    // If error is not 401 or request already retried, reject
    if (error.response?.status !== 401 || error.config._retry) {
      return Promise.reject(error)
    }

    error.config._retry = true

    try {
      const authData = localStorage.getItem('authStore')
      if (!authData) {
        throw new Error('No auth data found')
      }

      const { refreshToken } = JSON.parse(authData)
      if (!refreshToken) {
        throw new Error('No refresh token found')
      }

      const response = await authService.refreshToken(refreshToken)
      if (response.success) {
        const { accessToken, expiresIn } = response.data
        
        // Update auth store
        const currentAuthData = JSON.parse(authData)
        const newAuthData = {
          ...currentAuthData,
          accessToken,
          expiresIn
        }
        localStorage.setItem('authStore', JSON.stringify(newAuthData))

        // Update Authorization header
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
        error.config.headers.Authorization = `Bearer ${accessToken}`

        // Retry the original request
        return api(error.config)
      }
    } catch (refreshError) {
      // Clear auth data and redirect to login
      localStorage.removeItem('authStore')
      delete api.defaults.headers.common['Authorization']
      window.location.reload()
    }
    
    return Promise.reject(error)
  }
)

export default api 