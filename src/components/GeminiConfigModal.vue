<template>
  <q-dialog v-model="mostrar" persistent>
    <q-card style="min-width: 400px; max-width: 600px" class="bg-dark text-white">
      <q-card-section>
        <div class="text-h6 text-blue-4 q-mb-md">
          <q-icon name="smart_toy" class="q-mr-sm" />
          Configurar Gemini AI
        </div>
        <div class="text-subtitle2 text-grey-4 q-mb-lg">
          Conecta tu API Key de Google Gemini para habilitar capacidades avanzadas de IA
        </div>

        <q-input
          v-model="apiKey"
          label="API Key de Google Gemini"
          filled
          dense
          color="blue-4"
          label-color="blue-4"
          input-class="text-white"
          :type="mostrarApiKey ? 'text' : 'password'"
          class="q-mb-md"
          hint="Obtén tu API Key en https://makersuite.google.com/app/apikey"
          :rules="[(val) => !!val || 'API Key requerida']"
        >
          <template v-slot:prepend>
            <q-icon name="vpn_key" color="blue-4" />
          </template>
          <template v-slot:append>
            <q-icon
              :name="mostrarApiKey ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="mostrarApiKey = !mostrarApiKey"
              color="grey-5"
            />
          </template>
        </q-input>

        <div class="q-mb-md text-caption text-grey-5">
          <q-icon name="info" class="q-mr-xs" />
          Tu API Key se guarda localmente y solo se usa para comunicarse con Google Gemini.
        </div>

        <div v-if="estado.configurado" class="q-mb-md">
          <q-banner class="bg-positive text-white" rounded>
            <template v-slot:avatar>
              <q-icon name="check_circle" />
            </template>
            Gemini AI configurado correctamente. Ahora tengo capacidades avanzadas de comprensión.
          </q-banner>
        </div>

        <div v-if="error" class="q-mb-md">
          <q-banner class="bg-negative text-white" rounded>
            <template v-slot:avatar>
              <q-icon name="error" />
            </template>
            {{ error }}
          </q-banner>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancelar" color="grey-5" @click="cerrar" :disable="cargando" />
        <q-btn
          label="Configurar"
          color="blue-4"
          unelevated
          @click="configurar"
          :loading="cargando"
          :disable="!apiKey"
        />
        <q-btn
          v-if="estado.configurado"
          flat
          label="Desconectar"
          color="orange-4"
          @click="desconectar"
          :disable="cargando"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const emit = defineEmits(['configurado', 'cerrar'])

// Estados reactivos
const mostrar = ref(false)
const apiKey = ref('')
const mostrarApiKey = ref(false)
const cargando = ref(false)
const error = ref('')
const estado = ref({
  configurado: false,
  tieneApiKey: false,
})

// Métodos
const configurar = async () => {
  if (!apiKey.value) {
    error.value = 'Por favor ingresa tu API Key'
    return
  }

  try {
    cargando.value = true
    error.value = ''

    // Importar dinámicamente el servicio de IA
    const { santoroAI } = await import('src/services/santoroAI.js')

    // Configurar la API Key
    const resultado = await santoroAI.configurarApiKey(apiKey.value)

    if (resultado.exito) {
      estado.value.configurado = true
      estado.value.tieneApiKey = true

      $q.notify({
        type: 'positive',
        message: 'Gemini AI configurado correctamente',
        icon: 'smart_toy',
        position: 'top',
      })

      emit('configurado', { apiKey: apiKey.value, resultado })

      // Cerrar después de un breve delay para mostrar el mensaje de éxito
      setTimeout(() => {
        cerrar()
      }, 2000)
    } else {
      error.value = resultado.mensaje || 'Error configurando Gemini AI'
    }
  } catch (err) {
    console.error('Error configurando Gemini:', err)
    error.value = 'Error configurando Gemini AI: ' + err.message
  } finally {
    cargando.value = false
  }
}

const desconectar = () => {
  try {
    // Limpiar localStorage
    localStorage.removeItem('santoro_gemini_api_key')

    // Reset estados
    apiKey.value = ''
    estado.value.configurado = false
    estado.value.tieneApiKey = false

    $q.notify({
      type: 'info',
      message: 'Gemini AI desconectado',
      icon: 'cloud_off',
      position: 'top',
    })

    emit('configurado', { desconectado: true })
    cerrar()
  } catch (err) {
    console.error('Error desconectando:', err)
    error.value = 'Error al desconectar'
  }
}

const cerrar = () => {
  mostrar.value = false
  error.value = ''
  emit('cerrar')
}

const abrir = () => {
  mostrar.value = true
  verificarEstado()
}

const verificarEstado = () => {
  try {
    const apiKeySaved = localStorage.getItem('santoro_gemini_api_key')
    if (apiKeySaved) {
      estado.value.configurado = true
      estado.value.tieneApiKey = true
      apiKey.value = apiKeySaved
    }
  } catch (err) {
    console.error('Error verificando estado:', err)
  }
}

onMounted(() => {
  verificarEstado()
})

// Exponer métodos
defineExpose({
  abrir,
  cerrar,
  mostrar,
  estado,
})
</script>

<style scoped>
.q-input >>> .q-field__control {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.q-input >>> .q-field__control:hover {
  background: rgba(255, 255, 255, 0.08);
}

.q-input >>> .q-field__control:focus-within {
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid #3b82f6;
}
</style>
