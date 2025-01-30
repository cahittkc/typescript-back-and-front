export interface Role {
  id: number
  name: string
  description: string
  createdAt: string
  updatedAt: string
}

export interface User {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  role: Role
  bio?: string | null
  skills?: string[] | null
  experience?: string | null
  hourlyRate?: number | null
  portfolio?: string | null
  location?: string | null
  phoneNumber?: string | null
  languages?: string[] | null
  rating: number
  completedProjects: number
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

export interface AuthData extends User {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface AuthResponse extends ApiResponse<AuthData> {}

export interface Project {
  id: number
  title: string
  description: string
  budget: number
  deadline: string
  category: string
  status: string
  requiredSkills: string[]
  client: {
    id: number
    username: string
    firstName: string
    lastName: string
  }
  assignedFreelancer?: {
    id: number
    username: string
    firstName: string
    lastName: string
  }
  createdAt: string
  updatedAt: string
}

export interface Pagination {
  total: number
  totalPages: number
  currentPage: number
  limit: number
  hasNextPage: boolean
  hasPreviousPage: boolean
} 