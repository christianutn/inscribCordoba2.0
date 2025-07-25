// controllers/logs.controller.js

import logger from '../utils/logger.js';

export const registerLog = (req, res) => {
  const { level, message, meta } = req.body;

  if (!level || !message) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const nivelesPermitidos = ['info', 'warn', 'error'];
  const nivelFinal = nivelesPermitidos.includes(level) ? level : 'info';

  logger[nivelFinal](`${message} ${meta ? JSON.stringify(meta) : ''}`);

  return res.status(200).json({ status: 'logged', nivel: nivelFinal });
};