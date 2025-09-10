/**
 * Ejemplo de uso del Sistema de Asistente IA con Precisión Absoluta
 * Este archivo muestra cómo integrar y usar todos los componentes
 */

import { santoroAssistantIntegrator, inicializarAsistenteCompleto } from './santoroAssistantIntegrator.js'
import { santoroContextMaster } from './santoroContextMaster.js'

// ========== INICIALIZACIÓN ==========

export function inicializarSistemaCompleto() {
    console.log('🚀 Inicializando Sistema de Asistente IA Completo...')

    // 1. Inicializar el asistente completo
    const asistente = inicializarAsistenteCompleto()

    // 2. Configurar event listeners para el chat
    configurarEventListeners()

    // 3. Conectar componentes cuando estén disponibles
    configurarConexionComponentes()

    return asistente
}

function configurarEventListeners() {
    // Escuchar mensajes del chat
    document.addEventListener('santoro-chat-message', async (event) => {
        const { message } = event.detail
        await procesarMensajeChat(message)
    })

    // Escuchar cambios de flujo
    document.addEventListener('cambiar-flujo', (event) => {
        const { flujo } = event.detail
        santoroContextMaster.actualizarContextoCompleto()
        console.log(`🔄 Flujo cambiado a: ${flujo}`)
    })

    // Escuchar apertura de módulos
    document.addEventListener('abrir-modulo', (event) => {
        const { modulo } = event.detail
        santoroContextMaster.actualizarContextoCompleto()
        console.log(`📱 Módulo abierto: ${modulo}`)
    })
}

function configurarConexionComponentes() {
    // Conectar automáticamente componentes cuando se monten
    const observer = new MutationObserver(() => {
        conectarComponentesDisponibles()
    })

    if (document.body) {
        observer.observe(document.body, {
            childList: true,
            subtree: true
        })
    }

    // Intentar conexión inicial
    setTimeout(conectarComponentesDisponibles, 1000)
}

function conectarComponentesDisponibles() {
    // Buscar y conectar filtro de fechas
    const filtroFechas = document.querySelector('[data-component="filtro-fechas"]')
    if (filtroFechas && filtroFechas.__vueParentComponent) {
        santoroContextMaster.conectarComponente('filtroFechas', filtroFechas.__vueParentComponent.exposed)
    }

    // Buscar y conectar consola
    const consola = document.querySelector('[data-component="consola"]')
    if (consola && consola.__vueParentComponent) {
        santoroContextMaster.conectarComponente('consola', consola.__vueParentComponent.exposed)
    }

    // Buscar y conectar gráficas
    const graficas = document.querySelector('[data-component="graficas"]')
    if (graficas && graficas.__vueParentComponent) {
        santoroContextMaster.conectarComponente('graficas', graficas.__vueParentComponent.exposed)
    }
}

// ========== PROCESAMIENTO DE MENSAJES ==========

async function procesarMensajeChat(mensaje) {
    try {
        console.log('💬 Procesando mensaje del chat:', mensaje)

        // Procesar con el integrador principal
        const resultado = await santoroAssistantIntegrator.procesarComando(mensaje)

        console.log('✅ Resultado del procesamiento:', resultado)

        // Enviar respuesta al chat
        const evento = new CustomEvent('santoro-assistant-response', {
            detail: {
                mensaje: resultado.mensaje || 'Comando procesado',
                exito: resultado.exito,
                datos: resultado
            }
        })
        document.dispatchEvent(evento)

        return resultado

    } catch (error) {
        console.error('❌ Error procesando mensaje:', error)

        const evento = new CustomEvent('santoro-assistant-response', {
            detail: {
                mensaje: 'Error interno al procesar el comando',
                exito: false,
                error: error.message
            }
        })
        document.dispatchEvent(evento)
    }
}

// ========== EJEMPLOS DE COMANDOS ==========

export const ejemplosComandos = {
    // Cambio de flujo
    cambiarEscritorio: [
        "cambiar a escritorio",
        "ir a escritorio",
        "abrir escritorio",
        "mostrar escritorio"
    ],

    cambiarMovil: [
        "cambiar a móvil",
        "ir a móvil",
        "mostrar móvil",
        "vista móvil"
    ],

    // Apertura de módulos
    abrirDiagnostico: [
        "abrir diagnóstico",
        "mostrar diagnóstico",
        "ir a diagnóstico"
    ],

    abrirEventos: [
        "abrir eventos",
        "mostrar eventos",
        "ir a eventos"
    ],

    // Filtros con visualización
    mostrarErroresUltimoMes: [
        "mostrar errores del último mes",
        "errores último mes",
        "filtrar errores mes pasado"
    ],

    mostrarLoginsHoy: [
        "mostrar logins de hoy",
        "logins del día actual",
        "accesos de hoy"
    ],

    // Comandos compuestos
    comandosCompuestos: [
        "abre escritorio y muestra los del último mes",
        "cambiar a móvil y abrir eventos fallidos",
        "mostrar errores de los últimos 7 días",
        "filtrar logins de ayer y abrir consola"
    ]
}

// ========== FUNCIONES DE PRUEBA ==========

export async function probarComandos() {
    console.log('🧪 Iniciando pruebas de comandos...')

    const comandosPrueba = [
        "cambiar a escritorio",
        "abrir diagnóstico",
        "mostrar errores del último mes",
        "filtrar por hoy"
    ]

    for (const comando of comandosPrueba) {
        console.log(`\n🎯 Probando: "${comando}"`)
        const resultado = await santoroAssistantIntegrator.procesarComando(comando)
        console.log('📊 Resultado:', resultado.exito ? '✅' : '❌', resultado.mensaje)
    }
}

export function mostrarEstadoSistema() {
    console.log('\n📋 ESTADO ACTUAL DEL SISTEMA:')
    console.log('🎯 Contexto:', santoroContextMaster.obtenerContextoCompleto())
    console.log('🎯 Capacidades:', santoroAssistantIntegrator.obtenerCapacidadesActuales())
    console.log('🎯 Componentes:', Object.keys(santoroContextMaster.contextoActual.componentes))
}

// ========== AUTO-INICIALIZACIÓN ==========

// Solo inicializar si estamos en el navegador
if (typeof window !== 'undefined') {
    // Esperar a que el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inicializarSistemaCompleto)
    } else {
        inicializarSistemaCompleto()
    }

    // Hacer funciones disponibles globalmente para debugging
    window.santoroTest = {
        probarComandos,
        mostrarEstadoSistema,
        ejemplosComandos,
        procesarMensaje: procesarMensajeChat
    }
}
