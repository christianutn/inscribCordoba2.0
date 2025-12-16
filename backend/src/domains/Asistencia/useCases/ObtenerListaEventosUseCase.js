import AppError from "../../../utils/appError.js";

export default class ObtenerListaEventosUseCase {
    constructor(eventoService, asistenciaService, inscripcionService) {
        this.eventoService = eventoService;
        this.asistenciaService = asistenciaService;
        this.inscripcionService = inscripcionService;
    }


    async ejecutar() {
        try {
            // Obtenemos las instancias del ORM
            const eventosORM = await this.eventoService.obtenerTodos();

            // Creamos un nuevo array para guardar los datos planos
            const eventosConDatos = [];

            for (const evento of eventosORM) {
                // 1. Convertimos a objeto plano. 
                // Si usas Sequelize suele ser .get({ plain: true }) o .toJSON()
                // Si usas Mongoose es .toObject() o .toJSON()
                const eventoPlano = evento.toJSON ? evento.toJSON() : { ...evento };

                // 2. Ahora sí podemos inyectar propiedades arbitrarias
                eventoPlano.cantidad_inscriptos = await this.inscripcionService.obtenerCantidadInscriptos(evento.id);
                eventoPlano.cantidad_asistidos = await this.asistenciaService.obtenerCantidadAsistidos(evento.id);

                eventosConDatos.push(eventoPlano);
            }

            return eventosConDatos;

        } catch (error) {
            throw new AppError("Error al obtener la lista de eventos", 500);
        }
    }
}