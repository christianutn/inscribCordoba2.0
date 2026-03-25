import CcAsistenciaInscriptos from '../../../../models/cc_asistencia_inscriptos.models.js';
import CcAsistenciaParticipantes from '../../../../models/cc_asistencia_participantes.models.js';
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
                    reparticion: inf.participante.reparticion,
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

export const confirmarAsistencia = async (req, res) => {
    const trans = await sequelize.transaction();
    try {
        const { cuil, evento_id } = req.body;

        // 1. Consultar CIDI para crear o actualizar
        let dataCidi;
        try {
            dataCidi = await cidiService.getPersonaEnCidiPor(cuil);
        } catch (err) {
            logger.error("Error consultando CiDi en confirmarAsistencia:", err);
        }

        if (!dataCidi) {
            await trans.rollback();
            return res.status(404).json({ message: "Participante no encontrado en CIDI" });
        }

        const participanteData = {
            nombre: dataCidi.Nombre || dataCidi.nombre || 'Desconocido',
            apellido: dataCidi.Apellido || dataCidi.apellido || 'Desconocido',
            correo: dataCidi.Email || dataCidi.email || null,
            es_empleado: (dataCidi.Empleado || dataCidi.empleado || 'N').toLowerCase() === 's' ? 1 : 0,
            reparticion: dataCidi.Reparticion || dataCidi.reparticion || 'Ciudadano'
        };

        // 2. Upsert del Participante
        const [participante, pCreated] = await CcAsistenciaParticipantes.findOrCreate({
            where: { cuil },
            defaults: participanteData,
            transaction: trans
        });

        if (!pCreated) {
            await participante.update(participanteData, { transaction: trans });
        }

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
        res.status(500).json({ message: error.message });
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
            const inscriptoExiste = await CcAsistenciaInscriptos.findOne({ where: { cuil, evento_id } });
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
