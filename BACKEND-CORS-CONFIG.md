# Configuración requerida en el servidor backend (187.188.66.56:8024)
# Este archivo debe ser configurado en el servidor de API

# Headers CORS que el backend DEBE incluir:

Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 86400

# Si el backend es Express.js, agregar:
app.use(cors({
  origin: ['http://187.188.66.56:3000', 'http://localhost:3000', '*'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true
}));

# Si el backend es otro framework, configurar equivalente
