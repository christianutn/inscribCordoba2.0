import tipoCapacitacionModel from "../models/tipoCapacitacion.models.js";


export const getTiposCapacitacion = async (req, res, next) => {
    try {
        const tiposCapacitacion = await tipoCapacitacionModel.findAll();

        if(tiposCapacitacion.length === 0){
            
            const error = new Error("No existen tipos de capacitacion");
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json(tiposCapacitacion)
    } catch (error) {
        next(error)
    }
}


export const putTiposCapacitacion = async (req, res, next) => {
    console.log("req.body:", req.body)
    try {
        
        let {cod, nombre, newCod} =  req.body

        if (!cod) {

            const error = new Error("El código no es valido");
            error.statusCode = 400;
            throw error;
        }

        if (!nombre) {

            const error = new Error("El nombre no es válido");
            error.statusCode = 400;
            throw error;
        }

        

        nombre = nombre.trim()
        cod = cod.trim()
        newCod = newCod ? newCod.trim() : null
        
        const tipo_capacitacion = await tipoCapacitacionModel.update({cod: newCod || cod, nombre: nombre}, {
            where: {
                cod: cod
            }
        });

        if(tipo_capacitacion[0] === 0){
            const error = new Error("No se pudo actualizar el tipo de capacitación");
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json(tipo_capacitacion);
    } catch (error) {
        
        next(error);
    }
}


export const postTiposCapacitacion = async (req, res, next) => {
    
    try {
        let {cod, nombre} = req.body;
        if (!cod) {
            const error = new Error("El código no es valido");
            error.statusCode = 400;
            throw error;
        }

        if (cod.length > 15) {
            const error = new Error("El código no puede ser mayor a 15 caracteres");
            error.statusCode = 400;
            throw error;
        }

        if (!nombre) {
            const error = new Error("El nombre no es valido");
            error.statusCode = 400;
            throw error;
        }
        nombre = nombre.trim()
        cod = cod.trim()    
        console.log(req.body)
        const tipo_capacitacion = await tipoCapacitacionModel.create({cod: cod, nombre: nombre});
        res.status(201).json(tipo_capacitacion);
    } catch (error) {
        next(error);
    }
}


export const deleteTiposCapacitacion = async (req, res, next) => {
    try {
        const {cod} = req.params;

        const tipo_capacitacion = await tipoCapacitacionModel.destroy({
            where: {
                cod: cod
            }
        });

        if(tipo_capacitacion === 0){
            const error = new Error("No se pudo borrar el tipo de capacitación");
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json(tipo_capacitacion);
    } catch (error) {
        next(error);
    }
}