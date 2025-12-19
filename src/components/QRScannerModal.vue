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

      <!-- Camera Tab -->
      <div name="camera" class="camera-panel">
        <!-- Advertencia de HTTPS en móviles -->
        <q-banner v-if="isMobile && !isSecureContext" class="bg-warning text-white" rounded dense>
          <template v-slot:avatar>
            <q-icon name="warning" color="white" />
          </template>
          <strong>⚠️ Conexión no segura</strong><br />
          Los navegadores móviles requieren HTTPS para acceder a la cámara. Te recomendamos usar la
          opción de <strong>subir imagen</strong> o acceder desde una conexión segura.
        </q-banner>

        <div class="camera-container">
          <video
            ref="videoElement"
            class="camera-video"
            autoplay
            playsinline
            muted
            webkit-playsinline
          ></video>

          <div v-if="!cameraActive" class="camera-placeholder">
            <q-icon name="videocam_off" size="64px" color="grey-5" />
            <p>Cámara no iniciada</p>
            <div class="help-section">
              <p class="hint-text">📱 <strong>¿Primera vez?</strong></p>
              <p class="hint-text">1. Presiona "Iniciar Cámara"</p>
              <p class="hint-text">2. Tu navegador pedirá permiso</p>
              <p class="hint-text">3. Selecciona "Permitir"</p>
              <q-separator spaced />
              <p class="hint-text-small">
                Si no funciona, verifica en la configuración de tu navegador que el sitio tenga
                permiso para usar la cámara.
              </p>
            </div>
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
            class="start-camera-btn"
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
      </div>

      <!-- Footer con info -->
      <q-card-section class="modal-footer">
        <q-icon name="info" size="20px" color="info" />
        <span>El código QR contiene el ID del Tenant para autenticación</span>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useQuasar } from 'quasar'
import { startQRScanner } from '../services/qrScannerService.js'
import { disconnectSocket, initializeSocket } from 'src/services/socketService.js'
import authService from 'src/services/authService.js'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

// Detectar si es móvil y si está en contexto seguro (HTTPS)
const isMobile = computed(() => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
})

const isSecureContext = computed(() => {
  return window.isSecureContext || window.location.protocol === 'https:'
})

const emit = defineEmits(['update:modelValue', 'qr-scanned'])

const $q = useQuasar()

const isOpen = ref(props.modelValue)
const cameraActive = ref(false)
const initializingCamera = ref(false)
const scanning = ref(false)
const videoElement = ref(null)
const selectedFile = ref(null)
const imagePreview = ref(null)
let scannerControls = null
let socketInstance = ref(null)

watch(
  () => props.modelValue,
  (val) => {
    isOpen.value = val
    socketInstance.value = initializeSocket();
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
    scanning.value = true

    // Intentar iniciar cámara directamente
    scannerControls = await startQRScanner(
      videoElement.value,
      (qrData) => {
        console.log('✅ QR escaneado:', qrData)
        onQRScanned(qrData)
      },
      (error) => {
        console.error('❌ Error en escáner:', error)

        let errorMessage = 'No se pudo acceder a la cámara'

        if (error.name === 'NotSecureContextError') {
          errorMessage =
            '🔒 Se requiere HTTPS para usar la cámara en móviles. Por favor usa la opción de subir imagen o accede desde https://'
        } else if (error.name === 'NotAllowedError') {
          errorMessage =
            '❌ Permiso de cámara denegado. Por favor permite el acceso en la configuración de tu navegador.'
        } else if (error.name === 'NotFoundError') {
          errorMessage = '❌ No se encontró cámara en tu dispositivo'
        } else if (error.name === 'NotReadableError') {
          errorMessage = '❌ La cámara está siendo usada por otra aplicación'
        } else if (error.name === 'OverconstrainedError') {
          errorMessage = '❌ No se pudo iniciar la cámara con la configuración solicitada'
        } else if (error.message) {
          errorMessage = error.message
        }

        $q.notify({
          type: 'negative',
          message: errorMessage,
          position: 'top',
          timeout: 5000,
          actions: [
            {
              label: 'Cerrar',
              color: 'white',
            },
          ],
        })
        scanning.value = false
        throw error
      }
    )

    cameraActive.value = true
    $q.notify({
      type: 'positive',
      message: '📷 Cámara iniciada correctamente',
      position: 'top',
      timeout: 2000,
    })
  } catch (error) {
    console.error('❌ Error al iniciar cámara:', error)
    scanning.value = false
    cameraActive.value = false
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
 * Callback cuando se escanea un QR
 */
const onQRScanned = async (qrData) => {
  console.log('🎯 QR detectado:', qrData)
  if(qrData === '') throw new Error('QR vacío')

  const token = qrData.split('/qr-login/')[1]

  // console.log('ℹ️ Estatus del socket: ', socketInstance.value)
  console.log('ℹ️ Token QR: ', token)

  const payload = {
    qrToken: token
  }

  const loginByQR = await authService.loginByQR(payload);

  console.log('Respuesta de loginByQR',loginByQR)

  isOpen.value = false
}

/**
 * Limpieza al cerrar
 */
const onClose = () => {
  stopCamera()
  selectedFile.value = null
  imagePreview.value = null

  // Cerrar el socket
  disconnectSocket();
  socketInstance.value = null
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

.scanner-panels {
  flex: 1;
  overflow: auto;
}

.camera-panel {
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
  padding: 20px;
  text-align: center;

  p {
    margin-top: 16px;
    color: #999;
  }

  .help-section {
    margin-top: 24px;
    padding: 16px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    max-width: 320px;
  }

  .hint-text {
    font-size: 13px;
    color: #bbb;
    margin: 8px 0;
    line-height: 1.5;
    text-align: left;

    strong {
      color: #fff;
    }
  }

  .hint-text-small {
    font-size: 11px;
    color: #888;
    margin-top: 12px;
    line-height: 1.4;
    text-align: left;
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
  background: rgba(100, 100, 100, 0.041);
  color: white;

  p {
    margin-top: 16px;
  }
}

.camera-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;

  .start-camera-btn {
    min-width: 200px;
  }

  .alt-btn {
    font-size: 13px;
  }
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

// Banner de advertencia HTTPS
.camera-panel .q-banner {
  margin-bottom: 16px;
}
</style>
