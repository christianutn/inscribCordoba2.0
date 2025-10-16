
import EventoRepository from "../repositories/EventoRepository.js";


export default class EventoService {

    constructor(eventoRepository) {
        this.eventoRepository = eventoRepository;
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