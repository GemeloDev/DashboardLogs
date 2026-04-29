/**
 * ════════════════════════════════════════════════════════════════
 * ENDPOINTS - Fuente única de verdad para URLs del backend
 * ════════════════════════════════════════════════════════════════
 *
 * Todos los endpoints de la API centralizados en un solo lugar.
 *
 * IMPORTANTE: No hardcodear URLs. Todas las URLs se construyen
 * dinámicamente desde la configuración de entorno.
 *
 * Uso:
 *   import { AUTH, CORE, ADMIN, LOGS, EVA } from 'src/services/endpoints'
 *   axios.get(AUTH.LOGIN)
 * ════════════════════════════════════════════════════════════════
 */

import { API_BASE_URL, API_TIMEOUT } from 'src/config/env'

// ─── Base URL ────────────────────────────────────────────────────
// Importada desde configuración central
export const BASE_URL = API_BASE_URL

// ─── Configuración global de peticiones ──────────────────────────
export const REQUEST_CONFIG = {
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
}

/**
 * Construye la configuración para axios incluyendo el Bearer token opcional.
 */
export function buildApiConfig({ token = null, withCredentials = false } = {}) {
  const headers = { ...REQUEST_CONFIG.headers }
  if (token) headers.Authorization = `Bearer ${token}`
  return { ...REQUEST_CONFIG, headers, withCredentials }
}

/**
 * Construye una URL con query params, ignorando valores nulos/vacíos.
 */
export function buildUrl(base, params = {}) {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v !== null && v !== undefined && v !== '') q.set(k, String(v))
  }
  const qs = q.toString()
  return qs ? `${base}?${qs}` : base
}

// ─── Helpers de prefijo ───────────────────────────────────────────
export const url = {
  api: (path) => `${BASE_URL}${path}`,
  auth: (path) => `${BASE_URL}/auth${path}`,
  core: (path) => `${BASE_URL}/core${path}`,
  admin: (path) => `${BASE_URL}/admin${path}`,
  ai: (path) => `${BASE_URL}/ai${path}`,
}

// ─── Autenticación ────────────────────────────────────────────────────────────

export const AUTH = {
  LOGIN: `${BASE_URL}/auth/login`,
  LOGOUT: `${BASE_URL}/auth/logout`,
  REGISTER: `${BASE_URL}/auth/register`,
  VERIFY_TOKEN: `${BASE_URL}/auth/verify`,
  REFRESH_TOKEN: `${BASE_URL}/auth/refresh`,
  RESET_PASSWORD: `${BASE_URL}/auth/change-password`,
  ACCEPT_INVITE: `${BASE_URL}/auth/accept-invite`,
  LOGIN_QR: `${BASE_URL}/auth/qr-login`,
  QR_TOKEN: `${BASE_URL}/auth/qr-token`,
}

// ─── Core (usuarios, configuración) ──────────────────────────────────────────

export const CORE = {
  USERS: `${BASE_URL}/core/users`,
  CONFIG: `${BASE_URL}/config`,
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export const ADMIN = {
  INVITES: `${BASE_URL}/admin/invites`,
}

// ─── Logs y Dashboard ─────────────────────────────────────────────────────────

export const LOGS = {
  EVENTS: `${BASE_URL}/logs/events/all`,
  EVENTS_RAW: `${BASE_URL}/logs/events`,
  TIMELINE: `${BASE_URL}/logs/timeline`,
  STATS: `${BASE_URL}/logs/dashboard/stats`,
}

export const DASHBOARD = {
  STATS: `${BASE_URL}/logs/dashboard/stats`,
  SERIES: `${BASE_URL}/logs/dashboard/series`,
  HTTP: `${BASE_URL}/logs/dashboard/http`,
  GEO: `${BASE_URL}/logs/dashboard/geo`,
}

export const DEVICES = {
  SUMMARY: `${BASE_URL}/devices`,
}

// ─── Catálogos ────────────────────────────────────────────────────────────────

export const CATALOGS = {
  API_KEYS: `${BASE_URL}/catalogs/api-keys`,
}

// ─── Panel Santoro (admin interno) ───────────────────────────────────────────

export const SANTORO = {
  STATS: `${BASE_URL}/santoro/panel/stats`,
  EMPRESAS: `${BASE_URL}/santoro/panel/organizations`,
  USUARIOS: `${BASE_URL}/santoro/panel/users`,
  API_KEYS: `${BASE_URL}/santoro/panel/api-keys`,
}

// ─── Eva (IA) ─────────────────────────────────────────────────────────────────

export const EVA = {
  STREAM: `${BASE_URL}/ai/eva/stream`,
  DAILY_PRETTY: `${BASE_URL}/ai/llm/assist/manager/daily/pretty`,
  ALERTS: `${BASE_URL}/ai/alerts`,
  METRICS_SERIES: `${BASE_URL}/ai/metrics/series`,
  HOURLY_INSIGHTS: `${BASE_URL}/ai/summaries/hourly/insights`,
  CATALOGS_SYSTEMS: `${BASE_URL}/ai/catalogs/systems`,
  alertExplain: (id) => `${BASE_URL}/ai/alerts/${id}/explain/operator`,
  ticketDraft: (id) => `${BASE_URL}/ai/alerts/${id}/ticket/draft`,
}

// ─── WebSocket ────────────────────────────────────────────────────────────────

export const SOCKET = {
  URL: process.env.SOCKET_URL ?? '',
  TOPIC: process.env.SOCKET_TOPIC ?? '/topic/qr-login',
}
