import generarToken from "../utils/jwt.js";
import logger from '../utils/logger.js';

export const postLogin = async (req, res, next) => {
  try {
    console.log("Usuario autenticado:", req.user);
    const token = generarToken(req.user);

    const nombre = req.user?.nombre || 'Desconocido';
    const dni = req.user?.cuil || 'Desconocido';

    logger.info(`Login exitoso - Nombre: ${nombre}, DNI: ${dni}`);

    res.status(200).json({ token });
  } catch (error) {
    console.log('Se capturó un error en postLogin:', error.message);

    const nombre = req.user?.nombre || 'Desconocido';
    const dni = req.user?.dni || 'Desconocido';

    logger.info(`Error en postLogin: ${error.message} - Usuario: ${nombre}, DNI: ${dni}`);
    res.status(500).json({ error: 'Error interno al iniciar sesión' });
  }
};