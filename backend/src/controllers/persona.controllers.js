import Persona from "../models/persona.models.js";
import validarCuil from "../utils/validarCuil.js"
import validarEmail from "../utils/validarMail.js";
import tratarNombres from "../utils/tratarNombres.js";

export const getPersonas = async (req, res, next) => {
    try {
        const personas = await personaModel.findAll();

        if(personas.length === 0){
            
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
        let {cuil, nombre, apellido, mail, celular} = req.body

        cuil = cuil.trim()
        nombre = nombre.trim()
        apellido = apellido.trim()
        mail = mail.trim()
        celular = celular.trim()

        if(cuil.length !== 11 || nombre.length === 0 || apellido.length === 0 || mail.length === 0 || celular.length === 0 ){

            const error = new Error("Datos inválidos: no cumplen con los requsitos");
            error.statusCode = 400;
            throw error
        }

        if(!validarCuil(cuil)){
            const error = new Error("El CUIL no es valido");
            error.statusCode = 400;
            throw error;
        }

        if(!validarEmail(mail)){
            const error = new Error("El mail no es valido");
            error.statusCode = 400;
            throw error;
        }

        nombre = tratarNombres(nombre)
        apellido = tratarNombres(apellido)

        const personaExistente = await Persona.findOne({where: {cuil}})
        if(personaExistente){
            const error = new Error("La persona ya existe");
            error.statusCode = 400;
            throw error
        }
        
        
        const persona = await Persona.create({cuil, nombre, apellido, mail, celular});
        res.status(201).json(persona)
    } catch (error) {
        console.log(error)
        next(error)
    }
}