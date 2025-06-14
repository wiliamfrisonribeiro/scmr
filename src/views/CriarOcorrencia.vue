<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AppBar from '@/components/AppBar.vue';
import InteractiveMap from '@/components/InteractiveMap.vue';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Shapes, Trash2, Upload } from 'lucide-vue-next';
import { useUser } from '@/composables/useUser';
import ValidationModal from '@/components/ValidationModal.vue';

const router = useRouter();
const { userAccountId } = useUser();
const token = ref('');
const titulo = ref('');
const descricao = ref('');
const tipo = ref('');
const tipoOutro = ref('');
const imagem = ref<File | null>(null);
const imagemPreview = ref<string | null>(null);
const pontos = ref<{ x: number; y: number; descricao: string }[]>([]);
const poligonos = ref<{ rings: number[][][]; descricao: string }[]>([]);
const mapRef = ref<InstanceType<typeof InteractiveMap> | null>(null);
const geometry = ref<any>(null);
const isLoading = ref(false);
const submitted = ref(false);
const showValidationModal = ref(false);
const validationErrors = ref<string[]>([]);

onMounted(() => {
  const storedToken = localStorage.getItem('token');
  if (storedToken) {
    token.value = storedToken;
  } else {
    router.push('/login');
  }
});

const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;      
  if (target.files && target.files[0]) {
    imagem.value = target.files[0];
    // Criar preview da imagem
    const reader = new FileReader();
    reader.onload = (e) => {
      imagemPreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(target.files[0]);
  }
};

const removeImage = () => {
  imagem.value = null;
  imagemPreview.value = null;
};

const handleVoltar = () => {
  router.push('/dashboard');
};

const handleSalvar = async () => {
  try {
    submitted.value = true;
    validationErrors.value = [];
    
    // Validação dos campos obrigatórios
    if (!tipo.value) {
      validationErrors.value.push('Selecione o tipo da ocorrência');
    }

    if (tipo.value === 'outro' && !tipoOutro.value) {
      validationErrors.value.push('Especifique o tipo da ocorrência');
    }

    if (!geometry.value) {
      validationErrors.value.push('Adicione um ponto ou polígono no mapa');
    }

    if (validationErrors.value.length > 0) {
      showValidationModal.value = true;
      return;
    }

    isLoading.value = true;
    if (!token.value) {
      router.push('/login');
      return;
    }

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Accept", "application/json");
    myHeaders.append("Authorization", `Bearer ${token.value}`);

    const raw = JSON.stringify({
      description: descricao.value,
      type: tipo.value === 'outro' ? tipoOutro.value : tipo.value,
      title: titulo.value,
      location: geometry.value,
      ocurrency_status: 'pendente',
      account_id: userAccountId.value,
      opinion_account_id: userAccountId.value
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw
    };

    const response = await fetch("https://smrc.onrender.com/ocurrencies", requestOptions);
    const result = await response.json();

    if (response.ok) {
      // Upload file if there's an image
      if (imagemPreview.value && imagemPreview.value.startsWith('data:image')) {
        // Convert base64 to blob
        const base64Data = imagemPreview.value.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteArrays = [];
        
        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
          const slice = byteCharacters.slice(offset, offset + 512);
          const byteNumbers = new Array(slice.length);
          
          for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
          }
          
          const byteArray = new Uint8Array(byteNumbers);
          byteArrays.push(byteArray);
        }
        
        const blob = new Blob(byteArrays, { type: 'image/jpeg' });
        const formData = new FormData();
        formData.append('file', blob, 'image.jpg');

        const fileHeaders = new Headers();
        fileHeaders.append("Authorization", `Bearer ${token.value}`);

        const fileResponse = await fetch(`https://smrc.onrender.com/ocurrencies/${result.id}/files`, {
          method: "POST",
          headers: fileHeaders,
          body: formData
        });

        if (!fileResponse.ok) {
          console.error('Erro ao fazer upload do arquivo');
        }
      }

      // Limpar os pontos do mapa
      if (mapRef.value) {
        (mapRef.value as any).clearPoints();
      }
      
      // Redirecionar para o dashboard
      router.push('/dashboard');
    } else {
      console.error('Erro ao salvar ocorrência:', result);
      alert('Erro ao criar ocorrência. Por favor, tente novamente.');
    }
  } catch (error) {
    console.error('Erro ao salvar ocorrência:', error);
    alert('Erro ao criar ocorrência. Por favor, tente novamente.');
  } finally {
    isLoading.value = false;
  }
};

const updatePontoDescricao = (index: number, event: Event) => {
  const target = event.target as HTMLInputElement;
  pontos.value[index].descricao = target.value as string; 
};

const updatePoligonoDescricao = (index: number, event: Event) => {
  const target = event.target as HTMLInputElement;
  poligonos.value[index].descricao = target.value as string;
};

const removePonto = (index: number) => {
  pontos.value.splice(index, 1);
};

const removePoligono = (index: number) => {
  poligonos.value.splice(index, 1);
};

const handlePointAdded = (data: { type: string; geometry: string }) => {
  const geometry = JSON.parse(data.geometry);
  pontos.value.push({
    x: geometry.x,
    y: geometry.y,
    descricao: `Ponto ${pontos.value.length + 1}`
  });

  geometry.value = data.geometry;
};

const handlePolygonAdded = (data: { type: string; geometry: string }) => {
  const g = JSON.parse(data.geometry);
  console.log("geometry", g)
  poligonos.value.push({
    rings: g.rings,
    descricao: `Polígono ${poligonos.value.length + 1}`
  });

  geometry.value = data.geometry;
  console.log("geometry", geometry)
  
};

</script>

<template>
  <div class="criar-ocorrencia-container">
    <AppBar />
    <ValidationModal 
      :is-open="showValidationModal"
      :errors="validationErrors"
      @close="showValidationModal = false"
    />
    
    <main class="container mx-auto px-4 py-6">
      <div class="flex items-center mb-6">
        <Button @click="handleVoltar" variant="ghost" class="mr-2">
          <ArrowLeft class="h-4 w-4 mr-1" />
          Voltar
        </Button>
        <h1 class="text-2xl font-bold text-green-800">Criar Nova Ocorrência</h1>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">

        <!-- Formulário -->
        <div class="bg-white rounded-lg shadow-md p-2">
          <h2 class="text-xl font-bold mb-4 text-green-800">Informações da Ocorrência</h2>
          
    

          <div class="mb-4">
            <label for="tipo" class="block text-sm font-medium text-gray-700 mb-1">
              Tipo <span class="text-red-500">*</span>
            </label>
            <select
              id="tipo"
              v-model="tipo"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-700"
              :class="{ 'border-red-500': !tipo && submitted }"
            >
              <option value="">Selecione o tipo</option>
              <option value="Alagamento">Alagamento</option>
              <option value="Deslizamento">Deslizamento</option>
              <option value="Incêndio">Incêndios</option>
              <option value="Estiagem">Estiagem</option>
              <option value="Infestações/Pragas de animais">Infestações/Pragas de animais</option>
              <option value="Secas">Secas</option>
              <option value="Inundações">Inundações</option>
              <option value="Tempestades">Tempestades</option>
              <option value="outro">Outro</option>
            </select>
            <p v-if="!tipo && submitted" class="mt-1 text-sm text-red-500">
              Este campo é obrigatório
            </p>
          </div>

          <div v-if="tipo === 'outro'" class="mb-4">
            <label for="tipoOutro" class="block text-sm font-medium text-gray-700 mb-1">
              Especifique o tipo <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="tipoOutro"
              v-model="tipoOutro"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-700"
              :class="{ 'border-red-500': tipo === 'outro' && !tipoOutro && submitted }"
              placeholder="Digite o tipo de ocorrência"
            />
            <p v-if="tipo === 'outro' && !tipoOutro && submitted" class="mt-1 text-sm text-red-500">
              Este campo é obrigatório
            </p>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Imagem</label>
            <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div class="space-y-1 text-center">
                <div v-if="!imagemPreview" class="flex text-sm text-gray-600">
                  <label
                    for="imagem"
                    class="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500"
                  >
                    <span>Upload de imagem</span>
                    <input
                      id="imagem"
                      type="file"
                      accept="image/*"
                      class="sr-only"
                      @change="handleImageUpload"
                    />
                  </label>
                  <p class="pl-1">ou arraste e solte</p>
                </div>
                <div v-else class="relative">
                  <img :src="imagemPreview" alt="Preview" class="max-h-48 rounded-lg" />
                  <button
                    @click="removeImage"
                    class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <Trash2 class="h-4 w-4" />
                  </button>
                </div>
                <p class="text-xs text-gray-500">
                  PNG, JPG, GIF até 10MB
                </p>
              </div>
            </div>
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
          
          <Button 
            @click="handleSalvar" 
            class="w-full bg-green-700 hover:bg-green-800 text-white"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Salvando...
            </span>
            <span v-else>Salvar Ocorrência</span>
          </Button>
        </div>
            <!-- Mapa -->
    <div class="border-2 border-green-700 rounded-lg h-[calc(100vh-100px)]" 
         :class="{ 'border-red-500': !geometry && submitted }">
          <InteractiveMap 
            @point-added="handlePointAdded"
            @polygon-added="handlePolygonAdded"
          />
          <p v-if="!geometry && submitted" class="mt-1 text-sm text-red-500">
            Adicione um ponto ou polígono no mapa
          </p>
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