<script setup lang="ts">
import { ref } from 'vue';
import { MapPin, Users, Calendar, AlertTriangle, BarChart2, FileText } from 'lucide-vue-next';

// Dados simulados para os cards
const infoCards = ref([
  {
    id: 1,
    title: 'Locais Registrados',
    value: '24',
    icon: MapPin,
    color: 'bg-green-700'
  },
 

  {
    id: 2,
    title: 'Alertas',
    value: '3',
    icon: AlertTriangle,
    color: 'bg-green-600'
  },

  {
    id: 3,
    title: 'Análises',
    value: '7',
    icon: BarChart2,
    color: 'bg-green-800'
  }
]);
</script>

<template>
  <div class="info-cards">
    <h2 class="text-xl font-bold mb-4 text-gray-800">Informações do Sistema</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="card in infoCards" :key="card.id" class="bg-white rounded-lg shadow-md p-4 flex items-center">
        <div :class="[card.color, 'p-3 rounded-full text-white']">
          <component :is="card.icon" class="h-6 w-6" />
        </div>
        <div class="ml-4">
          <h3 class="text-sm font-medium text-gray-500">{{ card.title }}</h3>
          <p class="text-2xl font-bold text-gray-800">{{ card.value }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.info-cards {
  margin-top: 1.5rem;
}
</style>

<script lang="ts">
export default {
  name: 'InfoCards'
};
</script> 