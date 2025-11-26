/**
 * Modal de Escaneo de Código QR
 * Soporta escaneo desde cámara y upload de imagen
 */
<template>
  <q-dialog
    v-model="isOpen"
    @hide="onClose"
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-card class="qr-scanner-modal">
      <!-- Header -->
      <q-card-section class="modal-header">
        <div class="header-content">
          <q-icon name="qr_code_scanner" size="32px" color="primary" />
          <div class="header-text">
            <h3>Escanear Código QR</h3>
            <p>Escanea el QR del Tenant para iniciar sesión</p>
          </div>
        </div>
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <!-- Tabs -->
      <q-tabs v-model="activeTab" class="scanner-tabs" align="justify">
        <q-tab name="camera" icon="videocam" label="Cámara" />
        <q-tab name="upload" icon="upload_file" label="Subir Imagen" />
      </q-tabs>

      <!-- Tab Panels -->
      <q-tab-panels v-model="activeTab" animated class="scanner-panels">
        <!-- Camera Tab -->
        <q-tab-panel name="camera" class="camera-panel">
          <div class="camera-container">
            <video ref="videoElement" class="camera-video" autoplay playsinline></video>

            <div v-if="!cameraActive" class="camera-placeholder">
              <q-icon name="videocam_off" size="64px" color="grey-5" />
              <p>Cámara no iniciada</p>
            </div>

            <!-- Overlay de escaneo -->
            <div v-if="cameraActive" class="scan-overlay">
              <div class="scan-frame"></div>
              <p class="scan-instruction">Coloca el código QR dentro del marco</p>
            </div>

            <!-- Loading -->
            <div v-if="scanning" class="scan-loading">
              <q-spinner-dots size="50px" color="primary" />
              <p>Escaneando...</p>
            </div>
          </div>

          <!-- Controles de cámara -->
          <div class="camera-controls">
            <q-btn
              v-if="!cameraActive"
              @click="startCamera"
              color="primary"
              icon="videocam"
              label="Iniciar Cámara"
              size="lg"
              unelevated
              :loading="initializingCamera"
            />
            <q-btn
              v-else
              @click="stopCamera"
              color="negative"
              icon="videocam_off"
              label="Detener Cámara"
              size="lg"
              flat
            />
          </div>
        </q-tab-panel>

        <!-- Upload Tab -->
        <q-tab-panel name="upload" class="upload-panel">
          <div class="upload-container">
            <q-file
              v-model="selectedFile"
              accept="image/png, image/jpeg, image/jpg, image/webp"
              label="Seleccionar imagen con QR"
              filled
              counter
              max-file-size="5242880"
              @update:model-value="onFileSelected"
              class="file-input"
            >
              <template v-slot:prepend>
                <q-icon name="attach_file" />
              </template>

              <template v-slot:hint> Solo imágenes PNG, JPG, JPEG, WEBP (máx 5MB) </template>
            </q-file>

            <!-- Preview de imagen -->
            <div v-if="imagePreview" class="image-preview">
              <img :src="imagePreview" alt="QR Preview" />
            </div>

            <!-- Drag & Drop Zone -->
            <div
              v-if="!selectedFile"
              @drop.prevent="onFileDrop"
              @dragover.prevent="dragging = true"
              @dragleave="dragging = false"
              :class="['drop-zone', { dragging }]"
            >
              <q-icon name="cloud_upload" size="64px" color="primary" />
              <p class="drop-text">Arrastra y suelta tu imagen aquí</p>
              <p class="drop-hint">o haz clic arriba para seleccionar</p>
            </div>

            <!-- Botón de lectura -->
            <q-btn
              v-if="selectedFile"
              @click="readQRFromFile"
              color="primary"
              icon="qr_code"
              label="Leer Código QR"
              size="lg"
              unelevated
              :loading="readingFile"
              class="read-btn"
            />
          </div>
        </q-tab-panel>
      </q-tab-panels>

      <!-- Footer con info -->
      <q-card-section class="modal-footer">
        <q-icon name="info" size="20px" color="info" />
        <span>El código QR contiene el ID del Tenant para autenticación</span>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import {
  startQRScanner,
  readQRFromFile as readQRService,
  isValidImageFile,
  hasCameraAccess,
} from '../services/qrScannerService.js'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'qr-scanned'])

const $q = useQuasar()

const isOpen = ref(props.modelValue)
const activeTab = ref('camera')
const cameraActive = ref(false)
const initializingCamera = ref(false)
const scanning = ref(false)
const videoElement = ref(null)
const selectedFile = ref(null)
const imagePreview = ref(null)
const readingFile = ref(false)
const dragging = ref(false)
let scannerControls = null

watch(
  () => props.modelValue,
  (val) => {
    isOpen.value = val
  }
)

watch(isOpen, (val) => {
  emit('update:modelValue', val)
  if (!val) {
    stopCamera()
  }
})

/**
 * Inicia la cámara para escanear
 */
const startCamera = async () => {
  try {
    initializingCamera.value = true

    // Verificar acceso a cámara
    const hasCamera = await hasCameraAccess()
    if (!hasCamera) {
      throw new Error('No se encontró cámara disponible')
    }

    scanning.value = true

    scannerControls = await startQRScanner(
      videoElement.value,
      (qrData) => {
        console.log('✅ QR escaneado:', qrData)
        onQRScanned(qrData)
      },
      (error) => {
        console.error('❌ Error en escáner:', error)
        $q.notify({
          type: 'negative',
          message: `Error: ${error.message}`,
          position: 'top',
        })
        scanning.value = false
      }
    )

    cameraActive.value = true
    $q.notify({
      type: 'positive',
      message: '📷 Cámara iniciada',
      position: 'top',
      timeout: 2000,
    })
  } catch (error) {
    console.error('❌ Error al iniciar cámara:', error)
    $q.notify({
      type: 'negative',
      message: error.message || 'No se pudo acceder a la cámara',
      position: 'top',
    })
    scanning.value = false
  } finally {
    initializingCamera.value = false
  }
}

/**
 * Detiene la cámara
 */
const stopCamera = () => {
  if (scannerControls) {
    scannerControls.stop()
    scannerControls = null
  }
  cameraActive.value = false
  scanning.value = false
}

/**
 * Maneja la selección de archivo
 */
const onFileSelected = (file) => {
  if (!file) {
    imagePreview.value = null
    return
  }

  if (!isValidImageFile(file)) {
    $q.notify({
      type: 'warning',
      message: 'Solo se permiten archivos de imagen',
      position: 'top',
    })
    selectedFile.value = null
    return
  }

  // Crear preview
  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreview.value = e.target.result
  }
  reader.readAsDataURL(file)
}

/**
 * Maneja drop de archivos
 */
const onFileDrop = (event) => {
  dragging.value = false
  const files = event.dataTransfer.files
  if (files.length > 0) {
    selectedFile.value = files[0]
    onFileSelected(files[0])
  }
}

/**
 * Lee QR desde archivo
 */
const readQRFromFile = async () => {
  if (!selectedFile.value) return

  try {
    readingFile.value = true
    const qrData = await readQRService(selectedFile.value)
    onQRScanned(qrData)
  } catch (error) {
    console.error('❌ Error al leer QR:', error)
    $q.notify({
      type: 'negative',
      message: error.message || 'No se pudo leer el código QR',
      position: 'top',
    })
  } finally {
    readingFile.value = false
  }
}

/**
 * Callback cuando se escanea un QR
 */
const onQRScanned = (qrData) => {
  console.log('🎯 QR detectado:', qrData)

  $q.notify({
    type: 'positive',
    message: '✅ Código QR leído correctamente',
    position: 'top',
    timeout: 2000,
    icon: 'check_circle',
  })

  emit('qr-scanned', qrData)
  isOpen.value = false
}

/**
 * Limpieza al cerrar
 */
const onClose = () => {
  stopCamera()
  selectedFile.value = null
  imagePreview.value = null
}
</script>

<style lang="scss" scoped>
$primary: #6366f1;
$primary-dark: #4f46e5;
$text-primary: #1e293b;
$text-secondary: #64748b;
$border-color: #e2e8f0;
$bg-light: #f8fafc;

.qr-scanner-modal {
  background: white;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px;
  border-bottom: 1px solid $border-color;

  .header-content {
    display: flex;
    gap: 16px;
    align-items: flex-start;
  }

  .header-text {
    h3 {
      margin: 0 0 4px 0;
      font-size: 20px;
      font-weight: 600;
      color: $text-primary;
    }

    p {
      margin: 0;
      font-size: 14px;
      color: $text-secondary;
    }
  }
}

.scanner-tabs {
  border-bottom: 1px solid $border-color;
}

.scanner-panels {
  flex: 1;
  overflow: auto;
}

.camera-panel,
.upload-panel {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 500px;
}

.camera-container {
  position: relative;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  aspect-ratio: 4/3;
  background: black;
  border-radius: 12px;
  overflow: hidden;
}

.camera-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.camera-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #000;
  color: white;

  p {
    margin-top: 16px;
    color: #999;
  }
}

.scan-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.scan-frame {
  width: 250px;
  height: 250px;
  border: 3px solid $primary;
  border-radius: 12px;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    border-color: $primary;
    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
  }
  50% {
    border-color: #a5b4fc;
    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.3);
  }
}

.scan-instruction {
  margin-top: 280px;
  color: white;
  font-size: 14px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.scan-loading {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  color: white;

  p {
    margin-top: 16px;
  }
}

.camera-controls {
  display: flex;
  justify-content: center;
}

.upload-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
}

.file-input {
  font-size: 16px;
}

.image-preview {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  border: 2px solid $border-color;
  border-radius: 12px;
  overflow: hidden;

  img {
    width: 100%;
    height: auto;
    display: block;
  }
}

.drop-zone {
  border: 3px dashed $border-color;
  border-radius: 12px;
  padding: 60px 40px;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover,
  &.dragging {
    border-color: $primary;
    background: rgba($primary, 0.05);
  }

  .drop-text {
    margin: 16px 0 8px 0;
    font-size: 16px;
    font-weight: 500;
    color: $text-primary;
  }

  .drop-hint {
    margin: 0;
    font-size: 14px;
    color: $text-secondary;
  }
}

.read-btn {
  margin-top: 20px;
}

.modal-footer {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: $bg-light;
  border-top: 1px solid $border-color;
  font-size: 14px;
  color: $text-secondary;
}
</style>
