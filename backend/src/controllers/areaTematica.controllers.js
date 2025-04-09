import AreaTematica from '../models/areaTematica.models.js';

export const getAreasTematicas = async (req, res, next) => {
    try {
        const areasTematicas = await AreaTematica.findAll({
            order: [
                ['cod', 'ASC']
            ]
        });
        res.status(200).json(areasTematicas);
    } catch (error) {
        next(error);
    }
}


export const getAreaTematicaByCod = async (req, res, next) => {
    try {
        const { cod } = req.params;
        const areaTematica = await AreaTematica.findOne({ where: { cod: cod } });
        res.status(200).json(areaTematica);
    } catch (error) {
        next(error);
    }
}