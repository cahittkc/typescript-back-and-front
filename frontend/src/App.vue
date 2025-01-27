<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import LoginModal from './components/LoginModal.vue'
import RegisterModal from './components/RegisterModal.vue'

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
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-bold text-gray-900">Freelance Platform</h1>
          
          <div class="flex items-center space-x-4">
            <template v-if="authStore.isAuthenticated()">
              <div class="flex items-center space-x-4">
                <span class="text-sm text-gray-700">
                  {{ authStore.user?.firstName }} {{ authStore.user?.lastName }}
                </span>
                <button
                  @click="handleLogout"
                  class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Logout
                </button>
              </div>
            </template>
            <template v-else>
              <button
                @click="openLoginModal"
                class="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                Login
              </button>
              <button
                @click="openRegisterModal"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Register
              </button>
            </template>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Main content goes here -->
    </main>

    <!-- Modals -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <LoginModal
        v-if="showLoginModal"
        @close="closeLoginModal"
        @login-success="handleLoginSuccess"
        @switch-to-register="openRegisterModal"
      />
    </Transition>

    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <RegisterModal
        v-if="showRegisterModal"
        @close="closeRegisterModal"
        @register-success="handleRegisterSuccess"
        @switch-to-login="openLoginModal"
      />
    </Transition>
  </div>
</template>

<style>
/* Remove default margin and padding */
body {
  margin: 0;
  padding: 0;
}
</style>
