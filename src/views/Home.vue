<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Button } from '@/components/ui/button';
import { MapPin, FileText, BarChart2, Users, Calendar, ChevronRight, Info } from 'lucide-vue-next';

import ReadOnlyMap from '@/components/ReadOnlyMap.vue';

const router = useRouter();


const navigateToDashboard = () => {
  router.push('/dashboard');
};

const navigateToCriarOcorrencia = () => {
  router.push('/criar-ocorrencia');
};

const navigateToLogin = () => {
  router.push('/login');
};

// Dados de exemplo para as estatísticas
const estatisticas = ref([
  { id: 1, titulo: 'Ocorrências Registradas', valor: '1.245', icone: MapPin, cor: 'bg-green-700' },
  { id: 2, titulo: 'Relatórios Gerados', valor: '856', icone: FileText, cor: 'bg-green-600' },
  { id: 3, titulo: 'Análises Realizadas', valor: '432', icone: BarChart2, cor: 'bg-green-800' },
  { id: 4, titulo: 'Usuários Ativos', valor: '78', icone: Users, cor: 'bg-green-500' },
]);

// Dados de exemplo para as últimas ocorrências
const ultimasOcorrencias = ref([
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

// Dados de exemplo para a seção Sobre
const sobreNos = ref({
  titulo: 'Sobre o Sistema de Monitoramento',
  descricao: 'O Sistema de Monitoramento de Ocorrências é uma plataforma colaborativa desenvolvida para facilitar o registro, acompanhamento e análise de situações críticas no meio rural em todo o território nacional.',
  missao: 'Nossa missão é fornecer uma ferramenta eficiente para monitoramento ambiental, promovendo a transparência e a participação cidadã na proteção do meio ambiente.',
  visao: 'Ser referência nacional em sistemas de monitoramento ambiental colaborativo, contribuindo para a preservação dos recursos naturais e o desenvolvimento sustentável.',
  valores: [
    'Transparência',
    'Colaboração',
    'Inovação',
    'Compromisso com o meio ambiente',
    'Responsabilidade social'
  ]
});
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
          <Button size="sm">Cadastrar</Button>
        </div>
      </div>
    </header>

    <!-- Banner principal -->
    <section id="inicio" class="hero-banner">
      <div class="hero-content">
        <h2> Sistema Colaborativo para monitoramento de situações críticas no meio rural</h2>
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
            <h3 class="stat-value">{{ stat.valor }}</h3>
            <p class="stat-title">{{ stat.titulo }}</p>
          </div>
        </div>
      </div>
    </section>

   

    <!-- Conteúdo principal -->
    <main id="ocorrencias" class="main-content">
      <div class="content-grid">
        <!-- Últimas ocorrências -->
        <section class="content-card">
          <div class="card-header">
            <h2>Últimas Ocorrências</h2>
            <Button variant="ghost" size="sm" class="view-all">
              Ver todas <ChevronRight class="h-4 w-4" />
            </Button>
          </div>
          <div class="card-content">
            <div v-for="ocorrencia in ultimasOcorrencias" :key="ocorrencia.id" class="list-item">
              <div class="item-icon">
                <MapPin class="h-5 w-5 text-blue-500" />
              </div>
              <div class="item-details">
                <h3 class="item-title">{{ ocorrencia.titulo }}</h3>
                <p class="item-location">{{ ocorrencia.local }}</p>
                <div class="item-meta">
                  <span class="item-date">{{ ocorrencia.data }}</span>
                  <span :class="['item-status', `status-${ocorrencia.status.toLowerCase().replace(' ', '-')}`]">
                    {{ ocorrencia.status }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Próximos eventos -->
        <section class="content-card">
          <div class="card-header">
            <h2>Próximos Eventos</h2>
            <Button variant="ghost" size="sm" class="view-all">
              Ver todos <ChevronRight class="h-4 w-4" />
            </Button>
          </div>
          <div class="card-content">
            <div v-for="evento in proximosEventos" :key="evento.id" class="list-item">
              <div class="item-icon">
                <Calendar class="h-5 w-5 text-green-500" />
              </div>
              <div class="item-details">
                <h3 class="item-title">{{ evento.titulo }}</h3>
                <p class="item-location">{{ evento.local }}</p>
                <div class="item-meta">
                  <span class="item-date">{{ evento.data }}</span>
                  <span class="item-type">{{ evento.tipo }}</span>
                </div>
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
        <div class="map-wrapper">
          <ReadOnlyMap />
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
          <img src="" alt="Logo" class="footer-logo-img" />
          <p class="footer-description">
            Sistema de Monitoramento de Ocorrências Ambientais
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
              <li><a href="#">Relatórios</a></li>
              <li><a href="#">Mapas</a></li>
              <li><a href="#">API</a></li>
            </ul>
          </div>
          <div class="footer-column">
            <h3>Suporte</h3>
            <ul>
              <li><a href="#">Ajuda</a></li>
              <li><a href="#">FAQ</a></li>
              <li><a href="#">Documentação</a></li>
              <li><a href="#">Fale Conosco</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2023 Sistema de Monitoramento de Ocorrências. Todos os direitos reservados.</p>
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
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
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
</style> 