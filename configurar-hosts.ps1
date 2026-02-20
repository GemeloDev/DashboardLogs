# ===================================================================
# 🔧 Script para configurar hosts de Windows para desarrollo HTTPS
# ===================================================================
#
# Este script agrega una entrada al archivo hosts para que
# prueba.grupo-santoro.com.mx apunte a localhost (127.0.0.1)
#
# IMPORTANTE: Ejecutar como ADMINISTRADOR
# Click derecho en PowerShell → "Ejecutar como administrador"
# ===================================================================

Write-Host "🔧 Configurando archivo hosts para desarrollo HTTPS..." -ForegroundColor Cyan
Write-Host ""

# Ruta del archivo hosts
$hostsPath = "$env:SystemRoot\System32\drivers\etc\hosts"

# Entrada a agregar
$dominio = "prueba.grupo-santoro.com.mx"
$entrada = "127.0.0.1    $dominio"

Write-Host "📋 Verificando archivo hosts..." -ForegroundColor Yellow

# Verificar si ya existe la entrada
$contenido = Get-Content $hostsPath -Raw
if ($contenido -match [regex]::Escape($dominio)) {
    Write-Host "✅ La entrada ya existe en el archivo hosts" -ForegroundColor Green
    Write-Host ""
    Write-Host "Contenido actual:" -ForegroundColor Cyan
    Get-Content $hostsPath | Where-Object { $_ -match $dominio }
} else {
    try {
        Write-Host "➕ Agregando entrada al archivo hosts..." -ForegroundColor Yellow
        
        # Agregar la entrada al final del archivo
        Add-Content -Path $hostsPath -Value "`n# Dashboard Logs - Desarrollo HTTPS`n$entrada"
        
        Write-Host "✅ ¡Entrada agregada exitosamente!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Nueva entrada:" -ForegroundColor Cyan
        Write-Host $entrada -ForegroundColor White
    } catch {
        Write-Host "❌ Error: No se pudo modificar el archivo hosts" -ForegroundColor Red
        Write-Host "Asegúrate de ejecutar PowerShell como ADMINISTRADOR" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Instrucciones manuales:" -ForegroundColor Cyan
        Write-Host "1. Abre Notepad como administrador" -ForegroundColor White
        Write-Host "2. Abre el archivo: $hostsPath" -ForegroundColor White
        Write-Host "3. Agrega al final esta línea:" -ForegroundColor White
        Write-Host "   $entrada" -ForegroundColor Green
        Write-Host "4. Guarda el archivo" -ForegroundColor White
        exit 1
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ CONFIGURACIÓN COMPLETA" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 Ahora puedes acceder a tu aplicación en:" -ForegroundColor Yellow
Write-Host "   https://$dominio`:9000" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Pasos siguientes:" -ForegroundColor Cyan
Write-Host "   1. Ejecuta: quasar dev" -ForegroundColor White
Write-Host "   2. Abre el navegador en: https://$dominio`:9000" -ForegroundColor White
Write-Host "   3. ¡Sin advertencias SSL! 🔒✅" -ForegroundColor White
Write-Host ""
Write-Host "💡 Nota: Si aún ves advertencia, limpia la caché del navegador" -ForegroundColor Yellow
Write-Host "   Chrome: Ctrl+Shift+Delete → Borrar caché e imágenes" -ForegroundColor Gray
Write-Host ""
