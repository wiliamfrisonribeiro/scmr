<script setup lang="ts">
import { ref, onMounted } from 'vue';

const canInstall = ref(false);
const deferredPrompt = ref<any>(null);

onMounted(() => {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt.value = e;
    canInstall.value = true;
  });

  window.addEventListener('appinstalled', () => {
    canInstall.value = false;
    deferredPrompt.value = null;
  });
});

const installPWA = async () => {
  if (!deferredPrompt.value) return;
  
  deferredPrompt.value.prompt();
  const { outcome } = await deferredPrompt.value.userChoice;
  
  if (outcome === 'accepted') {
    console.log('Usuário aceitou a instalação do PWA');
  } else {
    console.log('Usuário recusou a instalação do PWA');
  }
  
  deferredPrompt.value = null;
  canInstall.value = false;
};
</script>

<template>
  <div v-if="canInstall" class="fixed bottom-4 right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg">
    <p class="mb-2">Instale o SMRC no seu dispositivo!</p>
    <button 
      @click="installPWA"
      class="bg-white text-green-600 px-4 py-2 rounded hover:bg-green-50 transition-colors"
    >
      Instalar
    </button>
  </div>
</template> 