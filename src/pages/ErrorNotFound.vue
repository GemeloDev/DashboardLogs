<template>
  <div class="error-page">
    <!-- Fondo -->
    <div class="error-bg">
      <div class="bg-blur bg-blur--cyan"></div>
      <div class="bg-blur bg-blur--purple"></div>
      <div class="bg-grid"></div>
      <div class="bg-orb orb-1"></div>
      <div class="bg-orb orb-2"></div>
      <div class="bg-orb orb-3"></div>
    </div>

    <div class="error-wrapper">
      <q-card flat bordered class="error-card">
        <div class="error-badge">
          <q-icon name="warning_amber" size="18px" color="cyan" />
          <span>Error de navegación</span>
        </div>

        <div class="error-code">404</div>

        <div class="error-title">Oops. No hay nada aquí...</div>

        <div class="error-text">
          La página que intentas abrir no existe, fue movida o la ruta no es válida.
        </div>

        <div class="error-actions">
          <q-btn
            to="/"
            unelevated
            no-caps
            class="home-btn"
            label="Ir al inicio"
            icon="home"
          />
        </div>
      </q-card>
    </div>
  </div>
</template>

<script setup>
//
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

.error-page {
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

.error-bg {
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

.error-wrapper {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 720px;
  display: flex;
  justify-content: center;
}

.error-card {
  width: 100%;
  padding: 2rem 2rem 2.2rem;
  border-radius: 28px;
  text-align: center;
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.035), rgba(255, 255, 255, 0.018));
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.48);
  backdrop-filter: blur(20px);
}

.error-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 999px;
  margin-bottom: 1.4rem;
  color: $text-main;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);

  span {
    font-size: 0.9rem;
    font-weight: 600;
  }
}

.error-code {
  font-size: clamp(5rem, 18vw, 10rem);
  line-height: 0.95;
  font-weight: 900;
  letter-spacing: -0.05em;
  margin-bottom: 1rem;
  background: linear-gradient(90deg, $cyan 0%, $purple 55%, $pink 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.error-title {
  color: $text-main;
  font-size: clamp(1.7rem, 3vw, 2.4rem);
  font-weight: 800;
  line-height: 1.15;
  margin-bottom: 0.9rem;
}

.error-text {
  max-width: 520px;
  margin: 0 auto;
  color: $text-soft;
  font-size: 1rem;
  line-height: 1.7;
}

.error-actions {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
}

.home-btn {
  min-width: 190px;
  height: 54px;
  border-radius: 16px;
  font-size: 1rem;
  font-weight: 800;
  text-transform: none;
  color: white;
  background: linear-gradient(90deg, $cyan-strong 0%, $purple 55%, $pink 100%);
  box-shadow: 0 18px 38px rgba(34, 211, 238, 0.16);
  transition:
    transform 0.16s ease,
    box-shadow 0.16s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 20px 44px rgba(34, 211, 238, 0.22);
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

@media (max-width: 640px) {
  .error-page {
    padding: 16px;
  }

  .error-card {
    padding: 1.6rem 1.2rem 1.8rem;
    border-radius: 22px;
  }

  .error-text {
    font-size: 0.95rem;
  }

  .home-btn {
    width: 100%;
  }
}
</style>
