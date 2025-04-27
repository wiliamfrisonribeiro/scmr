<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import AppBar from '@/components/AppBar.vue';
import InteractiveMap from '@/components/InteractiveMap.vue';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Shapes, Trash2 } from 'lucide-vue-next';

const router = useRouter();
const titulo = ref('');
const descricao = ref('');
const pontos = ref<{ x: number; y: number; descricao: string }[]>([]);
const poligonos = ref<{ rings: number[][][]; descricao: string }[]>([]);
const mapRef = ref<InstanceType<typeof InteractiveMap> | null>(null);

const handlePointAdded = (point: { x: number; y: number }) => {
  pontos.value.push({
    ...point,
    descricao: `Ponto ${pontos.value.length + 1}`
  });
};

const handlePolygonAdded = (polygon: { rings: number[][][] }) => {
  poligonos.value.push({
    ...polygon,
    descricao: `Polígono ${poligonos.value.length + 1}`
  });
};

const handleVoltar = () => {
  router.push('/dashboard');
};

const handleSalvar = () => {
  // Aqui você implementaria a lógica para salvar a ocorrência
  console.log('Salvando ocorrência:', {
    titulo: titulo.value,
    descricao: descricao.value,
    pontos: pontos.value,
    poligonos: poligonos.value
  });
  
  // Limpar os pontos do mapa
  if (mapRef.value) {
    (mapRef.value as any).clearPoints();
  }
  
  // Redirecionar para o dashboard
  router.push('/dashboard');
};

const updatePontoDescricao = (index: number, event: Event) => {
  const target = event.target as HTMLInputElement;
  pontos.value[index].descricao = target.value;
};

const updatePoligonoDescricao = (index: number, event: Event) => {
  const target = event.target as HTMLInputElement;
  poligonos.value[index].descricao = target.value;
};

const removePonto = (index: number) => {
  pontos.value.splice(index, 1);
};

const removePoligono = (index: number) => {
  poligonos.value.splice(index, 1);
};
</script>

<template>
  <div class="criar-ocorrencia-container">
    <AppBar />
    
    <main class="container mx-auto px-4 py-6">
      <div class="flex items-center mb-6">
        <Button @click="handleVoltar" variant="ghost" class="mr-2">
          <ArrowLeft class="h-4 w-4 mr-1" />
          Voltar
        </Button>
        <h1 class="text-2xl font-bold text-green-800">Criar Nova Ocorrência</h1>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Formulário -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-bold mb-4 text-green-800">Informações da Ocorrência</h2>
          
          <div class="mb-4">
            <label for="titulo" class="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input
              id="titulo"
              v-model="titulo"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-700"
              placeholder="Digite o título da ocorrência"
            />
          </div>
          
          <div class="mb-6">
            <label for="descricao" class="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea
              id="descricao"
              v-model="descricao"
              rows="4"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-700"
              placeholder="Digite a descrição da ocorrência"
            ></textarea>
          </div>
          
          <div class="mb-4">
            <h3 class="text-sm font-medium text-gray-700 mb-2">Elementos Adicionados:</h3>
            <div class="space-y-4">
              <!-- Pontos -->
              <div v-if="pontos.length > 0">
                <h4 class="text-sm font-medium text-gray-600 flex items-center">
                  <MapPin class="h-4 w-4 mr-1" />
                  Pontos ({{ pontos.length }})
                </h4>
                <div class="max-h-60 overflow-y-auto border border-gray-200 rounded-md p-2">
                  <ul class="text-sm space-y-2">
                    <li v-for="(ponto, index) in pontos" :key="'ponto-'+index" class="p-2 border border-gray-100 rounded-md hover:bg-green-50">
                      <div class="flex justify-between items-start">
                        <div class="flex-1">
                          <input 
                            type="text" 
                            v-model="ponto.descricao" 
                            class="w-full px-2 py-1 border border-gray-300 rounded-md text-sm mb-1"
                            @input="(e) => updatePontoDescricao(index, e)"
                          />
                          <p class="text-xs text-gray-500">
                            Coordenadas: {{ ponto.x.toFixed(6) }}, {{ ponto.y.toFixed(6) }}
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          class="text-red-500 hover:text-red-700 hover:bg-red-50"
                          @click="removePonto(index)"
                        >
                          <Trash2 class="h-4 w-4" />
                        </Button>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
              
              <!-- Polígonos -->
              <div v-if="poligonos.length > 0">
                <h4 class="text-sm font-medium text-gray-600 flex items-center">
                  <Shapes class="h-4 w-4 mr-1" />
                  Polígonos ({{ poligonos.length }})
                </h4>
                <div class="max-h-60 overflow-y-auto border border-gray-200 rounded-md p-2">
                  <ul class="text-sm space-y-2">
                    <li v-for="(poligono, index) in poligonos" :key="'poligono-'+index" class="p-2 border border-gray-100 rounded-md hover:bg-green-50">
                      <div class="flex justify-between items-start">
                        <div class="flex-1">
                          <input 
                            type="text" 
                            v-model="poligono.descricao" 
                            class="w-full px-2 py-1 border border-gray-300 rounded-md text-sm mb-1"
                            @input="(e) => updatePoligonoDescricao(index, e)"
                          />
                          <p class="text-xs text-gray-500">
                            {{ poligono.rings[0].length }} vértices
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          class="text-red-500 hover:text-red-700 hover:bg-red-50"
                          @click="removePoligono(index)"
                        >
                          <Trash2 class="h-4 w-4" />
                        </Button>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
              
              <p v-if="pontos.length === 0 && poligonos.length === 0" class="text-sm text-gray-500">
                Nenhum elemento adicionado ainda. Use o mapa para adicionar pontos ou polígonos.
              </p>
            </div>
          </div>
          
          <Button @click="handleSalvar" class="w-full bg-green-700 hover:bg-green-800 text-white">
            Salvar Ocorrência
          </Button>
        </div>
        
        <!-- Mapa -->
        <div>
          <InteractiveMap 
            ref="mapRef"
            @point-added="handlePointAdded"
            @polygon-added="handlePolygonAdded"
          />
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.criar-ocorrencia-container {
  min-height: 100vh;
  background-color: #f0fdf4;
}
</style> 