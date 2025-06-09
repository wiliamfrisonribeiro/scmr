<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { MapPin, Users, Calendar, AlertTriangle, BarChart2, FileText } from 'lucide-vue-next';
const props = defineProps<{
  ocorrencias: any[];
}>();
// Dados simulados para os cards
const infoCards = ref([])
onMounted(() => {
  console.log("ocorrencias",   props.ocorrencias.length) 

  debugger
  infoCards.value = [
    {
      id:1,
      title: 'Ocorrências Registradas',
      value: props.ocorrencias.length,
      icon: MapPin,
      color: 'bg-green-700'
    },

    {
      id:2   ,
      title: 'Análises',
      value: props.ocorrencias.length,
      icon: MapPin,
      color: 'bg-green-700'
    }
  ]
})

console.log("ocorrencias",   props.ocorrencias.length)



</script>

<template>
  <div class="info-cards">
    <h2 class="text-xl font-bold mb-4 text-gray-800">Informações do Sistema</h2>
    <div class="flex flex-row gap-4">
      <div v-for="card in infoCards" :key="card.id" class="bg-white rounded-lg shadow-md p-4 flex items-center flex-1">
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
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  padding: 1rem;
}

.flex {
  display: flex;
  flex-direction: row;
  gap: 1.5rem;
}

.bg-white {
  padding: 1.5rem;
  transition: all 0.3s ease;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  flex: 1;
}

.bg-white:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.text-2xl {
  font-size: 2rem;
  font-weight: 700;
}

.text-sm {
  font-size: 1rem;
  color: #4a5568;
}
</style>

<script lang="ts">
export default {
  name: 'InfoCards'
};
</script> 