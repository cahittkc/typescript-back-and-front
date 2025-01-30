import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from '../plugins/axios'

interface Project {
  id: number
  title: string
  description: string
  status: string
  category: string
  budget: number
  deadline: string
  requiredSkills: string[]
  attachments: string
  client: {
    id: number
    username: string
    email: string
  }
  assignedFreelancer?: {
    id: number
    username: string
    email: string
  }
  isCompleted: boolean
  completedAt?: string
  cancellationReason?: string
  cancelledAt?: string
  completionNotes?: string
  clientRating?: number
  freelancerRating?: number
  clientReview?: string
  freelancerReview?: string
  createdAt: string
  updatedAt: string
}

interface Pagination {
  total: number
  totalPages: number
  currentPage: number
  limit: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

interface ProjectFilters {
  status?: string
  category?: string
  minBudget?: string | number
  maxBudget?: string | number
  startDate?: string
  endDate?: string
}

interface CreateProjectPayload {
  title: string
  description: string
  budget: number
  deadline: string
  category: string
  requiredSkills: string[]
}

export const useProjectStore = defineStore('project', () => {
  const projects = ref<Project[]>([])
  const pagination = ref<Pagination | null>(null)
  const currentPage = ref(1)
  const limit = ref(10)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchProjects = async (filters: ProjectFilters = {}) => {
    loading.value = true
    error.value = null

    try {
      const params = {
        page: currentPage.value,
        limit: limit.value,
        ...filters
      }

      const response = await axios.get('/projects', { params })
      
      if (response.data.success) {
        projects.value = response.data.data.projects
        pagination.value = response.data.data.pagination
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch projects'
    } finally {
      loading.value = false
    }
  }

  const fetchMyProjects = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.get('/projects/my-projects')
      
      if (response.data.success) {
        projects.value = response.data.data
        return {
          success: true,
          data: response.data.data
        }
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch your projects'
      return {
        success: false,
        message: error.value
      }
    } finally {
      loading.value = false
    }
  }

  const createProject = async (projectData: CreateProjectPayload) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await axios.post('/projects', projectData)
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        }
      } else {
        error.value = response.data.message || 'Failed to create project'
        return {
          success: false,
          message: error.value
        }
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'An error occurred while creating the project'
      return {
        success: false,
        message: error.value
      }
    } finally {
      loading.value = false
    }
  }

  const assignFreelancer = async (projectId: number, freelancerId: number) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await axios.post(`/projects/${projectId}/assign`, { freelancerId })
      
      if (response.data.success) {
        // Update the project in the projects array
        const index = projects.value.findIndex(p => p.id === projectId)
        if (index !== -1) {
          projects.value[index] = response.data.data
        }
        
        return {
          success: true,
          data: response.data.data
        }
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to assign freelancer'
      return {
        success: false,
        message: error.value
      }
    } finally {
      loading.value = false
    }
  }

  const nextPage = async () => {
    if (pagination.value?.hasNextPage) {
      currentPage.value++
      await fetchProjects()
    }
  }

  const previousPage = async () => {
    if (pagination.value?.hasPreviousPage) {
      currentPage.value--
      await fetchProjects()
    }
  }

  return {
    projects,
    pagination,
    currentPage,
    limit,
    loading,
    error,
    fetchProjects,
    fetchMyProjects,
    createProject,
    assignFreelancer,
    nextPage,
    previousPage
  }
}) 