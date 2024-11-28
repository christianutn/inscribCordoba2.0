import DiccionarioChatbotnr from "../models/diccionarioChatbotnr.models.js";
import { Op } from "sequelize";

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




