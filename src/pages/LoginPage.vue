<template>
  <div class="login-page">
    <!-- Fondo -->
    <div class="login-bg">
      <div class="bg-grid"></div>
      <div class="bg-orb orb-1"></div>
      <div class="bg-orb orb-2"></div>
      <div class="bg-orb orb-3"></div>
    </div>

    <div class="login-wrapper">
      <q-card flat bordered class="login-shell">
        <!-- Lado izquierdo -->
        <div class="login-left">
          <div class="login-left-inner">
            <!-- Header marca -->
            <div class="brand-row">
              <div class="brand-icon-box">
                <q-icon name="terminal" size="24px" color="white" />
              </div>
              <div class="brand-name">Consola Logs</div>
            </div>

            <!-- Título -->
            <div class="hero-copy">
              <h1 class="hero-title">Iniciar Sesión</h1>
              <p class="hero-subtitle">Ingresa tus credenciales para acceder al dashboard.</p>
            </div>

            <!-- Formulario -->
            <q-form @submit="onSubmit" class="login-form">
              <div v-if="mensajeError" class="status-message error-message">
                <q-icon name="error_outline" />
                <span>{{ mensajeError }}</span>
              </div>

              <div v-if="mensajeExito && !tenantIdEscaneado" class="status-message success-message">
                <q-icon name="check_circle_outline" />
                <span>{{ mensajeExito }}</span>
              </div>

              <div class="input-group">
                <label class="input-label">Email</label>
                <q-input
                  v-model="formData.email"
                  outlined
                  dense
                  class="premium-input"
                  placeholder="ejemplo@consola.io"
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

              <div class="password-row">
                <label class="input-label">Contraseña</label>
                <!-- <a href="/login?#/olvide-password" class="forgot-link">
                  ¿Olvidaste tu contraseña?
                </a> -->
              </div>

              <div class="input-group">
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

              <q-btn
                type="submit"
                label="Iniciar Sesión"
                class="submit-btn"
                size="lg"
                unelevated
                :loading="cargando"
                :disable="!formularioValido || cargando"
              >
                <template v-slot:loading>
                  <q-spinner class="on-left" />
                  Iniciando sesión...
                </template>
              </q-btn>
            </q-form>
          </div>
        </div>

        <!-- Línea divisora solo cuando hay panel derecho -->
        <div v-if="showQrPanel" class="shell-divider"></div>

        <!-- Lado derecho -->
        <div v-if="showQrPanel" class="login-right">
          <div class="quick-card">
            <div class="quick-title">Acceso Rápido</div>
            <div class="quick-subtitle">
              {{
                tenantIdEscaneado
                  ? 'El acceso por código fue validado correctamente'
                  : 'Escanea para continuar en móvil'
              }}
            </div>

            <div class="qr-frame-outer">
              <div class="qr-frame-inner">
                <!-- Estado normal: mostrar QR -->
                <div v-if="!tenantIdEscaneado" id="qrcode-container" class="qrcode-box"></div>

                <!-- Estado éxito: ocultar QR y mostrar mensaje -->
                <div v-else class="qr-success-state">
                  <div class="qr-success-icon">
                    <q-icon name="check_circle" size="72px" color="positive" />
                  </div>

                  <div class="qr-success-title">Escaneo correcto</div>
                  <div class="qr-success-text">Tu organización fue validada correctamente.</div>

                  <div class="qr-success-chip">
                    <q-icon name="verified" size="16px" class="q-mr-xs" />
                    QR aprobado
                  </div>
                </div>
              </div>
            </div>

            <div class="quick-steps">
              <div class="quick-step">
                <q-icon
                  :name="tenantIdEscaneado ? 'check_circle' : 'qr_code_scanner'"
                  :color="tenantIdEscaneado ? 'positive' : 'cyan'"
                  size="18px"
                />
                <span>
                  {{
                    tenantIdEscaneado
                      ? 'Código QR validado correctamente'
                      : 'Abre la app de Consola Logs'
                  }}
                </span>
              </div>

              <div class="quick-step">
                <q-icon name="verified_user" color="positive" size="18px" />
                <span>
                  {{
                    tenantIdEscaneado
                      ? 'Redirigiendo al dashboard'
                      : 'Verifica tu identidad biométrica'
                  }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </q-card>

      <div class="page-footer">
        <p>© 2025 Dashboard Logs Santoro</p>
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

const cargando = ref(false)
const mostrarPassword = ref(false)
const mensajeError = ref('')
const mensajeExito = ref('')
const tenantIdEscaneado = ref(null)
const isLoggedIn = ref(false)
const socketInstance = ref(null)

const qrContent = ref('')
const timeRemaining = ref(60)
let intervalId = null
let countdownId = null

const formData = ref({
  email: '',
  password: '',
  mantenerSesion: true,
})

const formularioValido = computed(() => {
  return (
    formData.value.email &&
    formData.value.password &&
    validarEmailOTelefono(formData.value.email) &&
    formData.value.password.length >= 8
  )
})

// Mostrar QR en no-móvil: desktop + tablet
const showQrPanel = computed(() => !$q.platform.is.mobile)

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

    console.log(loginResult)

    if (loginResult.success) {
      if (loginResult.mustChangePassword) return router.push('/new-password')
      mensajeExito.value = loginResult.message || 'Acceso concedido. Redirigiendo...'
      setTimeout(() => router.push('/'), 1500)
    } else {
      mensajeError.value = loginResult.message || 'Credenciales inválidas. Verifica tus datos.'
      cargando.value = false
    }
  } catch (err) {
    console.error('❌ Error en login:', err)
    mensajeError.value = 'Error de conexión al iniciar sesión. Verifica tu conexión a internet.'
    cargando.value = false
  }
}

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

const handleLoginSuccess = async (data) => {
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

    const targetRoute =
      authService.getAllowedFlow(authService.userEmail) === 'santoro'
        ? '/santoro/empresas'
        : '/client/escritorio'

    setTimeout(() => {
      router.push(targetRoute)
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
      width: 225,
      height: 225,
      colorDark: '#000000',
      colorLight: '#ffffff',
      correctLevel: window.QRCode.CorrectLevel.H,
    })
  } else {
    console.error('La librería qrcode.js no está disponible o el contenedor no existe.')
  }
}

const regenerateQr = async () => {
  if (!showQrPanel.value || tenantIdEscaneado.value) return

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

onMounted(async () => {
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

  const savedTenantId = localStorage.getItem('qr_tenant_id')
  if (savedTenantId) {
    tenantIdEscaneado.value = savedTenantId
  }

  if (showQrPanel.value && !isLoggedIn.value && !tenantIdEscaneado.value) {
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
$bg-1: #070b14;
$bg-2: #0b1220;
$bg-3: #111827;
$panel: rgba(255, 255, 255, 0.04);
$panel-soft: rgba(255, 255, 255, 0.03);
$border: rgba(255, 255, 255, 0.08);
$text-main: #ffffff;
$text-soft: rgba(255, 255, 255, 0.72);
$text-muted: rgba(255, 255, 255, 0.5);
$cyan: #22d3ee;
$cyan-strong: #06b6d4;
$purple: #a855f7;
$pink: #ec4899;
$green: #22c55e;
$red: #ef4444;

.login-page {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at top left, rgba(233, 114, 50, 0.329), transparent 20%),
    radial-gradient(circle at bottom right, rgba(233, 114, 50, 0.24), transparent 18%),
    linear-gradient(135deg, #000000 0%, #030303 50%, #090909 100%);
  background-attachment: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 20px;
}

.login-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 38px 38px;
  mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.65), transparent 95%);
}

.bg-blur {
  position: absolute;
  border-radius: 999px;
  filter: blur(90px);
  opacity: 0.2;
}

.bg-blur--cyan {
  width: 320px;
  height: 320px;
  background: $cyan;
  top: -60px;
  left: -60px;
}

.bg-blur--purple {
  width: 360px;
  height: 360px;
  background: $purple;
  right: -100px;
  bottom: -90px;
}

.bg-orb {
  position: absolute;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  animation: floatY 9s ease-in-out infinite;
}

.orb-1 {
  width: 78px;
  height: 78px;
  top: 14%;
  left: 10%;
}
.orb-2 {
  width: 58px;
  height: 58px;
  top: 24%;
  right: 12%;
  animation-delay: -2s;
}
.orb-3 {
  width: 92px;
  height: 92px;
  bottom: 12%;
  left: 18%;
  animation-delay: -5s;
}

.login-wrapper {
  position: relative;
  z-index: 2;
  width: min(100%, 1120px);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.login-shell {
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) 1px minmax(340px, 0.92fr);
  min-height: 680px;
  border-radius: 26px;
  overflow: hidden;
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.035), rgba(255, 255, 255, 0.018));
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.48);
  backdrop-filter: blur(20px);
}

.login-left {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 48px;
}

.login-left-inner {
  width: 100%;
  max-width: 560px;
}

.brand-row {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 36px;
}

.brand-icon-box {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, rgba(233, 113, 50, 0.95), rgba(236, 72, 153, 0.82));
  box-shadow: 0 14px 36px rgba(34, 211, 238, 0.18);
}

.brand-name {
  color: $text-main;
  font-size: 1.9rem;
  font-weight: 700;
}

.hero-copy {
  margin-bottom: 28px;
}

.hero-title {
  margin: 0 0 10px 0;
  color: $text-main;
  font-size: 2.7rem;
  line-height: 1.05;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.hero-subtitle {
  margin: 0;
  color: $text-soft;
  font-size: 1.06rem;
  line-height: 1.7;
}

.login-form {
  width: 100%;
}

.input-group {
  margin-bottom: 18px;
}

.input-label {
  display: block;
  margin-bottom: 10px;
  color: $text-main;
  font-size: 0.96rem;
  font-weight: 600;
}

.password-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
  margin-bottom: 10px;
  gap: 12px;
}

.forgot-link {
  color: $cyan;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;

  &:hover {
    color: lighten($cyan, 8%);
  }
}

.premium-input {
  :deep(.q-field__control) {
    border-radius: 16px;
    background: rgba(0, 0, 0, 0.35);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: white;
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease,
      background 0.2s ease;
  }

  :deep(.q-field__native),
  :deep(.q-field__input) {
    color: white;
  }

  :deep(.q-field__native::placeholder),
  :deep(input::placeholder) {
    color: rgba(255, 255, 255, 0.35);
  }

  :deep(.q-field__control:hover) {
    border-color: rgba(34, 211, 238, 0.2);
    background: rgba(0, 0, 0, 0.42);
  }

  :deep(.q-field--focused .q-field__control) {
    border-color: rgba(34, 211, 238, 0.55);
    box-shadow: 0 0 0 4px rgba(34, 211, 238, 0.08);
  }

  :deep(.q-field__marginal) {
    color: rgba(255, 255, 255, 0.55);
  }
}

.input-icon,
.visibility-btn {
  color: rgba(255, 255, 255, 0.55);
}

.submit-btn {
  width: 100%;
  height: 58px;
  margin-top: 10px;
  border-radius: 16px;
  font-size: 1.04rem;
  font-weight: 800;
  text-transform: none;
  color: white;
  background: linear-gradient(135deg, rgba(233, 113, 50, 0.95), rgba(236, 72, 153, 0.82));
  box-shadow: 0 18px 38px rgba(34, 211, 238, 0.16);
  transition:
    transform 0.16s ease,
    box-shadow 0.16s ease;

  &:hover:not(.disabled) {
    transform: translateY(-2px);
    box-shadow: 0 20px 44px rgba(34, 211, 238, 0.22);
  }
}

.shell-divider {
  width: 1px;
  background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.12), transparent);
}

.login-right {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 34px;
}

.quick-card {
  width: 100%;
  max-width: 320px;
  padding: 28px 24px 24px;
  border-radius: 22px;
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02));
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 20px 44px rgba(0, 0, 0, 0.35);
  text-align: center;
}

.quick-title {
  color: $text-main;
  font-size: 1.65rem;
  font-weight: 800;
  margin-bottom: 8px;
}

.quick-subtitle {
  color: $text-soft;
  font-size: 0.96rem;
  margin-bottom: 22px;
  min-height: 44px;
}

.qr-frame-outer {
  padding: 10px;
  border-radius: 18px;
  border: 2px solid var(--santoro);
  box-shadow:
    0 0 0 1px rgba(34, 211, 238, 0.1),
    0 0 24px rgba(34, 211, 238, 0.08);
  margin-bottom: 22px;
}

.qr-frame-inner {
  border-radius: 12px;
  background: #f5f5f5;
  padding: 14px;
  min-height: 248px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qrcode-box {
  min-height: 220px;
  min-width: 220px;
  background: white;
  border-radius: 10px;
  display: block;
  margin: 0 auto;
}

.qr-success-state {
  width: 220px;
  min-height: 220px;
  border-radius: 16px;
  background: linear-gradient(180deg, #ffffff 0%, #eefbf4 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 18px;
  text-align: center;
}

.qr-success-icon {
  margin-bottom: 12px;
}

.qr-success-title {
  color: #0f172a;
  font-size: 1.2rem;
  font-weight: 800;
  margin-bottom: 6px;
}

.qr-success-text {
  color: #475569;
  font-size: 0.92rem;
  line-height: 1.45;
  margin-bottom: 12px;
}

.qr-success-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(34, 197, 94, 0.12);
  color: #15803d;
  border: 1px solid rgba(34, 197, 94, 0.24);
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 0.82rem;
  font-weight: 700;
}

.quick-steps {
  display: flex;
  flex-direction: column;
  gap: 14px;
  text-align: left;
}

.quick-step {
  display: flex;
  align-items: center;
  gap: 10px;
  color: $text-soft;
  font-size: 0.92rem;
}

.page-footer {
  text-align: center;
  margin-top: 24px;

  p {
    margin: 0;
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.84rem;
    letter-spacing: 0.08em;
  }
}

.status-message {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0.95rem 1rem;
  border-radius: 14px;
  font-size: 0.94rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.error-message {
  background: rgba(239, 68, 68, 0.12);
  color: #fecaca;
  border: 1px solid rgba(239, 68, 68, 0.28);
}

.success-message {
  background: rgba(34, 197, 94, 0.12);
  color: #bbf7d0;
  border: 1px solid rgba(34, 197, 94, 0.25);
}

@keyframes floatY {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-12px);
  }
}

@media (max-width: 1100px) {
  .login-shell {
    grid-template-columns: minmax(0, 1fr) 1px minmax(300px, 0.88fr);
    min-height: 620px;
  }

  .hero-title {
    font-size: 2.3rem;
  }

  .login-left,
  .login-right {
    padding: 32px 26px;
  }
}

@media (max-width: 768px) {
  .login-page {
    padding: 18px 14px;
  }

  .login-shell {
    grid-template-columns: 1fr;
    min-height: auto;
  }

  .shell-divider,
  .login-right {
    display: none;
  }

  .login-left {
    padding: 28px 20px;
  }

  .brand-name {
    font-size: 1.45rem;
  }

  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .page-footer p {
    letter-spacing: 0.03em;
    line-height: 1.5;
  }
}
</style>
