import Restricciones from "../models/controlDataFechaInicioCursada.models.js";

export const getRestricciones = async (req, res, next) => {
    try {

        const restriccion = await Restricciones.findOne({ where: { id: 1 } });

        res.status(200).json(restriccion);
        
    } catch (error) {
        next(error);
    }
}


export const putRestriccion = async (req, res, next) => {
    try {
        const { maximoCursosXMes, maximoCuposXMes, maximoCuposXDia, maximoCursosXDia, mesBloqueado, maximoAcumulado } = req.body;

        if(!maximoCursosXMes || !maximoCuposXMes || !maximoCuposXDia || !maximoCursosXDia || !maximoAcumulado) {
            const error = new Error("Todos los campos son obligatorios");
            error.statusCode = 404;
            throw error;
        }

        if(maximoCursosXMes < 0 || maximoCuposXMes < 0 || maximoCuposXDia < 0 || maximoCursosXDia < 0 || maximoAcumulado < 0) {
            const error = new Error("Los valores no pueden ser negativos");
            error.statusCode = 404;
            throw error;
        }

        if(mesBloqueado < 0 || mesBloqueado > 12) {
            const error = new Error("El mes no puede ser negativo ni mayor a 12");
            error.statusCode = 404;
            throw error;
        }

        const esActualizado = await Restricciones.update({ maximoCursosXMes, maximoCuposXMes, maximoCuposXDia, maximoCursosXDia, mesBloqueado, maximoAcumulado }, { where: { id: 1 } });
        if(esActualizado[0] === 0) {
            const error = new Error("No se registraron datos para actualizar");
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({ message: "Restricciones actualizadas" });
    } catch (error) {
        next(error);
    }
}