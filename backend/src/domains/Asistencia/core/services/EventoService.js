
import EventoRepository from "../repositories/EventoRepository.js";


export default class EventoService {

    constructor(eventoRepository) {
        this.eventoRepository = eventoRepository;
    }



    async obtenerTodos() {
        return await this.eventoRepository.obtenerTodos();
    }

    async crearEvento(eventoData, transaction) {
        try {

            if (!transaction) {
                throw new Error("No se proporcionó una transacción válida.")
            }

            const nuevoEvento = await this.eventoRepository.crear(eventoData, transaction);

            return nuevoEvento;

        } catch (error) {
            throw new Error("Error al crear el evento: " + error.message);
        }

    } // fin crearEvento
}