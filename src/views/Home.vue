<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { Button } from '@/components/ui/button';
import { MapPin, FileText, BarChart2, Users, Calendar, ChevronRight, Info, BarChart3, BarChart4 } from 'lucide-vue-next';
import { fetchOcorrenciasAll, fetchOcorrenciasStatus } from '@/services/ocorrencias/ocorrencias';
import ReadOnlyMap from '@/components/ReadOnlyMap.vue';
import { getAllAccounts } from '@/services/auth/accountService';
const router = useRouter();

const ocorrencias = ref([])
const isLoading = ref(true);
const totalOcorrencias = ref(0)
const totalOcorrenciasPendentes = ref(0)
const totalOcorrenciasEmAndamento = ref(0)
const totalOcorrenciasConcluidas = ref(0)
const selectedOcorrencia = ref<UltimaOcorrencia | OcorrenciaEmAnalise | null>(null); // Ocorrência selecionada para zoom

const navigateToDashboard = () => {
  router.push('/dashboard');
};

const navigateToCriarOcorrencia = () => {
  router.push('/criar-ocorrencia');
};

const navigateToLogin = () => {
  router.push('/login');
};

const formatDate = (date: string) => {
  if (!date) return '-';
  return new Date(date).toLocaleString('pt-BR');
};

// Dados de exemplo para as estatísticas
const estatisticas = ref([
  { id: 1, titulo: 'Ocorrências Registradas', valor: '1.245', icone: MapPin, cor: 'bg-green-700' },

  { id: 3, titulo: 'Em Análise', valor: '432', icone: BarChart2, cor: 'bg-green-800' },
  { id: 4, titulo: 'Pendentes', valor: '78', icone: BarChart3, cor: 'bg-green-500' },
  { id: 5, titulo: 'Em andamento', valor: '78', icone: BarChart4, cor: 'bg-green-500' },
  { id: 6, titulo: 'Concluídas', valor: '78', icone: BarChart4, cor: 'bg-green-500' },
  { id: 7, titulo: 'Usuários Ativos', valor: '78', icone: Users, cor: 'bg-green-500' },
]);

// Dados de exemplo para as últimas ocorrências
interface UltimaOcorrencia {
  id: number;
  titulo: string;
  data: string;
  local: string;
  status: string;
}

const ultimasOcorrencias = ref<UltimaOcorrencia[]>([
  { 
    id: 1, 
    titulo: 'Desmatamento em Área Protegida', 
    data: '15/06/2023', 
    local: 'Parque Nacional da Serra da Canastra, MG',
    status: 'Em análise'
  },
  { 
    id: 2, 
    titulo: 'Poluição de Rio', 
    data: '12/06/2023', 
    local: 'Rio Tietê, SP',
    status: 'Concluído'
  },
  { 
    id: 3, 
    titulo: 'Queimada em Área de Preservação', 
    data: '10/06/2023', 
    local: 'Chapada dos Veadeiros, GO',
    status: 'Em andamento'
  },
  { 
    id: 4, 
    titulo: 'Caça Ilegal', 
    data: '08/06/2023', 
    local: 'Reserva Biológica de Sooretama, ES',
    status: 'Em análise'
  },
]);

// Dados de exemplo para os próximos eventos
const proximosEventos = ref([
  { 
    id: 1, 
    titulo: 'Treinamento de Agentes', 
    data: '20/06/2023', 
    local: 'Auditório Central, Brasília',
    tipo: 'Capacitação'
  },
  { 
    id: 2, 
    titulo: 'Reunião de Coordenação', 
    data: '22/06/2023', 
    local: 'Sala de Reuniões, São Paulo',
    tipo: 'Reunião'
  },
  { 
    id: 3, 
    titulo: 'Operação de Fiscalização', 
    data: '25/06/2023', 
    local: 'Região Amazônica',
    tipo: 'Operação'
  },
]);

// Dados de exemplo para os próximos eventos
interface OcorrenciaEmAnalise {
  id: number;
  titulo: string;
  data: string;
  local: string;
  status: string;
  opinion: string;
}

const ocorrenciasEmAnalise = ref<OcorrenciaEmAnalise[]>([]);

// Dados de exemplo para a seção Sobre
const sobreNos = ref({
  titulo: 'Sobre o Sistema de Controle',
  descricao: 'O Sistema de Controle de Ocorrências é uma plataforma colaborativa desenvolvida para facilitar o registro, acompanhamento e análise de situações críticas no meio rural em todo o território nacional.',
  missao: 'Nossa missão é fornecer uma ferramenta eficiente para o registro e Controle de ocorrências no meio rural, como alagamentos, incêndios e infestações de pragas. Nosso objetivo é promover a transparência e a participação cidadã na identificação e combate a esses desafios.',
  visao: 'Nossa missão é fornecer uma ferramenta eficiente para o registro e Controle de ocorrências no meio rural, como alagamentos, incêndios e infestações de pragas. Ao fazer isso, almejamos ser referência nacional em sistemas de controle e colaborativo, contribuindo significativamente para a preservação dos recursos naturais e o desenvolvimento sustentável das comunidades rurais e do país',
  valores: [
    'Transparência',
    'Colaboração',
    'Inovação',
    'Compromisso com o meio rural',
    'Responsabilidade social'
  ]
});

const filterOcorrencias = async () => {
  try {
  
      
    const response = await fetchOcorrenciasAll();
    ocorrencias.value = response.data;
    const ocorrenciasUltimas: UltimaOcorrencia[] = [];
    const ocorrenciasAnalise: OcorrenciaEmAnalise[] = [];
    
    if (response.data && response.data.length > 0) {
      const ocorrencias = response.data;
      totalOcorrencias.value = ocorrencias.length;
      
      ocorrencias.forEach((ocorrencia: any, index: number) => {
        if (index < 4) {
          const ocorrenciaUltima: UltimaOcorrencia = {
            id: ocorrencia.id,
            titulo: ocorrencia.type,
            data: formatDate(ocorrencia.created_date),
            local: ocorrencia.description,
            status: ocorrencia.ocurrency_status
          };
          ocorrenciasUltimas.push(ocorrenciaUltima);
        }
        
        // Filtrar ocorrências em análise
        if (ocorrencia.ocurrency_status === 'análise') {
          const ocorrenciaAnalise: OcorrenciaEmAnalise = {
            id: ocorrencia.id,
            titulo: ocorrencia.type,
            data: formatDate(ocorrencia.created_date),
            local: ocorrencia.description,
            status: ocorrencia.ocurrency_status,
            opinion: ocorrencia.opinion || 'Aguardando análise'
          };
          ocorrenciasAnalise.push(ocorrenciaAnalise);
        }
      });
      
      ultimasOcorrencias.value = ocorrenciasUltimas;
      ocorrenciasEmAnalise.value = ocorrenciasAnalise.slice(0, 4); // Limitar a 4 ocorrências

      console.log(ocorrenciasUltimas)
      console.log('Ocorrências em análise:', ocorrenciasAnalise)

      estatisticas.value[0].valor = totalOcorrencias.value.toString();

      const ocorrenciasAnalisadas = ocorrencias.filter((ocorrencia: any) => ocorrencia.ocurrency_status === 'análise');
      
     

      estatisticas.value[1].valor = ocorrenciasAnalisadas.length.toString();
      estatisticas.value[2].valor = totalOcorrencias.value.toString();

      console.log(estatisticas.value)
    }
  } catch (error) {
    console.error('Erro ao buscar ocorrências:', error);
  }
};

const fetchOcorrencasPendentes = async () => {
  const response = await fetchOcorrenciasStatus('pendente');
  console.log("ocorrenciasPendentes", response)
  const total = response.total;
  totalOcorrenciasPendentes.value = total;
  estatisticas.value[3].valor = totalOcorrenciasPendentes.value.toString();
 
}

const fetchOcorrenciasEmAndamento = async () => {
  const response = await fetchOcorrenciasStatus('em andamento');
  console.log("ocorrenciasEmAndamento", response)
  const total = response.total;
  totalOcorrenciasEmAndamento.value = total;
  estatisticas.value[3].valor = totalOcorrenciasEmAndamento.value.toString();
}


const fetchOcorrenciasConcluidas = async () => {
  const response = await fetchOcorrenciasStatus('concluído');
  console.log("ocorrenciasConcluidas", response)
  const total = response.total;
  totalOcorrenciasConcluidas.value = total;
  estatisticas.value[4].valor = totalOcorrenciasConcluidas.value.toString();
}

const fetchTotalUsuarios = async () => {
  const response = await getAllAccounts();
  console.log("totalUsuarios", response)
  const total = response.total;
  
  estatisticas.value[5].valor = total;

}

// Função para lidar com a seleção de ocorrência para zoom
const handleOcorrenciaSelected = (ocorrencia: any) => {
  selectedOcorrencia.value = ocorrencia;
  console.log('Ocorrência selecionada para zoom:', ocorrencia);
  
  // Scroll suave para o mapa
  const mapaSection = document.getElementById('mapa');
  if (mapaSection) {
    mapaSection.scrollIntoView({ behavior: 'smooth' });
  }
};

onMounted(async () => {
  try {
    isLoading.value = true;
 await filterOcorrencias();
 await fetchOcorrencasPendentes();
 await fetchOcorrenciasEmAndamento();
 await fetchOcorrenciasConcluidas();
 await fetchTotalUsuarios();
  } finally {
    isLoading.value = false;
  }
});


watch(ultimasOcorrencias, (newVal) => {
  console.log(newVal)
})
</script>

<template>
  <div class="home-container">
    <!-- Header com logo e navegação -->
    <header class="header">
      <div class="header-content">
        <div class="logo-container">
      
          <h1 class="site-title">SCMR</h1>
        </div>
        <nav class="main-nav">
          <ul>
            <li><a href="#inicio" class="active">Início</a></li>
            <li><a href="#ocorrencias">Ocorrências</a></li>
            <li><a href="#mapa">Mapa</a></li>
            <li><a href="#sobre">Sobre</a></li>
          </ul>
        </nav>
        <div class="user-actions">
          <Button variant="outline" size="sm" @click="navigateToLogin">Entrar</Button>
         
        </div>
      </div>
    </header>

    <!-- Banner principal -->
    <section id="inicio" class="hero-banner">
      <div class="hero-content">
        <h2> Sistema Colaborativo para Controle de situações críticas no meio rural</h2>
        <p>Sistema integrado para registro, acompanhamento e análise de ocorrências o meio rural em todo o território nacional.</p>
        <div class="hero-buttons">
          <Button 
            class="bg-green-700 hover:bg-green-800 text-white"
            @click="navigateToDashboard"
          >
            Acessar Dashboard
          </Button>
          <Button variant="outline" @click="navigateToCriarOcorrencia">Nova Ocorrência</Button>
        </div>
      </div>
    </section>

    <!-- Estatísticas -->
    <section class="stats-section">
      <div class="stats-container">
        <div v-for="stat in estatisticas" :key="stat.id" class="stat-card">
          <div :class="['stat-icon', stat.cor]">
            <component :is="stat.icone" class="h-6 w-6 text-white" />
          </div>
          <div class="stat-info">
            <h3 class="stat-value">
              <div v-if="isLoading" class="loading-spinner-small"></div>
              <span v-else>{{ stat.valor }}</span>
            </h3>
            <p class="stat-title">{{ stat.titulo }}</p>
          </div>
        </div>
      </div>
    </section>

   

    <!-- Conteúdo principal -->
    <main id="ocorrencias" class="main-content flex flex-col gap-4">
      <div class="content-grid">
        <!-- Instrução para o usuário -->
        <div class="col-span-full mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="text-blue-800 text-sm">
              <strong>Dica:</strong> Clique em qualquer ocorrência para localizá-la no mapa abaixo
            </span>
          </div>
        </div>
        
        <!-- Últimas ocorrências -->
        <section class="content-card">
          <div class="card-header">
            <h2>Últimas Ocorrências</h2>
          
          </div>
          <div class="card-content ">
            <div v-if="isLoading" class="loading-container">
              <div class="loading-spinner"></div>
              <p class="loading-text">Carregando ocorrências...</p>
            </div>
            <div v-else>
              <div v-for="ocorrencia in ultimasOcorrencias" :key="ocorrencia.id" 
                   class="list-item cursor-pointer hover:bg-gray-50 transition-colors"
                   @click="handleOcorrenciaSelected(ocorrencia)"
                   :class="{
                     'bg-blue-50 border-l-4 border-blue-500 !rounded-none !mx-[-1rem]': selectedOcorrencia && selectedOcorrencia.id === ocorrencia.id
                   }">
                <div class="item-icon">
                  <MapPin class="h-5 w-5 text-blue-500" />
                </div>
                <div class="item-details flex-1">
                  <h3 class="item-title">{{ ocorrencia.titulo }}</h3>
                  <p class="item-location">{{ ocorrencia.local }}</p>
                  <div class="item-meta">
                    <span class="item-date">{{ ocorrencia.data }}</span>
                     <span :class="['item-status', `status-${ocorrencia.status.toLowerCase().replace(' ', '-')}`]">
                      {{ ocorrencia.status }}
                    </span> 
                  </div>
                </div>
                <div class="flex items-center gap-1 text-blue-600 hover:text-blue-800 ml-2" title="Clique para localizar no mapa">
                  <MapPin class="h-4 w-4" />
                  <span class="text-xs">Localizar</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Próximos eventos -->
        <section class="content-card">
          <div class="card-header">
            <h2>Últimas Ocorrências em Análise</h2>
      
          </div>
          <div class="card-content">
            <div v-if="ocorrenciasEmAnalise.length === 0" class="text-center py-8 text-gray-500">
              <BarChart2 class="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>Nenhuma ocorrência em análise no momento</p>
            </div>
            <div v-else v-for="ocorrencia in ocorrenciasEmAnalise" :key="ocorrencia.id" 
                 class="list-item cursor-pointer hover:bg-gray-50 transition-colors"
                 @click="handleOcorrenciaSelected(ocorrencia)"
                 :class="{
                   'bg-blue-50 border-l-4 border-blue-500 !rounded-none !mx-[-1rem]': selectedOcorrencia && selectedOcorrencia.id === ocorrencia.id
                 }">
              <div class="item-icon">
              
                  <MapPin class="h-5 w-5 text-blue-500" />
                
          
              </div>
              <div class="item-details flex-1">
                <h3 class="item-title">{{ ocorrencia.titulo }}</h3>
                <p class="item-location">{{ ocorrencia.local }}</p>
                <div class="item-meta">
                  <span class="item-date">{{ ocorrencia.data }}</span>
                  <span class="item-status status-em-análise">{{ ocorrencia.status }}</span>
                </div>
                <p v-if="ocorrencia.opinion && ocorrencia.opinion !== 'Aguardando análise'" class="text-xs text-gray-600 mt-1">
                  <strong>Análise:</strong> {{ ocorrencia.opinion }}
                </p>
              </div>
              <div class="flex items-center gap-1 text-blue-600 hover:text-blue-800 ml-2" title="Clique para localizar no mapa">
                <MapPin class="h-4 w-4" />
                <span class="text-xs">Localizar</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>


     <!-- Mapa de Ocorrências -->
     <section id="mapa" class="map-section">
      <div class="map-container">
        <div class="section-header">
          <h2 class="section-title">Mapa de Ocorrências</h2>
          <p class="section-description">Visualize todas as ocorrências registradas no sistema</p>
        </div>
        
        <!-- Indicador de ocorrência selecionada -->
        <div v-if="selectedOcorrencia" class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span class="text-blue-800 font-medium">Visualizando: {{ selectedOcorrencia.titulo }}</span>
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
        
          <div class="map-wrapper">
            <div v-if="isLoading" class="loading-container">
              <div class="loading-spinner"></div>
              <p class="loading-text">Carregando mapa...</p>
            </div>
            <ReadOnlyMap v-else :ocorrencias="ocorrencias" :selectedOcorrencia="selectedOcorrencia" />
        </div>
      </div>
    </section>

    <!-- Seção Sobre -->
    <section id="sobre" class="about-section">
      <div class="about-container">
        <div class="section-header">
          <h2 class="section-title">{{ sobreNos.titulo }}</h2>
          <p class="section-description">{{ sobreNos.descricao }}</p>
        </div>
        
        <div class="about-content">
          <div class="about-card">
            <div class="about-icon">
              <Info class="h-6 w-6 text-green-600" />
            </div>
            <h3 class="about-subtitle">Missão</h3>
            <p class="about-text">{{ sobreNos.missao }}</p>
          </div>
          
          <div class="about-card">
            <div class="about-icon">
              <Info class="h-6 w-6 text-green-600" />
            </div>
            <h3 class="about-subtitle">Visão</h3>
            <p class="about-text">{{ sobreNos.visao }}</p>
          </div>
          
          <div class="about-card">
            <div class="about-icon">
              <Info class="h-6 w-6 text-green-600" />
            </div>
            <h3 class="about-subtitle">Valores</h3>
            <ul class="about-values">
              <li v-for="(valor, index) in sobreNos.valores" :key="index" class="about-value-item">
                {{ valor }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-logo">
       
          <p class="footer-description">
            Sistema Colaborativo de Controle de situações críticas no meio rural
          </p>
        </div>
        <div class="footer-links">
          <div class="footer-column">
            <h3>Institucional</h3>
            <ul>
              <li><a href="#">Sobre</a></li>
              <li><a href="#">Contato</a></li>
              <li><a href="#">Transparência</a></li>
              <li><a href="#">Acessibilidade</a></li>
            </ul>
          </div>
          <div class="footer-column">
            <h3>Serviços</h3>
            <ul>
              <li><a href="#">Ocorrências</a></li>
              <li><a href="#">Mapas</a></li>
         
            </ul>
          </div>
   
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2025 Sistema Colaborativo de Controle de situações críticas no meio rural. Todos os direitos reservados.</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
}

/* Header */
.header {
  background-color: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 50;
}

.header-content {
  max-width: 1280px;
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo {
  height: 40px;
  width: auto;
}

.site-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a4731;
}

.main-nav ul {
  display: flex;
  gap: 1.5rem;
  list-style: none;
}

.main-nav a {
  text-decoration: none;
  color: #4a5568;
  font-weight: 500;
  padding: 0.5rem;
  border-radius: 0.25rem;
  transition: all 0.2s;
}

.main-nav a:hover {
  color: #2f855a;
}

.main-nav a.active {
  color: #2f855a;
  font-weight: 600;
}

.user-actions {
  display: flex;
  gap: 0.5rem;
}

/* Hero Banner */
.hero-banner {
  background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/banner-bg.svg');
  background-size: cover;
  background-position: center;
  color: white;
  padding: 4rem 1rem;
  text-align: center;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-content h2 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.hero-content p {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

/* Estatísticas */
.stats-section {
  padding: 2rem 1rem;
  background-color: #f0fdf4;
}

.stats-container {
  max-width: 1280px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background-color: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-info {
  flex: 1;
}

.stat-value {
  min-height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.25rem;
}

.stat-title {
  font-size: 0.875rem;
  color: #718096;
}

/* Conteúdo principal */
.main-content {
  flex: 1;
  padding: 2rem 1rem;
  background-color: #f0fdf4;
}

.content-grid {
  max-width: 1280px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 2rem;
}

.content-card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
}

.view-all {
  color: #4a5568;
  font-size: 0.875rem;
}

.card-content {
  padding: 1rem;
}

.list-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.list-item:last-child {
  border-bottom: none;
}

.item-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  background-color: #e6ffed;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.item-details {
  flex: 1;
}

.item-title {
  font-size: 1rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.25rem;
}

.item-location {
  font-size: 0.875rem;
  color: #718096;
  margin-bottom: 0.5rem;
}

.item-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-date {
  font-size: 0.75rem;
  color: #718096;
}

.item-status {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  font-weight: 500;
}

.status-em-análise {
  background-color: #e6ffed;
  color: #2f855a;
}

.status-em-andamento {
  background-color: #fef3c7;
  color: #d97706;
}

.status-concluído {
  background-color: #d1fae5;
  color: #059669;
}

.status-pendente {
  background-color: #fef3c7;
  color: #d97706;
}

.item-type {
  font-size: 0.75rem;
  color: #718096;
  background-color: #f7fafc;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
}

/* Mapa de Ocorrências */
.map-section {
  padding: 4rem 1rem;
  background-color: #f0fdf4;
  display: flex;
  justify-content: center;
  align-items: center;
}

.map-container {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

.section-header {
  text-align: center;
  margin-bottom: 2rem;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a4731;
  margin-bottom: 1rem;
}

.section-description {
  font-size: 1.25rem;
  color: #4a5568;
  max-width: 600px;
  margin: 0 auto;
}

.map-wrapper {
  height: 600px;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin: 0 auto;
}

/* Seção Sobre */
.about-section {
  padding: 4rem 1rem;
  background-color: #ffffff;
}

.about-container {
  max-width: 1280px;
  margin: 0 auto;
}

.about-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.about-card {
  background-color: #f0fdf4;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.about-card:hover {
  transform: translateY(-5px);
}

.about-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.5rem;
  background-color: #e6ffed;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.about-subtitle {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a4731;
  margin-bottom: 0.75rem;
}

.about-text {
  font-size: 0.875rem;
  color: #4a5568;
  line-height: 1.5;
}

.about-values {
  list-style: none;
  padding: 0;
}

.about-value-item {
  font-size: 0.875rem;
  color: #4a5568;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e2e8f0;
}

.about-value-item:last-child {
  border-bottom: none;
}

/* Footer */
.footer {
  background-color: #1a4731;
  color: white;
  padding: 3rem 1rem 1rem;
}

.footer-content {
  max-width: 1280px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 3rem;
}

.footer-logo {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.footer-logo-img {
  height: 40px;
  width: auto;
}

.footer-description {
  font-size: 0.875rem;
  opacity: 0.8;
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.footer-column h3 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #e2e8f0;
}

.footer-column ul {
  list-style: none;
  padding: 0;
}

.footer-column li {
  margin-bottom: 0.5rem;
}

.footer-column a {
  color: #a0aec0;
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.2s;
}

.footer-column a:hover {
  color: white;
}

.footer-bottom {
  max-width: 1280px;
  margin: 2rem auto 0;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
  font-size: 0.75rem;
  opacity: 0.7;
}

/* Responsividade */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
  }
  
  .main-nav ul {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .hero-content h2 {
    font-size: 2rem;
  }
  
  .footer-content {
    grid-template-columns: 1fr;
  }
  
  .footer-links {
    grid-template-columns: 1fr;
  }
  
  .map-wrapper {
    height: 350px;
  }
  
  .about-content {
    grid-template-columns: 1fr;
  }
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  width: 100%;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #2f855a;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.loading-text {
  color: #4a5568;
  font-size: 0.875rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-spinner-small {
  width: 24px;
  height: 24px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #2f855a;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}
</style> 