import DiccionarioChatbot from "../models/diccionarioChatbot.models.js";
import DiccionarioChatBotNR from "../models/diccionarioChatBotNR.models.js";
import { Op } from "sequelize";


export const getDiccionarioChatbot = async (req, res) => {
    try {
        const { idCategoria, pregunta } = req.query; // Cambiar de req.params a req.query

        const whereClause = {};

        if (pregunta) {
            whereClause.pregunta = {
                [Op.like]: `%${pregunta}%`
            };
        }

        if (idCategoria) {
            whereClause.idCategoria = idCategoria;
        }

        const diccionario = await DiccionarioChatbot.findAll({ where: whereClause });

        res.json(diccionario);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el diccionario de chatbot', details: error.message });
    }
};

export const getDiccionarioChatbotPuntual = async (req, res) => {
    try {
        const { id } = req.query; // Cambiar de req.params a req.query
        console.log("Id pregunta: ", id);
        const whereClause = {};

        if (id) {
            whereClause.id = id;
        }

        const diccionario = await DiccionarioChatbot.findAll({ where: whereClause });

        res.json(diccionario);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el diccionario de chatbot', details: error.message });
    }
};

export const insertDiccionarioChatbot = async (req, res, next) => {
    try {
        const { pregunta, respuesta, imagen, idCategoria } = req.body;

        // console.log(nombre);
        const existe = await DiccionarioChatbot.findOne({ where: { idCategoria: idCategoria, pregunta: pregunta } });
        console.log(existe);
        if (existe) throw new Error("La pregunta ya existe para la categoría seleccionada");
        const response = await DiccionarioChatbot.create({ pregunta: pregunta, respuesta: respuesta, imagen: imagen, idCategoria: idCategoria });
        res.status(201).json(response)
    } catch (error) {
        next(error)
    }
};
