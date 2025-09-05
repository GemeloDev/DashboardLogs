<template>
  <q-page class="q-pa-md">
    <div class="row justify-center">
      <div class="col-12 col-md-8 col-lg-6">
        <!-- 🎛️ TÍTULO -->
        <div class="text-center q-mb-xl">
          <q-icon name="smart_toy" size="4rem" color="primary" class="q-mb-md" />
          <h3 class="text-h3 text-primary q-ma-none">SANTORO AI</h3>
          <p class="text-h6 text-grey-7">Configuración Avanzada del Sistema</p>
        </div>

        <!-- 📊 ESTADO DEL SISTEMA -->
        <q-card class="q-mb-lg" v-if="estadoSistema">
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="dashboard" class="q-mr-sm" />
              Estado del Sistema
            </div>

            <div class="row q-gutter-md">
              <div class="col">
                <q-chip
                  :color="estadoSistema.configurado ? 'green' : 'orange'"
                  text-color="white"
                  icon="settings"
                >
                  {{ estadoSistema.configurado ? 'Configurado' : 'Pendiente' }}
                </q-chip>
              </div>

              <div class="col">
                <q-chip
                  :color="estadoSistema.geminiConfigurado ? 'green' : 'orange'"
                  text-color="white"
                  icon="psychology"
                >
                  Gemini AI: {{ estadoSistema.geminiConfigurado ? 'Activo' : 'Inactivo' }}
                </q-chip>
              </div>
            </div>

            <div class="q-mt-md">
              <div class="text-subtitle2">Controladores Activos:</div>
              <div class="row q-gutter-xs q-mt-xs">
                <q-chip
                  v-for="(activo, nombre) in estadoSistema.controladores"
                  :key="nombre"
                  :color="activo ? 'blue' : 'grey'"
                  text-color="white"
                  size="sm"
                >
                  {{ nombre }}
                </q-chip>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- 🔑 CONFIGURACIÓN DE GEMINI -->
        <q-card class="q-mb-lg">
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="psychology" class="q-mr-sm" />
              Google Gemini AI
            </div>

            <q-form @submit="configurarGemini" class="q-gutter-md">
              <q-input
                v-model="formGemini.apiKey"
                label="API Key de Google Gemini"
                type="password"
                filled
                hint="Obtén tu API key desde Google AI Studio"
                :suffix-icon="formGemini.apiKey ? 'check_circle' : 'key'"
                :suffix-color="formGemini.apiKey ? 'green' : 'grey'"
              >
                <template v-slot:prepend>
                  <q-icon name="vpn_key" />
                </template>
              </q-input>

              <div class="row q-gutter-sm">
                <q-btn
                  type="submit"
                  color="primary"
                  icon="save"
                  label="Configurar Gemini"
                  :loading="cargandoGemini"
                  :disable="!formGemini.apiKey"
                />

                <q-btn
                  color="info"
                  icon="help"
                  label="¿Cómo obtener API Key?"
                  flat
                  @click="mostrarAyudaAPIKey"
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>

        <!-- 🎛️ CONFIGURACIÓN DEL SISTEMA -->
        <q-card class="q-mb-lg">
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="tune" class="q-mr-sm" />
              Configuración del Sistema
            </div>

            <q-form @submit="guardarConfiguracion" class="q-gutter-md">
              <!-- 🎤 Configuración de Voz -->
              <div class="q-gutter-sm">
                <div class="text-subtitle1">
                  <q-icon name="mic" class="q-mr-sm" />
                  Reconocimiento de Voz
                </div>

                <q-toggle
                  v-model="configuracion.vozHabilitada"
                  label="Habilitar comandos por voz"
                  color="primary"
                />

                <q-select
                  v-model="configuracion.idiomaVoz"
                  :options="opcionesIdioma"
                  label="Idioma para reconocimiento"
                  filled
                  emit-value
                  map-options
                  :disable="!configuracion.vozHabilitada"
                />
              </div>

              <q-separator />

              <!-- 🔔 Configuración de Notificaciones -->
              <div class="q-gutter-sm">
                <div class="text-subtitle1">
                  <q-icon name="notifications" class="q-mr-sm" />
                  Notificaciones
                </div>

                <q-toggle
                  v-model="configuracion.notificacionesHabilitadas"
                  label="Mostrar notificaciones del sistema"
                  color="primary"
                />

                <q-toggle
                  v-model="configuracion.sonidosHabilitados"
                  label="Reproducir sonidos de confirmación"
                  color="primary"
                  :disable="!configuracion.notificacionesHabilitadas"
                />
              </div>

              <q-separator />

              <!-- 📊 Configuración de Datos -->
              <div class="q-gutter-sm">
                <div class="text-subtitle1">
                  <q-icon name="storage" class="q-mr-sm" />
                  Gestión de Datos
                </div>

                <q-toggle
                  v-model="configuracion.cacheDatos"
                  label="Cachear datos para mejor rendimiento"
                  color="primary"
                />

                <q-slider
                  v-model="configuracion.limiteBusqueda"
                  :min="100"
                  :max="10000"
                  :step="100"
                  label
                  label-always
                  :label-value="`Límite de resultados: ${configuracion.limiteBusqueda}`"
                  color="primary"
                />
              </div>

              <div class="row q-gutter-sm q-mt-md">
                <q-btn
                  type="submit"
                  color="primary"
                  icon="save"
                  label="Guardar Configuración"
                  :loading="guardandoConfig"
                />

                <q-btn
                  color="orange"
                  icon="refresh"
                  label="Restaurar Predeterminados"
                  flat
                  @click="restaurarPredeterminados"
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>

        <!-- 🔧 HERRAMIENTAS DEL SISTEMA -->
        <q-card class="q-mb-lg">
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="build" class="q-mr-sm" />
              Herramientas del Sistema
            </div>

            <div class="row q-gutter-md">
              <q-btn
                color="info"
                icon="health_and_safety"
                label="Ejecutar Diagnóstico"
                @click="ejecutarDiagnostico"
                :loading="cargandoDiagnostico"
              />

              <q-btn
                color="warning"
                icon="refresh"
                label="Reiniciar Sistema"
                @click="confirmarReinicio"
                :loading="reiniciandoSistema"
              />

              <q-btn
                color="secondary"
                icon="cleaning_services"
                label="Limpiar Cache"
                @click="limpiarCache"
                :loading="limpiandoCache"
              />

              <q-btn
                color="green"
                icon="smart_toy"
                label="Probar IA"
                @click="probarIA"
                :disable="!estadoSistema?.configurado"
              />
            </div>
          </q-card-section>
        </q-card>

        <!-- 📋 LOGS DEL SISTEMA -->
        <q-card v-if="logsVisible">
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="article" class="q-mr-sm" />
              Logs del Sistema
              <q-btn
                icon="close"
                flat
                round
                size="sm"
                class="float-right"
                @click="logsVisible = false"
              />
            </div>

            <q-scroll-area style="height: 300px" class="bg-grey-1 q-pa-md rounded-borders">
              <div v-for="(log, index) in systemLogs" :key="index" class="q-mb-xs">
                <span class="text-caption text-grey-6">{{ log.timestamp }}</span>
                <span
                  :class="`text-${
                    log.level === 'error' ? 'red' : log.level === 'warn' ? 'orange' : 'grey-8'
                  }`"
                >
                  {{ log.message }}
                </span>
              </div>
            </q-scroll-area>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { santoroAI } from '../services/santoroAI.js'

export default {
  name: 'SantoroConfigPage',

  setup() {
    const $q = useQuasar()

    // 📊 Estados reactivos
    const estadoSistema = ref(null)
    const logsVisible = ref(false)
    const systemLogs = ref([])

    // 🔑 Form para Gemini
    const formGemini = reactive({
      apiKey: '',
    })

    // ⚙️ Configuración del sistema
    const configuracion = reactive({
      vozHabilitada: true,
      idiomaVoz: 'es-ES',
      notificacionesHabilitadas: true,
      sonidosHabilitados: true,
      cacheDatos: true,
      limiteBusqueda: 1000,
    })

    // 🔄 Estados de carga
    const cargandoGemini = ref(false)
    const guardandoConfig = ref(false)
    const cargandoDiagnostico = ref(false)
    const reiniciandoSistema = ref(false)
    const limpiandoCache = ref(false)

    // 🌐 Opciones
    const opcionesIdioma = [
      { label: 'Español (España)', value: 'es-ES' },
      { label: 'Español (México)', value: 'es-MX' },
      { label: 'Español (Argentina)', value: 'es-AR' },
      { label: 'English (US)', value: 'en-US' },
      { label: 'English (UK)', value: 'en-GB' },
    ]

    // 🚀 INICIALIZAR
    onMounted(async () => {
      await actualizarEstadoSistema()
      cargarConfiguracionGuardada()
    })

    // 📊 ACTUALIZAR ESTADO DEL SISTEMA
    const actualizarEstadoSistema = async () => {
      try {
        estadoSistema.value = santoroAI.obtenerEstadisticasSistema()
        agregarLog('info', 'Estado del sistema actualizado')
      } catch (error) {
        console.error('Error obteniendo estado:', error)
        agregarLog('error', `Error obteniendo estado: ${error.message}`)
      }
    }

    // 🔑 CONFIGURAR GEMINI
    const configurarGemini = async () => {
      cargandoGemini.value = true

      try {
        // Configurar API key
        santoroAI.configurarGemini(formGemini.apiKey)

        // Reinicializar sistema con nueva configuración
        const resultado = await santoroAI.inicializar({
          geminiApiKey: formGemini.apiKey,
          contextoSistema: santoroAI.systemContext,
        })

        if (resultado.exito) {
          $q.notify({
            type: 'positive',
            message: '🧠 Gemini AI configurado correctamente',
            caption: 'El sistema está listo para usar IA avanzada',
          })

          // Guardar en localStorage
          localStorage.setItem('santoro_gemini_key', formGemini.apiKey)

          await actualizarEstadoSistema()
          agregarLog('success', 'Gemini AI configurado exitosamente')
        } else {
          throw new Error(resultado.error)
        }
      } catch (error) {
        console.error('Error configurando Gemini:', error)
        $q.notify({
          type: 'negative',
          message: '❌ Error configurando Gemini AI',
          caption: error.message,
        })
        agregarLog('error', `Error configurando Gemini: ${error.message}`)
      } finally {
        cargandoGemini.value = false
      }
    }

    // 💾 GUARDAR CONFIGURACIÓN
    const guardarConfiguracion = async () => {
      guardandoConfig.value = true

      try {
        // Guardar en localStorage
        localStorage.setItem('santoro_config', JSON.stringify(configuracion))

        $q.notify({
          type: 'positive',
          message: '✅ Configuración guardada',
          caption: 'Los cambios se han aplicado correctamente',
        })

        agregarLog('success', 'Configuración del sistema guardada')
      } catch (error) {
        console.error('Error guardando configuración:', error)
        $q.notify({
          type: 'negative',
          message: '❌ Error guardando configuración',
          caption: error.message,
        })
        agregarLog('error', `Error guardando configuración: ${error.message}`)
      } finally {
        guardandoConfig.value = false
      }
    }

    // 📁 CARGAR CONFIGURACIÓN GUARDADA
    const cargarConfiguracionGuardada = () => {
      try {
        // Cargar API key de Gemini
        const geminiKey = localStorage.getItem('santoro_gemini_key')
        if (geminiKey) {
          formGemini.apiKey = geminiKey
        }

        // Cargar configuración del sistema
        const configGuardada = localStorage.getItem('santoro_config')
        if (configGuardada) {
          Object.assign(configuracion, JSON.parse(configGuardada))
        }

        agregarLog('info', 'Configuración cargada desde almacenamiento local')
      } catch (error) {
        console.error('Error cargando configuración:', error)
        agregarLog('warn', 'No se pudo cargar configuración guardada')
      }
    }

    // 🔧 EJECUTAR DIAGNÓSTICO
    const ejecutarDiagnostico = async () => {
      cargandoDiagnostico.value = true

      try {
        const diagnostico = await santoroAI.ejecutarDiagnostico()

        if (diagnostico.exito) {
          logsVisible.value = true

          $q.dialog({
            title: '🔍 Diagnóstico del Sistema',
            message: `
              <div><strong>Estado:</strong> ${
                diagnostico.diagnostico.sistema.configurado
                  ? 'Configurado'
                  : 'Pendiente configuración'
              }</div>
              <div><strong>Gemini:</strong> ${
                diagnostico.diagnostico.sistema.geminiConfigurado ? 'Activo' : 'Inactivo'
              }</div>
              <div><strong>Controladores:</strong> ${
                Object.keys(diagnostico.diagnostico.sistema.controladores).length
              }</div>
              <div><strong>Recomendaciones:</strong> ${diagnostico.recomendaciones.length}</div>
            `,
            html: true,
            ok: 'Cerrar',
          })

          agregarLog('info', 'Diagnóstico del sistema ejecutado')
        }
      } catch (error) {
        console.error('Error en diagnóstico:', error)
        $q.notify({
          type: 'negative',
          message: '❌ Error ejecutando diagnóstico',
          caption: error.message,
        })
        agregarLog('error', `Error en diagnóstico: ${error.message}`)
      } finally {
        cargandoDiagnostico.value = false
      }
    }

    // 🔄 CONFIRMAR REINICIO
    const confirmarReinicio = () => {
      $q.dialog({
        title: '⚠️ Reiniciar Sistema',
        message:
          '¿Estás seguro de que quieres reiniciar el sistema Santoro? Esto limpiará el estado actual.',
        cancel: true,
        persistent: true,
      }).onOk(async () => {
        await reiniciarSistema()
      })
    }

    // 🔄 REINICIAR SISTEMA
    const reiniciarSistema = async () => {
      reiniciandoSistema.value = true

      try {
        const resultado = await santoroAI.reiniciarSistema()

        if (resultado.exito) {
          $q.notify({
            type: 'positive',
            message: '🔄 Sistema reiniciado',
            caption: 'Santoro está listo para usar',
          })

          await actualizarEstadoSistema()
          agregarLog('success', 'Sistema Santoro reiniciado exitosamente')
        }
      } catch (error) {
        console.error('Error reiniciando sistema:', error)
        $q.notify({
          type: 'negative',
          message: '❌ Error reiniciando sistema',
          caption: error.message,
        })
        agregarLog('error', `Error reiniciando sistema: ${error.message}`)
      } finally {
        reiniciandoSistema.value = false
      }
    }

    // 🧹 LIMPIAR CACHE
    const limpiarCache = async () => {
      limpiandoCache.value = true

      try {
        // Limpiar localStorage relacionado con Santoro (excepto configuración)
        const keysToRemove = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.startsWith('santoro_cache_')) {
            keysToRemove.push(key)
          }
        }

        keysToRemove.forEach((key) => localStorage.removeItem(key))

        $q.notify({
          type: 'positive',
          message: '🧹 Cache limpiado',
          caption: `${keysToRemove.length} elementos eliminados`,
        })

        agregarLog('success', `Cache limpiado: ${keysToRemove.length} elementos`)
      } catch (error) {
        console.error('Error limpiando cache:', error)
        $q.notify({
          type: 'negative',
          message: '❌ Error limpiando cache',
          caption: error.message,
        })
        agregarLog('error', `Error limpiando cache: ${error.message}`)
      } finally {
        limpiandoCache.value = false
      }
    }

    // 🤖 PROBAR IA
    const probarIA = async () => {
      try {
        const respuesta = await santoroAI.procesarPregunta('Hola Santoro, ¿cómo estás?')

        $q.dialog({
          title: '🤖 Prueba de IA',
          message: `Respuesta: ${respuesta.respuesta}`,
          ok: 'Cerrar',
        })

        agregarLog('success', 'Prueba de IA ejecutada correctamente')
      } catch (error) {
        console.error('Error probando IA:', error)
        $q.notify({
          type: 'negative',
          message: '❌ Error probando IA',
          caption: error.message,
        })
        agregarLog('error', `Error probando IA: ${error.message}`)
      }
    }

    // 🔗 MOSTRAR AYUDA API KEY
    const mostrarAyudaAPIKey = () => {
      $q.dialog({
        title: '🔑 Cómo obtener API Key de Google Gemini',
        message: `
          <ol>
            <li>Ve a <a href="https://makersuite.google.com/app/apikey" target="_blank">Google AI Studio</a></li>
            <li>Inicia sesión con tu cuenta de Google</li>
            <li>Haz clic en "Create API Key"</li>
            <li>Copia la API Key generada</li>
            <li>Pégala en el campo de arriba</li>
          </ol>
          <p><strong>Nota:</strong> Mantén tu API Key segura y no la compartas.</p>
        `,
        html: true,
        ok: 'Entendido',
      })
    }

    // 📝 RESTAURAR PREDETERMINADOS
    const restaurarPredeterminados = () => {
      $q.dialog({
        title: 'Restaurar configuración predeterminada',
        message: '¿Quieres restaurar toda la configuración a los valores predeterminados?',
        cancel: true,
        persistent: true,
      }).onOk(() => {
        Object.assign(configuracion, {
          vozHabilitada: true,
          idiomaVoz: 'es-ES',
          notificacionesHabilitadas: true,
          sonidosHabilitados: true,
          cacheDatos: true,
          limiteBusqueda: 1000,
        })

        $q.notify({
          type: 'info',
          message: '↩️ Configuración restaurada',
          caption: 'Se han aplicado los valores predeterminados',
        })

        agregarLog('info', 'Configuración restaurada a valores predeterminados')
      })
    }

    // 📝 AGREGAR LOG
    const agregarLog = (level, message) => {
      systemLogs.value.unshift({
        timestamp: new Date().toLocaleTimeString(),
        level,
        message,
      })

      // Mantener solo los últimos 50 logs
      if (systemLogs.value.length > 50) {
        systemLogs.value = systemLogs.value.slice(0, 50)
      }
    }

    return {
      // 📊 Estados
      estadoSistema,
      logsVisible,
      systemLogs,

      // 📝 Forms
      formGemini,
      configuracion,

      // 🔄 Loading states
      cargandoGemini,
      guardandoConfig,
      cargandoDiagnostico,
      reiniciandoSistema,
      limpiandoCache,

      // 🌐 Opciones
      opcionesIdioma,

      // 🔧 Métodos
      configurarGemini,
      guardarConfiguracion,
      ejecutarDiagnostico,
      confirmarReinicio,
      limpiarCache,
      probarIA,
      mostrarAyudaAPIKey,
      restaurarPredeterminados,
    }
  },
}
</script>

<style scoped>
.q-card {
  border-radius: 12px;
}

.q-chip {
  font-weight: 500;
}
</style>
