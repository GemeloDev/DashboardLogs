/** * Modal de Escaneo de Código QR * Soporta escaneo desde cámara y upload de imagen */
<template>
  <q-dialog v-model="isOpen" @hide="onClose" transition-show="scale" transition-hide="scale">
    <q-card class="qr-scanner-modal">
      <!-- Header -->
      <div class="scanner-shell">
        <div class="modal-header">
          <div class="header-content">
            <div class="scanner-icon">
              <q-icon name="qr_code_scanner" size="26px" color="white" />
            </div>
            <div class="header-text">
              <h3>{{ t('qrScanner.title') }}</h3>
              <p>{{ t('qrScanner.subtitle') }}</p>
            </div>
          </div>
          <q-btn icon="close" flat round dense class="dialog-close-btn" v-close-popup />
        </div>

        <!-- Camera Tab -->
        <div name="camera" class="camera-panel">
          <!-- Advertencia de HTTPS en móviles -->
          <q-banner v-if="isMobile && !isSecureContext" class="secure-warning" rounded dense>
            <template v-slot:avatar>
              <q-icon name="warning" color="orange" />
            </template>
            <strong>{{ t('qrScanner.insecureTitle') }}</strong
            ><br />
            {{ t('qrScanner.insecureBody') }}
          </q-banner>

          <div class="scanner-stage">
            <div class="camera-container" :class="{ 'camera-container--active': cameraActive }">
              <video
                ref="videoElement"
                class="camera-video"
                autoplay
                playsinline
                muted
                webkit-playsinline
              ></video>

              <div v-if="!cameraActive" class="camera-placeholder">
                <div class="placeholder-icon">
                  <q-icon name="videocam_off" size="42px" />
                </div>
                <p class="placeholder-title">{{ t('qrScanner.cameraNotStarted') }}</p>
                <div class="help-section">
                  <p class="hint-text">
                    <q-icon name="smartphone" size="16px" />
                    <strong>{{ t('qrScanner.firstTimeTitle') }}</strong>
                  </p>
                  <p class="hint-text">{{ t('qrScanner.firstTimeStep1') }}</p>
                  <p class="hint-text">{{ t('qrScanner.firstTimeStep2') }}</p>
                  <p class="hint-text">{{ t('qrScanner.firstTimeStep3') }}</p>
                  <q-separator spaced class="hint-separator" />
                  <p class="hint-text-small">
                    {{ t('qrScanner.firstTimeHint') }}
                  </p>
                </div>
              </div>

              <!-- Overlay de escaneo -->
              <div v-if="cameraActive" class="scan-overlay">
                <div class="scan-frame">
                  <span class="corner corner--top-left"></span>
                  <span class="corner corner--top-right"></span>
                  <span class="corner corner--bottom-left"></span>
                  <span class="corner corner--bottom-right"></span>
                  <span class="scan-line"></span>
                </div>
                <p class="scan-instruction">{{ t('qrScanner.scanInstruction') }}</p>
              </div>

              <!-- Loading -->
              <div v-if="scanning && !cameraActive" class="scan-loading">
                <q-spinner-dots size="50px" color="cyan" />
                <p>{{ t('qrScanner.scanning') }}</p>
              </div>
            </div>
          </div>

          <!-- Controles de cámara -->
          <div class="scanner-bottom-sheet">
            <div class="scanner-status">
              <q-icon :name="cameraActive ? 'center_focus_strong' : 'qr_code_2'" size="20px" />
              <span>{{
                cameraActive ? t('qrScanner.scanInstruction') : t('qrScanner.footerInfo')
              }}</span>
            </div>

            <div class="camera-controls">
              <q-btn
                v-if="!cameraActive"
                @click="startCamera"
                icon="videocam"
                :label="t('qrScanner.startCamera')"
                size="lg"
                unelevated
                no-caps
                :loading="initializingCamera"
                class="start-camera-btn"
              />
              <q-btn
                v-else
                @click="stopCamera"
                icon="videocam_off"
                :label="t('qrScanner.stopCamera')"
                size="lg"
                flat
                no-caps
                class="stop-camera-btn"
              />
            </div>
          </div>
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
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
const { t } = useI18n()

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
    socketInstance.value = initializeSocket()
  },
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

        let errorMessage = t('qrScanner.cameraAccessError')

        if (error.name === 'NotSecureContextError') {
          errorMessage = t('qrScanner.secureContextError')
        } else if (error.name === 'NotAllowedError') {
          errorMessage = t('qrScanner.permissionDeniedError')
        } else if (error.name === 'NotFoundError') {
          errorMessage = t('qrScanner.cameraNotFoundError')
        } else if (error.name === 'NotReadableError') {
          errorMessage = t('qrScanner.cameraBusyError')
        } else if (error.name === 'OverconstrainedError') {
          errorMessage = t('qrScanner.cameraConfigError')
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
              label: t('qrScanner.closeAction'),
              color: 'white',
            },
          ],
        })
        scanning.value = false
        throw error
      },
    )

    cameraActive.value = true
    scanning.value = false
    $q.notify({
      type: 'positive',
      message: t('qrScanner.cameraStarted'),
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
  if (qrData === '') throw new Error(t('qrScanner.emptyQrError'))

  const token = qrData.split('/qr-login/')[1]

  // console.log('ℹ️ Estatus del socket: ', socketInstance.value)
  console.log('ℹ️ Token QR: ', token)

  const payload = {
    qrToken: token,
  }

  const loginByQR = await authService.loginByQR(payload)

  console.log('Respuesta de loginByQR', loginByQR)

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
  disconnectSocket()
  socketInstance.value = null
}
</script>

<style lang="scss" scoped>
$cyan: #22d3ee;
$purple: #7c3aed;
$pink: #ec4899;
$orange: #e97132;
$panel-dark: #0c0503;
$panel-soft: #120904;
$text-soft: rgba(255, 255, 255, 0.72);
$text-muted: rgba(255, 255, 255, 0.52);
$border-soft: rgba(255, 255, 255, 0.08);
$border-warm: rgba(233, 113, 50, 0.16);

.qr-scanner-modal {
  width: min(760px, calc(100vw - 32px));
  max-height: calc(100dvh - 112px);
  color: white;
  overflow: hidden;
  border: 1px solid $border-warm;
  border-radius: 28px;
  background:
    radial-gradient(circle at top right, rgba(233, 113, 50, 0.2), transparent 28%),
    radial-gradient(circle at bottom left, rgba(124, 58, 237, 0.16), transparent 30%),
    linear-gradient(180deg, $panel-soft 0%, $panel-dark 100%);
  box-shadow: 0 28px 64px rgba(0, 0, 0, 0.48);
}

.scanner-shell {
  display: flex;
  flex-direction: column;
  max-height: calc(100dvh - 112px);
  padding: 18px;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: min(960px, 100%);
  margin: 0 auto;
  padding: 8px 0 18px;

  .header-content {
    display: flex;
    gap: 14px;
    align-items: center;
    min-width: 0;
  }

  .header-text {
    min-width: 0;

    h3 {
      margin: 0 0 4px 0;
      font-size: 1.28rem;
      font-weight: 800;
      color: #fff;
      line-height: 1.2;
    }

    p {
      margin: 0;
      color: $text-soft;
      font-size: 0.9rem;
      line-height: 1.35;
    }
  }
}

.scanner-icon {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  background: linear-gradient(90deg, $purple 0%, $pink 55%, $orange 100%);
  box-shadow: 0 16px 34px rgba(233, 113, 50, 0.2);
}

.dialog-close-btn {
  color: rgba(255, 255, 255, 0.72);
  border-radius: 12px;
}

.camera-panel {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 16px;
  width: min(960px, 100%);
  min-height: 0;
  margin: 0 auto;
}

.scanner-stage {
  display: flex;
  justify-content: center;
  min-height: 0;
}

.camera-container {
  position: relative;
  width: 100%;
  max-width: 540px;
  aspect-ratio: 9/16;
  max-height: min(54vh, 620px);
  overflow: hidden;
  border-radius: 30px;
  border: 1px solid $border-warm;
  background: radial-gradient(circle at center, rgba(34, 211, 238, 0.08), transparent 28%), #050505;
  box-shadow:
    0 28px 64px rgba(0, 0, 0, 0.5),
    inset 0 0 0 1px rgba(255, 255, 255, 0.035);
}

.camera-container--active {
  background: #000;
}

.camera-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.camera-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 28px;
  color: white;
  text-align: center;
  background:
    radial-gradient(circle at center, rgba(124, 58, 237, 0.18), transparent 30%),
    linear-gradient(180deg, rgba(18, 9, 4, 0.94), rgba(5, 5, 5, 0.98));

  .help-section {
    width: min(360px, 100%);
    margin-top: 22px;
    padding: 16px;
    border-radius: 18px;
    border: 1px solid $border-soft;
    background: rgba(255, 255, 255, 0.045);
  }

  .hint-text {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin: 8px 0;
    color: $text-soft;
    font-size: 13px;
    line-height: 1.5;
    text-align: left;

    strong {
      color: #fff;
    }
  }

  .hint-text-small {
    margin-top: 12px;
    color: $text-muted;
    font-size: 11px;
    line-height: 1.4;
    text-align: left;
  }
}

.placeholder-icon {
  width: 78px;
  height: 78px;
  border-radius: 24px;
  display: grid;
  place-items: center;
  color: #fff;
  border: 1px solid $border-soft;
  background: linear-gradient(135deg, rgba(34, 211, 238, 0.18), rgba(124, 58, 237, 0.16));
}

.placeholder-title {
  margin: 18px 0 0;
  color: #fff;
  font-size: 1rem;
  font-weight: 800;
}

.hint-separator {
  background: rgba(255, 255, 255, 0.08);
}

.scan-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.scan-frame {
  position: relative;
  width: min(72vw, 300px);
  max-width: 66%;
  aspect-ratio: 1;
  border-radius: 24px;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.46);
}

.corner {
  position: absolute;
  width: 42px;
  height: 42px;
  border-color: #fff;
  filter: drop-shadow(0 0 10px rgba(34, 211, 238, 0.48));
}

.corner--top-left {
  top: 0;
  left: 0;
  border-top: 4px solid;
  border-left: 4px solid;
  border-top-left-radius: 22px;
}

.corner--top-right {
  top: 0;
  right: 0;
  border-top: 4px solid;
  border-right: 4px solid;
  border-top-right-radius: 22px;
}

.corner--bottom-left {
  bottom: 0;
  left: 0;
  border-bottom: 4px solid;
  border-left: 4px solid;
  border-bottom-left-radius: 22px;
}

.corner--bottom-right {
  right: 0;
  bottom: 0;
  border-right: 4px solid;
  border-bottom: 4px solid;
  border-bottom-right-radius: 22px;
}

.scan-line {
  position: absolute;
  left: 18px;
  right: 18px;
  top: 22px;
  height: 2px;
  border-radius: 999px;
  background: linear-gradient(90deg, transparent, $cyan, $orange, transparent);
  box-shadow: 0 0 18px rgba(34, 211, 238, 0.72);
  animation: scan-line 2.1s ease-in-out infinite;
}

@keyframes scan-line {
  0%,
  100% {
    transform: translateY(0);
    opacity: 0.35;
  }
  50% {
    transform: translateY(254px);
    opacity: 1;
  }
}

.scan-instruction {
  position: absolute;
  left: 24px;
  right: 24px;
  bottom: 48px;
  max-width: 360px;
  margin: 0 auto;
  color: white;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.5;
  text-align: center;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.scan-loading {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  background: rgba(0, 0, 0, 0.16);

  p {
    margin-top: 16px;
  }
}

.scanner-bottom-sheet {
  width: min(540px, 100%);
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 14px;
  border-radius: 24px;
  border: 1px solid $border-soft;
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.055), rgba(255, 255, 255, 0.025));
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.28);
}

.scanner-status {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  color: $text-soft;
  font-size: 0.9rem;
  font-weight: 700;
  line-height: 1.35;

  .q-icon {
    flex-shrink: 0;
    color: $cyan;
  }
}

.camera-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;

  .start-camera-btn,
  .stop-camera-btn {
    min-height: 50px;
    min-width: 190px;
    padding: 0 18px;
    border-radius: 16px;
    font-weight: 800;
  }

  .start-camera-btn {
    color: white;
    background: linear-gradient(90deg, $purple 0%, $pink 55%, $orange 100%);
    box-shadow: 0 18px 38px rgba(233, 113, 50, 0.18);
  }

  .stop-camera-btn {
    color: #fca5a5;
    border: 1px solid rgba(239, 68, 68, 0.18);
    background: rgba(239, 68, 68, 0.1);
  }
}

.secure-warning {
  width: min(540px, 100%);
  margin: 0 auto;
  color: #fff;
  border-radius: 18px;
  border: 1px solid rgba(233, 113, 50, 0.24);
  background: rgba(233, 113, 50, 0.14);
}

@media (max-width: 768px) {
  .scanner-shell {
    padding: 14px;
  }

  .modal-header {
    padding-bottom: 14px;
  }

  .scanner-icon {
    width: 46px;
    height: 46px;
    border-radius: 14px;
  }

  .modal-header .header-text {
    h3 {
      font-size: 1.12rem;
    }

    p {
      font-size: 0.82rem;
    }
  }

  .camera-container {
    max-height: 52vh;
    border-radius: 24px;
  }

  .scanner-bottom-sheet {
    flex-direction: column;
    align-items: stretch;
  }

  .camera-controls,
  .camera-controls .start-camera-btn,
  .camera-controls .stop-camera-btn {
    width: 100%;
  }
}

@media (max-width: 420px) {
  .qr-scanner-modal {
    width: calc(100vw - 24px);
    max-height: calc(100dvh - 92px);
    border-radius: 24px;
  }

  .scanner-shell {
    max-height: calc(100dvh - 92px);
  }

  .camera-placeholder {
    padding: 20px;
  }

  .scan-instruction {
    bottom: 30px;
    font-size: 13px;
  }
}
</style>
