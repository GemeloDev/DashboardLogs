<template>
  <q-page class="bg-dark-page">
    <div class="q-pa-lg text-white">
      <div class="container">
        <div class="row items-center justify-between">
          <div class="col-12 col-md-8">
            <div class="text-h3 diagnostic-title q-mt-md flex items-center">
              <span class="q-mr-sm">🔐</span>
              <span class="text-weight-bold">Mis API Key's</span>
            </div>
            <div class="text-h6 text-blue-3 q-mt-sm">
              🛠️ Gestión y control de accesos
            </div>
          </div>
          <div class="col-12 col-md-4 text-right q-mt-md q-mt-md-none">
            <q-btn
              color="primary"
              icon="add"
              label="Nueva API Key"
              class="glossy-btn"
              size="md"
              @click="abrirModalCrear"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="q-px-lg q-pb-xl">
      <div class="container">
        <q-card class="modern-card">
          <q-card-section class="q-pa-none">
            <q-table
              :rows="rowsExample"
              :columns="columns"
              row-key="id"
              dark
              class="api-keys-table"
              :filter="filter"
              :pagination="{ rowsPerPage: 10 }"
            >
              <template v-slot:top>
                <div class="row items-center text-h6 text-white q-my-sm q-ml-md">Listado de Llaves</div>
                <q-space />
                <q-input
                  dark
                  borderless
                  dense
                  debounce="300"
                  v-model="filter"
                  placeholder="Buscar..."
                  class="search-input q-mr-md"
                >
                  <template v-slot:append>
                    <q-icon name="search" />
                  </template>
                </q-input>
              </template>

              <template v-slot:header="props">
                <q-tr :props="props" class="header-row">
                  <q-th
                    v-for="col in props.cols"
                    :key="col.name"
                    :props="props"
                    class="text-weight-bold text-uppercase text-blue-2"
                  >
                    {{ col.label }}
                  </q-th>
                </q-tr>
              </template>

              <template v-slot:body="props">
                <q-tr :props="props" class="body-row">
                  <q-td key="nombre" :props="props">
                    <div class="text-weight-bold">{{ props.row.nombre }}</div>
                    <div class="text-caption text-grey-5">{{ props.row.descripcion }}</div>
                  </q-td>

                  <q-td key="prefix" :props="props">
                    <q-badge outline color="cyan" class="q-pa-xs font-mono">
                      {{ props.row.prefix }}••••••••
                    </q-badge>
                  </q-td>

                  <q-td key="estado" :props="props">
                    <q-chip
                      dense
                      :color="props.row.activo ? 'positive' : 'negative'"
                      text-color="white"
                      :icon="props.row.activo ? 'check_circle' : 'block'"
                    >
                      {{ props.row.activo ? 'Activa' : 'Revocada' }}
                    </q-chip>
                  </q-td>

                  <q-td key="creado" :props="props">
                    <div class="text-grey-4">{{ props.row.creado }}</div>
                  </q-td>

                  <q-td key="ultimoUso" :props="props">
                    <div class="text-grey-4">{{ props.row.ultimoUso || 'Nunca' }}</div>
                  </q-td>

                  <q-td key="acciones" :props="props" align="center">
                    <div class="row justify-center q-gutter-x-sm">
                      <q-btn flat round dense color="blue-4" icon="content_copy" size="sm">
                        <q-tooltip>Copiar ID</q-tooltip>
                      </q-btn>
                      <q-btn flat round dense color="orange-4" icon="edit" size="sm">
                        <q-tooltip>Editar</q-tooltip>
                      </q-btn>
                      <q-btn flat round dense color="red-4" icon="delete" size="sm">
                        <q-tooltip>Revocar</q-tooltip>
                      </q-btn>
                    </div>
                  </q-td>
                </q-tr>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-dialog v-model="modalOpen" persistent>
      <q-card class="modal-card bg-dark text-white" style="min-width: 500px">
        <q-card-section class="row items-center q-pb-none bg-grey-9">
          <div class="text-h6">✨ Nueva API Key</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-lg">
          <q-form class="q-gutter-md">
            <q-input
              filled
              dark
              v-model="form.nombre"
              label="Nombre de la llave *"
              hint="Ej: Integración Facturación"
              color="primary"
            />

            <q-input
              filled
              dark
              v-model="form.descripcion"
              label="Descripción"
              type="textarea"
              rows="3"
              color="primary"
            />

            <div class="row items-center justify-between q-mt-md q-px-sm rounded-borders bg-grey-9 q-py-sm">
              <div class="text-subtitle2">Permisos de Lectura/Escritura</div>
              <q-toggle v-model="form.permisosFull" color="green" />
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="bg-grey-9 q-pa-md">
          <q-btn flat label="Cancelar" color="grey-5" v-close-popup />
          <q-btn label="Generar Llave" color="primary" class="q-px-md" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab icon="add" color="primary" @click="abrirModalCrear" class="shadow-10">
        <q-tooltip anchor="center left" self="center right">Crear API Key</q-tooltip>
      </q-btn>
    </q-page-sticky>
  </q-page>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { ApiKeyService } from 'src/services/apiKeys'
import { onMounted, ref } from 'vue'

const $q = useQuasar()

const filter = ref('')
const modalOpen = ref(false)
const rows = ref([{
  id: null,
  nombre: '',
  status: '',
  createdAt: '',
  lastUsedAt: '',
  expiresAt: '',
  rotatesAt: ''
}])

const form = ref({
  nombre: '',
  descripcion: '',
  permisosFull: false
})

const columns = [
  { name: 'nombre', required: true, label: 'Nombre / Aplicación', align: 'left', field: 'nombre', sortable: true },
  { name: 'prefix', align: 'center', label: 'Prefijo', field: 'prefix' },
  { name: 'estado', align: 'center', label: 'Estado', field: 'activo', sortable: true },
  { name: 'creado', align: 'center', label: 'Creado', field: 'creado', sortable: true },
  { name: 'ultimoUso', align: 'center', label: 'Último Uso', field: 'ultimoUso', sortable: true },
  { name: 'acciones', align: 'center', label: 'Acciones' }
]

// Datos Mock para visualización
const rowsExample = [
  { id: 1, nombre: 'App Móvil iOS', descripcion: 'Llave para la app de clientes', prefix: 'pk_live_55a...', activo: true, creado: '2025-01-10', ultimoUso: 'Hace 5 min' },
  { id: 2, nombre: 'Backend Facturación', descripcion: 'Servidor de finanzas', prefix: 'sk_test_99b...', activo: true, creado: '2024-12-05', ultimoUso: 'Ayer 14:30' },
  { id: 3, nombre: 'Integración CRM', descripcion: 'Sistema legacy v1', prefix: 'pk_live_11c...', activo: false, creado: '2024-08-20', ultimoUso: '2024-11-01' },
]

const startPage = async () => {
  try {
  const response = await ApiKeyService.getAll()
    if ( response.ok && response.data.items) {
      $q.notify({
        message: `✅ API Keys obtenidas correctamente!`,
        type: 'success',
        position: 'top-right'
      })
    }

  } catch (error) {
    console.log('❌ Error al obtener API Keys: ', error.message)
    $q.notify({
        message: `❌ Error al obtener API Keys`,
        type: 'error',
        position: 'top-right'
    })
  }
}

const abrirModalCrear = () => {
  modalOpen.value = true
}

onMounted(() => {
  startPage()
})
</script>

<style lang="scss" scoped>
// Fondo general oscuro
.bg-dark-page {
  background-color: #121826; // Color de fondo base de tu app
  min-height: 100vh;
}

// Contenedor centrado (si usas bootstrap grid o similar, esto ayuda)
.container {
  max-width: 1400px;
  margin: 0 auto;
}

// Tarjeta moderna con efecto glassmorphism o solido
.modern-card {
  background: #1e1e2f;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

// Estilos de la Tabla
.api-keys-table {
  background: transparent;

  /* Header de la tabla */
  :deep(thead tr:first-child th) {
    background-color: #2b2b3d; // Un poco más claro que el fondo de la tarjeta
    font-size: 0.85rem;
    padding: 16px;
  }

  /* Filas del cuerpo */
  .body-row {
    transition: background-color 0.2s ease;

    &:hover {
      background-color: rgba(255, 255, 255, 0.03) !important;
    }
  }
}

// Input de búsqueda personalizado
.search-input {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 0 12px;
  min-width: 250px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;

  &:focus-within {
    border-color: var(--q-primary);
    background: rgba(0, 0, 0, 0.3);
  }
}

// Botón "Glossy" del header
.glossy-btn {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  box-shadow: 0 4px 15px rgba(25, 118, 210, 0.4);
  font-weight: 600;
}

// Fuente monoespaciada para las llaves
.font-mono {
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 0.9em;
  letter-spacing: 0.5px;
}

// Estilos del Modal
.modal-card {
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  border-radius: 12px;
}
</style>
