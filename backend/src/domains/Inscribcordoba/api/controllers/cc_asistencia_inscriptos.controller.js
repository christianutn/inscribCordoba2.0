import CcAsistenciaInscriptos from '../../../../models/cc_asistencia_inscriptos.models.js';
import CcAsistenciaParticipantes from '../../../../models/cc_asistencia_participantes.models.js';
import CcAsistenciaEventos from '../../../../models/cc_asistencia_eventos.models.js';
import sequelize from '../../../../config/database.js';
import CidiService from '../../../../services/CidiService.js';
import logger from '../../../../utils/logger.js';

const cidiService = new CidiService();

export const getInscriptosByEvento = async (req, res) => {
    try {
        const { evento_id } = req.params;
        const inscriptos = await CcAsistenciaInscriptos.findAll({
            where: { evento_id },
            include: [{ model: CcAsistenciaParticipantes, as: 'participante' }]
        });

        // Transform for easier frontend consumption
        const reformatted = inscriptos.map(i => {
            const inf = i.toJSON();
            if (inf.participante) {
                return {
                    ...inf,
                    nombre: inf.participante.nombre,
                    apellido: inf.participante.apellido,
                    correo: inf.participante.correo,
                    es_empleado: inf.participante.es_empleado
                }
            }
            return inf;
        });
        res.status(200).json(reformatted);
    } catch (error) {
        logger.error("Error en getInscriptosByEvento:", error);
        res.status(500).json({ message: error.message });
    }
};

const upsertParticipanteFromCidi = async (cuil, trans) => {
    let dataCidi;
    try {
        dataCidi = await cidiService.getPersonaEnCidiPor(cuil);
    } catch (err) {
        logger.error(`Error consultando CiDi para CUIL ${cuil}:`, err);
    }

    if (!dataCidi) {
        throw new Error(`Participante no encontrado en CIDI para CUIL ${cuil}`);
    }

    const participanteData = {
        nombre: dataCidi.Nombre || dataCidi.nombre || 'Desconocido',
        apellido: dataCidi.Apellido || dataCidi.apellido || 'Desconocido',
        correo: dataCidi.Email || dataCidi.email || null,
        es_empleado: (dataCidi.Empleado || dataCidi.empleado || 'N').toLowerCase() === 's' ? 1 : 0,
    };

    const [participante, pCreated] = await CcAsistenciaParticipantes.findOrCreate({
        where: { cuil },
        defaults: participanteData,
        transaction: trans
    });

    if (!pCreated) {
        await participante.update(participanteData, { transaction: trans });
    }

    return participante;
};

export const confirmarAsistencia = async (req, res) => {
    const trans = await sequelize.transaction();
    try {
        const { cuil, evento_id } = req.body;

        // buscar evento por id 
        const evento = await CcAsistenciaEventos.findByPk(evento_id, { transaction: trans });
        if (!evento) {
            throw new Error("Evento no encontrado");
        }

        // Si la fecha actual no coincide con la fecha del evento, no se puede confirmar la asistencia
        if (evento.fecha !== new Date().toISOString().split('T')[0]) {
            throw new Error("La fecha actual no coincide con la fecha del evento");
        }

        await upsertParticipanteFromCidi(cuil, trans);

        // 3. Upsert del Inscripto (Asistencia confirmada = 1)
        const [inscripto, iCreated] = await CcAsistenciaInscriptos.findOrCreate({
            where: { cuil, evento_id },
            defaults: { estado_asistencia: 1 },
            transaction: trans
        });

        if (!iCreated && inscripto.estado_asistencia !== 1) {
            await inscripto.update({ estado_asistencia: 1 }, { transaction: trans });
        }

        await trans.commit();
        res.status(200).json({ message: "Asistencia confirmada" });
    } catch (error) {
        if (trans) await trans.rollback();
        logger.error("Error en confirmarAsistencia:", error);
        res.status(error.message.includes("no encontrado en CIDI") ? 404 : 500).json({ message: error.message });
    }
};

export const updateNotaYAsistencia = async (req, res) => {
    try {
        const { id } = req.params;
        const { nota, estado_asistencia } = req.body;
        const inscripto = await CcAsistenciaInscriptos.findByPk(id);
        if (!inscripto) return res.status(404).json({ message: "Inscripto no encontrado" });

        await inscripto.update({ nota, estado_asistencia });
        res.status(200).json(inscripto);
    } catch (error) {
        logger.error("Error en updateNotaYAsistencia:", error);
        res.status(500).json({ message: error.message });
    }
};

export const cargarInscriptosMasivos = async (req, res) => {
    const trans = await sequelize.transaction();
    try {
        const { inscriptos } = req.body; // array of {cuil, evento_id}
        if (!inscriptos || !inscriptos.length) {
            return res.status(400).json({ message: "No se enviaron datos" });
        }
        for (const data of inscriptos) {
            const { cuil, evento_id, estado_asistencia } = data;

            try {
                await upsertParticipanteFromCidi(cuil, trans);
            } catch (err) {
                logger.warn(`Saltando insercion de inscripto por error en CiDi para CUIL ${cuil}: ${err.message}`);
                continue; // Skip if we can't find them in CiDi
            }

            const inscriptoExiste = await CcAsistenciaInscriptos.findOne({ where: { cuil, evento_id }, transaction: trans });
            if (!inscriptoExiste) {
                await CcAsistenciaInscriptos.create({
                    cuil,
                    evento_id,
                    estado_asistencia: estado_asistencia || 0,
                    nota: 0
                }, { transaction: trans });
            }
        }
        await trans.commit();
        res.status(200).json({ message: "Carga masiva completada" });
    } catch (error) {
        if (trans) await trans.rollback();
        logger.error("Error en cargarInscriptosMasivos:", error);
        res.status(500).json({ message: error.message });
    }
};
