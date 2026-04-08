import EstadoCursoBase from '../EstadoCursoBase.js';

/** Estado: Autorizado. Estado inicial al crear un curso. */
class EstadoAUT extends EstadoCursoBase {
    constructor() {
        super('AUT', 'MAQ', null);
    }
}

export default EstadoAUT;
