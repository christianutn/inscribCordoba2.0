import express from 'express';
import logger from '../../../../utils/logger.js';

const router = express.Router();

router.post('/', (req, res) => {
  const { level, message, meta } = req.body;

  if (logger[level]) {
    // Incluís datos extra si querés
    logger[level](`${message} ${JSON.stringify(meta)}`);
    res.status(200).json({ status: 'logged' });
  } else {
    res.status(400).json({ error: 'Nivel inválido' });
  }
});

export default router;