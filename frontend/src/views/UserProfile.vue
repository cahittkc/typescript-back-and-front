<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useProjectStore } from '../stores/project'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const authStore = useAuthStore()
const projectStore = useProjectStore()
const user = ref(authStore.user)

const profileTabs = ref([
  { id: 'overview', label: 'Overview', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'projects', label: 'Projects', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
  { id: 'settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
])

const activeTab = ref('overview')

const stats = [
  { label: 'Total Projects', value: '12' },
  { label: 'Completed', value: '8' },
  { label: 'In Progress', value: '3' },
  { label: 'Success Rate', value: '92%' },
]

const skills = [
  { name: 'React', level: 90 },
  { name: 'Vue.js', level: 85 },
  { name: 'Node.js', level: 80 },
  { name: 'TypeScript', level: 75 },
  { name: 'Python', level: 70 },
]

const recentActivity = [
  { type: 'project_created', project: 'E-commerce Platform', date: '2 days ago' },
  { type: 'project_completed', project: 'Portfolio Website', date: '1 week ago' },
  { type: 'project_started', project: 'Mobile App Development', date: '2 weeks ago' },
]

const loadMyProjects = async () => {
  if (activeTab.value === 'projects') {
    const result = await projectStore.fetchMyProjects()
    if (result?.success && authStore.user?.role?.name === 'client') {
      // Load proposals for each project
      for (const project of result.data) {
        if (project.status === 'OPEN') {
          const proposals = await loadProposals(project.id)
          project.proposals = proposals
        }
      }
    }
  }
}

const viewProjectDetails = (projectId: number) => {
  router.push(`/projects/${projectId}`)
}

const loadProposals = async (projectId: number) => {
  try {
    const response = await axios.get(`/projects/${projectId}/proposals`)
    if (response.data.success) {
      return response.data.data
    }
    return []
  } catch (error) {
    console.error('Failed to load proposals:', error)
    return []
  }
}

const handleAcceptProposal = async (proposalId: number) => {
  try {
    const response = await axios.post(`/proposals/${proposalId}/accept`)
    if (response.data.success) {
      await loadMyProjects() // Refresh projects after accepting proposal
      alert('Proposal accepted successfully!')
    } else {
      alert(response.data.message || 'Failed to accept proposal')
    }
  } catch (error: any) {
    console.error('Failed to accept proposal:', error)
    alert(error.response?.data?.message || 'An unexpected error occurred')
  }
}

const handleRejectProposal = async (proposalId: number) => {
  try {
    const response = await axios.post(`/proposals/${proposalId}/reject`)
    if (response.data.success) {
      await loadMyProjects() // Refresh projects after rejecting proposal
      alert('Proposal rejected successfully!')
    } else {
      alert(response.data.message || 'Failed to reject proposal')
    }
  } catch (error: any) {
    console.error('Failed to reject proposal:', error)
    alert(error.response?.data?.message || 'An unexpected error occurred')
  }
}

onMounted(async () => {
  await loadMyProjects()
})

watch(activeTab, async (newTab) => {
  if (newTab === 'projects') {
    await loadMyProjects()
  }
})

// Kullanıcı durumunu izle
watch(() => authStore.isAuthenticated, (isAuthenticated) => {
  if (!isAuthenticated) {
    router.push('/')
  }
})

interface Proposal {
  id: number
  freelancer: {
    id: number
    username: string
    email: string
  }
  bidAmount: number
  deliveryTime: number
  coverLetter: string
  attachments?: string
  status: string
  isAccepted: boolean
}

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
  proposals?: Proposal[]
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Profile Header -->
      <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div class="h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
        <div class="relative px-6 pb-6">
          <div class="flex flex-col sm:flex-row items-center">
            <div class="relative -mt-16">
              <div class="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg">
                <img
                  :src="user?.avatar || 'https://ui-avatars.com/api/?name=' + user?.username"
                  :alt="user?.username"
                  class="w-full h-full object-cover"
                />
              </div>
            </div>
            <div class="mt-6 sm:mt-0 sm:ml-6 text-center sm:text-left flex-grow">
              <h1 class="text-2xl font-bold text-gray-900">{{ user?.username }}</h1>
              <p class="text-gray-500 text-sm mt-1">{{ user?.role?.name }}</p>
              <div class="mt-4 flex flex-wrap gap-3">
                <button class="inline-flex items-center px-4 py-2 text-sm font-medium text-white transition-all duration-200 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Edit Profile
                </button>
                <button class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transform hover:scale-[1.02] active:scale-[0.98] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Share Profile
                </button>
                <button class="inline-flex items-center px-4 py-2 text-sm font-medium text-emerald-700 transition-all duration-200 bg-emerald-50 border border-transparent rounded-xl hover:bg-emerald-100 transform hover:scale-[1.02] active:scale-[0.98] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  Message
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div
          v-for="stat in stats"
          :key="stat.label"
          class="bg-white rounded-xl shadow-sm p-6"
        >
          <dt class="text-sm font-medium text-gray-500">{{ stat.label }}</dt>
          <dd class="mt-1 text-2xl font-semibold text-gray-900">{{ stat.value }}</dd>
        </div>
      </div>

      <!-- Tabs -->
      <div class="mt-8">
        <div class="bg-white rounded-xl shadow-sm p-1">
          <nav class="flex">
            <button
              v-for="tab in profileTabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
                'group relative min-w-0 flex-1 overflow-hidden py-3 px-4 text-sm font-medium text-center focus:z-10 focus:outline-none transition-all duration-200 rounded-lg'
              ]"
            >
              <div class="flex items-center justify-center space-x-2">
                <svg
                  class="w-5 h-5"
                  :class="activeTab === tab.id ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="tab.icon" />
                </svg>
                <span>{{ tab.label }}</span>
              </div>
              <span
                v-if="activeTab === tab.id"
                class="absolute inset-x-0 bottom-0 h-0.5 bg-white"
                aria-hidden="true"
              ></span>
            </button>
          </nav>
        </div>
      </div>

      <!-- Tab Content -->
      <div class="mt-8">
        <!-- Overview Tab -->
        <div v-if="activeTab === 'overview'" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Skills Section -->
          <div class="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Skills & Expertise</h3>
            <div class="space-y-4">
              <div v-for="skill in skills" :key="skill.name" class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-sm font-medium text-gray-700">{{ skill.name }}</span>
                  <span class="text-sm text-gray-500">{{ skill.level }}%</span>
                </div>
                <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500"
                    :style="{ width: `${skill.level}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="bg-white rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
            <div class="flow-root">
              <ul class="-mb-8">
                <li v-for="(activity, index) in recentActivity" :key="activity.project" class="relative pb-8">
                  <div class="relative flex items-start space-x-3">
                    <div class="relative">
                      <span
                        class="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white"
                        :class="{
                          'bg-green-500': activity.type === 'project_completed',
                          'bg-blue-500': activity.type === 'project_created',
                          'bg-yellow-500': activity.type === 'project_started'
                        }"
                      >
                        <svg class="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            v-if="activity.type === 'project_completed'"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M5 13l4 4L19 7"
                          />
                          <path
                            v-else-if="activity.type === 'project_created'"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 4v16m8-8H4"
                          />
                          <path
                            v-else
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                          />
                        </svg>
                      </span>
                    </div>
                    <div class="min-w-0 flex-1">
                      <div class="text-sm font-medium text-gray-900">
                        {{ activity.project }}
                      </div>
                      <p class="mt-0.5 text-sm text-gray-500">
                        {{ activity.date }}
                      </p>
                    </div>
                  </div>
                  <div
                    v-if="index !== recentActivity.length - 1"
                    class="absolute left-4 top-8 -ml-px h-full w-0.5 bg-gray-200"
                  ></div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Projects Tab -->
        <div v-else-if="activeTab === 'projects'" class="space-y-6">
          <!-- Loading State -->
          <div v-if="projectStore.loading" class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>

          <!-- Error State -->
          <div v-else-if="projectStore.error" class="bg-red-50 p-4 rounded-xl">
            <p class="text-red-600 text-sm">{{ projectStore.error }}</p>
          </div>

          <!-- No Projects State -->
          <div v-else-if="!projectStore.projects.length" class="bg-white rounded-xl shadow-sm p-6 text-center">
            <div class="flex flex-col items-center space-y-3">
              <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3 class="text-lg font-medium text-gray-900">No Projects Found</h3>
              <p class="text-gray-500 text-sm">You haven't created or participated in any projects yet.</p>
              <button 
                v-if="user?.role?.name === 'client'"
                class="mt-2 inline-flex items-center px-4 py-2 text-sm font-medium text-white transition-all duration-200 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Create New Project
              </button>
            </div>
          </div>

          <!-- Projects List -->
          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 bg-white rounded-xl shadow-sm">
              <thead>
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deadline</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Required Skills</th>
                  <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="project in projectStore.projects" :key="project.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4">
                    <div class="flex items-center">
                      <div>
                        <div class="text-sm font-medium text-gray-900">{{ project.title }}</div>
                        <div class="text-sm text-gray-500">{{ project.description }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <span
                      class="px-3 py-1 text-xs font-semibold rounded-full inline-flex items-center"
                      :class="{
                        'bg-emerald-100 text-emerald-800': project.status.toLowerCase() === 'open',
                        'bg-blue-100 text-blue-800': project.status.toLowerCase() === 'in_progress',
                        'bg-gray-100 text-gray-800': project.status.toLowerCase() === 'completed',
                        'bg-red-100 text-red-800': project.status.toLowerCase() === 'cancelled'
                      }"
                    >
                      {{ project.status.charAt(0).toUpperCase() + project.status.slice(1).toLowerCase() }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-900">${{ project.budget }}</td>
                  <td class="px-6 py-4 text-sm text-gray-900">{{ new Date(project.deadline).toLocaleDateString() }}</td>
                  <td class="px-6 py-4">
                    <div class="flex flex-wrap gap-1">
                      <span
                        v-for="skill in project.requiredSkills"
                        :key="skill"
                        class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {{ skill }}
                      </span>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                    <div class="flex justify-end space-x-2">
                      <button 
                        @click="viewProjectDetails(project.id)"
                        class="inline-flex items-center p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                        title="View Details"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
                <template v-for="project in projectStore.projects" :key="'proposals-' + project.id">
                  <tr v-if="project.status === 'OPEN' && authStore.user?.role?.name === 'client'" class="bg-gray-50">
                    <td colspan="6" class="px-6 py-4">
                      <div class="space-y-4">
                        <h4 class="text-sm font-medium text-gray-900">Proposals for {{ project.title }}</h4>
                        <div v-if="project.proposals && project.proposals.length > 0" class="space-y-3">
                          <div v-for="proposal in project.proposals" :key="proposal.id" 
                            class="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <div class="flex justify-between items-start">
                              <div class="space-y-1">
                                <div class="flex items-center space-x-2">
                                  <span class="font-medium text-gray-900">{{ proposal.freelancer.username }}</span>
                                  <span class="text-sm text-gray-500">{{ proposal.freelancer.email }}</span>
                                </div>
                                <p class="text-sm text-gray-700">{{ proposal.coverLetter }}</p>
                                <div class="flex items-center space-x-4 text-sm text-gray-600">
                                  <span>Bid Amount: <strong class="text-gray-900">${{ proposal.bidAmount }}</strong></span>
                                  <span>Delivery Time: <strong class="text-gray-900">{{ proposal.deliveryTime }} days</strong></span>
                                </div>
                              </div>
                              <div class="flex space-x-2">
                                <button
                                  @click="handleAcceptProposal(proposal.id)"
                                  class="px-3 py-1.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
                                >
                                  Accept
                                </button>
                                <button
                                  @click="handleRejectProposal(proposal.id)"
                                  class="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                                >
                                  Reject
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div v-else class="text-sm text-gray-500">
                          No proposals received yet for this project.
                        </div>
                      </div>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Settings Tab -->
        <div v-else-if="activeTab === 'settings'" class="bg-white rounded-xl shadow-sm p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Profile Settings</h3>
          <!-- Settings content will go here -->
        </div>
      </div>
    </div>
  </div>
</template>

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