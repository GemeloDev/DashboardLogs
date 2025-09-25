<template>
  <q-card class="modern-card text-white session-card row">
    <q-card-section class="col-4 q-pa-xl">
      <p class="text-h5 text-bold text-white">Listado de Datos</p>

      <div class="grid column items-center">
        <q-chip color="green" class="text-white q-mb-lg" clickable @click="personOrOficeCheck('users')">
          👤 {{ counterUsers }} registros de usuarios encontrados
        </q-chip>
        <q-chip color="blue" class="text-white q-mb-lg" clickable @click="personOrOficeCheck('oficina')">
          🏢 {{ counterOficinas }} registros de oficinas encontradas
        </q-chip>
      </div>

      <div class="grid column items-center q-pa-lg" v-if="personOrOffice">
        <q-chip color="green" class="text-white q-mb-lg shadow-8" v-for="person in duplicateCurps" :key="person">
          {{ person }}
        </q-chip>
      </div>
      <div class="grid column items-center q-pa-lg" v-if="!personOrOffice">
        <q-chip color="blue" class="text-white q-mb-lg shadow-8" v-for="office in duplicateOffice" :key="office">
          {{ office }}
        </q-chip>
      </div>
    </q-card-section>
    <q-card-section class="col">
      <div class="q-px-lg q-py-md">
        <q-timeline color="secondary" class="session-timeline q-pl-md">
          <q-timeline-entry heading>
            <strong class="text-h5 text-bold">Detalle de la Consulta</strong>
          </q-timeline-entry>
          <q-timeline-entry
            v-for="(log, index) in resultados.data"
            :key="index"
            :title="`PROCESO: ${log.process}`"
            :subtitle="formatearFecha(log.date)"
            :color="getEventColor(log.type)"
            :icon="getEventIcon(log.type)"
          >
            <div class="row q-gutter-md">
              <div class="col-12">
                <q-card class="kpi-card gradient-cyan">
                  <q-card-section class="q-pa-lg">
                    <div class="kpi-content">
                      <div class="kpi-icon-container">
                        <q-icon name="message" size="xs" class="kpi-icon" />
                      </div>
                      <div class="kpi-data">
                        <div class="kpi-title">Mensaje</div>
                        <div class="kpi-subtitle">{{ log.message }}</div>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
              <div v-if="log.person" class="col content-center text-body2 log-message">
                👤 Nombre:
                {{
                  log.person.nombres +
                  ' ' +
                  log.person.primerApellido +
                  ' ' +
                  log.person.segundoApellido
                }}
              </div>
              <div v-if="log.oficina" class="col text-body2 log-ofice">
                <p class="text-weight-thin">
                  <span class="text-bold">🏢 Oficina:</span> {{ log.oficina.nombre }}
                  <br />
                  <span class="text-bold">🚩 Dirección:</span>
                  {{ log.oficina.direccion }}
                </p>
              </div>
              <!-- Detalles técnicos del log -->
              <div class="col-12">
                <div class="row text-center">
                  <div class="col bordered">
                    <q-icon color="blue-5" name="tag" size="xs" class="q-mr-xs" />
                    <span class="text-blue-5">ID: </span>
                    <p>{{ log.id }}</p>
                  </div>
                  <div v-if="log.errorCode" class="col bordered">
                    <q-icon color="red" name="error_outline" size="xs" class="q-mr-xs" />
                    <span class="text-red-4 text-bold">Código de error: </span>
                    <p>{{ log.errorCode }}</p>
                  </div>
                  <div v-if="log.sessionToken" class="col bordered">
                    <q-icon name="security" size="xs" class="q-mr-xs" />
                    <span class="text-purple-4 text-bold">Token de sesión: </span>
                    <p>{{ log.sessionToken }}</p>
                  </div>
                  <div v-if="log.baseCode" class="col bordered">
                    <q-icon name="qr_code" size="xs" class="q-mr-xs" />
                    <span class="text-orange-4 text-bold">Código base: </span>
                    <p>{{ log.baseCode }}</p>
                  </div>
                </div>
              </div>
            </div>
          </q-timeline-entry>
        </q-timeline>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, watchEffect } from 'vue'

import { formatearFecha, getEventColor, getEventIcon } from 'src/helpers/index.js'

const props = defineProps({
  counterUsers: Number,
  counterOficinas: Number,
  resultados: Object,
})

watchEffect(() => {
  props.counterUsers
})
watchEffect(() => {
  props.counterOficinas
})
watchEffect(() => {
  props.resultados
})

const personOrOffice = ref(true)

const personOrOficeCheck = (clicked) => {
  if(clicked === 'users') {
    personOrOffice.value = true
  } else {
    personOrOffice.value = false
  }
}

//  Oficinas dúplicadas
const withOficinas = props.resultados.data.filter(item => item.oficina && item.oficina.nombre)
const countsOficinas = withOficinas.reduce((acc, item) => {
  const nombre = item.oficina.nombre
  acc[nombre] = (acc[nombre] || 0) + 1
  return acc
}, {})

const duplicateOffice = Object.keys(countsOficinas).filter(nombre => countsOficinas[nombre] > 1)

//  Personas duplicadas
const withPerson = props.resultados.data.filter(item => item.person && item.person.curp)

const countsPersonas = withPerson.reduce((acc, item) => {
  const curp = '👤 ' + item.person.nombres + ' ' + item.person.primerApellido + ' ' + item.person.segundoApellido
  acc[curp] = (acc[curp] || 0) + 1
  return acc
}, {})

const duplicateCurps = Object.keys(countsPersonas).filter(curp => countsPersonas[curp] > 1)

console.log(duplicateOffice)
</script>


<style lang="scss" scoped>

.log-message {
  font-weight: 500;
  margin-bottom: 12px;
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
  padding: 8px 12px;
  border-radius: 6px;
  border-left: 3px solid #42a5f5;
}

.log-ofice {
  font-weight: 500;
  margin-bottom: 12px;
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
  padding: 8px 12px;
  border-radius: 6px;
  border-left: 3px solid #04b949;
}

.bordered {
  border-left: 1px solid #ccc;
  border-right: 1px solid #ccc;
  padding: 12px;
}

// Estilos para KPIs
.kpi-card {
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;

  &.gradient-blue {
    background: linear-gradient(145deg, rgba(33, 150, 243, 0.2) 0%, rgba(25, 118, 210, 0.1) 100%);
    border-color: rgba(33, 150, 243, 0.3);
  }

  &.gradient-green {
    background: linear-gradient(145deg, rgba(76, 175, 80, 0.2) 0%, rgba(56, 142, 60, 0.1) 100%);
    border-color: rgba(76, 175, 80, 0.3);
  }

  &.gradient-red {
    background: linear-gradient(145deg, rgba(244, 67, 54, 0.2) 0%, rgba(211, 47, 47, 0.1) 100%);
    border-color: rgba(244, 67, 54, 0.3);
  }

  &.gradient-orange {
    background: linear-gradient(145deg, rgba(255, 152, 0, 0.2) 0%, rgba(255, 193, 7, 0.1) 100%);
    border-color: rgba(255, 152, 0, 0.3);
  }

  &.gradient-cyan {
    background: linear-gradient(145deg, rgba(0, 188, 212, 0.2) 0%, rgba(0, 150, 136, 0.1) 100%);
    border-color: rgba(0, 188, 212, 0.3);
  }
}

.kpi-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.kpi-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.kpi-icon {
  color: rgba(255, 255, 255, 0.9);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.kpi-data {
  flex: 1;
}

.kpi-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.kpi-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.2;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.kpi-subtitle {
  font-size: 0.75rem;
  color: white;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.timeline-scroll {
  max-height: 300px;
  overflow-y: auto;
}

.session-timeline {
  max-height: 350px;
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

/* Scrollbar vertical u horizontal completo */
::-webkit-scrollbar {
  width: 9px; /* ancho de la barra (barStyle width) */
  height: 9px; /* alto si es horizontal */
}

/* Track: fondo de la barra */
::-webkit-scrollbar-track {
  background-color: #027be3; /* barStyle backgroundColor */
  border-radius: 9px; /* barStyle borderRadius */
  opacity: 0.2; /* barStyle opacity */
}

/* Thumb: la parte que se mueve */
::-webkit-scrollbar-thumb {
  background-color: #002c53; /* thumbStyle backgroundColor */
  border-radius: 5px; /* thumbStyle borderRadius */
  width: 5px; /* thumbStyle width (opcional, se suele controlar con scrollbar) */
  opacity: 0.75; /* thumbStyle opacity */
}

/* Thumb al hacer hover */
::-webkit-scrollbar-thumb:hover {
  background-color: #004883; /* color más oscuro para hover */
}
</style>
