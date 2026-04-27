import { DASHBOARD_PANEL_IDS } from './dashboardPanels'

export const DASHBOARD_SECTION_IDS = {
  FUNCTIONS: 'functions',
  ACTIVITY: 'activity',
  TOPLISTS: 'toplists',
  STATUS: 'status',
  SEVERITY_HTTP: 'severity-http',
  TIME_SERIES: 'time-series',
  GEO_DEVICES: 'geo-devices',
}

export const DASHBOARD_SECTIONS = [
  {
    id: DASHBOARD_SECTION_IDS.FUNCTIONS,
    titleKey: 'dashboard.sectionFunctions',
    width: 1520,
    height: 980,
    panels: [DASHBOARD_PANEL_IDS.EVENT_TYPES, DASHBOARD_PANEL_IDS.COVERAGE],
  },
  {
    id: DASHBOARD_SECTION_IDS.ACTIVITY,
    titleKey: 'dashboard.panelActivityToday',
    width: 1180,
    height: 900,
    panels: [DASHBOARD_PANEL_IDS.ACTIVITY],
  },
  {
    id: DASHBOARD_SECTION_IDS.TOPLISTS,
    titleKey: 'dashboard.sectionToplists',
    width: 1480,
    height: 920,
    panels: [DASHBOARD_PANEL_IDS.OFFICES, DASHBOARD_PANEL_IDS.TAGS, DASHBOARD_PANEL_IDS.OUTCOMES],
  },
  {
    id: DASHBOARD_SECTION_IDS.STATUS,
    titleKey: 'dashboard.panelStatusTimeline',
    width: 1380,
    height: 920,
    panels: [DASHBOARD_PANEL_IDS.STATUS_TIMELINE],
  },
  {
    id: DASHBOARD_SECTION_IDS.SEVERITY_HTTP,
    titleKey: 'dashboard.sectionSeverityHttp',
    width: 1440,
    height: 980,
    panels: [DASHBOARD_PANEL_IDS.SEVERITY, DASHBOARD_PANEL_IDS.HTTP],
  },
  {
    id: DASHBOARD_SECTION_IDS.TIME_SERIES,
    titleKey: 'dashboard.sectionTimeSeries',
    width: 1480,
    height: 940,
    panels: [
      DASHBOARD_PANEL_IDS.EVENTS_DAY,
      DASHBOARD_PANEL_IDS.EVENTS_WEEK,
      DASHBOARD_PANEL_IDS.EVENTS_MONTH,
    ],
  },
  {
    id: DASHBOARD_SECTION_IDS.GEO_DEVICES,
    titleKey: 'dashboard.panelGeoDevices',
    width: 1480,
    height: 980,
    panels: [DASHBOARD_PANEL_IDS.GEO],
  },
]

const PANEL_TO_SECTION = new Map(
  DASHBOARD_SECTIONS.flatMap((section) => section.panels.map((panelId) => [panelId, section.id])),
)

export function getDashboardSectionDefinition(sectionId) {
  return DASHBOARD_SECTIONS.find((section) => section.id === sectionId) || null
}

export function getDashboardSectionIdFromPanel(panelId) {
  return PANEL_TO_SECTION.get(panelId) || null
}
