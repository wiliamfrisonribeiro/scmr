<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import AppBar from '@/components/AppBar.vue';
import ReadOnlyMap from '@/components/ReadOnlyMap.vue';
import InfoCards from '@/components/InfoCards.vue';
import EventCards from '@/components/EventCards.vue';
import { Button } from '@/components/ui/button';

const router = useRouter();


const handleRegister = () => {
  router.push('/criar-ocorrencia');
};

const handleLogout = () => {
  logout();
  router.push('/');
};
</script>

<template>
  <div class="dashboard-container">
    <AppBar />
    
    <main class="container mx-auto px-4 py-6">
      <div class="flex flex-col lg:flex-row gap-6">
        <!-- Coluna principal -->
        <div class="lg:w-2/3">
          <div class="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 class="text-xl font-bold mb-4 text-green-800">Bem-vindo ao Dashboard</h2>
            <p class="text-gray-600 mb-4">
              Este é o painel de controle do sistema. Aqui você pode visualizar informações importantes e gerenciar seus dados.
            </p>
            <Button @click="handleRegister" class="bg-green-700 hover:bg-green-800 text-white">
              <Plus class="h-4 w-4 mr-2" />
              Nova Ocorrência
            </Button>
          </div>
          
          <ReadOnlyMap />
        </div>
        
        <!-- Coluna lateral -->
        <div class="lg:w-1/3">
          <InfoCards />
          <EventCards />
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background-color: #f0fdf4;
}
</style> 