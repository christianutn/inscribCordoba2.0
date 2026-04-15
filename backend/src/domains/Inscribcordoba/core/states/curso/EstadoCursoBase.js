/**
 * Clase base abstracta para los estados del Curso.
 * Define la interfaz común que deben implementar todos los estados concretos.
 *
 * Máquina de estados:
 *   AUT → MAQ → CON → PVICT → EC
 *   Cualquier estado → NVIG  (solo rol ADM)
 *   NVIG no tiene siguiente ni anterior en la secuencia principal.
 */
class EstadoCursoBase {
    /**
     * @param {string} codigo - Código del estado (ej: 'AUT', 'MAQ', ...)
     * @param {string|null} siguiente - Código del siguiente estado en la secuencia
     * @param {string|null} anterior - Código del estado anterior en la secuencia
     */
    constructor(codigo, siguiente, anterior) {
        if (new.target === EstadoCursoBase) {
            throw new Error('EstadoCursoBase es una clase abstracta y no puede ser instanciada directamente.');
        }
        this.codigo = codigo;
        this.siguiente = siguiente;
        this.anterior = anterior;
    }

    /**
     * Avanza al siguiente estado en la secuencia.
     * @param {CursoStateContext} contexto
     * @throws {Error} Si no hay siguiente estado disponible
     */
    avanzar(contexto) {
        if (!this.siguiente) {
            throw new Error(`El estado '${this.codigo}' es el estado final. No se puede avanzar.`);
        }
        contexto.setEstado(this.siguiente);
    }

    /**
     * Retrocede al estado anterior en la secuencia.
     * @param {CursoStateContext} contexto
     * @throws {Error} Si no hay estado anterior disponible
     */
    retroceder(contexto) {
        if (!this.anterior) {
            throw new Error(`El estado '${this.codigo}' es el estado inicial. No se puede retroceder.`);
        }
        contexto.setEstado(this.anterior);
    }

    /**
     * Pasa al estado NVIG (No Vigente). Solo permitido para rol ADM.
     * @param {CursoStateContext} contexto
     * @param {string} rol - Rol del usuario que ejecuta la acción
     */
    darDeBaja(contexto, rol) {
        if (rol !== 'ADM') {
            throw new Error('Solo un usuario con rol ADM puede dar de baja un curso.');
        }
        contexto.setEstado('NVIG');
    }

    /**
     * Marca el curso como pendiente de carga en Victorius (pasa a PVICT).
     * Por defecto lanza error, indicando que el estado actual no permite esta acción.
     * Solo debe ser sobrescrito en los estados que sí la permitan (ej. CON).
     * @param {CursoStateContext} contexto
     */
    marcarPendienteCargaEnVictorius(contexto) {
        throw new Error(`El curso se encuentra en estado '${this.codigo}' y no puede ser marcado como pendiente de carga en Victorius. Debe estar en estado 'CON'.`);
    }

    /**
     * Marca el curso como evento creado en Victorius (pasa a EC).
     * Por defecto lanza error, indicando que el estado actual no permite esta acción.
     * Solo debe ser sobrescrito en los estados que sí la permitan (ej. PVICT).
     * @param {CursoStateContext} contexto
     */
    marcarEventoCreadoEnVictorius(contexto) {
        throw new Error(`El curso se encuentra en estado '${this.codigo}' y no puede ser marcado como evento creado en Victorius. Debe estar en estado 'PVICT'.`);
    }

    /**
     * Retorna el código del estado actual.
     * @returns {string}
     */
    getCodigo() {
        return this.codigo;
    }

    /**
     * Permite restaurar un curso desde NVIG a cualquier otro estado.
     * @param {CursoStateContext} contexto 
     * @param {string} rol 
     * @param {string} estadoDestino 
     */
    restaurar(contexto, rol, estadoDestino) {
        throw new Error(`El curso se encuentra en estado '${this.codigo}'. Solo se permite restaurar cursos que actualmente estén en el estado 'NVIG'.`);
    }
}

export default EstadoCursoBase;
