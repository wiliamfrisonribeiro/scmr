<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { configureArcGIS, loadArcGISStyles } from '@/lib/arcgis';
import MapView from '@arcgis/core/views/MapView';
import Map from '@arcgis/core/Map';
import Graphic from '@arcgis/core/Graphic';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Point from '@arcgis/core/geometry/Point';
import Polygon from '@arcgis/core/geometry/Polygon';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import Search from '@arcgis/core/widgets/Search';
import Sketch from '@arcgis/core/widgets/Sketch';
import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel';
import LocatorSearchSource from '@arcgis/core/widgets/Search/LocatorSearchSource';
import Zoom from '@arcgis/core/widgets/Zoom';
import Compass from '@arcgis/core/widgets/Compass';
import Home from '@arcgis/core/widgets/Home';
import Attribution from '@arcgis/core/widgets/Attribution';
import ScaleBar from '@arcgis/core/widgets/ScaleBar';
import Expand from '@arcgis/core/widgets/Expand';
import BasemapGallery from '@arcgis/core/widgets/BasemapGallery';
import BasemapToggle from '@arcgis/core/widgets/BasemapToggle';
import TileLayer from '@arcgis/core/layers/TileLayer';
import VectorTileLayer from '@arcgis/core/layers/VectorTileLayer';
import Basemap from '@arcgis/core/Basemap';
import { Button } from '@/components/ui/button';
import { MapPin, Shapes, Trash2, Maximize2, Minimize2, Layers } from 'lucide-vue-next';

const props = defineProps<{
  onPointAdded?: (point: { x: number; y: number }) => void;
  onPolygonAdded?: (polygon: { rings: number[][][] }) => void;
}>();

const emit = defineEmits<{
  (e: 'pointAdded', point: { x: number; y: number }): void;
  (e: 'polygonAdded', polygon: { rings: number[][][] }): void;
}>();

const mapDiv = ref<HTMLDivElement | null>(null);
const searchDiv = ref<HTMLDivElement | null>(null);
const sketchDiv = ref<HTMLDivElement | null>(null);
const mapContainer = ref<HTMLDivElement | null>(null);
const basemapGalleryDiv = ref<HTMLDivElement | null>(null);
let view: MapView | null = null;
let graphicsLayer: GraphicsLayer | null = null;
let searchWidget: Search | null = null;
let sketchWidget: Sketch | null = null;
let zoomWidget: Zoom | null = null;
let compassWidget: Compass | null = null;
let homeWidget: Home | null = null;
let attributionWidget: Attribution | null = null;
let scaleBarWidget: ScaleBar | null = null;
let basemapGalleryWidget: BasemapGallery | null = null;
let basemapToggleWidget: BasemapToggle | null = null;

// Estado para controlar o modo de desenho
const activeDrawingMode = ref<string | null>(null);
// Estado para controlar o modo de tela cheia
const isFullscreen = ref(false);
// Estado para controlar a visibilidade da galeria de mapas base
const showBasemapGallery = ref(false);

const initMap = async () => {
  if (!mapDiv.value) return;

  // Configurar o mapa
  const map = new Map({
    basemap: 'streets'
  });

  // Criar uma camada de gráficos para os pontos e polígonos
  graphicsLayer = new GraphicsLayer();
  map.add(graphicsLayer);

  // Criar a visualização do mapa
  view = new MapView({
    container: mapDiv.value,
    map: map,
    center: [-46.6333, -23.5505], // São Paulo
    zoom: 12,
    constraints: {
      snapToZoom: false
    }
  });

  // Aguardar o mapa carregar
  await view.when();

  // Inicializar o widget de busca
  if (searchDiv.value) {
    const locator = new LocatorSearchSource({
      url: "https://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer",
      name: "Endereços",
      placeholder: "Ex: Av. Paulista, São Paulo"
    });

    searchWidget = new Search({
      view: view,
      container: searchDiv.value,
      allPlaceholder: "Buscar endereço ou local",
      sources: [locator]
    });
  }

  // Inicializar o widget de desenho
  if (sketchDiv.value) {
    sketchWidget = new Sketch({
      view: view,
      layer: graphicsLayer,
      creationMode: "single",
      defaultCreateOptions: {
        mode: "hybrid"
      },
      defaultUpdateOptions: {
        tool: "reshape"
      }
    });

    // Adicionar eventos para capturar o desenho de polígonos
    sketchWidget.on("create", (event) => {
      if (event.state === "complete") {
        const geometry = event.graphic.geometry;
        
        if (geometry instanceof Polygon) {
          const rings = geometry.rings;
          emit('polygonAdded', { rings });
          if (props.onPolygonAdded) {
            props.onPolygonAdded({ rings });
          }
        } else if (geometry instanceof Point) {
          emit('pointAdded', { x: geometry.longitude, y: geometry.latitude });
          if (props.onPointAdded) {
            props.onPointAdded({ x: geometry.longitude, y: geometry.latitude });
          }
        }
        
        // Desativar o modo de desenho após completar
        activeDrawingMode.value = null;
        if (sketchWidget) {
          sketchWidget.cancel();
        }
      }
    });
  }

  // Adicionar widgets nativos do ArcGIS
  zoomWidget = new Zoom({
    view: view,
    layout: "vertical"
  });
  view.ui.add(zoomWidget, "top-right");

  compassWidget = new Compass({
    view: view
  });
  view.ui.add(compassWidget, "top-right");

  homeWidget = new Home({
    view: view
  });
  view.ui.add(homeWidget, "top-right");

  // Adicionar widget de galeria de mapas base
  if (basemapGalleryDiv.value) {
    basemapGalleryWidget = new BasemapGallery({
      view: view,
      container: basemapGalleryDiv.value
    });
  }

  // Adicionar widget de alternância de mapa base
  basemapToggleWidget = new BasemapToggle({
    view: view,
    nextBasemap: "satellite"
  });
  view.ui.add(basemapToggleWidget, "bottom-right");

  attributionWidget = new Attribution({
    view: view
  });
  view.ui.add(attributionWidget, "bottom-right");

  scaleBarWidget = new ScaleBar({
    view: view,
    unit: "metric"
  });
  view.ui.add(scaleBarWidget, "bottom-left");
};

const addPoint = (point: Point) => {
  if (!graphicsLayer) return;

  // Criar um símbolo para o ponto
  const symbol = new SimpleMarkerSymbol({
    color: [255, 0, 0],
    size: 12,
    outline: {
      color: [255, 255, 255],
      width: 2
    }
  });

  // Criar um gráfico com o ponto e o símbolo
  const graphic = new Graphic({
    geometry: point,
    symbol: symbol
  });

  // Adicionar o gráfico à camada
  graphicsLayer.add(graphic);

  // Emitir o evento com as coordenadas do ponto
  emit('pointAdded', { x: point.longitude, y: point.latitude });
  if (props.onPointAdded) {
    props.onPointAdded({ x: point.longitude, y: point.latitude });
  }
};

const clearPoints = () => {
  if (graphicsLayer) {
    graphicsLayer.removeAll();
  }
};

// Funções para controlar o modo de desenho
const startDrawingPoint = () => {
  if (!sketchWidget) return;
  
  activeDrawingMode.value = 'point';
  sketchWidget.create('point');
};

const startDrawingPolygon = () => {
  if (!sketchWidget) return;
  
  activeDrawingMode.value = 'polygon';
  sketchWidget.create('polygon');
};

const cancelDrawing = () => {
  if (!sketchWidget) return;
  
  activeDrawingMode.value = null;
  sketchWidget.cancel();
};

// Função para alternar o modo de tela cheia usando a API nativa do navegador
const toggleFullscreen = () => {
  if (!mapContainer.value) return;
  
  if (!document.fullscreenElement) {
    // Entrar em tela cheia
    mapContainer.value.requestFullscreen().then(() => {
      isFullscreen.value = true;
    }).catch(err => {
      console.error(`Erro ao entrar em tela cheia: ${err.message}`);
    });
  } else {
    // Sair da tela cheia
    document.exitFullscreen().then(() => {
      isFullscreen.value = false;
    }).catch(err => {
      console.error(`Erro ao sair da tela cheia: ${err.message}`);
    });
  }
};

// Verificar mudanças no estado de tela cheia
const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement;
};

// Função para alternar a visibilidade da galeria de mapas base
const toggleBasemapGallery = () => {
  showBasemapGallery.value = !showBasemapGallery.value;
};

onMounted(async () => {
  configureArcGIS();
  await loadArcGISStyles();
  await initMap();
  
  // Adicionar listener para mudanças no estado de tela cheia
  document.addEventListener('fullscreenchange', handleFullscreenChange);
});

onBeforeUnmount(() => {
  if (view) {
    view.destroy();
  }
  
  // Remover listener de tela cheia
  document.removeEventListener('fullscreenchange', handleFullscreenChange);
});

defineExpose({
  clearPoints
});
</script>

<template>
  <div class="interactive-map-container">
    <div class="map-header">
      <h2 class="text-xl font-bold text-gray-800">Adicionar Pontos e Polígonos no Mapa</h2>
      <p class="text-sm text-gray-600">Use as ferramentas abaixo para adicionar elementos ao mapa</p>
    </div>
    
    <div class="map-tools">
      <div ref="searchDiv" class="search-container"></div>
    </div>
    
    <div ref="mapContainer" class="map-container">
      <div ref="mapDiv" class="map-view"></div>
      
      <!-- Botões de desenho personalizados -->
      <div class="drawing-tools">
        <Button 
          variant="outline" 
          size="sm" 
          class="drawing-button" 
          :class="{ active: activeDrawingMode === 'point' }"
          @click="startDrawingPoint"
        >
          <MapPin class="h-4 w-4" />
          <span>Ponto</span>
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          class="drawing-button" 
          :class="{ active: activeDrawingMode === 'polygon' }"
          @click="startDrawingPolygon"
        >
          <Shapes class="h-4 w-4" />
          <span>Polígono</span>
        </Button>
        
        <Button 
          v-if="activeDrawingMode" 
          variant="destructive" 
          size="sm" 
          class="drawing-button" 
          @click="cancelDrawing"
        >
          <Trash2 class="h-4 w-4" />
          <span>Cancelar</span>
        </Button>
        
        <!-- Botão para alternar a galeria de mapas base -->
        <Button 
          variant="outline" 
          size="sm" 
          class="drawing-button" 
          :class="{ active: showBasemapGallery }"
          @click="toggleBasemapGallery"
        >
          <Layers class="h-4 w-4" />
          <span>Mapas Base</span>
        </Button>
      </div>

      <!-- Galeria de mapas base -->
      <div v-if="showBasemapGallery" class="basemap-gallery-container">
        <div class="basemap-gallery-header">
          <h3 class="text-sm font-medium">Mapas Base</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            class="close-button" 
            @click="toggleBasemapGallery"
          >
            <span class="sr-only">Fechar</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </Button>
        </div>
        <div ref="basemapGalleryDiv" class="basemap-gallery-content"></div>
      </div>

      <!-- Botão de tela cheia personalizado -->
      <div class="fullscreen-button-container">
        <Button 
          variant="outline" 
          size="sm" 
          class="fullscreen-button" 
          @click="toggleFullscreen"
        >
          <Maximize2 v-if="!isFullscreen" class="h-4 w-4" />
          <Minimize2 v-else class="h-4 w-4" />
          <span>{{ isFullscreen ? 'Sair da tela cheia' : 'Tela cheia' }}</span>
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.interactive-map-container {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.map-header {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.map-tools {
  padding: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.search-container {
  width: 100%;
}

.map-container {
  position: relative;
  height: 400px;
}

.map-view {
  height: 100%;
  width: 100%;
}

.drawing-tools {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  padding: 8px;
}

.drawing-button {
  display: flex;
  align-items: center;
  gap: 4px;
  width: 100%;
  justify-content: flex-start;
}

.drawing-button.active {
  background-color: #e5e7eb;
  border-color: #9ca3af;
}

.basemap-gallery-container {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  width: 300px;
  max-height: 400px;
  overflow: hidden;
}

.basemap-gallery-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid #e5e7eb;
}

.basemap-gallery-content {
  padding: 8px;
  max-height: 350px;
  overflow-y: auto;
}

.close-button {
  padding: 0;
  height: 24px;
  width: 24px;
}

.fullscreen-button-container {
  position: absolute;
  bottom: 10px;
  right: 10px;
  z-index: 10;
}

.fullscreen-button {
  display: flex;
  align-items: center;
  gap: 4px;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
</style>

<script lang="ts">
export default {
  name: 'InteractiveMap'
};
</script> 