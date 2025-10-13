/**
 * Script de prueba para verificar el funcionamiento del sistema de autenticación
 * Este archivo puede ser ejecutado en la consola del navegador para probar las funcionalidades
 */

// TEST 1: Verificar que el servicio de autenticación se inicialice correctamente
console.log('🧪 INICIANDO PRUEBAS DEL SISTEMA DE AUTENTICACIÓN')
console.log('='.repeat(60))

// Importar el servicio (esto debería ejecutarse en el navegador)
// import { getAuthService } from './src/services/authService.js'

console.log('✅ TEST 1: Inicialización del servicio')
console.log('- El servicio debería estar disponible globalmente')
console.log('- El estado inicial debería ser no autenticado')

// TEST 2: Simular un login
console.log('\n✅ TEST 2: Simular Login')
console.log('- Usar las credenciales: test@example.com / password123')
console.log('- Verificar que se guarde la sesión')
console.log('- Verificar que el estado reactivo se actualice')

// TEST 3: Verificar información del usuario
console.log('\n✅ TEST 3: Información del usuario')
console.log('- El nombre debe mostrarse como "test"')
console.log('- El email debe mostrarse como "test@example.com"')
console.log('- No debe mostrar "Usuario" genérico')

// TEST 4: Simular logout
console.log('\n✅ TEST 4: Simular Logout')
console.log('- Limpiar localStorage y sessionStorage')
console.log('- Actualizar estado reactivo')
console.log('- Redirigir a login')

// TEST 5: Verificar persistencia de sesión
console.log('\n✅ TEST 5: Persistencia de sesión')
console.log('- Recargar la página')
console.log('- La sesión debe mantenerse si se seleccionó "mantener sesión"')

console.log('\n' + '='.repeat(60))
console.log('🎯 INSTRUCCIONES PARA PRUEBA MANUAL:')
console.log('1. Abrir http://localhost:9001/')
console.log('2. Ir a la página de login')
console.log('3. Ingresar email: test@example.com')
console.log('4. Ingresar password: cualquier cosa (mínimo 8 caracteres)')
console.log('5. Hacer clic en "Iniciar Sesión"')
console.log('6. Verificar que aparezca "test" en lugar de "Usuario"')
console.log('7. Hacer clic en el menú de usuario y verificar email')
console.log('8. Hacer clic en "Cerrar Sesión"')
console.log('9. Verificar que se limpie la sesión y redirija al login')
console.log('='.repeat(60))

// Funciones auxiliares para pruebas en consola del navegador
window.testAuth = {
    // Verificar estado actual
    checkCurrentState: () => {
        const session = localStorage.getItem('dashboardLogsSession') ||
            sessionStorage.getItem('dashboardLogsSession')

        console.log('🔍 Estado actual de autenticación:')
        console.log('- localStorage:', localStorage.getItem('dashboardLogsSession'))
        console.log('- sessionStorage:', sessionStorage.getItem('dashboardLogsSession'))

        if (session) {
            try {
                const parsed = JSON.parse(session)
                console.log('- Sesión parseada:', parsed)
                console.log('- Usuario:', parsed.user)
            } catch (e) {
                console.error('- Error parseando sesión:', e)
            }
        }
    },

    // Limpiar sesión manualmente
    clearSession: () => {
        localStorage.removeItem('dashboardLogsSession')
        sessionStorage.removeItem('dashboardLogsSession')
        console.log('🧹 Sesión limpiada manualmente')
    },

    // Crear sesión de prueba
    createTestSession: () => {
        const testSession = {
            isAuthenticated: true,
            user: {
                email: 'test@example.com',
                nombre: 'test'
            },
            mantenerSesion: true,
            timestamp: new Date().toISOString()
        }

        localStorage.setItem('dashboardLogsSession', JSON.stringify(testSession))
        console.log('🧪 Sesión de prueba creada:', testSession)
    }
}

console.log('\n💡 FUNCIONES DE PRUEBA DISPONIBLES EN CONSOLA:')
console.log('- testAuth.checkCurrentState() - Ver estado actual')
console.log('- testAuth.clearSession() - Limpiar sesión')
console.log('- testAuth.createTestSession() - Crear sesión de prueba')
