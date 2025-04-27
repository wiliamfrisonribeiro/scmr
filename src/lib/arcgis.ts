import config from '@arcgis/core/config';

// Configuração global do ArcGIS
export function configureArcGIS() {
  // Definir opções padrão
  config.apiKey = 'sua-chave-api-aqui'; // Substitua pela sua chave de API
}

// Função para carregar os estilos CSS do ArcGIS
export function loadArcGISStyles() {
  // Importar os estilos CSS do ArcGIS
  import('@arcgis/core/assets/esri/themes/light/main.css');
} 