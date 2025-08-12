<template>
  <q-page class="q-pa-md" style="background-color: #121826">
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
          flat
          bordered
          class="col-12 col-sm-4 col-md-2 q-pa-md text-white q-mx-sm"
          style="background-color: #1e1e2f; border-radius: 12px"
        >
          <div class="text-subtitle1 text-center q-mb-sm">Tiempo total por Funcionalidad</div>
          <canvas ref="barChart" height="200" />
        </q-card>
      </div>

      <!--Barra de dispositivos mas usados-->
      <div class="q-pa-md">
        <q-card
          flat
          bordered
          class="col-12 col-sm-4 col-md-2 q-pa-md text-white q-mx-sm"
          style="background-color: #1e1e2f; border-radius: 12px"
        >
          <div class="text-subtitle1 text-center">Dispositivos más usados</div>
          <canvas ref="deviceChart" height="300" />
        </q-card>
      </div>

      <!-- Donut Chart Section -->
      <!-- Sección inferior dividida en dos columnas -->
      <!-- Donut Chart: Uso por funcionalidad -->
      <q-card
        flat
        bordered
        class="col-12 col-md-6 chart-card donut-chart-card"
        style="background-color: #1e1e2f; border-radius: 12px; color: white"
      >
        <q-card-section>
          <div class="text-subtitle1 text-center q-mb-sm">Uso por Funcionalidad</div>
          <div class="flex flex-center">
            <canvas ref="chart" class="donut-canvas" />
          </div>
        </q-card-section>
      </q-card>
      <br />

      <!-- Gráfico de Funcionalidades por Tipo de Evento -->
      <div class="row q-col-gutter-md q-mb-md justify-center">
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
            <div class="flex flex-center">
              <canvas
                :ref="(el) => setPieRef(func.clave, el)"
                class="pie-canvas"
                height="200"
                width="200"
              ></canvas>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <br />
      <!-- Mapa con Geolocalización -->
      <q-card
        flat
        bordered
        class="q-pa-md text-white mapa-card"
        style="background-color: #1e1e2f; transition: all 0.3s ease"
      >
        <q-card-section>
          <div class="text-h6 text-center q-mb-sm">
            <q-icon name="map" size="sm" class="q-mr-sm text-primary" />
            Mapa Interactivo de Eventos Biométricos
            <q-icon name="location_on" size="sm" class="q-ml-sm text-secondary" />
          </div>
          <div class="text-caption text-center q-mb-md text-grey-6">
            🎯 Haz clic en los marcadores individuales para análisis detallado
            <br />
            🔍 Haz clic en los clusters (círculos con números) para resumen grupal
            <br />
            🗺️ Haz clic en cualquier área del mapa para explorar la zona
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

      <!-- Resumen del Área Seleccionada -->
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
          <!-- Header con animación -->
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
                  ? '🎯 Análisis del Evento Seleccionado'
                  : resumenArea?.clusterInfo
                  ? '🔍 Resumen del Cluster'
                  : '🗺️ Resumen del Área Seleccionada'
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

          <!-- Loading con mejor animación -->
          <div v-if="cargandoResumen" class="text-center q-py-xl">
            <q-spinner-grid size="60px" color="primary" class="q-mb-md" />
            <div class="text-h6 q-mb-sm text-primary">Analizando datos...</div>
            <div class="text-caption text-grey-6">Procesando información geográfica</div>
          </div>

          <div v-else-if="resumenArea" class="animated-content">
            <!-- Información del evento focal con mejor diseño -->
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

            <!-- 🆕 Información del cluster con diseño mejorado -->
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
                  Análisis del Cluster
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
                        <q-item-label class="text-weight-medium">Usuarios Únicos</q-item-label>
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
                        <q-item-label class="text-weight-medium">Dispositivos Únicos</q-item-label>
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
                        <q-item-label class="text-weight-medium">Días con Actividad</q-item-label>
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
                        <q-item-label class="text-weight-medium">Ubicación</q-item-label>
                        <q-item-label caption class="text-white">{{
                          resumenArea.clusterInfo.ubicacion
                        }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </div>
                </div>
              </q-card>
            </div>

            <!-- Sección de métricas principales con mejor diseño -->
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
                        ? 'Eventos en el Área'
                        : resumenArea.clusterInfo
                        ? 'Eventos en el Cluster'
                        : 'Total de Eventos'
                    }}
                  </div>
                </q-card>
              </div>

              <!-- Gráfico de Estados -->
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

                  <!-- Contenedor del gráficUsuario:
o con mejor control -->
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

                  <!-- Leyenda dinámica sincronizada -->
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

              <!-- Información adicional -->
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
                        ? 'Dispositivos en el Área'
                        : resumenArea.clusterInfo
                        ? 'Dispositivos en el Cluster'
                        : 'Tipos de Eventos'
                    }}
                  </div>

                  <!-- Contenedor scrolleable con mejor diseño -->
                  <div
                    class="custom-scroll flex-grow-1"
                    style="max-height: 220px; overflow-y: auto; padding-right: 4px"
                  >
                    <q-list dense dark style="padding: 0">
                      <!-- Si es un análisis de evento específico, mostrar dispositivos -->
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

                      <!-- Si es un análisis de área general, mostrar tipos -->
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

            <!-- Gráfico adicional para clusters -->
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
                  <canvas id="timelineChart" style="height: 200px"></canvas>
                </div>
              </q-card>
            </div>

            <!-- Eventos recientes con mejor diseño -->
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
                      label="Ver más eventos"
                      icon="expand_more"
                      @click="mostrarMasEventos = !mostrarMasEventos"
                    />
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Sección de información adicional -->
            <div class="row q-gutter-md q-mt-lg">
              <!-- Información de coordenadas y radio -->
              <div class="col-12 col-lg-6">
                <q-card
                  dark
                  class="info-geo-card q-pa-md full-height"
                  style="
                    background: linear-gradient(135deg, #0f766e 0%, #0d9488 100%);
                    border-radius: 16px;
                    box-shadow: 0 8px 32px rgba(15, 118, 110, 0.3);
                  "
                >
                  <q-card-section class="q-pa-none">
                    <div class="text-h6 q-mb-md text-center text-weight-bold">
                      <q-icon name="place" class="q-mr-sm" />
                      Información Geográfica
                    </div>

                    <!-- Layout responsivo para información geográfica -->
                    <div
                      class="column q-gutter-md"
                      v-if="resumenArea.ubicacion && resumenArea.radio"
                    >
                      <!-- Coordenadas del centro -->
                      <div class="geo-info-item">
                        <div class="row items-center q-mb-xs">
                          <q-icon name="my_location" size="sm" color="white" class="q-mr-sm" />
                          <span class="text-body2 text-weight-medium">Centro de Análisis</span>
                        </div>
                        <div class="q-pl-md">
                          <div class="text-caption text-grey-3">
                            Latitud: {{ resumenArea.ubicacion.lat?.toFixed(6) || 'No disponible' }}
                          </div>
                          <div class="text-caption text-grey-3">
                            Longitud: {{ resumenArea.ubicacion.lng?.toFixed(6) || 'No disponible' }}
                          </div>
                        </div>
                      </div>

                      <!-- Radio de cobertura -->
                      <div class="geo-info-item">
                        <div class="row items-center justify-between q-mb-xs">
                          <div class="row items-center">
                            <q-icon
                              name="radio_button_checked"
                              size="sm"
                              color="white"
                              class="q-mr-sm"
                            />
                            <span class="text-body2 text-weight-medium">Radio de Cobertura</span>
                          </div>
                          <q-chip
                            color="teal"
                            text-color="white"
                            :label="`${Math.round(resumenArea.radio * 111 * 1000)} m`"
                            size="sm"
                            class="text-weight-bold"
                          />
                        </div>
                      </div>

                      <!-- Área total -->
                      <div class="geo-info-item">
                        <div class="row items-center justify-between">
                          <div class="row items-center">
                            <q-icon name="map" size="sm" color="white" class="q-mr-sm" />
                            <span class="text-body2 text-weight-medium">Área Total</span>
                          </div>
                          <q-chip
                            color="cyan"
                            text-color="white"
                            :label="`${
                              Math.round(Math.PI * Math.pow(resumenArea.radio * 111, 2) * 100) / 100
                            } km²`"
                            size="sm"
                            class="text-weight-bold"
                          />
                        </div>
                      </div>
                    </div>

                    <!-- Estado cuando no hay datos geográficos -->
                    <div v-else class="text-center q-py-md">
                      <q-icon name="location_off" size="48px" color="grey-5" class="q-mb-sm" />
                      <div class="text-body2 text-grey-4">
                        Selecciona un área en el mapa para ver información geográfica
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>

              <!-- Estadísticas de usuario adicionales -->
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
                      Análisis de Actividad
                    </div>

                    <!-- Layout responsivo para estadísticas -->
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
                              <div class="text-body2 text-weight-medium">Usuarios Únicos</div>
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

                    <!-- Estado cuando no se ha seleccionado área -->
                    <div v-else class="text-center q-py-md">
                      <q-icon name="analytics" size="48px" color="grey-5" class="q-mb-sm" />
                      <div class="text-body2 text-grey-4">
                        Selecciona un área en el mapa para ver estadísticas de actividad
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
import { ref, onMounted, nextTick } from 'vue'
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
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

Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  DoughnutController,
  LinearScale,
  Tooltip,
  ArcElement,
  PieController
)

const tiemposFuncionalidad = ref([])

// const kpis = [
//   { label: 'Duración Promedio', value: '520 seg', icon: 'schedule', color: 'text-info' },
//   { label: 'Funcionalidad más usada', value: 'Validación Facial', icon: 'insights', color: 'text-accent' },
//   { label: 'Día con más uso', value: '2025-06-28', icon: 'event', color: 'text-positive' },
//   { label: 'Repeticiones por Día', value: '12', icon: 'repeat', color: 'text-warning' }
// ]

const filtroFechasStore = useFiltroFechasStore()

// Función para actualizar todos los datos cuando cambien los filtros
const actualizarDatos = async () => {
  console.log(
    '📅 Actualizando datos con nuevas fechas:',
    filtroFechasStore.obtenerFechasFormateadas()
  )

  // Actualizar eventos primero para el timeline
  try {
    const filtros = filtroFechasStore.obtenerFechasFormateadas()
    const eventosData = await getEventosBiometricosPorFiltro(filtros)
    eventos.value = eventosData
    console.log('📊 Eventos actualizados para timeline:', eventosData?.length || 0)
  } catch (error) {
    console.error('Error al cargar eventos:', error)
  }

  // Actualizar gráficos y datos
  await renderDeviceChart()
  renderPiePorFuncionalidad()
  crearGraficoTimeline() // Agregar el timeline

  // Actualizar datos de duración promedio
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
}

const fallosPorEstado = ref([])

// Variables para el resumen del mapa
const resumenArea = ref(null)
const mostrarResumen = ref(false)
const cargandoResumen = ref(false)
const eventoSeleccionado = ref(null)
const eventosEnArea = ref([])
const mostrarMasEventos = ref(false)
const eventos = ref([]) // Variable global para almacenar todos los eventos

const barChart = ref(null)
const chart = ref(null)
const deviceChart = ref(null)

const funcionalidades = ref([])
const pieRefs = ref({})

function setPieRef(clave, el) {
  if (el) pieRefs.value[clave] = el
}

// Función para hacer scroll hacia el resumen
const scrollToResumen = () => {
  const resumenElement = document.querySelector('.resumen-card')
  if (resumenElement) {
    resumenElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }
}

// Función para cerrar el resumen con animación
const cerrarResumen = () => {
  // Limpiar gráficos existentes de manera segura
  if (window.graficoResumenArea && typeof window.graficoResumenArea.destroy === 'function') {
    try {
      window.graficoResumenArea.destroy()
      console.log('✅ Gráfico de resumen destruido correctamente')
    } catch (error) {
      console.warn('⚠️ Error al destruir gráfico de resumen:', error)
    }
    window.graficoResumenArea = null
  }

  if (window.timelineChart && typeof window.timelineChart.destroy === 'function') {
    try {
      window.timelineChart.destroy()
      console.log('✅ Gráfico timeline destruido correctamente')
    } catch (error) {
      console.warn('⚠️ Error al destruir gráfico timeline:', error)
    }
    window.timelineChart = null
  }

  mostrarResumen.value = false
  mostrarMasEventos.value = false
  resumenArea.value = null
}

// Función para formatear fechas
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

// Función para reintentar carga
const reintentarCarga = () => {
  if (eventoSeleccionado.value) {
    mostrarResumenEvento(eventoSeleccionado.value, eventos.value)
  } else {
    cerrarResumen()
  }
}

// Función para obtener color según el estado (sincronizada con el gráfico)
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

// Función para convertir "HH:MM:SS" en segundos
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

// Función para convertir coordenadas GPS en nombre de estado
// (usa tu reverse-geocoding favorito; aquí un ejemplo con Nominatim)
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

// Función para obtener resumen de un área específica del mapa
const obtenerResumenArea = async (lat, lng) => {
  try {
    cargandoResumen.value = true
    mostrarResumen.value = true

    console.log('📍 Obteniendo resumen para área:', { lat, lng })

    // Obtener filtros actuales del store
    const filtros = {
      fechaInicio: filtroFechasStore.fechaInicio,
      fechaFin: filtroFechasStore.fechaFin,
    }

    const resumen = await getResumenLogsPorArea(lat, lng, 0.02, filtros) // Radio de ~2km aprox
    resumenArea.value = resumen

    console.log('📊 Resumen obtenido:', resumen)

    // Crear gráfico con los datos del resumen después de un breve delay
    await nextTick()
    // Usar setTimeout para asegurar que el DOM se haya renderizado completamente
    setTimeout(() => {
      crearGraficoResumen()
      crearGraficoTimeline()
      // Hacer scroll hacia el resumen después de crear los gráficos
      scrollToResumen()
    }, 100)
  } catch (error) {
    console.error('❌ Error al obtener resumen del área:', error)
    resumenArea.value = {
      totalEventos: 0,
      eventosPorTipo: [],
      eventosPorEstado: [],
      ubicacion: { lat, lng },
      error: 'Error al cargar datos del área',
    }
  } finally {
    cargandoResumen.value = false
  }
}

// Función para mostrar resumen de un evento específico al hacer clic en un marcador
const mostrarResumenEvento = async (eventoClicado, todosLosEventos) => {
  try {
    cargandoResumen.value = true
    mostrarResumen.value = true

    console.log('🎯 Analizando evento seleccionado:', eventoClicado)

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

    console.log('📍 Eventos en área cercana:', eventosEnRadio.length)

    // Analizar los datos para el resumen
    const analisisEventos = analizarEventosEnArea(eventosEnRadio, eventoClicado)
    resumenArea.value = analisisEventos

    console.log('📊 Análisis completado:', analisisEventos)

    // Crear gráfico con los datos del análisis después de un breve delay
    await nextTick()
    // Usar setTimeout para asegurar que el DOM se haya renderizado completamente
    setTimeout(() => {
      crearGraficoResumen()
      crearGraficoTimeline()
      // Hacer scroll hacia el resumen después de crear los gráficos
      scrollToResumen()
    }, 100)
  } catch (error) {
    console.error('❌ Error al analizar evento:', error)
    resumenArea.value = {
      totalEventos: 1,
      eventosPorTipo: [],
      eventosPorEstado: [],
      ubicacion: { lat: 0, lng: 0 },
      error: 'Error al cargar análisis del evento',
    }
  } finally {
    cargandoResumen.value = false
  }
}

// 🆕 Función para mostrar resumen de un cluster al hacer clic en él
const mostrarResumenCluster = async (eventosDelCluster, posicionCluster) => {
  try {
    cargandoResumen.value = true
    mostrarResumen.value = true

    console.log('🔍 Analizando cluster con eventos:', eventosDelCluster.length)
    console.log('📍 Posición del cluster:', posicionCluster)

    // No hay un evento focal específico, es análisis de cluster
    eventoSeleccionado.value = null
    eventosEnArea.value = eventosDelCluster

    // Analizar todos los eventos del cluster
    const analisisCluster = analizarEventosEnAreaCluster(eventosDelCluster, posicionCluster)

    // Agregar información específica del cluster
    analisisCluster.tipoAnalisis = 'cluster'
    analisisCluster.totalEventos = eventosDelCluster.length

    resumenArea.value = analisisCluster

    console.log('📊 Análisis de cluster completado:', analisisCluster)

    // Crear gráfico con los datos del análisis después de un breve delay
    await nextTick()
    // Usar setTimeout para asegurar que el DOM se haya renderizado completamente
    setTimeout(() => {
      crearGraficoResumen()
      crearGraficoTimeline()
      // Hacer scroll hacia el resumen después de crear los gráficos
      scrollToResumen()
    }, 100)
  } catch (error) {
    console.error('❌ Error al analizar cluster:', error)
    resumenArea.value = {
      error: 'Error al cargar análisis del cluster',
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

// Función para analizar eventos en un área y generar estadísticas
const analizarEventosEnArea = (eventos, eventoFocal) => {
  console.log('🔍 Analizando', eventos.length, 'eventos en el área')

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

  // Convertir a arrays para los gráficos
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

// 🆕 Función específica para analizar eventos de un cluster (sin evento focal)
const analizarEventosEnAreaCluster = (eventos, posicionCluster) => {
  console.log('🔍 Analizando cluster con', eventos.length, 'eventos')

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

    // Por fecha (para análisis temporal)
    const fecha = evento.fechaHoraDia
      ? new Date(evento.fechaHoraDia).toLocaleDateString()
      : evento.fecha
      ? new Date(evento.fecha).toLocaleDateString()
      : 'Sin fecha'
    fechas[fecha] = (fechas[fecha] || 0) + 1
  })

  // Convertir a arrays para los gráficos
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

  // Encontrar el tipo de evento más común para mostrar como principal
  const tipoMasComun =
    tiposArray.length > 0
      ? tiposArray.reduce((prev, current) => (prev.cantidad > current.cantidad ? prev : current))
      : { tipo: 'No especificado', cantidad: 0 }

  // Encontrar el estado más común
  const estadoMasComun =
    estadosArray.length > 0
      ? estadosArray.reduce((prev, current) => (prev.cantidad > current.cantidad ? prev : current))
      : { estado: 'No especificado', cantidad: 0 }

  return {
    totalEventos: eventos.length,
    // Información del cluster en lugar de evento focal
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

// Función para crear gráfico del resumen del área
const crearGraficoResumen = () => {
  console.log('📊 Creando gráfico de resumen...')

  const canvas = document.getElementById('graficoResumenArea')
  if (!canvas) {
    console.warn('❌ No se encontró el canvas graficoResumenArea')
    // Intentar de nuevo después de un breve delay
    setTimeout(() => {
      const retryCanvas = document.getElementById('graficoResumenArea')
      if (retryCanvas) {
        console.log('✅ Canvas encontrado en reintento, creando gráfico...')
        crearGraficoResumenInterno(retryCanvas)
      } else {
        console.error('❌ Canvas graficoResumenArea aún no disponible después del reintento')
      }
    }, 200)
    return
  }

  crearGraficoResumenInterno(canvas)
}

const crearGraficoResumenInterno = (canvas) => {
  if (!resumenArea.value) {
    console.warn('❌ No hay datos en resumenArea.value')
    return
  }

  console.log('📊 Datos del resumen:', resumenArea.value)
  console.log('📊 Estados disponibles:', resumenArea.value.eventosPorEstado)

  const ctx = canvas.getContext('2d')

  // Destruir gráfico anterior si existe (verificar que sea una instancia válida)
  if (window.graficoResumenArea && typeof window.graficoResumenArea.destroy === 'function') {
    try {
      window.graficoResumenArea.destroy()
      console.log('✅ Gráfico anterior destruido correctamente')
    } catch (error) {
      console.warn('⚠️ Error al destruir gráfico anterior:', error)
    }
  }
  window.graficoResumenArea = null

  if (!resumenArea.value.eventosPorEstado || resumenArea.value.eventosPorEstado.length === 0) {
    console.warn('❌ No hay eventos por estado para mostrar')

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

    // Crear un gráfico vacío elegante
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

  console.log('✅ Creando gráfico con datos:', resumenArea.value.eventosPorEstado)

  // Mapear colores según el tipo de estado para mejor interpretación visual
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
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true,
            pointStyle: 'circle',
            font: {
              size: 12,
              family: 'Inter, sans-serif',
              weight: '500',
            },
            color: '#374151',
          },
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

// Crear gráfico de timeline para mostrar la evolución temporal de los clusters
function crearGraficoTimeline() {
  console.log('⏰ Creando gráfico timeline...')
  const ctx = document.getElementById('timelineChart')
  if (!ctx) {
    console.warn('❌ No se encontró el canvas timelineChart')
    // Intentar de nuevo después de un breve delay
    setTimeout(() => {
      const retryCanvas = document.getElementById('timelineChart')
      if (retryCanvas) {
        console.log('✅ Canvas timeline encontrado en reintento, creando gráfico...')
        crearGraficoTimelineInterno(retryCanvas)
      } else {
        console.error('❌ Canvas timelineChart aún no disponible después del reintento')
      }
    }, 200)
    return
  }

  crearGraficoTimelineInterno(ctx)
}

function crearGraficoTimelineInterno(ctx) {
  console.log('📊 Eventos disponibles para timeline:', eventos.value?.length || 0)

  // Agrupar eventos por día
  const eventosPorDia = {}
  const diasCompletos = []

  // Generar los últimos 30 días
  for (let i = 29; i >= 0; i--) {
    const dia = new Date()
    dia.setDate(dia.getDate() - i)
    dia.setHours(0, 0, 0, 0)
    const diaKey = dia.toISOString().slice(0, 10) // Solo la fecha YYYY-MM-DD
    eventosPorDia[diaKey] = 0
    diasCompletos.push(diaKey)
  }

  // Contar eventos por día
  if (eventos.value && eventos.value.length > 0) {
    eventos.value.forEach((evento) => {
      if (evento.fecha || evento.fechaHoraDia) {
        const fechaEvento = evento.fechaHoraDia || evento.fecha
        const diaEvento = new Date(fechaEvento).toISOString().slice(0, 10)
        if (Object.prototype.hasOwnProperty.call(eventosPorDia, diaEvento)) {
          eventosPorDia[diaEvento]++
        }
      }
    })
  }

  console.log('📊 Eventos por día calculados:', eventosPorDia)

  // Destruir gráfico anterior si existe (verificar que sea una instancia válida)
  if (window.timelineChart && typeof window.timelineChart.destroy === 'function') {
    try {
      window.timelineChart.destroy()
      console.log('✅ Gráfico timeline anterior destruido correctamente')
    } catch (error) {
      console.warn('⚠️ Error al destruir gráfico timeline anterior:', error)
    }
  }
  window.timelineChart = null

  window.timelineChart = new Chart(ctx, {
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
          label: 'Eventos por Día',
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
              return `Día: ${context[0].label}`
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

    console.log('🗺️ Cargando eventos para el mapa con filtros:', filtros)
    const eventosData = await getEventosBiometricosPorFiltro(filtros)
    eventos.value = eventosData // Almacenar en variable global

    console.log('📊 Eventos obtenidos:', eventosData?.length || 0)

    if (!eventosData || eventosData.length === 0) {
      console.warn('⚠️ No se encontraron eventos para mostrar en el mapa')
      // Mostrar mensaje al usuario de que no hay datos
      return
    }

    const eventosConGps = eventosData
      .filter((e) => {
        // Verificar que el evento tenga GPS válido
        if (!e.gps || typeof e.gps !== 'string') return false
        if (!e.gps.includes(',')) return false

        const coords = e.gps.split(',')
        if (coords.length !== 2) return false

        const [lat, lng] = coords.map(parseFloat)
        return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
      })
      .map((e) => {
        const [lat, lng] = e.gps.split(',').map(parseFloat)
        console.log('🗺️ Procesando evento:', {
          gps: e.gps,
          lat,
          lng,
          usuario: e.usuario?.usuario || e.usuario,
          evento: e.tipoEvento?.detalle || e.tipoEvento,
        })
        return {
          lat,
          lng,
          usuario: e.usuario?.usuario || e.usuario || 'Usuario desconocido',
          detalle: e.tipoEvento?.detalle || e.tipoEvento || 'Sin especificar',
          descripcion: e.resultadoDescripcion || e.resultadoEvento || 'Sin descripción',
          fecha: e.fechaHoraDia
            ? new Date(e.fechaHoraDia).toLocaleString()
            : e.fecha
            ? new Date(e.fecha).toLocaleString()
            : 'Fecha no disponible',
          // Mantener referencia al evento original completo para análisis
          eventoOriginal: e,
        }
      })

    console.log('🗺️ Eventos con GPS válido:', eventosConGps.length)
    const map = L.map('mapaEventos').setView([19.4326, -99.1332], 5)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map)

    // Agregar listener para clicks en el mapa
    map.on('click', async (e) => {
      const { lat, lng } = e.latlng
      console.log('🖱️ Click en mapa:', { lat, lng })
      await obtenerResumenArea(lat, lng)
    })

    const markers = L.markerClusterGroup({
      // Configuración mejorada del cluster para mejor experiencia
      chunkedLoading: true,
      maxClusterRadius: 60, // Radio reducido para menos agrupación
      spiderfyOnMaxZoom: true, // Reactivar spiderfy para mostrar marcadores individuales
      showCoverageOnHover: false, // Desactivar cobertura al hacer hover para menos distracción
      zoomToBoundsOnClick: true, // Permitir zoom al hacer clic (funcionalidad original)
      spiderfyOnEveryZoom: false, // Reducir spiderfy para menos animación
      removeOutsideVisibleBounds: false, // Mantener marcadores para mejor rendimiento
      animate: false, // Desactivar animaciones para menos exageración
      animateAddingMarkers: false, // Desactivar animación al agregar marcadores
      disableClusteringAtZoom: 15, // Desagrupar a nivel de zoom alto para mejor detalle
      spiderfyDistanceMultiplier: 1.2, // Reducir distancia del spiderfy

      // Personalización visual de clusters
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

    // 🆕 Mejorar evento de clic en clusters
    markers.on('clusterclick', async (event) => {
      console.log('🔍 Click en cluster detectado:', event)

      // Evitar el comportamiento por defecto solo temporalmente
      L.DomEvent.stopPropagation(event)

      const cluster = event.layer
      const childMarkers = cluster.getAllChildMarkers()

      console.log(`📍 Cluster contiene ${childMarkers.length} marcadores`)

      // Si el cluster tiene pocos elementos, hacer zoom normalmente
      if (childMarkers.length <= 5) {
        // Permitir comportamiento normal de zoom
        cluster.zoomToBounds()
        return
      }

      // Para clusters grandes, mostrar análisis
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

    // Mejorar visualización de marcadores individuales
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
        " title="Click para más detalles">
          🌍
        </div>`,
        className: 'custom-marker-location',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      })

      const marker = L.marker([e.lat, e.lng], { icon: customIcon }).bindTooltip(
        `Click para más detalles`,
        {
          permanent: false,
          direction: 'top',
          offset: [0, -10],
          className: 'custom-tooltip',
          sticky: true,
        }
      )

      // Efecto hover más estable - sin cambio de tamaño brusco
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
        console.log(
          '🎯 Click en marcador - datos del evento procesado:',
          JSON.stringify(e, null, 2)
        )

        // Prevenir propagación al mapa
        L.DomEvent.stopPropagation(markerEvent)

        // Mostrar análisis del evento específico
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
    // ←–––––– NUEVO: agrupamos solo los FALLIDO y actualizamos la lista
    try {
      const agrupados = await agruparFallosPorEstado(eventos.value)
      fallosPorEstado.value = agrupados
    } catch (err) {
      console.error('Error al agrupar fallos por estado:', err)
    }
  } catch (error) {
    console.error('Error al cargar eventos para el mapa:', error)
  }

  // No crear timeline aquí porque el canvas solo existe cuando se muestra el resumen
  console.log('✅ Mapa y eventos cargados correctamente')
})

// Función para renderizar gráficas
function renderCharts() {
  new Chart(barChart.value, {
    type: 'bar',
    data: {
      labels: tiemposFuncionalidad.value.map((t) => t.funcionalidad),
      datasets: [
        {
          label: 'Segundos Totales',
          data: tiemposFuncionalidad.value.map((t) => t.totalSegundos),
          backgroundColor: '#26A69A',
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { tooltip: { enabled: true } },
      scales: {
        x: { ticks: { color: '#ccc' }, grid: { color: '#444' } },
        y: { ticks: { color: '#ccc' }, grid: { color: '#444' } },
      },
    },
  })

  new Chart(chart.value, {
    type: 'doughnut',
    data: {
      labels: tiemposFuncionalidad.value.map((t) => t.funcionalidad),
      datasets: [
        {
          label: 'Distribución',
          data: tiemposFuncionalidad.value.map((t) => t.totalSegundos),
          backgroundColor: ['#26A69A', '#7E57C2', '#1976D2', '#66BB6A', '#FFA726'], // Colores más acordes al flujo
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { tooltip: { enabled: true }, legend: { labels: { color: '#ccc' } } },
    },
  })
}
async function renderDeviceChart() {
  try {
    const payload = {
      fechaInicio: filtroFechasStore.fechaInicio,
      fechaFin: filtroFechasStore.fechaFin,
    }
    const data = await getDispositivosMasUsados(payload)

    const labels = data.map((d) => d.dispositivo)
    const valores = data.map((d) => d.total)

    new Chart(deviceChart.value, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Total de usos',
            data: valores,
            backgroundColor: '#26A69A',
          },
        ],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        plugins: {
          tooltip: { enabled: true },
          legend: { display: false },
        },
        scales: {
          x: {
            ticks: { color: '#ccc' },
            grid: { color: '#444' },
          },
          y: {
            ticks: { color: '#ccc' },
            grid: { color: '#444' },
          },
        },
      },
    })
  } catch (error) {
    console.error('Error al cargar dispositivos:', error)
  }
}

// Nueva función para graficar funcionalidades por tipo de evento
function renderPiePorFuncionalidad() {
  getFuncionalidadesEstado({
    fechaInicio: filtroFechasStore.fechaInicio,
    fechaFin: filtroFechasStore.fechaFin,
  }).then(async (data) => {
    funcionalidades.value = data
    await nextTick() // Espera a que los canvas estén en el DOM

    const colores = ['#f44336', '#ff9800', '#2196f3', '#4caf50']
    const tipos = ['total_fallido', 'total_cancelado', 'total_error', 'total_exito']
    const tipoLabels = ['Fallido', 'Cancelado', 'Error', 'Éxito']

    data.forEach((func) => {
      const valores = tipos.map((tipo) => func[tipo])
      const ref = pieRefs.value[func.clave]
      if (ref) {
        new Chart(ref, {
          type: 'pie',
          data: {
            labels: tipoLabels,
            datasets: [
              {
                label: func.clave,
                data: valores,
                backgroundColor: colores,
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: { labels: { color: '#ccc' } },
              tooltip: { enabled: true },
            },
          },
        })
      }
    })
  })
}
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
  width: 300px !important;
  height: 300px !important;
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

/* Contenedores de gráficos */
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

/* Estilos específicos del mapa */
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

/* Personalización de clusters del mapa */
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

/* Mejoras visuales para el contenedor de información */
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

/* Ajustes para gráficos responsivos */
.grafico-card {
  min-height: 280px !important;
}

/* Estilos para la información geográfica responsiva */
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

/* Estilos para estadísticas de actividad */
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

/* Responsividad mejorada para móviles */
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
}

.chart-container canvas {
  max-width: 100% !important;
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
    min-height: 250px !important;
  }

  .chart-container {
    min-height: 140px !important;
    max-height: 160px !important;
  }

  .text-h6 {
    font-size: 1rem !important;
  }

  .text-caption {
    font-size: 0.7rem !important;
  }
}
</style>
