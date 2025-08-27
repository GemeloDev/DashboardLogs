// Servidor de producción con configuración CORS
const express = require('express')
const { createProxyMiddleware } = require('http-proxy-middleware')
const path = require('path')
const cors = require('cors')

const app = express()
const PORT = process.env.PORT || 8032

// Configuración CORS para producción
const corsOptions = {
  origin: ['http://187.188.66.56:8032', 'http://localhost:8032', '*'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200 // Para navegadores legacy
}

app.use(cors(corsOptions))

// Middleware adicional para manejar preflight requests
app.options('*', cors(corsOptions))

// Proxy para API en producción con configuración mejorada para query strings
app.use('/api', createProxyMiddleware({
  target: 'http://187.188.66.56:8024',
  changeOrigin: true,
  secure: false,
  // Preservar query strings
  preserveHeaderKeyCase: true,
  onProxyReq: (proxyReq, req) => {
    // Agregar headers CORS al proxy
    proxyReq.setHeader('Access-Control-Allow-Origin', '*')
    proxyReq.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    proxyReq.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept')

    // Log para debug
    console.log('🔄 Proxy request:', req.method, req.url)
  },
  onProxyRes: (proxyRes, req, res) => {
    // Agregar headers CORS a la respuesta
    proxyRes.headers['Access-Control-Allow-Origin'] = '*'
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With, Accept'

    console.log('✅ Proxy response:', req.method, req.url, proxyRes.statusCode)
  },
  onError: (err, req, res) => {
    console.error('❌ Proxy error:', err.message, 'for', req.method, req.url)
    res.status(500).json({ error: 'Proxy error', details: err.message })
  }
}))

// Servir archivos estáticos
app.use(express.static(path.join(__dirname)))

// Manejo de rutas SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor de producción corriendo en puerto ${PORT}`)
  console.log(`📡 Proxy API configurado: /api -> http://187.188.66.56:8024`)
  console.log(`🌐 CORS habilitado para todos los orígenes`)
  console.log(`🔗 URL: http://187.188.66.56:${PORT}`)
})

// Manejo de rutas SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/spa/index.html'))
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor de producción corriendo en puerto ${PORT}`)
  console.log(`📡 Proxy API configurado: /api -> http://187.188.66.56:8024`)
  console.log(`🌐 CORS habilitado para todos los orígenes`)
})
