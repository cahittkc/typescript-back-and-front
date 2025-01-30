<script setup lang="ts">
import { ref, onMounted } from 'vue'
import LoginModal from './components/LoginModal.vue'
import RegisterModal from './components/RegisterModal.vue'
import { useAuthStore } from './stores/auth'

const showLoginModal = ref(false)
const showRegisterModal = ref(false)
const showUserMenu = ref(false)
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

const handleLogout = async () => {
  try {
    const response = await authStore.logout()
    if (!response.success) {
      // You might want to show an error notification here
      console.error('Logout failed:', response.message)
    }
    showUserMenu.value = false
  } catch (error) {
    // Handle any unexpected errors
    console.error('Unexpected error during logout:', error)
  }
}

// Close dropdown when clicking outside
const closeUserMenu = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.user-menu-container')) {
    showUserMenu.value = false
  }
}

// Add click event listener to document
onMounted(() => {
  document.addEventListener('click', closeUserMenu)
})
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <nav class="bg-white shadow-sm sticky top-0 z-[30]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex justify-between items-center">
          <div class="flex items-center space-x-8">
            <!-- Logo -->
            <router-link to="/" class="flex items-center space-x-2">
              <svg class="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
              </svg>
              <h1 class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Freelance Platform
              </h1>
            </router-link>
            
            <!-- Navigation Links -->
            <nav class="hidden md:flex space-x-8">
              <router-link
                to="/projects"
                class="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
                :class="{ 'text-blue-600': $route.path === '/projects' }"
              >
                Projects
              </router-link>
            </nav>
          </div>
          
          <div class="flex items-center space-x-4">
            <template v-if="authStore.isAuthenticated()">
              <div class="relative user-menu-container">
                <button
                  @click.stop="showUserMenu = !showUserMenu"
                  class="flex items-center space-x-3 px-4 py-2 rounded-full hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all duration-200"
                >
                  <div class="w-9 h-9 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-medium shadow-md">
                    {{ authStore.user?.firstName?.[0]?.toUpperCase() }}
                  </div>
                  <span class="text-sm font-medium text-gray-700">
                    {{ authStore.user?.firstName }} {{ authStore.user?.lastName }}
                  </span>
                  <svg
                    class="w-4 h-4 text-gray-500 transition-transform duration-200"
                    :class="{ 'rotate-180': showUserMenu }"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                <!-- Dropdown Menu -->
                <div
                  v-if="showUserMenu"
                  class="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg py-2 z-10 transform origin-top-right transition-all duration-200"
                >
                  <router-link
                    to="/profile"
                    class="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors no-underline"
                  >
                    <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Profile</span>
                  </router-link>
                  <a
                    href="#"
                    class="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors no-underline"
                  >
                    <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Settings</span>
                  </a>
                  <div class="border-t border-gray-100 my-1"></div>
                  <a
                    @click="handleLogout"
                    class="flex items-center space-x-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors cursor-pointer"
                  >
                    <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Logout</span>
                  </a>
                </div>
              </div>
            </template>
            <template v-else>
              <button
                @click="openLoginModal"
                class="px-5 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                Login
              </button>
              <button
                @click="openRegisterModal"
                class="px-5 py-2 text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full hover:shadow-md hover:opacity-90 transition-all"
              >
                Register
              </button>
            </template>
          </div>
        </div>
      </div>
    </nav>

    <main class="flex-1">
      <router-view></router-view>
    </main>

    <!-- Footer -->
    <footer class="bg-gray-900 text-gray-300">
      <!-- Main Footer -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <!-- Company Info -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-white">Freelance Platform</h3>
            <p class="text-sm text-gray-400">Connecting talented freelancers with amazing projects. Build your future with us.</p>
            <div class="flex space-x-4">
              <a href="#" class="text-gray-400 hover:text-white transition-colors">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" class="text-gray-400 hover:text-white transition-colors">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a href="#" class="text-gray-400 hover:text-white transition-colors">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a href="#" class="text-gray-400 hover:text-white transition-colors">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.237 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
            </div>
          </div>

          <!-- Quick Links -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-white">Quick Links</h3>
            <ul class="space-y-2">
              <li>
                <router-link to="/projects" class="text-gray-400 hover:text-white transition-colors">Find Projects</router-link>
              </li>
              <li>
                <router-link to="/freelancers" class="text-gray-400 hover:text-white transition-colors">Hire Freelancers</router-link>
              </li>
              <li>
                <a href="#" class="text-gray-400 hover:text-white transition-colors">Success Stories</a>
              </li>
              <li>
                <a href="#" class="text-gray-400 hover:text-white transition-colors">How It Works</a>
              </li>
            </ul>
          </div>

          <!-- Categories -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-white">Categories</h3>
            <ul class="space-y-2">
              <li>
                <a href="#" class="text-gray-400 hover:text-white transition-colors">Web Development</a>
              </li>
              <li>
                <a href="#" class="text-gray-400 hover:text-white transition-colors">Mobile Development</a>
              </li>
              <li>
                <a href="#" class="text-gray-400 hover:text-white transition-colors">UI/UX Design</a>
              </li>
              <li>
                <a href="#" class="text-gray-400 hover:text-white transition-colors">Data Science</a>
              </li>
              <li>
                <a href="#" class="text-gray-400 hover:text-white transition-colors">Blockchain</a>
              </li>
            </ul>
          </div>

          <!-- Newsletter -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-white">Stay Updated</h3>
            <p class="text-sm text-gray-400">Subscribe to our newsletter for the latest updates and opportunities.</p>
            <form class="flex space-x-2">
              <input
                type="email"
                placeholder="Enter your email"
                class="flex-1 px-4 py-2 text-sm text-gray-900 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
              <button
                type="submit"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      <!-- Bottom Footer -->
      <div class="border-t border-gray-800">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div class="md:flex md:items-center md:justify-between">
            <div class="text-sm text-gray-400">
              © {{ new Date().getFullYear() }} Freelance Platform. All rights reserved.
            </div>
            <div class="mt-4 md:mt-0">
              <ul class="flex space-x-6 text-sm">
                <li>
                  <a href="#" class="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
                </li>
                <li>
                  <a href="#" class="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
                </li>
                <li>
                  <a href="#" class="text-gray-400 hover:text-white transition-colors">Cookie Policy</a>
                </li>
                <li>
                  <a href="#" class="text-gray-400 hover:text-white transition-colors">Contact Us</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
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
  transition-property: color, background-color, border-color, transform, opacity;
  transition-duration: 200ms;
}

/* Gradient animation */
@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

a {
  text-decoration: none;
}

.bg-gradient-animate {
  background-size: 200% 200%;
  animation: gradient 6s ease infinite;
}
</style>
