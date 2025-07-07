<template>
  <q-layout view="lHh Lpr lFf">
    <!-- ENCABEZADO -->
    <q-header elevated style="background-color: #1e1e2f; color: white; box-shadow: 0 2px 8px rgba(0,0,0,0.4);">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />
        <q-toolbar-title>Consola Logs</q-toolbar-title>
        <div>Console v1.0</div>
      </q-toolbar>
    </q-header>

    <!-- MENÚ LATERAL -->
    <q-drawer v-model="leftDrawerOpen" show-if-above bordered class="bg-dark text-white">
      <q-item clickable v-ripple to="/logs" exact>
        <q-item-section avatar><q-icon name="dashboard" /></q-item-section>
        <q-item-section>Dashboard</q-item-section>
      </q-item>

      <q-item clickable v-ripple to="/estadisticas">
        <q-item-section avatar>
          <q-icon name="bar_chart" />
        </q-item-section>
        <q-item-section>Estadísticas</q-item-section>
      </q-item>

      <q-item clickable v-ripple to="/eventos">
        <q-item-section avatar>
          <q-icon name="bar_chart" />
        </q-item-section>
        <q-item-section>Eventos</q-item-section>
      </q-item>

      <q-item clickable v-ripple to="/eventos-fallidos">
        <q-item-section avatar>
          <q-icon name="bar_chart" />
        </q-item-section>
        <q-item-section>Eventos Fallidos</q-item-section>
      </q-item>

    </q-drawer>

    <!-- CONTENIDO -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'

const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>
