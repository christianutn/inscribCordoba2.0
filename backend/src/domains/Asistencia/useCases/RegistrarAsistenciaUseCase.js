import CidiService from "../../../services/CidiService.js";

import sequelize from "../../../config/database.js";
import Asistencia from "../api/models/asistencia.model.js";
import Inscripcion from "../api/models/inscripcion.model.js";
import Participante from "../api/models/participante.model.js";
import DiasEvento from "../api/models/diaEvento.model.js";

export default class RegistrarAsistenciaUseCase {

    constructor() {
        this.cidiService = new CidiService();
    }

    async ejecutar(cuil, id_evento) {
        // 1. La fecha se debe calcular desde el backend (fecha actual)
        // Usamos formato YYYY-MM-DD para coincidir con DATEONLY de la BD
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const fechaActual = `${yyyy}-${mm}-${dd}`;

        const transaction = await sequelize.transaction();

        try {
            // 2. Verificar en asistencia_inscripciones si el usuario existe
            const inscripcion = await Inscripcion.findOne({
                where: {
                    cuil: cuil,
                    id_evento: id_evento
                },
                transaction
            });

            if (inscripcion) {
                // 2.1 Si el usuario existe: actualizar estado_asistencia a 1
                const asistencia = await Asistencia.findOne({
                    where: {
                        cuil: cuil,
                        id_evento: id_evento,
                        fecha: fechaActual
                    },
                    transaction
                });

                if (asistencia) {
                    await asistencia.update({ estado_asistencia: 1 }, { transaction });
                } else {
                    // Si por alguna razón está inscripto pero no tiene la fila de asistencia para hoy
                    // (aunque el flujo de creación debería haberla creado), la creamos.
                    // O podría ser que el evento no tiene esta fecha? Buscamos si la fecha es válida para el evento.
                    const diaEvento = await DiasEvento.findOne({
                        where: { id_evento: id_evento, fecha: fechaActual },
                        transaction
                    });

                    if (diaEvento) {
                        await Asistencia.create({
                            cuil: cuil,
                            id_evento: id_evento,
                            fecha: fechaActual,
                            estado_asistencia: 1
                        }, { transaction });
                    } else {
                        throw new Error(`La fecha actual ${fechaActual} no corresponde a un día válido para este evento.`);
                    }
                }

                await transaction.commit();
                return { message: 'Asistencia registrada correctamente.', cuil, fecha: fechaActual, status: 'existing_updated' };

            } else {
                // 2.2 Si el usuario no existe: Crear nuevo participante, inscripción y asistencias.

                // - Buscar datos en CIDI
                const personaCidi = await this.cidiService.getPersonaEnCidiPor(cuil);

                // Normalizar respuesta de CIDI (manejo de mayúsculas/minúsculas en claves)
                const respuesta = personaCidi.respuesta || personaCidi.Respuesta;
                if (!respuesta || (respuesta.resultado !== 'OK' && respuesta.Resultado !== 'OK')) {
                    throw new Error('Persona no encontrada en CIDI.');
                }

                // Extraer datos necesarios
                const nombre = personaCidi.Nombre || "";
                const apellido = personaCidi.Apellido || "";
                // CIDI devuelve "S" o "N" para Empleado.
                const esEmpleadoStr = (personaCidi.Empleado || "N").toUpperCase();
                const esEmpleado = esEmpleadoStr === "S" ? 1 : 0;
                const reparticion = "Ciudadano"; // Valor por defecto solicitado

                // - Crear fila en asistencias_participantes (si no existe ya)
                // Usamos findOrCreate por si el participante existe pero no estaba inscripto en ESTE evento
                const [participante, created] = await Participante.findOrCreate({
                    where: { cuil: cuil },
                    defaults: {
                        nombres: nombre,
                        apellido: apellido,
                        es_empleado: esEmpleado,
                        reparticion: reparticion,
                        correo_electronico: personaCidi.Email
                    },
                    transaction
                });

                // Si ya existía, podríamos querer actualizar sus datos con los de CIDI, 
                // pero el requerimiento dice "Crear nueva fila... con los datos necesarios". 
                // Asumimos que si existe, usamos el existente o actualizamos si es crítico. 
                // Por ahora findOrCreate es seguro.

                // - Buscar los dias que tiene el evento
                const diasEvento = await DiasEvento.findAll({
                    where: { id_evento: id_evento },
                    transaction
                });

                if (!diasEvento || diasEvento.length === 0) {
                    throw new Error('El evento no tiene días definidos para registrar asistencia.');
                }

                // Se debe verificar si la fecha actual no coincide con ninguno de los dias del evento debe devolver un error 

                if (!diasEvento.some(dia => dia.fecha === fechaActual)) {
                    throw new Error('La fecha actual no corresponde a un día válido para este evento.');
                }

                // - Crear fila en asistencias_inscripciones
                await Inscripcion.create({
                    id_evento: id_evento,
                    cuil: cuil
                }, { transaction });

                // - Por cada dia del evento crear asistencia
                // estado_asistencia: 0 (ausente) por defecto, 1 (presente) si es la fecha actual.

                for (const dia of diasEvento) {
                    const esHoy = dia.fecha === fechaActual;

                    const res = await Asistencia.create({
                        id_evento,
                        cuil,
                        fecha: dia.fecha,
                        estado_asistencia: esHoy ? 1 : 0
                    }, { transaction });

                    console.log(res);
                }

                await transaction.commit();
                return { message: 'Inscripción y asistencia registradas correctamente.', cuil, fecha: fechaActual, status: 'new_created' };
            }

        } catch (error) {
            await transaction.rollback();
            console.error("Error en RegistrarAsistenciaUseCase:", error);
            throw error;
        }
    }
}