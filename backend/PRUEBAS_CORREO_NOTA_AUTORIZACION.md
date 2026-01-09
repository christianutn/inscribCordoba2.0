# Prueba de Envío de Correo al Registrar Nota de Autorización

## 📋 Objetivo
Verificar que al registrar una nota de autorización se envíe correctamente un correo a `soportecampuscordoba@cba.gov.ar` y que si el envío falla, se ejecute el rollback.

## ✅ Prerequisitos

1. **Variables de entorno configuradas** en `.env`:
   ```
   EMAIL_USER=tu_correo@gmail.com
   EMAIL_PASS=tu_contraseña_de_aplicacion
   ```

2. **Base de datos con datos válidos**:
   - Usuario con CUIL existente en la tabla `personas`
   - Área con código existente en la tabla `areas`

## 🧪 Casos de Prueba

### Test 1: Envío Exitoso
**Objetivo**: Verificar que el correo se envía correctamente y se hace commit.

**Pasos**:
1. Iniciar sesión con un usuario válido
2. Cargar una nota de autorización (subir archivo PDF)
3. Verificar que la operación se complete con éxito (status 201)
4. **Comprobar**:
   - ✅ Se creó el registro en la tabla `notas_autorizacion`
   - ✅ Se guardó el archivo localmente
   - ✅ Se creó el registro en `cambios_estado_nota_autorizacion`
   - ✅ Se recibió el correo en `soportecampuscordoba@cba.gov.ar`

**Contenido esperado del correo**:
- **Asunto**: "Nueva Nota de Autorización - [Apellido], [Nombre]"
- **Cuerpo HTML con**:
  - ID de la nota de autorización
  - Nombre completo del usuario
  - CUIL del usuario
  - Nombre del área

---

### Test 2: Fallo en Envío de Correo (Rollback)
**Objetivo**: Verificar que si el envío del correo falla, se ejecuta rollback.

**Pasos para simular fallo**:
1. **Opción A - Credenciales incorrectas**:
   - Modificar temporalmente `.env` con credenciales inválidas
   - Reiniciar el servidor
   - Intentar cargar una nota de autorización

2. **Opción B - SMTP no disponible**:
   - Desconectar internet temporalmente
   - Intentar cargar una nota de autorización

**Comportamiento esperado**:
- ❌ La operación falla con error 500
- ❌ **NO** se crea el registro en `notas_autorizacion`
- ❌ **NO** se guarda el archivo
- ❌ **NO** se crea el registro en `cambios_estado_nota_autorizacion`
- ✅ Se ejecuta rollback correctamente
- ✅ El error se propaga al manejador de errores global

---

### Test 3: Usuario o Área No Existe
**Objetivo**: Verificar que si no se encuentra el usuario o área, se ejecuta rollback.

**Pasos**:
Este caso es difícil de reproducir en condiciones normales, pero podría ocurrir si:
- Se elimina el usuario de la tabla `personas` justo antes del envío del correo
- Se elimina el área de la tabla `areas` justo antes del envío del correo

**Comportamiento esperado**:
- ❌ Error: "No se encontró la persona con CUIL: XXXXX" o "No se encontró el área con código: XXXXX"
- ❌ **NO** se hace commit
- ✅ Se ejecuta rollback

---

## 📊 Verificación en Base de Datos

### Antes de la prueba:
```sql
SELECT COUNT(*) FROM notas_autorizacion;
SELECT COUNT(*) FROM cambios_estado_nota_autorizacion;
```

### Después de prueba exitosa:
```sql
SELECT COUNT(*) FROM notas_autorizacion; -- Debe incrementar en 1
SELECT COUNT(*) FROM cambios_estado_nota_autorizacion; -- Debe incrementar en 1

-- Ver la última nota creada
SELECT * FROM notas_autorizacion ORDER BY id DESC LIMIT 1;
SELECT * FROM cambios_estado_nota_autorizacion ORDER BY id DESC LIMIT 1;
```

### Después de prueba con fallo:
```sql
SELECT COUNT(*) FROM notas_autorizacion; -- NO debe cambiar
SELECT COUNT(*) FROM cambios_estado_nota_autorizacion; -- NO debe cambiar
```

---

## 🔍 Logs Esperados

### En caso de éxito:
```
Correo enviado con éxito!
Message ID: <mensaje_id@gmail.com>
```

### En caso de error:
```
Error al enviar correo: [mensaje de error de nodemailer]
```

---

## 📧 Ejemplo de Correo Recibido

**De**: "InscribCórdoba" <tu_correo@gmail.com>  
**Para**: soportecampuscordoba@cba.gov.ar  
**Asunto**: Nueva Nota de Autorización - García, Juan

**Cuerpo** (HTML formateado):

```
┌─────────────────────────────────────────────┐
│  Nueva Nota de Autorización Registrada      │
└─────────────────────────────────────────────┘

Se ha registrado una nueva nota de autorización 
en el sistema InscribCórdoba.

┌─────────────────────────────────────────────┐
│ ID de Nota: 123                             │
├─────────────────────────────────────────────┤
│ Usuario: Juan García                        │
├─────────────────────────────────────────────┤
│ CUIL: 20123456789                           │
├─────────────────────────────────────────────┤
│ Área: Dirección de Capacitación             │
└─────────────────────────────────────────────┘

Esta notificación es automática. Por favor, 
revise el sistema para más detalles.

────────────────────────────────────────────────
Sistema InscribCórdoba - Gobierno de Córdoba
Este es un correo automático, por favor no responder.
```

---

## 🚨 ¿Qué hacer si algo falla?

### Error: "Error al enviar correo"
1. Verificar que `EMAIL_USER` y `EMAIL_PASS` estén correctamente configurados en `.env`
2. Verificar que `EMAIL_PASS` sea una "Contraseña de aplicación" de Gmail (no la contraseña normal)
3. Verificar conectividad a internet
4. Verificar que Gmail no esté bloqueando el acceso

### Error: "No se encontró la persona con CUIL"
1. Verificar que el CUIL del usuario exista en la tabla `personas`
2. Verificar que el middleware de autenticación esté pasando correctamente `req.user.user.cuil`

### Error: "No se encontró el área con código"
1. Verificar que el código de área del usuario exista en la tabla `areas`
2. Verificar que el middleware de autenticación esté pasando correctamente `req.user.user.area`

---

## ✨ Resultado Final Esperado

✅ **Sistema funcionando correctamente cuando**:
- Se registra la nota de autorización
- Se guarda el archivo
- Se crea el cambio de estado
- **Se envía el correo exitosamente**
- Se hace commit
- Se retorna respuesta exitosa al frontend

❌ **Sistema hace rollback cuando**:
- Falla el envío del correo
- No se encuentra el usuario
- No se encuentra el área
- Cualquier otro error en el proceso
