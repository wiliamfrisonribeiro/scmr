<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { AlertCircle, Clock, CheckCircle, XCircle, Pencil, Trash2, Eye, MapPin } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import { useUser } from '@/composables/useUser';

const props = defineProps({
  ocorrencias: { type: Array, default: () => [] },
  loadOcorrencias: { type: Function, default: null },
  loadingOcorrencias: { type: Boolean, default: false },
  selectedOcorrencia: { type: Object, default: null }
});

const emit = defineEmits(['ocorrencia-selected']);

const router = useRouter();
const { isAuthority } = useUser();
const localOcorrencias = ref([])

const loading = ref(props.loadingOcorrencias)

console.log("ocorrencias", props.ocorrencias)

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleString('pt-BR');
};

const statusColor = (status) => {
  const map = {
    pendente: 'bg-yellow-100 text-yellow-800',
    em_andamento: 'bg-blue-100 text-blue-800',
    concluido: 'bg-green-100 text-green-800',
    cancelado: 'bg-red-100 text-red-800',
  };
  return map[status] || 'bg-gray-100 text-gray-800';
};

const getStatusIcon = (status) => {
  const icons = {
    pendente: AlertCircle,
    em_andamento: Clock,
    concluido: CheckCircle,
    cancelado: XCircle
  };
  return icons[status];
};

const handleEdit = (ocorrencia) => {
  if (isAuthority.value) {
    // Para autoridades, ir para a página de análise
    router.push(`/analisar-ocorrencia/${ocorrencia.id}`);
  } else {
    // Para usuários normais, ir para a página de edição
    router.push(`/editar-ocorrencia/${ocorrencia.id}`);
  }
};

const handleDelete = async (ocorrencia) => {
  if (!confirm('Tem certeza que deseja deletar esta ocorrência?')) return;
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Usuário não autenticado!');
    return;
  }
  const myHeaders = new Headers();
  myHeaders.append("Authorization", `Bearer ${token}`);

  const requestOptions = {
    method: "DELETE",
    headers: myHeaders,
    redirect: "follow"
  };

  try {
    const response = await fetch(`https://smrc.onrender.com/ocurrencies/${ocorrencia.id}`, requestOptions);
    if (response.ok) {
      if (props.loadOcorrencias) props.loadOcorrencias();
      alert('Ocorrência deletada com sucesso!');
    } else {
      alert('Erro ao deletar ocorrência.');
    }
  } catch (error) {
    alert('Erro ao deletar ocorrência.');
    console.error(error);
  }
};

// Função para selecionar uma ocorrência (para zoom no mapa)
const handleOcorrenciaSelect = (ocorrencia) => {
  emit('ocorrencia-selected', ocorrencia);
};

watch(
  () => props.ocorrencias,
  (newVal) => {
    localOcorrencias.value = newVal;
  },
  { immediate: true }
);

console.log("localOcorrencias", localOcorrencias.value)
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-bold text-green-800">
        {{ isAuthority ? 'Todas as Ocorrências' : 'Ocorrências Registradas' }}
      </h2>
    </div>
    
    <!-- Instrução para o usuário -->
    <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
      <div class="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="text-blue-800 text-sm">
          <strong>Dica:</strong> Clique em qualquer ocorrência para localizá-la no mapa
        </span>
      </div>
    </div>
    <div v-if="props.loadingOcorrencias" class="flex justify-center items-center py-8">
      <svg class="animate-spin h-6 w-6 text-green-700 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span class="text-green-700 font-medium">Carregando ocorrências...</span>
    </div>
    <div v-else>
    <div class="grid grid-cols-1 gap-4">
      <div
        v-for="ocorrencia in localOcorrencias"
        :key="ocorrencia.id"
        class="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow relative cursor-pointer"
        :class="{
          'border-l-4 border-blue-500 bg-blue-50': selectedOcorrencia && selectedOcorrencia.id === ocorrencia.id,
          'border border-gray-200': !selectedOcorrencia || selectedOcorrencia.id !== ocorrencia.id
        }"
        @click="handleOcorrenciaSelect(ocorrencia)"
      >
        <div class="absolute top-2 right-2 flex gap-2">
          <button @click.stop="handleEdit(ocorrencia)" class="p-1 rounded hover:bg-green-100" :title="isAuthority ? 'Analisar' : 'Editar'">
            <component :is="isAuthority ? Eye : Pencil" class="h-5 w-5" :class="isAuthority ? 'text-blue-700' : 'text-green-700'" />
          </button>
          <button v-if="!isAuthority" @click.stop="handleDelete(ocorrencia)" class="p-1 rounded hover:bg-red-100" title="Deletar">
            <Trash2 class="h-5 w-5 text-red-600" />
          </button>
        </div>
        <div class="flex items-start gap-3">
          <div class="flex-1">
            <h3 class="text-lg font-medium text-gray-800 mb-1">{{ ocorrencia.type }}</h3>
            <div class="text-xs text-gray-500 flex items-center gap-1 mb-1">
              <span class="font-semibold">Criado em:</span> {{ formatDate(ocorrencia.created_date) }}
            </div>
            <div class="flex items-center gap-2 mt-2">
              <span class="font-semibold text-xs">Status:</span>
              <span :class="'px-2 py-1 rounded-full text-xs font-semibold ' + statusColor(ocorrencia.ocurrency_status)">
                {{ ocorrencia.ocurrency_status }}
              </span>
            </div>
          </div>
          <div class="flex items-center pr-8 text-blue-600 hover:text-blue-800" title="Clique para localizar no mapa">
            <MapPin class="h-4 w-4" />
            <span class="text-xs"></span>
          </div>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>