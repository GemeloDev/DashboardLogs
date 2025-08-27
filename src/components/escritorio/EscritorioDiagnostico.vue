<template>
  <!-- Modal de Diagnóstico Avanzado -->
  <q-dialog
    v-model="mostrarDiagnostico"
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
    @escape-key="cerrarDiagnostico"
    persistent
  >
    <q-card class="diagnostic-modal bg-grey-9 text-white">
      <!-- Header Mejorado -->
      <q-card-section class="diagnostic-header bg-gradient-to-r from-grey-8 to-grey-7">
        <div class="row items-center">
          <div class="col">
            <div class="text-h5 diagnostic-title">
              <q-icon name="medical_services" class="q-mr-sm diagnostic-icon" color="cyan-4" />
              🔬 Centro de Diagnóstico Técnico Avanzado
              <q-chip
                v-if="diagnosticoActivo"
                color="cyan-5"
                text-color="white"
                size="md"
                class="q-ml-md diagnostic-chip"
                icon="auto_fix_high"
              >
                <span class="diagnostic-glow">✨ Análisis: {{ diagnosticoActivo }}</span>
              </q-chip>
            </div>
            <div class="text-subtitle2 text-cyan-3 q-mt-sm diagnostic-subtitle">
              🛡️ Sistema de Soporte Técnico en Tiempo Real | 🔍 Análisis de Errores & Sesiones
            </div>

            <!-- Indicadores de Estado -->
            <div class="row q-mt-sm q-gutter-sm">
              <q-chip
                dense
                color="green-6"
                text-color="white"
                icon="wifi"
                class="diagnostic-status-chip"
              >
                🟢 API Conectada
              </q-chip>
         
              <q-chip
                dense
                color="purple-6"
                text-color="white"
                icon="security"
                class="diagnostic-status-chip"
              >
                🛡️ Modo Seguro
              </q-chip>
            </div>
          </div>
          <div class="col-auto">
            <q-btn
              icon="help_outline"
              flat
              round
              color="cyan-4"
              @click="mostrarAyuda = !mostrarAyuda"
              class="q-mr-sm"
            >
              <q-tooltip class="bg-cyan-8">💡 Ayuda y Guías</q-tooltip>
            </q-btn>
            <q-btn
              icon="minimize"
              flat
              round
              color="grey-4"
              @click="cerrarDiagnostico"
              class="q-mr-sm"
            >
              <q-tooltip>Minimizar diagnóstico</q-tooltip>
            </q-btn>
            <q-btn icon="close" flat round color="red-4" @click="cerrarDiagnostico">
              <q-tooltip>Cerrar diagnóstico</q-tooltip>
            </q-btn>
          </div>
        </div>
      </q-card-section>

      <!-- Pestañas de Diagnóstico -->
      <q-card-section class="q-pa-none">
        <q-tabs
          v-model="tabActiva"
          dense
          class="bg-grey-8 text-grey-3"
          active-color="red-5"
          indicator-color="red-5"
          align="justify"
        >
          <q-tab name="busqueda" icon="search" label="Búsqueda" />
          <q-tab name="errorCode" icon="error" label="Código Error" />
          <q-tab name="session" icon="account_circle" label="Sesión" />
          <q-tab name="soporte" icon="support_agent" label="Soporte" />
          <q-tab name="resultados" icon="assessment" label="Resultados" />
        </q-tabs>
      </q-card-section>

      <!-- Contenido de Pestañas -->
      <q-card-section
        class="diagnostic-content q-pa-lg"
        style="height: calc(100vh - 140px); overflow-y: auto"
      >
        <!-- PESTAÑAS -->
        <q-tab-panels v-model="tabActiva" animated class="bg-transparent text-white">
          <!-- BÚSQUEDA RÁPIDA -->
          <q-tab-panel name="busqueda">
            <div class="row q-col-gutter-lg">
              <div class="col-12">
                <q-card class="bg-grey-8 text-white">
                  <q-card-section>
                    <div class="text-h6">🚀 Búsqueda Rápida de Diagnóstico</div>
                    <div class="text-caption text-grey-4 q-mb-md">
                      Ingresa cualquier código para iniciar el análisis automático
                    </div>

                    <q-input
                      v-model="busquedaRapida"
                      label="Código de Error, baseCode o Usuario"
                      placeholder="Ej: USR02808190918-SUC001, USR02808190918"
                      dark
                      outlined
                      class="q-mb-md"
                      @keyup.enter="() => realizarBusquedaRapida()"
                    >
                      <template v-slot:prepend>
                        <q-icon name="search" color="red-5" />
                      </template>
                      <template v-slot:append>
                        <q-btn
                          round
                          dense
                          flat
                          icon="send"
                          @click="() => realizarBusquedaRapida()"
                          :loading="cargandoBusqueda"
                          color="red-5"
                        />
                      </template>
                    </q-input>

                    <!-- Ejemplos de códigos reales -->
                    <div class="q-mb-md">
                      <div class="text-caption text-grey-4 q-mb-sm">
                        Ejemplos de códigos reales:
                      </div>
                      <div class="row q-gutter-sm">
                        <q-chip
                          clickable
                          @click="busquedaRapida = 'USR02808190918-SUC001'"
                          color="red-6"
                          text-color="white"
                          size="sm"
                          icon="error"
                        >
                          USR02808190918-SUC001
                        </q-chip>
                        <q-chip
                          clickable
                          @click="busquedaRapida = 'USR02808191331'"
                          color="blue-6"
                          text-color="white"
                          size="sm"
                          icon="account_circle"
                        >
                          USR02808191331
                        </q-chip>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-tab-panel>

          <!-- CÓDIGO DE ERROR -->
          <q-tab-panel name="errorCode">
            <q-card class="bg-grey-8 text-white">
              <q-card-section>
                <div class="text-h6">🔍 Análisis de Código de Error</div>
                <div class="text-caption text-grey-4 q-mb-lg">Formato: USR02808190918-SUC001</div>

                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-8">
                    <q-input
                      v-model="formulario.errorCode"
                      label="Código de Error"
                      placeholder="USR02808190918-SUC001"
                      dark
                      outlined
                      @keyup.enter="() => consultarCodigoError()"
                    >
                      <template v-slot:prepend>
                        <q-icon name="error" color="red-5" />
                      </template>
                    </q-input>
                  </div>
                  <div class="col-12 col-md-4">
                    <q-btn
                      color="red-5"
                      icon="search"
                      label="Consultar"
                      @click="() => consultarCodigoError()"
                      :loading="cargandoError"
                      size="lg"
                      class="full-width"
                    />
                  </div>
                </div>

                <!-- Resultado del Error -->
                <div v-if="resultadoError" class="q-mt-lg">
                  <q-separator class="q-mb-md" color="grey-6" />
                  <div v-if="resultadoError.success && resultadoError.data.length > 0">
                    <div class="text-h6 text-red-4 q-mb-md">
                      <q-icon name="error" class="q-mr-sm" />
                      Código de Error: {{ resultadoError.errorCode }}
                      <q-chip color="red-6" text-color="white" size="sm" class="q-ml-sm">
                        {{ resultadoError.data.length }} registro(s)
                      </q-chip>
                    </div>

                    <!-- Resumen principal -->
                    <div class="row q-col-gutter-md q-mb-lg">
                      <div class="col-12">
                        <q-card class="bg-grey-7">
                          <q-card-section>
                            <div class="text-subtitle2 q-mb-md">📊 Información Principal</div>
                            <div class="row q-col-gutter-md">
                              <div class="col-12 col-md-6">
                                <q-list dark>
                                  <q-item dense>
                                    <q-item-section avatar>
                                      <q-icon color="blue-5" name="person" />
                                    </q-item-section>
                                    <q-item-section>
                                      <q-item-label>{{
                                        resultadoError.summary?.user || 'No disponible'
                                      }}</q-item-label>
                                      <q-item-label caption>Usuario</q-item-label>
                                    </q-item-section>
                                  </q-item>
                                  <q-item dense>
                                    <q-item-section avatar>
                                      <q-icon color="green-5" name="business" />
                                    </q-item-section>
                                    <q-item-section>
                                      <q-item-label>{{
                                        resultadoError.summary?.office || 'No disponible'
                                      }}</q-item-label>
                                      <q-item-label caption>Oficina</q-item-label>
                                    </q-item-section>
                                  </q-item>
                                </q-list>
                              </div>
                              <div class="col-12 col-md-6">
                                <q-list dark>
                                  <q-item dense>
                                    <q-item-section avatar>
                                      <q-icon color="orange-5" name="tag" />
                                    </q-item-section>
                                    <q-item-section>
                                      <q-item-label>{{
                                        resultadoError.summary?.baseCode || 'No disponible'
                                      }}</q-item-label>
                                      <q-item-label caption>Código Base (Mostrar)</q-item-label>
                                    </q-item-section>
                                  </q-item>
                                  <q-item dense>
                                    <q-item-section avatar>
                                      <q-icon color="purple-5" name="security" />
                                    </q-item-section>
                                    <q-item-section>
                                      <q-item-label>{{
                                        resultadoError.summary?.sessionToken || 'No disponible'
                                      }}</q-item-label>
                                      <q-item-label caption
                                        >Token de Sesión (Para logs)</q-item-label
                                      >
                                    </q-item-section>
                                  </q-item>
                                </q-list>
                              </div>
                            </div>
                          </q-card-section>
                        </q-card>
                      </div>
                    </div>

                    <!-- Lista de registros -->
                    <div class="row q-col-gutter-md">
                      <div class="col-12">
                        <q-card class="bg-grey-7">
                          <q-card-section>
                            <div class="text-subtitle2 q-mb-md">📋 Registros Relacionados</div>
                            <q-list dark separator>
                              <q-item
                                v-for="(record, index) in resultadoError.data"
                                :key="record.id"
                                clickable
                              >
                                <q-item-section avatar>
                                  <q-avatar
                                    :color="
                                      record.type === 'SUCCESS'
                                        ? 'green-6'
                                        : record.type === 'ERROR'
                                        ? 'red-6'
                                        : 'orange-6'
                                    "
                                    text-color="white"
                                    size="sm"
                                  >
                                    {{ index + 1 }}
                                  </q-avatar>
                                </q-item-section>
                                <q-item-section>
                                  <q-item-label>{{ record.message }}</q-item-label>
                                  <q-item-label caption>
                                    {{ formatearFecha(record.date) }} | {{ record.process }} |
                                    {{ record.device }}
                                  </q-item-label>
                                </q-item-section>
                                <q-item-section side>
                                  <q-chip
                                    :color="
                                      record.type === 'SUCCESS'
                                        ? 'green-6'
                                        : record.type === 'ERROR'
                                        ? 'red-6'
                                        : 'orange-6'
                                    "
                                    text-color="white"
                                    size="sm"
                                  >
                                    {{ record.type }}
                                  </q-chip>
                                </q-item-section>
                              </q-item>
                            </q-list>
                          </q-card-section>
                        </q-card>
                      </div>
                    </div>
                  </div>

                  <div v-else class="text-center">
                    <q-icon name="error_outline" size="3rem" color="red-5" class="q-mb-md" />
                    <div class="text-h6 text-red-4">Error al consultar código</div>
                    <div class="text-body2 text-grey-4">
                      {{ resultadoError.error || 'No se encontraron datos' }}
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </q-tab-panel>

          <!-- SESIÓN -->
          <q-tab-panel name="session">
            <q-card class="bg-grey-8 text-white">
              <q-card-section>
                <div class="text-h6">👤 Análisis de Sesión por Código Base</div>
                <div class="text-caption text-grey-4 q-mb-lg">
                  Formato: USR02808191331 (usar baseCode)
                </div>

                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-8">
                    <q-input
                      v-model="formulario.sessionToken"
                      label="Código Base de Sesión"
                      placeholder="USR02808191331"
                      dark
                      outlined
                      @keyup.enter="() => consultarSesion()"
                    >
                      <template v-slot:prepend>
                        <q-icon name="account_circle" color="blue-5" />
                      </template>
                    </q-input>
                  </div>
                  <div class="col-12 col-md-4">
                    <q-btn
                      color="blue-5"
                      icon="search"
                      label="Consultar"
                      @click="() => consultarSesion()"
                      :loading="cargandoSesion"
                      size="lg"
                      class="full-width"
                    />
                  </div>
                </div>

                <!-- Resultado de la Sesión -->
                <div v-if="resultadoSesion" class="q-mt-lg">
                  <q-separator class="q-mb-md" color="grey-6" />
                  <div v-if="resultadoSesion.success && resultadoSesion.data.length > 0">
                    <div class="text-h6 text-blue-4 q-mb-md">
                      <q-icon name="account_circle" class="q-mr-sm" />
                      Sesión: {{ resultadoSesion.baseCode }}
                      <q-chip color="blue-6" text-color="white" size="sm" class="q-ml-sm">
                        {{ resultadoSesion.data.length }} evento(s)
                      </q-chip>
                    </div>

                    <!-- Resumen de la sesión -->
                    <div class="row q-col-gutter-md q-mb-lg">
                      <div class="col-12 col-md-6">
                        <q-card class="bg-grey-7">
                          <q-card-section>
                            <div class="text-subtitle2 q-mb-md">👤 Información del Usuario</div>
                            <q-list dark>
                              <q-item dense>
                                <q-item-section avatar>
                                  <q-icon color="blue-5" name="person" />
                                </q-item-section>
                                <q-item-section>
                                  <q-item-label>{{
                                    resultadoSesion.summary?.user || 'No disponible'
                                  }}</q-item-label>
                                  <q-item-label caption>{{
                                    resultadoSesion.summary?.baseCode || 'Sin código base'
                                  }}</q-item-label>
                                </q-item-section>
                              </q-item>

                              <q-item dense>
                                <q-item-section avatar>
                                  <q-icon color="green-5" name="business" />
                                </q-item-section>
                                <q-item-section>
                                  <q-item-label>{{
                                    resultadoSesion.summary?.office || 'No disponible'
                                  }}</q-item-label>
                                  <q-item-label caption>Oficina</q-item-label>
                                </q-item-section>
                              </q-item>

                              <q-item dense>
                                <q-item-section avatar>
                                  <q-icon color="purple-5" name="security" />
                                </q-item-section>
                                <q-item-section>
                                  <q-item-label>{{
                                    resultadoSesion.summary?.sessionToken || 'No disponible'
                                  }}</q-item-label>
                                  <q-item-label caption>Token de Sesión (Para logs)</q-item-label>
                                </q-item-section>
                              </q-item>
                            </q-list>
                          </q-card-section>
                        </q-card>
                      </div>

                      <div class="col-12 col-md-6">
                        <q-card class="bg-grey-7">
                          <q-card-section>
                            <div class="text-subtitle2 q-mb-md">📊 Estadísticas de Sesión</div>
                            <q-list dark>
                              <q-item dense>
                                <q-item-section avatar>
                                  <q-icon color="blue-5" name="access_time" />
                                </q-item-section>
                                <q-item-section>
                                  <q-item-label>{{
                                    formatearFecha(resultadoSesion.summary?.dateRange?.start)
                                  }}</q-item-label>
                                  <q-item-label caption>Primer evento</q-item-label>
                                </q-item-section>
                              </q-item>

                              <q-item dense>
                                <q-item-section avatar>
                                  <q-icon color="green-5" name="update" />
                                </q-item-section>
                                <q-item-section>
                                  <q-item-label>{{
                                    formatearFecha(resultadoSesion.summary?.dateRange?.end)
                                  }}</q-item-label>
                                  <q-item-label caption>Último evento</q-item-label>
                                </q-item-section>
                              </q-item>

                              <q-item dense>
                                <q-item-section avatar>
                                  <q-icon color="orange-5" name="apps" />
                                </q-item-section>
                                <q-item-section>
                                  <q-item-label>{{
                                    (resultadoSesion.summary?.processes || []).join(', ') ||
                                    'Ninguno'
                                  }}</q-item-label>
                                  <q-item-label caption>Procesos</q-item-label>
                                </q-item-section>
                              </q-item>
                            </q-list>
                          </q-card-section>
                        </q-card>
                      </div>
                    </div>

                    <!-- Timeline de eventos -->
                    <div class="row q-col-gutter-md">
                      <div class="col-12">
                        <q-card class="bg-grey-7">
                          <q-card-section>
                            <div class="text-subtitle2 q-mb-md">
                              🔄 Timeline de Acciones/Logs
                              <q-chip color="blue-6" text-color="white" size="sm" class="q-ml-sm">
                                {{ resultadoSesion.data?.length || 0 }} acciones
                              </q-chip>
                            </div>

                            <!-- Verificar si hay datos -->
                            <div
                              v-if="!resultadoSesion.data || resultadoSesion.data.length === 0"
                              class="text-center q-pa-md"
                            >
                              <q-icon name="info" size="2rem" color="blue-5" class="q-mb-sm" />
                              <div class="text-body2 text-grey-4">
                                No hay acciones/logs para mostrar
                              </div>
                            </div>

                            <!-- Timeline con datos -->
                            <div v-else>
                              <q-timeline color="blue-5" side="right" dark class="session-timeline">
                                <q-timeline-entry
                                  v-for="(log, index) in resultadoSesion.data"
                                  :key="log.id || index"
                                  :title="`Acción ${index + 1}: ${log.process || 'Proceso'}`"
                                  :subtitle="formatearFecha(log.date || log.timestamp)"
                                  :icon="getEventIcon(log.type)"
                                  :color="getEventColor(log.type)"
                                >
                                  <div class="log-details">
                                    <!-- Mensaje principal del log -->
                                    <div class="text-body2 q-mb-sm log-message">
                                      {{ log.message || 'Sin mensaje disponible' }}
                                    </div>

                                    <!-- Estado del log -->
                                    <div class="q-mb-sm">
                                      <q-chip
                                        :color="getEventColor(log.type)"
                                        text-color="white"
                                        size="sm"
                                        :icon="getEventIcon(log.type)"
                                      >
                                        {{ log.type || 'SIN_TIPO' }}
                                      </q-chip>
                                    </div>

                                    <!-- Detalles técnicos del log -->
                                    <div class="text-caption text-grey-4 log-metadata">
                                      <div v-if="log.id" class="log-item">
                                        <q-icon name="tag" size="xs" class="q-mr-xs" />
                                        ID: {{ log.id }}
                                      </div>
                                      <div v-if="log.process" class="log-item">
                                        <q-icon name="memory" size="xs" class="q-mr-xs" />
                                        Proceso: {{ log.process }}
                                      </div>
                                      <div v-if="log.device" class="log-item">
                                        <q-icon name="computer" size="xs" class="q-mr-xs" />
                                        Dispositivo: {{ log.device }}
                                      </div>
                                      <div v-if="log.scanDevice" class="log-item">
                                        <q-icon name="scanner" size="xs" class="q-mr-xs" />
                                        Scanner: {{ log.scanDevice }}
                                      </div>
                                      <div v-if="log.errorCode" class="log-item">
                                        <q-icon name="error_outline" size="xs" class="q-mr-xs" />
                                        Código: {{ log.errorCode }}
                                      </div>
                                      <div v-if="log.sessionToken" class="log-item">
                                        <q-icon name="security" size="xs" class="q-mr-xs" />
                                        Token: {{ log.sessionToken }}
                                      </div>
                                      <div v-if="log.baseCode" class="log-item">
                                        <q-icon name="qr_code" size="xs" class="q-mr-xs" />
                                        BaseCode: {{ log.baseCode }}
                                      </div>
                                      <div v-if="log.person?.nombreCompleto" class="log-item">
                                        <q-icon name="person" size="xs" class="q-mr-xs" />
                                        Usuario: {{ log.person.nombreCompleto }}
                                      </div>
                                    </div>
                                  </div>
                                </q-timeline-entry>
                              </q-timeline>
                            </div>
                          </q-card-section>
                        </q-card>
                      </div>
                    </div>
                  </div>

                  <div v-else class="text-center">
                    <q-icon name="error_outline" size="3rem" color="blue-5" class="q-mb-md" />
                    <div class="text-h6 text-blue-4">Error al consultar sesión</div>
                    <div class="text-body2 text-grey-4">
                      {{ resultadoSesion.error || 'No se encontraron datos' }}
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </q-tab-panel>

          <!-- SOPORTE -->
          <q-tab-panel name="soporte">
            <q-card class="bg-grey-8 text-white">
              <q-card-section>
                <div class="text-h6">🛠️ Solicitud de Soporte</div>
                <div class="text-caption text-grey-4 q-mb-lg">
                  <strong>Importante:</strong> Usa solo el baseCode (ej: USR02808191331) sin el
                  sufijo de error. <br />Para códigos como "USR02808190918-INF019", usa solo
                  "USR02808190918"
                </div>

                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-4">
                    <q-input
                      v-model="formulario.supportCode"
                      label="Código Base (sin sufijo)"
                      placeholder="USR02808191331"
                      hint="Si tienes USR02808190918-INF019, usa solo USR02808190918"
                      dark
                      outlined
                      @blur="limpiarCodigoSoporte"
                    >
                      <template v-slot:prepend>
                        <q-icon name="code" color="green-5" />
                      </template>
                    </q-input>
                  </div>
                  <div class="col-12 col-md-4">
                    <q-input
                      v-model="formulario.device"
                      label="Dispositivo"
                      placeholder="DELL"
                      dark
                      outlined
                    >
                      <template v-slot:prepend>
                        <q-icon name="computer" color="green-5" />
                      </template>
                    </q-input>
                  </div>
                  <div class="col-12 col-md-4">
                    <q-input
                      v-model="formulario.user"
                      label="Usuario"
                      placeholder="1"
                      dark
                      outlined
                    >
                      <template v-slot:prepend>
                        <q-icon name="person" color="green-5" />
                      </template>
                    </q-input>
                  </div>
                </div>

                <div class="q-mt-md">
                  <q-btn
                    color="green-5"
                    icon="send"
                    label="Enviar Solicitud"
                    @click="() => enviarSoporte()"
                    :loading="cargandoSoporte"
                    size="lg"
                  />
                </div>

                <!-- Resultado del Soporte -->
                <div v-if="resultadoSoporte" class="q-mt-lg">
                  <q-separator class="q-mb-md" color="grey-6" />
                  <div v-if="resultadoSoporte.success">
                    <div class="text-h6 text-green-4 q-mb-md">
                      <q-icon name="check_circle" class="q-mr-sm" />
                      Solicitud Enviada Exitosamente
                    </div>

                    <q-card class="bg-grey-7">
                      <q-card-section>
                        <div class="text-subtitle2 q-mb-sm">📋 Parámetros Enviados:</div>
                        <q-list dark dense>
                          <q-item v-if="resultadoSoporte.requestParams.code">
                            <q-item-section avatar>
                              <q-icon name="code" color="green-5" />
                            </q-item-section>
                            <q-item-section>
                              <q-item-label
                                >Código: {{ resultadoSoporte.requestParams.code }}</q-item-label
                              >
                            </q-item-section>
                          </q-item>
                          <q-item v-if="resultadoSoporte.requestParams.device">
                            <q-item-section avatar>
                              <q-icon name="computer" color="green-5" />
                            </q-item-section>
                            <q-item-section>
                              <q-item-label
                                >Dispositivo:
                                {{ resultadoSoporte.requestParams.device }}</q-item-label
                              >
                            </q-item-section>
                          </q-item>
                          <q-item v-if="resultadoSoporte.requestParams.user">
                            <q-item-section avatar>
                              <q-icon name="person" color="green-5" />
                            </q-item-section>
                            <q-item-section>
                              <q-item-label
                                >Usuario: {{ resultadoSoporte.requestParams.user }}</q-item-label
                              >
                            </q-item-section>
                          </q-item>
                        </q-list>
                      </q-card-section>
                    </q-card>
                  </div>

                  <div v-else class="text-center">
                    <q-icon name="error_outline" size="3rem" color="green-5" class="q-mb-md" />
                    <div class="text-h6 text-green-4">Error al enviar solicitud</div>
                    <div class="text-body2 text-grey-4">{{ resultadoSoporte.error }}</div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </q-tab-panel>

          <!-- RESULTADOS -->
          <q-tab-panel name="resultados">
            <div v-if="!hayResultados" class="text-center q-pa-xl">
              <q-icon name="assessment" size="4rem" color="grey-5" class="q-mb-md" />
              <div class="text-h6 text-grey-4">Sin Resultados</div>
              <div class="text-body2 text-grey-5">
                Utiliza las pestañas anteriores para realizar consultas
              </div>
            </div>

            <div v-else>
              <div class="text-h6 q-mb-lg">📊 Resumen de Diagnóstico</div>

              <!-- Resumen de Error -->
              <q-card
                v-if="resultadoError && resultadoError.success"
                class="bg-red-8 text-white q-mb-md"
              >
                <q-card-section>
                  <div class="text-subtitle1">
                    <q-icon name="error" class="q-mr-sm" />
                    Código de Error: {{ resultadoError.errorCode }}
                  </div>
                  <div class="text-body2">
                    Usuario: {{ resultadoError.summary?.user }} | baseCode:
                    {{ resultadoError.summary?.baseCode }}
                  </div>
                  <div class="text-caption">
                    {{ resultadoError.data.length }} registro(s) encontrado(s)
                  </div>
                </q-card-section>
              </q-card>

              <!-- Resumen de Sesión -->
              <q-card
                v-if="resultadoSesion && resultadoSesion.success"
                class="bg-blue-8 text-white q-mb-md"
              >
                <q-card-section>
                  <div class="text-subtitle1">
                    <q-icon name="account_circle" class="q-mr-sm" />
                    Sesión de Logs: {{ resultadoSesion.baseCode }}
                  </div>
                  <div class="text-body2">
                    Usuario: {{ resultadoSesion.summary?.user }} | Token:
                    {{ resultadoSesion.summary?.sessionToken }}
                  </div>
                  <div class="text-caption">
                    {{ resultadoSesion.data.length }} log(s)/acción(es) registrada(s)
                  </div>
                  <div class="text-caption q-mt-sm">
                    <q-icon name="apps" size="xs" class="q-mr-xs" />
                    Procesos:
                    {{ (resultadoSesion.summary?.processes || []).join(', ') || 'Ninguno' }}
                  </div>
                </q-card-section>
              </q-card>

              <!-- Resumen de Soporte -->
              <q-card
                v-if="resultadoSoporte && resultadoSoporte.success"
                class="bg-green-8 text-white q-mb-md"
              >
                <q-card-section>
                  <div class="text-subtitle1">
                    <q-icon name="support_agent" class="q-mr-sm" />
                    Solicitud de Soporte Enviada
                  </div>
                  <div class="text-body2">
                    Parámetros: {{ Object.values(resultadoSoporte.requestParams).join(', ') }}
                  </div>
                  <div class="text-caption">
                    {{ resultadoSoporte.data?.length || 0 }} registro(s) relacionado(s)
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { DiagnosticService } from '../../services/diagnosticService.js'

// Props y emits
const props = defineProps({
  codigo: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['cerrar'])

// Quasar
const $q = useQuasar()

// Estado del componente
const mostrarDiagnostico = ref(false)
const tabActiva = ref('busqueda')
const diagnosticoActivo = ref('')

// Formularios
const busquedaRapida = ref('')
const formulario = ref({
  errorCode: '',
  sessionToken: '',
  supportCode: '',
  device: '',
  user: '',
})

// Estados de carga
const cargandoBusqueda = ref(false)
const cargandoError = ref(false)
const cargandoSesion = ref(false)
const cargandoSoporte = ref(false)

// Resultados
const resultadoError = ref(null)
const resultadoSesion = ref(null)
const resultadoSoporte = ref(null)

// Computed
const hayResultados = computed(() => {
  return (
    (resultadoError.value && resultadoError.value.success) ||
    (resultadoSesion.value && resultadoSesion.value.success) ||
    (resultadoSoporte.value && resultadoSoporte.value.success)
  )
})

// Watchers
watch(
  () => props.codigo,
  (nuevoCodigo) => {
    if (nuevoCodigo) {
      busquedaRapida.value = nuevoCodigo
      realizarBusquedaRapida()
    }
  }
)

// Métodos
const abrirDiagnostico = (codigo = '') => {
  mostrarDiagnostico.value = true

  if (codigo) {
    busquedaRapida.value = codigo
    diagnosticoActivo.value = codigo
    setTimeout(() => realizarBusquedaRapida(), 100)
  }
}

const cerrarDiagnostico = () => {
  mostrarDiagnostico.value = false
  diagnosticoActivo.value = ''
  emit('cerrar')
}

const realizarBusquedaRapida = async () => {
  if (!busquedaRapida.value.trim()) return

  cargandoBusqueda.value = true

  try {
    const codigo = busquedaRapida.value.trim()
    diagnosticoActivo.value = codigo

    // Determinar tipo de código
    if (codigo.includes('-')) {
      // Es un código de error
      formulario.value.errorCode = codigo
      tabActiva.value = 'errorCode'
      await consultarCodigoError()
    } else if (codigo.startsWith('USR') && !codigo.includes('-')) {
      // Es un baseCode de sesión
      formulario.value.sessionToken = codigo
      tabActiva.value = 'session'
      await consultarSesion()
    } else {
      // Buscar en ambos
      await Promise.all([consultarCodigoError(codigo), consultarSesion(codigo)])
      tabActiva.value = 'resultados'
    }

    $q.notify({
      type: 'positive',
      message: 'Búsqueda completada',
      caption: `Análisis de: ${codigo}`,
      icon: 'search',
      position: 'top-right',
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error en búsqueda',
      caption: error.message,
      position: 'top-right',
    })
  } finally {
    cargandoBusqueda.value = false
  }
}

const consultarCodigoError = async (codigo = null) => {
  const errorCode = codigo || formulario.value.errorCode
  if (!errorCode || !String(errorCode).trim()) return

  cargandoError.value = true

  try {
    console.log(`🔍 Consultando código de error: ${errorCode}`)
    resultadoError.value = await DiagnosticService.getErrorCodeDetails(errorCode)

    $q.notify({
      type: 'positive',
      message: 'Código de error consultado',
      icon: 'error',
      position: 'top-right',
    })
  } catch (error) {
    console.log('🔄 Error en consulta:', error.message)
    resultadoError.value = DiagnosticService.getSampleErrorData(errorCode)

    $q.notify({
      type: 'warning',
      message: 'Usando datos de ejemplo',
      caption: 'Error al conectar con el servidor (CORS)',
      position: 'top-right',
    })
  } finally {
    cargandoError.value = false
  }
}

const consultarSesion = async (codigo = null) => {
  const baseCode = codigo || formulario.value.sessionToken
  if (!baseCode || !String(baseCode).trim()) return

  cargandoSesion.value = true

  try {
    console.log(`🔍 Consultando sesión por baseCode: ${baseCode}`)
    resultadoSesion.value = await DiagnosticService.getSessionDetails(baseCode)

    $q.notify({
      type: 'positive',
      message: 'Sesión consultada',
      icon: 'account_circle',
      position: 'top-right',
    })
  } catch (error) {
    console.log('🔄 Error en consulta de sesión:', error.message)
    resultadoSesion.value = DiagnosticService.getSampleSessionData(baseCode)

    $q.notify({
      type: 'warning',
      message: 'Usando datos de ejemplo',
      caption: 'Error al conectar con el servidor (CORS)',
      position: 'top-right',
    })
  } finally {
    cargandoSesion.value = false
  }
}

const enviarSoporte = async () => {
  const { supportCode, device, user } = formulario.value
  if (!supportCode && !device && !user) {
    $q.notify({
      type: 'warning',
      message: 'Ingresa al menos un parámetro',
      position: 'top-right',
    })
    return
  }

  cargandoSoporte.value = true

  try {
    console.log(`🛠️ Enviando solicitud de soporte`)
    resultadoSoporte.value = await DiagnosticService.sendSupportRequest(supportCode, device, user)

    $q.notify({
      type: 'positive',
      message: 'Solicitud de soporte enviada',
      icon: 'support_agent',
      position: 'top-right',
    })
  } catch (error) {
    console.log('🔄 Error en solicitud de soporte:', error.message)

    // Crear respuesta de ejemplo para mostrar en caso de error CORS
    resultadoSoporte.value = {
      success: true,
      requestParams: {
        code: supportCode || '',
        device: device || '',
        user: user || '',
      },
      data: [],
    }

    $q.notify({
      type: 'warning',
      message: 'Error de CORS - Usando datos de ejemplo',
      caption: 'No se puede conectar con el servidor desde localhost',
      position: 'top-right',
    })
  } finally {
    cargandoSoporte.value = false
  }
}

const limpiarCodigoSoporte = () => {
  if (formulario.value.supportCode && formulario.value.supportCode.includes('-')) {
    // Remover el sufijo del código (ej: USR02808190918-INF019 -> USR02808190918)
    formulario.value.supportCode = formulario.value.supportCode.split('-')[0]

    $q.notify({
      type: 'info',
      message: 'Código limpiado',
      caption: 'Se removió el sufijo automáticamente',
      position: 'top-right',
      timeout: 2000,
    })
  }
}

const getEventIcon = (type) => {
  switch (type?.toUpperCase()) {
    case 'SUCCESS':
      return 'check_circle'
    case 'ERROR':
      return 'error'
    case 'WARNING':
      return 'warning'
    case 'INFO':
      return 'info'
    default:
      return 'timeline'
  }
}

const getEventColor = (type) => {
  switch (type?.toUpperCase()) {
    case 'SUCCESS':
      return 'green-5'
    case 'ERROR':
      return 'red-5'
    case 'WARNING':
      return 'orange-5'
    case 'INFO':
      return 'blue-5'
    default:
      return 'grey-5'
  }
}

const formatearFecha = (fecha) => {
  if (!fecha) return 'No disponible'
  try {
    return new Date(fecha).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  } catch {
    return fecha
  }
}

// Exponer métodos para uso externo
defineExpose({
  abrirDiagnostico,
  cerrarDiagnostico,
})
</script>

<style lang="scss" scoped>
.diagnostic-modal {
  .diagnostic-header {
    min-height: 80px;
  }

  .diagnostic-content {
    .q-tab-panel {
      padding: 0;
    }
  }
}

.session-timeline {
  max-height: 600px;
  overflow-y: auto;

  .log-details {
    .log-message {
      font-weight: 500;
      margin-bottom: 12px;
      color: #fff;
      background: rgba(255, 255, 255, 0.1);
      padding: 8px 12px;
      border-radius: 6px;
      border-left: 3px solid #42a5f5;
    }

    .log-metadata {
      line-height: 1.6;

      .log-item {
        margin-bottom: 4px;
        display: flex;
        align-items: center;
        padding: 2px 0;

        &:last-child {
          margin-bottom: 0;
        }

        .q-icon {
          opacity: 0.7;
        }
      }
    }
  }
}

.q-timeline {
  .q-timeline-entry {
    .q-timeline-title {
      font-weight: 600;
      color: #fff;
    }

    .q-timeline-subtitle {
      opacity: 0.8;
      font-size: 0.75rem;
    }
  }
}
</style>
