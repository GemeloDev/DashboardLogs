<template>
  <q-card class="filters-card">
    <q-card-section>
      <div class="text-h6 text-center q-mb-lg">
        <q-icon name="filter_list" size="28px" class="q-mr-sm" color="primary" />
        Filtros Avanzados
      </div>

      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-6 col-lg-4">
          <q-select
            v-model="filtro.oficina"
            :options="oficinas"
            label="Oficina"
            filled
            dark
            color="primary"
            label-color="white"
            class="custom-select"
          >
            <template v-slot:prepend>
              <q-icon name="business" color="primary" />
            </template>
          </q-select>
        </div>

        <div class="col-12 col-md-6 col-lg-4">
          <q-select
            v-model="filtro.tipoProceso"
            :options="tiposProceso"
            label="Tipo de Proceso"
            filled
            dark
            color="primary"
            label-color="white"
            class="custom-select"
          >
            <template v-slot:prepend>
              <q-icon name="settings" color="primary" />
            </template>
          </q-select>
        </div>

        <div class="col-12 col-md-6 col-lg-4">
          <q-select
            v-model="filtro.dispositivo"
            :options="dispositivos"
            label="Dispositivo"
            filled
            dark
            color="primary"
            label-color="white"
            class="custom-select"
          >
            <template v-slot:prepend>
              <q-icon name="devices" color="primary" />
            </template>
          </q-select>
        </div>

        <div class="col-12 col-md-6 col-lg-4">
          <q-select
            v-model="filtro.usuario"
            :options="usuarios"
            label="Usuario"
            filled
            dark
            color="primary"
            label-color="white"
            class="custom-select"
          >
            <template v-slot:prepend>
              <q-icon name="person" color="primary" />
            </template>
          </q-select>
        </div>

        <div class="col-12 col-md-6 col-lg-4">
          <q-select
            v-model="filtro.formato"
            :options="formatos"
            label="Formato Exportación"
            filled
            dark
            color="primary"
            label-color="white"
            class="custom-select"
          >
            <template v-slot:prepend>
              <q-icon name="download" color="primary" />
            </template>
          </q-select>
        </div>

        <div class="col-12 col-md-6 col-lg-4">
          <q-select
            v-model="filtro.tipoDatos"
            :options="tiposDatos"
            label="Tipo de Datos"
            filled
            dark
            color="primary"
            label-color="white"
            class="custom-select"
          >
            <template v-slot:prepend>
              <q-icon name="data_usage" color="primary" />
            </template>
          </q-select>
        </div>

        <div class="col-12">
          <q-input
            v-model="filtro.rangoFechas"
            label="Rango de Fechas"
            filled
            dark
            color="primary"
            label-color="white"
            class="custom-select"
            readonly
          >
            <template v-slot:prepend>
              <q-icon name="date_range" color="primary" />
            </template>
            <template v-slot:append>
              <q-icon name="calendar_today" class="cursor-pointer" color="primary">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="filtro.rangoFechas" range dark color="primary">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Cerrar" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>
      </div>

      <div class="q-mt-lg text-center">
        <q-btn
          color="primary"
          label="Aplicar Filtros"
          icon="filter_alt"
          size="md"
          class="apply-btn"
          @click="aplicarFiltros"
          :loading="loading"
        />
        <q-btn
          color="grey-7"
          label="Limpiar"
          icon="clear"
          size="md"
          class="q-ml-md"
          flat
          @click="limpiarFiltros"
        />
      </div>
    </q-card-section>
  </q-card>
</template>
<script setup>
import { ref, onMounted, defineEmits } from 'vue'
import { useQuasar } from 'quasar'
import axios from 'axios'

const $q = useQuasar()
const loading = ref(false)

const filtro = ref({
  oficina: null,
  tipoProceso: null,
  dispositivo: null,
  usuario: null,
  formato: null,
  tipoDatos: null,
  rangoFechas: null,
})

const filtroInicial = { ...filtro.value }

const oficinas = ref([])
const tiposProceso = ref([])
const dispositivos = ref([])
const usuarios = ref([])
const formatos = ref(['JSON', 'Excel', 'TXT'])
const tiposDatos = ref([])

const emit = defineEmits(['filtrar'])

onMounted(async () => {
  try {
    oficinas.value = (await axios.get('/api/oficinas')).data
  } catch {
    oficinas.value = [
      { label: 'Oficina Central', value: 1 },
      { label: 'Sucursal Norte', value: 2 },
      { label: 'Sede Principal', value: 3 },
    ]
  }

  try {
    dispositivos.value = (await axios.get('/api/catalog/devices')).data
  } catch {
    dispositivos.value = [
      { label: 'Tablet Android', value: 'tablet' },
      { label: 'PC Escritorio', value: 'pc' },
      { label: 'Móvil', value: 'mobile' },
    ]
  }

  try {
    usuarios.value = (await axios.get('/api/catalog/persons')).data
  } catch {
    usuarios.value = [
      { label: 'Juan Pérez', value: 1 },
      { label: 'Ana López', value: 2 },
      { label: 'Carlos García', value: 3 },
    ]
  }

  // Tipos de proceso y datos pueden ser estáticos o venir de la API
  tiposProceso.value = [
    { label: 'Login', value: 'LOGIN' },
    { label: 'Registro', value: 'REGISTER' },
    { label: 'Escaneo', value: 'SCAN' },
    { label: 'Exportación', value: 'EXPORT' },
  ]

  tiposDatos.value = [
    { label: 'Errores', value: 'ERROR' },
    { label: 'Éxito', value: 'SUCCESS' },
    { label: 'Advertencias', value: 'WARNING' },
    { label: 'Información', value: 'INFO' },
  ]
})

async function aplicarFiltros() {
  loading.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 500)) // Simular delay
    emit('filtrar', filtro.value)
    $q.notify({
      message: 'Filtros aplicados correctamente',
      color: 'positive',
      icon: 'check_circle',
    })
  } catch {
    $q.notify({
      message: 'Error al aplicar filtros',
      color: 'negative',
      icon: 'error',
    })
  } finally {
    loading.value = false
  }
}

function limpiarFiltros() {
  filtro.value = { ...filtroInicial }
  emit('filtrar', filtro.value)
  $q.notify({
    message: 'Filtros limpiados',
    color: 'info',
    icon: 'refresh',
  })
}
</script>

<style lang="scss" scoped>
.filters-card {
  background: linear-gradient(135deg, #1e1e2f 0%, #2c2c44 100%);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.1);

  .text-h6 {
    background: linear-gradient(45deg, #2196f3, #21cbf3);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: 600;
  }
}

.custom-select {
  .q-field__control {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.3s ease;

    &:hover {
      border-color: rgba(33, 150, 243, 0.5);
      background: rgba(255, 255, 255, 0.08);
    }
  }

  &.q-field--focused .q-field__control {
    border-color: #2196f3;
    box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
  }
}

.apply-btn {
  background: linear-gradient(45deg, #2196f3, #21cbf3);
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(33, 150, 243, 0.3);
  }
}
</style>
