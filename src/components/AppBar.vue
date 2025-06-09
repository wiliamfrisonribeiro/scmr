<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { Settings, LogOut, User } from 'lucide-vue-next';
import { getCurrentUser, logout } from '@/services/auth/auth';
import type { User as UserType } from '@/types/user';

const router = useRouter();
const user = ref<UserType | null>(null);
const showUserMenu = ref(false);

onMounted(() => {
  user.value = getCurrentUser();
  console.log(user);

  
});

const handleLogout = () => {
  logout();
  router.push('/login');
};

const handleSettings = () => {
  console.log('Settings clicked');
};

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
};

// Fechar o menu quando clicar fora
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!target.closest('.user-menu')) {
    showUserMenu.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
  <header class="bg-white shadow-md">
    <div class="container mx-auto px-4 py-4">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-bold text-green-800">SCMR</h1>
        
        <div class="flex items-center gap-4">
          <!-- Menu do usuário -->
          <div class="relative user-menu">
            <button
              @click="toggleUserMenu"
              class="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-green-700 rounded-md hover:bg-green-50 transition-colors"
            >
              <User class="h-5 w-5" />
              <span class="font-medium">{{ user?.name || 'Usuário' }}</span>
            </button>

            <!-- Dropdown menu -->
            <div
              v-if="showUserMenu"
              class="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-1 z-50"
            >
              <div class="px-4 py-2 border-b border-gray-100">
                <p class="text-sm font-medium text-gray-900">{{ user?.name }}</p>
                <p class="text-sm text-gray-500">{{ user?.email }}</p>
                <p class="text-xs text-gray-400 mt-1">
                  {{ user?.account_group?.name || 'Usuário ' }}
                </p>
              </div>

              <button
                @click="handleSettings"
                class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 flex items-center gap-2"
              >
                <Settings class="h-4 w-4" />
                Configurações
              </button>

              <button
                @click="handleLogout"
                class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <LogOut class="h-4 w-4" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script lang="ts">
export default {
  name: 'AppBar'
};
</script>

<style scoped>
.user-menu {
  position: relative;
}
</style> 