<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Calendar, Clock, AlertCircle, CheckCircle, XCircle, Edit, Trash2, MapPin, Shapes } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import InteractiveMap from './InteractiveMap.vue';

const props = defineProps<{
  ocorrencias: any[];
}>();


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

const router = useRouter();

const eventos = ref<Evento[]>([
  {
    id: 1,
    tipo: 'Roubo de propriedade',
    status: 'pendente',
    dataInicio: '2024-03-25',
    dataFim: '2024-03-26',
    pontos: [],
    poligonos: []
  },
  {
    id: 2,
    tipo: 'Alagamento',
    status: 'em_andamento',
    dataInicio: '2024-03-20',
    dataFim: '2024-03-22',
    pontos: [],
    poligonos: []
  },
  {
    id: 3,
    tipo: 'Animais silvestres invasores',
    status: 'concluido',
    dataInicio: '2024-03-15',
    dataFim: '2024-03-16',
    pontos: [],
    poligonos: []
  },

]);


console.log("ocorrencias",   props.ocorrencias)

// Estado para controlar o modal de edição
const showEditModal = ref(false);
const eventoParaEditar = ref<Evento | null>(null);
const eventoEditado = ref<Evento | null>(null);
const showMap = ref(false);

const getStatusColor = (status: Evento['status']) => {
  const colors = {
    pendente: 'text-green-600 bg-green-50',
    em_andamento: 'text-green-700 bg-green-100',
    concluido: 'text-green-800 bg-green-200',
    cancelado: 'text-red-500 bg-red-50'
  };
  return colors[status];
};

const getStatusIcon = (status: Evento['status']) => {
  const icons = {
    pendente: AlertCircle,
    em_andamento: Clock,
    concluido: CheckCircle,
    cancelado: XCircle
  };
  return icons[status];
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('pt-BR');
};

// Função para abrir o modal de edição
const abrirModalEdicao = (evento?: Evento) => {
  if (evento) {
    eventoParaEditar.value = evento;
    eventoEditado.value = { ...evento };
  } else {
    eventoParaEditar.value = null;
    eventoEditado.value = {
      id: Date.now(),
      tipo: '',
      status: 'pendente',
      dataInicio: new Date().toISOString().split('T')[0],
      dataFim: '',
      pontos: [],
      poligonos: []
    };
  }
  showEditModal.value = true;
};

// Função para fechar o modal de edição
const fecharModalEdicao = () => {
  showEditModal.value = false;
  showMap.value = false;
  eventoParaEditar.value = null;
  eventoEditado.value = null;
};

// Função para alternar a visualização do mapa
const toggleMap = () => {
  showMap.value = !showMap.value;
};

// Funções para manipular pontos e polígonos
const handlePontoAdicionado = (ponto: Ponto) => {
  if (eventoEditado.value) {
    eventoEditado.value.pontos.push(ponto);
  }
};

const handlePoligonoAdicionado = (poligono: Poligono) => {
  if (eventoEditado.value) {
    eventoEditado.value.poligonos.push(poligono);
  }
};

const handlePontoRemovido = (id: number) => {
  if (eventoEditado.value) {
    eventoEditado.value.pontos = eventoEditado.value.pontos.filter(p => p.id !== id);
  }
};

const handlePoligonoRemovido = (id: number) => {
  if (eventoEditado.value) {
    eventoEditado.value.poligonos = eventoEditado.value.poligonos.filter(p => p.id !== id);
  }
};

// Função para salvar as alterações
const salvarEdicao = () => {
  if (!eventoEditado.value) return;
  
  if (eventoParaEditar.value) {
    // Atualizar evento existente
    const index = eventos.value.findIndex(e => e.id === eventoParaEditar.value?.id);
    if (index !== -1) {
      eventos.value[index] = { ...eventoEditado.value };
    }
  } else {
    // Adicionar novo evento
    eventos.value.push({ ...eventoEditado.value });
  }
  
  fecharModalEdicao();
};

// Função para excluir um evento
const excluirEvento = (evento: Evento) => {
  if (confirm('Tem certeza que deseja excluir este registro?')) {
    const index = eventos.value.findIndex(e => e.id === evento.id);
    if (index !== -1) {
      eventos.value.splice(index, 1);
    }
  }
};

// Função para adicionar um novo evento
const adicionarNovoEvento = () => {
  const novoId = Math.max(...eventos.value.map(e => e.id), 0) + 1;
  const novoEvento: Evento = {
    id: novoId,
    tipo: 'Novo Evento',
    status: 'pendente',
    dataInicio: new Date().toISOString().split('T')[0],
    dataFim: new Date().toISOString().split('T')[0],
    pontos: [],
    poligonos: []
  };
  
  eventoParaEditar.value = novoEvento;
  eventoEditado.value = { ...novoEvento };
  showEditModal.value = true;
};

// Função para abrir a página de edição
const abrirEdicao = (evento: Evento) => {
  router.push(`/editar-ocorrencia/${evento.id}`);
};
</script>

<template>
  <div class="event-cards">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-bold text-green-800">Ocorrências Registradas</h2>

    </div>
    
    <div class="grid grid-cols-1 gap-4">
      <div
        v-for="evento in props.ocorrencias"
        :key="evento.id"
        class="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
      >
        <div class="flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-800">{{ evento.tipo }}</h3>
            <div
              class="px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1"
              :class="getStatusColor(evento.status)"
            >
              <component :is="getStatusIcon(evento.status)" class="h-4 w-4" />
              {{ evento.status.replace('_', ' ').charAt(0).toUpperCase() + evento.status.slice(1).replace('_', ' ') }}
            </div>
          </div>
          
          <div class="flex items-center gap-4 text-sm text-gray-600">
            <div class="flex items-center gap-1">
              <Calendar class="h-4 w-4" />
              <span>Início: {{ formatDate(evento.created_at) }}</span>
            </div>
            <div v-if="evento.status === 'concluido' && evento.dataFim" class="flex items-center gap-1">
              <Calendar class="h-4 w-4" />
              <span>Conclusão: {{ formatDate(evento.updated_at) }}</span>
            </div>
          </div>
          
          <div class="flex justify-end gap-2 mt-2">
            <Button 
              variant="ghost" 
              size="sm" 
              class="text-green-700 hover:text-green-800 hover:bg-green-50"
              @click="abrirEdicao(evento)"
            >
              <Edit class="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              class="text-red-500 hover:text-red-700 hover:bg-red-50"
              @click="excluirEvento(evento)"
            >
              <Trash2 class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal de Edição -->
    <div v-if="showEditModal && eventoEditado" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl">
        <h3 class="text-xl font-bold text-green-800 mb-4">
          {{ eventoParaEditar?.id ? 'Editar Registro' : 'Novo Registro' }}
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Formulário de dados -->
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <input 
                v-model="eventoEditado.tipo" 
                type="text" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-700"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select 
                v-model="eventoEditado.status" 
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
                v-model="eventoEditado.dataInicio" 
                type="date" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-700"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Data de Fim</label>
              <input 
                v-model="eventoEditado.dataFim" 
                type="date" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-700"
              />
            </div>
          </div>

          <!-- Mapa e Elementos Geográficos -->
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <h4 class="text-lg font-medium text-gray-800">Localização</h4>
              <Button 
                variant="outline" 
                size="sm"
                @click="toggleMap"
              >
                {{ showMap ? 'Ocultar Mapa' : 'Mostrar Mapa' }}
              </Button>
            </div>

            <div v-if="showMap" class="h-[400px] rounded-lg overflow-hidden">
              <InteractiveMap 
                :pontos="eventoEditado.pontos"
                :poligonos="eventoEditado.poligonos"
                @ponto-adicionado="handlePontoAdicionado"
                @poligono-adicionado="handlePoligonoAdicionado"
                @ponto-removido="handlePontoRemovido"
                @poligono-removido="handlePoligonoRemovido"
              />
            </div>

            <!-- Lista de Pontos -->
            <div v-if="eventoEditado.pontos.length > 0" class="mt-4">
              <h5 class="text-sm font-medium text-gray-700 mb-2">Pontos Registrados</h5>
              <div class="space-y-2">
                <div 
                  v-for="ponto in eventoEditado.pontos" 
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
                    @click="eventoEditado.pontos = eventoEditado.pontos.filter(p => p.id !== ponto.id)"
                  >
                    <Trash2 class="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <!-- Lista de Polígonos -->
            <div v-if="eventoEditado.poligonos.length > 0" class="mt-4">
              <h5 class="text-sm font-medium text-gray-700 mb-2">Polígonos Registrados</h5>
              <div class="space-y-2">
                <div 
                  v-for="poligono in eventoEditado.poligonos" 
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
                    @click="eventoEditado.poligonos = eventoEditado.poligonos.filter(p => p.id !== poligono.id)"
                  >
                    <Trash2 class="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex justify-end gap-2 mt-6">
          <Button 
            variant="outline" 
            @click="fecharModalEdicao"
          >
            Cancelar
          </Button>
          <Button 
            class="bg-green-700 hover:bg-green-800 text-white"
            @click="salvarEdicao"
          >
            Salvar
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.event-cards {
  margin-top: 2rem;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.grid {
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
}

.bg-white {
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.bg-white:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
</style>

<script lang="ts">
export default {
  name: 'EventCards'
};
</script> 