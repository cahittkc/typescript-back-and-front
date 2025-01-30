<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-xl p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Error</h3>
            <p class="text-sm text-red-700 mt-1">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Project Details -->
      <div v-else-if="project" class="space-y-6">
        <!-- Project Header -->
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
          <div class="h-48 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
            <div class="absolute inset-0 bg-black/20"></div>
            <div class="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h1 class="text-3xl font-bold">{{ project.title }}</h1>
              <div class="flex items-center mt-2 space-x-4">
                <span :class="getStatusClass(project.status)" class="px-3 py-1 rounded-full text-sm font-semibold inline-flex items-center">
                  <span class="w-2 h-2 rounded-full mr-2" :class="{
                    'bg-emerald-400': project.status === 'open',
                    'bg-blue-400': project.status === 'in_progress',
                    'bg-gray-400': project.status === 'completed',
                    'bg-red-400': project.status === 'cancelled'
                  }"></span>
                  {{ project.status }}
                </span>
                <span class="flex items-center">
                  <svg class="w-5 h-5 mr-1 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  ${{ project.budget }}
                </span>
                <span class="flex items-center">
                  <svg class="w-5 h-5 mr-1 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {{ formatDate(project.deadline) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Project Content Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Left Column -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Description -->
            <div class="bg-white rounded-xl shadow-sm p-6">
              <h2 class="text-xl font-semibold text-gray-900 mb-4">Project Description</h2>
              <p class="text-gray-700 whitespace-pre-wrap">{{ project.description }}</p>
            </div>

            <!-- Required Skills -->
            <div class="bg-white rounded-xl shadow-sm p-6">
              <h2 class="text-xl font-semibold text-gray-900 mb-4">Required Skills</h2>
              <div class="flex flex-wrap gap-2">
                <span v-for="skill in project.requiredSkills" :key="skill"
                  class="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium inline-flex items-center">
                  <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  {{ skill }}
                </span>
              </div>
            </div>

            <!-- Project Updates -->
            <div v-if="project.status !== 'open'" class="bg-white rounded-xl shadow-sm p-6">
              <h2 class="text-xl font-semibold text-gray-900 mb-4">Project Updates</h2>
              <div class="space-y-4">
                <div v-if="project.status === 'completed'" class="bg-gray-50 rounded-lg p-4">
                  <div class="flex items-center mb-2">
                    <svg class="w-5 h-5 text-emerald-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span class="font-medium text-gray-900">Completed on {{ formatDate(project.completedAt) }}</span>
                  </div>
                  <p class="text-gray-700">{{ project.completionNotes }}</p>
                </div>
                <div v-else-if="project.status === 'cancelled'" class="bg-gray-50 rounded-lg p-4">
                  <div class="flex items-center mb-2">
                    <svg class="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span class="font-medium text-gray-900">Cancelled on {{ formatDate(project.cancelledAt) }}</span>
                  </div>
                  <p class="text-gray-700">{{ project.cancellationReason }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column -->
          <div class="space-y-6">
            <!-- Client Information -->
            <div class="bg-white rounded-xl shadow-sm p-6">
              <h2 class="text-xl font-semibold text-gray-900 mb-4">Client</h2>
              <div class="flex items-center">
                <div class="h-12 w-12 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold text-lg">
                  {{ project.client.username.charAt(0).toUpperCase() }}
                </div>
                <div class="ml-4">
                  <h3 class="text-lg font-medium text-gray-900">{{ project.client.username }}</h3>
                  <p class="text-sm text-gray-500">{{ project.client.email }}</p>
                </div>
              </div>
            </div>

            <!-- Assigned Freelancer -->
            <div class="bg-white rounded-xl shadow-sm p-6">
              <h2 class="text-xl font-semibold text-gray-900 mb-4">Assigned Freelancer</h2>
              <div v-if="project.assignedFreelancer" class="space-y-4">
                <div class="flex items-center">
                  <div class="h-12 w-12 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 flex items-center justify-center text-white font-semibold text-lg">
                    {{ project.assignedFreelancer.username.charAt(0).toUpperCase() }}
                  </div>
                  <div class="ml-4">
                    <h3 class="text-lg font-medium text-gray-900">{{ project.assignedFreelancer.username }}</h3>
                    <p class="text-sm text-gray-500">{{ project.assignedFreelancer.email }}</p>
                  </div>
                </div>
              </div>
              <div v-else-if="project.status === 'open'" class="space-y-4">
                <p class="text-gray-600">No freelancer assigned yet.</p>
                <div v-if="proposals.length > 0">
                  <h3 class="text-lg font-medium text-gray-900 mb-3">Proposals ({{ proposals.length }})</h3>
                  <div class="space-y-4">
                    <div v-for="proposal in proposals" :key="proposal.id" 
                      class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div class="flex justify-between items-start">
                        <div class="space-y-2">
                          <!-- Freelancer info section - only show if freelancer data exists -->
                          <div v-if="proposal.freelancer" class="flex items-center">
                            <div class="h-8 w-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-semibold">
                              {{ proposal.freelancer.firstName.charAt(0).toUpperCase() }}
                            </div>
                            <div class="ml-3">
                              <h4 class="text-sm font-medium text-gray-900">{{ proposal.freelancer.fullName }}</h4>
                              <p class="text-xs text-gray-500">{{ proposal.freelancer.email }}</p>
                            </div>
                          </div>
                          <p class="text-sm text-gray-700">{{ proposal.coverLetter }}</p>
                          <div class="flex items-center space-x-4 text-sm">
                            <span class="text-gray-600">Bid: <strong class="text-gray-900">${{ proposal.bidAmount }}</strong></span>
                            <span class="text-gray-600">Delivery: <strong class="text-gray-900">{{ proposal.deliveryTime }} days</strong></span>
                          </div>
                        </div>
                        <div v-if="isProjectOwner" class="flex space-x-2">
                          <button
                            v-if="!proposal.isAccepted"
                            @click="handleAcceptProposal(proposal.id)"
                            class="px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-colors shadow-sm"
                          >
                            Accept
                          </button>
                          <button
                            v-if="!proposal.isAccepted"
                            @click="handleRejectProposal(proposal.id)"
                            class="px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-rose-600 rounded-lg hover:from-red-700 hover:to-rose-700 transition-colors shadow-sm"
                          >
                            Reject
                          </button>
                          <span
                            v-if="proposal.isAccepted"
                            class="px-3 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg"
                          >
                            Accepted
                          </span>
                          <span
                            v-if="proposal.status === 'rejected'"
                            class="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 rounded-lg"
                          >
                            Rejected
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="text-gray-500 text-sm">
                  No proposals received yet.
                </div>
              </div>
              <div v-else class="text-gray-500">
                No freelancer assigned yet.
              </div>
            </div>

            <!-- Project Actions -->
            <div v-if="isProjectOwner && project.status === 'open'" class="bg-white rounded-xl shadow-sm p-6">
              <h2 class="text-xl font-semibold text-gray-900 mb-4">Project Actions</h2>
              <div class="space-y-3">
                <button class="w-full px-4 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                  Cancel Project
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useProjectStore } from '../stores/project'
import { useAuthStore } from '../stores/auth'
import axios from '../plugins/axios'

interface Freelancer {
  id: number
  username: string
  email: string
  firstName: string
  fullName: string
}

interface Client {
  id: number
  username: string
  email: string
}

interface Project {
  id: number
  title: string
  description: string
  status: 'open' | 'in_progress' | 'completed' | 'cancelled'
  category: string
  budget: number
  deadline: string
  requiredSkills: string[]
  client: Client
  assignedFreelancer?: Freelancer
  isCompleted: boolean
  completedAt?: string
  cancellationReason?: string
  cancelledAt?: string
  completionNotes?: string
  proposals?: Proposal[]
}

interface Proposal {
  id: number
  freelancer?: Freelancer
  coverLetter: string
  bidAmount: number
  deliveryTime: number
  status: string
  isAccepted: boolean
}

const route = useRoute()
const projectStore = useProjectStore()
const authStore = useAuthStore()

const project = ref<Project | null>(null)
const proposals = ref<Proposal[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const isProjectOwner = computed(() => {
  if (!project.value || !authStore.user) return false
  return project.value.client.id === authStore.user.id
})

const getStatusClass = (status: string) => {
  const classes = {
    'open': 'bg-green-100 text-green-800',
    'in_progress': 'bg-blue-100 text-blue-800',
    'completed': 'bg-gray-100 text-gray-800',
    'cancelled': 'bg-red-100 text-red-800'
  } as const

  return classes[status.toLowerCase() as keyof typeof classes] || 'bg-gray-100 text-gray-800'
}

const formatDate = (date: string | undefined) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString()
}

const fetchProjectDetails = async () => {
  loading.value = true
  error.value = null

  try {
    const projectId = Number(route.params.id)
    const response = await axios.get(`/projects/${projectId}`)
    
    if (response.data.success) {
      project.value = response.data.data
      // Set proposals directly from project details
      proposals.value = response.data.data.proposals || []
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to fetch project details'
  } finally {
    loading.value = false
  }
}

const handleAcceptProposal = async (proposalId: number) => {
  try {
    const response = await axios.post(`/proposals/${proposalId}/accept`)
    if (response.data.success) {
      // Refresh project details after accepting proposal
      await fetchProjectDetails()
      alert('Proposal accepted successfully!')
    } else {
      alert(response.data.message || 'Failed to accept proposal')
    }
  } catch (err: any) {
    console.error('Failed to accept proposal:', err)
    alert(err.response?.data?.message || 'An unexpected error occurred')
  }
}

const handleRejectProposal = async (proposalId: number) => {
  try {
    const response = await axios.post(`/proposals/${proposalId}/reject`)
    if (response.data.success) {
      // Refresh project details after rejecting proposal
      await fetchProjectDetails()
      alert('Proposal rejected successfully!')
    } else {
      alert(response.data.message || 'Failed to reject proposal')
    }
  } catch (err: any) {
    console.error('Failed to reject proposal:', err)
    alert(err.response?.data?.message || 'An unexpected error occurred')
  }
}

onMounted(() => {
  fetchProjectDetails()
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 