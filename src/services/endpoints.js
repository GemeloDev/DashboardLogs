import { API_BASE_URL } from './apiConfig'

// DTOs y endpoints
export const endpoints = {
  // Logs
  logs: `${API_BASE_URL}/dashboard/passports/events`,

  // Catálogos
  catalogSummary: `${API_BASE_URL}/dashboard/passports/summary`,
  catalogEvents: `${API_BASE_URL}/dashboard/passports/events`,
  catalogOficinas: `${API_BASE_URL}/dashboard/passports/by-office`,
  catalogDevices: `${API_BASE_URL}/dashboard/passports/events`,
  catalogEstatus: `${API_BASE_URL}/dashboard/passports/by-type`,
  catalogPersons: `${API_BASE_URL}/core/users`,
}

// DTOs para diferentes tipos de consultas - FLUJO REFACTORIZADO
export function buildErrorLogsQuery(filtros) {
  const params = {
    type: 'ERROR',
    fromDate: filtros.fechaInicio,
    toDate: filtros.fechaFin,
  }

  if (filtros.oficina) params.oficinaId = filtros.oficina
  if (filtros.proceso) params.process = filtros.proceso
  if (filtros.dispositivo) params.device = filtros.dispositivo
  if (filtros.usuario) params.personId = filtros.usuario
  if (filtros.escaner) params.scanDevice = filtros.escaner

  return { url: endpoints.logsFilter, params }
}

export function buildScanSummaryQuery(filtros) {
  const params = {
    fromDate: filtros.fechaInicio,
    toDate: filtros.fechaFin,
  }

  if (filtros.oficina) params.oficinaId = filtros.oficina
  if (filtros.proceso && ['QR', 'MRZ'].includes(filtros.proceso)) {
    params.process = filtros.proceso
  }

  return { url: endpoints.logsSummary, params }
}

export function buildLoginLogsQuery(filtros, tipoLogin = 'SUCCESS') {
  const params = {
    type: tipoLogin,
    process: 'LOGIN',
    fromDate: filtros.fechaInicio,
    toDate: filtros.fechaFin,
  }

  if (filtros.oficina) params.oficinaId = filtros.oficina
  if (filtros.dispositivo) params.device = filtros.dispositivo
  if (filtros.usuario) params.personId = filtros.usuario

  return { url: endpoints.logsFilter, params }
}

export function buildRegisterLogsQuery(filtros) {
  const params = {
    process: 'REGISTER',
    fromDate: filtros.fechaInicio,
    toDate: filtros.fechaFin,
  }

  if (filtros.oficina) params.oficinaId = filtros.oficina
  if (filtros.dispositivo) params.device = filtros.dispositivo
  if (filtros.usuario) params.personId = filtros.usuario
  if (filtros.tipoLog) params.type = filtros.tipoLog

  return { url: endpoints.logsFilter, params }
}

export function buildExportLogsQuery(filtros) {
  const params = {
    type: 'EXPORT',
    fromDate: filtros.fechaInicio,
    toDate: filtros.fechaFin,
  }

  if (filtros.oficina) params.oficinaId = filtros.oficina
  if (filtros.tipoExportacion) params.process = filtros.tipoExportacion
  if (filtros.formato) params.formato = filtros.formato
  if (filtros.tipoDatos) params.datos = filtros.tipoDatos

  return { url: endpoints.logsFilter, params }
}

export function buildConsolaLogsQuery(filtros) {
  const params = {
    fromDate: filtros.fechaInicio,
    toDate: filtros.fechaFin,
  }

  if (filtros.oficina) params.oficinaId = filtros.oficina
  if (filtros.usuario) params.personId = filtros.usuario
  if (filtros.dispositivo) params.device = filtros.dispositivo
  if (filtros.escaner) params.scanDevice = filtros.escaner
  if (filtros.proceso) params.process = filtros.proceso
  if (filtros.tipoLog) params.type = filtros.tipoLog

  return { url: endpoints.logsFilter, params }
}

// FUNCIONES LEGACY - MANTENER COMPATIBILIDAD
export function getLoginLogs({ type, fromDate, toDate, oficinaId, personId, device }) {
  return buildLoginLogsQuery({
    fechaInicio: fromDate,
    fechaFin: toDate,
    oficina: oficinaId,
    usuario: personId,
    dispositivo: device
  }, type)
}

export function getErrorLogs({ fromDate, toDate, oficinaId, personId, device }) {
  return buildErrorLogsQuery({
    fechaInicio: fromDate,
    fechaFin: toDate,
    oficina: oficinaId,
    usuario: personId,
    dispositivo: device
  })
}

export function getRegisterLogs({ fromDate, toDate, oficinaId, personId, device }) {
  return buildRegisterLogsQuery({
    fechaInicio: fromDate,
    fechaFin: toDate,
    oficina: oficinaId,
    usuario: personId,
    dispositivo: device
  })
}

export function getExportLogs({ fromDate, toDate, oficinaId, personId, device }) {
  return buildExportLogsQuery({
    fechaInicio: fromDate,
    fechaFin: toDate,
    oficina: oficinaId,
    usuario: personId,
    dispositivo: device
  })
}

export function getScanSummary({ fromDate, toDate, oficinaId, personId, device }) {
  return buildScanSummaryQuery({
    fechaInicio: fromDate,
    fechaFin: toDate,
    oficina: oficinaId,
    usuario: personId,
    dispositivo: device
  })
}

export function getAllLogs({ fromDate, toDate, type, process, device, scanDevice, personId, oficinaId }) {
  return buildConsolaLogsQuery({
    fechaInicio: fromDate,
    fechaFin: toDate,
    tipoLog: type,
    proceso: process,
    dispositivo: device,
    escaner: scanDevice,
    usuario: personId,
    oficina: oficinaId
  })
}

// Otros DTOs pueden agregarse aquí
