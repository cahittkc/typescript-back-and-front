<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

const form = ref({
  emailOrUsername: '',
  password: '',
  remember: false
})

const errors = ref({
  emailOrUsername: '',
  password: ''
})

const loading = ref(false)
const showPassword = ref(false)

const handleSubmit = async () => {
  loading.value = true
  errors.value = { emailOrUsername: '', password: '' }

  try {
    await authStore.login({
      emailOrUsername: form.value.emailOrUsername,
      password: form.value.password
    })
  } catch (error: any) {
    if (error.response?.data?.details) {
      const details = error.response.data.details
      details.forEach((detail: any) => {
        if (errors.value.hasOwnProperty(detail.property)) {
          errors.value[detail.property as keyof typeof errors.value] = Object.values(detail.constraints)[0] as string
        }
      })
    } else {
      errors.value.emailOrUsername = error.response?.data?.message || 'An error occurred'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <div class="space-y-4">
      <!-- Email/Username Input -->
      <div>
        <label for="emailOrUsername" class="block text-sm font-medium text-gray-700">Email or Username</label>
        <input
          id="emailOrUsername"
          v-model="form.emailOrUsername"
          type="text"
          required
          class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          :class="{ 'border-red-500': errors.emailOrUsername }"
        />
        <p v-if="errors.emailOrUsername" class="mt-1 text-sm text-red-600">{{ errors.emailOrUsername }}</p>
      </div>

      <!-- Password Input -->
      <div>
        <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
        <div class="relative">
          <input
            id="password"
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            required
            class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            :class="{ 'border-red-500': errors.password }"
          />
          <button
            type="button"
            @click="showPassword = !showPassword"
            class="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <svg
              class="h-5 w-5 text-gray-400 hover:text-gray-500"
              :class="{ 'text-blue-500': showPassword }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                v-if="showPassword"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                v-if="showPassword"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
              <path
                v-else
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
              />
            </svg>
          </button>
        </div>
        <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
      </div>
    </div>

    <!-- Remember Me & Forgot Password -->
    <div class="flex items-center justify-between">
      <div class="flex items-center">
        <input
          id="remember"
          v-model="form.remember"
          type="checkbox"
          class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
        />
        <label for="remember" class="ml-2 block text-sm text-gray-700 cursor-pointer">Remember me</label>
      </div>
      <div class="text-sm">
        <a href="#" class="font-medium text-blue-600 hover:text-blue-500">Forgot your password?</a>
      </div>
    </div>

    <!-- Login Button -->
    <div>
      <button
        type="submit"
        :disabled="loading"
        class="relative w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] shadow-[0_4px_12px_rgba(59,130,246,0.25)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.35)]"
      >
        <svg
          v-if="loading"
          class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        {{ loading ? 'Signing in...' : 'Sign in' }}
      </button>
    </div>

    <!-- Sign Up Link -->
    <div class="text-center">
      <p class="text-sm text-gray-600">
        Don't have an account?
        <a href="#" class="font-medium text-blue-600 hover:text-blue-500">Sign up</a>
      </p>
    </div>
  </form>
</template> 