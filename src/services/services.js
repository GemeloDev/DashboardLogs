// src/services/services.js
import axios from 'axios'

const API = axios.create({
  baseURL: '187.188.66.56:8030',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Funciones para cada endpoint
export const getUsuariosDispositivosDia = (data) =>
  API.post('/main/usuarios-dispositivos-dia', data)

export const getEventosFallidos = (data) => API.post('/main/eventos-fallidos', data)

export const getUsuariosOffline = (data) => API.post('/main/usuarios-offline', data)

export const getEventosPorTipo = (data) => API.post('/main/eventos-por-tipo', data)

export const getPorcentajePromedioTipo = (data) => API.post('/main/porcentaje-promedio-tipo', data)

export const getEventosPorEstado = (data) => API.post('/main/eventos-por-estado', data)

export const getValidadosTFLite = (data) => API.post('/main/validados-tflite', data)

export const getEventosTiempoRespuesta = (data) => API.post('/main/eventos-tiempo-respuesta', data)

export const getDispositivosMasUsados = (data) => API.post('/main/dispositivos-mas-usados', data)

export const getOvalAlineado = (data) => API.post('/main/oval-alineado', data)

export const getDuracionPromedioFuncionalidad = (data) =>
  API.post('/main/duracion-promedio-funcionalidad', data)

export const getFuncionalidadesMasUsadas = (data) =>
  API.post('/main/funcionalidades-mas-usadas', data)

export const getMayorTiempoUsoFuncionalidad = (data) =>
  API.post('/main/mayor-tiempo-uso-funcionalidad', data)

export const getFuncionalidadesMultiplesUsos = (data) =>
  API.post('/main/funcionalidades-multiples-usos', data)

export const getEventosAbiertos = (data) => API.post('/main/eventos-abiertos', data)

export const getEventosPorDia = (data) => API.post('/main/eventos-por-dia', data)

export const getEventosPorSemana = (data) => API.post('/main/eventos-por-semana', data)

export const getEventosPorMes = (data) => API.post('/main/eventos-por-mes', data)

export const getPorcentajeOffline = (data) => API.post('/main/porcentaje-offline', data)

export const getTiempoRespuestaPromedio = (data) =>
  API.post('/main/tiempo-respuesta-promedio', data)
