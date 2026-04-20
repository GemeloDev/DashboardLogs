<template>
  <!-- Modal de Diagnóstico Avanzado -->
  <q-dialog
    v-model="mostrarDiagnostico"
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
    @escape-key="cerrarDiagnostico"
  >
    <q-card class="diagnostic-modal diagnostico-dialog-fullscreen bg-grey-9">
      <!-- Header -->
      <q-card-section class="diagnostic-header">
        <div class="dashboard-header__wrap">
          <q-card flat bordered class="dashboard-hero__title-card text-white">
            <div class="diagnostic-header__top row items-start justify-between q-col-gutter-md">
              <div class="col">
                <div class="diagnostic-eyebrow">
                  <q-icon name="medical_services" size="18px" color="cyan-4" />
                  <span>Diagnóstico técnico</span>
                </div>

                <h1 class="hero-title q-mt-md q-mb-sm">
                  Centro de <span class="orange-santoro">Diagnóstico</span>
                  <br />
                  Técnico Avanzado
                </h1>

                <p class="diagnostic-subtitle q-mb-none">
                  Sistema de soporte técnico en tiempo real para análisis de errores, sesiones
                  y tokens.
                </p>
              </div>

              <div class="col-auto">
                <div class="diagnostic-actions">
                  <q-btn
                    icon="help_outline"
                    flat
                    round
                    color="cyan-4"
                    @click="mostrarAyuda"
                  >
                    <q-tooltip class="bg-cyan-8">Ayuda y guías</q-tooltip>
                  </q-btn>
                  <q-btn
                    icon="minimize"
                    flat
                    round
                    color="grey-4"
                    @click="cerrarDiagnostico"
                  >
                    <q-tooltip>Minimizar diagnóstico</q-tooltip>
                  </q-btn>
                  <q-btn icon="close" flat round color="red-4" @click="cerrarDiagnostico">
                    <q-tooltip>Cerrar diagnóstico</q-tooltip>
                  </q-btn>
                </div>
              </div>
            </div>

            <div class="diagnostic-meta q-mt-lg">
              <q-chip
                dense
                color="green-6"
                text-color="white"
                icon="wifi"
                class="diagnostic-status-chip"
              >
                API conectada
              </q-chip>

              <q-chip
                dense
                color="purple-6"
                text-color="white"
                icon="security"
                class="diagnostic-status-chip"
              >
                Modo seguro
              </q-chip>

              <q-chip
                v-if="diagnosticoActivo"
                dense
                color="cyan-5"
                text-color="white"
                icon="auto_fix_high"
                class="diagnostic-status-chip"
              >
                Análisis: {{ diagnosticoActivo }}
              </q-chip>
            </div>
          </q-card>
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
          <q-tab name="session" icon="code" label="Código Base" />
          <q-tab name="token" icon="account_circle" label="Token" />
          <q-tab name="soporte" icon="support_agent" label="Soporte" />
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
                      <div class="text-caption text-grey-4 q-mb-sm">Ejemplos de códigos :</div>
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
                          icon="code"
                        >
                          USR02808191331
                        </q-chip>
                        <q-chip
                          clickable
                          @click="busquedaRapida = 'pBwQdT8snpp7'"
                          color="purple-6"
                          text-color="white"
                          size="sm"
                          icon="account_circle"
                        >
                          pBwQdT8snpp7
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
                                    {{ formatearFechaDetails(record.date) }} | {{ record.process }} |
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
                <div class="row justify-center">
                  <div class="col-12 justify-center q-gutter-y-xs text-center">
                    <div class="text-h6 q-pa-md q-my-md">👤 Análisis de Sesión por Código Base</div>
                    <div class="text-caption text-grey-4 q-my-lg q-mx-md">
                      Formato: USR02808191331 (usar baseCode)
                    </div>
                  </div>
                  <div class="col-md-6 col-xs-12 q-gutter-y-md">
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
                    <q-btn
                      color="blue-5"
                      icon="search"
                      label="Consultar"
                      @click="() => consultarSesion()"
                      :loading="cargandoSesion"
                      size="md"
                      class="full-width"
                    />
                  </div>
                </div>

                <!-- Resultado de la Sesión -->
                <div v-if="resultadoSesion" class="q-mt-lg">
                  <q-separator class="q-mb-md" color="grey-6" />
                  <div v-if="resultadoSesion.success && resultadoSesion.data.length > 0">
                    <div class="text-h6 text-blue-4 q-pa-md q-mb-lg text-center">
                      <q-icon name="account_circle" class="q-mr-sm" />
                      Sesión: {{ resultadoSesion.baseCode }}
                      <q-chip color="blue-6" text-color="white" size="sm" class="q-ml-sm">
                        {{ resultadoSesion.data.length }} evento(s)
                      </q-chip>
                    </div>

                    <!-- Resumen de la sesión -->
                    <div class="row justify-center q-col-gutter-md">
                      <div class="col-md-6 col-sm-12">
                        <!-- Card de info del usuario -->
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
                        <!-- Card de estadísticas de sesión -->
                        <q-card class="bg-grey-7 q-mt-lg">
                          <q-card-section>
                            <div class="text-subtitle2 q-mb-md">📊 Estadísticas de Sesión</div>
                            <q-list dark>
                              <q-item dense>
                                <q-item-section avatar>
                                  <q-icon color="blue-5" name="access_time" />
                                </q-item-section>
                                <q-item-section>
                                  <q-item-label>{{
                                    formatearFechaDetails(resultadoSesion.summary?.dateRange?.start)
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
                                    formatearFechaDetails(resultadoSesion.summary?.dateRange?.end)
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

                      <!-- Timeline de eventos -->
                      <div class="col-md-6 col-sm-12">
                        <q-card class="bg-grey-7">
                          <q-card-section>
                            <div class="text-subtitle2 q-pa-sm">
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
                            <div v-else class="q-px-md">
                              <q-timeline
                                color="blue-5"
                                side="right"
                                dark
                                class="session-timeline q-pl-md"
                              >
                                <q-timeline-entry
                                  v-for="(log, index) in resultadoSesion.data"
                                  :key="log.id || index"
                                  :title="`Acción ${index + 1}: ${log.process || 'Proceso'}`"
                                  :subtitle="formatearFechaDetails(log.date || log.timestamp)"
                                  :icon="getEventIcon(log.type)"
                                  :color="getEventColor(log.type)"
                                >
                                  <div class="log-details">
                                    <!-- Mensaje principal del log -->
                                    <div class="text-body2 q-mb-sm log-message">
                                      <p class="ellipsis-3-lines">{{ log.message || 'Sin mensaje disponible' }}</p>

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

          <!-- TOKEN -->
          <q-tab-panel name="token">
            <q-card class="bg-grey-8 text-white">
              <q-card-section>
                <div class="row justify-center">
                  <div class="col-12 justify-center q-gutter-y-xs text-center">
                    <div class="text-h6 q-pa-md">📔 Análisis de Sesión por Token</div>
                    <div class="text-caption text-grey-4 q-mb-lg q-mx-md">
                      Ejemplo: ihJak3VeUMNA
                    </div>
                  </div>
                  <div class="col-md-6 col-xs-12 q-gutter-y-md">
                    <q-input
                      v-model="formulario.tokenCode"
                      label="Token de Sesión"
                      placeholder="ihJak3VeUMNA"
                      dark
                      outlined
                      @keyup.enter="() => consultarToken()"
                    >
                      <template v-slot:prepend>
                        <q-icon name="data_object" color="blue-5" />
                      </template>
                    </q-input>
                    <q-btn
                      color="blue-5"
                      icon="search"
                      label="Consultar"
                      @click="() => consultarToken()"
                      :loading="cargandoSesion"
                      size="md"
                      class="full-width"
                    />
                  </div>
                  <!-- Resultado de la Sesión  -->
                  <div class="col-12 q-mt-lg" v-if="resultadoToken !== null">
                    <ResultadosByToken
                      :counterUsers="countUsers"
                      :counterOficinas="countOficinas"
                      :resultados="resultadoToken"
                    />
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
                    <q-select
                      v-model="formulario.device"
                      :options="opcionesSoporteDispositivos"
                      label="Dispositivo"
                      placeholder="Selecciona un dispositivo"
                      dark
                      outlined
                      use-input
                      input-debounce="300"
                      @filter="filtrarSoporteDispositivos"
                      emit-value
                      map-options
                    >
                      <template v-slot:prepend>
                        <q-icon name="computer" color="green-5" />
                      </template>
                    </q-select>
                  </div>
                  <div class="col-12 col-md-4">
                    <q-select
                      v-model="formulario.user"
                      :options="opcionesSoporteUsuarios"
                      label="Usuario"
                      placeholder="Selecciona un usuario"
                      dark
                      outlined
                      use-input
                      input-debounce="300"
                      @filter="filtrarSoporteUsuarios"
                      emit-value
                      map-options
                    >
                      <template v-slot:prepend>
                        <q-icon name="person" color="green-5" />
                      </template>
                    </q-select>
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

                    <!-- Resultados devueltos por /support -->
                    <div
                      v-if="resultadoSoporte.data && resultadoSoporte.data.length"
                      class="q-mt-md"
                    >
                      <div class="text-subtitle2 q-mb-sm">🔎 Resultados:</div>
                      <div class="row q-col-gutter-md">
                        <div
                          v-for="(r, i) in resultadoSoporte.data"
                          :key="r.id || i"
                          class="col-12 col-md-6"
                        >
                          <q-card class="bg-grey-9 text-white q-mb-sm">
                            <q-card-section>
                              <div class="row items-start">
                                <div class="col">
                                  <div class="text-subtitle1 q-mb-xs">
                                    {{ r.type || r.proceso || 'Evento' }}
                                  </div>
                                  <div class="text-body2 log-message">
                                    {{ r.message || r.detail || r.data || 'Sin mensaje' }}
                                  </div>
                                  <div class="text-caption q-mt-sm log-metadata">
                                    <div class="log-item">
                                      <q-icon name="person" size="xs" class="q-mr-xs" />
                                      {{
                                        '(' +
                                          r.person.curp +
                                          ') ' +
                                          r.person.nombres +
                                          ' ' +
                                          r.person.primerApellido +
                                          ' ' +
                                          r.person.segundoApellido ||
                                        r.persona ||
                                        r.baseCode ||
                                        'N/A'
                                      }}
                                    </div>
                                    <div class="log-item">
                                      <q-icon name="apartment" size="xs" class="q-mr-xs" />
                                      {{ r.oficina.nombre || r.office || 'N/A' }}
                                    </div>
                                    <div class="log-item">
                                      <q-icon name="computer" size="xs" class="q-mr-xs" />
                                      {{ r.device || r.dispositivo || 'N/A' }}
                                    </div>
                                    <div class="log-item">
                                      <q-icon name="qr_code_scanner" size="xs" class="q-mr-xs" />
                                      {{ r.scanDevice || r.scan_device || r.scanner || 'N/A' }}
                                    </div>
                                  </div>
                                </div>
                                <div class="col-auto">
                                  <q-chip dense color="primary" text-color="white">{{
                                    formatearFechaDetails(r.date)
                                  }}</q-chip>
                                </div>
                              </div>
                            </q-card-section>
                          </q-card>
                        </div>
                      </div>
                    </div>
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

  <EscritorioGuia ref="escritorioGuia" />
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { DiagnosticService } from '../../services/diagnosticService.js'
import { CatalogService } from '../../services/catalogService.js'
import EscritorioGuia from './EscritorioGuia.vue'
import ResultadosByToken from './resultadosEscritorio/ResultadosByToken.vue'
import { getEventColor, getEventIcon, counterKeyRegister } from 'src/helpers/index.js'

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
const escritorioGuia = ref(false)

// Formularios
const busquedaRapida = ref('')
const formulario = ref({
  errorCode: '',
  sessionToken: '',
  supportCode: '',
  tokenCode: '',
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

// Opciones locales para Soporte
const opcionesSoporteDispositivos = ref([])
const opcionesSoporteUsuarios = ref([])

// Estados de análisis de token
const resultadoToken = ref(null)
const countUsers = ref(0)
const countOficinas = ref(0)

const cargarCatalogosSoporte = async () => {
  try {
    const [dispositivos, personas] = await Promise.all([
      CatalogService.cargarDispositivos(),
      CatalogService.cargarPersonas(),
    ])

    opcionesSoporteDispositivos.value = dispositivos
    opcionesSoporteUsuarios.value = personas
    return true
  } catch (error) {
    console.warn('Error cargando catálogos de soporte:', error)
    opcionesSoporteDispositivos.value = [
      { label: 'PC-01', value: 'PC-01' },
      { label: 'PC-02', value: 'PC-02' },
    ]
    opcionesSoporteUsuarios.value = [
      { label: 'Usuario Demo (123)', value: 123 },
      { label: 'Usuario Demo (456)', value: 456 },
    ]
    return false
  }
}

const filtrarSoporteDispositivos = (val, update) => {
  update(() => {
    if (!val || val === '') {
      // no-op, mantener lista
    } else {
      const needle = val.toLowerCase()
      opcionesSoporteDispositivos.value = opcionesSoporteDispositivos.value.filter(
        (d) => String(d.label).toLowerCase().indexOf(needle) > -1
      )
    }
  })
}

const filtrarSoporteUsuarios = (val, update) => {
  update(() => {
    if (!val || val === '') {
      // no-op
    } else {
      const needle = val.toLowerCase()
      opcionesSoporteUsuarios.value = opcionesSoporteUsuarios.value.filter(
        (u) => String(u.label).toLowerCase().indexOf(needle) > -1
      )
    }
  })
}

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
  // cargar catálogos de soporte
  cargarCatalogosSoporte()

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
    } else if(!codigo.startsWith('USR') && !codigo.includes('-')) {
      // Es un token de sesión
      formulario.value.tokenCode = codigo
      tabActiva.value = 'token'
      await consultarToken()
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

const mostrarAyuda = () => {
  console.log('🔍 Intentando abrir diagnóstico...')
  console.log('🔍 Diagnositico.value...', escritorioGuia.value)

  if (escritorioGuia.value) {
    escritorioGuia.value.abrirGuia()
  } else {
    console.log('No se localizo el componente EscritorioGuia')
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
      caption: 'Error al conectar con el servidor',
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
      caption: 'Error al conectar con el servidor',
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
    // Normalizar si vienen como objetos { label, value }
    let deviceParam = device
    if (device && typeof device === 'object' && device.value !== undefined)
      deviceParam = device.value
    let userParam = user
    if (user && typeof user === 'object' && user.value !== undefined) userParam = user.value

    resultadoSoporte.value = await DiagnosticService.sendSupportRequest(
      supportCode,
      deviceParam,
      userParam
    )

    $q.notify({
      type: 'positive',
      message: 'Solicitud de soporte enviada',
      icon: 'support_agent',
      position: 'top-right',
    })
  } catch (error) {
    console.log('🔄 Error en solicitud de soporte:', error.message)

    // Crear respuesta de ejemplo para mostrar en caso de error de conexión
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
      message: 'Error de conexión - Usando datos de ejemplo',
      caption: 'No se puede conectar con el servidor',
      position: 'top-right',
    })
  } finally {
    cargandoSoporte.value = false
  }
}

const limpiarCodigoSoporte = () => {
  if (formulario.value.supportCode && formulario.value.supportCode.includes('-')) {
    // Remover el sufijo del código (ej: USR02808190918-INF019 -> USR02808190918)
    // formulario.value.supportCode = formulario.value.supportCode.split('-')[0]

    $q.notify({
      type: 'info',
      message: 'Código limpiado',
      caption: 'Se removió el sufijo automáticamente',
      position: 'top-right',
      timeout: 2000,
    })
  }
}

const consultarToken = async (codigo = null) => {
  const sesion = codigo || formulario.value.tokenCode
  if (!sesion || !String(sesion).trim()) return

  cargandoBusqueda.value = true

  try {
    resultadoToken.value = await DiagnosticService.getTokenSesionData(sesion)
    countUsers.value = counterKeyRegister(resultadoToken.value.data).persons
    countOficinas.value = counterKeyRegister(resultadoToken.value.data).oficina

    $q.notify({
      type: 'positive',
      message: 'Token consultado',
      icon: 'account_circle',
      position: 'top-right',
    })
  } catch (error) {
    console.log(`🔄 Error en consulta:', ${error.message}`)
  } finally {
    cargandoBusqueda.value = false
  }
}

const formatearFechaDetails = (fecha) => {
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
.orange-santoro {
  color: #e97132;
}

.diagnostic-modal {
  .diagnostic-header {
    padding: 24px 0 12px;
  }

  .diagnostic-content {
    .q-tab-panel {
      padding: 0;
    }
  }
}

.dashboard-header__wrap {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding-left: 16px;
  padding-right: 16px;
}

.dashboard-hero__title-card {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 26px;
  padding: 28px 30px;
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.28);
}

.hero-title {
  color: #fff;
  font-size: clamp(2rem, 4vw, 3.1rem);
  line-height: 1.03;
  font-weight: 900;
  letter-spacing: -0.04em;
}

.diagnostic-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.9rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.diagnostic-subtitle {
  max-width: 760px;
  color: rgba(255, 255, 255, 0.72);
  font-size: 1rem;
  line-height: 1.7;
}

.diagnostic-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.diagnostic-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.diagnostic-status-chip {
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.session-timeline {
  max-height: 300px;
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
      width: 500px;
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

@media (max-width: 480px) {
  .session-timeline {
    .log-details {
      .log-message {
        width: 200px;
      }
    }
  }
}

@media (max-width: 760px) {
  .dashboard-hero__title-card {
    padding: 20px 18px;
    border-radius: 22px;
  }

  .diagnostic-header__top {
    row-gap: 16px;
  }

  .diagnostic-actions {
    justify-content: flex-start;
  }
}

/* Scrollbar completo */
::-webkit-scrollbar {
  width: 10px; /* ancho de la barra */
  height: 10px; /* alto si es horizontal */
}

/* Fondo de la barra */
::-webkit-scrollbar-track {
  background: #f0f0f0;
  border-radius: 8px;
}

/* Thumb (la parte que se mueve) */
::-webkit-scrollbar-thumb {
  background-color: #757575; /* azul Quasar */
  border-radius: 8px;
  border: 2px solid #f0f0f0; /* espacio alrededor */
}

/* Thumb al hacer hover */
::-webkit-scrollbar-thumb:hover {
  background-color: #7a7a7a;
}

// Cards modernos
.modern-card {
  background: var(--gradient-card);
  backdrop-filter: var(--blur-glass);
  border: var(--border-glass);
  border-radius: 24px;
  overflow: hidden;
  transition: var(--transition-smooth);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 32px 64px rgba(0, 0, 0, 0.4);
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding: 2rem 2rem 1rem 2rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);

    .header-icon {
      width: 64px;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--gradient-primary);
      border-radius: 20px;
      box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
    }

    .header-content {
      flex: 1;

      .card-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: #fff;
        margin: 0 0 0.5rem 0;
      }

      .card-subtitle {
        font-size: 1rem;
        color: rgba(255, 255, 255, 0.7);
        margin: 0;
      }
    }
  }

  .card-body {
    padding: 2rem;
  }
}
</style>
