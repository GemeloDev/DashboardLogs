// Script de prueba para verificar que los fallbacks han sido removidos
// Ejecutar en la consola del navegador

console.log('🧪 PROBANDO ESTADOS VACÍOS DE GRÁFICAS...\n');

// Simular filtros de prueba
const filtrosPrueba = {
    fechaInicio: '2023-01-01',
    fechaFin: '2023-01-02'
};

// Función para probar un método y verificar que retorne estado vacío
async function probarMetodo(nombreMetodo, metodo) {
    try {
        console.log(`📊 Probando ${nombreMetodo}...`);
        const resultado = await metodo(filtrosPrueba);

        console.log(`  ✅ ${nombreMetodo}:`, {
            isEmpty: resultado.isEmpty,
            series: resultado.series,
            categorias: resultado.categorias,
            detalles: resultado.detalles
        });

        if (resultado.isEmpty) {
            console.log(`  ✅ ${nombreMetodo} correctamente retorna estado vacío`);
        } else if (resultado.series && resultado.series.length === 0) {
            console.log(`  ✅ ${nombreMetodo} retorna series vacías`);
        } else {
            console.log(`  ⚠️ ${nombreMetodo} puede tener datos de fallback`);
        }

    } catch (error) {
        console.error(`  ❌ Error en ${nombreMetodo}:`, error);
    }
}

// Ejecutar pruebas
async function ejecutarPruebas() {
    // Importar el servicio (esto se haría desde la aplicación)
    if (typeof ChartDataService === 'undefined') {
        console.error('❌ ChartDataService no está disponible. Ejecutar desde la aplicación web.');
        return;
    }

    await probarMetodo('getExportacionesData', ChartDataService.getExportacionesData);
    await probarMetodo('getTiemposData', ChartDataService.getTiemposData);
    await probarMetodo('getEscaneosData', ChartDataService.getEscaneosData);
    await probarMetodo('getLoginData', ChartDataService.getLoginData);
    await probarMetodo('getRegistroData', ChartDataService.getRegistroData);
    await probarMetodo('getErroresData', ChartDataService.getErroresData);

    console.log('\n🎉 PRUEBAS COMPLETADAS');
}

// Mensaje de instrucciones
console.log('Para ejecutar las pruebas, copiar y pegar este código en la consola del navegador cuando la aplicación esté cargada, luego ejecutar: ejecutarPruebas()');
