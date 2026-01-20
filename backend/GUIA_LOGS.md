# 🚀 Guía Rápida de Logs - InscribCordoba

## 📦 Resumen de Implementación

✅ **Paquetes instalados:**
- Winston `^3.17.0` - Logging estructurado
- Morgan `^1.10.0` - HTTP request logging

✅ **Archivos modificados:**
- `src/domains/Inscribcordoba/api/controllers/notasAutorizacion.controller.js` - Logging implementado
- `src/utils/logger.js` - Logger centralizado (ya existente)

---

## 📁 Ubicación de Logs

**Dentro del contenedor:** `/app/logs/`
- `actions.log` - Todas las acciones e info
- `errors.log` - Solo errores
- `access.log` - Peticiones HTTP (Morgan)

---

## 🔍 Comandos Rápidos para EC2

### Ver logs en tiempo real:
```bash
# Logs de acciones
docker exec -it inscribcordoba-backend tail -f /app/logs/actions.log

# Solo errores
docker exec -it inscribcordoba-backend tail -f /app/logs/errors.log

# HTTP access
docker exec -it inscribcordoba-backend tail -f /app/logs/access.log
```

### Ver últimas líneas:
```bash
# Últimas 100 líneas
docker exec inscribcordoba-backend tail -n 100 /app/logs/actions.log
```

### Buscar en logs:
```bash
# Buscar errores específicos
docker exec inscribcordoba-backend grep "Error" /app/logs/errors.log

# Buscar por usuario
docker exec inscribcordoba-backend grep "20123456789" /app/logs/actions.log

# Buscar hoy
docker exec inscribcordoba-backend grep "$(date +%Y-%m-%d)" /app/logs/actions.log
```

### Exportar logs:
```bash
# Copiar log al host
docker cp inscribcordoba-backend:/app/logs/actions.log ./actions_backup.log
```

---

## ⚙️ MEJORA RECOMENDADA: Persistir Logs

### ❌ Problema Actual:
Los logs se pierden si el contenedor se elimina o recrea.

### ✅ Solución:

**1. Modificar `docker-compose.yml`:**
```yaml
backend:
  volumes:
    - ./uploads:/app/uploads
    - ./logs:/app/logs  # 👈 AGREGAR ESTA LÍNEA
```

**2. Aplicar cambios:**
```bash
docker-compose down
docker-compose up -d
```

**3. Ahora puedes acceder directamente:**
```bash
# Sin necesidad de docker exec
tail -f logs/actions.log
grep "Error" logs/errors.log
```

---

## 🎯 Ejemplos de Logs Generados

### ✅ Operación Exitosa:
```
2026-01-20T12:45:00.000Z [INFO]: 📄 Iniciando registro de nota de autorización
2026-01-20T12:45:00.100Z [INFO]: 👤 Usuario 20123456789 (Pérez) - Área: Sistemas
2026-01-20T12:45:00.150Z [INFO]: 📎 Archivo: nota.pdf (245.67 KB)
2026-01-20T12:45:02.500Z [INFO]: ✅ Nota de autorización registrada exitosamente - ID: 123
```

### ❌ Error:
```
2026-01-20T12:46:00.000Z [ERROR]: ❌ Error al registrar nota de autorización: Database connection timeout
```

### ⚠️ Advertencia:
```
2026-01-20T12:47:00.000Z [WARN]: ⚠️ Intento de registro sin archivo adjunto
```

---

## 📊 Script de Monitoreo

Creamos un script interactivo: `monitor-logs.sh`

**Uso básico:**
```bash
# Hacer ejecutable (solo la primera vez)
chmod +x monitor-logs.sh

# Modo interactivo
./monitor-logs.sh

# Uso directo
./monitor-logs.sh actions   # Ver logs de acciones
./monitor-logs.sh errors    # Ver logs de errores
./monitor-logs.sh search    # Buscar en logs
./monitor-logs.sh stats     # Ver estadísticas
```

---

## 🔔 Monitoreo Proactivo (Opcional)

### Alertas por Email cuando hay errores:
```bash
# Agregar a crontab (ejecutar cada 5 min)
*/5 * * * * docker exec inscribcordoba-backend grep "ERROR" /app/logs/errors.log | tail -n 10 | mail -s "Errores InscribCordoba" tu@email.com
```

### Ver logs de container completos:
```bash
# Ver logs de Docker (stdout/stderr)
docker logs inscribcordoba-backend --tail 100

# Seguir en tiempo real
docker logs -f inscribcordoba-backend
```

---

## 📝 Niveles de Logging

| Nivel | Uso | Archivo |
|-------|-----|---------|
| **info** | Operaciones normales | actions.log |
| **warn** | Advertencias, anomalías | actions.log |
| **error** | Errores y excepciones | actions.log + errors.log |

---

## ✅ Checklist Post-Implementación

- [x] Logger importado en controller
- [x] Logs de inicio de operación
- [x] Logs de éxito con datos relevantes
- [x] Logs de error con stack trace
- [x] Logs de advertencia para validaciones
- [ ] **Pendiente:** Mapear volumen de logs en docker-compose
- [ ] **Opcional:** Configurar alertas
- [ ] **Opcional:** Implementar rotación de logs

---

## 🆘 Troubleshooting

### No veo logs en /app/logs/
```bash
# Verificar que la carpeta existe
docker exec inscribcordoba-backend ls -la /app/logs/

# Ver permisos
docker exec inscribcordoba-backend ls -la /app/logs/*.log
```

### Los logs no se actualizan
```bash
# Reiniciar contenedor
docker restart inscribcordoba-backend

# Ver logs de Docker para errores
docker logs inscribcordoba-backend
```

### Logs muy grandes
```bash
# Ver tamaño
docker exec inscribcordoba-backend du -sh /app/logs/*

# Limpiar logs antiguos (más de 7 días)
docker exec inscribcordoba-backend find /app/logs -name "*.log" -mtime +7 -delete
```

---

## 📚 Documentación Completa

Ver `SISTEMA_LOGGING.md` para documentación detallada sobre:
- Arquitectura completa
- Configuración de Winston
- Mejores prácticas
- Rotación de logs
- Integración con CloudWatch
