<script setup >
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { fetchOcorrenciaById } from '@/services/ocorrencias/ocorrencias.ts';
import AppBar from '@/components/AppBar.vue';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Shapes, Trash2, Upload } from 'lucide-vue-next';
import ReadOnlyMap from '@/components/ReadOnlyMap.vue';
import InteractiveMap from '@/components/InteractiveMap.vue';
import { useUser } from '@/composables/useUser';
import ValidationModal from '@/components/ValidationModal.vue';

const router = useRouter();
const route = useRoute();
const ocorrencia = ref(null);
const loading = ref(true);
const error = ref(null);
const { userAccountId } = useUser();

const tipo = ref('');
const descricao = ref('');
const imagemPreview = ref(null);
const pontos = ref([]);
const poligonos = ref([]);
const documentos = ref([]);
const status = ref('');
const opinion = ref('');
const account_id = ref('');
const opinion_account_id = ref('');
const isLoading = ref(false);
const submitted = ref(false);
const showValidationModal = ref(false);
const validationErrors = ref([]);

// Add computed properties for safe access
const hasDocumentos = computed(() => documentos.value && documentos.value.length > 0);
const hasPontos = computed(() => pontos.value && pontos.value.length > 0);
const hasPoligonos = computed(() => poligonos.value && poligonos.value.length > 0);

const handleVoltar = () => {
  router.back();
};

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      imagemPreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const removeImage = () => {
  imagemPreview.value = null;
};

const updatePontoDescricao = (index, event) => {
  pontos.value[index].descricao = event.target.value;
};

const updatePoligonoDescricao = (index, event) => {
  poligonos.value[index].descricao = event.target.value;
};

const removePonto = (index) => {
  pontos.value.splice(index, 1);
};

const removePoligono = (index) => {
  poligonos.value.splice(index, 1);
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
    if (!localStorage.getItem('token')) {
      router.push('/login');
      return;
    }

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Accept", "application/json");
    myHeaders.append("Authorization", `Bearer ${localStorage.getItem('token')}`);

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
      method: "PUT",
      headers: myHeaders,
      body: raw
    };

    const response = await fetch(`https://smrc.onrender.com/ocurrencies/${route.params.id}`, requestOptions);
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
        fileHeaders.append("Authorization", `Bearer ${localStorage.getItem('token')}`);

        const fileResponse = await fetch(`https://smrc.onrender.com/ocurrencies/${route.params.id}/files`, {
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
        (mapRef.value).clearPoints();
      }
      
      // Redirecionar para o dashboard
      router.push('/dashboard');
    } else {
      console.error('Erro ao salvar ocorrência:', result);
      alert('Erro ao editar ocorrência. Por favor, tente novamente.');
    }
  } catch (error) {
    console.error('Erro ao salvar ocorrência:', error);
    alert('Erro ao editar ocorrência. Por favor, tente novamente.');
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  loading.value = true;
  try {
    const id = route.params.id;
    const token = localStorage.getItem('token');
    if (!token) {
      error.value = 'Usuário não autenticado';
      return;
    }

    // Fetch occurrence data
    const data = await fetchOcorrenciaById(id);
    if (data) {
      ocorrencia.value = data;
      debugger
      // Initialize form fields with ocorrência data
      tipo.value = data.type || '';
      descricao.value = data.description || '';
      account_id.value = data.account_id || '';
      status.value = data.ocurrency_status || '';
      opinion.value = data.opinion || '';
      opinion_account_id.value = data.opinion_account_id || '';
      if (data.image) {
        imagemPreview.value = data.image;
      }
      if (data.points && Array.isArray(data.points)) {
        pontos.value = data.points.map(p => ({
          x: p.x,
          y: p.y,
          descricao: p.description || ''
        }));
      }
      if (data.location) {
        try {
          const locationData = JSON.parse(data.location);
          if (locationData.rings && Array.isArray(locationData.rings)) {
            poligonos.value = [{
              rings: locationData.rings,
              spatialReference: locationData.spatialReference,
              descricao: data.description || ''
            }];
          }
        } catch (e) {
          console.error('Erro ao fazer parse do location:', e);
          error.value = 'Erro ao processar dados de localização.';
        }
      }

      // Fetch documents
      const docHeaders = new Headers();
      docHeaders.append("Accept", "application/json");
      docHeaders.append("Authorization", `Bearer ${token}`);

      const docResponse = await fetch(`https://smrc.onrender.com/ocurrencies/${id}/files`, {
        method: "GET",
        headers: docHeaders
      });

      if (docResponse.ok) {
        const docData = await docResponse.json();
        documentos.value = Array.isArray(docData) ? docData : [];
      } else {
        console.error('Erro ao buscar documentos');
        documentos.value = [];
      }
    } else {
      error.value = 'Ocorrência não encontrada.';
    }
  } catch (e) {
    console.error('Erro ao buscar ocorrência.', e);
    error.value = 'Erro ao carregar ocorrência. Por favor, tente novamente.';
  } finally {
    loading.value = false;
  }
});


const handlePointAdded = (data) => {
  const geometry = JSON.parse(data.geometry);
  pontos.value.push({
    x: geometry.x,
    y: geometry.y,
    descricao: `Ponto ${pontos.value.length + 1}`
  });

  geometry.value = data.geometry;
};

const handlePolygonAdded = (data) => {
  const g = JSON.parse(data.geometry);
  console.log("geometry", g)
  poligonos.value.push({
    rings: g.rings,
    descricao: `Polígono ${poligonos.value.length + 1}`
  });

  geometry.value = data.geometry;
  console.log("geometry", geometry)
  
};

const removeDocument = async (docId) => {
  if (!confirm('Tem certeza que deseja remover este documento?')) return;

  try {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Usuário não autenticado!');
      return;
    }

    const headers = new Headers();
    headers.append("Authorization", `Bearer ${token}`);

    const response = await fetch(`https://smrc.onrender.com/ocurrencies/${route.params.id}/files/${docId}`, {
      method: "DELETE",
      headers: headers
    });

    if (response.ok) {
      // Remove document from local state
      documentos.value = documentos.value.filter(doc => doc.id !== docId);
      alert('Documento removido com sucesso!');
    } else {
      throw new Error('Erro ao remover documento');
    }
  } catch (error) {
    console.error('Erro ao remover documento:', error);
    alert('Erro ao remover documento. Por favor, tente novamente.');
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return '-';
  }
};

const getFileType = (filename) => {
  const extension = filename.split('.').pop()?.toLowerCase();
  const typeMap = {
    'jpg': 'Imagem',
    'jpeg': 'Imagem',
    'png': 'Imagem',
    'gif': 'Imagem',
    'pdf': 'PDF',
    'doc': 'Documento',
    'docx': 'Documento',
    'xls': 'Planilha',
    'xlsx': 'Planilha',
    'txt': 'Texto'
  };
  return typeMap[extension] || 'Arquivo';
};

const viewDocument = (doc) => {
  window.open(doc.signed_url, '_blank');
};

const downloadDocument = async (doc) => {
  try {
    const response = await fetch(doc.signed_url);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.name;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Erro ao baixar documento:', error);
    alert('Erro ao baixar documento. Por favor, tente novamente.');
  }
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
        <h1 class="text-2xl font-bold text-green-800">Editar Ocorrência</h1>
      </div>

      <div v-if="loading" class="flex justify-center items-center py-8">
        <svg class="animate-spin h-6 w-6 text-green-700 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="text-green-700 font-medium">Carregando ocorrência...</span>
      </div>

      <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong class="font-bold">Erro!</strong>
        <span class="block sm:inline"> {{ error }}</span>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div class="bg-white rounded-lg shadow-md p-6">
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
              <option value="Incêndio">Incêndio</option>
              <option value="Acidente">Acidente</option>
              <option value="Pragas">Pragas</option>
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
            <label for="status" class="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              id="status"
              v-model="status"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-700"
            >
              <option value="">Selecione o status</option>
              <option value="pendente">Pendente</option>
              <option value="análise">Em Análise</option>
              <option value="concluído">Concluído</option>
              <option value="em andamento">Em Andamento</option>
            </select>
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
                      disabled
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

          <!-- Documentos existentes -->
          <div v-if="hasDocumentos" class="mb-4">
            <h3 class="text-sm font-medium text-gray-700 mb-2">Documentos existentes:</h3>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="doc in documentos" :key="doc.id" class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {{ doc.name }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ getFileType(doc.name) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ formatDate(doc.created_at) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div class="flex justify-end space-x-2">
                        <button 
                          @click="viewDocument(doc)"
                          class="text-green-600 hover:text-green-900"
                          title="Visualizar"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                          </svg>
                        </button>
                        <button 
                          @click="downloadDocument(doc)"
                          class="text-blue-600 hover:text-blue-900"
                          title="Baixar"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
                          </svg>
                        </button>
                        <button 
                          @click="removeDocument(doc.id)"
                          class="text-red-600 hover:text-red-900"
                          title="Remover"
                        >
                          <Trash2 class="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="mb-6">
            <label for="descricao" class="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea
              id="descricao"
              v-model="descricao"
              rows="4"
              disabled
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-700"
              placeholder="Digite a descrição da ocorrência"
            ></textarea>
          </div>

          <div class="mb-6">
            <label for="parecer" class="block text-sm font-medium text-gray-700 mb-1">Escreva o parecer da ocorrência</label>
            <textarea
              id="parecer"
              v-model="opinion"
              rows="4"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-700"
              placeholder="Digite a descrição da ocorrência"
            ></textarea>
          </div>

          <div class="mb-4">
            <h3 class="text-sm font-medium text-gray-700 mb-2">Elementos Adicionados:</h3>
            <div class="space-y-4">
              <!-- Pontos -->
              <div v-if="hasPontos" class="mb-4">
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
                            Coordenadas: {{ ponto.x?.toFixed(6) }}, {{ ponto.y?.toFixed(6) }}
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
              <div v-if="hasPoligonos" class="mb-4">
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
                            {{ poligono.rings?.[0]?.length || 0 }} vértices
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
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-bold mb-4 text-green-800">Mapa</h2>
          <!-- Add your map component here -->
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

        <div class="lg:col-span-2">
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
            <span v-else>Salvar Alterações</span>
          </Button>
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


