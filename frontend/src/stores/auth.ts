import { defineStore } from 'pinia'
import { ref, onMounted } from 'vue'
import type { User, LoginPayload, AuthResponse } from '../types'
import { authService } from '../services/api'
import api from '../services/api'
import type { RegisterCredentials } from '../services/api'
import axios from 'axios'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  expiresIn: number | null
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const accessToken = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)
  const expiresIn = ref<number | null>(null)
  let refreshTimeout: NodeJS.Timeout | null = null

  // Initialize from localStorage
  const initializeFromStorage = () => {
    const authData = localStorage.getItem('authStore')
    if (authData) {
      const parsedData: AuthState = JSON.parse(authData)
      user.value = parsedData.user
      accessToken.value = parsedData.accessToken
      refreshToken.value = parsedData.refreshToken
      expiresIn.value = parsedData.expiresIn

      // Setup refresh timer if we have valid data
      if (accessToken.value && refreshToken.value && expiresIn.value) {
        setupRefreshTimer()
      }
    }
  }

  // Save state to localStorage
  const saveToStorage = () => {
    const authData: AuthState = {
      user: user.value,
      accessToken: accessToken.value,
      refreshToken: refreshToken.value,
      expiresIn: expiresIn.value
    }
    localStorage.setItem('authStore', JSON.stringify(authData))
    
    // Update axios default headers
    if (accessToken.value) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken.value}`
    } else {
      delete axios.defaults.headers.common['Authorization']
    }
  }

  // Clear state and storage
  const clearAuth = () => {
    user.value = null
    accessToken.value = null
    refreshToken.value = null
    expiresIn.value = null
    localStorage.removeItem('authStore')
    delete api.defaults.headers.common['Authorization']
    
    // Clear refresh timer
    if (refreshTimeout) {
      clearTimeout(refreshTimeout)
      refreshTimeout = null
    }
  }

  // Setup refresh timer
  const setupRefreshTimer = () => {
    if (refreshTimeout) {
      clearTimeout(refreshTimeout)
    }

    if (!expiresIn.value || !refreshToken.value) return

    // Refresh token 30 seconds before expiry
    const timeoutMs = (expiresIn.value * 1000) - 30000
    if (timeoutMs <= 0) return

    console.log(`Setting up refresh timer for ${timeoutMs}ms (${Math.round(timeoutMs/1000)}s)`)

    refreshTimeout = setTimeout(async () => {
      try {
        if (refreshToken.value) {
          console.log('Refreshing token...')
          const response = await authService.refreshToken(refreshToken.value)
          
          if (response.success) {
            console.log('Token refreshed successfully, updating state...')
            // Update access token and expiry
            accessToken.value = response.data.accessToken
            expiresIn.value = response.data.expiresIn
            
            // Save to storage
            saveToStorage()
            
            // Setup next refresh cycle (for another 15 minutes)
            console.log('Setting up next refresh cycle...')
            setupRefreshTimer()
          } else {
            console.error('Token refresh failed:', response.message)
            clearAuth()
          }
        }
      } catch (error) {
        console.error('Failed to refresh token:', error)
        clearAuth()
      }
    }, timeoutMs)
  }

  // Login
  const login = async (payload: LoginPayload): Promise<AuthResponse> => {
    try {
      const response = await authService.login(payload)
      
      if (response.success && response.data) {
        const { accessToken: token, refreshToken: refresh, expiresIn: expiry, ...userData } = response.data
        
        // Update store state
        user.value = userData
        accessToken.value = token
        refreshToken.value = refresh
        expiresIn.value = expiry

        // Save to localStorage
        saveToStorage()

        // Setup refresh timer
        setupRefreshTimer()
      }

      return response
    } catch (error: any) {
      const errorResponse: AuthResponse = {
        success: false,
        message: error.response?.data?.message || 'Login failed',
        data: {
          id: 0,
          username: '',
          email: '',
          firstName: '',
          lastName: '',
          role: {
            id: 0,
            name: '',
            description: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          rating: 0,
          completedProjects: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          accessToken: '',
          refreshToken: '',
          expiresIn: 0
        }
      }
      return errorResponse
    }
  }

  // Register
  const register = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    try {
      const response = await authService.register(credentials)
      return response
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
        data: {
          id: 0,
          username: '',
          email: '',
          firstName: '',
          lastName: '',
          role: {
            id: 0,
            name: '',
            description: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          rating: 0,
          completedProjects: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          accessToken: '',
          refreshToken: '',
          expiresIn: 0
        }
      }
    }
  }

  // Logout
  const logout = async () => {
    try {
      await authService.logout()
      clearAuth()
      return {
        success: true,
        message: 'Logged out successfully'
      }
    } catch (error: any) {
      clearAuth()
      return {
        success: false,
        message: error.response?.data?.message || 'Logout failed'
      }
    }
  }

  // Computed property for authentication status
  const isAuthenticated = () => {
    return !!accessToken.value && !!user.value
  }

  // Initialize auth state when store is created
  onMounted(() => {
    console.log('Initializing auth state...')
    initializeFromStorage()
  })

  return {
    user,
    accessToken,
    refreshToken,
    expiresIn,
    login,
    logout,
    isAuthenticated,
    initializeFromStorage,
    register
  }
}) 