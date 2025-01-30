<script setup lang="ts">
import { useAuthStore } from '../stores/auth'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const stats = ref([
  { label: 'Active Projects', value: '1.2K+' },
  { label: 'Expert Freelancers', value: '850+' },
  { label: 'Satisfied Clients', value: '950+' },
  { label: 'Success Rate', value: '98%' }
])

const features = ref([
  {
    title: 'Secure Payments',
    description: 'Our escrow system ensures your money is safe until you\'re completely satisfied with the work.',
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
  },
  {
    title: 'Top Talent',
    description: 'Connect with pre-vetted professionals who consistently deliver exceptional results.',
    icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'
  },
  {
    title: 'Fast Delivery',
    description: 'Get your projects completed on time with our efficient project management system.',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z'
  },
  {
    title: 'Quality Guaranteed',
    description: 'We maintain high standards with our satisfaction guarantee and quality control process.',
    icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z'
  }
])

const categories = ref([
  { name: 'Web Development', count: '450+ Projects' },
  { name: 'Mobile Development', count: '320+ Projects' },
  { name: 'UI/UX Design', count: '280+ Projects' },
  { name: 'Data Science', count: '150+ Projects' },
  { name: 'Blockchain', count: '90+ Projects' },
  { name: 'Other', count: '200+ Projects' }
])

const goToProjects = () => {
  router.push('/projects')
}

// Add animation delay utility
const getAnimationDelay = (index: number) => {
  return { animationDelay: `${index * 0.1}s` }
}

// Scroll reveal utility
const initScrollReveal = () => {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px'
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal')
        observer.unobserve(entry.target)
      }
    })
  }, observerOptions)

  // Observe elements with reveal classes
  document.querySelectorAll('.reveal-from-left, .reveal-from-right, .reveal-from-bottom').forEach((element) => {
    observer.observe(element)
  })
}

onMounted(() => {
  initScrollReveal()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <div class="relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700">
      <!-- Background Pattern -->
      <div class="absolute inset-0 opacity-10">
        <div class="absolute inset-0 animate-pulse-slow" style="background-image: url('data:image/svg+xml,%3Csvg width=\'30\' height=\'30\' viewBox=\'0 0 30 30\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M1.22676 0C1.91374 0 2.45351 0.539773 2.45351 1.22676C2.45351 1.91374 1.91374 2.45351 1.22676 2.45351C0.539773 2.45351 0 1.91374 0 1.22676C0 0.539773 0.539773 0 1.22676 0Z\' fill=\'rgba(255,255,255,0.7)\'/%3E%3C/svg%3E')"></div>
      </div>

      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div class="lg:grid lg:grid-cols-12 lg:gap-8">
          <div class="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
            <h1 class="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl animate-fade-in">
              Find the perfect
              <span class="block text-indigo-200 animate-slide-up">freelance services</span>
            </h1>
            <p class="mt-3 text-base text-indigo-100 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl animate-fade-in-up">
              Connect with talented freelancers, manage projects efficiently, and get exceptional results. Your success story starts here.
            </p>
            <div class="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0 animate-bounce-in">
              <button
                @click="goToProjects"
                class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-indigo-700 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-105"
              >
                Browse Projects
                <svg class="ml-2 -mr-1 w-5 h-5 animate-bounce-x" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
          <div class="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center animate-float">
            <div class="relative mx-auto w-full rounded-lg shadow-lg lg:max-w-md">
              <div class="relative block w-full bg-white rounded-lg overflow-hidden hover:transform hover:scale-105 transition-all duration-300">
                <img class="w-full" src="https://images.unsplash.com/photo-1522071820081-009f0129c71c" alt="Team working">
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Section -->
    <div class="relative bg-white reveal-from-bottom">
      <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-2 gap-5 sm:grid-cols-4">
          <div 
            v-for="(stat, index) in stats" 
            :key="stat.label" 
            class="flex flex-col items-center p-6 bg-gray-50 rounded-xl transform hover:scale-105 transition-all duration-300 animate-fade-in-up"
            :style="getAnimationDelay(index)"
          >
            <dt class="text-3xl font-extrabold text-indigo-600">{{ stat.value }}</dt>
            <dd class="mt-2 text-sm font-medium text-gray-600">{{ stat.label }}</dd>
          </div>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div class="relative bg-gray-50 py-16 sm:py-24 lg:py-32">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center animate-fade-in reveal-from-bottom">
          <h2 class="text-base font-semibold text-indigo-600 tracking-wide uppercase">Why Choose Us</h2>
          <p class="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">Everything you need to succeed</p>
          <p class="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            We provide all the tools and features you need to find the perfect match for your project.
          </p>
        </div>

        <div class="mt-16">
          <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div 
              v-for="(feature, index) in features" 
              :key="feature.title" 
              class="pt-6 animate-fade-in-up"
              :class="index % 2 === 0 ? 'reveal-from-left' : 'reveal-from-right'"
              :style="getAnimationDelay(index)"
            >
              <div class="flow-root bg-white rounded-xl px-6 pb-8 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div class="-mt-6">
                  <div>
                    <span class="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-xl shadow-lg">
                      <svg class="h-6 w-6 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="feature.icon" />
                      </svg>
                    </span>
                  </div>
                  <h3 class="mt-8 text-lg font-medium text-gray-900 tracking-tight">{{ feature.title }}</h3>
                  <p class="mt-5 text-base text-gray-500">{{ feature.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Categories Section -->
    <div class="relative bg-white">
      <div class="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:py-24 lg:px-8">
        <div class="text-center animate-fade-in reveal-from-bottom">
          <h2 class="text-base font-semibold text-indigo-600 tracking-wide uppercase">Popular Categories</h2>
          <p class="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">Find work in various fields</p>
        </div>

        <div class="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div 
            v-for="(category, index) in categories" 
            :key="category.name" 
            :class="[
              'group relative bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-fade-in-up',
              index % 2 === 0 ? 'reveal-from-left' : 'reveal-from-right'
            ]"
            :style="getAnimationDelay(index)"
          >
            <div>
              <h3 class="text-lg font-medium">
                <button @click="goToProjects" class="focus:outline-none">
                  <span class="absolute inset-0" aria-hidden="true" />
                  {{ category.name }}
                </button>
              </h3>
              <p class="mt-2 text-sm text-gray-500">{{ category.count }}</p>
            </div>
            <span class="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-indigo-500 transition-colors duration-300" aria-hidden="true">
              <svg class="h-6 w-6 transform group-hover:translate-x-1 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- CTA Section -->
    <div class="relative bg-gradient-to-r from-blue-600 to-indigo-700 animate-gradient reveal-from-bottom">
      <div class="max-w-7xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
        <h2 class="text-3xl font-extrabold text-white sm:text-4xl animate-fade-in">
          <span class="block">Ready to get started?</span>
          <span class="block text-indigo-200">Join our community today.</span>
        </h2>
        <div class="mt-8 flex justify-center animate-bounce-in">
          <div class="inline-flex rounded-xl shadow">
            <button
              v-if="!authStore.isAuthenticated()"
              @click="router.push('/register')"
              class="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-xl text-indigo-700 bg-white hover:bg-indigo-50 transition-all duration-300 transform hover:scale-105"
            >
              Get Started
            </button>
            <button
              v-else
              @click="goToProjects"
              class="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-xl text-indigo-700 bg-white hover:bg-indigo-50 transition-all duration-300 transform hover:scale-105"
            >
              View Projects
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-gradient {
  background-size: 200% 200%;
  animation: gradient 6s ease infinite;
}

.animate-pulse-slow {
  animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

.animate-fade-in-up {
  animation: fadeInUp 0.5s ease-out forwards;
}

.animate-slide-up {
  animation: slideUp 0.5s ease-out;
}

.animate-bounce-in {
  animation: bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

.animate-bounce-x {
  animation: bounceX 1s infinite;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(100%);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 0.9;
    transform: scale(1.1);
  }
  80% {
    opacity: 1;
    transform: scale(0.89);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes float {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
  100% {
    transform: translateY(0px);
  }
}

@keyframes bounceX {
  0%, 100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(5px);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.1;
  }
  50% {
    opacity: 0.15;
  }
}

/* Scroll reveal animations */
.reveal-from-left {
  opacity: 0;
  transform: translateX(-100px);
  transition: all 1s ease;
}

.reveal-from-right {
  opacity: 0;
  transform: translateX(100px);
  transition: all 1s ease;
}

.reveal-from-bottom {
  opacity: 0;
  transform: translateY(100px);
  transition: all 1s ease;
}

.reveal-from-left.reveal,
.reveal-from-right.reveal,
.reveal-from-bottom.reveal {
  opacity: 1;
  transform: translate(0);
}

/* Ensure elements are hidden before JavaScript loads */
.reveal-from-left,
.reveal-from-right,
.reveal-from-bottom {
  visibility: hidden;
}

.reveal-from-left.reveal,
.reveal-from-right.reveal,
.reveal-from-bottom.reveal {
  visibility: visible;
}
</style> 