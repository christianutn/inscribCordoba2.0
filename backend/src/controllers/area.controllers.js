
import areaModel from "../models/area.models.js"
import ministerio from "../models/ministerio.models.js";

export const getAreas = async (req, res, next) => {
    try {
        const areas = await areaModel.findAll({
            include: [
                {
                    model: ministerio, as: 'detalle_ministerio'
                }
            ]
        });
        
        if(areas.length === 0){
            
            const error = new Error("No existen areas");
            error.statusCode = 404;
            throw error;
        } 

        res.status(200).json(areas)

    } catch (error) {   
       
        next(error)
    }
}