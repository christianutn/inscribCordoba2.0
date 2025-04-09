import TiposCertificacion from "../models/tipoCertificacion.models.js";

export const getTiposCertificacion = async (req, res, next) => {
    try {
        const tiposCertificacion = await TiposCertificacion.findAll({
            order: [
                ['cod', 'ASC']
            ]
        });
        res.status(200).json(tiposCertificacion);
    } catch (error) {
        next(error);
    }
}

export const getTipoCertificacionByCod = async (req, res, next) => {
    try {
        const { cod } = req.params;
        const tipoCertificacion = await TiposCertificacion.findOne({ where: { cod: cod } });
        res.status(200).json(tipoCertificacion);
    } catch (error) {
        next(error);
    }
}

