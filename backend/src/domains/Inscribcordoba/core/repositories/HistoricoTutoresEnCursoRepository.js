import HistoricoTutoresEnCursoModel from "../../api/models/historico_tutores_en_curso.models.js";
import CursoModel from "../../api/models/curso.models.js";
import RolTutorModel from "../../api/models/roles_tutor.models.js";
import PersonaModel from "../../api/models/persona.models.js";
import { Op } from "sequelize";
import { DateTime } from "luxon";



export default class HistoricoTutoresEnCursoRepository {

    constructor() {
        this.historicoTutoresEnCursoModel = HistoricoTutoresEnCursoModel;
    }

    async crear(data, transaction) {
        try {
            // 1. Definimos una fecha de corte única para asegurar continuidad exacta (0 milisegundos de brecha)
            const fechaCorte = DateTime.now().setZone('America/Argentina/Buenos_Aires');

            // 2. Buscamos si hay asignación vigente.
            // IMPORTANTE: Pasamos 'transaction' y usamos 'lock' para evitar condiciones de carrera si dos usuarios editan al mismo tiempo.
            const asignacionVigente = await this.historicoTutoresEnCursoModel.findOne({
                where: {
                    tutor_cuil: data.tutor_cuil,
                    curso_cod: data.curso_cod,
                    fecha_hasta: null
                },
                transaction // <--- CRÍTICO: Debe estar dentro de la transacción
            });

            // 3. Si existe, la cerramos
            if (asignacionVigente) {
                await this.historicoTutoresEnCursoModel.update(
                    {
                        fecha_hasta: fechaCorte.toJSDate(),
                        usuario_cuil: data.usuario_cuil
                    },
                    {
                        where: { id: asignacionVigente.id },
                        transaction // <--- CRÍTICO: Si 'create' falla abajo, esto hace rollback
                    }
                );
            }

            // 4. Preparamos los datos del nuevo registro
            // Aseguramos que la fecha_desde del nuevo coincida con el cierre del anterior (o sea ahora) si no viene en data
            const nuevosDatos = {
                ...data,
                fecha_desde: data.fecha_desde || fechaCorte.toJSDate(),
                fecha_hasta: null // Aseguramos que nace vigente
            };

            // 5. Creamos el nuevo registro
            const nuevaAsignacion = await this.historicoTutoresEnCursoModel.create(nuevosDatos, { transaction });

            return nuevaAsignacion;
        } catch (error) {
            throw error
        }
    }

    async actualizar(data, transaction) {
        return await this.historicoTutoresEnCursoModel.update(data, { where: { id: data.id }, transaction });
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