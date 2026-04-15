import EstadoCursoBase from '../EstadoCursoBase.js';

/** Estado: En Curso. Estado final de la secuencia principal. */
class EstadoEC extends EstadoCursoBase {
    constructor() {
        super('EC', null, 'PVICT');
    }
}

export default EstadoEC;
