export interface User {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  role: string
  createdAt: string
  updatedAt: string
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface LoginPayload {
  emailOrUsername: string
  password: string
}

export interface AuthData {
  user: User
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface AuthResponse extends ApiResponse<AuthData> {} 