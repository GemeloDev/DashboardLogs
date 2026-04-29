# 🔧 Sistema de Configuración por Ambiente

## 📋 Descripción

Este proyecto usa un **sistema centralizado de variables de entorno** que permite configurar diferentes valores para desarrollo y producción sin afectar el código.

## 🏗️ Arquitectura

```
Mejores Prácticas Implementadas ✅
==================================

✓ Variables de entorno separadas por ambiente
✓ Único punto de configuración (src/config/env.js)
✓ No hay URLs hardcodeadas en el código
✓ Cambio de ambiente sin tocar código
✓ Configuración separada de lógica
```

## 📁 Estructura de Archivos

```
proyecto/
├── .env                    # Variables comunes a todos los ambientes
├── .env.development        # Variables específicas de desarrollo
├── .env.production         # Variables específicas de producción
├── .env.example            # Ejemplo/documentación de variables
├── .env.local              # Overrides locales (NO se sube a git)
└── src/
    └── config/
        └── env.js          # ⭐ ARCHIVO CENTRAL - importar desde aquí
```

## 🚀 Uso

### Importar configuración

**✅ CORRECTO:**

```javascript
import { API_BASE_URL, WS_BASE_URL, isProduction } from 'src/config/env'

// Usar las variables
console.log(API_BASE_URL) // https://api-logs.grupo-santoro.com.mx/api
```

**❌ INCORRECTO:**

```javascript
// NO hacer esto - no uses process.env directamente
const url = process.env.API_BASE_URL // ❌
```

### Archivos por Ambiente

#### `.env` - Variables Comunes

```env
APP_NAME=Dashboard Logs Santoro
APP_VERSION=1.0.0
API_TIMEOUT=30000
SOCKET_TOPIC=/topic/qr-login
```

#### `.env.development` - Desarrollo Local

```env
API_BASE_URL=http://localhost:8080/api
WS_BASE_URL=ws://localhost:8080/ws
DEBUG_MODE=true
NODE_ENV=development
```

#### `.env.production` - Producción

```env
API_BASE_URL=https://api-logs.grupo-santoro.com.mx/api
WS_BASE_URL=wss://api-logs.grupo-santoro.com.mx/ws
DEBUG_MODE=false
NODE_ENV=production
```

## 💻 Comandos

### Desarrollo

```bash
# Usa .env + .env.development
quasar dev
```

### Producción

```bash
# Usa .env + .env.production
quasar build
```

## 🔐 Configuración Local (Overrides)

Si necesitas URLs diferentes sin modificar los archivos del repositorio:

1. Copia `.env.example` como `.env.local`:

   ```bash
   cp .env.example .env.local
   ```

2. Modifica `.env.local` con tus valores:

   ```env
   API_BASE_URL=http://192.168.1.100:8080/api
   ```

3. `.env.local` **NO se sube a git** (está en .gitignore)

## 📦 Variables Disponibles

| Variable       | Descripción        | Ejemplo                                     |
| -------------- | ------------------ | ------------------------------------------- |
| `API_BASE_URL` | URL del backend    | `https://api-logs.grupo-santoro.com.mx/api` |
| `WS_BASE_URL`  | URL del WebSocket  | `wss://api-logs.grupo-santoro.com.mx/ws`    |
| `NODE_ENV`     | Ambiente actual    | `development` / `production`                |
| `DEBUG_MODE`   | Activar logs debug | `true` / `false`                            |
| `APP_NAME`     | Nombre de la app   | `Dashboard Logs`                            |
| `APP_VERSION`  | Versión de la app  | `1.0.0`                                     |
| `API_TIMEOUT`  | Timeout (ms)       | `30000`                                     |
| `SOCKET_TOPIC` | Tópico WebSocket   | `/topic/qr-login`                           |

## 🔄 Prioridad de Archivos

Quasar carga los archivos en este orden (el último sobrescribe al anterior):

```
1. .env                    # Base
2. .env.development        # Desarrollo (si quasar dev)
   .env.production         # Producción (si quasar build)
3. .env.local              # Overrides locales
4. .env.development.local  # Overrides de desarrollo local
   .env.production.local   # Overrides de producción local
```

## 📚 Archivos Legacy (Compatibilidad)

Estos archivos se mantienen por compatibilidad pero **NO debes usarlos en código nuevo**:

- `src/services/apiConfig.js` - Usa `src/config/env.js` en su lugar
- `src/config/serverConfig.js` - Usa `src/config/env.js` en su lugar

## ✅ Checklist para Nuevos Desarrolladores

- [ ] Copia `.env.example` como `.env.local`
- [ ] Configura tu `API_BASE_URL` local
- [ ] Importa desde `src/config/env.js`
- [ ] No hardcodees URLs
- [ ] No subas `.env.local` a git

## 🐛 Debug

Si quieres ver qué configuración se está usando:

```javascript
import { config, isDebug } from 'src/config/env'

if (isDebug) {
  console.log('Configuración actual:', config)
}
```

En desarrollo (`quasar dev`), la configuración se imprime automáticamente en consola.

## 📝 Notas

- Los archivos `.env.development` y `.env.production` **SÍ se suben a git**
- Los archivos `.env*.local` **NO se suben a git**
- Nunca pongas credenciales sensibles en archivos que se suben a git
- Para CI/CD, usa variables de entorno del sistema o secrets de GitLab/GitHub
