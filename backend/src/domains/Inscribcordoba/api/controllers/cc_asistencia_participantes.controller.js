import CcAsistenciaParticipantes from '../../../../models/cc_asistencia_participantes.models.js';

export const createOrUpdateParticipantesG = async (req, res) => {
    try {
        const { cuil, nombre, apellido, correo, es_empleado } = req.body;
        // Sequelize upsert does what we need mostly
        const [participante, created] = await CcAsistenciaParticipantes.upsert({
            cuil,
            nombre,
            apellido,
            correo: correo || null,
            es_empleado: es_empleado ? 1 : 0,
        });
        res.status(200).json(participante);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createOrUpdateParticipantesMasivos = async (req, res) => {
    try {
        const { participantes } = req.body;
        for (let p of participantes) {
            await CcAsistenciaParticipantes.upsert({
                cuil: p.cuil,
                nombre: p.nombre,
                apellido: p.apellido,
                correo: p.correo || null,
                es_empleado: p.es_empleado ? 1 : 0,
            });
        }
        res.status(200).json({ message: "Participantes procesados" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
