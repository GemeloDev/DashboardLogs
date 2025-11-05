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
                <q-icon name="arrow_forward" size="1.8rem" class="header-icon" />
              </div>
              <h2 class="card-title">Recuperar Cuenta</h2>
              <p class="card-subtitle"><span class="text-bold">¿No recuerdas tu contraseña?</span> <br> Proporciona tu correo en el siguiente campo para continuar con el proceso de recuperación.</p>
            </div>
            <!-- Form section -->
            <q-card-section class="form-section">
              <q-form @submit="submit" class="login-form">
                <!-- Email field -->
                <div class="input-group">
                  <label class="input-label">
                    Correo Electrónico:
                  </label>
                  <q-input
                    v-model="email"
                    outlined
                    dense
                    class="premium-input"
                    placeholder="ejemplo@correo.com"
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
                <!-- Submit button -->
                <q-btn
                  type="submit"
                  label="Obtener Correo"
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

            <!-- Card footer -->
            <div class="card-footer-section">
              <!-- Forgot password (login only) -->
              <div class="forgot-password">
                <a
                  href="/login"
                  class="forgot-btn"
                >
                  ¿Ya tienes una cuenta? Inicia Sesión
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
import { ref, computed } from 'vue'

const codigo = ref(Array(6).fill(''))
const cargando = ref(false)
const email = ref('')

const formularioValidado = computed(() => {
  return ( validarEmailOTelefono(email.value) )
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


const submit = () => {
  cargando.value = true
  console.log(codigo.value.join(''))
}

</script>

<style lang="scss" scoped>
$primary: #6366f1;
$primary-dark: #4f46e5;
$primary-light: #a5b4fc;
$text-primary: #1e293b;
$text-secondary: #64748b;
$text-muted: #94a3b8;
$border: #e2e8f0;

// === MAIN LAYOUT ===
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 30%, #312e81 70%, #4c1d95 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
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

.premium-input {
  :deep(.q-field__control) {
    border-radius: 12px;
    background: #f8fafc;
    border: 2px solid $border;
    min-height: 46px;
    transition: all 0.3s ease;

    &:hover {
      border-color: $primary-light;
      background: #ffffff;
    }
  }

  :deep(.q-field--focused .q-field__control) {
    border-color: $primary;
    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
  }

  :deep(.q-field__native) {
    padding: 0 12px;
    font-size: 0.95rem;
    color: $text-primary;
  }

  .input-icon {
    color: $text-secondary;
  }
}

// === SUBMIT BUTTON ===
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

// === CARD FOOTER ===
.card-footer-section {
  padding: 1.5rem 2rem 2rem;
  text-align: center;

  .forgot-password {
    margin-top: 1rem;

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
  }
}

// === RESPONSIVE DESIGN ===
@media (max-width: 640px) {
  .form-section {
    padding: 0 1.5rem 1.25rem;
  }

  .card-header-section {
    padding: 1.75rem 1.5rem 1rem;

    .card-title {
      font-size: 1.5rem;
    }
  }
}
</style>

