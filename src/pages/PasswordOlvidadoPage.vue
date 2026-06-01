<template>
  <div class="login-page">
    <div class="login-bg">
      <div class="bg-grid"></div>
      <div class="bg-orb orb-1"></div>
      <div class="bg-orb orb-2"></div>
      <div class="bg-orb orb-3"></div>
    </div>

    <div class="login-wrapper">
      <div class="login-container">
        <div class="login-form-container">
          <q-card class="login-card" flat bordered>
            <div class="card-header-section">
              <div class="header-icon-container">
                <q-icon name="lock_reset" size="1.8rem" class="header-icon" />
              </div>
              <h2 class="card-title">Recuperar Cuenta</h2>
              <p class="card-subtitle">
                Escribe el correo asociado a tu cuenta para continuar con el proceso de
                recuperación.
              </p>
            </div>

            <q-card-section class="form-section">
              <q-form @submit="submit" class="login-form">
                <div v-if="mensajeError" class="status-message error-message">
                  <q-icon name="error_outline" />
                  <span>{{ mensajeError }}</span>
                </div>

                <div v-if="mensajeExito" class="status-message success-message">
                  <q-icon name="check_circle_outline" />
                  <span>{{ mensajeExito }}</span>
                </div>

                <div class="input-group">
                  <label class="input-label">Correo Electrónico</label>
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
                    @input="sanitizarInput"
                  >
                    <template v-slot:prepend>
                      <q-icon name="alternate_email" class="input-icon" />
                    </template>
                  </q-input>
                </div>

                <q-btn
                  type="submit"
                  label="Enviar instrucciones"
                  class="submit-btn"
                  size="lg"
                  unelevated
                  :loading="cargando"
                  :disable="!formularioValidado || cargando"
                >
                  <template v-slot:loading>
                    <q-spinner class="on-left" />
                    Verificando...
                  </template>
                </q-btn>
              </q-form>
            </q-card-section>

            <div class="card-footer-section">
              <router-link to="/login" class="back-link">
                <q-icon name="arrow_back" size="18px" />
                <span>Volver a iniciar sesión</span>
              </router-link>
            </div>
          </q-card>
        </div>

        <div class="page-footer">
          <p>© 2025 Dashboard Logs Santoro</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import authService from '../services/authService'

const cargando = ref(false)
const email = ref('')
const mensajeError = ref('')
const mensajeExito = ref('')

const formularioValidado = computed(() => validarEmailOTelefono(email.value))

const validarEmailOTelefono = (valor) => {
  if (!valor) return false

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (emailRegex.test(valor)) return true

  const telefonoRegex = /^[+]?[\d\s\-()]{10,}$/
  return telefonoRegex.test(valor.replace(/\s/g, ''))
}

const sanitizarInput = () => {
  if (!email.value) return

  email.value = email.value
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
}

const submit = async () => {
  if (cargando.value) return

  sanitizarInput()
  mensajeError.value = ''
  mensajeExito.value = ''

  if (!formularioValidado.value) {
    mensajeError.value = 'Ingresa un correo electrónico válido para continuar.'
    return
  }

  cargando.value = true

  try {
    const result = await authService.forgotPassword(email.value)

    if (!result.success) {
      mensajeError.value =
        result.message || 'Ocurrió un error al enviar las instrucciones. Intenta nuevamente.'
      return
    }

    mensajeExito.value = result.message
  } catch (error) {
    console.error(' Error en reset password:', error)
    mensajeError.value = 'Ocurrió un error al enviar las instrucciones. Intenta nuevamente.'
    return
  } finally {
    cargando.value = false
  }
}
</script>

<style lang="scss" scoped>
$text-main: #ffffff;
$text-soft: rgba(255, 255, 255, 0.72);
$text-muted: rgba(255, 255, 255, 0.5);
$cyan: #22d3ee;

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
  width: 100%;
  display: flex;
  justify-content: center;
}

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
  background: linear-gradient(135deg, rgba(233, 113, 50, 0.95), rgba(236, 72, 153, 0.82));
  box-shadow: 0 14px 36px rgba(34, 211, 238, 0.18);
}

.header-icon {
  color: white;
}

.card-title {
  color: $text-main;
  font-size: 1.9rem;
  font-weight: 800;
  line-height: 1.2;
  margin: 0 0 0.6rem;
}

.card-subtitle {
  color: $text-soft;
  font-size: 0.98rem;
  line-height: 1.6;
  margin: 0;
}

.form-section {
  padding: 0 2rem 1.25rem;
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

.input-icon {
  color: rgba(255, 255, 255, 0.55);
}

.submit-btn {
  width: 100%;
  height: 56px;
  background: linear-gradient(135deg, rgba(233, 113, 50, 0.95), rgba(236, 72, 153, 0.82));
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

.card-footer-section {
  padding: 0 2rem 2rem;
}

.back-link {
  min-height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  color: $cyan;
  text-decoration: none;
  font-size: 0.92rem;
  font-weight: 700;
  border-radius: 14px;
  transition:
    color 0.2s ease,
    background 0.2s ease;

  &:hover {
    color: #3fd4ff;
    background: rgba(34, 211, 238, 0.08);
  }
}

.page-footer {
  text-align: center;

  p {
    color: $text-muted;
    font-size: 0.84rem;
    margin: 0;
    letter-spacing: 0.04em;
  }
}

.status-message {
  width: 100%;
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

@media (max-width: 640px) {
  .login-page {
    padding: 16px;
  }

  .form-section {
    padding: 0 1.35rem 1.25rem;
  }

  .card-header-section {
    padding: 1.9rem 1.35rem 1rem;
  }

  .card-footer-section {
    padding: 0 1.35rem 1.5rem;
  }

  .card-title {
    font-size: 1.65rem;
  }

  .card-subtitle {
    font-size: 0.94rem;
  }
}

@media (max-width: 480px) {
  .login-card {
    border-radius: 22px;
  }
}
</style>
