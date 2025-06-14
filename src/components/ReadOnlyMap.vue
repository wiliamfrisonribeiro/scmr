<script setup lang="ts">
import { ref, onMounted } from 'vue';
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
}>();
const formatDate = (date: string) => {
  if (!date) return '-';
  return new Date(date).toLocaleString('pt-BR');
};
const mapDiv = ref<HTMLDivElement | null>(null);

onMounted(() => {
  esriConfig.request.useIdentity = false;
  if (!mapDiv.value) return;

  const graphicsLayer = new GraphicsLayer();

  const map = new Map({
    basemap: 'osm',
    layers: [graphicsLayer],
  });

  const view = new MapView({
    container: mapDiv.value,
    map,
    center: [-51.23, -30.02],
    zoom: 7,
  });



  view.when(() => {
    const polygons: Graphic[] = [];
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
            tipo: ocorrencia.type || 'Ocorrência sem título',
            descricao: ocorrencia.descricao || 'Sem descrição disponível',
            criadopor: ocorrencia.account_name || 'Sem nome de conta disponível',
            parecer: ocorrencia.opinion || 'Sem parecer disponível',
            respondidopor: ocorrencia.opinion || 'Não respondido',
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
        polygons.push(polygonGraphic);
      }
    });

    if (polygons.length > 0) {
      view.goTo(polygons[0].geometry,
        {
          duration: 1000, // zoom com animação
          easing: 'ease-in-out'
        }
      ).catch((err) => {
        console.warn('Erro ao aplicar goTo nos polígonos:', err);
      });

      const searchWidget = new Search({
        view: view
      });

      view.ui.add(searchWidget, {
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