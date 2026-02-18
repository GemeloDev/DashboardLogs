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
        <!-- Login form card -->
        <div class="login-form-container">
          <q-card class="login-card" flat>
            <!-- Error de token inválido -->
            <div v-if="tokenInvalido" class="card-header-section">
              <div class="header-icon-container error">
                <q-icon name="error_outline" size="1.8rem" class="header-icon" />
              </div>
              <h2 class="card-title">Invitación Inválida</h2>
              <p class="card-subtitle">
                El token de invitación es inválido o ha caducado. Serás redirigido al login...
              </p>
            </div>

            <!-- Card header normal -->
            <div v-else class="card-header-section">
              <div class="header-icon-container">
                <q-icon name="check" size="1.8rem" class="header-icon" />
              </div>
              <h2 class="card-title">Invitación Aceptada</h2>
              <p class="card-subtitle">
                Ingrese su contraseña y un nombre de usuario para acceder.
              </p>
            </div>
            <div v-if="mensajeExito" class="flex justify-center q-pb-md">
              <div class="status-message success-message">
                <q-icon name="check_circle_outline" />
                <span>{{ mensajeExito }}</span>
              </div>
            </div>
            <!-- Form section (solo si token es válido) -->
            <q-card-section v-if="!tokenInvalido" class="form-section">
              <q-form @submit="submit">
                <!-- Name field (registro only) -->
                <div class="input-group">
                  <label class="input-label">Nombre de usuario</label>
                  <q-input
                    v-model="acceptInvitation.name"
                    outlined
                    dense
                    class="premium-input"
                    placeholder="Ingresa un nombre de usuario válido"
                    :rules="[
                      (val) => !!val || 'El nombre es requerido',
                      (val) => val.length >= 2 || 'Mínimo 2 caracteres',
                    ]"
                  >
                    <template v-slot:prepend>
                      <q-icon name="person" class="input-icon" />
                    </template>
                  </q-input>
                </div>
                <!-- Password field -->
                <div class="input-group">
                  <label class="input-label">Contraseña</label>
                  <q-input
                    v-model="acceptInvitation.password"
                    :type="mostrarPassword ? 'text' : 'password'"
                    outlined
                    dense
                    class="premium-input"
                    placeholder="Mínimo 8 caracteres"
                    :rules="[
                      (val) => !!val || 'La contraseña es requerida',
                      (val) => val.length >= 8 || 'Mínimo 8 caracteres',
                    ]"
                    @update:model-value="evaluarPassword"
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

                <!-- Password strength (registro only) -->
                <div v-if="acceptInvitation.password" class="password-strength-container">
                  <div class="strength-header">Seguridad de la contraseña:</div>
                  <div class="strength-indicators">
                    <div class="strength-item" :class="{ active: indicadores.longitud }">
                      <q-icon
                        :name="indicadores.longitud ? 'check_circle' : 'radio_button_unchecked'"
                      />
                      <span>8+ caracteres</span>
                    </div>
                    <div class="strength-item" :class="{ active: indicadores.mayuscula }">
                      <q-icon
                        :name="indicadores.mayuscula ? 'check_circle' : 'radio_button_unchecked'"
                      />
                      <span>Mayúscula</span>
                    </div>
                    <div class="strength-item" :class="{ active: indicadores.numero }">
                      <q-icon
                        :name="indicadores.numero ? 'check_circle' : 'radio_button_unchecked'"
                      />
                      <span>Número</span>
                    </div>
                    <div class="strength-item" :class="{ active: indicadores.simbolos }">
                      <q-icon
                        :name="indicadores.simbolos ? 'check_circle' : 'radio_button_unchecked'"
                      />
                      <span>Símbolo</span>
                    </div>
                  </div>
                </div>

                <!-- Confirm password (registro only) -->
                <div class="input-group">
                  <label class="input-label">Confirmar contraseña</label>
                  <q-input
                    v-model="acceptInvitation.confirmarPassword"
                    :type="mostrarConfirmarPassword ? 'text' : 'password'"
                    outlined
                    dense
                    class="premium-input"
                    placeholder="Repite tu contraseña"
                    :rules="[
                      (val) => !!val || 'Confirmar contraseña es requerido',
                      (val) => val === acceptInvitation.password || 'Las contraseñas no coinciden',
                    ]"
                  >
                    <template v-slot:prepend>
                      <q-icon name="lock_outline" class="input-icon" />
                    </template>
                    <template v-slot:append>
                      <q-btn
                        :icon="mostrarConfirmarPassword ? 'visibility_off' : 'visibility'"
                        flat
                        dense
                        round
                        size="sm"
                        class="visibility-btn"
                        @click="mostrarConfirmarPassword = !mostrarConfirmarPassword"
                      />
                    </template>
                  </q-input>
                </div>

                <div class="row justify-center q-gutter-sm"></div>
                <!-- Submit button -->
                <q-btn
                  type="submit"
                  label="Veríficar"
                  class="submit-btn"
                  size="lg"
                  unelevated
                  :loading="cargando"
                  :disable="!formularioValidado"
                >
                  <template v-slot:loading>
                    <q-spinner class="on-left" />
                    Veríficando...
                  </template>
                </q-btn>
              </q-form>
            </q-card-section>
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
import { acceptInvite } from 'src/services/acceptInviteService'
// import authService from 'src/services/authService'
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
// import { generateAndDownloadTenantQR } from 'src/services/qrService'
// import { storeJWTInCookie } from 'src/services/cookieService'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()

const cargando = ref(false)
const token = ref(route.query.token)
const tokenInvalido = ref(false)
const mostrarPassword = ref(false)
const mostrarConfirmarPassword = ref(false)
const mensajeExito = ref('')

const acceptInvitation = ref({
  name: '',
  password: '',
  confirmarPassword: '',
  token: token.value,
})

// Validar token al montar
onMounted(() => {
  if (!token.value) {
    tokenInvalido.value = true
    $q.notify({
      type: 'negative',
      message: '❌ Token de invitación inválido o caducado',
      position: 'top',
      timeout: 5000,
    })

    setTimeout(() => {
      router.push('/login')
    }, 3000)
  }
})

// Validar token al montar
onMounted(() => {
  if (!token.value) {
    tokenInvalido.value = true
    $q.notify({
      type: 'negative',
      message: '❌ Token de invitación inválido o caducado',
      position: 'top',
      timeout: 5000,
    })

    setTimeout(() => {
      router.push('/login')
    }, 3000)
  }
})

// Password strength indicators
const indicadores = ref({
  longitud: false,
  simbolos: false,
  mayuscula: false,
  numero: false,
})

const evaluarPassword = () => {
  const { password } = acceptInvitation.value

  indicadores.value = {
    longitud: password.length >= 8,
    simbolos: /[!-_@#$%^&*(),.?":{}|<>]/.test(password),
    mayuscula: /[A-Z]/.test(password),
    numero: /\d/.test(password),
  }
}

const formularioValidado = computed(() => {
  return (
    acceptInvitation.value.name.length >= 2 &&
    indicadores.value.longitud &&
    indicadores.value.simbolos &&
    indicadores.value.mayuscula &&
    indicadores.value.numero &&
    acceptInvitation.value.password === acceptInvitation.value.confirmarPassword
  )
})

const submit = async () => {
  if (!formularioValidado.value) {
    $q.notify({
      type: 'warning',
      message: 'Por favor completa todos los requisitos de seguridad',
      position: 'top',
    })
    return
  }

  cargando.value = true

  try {
    // Preparar payload con token de la URL
    const payload = {
      token: token.value,
      name: acceptInvitation.value.name,
      password: acceptInvitation.value.password,
    }

    console.log('📤 Enviando invitación:', { token: payload.token, name: payload.name })

    // Aceptar invitación
    const response = await acceptInvite(payload)

    console.log('✅ Respuesta de aceptación:', response)

    // Verificar respuesta exitosa
    if (!response.ok || !response.data) {
      throw new Error(response.message || 'Error al aceptar invitación')
    }

    // Mostrar mensaje de éxito
    mensajeExito.value = `${response.message} ✅`

    $q.notify({
      type: 'positive',
      message: '✅ Usuario activado exitosamente',
      position: 'top',
      timeout: 3000,
    })

    // Generar y descargar QR con tenantId
    // try {
    //   await generateAndDownloadTenantQR(tenantId)
    //   console.log('✅ QR generado y descargado')
    // } catch (qrError) {
    //   console.warn('⚠️ Error al generar QR:', qrError)
    //   // No bloquear el flujo si falla el QR
    // }

    // Redirigir al escritorio
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } catch (error) {
    console.error('❌ Error al aceptar invitación:', error)

    // Limpiar formulario
    acceptInvitation.value.name = ''
    acceptInvitation.value.password = ''
    acceptInvitation.value.confirmarPassword = ''

    // Mostrar error específico
    const errorMessage =
      error.response?.data?.message || error.message || 'Invitación inválida o caducada'

    mensajeExito.value = ''

    $q.notify({
      type: 'negative',
      message: `❌ ${errorMessage}`,
      position: 'top',
      timeout: 5000,
    })

    // Si el token es inválido, redirigir al login
    if (error.response?.status === 401 || error.response?.status === 404) {
      tokenInvalido.value = true
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    }
  } finally {
    cargando.value = false
  }
}
</script>

<style lang="scss" scoped>
$primary: #6366f1;
$primary-dark: #4f46e5;
$text-primary: #1e293b;
$text-secondary: #64748b;
$background: #0f172a;
$border: #e2e8f0;
$success: #10b981;

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
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
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

// === FLOATING ELEMENTS ===
.floating-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
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

// === FORM CARD ===
.login-form-container {
  margin-bottom: 2rem;
}

.login-card {
  background: rgba(255, 255, 255, 0.98);
  border-radius: 20px;
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

// === CARD HEADER ===
.card-header-section {
  text-align: center;
  padding-top: 2rem;

  .header-icon-container {
    width: 64px;
    height: 64px;
    background: linear-gradient(135deg, $primary, $primary-dark);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.25rem;
    box-shadow: 0 8px 25px rgba(99, 102, 241, 0.25);

    .header-icon {
      color: white;
    }
  }

  .card-title {
    font-size: 1.8rem;
    font-weight: 700;
    color: $text-primary;
    margin-bottom: 0.5rem;
  }

  .card-subtitle {
    color: $text-secondary;
    font-size: 0.95rem;
    line-height: 1.4;
  }
}

// === FORM SECTION ===
.form-section {
  padding: 0 2rem 1.5rem;
}

.input-label {
  display: block;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
}

.otp-input {
  width: 50px;
}

// === PASSWORD STRENGTH ===
.password-strength-container {
  margin-top: 1.25rem;
  padding: 1.25rem;
  background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
  border-radius: 14px;
  border: 1px solid $border;

  .strength-header {
    font-size: 0.9rem;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: 1rem;
  }

  .strength-indicators {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;

    .strength-item {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 0.85rem;
      color: $text-secondary;
      transition: all 0.3s ease;

      &.active {
        color: $success;
        font-weight: 500;
      }

      :deep(.q-icon) {
        font-size: 1.1rem;
      }
    }
  }
}

// === STATUS MESSAGES ===
.status-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  margin-top: 1.25rem;
  font-size: 0.95rem;
  font-weight: 500;

  :deep(.q-icon) {
    font-size: 1.2rem;
  }
}

.success-message {
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  color: $success;
  border: 1px solid #bbf7d0;
}

.submit-btn {
  width: 100%;
  height: 52px;
  background: linear-gradient(135deg, $primary, $primary-dark);
  color: white;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  margin-top: 25px;
  transition: all 0.3s ease;
  text-transform: none;

  &:hover:not(.disabled) {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(99, 102, 241, 0.3);
  }
}

// === PAGE FOOTER ===
.page-footer {
  text-align: center;
  p {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.85rem;
    margin: 0;
  }
}

// === RESPONSIVE DESIGN ===
@media (max-width: 480px) {
  .otp-input {
    width: 37px !important;
  }
}
</style>
