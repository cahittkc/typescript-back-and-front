<script setup lang="ts">
import { ref, onMounted } from 'vue'
import LoginModal from './components/LoginModal.vue'
import RegisterModal from './components/RegisterModal.vue'
import { useAuthStore } from './stores/auth'

const showLoginModal = ref(false)
const showRegisterModal = ref(false)
const authStore = useAuthStore()

onMounted(() => {
  authStore.initializeFromStorage()
})

const openLoginModal = () => {
  showLoginModal.value = true
  showRegisterModal.value = false
}

const openRegisterModal = () => {
  showRegisterModal.value = true
  showLoginModal.value = false
}

const closeLoginModal = () => {
  showLoginModal.value = false
}

const closeRegisterModal = () => {
  showRegisterModal.value = false
}

const handleLoginSuccess = () => {
  showLoginModal.value = false
}

const handleRegisterSuccess = () => {
  showRegisterModal.value = false
}

const handleLogout = () => {
  authStore.logout()
}
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-bold text-gray-900">Freelance Platform</h1>
          
          <div class="flex items-center space-x-4">
            <template v-if="authStore.isAuthenticated()">
              <div class="flex flex-col items-end">
                <span class="text-sm font-medium text-gray-900">{{ authStore.user?.firstName }} {{ authStore.user?.lastName }}</span>
                <span class="text-xs text-gray-500 capitalize">{{ authStore.user?.role }}</span>
              </div>
              <button
                @click="handleLogout"
                class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Logout
              </button>
            </template>
            <template v-else>
              <button
                @click="openLoginModal"
                class="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Login
              </button>
              <button
                @click="openRegisterModal"
                class="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Register
              </button>
            </template>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Your main content here -->
    </main>
  </div>

  <!-- Modals -->
  <Transition>
    <LoginModal
      v-if="showLoginModal"
      @close="closeLoginModal"
      @login-success="handleLoginSuccess"
      @switch-to-register="openRegisterModal"
    />
  </Transition>

  <Transition>
    <RegisterModal
      v-if="showRegisterModal"
      @close="closeRegisterModal"
      @register-success="handleRegisterSuccess"
      @switch-to-login="openLoginModal"
    />
  </Transition>
</template>

<style>
/* Remove default margin and padding */
body {
  margin: 0;
  padding: 0;
}

/* Smooth transitions */
* {
  transition-property: color, background-color, border-color;
  transition-duration: 200ms;
}
</style>
