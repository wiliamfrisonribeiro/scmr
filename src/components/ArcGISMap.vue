<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { loadArcGISStyles, configureArcGIS } from '@/lib/arcgis';

// Referência para o elemento do mapa
const mapDiv = ref<HTMLDivElement | null>(null);
let mapView: any = null;

// Função para inicializar o mapa
const initMap = async () => {
  if (!mapDiv.value) return;
  
  try {
    // Importar os módulos necessários do ArcGIS
    const MapModule = await import('@arcgis/core/Map');
    const MapViewModule = await import('@arcgis/core/views/MapView');
    const BasemapGalleryModule = await import('@arcgis/core/widgets/BasemapGallery');
    const ExpandModule = await import('@arcgis/core/widgets/Expand');
    
    // Criar um novo mapa
    const map = new MapModule.default({
      basemap: 'topo-vector'
    });
    
    // Criar uma visualização do mapa
    mapView = new MapViewModule.default({
      container: mapDiv.value,
      map: map,
      zoom: 4,
      center: [-100, 40] // Centralizar nos EUA
    });
    
    // Adicionar o widget de galeria de mapas base
    const basemapGallery = new BasemapGalleryModule.default({
      view: mapView
    });
    
    // Adicionar o widget de galeria de mapas base ao mapa
    mapView.ui.add(basemapGallery, 'top-right');
    
    // Adicionar um widget de expansão para a galeria de mapas base
    const bgExpand = new ExpandModule.default({
      view: mapView,
      content: basemapGallery,
      expandIcon: 'basemap'
    });
    
    // Adicionar o widget de expansão ao mapa
    mapView.ui.add(bgExpand, 'top-right');
    
    // Aguardar a visualização do mapa ser carregada
    await mapView.when();
    
    console.log('Mapa ArcGIS carregado com sucesso!');
  } catch (error) {
    console.error('Erro ao carregar o mapa ArcGIS:', error);
  }
};

// Inicializar o mapa quando o componente for montado
onMounted(async () => {
  // Configurar o ArcGIS
  configureArcGIS();
  
  // Carregar os estilos CSS do ArcGIS
  await loadArcGISStyles();
  
  // Inicializar o mapa
  await initMap();
});

// Limpar recursos quando o componente for desmontado
onBeforeUnmount(() => {
  if (mapView) {
    mapView.destroy();
  }
});
</script>

<script lang="ts">
export default {
  name: 'ArcGISMap'
}
</script>

<template>
  <div class="arcgis-map-container">
    <div ref="mapDiv" class="arcgis-map"></div>
  </div>
</template>

<style scoped>
.arcgis-map-container {
  width: 100%;
  height: 100%;
  min-height: 400px;
}

.arcgis-map {
  width: 100%;
  height: 100%;
}
</style> 