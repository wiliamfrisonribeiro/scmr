<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Settings, LogOut } from 'lucide-vue-next';

const router = useRouter();
const userName = ref('João Silva');

const handleLogout = () => {
  router.push('/login');
};

const handleSettings = () => {
  console.log('Settings clicked');
};
</script>

<template>
  <header class="bg-white shadow-md">
    <div class="container mx-auto px-4 py-4">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-bold text-green-800">SCMR</h1>
        
        <div class="flex items-center gap-4">
          <span class="text-gray-600">{{ userName }}</span>
          
          <button
            @click="handleSettings"
            class="p-2 text-gray-600 hover:text-green-700 rounded-full hover:bg-green-50"
          >
            <Settings class="h-5 w-5" />
          </button>
          
          <button
            @click="handleLogout"
            class="p-2 text-gray-600 hover:text-green-700 rounded-full hover:bg-green-50"
          >
            <LogOut class="h-5 w-5" />
          </button>
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