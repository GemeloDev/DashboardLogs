// 🧪 PRUEBAS DEL SISTEMA SANTORO MEGA
// Ejecuta estos comandos en la consola del navegador para probar

console.log('🚀 Iniciando pruebas del Sistema Santoro Mega...')

// === PRUEBAS BÁSICAS ===
console.log('📋 1. Verificar que el sistema esté disponible:')
console.log('   window.santoro:', typeof window.santoro)
console.log('   window.santoro.isReady():', window.santoro?.isReady())

// === PRUEBAS DE CAMBIO DE FLUJO ===
console.log('📋 2. Cambio de flujo:')

// Cambiar a escritorio
console.log('   🖥️ Prueba: Cambiar a escritorio')
console.log('   Comando: window.santoro.cambiarAEscritorio()')

// Cambiar a móvil
console.log('   📱 Prueba: Cambiar a móvil')
console.log('   Comando: window.santoro.cambiarAMovil()')

// === PRUEBAS DE MÓDULOS ===
console.log('📋 3. Apertura de módulos:')

// Abrir diagnóstico
console.log('   🔬 Prueba: Abrir diagnóstico')
console.log('   Comando: window.santoro.abrirDiagnostico()')

// Abrir estadísticas
console.log('   📊 Prueba: Abrir estadísticas')
console.log('   Comando: window.santoro.abrirEstadisticas()')

// Abrir consola
console.log('   🖥️ Prueba: Abrir consola')
console.log('   Comando: window.santoro.abrirConsola()')

// === PRUEBAS DE COMANDOS DE VOZ ===
console.log('📋 4. Comandos de voz (usar en el chat):')
console.log('   "ir a escritorio"')
console.log('   "ir a móvil"')
console.log('   "abre la consola"')
console.log('   "mostrar diagnóstico"')
console.log('   "mostrar estadísticas"')

// === PRUEBAS DE ATAJOS ===
console.log('📋 5. Atajos de teclado:')
console.log('   Ctrl+Alt+E = Escritorio')
console.log('   Ctrl+Alt+M = Móvil')
console.log('   Ctrl+Alt+D = Diagnóstico')
console.log('   Ctrl+Alt+S = Estadísticas')

// === VERIFICACIÓN DE ESTADO ===
console.log('📋 6. Verificar estado del sistema:')
console.log('   window.santoro.components:', window.santoro?.components)

// === PRUEBA COMPLETA ===
console.log('📋 7. Prueba completa automática:')
console.log('   window.santoro.test() - Ejecuta todas las pruebas')

console.log('✅ Guía de pruebas cargada. ¡Comienza a probar!')

// Función helper para ejecutar pruebas paso a paso
window.testearSistema = async function () {
    console.log('🧪 Iniciando pruebas automáticas...')

    if (!window.santoro) {
        console.error('❌ Sistema Santoro no disponible')
        return
    }

    try {
        console.log('🖥️ Probando cambio a escritorio...')
        await window.santoro.cambiarAEscritorio()
        await new Promise(r => setTimeout(r, 2000))

        console.log('📱 Probando cambio a móvil...')
        await window.santoro.cambiarAMovil()
        await new Promise(r => setTimeout(r, 2000))

        console.log('🔬 Probando abrir diagnóstico...')
        await window.santoro.abrirDiagnostico()
        await new Promise(r => setTimeout(r, 2000))

        console.log('🖥️ Probando abrir consola...')
        await window.santoro.abrirConsola()

        console.log('✅ Todas las pruebas completadas!')

    } catch (error) {
        console.error('❌ Error en pruebas:', error)
    }
}

console.log('💡 Tip: Ejecuta window.testearSistema() para probar todo automáticamente')
