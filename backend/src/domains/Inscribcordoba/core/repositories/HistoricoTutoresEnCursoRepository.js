import HistoricoTutoresEnCursoModel from "../../api/models/historico_tutores_en_curso.models.js";
import CursoModel from "../../api/models/curso.models.js";
import RolTutorModel from "../../api/models/roles_tutor.models.js";
import PersonaModel from "../../api/models/persona.models.js";
import { Op } from "sequelize";



export default class HistoricoTutoresEnCursoRepository {

    constructor() {
        this.historicoTutoresEnCursoModel = HistoricoTutoresEnCursoModel;
    }

    async crear(data, transaction) {
        return await this.historicoTutoresEnCursoModel.create(data, { transaction });
    }

    async getHistoricoTutoresPorCurso(curso_cod) {
        return await this.historicoTutoresEnCursoModel.findAll({ where: { curso_cod } });
    }

    async getHistoricoTutoresVigentesPorCurso(curso_cod) {
        return await this.historicoTutoresEnCursoModel.findAll({
            attributes: [
                'id', 'curso_cod', 'rol_tutor_cod',
                'fecha_desde', 'fecha_hasta',
                'tutor_cuil'
            ],
            where: {
                curso_cod: curso_cod,
                // AQUÍ ESTÁ EL TRUCO: Filtramos para que la fecha sea igual a la máxima fecha de ese tutor
                fecha_desde: {
                    [Op.eq]: this.historicoTutoresEnCursoModel.sequelize.literal(`(
                    SELECT MAX(h2.fecha_desde)
                    FROM historico_tutores_en_curso AS h2
                    WHERE h2.tutor_cuil = historico_tutores_en_curso.tutor_cuil
                    AND h2.curso_cod = '${curso_cod}'
                )`)
                }
            },
            include: [
                {
                    model: RolTutorModel,
                    as: 'detalle_rol_tutor'
                },
                {
                    model: CursoModel,
                    as: 'detalle_curso'
                },
                {
                    model: PersonaModel,
                    as: 'detalle_persona'
                }
            ],
            // Opcional: raw: false es el default, te devuelve instancias de Sequelize
        });
    }


}