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
                <q-icon
                  :name="modoRegistro ? 'person_add' : 'login'"
                  size="1.8rem"
                  class="header-icon"
                />
              </div>
              <h2 class="card-title">
                {{ modoRegistro ? 'Crear Cuenta Nueva' : 'Iniciar Sesión' }}
              </h2>
              <p class="card-subtitle">
                {{
                  modoRegistro
                    ? 'Únete a nuestro sistema de monitoreo'
                    : 'Accede a tu panel de control'
                }}
              </p>
            </div>

            <!-- Form section -->
            <q-card-section class="form-section">
              <q-form @submit="onSubmit" class="login-form">
                <!-- Name field (registro only) -->
                <div v-if="modoRegistro" class="input-group">
                  <label class="input-label">Nombre completo</label>
                  <q-input
                    v-model="formData.nombre"
                    outlined
                    dense
                    class="premium-input"
                    placeholder="Ingresa tu nombre completo"
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

                <!-- Email field -->
                <div class="input-group">
                  <label class="input-label">
                    {{ modoRegistro ? 'Correo electrónico' : 'Email o teléfono' }}
                  </label>
                  <q-input
                    v-model="formData.email"
                    outlined
                    dense
                    class="premium-input"
                    :placeholder="modoRegistro ? 'ejemplo@correo.com' : 'Ingresa email o teléfono'"
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
                <div v-if="modoRegistro && formData.password" class="password-strength-container">
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
                <div v-if="modoRegistro" class="input-group">
                  <label class="input-label">Confirmar contraseña</label>
                  <q-input
                    v-model="formData.confirmarPassword"
                    :type="mostrarConfirmarPassword ? 'text' : 'password'"
                    outlined
                    dense
                    class="premium-input"
                    placeholder="Repite tu contraseña"
                    :rules="[
                      (val) => !!val || 'Confirmar contraseña es requerido',
                      (val) => val === formData.password || 'Las contraseñas no coinciden',
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

                <!-- Options section -->
                <div class="options-container">
                  <!-- Remember me (login only) -->
                  <q-checkbox
                    v-if="!modoRegistro"
                    v-model="formData.mantenerSesion"
                    label="Mantener sesión iniciada"
                    class="premium-checkbox"
                  />

                  <!-- Terms (registro only) -->
                  <q-checkbox
                    v-if="modoRegistro"
                    v-model="formData.aceptarTerminos"
                    class="premium-checkbox"
                  >
                    <span class="terms-text">
                      Acepto los
                      <a href="#" class="terms-link">términos y condiciones</a>
                      y la
                      <a href="#" class="terms-link">política de privacidad</a>
                    </span>
                  </q-checkbox>
                </div>

                <!-- Submit button -->
                <q-btn
                  type="submit"
                  :label="modoRegistro ? 'Crear Cuenta' : 'Iniciar Sesión'"
                  class="submit-btn"
                  size="lg"
                  unelevated
                  :loading="cargando"
                  :disable="!formularioValido"
                >
                  <template v-slot:loading>
                    <q-spinner class="on-left" />
                    {{ modoRegistro ? 'Creando cuenta...' : 'Iniciando sesión...' }}
                  </template>
                </q-btn>

                <!-- Status messages -->
                <div v-if="mensajeError" class="status-message error-message">
                  <q-icon name="error_outline" />
                  <span>{{ mensajeError }}</span>
                </div>

                <div v-if="mensajeExito" class="status-message success-message">
                  <q-icon name="check_circle_outline" />
                  <span>{{ mensajeExito }}</span>
                </div>
              </q-form>
            </q-card-section>

            <!-- Card footer -->
            <div class="card-footer-section">
              <div class="mode-toggle">
                <p class="toggle-text">
                  {{ modoRegistro ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?' }}
                  <q-btn
                    :label="modoRegistro ? 'Iniciar Sesión' : 'Crear Cuenta'"
                    flat
                    dense
                    class="toggle-btn"
                    @click="cambiarModo"
                    :disable="cargando"
                  />
                </p>
              </div>

              <!-- Forgot password (login only) -->
              <div v-if="!modoRegistro" class="forgot-password">
                <a
                  href="/login?#/olvide-password"
                  class="forgot-btn"
                >
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import authService from '../services/authService.js'

const router = useRouter()
const $q = useQuasar()

// === REACTIVE STATE ===
const modoRegistro = ref(false)
const cargando = ref(false)
const mostrarPassword = ref(false)
const mostrarConfirmarPassword = ref(false)
const mensajeError = ref('')
const mensajeExito = ref('')

// Form data
const formData = ref({
  email: '',
  password: '',
  confirmarPassword: '',
  nombre: '',
  mantenerSesion: true,
  aceptarTerminos: false,
})

// Password strength indicators
const indicadores = ref({
  longitud: false,
  simbolos: false,
  mayuscula: false,
  numero: false,
})

// === COMPUTED PROPERTIES ===
const formularioValido = computed(() => {
  if (modoRegistro.value) {
    return (
      formData.value.nombre &&
      formData.value.email &&
      formData.value.password &&
      formData.value.confirmarPassword &&
      formData.value.password === formData.value.confirmarPassword &&
      formData.value.aceptarTerminos &&
      validarEmailOTelefono(formData.value.email) &&
      formData.value.password.length >= 8 &&
      indicadores.value.longitud &&
      indicadores.value.simbolos &&
      indicadores.value.mayuscula &&
      indicadores.value.numero
    )
  } else {
    return (
      formData.value.email &&
      formData.value.password &&
      validarEmailOTelefono(formData.value.email) &&
      formData.value.password.length >= 8
    )
  }
})

// === UTILITY FUNCTIONS ===
const validarEmailOTelefono = (valor) => {
  if (!valor) return false

  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (emailRegex.test(valor)) return true

  // Validar teléfono
  const telefonoRegex = /^[+]?[\d\s\-()]{10,}$/
  return telefonoRegex.test(valor.replace(/\s/g, ''))
}

const sanitizarInput = (campo) => {
  if (formData.value[campo]) {
    formData.value[campo] = formData.value[campo].trim()
    // Remover posibles scripts maliciosos
    formData.value[campo] = formData.value[campo]
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
  }
}

const evaluarPassword = () => {
  const { password } = formData.value

  indicadores.value = {
    longitud: password.length >= 8,
    simbolos: /[!-_@#$%^&*(),.?":{}|<>]/.test(password),
    mayuscula: /[A-Z]/.test(password),
    numero: /\d/.test(password),
  }
}

const cambiarModo = () => {
  modoRegistro.value = !modoRegistro.value
  console.log(modoRegistro.value)
  limpiarFormulario()
}

const limpiarFormulario = () => {
  formData.value = {
    email: '',
    password: '',
    confirmarPassword: '',
    nombre: '',
    mantenerSesion: true,
    aceptarTerminos: false,
  }
  mensajeError.value = ''
  mensajeExito.value = ''
  indicadores.value = {
    longitud: false,
    simbolos: false,
    mayuscula: false,
    numero: false,
  }
}

// === MAIN SUBMIT FUNCTION ===
const onSubmit = async () => {
  if (cargando.value) return

  mensajeError.value = ''
  mensajeExito.value = ''
  cargando.value = true

  try {
    // Sanitizar todos los inputs de texto
    Object.keys(formData.value).forEach((campo) => {
      if (typeof formData.value[campo] === 'string') {
        sanitizarInput(campo)
      }
    })

    if (modoRegistro.value) {
      // Lógica de registro usando la API real
      const registroData = {
        name: formData.value.nombre,
        email: formData.value.email,
        password: formData.value.password,
      }

      const registroResult = await authService.register(registroData)

      if (registroResult.success) {
        mensajeExito.value = registroResult.message || 'Cuenta creada exitosamente'

        // Cambiar a modo login después del registro exitoso
        setTimeout(() => {
          modoRegistro.value = false
          formData.value.password = ''
          formData.value.confirmarPassword = ''
          formData.value.nombre = ''
          formData.value.aceptarTerminos = false
          mensajeExito.value = ''

          $q.notify({
            type: 'positive',
            message: 'Cuenta creada exitosamente. Ahora puedes iniciar sesión.',
            position: 'top',
          })
        }, 2000)
      } else {
        // Error en el registro (email duplicado, etc.)
        mensajeError.value = registroResult.message || 'Error al crear la cuenta'
      }
    } else {
      // Lógica de login usando la API real
      const credentials = {
        email: formData.value.email,
        password: formData.value.password,
      }

      const loginResult = await authService.login(credentials, formData.value.mantenerSesion)

      if (loginResult.success) {
        mensajeExito.value = loginResult.message || 'Acceso concedido. Redirigiendo...'

        // Redireccionar al dashboard después del login exitoso
        setTimeout(() => {
          router.push('/dashboard')
        }, 1500)
      } else {
        // Error en el login (credenciales inválidas, etc.)
        mensajeError.value = loginResult.message || 'Credenciales inválidas. Verifica tus datos.'
      }
    }
  } catch (err) {
    console.error('❌ Error en autenticación:', err)
    mensajeError.value = modoRegistro.value
      ? 'Error de conexión al crear la cuenta. Verifica tu conexión a internet.'
      : 'Error de conexión al iniciar sesión. Verifica tu conexión a internet.'
  } finally {
    cargando.value = false
  }
}

// === LIFECYCLE ===
onMounted(() => {
  // Verificar si ya hay una sesión activa
  const savedSession =
    localStorage.getItem('dashboardLogsSession') || sessionStorage.getItem('dashboardLogsSession')

  if (savedSession) {
    try {
      const session = JSON.parse(savedSession)
      if (session.isAuthenticated) {
        console.log('🔐 Sesión existente encontrada, redirigiendo...')
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error al leer sesión guardada:', error)
      localStorage.removeItem('dashboardLogsSession')
      sessionStorage.removeItem('dashboardLogsSession')
    }
  }
})
</script>

<style lang="scss" scoped>
// === PREMIUM COLOR PALETTE ===
$primary: #6366f1;
$primary-dark: #4f46e5;
$primary-light: #a5b4fc;
$secondary: #ec4899;
$secondary-dark: #db2777;
$accent: #14b8a6;
$success: #10b981;
$error: #ef4444;
$warning: #f59e0b;
$background: #0f172a;
$surface: #1e293b;
$surface-light: #334155;
$card: #ffffff;
$text-primary: #1e293b;
$text-secondary: #64748b;
$text-muted: #94a3b8;
$border: #e2e8f0;
$border-focus: #cbd5e1;

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
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
    }
  }

  .brand-text {
    .brand-title {
      font-size: 2.75rem;
      font-weight: 800;
      color: white;
      margin: 0 0 0.5rem 0;
      text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
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
  box-shadow: 0 32px 64px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
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
      filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
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
  padding: 0 2.5rem 1.5rem;
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
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

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

      :deep(.q-field__native) {
        padding: 0 12px;
        font-size: 0.95rem;
        color: $text-primary;
      }

      .input-icon {
        color: $text-secondary;
        transition: color 0.3s ease;
      }

      .visibility-btn {
        color: $text-secondary;

        &:hover {
          color: $primary;
        }
      }
    }
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

  // === OPTIONS ===
  .options-container {
    margin: 2rem 0;

    .premium-checkbox {
      :deep(.q-checkbox__label) {
        color: $text-secondary;
        font-size: 0.95rem;
        line-height: 1.4;
      }

      .terms-text {
        .terms-link {
          color: $primary;
          text-decoration: none;
          font-weight: 500;

          &:hover {
            text-decoration: underline;
            color: $primary-dark;
          }
        }
      }
    }
  }

  // === SUBMIT BUTTON ===
  .submit-btn {
    width: 100%;
    height: 54px;
    background: linear-gradient(135deg, $primary, $primary-dark);
    color: white;
    border-radius: 14px;
    font-weight: 700;
    font-size: 1.05rem;
    margin-top: 1.25rem;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    text-transform: none;
    letter-spacing: 0.5px;

    &:hover:not(.disabled) {
      transform: translateY(-3px);
      box-shadow: 0 12px 35px rgba(99, 102, 241, 0.35);
      background: linear-gradient(135deg, $primary-dark, $primary);
    }

    &:active:not(.disabled) {
      transform: translateY(-1px);
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

  .error-message {
    background: linear-gradient(135deg, #fef2f2, #fee2e2);
    color: $error;
    border: 1px solid #fecaca;
  }

  .success-message {
    background: linear-gradient(135deg, #f0fdf4, #dcfce7);
    color: $success;
    border: 1px solid #bbf7d0;
  }
}

// === CARD FOOTER ===
.card-footer-section {
  padding: 1.5rem 2.5rem 2.5rem;
  text-align: center;

  .mode-toggle {
    .toggle-text {
      color: $text-secondary;
      margin: 0;
      font-size: 0.95rem;
      line-height: 1.5;

      .toggle-btn {
        color: $primary;
        font-weight: 600;
        text-transform: none;
        margin-left: 0.5rem;

        &:hover {
          color: $primary-dark;
        }
      }
    }
  }

  .forgot-password {
    margin-top: 1.25rem;

    .forgot-btn {
      color: $text-muted;
      font-size: 0.9rem;
      text-transform: none;

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

  .password-strength-container {
    .strength-indicators {
      grid-template-columns: 1fr;
      gap: 0.5rem;
    }
  }
}

@media (max-width: 480px) {
  .login-content-wrapper {
    max-width: 100%;
  }

  .login-card {
    border-radius: 20px;
  }

  .brand-header {
    .brand-text .brand-title {
      font-size: 1.9rem;
    }
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

    .toggle-text,
    .premium-checkbox :deep(.q-checkbox__label) {
      color: rgba(255, 255, 255, 0.75);
    }
  }
}

// === SMOOTH TRANSITIONS ===
* {
  transition: color 0.3s ease, background-color 0.3s ease, border-color 0.3s ease;
}
</style>
