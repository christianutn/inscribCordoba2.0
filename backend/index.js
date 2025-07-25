const express = require('express');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const { createLogger, format, transports } = require('winston');

const app = express();
app.use(express.json());

// 📁 Asegurar que la carpeta logs exista
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// 🪵 Configurar Winston para acciones y errores
const logger = createLogger({
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`)
  ),
  transports: [
    new transports.File({ filename: path.join(logDir, 'actions.log'), level: 'info' }),
    new transports.File({ filename: path.join(logDir, 'errors.log'), level: 'error' })
  ]
});

// 🌐 Middleware de accesos HTTP (morgan)
const accessLogStream = fs.createWriteStream(path.join(logDir, 'access.log'), { flags: 'a' });
app.use(morgan('combined', { stream: accessLogStream }));

// ✅ Ruta de ejemplo: acción del usuario
app.post('/api/crear', (req, res) => {
  logger.info(`Usuario creó un recurso con datos: ${JSON.stringify(req.body)}`);
  res.status(201).send('Recurso creado');
});

// ❌ Ruta de ejemplo: error forzado
app.get('/api/error', (req, res) => {
  throw new Error('Error simulado');
});

// 🛑 Middleware de errores
app.use((err, req, res, next) => {
  logger.error(`Error en ${req.method} ${req.url}: ${err.message}`);
  res.status(500).send('Error interno del servidor');
});

// 🚀 Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});