export const DASHBOARD_PANEL_IDS = {
  ACTIVITY: 'activity',
  EVENT_TYPES: 'eventTypes',
  COVERAGE: 'coverage',
  OFFICES: 'offices',
  TAGS: 'tags',
  OUTCOMES: 'outcomes',
  STATUS_TIMELINE: 'statusTimeline',
  SEVERITY: 'severity',
  HTTP: 'http',
  EVENTS_DAY: 'eventsDay',
  EVENTS_WEEK: 'eventsWeek',
  EVENTS_MONTH: 'eventsMonth',
  GEO: 'geo',
}

export const DASHBOARD_PANELS = [
  {
    id: DASHBOARD_PANEL_IDS.ACTIVITY,
    titleKey: 'dashboard.panelActivityToday',
    width: 1180,
    height: 900,
  },
  {
    id: DASHBOARD_PANEL_IDS.EVENT_TYPES,
    titleKey: 'dashboard.topFunctions',
    width: 1360,
    height: 920,
  },
  {
    id: DASHBOARD_PANEL_IDS.COVERAGE,
    titleKey: 'dashboard.coverageFunctions',
    width: 980,
    height: 900,
  },
  {
    id: DASHBOARD_PANEL_IDS.OFFICES,
    titleKey: 'dashboard.topLocations',
    width: 980,
    height: 860,
  },
  {
    id: DASHBOARD_PANEL_IDS.TAGS,
    titleKey: 'common.tags',
    width: 980,
    height: 860,
  },
  {
    id: DASHBOARD_PANEL_IDS.OUTCOMES,
    titleKey: 'dashboard.topOutcomes',
    width: 980,
    height: 860,
  },
  {
    id: DASHBOARD_PANEL_IDS.STATUS_TIMELINE,
    titleKey: 'dashboard.panelStatusTimeline',
    width: 1320,
    height: 860,
  },
  {
    id: DASHBOARD_PANEL_IDS.SEVERITY,
    titleKey: 'dashboard.panelSeverity',
    width: 1120,
    height: 920,
  },
  {
    id: DASHBOARD_PANEL_IDS.HTTP,
    titleKey: 'dashboard.http',
    width: 1120,
    height: 960,
  },
  {
    id: DASHBOARD_PANEL_IDS.EVENTS_DAY,
    titleKey: 'dashboard.eventsByDay',
    width: 980,
    height: 860,
  },
  {
    id: DASHBOARD_PANEL_IDS.EVENTS_WEEK,
    titleKey: 'dashboard.eventsByWeek',
    width: 980,
    height: 860,
  },
  {
    id: DASHBOARD_PANEL_IDS.EVENTS_MONTH,
    titleKey: 'dashboard.eventsByMonth',
    width: 980,
    height: 860,
  },
  {
    id: DASHBOARD_PANEL_IDS.GEO,
    titleKey: 'dashboard.panelGeoDevices',
    width: 1380,
    height: 940,
  },
]

export function getDashboardPanelDefinition(panelId) {
  return DASHBOARD_PANELS.find((panel) => panel.id === panelId) || null
}
