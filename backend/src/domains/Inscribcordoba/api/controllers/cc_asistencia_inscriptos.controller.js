import CcAsistenciaInscriptos from '../../../../models/cc_asistencia_inscriptos.models.js';
import CcAsistenciaParticipantes from '../../../../models/cc_asistencia_participantes.models.js';
import sequelize from '../../../../config/database.js';
import CidiService from '../../../../services/CidiService.js';

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
        res.status(500).json({ message: error.message });
    }
};

export const confirmarAsistencia = async (req, res) => {
    // Si no existe el inscripto, lo creamos
    const trans = await sequelize.transaction();
    try {
        const { cuil, evento_id } = req.body;

        // 1. Consultar existencia del participante
        let participante = await CcAsistenciaParticipantes.findOne({ where: { cuil } });

        if (!participante) {
            // Consultar en CIDI
            const dataCidi = await cidiService.getPersonaEnCidiPor(cuil);
            if (!dataCidi) {
                return res.status(404).json({ message: "Participante no encontrado en CIDI" });
            }

            const nombre = dataCidi.Nombre || dataCidi.nombre || 'Desconocido';
            const apellido = dataCidi.Apellido || dataCidi.apellido || 'Desconocido';
            const correo = dataCidi.Email || dataCidi.email || null;
            const empleadoStr = dataCidi.Empleado || dataCidi.empleado || 'N';
            const es_empleado = empleadoStr.toLowerCase() === 's' ? 1 : 0;
            const reparticion = dataCidi.Reparticion || dataCidi.reparticion || 'Ciudadano';

            await CcAsistenciaParticipantes.create({
                cuil,
                nombre,
                apellido,
                correo,
                es_empleado,
                reparticion
            }, { transaction: trans });
        }

        // 2. Upsert inscripto status = 1 
        const inscriptoExiste = await CcAsistenciaInscriptos.findOne({ where: { cuil, evento_id } });
        if (inscriptoExiste) {
            inscriptoExiste.estado_asistencia = 1;
            await inscriptoExiste.save({ transaction: trans });
        } else {
            await CcAsistenciaInscriptos.create({
                cuil,
                evento_id,
                estado_asistencia: 1
            }, { transaction: trans });
        }
        await trans.commit();
        res.status(200).json({ message: "Asistencia confirmada" });
    } catch (error) {
        if (trans) await trans.rollback();
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
        res.status(500).json({ message: error.message });
    }
};
