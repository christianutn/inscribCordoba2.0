
import EventoRepository from "../repositories/EventoRepository.js";


import sequelize from "../../../../config/database.js";
import ExcelParserService from '../../services/ExcelParserService.js';
import CursoService from './CursoService.js';
import CursoRepository from '../repositories/CursoRepository.js';
import ParticipanteService from './ParticipanteService.js';
import ParticipanteRepository from '../repositories/ParticipanteRepository.js';
import DiaEventoRepository from '../repositories/DiaEventoRepository.js';
import InscripcionService from './InscripcionService.js';
import InscripcionRepository from '../repositories/InscipcionRepository.js';
import AsistenciaService from './AsistenciaService.js';
import AsistenciaRepository from '../repositories/AsistenciaRepository.js';
import AppError from '../../../../utils/appError.js';

export default class EventoService {

    constructor(eventoRepository, inscripcionService = null, asistenciaService = null) {
        this.eventoRepository = eventoRepository;
        this.inscripcionService = inscripcionService || new InscripcionService(new InscripcionRepository());
        this.asistenciaService = asistenciaService || new AsistenciaService(new AsistenciaRepository());
    }



    async obtenerTodos() {
        return await this.eventoRepository.obtenerTodos();
    }

    async obtenerTodosConEstadisticas() {
        try {
            const eventosORM = await this.obtenerTodos();
            const eventosConDatos = [];

            for (const evento of eventosORM) {
                const eventoPlano = evento.toJSON ? evento.toJSON() : { ...evento };
                eventoPlano.cantidad_inscriptos = await this.inscripcionService.obtenerCantidadInscriptos(evento.id);
                eventoPlano.cantidad_asistidos = await this.asistenciaService.obtenerCantidadAsistidos(evento.id);
                eventosConDatos.push(eventoPlano);
            }

            return eventosConDatos;

        } catch (error) {
            throw new AppError("Error al obtener eventos con estadísticas: " + error.message, 500);
        }
    }

    async crearEventoMasivo(fileBuffer) {
        const transaction = await sequelize.transaction();
        const excelParserService = new ExcelParserService();

        try {

            // this.eventoRepository ya está disponible

            const participanteRepository = new ParticipanteRepository();
            const participanteService = new ParticipanteService(participanteRepository);
            const inscripcionRepository = new InscripcionRepository();
            const inscripcionService = new InscripcionService(inscripcionRepository);
            const asistenciaRepository = new AsistenciaRepository();
            const asistenciaService = new AsistenciaService(asistenciaRepository);


            // 1. Parsear el archivo Excel
            const data = excelParserService.parse(fileBuffer);
            // 4. Crear Evento
            const eventoData = {
                id: data.nroEvento, // Forzar ID
                nombre_curso: data.nombreCurso,
                fecha_desde: data.fechaDesde,
                fecha_hasta: data.fechaHasta,
                comentario_horario: data.horario,
                nombre_apellido_docente: data.nombreDocente,
                dias_evento: data.diasEvento
            };

            await this.crearEvento(eventoData, transaction);

            // 5. Gestionar Participantes
            const cuilsParticipantes = data.participantes.map(p => p.cuil);
            const participantesExistentes = await participanteService.buscarParticipantesPorCuils(cuilsParticipantes);
            const cuilsExistentes = new Set(participantesExistentes.map(p => p.cuil));

            const participantesParaCrear = data.participantes.filter(p => !cuilsExistentes.has(p.cuil));

            if (participantesParaCrear.length > 0) {
                await participanteService.crearVarios(participantesParaCrear, transaction);
            }

            // 6. Crear Inscripciones
            const inscripcionesParaCrear = data.participantes.map(participante => ({
                cuil: participante.cuil,
                id_evento: data.nroEvento,
            }));

            if (inscripcionesParaCrear.length > 0) {
                await inscripcionService.crearVarios(inscripcionesParaCrear, transaction);
            }

            // 7. Cargar Asistencias
            const asistenciasParaCrear = [];
            data.diasEvento.forEach(dia => {
                data.participantes.forEach(participante => {
                    asistenciasParaCrear.push({
                        cuil: participante.cuil,
                        id_evento: data.nroEvento,
                        fecha: dia,
                        estado_asistencia: 0
                    });
                });
            });


            if (asistenciasParaCrear.length > 0) {
                await asistenciaService.crearVarios(asistenciasParaCrear, transaction);
            }

            await transaction.commit();

            return {
                success: true,
                message: 'Archivo procesado exitosamente con carga masiva.',
                data: data
            };
        } catch (error) {
            await transaction.rollback();
            throw new AppError(error.message, 500);
        }
    }

    async crearEvento(eventoData, transaction = null) {
        let transactionLocal = transaction ? true : false;

        if (!transactionLocal) {
            transaction = await sequelize.transaction();
        }

        try {

            // Analizamos si el evento ya existe 
            const eventoExistente = await this.eventoRepository.existe(eventoData);
            if (eventoExistente) {
                throw new AppError(`El evento ${eventoData.id} ya existe.`, 409);
            }

            const cursoRepository = new CursoRepository();
            const cursoService = new CursoService(cursoRepository);
            const diaEventoRepository = new DiaEventoRepository();

            // crear o actualizar curso
            const curso = await cursoService.buscarOCrear(eventoData.nombre_curso, transaction);

            const datosNuevoEvento = {
                id: eventoData.id,
                id_curso: curso.id,
                fecha_desde: eventoData.fecha_desde,
                fecha_hasta: eventoData.fecha_hasta,
                comentario_horario: eventoData.comentario_horario,
                nombre_apellido_docente: eventoData.nombre_apellido_docente,
            };

            const evento = await this.eventoRepository.crear(datosNuevoEvento, transaction);

            // 3. Crear Días de Evento
            const diasEventoParaCrear = eventoData.dias_evento.map(fecha => ({
                fecha: fecha,
                id_evento: evento.id
            }));

            if (diasEventoParaCrear.length > 0) {
                await diaEventoRepository.crearVarios(diasEventoParaCrear, transaction);
            }

            if (!transactionLocal) {
                await transaction.commit();
            }
            return evento;
        } catch (error) {
            if (!transactionLocal) {
                await transaction.rollback();
            }
            throw new AppError('Ocurrió un error al crear el evento: ' + error.message, 500);
        }
    }

    async obtenerDetalleEventoConAsistencia(id_evento) {
        const detalle = await this.eventoRepository.obtenerDetalleCompleto(id_evento);
        if (!detalle) {
            throw new AppError('Evento no encontrado', 404);
        }
        return detalle;
    }


}