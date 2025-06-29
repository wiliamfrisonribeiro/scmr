<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { logout } from '@/services/auth/auth';
import AppBar from '@/components/AppBar.vue';
import ReadOnlyMap from '@/components/ReadOnlyMap.vue';
import InfoCards from '@/components/InfoCards.vue';
import EventCards from '@/components/EventCards.vue';
import { Button } from '@/components/ui/button';
import { fetchOcorrencias, fetchOcorrenciasAllUser, fetchOcorrenciasForAuthority } from '@/services/ocorrencias/ocorrencias.ts';
import Ocorrencias from '@/components/Ocorrencias.vue';
import { useUser } from '@/composables/useUser';

const router = useRouter();
const ocorrencias = ref([]);
const totalPages = ref(1);
const page = ref(1);
const pageSize = 5;
const loadingOcorrencias = ref(false);
const totalOcorrencias = ref(0);
const totalAnalisadas = ref(0);
const selectedStatus = ref('todos');
const selectedOcorrencia = ref(null); // Ocorrência selecionada para zoom

const statusOptions = [
  { value: 'todos', label: 'Todos' },
  { value: 'pendente', label: 'Pendente' },
  { value: 'análise', label: 'Em Análise' },
  { value: 'em_andamento', label: 'Em Andamento' },
  { value: 'concluído', label: 'Concluído' }
];

const { userAccountId, isAuthority } = useUser();

async function loadOcorrencias() {
  loadingOcorrencias.value = true;
  
  let response;
  if (isAuthority.value) {
    // Para usuários do tipo Autoridade, buscar todas as ocorrências
    response = await fetchOcorrenciasForAuthority(page.value, pageSize, selectedStatus.value);
  } else {
    // Para outros usuários, buscar apenas suas próprias ocorrências
    response = await fetchOcorrencias(page.value, pageSize, userAccountId.value, selectedStatus.value);
  }
  
  ocorrencias.value = response.data;
  console.log("ocorrencias", ocorrencias.value);
  totalPages.value = Math.max(1, Math.ceil((response.total || 0) / pageSize));
  loadingOcorrencias.value = false;
}

//onMounted(loadOcorrencias);

const nextPage = () => { if (page.value < totalPages.value) page.value++; };
const prevPage = () => { if (page.value > 1) page.value--; };

const handleRegister = () => {
  router.push('/criar-ocorrencia');
};

const handleLogout = () => {
  logout();
  router.push('/');
};

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleString('pt-BR');
};

const fetchOcorrenciasTotalOcorrencias = async () => {
  let response;
  
  if (isAuthority.value) {
    // Para usuários do tipo Autoridade, buscar todas as ocorrências
    response = await fetchOcorrenciasForAuthority(1, 10000, 'todos');
  } else {
    // Para outros usuários, buscar apenas suas próprias ocorrências
    response = await fetchOcorrenciasAllUser(userAccountId.value);
  }
  
  totalOcorrencias.value = response.total;

  const ocorrenciasAnalisadas = response.data.filter(ocorrencia => ocorrencia.ocurrency_status === 'análise');
  totalAnalisadas.value = ocorrenciasAnalisadas.length;
}

// Função para lidar com a seleção de ocorrência
const handleOcorrenciaSelected = (ocorrencia) => {
  selectedOcorrencia.value = ocorrencia;
  console.log('Ocorrência selecionada para zoom:', ocorrencia);
};

onMounted(() => {
  fetchOcorrenciasTotalOcorrencias();
  loadOcorrencias();
})

watch([page, selectedStatus], () => {
  page.value = 1; // Reset to first page when filter changes
  loadOcorrencias();
});

// Limpar ocorrência selecionada quando mudar de página ou filtro
watch([page, selectedStatus], () => {
  selectedOcorrencia.value = null;
});
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
              Este é o painel de controle do sistema. Aqui você pode visualizar informações importantes e gerenciar seus
              dados.
            </p>
            <div v-if="isAuthority" class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="text-blue-800 font-medium">Modo Autoridade</span>
              </div>
              <p class="text-blue-700 text-sm mt-1">Visualizando todas as ocorrências registradas no sistema.</p>
              <p class="text-blue-600 text-sm mt-2">Como autoridade, você pode visualizar e analisar ocorrências, mas não pode registrá-las.</p>
            </div>
            <Button v-if="!isAuthority" @click="handleRegister" class="bg-green-700 hover:bg-green-800 text-white">
              Nova Ocorrência
            </Button>
          </div>

          <div class="map-container">
            <!-- Indicador de ocorrência selecionada -->
            <div v-if="selectedOcorrencia" class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span class="text-blue-800 font-medium">Visualizando: {{ selectedOcorrencia.type }}</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  @click="selectedOcorrencia = null"
                  class="text-blue-600 hover:text-blue-800"
                >
                  Limpar Seleção
                </Button>
              </div>
            </div>
            
            <div v-if="loadingOcorrencias" class="flex justify-center items-center py-8">
              <svg class="animate-spin h-6 w-6 text-green-700 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                </path>
              </svg>
              <span class="text-green-700 font-medium">Carregando ocorrências...</span>
            </div>
            <div v-else-if="!ocorrencias || ocorrencias.length === 0" class="flex flex-col items-center justify-center py-8 bg-white rounded-lg shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-gray-600 text-lg font-medium">Nenhuma ocorrência encontrada</p>
              <p class="text-gray-500 text-sm mt-2">Tente alterar os filtros ou criar uma nova ocorrência</p>
            </div>
            <ReadOnlyMap v-else :ocorrencias="ocorrencias" :selectedOcorrencia="selectedOcorrencia" />
          </div>
        </div>
        <!-- Coluna lateral -->
        <div class="lg:w-1/3">
          <InfoCards :totalOcorrencias="totalOcorrencias" :totalAnalisadas="totalAnalisadas" />
          
          <!-- Filtro de Status -->
          <div class="bg-white rounded-lg shadow-md p-4 mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Filtrar por Status</label>
            <select 
              v-model="selectedStatus"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
            >
              <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>

          <div class="flex justify-end gap-2 mb-2">
            <button class="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300" @click="prevPage">
              Anterior
            </button>
            <span class="px-2 py-1 text-sm">Página {{ page }} de {{ totalPages }}</span>
            <button class="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300" @click="nextPage">
              Próximo
            </button>
          </div>
          <Ocorrencias 
            :ocorrencias="ocorrencias" 
            :loadOcorrencias="loadOcorrencias"
            :loadingOcorrencias="loadingOcorrencias" 
            :selectedOcorrencia="selectedOcorrencia"
            @ocorrencia-selected="handleOcorrenciaSelected"
          />
        </div>
      </div>
    </main>
  </div>
</template>