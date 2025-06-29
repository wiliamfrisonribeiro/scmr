<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Graphic from '@arcgis/core/Graphic';
import { Polygon } from '@arcgis/core/geometry';
import { SimpleFillSymbol } from '@arcgis/core/symbols';
import Search from "@arcgis/core/widgets/Search.js";
import esriConfig from '@arcgis/core/config';

const props = defineProps<{
  ocorrencias: any[]; // Você pode tipar melhor depois
  selectedOcorrencia?: any; // Ocorrência selecionada para zoom
}>();

const formatDate = (date: string) => {
  if (!date) return '-';
  return new Date(date).toLocaleString('pt-BR');
};

const mapDiv = ref<HTMLDivElement | null>(null);
let mapView: any = null;
let graphicsLayer: any = null;
let polygonGraphics: any[] = [];

// Função para fazer zoom em uma ocorrência específica
const zoomToOcorrencia = (ocorrencia: any) => {
  if (!mapView || !ocorrencia) return;

  // Encontrar o graphic correspondente à ocorrência
  const targetGraphic = polygonGraphics.find(graphic => 
    graphic.attributes.id === ocorrencia.id
  );

  if (targetGraphic && targetGraphic.geometry) {
    // Destacar a ocorrência selecionada
    highlightSelectedOcorrencia(ocorrencia);
    
    mapView.goTo(targetGraphic.geometry, {
      duration: 1000,
      easing: 'ease-in-out',
      padding: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
      }
    }).catch((err: any) => {
      console.warn('Erro ao fazer zoom na ocorrência:', err);
    });
  }
};

// Função para destacar a ocorrência selecionada
const highlightSelectedOcorrencia = (selectedOcorrencia: any) => {
  if (!graphicsLayer) return;

  // Resetar todos os símbolos para o padrão
  polygonGraphics.forEach(graphic => {
    const defaultSymbol = new SimpleFillSymbol({
      color: [227, 139, 79, 0.6],
      outline: {
        color: [255, 255, 255],
        width: 1,
      },
    });
    graphic.symbol = defaultSymbol;
  });

  // Destacar a ocorrência selecionada
  const selectedGraphic = polygonGraphics.find(graphic => 
    graphic.attributes.id === selectedOcorrencia.id
  );

  if (selectedGraphic) {
    const highlightSymbol = new SimpleFillSymbol({
      color: [59, 130, 246, 0.8], // Azul mais vibrante
      outline: {
        color: [59, 130, 246],
        width: 3,
      },
    });
    selectedGraphic.symbol = highlightSymbol;
  }
};

// Observar mudanças na ocorrência selecionada
watch(() => props.selectedOcorrencia, (newOcorrencia) => {
  if (newOcorrencia) {
    zoomToOcorrencia(newOcorrencia);
  }
}, { immediate: true });

onMounted(() => {
  esriConfig.request.useIdentity = false;
  if (!mapDiv.value) return;

  graphicsLayer = new GraphicsLayer();

  const map = new Map({
    basemap: 'osm',
    layers: [graphicsLayer],
  });

  mapView = new MapView({
    container: mapDiv.value,
    map,
    center: [-51.23, -30.02],
    zoom: 7,
  });

  mapView.when(() => {
    polygonGraphics = [];
    props.ocorrencias.forEach((ocorrencia) => {

      let geometryData;

      try {
        geometryData = typeof ocorrencia.location === 'string'
          ? JSON.parse(ocorrencia.location)
          : ocorrencia.location;
      } catch (e) {
        console.warn('Erro ao converter location', ocorrencia.location, e);
        return;
      }

      if (geometryData?.rings) {
        const polygon = new Polygon(geometryData);

        const symbol = new SimpleFillSymbol({
          color: [227, 139, 79, 0.6],
          outline: {
            color: [255, 255, 255],
            width: 1,
          },
        });

        const polygonGraphic = new Graphic({
          geometry: polygon,
          symbol,
          attributes: {
            id: ocorrencia.id, // Adicionar ID para identificação
            tipo: ocorrencia.type || 'Ocorrência sem título',
            descricao: ocorrencia.descricao || 'Sem descrição disponível',
            criadopor: ocorrencia.account_name || 'Sem nome de conta disponível',
            parecer: ocorrencia.opinion || 'Sem parecer disponível',
            respondidopor: ocorrencia.opinion_account_name || 'Não respondido',
            status: ocorrencia.ocurrency_status || 'Pendente',
            created_at: formatDate(ocorrencia.created_date) || 'Sem data de criação disponível',
            updated_at: formatDate(ocorrencia.updated_date) || 'Sem data de atualização disponível',
          },
          popupTemplate: {
            title: '{tipo}',
            content: `
    <p><strong>Descrição:</strong> {descricao}</p>
    <p><strong>Criado por:</strong> {criadopor}</p>
    <p><strong>Parecer:</strong> {parecer}</p>
    <p><strong>Respondido por:</strong> {respondidopor}</p>
    <p><strong>Status:</strong> {status}</p>
    <p><strong>Criado em:</strong> {created_at}</p>
    <p><strong>Atualizado em:</strong> {updated_at}</p>
  `
          }
        });

        graphicsLayer.add(polygonGraphic);
        polygonGraphics.push(polygonGraphic);
      }
    });

    if (polygonGraphics.length > 0) {
      // Se há uma ocorrência selecionada, fazer zoom nela
      if (props.selectedOcorrencia) {
        zoomToOcorrencia(props.selectedOcorrencia);
      } else {
        // Caso contrário, fazer zoom na primeira ocorrência
        mapView.goTo(polygonGraphics[0].geometry,
          {
            duration: 1000, // zoom com animação
            easing: 'ease-in-out'
          }
        ).catch((err: any) => {
          console.warn('Erro ao aplicar goTo nos polígonos:', err);
        });
      }

      const searchWidget = new Search({
        view: mapView
      });

      mapView.ui.add(searchWidget, {
        position: "top-left",
        index: 2
      });
    }
  });
});
</script>

<template>
  <div ref="mapDiv" class="map-container"></div>
</template>

<style scoped>
.map-container {
  width: 100%;
  height: 100vh;
  position: relative;
}
</style>