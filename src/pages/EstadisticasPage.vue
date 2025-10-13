<template>
  <q-page class="q-pa-md" style="background-color: #121826">
    <!-- Indicador de carga general para mobile -->
    <q-inner-loading
      :showing="loadingCharts && modoSeleccionado === 'mobile'"
      label="Cargando estadsticas..."
      label-class="text-white"
      color="primary"
      size="50px"
    />

    <!-- Componente de filtros de fechas -->
    <LogFilters @filter="actualizarDatos" />

    <q-card class="stats-container q-pa-lg q-mt-md">
      <!-- KPIs Section -->
      <!-- <div class="q-pa-md kpi-section">
      <div class="row q-col-gutter-md q-mb-md">
        <q-card v-for="kpi in kpis" :key="kpi.label" flat bordered
          class="col-12 col-sm-6 col-md-3 text-center kpi-card">
          <q-card-section>
            <q-icon :name="kpi.icon" size="32px" :class="kpi.color" />
            <div class="text-subtitle2 q-mt-sm">{{ kpi.label }}</div>
            <div class="text-h6">{{ kpi.value }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div> -->
      <!-- Bar Chart Section -->
      <div class="q-pa-md">
        <q-card
          v-if="tiemposFuncionalidad && tiemposFuncionalidad.length > 0"
          flat
          bordered
          class="col-12 col-sm-4 col-md-2 q-pa-lg text-white q-mx-sm"
          style="background-color: #1e1e2f; border-radius: 12px"
        >
          <div class="text-subtitle1 text-center q-mb-sm">Tiempo total por Funcionalidad</div>
          <q-inner-loading
            :showing="loadingCharts && modoSeleccionado === 'mobile'"
            label="Cargando..."
            label-class="text-white"
            color="primary"
            size="30px"
          />
          <div class="chart-container">
            <canvas ref="barChart"></canvas>
          </div>
        </q-card>
        <div v-else class="col-12 col-sm-4 col-md-2 q-pa-lg text-white q-mx-sm">
          <NoDataMessage />
        </div>
      </div>

      <!--Barra de dispositivos mas usados-->
      <div class="q-pa-md">
        <q-card
          v-if="deviceChartData && deviceChartData.length > 0"
          flat
          bordered
          class="col-12 col-sm-4 col-md-2 q-pa-md text-white q-mx-sm"
          style="background-color: #1e1e2f; border-radius: 12px"
        >
          <div class="text-subtitle1 text-center">Dispositivos ms usados</div>
          <q-inner-loading
            :showing="loadingCharts && modoSeleccionado === 'mobile'"
            label="Cargando..."
            label-class="text-white"
            color="primary"
            size="30px"
          />
          <div class="chart-container">
            <canvas ref="deviceChart"></canvas>
          </div>
        </q-card>
        <div v-else class="col-12 col-sm-4 col-md-2 q-pa-lg text-white q-mx-sm">
          <NoDataMessage />
        </div>
      </div>

      <!-- Donut Chart Section -->
      <!-- Seccin inferior dividida en dos columnas -->
      <!-- Donut Chart: Uso por funcionalidad -->
      <q-card
        v-if="tiemposFuncionalidad && tiemposFuncionalidad.length > 0"
        flat
        bordered
        class="col-12 col-md-6 chart-card donut-chart-card"
        style="background-color: #1e1e2f; border-radius: 12px; color: white"
      >
        <q-card-section>
          <div class="text-subtitle1 text-center q-mb-sm">Uso por Funcionalidad</div>
          <q-inner-loading
            :showing="loadingCharts && modoSeleccionado === 'mobile'"
            label="Cargando..."
            label-class="text-white"
            color="primary"
            size="30px"
          />
          <div class="chart-container flex flex-center">
            <canvas ref="chart" class="donut-canvas" />
          </div>

          <!-- ✨ CUADROS DE RESUMEN ESTILO MAPA - Uso por Funcionalidad -->
          <div
            v-if="tiemposFuncionalidad && tiemposFuncionalidad.length > 0"
            class="legend-summary q-mt-sm"
          >
            <div class="row justify-center q-col-gutter-xs">
              <div
                v-for="(funcionalidad, index) in tiemposFuncionalidad.slice(0, 6)"
                :key="`func-${index}`"
                class="col-6 col-sm-4"
              >
                <div
                  class="summary-item"
                  :style="{
                    background: getFuncionalidadColor(index, 0.2),
                    borderLeft: `3px solid ${getFuncionalidadColor(index, 1)}`,
                    padding: '6px 8px',
                    borderRadius: '4px',
                  }"
                >
                  <div class="row items-center no-wrap">
                    <q-icon
                      name="analytics"
                      size="14px"
                      :color="getFuncionalidadIconColor(index)"
                      class="q-mr-xs"
                    />
                    <div class="text-caption text-weight-bold">
                      {{ Math.round(funcionalidad.totalSegundos) }}s
                    </div>
                  </div>
                  <div class="text-caption text-grey-4">{{ funcionalidad.funcionalidad }}</div>
                </div>
              </div>
            </div>

            <!-- Total general -->
            <div class="q-mt-sm">
              <div
                class="summary-total"
                style="
                  background: rgba(255, 255, 255, 0.1);
                  padding: 6px 8px;
                  border-radius: 4px;
                  text-align: center;
                "
              >
                <div class="text-caption text-weight-bold text-white">
                  Total Funcionalidades: {{ tiemposFuncionalidad.length }}
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
      <div v-else class="col-12 col-sm-4 col-md-2 q-pa-lg text-white q-mx-sm">
        <NoDataMessage />
      </div>
      <br />

      <!-- Grfico de Funcionalidades por Tipo de Evento con Resumen -->
      <div class="row q-col-gutter-md q-my-md justify-center" v-if="pieRefs">
        <q-card
          v-for="func in funcionalidades"
          :key="func.clave"
          flat
          bordered
          class="col-12 col-sm-6 col-md-3 chart-card"
          style="background-color: #1e1e2f; color: white; max-width: 300px"
        >
          <q-card-section>
            <div class="text-subtitle1 text-center q-mb-sm">{{ func.clave }}</div>
            <q-inner-loading
              :showing="loadingCharts && modoSeleccionado === 'mobile'"
              label="Cargando..."
              label-class="text-white"
              color="primary"
              size="30px"
            />

            <!-- Contenedor del grfico -->
            <div
              class="pie-chart-container flex flex-center"
              style="height: 200px; margin-bottom: 16px"
            >
              <canvas :ref="(el) => setPieRef(func.clave, el)" class="pie-canvas"></canvas>
            </div>

            <!--  CUADROS DE RESUMEN ESTILO MAPA -->
            <div class="legend-summary q-mt-sm">
              <div class="row q-col-gutter-xs">
                <!-- Fallidos -->
                <div v-if="func.total_fallido > 0" class="col-6">
                  <div
                    class="summary-item"
                    style="
                      background: rgba(244, 67, 54, 0.2);
                      border-left: 3px solid #f44336;
                      padding: 6px 8px;
                      border-radius: 4px;
                    "
                  >
                    <div class="row items-center no-wrap">
                      <q-icon name="cancel" size="14px" color="red-4" class="q-mr-xs" />
                      <div class="text-caption text-weight-bold">{{ func.total_fallido }}</div>
                    </div>
                    <div class="text-caption text-grey-4">Fallidos</div>
                  </div>
                </div>

                <!-- Exitosos -->
                <div v-if="func.total_exito > 0" class="col-6">
                  <div
                    class="summary-item"
                    style="
                      background: rgba(76, 175, 80, 0.2);
                      border-left: 3px solid #4caf50;
                      padding: 6px 8px;
                      border-radius: 4px;
                    "
                  >
                    <div class="row items-center no-wrap">
                      <q-icon name="check_circle" size="14px" color="green-4" class="q-mr-xs" />
                      <div class="text-caption text-weight-bold">{{ func.total_exito }}</div>
                    </div>
                    <div class="text-caption text-grey-4">Exitosos</div>
                  </div>
                </div>

                <!-- Cancelados -->
                <div v-if="func.total_cancelado > 0" class="col-6">
                  <div
                    class="summary-item"
                    style="
                      background: rgba(255, 152, 0, 0.2);
                      border-left: 3px solid #ff9800;
                      padding: 6px 8px;
                      border-radius: 4px;
                    "
                  >
                    <div class="row items-center no-wrap">
                      <q-icon name="remove_circle" size="14px" color="orange-4" class="q-mr-xs" />
                      <div class="text-caption text-weight-bold">{{ func.total_cancelado }}</div>
                    </div>
                    <div class="text-caption text-grey-4">Cancelados</div>
                  </div>
                </div>

                <!-- Errores -->
                <div v-if="func.total_error > 0" class="col-6">
                  <div
                    class="summary-item"
                    style="
                      background: rgba(33, 150, 243, 0.2);
                      border-left: 3px solid #2196f3;
                      padding: 6px 8px;
                      border-radius: 4px;
                    "
                  >
                    <div class="row items-center no-wrap">
                      <q-icon name="error" size="14px" color="blue-4" class="q-mr-xs" />
                      <div class="text-caption text-weight-bold">{{ func.total_error }}</div>
                    </div>
                    <div class="text-caption text-grey-4">Errores</div>
                  </div>
                </div>
              </div>

              <!-- Total general -->
              <div class="q-mt-sm">
                <div
                  class="summary-total"
                  style="
                    background: rgba(255, 255, 255, 0.1);
                    padding: 6px 8px;
                    border-radius: 4px;
                    text-align: center;
                  "
                >
                  <div class="text-caption text-weight-bold text-white">
                    Total:
                    {{
                      func.total_fallido +
                      func.total_exito +
                      func.total_cancelado +
                      func.total_error
                    }}
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div v-else class="col-12 col-sm-4 col-md-2 q-pa-lg text-white q-mx-sm">
        <NoDataMessage />
      </div>

      <br />
      <!-- Mapa con Geolocalizacin -->
      <q-card
        flat
        bordered
        class="q-pa-md text-white mapa-card"
        style="background-color: #1e1e2f; transition: all 0.3s ease"
      >
        <q-card-section>
          <div class="text-h6 text-center q-mb-sm">
            <q-icon name="map" size="sm" class="q-mr-sm text-primary" />
            Mapa Interactivo de Eventos Biomtricos
            <q-icon name="location_on" size="sm" class="q-ml-sm text-secondary" />
          </div>
          <div class="text-caption text-center q-mb-md text-grey-6">
            Haz clic en los marcadores individuales para anlisis detallado
            <br />
            Haz clic en los clusters (crculos con nmeros) para resumen grupal
            <br />
            Haz clic en cualquier rea del mapa para explorar la zona
          </div>

          <!-- Indicadores de estado del mapa -->
          <div class="row justify-center q-mb-sm">
            <q-chip
              v-if="eventos.length > 0"
              color="primary"
              text-color="white"
              icon="event"
              size="sm"
              class="animated-chip"
            >
              {{ eventos.length }} eventos cargados
            </q-chip>
            <q-chip
              color="secondary"
              text-color="white"
              icon="place"
              size="sm"
              class="q-ml-sm animated-chip"
            >
              Modo interactivo activo
            </q-chip>
          </div>

          <q-inner-loading
            :showing="loadingCharts && modoSeleccionado === 'mobile'"
            label="Cargando mapa..."
            label-class="text-white"
            color="primary"
            size="30px"
          />
          <div
            id="mapaEventos"
            style="
              height: 400px;
              border-radius: 8px;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
              transition: box-shadow 0.3s ease;
            "
            class="mapa-container"
          ></div>
        </q-card-section>
      </q-card>

      <!-- Resumen del rea Seleccionada -->
      <q-card
        v-if="mostrarResumen"
        flat
        bordered
        class="q-pa-md text-white q-mt-md resumen-card"
        style="
          background: linear-gradient(135deg, #1e1e2f 0%, #2a2a3e 100%);
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        "
      >
        <q-card-section>
          <!-- Header con animacin -->
          <div class="row items-center q-mb-md">
            <q-icon
              :name="
                resumenArea?.eventoFocal
                  ? 'location_on'
                  : resumenArea?.clusterInfo
                  ? 'grain'
                  : 'map'
              "
              size="md"
              class="q-mr-sm text-primary animated-icon"
            />
            <div class="text-h6 flex-grow">
              {{
                resumenArea?.eventoFocal
                  ? ' Anlisis del Evento Seleccionado'
                  : resumenArea?.clusterInfo
                  ? ' Resumen del Cluster'
                  : ' Resumen del rea Seleccionada'
              }}
            </div>
            <q-space />
            <q-btn
              flat
              round
              icon="close"
              size="sm"
              @click="cerrarResumen"
              class="text-white hover-effect"
              style="transition: all 0.2s ease"
            />
          </div>

          <!-- Loading con mejor animacin -->
          <div v-if="cargandoResumen" class="text-center q-py-xl">
            <q-spinner-grid size="60px" color="primary" class="q-mb-md" />
            <div class="text-h6 q-mb-sm text-primary">Analizando datos...</div>
            <div class="text-caption text-grey-6">Procesando informacin geogrfica</div>
          </div>

          <div v-else-if="resumenArea" class="animated-content">
            <!-- Informacin del evento focal con mejor diseo -->
            <div v-if="resumenArea.eventoFocal" class="q-mb-lg">
              <q-card
                dark
                class="evento-focal-card q-pa-lg q-mb-md"
                style="
                  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                  border-radius: 16px;
                  box-shadow: 0 8px 32px rgba(99, 102, 241, 0.3);
                "
              >
                <div class="text-h5 text-center q-mb-md">
                  <q-icon name="target" size="lg" class="q-mr-sm" />
                  Evento Seleccionado
                </div>
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-6">
                    <q-item dark class="info-item">
                      <q-item-section avatar>
                        <q-icon name="person" color="white" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-weight-medium">Usuario</q-item-label>
                        <q-item-label caption class="text-white">{{
                          resumenArea.eventoFocal.usuario
                        }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </div>
                  <div class="col-12 col-md-6">
                    <q-item dark class="info-item">
                      <q-item-section avatar>
                        <q-icon name="smartphone" color="white" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-weight-medium">Dispositivo</q-item-label>
                        <q-item-label caption class="text-white">{{
                          resumenArea.eventoFocal.dispositivo
                        }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </div>
                  <div class="col-12 col-md-6">
                    <q-item dark class="info-item">
                      <q-item-section avatar>
                        <q-icon name="category" color="white" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-weight-medium">Tipo</q-item-label>
                        <q-item-label caption class="text-white">{{
                          resumenArea.eventoFocal.tipoEvento
                        }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </div>
                  <div class="col-12 col-md-6">
                    <q-item dark class="info-item">
                      <q-item-section avatar>
                        <q-icon
                          :name="
                            resumenArea.eventoFocal.resultado.includes('exitoso')
                              ? 'check_circle'
                              : 'error'
                          "
                          :color="
                            resumenArea.eventoFocal.resultado.includes('exitoso')
                              ? 'positive'
                              : 'negative'
                          "
                        />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-weight-medium">Resultado</q-item-label>
                        <q-item-label caption class="text-white">{{
                          resumenArea.eventoFocal.resultado
                        }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </div>
                  <div class="col-12 col-md-6">
                    <q-item dark class="info-item">
                      <q-item-section avatar>
                        <q-icon name="schedule" color="white" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-weight-medium">Fecha y Hora</q-item-label>
                        <q-item-label caption class="text-white">{{
                          resumenArea.eventoFocal.fecha
                        }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </div>
                  <div class="col-12 col-md-6">
                    <q-item dark class="info-item">
                      <q-item-section avatar>
                        <q-icon name="percent" color="white" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-weight-medium">Porcentaje</q-item-label>
                        <q-item-label caption class="text-white"
                          >{{ resumenArea.eventoFocal.porcentaje }}%</q-item-label
                        >
                      </q-item-section>
                    </q-item>
                  </div>
                </div>
              </q-card>
            </div>

            <!--  Informacin del cluster con diseo mejorado -->
            <div v-else-if="resumenArea.clusterInfo" class="q-mb-lg">
              <q-card
                dark
                class="cluster-info-card q-pa-lg q-mb-md"
                style="
                  background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
                  border-radius: 16px;
                  box-shadow: 0 8px 32px rgba(6, 182, 212, 0.3);
                "
              >
                <div class="text-h5 text-center q-mb-md">
                  <q-icon name="hub" size="lg" class="q-mr-sm" />
                  Anlisis del Cluster
                </div>
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-6">
                    <q-item dark class="info-item">
                      <q-item-section avatar>
                        <q-icon name="trending_up" color="white" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-weight-medium">Evento Principal</q-item-label>
                        <q-item-label caption class="text-white">{{
                          resumenArea.clusterInfo.tipoEventoPrincipal
                        }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </div>
                  <div class="col-12 col-md-6">
                    <q-item dark class="info-item">
                      <q-item-section avatar>
                        <q-icon name="assessment" color="white" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-weight-medium">Estado Principal</q-item-label>
                        <q-item-label caption class="text-white">{{
                          resumenArea.clusterInfo.estadoPrincipal
                        }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </div>
                  <div class="col-12 col-md-6">
                    <q-item dark class="info-item">
                      <q-item-section avatar>
                        <q-icon name="people" color="white" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-weight-medium">Usuarios nicos</q-item-label>
                        <q-item-label caption class="text-white">{{
                          resumenArea.clusterInfo.usuariosUnicos
                        }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </div>
                  <div class="col-12 col-md-6">
                    <q-item dark class="info-item">
                      <q-item-section avatar>
                        <q-icon name="devices" color="white" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-weight-medium">Dispositivos nicos</q-item-label>
                        <q-item-label caption class="text-white">{{
                          resumenArea.clusterInfo.dispositivosUnicos
                        }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </div>
                  <div class="col-12 col-md-6">
                    <q-item dark class="info-item">
                      <q-item-section avatar>
                        <q-icon name="calendar_today" color="white" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-weight-medium">Das con Actividad</q-item-label>
                        <q-item-label caption class="text-white">{{
                          resumenArea.clusterInfo.fechasConActividad
                        }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </div>
                  <div class="col-12 col-md-6">
                    <q-item dark class="info-item">

                      <q-item-section avatar>
                        <q-icon name="place" color="white" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-weight-medium">Ubicacin</q-item-label>
                        <q-item-label caption class="text-white">{{
                          resumenArea.clusterInfo.ubicacion
                        }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </div>
                </div>
              </q-card>
            </div>

            <!-- Seccin de mtricas principales con mejor diseo -->
            <div class="row q-col-gutter-lg q-mb-lg">
              <!-- KPI Principal -->
              <div class="col-12 col-md-4">
                <q-card
                  dark
                  class="kpi-card q-pa-lg text-center"
                  style="
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    border-radius: 16px;
                    height: 280px;
                  "
                >
                  <q-icon name="analytics" size="80px" color="white" class="kpi-icon q-mb-md" />
                  <div class="text-h3 text-weight-bold q-mb-sm">{{ resumenArea.totalEventos }}</div>
                  <div class="text-h6 q-mb-md">
                    {{
                      resumenArea.eventoFocal
                        ? 'Eventos en el rea'
                        : resumenArea.clusterInfo
                        ? 'Eventos en el Cluster'
                        : 'Total de Eventos'
                    }}
                  </div>
                </q-card>

              </div>

              <!-- Grfico de Estados -->
              <div class="col-12 col-md-4">
                <q-card
                  dark
                  class="grafico-card q-pa-md"
                  style="
                    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                    border-radius: 16px;
                    min-height: 280px;
                    height: auto;
                    box-shadow: 0 8px 32px rgba(245, 158, 11, 0.3);
                    display: flex;
                    flex-direction: column;
                  "
                >
                  <div class="text-h6 q-mb-sm text-center text-weight-bold">
                    <q-icon name="donut_small" class="q-mr-sm" />
                    Estados de Eventos
                  </div>

                  <!-- Contenedor del grficUsuario: o con mejor control -->
                  <div
                    class="chart-container flex-grow-1"
                    style="
                      display: flex;
                      justify-content: center;
                      align-items: center;
                      min-height: 120px;
                      max-height: 140px;
                      position: relative;
                    "
                  >
                    <canvas
                      id="graficoResumenArea"
                      style="
                        max-height: 120px;
                        max-width: 120px;
                        width: auto !important;
                        height: auto !important;
                      "
                    ></canvas>
                  </div>

                  <!-- Leyenda dinmica sincronizada -->
                  <div class="q-mt-sm" style="margin-top: auto">
                    <div
                      v-if="resumenArea.eventosPorEstado && resumenArea.eventosPorEstado.length > 0"
                    >
                      <div
                        v-for="estado in resumenArea.eventosPorEstado"
                        :key="estado.estado"
                        class="row items-center justify-between q-mb-xs q-px-sm"
                        style="
                          background: rgba(255, 255, 255, 0.1);
                          border-radius: 6px;
                          padding: 4px 8px;
                        "
                      >
                        <div class="row items-center no-wrap">
                          <div
                            :style="`
                              width: 10px;
                              height: 10px;
                              background: ${obtenerColorEstado(estado.estado)};
                              border-radius: 50%;
                              margin-right: 6px;
                              flex-shrink: 0;
                            `"
                          ></div>
                          <span
                            class="text-caption text-weight-medium ellipsis"
                            style="max-width: 100px"
                          >
                            {{ estado.estado }}
                          </span>
                        </div>
                        <q-badge
                          :color="obtenerColorEstado(estado.estado)"
                          :label="estado.cantidad"
                          class="text-weight-bold"
                          style="font-size: 0.65rem; min-width: 20px"
                        />
                      </div>
                    </div>
                    <!-- Fallback para cuando no hay datos -->
                    <div v-else class="text-center text-caption text-grey-4">
                      Sin datos de estados disponibles
                    </div>
                  </div>
                </q-card>
              </div>

              <!-- Informacin adicional -->
              <div class="col-12 col-md-4">
                <q-card
                  dark
                  class="info-card q-pa-md"
                  style="
                    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
                    border-radius: 16px;
                    min-height: 280px;
                    height: auto;
                    box-shadow: 0 8px 32px rgba(139, 92, 246, 0.3);
                    position: relative;
                    z-index: 1;
                    display: flex;
                    flex-direction: column;
                  "
                >
                  <div class="text-h6 q-mb-sm text-center text-weight-bold">
                    <q-icon name="list" class="q-mr-sm" />
                    {{
                      resumenArea.eventoFocal
                        ? 'Dispositivos en el rea'
                        : resumenArea.clusterInfo
                        ? 'Dispositivos en el Cluster'
                        : 'Tipos de Eventos'
                    }}
                  </div>

                  <!-- Contenedor scrolleable con mejor diseo -->
                  <div
                    class="custom-scroll flex-grow-1"
                    style="max-height: 220px; overflow-y: auto; padding-right: 4px"
                  >
                    <q-list dense dark style="padding: 0">
                      <!-- Si es un anlisis de evento especfico, mostrar dispositivos -->
                      <template v-if="resumenArea.eventoFocal && resumenArea.dispositivosEnArea">
                        <q-item
                          v-for="dispositivo in resumenArea.dispositivosEnArea"
                          :key="dispositivo.dispositivo"
                          class="q-py-sm device-item"
                          style="
                            background: rgba(255, 255, 255, 0.1);
                            margin-bottom: 6px;
                            border-radius: 8px;
                            min-height: 40px;
                          "
                        >
                          <q-item-section avatar style="min-width: 32px">
                            <q-icon name="smartphone" size="sm" color="white" />
                          </q-item-section>
                          <q-item-section>
                            <div class="text-body2 text-weight-medium text-white ellipsis">
                              {{ dispositivo.dispositivo }}
                            </div>
                          </q-item-section>
                          <q-item-section side style="padding-left: 8px">
                            <q-badge
                              color="orange"
                              :label="dispositivo.cantidad"
                              class="text-weight-bold"
                              style="font-size: 0.7rem; min-width: 24px"
                            />
                          </q-item-section>
                        </q-item>
                      </template>

                      <!-- Si es un anlisis de rea general, mostrar tipos -->
                      <template v-else>
                        <q-item
                          v-for="tipo in resumenArea.eventosPorTipo"
                          :key="tipo.tipo"
                          class="q-py-sm type-item"
                          style="
                            background: rgba(255, 255, 255, 0.1);
                            margin-bottom: 6px;
                            border-radius: 8px;
                            min-height: 40px;
                          "
                        >
                          <q-item-section avatar style="min-width: 32px">
                            <q-icon name="category" size="sm" color="white" />
                          </q-item-section>
                          <q-item-section>
                            <div class="text-body2 text-weight-medium text-white ellipsis">
                              {{ tipo.tipo }}
                            </div>
                          </q-item-section>
                          <q-item-section side style="padding-left: 8px">
                            <q-badge
                              color="primary"
                              :label="tipo.cantidad"
                              class="text-weight-bold"
                              style="font-size: 0.7rem; min-width: 24px"
                            />
                          </q-item-section>
                        </q-item>
                      </template>
                    </q-list>
                  </div>
                </q-card>
              </div>
            </div>

            <!-- Grfico adicional para clusters -->
            <div
              v-if="resumenArea.fechasPorDia && resumenArea.fechasPorDia.length > 0"
              class="q-mb-lg"
            >
              <q-card
                dark
                class="timeline-card q-pa-lg"
                style="
                  background: linear-gradient(135deg, #ec4899 0%, #be185d 100%);
                  border-radius: 16px;
                "
              >
                <div class="text-h6 text-center q-mb-md">
                  <q-icon name="timeline" class="q-mr-sm" />
                  Actividad por Fecha
                </div>
                <div class="timeline-container">
                  <div
                    class="timeline-container"
                    style="position: relative; height: 200px; max-height: 200px"
                  >
                    <canvas id="timelineChart"></canvas>
                  </div>
                </div>
              </q-card>
            </div>

            <!-- Eventos recientes con mejor diseo -->
            <div class="q-mt-lg" v-if="resumenArea.eventos && resumenArea.eventos.length > 0">
              <q-card
                dark
                class="eventos-recientes-card"
                style="
                  background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
                  border-radius: 16px;
                "
              >
                <q-card-section>
                  <div class="text-h6 q-mb-md text-center">
                    <q-icon name="history" class="q-mr-sm text-primary" />
                    Eventos Recientes en la Zona
                  </div>
                  <q-list dense dark separator>
                    <q-item
                      v-for="(evento, index) in resumenArea.eventos.slice(0, 5)"
                      :key="index"
                      class="q-py-md evento-item"
                      style="border-radius: 8px; margin-bottom: 4px"
                    >
                      <q-item-section avatar>
                        <q-avatar
                          :color="
                            evento.resultadoDescripcion === 'FALLIDO' ? 'negative' : 'positive'
                          "
                          :icon="
                            evento.resultadoDescripcion === 'FALLIDO' ? 'error' : 'check_circle'
                          "
                          size="40px"
                        />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-weight-medium">
                          {{ evento.usuario?.usuario || evento.usuario || 'Usuario desconocido' }}
                        </q-item-label>
                        <q-item-label caption class="text-grey-6">
                          {{ evento.tipoEvento?.detalle || evento.tipoEvento || 'Sin especificar' }}
                        </q-item-label>
                        <q-item-label caption class="text-grey-5 q-mt-xs">
                          {{ evento.dispositivo || 'Dispositivo no especificado' }}
                        </q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <div class="text-right">
                          <q-item-label caption class="text-grey-4">
                            {{ formatFecha(evento) }}
                          </q-item-label>
                          <q-badge
                            :color="
                              evento.resultadoDescripcion === 'FALLIDO' ? 'negative' : 'positive'
                            "
                            :label="
                              evento.resultadoDescripcion === 'FALLIDO' ? 'Fallido' : 'Exitoso'
                            "
                            class="q-mt-xs"
                          />
                        </div>
                      </q-item-section>
                    </q-item>
                  </q-list>

                  <div v-if="resumenArea.eventos.length > 5" class="text-center q-mt-md">
                    <q-btn
                      flat
                      color="primary"
                      label="Ver ms eventos"
                      icon="expand_more"
                      @click="mostrarMasEventos = !mostrarMasEventos"
                    />
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Seccin de informacin adicional -->
            <div class="row q-gutter-md q-mt-lg">
              <!-- Informacin de coordenadas y radio -->

              <!-- Estadsticas de usuario adicionales -->
              <div class="col-12 col-lg-6">
                <q-card
                  dark
                  class="info-users-card q-pa-md full-height"
                  style="
                    background: linear-gradient(135deg, #7c2d12 0%, #dc2626 100%);
                    border-radius: 16px;
                    box-shadow: 0 8px 32px rgba(124, 45, 18, 0.3);
                  "
                >
                  <q-card-section class="q-pa-none">
                    <div class="text-h6 q-mb-md text-center text-weight-bold">
                      <q-icon name="analytics" class="q-mr-sm" />
                      Anlisis de Actividad
                    </div>

                    <!-- Layout responsivo para estadsticas -->
                    <div class="column q-gutter-md" v-if="resumenArea.totalEventos > 0">
                      <!-- Usuarios únicos -->
                      <div class="activity-stat-item">
                        <div class="row items-center justify-between">
                          <div class="row items-center">
                            <q-avatar
                              size="32px"
                              color="orange-8"
                              text-color="white"
                              icon="people"
                              class="q-mr-sm"
                            />
                            <div>
                              <div class="text-body2 text-weight-medium">Usuarios únicos</div>
                              <div class="text-caption text-grey-3">En el área seleccionada</div>
                            </div>
                          </div>
                          <div class="text-h5 text-weight-bold text-orange-3">
                            {{ resumenArea.usuariosUnicos || 0 }}
                          </div>
                        </div>
                      </div>

                      <!-- Total de eventos -->
                      <div class="activity-stat-item">
                        <div class="row items-center justify-between">
                          <div class="row items-center">
                            <q-avatar
                              size="32px"
                              color="blue-8"
                              text-color="white"
                              icon="event"
                              class="q-mr-sm"
                            />
                            <div>
                              <div class="text-body2 text-weight-medium">Total de Eventos</div>
                              <div class="text-caption text-grey-3">Registrados en el período</div>
                            </div>
                          </div>
                          <div class="text-h5 text-weight-bold text-blue-3">
                            {{ resumenArea.totalEventos || 0 }}
                          </div>
                        </div>
                      </div>

                      <!-- Promedio por usuario -->
                      <div class="activity-stat-item">
                        <div class="row items-center justify-between">
                          <div class="row items-center">
                            <q-avatar
                              size="32px"
                              color="green-8"
                              text-color="white"
                              icon="trending_up"
                              class="q-mr-sm"
                            />
                            <div>
                              <div class="text-body2 text-weight-medium">Promedio por Usuario</div>
                              <div class="text-caption text-grey-3">Eventos por persona</div>
                            </div>
                          </div>
                          <div class="text-h5 text-weight-bold text-green-3">
                            {{ resumenArea.promedioEventosPorUsuario || '0.0' }}
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Estado cuando no hay actividad -->
                    <div v-else-if="resumenArea.mensaje" class="text-center q-py-md">
                      <q-icon name="inbox" size="48px" color="grey-5" class="q-mb-sm" />
                      <div class="text-body2 text-grey-4 q-mb-xs">Sin actividad en esta área</div>
                      <div class="text-caption text-grey-5">
                        {{ resumenArea.mensaje }}
                      </div>
                    </div>

                    <!-- Estado cuando no se ha seleccionado rea -->
                    <div v-else class="text-center q-py-md">
                      <q-icon name="analytics" size="48px" color="grey-5" class="q-mb-sm" />
                      <div class="text-body2 text-grey-4">
                        Selecciona un área en el mapa para ver estadsticas de actividad
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </div>

          <!-- Error state mejorado -->
          <div v-if="resumenArea?.error" class="text-center q-py-xl">
            <q-icon name="error_outline" size="80px" color="negative" class="q-mb-md" />
            <div class="text-h6 text-negative q-mb-sm">Error al cargar datos</div>
            <div class="text-body2 text-grey-6">{{ resumenArea.error }}</div>
            <q-btn
              flat
              color="primary"
              label="Reintentar"
              icon="refresh"
              @click="reintentarCarga"
              class="q-mt-md"
            />
          </div>
        </q-card-section>
      </q-card>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, watch, computed, inject } from 'vue'
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
  ArcElement,
  DoughnutController,
  PieController,
} from 'chart.js'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getDuracionPromedioFuncionalidad } from 'src/services/api'
import { getDispositivosMasUsados } from 'src/services/api'
import { getEventosBiometricosPorFiltro, getResumenLogsPorArea } from 'src/services/api'
import { getFuncionalidadesEstado } from 'src/services/api'
import LogFilters from '../components/LogFilters.vue'
import { useFiltroFechasStore } from '../stores/filtroFechasStore.js'
import 'leaflet.markercluster/dist/leaflet.markercluster.js'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import NoDataMessage from 'src/components/NoDataMessage.vue'

Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  DoughnutController,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
  ArcElement,
  PieController
)

const tiemposFuncionalidad = ref([])

const filtroFechasStore = useFiltroFechasStore()

// Estados de carga
const loadingCharts = ref(false)

// Inyectar el estado del flujo desde el layout padre
const selectedFlow = inject('selectedFlow', ref('mobile'))

// Usar computed para determinar el modo seleccionado basado en el flujo inyectado
const modoSeleccionado = computed(() =>
  selectedFlow.value === 'escritorio' ? 'escritorio' : 'mobile'
)

// Funcin para actualizar todos los datos cuando cambien los filtros
const actualizarDatos = async () => {
  if (loadingCharts.value) return

  loadingCharts.value = true

  try {
    console.log(
      ' Actualizando datos con nuevas fechas:',
      filtroFechasStore.obtenerFechasFormateadas()
    )

    destroyExistingCharts()
    console.log(' Todos los grficos destruidos antes de actualizar')

    try {
      const filtros = filtroFechasStore.obtenerFechasFormateadas()
      const eventosData = await getEventosBiometricosPorFiltro(filtros)
      eventos.value = eventosData
      console.log(' Eventos actualizados para timeline:', eventosData?.length || 0)
    } catch (error) {
      console.error('Error al cargar eventos:', error)
    }

    try {
      const respuesta = await getDuracionPromedioFuncionalidad(
        filtroFechasStore.obtenerFechasFormateadas()
      )
      tiemposFuncionalidad.value = respuesta.map((item) => ({
        funcionalidad: item.funcionalidad.replace(/_/g, ' '),
        totalSegundos: tiempoASegundos(item.duracion),
      }))
      console.log(' Datos de funcionalidad actualizados:', tiemposFuncionalidad.value.length)
    } catch (error) {
      console.error('Error al obtener datos de funcionalidad:', error)
    }

    try {
      await renderDeviceChart()
      console.log(' Grfico de dispositivos renderizado')

      await new Promise((resolve) => setTimeout(resolve, 100))

      renderCharts()
      console.log(' Grficos principales renderizados')

      await new Promise((resolve) => setTimeout(resolve, 200))
    } catch (error) {
      console.error(' Error renderizando grficos principales:', error)
    }

    //  PASO 5: Renderizar grficos de pie despus de asegurar el DOM
    await nextTick()
    try {
      renderPiePorFuncionalidad()
      console.log(' Grficos de pie renderizados')
    } catch (error) {
      console.error(' Error renderizando grficos de pie:', error)
    }

    //  PASO 6: Crear timeline al final con delay adicional
    await new Promise((resolve) => setTimeout(resolve, 300))
    try {
      crearGraficoTimeline()
      console.log(' Timeline renderizado')
    } catch (error) {
      console.error(' Error renderizando timeline:', error)
    }

    console.log(' Todos los grficos actualizados correctamente')
  } finally {
    loadingCharts.value = false
  }
}

const fallosPorEstado = ref([])

// Variables para el resumen del mapa
//  VARIABLES DE ESTADO PARA EL MAPA Y ANLISIS
const resumenArea = ref({
  totalEventos: 0,
  eventosPorEstado: [],
  eventosPorTipo: [],
  dispositivosEnArea: [],
  usuariosUnicos: 0,
  fechasPorDia: [],
  clusterInfo: null,
  eventoFocal: null,
  eventos: [],
  ubicacion: null,
  radioAnalizado: null,
  mensaje: null,
  error: null,
})
const mostrarResumen = ref(false)
const cargandoResumen = ref(false)
const eventoSeleccionado = ref(null)
const eventosEnArea = ref([])
const mostrarMasEventos = ref(false)
const eventos = ref([]) // Variable global para almacenar todos los eventos

const barChart = ref(null)
const chart = ref(null)
const deviceChart = ref(null)
const deviceChartData = ref([])

const funcionalidades = ref([])
const pieRefs = ref({})

function setPieRef(clave, el) {
  if (el) pieRefs.value[clave] = el
}

// ✨ FUNCIONES PARA COLORES DE FUNCIONALIDADES
function getFuncionalidadColor(index, opacity = 1) {
  const colors = ['#26A69A', '#7E57C2', '#1976D2', '#66BB6A', '#FFA726', '#FF7043']
  const baseColor = colors[index % colors.length]

  if (opacity < 1) {
    // Convertir hex a rgba
    const r = parseInt(baseColor.slice(1, 3), 16)
    const g = parseInt(baseColor.slice(3, 5), 16)
    const b = parseInt(baseColor.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${opacity})`
  }
  return baseColor
}

function getFuncionalidadIconColor(index) {
  const iconColors = ['teal-4', 'deep-purple-4', 'blue-4', 'green-4', 'orange-4', 'deep-orange-4']
  return iconColors[index % iconColors.length]
}

// Funcin para hacer scroll hacia el resumen
const scrollToResumen = () => {
  const resumenElement = document.querySelector('.resumen-card')
  if (resumenElement) {
    resumenElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }
}

// Funcin para cerrar el resumen con animacin
const cerrarResumen = () => {
  // Limpiar grficos existentes de manera segura
  if (window.graficoResumenArea && typeof window.graficoResumenArea.destroy === 'function') {
    try {
      window.graficoResumenArea.destroy()
      console.log(' Grfico de resumen destruido correctamente')
    } catch (error) {
      console.warn(' Error al destruir grfico de resumen:', error)
    }
    window.graficoResumenArea = null
  }

  if (window.timelineChart && typeof window.timelineChart.destroy === 'function') {
    try {
      window.timelineChart.destroy()
      console.log(' Grfico timeline destruido correctamente')
    } catch (error) {
      console.warn(' Error al destruir grfico timeline:', error)
    }
    window.timelineChart = null
  }

  mostrarResumen.value = false
  mostrarMasEventos.value = false
  resumenArea.value = null
}

// Funcin para formatear fechas
const formatFecha = (evento) => {
  return evento.fechaHoraDia
    ? new Date(evento.fechaHoraDia).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : evento.fecha
    ? new Date(evento.fecha).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : 'Sin fecha'
}

// Funcin para reintentar carga
const reintentarCarga = () => {
  if (eventoSeleccionado.value) {
    mostrarResumenEvento(eventoSeleccionado.value, eventos.value)
  } else {
    cerrarResumen()
  }
}

// Funcin para obtener color segn el estado (sincronizada con el grfico)
const obtenerColorEstado = (estado) => {
  const estadoLower = estado.toLowerCase()
  if (
    estadoLower.includes('exitoso') ||
    estadoLower.includes('correcto') ||
    estadoLower.includes('success')
  ) {
    return '#10b981' // Verde para exitoso
  } else if (
    estadoLower.includes('fallido') ||
    estadoLower.includes('error') ||
    estadoLower.includes('fallo')
  ) {
    return '#ef4444' // Rojo para error
  } else if (estadoLower.includes('pendiente') || estadoLower.includes('proceso')) {
    return '#f59e0b' // Amarillo para pendiente
  } else if (estadoLower.includes('cancelado') || estadoLower.includes('rechazado')) {
    return '#6b7280' // Gris para cancelado
  } else {
    return '#3b82f6' // Azul por defecto
  }
}

// Funcin para convertir "HH:MM:SS" en segundos
function tiempoASegundos(tiempoStr) {
  const [hh, mm, ss] = tiempoStr.split(':').map(Number)
  return hh * 3600 + mm * 60 + ss
}

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
})

// Funcin para convertir coordenadas GPS en nombre de estado
// (usa tu reverse-geocoding favorito; aqu un ejemplo con Nominatim)
async function gpsToEstado(gps) {
  const [lat, lon] = gps.split(',').map(Number)
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
  )
  const data = await res.json()
  return data.address?.state || 'Desconocido'
}

// Agrupa solo los eventos FALLIDO por estado
async function agruparFallosPorEstado(eventos) {
  const cache = new Map()
  const conteo = {}

  for (const e of eventos) {
    if (e.resultadoEvento?.clave !== 'FALLIDO') continue
    const gps = e.gps
    if (!gps) continue

    let estado = cache.get(gps)
    if (!estado) {
      estado = await gpsToEstado(gps)
      cache.set(gps, estado)
    }

    const tipo = e.tipoEvento?.clave || 'Desconocido'

    if (!conteo[estado]) {
      conteo[estado] = {}
    }

    conteo[estado][tipo] = (conteo[estado][tipo] || 0) + 1
  }

  // De objeto a array para iterar en el template
  return Object.entries(conteo).map(([estado, tipos]) => ({
    estado,
    tipos,
  }))
}

// Funcin para obtener resumen de un rea especfica del mapa
const obtenerResumenArea = async (lat, lng) => {
  try {
    cargandoResumen.value = true
    mostrarResumen.value = true

    console.log(' Obteniendo resumen para rea:', { lat, lng })

    // Obtener filtros actuales del store
    const filtros = {
      fechaInicio: filtroFechasStore.fechaInicio,
      fechaFin: filtroFechasStore.fechaFin,
    }

    const resumen = await getResumenLogsPorArea(lat, lng, 0.02, filtros) // Radio de ~2km aprox
    resumenArea.value = resumen

    console.log(' Resumen obtenido:', resumen)

    // Crear grfico con los datos del resumen despus de un breve delay
    await nextTick()
    // Usar setTimeout para asegurar que el DOM se haya renderizado completamente
    setTimeout(() => {
      crearGraficoResumen()
      crearGraficoTimeline()
      // Hacer scroll hacia el resumen despus de crear los grficos
      scrollToResumen()
    }, 100)
  } catch (error) {
    console.error(' Error al obtener resumen del rea:', error)
    resumenArea.value = {
      totalEventos: 0,
      eventosPorTipo: [],
      eventosPorEstado: [],
      ubicacion: { lat, lng },
      error: 'Error al cargar datos del rea',
    }
  } finally {
    cargandoResumen.value = false
  }
}

// Funcin para mostrar resumen de un evento especfico al hacer clic en un marcador
const mostrarResumenEvento = async (eventoClicado, todosLosEventos) => {
  try {
    cargandoResumen.value = true
    mostrarResumen.value = true

    console.log(' Analizando evento seleccionado:', eventoClicado)

    // Almacenar el evento seleccionado
    eventoSeleccionado.value = eventoClicado

    // Encontrar eventos en un radio cercano (aproximadamente 5km)
    const radioEnGrados = 0.05 // Aproximadamente 5km
    const eventosEnRadio = todosLosEventos.filter((evento) => {
      if (!evento.gps) return false

      const [lat1, lng1] = evento.gps.split(',').map(parseFloat)
      const [lat2, lng2] = eventoClicado.gps.split(',').map(parseFloat)

      if (isNaN(lat1) || isNaN(lng1) || isNaN(lat2) || isNaN(lng2)) return false

      // Calcular distancia aproximada
      const distancia = Math.sqrt(Math.pow(lat1 - lat2, 2) + Math.pow(lng1 - lng2, 2))

      return distancia <= radioEnGrados
    })

    eventosEnArea.value = eventosEnRadio

    console.log(' Eventos en rea cercana:', eventosEnRadio.length)

    // Analizar los datos para el resumen
    const analisisEventos = analizarEventosEnArea(eventosEnRadio, eventoClicado)
    resumenArea.value = analisisEventos

    console.log(' Anlisis completado:', analisisEventos)

    // Crear grfico con los datos del anlisis despus de un breve delay
    await nextTick()
    // Usar setTimeout para asegurar que el DOM se haya renderizado completamente
    setTimeout(() => {
      crearGraficoResumen()
      crearGraficoTimeline()
      // Hacer scroll hacia el resumen despus de crear los grficos
      scrollToResumen()
    }, 100)
  } catch (error) {
    console.error(' Error al analizar evento:', error)
    resumenArea.value = {
      totalEventos: 1,
      eventosPorTipo: [],
      eventosPorEstado: [],
      ubicacion: { lat: 0, lng: 0 },
      error: 'Error al cargar anlisis del evento',
    }
  } finally {
    cargandoResumen.value = false
  }
}

//  Funcin para mostrar resumen de un cluster al hacer clic en l
const mostrarResumenCluster = async (eventosDelCluster, posicionCluster) => {
  try {
    cargandoResumen.value = true
    mostrarResumen.value = true

    console.log(' Analizando cluster con eventos:', eventosDelCluster.length)
    console.log(' Posicin del cluster:', posicionCluster)

    // No hay un evento focal especfico, es anlisis de cluster
    eventoSeleccionado.value = null
    eventosEnArea.value = eventosDelCluster

    // Analizar todos los eventos del cluster
    const analisisCluster = analizarEventosEnAreaCluster(eventosDelCluster, posicionCluster)

    // Agregar informacin especfica del cluster
    analisisCluster.tipoAnalisis = 'cluster'
    analisisCluster.totalEventos = eventosDelCluster.length

    resumenArea.value = analisisCluster

    console.log(' Anlisis de cluster completado:', analisisCluster)

    // Crear grfico con los datos del anlisis despus de un breve delay
    await nextTick()
    // Usar setTimeout para asegurar que el DOM se haya renderizado completamente
    setTimeout(() => {
      crearGraficoResumen()
      crearGraficoTimeline()
      // Hacer scroll hacia el resumen despus de crear los grficos
      scrollToResumen()
    }, 100)
  } catch (error) {
    console.error(' Error al analizar cluster:', error)
    resumenArea.value = {
      error: 'Error al cargar anlisis del cluster',
      totalEventos: eventosDelCluster?.length || 0,
      eventosPorTipo: [],
      eventosPorEstado: [],
      ubicacion: {
        lat: posicionCluster.lat,
        lng: posicionCluster.lng,
      },
    }
  } finally {
    cargandoResumen.value = false
  }
}

// Funcin para analizar eventos en un rea y generar estadsticas
const analizarEventosEnArea = (eventos, eventoFocal) => {
  console.log(' Analizando', eventos.length, 'eventos en el rea')

  // Extraer coordenadas del evento focal
  const [lat, lng] = eventoFocal.gps.split(',').map(parseFloat)

  // Agrupar por tipo de resultado
  const eventosPorEstado = {}
  const eventosPorTipo = {}
  const dispositivos = {}
  const usuarios = {}

  eventos.forEach((evento) => {
    // Por estado del resultado
    const estado =
      evento.resultadoEvento?.descripcion || evento.resultadoDescripcion || 'Estado desconocido'
    eventosPorEstado[estado] = (eventosPorEstado[estado] || 0) + 1

    // Por tipo de evento
    const tipo = evento.tipoEvento?.detalle || evento.tipoEvento?.clave || 'Tipo desconocido'
    eventosPorTipo[tipo] = (eventosPorTipo[tipo] || 0) + 1

    // Por dispositivo
    const dispositivo = evento.dispositivo || 'Dispositivo desconocido'
    dispositivos[dispositivo] = (dispositivos[dispositivo] || 0) + 1

    // Por usuario
    const usuario = evento.usuario?.usuario || evento.usuario || 'Usuario desconocido'
    usuarios[usuario] = (usuarios[usuario] || 0) + 1
  })

  // Convertir a arrays para los grficos
  const estadosArray = Object.entries(eventosPorEstado).map(([estado, cantidad]) => ({
    estado,
    cantidad,
  }))

  const tiposArray = Object.entries(eventosPorTipo).map(([tipo, cantidad]) => ({
    tipo,
    cantidad,
  }))

  const dispositivosArray = Object.entries(dispositivos).map(([dispositivo, cantidad]) => ({
    dispositivo,
    cantidad,
  }))

  return {
    totalEventos: eventos.length,
    eventoFocal: {
      usuario: eventoFocal.usuario?.usuario || eventoFocal.usuario || 'Usuario desconocido',
      dispositivo: eventoFocal.dispositivo || 'Dispositivo desconocido',
      tipoEvento: eventoFocal.tipoEvento?.detalle || 'Tipo desconocido',
      resultado:
        eventoFocal.resultadoEvento?.descripcion ||
        eventoFocal.resultadoDescripcion ||
        'Resultado desconocido',
      fecha: eventoFocal.fechaHoraDia
        ? new Date(eventoFocal.fechaHoraDia).toLocaleString()
        : 'Fecha no disponible',
      porcentaje: eventoFocal.porcentaje || 'N/A',
    },
    eventosPorEstado: estadosArray,
    eventosPorTipo: tiposArray,
    dispositivosEnArea: dispositivosArray,
    usuariosUnicos: Object.keys(usuarios).length,
    ubicacion: { lat, lng },
    radioAnalizado: '~5km',
  }
}

//  Funcin especfica para analizar eventos de un cluster (sin evento focal)
const analizarEventosEnAreaCluster = (eventos, posicionCluster) => {
  console.log(' Analizando cluster con', eventos.length, 'eventos')

  // Agrupar por tipo de resultado
  const eventosPorEstado = {}
  const eventosPorTipo = {}
  const dispositivos = {}
  const usuarios = {}
  const fechas = {}

  eventos.forEach((evento) => {
    // Por estado del resultado
    const estado =
      evento.resultadoEvento?.descripcion || evento.resultadoDescripcion || 'Estado desconocido'
    eventosPorEstado[estado] = (eventosPorEstado[estado] || 0) + 1

    // Por tipo de evento
    const tipo = evento.tipoEvento?.detalle || evento.tipoEvento?.clave || 'Tipo desconocido'
    eventosPorTipo[tipo] = (eventosPorTipo[tipo] || 0) + 1

    // Por dispositivo
    const dispositivo = evento.dispositivo || 'Dispositivo desconocido'
    dispositivos[dispositivo] = (dispositivos[dispositivo] || 0) + 1

    // Por usuario
    const usuario = evento.usuario?.usuario || evento.usuario || 'Usuario desconocido'
    usuarios[usuario] = (usuarios[usuario] || 0) + 1

    // Por fecha (para anlisis temporal)
    const fecha = evento.fechaHoraDia
      ? new Date(evento.fechaHoraDia).toLocaleDateString()
      : evento.fecha
      ? new Date(evento.fecha).toLocaleDateString()
      : 'Sin fecha'
    fechas[fecha] = (fechas[fecha] || 0) + 1
  })

  // Convertir a arrays para los grficos
  const estadosArray = Object.entries(eventosPorEstado).map(([estado, cantidad]) => ({
    estado,
    cantidad,
  }))

  const tiposArray = Object.entries(eventosPorTipo).map(([tipo, cantidad]) => ({
    tipo,
    cantidad,
  }))

  const dispositivosArray = Object.entries(dispositivos).map(([dispositivo, cantidad]) => ({
    dispositivo,
    cantidad,
  }))

  const fechasArray = Object.entries(fechas).map(([fecha, cantidad]) => ({
    fecha,
    cantidad,
  }))

  // Encontrar el tipo de evento ms comn para mostrar como principal
  const tipoMasComun =
    tiposArray.length > 0
      ? tiposArray.reduce((prev, current) => (prev.cantidad > current.cantidad ? prev : current))
      : { tipo: 'No especificado', cantidad: 0 }

  // Encontrar el estado ms comn
  const estadoMasComun =
    estadosArray.length > 0
      ? estadosArray.reduce((prev, current) => (prev.cantidad > current.cantidad ? prev : current))
      : { estado: 'No especificado', cantidad: 0 }

  return {
    totalEventos: eventos.length,
    // Informacin del cluster en lugar de evento focal
    clusterInfo: {
      tipoEventoPrincipal: tipoMasComun.tipo,
      estadoPrincipal: estadoMasComun.estado,
      usuariosUnicos: Object.keys(usuarios).length,
      dispositivosUnicos: Object.keys(dispositivos).length,
      fechasConActividad: Object.keys(fechas).length,
      ubicacion: `${posicionCluster.lat.toFixed(4)}, ${posicionCluster.lng.toFixed(4)}`,
    },
    eventosPorEstado: estadosArray,
    eventosPorTipo: tiposArray,
    dispositivosEnArea: dispositivosArray,
    usuariosUnicos: Object.keys(usuarios).length,
    ubicacion: { lat: posicionCluster.lat, lng: posicionCluster.lng },
    radioAnalizado: 'Cluster',
    fechasPorDia: fechasArray,
  }
}

// Funcin para crear grfico del resumen del rea
const crearGraficoResumen = () => {
  console.log(' Creando grfico de resumen...')

  const canvas = document.getElementById('graficoResumenArea')
  if (!canvas) {
    console.warn(' No se encontr el canvas graficoResumenArea')
    // Intentar de nuevo despus de un breve delay
    setTimeout(() => {
      const retryCanvas = document.getElementById('graficoResumenArea')
      if (retryCanvas) {
        console.log(' Canvas encontrado en reintento, creando grfico...')
        crearGraficoResumenInterno(retryCanvas)
      } else {
        console.error(' Canvas graficoResumenArea an no disponible despus del reintento')
      }
    }, 200)
    return
  }

  crearGraficoResumenInterno(canvas)
}

const crearGraficoResumenInterno = (canvas) => {
  if (!resumenArea.value) {
    console.warn(' No hay datos en resumenArea.value')
    return
  }

  console.log(' Datos del resumen:', resumenArea.value)
  console.log(' Estados disponibles:', resumenArea.value.eventosPorEstado)

  const ctx = canvas.getContext('2d')

  // Destruir grfico anterior si existe (verificar que sea una instancia vlida)
  if (window.graficoResumenArea && typeof window.graficoResumenArea.destroy === 'function') {
    try {
      window.graficoResumenArea.destroy()
      console.log(' Grfico anterior destruido correctamente')
    } catch (error) {
      console.warn(' Error al destruir grfico anterior:', error)
    }
  }
  window.graficoResumenArea = null

  if (!resumenArea.value.eventosPorEstado || resumenArea.value.eventosPorEstado.length === 0) {
    console.warn(' No hay eventos por estado para mostrar')

    // Mostrar mensaje informativo en el canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#374151'
    ctx.font = 'bold 14px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    const mensaje = resumenArea.value.mensaje || 'Sin datos para mostrar'
    const lineas = mensaje.match(/.{1,35}(\s|$)/g) || [mensaje]

    lineas.forEach((linea, index) => {
      ctx.fillText(
        linea.trim(),
        canvas.width / 2,
        canvas.height / 2 + (index - lineas.length / 2 + 0.5) * 20
      )
    })

    // Crear un grfico vaco elegante
    window.graficoResumenArea = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Sin datos'],
        datasets: [
          {
            data: [1],
            backgroundColor: ['#f3f4f6'],
            borderColor: ['#e5e7eb'],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: false,
          },
        },
        cutout: '70%',
      },
    })
    return
  }

  console.log(' Creando grfico con datos:', resumenArea.value.eventosPorEstado)

  // Mapear colores segn el tipo de estado para mejor interpretacin visual
  const coloresEstado = resumenArea.value.eventosPorEstado.map((item) => {
    const estado = item.estado.toLowerCase()
    if (estado.includes('exitoso') || estado.includes('correcto') || estado.includes('success')) {
      return '#10b981' // Verde para exitoso
    } else if (estado.includes('fallido') || estado.includes('error') || estado.includes('fallo')) {
      return '#ef4444' // Rojo para error
    } else if (estado.includes('pendiente') || estado.includes('proceso')) {
      return '#f59e0b' // Amarillo para pendiente
    } else if (estado.includes('cancelado') || estado.includes('rechazado')) {
      return '#6b7280' // Gris para cancelado
    } else {
      return '#3b82f6' // Azul por defecto
    }
  })

  window.graficoResumenArea = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: resumenArea.value.eventosPorEstado.map((item) => item.estado),
      datasets: [
        {
          data: resumenArea.value.eventosPorEstado.map((item) => item.cantidad),
          backgroundColor: coloresEstado,
          borderWidth: 3,
          borderColor: '#ffffff',
          hoverBorderWidth: 4,
          hoverBorderColor: '#ffffff',
          hoverBackgroundColor: coloresEstado.map((color) => color + 'dd'), // Agregar transparencia en hover
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '60%',
      plugins: {
        legend: {
          display: false, // LEYENDAS DESHABILITADAS - Usamos cuadros de resumen
        },
        tooltip: {
          backgroundColor: '#1f2937',
          titleColor: '#f9fafb',
          bodyColor: '#f9fafb',
          borderColor: '#4b5563',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8,
          displayColors: true,
          callbacks: {
            label: function (context) {
              const total = context.dataset.data.reduce((a, b) => a + b, 0)
              const percentage = ((context.parsed * 100) / total).toFixed(1)
              return `${context.label}: ${context.parsed} eventos (${percentage}%)`
            },
          },
        },
      },
      animation: {
        animateRotate: true,
        animateScale: true,
        duration: 800,
        easing: 'easeOutQuart',
      },
      interaction: {
        intersect: false,
        mode: 'nearest',
      },
    },
  })
}

//  FUNCIN ROBUSTA: Crear grfico de timeline con validaciones completas
function crearGraficoTimeline() {
  console.log(' Iniciando creacin de grfico timeline...')

  //  VALIDACIN 1: Verificar que resumenArea est inicializado
  if (!resumenArea.value) {
    console.warn(' resumenArea no est inicializado')
    return
  }

  //  VALIDACIN 2: Verificar si hay datos disponibles para el timeline
  if (!resumenArea.value.fechasPorDia || resumenArea.value.fechasPorDia.length === 0) {
    console.warn(' No hay datos disponibles para el timeline (fechasPorDia vaco o no existe)')
    return
  }

  console.log(' Datos timeline disponibles:', resumenArea.value.fechasPorDia.length, 'fechas')

  //  PASO 2: Verificar si ya existe una instancia y destruirla
  if (timelineChartInstance && typeof timelineChartInstance.destroy === 'function') {
    try {
      timelineChartInstance.destroy()
      console.log(' Timeline anterior destruido')
    } catch (error) {
      console.warn(' Error destruyendo timeline anterior:', error)
    }
    timelineChartInstance = null
  }

  //  PASO 3: Intentar encontrar el canvas con mltiples reintentos
  const buscarCanvas = (intento = 0) => {
    const ctx = document.getElementById('timelineChart')

    if (!ctx) {
      if (intento < 5) {
        console.warn(` Canvas timelineChart no encontrado, reintento ${intento + 1}/5...`)
        setTimeout(() => {
          buscarCanvas(intento + 1)
        }, 200 * (intento + 1)) // Delay incremental
        return
      } else {
        console.error(
          ' Canvas timelineChart no encontrado despus de 5 intentos - verificar que v-if de fechasPorDia est cumplido'
        )
        return
      }
    }

    console.log(' Canvas timeline encontrado, creando grfico...')
    crearGraficoTimelineInterno(ctx)
  }

  // Iniciar bsqueda del canvas
  buscarCanvas()
}

function crearGraficoTimelineInterno(ctx) {
  console.log(' Eventos disponibles para timeline:', eventos.value?.length || 0)

  // Agrupar eventos por da
  const eventosPorDia = {}
  const diasCompletos = []

  // Generar las fechas de acuerdo a lo seleccionado en el calendario
  let actual = new Date(filtroFechasStore.fechaInicio)
  const fin = new Date(filtroFechasStore.fechaFin)

  // Normalizamos ambas fechas al inicio del día
  actual.setHours(0, 0, 0, 0)
  fin.setHours(0, 0, 0, 0)

  while (actual <= fin) {
    const diaKey = actual.toISOString().slice(0, 10) // YYYY-MM-DD
    eventosPorDia[diaKey] = 0
    diasCompletos.push(diaKey)

    // Avanzamos un día
    actual.setDate(actual.getDate() + 1)
  }

  if (eventos.value && eventos.value.length > 0) {
    eventos.value.forEach((evento) => {
      if (evento.fecha || evento.fechaHoraDia) {
        const fechaEvento = evento.fechaHoraDia || evento.fecha
        const diaEvento = new Date(fechaEvento).toISOString().slice(0, 10)
        if (Object.prototype.hasOwnProperty.call(eventosPorDia, diaEvento)) {
          console.log('Evento Por Día: ', eventosPorDia[diaEvento])
          eventosPorDia[diaEvento]++
        }
      }
    })
  }

  console.log(' Eventos por día calculados:', eventosPorDia)

  // Destruir grfico anterior usando la nueva variable de instancia
  if (timelineChartInstance && typeof timelineChartInstance.destroy === 'function') {
    try {
      timelineChartInstance.destroy()
      console.log(' Timeline anterior destruido correctamente')
    } catch (error) {
      console.warn(' Error destruyendo timeline anterior:', error)
    }
  }
  timelineChartInstance = null

  // Limpiar tambin la variable global legacy
  if (window.timelineChart) {
    window.timelineChart = null
  }

  timelineChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: diasCompletos.map((dia) => {
        const date = new Date(dia + 'T00:00:00Z')
        return date.toLocaleDateString('es-ES', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        })
      }),
      datasets: [
        {
          label: 'Eventos por Da',
          data: diasCompletos.map((dia) => eventosPorDia[dia]),
          borderColor: '#1976D2',
          backgroundColor: 'rgba(25, 118, 210, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#1976D2',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 8,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index',
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: '#1976D2',
          borderWidth: 1,
          callbacks: {
            title: function (context) {
              return `Da: ${context[0].label}`
            },
            label: function (context) {
              return `${context.parsed.y} evento${context.parsed.y !== 1 ? 's' : ''}`
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
            drawOnChartArea: true,
          },
          ticks: {
            color: '#666',
            maxTicksLimit: 6,
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
            drawOnChartArea: true,
          },
          ticks: {
            color: '#666',
            stepSize: 1,
          },
        },
      },
      elements: {
        point: {
          hoverBackgroundColor: '#FFB74D',
        },
      },
    },
  })
}

onMounted(async () => {
  renderDeviceChart()
  await nextTick()
  renderPiePorFuncionalidad()
  try {
    const respuesta = await getDuracionPromedioFuncionalidad(
      filtroFechasStore.obtenerFechasFormateadas()
    )
    tiemposFuncionalidad.value = respuesta.map((item) => ({
      funcionalidad: item.funcionalidad.replace(/_/g, ' '),
      totalSegundos: tiempoASegundos(item.duracion),
    }))
    renderCharts()
  } catch (error) {
    console.error('Error al obtener datos de funcionalidad:', error)
  }
  try {
    // Obtener fechas del store de filtros
    const filtros = filtroFechasStore.obtenerFechasFormateadas()

    console.log(' Cargando eventos para el mapa con filtros:', filtros)
    const eventosData = await getEventosBiometricosPorFiltro(filtros)
    eventos.value = eventosData // Almacenar en variable global

    console.log(' Eventos obtenidos:', eventosData?.length || 0)

    if (!eventosData || eventosData.length === 0) {
      console.warn(' No se encontraron eventos para mostrar en el mapa')
      // Mostrar mensaje al usuario de que no hay datos
      return
    }

    const eventosConGps = eventosData
      .filter((e) => {
        // Verificar que el evento tenga GPS vlido
        if (!e.gps || typeof e.gps !== 'string') return false
        if (!e.gps.includes(',')) return false

        const coords = e.gps.split(',')
        if (coords.length !== 2) return false

        const [lat, lng] = coords.map(parseFloat)
        return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
      })
      .map((e) => {
        const [lat, lng] = e.gps.split(',').map(parseFloat)

        return {
          lat,
          lng,
          usuario: e.usuario?.usuario || e.usuario || 'Usuario desconocido',
          detalle: e.tipoEvento?.detalle || e.tipoEvento || 'Sin especificar',
          descripcion: e.resultadoDescripcion || e.resultadoEvento || 'Sin descripcin',
          fecha: e.fechaHoraDia
            ? new Date(e.fechaHoraDia).toLocaleString()
            : e.fecha
            ? new Date(e.fecha).toLocaleString()
            : 'Fecha no disponible',
          // Mantener referencia al evento original completo para anlisis
          eventoOriginal: e,
        }
      })

    console.log(' Eventos con GPS vlido:', eventosConGps.length)
    const map = L.map('mapaEventos').setView([19.4326, -99.1332], 5)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: ' OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map)

    // Agregar listener para clicks en el mapa
    map.on('click', async (e) => {
      const { lat, lng } = e.latlng
      console.log(' Click en mapa:', { lat, lng })
      await obtenerResumenArea(lat, lng)
    })

    const markers = L.markerClusterGroup({
      // Configuracin mejorada del cluster para mejor experiencia
      chunkedLoading: true,
      maxClusterRadius: 60, // Radio reducido para menos agrupacin
      spiderfyOnMaxZoom: true, // Reactivar spiderfy para mostrar marcadores individuales
      showCoverageOnHover: false, // Desactivar cobertura al hacer hover para menos distraccin
      zoomToBoundsOnClick: true, // Permitir zoom al hacer clic (funcionalidad original)
      spiderfyOnEveryZoom: false, // Reducir spiderfy para menos animacin
      removeOutsideVisibleBounds: false, // Mantener marcadores para mejor rendimiento
      animate: false, // Desactivar animaciones para menos exageracin
      animateAddingMarkers: false, // Desactivar animacin al agregar marcadores
      disableClusteringAtZoom: 15, // Desagrupar a nivel de zoom alto para mejor detalle
      spiderfyDistanceMultiplier: 1.2, // Reducir distancia del spiderfy

      // Personalizacin visual de clusters
      iconCreateFunction: function (cluster) {
        const count = cluster.getChildCount()
        let className = 'marker-cluster marker-cluster-'

        if (count < 10) {
          className += 'small'
        } else if (count < 100) {
          className += 'medium'
        } else {
          className += 'large'
        }

        return new L.DivIcon({
          html: `<div style="
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            border: 3px solid #ffffff;
            border-radius: 50%;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
            transition: all 0.3s ease;
          "><span>${count}</span></div>`,
          className: className,
          iconSize: new L.Point(40, 40),
        })
      },
    })

    //  Mejorar evento de clic en clusters
    markers.on('clusterclick', async (event) => {
      console.log(' Click en cluster detectado:', event)

      // Evitar el comportamiento por defecto solo temporalmente
      L.DomEvent.stopPropagation(event)

      const cluster = event.layer
      const childMarkers = cluster.getAllChildMarkers()

      console.log(` Cluster contiene ${childMarkers.length} marcadores`)

      // Si el cluster tiene pocos elementos, hacer zoom normalmente
      if (childMarkers.length <= 5) {
        // Permitir comportamiento normal de zoom
        cluster.zoomToBounds()
        return
      }

      // Para clusters grandes, mostrar anlisis
      const eventosDelCluster = childMarkers
        .map((marker) => {
          const markerLatLng = marker.getLatLng()
          return eventosConGps.find(
            (e) =>
              Math.abs(e.lat - markerLatLng.lat) < 0.0001 &&
              Math.abs(e.lng - markerLatLng.lng) < 0.0001
          )
        })
        .filter(Boolean)
        .map((e) => e.eventoOriginal || e)

      if (eventosDelCluster.length > 0) {
        await mostrarResumenCluster(eventosDelCluster, cluster.getLatLng())
      }
    })

    // Mejorar visualizacin de marcadores individuales
    eventosConGps.forEach((e) => {
      // Crear icono personalizado basado en el resultado
      const isSuccess = e.descripcion && e.descripcion.toLowerCase().includes('exitoso')
      const iconColor = isSuccess ? '#10b981' : '#ef4444'

      const customIcon = L.divIcon({
        html: `<div style="
          background: ${iconColor};
          border: 2px solid white;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          cursor: pointer;
          user-select: none;
          pointer-events: auto;
        " title="Click para ms detalles">

        </div>`,
        className: 'custom-marker-location',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      })

      const marker = L.marker([e.lat, e.lng], { icon: customIcon }).bindTooltip(
        `Click para ms detalles`,
        {
          permanent: false,
          direction: 'top',
          offset: [0, -10],
          className: 'custom-tooltip',
          sticky: true,
        }
      )

      // Efecto hover ms estable - sin cambio de tamao brusco
      marker.on('mouseover', function () {
        this.getElement().style.zIndex = '1000'
        this.getElement().style.opacity = '0.9'
        this.getElement().style.zIndex = '1000'
        this.getElement().style.opacity = '0.9'
      })

      marker.on('mouseout', function () {
        this.getElement().style.zIndex = '500'
        this.getElement().style.opacity = '1'
      })

      // Evento de clic en marcador individual
      marker.on('click', async (markerEvent) => {
        console.log(' Click en marcador - datos del evento procesado:', JSON.stringify(e, null, 2))

        // Prevenir propagacin al mapa
        L.DomEvent.stopPropagation(markerEvent)

        // Mostrar anlisis del evento especfico
        await mostrarResumenEvento(e.eventoOriginal || e, eventos.value)

        // Hacer scroll hacia el resumen
        setTimeout(() => {
          const resumenElement = document.querySelector('.resumen-card')
          if (resumenElement) {
            resumenElement.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            })
          }
        }, 100)
      })

      markers.addLayer(marker)
    })
    map.addLayer(markers)
    //  NUEVO: agrupamos solo los FALLIDO y actualizamos la lista
    try {
      const agrupados = await agruparFallosPorEstado(eventos.value)
      fallosPorEstado.value = agrupados
    } catch (err) {
      console.error('Error al agrupar fallos por estado:', err)
    }
  } catch (error) {
    console.error('Error al cargar eventos para el mapa:', error)
  }

  // No crear timeline aqu porque el canvas solo existe cuando se muestra el resumen
  console.log(' Mapa y eventos cargados correctamente')
})

// Watcher para actualizar grficas automticamente cuando cambien las fechas
watch(
  () => [filtroFechasStore.fechaInicio, filtroFechasStore.fechaFin],
  async (newDates, oldDates) => {
    if (
      modoSeleccionado.value === 'mobile' &&
      (newDates[0] !== oldDates[0] || newDates[1] !== oldDates[1])
    ) {
      console.log(' Fechas cambiadas en mobile, actualizando grficas:', {
        old: oldDates,
        new: newDates,
      })
      await actualizarDatos()
    }
  },
  { immediate: false }
)

// Variable para almacenar instancias de grficos
let barChartInstance = null
let doughnutChartInstance = null
let deviceChartInstance = null
let timelineChartInstance = null

// Map para gestionar instancias de grficos de pie
const pieChartInstances = new Map()

//  FUNCIN ROBUSTA: Destruir grficos existentes y limpiar registro global de Chart.js
function destroyExistingCharts() {
  console.log(' Iniciando limpieza ROBUSTA de grficos existentes...')

  try {
    // 1. Destruir instancias principales
    const charts = [
      { instance: barChartInstance, name: 'barras' },
      { instance: doughnutChartInstance, name: 'doughnut' },
      { instance: deviceChartInstance, name: 'dispositivos' },
      { instance: timelineChartInstance, name: 'timeline' },
    ]

    charts.forEach(({ instance, name }) => {
      if (instance && typeof instance.destroy === 'function') {
        try {
          instance.destroy()
          console.log(` Grfico de ${name} destruido correctamente`)
        } catch (error) {
          console.warn(` Error destruyendo grfico de ${name}:`, error)
        }
      }
    })

    // Limpiar referencias principales
    barChartInstance = null
    doughnutChartInstance = null
    deviceChartInstance = null
    timelineChartInstance = null

    // 2. Destruir grficos de pie usando el Map
    pieChartInstances.forEach((instance, key) => {
      if (instance && typeof instance.destroy === 'function') {
        try {
          instance.destroy()
          console.log(` Grfico de pie ${key} destruido`)
        } catch (error) {
          console.warn(` Error destruyendo grfico de pie ${key}:`, error)
        }
      }
    })
    pieChartInstances.clear()

    // 3. Limpiar tambin referencias legacy
    Object.keys(pieRefs.value).forEach((key) => {
      const canvas = pieRefs.value[key]
      if (canvas && canvas.chart) {
        try {
          canvas.chart.destroy()
          console.log(` Grfico legacy ${key} destruido`)
        } catch (error) {
          console.warn(` Error destruyendo grfico legacy ${key}:`, error)
        }
        canvas.chart = null
      }
    })

    // 4.  LIMPIAR REGISTRO GLOBAL DE CHART.JS
    // Esto elimina todas las referencias internas que Chart.js mantiene
    if (window.Chart && window.Chart.instances) {
      Object.keys(window.Chart.instances).forEach((id) => {
        const instance = window.Chart.instances[id]
        if (instance && typeof instance.destroy === 'function') {
          try {
            instance.destroy()
            console.log(` Instancia global ${id} eliminada`)
          } catch (error) {
            console.warn(` Error eliminando instancia global ${id}:`, error)
          }
        }
      })
      // Limpiar el objeto de instancias
      window.Chart.instances = {}
      console.log(' Registro global de Chart.js limpiado')
    }

    // 5. Limpiar canvas elements que puedan tener referencias colgadas
    const canvasElements = [
      'grafico-captura-facial',
      'grafico-vida-util',
      'grafico-uso-funcionalidad',
      'timelineChart',
    ]
    canvasElements.forEach((canvasId) => {
      const canvas = document.getElementById(canvasId)
      if (canvas) {
        // Remover cualquier evento o contexto asociado
        const context = canvas.getContext('2d')
        if (context) {
          context.clearRect(0, 0, canvas.width, canvas.height)
        }
        // Limpiar atributos de Chart.js
        canvas.removeAttribute('data-chartjs-id')
        canvas.style.display = 'block' // Reset display
        canvas.style.position = 'relative' // Reset position
        canvas.style.height = 'auto' // Reset height
        canvas.style.width = 'auto' // Reset width
      }
    })

    // Limpiar variable global legacy del timeline
    if (window.timelineChart && typeof window.timelineChart.destroy === 'function') {
      try {
        window.timelineChart.destroy()
        console.log(' Timeline chart legacy destruido')
      } catch (error) {
        console.warn(' Error destruyendo timeline chart legacy:', error)
      }
      window.timelineChart = null
    }

    console.log(' Limpieza ROBUSTA de grficos completada exitosamente')
  } catch (error) {
    console.error(' Error durante la limpieza robusta:', error)
  }
}

// Funcin mejorada para renderizar grficas con verificacin de datos
function renderCharts() {
  console.log(' Iniciando renderCharts - destruyendo grficos existentes')

  // Destruir grficos existentes antes de crear nuevos
  destroyExistingCharts()

  // Verificar que los canvas estn disponibles
  if (!barChart.value) {
    console.warn(' Canvas barChart no disponible')
    return
  }

  // Verificar que los datos estn listos antes de renderizar
  if (!tiemposFuncionalidad.value || tiemposFuncionalidad.value.length === 0) {
    console.log(' Datos de funcionalidad no listos, esperando...')
    return
  }

  try {
    const labels = tiemposFuncionalidad.value.map((t) => t.funcionalidad)
    const data = tiemposFuncionalidad.value.map((t) => t.totalSegundos)

    // Verificar que tenemos datos vlidos
    if (labels.length === 0 || data.length === 0) {
      console.warn(' No hay datos vlidos para el grfico de barras')
      return
    }

    barChartInstance = new Chart(barChart.value, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Segundos Totales',
            data: data,
            backgroundColor: '#26A69A',
            borderRadius: 5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index',
        },
        layout: {
          padding: {
            top: 10,
            bottom: 10,
            left: 10,
            right: 10,
          },
        },
        plugins: {
          tooltip: { enabled: true },
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: '#ccc',
              padding: 20,
              usePointStyle: true,
            },
          },
        },
        scales: {
          x: {
            ticks: { color: '#ccc', maxRotation: 45 },
            grid: { color: '#444', display: false },
          },
          y: {
            beginAtZero: true,
            ticks: { color: '#ccc' },
            grid: { color: '#444' },
          },
        },
      },
    })
    renderDeviceChart()
    renderPiePorFuncionalidad()
    console.log(' Grfico de barras creado exitosamente con', labels.length, 'elementos')
  } catch (error) {
    console.error(' Error creando grfico de barras:', error)
  }

  // Crear grfico doughnut solo si el canvas est disponible
  if (chart.value) {
    // Verificar que los datos estn disponibles
    if (!tiemposFuncionalidad.value || tiemposFuncionalidad.value.length === 0) {
      console.warn(' No hay datos para el grfico doughnut')
      return
    }

    try {
      const labels = tiemposFuncionalidad.value.map((t) => t.funcionalidad)
      const data = tiemposFuncionalidad.value.map((t) => t.totalSegundos)

      doughnutChartInstance = new Chart(chart.value, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Distribucin',
              data: data,
              backgroundColor: ['#26A69A', '#7E57C2', '#1976D2', '#66BB6A', '#FFA726'], // Colores ms acordes al flujo
              borderColor: '#1e1e2f',
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '50%',
          plugins: {
            tooltip: {
              enabled: true,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: '#fff',
              bodyColor: '#fff',
            },
            legend: {
              display: false, // LEYENDAS DESHABILITADAS - Usamos cuadros de resumen
            },
          },
        },
      })
      console.log(' Grfico doughnut creado exitosamente con', labels.length, 'elementos')
    } catch (error) {
      console.error(' Error creando grfico doughnut:', error)
    }
  } else {
    console.warn(' Canvas chart no disponible para doughnut')
  }
}
//  FUNCIN MEJORADA: Renderizar grfico de dispositivos con debugging
async function renderDeviceChart() {
  console.log(' Iniciando renderDeviceChart...')

  try {
    // Destruir grfico de dispositivos existente si existe
    if (deviceChartInstance) {
      try {
        deviceChartInstance.destroy()
        console.log(' Grfico de dispositivos anterior destruido')
      } catch (error) {
        console.warn(' Error destruyendo grfico de dispositivos anterior:', error)
      }
      deviceChartInstance = null
    }

    const payload = {
      fechaInicio: filtroFechasStore.fechaInicio,
      fechaFin: filtroFechasStore.fechaFin,
    }
    console.log(' Payload para dispositivos:', payload)

    deviceChartData.value = await getDispositivosMasUsados(payload)
    console.log(' Datos de dispositivos recibidos:', deviceChartData.value)

    if (!deviceChartData.value || deviceChartData.value.length === 0) {
      console.warn(' No hay datos de dispositivos para mostrar')
      return
    }

    const labels = deviceChartData.value.map((d) => d.dispositivo)
    const valores = deviceChartData.value.map((d) => d.total)

    console.log(' Labels dispositivos:', labels)
    console.log(' Valores dispositivos:', valores)

    // Verificar que el canvas est disponible
    if (!deviceChart.value) {
      console.warn(' Canvas deviceChart no disponible')
      // Intentar nuevamente despus de un pequeo delay
      setTimeout(() => {
        if (deviceChart.value) {
          console.log(' Canvas deviceChart encontrado en reintento')
          renderDeviceChart()
        }
      }, 200)
      return
    }

    console.log(' Canvas deviceChart disponible, creando grfico...')

    deviceChartInstance = new Chart(deviceChart.value, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Total de usos',
            data: valores,
            backgroundColor: [
              '#26A69A',
              '#42A5F5',
              '#AB47BC',
              '#FF7043',
              '#FFCA28',
              '#66BB6A',
              '#EF5350',
              '#5C6BC0',
            ],
            borderColor: '#1A1A1A',
            borderWidth: 1,
          },
        ],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(0,0,0,0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
          },
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: '#fff',
              font: {
                size: 12,
              },
            },
          },
        },
        scales: {
          x: {
            ticks: {
              color: '#ccc',
              font: {
                size: 11,
              },
            },
            grid: { color: 'rgba(255,255,255,0.1)' },
          },
          y: {
            ticks: {
              color: '#ccc',
              font: {
                size: 11,
              },
            },
            grid: { color: 'rgba(255,255,255,0.1)' },
          },
        },
      },
    })
    console.log(' Grfico de dispositivos creado exitosamente')
  } catch (error) {
    console.error(' Error al cargar dispositivos:', error)
    console.error(' Stack trace:', error.stack)
  }
}

//  FUNCIN MEJORADA: renderPiePorFuncionalidad con mejor persistencia de leyendas
function renderPiePorFuncionalidad() {
  console.log(' Iniciando renderPiePorFuncionalidad...')

  getFuncionalidadesEstado({
    fechaInicio: filtroFechasStore.fechaInicio,
    fechaFin: filtroFechasStore.fechaFin,
  })
    .then(async (data) => {
      if (!data || data.length === 0) {
        funcionalidades.value = []
        console.warn(' No hay datos para grficos de funcionalidad')
        return
      }

      funcionalidades.value = data
      console.log(' Datos de funcionalidades:', data.length, 'funcionalidades')

      //  ESPERAR MS TIEMPO para que el DOM est completamente listo
      await nextTick()
      await new Promise((resolve) => setTimeout(resolve, 100))

      const colores = ['#f44336', '#ff9800', '#2196f3', '#4caf50']
      const tipos = ['total_fallido', 'total_cancelado', 'total_error', 'total_exito']
      const tipoLabels = ['Fallido', 'Cancelado', 'Error', 'Éxito']

      data.forEach((func) => {
        const valores = tipos.map((tipo) => func[tipo])
        const ref = pieRefs.value[func.clave]

        if (ref && valores.some((v) => v > 0)) {
          console.log(` Procesando grfico para ${func.clave} con valores:`, valores)

          //  DESTRUIR SOLO LA INSTANCIA ESPECFICA
          const existingInstance = pieChartInstances.get(func.clave)
          if (existingInstance && typeof existingInstance.destroy === 'function') {
            try {
              existingInstance.destroy()
              console.log(` Instancia ${func.clave} destruida`)
            } catch (error) {
              console.warn(` Error destruyendo grfico pie ${func.clave}:`, error)
            }
          }

          const chartInstance = new Chart(ref, {
            type: 'doughnut',
            data: {
              labels: tipoLabels,
              datasets: [
                {
                  label: func.clave,
                  data: valores,
                  backgroundColor: colores,
                  borderColor: '#1e1e2f',
                  borderWidth: 2,
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              cutout: '50%',
              plugins: {
                legend: {
                  display: false,
                },
                tooltip: {
                  enabled: true,
                  backgroundColor: 'rgba(17, 24, 39, 0.95)',
                  titleColor: '#f9fafb',
                  bodyColor: '#e5e7eb',
                  borderColor: 'rgba(75, 85, 99, 0.3)',
                  borderWidth: 1,
                  cornerRadius: 8,
                  displayColors: true,
                  callbacks: {
                    title: function (tooltipItems) {
                      return tooltipItems[0].label || 'Datos'
                    },
                    label: function (context) {
                      const value = context.raw || 0
                      const total = context.dataset.data.reduce((a, b) => a + b, 0)
                      const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0'
                      return `${context.label}: ${value} (${percentage}%)`
                    },
                  },
                },
              },
              animation: {
                duration: 600,
                easing: 'easeInOutQuart',
                animateRotate: true,
                animateScale: true,
                onComplete: function () {
                  console.log(` Animacin completada para ${func.clave}`)
                },
              },
              interaction: {
                intersect: false,
                mode: 'nearest',
              },
              layout: {
                padding: {
                  top: 10,
                  bottom: 10,
                  left: 10,
                  right: 10,
                },
              },
            },
          })

          pieChartInstances.set(func.clave, chartInstance)
          console.log(` Grfico de pie ${func.clave} creado con datos:`, valores)
        } else {
          console.warn(
            ` No se puede crear grfico para ${func.clave}: canvas no disponible o datos vacos`
          )
          funcionalidades.value = []
        }
      })
    })
    .catch((error) => {
      console.error(' Error al cargar funcionalidades:', error)
    })
}

onBeforeUnmount(() => {
  console.log(' Limpiando grficos antes de desmontar EstadisticasPage')
  destroyExistingCharts()
})
</script>
<style scoped>
.stats-container {
  background: #121826;
  border-radius: 16px;
}

.kpi-card {
  background: #1e1e2f;
  border-radius: 12px;
  color: white;
}

.chart-card {
  border-radius: 10px;
  padding: 1rem;
}

.donut-canvas {
  max-width: 100% !important;
  max-height: 100% !important;
  width: auto !important;
  height: auto !important;
}

.map-container {
  height: 300px;
  width: 100%;
  border-radius: 12px;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
}

.geo-card {
  border-radius: 12px;
  padding: 1rem;
}

/* === NUEVAS MEJORAS VISUALES === */

/* Animaciones y transiciones */
.animated-chip {
  animation: pulse 2s infinite;
}

.animated-icon {
  animation: rotate 2s linear infinite;
}

.animated-content {
  animation: fadeInUp 0.6s ease-out;
}

.animated-badge {
  animation: bounce 1s ease-in-out;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce {
  0%,
  20%,
  53%,
  80%,
  100% {
    transform: translate3d(0, 0, 0);
  }
  40%,
  43% {
    transform: translate3d(0, -8px, 0);
  }
  70% {
    transform: translate3d(0, -4px, 0);
  }
  90% {
    transform: translate3d(0, -2px, 0);
  }
}

/* Efectos hover */
.hover-effect:hover {
  transform: scale(1.1);
  background-color: rgba(255, 255, 255, 0.1) !important;
}

.mapa-container:hover {
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3) !important;
}

/* Cards especiales */
.evento-focal-card {
  animation: slideInFromLeft 0.8s ease-out;
}

.cluster-info-card {
  animation: slideInFromRight 0.8s ease-out;
}

.kpi-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.kpi-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.5);
}

.kpi-icon {
  animation: float 3s ease-in-out infinite;
}

@keyframes slideInFromLeft {
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInFromRight {
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* Items de eventos */
.evento-item {
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
}

.evento-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
  border-left-color: var(--q-primary);
  transform: translateX(5px);
}

.device-item,
.type-item {
  transition: all 0.2s ease;
}

.device-item:hover,
.type-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: scale(1.02);
}

.info-item {
  transition: all 0.2s ease;
  border-radius: 8px;
  margin-bottom: 8px;
}

.info-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

/* Contenedores de grficos */
.chart-container,
.timeline-container {
  position: relative;
  height: 200px;
}

.grafico-card,
.info-card,
.timeline-card,
.eventos-recientes-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.grafico-card:hover,
.info-card:hover,
.timeline-card:hover,
.eventos-recientes-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.3);
}

/* Estilos especficos del mapa */
.mapa-card {
  background: linear-gradient(135deg, #1e1e2f 0%, #2a2a3e 100%);
}

.resumen-card {
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

/* Responsive */
@media (max-width: 768px) {
  .kpi-card {
    height: auto !important;
    min-height: 200px;
  }

  .grafico-card,
  .info-card {
    height: auto !important;
    min-height: 250px;
  }
}

/* Personalizacin de clusters del mapa */
:deep(.marker-cluster-small) {
  background-color: rgba(59, 130, 246, 0.6);
}

:deep(.marker-cluster-small div) {
  background-color: rgba(59, 130, 246, 0.8);
}

:deep(.marker-cluster-medium) {
  background-color: rgba(251, 191, 36, 0.6);
}

:deep(.marker-cluster-medium div) {
  background-color: rgba(251, 191, 36, 0.8);
}

:deep(.marker-cluster-large) {
  background-color: rgba(239, 68, 68, 0.6);
}

:deep(.marker-cluster-large div) {
  background-color: rgba(239, 68, 68, 0.8);
}

:deep(.custom-popup .leaflet-popup-content) {
  margin: 8px 12px;
  line-height: 1.4;
}

:deep(.custom-marker) {
  transition: all 0.2s ease;
}

:deep(.custom-marker-location) {
  transition: opacity 0.2s ease !important;
  transform-origin: center center !important;
}

:deep(.custom-marker-location:hover) {
  opacity: 0.9 !important;
}

:deep(.custom-tooltip) {
  background: rgba(0, 0, 0, 0.8) !important;
  border: none !important;
  border-radius: 6px !important;
  color: white !important;
  font-size: 12px !important;
  padding: 6px 10px !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
}

:deep(.custom-tooltip::before) {
  border-top-color: rgba(0, 0, 0, 0.8) !important;
}

/* Scroll personalizado */
.custom-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}

.custom-scroll::-webkit-scrollbar {
  width: 6px;
}

.custom-scroll::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.custom-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.custom-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* Mejoras visuales para el contenedor de informacin */
.info-container {
  transition: all 0.3s ease;
}

.info-container:hover {
  background: rgba(255, 255, 255, 0.15) !important;
  transform: translateY(-2px);
}

/* Mejoras para items de lista */
.device-item,
.type-item {
  transition: all 0.2s ease;
}

.device-item:hover,
.type-item:hover {
  background: rgba(255, 255, 255, 0.2) !important;
  transform: translateX(4px);
}

/* Prevenir overflow y mejorar responsividad */
.stats-container {
  overflow: hidden !important;
}

.resumen-card {
  margin-bottom: 0 !important;
}

/* Ajustes para grficos responsivos */
.grafico-card {
  min-height: 280px !important;
}

/* Estilos para la informacin geogrfica responsiva */
.geo-info-item {
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.geo-info-item:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

/* Estilos para estadsticas de actividad */
.activity-stat-item {
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.activity-stat-item:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

/* Responsividad mejorada para mviles */
@media (max-width: 768px) {
  .info-geo-card,
  .info-users-card {
    margin-bottom: 16px !important;
  }

  .geo-info-item,
  .activity-stat-item {
    padding: 8px !important;
  }

  .text-h6 {
    font-size: 1.1rem !important;
  }

  .text-h5 {
    font-size: 1.25rem !important;
  }

  /* Mejoras especficas para grficas en mvil */
  .chart-card {
    margin-bottom: 16px !important;
    padding: 12px !important;
  }

  .donut-chart-card {
    margin-bottom: 20px !important;
  }

  .mapa-card {
    margin-bottom: 16px !important;
  }

  .mapa-container {
    height: 300px !important;
  }

  /* Ajustes para indicadores de carga en mvil */
  .q-inner-loading {
    z-index: 10;
  }

  /* Mejoras para las tarjetas de funcionalidades */
  .chart-card .q-card-section {
    padding: 12px !important;
  }

  .pie-canvas {
    max-width: 100% !important;
    height: auto !important;
  }
}

@media (max-width: 480px) {
  .row.items-center.justify-between {
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 8px;
  }

  .text-h5 {
    align-self: flex-end;
  }

  /* Ajustes adicionales para mviles pequeos */
  .stats-container {
    padding: 12px !important;
  }

  .chart-card {
    padding: 8px !important;
  }

  .mapa-container {
    height: 250px !important;
  }

  /* Mejorar espaciado en mviles */
  .q-pa-md {
    padding: 8px !important;
  }

  .q-mt-md {
    margin-top: 8px !important;
  }
}

/* Contenedores de grficos con altura fija */
.chart-container {
  position: relative;
  height: 250px !important;
  max-height: 250px !important;
  width: 100%;
  overflow: hidden;
}

.chart-container canvas {
  max-width: 100% !important;
  max-height: 100% !important;
  height: 250px !important;
  width: auto !important;
  object-fit: contain;
}

/* Timeline container especfico */
.timeline-container {
  position: relative;
  height: 200px !important;
  max-height: 200px !important;
  width: 100%;
  overflow: hidden;
}

.timeline-container canvas {
  max-width: 100% !important;
  max-height: 100% !important;
  height: 200px !important;
  width: auto !important;
}

/* Contenedores especficos para diferentes tipos de grficos */
.pie-chart-container {
  position: relative;
  height: 200px !important;
  max-height: 200px !important;
  width: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pie-chart-container canvas {
  max-width: 100% !important;
  max-height: 100% !important;
  height: 200px !important;
  width: auto !important;
}

/* Estilos especficos para donut canvas */
.donut-canvas {
  max-width: 100% !important;
  max-height: 100% !important;
  width: auto !important;
  height: auto !important;
}

/* Ajustes para pie canvas */
.pie-canvas {
  max-width: 100% !important;
  max-height: 100% !important;
  width: auto !important;
  height: auto !important;
}

/* Mejoras en texto truncado */
.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

/* Ajustes responsive para leyendas */
@media (max-width: 768px) {
  .grafico-card {
    min-height: 220px !important;
  }

  .chart-container {
    height: 180px !important;
    max-height: 180px !important;
  }

  .chart-container canvas {
    height: 180px !important;
  }

  .pie-chart-container {
    height: 160px !important;
    max-height: 160px !important;
  }

  .pie-chart-container canvas {
    height: 160px !important;
  }

  .text-h6 {
    font-size: 1rem !important;
  }

  .text-caption {
    font-size: 0.7rem !important;
  }
}
</style>


