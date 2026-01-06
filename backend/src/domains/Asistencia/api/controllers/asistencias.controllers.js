
import ConsultarAsistenciaUseCase from '../../useCases/ConsultarAsistenciaUseCase.js';
import RegistrarAsistenciaUseCase from '../../useCases/RegistrarAsistenciaUseCase.js';

export const consultarAsistencia = async (req, res) => {
    try {
        const { cuil, id_evento } = req.params;

        const consultarAsistenciaUseCase = new ConsultarAsistenciaUseCase();
        const resultado = await consultarAsistenciaUseCase.ejecutar(cuil, id_evento);

        res.status(200).json(resultado);

    } catch (error) {
        console.error("Error en consultarAsistencia controller:", error);
        res.status(500).json({ message: error.message || 'Error interno al consultar asistencia' });
    }
};

export const registrarAsistencia = async (req, res) => {
    try {
        const { cuil, id_evento } = req.body; // Recibimos del body

        if (!cuil || !id_evento) {
            return res.status(400).json({ message: 'CUIL e ID de evento son requeridos.' });
        }

        const registrarAsistenciaUseCase = new RegistrarAsistenciaUseCase();
        const resultado = await registrarAsistenciaUseCase.ejecutar(cuil, id_evento);

        res.status(200).json(resultado);

    } catch (error) {
        console.error("Error en registrarAsistencia controller:", error);
        res.status(500).json({ message: error.message || 'Error interno al registrar asistencia' });
    }
};
