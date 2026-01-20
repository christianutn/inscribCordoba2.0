# 📊 Sistema de Logging en InscribCordoba

## 📦 Versiones de Paquetes

Según `package.json`:
- **winston**: `^3.17.0` - Sistema de logging completo y flexible
- **morgan**: `^1.10.0` - Middleware para logging de peticiones HTTP

---

## 🏗️ Arquitectura del Sistema de Logging

### 1️⃣ **Configuración de Winston** (`src/utils/logger.js`)

```javascript
const logger = createLogger({
  level: 'info',
  format: format.combine(format.timestamp(), logFormat),
  transports: [
    // ✅ actions.log: registra todo (info y error)
    new transports.File({
      filename: path.join(logDir, 'actions.log'),
      level: 'info'
    }),
    // ✅ errors.log: solo errores
    new transports.File({
      filename: path.join(logDir, 'errors.log'),
      level: 'error'
    })
  ]
});
```

**Niveles de logging disponibles:**
- `error` - Errores críticos ❌
- `warn` - Advertencias ⚠️
- `info` - Información general ✅
- `debug` - Debugging (deshabilitado por defecto)

**Ubicación de logs:** `backend/logs/`
- `actions.log` - Todas las acciones e información
- `errors.log` - Solo errores
- `access.log` - Peticiones HTTP (Morgan)

---

### 2️⃣ **Implementación en Controllers**

Ya implementamos logging en `notasAutorizacion.controller.js` con:

#### **Logs Informativos (info):**
```javascript
logger.info('📋 Iniciando consulta de notas de autorización');
logger.info(`✅ Notas de autorización obtenidas: ${count} registros`);
logger.info(`👤 Usuario ${cuil} (${apellido}) - Área: ${area}`);
logger.info(`📎 Archivo: ${filename} (${size} KB)`);
```

#### **Logs de Advertencia (warn):**
```javascript
logger.warn('⚠️ Intento de registro sin archivo adjunto');
```

#### **Logs de Error (error):**
```javascript
logger.error(`❌ Error al registrar nota: ${error.message}`, { 
    stack: error.stack,
    file: req.file?.originalname,
    user: req.user?.user?.cuil
});
```

---

## 🐳 Funcionamiento en Docker + EC2

### 📁 **Estructura de Volúmenes**

Según `docker-compose.yml`:

```yaml
backend:
  volumes:
    - ./uploads:/app/uploads  # Archivos subidos
    # ❗ NOTA: Los logs NO están mapeados como volumen
```

### ⚠️ **Situación Actual de Logs**

**PROBLEMA:** Los logs se están escribiendo DENTRO del contenedor en `/app/logs/`, pero **NO están mapeados a un volumen externo**. Esto significa:

1. ✅ Los logs se generan correctamente dentro del contenedor
2. ❌ Si el contenedor se detiene o elimina, los logs se pierden
3. ❌ No puedes acceder fácilmente a los logs desde el host EC2

### 🔧 **Solución Recomendada: Mapear Logs como Volumen**

Deberías modificar tu `docker-compose.yml` para persistir los logs:

```yaml
backend:
  volumes:
    - ./uploads:/app/uploads
    - ./logs:/app/logs  # 👈 AGREGAR ESTO
```

**Beneficios:**
- ✅ Los logs persisten aunque el contenedor se reinicie
- ✅ Puedes leerlos directamente desde EC2
- ✅ Puedes usar herramientas de monitoreo externas
- ✅ Facilita debugging remoto

---

## 📖 Cómo Acceder a los Logs en Producción (EC2)

### **Opción 1: Logs dentro del contenedor (situación actual)**

```bash
# SSH a tu instancia EC2
ssh usuario@tu-ec2-ip

# Ver logs en tiempo real
docker exec -it inscribcordoba-backend tail -f /app/logs/actions.log
docker exec -it inscribcordoba-backend tail -f /app/logs/errors.log
docker exec -it inscribcordoba-backend tail -f /app/logs/access.log

# Ver últimas 100 líneas
docker exec -it inscribcordoba-backend tail -n 100 /app/logs/actions.log

# Buscar en logs
docker exec -it inscribcordoba-backend grep "Error" /app/logs/errors.log
```

### **Opción 2: Logs del contenedor (Docker logs)**

```bash
# Ver logs de stdout/stderr del contenedor
docker logs inscribcordoba-backend

# Seguir en tiempo real
docker logs -f inscribcordoba-backend

# Últimas 100 líneas
docker logs --tail 100 inscribcordoba-backend
```

### **Opción 3: Con volumen mapeado (RECOMENDADO)**

Si agregas el volumen de logs al `docker-compose.yml`:

```bash
# SSH a EC2
ssh usuario@tu-ec2-ip

# Ir al directorio del proyecto
cd /ruta/al/proyecto

# Ver logs directamente
tail -f logs/actions.log
tail -f logs/errors.log
tail -f logs/access.log

# Grep en logs
grep "Error" logs/errors.log
grep "Usuario" logs/actions.log
```

---

## 🚀 Mejores Prácticas para Logging en Producción

### 1. **Rotación de Logs**

Los archivos de logs pueden crecer mucho. Considera agregar rotación:

```javascript
import winston from 'winston';
import 'winston-daily-rotate-file';

const logger = createLogger({
  transports: [
    new winston.transports.DailyRotateFile({
      filename: 'logs/actions-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d' // Mantener 14 días
    })
  ]
});
```

### 2. **Niveles según Ambiente**

```javascript
const logLevel = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

const logger = createLogger({
  level: logLevel,
  // ...
});
```

### 3. **Monitoreo Remoto (Opcional)**

Para producción seria, considera:
- **CloudWatch Logs** (AWS nativo)
- **Datadog**
- **Sentry** (para errores)
- **ELK Stack** (Elasticsearch, Logstash, Kibana)

---

## 🔍 Interpretando los Logs

### **Flujo de una Nota de Autorización Exitosa:**

```
2026-01-20T09:52:00.000Z [INFO]: 📄 Iniciando registro de nota de autorización
2026-01-20T09:52:00.100Z [INFO]: 👤 Usuario 20123456789 (Pérez) - Área: Sistemas
2026-01-20T09:52:00.150Z [INFO]: 📎 Archivo: nota_autorizacion.pdf (245.67 KB)
2026-01-20T09:52:02.500Z [INFO]: ✅ Nota de autorización registrada exitosamente - ID: 123
```

### **Flujo con Error:**

```
2026-01-20T09:53:00.000Z [INFO]: 📄 Iniciando registro de nota de autorización
2026-01-20T09:53:00.100Z [INFO]: 👤 Usuario 20123456789 (Pérez) - Área: Sistemas
2026-01-20T09:53:00.150Z [INFO]: 📎 Archivo: nota_autorizacion.pdf (245.67 KB)
2026-01-20T09:53:02.500Z [ERROR]: ❌ Error al registrar nota de autorización: Database connection timeout
```

---

## ✅ Checklist de Implementación

- [x] Instaladas dependencias: winston y morgan
- [x] Configurado logger centralizado en `src/utils/logger.js`
- [x] Implementado logging en `notasAutorizacion.controller.js`
- [x] Morgan configurado para logs de acceso HTTP
- [ ] **PENDIENTE:** Mapear volumen de logs en `docker-compose.yml`
- [ ] **OPCIONAL:** Implementar rotación de logs
- [ ] **OPCIONAL:** Configurar alertas para errores críticos

---

## 🛠️ Comando para Aplicar Volumen de Logs

1. **Modificar `docker-compose.yml`:**
   ```yaml
   backend:
     volumes:
       - ./uploads:/app/uploads
       - ./logs:/app/logs  # Nueva línea
   ```

2. **Recrear el contenedor:**
   ```bash
   docker-compose down
   docker-compose up -d
   ```

3. **Verificar:**
   ```bash
   # En tu EC2
   ls -la logs/
   tail -f logs/actions.log
   ```

---

## 📝 Notas Importantes

1. **Los emojis en logs** ayudan a identificar rápidamente el tipo de mensaje al revisar archivos de log
2. **El contexto adicional** (stack traces, file names, user info) facilita el debugging
3. **Winston escribe de forma asíncrona**, no afecta el rendimiento de las peticiones
4. **Morgan y Winston son complementarios**: Morgan para peticiones HTTP, Winston para lógica de negocio

