<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowLeft, MapPin, Shapes, Trash2 } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import ReadOnlyMap from '@/components/ReadOnlyMap.vue';
import { fetchOcorrenciaById } from '@/services/ocorrencias/ocorrencias.ts';

interface Ponto {
  id: number;
  latitude: number;
  longitude: number;
  descricao: string;
}

interface Poligono {
  id: number;
  vertices: { latitude: number; longitude: number }[];
  descricao: string;
}

interface Evento {
  id: number;
  tipo: string;
  status: 'pendente' | 'em_andamento' | 'concluido' | 'cancelado';
  dataInicio: string;
  dataFim: string;
  pontos: Ponto[];
  poligonos: Poligono[];
}

const route = useRoute();
const router = useRouter();
const evento = ref<Evento | null>(null);
const loading = ref(true);
const erro = ref('');

// Observador para o status do evento
const observarStatus = () => {
  if (evento.value) {
    // Se o status não for "concluido", limpa a data de fim
    if (evento.value.status !== 'concluido') {
      evento.value.dataFim = '';
    } else if (!evento.value.dataFim) {
      // Se o status for "concluido" e não tiver data de fim, define para hoje
      evento.value.dataFim = new Date().toISOString().split('T')[0];
    }
  }
};

// Funções para manipular pontos e polígonos
const handlePontoAdicionado = (ponto: Ponto) => {
  if (evento.value) {
    evento.value.pontos.push(ponto);
  }
};

const handlePoligonoAdicionado = (poligono: Poligono) => {
  if (evento.value) {
    evento.value.poligonos.push(poligono);
  }
};

const handlePontoRemovido = (id: number) => {
  if (evento.value) {
    evento.value.pontos = evento.value.pontos.filter(p => p.id !== id);
  }
};

const handlePoligonoRemovido = (id: number) => {
  if (evento.value) {
    evento.value.poligonos = evento.value.poligonos.filter(p => p.id !== id);
  }
};

const salvarAlteracoes = () => {
  // TODO: Implementar a lógica de salvamento
  console.log('Salvando alterações:', evento.value);
  router.push('/dashboard');
};

const voltar = () => {
  router.push('/dashboard');
};

onMounted(async () => {
  loading.value = true;
  try {
    const id = route.params.id;
    const data = await fetchOcorrenciaById(id);
    if (data) {
      evento.value = {
        ...evento.value,
        ...data
      };
    } else {
      erro.value = 'Ocorrência não encontrada.';
    }
  } catch (e) {
    erro.value = 'Erro ao buscar ocorrência.';
  }
  // Observa mudanças no status
  watch(() => evento.value?.status, () => {
    observarStatus();
  });
  loading.value = false;
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <Button 
              variant="ghost" 
              class="mr-4"
              @click="voltar"
            >
              <ArrowLeft class="h-5 w-5" />
            </Button>
            <h1 class="text-2xl font-bold text-gray-900">
              Editar Ocorrência
            </h1>
          </div>
          <Button 
            class="bg-green-700 hover:bg-green-800 text-white"
            @click="salvarAlteracoes"
          >
            Salvar Alterações
          </Button>
        </div>
      </div>
    </header>

    <!-- Conteúdo Principal -->
    <main class="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <div v-if="loading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
      </div>

      <div v-else-if="evento" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Formulário -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Informações da Ocorrência</h2>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <input 
                  v-model="evento.tipo" 
                  type="text" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-700"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  v-model="evento.status" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-700"
                >
                  <option value="pendente">Pendente</option>
                  <option value="em_andamento">Em Andamento</option>
                  <option value="concluido">Concluído</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Data de Início</label>
                <input 
                  v-model="evento.dataInicio" 
                  type="date" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-700"
                />
              </div>
              
              <div v-if="evento.status === 'concluido'">
                <label class="block text-sm font-medium text-gray-700 mb-1">Data de Conclusão</label>
                <input 
                  v-model="evento.dataFim" 
                  type="date" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-700"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Mapa e Elementos Geográficos -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Localização</h2>
            
            <div class="h-[500px] rounded-lg overflow-hidden mb-6">
              <ReadOnlyMap :ocorrencias="[evento.value]" v-if="evento.value" />
            </div>

            <!-- Lista de Pontos -->
            <div v-if="evento.pontos.length > 0" class="mb-6">
              <h3 class="text-sm font-medium text-gray-700 mb-2">Pontos Registrados</h3>
              <div class="space-y-2">
                <div 
                  v-for="ponto in evento.pontos" 
                  :key="ponto.id"
                  class="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                >
                  <div class="flex items-center gap-2">
                    <MapPin class="h-4 w-4 text-green-600" />
                    <span class="text-sm">{{ ponto.descricao || `Ponto ${ponto.id}` }}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    class="text-red-500 hover:text-red-700"
                    @click="handlePontoRemovido(ponto.id)"
                  >
                    <Trash2 class="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <!-- Lista de Polígonos -->
            <div v-if="evento.poligonos.length > 0">
              <h3 class="text-sm font-medium text-gray-700 mb-2">Polígonos Registrados</h3>
              <div class="space-y-2">
                <div 
                  v-for="poligono in evento.poligonos" 
                  :key="poligono.id"
                  class="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                >
                  <div class="flex items-center gap-2">
                    <Shapes class="h-4 w-4 text-green-600" />
                    <span class="text-sm">{{ poligono.descricao || `Polígono ${poligono.id}` }}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    class="text-red-500 hover:text-red-700"
                    @click="handlePoligonoRemovido(poligono.id)"
                  >
                    <Trash2 class="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template> 