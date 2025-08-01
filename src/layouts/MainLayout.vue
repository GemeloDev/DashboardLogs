<template>
  <q-layout view="lHh Lpr lFf">
    <!-- ENCABEZADO -->
    <q-header
      elevated
      style="background-color: #1e1e2f; color: white; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4)"
    >
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />
        <q-toolbar-title>Consola Logs</q-toolbar-title>
        <div>Console v1.0</div>
      </q-toolbar>
    </q-header>

    <!-- MENÚ LATERAL -->
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      :width="280"
      :breakpoint="500"
      class="app-drawer"
      :class="{
        'mobile-drawer': selectedFlow === 'mobile',
        'desktop-drawer': selectedFlow === 'escritorio',
      }"
    >
      <q-scroll-area class="fit">
        <!-- Selector de flujo -->
        <q-list padding class="menu-list">
          <q-item>
            <q-item-section>
              <q-btn-toggle
                v-model="selectedFlow"
                spread
                no-caps
                rounded
                unelevated
                :options="[
                  { label: 'Mobile', value: 'mobile', icon: 'smartphone' },
                  { label: 'Escritorio', value: 'escritorio', icon: 'desktop_windows' },
                ]"
                class="full-width"
              />
            </q-item-section>
          </q-item>

          <q-separator dark spaced />

          <!-- Menú principal -->
          <q-item clickable v-ripple to="/logs" exact>
            <q-item-section avatar>
              <q-icon name="dashboard" />
            </q-item-section>
            <q-item-section>Dashboard</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/estadisticas">
            <q-item-section avatar>
              <q-icon name="insert_chart" />
            </q-item-section>
            <q-item-section>Estadísticas</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/eventos">
            <q-item-section avatar>
              <q-icon name="event" />
            </q-item-section>
            <q-item-section>Eventos</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/eventos-fallidos">
            <q-item-section avatar>
              <q-icon name="report_problem" />
            </q-item-section>
            <q-item-section>Eventos Fallidos</q-item-section>
          </q-item>

          <!-- Menú adicional para escritorio -->
          <template v-if="selectedFlow === 'escritorio'">
            <q-separator dark spaced />
            <q-item-label header class="text-grey-4">Herramientas</q-item-label>

            <q-item clickable v-ripple @click="showFilters = true">
              <q-item-section avatar>
                <q-icon name="filter_list" />
              </q-item-section>
              <q-item-section>Filtros Avanzados</q-item-section>
            </q-item>

            <q-item clickable v-ripple @click="toggleConsole">
              <q-item-section avatar>
                <q-icon name="terminal" />
              </q-item-section>
              <q-item-section>Consola</q-item-section>
            </q-item>
          </template>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <!-- CONTENIDO -->
    <q-page-container>
      <transition appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut">
        <div v-if="selectedFlow === 'mobile'" class="flow-container mobile-flow">
          <router-view />
        </div>
        <div v-else class="flow-container desktop-flow">
          <div class="row">
            <div class="col-12">
              <EscritorioDashboard />
            </div>
          </div>

          <q-dialog v-model="showFilters" persistent>
            <q-card style="min-width: 350px; background: #1e1e2f">
              <q-card-section>
                <div class="text-h6">Filtros Avanzados</div>
              </q-card-section>
              <q-card-section>
                <EscritorioFiltros @filtrar="onFiltrar" />
              </q-card-section>
              <q-card-actions align="right">
                <q-btn flat label="Cerrar" color="primary" v-close-popup />
              </q-card-actions>
            </q-card>
          </q-dialog>

          <div class="row q-col-gutter-md">
            <div class="col-12">
              <EscritorioGraficas
                :filtros="filtros"
                @detalle="abrirDetalleModal"
                :class="{ 'with-console': showConsole }"
              />
            </div>
          </div>

          <q-drawer
            v-model="showConsole"
            side="right"
            overlay
            behavior="desktop"
            bordered
            class="console-drawer"
          >
            <EscritorioConsola />
          </q-drawer>

          <EscritorioDetalleModal
            :model-value="modalVisible"
            :detalle="detalleModal"
            @update:model-value="modalVisible = $event"
          />
        </div>
      </transition>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import EscritorioDashboard from '../components/escritorio/EscritorioDashboard.vue'
import EscritorioFiltros from '../components/escritorio/EscritorioFiltros.vue'
import EscritorioGraficas from '../components/escritorio/EscritorioGraficas.vue'
import EscritorioConsola from '../components/escritorio/EscritorioConsola.vue'
import EscritorioDetalleModal from '../components/escritorio/EscritorioDetalleModal.vue'

const $q = useQuasar()
const leftDrawerOpen = ref(false)
const selectedFlow = ref('mobile')
const filtros = ref({})
const modalVisible = ref(false)
const detalleModal = ref(null)
const showFilters = ref(false)
const showConsole = ref(false)

// Observar cambios en el flujo seleccionado
watch(selectedFlow, (newFlow) => {
  const message = newFlow === 'mobile' ? 'Cambiado a vista móvil' : 'Cambiado a vista de escritorio'

  $q.notify({
    message,
    color: 'info',
    icon: newFlow === 'mobile' ? 'smartphone' : 'desktop_windows',
  })
})

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function onFiltrar(val) {
  filtros.value = val
  showFilters.value = false
  $q.notify({
    message: 'Filtros aplicados',
    color: 'positive',
  })
}

function abrirDetalleModal(detalle) {
  detalleModal.value = detalle
  modalVisible.value = true
}

function toggleConsole() {
  showConsole.value = !showConsole.value
}
</script>

<style lang="scss">
.app-drawer {
  background-color: #121826;

  .menu-list {
    .q-item {
      min-height: 48px;
      padding: 8px 16px;
      color: #fff;
      border-radius: 8px;
      margin: 4px 8px;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      &.q-router-link-active {
        background: #1976d2;

        .q-icon {
          color: #fff;
        }
      }
    }

    .q-icon {
      font-size: 24px;
      color: #9e9e9e;
    }
  }
}

.flow-container {
  min-height: 100vh;
  padding: 16px;
  background: #121826;

  &.desktop-flow {
    .q-card {
      background: #1e1e2f;
      color: white;
      border-radius: 12px;
      margin-bottom: 16px;

      .text-h6 {
        color: #fff;
      }
    }
  }
}

.console-drawer {
  background: #1e1e2f;
  width: 500px;
  max-width: 100vw;
}

// Animaciones
.animated {
  animation-duration: 0.3s;
  animation-fill-mode: both;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

.fadeIn {
  animation-name: fadeIn;
}

.fadeOut {
  animation-name: fadeOut;
}
</style>
