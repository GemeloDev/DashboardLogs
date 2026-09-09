# Propuesta de refactorización del schema de logs

> Documento dirigido al área de Backend del sistema **CITA_GUYANA** (y sistemas afines) para estandarizar el formato de los eventos de log que se envían al dashboard.

---

## 1. Objetivo

Homogeneizar el JSON de los logs de modo que:

- La información aparezca en los campos correctos del schema.
- No haya datos duplicados ni campos derivados innecesarios.
- El `eventType` refleje la operación de negocio real, no solo la naturaleza técnica del registro.
- Se mejore la seguridad (por ejemplo, evitando exponer contraseñas en `payload`).
- Se mantenga la retrocompatibilidad con `eventType: "SERVICE_METRIC"`.

---

## 2. Catálogo propuesto de `eventType`

Se propone usar nomenclatura `SCREAMING_SNAKE_CASE` para los valores de `eventType`.

Si un método no está catalogado, el backend puede seguir enviando `SERVICE_METRIC` para no romper el dashboard.

| `eventType` | `eventCode` (identificador técnico) | Descripción |
|---|---|---|
| `LOGIN_SUCCESS` | `LoginAttemptService.loginSucceeded` | Usuario autenticado correctamente. |
| `LOGIN_FAILED` | `LoginAttemptService.loginFailed` | Credenciales inválidas. |
| `CITIZEN_SAVED` | `CitizensService.save` | Creación o actualización de un ciudadano. |
| `CITIZEN_LOOKUP` | `CitizensService.findByUsername` | Búsqueda de ciudadano por username. |
| `CITIZEN_VALIDATION` | `CitizensService.notExistsByUsername` | Validación de disponibilidad de username. |
| `CITIZEN_AGE_RECALCULATION` | `CitizensAgeService.recalculateAll` | Recálculo batch de edades de ciudadanos. |
| `SERVICE_METRIC` | (cualquier service metric genérico) | Valor retrocompatible para métodos no catalogados. |

---

## 3. Cambios solicitados

### 3.1 Diversificar `eventType`

- Reemplazar `eventType: "SERVICE_METRIC"` por el valor semántico correspondiente según la tabla anterior.
- Mantener `SERVICE_METRIC` como valor válido para retrocompatibilidad y para métodos no catalogados.
- Actualizar `caseId`: el sufijo actual `SERVICEMETRIC` debe reflejar el `eventType` real.
  - Ejemplo: `GY-1782929838429-LOGINSUCCESS-516f674c71da46`.
- Actualizar `tags`: eliminar la etiqueta genérica `service_metric` y agregar etiquetas derivadas del `eventType` (ej.: `auth_success`, `login`).
- Mover `payload.eventCode` al nivel superior como `eventCode`.

### 3.2 Objeto `actor`

- `actor.username`: debe tomarse de `payload.http.parameters.username` cuando aplique.
- `actor.id`: usar el mismo `username` si no existe un ID numérico disponible.
- `actor.type`:
  - `USER` para eventos iniciados por una persona (login, operaciones de ciudadano).
  - `SERVICE` para procesos batch o métricas técnicas sin usuario.
- Eliminar `payload.http.parameters` (incluyendo la contraseña) por seguridad.

### 3.3 Eliminar campos redundantes o derivados

Eliminar los siguientes campos:

- `eventTypeRaw` (duplica `eventType`).
- `severityRaw` (duplica `severity`).
- `messageKey` (derivable de `message`).
- `isError` (derivable de `severity`).
- `payload.processType` (duplica `eventType`).
- `remoteConnection` (no está definido en el schema y siempre es `null` en las muestras).

### 3.4 HTTP y rendimiento

- `http.statusCode`: debe reflejar el resultado real (ej.: `200` cuando `outcome` es `SUCCESS`).
- `http.latencyMs`: debe corresponder a `payload.durationMs`.
- Eliminar `payload.http` y `payload.request`, ya que duplican la información que debe ir en el objeto `http` de primer nivel.

### 3.5 SLA

- `sla.endTime`: debe calcularse como `startTime + durationMs`.
- `sla.elapsedSeconds`: debe ser coherente con la duración real.
  - Ejemplo: 15 ms → `0` segundos.

### 3.6 Geo / ubicación

- `geo`: enviar `null` cuando no haya coordenadas reales. Evitar el valor `[0, 0]` porque puede interpretarse como una ubicación válida.

### 3.7 Payload limpio

Conservar en `payload`:

- `serviceClass`
- `serviceMethod`
- `methodName`
- `argumentCount`
- `argumentTypes`
- `resultType`
- `durationMs`
- `status`
- `device`
- `description`

Eliminar de `payload`:

- Objetos `service` y `request` (duplican información).
- Headers y parámetros (migran a `http`, `actor` o se eliminan por seguridad).

### 3.8 Meta

- Renombrar `meta.user-agent` a `meta.userAgent` para mantener consistencia camelCase con los demás campos de `meta`.

---

## 4. Ejemplos refactorizados

### 4.1 Login exitoso

```json
{
  "id": "6a4559ae6858c1c627780518",
  "tenantId": "696a76bddc3d6cd1487cdd35",
  "schemaVersion": 1,
  "system": "CITA_GUYANA",
  "environment": "PROD",
  "caseId": "GY-1782929838429-LOGINSUCCESS-516f674c71da46",
  "eventTime": "2026-07-01T18:17:18.429Z",
  "eventType": "LOGIN_SUCCESS",
  "eventCode": "LoginAttemptService.loginSucceeded",
  "status": "APPROVED",
  "outcome": "SUCCESS",
  "severity": "INFO",
  "message": "User login succeeded: salvarez@grupo-santoro.com.mx",
  "geo": null,
  "actor": {
    "id": "salvarez@grupo-santoro.com.mx",
    "type": "USER",
    "username": "salvarez@grupo-santoro.com.mx",
    "fullName": null
  },
  "location": {
    "id": null,
    "name": "localhost",
    "city": null,
    "country": "GUYANA"
  },
  "correlation": {
    "requestId": null,
    "traceId": null,
    "spanId": null
  },
  "http": {
    "method": "POST",
    "path": "/api/login",
    "statusCode": 200,
    "latencyMs": 15
  },
  "sla": {
    "startTime": "2026-07-01T18:17:18.429Z",
    "endTime": "2026-07-01T18:17:18.444Z",
    "elapsedSeconds": 0
  },
  "reason": {
    "code": "APPROVED",
    "description": "Executed LoginAttemptService.loginSucceeded with status APPROVED"
  },
  "tags": [
    "cita_guyana",
    "prod",
    "auth_success",
    "login",
    "com.cita.guyana.service.loginattemptservice"
  ],
  "payload": {
    "serviceClass": "com.cita.guyana.service.LoginAttemptService",
    "serviceMethod": "LoginAttemptService.loginSucceeded(..)",
    "methodName": "loginSucceeded",
    "argumentCount": 1,
    "argumentTypes": {
      "0": "java.lang.String"
    },
    "resultType": null,
    "durationMs": 15,
    "status": "OK",
    "device": "CITAS_GUYANA_BACKEND",
    "description": "Service executed: LoginAttemptService.loginSucceeded completed in 15ms"
  },
  "meta": {
    "deviceId": "CITAS_GUYANA_BACKEND",
    "sourceApp": "CITA_GUYANA",
    "ip": "0:0:0:0:0:0:0:1",
    "build": "",
    "operatorShift": "",
    "userAgent": "PostmanRuntime/7.51.1"
  }
}
```

### 4.2 Proceso batch sin usuario

```json
{
  "id": "6a4559026858c1c6277803f6",
  "tenantId": "696a76bddc3d6cd1487cdd35",
  "schemaVersion": 1,
  "system": "CITA_GUYANA",
  "environment": "PROD",
  "caseId": "GY-1782929666191-CITIZENAGERECALCULATION-2ef8ce12b87447",
  "eventTime": "2026-07-01T18:14:26.191Z",
  "eventType": "CITIZEN_AGE_RECALCULATION",
  "eventCode": "CitizensAgeService.recalculateAll",
  "status": "APPROVED",
  "outcome": "SUCCESS",
  "severity": "INFO",
  "message": "Batch process completed: CitizensAgeService.recalculateAll completed in 93ms",
  "geo": null,
  "actor": {
    "id": null,
    "type": "SERVICE",
    "username": null,
    "fullName": null
  },
  "location": {
    "id": null,
    "name": null,
    "city": null,
    "country": "GUYANA"
  },
  "correlation": {
    "requestId": null,
    "traceId": null,
    "spanId": null
  },
  "http": null,
  "sla": {
    "startTime": "2026-07-01T18:14:26.191Z",
    "endTime": "2026-07-01T18:14:26.284Z",
    "elapsedSeconds": 0
  },
  "reason": {
    "code": "APPROVED",
    "description": "Executed CitizensAgeService.recalculateAll with status APPROVED"
  },
  "tags": [
    "cita_guyana",
    "prod",
    "batch_process",
    "citizens_age",
    "com.cita.guyana.service.citizensageservice"
  ],
  "payload": {
    "serviceClass": "com.cita.guyana.service.CitizensAgeService",
    "serviceMethod": "CitizensAgeService.recalculateAll()",
    "methodName": "recalculateAll",
    "argumentCount": 0,
    "argumentTypes": {},
    "resultType": "java.lang.Integer",
    "durationMs": 93,
    "status": "OK",
    "device": "CITAS_GUYANA_BACKEND",
    "description": "Service executed: CitizensAgeService.recalculateAll completed in 93ms"
  },
  "meta": {
    "deviceId": "CITAS_GUYANA_BACKEND",
    "sourceApp": "CITA_GUYANA",
    "ip": "",
    "build": "",
    "operatorShift": "",
    "userAgent": ""
  }
}
```

---

## 5. Retrocompatibilidad

El dashboard seguirá aceptando `eventType: "SERVICE_METRIC"`. Sin embargo, se recomienda que el backend vaya migrando progresivamente al catálogo semántico para aprovechar las nuevas funcionalidades de filtrado, métricas y alertas del dashboard.

---

## 6. Resumen de campos a eliminar

| Campo | Motivo |
|---|---|
| `eventTypeRaw` | Duplica `eventType`. |
| `severityRaw` | Duplica `severity`. |
| `messageKey` | Derivado de `message`. |
| `isError` | Derivado de `severity`. |
| `remoteConnection` | No está en el schema; siempre `null` en las muestras. |
| `payload.processType` | Duplica `eventType`. |
| `payload.eventCode` | Mover a `eventCode` de primer nivel. |
| `payload.http` | Consolidar en `http` de primer nivel. |
| `payload.request` | Duplica `http` y `meta`. |
| `payload.service` | Duplica `payload.serviceClass` y `payload.serviceMethod`. |
| `payload.http.parameters` | Eliminar por seguridad (contiene password). |

---

## 7. Hallazgos adicionales tras análisis de logs recientes

Tras revisar un nuevo lote de eventos del sistema **CITA_GUYANA**, se detectaron patrones adicionales que deben corregirse.

### 7.1 Nuevos `eventType` detectados y propuestos

El backend ya comenzó a emitir algunos tipos semánticos. Se recomienda formalizarlos y completar el catálogo:

| `eventType` | `eventCode` sugerido | Descripción |
|---|---|---|
| `API_ACCESS` | — | Evento técnico de entrada/salida por controller. Valido para logs de proxy/controller genéricos. |
| `FULL_REGISTRATION` | `AppointmentFlowsController.fullRegistration` | Inicio del flujo de registro completo (`status: STARTED`). |
| `FULL_REGISTRATION_COMPLETED` | `AppointmentFlowsService.processFullRegistration` | Flujo de registro completo finalizado con éxito. |
| `FULL_REGISTRATION_FAILED` | `AppointmentFlowsController.fullRegistration` | Flujo de registro completo fallido o rechazado. |
| `APPOINTMENT_CREATED` | `AppointmentService.createAppointment` | Creación de una cita. |
| `APPOINTMENT_RETRIEVED` | `AppointmentService.getAppointmentById` | Consulta de una cita por ID. |
| `APPOINTMENT_SIMPLE` | `AppointmentController.getSimpleAppointment` | Endpoint simplificado de consulta de cita. |
| `USER_LOADED` | `CitizensService.loadUserByUsername` | Carga de usuario durante autenticación. |
| `BRITISH_PROTECTORATE_PERSON_SAVED` | `BritishProtectoratePeopleService.save` | Guardado de persona del protectorado británico. |
| `CITIZENSHIP_SAVED` | `CitizenshipsService.save` | Guardado de ciudadanía. |
| `DECLARATION_ANSWER_SAVED` | `DeclarationAnswersService.save` | Guardado de respuesta de declaración. |
| `BRANCH_SCHEDULE_RETRIEVED` | `BranchOfficeOpeningHoursServiceImpl.findScheduleForDate` | Consulta de horario de sucursal. |

### 7.2 Redundancia de datos dentro de un solo cuerpo

| Campo redundante | Con qué se repite | Recomendación |
|---|---|---|
| `eventTypeRaw` | `eventType` | Eliminar. |
| `severityRaw` | `severity` | Eliminar. |
| `messageKey` | Derivado de `message` | Eliminar. |
| `isError` | Derivado de `severity` / `outcome` | Eliminar. |
| `payload.status` | `http.statusCode` o `outcome` | Eliminar. |
| `payload.description` | `message` | Eliminar. |
| `payload.device` | `meta.deviceId` | Eliminar de `payload`. |
| `meta.system` | `system` (top-level) | Eliminar de `meta`. |
| `meta.app` / `meta.sourceApp` | Similares | Consolidar en `sourceApp`. |
| `meta.controller` / `meta.javaController` | Duplicados | Dejar solo `controller`. |
| `meta.host` | `location.name` o `http.path` | Eliminar o mover a `location.name`. |
| `payload.details` (en `APPOINTMENT_SIMPLE`) | `actor.username`, `http.method`, `http.path`, `environment`, `system`, `correlation.requestId`, `eventTime`, `http.latencyMs`, `outcome` | Limpiar `details` para que solo tenga datos de negocio no repetidos. |

**Ejemplo crítico:** en el log `APPOINTMENT_SIMPLE` (`id: 6a4576a76858c1c627783c78`), `payload.details` contiene 16 campos, de los cuales **solo `appointmentId` es información nueva**; los otros 15 duplican nodos superiores.

### 7.3 Oportunidades de mejora

1. **Estandarizar `http.path`:** en controllers llega con host completo (`http://localhost:8005/api/...`). Debe ser solo la ruta (`/api/...`).
2. **Corregir `http.statusCode` en eventos `STARTED`:** los logs `FULL_REGISTRATION` con `status: STARTED` / `outcome: PENDING` tienen `statusCode: 500`. Una petición iniciada no debería devolver `500`; usar `0`, `null` u omitir `http` hasta tener respuesta.
3. **Corregir `severity` en errores:** cuando `status` es `REJECTED` o `outcome` es `FAILURE`, `severity` debe ser `ERROR` o `WARN`, no `INFO`.
4. **Unificar estructura de `meta`:** actualmente hay dos formatos (servicios vs controllers). Usar uno solo.
5. **`actor.fullName`:** si no hay nombre real, debe ser `null`, no una copia del `username`.
6. **`location.name`:** para servicios internos `"localhost"` no aporta valor; usar `null`.
7. **Diversificar `SERVICE_METRIC` genéricos:** servicios como `CitizensService.loadUserByUsername` o `DeclarationAnswersService.save` podrían tener su propio `eventType` semántico.

### 7.4 Datos irrelevantes

| Campo | Motivo |
|---|---|
| `remoteConnection` | Siempre `null` y no está en el schema. |
| `payload.device` | Constante `"CITAS_GUYANA_BACKEND"`; duplica `meta.deviceId`. |
| `payload.argumentTypes` con clases Java completas | Ruido para el dashboard; útil solo en debug. |
| `payload.request` vacío | No aporta información. |
| `payload.details.failureAnalysis` anidado | Puede simplificarse a `reason.code` / `reason.description`. |
| `payload.request.serializationError` repetido | Problema técnico separado; no debe mezclarse con errores de negocio. |

---

## 8. Análisis y refactorización de logs de error

### Log de error analizado

```json
{
  "id": "6a4576a36858c1c627783c70",
  "eventType": "FULL_REGISTRATION",
  "status": "REJECTED",
  "outcome": "FAILURE",
  "severity": "INFO",
  "message": "Full registration failed",
  "http": { "statusCode": 400, "latencyMs": 20 },
  "reason": {
    "code": "ILLEGALARGUMENTEXCEPTION",
    "description": "procedureTypeId is required."
  },
  "payload": {
    "request": {
      "serializationError": "Java 8 date/time type `java.time.LocalTime` not supported by default..."
    },
    "details": {
      "failureType": "IllegalArgumentException",
      "rootCause": "procedureTypeId is required.",
      "clientMessage": "procedureTypeId is required.",
      "businessMessage": "procedureTypeId is required.",
      "failureMessage": "procedureTypeId is required.",
      "failureAnalysis": { "whatFailed": "procedureTypeId is required.", "flow": "full-registration" }
    },
    "error": {
      "exceptionSimpleName": "IllegalArgumentException",
      "rootCause": "procedureTypeId is required.",
      "exceptionClass": "IllegalArgumentException",
      "message": "procedureTypeId is required."
    }
  }
}
```

### Problemas detectados

1. `severity: INFO` junto con `REJECTED` / `FAILURE` es incorrecto.
2. `isError: true` con `severity: INFO` es inconsistente.
3. `reason.code` usa el nombre de la excepción en lugar de un código de negocio.
4. La misma descripción se repite 5 veces en `payload.details`.
5. `serializationError` es un bug técnico separado (falta módulo Jackson) mezclado con el error de validación.

### Plan de refactorización para errores

1. **Severidad:** usar `ERROR` para fallos que impiden continuar, `WARN` para validaciones recuperables.
2. **Código de razón:** usar códigos de negocio como `MISSING_REQUIRED_FIELD`, `VALIDATION_ERROR`, `BUSINESS_RULE_VIOLATION`.
3. **Consolidar error:** mantener solo la información esencial en `payload.error`:
   - `exceptionType`
   - `message`
   - `field` (si aplica)
4. **Eliminar duplicados:** quitar `payload.details.clientMessage`, `businessMessage`, `failureMessage`, `failureType`, `failureAnalysis`, `rootCause`.
5. **Separar errores técnicos:** el `serializationError` debe corregirse en backend o, si se loguea, como evento independiente:
   ```json
   {
     "eventType": "SERIALIZATION_ERROR",
     "meta": { "technicalError": "Java 8 date/time type..." }
   }
   ```

### Ejemplo refactorizado del log de error

```json
{
  "id": "6a4576a36858c1c627783c70",
  "tenantId": "696a76bddc3d6cd1487cdd35",
  "schemaVersion": 1,
  "system": "CITA_GUYANA",
  "environment": "PROD",
  "caseId": "GY-1782937251439-FULLREGISTRATIONFAILED-...",
  "eventTime": "2026-07-01T20:20:51.459Z",
  "eventType": "FULL_REGISTRATION_FAILED",
  "eventCode": "AppointmentFlowsController.fullRegistration",
  "status": "REJECTED",
  "outcome": "FAILURE",
  "severity": "ERROR",
  "message": "Full registration failed: procedureTypeId is required.",
  "geo": null,
  "actor": {
    "id": "salvarez@grupo-santoro.com.mx",
    "type": "USER",
    "username": "salvarez@grupo-santoro.com.mx",
    "fullName": null
  },
  "location": { "id": null, "name": null, "city": null, "country": "GUYANA" },
  "correlation": {
    "requestId": "gy-1782937251439-c7fa05d98620",
    "traceId": null,
    "spanId": null
  },
  "http": {
    "method": "POST",
    "path": "/api/appointments/full-registration",
    "statusCode": 400,
    "latencyMs": 20
  },
  "sla": {
    "startTime": "2026-07-01T20:20:51.459Z",
    "endTime": "2026-07-01T20:20:51.479Z",
    "elapsedSeconds": 0
  },
  "reason": {
    "code": "MISSING_REQUIRED_FIELD",
    "description": "procedureTypeId is required."
  },
  "tags": [
    "cita_guyana",
    "prod",
    "full_registration",
    "validation_error",
    "appointments"
  ],
  "payload": {
    "flow": "full-registration",
    "error": {
      "exceptionType": "IllegalArgumentException",
      "message": "procedureTypeId is required.",
      "field": "procedureTypeId"
    }
  },
  "meta": {
    "deviceId": "CITAS_GUYANA_BACKEND",
    "sourceApp": "CITA_GUYANA",
    "controller": "AppointmentFlowsController",
    "platform": "web",
    "ip": "0:0:0:0:0:0:0:1",
    "build": "",
    "operatorShift": "",
    "userAgent": "PostmanRuntime/7.51.1"
  }
}
```

---

## 9. Resumen ejecutivo de acciones para backend

1. Eliminar campos derivados/duplicados: `eventTypeRaw`, `severityRaw`, `messageKey`, `isError`, `remoteConnection`.
2. Limpiar `payload`: quitar `status`, `description`, `device` y objetos `details`/`request` duplicados.
3. Unificar estructura de `meta`.
4. Corregir `severity` en errores (`INFO` → `ERROR`).
5. Separar errores técnicos (`serializationError`) de errores de negocio.
6. Estandarizar `http.path` (sin host) y `http.statusCode` en eventos `STARTED`.
7. Seguir diversificando `eventType` para los servicios que aún usan `SERVICE_METRIC`.
8. Actualizar el catálogo con los nuevos tipos detectados (`API_ACCESS`, `FULL_REGISTRATION*`, `APPOINTMENT_*`, etc.).

---

## 10. Rediseño de `caseId` por sesión de usuario

El `caseId` actual se comporta como identificador de evento individual, lo que impide agrupar acciones relacionadas en el timeline de la página de **Diagnóstico**. A partir de esta propuesta, `caseId` representará una **sesión de usuario**.

### 10.1 Decisiones de diseño

| Aspecto | Definición |
|---|---|
| Alcance | `caseId` por sesión de usuario. |
| Inicio de sesión | Login exitoso. |
| Usuarios no autenticados | `caseId` temporal; al autenticarse se mantiene el mismo `caseId` (Opción A). |
| Duración | Hasta cerrar sesión. |
| Visibilidad | Solo interno; no se expone en URL ni UI. |

### 10.2 Formato propuesto

```text
GY-<sessionId>
```

Ejemplo:

```text
GY-550e8400e29b41d4a716446655440000
```

Se elimina el timestamp y el `eventType` del `caseId` para garantizar que no cambie entre eventos de la misma sesión.

### 10.3 Ciclo de vida de la sesión

#### Inicio de sesión

Cuando el usuario inicia sesión exitosamente, el backend genera el `caseId` y lo almacena en el contexto de sesión.

Evento emitido:

```json
{
  "id": "...",
  "caseId": "GY-550e8400e29b41d4a716446655440000",
  "eventType": "SESSION_STARTED",
  "eventTime": "2026-07-01T20:20:39.172Z",
  "actor": {
    "id": "salvarez@grupo-santoro.com.mx",
    "type": "USER",
    "username": "salvarez@grupo-santoro.com.mx"
  },
  "correlation": {
    "requestId": "gy-1782937239173-..."
  }
}
```

Inmediatamente después se emiten los eventos normales del login:

```json
{
  "caseId": "GY-550e8400e29b41d4a716446655440000",
  "eventType": "LOGIN_SUCCESS",
  ...
}
```

#### Durante la sesión

Todos los eventos subsiguientes usan el mismo `caseId`:

```text
caseId: GY-550e8400e29b41d4a716446655440000

1. LOGIN_SUCCESS
2. USER_LOADED
3. FULL_REGISTRATION_STARTED
4. CITIZEN_LOOKUP
5. CITIZEN_SAVED
6. FULL_REGISTRATION_FAILED
7. API_ACCESS
```

#### Fin de sesión

Evento recomendado al cerrar sesión:

```json
{
  "caseId": "GY-550e8400e29b41d4a716446655440000",
  "eventType": "SESSION_ENDED",
  "reason": {
    "code": "LOGOUT",
    "description": "User logged out"
  }
}
```

### 10.4 Usuarios no autenticados (caseId temporal)

Para acciones previas al login se genera un `caseId` temporal. Con la **Opción A**, al autenticarse exitosamente se **mantiene el mismo `caseId` temporal** para preservar la continuidad del historial:

```text
Antes del login:
  caseId: GY-550e8400e29b41d4a716446655440000 (temporal)
  evento: LOGIN_FAILED

Después del login exitoso:
  caseId: GY-550e8400e29b41d4a716446655440000 (mismo)
  evento: LOGIN_SUCCESS
  evento: SESSION_STARTED
```

### 10.5 Implementación con JWT

Como el backend maneja sesiones JWT, el `caseId` debe almacenarse en el payload del token JWT como una claim personalizada:

```json
{
  "sub": "salvarez@grupo-santoro.com.mx",
  "caseId": "GY-550e8400e29b41d4a716446655440000",
  "iat": 1782937239,
  "exp": 1782940839
}
```

Alternativamente, puede guardarse en el `SecurityContext` / `ThreadLocal` del backend. El servicio de logging debe leerlo desde allí en cada evento.

#### Pseudocódigo de propagación

```java
@Service
public class CitizensService {
    public Optional<Citizens> findByUsername(String username) {
        String caseId = JwtSessionContext.getCurrentCaseId();
        String requestId = generateRequestId();

        // Lógica de negocio

        logService.emit(LogEvent.builder()
            .caseId(caseId)
            .eventType("CITIZEN_LOOKUP")
            .correlation(Correlation.builder()
                .requestId(requestId)
                .build())
            .build());
    }
}
```

### 10.6 Jerarquía de identificadores

| Campo | Ámbito | Ejemplo | Uso |
|---|---|---|---|
| `caseId` | Sesión | `GY-550e84...` | Timeline de Diagnóstico. |
| `correlation.requestId` | Request HTTP | `gy-1782937251439-...` | Depurar petición específica. |
| `correlation.traceId` | Traza distribuida | `abc123...` | Seguimiento entre servicios. |
| `correlation.spanId` | Span interno | `span-001` | Operaciones dentro de traza. |

### 10.7 Ejemplo completo de sesión en el timeline

```text
caseId: GY-550e8400e29b41d4a716446655440000
actor:  salvarez@grupo-santoro.com.mx

Timeline:
  1. 20:20:39 - SESSION_STARTED
  2. 20:20:39 - LOGIN_SUCCESS
  3. 20:20:38 - USER_LOADED
  4. 20:21:10 - FULL_REGISTRATION_STARTED
  5. 20:21:10 - CITIZEN_LOOKUP
  6. 20:21:10 - CITIZEN_SAVED
  7. 20:21:10 - FULL_REGISTRATION_FAILED
  8. 20:21:10 - API_ACCESS
  9. 20:25:00 - SESSION_ENDED (logout)
```

---

## 11. Nota sobre eventos relevantes

No todas las acciones del sistema deben generar un log. Se debe evitar registrar eventos que no aportan valor operativo, de auditoría o de diagnóstico.

### Eventos que SÍ deben loguearse

- Login / logout y errores de autenticación.
- Creación, actualización o eliminación de registros principales (ciudadanos, citas, ciudadanías, etc.).
- Cambios de estado en flujos de negocio.
- Errores y excepciones.
- Llamadas a APIs externas.
- Operaciones de alto impacto o que modifican datos.

### Eventos que NO deberían loguearse

- Cargas de catálogos para llenar selects (`BranchOfficeOpeningHoursServiceImpl.findScheduleForDate` para dropdowns).
- Búsquedas internas repetitivas que no son acciones del usuario.
- Consultas de validación trivial sin modificación de estado.
- Eventos de servicio con duración muy corta y sin relevancia de negocio.

> **Regla práctica:** si al quitar el evento del timeline de Diagnóstico no se pierde contexto útil para soporte, auditoría o trazabilidad, no debe generarse.

---

## 12. Notas para implementación

- Los `tags` pueden seguir en minúsculas y snake_case; solo `eventType` usará `SCREAMING_SNAKE_CASE`.
- Si no se dispone de coordenadas reales, preferir omitir `geo` o enviar `null` en lugar de `[0, 0]`.
- El `caseId` debe mantenerse constante durante toda la sesión (ver sección 10).
- Para flujos con varias etapas (inicio, proceso, fin), todos los eventos deben compartir el mismo `caseId`.
- Antes de emitir un log, evaluar si el evento es relevante (ver sección 11).
