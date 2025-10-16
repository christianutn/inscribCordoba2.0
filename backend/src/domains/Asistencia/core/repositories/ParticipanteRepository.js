import Participante from '../../api/models/participante.model.js'


// Crear un repositori para participante

export default class ParticipanteRepository {
    
    async crear(participanteData, transaction = null) {
        try {
            const participante = await Participante.create(participanteData, { transaction });
            return participante;
        } catch (error) {
            throw error;
        }
    }

    async existe(cuil) {
        return await Participante.findOne({ where: { cuil: cuil } });
    }

}