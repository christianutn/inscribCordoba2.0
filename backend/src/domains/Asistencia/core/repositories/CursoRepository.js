// core/repositories/CursoRepository.js
import Curso from '../../api/models/curso.model.js';
import sequelize from '../../../../config/database.js';

export default class CursoRepository {
    async crear(CursoData, transaction = null) {
        return await Curso.create({ nombre: CursoData.nombreCurso }, { transaction });
    }

    async actualizar(CursoData, transaction = null) {
        return await Curso.update(CursoData, { transaction });
    }

    async existe(nombreCurso) {
        return await Curso.findOne({ where: { nombre: nombreCurso } });
    }

    async obtenerTodos() {
        return await Curso.findAll();
    }

    // crear o actualizar curso
    async findOrCreate(nombre_curso, transaction = null) {
        const [curso, created] = await Curso.findOrCreate({
            where: { nombre: nombre_curso },
            defaults: { nombre: nombre_curso },
            transaction
        });
        return curso;
    }
}
