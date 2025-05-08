import usuarioModel from "../models/usuario.models.js";
import Persona from "../models/persona.models.js";
import Rol from "../models/rol.models.js";
import Area from "../models/area.models.js";
import sequelize from "../config/database.js";
import validarCuil from "../utils/validarCuil.js"
import validarEmail from "../utils/validarMail.js";
import tratarNombres from "../utils/tratarNombres.js";
import Usuario from "../models/usuario.models.js";
import { createHash } from "../utils/bcrypt.js"
import generarToken from "../utils/jwt.js";
import enviarCorreo from "../utils/enviarCorreo.js";


export const getUsuario = async (req, res, next) => {
    try {
        const usuarios = await usuarioModel.findAll({
            include: [
                {
                    model: Persona, as: 'detalle_persona'
                },
                {
                    model: Rol, as: 'detalle_rol'
                },
                {
                    model: Area, as: 'detalle_area'
                }
            ]
        });

        if (usuarios.length === 0) {

            const error = new Error("No existen usuarios");
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json(usuarios)
    } catch (error) {
        next(error)
    }
}


export const postUsuario = async (req, res, next) => {
    try {

        let { cuil, contrasenia, rol, area } = req.body;
        const usuario = await Usuario.findOne({ where: { cuil: cuil } });

        //Validar que el cuil no exista
        const existePersona = await Persona.findOne({ where: { cuil: cuil } })
        if (!existePersona) {
            const error = new Error(`La persona con el cuil ${cuil} no existe.`);
            error.statusCode = 400;
            throw error;
        }

        if (usuario) {
            const error = new Error("El usuario ya existe");
            error.statusCode = 400;
            throw error;
        }

        //Asegurar que contrasenia sea uan cadena si no es una cadena convertirla a string
        contrasenia = String(contrasenia)
        const contraseniaHash = createHash(contrasenia)
        const nuevoUsuario = await Usuario.create({ cuil: cuil, contrasenia: contraseniaHash, rol: rol, area: area, necesitaCbioContrasenia: "1" });

        if (!nuevoUsuario) {
            const error = new Error("No se pudo crear el usuario");
            error.statusCode = 400;
            throw error;
        }

        res.status(201).json(nuevoUsuario)

    } catch (error) {

        next(error)
    }
}


export const putUsuario = async (req, res, next) => {
    const t = await sequelize.transaction(); // Iniciamos la transacción
    try {


        let { cuil, nombre, apellido, mail, celular, newCuil, area, rol, esExcepcionParaFechas } = req.body;

        // Normalizar valores de entrada
        if (celular === "Sin celular" || celular === "") {
            celular = null;
        }

        if (!cuil || cuil.length !== 11 || !nombre || !apellido || !mail) {
            const error = new Error("Datos inválidos: no cumplen con los requisitos");
            error.statusCode = 400;
            throw error;
        }

        if (!validarCuil(cuil)) {
            const error = new Error("El CUIL no es válido");
            error.statusCode = 400;
            throw error;
        }

        if (!validarEmail(mail)) {
            const error = new Error("El mail no es válido");
            error.statusCode = 400;
            throw error;
        }


        if (!esExcepcionParaFechas) {
            const error = new Error("El referente es requerido");
            error.statusCode = 400;
            throw error;
        } else if (esExcepcionParaFechas !== "Si" && esExcepcionParaFechas !== "No") {
            const error = new Error("El referente debe ser Si o No");
            error.statusCode = 400;
            throw error;
        }

        esExcepcionParaFechas = esExcepcionParaFechas.trim()
        esExcepcionParaFechas = esExcepcionParaFechas === "Si" ? 1 : esExcepcionParaFechas === "No" ? 0 : null;



        // Limpieza de datos
        cuil = cuil.trim();
        newCuil = newCuil ? newCuil.trim() : null;
        nombre = tratarNombres(nombre.trim());
        apellido = tratarNombres(apellido.trim());
        mail = mail.trim();

        celular = celular ? celular.trim() : null;

        // Actualización de Persona
        const updatePersona = await Persona.update(
            { nombre, apellido, mail, celular, cuil: newCuil || cuil },
            { where: { cuil: cuil }, transaction: t } // Aseguramos que se incluya la transacción
        );

        // Actualización de Tutor
        const updateUsuario = await Usuario.update(
            { cuil: newCuil || cuil, area: area, rol: rol, esExcepcionParaFechas: esExcepcionParaFechas },
            { where: { cuil: cuil }, transaction: t } // Aseguramos que se incluya la transacción
        );

        if (updatePersona[0] === 0 && updateUsuario[0] === 0) {
            const error = new Error("No se encontraron datos para actualizar");
            error.statusCode = 404;
            throw error;
        }

        // Confirmamos la transacción
        await t.commit();
        res.status(200).json({ message: "Usuario actualizado correctamente" });

    } catch (error) {
        // Revertimos la transacción en caso de error
        await t.rollback();
        next(error);
    }
}


export const deleteUsuario = async (req, res, next) => {
    try {
        const { cuil } = req.params;
        const deleteUsuario = await Usuario.destroy({ where: { cuil } });

        if (deleteUsuario === 0) {
            const error = new Error("No se encontraron datos para eliminar");
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({ message: "Usuario eliminado correctamente" });
    } catch (error) {
        next(error);
    }
}

export const getMyUser = async (req, res, next) => {
    try {
        const usuario = req.user.user
        res.status(200).json(usuario)
    } catch (error) {
        next(error)
    }
}

export const updateContrasenia = async (req, res, next) => {
    try {
        let { nuevaContrasenia } = req.body;
        console.log("loque busco:", req)
        const cuil = req.user.user?.cuil || req.user.dataValues?.cuil; // Tomamos el cuil del token o del body

        // Asegurar que la contraseña sea una cadena, si no es, convertirla a string
        nuevaContrasenia = String(nuevaContrasenia);
        const contraseniaHash = createHash(nuevaContrasenia);


        // Actualizar solo la contraseña del usuario
        const updateUsuario = await Usuario.update(
            { contrasenia: contraseniaHash, necesitaCbioContrasenia: 0 },
            { where: { cuil: cuil } }
        );

        if (updateUsuario[0] === 0) {
            const error = new Error("No se encontraron datos para actualizar");
            error.statusCode = 404;
            throw error;
        }


        res.status(200).json({ message: "Contraseña actualizada correctamente" });

    } catch (error) {
        next(error);
    }
};



const generarHtmlRecuperarContraseña = (urlPeticion) => {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperación de Contraseña</title>
    <style>
        /* Estilos básicos para asegurar legibilidad en diferentes clientes de email */
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        h2 {
            color: #333;
        }
        p {
            margin-bottom: 15px;
        }
        .button {
            display: inline-block;
            background-color: #007bff; /* Color azul Bootstrap de ejemplo */
            color: white !important; /* Importante para anular estilos por defecto */
            padding: 12px 25px;
            text-decoration: none;
            border-radius: 5px;
            font-size: 16px;
            margin-top: 10px;
        }
        .button:hover {
            background-color: #0056b3;
        }
        .footer {
            margin-top: 20px;
            border-top: 1px solid #eee;
            padding-top: 15px;
            font-size: 12px;
            color: #777;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Solicitud de Recuperación de Contraseña para InscribCordoba</h2>

        <p>Hola,</p>

        <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en InscribCordoba.</p>

        <p>Para completar el proceso de recuperación, haz clic en el siguiente enlace:</p>

        <p style="text-align: center;">
            <!-- **IMPORTANTE:** Reemplaza [TU_DOMINIO_FRONTEND] por la URL base de tu frontend (ej: https://inscripciones.tudominio.com) -->
            <!-- **IMPORTANTE:** Reemplaza REPLACE_WITH_TOKEN por el token de recuperación generado en tu backend -->
            <a href="${urlPeticion}" class="button">Restablecer mi contraseña</a>
        </p>

        <p>Si el botón no funciona, copia y pega el siguiente enlace en la barra de direcciones de tu navegador:</p>
        <p>
             <a href="${urlPeticion}">${urlPeticion}</a>
        </p>

        <p>Este enlace de recuperación expirará en [Tiempo de expiración, ej: 1 hora]. Por favor, úsalo antes de que expire.</p>

        <p>Si no solicitaste un restablecimiento de contraseña, por favor ignora este correo electrónico. Tu contraseña actual no se modificará.</p>

        <div class="footer">
            <p>Gracias,</p>
            <p>El equipo de InscribCordoba</p>
        </div>
    </div>
</body>
</html>`

}
export const recuperoContrasenia = async (req, res, next) => {
    try {
        const { cuil } = req.body;
        // Quiero recuperar la URL que hace la petición
        
        //const url = req.protocol + '://' + req.get('host') + req.originalUrl;
        const url = "http://localhost:3000"
        console.log("URL de la petición:", url)
        
        if (!validarCuil(cuil)) {
            const error = new Error("El CUIL no es válido");
            error.statusCode = 400;
            throw error;
        }

        const persona = await Persona.findOne({ where: { cuil: cuil } });
        if (!persona) {
            const error = new Error(`La persona con el cuil ${cuil} no existe.`);
            error.statusCode = 400;
            throw error;
        }
        console.log("Persona encontrada:", persona.mail)

        

        const token = generarToken({ cuil: cuil, mail: persona.mail }  );

        //armamamos la url de la peticion para el frontend
        const urlPeticion = url + "/cambiarContrasenia?token=" + token;

        await enviarCorreo(generarHtmlRecuperarContraseña(urlPeticion), "Recupero de contraseña", persona.mail);

        res.status(200).json({ message: "Correo de recuperación enviado" });
        

    } catch (error) {
        next(error);
    }
};
