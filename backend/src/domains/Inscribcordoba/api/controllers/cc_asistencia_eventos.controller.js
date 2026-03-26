import CcAsistenciaEventos from '../../../../models/cc_asistencia_eventos.models.js';
import Curso from '../models/curso.models.js';
import CcAsistenciaInscriptos from '../../../../models/cc_asistencia_inscriptos.models.js';
import CcAsistenciaParticipantes from '../../../../models/cc_asistencia_participantes.models.js';

export const getEventos = async (req, res) => {
    try {
        const eventos = await CcAsistenciaEventos.findAll({
            include: [{ model: Curso, as: 'curso', attributes: ['nombre', 'area'] }]
        });
        
        // Populate stats for each array
        const eventObjects = await Promise.all(eventos.map(async (evento) => {
            const ev = evento.toJSON();
            const cantidad_inscriptos = await CcAsistenciaInscriptos.count({
                where: { evento_id: ev.id }
            });
            const cantidad_asistidos = await CcAsistenciaInscriptos.count({
                where: { evento_id: ev.id, estado_asistencia: 1 }
            });
            return {
                ...ev,
                cantidad_inscriptos,
                cantidad_asistidos
            };
        }));
        
        res.status(200).json(eventObjects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getEventoById = async (req, res) => {
    try {
        const { id } = req.params;
        const evento = await CcAsistenciaEventos.findByPk(id, {
            include: [{ model: Curso, as: 'curso', attributes: ['nombre', 'area'] }]
        });
        if (!evento) return res.status(404).json({ message: "Evento no encontrado" });
        res.status(200).json(evento);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createEvento = async (req, res) => {
    try {
        const { curso_cod, fecha, horario, docente, ubicacion, cupo } = req.body;
        const nuevoEvento = await CcAsistenciaEventos.create({
            curso_cod,
            fecha,
            horario,
            docente,
            ubicacion,
            cupo
        });
        res.status(201).json(nuevoEvento);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateEvento = async (req, res) => {
    try {
        const { id } = req.params;
        const { fecha, horario, docente, cupo, ubicacion } = req.body;
        const evento = await CcAsistenciaEventos.findByPk(id);
        if (!evento) return res.status(404).json({ message: "Evento no encontrado" });

        await evento.update({ fecha, horario, docente, cupo, ubicacion });
        res.status(200).json(evento);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteEvento = async (req, res) => {
    try {
        const { id } = req.params;
        const evento = await CcAsistenciaEventos.findByPk(id);
        if (!evento) return res.status(404).json({ message: "Evento no encontrado" });

        await evento.destroy();
        res.status(200).json({ message: "Evento eliminado" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
