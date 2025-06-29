<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { fetchOcorrenciaById } from '@/services/ocorrencias/ocorrencias.ts';
import { getAccountDetails } from '@/services/auth/accountService';
import AppBar from '@/components/AppBar.vue';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, FileText, Eye, User, Phone, MapPin as LocationIcon } from 'lucide-vue-next';
import ReadOnlyMap from '@/components/ReadOnlyMap.vue';
import { useUser } from '@/composables/useUser';

const router = useRouter();
const route = useRoute();
const ocorrencia = ref(null);
const loading = ref(true);
const error = ref(null);
const { userAccountId, isAuthority } = useUser();

const status = ref('');
const opinion = ref('');
const documentos = ref([]);
const imagemPreview = ref(null);
const userDetails = ref(null);
const saving = ref(false);

// Add computed properties for safe access
const hasDocumentos = computed(() => documentos.value && documentos.value.length > 0);

const handleVoltar = () => {
  router.push('/dashboard');
};

const handleSalvar = async () => {
  saving.value = true;
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Usuário não autenticado!');
      saving.value = false;
      return;
    }

    // Prepare the occurrence data - incluir todos os campos obrigatórios
    const occurrenceData = {
      // Campos obrigatórios do backend
      description: ocorrencia.value.description,
      type: ocorrencia.value.type,
      account_id: ocorrencia.value.account_id,
      location: ocorrencia.value.location,
      // Campos de análise
      ocurrency_status: status.value,
      opinion: opinion.value,
      opinion_account_id: userAccountId.value,
      id: ocorrencia.value.id
    };

    // Update occurrence
    const updateHeaders = new Headers();
    updateHeaders.append("Content-Type", "application/json");
    updateHeaders.append("Authorization", `Bearer ${token}`);

    const updateResponse = await fetch(`https://smrc.onrender.com/ocurrencies/${route.params.id}`, {
      method: "PUT",
      headers: updateHeaders,
      body: JSON.stringify(occurrenceData)
    });

    if (!updateResponse.ok) {
      throw new Error('Erro ao atualizar ocorrência');
    }

    alert('Análise da ocorrência atualizada com sucesso!');
    router.push('/dashboard');
  } catch (error) {
    console.error('Erro ao salvar:', error);
    alert('Erro ao salvar análise. Por favor, tente novamente.');
  } finally {
    saving.value = false;
  }
};

onMounted(async () => {
  // Verificar se o usuário é autoridade
  if (!isAuthority.value) {
    router.push('/dashboard');
    return;
  }

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
      
      // Initialize form fields with ocorrência data
      status.value = data.ocurrency_status || '';
      opinion.value = data.opinion || '';
      
      if (data.image) {
        imagemPreview.value = data.image;
      }

      // Buscar detalhes do usuário que criou a ocorrência
      if (data.account_id) {
        try {
          const userDetailsData = await getAccountDetails(data.account_id);
          userDetails.value = userDetailsData;
        } catch (err) {
          console.error('Erro ao buscar detalhes do usuário:', err);
          userDetails.value = null;
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
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <AppBar />
    
    <main class="container mx-auto px-4 py-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-4">
          <Button @click="handleVoltar" variant="outline" class="flex items-center gap-2">
            <ArrowLeft class="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Análise de Ocorrência</h1>
            <p class="text-gray-600">Modo Autoridade - Apenas análise e alteração de status</p>
          </div>
        </div>
      </div>

      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto"></div>
          <p class="mt-4 text-gray-600">Carregando ocorrência...</p>
        </div>
      </div>

      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4">
        <p class="text-red-800">{{ error }}</p>
      </div>

      <div v-else-if="ocorrencia" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Coluna Esquerda - Informações da Ocorrência -->
        <div class="space-y-6">
          <!-- Informações Básicas (Somente Leitura) -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Eye class="h-5 w-5 text-blue-600" />
              Informações da Ocorrência
            </h2>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <p class="text-gray-900 bg-gray-50 p-3 rounded-md">{{ ocorrencia.type || 'Não especificado' }}</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <p class="text-gray-900 bg-gray-50 p-3 rounded-md min-h-[80px]">{{ ocorrencia.description || 'Sem descrição' }}</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Data de Registro</label>
                <p class="text-gray-900 bg-gray-50 p-3 rounded-md">
                  {{ new Date(ocorrencia.created_at).toLocaleString('pt-BR') }}
                </p>
              </div>
            </div>
          </div>

          <!-- Informações do Usuário (Somente Leitura) -->
          <div v-if="userDetails" class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User class="h-5 w-5 text-green-600" />
              Informações do Solicitante
            </h2>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <LocationIcon class="h-4 w-4" />
                  Endereço
                </label>
                <p class="text-gray-900 bg-gray-50 p-3 rounded-md">{{ userDetails.street || 'Não informado' }}</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                <p class="text-gray-900 bg-gray-50 p-3 rounded-md">{{ userDetails.city || 'Não informada' }}</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                <p class="text-gray-900 bg-gray-50 p-3 rounded-md">{{ userDetails.cep || 'Não informado' }}</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <Phone class="h-4 w-4" />
                  Telefone
                </label>
                <p class="text-gray-900 bg-gray-50 p-3 rounded-md">{{ userDetails.phone || 'Não informado' }}</p>
              </div>
            </div>
          </div>

          <!-- Status e Análise (Editável) -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Análise e Status</h2>
            
            <div class="space-y-4">
              <div>
                <label for="status" class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  id="status"
                  v-model="status"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                >
                  <option value="pendente">Pendente</option>
                  <option value="análise">Análise</option>
                  <option value="em andamento">Em Andamento</option>
                  <option value="concluído">Concluído</option>
                </select>
              </div>
              
              <div>
                <label for="opinion" class="block text-sm font-medium text-gray-700 mb-1">Análise/Opinião</label>
                <textarea
                  id="opinion"
                  v-model="opinion"
                  rows="4"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="Digite sua análise ou opinião sobre a ocorrência..."
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Botão Salvar -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <Button @click="handleSalvar" class="w-full bg-green-700 hover:bg-green-800 text-white" :disabled="saving">
              <span v-if="saving">Salvando...</span>
              <span v-else>Salvar Análise</span>
            </Button>
          </div>
        </div>

        <!-- Coluna Direita - Mapa e Documentos -->
        <div class="space-y-6">
          <!-- Mapa -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin class="h-5 w-5 text-green-600" />
              Localização
            </h2>
            <div class="h-64 bg-gray-100 rounded-md">
              <ReadOnlyMap :ocorrencias="[ocorrencia]" />
            </div>
          </div>

          <!-- Documentos -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText class="h-5 w-5 text-blue-600" />
              Documentos Anexados
            </h2>
            
            <div v-if="hasDocumentos" class="space-y-2">
              <div v-for="doc in documentos" :key="doc.id" class="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div class="flex items-center gap-3">
                  <FileText class="h-4 w-4 text-gray-500" />
                  <span class="text-sm text-gray-700">{{ doc.filename || 'Documento' }}</span>
                </div>
                <a 
                  :href="doc.url" 
                  target="_blank" 
                  class="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Visualizar
                </a>
              </div>
            </div>
            
            <div v-else class="text-center py-8 text-gray-500">
              <FileText class="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>Nenhum documento anexado</p>
            </div>
          </div>

          <!-- Imagem (se houver) -->
          <div v-if="imagemPreview" class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Imagem da Ocorrência</h2>
            <img 
              :src="imagemPreview" 
              alt="Imagem da ocorrência" 
              class="w-full h-auto rounded-md shadow-sm"
            />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: 'AnalisarOcorrencia'
};
</script> 