<template>
  <q-page class="admin-home-page">
    <div class="admin-home-wrap">
      <!-- HERO -->
      <section class="hero-block">
        <div class="hero-left">
          <div class="hero-badge">
            <q-icon name="admin_panel_settings" size="18px" color="cyan" />
            <span>Panel administrativo</span>
          </div>

          <h1 class="hero-title">
            Centro de Control
            <br>
            <span class="color-orange-santoro">Santoro</span>
          </h1>

          <p class="hero-subtitle">
            Administra usuarios, empresas y API Keys desde una consola central con
            visibilidad operativa y accesos rápidos.
          </p>

          <div class="hero-actions">
            <q-btn
              unelevated
              no-caps
              class="hero-btn hero-btn--primary"
              icon="group_add"
              label="Nuevo administrador"
            />
            <q-btn
              unelevated
              no-caps
              class="hero-btn hero-btn--secondary"
              icon="add_business"
              label="Nueva empresa"
            />
          </div>
        </div>

        <div class="hero-right">
          <q-card flat bordered class="hero-side-card">
            <div class="hero-side-top">
              <div class="hero-side-icon">
                <q-icon name="insights" size="22px" />
              </div>
              <div>
                <div class="hero-side-title">Resumen del sistema</div>
                <div class="hero-side-subtitle">Estado general administrativo</div>
              </div>
            </div>

            <div class="hero-side-metrics">
              <div class="mini-metric">
                <div class="mini-metric__label">Usuarios activos</div>
                <div class="mini-metric__value">186</div>
              </div>
              <div class="mini-metric">
                <div class="mini-metric__label">Empresas registradas</div>
                <div class="mini-metric__value">24</div>
              </div>
              <div class="mini-metric">
                <div class="mini-metric__label">API Keys vigentes</div>
                <div class="mini-metric__value">71</div>
              </div>
            </div>
          </q-card>
        </div>
      </section>

      <!-- KPIs -->
      <section class="stats-grid">
        <q-card flat bordered class="stat-card">
          <div class="stat-icon stat-icon--cyan">
            <q-icon name="group" size="24px" />
          </div>
          <div class="stat-body">
            <div class="stat-label">Usuarios</div>
            <div class="stat-value">186</div>
            <div class="stat-foot text-positive">+12 este mes</div>
          </div>
        </q-card>

        <q-card flat bordered class="stat-card">
          <div class="stat-icon stat-icon--warm">
            <q-icon name="apartment" size="24px" />
          </div>
          <div class="stat-body">
            <div class="stat-label">Empresas</div>
            <div class="stat-value">24</div>
            <div class="stat-foot">4 pendientes de revisión</div>
          </div>
        </q-card>

        <q-card flat bordered class="stat-card">
          <div class="stat-icon stat-icon--purple">
            <q-icon name="vpn_key" size="24px" />
          </div>
          <div class="stat-body">
            <div class="stat-label">API Keys</div>
            <div class="stat-value">71</div>
            <div class="stat-foot">9 próximas a expirar</div>
          </div>
        </q-card>
      </section>

      <!-- QUICK MODULES -->
      <section class="modules-grid">
        <q-card flat bordered class="module-card">
          <div class="module-top">
            <div class="module-icon module-icon--cyan">
              <q-icon name="group" size="24px" />
            </div>
            <q-btn flat round dense icon="arrow_forward" class="module-arrow" />
          </div>

          <div class="module-title">Usuarios</div>
          <div class="module-text">
            Alta, edición, roles, permisos y estado de usuarios del sistema.
          </div>

          <div class="module-chips">
            <q-chip dense class="glass-chip chip-info">186 registrados</q-chip>
            <q-chip dense class="glass-chip chip-active">174 activos</q-chip>
          </div>

          <div class="module-actions">
            <q-btn flat no-caps icon="visibility" label="Ver usuarios" class="ghost-btn" />
            <q-btn unelevated no-caps icon="add" label="Crear" class="mini-action-btn" />
          </div>
        </q-card>

        <q-card flat bordered class="module-card">
          <div class="module-top">
            <div class="module-icon module-icon--warm">
              <q-icon name="business" size="24px" />
            </div>
            <q-btn flat round dense icon="arrow_forward" class="module-arrow" />
          </div>

          <div class="module-title">Empresas</div>
          <div class="module-text">
            Administra empresas, estado operativo, relación con usuarios y datos base.
          </div>

          <div class="module-chips">
            <q-chip dense class="glass-chip chip-info">24 empresas</q-chip>
            <q-chip dense class="glass-chip chip-pending">4 pendientes</q-chip>
          </div>

          <div class="module-actions">
            <q-btn flat no-caps icon="visibility" label="Ver empresas" class="ghost-btn" />
            <q-btn unelevated no-caps icon="add_business" label="Crear" class="mini-action-btn warm-btn" />
          </div>
        </q-card>

        <q-card flat bordered class="module-card">
          <div class="module-top">
            <div class="module-icon module-icon--purple">
              <q-icon name="vpn_key" size="24px" />
            </div>
            <q-btn flat round dense icon="arrow_forward" class="module-arrow" />
          </div>

          <div class="module-title">API Keys</div>
          <div class="module-text">
            Controla vigencia, rotación, expiración y seguridad de credenciales del sistema.
          </div>

          <div class="module-chips">
            <q-chip dense class="glass-chip chip-info">71 activas</q-chip>
            <q-chip dense class="glass-chip chip-inactive">9 por expirar</q-chip>
          </div>

          <div class="module-actions">
            <q-btn flat no-caps icon="visibility" label="Ver API Keys" class="ghost-btn" />
            <q-btn unelevated no-caps icon="key" label="Generar" class="mini-action-btn" />
          </div>
        </q-card>
      </section>

      <!-- MAIN CONTENT -->
      <section class="content-grid">
        <!-- ACTIVIDAD RECIENTE -->
        <q-card flat bordered class="panel-card">
          <div class="panel-header">
            <div>
              <div class="panel-title">Actividad reciente</div>
              <div class="panel-subtitle">Movimientos administrativos más recientes</div>
            </div>
            <q-btn flat no-caps label="Ver todo" class="panel-link-btn" />
          </div>

          <div class="timeline-list">
            <div class="timeline-item" v-for="item in recentActivity" :key="item.id">
              <div class="timeline-dot" :class="item.colorClass"></div>

              <div class="timeline-content">
                <div class="timeline-title">{{ item.title }}</div>
                <div class="timeline-text">{{ item.description }}</div>
              </div>

              <div class="timeline-date">{{ item.time }}</div>
            </div>
          </div>
        </q-card>

        <!-- ALERTAS -->
        <q-card flat bordered class="panel-card">
          <div class="panel-header">
            <div>
              <div class="panel-title">Alertas y seguimiento</div>
              <div class="panel-subtitle">Elementos que requieren atención</div>
            </div>
          </div>

          <div class="alerts-list">
            <div class="alert-item">
              <div class="alert-icon alert-icon--warm">
                <q-icon name="warning_amber" size="18px" />
              </div>
              <div class="alert-body">
                <div class="alert-title">API Keys por expirar</div>
                <div class="alert-text">9 claves vencen en los próximos 7 días.</div>
              </div>
              <q-chip dense class="glass-chip chip-pending">Urgente</q-chip>
            </div>
          </div>
        </q-card>
      </section>

      <!-- SIDE PANELS -->
      <section class="bottom-grid">
        <q-card flat bordered class="panel-card">
          <div class="panel-header">
            <div>
              <div class="panel-title">Distribución rápida</div>
              <div class="panel-subtitle">Vista compacta por módulo</div>
            </div>
          </div>

          <div class="distribution-list">
            <div class="dist-row">
              <div class="dist-label">Usuarios</div>
              <q-linear-progress value="0.82" color="cyan" track-color="grey-9" rounded size="10px" class="dist-progress" />
              <div class="dist-value">82%</div>
            </div>

            <div class="dist-row">
              <div class="dist-label">Empresas</div>
              <q-linear-progress value="0.48" color="orange" track-color="grey-9" rounded size="10px" class="dist-progress" />
              <div class="dist-value">48%</div>
            </div>

            <div class="dist-row">
              <div class="dist-label">API Keys</div>
              <q-linear-progress value="0.66" color="purple" track-color="grey-9" rounded size="10px" class="dist-progress" />
              <div class="dist-value">66%</div>
            </div>
          </div>
        </q-card>

        <q-card flat bordered class="panel-card">
          <div class="panel-header">
            <div>
              <div class="panel-title">Acciones rápidas</div>
              <div class="panel-subtitle">Operaciones frecuentes</div>
            </div>
          </div>

          <div class="quick-actions-grid">
            <q-btn unelevated no-caps icon="person_add" label="Crear usuario" class="quick-action-btn" />
            <q-btn unelevated no-caps icon="apartment" label="Registrar empresa" class="quick-action-btn warm-btn" />
            <q-btn unelevated no-caps icon="vpn_key" label="Nueva API Key" class="quick-action-btn" />
          </div>
        </q-card>
      </section>
    </div>
  </q-page>
</template>

<script setup>
const recentActivity = [
  {
    id: 1,
    title: 'Usuario creado',
    description: 'Se registró a "Ana López" en la empresa Santoro Tech.',
    time: 'Hace 10 min',
    colorClass: 'dot-cyan',
  },
  {
    id: 2,
    title: 'Empresa actualizada',
    description: 'Se modificó la información fiscal de "Grupo Santoro".',
    time: 'Hace 35 min',
    colorClass: 'dot-warm',
  },
  {
    id: 3,
    title: 'API Key generada',
    description: 'Se generó una nueva credencial para integración externa.',
    time: 'Hace 1 hora',
    colorClass: 'dot-purple',
  },
  {
    id: 4,
    title: 'Cambio de estado',
    description: 'Se desactivó una empresa por inconsistencias administrativas.',
    time: 'Hace 3 horas',
    colorClass: 'dot-pink',
  },
]
</script>

<style lang="scss" scoped>
.admin-home-page {
  min-height: 100vh;
  background: transparent;
}

.admin-home-wrap {
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding: 24px 20px 36px;
}

/* HERO */
.hero-block {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(320px, 0.75fr);
  gap: 22px;
  align-items: stretch;
  margin-bottom: 24px;
}

.hero-left,
.hero-side-card,
.stat-card,
.module-card,
.panel-card {
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.02));
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.32);
}

.hero-left {
  border-radius: 26px;
  padding: 30px 30px 28px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 14px;
  border-radius: 999px;
  margin-bottom: 16px;
  color: white;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);

  span {
    font-size: 0.9rem;
    font-weight: 700;
  }
}

.hero-title {
  margin: 0 0 12px;
  color: #fff;
  font-size: clamp(2rem, 4vw, 3.1rem);
  line-height: 1.03;
  font-weight: 900;
  letter-spacing: -0.04em;
}

.hero-title--accent {
  background: linear-gradient(90deg, #22d3ee 0%, #7c3aed 55%, #ec4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  margin: 0;
  color: rgba(255, 255, 255, 0.72);
  font-size: 1rem;
  line-height: 1.75;
  max-width: 760px;
}

.hero-actions {
  display: flex;
  gap: 14px;
  margin-top: 24px;
  flex-wrap: wrap;
}

.hero-btn {
  min-height: 52px;
  padding: 0 20px;
  border-radius: 16px;
  font-weight: 800;
  text-transform: none;
}

.hero-btn--primary {
  color: white;
  background: linear-gradient(90deg, #06b6d4 0%, #7c3aed 55%, #ec4899 100%);
  box-shadow: 0 18px 38px rgba(34, 211, 238, 0.16);
}

.hero-btn--secondary {
  color: white;
  background: linear-gradient(90deg, #7c3aed 0%, #ec4899 55%, #e97132 100%);
  box-shadow: 0 18px 38px rgba(233, 113, 50, 0.18);
}

.hero-side-card {
  border-radius: 26px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.hero-side-top {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 22px;
}

.hero-side-icon {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  color: white;
  background: linear-gradient(135deg, rgba(34, 211, 238, 0.95), rgba(124, 58, 237, 0.88));
}

.hero-side-title {
  color: #fff;
  font-size: 1.1rem;
  font-weight: 800;
}

.hero-side-subtitle {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
}

.hero-side-metrics {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.mini-metric {
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.mini-metric__label {
  color: rgba(255, 255, 255, 0.56);
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 700;
  margin-bottom: 6px;
}

.mini-metric__value {
  color: #fff;
  font-size: 1.5rem;
  font-weight: 900;
}

/* KPIs */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
  margin-bottom: 24px;
}

.stat-card {
  min-height: 120px;
  border-radius: 22px;
  padding: 18px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  color: white;
  flex-shrink: 0;
}

.stat-icon--cyan {
  background: linear-gradient(135deg, rgba(34, 211, 238, 0.95), rgba(6, 182, 212, 0.82));
}

.stat-icon--warm {
  background: linear-gradient(135deg, rgba(233, 113, 50, 0.95), rgba(236, 72, 153, 0.82));
}

.stat-icon--purple {
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.95), rgba(168, 85, 247, 0.82));
}

.stat-icon--pink {
  background: linear-gradient(135deg, rgba(236, 72, 153, 0.95), rgba(124, 58, 237, 0.82));
}

.stat-body {
  min-width: 0;
}

.stat-label {
  color: rgba(255, 255, 255, 0.56);
  font-size: 0.84rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 6px;
}

.stat-value {
  color: white;
  font-size: 2rem;
  font-weight: 900;
  line-height: 1;
  margin-bottom: 8px;
}

.stat-foot {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.88rem;
}

/* MODULES */
.modules-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 22px;
  margin-bottom: 24px;
}

.module-card {
  border-radius: 24px;
  padding: 24px;
}

.module-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}

.module-icon {
  width: 58px;
  height: 58px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  color: white;
}

.module-icon--cyan {
  background: linear-gradient(135deg, rgba(34, 211, 238, 0.95), rgba(6, 182, 212, 0.82));
}

.module-icon--warm {
  background: linear-gradient(135deg, rgba(233, 113, 50, 0.95), rgba(236, 72, 153, 0.82));
}

.module-icon--purple {
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.95), rgba(168, 85, 247, 0.82));
}

.module-arrow {
  color: rgba(255, 255, 255, 0.58);
}

.module-title {
  color: #fff;
  font-size: 1.28rem;
  font-weight: 800;
  margin-bottom: 10px;
}

.module-text {
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.95rem;
  line-height: 1.65;
  margin-bottom: 18px;
}

.module-chips {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.glass-chip {
  border-radius: 999px;
  font-weight: 700;
}

.chip-active {
  background: rgba(34, 197, 94, 0.16);
  color: #86efac;
  border: 1px solid rgba(34, 197, 94, 0.26);
}

.chip-inactive {
  background: rgba(239, 68, 68, 0.14);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.24);
}

.chip-pending {
  background: rgba(233, 113, 50, 0.14);
  color: #ffb088;
  border: 1px solid rgba(233, 113, 50, 0.25);
}

.chip-info {
  background: rgba(56, 189, 248, 0.14);
  color: #7dd3fc;
  border: 1px solid rgba(56, 189, 248, 0.24);
}

.module-actions {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding-top: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
}

.ghost-btn {
  color: rgba(255, 255, 255, 0.78);
  text-transform: none;
}

.mini-action-btn,
.quick-action-btn {
  border-radius: 14px;
  color: white;
  text-transform: none;
  background: linear-gradient(90deg, #06b6d4 0%, #7c3aed 55%, #ec4899 100%);
}

.warm-btn {
  background: linear-gradient(90deg, #7c3aed 0%, #ec4899 55%, #e97132 100%);
}

/* CONTENT GRID */
.content-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 22px;
  margin-bottom: 24px;
}

.bottom-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 22px;
}

.panel-card {
  border-radius: 24px;
  padding: 24px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 18px;
}

.panel-title {
  color: white;
  font-size: 1.15rem;
  font-weight: 800;
  margin-bottom: 4px;
}

.panel-subtitle {
  color: rgba(255, 255, 255, 0.58);
  font-size: 0.9rem;
}

.panel-link-btn {
  color: #22d3ee;
}

/* TIMELINE */
.timeline-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.timeline-item {
  display: grid;
  grid-template-columns: 14px minmax(0, 1fr) auto;
  gap: 14px;
  align-items: start;
  padding: 14px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.timeline-item:last-child {
  border-bottom: none;
}

.timeline-dot {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  margin-top: 6px;
  box-shadow: 0 0 18px currentColor;
}

.dot-cyan {
  background: #22d3ee;
  color: #22d3ee;
}

.dot-warm {
  background: #e97132;
  color: #e97132;
}

.dot-purple {
  background: #a855f7;
  color: #a855f7;
}

.dot-pink {
  background: #ec4899;
  color: #ec4899;
}

.timeline-title {
  color: #fff;
  font-size: 0.98rem;
  font-weight: 700;
  margin-bottom: 4px;
}

.timeline-text {
  color: rgba(255, 255, 255, 0.68);
  font-size: 0.92rem;
  line-height: 1.55;
}

.timeline-date {
  color: rgba(255, 255, 255, 0.48);
  font-size: 0.82rem;
  white-space: nowrap;
}

/* ALERTS */
.alerts-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.alert-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.alert-item:last-child {
  border-bottom: none;
}

.alert-icon {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  color: white;
  flex-shrink: 0;
}

.alert-icon--warm {
  background: rgba(233, 113, 50, 0.18);
}

.alert-icon--cyan {
  background: rgba(34, 211, 238, 0.16);
}

.alert-icon--purple {
  background: rgba(124, 58, 237, 0.16);
}

.alert-body {
  min-width: 0;
  flex: 1;
}

.alert-title {
  color: #fff;
  font-size: 0.96rem;
  font-weight: 700;
  margin-bottom: 4px;
}

.alert-text {
  color: rgba(255, 255, 255, 0.68);
  font-size: 0.9rem;
  line-height: 1.5;
}

/* DISTRIBUTION */
.distribution-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.dist-row {
  display: grid;
  grid-template-columns: 110px minmax(0, 1fr) 48px;
  gap: 14px;
  align-items: center;
}

.dist-label {
  color: rgba(255, 255, 255, 0.8);
  font-weight: 700;
}

.dist-progress {
  width: 100%;
}

.dist-value {
  color: white;
  font-weight: 800;
  text-align: right;
}

/* QUICK ACTIONS */
.quick-actions-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.quick-action-btn {
  min-height: 52px;
  font-weight: 800;
}

.quick-ghost {
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  border-radius: 14px;
  min-height: 52px;
}

/* RESPONSIVE */
@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .modules-grid {
    grid-template-columns: 1fr;
  }

  .content-grid,
  .bottom-grid,
  .hero-block {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 700px) {
  .admin-home-wrap {
    padding: 18px 14px 28px;
  }

  .stats-grid,
  .quick-actions-grid {
    grid-template-columns: 1fr;
  }

  .module-actions,
  .hero-actions,
  .panel-header {
    flex-direction: column;
    align-items: stretch;
  }

  .dist-row {
    grid-template-columns: 1fr;
  }

  .timeline-item {
    grid-template-columns: 14px minmax(0, 1fr);
  }

  .timeline-date {
    grid-column: 2;
  }
}
</style>
