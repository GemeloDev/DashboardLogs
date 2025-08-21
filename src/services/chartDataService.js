import axios from 'axios'
import { API_BASE_URL } from './apiConfig'

// Servicio para gráficas mejoradas según especificaciones técnicas
export class ChartDataService {

  // Helper para construir parámetros de filtrado consistentes
  static buildFilterParams(filtros, additionalParams = {}) {
    const params = new URLSearchParams({
      fromDate: filtros.fechaInicio || '2025-01-01',
      toDate: filtros.fechaFin || '2025-12-31',
      ...additionalParams
    })

    // Filtros avanzados opcionales
    if (filtros.oficina) params.append('oficinaId', filtros.oficina)
    if (filtros.tipo) params.append('type', filtros.tipo)
    if (filtros.proceso) params.append('process', filtros.proceso)
    if (filtros.dispositivo) params.append('device', filtros.dispositivo)
    if (filtros.escaner) params.append('scanDevice', filtros.escaner)
    if (filtros.usuario) params.append('personId', filtros.usuario)

    return params
  }

  // 1. Gráfica de Exportaciones con manejo robusto de errores
  static async getExportacionesData(filtros) {
    try {
      const params = this.buildFilterParams(filtros, { type: 'EXPORT' })

      console.log('🔍 Solicitando exportaciones con filtros:', Object.fromEntries(params))

      // Intentar obtener datos con timeout
      const response = await Promise.race([
        axios.get(`${API_BASE_URL}/logs/filter?${params}`),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout de exportaciones')), 15000)
        )
      ])

      console.log('📊 Respuesta exportaciones:', {
        status: response.status,
        dataLength: Array.isArray(response.data) ? response.data.length : 'No es array',
        dataType: typeof response.data,
        muestra: Array.isArray(response.data) ? response.data.slice(0, 2) : response.data
      })

      // Verificar si la respuesta es válida
      if (response.data === null ||
        response.data === undefined) {
        console.log('⚠️ API sin datos de exportaciones válidos - retornando estado vacío')
        return this.getEmptyChartData()
      }

      // Si es PRO FEATURE ONLY, usar datos de ejemplo temporalmente para debugging
      if (response.data === 'PRO FEATURE ONLY') {
        return this.getSampleExportacionesData()
      }

      // Si no es array o está vacío, retornar estado vacío
      if (!Array.isArray(response.data) || response.data.length === 0) {
        console.log('⚠️ API sin datos de exportaciones válidos (no array o vacío) - retornando estado vacío')
        return this.getEmptyChartData()
      }

      return this.processExportacionesData(response.data)
    } catch (error) {
      console.error('❌ Error al obtener datos de exportaciones:', error)

      // Retornar estado vacío en caso de error
      if (error.response?.status === 500) {
        console.log('🔄 Error 500, retornando estado vacío para exportaciones')
        return this.getEmptyChartData()
      }

      return this.getEmptyChartData()
    }
  }

  // Función helper para datos de muestra de exportaciones (temporal para PRO FEATURE ONLY)
  static getSampleExportacionesData() {
    const hoy = new Date()
    const categorias = []
    for (let i = 6; i >= 0; i--) {
      const fecha = new Date(hoy)
      fecha.setDate(fecha.getDate() - i)
      categorias.push(fecha.toISOString().split('T')[0])
    }

    return {
      series: [
        {
          name: 'JSON',
          data: [5, 8, 3, 12, 7, 15, 9],
          backgroundColor: '#4CAF50',
          borderColor: '#388E3C'
        },
        {
          name: 'TXT',
          data: [3, 5, 2, 8, 4, 10, 6],
          backgroundColor: '#2196F3',
          borderColor: '#1976D2'
        },
        {
          name: 'Excel',
          data: [2, 3, 1, 5, 4, 7, 3],
          backgroundColor: '#FF9800',
          borderColor: '#F57C00'
        }
      ],
      categorias,
      detalles: [],
      isEmpty: false,
      isSample: true
    }
  }

  // Procesar datos de exportaciones
  static processExportacionesData(rawData) {
    console.log('Raw data para exportaciones:', rawData)

    if (!Array.isArray(rawData) || rawData.length === 0) {
      console.log('No hay datos válidos para exportaciones')
      return this.getEmptyChartData()
    }

    // Agrupar por fecha y extraer formato del mensaje
    const agrupados = {}
    const detalles = []

    rawData.forEach(item => {
      console.log(item.oficina.nombre, 'xddddddddddddd');
      // Manejar tanto formato real (minúsculas) como formato de muestra (mayúsculas)
      const dateField = item.date || item.Date
      const messageField = item.message || item.Message
      const oficinaField = item.oficina?.nombre
      const personField = item.person || item.Person

      // Validar que el item tenga la estructura esperada
      if (!dateField) {
        console.warn('Item sin fecha válida:', item)
        return
      }

      const fecha = new Date(dateField)
      if (isNaN(fecha.getTime())) {
        console.warn('Fecha inválida:', dateField)
        return
      }

      const fechaStr = fecha.toISOString().split('T')[0]

      // Extraer formato del mensaje (JSON, TXT, Excel)
      let formato = 'json' // Cambiar default de 'otros' a 'json'
      if (messageField) {
        const formatoMatch = messageField.match(/Formato:\s*(\w+)/i)
        if (formatoMatch) {
          formato = formatoMatch[1].toLowerCase()
        } else {
          // Si no hay formato explícito, usar heurística basada en el mensaje
          const msg = messageField.toLowerCase()
          if (msg.includes('excel') || msg.includes('xlsx')) {
            formato = 'excel'
          } else if (msg.includes('txt') || msg.includes('text')) {
            formato = 'txt'
          } else if (msg.includes('json')) {
            formato = 'json'
          } else {
            formato = 'json' // Default a json en lugar de otros
          }
        }
      }

      if (!agrupados[fechaStr]) {
        agrupados[fechaStr] = { json: 0, txt: 0, excel: 0 } // Quitar 'otros'
      }

      // Solo incrementar si el formato es válido
      if (formato in agrupados[fechaStr]) {
        agrupados[fechaStr][formato] += 1
      } else {
        agrupados[fechaStr].json += 1 // Default a json
      }

      console.log(oficinaField);
      // Guardar detalles COMPLETOS preservando todos los datos originales de la API
      detalles.push({
        // Datos procesados para visualización
        fecha: fechaStr,
        formato: formato in agrupados[fechaStr] ? formato : 'json',
        oficina: oficinaField || 'No especificada',
        usuario: personField?.nombres + ' ' + personField?.primerApellido + ' ' + personField?.segundoApellido || 'No especificado',
        hora: fecha.toLocaleTimeString(),
        fechaCompleta: fecha.toLocaleString(),

        // IMPORTANTE: Preservar TODOS los datos originales de la API
        ...item, // Incluir el item completo original

        // Campos específicos para asegurar compatibilidad
        device: item.device || item.Device || item.Dispositivo,
        scanner: item.scanDevice || item.Scanner || item.scanner,
        person: item.person || item.Person,
        message: item.message || item.Message,
        type: item.type || item.Type,
        process: item.process || item.Process,
        trackingCode: item.trackingCode || item.TrackingCode,
        id: item.id || item.ID
      })
    })

    console.log('Datos agrupados exportaciones:', agrupados)

    // Convertir a formato de Chart.js
    const categorias = Object.keys(agrupados).sort()
    const series = [
      {
        name: 'JSON',
        data: categorias.map(fecha => agrupados[fecha].json),
        backgroundColor: '#4CAF50',
        borderColor: '#388E3C'
      },
      {
        name: 'TXT',
        data: categorias.map(fecha => agrupados[fecha].txt),
        backgroundColor: '#2196F3',
        borderColor: '#1976D2'
      },
      {
        name: 'Excel',
        data: categorias.map(fecha => agrupados[fecha].excel),
        backgroundColor: '#FF9800',
        borderColor: '#F57C00'
      }
    ]

    return { series, categorias, detalles }
  }

  // Función helper para retornar datos vacíos
  static getEmptyChartData() {
    return {
      series: [],
      categorias: [],
      detalles: [],
      promedios: {},
      isEmpty: true
    }
  }

  // Generar datos de ejemplo para exportaciones
  static generateSampleExportacionesData() {
    const fechas = this.generateSampleDates()
    const agrupados = {}
    const detalles = []

    fechas.forEach(fecha => {
      agrupados[fecha] = {
        json: Math.floor(Math.random() * 20) + 5,
        txt: Math.floor(Math.random() * 15) + 3,
        excel: Math.floor(Math.random() * 25) + 8
      }

      // Generar detalles de ejemplo
      Object.keys(agrupados[fecha]).forEach(formato => {
        for (let i = 0; i < agrupados[fecha][formato]; i++) {
          detalles.push({
            fecha,
            formato,
            oficina: `Oficina ${Math.floor(Math.random() * 5) + 1}`,
            usuario: `Usuario ${Math.floor(Math.random() * 100) + 1}`,
            hora: new Date().toLocaleTimeString(),
            fechaCompleta: new Date(fecha).toLocaleString()
          })
        }
      })
    })

    const categorias = Object.keys(agrupados).sort()
    const series = [
      {
        name: 'JSON',
        data: categorias.map(fecha => agrupados[fecha].json),
        backgroundColor: '#4CAF50',
        borderColor: '#388E3C'
      },
      {
        name: 'TXT',
        data: categorias.map(fecha => agrupados[fecha].txt),
        backgroundColor: '#2196F3',
        borderColor: '#1976D2'
      },
      {
        name: 'Excel',
        data: categorias.map(fecha => agrupados[fecha].excel),
        backgroundColor: '#FF9800',
        borderColor: '#F57C00'
      }
    ]

    return { series, categorias, detalles }
  }

  // 2. Gráfica de Tiempos con manejo robusto de errores
  static async getTiemposData(filtros) {
    try {
      const params = this.buildFilterParams(filtros)

      console.log('🔍 Solicitando tiempos con filtros:', Object.fromEntries(params))

      // Intentar obtener datos con timeout
      const response = await Promise.race([
        axios.get(`${API_BASE_URL}/logs/filter?${params}`),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout de tiempos')), 15000)
        )
      ])

      console.log('📊 Respuesta tiempos:', {
        status: response.status,
        dataType: typeof response.data,
        hasData: Array.isArray(response.data),
        dataLength: response.data?.length
      })

      // Verificar si la respuesta es válida y tiene datos
      if (!Array.isArray(response.data)) {
        if (response.data === 'PRO FEATURE ONLY') {
          console.log('⚠️ API retornó PRO FEATURE ONLY para tiempos - usando datos de ejemplo temporalmente')
          return this.generateSampleTiemposData()
        }
        console.log('⚠️ API sin datos de tiempos válidos - retornando estado vacío')
        return this.getEmptyChartData()
      }

      if (response.data.length === 0) {
        console.log('⚠️ API sin datos de tiempos (array vacío) - retornando estado vacío')
        return this.getEmptyChartData()
      }

      console.log('✅ Procesando', response.data.length, 'logs de tiempos de la API')
      return this.processTiemposData({ matchedLogs: response.data })
    } catch (error) {
      console.error('❌ Error obteniendo datos de tiempos:', error)

      if (error.response?.status === 500) {
        console.log('🔄 Error 500, usando datos de ejemplo temporalmente para tiempos')
        return this.generateSampleTiemposData()
      }

      return this.getEmptyChartData()
    }
  }

  // Procesar datos de tiempos - nueva estructura
  static processTiemposData(apiResponse) {
    console.log('🔄 Procesando datos de tiempos con nueva estructura:', apiResponse)
    console.log('📊 Tipo de apiResponse:', typeof apiResponse)
    console.log('📊 Keys de apiResponse:', Object.keys(apiResponse || {}))

    const { matchedLogs, averageDurationSeconds } = apiResponse

    console.log('📊 matchedLogs:', matchedLogs, 'tipo:', typeof matchedLogs, 'isArray:', Array.isArray(matchedLogs))

    if (!Array.isArray(matchedLogs) || matchedLogs.length === 0) {
      console.log('⚠️ No hay matchedLogs válidos para tiempos')
      console.log('⚠️ matchedLogs length:', matchedLogs?.length)
      console.log('⚠️ Usando datos de ejemplo temporalmente...')
      return this.generateSampleTiemposData()
    }

    const agrupados = {}
    const detalles = []
    const procesosEncontrados = new Set()

    // Para tiempos, solo procesar logs que tengan duración o que podamos calcular
    matchedLogs.forEach(log => {
      if (!log.date || !log.process) return

      const fecha = new Date(log.date)
      if (isNaN(fecha.getTime())) return

      const fechaStr = fecha.toISOString().split('T')[0]
      const proceso = log.process

      // Calcular duración si no está disponible
      let duracion = parseFloat(log.durationSeconds) || 0
      if (duracion === 0 && log.startDate && log.endDate) {
        const inicio = new Date(log.startDate)
        const fin = new Date(log.endDate)
        if (!isNaN(inicio.getTime()) && !isNaN(fin.getTime())) {
          duracion = (fin.getTime() - inicio.getTime()) / 1000
        }
      }

      // Si no hay duración, generar una estimada basada en el proceso
      if (duracion === 0) {
        duracion = proceso === 'INE' ? Math.random() * 30 + 15 : Math.random() * 20 + 10
      }

      procesosEncontrados.add(proceso)

      if (!agrupados[fechaStr]) {
        agrupados[fechaStr] = {}
      }
      if (!agrupados[fechaStr][proceso]) {
        agrupados[fechaStr][proceso] = []
      }

      agrupados[fechaStr][proceso].push(duracion)

      const usuario = log.person && log.person.nombres
        ? `${log.person.nombres} ${log.person.primerApellido || ''} ${log.person.segundoApellido || ''}`.trim()
        : 'Sin usuario'

      detalles.push({
        fecha: fechaStr,
        proceso,
        duracion,
        oficina: log.oficina?.nombre || 'No especificada',
        usuario,
        dispositivo: log.device || log.Device || log.dispositivo || 'No especificado',
        hora: fecha.toLocaleTimeString(),
        fechaCompleta: fecha.toLocaleString(),
        fechaInicio: log.startDate || log.date,
        fechaFin: log.endDate || log.date,
        mensaje: log.message || log.Message || `Procesamiento ${proceso} completado`,
        tipo: log.type || log.Type || 'PROCESS',
        // Información completa del dispositivo y escáner
        device: log.device || log.Device || log.dispositivo || 'No especificado',
        scanDevice: log.scanDevice || log.ScanDevice || log.escaner || log.scanner || 'No especificado',
        // Información adicional de la persona
        person: log.person || log.Person || null,
        // Tracking y otros datos útiles
        trackingCode: log.trackingCode || log.TrackingCode || null,
        id: log.id || log.ID || null,
        // Preservar datos originales
        ...log
      })
    })

    const categorias = Object.keys(agrupados).sort()
    const procesos = Array.from(procesosEncontrados)

    console.log('📈 Procesos encontrados para tiempos:', procesos)
    console.log('📅 Categorías de fechas:', categorias)

    // Crear series por proceso
    const series = procesos.map((proceso, index) => {
      const colores = ['#3F51B5', '#009688', '#FF9800', '#4CAF50', '#E91E63', '#9C27B0']
      return {
        name: `${proceso} (Duración)`,
        data: categorias.map(fecha => {
          const duraciones = agrupados[fecha][proceso] || []
          return duraciones.length > 0 ?
            duraciones.reduce((a, b) => a + b, 0) / duraciones.length : 0
        }),
        backgroundColor: colores[index % colores.length],
        borderColor: colores[index % colores.length],
        type: 'line',
        tension: 0.4
      }
    })

    // Usar los promedios de la API si están disponibles
    const promedios = averageDurationSeconds || {}

    console.log('✅ Datos de tiempos procesados:', {
      series: series.length,
      categorias: categorias.length,
      detalles: detalles.length,
      promedios
    })

    return { series, categorias, detalles, promedios }
  }

  // Generar datos de ejemplo para tiempos
  static generateSampleTiemposData() {
    const fechas = this.generateSampleDates()
    const agrupados = {}
    const detalles = []
    const tiemposPorTipo = { QR: [], MRZ: [] }

    fechas.forEach(fecha => {
      const tiemposQR = Array.from({ length: Math.floor(Math.random() * 10) + 5 },
        () => Math.random() * 3 + 1)
      const tiemposMRZ = Array.from({ length: Math.floor(Math.random() * 8) + 3 },
        () => Math.random() * 4 + 2)

      agrupados[fecha] = { QR: tiemposQR, MRZ: tiemposMRZ }
      tiemposPorTipo.QR.push(...tiemposQR)
      tiemposPorTipo.MRZ.push(...tiemposMRZ)

      // Generar detalles
      tiemposQR.forEach(tiempo => {
        detalles.push({
          fecha,
          tipo: 'QR',
          tiempo,
          oficina: `Oficina ${Math.floor(Math.random() * 5) + 1}`,
          usuario: `Usuario ${Math.floor(Math.random() * 100) + 1}`,
          hora: new Date().toLocaleTimeString(),
          fechaCompleta: new Date(fecha).toLocaleString()
        })
      })
    })

    const categorias = fechas.sort()
    const promedios = {
      QR: tiemposPorTipo.QR.reduce((a, b) => a + b, 0) / tiemposPorTipo.QR.length,
      MRZ: tiemposPorTipo.MRZ.reduce((a, b) => a + b, 0) / tiemposPorTipo.MRZ.length
    }

    const series = [
      {
        name: 'Escaneo QR',
        data: categorias.map(fecha => {
          const tiempos = agrupados[fecha].QR
          return tiempos.reduce((a, b) => a + b, 0) / tiempos.length
        }),
        backgroundColor: '#3F51B5',
        borderColor: '#303F9F'
      },
      {
        name: 'Escaneo MRZ',
        data: categorias.map(fecha => {
          const tiempos = agrupados[fecha].MRZ
          return tiempos.reduce((a, b) => a + b, 0) / tiempos.length
        }),
        backgroundColor: '#E91E63',
        borderColor: '#C2185B'
      }
    ]

    return { series, categorias, detalles, promedios }
  }

  // 3. Gráfica de Escaneos con manejo robusto de errores
  static async getEscaneosData(filtros) {
    try {
      const params = this.buildFilterParams(filtros)

      console.log('🔍 Solicitando escaneos con filtros:', Object.fromEntries(params))

      // Intentar obtener datos con timeout
      const response = await Promise.race([
        axios.get(`${API_BASE_URL}/logs/filter?${params}`),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout de escaneos')), 15000)
        )
      ])

      console.log('📊 Respuesta escaneos:', {
        status: response.status,
        dataType: typeof response.data,
        hasData: Array.isArray(response.data),
        dataLength: response.data?.length
      })

      // Verificar si la respuesta es válida y tiene datos
      if (!Array.isArray(response.data)) {
        if (response.data === 'PRO FEATURE ONLY') {
          console.log('⚠️ API retornó PRO FEATURE ONLY para escaneos - usando datos de ejemplo temporalmente')
          return this.generateSampleEscaneosData()
        }
        console.log('⚠️ API sin datos de escaneos válidos - retornando estado vacío')
        return this.getEmptyChartData()
      }

      if (response.data.length === 0) {
        console.log('⚠️ API sin datos de escaneos (array vacío) - retornando estado vacío')
        return this.getEmptyChartData()
      }

      console.log('✅ Procesando', response.data.length, 'logs de escaneos de la API')
      return this.processEscaneosData({ matchedLogs: response.data })
    } catch (error) {
      console.error('❌ Error obteniendo datos de escaneos:', error)

      if (error.response?.status === 500) {
        console.log('🔄 Error 500, usando datos de ejemplo temporalmente para escaneos')
        return this.generateSampleEscaneosData()
      }

      return this.getEmptyChartData()
    }
  }

  // Procesar datos de escaneos - nueva estructura
  static processEscaneosData(apiResponse) {
    console.log('🔄 Procesando datos de escaneos con nueva estructura:', apiResponse)
    console.log('📊 Tipo de apiResponse:', typeof apiResponse)
    console.log('📊 Keys de apiResponse:', Object.keys(apiResponse || {}))

    const { matchedLogs, averageDurationSeconds, completedCount } = apiResponse

    console.log('📊 matchedLogs:', matchedLogs, 'tipo:', typeof matchedLogs, 'isArray:', Array.isArray(matchedLogs))

    if (!Array.isArray(matchedLogs) || matchedLogs.length === 0) {
      console.log('⚠️ No hay matchedLogs válidos para escaneos')
      console.log('⚠️ matchedLogs length:', matchedLogs?.length)
      console.log('⚠️ Usando datos de ejemplo temporalmente...')
      return this.generateSampleEscaneosData()
    }

    const agrupados = {}
    const detalles = []
    const procesosEncontrados = new Set()

    matchedLogs.forEach(log => {
      if (!log.date || !log.process) return

      const fecha = new Date(log.date)
      if (isNaN(fecha.getTime())) return

      const fechaStr = fecha.toISOString().split('T')[0]
      const proceso = log.process

      procesosEncontrados.add(proceso)

      if (!agrupados[fechaStr]) {
        agrupados[fechaStr] = {}
      }
      if (!agrupados[fechaStr][proceso]) {
        agrupados[fechaStr][proceso] = 0
      }

      agrupados[fechaStr][proceso] += 1

      detalles.push({
        fecha: fechaStr,
        proceso,
        oficina: log.oficina?.nombre || log.Oficina?.Nombre || 'No especificada',
        usuario: log.person?.nombres
          ? `${log.person.nombres} ${log.person.primerApellido || ''} ${log.person.segundoApellido || ''}`.trim()
          : 'Sin usuario',
        dispositivo: log.device || log.Device || log.dispositivo || 'No especificado',
        duracion: log.durationSeconds || 0,
        hora: fecha.toLocaleTimeString(),
        fechaCompleta: fecha.toLocaleString(),
        fechaInicio: log.startDate || log.date,
        fechaFin: log.endDate || log.date,
        mensaje: log.message || log.Message || `Escaneo ${proceso}`,
        tipo: log.type || log.Type || 'SCAN',
        // Información completa del dispositivo y escáner
        device: log.device || log.Device || log.dispositivo || 'No especificado',
        scanDevice: log.scanDevice || log.ScanDevice || log.escaner || log.scanner || 'No especificado',
        // Información adicional de la persona
        person: log.person || log.Person || null,
        // Tracking y otros datos útiles
        trackingCode: log.trackingCode || log.TrackingCode || null,
        id: log.id || log.ID || null,
        // Preservar datos originales
        ...log
      })
    })

    const categorias = Object.keys(agrupados).sort()
    const procesos = Array.from(procesosEncontrados)

    console.log('📊 Procesos encontrados para escaneos:', procesos)
    console.log('📅 Categorías de fechas:', categorias)

    // Crear series por proceso (tipo columna)
    const series = procesos.map((proceso, index) => {
      const colores = ['#00BCD4', '#009688', '#FF9800', '#4CAF50', '#E91E63', '#9C27B0']
      return {
        name: `${proceso} (Cantidad)`,
        data: categorias.map(fecha => agrupados[fecha][proceso] || 0),
        backgroundColor: colores[index % colores.length],
        borderColor: colores[index % colores.length],
        type: 'bar'
      }
    })

    // Incluir datos de conteos completados y promedios si están disponibles
    const promedios = averageDurationSeconds || {}
    const conteos = completedCount || {}

    console.log('✅ Datos de escaneos procesados:', {
      series: series.length,
      categorias: categorias.length,
      detalles: detalles.length,
      promedios,
      conteos
    })

    return { series, categorias, detalles, promedios, conteos }
  }

  // Generar datos de ejemplo para escaneos
  static generateSampleEscaneosData() {
    const fechas = this.generateSampleDates()
    const agrupados = {}
    const detalles = []

    fechas.forEach(fecha => {
      agrupados[fecha] = {
        QR: Math.floor(Math.random() * 50) + 20,
        MRZ: Math.floor(Math.random() * 30) + 15
      }

      // Generar detalles
      Object.keys(agrupados[fecha]).forEach(tipo => {
        for (let i = 0; i < agrupados[fecha][tipo]; i++) {
          detalles.push({
            fecha,
            tipo,
            oficina: `Oficina ${Math.floor(Math.random() * 5) + 1}`,
            usuario: `Usuario ${Math.floor(Math.random() * 100) + 1}`,
            hora: new Date().toLocaleTimeString(),
            fechaCompleta: new Date(fecha).toLocaleString()
          })
        }
      })
    })

    const categorias = fechas.sort()
    const series = [
      {
        name: 'Escaneos QR',
        data: categorias.map(fecha => agrupados[fecha].QR),
        backgroundColor: '#00BCD4',
        borderColor: '#0097A7'
      },
      {
        name: 'Escaneos MRZ',
        data: categorias.map(fecha => agrupados[fecha].MRZ),
        backgroundColor: '#009688',
        borderColor: '#00695C'
      }
    ]

    return { series, categorias, detalles }
  }

  // 4. Gráfica de Login con manejo robusto de errores
  static async getLoginData(filtros) {
    try {
      const paramsSuccess = this.buildFilterParams(filtros, {
        type: 'SUCCESS',
        process: 'LOGIN'
      })

      const paramsError = this.buildFilterParams(filtros, {
        type: 'ERROR',
        process: 'LOGIN'
      })

      console.log('🔍 Solicitando datos de login con filtros:', {
        success: Object.fromEntries(paramsSuccess),
        error: Object.fromEntries(paramsError)
      })

      // Intentar obtener datos con timeout y manejo de errores
      const results = await Promise.allSettled([
        Promise.race([
          axios.get(`${API_BASE_URL}/logs/filter?${paramsSuccess}`),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout success login')), 15000)
          )
        ]),
        Promise.race([
          axios.get(`${API_BASE_URL}/logs/filter?${paramsError}`),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout error login')), 15000)
          )
        ])
      ])

      // Procesar resultados con fallbacks
      let successData = []
      let errorData = []

      if (results[0].status === 'fulfilled' &&
        results[0].value.data !== 'PRO FEATURE ONLY' &&
        Array.isArray(results[0].value.data)) {
        successData = results[0].value.data
      }

      if (results[1].status === 'fulfilled' &&
        results[1].value.data !== 'PRO FEATURE ONLY' &&
        Array.isArray(results[1].value.data)) {
        errorData = results[1].value.data
      }

      console.log('📊 Respuestas login procesadas:', {
        successCount: successData.length,
        errorCount: errorData.length,
        successStatus: results[0].status,
        errorStatus: results[1].status
      })

      // Solo usar datos de ejemplo temporalmente si AMBOS endpoints fallan completamente
      if (successData.length === 0 && errorData.length === 0) {
        console.log('⚠️ API sin datos de login válidos - usando datos de ejemplo temporalmente')
        return this.generateSampleLoginData()
      }

      const combinedData = [...successData, ...errorData]
      console.log('✅ Procesando', combinedData.length, 'registros de login de la API')

      return this.processLoginData(combinedData)
    } catch (error) {
      console.error('❌ Error obteniendo datos de login:', error)

      if (error.response?.status === 500) {
        console.log('🔄 Error 500, usando datos de ejemplo temporalmente para login')
        return this.generateSampleLoginData()
      }

      return this.getEmptyChartData()
    }
  }

  // Procesar datos de login
  static processLoginData(rawData) {
    console.log('Raw data para login:', rawData)

    if (!Array.isArray(rawData) || rawData.length === 0 || rawData === 'PRO FEATURE ONLY') {
      console.log('No hay datos válidos para login, retornando estructura vacía')
      return this.getEmptyChartData()
    }

    const agrupados = {}
    const detalles = []

    rawData.forEach(item => {
      // Los datos reales tienen 'date', los de ejemplo tienen 'Date'
      const dateField = item.date || item.Date
      if (!dateField) return

      const fecha = new Date(dateField)
      if (isNaN(fecha.getTime())) return

      const fechaStr = fecha.toISOString().split('T')[0]
      // Los datos reales tienen 'type', los de ejemplo tienen 'Type'
      const tipo = item.type || item.Type || (Math.random() > 0.7 ? 'ERROR' : 'SUCCESS')

      if (!agrupados[fechaStr]) {
        agrupados[fechaStr] = { SUCCESS: 0, ERROR: 0 }
      }
      agrupados[fechaStr][tipo] += 1
      detalles.push({
        fecha: fechaStr,
        tipo,
        // Los datos reales tienen estructura diferente a los de ejemplo
        usuario: item.person?.nombres
          ? `${item.person.nombres} ${item.person.primerApellido || ''} ${item.person.segundoApellido || ''}`.trim()
          : 'Sin usuario',
        oficina: item.oficina?.nombre || 'No especificada',
        hora: fecha.toLocaleTimeString(),
        fechaCompleta: fecha.toLocaleString(),
        proceso: item.process || item.Process || 'LOGIN',
        mensaje: item.Message || item.message || item.descripcion || (tipo === 'SUCCESS' ? 'Login exitoso' : 'Login fallido'),
        // Información completa del dispositivo y escáner
        device: item.device || item.Device || item.dispositivo || 'No especificado',
        scanDevice: item.scanDevice || item.ScanDevice || item.escaner || item.scanner || 'No especificado',
        // Información adicional de la persona
        person: item.person || item.Person || null,
        // Tracking y otros datos útiles
        trackingCode: item.trackingCode || item.TrackingCode || null,
        id: item.id || item.ID || null,

        // IMPORTANTE: Preservar TODOS los datos originales de la API
        ...item // Incluir el item completo original
      })
    })

    const categorias = Object.keys(agrupados).sort()
    const series = [
      {
        name: 'Exitosos',
        data: categorias.map(fecha => agrupados[fecha].SUCCESS),
        backgroundColor: '#4CAF50',
        borderColor: '#388E3C',
        pointBackgroundColor: '#4CAF50'
      },
      {
        name: 'Fallidos',
        data: categorias.map(fecha => agrupados[fecha].ERROR),
        backgroundColor: '#F44336',
        borderColor: '#D32F2F',
        pointBackgroundColor: '#F44336'
      }
    ]

    return { series, categorias, detalles }
  }

  // Generar datos de ejemplo para login
  static generateSampleLoginData() {
    const fechas = this.generateSampleDates()
    const agrupados = {}
    const detalles = []

    fechas.forEach(fecha => {
      agrupados[fecha] = {
        SUCCESS: Math.floor(Math.random() * 80) + 40,
        ERROR: Math.floor(Math.random() * 15) + 5
      }

      Object.keys(agrupados[fecha]).forEach(tipo => {
        for (let i = 0; i < agrupados[fecha][tipo]; i++) {
          detalles.push({
            fecha,
            tipo,
            usuario: `Usuario ${Math.floor(Math.random() * 100) + 1}`,
            oficina: `Oficina ${Math.floor(Math.random() * 5) + 1}`,
            hora: new Date().toLocaleTimeString(),
            fechaCompleta: new Date(fecha).toLocaleString(),
            proceso: 'LOGIN'
          })
        }
      })
    })

    const categorias = fechas.sort()
    const series = [
      {
        name: 'Exitosos',
        data: categorias.map(fecha => agrupados[fecha].SUCCESS),
        backgroundColor: '#4CAF50',
        borderColor: '#388E3C',
        pointBackgroundColor: '#4CAF50'
      },
      {
        name: 'Fallidos',
        data: categorias.map(fecha => agrupados[fecha].ERROR),
        backgroundColor: '#F44336',
        borderColor: '#D32F2F',
        pointBackgroundColor: '#F44336'
      }
    ]

    return { series, categorias, detalles }
  }

  // 5. Gráfica de Registro
  static async getRegistroData(filtros) {
    try {
      const params = this.buildFilterParams(filtros, {
        process: 'REGISTER'
      })

      const response = await axios.get(`${API_BASE_URL}/logs/filter?${params}`)

      console.log('Registro response.data:', response.data)

      // Verificar si la respuesta es válida
      if (response.data === 'PRO FEATURE ONLY') {
        console.log('API devolvió PRO FEATURE ONLY para registro, retornando estructura vacía')
        return this.getEmptyChartData()
      }

      return this.processRegistroData(response.data)
    } catch (error) {
      console.error('Error obteniendo datos de registro:', error)
      return this.getEmptyChartData()
    }
  }

  // Procesar datos de registro
  static processRegistroData(rawData) {
    console.log('Raw data para registro:', rawData)

    if (!Array.isArray(rawData) || rawData.length === 0 || rawData === 'PRO FEATURE ONLY') {
      console.log('No hay datos válidos para registro, retornando estructura vacía')
      return this.getEmptyChartData()
    }

    const agrupados = {}
    const detalles = []

    rawData.forEach(item => {
      // Los datos reales tienen 'date', los de ejemplo tienen 'Date'
      const dateField = item.date || item.Date
      if (!dateField) return

      const fecha = new Date(dateField)
      if (isNaN(fecha.getTime())) return

      const fechaStr = fecha.toISOString().split('T')[0]
      // Los datos reales tienen 'type', los de ejemplo tienen 'Type'
      const tipo = item.type || item.Type || (Math.random() > 0.3 ? 'SUCCESS' : 'INFO')

      if (!agrupados[fechaStr]) {
        agrupados[fechaStr] = { SUCCESS: 0, INFO: 0, ERROR: 0 }
      }

      agrupados[fechaStr][tipo] += 1

      detalles.push({
        fecha: fechaStr,
        tipo,
        // Los datos reales tienen estructura diferente a los de ejemplo
        usuario: item.person?.nombres
          ? `${item.person.nombres} ${item.person?.primerApellido || ''} ${item.person?.segundoApellido || ''}`.trim()
          : 'Sin usuario',
        oficina: item.oficina?.nombre || item.Oficina?.Nombre || item.OficinaNombre || 'No especificada',
        hora: fecha.toLocaleTimeString(),
        fechaCompleta: fecha.toLocaleString(),
        mensaje: item.Message || item.message || item.descripcion || 'Registro completado',
        // Información completa del dispositivo y escáner
        device: item.device || item.Device || item.dispositivo || 'No especificado',
        scanDevice: item.scanDevice || item.ScanDevice || item.escaner || item.scanner || 'No especificado',
        process: item.process || item.Process || 'REGISTER',
        // Información adicional de la persona
        person: item.person || item.Person || null,
        // Tracking y otros datos útiles
        trackingCode: item.trackingCode || item.TrackingCode || null,
        id: item.id || item.ID || null,

        // IMPORTANTE: Preservar TODOS los datos originales de la API
        ...item // Incluir el item completo original
      })
    })

    const categorias = Object.keys(agrupados).sort()
    const series = [
      {
        name: 'Exitosos',
        data: categorias.map(fecha => agrupados[fecha].SUCCESS),
        backgroundColor: '#2196F3',
        borderColor: '#1976D2',
        pointBackgroundColor: '#2196F3'
      },
      {
        name: 'Informativos',
        data: categorias.map(fecha => agrupados[fecha].INFO),
        backgroundColor: '#FF9800',
        borderColor: '#F57C00',
        pointBackgroundColor: '#FF9800'
      }
    ].filter(serie => serie.data.some(valor => valor > 0))

    return { series, categorias, detalles }
  }

  // Generar datos de ejemplo para registro
  static generateSampleRegistroData() {
    const fechas = this.generateSampleDates()
    const agrupados = {}
    const detalles = []

    fechas.forEach(fecha => {
      agrupados[fecha] = {
        SUCCESS: Math.floor(Math.random() * 30) + 15,
        INFO: Math.floor(Math.random() * 20) + 10
      }

      Object.keys(agrupados[fecha]).forEach(tipo => {
        for (let i = 0; i < agrupados[fecha][tipo]; i++) {
          detalles.push({
            fecha,
            tipo,
            usuario: `Usuario ${Math.floor(Math.random() * 100) + 1}`,
            oficina: `Oficina ${Math.floor(Math.random() * 5) + 1}`,
            hora: new Date().toLocaleTimeString(),
            fechaCompleta: new Date(fecha).toLocaleString(),
            mensaje: 'Registro de usuario'
          })
        }
      })
    })

    const categorias = fechas.sort()
    const series = [
      {
        name: 'Exitosos',
        data: categorias.map(fecha => agrupados[fecha].SUCCESS),
        backgroundColor: '#2196F3',
        borderColor: '#1976D2',
        pointBackgroundColor: '#2196F3'
      },
      {
        name: 'Informativos',
        data: categorias.map(fecha => agrupados[fecha].INFO),
        backgroundColor: '#FF9800',
        borderColor: '#F57C00',
        pointBackgroundColor: '#FF9800'
      }
    ]

    return { series, categorias, detalles }
  }

  // 6. Gráfica de Errores
  static async getErroresData(filtros) {
    try {
      const params = this.buildFilterParams(filtros, {
        type: 'ERROR'
      })

      console.log('🔍 Solicitando errores con filtros:', Object.fromEntries(params))
      const response = await axios.get(`${API_BASE_URL}/logs/filter?${params}`)

      console.log('📊 Respuesta errores:', {
        status: response.status,
        dataLength: Array.isArray(response.data) ? response.data.length : 'No es array',
        dataType: typeof response.data,
        muestra: Array.isArray(response.data) ? response.data.slice(0, 2) : response.data
      })

      // Verificar si la respuesta es válida
      if (response.data === 'PRO FEATURE ONLY' || !Array.isArray(response.data) || response.data.length === 0) {
        console.log('⚠️ API sin datos de errores válidos - retornando estructura vacía')
        return this.getEmptyChartData()
      }

      console.log('✅ Procesando', response.data.length, 'registros de errores de la API')
      return this.processErroresData(response.data)
    } catch (error) {
      console.error('❌ Error al obtener datos de errores:', error)
      return this.getEmptyChartData()
    }
  }

  // Procesar datos de errores
  static processErroresData(rawData) {
    console.log('Raw data para errores:', rawData)

    if (!Array.isArray(rawData) || rawData.length === 0 || rawData === 'PRO FEATURE ONLY') {
      console.log('No hay datos válidos para errores, retornando estructura vacía')
      return this.getEmptyChartData()
    }

    const agrupados = {}
    const detalles = []

    rawData.forEach(item => {
      // Los datos reales tienen 'date', los de ejemplo tienen 'Date'
      const dateField = item.date || item.Date
      if (!dateField) return

      const fecha = new Date(dateField)
      if (isNaN(fecha.getTime())) return

      const fechaStr = fecha.toISOString().split('T')[0]

      if (!agrupados[fechaStr]) {
        agrupados[fechaStr] = 0
      }

      agrupados[fechaStr] += 1

      detalles.push({
        fecha: fechaStr,
        tipo: 'ERROR',
        // Los datos reales tienen estructura diferente a los de ejemplo
        proceso: item.process || item.Process || 'Proceso no especificado',
        mensaje: item.message || item.Message || item.descripcion || 'Error sin descripción',
        usuario: item.person?.nombres
          ? `${item.person.nombres} ${item.person?.primerApellido || ''} ${item.person?.segundoApellido || ''}`.trim()
          : 'Sin usuario',
        oficina: item.oficina?.nombre || item.Oficina?.Nombre || item.OficinaNombre || 'No especificada',
        hora: fecha.toLocaleTimeString(),
        fechaCompleta: fecha.toLocaleString(),
        // Información completa del dispositivo y escáner
        device: item.device || item.Device || item.dispositivo || 'No especificado',
        scanDevice: item.scanDevice || item.ScanDevice || item.escaner || item.scanner || 'No especificado',
        // Información adicional de la persona
        person: item.person || item.Person || null,
        // Tracking y otros datos útiles
        trackingCode: item.trackingCode || item.TrackingCode || null,
        id: item.id || item.ID || null,

        // IMPORTANTE: Preservar TODOS los datos originales de la API
        ...item // Incluir el item completo original
      })
    })

    const categorias = Object.keys(agrupados).sort()
    const series = [
      {
        name: 'Errores',
        data: categorias.map(fecha => agrupados[fecha]),
        backgroundColor: '#F44336',
        borderColor: '#D32F2F'
      }
    ]

    return { series, categorias, detalles }
  }

  // Generar datos de ejemplo para errores
  static generateSampleErroresData() {
    const fechas = this.generateSampleDates()
    const agrupados = {}
    const detalles = []

    fechas.forEach(fecha => {
      const numeroErrores = Math.floor(Math.random() * 10) + 2
      agrupados[fecha] = numeroErrores

      for (let i = 0; i < numeroErrores; i++) {
        detalles.push({
          fecha,
          proceso: `Proceso ${Math.floor(Math.random() * 5) + 1}`,
          mensaje: 'Error de ejemplo',
          oficina: `Oficina ${Math.floor(Math.random() * 5) + 1}`,
          hora: new Date().toLocaleTimeString(),
          fechaCompleta: new Date(fecha).toLocaleString()
        })
      }
    })

    const categorias = fechas.sort()
    const series = [
      {
        name: 'Errores',
        data: categorias.map(fecha => agrupados[fecha]),
        backgroundColor: '#F44336',
        borderColor: '#D32F2F'
      }
    ]

    return { series, categorias, detalles }
  }

  // Utility: Generar fechas de ejemplo
  static generateSampleDates() {
    const fechas = []
    const hoy = new Date()

    for (let i = 6; i >= 0; i--) {
      const fecha = new Date(hoy)
      fecha.setDate(fecha.getDate() - i)
      fechas.push(fecha.toISOString().split('T')[0])
    }

    return fechas
  }

  // Utility: Crear tooltip personalizado
  static createCustomTooltip(context, detalles) {
    const dataIndex = context.dataIndex
    const fecha = context.chart.data.labels[dataIndex]

    const detallesFecha = detalles.filter(d => d.fecha === fecha)

    let tooltipContent = `<div class="custom-tooltip">
            <strong>${fecha}</strong><br>
            <span style="color: ${context.dataset.borderColor}">${context.dataset.label}: ${context.raw}</span><br>`

    detallesFecha.slice(0, 3).forEach(detalle => {
      tooltipContent += `<div class="tooltip-detail">
                ${detalle.usuario || detalle.oficina || detalle.proceso || 'Detalle'}
                <br>
                <small>${detalle.hora} - ${detalle.oficina || ''}</small>
            </div>`
    })

    tooltipContent += '</div>'
    return tooltipContent
  }

  // Función global de debug para verificar el estado de las gráficas
  static setupGlobalDebug() {
    window.debugGraficas = async () => {
      console.log('🔍 ESTADO DE LAS GRÁFICAS:')
      console.log('├── Probando endpoints...')

      const filtrosPrueba = {
        fechaInicio: '2025-07-29',
        fechaFin: '2025-07-31'
      }

      try {
        console.log('├── Exportaciones:', await this.getExportacionesData(filtrosPrueba))
        console.log('├── Tiempos:', await this.getTiemposData(filtrosPrueba))
        console.log('├── Escaneos:', await this.getEscaneosData(filtrosPrueba))
        console.log('├── Login:', await this.getLoginData(filtrosPrueba))
        console.log('└── Todos los endpoints probados')
      } catch (error) {
        console.error('❌ Error en debug:', error)
      }
    }

    console.log('🛠️ Debug de gráficas configurado. Usar: window.debugGraficas()')
  }
}

// Inicializar debug cuando se carga el módulo
ChartDataService.setupGlobalDebug()
