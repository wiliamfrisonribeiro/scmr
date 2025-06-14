<template>
  <div ref="mapViewEl" class="map-container"></div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import esriConfig from '@arcgis/core/config'
import Map from '@arcgis/core/Map'
import MapView from '@arcgis/core/views/MapView'
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer'
import Home from '@arcgis/core/widgets/Home'
import Sketch from '@arcgis/core/widgets/Sketch'
import { Polygon } from '@arcgis/core/geometry'
import { SimpleFillSymbol } from '@arcgis/core/symbols'
import Graphic from '@arcgis/core/Graphic'
import Search from "@arcgis/core/widgets/Search.js";


interface Ocorrencia {
  location: string | object;
  type?: string;
  descricao?: string;
  account_name?: string;
  opinion?: string;
  ocurrency_status?: string;
  created_date?: string;
  updated_date?: string;
}

const emit = defineEmits<{
  'point-added': [{ type: string; geometry: string }];
  'polygon-added': [{ type: string; geometry: string }];
}>();

const props = defineProps<{
  ocorrencias?: Ocorrencia[];
}>();

// ✅ Sua API Key
esriConfig.apiKey = 'AAPTxy8BH1VEsoebNVZXo8HurGmqqIlr3TBprlsff3Mud5GOjsXtvQaQaJyhnOKZ07m3xrQhk6R6SRuVvQ8q9wJ4Pjd4XFufKKct8Jt3JhlNbH9rpzxoqRxKjFCNhFdL3HFerQyLsYDUirkfe6-4WktboS0iiecgZpqu-3iHJIBbGPWqOtLnuvKdq-PbQSOwN6V28DusnChUNi21eqm19XwZGhWKkt6aigaDBrUrZgYmHSY.AT1_YjOrnQiE'

const mapViewEl = ref(null)

onMounted(() => {
  const graphicsLayer = new GraphicsLayer()

  const map = new Map({
    basemap: 'osm',
    layers: [graphicsLayer]
  })

  const view = new MapView({
    container: mapViewEl.value,
    map,
    center: [-51.23, -30.03],
    zoom: 12
  })

  view.when(() => {
    const homeWidget = new Home({ view })
    view.ui.add(homeWidget, 'top-left')

    const searchWidget = new Search({
  view: view
});
view.ui.add(searchWidget, 'top-left');

    const sketch = new Sketch({
      layer: graphicsLayer,
      view: view,
      availableCreateTools: ['polygon'],
      creationMode: 'update',
      visibleElements: {
        createTools: {
          point: true,
          polyline: true,
          polygon: true,
          rectangle: false,
          circle: false
        }
      }
    })

    view.ui.add(sketch, 'top-left')

    sketch.on('create', (event) => {
      if (event.state === 'complete' && event.graphic?.geometry) {
        const geometry = event.graphic.geometry;
        const geojson = JSON.stringify(geometry);
        console.log('GeoJSON result:', geojson);

        if (geometry.type === 'point') {
          emit('point-added', {
            type: 'point',
            geometry: geojson
          });
        } else if (geometry.type === 'polygon') {
          emit('polygon-added', {
            type: 'polygon',
            geometry: geojson
          });
        }
      }
    })

    if (props.ocorrencias) {
      props.ocorrencias.forEach(ocorrencia => {
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
              created_at: ocorrencia.created_date || 'Sem data de criação disponível',
              updated_at: ocorrencia.updated_date || 'Sem data de atualização disponível',
            },    
          });

          graphicsLayer.add(polygonGraphic);
        }
      });
    } 
  }); 
})
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  max-width: 100%;
  margin: 0 auto;
}
</style>
