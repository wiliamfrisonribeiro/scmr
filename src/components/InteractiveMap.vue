<template>
  <div ref="mapViewEl" class="map-container"></div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import esriConfig from '@arcgis/core/config'
import Map from '@arcgis/core/Map'
import MapView from '@arcgis/core/views/MapView'
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer'
import Home from '@arcgis/core/widgets/Home'
import Sketch from '@arcgis/core/widgets/Sketch'

const emit = defineEmits(['point-added', 'polygon-added']);

// ✅ Sua API Key
esriConfig.apiKey = 'AAPTxy8BH1VEsoebNVZXo8HurGmqqIlr3TBprlsff3Mud5GOjsXtvQaQaJyhnOKZ07m3xrQhk6R6SRuVvQ8q9wJ4Pjd4XFufKKct8Jt3JhlNbH9rpzxoqRxKjFCNhFdL3HFerQyLsYDUirkfe6-4WktboS0iiecgZpqu-3iHJIBbGPWqOtLnuvKdq-PbQSOwN6V28DusnChUNi21eqm19XwZGhWKkt6aigaDBrUrZgYmHSY.AT1_YjOrnQiE'

const mapViewEl = ref(null)

onMounted(() => {
  const graphicsLayer = new GraphicsLayer()

  const map = new Map({
    basemap: 'topo-vector',
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
      if (event.state === 'complete') {
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
  })
})

function geometryToGeoJSON(geometry) {
  
  if (!geometry) {
    console.warn('geometryToGeoJSON: geometria inválida')
    return null
  }

  try {
    const geojson = toGeoJSON(geometry)
    return geojson
  } catch (error) {
    console.error('Erro ao converter geometria para GeoJSON:', error)
    return null
  }
}
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

