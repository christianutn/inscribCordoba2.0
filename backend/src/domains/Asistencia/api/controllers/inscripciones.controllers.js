import EventoService from '../../core/services/EventoService.js';
import EventoRepository from '../../core/repositories/EventoRepository.js';

const eventoService = new EventoService(new EventoRepository());

export const registrarInscripcionesMasivas = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No se ha subido ningún archivo.' });
  }

  try {
    const result = await eventoService.crearEventoMasivo(req.file.buffer);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
