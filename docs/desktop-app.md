# DashboardLogs Desktop

Esta guia deja asentada la configuracion minima que debe sobrevivir al trabajar entre ramas.

## Archivos obligatorios

- `src-electron/electron-main.js`: proceso principal de Electron, ventanas administradas y canales IPC.
- `src-electron/electron-preload.js`: puente seguro `window.desktopApp` para el renderer.
- `src-electron/icons/*`: iconos usados por Quasar/Electron al empaquetar.
- `quasar.config.js`: bloque `sourceFiles.electron*`, `electron.preloadScripts`, `electron.packager` y env de desarrollo.
- `package.json` y `package-lock.json`: scripts de escritorio y dependencias `electron` + `@electron/packager`.

## Scripts

```powershell
npm run dev:desktop
npm run build:desktop
npm run build:desktop:unpackaged
```

## Dependencias esperadas

```json
{
  "devDependencies": {
    "electron": "^38.0.0",
    "@electron/packager": "^18.3.2"
  }
}
```

Si una rama no las tiene:

```powershell
npm install --save-dev electron @electron/packager
```

## Proxy y CORS en desarrollo

En `quasar dev -m electron`, la app debe llamar:

```text
http://localhost:9000/api/...
ws://localhost:9000/ws
```

No debe llamar directamente a `http://187.188.66.56:8040` desde el renderer, porque eso vuelve a activar CORS.

La configuracion clave esta en `quasar.config.js`:

```js
API_BASE_URL: ctx.dev ? '/api' : envValue(appEnv, 'API_BASE_URL')
WS_BASE_URL: ctx.dev ? '/ws' : envValue(appEnv, 'WS_BASE_URL')
```

## Multipantallas en Electron

Las ventanas de dashboard no deben depender de `window.open()` como mecanismo principal dentro de Electron.

El flujo correcto es:

- `DashboardPopoutButton.vue` llama `window.desktopApp.openDashboardSectionWindow(...)`.
- `electron-main.js` crea o enfoca un `BrowserWindow` por seccion.
- `dashboardShared.store.js` sincroniza filtros, refresh por WebSocket y cierres con IPC.
- El fallback web con `window.open()` se conserva para navegador.

## Checklist al bajar cambios de otra rama

1. Verificar que exista `src-electron`.
2. Verificar que `package.json` conserve `dev:desktop`, `build:desktop` y `build:desktop:unpackaged`.
3. Verificar que `quasar.config.js` conserve `sourceFiles.electronMain`, `sourceFiles.electronPreload` y `preloadScripts`.
4. Ejecutar `npm install` si cambio `package-lock.json`.
5. Ejecutar `npm run lint`.
6. Ejecutar `npm run dev:desktop` y validar login, filtros y multipantallas.

## Validacion rapida

```powershell
npm run lint
npm run build:desktop:unpackaged
```

`build:desktop:unpackaged` valida que Quasar pueda compilar UI, main y preload sin empaquetar instalador.

## Error conocido: esbuild spawn EPERM

Si `npm run build:desktop:unpackaged` falla con:

```text
Error: spawn EPERM
node_modules\esbuild\lib\main.js
```

El problema no es la configuracion de Electron. Es un bloqueo local al iniciar el proceso de servicio de `esbuild`, comun en carpetas sincronizadas, antivirus o politicas de Windows.

Acciones recomendadas:

- Mover el repositorio fuera de OneDrive, por ejemplo a `C:\dev\DashboardLogs`.
- Agregar excepciones para `node.exe` y `node_modules\@esbuild\win32-x64\esbuild.exe`.
- Reinstalar dependencias con `npm install`.
- Repetir `npm run build:desktop:unpackaged`.
