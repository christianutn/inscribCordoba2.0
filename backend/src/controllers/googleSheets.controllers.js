import { getCronograma } from "../googleSheets/services/getCronograma.js";

import AsignacionesAreasUsuario from "../models/areasAsignadasUsuario.models.js";

import { getObjFechas } from "../googleSheets/services/getObjFechas.js";

import Area from "../models/area.models.js";

import { getNroEventos } from "../googleSheets/services/getNroEventos.js";

export const getDatosCronograma = async (req, res, next) => {
    try {
        const { rol, area: codigoArea, cuil } = req.user.user;
        
        // 1. Optimización de consulta de áreas
        const [existenAreas, areasAsignadas] = await Promise.all([
            Area.findAll(),
            AsignacionesAreasUsuario.findAll({
                where: { usuario: cuil },
                include: [{  // Eliminada inclusión innecesaria de Usuario
                    model: Area,
                    as: 'detalle_area',
                    attributes: ['nombre']
                }]
            })
        ]);

        if (!existenAreas.length) {
            throw new Error("No existen áreas").modifyError(404);
        }

        // 2. Optimización de lógica condicional
        let parametroFiltro;
        if (rol === "ADM") {
            parametroFiltro = "todos";
        } else {
            const nombresAreas = areasAsignadas.map(a => a.detalle_area.nombre);
            
            // 3. Eliminada consulta adicional usando datos existentes
            const areaPrincipal = existenAreas.find(a => a.cod === codigoArea);
            if (!areaPrincipal) {
                throw new Error("No se pudo encontrar el área principal").modifyError(404);
            }
            
            // 4. Operación de conjunto más eficiente
            const areasUnicas = new Set([...nombresAreas, areaPrincipal.nombre]);
            parametroFiltro = [...areasUnicas];
        }

        // 5. Unificación de llamada a getCronograma
        const dataCronograma = await getCronograma(parametroFiltro);
        
        res.status(200).json(dataCronograma);
    } catch (error) {
        next(error);
    }
};

// Extensión para manejar códigos de error más limpio
Error.prototype.modifyError = function(statusCode) {
    this.statusCode = statusCode;
    return this;
};

export const getFechasParaValidar = async (req, res, next) => {
    try {
        const aplicaRestricciones = req.user.user.esExcepcionParaFechas == 0;
        const matrizFecha = await getObjFechas(aplicaRestricciones);

        res.status(200).json(matrizFecha)

    } catch (error) {
        next(error)
    }
}


export const getObjNroEventos = async (req, res, next) => {
    try {
        const eventos = await getNroEventos();
        res.status(200).json(eventos)
    } catch (error) {
        next(error)
    }
}



