import DiccionarioChatbotnr from "../models/diccionarioChatbotnr.models.js";
import sequelize from "../config/database.js";
export const getDiccionarioChatbotnr = async (req, res) => {
    try {
        const diccionario = await DiccionarioChatbotnr.findAll();
        if (diccionario.length === 0) {
            return res.status(404).json({ error: "No se encontraron registros" });
        }
        res.status(200).json(diccionario);
    } catch (error) {
        console.log("Desde controller: ", error);
        res.status(500).json({ error: 'Error al obtener el preguntas no registradas del chatbot', details: error.message });
    }
};


export const insertDiccionarioChatbotnr = async (req, res, next) => {
    try {
        const { pregunta } = req.body;

        // console.log(nombre);
        const existe = await DiccionarioChatbotnr.findOne({ where: { pregunta: pregunta } });
        console.log(existe);
        if (existe) {
            const response = await DiccionarioChatbotnr.update(
                { incidencia: sequelize.literal('incidencia + 1') }, // Incrementa el campo 'incidencia'
                { where: { pregunta: pregunta } }
            );
            return res.status(201).json(response)
        }
        else {
            const response = await DiccionarioChatbotnr.create({ pregunta: pregunta, incidencia: 1, pocesada: 0 });
            return res.status(201).json(response)
        }
    } catch (error) {
        next(error)
    }
};

