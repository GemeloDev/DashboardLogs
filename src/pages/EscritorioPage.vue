<template>
  <q-page class="escritorio-page text-white">
    <!-- Header de Escritorio -->
    <header class="dashboard-header q-py-md">
      <div class="dashboard-header__wrap">
        <q-card flat bordered class="dashboard-hero__title-card text-white">
          <h1 class="hero-title">
            {{ t('dashboard.titlePageDashboard') }}
            <br />
            <span class="color-orange-santoro">{{ t('dashboard.subtitlePageDashboard') }}</span>
          </h1>
        </q-card>
      </div>
    </header>

    <!-- Analytics: KPIs, Sistemas y Top Fricción -->
    <div class="container q-px-md q-pb-xl">
      <div v-if="loadingAnalytics && !executiveData" class="row q-col-gutter-md q-mb-md">
        <div v-for="index in 3" :key="`analytics-skeleton-${index}`" class="col-12 col-md-4">
          <q-skeleton dark type="rect" height="88px" class="rounded-borders" />
        </div>
      </div>

      <!-- Filtro de Rango de Fechas -->
      <div class="row q-mb-md">
        <div class="col-12">
          <DateRangeFilter v-model="dateRange" @update:date-range="onDateRangeChange" />
        </div>
      </div>

      <AttendanceAnomaliesWidget :anomalies="attendanceAnomaliesData" :loading="dashboardLoading" />

      <!-- Resumen Gerencial en Vivo -->
      <div class="row q-mb-xl">
        <div class="col-12">
          <q-card
            flat
            bordered
            class="live-summary-card"
            :class="healthSurfaceClass(activeSystemHealth)"
          >
            <q-card-section class="row items-center q-col-gutter-md">
              <div class="col-auto">
                <q-icon
                  :name="liveSummary.icon"
                  :color="liveSummary.color"
                  size="48px"
                  class="live-summary-card__icon"
                />
              </div>
              <div class="col">
                <div class="text-h5 text-weight-bold text-white">
                  {{ liveSummary.title }}
                </div>
                <div class="text-subtitle1 text-grey-4 q-mt-xs">
                  {{ liveSummary.text }}
                </div>
              </div>
              <div class="col-auto">
                <div class="row q-gutter-sm justify-end">
                  <q-btn
                    color="negative"
                    text-color="white"
                    icon="picture_as_pdf"
                    label="Exportar PDF"
                    no-caps
                    unelevated
                    class="live-summary-card__btn"
                    :loading="exportingPdf"
                    @click="exportToPdf(currentReportData)"
                  />
                  <q-btn
                    color="positive"
                    text-color="white"
                    icon="description"
                    label="Exportar Excel"
                    no-caps
                    unelevated
                    class="live-summary-card__btn"
                    :loading="exportingExcel"
                    @click="exportToExcel(currentReportData)"
                  />
                  <q-btn
                    color="orange-9"
                    text-color="white"
                    icon="share"
                    label="Copiar Reporte Rápido"
                    no-caps
                    unelevated
                    class="live-summary-card__btn"
                    @click="copyQuickReport"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- KPI Cards -->
      <div v-if="showDashboardSkeletons" class="row q-col-gutter-md q-mb-lg">
        <div v-for="index in 4" :key="`kpi-skeleton-${index}`" class="col-12 col-sm-6 col-md-3">
          <q-skeleton dark type="rect" height="112px" class="rounded-borders" />
        </div>
      </div>
      <div v-else class="row q-col-gutter-md q-mb-lg">
        <!-- KPI 1: Salud del Sistema -->
        <div class="col-12 col-sm-6 col-md-3">
          <q-card
            flat
            class="bg-dark text-white border-subtle kpi-card"
            :class="healthSurfaceClass(overallHealth)"
          >
            <q-card-section class="kpi-card__section">
              <div class="text-caption text-grey-5 text-uppercase letter-spacing-sm">
                {{ t('dashboard.overallHealth') }}
                <q-icon name="info" size="14px" class="q-ml-xs text-grey-6" style="cursor: pointer">
                  <q-tooltip
                    class="bg-grey-9 text-caption shadow-4 rounded-borders q-pa-sm"
                    style="max-width: 280px; font-size: 12px; line-height: 1.4"
                    anchor="top middle"
                    self="bottom middle"
                  >
                    Calificación global del estado operativo de todos los sistemas. Evalúa si el
                    porcentaje general de errores representa un riesgo para las operaciones.
                  </q-tooltip>
                </q-icon>
              </div>
              <div class="kpi-badge-wrap q-mt-sm">
                <q-badge
                  :color="healthColor(overallHealth)"
                  class="kpi-health-badge text-weight-bold"
                >
                  <span class="kpi-pulse" :class="healthPulseClass(overallHealth)" />
                  {{ healthDisplayLabel(overallHealth) }}
                </q-badge>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- KPI 2: Volumen Total -->
        <div class="col-12 col-sm-6 col-md-3">
          <q-card
            flat
            class="bg-dark text-white border-subtle kpi-card cursor-pointer"
            @click="showEventsModal = true"
          >
            <q-tooltip>Haz clic para ver el desglose detallado</q-tooltip>
            <q-card-section class="kpi-card__section">
              <div class="row items-center justify-between">
                <div class="text-caption text-grey-5 text-uppercase letter-spacing-sm">
                  {{ t('dashboard.totalEvents') }}
                  <q-icon
                    name="info"
                    size="14px"
                    class="q-ml-xs text-grey-6"
                    style="cursor: pointer"
                  >
                    <q-tooltip
                      class="bg-grey-9 text-caption shadow-4 rounded-borders q-pa-sm"
                      style="max-width: 280px; font-size: 12px; line-height: 1.4"
                      anchor="top middle"
                      self="bottom middle"
                    >
                      Suma de todas las acciones, registros, inicios de sesión y peticiones
                      realizadas por los usuarios en el periodo seleccionado.
                    </q-tooltip>
                  </q-icon>
                </div>
                <q-icon name="analytics" size="22px" class="text-orange" />
              </div>
              <div class="text-h4 text-bold q-mt-sm">
                {{ formatNumber(selectedPeriodTotalEvents) }}
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- KPI 3: Tasa de Error -->
        <div class="col-12 col-sm-6 col-md-3">
          <q-card flat class="bg-dark text-white border-subtle kpi-card">
            <q-card-section class="kpi-card__section">
              <div class="text-caption text-grey-5 text-uppercase letter-spacing-sm">
                {{ t('dashboard.globalErrorRate') }}
                <q-icon name="info" size="14px" class="q-ml-xs text-grey-6" style="cursor: pointer">
                  <q-tooltip
                    class="bg-grey-9 text-caption shadow-4 rounded-borders q-pa-sm"
                    style="max-width: 280px; font-size: 12px; line-height: 1.4"
                    anchor="top middle"
                    self="bottom middle"
                  >
                    Porcentaje de operaciones que fallaron o no pudieron completarse con éxito
                    respecto al total de eventos procesados.
                  </q-tooltip>
                </q-icon>
              </div>
              <div
                class="text-h4 text-bold q-mt-sm"
                :class="errorRateColorClass(dynamicHealth.errorRate)"
              >
                {{ dynamicHealth.errorRate ?? 0 }}%
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- KPI 4: Casos Afectados -->
        <div class="col-12 col-sm-6 col-md-3">
          <q-card
            flat
            class="bg-dark text-white border-subtle kpi-card cursor-pointer"
            @click="showCasesModal = true"
          >
            <q-tooltip>Haz clic para ver el desglose detallado</q-tooltip>
            <q-card-section class="kpi-card__section">
              <div class="row items-center justify-between">
                <div class="text-caption text-grey-5 text-uppercase letter-spacing-sm">
                  {{ t('dashboard.activeCases') }}
                  <q-icon
                    name="info"
                    size="14px"
                    class="q-ml-xs text-grey-6"
                    style="cursor: pointer"
                  >
                    <q-tooltip
                      class="bg-grey-9 text-caption shadow-4 rounded-borders q-pa-sm"
                      style="max-width: 280px; font-size: 12px; line-height: 1.4"
                      anchor="top middle"
                      self="bottom middle"
                    >
                      Cantidad de problemas o incidentes que actualmente están registrados y
                      requieren seguimiento por el equipo técnico.
                    </q-tooltip>
                  </q-icon>
                </div>
                <q-icon name="devices_other" size="22px" class="text-cyan" />
              </div>
              <div class="text-h4 text-bold q-mt-sm">
                {{ formatNumber(activeCasesList.length) }}
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <div class="row q-col-gutter-lg">
        <!-- Salud del Sistema Activo -->
        <div class="col-12 col-md-7">
          <q-card flat class="bg-dark text-white border-subtle section-card">
            <q-card-section class="section-card__header">
              <div class="text-h6">
                Salud del Sistema Activo
                <q-icon name="info" size="16px" class="q-ml-xs text-grey-6" style="cursor: pointer">
                  <q-tooltip
                    class="bg-grey-9 text-caption shadow-4 rounded-borders q-pa-sm"
                    style="max-width: 280px; font-size: 12px; line-height: 1.4"
                    anchor="top middle"
                    self="bottom middle"
                  >
                    Estado operativo del sistema seleccionado. Muestra si está Estable (Verde), en
                    Alerta (Naranja) o Crítico (Rojo).
                  </q-tooltip>
                </q-icon>
              </div>
              <div class="text-caption text-grey-5">{{ analyticsDateRangeLabel }}</div>
            </q-card-section>

            <q-card-section>
              <q-skeleton
                v-if="loadingAnalytics && !activeSystem && !dashboardStats"
                dark
                type="rect"
                height="150px"
                class="rounded-borders"
              />

              <q-card
                v-else-if="selectedSystem && (activeSystem || dashboardStats)"
                flat
                bordered
                class="system-mini-card"
                :class="healthSurfaceClass(activeSystemHealth)"
              >
                <q-card-section>
                  <div class="row items-start justify-between q-mb-sm">
                    <div>
                      <div class="text-subtitle1 text-weight-bold">
                        {{ activeSystem?.system || selectedSystem }}
                      </div>
                      <div class="text-caption text-grey-5">
                        {{ activeSystem?.systemLabel || activeSystem?.system || selectedSystem }}
                      </div>
                    </div>
                    <q-badge
                      :color="healthColor(activeSystemHealth)"
                      :label="healthDisplayLabel(activeSystemHealth)"
                      class="text-weight-bold"
                    />
                  </div>

                  <div class="row items-center q-gutter-sm q-mb-sm">
                    <div class="text-caption text-grey-5">{{ t('dashboard.errorRate') }}:</div>
                    <div class="text-subtitle2 text-weight-bold">
                      {{ activeDisplayMetrics.errorRate }}%
                    </div>
                  </div>

                  <q-linear-progress
                    :value="Math.min(activeDisplayMetrics.errorRate / 100, 1)"
                    size="10px"
                    rounded
                    :color="healthColor(activeSystemHealth)"
                    track-color="grey-8"
                    class="q-mt-sm"
                  />

                  <div class="row justify-between text-caption text-grey-5 q-mt-sm">
                    <div>{{ formatNumber(activeDisplayMetrics.errorCount) }} errores</div>
                    <div>{{ formatNumber(activeDisplayMetrics.totalEvents) }} eventos</div>
                  </div>
                </q-card-section>
              </q-card>

              <div v-else-if="!loadingAnalytics" class="text-grey-5 text-center q-py-lg">
                {{ t('dashboard.noData') }}
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Top 5 Eventos con Mayor Fricción -->
        <div class="col-12 col-md-5">
          <q-card flat class="bg-dark text-white border-subtle section-card">
            <q-card-section class="section-card__header">
              <div class="text-h6">
                {{ t('dashboard.topFrictionalEvents') }}
                <q-icon name="info" size="16px" class="q-ml-xs text-grey-6" style="cursor: pointer">
                  <q-tooltip
                    class="bg-grey-9 text-caption shadow-4 rounded-borders q-pa-sm"
                    style="max-width: 280px; font-size: 12px; line-height: 1.4"
                    anchor="top middle"
                    self="bottom middle"
                  >
                    Procesos o pantallas donde los usuarios han experimentado la mayor cantidad de
                    errores o reintentos en el periodo.
                  </q-tooltip>
                </q-icon>
              </div>
              <div class="text-caption text-grey-5">
                {{ t('dashboard.topFrictionalSubtitle') }}
              </div>
            </q-card-section>

            <q-card-section class="relative-position">
              <div v-if="loadingAnalytics && !filteredTopFrictionItems.length">
                <q-skeleton
                  v-for="index in 4"
                  :key="`friction-skeleton-${index}`"
                  dark
                  type="rect"
                  height="48px"
                  class="q-mb-sm rounded-borders"
                />
              </div>

              <q-list v-else-if="filteredTopFrictionItems.length" class="friction-list" separator>
                <q-item
                  v-for="(event, index) in filteredTopFrictionItems"
                  :key="`${event.eventCode}-${event.rank}`"
                  class="friction-item q-px-sm"
                >
                  <q-item-section avatar>
                    <q-badge :color="rankColor(event.rank)" class="rank-badge text-weight-bold">
                      #{{ event.rank }}
                    </q-badge>
                  </q-item-section>

                  <q-item-section>
                    <q-item-label class="text-weight-bold text-white">
                      {{
                        event.description && event.description !== 'Evento con fallos reportados.'
                          ? event.description
                          : getEventTitle(event.eventCode)
                      }}
                    </q-item-label>
                    <q-item-label caption class="text-grey-6">
                      <q-chip
                        size="xs"
                        color="grey-9"
                        text-color="grey-4"
                        class="q-ma-none q-ml-none"
                      >
                        {{ getEventTitle(event.eventCode) }}
                      </q-chip>
                    </q-item-label>
                    <q-item-label caption class="text-grey-5">
                      {{ event.topLocation }} · {{ event.system }}
                    </q-item-label>
                  </q-item-section>

                  <q-item-section side>
                    <div class="row items-center q-gutter-md">
                      <div class="text-center">
                        <div class="text-caption text-grey-5">{{ t('dashboard.occurrences') }}</div>
                        <div class="text-subtitle2 text-weight-bold text-orange">
                          {{ event.occurrenceCount }}
                        </div>
                      </div>
                      <div class="text-center">
                        <div class="text-caption text-grey-5">
                          <q-icon name="person" size="12px" class="q-mr-xs" />
                          {{ t('dashboard.affectedCases') }}
                        </div>
                        <div class="text-subtitle2 text-weight-bold text-white">
                          {{ event.affectedCases }}
                        </div>
                      </div>
                      <div style="width: 32px; height: 32px">
                        <q-spinner
                          v-if="activeAnalyzingIndex === index"
                          color="primary"
                          size="20px"
                          class="q-mt-sm q-ml-sm"
                        />
                        <q-btn
                          v-else
                          flat
                          round
                          dense
                          icon="auto_awesome"
                          color="primary"
                          @click="openAiDiagnosis(event, index)"
                        >
                          <q-tooltip>{{ t('dashboard.aiDiagnose') }}</q-tooltip>
                        </q-btn>
                      </div>
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>

              <div v-else-if="!loadingAnalytics" class="text-grey-5 text-center q-py-lg">
                {{ t('dashboard.noFrictionalEvents') }}
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Contenido Principal: Gráficas Enhanced -->
    <div class="container q-px-md q-pb-xl">
      <DashboardSectionsBoard />
    </div>

    <AiDiagnosisModal
      v-model="showAiDiagnosisModal"
      :event="selectedEventForDiagnosis"
      :initial-diagnosis="aiDiagnosisResult"
    />

    <q-dialog v-model="showEventsModal">
      <q-card
        class="detail-modal-card text-white"
        style="
          width: 1050px;
          max-width: 92vw;
          border-radius: 20px;
          background: #18191c;
          border: 1px solid rgba(255, 255, 255, 0.08);
        "
      >
        <q-card-section class="row items-center">
          <div>
            <div class="text-h6">Desglose de Eventos Registrados</div>
            <div class="text-caption text-grey-5">
              Mostrando {{ displayedEventsCount }} de {{ eventsPagination.rowsNumber }} eventos
              registrados · Página {{ eventsPagination.page }} de {{ eventsTotalPages }}
            </div>
          </div>
          <q-space />
          <q-btn v-close-popup flat round dense icon="close" color="grey-5" aria-label="Cerrar" />
        </q-card-section>

        <q-separator dark />

        <q-card-section class="q-pa-none">
          <q-table
            v-model:pagination="eventsPagination"
            flat
            dark
            :rows="serverEventRows"
            :columns="eventColumns"
            :loading="loadingEvents"
            row-key="id"
            :rows-per-page-options="[8, 15, 25, 50]"
            :pagination-label="
              (firstRowIndex, endRowIndex, totalRowsNumber) =>
                `${firstRowIndex}-${endRowIndex} de ${totalRowsNumber}`
            "
            rows-per-page-label="Filas por página:"
            no-data-label="No hay eventos para el periodo y sistema seleccionados."
            @request="onEventsRequest"
          >
            <template #body-cell-event="props">
              <q-td :props="props">
                <div class="ellipsis" style="max-width: 500px">
                  {{ props.row.event }}
                  <q-tooltip class="bg-grey-9 text-white">
                    {{ props.row.event }}
                  </q-tooltip>
                </div>
              </q-td>
            </template>

            <template #body-cell-status="props">
              <q-td :props="props">
                <q-badge
                  :color="props.row.failed ? 'negative' : 'positive'"
                  :label="props.row.failed ? 'Failure' : 'Success'"
                  class="q-px-sm q-py-xs"
                />
              </q-td>
            </template>
          </q-table>
        </q-card-section>

        <q-separator dark />
        <q-card-actions align="right">
          <q-btn
            v-close-popup
            rounded
            outline
            color="orange"
            label="Cerrar"
            class="q-px-md"
            style="border-radius: 12px"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showCasesModal">
      <q-card
        class="detail-modal-card text-white"
        style="
          width: 1050px;
          max-width: 92vw;
          border-radius: 20px;
          background: #18191c;
          border: 1px solid rgba(255, 255, 255, 0.08);
        "
      >
        <q-card-section class="row items-center">
          <div>
            <div class="text-h6">Casos e Incidentes Activos (Abiertos)</div>
            <div class="text-caption text-grey-5">
              {{ activeCasesCount }} activos · {{ resolvedCasesCount }} resueltos
            </div>
          </div>
          <q-space />
          <q-btn v-close-popup flat round dense icon="close" color="grey-5" aria-label="Cerrar" />
        </q-card-section>

        <q-separator dark />

        <q-tabs
          v-model="casesView"
          dense
          no-caps
          align="left"
          active-color="orange"
          indicator-color="orange"
          class="text-grey-5 q-px-md"
        >
          <q-tab name="active" :label="`Activos (${activeCasesCount})`" />
          <q-tab name="resolved" :label="`Historial de Resueltos (${resolvedCasesCount})`" />
        </q-tabs>

        <q-separator dark />

        <q-card-section class="q-pa-md cases-list-section">
          <template v-if="casesView === 'active'">
            <div
              class="row no-wrap q-pb-sm text-grey-5 text-bold text-caption"
              style="border-bottom: 1px solid rgba(255, 255, 255, 0.1)"
            >
              <div style="width: 100px; min-width: 100px">SEVERIDAD</div>
              <div style="width: 240px; min-width: 240px; padding-right: 20px">
                DISPOSITIVO Y FECHA
              </div>
              <div style="flex: 1; min-width: 250px; padding-right: 15px">
                DESCRIPCIÓN DEL INCIDENTE
              </div>
              <div class="text-right" style="width: 130px; min-width: 130px">ACCIÓN</div>
            </div>

            <q-list separator>
              <q-item
                v-for="item in activeCasesList"
                :key="item.id"
                class="row no-wrap q-px-none q-py-md items-center"
              >
                <div style="width: 100px; min-width: 100px">
                  <q-badge
                    :color="item.severity === 'CRITICAL' ? 'red-9' : 'orange-9'"
                    class="text-bold q-pa-xs"
                    style="border-radius: 8px"
                  >
                    {{ item.severity || 'ERROR' }}
                  </q-badge>
                </div>

                <div
                  class="text-grey-4 text-caption"
                  style="width: 240px; min-width: 240px; padding-right: 20px"
                >
                  <div><b>Dispositivo:</b> {{ item.deviceId || item.system }}</div>
                  <div><b>Fecha:</b> {{ item.date }}</div>
                </div>

                <div style="flex: 1; min-width: 250px; padding-right: 15px">
                  <div
                    class="text-subtitle2 text-bold text-white ellipsis cursor-pointer"
                    @click="openCaseDetails(item)"
                  >
                    {{ item.description }}
                  </div>
                </div>

                <div class="text-right" style="width: 130px; min-width: 130px">
                  <q-badge
                    v-if="item.ticketSent"
                    color="primary"
                    class="text-bold q-pa-sm"
                    style="border-radius: 8px"
                  >
                    Enviado a Ticket
                  </q-badge>
                  <q-btn
                    v-else
                    size="sm"
                    color="primary"
                    unelevated
                    no-caps
                    label="Levantar Ticket"
                    icon="confirmation_number"
                    class="q-px-sm ticket-action-btn"
                    @click.stop="openTicketDialog(item)"
                  />
                </div>
              </q-item>
            </q-list>

            <div v-if="activeCasesCount === 0" class="text-center text-grey-5 q-py-xl">
              No hay casos o incidentes abiertos.
            </div>
          </template>

          <template v-else>
            <div
              class="row no-wrap q-pb-sm text-grey-5 text-bold text-caption"
              style="border-bottom: 1px solid rgba(255, 255, 255, 0.1)"
            >
              <div style="width: 100px; min-width: 100px">ESTADO</div>
              <div style="width: 240px; min-width: 240px; padding-right: 20px">
                DISPOSITIVO Y CIERRE
              </div>
              <div style="flex: 1; min-width: 250px; padding-right: 15px">
                INCIDENTE Y CAUSA RAÍZ
              </div>
              <div class="text-right" style="width: 130px; min-width: 130px">DETALLE</div>
            </div>

            <q-list separator>
              <q-item
                v-for="item in resolvedCasesList"
                :key="item.id"
                class="row no-wrap q-px-none q-py-md items-center"
              >
                <div style="width: 100px; min-width: 100px">
                  <q-badge color="positive" class="text-bold q-pa-xs"> RESOLVED </q-badge>
                </div>

                <div
                  class="text-grey-4 text-caption"
                  style="width: 240px; min-width: 240px; padding-right: 20px"
                >
                  <div><b>Dispositivo:</b> {{ item.deviceId || item.system }}</div>
                  <div><b>Cierre:</b> {{ item.resolvedDate }}</div>
                </div>

                <div
                  class="cursor-pointer"
                  style="flex: 1; min-width: 250px; padding-right: 15px"
                  @click="openCaseDetails(item)"
                >
                  <div class="text-subtitle2 text-bold text-white ellipsis">
                    {{ item.description }}
                  </div>
                  <div class="text-caption text-grey-5 ellipsis">
                    Causa: {{ item.rootCause || 'Sin causa registrada' }}
                  </div>
                </div>

                <div class="text-right" style="width: 130px; min-width: 130px">
                  <q-btn
                    outline
                    no-caps
                    color="positive"
                    label="Ver Solución"
                    size="sm"
                    style="border-radius: 8px"
                  >
                    <q-popup-proxy>
                      <q-card class="bg-grey-10 text-white q-pa-md" style="max-width: 360px">
                        <div class="text-subtitle2 text-bold q-mb-sm">Solución registrada</div>
                        <div class="text-body2">{{ item.solutionComment }}</div>
                        <div class="text-caption text-grey-5 q-mt-md">
                          Resuelto por: {{ item.resolvedBy }}
                        </div>
                      </q-card>
                    </q-popup-proxy>
                  </q-btn>
                </div>
              </q-item>
            </q-list>

            <div v-if="resolvedCasesCount === 0" class="text-center text-grey-5 q-py-xl">
              Aún no hay casos resueltos en el periodo seleccionado.
            </div>
          </template>
        </q-card-section>

        <q-separator dark />
        <q-card-actions align="right">
          <q-btn
            v-close-popup
            rounded
            outline
            color="orange"
            label="Cerrar"
            class="q-px-md"
            style="border-radius: 12px"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showTicketDialog" persistent>
      <q-card
        class="bg-dark text-white ticket-dialog-card"
        style="width: 520px; max-width: 95vw; border-radius: 12px"
      >
        <q-card-section class="row items-center q-pb-none">
          <div>
            <div class="text-h6">Crear Ticket de Soporte</div>
            <div class="text-caption text-grey-5">
              Envía el caso activo al equipo de soporte.
            </div>
          </div>
          <q-space />
          <q-btn flat round dense icon="close" color="grey-5" @click="closeTicketDialog" />
        </q-card-section>

        <q-card-section
          v-if="selectedCaseForTicket"
          class="q-gutter-y-md ticket-dialog-content"
          style="max-height: 65vh; overflow-y: auto"
        >
          <div class="resolve-case-summary q-pa-md">
            <div><b>ID del caso:</b> {{ selectedCaseForTicket.id }}</div>
            <div>
              <b>Dispositivo:</b>
              {{ selectedCaseForTicket.deviceId || selectedCaseForTicket.system }}
            </div>
          </div>

          <div>
            <div class="text-caption text-grey-5 q-mb-xs">Categoría *</div>
            <q-btn-toggle
              v-model="ticketForm.categoriaId"
              spread dense no-caps unelevated
              toggle-color="primary" color="grey-9" text-color="grey-4"
              :options="categoryOptions"
            />
          </div>

          <div
            class="q-pa-sm bg-dark-page rounded-borders row items-center justify-between
              text-caption border-subtle ticket-metadata-panel"
          >
            <div>
              <span class="text-grey-5">Empresa:</span>
              <strong>{{ activeTenantName }}</strong> (ID: {{ ticketForm.empresaId }})
            </div>
            <div>
              <span class="text-grey-5">Proyecto:</span>
              <strong>{{ activeSystemCode }}</strong> (ID: {{ ticketForm.proyectoId }})
            </div>
            <div>
              <span class="text-grey-5">Folio:</span>
              <q-badge color="primary">{{ automaticTicketFolio }}</q-badge>
            </div>
          </div>

          <q-input
            v-model="ticketForm.descripcion"
            dark
            dense
            outlined
            type="textarea"
            rows="4"
            label="Descripción *"
            input-class="ticket-description-input"
          />

          <q-file v-model="ticketForm.imagenes" dark dense outlined clearable accept="image/*"
            label="Captura o evidencia (opcional)">
            <template #prepend><q-icon name="attach_file" /></template>
          </q-file>

          <div v-if="ticketForm.categoriaId === 2" class="row q-col-gutter-sm q-mt-xs">
            <div class="col-6"><q-input v-model.number="ticketForm.tipoId" label="Tipo ID *"
              type="text" inputmode="numeric" dense outlined dark /></div>
            <div class="col-6"><q-input v-model="ticketForm.marca" label="Marca *" dense outlined dark /></div>
            <div class="col-6"><q-input v-model="ticketForm.modelo" label="Modelo *" dense outlined dark /></div>
            <div class="col-6"><q-input v-model="ticketForm.serie" label="Serie *" dense outlined dark /></div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md border-top">
          <q-btn flat no-caps color="grey-5" label="Cancelar" @click="closeTicketDialog" />
          <q-btn
            unelevated
            no-caps
            color="primary"
            label="Crear Ticket"
            class="text-bold q-px-md"
            style="border-radius: 8px"
            :disable="!isFormValid"
            :loading="creatingTicket"
            @click="confirmCreateTicket"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <DetailDialog v-model="showLogDetailsModal" :log="selectedLogForDetail" />
  </q-page>
</template>

<script setup>
import { computed, inject, nextTick, onMounted, onBeforeUnmount, provide, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import DashboardSectionsBoard from 'src/components/dashboard/DashboardSectionsBoard.vue'
import DateRangeFilter from 'src/components/escritorio/DateRangeFilter.vue'
import AttendanceAnomaliesWidget from 'src/components/escritorio/AttendanceAnomaliesWidget.vue'
import AiDiagnosisModal from 'src/components/escritorio/AiDiagnosisModal.vue'
import DetailDialog from 'src/components/blocks/DetailDialog.vue'
import { AnalyticsService } from 'src/services/analyticsService'
import {
  getSafeDashboardRange,
  normalizeSystemCode,
  resolveSystemProjectId,
  useDashboardData,
} from 'src/services/useDashboardData'
import { getIsoDateRange } from 'src/composables/useDiagnostics'
import { ChartDataService } from 'src/services/chartDataService'
import DashboardService from 'src/services/dashboardService'
import TicketService from 'src/services/ticketService'
import { connect, subscribeToTopic } from 'src/services/socketService'
import { useAuthStore } from 'src/stores/auth'
import { getEventTitle as translateEventCode } from 'src/helpers/eventDictionary'
import {
  captureExecutiveCharts,
  createTrendChartImage,
  generateExecutivePdf,
} from 'src/services/pdfExportService'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import * as XLSX from 'xlsx'

const { t } = useI18n()
const $q = useQuasar()
const authStore = useAuthStore()
const {
  cancelPendingDashboardRequests,
  catalogHealthMap,
  attendanceAnomaliesData,
  metrics: dashboardMetrics,
} =
  useDashboardData()

// Exponer helper de traducción de códigos de evento para el template.
const getEventTitle = translateEventCode

const executiveData = ref(null)
const topFrictionalEvents = ref([])
const loadingAnalytics = ref(false)
const selectedEventForDiagnosis = ref(null)
const showAiDiagnosisModal = ref(false)
const activeAnalyzingIndex = ref(null)
const aiDiagnosisResult = ref(null)
const exportingPdf = ref(false)
const exportingExcel = ref(false)
const showEventsModal = ref(false)
const showCasesModal = ref(false)
const casesView = ref('active')
const selectedLogForDetail = ref(null)
const showLogDetailsModal = ref(false)
const showTicketDialog = ref(false)
const selectedCaseForTicket = ref(null)
const creatingTicket = ref(false)
const ticketForm = ref(createEmptyTicketForm())
const ticketedCases = ref({})
const loadingEvents = ref(false)
const serverEventRows = ref([])
const eventsTotalPages = ref(0)
const eventsPagination = ref({
  page: 1,
  rowsPerPage: 8,
  rowsNumber: 0,
  sortBy: 'date',
  descending: true,
})

const categoryOptions = [
  { label: 'Software', value: 1 },
  { label: 'Hardware', value: 2 },
]

const RESOLVED_CASES_STORAGE_KEY = 'santoro.dashboard.resolvedCases.v1'

function readPersistedResolvedCases() {
  try {
    const stored = JSON.parse(localStorage.getItem(RESOLVED_CASES_STORAGE_KEY) || '[]')
    return Array.isArray(stored) ? stored : []
  } catch (error) {
    console.warn('[EscritorioPage] No se pudo leer el respaldo de casos resueltos:', error)
    return []
  }
}

const persistentResolvedCases = ref(readPersistedResolvedCases())

const isFormValid = computed(() => {
  const form = ticketForm.value
  if (!String(form.descripcion || '').trim()) return false
  if (form.categoriaId === 2) {
    return Boolean(form.tipoId && form.marca && form.modelo && form.serie)
  }
  return true
})

const filtrosGlobales = inject('filtrosGlobales', ref({}))
const logsGlobales = inject('logsGlobales', ref([]))
const statsData = inject('dashboardStatsData', ref(null))
const todayStatsData = inject('dashboardTodayStatsData', ref(null))
const trendSeriesData = inject('dashboardSeriesData', ref(null))
const dashboardLoading = inject('dashboardLoading', ref(false))
const showDashboardSkeletons = computed(() => dashboardLoading.value && !statsData.value)
const selectedSystem = computed(() => String(filtrosGlobales.value?.system || '').trim())
const activeSystemCode = computed(() => normalizeSystemCode(selectedSystem.value, 'CITA_GUYANA'))
const activeTenantName = computed(() => {
  const user = authStore.getUser || authStore.user || {}
  return (
    user.organization?.name ||
    (typeof user.organization === 'string' ? user.organization : '') ||
    user.tenant?.name ||
    user.companyName ||
    'Organización activa'
  )
})
const automaticTicketFolio = computed(() => `TK-${new Date().getFullYear()}-AUTO`)
const selectedPeriodTotalEvents = computed(() => Number(statsData.value?.totalEvents || 0))
const dashboardStats = computed(() => statsData.value || todayStatsData.value || null)
const currentHealth = computed(
  () => catalogHealthMap.value?.[activeSystemCode.value] || {},
)
const dynamicHealth = computed(() => {
  const stats = statsData.value
  if (stats && stats.totalEvents !== undefined) {
    return {
      status: stats.healthStatus || stats.systemHealth || 'STABLE',
      errorRate: Number(stats.errorRate || 0),
      errorCount: Number(stats.errorCount || 0),
      totalEvents: Number(stats.totalEvents || 0),
    }
  }

  return currentHealth.value
})

const filteredExecutiveData = computed(() => {
  if (!executiveData.value) return null
  const data = { ...executiveData.value }
  if (selectedSystem.value && Array.isArray(data.systems)) {
    data.systems = data.systems.filter(
      (system) => normalizeSystemCode(system?.systemCode || system?.system || system?.code) === activeSystemCode.value,
    )
  }
  return data
})

const activeSystem = computed(() => {
  if (!selectedSystem.value) return null
  return (
    filteredExecutiveData.value?.systems?.find(
      (system) => normalizeSystemCode(system?.systemCode || system?.system || system?.code) === activeSystemCode.value,
    ) || null
  )
})

const filteredTopFrictionItems = computed(() => {
  let items = topFrictionalEvents.value || []
  if (selectedSystem.value) {
    items = items.filter((event) => normalizeSystemCode(event?.system) === activeSystemCode.value)
  }
  return items.slice(0, 5)
})

const initialSharedRange = filtrosGlobales.value?.rangoFechas || {}
const initialTimeFilter = initialSharedRange.option || (initialSharedRange.from ? 'custom' : 'all')
const timeFilter = ref(initialTimeFilter)
const dateRange = ref({
  from: initialTimeFilter === 'all' ? '' : initialSharedRange.from || '',
  to: initialTimeFilter === 'all' ? '' : initialSharedRange.to || '',
  option: timeFilter.value,
  range: initialTimeFilter === 'all' ? 'ALL' : undefined,
})

function resolveIsoDateRange(range = dateRange.value) {
  if (range?.range === 'ALL' || range?.option === 'all') {
    return getSafeDashboardRange('ALL')
  }

  const tabKey =
    range?.from || range?.to
        ? 'custom'
        : range?.option || 'today'
  return getIsoDateRange(tabKey, range)
}

const unifiedTotalEvents = computed(() => Number(dynamicHealth.value?.totalEvents || 0))

const unifiedErrorRate = computed(() => Number(dynamicHealth.value?.errorRate || 0))

const calculatedFailures = computed(() =>
  Math.round((unifiedTotalEvents.value * unifiedErrorRate.value) / 100),
)

const calculatedSuccesses = computed(() =>
  Math.max(0, unifiedTotalEvents.value - calculatedFailures.value),
)

// Fuente única para los cuatro KPIs de "Actividad de hoy".
const activeSystemMetrics = computed(() => ({
  totalEvents: unifiedTotalEvents.value,
  errorCount: calculatedFailures.value,
  successCount: calculatedSuccesses.value,
  errorRate: unifiedErrorRate.value,
  healthStatus: dynamicHealth.value?.status || 'STABLE',
}))
provide('activeSystemMetrics', activeSystemMetrics)
provide('analyticsDateRange', dateRange)

const activeDisplayMetrics = computed(() => ({
  ...(activeSystem.value || {}),
  ...(dashboardStats.value || {}),
  totalEvents: unifiedTotalEvents.value,
  errorCount: Number(dynamicHealth.value?.errorCount || 0),
  successCount: calculatedSuccesses.value,
  errorRate: unifiedErrorRate.value,
}))

const analyticsDateRangeLabel = computed(() => {
  if (dateRange.value.range === 'ALL') return 'Histórico Completo'
  if (!dateRange.value.from && !dateRange.value.to) return 'Acumulado histórico'
  return `${dateRange.value.from} → ${dateRange.value.to}`
})

const selectedDateRangeLabel = computed(() => {
  const labels = {
    today: 'Hoy',
    last7days: '7 días',
    last30days: '30 días',
    all: 'Histórico',
  }
  return labels[dateRange.value.option] || analyticsDateRangeLabel.value
})

const currentReportData = computed(() => {
  const topEvent = filteredTopFrictionItems.value[0]
  const topFriction = topEvent
    ? topEvent.description && topEvent.description !== 'Evento con fallos reportados.'
      ? topEvent.description
      : getEventTitle(topEvent.eventCode)
    : 'Sin fricción registrada'
  const status = overallHealth.value
  const statusText =
    status === 'CRITICAL'
      ? 'Atención Crítica'
      : status === 'WARNING'
        ? 'Atención Requerida'
        : status === 'INACTIVE'
          ? 'Sistema Inactivo'
          : 'Operación Estable'
  const errorRate = Number(activeDisplayMetrics.value?.errorRate ?? dashboardMetrics.value.errorRate ?? 0)

  return {
    system: normalizeSystemCode(selectedSystem.value, 'SISTEMA'),
    dateRangeLabel: selectedDateRangeLabel.value || 'Periodo Seleccionado',
    fromDate: dateRange.value.from,
    toDate: dateRange.value.to,
    status: statusText,
    healthStatus: status,
    errorRate: `${errorRate.toFixed(2)}%`,
    errorRateValue: errorRate,
    totalEvents: Number(activeDisplayMetrics.value?.totalEvents ?? dashboardMetrics.value.totalEvents ?? 0),
    activeCases: activeCasesCount.value,
    topFriction,
  }
})

const eventColumns = [
  {
    name: 'date',
    label: 'Hora/Fecha',
    field: 'date',
    align: 'left',
    sortable: true,
    style: 'width: 160px; min-width: 160px',
    headerStyle: 'width: 160px; min-width: 160px',
  },
  {
    name: 'user',
    label: 'Usuario',
    field: 'user',
    align: 'left',
    sortable: true,
    style: 'width: 180px; min-width: 180px; max-width: 180px; padding-right: 24px',
    headerStyle: 'width: 180px; min-width: 180px; padding-right: 24px',
  },
  {
    name: 'event',
    label: 'Evento/Acción',
    field: 'event',
    align: 'left',
    style: 'width: auto; max-width: 500px',
    headerStyle: 'width: auto',
  },
  {
    name: 'status',
    label: 'Estado',
    field: 'status',
    align: 'center',
    sortable: true,
    style: 'width: 110px; min-width: 110px; max-width: 110px',
    headerStyle: 'width: 110px; min-width: 110px; max-width: 110px',
  },
]

function logDateValue(log) {
  return log?.timestamp || log?.createdAt || log?.date || log?.eventTime || log?.fechaHoraDia
}

function isLogInSelectedPeriod(log) {
  const value = new Date(logDateValue(log))
  if (!Number.isFinite(value.getTime())) return false

  if (!dateRange.value.from && !dateRange.value.to) return true

  const fromValue = dateRange.value.from || dateRange.value.to
  const toValue = dateRange.value.to || dateRange.value.from
  const from = new Date(`${fromValue}T00:00:00`)
  const to = new Date(`${toValue}T23:59:59.999`)
  return value >= from && value <= to
}

function matchesSelectedSystem(log) {
  if (!selectedSystem.value) return true
  return normalizeSystemCode(log?.system) === activeSystemCode.value
}

function eventDescription(log) {
  return (
    log?.description ||
    log?.message ||
    log?.action ||
    getEventTitle(log?.eventCode || log?.eventType) ||
    'Evento registrado'
  )
}

function displayDate(value) {
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return '-'
  return date.toLocaleString('es-MX', {
    dateStyle: 'short',
    timeStyle: 'medium',
  })
}

function incidentIdentifier(log) {
  return String(log?.caseId || log?.incidentId || log?.id || log?.eventId || '')
}

const logsWithPersistedResolutions = computed(() => {
  const logs = Array.isArray(logsGlobales.value) ? logsGlobales.value : []
  const mergedLogs = [...logs]

  persistentResolvedCases.value.forEach((resolution) => {
    const target = mergedLogs.find((log) => incidentIdentifier(log) === String(resolution.caseId))

    if (target) {
      target.status = 'RESOLVED'
      target.rootCause = resolution.rootCause
      target.solutionComment = resolution.solutionComment
      target.resolvedBy = resolution.resolvedBy
      target.resolvedAt = resolution.resolvedAt
      target.resolution = {
        rootCause: resolution.rootCause,
        correctiveAction: resolution.solutionComment,
        resolvedBy: resolution.resolvedBy,
        resolvedAt: resolution.resolvedAt,
      }
      return
    }

    mergedLogs.push({
      id: resolution.logId || resolution.caseId,
      caseId: resolution.caseId,
      system: resolution.system,
      deviceId: resolution.deviceId,
      timestamp: resolution.originalTimestamp || resolution.resolvedAt,
      description: resolution.description || `Incidente ${resolution.caseId}`,
      severity: resolution.severity || 'ERROR',
      outcome: 'FAILURE',
      status: 'RESOLVED',
      rootCause: resolution.rootCause,
      solutionComment: resolution.solutionComment,
      resolvedBy: resolution.resolvedBy,
      resolvedAt: resolution.resolvedAt,
      resolution: {
        rootCause: resolution.rootCause,
        correctiveAction: resolution.solutionComment,
        resolvedBy: resolution.resolvedBy,
        resolvedAt: resolution.resolvedAt,
      },
    })
  })

  return mergedLogs
})

const filteredLogs = computed(() => {
  return logsWithPersistedResolutions.value
    .filter((log) => isLogInSelectedPeriod(log) && matchesSelectedSystem(log))
    .map((log, index) => ({
      id: log?.id || log?.eventId || `${logDateValue(log) || 'event'}-${index}`,
      date: displayDate(logDateValue(log)),
      dateValue: new Date(logDateValue(log)).getTime() || 0,
      user:
        log?.actor?.fullName ||
        log?.actor?.username ||
        log?.actorName ||
        log?.username ||
        'Sistema',
      event: eventDescription(log),
      failed: isFailedLog(log),
      status: isFailedLog(log) ? 'Failure' : 'Success',
      system: log?.system || selectedSystem.value || 'Sistema',
      severity: String(log?.severity || log?.level || 'ERROR').toUpperCase(),
      source: log,
    }))
    .sort((a, b) => b.dateValue - a.dateValue)
})

const displayedEventsCount = computed(() => {
  return serverEventRows.value.length
})

function mapEventRow(log, index) {
  return {
    id: log?.id || log?.eventId || `${logDateValue(log) || 'event'}-${index}`,
    date: displayDate(logDateValue(log)),
    dateValue: new Date(logDateValue(log)).getTime() || 0,
    user:
      log?.actor?.fullName || log?.actor?.username || log?.actorName || log?.username || 'Sistema',
    event: eventDescription(log),
    failed: isFailedLog(log),
    status: isFailedLog(log) ? 'Failure' : 'Success',
    system: log?.system || selectedSystem.value || 'Sistema',
    severity: String(log?.severity || log?.level || 'ERROR').toUpperCase(),
    source: log,
  }
}

async function onEventsRequest({ pagination } = {}) {
  const requested = pagination || eventsPagination.value
  if (!selectedSystem.value) {
    serverEventRows.value = []
    eventsTotalPages.value = 0
    eventsPagination.value = { ...requested, rowsNumber: 0 }
    return
  }

  loadingEvents.value = true
  try {
    const { from, to } = resolveIsoDateRange(dateRange.value)
    const response = await ChartDataService.getLogsEvents({
      system: activeSystemCode.value,
      page: Math.max(0, requested.page - 1),
      size: requested.rowsPerPage,
      from,
      to,
      sortBy: requested.sortBy === 'date' ? 'eventTime' : requested.sortBy,
      sortDir: requested.descending ? 'DESC' : 'ASC',
    })
    const items = Array.isArray(response?.items) ? response.items : []
    const page = Number(response?.page ?? response?.currentPage ?? requested.page - 1)
    const size = Number(response?.size ?? requested.rowsPerPage)
    const totalElements = Number(response?.totalElements ?? response?.totalItems ?? 0)

    serverEventRows.value = items.map(mapEventRow)
    eventsTotalPages.value = Number(response?.totalPages ?? Math.ceil(totalElements / size))
    eventsPagination.value = {
      ...requested,
      page: page + 1,
      rowsPerPage: size,
      rowsNumber: totalElements,
    }
  } catch (error) {
    console.error('[EscritorioPage] Error al cargar la página de eventos:', error)
    serverEventRows.value = []
    eventsTotalPages.value = 0
    eventsPagination.value = { ...requested, rowsNumber: 0 }
    $q.notify({ type: 'negative', message: 'No se pudo cargar el desglose de eventos.' })
  } finally {
    loadingEvents.value = false
  }
}

const activeCasesList = computed(() =>
  filteredLogs.value
    .filter((item) => {
      const status = String(item.source?.status || '').toUpperCase()
      return item.failed && status !== 'RESOLVED'
    })
    .map((item, index) => {
      const log = item.source
      const rawId =
        log?.caseId || log?.incidentId || item.id || `${logDateValue(log) || 'incident'}-${index}`
      return {
        id: String(rawId),
        system: item.system,
        description: item.event,
        openedAt: item.date,
        date: item.date,
        openedAtValue: item.dateValue,
        severity: item.severity,
        deviceId: log?.deviceId || log?.device?.id || '',
        logId: log?.id || log?.eventId || item.id,
        source: log,
        ticketSent: Boolean(ticketedCases.value[String(rawId)] || log?.ticketSent),
      }
    })
    .filter(
      (incident, index, incidents) =>
        incidents.findIndex((candidate) => candidate.id === incident.id) === index,
    )
    .sort((a, b) => b.openedAtValue - a.openedAtValue),
)

const resolvedCasesList = computed(() =>
  filteredLogs.value
    .filter((item) => {
      const status = String(item.source?.status || '').toUpperCase()
      const eventType = String(item.source?.eventType || '').toUpperCase()
      return status === 'RESOLVED' && eventType !== 'INCIDENT_RESOLVED'
    })
    .map((item, index) => {
      const log = item.source
      const resolution = log?.resolution || {}
      const rawId =
        log?.caseId ||
        log?.incidentId ||
        item.id ||
        `${logDateValue(log) || 'resolved-incident'}-${index}`
      return {
        id: String(rawId),
        system: item.system,
        description: item.event,
        severity: item.severity,
        deviceId: log?.deviceId || log?.device?.id || '',
        logId: log?.id || log?.eventId || item.id,
        resolvedAt: log?.resolvedAt || resolution.resolvedAt,
        resolvedDate: displayDate(log?.resolvedAt || resolution.resolvedAt),
        rootCause: log?.rootCause || resolution.rootCause,
        solutionComment:
          log?.solutionComment || resolution.correctiveAction || 'Sin comentarios registrados.',
        resolvedBy: log?.resolvedBy || resolution.resolvedBy || 'Usuario no identificado',
        source: log,
      }
    })
    .filter(
      (incident, index, incidents) =>
        incidents.findIndex((candidate) => candidate.id === incident.id) === index,
    )
    .sort((a, b) => new Date(b.resolvedAt || 0).getTime() - new Date(a.resolvedAt || 0).getTime()),
)

const activeCasesCount = computed(() => activeCasesList.value.length)
const resolvedCasesCount = computed(() => resolvedCasesList.value.length)

function statusFromErrorRate(errorRate) {
  const rate = Number(errorRate)
  if (rate >= 15) return 'CRITICAL'
  if (rate > 0) return 'WARNING'
  return 'STABLE'
}

function normalizeHealthStatus(status) {
  const normalized = String(status || '')
    .trim()
    .toUpperCase()
  if (['STABLE', 'HEALTHY', 'OK'].includes(normalized)) return 'STABLE'
  if (['WARNING', 'WARN', 'ALERTA', 'ALERT'].includes(normalized)) return 'WARNING'
  if (['CRITICAL', 'CRIT'].includes(normalized)) return 'CRITICAL'
  if (['INACTIVE', 'OFFLINE', 'DISABLED'].includes(normalized)) return 'INACTIVE'
  return ''
}

const activeSystemHealth = computed(() => {
  return normalizeHealthStatus(dynamicHealth.value?.status) || 'STABLE'
})

const overallHealth = computed(() => {
  return activeSystemHealth.value
})

const affectedUsersTodayList = computed(() => {
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  const affectedUsers = new Map()
  const logs = Array.isArray(logsGlobales.value) ? logsGlobales.value : []

  logs.forEach((log) => {
    const rawDate =
      log?.timestamp || log?.createdAt || log?.date || log?.eventTime || log?.fechaHoraDia
    const logDate = new Date(rawDate)
    if (!Number.isFinite(logDate.getTime()) || logDate < startOfToday) return

    const logSystem = normalizeSystemCode(log?.system)
    if (selectedSystem.value && logSystem && logSystem !== activeSystemCode.value) return

    const outcome = String(log?.outcome || '').toUpperCase()
    const status = String(log?.status || '').toUpperCase()
    const level = String(log?.level || '').toUpperCase()
    const isError =
      outcome === 'FAILURE' || status === 'REJECTED' || level === 'ERROR' || level === 'CRITICAL'
    if (!isError) return

    const user = log?.actor?.username || log?.actor?.fullName || log?.actorName || log?.username
    if (!user) return

    const username = String(log?.actor?.username || log?.username || '').trim()
    const fullName = String(log?.actor?.fullName || log?.actorName || '').trim()
    const key = String(user).trim().toLowerCase()
    const current = affectedUsers.get(key) || {
      name: fullName || username,
      username,
      totalErrors: 0,
      systems: new Set(),
    }
    current.totalErrors += 1
    current.systems.add(logSystem || selectedSystem.value || 'Sistema')
    affectedUsers.set(key, current)
  })

  return [...affectedUsers.values()]
    .map((user) => ({
      ...user,
      systems: [...user.systems],
    }))
    .sort((a, b) => b.totalErrors - a.totalErrors || a.name.localeCompare(b.name))
})

const affectedUsersCount = computed(() => affectedUsersTodayList.value.length)

function isFailedLog(log) {
  const outcome = String(log?.outcome || '').toUpperCase()
  const status = String(log?.status || '').toUpperCase()
  const level = String(log?.level || '').toUpperCase()
  return outcome === 'FAILURE' || status === 'REJECTED' || level === 'ERROR' || level === 'CRITICAL'
}

function createEmptyTicketForm() {
  return {
    empresaId: 4,
    proyectoId: 1,
    categoriaId: 1,
    descripcion: '',
    imagenes: null,
    tipoId: 1,
    marca: 'N/A',
    modelo: 'N/A',
    serie: 'N/A',
  }
}

function getEmpresaNumericId(organizationName) {
  const normalizedName = String(organizationName || '').trim().toUpperCase()
  if (normalizedName.includes('ELECTORAL') || normalizedName.includes('GOBIERNO')) return 4
  if (normalizedName === 'GRUPO SANTORO') return 1
  return 4
}

function numericIdOrFallback(...values) {
  const numericValue = values.map(Number).find((value) => Number.isFinite(value) && value > 0)
  return numericValue || 1
}

function ticketProjectMap() {
  try {
    return JSON.parse(import.meta.env.VITE_TICKET_PROJECT_MAP || '{}')
  } catch (error) {
    console.warn('[EscritorioPage] VITE_TICKET_PROJECT_MAP no contiene JSON válido:', error)
    return {}
  }
}

function resolveProjectId(incident) {
  const source = incident?.source || {}
  const systemCode = normalizeSystemCode(incident?.system)
  const sourceProjectId = numericIdOrFallback(
    source.proyectoId,
    source.projectId,
    filtrosGlobales.value?.proyectoId,
    filtrosGlobales.value?.projectId,
  )
  const configuredProjects = ticketProjectMap()
  const hasExplicitProject = [
    source.proyectoId,
    source.projectId,
    filtrosGlobales.value?.proyectoId,
    filtrosGlobales.value?.projectId,
  ].some((value) => Number.isFinite(Number(value)) && Number(value) > 0)

  return resolveSystemProjectId(
    systemCode,
    hasExplicitProject ? { ...configuredProjects, [systemCode]: sourceProjectId } : configuredProjects,
    1,
  )
}

function formatTicketDescription(incident) {
  const source = incident.source || {}
  const ip = source.ip || source.ipAddress || source.device?.ip || source.clientIp || 'No disponible'
  return [
    `ID de caso: ${incident.id}`,
    `Sistema: ${incident.system || 'No disponible'}`,
    `Dispositivo: ${incident.deviceId || 'No disponible'}`,
    `IP: ${ip}`,
    `Fecha: ${incident.date || 'No disponible'}`,
    `Mensaje de Error: ${incident.description || 'No disponible'}`,
    '', 'Notas adicionales:', '',
  ].join('\n')
}

function openTicketDialog(item) {
  selectedCaseForTicket.value = item
  ticketForm.value = {
    ...createEmptyTicketForm(),
    empresaId: getEmpresaNumericId(activeTenantName.value),
    proyectoId: resolveProjectId(item),
    descripcion: formatTicketDescription(item),
  }
  showTicketDialog.value = true
}

function closeTicketDialog() {
  showTicketDialog.value = false
  selectedCaseForTicket.value = null
  ticketForm.value = createEmptyTicketForm()
}

function ticketNumberFrom(response) {
  const data = response?.data?.data || response?.data || {}
  return data.ticketNumber || data.numero || data.folio || data.code || data.id || 'creado'
}

async function confirmCreateTicket() {
  const incident = selectedCaseForTicket.value
  if (!incident || !isFormValid.value) return
  creatingTicket.value = true

  try {
    const form = ticketForm.value
    const formData = new FormData()
    formData.append('empresaId', form.empresaId)
    formData.append('categoriaId', String(form.categoriaId))
    formData.append('proyectoId', form.proyectoId)
    formData.append('descripcion', form.descripcion.trim())
    if (form.imagenes) formData.append('imagenes', form.imagenes)
    if (form.categoriaId === 2) {
      formData.append('tipoId', form.tipoId || 1)
      formData.append('marca', form.marca || 'N/A')
      formData.append('modelo', form.modelo || 'N/A')
      formData.append('serie', form.serie || 'N/A')
    }

    const response = await TicketService.create(formData, authStore.getAccessToken)
    if (response.status !== 200) {
      throw new Error('La API no confirmó la creación del ticket.')
    }

    const ticketNumber = ticketNumberFrom(response)
    ticketedCases.value = { ...ticketedCases.value, [incident.id]: ticketNumber }
    const source = incident.source || {}
    source.ticketSent = true
    source.ticketNumber = ticketNumber
    closeTicketDialog()
    $q.notify({
      type: 'positive',
      message: `Ticket #${ticketNumber} creado exitosamente`,
      position: 'top-right',
    })
  } catch (error) {
    console.error('[EscritorioPage] Error al crear el ticket:', error)
    if ([401, 403].includes(error.response?.status)) {
      $q.notify({
        type: 'negative',
        message: 'Error de autenticación: El token de sesión no fue aceptado por el sistema de tickets.',
        position: 'top-right',
      })
      return
    }
    const errorMsg = error.response?.data?.message || error.message || 'No se pudo crear el ticket.'
    $q.notify({ type: 'negative', message: `Error al crear ticket: ${errorMsg}`, position: 'top-right' })
  } finally {
    creatingTicket.value = false
  }
}

function openCaseDetails(item) {
  selectedLogForDetail.value = item.source
  showCasesModal.value = false
  showLogDetailsModal.value = true
}

const impactedUsersForPeriod = computed(() => {
  const users = new Map()
  const logs = Array.isArray(logsGlobales.value) ? logsGlobales.value : []

  logs.forEach((log) => {
    const logSystem = normalizeSystemCode(log?.system)
    if (selectedSystem.value && logSystem && logSystem !== activeSystemCode.value) return
    if (!isFailedLog(log)) return

    const username = String(log?.actor?.username || log?.username || '').trim()
    const fullName = String(log?.actor?.fullName || log?.actorName || '').trim()
    const identity = username || fullName
    if (!identity) return

    const key = identity.toLowerCase()
    const current = users.get(key) || {
      name: fullName || username,
      username,
      totalErrors: 0,
      systems: new Set(),
    }
    current.totalErrors += 1
    current.systems.add(logSystem || selectedSystem.value || 'Sistema')
    users.set(key, current)
  })

  return [...users.values()]
    .map((user) => ({
      ...user,
      systems: [...user.systems],
    }))
    .sort((a, b) => b.totalErrors - a.totalErrors || a.name.localeCompare(b.name))
})

const liveSummary = computed(() => {
  const systemName = selectedSystem.value || 'Sistema'
  const rate = Number(activeDisplayMetrics.value?.errorRate || 0)
  const status = activeSystemHealth.value
  const affectedUsers = affectedUsersCount.value
  const affectedUsersText =
    affectedUsers === 1
      ? '1 usuario ha sido afectado hoy.'
      : `${formatNumber(affectedUsers)} usuarios han sido afectados hoy.`

  if (status === 'CRITICAL') {
    return {
      icon: 'error',
      color: 'negative',
      title: `Estatus de ${systemName}: Atención Requerida (${rate}% errores)`,
      text: `Se detectaron fallos frecuentes en ${systemName} durante ${analyticsDateRangeLabel.value}. ${affectedUsersText}`,
      report: `🚨 Estatus de ${systemName}: Atención Requerida\n\nTasa de error: ${rate}%\nSistema: ${systemName}\nUsuarios afectados hoy: ${formatNumber(affectedUsers)}\n\nRevisar dashboard para más detalles.`,
    }
  }

  if (status === 'WARNING') {
    return {
      icon: 'warning',
      color: 'orange-8',
      title: `Estatus de ${systemName}: Atención Requerida (${rate}% errores)`,
      text: `Se registraron errores en ${systemName} durante ${analyticsDateRangeLabel.value}. Se recomienda revisar los eventos del periodo.`,
      report: `⚠️ Estatus de ${systemName}: Atención Requerida\n\nTasa de error: ${rate}%\nSistema: ${systemName}\n\nSe recomienda monitoreo.`,
    }
  }

  return {
    icon: 'check_circle',
    color: 'positive',
    title: `Estatus de ${systemName}: Operación Estable`,
    text: `${systemName} se mantuvo estable durante ${analyticsDateRangeLabel.value}. No se registran bloqueos relevantes en el periodo.`,
    report: `✅ Estatus de ${systemName}: Operación Estable\n\nTasa de error: ${rate}%\nRango: ${analyticsDateRangeLabel.value}\n\n${systemName} se mantuvo estable durante el periodo seleccionado.`,
  }
})

function reportDate() {
  return formatDate(new Date())
}

function safeFilePart(value) {
  return String(value || 'Todos')
    .trim()
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, '_')
}

function exportToExcel(reportData = currentReportData.value) {
  exportingExcel.value = true
  try {
    const data = reportData?.system ? reportData : currentReportData.value
    const systemName = data.system
    const summaryRows = [
      { Campo: 'Fecha', Valor: reportDate() },
      { Campo: 'Sistema Seleccionado', Valor: systemName },
      { Campo: 'Periodo', Valor: data.dateRangeLabel },
      { Campo: 'Desde', Valor: data.fromDate || 'Inicio del histórico' },
      { Campo: 'Hasta', Valor: data.toDate || 'Actualidad' },
      { Campo: 'Salud General', Valor: data.status },
      { Campo: 'Total de Eventos', Valor: data.totalEvents },
      { Campo: 'Tasa de Error', Valor: data.errorRate },
      { Campo: 'Usuarios Afectados', Valor: affectedUsersCount.value },
      { Campo: 'Casos Activos', Valor: data.activeCases },
      { Campo: 'Principal Fricción', Valor: data.topFriction },
    ]

    const frictionRows = filteredTopFrictionItems.value.map((event) => ({
      Evento:
        event.description && event.description !== 'Evento con fallos reportados.'
          ? event.description
          : getEventTitle(event.eventCode),
      Ocurrencias: event.occurrenceCount ?? 0,
      Afectados: event.affectedCases ?? 0,
      Sistema: event.system || systemName,
    }))

    const impactedUserRows = impactedUsersForPeriod.value.map((user) => ({
      Nombre: user.name,
      Username: user.username,
      'Total Errores': user.totalErrors,
    }))

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(summaryRows), 'Resumen General')
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(frictionRows), 'Top Fricción')
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(impactedUserRows),
      'Usuarios Impactados',
    )

    XLSX.writeFile(workbook, `Reporte_Ejecutivo_${safeFilePart(systemName)}_${reportDate()}.xlsx`)
    $q.notify({
      type: 'positive',
      message: '🟢 Reporte Excel descargado con éxito',
      position: 'top',
    })
  } catch (error) {
    console.error('[EscritorioPage] Error exportando Excel:', error)
    $q.notify({ type: 'negative', message: 'No se pudo generar el reporte Excel.' })
  } finally {
    exportingExcel.value = false
  }
}

function drawPdfTable(doc, { columns, rows, startY, rowHeight = 7 }) {
  const left = 12
  const tableWidth = columns.reduce((sum, column) => sum + column.width, 0)

  doc.setFillColor(230, 81, 0)
  doc.roundedRect(left, startY, tableWidth, rowHeight, 1.4, 1.4, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'bold')

  let x = left
  columns.forEach((column) => {
    doc.text(column.label, x + 2, startY + 5.3)
    x += column.width
  })

  rows.forEach((row, index) => {
    const y = startY + rowHeight * (index + 1)
    const background = index % 2 ? 245 : 255
    doc.setFillColor(background, background, background)
    doc.rect(left, y, tableWidth, rowHeight, 'F')
    doc.setDrawColor(230, 230, 230)
    doc.rect(left, y, tableWidth, rowHeight)
    doc.setTextColor(45, 45, 45)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.2)

    let cellX = left
    columns.forEach((column) => {
      const value = String(row[column.key] ?? '-')
      const clipped = doc.splitTextToSize(value, column.width - 4)[0] || ''
      doc.text(clipped, cellX + 2, y + 4.8)
      cellX += column.width
    })
  })

  return startY + rowHeight * (rows.length + 1)
}

async function getChartImage(target) {
  const element =
    target instanceof Element
      ? target
      : document.getElementById(target) || document.querySelector(target)
  if (!element) return null

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#18191c',
      logging: false,
    })
    return canvas.toDataURL('image/jpeg', 0.95)
  } catch (error) {
    console.warn('No se pudo capturar el elemento visual:', target, error)
    return null
  }
}

async function getFirstChartImage(selectors) {
  for (const selector of selectors) {
    const container = document.querySelector(selector)
    if (!container) continue

    // ApexCharts y ECharts dibujan dentro de un SVG/canvas. Capturar el nodo
    // gráfico evita que html2canvas genere una imagen vacía del contenedor.
    const chartElement = container.matches('svg, canvas, .echarts, .apexcharts-canvas')
      ? container
      : container.querySelector('.echarts, .apexcharts-canvas, canvas, svg') || container
    const image = await getChartImage(chartElement)
    if (image) return image
  }
  return null
}

async function exportToPdf(reportData = currentReportData.value) {
  exportingPdf.value = true
  const data = reportData?.system ? reportData : currentReportData.value

  try {
    const { from, to } = resolveIsoDateRange(dateRange.value)
    let exportTrendSeries = trendSeriesData.value || {}
    try {
      exportTrendSeries = await DashboardService.getSeries({
        system: activeSystemCode.value,
        from,
        to,
        range: dateRange.value?.range,
      })
      trendSeriesData.value = exportTrendSeries
    } catch (error) {
      console.warn('[EscritorioPage] Se usará la serie reactiva para el PDF:', error)
    }

    await nextTick()
    const severityRef = document.querySelector('.severity-pie-wrap canvas')
    const trendRef =
      document.querySelector('#chart-estados .apexcharts-canvas') ||
      document.querySelector('#chart-estados canvas') ||
      document.querySelector('#chart-estados svg')
    const charts = await captureExecutiveCharts({ severityRef, trendRef })
    const isToday = dateRange.value?.option === 'today'
    const trendImage = createTrendChartImage({
      seriesData: exportTrendSeries,
      logs: isToday ? logsGlobales.value.filter(isLogInSelectedPeriod).filter(matchesSelectedSystem) : [],
      isToday,
    })
    if (trendImage) charts[1] = trendImage
    const organizationName =
      authStore.user?.organization?.name ||
      authStore.currentUser?.organization?.name ||
      'Organización'
    const frictionRows = filteredTopFrictionItems.value.map((event) => ({
      event:
        event.description && event.description !== 'Evento con fallos reportados.'
          ? event.description
          : getEventTitle(event.eventCode),
      occurrences: event.occurrenceCount ?? 0,
      affected: event.affectedCases ?? 0,
      system: event.system || data.system,
    }))
    const affectedRows = impactedUsersForPeriod.value.map((user) => ({
      name: user.name,
      username: user.username || '-',
      errors: `${user.totalErrors} ${user.totalErrors === 1 ? 'error' : 'errores'}`,
      system: user.systems.join(', ') || data.system,
    }))

    const doc = generateExecutivePdf({
      data,
      organizationName,
      charts,
      frictionRows,
      affectedRows,
    })
    doc.save(`Reporte_Ejecutivo_${safeFilePart(data.system)}_${reportDate()}.pdf`)
    $q.notify({ type: 'positive', message: 'Reporte PDF descargado con éxito', position: 'top' })
  } catch (error) {
    console.error('[EscritorioPage] Error exportando PDF:', error)
    // Mantener disponible la exportación anterior como contingencia si el
    // navegador no permite capturar alguno de los motores gráficos.
    await exportLegacyPdf(data)
  } finally {
    exportingPdf.value = false
  }
}

async function exportLegacyPdf(reportData = currentReportData.value) {
  exportingPdf.value = true
  try {
    const data = reportData?.system ? reportData : currentReportData.value
    const organizationName =
      authStore.user?.organization?.name ||
      authStore.currentUser?.organization?.name ||
      'Organización'
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const systemName = data.system
    const totalEvents = data.totalEvents
    const errorRate = data.errorRateValue

    doc.setFillColor(24, 25, 28)
    doc.rect(0, 0, 210, 24, 'F')
    doc.setTextColor(233, 113, 50)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text(`${organizationName.toUpperCase()} - CONSOLA DE LOGS`, 12, 7)
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(14)
    doc.text('INFORME EJECUTIVO DE OPERACIÓN', 12, 14)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.text(
      `Fecha: ${reportDate()}  |  Sistema: ${systemName}  |  Periodo: ${data.dateRangeLabel}`,
      12,
      20,
    )

    const kpis = [
      {
        label: 'SALUD',
        value: data.status,
        background:
          data.healthStatus === 'CRITICAL'
            ? [255, 235, 238]
            : data.healthStatus === 'WARNING'
              ? [255, 243, 224]
              : [232, 245, 233],
        foreground:
          data.healthStatus === 'CRITICAL'
            ? [198, 40, 40]
            : data.healthStatus === 'WARNING'
              ? [230, 81, 0]
              : [46, 125, 50],
      },
      {
        label: 'TOTAL EVENTOS',
        value: formatNumber(totalEvents),
        background: [238, 242, 246],
        foreground: [38, 50, 56],
      },
      {
        label: 'TASA DE ERROR',
        value: data.errorRate,
        background: Number(errorRate) >= 15 ? [255, 235, 238] : [255, 243, 224],
        foreground: Number(errorRate) >= 15 ? [198, 40, 40] : [230, 81, 0],
      },
      {
        label: 'USUARIOS AFECTADOS',
        value: String(affectedUsersCount.value),
        background: [255, 248, 225],
        foreground: [93, 64, 55],
      },
    ]
    kpis.forEach((kpi, index) => {
      const x = 12 + index * 47
      doc.setFillColor(...kpi.background)
      doc.roundedRect(x, 27, 43, 18, 2, 2, 'F')
      doc.setTextColor(...kpi.foreground)
      doc.setFontSize(7)
      doc.setFont('helvetica', 'bold')
      doc.text(kpi.label, x + 3, 33)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(12)
      doc.text(String(kpi.value), x + 3, 41)
      doc.setFont('helvetica', 'normal')
    })

    doc.setTextColor(35, 35, 35)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9.5)
    doc.text('PANORAMA VISUAL', 12, 50)

    await new Promise((resolve) => setTimeout(resolve, 300))
    const [severityImage, statusImage] = await Promise.all([
      getFirstChartImage(['.severity-pie-wrap']),
      getFirstChartImage([
        '#chart-estados',
        '.status-line-wrap',
        '.echarts',
        '.apexcharts-canvas',
        '#chart-transacciones',
        '.chart-wrap',
      ]),
    ])

    let insertedChartCount = 0
    if (severityImage) {
      try {
        doc.setFillColor(248, 249, 250)
        doc.roundedRect(12, 53, 88, 50, 2, 2, 'F')
        doc.setTextColor(70, 70, 70)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(7.5)
        doc.text('SEVERIDAD', 15, 59)
        doc.addImage(severityImage, 'JPEG', 14, 61, 84, 40)
        insertedChartCount += 1
      } catch (error) {
        console.warn('No se pudo insertar la gráfica de severidad en el PDF:', error)
      }
    }
    if (statusImage) {
      try {
        doc.setFillColor(248, 249, 250)
        doc.roundedRect(110, 53, 88, 50, 2, 2, 'F')
        doc.setTextColor(70, 70, 70)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(7.5)
        doc.text('ESTADOS / TENDENCIA DE EVENTOS', 113, 59)
        doc.addImage(statusImage, 'JPEG', 112, 61, 84, 40)
        insertedChartCount += 1
      } catch (error) {
        console.warn('No se pudo insertar la gráfica de estados en el PDF:', error)
      }
    }
    if (insertedChartCount === 0) {
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(120, 120, 120)
      doc.setFontSize(9)
      doc.text('No hay gráficas visibles disponibles para capturar.', 12, 61)
    }

    doc.setTextColor(35, 35, 35)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9.5)
    doc.text('TOP EVENTOS CON MAYOR FRICCIÓN', 12, 110)
    const frictionRows = filteredTopFrictionItems.value.map((event) => ({
      event:
        event.description && event.description !== 'Evento con fallos reportados.'
          ? event.description
          : getEventTitle(event.eventCode),
      occurrences: event.occurrenceCount ?? 0,
      affected: event.affectedCases ?? 0,
      system: event.system || systemName,
    }))
    const frictionBottom = drawPdfTable(doc, {
      startY: 113,
      rowHeight: 5.5,
      columns: [
        { key: 'event', label: 'Evento', width: 92 },
        { key: 'occurrences', label: 'Ocurrencias', width: 28 },
        { key: 'affected', label: 'Afectados', width: 26 },
        { key: 'system', label: 'Sistema', width: 40 },
      ],
      rows: frictionRows.slice(0, 5),
    })

    const impactedTitleY = Math.max(150, frictionBottom + 4)
    doc.setTextColor(35, 35, 35)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9.5)
    doc.text('USUARIOS AFECTADOS EN EL PERIODO', 12, impactedTitleY)

    const impactedRows = affectedUsersTodayList.value.slice(0, 5).map((user) => ({
      name: user.name,
      username: user.username || '-',
      errors: `${user.totalErrors} ${user.totalErrors === 1 ? 'error' : 'errores'}`,
      system: user.systems.join(', ') || systemName,
    }))
    const impactedBottom = drawPdfTable(doc, {
      startY: impactedTitleY + 3,
      rowHeight: 5.5,
      columns: [
        { key: 'name', label: 'Nombre del Usuario', width: 62 },
        { key: 'username', label: 'Username', width: 42 },
        { key: 'errors', label: 'Cantidad de Errores', width: 38 },
        { key: 'system', label: 'Sistema Afectado', width: 44 },
      ],
      rows: impactedRows,
    })

    const synthesisY = Math.max(200, impactedBottom + 7)
    doc.setFillColor(250, 250, 250)
    doc.setDrawColor(220, 220, 220)
    doc.roundedRect(12, synthesisY, 186, 32, 2, 2, 'FD')
    doc.setTextColor(230, 81, 0)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.text('CONCLUSIÓN / RECOMENDACIÓN TÉCNICA', 16, synthesisY + 7)
    const count = affectedUsersCount.value
    const userLabel = count === 1 ? '1 usuario' : `${count} usuarios`
    const synthesis =
      `SÍNTESIS: El sistema ${systemName} registró una tasa de error del ${data.errorRate} ` +
      `afectando a ${userLabel}. Se recomienda revisar el servicio ` +
      'de autenticación y conectividad en el servidor principal.'
    doc.setTextColor(60, 60, 60)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.text(doc.splitTextToSize(synthesis, 176), 16, synthesisY + 14)

    doc.setDrawColor(210, 210, 210)
    doc.line(12, 282, 198, 282)
    doc.setTextColor(105, 105, 105)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.text(`Página 1 de 1 - Documento confidencial | ${organizationName}`, 105, 288, {
      align: 'center',
    })

    doc.save(`Reporte_Ejecutivo_${safeFilePart(systemName)}_${reportDate()}.pdf`)
    $q.notify({
      type: 'positive',
      message: '🟢 Reporte PDF descargado con éxito',
      position: 'top',
    })
  } catch (error) {
    console.error('[EscritorioPage] Error exportando PDF:', error)
    $q.notify({ type: 'negative', message: 'No se pudo generar el reporte PDF.' })
  } finally {
    exportingPdf.value = false
  }
}

function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatNumber(value) {
  if (value === undefined || value === null) return '-'
  return new Intl.NumberFormat().format(value)
}

function healthColor(status) {
  switch (status) {
    case 'CRITICAL':
      return 'negative'
    case 'WARNING':
      return 'orange-8'
    case 'STABLE':
      return 'positive'
    case 'INACTIVE':
      return 'grey'
    default:
      return 'grey'
  }
}

function healthPulseClass(status) {
  switch (status) {
    case 'CRITICAL':
      return 'kpi-pulse--critical'
    case 'WARNING':
      return 'kpi-pulse--warning'
    case 'STABLE':
      return 'kpi-pulse--stable'
    default:
      return ''
  }
}

function healthDisplayLabel(status) {
  return status === 'WARNING' ? 'ALERTA' : status
}

function healthSurfaceClass(status) {
  if (status === 'CRITICAL') return 'health-surface--critical'
  if (status === 'WARNING') return 'health-surface--warning'
  if (status === 'STABLE') return 'health-surface--stable'
  return ''
}

async function copyQuickReport() {
  const data = currentReportData.value
  const reportText = `📊 [${data.system}] - Estatus Operativo (${data.dateRangeLabel})
🔴 Estado General: ${data.status} (${data.errorRate} error)
📈 Eventos Procesados: ${data.totalEvents}
🚨 Incidentes Activos: ${data.activeCases}
⚠️ Principal Fricción: ${data.topFriction}

Generado desde la Consola de Control de Logs.`

  try {
    await navigator.clipboard.writeText(reportText)
    $q.notify({ type: 'positive', message: 'Reporte copiado al portapapeles' })
  } catch (error) {
    console.error('Error al copiar reporte:', error)
    $q.notify({ type: 'negative', message: 'No se pudo copiar el reporte. Intenta de nuevo.' })
  }
}

function errorRateColorClass(rate) {
  if (rate === undefined || rate === null) return 'text-grey'
  switch (statusFromErrorRate(rate)) {
    case 'CRITICAL':
      return 'text-negative'
    case 'WARNING':
      return 'text-warning'
    default:
      return 'text-positive'
  }
}

function rankColor(rank) {
  switch (rank) {
    case 1:
      return 'negative'
    case 2:
      return 'orange'
    case 3:
      return 'warning'
    default:
      return 'grey'
  }
}

let pageAnalyticsAbortController = null
let pageAnalyticsRequestSeq = 0

async function loadAllAnalytics(from, to, silent = false) {
  pageAnalyticsAbortController?.abort()
  pageAnalyticsAbortController = new AbortController()
  const { signal } = pageAnalyticsAbortController
  const requestSeq = ++pageAnalyticsRequestSeq
  if (!silent) loadingAnalytics.value = true
  const system = activeSystemCode.value || undefined

  const loadExecutiveSummary = async () => {
    try {
      const response = await AnalyticsService.getExecutiveSummary(from, to, system, { signal })
      if (requestSeq !== pageAnalyticsRequestSeq) return
      executiveData.value = response?.data || response || null
    } catch (error) {
      if (error?.code === 'ERR_CANCELED') return
      console.error('Error cargando resumen ejecutivo:', error)
      if (!silent && requestSeq === pageAnalyticsRequestSeq) executiveData.value = null
    }
  }

  const loadTopFrictionalEvents = async () => {
    try {
      const response = await AnalyticsService.getTopFrictionalEvents(from, to, system, { signal })
      if (requestSeq !== pageAnalyticsRequestSeq) return
      topFrictionalEvents.value = response?.data?.events || response?.events || []
    } catch (error) {
      if (error?.code === 'ERR_CANCELED') return
      console.error('Error cargando eventos con fricción:', error)
      if (!silent && requestSeq === pageAnalyticsRequestSeq) topFrictionalEvents.value = []
    }
  }

  await Promise.all([loadExecutiveSummary(), loadTopFrictionalEvents()])
  if (!silent && requestSeq === pageAnalyticsRequestSeq) loadingAnalytics.value = false
}

async function onDateRangeChange(range) {
  // Cancela inmediatamente el rango anterior; MainLayout inicia la única
  // carga nueva cuando se sincronizan los filtros globales.
  cancelPendingDashboardRequests()
  dateRange.value = range
  timeFilter.value = range?.option || 'all'
  const fullHistory = range?.range === 'ALL' || range?.option === 'all'
  const from = fullHistory ? '' : range?.from || ''
  const to = fullHistory ? '' : range?.to || ''
  const isoRange = resolveIsoDateRange(range)
  filtrosGlobales.value = {
    ...(filtrosGlobales.value || {}),
    rangoFechas: {
      from,
      to,
      option: fullHistory ? 'all' : range?.option || 'custom',
      range: fullHistory ? 'ALL' : undefined,
    },
  }

  await loadAllAnalytics(isoRange.from, isoRange.to)
  if (showEventsModal.value) {
    onEventsRequest({
      pagination: { ...eventsPagination.value, page: 1 },
    })
  }
}

let silentAnalyticsTimer = null
let lastSilentAnalyticsFetchTime = 0
const SILENT_ANALYTICS_INTERVAL_MS = 10_000

function loadDashboardDataSilently() {
  if (silentAnalyticsTimer) return
  const elapsed = Date.now() - lastSilentAnalyticsFetchTime
  const delay = Math.max(0, SILENT_ANALYTICS_INTERVAL_MS - elapsed)

  silentAnalyticsTimer = setTimeout(async () => {
    silentAnalyticsTimer = null
    lastSilentAnalyticsFetchTime = Date.now()
    try {
      const { from, to } = resolveIsoDateRange(dateRange.value)
      await loadAllAnalytics(from, to, true)
    } catch (error) {
      if (error?.code !== 'ERR_CANCELED') {
        console.error('Error en refresco silencioso:', error)
      }
    }
  }, delay)
}

let unsubscribeLogs = null
let unsubscribeMetrics = null
let unsubscribeHealth = null
let unsubscribeAlerts = null
let isPageMounted = false

function safeUnsubscribe(subscription, label) {
  if (!subscription) return

  try {
    if (typeof subscription === 'function') {
      subscription()
    } else if (typeof subscription.unsubscribe === 'function') {
      subscription.unsubscribe()
    }
  } catch (error) {
    console.warn(`Error al desuscribir ${label}:`, error)
  }
}

watch(
  selectedSystem,
  (nextSystem, prevSystem) => {
    if (nextSystem !== prevSystem) {
      const activeRange = { ...dateRange.value }
      const { from, to } = resolveIsoDateRange(activeRange)
      loadAllAnalytics(from, to)
      if (showEventsModal.value) {
        onEventsRequest({
          pagination: { ...eventsPagination.value, page: 1 },
        })
      }
    }
  },
  { immediate: false },
)

watch(showEventsModal, (isOpen) => {
  if (!isOpen) return
  onEventsRequest({
    pagination: { ...eventsPagination.value, page: 1 },
  })
})

onMounted(() => {
  isPageMounted = true
  // La primera carga usa el histórico completo para mantener alineados los
  // KPIs, las analíticas y la salud mostrada en el selector superior.
  const { from, to } = resolveIsoDateRange(dateRange.value)
  loadAllAnalytics(from, to)

  // 2. Conectar y Suscribir WebSocket en Tiempo Real
  connect((frame) => {
    if (!isPageMounted) return
    console.log('⚡ STOMP WebSocket Conectado con Éxito:', frame)

    unsubscribeLogs = subscribeToTopic('/topic/logs', (newLog) => {
      console.log('⚡ Nuevo log recibido en vivo:', newLog)
      loadDashboardDataSilently()
    })

    unsubscribeMetrics = subscribeToTopic('/topic/metrics', (metrics) => {
      console.log('🔄 Métricas recibidas en tiempo real:', metrics)
      loadDashboardDataSilently()
    })
  })
})

onBeforeUnmount(() => {
  isPageMounted = false
  pageAnalyticsAbortController?.abort()
  if (silentAnalyticsTimer) clearTimeout(silentAnalyticsTimer)
  safeUnsubscribe(unsubscribeLogs, 'logs')
  safeUnsubscribe(unsubscribeMetrics, 'métricas')
  safeUnsubscribe(unsubscribeHealth, 'salud')
  safeUnsubscribe(unsubscribeAlerts, 'alertas')

  unsubscribeLogs = null
  unsubscribeMetrics = null
  unsubscribeHealth = null
  unsubscribeAlerts = null
})

async function openAiDiagnosis(eventItem, index) {
  activeAnalyzingIndex.value = index
  selectedEventForDiagnosis.value = eventItem
  showAiDiagnosisModal.value = true
  aiDiagnosisResult.value = null

  try {
    const res = await AnalyticsService.explainError({
      system: eventItem.system,
      eventCode: eventItem.eventCode,
      message: eventItem.description || eventItem.title || eventItem.eventCode,
    })
    aiDiagnosisResult.value = res?.data || res || null
  } catch (err) {
    console.error('[EscritorioPage] Error al obtener diagnóstico de IA:', err)
  } finally {
    activeAnalyzingIndex.value = null
  }
}
</script>

<style lang="scss" scoped>
.escritorio-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(34, 211, 238, 0.06), transparent 22%),
    radial-gradient(circle at top right, rgba(233, 113, 50, 0.1), transparent 28%),
    linear-gradient(180deg, #050505 0%, #0a0705 100%);
}

.dashboard-header__wrap,
.container {
  max-width: 1400px;
  margin: 0 auto;
  padding-left: 16px;
  padding-right: 16px;
}

.dashboard-hero__title-card {
  background: transparent;
  border: none;
}

.hero-title {
  color: #fff;
  font-size: clamp(1.5rem, 3vw, 2.4rem);
  line-height: 1.1;
  font-weight: 900;
  letter-spacing: -0.04em;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.color-orange-santoro {
  color: #e97132;
}

.border-subtle {
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.bg-dark {
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.02));
}

.letter-spacing-sm {
  letter-spacing: 0.04em;
}

.live-summary-card {
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.025));
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 22px;
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.32);
}

.live-summary-card__icon {
  animation: pulse-soft 1.8s infinite;
}

.live-summary-card__btn {
  border-radius: 12px;
  font-weight: 600;
}

.health-surface--critical {
  background: linear-gradient(135deg, rgba(193, 0, 21, 0.3), rgba(35, 8, 12, 0.96)) !important;
  border-color: rgba(193, 0, 21, 0.8) !important;
  box-shadow:
    inset 4px 0 0 #c10015,
    0 18px 42px rgba(193, 0, 21, 0.18);
}

.health-surface--warning {
  background: linear-gradient(135deg, rgba(233, 113, 50, 0.3), rgba(40, 20, 8, 0.96)) !important;
  border-color: rgba(233, 113, 50, 0.85) !important;
  box-shadow:
    inset 4px 0 0 #e97132,
    0 18px 42px rgba(233, 113, 50, 0.16);
}

.health-surface--stable {
  background: linear-gradient(135deg, rgba(33, 186, 69, 0.24), rgba(8, 35, 16, 0.96)) !important;
  border-color: rgba(33, 186, 69, 0.75) !important;
  box-shadow:
    inset 4px 0 0 #21ba45,
    0 18px 42px rgba(33, 186, 69, 0.12);
}

@keyframes pulse-soft {
  0% {
    transform: scale(0.95);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.05);
    opacity: 1;
  }
  100% {
    transform: scale(0.95);
    opacity: 0.8;
  }
}

.kpi-card {
  border-radius: 16px;
  height: 100%;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.28);
  }
}

.kpi-card__section {
  padding: 20px;
}

.kpi-badge-wrap {
  display: flex;
}

.kpi-health-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  font-size: 1rem;
  border-radius: 10px;
}

.kpi-pulse {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.85;
  animation: pulse 1.6s infinite;
}

.kpi-pulse--critical {
  color: #ff4d4f;
}

.kpi-pulse--warning {
  color: #ffcc00;
}

.kpi-pulse--stable {
  color: #21ba45;
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 currentColor;
    opacity: 0.7;
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 8px transparent;
    opacity: 0;
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 transparent;
    opacity: 0;
  }
}

.section-card {
  border-radius: 20px;
  height: 100%;
}

.section-card__header {
  padding-bottom: 8px;
}

.system-mini-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  transition:
    background 0.2s ease,
    border-color 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.055);
    border-color: rgba(255, 255, 255, 0.12);
  }
}

.friction-list {
  background: transparent;
}

.friction-item {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  margin-bottom: 8px;
  padding-top: 12px;
  padding-bottom: 12px;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
}

.rank-badge {
  font-size: 0.85rem;
  padding: 6px 10px;
  border-radius: 8px;
}

.detail-modal-card {
  max-height: 90vh;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
}

.cases-list-section {
  max-height: 62vh;
  overflow-y: auto;
}

.cases-list-section :deep(.q-item) {
  border-color: rgba(255, 255, 255, 0.08);
}

.ticket-dialog-card {
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.ticket-action-btn {
  max-height: 32px;
  white-space: nowrap;
}

.border-top {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.ticket-dialog-content :deep(.ticket-description-input) {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.82rem;
  line-height: 1.45;
}

.ticket-metadata-panel {
  gap: 8px 16px;
}

.resolve-case-summary {
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.035);
  color: #d5d5d5;
}

/* En móvil reduce márgenes/padding un poco */
@media (max-width: 599px) {
  .dashboard-hero__title-card {
    background: transparent;
  }

  .kpi-card__section {
    padding: 16px;
  }
}
</style>
