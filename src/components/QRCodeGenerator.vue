<template>
  <div class="qr-generator">
    <div class="qr-header">
      <h2>QR Code Generator</h2>
      <p class="subtitle">Generate QR codes for any text or URL</p>
    </div>

    <div class="qr-controls">
      <div class="input-container">
        <input
          v-model="text"
          type="text"
          class="text-input"
          placeholder="Enter text or URL..."
          @input="generateQR"
          data-test-id="qrcode-input"
        />
      </div>
    </div>

    <div class="qr-display" v-if="qrCode" data-test-id="qrcode-output">
      <div class="qr-container">
        <QRCodeVue :value="qrCode" :size="200" level="H" />
      </div>
      <button @click="downloadQR" class="download-button" data-test-id="download-btn">Download QR Code</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import QRCodeVue from 'qrcode.vue';

const text = ref('google.com');
const qrCode = ref('google.com');

const generateQR = () => {
  qrCode.value = text.value;
};

const downloadQR = () => {
  const canvas = document.querySelector('canvas');
  if (canvas) {
    const link = document.createElement('a');
    link.download = 'qr-code.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }
};

onMounted(() => {
  generateQR();
});
</script>

<style scoped>
.qr-generator {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.qr-header {
  text-align: center;
  margin-bottom: 2rem;
}

.subtitle {
  color: #a0aec0;
  margin-top: 0.5rem;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
}

.qr-controls {
  margin-bottom: 2rem;
}

.input-container {
  width: 100%;
}

.text-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid var(--border-color);
  border-radius: 4px;
  background: var(--input-bg);
  color: var(--nav-text);
  font-size: 1rem;
  transition: all 0.2s;
}

.text-input::placeholder {
  color: #a0aec0;
}

.qr-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.qr-container {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.download-button {
  padding: 0.75rem 1.5rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.download-button:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .qr-generator {
    padding: 1rem;
  }
}
</style> 