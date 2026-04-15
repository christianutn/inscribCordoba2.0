import EstadoAUT from './estados/EstadoAUT.js';
import EstadoMAQ from './estados/EstadoMAQ.js';
import EstadoCON from './estados/EstadoCON.js';
import EstadoPVICT from './estados/EstadoPVICT.js';
import EstadoEC from './estados/EstadoEC.js';
import EstadoNVIG from './estados/EstadoNVIG.js';

/**
 * Registro de todos los estados del curso.
 * Actúa como fábrica: dado un código devuelve la instancia de estado.
 */
const ESTADOS_REGISTRO = {
    AUT: new EstadoAUT(),
    MAQ: new EstadoMAQ(),
    CON: new EstadoCON(),
    PVICT: new EstadoPVICT(),
    EC: new EstadoEC(),
    NVIG: new EstadoNVIG(),
};

/**
 * Contexto del patrón State para el Curso.
 *
 * Es el único punto de entrada para operar transiciones de estado.
 * Mantiene el estado actual del curso y delega las operaciones al
 * objeto de estado concreto.
 *
 * @example
 *   const ctx = new CursoStateContext('MAQ');
 *   ctx.avanzar();           // MAQ → CON
 *   ctx.darDeBaja('ADM');    // CON → NVIG
 *   ctx.getEstadoActual();   // 'NVIG'
 */
class CursoStateContext {
    /**
     * Devuelve el código del estado inicial para un curso nuevo.
     * @returns {string}
     */
    static getEstadoInicial() {
        return 'AUT';
    }

    /**
     * @param {string} estadoActual - Código del estado actual del curso en BD
     */
    constructor(estadoActual) {
        const estado = ESTADOS_REGISTRO[estadoActual];
        if (!estado) {
            throw new Error(`Estado desconocido: '${estadoActual}'. Estados válidos: ${Object.keys(ESTADOS_REGISTRO).join(', ')}`);
        }
        this._estado = estado;
    }

    /**
     * Cambia el estado interno del contexto.
     * Llamado internamente por los estados concretos.
     * @param {string} codigoNuevoEstado
     */
    setEstado(codigoNuevoEstado) {
        const nuevoEstado = ESTADOS_REGISTRO[codigoNuevoEstado];
        if (!nuevoEstado) {
            throw new Error(`Transición inválida: estado destino '${codigoNuevoEstado}' no existe.`);
        }
        this._estado = nuevoEstado;
    }

    /**
     * Avanza al siguiente estado en la secuencia.
     * Permitido para TODOS los roles (condicionar en el controlador si se necesita).
     * @throws {Error} Si el estado actual es el final
     */
    avanzar() {
        this._estado.avanzar(this);
    }

    /**
     * Retrocede al estado anterior en la secuencia.
     * Solo debe ser invocado cuando el rol lo permite (ADM).
     * @throws {Error} Si el estado actual es el inicial
     */
    retroceder() {
        this._estado.retroceder(this);
    }

    /**
     * Da de baja el curso (→ NVIG). Solo rol ADM.
     * @param {string} rol
     */
    darDeBaja(rol) {
        this._estado.darDeBaja(this, rol);
    }

    /**
     * Marca el curso como pendiente de carga en Victorius (→ PVICT).
     * Solo válido desde el estado CON.
     * @throws {Error} Si el estado actual no permite la acción
     */
    marcarPendienteCargaEnVictorius() {
        this._estado.marcarPendienteCargaEnVictorius(this);
    }

    marcarEventoCreadoEnVictorius() {
        this._estado.marcarEventoCreadoEnVictorius(this);
    }

    /**
     * Restaura un curso de NVIG hacia un estado válido enviando la validación al estado.
     * @param {string} rol 
     * @param {string} estadoDestino 
     */
    restaurar(rol, estadoDestino) {
        this._estado.restaurar(this, rol, estadoDestino);
    }

    /**
     * Retorna el código del estado actual.
     * @returns {string}
     */
    getEstadoActual() {
        return this._estado.getCodigo();
    }
}

export default CursoStateContext;
