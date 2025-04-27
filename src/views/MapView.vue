<script setup lang="ts">
import ArcGISMap from '@/components/ArcGISMap.vue';
</script>

<template>
  <div class="map-page">
    <div class="map-header bg-green-700 text-white p-4">
      <h1 class="text-2xl font-bold">Visualização de Mapa</h1>
      <p class="text-sm opacity-80">Usando ArcGIS JavaScript API</p>
    </div>
    
    <div class="map-container h-[calc(100vh-64px)]">
      <ArcGISMap />
    </div>
  </div>
</template>

<style scoped>
.map-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.map-container {
  flex: 1;
  position: relative;
}
</style> 