<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '@/services/auth'
import { Button } from '@/components/ui/button'

const router = useRouter()
const email = ref('')
const password = ref('')
const loading = ref(false)

const handleLogin = async () => {
  loading.value = true
  // Simulando uma chamada de API
  setTimeout(() => {
    loading.value = false
    router.push('/')
  }, 1000)
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-4">
    <div class="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
      <div class="bg-green-600 p-6 text-center">
        <h1 class="text-2xl font-bold text-white">Login</h1>
      </div>
      
      <div class="p-6">
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="seu@email.com"
            />
          </div>
          
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>
          
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input 
                id="remember" 
                type="checkbox" 
                class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label for="remember" class="ml-2 block text-sm text-gray-700">Lembrar-me</label>
            </div>

            <a href="#" class="text-sm font-medium text-green-600 hover:text-green-500">
              Esqueceu a senha?
            </a>
          </div>

          <Button
            type="submit"
            class="w-full bg-green-600 hover:bg-green-700 text-white" 
            :disabled="loading"
          >
            {{ loading ? 'Entrando...' : 'Entrar' }}
          </Button>
        </form>
        
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            Não tem uma conta? 
            <a href="#" class="font-medium text-green-600 hover:text-green-500">
              Registre-se
            </a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template> 