# Guía de Despliegue

Este documento describe el proceso de compilación y despliegue continuo del **Dashboard Logs Santoro** a AWS S3 + CloudFront mediante GitLab CI/CD.

---

## 1. Visión general del pipeline

```
Push a rama development
        │
        ▼
GitLab CI/CD
        │
        ├──► Stage build
        │      ├── node:20
        │      ├── npm install
        │      └── NODE_ENV=production npm run build
        │
        └──► Stage deploy
               ├── ubuntu:latest
               ├── instalar AWS CLI
               ├── aws s3 sync dist/spa/ → S3
               └── aws cloudfront create-invalidation
```

URL de producción: `https://dashboard.grupo-santoro.com.mx`

---

## 2. Pipeline GitLab CI/CD

Configuración: `.gitlab-ci.yml`.

### Stages

| Stage | Job | Descripción |
|-------|-----|-------------|
| `build` | `build` | Compila el SPA en `dist/spa/`. |
| `deploy` | `deploy` | Sube a S3 e invalida CloudFront. |

### Disparadores

- El pipeline se ejecuta automáticamente al hacer push a la rama `development`.
- Se usa `only: - development`.

### Job de build

```yaml
build:
  stage: build
  image: node:20
  only:
    - development

  script:
    - npm install
    - NODE_ENV=production npm run build

  artifacts:
    name: "dashboard-logs-$CI_COMMIT_SHORT_SHA"
    paths:
      - dist/spa/
    expire_in: 1 hour
```

### Job de deploy

```yaml
deploy:
  stage: deploy
  image: ubuntu:latest
  dependencies:
    - build

  before_script:
    - apt-get update -y
    - apt-get install -y curl unzip
    - curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    - unzip awscliv2.zip
    - ./aws/install

  script:
    - aws s3 sync dist/spa/ s3://$S3_FRONTEND_BUCKET/ --delete --region $AWS_DEFAULT_REGION
    - aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --paths "/*"

  environment:
    name: production
    url: https://dashboard.grupo-santoro.com.mx

  allow_failure: false
```

---

## 3. Variables de entorno de CI/CD

Las siguientes variables deben estar configuradas en GitLab (Settings → CI/CD → Variables):

| Variable | Descripción |
|----------|-------------|
| `S3_FRONTEND_BUCKET` | Nombre del bucket de S3 donde se aloja el SPA. |
| `AWS_DEFAULT_REGION` | Región de AWS (ej. `us-east-1`). |
| `CLOUDFRONT_DISTRIBUTION_ID` | ID de la distribución de CloudFront. |
| `AWS_ACCESS_KEY_ID` | Credencial de AWS. |
| `AWS_SECRET_ACCESS_KEY` | Credencial de AWS. |

> **Nota:** no almacenar credenciales en el repositorio. Usar variables de GitLab o secretos seguros.

---

## 4. Build de producción

### Comando local

```bash
NODE_ENV=production npm run build
```

### Salida

El build genera los archivos estáticos en `dist/spa/`:

```
dist/spa/
├── index.html
├── assets/
│   ├── js/       # Bundles de JavaScript
│   ├── css/      # CSS compilado
│   └── ...       # Fonts, imágenes, etc.
└── favicon.ico
```

### Configuración de entorno en producción

El archivo `quasar.config.js` define las URLs de backend para producción:

```javascript
env: {
  API_BASE_URL: ctx.prod ? 'http://187.188.66.56:8040/api' : process.env.API_BASE_URL,
  WS_BASE_URL: ctx.prod ? 'ws://187.188.66.56:8040/ws' : process.env.WS_BASE_URL,
  // ...
}
```

> **Nota:** actualmente el build de producción está alineado para apuntar al servidor de desarrollo (`187.188.66.56:8040`) en lugar de la URL de producción declarada en `.env.production` (`https://dashboard-api.grupo-santoro.com.mx`). Esto puede cambiar según la configuración operativa.

### Archivos de entorno

| Archivo | Uso |
|---------|-----|
| `.env` | Variables comunes; apunta a `api-logs.grupo-santoro.com.mx`. |
| `.env.production` | Variables de producción; apunta a `dashboard-api.grupo-santoro.com.mx`. |
| `.env.development` | Variables de desarrollo; apunta a `187.188.66.56:8040`. |

Para más detalles consulta [`docs/CONFIGURACION_AMBIENTE.md`](CONFIGURACION_AMBIENTE.md).

---

## 5. Hosting en S3

- El contenido de `dist/spa/` se sincroniza con el bucket S3 usando `aws s3 sync ... --delete`.
- `--delete` elimina archivos del bucket que ya no están en el build.
- El bucket está configurado como sitio web estático.

### Configuración recomendada del bucket

- **Static website hosting:** habilitado.
- **Public access:** configurado para permitir lectura pública.
- **Redirección de errores:** `index.html` para soportar Vue Router hash mode.
- **Política de CORS:** configurada según los dominios de la API.

---

## 6. CloudFront

- CloudFront distribuye el contenido del bucket S3 globalmente.
- Tras cada deploy se ejecuta `create-invalidation --paths "/*"` para limpiar la caché.
- Los cambios suelen verse en 1-2 minutos.

### Configuración recomendada

- **Origin:** bucket S3 o REST API endpoint.
- **Default root object:** `index.html`.
- **Error pages:** `index.html` con código 200 para soportar rutas SPA.
- **HTTPS:** certificado SSL configurado para `dashboard.grupo-santoro.com.mx`.

---

## 7. Proceso de deploy manual (no recomendado)

En caso de necesitar un deploy manual:

```bash
# 1. Compilar
NODE_ENV=production npm run build

# 2. Sincronizar con S3 (requiere AWS CLI configurado)
aws s3 sync dist/spa/ s3://<tu-bucket>/ --delete --region <tu-region>

# 3. Invalidar CloudFront
aws cloudfront create-invalidation --distribution-id <tu-distribution-id> --paths "/*"
```

---

## 8. Monitoreo del deploy

1. Revisar el estado del pipeline en GitLab CI/CD.
2. Verificar que el build finalice sin errores.
3. Confirmar que `dist/spa/` contenga los archivos esperados.
4. Verificar la invalidación de CloudFront.
5. Acceder a `https://dashboard.grupo-santoro.com.mx` y validar cambios.

---

## 9. Rollback

En caso de problemas:

1. Identificar el commit anterior estable.
2. Revertir el merge/push en GitLab.
3. El pipeline se ejecutará automáticamente con la versión anterior.
4. Alternativamente, subir manualmente un build anterior a S3 e invalidar CloudFront.

---

## 10. Buenas prácticas

1. **Siempre ejecutar lint y format antes de subir:**
   ```bash
   npm run lint
   npm run format
   ```
2. **Ejecutar scan de secretos antes de commitear:**
   ```bash
   npm run security:scan-secrets
   ```
3. **No subir builds locales** a `dist/` al repositorio.
4. **No hardcodear URLs** de producción en código; usar variables de entorno.
5. **Revisar cambios en `.env.production` y `quasar.config.js`** antes de deploys oficiales.

---

## 11. Archivos clave

| Archivo | Responsabilidad |
|---------|-----------------|
| `.gitlab-ci.yml` | Pipeline de CI/CD. |
| `quasar.config.js` | Configuración de build y variables de entorno. |
| `.env.production` | Variables de entorno de producción. |
| `.env` | Variables comunes. |
| `package.json` | Scripts y dependencias. |

---

## 12. Referencias

- [README.md](../README.md)
- [ARCHITECTURE.md](ARCHITECTURE.md)
- [DEVELOPMENT.md](DEVELOPMENT.md)
- [CONFIGURACION_AMBIENTE.md](CONFIGURACION_AMBIENTE.md)
