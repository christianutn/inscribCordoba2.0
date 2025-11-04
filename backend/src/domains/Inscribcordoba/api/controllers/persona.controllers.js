import Persona from "../models/persona.models.js";
import validarCuil from "../../../../utils/validarCuil.js"
import validarEmail from "../../../../utils/validarMail.js";
import tratarNombres from "../../../../utils/tratarNombres.js";

export const getPersonas = async (req, res, next) => {
    try {
        const personas = await Persona.findAll();

        if (personas.length === 0) {

            const error = new Error("No existen personas");
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json(personas)
    } catch (error) {
        next(error)
    }
}

export const postPersona = async (req, res, next) => {
    try {

        
        let { cuil, nombre, apellido, mail, celular } = req.body

        cuil = cuil.trim()
        nombre = nombre.trim()
        apellido = apellido.trim()
        mail = mail.trim()
        
        if (celular === undefined || celular === "" || celular == "Sin celular") {
            celular = null
        }else{
            celular = celular.trim()
        }
            


        if (cuil.length !== 11 || nombre.length === 0 || apellido.length === 0 || mail.length === 0) {

            const error = new Error("Datos inválidos: no cumplen con los requsitos");
            error.statusCode = 400;
            throw error
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

        nombre = tratarNombres(nombre)
        apellido = tratarNombres(apellido)

        const personaExistente = await Persona.findOne({ where: { cuil } })
        if (personaExistente) {
            const error = new Error("La persona ya existe");
            error.statusCode = 400;
            throw error
        }


        const persona = await Persona.create({ cuil, nombre, apellido, mail, celular });

        if (!persona) {
            const error = new Error("No se pudo crear la persona");
            error.statusCode = 500;
            throw error
        }
        res.status(201).json(persona)
    } catch (error) {
      
        next(error)
    }
}


export const putPersona = async (req, res, next) => {
    try {

   
        let { cuil, nombre, apellido, mail, celular, newCuil } = req.body

        // Limpieza de datos
        cuil = cuil.trim();
        newCuil = newCuil ? newCuil.trim() : null;
        nombre = nombre.trim()
        apellido = apellido.trim()
        mail = mail.trim()


        if (celular == "Sin celular" || celular == "") {
            celular = null
        }

        if (cuil.length !== 11 || nombre.length === 0 || apellido.length === 0 || mail.length === 0) {

            const error = new Error("Datos inválidos: no cumplen con los requsitos");
            error.statusCode = 400;
            throw error
        }

        if (!validarCuil(cuil)) {
            const error = new Error("El CUIL no es valido");
            error.statusCode = 400;
            throw error;
        }

        if (!validarEmail(mail)) {
            const error = new Error("El mail no es valido");
            error.statusCode = 400;
            throw error;
        }

        if (celular == "Sin celular") {
            celular = null
        }

        nombre = tratarNombres(nombre)
        apellido = tratarNombres(apellido)

        const result = await Persona.update(
            { nombre, apellido, mail, celular, cuil: newCuil || cuil },
            {
                where: {
                    cuil: cuil,
                },
            },
        );

        if (result[0] === 0) {
            const error = new Error("No se encontro la persona");
            error.statusCode = 400;
            throw error;
        }
        res.status(200).json({ message: `Los datos de ${nombre} ${apellido} han sido actualizados con exito` })
    } catch (error) {
   
        next(error)
    }
}


export const deletePersona = async (req, res, next) => {
    try {
        const {cuil} = req.params;
       
        if(cuil.length !== 11) {
            const error = new Error("El CUIL no es válido");
            error.statusCode = 400;
            throw error;
        }

        const persona = await Persona.destroy({where: {cuil: cuil}});

        if (persona === 0) {
            const error = new Error("No se encontro la persona");
            error.statusCode = 400;
            throw error;
        }
        res.status(200).json({message: "Persona eliminada con éxito"})
    } catch (error) {
        next(error)
    }
}