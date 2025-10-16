import CursoRepository from '../repositories/CursoRepository.js';

/**
 * Clase de servicio para manejar la lógica de negocio relacionada con Cursos.
 */
export default class CursoService {

    /**
     * El servicio recibe el repositorio como dependencia.
     * Esto hace el código más flexible y fácil de testear.
     * @param {CursoRepository} cursoRepository - Una instancia de CursoRepository.
     */
    constructor(cursoRepository) {
        this.cursoRepository = cursoRepository;
    }
    // ------------------------------------------------------------------
    // Métodos de Creación
    // ------------------------------------------------------------------

    /**
     * Crea un nuevo curso después de verificar que no exista uno con el mismo nombre.
     * @param {object} CursoData - Los datos del nuevo curso (ej: { nombreCurso: '...', descripcion: '...' }).
     * @returns {Promise<object>} El objeto del curso creado.
     * @throws {Error} Si el curso ya existe o si hay un error de validación.
     */
    async crearCurso(CursoData, transaction = null) {
        // 1. **Validación de Datos Básica** (puedes usar Joi o esquemas más complejos)
        if (!CursoData || !CursoData.nombreCurso) {
            throw new Error("El nombre del curso es obligatorio.");
        }
        
        const { nombreCurso } = CursoData;

        // 2. **Verificación de Lógica de Negocio** (usando el método existe del Repository)
        const cursoExistente = await this.cursoRepository.existe(nombreCurso);

        // Recordatorio: `existe()` retorna el objeto del curso o `null`.
        if (cursoExistente) {
            // Un error de lógica de negocio
            throw new Error(`Ya existe un curso registrado con el nombre: ${nombreCurso}`);
        }

        // 3. **Llamada al Repositorio** para la interacción con la DB
        try {
            const nuevoCurso = await this.cursoRepository.crear(CursoData, transaction);
            this.id = nuevoCurso.id;
            this.nombre = nuevoCurso.nombre;
            return nuevoCurso;
        } catch (error) {
            // Puedes loggear el error o relanzar uno más amigable
            console.error("Error al crear el curso en la DB:", error.message);
            throw new Error("Error interno al registrar el curso. Intente de nuevo.");
        }
    }

    /**
     * Actualiza los datos de un curso específico.
     * @param {string} nombreCursoAnterior - El nombre del curso a buscar (para la condición WHERE).
     * @param {object} nuevosDatos - Los datos a actualizar.
     * @returns {Promise<[number, Curso[]]>} El resultado de la actualización de Sequelize.
     * @throws {Error} Si no se encuentra el curso o si hay un error de validación.
     */
    
    /**
     * Obtiene un curso por su nombre.
     * @param {string} nombreCurso - El nombre del curso.
     * @returns {Promise<object|null>} El objeto del curso o null si no existe.
     */
    async obtenerCursoPorNombre(nombreCurso) {
        if (!nombreCurso) {
            throw new Error("El nombre del curso es requerido para la búsqueda.");
        }
        // Llamamos directamente a 'existe' ya que ya retorna el objeto o null.
        return await this.cursoRepository.existe(nombreCurso);
    }

}