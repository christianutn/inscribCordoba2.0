import AsistenciaRepository from "../repositories/AsistenciaRepository.js"

import sequelize from "../../../../config/database.js";
import InscripcionRepository from '../repositories/InscipcionRepository.js';
import ParticipanteRepository from '../repositories/ParticipanteRepository.js';
import DiaEventoRepository from '../repositories/DiaEventoRepository.js';
import CidiService from '../../../../services/CidiService.js';
import AppError from '../../../../utils/appError.js';

export default class AsistenciaService {

    constructor(asistenciaRepository, inscripcionRepository = null, participanteRepository = null, diaEventoRepository = null) {
        this.asistenciaRepository = asistenciaRepository;
        this.inscripcionRepository = inscripcionRepository || new InscripcionRepository();
        this.participanteRepository = participanteRepository || new ParticipanteRepository();
        this.diaEventoRepository = diaEventoRepository || new DiaEventoRepository();
        this.cidiService = new CidiService();
    }

    async crearVarios(asistenciaData, transacción = null) {
        return await this.asistenciaRepository.crearVarios(asistenciaData, transacción)
    }

    async obtenerCantidadAsistidos(idEvento) {
        return await this.asistenciaRepository.obtenerCantidadAsistidos(idEvento);
    }

    async buscarPorCuilEventoFecha(cuil, id_evento, fecha) {
        return await this.asistenciaRepository.buscarPorCuilEventoFecha(cuil, id_evento, fecha);
    }

    async obtenerHistorialAsistencia(id_evento, cuil) {
        try {
            // 1. Get all days for the event
            const dias = await this.diaEventoRepository.buscarPorEvento(id_evento);

            const resultado = {};

            // 2. For each day, check attendance for the given cuil
            for (const dia of dias) {
                const asistencia = await this.asistenciaRepository.buscarPorCuilEventoFecha(cuil, id_evento, dia.fecha);

                // estado_asistencia expected to be 1 or 0; default to 0 if not found
                const estado = asistencia ? asistencia.estado_asistencia : 0;

                // dia.fecha is DATEONLY (string 'YYYY-MM-DD')
                const fechaStr = typeof dia.fecha === 'string' ? dia.fecha : new Date(dia.fecha).toISOString().split('T')[0];
                resultado[fechaStr] = estado;
            }

            return resultado;
            return resultado;
        } catch (error) {
            throw new AppError("Error al obtener historial de asistencia: " + error.message, 500);
        }
    }

    async registrarAsistencia(cuil, id_evento) {
        // 1. La fecha se debe calcular desde el backend (fecha actual)
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const fechaActual = `${yyyy}-${mm}-${dd}`;

        const transaction = await sequelize.transaction();

        try {
            // 2. Verificar inscripcion
            const inscripcion = await this.inscripcionRepository.buscarPorCuilYEvento(cuil, id_evento, { transaction });

            if (inscripcion) {
                // 2.1 Si el usuario existe: actualizar estado_asistencia a 1
                const asistencia = await this.asistenciaRepository.buscarPorCuilEventoFecha(cuil, id_evento, fechaActual);

                if (asistencia) {
                    await this.asistenciaRepository.actualizar({ ...asistencia.toJSON(), estado_asistencia: 1 }, transaction);
                } else {
                    const diaEvento = await this.diaEventoRepository.buscarPorEventoYFecha(id_evento, fechaActual, transaction);

                    if (diaEvento) {
                        await this.asistenciaRepository.crear({
                            cuil: cuil,
                            id_evento: id_evento,
                            fecha: fechaActual,
                            estado_asistencia: 1
                        }, transaction);
                    } else {
                        throw new AppError(`La fecha actual ${fechaActual} no corresponde a un día válido para este evento.`, 400);
                    }
                }

                await transaction.commit();
                return { message: 'Asistencia registrada correctamente.', cuil, fecha: fechaActual, status: 'existing_updated' };

            } else {
                // 2.2 Si el usuario no existe: Crear nuevo participante, inscripción y asistencias.
                const personaCidi = await this.cidiService.getPersonaEnCidiPor(cuil);
                const respuesta = personaCidi.respuesta || personaCidi.Respuesta;
                if (!respuesta || (respuesta.resultado !== 'OK' && respuesta.Resultado !== 'OK')) {
                    throw new AppError('Persona no encontrada en CIDI.', 404);
                }

                const nombre = personaCidi.Nombre || "";
                const apellido = personaCidi.Apellido || "";
                const esEmpleadoStr = (personaCidi.Empleado || "N").toUpperCase();
                const esEmpleado = esEmpleadoStr === "S" ? 1 : 0;
                const reparticion = "Ciudadano";

                // Crear o buscar participante
                await this.participanteRepository.actualizarOCrear({
                    cuil: cuil,
                    nombres: nombre,
                    apellido: apellido,
                    es_empleado: esEmpleado,
                    reparticion: reparticion,
                    correo_electronico: personaCidi.Email
                }, transaction);

                // Verificar dias del evento
                const diasEvento = await this.diaEventoRepository.buscarPorEvento(id_evento, transaction);

                if (!diasEvento || diasEvento.length === 0) {
                    throw new Error('El evento no tiene días definidos para registrar asistencia.');
                }

                if (!diasEvento.some(dia => dia.fecha === fechaActual)) {
                    throw new AppError('La fecha actual no corresponde a un día válido para este evento.', 400);
                }

                // Crear inscripcion
                await this.inscripcionRepository.crear({
                    id_evento: id_evento,
                    cuil: cuil
                }, transaction);

                // Crear asistencias (default 0, hoy 1)
                for (const dia of diasEvento) {
                    const esHoy = dia.fecha === fechaActual;
                    await this.asistenciaRepository.crear({
                        id_evento,
                        cuil,
                        fecha: dia.fecha,
                        estado_asistencia: esHoy ? 1 : 0
                    }, transaction);
                }

                await transaction.commit();
                return { message: 'Inscripción y asistencia registradas correctamente.', cuil, fecha: fechaActual, status: 'new_created' };
            }

        } catch (error) {
            await transaction.rollback();
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError("Error al registrar asistencia: " + error.message, 500);
        }
    }
}