<template>
  <div class="login-page">
    <!-- Fondo -->
    <div class="login-bg">
      <div class="bg-blur bg-blur--cyan"></div>
      <div class="bg-blur bg-blur--purple"></div>
      <div class="bg-grid"></div>
      <div class="bg-orb orb-1"></div>
      <div class="bg-orb orb-2"></div>
      <div class="bg-orb orb-3"></div>
    </div>

    <div class="login-wrapper">
      <div class="login-container">
        <div class="login-form-container">
          <q-card flat bordered class="login-card">
            <!-- Código inválido -->
            <div v-if="tokenInvalido" class="card-header-section">
              <div class="header-icon-container error">
                <q-icon name="error_outline" size="1.8rem" class="header-icon" />
              </div>
              <h2 class="card-title">Código inválido</h2>
              <p class="card-subtitle">
                El código de recuperación es inválido o ha caducado. Serás redirigido al login...
              </p>
            </div>

            <!-- Código válido -->
            <div v-else class="card-header-section">
              <div class="header-icon-container">
                <q-icon name="lock_reset" size="1.8rem" class="header-icon" />
              </div>
              <h2 class="card-title">Restablecer contraseña</h2>
              <p class="card-subtitle">
                Ingresa tu correo, el código de recuperación y tu nueva contraseña.
              </p>
            </div>

            <div v-if="mensajeExito" class="flex justify-center q-px-lg q-pb-md">
              <div class="status-message success-message">
                <q-icon name="check_circle_outline" />
                <span>{{ mensajeExito }}</span>
              </div>
            </div>

            <div class="form-section">
              <div class="input-group">
                <label class="input-label">Correo Electrónico</label>
                <q-input
                  v-model="resetPasswordValues.email"
                  outlined
                  dense
                  class="premium-input"
                  placeholder="email@example.com"
                  :rules="[
                    (val) => !!val || 'El correo es requerido',
                    (val) => validarEmail(val) || 'Formato inválido',
                  ]"
                  @input="sanitizarEmail"
                >
                  <template v-slot:prepend>
                    <q-icon name="alternate_email" class="input-icon" />
                  </template>
                </q-input>
              </div>

              <label class="input-label">Código</label>
              <div class="otp-row q-mt-md">
                <q-input
                  v-for="(n, i) in 6"
                  :key="i"
                  ref="inputs"
                  v-model="codigo[i]"
                  maxlength="6"
                  type="text"
                  inputmode="numeric"
                  autocomplete="one-time-code"
                  pattern="[0-9]*"
                  outlined
                  dense
                  class="otp-input"
                  input-class="text-center text-white text-h5"
                  @update:model-value="actualizarCodigo($event, i)"
                  @keydown="manejarTeclaCodigo($event, i)"
                  @paste="pegarCodigo($event, i)"
                />
              </div>
            </div>

            <q-card-section v-if="!tokenInvalido" class="form-section">
              <q-form @submit="submit">
                <div class="input-group">
                  <label class="input-label">Nueva contraseña</label>
                  <q-input
                    v-model="resetPasswordValues.password"
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

                <div v-if="resetPasswordValues.password" class="password-strength-container">
                  <div class="strength-header">Seguridad de la contraseña</div>

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

                <div class="input-group">
                  <label class="input-label">Confirmar nueva contraseña</label>
                  <q-input
                    v-model="resetPasswordValues.confirmarPassword"
                    :type="mostrarConfirmarPassword ? 'text' : 'password'"
                    outlined
                    dense
                    class="premium-input"
                    placeholder="Repite tu contraseña"
                    :rules="[
                      (val) => !!val || 'Confirmar contraseña es requerido',
                      (val) =>
                        val === resetPasswordValues.password || 'Las contraseñas no coinciden',
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

                <q-btn
                  type="submit"
                  label="Verificar"
                  class="submit-btn"
                  size="lg"
                  unelevated
                  :loading="cargando"
                  :disable="!formularioValidado"
                >
                  <template v-slot:loading>
                    <q-spinner class="on-left" />
                    Verificando...
                  </template>
                </q-btn>
              </q-form>
            </q-card-section>
          </q-card>
        </div>

        <div class="page-footer">
          <p>© 2025 Dashboard Logs. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import authService from 'src/services/authService'
import { ref, computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()

const cargando = ref(false)
const tokenInvalido = ref(false)
const mostrarPassword = ref(false)
const mostrarConfirmarPassword = ref(false)
const mensajeExito = ref('')
const codigo = ref(Array(6).fill(''))
const inputs = ref([])

const resetPasswordValues = ref({
  email: typeof route.query.email === 'string' ? route.query.email : '',
  password: '',
  confirmarPassword: '',
})

const validarEmail = (valor) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor || '')

const sanitizarEmail = () => {
  if (!resetPasswordValues.value.email) return

  resetPasswordValues.value.email = resetPasswordValues.value.email
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
}

const obtenerDigitos = (valor) => String(valor ?? '').replace(/\D/g, '').slice(0, 6).split('')

const enfocarInput = (index) => {
  const input = inputs.value[index]

  if (input) {
    nextTick(() => input.focus())
  }
}

const distribuirCodigo = (valor, index = 0) => {
  const digitos = obtenerDigitos(valor)

  if (!digitos.length) {
    codigo.value[index] = ''
    return
  }

  digitos.forEach((digito, offset) => {
    const posicion = index + offset
    if (posicion < codigo.value.length) {
      codigo.value[posicion] = digito
    }
  })

  const siguienteIndex = Math.min(index + digitos.length, codigo.value.length - 1)
  enfocarInput(siguienteIndex)
}

const actualizarCodigo = (valor, index) => {
  distribuirCodigo(valor, index)
}

const manejarTeclaCodigo = (event, index) => {
  const teclasPermitidas = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End']
  const esAtajo = event.ctrlKey || event.metaKey

  if (esAtajo || teclasPermitidas.includes(event.key)) {
    if (event.key === 'Backspace' && !codigo.value[index] && index > 0) {
      codigo.value[index - 1] = ''
      enfocarInput(index - 1)
    }
    return
  }

  if (!/^\d$/.test(event.key)) {
    event.preventDefault()
  }
}

const pegarCodigo = (event, index) => {
  event.preventDefault()
  distribuirCodigo(event.clipboardData?.getData('text') ?? '', index)
}

// Password strength indicators
const indicadores = ref({
  longitud: false,
  simbolos: false,
  mayuscula: false,
  numero: false,
})

const evaluarPassword = () => {
  const { password } = resetPasswordValues.value

  indicadores.value = {
    longitud: password.length >= 8,
    simbolos: /[!-_@#$%^&*(),.?":{}|<>]/.test(password),
    mayuscula: /[A-Z]/.test(password),
    numero: /\d/.test(password),
  }
}

const formularioValidado = computed(() => {
  return (
    validarEmail(resetPasswordValues.value.email) &&
    /^\d{6}$/.test(codigo.value.join('')) &&
    indicadores.value.longitud &&
    indicadores.value.simbolos &&
    indicadores.value.mayuscula &&
    indicadores.value.numero &&
    resetPasswordValues.value.password === resetPasswordValues.value.confirmarPassword
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
    const payload = {
      email: resetPasswordValues.value.email,
      code: codigo.value.join(''),
      newPassword: resetPasswordValues.value.password,
    }

    const response = await authService.resetPassword(payload)

    if (!response.success) {
      const error = new Error(response.message || 'Error al cambiar la contraseña')
      error.status = response.status
      throw error
    }

    mensajeExito.value = `${response.message} ✅`

    $q.notify({
      type: 'positive',
      message: 'Contraseña actualizada correctamente',
      position: 'top',
      timeout: 3000,
    })

    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } catch (error) {
    console.error('Error al restablecer contraseña:', error)

    // Limpiar formulario
    resetPasswordValues.value.password = ''
    resetPasswordValues.value.confirmarPassword = ''

    const errorMessage =
      error.response?.data?.message || error.message || 'Código inválido o caducado'

    mensajeExito.value = ''

    $q.notify({
      type: 'negative',
      message: errorMessage,
      position: 'top',
      timeout: 5000,
    })

    const status = error.response?.status || error.status

    if (status === 401 || status === 404) {
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
$bg-1: #070b14;
$bg-2: #0b1220;
$bg-3: #111827;

$text-main: #ffffff;
$text-soft: rgba(255, 255, 255, 0.72);
$text-muted: rgba(255, 255, 255, 0.5);

$cyan: #22d3ee;
$cyan-strong: #06b6d4;
$purple: #a855f7;
$pink: #ec4899;
$green: #22c55e;
$red: #ef4444;

// === MAIN LAYOUT ===
.login-page {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at top left, rgba(34, 211, 238, 0.08), transparent 24%),
    radial-gradient(circle at bottom right, rgba(168, 85, 247, 0.08), transparent 24%),
    linear-gradient(135deg, $bg-1 0%, $bg-2 45%, $bg-3 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 20px;
}

// === BACKGROUND ===
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

// === CONTENT ===
.login-content-wrapper {
  position: relative;
  z-index: 2;
  width: 100%;
  display: flex;
  justify-content: center;
}

.login-wrapper,
.login-container {
  width: 100%;
  max-width: 560px;
  margin: 0 auto;
}

.login-form-container {
  margin-bottom: 22px;
}

.login-card {
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.035), rgba(255, 255, 255, 0.018));
  border-radius: 26px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.48);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
}

// === HEADER ===
.card-header-section {
  text-align: center;
  padding: 2.2rem 2rem 1rem;
}

.header-icon-container {
  width: 68px;
  height: 68px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.2rem;
  background: linear-gradient(90deg, #7c3aed 0%, #ec4899 55%, #e97132 100%);
  box-shadow: 0 14px 36px rgba(34, 211, 238, 0.18);

  &.error {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(190, 24, 93, 0.95));
    box-shadow: 0 14px 36px rgba(239, 68, 68, 0.18);
  }

  .header-icon {
    color: white;
  }
}

.card-title {
  font-size: 1.9rem;
  font-weight: 800;
  color: $text-main;
  margin: 0 0 0.6rem 0;
  line-height: 1.2;
}

.card-subtitle {
  color: $text-soft;
  font-size: 0.98rem;
  line-height: 1.6;
  margin: 0;
}

// === FORM SECTION ===
.form-section {
  padding: 0 2rem 2rem;
}

.input-group {
  margin-bottom: 1.1rem;
}

.input-label {
  display: block;
  font-weight: 600;
  color: $text-main;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
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

// === PASSWORD STRENGTH ===
.password-strength-container {
  margin: 0.4rem 0 1.2rem;
  padding: 1.1rem 1rem;
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.02));
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.strength-header {
  font-size: 0.9rem;
  font-weight: 700;
  color: $text-main;
  margin-bottom: 0.9rem;
}

.strength-indicators {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.strength-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.88rem;
  color: $text-muted;
  transition: all 0.25s ease;

  &.active {
    color: #86efac;
    font-weight: 600;
  }

  :deep(.q-icon) {
    font-size: 1.05rem;
  }
}

// === STATUS ===
.status-message {
  width: 100%;
  max-width: 460px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.1rem;
  border-radius: 14px;
  font-size: 0.94rem;
  font-weight: 600;

  :deep(.q-icon) {
    font-size: 1.15rem;
  }
}

.success-message {
  background: rgba(34, 197, 94, 0.12);
  color: #bbf7d0;
  border: 1px solid rgba(34, 197, 94, 0.25);
}

// === BUTTON ===
.submit-btn {
  width: 100%;
  height: 56px;
  background: linear-gradient(90deg, #7c3aed 0%, #ec4899 55%, #e97132 100%);
  color: white;
  border-radius: 16px;
  font-weight: 800;
  font-size: 1rem;
  margin-top: 1.35rem;
  transition:
    transform 0.16s ease,
    box-shadow 0.16s ease;
  text-transform: none;
  box-shadow: 0 18px 38px rgba(34, 211, 238, 0.16);

  &:hover:not(.disabled) {
    transform: translateY(-2px);
    box-shadow: 0 20px 44px rgba(34, 211, 238, 0.22);
  }
}

// === FOOTER ===
.page-footer {
  text-align: center;

  p {
    color: rgba(255, 255, 255, 0.55);
    font-size: 0.84rem;
    margin: 0;
    letter-spacing: 0.04em;
  }
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

// === RESPONSIVE ===
@media (max-width: 640px) {
  .login-page {
    padding: 16px;
  }

  .login-wrapper,
  .login-container {
    max-width: 100%;
  }

  .card-header-section {
    padding: 1.9rem 1.35rem 1rem;
  }

  .form-section {
    padding: 0 1.35rem 1.5rem;
  }

  .card-title {
    font-size: 1.65rem;
  }

  .card-subtitle {
    font-size: 0.94rem;
  }

  .strength-indicators {
    grid-template-columns: 1fr;
  }
}

.otp-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex-wrap: nowrap;
}

.otp-input {
  width: 50px;
  :deep(.q-field__control) {
    border-radius: 10px;
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

@media (max-width: 480px) {
  .login-card {
    border-radius: 22px;
  }

  .otp-row {
    gap: 8px;
  }

  .otp-input {
    width: clamp(38px, 12.5vw, 50px);
  }
}
</style>
