<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useProjectStore } from '../stores/project'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
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
}

const router = useRouter()
const projectStore = useProjectStore()
const authStore = useAuthStore()

const filters = ref({
  status: '',
  category: '',
  minBudget: '',
  maxBudget: '',
  startDate: '',
  endDate: ''
})

const categories = [
  'web_development',
  'mobile_development',
  'ui_ux_design',
  'data_science',
  'blockchain',
  'other'
]

const statuses = [
  'open',
  'in_progress',
  'completed',
  'cancelled'
]

const showNewProjectModal = ref(false)
const newProject = ref({
  title: '',
  description: '',
  budget: '',
  deadline: '',
  category: '',
  requiredSkills: [] as string[],
})

const canCreateProject = computed(() => {
  return authStore.user?.role?.name === 'admin' || authStore.user?.role?.name === 'client'
})

const skillInput = ref('')

const addSkill = () => {
  if (skillInput.value && !newProject.value.requiredSkills.includes(skillInput.value)) {
    newProject.value.requiredSkills.push(skillInput.value)
    skillInput.value = ''
  }
}

const removeSkill = (skill: string) => {
  newProject.value.requiredSkills = newProject.value.requiredSkills.filter(s => s !== skill)
}

const createProject = async () => {
  try {
    const result = await projectStore.createProject({
      ...newProject.value,
      budget: Number(newProject.value.budget)
    })
    
    if (result.success) {
      showNewProjectModal.value = false
      // Reset form
      newProject.value = {
        title: '',
        description: '',
        budget: '',
        deadline: '',
        category: '',
        requiredSkills: [],
      }
      // Refresh project list
      await projectStore.fetchProjects()
      // Show success message (you can implement a toast notification system here)
      alert('Project created successfully!')
    } else {
      // Show error message
      alert(result.message || 'Failed to create project')
    }
  } catch (error) {
    console.error('Failed to create project:', error)
    alert('An unexpected error occurred while creating the project')
  }
}

onMounted(async () => {
  await projectStore.fetchProjects()
})

const formatDateToISO = (date: string) => {
  return date ? new Date(date).toISOString().split('T')[0] : undefined
}

const applyFilters = async () => {
  const formattedFilters = {
    ...(filters.value.status && { status: filters.value.status }),
    ...(filters.value.category && { category: filters.value.category }),
    ...(filters.value.minBudget && { minBudget: Number(filters.value.minBudget) }),
    ...(filters.value.maxBudget && { maxBudget: Number(filters.value.maxBudget) }),
    ...(filters.value.startDate && { startDate: formatDateToISO(filters.value.startDate) }),
    ...(filters.value.endDate && { endDate: formatDateToISO(filters.value.endDate) })
  }
  await projectStore.fetchProjects(formattedFilters)
}

const clearFilters = () => {
  filters.value = {
    status: '',
    category: '',
    minBudget: '',
    maxBudget: '',
    startDate: '',
    endDate: ''
  }
  applyFilters()
}

const viewProjectDetails = (projectId: number) => {
  router.push(`/projects/${projectId}`)
}

const showProposalModal = ref(false)
const selectedProject = ref<Project | null>(null)
const newProposal = ref({
  projectId: 0,
  bidAmount: '',
  deliveryTime: '',
  coverLetter: '',
  attachments: ''
})

const canSubmitProposal = computed(() => {
  return authStore.user?.role?.name === 'freelancer'
})

const openProposalModal = (project: Project) => {
  selectedProject.value = project
  newProposal.value = {
    projectId: project.id,
    bidAmount: '',
    deliveryTime: '',
    coverLetter: '',
    attachments: ''
  }
  showProposalModal.value = true
}

const submitProposal = async () => {
  try {
    const response = await axios.post('/proposals', {
      ...newProposal.value,
      bidAmount: Number(newProposal.value.bidAmount),
      deliveryTime: Number(newProposal.value.deliveryTime)
    })
    
    if (response.data.success) {
      showProposalModal.value = false
      // Reset form
      newProposal.value = {
        projectId: 0,
        bidAmount: '',
        deliveryTime: '',
        coverLetter: '',
        attachments: ''
      }
      // Show success message
      alert('Proposal submitted successfully!')
    } else {
      alert(response.data.message || 'Failed to submit proposal')
    }
  } catch (error: any) {
    console.error('Failed to submit proposal:', error)
    alert(error.response?.data?.message || 'An unexpected error occurred while submitting the proposal')
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-4">
    <div class="max-w-7xl mx-auto flex gap-4">
      <!-- Left Sidebar - Filters -->
      <div class="w-72 flex-shrink-0">
        <div class="bg-white rounded-xl shadow-sm sticky top-20">
          <div class="p-4 border-b border-gray-100">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-gray-900">Filters</h2>
              <button
                @click="clearFilters"
                class="px-2 py-0.5 text-[11px] font-medium text-gray-500 bg-gray-50 rounded-md hover:bg-gray-100 transition-all duration-200 flex items-center gap-1 group"
              >
                <svg class="w-3 h-3 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Clear all</span>
              </button>
            </div>
          </div>

          <div class="p-4 space-y-4">
            <!-- Status Filter -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">Project Status</label>
              <div class="relative">
                <select
                  v-model="filters.status"
                  class="w-full rounded-lg border-gray-300 pl-3 pr-10 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option v-for="status in statuses" :key="status" :value="status">
                    {{ status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') }}
                  </option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <!-- Category Filter -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">Category</label>
              <div class="relative">
                <select
                  v-model="filters.category"
                  class="w-full rounded-lg border-gray-300 pl-3 pr-10 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Categories</option>
                  <option v-for="category in categories" :key="category" :value="category">
                    {{ category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') }}
                  </option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <!-- Budget Range -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">Budget Range</label>
              <div class="space-y-2">
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span class="text-gray-500 text-sm">$</span>
                  </div>
                  <input
                    v-model="filters.minBudget"
                    type="number"
                    placeholder="Min"
                    class="w-full pl-7 pr-3 py-2 text-sm rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span class="text-gray-500 text-sm">$</span>
                  </div>
                  <input
                    v-model="filters.maxBudget"
                    type="number"
                    placeholder="Max"
                    class="w-full pl-7 pr-3 py-2 text-sm rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <!-- Date Range -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">Deadline Range</label>
              <div class="space-y-2">
                <input
                  v-model="filters.startDate"
                  type="date"
                  class="w-full pr-3 py-2 text-sm rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  v-model="filters.endDate"
                  type="date"
                  class="w-full pr-3 py-2 text-sm rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <!-- Apply Filters Button -->
            <button
              @click="applyFilters"
              class="w-full px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span>Apply Filters</span>
            </button>
          </div>
        </div>

        <!-- Add New Project Button -->
        <div v-if="canCreateProject" class="mt-4">
          <button
            @click="showNewProjectModal = true"
            class="w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transform hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Create New Project
          </button>
        </div>
      </div>

      <!-- Right Content - Project List -->
      <div class="flex-1">
        <!-- Project Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <div
            v-for="project in projectStore.projects"
            :key="project.id"
            class="bg-white rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col"
          >
            <!-- Project Header -->
            <div class="p-4 flex-grow space-y-3">
              <div class="space-y-2">
                <div class="flex justify-between items-start gap-2">
                  <h3 class="text-base font-semibold text-gray-900 line-clamp-1">
                    {{ project.title }}
                  </h3>
                  <span
                    class="px-3 py-1.5 text-xs font-semibold rounded-full shrink-0 inline-flex items-center gap-2 shadow-sm transition-all duration-200"
                    :class="{
                      'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-500': project.status.toLowerCase() === 'open',
                      'bg-blue-100 text-blue-800 ring-1 ring-blue-500': project.status.toLowerCase() === 'in_progress',
                      'bg-slate-100 text-slate-800 ring-1 ring-slate-500': project.status.toLowerCase() === 'completed',
                      'bg-rose-100 text-rose-800 ring-1 ring-rose-500': project.status.toLowerCase() === 'cancelled'
                    }"
                  >
                    <svg 
                      class="w-3.5 h-3.5 flex-shrink-0" 
                      :class="{
                        'text-emerald-800': project.status.toLowerCase() === 'open',
                        'text-blue-800': project.status.toLowerCase() === 'in_progress',
                        'text-slate-800': project.status.toLowerCase() === 'completed',
                        'text-rose-800': project.status.toLowerCase() === 'cancelled'
                      }"
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        v-if="project.status.toLowerCase() === 'open'"
                        stroke-linecap="round" 
                        stroke-linejoin="round" 
                        stroke-width="2" 
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                      <path 
                        v-if="project.status.toLowerCase() === 'in_progress'"
                        stroke-linecap="round" 
                        stroke-linejoin="round" 
                        stroke-width="2" 
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                      <path 
                        v-if="project.status.toLowerCase() === 'completed'"
                        stroke-linecap="round" 
                        stroke-linejoin="round" 
                        stroke-width="2" 
                        d="M5 13l4 4L19 7"
                      />
                      <path 
                        v-if="project.status.toLowerCase() === 'cancelled'"
                        stroke-linecap="round" 
                        stroke-linejoin="round" 
                        stroke-width="2" 
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    <span class="whitespace-nowrap">
                      {{ project.status === 'in_progress' ? 'In Progress' : project.status.charAt(0).toUpperCase() + project.status.slice(1).toLowerCase() }}
                    </span>
                  </span>
                </div>
                <p class="text-sm text-gray-600 line-clamp-2">{{ project.description }}</p>
              </div>

              <!-- Project Details -->
              <div class="space-y-2">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-600">Budget</span>
                  <span class="font-medium text-gray-900">${{ project.budget }}</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-600">Deadline</span>
                  <span class="font-medium text-gray-900">{{ new Date(project.deadline).toLocaleDateString() }}</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-600">Category</span>
                  <span class="font-medium text-gray-900">{{ project.category.replace('_', ' ') }}</span>
                </div>
              </div>

              <!-- Required Skills -->
              <div class="space-y-1">
                <span class="text-xs text-gray-600">Required Skills</span>
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="skill in project.requiredSkills"
                    :key="skill"
                    class="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-800 rounded-full"
                  >
                    {{ skill }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Project Actions -->
            <div class="p-4 border-t border-gray-100">
              <button
                v-if="canSubmitProposal && project.status.toLowerCase() === 'open'"
                @click="openProposalModal(project)"
                class="w-full px-4 py-2 text-sm font-medium bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:opacity-90 transition-all mb-2"
              >
                Submit Proposal
              </button>
              <button
                @click="viewProjectDetails(project.id)"
                class="w-full px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:opacity-90 transition-all"
              >
                View Details
              </button>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="projectStore.pagination" class="flex justify-center mt-6 space-x-2">
          <button
            :disabled="!projectStore.pagination.hasPreviousPage"
            @click="projectStore.previousPage()"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span class="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-300">
            Page {{ projectStore.pagination.currentPage }} of {{ projectStore.pagination.totalPages }}
          </span>
          <button
            :disabled="!projectStore.pagination.hasNextPage"
            @click="projectStore.nextPage()"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- Create New Project Modal -->
    <div v-if="showNewProjectModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4">
        <div class="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 class="text-xl font-semibold text-gray-900">Create New Project</h2>
          <button
            @click="showNewProjectModal = false"
            class="p-2 text-gray-500 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="p-6 max-h-[calc(90vh-8rem)] overflow-y-auto">
          <div class="space-y-5">
            <!-- Title -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Project Title</label>
              <input
                v-model="newProject.title"
                type="text"
                class="w-full px-4 py-2.5 rounded-xl border border-gray-300 shadow-sm text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 transition-colors"
                placeholder="Enter project title"
              />
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                v-model="newProject.description"
                rows="4"
                class="w-full px-4 py-2.5 rounded-xl border border-gray-300 shadow-sm text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 transition-colors resize-none"
                placeholder="Enter project description"
              ></textarea>
            </div>

            <!-- Budget -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Budget</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span class="text-gray-500">$</span>
                </div>
                <input
                  v-model="newProject.budget"
                  type="number"
                  class="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-300 shadow-sm text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 transition-colors"
                  placeholder="Enter budget amount"
                />
              </div>
            </div>

            <!-- Deadline -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Deadline</label>
              <input
                v-model="newProject.deadline"
                type="date"
                class="w-full px-4 py-2.5 rounded-xl border border-gray-300 shadow-sm text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>

            <!-- Category -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <div class="relative">
                <select
                  v-model="newProject.category"
                  class="w-full px-4 py-2.5 rounded-xl border border-gray-300 shadow-sm text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none transition-colors"
                >
                  <option value="" disabled>Select a category</option>
                  <option v-for="category in categories" :key="category" :value="category">
                    {{ category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') }}
                  </option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <!-- Required Skills -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Required Skills</label>
              <div class="flex space-x-2 mb-3">
                <input
                  v-model="skillInput"
                  type="text"
                  class="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 shadow-sm text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 transition-colors"
                  placeholder="Enter a skill and press Enter"
                  @keyup.enter="addSkill"
                />
                <button
                  @click="addSkill"
                  class="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm"
                >
                  Add
                </button>
              </div>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="skill in newProject.requiredSkills"
                  :key="skill"
                  class="px-4 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-xl flex items-center group hover:bg-blue-100 transition-colors shadow-sm"
                >
                  {{ skill }}
                  <button
                    @click="removeSkill(skill)"
                    class="ml-2 text-blue-500 group-hover:text-blue-600"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end space-x-3 p-5 border-t border-gray-100">
          <button
            @click="showNewProjectModal = false"
            class="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 shadow-sm"
          >
            Cancel
          </button>
          <button
            @click="createProject"
            class="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm"
          >
            Create Project
          </button>
        </div>
      </div>
    </div>

    <!-- Proposal Modal -->
    <div v-if="showProposalModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4">
        <div class="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 class="text-xl font-semibold text-gray-900">Submit Proposal</h2>
          <button
            @click="showProposalModal = false"
            class="p-2 text-gray-500 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="p-6 max-h-[calc(90vh-8rem)] overflow-y-auto">
          <div class="space-y-5">
            <!-- Project Info -->
            <div class="bg-gray-50 p-4 rounded-xl">
              <h3 class="font-semibold text-gray-900">{{ selectedProject?.title }}</h3>
              <p class="text-sm text-gray-600 mt-1">Budget: ${{ selectedProject?.budget }}</p>
            </div>

            <!-- Bid Amount -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Your Bid Amount ($)</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span class="text-gray-500">$</span>
                </div>
                <input
                  v-model="newProposal.bidAmount"
                  type="number"
                  class="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-300 shadow-sm text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 transition-colors"
                  placeholder="Enter your bid amount"
                />
              </div>
            </div>

            <!-- Delivery Time -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Delivery Time (days)</label>
              <input
                v-model="newProposal.deliveryTime"
                type="number"
                class="w-full px-4 py-2.5 rounded-xl border border-gray-300 shadow-sm text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 transition-colors"
                placeholder="Enter delivery time in days"
              />
            </div>

            <!-- Cover Letter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Cover Letter</label>
              <textarea
                v-model="newProposal.coverLetter"
                rows="4"
                class="w-full px-4 py-2.5 rounded-xl border border-gray-300 shadow-sm text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 transition-colors resize-none"
                placeholder="Write your proposal cover letter..."
              ></textarea>
            </div>

            <!-- Attachments -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Attachments (Optional)</label>
              <input
                v-model="newProposal.attachments"
                type="text"
                class="w-full px-4 py-2.5 rounded-xl border border-gray-300 shadow-sm text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 transition-colors"
                placeholder="Add links to your portfolio or relevant work"
              />
            </div>
          </div>
        </div>

        <div class="flex justify-end space-x-3 p-5 border-t border-gray-100">
          <button
            @click="showProposalModal = false"
            class="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 shadow-sm"
          >
            Cancel
          </button>
          <button
            @click="submitProposal"
            class="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 shadow-sm"
          >
            Submit Proposal
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
input[type="date"]::-webkit-calendar-picker-indicator {
  cursor: pointer;
  filter: invert(0.5);
}
</style> 