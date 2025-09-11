/**
 * SantoroTemporalProcessor - Procesador de Fechas Naturales Avanzado
 * Convierte lenguaje natural a rangos de fechas precisos para APIs
 */

export class SantoroTemporalProcessor {
  constructor() {
    this.mesesNombres = {
      'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3, 'mayo': 4, 'junio': 5,
      'julio': 6, 'agosto': 7, 'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
    }

    this.diasSemana = {
      'lunes': 1, 'martes': 2, 'miércoles': 3, 'jueves': 4, 'viernes': 5, 'sábado': 6, 'domingo': 0
    }

    // Patrones de reconocimiento temporal
    this.patrones = {
      ultimoMes: /(?:último|ultimo|pasado)\s+mes/i,
      esteMes: /(?:este|actual)\s+mes/i,
      ultimaSemana: /(?:última|ultima|pasada)\s+semana/i,
      estaSemana: /(?:esta|actual)\s+semana/i,
      ayer: /ayer/i,
      hoy: /hoy/i,
      mañana: /mañana/i,

      // Patrones específicos de fecha: "del 5 de septiembre al 8 de octubre"
      rangoFechas: /del\s+(\d{1,2})\s+de\s+(\w+)\s+al\s+(\d{1,2})\s+de\s+(\w+)/i,
      fechaEspecifica: /(\d{1,2})\s+de\s+(\w+)(?:\s+de\s+(\d{4}))?/i,

      // Patrones de días atrás: "últimos 7 días", "hace 15 días"
      ultimosDias: /(?:últimos|ultimos)\s+(\d+)\s+días?/i,
      haceXDias: /hace\s+(\d+)\s+días?/i,

      // Patrones de trimestre
      esteTrismestre: /(?:este|actual)\s+trimestre/i,
      ultimoTrimestre: /(?:último|ultimo|pasado)\s+trimestre/i
    }
  }

  /**
   * Procesa texto natural y devuelve rango de fechas
   * @param {string} textoTemporal - Texto con referencia temporal
   * @returns {Object} - {fromDate, toDate, periodo, descripcion}
   */
  procesarTextoTemporal(textoTemporal) {
    const texto = textoTemporal.toLowerCase().trim()
    //const hoy = new Date()

    console.log('🕒 Procesando texto temporal:', texto)

    // Procesamiento de patrones específicos
    if (this.patrones.hoy.test(texto)) {
      return this.generarRangoHoy()
    }

    if (this.patrones.ayer.test(texto)) {
      return this.generarRangoAyer()
    }

    if (this.patrones.estaSemana.test(texto)) {
      return this.generarRangoEstaSemana()
    }

    if (this.patrones.ultimaSemana.test(texto)) {
      return this.generarRangoUltimaSemana()
    }

    if (this.patrones.esteMes.test(texto)) {
      return this.generarRangoEsteMes()
    }

    if (this.patrones.ultimoMes.test(texto)) {
      return this.generarRangoUltimoMes()
    }

    // Patrón de rango específico: "del 5 de septiembre al 8 de octubre"
    const matchRango = texto.match(this.patrones.rangoFechas)
    if (matchRango) {
      return this.procesarRangoEspecifico(matchRango)
    }

    // Patrón de últimos X días
    const matchUltimosDias = texto.match(this.patrones.ultimosDias)
    if (matchUltimosDias) {
      const dias = parseInt(matchUltimosDias[1])
      return this.generarRangoUltimosDias(dias)
    }

    // Patrón trimestre
    if (this.patrones.esteTrismestre.test(texto)) {
      return this.generarRangoEsteTrismestre()
    }

    if (this.patrones.ultimoTrimestre.test(texto)) {
      return this.generarRangoUltimoTrismestre()
    }

    // Fallback: último mes si no se reconoce el patrón
    console.log('⚠️ Patrón temporal no reconocido, usando último mes como fallback')
    return this.generarRangoUltimoMes()
  }

  // Generadores de rangos específicos
  generarRangoHoy() {
    const hoy = new Date()
    const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
    const fin = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59)

    return {
      fromDate: this.formatearFechaAPI(inicio),
      toDate: this.formatearFechaAPI(fin),
      periodo: 'hoy',
      descripcion: 'Registros de hoy'
    }
  }

  generarRangoAyer() {
    const ayer = new Date()
    ayer.setDate(ayer.getDate() - 1)
    const inicio = new Date(ayer.getFullYear(), ayer.getMonth(), ayer.getDate())
    const fin = new Date(ayer.getFullYear(), ayer.getMonth(), ayer.getDate(), 23, 59, 59)

    return {
      fromDate: this.formatearFechaAPI(inicio),
      toDate: this.formatearFechaAPI(fin),
      periodo: 'ayer',
      descripcion: 'Registros de ayer'
    }
  }

  generarRangoEstaSemana() {
    const hoy = new Date()
    const inicioSemana = new Date(hoy)
    inicioSemana.setDate(hoy.getDate() - hoy.getDay())
    inicioSemana.setHours(0, 0, 0, 0)

    const finSemana = new Date(hoy)
    finSemana.setHours(23, 59, 59, 999)

    return {
      fromDate: this.formatearFechaAPI(inicioSemana),
      toDate: this.formatearFechaAPI(finSemana),
      periodo: 'esta_semana',
      descripcion: 'Registros de esta semana'
    }
  }

  generarRangoUltimaSemana() {
    const hoy = new Date()
    const inicioUltimaSemana = new Date(hoy)
    inicioUltimaSemana.setDate(hoy.getDate() - hoy.getDay() - 7)
    inicioUltimaSemana.setHours(0, 0, 0, 0)

    const finUltimaSemana = new Date(hoy)
    finUltimaSemana.setDate(hoy.getDate() - hoy.getDay() - 1)
    finUltimaSemana.setHours(23, 59, 59, 999)

    return {
      fromDate: this.formatearFechaAPI(inicioUltimaSemana),
      toDate: this.formatearFechaAPI(finUltimaSemana),
      periodo: 'ultima_semana',
      descripcion: 'Registros de la semana pasada'
    }
  }

  generarRangoEsteMes() {
    const hoy = new Date()
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
    const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0, 23, 59, 59)

    return {
      fromDate: this.formatearFechaAPI(inicioMes),
      toDate: this.formatearFechaAPI(finMes),
      periodo: 'este_mes',
      descripcion: 'Registros de este mes'
    }
  }

  generarRangoUltimoMes() {
    const hoy = new Date()
    const inicioUltimoMes = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1)
    const finUltimoMes = new Date(hoy.getFullYear(), hoy.getMonth(), 0, 23, 59, 59)

    return {
      fromDate: this.formatearFechaAPI(inicioUltimoMes),
      toDate: this.formatearFechaAPI(finUltimoMes),
      periodo: 'ultimo_mes',
      descripcion: 'Registros del mes pasado'
    }
  }

  generarRangoUltimosDias(dias) {
    const hoy = new Date()
    const inicio = new Date(hoy)
    inicio.setDate(hoy.getDate() - dias)
    inicio.setHours(0, 0, 0, 0)

    const fin = new Date(hoy)
    fin.setHours(23, 59, 59, 999)

    return {
      fromDate: this.formatearFechaAPI(inicio),
      toDate: this.formatearFechaAPI(fin),
      periodo: `ultimos_${dias}_dias`,
      descripcion: `Registros de los últimos ${dias} días`
    }
  }

  generarRangoEsteTrismestre() {
    const hoy = new Date()
    const trimestreActual = Math.floor(hoy.getMonth() / 3)
    const inicioTrimestre = new Date(hoy.getFullYear(), trimestreActual * 3, 1)
    const finTrimestre = new Date(hoy.getFullYear(), (trimestreActual + 1) * 3, 0, 23, 59, 59)

    return {
      fromDate: this.formatearFechaAPI(inicioTrimestre),
      toDate: this.formatearFechaAPI(finTrimestre),
      periodo: 'este_trimestre',
      descripcion: 'Registros de este trimestre'
    }
  }

  generarRangoUltimoTrismestre() {
    const hoy = new Date()
    const trimestreAnterior = Math.floor(hoy.getMonth() / 3) - 1
    const año = trimestreAnterior < 0 ? hoy.getFullYear() - 1 : hoy.getFullYear()
    const trimestre = trimestreAnterior < 0 ? 3 : trimestreAnterior

    const inicioTrimestre = new Date(año, trimestre * 3, 1)
    const finTrimestre = new Date(año, (trimestre + 1) * 3, 0, 23, 59, 59)

    return {
      fromDate: this.formatearFechaAPI(inicioTrimestre),
      toDate: this.formatearFechaAPI(finTrimestre),
      periodo: 'ultimo_trimestre',
      descripcion: 'Registros del trimestre pasado'
    }
  }

  /**
   * Procesa rango específico como "del 5 de septiembre al 8 de octubre"
   */
  procesarRangoEspecifico(match) {
    const [, diaInicio, mesInicio, diaFin, mesFin] = match
    const añoActual = new Date().getFullYear()

    const mesInicioNum = this.mesesNombres[mesInicio.toLowerCase()]
    const mesFinNum = this.mesesNombres[mesFin.toLowerCase()]

    if (mesInicioNum === undefined || mesFinNum === undefined) {
      console.warn('⚠️ Mes no reconocido en rango específico')
      return this.generarRangoUltimoMes()
    }

    const fechaInicio = new Date(añoActual, mesInicioNum, parseInt(diaInicio))
    let fechaFin = new Date(añoActual, mesFinNum, parseInt(diaFin), 23, 59, 59)

    // Si el mes final es anterior al inicial, asumimos que es del año siguiente
    if (mesFinNum < mesInicioNum) {
      fechaFin = new Date(añoActual + 1, mesFinNum, parseInt(diaFin), 23, 59, 59)
    }

    return {
      fromDate: this.formatearFechaAPI(fechaInicio),
      toDate: this.formatearFechaAPI(fechaFin),
      periodo: 'rango_especifico',
      descripcion: `Registros del ${diaInicio} de ${mesInicio} al ${diaFin} de ${mesFin}`
    }
  }

  /**
   * Formatea fecha para la API en formato YYYY-MM-DD
   */
  formatearFechaAPI(fecha) {
    return fecha.toISOString().split('T')[0]
  }

  /**
   * Valida si un texto contiene referencias temporales
   */
  contieneReferenciaTemporal(texto) {
    return Object.values(this.patrones).some(patron => patron.test(texto))
  }

  /**
   * Extrae texto temporal de un comando más amplio
   */
  extraerTextoTemporal(comando) {
    const referencias = []

    Object.entries(this.patrones).forEach(([key, patron]) => {
      const match = comando.match(patron)
      if (match) {
        referencias.push({
          tipo: key,
          texto: match[0],
          posicion: match.index
        })
      }
    })

    // Retornar la referencia más específica (por longitud)
    if (referencias.length > 0) {
      const mejorReferencia = referencias.sort((a, b) => b.texto.length - a.texto.length)[0]
      return mejorReferencia.texto
    }

    return null
  }
}

// Instancia singleton
export const santoroTemporalProcessor = new SantoroTemporalProcessor()
