# 🔒 Guía de Configuración HTTPS para Dashboard Logs

## 📋 Resumen
Esta guía te ayuda a configurar HTTPS con tu certificado SSL de cPanel para desarrollo local.

---

## ✅ Lo que ya está configurado

1. **Certificados SSL instalados** en `certs/cpanel/`:
   - `cert.crt` - Certificado SSL
   - `clave.key` - Llave privada
   - `csb.cabundle` - Cadena de certificados CA

2. **Quasar configurado** para HTTPS en puerto 9000:
   - Host: `prueba.grupo-santoro.com.mx`
   - Puerto: 9000
   - HTTPS con tus certificados de cPanel

---

## 🚀 Configuración Rápida (OPCIÓN 1: Automática)

### Usando el script PowerShell:

```powershell
# 1. Abre PowerShell como ADMINISTRADOR
#    Click derecho en PowerShell → "Ejecutar como administrador"

# 2. Ejecuta el script
.\configurar-hosts.ps1
```

¡Eso es todo! El script configura todo automáticamente.

---

## 📝 Configuración Manual (OPCIÓN 2: Manual)

### Paso 1: Editar archivo hosts

1. **Abre Notepad como administrador:**
   - Busca "Notepad" en el menú inicio
   - Click derecho → "Ejecutar como administrador"

2. **Abre el archivo hosts:**
   - Archivo → Abrir
   - Navega a: `C:\Windows\System32\drivers\etc\`
   - En "Tipo de archivo" selecciona "Todos los archivos (*.*)"
   - Selecciona el archivo `hosts` y ábrelo

3. **Agrega esta línea al final del archivo:**
   ```
   127.0.0.1    prueba.grupo-santoro.com.mx
   ```

4. **Guarda el archivo** (Ctrl+S)

---

## 🎯 Iniciar el servidor

```powershell
# En tu carpeta del proyecto:
quasar dev
```

---

## 🌐 Acceder a la aplicación

Abre tu navegador en:
```
https://prueba.grupo-santoro.com.mx:9000
```

✅ **Resultado esperado:** Sin advertencias SSL, certificado válido 🔒

---

## 🐛 Resolución de problemas

### ❌ Aún veo "Certificado inválido"

**Causa:** El navegador tiene el sitio en caché

**Solución:**
1. Presiona `Ctrl + Shift + Delete`
2. Selecciona "Imágenes y archivos en caché"
3. Click en "Borrar datos"
4. Recarga la página (Ctrl+F5)

---

### ❌ "Este sitio no puede proporcionar una conexión segura"

**Causa:** El archivo hosts no se guardó correctamente

**Solución:**
1. Verifica que el archivo hosts tiene la entrada
2. Asegúrate de haber guardado como administrador
3. Ejecuta en PowerShell (admin):
   ```powershell
   ipconfig /flushdns
   ```

---

### ❌ "ERR_CONNECTION_REFUSED"

**Causa:** El servidor Quasar no está corriendo

**Solución:**
1. Verifica que ejecutaste `quasar dev`
2. Revisa que el puerto 9000 esté libre
3. Verifica que no haya errores en la consola de Quasar

---

## 🔍 Verificar configuración

### 1. Verificar archivo hosts:
```powershell
Get-Content C:\Windows\System32\drivers\etc\hosts | Select-String "prueba.grupo-santoro"
```

**Resultado esperado:**
```
127.0.0.1    prueba.grupo-santoro.com.mx
```

### 2. Verificar que el dominio resuelve a localhost:
```powershell
ping prueba.grupo-santoro.com.mx
```

**Resultado esperado:**
```
Haciendo ping a prueba.grupo-santoro.com.mx [127.0.0.1] ...
```

### 3. Verificar certificados:
```powershell
Test-Path certs/cpanel/cert.crt, certs/cpanel/clave.key, certs/cpanel/csb.cabundle
```

**Resultado esperado:** Todos deben ser `True`

---

## 📊 Arquitectura

```
Usuario → https://prueba.grupo-santoro.com.mx:9000
            ↓
        [Archivo hosts]
            ↓
        127.0.0.1:9000
            ↓
        [Quasar Dev Server con SSL]
            ↓
        [Certificado cPanel válido]
            ↓
        ✅ Conexión segura sin advertencias
```

---

## 📌 Notas importantes

- ✅ El certificado es **real** de cPanel, no auto-firmado
- ✅ El dominio **coincide** con el certificado
- ✅ Incluye **CA bundle** para cadena de confianza completa
- ✅ Funciona igual que en **producción**
- ⚠️ Solo funciona en **tu máquina local** (archivo hosts)

---

## 🔄 Para deshacer la configuración

Si más tarde quieres eliminar la configuración:

```powershell
# Como administrador:
$hostsPath = "$env:SystemRoot\System32\drivers\etc\hosts"
$contenido = Get-Content $hostsPath | Where-Object { $_ -notmatch "prueba.grupo-santoro" }
Set-Content $hostsPath -Value $contenido
```

---

## 📞 Checklist Final

- [ ] Ejecuté el script `configurar-hosts.ps1` como administrador
- [ ] El archivo hosts tiene la entrada para prueba.grupo-santoro.com.mx
- [ ] Limpié el caché DNS con `ipconfig /flushdns`
- [ ] Ejecuté `quasar dev` sin errores
- [ ] Accedí a https://prueba.grupo-santoro.com.mx:9000
- [ ] ✅ No hay advertencias SSL en el navegador

---

¡Listo! Ahora tienes un entorno de desarrollo HTTPS idéntico a producción 🚀🔒
