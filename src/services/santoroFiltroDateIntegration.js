/**
 * Integración del Filtro de Fechas con el Asistente IA
 * Ejemplo de uso del SantoroFiltroDateController
 */

import { santoroFiltroDateController } from './santoroFiltroDateController.js'

// ========== EJEMPLOS DE USO ==========

/**
 * Función que procesa comandos del usuario relacionados con filtros de fechas
 * Esta función sería llamada desde el chat de IA cuando detecta intenciones de filtros
 */
export async function procesarComandoFiltroFechas(comando, contexto = {}) {
    // Actualizar contexto
    santoroFiltroDateController.actualizarContexto(contexto)

    // Normalizar comando
    const comandoLower = comando.toLowerCase()

    // ========== DETECCIÓN DE INTENCIONES ==========

    // Aplicar rango específico
    if (comandoLower.includes('filtrar') && (comandoLower.includes('desde') || comandoLower.includes('hasta'))) {
        return await procesarRangoEspecifico(comando)
    }

    // Períodos rápidos
    if (comandoLower.includes('hoy')) {
        return await santoroFiltroDateController.seleccionarPeriodoRapido('hoy')
    }
    if (comandoLower.includes('ayer')) {
        return await santoroFiltroDateController.seleccionarPeriodoRapido('ayer')
    }
    if (comandoLower.includes('últimos 7') || comandoLower.includes('ultima semana')) {
        return await santoroFiltroDateController.seleccionarPeriodoRapido('ultimos7')
    }
    if (comandoLower.includes('últimos 30') || comandoLower.includes('ultimo mes')) {
        return await santoroFiltroDateController.seleccionarPeriodoRapido('ultimos30')
    }
    if (comandoLower.includes('mes actual')) {
        return await santoroFiltroDateController.seleccionarPeriodoRapido('mesActual')
    }

    // Resetear filtro
    if (comandoLower.includes('resetear') || comandoLower.includes('limpiar')) {
        return await santoroFiltroDateController.resetearAMesActual()
    }

    // Consultar estado
    if (comandoLower.includes('estado') || comandoLower.includes('filtro actual')) {
        return consultarEstadoFiltro()
    }

    // Si no reconoce el comando
    return {
        exito: false,
        error: 'Comando no reconocido',
        mensaje: 'No pude entender tu solicitud sobre filtros de fechas. ¿Podrías ser más específico?',
        sugerencias: [
            'filtrar desde 2024-09-01 hasta 2024-09-07',
            'mostrar datos de hoy',
            'últimos 7 días',
            'resetear filtro'
        ]
    }
}

/**
 * Procesa rangos específicos de fechas desde comandos de texto
 */
async function procesarRangoEspecifico(comando) {
    // Regex para extraer fechas del comando
    const regexFechas = /(\d{4}-\d{2}-\d{2})/g
    const fechasEncontradas = comando.match(regexFechas)

    if (fechasEncontradas && fechasEncontradas.length >= 2) {
        const fechaInicio = fechasEncontradas[0]
        const fechaFin = fechasEncontradas[1]
        return await santoroFiltroDateController.aplicarRangoFechas(fechaInicio, fechaFin)
    }

    // Intentar extraer con palabras clave
    // const palabrasClave = ['desde', 'hasta', 'del', 'al']
    // Aquí podrías agregar lógica más compleja para interpretar fechas en lenguaje natural

    return {
        exito: false,
        error: 'Fechas no encontradas',
        mensaje: 'No pude extraer las fechas de tu comando. Por favor usa el formato: "filtrar desde 2024-09-01 hasta 2024-09-07"'
    }
}

/**
 * Consulta el estado actual del filtro
 */
function consultarEstadoFiltro() {
    const estado = santoroFiltroDateController.obtenerResumenParaIA()
    const impacto = santoroFiltroDateController.analizarImpacto()
    const sugerencias = santoroFiltroDateController.sugerirAcciones()

    let mensaje = `📅 Estado actual del filtro:\n`
    mensaje += `• Período: ${estado.periodo}\n`
    mensaje += `• Días seleccionados: ${estado.diasSeleccionados}\n`
    mensaje += `• Estado: ${estado.estado}\n`
    mensaje += `• Módulo: ${estado.modulo || 'No especificado'}\n`
    mensaje += `• Flujo: ${estado.flujo}\n`

    if (impacto.rendimiento === 'lento') {
        mensaje += `\n⚠️ Rendimiento: El rango es amplio, podría ser lento\n`
    }

    if (sugerencias.length > 0) {
        mensaje += `\n💡 Sugerencias:\n`
        sugerencias.forEach(sug => {
            mensaje += `• ${sug.descripcion}\n`
        })
    }

    return {
        exito: true,
        estado,
        impacto,
        sugerencias,
        mensaje
    }
}

// ========== RESPUESTAS ESTRUCTURADAS PARA IA ==========

/**
 * Genera respuesta en formato JSON para el asistente IA
 */
export function generarRespuestaEstructurada(accion, parametros = {}) {
    return santoroFiltroDateController.generarRespuestaIA(accion, parametros)
}

// ========== EJEMPLOS DE COMANDOS QUE EL ASISTENTE PUEDE PROCESAR ==========

/*
COMANDOS SOPORTADOS:

1. Períodos rápidos:
   - "mostrar datos de hoy"
   - "filtrar por ayer"
   - "últimos 7 días"
   - "últimos 30 días"
   - "mes actual"

2. Rangos específicos:
   - "filtrar desde 2024-09-01 hasta 2024-09-07"
   - "mostrar logs del 2024-09-01 al 2024-09-05"

3. Gestión de filtros:
   - "resetear filtro"
   - "limpiar filtros"
   - "estado del filtro"
   - "¿qué filtro está aplicado?"

4. Consultas contextuales:
   - "¿cuántos días estoy viendo?"
   - "¿el filtro es válido?"
   - "¿qué impacto tiene este filtro?"

RESPUESTAS ESTRUCTURADAS:

{
  "intencion": "aplicar_filtro_fechas",
  "confianza": 0.95,
  "respuesta_usuario": "Filtro de fechas aplicado: 7 días seleccionados (2024-09-01 a 2024-09-07)",
  "acciones": [
    {
      "tipo": "setRangoFechas",
      "parametros": { "fechaInicio": "2024-09-01", "fechaFin": "2024-09-07" },
      "prioridad": 1
    }
  ],
  "estado_actual": {
    "estado": "válido",
    "periodo": "2024-09-01 a 2024-09-07",
    "diasSeleccionados": 7,
    "modulo": "eventos",
    "flujo": "escritorio"
  },
  "impacto": {
    "rendimiento": "óptimo",
    "cobertura": "específica",
    "recomendaciones": []
  },
  "sugerencias": [],
  "contexto": {
    "modulo": "eventos",
    "flujo": "escritorio",
    "filtrosActivos": ["fecha"]
  },
  "datos_necesarios": [],
  "timestamp": "2024-09-09T12:00:00.000Z"
}

*/
