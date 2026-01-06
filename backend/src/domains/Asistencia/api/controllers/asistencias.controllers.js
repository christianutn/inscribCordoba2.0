

import ObtenerAsistenciaPorEventoUseCase from '../../useCases/ObtenerAsistenciaPorEvento.js';
import ConsultarAsistenciaUseCase from '../../useCases/ConsultarAsistenciaUseCase.js';
import RegistrarAsistenciaUseCase from '../../useCases/RegistrarAsistenciaUseCase.js';
import ObtenerListaParticipantesPorEventoUseCase from '../../useCases/ObtenerListaParticipantesPorEventoUseCase.js';

export const obtenerAsistenciaPorEvento = async (req, res) => {
    try {
        const { id_evento, cuil } = req.query;
        if (!id_evento || !cuil) {
            return res.status(400).json({ message: 'id_evento y cuil son requeridos.' });
        }
        const useCase = new ObtenerAsistenciaPorEventoUseCase();
        const resultado = await useCase.ejecutar(id_evento, cuil);
        res.status(200).json(resultado);
    } catch (error) {
        console.error('Error en obtenerAsistenciaPorEvento controller:', error);
        res.status(500).json({ message: error.message || 'Error interno al obtener asistencia por evento' });
    }
};


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

export const obtenerListaParticipantes = async (req, res) => {
    try {
        const { id_evento } = req.query;

        if (!id_evento) {
            return res.status(400).json({ message: 'ID de evento es requerido.' });
        }

        const obtenerListaUseCase = new ObtenerListaParticipantesPorEventoUseCase();
        const resultado = await obtenerListaUseCase.ejecutar(id_evento);

        res.status(200).json(resultado);

    } catch (error) {
        console.error("Error en obtenerListaParticipantes controller:", error);
        res.status(500).json({ message: error.message || 'Error interno al obtener lista de participantes' });
    }
};
