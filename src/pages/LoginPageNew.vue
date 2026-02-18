<template>
  <div class="login-page">
    <!-- Geometric background pattern -->
    <div class="background-pattern">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
      <div class="shape shape-4"></div>
    </div>

    <!-- Floating elements -->
    <div class="floating-elements">
      <div class="floating-circle circle-1"></div>
      <div class="floating-circle circle-2"></div>
      <div class="floating-circle circle-3"></div>
    </div>

    <!-- Main content wrapper -->
    <div class="login-content-wrapper">
      <div class="login-container">
        <!-- Brand header -->
        <div class="brand-header">
          <div class="brand-logo-container">
            <div class="brand-logo-bg"></div>
            <q-icon name="analytics" size="3.5rem" color="white" class="brand-logo-icon" />
          </div>
          <div class="brand-text">
            <h1 class="brand-title">Dashboard Logs</h1>
            <p class="brand-subtitle">Sistema Inteligente de Monitoreo</p>
          </div>
        </div>

        <!-- Login form card -->
        <div class="login-form-container">
          <q-card class="login-card" flat>
            <!-- Card header -->
            <div class="card-header-section">
              <div class="header-icon-container">
                <q-icon name="login" size="1.8rem" class="header-icon" />
              </div>
              <h2 class="card-title">Iniciar Sesión</h2>
              <p class="card-subtitle">Accede a tu panel de control</p>
            </div>

            <!-- Form section -->
            <q-card-section class="form-section">
              <q-form @submit="onSubmit" class="login-form">
                <!-- Status messages -->
                <div v-if="mensajeError" class="status-message error-message">
                  <q-icon name="error_outline" />
                  <span>{{ mensajeError }}</span>
                </div>

                <div v-if="mensajeExito" class="status-message success-message">
                  <q-icon name="check_circle_outline" />
                  <span>{{ mensajeExito }}</span>
                </div>

                <!-- Email field -->
                <div class="input-group">
                  <label class="input-label">Email o teléfono</label>
                  <q-input
                    v-model="formData.email"
                    outlined
                    dense
                    class="premium-input"
                    placeholder="Ingresa email o teléfono"
                    :rules="[
                      (val) => !!val || 'Este campo es requerido',
                      (val) => validarEmailOTelefono(val) || 'Formato inválido',
                    ]"
                    @input="sanitizarInput('email')"
                  >
                    <template v-slot:prepend>
                      <q-icon name="alternate_email" class="input-icon" />
                    </template>
                  </q-input>
                </div>

                <!-- Password field -->
                <div class="input-group">
                  <label class="input-label">Contraseña</label>
                  <q-input
                    v-model="formData.password"
                    :type="mostrarPassword ? 'text' : 'password'"
                    outlined
                    dense
                    class="premium-input"
                    placeholder="Mínimo 8 caracteres"
                    :rules="[
                      (val) => !!val || 'La contraseña es requerida',
                      (val) => val.length >= 8 || 'Mínimo 8 caracteres',
                    ]"
                    @input="sanitizarInput('password')"
                  >
                    <template v-slot:prepend>
                      <q-icon name="lock" class="input-icon" />
                    </template>
                    <template v-slot:append>
                      <q-btn
                        :icon="mostrarPassword ? 'visibility_off' : 'visibility'"
                        flat
                        dense
                        round
                        size="sm"
                        class="visibility-btn"
                        @click="mostrarPassword = !mostrarPassword"
                      />
                    </template>
                  </q-input>
                </div>

                <!-- Options section -->
                <div class="options-container">
                  <q-checkbox
                    v-model="formData.mantenerSesion"
                    label="Mantener sesión iniciada"
                    class="premium-checkbox"
                  />
                </div>

                <!-- Submit button -->
                <q-btn
                  type="submit"
                  label="Iniciar Sesión"
                  class="submit-btn"
                  size="lg"
                  unelevated
                  :loading="cargando"
                  :disable="!formularioValido"
                >
                  <template v-slot:loading>
                    <q-spinner class="on-left" />
                    Iniciando sesión...
                  </template>
                </q-btn>

                <!-- QR Scanner Section (solo en desktop) -->
                <div v-if="$q.platform.is.desktop" class="qr-scanner-section">
                  <div class="divider-container">
                    <div class="divider-line"></div>
                    <span class="divider-text">O</span>
                    <div class="divider-line"></div>
                  </div>

                  <!-- Estado: QR NO escaneado -->
                  <div v-if="!tenantIdEscaneado" class="qr-pending-state">
                    <q-banner class="qr-info-banner" rounded>
                      <template v-slot:avatar>
                        <q-icon name="info" color="info" />
                      </template>
                      <div class="banner-content">
                        <strong>Escanea tu código QR para continuar</strong>
                        <p>
                          Necesitas escanear el código QR de tu organización antes de iniciar
                          sesión.
                        </p>
                        <p>
                          - Dispositivo con sesión iniciada y acceso al dashboard <br />
                          - Apartado <span class="text-bold">Sesiones</span>
                          <q-icon name="account_circle" color="green" /> <br />
                          - Acceda a la camara y escanea el código QR
                        </p>
                      </div>
                    </q-banner>

                    <div class="flex justify-center">
                      <div
                        id="qrcode-container"
                        class="q-pa-md q-mb-md bg-white shadow-3"
                      ></div>
                    </div>
                  </div>

                  <!-- Estado: QR YA escaneado -->
                  <div v-else class="qr-scanned-state">
                    <q-banner class="qr-success-banner" rounded>
                      <template v-slot:avatar>
                        <q-icon name="check_circle" color="positive" />
                      </template>
                      <div class="banner-content">
                        <strong>✓ Código QR validado</strong>
                      </div>
                      <template v-slot:action>
                        <q-btn
                          @click="regenerateQr()"
                          flat
                          dense
                          icon="refresh"
                          label="Re-escanear"
                          color="primary"
                          size="sm"
                        />
                      </template>
                    </q-banner>
                  </div>
                </div>
              </q-form>
            </q-card-section>

            <!-- Card footer -->
            <div class="card-footer-section">
              <div class="forgot-password">
                <a href="/login?#/olvide-password" class="forgot-btn">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
            </div>
          </q-card>
        </div>

        <!-- Footer -->
        <div class="page-footer">
          <p>© 2025 Dashboard Logs. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import authService from '../services/authService.js'
import { generateNewContent, loadQRCodeLibrary } from 'src/services/qrService.js'
import { disconnectSocket, initializeSocket } from 'src/services/socketService.js'

const router = useRouter()
const $q = useQuasar()

// === REACTIVE STATE ===
const cargando = ref(false)
const mostrarPassword = ref(false)
const mensajeError = ref('')
const mensajeExito = ref('')
const tenantIdEscaneado = ref(null)
const isLoggedIn = ref(false)
const socketInstance = ref(null)

// Estado reactivo del QR
const qrContent = ref('')
const timeRemaining = ref(60)
let intervalId = null
let countdownId = null

// Form data (solo login)
const formData = ref({
  email: '',
  password: '',
  mantenerSesion: true,
})

// === COMPUTED PROPERTIES ===
const formularioValido = computed(() => {
  return (
    formData.value.email &&
    formData.value.password &&
    validarEmailOTelefono(formData.value.email) &&
    formData.value.password.length >= 8
  )
})

// === UTILITY FUNCTIONS ===
const validarEmailOTelefono = (valor) => {
  if (!valor) return false

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (emailRegex.test(valor)) return true

  const telefonoRegex = /^[+]?[\d\s\-()]{10,}$/
  return telefonoRegex.test(valor.replace(/\s/g, ''))
}

const sanitizarInput = (campo) => {
  if (formData.value[campo]) {
    formData.value[campo] = formData.value[campo].trim()
    formData.value[campo] = formData.value[campo]
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
  }
}

// === MAIN SUBMIT FUNCTION (SOLO LOGIN) ===
const onSubmit = async () => {
  if (cargando.value) return

  mensajeError.value = ''
  mensajeExito.value = ''
  cargando.value = true

  try {
    sanitizarInput('email')
    sanitizarInput('password')

    const credentials = {
      email: formData.value.email,
      password: formData.value.password,
    }

    const loginResult = await authService.login(credentials, formData.value.mantenerSesion)

    if (loginResult.success) {
      mensajeExito.value = loginResult.message || 'Acceso concedido. Redirigiendo...'
      setTimeout(() => router.push('/dashboard'), 1500)
    } else {
      mensajeError.value = loginResult.message || 'Credenciales inválidas. Verifica tus datos.'
    }
  } catch (err) {
    console.error('❌ Error en login:', err)
    mensajeError.value = 'Error de conexión al iniciar sesión. Verifica tu conexión a internet.'
  } finally {
    cargando.value = false
  }
}

// === QR helpers ===
const clearTimers = () => {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
  if (countdownId) {
    clearInterval(countdownId)
    countdownId = null
  }
}

const handleLoginSuccess = (data) => {
  console.log('Data del login por QR: ', data)

  if (data.payload && data.payload.status === 'APPROVED') {
    const buildSession = authService.buildSession(data)

    if (!buildSession.success) {
      $q.notify({
        type: 'negative',
        message: buildSession.message,
        position: 'top',
        timeout: 2000,
      })
      return
    }

    clearTimers()

    const container = document.getElementById('qrcode-container')
    if (container) container.innerHTML = ''

    isLoggedIn.value = true
    tenantIdEscaneado.value = true
    mensajeExito.value = data.payload.message || 'Acceso concedido. Redirigiendo...'

    setTimeout(() => {
      router.push('/dashboard')
    }, 3000)
  }
}

const drawQrCode = async (content) => {
  await loadQRCodeLibrary()

  const container = document.getElementById('qrcode-container')
  if (container) container.innerHTML = ''

  if (window.QRCode && container) {
    new window.QRCode(container, {
      text: content,
      width: 250,
      height: 250,
      colorDark: '#000000',
      colorLight: '#ffffff',
      correctLevel: window.QRCode.CorrectLevel.H,
    })
  } else {
    console.error('La librería qrcode.js no está disponible o el contenedor no existe.')
  }
}

const regenerateQr = async () => {
  // Solo desktop tiene sección QR
  if (!$q.platform.is.desktop) return

  const newContent = await generateNewContent()
  qrContent.value = newContent.url
  await drawQrCode(qrContent.value)

  timeRemaining.value = newContent.expireTime

  socketInstance.value = initializeSocket(
    `qr-login/${newContent.url.split('/qr-login/')[1]}`,
    handleLoginSuccess,
  )
}

const startCountdown = () => {
  countdownId = setInterval(() => {
    timeRemaining.value--
    if (timeRemaining.value < 0) timeRemaining.value = 59
  }, 1000)
}

// === LIFECYCLE ===
onMounted(async () => {
  // Sesión activa
  const savedSession =
    localStorage.getItem('dashboardLogsSession') || sessionStorage.getItem('dashboardLogsSession')

  if (savedSession) {
    try {
      const session = JSON.parse(savedSession)
      if (session.isAuthenticated) {
        router.push('/dashboard')
        return
      }
    } catch (error) {
      console.error('Error al comprobar la sesión: ', error)
      localStorage.removeItem('dashboardLogsSession')
      sessionStorage.removeItem('dashboardLogsSession')
    }
  }

  // Tenant escaneado (si aplica)
  const savedTenantId = localStorage.getItem('qr_tenant_id')
  if (savedTenantId) {
    tenantIdEscaneado.value = savedTenantId
  }

  // Iniciar QR solo en desktop
  if ($q.platform.is.desktop && !isLoggedIn.value) {
    await regenerateQr()
    intervalId = setInterval(regenerateQr, 120000)
    startCountdown()
  }
})

onUnmounted(() => {
  clearTimers()
  disconnectSocket()
})
</script>

<style lang="scss" scoped>
// === PREMIUM COLOR PALETTE ===
$primary: #6366f1;
$primary-dark: #4f46e5;
$primary-light: #a5b4fc;
$secondary: #ec4899;
$accent: #14b8a6;
$success: #10b981;
$error: #ef4444;
$background: #0f172a;
$text-primary: #1e293b;
$text-secondary: #64748b;
$text-muted: #94a3b8;
$border: #e2e8f0;

// === MAIN LAYOUT ===
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, $background 0%, #1e1b4b 30%, #312e81 70%, #4c1d95 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 20px;
}

// === BACKGROUND ELEMENTS ===
.background-pattern {
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: 1;

  .shape {
    position: absolute;
    background: rgba(255, 255, 255, 0.02);
    border-radius: 50%;
    animation: float 25s infinite linear;

    &.shape-1 {
      width: 400px;
      height: 400px;
      top: -200px;
      left: -200px;
      animation-delay: 0s;
    }
    &.shape-2 {
      width: 300px;
      height: 300px;
      top: 20%;
      right: -150px;
      animation-delay: -8s;
    }
    &.shape-3 {
      width: 500px;
      height: 500px;
      bottom: -250px;
      left: 20%;
      animation-delay: -16s;
    }
    &.shape-4 {
      width: 200px;
      height: 200px;
      top: 60%;
      left: -100px;
      animation-delay: -12s;
    }
  }
}

.floating-elements {
  position: absolute;
  inset: 0;
  z-index: 1;

  .floating-circle {
    position: absolute;
    border-radius: 50%;
    background: rgba(99, 102, 241, 0.1);
    animation: pulse 4s infinite ease-in-out;

    &.circle-1 {
      width: 60px;
      height: 60px;
      top: 15%;
      left: 15%;
      animation-delay: 0s;
    }
    &.circle-2 {
      width: 80px;
      height: 80px;
      top: 70%;
      right: 20%;
      animation-delay: -2s;
    }
    &.circle-3 {
      width: 40px;
      height: 40px;
      bottom: 20%;
      left: 70%;
      animation-delay: -1s;
    }
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0) rotate(0deg) scale(1);
  }
  25% {
    transform: translateY(-30px) rotate(90deg) scale(1.05);
  }
  50% {
    transform: translateY(-15px) rotate(180deg) scale(0.95);
  }
  75% {
    transform: translateY(-25px) rotate(270deg) scale(1.02);
  }
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.3;
  }
}

// === CONTENT LAYOUT ===
.login-content-wrapper {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 480px;
}

.login-container {
  width: 100%;
}

// === BRAND HEADER ===
.brand-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2.5rem;
  text-align: center;

  .brand-logo-container {
    position: relative;
    margin-bottom: 1.5rem;

    .brand-logo-bg {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 90px;
      height: 90px;
      background: linear-gradient(135deg, $primary, $secondary);
      border-radius: 22px;
      opacity: 0.95;
      box-shadow: 0 10px 30px rgba(99, 102, 241, 0.3);
    }

    .brand-logo-icon {
      position: relative;
      z-index: 2;
      padding: 25px;
    }
  }

  .brand-text {
    .brand-title {
      font-size: 2.75rem;
      font-weight: 800;
      color: white;
      margin: 0 0 0.5rem 0;
      background: linear-gradient(135deg, #ffffff, #e2e8f0);
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .brand-subtitle {
      font-size: 1.15rem;
      color: rgba(255, 255, 255, 0.85);
      margin: 0;
      font-weight: 400;
    }
  }
}

// === FORM CARD ===
.login-form-container {
  margin-bottom: 2rem;
}

.login-card {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(30px);
  border-radius: 28px;
  box-shadow: 0 32px 64px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

// === CARD HEADER ===
.card-header-section {
  text-align: center;
  padding: 2.5rem 2.5rem 1.5rem;

  .header-icon-container {
    width: 72px;
    height: 72px;
    background: linear-gradient(135deg, $primary, $primary-dark);
    border-radius: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
    box-shadow: 0 8px 25px rgba(99, 102, 241, 0.25);

    .header-icon {
      color: white;
    }
  }

  .card-title {
    font-size: 1.9rem;
    font-weight: 700;
    color: $text-primary;
    margin: 0 0 0.75rem 0;
    line-height: 1.2;
  }

  .card-subtitle {
    color: $text-secondary;
    margin: 0;
    font-size: 1rem;
    line-height: 1.4;
  }
}

// === FORM SECTION ===
.form-section {
  padding: 0 2.5rem;
}

.login-form {
  .input-group {
    margin-bottom: 1.75rem;

    .input-label {
      display: block;
      font-weight: 600;
      color: $text-primary;
      margin-bottom: 0.75rem;
      font-size: 0.95rem;
    }

    .premium-input {
      :deep(.q-field__control) {
        border-radius: 14px;
        background: #f8fafc;
        border: 2px solid $border;
        min-height: 50px;
        transition: all 0.3s ease;

        &:hover {
          border-color: $primary-light;
          background: #ffffff;
        }
      }

      :deep(.q-field--focused .q-field__control) {
        border-color: $primary;
        background: #ffffff;
        box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
      }

      .input-icon {
        color: $text-secondary;
      }

      .visibility-btn {
        color: $text-secondary;

        &:hover {
          color: $primary;
        }
      }
    }
  }

  .options-container {
    margin: 2rem 0;

    .premium-checkbox {
      :deep(.q-checkbox__label) {
        color: $text-secondary;
        font-size: 0.95rem;
      }
    }
  }

  .submit-btn {
    width: 100%;
    height: 54px;
    background: linear-gradient(135deg, $primary, $primary-dark);
    color: white;
    border-radius: 14px;
    font-weight: 700;
    font-size: 1.05rem;
    margin-top: 1.25rem;
    transition: all 0.3s ease;
    text-transform: none;

    &:hover:not(.disabled) {
      transform: translateY(-3px);
      box-shadow: 0 12px 35px rgba(99, 102, 241, 0.35);
    }
  }

  .qr-scanner-section {
    margin-top: 1.5rem;
  }

  .divider-container {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;

    .divider-line {
      flex: 1;
      height: 1px;
      background: linear-gradient(90deg, transparent, $border, transparent);
    }

    .divider-text {
      font-size: 0.875rem;
      color: $text-secondary;
      font-weight: 500;
    }
  }

  .qr-info-banner {
    background: linear-gradient(135deg, #eff6ff, #dbeafe);
    border: 1px solid #bfdbfe;
    border-radius: 14px;
    margin-bottom: 1rem;
    padding: 1rem 1.25rem;
  }

  .qr-success-banner {
    background: linear-gradient(135deg, #f0fdf4, #dcfce7);
    border: 1px solid #86efac;
    border-radius: 14px;
    padding: 1rem 1.25rem;
  }

  .status-message {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 1.25rem;
    border-radius: 12px;
    font-size: 0.95rem;
    font-weight: 500;
  }

  .error-message {
    background: linear-gradient(135deg, #fef2f2, #fee2e2);
    color: $error;
    border: 1px solid #fecaca;
    margin: 0 0 1rem;
  }

  .success-message {
    background: linear-gradient(135deg, #f0fdf4, #dcfce7);
    color: $success;
    border: 1px solid #bbf7d0;
    margin-bottom: 1.25rem;
  }
}

// === CARD FOOTER ===
.card-footer-section {
  padding: 1.5rem 2.5rem 2.5rem;
  text-align: center;

  .forgot-password {
    margin-top: 0.5rem;

    .forgot-btn {
      color: $text-muted;
      font-size: 0.9rem;

      &:hover {
        color: $text-secondary;
      }
    }
  }
}

// === PAGE FOOTER ===
.page-footer {
  text-align: center;

  p {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.85rem;
    margin: 0;
    font-weight: 400;
  }
}

// === RESPONSIVE DESIGN ===
@media (max-width: 640px) {
  .login-page {
    padding: 16px;
  }

  .brand-header {
    margin-bottom: 2rem;

    .brand-text .brand-title {
      font-size: 2.2rem;
    }
  }

  .form-section {
    padding: 0 2rem 1.5rem;
  }

  .card-header-section {
    padding: 2rem 2rem 1rem;

    .card-title {
      font-size: 1.6rem;
    }
  }

  .card-footer-section {
    padding: 1.25rem 2rem 2rem;
  }
}

@media (max-width: 480px) {
  .login-content-wrapper {
    max-width: 100%;
  }

  .login-card {
    border-radius: 20px;
  }

  .brand-header .brand-text .brand-title {
    font-size: 1.9rem;
  }
}

// === DARK MODE SUPPORT ===
body.body--dark {
  .login-card {
    background: rgba(30, 41, 59, 0.98);

    .card-header-section {
      .card-title {
        color: white;
      }

      .card-subtitle {
        color: rgba(255, 255, 255, 0.75);
      }
    }

    .input-label {
      color: white;
    }

    .premium-input :deep(.q-field__control) {
      background: rgba(51, 65, 85, 0.6);
      border-color: rgba(71, 85, 105, 0.6);
      color: white;
    }
  }
}
</style>
