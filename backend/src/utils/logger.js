import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createLogger, format, transports } from 'winston';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logFormat = format.printf(({ timestamp, level, message }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});

const logger = createLogger({
  level: 'info', // Captura info y error
  format: format.combine(format.timestamp(), logFormat),
  transports: [
    // ✅ actions.log: incluye info y error
    new transports.File({
      filename: path.join(logDir, 'actions.log'),
      level: 'info' // incluye info y error
    }),
    // ✅ errors.log: solo errores
    new transports.File({
      filename: path.join(logDir, 'errors.log'),
      level: 'error'
    })
  ]
});

export default logger;