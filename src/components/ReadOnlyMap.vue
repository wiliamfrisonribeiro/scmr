<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import MapView from '@arcgis/core/views/MapView';
import Map from '@arcgis/core/Map';
import TileLayer from '@arcgis/core/layers/TileLayer';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import Polygon from '@arcgis/core/geometry/Polygon';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';

// Interface para as ocorrências
interface Ocorrencia {
  id: number;
  tipo: 'ponto' | 'poligono';
  localizacao?: {
    latitude: number;
    longitude: number;
  };
  coordenadas?: number[][];
  descricao: string;
  data: string;
}

// Referência para o elemento do mapa
const mapDiv = ref<HTMLDivElement | null>(null);
let mapView: MapView | null = null;
let graphicsLayer: GraphicsLayer | null = null;

// Dados de exemplo para as ocorrências
const ocorrencias = ref<Ocorrencia[]>([
  {
    id: 1,
    tipo: 'ponto',
    localizacao: {
      latitude: -23.5505,
      longitude: -46.6333
    },
    descricao: 'Desmatamento em área protegida',
    data: '15/06/2023'
  },
  {
    id: 2,
    tipo: 'poligono',
    coordenadas: [
      [-23.5505, -46.6333],
      [-23.5605, -46.6433],
      [-23.5705, -46.6533],
      [-23.5505, -46.6333]
    ],
    descricao: 'Poluição de rio',
    data: '12/06/2023'
  },
  {
    id: 3,
    tipo: 'ponto',
    localizacao: {
      latitude: -23.5605,
      longitude: -46.6433
    },
    descricao: 'Queimada em área de preservação',
    data: '10/06/2023'
  }
]);

// Inicializar o mapa
const initMap = async () => {
  if (!mapDiv.value) return;

  // Criar o mapa base
  const map = new Map({
    basemap: 'topo-vector'
  });

  // Criar a visualização do mapa
  mapView = new MapView({
    container: mapDiv.value,
    map: map,
    center: [-15.7801, -47.9292], // Centro do Brasil (Brasília)
    zoom: 4 // Zoom mais amplo para ver o Brasil
  });

  // Adicionar camada de gráficos
  graphicsLayer = new GraphicsLayer();
  map.add(graphicsLayer);

  // Adicionar ocorrências ao mapa
  adicionarOcorrencias();
};

// Adicionar ocorrências ao mapa
const adicionarOcorrencias = () => {
  if (!graphicsLayer) return;

  // Limpar gráficos existentes
  graphicsLayer.removeAll();

  // Adicionar cada ocorrência
  ocorrencias.value.forEach(ocorrencia => {
    let graphic: Graphic | undefined;

    if (ocorrencia.tipo === 'ponto' && ocorrencia.localizacao) {
      // Criar ponto
      const point = new Point({
        latitude: ocorrencia.localizacao.latitude,
        longitude: ocorrencia.localizacao.longitude
      });

      // Criar símbolo para o ponto
      const symbol = new SimpleMarkerSymbol({
        color: [255, 0, 0, 0.8],
        size: 12,
        outline: {
          color: [255, 255, 255, 0.8],
          width: 2
        }
      });

      graphic = new Graphic({
        geometry: point,
        symbol: symbol,
        attributes: {
          id: ocorrencia.id,
          descricao: ocorrencia.descricao,
          data: ocorrencia.data
        }
      });
    } else if (ocorrencia.tipo === 'poligono' && ocorrencia.coordenadas) {
      // Criar polígono
      const polygon = new Polygon({
        rings: [ocorrencia.coordenadas]
      });

      // Criar símbolo para o polígono
      const symbol = new SimpleFillSymbol({
        color: [255, 0, 0, 0.3],
        outline: new SimpleLineSymbol({
          color: [255, 0, 0, 0.8],
          width: 2
        })
      });

      graphic = new Graphic({
        geometry: polygon,
        symbol: symbol,
        attributes: {
          id: ocorrencia.id,
          descricao: ocorrencia.descricao,
          data: ocorrencia.data
        }
      });
    }

    if (graphic && graphicsLayer) {
      graphicsLayer.add(graphic);
    }
  });
};

// Inicializar o mapa quando o componente for montado
onMounted(() => {
  initMap();
});

// Limpar recursos quando o componente for desmontado
onUnmounted(() => {
  if (mapView) {
    mapView.destroy();
  }
});
</script>

<template>
  <div ref="mapDiv" class="map-container"></div>
</template>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
}
</style>

<script lang="ts">
export default {
  name: 'ReadOnlyMap'
};
</script> 