// core/repositories/EventoRepository.js
import Evento from '../../api/models/eventoAsistencia.model.js';
import sequelize from '../../../../config/database.js';
import CursoAsistencia from '../../api/models/curso.model.js';
import Inscripto from '../../api/models/inscripcion.model.js';
import AsistenciaModel from '../../api/models/asistencia.model.js';
import Nota from '../../api/models/nota.model.js';
import Participante from '../../api/models/participante.model.js';

export default class EventoRepository {

    async crear(EventoData, t) {
        return await Evento.create(EventoData, { transaction: t });
    }

    async actualizar(EventoData, transaction = null) {
        return await Evento.update(EventoData, { transaction });
    }

    async existe(eventoData) {
        return await Evento.findOne({ where: { id: eventoData.id } });
    }

    async obtenerTodos() {
        return await Evento.findAll({
            include: [{
                model: CursoAsistencia,
                as: 'curso'
            }]
        });
    }

    async obtenerEventoPorId(id_evento) {
        return await Evento.findOne({ where: { id: id_evento } });
    }

    async obtenerDetalleCompleto(id_evento) {
        try {
            // 1. Evento + Curso
            const evento = await Evento.findByPk(id_evento, {
                include: [{ model: CursoAsistencia, as: 'curso' }]
            });

            if (!evento) return null;

            // 2. Inscriptos + Participante
            const inscriptos = await Inscripto.findAll({
                where: { id_evento },
                include: [{ model: Participante, as: 'participante' }]
            });

            // 3. Asistencias
            const asistencias = await AsistenciaModel.findAll({
                where: { id_evento }
            });

            // 4. Notas
            const notas = await Nota.findAll({
                where: { id_evento }
            });

            // 5. Build DTO
            const participantesDTO = inscriptos.map(ins => {
                const p = ins.participante;
                // Si por alguna razón no hay participante asociado (data integrity issue), lo saltamos
                if (!p) return null;

                const notaObj = notas.find(n => n.cuil === p.cuil);

                // Filtramos asistencias de este participante
                const asistenciasP = asistencias
                    .filter(a => a.cuil === p.cuil)
                    .map(a => ({
                        fecha: a.fecha,
                        estado_asistencia: a.estado_asistencia
                    }));

                // Ordenar asistencias por fecha? Opcional
                asistenciasP.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

                return {
                    cuil: p.cuil,
                    nombre: p.nombres,
                    apellido: p.apellido,
                    correo_electronico: p.correo_electronico,
                    reparticion: p.reparticion,
                    empleado: p.es_empleado,
                    nota: notaObj ? notaObj.nota : null,
                    asistencias: asistenciasP
                };
            }).filter(item => item !== null);

            return {
                id_evento: evento.id,
                nombre_evento: evento.curso ? evento.curso.nombre : 'Evento sin nombre asociado',
                participantes: participantesDTO
            };

        } catch (error) {
            console.error("Error en obtenerDetalleCompleto:", error);
            throw error;
        }
    }

}
