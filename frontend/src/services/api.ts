import axios from 'axios'

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

export interface AuthResponse {
  user: User
  accessToken: string
  expiresIn: number
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

// Auth Service
export const authService = {
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', credentials)
    console.log(response.data);
    // Store token in localStorage  
    if (response.data.accessToken) {
      localStorage.setItem('token', response.data.accessToken)
    }
    
    return response.data
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials)
    
    // Store token in localStorage
    if (response.data.accessToken) {
      localStorage.setItem('token', response.data.accessToken)
    }
    
    return response.data
  },

  async refreshToken(): Promise<RefreshTokenResponse> {
    const response = await api.post<RefreshTokenResponse>('/auth/refresh-token')
    return response.data
  },

  logout() {
    localStorage.removeItem('token')
  },

  getToken() {
    return localStorage.getItem('token')
  }
}

// Add request interceptor to include token in requests
api.interceptors.request.use(
  (config) => {
    const token = authService.getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If error is 401 and not a retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Try to refresh token
        const response = await authService.refreshToken()
        
        // Update token
        localStorage.setItem('token', response.accessToken)
        
        // Update Authorization header
        originalRequest.headers.Authorization = `Bearer ${response.accessToken}`
        
        // Retry original request
        return api(originalRequest)
      } catch (refreshError) {
        // If refresh fails, logout
        authService.logout()
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api 