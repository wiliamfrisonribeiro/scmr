<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { AlertCircle, Clock, CheckCircle, XCircle, Pencil, Trash2 } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
const props = defineProps({
  ocorrencias: { type: Array, default: () => [] },
  loadOcorrencias: { type: Function, default: null },
  loadingOcorrencias: { type: Boolean, default: false }
});
const router = useRouter();
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

  router.push(`/editar-ocorrencia/${ocorrencia.id}`);

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
      <h2 class="text-xl font-bold text-green-800">Ocorrências Registradas</h2>
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
        class="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow relative"
      >
        <div class="absolute top-2 right-2 flex gap-2">
          <button @click="handleEdit(ocorrencia)" class="p-1 rounded hover:bg-green-100" title="Editar">
            <Pencil class="h-5 w-5 text-green-700" />
          </button>
          <button @click="handleDelete(ocorrencia)" class="p-1 rounded hover:bg-red-100" title="Deletar">
            <Trash2 class="h-5 w-5 text-red-600" />
          </button>
        </div>
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
    </div>
    </div>
  </div>
</template>