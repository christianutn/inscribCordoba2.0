import Evento from '../models/evento.models.js';
import Perfil from '../models/perfil.models.js';
import AreaTematica from '../models/areaTematica.models.js';
import TipoCertificacion from '../models/tipoCertificacion.models.js';

import Curso from '../models/curso.models.js';
import enviarCorreo from '../utils/enviarCorreo.js';

export const getEventos = async (req, res, next) => {
    try {
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
                }
            ]
        });

        
        res.status(200).json(eventos);
    } catch (error) {
        next(error);
    }
}

export const getEventoByCod = async (req, res, next) => {
    try {
        const { cod } = req.params;
        const evento = await Evento.findOne({ where: { curso: cod } });
        res.status(200).json(evento);
    } catch (error) {
        next(error);
    }
}


export const postEvento = async (req, res, next) => {
    

    // Datos del usuario
    const { cuil } = req.user.user;
    try {
        const { curso, perfil, area_tematica, tipo_certificacion, presentacion, objetivos, requisitos_aprobacion, ejes_tematicos, certifica_en_cc, disenio_a_cargo_cc } = req.body;

        // validar datos del body
        if (!curso) {
            const error = new Error("El curso es obligatorio");
            error.statusCode = 400;
            throw error;
        }
        if (!perfil) {
            const error = new Error("El perfil es obligatorio");
            error.statusCode = 400;
            throw error;
        }
        if (!area_tematica) {
            const error = new Error("El area tematica es obligatorio");
            error.statusCode = 400;
            throw error;
        }
        if (!tipo_certificacion) {
            const error = new Error("El tipo de certificacion es obligatorio");
            error.statusCode = 400;
            throw error;
        }
        if (!presentacion) {
            const error = new Error("La presentacion es obligatoria");
            error.statusCode = 400;
            throw error;
        }
        if (!objetivos) {
            const error = new Error("Los objetivos son obligatorios");
            error.statusCode = 400;
            throw error;
        }
        if (!requisitos_aprobacion) {
            const error = new Error("Los requisitos de aprobacion son obligatorios");
            error.statusCode = 400;
            throw error;
        }
        if (!ejes_tematicos) {
            const error = new Error("Los ejes tematicos son obligatorios");
            error.statusCode = 400;
            throw error;
        }
        
        

        // obtener curso
        const cursoEvento = await Curso.findOne({ where: { cod: curso } });
        if (!cursoEvento) {
            const error = new Error("El curso no existe");
            error.statusCode = 400;
            throw error;
        }

        // si cursiEvento.tiene_evento_Creado es 1, entonces no se puede crear el evento
        if (cursoEvento.tiene_evento_creado === 1) {
            const error = new Error("El curso ya tiene un evento creado");
            error.statusCode = 400;
            throw error;
        }

        
        
        
        const existeEvento = await Evento.findOne({ where: { curso } });
        if (existeEvento) {
            const error = new Error("El evento ya existe");
            error.statusCode = 400;
            throw error;
        }
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
            disenio_a_cargo_cc
        });

        //  Modificar el atributo tiene_evento_Creado de cursoEvento a 1
        cursoEvento.tiene_evento_creado = 1;
        await cursoEvento.save({ transaction: t });

       

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
        enviarCorreo(htmlBodyCorreo, "Nuevo Formulario - Creación de Evento", "soportecampuscordoba@gmail.com");
        res.status(201).json(evento);
    } catch (error) {
        await t.rollback();
        next(error);
    }
};
