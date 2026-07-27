// Configuration for your app
// https://v2.quasar.dev/quasar-cli-vite/quasar-config-file

import { defineConfig } from '#q-app/wrappers'
import fs from 'fs'

export default defineConfig((ctx) => {
  return {
    // https://v2.quasar.dev/quasar-cli-vite/prefetch-feature
    // preFetch: true,

    // app boot file (/src/boot)
    // --> boot files are part of "main.js"
    // https://v2.quasar.dev/quasar-cli-vite/boot-files
    boot: ['pinia', 'i18n'],

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-file#css
    css: ['app.scss'],

    // https://github.com/quasarframework/quasar/tree/dev/extras
    extras: [
      // 'ionicons-v4',
      // 'mdi-v7',
      // 'fontawesome-v6',
      // 'eva-icons',
      // 'themify',
      // 'line-awesome',
      // 'roboto-font-latin-ext', // this or either 'roboto-font', NEVER both!

      'roboto-font', // optional, you are not bound to it
      'material-icons', // optional, you are not bound to it
    ],

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/quasar-config-file#build
    build: {
      target: {
        browser: ['es2022', 'firefox115', 'chrome115', 'safari14'],
        node: 'node20',
      },

      vueRouterMode: 'hash', // available values: 'hash', 'history'

      // ═══════════════════════════════════════════════════════════════
      // INYECCIÓN DE VARIABLES DE ENTORNO - VITE DEFINE
      // ═══════════════════════════════════════════════════════════════
      // Quasar lee automáticamente archivos .env según el modo, pero
      // para asegurar que se carguen los archivos correctos por ambiente
      // se especifican explicitamente con envFiles.
      //
      // Aquí re-exponemos las variables para que estén disponibles
      // en el código del cliente vía process.env
      // ═══════════════════════════════════════════════════════════════
      envFiles: ctx.dev ? ['.env.development', '.env.development.local'] : ['.env.production'],

      env: {
        // En producción se usa el mismo backend que desarrollo (187.188.66.56:8040).
        // En desarrollo se toman las variables del archivo .env correspondiente.
        API_BASE_URL: ctx.prod ? 'http://187.188.66.56:8040/api' : process.env.API_BASE_URL,
        WS_BASE_URL: ctx.prod ? 'ws://187.188.66.56:8040/ws' : process.env.WS_BASE_URL,
        NODE_ENV: process.env.NODE_ENV,
        DEBUG_MODE: process.env.DEBUG_MODE,
        APP_NAME: process.env.APP_NAME,
        APP_VERSION: process.env.APP_VERSION,
        API_TIMEOUT: process.env.API_TIMEOUT,
        SOCKET_TOPIC: process.env.SOCKET_TOPIC,
      },

      // vueRouterBase,
      // vueDevtools,
      // vueOptionsAPI: false,

      // rebuildCache: true, // rebuilds Vite/linter/etc cache on startup

      // publicPath: '/',
      // analyze: true,
      // env: {},
      // rawDefine: {}
      // ignorePublicFolder: true,
      // minify: false,
      // polyfillModulePreload: true,
      // distDir

      extendViteConf(viteConf) {
        // Asegurar que las variables de entorno se reemplacen en el bundle cliente.
        viteConf.define = viteConf.define || {}
        viteConf.define['process.env.API_BASE_URL'] = JSON.stringify(
          ctx.prod ? 'http://187.188.66.56:8040/api' : process.env.API_BASE_URL,
        )
        viteConf.define['process.env.WS_BASE_URL'] = JSON.stringify(
          ctx.prod ? 'ws://187.188.66.56:8040/ws' : process.env.WS_BASE_URL,
        )
        viteConf.define['process.env.NODE_ENV'] = JSON.stringify(process.env.NODE_ENV)
        viteConf.define['process.env.DEBUG_MODE'] = JSON.stringify(process.env.DEBUG_MODE)
        viteConf.define['process.env.APP_NAME'] = JSON.stringify(process.env.APP_NAME)
        viteConf.define['process.env.APP_VERSION'] = JSON.stringify(process.env.APP_VERSION)
        viteConf.define['process.env.API_TIMEOUT'] = JSON.stringify(process.env.API_TIMEOUT)
        viteConf.define['process.env.SOCKET_TOPIC'] = JSON.stringify(process.env.SOCKET_TOPIC)
      },
      // viteVuePluginOptions: {},

      vitePlugins: [
        [
          'vite-plugin-checker',
          {
            eslint: {
              lintCommand: 'eslint -c ./eslint.config.js "./src*/**/*.{js,mjs,cjs,vue}"',
              useFlatConfig: true,
            },
          },
          { server: false },
        ],
      ],
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/quasar-config-file#devserver
    devServer: {
      // https: true,
      open: true, // opens browser window automatically
      proxy: {
        '/filters': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        },
        '/api': {
          // target: 'https://dashboard-api.grupo-santoro.com.mx/',
          // target: 'https://api-logs.grupo-santoro.com.mx/',
          target: 'http://187.188.66.56:8040',
          changeOrigin: true,
          secure: false,
          logLevel: 'debug',  
          onProxyReq: (proxyReq, req) => {
            console.log(
              '🔄 Proxy request:',
              req.method,
              req.url,
              '-> ',
              proxyReq.host + proxyReq.path,
            )
          },
          onProxyRes: (proxyRes, req) => {
            console.log('✅ Proxy response:', proxyRes.statusCode, req.url)
          },
          onError: (err, req) => {
            console.error('❌ Proxy error:', err.message, req.url)
          },
        },
        // 🚨 NUEVA REGLA PARA SOCKET.IO
        '/ws': {
          // target: 'ws://dashboard-api.grupo-santoro.com.mx', // Desplegado de QR
          // target: 'ws://api-logs.grupo-santoro.com.mx', // Desplegado de TrustValue
          target: 'ws://187.188.66.56:8040', // Apunta a servidor local (desarrollo)
          ws: true, // 🚨 Habilitar soporte para WebSockets
          changeOrigin: true,
          secure: false, // Ignora problemas de SSL en el backend si los hubiera
          onError: (err, req) => {
            console.warn('⚠️ WebSocket proxy error:', err.message, req.url)
          },
        },
      },
      https: (() => {
        const keyPath = 'certs/cpanel/clave.key'
        const certPath = 'certs/cpanel/cert.crt'
        const caPath = 'certs/cpanel/csb.cabundle'

        if (fs.existsSync(keyPath) && fs.existsSync(certPath) && fs.existsSync(caPath)) {
          return {
            key: fs.readFileSync(keyPath),
            cert: fs.readFileSync(certPath),
            ca: fs.readFileSync(caPath),
          }
        }

        return undefined
      })(),
      host: '0.0.0.0', // Acepta conexiones desde cualquier IP (PC y celular)
      port: 9000,
      allowedHosts: 'all', // Permite acceso con cualquier hostname
    },

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-file#framework
    framework: {
      config: {},

      // iconSet: 'material-icons', // Quasar icon set
      // lang: 'en-US', // Quasar language pack

      // For special cases outside of where the auto-import strategy can have an impact
      // (like functional components as one of the examples),
      // you can manually specify Quasar components/directives to be available everywhere:
      //
      // components: [],
      // directives: [],

      // Quasar plugins
      plugins: ['Notify', 'Dialog', 'Platform'],
    },

    // animations: 'all', // --- includes all animations
    // https://v2.quasar.dev/options/animations
    animations: [],

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-file#sourcefiles
    // sourceFiles: {
    //   rootComponent: 'src/App.vue',
    //   router: 'src/router/index',
    //   store: 'src/store/index',
    //   pwaRegisterServiceWorker: 'src-pwa/register-service-worker',
    //   pwaServiceWorker: 'src-pwa/custom-service-worker',
    //   pwaManifestFile: 'src-pwa/manifest.json',
    //   electronMain: 'src-electron/electron-main',
    //   electronPreload: 'src-electron/electron-preload'
    //   bexManifestFile: 'src-bex/manifest.json
    // },

    // https://v2.quasar.dev/quasar-cli-vite/developing-ssr/configuring-ssr
    ssr: {
      prodPort: 3000, // The default port that the production server should use
      // (gets superseded if process.env.PORT is specified at runtime)

      middlewares: [
        'render', // keep this as last one
      ],

      // extendPackageJson (json) {},
      // extendSSRWebserverConf (esbuildConf) {},

      // manualStoreSerialization: true,
      // manualStoreSsrContextInjection: true,
      // manualStoreHydration: true,
      // manualPostHydrationTrigger: true,

      pwa: false,
      // pwaOfflineHtmlFilename: 'offline.html', // do NOT use index.html as name!

      // pwaExtendGenerateSWOptions (cfg) {},
      // pwaExtendInjectManifestOptions (cfg) {}
    },

    // https://v2.quasar.dev/quasar-cli-vite/developing-pwa/configuring-pwa
    pwa: {
      workboxMode: 'GenerateSW', // 'GenerateSW' or 'InjectManifest'
      // swFilename: 'sw.js',
      // manifestFilename: 'manifest.json',
      // extendManifestJson (json) {},
      // useCredentialsForManifestTag: true,
      // injectPwaMetaTags: false,
      // extendPWACustomSWConf (esbuildConf) {},
      // extendGenerateSWOptions (cfg) {},
      // extendInjectManifestOptions (cfg) {}
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-cordova-apps/configuring-cordova
    cordova: {
      // noIosLegacyBuildFlag: true, // uncomment only if you know what you are doing
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-capacitor-apps/configuring-capacitor
    capacitor: {
      hideSplashscreen: true,
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/configuring-electron
    electron: {
      // extendElectronMainConf (esbuildConf) {},
      // extendElectronPreloadConf (esbuildConf) {},

      // extendPackageJson (json) {},

      // Electron preload scripts (if any) from /src-electron, WITHOUT file extension
      preloadScripts: ['electron-preload'],

      // specify the debugging port to use for the Electron app when running in development mode
      inspectPort: 5858,

      bundler: 'packager', // 'packager' or 'builder'

      packager: {
        // https://github.com/electron-userland/electron-packager/blob/master/docs/api.md#options
        // OS X / Mac App Store
        // appBundleId: '',
        // appCategoryType: '',
        // osxSign: '',
        // protocol: 'myapp://path',
        // Windows only
        // win32metadata: { ... }
      },

      builder: {
        // https://www.electron.build/configuration/configuration

        appId: 'santoro-logs',
      },
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-browser-extensions/configuring-bex
    bex: {
      // extendBexScriptsConf (esbuildConf) {},
      // extendBexManifestJson (json) {},

      /**
       * The list of extra scripts (js/ts) not in your bex manifest that you want to
       * compile and use in your browser extension. Maybe dynamic use them?
       *
       * Each entry in the list should be a relative filename to /src-bex/
       *
       * @example [ 'my-script.ts', 'sub-folder/my-other-script.js' ]
       */
      extraScripts: [],
    },
  }
})
