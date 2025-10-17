import RegistrarInscripcionesMasivasUseCase from '../../useCases/RegistrarInscripcionesMasivasUseCase.js';

const registrarInscripcionesMasivasUseCase = new RegistrarInscripcionesMasivasUseCase();

export const registrarInscripcionesMasivas = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No se ha subido ningún archivo.' });
  }

  try {
    const result = await registrarInscripcionesMasivasUseCase.execute(req.file.buffer);
    if (result.success) {
      res.status(200).json(result);
    } else {
      // Usamos 400 para errores de procesamiento del archivo, 500 para otros errores.
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error en el controlador de inscripciones masivas:', error);
    next(error); // Pasamos el error al siguiente middleware de manejo de errores
  }
};
