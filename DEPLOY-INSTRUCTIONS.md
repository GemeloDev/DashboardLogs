# 🚀 INSTRUCCIONES DE DESPLIEGUE A PRODUCCIÓN

## 📋 PREPARACIÓN

### 1. Instalar dependencias de producción
```bash
npm install express cors http-proxy-middleware
```

### 2. Compilar para producción
```bash
npm run build:prod
```

## 🖥️ DESPLIEGUE EN SERVIDOR

### Opción A: Servidor Node.js propio (RECOMENDADO)
```bash
# Copiar dist/spa/ al servidor
# Copiar server-production.js al servidor
cd dist/spa
node server.js
```

### Opción B: Nginx + API
```nginx
server {
    listen 3000;
    server_name 187.188.66.56;
    
    # Headers CORS
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
    add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With";
    
    location / {
        root /path/to/dist/spa;
        try_files $uri $uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://187.188.66.56:8024/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        
        # CORS para proxy
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin *;
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
            add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With";
            return 204;
        }
    }
}
```

## ⚠️ CONFIGURACIÓN CRÍTICA DEL BACKEND

### El servidor API (187.188.66.56:8024) DEBE tener:

```javascript
// Headers CORS obligatorios
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});
```

## 🔧 VERIFICACIÓN

### 1. Probar conectividad
```bash
curl -X OPTIONS http://187.188.66.56:8024/api/logs -H "Origin: http://187.188.66.56:3000" -v
```

### 2. Verificar CORS
- Debe retornar headers Access-Control-Allow-*
- No debe haber errores de CORS en browser console

### 3. Probar API
```bash
curl http://187.188.66.56:8024/api/logs
```

## 🚨 TROUBLESHOOTING CORS

### Error: "CORS policy blocked"
1. Verificar que backend tenga headers CORS
2. Verificar que origen esté permitido
3. Verificar que métodos HTTP estén permitidos

### Error: "Network request failed"
1. Verificar que API esté corriendo en puerto 8024
2. Verificar conectividad de red
3. Revisar logs del backend

### Error: "Preflight request failed"
1. Backend debe responder a OPTIONS
2. Headers Access-Control-Allow-Headers correctos
3. Access-Control-Max-Age configurado

## 📝 COMANDOS RÁPIDOS

```bash
# Desarrollo
npm run dev

# Compilar
npm run build

# Producción completa
npm run prod

# Solo iniciar servidor
npm run start
```
