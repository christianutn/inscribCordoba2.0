import Perfil from '../models/perfil.models.js';

export const getPerfiles = async (req, res, next) => {
    try {
        const perfiles = await Perfil.findAll({
            order: [
                ['cod', 'ASC']
            ]
        });
        res.status(200).json(perfiles);
    } catch (error) {
        next(error);
    }
}

export const getPerfilByCod = async (req, res, next) => {
    try {
        const { cod } = req.params;
        const perfil = await Perfil.findOne({ where: { cod: cod } });
        res.status(200).json(perfil);
    } catch (error) {
        next(error);
    }
}

