import { defineStore } from 'pinia'
import { ref } from 'vue'
import { authService } from '@/services/api'
import type { User, LoginCredentials, RegisterCredentials, AuthResponse } from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const accessToken = ref<string | null>(null)
  const expiresIn = ref<number | null>(null)

  // Initialize from localStorage
  const initializeFromStorage = () => {
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('token')
    const storedExpiry = localStorage.getItem('tokenExpiry')

    if (storedUser) user.value = JSON.parse(storedUser)
    if (storedToken) accessToken.value = storedToken
    if (storedExpiry) expiresIn.value = parseInt(storedExpiry)
  }

  // Login
  const login = async (emailOrUsername: string, password: string) => {
    try {
      const response = await authService.login({
        emailOrUsername,
        password
      })

      // Store user data and tokens
      user.value = response.user
      accessToken.value = response.accessToken
      expiresIn.value = response.expiresIn

      // Save to localStorage
      localStorage.setItem('user', JSON.stringify(response.user))
      localStorage.setItem('token', response.accessToken)
      localStorage.setItem('tokenExpiry', response.expiresIn.toString())

      return {
        success: true,
        data: response
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      }
    }
  }

  // Register
  const register = async (credentials: RegisterCredentials) => {
    try {
      const response = await authService.register(credentials)

      // Store user data and tokens
      user.value = response.user
      accessToken.value = response.accessToken
      expiresIn.value = response.expiresIn

      // Save to localStorage
      localStorage.setItem('user', JSON.stringify(response.user))
      localStorage.setItem('token', response.accessToken)
      localStorage.setItem('tokenExpiry', response.expiresIn.toString())

      return {
        success: true,
        data: response
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      }
    }
  }

  // Logout
  const logout = () => {
    // Clear store
    user.value = null
    accessToken.value = null
    expiresIn.value = null

    // Clear localStorage
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    localStorage.removeItem('tokenExpiry')

    // Call logout service
    authService.logout()
  }

  // Computed property for authentication status
  const isAuthenticated = () => {
    return !!user.value && !!accessToken.value
  }

  return {
    user,
    accessToken,
    expiresIn,
    isAuthenticated,
    initializeFromStorage,
    login,
    register,
    logout
  }
}) 