<template>
  <!-- Modal de Consola Mejorada -->
  <q-dialog
    v-model="mostrarConsola"
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
    @escape-key="cerrarConsola"
  >
    <q-card class="console-modal-card bg-dark text-white">
      <!-- Header -->
      <q-card-section class="console-header bg-grey-9">
        <div class="row">
          <div class="col">
            <div class="text-h5">
              <q-icon name="terminal" class="q-mr-sm" color="primary" />
              Consola de Logs del Sistema
              <q-chip
                v-if="logs.length"
                color="primary"
                text-color="white"
                size="md"
                class="q-ml-md"
                icon="format_list_numbered"
              >
                {{ logsFiltrados.length }} / {{ logs.length }} registros
              </q-chip>
            </div>
            <div class="text-subtitle2 text-grey-4 q-mt-sm" v-if="filtroActual">
              {{ filtroActual }}
            </div>
          </div>
          <div class="col-auto">
            <!-- 🔬 Centro de Diagnóstico Técnico Mejorado -->
            <q-btn
              icon="medical_services"
              flat
              round
              color="cyan-4"
              @click="abrirDiagnosticoManual"
              class="q-mr-sm diagnostic-btn"
              style="animation: pulse-glow 2s infinite"
            >
              <q-tooltip class="bg-cyan-8 text-white">
                <div class="text-center">
                  <div class="text-subtitle2">🔬 Centro de Diagnóstico Técnico</div>
                  <div class="text-caption">Análisis avanzado de errores y sesiones</div>
                </div>
              </q-tooltip>
            </q-btn>
            <q-btn icon="minimize" flat round color="grey-4" @click="cerrarConsola" class="q-mr-sm">
              <q-tooltip>Minimizar consola</q-tooltip>
            </q-btn>
            <q-btn icon="close" flat round color="red-4" @click="cerrarConsola">
              <q-tooltip>Cerrar consola</q-tooltip>
            </q-btn>
          </div>
          <div class="col-12 q-pt-md">
            <q-list>
              <q-expansion-item
                class="flex justify-end"
                v-model="filtrosToggle"
                icon="filter_alt"
                label="Filtros"
                header-style="background: #232629 !important;"
                header-class="text-weight-bolder text-white text-right"
                expand-icon-class="text-white"
                expand-separator
              >
                <q-card class="bg-grey-8">
                  <!-- Controles -->
                  <q-card-section class="console-controls bg-grey-8">
                    <div class="row q-col-gutter-md">
                      <!-- Primera fila: Búsqueda -->
                      <div class="col-12 col-md-8">
                        <q-input
                          v-model="busqueda"
                          label="Buscar en mensaje..."
                          filled
                          dark
                          color="primary"
                          debounce="300"
                          clearable
                        >
                          <template v-slot:prepend>
                            <q-icon name="search" color="primary" />
                          </template>
                        </q-input>
                      </div>
                      <div class="col-12 col-md-4">
                        <q-btn-dropdown
                          color="positive"
                          icon="download"
                          label="Exportar"
                          :disable="!logsFiltrados.length"
                          class="q-mr-sm"
                        >
                          <q-list>
                            <q-item clickable @click="exportarLogs('excel')">
                              <q-item-section avatar>
                                <q-icon name="table_chart" color="green" />
                              </q-item-section>
                              <q-item-section>
                                <q-item-label>Excel (.xlsx)</q-item-label>
                                <q-item-label caption>Archivo Excel con formato</q-item-label>
                              </q-item-section>
                            </q-item>

                            <q-item clickable @click="exportarLogs('json')">
                              <q-item-section avatar>
                                <q-icon name="code" color="blue" />
                              </q-item-section>
                              <q-item-section>
                                <q-item-label>JSON (.json)</q-item-label>
                                <q-item-label caption>Formato JSON estructurado</q-item-label>
                              </q-item-section>
                            </q-item>

                            <q-item clickable @click="exportarLogs('txt')">
                              <q-item-section avatar>
                                <q-icon name="text_snippet" color="orange" />
                              </q-item-section>
                              <q-item-section>
                                <q-item-label>Texto (.txt)</q-item-label>
                                <q-item-label caption>Archivo de texto plano</q-item-label>
                              </q-item-section>
                            </q-item>
                          </q-list>
                        </q-btn-dropdown>
                        <q-btn
                          color="warning"
                          icon="clear_all"
                          label="Limpiar"
                          @click="limpiarConsola"
                          flat
                        />
                      </div>

                      <!-- Segunda fila: Filtros avanzados - Optimizado para responsive -->
                      <div class="col-12 col-sm-6 col-md-3 col-lg-3">
                        <q-select
                          v-model="filtroOficina"
                          :options="opcionesOficinas"
                          option-label="label"
                          option-value="value"
                          emit-value
                          map-options
                          label="Oficina"
                          filled
                          dark
                          color="primary"
                          clearable
                          use-input
                          @filter="filtrarOficinas"
                          dense
                        >
                          <template v-slot:prepend>
                            <q-icon name="business" color="orange" />
                          </template>
                        </q-select>
                      </div>

                      <div class="col-12 col-sm-6 col-md-3 col-lg-3">
                        <q-select
                          v-model="filtroUsuario"
                          :options="opcionesUsuarios"
                          option-label="label"
                          option-value="value"
                          emit-value
                          map-options
                          label="Usuario"
                          filled
                          dark
                          color="primary"
                          clearable
                          use-input
                          @filter="filtrarUsuarios"
                          dense
                        >
                          <template v-slot:prepend>
                            <q-icon name="person" color="green" />
                          </template>
                        </q-select>
                      </div>

                      <div class="col-12 col-sm-6 col-md-3 col-lg-3">
                        <q-select
                          v-model="filtroTipoLog"
                          :options="opcionesTiposLog"
                          option-label="label"
                          option-value="value"
                          emit-value
                          map-options
                          label="Tipo"
                          filled
                          dark
                          color="primary"
                          clearable
                          dense
                        >
                          <template v-slot:prepend>
                            <q-icon name="article" color="blue" />
                          </template>
                        </q-select>
                      </div>

                      <div class="col-12 col-sm-6 col-md-3 col-lg-3">
                        <q-select
                          v-model="filtroProceso"
                          :options="opcionesProcesos"
                          option-label="label"
                          option-value="value"
                          emit-value
                          map-options
                          label="Proceso"
                          filled
                          dark
                          color="primary"
                          clearable
                          dense
                        >
                          <template v-slot:prepend>
                            <q-icon name="settings" color="purple" />
                          </template>
                        </q-select>
                      </div>

                      <!-- Tercera fila: Filtros adicionales - Optimizado -->
                      <div class="col-12 col-sm-6 col-md-3 col-lg-3">
                        <q-select
                          v-model="filtroDispositivo"
                          :options="opcionesDispositivos"
                          option-label="label"
                          option-value="value"
                          emit-value
                          map-options
                          label="Dispositivo"
                          filled
                          dark
                          color="primary"
                          clearable
                          use-input
                          @filter="filtrarDispositivos"
                          dense
                        >
                          <template v-slot:prepend>
                            <q-icon name="smartphone" color="cyan" />
                          </template>
                        </q-select>
                      </div>

                      <div class="col-12 col-sm-6 col-md-3 col-lg-3">
                        <q-select
                          v-model="filtroEscaner"
                          :options="opcionesEscaners"
                          option-label="label"
                          option-value="value"
                          emit-value
                          map-options
                          label="Escáner"
                          filled
                          dark
                          color="primary"
                          clearable
                          use-input
                          @filter="filtrarEscaners"
                          dense
                        >
                          <template v-slot:prepend>
                            <q-icon name="qr_code_scanner" color="pink" />
                          </template>
                        </q-select>
                      </div>

                      <div class="col-12 col-sm-6 col-md-3 col-lg-3">
                        <q-input
                          v-model="textoRangoFechas"
                          label="Fechas"
                          filled
                          dark
                          color="primary"
                          clearable
                          readonly
                          dense
                        >
                          <template v-slot:prepend>
                            <q-icon name="date_range" color="amber" />
                          </template>
                          <template v-slot:append>
                            <q-icon name="calendar_month" class="cursor-pointer">
                              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                <q-date v-model="rangoFechas" range mask="YYYY-MM-DD" dark>
                                  <div class="row items-center justify-end q-pa-sm">
                                    <q-btn
                                      label="Limpiar"
                                      color="negative"
                                      flat
                                      size="sm"
                                      @click="rangoFechas = null"
                                      class="q-mr-sm"
                                    />
                                    <q-btn
                                      v-close-popup
                                      label="Aplicar"
                                      color="primary"
                                      flat
                                      size="sm"
                                    />
                                  </div>
                                </q-date>
                              </q-popup-proxy>
                            </q-icon>
                          </template>
                        </q-input>
                      </div>

                      <!-- Filtros avanzados de código de error y sesión -->
                      <div class="col-12 col-sm-6 col-md-3 col-lg-3">
                        <q-input
                          v-model="filtroErrorCode"
                          label="Código Error"
                          filled
                          dark
                          color="primary"
                          clearable
                          dense
                          debounce="300"
                        >
                          <template v-slot:prepend>
                            <q-icon name="error_outline" color="red-4" />
                          </template>
                          <template v-slot:hint> Ej: USR02808141525-INF017 </template>
                        </q-input>
                      </div>

                      <div class="col-12 col-sm-6 col-md-3 col-lg-3">
                        <q-input
                          v-model="filtroSessionToken"
                          label="Token Sesión"
                          filled
                          dark
                          color="primary"
                          clearable
                          dense
                          debounce="300"
                        >
                          <template v-slot:prepend>
                            <q-icon name="vpn_key" color="green-4" />
                          </template>
                          <template v-slot:hint> Ej: HNh0vhSPeQ9e </template>
                        </q-input>
                      </div>

                      <div class="col-12 col-sm-6 col-md-3 col-lg-3">
                        <q-btn
                          color="negative"
                          icon="filter_alt_off"
                          label="Limpiar"
                          @click="limpiarTodosFiltros"
                          outline
                          class="full-width"
                          dense
                        />
                      </div>
                    </div>

                    <!-- Indicadores de filtros activos -->
                    <div v-if="filtrosActivos.length" class="row q-mt-md">
                      <div class="col-12">
                        <div class="text-caption text-grey-4 q-mb-xs">Filtros activos:</div>
                        <q-chip
                          v-for="filtro in filtrosActivos"
                          :key="filtro.key"
                          :color="filtro.color"
                          text-color="white"
                          removable
                          @remove="limpiarFiltro(filtro.key)"
                          size="sm"
                          class="q-mr-xs"
                        >
                          <q-icon :name="filtro.icon" size="16px" class="q-mr-xs" />
                          {{ filtro.label }}
                        </q-chip>
                        <q-btn
                          icon="clear_all"
                          label="Limpiar todos"
                          flat
                          size="sm"
                          color="red"
                          @click="limpiarTodosFiltros"
                          class="q-ml-sm"
                        />
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </q-expansion-item>
            </q-list>
          </div>
        </div>
      </q-card-section>

      <!-- Contenido -->
      <q-card-section class="console-body">
        <!-- Loader principal -->
        <div v-if="loading" class="text-center q-pa-xl">
          <q-spinner-grid color="primary" size="80px" />
          <div class="q-mt-lg text-h6">Cargando logs...</div>
        </div>

        <!-- Loader de filtros elegante -->
        <div v-else-if="loadingFiltros" class="filter-loader-overlay">
          <div class="filter-loader-content">
            <q-spinner-dots color="primary" size="40px" />
            <div class="q-mt-sm text-subtitle2 text-primary">Aplicando filtros...</div>
          </div>
        </div>

        <div v-else-if="!logs.length" class="text-center q-pa-xl">
          <q-icon name="inbox" size="120px" color="grey-6" />
          <div class="q-mt-lg text-h5 text-grey-4">No hay logs disponibles</div>
        </div>

        <div v-else>
          <!-- Loader de paginación -->
          <div v-if="loadingPaginacion" class="pagination-loader">
            <q-linear-progress color="primary" indeterminate class="q-mb-md" />
            <div class="text-center text-caption text-primary">Cargando página...</div>
          </div>

          <!-- Grid responsivo de cards -->
          <div class="responsive-logs-grid" :class="{ 'loading-opacity': loadingPaginacion }">
            <q-card
              v-for="(log, index) in logsPaginados"
              :key="`${log.id || index}-${paginaActual}`"
              :class="[
                'log-card',
                `log-card-${(log.type || log.Tipo || 'info').toLowerCase()}`,
                'cursor-pointer',
              ]"
              @click="mostrarDetalleLog(log)"
              bordered
              flat
            >
              <!-- Header de la card -->
              <q-card-section class="log-card-header">
                <div class="row items-center justify-between">
                  <div class="col-auto">
                    <q-chip
                      :color="getColorTipo(log.type || log.Tipo || log.EventType)"
                      text-color="white"
                      size="md"
                      :icon="getIconoTipo(log.type || log.Tipo || log.EventType)"
                    >
                      {{ log.type || log.Tipo || log.EventType || 'INFO' }}
                    </q-chip>
                  </div>
                  <div class="col-auto">
                    <q-badge
                      :color="getColorProceso(log.process || log.Proceso)"
                      :label="log.process || log.Proceso || 'SYSTEM'"
                      class="text-weight-bold"
                    />
                  </div>
                </div>
              </q-card-section>

              <!-- Contenido principal de la card -->
              <q-card-section class="log-card-content">
                <!-- Información del usuario -->
                <div v-if="obtenerNombreUsuario(log)" class="log-user-section">
                  <div class="row items-center q-mb-sm">
                    <q-icon name="person" color="green-4" size="20px" class="q-mr-sm" />
                    <div class="text-weight-bold text-green-4">
                      {{ obtenerNombreUsuario(log) }}
                    </div>
                  </div>
                  <div v-if="obtenerCurpUsuario(log)" class="text-caption text-grey-5 q-ml-md">
                    Username: {{ obtenerCurpUsuario(log) }}
                  </div>
                </div>

                <!-- Información de la oficina -->
                <div v-if="obtenerNombreOficina(log)" class="log-office-section q-mt-sm">
                  <div class="row items-center q-mb-xs">
                    <q-icon name="business" color="orange-4" size="18px" class="q-mr-sm" />
                    <div class="text-weight-medium text-orange-4">
                      {{ obtenerNombreOficina(log).nombre || obtenerNombreOficina(log) }}
                    </div>
                  </div>
                  <div v-if="obtenerDireccionOficina(log)" class="text-caption text-grey-5 q-ml-md">
                    {{ obtenerDireccionOficina(log) }}
                  </div>
                </div>

                <!-- Información del dispositivo -->
                <div
                  v-if="
                    obtenerInfoDispositivo(log).hasDevice || obtenerInfoDispositivo(log).hasScanner
                  "
                  class="log-device-section q-mt-sm"
                >
                  <div class="row items-center q-mb-xs">
                    <q-icon name="devices" color="purple-4" size="18px" class="q-mr-sm" />
                    <div class="text-weight-medium text-purple-4">Dispositivos</div>
                  </div>
                  <div class="device-info q-ml-md">
                    <div v-if="obtenerInfoDispositivo(log).hasDevice" class="text-caption">
                      <q-icon name="computer" size="12px" class="q-mr-xs" />
                      {{ obtenerInfoDispositivo(log).device }}
                    </div>
                    <div v-if="obtenerInfoDispositivo(log).hasScanner" class="text-caption q-mt-xs">
                      <q-icon name="qr_code_scanner" size="12px" class="q-mr-xs" />
                      Escáner: {{ obtenerInfoDispositivo(log).scanner }}
                    </div>
                  </div>
                </div>

                <!-- Información del código de error -->
                <div v-if="log.errorCode || log.ErrorCode" class="log-error-section q-mt-sm">
                  <div class="row items-center q-mb-xs">
                    <q-icon name="error_outline" color="red-4" size="18px" class="q-mr-sm" />
                    <div class="text-weight-medium text-red-4">Código de Error</div>
                  </div>
                  <div class="error-content q-ml-md text-caption">
                    {{ log.errorCode || log.ErrorCode }}
                  </div>
                </div>

                <!-- Información del token de sesión -->
                <div
                  v-if="log.sessionToken || log.SessionToken"
                  class="log-session-section q-mt-sm"
                >
                  <div class="row items-center q-mb-xs">
                    <q-icon name="vpn_key" color="cyan-4" size="18px" class="q-mr-sm" />
                    <div class="text-weight-medium text-cyan-4">Token de Sesión</div>
                  </div>
                  <div class="session-content q-ml-md text-caption">
                    {{ log.sessionToken || log.SessionToken }}
                  </div>
                </div>

                <!-- Mensaje del log -->
                <div v-if="obtenerMensajeCompleto(log)" class="log-message-section q-mt-sm">
                  <div class="row items-center q-mb-xs">
                    <q-icon name="message" color="amber-4" size="18px" class="q-mr-sm" />
                    <div class="text-weight-medium text-amber-4">Mensaje</div>
                  </div>
                  <div class="message-content q-ml-md text-caption">
                    {{ obtenerMensajeCompleto(log) }}
                  </div>
                </div>
              </q-card-section>

              <!-- Footer con fecha -->
              <q-card-section class="log-card-footer">
                <div class="row items-center justify-between">
                  <div class="col">
                    <div class="text-caption text-grey-5">
                      <q-icon name="schedule" size="14px" class="q-mr-xs" />
                      {{
                        formatearFechaCompleta(
                          log.date || log.Date || log.Fecha || log.FechaCreacion
                        )
                      }}
                    </div>
                  </div>
                  <div class="col-auto">
                    <q-btn
                      icon="visibility"
                      size="sm"
                      flat
                      round
                      color="primary"
                      @click.stop="mostrarDetalleLog(log)"
                    >
                      <q-tooltip>Ver detalles</q-tooltip>
                    </q-btn>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Paginación -->
          <div class="pagination-section q-mt-lg">
            <div class="row items-center justify-between q-col-gutter-md">
              <div class="col-12 col-sm-6 col-md-4">
                <div class="pagination-info text-caption text-grey-4">
                  Mostrando {{ (paginaActual - 1) * registrosPorPagina + 1 }} -
                  {{ Math.min(paginaActual * registrosPorPagina, logsFiltrados.length) }}
                  de {{ logsFiltrados.length }} registros
                  <span v-if="logs.length !== logsFiltrados.length" class="q-ml-sm">
                    ({{ logs.length }} total)
                  </span>
                </div>
              </div>
              <div class="col-12 col-sm-6 col-md-4 text-center">
                <q-select
                  v-model="registrosPorPagina"
                  :options="[
                    { label: '25 por página', value: 25 },
                    { label: '50 por página', value: 50 },
                    { label: '100 por página', value: 100 },
                  ]"
                  option-label="label"
                  option-value="value"
                  emit-value
                  map-options
                  dense
                  dark
                  outlined
                  color="primary"
                  style="max-width: 150px; margin: 0 auto"
                  @update:model-value="paginaActual = 1"
                >
                  <template v-slot:prepend>
                    <q-icon name="view_list" size="16px" color="primary" />
                  </template>
                </q-select>
              </div>
              <div class="col-12 col-md-4 text-right">
                <q-pagination
                  v-model="paginaActual"
                  :max="totalPaginas"
                  :max-pages="7"
                  direction-links
                  boundary-links
                  color="primary"
                  size="sm"
                  @update:model-value="cambiarPagina"
                />
              </div>
            </div>
          </div>
        </div>
      </q-card-section>

      <!-- Footer -->
      <q-card-section class="console-footer bg-grey-9">
        <div class="row items-center">
          <div class="col">
            <span class="text-caption text-grey-4">
              Total: {{ logsFiltrados.length }} registros
              <span v-if="logs.length !== logsFiltrados.length" class="q-ml-sm">
                ({{ logs.length }} sin filtrar)
              </span>
            </span>
          </div>
          <div class="col-auto">
            <q-btn
              icon="refresh"
              flat
              round
              color="primary"
              @click="cargarLogs"
              :loading="loading"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Modal de detalle -->
    <q-dialog v-model="modalDetalle">
      <q-card style="min-width: 700px; max-width: 900px" class="bg-dark text-white">
        <q-card-section class="bg-grey-9">
          <div class="text-h6 flex items-center">
            <q-icon name="info" class="q-mr-sm" />
            Detalle del Log
          </div>
        </q-card-section>

        <q-card-section v-if="logSeleccionado" class="q-pa-lg">
          <div class="row q-col-gutter-md">
            <!-- Información básica -->
            <div class="col-12 col-md-6">
              <q-list dark separator>
                <q-item>
                  <q-item-section avatar>
                    <q-icon color="indigo" name="schedule" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Fecha y Hora Completa</q-item-label>
                    <q-item-label caption>{{
                      formatearFechaCompleta(
                        logSeleccionado.Date ||
                          logSeleccionado.Fecha ||
                          logSeleccionado.FechaCreacion
                      )
                    }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section avatar>
                    <q-icon :color="getColorTipo(logSeleccionado.type)" name="label" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Tipo</q-item-label>
                    <q-item-label caption>{{
                      logSeleccionado.type ||
                      logSeleccionado.Tipo ||
                      logSeleccionado.EventType ||
                      'INFO'
                    }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item v-if="logSeleccionado.process || logSeleccionado.Proceso">
                  <q-item-section avatar>
                    <q-icon
                      :color="getColorProceso(logSeleccionado.process || logSeleccionado.Proceso)"
                      name="settings"
                    />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Proceso</q-item-label>
                    <q-item-label caption>{{
                      logSeleccionado.process || logSeleccionado.Proceso
                    }}</q-item-label>
                  </q-item-section>
                </q-item>

                <!-- Información del dispositivo y escáner -->
                <q-item v-if="obtenerInfoDispositivo(logSeleccionado).hasDevice">
                  <q-item-section avatar>
                    <q-icon color="purple" name="devices" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Dispositivo</q-item-label>
                    <q-item-label caption>{{
                      obtenerInfoDispositivo(logSeleccionado).device
                    }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item v-if="obtenerInfoDispositivo(logSeleccionado).hasScanner">
                  <q-item-section avatar>
                    <q-icon color="cyan" name="qr_code_scanner" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Escáner</q-item-label>
                    <q-item-label caption>{{
                      obtenerInfoDispositivo(logSeleccionado).scanner
                    }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>

            <!-- Información del usuario y oficina -->
            <div class="col-12 col-md-6">
              <q-list dark separator>
                <q-item v-if="obtenerNombreUsuario(log)">
                  <q-item-section avatar>
                    <q-icon color="green" name="person" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Usuario</q-item-label>
                    <q-item-label caption>{{ obtenerNombreUsuario(logSeleccionado) }}</q-item-label>
                    <q-item-label caption v-if="logSeleccionado.person?.curp" class="text-grey-5">
                      Username: {{ logSeleccionado.person.curp }}
                    </q-item-label>
                  </q-item-section>
                </q-item>

                <q-item v-if="obtenerNombreOficina(logSeleccionado)">
                  <q-item-section avatar>
                    <q-icon color="orange" name="business" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Oficina</q-item-label>
                    <q-item-label caption>{{ obtenerNombreOficina(logSeleccionado) }}</q-item-label>
                    <q-item-label
                      caption
                      v-if="obtenerDireccionOficina(logSeleccionado)"
                      class="text-grey-5"
                    >
                      {{ obtenerDireccionOficina(logSeleccionado) }}
                    </q-item-label>
                  </q-item-section>
                </q-item>

                <q-item v-if="logSeleccionado.device">
                  <q-item-section avatar>
                    <q-icon color="purple" name="computer" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Device</q-item-label>
                    <q-item-label caption>{{ logSeleccionado.device }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item v-if="logSeleccionado.scanDevice">
                  <q-item-section avatar>
                    <q-icon color="blue" name="scanner" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Scan Device</q-item-label>
                    <q-item-label caption>{{ logSeleccionado.scanDevice }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </div>

          <!-- Mensaje completo -->
          <div class="q-mt-lg">
            <div class="text-subtitle2 q-mb-sm flex items-center">
              <q-icon name="message" class="q-mr-sm" color="amber" />
              Mensaje completo
            </div>
            <q-card dark class="bg-grey-8">
              <q-card-section>
                <pre class="log-message-detail">{{ obtenerMensajeCompleto(logSeleccionado) }}</pre>
              </q-card-section>
            </q-card>
          </div>

          <!-- Información técnica adicional si está disponible -->
          <div
            v-if="
              logSeleccionado.TrackingCode ||
              logSeleccionado.ID ||
              logSeleccionado.Estado ||
              logSeleccionado.Status ||
              logSeleccionado.errorCode ||
              logSeleccionado.ErrorCode ||
              logSeleccionado.sessionToken ||
              logSeleccionado.SessionToken
            "
            class="q-mt-lg"
          >
            <div class="text-subtitle2 q-mb-sm flex items-center">
              <q-icon name="info" class="q-mr-sm" color="blue" />
              Información técnica
            </div>
            <q-card dark class="bg-grey-8">
              <q-card-section>
                <div class="row q-col-gutter-md">
                  <div v-if="logSeleccionado.TrackingCode" class="col-12 col-md-6">
                    <div class="detail-tech-item">
                      <q-icon name="code" size="16px" color="blue-4" class="q-mr-xs" />
                      <strong>Tracking Code:</strong>
                      <span class="tech-value">{{ logSeleccionado.TrackingCode }}</span>
                    </div>
                  </div>
                  <div v-if="logSeleccionado.ID" class="col-12 col-md-6">
                    <div class="detail-tech-item">
                      <q-icon name="fingerprint" size="16px" color="purple-4" class="q-mr-xs" />
                      <strong>ID:</strong>
                      <span class="tech-value">{{ logSeleccionado.ID }}</span>
                    </div>
                  </div>
                  <div
                    v-if="logSeleccionado.Estado || logSeleccionado.Status"
                    class="col-12 col-md-6"
                  >
                    <div class="detail-tech-item">
                      <q-icon name="flag" size="16px" color="green-4" class="q-mr-xs" />
                      <strong>Estado:</strong>
                      <span class="tech-value">{{
                        logSeleccionado.Estado || logSeleccionado.Status
                      }}</span>
                    </div>
                  </div>
                  <!-- Nuevo: Código de Error -->
                  <div
                    v-if="logSeleccionado.errorCode || logSeleccionado.ErrorCode"
                    class="col-12 col-md-6"
                  >
                    <div class="detail-tech-item error-code-item">
                      <q-icon name="error_outline" size="16px" color="red-4" class="q-mr-xs" />
                      <strong>Código de Error:</strong>
                      <span class="tech-value error-code">{{
                        logSeleccionado.errorCode || logSeleccionado.ErrorCode
                      }}</span>
                      <q-btn
                        @click="
                          abrirDiagnosticoError(
                            logSeleccionado.errorCode || logSeleccionado.ErrorCode
                          )
                        "
                        round
                        dense
                        flat
                        icon="bug_report"
                        color="red-5"
                        size="sm"
                        class="q-ml-sm"
                      >
                        <q-tooltip>Diagnosticar código de error</q-tooltip>
                      </q-btn>
                    </div>
                  </div>
                  <!-- Nuevo: Token de Sesión -->
                  <div
                    v-if="logSeleccionado.sessionToken || logSeleccionado.SessionToken"
                    class="col-12"
                  >
                    <div class="detail-tech-item session-token-item">
                      <q-icon name="vpn_key" size="16px" color="cyan-4" class="q-mr-xs" />
                      <strong>Token de Sesión:</strong>
                      <div class="tech-value session-token q-mt-xs">
                        {{ logSeleccionado.sessionToken || logSeleccionado.SessionToken }}
                        <q-btn
                          @click="
                            abrirDiagnosticoSesion(
                              logSeleccionado.sessionToken || logSeleccionado.SessionToken
                            )
                          "
                          round
                          dense
                          flat
                          icon="account_circle"
                          color="blue-5"
                          size="sm"
                          class="q-ml-sm"
                        >
                          <q-tooltip>Diagnosticar sesión</q-tooltip>
                        </q-btn>
                      </div>
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Sección de Debugging: Mostrar TODOS los campos del log -->
          <div class="q-mt-lg">
            <q-expansion-item
              icon="bug_report"
              label="🔍 Vista técnica - Todos los campos disponibles"
              class="debug-section"
            >
              <q-card dark class="bg-grey-8">
                <q-card-section>
                  <div class="text-caption text-grey-4 q-mb-md">
                    Esta sección muestra TODOS los campos que vienen del API para este log
                    específico. Útil para identificar dónde están los códigos de error y tokens de
                    sesión.
                  </div>
                  <div class="debug-fields">
                    <div
                      v-for="[key, value] in Object.entries(logSeleccionado)"
                      :key="key"
                      class="debug-field-item"
                      :class="{
                        'highlight-error':
                          key.toLowerCase().includes('error') || key.toLowerCase().includes('code'),
                        'highlight-token':
                          key.toLowerCase().includes('token') ||
                          key.toLowerCase().includes('session'),
                      }"
                    >
                      <div class="field-key">{{ key }}:</div>
                      <div class="field-value">
                        <span v-if="typeof value === 'object' && value !== null">
                          {{ JSON.stringify(value, null, 2) }}
                        </span>
                        <span v-else>{{ value }}</span>
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </q-expansion-item>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="bg-grey-9">
          <q-btn flat label="Cerrar" color="primary" @click="modalDetalle = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-dialog>

  <!-- 🔍 Componente de Diagnóstico Técnico -->
  <EscritorioDiagnostico ref="diagnosticoRef" @cerrar="cerrarDiagnostico" />
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import axios from 'axios'
import { API_BASE_URL } from '../../services/apiConfig.js'
import { CatalogService } from '../../services/catalogService.js'
import EscritorioDiagnostico from './EscritorioDiagnostico.vue'

// 📝 Props
defineProps({
  filtros: {
    type: Object,
    default: () => ({}),
  },
})

const $q = useQuasar()

// Estado
const mostrarConsola = ref(false)
const loading = ref(false)
const logs = ref([])
const busqueda = ref('')
const modalDetalle = ref(false)
const logSeleccionado = ref(null)
const filtroActual = ref('')
const datosDesdeGrafica = ref(false)

// 🚀 [NUEVO] Variables para control de origen y filtros
const origenConsola = ref('') // 'sidebar' | 'graficas' | 'kpis'
const filtroTimeout = ref(null) // Para debounce de filtros

// 🔍 Referencia al componente de diagnóstico
const diagnosticoRef = ref(null)

// Filtros avanzados
const filtroOficina = ref(null)
const filtroUsuario = ref(null)
const filtroTipoLog = ref(null) // Renombrado de filtroTipo
const filtroProceso = ref(null) // Nuevo filtro de proceso
const filtroDispositivo = ref(null) // Nuevo filtro de dispositivo
const filtroEscaner = ref(null) // Nuevo filtro de escáner
const filtroErrorCode = ref('') // Nuevo filtro de código de error (string vacío)
const filtroSessionToken = ref('') // Nuevo filtro de token de sesión (string vacío)
const rangoFechas = ref(null)

// Variables de paginación
const paginaActual = ref(1)
const registrosPorPagina = ref(50) // 50 registros por página para mejor rendimiento

// Variables de loading
const loadingFiltros = ref(false)
const loadingPaginacion = ref(false)

// 📅 VALIDAR Y FORMATEAR FECHA A ISO (YYYY-MM-DD)
const validarYFormatearFecha = (fecha) => {
  if (!fecha) return null

  try {
    // Si ya está en formato ISO correcto, devolver tal como está
    if (typeof fecha === 'string' && fecha.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return fecha
    }

    // Si está en formato YYYY/MM/DD, convertir a YYYY-MM-DD
    if (typeof fecha === 'string' && fecha.match(/^\d{4}\/\d{2}\/\d{2}$/)) {
      return fecha.replace(/\//g, '-')
    }

    // Si es un objeto Date, convertir a formato ISO
    if (fecha instanceof Date) {
      return fecha.toISOString().split('T')[0]
    }

    // Intentar parsear como fecha y convertir
    const fechaObj = new Date(fecha)
    if (!isNaN(fechaObj.getTime())) {
      return fechaObj.toISOString().split('T')[0]
    }

    console.warn(`⚠️ Formato de fecha no válido: ${fecha}`)
    return null
  } catch (error) {
    console.error(`❌ Error al formatear fecha ${fecha}:`, error)
    return null
  }
}

const opcionesOficinas = ref([])
const opcionesUsuarios = ref([])
const opcionesTiposLog = ref([
  { label: 'Todos los tipos', value: null },
  { label: 'INFO', value: 'INFO' },
  { label: 'ERROR', value: 'ERROR' },
  { label: 'SUCCESS', value: 'SUCCESS' },
  { label: 'WARNING', value: 'WARNING' },
  { label: 'START', value: 'START' },
  { label: 'END', value: 'END' },
  { label: 'EXPORT', value: 'EXPORT' },
  { label: 'DETAIL', value: 'DETAIL' },
  { label: 'CONECTADO', value: 'CONECTADO' },
  { label: 'DESCONECTADO', value: 'DESCONECTADO' },
])

// Nuevas opciones para procesos
const opcionesProcesos = ref([
  { label: 'Todos los procesos', value: null },
  { label: 'INE', value: 'INE' },
  { label: 'REGISTER', value: 'REGISTER' },
  { label: 'PASSPORT', value: 'PASSPORT' },
  { label: 'LOGIN', value: 'LOGIN' },
  { label: 'SESSION', value: 'SESSION' },
])

// 🆕 [NUEVO] Mapeo de tipos para la API
const mapeoTipos = {
  SUCCESS: 'SUC',
  ERROR: 'ERR',
  INFO: 'INF',
  START: 'STR',
  END: 'END',
  FIN: 'FIN',
  EXPORT: 'EXP',
}

// Opciones dinámicas para dispositivos y escáneres
const opcionesDispositivos = ref([])
const opcionesEscaners = ref([])

// 🆕 Opciones computadas para errorCode y sessionToken
const opcionesErrorCodes = computed(() => {
  if (!logs.value.length) return []

  const errorCodes = [
    ...new Set(
      logs.value
        .map((log) => log.errorCode || log.ErrorCode || log.codigo_error)
        .filter((code) => code && code.trim() !== '')
    ),
  ].sort()

  return errorCodes.map((code) => ({
    label: code,
    value: code,
  }))
})

const opcionesSessionTokens = computed(() => {
  if (!logs.value.length) return []

  const tokens = [
    ...new Set(
      logs.value
        .map((log) => log.sessionToken || log.SessionToken || log.token_sesion)
        .filter((token) => token && token.trim() !== '')
    ),
  ].sort()

  return tokens.map((token) => ({
    label: token.length > 20 ? `${token.substring(0, 20)}...` : token,
    value: token,
  }))
})

// 🗂️ MAPEO DE OFICINAS Y PERSONAS: Para convertir nombres a IDs
const mapaOficinas = ref(new Map()) // nombre -> id
const mapaPersonas = ref(new Map()) // nombre -> id
const oficinasFull = ref([])
const usuariosFull = ref([])
const dispositivosFull = ref([])
const escanersFull = ref([])
const filtrosToggle = ref(false)

// Computed para el texto del rango de fechas
const textoRangoFechas = computed(() => {
  if (!rangoFechas.value) return ''

  if (typeof rangoFechas.value === 'string') {
    return rangoFechas.value
  }

  if (rangoFechas.value.from && rangoFechas.value.to) {
    return `${rangoFechas.value.from} - ${rangoFechas.value.to}`
  }

  return rangoFechas.value.from || rangoFechas.value.to || ''
})

// 🧪 FUNCIÓN DE DEBUG TEMPORAL PARA DIAGNOSTICAR FILTROS
const debugearEstadoFiltros = (contexto = 'DEBUG') => {
  const estado = {
    contexto,
    timestamp: new Date().toISOString(),
    logs_totales: logs.value.length,
    logs_filtrados: logsFiltrados.value.length,
    filtros: {
      busqueda: busqueda.value,
      oficina: filtroOficina.value,
      usuario: filtroUsuario.value,
      tipoLog: filtroTipoLog.value,
      proceso: filtroProceso.value,
      dispositivo: filtroDispositivo.value,
      escaner: filtroEscaner.value,
      errorCode: filtroErrorCode.value,
      sessionToken: filtroSessionToken.value,
      fechas: rangoFechas.value,
    },
    opciones_disponibles: {
      oficinas: opcionesOficinas.value.length,
      usuarios: opcionesUsuarios.value.length,
      tiposLog: opcionesTiposLog.value.length,
      procesos: opcionesProcesos.value.length,
      dispositivos: opcionesDispositivos.value.length,
      escaners: opcionesEscaners.value.length,
      errorCodes: opcionesErrorCodes.value.length,
      sessionTokens: opcionesSessionTokens.value.length,
    },
    datos_origen: {
      datosDesdeGrafica: datosDesdeGrafica.value,
      filtroActual: filtroActual.value,
    },
  }

  console.log(`🔍 [${contexto}] ESTADO COMPLETO DE FILTROS:`, estado)
  return estado
}

// Computed para logs filtrados - CORREGIDO Y DEBUGGEADO
const logsFiltrados = computed(() => {
  let resultado = logs.value

  // ✅ VERIFICACIÓN SEGURA: Si no hay logs, devolver array vacío
  if (!resultado || resultado.length === 0) {
    console.log('🚨 [logsFiltrados] No hay logs para filtrar')
    return []
  }

  // ✅ VERIFICACIÓN DE FILTROS ACTIVOS (TODOS LOS FILTROS)
  const hayBusqueda = busqueda.value && busqueda.value.trim() !== ''
  const hayFiltroOficina = filtroOficina.value && filtroOficina.value.trim() !== ''
  const hayFiltroUsuario = filtroUsuario.value && filtroUsuario.value.trim() !== ''
  const hayFiltroTipo = filtroTipoLog.value && filtroTipoLog.value.trim() !== ''
  const hayFiltroFechas = rangoFechas.value && (rangoFechas.value.from || rangoFechas.value.to)

  // 🆕 NUEVOS FILTROS AGREGADOS A LA VERIFICACIÓN
  const hayFiltroProceso = filtroProceso.value && filtroProceso.value.trim() !== ''
  const hayFiltroDispositivo = filtroDispositivo.value && filtroDispositivo.value.trim() !== ''
  const hayFiltroEscaner = filtroEscaner.value && filtroEscaner.value.trim() !== ''
  const hayFiltroErrorCode = filtroErrorCode.value && filtroErrorCode.value.trim() !== ''
  const hayFiltroSessionToken = filtroSessionToken.value && filtroSessionToken.value.trim() !== ''

  // 🔍 LOGS DE DEBUG PARA IDENTIFICAR ESTADO DE FILTROS
  console.log('🔍 [logsFiltrados] Estado de filtros:', {
    logs: resultado.length,
    busqueda: hayBusqueda ? busqueda.value : 'N/A',
    oficina: hayFiltroOficina ? filtroOficina.value : 'N/A',
    usuario: hayFiltroUsuario ? filtroUsuario.value : 'N/A',
    tipo: hayFiltroTipo ? filtroTipoLog.value : 'N/A',
    fechas: hayFiltroFechas ? rangoFechas.value : 'N/A',
    proceso: hayFiltroProceso ? filtroProceso.value : 'N/A',
    dispositivo: hayFiltroDispositivo ? filtroDispositivo.value : 'N/A',
    escaner: hayFiltroEscaner ? filtroEscaner.value : 'N/A',
    errorCode: hayFiltroErrorCode ? filtroErrorCode.value : 'N/A',
    sessionToken: hayFiltroSessionToken ? filtroSessionToken.value : 'N/A',
  })

  // ✅ SOLUCIÓN: Si no hay ningún filtro aplicado, mostrar TODOS los logs
  if (
    !hayBusqueda &&
    !hayFiltroOficina &&
    !hayFiltroUsuario &&
    !hayFiltroTipo &&
    !hayFiltroFechas &&
    !hayFiltroProceso &&
    !hayFiltroDispositivo &&
    !hayFiltroEscaner &&
    !hayFiltroErrorCode &&
    !hayFiltroSessionToken
  ) {
    console.log(
      '✅ [logsFiltrados] Sin filtros activos, mostrando todos los logs:',
      resultado.length
    )
    return resultado // Mostrar todos sin limitación
  }

  // Filtro por búsqueda de texto mejorado
  if (busqueda.value) {
    const needle = busqueda.value.toLowerCase()
    resultado = resultado.filter((log) =>
      // (obtenerNombreOficina(log).toLowerCase().includes(needle) || '') ||
      // (obtenerNombreUsuario(log).toLowerCase().includes(needle) || '') ||
      // (log.type || log.Tipo || log.EventType || '').toLowerCase().includes(needle) ||
      // (log.process || log.Proceso || '').toLowerCase().includes(needle) ||
      // (log.device || '').toLowerCase().includes(needle) ||
      (log.message || log.Mensaje || '').toLowerCase().includes(needle)
    )
  }

  // Filtro por oficina mejorado
  if (filtroOficina.value) {
    resultado = resultado.filter((log) => {
      const oficina = obtenerNombreOficina(log)
      return oficina && oficina.toLowerCase().includes(filtroOficina.value.toLowerCase())
    })
  }

  // Filtro por usuario mejorado
  if (filtroUsuario.value) {
    resultado = resultado.filter((log) => {
      const usuario = obtenerNombreUsuario(log)
      return usuario && usuario.toLowerCase().includes(filtroUsuario.value.toLowerCase())
    })
  }

  // Filtro por tipo mejorado
  if (filtroTipoLog.value) {
    resultado = resultado.filter((log) => {
      const tipo = log.type || log.Tipo || log.EventType || ''
      return tipo.toLowerCase() === filtroTipoLog.value.toLowerCase()
    })
  }

  // ✅ FILTRO POR FECHAS SIMPLIFICADO
  if (hayFiltroFechas) {
    resultado = resultado.filter((log) => {
      const fecha = log.Date || log.Fecha || log.FechaCreacion
      if (!fecha) return true // Incluir logs sin fecha para evitar perder datos

      try {
        const logDate = new Date(fecha).toISOString().split('T')[0]

        if (typeof rangoFechas.value === 'string') {
          return logDate === rangoFechas.value
        }

        if (rangoFechas.value.from && rangoFechas.value.to) {
          return logDate >= rangoFechas.value.from && logDate <= rangoFechas.value.to
        }

        if (rangoFechas.value.from) {
          return logDate >= rangoFechas.value.from
        }

        if (rangoFechas.value.to) {
          return logDate <= rangoFechas.value.to
        }

        return true
      } catch {
        return true // Incluir en caso de error
      }
    })
  }

  // Filtro por proceso
  if (filtroProceso.value) {
    const antesFiltro = resultado.length
    resultado = resultado.filter((log) => {
      const proceso = log.process || log.TipoProceso || log.procesType || ''
      return proceso.toLowerCase().includes(filtroProceso.value.toLowerCase())
    })
    console.log(
      `🔍 [Filtro Proceso] "${filtroProceso.value}": ${antesFiltro} → ${resultado.length}`
    )
  }

  // Filtro por dispositivo
  if (filtroDispositivo.value) {
    const antesFiltro = resultado.length
    resultado = resultado.filter((log) => {
      const dispositivo =
        log.device ||
        log.Dispositivo ||
        log.NombreDispositivo ||
        log.deviceName ||
        log.nombreDispositivo ||
        ''
      return dispositivo.toLowerCase().includes(filtroDispositivo.value.toLowerCase())
    })
    console.log(
      `🔍 [Filtro Dispositivo] "${filtroDispositivo.value}": ${antesFiltro} → ${resultado.length}`
    )
  }

  // Filtro por escáner
  if (filtroEscaner.value) {
    const antesFiltro = resultado.length
    resultado = resultado.filter((log) => {
      const escaner =
        log.scanDevice ||
        log.Escaner ||
        log.Scanner ||
        log.NombreEscaner ||
        log.scannerName ||
        log.nombreEscaner ||
        ''
      return escaner.toLowerCase().includes(filtroEscaner.value.toLowerCase())
    })
    console.log(
      `🔍 [Filtro 5
      ] "${filtroEscaner.value}": ${antesFiltro} → ${resultado.length}`
    )
  }

  // Filtro por código de error
  if (filtroErrorCode.value) {
    const antesFiltro = resultado.length
    resultado = resultado.filter((log) => {
      const errorCode = log.errorCode || log.ErrorCode || log.codigo_error || ''
      return errorCode.toLowerCase().includes(filtroErrorCode.value.toLowerCase())
    })
    console.log(
      `🔍 [Filtro ErrorCode] "${filtroErrorCode.value}": ${antesFiltro} → ${resultado.length}`
    )
  }

  // Filtro por token de sesión
  if (filtroSessionToken.value) {
    const antesFiltro = resultado.length
    resultado = resultado.filter((log) => {
      const sessionToken = log.sessionToken || log.SessionToken || log.token_sesion || ''
      return sessionToken.toLowerCase().includes(filtroSessionToken.value.toLowerCase())
    })
    console.log(
      `🔍 [Filtro SessionToken] "${filtroSessionToken.value}": ${antesFiltro} → ${resultado.length}`
    )
  }

  console.log(`✅ [logsFiltrados] Resultado final: ${resultado.length} logs filtrados`)
  return resultado
})

// Computed para filtros activos
const filtrosActivos = computed(() => {
  const filtros = []

  if (filtroOficina.value) {
    const oficina = opcionesOficinas.value.find((o) => o.value === filtroOficina.value)
    filtros.push({
      key: 'oficina',
      label: `Oficina: ${oficina?.label || filtroOficina.value}`,
      color: 'orange',
      icon: 'business',
    })
  }

  if (filtroUsuario.value) {
    const usuario = opcionesUsuarios.value.find((u) => u.value === filtroUsuario.value)
    filtros.push({
      key: 'usuario',
      label: `Usuario: ${usuario?.label || filtroUsuario.value}`,
      color: 'green',
      icon: 'person',
    })
  }

  if (filtroTipoLog.value) {
    const tipo = opcionesTiposLog.value.find((t) => t.value === filtroTipoLog.value)
    filtros.push({
      key: 'tipo',
      label: `Tipo: ${tipo?.label || filtroTipoLog.value}`,
      color: 'blue',
      icon: 'category',
    })
  }

  if (rangoFechas.value) {
    filtros.push({
      key: 'fecha',
      label: `Fechas: ${textoRangoFechas.value}`,
      color: 'purple',
      icon: 'date_range',
    })
  }

  if (filtroProceso.value) {
    filtros.push({
      key: 'proceso',
      label: `Proceso: ${filtroProceso.value}`,
      color: 'orange',
      icon: 'settings',
    })
  }

  if (filtroDispositivo.value) {
    filtros.push({
      key: 'dispositivo',
      label: `Dispositivo: ${filtroDispositivo.value}`,
      color: 'teal',
      icon: 'devices',
    })
  }

  if (filtroEscaner.value) {
    filtros.push({
      key: 'escaner',
      label: `Escáner: ${filtroEscaner.value}`,
      color: 'cyan',
      icon: 'scanner',
    })
  }

  if (filtroErrorCode.value) {
    filtros.push({
      key: 'errorCode',
      label: `Error: ${filtroErrorCode.value}`,
      color: 'red-6',
      icon: 'error_outline',
    })
  }

  if (filtroSessionToken.value) {
    filtros.push({
      key: 'sessionToken',
      label: `Sesión: ${filtroSessionToken.value}`,
      color: 'green-6',
      icon: 'vpn_key',
    })
  }

  return filtros
})

// Computed para paginación
const totalPaginas = computed(() => {
  return Math.ceil(logsFiltrados.value.length / registrosPorPagina.value)
})

const logsPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * registrosPorPagina.value
  const fin = inicio + registrosPorPagina.value
  return logsFiltrados.value.slice(inicio, fin)
})

// Funciones auxiliares para obtener información de logs
const obtenerNombreOficina = (log) => {
  // Si hay oficina como objeto, extraer el nombre
  if (log.oficina && typeof log.oficina === 'object') {
    return log.oficina.nombre ||
           log.oficina.Nombre ||
           log.oficina.descripcion ||
           log.oficina.Descripcion ||
           'Oficina sin nombre'
  }

  // Si es string directo
  if (typeof log.oficina === 'string' && log.oficina.trim() !== '') {
    return log.oficina
  }

  // Respaldos para otras estructuras
  if (log.Oficina && typeof log.Oficina === 'object') {
    return log.Oficina.nombre ||
           log.Oficina.Nombre ||
           log.Oficina.descripcion ||
           log.Oficina.Descripcion ||
           'Oficina sin nombre'
  }

  if (typeof log.Oficina === 'string' && log.Oficina.trim() !== '') {
    return log.Oficina
  }

  return 'No especificada'
}

const obtenerDireccionOficina = (log) => {
  // Si hay oficina como objeto, extraer la dirección
  if (log.oficina && typeof log.oficina === 'object') {
    return log.oficina.direccion ||
           log.oficina.Direccion ||
           log.oficina.address ||
           null
  }

  // Respaldos para otras estructuras
  if (log.Oficina && typeof log.Oficina === 'object') {
    return log.Oficina.direccion ||
           log.Oficina.Direccion ||
           log.Oficina.address ||
           null
  }

  return null
}


const obtenerNombreUsuario = (log) => {
  // Construir nombre completo de la persona de la API /logs/filter
  if (log.person) {
    const nombres = log.person.nombres || ''
    const apellido1 = log.person.primerApellido || ''
    const apellido2 = log.person.segundoApellido || ''

    // Si tiene nombres, formar nombre completo
    if (nombres.trim()) {
      return `${nombres} ${apellido1} ${apellido2}`.trim()
    }

    // Si no tiene nombres pero tiene CURP, usar CURP
    if (log.person.curp) {
      return log.person.curp
    }
  }

  // Respaldos para estructuras anteriores
  return (
    log.PersonaCompleta?.NombreCompleto ||
    log.Usuario?.Nombre ||
    log.Usuario?.NombreCompleto ||
    log.Usuario ||
    'No especificado' // ← Valor por defecto
  )
}

// Función mejorada para obtener información completa del dispositivo y escáner
const obtenerInfoDispositivo = (log) => {
  // 🔧 PRIORIDAD: Datos de API directa (estructura moderna)
  let device = log.device
  let scanner = log.scanDevice

  // 🔧 FALLBACK ADICIONAL: SOLO campos reales
  if (!device && log.TrackingCode && log.TrackingCode.trim() !== '') {
    device = log.TrackingCode
  }

  if (!scanner) {
    if (log.scanDevice && log.scanDevice.trim() !== '') {
      scanner = log.scanDevice
    }
  }

  // 🔧 VALIDACIÓN: Determinar si hay datos reales
  const hasDevice = device && device !== 'No especificado' && device.trim() !== ''
  const hasScanner = scanner && scanner !== null && scanner.trim() !== ''

  return {
    device: hasDevice ? device : null,
    scanner: hasScanner ? scanner : null,
    hasDevice,
    hasScanner,
  }
}

// Función para formatear fecha completa con más detalle
const formatearFechaCompleta = (fecha) => {
  if (!fecha) return 'Sin fecha'

  try {
    let date

    // 🔧 CASO 1: Formato "31/07/2025, 15:55" (datos de gráficas)
    if (typeof fecha === 'string' && fecha.includes('/') && fecha.includes(',')) {
      const [fechaParte, horaParte] = fecha.split(', ')
      const [dia, mes, año] = fechaParte.split('/')

      if (dia && mes && año && horaParte) {
        const fechaISO = `${año}-${mes.padStart(2, '0')}-${dia.padStart(
          2,
          '0'
        )}T${horaParte.trim()}:00`
        date = new Date(fechaISO)
      } else {
        throw new Error('Formato de fecha incompleto')
      }
    }
    // 🔧 CASO 2: Formato "7/31/2025, 3:44:45 PM" (datos de gráficas con AM/PM)
    else if (
      typeof fecha === 'string' &&
      fecha.includes('/') &&
      (fecha.includes('AM') || fecha.includes('PM'))
    ) {
      date = new Date(fecha)
    }
    // 🔧 CASO 3: Formato ISO "2025-07-22T08:00:01" (datos de API directa)
    else if (typeof fecha === 'string' && fecha.includes('T')) {
      date = new Date(fecha)
    }
    // 🔧 CASO 4: Otros formatos
    else {
      date = new Date(fecha)
    }

    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) {
      console.log(`👌 Fecha formateada: "${fecha}". Mostrando en formato original.`)
      return fecha // Devolver el texto original si no se puede parsear
    }

    return date.toLocaleString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  } catch (error) {
    console.warn(`⚠️ Error al formatear fecha "${fecha}":`, error.message)
    return fecha // Devolver el texto original en caso de error
  }
}

// Función para obtener mensaje completo del log
const obtenerMensajeCompleto = (log) => {
  // 🔧 PRIORIDAD: Buscar en múltiples campos con orden de preferencia
  const mensaje =
    log.message || // API directa moderna
    log.Message || // Datos de gráficas
    log.Mensaje || // Campos alternativos
    log.description ||
    log.Description ||
    log.Descripcion ||
    log.process || // Fallback al proceso si no hay mensaje
    log.Proceso ||
    log.type || // Último recurso: el tipo
    log.Tipo ||
    log.EventType

  if (!mensaje || mensaje.trim() === '') {
    return 'Sin mensaje disponible'
  }

  return mensaje.trim()
}

// Función para obtener el icono según el tipo de log
const getIconoTipo = (tipo) => {
  const tipoLower = (tipo || '').toLowerCase()
  switch (tipoLower) {
    case 'success':
      return 'check_circle'
    case 'error':
      return 'error'
    case 'warning':
      return 'warning'
    case 'info':
      return 'info'
    case 'debug':
      return 'bug_report'
    case 'conectado':
    case 'connected':
    case 'online':
      return 'wifi'
    case 'desconectado':
    case 'disconnected':
    case 'offline':
      return 'wifi_off'
    default:
      return 'circle'
  }
}

// Función para obtener CURP del usuario
const obtenerCurpUsuario = (log) => {
  return log.person?.curp || log.Usuario?.curp || log.user?.curp || ''
}

// Funciones de paginación
const cambiarPagina = (nuevaPagina) => {
  paginaActual.value = nuevaPagina
}

// Watch para resetear la página cuando cambien los filtros
watch(
  [
    busqueda,
    filtroOficina,
    filtroUsuario,
    filtroTipoLog,
    filtroProceso,
    filtroDispositivo,
    filtroEscaner,
    filtroErrorCode,
    filtroSessionToken,
    rangoFechas,
  ],
  () => {
    paginaActual.value = 1
  }
)

// Watch para mostrar loader cuando hay muchos logs y se aplican filtros
// También maneja el debounce para filtros API desde sidebar
let timeoutFiltros = null
watch(
  [
    busqueda,
    filtroOficina,
    filtroUsuario,
    filtroTipoLog,
    filtroProceso,
    filtroDispositivo,
    filtroEscaner,
    filtroErrorCode,
    filtroSessionToken,
    rangoFechas,
  ],
  () => {
    // 🔄 Si el origen es sidebar, usar debounce para API
    if (origenConsola.value === 'sidebar') {
      console.log('🔄 [SIDEBAR] Filtro cambiado - Aplicando debounce para API')

      // Limpiar timeout anterior
      if (filtroTimeout.value) {
        clearTimeout(filtroTimeout.value)
      }

      // Aplicar debounce de 500ms para filtros API
      filtroTimeout.value = setTimeout(() => {
        if (mostrarConsola.value && !loading.value) {
          console.log('🚀 [SIDEBAR] Ejecutando filtrado con API después de debounce')
          cargarLogsConFiltrosAPI()
        }
      }, 500)
    }
    // 🎯 Si el origen es gráficas, usar filtrado cliente como antes
    else if (logs.value.length > 500) {
      console.log('📊 [GRAFICAS] Aplicando filtrado cliente')
      loadingFiltros.value = true

      // Limpiar timeout anterior
      if (timeoutFiltros) {
        clearTimeout(timeoutFiltros)
      }

      // Ocultar loader después de un breve delay
      timeoutFiltros = setTimeout(() => {
        loadingFiltros.value = false
      }, 300)
    }
  },
  { immediate: false }
)

// Watch para loader de paginación
watch(paginaActual, () => {
  if (logsFiltrados.value.length > 100) {
    loadingPaginacion.value = true
    setTimeout(() => {
      loadingPaginacion.value = false
    }, 200)
  }
})

// Funciones principales mejoradas
const abrirConsola = (logsData = null, filtroTexto = '', filtrosGrafica = null) => {
  mostrarConsola.value = true

  setTimeout(() => {
    filtrosToggle.value = true
  },1000)

  origenConsola.value = 'graficas' // Marcar origen desde gráficas

  if (logsData && logsData.length > 0) {
    // 🔧 NORMALIZAR DATOS: Detectar si vienen de gráficas y convertir campos
    const datosNormalizados = normalizarDatosLogs(logsData)

    logs.value = datosNormalizados
    filtroActual.value = filtroTexto
    datosDesdeGrafica.value = true

    // 🎯 APLICAR FILTROS DESDE GRÁFICAS
    if (filtrosGrafica) {
      console.log('🎯 Aplicando filtros desde gráficas:', filtrosGrafica)
      aplicarFiltrosDesdeGraficas(filtrosGrafica)
    }

    console.log(
      '📊 Consola abierta desde gráfica con',
      datosNormalizados.length,
      'logs normalizados'
    )
    // Actualizar opciones de filtros cuando se cargan nuevos datos
    obtenerOpcionesUnicas()
  } else {
    datosDesdeGrafica.value = false
    console.log('🔄 Consola abierta - cargando datos desde API')
    cargarLogsDesdeAPI(false)
  }
}

// 🔧 NUEVA FUNCIÓN: Normalizar datos de gráficas SIN GENERAR DATOS FAKE
const normalizarDatosLogs = (logsOriginales) => {
  console.log(
    '🔄 NORMALIZANDO DATOS DE GRÁFICAS (SOLO DATOS REALES):',
    logsOriginales.length,
    'registros'
  )

  // 📊 DEBUG: Mostrar estructura de los primeros 3 logs para análisis
  console.log('📊 ANÁLISIS DE ESTRUCTURA DE DATOS DESDE GRÁFICAS:')
  logsOriginales.slice(0, 3).forEach((log, index) => {
    console.log(`📋 Log ${index + 1} completo:`, JSON.stringify(log, null, 2))
    console.log(`🔍 Campos de dispositivo en Log ${index + 1}:`, {
      device: log.device,
      Dispositivo: log.Dispositivo,
      scanDevice: log.scanDevice,
      escaner: log.escaner,
      Escaner: log.Escaner,
      TrackingCode: log.TrackingCode,
    })
  })

  return logsOriginales.map((log, index) => {
    // Si ya tiene la estructura moderna de API, devolverlo tal como está
    if (log.device || log.scanDevice || (log.date && log.date.includes('T'))) {
      if (index < 3)
        console.log(`✅ Log ${index + 1} ya tiene estructura moderna:`, {
          device: log.device,
          scanDevice: log.scanDevice,
          date: log.date,
        })
      return log
    }

    // Es de gráficas, normalizar la estructura
    const logNormalizado = { ...log }

    // 🔧 NORMALIZAR DISPOSITIVO: SOLO si existe un valor real
    if (!logNormalizado.device) {
      if (log.Dispositivo) {
        if (
          typeof log.Dispositivo === 'object' &&
          log.Dispositivo.Nombre &&
          log.Dispositivo.Nombre !== 'No especificado'
        ) {
          logNormalizado.device = log.Dispositivo.Nombre
        } else if (
          typeof log.Dispositivo === 'string' &&
          log.Dispositivo !== 'No especificado' &&
          log.Dispositivo.trim() !== ''
        ) {
          logNormalizado.device = log.Dispositivo
        }
      }
      // SOLO usar Device o TrackingCode si son valores reales
      if (
        !logNormalizado.device &&
        log.device &&
        log.device !== 'No especificado' &&
        log.device.trim() !== ''
      ) {
        logNormalizado.device = log.device
      }
      if (!logNormalizado.device && log.TrackingCode && log.TrackingCode.trim() !== '') {
        logNormalizado.device = log.TrackingCode
      }
    }

    // 🔧 NORMALIZAR SCANNER: SOLO si existe un valor real - NO GENERAR FAKE
    if (!logNormalizado.scanDevice) {
      if (log.scanDevice && log.scanDevice.trim() !== '') {
        logNormalizado.scanDevice = log.scanDevice
      } else if (log.escaner && log.escaner.trim() !== '') {
        logNormalizado.scanDevice = log.escaner
      } else if (log.Escaner && log.Escaner.trim() !== '') {
        logNormalizado.scanDevice = log.Escaner
      }
      // NO GENERAR DATOS FAKE - dejar como undefined si no existen
    }

    // 🔧 NORMALIZAR OTROS CAMPOS
    logNormalizado.message = logNormalizado.message || log.Message || log.Mensaje
    logNormalizado.process = logNormalizado.process || log.process || log.Proceso
    logNormalizado.type = logNormalizado.type || log.type || log.Tipo

    // 🔧 NORMALIZAR FECHA: Mantener ambas para compatibilidad
    if (log.Date && !logNormalizado.date) {
      logNormalizado.date = log.Date
    }

    if (index < 3) {
      console.log(`🔄 Log ${index + 1} normalizado:`, {
        original: {
          Dispositivo: log.scanDevice,
          Device: log.scanDevice,
          Date: log.Date,
          Message: log.Message,
        },
        normalizado: {
          dispositivo: log.scanDevice,
          device: logNormalizado.scanDevice,
          scanDevice: logNormalizado.scanDevice,
          date: logNormalizado.date,
          message: logNormalizado.message,
        },
      })
    }

    return logNormalizado
  })
}

const aplicarFiltrosDesdeGraficas = (filtrosGrafica) => {
  console.log('🎯 Aplicando filtros desde gráficas:', filtrosGrafica)

  // Resetear filtros primero
  filtroOficina.value = null
  filtroUsuario.value = null
  filtroTipoLog.value = null
  filtroProceso.value = null
  filtroDispositivo.value = null
  filtroEscaner.value = null
  rangoFechas.value = null
  busqueda.value = ''

  // Aplicar filtros desde las gráficas
  if (filtrosGrafica.fechaInicio && filtrosGrafica.fechaFin) {
    rangoFechas.value = {
      from: filtrosGrafica.fechaInicio,
      to: filtrosGrafica.fechaFin,
    }
  }

  if (filtrosGrafica.oficina) {
    filtroOficina.value = filtrosGrafica.oficina
  }

  if (filtrosGrafica.usuario) {
    filtroUsuario.value = filtrosGrafica.usuario
  }

  // 🎯 FILTROS ESPECÍFICOS MEJORADOS
  if (filtrosGrafica.tipoLog) {
    // Mapear tipos específicos a los valores exactos del select
    const tipoMap = {
      ERROR: 'ERROR', // Errores de cualquier proceso
      SUCCESS: 'SUCCESS', // Éxitos (principalmente login)
      EXPORT: 'EXPORT', // Exportaciones
      START: 'START', // Inicio de escaneo
      END: 'END', // Fin exitoso de escaneo
      FIN: 'FIN', // Fin con error de escaneo
      INFO: 'INFO',
      WARNING: 'WARNING',
    }
    filtroTipoLog.value = tipoMap[filtrosGrafica.tipoLog] || filtrosGrafica.tipoLog
    console.log(`🎯 Filtro tipo aplicado: ${filtrosGrafica.tipoLog} → ${filtroTipoLog.value}`)
  }

  if (filtrosGrafica.proceso) {
    // Mapear procesos específicos a los valores exactos del select
    const procesoMap = {
      LOGIN: 'LOGIN', // Proceso de autenticación
      REGISTER: 'REGISTER', // Proceso de registro
      INE: 'INE', // Proceso de escaneo INE
      PASSPORT: 'PASSPORT', // Proceso de escaneo PASAPORTE
      SESSION: 'SESSION', // Sesiones
    }
    filtroProceso.value = procesoMap[filtrosGrafica.proceso] || filtrosGrafica.proceso
    console.log(`🎯 Filtro proceso aplicado: ${filtrosGrafica.proceso} → ${filtroProceso.value}`)
  }

  if (filtrosGrafica.dispositivo) {
    filtroDispositivo.value = filtrosGrafica.dispositivo
  }

  if (filtrosGrafica.escaner) {
    filtroEscaner.value = filtrosGrafica.escaner
  }

  console.log('✅ Filtros aplicados desde gráficas:', {
    rangoFechas: rangoFechas.value,
    filtroOficina: filtroOficina.value,
    filtroUsuario: filtroUsuario.value,
    filtroTipoLog: filtroTipoLog.value,
    filtroProceso: filtroProceso.value,
    filtroDispositivo: filtroDispositivo.value,
    filtroEscaner: filtroEscaner.value,
  })
}

//  [NUEVA FUNCIÓN] Cargar logs con filtros desde API (para sidebar)
const cargarLogsConFiltrosAPI = async () => {
  console.log('🚀 [SIDEBAR] CARGANDO LOGS CON FILTROS DESDE API')

  loading.value = true

  try {
    // 🔧 Construir parámetros de la petición
    const params = new URLSearchParams()

    // 📅 Fechas (siempre incluir rango básico)
    if (rangoFechas.value?.from && rangoFechas.value?.to) {
      params.append('fromDate', rangoFechas.value.from)
      params.append('toDate', rangoFechas.value.to)
    } else {
      // Rango por defecto si no hay fechas
      const fechaFin = new Date().toISOString().split('T')[0]
      const fechaInicio = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]
      params.append('fromDate', fechaInicio)
      params.append('toDate', fechaFin)
    }

    // 🏢 Oficina (enviar ID)
    if (filtroOficina.value) {
      const oficinaSeleccionada = oficinasFull.value.find((o) => o.label === filtroOficina.value)
      if (oficinaSeleccionada && oficinaSeleccionada.id) {
        params.append('oficinaId', oficinaSeleccionada.id)
      }
    }

    // 👤 Usuario (enviar ID)
    if (filtroUsuario.value) {
      const usuarioSeleccionado = usuariosFull.value.find((u) => u.label === filtroUsuario.value)
      if (usuarioSeleccionado && usuarioSeleccionado.id) {
        params.append('personId', usuarioSeleccionado.id)
      }
    }

    // 🏷️ Tipo (mapear a códigos de API)
    if (filtroTipoLog.value && filtroTipoLog.value.length > 0) {
      filtroTipoLog.value.forEach((tipo) => {
        const tipoMapeado = mapeoTipos[tipo] || tipo
        params.append('type', tipoMapeado)
      })
    }

    // ⚙️ Proceso (string directo)
    if (filtroProceso.value) {
      params.append('process', filtroProceso.value)
    }

    // 📱 Dispositivo (string directo)
    if (filtroDispositivo.value) {
      params.append('device', filtroDispositivo.value)
    }

    // 🔍 Escáner (string directo)
    if (filtroEscaner.value) {
      params.append('scanDevice', filtroEscaner.value)
    }

    // 🚨 Código de error (si existe y no está vacío)
    if (filtroErrorCode.value && filtroErrorCode.value.trim() !== '') {
      params.append('errorCode', filtroErrorCode.value.trim())
    }

    // 🎫 Token de sesión (si existe y no está vacío)
    if (filtroSessionToken.value && filtroSessionToken.value.trim() !== '') {
      params.append('sessionToken', filtroSessionToken.value.trim())
    }

    // 🔍 Búsqueda de texto (si existe)
    if (busqueda.value && busqueda.value.trim() !== '') {
      params.append('search', busqueda.value.trim())
    }

    console.log('📋 [SIDEBAR] Parámetros construidos:', Object.fromEntries(params))

    // 🌐 Hacer petición a la API
    const url = `${API_BASE_URL}/logs/filter?${params.toString()}`
    console.log('🔗 [SIDEBAR] URL de petición:', url)

    const response = await axios.get(url)
    console.log('📦 [SIDEBAR] Respuesta recibida:', response.data?.length || 0, 'logs')

    // 🔄 Procesar respuesta
    if (response.data && Array.isArray(response.data)) {
      logs.value = response.data

      // 📊 Extraer opciones de filtros dinámicamente de los nuevos datos
      obtenerOpcionesUnicas()

      // 📝 Actualizar estado
      // filtroActual.value = `Filtros aplicados (${logs.value.length} resultados)`

      console.log('✅ [SIDEBAR] Logs cargados exitosamente:', logs.value.length)

      // 🔔 Notificación de éxito
      $q.notify({
        type: 'positive',
        message: `Se encontraron ${logs.value.length} logs con los filtros aplicados`,
        position: 'top-right',
        timeout: 2000,
      })
    } else {
      console.warn('⚠️ [SIDEBAR] Respuesta inesperada de la API:', response.data)
      logs.value = []

      $q.notify({
        type: 'warning',
        message: 'No se encontraron logs con los filtros aplicados',
        position: 'top-right',
        timeout: 3000,
      })
    }
  } catch (error) {
    console.error('❌ [SIDEBAR] Error al cargar logs con filtros:', error)

    $q.notify({
      type: 'negative',
      message: 'Error al aplicar filtros. Intenta de nuevo.',
      position: 'top-right',
      timeout: 4000,
    })

    // En caso de error, mantener los logs actuales
  } finally {
    loading.value = false
  }
}

const cerrarConsola = () => {
  mostrarConsola.value = false
  busqueda.value = ''
  filtroActual.value = ''
  datosDesdeGrafica.value = false
  // Limpiar filtros al cerrar
  limpiarTodosFiltros()
}

// Función robusta para cargar logs desde API con manejo de errores mejorado
const cargarLogsDesdeAPI = async (rangoExtendido = false) => {
  loading.value = true
  try {
    console.log('🌐 Cargando logs desde API...')

    // Crear payload con filtros activos y validaciones
    const payload = {}

    // Agregar filtros de fecha con validación y formato correcto
    if (rangoFechas.value) {
      if (typeof rangoFechas.value === 'string') {
        // Validar y convertir formato de fecha
        const fechaFormateada = validarYFormatearFecha(rangoFechas.value)
        if (fechaFormateada) {
          payload.fechaInicio = fechaFormateada
          payload.fechaFin = fechaFormateada
        }
      } else if (rangoFechas.value.from && rangoFechas.value.to) {
        // 🔧 FORMATO CORRECTO: Asegurar formato ISO YYYY-MM-DD
        payload.fechaInicio = validarYFormatearFecha(rangoFechas.value.from)
        payload.fechaFin = validarYFormatearFecha(rangoFechas.value.to)
      }
    }

    // Si no hay fechas válidas, usar rango según el contexto
    if (!payload.fechaInicio || !payload.fechaFin) {
      const hoy = new Date()
      const fechaInicio = new Date()

      if (rangoExtendido) {
        // Para consola directa, usar último mes para obtener más datos
        fechaInicio.setDate(hoy.getDate() - 30)
        console.log('📅 Usando rango extendido: últimos 30 días')
      } else {
        // Para otros casos, usar últimos 7 días
        fechaInicio.setDate(hoy.getDate() - 7)
        console.log('📅 Usando rango estándar: últimos 7 días')
      }

      payload.fechaInicio = fechaInicio.toISOString().split('T')[0]
      payload.fechaFin = hoy.toISOString().split('T')[0]
    }

    console.log('📅 Rango de fechas final:', `${payload.fechaInicio} al ${payload.fechaFin}`)

    // Agregar otros filtros con validación
    if (filtroTipoLog.value && filtroTipoLog.value.trim() !== '') {
      payload.tipo = filtroTipoLog.value.trim()
    }

    if (filtroOficina.value && filtroOficina.value.trim() !== '') {
      payload.oficina = filtroOficina.value.trim()
    }

    if (filtroUsuario.value && filtroUsuario.value.trim() !== '') {
      payload.usuario = filtroUsuario.value.trim()
    }

    console.log('📡 Enviando parámetros validados a API /logs/filter:', payload)

    // 🔧 CONSTRUIR PARÁMETROS CON FORMATO CORRECTO (YYYY-MM-DD)
    const params = new URLSearchParams({
      fromDate: payload.fechaInicio || '2025-01-01',
      toDate: payload.fechaFin || '2025-12-31',
    })

    console.log('🗓️ FECHAS FINALES PARA API:')
    console.log('├── fromDate:', params.get('fromDate'))
    console.log('└── toDate:', params.get('toDate'))

    // Agregar filtros adicionales si están presentes
    if (payload.tipo && payload.tipo.trim() !== '') {
      params.append('type', payload.tipo.trim())
    }
    if (payload.proceso && payload.proceso.trim() !== '') {
      params.append('process', payload.proceso.trim())
    }
    if (payload.oficina && payload.oficina.trim() !== '') {
      // 🔧 CORREGIR: Convertir nombre de oficina a ID
      const oficinaId = obtenerIdOficina(payload.oficina.trim())
      if (oficinaId) {
        params.append('oficinaId', oficinaId.toString())
        console.log(`🏢 Oficina: "${payload.oficina}" → ID: ${oficinaId}`)
      } else {
        console.warn(`⚠️ No se encontró ID para oficina: "${payload.oficina}"`)
      }
    }
    if (payload.usuario && payload.usuario.trim() !== '') {
      // 🔧 CORREGIR: Convertir nombre de persona a ID
      const personaId = obtenerIdPersona(payload.usuario.trim())
      if (personaId) {
        params.append('personId', personaId.toString())
        console.log(`👤 Usuario: "${payload.usuario}" → ID: ${personaId}`)
      } else {
        console.warn(`⚠️ No se encontró ID para persona: "${payload.usuario}"`)
      }
    }

    console.log('🚀 URL completa:', `${API_BASE_URL}/logs/filter?${params}`)

    // Llamar al mismo endpoint que usan las gráficas (puerto 8024)
    const response = await Promise.race([
      axios.get(`${API_BASE_URL}/logs/filter?${params}`),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout después de 30 segundos')), 30000)
      ),
    ])

    console.log('📊 Respuesta API:', {
      status: response.status,
      dataLength: Array.isArray(response.data) ? response.data.length : 'No es array',
      dataType: typeof response.data,
      muestra: Array.isArray(response.data) ? response.data.slice(0, 2) : response.data,
    })

    // 📋 LOG DETALLADO: Mostrar estructura completa de los primeros registros
    if (Array.isArray(response.data) && response.data.length > 0) {
      console.log('📋 ESTRUCTURA DETALLADA DE LOS DATOS RECIBIDOS:')
      console.log('├── Total de registros:', response.data.length)
      console.log('├── Primer registro completo:', JSON.stringify(response.data[0], null, 2))

      if (response.data.length > 1) {
        console.log('├── Segundo registro completo:', JSON.stringify(response.data[1], null, 2))
      }

      // Analizar campos disponibles
      const camposDisponibles = Object.keys(response.data[0])
      console.log('├── Campos disponibles:', camposDisponibles)

      // Verificar estructura de person y oficina
      if (response.data[0].person) {
        console.log('├── Estructura person:', Object.keys(response.data[0].person))
      }
      if (response.data[0].oficina) {
        console.log('├── Estructura oficina:', Object.keys(response.data[0].oficina))
      }

      console.log('└── Dispositivos encontrados:')
      response.data.slice(0, 5).forEach((log, index) => {
        console.log(
          `    ${index + 1}. Device: "${log.device || 'N/A'}" | scanDevice: "${
            log.scanDevice || 'N/A'
          }"`
        )
      })
    }

    if (
      response.data &&
      response.data !== 'PRO FEATURE ONLY' &&
      Array.isArray(response.data) &&
      response.data.length > 0
    ) {
      logs.value = response.data
      console.log('✅ Logs cargados desde API:', logs.value.length, 'registros')

      // 🔍 DEBUG: Analizar campos errorCode y sessionToken
      console.log('🔍 ANÁLISIS DE ERROR CODES Y SESSION TOKENS:')

      // Buscar logs que tengan errorCode o ErrorCode
      const logsConErrorCode = response.data.filter((log) => log.errorCode || log.ErrorCode)
      console.log('├── Logs con errorCode/ErrorCode:', logsConErrorCode.length)
      if (logsConErrorCode.length > 0) {
        console.log(
          '├── Ejemplos de errorCode:',
          logsConErrorCode.slice(0, 3).map((log) => ({
            errorCode: log.errorCode,
            ErrorCode: log.ErrorCode,
            allFields: Object.keys(log),
          }))
        )
      }

      // Buscar logs que tengan sessionToken o SessionToken
      const logsConSessionToken = response.data.filter(
        (log) => log.sessionToken || log.SessionToken
      )
      console.log('├── Logs con sessionToken/SessionToken:', logsConSessionToken.length)
      if (logsConSessionToken.length > 0) {
        console.log(
          '├── Ejemplos de sessionToken:',
          logsConSessionToken.slice(0, 3).map((log) => ({
            sessionToken: log.sessionToken,
            SessionToken: log.SessionToken,
            allFields: Object.keys(log),
          }))
        )
      }

      // Buscar campos que contengan "error", "code", "token", "session"
      const allFields = [...new Set(response.data.flatMap((log) => Object.keys(log)))]
      const errorFields = allFields.filter(
        (field) => field.toLowerCase().includes('error') || field.toLowerCase().includes('code')
      )
      const tokenFields = allFields.filter(
        (field) => field.toLowerCase().includes('token') || field.toLowerCase().includes('session')
      )

      console.log('├── Campos relacionados con error/code:', errorFields)
      console.log('└── Campos relacionados con token/session:', tokenFields)

      // 🔍 DEBUG: Analizar fechas en los logs cargados
      console.log('📅 ANÁLISIS DE FECHAS EN LOGS CARGADOS:')
      const fechasEncontradas = logs.value.slice(0, 10).map((log) => ({
        Date: log.Date,
        Fecha: log.Fecha,
        FechaCreacion: log.FechaCreacion,
        fechaFinal: log.Date || log.Fecha || log.FechaCreacion,
      }))
      console.log('├── Muestra de fechas (primeros 10):', fechasEncontradas)

      const fechasUnicas = [
        ...new Set(
          logs.value.map((log) => {
            const fecha = log.Date || log.Fecha || log.FechaCreacion
            return fecha ? new Date(fecha).toISOString().split('T')[0] : 'SIN_FECHA'
          })
        ),
      ].slice(0, 10)
      console.log('├── Fechas únicas encontradas (muestra):', fechasUnicas)
      console.log(
        '└── Total logs con fecha válida:',
        logs.value.filter((log) => log.Date || log.Fecha || log.FechaCreacion).length
      )

      filtroActual.value = `Datos cargados desde API (${logs.value.length} registros) del ${payload.fechaInicio} al ${payload.fechaFin}`

      // Actualizar opciones de filtros
      obtenerOpcionesUnicas()

      // $q.notify({
      //   type: 'positive',
      //   message: `${logs.value.length} logs cargados desde la API`,
      //   position: 'top',
      // })
    } else {
      // Sin datos válidos de la API - mostrar mensaje sin datos
      console.log('⚠️ API sin datos válidos, mostrando mensaje de no hay datos')
      logs.value = []
      filtroActual.value = `Sin datos disponibles del ${payload.fechaInicio} al ${payload.fechaFin}`

      $q.notify({
        type: 'info',
        message: 'No hay datos disponibles para los filtros seleccionados',
        position: 'top',
      })
    }
  } catch (error) {
    console.error('❌ Error al cargar logs desde API:', error)

    // NO cargar datos de muestra, mostrar mensaje de error
    logs.value = []
    filtroActual.value = 'Error al cargar datos'

    $q.notify({
      type: 'negative',
      message: 'Error al cargar datos desde la API. No hay datos disponibles.',
      position: 'top',
      timeout: 4000,
    })
  } finally {
    loading.value = false
  }
}

// Función global de debug para verificar estado
window.debugConsola = () => {
  console.log('🔍 ESTADO DE LA CONSOLA:')
  console.log('├── Logs cargados:', logs.value.length)
  console.log('├── Filtro actual:', filtroActual.value)
  console.log('├── Rango fechas:', rangoFechas.value)
  console.log('├── Filtros aplicados:', {
    tipo: filtroTipoLog.value,
    oficina: filtroOficina.value,
    usuario: filtroUsuario.value,
  })
  console.log('├── Loading:', loading.value)
  console.log('├── Consola visible:', mostrarConsola.value)
  console.log('└── Último error de API verificado')

  // Probar conexión a API
  cargarLogsDesdeAPI(false)
}

// Función de debug para probar la consola directa
window.debugConsolaDirecta = () => {
  console.log('🚀 PROBANDO CONSOLA DIRECTA desde debug')
  abrirConsolaDirecta()
}

// 🏢 CARGAR OFICINAS DEL CATÁLOGO
const cargarOficinasDelCatalogo = async () => {
  try {
    console.log('🏢 Cargando oficinas del catálogo...')
    const oficinasFromAPI = await CatalogService.cargarOficinas()

    // Actualizar el mapa para conversión nombre -> ID
    mapaOficinas.value.clear()
    oficinasFromAPI.forEach((oficina) => {
      mapaOficinas.value.set(oficina.label, oficina.value)
    })

    console.log('🗂️ Mapa de oficinas creado:', Object.fromEntries(mapaOficinas.value))

    // Actualizar opciones para los selectores
    oficinasFull.value = oficinasFromAPI
    opcionesOficinas.value = [...oficinasFull.value]

    return oficinasFromAPI.length > 0
  } catch (error) {
    console.error('❌ Error cargando oficinas del catálogo:', error)
    return false
  }
}

// CARGAR PERSONAS DEL CATÁLOGO
const cargarPersonasDelCatalogo = async () => {
  try {
    console.log('👥 Cargando personas del catálogo...')
    const personasFromAPI = await CatalogService.cargarPersonas()

    // Actualizar el mapa para conversión nombre -> ID
    mapaPersonas.value.clear()
    personasFromAPI.forEach((persona) => {
      // Extraer solo el nombre sin CURP para el mapeo
      const nombreSinCurp = persona.label.split(' (')[0]
      mapaPersonas.value.set(nombreSinCurp, persona.value)
      // También mapear con el label completo por si acaso
      mapaPersonas.value.set(persona.label, persona.value)
    })

    console.log('🗂️ Mapa de personas creado:', Object.fromEntries(mapaPersonas.value))

    // Actualizar opciones para los selectores
    usuariosFull.value = personasFromAPI
    opcionesUsuarios.value = [...usuariosFull.value]

    return personasFromAPI.length > 0
  } catch (error) {
    console.error('❌ Error cargando personas del catálogo:', error)
    return false
  }
}

//� OBTENER ID DE OFICINA POR NOMBRE
const obtenerIdOficina = (nombreOficina) => {
  if (!nombreOficina) return null

  const id = mapaOficinas.value.get(nombreOficina)
  console.log(`🏢 Convertir "${nombreOficina}" → ID: ${id}`)
  return id
}

// Funciones de filtrado mejoradas
const obtenerOpcionesUnicas = () => {
  console.log('🔍 OBTENIENDO OPCIONES ÚNICAS DE', logs.value.length, 'LOGS')
  console.log('📊 Muestra de datos para análisis:', logs.value.slice(0, 2))

  // Obtener oficinas únicas con múltiples campos
  const oficinasUnicas = [
    ...new Set(
      logs.value
        .filter((log) => {
          const oficina = obtenerNombreOficina(log)
          return oficina && oficina.toString().trim() !== '' && oficina !== 'No especificada'
        })
        .map((log) => obtenerNombreOficina(log))
    ),
  ].sort()

  console.log('🏢 Oficinas encontradas:', oficinasUnicas.length, '→', oficinasUnicas)

  // Agregar opciones predeterminadas si no hay datos de la API
  // if (oficinasUnicas.length === 0) {
  //   console.log('⚠️ No se encontraron oficinas en los datos, agregando opciones predeterminadas')
  //   oficinasUnicas.push(
  //     'Oficina Aguascalientes',
  //     'Oficina Baja California',
  //     'Oficina CDMX',
  //     'Oficina Guadalajara',
  //     'Oficina Monterrey'
  //   )
  // }

  // oficinasFull.value = oficinasUnicas.map((oficina) => ({
  //   label: oficina,
  //   value: oficina,
  // }))
  oficinasFull.value = oficinasUnicas.map((oficina) => ({
    label: typeof oficina === 'object'
        ? (oficina.nombre || oficina.Nombre || oficina.descripcion || oficina.Descripcion || String(oficina))
        : oficina,
    value: typeof oficina === 'object'
        ? (oficina.nombre || oficina.Nombre || oficina.descripcion || oficina.Descripcion || String(oficina))
        : oficina,
}))
  opcionesOficinas.value = [...oficinasFull.value]

  // Obtener usuarios únicos with múltiples campos
  const usuariosUnicos = [
    ...new Set(
      logs.value
        .filter((log) => {
          const usuario = obtenerNombreUsuario(log)
          return usuario && usuario.toString().trim() !== '' && usuario !== 'No especificado'
        })
        .map((log) => obtenerNombreUsuario(log))
    ),
  ].sort()

  console.log('👥 Usuarios encontrados:', usuariosUnicos.length, '→', usuariosUnicos.slice(0, 5))

  // Agregar opciones predeterminadas si no hay datos de la API
  if (usuariosUnicos.length === 0) {
    console.log('⚠️ No se encontraron usuarios en los datos, agregando opciones predeterminadas')
    usuariosUnicos.push(
      'STEVE ALVAREZ ZEPETA',
      'CARLOS HERNANDEZ ROJAS',
      'ANA GARCIA LOPEZ',
      'LUIS MARTINEZ VEGA',
      'MARIA RODRIGUEZ SILVA'
    )
  }

  usuariosFull.value = usuariosUnicos.map((usuario) => ({
    label: usuario,
    value: usuario,
  }))
  opcionesUsuarios.value = [...usuariosFull.value]

  // 🆕 OBTENER DISPOSITIVOS ÚNICOS con soporte para múltiples estructuras
  const devicesUnicos = [
    ...new Set(
      logs.value
        .filter((log) => {
          const info = obtenerInfoDispositivo(log)
          return info.hasDevice
        })
        .map((log) => {
          const info = obtenerInfoDispositivo(log)
          return info.device
        })
    ),
  ].sort()

  console.log('📱 Devices encontrados:', devicesUnicos.length, '→', devicesUnicos)

  // 🆕 OBTENER SCAN DEVICES ÚNICOS con soporte para múltiples estructuras
  const scanDevicesUnicos = [
    ...new Set(
      logs.value
        .filter((log) => {
          const info = obtenerInfoDispositivo(log)
          return info.hasScanner
        })
        .map((log) => {
          const info = obtenerInfoDispositivo(log)
          return info.scanner
        })
    ),
  ].sort()

  console.log('🔍 ScanDevices encontrados:', scanDevicesUnicos.length, '→', scanDevicesUnicos)

  // Asignar dispositivos a las variables Full y opciones
  dispositivosFull.value = devicesUnicos.map((dispositivo) => ({
    label: dispositivo,
    value: dispositivo,
  }))
  opcionesDispositivos.value = [...dispositivosFull.value]

  // Asignar escáneres a las variables Full y opciones
  escanersFull.value = scanDevicesUnicos.map((escaner) => ({
    label: escaner,
    value: escaner,
  }))
  opcionesEscaners.value = [...escanersFull.value]

  console.log(
    '✅ OPCIONES FINALES:',
    '\n├── Oficinas:',
    opcionesOficinas.value.length,
    '\n├── Usuarios:',
    opcionesUsuarios.value.length,
    '\n├── Devices:',
    devicesUnicos.length,
    '\n└── ScanDevices:',
    scanDevicesUnicos.length
  )
}

const filtrarOficinas = (val, update) => {
  update(() => {
    if (val === '') {
      opcionesOficinas.value = oficinasFull.value
    } else {
      const needle = val.toLowerCase()
      opcionesOficinas.value = oficinasFull.value.filter(
        (oficina) => String(oficina.label).toLowerCase().indexOf(needle) > -1
      )
    }
  })
}

const filtrarUsuarios = (val, update) => {
  update(() => {
    if (val === '') {
      opcionesUsuarios.value = usuariosFull.value
    } else {
      const needle = val.toLowerCase()
      opcionesUsuarios.value = usuariosFull.value.filter(
        (usuario) => usuario.label.toLowerCase().indexOf(needle) > -1
      )
    }
  })
}

const filtrarDispositivos = (val, update) => {
  update(() => {
    if (val === '') {
      opcionesDispositivos.value = dispositivosFull.value
    } else {
      const needle = val.toLowerCase()
      opcionesDispositivos.value = dispositivosFull.value.filter(
        (dispositivo) => dispositivo.label.toLowerCase().indexOf(needle) > -1
      )
    }
  })
}

const filtrarEscaners = (val, update) => {
  update(() => {
    if (val === '') {
      opcionesEscaners.value = escanersFull.value
    } else {
      const needle = val.toLowerCase()
      opcionesEscaners.value = escanersFull.value.filter(
        (escaner) => escaner.label.toLowerCase().indexOf(needle) > -1
      )
    }
  })
}

const limpiarFiltro = (key) => {
  switch (key) {
    case 'oficina':
      filtroOficina.value = null
      break
    case 'usuario':
      filtroUsuario.value = null
      break
    case 'tipo':
      filtroTipoLog.value = null
      break
    case 'proceso':
      filtroProceso.value = null
      break
    case 'dispositivo':
      filtroDispositivo.value = null
      break
    case 'escaner':
      filtroEscaner.value = null
      break
    case 'fecha':
      rangoFechas.value = null
      break
  }

  // Si no hay datos de gráfica, recargar desde API con nuevos filtros
  if (!datosDesdeGrafica.value) {
    cargarLogsDesdeAPI(false)
  }
}

const limpiarTodosFiltros = () => {
  console.log('🧹 LIMPIANDO TODOS LOS FILTROS')

  filtroOficina.value = null
  filtroUsuario.value = null
  filtroTipoLog.value = null
  filtroProceso.value = null
  filtroDispositivo.value = null
  filtroEscaner.value = null
  filtroErrorCode.value = '' // 🆕 NUEVO FILTRO
  filtroSessionToken.value = '' // 🆕 NUEVO FILTRO
  rangoFechas.value = null
  busqueda.value = ''

  console.log('✅ Todos los filtros limpiados incluyendo errorCode y sessionToken')

  // Si no hay datos de gráfica, recargar desde API
  if (!datosDesdeGrafica.value) {
    cargarLogsDesdeAPI(false)
  }
}

const cargarLogs = () => {
  if (datosDesdeGrafica.value) {
    console.log('📊 Usando datos de gráfica existentes')
    return
  }
  cargarLogsDesdeAPI(false)
}

const formatearFecha = (fecha) => {
  if (!fecha) return 'Sin fecha'

  try {
    let date

    // Manejar el formato específico "31/07/2025, 15:55" (campo "Fecha" de la API)
    if (typeof fecha === 'string' && fecha.includes('/') && fecha.includes(',')) {
      // Formato: "31/07/2025, 15:55" -> convertir a formato ISO
      const [fechaParte, horaParte] = fecha.split(', ')
      const [dia, mes, año] = fechaParte.split('/')

      // Validar que tenemos todos los componentes
      if (dia && mes && año && horaParte) {
        const fechaISO = `${año}-${mes.padStart(2, '0')}-${dia.padStart(
          2,
          '0'
        )}T${horaParte.trim()}:00`
        date = new Date(fechaISO)
      } else {
        throw new Error('Formato de fecha incompleto')
      }
    } else {
      date = new Date(fecha)
    }

    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) {
      console.warn(`⚠️ Fecha no válida en formatearFecha: "${fecha}". Mostrando texto original.`)
      return fecha // Devolver el texto original si no se puede parsear
    }

    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch (error) {
    console.warn(`⚠️ Error al formatear fecha en formatearFecha "${fecha}":`, error.message)
    return fecha // Devolver el texto original en caso de error
  }
}

const getColorTipo = (tipo) => {
  const colores = {
    ERROR: 'negative',
    SUCCESS: 'positive',
    WARNING: 'warning',
    INFO: 'info',
    LOGIN: 'blue',
    REGISTRO: 'green',
    EXPORTACION: 'purple',
    AUTENTICACION: 'indigo',
    VALIDACION: 'teal',
    OPERACION: 'brown',
    CONECTADO: 'positive',
    DESCONECTADO: 'negative',
    ONLINE: 'positive',
    OFFLINE: 'negative',
    CONNECTED: 'positive',
    DISCONNECTED: 'negative',
  }
  return colores[(tipo || 'INFO').toUpperCase()] || 'info'
}

const getColorProceso = (proceso) => {
  const colores = {
    LOGIN: 'green',
    REGISTER: 'blue',
    SCAN: 'orange',
    EXPORT: 'purple',
    VALIDATION: 'teal',
    SYSTEM: 'grey',
    QR: 'indigo',
    MRZ: 'brown',
    FACIAL: 'pink',
    BIOMETRIC: 'cyan',
  }
  return colores[(proceso || 'SYSTEM').toUpperCase()] || 'blue'
}

const mostrarDetalleLog = (log) => {
  logSeleccionado.value = log
  modalDetalle.value = true

  // 🔍 DEBUG: Inspeccionar estructura de datos para errorCode y sessionToken
  console.log('🔍 ESTRUCTURA DEL LOG SELECCIONADO:')
  console.log('├── Log completo:', log)
  console.log('├── errorCode:', log.errorCode)
  console.log('├── ErrorCode:', log.ErrorCode)
  console.log('├── sessionToken:', log.sessionToken)
  console.log('├── SessionToken:', log.SessionToken)
  console.log('├── Todas las propiedades:', Object.keys(log))

  // Verificar propiedades que podrían contener códigos de error
  const errorProps = Object.keys(log).filter(
    (key) =>
      key.toLowerCase().includes('error') ||
      key.toLowerCase().includes('code') ||
      key.toLowerCase().includes('status')
  )
  console.log('├── Propiedades con "error/code/status":', errorProps)
  errorProps.forEach((prop) => {
    console.log(`    ${prop}: ${log[prop]}`)
  })

  // Verificar propiedades que podrían contener tokens
  const tokenProps = Object.keys(log).filter(
    (key) =>
      key.toLowerCase().includes('token') ||
      key.toLowerCase().includes('session') ||
      key.toLowerCase().includes('auth')
  )
  console.log('├── Propiedades con "token/session/auth":', tokenProps)
  tokenProps.forEach((prop) => {
    console.log(`    ${prop}: ${log[prop]}`)
  })

  // Buscar en el mensaje si contiene información de error o token
  const mensaje = obtenerMensajeCompleto(log)
  if (mensaje) {
    const contieneError = /error|fail|exception/i.test(mensaje)
    const contieneToken = /token|session|auth/i.test(mensaje)
    console.log('├── Mensaje contiene "error":', contieneError)
    console.log('└── Mensaje contiene "token":', contieneToken)
  }
}

const limpiarConsola = () => {
  logs.value = []
  busqueda.value = ''
  filtroActual.value = ''
  datosDesdeGrafica.value = false
  limpiarTodosFiltros()
  $q.notify({
    type: 'info',
    message: 'Consola limpiada - ahora se cargarán datos desde la API',
    position: 'top',
  })
  // Después de limpiar, cargar datos frescos desde API
  cargarLogsDesdeAPI(false)
}

// Función de exportación mejorada con múltiples formatos
const exportarLogs = (formato = 'json') => {
  if (!logsFiltrados.value.length) return

  try {
    const datosExport = logsFiltrados.value.map((log) => ({
      Fecha: formatearFecha(log.Date || log.Fecha || log.FechaCreacion),
      Tipo: log.type || log.Tipo || log.EventType || 'INFO',
      Proceso: log.process || log.Proceso || '',
      Mensaje: log.Message || log.Mensaje || '',
      Usuario: obtenerNombreUsuario(log),
      Oficina: obtenerNombreOficina(log),
      Dispositivo: log.device || log.Dispositivo || '',
    }))

    const timestamp = new Date().toISOString().split('T')[0]
    let contenido, mimeType, extension

    switch (formato) {
      case 'excel': {
        // Para Excel necesitaríamos una librería como xlsx, por ahora CSV
        const csvHeaders = Object.keys(datosExport[0]).join(',')
        const csvRows = datosExport.map((row) =>
          Object.values(row)
            .map((value) =>
              typeof value === 'string' && value.includes(',') ? `"${value}"` : value
            )
            .join(',')
        )
        contenido = csvHeaders + '\n' + csvRows.join('\n')
        mimeType = 'text/csv'
        extension = 'csv'
        break
      }

      case 'txt': {
        contenido = datosExport
          .map(
            (log) =>
              `[${log.Fecha}] ${log.Tipo} - ${log.Proceso} - ${log.Usuario} (${log.Oficina}) - ${
                log.Dispositivo
              }\n${log.Mensaje}\n${'='.repeat(80)}\n`
          )
          .join('\n')
        mimeType = 'text/plain'
        extension = 'txt'
        break
      }

      case 'json':
      default: {
        contenido = JSON.stringify(datosExport, null, 2)
        mimeType = 'application/json'
        extension = 'json'
        break
      }
    }

    const blob = new Blob([contenido], { type: mimeType })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `logs_${timestamp}.${extension}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)

    $q.notify({
      type: 'positive',
      message: `${logsFiltrados.value.length} logs exportados como ${formato.toUpperCase()}`,
      position: 'top',
    })
  } catch (error) {
    console.error('Error al exportar:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al exportar los logs',
      position: 'top',
    })
  }
}

// Función específica para abrir desde sidebar con datos frescos de API
const abrirConsolaDirecta = async () => {
  console.log('🚀 ABRIENDO CONSOLA DIRECTA DESDE SIDEBAR - versión con carga API')

  setTimeout(() => {
    filtrosToggle.value = true
  },1000)

  // 🔧 Establecer origen como sidebar para usar filtrado API
  origenConsola.value = 'sidebar'

  mostrarConsola.value = true
  filtroActual.value = 'Consola directa - Datos cargados desde API'
  datosDesdeGrafica.value = false

  // 🏢 Cargar oficinas del catálogo para el mapeo ID-nombre
  await cargarOficinasDelCatalogo()

  // 👥 Cargar personas del catálogo para el mapeo ID-nombre
  await cargarPersonasDelCatalogo()

  // 🧹 LIMPIAR TODOS LOS FILTROS INCLUYENDO LOS NUEVOS
  console.log('🧹 [SIDEBAR] LIMPIANDO TODOS LOS FILTROS PARA DEBUGGING')
  rangoFechas.value = null
  filtroOficina.value = null
  filtroUsuario.value = null
  filtroTipoLog.value = null
  filtroProceso.value = null
  filtroDispositivo.value = null
  filtroEscaner.value = null
  filtroErrorCode.value = '' // 🆕 NUEVO FILTRO
  filtroSessionToken.value = '' // 🆕 NUEVO FILTRO
  busqueda.value = ''

  // 🔍 LOG DE ESTADO INICIAL DE FILTROS
  console.log('🧹 [SIDEBAR] Estado después de limpiar filtros:', {
    filtroErrorCode: filtroErrorCode.value,
    filtroSessionToken: filtroSessionToken.value,
    filtroProceso: filtroProceso.value,
    filtroDispositivo: filtroDispositivo.value,
    filtroEscaner: filtroEscaner.value,
    filtroOficina: filtroOficina.value,
    filtroUsuario: filtroUsuario.value,
    filtroTipoLog: filtroTipoLog.value,
  })

  // Cargar datos frescos desde API usando filtros con parámetros
  await cargarLogsConFiltrosAPI()

  // 🔍 DEBUG FINAL
  debugearEstadoFiltros('SIDEBAR - POST CARGA API')
}

const obtenerIdPersona = (nombrePersona) => {
  if (!nombrePersona) return null
  const id = mapaPersonas.value.get(nombrePersona)
  console.log(`👤 Convertir "${nombrePersona}" → ID: ${id}`)
  return id
}

// 👀 WATCHER: Recargar datos automáticamente cuando cambien las fechas
watch(
  () => rangoFechas.value,
  (nuevasfechas, fechasAnteriores) => {
    // Solo ejecutar si la consola está abierta y hay fechas válidas
    if (mostrarConsola.value && nuevasfechas && !loading.value) {
      console.log('📅 CAMBIO DE FECHAS DETECTADO - Recargando datos automáticamente')
      console.log('├── Fechas anteriores:', fechasAnteriores)
      console.log('└── Fechas nuevas:', nuevasfechas)

      // Recargar datos con un pequeño delay para evitar múltiples llamadas
      setTimeout(() => {
        if (!loading.value) {
          // 🔄 Usar la función correcta según el origen
          if (origenConsola.value === 'sidebar') {
            console.log('📅 [SIDEBAR] Recargando con API por cambio de fechas')
            cargarLogsConFiltrosAPI()
          } else {
            console.log('📅 [GRAFICAS] Recargando con filtrado cliente por cambio de fechas')
            cargarLogsDesdeAPI(false)
          }
        }
      }, 300)
    }
  },
  { deep: true } // Para detectar cambios en objetos anidados
)

// 🔍 MÉTODOS DE DIAGNÓSTICO TÉCNICO
const abrirDiagnosticoError = (errorCode) => {
  console.log('🔍 Abriendo diagnóstico para código de error:', errorCode)

  if (diagnosticoRef.value) {
    diagnosticoRef.value.abrirDiagnostico(errorCode)
  }

  $q.notify({
    type: 'info',
    message: 'Diagnóstico iniciado',
    caption: `Analizando código: ${errorCode}`,
    icon: 'bug_report',
    position: 'top-right',
  })
}

const abrirDiagnosticoSesion = (sessionToken) => {
  console.log('👤 Abriendo diagnóstico para sesión:', sessionToken)

  if (diagnosticoRef.value) {
    diagnosticoRef.value.abrirDiagnostico(sessionToken)
  }

  $q.notify({
    type: 'info',
    message: 'Diagnóstico de sesión iniciado',
    caption: `Analizando token: ${sessionToken.substring(0, 15)}...`,
    icon: 'account_circle',
    position: 'top-right',
  })
}

const cerrarDiagnostico = () => {
  console.log('✅ Diagnóstico cerrado')
}

// Función auxiliar para debuggear el diagnóstico
const abrirDiagnosticoManual = () => {
  console.log('🔍 Intentando abrir diagnóstico...')
  console.log('🔍 diagnosticoRef:', diagnosticoRef.value)

  if (diagnosticoRef.value) {
    console.log('✅ Referencia encontrada, llamando abrirDiagnostico...')
    diagnosticoRef.value.abrirDiagnostico()
  } else {
    console.error('❌ No se encontró la referencia al componente de diagnóstico')
  }
}

const filtrarLogs = (e) => {
  console.log(e.tarjet.value)
}

// Exposición de funciones
defineExpose({
  abrirConsola,
  abrirConsolaDirecta,
  cerrarConsola,
  mostrarConsola,
  // 🔍 Nuevos métodos de diagnóstico
  abrirDiagnosticoError,
  abrirDiagnosticoSesion,
  abrirDiagnosticoManual,
  cerrarDiagnostico,
  filtrarLogs,
})
</script>

<style lang="scss" scoped>
.console-modal-card {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.console-header {
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
}

.console-controls {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.console-body {
  flex: 1;
  overflow-y: auto;
  max-height: calc(100vh - 200px);
}

.logs-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.log-item {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: translateY(-1px);
  }

  &.log-error {
    border-left: 4px solid #f44336;
  }

  &.log-success {
    border-left: 4px solid #4caf50;
  }

  &.log-warning {
    border-left: 4px solid #ff9800;
  }

  &.log-info {
    border-left: 4px solid #2196f3;
  }

  &.log-login {
    border-left: 4px solid #2196f3;
  }

  &.log-registro {
    border-left: 4px solid #4caf50;
  }

  &.log-exportacion {
    border-left: 4px solid #9c27b0;
  }
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.log-time {
  display: flex;
  align-items: center;
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  font-family: 'Roboto Mono', monospace;
}

.log-content {
  .log-process {
    color: #81c784;
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
  }

  .log-message {
    color: rgba(255, 255, 255, 0.85);
    font-size: 13px;
    line-height: 1.4;
    margin-bottom: 6px;
  }

  .log-details {
    color: rgba(255, 255, 255, 0.6);
    font-size: 12px;
    display: flex;
    align-items: center;
  }

  .log-user-info {
    margin-top: 6px;
    padding: 8px;
    background: rgba(76, 175, 80, 0.05);
    border-radius: 6px;
    border-left: 3px solid rgba(76, 175, 80, 0.3);

    .user-details {
      color: rgba(255, 255, 255, 0.85);
      font-size: 12px;
      display: flex;
      align-items: center;
    }
  }

  .office-info {
    margin-top: 4px;
    padding: 6px 8px;
    background: rgba(255, 152, 0, 0.05);
    border-radius: 6px;
    border-left: 3px solid rgba(255, 152, 0, 0.3);

    .office-details {
      color: rgba(255, 255, 255, 0.85);
      font-size: 12px;
      display: flex;
      align-items: center;
    }
  }

  .log-device-info {
    margin-top: 4px;
    padding: 6px 8px;
    background: rgba(156, 39, 176, 0.05);
    border-radius: 6px;
    border-left: 3px solid rgba(156, 39, 176, 0.3);

    .device-details {
      color: rgba(255, 255, 255, 0.85);
      font-size: 12px;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 4px;
    }
  }

  .log-datetime-info {
    margin-top: 4px;
    padding: 6px 8px;
    background: rgba(63, 81, 181, 0.05);
    border-radius: 6px;
    border-left: 3px solid rgba(63, 81, 181, 0.3);

    .datetime-details {
      color: rgba(255, 255, 255, 0.85);
      font-size: 12px;
      display: flex;
      align-items: center;
    }
  }

  .log-full-message {
    margin-top: 4px;
    padding: 8px;
    background: rgba(255, 193, 7, 0.05);
    border-radius: 6px;
    border-left: 3px solid rgba(255, 193, 7, 0.3);

    .message-details {
      color: rgba(255, 255, 255, 0.85);
      font-size: 12px;
      display: flex;
      align-items: flex-start;
      flex-direction: column;
      gap: 4px;

      .message-text {
        margin-left: 20px;
        white-space: pre-wrap;
        word-wrap: break-word;
        line-height: 1.4;
        font-family: 'Roboto Mono', monospace;
        background: rgba(0, 0, 0, 0.2);
        padding: 4px 8px;
        border-radius: 4px;
        max-width: 100%;
        overflow-wrap: break-word;
      }
    }
  }

  .log-status-info {
    margin-top: 4px;
    padding: 6px 8px;
    background: rgba(33, 150, 243, 0.05);
    border-radius: 6px;
    border-left: 3px solid rgba(33, 150, 243, 0.3);

    .status-details {
      color: rgba(255, 255, 255, 0.85);
      font-size: 12px;
      display: flex;
      align-items: center;
    }
  }

  .log-info-grid {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
}

.console-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.log-message-detail {
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
  line-height: 1.5;
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}

// Estilos para información técnica en modal de detalle
.detail-tech-item {
  padding: 8px 12px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  margin-bottom: 8px;

  .tech-value {
    font-family: 'Courier New', monospace;
    background: rgba(255, 255, 255, 0.1);
    padding: 2px 6px;
    border-radius: 4px;
    margin-left: 8px;
  }

  &.error-code-item {
    border-left: 3px solid #f44336;

    .error-code {
      color: #f44336;
      font-weight: 600;
    }
  }

  &.session-token-item {
    border-left: 3px solid #00bcd4;

    .session-token {
      color: #00bcd4;
      background: rgba(0, 188, 212, 0.1);
      border: 1px solid rgba(0, 188, 212, 0.3);
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 11px;
      word-break: break-all;
      line-height: 1.3;
    }
  }
}

// Estilos para el grid responsivo de cards
.responsive-logs-grid {
  display: grid;
  gap: 16px;
  padding: 16px;

  // Mobile: 1 columna
  grid-template-columns: 1fr;

  // Tablet: 2 columnas
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  // Desktop pequeño: 3 columnas
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }

  // Desktop grande: 4 columnas
  @media (min-width: 1440px) {
    grid-template-columns: repeat(4, 1fr);
  }

  // Desktop extra grande: 5 columnas
  @media (min-width: 1920px) {
    grid-template-columns: repeat(5, 1fr);
  }
}

// Estilos para las cards de logs
.log-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  transition: all 0.3s ease;
  overflow: hidden;
  backdrop-filter: blur(10px);
  min-height: 280px;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(25, 118, 210, 0.5);
    box-shadow: 0 8px 32px rgba(25, 118, 210, 0.15);
    background: linear-gradient(
      135deg,
      rgba(25, 118, 210, 0.08) 0%,
      rgba(255, 255, 255, 0.05) 100%
    );
  }

  // Colores específicos por tipo
  &.log-card-success {
    border-left: 4px solid #4caf50;
    &:hover {
      border-color: rgba(76, 175, 80, 0.5);
      box-shadow: 0 8px 32px rgba(76, 175, 80, 0.15);
    }
  }

  &.log-card-error {
    border-left: 4px solid #f44336;
    &:hover {
      border-color: rgba(244, 67, 54, 0.5);
      box-shadow: 0 8px 32px rgba(244, 67, 54, 0.15);
    }
  }

  &.log-card-warning {
    border-left: 4px solid #ff9800;
    &:hover {
      border-color: rgba(255, 152, 0, 0.5);
      box-shadow: 0 8px 32px rgba(255, 152, 0, 0.15);
    }
  }

  &.log-card-info {
    border-left: 4px solid #2196f3;
    &:hover {
      border-color: rgba(33, 150, 243, 0.5);
      box-shadow: 0 8px 32px rgba(33, 150, 243, 0.15);
    }
  }
}

.log-card-header {
  padding: 12px 16px 8px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
}

.log-card-content {
  flex: 1;
  padding: 16px;

  .log-user-section,
  .log-office-section,
  .log-device-section,
  .log-error-section,
  .log-session-section,
  .log-message-section {
    margin-bottom: 12px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .device-info,
  .error-content,
  .session-content,
  .message-content {
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.4;
  }

  .error-content {
    background: rgba(244, 67, 54, 0.1);
    border-left: 2px solid rgba(244, 67, 54, 0.3);
    padding: 6px 8px;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-weight: 500;
    color: #f44336;
  }

  .session-content {
    background: rgba(0, 188, 212, 0.1);
    border-left: 2px solid rgba(0, 188, 212, 0.3);
    padding: 6px 8px;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-weight: 400;
    color: #00bcd4;
    word-break: break-all;
    font-size: 11px;
  }

  .message-content {
    max-height: 60px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
  }
}

.log-card-footer {
  padding: 8px 16px 12px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(0, 0, 0, 0.1);
  margin-top: auto;
}

// Estilos para la paginación
.pagination-section {
  padding: 20px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);

  .pagination-info {
    color: rgba(255, 255, 255, 0.7);
    font-size: 14px;
    margin-bottom: 8px;

    @media (min-width: 768px) {
      margin-bottom: 0;
    }
  }

  .q-pagination {
    color: white;

    .q-btn {
      color: rgba(255, 255, 255, 0.8);

      &.q-btn--active {
        background: rgba(25, 118, 210, 0.8);
        color: white;
      }

      &:hover {
        background: rgba(25, 118, 210, 0.3);
      }
    }
  }
}

// Estilos para loaders elegantes
.filter-loader-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  border-radius: 8px;
}

.filter-loader-content {
  background: rgba(25, 118, 210, 0.1);
  border: 1px solid rgba(25, 118, 210, 0.3);
  border-radius: 12px;
  padding: 24px 32px;
  text-align: center;
  backdrop-filter: blur(10px);
  animation: pulse-glow 2s ease-in-out infinite;
}

.pagination-loader {
  background: rgba(25, 118, 210, 0.05);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
}

.loading-opacity {
  opacity: 0.6;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

@keyframes pulse-glow {
  0%,
  100% {
    box-shadow: 0 0 20px rgba(25, 118, 210, 0.3);
  }
  50% {
    box-shadow: 0 0 30px rgba(25, 118, 210, 0.5);
  }
}

// Optimizaciones responsive para filtros compactos
.console-controls {
  // Reducir padding en dispositivos medianos
  @media (min-width: 768px) and (max-width: 1024px) {
    .q-field--dense {
      .q-field__control {
        min-height: 40px;
      }

      .q-field__label {
        font-size: 13px;
      }
    }
  }
}

// Mejorar responsive para tablets
@media (min-width: 768px) and (max-width: 1024px) {
  .responsive-logs-grid {
    // En tablets, máximo 2 columnas para dar más espacio a cada card
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 14px;
    padding: 12px;
  }

  .console-controls {
    padding: 12px 16px;

    .row {
      margin: -6px;

      > div {
        padding: 6px;
      }
    }
  }

  .log-card {
    min-height: 260px;
  }
}

// Responsive adjustments
@media (max-width: 768px) {
  .responsive-logs-grid {
    padding: 8px;
    gap: 12px;
  }

  .log-card {
    min-height: 250px;
  }

  .log-card-content {
    padding: 12px;
  }

  .pagination-section {
    .row {
      flex-direction: column;
      gap: 12px;

      .col-12 {
        text-align: center;
      }
    }
  }
}

// Estilos para sección de debugging
.debug-section {
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.2);
}

.debug-fields {
  max-height: 400px;
  overflow-y: auto;

  .debug-field-item {
    display: flex;
    margin-bottom: 8px;
    padding: 6px 8px;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.03);

    &.highlight-error {
      background: rgba(244, 67, 54, 0.1);
      border-left: 3px solid #f44336;
    }

    &.highlight-token {
      background: rgba(0, 188, 212, 0.1);
      border-left: 3px solid #00bcd4;
    }

    .field-key {
      font-weight: 600;
      color: #90caf9;
      min-width: 120px;
      font-size: 12px;
    }

    .field-value {
      flex: 1;
      color: rgba(255, 255, 255, 0.8);
      font-family: 'Courier New', monospace;
      font-size: 11px;
      word-break: break-all;
      white-space: pre-wrap;
    }
  }
}
</style>

