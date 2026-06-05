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
            <!-- Card header -->
            <div class="card-header-section">
              <div class="header-icon-container">
                <q-icon name="check" size="1.8rem" class="header-icon" />
              </div>
              <h2 class="card-title">Veríficar Cuenta</h2>
              <p class="card-subtitle">Proporciona el código que te hicimos llegar por correo.</p>
            </div>
            <!-- Form section -->
            <q-card-section class="form-section">
              <q-form @submit="submit" class="login-form">
                <!-- Name field (registro only) -->
                <div class="input-group">
                  <label class="input-label">Ingrese el Código: </label>
                </div>
                <div class="row justify-center q-gutter-sm">
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
                    input-class="text-center text-h5"
                    @update:model-value="actualizarCodigo($event, i)"
                    @keydown="manejarTeclaCodigo($event, i)"
                    @paste="pegarCodigo($event, i)"
                  />
                </div>
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
import { ref, computed, nextTick } from 'vue'

const codigo = ref(Array(6).fill(''))
const inputs = ref([])
const cargando = ref(false)

const formularioValidado = computed(() => {
  return /^\d{6}$/.test(codigo.value.join(''))
})

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

const submit = () => {
  cargando.value = true
  console.log(codigo.value.join(''))
}

</script>

<style lang="scss" scoped>
$primary: #6366f1;
$primary-dark: #4f46e5;
$text-primary: #1e293b;
$text-secondary: #64748b;
$background: #0f172a;

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
  0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
  25% { transform: translateY(-30px) rotate(90deg) scale(1.05); }
  50% { transform: translateY(-15px) rotate(180deg) scale(0.95); }
  75% { transform: translateY(-25px) rotate(270deg) scale(1.02); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.2); opacity: 0.3; }
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
  padding: 2rem;

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
