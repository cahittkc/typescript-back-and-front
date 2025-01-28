import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User, LoginPayload, AuthResponse, ApiResponse, AuthData } from '../types'
import { authService } from '../services/api'
import type { RegisterCredentials } from '../services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const accessToken = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)
  const expiresIn = ref<number | null>(null)

  // Initialize from localStorage
  const initializeFromStorage = () => {
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('accessToken')
    const storedRefreshToken = localStorage.getItem('refreshToken')
    const storedExpiry = localStorage.getItem('expiresIn')

    if (storedUser) user.value = JSON.parse(storedUser)
    if (storedToken) accessToken.value = storedToken
    if (storedRefreshToken) refreshToken.value = storedRefreshToken
    if (storedExpiry) expiresIn.value = parseInt(storedExpiry)
  }

  // Login
  const login = async (payload: LoginPayload): Promise<AuthResponse> => {
    const response = await authService.login(payload)
    
    if (response.success) {
      const userData = response.data
      const { accessToken, expiresIn } = userData
      
      // Remove tokens from user object before storing in state
      const { accessToken: _, expiresIn: __, ...userWithoutTokens } = userData
      
      // Update store state
      user.value = userWithoutTokens
      accessToken.value = accessToken
      expiresIn.value = expiresIn

      // Save to localStorage
      localStorage.setItem('user', JSON.stringify(userWithoutTokens))
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('expiresIn', expiresIn.toString())
    }

    return response
  }

  // Register
  const register = async (credentials: RegisterCredentials): Promise<ApiResponse<AuthData>> => {
    try {
      const response = await authService.register(credentials)

      if (response.success) {
        const { user: userData, accessToken: token, refreshToken: refresh, expiresIn: expiry } = response.data
        
        // Store user data and tokens
        user.value = userData
        accessToken.value = token
        refreshToken.value = refresh
        expiresIn.value = expiry

        // Save to localStorage
        localStorage.setItem('user', JSON.stringify(userData))
        localStorage.setItem('accessToken', token)
        localStorage.setItem('refreshToken', refresh)
        localStorage.setItem('expiresIn', expiry.toString())
      }

      return response
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
        data: {
          user: {
            id: 0,
            username: '',
            email: '',
            firstName: '',
            lastName: '',
            role: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          accessToken: '',
          refreshToken: '',
          expiresIn: 0
        }
      }
    }
  }

  // Logout
  const logout = () => {
    // Call logout service first
    authService.logout()

    // Clear store state
    user.value = null
    accessToken.value = null
    refreshToken.value = null
    expiresIn.value = null

    // Clear localStorage
    localStorage.removeItem('user')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('expiresIn')
  }

  // Computed property for authentication status
  const isAuthenticated = () => {
    return !!accessToken.value && !!user.value
  }

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