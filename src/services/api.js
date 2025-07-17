import axios from 'axios'

const API_BASE_URL = 'http://187.188.66.56:8030'

export const getPorcentajePromedioTipo = async (payload) => {
  const response = await axios.post(`${API_BASE_URL}/main/porcentaje-promedio-tipo`, payload)
  return response.data
}

export async function getDuracionPromedioFuncionalidad(payload) {
  console.log('Llamando endpoint a:', '/main/duracion-promedio-funcionalidad')
  const { data } = await axios.post(`${API_BASE_URL}/main/duracion-promedio-funcionalidad`, payload)
  return data
}

export const getDispositivosMasUsados = async (payload) => {
  console.log('Llamando endpoint a:', '/main/dispositivos-mas-usados')
  const response = await axios.post(`${API_BASE_URL}/main/dispositivos-mas-usados`, payload)
  return response.data
}

export const getEventosPorMes = async (payload) => {
  console.log('Llamando endpoint a:', '/main/eventos-por-mes')
  const response = await axios.post(`${API_BASE_URL}/main/eventos-por-mes`, payload)
  return response.data
}

export const getEventosPorDia = async (payload) => {
  console.log('Llamando endpoint a:', '/main/eventos-por-dia')
  const response = await axios.post(`${API_BASE_URL}/main/eventos-por-dia`, payload)
  return response.data
}

export const getEventosPorSemana = async (payload) => {
  console.log('Llamando endpoint a:', '/main/eventos-por-semana')
  const response = await axios.post(`${API_BASE_URL}/main/eventos-por-semana`, payload)
  return response.data
}

export const getEventosAbiertos = async (payload) => {
  console.log('Llamando endpoint a:', '/main/eventos-abiertos')
  const response = await axios.post(`${API_BASE_URL}/main/eventos-abiertos`, payload)
  return response.data
}

export const getEventosPorTipo = async (payload) => {
  console.log('Llamando endpoint a:', '/main/eventos-por-tipo')
  const response = await axios.post(`${API_BASE_URL}/main/eventos-por-tipo`, payload)
  return response.data
}

export const getUsuariosOffline = async (payload) => {
  console.log('Llamando endpoint a:', '/main/usuarios-offline')
  const response = await axios.post(`${API_BASE_URL}/main/usuarios-offline`, payload)
  return response.data
}

export const getUsuariosDispositivosDia = async (payload) => {
  console.log('Llamando endpoint a:', '/main/usuarios-dispositivos-dia')
  const response = await axios.post(`${API_BASE_URL}/main/usuarios-dispositivos-dia`, payload)
  return response.data
}

export const getEventosFallidos = async (payload) => {
  console.log('Llamando endpoint a:', '/main/eventos-fallidos')
  const response = await axios.post(`${API_BASE_URL}/main/eventos-fallidos`, payload)
  return response.data
}

export const getEventosPorEstado = async (payload) => {
  console.log('Llamando endpoint a:', '/main/eventos-por-estado')
  const response = await axios.post(`${API_BASE_URL}/main/eventos-por-estado`, payload)
  return response.data
}

export const getValidadosTFLite = async (payload) => {
  console.log('Llamando endpoint a:', '/main/validados-tflite')
  const response = await axios.post(`${API_BASE_URL}/main/validados-tflite`, payload)
  return response.data
}

export const getPorcentajeOffline = async (payload) => {
  console.log('Llamando endpoint a:', '/main/porcentaje-offline')
  const response = await axios.post(`${API_BASE_URL}/main/porcentaje-offline`, payload)
  return response.data
}

export const getTiempoRespuestaPromedio = async (payload) => {
  console.log('Llamando endpoint a:', '/main/tiempo-respuesta-promedio')
  const response = await axios.post(`${API_BASE_URL}/main/tiempo-respuesta-promedio`, payload)
  return response.data
}

export const getOvalAlineado = async (payload) => {
  console.log('Llamando endpoint a:', '/main/oval-alineado')
  const response = await axios.post(`${API_BASE_URL}/main/oval-alineado`, payload)
  return response.data
}

export const getFuncionalidadesMasUsadas = async (payload) => {
  console.log('Llamando endpoint a:', '/main/funcionalidades-mas-usadas')
  const response = await axios.post(`${API_BASE_URL}/main/funcionalidades-mas-usadas`, payload)
  return response.data
}

export const getEventosTiempoRespuesta = async (payload) => {
  console.log('Llamando endpoint a:', '/main/eventos-tiempo-respuesta')
  const response = await axios.post(`${API_BASE_URL}/main/eventos-tiempo-respuesta`, payload)
  return response.data
}

export const getMayorTiempoUsoFuncionalidad = async (payload) => {
  console.log('Llamando endpoint a:', '/main/mayor-tiempo-uso-funcionalidad')
  const response = await axios.post(`${API_BASE_URL}/main/mayor-tiempo-uso-funcionalidad`, payload)
  return response.data
}

export const getFuncionalidadesMultiplesUsos = async () => {
  console.log('Llamando endpoint a: /main/funcionalidades-multiples-usos')
  const response = await axios.post(`${API_BASE_URL}/main/funcionalidades-multiples-usos`, {})
  return response.data
}

export const getEventoBiometricofindAllByFilter = async (payload) => {
  console.log(`${API_BASE_URL}/eventoBiometrico/findAllByFilter`)
  const response = await axios.post(`${API_BASE_URL}/eventoBiometrico/findAllByFilter`, payload)
  return response.data
}
