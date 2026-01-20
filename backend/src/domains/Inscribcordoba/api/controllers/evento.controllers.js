import Evento from '../models/evento.models.js';
import Perfil from '../models/perfil.models.js';
import AreaTematica from '../models/areaTematica.models.js';
import TipoCertificacion from '../models/tipoCertificacion.models.js';
import AppError from "../../../../utils/appError.js"
import Curso from '../models/curso.models.js';
import enviarCorreo from '../../../../utils/enviarCorreo.js';
import sequelize from '../../../../config/database.js';
import Persona from '../models/persona.models.js';
import Usuario from '../models/usuario.models.js';
import { DateTime } from "luxon"
import logger from '../../../../utils/logger.js';


export const getEventos = async (req, res, next) => {
    try {
        logger.info('🎉 Iniciando consulta de eventos');
        const eventos = await Evento.findAll({
            order: [
                ['curso', 'ASC']
            ],
            include: [
                {
                    model: Perfil,
                    as: 'detalle_perfil'
                },
                {
                    model: AreaTematica,
                    as: 'detalle_areaTematica'
                },
                {
                    model: TipoCertificacion,
                    as: 'detalle_tipoCertificacion'
                },
                {
                    model: Curso,
                    as: 'detalle_curso'
                },
                {
                    model: Usuario,
                    as: 'detalle_usuario',
                    // 💡 CORRECCIÓN PRINCIPAL: Excluir el campo 'contrasenia' en el modelo Usuario
                    attributes: { exclude: ['contrasenia'] },
                    include: [
                        {
                            model: Persona,
                            as: 'detalle_persona'
                        }
                    ]
                }
            ]
        });

        logger.info(`✅ Eventos obtenidos exitosamente - Total: ${eventos.length} registros`);
        res.status(200).json(eventos); // Se envía directamente la variable 'eventos'
    } catch (error) {
        next(error);
    }
}

export const getEventoByCod = async (req, res, next) => {
    try {
        const { cod } = req.params;

        logger.info(`🔍 Buscando evento por código - Cod: ${cod}`);

        const evento = await Evento.findOne({ where: { curso: cod } });

        if (!evento) {
            logger.warn(`⚠️ Evento no encontrado - Cod: ${cod}`);
        } else {
            logger.info(`✅ Evento encontrado - Cod: ${cod}`);
        }

        res.status(200).json(evento);
    } catch (error) {
        next(error);
    }
}


export const postEvento = async (req, res, next) => {

    // Datos del usuario
    try {
        logger.info('🎆 Iniciando creación de evento');

        const { curso, perfil, area_tematica, tipo_certificacion, presentacion, objetivos, requisitos_aprobacion, ejes_tematicos, certifica_en_cc, disenio_a_cargo_cc } = req.body;
        const usuarioCuil = req.user.user.cuil;

        logger.info(`📚 Curso: ${curso} - Usuario: ${usuarioCuil}`);

        // obtener curso
        const cursoEvento = await Curso.findOne({ where: { cod: curso } });
        if (!cursoEvento) {
            logger.warn(`⚠️ Intento de crear evento con curso inexistente - Curso: ${curso}`);
            throw new AppError("Curso no existe", 400);;
        }

        // si cursiEvento.tiene_evento_Creado es 1, entonces no se puede crear el evento
        if (cursoEvento.tiene_evento_creado === 1) {
            logger.warn(`⚠️ Intento de crear evento duplicado - Curso: ${curso} ya tiene evento creado`);
            throw new AppError("El curso ya tiene un evento creado", 400);;
        }


        const existeEvento = await Evento.findOne({ where: { curso } });
        if (existeEvento) {
            logger.warn(`⚠️ Evento ya existe en la base de datos - Curso: ${curso}`);
            throw new AppError("Ya eviste el evento", 400);;
        }


        const fecha_desde = DateTime.now().setZone('America/Argentina/Buenos_Aires').toFormat("yyyy-MM-dd HH:mm:ss")

        const usuario = req.user.user.cuil;

        const evento = await Evento.create({
            curso,
            perfil,
            area_tematica,
            tipo_certificacion,
            presentacion,
            objetivos,
            requisitos_aprobacion,
            ejes_tematicos,
            certifica_en_cc,
            disenio_a_cargo_cc,
            fecha_desde,
            usuario
        });

        //  Modificar el atributo tiene_evento_Creado de cursoEvento a 1
        cursoEvento.tiene_evento_creado = 1;
        await cursoEvento.save();

        logger.info(`✅ Evento creado exitosamente - Curso: ${curso} - Nombre: ${cursoEvento.nombre}`);


        const htmlBodyCorreo = `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <title>Nuevo Formulario - Creación de Evento</title>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #f4f6f8;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 30px auto;
        background-color: #ffffff;
        padding: 30px;
        border-radius: 10px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
      }
      h2 {
        color: #2c3e50;
      }
      p {
        font-size: 16px;
        color: #333333;
      }
      .highlight {
        font-weight: bold;
        color: #2980b9;
        font-size: 18px;
      }
      .footer {
        margin-top: 30px;
        font-size: 12px;
        color: #888888;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>📩 Nuevo formulario recibido</h2>
      <p>Se ha completado un nuevo formulario para la creación de un evento.</p>
      <p><span class="highlight">Nombre del curso:</span> ${cursoEvento.nombre} </p>
      <p>Por favor, revise los datos para continuar con el proceso correspondiente.</p>
      <div class="footer">
        Este es un mensaje automático. No responda este correo.
      </div>
    </div>
  </body>
</html>`
        enviarCorreo(htmlBodyCorreo, "Nuevo Formulario - Creación de Evento", "rnicolascarballo@gmail.com");

        logger.info(`📧 Correo de notificación enviado - Curso: ${cursoEvento.nombre}`);

        res.status(201).json(evento);
    } catch (error) {
        logger.error(`❌ Error al crear evento - Curso: ${req.body.curso} - Usuario: ${req.user?.user?.cuil || 'N/A'} - Error: ${error.message}`, {
            stack: error.stack,
            curso: req.body.curso,
            usuario: req.user?.user?.cuil
        });
        next(error);
    }
};



export const deleteEvento = async (req, res, next) => {
    let transaction; // Declara la variable para la transacción aquí

    try {
        const { curso } = req.params;

        logger.info(`🗑️ Iniciando eliminación de evento - Curso: ${curso}`);

        // Inicia la transacción
        transaction = await sequelize.transaction();

        // 1. Buscar la instancia del evento, dentro de la transacción
        const evento = await Evento.findOne({
            where: {
                curso: curso,
            }
        }, { transaction }); // ¡Importante pasar la transacción aquí!

        if (!evento) {
            logger.warn(`⚠️ Intento de eliminar evento inexistente - Curso: ${curso}`);
            // Si el evento no existe, revierte la transacción antes de lanzar el error
            await transaction.rollback();
            throw new AppError("Evento no existe", 400);
        }

        // 2. Actualizar el campo 'tiene_evento_creado' en el modelo Curso, dentro de la transacción
        await Curso.update(
            {
                tiene_evento_creado: 0 // Solo pasamos el campo que queremos actualizar
            },
            {
                where: {
                    cod: curso, // Asumo que 'curso' de los params es el 'cod' del Curso
                },
                transaction: transaction // ¡Importante pasar la transacción aquí como parte del segundo objeto!
            }
        );

        // 3. Eliminar la instancia del evento, dentro de la transacción
        await evento.destroy({ transaction }); // ¡Importante pasar la transacción aquí!

        // 4. Si todo fue exitoso, commitea la transacción
        await transaction.commit();

        logger.info(`✅ Evento eliminado exitosamente - Curso: ${curso}`);

        res.status(200).json({ message: "Evento eliminado y curso actualizado." }); // Mensaje más descriptivo

    } catch (error) {
        // Si hubo algún error, revierte la transacción si existe
        if (transaction) {
            await transaction.rollback();
        }

        logger.error(`❌ Error al eliminar evento - Curso: ${req.params.curso} - Error: ${error.message}`, {
            stack: error.stack,
            curso: req.params.curso
        });

        next(error); // Pasa el error al siguiente middleware de manejo de errores
    }
};


export const putEvento = async (req, res, next) => {
    try {
        const { curso } = req.params;
        const { perfil, area_tematica, tipo_certificacion, presentacion, objetivos, requisitos_aprobacion, ejes_tematicos, certifica_en_cc, disenio_a_cargo_cc } = req.body;

        logger.info(`✏️ Iniciando actualización de evento - Curso: ${curso}`);

        const evento = await Evento.findOne({ where: { curso } });

        if (!evento) {
            logger.warn(`⚠️ Intento de actualizar evento inexistente - Curso: ${curso}`);
            throw new AppError("Evento no existe", 404);
        }

        await evento.update({ perfil, area_tematica, tipo_certificacion, presentacion, objetivos, requisitos_aprobacion, ejes_tematicos, certifica_en_cc, disenio_a_cargo_cc });

        logger.info(`✅ Evento actualizado exitosamente - Curso: ${curso}`);

        res.status(200).json(evento);
    } catch (error) {
        logger.error(`❌ Error al actualizar evento - Curso: ${req.params.curso} - Error: ${error.message}`, {
            stack: error.stack,
            curso: req.params.curso
        });
        next(error);
    }
}