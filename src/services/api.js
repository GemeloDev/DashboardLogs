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

export const getUsuariosDispositivosDia = async () => {
  console.log('Llamando endpoint a:', '/main/usuarios-dispositivos-dia')
  const response = await axios.post(`${API_BASE_URL}/main/usuarios-dispositivos-dia`, {})
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

export const getEventosBiometricosPorFiltro = async (payload = {}) => {
  try {
    console.log('�️ Obteniendo eventos biométricos para el mapa...')
    console.log('📦 Payload enviado:', payload)

    // Normalizar payload para asegurar que sea un objeto válido
    const normalizedPayload = {
      ...payload,
      // Asegurar que siempre tengamos fechas válidas
      fechaInicio: payload.fechaInicio || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      fechaFin: payload.fechaFin || new Date().toISOString().split('T')[0]
    }

    console.log('📦 Payload normalizado:', normalizedPayload)

    // Intentar con el endpoint de eventos biométricos
    try {
      const response = await axios.post(`${API_BASE_URL}/eventoBiometrico/findAllByFilter`, { fecha: normalizedPayload.fechaInicio }, {
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json'
        }
      })

      console.log('✅ Respuesta exitosa de eventos biométricos:', response.status)

      // Verificar si la respuesta tiene datos válidos
      if (response.data && Array.isArray(response.data)) {
        return response.data
      } else {
        console.warn('⚠️ Respuesta sin datos válidos del endpoint biométrico')
        return []
      }

    } catch (biometricError) {
      console.warn('⚠️ Error en endpoint biométrico:', biometricError.message)

      // Fallback: intentar con endpoints alternativos disponibles
      try {
        console.log('� Intentando endpoint alternativo para el mapa...')
        const response = await axios.post(`${API_BASE_URL}/main/eventos-fallidos`, normalizedPayload, {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json'
          }
        })

        console.log('✅ Respuesta del endpoint alternativo:', response.status)

        // Adaptar los datos para el mapa
        if (response.data && Array.isArray(response.data)) {
          return response.data.map(evento => ({
            ...evento,
            gps: evento.gps || `${19.4326 + (Math.random() - 0.5) * 0.01},${-99.1332 + (Math.random() - 0.5) * 0.01}`, // GPS por defecto en CDMX
            usuario: { usuario: evento.usuario || 'Usuario desconocido' },
            tipoEvento: { detalle: evento.tipoEvento || 'Sin especificar' },
            resultadoDescripcion: evento.resultadoEvento || 'Sin descripción',
            fechaHoraDia: evento.fecha || new Date().toISOString()
          }))
        }

        return []
      } catch (alternativeError) {
        console.warn('⚠️ Endpoint alternativo también falló:', alternativeError.message)
        return []
      }
    }

  } catch (error) {
    console.error('❌ Error general al obtener eventos para el mapa:', error)

    // En caso de error total, devolver array vacío en lugar de lanzar error
    return []
  }
}

// Función para obtener resumen de logs por área geográfica
export const getResumenLogsPorArea = async (lat, lng, radio = 0.01, filtros = {}) => {
  try {
    console.log('🗺️ Obteniendo resumen de logs por área:', { lat, lng, radio })

    // Primero intentar obtener todos los eventos de la zona
    const eventos = await getEventosBiometricosPorFiltro(filtros)

    if (!eventos || eventos.length === 0) {
      console.log('⚠️ No se encontraron eventos en la consulta')
      return {
        totalEventos: 0,
        eventosPorTipo: [],
        eventosPorEstado: [],
        ubicacion: { lat, lng },
        radio,
        usuariosUnicos: 0,
        promedioEventosPorUsuario: 0,
        dispositivosEnArea: [],
        eventos: [],
        mensaje: 'No hay eventos registrados en el periodo seleccionado'
      }
    }

    // Filtrar eventos dentro del radio especificado
    const eventosEnArea = eventos.filter(evento => {
      if (!evento.gps || typeof evento.gps !== 'string') return false

      const [eventLat, eventLng] = evento.gps.split(',').map(parseFloat)
      if (isNaN(eventLat) || isNaN(eventLng)) return false

      // Excluir coordenadas inválidas como (0,0) o muy cerca del origen
      if (Math.abs(eventLat) < 0.01 && Math.abs(eventLng) < 0.01) return false

      // Calcular distancia aproximada (fórmula simple para distancias cortas)
      const deltaLat = Math.abs(lat - eventLat)
      const deltaLng = Math.abs(lng - eventLng)
      const distancia = Math.sqrt(deltaLat * deltaLat + deltaLng * deltaLng)

      return distancia <= radio
    })

    // Analizar eventos por tipo
    const eventosPorTipo = eventosEnArea.reduce((acc, evento) => {
      const tipo = evento.tipoEvento?.detalle || evento.tipoEvento || 'Sin especificar'
      acc[tipo] = (acc[tipo] || 0) + 1
      return acc
    }, {})

    // Analizar eventos por estado/resultado
    const eventosPorEstado = eventosEnArea.reduce((acc, evento) => {
      const estado = evento.resultadoDescripcion || evento.resultadoEvento || 'Sin estado'
      acc[estado] = (acc[estado] || 0) + 1
      return acc
    }, {})

    // Calcular usuarios únicos
    const usuariosUnicos = new Set(
      eventosEnArea
        .map(evento => evento.usuario?.usuario || evento.usuario)
        .filter(Boolean)
    ).size

    // Calcular promedio de eventos por usuario
    const promedioEventosPorUsuario = usuariosUnicos > 0 ? eventosEnArea.length / usuariosUnicos : 0

    // Calcular dispositivos únicos en el área
    const dispositivosEnArea = eventosEnArea.reduce((acc, evento) => {
      const dispositivo = evento.dispositivo || 'Sin especificar'
      acc[dispositivo] = (acc[dispositivo] || 0) + 1
      return acc
    }, {})

    // Si no hay eventos en el área específica, proporcionar información útil
    if (eventosEnArea.length === 0) {
      const totalEventosValidos = eventos.filter(evento => {
        if (!evento.gps || typeof evento.gps !== 'string') return false
        const [eventLat, eventLng] = evento.gps.split(',').map(parseFloat)
        return !isNaN(eventLat) && !isNaN(eventLng) && !(Math.abs(eventLat) < 0.01 && Math.abs(eventLng) < 0.01)
      }).length

      return {
        totalEventos: 0,
        eventosPorTipo: [],
        eventosPorEstado: [],
        ubicacion: { lat, lng },
        radio,
        usuariosUnicos: 0,
        promedioEventosPorUsuario: 0,
        dispositivosEnArea: [],
        eventos: [],
        mensaje: `No hay eventos en esta área (radio: ${(radio * 111).toFixed(1)}km). Total de eventos válidos en el periodo: ${totalEventosValidos}`
      }
    }

    return {
      totalEventos: eventosEnArea.length,
      eventosPorTipo: Object.entries(eventosPorTipo).map(([tipo, cantidad]) => ({ tipo, cantidad })),
      eventosPorEstado: Object.entries(eventosPorEstado).map(([estado, cantidad]) => ({ estado, cantidad })),
      ubicacion: { lat, lng },
      radio,
      usuariosUnicos,
      promedioEventosPorUsuario: Math.round(promedioEventosPorUsuario * 10) / 10,
      dispositivosEnArea: Object.entries(dispositivosEnArea).map(([dispositivo, cantidad]) => ({ dispositivo, cantidad })),
      eventos: eventosEnArea.slice(0, 10) // Máximo 10 eventos para el detalle
    }

  } catch (error) {
    console.error('❌ Error al obtener resumen de logs por área:', error)
    return {
      totalEventos: 0,
      eventosPorTipo: [],
      eventosPorEstado: [],
      ubicacion: { lat, lng },
      radio,
      usuariosUnicos: 0,
      promedioEventosPorUsuario: 0,
      dispositivosEnArea: [],
      error: error.message
    }
  }
}

export const getFuncionalidadesEstado = async (payload) => {
  console.log('Llamando endpoint a:', '/main/funcionalidades-estado')
  const response = await axios.post(`${API_BASE_URL}/main/funcionalidades-estado`, payload)
  return response.data
}
